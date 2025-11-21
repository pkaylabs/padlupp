import React, { useEffect, useState } from "react";
import { cn } from "@/utils/cs";
import ProgressBar from "./progressBar";

const LoadingProgressBar = ({
  isDone,
  className = "",
}: {
  isDone: boolean;
  className?: string;
}) => {
  const [progress, setProgress] = useState(0);
  const [showBar, setShowBar] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        if (isDone) {
          return 1;
        } else if (prev <= 0.9) {
          return prev + 0.01;
        } else {
          return prev + 0.001;
        }
      });
    }, 10);

    return () => clearInterval(interval);
  }, [isDone]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (progress === 1) {
        setShowBar(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [progress]);

  return (
    <ProgressBar
      progress={progress}
      color="#1685B9"
      className={cn(className, showBar ? "opacity-100" : "opacity-0")}
    />
  );
};

export default LoadingProgressBar;
