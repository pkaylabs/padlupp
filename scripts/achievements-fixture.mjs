export const claimedAt = "2026-11-10T10:00:00Z";
export const profileFixture = [
  { key: "pod_magnet", name: "Pod Magnet", claimed_at: claimedAt },
  { key: "no_ghosting", name: "No Ghosting", claimed_at: claimedAt },
  { key: "accountability_ace", name: "Accountability Ace", claimed_at: claimedAt },
  { key: "goal_started", name: "First Goal", legacy: true, unlocked_at: "2026-01-01T00:00:00Z" },
];

export function createCatalogFixture(definitions, scenario = "catalog") {
  const current = [10, 1, 5, 1, 7, 5, 1, 1, 0];
  const achievements = definitions.map((definition, index) => ({
    key: definition.key, name: definition.name, description: definition.description,
    current: current[index], target: definition.target, eligible: index === 0,
    earned_at: index === 0 ? claimedAt : null, claimed_at: null, requirements: [],
  }));
  if (scenario === "compound") {
    for (const [key, label, target] of [["accountability_ace", "Different pods", 2], ["hype_paddie", "Different other members", 5], ["milestone_hunter", "Different tasks", 3]]) {
      const item = achievements.find((achievement) => achievement.key === key);
      item.current = item.target;
      item.requirements = [{ key: "primary", label: item.name, current: item.target, target: item.target }, { key: "secondary", label, current: 1, target }];
    }
  }
  if (scenario === "collected") for (const item of achievements) item.claimed_at = claimedAt;
  return {
    achievements: scenario === "empty" ? [] : achievements,
    legacy_awards: [{ key: "goal_started", name: "First Goal", unlocked_at: "2026-01-01T00:00:00Z" }],
  };
}

// Shared by the local preview and tests. No request can fall through to HTTP.
export function createPreviewAdapter(getData, { mode = () => "success", delay = 0 } = {}) {
  return async (config) => {
    const data = getData();
    const response = (value) => ({ data: value, status: 200, statusText: "OK", headers: {}, config });
    if (config.method === "get" && config.url === "/achievements/") return response(data);
    const claim = /^\/achievements\/([a-z_]+)\/claim\/$/.exec(config.url);
    if (config.method === "post" && claim) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      const item = data.achievements.find((achievement) => achievement.key === claim[1]);
      const status = !item || mode() === "404" ? 404 : mode() === "409" || (!item.eligible && !item.claimed_at) ? 409 : mode() === "network" ? 503 : 200;
      if (status !== 200) throw Object.assign(new Error(`Preview claim error ${status}`), { response: { status } });
      return response({ ...item, claimed_at: item.claimed_at || claimedAt });
    }
    throw new Error(`Preview blocked unexpected API request: ${config.method} ${config.url}`);
  };
}
