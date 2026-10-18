import React from "react";
import { cn } from "@/utils/cs";
import { Modal } from "@/components/core/modal";
import { Avatar } from "@/components/core/avatar";
import { resolveMediaUrl } from "@/utils/media";

interface UserAvatarProps {
  name?: string;
  src?: string | null;
  className?: string;
  textClassName?: string;
  previewOnClick?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  src,
  className,
  textClassName,
  previewOnClick = true,
}) => {
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const resolvedSrc = resolveMediaUrl(src);

  return (
    <>
      <button
        type="button"
        disabled={!resolvedSrc || !previewOnClick}
        className={cn("inline-flex rounded-full", previewOnClick && resolvedSrc && "cursor-zoom-in")}
        onClick={(event) => {
          event.stopPropagation();
          setViewerOpen(true);
        }}
      >
        <Avatar
          src={resolvedSrc}
          name={name}
          className={className}
          fallbackClassName={cn(
            "bg-gradient-to-br from-[#111827] to-[#1f2937] font-bold text-white",
            textClassName,
          )}
        />
      </button>
      <Modal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        showCloseButton
        className="max-w-2xl w-[92vw] p-4 md:p-6 top-1/2 -translate-y-1/2"
      >
        <Avatar
          src={resolvedSrc}
          name={name}
          className="mx-auto h-[min(70vh,28rem)] w-[min(70vh,28rem)] text-6xl"
        />
      </Modal>
    </>
  );
};
