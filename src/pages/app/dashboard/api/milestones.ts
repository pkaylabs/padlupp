import { api } from "@/lib/api";

export interface StreakStatsResponse {
  current_streak_count: number;
  longest_streak_count: number;
}

export interface AwardProgress {
  key: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface AwardCategory {
  key: string;
  title: string;
  awards: AwardProgress[];
}

export interface AwardsResponse {
  unlocked_count: number;
  total_count: number;
  categories: AwardCategory[];
}

export const milestoneQueryKeys = {
  streak: ["milestones", "streak"] as const,
  awards: ["milestones", "awards"] as const,
};

export const getStreakStats = async (): Promise<StreakStatsResponse> => {
  const { data } = await api.get<StreakStatsResponse>(
    "/stats/longest-streak/",
  );
  return data;
};

export const getAwards = async (): Promise<AwardsResponse> => {
  const { data } = await api.get<AwardsResponse>("/awards/");
  return data;
};
