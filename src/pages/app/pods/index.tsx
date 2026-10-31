import { Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CalendarClock, UsersRound } from "lucide-react";
import { getGoals } from "@/pages/app/goals/api";
import { community, nextPage, type Task } from "@/pages/app/community/api";
import { TaskCard } from "@/pages/app/community/chat";
import { Modal, ErrorNotice } from "@/pages/app/community/ui";
import "@/pages/app/community/community.css";

const frequencyLabel = (value?: string | null) =>
	(value || "DAILY").toLowerCase().replaceAll("-", " ");

export const PaddiePodsPage = () => {
	const search = useSearch({ strict: false }) as { invitation?: number };
	const [openedInvitation, setOpenedInvitation] = useState<number | null>(search.invitation || null);
	useEffect(() => setOpenedInvitation(search.invitation || null), [search.invitation]);
	const taskQuery = useInfiniteQuery({ queryKey: ["community", "task-invitations"], initialPageParam: 1, queryFn: ({ pageParam }) => community.list<Task>("tasks/", { page: pageParam }), getNextPageParam: (last) => nextPage(last.next), refetchInterval: 15_000 });
	const invitations = taskQuery.data?.pages.flatMap((page) => page.results).filter((task) => task.invitation_status === "pending") || [];
	const goals = useInfiniteQuery({ queryKey: ["goals", "pods"], initialPageParam: 1, queryFn: ({ pageParam }) => getGoals({ page: pageParam, scope: "pods", ordering: "-created_at" }), getNextPageParam: (last) => nextPage(last.next) });
	const pods = (goals.data?.pages.flatMap((page) => page.results) || []).filter((goal) => goal.is_shared || goal.community_task_id || (goal.members?.length || 0) > 1);

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
			<div className="mb-7">
				<p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Community</p>
				<h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">Your Paddie Pods</h1>
				<p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-slate-400">Only Pods connected to goals you participate in appear here.</p>
			</div>
			{invitations.length > 0 && <section className="co mb-7" aria-label="Pod invitations"><h2 className="mb-3 text-sm font-semibold">Pod invitations</h2><div className="flex flex-wrap gap-4">{invitations.map((task) => <TaskCard key={task.id} id={task.id} task={task} />)}</div></section>}
			{taskQuery.error && <ErrorNotice error={taskQuery.error} retry={() => void taskQuery.refetch()} />}
			{taskQuery.hasNextPage && <button type="button" className="mb-5 text-sm text-primary-500" onClick={() => void taskQuery.fetchNextPage()}>Load more invitations</button>}
			{openedInvitation && <Modal title="Pod invitation" onClose={() => setOpenedInvitation(null)}><TaskCard id={openedInvitation} /></Modal>}
			{goals.error && <ErrorNotice error={goals.error} retry={() => void goals.refetch()} />}
			{goals.isLoading ? (
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
							<Link to="/pods/$id" params={{ id: String(goal.id) }} className="mt-5 block min-h-10 w-full rounded-lg bg-primary-500 px-3 py-2 text-center text-sm font-semibold text-white">Open Pod</Link>
						</article>
					))}
				</div>
			)}
			{goals.hasNextPage && <button type="button" disabled={goals.isFetchingNextPage} onClick={() => void goals.fetchNextPage()} className="mt-5 text-sm text-primary-500">{goals.isFetchingNextPage ? "Loading..." : "Load more pods"}</button>}
		</div>
	);
};
