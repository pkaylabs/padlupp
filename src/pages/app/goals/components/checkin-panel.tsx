import { useMemo, useState } from "react";
import { Award, FileUp, Heart, PartyPopper, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAuthStore } from "@/features/auth/authStore";
import { cn } from "@/utils/cs";
import { openGoalCheckinEvidence } from "../api";
import { useGoalCheckins, useReactToGoalCheckin, useSubmitGoalCheckin } from "../hooks/useCheckins";

export const CheckinPanel = ({ goalId }: { goalId: number }) => {
	const userId = useAuthStore((state) => state.user?.id);
	const { data: checkins = [], isLoading } = useGoalCheckins(goalId);
	const { mutateAsync: submit, isPending } = useSubmitGoalCheckin();
	const { mutate: react } = useReactToGoalCheckin();
	const [completion, setCompletion] = useState(50);
	const [updateText, setUpdateText] = useState("");
	const [blocker, setBlocker] = useState("");
	const [isBlocked, setIsBlocked] = useState(false);
	const [evidence, setEvidence] = useState<File | null>(null);
	const [viewOnce, setViewOnce] = useState(false);
	const today = format(new Date(), "yyyy-MM-dd");
	const submittedToday = useMemo(
		() => checkins.some((item) => item.user.id === userId && item.scheduled_for === today && item.submitted_at),
		[checkins, today, userId],
	);

	const handleSubmit = async () => {
		await submit({
			goal: goalId,
			scheduled_for: today,
			status: isBlocked ? "blocked" : completion === 100 ? "completed" : "partial",
			completion_percent: completion,
			update_text: updateText.trim(),
			blocker: isBlocked ? blocker.trim() : "",
			evidence,
			evidence_view_once: viewOnce,
		});
		setUpdateText("");
		setBlocker("");
		setEvidence(null);
		setViewOnce(false);
	};

	return (
		<section className="mb-10" aria-labelledby="checkin-heading">
			<div className="mb-4 flex items-center justify-between">
				<h3 id="checkin-heading" className="text-sm font-bold text-gray-900 dark:text-slate-100">
					Paddie Pod check-ins
				</h3>
				<span className="text-xs text-gray-500 dark:text-slate-400">Private to goal members</span>
			</div>

			{!submittedToday && (
				<div className="mb-5 space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
					<div className="flex items-center justify-between gap-3">
						<label htmlFor="checkin-progress" className="text-sm font-semibold">Progress since your last check-in</label>
						<span className="rounded-full bg-white px-2.5 py-1 text-sm font-bold text-blue-700 dark:bg-slate-900 dark:text-blue-300">{completion}%</span>
					</div>
					<input id="checkin-progress" type="range" min="0" max="100" step="5" value={completion} onChange={(event) => setCompletion(Number(event.target.value))} className="w-full accent-blue-600" />
					<textarea value={updateText} onChange={(event) => setUpdateText(event.target.value)} rows={3} placeholder="What moved forward?" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
					<label className="flex items-center gap-2 text-sm font-medium">
						<input type="checkbox" checked={isBlocked} onChange={(event) => setIsBlocked(event.target.checked)} />
						I am blocked and need support
					</label>
					{isBlocked && <textarea value={blocker} onChange={(event) => setBlocker(event.target.value)} rows={2} placeholder="What is blocking you?" className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm dark:border-amber-900/50 dark:bg-slate-900" />}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
							<FileUp size={16} /> {evidence?.name || "Attach image or video"}
							<input type="file" accept="image/*,video/*" className="hidden" onChange={(event) => setEvidence(event.target.files?.[0] || null)} />
						</label>
						<label className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
							<input type="checkbox" checked={viewOnce} onChange={(event) => setViewOnce(event.target.checked)} disabled={!evidence} />
							<ShieldCheck size={14} /> View once
						</label>
					</div>
					<button type="button" onClick={() => void handleSubmit()} disabled={isPending || (isBlocked && !blocker.trim())} className="min-h-11 rounded-lg bg-primary-500 px-5 text-sm font-semibold text-white disabled:opacity-50">
						{isPending ? "Sharing..." : "Share check-in"}
					</button>
				</div>
			)}

			<div className="space-y-3">
				{isLoading && <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800" />}
				{!isLoading && checkins.length === 0 && <p className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500 dark:border-slate-700">No check-ins yet.</p>}
				{checkins.map((checkin) => (
					<article key={checkin.id} className="rounded-xl border border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-sm font-semibold">{checkin.user.name}</p>
								<p className="text-xs text-gray-500">{format(parseISO(checkin.scheduled_for), "MMM d, yyyy")}</p>
							</div>
							<div className="flex items-center gap-2">
								{checkin.has_badge && <Award size={18} className="text-amber-500" aria-label="Full participation badge" />}
								<span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", checkin.status === "blocked" ? "bg-amber-100 text-amber-800" : checkin.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>{checkin.status}</span>
							</div>
						</div>
						<div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${checkin.completion_percent}%` }} /></div>
						<p className="mt-2 text-sm text-gray-700 dark:text-slate-300">{checkin.update_text || `${checkin.completion_percent}% complete`}</p>
						{checkin.blocker && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">Blocker: {checkin.blocker}</p>}
						<div className="mt-3 flex flex-wrap items-center gap-2">
							{checkin.evidence_url && <button type="button" onClick={() => void openGoalCheckinEvidence(checkin.id)} className="min-h-9 rounded-lg border border-gray-200 px-3 text-xs font-medium hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800">View evidence</button>}
							<button type="button" onClick={() => react({ checkinId: checkin.id, reaction: "support" })} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800"><Heart size={14} /> Support</button>
							<button type="button" onClick={() => react({ checkinId: checkin.id, reaction: "celebrate" })} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800"><PartyPopper size={14} /> Celebrate</button>
							<span className="text-xs text-gray-400">{checkin.reactions.length} reactions</span>
						</div>
					</article>
				))}
			</div>
		</section>
	);
};
