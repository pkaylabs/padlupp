import { Link } from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { ArrowUpRight, Check, Clock3, MapPin, UserPlus } from "lucide-react";
import type { PotentialBuddy } from "../api";
import { UserAvatar } from "./user-avatar";

interface PeopleGridProps {
  people: PotentialBuddy[];
  onConnect: (person: PotentialBuddy) => void;
  onReviewInvitation: () => void;
}

export function PeopleGrid({
  people,
  onConnect,
  onReviewInvitation,
}: PeopleGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="People on Padlupp"
    >
      {people.map((person) => {
        const name = person.user.name?.trim() || "Padlupp member";
        const interests = Array.isArray(person.interests)
          ? person.interests.filter(Boolean)
          : [];
        const activity = person.last_active_at
          ? new Date(person.last_active_at)
          : null;
        const validActivity =
          activity && !Number.isNaN(activity.getTime()) ? activity : null;
        const connected = person.connection_status === "connected";
        const pending = person.connection_status === "pending";
        const incoming = pending && person.pending_direction === "incoming";

        return (
          <article
            key={person.user.id}
            className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-16 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-800/50" />
            <div className="flex flex-1 flex-col px-5 pb-5">
              <div className="-mt-9 mb-4 w-fit rounded-full bg-white p-1.5 dark:bg-slate-900">
                <UserAvatar
                  src={person.user.avatar}
                  name={name}
                  className="h-16 w-16"
                  textClassName="text-xl"
                />
              </div>
              <Link
                to="/users/$userId"
                params={{ userId: String(person.user.id) }}
                search={{ name, avatar: person.user.avatar || undefined }}
                className="w-fit max-w-full break-words text-base font-semibold text-slate-900 hover:text-blue-600 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 dark:text-slate-100 dark:hover:text-blue-400"
              >
                {name}
              </Link>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock3 size={13} aria-hidden="true" className="shrink-0" />
                {validActivity ? (
                  <time
                    dateTime={validActivity.toISOString()}
                    title={validActivity.toLocaleString()}
                  >
                    Active{" "}
                    {formatDistanceToNowStrict(validActivity, {
                      addSuffix: true,
                    })}
                  </time>
                ) : (
                    <span>No activity recorded</span>
                )}
              </div>
              {person.location?.trim() && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin size={13} aria-hidden="true" className="shrink-0" />
                  <span className="truncate">{person.location}</span>
                </p>
              )}
              <p className="mt-4 min-h-[4.5rem] line-clamp-3 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                {person.bio?.trim() || "This member hasn't added a bio yet."}
              </p>
              <div className="mb-5 mt-4 flex min-h-7 flex-wrap items-start gap-1.5">
                {interests.slice(0, 3).map((interest) => (
                  <span
                    key={interest}
                    className="max-w-full truncate rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                  >
                    {interest}
                  </span>
                ))}
                {interests.length > 3 && (
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    +{interests.length - 3}
                  </span>
                )}
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Link
                  to="/users/$userId"
                  params={{ userId: String(person.user.id) }}
                  search={{ name, avatar: person.user.avatar || undefined }}
                  aria-label={`View ${name}'s profile`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  View profile
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  disabled={connected || (pending && !incoming)}
                  onClick={() =>
                    incoming ? onReviewInvitation() : onConnect(person)
                  }
                  aria-label={
                    connected
                      ? `Connected with ${name}`
                      : incoming
                        ? `Review ${name}'s invitation`
                        : pending
                          ? `Request sent to ${name}`
                          : `Connect with ${name}`
                  }
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
                >
                  {connected ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    !pending && <UserPlus size={14} aria-hidden="true" />
                  )}
                  {connected
                    ? "Connected"
                    : incoming
                      ? "Review invite"
                      : pending
                        ? "Request sent"
                        : "Connect"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
