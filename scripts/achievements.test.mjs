import assert from "node:assert/strict";
import { after, test } from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MutationObserver, QueryClient, QueryClientProvider, QueryObserver } from "@tanstack/react-query";
import { createServer } from "vite";
import { createCatalogFixture, createPreviewAdapter, profileFixture, claimedAt } from "./achievements-fixture.mjs";

const account = { user: { id: 7, email: "test@example.invalid" }, sessionId: "login-7", token: "test-token" };
const server = await createServer({ server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, include: [] } });
after(() => server.close());
const { achievementCatalog, profileArtwork, getAchievement, isClaimed, achievementsForTab, partitionMemberAchievements } = await server.ssrLoadModule("/src/features/achievements/catalog.ts");
const { default: ellipseImage } = await server.ssrLoadModule("/src/assets/achievements/profile/ellipse-outline.svg");
const { AchievementBadge } = await server.ssrLoadModule("/src/features/achievements/achievement-badge.tsx");
const { AchievementCard, AchievementCatalog } = await server.ssrLoadModule("/src/features/achievements/achievement-catalog.tsx");
const { MemberAchievements, LegacyAwards } = await server.ssrLoadModule("/src/features/achievements/member-achievements.tsx");
const { AwardsView, SessionAwardsView } = await server.ssrLoadModule("/src/pages/app/dashboard/components/awards-view.tsx");
const apiModule = await server.ssrLoadModule("/src/features/achievements/api.ts");
const { api } = await server.ssrLoadModule("/src/lib/api.ts");
const { useAuthStore } = await server.ssrLoadModule("/src/features/auth/authStore.ts");
const { achievementQueryKeyFor, achievementSession, isCurrentAchievementSession, achievementClaimOptions, getAchievements, claimAchievement, claimErrorMessage, updateClaimedAchievement } = apiModule;
const fixture = () => createCatalogFixture(achievementCatalog);
const render = (Component, props = {}) => renderToStaticMarkup(createElement(Component, props));
const card = (item, props = {}) => render(AchievementCard, { achievement: item, onClaim() {}, ...props });
const catalog = (props = {}) => render(AchievementCatalog, { data: fixture(), onRetry() {}, onClaim() {}, ...props });
const css = readFileSync(new URL("../src/features/achievements/achievements.css", import.meta.url), "utf8");
useAuthStore.persist?.setOptions({ storage: { getItem: () => null, setItem() {}, removeItem() {} } });
useAuthStore.setState(account);
const originalAdapter = api.defaults.adapter;
after(() => { api.defaults.adapter = originalAdapter; });

test("registry contains exactly the nine approved names, keys, targets and earning rules", () => {
  assert.deepEqual(achievementCatalog.map(({ key, name, target }) => [key, name, target]), [
    ["pod_creator", "Pod Creator", 10], ["pod_magnet", "Pod Magnet", 3], ["proof_in_the_pudding", "Proof in the Pudding", 10],
    ["no_ghosting", "No Ghosting", 3], ["accountability_ace", "Accountability Ace", 10], ["hype_paddie", "Hype Paddie", 20],
    ["comeback_kid", "Comeback Kid", 3], ["milestone_hunter", "Milestone Hunter", 10], ["model_paddie", "Model Paddie", 10],
  ]);
  assert.match(getAchievement("no_ghosting").rule, /28 days/);
  assert.match(getAchievement("hype_paddie").rule, /message reactions or thumbs-up.*5 other users.*subject counts once/);
  assert.match(getAchievement("milestone_hunter").rule, /actual completer/);
  assert.match(getAchievement("model_paddie").rule, /10 tasks.*all required check-ins.*on time/);
});

test("all nine original Figma PNGs remain byte-identical, nonempty and used by the registry", () => {
  const hashes = [
    "65217302C62FBDEDD94B8578CD7D3282A3E2E9968D7344960B74D957A17A0A49", "A7246C6AD95DFF84A8AE1D62ADBCA4E6C6D1C58DD3699DA87BE87E110E930516",
    "D1FFD37D4E985F9CAAABD1D67B9BC001340766573D8B54AFAB82D8A7E6AB7F1F", "52B2E25805F314F3C17F3810BABA9E2EB19EE6AF8D6B0B434C12D4A22E145D39",
    "F553857D7DB476F12DF73C246185768ED8CA201F8AAA9A439F544A34B3AE1143", "EC648262BF22ACCC5B0AA7727DDDA8F8DE8275A3A14CAFACE6F304757FAB0A8C",
    "962C0D88E3DD5B95C22C6FC9E45E6C86EE8A81336D3F6169F35932AACCCBC5D5", "C567E832D34310D25D034BAB6F0C76F8D5E9DD371A12A2A2342C3E96E28387B9",
    "E84FDB1F0AAF3A8C11423FBFCA3FFB5E465D8D0FC8C38896C9775DD8E6FEFAE1",
  ];
  achievementCatalog.forEach((definition, index) => {
    const path = `src/assets/achievements/${definition.key.replaceAll("_", "-")}.png`;
    const bytes = readFileSync(new URL(`../${path}`, import.meta.url));
    assert.ok(bytes.length > 100_000);
    assert.ok(bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0);
    assert.equal(createHash("sha256").update(bytes).digest("hex").toUpperCase(), hashes[index]);
    assert.equal(definition.image, `/${path}`);
    assert.match(render(AchievementBadge, { achievementKey: definition.key }), new RegExp(`src="/${path}"`));
  });
});

test("catalog CSS clip geometry retains standard, Hunter and Model Figma fractions", () => {
  for (const definition of achievementCatalog.slice(0, 7)) assert.deepEqual(definition.crop, { width: "100%", height: "185.14%", left: "1.78%", top: "-42.57%" });
  assert.deepEqual(getAchievement("milestone_hunter").crop, { width: "100%", height: "185.14%", left: "-0.54%", top: "-38.73%" });
  assert.deepEqual(getAchievement("model_paddie").crop, { width: "95.6%", height: "177%", left: "3.97%", top: "-38.5%" });
  assert.match(render(AchievementBadge, { achievementKey: "model_paddie" }), /width:95\.6%;height:177%;left:3\.97%;top:-38\.5%/);
  assert.match(css, /width: 83px; height: 80px; filter: drop-shadow\(0px 4px 4px rgba\(50, 101, 175, \.34\)\)/);
  assert.match(css, /achievement-badge-clip[^}]*overflow: hidden/);
});

test("profile uses distinct PNG variants, original SVG layers and exact clip geometry", () => {
  const magnet = render(AchievementBadge, { achievementKey: "pod_magnet", variant: "profile" });
  const ghost = render(AchievementBadge, { achievementKey: "no_ghosting", variant: "profile" });
  const ace = render(AchievementBadge, { achievementKey: "accountability_ace", variant: "profile" });
  assert.match(magnet, /width:33px;height:32px;left:8px;top:9px/);
  assert.match(magnet, /width:116\.98%;height:217\.27%;left:-7\.92%;top:-59\.37%/);
  assert.match(ace, /width:35px;height:34px;left:7px;top:8px/);
  assert.match(ace, /width:109\.06%;height:202\.56%;left:-4\.09%;top:-47\.86%/);
  assert.match(ghost, /class="achievement-badge-art" src="\/src\/assets\/achievements\/profile\/no-ghosting.png"/);
  assert.match(ace, /class="achievement-badge-art" src="\/src\/assets\/achievements\/profile\/accountability-ace.png"/);
  for (const [key, artwork] of Object.entries(profileArtwork)) {
    const html = render(AchievementBadge, { achievementKey: key, variant: "profile" });
    assert.match(html, new RegExp(`width="${artwork.ribbon.width}" height="${artwork.ribbon.height}"`));
    assert.match(html, new RegExp(`left:${artwork.ribbon.left}px;top:${artwork.ribbon.top}px`));
  }
  const images = (html) => [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1].replaceAll("&#x27;", "'"));
  assert.deepEqual(images(magnet).slice(0, 3), [ellipseImage, ellipseImage, profileArtwork.pod_magnet.ribbon.image]);
  assert.deepEqual(images(ghost).slice(0, 3), [profileArtwork.no_ghosting.ribbon.image, ellipseImage, ellipseImage]);
  assert.ok(ace.indexOf('class="achievement-profile-diamond"') < ace.indexOf('<img class="achievement-profile-underlay"'));
});

test("profile assets preserve native SVG sizes and do not reuse different catalog PNGs", () => {
  for (const [name, width, height] of [["ellipse-outline", 31, 32], ["chevron", 12, 12], ["pod-magnet-ribbon", 34.756, 10.5], ["no-ghosting-ribbon", 33.38, 7.71586], ["accountability-ace-ribbon", 33.4603, 6.11912]]) {
    const svg = readFileSync(new URL(`../src/assets/achievements/profile/${name}.svg`, import.meta.url), "utf8");
    assert.match(svg, new RegExp(`width="${width}" height="${height}"`));
  }
  for (const key of ["no_ghosting", "accountability_ace"]) {
    const name = key.replaceAll("_", "-");
    const bytes = readFileSync(new URL(`../src/assets/achievements/profile/${name}.png`, import.meta.url));
    assert.ok(bytes.length > 100_000);
    assert.notDeepEqual(bytes, readFileSync(new URL(`../src/assets/achievements/${name}.png`, import.meta.url)));
  }
});

test("profile tiles remain 50x50 light blue in dark mode; crop-overriding legacy selectors are gone", () => {
  assert.match(css, /achievement-badge-profile \{ width: 50px; height: 50px; border-radius: 10px; background: #d9e9ff/);
  assert.doesNotMatch(css, /\.dark \.achievement-badge-profile\s*\{/);
  assert.match(css, /achievement-profile-list[^}]*gap: 6px/);
  assert.match(css, /achievement-profile-heading[^}]*margin: 0 0 16px[^}]*font-size: 16px; font-weight: 500/);
  const communityCSS = readFileSync(new URL("../src/pages/app/community/community.css", import.meta.url), "utf8");
  assert.doesNotMatch(communityCSS, /\.co-achievements img|\.co-achievements > div span/);
});

test("unknown and legacy keys never get new art, even legacy records with a matching new key", () => {
  for (const key of ["goal_started", "streak_3", "team_player", "__proto__", "unknown"]) {
    assert.equal(getAchievement(key), undefined);
    assert.equal(render(AchievementBadge, { achievementKey: key }), "");
  }
  const achievements = [...profileFixture, { key: "pod_creator", name: "Old award", legacy: true, claimed_at: claimedAt }];
  const html = render(MemberAchievements, { achievements });
  assert.equal((html.match(/role="img"/g) || []).length, 3);
  assert.match(html, /Legacy awards \(2\)/);
  assert.match(html, /First Goal/);
  assert.match(html, /Old award/);
  assert.doesNotMatch(html, /s[1-4]\.png|pod-creator.png/);
});

test("profile fails closed for missing, null, empty, whitespace or invalid claim timestamps", () => {
  for (const claimed_at of [undefined, null, "", " ", "not-a-date"]) {
    const item = { key: "pod_creator", name: "Pod Creator", claimed_at };
    assert.equal(isClaimed(item), false);
    assert.equal(partitionMemberAchievements([item]).collected.length, 0);
    assert.doesNotMatch(render(MemberAchievements, { achievements: [item] }), /role="img"/);
  }
  assert.equal(partitionMemberAchievements(profileFixture).collected.length, 3);
  assert.match(render(MemberAchievements), /No collected achievements/);
});

test("only claimed achievements enter Collected; earned timestamps never grant collection", () => {
  const data = fixture();
  assert.equal(achievementsForTab(data, "collected").length, 0);
  assert.equal(achievementsForTab(data, "ongoing").length, 9);
  data.achievements[1].claimed_at = claimedAt;
  assert.deepEqual(achievementsForTab(data, "collected").map((item) => item.key), ["pod_magnet"]);
  assert.equal(achievementsForTab(data, "ongoing").length, 8);
  assert.match(catalog({ data, initialTab: "collected" }), /Legacy awards \(1\)/);
});

test("cards render server progress, server eligibility, pending, claim errors and collected states", () => {
  const data = fixture();
  assert.match(card(data.achievements[1]), />1\/3<\/span>/);
  assert.doesNotMatch(card(data.achievements[1]), /class="achievement-claim"/);
  assert.match(card({ ...data.achievements[0], current: 0 }), /aria-label="Claim Pod Creator"/);
  const pending = card(data.achievements[0], { claimingKey: "pod_creator" });
  assert.match(pending, /disabled="" aria-busy="true"/);
  assert.match(pending, /Claiming\.\.\./);
  const error = card(data.achievements[0], { claimFailure: { key: "pod_creator", message: "Try again" }, onRefresh() {} });
  assert.match(error, /aria-describedby=/);
  assert.match(error, /role="alert"/);
  assert.match(error, /Refresh progress/);
  assert.doesNotMatch(error, /achievement-collected/);
  assert.match(card({ ...data.achievements[0], claimed_at: claimedAt }), /achievement-collected/);
});

test("compound achievements explain secondary dimensions at full headline count without a Claim button", () => {
  const data = createCatalogFixture(achievementCatalog, "compound");
  for (const [key, label, target] of [["accountability_ace", "Different pods", 2], ["hype_paddie", "Different other members", 5], ["milestone_hunter", "Different tasks", 3]]) {
    const html = card(data.achievements.find((item) => item.key === key));
    assert.match(html, new RegExp(`${label}: 1/${target}`));
    assert.doesNotMatch(html, /class="achievement-claim"/);
  }
  assert.match(css, /min-height: 112px/);
  assert.doesNotMatch(css, /\.achievement-card\s*\{[^}]*;\s*height: 112px/);
});

test("catalog has accessible tabs, real loading/error/retry/empty states and no fabricated rows", () => {
  assert.match(catalog(), /role="tablist"/);
  assert.match(catalog(), /aria-selected="true"[^>]*>Ongoing/);
  assert.match(catalog(), />Collected<\/button>/);
  assert.equal((catalog().match(/class="achievement-card"/g) || []).length, 9);
  assert.match(catalog({ loading: true, data: undefined }), /Loading achievements/);
  assert.doesNotMatch(catalog({ loading: true, data: undefined }), /class="achievement-card"/);
  assert.match(catalog({ error: true }), /role="alert"/);
  assert.match(catalog({ error: true }), /Try again/);
  assert.match(catalog({ data: { achievements: [] } }), /No ongoing achievements/);
  assert.match(catalog({ initialTab: "collected" }), /No collected achievements yet/);
  assert.match(render(LegacyAwards, { awards: fixture().legacy_awards }), /dateTime="2026-01-01T00:00:00Z"/);
});

test("Figma segmented pill and card styles retain exact reference geometry", () => {
  assert.match(css, /achievement-tabs \{[^}]*width: 281px[^}]*height: 55px[^}]*margin: 0 auto 27px[^}]*background: #e1eaf4/);
  assert.match(css, /achievement-tabs > button \{[^}]*height: 32px[^}]*font-size: 16px[^}]*letter-spacing: -\.64px/);
  assert.match(css, /achievement-tabs > button\[aria-selected=true\][^}]*background: #4e92f4/);
  assert.match(css, /max-width: 386px/);
  assert.match(css, /grid-template-columns: 83px minmax\(0, 1fr\) 66px[^}]*gap: 12px; padding: 16px[^}]*background: #e3effc/);
  assert.match(css, /box-shadow: inset 0 -4px 0 #085dd8/);
  assert.match(css, /box-shadow: inset 0 -4px 0 #e8e8e8/);
});

test("API uses exact GET and idempotent POST contract; errors never turn into claimed data", async () => {
  const data = fixture();
  const requests = [];
  const adapter = createPreviewAdapter(() => data);
  api.defaults.adapter = (config) => { requests.push([config.method, config.url]); return adapter(config); };
  assert.deepEqual(await getAchievements(), data);
  const claimed = await claimAchievement("pod_creator");
  assert.equal(claimed.claimed_at, claimedAt);
  assert.deepEqual(await claimAchievement("pod_creator"), claimed);
  assert.deepEqual(requests.slice(0, 2), [["get", "/achievements/"], ["post", "/achievements/pod_creator/claim/"]]);
  await assert.rejects(claimAchievement("pod_magnet"), (error) => error.response.status === 409);
  await assert.rejects(claimAchievement("goal_started"), /Unknown achievement/);
  assert.equal(data.achievements[0].claimed_at, null, "no optimistic mutation of server data");
  assert.match(claimErrorMessage({ response: { status: 409 } }), /requirements.*refreshed/);
  assert.match(claimErrorMessage({ response: { status: 404 } }), /no longer available/);
  assert.match(claimErrorMessage(new Error("offline")), /try again/);
});

test("claim cache merge preserves legacy history and never infers a claim from earned_at", () => {
  const data = fixture();
  const updated = updateClaimedAchievement(data, { ...data.achievements[0], claimed_at: claimedAt });
  assert.equal(updated.legacy_awards, data.legacy_awards);
  assert.equal(updated.achievements[1], data.achievements[1]);
  assert.equal(data.achievements[0].claimed_at, null);
  assert.equal(updateClaimedAchievement(data, data.achievements[0]).achievements[0].claimed_at, null);
  assert.equal(updateClaimedAchievement(undefined, data.achievements[0]), undefined);
});

test("achievement keys isolate accounts and sessions without exposing tokens in cache keys", () => {
  const session = achievementSession(account);
  const current = achievementQueryKeyFor(session);
  assert.notDeepEqual(current, achievementQueryKeyFor({ ...session, userId: 8 }));
  assert.notDeepEqual(current, achievementQueryKeyFor({ ...session, sessionId: "new-login" }));
  assert.ok(!JSON.stringify(current).includes(session.token));
  assert.equal(isCurrentAchievementSession(session, session), true);
  for (const change of [{ userId: 8 }, { sessionId: "new-login" }, { token: "new-token" }, { userId: null, token: null, sessionId: null }]) assert.equal(isCurrentAchievementSession(session, { ...session, ...change }), false);
});

test("successful claim refreshes community and pod profiles; 409 remains ongoing and supports retry", async () => {
  useAuthStore.setState(account);
  const client = new QueryClient();
  const session = achievementSession(account);
  const key = achievementQueryKeyFor(session);
  const data = fixture();
  client.setQueryData(key, data);
  client.setQueryData(["community", "pod-task", 21], {});
  client.setQueryData(["goal-members", "21"], {});
  let announcement = null;
  let mode = "409";
  let serverData = fixture();
  const adapter = createPreviewAdapter(() => serverData, { mode: () => mode });
  api.defaults.adapter = (config) => {
    if (config.method === "post" && mode === "409") serverData = { ...serverData, achievements: serverData.achievements.map((item) => item.key === "pod_creator" ? { ...item, current: 9, eligible: false } : item) };
    return adapter(config);
  };
  const queryObserver = new QueryObserver(client, { queryKey: key, queryFn: ({ signal }) => getAchievements(signal), staleTime: Infinity });
  const unsubscribe = queryObserver.subscribe(() => {});
  const observer = new MutationObserver(client, achievementClaimOptions(client, session, (achievement) => { announcement = achievement; }));
  try {
    await assert.rejects(observer.mutate("pod_creator"), (error) => error.response.status === 409);
    for (let attempt = 0; attempt < 100 && client.getQueryData(key).achievements[0].eligible; attempt++) await new Promise((resolve) => setTimeout(resolve, 1));
    assert.equal(client.getQueryData(key).achievements[0].claimed_at, null);
    assert.equal(client.getQueryData(key).achievements[0].eligible, false);
    assert.equal(client.getQueryData(key).achievements[0].current, 9);
    assert.equal(announcement, null);
    const html = card(client.getQueryData(key).achievements[0], { claimFailure: { key: "pod_creator", message: claimErrorMessage(observer.getCurrentResult().error) }, onRefresh() {} });
    assert.match(html, /role="alert"/);
    assert.match(html, /Refresh progress/);
    assert.doesNotMatch(html, /achievement-collected/);
    assert.doesNotMatch(html, /class="achievement-claim"/);
    assert.match(html, />9\/10<\/span>/);
    mode = "success";
    serverData = fixture();
    await client.refetchQueries({ queryKey: key });
    await observer.mutate("pod_creator");
    assert.equal(client.getQueryData(key).achievements[0].claimed_at, claimedAt);
    assert.equal(announcement.key, "pod_creator");
    assert.equal(client.getQueryState(["community", "pod-task", 21]).isInvalidated, true);
    assert.equal(client.getQueryState(["goal-members", "21"]).isInvalidated, true);
  } finally { unsubscribe(); client.clear(); }
});

test("a delayed claim from a previous login cannot populate or invalidate the next user's data", async () => {
  useAuthStore.setState(account);
  const client = new QueryClient();
  const oldSession = achievementSession(account);
  const oldKey = achievementQueryKeyFor(oldSession);
  client.setQueryData(oldKey, fixture());
  let finish;
  let announcement = false;
  api.defaults.adapter = (config) => new Promise((resolve) => { finish = () => resolve({ data: { ...fixture().achievements[0], claimed_at: claimedAt }, status: 200, statusText: "OK", headers: {}, config }); });
  const observer = new MutationObserver(client, achievementClaimOptions(client, oldSession, () => { announcement = true; }));
  try {
    const pending = observer.mutate("pod_creator");
    while (!finish) await new Promise((resolve) => setTimeout(resolve, 1));
    useAuthStore.setState({ ...account, user: { id: 8 }, sessionId: "login-8", token: "token-8" });
    client.clear();
    const newKey = achievementQueryKeyFor(achievementSession(useAuthStore.getState()));
    client.setQueryData(newKey, { achievements: [] });
    client.setQueryData(["community", "pod-task", 21], {});
    finish(); await pending;
    assert.equal(client.getQueryData(oldKey), undefined);
    assert.deepEqual(client.getQueryData(newKey), { achievements: [] });
    assert.equal(client.getQueryState(["community", "pod-task", 21]).isInvalidated, false);
    assert.equal(announcement, false);
  } finally { client.clear(); useAuthStore.setState(account); }
});

test("actual session AwardsView renders seeded catalog; signed-out SSR wrapper cannot expose another account", () => {
  useAuthStore.setState(account);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(achievementQueryKeyFor(achievementSession(account)), fixture());
  api.defaults.adapter = () => { throw new Error("Network disabled"); };
  try {
    const html = renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(SessionAwardsView, { session: achievementSession(account) })));
    assert.equal((html.match(/class="achievement-card"/g) || []).length, 9);
    assert.doesNotMatch(html, /s[1-4]\.png|awards unlocked/);
    // Zustand's server snapshot is deliberately signed out, unlike its live
    // client state; the outer view must not read the seeded account's cache.
    const signedOut = renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(AwardsView)));
    assert.doesNotMatch(signedOut, /class="achievement-card"/);
  } finally { client.clear(); }
});

test("preview uses actual components and a blocking local adapter, outside production routes", async () => {
  const entry = readFileSync(new URL("./achievements-preview-entry.tsx", import.meta.url), "utf8");
  assert.match(entry, /<AwardsView key=/);
  assert.match(entry, /<MemberAchievements achievements=\{profileFixture\}/);
  assert.match(entry, /api.defaults.adapter = createPreviewAdapter/);
  assert.match(entry, /getItem: \(\) => null, setItem: \(\) => \{\}/);
  await assert.rejects(createPreviewAdapter(fixture)({ method: "get", url: "/community/anything/" }), /blocked unexpected API/);
});
