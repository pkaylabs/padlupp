export interface EmojiEntry {
  id: string;
  name: string;
  native: string;
  search: string;
  category: string;
  x?: number;
  y?: number;
}

export interface EmojiData {
  categories: { id: string; emojis: string[] }[];
  emojis: Record<string, { id: string; name: string; keywords: string[]; skins: { native: string; x?: number; y?: number }[] }>;
  aliases: Record<string, string>;
}

export const suggestedReactions = [
  "❤️", "👍", "😊", "😂", "😍", "👌", "😁", "😎",
  "😀", "😃", "🤣", "😄", "😅", "😆", "😉", "😋",
  "😘", "🥰", "😗", "😙", "🥲", "🔥", "❤️‍🔥", "👊",
  "🤛", "🤜", "✊", "🎉", "💯", "🙏", "👀", "👏",
];

export function buildEmojiEntries(data: EmojiData): EmojiEntry[] {
  const aliases = new Map<string, string[]>();
  for (const [alias, id] of Object.entries(data.aliases)) {
    aliases.set(id, [...(aliases.get(id) ?? []), alias]);
  }
  return data.categories.flatMap((category) => category.emojis.flatMap((id) => {
    const emoji = data.emojis[id];
    if (!emoji) return [];
    return emoji.skins.map((skin, index) => ({
      id: `${id}-${index}`,
      name: index ? `${emoji.name} (${skin.native})` : emoji.name,
      native: skin.native,
      x: skin.x,
      y: skin.y,
      category: category.id,
      search: [id, emoji.name, ...emoji.keywords, ...(aliases.get(id) ?? []), skin.native].join(" ").toLowerCase(),
    }));
  }));
}

export function findEmojis(entries: EmojiEntry[], query: string, categories?: string[]): EmojiEntry[] {
  const terms = query.toLowerCase().replace(/[:_]/g, " ").trim().split(/\s+/).filter(Boolean);
  const matches = entries.filter((entry) => terms.length
    ? terms.every((term) => entry.search.includes(term))
    : categories?.includes(entry.category));
  const normalized = terms.join(" ");
  const exact = (entry: EmojiEntry) => entry.name.toLowerCase() === normalized || entry.native === normalized;
  return normalized ? matches.sort((a, b) => Number(exact(b)) - Number(exact(a))) : matches;
}

export function placeReactionPicker(anchor: { left: number; top: number; bottom: number }, viewport: { width: number; height: number }) {
  const width = Math.min(320, viewport.width - 16);
  const height = Math.min(275, viewport.height - 16);
  return {
    width,
    height,
    left: Math.max(8, Math.min(anchor.left, viewport.width - width - 8)),
    top: Math.max(8, Math.min(anchor.top >= height + 16 ? anchor.top - height - 12 : anchor.bottom + 12, viewport.height - height - 8)),
  };
}
