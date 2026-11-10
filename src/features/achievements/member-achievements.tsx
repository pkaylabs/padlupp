import { AchievementBadge } from "./achievement-badge";
import { partitionMemberAchievements } from "./catalog";
import chevron from "@/assets/achievements/profile/chevron.svg";
import type { MemberAchievement, LegacyAward } from "./types";

export function LegacyAwards({ awards }: { awards?: LegacyAward[] }) {
  if (!awards?.length) return null;
  return <details className="achievement-legacy"><summary>Legacy awards ({awards.length})</summary>
    <p>Previously earned awards are preserved in your history.</p>
    <ul>{awards.map((award, index) => <li key={`${award.key}-${index}`}>{award.name}{award.unlocked_at && <time dateTime={award.unlocked_at}> | {new Date(award.unlocked_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</time>}</li>)}</ul>
  </details>;
}

export function MemberAchievements({ achievements }: { achievements?: MemberAchievement[] }) {
  const { collected, legacy } = partitionMemberAchievements(achievements);
  return <section className="co-achievements">
    <h3 className="achievement-profile-heading">Achievements<img src={chevron} alt="" width={12} height={12} /></h3>
    {collected.length ? <ul className="achievement-profile-list" aria-label="Collected achievements">{collected.map((achievement) =>
      <li key={achievement.key}><AchievementBadge achievementKey={achievement.key} variant="profile" /></li>,
    )}</ul> : <p className="co-muted">No collected achievements to show.</p>}
    <LegacyAwards awards={legacy} />
  </section>;
}
