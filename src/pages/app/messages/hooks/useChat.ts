import { useAuthStore } from "@/features/auth/authStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChatMessage,
  Conversation,
  createMessage,
  getMessages,
  renameGroupConversation,
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
  hasReceivedConversationsSnapshot: boolean;
  messages: ChatMessageUI[];
  activeConversationId: number | null;
  setActiveConversationId: (id: number | null) => void;
  sendMessage: (text: string, replyToMessageId?: number | null) => Promise<void>;
  sendFile: (file: File, caption?: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  markAllRead: () => void;
  renameGroup: (conversationId: number, name: string) => Promise<void>;
  loadingHistory: boolean;
  sending: boolean;
  connectionState: ConnectionState;
  conversationsConnectionState: ConnectionState;
  isPeerTyping: boolean;
  peerTypingName: string | null;
  onlineUserIds: number[];
  lastSeenAtByUserId: Record<number, string>;
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
    (typeof value.text === "string" || value.text === null) &&
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

const normalizeOptionalText = (value: string | null | undefined) =>
  (value ?? "").trim();

const sortConversations = (items: Conversation[]) =>
  [...items].sort((a, b) => {
    const getActivityTimestamp = (item: Conversation) =>
      new Date(
        item.last_message?.updated_at ||
          item.last_message?.created_at ||
          item.updated_at ||
          item.created_at,
      ).getTime();

    const byActivity = getActivityTimestamp(b) - getActivityTimestamp(a);
    if (byActivity !== 0) return byActivity;
    return b.id - a.id;
  });

const hasConversationListChanged = (
  prev: Conversation[],
  next: Conversation[],
) => {
  if (prev.length !== next.length) return true;

  for (let i = 0; i < prev.length; i += 1) {
    const prevItem = prev[i];
    const nextItem = next[i];
    if (
      prevItem.id !== nextItem.id ||
      prevItem.updated_at !== nextItem.updated_at ||
      prevItem.unread_count !== nextItem.unread_count ||
      (prevItem.last_message?.id ?? null) !== (nextItem.last_message?.id ?? null)
    ) {
      return true;
    }
  }

  return false;
};

export const useChat = (): UseChatState => {
  const token = useAuthStore((state) => state.token);
  const authUserId = useAuthStore((state) => state.user?.id ?? null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hasReceivedConversationsSnapshot, setHasReceivedConversationsSnapshot] =
    useState(false);
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
  const [peerTypingName, setPeerTypingName] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
  const [lastSeenAtByUserId, setLastSeenAtByUserId] = useState<
    Record<number, string>
  >({});

  const conversationsWsRef = useRef<WebSocket | null>(null);
  const chatWsRef = useRef<WebSocket | null>(null);
  const conversationsRetryRef = useRef(0);
  const chatRetryRef = useRef(0);
  const pendingSendQueueRef = useRef<string[]>([]);
  const sendFallbackTimersRef = useRef<Record<string, number>>({});

  const activeConversationIdRef = useRef<number | null>(null);
  const conversationsRef = useRef<Conversation[]>([]);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const createOptimisticSender = useCallback(
    (userId: number) => ({
      id: userId,
      email: "",
      phone: "",
      name: "Me",
      avatar: "",
      phone_verified: false,
      email_verified: false,
      preferred_notification_email: "",
      preferred_notification_phone: "",
    }),
    [],
  );

  const upsertConversation = useCallback((conversation: Conversation) => {
    const normalizedConversation =
      activeConversationIdRef.current === conversation.id
        ? { ...conversation, unread_count: 0 }
        : conversation;

    setConversations((prev) => {
      const exists = prev.some((item) => item.id === normalizedConversation.id);
      if (!exists) {
        return sortConversations([normalizedConversation, ...prev]);
      }
      return sortConversations(
        prev.map((item) =>
          item.id === normalizedConversation.id
            ? { ...item, ...normalizedConversation }
            : item,
        ),
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
        const tempMessage = current.find((item) => item.id === tempId);
        if (typeof tempMessage?.attachment === "string" && tempMessage.attachment.startsWith("blob:")) {
          URL.revokeObjectURL(tempMessage.attachment);
        }
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
        const tempMessage = current.find((item) => item.id === tempId);
        if (typeof tempMessage?.attachment === "string" && tempMessage.attachment.startsWith("blob:")) {
          URL.revokeObjectURL(tempMessage.attachment);
        }
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

        const existingRealMessage = current.find((item) => item.id === message.id);
        if (existingRealMessage) {
          const nextMessage = { ...existingRealMessage, ...message, optimistic: false };
          const didChange =
            existingRealMessage.updated_at !== nextMessage.updated_at ||
            existingRealMessage.is_read !== nextMessage.is_read ||
            existingRealMessage.text !== nextMessage.text ||
            existingRealMessage.attachment !== nextMessage.attachment ||
            existingRealMessage.attachment_name !== nextMessage.attachment_name ||
            existingRealMessage.attachment_mime !== nextMessage.attachment_mime;

          if (!didChange) return prev;

          return {
            ...prev,
            [conversationId]: dedupeMessages(
              current.map((item) => (item.id === message.id ? nextMessage : item)),
            ),
          };
        }

        let matchedTempId: string | null = null;
        const withPossibleReplacement = current.map((item) => {
          const senderMatches =
            item.sender.id === message.sender.id || item.sender.id === 0;
          const textMatches =
            normalizeOptionalText(item.text) ===
            normalizeOptionalText(message.text);
          const attachmentMatches =
            !item.attachment_name ||
            !message.attachment_name ||
            item.attachment_name === message.attachment_name;

          const isPotentialMatch =
            typeof item.id === "string" &&
            item.optimistic &&
            senderMatches &&
            textMatches &&
            attachmentMatches;

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

      const existingConversation = conversationsRef.current.find(
        (conversation) => conversation.id === conversationId,
      );

      upsertConversation({
        id: conversationId,
        partnership: existingConversation?.partnership ?? 0,
        partner_name: existingConversation?.partner_name ?? null,
        partner_avatar: existingConversation?.partner_avatar ?? null,
        is_group: existingConversation?.is_group ?? false,
        last_message: message,
        unread_count:
          activeConversationIdRef.current === conversationId
            ? 0
            : (existingConversation?.unread_count ?? 0),
        created_at: existingConversation?.created_at ?? message.created_at,
        updated_at: message.updated_at,
      });
    },
    [clearFallbackTimer, upsertConversation],
  );

  const markMessagesAsRead = useCallback(
    (conversationId: number, shouldMark: (message: ChatMessageUI) => boolean) => {
      setMessagesByConversation((prev) => {
        const current = prev[conversationId] ?? [];
        let changed = false;
        const next = current.map((message) => {
          if (message.is_read) return message;
          if (!shouldMark(message)) return message;
          changed = true;
          return { ...message, is_read: true, optimistic: false };
        });

        if (!changed) return prev;
        return { ...prev, [conversationId]: next };
      });
    },
    [],
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
        setHasReceivedConversationsSnapshot(true);
        const next = sortConversations(
          data.conversations.filter(
            (item): item is Conversation => !!item && typeof item === "object",
          ),
        ).map((conversation) =>
          activeConversationIdRef.current === conversation.id
            ? { ...conversation, unread_count: 0 }
            : conversation,
        );
        setConversations((prev) =>
          hasConversationListChanged(prev, next) ? next : prev,
        );
        return;
      }

      if (data.type === "conversation_update" && data.conversation) {
        const nextConversationRaw = data.conversation as Conversation;
        const nextConversation =
          activeConversationIdRef.current === nextConversationRaw.id
            ? { ...nextConversationRaw, unread_count: 0 }
            : nextConversationRaw;
        upsertConversation(nextConversation);

        if (
          activeConversationIdRef.current === nextConversation.id &&
          nextConversation.last_message
        ) {
          appendMessage(nextConversation.last_message);
        }
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
  }, [appendMessage, token, upsertConversation]);

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
          const userName =
            typeof data.user_name === "string" ? data.user_name.trim() : "";
          if (userId && userId !== authUserId) {
            setIsPeerTyping(isTyping);
            setPeerTypingName(isTyping ? userName || "Someone" : null);
          }
          return;
        }

        if (data.type === "presence") {
          if (Array.isArray(data.online_user_ids)) {
            setOnlineUserIds(
              data.online_user_ids.filter(
                (id): id is number => typeof id === "number",
              ),
            );
          }

          const nextLastSeenByUserId: Record<number, string> = {};
          const candidateArrays = [
            data.users,
            data.presences,
            data.user_statuses,
            data.statuses,
          ];

          candidateArrays.forEach((candidate) => {
            if (!Array.isArray(candidate)) return;
            candidate.forEach((item) => {
              if (!item || typeof item !== "object") return;
              const value = item as Record<string, unknown>;
              const userIdCandidate =
                typeof value.user_id === "number"
                  ? value.user_id
                  : typeof value.id === "number"
                    ? value.id
                    : null;
              const lastSeenCandidate =
                typeof value.last_seen_at === "string"
                  ? value.last_seen_at
                  : null;

              if (userIdCandidate && lastSeenCandidate) {
                nextLastSeenByUserId[userIdCandidate] = lastSeenCandidate;
              }
            });
          });

          if (data.last_seen_at && typeof data.last_seen_at === "object") {
            Object.entries(data.last_seen_at as Record<string, unknown>).forEach(
              ([rawUserId, rawLastSeen]) => {
                const parsedUserId = Number(rawUserId);
                if (
                  Number.isFinite(parsedUserId) &&
                  parsedUserId > 0 &&
                  typeof rawLastSeen === "string"
                ) {
                  nextLastSeenByUserId[parsedUserId] = rawLastSeen;
                }
              },
            );
          }

          if (Object.keys(nextLastSeenByUserId).length > 0) {
            setLastSeenAtByUserId((prev) => ({
              ...prev,
              ...nextLastSeenByUserId,
            }));
          }
          return;
        }

        if (data.type === "ack" || data.type === "delivered") {
          return;
        }

        if (data.type === "read") {
          const eventConversationId =
            typeof data.conversation_id === "number"
              ? data.conversation_id
              : conversationId;
          const messageId =
            typeof data.message_id === "number" ? data.message_id : null;

          if (messageId) {
            markMessagesAsRead(
              eventConversationId,
              (message) => Number(message.id) === messageId,
            );
          }
          return;
        }

        if (data.type === "read_all") {
          const eventConversationId =
            typeof data.conversation_id === "number"
              ? data.conversation_id
              : conversationId;
          markMessagesAsRead(eventConversationId, (message) => {
            if (!authUserId) return false;
            return (
              message.sender.id === authUserId || message.sender.name === "Me"
            );
          });
          return;
        }

        if (isChatMessage(data)) {
          appendMessage(data);

          if (data.sender.id !== authUserId && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "delivered", message_id: data.id }));
            if (activeConversationIdRef.current === conversationId) {
              ws.send(JSON.stringify({ type: "read_all" }));
            }
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
    [appendMessage, authUserId, flushQueue, markMessagesAsRead, token],
  );

  useEffect(() => {
    if (!token) return;
    setHasReceivedConversationsSnapshot(false);
    connectConversationsSocket();

    return () => {
      conversationsWsRef.current?.close();
    };
  }, [connectConversationsSocket, token]);

  useEffect(() => {
    if (!token || !activeConversationId) return;

    setIsPeerTyping(false);
    setPeerTypingName(null);
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

  const setActiveConversationId = useCallback((id: number | null) => {
    setActiveConversationIdState(id);
  }, []);

  const sendMessage = useCallback(
    async (text: string, replyToMessageId?: number | null) => {
      if (!activeConversationId) return;

      const normalized = text.trim();
      if (!normalized) return;

      const userId = authUserId ?? 0;
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const nowISO = new Date().toISOString();

      const optimistic: ChatMessageUI = {
        id: tempId,
        conversation: activeConversationId,
        sender: createOptimisticSender(userId),
        text: normalized,
        attachment: null,
        attachment_name: null,
        attachment_mime: null,
        attachment_size: null,
        is_read: false,
        reply_to_message_id: replyToMessageId ?? null,
        reply_to: null,
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
        const wsPayload: Record<string, unknown> = { type: "message", text: normalized };
        if (replyToMessageId) {
          wsPayload.reply_to_message_id = replyToMessageId;
        }
        ws?.send(JSON.stringify(wsPayload));

        // If no server echo arrives in time, clear optimistic UI instead of creating
        // a second REST message that could duplicate the websocket event.
        sendFallbackTimersRef.current[tempId] = window.setTimeout(() => {
          setMessagesByConversation((prev) => {
            const current = prev[activeConversationId] ?? [];
            return {
              ...prev,
              [activeConversationId]: current.map((item) =>
                item.id === tempId ? { ...item, optimistic: false } : item,
              ),
            };
          });
          clearFallbackTimer(tempId);
        }, SEND_TIMEOUT_MS);

        setSending(false);
        return;
      }

      try {
        const created = await createMessage({
          conversation: activeConversationId,
          text: normalized,
          ...(replyToMessageId ? { reply_to_message_id: replyToMessageId } : {}),
        });
        replaceTempMessage(activeConversationId, tempId, created);
      } catch {
        removeTempMessage(activeConversationId, tempId);
      } finally {
        setSending(false);
      }
    },
    [activeConversationId, authUserId, createOptimisticSender, removeTempMessage, replaceTempMessage],
  );

  const sendFile = useCallback(
    async (file: File, caption?: string) => {
      if (!activeConversationId) return;

      const fileToBase64 = async (inputFile: File) =>
        await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = String(reader.result || "");
            const base64 = result.includes(",") ? result.split(",")[1] : result;
            resolve(base64);
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(inputFile);
        });

      const userId = authUserId ?? 0;
      const tempId = `temp-file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const nowISO = new Date().toISOString();
      const localUrl = URL.createObjectURL(file);
      const safeCaption = caption?.trim() || "";

      const optimistic: ChatMessageUI = {
        id: tempId,
        conversation: activeConversationId,
        sender: createOptimisticSender(userId),
        text: safeCaption,
        attachment: localUrl,
        attachment_name: file.name,
        attachment_mime: file.type || null,
        attachment_size: file.size,
        is_read: false,
        reply_to_message_id: null,
        reply_to: null,
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
      try {
        const base64 = await fileToBase64(file);
        const serialized = JSON.stringify({
          type: "file",
          filename: file.name,
          content_type: file.type || "application/octet-stream",
          data: base64,
          text: safeCaption,
        });

        const ws = chatWsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(serialized);

          sendFallbackTimersRef.current[tempId] = window.setTimeout(() => {
            setMessagesByConversation((prev) => {
              const current = prev[activeConversationId] ?? [];
              return {
                ...prev,
                [activeConversationId]: current.map((item) =>
                  item.id === tempId ? { ...item, optimistic: false } : item,
                ),
              };
            });
            clearFallbackTimer(tempId);
          }, SEND_TIMEOUT_MS);
        } else {
          pendingSendQueueRef.current.push(serialized);
        }
      } catch {
        removeTempMessage(activeConversationId, tempId);
      } finally {
        setSending(false);
      }
    },
    [
      activeConversationId,
      authUserId,
      clearFallbackTimer,
      createOptimisticSender,
      removeTempMessage,
    ],
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

  const renameGroup = useCallback(
    async (conversationId: number, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const updated = await renameGroupConversation(conversationId, { name: trimmed });
      upsertConversation(updated);
    },
    [upsertConversation],
  );

  const messages = useMemo(() => {
    if (!activeConversationId) return [];
    return messagesByConversation[activeConversationId] ?? [];
  }, [activeConversationId, messagesByConversation]);

  return {
    conversations,
    hasReceivedConversationsSnapshot,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    sendFile,
    setTyping,
    markAllRead,
    renameGroup,
    loadingHistory,
    sending,
    connectionState,
    conversationsConnectionState,
    isPeerTyping,
    peerTypingName,
    onlineUserIds,
    lastSeenAtByUserId,
  };
};
