import React, { useState } from "react";
import {
  Brain,
  Coffee,
  Play,
  Pause,
  SkipForward,
  MoreHorizontal,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cs";
import { usePomodoroTimer } from "@/hooks/usePomodoroTimer";
import Button from "@/components/core/buttons";
import { Setting2 } from "iconsax-reactjs";
import { PiKeyReturnFill } from "react-icons/pi";
import { StyledNumberInput } from "./styled_num-input";
import { StyledSelectInput } from "./dropdown";
import { StyledSwitch } from "./toggle";

type TimerMode = "focus" | "shortBreak" | "longBreak";

export const TimerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [timerSettings, setTimerSettings] = useState(false);

  const { mode, time, isActive, toggle, restart, skip, config, setConfig } =
    usePomodoroTimer({
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
    });

  const modeText = mode === "focus" ? "Focus" : "Short Break";
  const Icon = mode === "focus" ? Brain : Coffee;
  const theme = {
    focus: {
      bg: "bg-white",
      tagBg: "bg-[#4E92F426] boder-gray-900",
      tagText: "text-gray-700",
      tagIcon: "text-gray-900 ",
      buttonBg: "bg-blue-100",
      buttonIcon: "text-blue-600",
      buttonLarge: "bg-blue-500 hover:bg-blue-600",
      timeText: "text-green-900",
    },
    shortBreak: {
      bg: "bg-green-50",
      tagBg: "bg-green-200/50 border-green-900",
      tagText: "text-green-800",
      tagIcon: "text-green-700",
      buttonBg: "bg-green-200/50",
      buttonIcon: "text-green-700",
      buttonLarge: "bg-green-500 hover:bg-green-600",
      timeText: "text-green-900",
    },
    longBreak: {},
  }[mode as "focus" | "shortBreak"];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
  const [minutes, seconds] = formatTime(time).split(":");

  return (
    <div
      className={cn(
        "relative flex flex-col items-center w-full h-[542px] p-6 transition-colors duration-300",
        theme.bg
      )}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20"
      >
        <X size={20} />
      </button>

      {/* This tag is shared between views */}
      <div className="flex justify-center mb-6">
        <div
          className={cn(
            "flex items-center space-x-2 px-4 py-1.5 rounded-full border",
            theme.tagBg
          )}
        >
          <Icon size={18} className={theme.tagIcon} />
          <span className={cn(" font-medium", theme.tagText)}>{modeText}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <TimerView
          key="timer"
          theme={theme}
          minutes={minutes}
          seconds={seconds}
          isActive={isActive}
          onToggle={toggle}
          onSkip={skip}
          onRestart={restart}
          onShowSettings={() => setTimerSettings(true)}
        />

        {timerSettings && (
          <TimerSettings
            key="settings"
            config={config}
            onSave={(newConfig: any) => {
              setConfig(newConfig);
              setTimerSettings(false);
            }}
            onClose={() => setTimerSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TimerView: React.FC<any> = ({
  theme,
  minutes,
  seconds,
  isActive,
  onToggle,
  onSkip,
  onRestart,
  onShowSettings,
}) => {
  const [optionsOpen, setOptionsOpen] = useState(false);

  const keyStyle = "border border-gray-400 rounded-sm px-0.5";

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col items-center w-full"
    >
      {/* Tag is now in parent */}

      {/* Timer */}
      <div className="flex flex-col my-6">
        <span
          className={cn(
            "text-9xl font-medium tracking-tighter",
            theme.timeText
          )}
        >
          {minutes}
        </span>
        <span
          className={cn(
            "text-9xl font-medium tracking-tighter",
            theme.timeText
          )}
        >
          {seconds}
        </span>
      </div>

      {/* Controls */}
      <div className="relative flex items-center justify-center gap-4">
        <motion.button
          onClick={() => setOptionsOpen(!optionsOpen)}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            theme.buttonBg
          )}
          whileTap={{ scale: 0.95 }}
        >
          <MoreHorizontal size={24} className={theme.buttonIcon} />
        </motion.button>
        {/* Main Play/Pause Button */}
        <motion.button
          onClick={onToggle}
          className={cn(
            "w-24 h-16 rounded-xl flex items-center justify-center shadow-lg",
            theme.buttonLarge
          )}
          whileTap={{ scale: 0.95 }}
        >
          {isActive ? (
            <Pause size={30} className="text-white" fill="white" />
          ) : (
            <Play size={30} className="text-white pl-1" fill="white" />
          )}
        </motion.button>
        <motion.button
          onClick={onSkip}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            theme.buttonBg
          )}
          whileTap={{ scale: 0.95 }}
        >
          <SkipForward size={24} className={theme.buttonIcon} />
        </motion.button>

        {/* Options Popover */}
        <AnimatePresence>
          {optionsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-16 -left-10 w-58 bg-white rounded-lg  shadow-lg border border-gray-200 p-2 z-10"
            >
              <button
                onClick={() => {
                  onShowSettings();
                  setOptionsOpen(false);
                }}
                className="flex justify-between items-center w-full text-sm p-2 hover:bg-gray-100 rounded"
              >
                <div className="flex items-center text-sm text-dark-blue-normal gap-1">
                  <Setting2 size="20" color="#153047" variant="Bold" />
                  <span>Preferences</span>
                </div>

                <div className="text-xs text-gray-400">
                  <span className={keyStyle}>Ctrl</span> +
                  <span className={keyStyle}>P</span>
                </div>
              </button>
              <button
                onClick={() => {
                  onRestart();
                  setOptionsOpen(false);
                }}
                className="flex justify-between items-center w-full text-sm p-2 hover:bg-gray-100 rounded"
              >
                <div className="flex items-center text-sm text-dark-blue-normal gap-1">
                  <PiKeyReturnFill size={20} />
                  <span>Restart</span>
                </div>

                <div className="text-xs text-gray-400">
                  <span className={keyStyle}>Ctrl</span> +{" "}
                  <span className={keyStyle}>Alt</span> +{" "}
                  <span className={keyStyle}>Del</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// --- Settings View Component ---
const TimerSettings: React.FC<any> = ({ config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [soundOn, setSoundOn] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);

  const SettingsItem: React.FC<{
    label: string;
    children: React.ReactNode;
  }> = ({ label, children }) => (
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="absolute top-18 z-10 bg-[#F2F9FF] rounded-2xl w-md p-5 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-[#153047]">Settings</h3>
        <button
          onClick={onClose}
          className="text-[#153047] hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-4">
        <SettingsItem label="Focus length">
          <StyledNumberInput
            value={localConfig.focusMinutes}
            onChange={(val: number) =>
              setLocalConfig({ ...localConfig, focusMinutes: val })
            }
          />
        </SettingsItem>

        <SettingsItem label="Short break length">
          <StyledNumberInput
            value={localConfig.shortBreakMinutes}
            onChange={(val: number) =>
              setLocalConfig({ ...localConfig, shortBreakMinutes: val })
            }
          />
        </SettingsItem>

        <SettingsItem label="Select task">
          <StyledSelectInput />
        </SettingsItem>

        <SettingsItem label="Sound">
          <StyledSwitch checked={soundOn} onChange={setSoundOn} />
        </SettingsItem>

        <SettingsItem label="Notifications">
          <StyledSwitch
            checked={notificationsOn}
            onChange={setNotificationsOn}
          />
        </SettingsItem>

        <div className="pt-4">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => onSave(localConfig)}
          >
            Save
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
