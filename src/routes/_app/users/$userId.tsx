import { useMemo, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Clock3, Target, UserRound } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useConnections, useBuddyFinder } from "@/pages/app/buddy-finder/hooks/useBuddies";
import { useGoals } from "@/pages/app/goals/hooks/useGoals";

type UserProfileSearch = {
  name?: string;
  avatar?: string;
};

export const Route = createFileRoute("/_app/users/$userId")({
  validateSearch: (search: Record<string, unknown>): UserProfileSearch => ({
    name: typeof search.name === "string" ? search.name : undefined,
    avatar: typeof search.avatar === "string" ? search.avatar : undefined,
  }),
  component: UserProfilePage,
});

function UserProfilePage() {
  const { userId } = Route.useParams();
  const search = Route.useSearch();
  const numericUserId = Number(userId);
  const hasValidUserId = Number.isFinite(numericUserId) && numericUserId > 0;

  const { data: connections = [] } = useConnections();
  const { data: finderProfiles = [] } = useBuddyFinder();
  const { data: goalsData } = useGoals({ ordering: "-updated_at" });

  const knownProfile = useMemo(() => {
    if (!hasValidUserId) return null;
    const allProfiles = [...connections, ...finderProfiles];
    return (
      allProfiles.find((item) => item.user?.id === numericUserId) ?? null
    );
  }, [connections, finderProfiles, hasValidUserId, numericUserId]);

  const relatedGoals = useMemo(() => {
    if (!hasValidUserId || !goalsData?.results) return [];
    return goalsData.results
      .filter((goal) => goal.user?.id === numericUserId)
      .slice(0, 6);
  }, [goalsData?.results, hasValidUserId, numericUserId]);

  const displayName =
    knownProfile?.user?.name?.trim() ||
    search.name?.trim() ||
    "Unknown user";
  const displayAvatar =
    knownProfile?.user?.avatar?.trim() || search.avatar?.trim() || "";
  const bio = knownProfile?.bio?.trim() || "";
  const location = knownProfile?.location?.trim() || "";
  const timeZone = knownProfile?.time_zone?.trim() || "";
  const experience = knownProfile?.experience?.trim() || "";
  const interests = Array.isArray(knownProfile?.interests)
    ? knownProfile.interests.filter(Boolean)
    : [];

  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "U",
    [displayName],
  );

  if (!hasValidUserId) {
    return (
      <div className="min-h-screen p-6 sm:p-8">
        <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Profile unavailable
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            We couldn&apos;t identify this user profile.
          </p>
          <Link
            to="/goals"
            className="inline-flex mt-5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to goals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 min-w-0">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-gray-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xl font-semibold">
                  {initials}
                </div>
              )}

              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100 truncate">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  {experience || "Padlupp member"}
                </p>
              </div>
            </div>

            <Link
              to="/goals"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to goals
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <InfoTile
              icon={<MapPin size={16} />}
              label="Location"
              value={location || "Not provided"}
            />
            <InfoTile
              icon={<Clock3 size={16} />}
              label="Time Zone"
              value={timeZone || "Not provided"}
            />
            <InfoTile
              icon={<UserRound size={16} />}
              label="Profile"
              value={knownProfile ? "Connected network profile" : "Basic profile"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              About
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
              {bio || "No profile bio has been shared yet."}
            </p>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Interests
            </h3>
            {interests.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-slate-200 border border-blue-100 dark:border-slate-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                No interests listed yet.
              </p>
            )}
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Target size={18} />
              Recent Goals
            </h2>
            {relatedGoals.length > 0 ? (
              <div className="mt-3 space-y-3">
                {relatedGoals.map((goal) => (
                  <Link
                    key={goal.id}
                    to="/goals/$id"
                    params={{ id: String(goal.id) }}
                    className="block rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                      {goal.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {goal.target_date
                        ? format(parseISO(goal.target_date), "MMM d, yyyy")
                        : "No target date"}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                No recent goals available to display.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}
