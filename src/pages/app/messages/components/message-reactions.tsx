import { useEffect, useId, useMemo, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { Avatar } from "@/components/core/avatar";
import type { ChatReaction } from "../api";
import { groupReactions } from "../utils/reactions";
import { buildEmojiEntries, findEmojis, placeReactionPicker, suggestedReactions, type EmojiEntry } from "../utils/emoji-data";

const categories = [
  { name: "Recent", icon: "clock", ids: [] },
  { name: "Smileys & people", icon: "smile", ids: ["people"] },
  { name: "Animals & nature", icon: "cat", ids: ["nature"] },
  { name: "Food & drink", icon: "coffee", ids: ["foods"] },
  { name: "Activities & objects", icon: "football", ids: ["activity", "objects"] },
  { name: "Travel & places", icon: "car", ids: ["places"] },
  { name: "Flags & symbols", icon: "flag", ids: ["flags", "symbols"] },
];

let emojiEntries: Promise<EmojiEntry[]> | undefined;
const loadEmojis = () => emojiEntries ??= import("@emoji-mart/data/sets/15/twitter.json")
  .then((module) => buildEmojiEntries(module.default))
  .catch((error) => { emojiEntries = undefined; throw error; });

function useEmojiEntries(enabled = true) {
  const [entries, setEntries] = useState<EmojiEntry[]>([]);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    loadEmojis().then((next) => { if (mounted) { setEntries(next); setError(false); } })
      .catch(() => { if (mounted) setError(true); });
    return () => { mounted = false; };
  }, [enabled, attempt]);
  return { entries, error, retry: () => { setError(false); setAttempt((value) => value + 1); } };
}

export function ReactionEmoji({ native, entry, size }: { native: string; entry?: EmojiEntry; size: number }) {
  const sprite = typeof entry?.x === "number" && typeof entry?.y === "number";
  return <span aria-hidden="true" className="inline-block shrink-0 align-middle leading-none" style={{
    width: size, height: size, fontSize: size,
    ...(sprite ? {
      backgroundImage: 'url("/reaction-assets/twemoji-32.png")',
      backgroundSize: "6100% 6100%",
      backgroundPosition: `${entry.x! / 60 * 100}% ${entry.y! / 60 * 100}%`,
    } : {}),
  }}>{sprite ? null : native}</span>;
}

export function MessageReactionBadges({ reactions, userId, onInspect }: {
  reactions?: ChatReaction[];
  userId?: number;
  onInspect: () => void;
}) {
  const { entries } = useEmojiEntries(Boolean(reactions?.length));
  const groups = groupReactions(reactions, userId);
  if (!groups.length) return null;
  const visible = groups.slice(0, 3);
  return <div className="absolute -right-2 -top-[9px] z-10 flex w-max max-w-[220px] justify-end gap-1" aria-label="Message reactions">
    {visible.map((group, index) => <button
      key={group.emoji}
      type="button"
      onClick={(event) => { event.stopPropagation(); onInspect(); }}
      aria-label={`${group.emoji}, ${group.users.length} ${group.users.length === 1 ? "reaction" : "reactions"}${group.reacted ? ", including you" : ""}. View reactions`}
      title={`${group.users.map((user) => user.id === userId ? "You" : user.name).join(", ")} reacted ${group.emoji}`}
      className={`relative flex min-h-7 min-w-[38px] items-center justify-center gap-1 rounded-[31px] border bg-[#e8f3ff] px-1.5 text-[#636363] shadow-sm focus-visible:outline-2 focus-visible:outline-blue-500 ${group.reacted ? "border-blue-400" : "border-[#e9f1fe]"}`}
    >
      <ReactionEmoji native={group.emoji} entry={entries.find((entry) => entry.native === group.emoji)} size={16} /><span className="text-[10px]">{group.users.length}</span>
      {index === visible.length - 1 && <>
        <img src="/reaction-assets/tail-large.svg" alt="" aria-hidden="true" className="pointer-events-none absolute right-[2px] top-[18px] -z-10" />
        <img src="/reaction-assets/tail-small.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-1 top-[31px] -z-10" />
      </>}
    </button>)}
    {groups.length > visible.length && <button type="button" onClick={(event) => { event.stopPropagation(); onInspect(); }} aria-label={`View ${groups.length - visible.length} more reaction types`} className="min-h-7 rounded-full border border-[#e9f1fe] bg-[#e8f3ff] px-2 text-[10px] text-[#636363] focus-visible:outline-2 focus-visible:outline-blue-500">+{groups.length - visible.length}</button>}
  </div>;
}

export function MessageReactionPicker({ anchor, reactions, recent, userId, onChoose, onClose }: {
  anchor: { left: number; top: number; bottom: number };
  reactions?: ChatReaction[];
  recent: string[];
  userId?: number;
  onChoose: (emoji: string) => void;
  onClose: () => void;
}) {
  const { entries, error, retry } = useEmojiEntries();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(0);
  const panelId = useId();
  const visible = useMemo(() => {
    if (query.trim() || category) return findEmojis(entries, query, categories[category].ids);
    return [...new Set([...recent, ...suggestedReactions])].map((native) => entries.find((entry) => entry.native === native)
      ?? { id: native, name: native, native, category: "recent", search: native });
  }, [category, entries, query, recent]);
  const own = new Set(reactions?.filter((reaction) => reaction.user.id === userId).map((reaction) => reaction.emoji));
  const position = placeReactionPicker(anchor, { width: window.innerWidth, height: window.innerHeight });
  return <Dialog open onClose={onClose} className="relative z-[110]">
    <div className="fixed inset-0 bg-white/10 backdrop-blur-[2px] dark:bg-slate-950/10" aria-hidden="true" />
    <DialogPanel
      style={{ position: "fixed", ...position }}
      className="flex flex-col overflow-hidden rounded-[10px] bg-[#e8f3ff] px-[18px] pb-2 pt-4 text-[#636363] shadow-xl"
    >
      <DialogTitle className="sr-only">React to message</DialogTitle>
      <div role="tablist" aria-label="Emoji categories" className="flex shrink-0 items-center justify-between gap-0.5">
        {categories.map((item, index) => <button key={item.name} type="button" role="tab" aria-selected={category === index} aria-controls={panelId} tabIndex={category === index ? 0 : -1} aria-label={item.name} title={item.name}
          onClick={() => { setCategory(index); setQuery(""); }}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? categories.length - 1 : (index + (event.key === "ArrowLeft" ? -1 : 1) + categories.length) % categories.length;
            setCategory(next);
            setQuery("");
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
          }}
          className={`flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-blue-500 ${category === index && !query ? "bg-[#fafafa]" : ""}`}>
          <img src={`/reaction-assets/${item.icon}.svg`} alt="" aria-hidden="true" />
        </button>)}
      </div>
      <label className="mt-[11px] flex h-10 shrink-0 items-center gap-2 rounded-[10px] bg-[#fafafa] px-4">
        <img src="/reaction-assets/search.svg" alt="" aria-hidden="true" />
        <input autoFocus aria-label="Search emoji" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full min-w-0 bg-transparent text-xs text-[#636363] outline-none placeholder:text-gray-400" />
      </label>
      <div id={panelId} role="tabpanel" aria-label={query ? "Emoji search results" : categories[category].name} className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {visible.length ? <div className="grid grid-cols-8 auto-rows-[38px]">
          {visible.map((entry) => <button key={entry.id} type="button" aria-label={`${own.has(entry.native) ? "Remove" : "React with"} ${entry.name}`} aria-pressed={own.has(entry.native)} title={entry.name}
            onClick={() => onChoose(entry.native)}
            className={`flex items-center justify-center rounded-lg hover:bg-white focus-visible:outline-2 focus-visible:outline-blue-500 ${own.has(entry.native) ? "bg-blue-200/80" : ""}`}><ReactionEmoji native={entry.native} entry={entry} size={24} /></button>)}
        </div> : <p role="status" className="py-6 text-center text-xs">{entries.length ? "No emoji found" : error ? "Could not load all emoji." : "Loading emoji..."}</p>}
        {error && <button type="button" className="w-full py-2 text-xs text-blue-700 underline" onClick={retry}>Retry loading emoji</button>}
      </div>
      <button type="button" onClick={onClose} className="sr-only focus:not-sr-only focus:absolute focus:right-1 focus:top-1 focus:rounded focus:bg-white" aria-label="Close emoji picker"><X size={16} /></button>
    </DialogPanel>
  </Dialog>;
}

export function MessageReactionDetails({ reactions, userId, busy, onRemove, onClose }: {
  reactions?: ChatReaction[];
  userId?: number;
  busy: boolean;
  onRemove: (emoji: string) => void;
  onClose: () => void;
}) {
  const { entries } = useEmojiEntries();
  const groups = groupReactions(reactions, userId);
  return <Dialog open onClose={onClose} className="relative z-[110]">
    <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900 dark:text-slate-100">
        <div className="mb-4 flex items-center justify-between"><DialogTitle className="font-semibold">Reactions</DialogTitle><button type="button" aria-label="Close reactions" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-slate-800"><X size={18} /></button></div>
        {!groups.length && <p role="status" className="text-sm text-gray-500">No reactions yet.</p>}
        {groups.map((group) => <section key={group.emoji} className="mb-4 last:mb-0">
          <h3 className="mb-2 flex items-center gap-2 text-sm"><span aria-label={group.emoji}><ReactionEmoji native={group.emoji} entry={entries.find((entry) => entry.native === group.emoji)} size={20} /></span>{group.users.length} {group.users.length === 1 ? "reaction" : "reactions"}</h3>
          <ul className="space-y-2">{group.users.map((user) => <li key={user.id} className="flex items-center gap-2 text-sm">
            <Avatar src={user.avatar} name={user.name} className="h-8 w-8 text-xs" />
            <span className="min-w-0 flex-1 truncate">{user.id === userId ? "You" : user.name}</span>
            {user.id === userId && <button type="button" aria-label={`Remove ${group.emoji}`} disabled={busy} onClick={() => onRemove(group.emoji)} className="min-h-9 rounded-lg px-2 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-300 dark:hover:bg-slate-800">Remove <ReactionEmoji native={group.emoji} entry={entries.find((entry) => entry.native === group.emoji)} size={14} /></button>}
          </li>)}</ul>
        </section>)}
      </DialogPanel>
    </div>
  </Dialog>;
}
