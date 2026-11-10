import { useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "../src/lib/api";
import { achievementCatalog } from "../src/features/achievements/catalog";
import { AchievementBadge } from "../src/features/achievements/achievement-badge";
import { AchievementCatalog } from "../src/features/achievements/achievement-catalog";
import { achievementQueryKeyFor } from "../src/features/achievements/api";
import { useAuthStore } from "../src/features/auth/authStore";
import type { AchievementsResponse } from "../src/features/achievements/types";
import { AwardsView } from "../src/pages/app/dashboard/components/awards-view";
import { MemberAchievements } from "../src/pages/app/community/ui";
import { createCatalogFixture, createPreviewAdapter, profileFixture } from "./achievements-fixture.mjs";
import "../src/App.css";
import "../src/pages/app/community/community.css";

const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false }, mutations: { retry: false } } });
// A memory-only identity exercises the real session-scoped component without
// sign-in, auth-storage writes, or real credentials.
useAuthStore.persist.setOptions({ storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} } });
useAuthStore.setState({ user: { id: -1, email: "preview@example.invalid" }, sessionId: "achievement-preview", token: "preview-only", isAuthenticated: true });
const achievementQueryKey = achievementQueryKeyFor({ userId: -1, sessionId: "achievement-preview", token: "preview-only" });
client.setQueryDefaults(achievementQueryKey, { enabled: false, staleTime: Infinity });
client.setQueryData(achievementQueryKey, createCatalogFixture(achievementCatalog));
let claimMode = "success";
api.defaults.adapter = createPreviewAdapter(() => client.getQueryData<AchievementsResponse>(achievementQueryKey), { mode: () => claimMode, delay: 700 });

export function Preview() {
  const [scenario, setScenario] = useState("catalog");
  const [version, setVersion] = useState(0);
  const [dark, setDark] = useState(false);
  function reset(value: string) {
    client.setQueryData(achievementQueryKey, createCatalogFixture(achievementCatalog, value));
    setScenario(value); setVersion((previous) => previous + 1);
  }
  return <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 12px", fontFamily: "Montserrat, sans-serif" }}>
    <h1 style={{ fontSize: 20, fontWeight: 600 }}>Achievements: local fixture preview</h1>
    <p style={{ fontSize: 12, margin: "8px 0 16px" }}>Actual web components. No sign-in or production API requests. Claims are simulated locally.</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 12 }}>
      <label>Scenario <select value={scenario} onChange={(event) => reset(event.target.value)}>{["catalog", "compound", "collected", "empty", "loading", "error"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Claim result <select onChange={(event) => { claimMode = event.target.value; }}>{["success", "409", "404", "network"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><input type="checkbox" checked={dark} onChange={(event) => { setDark(event.target.checked); document.documentElement.classList.toggle("dark", event.target.checked); }} /> Dark mode</label>
      <button type="button" onClick={() => reset(scenario)}>Reset fixtures</button>
    </div>
    <div style={{ width: "100%", maxWidth: 386, margin: "24px auto" }}>
      <div className="co-modal" style={{ maxHeight: "none", width: "100%" }}><MemberAchievements achievements={profileFixture} /></div>
      {scenario === "loading" || scenario === "error" ? <AchievementCatalog loading={scenario === "loading"} error={scenario === "error"} onRetry={() => reset("catalog")} onClaim={() => {}} /> : <AwardsView key={version} />}
      <details style={{ marginTop: 24, fontSize: 12 }}><summary>All nine profile tiles (six catalog-art fallbacks)</summary><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>{achievementCatalog.map((achievement) => <AchievementBadge key={achievement.key} achievementKey={achievement.key} variant="profile" />)}</div></details>
    </div>
  </main>;
}

createRoot(document.getElementById("root")!).render(<QueryClientProvider client={client}><Preview /></QueryClientProvider>);
