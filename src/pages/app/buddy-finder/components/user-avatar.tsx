import React from "react";
import { cn } from "@/utils/cs";
import { Modal } from "@/components/core/modal";

interface UserAvatarProps {
  name?: string;
  src?: string | null;
  className?: string;
  textClassName?: string;
  previewOnClick?: boolean;
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
  previewOnClick = true,
}) => {
  const [viewerOpen, setViewerOpen] = React.useState(false);

  if (src) {
    return (
      <>
        <img
          src={src}
          alt={name || "User"}
          className={cn(
            "rounded-full object-cover",
            previewOnClick && "cursor-zoom-in",
            className,
          )}
          onClick={(event) => {
            if (!previewOnClick) return;
            event.stopPropagation();
            setViewerOpen(true);
          }}
        />
        <Modal
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          showCloseButton
          className="max-w-2xl w-[92vw] p-4 md:p-6 top-1/2 -translate-y-1/2"
        >
          <img
            src={src}
            alt={name || "User"}
            className="max-h-[75vh] w-full object-contain rounded-md"
          />
        </Modal>
      </>
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
