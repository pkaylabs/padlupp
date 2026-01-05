// src/pages/BuddyFinderPage.tsx
import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  User,
  Users,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useClickAway } from "react-use";
import { Breadcrumb } from "@/components/core/breadcrump";
import { SegmentedControl } from "@/components/system/segment-control";
import { CategoryGridView } from "./components/category-gridview";
import { DetailsView } from "./components/details-view";
import { InvitationsView } from "./components/invitations-view";
import { InviteModal } from "./components/invite-modal";
import { ViewGoalModal } from "./components/view-goal-modal";
import { cn } from "@/utils/cs";
import {
  CATEGORIES_MOCK,
  COMMUNITY_MOCK,
  GOAL_MOCK,
  type Person,
} from "@/constants/goals-data";
import { BuddyInvitation } from "./api";

type MainTab = "explore" | "invitations";
type ExploreView = "categories" | "details";
type DetailsTab = "People" | "Community";

export const BuddyFinderPage = () => {
  const [mainTab, setMainTab] = useState<MainTab>("explore");
  const [exploreView, setExploreView] = useState<ExploreView>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [detailsTab, setDetailsTab] = useState<DetailsTab>("People");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- Modal States ---
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [viewGoalModalOpen, setViewGoalModalOpen] = useState(false);

  // Data to pass to modals
  const [personToInvite, setPersonToInvite] = useState<Person | null>(null);
  const [selectedInvitation, setSelectedInvitation] =
    useState<BuddyInvitation | null>(null);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setExploreView("details");
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setExploreView("categories");
  };

  // Open Invite Modal (Explore Tab)
  const handleOpenInviteModal = (person: Person | null) => {
    setPersonToInvite(person);
    setInviteModalOpen(true);
  };

  // Open Goal Modal (Invitations Tab)
  const handleOpenViewGoalModal = (invitation: BuddyInvitation) => {
    setSelectedInvitation(invitation);
    setViewGoalModalOpen(true);
  };

  const handleDetailsTabChange = (tab: DetailsTab) => {
    setDetailsTab(tab);
    setIsFilterOpen(false);
  };

  const filterPopoverRef = useRef(null);
  useClickAway(filterPopoverRef, () => {
    setIsFilterOpen(false);
  });

  const breadcrumbPath = useMemo(() => {
    const path = ["Goals"];
    if (mainTab === "invitations") {
      path.push("Invitations");
    } else {
      if (selectedCategory) {
        path.push("Categories", selectedCategory);
      }
    }
    return path;
  }, [mainTab, selectedCategory]);

  return (
    <>
      <div className="font-monts w-full flex flex-col">
        <header className="sm:sticky sm:top-22 w-full flex items-center justify-between mb-6">
          <Breadcrumb path={breadcrumbPath} />
        </header>

        <main className="w-full sm:max-w-2xl mx-auto ">
          <SegmentedControl
            tabs={["Explore", "Invitations"]}
            activeTab={mainTab === "explore" ? "Explore" : "Invitations"}
            onTabChange={(tab) => setMainTab(tab.toLowerCase() as MainTab)}
            icons={[<User size={16} />, <Users size={16} />]}
            className="w-fit mx-auto"
          />

          {/* Search and Filters */}
          <div className="flex items-center gap-4 my-6 ">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-[#CDDAE9] focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="relative" ref={filterPopoverRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="shrink-0 p-3 bg-white rounded-xl border border-[#CDDAE9] hover:bg-gray-50"
              >
                <SlidersHorizontal size={20} className="text-gray-600" />
              </button>

              <AnimatePresence>
                {isFilterOpen &&
                  exploreView === "details" &&
                  mainTab === "explore" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-13 w-48 bg-white rounded-lg shadow border border-gray-100/50 py-4 pb-2 px-2 z-20"
                    >
                      <button
                        onClick={() => handleDetailsTabChange("People")}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 mb-1 text-sm rounded-md",
                          detailsTab === "People"
                            ? "font-semibold text-primary-500 bg-blue-50"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        People
                        {detailsTab === "People" && <Check size={16} />}
                      </button>
                      <button
                        onClick={() => handleDetailsTabChange("Community")}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                          detailsTab === "Community"
                            ? "font-semibold text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        Community
                        {detailsTab === "Community" && <Check size={16} />}
                      </button>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            <div className="mb-7">
              {exploreView === "details" && mainTab === "explore" && (
                <button
                  onClick={handleBackToCategories}
                  className="flex gap-1.5 items-center text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={20} />
                  Categories
                </button>
              )}
            </div>

            {mainTab === "explore" ? (
              exploreView === "categories" ? (
                <CategoryGridView
                  key="categories"
                  categories={CATEGORIES_MOCK}
                  onSelectCategory={handleSelectCategory}
                />
              ) : (
                <DetailsView
                  key="details"
                  activeTab={detailsTab}
                  // We don't pass static people mock anymore, the component fetches it
                  communityGoals={COMMUNITY_MOCK}
                  onInvite={handleOpenInviteModal}
                />
              )
            ) : (
              <InvitationsView
                key="invitations"
                onViewGoal={handleOpenViewGoalModal}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        person={personToInvite}
      />

      <ViewGoalModal
        isOpen={viewGoalModalOpen}
        onClose={() => setViewGoalModalOpen(false)}
        goalDetails={GOAL_MOCK}
        invitation={selectedInvitation}
      />
    </>
  );
};
