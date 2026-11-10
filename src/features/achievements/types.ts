export interface AchievementRequirement {
  key: string;
  label: string;
  current: number;
  target: number;
}

export interface AchievementProgress {
  key: string;
  name: string;
  description: string;
  current: number;
  target: number;
  eligible: boolean;
  earned_at: string | null;
  claimed_at: string | null;
  requirements: AchievementRequirement[];
}

export interface LegacyAward {
  key: string;
  name: string;
  unlocked_at?: string | null;
}

export interface AchievementsResponse {
  achievements: AchievementProgress[];
  legacy_awards?: LegacyAward[];
}

// Fail closed when an older person payload has no explicit claim timestamp.
export interface MemberAchievement {
  id?: number | string;
  key: string;
  name: string;
  legacy?: boolean;
  claimed_at?: string | null;
  unlocked_at?: string | null;
}
