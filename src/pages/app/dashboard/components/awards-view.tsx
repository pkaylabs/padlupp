// src/components/milestones/AwardsView.tsx
import React from "react";
import { motion } from "framer-motion";
import { AwardCategory } from "./award-category";
import { Badge } from "./badge";
import s1 from "@/assets/images/s1.png";
import s2 from "@/assets/images/s2.png";
import s3 from "@/assets/images/s3.png";
import s4 from "@/assets/images/s4.png";
import { useQuery } from "@tanstack/react-query";
import {
  getAwards,
  milestoneQueryKeys,
} from "../api/milestones";

const categoryImages: Record<string, string> = {
  goals: s1,
  streak: s2,
  referrals: s3,
  team_player: s4,
};

export const AwardsView: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: milestoneQueryKeys.awards,
    queryFn: getAwards,
    staleTime: 1000 * 60,
  });

  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-md space-y-4 mt-6 sm:mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {isLoading && (
        <div className="w-full space-y-4" aria-label="Loading awards">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-xl border border-gray-100 bg-white dark:border-slate-700 dark:bg-slate-900"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="w-full rounded-xl border border-red-200 bg-white p-6 text-center dark:border-red-900 dark:bg-slate-900">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            We couldn&apos;t load your awards.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 text-sm font-semibold text-primary-500 hover:text-primary-600"
          >
            Try again
          </button>
        </div>
      )}

      {data && (
        <div className="w-full rounded-xl bg-primary-50 px-4 py-3 text-center dark:bg-slate-800">
          <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
            {data.unlocked_count} of {data.total_count} awards unlocked
          </span>
        </div>
      )}

      {data?.categories.map((category) => (
        <AwardCategory key={category.key} title={category.title}>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {category.awards.map((award) => (
              <Badge
                key={award.key}
                label={award.title}
                description={award.description}
                imageUrl={categoryImages[category.key] ?? s1}
                unlocked={award.unlocked}
                unlockedAt={award.unlocked_at}
                current={award.current}
                target={award.target}
              />
            ))}
          </div>
        </AwardCategory>
      ))}
    </motion.div>
  );
};
