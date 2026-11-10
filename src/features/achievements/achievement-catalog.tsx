import { useId, useRef, useState } from "react";
import { AchievementBadge } from "./achievement-badge";
import { achievementCatalog, achievementsForTab, getAchievement, isClaimed, type AchievementKey, type AchievementTab } from "./catalog";
import { LegacyAwards } from "./member-achievements";
import type { AchievementProgress, AchievementsResponse } from "./types";

export interface ClaimFailure { key: string; message: string }

export function AchievementCard({ achievement, onClaim, claimingKey, claimFailure, onRefresh }: {
  achievement: AchievementProgress;
  onClaim: (key: AchievementKey) => void;
  claimingKey?: string | null;
  claimFailure?: ClaimFailure | null;
  onRefresh?: () => void;
}) {
  const definition = getAchievement(achievement.key);
  const errorId = useId();
  if (!definition) return null;
  const collected = isClaimed(achievement);
  const pending = claimingKey === achievement.key;
  const error = claimFailure?.key === achievement.key ? claimFailure.message : undefined;
  // Never derive eligibility from the headline count: compound rules can still
  // be unmet. Show the server's unmet dimensions, including at 10/10 or 20/20.
  const requirements = !collected && !achievement.eligible && (achievement.requirements.length > 1 || achievement.current >= achievement.target)
    ? achievement.requirements.filter((requirement) => requirement.current < requirement.target) : [];
  return <li className="achievement-card">
    <AchievementBadge achievementKey={achievement.key} />
    <div className="achievement-card-copy">
      <h3>{definition.name}</h3>
      <p>{definition.description}</p>
      {requirements.map((requirement) => <p className="achievement-requirement" key={requirement.key}>{requirement.label}: {requirement.current}/{requirement.target}</p>)}
    </div>
    <div className="achievement-card-action">
      {collected ? <span className="achievement-collected">Collected</span> : achievement.eligible ?
        <button type="button" className="achievement-claim" disabled={Boolean(claimingKey)} aria-busy={pending} aria-label={`${pending ? "Claiming" : "Claim"} ${definition.name}`} aria-describedby={error ? errorId : undefined} onClick={() => onClaim(definition.key)}>{pending ? "Claiming..." : "Claim"}</button> :
        <span className="achievement-progress" aria-label={`${definition.name}: ${achievement.current} of ${achievement.target}; requirements not yet met`}>{achievement.current}/{achievement.target}</span>}
    </div>
    {error && <div className="achievement-claim-error" id={errorId} role="alert"><p>{error}</p>{onRefresh && <button type="button" onClick={onRefresh}>Refresh progress</button>}</div>}
  </li>;
}

export function AchievementCatalog({ data, loading, error, onRetry, onClaim, claimingKey, claimFailure, announcement, initialTab = "ongoing" }: {
  data?: AchievementsResponse;
  loading?: boolean;
  error?: boolean;
  onRetry: () => void;
  onClaim: (key: AchievementKey) => void;
  claimingKey?: string | null;
  claimFailure?: ClaimFailure | null;
  announcement?: string;
  initialTab?: AchievementTab;
}) {
  const [tab, setTab] = useState<AchievementTab>(initialTab);
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const items = data ? achievementsForTab(data, tab) : [];
  return <section className="achievement-catalog" aria-label="Achievements">
    <div className="achievement-tabs" role="tablist" aria-label="Achievement collection">
      {(["ongoing", "collected"] as const).map((value, index) => <button type="button" role="tab" key={value} id={`${id}-${value}`} aria-controls={`${id}-panel`} aria-selected={tab === value} tabIndex={tab === value ? 0 : -1} ref={(element) => { tabRefs.current[index] = element; }} onClick={() => setTab(value)} onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
        setTab(next === 0 ? "ongoing" : "collected");
        tabRefs.current[next]?.focus();
      }}>{value === "ongoing" ? "Ongoing" : "Collected"}</button>)}
    </div>
    <p className="achievement-sr-only" role="status" aria-live="polite">{announcement}</p>
    <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${tab}`} tabIndex={0} aria-busy={loading || undefined}>
      {loading && <p className="achievement-notice" role="status">Loading achievements...</p>}
      {error && <div className="achievement-notice" role="alert"><p>We couldn't load your achievements.</p><button type="button" onClick={onRetry}>Try again</button></div>}
      {!loading && !error && data && <>
        {items.length ? <ul className="achievement-list">{items.map((achievement) => <AchievementCard key={achievement.key} achievement={achievement} onClaim={onClaim} claimingKey={claimingKey} claimFailure={claimFailure} onRefresh={onRetry} />)}</ul> : <p className="achievement-notice">{tab === "collected" ? "No collected achievements yet. Claim an eligible achievement in Ongoing." : "No ongoing achievements right now."}</p>}
        {tab === "collected" && <LegacyAwards awards={data.legacy_awards} />}
      </>}
    </div>
    <details className="achievement-rules"><summary>How to earn achievements</summary><dl>{achievementCatalog.map((achievement) => <div key={achievement.key}><dt>{achievement.name}</dt><dd>{achievement.rule}</dd></div>)}</dl></details>
  </section>;
}
