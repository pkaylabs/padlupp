import {
  CHAT_MOCK_DATA,
  CURRENT_USER_ID,
  Message,
} from "@/constants/chat-mock";
import { PEOPLE_MOCK } from "@/constants/goals-data";
import { useMemo, useState } from "react";
import {
  CreateGoalModal,
  RateUserModal,
  ReportUserModal,
} from "./components/modals";
import {
  CheckCircle,
  FileText,
  Mic,
  Phone,
  Plus,
  Search,
  Send,
  Video,
} from "lucide-react";
import { cn } from "@/utils/cs";
import { AnimatePresence, motion } from "framer-motion";
import {
  GoalProgressView,
  SharedFilesView,
  UserProfileView,
} from "./components/chat-side-views";
import { ArrowLeft2, ArrowRight2, CallCalling } from "iconsax-reactjs";
import { VideoCallOverlay } from "./components/video-call-overlay";

type SideView = "none" | "profile" | "progress";
type ActiveModal = "none" | "create_goal" | "rate" | "report";

export const MessagesPage = () => {
  const [activeConvId, setActiveConvId] = useState(CHAT_MOCK_DATA[0].id);
  const [activeTab, setActiveTab] = useState<"Activities" | "Shared">(
    "Activities"
  );
  const [sideView, setSideView] = useState<SideView>("none");
  const [activeModal, setActiveModal] = useState<ActiveModal>("none");
  const [inputPopoverOpen, setInputPopoverOpen] = useState(false);
  const [vidCall, setVidCall] = useState(false);

  const activeConv = useMemo(
    () => CHAT_MOCK_DATA.find((c) => c.id === activeConvId),
    [activeConvId]
  );

  // Mock Person data for the profile view (Jade)
  const activePerson = PEOPLE_MOCK[0];

  const handleOpenProfile = () => setSideView("profile");
  const handleOpenProgress = () => setSideView("progress");
  const handleBackToChat = () => setSideView("none");

  return (
    <>
      <div className="font-monts w-full flex h-[92vh] bg-white overflow-hidden">
        {/* --- LEFT SIDEBAR --- */}
        <div className="w-96 border-r overflow-y-auto border-gray-200 flex flex-col">
          {/* Header / Breadcrumb mock */}
          <div className="h-16 flex items-center px- text-gray-500 text-sm font-medium">
            <ArrowLeft2 size="16" color="#636363" />
            <ArrowRight2 size="16" color="#636363" className="mx-2" />
            <span className="cursor-pointer hover:text-gray-900">
              Goals
            </span>{" "}
            <span className="mx-2">/</span>
            <span className="cursor-pointer hover:text-gray-900">
              Invitation
            </span>{" "}
            <span className="mx-2">/</span>
            <span className="text-gray-900">Messages</span>
          </div>

          {/* Search */}
          <div className="pr-2 mb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#CDDAE9] rounded-xl text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {CHAT_MOCK_DATA.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setSideView("none");
                }}
                className={cn(
                  "flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors relative",
                  activeConvId === conv.id ? "bg-primary-100/50" : ""
                )}
              >
                {/* Avatar Logic */}
                <div className="relative mr-3 shrink-0">
                  {conv.type === "group" ? (
                    <div className="flex -space-x-4 overflow-hidden w-15 h-15">
                      {conv.members?.slice(0, 2).map((m, i) => (
                        <img
                          key={i}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                          src={m.avatarUrl}
                          alt=""
                        />
                      ))}
                    </div>
                  ) : (
                    <img
                      src={conv.avatarUrl}
                      alt={conv.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <h3 className="text-sm font-medium text-dark-gray truncate">
                      {conv.name}
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-[#616161] truncate">
                    {conv.messages[conv.messages.length - 1].text}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 items-end">
                  <span className="font-sans text-sm text-[#929191] ">
                    17:36
                  </span>
                  {conv.unreadCount > 0 && (
                    <div className=" bg-blue-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- MAIN CHAT AREA --- */}
        <div className="flex-1 relative flex flex-col ">
          {/* Chat Header */}
          <div className="border-b border-gray-200 flex items-center justify-between py-2.5 px-6">
            <div
              className="flex items-center cursor-pointer"
              onClick={handleOpenProfile}
            >
              {activeConv?.type === "group" ? (
                <div className="flex -space-x-2 mr-3">
                  {activeConv.members?.slice(0, 4).map((m, i) => (
                    <img
                      key={i}
                      className="h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src={m.avatarUrl}
                      alt=""
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={activeConv?.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-[#666668] text-sm">
                {activeConv?.name}
              </h2>
              <p className="text-xs text-green-500 flex items-center">
                {activeConv?.type === "personal"
                  ? activeConv.isOnline
                    ? "Online"
                    : "Offline"
                  : "2 online"}
              </p>
            </div>

            <div className="flex items-center text-gray-400">
              <div
                onClick={() => setVidCall(true)}
                className="size-12 flex justify-center items-center cursor-pointer bg-white hover:bg-[#4E92F421] rounded-md "
              >
                <CallCalling
                  size={20}
                  className="hover:text-gray-600 text-[#130F26] cursor-pointer"
                />
              </div>
              <div
                onClick={() => setVidCall(true)}
                className="size-12 flex justify-center  items-center cursor-pointer bg-white hover:bg-[#4E92F421] rounded-md "
              >
                <Video
                  size={24}
                  strokeWidth={1.5}
                  className="hover:text-gray-600 text-[#130F26] cursor-pointer"
                />
              </div>
              <div className="size-12 flex justify-center items-center cursor-pointer bg-white hover:bg-[#4E92F421] rounded-md ">
                <Search
                  size={20}
                  className="hover:text-gray-600 text-[#130F26] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sticky top-2.5 flex gap-6 px-6 py-4 text-sm font-medium bg-bg-gray">
            <button
              onClick={() => setActiveTab("Activities")}
              className={
                activeTab === "Activities" ? "text-gray-900" : "text-gray-400"
              }
            >
              Activities
            </button>
            <button
              onClick={() => setActiveTab("Shared")}
              className={
                activeTab === "Shared" ? "text-gray-900" : "text-gray-400"
              }
            >
              Shared
            </button>
          </div>

          {/* Messages Area or Side View Overlay */}
          <div className="flex-1 overflow-y-auto scroll-smooth bg-bg-gray">
            {activeTab === "Shared" ? (
              <div className=" text-center text-gray-500">
                <SharedFilesView />
              </div>
            ) : (
              <div className="h-full p-6 space-y-6">
                {/* Group Welcome Banner */}
                {activeConv?.type === "group" ? (
                  <div className="text-center mb-4">
                    <span className="text-base text-[#3D3D3D] font-semibold">
                      👋 Welcome to the {activeConv.name}
                    </span>
                    <div className="text-center mt-2">
                      <button
                        onClick={handleOpenProgress}
                        className="text-sm text-primary-500 hover:underline"
                      >
                        Goal details
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col justify-center items-center">
                    <p className="border border-dashed border-[#CDDAE9] rounded-lg p-3 bg-white text-sm text-gray-600 w-fit">
                      You started a conversation with Jade .Lorem ipsum dolor
                      sit amet consectetur.
                    </p>
                  </div>
                )}

                {activeConv?.messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMe={msg.senderId === CURRENT_USER_ID}
                    onOpenProgress={handleOpenProgress}
                    personAvatar={activeConv.avatarUrl}
                  />
                ))}
              </div>
            )}

            {/* --- SIDE VIEW OVERLAY (Profile/Progress) --- */}
            <AnimatePresence>
              {sideView !== "none" && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 z-20 bg-white"
                >
                  {sideView === "profile" && (
                    <UserProfileView
                      person={activePerson}
                      onBack={handleBackToChat}
                      onRate={() => setActiveModal("rate")}
                    />
                  )}
                  {sideView === "progress" && (
                    <GoalProgressView
                      personName={activeConv?.name || "User"}
                      onBack={handleBackToChat}
                      onReport={() => setActiveModal("report")}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            {/* Popover for Create Goal */}
            <AnimatePresence>
              {inputPopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-16 left-4 bg-white shadow shadow-[#A3CBFA26] rounded-lg border border-[#CDDAE9] p-2 w-40 z-10"
                >
                  <button
                    onClick={() => {
                      setInputPopoverOpen(false);
                      setActiveModal("create_goal");
                    }}
                    className="flex items-center w-full p-2 hover:bg-gray-50 text-sm text-gray-700 rounded-md text-left"
                  >
                    <CheckCircle size={16} className="text-blue-500 mr-2" />{" "}
                    Create goal
                  </button>
                  <button className="flex items-center w-full p-2 hover:bg-gray-50 text-sm text-gray-700 rounded-md text-left">
                    <FileText size={16} className="text-gray-500 mr-2" /> File
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setInputPopoverOpen(!inputPopoverOpen)}
                className="p-2 bg-gray-100 rounded-lg text-[#3D3D3D] hover:bg-gray-200 transition-colors"
              >
                <Plus size={20} />
              </button>
              <button className="text-[#3D3D3D] hover:text-gray-600">
                <Mic strokeWidth={1.5} size={20} />
              </button>
              <input
                type="text"
                placeholder="Type a message"
                className="h-full flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-0 placeholder:text-gray-400"
              />
              <button className="p-2 bg-blue-200 rounded-lg text-[#3D3D3D] hover:bg-[#B6D8FF] transition-colors">
                <Send size={20} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
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
      <VideoCallOverlay
        isOpen={vidCall}
        onMinimize={() => setVidCall(!vidCall)}
      />
    </>
  );
};

// --- Helper Component: Message Bubble ---
const MessageBubble = ({
  message,
  isMe,
  onOpenProgress,
  personAvatar,
}: {
  message: Message;
  isMe: boolean;
  onOpenProgress: () => void;
  personAvatar: string;
}) => {
  // System/Goal Messages
  if (message.type === "goal_created" || message.type === "task_completed") {
    return (
      <div className="flex gap-3">
        <img
          src={
            isMe ? "https://placehold.co/100/336699/FFF?text=Me" : personAvatar
          }
          className="w-8 h-8 rounded-full"
          alt=""
        />
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">
              {isMe ? "Me" : "Jade"}
            </span>
            <span className="text-xs text-gray-400">{message.timestamp}</span>
          </div>
          {message.type === "goal_created" ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-white text-sm text-gray-600 w-fit">
              <span className="text-blue-500">@{isMe ? "Me" : "Jade"}</span>{" "}
              just created a goal{" "}
              <button
                onClick={onOpenProgress}
                className="text-blue-500 hover:underline ml-1"
              >
                {message.goalTitle}
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-white text-sm text-gray-600 w-fit">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-blue-500">@{isMe ? "Me" : "Jade"}</span>{" "}
                  just completed a subtask!
                </div>
                <span className="text-blue-300 text-lg">👍</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 text-gray-800">
                Almost there! A have checked off their tasks for today! 🔥 Let's
                keep it up!
                <img
                  src={personAvatar}
                  className="w-5 h-5 rounded-full mt-2"
                  alt=""
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard Text Messages
  return (
    <div className="flex gap-3">
      <img
        src={
          isMe ? "https://placehold.co/100/336699/FFF?text=Me" : personAvatar
        }
        className="w-8 h-8 rounded-full object-cover"
        alt=""
      />
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-900">
            {isMe ? "Me" : message.senderId === "u2" ? "Jade" : "User"}
          </span>
          <span className="text-xs text-gray-400">{message.timestamp}</span>
        </div>
        <div className="text-sm text-gray-800">{message.text}</div>
      </div>
    </div>
  );
};
