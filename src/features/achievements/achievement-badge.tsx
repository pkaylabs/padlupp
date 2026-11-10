import { getAchievement, profileArtwork } from "./catalog";
import ellipse from "@/assets/achievements/profile/ellipse-outline.svg";
import "./achievements.css";

export function AchievementBadge({ achievementKey, variant = "catalog" }: {
  achievementKey: string;
  variant?: "catalog" | "profile";
}) {
  const achievement = getAchievement(achievementKey);
  if (!achievement) return null;
  const profile = variant === "profile" && achievementKey in profileArtwork
    ? profileArtwork[achievementKey as keyof typeof profileArtwork] : undefined;
  const ribbon = profile && <img className="achievement-profile-underlay" src={profile.ribbon.image} alt="" width={profile.ribbon.width} height={profile.ribbon.height} style={{ left: profile.ribbon.left, top: profile.ribbon.top }} />;

  if (profile) return <span className="achievement-badge achievement-badge-profile" role="img" aria-label={achievement.name} title={achievement.name}>
    {achievementKey === "no_ghosting" && ribbon}
    {achievementKey === "accountability_ace"
      ? <span className="achievement-profile-diamond" />
      : <><img className="achievement-profile-underlay" src={ellipse} alt="" width={31} height={32} style={{ left: 9, top: 8 }} /><img className="achievement-profile-underlay" src={ellipse} alt="" width={31} height={32} style={{ left: 9, top: 9 }} /></>}
    {achievementKey !== "no_ghosting" && ribbon}
    <span className="achievement-badge-clip" style={{ width: profile.width, height: profile.height, left: 24.5 - profile.width / 2, top: 25 - profile.height / 2 }}>
      <img className="achievement-badge-art" src={profile.image} alt="" style={profile.crop} />
    </span>
  </span>;

  return <span className={`achievement-badge achievement-badge-${variant}`} role="img" aria-label={achievement.name} title={achievement.name}>
    <span className="achievement-badge-clip">
      <img className="achievement-badge-art" src={achievement.image} alt="" style={achievement.crop} />
    </span>
  </span>;
}
