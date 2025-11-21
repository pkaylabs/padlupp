// src/components/milestones/AwardsView.tsx
import React from "react";
import { motion } from "framer-motion";
import { AwardCategory } from "./award-category";
import { Badge } from "./badge";
import s1 from "@/assets/images/s1.png";
import s2 from "@/assets/images/s2.png";
import s3 from "@/assets/images/s3.png";
import s4 from "@/assets/images/s4.png";

export const AwardsView: React.FC = () => {
  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-md space-y-4 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AwardCategory title="Goals">
        <div className="grid grid-cols-3 gap-4">
          <Badge label="Started a goal" imageUrl={s1} unlocked={true} />
          <Badge label="Completed a goal" imageUrl={s1} unlocked={true} />
          <Badge label="Completed 1/5" imageUrl={s1} unlocked={false} />
        </div>
      </AwardCategory>

      <AwardCategory title="Streak">
        <div className="grid grid-cols-3 gap-4">
          <Badge label="3-day streak" imageUrl={s2} unlocked={true} />
          <Badge label="7-day streak" imageUrl={s2} unlocked={true} />
          <Badge label="14-day streak" imageUrl={s2} unlocked={false} />
        </div>
      </AwardCategory>

      <AwardCategory title="Referrals">
        <div className="grid grid-cols-3 gap-4">
          <Badge label="Referral Badge" imageUrl={s3} unlocked={true} />
        </div>
      </AwardCategory>

      <AwardCategory title="Team Player">
        <div className="grid grid-cols-3 gap-4">
          <Badge label="Collaborated on goal" imageUrl={s4} unlocked={true} />
        </div>
      </AwardCategory>
    </motion.div>
  );
};
