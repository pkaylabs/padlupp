import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Settings,
  Search,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { ShareGoalModal } from "@/pages/app/goals/components/share-goal-modal";
import { CheckinPanel } from "@/pages/app/goals/components/checkin-panel";
import type { GoalMember } from "@/pages/app/goals/api";
import { useGoal } from "@/pages/app/goals/hooks/useGoal";
import {
  useGoalMembers,
  useLeaveGoal,
  useRemoveGoalMember,
  useReportGoal,
  useReportGoalMember,
  useShareGoalInvites,
  useUpdateGoalMemberRole,
} from "@/pages/app/goals/hooks/useShareGoal";
import { useTasks } from "@/pages/app/goals/hooks/useTasks";
import { useUpdateGoal } from "@/pages/app/goals/hooks/useUpdateGoal";
import { cn } from "@/utils/cs";
import { resolveMediaUrl } from "@/utils/media";
import { useGoalCheckins } from "@/pages/app/goals/hooks/useCheckins";
import { PeoplePicker } from "@/pages/app/community/forms";
import { community, type Task as CommunityTask } from "@/pages/app/community/api";
import { PodAdministration } from "./administration";
import { useQueryClient } from "@tanstack/react-query";
import { ConversationChat } from "@/pages/app/community/chat";
import { Avatar } from "@/components/core/avatar";
import { CommunityDirectory } from "@/pages/app/community";
import { ResourceList } from "@/pages/app/community/details";
import { MemberAchievements, Modal, ProtectedTaskCover, useAction } from "@/pages/app/community/ui";
import "./details.css";

export type PodTab = "details" | "members" | "media" | "links" | "files" | "checkin";
type SafetyDialog =
  | { kind: "leave" }
  | { kind: "report-pod" }
  | { kind: "report-member"; member: GoalMember }
  | { kind: "remove-member"; member: GoalMember }
  | null;

const tabs: Array<{ id: PodTab; label: string }> = [
  { id: "details", label: "Details" },
  { id: "members", label: "Members" },
  { id: "media", label: "Media" },
  { id: "links", label: "Links" },
  { id: "files", label: "Files" },
  { id: "checkin", label: "Check-in" },
];

const leaveReasons = [
  { value: "different_group", label: "Found a different group" },
  { value: "interest_mismatch", label: "Group does not match my interests" },
  { value: "not_enough_activities", label: "Not enough activities" },
  { value: "goals_achieved", label: "Goals achieved" },
  { value: "other", label: "Other" },
];

const reportReasons = [
  { value: "spam", label: "Spam or scam" },
  { value: "harassment", label: "Abuse or harassment" },
  { value: "hate_speech", label: "Hate speech" },
  { value: "violence", label: "Harmful misinformation or violence" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Other" },
];

const formatDate = (value?: string | null) => {
  if (!value) return "No date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No date";
  return parsed.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};

const initials = (name?: string | null) =>
  (name || "P")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";

const normalizedMember = (member: GoalMember) => ({
  id: member.id ?? member.user_id ?? member.user?.id ?? 0,
  name: member.name || member.user?.name || "Padlupp member",
  avatar: resolveMediaUrl(member.avatar || member.user?.avatar),
  role: member.role || "member",
  isOwner: Boolean(member.is_owner),
  isAdmin: Boolean(member.is_admin),
  joinedAt: member.created_at || member.joined_at,
});

const MemberAvatar = ({ member, size = "md" }: { member: ReturnType<typeof normalizedMember>; size?: "sm" | "md" | "lg" }) => {
  const [failed, setFailed] = useState(false);
  const sizeClass = size === "lg" ? "h-16 w-16 text-lg" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  useEffect(() => setFailed(false), [member.avatar]);

  if (member.avatar && !failed) {
    return <img src={member.avatar} alt={member.name} onError={() => setFailed(true)} className={cn(sizeClass, "shrink-0 rounded-full object-cover")} />;
  }
  return <span className={cn(sizeClass, "inline-flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300")}>{initials(member.name)}</span>;
};

export const PodDetailsPage = () => {
  const { id } = useParams({ from: "/_app/pods/$id" });
  const search = useSearch({ from: "/_app/pods/$id" });
  const goalId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data: goal, isLoading, isError } = useGoal(id);
  const { data: members = [] } = useGoalMembers(id);
  const { data: taskResponse } = useTasks({ goal: goalId, ordering: "due_at" });
  const { mutateAsync: sharePod, isPending: isSharing } = useShareGoalInvites();
  const { mutateAsync: updateRole, isPending: isUpdatingRole } = useUpdateGoalMemberRole();
  const { mutateAsync: removeMember, isPending: isRemovingMember } = useRemoveGoalMember();
  const { mutateAsync: updateGoal, isPending: isSavingSettings } = useUpdateGoal();
  const { mutateAsync: leavePod, isPending: isLeaving } = useLeaveGoal();
  const { mutateAsync: reportPod, isPending: isReportingPod } = useReportGoal();
  const { mutateAsync: reportMember, isPending: isReportingMember } = useReportGoalMember();

  const [activeTab, setActiveTab] = useState<PodTab>(search.tab || "details");
  const [selectedMember, setSelectedMember] = useState<GoalMember | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [safetyDialog, setSafetyDialog] = useState<SafetyDialog>(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [settingsTitle, setSettingsTitle] = useState("");
  const [settingsDescription, setSettingsDescription] = useState("");
  const [settingsPublic, setSettingsPublic] = useState(false);
  const [transferTo, setTransferTo] = useState<number | undefined>();
  const [showChat, setShowChat] = useState(false);
  const [searchRequested, setSearchRequested] = useState(0);
  const settingsAction = useAction();
  const profileAction = useAction();
  const safetyAction = useAction();
  useEffect(() => {
    if (search.tab) { setActiveTab(search.tab); setShowChat(false); }
  }, [search.tab, search.checkin]);

  useEffect(() => {
    if (!goal) return;
    setSettingsTitle(goal.title);
    setSettingsDescription(goal.description || "");
    setSettingsPublic(Boolean(goal.is_public));
  }, [goal]);

  useEffect(() => {
    setReason("");
    setDetails("");
    setTransferTo(undefined);
  }, [safetyDialog]);

  const conversationId = goal?.conversation_id;

  const { data: checkins = [] } = useGoalCheckins(goalId);
  const { data: communityTask } = useQuery({ queryKey: ["community", "pod-task", goal?.community_task_id], queryFn: () => community.get<CommunityTask>(`tasks/${goal!.community_task_id}/`), enabled: Boolean(goal?.community_task_id) });
  const taskVisibility = communityTask?.visibility;
  useEffect(() => {
    if (taskVisibility) setSettingsPublic(taskVisibility === "public");
  }, [taskVisibility]);
  const podMembers = members.map(normalizedMember);
  const creator = podMembers.find((member) => member.isOwner) || (goal ? normalizedMember({ id: goal.user.id, name: goal.user.name, avatar: goal.user.avatar, is_owner: true, is_admin: true, role: "admin" }) : null);
  const ordinaryMembers = podMembers.filter((member) => !member.isOwner);
  const isOwner = goal?.user.id === currentUserId;
  const canEditSettings = communityTask ? communityTask.can_manage : isOwner;
  const canManageMembers = Boolean(goal?.can_manage_members ?? isOwner);
  const canManageRoles = Boolean(goal?.can_manage_roles ?? isOwner);
  const tasks = (taskResponse?.results || []).filter((task) => task.goal === goalId);
  const completedTasks = tasks.filter((task) => task.completed || task.status === "completed").length;
  const latestProgress = podMembers.map((member) => [...checkins].filter((item) => item.user.id === member.id && item.submitted_at).sort((a, b) => String(b.submitted_at).localeCompare(String(a.submitted_at)))[0]?.completion_percent || 0);
  const progress = communityTask?.progress ?? goal?.progress ?? (latestProgress.length ? Math.round(latestProgress.reduce((sum, value) => sum + value, 0) / latestProgress.length) : 0);
  const podReadOnly = goal?.can_write === false || Boolean(goal?.task_status && goal.task_status !== "active") || !goal?.is_active;
  const participation = communityTask?.checkin_participation || {
    submitted: checkins.filter((item) => item.submitted_at).length,
    total: checkins.filter((item) => item.scheduled_for <= new Date().toISOString().slice(0, 10)).length,
  };

  const handleSaveSettings = async () => {
    if (!goal || !settingsTitle.trim()) return;
    if (goal.community_task_id) {
      await community.patch(`tasks/${goal.community_task_id}/`, { title: settingsTitle.trim(), description: settingsDescription.trim(), visibility: settingsPublic ? "public" : "private" });
      await queryClient.invalidateQueries({ queryKey: ["goal"] });
      await queryClient.invalidateQueries({ queryKey: ["community"] });
      setIsSettingsOpen(false);
      return;
    }
    await updateGoal({
      id: goal.id,
      data: {
        title: settingsTitle.trim(),
        description: settingsDescription.trim(),
        is_public: settingsPublic,
      },
    });
    setIsSettingsOpen(false);
  };

  const handleSafetySubmit = async () => {
    if (!goal || !safetyDialog || !reason) return;
    if (safetyDialog.kind === "leave") {
      await leavePod({ goalId: goal.id, reason, details: details.trim(), transfer_to: transferTo });
      setSafetyDialog(null);
      await navigate({ to: "/pods" });
      return;
    }
    if (safetyDialog.kind === "remove-member") {
      await removeMember({ goalId: goal.id, userId: normalizedMember(safetyDialog.member).id, reason: `${reason}${details.trim() ? `: ${details.trim()}` : ""}` });
    } else if (safetyDialog.kind === "report-pod") {
      await reportPod({ goalId: goal.id, reason, details: details.trim() });
    } else {
      await reportMember({ userId: normalizedMember(safetyDialog.member).id, reason, details: details.trim() });
    }
    setSafetyDialog(null);
  };

  if (isLoading) {
    return <div className="mx-auto max-w-6xl p-6"><div className="h-[560px] animate-pulse rounded-3xl bg-gray-100 dark:bg-slate-800" /></div>;
  }

  if (isError || !goal) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-xl font-semibold">Pod unavailable</h1>
        <p className="mt-2 text-sm text-gray-500">It may have been removed, or you no longer have access.</p>
        <Link to="/pods" className="mt-5 inline-flex rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white">Back to Paddie Pods</Link>
      </div>
    );
  }

  return (
    <div className="pod-details-shell">
      <div className={cn("co-root pod-community-directory hidden lg:block", isSettingsOpen && "lg:hidden")}><CommunityDirectory selectedGroupId={goal.source_group_id || undefined} onCreateGroup={() => void navigate({ to: "/community", search: { create: true } })} /></div>

      <main className={cn("pod-details-pane", showChat && "pod-show-chat")} hidden={isSettingsOpen}>
        <header className="pod-details-header">
          <div className="pod-title-row">
            <Link to="/pods" aria-label="Back to pods" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-slate-800"><ArrowLeft size={20} /></Link>
            <button type="button" aria-label={showChat ? "Open task details" : "Open pod messages"} onClick={() => setShowChat((open) => !open)} className="pod-identity"><Avatar name={goal.title} className="h-10 w-10" /><h1 className="truncate text-base font-medium">{goal.title}</h1></button>
            <div className="pod-header-actions flex items-center gap-2">
              <button type="button" aria-label="Search pod messages" onClick={() => { setShowChat(true); setSearchRequested((count) => count + 1); }} className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-slate-800"><Search size={19} /></button>
              {!showChat && <button type="button" aria-label="Pod settings" onClick={() => setIsSettingsOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-slate-800"><Settings size={19} /></button>}
            </div>
          </div>

          <p className="pod-description" hidden={showChat}>{goal.description}</p>

          <nav className="pod-tabs" aria-label="Pod sections" hidden={showChat}>
            {tabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={cn("shrink-0 border-b-2 px-0.5 pb-3 text-sm font-medium", activeTab === tab.id ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200")}>{tab.label}</button>
            ))}
          </nav>
        </header>

        {showChat && conversationId && <div className="co pod-conversation"><ConversationChat conversationId={conversationId} podTitle={goal.title} canPost={!podReadOnly} canModerate={canManageMembers} searchRequested={searchRequested} onOpenDetails={() => { setShowChat(false); setActiveTab("details"); }} onOpenCheckin={() => { setShowChat(false); setActiveTab("checkin"); }} /></div>}
        <div className="pod-tab-content" hidden={showChat}>
          {podReadOnly && <p role="status" className="mb-5 rounded bg-blue-50 p-3 text-xs text-gray-500 dark:bg-slate-800">This pod is read-only. Eligible history and resources remain available.</p>}
          {activeTab === "details" && (
            <div className="space-y-7">
              {communityTask?.cover && <ProtectedTaskCover id={communityTask.id} title={communityTask.title} />}
              <section className="rounded-lg bg-white/60 p-3 dark:bg-slate-800/60">
                <div className="flex items-center justify-between text-sm"><span className="font-medium">Progress</span><span className="text-xs font-semibold text-blue-600">{progress}%</span></div>
                <div className="mt-2 h-4 overflow-hidden rounded-md bg-[#eee] dark:bg-slate-700" role="progressbar" aria-label="Average active-member task progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full rounded-md bg-primary-500 text-right pr-2 text-[10px] leading-4 text-white" style={{ width: `${progress}%` }}>{progress > 5 ? `${progress}%` : ""}</div></div>
              </section>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-2"><CalendarDays size={16} /> {formatDate(goal.start_date)} - {formatDate(goal.target_date)}</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} /> {(goal.checkin_frequency || "daily").toLowerCase().replaceAll("-", " ")} check-in</span>
              </div>
              <section>
                <div className="flex items-end justify-between"><div><h2 className="text-sm font-semibold text-gray-400">Milestones</h2><p className="mt-1 text-[10px] text-gray-400">You reached {completedTasks}/{tasks.length} milestones</p></div></div>
                <div className="mt-4 space-y-3">
                  {tasks.length === 0 && <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-slate-700">No milestones have been added yet.</p>}
                  {tasks.map((task) => (
                    <article key={task.id} className="flex gap-3">
                      <div className="flex w-10 flex-col items-center"><span className="h-full min-h-7 border-l-[3px] border-dashed border-primary-500" /><span className="py-1 text-[8px] text-gray-400">{formatDate(task.due_at).split(" ").slice(0, 2).join(" ")}</span><span className="h-full min-h-7 border-l-[3px] border-dashed border-blue-200" /></div>
                      <div className="flex-1 rounded-lg bg-[#d9e9ff] px-3 py-3 dark:bg-blue-950/25"><p className={cn("text-sm", task.completed && "line-through text-gray-400")}>{task.title}</p><p className="mt-1 text-[10px] text-gray-500">{formatDate(task.due_at || task.created_at)}</p></div>
                    </article>
                  ))}
                </div>
              </section>
              <p className="text-xs text-gray-400">Check-in participation: {participation.submitted}/{participation.total} submitted</p>
            </div>
          )}

          {activeTab === "members" && (
            <section>
              {canManageMembers && <button type="button" onClick={() => setIsShareOpen(true)} className="mb-6 flex w-full items-center gap-3 rounded-xl bg-blue-50 p-4 text-left text-sm font-semibold text-blue-600 dark:bg-blue-950/25 dark:text-blue-300"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white"><UserPlus size={18} /></span><span className="flex-1">Add users</span><ChevronRight size={18} /></button>}
              <p className="text-xs text-gray-500">{podMembers.length} members</p>
              {creator && <div className="mt-5"><p className="mb-2 text-xs text-gray-400">Creator</p><MemberRow member={creator} onClick={() => setSelectedMember(members.find((item) => normalizedMember(item).id === creator.id) || null)} /></div>}
              <div className="mt-6"><p className="mb-2 text-xs text-gray-400">Paddies</p><div className="divide-y divide-gray-100 dark:divide-slate-800">{ordinaryMembers.map((member) => <MemberRow key={member.id} member={member} onClick={() => setSelectedMember(members.find((item) => normalizedMember(item).id === member.id) || null)} />)}</div>{ordinaryMembers.length === 0 && <p className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500 dark:border-slate-700">No other members yet.</p>}</div>
            </section>
          )}

          {(["media", "links", "files"] as string[]).includes(activeTab) && conversationId && <div className="co"><ResourceList type={activeTab as "media" | "links" | "files"} conversationId={conversationId} /></div>}
          {activeTab === "checkin" && <CheckinPanel goalId={goal.id} communityPod={Boolean(goal.community_task_id)} readOnly={podReadOnly || goal.can_checkin === false} initialCheckinId={search.checkin} onLinkedCheckinClose={() => { void navigate({ to: "/pods/$id", params: { id }, search: { tab: "checkin" }, replace: true }); }} />}
        </div>
      </main>

      {isShareOpen && goal.community_task_id ? <PeoplePicker taskId={goal.community_task_id} onClose={() => setIsShareOpen(false)} /> : <ShareGoalModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} goalTitle={goal.title} shareLink={goal.invite_link || goal.public_share_link || goal.share_link} isSubmitting={isSharing} onSendInvites={(payload) => sharePod({ goalId: goal.id, payload }).then(() => undefined)} />}

      {selectedMember && <Modal title="Member profile" onClose={() => setSelectedMember(null)} compactHeader>
        {selectedMember && (() => {
          const member = normalizedMember(selectedMember);
          const canRemoveTarget = canManageMembers && !member.isOwner && (isOwner || !member.isAdmin);
          return <div className="text-center">
            <MemberAvatar member={member} size="lg" />
            <h2 className="mt-3 font-semibold">{member.name}</h2>
            <p className="mt-1 text-xs text-gray-400">{member.isOwner ? "Creator" : member.isAdmin ? "Moderator" : "Contributor"}</p>
            {member.id !== currentUserId && <button type="button" disabled={profileAction.pending} onClick={() => void profileAction.run(() => community.post<{ conversation_id: number }>(`users/${member.id}/message/`, { task_id: goal.community_task_id, goal_id: goal.id }), (data) => { void navigate({ to: "/messages", search: { conversation: data.conversation_id } }); })} className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-gray-50 text-sm disabled:opacity-50 dark:bg-slate-800"><MessageCircle size={15} /> Message</button>}
            <div className="mt-5 text-left"><MemberAchievements achievements={communityTask?.members.find((entry) => entry.user.id === member.id)?.user.achievements} /></div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-left"><InfoCard label="Role" value={member.isOwner ? "Creator" : member.isAdmin ? "Moderator" : "Member"} /><InfoCard label="Member since" value={formatDate(member.joinedAt)} /></div>
            {canManageRoles && !member.isOwner && <button type="button" disabled={isUpdatingRole || profileAction.pending} onClick={() => void profileAction.run(() => updateRole({ goalId: goal.id, userId: member.id, role: member.isAdmin ? "member" : "admin" }), () => setSelectedMember(null))} className="mt-4 min-h-10 w-full rounded-lg bg-blue-50 text-sm font-medium text-blue-600 disabled:opacity-50 dark:bg-blue-950/30 dark:text-blue-300">{member.isAdmin ? "Remove moderator role" : "Assign as moderator"}</button>}
            {canRemoveTarget && <button type="button" disabled={isRemovingMember} onClick={() => { setSelectedMember(null); setSafetyDialog({ kind: "remove-member", member: selectedMember }); }} className="mt-2 min-h-10 w-full rounded-lg bg-red-50 text-sm font-medium text-red-600 disabled:opacity-50 dark:bg-red-950/25 dark:text-red-300">Remove from pod</button>}
            {!member.isOwner && member.id !== currentUserId && <button type="button" onClick={() => { setSelectedMember(null); setSafetyDialog({ kind: "report-member", member: selectedMember }); }} className="mt-2 min-h-10 w-full text-sm text-gray-500">Report user</button>}
            {profileAction.error && <p role="alert" className="mt-3 text-sm text-red-500">{profileAction.error.message}</p>}
          </div>;
        })()}
      </Modal>}

      <section hidden={!isSettingsOpen} className="pod-settings">
        <header className="flex items-center gap-3"><button type="button" onClick={() => setIsSettingsOpen(false)} aria-label="Back to pod"><ArrowLeft size={20} /></button><h2 className="text-sm font-semibold">Settings</h2></header>
        <div className="mt-6 space-y-5">
          <label className="block"><span className="text-sm font-medium">Pod name</span><input value={settingsTitle} onChange={(event) => setSettingsTitle(event.target.value)} disabled={!canEditSettings || podReadOnly} className="mt-2 min-h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800" /></label>
          <label className="block"><span className="text-sm font-medium">Description</span><textarea value={settingsDescription} onChange={(event) => setSettingsDescription(event.target.value)} disabled={!canEditSettings || podReadOnly} rows={4} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800" /></label>
          <p className="text-xs text-gray-500">Created {formatDate(goal.created_at)} by <span className="font-medium text-blue-600">{goal.user.name}</span></p>
          {goal.community_task_id && <PodAdministration taskId={goal.community_task_id} onChanged={() => { void queryClient.invalidateQueries({ queryKey: ["goal"] }); void queryClient.invalidateQueries({ queryKey: ["goal-members"] }); void queryClient.invalidateQueries({ queryKey: ["community"] }); }} />}
          <div><h3 className="text-sm font-semibold">People</h3><button type="button" onClick={() => { setIsSettingsOpen(false); setActiveTab("members"); }} className="mt-3 flex min-h-11 w-full items-center gap-3 border-b border-gray-100 text-left text-sm dark:border-slate-800"><UsersRound size={17} /><span className="flex-1">Members</span><ChevronRight size={16} /></button></div>
          {canEditSettings && !podReadOnly && <div><h3 className="text-sm font-semibold">Pod type</h3><label className="mt-3 flex cursor-pointer items-start gap-3"><input type="radio" checked={settingsPublic} onChange={() => setSettingsPublic(true)} className="mt-1" /><span><span className="block text-sm font-medium">Public</span><span className="text-xs text-gray-500">Anyone with the invite can request to join</span></span></label><label className="mt-3 flex cursor-pointer items-start gap-3"><input type="radio" checked={!settingsPublic} onChange={() => setSettingsPublic(false)} className="mt-1" /><span><span className="block text-sm font-medium">Private</span><span className="text-xs text-gray-500">Only invited or approved members can contribute</span></span></label><button type="button" disabled={isSavingSettings || settingsAction.pending || !settingsTitle.trim()} onClick={() => void settingsAction.run(handleSaveSettings)} className="mt-5 min-h-11 w-full rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white disabled:opacity-50">{isSavingSettings || settingsAction.pending ? "Saving..." : "Save changes"}</button>{settingsAction.error && <p role="alert" className="mt-3 text-sm text-red-500">{settingsAction.error.message}</p>}</div>}
          {(!isOwner || goal.community_task_id) && <button type="button" onClick={() => { setIsSettingsOpen(false); setSafetyDialog({ kind: "leave" }); }} className="min-h-11 w-full text-left text-sm text-red-500">Exit pod</button>}
          {!isOwner && <button type="button" onClick={() => { setIsSettingsOpen(false); setSafetyDialog({ kind: "report-pod" }); }} className="min-h-11 w-full text-sm text-red-500">Report pod</button>}
        </div>
      </section>

      <SafetyModal dialog={safetyDialog} reason={reason} details={details} onReasonChange={setReason} onDetailsChange={setDetails} onClose={() => { setSafetyDialog(null); safetyAction.clearError(); }} onSubmit={() => void safetyAction.run(handleSafetySubmit)} transferCandidates={safetyDialog?.kind === "leave" && isOwner ? ordinaryMembers : []} transferTo={transferTo} onTransferChange={setTransferTo} isPending={isLeaving || isReportingPod || isReportingMember || isRemovingMember || safetyAction.pending} error={safetyAction.error?.message} />
    </div>
  );
};

const MemberRow = ({ member, onClick }: { member: ReturnType<typeof normalizedMember>; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="flex min-h-14 w-full items-center gap-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50">
    <MemberAvatar member={member} />
    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{member.name}</span>{member.isAdmin && !member.isOwner && <span className="text-xs text-blue-500">Moderator</span>}</span>
    <ChevronRight size={16} className="text-gray-400" />
  </button>
);

const InfoCard = ({ label, value }: { label: string; value: string }) => <div className="rounded-xl bg-gray-50 p-3 dark:bg-slate-800"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>;


const SafetyModal = ({ dialog, reason, details, onReasonChange, onDetailsChange, onClose, onSubmit, isPending, transferCandidates, transferTo, onTransferChange, error }: { dialog: SafetyDialog; reason: string; details: string; onReasonChange: (value: string) => void; onDetailsChange: (value: string) => void; onClose: () => void; onSubmit: () => void; isPending: boolean; transferCandidates: Array<ReturnType<typeof normalizedMember>>; transferTo?: number; onTransferChange: (value: number | undefined) => void; error?: string }) => {
  if (!dialog) return null;
  const isLeave = dialog?.kind === "leave";
  const isRemove = dialog?.kind === "remove-member";
  const options = isLeave ? leaveReasons : reportReasons;
  const title = isLeave ? "Exit Task" : isRemove ? "Remove from pod" : dialog?.kind === "report-member" ? `Report ${normalizedMember(dialog.member).name}` : "Report Pod";
  return <Modal title={title} onClose={onClose}>
    <p className="mt-2 text-center text-sm text-gray-500">{isLeave ? "Help us improve by sharing why you are leaving." : isRemove ? "A reason is required and the member will be notified." : "Your report is confidential and will be reviewed by our moderation team."}</p>
    <div className="mt-5 space-y-2">{options.map((option) => <label key={option.value} className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg bg-gray-50 px-3 text-sm dark:bg-slate-800"><span>{option.label}</span><input type="radio" checked={reason === option.value} onChange={() => onReasonChange(option.value)} /></label>)}</div>
    {isLeave && transferCandidates.length > 0 && <label className="mt-4 block text-sm">Choose a new owner (required)<select value={transferTo || ""} onChange={(event) => onTransferChange(event.target.value ? Number(event.target.value) : undefined)} className="mt-2 min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-800"><option value="">Select an active member</option>{transferCandidates.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>}
    <textarea value={details} onChange={(event) => onDetailsChange(event.target.value)} rows={4} placeholder="Additional feedback (optional)" className="mt-4 w-full rounded-lg border border-gray-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-800" />
    {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
    <button type="button" disabled={!reason || isPending || (isLeave && transferCandidates.length > 0 && !transferTo)} onClick={onSubmit} className={cn("mt-4 min-h-11 w-full rounded-lg text-sm text-white disabled:opacity-50", isLeave || isRemove ? "bg-red-400" : "bg-primary-500")}>{isPending ? "Submitting..." : isLeave ? "Leave Pod" : isRemove ? "Remove member" : "Submit report"}</button><button type="button" onClick={onClose} className="mt-2 min-h-10 w-full text-sm text-gray-500">Cancel</button>
  </Modal>;
};
