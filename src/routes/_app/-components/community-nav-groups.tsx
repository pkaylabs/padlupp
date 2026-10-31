import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, UsersRound } from "lucide-react";
import { community, nextPage, type Group } from "@/pages/app/community/api";
import { Avatar } from "@/components/core/avatar";
import { getGoals } from "@/pages/app/goals/api";
import { cn } from "@/utils/cs";
import { navItemClassName } from "./navigation-styles";

export function CommunityNavGroups({ onNavigate }: { onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const query = useInfiniteQuery({ queryKey: ["community", "nav-groups"], initialPageParam: 1, queryFn: ({ pageParam }) => community.list<Group>("groups/", { page: pageParam }), getNextPageParam: (last) => nextPage(last.next), enabled: expanded, refetchInterval: expanded ? 30_000 : false });
  const groups = query.data?.pages.flatMap((page) => page.results).filter((group) => group.membership?.state === "active") || [];
  return <div className="text-sm text-dark-blue-normal dark:text-slate-300">
    <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className={cn(navItemClassName(), "w-[calc(100%-16px)] text-left")}><UsersRound aria-hidden="true" className="h-5 w-5 shrink-0" /><span className="flex-1">Your Groups</span><ChevronDown aria-hidden="true" size={16} className={expanded ? "rotate-180" : ""} /></button>
    {expanded && <ul aria-label="Your Groups" className="pl-3">{query.isPending && <li className="p-3 text-xs">Loading...</li>}{query.error && <li><button type="button" className="p-3 text-xs" onClick={() => void query.refetch()}>Unable to load groups. Try again.</button></li>}{!query.isPending && !query.error && !groups.length && <li className="p-3 text-xs">No groups yet.</li>}{!query.error && groups.map((group) => <li key={group.id}><Link to="/community" search={{ group: group.id, view: "chat" }} onClick={onNavigate} className="flex min-h-10 items-center gap-2 rounded px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"><Avatar src={group.image} name={group.name} className="h-6 w-6 text-[9px]" /><span className="truncate">{group.name}</span></Link></li>)}{query.hasNextPage && <li><button type="button" className="p-3 text-xs" onClick={() => void query.fetchNextPage()}>Load more</button></li>}</ul>}
  </div>;
}

export function CommunityNavPods({ onNavigate }: { onNavigate?: () => void }) {
  const isPodRoute = useLocation({ select: (location) => location.pathname === "/pods" || location.pathname.startsWith("/pods/") });
  const isPodDetail = useLocation({ select: (location) => /^\/pods\/.+/.test(location.pathname) });
  const [expanded, setExpanded] = useState(isPodDetail);
  useEffect(() => { if (isPodDetail) setExpanded(true); }, [isPodDetail]);
  const query = useInfiniteQuery({ queryKey: ["goals", "pods"], initialPageParam: 1, queryFn: ({ pageParam }) => getGoals({ page: pageParam, scope: "pods", ordering: "-created_at" }), getNextPageParam: (last) => nextPage(last.next), enabled: expanded, refetchInterval: expanded ? 30_000 : false });
  const pods = query.data?.pages.flatMap((page) => page.results) || [];
  return <div className="text-sm text-dark-blue-normal dark:text-slate-300">
    <div className={cn(navItemClassName(isPodRoute), "py-0 pr-1")}><Link to="/pods" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-x-3 py-2"><UsersRound aria-hidden="true" className="h-5 w-5 shrink-0" /><span>Paddie Pods</span></Link><button type="button" aria-label={expanded ? "Collapse Paddie Pods" : "Expand Paddie Pods"} aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="flex h-10 w-8 shrink-0 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-blue-400"><ChevronDown aria-hidden="true" size={16} className={expanded ? "rotate-180" : ""} /></button></div>
    {expanded && <ul aria-label="Paddie Pods" className="pl-3">{query.isPending && <li className="p-3 text-xs">Loading...</li>}{query.error && <li><button type="button" className="p-3 text-xs" onClick={() => void query.refetch()}>Unable to load pods. Try again.</button></li>}{!query.isPending && !query.error && !pods.length && <li className="p-3 text-xs">No pods yet.</li>}{!query.error && pods.map((pod) => <li key={pod.id}><Link to="/pods/$id" params={{ id: String(pod.id) }} onClick={onNavigate}>{({ isActive }) => <span className={`flex min-h-10 items-center gap-2 rounded px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 ${isActive ? "bg-gray-100 dark:bg-slate-800" : ""}`}><Avatar name={pod.title} className="h-6 w-6 text-[9px]" /><span className="truncate">{pod.title}</span></span>}</Link></li>)}{query.hasNextPage && <li><button type="button" className="p-3 text-xs" onClick={() => void query.fetchNextPage()}>Load more pods</button></li>}</ul>}
  </div>;
}
