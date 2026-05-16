import { useMemo, useState } from "react";
import { Calendar, User2, AlertCircle, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useGoalPreview, useJoinGoal } from "@/pages/app/goals/hooks/useShareGoal";
import { useAuthStore } from "@/features/auth/authStore";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/utils/cs";
import logo from "@/assets/images/logo.png";

interface GoalPreviewPageProps {
  goalId: string;
  sharedId?: string;
}

export const GoalPreviewPage = ({ goalId, sharedId }: GoalPreviewPageProps) => {
  const { data, isLoading, isError } = useGoalPreview(goalId);
  const { mutateAsync: joinGoal, isPending: isJoining } = useJoinGoal();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const [hasJoined, setHasJoined] = useState(false);

  const targetDateLabel = useMemo(() => {
    if (!data?.target_date) return "No target date";
    try {
      return format(parseISO(data.target_date), "MMM do, yyyy");
    } catch {
      return data.target_date;
    }
  }, [data?.target_date]);

  const startDateLabel = useMemo(() => {
    if (!data?.start_date) return "";
    try {
      return format(parseISO(data.start_date), "MMM do, yyyy");
    } catch {
      return data.start_date;
    }
  }, [data?.start_date]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      void navigate({
        to: "/signin",
        search: { redirect: `${window.location.pathname}${window.location.search}${window.location.hash}` },
      });
      return;
    }

    try {
      await joinGoal({ goalId, sharedId });
      setHasJoined(true);
    } catch {
      // error toast handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <div className="h-6 w-48 rounded bg-gray-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="h-4 w-full rounded bg-gray-100 dark:bg-slate-800 animate-pulse mb-2" />
          <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-slate-900 p-8 shadow-sm text-center">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={36} />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Goal not found
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            This goal may not exist or is not publicly available.
          </p>
        </div>
      </div>
    );
  }

  const categoryLabel = data.category || null;
  const statusLabel =
    data.status === "completed"
      ? "Completed"
      : data.status === "in-progress"
        ? "In progress"
        : "To-do";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-950 px-4 py-10">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Padlupp" className="h-8 w-auto opacity-80" />
        </div>

        <div className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 sm:p-9 shadow-lg">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 text-xs font-semibold">
              Goal preview
            </span>
            {categoryLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 text-xs font-semibold">
                {categoryLabel}
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                data.status === "completed"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : data.status === "in-progress"
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
              )}
            >
              {statusLabel}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            {data.title}
          </h1>

          {data.description && (
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-3 whitespace-pre-wrap">
              {data.description}
            </p>
          )}

          <div className="mt-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-5 space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-1.5 text-xs rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-gray-700 dark:text-slate-300">
                <User2 size={13} />
                {data.user?.name || "Creator"}
              </div>
              {startDateLabel && (
                <div className="inline-flex items-center gap-1.5 text-xs rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-gray-700 dark:text-slate-300">
                  <Calendar size={13} />
                  Start: {startDateLabel}
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 text-xs rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-gray-700 dark:text-slate-300">
                <Calendar size={13} />
                Target: {targetDateLabel}
              </div>
              {data.importance && (
                <div className="inline-flex items-center gap-1.5 text-xs rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-gray-700 dark:text-slate-300">
                  {data.importance}
                </div>
              )}
            </div>

            {(data.partner || data.partner_name) && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[11px] font-semibold">
                  {(data.partner?.name || data.partner_name || "P")[0]?.toUpperCase()}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Shared with{" "}
                  <span className="font-medium text-gray-700 dark:text-slate-200">
                    {data.partner?.name || data.partner_name || "a partner"}
                  </span>
                </p>
              </div>
            )}
          </div>

          {hasJoined ? (
            <div className="mt-7 inline-flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 size={16} />
              You have joined this goal!
            </div>
          ) : (
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => void handleJoin()}
                  disabled={isJoining}
                  className="px-5 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:opacity-90 disabled:opacity-60"
                >
                  {isJoining ? "Joining..." : "Join Goal"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleJoin()}
                  className="px-5 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:opacity-90"
                >
                  Sign in to Join Goal
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
