import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/utils/api-error";

const protectedPath = (url?: string | null) => {
  const match = url?.match(/\/community\/messages\/(\d+)\/attachment\/?(?:\?.*)?$/);
  return match ? `/community/messages/${match[1]}/attachment/` : null;
};

export function useProtectedMediaUrl(source?: string | null) {
  const path = protectedPath(source);
  const [objectUrl, setObjectUrl] = useState<{ source: string; url: string } | null>(null);
  const query = useQuery({
    queryKey: ["protected-message-media", path],
    queryFn: async () => (await api.get<Blob>(path!, { responseType: "blob" })).data,
    enabled: Boolean(path), staleTime: 0, gcTime: 0, refetchOnWindowFocus: true, retry: false,
  });
  useEffect(() => {
    if (!path || !query.data) return;
    const url = URL.createObjectURL(query.data);
    setObjectUrl({ source: path, url });
    return () => URL.revokeObjectURL(url);
  }, [path, query.data]);
  const url = !source ? null : !path ? source : !query.error && objectUrl?.source === path ? objectUrl.url : null;
  return { url, isLoading: Boolean(path && (!url && !query.error)), error: query.error };
}

export function AuthenticatedMedia({ kind, src, alt = "", className, controls, onClick }: {
  kind: "image" | "video" | "audio"; src?: string | null; alt?: string; className?: string; controls?: boolean; onClick?: () => void;
}) {
  const { url, error } = useProtectedMediaUrl(src);
  if (error) return <span role="status" className="text-xs text-gray-500">Attachment unavailable</span>;
  if (!url) return <span role="status" className="text-xs text-gray-500">Loading attachment...</span>;
  if (kind === "image") return <img src={url} alt={alt} className={className} onClick={onClick} />;
  if (kind === "video") return <video src={url} controls={controls} playsInline className={className} onClick={onClick} />;
  return <audio src={url} controls={controls} className={className} />;
}

export function ProtectedDownload({ url, name, className, children }: { url: string; name: string; className?: string; children: ReactNode }) {
  const [pending, setPending] = useState(false);
  const path = protectedPath(url);
  if (!path) return <a href={url} download={name} target="_blank" rel="noreferrer" className={className} aria-label={`Download ${name}`}>{children}</a>;
  const download = async () => {
    setPending(true);
    try {
      const { data } = await api.get<Blob>(path, { responseType: "blob" });
      const objectUrl = URL.createObjectURL(data);
      const anchor = document.createElement("a");
      anchor.href = objectUrl; anchor.download = name; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) { toast.error(getApiErrorMessage(error, "This attachment is no longer available.")); }
    finally { setPending(false); }
  };
  return <button type="button" onClick={() => void download()} disabled={pending} aria-label={`Download ${name}`} className={className}>{pending ? "Downloading..." : children}</button>;
}
