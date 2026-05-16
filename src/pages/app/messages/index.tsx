import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportUserModal } from "./components/modals";
import {
  Check,
  CheckCheck,
  CheckCircle,
  Clock3,
  CornerDownLeft,
  FileText,
  Image as ImageIcon,
  Pencil,
  PhoneCall,
  Mic,
  Plus,
  Reply,
  Search,
  Send,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/utils/cs";
import { AnimatePresence, motion } from "framer-motion";
import {
  SharedFilesView,
} from "./components/chat-side-views";
import { ArrowLeft2, ArrowRight2, CallCalling } from "iconsax-reactjs";
import { useChat } from "./hooks/useChat";
import { useAuthStore } from "@/features/auth/authStore";
import { getConversationMedia, type Conversation, type ReplyToInfo } from "./api";
import type { ChatMessageUI } from "./hooks/useChat";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Modal } from "@/components/core/modal";
import logo from "@/assets/images/logo.png";
import { useClickAway } from "react-use";
import { parseGoalCreatedEvent } from "./utils/goal-message";
import {
  useBuddyFinder,
  useConnections,
} from "@/pages/app/buddy-finder/hooks/useBuddies";
import type { BuddyConnection } from "@/pages/app/buddy-finder/api";

type ActiveModal = "none" | "report";
type ComingSoonFeature = "none" | "voice_call" | "video_call";
type AttachmentViewerState = {
  url: string;
  mime: string;
  name: string;
} | null;
const OPEN_CREATE_GOAL_FROM_CHAT_KEY = "open_create_goal_from_chat";
const CREATE_GOAL_CONVERSATION_ID_KEY = "create_goal_conversation_id";

const formatMessageTime = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMessageDateTime = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatLastSeen = (isoString?: string) => {
  if (!isoString) return "Last seen recently";
  const lastSeenDate = new Date(isoString);
  if (Number.isNaN(lastSeenDate.getTime())) return "Last seen recently";

  const now = new Date();
  const diffMs = now.getTime() - lastSeenDate.getTime();
  if (diffMs <= 60_000) return "Last seen just now";

  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `Last seen ${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Last seen ${diffHr} hr ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `Last seen ${diffDay} d ago`;

  return `Last seen ${lastSeenDate.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  })}`;
};

const getConversationName = (conversation: Conversation) =>
  toDisplayText(conversation.partner_name) || `Conversation #${conversation.id}`;

const getConversationAvatar = (conversation: Conversation) =>
  toDisplayText(conversation.partner_avatar);

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const normalizeSearchText = (value?: string | null) =>
  (toDisplayText(value) || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const toDisplayText = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => toDisplayText(item))
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    const maybeLabel = (value as { label?: unknown }).label;
    if (typeof maybeLabel === "string") {
      return maybeLabel.trim();
    }
  }

  return "";
};

const getConversationPreview = (conversation: Conversation) => {
  const goalEvent = parseGoalCreatedEvent(conversation.last_message?.text);
  if (goalEvent) {
    return {
      hasImageAttachment: false,
      hasVideoAttachment: false,
      lastText: "Goal created",
    };
  }

  const lastAttachmentMime = conversation.last_message?.attachment_mime ?? "";
  const hasImageAttachment = lastAttachmentMime.startsWith("image/");
  const hasVideoAttachment = lastAttachmentMime.startsWith("video/");

  let lastText =
    conversation.last_message?.text ||
    (hasImageAttachment
      ? "Image"
      : hasVideoAttachment
        ? "Video"
        : "No messages yet");

  if (conversation.last_message?.reply_to && conversation.last_message.text) {
    const replySnippet = conversation.last_message.reply_to.text
      ? conversation.last_message.reply_to.text.length > 30
        ? `${conversation.last_message.reply_to.text.slice(0, 30)}...`
        : conversation.last_message.reply_to.text
      : "Message";
    lastText = `↪ ${replySnippet}: ${lastText}`;
  }

  return { hasImageAttachment, hasVideoAttachment, lastText };
};

const getFallbackAttachmentName = (mime: string | null, id: number | string) => {
  if (mime?.startsWith("image/")) return `image-${id}`;
  if (mime?.startsWith("video/")) return `video-${id}`;
  if (mime?.startsWith("audio/")) return `audio-${id}`;
  return `file-${id}`;
};

const inferMimeFromUrl = (url?: string | null) => {
  if (!url) return "application/octet-stream";
  const cleanUrl = url.split("?")[0].toLowerCase();

  if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(cleanUrl)) return "image/*";
  if (/\.(mp4|mov|webm|m4v|avi|mkv)$/.test(cleanUrl)) return "video/*";
  if (/\.(mp3|wav|ogg|m4a|aac|flac)$/.test(cleanUrl)) return "audio/*";
  if (cleanUrl.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
};

const getFilenameFromUrl = (url?: string | null) => {
  if (!url) return "";
  const cleanUrl = url.split("?")[0];
  const segments = cleanUrl.split("/");
  const last = segments[segments.length - 1] || "";
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
};

export const MessagesPage = () => {
  const navigate = useNavigate();
  const {
    conversations,
    hasReceivedConversationsSnapshot,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    setTyping,
    sendFile,
    markAllRead,
    renameGroup,
    loadingHistory,
    sending,
    isPeerTyping,
    peerTypingName,
    onlineUserIds,
    lastSeenAtByUserId,
  } = useChat();

  const authUser = useAuthStore((state) => state.user);
  const { data: connections = [] } = useConnections();
  const { data: finderProfiles = [] } = useBuddyFinder();

  const [activeTab, setActiveTab] = useState<"Activities" | "Shared">(
    "Activities",
  );
  const [searchValue, setSearchValue] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>("none");
  const [inputPopoverOpen, setInputPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [comingSoonFeature, setComingSoonFeature] =
    useState<ComingSoonFeature>("none");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<
    string | null
  >(null);
  const [attachmentViewer, setAttachmentViewer] =
    useState<AttachmentViewerState>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessageUI | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: ChatMessageUI;
  } | null>(null);
  const [isRenameGroupOpen, setIsRenameGroupOpen] = useState(false);
  const [renameGroupValue, setRenameGroupValue] = useState("");
  const messagesScrollRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastMessageCountRef = useRef(0);
  const forceScrollOnLoadRef = useRef(false);
  const previousConversationIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputPopoverRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  useClickAway(inputPopoverRef, () => {
    setInputPopoverOpen(false);
  });

  useClickAway(contextMenuRef, () => {
    setContextMenu(null);
  });

  const filteredConversations = useMemo(() => {
    const trimmed = normalizeSearchText(searchValue);
    if (!trimmed) return conversations;

    return conversations.filter((conversation) => {
      const name = normalizeSearchText(getConversationName(conversation));
      const lastMessageText = normalizeSearchText(
        conversation.last_message?.text,
      );
      const attachmentName = normalizeSearchText(
        conversation.last_message?.attachment_name,
      );
      const attachmentMime = normalizeSearchText(
        conversation.last_message?.attachment_mime,
      );

      return (
        name.includes(trimmed) ||
        lastMessageText.includes(trimmed) ||
        attachmentName.includes(trimmed) ||
        attachmentMime.includes(trimmed)
      );
    });
  }, [conversations, searchValue]);

  const activeConversation = useMemo(
    () =>
      conversations.find((conv) => conv.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  const activePartnerUserId = useMemo(() => {
    if (!authUser?.id) return null;
    const partnerMessage = messages.find(
      (message) => message.sender?.id && message.sender.id !== authUser.id,
    );
    return partnerMessage?.sender?.id ?? null;
  }, [authUser?.id, messages]);

  const availableProfiles = useMemo(() => {
    const merged = [...connections, ...finderProfiles];
    const unique = new Map<number, BuddyConnection>();
    merged.forEach((profile) => {
      if (!profile?.id) return;
      if (!unique.has(profile.id)) {
        unique.set(profile.id, profile);
      }
    });
    return Array.from(unique.values());
  }, [connections, finderProfiles]);

  const activePartnerProfile = useMemo<
    | (Pick<BuddyConnection, "bio" | "experience" | "location" | "time_zone" | "availability" | "communication_styles" | "focus_areas" | "interests"> & {
        id: string;
        name: string;
        avatarUrl: string;
        userId?: number;
        compatibility?: number;
      })
    | null
  >(() => {
    if (!activeConversation) return null;

    const conversationName = getConversationName(activeConversation);
    const conversationAvatar = getConversationAvatar(activeConversation);
    const normalizedConversationName = normalizeSearchText(conversationName);

    const matchedConnection = availableProfiles.find((connection) => {
      if (connection.id === activeConversation.partnership) {
        return true;
      }

      if (activePartnerUserId && connection.user?.id === activePartnerUserId) {
        return true;
      }

      const connectionName = normalizeSearchText(connection.user?.name);
      if (!connectionName || connectionName !== normalizedConversationName) {
        return false;
      }

      if (!conversationAvatar) return true;
      return (
        (connection.user?.avatar || "").trim() === conversationAvatar.trim()
      );
    });

    return {
      id: String(activeConversation.id),
      name: conversationName,
      avatarUrl: conversationAvatar,
      userId: matchedConnection?.user?.id,
      compatibility:
        typeof matchedConnection?.compatibility_score === "number"
          ? Math.max(0, Math.min(100, Math.round(matchedConnection.compatibility_score)))
          : undefined,
      bio: toDisplayText(matchedConnection?.bio),
      experience: toDisplayText(matchedConnection?.experience),
      location: toDisplayText(matchedConnection?.location),
      time_zone: toDisplayText(matchedConnection?.time_zone),
      availability: toDisplayText(matchedConnection?.availability),
      communication_styles: toDisplayText(matchedConnection?.communication_styles),
      focus_areas: toDisplayText(matchedConnection?.focus_areas),
      interests: Array.isArray(matchedConnection?.interests)
        ? matchedConnection.interests
            .map((interest) => toDisplayText(interest))
            .filter(Boolean)
        : toDisplayText(matchedConnection?.interests)
            ? [toDisplayText(matchedConnection?.interests)]
            : [],
    };
  }, [activeConversation, activePartnerUserId, availableProfiles]);

  const isActivePartnerOnline = useMemo(() => {
    if (!activePartnerProfile?.userId) return onlineUserIds.length > 0;
    return onlineUserIds.includes(activePartnerProfile.userId);
  }, [activePartnerProfile?.userId, onlineUserIds]);
  const currentUserName = authUser?.name?.trim() || "Me";
  const activePartnerLastSeenAt = useMemo(() => {
    if (!activePartnerProfile?.userId) return undefined;
    return lastSeenAtByUserId[activePartnerProfile.userId];
  }, [activePartnerProfile?.userId, lastSeenAtByUserId]);

  const hasConversations = conversations.length > 0;
  const hasActiveConversation = Boolean(activeConversation);
  const hasSearchQuery = normalizeSearchText(searchValue).length > 0;
  const showConversationListShimmer =
    !hasReceivedConversationsSnapshot && !hasSearchQuery;

  const {
    data: conversationMediaResponse,
    isLoading: isConversationMediaLoading,
    isError: isConversationMediaError,
  } = useQuery({
    queryKey: ["conversation-media", activeConversationId],
    queryFn: () =>
      getConversationMedia(activeConversationId as number, {
        page_size: 100,
      }),
    enabled: Boolean(activeConversationId) && activeTab === "Shared",
    staleTime: 30_000,
  });

  const sharedMediaItems = useMemo(
    () =>
      (conversationMediaResponse?.results || [])
        .map((message) => {
          const url = message.attachment || message.file || "";
          const mime = message.attachment_mime || inferMimeFromUrl(url);
          const name =
            message.attachment_name ||
            getFilenameFromUrl(url) ||
            getFallbackAttachmentName(mime, message.id);

          return {
            id: message.id,
            url,
            name,
            mime,
            createdAt: message.created_at,
            senderName: message.sender?.name || message.sender_name || "",
            size: message.attachment_size,
          };
        })
        .filter((message) => Boolean(message.url)),
    [conversationMediaResponse?.results],
  );

  useEffect(() => {
    if (!activeConversationId) return;
    markAllRead();
    setReplyingTo(null);
    setContextMenu(null);
  }, [activeConversationId, markAllRead]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setInputPopoverOpen(false);
      setIsProfileModalOpen(false);
      setComingSoonFeature("none");
      setAttachmentViewer(null);
      setContextMenu(null);
      setReplyingTo(null);
      setIsRenameGroupOpen(false);
      setActiveConversationId(null);
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setActiveConversationId]);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const container = messagesScrollRef.current;
    if (!container) return;
    messagesEndRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  const isNearBottom = () => {
    const container = messagesScrollRef.current;
    if (!container) return true;
    const threshold = 80;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  };

  useEffect(() => {
    if (!activeConversationId) return;
    if (previousConversationIdRef.current !== activeConversationId) {
      previousConversationIdRef.current = activeConversationId;
      forceScrollOnLoadRef.current = true;
      lastMessageCountRef.current = 0;
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId) return;
    previousConversationIdRef.current = null;
    forceScrollOnLoadRef.current = false;
    lastMessageCountRef.current = 0;
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) return;
    const nextCount = messages.length;
    const previousCount = lastMessageCountRef.current;
    const hasNewMessage = nextCount > previousCount;
    const latestMessage = nextCount > 0 ? messages[nextCount - 1] : null;
    const latestIsMine =
      latestMessage?.sender?.id === authUser?.id ||
      latestMessage?.sender?.name === "Me";

    if (forceScrollOnLoadRef.current && nextCount > 0) {
      // Force initial bottom position after history loads for the conversation.
      window.requestAnimationFrame(() => scrollToBottom("auto"));
      window.setTimeout(() => scrollToBottom("auto"), 80);
      window.setTimeout(() => scrollToBottom("auto"), 180);
      forceScrollOnLoadRef.current = false;
    } else if (hasNewMessage && (latestIsMine || isNearBottom())) {
      window.requestAnimationFrame(() => scrollToBottom("smooth"));
    }

    lastMessageCountRef.current = nextCount;
  }, [activeConversationId, authUser?.id, messages]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setTyping(Boolean(inputValue.trim()));
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [inputValue, setTyping]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text && !selectedFile) return;

    const replyId = typeof replyingTo?.id === "number" ? replyingTo.id : null;

    if (selectedFile) {
      await sendFile(selectedFile, text || undefined);
      setSelectedFile(null);
      if (selectedFilePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(selectedFilePreviewUrl);
      }
      setSelectedFilePreviewUrl(null);
      setInputValue("");
      setTyping(false);
      setReplyingTo(null);
      return;
    }

    await sendMessage(text, replyId);
    setInputValue("");
    setTyping(false);
    setReplyingTo(null);
  };

  const handleCreateGoalFromChat = () => {
    localStorage.setItem(OPEN_CREATE_GOAL_FROM_CHAT_KEY, "1");
    if (activeConversationId) {
      localStorage.setItem(
        CREATE_GOAL_CONVERSATION_ID_KEY,
        String(activeConversationId),
      );
    } else {
      localStorage.removeItem(CREATE_GOAL_CONVERSATION_ID_KEY);
    }
    setInputPopoverOpen(false);
    void navigate({ to: "/goals" });
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setInputPopoverOpen(false);

    if (!file || !hasActiveConversation) {
      return;
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Only image and video files are supported.");
      return;
    }

    const maxSizeBytes = 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("File must be 25MB or less.");
      return;
    }

    if (selectedFilePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedFilePreviewUrl);
    }
    setSelectedFile(file);
    setSelectedFilePreviewUrl(URL.createObjectURL(file));
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (selectedFilePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedFilePreviewUrl);
    }
    setSelectedFilePreviewUrl(null);
  };

  const handleRenameGroup = async () => {
    if (!activeConversationId || !activeConversation?.is_group) return;
    const trimmed = renameGroupValue.trim();
    if (!trimmed) return;
    try {
      await renameGroup(activeConversationId, trimmed);
      toast.success("Group renamed successfully.");
      setIsRenameGroupOpen(false);
    } catch {
      toast.error("Failed to rename group.");
    }
  };

  useEffect(() => {
    if (activeConversation) {
      setRenameGroupValue(
        getConversationName(activeConversation).replace(/^Conversation #\d+$/, ""),
      );
    }
  }, [activeConversation]);

  const handleMessageClick = (
    event: React.MouseEvent,
    message: ChatMessageUI,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      x: event.clientX ?? event.nativeEvent.offsetX,
      y: event.clientY ?? event.nativeEvent.offsetY,
      message,
    });
  };

  const handleContextMenu = (
    event: React.MouseEvent,
    message: ChatMessageUI,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      message,
    });
  };

  const handleReplyTo = (message: ChatMessageUI) => {
    setReplyingTo(message);
    setContextMenu(null);
    messageInputRef.current?.focus();
  };

  useEffect(() => {
    return () => {
      if (selectedFilePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(selectedFilePreviewUrl);
      }
    };
  }, [selectedFilePreviewUrl]);

  useEffect(() => {
    const input = messageInputRef.current;
    if (!input) return;

    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }, [inputValue]);

  return (
    <>
      <div className="font-monts w-full flex h-[92vh] bg-white dark:bg-slate-950 overflow-hidden relative text-gray-900 dark:text-slate-100">
        <div
          className={cn(
            "w-full md:w-96 border-r overflow-y-auto border-gray-200 dark:border-slate-800 flex-col bg-white dark:bg-slate-900",
            showMobileChat ? "hidden md:flex" : "flex",
          )}
        >
          <div className="h-16 flex items-center px-4 text-gray-500 dark:text-slate-400 text-sm font-medium">
            <ArrowLeft2 size="16" color="#636363" />
            <ArrowRight2 size="16" color="#636363" className="mx-2" />
            <span className="cursor-pointer hover:text-gray-900 dark:hover:text-slate-200">
              Goals
            </span>
            <span className="mx-2">/</span>
            <span className="cursor-pointer hover:text-gray-900 dark:hover:text-slate-200">
              Invitation
            </span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-slate-100">Messages</span>
          </div>

          <div className="px-4 mb-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-[#CDDAE9] dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {showConversationListShimmer ? (
              <ConversationListShimmer />
            ) : (
              filteredConversations.map((conversation) => {
                const isActive = activeConversationId === conversation.id;
                const name = getConversationName(conversation);
                const avatarUrl = getConversationAvatar(conversation);
                const { hasImageAttachment, hasVideoAttachment, lastText } =
                  getConversationPreview(conversation);
                const timeText = formatMessageTime(
                  conversation.last_message?.created_at ??
                    conversation.updated_at,
                );

                return (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setActiveConversationId(conversation.id);
                      setIsProfileModalOpen(false);
                      setShowMobileChat(true);
                    }}
                    className={cn(
                      "flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors relative",
                      isActive ? "bg-primary-100/50 dark:bg-slate-800" : "",
                    )}
                  >
                    <div className="relative mr-3 shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={name}
                          className="w-12 h-12 rounded-full object-cover"
                          onClick={(event) => {
                            event.stopPropagation();
                            setAttachmentViewer({
                              url: avatarUrl,
                              mime: "image/*",
                              name,
                            });
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#E6F0FD] text-[#1F2937] flex items-center justify-center font-semibold text-sm">
                          {getInitials(name)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <h3 className="text-sm font-medium text-dark-gray dark:text-slate-100 truncate">
                          {name}
                          {conversation.is_group && (
                            <span className="ml-1.5 text-[10px] font-medium text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full align-middle">
                              Group
                            </span>
                          )}
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-[#616161] dark:text-slate-400 truncate">
                        {hasImageAttachment ? (
                          <span className="inline-flex items-center gap-1">
                            <ImageIcon size={14} className="shrink-0" />
                            {lastText}
                          </span>
                        ) : hasVideoAttachment ? (
                          <span className="inline-flex items-center gap-1">
                            <Video size={14} className="shrink-0" />
                            {lastText}
                          </span>
                        ) : (
                          lastText
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 items-end">
                      <span className="font-sans text-sm text-[#929191] dark:text-slate-500">
                        {timeText}
                      </span>
                      {conversation.unread_count > 0 && !isActive && (
                        <div className="bg-blue-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                          {conversation.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {!showConversationListShimmer &&
              filteredConversations.length === 0 && (
                <div className="px-4 py-12">
                  <div className="rounded-xl border border-dashed border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/30 p-5 text-center">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                      {hasSearchQuery
                        ? "No matching conversations"
                        : "No conversations yet"}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {hasSearchQuery
                        ? "Try a different name or clear your search."
                        : "Start a new connection and your chats will appear here."}
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>

        <div
          className={cn(
            "flex-col bg-white dark:bg-slate-900",
            showMobileChat
              ? "fixed inset-0 z-50 flex w-full h-full md:static md:flex-1"
              : "hidden md:flex md:flex-1 md:relative",
          )}
        >
          {hasActiveConversation && (
            <div className="border-b border-gray-200 dark:border-slate-800 flex items-center justify-between py-2.5 px-3 md:px-6 gap-2">
              <div className="flex items-center min-w-0 flex-1">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="mr-3 md:hidden p-1 -ml-2"
                >
                  <ArrowLeft2 size="24" color="#636363" />
                </button>

                <div
                  className={cn(
                    "w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#E6F0FD] text-[#1F2937] flex items-center justify-center font-semibold text-xs mr-2 md:mr-3 shrink-0",
                    hasActiveConversation ? "" : "opacity-60",
                  )}
                >
                  {activeConversation &&
                  getConversationAvatar(activeConversation) ? (
                    <img
                      src={getConversationAvatar(activeConversation)}
                      alt={getConversationName(activeConversation)}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover"
                      onClick={(event) => {
                        event.stopPropagation();
                        setAttachmentViewer({
                          url: getConversationAvatar(activeConversation),
                          mime: "image/*",
                          name: getConversationName(activeConversation),
                        });
                      }}
                    />
                  ) : (
                    getInitials(
                      activeConversation
                        ? getConversationName(activeConversation)
                        : "Chat",
                    )
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!hasActiveConversation}
                      onClick={() => {
                        if (activeConversation?.is_group) {
                          setRenameGroupValue(getConversationName(activeConversation));
                          setIsRenameGroupOpen(true);
                        } else {
                          setIsProfileModalOpen(true);
                        }
                      }}
                      className="font-semibold text-[#666668] dark:text-slate-200 text-sm truncate max-w-[42vw] md:max-w-none text-left hover:text-[#4E92F4] transition-colors disabled:pointer-events-none disabled:opacity-80"
                    >
                      {activeConversation
                        ? getConversationName(activeConversation)
                        : hasConversations
                          ? "Select a conversation"
                          : "No conversations yet"}
                    </button>
                    {activeConversation?.is_group && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!activeConversation) return;
                          setRenameGroupValue(getConversationName(activeConversation));
                          setIsRenameGroupOpen(true);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                        aria-label="Rename group"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                  {hasActiveConversation ? (
                    <p
                      className={cn(
                        "text-[11px] md:text-xs flex items-center truncate max-w-[50vw] md:max-w-none",
                        isPeerTyping || isActivePartnerOnline
                          ? "text-green-500"
                          : "text-gray-500 dark:text-slate-400",
                      )}
                    >
                      {isPeerTyping
                        ? `${peerTypingName || "Someone"} is typing...`
                        : activeConversation?.is_group
                          ? `${onlineUserIds.length} online`
                          : isActivePartnerOnline
                            ? "Online"
                            : formatLastSeen(activePartnerLastSeenAt)}
                    </p>
                  ) : (
                    <p className="text-[11px] md:text-xs text-gray-400 dark:text-slate-500 flex items-center truncate max-w-[50vw] md:max-w-none">
                      Choose a chat from the left to start messaging.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center text-gray-400 dark:text-slate-500 gap-1 md:gap-0">
                <div
                  onClick={() =>
                    hasActiveConversation && setComingSoonFeature("voice_call")
                  }
                  className={cn(
                    "size-9 md:size-12 flex justify-center items-center bg-white dark:bg-slate-900 rounded-md",
                    hasActiveConversation
                      ? "cursor-pointer hover:bg-[#4E92F421] dark:hover:bg-slate-800"
                      : "cursor-not-allowed opacity-40",
                  )}
                >
                  <CallCalling
                    size={20}
                    className="hover:text-gray-600 dark:hover:text-slate-200 text-[#130F26] dark:text-slate-300 cursor-pointer"
                  />
                </div>
                <div
                  onClick={() =>
                    hasActiveConversation && setComingSoonFeature("video_call")
                  }
                  className={cn(
                    "size-9 md:size-12 flex justify-center items-center bg-white dark:bg-slate-900 rounded-md",
                    hasActiveConversation
                      ? "cursor-pointer hover:bg-[#4E92F421] dark:hover:bg-slate-800"
                      : "cursor-not-allowed opacity-40",
                  )}
                >
                  <Video
                    size={24}
                    strokeWidth={1.5}
                    className="hover:text-gray-600 dark:hover:text-slate-200 text-[#130F26] dark:text-slate-300 cursor-pointer"
                  />
                </div>
                <div
                  className={cn(
                    "hidden md:flex size-12 justify-center items-center bg-white dark:bg-slate-900 rounded-md",
                    hasActiveConversation
                      ? "cursor-pointer hover:bg-[#4E92F421] dark:hover:bg-slate-800"
                      : "cursor-not-allowed opacity-40",
                  )}
                >
                  <Search
                    size={20}
                    className="hover:text-gray-600 dark:hover:text-slate-200 text-[#130F26] dark:text-slate-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {hasActiveConversation && (
            <div className="sticky top-2.5 flex gap-6 px-6 py-4 text-sm font-medium bg-bg-gray dark:bg-slate-950">
              <button
                onClick={() => setActiveTab("Activities")}
                className={cn(
                  activeTab === "Activities"
                    ? "text-gray-900 dark:text-slate-100"
                    : "text-gray-400 dark:text-slate-500",
                )}
              >
                Activities
              </button>
              <button
                onClick={() => setActiveTab("Shared")}
                className={cn(
                  activeTab === "Shared"
                    ? "text-gray-900 dark:text-slate-100"
                    : "text-gray-400 dark:text-slate-500",
                )}
              >
                Shared
              </button>
            </div>
          )}

          <div
            ref={messagesScrollRef}
            className="flex-1 overflow-y-auto scroll-smooth bg-bg-gray dark:bg-slate-950 relative"
          >
            {activeTab === "Shared" && hasActiveConversation ? (
              <SharedFilesView
                items={sharedMediaItems}
                isLoading={isConversationMediaLoading}
                isError={isConversationMediaError}
                onOpenAttachment={(payload) => setAttachmentViewer(payload)}
              />
            ) : (
              <div className="h-full p-4 md:p-6 pb-8 md:pb-10 space-y-6">
                {!hasActiveConversation ? (
                  <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center px-6">
                    <img
                      src={logo}
                      alt="Padlupp"
                      className="w-24 h-auto mb-4 opacity-90"
                    />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      {hasConversations
                        ? "Select a conversation"
                        : "No conversations yet"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 max-w-sm">
                      {hasConversations
                        ? "Choose a chat from the left to start messaging."
                        : "Connect with buddies from Buddy Finder and your chats will appear here."}
                    </p>
                  </div>
                ) : null}

                {loadingHistory && hasActiveConversation && (
                  <ChatLoadingShimmer />
                )}

                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    text={message.text}
                    senderName={message.sender?.name || "User"}
                    senderAvatar={message.sender?.avatar || ""}
                    isMe={message.sender?.id === authUser?.id}
                    myName={currentUserName}
                    timestamp={formatMessageDateTime(message.created_at)}
                    pending={Boolean(message.optimistic)}
                    isRead={Boolean(message.is_read)}
                    attachment={message.attachment}
                    attachmentName={message.attachment_name}
                    attachmentMime={message.attachment_mime}
                    goalEvent={parseGoalCreatedEvent(message.text)}
                    replyTo={message.reply_to ?? null}
                    onClick={(event) => handleMessageClick(event, message)}
                    onContextMenu={(event) => handleContextMenu(event, message)}
                    onAttachmentClick={(payload) =>
                      setAttachmentViewer(payload)
                    }
                  />
                ))}

                {isPeerTyping && hasActiveConversation && (
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {peerTypingName || "Someone"} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

          </div>

          {hasActiveConversation && (
            <div className="relative pt-2 px-4 pb-5 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
              {replyingTo && (
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3 py-2">
                  <CornerDownLeft size={14} className="shrink-0 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
                      {replyingTo.sender?.id === authUser?.id
                        ? "You"
                        : replyingTo.sender?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      {replyingTo.text
                        ? replyingTo.text.length > 60
                          ? `${replyingTo.text.slice(0, 60)}...`
                          : replyingTo.text
                        : replyingTo.attachment_name
                          ? `📎 ${replyingTo.attachment_name}`
                          : "Message"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="shrink-0 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
                    aria-label="Cancel reply"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <AnimatePresence>
                {inputPopoverOpen && (
                  <motion.div
                    ref={inputPopoverRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-4 bottom-[calc(100%+0.5rem)] bg-white dark:bg-slate-800 shadow shadow-[#A3CBFA26] rounded-lg border border-[#CDDAE9] dark:border-slate-700 p-2 w-44 max-w-[calc(100vw-2rem)] z-20"
                  >
                    <button
                      onClick={handleCreateGoalFromChat}
                      className="flex items-center w-full p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-slate-200 rounded-md text-left"
                    >
                      <CheckCircle size={16} className="text-blue-500 mr-2" />
                      Create goal
                    </button>
                    <button
                      onClick={handlePickFile}
                      className="flex items-center w-full p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-slate-200 rounded-md text-left"
                    >
                      <FileText
                        size={16}
                        className="text-gray-500 dark:text-slate-400 mr-2"
                      />
                      File
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    hasActiveConversation &&
                    setInputPopoverOpen(!inputPopoverOpen)
                  }
                  disabled={!hasActiveConversation}
                  className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-[#3D3D3D] dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                </button>
                <button
                  disabled
                  className="text-[#3D3D3D] disabled:opacity-30 dark:text-slate-300 hover:text-gray-600 dark:hover:text-slate-200 hidden md:block"
                >
                  <Mic strokeWidth={1.5} size={20} />
                </button>
                <textarea
                  ref={messageInputRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  disabled={!activeConversationId}
                  placeholder={
                    activeConversationId
                      ? selectedFile
                        ? "Add a caption (optional)"
                        : "Type a message"
                      : "Select a conversation"
                  }
                  rows={1}
                  className="py-2 min-h-10 max-h-[140px] flex-1 resize-none overflow-y-auto bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-0 text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 disabled:text-gray-400 dark:disabled:text-slate-500 leading-5"
                />
                <button
                  disabled={!activeConversationId || sending}
                  onClick={() => void handleSend()}
                  className="p-2 bg-blue-200 dark:bg-blue-900/40 rounded-lg text-[#3D3D3D] dark:text-slate-100 hover:bg-[#B6D8FF] dark:hover:bg-blue-900/60 transition-colors disabled:opacity-60"
                >
                  <Send size={20} className="ml-0.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(event) => void handleFileChange(event)}
                />
              </div>
              {selectedFile && (
                <div className="mt-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-3 flex items-center gap-3">
                  {selectedFilePreviewUrl &&
                  selectedFile.type.startsWith("image/") ? (
                    <img
                      src={selectedFilePreviewUrl}
                      alt={selectedFile.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  ) : selectedFilePreviewUrl &&
                    selectedFile.type.startsWith("video/") ? (
                    <video
                      src={selectedFilePreviewUrl}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-white dark:bg-slate-900 flex items-center justify-center">
                      <FileText
                        size={18}
                        className="text-gray-500 dark:text-slate-300"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Ready to send
                    </p>
                  </div>
                  <button
                    onClick={clearSelectedFile}
                    className="text-xs px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ReportUserModal
        isOpen={activeModal === "report"}
        onClose={() => setActiveModal("none")}
      />
      <Modal
        isOpen={isProfileModalOpen && Boolean(activePartnerProfile)}
        onClose={() => setIsProfileModalOpen(false)}
        showCloseButton
        className="max-w-lg w-[92vw] p-5 md:p-6 top-1/2 -translate-y-1/2"
      >
        {activePartnerProfile && (
          <div className="flex flex-col items-center text-center">
            {activePartnerProfile.avatarUrl ? (
              <img
                src={activePartnerProfile.avatarUrl}
                alt={activePartnerProfile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm cursor-zoom-in"
                onClick={() =>
                  setAttachmentViewer({
                    url: activePartnerProfile.avatarUrl,
                    mime: "image/*",
                    name: activePartnerProfile.name,
                  })
                }
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#E6F0FD] text-[#1F2937] flex items-center justify-center text-2xl font-semibold">
                {getInitials(activePartnerProfile.name)}
              </div>
            )}
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              {activePartnerProfile.name}
            </h3>
            <p
              className={cn(
                "mt-1 text-sm",
                isActivePartnerOnline
                  ? "text-green-500"
                  : "text-gray-500 dark:text-slate-400",
              )}
            >
              {isActivePartnerOnline
                ? "Online"
                : formatLastSeen(activePartnerLastSeenAt)}
            </p>

            {typeof activePartnerProfile.compatibility === "number" && (
              <p className="mt-2 text-sm font-medium text-orange-500">
                {activePartnerProfile.compatibility}% compatible
              </p>
            )}

            <div className="mt-5 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/40 px-4 py-3 text-left">
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                About
              </p>
              <p className="mt-1 text-sm text-gray-700 dark:text-slate-200 whitespace-pre-wrap">
                {activePartnerProfile.bio || "No bio added yet."}
              </p>
            </div>

            <div className="mt-3 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 px-4 py-3 text-left">
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                Profile details
              </p>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <ProfileField label="Experience" value={activePartnerProfile.experience} />
                <ProfileField label="Location" value={activePartnerProfile.location} />
                <ProfileField label="Time zone" value={activePartnerProfile.time_zone} />
                <ProfileField label="Availability" value={activePartnerProfile.availability} />
                <ProfileField
                  label="Communication"
                  value={activePartnerProfile.communication_styles}
                />
                <ProfileField label="Focus areas" value={activePartnerProfile.focus_areas} />
              </div>
            </div>

            <div className="mt-3 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 px-4 py-3 text-left">
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                Interests
              </p>
              {activePartnerProfile.interests.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {activePartnerProfile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-[#4E92F426] dark:bg-blue-500/20 text-xs font-medium text-gray-700 dark:text-slate-200 px-2.5 py-1 rounded-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-700 dark:text-slate-200">
                  No interests shared yet.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={comingSoonFeature !== "none"}
        onClose={() => setComingSoonFeature("none")}
        showCloseButton
        className="max-w-sm w-full p-6 top-1/2 -translate-y-1/2"
      >
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
            {comingSoonFeature === "video_call" ? (
              <Video size={22} className="text-blue-600 dark:text-blue-400" />
            ) : (
              <PhoneCall
                size={22}
                className="text-blue-600 dark:text-blue-400"
              />
            )}
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            Feature Coming Soon
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            {comingSoonFeature === "video_call"
              ? "Video calling will be available in an upcoming release."
              : "Voice calling will be available in an upcoming release."}
          </p>
        </div>
      </Modal>
      <Modal
        isOpen={Boolean(attachmentViewer)}
        onClose={() => setAttachmentViewer(null)}
        showCloseButton
        className="max-w-3xl w-[92vw] p-4 md:p-6 top-1/2 -translate-y-1/2"
      >
        {attachmentViewer && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-200 mb-3 truncate pr-6">
              {attachmentViewer.name}
            </h3>
            {attachmentViewer.mime.startsWith("image/") ? (
              <img
                src={attachmentViewer.url}
                alt={attachmentViewer.name}
                className="max-h-[70vh] w-full object-contain rounded-md"
              />
            ) : attachmentViewer.mime.startsWith("video/") ? (
              <video
                src={attachmentViewer.url}
                controls
                autoPlay
                className="max-h-[70vh] w-full rounded-md"
              />
            ) : attachmentViewer.mime.startsWith("audio/") ? (
              <audio src={attachmentViewer.url} controls autoPlay className="w-full" />
            ) : (
              <a
                href={attachmentViewer.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Open file in new tab
              </a>
            )}
          </div>
        )}
      </Modal>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={contextMenuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{
              position: "fixed",
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 100,
            }}
            className="min-w-[140px] rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1.5"
          >
            <button
              type="button"
              onClick={() => handleReplyTo(contextMenu.message)}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <Reply size={15} className="shrink-0" />
              Reply
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isRenameGroupOpen}
        onClose={() => setIsRenameGroupOpen(false)}
        showCloseButton
        className="max-w-sm w-[92vw] p-6 top-1/2 -translate-y-1/2"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Rename group
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Choose a new name for this group chat.
            </p>
          </div>
          <input
            type="text"
            value={renameGroupValue}
            onChange={(event) => setRenameGroupValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleRenameGroup();
              }
            }}
            placeholder="Group name"
            className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRenameGroupOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleRenameGroup()}
              disabled={!renameGroupValue.trim()}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:opacity-90 disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const ProfileField = ({ label, value }: { label: string; value?: unknown }) => (
  <div className="rounded-md bg-gray-50 dark:bg-slate-800 px-2.5 py-2">
    <p className="text-[11px] text-gray-500 dark:text-slate-400">{label}</p>
    <p className="text-sm text-gray-800 dark:text-slate-100">
      {toDisplayText(value) || "Not set"}
    </p>
  </div>
);

const MessageBubble = ({
  text,
  senderName,
  senderAvatar,
  isMe,
  myName,
  timestamp,
  pending,
  isRead,
  attachment,
  attachmentName,
  attachmentMime,
  goalEvent,
  replyTo,
  onClick,
  onContextMenu,
  onAttachmentClick,
}: {
  text: string | null;
  senderName: string;
  senderAvatar: string;
  isMe: boolean;
  myName: string;
  timestamp: string;
  pending: boolean;
  isRead: boolean;
  attachment?: string | null;
  attachmentName?: string | null;
  attachmentMime?: string | null;
  goalEvent?: {
    goalId: number;
    title: string;
    creatorName: string;
  } | null;
  replyTo?: ReplyToInfo | null;
  onClick?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  onAttachmentClick?: (payload: {
    url: string;
    mime: string;
    name: string;
  }) => void;
}) => {
  const navigate = useNavigate();
  const displayName = isMe ? myName : senderName;
  const isImage = Boolean(attachment && attachmentMime?.startsWith("image/"));
  const isVideo = Boolean(attachment && attachmentMime?.startsWith("video/"));

  if (goalEvent) {
    return (
      <div className="w-full py-1">
        <div className="mx-auto max-w-[88%] md:max-w-[72%] rounded-xl border border-dashed border-[#C7D7EA] bg-[#F8FBFF] px-4 py-3 text-sm">
          <span className="text-[#4F8EE9] font-semibold">
            @{goalEvent.creatorName}
          </span>{" "}
          <span className="text-[#3B3B3B]">just created a goal</span>{" "}
          <button
            type="button"
            className="text-[#4F8EE9] underline underline-offset-2 font-medium"
            onClick={() =>
              void navigate({
                to: "/goals/$id",
                params: { id: String(goalEvent.goalId) },
              })
            }
          >
            Goal details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex w-full mb-1", isMe ? "justify-end" : "justify-start")}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <div
        className={cn(
          "flex gap-2.5 max-w-[88%] md:max-w-[72%]",
          isMe ? "flex-row-reverse" : "flex-row",
        )}
      >
        {senderAvatar ? (
          <img
            src={senderAvatar}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 cursor-zoom-in"
            onClick={() =>
              onAttachmentClick?.({
                url: senderAvatar,
                mime: "image/*",
                name: displayName,
              })
            }
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#E6F0FD] text-[#1F2937] flex items-center justify-center text-xs font-semibold shrink-0 mt-1">
            {getInitials(displayName)}
          </div>
        )}
        <div
          className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
        >
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2.5 shadow-sm",
              isMe
                ? "bg-blue-500 text-white rounded-tr-md"
                : "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-tl-md",
            )}
          >
            {!isMe && (
              <span className="font-semibold text-xs text-gray-500 dark:text-slate-400 block mb-1">
                {displayName}
              </span>
            )}

            {replyTo && (
              <div
                className={cn(
                  "mb-1.5 px-2.5 py-1.5 rounded-lg border-l-2 text-xs cursor-default",
                  isMe
                    ? "bg-blue-400/40 border-blue-200 text-blue-100"
                    : "bg-gray-100 dark:bg-slate-700/60 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300",
                )}
              >
                <p className={cn(
                  "font-semibold truncate",
                  isMe ? "text-blue-100" : "text-blue-600 dark:text-blue-400",
                )}>
                  {replyTo.sender_name}
                </p>
                <p className="truncate mt-0.5">
                  {replyTo.text
                    ? replyTo.text.length > 80
                      ? `${replyTo.text.slice(0, 80)}...`
                      : replyTo.text
                    : replyTo.attachment_name || "Attachment"}
                </p>
              </div>
            )}

            {attachment && (
              <div className={cn("mb-2", isMe ? "" : "")}>
                {isImage ? (
                  <img
                    src={attachment}
                    alt={attachmentName || "attachment"}
                    className="max-w-[240px] rounded-lg object-cover cursor-zoom-in"
                    onClick={() =>
                      onAttachmentClick?.({
                        url: attachment,
                        mime: attachmentMime || "image/*",
                        name: attachmentName || "image",
                      })
                    }
                  />
                ) : isVideo ? (
                  <video
                    src={attachment}
                    controls
                    className="max-w-[260px] rounded-lg cursor-pointer"
                    onClick={() =>
                      onAttachmentClick?.({
                        url: attachment,
                        mime: attachmentMime || "video/*",
                        name: attachmentName || "video",
                      })
                    }
                  />
                ) : (
                  <a
                    href={attachment}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "text-sm underline",
                      isMe
                        ? "text-blue-100"
                        : "text-blue-600 dark:text-blue-400",
                    )}
                  >
                    {attachmentName || "Open attachment"}
                  </a>
                )}
              </div>
            )}

            {text && (
              <div
                className={cn(
                  "text-sm leading-relaxed whitespace-pre-wrap break-words",
                  "[overflow-wrap:anywhere]",
                  isMe ? "text-white" : "text-gray-800 dark:text-slate-100",
                )}
              >
                {text}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 px-1">
            <span
              className={cn(
                "text-[11px]",
                isMe
                  ? "text-gray-400 dark:text-slate-500"
                  : "text-gray-400 dark:text-slate-500",
              )}
            >
              {timestamp}
            </span>
            {isMe && (
              <span
                className={cn(
                  "text-[11px] inline-flex items-center gap-1",
                  pending
                    ? "text-gray-400 dark:text-slate-500"
                    : isRead
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-400 dark:text-slate-500",
                )}
              >
                {pending ? (
                  <Clock3 size={12} />
                ) : isRead ? (
                  <CheckCheck size={13} />
                ) : (
                  <Check size={13} />
                )}
                {pending ? "Sending..." : isRead ? "Read" : "Sent"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatLoadingShimmer = () => {
  const items = [
    { id: 1, align: "left", width: "w-44" },
    { id: 2, align: "right", width: "w-56" },
    { id: 3, align: "left", width: "w-36" },
    { id: 4, align: "right", width: "w-48" },
  ] as const;

  return (
    <div className="space-y-4 animate-pulse">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex w-full",
            item.align === "right" ? "justify-end" : "justify-start",
          )}
        >
          <div
            className={cn(
              "flex gap-2.5 max-w-[88%] md:max-w-[72%]",
              item.align === "right" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0" />
            <div className="space-y-2">
              <div
                className={cn(
                  "h-10 rounded-2xl bg-gray-200 dark:bg-slate-700",
                  item.width,
                )}
              />
              <div className="h-2 w-16 rounded bg-gray-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ConversationListShimmer = () => {
  return (
    <div className="px-2 py-2  animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="flex items-center p-2">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0 mr-3" />
          <div className="flex-1 min-w-0">
            <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-slate-700 mb-2" />
            <div className="h-3 w-40 rounded bg-gray-200 dark:bg-slate-700" />
          </div>
          <div className="h-3 w-10 rounded bg-gray-200 dark:bg-slate-700 ml-3" />
        </div>
      ))}
    </div>
  );
};
