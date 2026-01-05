import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getGoals, GetGoalsParams } from "../api";

export function useGoals(params: GetGoalsParams) {
  return useQuery({
    // Unique Key: Re-fetches whenever page, search, or ordering changes
    queryKey: ["goals", params],

    queryFn: () => getGoals(params),

    // PRO TIP: This keeps the previous page data on screen while fetching the next page.
    // It prevents the "flash" of a loading spinner between page clicks.
    placeholderData: keepPreviousData,

    // Optional: Auto-refetch every minute if goals update frequently
    // refetchInterval: 60 * 1000,
  });
}
