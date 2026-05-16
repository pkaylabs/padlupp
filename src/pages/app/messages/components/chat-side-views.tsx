import { useMemo, useState } from "react";
import {
  AudioLines,
  Download,
  FileText,
  PlaySquare,
} from "lucide-react";
import { cn } from "@/utils/cs";

type SharedMediaFilter = "all" | "image" | "video" | "audio" | "file";

export interface SharedMediaItem {
  id: number | string;
  url: string;
  name: string;
  mime: string;
  createdAt?: string;
  senderName?: string;
  size?: number | null;
}

const getMediaType = (mime: string): SharedMediaFilter => {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "file";
};

const formatDateTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFileSize = (size?: number | null) => {
  if (!size || size <= 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const FilterButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 text-xs rounded-full border transition-colors",
      active
        ? "bg-blue-500 border-blue-500 text-white"
        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800",
    )}
  >
    {label}
  </button>
);

export const SharedFilesView = ({
  items,
  isLoading,
  isError,
  onOpenAttachment,
}: {
  items: SharedMediaItem[];
  isLoading?: boolean;
  isError?: boolean;
  onOpenAttachment?: (payload: { url: string; mime: string; name: string }) => void;
}) => {
  const [activeFilter, setActiveFilter] = useState<SharedMediaFilter>("all");

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        activeFilter === "all" ? true : getMediaType(item.mime) === activeFilter,
      ),
    [activeFilter, items],
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-16 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-center text-red-600 dark:text-red-400">
        Failed to load shared media for this conversation.
      </div>
    );
  }

  return (
    <div className="h-full p-4 md:p-6 overflow-y-auto">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FilterButton
          label="All"
          active={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
        />
        <FilterButton
          label="Images"
          active={activeFilter === "image"}
          onClick={() => setActiveFilter("image")}
        />
        <FilterButton
          label="Videos"
          active={activeFilter === "video"}
          onClick={() => setActiveFilter("video")}
        />
        <FilterButton
          label="Audio"
          active={activeFilter === "audio"}
          onClick={() => setActiveFilter("audio")}
        />
        <FilterButton
          label="Files"
          active={activeFilter === "file"}
          onClick={() => setActiveFilter("file")}
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/40 p-6 text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
            No shared media yet
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Images, videos, audio, and files from this chat will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const type = getMediaType(item.mime);
            const dateLabel = formatDateTime(item.createdAt);
            const sizeLabel = formatFileSize(item.size);

            return (
              <div
                key={`${item.id}`}
                className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover cursor-zoom-in"
                        onClick={() =>
                          onOpenAttachment?.({
                            url: item.url,
                            mime: item.mime,
                            name: item.name,
                          })
                        }
                      />
                    ) : type === "video" ? (
                      <PlaySquare size={22} className="text-gray-600 dark:text-slate-300" />
                    ) : type === "audio" ? (
                      <AudioLines size={22} className="text-gray-600 dark:text-slate-300" />
                    ) : (
                      <FileText size={22} className="text-gray-600 dark:text-slate-300" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      className="text-left w-full"
                      onClick={() =>
                        onOpenAttachment?.({
                          url: item.url,
                          mime: item.mime,
                          name: item.name,
                        })
                      }
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                        {item.name}
                      </p>
                    </button>

                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 flex flex-wrap gap-x-2">
                      {item.senderName ? <span>{item.senderName}</span> : null}
                      {dateLabel ? <span>{dateLabel}</span> : null}
                      {sizeLabel ? <span>{sizeLabel}</span> : null}
                    </div>
                  </div>

                  <a
                    href={item.url}
                    download={item.name}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
                    aria-label={`Download ${item.name}`}
                  >
                    <Download size={16} className="text-gray-600 dark:text-slate-300" />
                  </a>
                </div>

                {type === "audio" ? (
                  <audio src={item.url} controls className="w-full mt-3" />
                ) : null}
                {type === "video" ? (
                  <video src={item.url} controls className="w-full mt-3 rounded-md max-h-72" />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
