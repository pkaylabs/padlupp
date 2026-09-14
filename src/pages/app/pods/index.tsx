import { Link } from "@tanstack/react-router";
import { CalendarClock, MessageCircle, UsersRound } from "lucide-react";
import { useGoals } from "@/pages/app/goals/hooks/useGoals";

const frequencyLabel = (value?: string | null) =>
	(value || "DAILY").toLowerCase().replaceAll("-", " ");

export const PaddiePodsPage = () => {
	const { data, isLoading } = useGoals({ ordering: "-created_at" });
	const pods = (data?.results || []).filter((goal) => goal.is_shared || (goal.members?.length || 0) > 1);

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
			<div className="mb-7">
				<p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Community</p>
				<h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">Your Paddie Pods</h1>
				<p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-slate-400">Only Pods connected to goals you participate in appear here.</p>
			</div>
			{isLoading ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-800" />)}</div>
			) : pods.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
					<UsersRound className="mx-auto text-gray-400" size={34} />
					<h2 className="mt-3 font-semibold">No Paddie Pods yet</h2>
					<p className="mt-1 text-sm text-gray-500">Share a goal or join a public goal to start a Pod.</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{pods.map((goal) => (
						<article key={goal.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
							<div className="flex items-start justify-between gap-3"><h2 className="font-semibold text-gray-900 dark:text-slate-100">{goal.title}</h2><span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{goal.member_count || goal.members?.length || 1} members</span></div>
							<p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-slate-400">{goal.description || "A shared accountability goal."}</p>
							<div className="mt-4 flex items-center gap-2 text-xs capitalize text-gray-500"><CalendarClock size={14} /> {frequencyLabel(goal.checkin_frequency)} check-ins</div>
							<div className="mt-5 flex gap-2"><Link to="/goals/$id" params={{ id: String(goal.id) }} className="min-h-10 flex-1 rounded-lg bg-primary-500 px-3 py-2 text-center text-sm font-semibold text-white">Open Pod</Link><Link to="/messages" className="flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700" aria-label="Open messages"><MessageCircle size={17} /></Link></div>
						</article>
					))}
				</div>
			)}
		</div>
	);
};
