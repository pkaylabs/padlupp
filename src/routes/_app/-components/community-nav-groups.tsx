import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { community, nextPage, type Group } from "@/pages/app/community/api";
import { Avatar } from "@/components/core/avatar";
import { getGoals } from "@/pages/app/goals/api";

export function CommunityNavGroups() {
  const [expanded, setExpanded] = useState(false);
  const query = useInfiniteQuery({ queryKey: ["community", "nav-groups"], initialPageParam: 1, queryFn: ({ pageParam }) => community.list<Group>("groups/", { page: pageParam }), getNextPageParam: (last) => nextPage(last.next), enabled: expanded, refetchInterval: expanded ? 30_000 : false });
  const groups = query.data?.pages.flatMap((page) => page.results).filter((group) => group.membership?.state === "active") || [];
  return <div className="my-1 text-sm font-medium text-[#636363] dark:text-slate-300">
    <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="mx-2 flex min-h-12 w-[calc(100%-16px)] items-center justify-between px-3 text-left"><span>Your Groups</span><ChevronDown size={16} className={expanded ? "rotate-180" : ""} /></button>
    {expanded && <ul className="pl-3">{query.isPending && <li className="p-3 text-xs">Loading...</li>}{query.error && <li><button type="button" className="p-3 text-xs" onClick={() => void query.refetch()}>Unable to load groups. Try again.</button></li>}{groups.map((group) => <li key={group.id}><Link to="/community" search={{ group: group.id, view: "chat" }} className="flex min-h-10 items-center gap-2 px-3 py-2"><Avatar src={group.image} name={group.name} className="h-6 w-6 text-[9px]" /><span className="truncate">{group.name}</span></Link></li>)}{query.hasNextPage && <li><button type="button" className="p-3 text-xs" onClick={() => void query.fetchNextPage()}>Load more</button></li>}</ul>}
  </div>;
}

export function CommunityNavPods() {
  const isPodDetail = useLocation({ select: (location) => /^\/pods\/.+/.test(location.pathname) });
  const [expanded, setExpanded] = useState(isPodDetail);
  useEffect(() => { if (isPodDetail) setExpanded(true); }, [isPodDetail]);
  const query = useInfiniteQuery({ queryKey: ["goals", "pods"], initialPageParam: 1, queryFn: ({ pageParam }) => getGoals({ page: pageParam, scope: "pods", ordering: "-created_at" }), getNextPageParam: (last) => nextPage(last.next), enabled: expanded, refetchInterval: expanded ? 30_000 : false });
  const pods = query.data?.pages.flatMap((page) => page.results) || [];
  return <div className="my-1 text-sm font-medium text-[#636363] dark:text-slate-300">
    <div className="mx-2 flex min-h-12 items-center justify-between pl-3"><Link to="/pods" className="flex-1 py-3">Paddie Pods</Link><button type="button" aria-label={expanded ? "Collapse Paddie Pods" : "Expand Paddie Pods"} aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="flex h-10 w-10 items-center justify-center"><ChevronDown size={16} className={expanded ? "rotate-180" : ""} /></button></div>
    {expanded && <ul className="pl-3">{query.isPending && <li className="p-3 text-xs">Loading...</li>}{query.error && <li><button type="button" className="p-3 text-xs" onClick={() => void query.refetch()}>Unable to load pods. Try again.</button></li>}{!query.isPending && !query.error && !pods.length && <li className="p-3 text-xs">No pods yet.</li>}{!query.error && pods.map((pod) => <li key={pod.id}><Link to="/pods/$id" params={{ id: String(pod.id) }}>{({ isActive }) => <span className={`flex min-h-10 items-center gap-2 rounded px-3 py-2 ${isActive ? "bg-gray-100 dark:bg-slate-800" : ""}`}><Avatar name={pod.title} className="h-6 w-6 text-[9px]" /><span className="truncate">{pod.title}</span></span>}</Link></li>)}{query.hasNextPage && <li><button type="button" className="p-3 text-xs" onClick={() => void query.fetchNextPage()}>Load more pods</button></li>}</ul>}
  </div>;
}
