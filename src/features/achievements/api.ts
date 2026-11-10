import { api } from "@/lib/api";
import { getAchievement, type AchievementKey } from "./catalog";
import type { AchievementProgress, AchievementsResponse } from "./types";
import type { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/authStore";

export const achievementQueryKey = ["achievements"] as const;

export interface AchievementSession { userId: number | null; sessionId: string | null; token: string | null }
export function achievementSession(auth: { user: { id: number } | null; sessionId: string | null; token: string | null }): AchievementSession {
  return { userId: auth.user?.id ?? null, sessionId: auth.sessionId, token: auth.token };
}
export function achievementQueryKeyFor(session: AchievementSession) {
  return [...achievementQueryKey, session.userId, session.sessionId] as const;
}
export function isCurrentAchievementSession(request: AchievementSession, current: AchievementSession) {
  return Boolean(request.token && request.userId !== null && request.token === current.token && request.sessionId === current.sessionId && request.userId === current.userId);
}

export async function getAchievements(signal?: AbortSignal): Promise<AchievementsResponse> {
  return (await api.get<AchievementsResponse>("/achievements/", { signal })).data;
}

export async function claimAchievement(key: AchievementKey): Promise<AchievementProgress> {
  if (!getAchievement(key)) throw new Error("Unknown achievement.");
  return (await api.post<AchievementProgress>(`/achievements/${key}/claim/`)).data;
}

export function claimErrorMessage(error: unknown): string {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 409) return "Not all requirements are met yet. Your progress has been refreshed.";
  if (status === 404) return "This achievement is no longer available. Please refresh and try again.";
  return "Couldn't claim this achievement. Please try again.";
}

export function updateClaimedAchievement(data: AchievementsResponse | undefined, achievement: AchievementProgress) {
  if (!data) return data;
  return { ...data, achievements: data.achievements.map((item) => item.key === achievement.key ? achievement : item) };
}

export function achievementClaimOptions(client: QueryClient, session: AchievementSession, onCollected: (achievement: AchievementProgress) => void) {
  const queryKey = achievementQueryKeyFor(session);
  const isCurrent = () => isCurrentAchievementSession(session, achievementSession(useAuthStore.getState()));
  return {
    mutationFn: (key: AchievementKey) => {
      if (!isCurrent()) throw new Error("Achievement session changed.");
      return claimAchievement(key);
    },
    retry: false,
    onSuccess: (achievement: AchievementProgress) => {
      if (!isCurrent()) return;
      client.setQueryData<AchievementsResponse>(queryKey, (data) => updateClaimedAchievement(data, achievement));
      onCollected(achievement);
      void client.invalidateQueries({ queryKey: ["community"] });
      void client.invalidateQueries({ queryKey: ["goal-members"] });
    },
    onSettled: () => { if (isCurrent()) void client.invalidateQueries({ queryKey }); },
  };
}
