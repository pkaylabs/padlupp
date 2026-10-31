import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true, hmr: false } });
after(() => server.close());
const { groupReactions } = await server.ssrLoadModule("/src/pages/app/messages/utils/reactions.ts");
const { updateCachedMessage, updateConversationMessage, mergeMessageUpdate, markCachedMessagesRead, matchesPendingMessage } = await server.ssrLoadModule("/src/pages/app/messages/utils/message-updates.ts");
const { buildEmojiEntries, findEmojis, suggestedReactions, placeReactionPicker } = await server.ssrLoadModule("/src/pages/app/messages/utils/emoji-data.ts");
const { MessageReactionBadges, ReactionEmoji } = await server.ssrLoadModule("/src/pages/app/messages/components/message-reactions.tsx");
const data = createRequire(import.meta.url)("@emoji-mart/data/sets/15/twitter.json");
const entries = buildEmojiEntries(data);
const user = { id: 1, name: "Mary", avatar: null };
const other = { id: 2, name: "John", avatar: null };
const fire = data.emojis.fire.skins[0].native;
const reactions = [{ emoji: fire, user }, { emoji: fire, user: other }];
const message = { id: 20, conversation: 8, sender: user, reactions: [], text: "Hello", is_read: false, created_at: "2026-10-31T01:00:00Z", updated_at: "2026-10-31T01:00:00Z" };

test("reactions group by emoji, count unique people, and mark the viewer's reaction", () => {
  const groups = groupReactions([...reactions, reactions[0]], 1);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].users.length, 2);
  assert.equal(groups[0].reacted, true);
  assert.equal(groupReactions(reactions, 3)[0].reacted, false);
  assert.deepEqual(groupReactions(undefined, 1), []);
});

test("reaction-only realtime updates apply even when updated_at is unchanged", () => {
  const updated = { ...message, reactions };
  const result = updateCachedMessage([message], updated);
  assert.deepEqual(result[0].reactions, reactions);
  assert.equal(result[0].updated_at, message.updated_at);
  assert.deepEqual(updateCachedMessage([], updated), [], "updates never append unavailable history");
});

test("reacting to an older message never changes the latest preview or list ordering", () => {
  const conversations = [{ id: 8, last_message: { ...message, id: 21, text: "Newest" } }, { id: 9, last_message: null }];
  assert.deepEqual(updateConversationMessage(conversations, { ...message, reactions }), conversations);
  const next = updateConversationMessage(conversations, { ...message, id: 21, reactions });
  assert.equal(next[0].last_message.id, 21);
  assert.equal(next[0].last_message.reactions.length, 2);
  assert.equal(next[1], conversations[1]);
});

test("late reaction responses cannot restore a recalled message or regress read receipts", () => {
  const deleted = { ...message, is_recalled: true, recalled_at: "2026-10-31T02:00:00Z", reactions: [] };
  assert.equal(mergeMessageUpdate(deleted, { ...message, reactions }), deleted);
  assert.equal(mergeMessageUpdate({ ...message, is_read: true }, { ...message, reactions }).is_read, true);
  assert.deepEqual(mergeMessageUpdate({ ...message, reactions }, deleted).reactions, []);
});

test("read receipts and delayed echoes do not strand duplicate temporary messages", () => {
  const pending = { ...message, id: "temp-123", optimistic: true };
  assert.equal(markCachedMessagesRead([pending], () => true)[0], pending);
  assert.equal(matchesPendingMessage(pending, message), true);
  assert.equal(matchesPendingMessage({ ...pending, optimistic: false }, message), true, "a delayed echo still replaces a timed-out temporary ID");
  assert.equal(matchesPendingMessage(message, message), false, "never reconcile an authoritative ID");
  assert.equal(matchesPendingMessage({ ...pending, sender: other }, message), false);
  const confirmed = markCachedMessagesRead([message], () => true)[0];
  assert.equal(confirmed.is_read, true);
});

test("emoji search covers the full dataset, aliases, native characters, and skin tones", () => {
  assert.ok(entries.length > 3000);
  assert.equal(findEmojis(entries, "fire")[0].native, fire);
  assert.ok(findEmojis(entries, ":thumbsup:").length);
  assert.ok(findEmojis(entries, "rocket").length);
  assert.equal(findEmojis(entries, fire)[0].native, fire);
  assert.ok(findEmojis(entries, "astronaut").length > 1);
  assert.equal(findEmojis(entries, "no-such-emoji-123456").length, 0);
});

test("all Figma default reactions are valid and categories stay scoped", () => {
  for (const native of suggestedReactions) assert.ok(entries.some((entry) => entry.native === native), native);
  assert.ok(findEmojis(entries, "", ["foods"]).length > 100);
  assert.ok(findEmojis(entries, "", ["foods"]).every((entry) => entry.category === "foods"));
});

test("bundled emoji artwork matches the dataset sheet, including newer emoji", () => {
  const png = readFileSync(new URL("../public/reaction-assets/twemoji-32.png", import.meta.url));
  assert.equal(png.readUInt32BE(16), data.sheet.cols * 34);
  assert.equal(png.readUInt32BE(20), data.sheet.rows * 34);
  assert.ok(entries.every((entry) => entry.x >= 0 && entry.x < data.sheet.cols && entry.y >= 0 && entry.y < data.sheet.rows));
  const entry = entries.find((entry) => entry.native === fire);
  const html = renderToStaticMarkup(createElement(ReactionEmoji, { native: fire, entry, size: 24 }));
  assert.match(html, /twemoji-32\.png/);
  assert.match(html, /background-position:50% 3\.333/);
  assert.match(html, /aria-hidden="true"/);
});

test("picker fits mobile and desktop viewports, above or below the trigger", () => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 1280, height: 720 }]) {
    for (const anchor of [{ left: 1200, top: 700, bottom: 720 }, { left: 0, top: 10, bottom: 40 }]) {
      const result = placeReactionPicker(anchor, viewport);
      assert.ok(result.left >= 8 && result.top >= 8);
      assert.ok(result.left + result.width <= viewport.width - 8);
      assert.ok(result.top + result.height <= viewport.height - 8);
    }
  }
});

test("badge renders Figma tail assets, actual counts and accessible identity", () => {
  const html = renderToStaticMarkup(createElement(MessageReactionBadges, { reactions, userId: 1, onInspect() {} }));
  assert.match(html, /2 reactions, including you\. View reactions/);
  assert.match(html, /You, John reacted/);
  assert.match(html, /reaction-assets\/tail-large\.svg/);
  assert.match(html, /reaction-assets\/tail-small\.svg/);
  assert.equal(renderToStaticMarkup(createElement(MessageReactionBadges, { reactions: [], onInspect() {} })), "");
});

test("many different reactions cannot cover the message with badge rows", () => {
  const many = suggestedReactions.slice(0, 8).map((emoji) => ({ emoji, user }));
  const html = renderToStaticMarkup(createElement(MessageReactionBadges, { reactions: many, userId: 1, onInspect() {} }));
  assert.equal((html.match(/<button/g) ?? []).length, 4);
  assert.match(html, /View 5 more reaction types/);
});
