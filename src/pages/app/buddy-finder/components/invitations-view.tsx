// src/components/goals/InvitationsView.tsx
import React from "react";
import { motion } from "framer-motion";
import { INVITATIONS_MOCK } from "@/constants/goals-data";

interface InvitationsViewProps {
  invitations: typeof INVITATIONS_MOCK;
  onViewGoal: () => void; // In real app, pass invitation/goal ID
}

export const InvitationsView: React.FC<InvitationsViewProps> = ({
  invitations,
  onViewGoal,
}) => {
  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {invitations.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center justify-between p-6 bg-white "
        >
          <div className="flex items-center gap-3">
            <img
              src={invite.avatarUrl}
              alt={invite.from}
              className="w-14 h-14 rounded-full"
            />
            <div>
              <p className="text-base text-gray-700">
                <span className="font-semibold">{invite.from}</span> has invited
                you to{" "}
                {invite.type === "goal"
                  ? "provide accountability on a goal."
                  : "view their profile."}
              </p>
              <button
                onClick={onViewGoal}
                className="text-base font-medium text-primary-500 hover:underline"
              >
                {invite.type === "goal" ? "view goal" : "view profile"}
              </button>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>{invite.date}</p>
            <p>{invite.timestamp}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
};
