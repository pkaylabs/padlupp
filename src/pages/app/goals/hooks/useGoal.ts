import { useQuery } from "@tanstack/react-query";
import { getGoal } from "../api";

export function useGoal(id: string | undefined) {
  return useQuery({
    queryKey: ["goal", id],
    queryFn: () => getGoal(id!),

    enabled: !!id,

    staleTime: 1000 * 60 * 5,
  });
}
