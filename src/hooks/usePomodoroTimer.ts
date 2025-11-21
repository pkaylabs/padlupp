// src/hooks/usePomodoroTimer.ts
import { useState, useEffect } from "react";
import { useInterval } from "react-use";

interface TimerConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

type TimerMode = "focus" | "shortBreak" | "longBreak";

export const usePomodoroTimer = (initialConfig: TimerConfig) => {
  const [config, setConfig] = useState(initialConfig);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [time, setTime] = useState(config.focusMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  // Update time when config changes
  useEffect(() => {
    restart();
  }, [config, mode]);

  useInterval(
    () => {
      if (time > 0) {
        setTime(time - 1);
      } else {
        // Time's up
        setIsActive(false);
        skip();
        // Here you would play a sound
      }
    },
    isActive ? 1000 : null // Run every second if active, or stop
  );

  const toggle = () => {
    setIsActive(!isActive);
  };

  const restart = () => {
    setIsActive(false);
    let newTime;
    switch (mode) {
      case "focus":
        newTime = config.focusMinutes * 60;
        break;
      case "shortBreak":
        newTime = config.shortBreakMinutes * 60;
        break;
      case "longBreak":
        newTime = config.longBreakMinutes * 60;
        break;
    }
    setTime(newTime);
  };

  const skip = () => {
    const nextMode = mode === "focus" ? "shortBreak" : "focus";
    setMode(nextMode);
    setIsActive(false); // Always pause on skip
  };

  return {
    time,
    mode,
    setMode,
    isActive,
    toggle,
    restart,
    skip,
    config,
    setConfig: (newConfig: TimerConfig) => {
      setConfig(newConfig);
      // Logic to update timer immediately based on new config
      if (mode === "focus") setTime(newConfig.focusMinutes * 60);
      if (mode === "shortBreak") setTime(newConfig.shortBreakMinutes * 60);
      if (mode === "longBreak") setTime(newConfig.longBreakMinutes * 60);
    },
  };
};
