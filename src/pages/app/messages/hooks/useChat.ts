import { useAuthStore } from "@/features/auth/authStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChatMessage,
  Conversation,
  createMessage,
  getMessages,
} from "../api";

const WS_BASE_URL = "wss://api.padlupp.com";
const MAX_RETRIES = 8;
const MAX_BACKOFF_MS = 20_000;
const SEND_TIMEOUT_MS = 7_000;

export type ConnectionState = "idle" | "connecting" | "open" | "closed";

export interface ChatMessageUI extends Omit<ChatMessage, "id"> {
  id: number | string;
  optimistic?: boolean;
}

interface UseChatState {
  conversations: Conversation[];
  messages: ChatMessageUI[];
  activeConversationId: number | null;
  setActiveConversationId: (id: number) => void;
  sendMessage: (text: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  markAllRead: () => void;
  loadingHistory: boolean;
  sending: boolean;
  connectionState: ConnectionState;
  conversationsConnectionState: ConnectionState;
  isPeerTyping: boolean;
  onlineUserIds: number[];
}

const sortByCreatedAt = <T extends { created_at: string }>(items: T[]) =>
  [...items].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

const isChatMessage = (payload: unknown): payload is ChatMessage => {
  if (!payload || typeof payload !== "object") return false;
  const value = payload as Record<string, unknown>;
  return (
    typeof value.id === "number" &&
    typeof value.conversation === "number" &&
    typeof value.text === "string" &&
    typeof value.created_at === "string"
  );
};

const safeParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const dedupeMessages = (messages: ChatMessageUI[]) => {
  const seen = new Set<string>();
  return messages.filter((item) => {
    const key = `${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const useChat = (): UseChatState => {
  const token = useAuthStore((state) => state.token);
  const authUserId = useAuthStore((state) => state.user?.id ?? null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<number, ChatMessageUI[]>
  >({});
  const [activeConversationId, setActiveConversationIdState] = useState<
    number | null
  >(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [conversationsConnectionState, setConversationsConnectionState] =
    useState<ConnectionState>("idle");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);

  const conversationsWsRef = useRef<WebSocket | null>(null);
  const chatWsRef = useRef<WebSocket | null>(null);
  const conversationsRetryRef = useRef(0);
  const chatRetryRef = useRef(0);
  const pendingSendQueueRef = useRef<string[]>([]);
  const sendFallbackTimersRef = useRef<Record<string, number>>({});

  const activeConversationIdRef = useRef<number | null>(null);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const upsertConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => {
      const exists = prev.some((item) => item.id === conversation.id);
      if (!exists) {
        return sortByCreatedAt([conversation, ...prev]).reverse();
      }
      return prev
        .map((item) =>
          item.id === conversation.id ? { ...item, ...conversation } : item,
        )
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );
    });
  }, []);

  const clearFallbackTimer = useCallback((tempId: string) => {
    const timer = sendFallbackTimersRef.current[tempId];
    if (timer) {
      window.clearTimeout(timer);
      delete sendFallbackTimersRef.current[tempId];
    }
  }, []);

  const replaceTempMessage = useCallback(
    (conversationId: number, tempId: string, message: ChatMessage) => {
      setMessagesByConversation((prev) => {
        const current = prev[conversationId] ?? [];
        const replaced = current.map((item) =>
          item.id === tempId ? { ...message, optimistic: false } : item,
        );
        return {
          ...prev,
          [conversationId]: dedupeMessages(replaced),
        };
      });
      clearFallbackTimer(tempId);
    },
    [clearFallbackTimer],
  );

  const removeTempMessage = useCallback(
    (conversationId: number, tempId: string) => {
      setMessagesByConversation((prev) => {
        const current = prev[conversationId] ?? [];
        return {
          ...prev,
          [conversationId]: current.filter((item) => item.id !== tempId),
        };
      });
      clearFallbackTimer(tempId);
    },
    [clearFallbackTimer],
  );

  const appendMessage = useCallback(
    (message: ChatMessage) => {
      const conversationId = message.conversation;

      setMessagesByConversation((prev) => {
        const current = prev[conversationId] ?? [];

        const hasReal = current.some((item) => item.id === message.id);
        if (hasReal) return prev;

        let matchedTempId: string | null = null;
        const withPossibleReplacement = current.map((item) => {
          const isPotentialMatch =
            typeof item.id === "string" &&
            item.optimistic &&
            item.sender.id === message.sender.id &&
            item.text === message.text;

          if (!isPotentialMatch || matchedTempId) {
            return item;
          }

          matchedTempId = String(item.id);
          return { ...message, optimistic: false };
        });

        if (matchedTempId) {
          clearFallbackTimer(matchedTempId);
          return {
            ...prev,
            [conversationId]: dedupeMessages(withPossibleReplacement),
          };
        }

        return {
          ...prev,
          [conversationId]: dedupeMessages([
            ...withPossibleReplacement,
            { ...message, optimistic: false },
          ]),
        };
      });

      const existingConversation = conversations.find(
        (conversation) => conversation.id === conversationId,
      );

      upsertConversation({
        id: conversationId,
        partnership: existingConversation?.partnership ?? 0,
        partner_name: existingConversation?.partner_name ?? null,
        partner_avatar: existingConversation?.partner_avatar ?? null,
        last_message: message,
        unread_count: existingConversation?.unread_count ?? 0,
        created_at: existingConversation?.created_at ?? message.created_at,
        updated_at: message.updated_at,
      });
    },
    [clearFallbackTimer, conversations, upsertConversation],
  );

  const fetchHistory = useCallback(async (conversationId: number) => {
    setLoadingHistory(true);
    try {
      const response = await getMessages({
        conversation: conversationId,
        ordering: "created_at",
      });

      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: dedupeMessages(sortByCreatedAt(response.results)),
      }));
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const flushQueue = useCallback(() => {
    const ws = chatWsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    while (pendingSendQueueRef.current.length > 0) {
      const payload = pendingSendQueueRef.current.shift();
      if (!payload) break;
      ws.send(payload);
    }
  }, []);

  const connectConversationsSocket = useCallback(() => {
    if (!token) return;

    conversationsWsRef.current?.close();
    setConversationsConnectionState("connecting");

    const ws = new WebSocket(
      `${WS_BASE_URL}/ws/conversations/?token=${encodeURIComponent(token)}`,
    );
    conversationsWsRef.current = ws;

    ws.onopen = () => {
      conversationsRetryRef.current = 0;
      setConversationsConnectionState("open");
    };

    ws.onmessage = (event) => {
      const payload = safeParse(event.data);
      if (!payload || typeof payload !== "object") return;

      const data = payload as Record<string, unknown>;
      if (data.type === "conversations" && Array.isArray(data.conversations)) {
        const next = data.conversations.filter(
          (item): item is Conversation => !!item && typeof item === "object",
        );
        setConversations(
          next.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          ),
        );
        if (!activeConversationIdRef.current && next.length > 0) {
          setActiveConversationIdState(next[0].id);
        }
        return;
      }

      if (data.type === "conversation_update" && data.conversation) {
        upsertConversation(data.conversation as Conversation);
      }
    };

    ws.onclose = () => {
      setConversationsConnectionState("closed");
      if (!token) return;

      if (conversationsRetryRef.current >= MAX_RETRIES) return;
      const retry = ++conversationsRetryRef.current;
      const delay = Math.min(1000 * 2 ** retry, MAX_BACKOFF_MS);
      window.setTimeout(connectConversationsSocket, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [token, upsertConversation]);

  const connectChatSocket = useCallback(
    (conversationId: number) => {
      if (!token) return;

      chatWsRef.current?.close();
      setConnectionState("connecting");

      const ws = new WebSocket(
        `${WS_BASE_URL}/ws/chat/${conversationId}/?token=${encodeURIComponent(token)}`,
      );
      chatWsRef.current = ws;

      ws.onopen = () => {
        chatRetryRef.current = 0;
        setConnectionState("open");
        flushQueue();
      };

      ws.onmessage = (event) => {
        const payload = safeParse(event.data);
        if (!payload || typeof payload !== "object") return;

        const data = payload as Record<string, unknown>;

        if (data.type === "history" && Array.isArray(data.messages)) {
          const history = data.messages.filter(isChatMessage);
          setMessagesByConversation((prev) => ({
            ...prev,
            [conversationId]: dedupeMessages(sortByCreatedAt(history)),
          }));
          return;
        }

        if (data.type === "typing") {
          const userId = typeof data.user_id === "number" ? data.user_id : null;
          const isTyping = Boolean(data.is_typing);
          if (userId && userId !== authUserId) {
            setIsPeerTyping(isTyping);
          }
          return;
        }

        if (data.type === "presence" && Array.isArray(data.online_user_ids)) {
          setOnlineUserIds(
            data.online_user_ids.filter((id): id is number => typeof id === "number"),
          );
          return;
        }

        if (data.type === "ack" || data.type === "delivered" || data.type === "read" || data.type === "read_all") {
          return;
        }

        if (isChatMessage(data)) {
          appendMessage(data);

          if (data.sender.id !== authUserId && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "delivered", message_id: data.id }));
          }
          return;
        }
      };

      ws.onclose = () => {
        setConnectionState("closed");

        if (!token || activeConversationIdRef.current !== conversationId) {
          return;
        }

        if (chatRetryRef.current >= MAX_RETRIES) return;
        const retry = ++chatRetryRef.current;
        const delay = Math.min(1000 * 2 ** retry, MAX_BACKOFF_MS);
        window.setTimeout(() => connectChatSocket(conversationId), delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    },
    [appendMessage, authUserId, flushQueue, token],
  );

  useEffect(() => {
    if (!token) return;
    connectConversationsSocket();

    return () => {
      conversationsWsRef.current?.close();
    };
  }, [connectConversationsSocket, token]);

  useEffect(() => {
    if (!token || !activeConversationId) return;

    setIsPeerTyping(false);
    connectChatSocket(activeConversationId);
    fetchHistory(activeConversationId);

    return () => {
      chatWsRef.current?.close();
    };
  }, [activeConversationId, connectChatSocket, fetchHistory, token]);

  useEffect(
    () => () => {
      Object.values(sendFallbackTimersRef.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      sendFallbackTimersRef.current = {};
    },
    [],
  );

  const setActiveConversationId = useCallback((id: number) => {
    setActiveConversationIdState(id);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId) return;

      const normalized = text.trim();
      if (!normalized) return;

      const userId = authUserId ?? 0;
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const nowISO = new Date().toISOString();

      const optimistic: ChatMessageUI = {
        id: tempId,
        conversation: activeConversationId,
        sender: {
          id: userId,
          email: "",
          phone: "",
          name: "Me",
          avatar: "",
          phone_verified: false,
          email_verified: false,
          preferred_notification_email: "",
          preferred_notification_phone: "",
        },
        text: normalized,
        is_read: false,
        created_at: nowISO,
        updated_at: nowISO,
        optimistic: true,
      };

      setMessagesByConversation((prev) => ({
        ...prev,
        [activeConversationId]: dedupeMessages([
          ...(prev[activeConversationId] ?? []),
          optimistic,
        ]),
      }));

      setSending(true);
      const ws = chatWsRef.current;
      const socketOpen = ws?.readyState === WebSocket.OPEN;

      if (socketOpen) {
        ws?.send(JSON.stringify({ type: "message", text: normalized }));

        sendFallbackTimersRef.current[tempId] = window.setTimeout(async () => {
          try {
            const created = await createMessage({
              conversation: activeConversationId,
              text: normalized,
            });
            replaceTempMessage(activeConversationId, tempId, created);
          } catch {
            removeTempMessage(activeConversationId, tempId);
          }
        }, SEND_TIMEOUT_MS);

        setSending(false);
        return;
      }

      try {
        const created = await createMessage({
          conversation: activeConversationId,
          text: normalized,
        });
        replaceTempMessage(activeConversationId, tempId, created);
      } catch {
        removeTempMessage(activeConversationId, tempId);
      } finally {
        setSending(false);
      }
    },
    [activeConversationId, authUserId, removeTempMessage, replaceTempMessage],
  );

  const sendEvent = useCallback((payload: object) => {
    const serialized = JSON.stringify(payload);
    const ws = chatWsRef.current;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(serialized);
      return;
    }

    pendingSendQueueRef.current.push(serialized);
  }, []);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      sendEvent({ type: "typing", is_typing: isTyping });
    },
    [sendEvent],
  );

  const markAllRead = useCallback(() => {
    sendEvent({ type: "read_all" });
  }, [sendEvent]);

  const messages = useMemo(() => {
    if (!activeConversationId) return [];
    return messagesByConversation[activeConversationId] ?? [];
  }, [activeConversationId, messagesByConversation]);

  return {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    setTyping,
    markAllRead,
    loadingHistory,
    sending,
    connectionState,
    conversationsConnectionState,
    isPeerTyping,
    onlineUserIds,
  };
};
