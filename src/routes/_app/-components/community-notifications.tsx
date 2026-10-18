import { useState } from "react";
import { Bell } from "lucide-react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { Modal, ErrorNotice, Loading, Empty } from "@/pages/app/community/ui";
import { nextPage, type Page } from "@/pages/app/community/api";

interface Notice { id: number; type: string; is_read: boolean; created_at: string; payload: Record<string, unknown> }

export function CommunityNotifications() {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const navigate = useNavigate();
  const query = useInfiniteQuery({
    queryKey: ["community", "notifications"], initialPageParam: 1,
    queryFn: async ({ pageParam }) => (await api.get<Page<Notice>>("/notifications/", { params: { page: pageParam } })).data,
    getNextPageParam: (last) => nextPage(last.next), refetchInterval: 15_000,
  });
  const notices = query.data?.pages.flatMap((page) => page.results) || [];
  const mark = useMutation({ mutationFn: async (id?: number) => api.post(id ? `/notifications/${id}/mark_read/` : "/notifications/mark_all_read/"), onSuccess: () => client.invalidateQueries({ queryKey: ["community", "notifications"] }) });
  const follow = async (notice: Notice) => {
    try { await mark.mutateAsync(notice.id); }
    catch { return; }
    const task = Number(notice.payload.task_id);
    const group = Number(notice.payload.group_id);
    const goal = Number(notice.payload.goal_id);
    const conversation = Number(notice.payload.conversation_id);
    const checkin = Number(notice.payload.checkin_id);
    if (Number.isSafeInteger(goal) && goal > 0 && notice.type.includes("checkin")) { await navigate({ to: "/pods/$id", params: { id: String(goal) }, search: { tab: "checkin", checkin: Number.isSafeInteger(checkin) && checkin > 0 ? checkin : undefined } }); setOpen(false); }
    else if (Number.isSafeInteger(task) && task > 0) { await navigate({ to: "/pods", search: { invitation: task } }); setOpen(false); }
    else if (Number.isSafeInteger(group) && group > 0) { await navigate({ to: "/community", search: { group, view: notice.type === "community_admin_required" ? "settings" : "chat" } }); setOpen(false); }
    else if (Number.isSafeInteger(goal) && goal > 0) { await navigate({ to: "/pods/$id", params: { id: String(goal) } }); setOpen(false); }
    else if (Number.isSafeInteger(conversation) && conversation > 0) { await navigate({ to: "/messages", search: { conversation } }); setOpen(false); }
    else if (notice.payload.path === "/milestones") { await navigate({ to: "/milestones" }); setOpen(false); }
  };
  return <>
    <button type="button" aria-label="Notifications" onClick={() => setOpen(true)} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800"><Bell size={24} />{notices.some((notice) => !notice.is_read) && <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-primary-500" />}</button>
    {open && <Modal title="Notifications" onClose={() => setOpen(false)}><div className="co-form">
      <button type="button" className="co-link" disabled={mark.isPending} onClick={() => mark.mutate(undefined)}>Mark all as read</button>
      {query.isPending ? <Loading /> : query.error ? <ErrorNotice error={query.error} retry={() => void query.refetch()} /> : !notices.length ? <Empty>No notifications yet.</Empty> : notices.map((notice) => <button type="button" key={notice.id} className="co-audit-row text-left" disabled={mark.isPending} onClick={() => void follow(notice)}><strong>{String(notice.payload.title || notice.payload.sender_name || notice.type.replaceAll("_", " "))}</strong><p>{String(notice.payload.message || notice.payload.preview || notice.payload.reason || "Open to view the update.")}</p><small>{new Date(notice.created_at).toLocaleString()}{!notice.is_read ? " · Unread" : ""}</small></button>)}
      {query.hasNextPage && <button className="co-link" type="button" onClick={() => void query.fetchNextPage()}>Load more</button>}{mark.error && <ErrorNotice error={mark.error} />}
    </div></Modal>}
  </>;
}
