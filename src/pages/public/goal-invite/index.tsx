import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Calendar, User2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useGoalInvitePreview, useRespondGoalInvite } from "@/pages/app/goals/hooks/useShareGoal";

interface GoalInvitePageProps {
  token: string;
}

export const GoalInvitePage = ({ token }: GoalInvitePageProps) => {
  const { data, isLoading, isError, refetch } = useGoalInvitePreview(token);
  const { mutateAsync: respondInvite, isPending } = useRespondGoalInvite();
  const [resolvedAction, setResolvedAction] = useState<"accept" | "decline" | null>(null);

  const targetDateLabel = useMemo(() => {
    if (!data?.goal?.target_date) return "No target date";
    try {
      return format(parseISO(data.goal.target_date), "MMM do, yyyy");
    } catch {
      return data.goal.target_date;
    }
  }, [data?.goal?.target_date]);

  const handleRespond = async (action: "accept" | "decline") => {
    await respondInvite({ token, action });
    setResolvedAction(action);
    void refetch();
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
          <XCircle className="mx-auto text-red-500 mb-3" size={36} />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Invite not available
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            This invite link may be invalid, expired, or already used.
          </p>
        </div>
      </div>
    );
  }

  const inviteStatus = data.status || "pending";
  const canRespond = inviteStatus === "pending" && !resolvedAction;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-950 px-4 py-10">
      <div className="w-full max-w-2xl mx-auto rounded-2xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 sm:p-9 shadow-lg">
        <p className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 text-xs font-semibold">
          Goal invite
        </p>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-4">
          Join this shared goal
        </h1>

        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
          {data.inviter?.name || "Someone"} invited you to collaborate.
        </p>

        <div className="mt-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-5 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            {data.goal.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            {data.goal.description || "No description provided."}
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <div className="inline-flex items-center gap-1.5 text-xs rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-gray-700 dark:text-slate-300">
              <User2 size={13} />
              {data.inviter?.name || "Inviter"}
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-gray-700 dark:text-slate-300">
              <Calendar size={13} />
              Target: {targetDateLabel}
            </div>
            {data.goal.category ? (
              <div className="inline-flex items-center gap-1.5 text-xs rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-gray-700 dark:text-slate-300">
                {data.goal.category}
              </div>
            ) : null}
          </div>
        </div>

        {data.message ? (
          <div className="mt-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/20 p-4">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Message from inviter
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              {data.message}
            </p>
          </div>
        ) : null}

        {inviteStatus !== "pending" || resolvedAction ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={16} />
            Invite status: {resolvedAction || inviteStatus}
          </div>
        ) : null}

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => void handleRespond("decline")}
            disabled={!canRespond || isPending}
            className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-60"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => void handleRespond("accept")}
            disabled={!canRespond || isPending}
            className="px-4 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "Please wait..." : "Accept invite"}
          </button>
        </div>
      </div>
    </div>
  );
};
