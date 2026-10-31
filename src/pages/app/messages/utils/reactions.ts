import type { ChatReaction, ChatUser } from "../api";

export interface ReactionGroup {
  emoji: string;
  users: ChatUser[];
  reacted: boolean;
}

export function groupReactions(reactions: ChatReaction[] = [], userId?: number): ReactionGroup[] {
  const groups = new Map<string, ReactionGroup>();
  for (const { emoji, user } of reactions) {
    if (!emoji || !user?.id) continue;
    const group = groups.get(emoji) ?? { emoji, users: [], reacted: false };
    if (!group.users.some((member) => member.id === user.id)) group.users.push(user);
    group.reacted ||= user.id === userId;
    groups.set(emoji, group);
  }
  return [...groups.values()];
}

