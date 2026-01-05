// src/components/goals/DetailsView.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommunityGoal, Person } from "@/constants/goals-data";
import { PeopleCardStack } from "./people-card-stack";
import { CommunityCardStack } from "./community-card-stack";
import { useBuddyFinder } from "../hooks/useBuddies";
import { SearchX } from "lucide-react";

interface DetailsViewProps {
  activeTab: "People" | "Community";
  communityGoals: CommunityGoal[];
  onInvite: (person: Person | null) => void;
}

export const DetailsView: React.FC<DetailsViewProps> = ({
  activeTab,
  communityGoals,
  onInvite,
}) => {
  // 1. Fetch real data from Finder API
  const { data: potentialBuddies, isLoading, isError } = useBuddyFinder();

  // 2. Map API data to UI 'Person' structure
  // The API returns 'PotentialBuddy', the UI expects 'Person'
  const people: any = (potentialBuddies || []).map((buddy) => ({
    id: buddy.user.id.toString(), // Ensure ID matches
    name: buddy.user.name,
    role: buddy.experience || "Member", // Fallback
    avatarUrl: buddy.user.avatar || "",
    sharedGoals: 0, // Not in API yet, defaulting
    tags: buddy.interests,
    status: buddy.connection_status === "connected" ? "connected" : "connect",
  }));

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500">Finding buddies...</div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load recommendations.
      </div>
    );
  }

  if (activeTab === "People" && people.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl"
      >
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <SearchX size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          No buddies found
        </h3>
        <p className="text-gray-500 max-w-xs mt-1">
          We couldn't find anyone matching your current interests. Try updating
          your profile or checking back later.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <AnimatePresence mode="wait">
        {activeTab === "People" ? (
          <PeopleCardStack key="people" people={people} onInvite={onInvite} />
        ) : (
          <CommunityCardStack
            key="community"
            goals={communityGoals}
            onInvite={onInvite}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
