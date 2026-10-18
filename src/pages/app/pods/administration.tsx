import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { community, type CommunityContext, type JoinRequest, type Task } from "@/pages/app/community/api";
import { PeoplePicker } from "@/pages/app/community/forms";
import { Avatar, ErrorNotice, Modal, ReasonDialog, useAction } from "@/pages/app/community/ui";
import { InactivityReviews } from "@/pages/app/community/details";
import "@/pages/app/community/community.css";

export function PodAdministration({ taskId, onChanged }: { taskId: number; onChanged: () => void }) {
  const [inviting, setInviting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [limitsOpen, setLimitsOpen] = useState(false);
  const context = useQuery({ queryKey: ["community", "context"], queryFn: () => community.get<CommunityContext>("groups/context/"), refetchInterval: 10_000 });
  const action = useAction();
  const task = useQuery({ queryKey: ["community", "pod-task", taskId], queryFn: () => community.get<Task>(`tasks/${taskId}/`), refetchInterval: 20_000 });
  const requests = useQuery({ queryKey: ["community", "pod-requests", taskId], queryFn: () => community.get<JoinRequest[]>(`tasks/${taskId}/requests/`), enabled: Boolean(task.data?.can_manage) });
  if (task.error) return <ErrorNotice error={task.error} retry={() => void task.refetch()} />;
  if (!task.data?.can_manage) return null;
  const active = task.data.status === "active";
  return <div className="co pod-administration">
    <h3 className="mb-3 text-sm font-medium">Activities</h3>
    <p className="text-xs text-gray-500">{task.data.member_count}/{task.data.member_limit} members. {task.data.enrollment_status} enrollment.</p>
    <button type="button" className="pod-settings-row" onClick={() => setInviting(true)} disabled={!active}>Add members</button>
    <button type="button" className="pod-settings-row" onClick={() => void action.run(async () => {
      const result = await community.post<{ url: string }>(`tasks/${taskId}/invite-link/`);
      await navigator.clipboard.writeText(result.url);
      toast.success("Pod invite link copied. New link joins require approval.");
    })} disabled={action.pending || !active}>Copy pod invite link</button>
    <button type="button" className="pod-settings-row" disabled={action.pending || !active || task.data.enrollment_status === "expired"} onClick={() => void action.run(() => community.post(`tasks/${taskId}/enrollment/`, { closed: task.data?.enrollment_status !== "closed" }), onChanged)}>{task.data.enrollment_status === "closed" ? "Reopen invitations" : "Close invitations"}</button>
    <h4 className="mb-2 mt-5 text-sm font-medium">Approval requests</h4>
    {requests.error && <ErrorNotice error={requests.error} retry={() => void requests.refetch()} />}
    {requests.data?.length === 0 && <p className="text-xs text-gray-500">No pending requests.</p>}
    {requests.data?.map((request) => <div key={request.id} className="flex items-center gap-3 py-3 text-sm"><Avatar src={request.user.avatar} name={request.user.name} className="h-8 w-8" /><span className="flex-1">{request.user.name}</span>{(["reject", "approve"] as const).map((decision) => <button type="button" key={decision} className={decision === "approve" ? "text-green-600" : "text-red-500"} disabled={action.pending || !active || (decision === "approve" && task.data?.enrollment_status !== "open")} onClick={() => void action.run(() => community.post(`tasks/${taskId}/requests/`, { user_id: request.user.id, decision }), onChanged)}>{decision === "approve" ? "Approve" : "Reject"}</button>)}</div>)}
    <InactivityReviews taskId={taskId} />
    {context.data?.is_internal && active && <button type="button" className="pod-settings-row" onClick={() => setLimitsOpen(true)}>Approve capacity or duration exception</button>}
    {active && <button type="button" className="pod-settings-row" onClick={() => setStatus("completed")}>Mark task completed</button>}
    {active && <button type="button" className="pod-settings-row text-red-500" onClick={() => setStatus("archived")}>Archive pod</button>}
    {active && <button type="button" className="pod-settings-row text-red-500" onClick={() => setStatus("deleted")}>Delete underlying task</button>}
    {action.error && <ErrorNotice error={action.error} />}
    {inviting && <PeoplePicker taskId={taskId} onClose={() => setInviting(false)} />}
    {limitsOpen && <PodLimits task={task.data} onClose={() => setLimitsOpen(false)} onChanged={onChanged} />}
    {status && <ReasonDialog title={status === "completed" ? "Complete task" : status === "deleted" ? "Delete task and archive pod" : "Archive pod"} reasons={["Goals achieved", "Task cancelled", "Other"]} destructive={status !== "completed"} submitLabel="Confirm" onClose={() => setStatus(null)} onSubmit={async (reason, details) => { await community.post(`tasks/${taskId}/lifecycle/`, { status, reason: `${reason}${details ? `: ${details}` : ""}` }); onChanged(); }} />}
  </div>;
}

function PodLimits({ task, onClose, onChanged }: { task: Task; onClose: () => void; onChanged: () => void }) {
  const [capacity, setCapacity] = useState(task.member_limit);
  const [endDate, setEndDate] = useState(task.target_date);
  const [reason, setReason] = useState("");
  const action = useAction();
  return <Modal title="Approve pod limit exception" onClose={onClose}><form className="co-form" onSubmit={(event) => {
    event.preventDefault();
    void action.run(() => community.post(`tasks/${task.id}/limits/`, { member_limit: capacity, target_date: endDate, reason: reason.trim() }), () => { onChanged(); onClose(); });
  }}>
    <p className="co-muted">Internal-admin approval is recorded in the audit log. The member limit includes the creator.</p>
    <label>Total members<input type="number" min={Math.max(1, task.member_count)} max={10000} required value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} /></label>
    <label>Task end date<input type="date" required min={task.start_date} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
    <label>Approval reason<textarea required rows={3} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
    {action.error && <ErrorNotice error={action.error} />}
    <button className="co-primary" disabled={action.pending || !reason.trim()}>{action.pending ? "Saving..." : "Approve exception"}</button>
  </form></Modal>;
}
