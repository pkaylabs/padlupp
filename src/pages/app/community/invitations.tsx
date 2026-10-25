import { useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { community, nextPage, type Group, type GroupInvitation } from "./api";
import { Empty, ErrorNotice, Loading, Modal, dateLabel, timeLabel, useAction } from "./ui";

export function GroupInvitations({ group }: { group: Group }) {
  const [selected, setSelected] = useState<GroupInvitation | null>(null);
  const query = useInfiniteQuery({
    queryKey: ["community", "invitations", group.id],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => community.list<GroupInvitation>(`groups/${group.id}/invitations/`, { page: pageParam }),
    getNextPageParam: last => nextPage(last.next),
    enabled: group.can_manage,
    refetchInterval: 10000,
    retry: 1,
  });
  if (!group.can_manage) return null;
  const invitations = query.data?.pages.flatMap(page => page.results) || [];

  return <>
    <p className="co-muted">Pending, unexpired invitations, newest first. Revoking an invitation does not remove existing members.</p>
    {query.isPending ? <Loading /> : query.error ? <ErrorNotice error={query.error} retry={() => void query.refetch()} /> : !invitations.length ? <Empty>No pending invitations.</Empty> : invitations.map(invitation => <article className="co-audit-row" key={invitation.id}>
      <strong>{invitation.is_link ? "Invite link" : invitation.user?.name || "Unavailable invitee"}</strong>
      <p>Role: {invitation.role}</p>
      <p>Expires <time dateTime={invitation.expires_at}>{dateLabel(invitation.expires_at)} at {timeLabel(invitation.expires_at)}</time></p>
      {invitation.invited_by && <p>Invited by {invitation.invited_by.name}</p>}
      {invitation.is_link && <>
        <p className="co-muted">Generic invitation, not tied to a specific person.</p>
        {invitation.url && <p><a href={invitation.url} target="_blank" rel="noopener noreferrer">{invitation.url}</a></p>}
      </>}
      <button type="button" className="co-danger" disabled={selected !== null} onClick={() => setSelected(invitation)}>Revoke invitation</button>
    </article>)}
    {query.hasNextPage && <button type="button" className="co-load-more" disabled={query.isFetching || selected !== null} onClick={() => void query.fetchNextPage()}>{query.isFetchingNextPage ? "Loading..." : "Load more invitations"}</button>}
    {selected && <RevokeInvitation groupId={group.id} invitation={selected} onClose={() => setSelected(null)} />}
  </>;
}

function RevokeInvitation({ groupId, invitation, onClose }: { groupId: number; invitation: GroupInvitation; onClose: () => void }) {
  const action = useAction();
  const submitting = useRef(false);
  const close = () => { if (!submitting.current) onClose(); };
  const revoke = () => {
    if (submitting.current) return;
    submitting.current = true;
    void action.run(
      () => community.post<GroupInvitation>(`groups/${groupId}/invitations/`, { invitation_id: invitation.id, action: "revoke" }),
      onClose,
    ).finally(() => { submitting.current = false; });
  };

  return <Modal title="Revoke invitation" onClose={close}><div className="co-form">
    <p>{invitation.is_link ? "Revoke this invite link? It will no longer let anyone join the group." : `Revoke the ${invitation.role} invitation for ${invitation.user?.name || "this invitee"}? They will no longer be able to accept it.`}</p>
    {action.error && <ErrorNotice error={action.error} />}
    <button type="button" className="co-danger-fill" disabled={action.pending} onClick={revoke}>{action.pending ? "Revoking..." : "Revoke invitation"}</button>
    <button type="button" className="co-text-button" disabled={action.pending} onClick={close}>Cancel</button>
  </div></Modal>;
}
