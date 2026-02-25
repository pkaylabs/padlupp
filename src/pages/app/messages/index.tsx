import { useEffect, useMemo, useState } from "react";
import {
  CreateGoalModal,
  RateUserModal,
  ReportUserModal,
} from "./components/modals";
import {
  CheckCircle,
  FileText,
  Mic,
  Plus,
  Search,
  Send,
  Video,
} from "lucide-react";
import { cn } from "@/utils/cs";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChatPartnerProfile,
  GoalProgressView,
  SharedFilesView,
  UserProfileView,
} from "./components/chat-side-views";
import { ArrowLeft2, ArrowRight2, CallCalling } from "iconsax-reactjs";
import { VideoCallOverlay } from "./components/video-call-overlay";
import { useChat } from "./hooks/useChat";
import { useAuthStore } from "@/features/auth/authStore";
import type { Conversation } from "./api";

type SideView = "none" | "profile" | "progress";
type ActiveModal = "none" | "create_goal" | "rate" | "report";

const formatMessageTime = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getConversationName = (conversation: Conversation) =>
  conversation.partner_name?.trim() || `Conversation #${conversation.id}`;

const getConversationAvatar = (conversation: Conversation) =>
  conversation.partner_avatar?.trim() || "";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const MessagesPage = () => {
  const {
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
  } = useChat();

  const authUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<"Activities" | "Shared">(
    "Activities",
  );
  const [searchValue, setSearchValue] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [sideView, setSideView] = useState<SideView>("none");
  const [activeModal, setActiveModal] = useState<ActiveModal>("none");
  const [inputPopoverOpen, setInputPopoverOpen] = useState(false);
  const [vidCall, setVidCall] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const filteredConversations = useMemo(() => {
    const trimmed = searchValue.trim().toLowerCase();
    if (!trimmed) return conversations;

    return conversations.filter((conversation) =>
      getConversationName(conversation).toLowerCase().includes(trimmed),
    );
  }, [conversations, searchValue]);

  const activeConversation = useMemo(
    () => conversations.find((conv) => conv.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  const activePartnerProfile = useMemo<ChatPartnerProfile | null>(() => {
    if (!activeConversation) return null;

    return {
      id: String(activeConversation.id),
      name: getConversationName(activeConversation),
      avatarUrl:
        getConversationAvatar(activeConversation) ||
        "https://placehold.co/120x120/E6F0FD/1F2937?text=U",
    };
  }, [activeConversation]);

  const hasConversations = conversations.length > 0;
  const hasActiveConversation = Boolean(activeConversation);

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations, setActiveConversationId]);

  useEffect(() => {
    if (!activeConversationId) return;
    markAllRead();
  }, [activeConversationId, markAllRead]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setTyping(Boolean(inputValue.trim()));
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [inputValue, setTyping]);

  const handleOpenProfile = () => {
    if (!hasActiveConversation) return;
    setSideView("profile");
  };
  const handleBackToChat = () => setSideView("none");

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    await sendMessage(text);
    setInputValue("");
    setTyping(false);
  };

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
            <span className="cursor-pointer hover:text-gray-900 dark:hover:text-slate-200">Goals</span>
            <span className="mx-2">/</span>
            <span className="cursor-pointer hover:text-gray-900 dark:hover:text-slate-200">Invitation</span>
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

          <div className="px-4 pb-2 text-xs text-gray-500 dark:text-slate-400">
            Conversations socket: {conversationsConnectionState}
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => {
              const isActive = activeConversationId === conversation.id;
              const name = getConversationName(conversation);
              const avatarUrl = getConversationAvatar(conversation);
              const lastText = conversation.last_message?.text ?? "No messages yet";
              const timeText = formatMessageTime(
                conversation.last_message?.created_at ?? conversation.updated_at,
              );

              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setActiveConversationId(conversation.id);
                    setSideView("none");
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
                      </h3>
                    </div>
                    <p className="text-sm font-medium text-[#616161] dark:text-slate-400 truncate">
                      {lastText}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 items-end">
                    <span className="font-sans text-sm text-[#929191] dark:text-slate-500">{timeText}</span>
                    {conversation.unread_count > 0 && (
                      <div className="bg-blue-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="px-4 py-8 text-sm text-gray-500 dark:text-slate-400">No conversations found.</div>
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
          <div className="border-b border-gray-200 dark:border-slate-800 flex items-center justify-between py-2.5 px-4 md:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setShowMobileChat(false)}
                className="mr-3 md:hidden p-1 -ml-2"
              >
                <ArrowLeft2 size="24" color="#636363" />
              </button>

              <div
                className={cn(
                  "w-10 h-10 rounded-full bg-[#E6F0FD] text-[#1F2937] flex items-center justify-center font-semibold text-xs mr-3",
                  hasActiveConversation ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                )}
                onClick={handleOpenProfile}
              >
                {activeConversation && getConversationAvatar(activeConversation) ? (
                  <img
                    src={getConversationAvatar(activeConversation)}
                    alt={getConversationName(activeConversation)}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  getInitials(
                    activeConversation ? getConversationName(activeConversation) : "Chat",
                  )
                )}
              </div>

              <div>
                <h2 className="font-semibold text-[#666668] dark:text-slate-200 text-sm">
                  {activeConversation
                    ? getConversationName(activeConversation)
                    : hasConversations
                      ? "Select a conversation"
                      : "No conversations yet"}
                </h2>
                {hasActiveConversation ? (
                  <p className="text-xs text-green-500 flex items-center">
                    Chat socket: {connectionState}
                    {onlineUserIds.length > 0 && ` • ${onlineUserIds.length} online`}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center">
                    Choose a chat from the left to start messaging.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center text-gray-400 dark:text-slate-500 gap-1 md:gap-0">
              <div
                onClick={() => hasActiveConversation && setVidCall(true)}
                className={cn(
                  "size-10 md:size-12 flex justify-center items-center bg-white dark:bg-slate-900 rounded-md",
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
                onClick={() => hasActiveConversation && setVidCall(true)}
                className={cn(
                  "size-10 md:size-12 flex justify-center items-center bg-white dark:bg-slate-900 rounded-md",
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
                  "size-10 md:size-12 flex justify-center items-center bg-white dark:bg-slate-900 rounded-md",
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

          <div className="sticky top-2.5 flex gap-6 px-6 py-4 text-sm font-medium bg-bg-gray dark:bg-slate-950">
            <button
              onClick={() => setActiveTab("Activities")}
              className={
                activeTab === "Activities" ? "text-gray-900 dark:text-slate-100" : "text-gray-400 dark:text-slate-500"
              }
            >
              Activities
            </button>
            <button
              disabled
              title="Shared files coming soon"
              className="text-gray-300 dark:text-slate-600 cursor-not-allowed"
            >
              Shared
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scroll-smooth bg-bg-gray dark:bg-slate-950 relative">
            {activeTab === "Shared" ? (
              <div className="text-center text-gray-500 dark:text-slate-400">
                <SharedFilesView />
              </div>
            ) : (
              <div className="h-full p-4 md:p-6 space-y-6">
                {hasActiveConversation ? (
                  <div className="w-full flex flex-col justify-center items-center">
                    <p className="border border-dashed border-[#CDDAE9] dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 text-sm text-gray-600 dark:text-slate-300 w-fit">
                      Real-time chat connected with optimistic message send and reconnect handling.
                    </p>
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center px-6">
                    <div className="size-16 rounded-full bg-[#E6F0FD] text-[#1F2937] flex items-center justify-center text-xl font-semibold mb-4">
                      {hasConversations ? "CH" : "NC"}
                    </div>
                    <p className="text-base text-gray-700 dark:text-slate-200 font-medium">
                      {hasConversations
                        ? "Select a conversation to start chatting"
                        : "You don't have any conversations yet"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      {hasConversations
                        ? "Pick a chat from the list on the left."
                        : "When you connect with a buddy, chats will appear here."}
                    </p>
                  </div>
                )}

                {loadingHistory && hasActiveConversation && (
                  <div className="text-sm text-gray-500 dark:text-slate-400">Loading messages...</div>
                )}

                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    text={message.text}
                    senderName={message.sender?.name || "User"}
                    isMe={message.sender?.id === authUser?.id}
                    timestamp={formatMessageTime(message.created_at)}
                    pending={Boolean(message.optimistic)}
                  />
                ))}

                {isPeerTyping && hasActiveConversation && (
                  <div className="text-xs text-gray-500 dark:text-slate-400">The other user is typing...</div>
                )}
              </div>
            )}

            <AnimatePresence>
              {sideView !== "none" && hasActiveConversation && activePartnerProfile && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 z-20 bg-white dark:bg-slate-900"
                >
                  {sideView === "profile" && (
                    <UserProfileView
                      person={activePartnerProfile}
                      onBack={handleBackToChat}
                      onRate={() => setActiveModal("rate")}
                    />
                  )}
                  {sideView === "progress" && (
                    <GoalProgressView
                      personName={
                        activeConversation ? getConversationName(activeConversation) : "User"
                      }
                      onBack={handleBackToChat}
                      onReport={() => setActiveModal("report")}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
            <AnimatePresence>
              {inputPopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-16 left-4 bg-white dark:bg-slate-800 shadow shadow-[#A3CBFA26] rounded-lg border border-[#CDDAE9] dark:border-slate-700 p-2 w-40 z-10"
                >
                  <button
                    onClick={() => {
                      setInputPopoverOpen(false);
                      setActiveModal("create_goal");
                    }}
                    className="flex items-center w-full p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-slate-200 rounded-md text-left"
                  >
                    <CheckCircle size={16} className="text-blue-500 mr-2" />
                    Create goal
                  </button>
                  <button className="flex items-center w-full p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-slate-200 rounded-md text-left">
                    <FileText size={16} className="text-gray-500 dark:text-slate-400 mr-2" /> File
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  hasActiveConversation && setInputPopoverOpen(!inputPopoverOpen)
                }
                disabled={!hasActiveConversation}
                className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-[#3D3D3D] dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
              </button>
              <button className="text-[#3D3D3D] dark:text-slate-300 hover:text-gray-600 dark:hover:text-slate-200 hidden md:block">
                <Mic strokeWidth={1.5} size={20} />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                disabled={!activeConversationId}
                placeholder={
                  activeConversationId ? "Type a message" : "Select a conversation"
                }
                className="h-full flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-0 text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 disabled:text-gray-400 dark:disabled:text-slate-500"
              />
              <button
                disabled={!activeConversationId || sending}
                onClick={() => void handleSend()}
                className="p-2 bg-blue-200 dark:bg-blue-900/40 rounded-lg text-[#3D3D3D] dark:text-slate-100 hover:bg-[#B6D8FF] dark:hover:bg-blue-900/60 transition-colors disabled:opacity-60"
              >
                <Send size={20} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreateGoalModal
        isOpen={activeModal === "create_goal"}
        onClose={() => setActiveModal("none")}
      />
      <RateUserModal
        isOpen={activeModal === "rate"}
        onClose={() => setActiveModal("none")}
      />
      <ReportUserModal
        isOpen={activeModal === "report"}
        onClose={() => setActiveModal("none")}
      />
      <VideoCallOverlay isOpen={vidCall} onMinimize={() => setVidCall(!vidCall)} />
    </>
  );
};

const MessageBubble = ({
  text,
  senderName,
  isMe,
  timestamp,
  pending,
}: {
  text: string;
  senderName: string;
  isMe: boolean;
  timestamp: string;
  pending: boolean;
}) => {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-[#E6F0FD] text-[#1F2937] flex items-center justify-center text-xs font-semibold">
        {getInitials(isMe ? "Me" : senderName)}
      </div>
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">
            {isMe ? "Me" : senderName}
          </span>
          <span className="text-xs text-gray-400 dark:text-slate-500">{timestamp}</span>
          {pending && <span className="text-xs text-gray-400 dark:text-slate-500">sending...</span>}
        </div>
        <div className="text-sm text-gray-800 dark:text-slate-200">{text}</div>
      </div>
    </div>
  );
};
