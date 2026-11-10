import podCreator from "@/assets/achievements/pod-creator.png";
import podMagnet from "@/assets/achievements/pod-magnet.png";
import proofInThePudding from "@/assets/achievements/proof-in-the-pudding.png";
import noGhosting from "@/assets/achievements/no-ghosting.png";
import accountabilityAce from "@/assets/achievements/accountability-ace.png";
import hypePaddie from "@/assets/achievements/hype-paddie.png";
import comebackKid from "@/assets/achievements/comeback-kid.png";
import milestoneHunter from "@/assets/achievements/milestone-hunter.png";
import modelPaddie from "@/assets/achievements/model-paddie.png";
import profileNoGhosting from "@/assets/achievements/profile/no-ghosting.png";
import profileAccountabilityAce from "@/assets/achievements/profile/accountability-ace.png";
import magnetRibbon from "@/assets/achievements/profile/pod-magnet-ribbon.svg";
import ghostRibbon from "@/assets/achievements/profile/no-ghosting-ribbon.svg";
import aceRibbon from "@/assets/achievements/profile/accountability-ace-ribbon.svg";
import type { AchievementsResponse, MemberAchievement } from "./types";

const standardCrop = { width: "100%", height: "185.14%", left: "1.78%", top: "-42.57%" };
const smallProfileCrop = { width: "116.98%", height: "217.27%", left: "-7.92%", top: "-59.37%" };

// Geometry is relative to the Figma clip frame, not the transparent PNG bounds.
export const achievementCatalog = [
  {
    key: "pod_creator", name: "Pod Creator", image: podCreator, crop: standardCrop, target: 10,
    description: "Consistently create Paddie Pod tasks that other users join.",
    rule: "Create 10 Paddie Pod tasks that other users join.",
  },
  {
    key: "pod_magnet", name: "Pod Magnet", image: podMagnet, crop: standardCrop, target: 3,
    description: "Create 3 tasks with \u226575% capacity filled.",
    rule: "Create 3 tasks that each reach at least 75% of their member capacity.",
  },
  {
    key: "proof_in_the_pudding", name: "Proof in the Pudding", image: proofInThePudding, crop: standardCrop, target: 10,
    description: "Complete 10 successfully submitted evidence-backed check-ins in the community.",
    rule: "Submit 10 evidence-backed check-ins in the community.",
  },
  {
    key: "no_ghosting", name: "No Ghosting", image: noGhosting, crop: standardCrop, target: 3,
    description: "Completing 3 pods without voluntarily disappearing or becoming inactive.",
    rule: "Complete 3 pods without voluntarily leaving or becoming inactive for 28 days.",
  },
  {
    key: "accountability_ace", name: "Accountability Ace", image: accountabilityAce, crop: standardCrop, target: 10,
    description: "Confirm 10 check-ins from other Paddies, across at least 2 pods in the community.",
    rule: "Confirm 10 other Paddies' check-ins across at least 2 pods.",
  },
  {
    key: "hype_paddie", name: "Hype Paddie", image: hypePaddie, crop: standardCrop, target: 20,
    description: "Make 20 positive interactions involving at least 5 different community members.",
    rule: "Give 20 positive message reactions or thumbs-up check-in confirmations involving at least 5 other users. Each subject counts once.",
  },
  {
    key: "comeback_kid", name: "Comeback Kid", image: comebackKid, crop: standardCrop, target: 3,
    description: "Complete 3 consecutive on-time submitted check-ins after a missed check-in.",
    rule: "After a missed check-in, submit 3 consecutive on-time check-ins within the same pod.",
  },
  {
    key: "milestone_hunter", name: "Milestone Hunter", image: milestoneHunter, target: 10,
    crop: { width: "100%", height: "185.14%", left: "-0.54%", top: "-38.73%" },
    description: "Completed 10 milestones, across at least 3 separate tasks.",
    rule: "Personally complete 10 milestones across at least 3 tasks. Credit goes to the actual completer.",
  },
  {
    key: "model_paddie", name: "Model Paddie", image: modelPaddie, target: 10,
    crop: { width: "95.6%", height: "177%", left: "3.97%", top: "-38.5%" },
    description: "All-round accountability behaviour within a community.",
    rule: "Complete 10 tasks on time, with all required check-ins submitted on time.",
  },
] as const;

export type AchievementKey = typeof achievementCatalog[number]["key"];
export function getAchievement(key: string) {
  return achievementCatalog.find((achievement) => achievement.key === key);
}

export function isClaimed(achievement: { claimed_at?: string | null }) {
  return typeof achievement.claimed_at === "string" && Number.isFinite(Date.parse(achievement.claimed_at));
}

export type AchievementTab = "ongoing" | "collected";
export function achievementsForTab(data: AchievementsResponse, tab: AchievementTab) {
  return achievementCatalog.flatMap((definition) => {
    const item = data.achievements.find((achievement) => achievement.key === definition.key);
    return item && isClaimed(item) === (tab === "collected") ? [item] : [];
  });
}

export function partitionMemberAchievements(achievements: MemberAchievement[] = []) {
  return {
    collected: achievements.filter((item) => !item.legacy && getAchievement(item.key) && isClaimed(item)),
    legacy: achievements.filter((item) => item.legacy || !getAchievement(item.key)),
  };
}

export const profileArtwork = {
  pod_magnet: {
    image: podMagnet, crop: smallProfileCrop, width: 33, height: 32,
    ribbon: { image: magnetRibbon, left: 7.374, top: 29.5, width: 34.756, height: 10.5 },
  },
  no_ghosting: {
    image: profileNoGhosting, crop: smallProfileCrop, width: 33, height: 32,
    ribbon: { image: ghostRibbon, left: 8.074, top: 34, width: 33.38, height: 7.71586 },
  },
  accountability_ace: {
    image: profileAccountabilityAce, width: 35, height: 34,
    crop: { width: "109.06%", height: "202.56%", left: "-4.09%", top: "-47.86%" },
    ribbon: { image: aceRibbon, left: 8.3065, top: 34, width: 33.4603, height: 6.11912 },
  },
} as const;
