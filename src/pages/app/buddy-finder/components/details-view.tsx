// src/components/goals/DetailsView.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommunityGoal, Person } from "@/constants/goals-data";
import { PeopleCardStack } from "./people-card-stack";
import { CommunityCardStack } from "./community-card-stack";

interface DetailsViewProps {
  activeTab: "People" | "Community";
  people: Person[];
  communityGoals: CommunityGoal[];
  onInvite: (person: Person | null) => void;
}

export const DetailsView: React.FC<DetailsViewProps> = ({
  activeTab,
  people,
  communityGoals,
  onInvite,
}) => {
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
