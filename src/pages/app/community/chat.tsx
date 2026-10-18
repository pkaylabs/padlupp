import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal, X } from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { WS_BASE_URL } from "@/constants";
import { CheckinSummaryModal } from "@/pages/app/goals/components/checkin-panel";
import { useGoalCheckins } from "@/pages/app/goals/hooks/useCheckins";
import { getGoalMembers } from "@/pages/app/goals/api";
import { community, isAccessError, multipart, nextPage, type Group, type Message, type Person, type PostType, type Task } from "./api";
import { Attachment, Avatar, Empty, ErrorNotice, Icon, IconButton, Loading, Modal, PersonRow, ProtectedTaskCover, ReasonDialog, SafeText, dateLabel, reportReasons, timeLabel, useAction } from "./ui";
import { PollComposer } from "./forms";

export interface ConversationChatProps {
  conversationId: number;
  canPost: boolean;
  canModerate: boolean;
  postPermissions?: Partial<Record<PostType, boolean>>;
  group?: Group | null;
  podTitle?: string;
  onCreateTask?: () => void;
  onOpenDetails?: () => void;
  onOpenCheckin?: (goalId: number) => void;
  searchRequested?: number;
  onOpenRules?: () => void;
}

export function TaskCard({ id, task: initial }: { id: number; task?: Task }) {
  const query = useQuery({ queryKey: ["community", "task", id], queryFn: () => community.get<Task>(`tasks/${id}/`), initialData: initial, refetchInterval: 10000 });
  const task = query.data; const action = useAction();
  if (query.error) return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  if (!task) return <Loading />;
  const accepted = task.membership?.state === "active" || task.membership?.state === "left" || task.can_manage;
  return <div className={`co-task-card ${task.visibility === "private" ? "co-task-private" : ""}`}>
    {task.cover && <ProtectedTaskCover id={task.id} title={task.title} />}
    <div className="co-between"><strong>{task.title}</strong><span className="co-status">{task.status}</span></div><p>{task.description}</p>
    <div className="co-center">{task.member_count}/{task.member_limit} members</div>
    {accepted ? <Link to="/pods/$id" params={{ id: String(task.pod_id) }} className="co-primary">Open Pod</Link> : task.invitation_status === "pending" ? <div className="co-between"><button className="co-primary" disabled={action.pending || task.enrollment_status !== "open"} onClick={() => void action.run(() => community.post(`tasks/${id}/respond/`, { decision: "accept" }))}>{task.enrollment_status === "open" ? "Accept invitation" : task.enrollment_status}</button><button className="co-text-button" disabled={action.pending} onClick={() => void action.run(() => community.post(`tasks/${id}/respond/`, { decision: "decline" }))}>Decline</button></div> : <button className="co-primary" disabled={!task.can_join || action.pending} onClick={() => void action.run(() => community.post(`tasks/${id}/join/`))}>{task.enrollment_status !== "open" ? task.enrollment_status : task.membership?.state === "pending" ? "Awaiting approval" : task.visibility === "private" || task.approval_required ? "Request to join task" : "Join Task"}</button>}
    {action.error && <ErrorNotice error={action.error} />}
  </div>;
}

function MessagePoll({ message, canVote }: { message: Message; canVote: boolean }) {
  const userId = useAuthStore(s => s.user?.id); const poll = message.poll!;
  const serverChoice = poll.options.filter(o => o.votes.some(p => p.id === userId)).map(o => o.id);
  const [choice, setChoice] = useState(serverChoice); const [votes, setVotes] = useState(false); const action = useAction();
  const signature = serverChoice.join(",");
  useEffect(() => { setChoice(signature ? signature.split(",").map(Number) : []); }, [signature]);
  const total = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  return <div className="co-poll-card"><strong>{poll.question}</strong><small>{poll.multiple_answers ? "Select one or more answers" : "Select one answer"}</small>
    {poll.options.map(o => <label key={o.id} className="co-poll-option"><input type={poll.multiple_answers ? "checkbox" : "radio"} name={`poll-${poll.id}`} checked={choice.includes(o.id)} disabled={!canVote || action.pending} onChange={() => setChoice(prev => poll.multiple_answers ? prev.includes(o.id) ? prev.filter(v => v !== o.id) : [...prev, o.id] : [o.id])} /><span>{o.text}<span className="co-poll-meter" style={{ width: `${total ? o.votes.length / total * 100 : 0}%` }} /></span><small>{o.votes.length}</small></label>)}
    <div className="co-between"><button className="co-link" onClick={() => setVotes(true)}>View Votes ({total})</button>{canVote && <button className="co-primary" disabled={!choice.length || action.pending} onClick={() => void action.run(() => community.post(`messages/${message.id}/vote/`, { option_ids: choice }))}>Vote</button>}</div>
    {action.error && <ErrorNotice error={action.error} />}{votes && <Modal title="Votes" onClose={() => setVotes(false)}><div className="co-form">{poll.options.map(o => <section key={o.id}><h3>{o.text}</h3>{o.votes.length ? o.votes.map(p => <PersonRow key={p.id} person={p} />) : <p className="co-muted">No votes yet</p>}</section>)}</div></Modal>}
  </div>;
}

function cycleToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function CheckinPromptCard({ goalId, cycleDate, canPost, onOpenCheckin }: { goalId: number; cycleDate: string; canPost: boolean; onOpenCheckin?: (goalId: number) => void }) {
  const userId = useAuthStore(s => s.user?.id);
  const query = useGoalCheckins(goalId);
  const roster = useQuery({ queryKey: ["goal-members", String(goalId)], queryFn: () => getGoalMembers(goalId), refetchInterval: 10000 });
  const activeIds = new Set((roster.data || []).map(member => member.user_id || member.user?.id || member.id));
  const dates = [...new Set((query.data || []).map(record => record.scheduled_for))].sort();
  const index = dates.indexOf(cycleDate);
  const participants = [...new Map((query.data || []).filter(record => record.scheduled_for === cycleDate && activeIds.has(record.user.id)).map(record => [record.user.id, record])).values()];
  const submitted = participants.filter(record => !!record.submitted_at);
  const mine = participants.find(record => record.user.id === userId);
  const canSubmit = canPost && !!mine && !mine.submitted_at && cycleDate === cycleToday() && !query.error && !roster.error;
  const label = mine?.submitted_at ? "Checked in" : !canPost ? "Read-only" : "Check-in";
  return <section className="co-checkin-prompt" aria-label={index >= 0 ? `Check-in ${index + 1}` : "Scheduled check-in"}>
    <h3>{index >= 0 ? `Check-in ${index + 1}` : "Check-in"}</h3>
    {query.isPending || roster.isPending ? <p className="co-checkin-participation" role="status">Loading check-in...</p> : query.error || roster.error ? <ErrorNotice error={query.error || roster.error} retry={() => { void query.refetch(); void roster.refetch(); }} /> : <>
      <div className="co-checkin-avatars" aria-label="Members who checked in">{submitted.slice(0, 2).map(record => <Avatar key={record.user.id} src={record.user.avatar} name={record.user.name} className="co-checkin-avatar" />)}{submitted.length > 2 && <span className="co-checkin-avatar-count" title={submitted.slice(2).map(record => record.user.name).join(", ")}>+{submitted.length - 2}</span>}</div>
      <p className="co-checkin-participation" aria-live="polite">{activeIds.size ? `${submitted.length}/${activeIds.size} members checked in` : "No active participants available for this cycle"}</p>
    </>}
    {canSubmit && !onOpenCheckin ? <Link to="/pods/$id" params={{ id: String(goalId) }} className="co-checkin-button">Check-in</Link> : <button className="co-checkin-button" disabled={!canSubmit} onClick={() => onOpenCheckin?.(goalId)}>{label}</button>}
  </section>;
}

export function ConversationChat({ conversationId, canPost, canModerate, postPermissions = {}, group = null, podTitle, onCreateTask, onOpenDetails, onOpenCheckin, searchRequested, onOpenRules }: ConversationChatProps) {
  const client = useQueryClient(); const user = useAuthStore(s => s.user); const token = useAuthStore(s => s.token); const action = useAction();
  const [text, setText] = useState(""); const [attachment, setAttachment] = useState<File>(); const [reply, setReply] = useState<Message | null>(null);
  const [tools, setTools] = useState(false); const [poll, setPoll] = useState(false); const [selected, setSelected] = useState<number[]>([]); const [menu, setMenu] = useState<Message | null>(null);
  const [deleteIds, setDeleteIds] = useState<number[] | null>(null); const [deleteReason, setDeleteReason] = useState(""); const [report, setReport] = useState<Message | null>(null); const [reactors, setReactors] = useState<{ emoji: string; people: Person[] } | null>(null);
  const [search, setSearch] = useState(""); const [searchOpen, setSearchOpen] = useState(false); const [summary, setSummary] = useState<number | null>(null);
  const [copied, setCopied] = useState(false); const end = useRef<HTMLDivElement>(null); const fileInput = useRef<HTMLInputElement>(null);
  const [accept, setAccept] = useState("image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx");
  const [capture, setCapture] = useState(false);
  const query = useInfiniteQuery({ queryKey: ["community", "messages", conversationId, search], initialPageParam: 1,
    queryFn: ({ pageParam }) => community.list<Message>("messages/", { conversation: conversationId, page: pageParam, search, ordering: "-created_at" }),
    getNextPageParam: last => nextPage(last.next), refetchInterval: 5000, retry: (count, error) => !isAccessError(error) && count < 1,
  });
  const accessDenied = isAccessError(query.error);
  const messages = useMemo(() => accessDenied ? [] : [...new Map((query.data?.pages.flatMap(p => p.results) || []).map(m => [m.id, m])).values()].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), [query.data, accessDenied]);
  const displayedMessages = useMemo(() => {
    if (!podTitle) return messages;
    const isTodayPrompt = (message: Message) => !message.is_recalled && !message.deletion_kind && message.metadata?.event === "checkin_due" && message.metadata?.cycle_date === cycleToday();
    return [...messages.filter(message => !isTodayPrompt(message)), ...messages.filter(isTodayPrompt)];
  }, [messages, podTitle]);
  useEffect(() => {
    if (!accessDenied) return;
    setMenu(null); setReply(null); setSummary(null); setReport(null); setReactors(null); setPoll(false); setTools(false); setDeleteIds(null); setSelected([]); setAttachment(undefined); setText("");
  }, [accessDenied]);
  useEffect(() => {
    setMenu(current => current ? messages.find(m => m.id === current.id) || null : null);
    setReply(current => current ? messages.find(m => m.id === current.id && !m.is_recalled && !m.deletion_kind) || null : null);
  }, [messages]);
  const latest = messages.at(-1)?.id;
  useEffect(() => { if (searchRequested) setSearchOpen(true); }, [searchRequested]);
  useEffect(() => { if (!search) end.current?.scrollIntoView({ block: "end" }); }, [latest, search]);
  useEffect(() => {
    if (!token || accessDenied) return;
    const socket = new WebSocket(`${WS_BASE_URL}/ws/chat/${conversationId}/?token=${encodeURIComponent(token)}`);
    socket.onmessage = () => { void client.invalidateQueries({ queryKey: ["community"] }); void client.invalidateQueries({ queryKey: ["goal-checkins"] }); };
    socket.onclose = event => { if (event.code === 4003 || event.code === 4403) { client.removeQueries({ queryKey: ["community", "messages", conversationId] }); void client.invalidateQueries({ queryKey: ["community"] }); } };
    return () => { socket.onmessage = null; socket.onclose = null; socket.close(); };
  }, [conversationId, token, client, accessDenied]);
  useEffect(() => { setText(""); setAttachment(undefined); setReply(null); setSelected([]); setMenu(null); setSearch(""); }, [conversationId]);
  const permitted = (type: PostType) => canPost && postPermissions[type] !== false;
  const hasLinks = /https?:\/\/[^\s<>]+/i.test(text);
  const hasPlainText = !!text.replace(/https?:\/\/[^\s<>]+/gi, "").trim();
  const textAllowed = (!hasLinks || permitted("link")) && (!hasPlainText || permitted("text"));
  const selectedMessages = messages.filter(m => (deleteIds || selected).includes(m.id));
  const canDeleteAll = selectedMessages.length > 0 && selectedMessages.length === (deleteIds || selected).length && selectedMessages.every(m => !m.is_recalled && !m.deletion_kind && m.can_delete_everyone);
  const requiresReason = selectedMessages.some(m => !m.can_recall && m.can_moderate);
  function chooseFile(types: string, camera = false) { setAccept(types); setCapture(camera); setTools(false); requestAnimationFrame(() => fileInput.current?.click()); }
  async function remove(scope: "me" | "everyone") {
    return action.run(() => community.post("messages/delete-selection/", { ids: deleteIds || selected, scope, reason: scope === "everyone" ? deleteReason.trim() : undefined }), () => { setDeleteIds(null); setSelected([]); setMenu(null); setReply(null); setDeleteReason(""); });
  }
  const error = query.error || action.error;
  if (accessDenied) return <section className={`co-chat ${podTitle ? "co-chat-pod" : ""}`} aria-label="Conversation"><ErrorNotice error={query.error} retry={() => void query.refetch()} /></section>;
  return <section className={`co-chat ${podTitle ? "co-chat-pod" : ""}`} aria-label="Conversation">
    {searchRequested === undefined && <div className="co-chat-search-controls"><IconButton name="search" label="Search messages" onClick={() => setSearchOpen(v => !v)} />{onOpenDetails && <IconButton name="settings" label="Conversation details" onClick={onOpenDetails} />}</div>}
    {searchOpen && <label className="co-search"><span className="sr-only">Search messages</span><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search this conversation" /><button className="co-icon-button" onClick={() => { setSearchOpen(false); setSearch(""); }} aria-label="Close search"><X size={18} /></button></label>}
    {group?.rules?.[0] && <button className="co-guideline-strip" onClick={onOpenRules || onOpenDetails}><Icon name="guidelines" /><span>{group.rules[0]}</span></button>}
    {!!selected.length && <div className="co-selection"><button className="co-link" onClick={() => setSelected([])}>Cancel</button><span>{selected.length} selected</span><button className="co-danger" onClick={() => { setDeleteReason(""); setDeleteIds(selected); }}>Delete</button></div>}
    <div className="co-chat-scroll">
      {podTitle && !search && <div className="co-pod-welcome"><h2>Welcome to {podTitle}</h2>{onOpenDetails && <button className="co-primary" onClick={onOpenDetails}>Task details</button>}</div>}
      {group && !search && <div className="co-welcome"><p>Welcome to {group.name}</p><p>{group.description}</p><button className="co-link" onClick={onOpenRules || onOpenDetails}>View guidelines</button></div>}
      {query.hasNextPage && <button className="co-load-more" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>{query.isFetchingNextPage ? "Loading..." : "Load earlier messages"}</button>}
      {query.isPending ? <Loading /> : error ? <ErrorNotice error={error} retry={() => void query.refetch()} /> : !messages.length ? <Empty>{search ? "No matching messages." : "No messages yet. Start the conversation."}</Empty> : null}
      {!query.error && displayedMessages.map(m => {
        const own = m.sender?.id === user?.id; const deleted = !!m.is_recalled || !!m.deletion_kind;
        const taskId = Number(m.metadata?.community_task_id); const checkinId = Number(m.metadata?.checkin_id); const goalId = Number(m.metadata?.goal_id || m.metadata?.pod_id);
        const cycleDate = typeof m.metadata?.cycle_date === "string" ? m.metadata.cycle_date : "";
        if (!deleted && m.metadata?.event === "checkin_due" && goalId && cycleDate) {
          // Figma keeps the scheduled prompt visible only during its deadline day.
          if (cycleDate !== cycleToday()) return null;
          return <article key={m.id} id={`community-message-${m.id}`} className={`co-checkin-prompt-message ${selected.includes(m.id) ? "co-message-selected" : ""}`} onContextMenu={e => { e.preventDefault(); setMenu(m); }}>
            {!!selected.length && <input type="checkbox" aria-label="Select scheduled check-in prompt" checked={selected.includes(m.id)} onChange={() => setSelected(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : prev.length < 100 ? [...prev, m.id] : prev)} />}
            <CheckinPromptCard goalId={goalId} cycleDate={cycleDate} canPost={canPost} onOpenCheckin={onOpenCheckin} />
            <button className="co-message-menu co-icon-button" aria-label="Actions for scheduled check-in prompt" onClick={() => { setMenu(m); setCopied(false); }}><MoreHorizontal size={20} /></button>
          </article>;
        }
        const uniqueReactions = [...new Set((m.reactions || []).map(r => r.emoji))];
        const podSubmission = !!podTitle && !deleted && m.kind === "checkin" && !!checkinId;
        return <article key={m.id} className={`co-message ${own ? "co-message-own" : ""} ${podSubmission ? "co-message-submitted" : ""} ${taskId || m.poll ? "co-message-rich" : ""} ${selected.includes(m.id) ? "co-message-selected" : ""}`} id={`community-message-${m.id}`} onContextMenu={e => { e.preventDefault(); setMenu(m); }}>
          {!!selected.length && <input type="checkbox" aria-label={`Select message from ${m.sender.name}`} checked={selected.includes(m.id)} onChange={() => setSelected(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : prev.length < 100 ? [...prev, m.id] : prev)} />}
          {podSubmission && <span className="co-pod-checkin-avatar" aria-hidden="true"><img src="/community-assets/party-popper.svg" alt="" /></span>}
          <Avatar src={m.sender?.avatar} name={m.sender?.name} className={`co-message-avatar ${podSubmission ? "co-pod-submitted-avatar" : ""}`} />
          <div className="co-message-main"><div className="co-message-meta"><strong>{own ? "Me" : m.sender?.name}</strong><time dateTime={m.created_at} title={dateLabel(m.created_at)}>{timeLabel(m.created_at)}</time>{m.is_pinned && <Icon name="pin" />}</div>
            <div className={`co-message-body ${deleted ? "co-deleted" : ""}`}>
              {deleted ? m.deletion_kind === "moderator" ? "This message was removed by a moderator" : "This message was deleted" : <>
                {m.reply_to && <blockquote><strong>{m.reply_to.sender_name}</strong><p>{m.reply_to.text || m.reply_to.attachment_name || "Message unavailable"}</p></blockquote>}
                {taskId ? <TaskCard id={taskId} /> : podSubmission ? <button className="co-pod-checkin-button" aria-label={`View ${m.sender.name}'s check-in summary`} onClick={() => setSummary(checkinId)}><strong>{m.sender.name}</strong> just checked in</button> : m.kind === "checkin" ? <div className="co-checkin-summary"><SafeText text={m.text} />{checkinId ? <button className="co-link" onClick={() => setSummary(checkinId)}>View check-in summary</button> : goalId ? onOpenCheckin ? <button className="co-primary" onClick={() => onOpenCheckin(goalId)}>Check-in</button> : <Link to="/pods/$id" params={{ id: String(goalId) }} className="co-primary">Open pod check-ins</Link> : null}</div> : <SafeText text={m.text} />}
                {m.attachment && <Attachment id={m.id} name={m.attachment_name || "Attachment"} mime={m.attachment_mime || "application/octet-stream"} preview />}
                {m.poll && <MessagePoll message={m} canVote={canPost} />}
              </>}
            </div>
            {podTitle && <time className="co-pod-message-time" dateTime={m.created_at} title={dateLabel(m.created_at)}>{timeLabel(m.created_at)}</time>}
            {!!uniqueReactions.length && <div className="co-reactions">{uniqueReactions.map(emoji => { const people = m.reactions.filter(r => r.emoji === emoji).map(r => r.user); return <button key={emoji} title={people.map(p => p.name).join(", ")} onClick={() => setReactors({ emoji, people })}>{emoji} {people.length}</button>; })}</div>}
          </div><button className="co-message-menu co-icon-button" aria-label={`Actions for message from ${m.sender?.name}`} onClick={() => { setMenu(m); setCopied(false); }}><MoreHorizontal size={20} /></button>
        </article>;
      })}<div ref={end} />
    </div>
    {error && !query.error && <ErrorNotice error={error} />}
    {canPost ? <div className="co-composer-area">
      {reply && <div className="co-reply-preview"><span>Replying to {reply.sender.name}<small>{reply.text || reply.attachment_name}</small></span><button className="co-icon-button" aria-label="Cancel reply" onClick={() => setReply(null)}><X size={17} /></button></div>}
      {attachment && <div className="co-reply-preview"><span>{attachment.name} <small>{(attachment.size / 1024 / 1024).toFixed(1)} MB</small></span><button aria-label="Remove attachment" onClick={() => setAttachment(undefined)}><X size={17} /></button></div>}
      {tools && <div className="co-composer-tools">
        {(permitted("image") || permitted("video")) && <><button title="Share photos and videos" onClick={() => chooseFile([permitted("image") ? "image/*" : "", permitted("video") ? "video/*" : ""].filter(Boolean).join(","))}><Icon name="photos" />{permitted("image") ? "Photos" : "Videos"}</button><button onClick={() => chooseFile([permitted("image") ? "image/*" : "", permitted("video") ? "video/*" : ""].filter(Boolean).join(","), true)}><Icon name="camera" />Camera</button></>}
        {permitted("document") && <button onClick={() => chooseFile(".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.csv,.zip")}><Icon name="document" />Documents</button>}
        {permitted("poll") && <button onClick={() => { setTools(false); setPoll(true); }}><Icon name="poll" />Poll</button>}
        {group && onCreateTask && permitted("task") && <button onClick={onCreateTask}><Icon name="task" />Task</button>}
      </div>}
      <form className="co-composer" onSubmit={e => { e.preventDefault(); if ((!text.trim() && !attachment) || !textAllowed) return; void action.run(() => community.post("messages/", attachment ? multipart({ conversation: conversationId, text: text.trim(), attachment, reply_to_message_id: reply?.id }) : { conversation: conversationId, text: text.trim(), reply_to_message_id: reply?.id }), () => { setText(""); setAttachment(undefined); setReply(null); }); }}>
        <IconButton name="tools" label="Add photos, videos, documents, poll or task" onClick={() => setTools(v => !v)} /><input ref={fileInput} type="file" hidden accept={accept} capture={capture ? "environment" : undefined} onChange={e => { setAttachment(e.target.files?.[0]); e.target.value = ""; }} />
        <label className="co-message-input"><span className="sr-only">Type a message</span><textarea rows={1} placeholder={permitted("text") ? "Type a message" : permitted("link") ? "Share a link" : "Text posts are disabled"} disabled={!permitted("text") && !permitted("link")} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} /></label>
        <button className="co-send" aria-label="Send message" disabled={action.pending || (!text.trim() && !attachment) || !textAllowed}><Icon name="send" /></button>
      </form>
    </div> : <p className="co-readonly">This conversation is read-only for you.</p>}
    {poll && <PollComposer conversation={conversationId} onClose={() => setPoll(false)} />}
    {summary && <CheckinSummaryModal checkinId={summary} readOnly={!canPost} onClose={() => setSummary(null)} />}
    {menu && <Modal title="Message actions" onClose={() => setMenu(null)}><div className="co-message-actions">
      {!menu.is_recalled && !menu.deletion_kind && canPost && <div className="co-emoji-bar">{["\u2764\ufe0f", "\ud83d\udc4d", "\ud83d\ude0a", "\ud83d\ude02", "\ud83d\ude0d", "\ud83d\udc4c", "\ud83d\ude01"].map(emoji => <button key={emoji} aria-label={`React ${emoji}`} disabled={action.pending} onClick={() => void action.run(() => community.post(`messages/${menu.id}/react/`, { emoji }), () => setMenu(null))}>{emoji}</button>)}</div>}
      <p className="co-menu-message"><strong>{menu.sender.name}</strong><SafeText text={menu.text || menu.attachment_name} /></p>
      {canPost && !menu.is_recalled && !menu.deletion_kind && <button onClick={() => { setReply(menu); setMenu(null); }}><Icon name="reply" />Reply</button>}
      {menu.text && <button onClick={() => void action.run(() => navigator.clipboard.writeText(menu.text || ""), () => setCopied(true))}><Icon name="copy" />{copied ? "Copied" : "Copy"}</button>}
      <button onClick={() => { setReport(menu); setMenu(null); }}><Icon name="alert" />Report</button>
      {(canModerate || canPost) && !menu.is_recalled && !menu.deletion_kind && <button disabled={action.pending} onClick={() => void action.run(() => community.post(`messages/${menu.id}/pin/`, { pinned: !menu.is_pinned }), () => setMenu(null))}><Icon name="pin" />{menu.is_pinned ? "Unpin" : "Pin"}</button>}
      <button className="co-danger" onClick={() => { setDeleteIds([menu.id]); setDeleteReason(""); setMenu(null); }}><Icon name="delete" />Delete</button>
      <button onClick={() => { setSelected([menu.id]); setMenu(null); }}><Icon name="select" />Select</button>{action.error && <ErrorNotice error={action.error} />}
    </div></Modal>}
    {deleteIds && <Modal title="Delete messages" onClose={() => setDeleteIds(null)}><div className="co-form"><p>Delete {deleteIds.length} {deleteIds.length === 1 ? "message" : "messages"}?</p><button className="co-danger-fill" disabled={action.pending} onClick={() => void remove("me")}>Delete for me</button>{canDeleteAll ? <>{requiresReason && <label>Moderation reason (required)<textarea required value={deleteReason} onChange={e => setDeleteReason(e.target.value)} /></label>}<button className="co-danger-fill" disabled={action.pending || (requiresReason && !deleteReason.trim())} onClick={() => void remove("everyone")}>Delete for everyone</button></> : <p className="co-muted">Delete for everyone requires every selected message to be eligible. Your own messages have a 15-minute recall window; moderators can remove messages with a reason.</p>}{action.error && <ErrorNotice error={action.error} />}<button className="co-text-button" onClick={() => setDeleteIds(null)}>Cancel</button></div></Modal>}
    {report && <ReasonDialog title="Report message" reasons={reportReasons} onClose={() => setReport(null)} onSubmit={(reason, details) => community.post(`messages/${report.id}/report/`, { reason, details })} />}
    {reactors && <Modal title={`${reactors.emoji} Reactions`} onClose={() => setReactors(null)}><div className="co-form">{reactors.people.map(p => <PersonRow key={p.id} person={p} />)}</div></Modal>}
  </section>;
}
