import React, { useState, useRef } from "react";
import { Edit2, ChevronRight, X, Plus, Image as ImageIcon } from "lucide-react";
import { cn } from "@/utils/cs";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/core/buttons";
import { Modal } from "@/components/core/modal";
import { QuoteDown } from "iconsax-reactjs";
import { PiTagSimpleDuotone } from "react-icons/pi";

const INTERESTS_LIST = [
  "Painting",
  "Sculpting",
  "Writing",
  "Drawing",
  "Journaling",
  "Filmmaking",
  "Photography",
  "Sewing",
  "Animation",
  "Hiking",
  "Pottery",
  "Scrapbooking",
  "Running",
  "Stargazing",
  "Cycling",
  "Weightlifting",
  "Pilates",
  "Soccer",
  "CrossFit",
  "Tennis",
  "Boxing",
  "Coding/Programming",
  "Yoga",
  "Swimming",
  "3D Printing",
  "Web Development",
  "Theater",
  "Basketball",
  "Singing",
  "Dancing",
];

const PROMPTS_LIST = [
  "A goal I'm working on right now is...",
  "My dream achievement is...",
  "One thing I want to master this year is...",
  "I feel most accomplished when I...",
  "My favorite way to stay focused is...",
  "The best productivity hack I've learned is...",
  "I stay inspired by...",
];

export const ProfileSettings: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "none" | "prompt_select" | "prompt_answer" | "interest"
  >("none");

  // Data State
  const [selectedPrompt, setSelectedPrompt] = useState(
    "I'm looking for a buddy who"
  );
  const [promptAnswer, setPromptAnswer] = useState(
    "Shares similar goals, and can help keep me accountable as we work towards success together!"
  );
  const [interests, setInterests] = useState([
    "Hiking",
    "Swimming",
    "Python",
    "Travel",
  ]);
  const [tempAnswer, setTempAnswer] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
    setTempAnswer("");
    setActiveModal("prompt_answer");
  };

  const handlePromptSave = () => {
    setPromptAnswer(tempAnswer);
    setActiveModal("none");
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  return (
    <div className="flex-1 p-8 flex justify-center items-start h-full overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl overflow-hidden mt-10">
        {/* Header */}
        <div className="w-full flex gap-1.5 items-center bg-white shadow p-6 rounded-lg">
          <span className="font-semibold text-[#3D3D3D] ">John Doe</span>
          <span className="size-1 rounded-full bg-primary-600" />
          <span className=" text-gray-500">25</span>
        </div>

        {/* Profile Image */}
        <div className="flex justify-center mt-6 mb-8 relative">
          <div className="relative group overflow-hidden size-32 rounded-full">
            <img
              src="https://placehold.co/150x150/333/FFF?text=JD"
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 left-0 bg-black/50 text-white h-8 flex items-center justify-center rounded-b-full backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <Edit2 size={14} />
              </button>
            )}
            <input type="file" ref={fileInputRef} className="hidden" />
          </div>
        </div>

        {/* Prompt Section */}
        <div className="px-6 mb-4">
          <div className="w-full p-6 py-8 bg-white rounded-lg shadow text-sm text-gray-700 my-4 relative group">
            <div className="flex gap-2 mb-2">
              <div className="bg-primary-100/50 p-1 rounded-full ">
                <QuoteDown size="15" color="#A3CBFA" variant="Bold" />
              </div>
              <h3 className="font-semibold text-sm text-dark-gray">
                {selectedPrompt}
              </h3>
            </div>
            <p className="text-gray-600 text-sm pl-6 leading-relaxed">
              {promptAnswer ||
                (isEditing ? (
                  <span className="text-gray-400 italic">Tap to answer...</span>
                ) : (
                  ""
                ))}
            </p>

            {isEditing && (
              <button
                onClick={() => setActiveModal("prompt_select")}
                className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center"
              >
                <div className="bg-white px-4 py-2 rounded-full shadow-sm text-xs font-bold text-gray-700">
                  {promptAnswer ? "Edit Prompt" : "Select a prompt"}
                </div>
              </button>
            )}
          </div>

          {/* Dashed Placeholder if editing and no prompt */}
          {isEditing && !promptAnswer && (
            <button
              onClick={() => setActiveModal("prompt_select")}
              className="w-full mt-4 border-2 border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-center text-gray-500 text-sm hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              Select a prompt
            </button>
          )}
        </div>

        {/* Interests Section */}

        <div className=" w-full bg-white rounded-xl px-6 py-8 ">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5">
              <PiTagSimpleDuotone size={18} color="#A3CBFA" />
              <span className="font-semibold text-base text-dark-gray ">
                Interest
              </span>
            </div>
            {isEditing && (
              <button
                onClick={() => setActiveModal("interest")}
                className="text-gray-400 hover:text-blue-500"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((int) => (
              <span
                key={int}
                className="bg-[#4E92F426] text-xs font-medium text-gray-600  px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                {/* Map icons if you have them, otherwise generic */}
                {int}
              </span>
            ))}
          </div>
        </div>

        {/* Edit Button */}
        <div className="px-6 pb-8">
          <Button
            variant="primary"
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-60 -mt-8 text-white text-base font-semibold border-none bg-linear-to-r 
        from-[#4E92F4] to-[#7938BE] hover:opacity-90 rounded-full "
            size="md"
            onClick={() =>
              isEditing ? setIsEditing(false) : setIsEditing(true)
            }
          >
            {isEditing ? "Save" : "Edit Profile"}
          </Button>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Prompt Selection Modal */}
      <Modal
        isOpen={activeModal === "prompt_select"}
        onClose={() => setActiveModal("none")}
        className="w-full max-w-md p-0 overflow-hidden rounded-2xl h-[600px] flex flex-col top-1/2 -translate-y-1/2 "
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <button onClick={() => setActiveModal("none")}>
            <X size={20} className="text-gray-400" />
          </button>
          <h2 className="font-bold text-gray-800">Select Prompt</h2>
          <div className="w-5" />
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {PROMPTS_LIST.map((p, i) => (
            <button
              key={i}
              onClick={() => handlePromptSelect(p)}
              className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-50 text-sm font-medium text-gray-700 last:border-0"
            >
              {p}
            </button>
          ))}
        </div>
      </Modal>

      {/* 2. Answer Prompt Modal */}
      <Modal
        isOpen={activeModal === "prompt_answer"}
        onClose={() => setActiveModal("none")}
        className="w-full max-w-md p-6 rounded-2xl top-1/2 -translate-y-1/2"
      >
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setActiveModal("none")}>
            <X size={20} className="text-gray-400" />
          </button>
          <h2 className="font-bold text-gray-800">Answer Prompt</h2>
          <div className="w-5" />
        </div>
        <div className="mb-4">
          <p className="text-sm font-bold text-gray-900 mb-2">
            {selectedPrompt}
          </p>
          <textarea
            value={tempAnswer}
            onChange={(e) => setTempAnswer(e.target.value)}
            maxLength={150}
            placeholder="Write your answer here..."
            className="w-full h-32 p-3 bg-gray-50 rounded-xl border-none resize-none text-sm focus:ring-2 focus:ring-blue-100"
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {tempAnswer.length}/150
          </div>
        </div>
        <Button variant="primary" className="w-full" onClick={handlePromptSave}>
          Done
        </Button>
      </Modal>

      {/* 3. Interest Selection Modal */}
      <Modal
        isOpen={activeModal === "interest"}
        onClose={() => setActiveModal("none")}
        className="w-full max-w-md p-0 rounded-2xl h-[600px] flex flex-col top-1/2 -translate-y-1/2"
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="w-10" /> {/* spacer */}
          <h2 className="font-bold text-gray-800">Edit your interest</h2>
          <button
            onClick={() => setActiveModal("none")}
            className="text-blue-500 font-medium text-sm"
          >
            Done
          </button>
        </div>
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-200 rounded-full" /> Interest
            </span>
            <span className="text-xs text-gray-500">{interests.length}/6</span>
          </div>
          <p className="text-xs text-gray-500">
            Select interest you want to share with buddies. Select a minimum of
            3.
          </p>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {INTERESTS_LIST.map((int) => (
              <button
                key={int}
                onClick={() => toggleInterest(int)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-medium border transition-all",
                  interests.includes(int)
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {int}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
