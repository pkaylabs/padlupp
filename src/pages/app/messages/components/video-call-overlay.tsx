// src/components/videocall/VideoCallOverlay.tsx
import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Settings,
  Users,
  PhoneOff,
  Send,
  Headphones,
  X,
  Minimize2,
  ChevronRight,
  Copy,
  MessageSquare,
  Captions,
  Globe,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cs";
import { Modal } from "@/components/core/modal";

interface VideoCallOverlayProps {
  isOpen: boolean;
  onMinimize: () => void;
}

export const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({
  isOpen,
  onMinimize,
}) => {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [activePopup, setActivePopup] = useState<
    "settings" | "screenshare" | null
  >(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-gray-50 flex flex-col">
      {/* --- HEADER --- */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-blue-600 font-medium">
          <span>Ongoing video call</span>
          <Headphones size={16} />
        </div>
        <button
          onClick={onMinimize}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <Minimize2 size={20} />
        </button>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: VIDEO AREA */}
        <div className="flex-1 p-4 flex flex-col relative">
          {/* Main Video Container */}
          <div className="flex-1 bg-black rounded-2xl overflow-hidden relative group">
            {/* Main Participant Image */}
            <img
              src="https://placehold.co/1200x800/222/999?text=Video+Feed"
              alt="Main Speaker"
              className="w-full h-full object-cover opacity-90"
            />

            {/* Floating Participant Stack */}
            <div className="absolute top-4 right-4 flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-lg relative bg-gray-800"
                >
                  <img
                    src={`https://placehold.co/100x100/33${i}333/FFF?text=P${i}`}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={cn(
                      "absolute bottom-1 right-1 p-1 rounded-full",
                      i % 2 === 0 ? "bg-red-500" : "bg-green-500"
                    )}
                  >
                    {i % 2 === 0 ? (
                      <MicOff size={10} className="text-white" />
                    ) : (
                      <Mic size={10} className="text-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Controls (Floating) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <ControlBtn
                icon={MonitorUp}
                active={activePopup === "screenshare"}
                onClick={() => setActivePopup("screenshare")}
              />
              <ControlBtn
                icon={cameraOn ? Video : VideoOff}
                onClick={() => setCameraOn(!cameraOn)}
              />
              <ControlBtn
                icon={micOn ? Mic : MicOff}
                onClick={() => setMicOn(!micOn)}
              />

              <div className="relative">
                <ControlBtn
                  icon={Settings}
                  active={activePopup === "settings"}
                  onClick={() =>
                    setActivePopup(
                      activePopup === "settings" ? null : "settings"
                    )
                  }
                />
                {/* Settings Menu Popover */}
                <AnimatePresence>
                  {activePopup === "settings" && (
                    <SettingsMenu onClose={() => setActivePopup(null)} />
                  )}
                </AnimatePresence>
              </div>

              <ControlBtn icon={Users} />

              <button
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-lg transition-transform active:scale-95"
                onClick={onMinimize} // Or end call logic
              >
                <PhoneOff size={24} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: CHAT SIDEBAR */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100 font-semibold text-gray-800">
            Thread
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <ChatMessage
              sender="Jade"
              time="11:17am"
              isMe={false}
              text="Hey Paul! How's it going? I've been working on the wireframes for the new project."
            />
            <ChatMessage
              sender="Me"
              time="11:18am"
              isMe={true}
              text="Hey Jade! I'm good, thanks. Yeah, I've reviewed them. They're looking solid!"
            />
            <ChatMessage
              sender="Jade"
              time="11:19am"
              isMe={false}
              text="Thanks, Paul! I tried to keep it user-friendly."
            />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Type a message"
                className="w-full pl-4 pr-10 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <ScreenShareModal
        isOpen={activePopup === "screenshare"}
        onClose={() => setActivePopup(null)}
      />
    </div>
  );
};

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

const ControlBtn = ({ icon: Icon, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-10 h-10 flex items-center justify-center rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95",
      active
        ? "bg-blue-100 text-blue-600"
        : "bg-gray-600/80 text-white hover:bg-gray-500/90"
    )}
  >
    <Icon size={20} />
  </button>
);

const ChatMessage = ({ sender, time, text, isMe }: any) => (
  <div className="flex gap-3">
    <img
      src={`https://placehold.co/40x40/${isMe ? "336699" : "EEDDAA"}/FFF?text=${sender[0]}`}
      className="w-8 h-8 rounded-full mt-1"
    />
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-semibold text-sm text-gray-900">{sender}</span>
        <span className="text-xs text-gray-400">{time}</span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  </div>
);

// --- SETTINGS MENU (Popover) ---
const SettingsMenu = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute bottom-14 left-1/2 -translate-x-1/2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden text-sm font-medium text-gray-700"
  >
    <button className="w-full px-4 py-2.5 hover:bg-gray-50 text-left flex items-center gap-3">
      <Users size={16} /> Invite people
    </button>
    <button className="w-full px-4 py-2.5 hover:bg-gray-50 text-left flex items-center gap-3">
      <Copy size={16} /> Copy call link
    </button>
    <button className="w-full px-4 py-2.5 hover:bg-gray-50 text-left flex items-center gap-3 border-b border-gray-100">
      <MessageSquare size={16} /> Go to direct message
    </button>

    {/* Section 2 */}
    <div className="py-1 border-b border-gray-100">
      <button className="w-full px-4 py-2.5 hover:bg-gray-50 text-left flex items-center justify-between">
        <span className="flex items-center gap-3">
          <Captions size={16} /> Show captions
        </span>
        <ChevronRight size={14} className="text-gray-400" />
      </button>
      <button className="w-full px-4 py-2.5 hover:bg-gray-50 text-left flex items-center justify-between">
        <span className="flex items-center gap-3">
          <Globe size={16} /> Choose language
        </span>
        <ChevronRight size={14} className="text-gray-400" />
      </button>
    </div>

    <button className="w-full px-4 py-2.5 hover:bg-gray-50 text-left text-gray-500 font-normal">
      Hide self-view
    </button>
    <button className="w-full px-4 py-2.5 hover:bg-gray-50 text-left text-gray-500 font-normal">
      Video background
    </button>
  </motion.div>
);

// --- SCREEN SHARE MODAL ---
const ScreenShareModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [selected, setSelected] = useState<number | null>(null);

  const ScreenOption = ({ id, label, color }: any) => (
    <div
      onClick={() => setSelected(id)}
      className={cn(
        "cursor-pointer rounded-lg p-2 border-2 transition-all text-center group",
        selected === id
          ? "border-blue-500 bg-blue-50"
          : "border-transparent hover:bg-gray-50"
      )}
    >
      <div
        className={cn(
          "w-full h-32 rounded-md mb-2 shadow-sm group-hover:shadow-md transition-all",
          color
        )}
      >
        {/* Fake UI lines inside screen preview */}
        <div className="w-full h-full flex flex-col p-2 gap-1">
          <div className="w-full h-2 bg-white/50 rounded-full" />
          <div className="flex gap-1 h-full">
            <div className="w-1/3 h-full bg-white/30 rounded" />
            <div className="w-2/3 h-full bg-white/30 rounded" />
          </div>
        </div>
      </div>
      <span
        className={cn(
          "text-sm font-medium",
          selected === id ? "text-blue-600" : "text-gray-600"
        )}
      >
        {label}
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="max-w-3xl w-full p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Share your screen
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <ScreenOption id={1} label="Entire screen" color="bg-gray-200" />
        <ScreenOption
          id={2}
          label="Stripe atlas | Land..."
          color="bg-indigo-100"
        />
        <ScreenOption id={3} label="Paddlupp -Figma" color="bg-pink-100" />
      </div>

      {/* Only needed if you want to confirm, otherwise clicking usually starts it */}
      {/* <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">Share</button>
      </div> */}
    </Modal>
  );
};
