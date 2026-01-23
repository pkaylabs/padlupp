"use client";

import React, { useState, useRef } from "react";
import {
  Edit2,
  ChevronRight,
  X,
  ArrowLeft,
  ChevronLeft,
  Mail,
  Phone,
  Globe,
  Share2,
  Bell,
  ChevronsUp,
  Search,
  ExternalLink,
  User,
  Check,
} from "lucide-react";
import { QuoteDown } from "iconsax-reactjs";
import { PiTagSimpleDuotone } from "react-icons/pi";
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import Button from "@/components/core/buttons";
import { Modal } from "@/components/core/modal";
import TextInput from "@/components/core/inputs";
import { DualRangeSlider } from "./components/dual-range-slider";
import { useLogout } from "./hooks/useLogout";
// import { StyledSwitch } from "@/routes/_app/-components/toggle"; // Replaced with inline Switch

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants ---
const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Russian",
  "Portuguese",
  "Italian",
];

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

// --- Sub-Components ---

const StyledSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={cn(
      "w-11 h-6 bg-gray-200 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none",
      checked ? "bg-blue-600" : "bg-gray-200",
    )}
  >
    <span
      className={cn(
        "translate-x-1 inline-block w-4 h-4 transform bg-white rounded-full transition duration-200 ease-in-out",
        checked ? "translate-x-6" : "translate-x-1",
      )}
    />
  </button>
);

// --- PROFILE SETTINGS COMPONENT ---

interface ProfileSettingsProps {
  onMobileBack?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onMobileBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "none" | "prompt_select" | "prompt_answer" | "interest"
  >("none");

  // Data State
  const [selectedPrompt, setSelectedPrompt] = useState(
    "I'm looking for a buddy who",
  );
  const [promptAnswer, setPromptAnswer] = useState(
    "Shares similar goals, and can help keep me accountable as we work towards success together!",
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
    <div className="flex-1 p-0 md:p-8 flex flex-col items-center h-full overflow-y-auto bg-gray-50 md:bg-white">
      {/* Mobile Header */}
      {onMobileBack && (
        <div className="w-full bg-white p-4 flex items-center gap-3 border-b border-gray-200 md:hidden sticky top-0 z-10">
          <button onClick={onMobileBack}>
            <ArrowLeft className="text-gray-600" size={24} />
          </button>
          <span className="font-semibold text-lg text-gray-800">
            Edit Profile
          </span>
        </div>
      )}

      <div className="relative w-full max-w-lg md:rounded-xl overflow-hidden md:mt-10 pb-24 md:pb-0 bg-white min-h-screen md:min-h-0">
        {/* Profile Card Header */}
        <div className="w-full flex gap-1.5 items-center bg-white shadow-sm md:shadow p-6 md:rounded-lg border-b md:border-none border-gray-100">
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
          <div className="w-full p-6 py-8 bg-white md:border border-gray-100 md:border-none rounded-lg shadow-sm md:shadow text-sm text-gray-700 my-4 relative group ring-1 ring-black/5 md:ring-0">
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
        <div className="w-full bg-white rounded-xl px-6 py-8">
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
                {int}
              </span>
            ))}
          </div>
        </div>

        {/* Edit Button - Fixed at bottom on mobile if needed, or inline */}
        <div className="px-6 pb-8 mt-4 md:mt-0">
          <Button
            variant="primary"
            className="w-full md:w-60 md:absolute md:bottom-2 md:left-1/2 md:-translate-x-1/2 md:-mt-8 text-white text-base font-semibold border-none bg-linear-to-r 
        from-[#4E92F4] to-[#7938BE] hover:opacity-90 rounded-full shadow-lg md:shadow-none"
            size="md"
            onClick={() =>
              isEditing ? setIsEditing(false) : setIsEditing(true)
            }
          >
            {isEditing ? "Save Profile" : "Edit Profile"}
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
                    : "border-gray-200 text-gray-600 hover:border-gray-300",
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

// --- SETTINGS SIDEBAR COMPONENT ---

type SettingsView =
  | "menu"
  | "email"
  | "phone"
  | "language"
  | "social"
  | "display_language"
  | "push_notifications"
  | "email_notifications";
type Theme = "system" | "light" | "dark";

interface SettingsSidebarProps {
  onMobileProfileClick?: () => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  onMobileProfileClick,
}) => {
  const [view, setView] = useState<SettingsView>("menu");
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 35]);

  const [theme, setTheme] = useState<Theme>("system");
  const [displayLanguage, setDisplayLanguage] = useState("English");
  const [searchQuery, setSearchQuery] = useState("");

  // Notification Settings State
  const [emailSettings, setEmailSettings] = useState({
    autoWatch: false,
    newMessages: false,
    newMatches: false,
  });

  const [pushSettings, setPushSettings] = useState({
    emailNotification: false,
  });

  // --- 1. Centralized State for API Integration ---
  const [formData, setFormData] = useState({
    email: "johndoe000@gmail.com",
    phone: "2341234567890",
    twitter: "",
    facebook: "",
    instagram: "",
    location: "Lagos, Nigeria",
  });

  const { mutate: logout, isPending } = useLogout();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log(`Field ${e.target.id} blurred:`, e.target.value);
  };

  const errors = {};
  const touched = {};

  const handleSave = (section: string) => {
    console.log(`Saving ${section}...`, formData);
  };

  // Helper for Menu Items
  const MenuItem = ({
    icon: Icon,
    label,
    value,
    onClick,
    isDestructive,
    isExternal,
    isSelected,
    hasChevron = true,
  }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between py-4 px-1 hover:bg-gray-50 transition-colors group",
        isDestructive ? "text-red-500 hover:bg-red-50" : "text-gray-700",
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon
            size={18}
            className={isDestructive ? "text-red-500" : "text-gray-500"}
          />
        )}
        <span className={cn("text-sm font-medium", !Icon && "ml-0")}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-gray-400">{value}</span>}

        {isSelected ? (
          <Check size={18} className="text-blue-500" />
        ) : isExternal ? (
          <ExternalLink
            size={16}
            className="text-gray-300 group-hover:text-gray-500"
          />
        ) : (
          hasChevron &&
          !isDestructive && (
            <ChevronRight
              size={16}
              className="text-gray-300 group-hover:text-gray-500"
            />
          )
        )}
      </div>
    </button>
  );

  const SubViewHeader = ({ title }: { title: string }) => (
    <div className="mb-6">
      <button
        onClick={() => setView("menu")}
        className="flex items-center text-sm font-bold text-gray-800 hover:text-blue-600"
      >
        <ChevronLeft size={20} className="mr-1" /> {title.toUpperCase()}
      </button>
    </div>
  );

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const SwitchItem = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-4 px-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <StyledSwitch checked={checked} onChange={onChange} />
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case "email":
        return (
          <div className="animate-in slide-in-from-left-4 fade-in duration-200">
            <SubViewHeader title="Email" />
            <div className="space-y-4">
              <TextInput
                id="email"
                label="Email Address"
                placeholder="johndoe@gmail.com"
                values={formData}
                handleChange={handleChange}
                handleBlur={handleBlur}
                errors={errors}
                touched={touched}
              />
              <button
                onClick={() => handleSave("email")}
                className="text-sm text-blue-500 font-medium"
              >
                Verify email
              </button>
            </div>
          </div>
        );
      case "phone":
        return (
          <div className="animate-in slide-in-from-left-4 fade-in duration-200">
            <SubViewHeader title="Phone Number" />
            <div className="space-y-4">
              <TextInput
                id="phone"
                label="Phone Number"
                placeholder="2341234567890"
                values={formData}
                handleChange={handleChange}
                handleBlur={handleBlur}
                errors={errors}
                touched={touched}
              />
              <button
                onClick={() => handleSave("phone")}
                className="text-sm text-blue-500 font-medium"
              >
                Verify number
              </button>
            </div>
          </div>
        );
      case "social":
        return (
          <div className="animate-in slide-in-from-left-4 fade-in duration-200">
            <SubViewHeader title="Social Media" />
            <div className="space-y-4">
              <div>
                <TextInput
                  id="twitter"
                  label="Twitter"
                  placeholder="https://twitter.com/"
                  values={formData}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
                <button className="text-xs text-blue-500 font-medium mt-2">
                  Add
                </button>
              </div>

              <div>
                <TextInput
                  id="facebook"
                  label="Facebook"
                  placeholder="https://facebook.com/"
                  values={formData}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
                <button className="text-xs text-blue-500 font-medium mt-2">
                  Add
                </button>
              </div>

              <div>
                <TextInput
                  id="instagram"
                  label="Instagram"
                  placeholder="https://instagram.com/"
                  values={formData}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
                <button
                  className="text-xs text-blue-500 font-medium mt-2"
                  onClick={() => handleSave("social")}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );

      case "push_notifications":
        return (
          <div className="animate-in slide-in-from-left-4 fade-in duration-200">
            <SubViewHeader title="Push Notification" />
            <div className="mt-2">
              <SwitchItem
                label="Push notification to email"
                checked={pushSettings.emailNotification}
                onChange={(v) =>
                  setPushSettings((s) => ({ ...s, emailNotification: v }))
                }
              />
            </div>
          </div>
        );

      case "email_notifications":
        return (
          <div className="animate-in slide-in-from-left-4 fade-in duration-200">
            <SubViewHeader title="Email" />
            <div className="mt-2 divide-y divide-gray-50">
              <SwitchItem
                label="Auto watch tasks I am involved in"
                checked={emailSettings.autoWatch}
                onChange={(v) =>
                  setEmailSettings((s) => ({ ...s, autoWatch: v }))
                }
              />
              <SwitchItem
                label="New Messages"
                checked={emailSettings.newMessages}
                onChange={(v) =>
                  setEmailSettings((s) => ({ ...s, newMessages: v }))
                }
              />
              <SwitchItem
                label="New Matches"
                checked={emailSettings.newMatches}
                onChange={(v) =>
                  setEmailSettings((s) => ({ ...s, newMatches: v }))
                }
              />
            </div>
          </div>
        );

      case "display_language":
        return (
          <div className="animate-in slide-in-from-left-4 fade-in duration-200 h-full flex flex-col">
            <SubViewHeader title="Preferred Language" />

            {/* Search Input */}
            <div className="relative mb-6">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Language List */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-1">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setDisplayLanguage(lang)}
                  className="w-full flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <span
                    className={cn(
                      "text-sm",
                      displayLanguage === lang
                        ? "font-medium text-blue-600"
                        : "text-gray-600",
                    )}
                  >
                    {lang}
                  </span>
                  {displayLanguage === lang && (
                    <Check size={16} className="text-primary-500" />
                  )}
                </button>
              ))}
              {filteredLanguages.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">
                  No languages found.
                </p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="animate-in slide-in-from-right-4 fade-in duration-200">
            {/* Mobile Only: Profile Entry Point */}
            <div className="md:hidden mb-8 bg-blue-50 rounded-lg p-3">
              <MenuItem
                icon={User}
                label="Edit Profile"
                value="Photo, Prompts, Interests"
                onClick={onMobileProfileClick}
              />
            </div>

            {/* Account Settings */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-black uppercase mb-2">
                Account Settings
              </h3>
              <div className="bg-white rounded-lg py-3 px-2">
                <MenuItem
                  icon={Mail}
                  label="Email"
                  value={
                    formData.email.length > 15
                      ? formData.email.substring(0, 15) + "..."
                      : formData.email
                  }
                  onClick={() => setView("email")}
                />
                <MenuItem
                  icon={Phone}
                  label="Phone Number"
                  value={formData.phone}
                  onClick={() => setView("phone")}
                />
                <MenuItem
                  icon={Globe}
                  label="Language"
                  value="Select"
                  onClick={() => {}}
                />
                <MenuItem
                  icon={Share2}
                  label="Social Media"
                  value="Add"
                  onClick={() => setView("social")}
                />
              </div>
            </div>

            {/* Discovery Settings */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-black uppercase mb-2">
                Discovery Settings
              </h3>
              <div className="py-3 px-2 bg-white rounded-lg ">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Location
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    {formData.location} <ChevronRight size={14} />
                  </span>
                </div>
                <div className="">
                  <span className="text-sm font-medium text-gray-700">
                    Age Preference
                  </span>
                </div>
                <div className="px-2">
                  <DualRangeSlider min={18} max={60} onChange={setAgeRange} />
                </div>
              </div>
            </div>

            {/* Notification */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-black uppercase mb-2">
                Notification
              </h3>
              <div className="bg-white rounded-lg py-3 px-2">
                <MenuItem
                  icon={Bell}
                  label="Push Notification"
                  onClick={() => setView("push_notifications")}
                />
                <MenuItem
                  icon={Mail}
                  label="Email"
                  onClick={() => setView("email_notifications")}
                />
                <MenuItem
                  icon={Globe}
                  label="Prompt Language"
                  value="Select"
                  onClick={() => {}}
                />
              </div>
            </div>

            {/* Appearance & Display (UPDATED) */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-black uppercase mb-2">
                Appearance & Display
              </h3>

              {/* Selection Items */}
              <div className="bg-white rounded-lg py-3 px-2">
                <MenuItem
                  label="System Theme"
                  isSelected={theme === "system"}
                  hasChevron={false}
                  onClick={() => setTheme("system")}
                />
                <MenuItem
                  label="Light Mode"
                  isSelected={theme === "light"}
                  hasChevron={false}
                  onClick={() => setTheme("light")}
                />
                <MenuItem
                  label="Dark Mode"
                  isSelected={theme === "dark"}
                  hasChevron={false}
                  onClick={() => setTheme("dark")}
                />
              </div>

              <div className="h-4" />

              {/* Navigation Item */}
              <MenuItem
                label="Display Language"
                value={displayLanguage}
                onClick={() => setView("display_language")}
              />
            </div>

            {/* Help & Support */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-black uppercase mb-2">
                Help & Support
              </h3>
              <div className="bg-white rounded-lg py-2 px-2">
                <MenuItem
                  label="Help & Support"
                  isExternal={true}
                  onClick={() => window.open("/support", "_blank")}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-12 border-t border-gray-100 pt-4 space-y-1">
              <button
                onClick={() => logout()}
                disabled={isPending}
                className="w-full flex items-center bg-white justify-center py-3 text-gray-900 font-medium text-sm rounded-lg"
              >
                {isPending ? "Logging out..." : "Log out"}
              </button>
              <div className="flex justify-center">
                <ChevronsUp className="text-blue-500 animate-bounce" />
              </div>
              <button className="w-full flex items-center bg-white justify-center py-3 text-red-500 font-medium text-sm rounded-lg">
                Delete Account
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="font-monts w-full h-full p-3 overflow-y-auto scroll-smooth">
      <div className="mb-8 text-primary-500">
        <ChevronsUp size={32} />
      </div>
      {renderContent()}
    </div>
  );
};

// --- MAIN PAGE ---

export const SettingsPage = () => {
  // 'sidebar' is the menu, 'profile' is the profile editor on the right
  const [mobileView, setMobileView] = useState<"sidebar" | "profile">(
    "sidebar",
  );

  return (
    <div className="flex w-full h-[92vh] overflow-hidden bg-white relative">
      {/* Sidebar Area 
        - Mobile: Visible only when view is 'sidebar'
        - Desktop: Always visible (w-96)
      */}
      <div
        className={cn(
          "w-full md:w-96 h-full border-r border-gray-200 bg-white transition-all",
          mobileView === "sidebar" ? "block" : "hidden md:block",
        )}
      >
        <SettingsSidebar
          onMobileProfileClick={() => setMobileView("profile")}
        />
      </div>

      {/* Profile Settings Area 
        - Mobile: Fixed overlay when active
        - Desktop: Static flex-1 column
      */}
      <div
        className={cn(
          "flex-1 bg-white h-full overflow-hidden",
          mobileView === "profile"
            ? "fixed inset-0 z-50 bg-white w-full md:static md:z-auto"
            : "hidden md:block",
        )}
      >
        <ProfileSettings onMobileBack={() => setMobileView("sidebar")} />
      </div>
    </div>
  );
};
