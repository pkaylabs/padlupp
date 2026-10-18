import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { X, LoaderCircle } from "lucide-react";
import { Avatar } from "@/components/core/avatar";
import s1 from "@/assets/images/s1.png";
import s2 from "@/assets/images/s2.png";
import s3 from "@/assets/images/s3.png";
import s4 from "@/assets/images/s4.png";
import { community, errorText, type Achievement, type Person } from "./api";

export { Avatar };
export type IconName = "search" | "tools" | "send" | "guidelines" | "archive" | "down" | "back" | "settings" | "link" | "pdf" | "file" | "download" | "share" | "requests" | "audit" | "report" | "pod" | "shield" | "users" | "muted" | "banned" | "rules" | "public" | "private" | "reply" | "copy" | "alert" | "pin" | "delete" | "select" | "photos" | "camera" | "document" | "poll" | "task" | "chevron";
export function Icon({ name }: { name: IconName }) { return <span className={`co-icon co-icon-${name}`} aria-hidden="true"><img src={`/community-assets/${name}.svg`} alt="" /></span>; }
export function IconButton({ name, label, onClick, disabled }: { name: IconName; label: string; onClick: () => void; disabled?: boolean }) { return <button className="co-icon-button" title={label} aria-label={label} onClick={onClick} disabled={disabled}><Icon name={name} /></button>; }
export function Modal({ title, children, onClose, wide = false, compactHeader = false, headerAction }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean; compactHeader?: boolean; headerAction?: ReactNode }) {
  return <Dialog open onClose={onClose} className="co-modal-root"><DialogBackdrop className="co-backdrop" /><div className="co-modal-position"><DialogPanel className={`co-modal ${wide ? "co-modal-wide" : ""}`}><header className={compactHeader ? "co-modal-header-compact" : undefined}><button className="co-icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button><DialogTitle className={compactHeader ? "sr-only" : undefined}>{title}</DialogTitle>{!compactHeader && (headerAction || <span className="co-icon-spacer" />)}</header>{children}</DialogPanel></div></Dialog>;
}
export function Empty({ children }: { children: ReactNode }) { return <div className="co-empty">{children}</div>; }
export function Loading() { return <div className="co-empty" role="status"><LoaderCircle className="co-spin" size={22} /><span>Loading...</span></div>; }
export function ErrorNotice({ error, retry }: { error: unknown; retry?: () => void }) { return <div className="co-error" role="alert">{errorText(error)}{retry && <button onClick={retry}>Try again</button>}</div>; }
export function useAction() {
  const client = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  async function run<T,>(work: () => Promise<T>, after?: (value: T) => void) {
    if (pending) return;
    setPending(true); setError(null);
    try {
      const value = await work();
      void client.invalidateQueries({ queryKey: ["goals"] });
      void client.invalidateQueries({ queryKey: ["goal-members"] });
      void client.invalidateQueries({ queryKey: ["goal"] });
      await client.invalidateQueries({ queryKey: ["community"] });
      after?.(value);
      return value;
    }
    catch (e) { setError(new Error(errorText(e))); return undefined; }
    finally { setPending(false); }
  }
  return { pending, error, run, clearError: () => setError(null) };
}
export function PersonRow({ person, suffix, onClick }: { person: Person; suffix?: ReactNode; onClick?: () => void }) {
  return <div className="co-person-row"><button className="co-person" onClick={onClick} disabled={!onClick}><Avatar src={person.avatar} name={person.name} className="co-avatar-sm" /><span>{person.name}</span></button>{suffix}</div>;
}
const earnedBadgeImages: Record<string, string> = {
  goal_started: s1, goal_completed: s1, five_goals_completed: s1,
  streak_3: s2, streak_7: s2, streak_14: s2,
  successful_referral: s3, team_player: s4, consistent_checkins: s4,
};
export function MemberAchievements({ achievements }: { achievements?: Achievement[] }) {
  return <section className="co-achievements"><h3>Achievements</h3>{achievements?.length ? <div>{achievements.map(achievement => <span key={achievement.id} title={achievement.name}>{earnedBadgeImages[achievement.key] ? <img src={earnedBadgeImages[achievement.key]} alt={achievement.name} width={40} height={40} /> : achievement.name}</span>)}</div> : <p className="co-muted">No achievements to show.</p>}</section>;
}
export function dateLabel(value?: string | null) { if (!value) return ""; const d = new Date(value); return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
export function timeLabel(value: string) { const d = new Date(value); return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }); }
export function SafeText({ text }: { text?: string | null }) {
  return <>{(text || "").split(/(https?:\/\/[^\s<>]+)/g).map((part, i) => /^https?:\/\//.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : part)}</>;
}
const rasterImageTypes = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/bmp"]);
const videoTypes = new Set(["video/mp4", "video/webm", "video/ogg", "video/quicktime"]);
function normalizedMime(type: string) { return type.split(";", 1)[0].trim().toLowerCase(); }
export function Attachment({ id, name, preview = false, reportEvidence = false }: { id: number; name: string; mime: string; preview?: boolean; reportEvidence?: boolean }) {
  const [file, setFile] = useState<{ id: number; reportEvidence: boolean; url: string; type: string } | null>(null); const [error, setError] = useState<unknown>(null);
  const [viewPDF, setViewPDF] = useState(false);
  useEffect(() => {
    const controller = new AbortController(); let objectUrl = ""; setFile(null); setError(null); setViewPDF(false);
    (reportEvidence ? community.reportAttachment(id, controller.signal) : community.attachment(id, controller.signal)).then(async blob => { const type = normalizedMime(blob.type); const verifiedType = type === "application/pdf" && await blob.slice(0, 5).text() !== "%PDF-" ? "application/octet-stream" : type; if (!controller.signal.aborted) { objectUrl = URL.createObjectURL(blob); setFile({ id, reportEvidence, url: objectUrl, type: verifiedType }); } }).catch(e => { if (!controller.signal.aborted) setError(e); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id, reportEvidence]);
  if (error) return <span className="co-muted">Attachment unavailable</span>;
  if (!file || file.id !== id || file.reportEvidence !== reportEvidence) return <span role="status" className="co-muted">Loading attachment...</span>;
  if (preview && rasterImageTypes.has(file.type)) return <a href={file.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${name}`}><img src={file.url} alt={name} className="co-media-image" /></a>;
  if (preview && videoTypes.has(file.type)) return <video className="co-media-image" controls preload="metadata" src={file.url} aria-label={name} />;
  if (file.type === "application/pdf") return <><div className="co-attachment"><Icon name="pdf" /><span>{name}</span><button className="co-link" onClick={() => setViewPDF(true)}>View</button><a className="co-link" href={file.url} download={name} aria-label={`Download ${name}`}><Icon name="download" /><span className="sr-only">Download</span></a></div>{viewPDF && <Modal title={name} wide onClose={() => setViewPDF(false)}><iframe className="co-pdf-preview" src={file.url} title={name} /><p className="co-muted">If your browser cannot display the PDF, use Download.</p><a className="co-primary" href={file.url} download={name}>Download</a></Modal>}</>;
  return <a className="co-attachment" href={file.url} download={name}><Icon name={file.type === "application/pdf" ? "pdf" : "file"} /><span>{name}</span><Icon name="download" /></a>;
}
export function ProtectedTaskCover({ id, title }: { id: number; title: string }) {
  const [file, setFile] = useState<{ url: string; type: string } | null>(null);
  useEffect(() => {
    const controller = new AbortController(); let objectUrl = ""; setFile(null);
    community.cover(id, controller.signal).then(blob => { if (!controller.signal.aborted) { const type = normalizedMime(blob.type); if (!rasterImageTypes.has(type) && !videoTypes.has(type)) return; objectUrl = URL.createObjectURL(blob); setFile({ url: objectUrl, type }); } }).catch(() => { if (!controller.signal.aborted) setFile(null); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id]);
  if (!file) return null;
  return videoTypes.has(file.type) ? <video className="co-task-cover" controls src={file.url} aria-label={title} /> : <img className="co-task-cover" src={file.url} alt={title} />;
}
export function Choice({ value, checked, onChange, description }: { value: string; checked: boolean; onChange: () => void; description?: string }) { return <label className="co-choice"><span>{value}{description && <small>{description}</small>}</span><input type="radio" checked={checked} onChange={onChange} /></label>; }
export function ReasonDialog({ title, reasons, optional = true, destructive = false, submitLabel = "Submit", onSubmit, onClose, extra }: { title: string; reasons: string[]; optional?: boolean; destructive?: boolean; submitLabel?: string; onSubmit: (reason: string, details: string) => Promise<unknown>; onClose: () => void; extra?: ReactNode }) {
  const [reason, setReason] = useState(""); const [details, setDetails] = useState(""); const action = useAction();
  return <Modal title={title} onClose={onClose}><form className="co-form" onSubmit={e => { e.preventDefault(); void action.run(() => onSubmit(reason, details), onClose); }}>
    {title.startsWith("Exit") && <p className="co-center">You're about to leave this group. Help us improve by sharing why.</p>}
    {reasons.map(item => <Choice key={item} value={item} checked={reason === item} onChange={() => setReason(item)} />)}
    {extra}
    <label>{optional ? "Additional feedback (optional)" : "Reason"}<textarea value={details} onChange={e => setDetails(e.target.value)} required={!optional} rows={4} /></label>
    {action.error && <ErrorNotice error={action.error} />}<button className={destructive ? "co-danger-fill" : "co-primary"} disabled={action.pending || (!reason && optional)}>{action.pending ? "Saving..." : submitLabel}</button><button type="button" className="co-text-button" onClick={onClose}>Cancel</button>
  </form></Modal>;
}
export const reportReasons = ["Against community rules", "Spam", "Abuse or harassment", "Harmful misinformation or enabling violence", "Exposing private identity information"];
export const exitReasons = ["Found a different group", "Group does not match my interest", "Not enough activities", "Goals achieved"];
