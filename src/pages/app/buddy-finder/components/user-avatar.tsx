import React from "react";
import { cn } from "@/utils/cs";

interface UserAvatarProps {
  name?: string;
  src?: string | null;
  className?: string;
  textClassName?: string;
}

const getInitials = (name?: string) => {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  src,
  className,
  textClassName,
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "User"}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-[#111827] to-[#1f2937] flex items-center justify-center",
        className,
      )}
      aria-label={name || "User"}
    >
      <span className={cn("font-bold text-white", textClassName)}>
        {getInitials(name)}
      </span>
    </div>
  );
};

