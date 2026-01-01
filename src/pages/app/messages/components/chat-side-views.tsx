// src/components/chat/ChatSideViews.tsx
import React, { useState } from "react";
import { ChevronLeft, Star, MoreVertical } from "lucide-react";
import { Person } from "@/constants/goals-data";
import Button from "@/components/core/buttons";
import { ArrowLeft, QuoteDown } from "iconsax-reactjs";
import { PiTagSimpleDuotone } from "react-icons/pi";

import {
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Mic,
  FileText,
  Download,
  Share2,
  AlignRight, // For the sort icon
} from "lucide-react";

// --- Types & Mock Data ---
type FileType = "video" | "image" | "link" | "audio" | "doc";

interface SharedFile {
  id: string;
  title: string;
  date: string;
  time: string;
  type: FileType;
}

const SHARED_FILES_MOCK: SharedFile[] = [
  {
    id: "1",
    title: "Shared screen",
    date: "4th Dec",
    time: "3:00pm",
    type: "video",
  },
  {
    id: "2",
    title: "Sketches for shared screen",
    date: "3rd Dec",
    time: "4:00am",
    type: "image",
  },
  {
    id: "3",
    title: "Tutorials",
    date: "2nd Dec",
    time: "11:00am",
    type: "link",
  },
  {
    id: "4",
    title: "Recording from Friday’s meeting",
    date: "2nd Dec",
    time: "5:00am",
    type: "audio",
  },
  {
    id: "5",
    title: "Documentation",
    date: "1st Dec",
    time: "2:00pm",
    type: "doc",
  },
];

// --- Helper to get Icon ---
const FileIcon = ({ type }: { type: FileType }) => {
  const iconProps = { size: 24, className: "text-gray-700" };

  switch (type) {
    case "video":
      return <Video {...iconProps} />;
    case "image":
      return <ImageIcon {...iconProps} />;
    case "link":
      return <LinkIcon {...iconProps} />; // Rotate icon 45deg via CSS if needed to match perfectly
    case "audio":
      return (
        <div className="border-2 border-gray-700 rounded-md p-0.5">
          <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
        </div>
      ); // Custom shape for "speaker" or use Mic
    case "doc":
      return <FileText {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
};

// --- 1. User Profile View ---
export const UserProfileView = ({
  person,
  onBack,
  onRate,
}: {
  person: Person;
  onBack: () => void;
  onRate: () => void;
}) => {
  return (
    <div className="h-full flex flex-col bg-bg-gray px-4 sm:px-20 pt-8">
      <div className=" flex justify-between items-center bg-white shadow rounded-lg p-6">
        <button
          onClick={onBack}
          className="flex items-center text-base font-semibold text-[#3D3D3D] "
        >
          <ArrowLeft className="mr-3" /> {person.name}{" "}
          <span className="text-gray-400 ml-2 text-base font-normal">
            {" "}
            • {person.age}
          </span>
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center overflow-y-auto">
        <div className="relative mb-4">
          <img
            src={person.avatarUrl}
            alt={person.name}
            className="w-32 h-32 rounded-full border-4 border-white shadow-sm"
          />
          {/* Blue dot if online */}
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></div>
        </div>

        <div className="text-center mb-6">
          <p className="text-orange-400 text-base mb-1">
            {person.compatibility}% compatible
          </p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-gray-500 text-base">Rating:</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i <= person.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full p-6 py-8 bg-white rounded-lg shadow text-sm text-gray-700 my-4">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="bg-primary-100/50 p-1 rounded-full ">
              <QuoteDown size="15" color="#A3CBFA" variant="Bold" />
            </div>
            <span className="font-semibold text-sm text-dark-gray ">
              Seeking for accountability on
            </span>
          </div>
          <span className="font-semibold text-base text-dark-gray pl-4">
            {person.seeking}
          </span>
        </div>

        <div className="w-full bg-white rounded-xl px-6 py-8 shadow ">
          <div className="flex items-center gap-1.5">
            <PiTagSimpleDuotone size={18} color="#A3CBFA" />
            <span className="font-semibold text-base text-dark-gray ">
              Interest
            </span>
          </div>
          <div className="flex flex-wrap justify-center  gap-2 my-4">
            {person.interests.map((interest) => (
              <div className="flex items-center bg-[#4E92F426] gap-1.5 px-2.5 py-1 rounded-sm">
                <interest.icon size={16} color="#141B34" variant="TwoTone" />
                <span
                  key={interest.interest}
                  className="text-xs font-medium text-gray-600 "
                >
                  {interest.interest}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-3 sm:pt-0">
          <Button variant="primary" className="w-48" onClick={onRate}>
            Rate
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- 2. Goal Progress View ---
export const GoalProgressView = ({
  personName,
  onBack,
  onReport,
}: {
  personName: string;
  onBack: () => void;
  onReport: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-bg-gray">
      <div className="p-4 flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center text-base font-semibold text-[#3D3D3D] "
        >
          <ArrowLeft className="mr-3" /> {personName}’s progress
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical size={20} className="text-gray-600" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg border border-gray-100 py-1 min-w-[100px] z-10">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onReport();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-20 mt-6 overflow-y-auto">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
          <span>📅</span> 30th March, 2025 - 30th May, 2025
        </div>

        <div className="space-y-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-lg  border border-gray-100 flex items-start justify-between"
            >
              <div>
                <p className="text-gray-700 text-sm mb-1">
                  Lorem ipsum dolor sit amet consectetur.
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-400">
                  <span>5 Apr</span> <span>01:40 PM</span>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border ${i === 1 ? "border-4 border-orange-400" : "border-gray-300"}`}
              ></div>
            </div>
          ))}
        </div>

        <div className="bg-green-50 text-green-600 text-xs font-medium px-3 py-1 rounded-full w-fit mb-4">
          1 completed
        </div>

        <div className="flex gap-2">
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            ◎ In progress
          </span>
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            ☆ Regular
          </span>
          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            Briefcase Career building
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export const SharedFilesView: React.FC = () => {
  return (
    <div className="h-full px-8 overflow-y-auto">
      {/* Filter/Sort Header */}
      <div className="flex justify-end mb-4">
        <button className="flex items-center gap-2 text-base font-medium text-[#1E1E1E] hover:text-gray-600">
          Name
          <AlignRight size={24} className="rotate-180" />{" "}
          {/* Rotated to match the 'sort' lines icon */}
        </button>
      </div>

      {/* Files List */}
      <div className="space-y-1">
        {SHARED_FILES_MOCK.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between bg-white p-4 rounded-md hover:shadow transition-shadow"
          >
            {/* Icon & Details */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center">
                {/* Custom audio icon logic if standard Mic doesn't fit, otherwise generic icons */}
                {file.type === "audio" ? (
                  <Mic size={24} className="text-gray-700" />
                ) : (
                  <FileIcon type={file.type} />
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#1E1E1E] ">
                  {file.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {file.date} <span className="ml-2">{file.time}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 pr-4">
              <button className="flex flex-col items-center gap-1 group">
                <Download
                  size={20}
                  className="text-gray-600 group-hover:text-blue-600"
                />
                <span className="text-[10px] text-gray-500 group-hover:text-blue-600">
                  Download
                </span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <Share2
                  size={20}
                  className="text-gray-600 group-hover:text-blue-600"
                />
                <span className="text-[10px] text-gray-500 group-hover:text-blue-600">
                  Share
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
