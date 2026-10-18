import { useEffect, useId, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { community, multipart, nextPage, type CommunityContext, type Group, type Member, type Person, type Task } from "./api";
import { Avatar, Choice, Empty, ErrorNotice, IconButton, Loading, Modal, useAction } from "./ui";

export function GroupWizard({ context, onClose, onCreated }: { context: CommunityContext; onClose: () => void; onCreated: (g: Group) => void }) {
  const [step, setStep] = useState(1); const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const [category, setCategory] = useState(""); const [image, setImage] = useState<File>(); const [visibility, setVisibility] = useState("public"); const action = useAction(); const [validation, setValidation] = useState("");
  return <section className="co-standalone co-wizard"><form onSubmit={e => {
    e.preventDefault(); setValidation("");
    if (image && image.size > 5 * 1024 * 1024) { setValidation("Group images must be 5 MB or smaller."); return; }
    if (step === 1) setStep(2);
    else void action.run(() => community.post<Group>("groups/", multipart({ name: name.trim(), description: description.trim(), category, image, visibility })), onCreated);
  }}><header className="co-page-header"><IconButton name="back" label={step === 1 ? "Cancel creation" : "Previous step"} onClick={() => step === 1 ? onClose() : setStep(1)} /><span>{step} of 2</span><button className="co-primary co-push" disabled={action.pending}>{step === 1 ? "Next" : action.pending ? "Creating..." : "Create Group"}</button></header>
    {step === 1 ? <div className="co-form"><h2>Name your group</h2><p className="co-muted">Name and description to help people understand what the group is about</p>
      <label>Group Name<input autoFocus required maxLength={255} value={name} onChange={e => setName(e.target.value)} placeholder="Group name" /></label>
      <label>Description<textarea required rows={4} maxLength={20000} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your group" /></label>
      <label>Category<select required value={category} onChange={e => setCategory(e.target.value)}><option value="">Choose a category</option>{context.categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
      <label>Group image (optional)<input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0])} /><small>If skipped, your group will use its initials. Maximum 5 MB.</small></label>
    </div> : <div className="co-form"><h2>Select group visibility</h2><p className="co-muted">Decide who can view, join and contribute in your group chat. You can change group type later in your settings.</p><Choice value="Public" description="Anyone can search and join eligible groups" checked={visibility === "public"} onChange={() => setVisibility("public")} /><Choice value="Private" description="Only approved members can join and contribute" checked={visibility === "private"} onChange={() => setVisibility("private")} /><p className="co-muted">A second admin must accept an invitation before other members can join.</p></div>}
    {validation && <ErrorNotice error={new Error(validation)} />}{action.error && <ErrorNotice error={action.error} />}
  </form></section>;
}

interface TaskDraft { title: string; description: string; start_date: string; target_date: string; invitation_deadline: string; category: string; checkin_frequency: string; custom_interval_days: number; member_limit: number; visibility: string; approval_required: boolean; milestones: { title: string; due_at: string }[]; limits_approval_reason: string }
const today = () => new Date().toISOString().slice(0, 10);
const dateAfter = (date: string, days: number) => new Date(new Date(`${date}T00:00:00Z`).getTime() + days * 86400000).toISOString().slice(0, 10);
export function TaskWizard({ group, context, onClose, onCreated }: { group: Group; context: CommunityContext; onClose: () => void; onCreated: (t: Task) => void }) {
  const userId = useAuthStore(state => state.user?.id);
  const key = `community-task-draft-${userId}-${group.id}`;
  const [draft, setDraft] = useState<TaskDraft>(() => {
    const initial: TaskDraft = { title: "", description: "", start_date: today(), target_date: "", invitation_deadline: "", category: group.category.name, checkin_frequency: "DAILY", custom_interval_days: 1, member_limit: 8, visibility: "public", approval_required: false, milestones: [], limits_approval_reason: "" };
    try { return { ...initial, ...JSON.parse(sessionStorage.getItem(key) || "{}") }; } catch { return initial; }
  });
  const [step, setStep] = useState(1); const [cover, setCover] = useState<File>(); const [validation, setValidation] = useState(""); const action = useAction();
  const [idempotencyKey] = useState(() => sessionStorage.getItem(`${key}-id`) || crypto.randomUUID());
  useEffect(() => { sessionStorage.setItem(key, JSON.stringify(draft)); sessionStorage.setItem(`${key}-id`, idempotencyKey); }, [draft, key, idempotencyKey]);
  const update = <K extends keyof TaskDraft>(name: K, value: TaskDraft[K]) => setDraft(prev => ({ ...prev, [name]: value }));
  const extended = draft.member_limit > 8 || (!!draft.target_date && draft.target_date > dateAfter(draft.start_date, 14));
  return <section className="co-standalone co-wizard"><form onSubmit={e => {
    e.preventDefault(); setValidation("");
    if (cover && (cover.size > 15 * 1024 * 1024 || !/^(image|video)\//.test(cover.type))) { setValidation("Use image or video cover media up to 15 MB."); return; }
    if (extended && !context.is_internal) { setValidation("More than 8 total members or 14 days requires internal-admin approval."); return; }
    if (step < 3) { setStep(step + 1); return; }
    const payload = { ...draft, group: group.id, cover, invitation_deadline: new Date(draft.invitation_deadline).toISOString(), milestones: draft.milestones.map(m => ({ ...m, due_at: m.due_at ? new Date(`${m.due_at}T12:00:00`).toISOString() : null })), approval_required: draft.visibility === "private" || draft.approval_required, invited_user_ids: [], idempotency_key: idempotencyKey };
    void action.run(() => community.post<Task>("tasks/", multipart(payload)), task => { sessionStorage.removeItem(key); sessionStorage.removeItem(`${key}-id`); onCreated(task); });
  }}><header className="co-page-header"><IconButton name="back" label={step === 1 ? "Close task creation" : "Previous step"} onClick={() => step === 1 ? onClose() : setStep(step - 1)} /><span>{step} of 3</span><button className="co-primary co-push" disabled={action.pending}>{step < 3 ? "Next" : action.pending ? "Creating..." : "Create Task"}</button></header>
    {step === 1 && <div className="co-form"><h2>Name your Task</h2><p className="co-muted">Name and description to help people understand what the task is about</p>
      <label>Cover media (optional)<span className="co-cover-upload"><Plus size={26} /><input aria-label="Cover media" type="file" accept="image/*,video/*" onChange={e => setCover(e.target.files?.[0])} /><span>{cover?.name || "Add image GIF or short video (max 15 MB)"}</span></span></label>
      <label>Task Name<input autoFocus required maxLength={255} value={draft.title} onChange={e => update("title", e.target.value)} placeholder="Name your task" /></label>
      <label>Description<textarea required rows={4} value={draft.description} onChange={e => update("description", e.target.value)} placeholder="Add description..." /></label>
      <label>Start date<input required type="date" min={today()} value={draft.start_date} onChange={e => update("start_date", e.target.value)} /></label>
      <label>Duration<input required type="date" min={draft.start_date} max={context.is_internal ? undefined : dateAfter(draft.start_date, 14)} value={draft.target_date} onChange={e => update("target_date", e.target.value)} /><small>Maximum duration of task is 2 weeks, unless approved by an internal admin.</small></label>
    </div>}
    {step === 2 && <div className="co-form"><h2>Customize your task</h2><p className="co-muted">Choose a category and set limits to your task</p>
      <label>Invitation closing Deadline<input required type="datetime-local" min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} max={`${draft.target_date}T23:59`} value={draft.invitation_deadline} onChange={e => update("invitation_deadline", e.target.value)} /><small>Deadline must be within task duration</small></label>
      <label>Category<select required value={draft.category} onChange={e => update("category", e.target.value)}>{context.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></label>
      <div className="co-form"><div className="co-between"><span>Milestone (optional)</span><button type="button" className="co-link" onClick={() => update("milestones", [...draft.milestones, { title: "", due_at: "" }])}><Plus size={14} /> Add milestone</button></div>
        {draft.milestones.map((m, i) => <div className="co-milestone-edit" key={i}><label>Title<input required value={m.title} onChange={e => update("milestones", draft.milestones.map((a, j) => j === i ? { ...a, title: e.target.value } : a))} /></label><label>Deadline<input type="date" min={draft.start_date} max={draft.target_date} value={m.due_at} onChange={e => update("milestones", draft.milestones.map((a, j) => j === i ? { ...a, due_at: e.target.value } : a))} /></label><button type="button" className="co-icon-button" aria-label="Remove milestone" onClick={() => update("milestones", draft.milestones.filter((_, j) => j !== i))}><Trash2 size={17} /></button></div>)}
      </div>
      <label>How often should your pod check in?<select value={draft.checkin_frequency} onChange={e => update("checkin_frequency", e.target.value)}><option value="DAILY">Daily</option><option value="3-DAYS">Every 3 days</option><option value="WEEKLY">Weekly</option><option value="BI-WEEKLY">Every 2 weeks</option><option value="CUSTOM">Custom interval</option></select></label>
      {draft.checkin_frequency === "CUSTOM" && <label>Days between check-ins<input required type="number" min={1} max={365} value={draft.custom_interval_days} onChange={e => update("custom_interval_days", Number(e.target.value))} /></label>}
      <label>Total members (including you)<input required type="number" min={1} max={context.is_internal ? 10000 : 8} value={draft.member_limit} onChange={e => update("member_limit", Number(e.target.value))} /><small>8 total members includes the creator and up to 7 others.</small></label>
      {extended && context.is_internal && <label>Internal-admin exception reason<textarea required value={draft.limits_approval_reason} onChange={e => update("limits_approval_reason", e.target.value)} /></label>}
    </div>}
    {step === 3 && <div className="co-form"><h2>Select task visibility</h2><p className="co-muted">Decide who can join your group task.</p><Choice value="Public" description="Eligible users can join while enrollment is open" checked={draft.visibility === "public"} onChange={() => update("visibility", "public")} /><Choice value="Private" description="Only approved members can join" checked={draft.visibility === "private"} onChange={() => update("visibility", "private")} />{draft.visibility === "public" && <label className="co-check"><input type="checkbox" checked={draft.approval_required} onChange={e => update("approval_required", e.target.checked)} />Require approval</label>}<p className="co-muted">Creating this task also creates its linked Paddie Pod. Invitations do not add members until accepted.</p></div>}
    {validation && <ErrorNotice error={new Error(validation)} />}{action.error && <ErrorNotice error={action.error} />}
  </form></section>;
}

export function PeoplePicker({ groupId, taskId, onClose }: { groupId?: number; taskId?: number; onClose: () => void }) {
  const [search, setSearch] = useState(""); const [selected, setSelected] = useState<number[]>([]); const [role, setRole] = useState("member"); const [sent, setSent] = useState(false); const action = useAction();
  const currentUserId = useAuthStore(s => s.user?.id);
  const users = useInfiniteQuery({ queryKey: ["community", "users", search, groupId, taskId], initialPageParam: 1, queryFn: ({ pageParam }) => community.list<Person>("users/", { search, group: groupId, task: taskId, page: pageParam }), getNextPageParam: last => nextPage(last.next) });
  const members = useQuery({ queryKey: taskId ? ["community", "task-members", taskId] : ["community", "members", groupId, "active"], queryFn: () => community.get<Member[]>(taskId ? `tasks/${taskId}/members/` : `groups/${groupId}/members/`, { state: "active" }), enabled: !!taskId || !!groupId, refetchInterval: 10000 });
  const existingIds = new Set((members.data || []).filter(member => member.state === "active").map(member => member.user.id));
  const eligible = (id: number) => id !== currentUserId && !existingIds.has(id);
  const selectedIds = selected.filter(eligible);
  const people = users.data?.pages.flatMap(p => p.results).filter(person => eligible(person.id)) || [];
  return <Modal title="Add Members" wide onClose={onClose}><form className="co-form" onSubmit={e => { e.preventDefault(); void action.run(async () => {
    if (members.isPending || members.error || !selectedIds.length) throw new Error("Choose people who are not already active members.");
    if (taskId) await community.post(`tasks/${taskId}/invitations/`, { user_ids: selectedIds });
    else for (const id of selectedIds) await community.post(`groups/${groupId}/members/`, { user_id: id, action: "invite", role });
  }, () => { setSelected([]); setSent(true); }); }}>
    <label className="co-search"><span className="sr-only">Search people</span><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name" /></label>
    {groupId && <label>Invite as<select value={role} onChange={e => setRole(e.target.value)}><option value="member">Member</option><option value="admin">Admin</option><option value="moderator">Moderator</option></select></label>}
    <p className="co-muted">{taskId ? "People outside the source group join only this task and pod." : "Invitations must be accepted. Invite a second admin to open member joins."}</p>
    {members.isPending || users.isPending ? <Loading /> : members.error ? <ErrorNotice error={members.error} retry={() => void members.refetch()} /> : users.error ? <ErrorNotice error={users.error} retry={() => void users.refetch()} /> : !people.length ? <Empty>No eligible people found.</Empty> : people.map(person => <label className="co-person-row" key={person.id}><span className="co-person"><Avatar src={person.avatar} name={person.name} className="co-avatar-sm" />{person.name}</span><input type="checkbox" checked={selectedIds.includes(person.id)} onChange={() => { setSent(false); setSelected(prev => prev.includes(person.id) ? prev.filter(id => id !== person.id) : [...prev, person.id]); }} /></label>)}
    {users.hasNextPage && <button type="button" className="co-load-more" disabled={users.isFetchingNextPage} onClick={() => void users.fetchNextPage()}>Load more people</button>}{sent && <p role="status">Invitations sent.</p>}{action.error && <ErrorNotice error={action.error} />}<button className="co-primary" disabled={!selectedIds.length || action.pending || members.isPending || !!members.error}>{action.pending ? "Inviting..." : "Invite selected"}</button>
  </form></Modal>;
}

export function PollComposer({ conversation, onClose }: { conversation: number; onClose: () => void }) {
  const [question, setQuestion] = useState(""); const [options, setOptions] = useState(["", ""]); const [multiple, setMultiple] = useState(false); const action = useAction();
  const formId = useId();
  return <Modal title="New Poll" onClose={onClose} headerAction={<button className="co-link" type="submit" form={formId} disabled={action.pending || !question.trim() || options.some(o => !o.trim()) || new Set(options.map(o => o.trim().toLowerCase())).size !== options.length}>{action.pending ? "Sending..." : "Send"}</button>}><form id={formId} className="co-form" onSubmit={e => { e.preventDefault(); void action.run(() => community.post("messages/", { conversation, text: "", poll: { question: question.trim(), options: options.map(o => o.trim()), multiple_answers: multiple } }), onClose); }}>
    <label>Questions<input autoFocus required value={question} maxLength={500} onChange={e => setQuestion(e.target.value)} /></label><label>Options</label><div className="co-poll-options">{options.map((item, i) => <div className="co-between" key={i}><input aria-label={`Option ${i + 1}`} required value={item} maxLength={255} onChange={e => setOptions(prev => prev.map((o, j) => i === j ? e.target.value : o))} />{options.length > 2 && <button type="button" aria-label={`Remove option ${i + 1}`} onClick={() => setOptions(prev => prev.filter((_, j) => i !== j))}><Trash2 size={16} /></button>}</div>)}{options.length < 10 && <button type="button" className="co-link" onClick={() => setOptions(prev => [...prev, ""])}>Add option</button>}</div><label className="co-choice">Allow multiple answers<input className="co-toggle" role="switch" type="checkbox" checked={multiple} onChange={e => setMultiple(e.target.checked)} /></label>{action.error && <ErrorNotice error={action.error} />}
  </form></Modal>;
}
