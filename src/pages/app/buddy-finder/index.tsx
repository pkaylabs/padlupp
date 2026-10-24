import { useEffect, useRef, useState } from "react";
import {
  Clock3,
  Mail,
  Search,
  SearchX,
  SlidersHorizontal,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useClickAway } from "react-use";
import { Breadcrumb } from "@/components/core/breadcrump";
import { SegmentedControl } from "@/components/system/segment-control";
import { CORE_CATEGORIES } from "@/constants/categories";
import { InvitationsView } from "./components/invitations-view";
import { InviteModal } from "./components/invite-modal";
import { ViewGoalModal } from "./components/view-goal-modal";
import { PlatformInviteModal } from "./components/platform-invite-modal";
import { PeopleGrid } from "./components/people-grid";
import { useBuddyDirectory } from "./hooks/useBuddies";
import type { BuddyInvitation, PotentialBuddy } from "./api";

type MainTab = "explore" | "invitations";

export function BuddyFinderPage() {
  const [mainTab, setMainTab] = useState<MainTab>("explore");
  const [category, setCategory] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [personToInvite, setPersonToInvite] = useState<PotentialBuddy | null>(
    null,
  );
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<BuddyInvitation | null>(null);
  const [platformInviteOpen, setPlatformInviteOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  useClickAway(filterRef, () => setIsFilterOpen(false));

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(searchQuery.trim()),
      280,
    );
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isFilterOpen) categoryRef.current?.focus();
  }, [isFilterOpen]);

  const directory = useBuddyDirectory(debouncedSearch, category);
  const uniquePeople = new Map<number, PotentialBuddy>();
  for (const page of directory.data?.pages || []) {
    for (const person of page.results) {
      if (!uniquePeople.has(person.user.id))
        uniquePeople.set(person.user.id, person);
    }
  }
  const people = [...uniquePeople.values()];
  const count = directory.data?.pages[0]?.count;
  const hasFilters = Boolean(category || searchQuery);
  const clearFilters = () => {
    setCategory("");
    setSearchQuery("");
  };

  return (
    <div className="w-full font-monts text-gray-900 dark:text-slate-100">
      <header className="mb-6">
        <Breadcrumb
          path={[
            "Buddy Finder",
            ...(mainTab === "invitations" ? ["Invitations"] : []),
          ]}
        />
      </header>
      <main className="mx-auto w-full max-w-6xl pb-10">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Find your people
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Meet buddies across Padlupp and make progress together.
            </p>
          </div>
          <SegmentedControl
            tabs={["Explore", "Invitations"]}
            activeTab={mainTab === "explore" ? "Explore" : "Invitations"}
            onTabChange={(tab) => {
              setMainTab(tab.toLowerCase() as MainTab);
              setIsFilterOpen(false);
            }}
            icons={[<Users size={16} />, <Mail size={16} />]}
            className="w-fit"
          />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
          {mainTab === "explore" && (
            <div className="relative min-w-0 basis-full sm:min-w-48 sm:basis-auto sm:flex-1">
              <Search
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                aria-label="Search people"
                placeholder="Search people by name"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-950"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => setPlatformInviteOpen(true)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <UserPlus size={17} aria-hidden="true" />
            Invite
          </button>
          {mainTab === "explore" && (
            <div
              className="relative"
              ref={filterRef}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsFilterOpen(false);
                  filterButtonRef.current?.focus();
                }
              }}
            >
              <button
                type="button"
                ref={filterButtonRef}
                aria-expanded={isFilterOpen}
                aria-controls="buddy-category-filters"
                onClick={() => setIsFilterOpen((open) => !open)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <SlidersHorizontal size={17} aria-hidden="true" />
                Filters
                {category && (
                  <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    1
                  </span>
                )}
              </button>
              {isFilterOpen && (
                <div
                  id="buddy-category-filters"
                  className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                >
                  <label
                    htmlFor="buddy-category"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Goal category
                  </label>
                  <select
                    id="buddy-category"
                    ref={categoryRef}
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="">All categories</option>
                    {CORE_CATEGORIES.map((item) => (
                      <option key={item.label} value={item.label}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Find people with public goals in this category.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("");
                      setIsFilterOpen(false);
                      filterButtonRef.current?.focus();
                    }}
                    className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400"
                  >
                    Clear category
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {mainTab === "invitations" ? (
          <InvitationsView
            onViewGoal={(invitation) => setSelectedInvitation(invitation)}
          />
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex flex-wrap items-center gap-3">
                <span aria-live="polite">
                  {count === undefined
                    ? "People on Padlupp"
                    : count + (count === 1 ? " person" : " people")}
                </span>
                {category && (
                  <button
                    type="button"
                    onClick={() => setCategory("")}
                    aria-label={"Remove " + category + " filter"}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  >
                    {category}
                    <X size={12} aria-hidden="true" />
                  </button>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} aria-hidden="true" />
                Most recently active
              </span>
            </div>
            {directory.isPending ? (
              <div
                role="status"
                aria-label="Loading people"
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                  />
                ))}
              </div>
            ) : directory.isError ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-100 bg-white p-10 text-center dark:border-red-950 dark:bg-slate-900"
              >
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  We couldn't load people. Please try again.
                </p>
                <button
                  type="button"
                  onClick={() => void directory.refetch()}
                  className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400"
                >
                  Try again
                </button>
              </div>
            ) : people.length ? (
              <>
                <PeopleGrid
                  people={people}
                  onConnect={(person) => {
                    setPersonToInvite(person);
                    setInviteModalOpen(true);
                  }}
                  onReviewInvitation={() => setMainTab("invitations")}
                />
                {directory.hasNextPage && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      disabled={directory.isFetchingNextPage}
                      onClick={() => void directory.fetchNextPage()}
                      className="min-h-11 rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                      {directory.isFetchingNextPage
                        ? "Loading more people..."
                        : "Load more people"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                <SearchX
                  size={32}
                  aria-hidden="true"
                  className="mb-4 text-slate-400"
                />
                <h2 className="text-base font-semibold">
                  {hasFilters
                    ? "No people match these filters"
                    : "You're early!"}
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {hasFilters
                  ? "Try a different name or category to find your next buddy."
                    : "Invite someone to join Padlupp and start making progress together."}
                </p>
                <button
                  type="button"
                  onClick={
                    hasFilters
                      ? clearFilters
                      : () => setPlatformInviteOpen(true)
                  }
                  className="mt-5 text-sm font-semibold text-blue-600 dark:text-blue-400"
                >
                  {hasFilters ? "Clear filters" : "Invite a friend"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <InviteModal
        key={personToInvite?.user.id}
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        person={
          personToInvite
            ? {
                id: String(personToInvite.user.id),
                name: personToInvite.user.name,
              }
            : null
        }
      />
      <ViewGoalModal
        isOpen={Boolean(selectedInvitation)}
        onClose={() => setSelectedInvitation(null)}
        invitation={selectedInvitation}
      />
      <PlatformInviteModal
        isOpen={platformInviteOpen}
        onClose={() => setPlatformInviteOpen(false)}
      />
    </div>
  );
}
