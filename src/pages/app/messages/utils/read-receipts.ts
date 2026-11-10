const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isServerId = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;

// A receipt is evidence only for its explicit IDs, never for a whole history.
export function getReadReceiptMatcher(
  payload: unknown,
  currentUserId: unknown,
  socketConversationId: unknown,
): ((message: unknown) => boolean) | null {
  if (!isRecord(payload) || !isServerId(currentUserId) || !isServerId(socketConversationId)) return null;
  if (payload.type !== "read" && payload.type !== "read_all") return null;
  if (!isServerId(payload.by_user_id) || payload.by_user_id === currentUserId) return null;
  if (payload.conversation_id !== socketConversationId) return null;
  if (payload.message_id !== undefined && !isServerId(payload.message_id)) return null;

  const ids: number[] = [];
  if (payload.message_ids !== undefined) {
    if (!Array.isArray(payload.message_ids) || payload.message_ids.length === 0) return null;
    for (const id of payload.message_ids) {
      if (!isServerId(id)) return null;
      ids.push(id);
    }
  }
  if (payload.type === "read") {
    if (payload.message_id !== undefined) {
      ids.push(payload.message_id);
    }
  } else if (!Array.isArray(payload.message_ids)) {
    return null;
  }
  if (ids.length === 0) return null;

  const messageIds = new Set(ids);
  return (message) => isRecord(message)
    && isServerId(message.id)
    && message.optimistic !== true
    && messageIds.has(message.id)
    && message.conversation === socketConversationId
    && isRecord(message.sender)
    && message.sender.id === currentUserId;
}

export function isActiveChatVisible(
  conversationId: unknown,
  activeConversationId: unknown,
  visibilityState: unknown,
): boolean {
  return isServerId(conversationId)
    && conversationId === activeConversationId
    && visibilityState === "visible";
}

export function isMessagePaneVisible(activeTab: string, showMobileChat: boolean, isWideLayout: boolean): boolean {
  return activeTab === "Activities" && (showMobileChat || isWideLayout);
}

export function getIncomingReadMessageIds(messages: readonly unknown[], currentUserId: unknown, conversationId: unknown): number[] {
  if (!isServerId(currentUserId) || !isServerId(conversationId)) return [];
  const ids = new Set<number>();
  for (const message of messages) {
    if (!isRecord(message) || !isServerId(message.id) || message.optimistic === true
      || message.conversation !== conversationId || message.is_read !== false
      || !isRecord(message.sender) || !isServerId(message.sender.id)
      || message.sender.id === currentUserId) continue;
    ids.add(message.id);
  }
  return [...ids];
}
