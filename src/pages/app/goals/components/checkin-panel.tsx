import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/core/avatar";
import { useAuthStore } from "@/features/auth/authStore";
import { getApiErrorMessage } from "@/utils/api-error";
import { cn } from "@/utils/cs";
import { getGoalCheckin, getGoalCheckinEvidence, reviewGoalCheckin, type GoalCheckin } from "../api";
import { useGoalCheckins, useSubmitGoalCheckin } from "../hooks/useCheckins";
import "./checkin.css";

const moods = [
  { value: "excited", label: "Excited", left: "-13.77%", top: "-30.66%", width: "127.53%", height: "162%", narrow: true },
  { value: "joyful", label: "Joyful", left: "-21.65%", top: "-51.64%", width: "143.29%", height: "213%" },
  { value: "energized", label: "Energized", left: "0.78%", top: "-24.5%", width: "98.45%", height: "149%" },
  { value: "confused", label: "Confused", left: "-15.08%", top: "-48.5%", width: "130.16%", height: "197%" },
  { value: "bored", label: "Bored", left: "-14.42%", top: "-55.19%", width: "128.84%", height: "195%" },
  { value: "stressed", label: "Stressed", left: "-14.95%", top: "-39.33%", width: "130.16%", height: "197%" },
  { value: "angry", label: "Angry", left: "-14.09%", top: "-47%", width: "128.18%", height: "194%" },
  { value: "hurt", label: "Hurt", left: "-7.1%", top: "-32.99%", width: "114.96%", height: "174%" },
  { value: "guilty", label: "Guilty", left: "-10.79%", top: "-42%", width: "121.57%", height: "184%" },
];
const moodKeyOffsets: Record<string, number | undefined> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
const dateLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const localDate = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; };

function MoodArtwork({ value }: { value: string }) {
  const mood = moods.find((item) => item.value === value);
  return mood ? <span className="checkin-mood-art" style={{ width: mood.narrow ? 94 : undefined }}><img src={`/pod-assets/mood-${mood.value}.png`} alt="" style={{ left: mood.left, top: mood.top, width: mood.width, height: mood.height }} /></span> : null;
}

function CheckinDialog({ title, onClose, children, onBack }: { title: string; onClose: () => void; children: ReactNode; onBack?: () => void }) {
  return <Dialog open onClose={onClose} className="checkin-dialog relative z-[80]">
    <DialogBackdrop className="fixed inset-0 bg-[rgba(203,208,226,0.47)]" />
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-3 sm:p-5"><DialogPanel className="checkin-dialog-panel">
      <header className="checkin-dialog-header">{onBack ? <button type="button" onClick={onBack} aria-label="Previous step"><img src="/pod-assets/back.svg" alt="" /></button> : <span />}<DialogTitle className="font-semibold">{title}</DialogTitle><button type="button" onClick={onClose} aria-label="Close check-in"><img src="/pod-assets/close.svg" alt="" /></button></header>{children}
    </DialogPanel></div>
  </Dialog>;
}

function EvidencePreview({ id, name = "checkin-evidence" }: { id: number; name?: string }) {
  const { data, isPending, error } = useQuery({ queryKey: ["checkin-evidence", id], queryFn: () => getGoalCheckinEvidence(id), staleTime: 0, gcTime: 0, refetchOnWindowFocus: false });
  const [url, setUrl] = useState("");
  useEffect(() => { if (!data) return; const value = URL.createObjectURL(data); setUrl(value); return () => URL.revokeObjectURL(value); }, [data]);
  if (isPending) return <p role="status">Opening evidence...</p>;
  if (error) return <p role="alert">{getApiErrorMessage(error, "Evidence is unavailable.")}</p>;
  if (!url || !data) return null;
  if (data.type.startsWith("image/")) return <img src={url} alt="Submitted check-in evidence" className="max-h-[55vh] w-full rounded object-contain" />;
  if (data.type.startsWith("video/")) return <video src={url} controls playsInline className="max-h-[55vh] w-full" />;
  if (data.type.startsWith("audio/")) return <audio src={url} controls className="w-full" />;
  if (data.type === "application/pdf") return <div><iframe src={url} title="Check-in evidence" className="h-[50vh] w-full rounded border-0" /><a href={url} download={name} className="mt-2 inline-block text-sm text-primary-500 underline">Download PDF if the preview is unavailable</a></div>;
  return <div className="rounded bg-gray-100 p-3 text-sm dark:bg-slate-800"><p>This document cannot be previewed in this browser.</p><a href={url} download={name} className="mt-2 inline-block text-primary-500 underline">Download evidence</a></div>;
}

export function CheckinSummaryModal({ checkinId, onClose, readOnly = false }: { checkinId: number; onClose: () => void; readOnly?: boolean }) {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const { data: item, isPending, error } = useQuery({ queryKey: ["checkin-summary", checkinId], queryFn: () => getGoalCheckin(checkinId), refetchInterval: 15_000 });
  const [showEvidence, setShowEvidence] = useState(false);
  const review = useMutation({ mutationFn: (approved: boolean) => reviewGoalCheckin(checkinId, approved), onSuccess: (updated) => { client.setQueryData(["checkin-summary", checkinId], updated); void client.invalidateQueries({ queryKey: ["goal-checkins", updated.goal] }); toast.success("Check-in review recorded."); }, onError: (err) => toast.error(getApiErrorMessage(err, "Could not review this check-in.")) });
  return <CheckinDialog title="Check-in summary" onClose={onClose}>
    {isPending && <p role="status" className="py-10 text-center">Loading summary...</p>}
    {error && <p role="alert">{getApiErrorMessage(error, "This check-in is unavailable.")}</p>}
    {item && !error && <div className="checkin-summary space-y-6">
      <div className="flex flex-col items-center gap-3"><Avatar src={item.user.avatar} name={item.user.name} className="h-12 w-12" /><p className="font-semibold">{item.user.id === userId ? "You" : item.user.name}</p><p className="text-xs text-gray-500">{dateLabel(item.scheduled_for)}</p></div>
      {item.mood && <section><h3>How do you feel today?</h3><div className="checkin-summary-mood"><MoodArtwork value={item.mood} /><span>{moods.find((mood) => mood.value === item.mood)?.label || item.mood}</span></div></section>}
      <section><h3>Overall task progress</h3><p className="mt-2 text-lg font-semibold text-primary-500">{item.completion_percent}%</p><progress value={item.completion_percent} max={100} aria-label="Overall task progress" className="w-full accent-[#4e92f4]" /></section>
      {[{ title: "Your update", text: item.update_text || "No update provided." }, { title: "Blockers or support needed", text: item.blocker || "No blockers reported." }, { title: "Next focus", text: item.next_focus || "No next focus provided." }].map((field) => <section key={field.title}><h3>{field.title}</h3><p className="checkin-summary-field">{field.text}</p></section>)}
      <section><h3>Evidence</h3>{item.evidence_url ? <><button className="checkin-button mt-3" type="button" onClick={() => setShowEvidence((shown) => !shown)}>{showEvidence ? "Close evidence" : "View evidence"}</button>{showEvidence && <div className="mt-3"><EvidencePreview id={item.id} name={item.evidence_name} /></div>}</> : <p className="mt-2 text-sm text-gray-500">No evidence is available.</p>}</section>
      <section><h3>Peer confirmation</h3><p className="mt-2 text-sm capitalize">{(item.review_status || "awaiting_confirmation").replaceAll("_", " ")}</p>{item.reviewer && <div className="mt-2 flex items-center gap-2 text-sm"><Avatar src={item.reviewer.avatar} name={item.reviewer.name} className="h-6 w-6" />Reviewed by {item.reviewer.name}</div>}
        {!readOnly && item.submitted_at && item.user.id !== userId && item.can_review !== false && <div className="mt-3 flex gap-3"><button type="button" disabled={review.isPending} onClick={() => review.mutate(true)} className="checkin-review-button"><ThumbsUp size={18} /> Confirm</button><button type="button" disabled={review.isPending} onClick={() => review.mutate(false)} className="checkin-review-button"><ThumbsDown size={18} /> Needs clarification</button></div>}
      </section>
    </div>}
  </CheckinDialog>;
}

function CheckinForm({ goalId, scheduledFor, onClose }: { goalId: number; scheduledFor: string; onClose: () => void }) {
  const { mutateAsync: submit, isPending } = useSubmitGoalCheckin();
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState("");
  const moodButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const [completion, setCompletion] = useState(0);
  const [update, setUpdate] = useState("");
  const [blocker, setBlocker] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const valid = step === 1 ? Boolean(mood) : step === 2 ? Boolean(update.trim() && nextFocus.trim()) : Boolean(evidence && !fileError);
  const chooseFile = (file?: File) => { setEvidence(null); setFileError(""); if (!file) return; if (file.size > 15 * 1024 * 1024) { setFileError("Evidence must be 15 MB or smaller."); return; } if (!file.size) { setFileError("Choose a non-empty file."); return; } setEvidence(file); };
  const finish = async () => { if (!valid || !evidence) return; try { await submit({ goal: goalId, scheduled_for: scheduledFor, mood, completion_percent: completion, status: blocker.trim() ? "blocked" : completion === 100 ? "completed" : "partial", update_text: update.trim(), blocker: blocker.trim(), next_focus: nextFocus.trim(), evidence }); onClose(); } catch { /* Keep the draft on server validation failure. */ } };
  const uploads = [{ name: "Photos", icon: "photos", accept: "image/*,video/*,audio/*", capture: undefined }, { name: "Camera", icon: "camera", accept: "image/*", capture: "environment" as const }, { name: "Documents", icon: "documents", accept: ".pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,audio/*", capture: undefined }];
  return <CheckinDialog title="Check in" onClose={onClose} onBack={step > 1 ? () => setStep(step - 1) : undefined}>
    <div className="flex items-start justify-between gap-4 text-sm"><h3 className="font-semibold">{step === 1 ? "How do you feel today?" : step === 2 ? "How is your task going?" : "Upload media proof"}</h3><span className="shrink-0 text-gray-500">{step} of 3</span></div>
    {step === 1 && <div className="checkin-mood-grid" role="radiogroup" aria-label="How do you feel today?">{moods.map((item, index) => <button key={item.value} ref={(element) => { moodButtons.current[index] = element; }} type="button" role="radio" aria-checked={mood === item.value} tabIndex={mood === item.value || (!mood && index === 0) ? 0 : -1} onClick={() => setMood(item.value)} onKeyDown={(event) => {
      const offset = moodKeyOffsets[event.key];
      if (offset === undefined && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? moods.length - 1 : (index + (offset || 0) + moods.length) % moods.length;
      setMood(moods[next].value); moodButtons.current[next]?.focus();
    }} className={cn("checkin-mood", mood === item.value && "is-selected")}><MoodArtwork value={item.value} /><span>{item.label}</span></button>)}</div>}
    {step === 2 && <div className="space-y-4">
      <label className="block text-sm">Overall task progress: <strong>{completion}%</strong><input aria-label="Overall task progress" type="range" min={0} max={100} step={1} value={completion} onChange={(event) => setCompletion(Number(event.target.value))} className="mt-3 block w-full accent-[#4e92f4]" /></label>
      <label className="checkin-field">Brief update *<textarea autoFocus value={update} onChange={(event) => setUpdate(event.target.value)} rows={3} maxLength={4000} placeholder="What happened since your last check-in?" required /></label>
      <label className="checkin-field">Blockers or support needed<textarea value={blocker} onChange={(event) => setBlocker(event.target.value)} rows={2} maxLength={4000} placeholder="Tell your paddies how they can help (optional)" /></label>
      <label className="checkin-field">Next focus *<textarea value={nextFocus} onChange={(event) => setNextFocus(event.target.value)} rows={2} maxLength={4000} placeholder="What will you focus on next?" required /></label>
      <p className="text-xs text-gray-500">Honest progress counts. Partial or no progress is a valid update.</p>
    </div>}
    {step === 3 && <div><div className="checkin-evidence-options">{uploads.map((option) => <label key={option.name} className="checkin-upload"><span><img src={`/pod-assets/${option.icon}.svg`} alt="" /></span><span>{option.name}</span><input aria-label={`Upload ${option.name.toLowerCase()}`} type="file" accept={option.accept} capture={option.capture} onChange={(event) => chooseFile(event.target.files?.[0])} /></label>)}</div><p className="mt-3 break-all text-sm">{evidence ? evidence.name : "Evidence is required. Maximum file size: 15 MB."}</p>{fileError && <p role="alert" className="mt-2 text-sm text-red-600">{fileError}</p>}<p className="mt-3 text-xs leading-5 text-gray-500">Active pod members and authorized internal admins can view evidence, including in completed or archived pod history. Redact private details before uploading.</p></div>}
    <button type="button" className="checkin-button" disabled={!valid || isPending} onClick={() => step < 3 ? setStep(step + 1) : void finish()}>{isPending ? "Submitting..." : step < 3 ? "Next" : "Finish up"}</button>
  </CheckinDialog>;
}

export function CheckinPanel({ goalId, communityPod = false, readOnly = false, initialCheckinId, onLinkedCheckinClose }: { goalId: number; communityPod?: boolean; readOnly?: boolean; initialCheckinId?: number; onLinkedCheckinClose?: () => void }) {
  const userId = useAuthStore((state) => state.user?.id);
  const { data: checkins = [], isLoading, isError, refetch } = useGoalCheckins(goalId);
  const [formDate, setFormDate] = useState<string | null>(null);
  const [summaryId, setSummaryId] = useState<number | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const openedLink = useRef<string | null>(null);
  const today = localDate();
  useEffect(() => {
    const key = initialCheckinId ? `${goalId}:${initialCheckinId}` : null;
    if (!key) { openedLink.current = null; return; }
    if (openedLink.current === key || isLoading || isError) return;
    openedLink.current = key;
    const record = checkins.find((item) => item.id === initialCheckinId);
    if (record && record.user.id === userId && !record.submitted_at && !readOnly && record.scheduled_for <= today) setFormDate(record.scheduled_for);
    else setSummaryId(initialCheckinId!);
  }, [initialCheckinId, goalId, checkins, userId, readOnly, today, isLoading, isError]);
  const cycles = useMemo(() => { const dates = new Map<string, GoalCheckin[]>(); for (const item of checkins) dates.set(item.scheduled_for, [...(dates.get(item.scheduled_for) || []), item]); return [...dates.entries()].sort(([a], [b]) => a.localeCompare(b)); }, [checkins]);
  const todaySubmitted = checkins.some((item) => item.user.id === userId && item.scheduled_for === today && item.submitted_at);
  return <section className="checkin-history" aria-label="Pod check-in history">
    {isLoading && <p role="status" className="py-6 text-center text-sm text-gray-500">Loading check-ins...</p>}
    {isError && <div role="alert"><p>Check-ins could not be loaded.</p><button type="button" onClick={() => void refetch()} className="checkin-button mt-3">Try again</button></div>}
    {!isLoading && !isError && cycles.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No check-in cycles yet. Scheduled prompts will appear here.</p>}
    {cycles.map(([date, records], index) => { const mine = records.find((item) => item.user.id === userId); const submitted = records.filter((item) => item.submitted_at); const canSubmit = !readOnly && mine && !mine.submitted_at && date <= today;
      const expanded = expandedDate === date;
      return <article key={date} className="checkin-cycle"><img src={`/pod-assets/${mine?.submitted_at ? "checkin-done" : "checkin-pending"}.svg`} alt="" /><div className="min-w-0 flex-1">
        <h3 className={cn("text-base", mine?.submitted_at && "text-primary-500 line-through")}>{submitted.length ? <button type="button" aria-label={`Toggle Check-in ${index + 1} participants`} aria-expanded={expanded} onClick={() => setExpandedDate(expanded ? null : date)} className="text-left focus-visible:outline-2 focus-visible:outline-blue-600">Check-in {index + 1}</button> : `Check-in ${index + 1}`}</h3>
        <p className="mt-1 text-sm">{dateLabel(date)}</p>
        {submitted.length > 0 && <div className={cn("mt-2 flex gap-2", expanded ? "flex-col items-start" : "flex-wrap")}>{submitted.map((item) => <button key={item.id} type="button" onClick={() => setSummaryId(item.id)} aria-label={`View ${item.user.name}'s check-in summary`} className="flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-blue-600"><Avatar src={item.user.avatar} name={item.user.name} className="h-6 w-6" />{expanded && <time dateTime={item.submitted_at || undefined} className="text-[10px]">{new Date(item.submitted_at!).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</time>}</button>)}</div>}
        {mine?.status === "missed" && !mine.submitted_at && <p className="mt-1 text-xs text-amber-700">Missed check-in</p>}
      </div>{canSubmit && <button type="button" className="checkin-button checkin-cycle-action" onClick={() => setFormDate(date)}>Check-in</button>}</article>;
    })}
    {!communityPod && !readOnly && !todaySubmitted && !isLoading && !isError && !cycles.some(([date]) => date === today) && <button type="button" className="checkin-button" onClick={() => setFormDate(today)}>Check-in</button>}
    {formDate && <CheckinForm goalId={goalId} scheduledFor={formDate} onClose={() => { setFormDate(null); if (initialCheckinId) onLinkedCheckinClose?.(); }} />}
    {summaryId && <CheckinSummaryModal checkinId={summaryId} readOnly={readOnly} onClose={() => { setSummaryId(null); if (initialCheckinId) onLinkedCheckinClose?.(); }} />}
  </section>;
}
