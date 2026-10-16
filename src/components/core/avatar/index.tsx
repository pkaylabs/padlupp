import { useEffect, useState } from "react";
import { cn } from "@/utils/cs";
import { resolveMediaUrl } from "@/utils/media";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
}

const getInitials = (name?: string | null) =>
  (name || "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

export const Avatar = ({
  src,
  name,
  className,
  fallbackClassName,
}: AvatarProps) => {
  const resolvedSrc = resolveMediaUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [resolvedSrc]);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-full",
        className,
      )}
      role="img"
      aria-label={`${name || "User"} avatar`}
    >
      {resolvedSrc && !failed ? (
        <img
          src={resolvedSrc}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={cn(
            "inline-flex h-full w-full items-center justify-center bg-[#E6F0FD] font-semibold text-[#1F2937]",
            fallbackClassName,
          )}
        >
          {getInitials(name)}
        </span>
      )}
    </span>
  );
};
