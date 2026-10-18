import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { community, nextPage, type CommunityContext, type Group, type Task } from "./api";
import { Avatar, Empty, ErrorNotice, Icon, IconButton, Loading, Modal, useAction } from "./ui";
import { ConversationChat, TaskCard } from "./chat";
import { GroupWizard, PeoplePicker, TaskWizard } from "./forms";
import { GroupSettings, MemberList, ResourceList, TaskHistory, detailTabs, type DetailTab } from "./details";
import { AdminHQ } from "./hq";
import "./community.css";

export interface CommunitySearch { group?: number; view?: "chat" | "details" | "settings" | "hq"; invite?: string; pod_invite?: string; tab?: DetailTab; setup?: boolean; create?: boolean; section?: string }
export function CommunitySidebar({ selectedGroupId, onSelectGroup, onCreateGroup, onSelectHQ }: { selectedGroupId?: number; onSelectGroup?: (id: number) => void; onCreateGroup?: () => void; onSelectHQ?: () => void }) {
  const navigate = useNavigate(); const [search, setSearch] = useState(""); const [archived, setArchived] = useState(false); const [collapsed, setCollapsed] = useState<number[]>([]); const [taskInvitation, setTaskInvitation] = useState<number | null>(null);
  const context = useQuery({ queryKey: ["community", "context"], queryFn: () => community.get<CommunityContext>("groups/context/"), refetchInterval: 10000 });
  const groups = useInfiniteQuery({ queryKey: ["community", "groups", search], initialPageParam: 1, queryFn: ({ pageParam }) => community.list<Group>("groups/", { search, page: pageParam }), getNextPageParam: last => nextPage(last.next), refetchInterval: 10000 });
  const all = groups.data?.pages.flatMap(p => p.results) || [];
  const go = (id: number) => onSelectGroup ? onSelectGroup(id) : void navigate({ to: "/community", search: { group: id, view: "chat" } });
  const grouped = (list: Group[]) => {
    const categories = [...new Map(list.map(g => [g.category.id, g.category])).values()];
    return categories.map(c => {
      const children = list.filter(g => g.category.id === c.id); const nesting = children.length > 1;
      return <div key={c.id}>{nesting && <button className="co-group-row co-category" onClick={() => setCollapsed(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])} aria-expanded={!collapsed.includes(c.id)}><Avatar name={c.name} className="co-avatar" /><span>{c.name}</span><ChevronDown size={16} /></button>}
        {(!nesting || !collapsed.includes(c.id)) && <div className={nesting ? "co-nested" : ""}>{children.map(g => <button className={`co-group-row ${g.id === selectedGroupId ? "active" : ""}`} key={g.id} onClick={() => go(g.id)}><Avatar src={g.image} name={g.name} className="co-avatar" /><span>{g.name}</span>{g.membership?.state === "pending" && <small>Pending</small>}{g.visibility === "private" && !g.membership && <Icon name="private" />}</button>)}</div>}</div>;
    });
  };
  return <aside className="co-sidebar" aria-label="Community groups"><header><h1>Community</h1>{context.data?.can_create && <button className="co-primary" onClick={() => onCreateGroup ? onCreateGroup() : void navigate({ to: "/community", search: { create: true } })}>Create Group</button>}</header>
    <label className="co-search"><Icon name="search" /><input type="search" aria-label="Search communities" value={search} onChange={e => setSearch(e.target.value)} /></label>
    {context.data?.is_internal && <button className="co-group-row co-hq-row" onClick={() => onSelectHQ ? onSelectHQ() : void navigate({ to: "/community", search: { view: "hq" } })}><img src="/community-assets/hq.png" width={40} height={40} alt="" /><span>Admin HQ</span></button>}
    {!!context.data?.invitations.length && <><h2 className="co-list-label">Invitations</h2>{context.data.invitations.map(invite => <button className="co-group-row" key={invite.id} onClick={() => go(invite.group_id)}><Avatar name={invite.group_name} className="co-avatar" /><span>{invite.group_name}<small className="co-small"> · {invite.role} invitation</small></span></button>)}</>}
    {!!context.data?.task_invitations?.length && <><h2 className="co-list-label">Task invitations</h2>{context.data.task_invitations.map(task => <button className="co-group-row" key={task.id} onClick={() => setTaskInvitation(task.id)}><Avatar name={task.title} className="co-avatar" /><span>{task.title}</span><ChevronRight size={16} /></button>)}</>}
    {groups.isPending ? <Loading /> : groups.error ? <ErrorNotice error={groups.error} retry={() => void groups.refetch()} /> : <>
      <h2 className="co-list-label">Communities You're in</h2>{grouped(all.filter(g => g.status === "active" && g.membership?.state === "active"))}
      <h2 className="co-list-label">Others</h2>{grouped(all.filter(g => g.status === "active" && g.membership?.state !== "active"))}
      <button className="co-group-row co-archive-toggle" onClick={() => setArchived(v => !v)} aria-expanded={archived}><Icon name="archive" /><span>Archived groups</span><ChevronRight size={16} /></button>{archived && grouped(all.filter(g => g.status !== "active"))}
      {!all.length && <Empty>No communities found.</Empty>}{groups.hasNextPage && <button className="co-load-more" disabled={groups.isFetchingNextPage} onClick={() => void groups.fetchNextPage()}>Load more groups</button>}
    </>}{context.error && <ErrorNotice error={context.error} retry={() => void context.refetch()} />}{taskInvitation && <Modal title="Task invitation" onClose={() => setTaskInvitation(null)}><TaskCard id={taskInvitation} /></Modal>}
  </aside>;
}

export const CommunityDirectory = CommunitySidebar;

export function CommunityPage() {
  const search = useSearch({ strict: false }) as CommunitySearch; const navigate = useNavigate(); const action = useAction();
  const context = useQuery({ queryKey: ["community", "context"], queryFn: () => community.get<CommunityContext>("groups/context/"), refetchInterval: 10000 });
  const groupQuery = useQuery({ queryKey: ["community", "group", search.group], queryFn: () => community.get<Group>(`groups/${search.group}/`), enabled: !!search.group, refetchInterval: 5000, retry: 1 });
  const [creatingGroup, setCreatingGroup] = useState(search.create === true); const [creatingTask, setCreatingTask] = useState(false); const [inviteTask, setInviteTask] = useState<number | null>(null); const [rulesViewed, setRulesViewed] = useState(false);
  const [searchRequested, setSearchRequested] = useState(0);
  const group = groupQuery.error ? undefined : groupQuery.data; const view = search.view || "chat"; const tab = search.tab || "members";
  const go = (patch: Partial<CommunitySearch>) => void navigate({ to: "/community", search: { ...search, ...patch } });
  const goGroup = (id: number) => { setCreatingGroup(false); setCreatingTask(false); go({ group: id, view: "chat", tab: undefined, invite: undefined, setup: undefined }); };
  const invitation = context.data?.invitations.find(i => i.group_id === group?.id);
  const hasHistory = !!group?.conversation_id;
  const inviteToken = search.invite || invitation?.token;
  const adminInvitation = invitation?.role === "admin" && invitation.token === inviteToken;
  const createTask = group && group.can_post && group.post_permissions.task !== false ? () => setCreatingTask(true) : undefined;
  const settings = group && view === "settings";
  const sidebar = <CommunitySidebar selectedGroupId={group?.id} onSelectGroup={goGroup} onSelectHQ={() => go({ group: undefined, view: "hq" })} onCreateGroup={() => setCreatingGroup(true)} />;
  if (creatingGroup && context.data) return <div className="co-root"><GroupWizard context={context.data} onClose={() => setCreatingGroup(false)} onCreated={g => { setCreatingGroup(false); setRulesViewed(false); go({ group: g.id, view: "chat", setup: true }); }} /></div>;
  if (creatingTask && group && context.data) return <div className="co-root"><TaskWizard group={group} context={context.data} onClose={() => setCreatingTask(false)} onCreated={(t: Task) => { setCreatingTask(false); setInviteTask(t.id); }} /></div>;
  return <div className={`co-root co-layout ${settings ? "co-layout-settings" : ""} ${search.group || view === "hq" ? "co-has-detail" : ""}`}>
    {!settings && sidebar}
    <main className="co-pane">
      {context.isPending ? <Loading /> : context.error ? <ErrorNotice error={context.error} retry={() => void context.refetch()} /> : view === "hq" ? context.data?.is_internal ? <AdminHQ context={context.data} onGroup={goGroup} /> : <Empty>This page is not available.</Empty> : search.group ? groupQuery.isPending ? <Loading /> : groupQuery.error ? <><IconButton name="back" label="Back to community" onClick={() => go({ group: undefined })} /><ErrorNotice error={groupQuery.error} retry={() => void groupQuery.refetch()} /></> : group && context.data ? settings ? <GroupSettings group={group} context={context.data} initialSection={search.section} onSectionChange={section => go({ section: section || undefined })} onBack={() => go({ view: "details", section: undefined })} onTab={next => go({ view: "details", tab: next, section: undefined })} /> : <>
        <header className={`co-group-header co-group-header-${view}`}>
          <IconButton name="back" label={view === "chat" ? "Back to communities" : "Back to chat"} onClick={() => go(view === "chat" ? { group: undefined, invite: undefined, setup: undefined } : { view: "chat" })} />
          <button className="co-group-title" onClick={() => go({ view: "details" })}><Avatar src={group.image} name={group.name} className="co-avatar" /><h1>{group.name}</h1><ChevronRight size={14} /></button>
          <IconButton name="search" label="Search messages" onClick={() => { setSearchRequested(n => n + 1); go({ view: "chat" }); }} />
          {view !== "chat" && <IconButton name="settings" label="Group settings" onClick={() => go({ view: "settings" })} />}
        </header>
        {(group.joins_paused || group.status === "active" && group.admin_count < 2) && <p className="co-admin-gate">{group.admin_count < 2 ? group.can_manage ? "Setup incomplete: new joins are paused. Invite and appoint a second admin to open membership. Existing members can continue using the group." : "New joins are paused until a second admin is appointed." : `Group ${group.status}: no new joins.`}</p>}
        {group.status !== "active" && <p className="co-readonly">This group is {group.status}. Eligible history is read-only; existing pods continue independently.</p>}
        {(!hasHistory || group.membership?.state === "left" || inviteToken) && <div className="co-join">
          <p>{group.description}</p><span>{group.member_count} members · {group.visibility}</span>
          <button className="co-primary"
            disabled={action.pending || (group.membership?.state === "pending" && !adminInvitation) || (group.joins_paused && !adminInvitation)}
            onClick={() => void action.run(() => community.post(`groups/${group.id}/join/`, { token: inviteToken }), () => go({ invite: undefined }))}>
            {inviteToken ? `Accept ${invitation?.role || "group"} invitation` : group.membership?.state === "pending" ? "Awaiting approval" : group.membership?.state === "left" ? "Rejoin group" : group.visibility === "private" ? "Request to join" : "Join Group"}
          </button>
          {invitation && <button className="co-text-button" disabled={action.pending} onClick={() => void action.run(() => community.post(`groups/${group.id}/respond-invitation/`, { decision: "decline", token: invitation.token }), () => go({ invite: undefined }))}>Decline invitation</button>}
          {action.error && <ErrorNotice error={action.error} />}
        </div>}
        {search.setup && group.can_manage && <div className="co-setup"><strong>Set up your group</strong><div><span>{1 + Number(rulesViewed) + Number(group.admin_count >= 2)}/3 set up done</span><progress value={1 + Number(rulesViewed) + Number(group.admin_count >= 2)} max={3} /><button className="co-link" onClick={() => { setRulesViewed(true); go({ view: "settings", section: "Rules & Guidelines" }); }}>Review rules</button><button className="co-link" onClick={() => go({ view: "details", tab: "members" })}>Invite admins</button><button className="co-link" onClick={() => go({ setup: undefined })}>Finish</button></div></div>}
        {hasHistory && (view === "chat" ? <ConversationChat conversationId={group.conversation_id!} canPost={group.can_post} canModerate={group.can_moderate} postPermissions={group.post_permissions} group={group} searchRequested={searchRequested} onCreateTask={createTask} onOpenDetails={() => go({ view: "details" })} onOpenRules={() => go({ view: "settings", section: "Rules & Guidelines" })} /> : <><p className="co-description">{group.description}</p><nav className="co-tabs" aria-label="Group details">{detailTabs.map(t => <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => go({ tab: t.id })}>{t.label}</button>)}</nav><div className="co-detail-content">{tab === "members" ? <MemberList group={group} /> : tab === "tasks" ? <TaskHistory group={group} onCreate={createTask} /> : <ResourceList key={tab} type={tab} group={group} />}</div></>)}
      </> : null : <Empty>Select a community to start a conversation.</Empty>}
    </main>{inviteTask && <PeoplePicker taskId={inviteTask} onClose={() => setInviteTask(null)} />}{search.pod_invite && <PodLinkRequest token={search.pod_invite} onClose={() => go({ pod_invite: undefined })} />}
  </div>;
}

function PodLinkRequest({ token, onClose }: { token: string; onClose: () => void }) {
  const action = useAction(); const [requested, setRequested] = useState(false);
  return <Modal title="Pod invitation" onClose={onClose}><div className="co-form">
    <p>{requested ? "Awaiting approval" : "Request to join this Paddie Pod"}</p>
    <p className="co-muted">{requested ? "The pod admin will review your request. Pod history and evidence stay unavailable until your membership is approved." : "Joining through a pod link requires an admin's approval. This does not join its source community group."}</p>
    {!requested && <button className="co-primary" disabled={action.pending} onClick={() => void action.run(() => community.post<{ task_id: number; goal_id: number; state: string; approval_required: boolean }>("tasks/join-link/", { token }), () => setRequested(true))}>{action.pending ? "Requesting..." : "Request to join"}</button>}
    {action.error && <ErrorNotice error={action.error} />}<button className="co-text-button" onClick={onClose}>Close</button>
  </div></Modal>;
}
