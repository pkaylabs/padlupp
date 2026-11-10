import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { getIncomingReadMessageIds, getReadReceiptMatcher, isActiveChatVisible, isMessagePaneVisible } from "../src/pages/app/messages/utils/read-receipts.ts";
import * as messageUpdates from "../src/pages/app/messages/utils/message-updates.ts";

const user = { id: 1, name: "Mary", avatar: null };
const peer = { id: 2, name: "Me", avatar: null };
const message = { id: 20, conversation: 8, sender: user, text: "Hello", is_read: false, created_at: "2026-11-01T01:00:00Z", updated_at: "2026-11-01T01:00:00Z" };
const receipt = { type: "read_all", by_user_id: 2, conversation_id: 8, message_ids: [20] };
const match = (payload, userId = 1, conversationId = 8) => getReadReceiptMatcher(payload, userId, conversationId);

test("both receipt types require a positive numeric peer reader and current authenticated identity", () => {
  for (const type of ["read", "read_all"]) {
    for (const by_user_id of [undefined, null, 1, 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "2", true, {}, []]) {
      assert.equal(match({ ...receipt, type, by_user_id }), null, `${type}: ${String(by_user_id)}`);
    }
    for (const userId of [null, undefined, 0, -1, 1.5, NaN, Infinity, "1", true]) {
      assert.equal(getReadReceiptMatcher({ ...receipt, type }, userId, 8), null);
    }
    assert.equal(match({ ...receipt, type })(message), true);
  }
});

test("unknown, malformed, empty and unscoped receipts fail closed", () => {
  for (const payload of [null, [], "read_all", {}, { ...receipt, type: "delivered" }]) {
    assert.equal(match(payload), null);
  }
  for (const type of ["read", "read_all"]) {
    for (const conversation_id of [undefined, null, 0, -1, 1.5, NaN, Infinity, "8", 9]) {
      assert.equal(match({ ...receipt, type, conversation_id }), null);
    }
    for (const message_ids of [undefined, null, [], "20", 20, ["20"], [0], [-1], [1.5], [NaN], [Infinity], [Number.MAX_SAFE_INTEGER + 1], [20, "21"], [20, null], Array(1)]) {
      assert.equal(match({ ...receipt, type, message_ids }), null, `${type}: ${String(message_ids)}`);
    }
  }
  assert.equal(match({ ...receipt, message_ids: undefined, message_id: 20 }), null, "read_all cannot fall back to a singular ID or the full history");
  assert.equal(match({ ...receipt, message_id: "20" }), null);
  assert.equal(getReadReceiptMatcher(receipt, 1, "8"), null);
});

test("read accepts singular IDs, explicit ID lists, or both without coercion", () => {
  const singular = match({ type: "read", by_user_id: 2, conversation_id: 8, message_id: 20 });
  assert.equal(singular(message), true);
  assert.equal(singular({ ...message, id: 21 }), false);
  assert.equal(match({ ...receipt, type: "read", message_ids: [20, 20, 21] })({ ...message, id: 21 }), true);
  const both = match({ ...receipt, type: "read", message_id: 21 });
  assert.equal(both(message), true);
  assert.equal(both({ ...message, id: 21 }), true);
  for (const message_id of [null, 0, -1, 1.5, "20", NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(match({ type: "read", by_user_id: 2, conversation_id: 8, message_id }), null);
    assert.equal(match({ ...receipt, type: "read", message_id }), null);
  }
});

test("receipts only match exact server IDs authored by the authenticated user in that conversation", () => {
  const shouldMark = match(receipt);
  for (const candidate of [null, {}, { ...message, id: 21 }, { ...message, id: "20" }, { ...message, id: "temp-20" }, { ...message, id: 0 }, { ...message, optimistic: true }, { ...message, conversation: 9 }, { ...message, sender: peer }, { ...message, sender: { id: "1", name: "Me" } }, { ...message, sender: null }]) {
    assert.equal(shouldMark(candidate), false);
  }
  assert.equal(shouldMark(message), true, "real sender identity, not display name, authorizes the update");
  assert.equal(shouldMark({ ...message, optimistic: false }), true);
});

test("bounded receipts update cache and matching previews without marking incoming or newer messages", () => {
  const newer = { ...message, id: 21 };
  const incoming = { ...message, id: 22, sender: peer };
  const optimistic = { ...message, id: "temp-20", optimistic: true };
  const messages = [message, newer, incoming, optimistic];
  const shouldMark = match({ ...receipt, message_ids: [20, 22, 999] });
  const next = messageUpdates.markCachedMessagesRead(messages, shouldMark);
  assert.deepEqual(next.map((item) => item.is_read), [true, false, false, false]);
  assert.equal(next[0].optimistic, false);
  assert.equal(message.is_read, false, "does not mutate the existing cache");
  assert.equal(messageUpdates.markCachedMessagesRead(next, shouldMark), next, "duplicate receipts are idempotent");
  assert.equal(messageUpdates.markCachedMessagesRead(messages, match({ ...receipt, message_ids: [999] })), messages);

  const conversations = [{ id: 8, last_message: message, unread_count: 3 }, { id: 9, last_message: message, unread_count: 2 }];
  const previews = messageUpdates.markConversationMessagesRead(conversations, 8, shouldMark);
  assert.equal(previews[0].last_message.is_read, true);
  assert.equal(previews[0].unread_count, 3, "a peer reading our message does not clear our incoming unread count");
  assert.equal(previews[1], conversations[1]);
  assert.equal(messageUpdates.markConversationMessagesRead(previews, 8, shouldMark), previews);
  const latest = [{ id: 8, last_message: newer }];
  assert.equal(messageUpdates.markConversationMessagesRead(latest, 8, shouldMark), latest);
});

test("visibility checks require an actual selected chat and a visible document", () => {
  assert.equal(isActiveChatVisible(8, 8, "visible"), true);
  for (const args of [[8, 9, "visible"], [8, null, "visible"], [8, 8, "hidden"], [8, 8, undefined], [null, null, "visible"], [0, 0, "visible"], ["8", "8", "visible"]]) {
    assert.equal(isActiveChatVisible(...args), false);
  }
});

test("the Activities pane must be visible, including the narrow-layout list/chat toggle", () => {
  for (const activeTab of ["Activities", "Shared"]) {
    for (const showMobileChat of [false, true]) {
      for (const isWideLayout of [false, true]) {
        assert.equal(isMessagePaneVisible(activeTab, showMobileChat, isWideLayout),
          activeTab === "Activities" && (showMobileChat || isWideLayout));
      }
    }
  }
});

test("outgoing read requests contain only exact unread incoming IDs already in the selected cache", () => {
  const incoming = { ...message, id: 22, sender: peer };
  const candidates = [incoming, incoming, message, { ...incoming, is_read: true }, { ...incoming, id: "22" }, { ...incoming, id: "temp-22" }, { ...incoming, optimistic: true }, { ...incoming, conversation: 9 }, { ...incoming, sender: { id: 0 } }, { ...incoming, sender: { id: "2" } }, { ...incoming, sender: null }, null, {}];
  assert.deepEqual(getIncomingReadMessageIds(candidates, 1, 8), [22]);
  assert.deepEqual(getIncomingReadMessageIds(candidates, null, 8), []);
  assert.deepEqual(getIncomingReadMessageIds(candidates, 1, "8"), []);
});

// Exercise the real hook with deterministic React lifecycle and socket boundaries.
const hookCode = ts.transpileModule(readFileSync(new URL("../src/pages/app/messages/hooks/useChat.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function createChatHarness(visibilityState = "visible", isChatPaneVisible = true) {
  const slots = [];
  const listeners = new Map();
  const timers = new Map();
  const sockets = [];
  const auth = { token: "test-token", user };
  const history = { results: [] };
  let cursor = 0;
  let dirty = true;
  let effects = [];
  let state;
  const sameDeps = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: typeof initial === "function" ? initial() : initial };
      return [slots[index].value, (update) => {
        const value = typeof update === "function" ? update(slots[index].value) : update;
        if (!Object.is(value, slots[index].value)) {
          slots[index].value = value;
          dirty = true;
        }
      }];
    },
    useRef(initial) {
      const index = cursor++;
      return slots[index] ??= { current: initial };
    },
    useMemo(factory, deps) {
      const index = cursor++;
      if (!sameDeps(slots[index]?.deps, deps)) slots[index] = { value: factory(), deps };
      return slots[index].value;
    },
    useCallback(callback, deps) { return react.useMemo(() => callback, deps); },
    useEffect(effect, deps) {
      const index = cursor++;
      if (sameDeps(slots[index]?.deps, deps)) return;
      effects.push(() => {
        slots[index]?.cleanup?.();
        slots[index] = { deps, cleanup: effect() };
      });
    },
    useLayoutEffect(effect, deps) { react.useEffect(effect, deps); },
  };
  class FakeWebSocket {
    static OPEN = 1;
    constructor(url) { this.url = url; this.readyState = 0; this.sent = []; sockets.push(this); }
    send(value) { assert.equal(this.readyState, 1); this.sent.push(JSON.parse(value)); }
    open() { this.readyState = 1; this.onopen?.(); }
    receive(payload) { this.onmessage?.({ data: JSON.stringify(payload) }); }
    close() { this.readyState = 3; this.onclose?.({ code: 1000 }); }
  }
  const document = {
    visibilityState,
    addEventListener(type, callback) { const group = listeners.get(type) ?? new Set(); group.add(callback); listeners.set(type, group); },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
  };
  const useAuthStore = (selector) => selector(auth);
  useAuthStore.getState = () => auth;
  const dependencies = {
    react,
    "@/features/auth/authStore": { useAuthStore },
    "@/constants": { WS_BASE_URL: "wss://chat.invalid" },
    "../api": { getMessages: async () => history, getArchivedConversations: async () => [{ id: 8, last_message: message }] },
    "../utils/message-updates": messageUpdates,
    "../utils/read-receipts": { getIncomingReadMessageIds, getReadReceiptMatcher, isActiveChatVisible },
  };
  const exports = {};
  runInNewContext(hookCode, {
    exports, require(name) { assert.ok(dependencies[name], `unexpected dependency ${name}`); return dependencies[name]; },
    document, WebSocket: FakeWebSocket,
    window: { setTimeout(callback) { const id = timers.size + 1; timers.set(id, callback); return id; }, clearTimeout(id) { timers.delete(id); } },
  });
  const render = () => {
    let passes = 0;
    while (dirty) {
      assert.ok(++passes < 20, "hook should settle");
      cursor = 0;
      dirty = false;
      state = exports.useChat({ isChatPaneVisible });
      const pending = effects;
      effects = [];
      pending.forEach((effect) => effect());
    }
    return state;
  };
  render();
  return {
    auth, history, sockets, timers, render,
    get state() { return render(); },
    get chat() { return sockets.findLast((socket) => socket.url.includes("/ws/chat/")); },
    get conversations() { return sockets.find((socket) => socket.url.includes("/ws/conversations/")); },
    async settle() { await new Promise(setImmediate); return render(); },
    select(id) { render().setActiveConversationId(id); return render(); },
    visibility(value) { document.visibilityState = value; listeners.get("visibilitychange")?.forEach((callback) => callback()); return render(); },
    pane(value) { isChatPaneVisible = value; dirty = true; return render(); },
    dispose() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

test("useChat ignores self echoes and malformed receipts, and applies exact peer IDs to cache and previews", async (t) => {
  const h = createChatHarness();
  t.after(() => h.dispose());
  h.select(8);
  await h.settle();
  h.chat.open();
  h.conversations.receive({ type: "conversations", conversations: [{ id: 8, last_message: message, unread_count: 0 }] });
  h.chat.receive({ type: "history", messages: [message, { ...message, id: 21 }, { ...message, id: 22, sender: peer }] });
  await h.state.loadArchivedConversations();
  for (const payload of [{ ...receipt, by_user_id: 1 }, { type: "read_all" }, { ...receipt, message_ids: [] }, { ...receipt, conversation_id: 9 }, { ...receipt, type: "read", by_user_id: undefined }]) {
    h.chat.receive(payload);
    assert.equal(h.state.messages[0].is_read, false);
    assert.equal(h.state.conversations[0].last_message.is_read, false);
    assert.equal(h.state.archivedConversations[0].last_message.is_read, false);
  }
  h.chat.receive({ ...receipt, message_ids: [20, 22, 999] });
  assert.deepEqual(Array.from(h.state.messages, (item) => item.is_read), [true, false, false]);
  assert.equal(h.state.conversations[0].last_message.is_read, true);
  assert.equal(h.state.archivedConversations[0].last_message.is_read, true);
  h.chat.receive({ type: "read", by_user_id: 2, conversation_id: 8, message_id: 21 });
  assert.equal(h.state.messages[1].is_read, true);
});

test("conversation snapshots propagate read-only changes to the last-message preview", (t) => {
  const h = createChatHarness();
  t.after(() => h.dispose());
  const conversation = { id: 8, last_message: message, unread_count: 0 };
  h.conversations.receive({ type: "conversations", conversations: [conversation] });
  assert.equal(h.state.conversations[0].last_message.is_read, false);
  h.conversations.receive({ type: "conversations", conversations: [{ ...conversation, last_message: { ...message, is_read: true } }] });
  assert.equal(h.state.conversations[0].last_message.is_read, true);
  h.conversations.receive({ type: "conversations", conversations: [conversation] });
  assert.equal(h.state.conversations[0].last_message.is_read, false, "authoritative snapshots also reconcile a previous false-positive read");
});

test("visible websocket and REST history acknowledge loaded incoming IDs, never own or unseen messages", async (t) => {
  const h = createChatHarness();
  t.after(() => h.dispose());
  h.select(8);
  await h.settle();
  h.chat.open();
  assert.equal(h.chat.sent.length, 0, "opening a socket cannot acknowledge unseen history");
  const incoming = { ...message, id: 22, sender: peer };
  h.chat.receive({ type: "history", messages: [message, incoming, { ...incoming, id: 23, is_read: true }] });
  h.render();
  assert.deepEqual(h.chat.sent, [{ type: "read", message_ids: [22] }]);
  h.state.markAllRead();
  h.chat.receive(incoming);
  h.render();
  assert.equal(h.chat.sent.filter((item) => item.type === "read").length, 1, "repeated cache updates do not resend acknowledged IDs");

  h.select(9);
  await h.settle();
  h.chat.open();
  h.history.results = [{ ...incoming, id: 24 }, message];
  h.select(8);
  h.chat.open();
  await h.settle();
  assert.ok(h.chat.sent.some((item) => item.type === "read" && item.message_ids.includes(24)), "REST history arriving after open is acknowledged");
  assert.ok(h.chat.sent.every((item) => item.type === "read" && item.message_ids.every((id) => id === 22 || id === 24)));
});

test("authoritative history replaces a prior display-only Read state instead of preserving a local OR", async (t) => {
  const h = createChatHarness();
  t.after(() => h.dispose());
  h.select(8);
  await h.settle();
  h.chat.receive({ type: "history", messages: [message] });
  h.chat.receive(receipt);
  assert.equal(h.state.messages[0].is_read, true);
  h.chat.receive({ type: "history", messages: [message] });
  assert.equal(h.state.messages[0].is_read, false, "websocket history is authoritative");
  h.chat.receive(receipt);
  assert.equal(h.state.messages[0].is_read, true);
  h.history.results = [message];
  h.select(null);
  h.select(8);
  await h.settle();
  assert.equal(h.state.messages[0].is_read, false, "REST history is authoritative too");
});

test("hidden chats deliver but never read; returning visibility acknowledges cached incoming messages", async (t) => {
  const h = createChatHarness("hidden");
  t.after(() => h.dispose());
  h.select(8);
  await h.settle();
  h.state.markAllRead();
  h.chat.open();
  assert.equal(h.chat.sent.length, 0, "neither queued reads nor onopen reads while hidden");
  const incoming = { ...message, id: 22, sender: peer };
  h.conversations.receive({ type: "conversations", conversations: [{ id: 8, last_message: incoming, unread_count: 3 }] });
  h.render();
  h.conversations.receive({ type: "conversation_update", conversation: { id: 8, last_message: incoming, unread_count: 4 } });
  h.render();
  h.chat.receive(incoming);
  assert.equal(h.state.messages[0].id, 22);
  assert.equal(h.state.conversations[0].unread_count, 4, "background updates retain unread counts");
  assert.deepEqual(h.chat.sent.map((item) => item.type), ["delivered"]);
  h.state.markAllRead();
  h.visibility("hidden");
  assert.equal(h.chat.sent.length, 1);
  h.visibility("visible");
  assert.deepEqual(h.chat.sent, [{ type: "delivered", message_id: 22 }, { type: "read", message_ids: [22] }]);
  assert.equal(h.state.conversations[0].unread_count, 4, "bounded reads must not clear unloaded unread messages locally");
  h.chat.receive({ ...incoming, id: 23 });
  h.render();
  assert.deepEqual(h.chat.sent.slice(-2), [{ type: "delivered", message_id: 23 }, { type: "read", message_ids: [23] }]);
  h.conversations.receive({ type: "conversation_update", conversation: { id: 8, last_message: incoming, unread_count: 0 } });
  assert.equal(h.state.conversations[0].unread_count, 0, "server unread counts remain authoritative");
});

test("Shared and narrow-list panes suppress history and arrival reads until Activities is shown", async (t) => {
  const h = createChatHarness("visible", false);
  t.after(() => h.dispose());
  h.select(8);
  await h.settle();
  h.chat.open();
  const socket = h.chat;
  const incoming = { ...message, id: 22, sender: peer };
  socket.receive({ type: "history", messages: [incoming] });
  h.state.markAllRead();
  h.visibility("visible");
  assert.equal(socket.sent.length, 0);
  socket.receive({ ...incoming, id: 23 });
  h.render();
  assert.deepEqual(socket.sent, [{ type: "delivered", message_id: 23 }]);
  h.pane(true);
  assert.equal(h.chat, socket, "tab/layout changes do not reconnect the chat socket");
  assert.deepEqual(socket.sent.at(-1), { type: "read", message_ids: [22, 23] });
  h.pane(false);
  socket.receive({ ...incoming, id: 24 });
  h.state.markAllRead();
  assert.equal(socket.sent.filter((item) => item.type === "read").length, 1);
  h.visibility("hidden");
  h.pane(true);
  assert.equal(socket.sent.filter((item) => item.type === "read").length, 1, "Activities still requires a visible document");
  h.visibility("visible");
  assert.deepEqual(socket.sent.at(-1), { type: "read", message_ids: [24] });
});

test("reads are never queued across chat switches, stale sockets, disconnects or account changes", async (t) => {
  const h = createChatHarness();
  t.after(() => h.dispose());
  h.select(8);
  await h.settle();
  h.state.markAllRead();
  const oldSocket = h.chat;
  // Selection updates the routing guard before React's next effect commits.
  h.state.setActiveConversationId(9);
  oldSocket.open();
  assert.equal(oldSocket.sent.length, 0);
  h.render();
  await h.settle();
  h.visibility("hidden");
  h.chat.open();
  assert.equal(h.chat.sent.length, 0, "no old read request is flushed into another chat");
  oldSocket.receive({ ...message, sender: peer });
  assert.equal(oldSocket.sent.length, 0);
  h.chat.receive({ type: "history", messages: [{ ...message, id: 22, conversation: 9, sender: peer }, { ...message, conversation: 9 }] });
  h.render();
  h.visibility("visible");
  assert.equal(h.chat.sent.length, 1);
  assert.deepEqual(h.chat.sent[0], { type: "read", message_ids: [22] });
  const currentSocket = h.chat;
  const currentState = h.state;
  h.auth.user = { ...user, id: 3 };
  currentSocket.receive({ ...receipt, conversation_id: 9 });
  currentState.markAllRead();
  assert.equal(currentSocket.sent.length, 1);
  h.auth.user = user;
  assert.equal(h.state.messages[0].is_read, false, "an old socket cannot authorize updates for a new login");
  h.select(null);
  h.visibility("visible");
  h.state.markAllRead();
  assert.equal(h.chat.sent.length, 1, "no selected chat means no read acknowledgement");
});

test("reconnection retries only cached incoming IDs and still respects document visibility", async (t) => {
  const h = createChatHarness();
  t.after(() => h.dispose());
  h.select(8);
  await h.settle();
  h.chat.open();
  h.chat.receive({ type: "history", messages: [message, { ...message, id: 22, sender: peer }] });
  h.render();
  const disconnected = h.chat;
  assert.deepEqual(disconnected.sent, [{ type: "read", message_ids: [22] }]);
  h.visibility("hidden");
  disconnected.close();
  h.state.markAllRead();
  assert.equal(disconnected.sent.length, 1);
  assert.equal(h.timers.size, 1);
  [...h.timers.values()][0]();
  h.render();
  assert.notEqual(h.chat, disconnected);
  h.chat.open();
  assert.equal(h.chat.sent.length, 0);
  h.visibility("visible");
  assert.deepEqual(h.chat.sent, [{ type: "read", message_ids: [22] }]);
});
