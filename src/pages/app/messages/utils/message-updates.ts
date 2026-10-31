import type { ChatMessage, Conversation } from "../api";

type CachedMessage = { id: number | string; recalled_at?: string | null; is_recalled?: boolean; is_read?: boolean };

// An update to an old message must not replace a chat's latest-message preview.
export function updateConversationMessage(conversations: Conversation[], message: ChatMessage): Conversation[] {
  return conversations.map((conversation) => conversation.last_message?.id === message.id
    ? { ...conversation, last_message: mergeMessageUpdate(conversation.last_message, message) }
    : conversation);
}

export function mergeMessageUpdate<T extends CachedMessage>(current: T, incoming: ChatMessage): T {
  // A late reaction response must never resurrect a recalled message.
  if ((current.recalled_at || current.is_recalled) && !(incoming.recalled_at || incoming.is_recalled)) return current;
  return { ...current, ...incoming, is_read: Boolean(current.is_read || incoming.is_read) };
}

export function updateCachedMessage<T extends CachedMessage>(messages: T[], incoming: ChatMessage): T[] {
  return messages.map((message) => message.id === incoming.id ? mergeMessageUpdate(message, incoming) : message);
}

export function matchesPendingMessage(pending: Omit<ChatMessage, "id"> & { id: number | string }, incoming: ChatMessage): boolean {
  return typeof pending.id === "string"
    && (pending.sender.id === incoming.sender.id || pending.sender.id === 0)
    && (pending.text ?? "").trim() === (incoming.text ?? "").trim()
    && (!pending.attachment_name || !incoming.attachment_name || pending.attachment_name === incoming.attachment_name);
}

export function markCachedMessagesRead<T extends CachedMessage>(messages: T[], shouldMark: (message: T) => boolean): T[] {
  let changed = false;
  const next = messages.map((message) => {
    // A read receipt can arrive before the server replaces the temporary ID.
    if (typeof message.id !== "number" || message.is_read || !shouldMark(message)) return message;
    changed = true;
    return { ...message, is_read: true, optimistic: false };
  });
  return changed ? next : messages;
}
