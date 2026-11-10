import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AchievementCatalog } from "@/features/achievements/achievement-catalog";
import { achievementClaimOptions, achievementQueryKeyFor, achievementSession, claimErrorMessage, getAchievements, isCurrentAchievementSession, type AchievementSession } from "@/features/achievements/api";
import { getAchievement } from "@/features/achievements/catalog";
import { useAuthStore } from "@/features/auth/authStore";

export function AwardsView() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const sessionId = useAuthStore((state) => state.sessionId);
  const token = useAuthStore((state) => state.token);
  return <SessionAwardsView key={`${userId}:${sessionId}`} session={{ userId, sessionId, token }} />;
}

export function SessionAwardsView({ session }: { session: AchievementSession }) {
  const client = useQueryClient();
  const [announcement, setAnnouncement] = useState("");
  const queryKey = achievementQueryKeyFor(session);
  const isCurrentSession = () => isCurrentAchievementSession(session, achievementSession(useAuthStore.getState()));
  const query = useQuery({ queryKey, queryFn: async ({ signal }) => {
    const data = await getAchievements(signal);
    if (!isCurrentSession()) throw new Error("Achievement session changed.");
    return data;
  }, enabled: Boolean(session.token && session.userId !== null), staleTime: 60_000 });
  const claim = useMutation(achievementClaimOptions(client, session, (achievement) => {
    setAnnouncement(`${getAchievement(achievement.key)?.name ?? achievement.name} collected. View it in Collected.`);
  }));

  return <AchievementCatalog data={query.data} loading={query.isPending} error={query.isError} onRetry={() => void query.refetch()}
    onClaim={(key) => { if (!claim.isPending) { setAnnouncement(""); claim.mutate(key); } }}
    claimingKey={claim.isPending ? claim.variables : null}
    claimFailure={claim.isError ? { key: claim.variables, message: claimErrorMessage(claim.error) } : null}
    announcement={announcement} />;
}
