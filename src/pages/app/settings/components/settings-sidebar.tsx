// src/components/settings/SettingsSidebar.tsx
import React, { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  Globe,
  Share2,
  MapPin,
  Bell,
  ChevronsUp,
  Search,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/utils/cs";
import TextInput from "@/components/core/inputs";
import { DualRangeSlider } from "./dual-range-slider";
import { LANGUAGES } from "@/constants/data";
import { Check } from "iconsax-reactjs";
import { StyledSwitch } from "@/routes/_app/-components/toggle";

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

export const SettingsSidebar: React.FC = () => {
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
    // Add other fields here as needed
  });

  // --- 2. Handlers to satisfy TextInputProps ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // You can add validation logic here later
    console.log(`Field ${e.target.id} blurred:`, e.target.value);
  };

  // Placeholder for errors/touched if your component requires them
  const errors = {};
  const touched = {};

  // --- API Call Placeholder ---
  const handleSave = (section: string) => {
    console.log(`Saving ${section}...`, formData);
    // API call goes here, e.g.:
    // await api.updateProfile(formData);
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
        isDestructive ? "text-red-500 hover:bg-red-50" : "text-gray-700"
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
        className="flex items-center text-sm font-bold text-gray-800 mb-6 hover:text-blue-600"
      >
        <ChevronLeft size={20} className="mr-1" /> {title.toUpperCase()}
      </button>
    </div>
  );

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.toLowerCase().includes(searchQuery.toLowerCase())
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
                // --- Wired Props ---
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
                // --- Wired Props ---
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
                        : "text-gray-600"
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
              <button className="w-full flex items-center bg-white justify-center py-3 text-gray-900 font-medium text-sm rounded-lg">
                Log out
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
    <div className="font-monts w-96 h-full border-r border-gray-200 p-3 overflow-y-auto scroll-smooth">
      <div className="mb-8 text-primary-500">
        <ChevronsUp size={32} />
      </div>
      {renderContent()}
    </div>
  );
};
