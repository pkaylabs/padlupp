// src/components/goals/InvitationsView.tsx
import React from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { BuddyInvitation } from "../api";
import { useInvitations } from "../hooks/useBuddies";
import { Inbox } from "lucide-react";

interface InvitationsViewProps {
  onViewGoal: (invitation: BuddyInvitation) => void;
}

export const InvitationsView: React.FC<InvitationsViewProps> = ({
  onViewGoal,
}) => {
  const { data: invitations, isLoading, isError } = useInvitations();

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-400">
        Loading invitations...
      </div>
    );
  if (isError)
    return (
      <div className="p-8 text-center text-red-400">
        Error loading invitations
      </div>
    );

  if (!invitations || invitations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-gray-100"
      >
        <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-blue-100">
          <Inbox size={32} className="text-gray-400" />
        </div>
        <h3 className="text-gray-900 font-medium text-lg">
          No pending invitations
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          When someone invites you to connect, it will show up here.
        </p>
      </motion.div>
    );
  }

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
          className="flex items-center justify-between p-4 sm:p-6 bg-white rounded-xl border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <img
              src={invite.from_user.avatar || "/default-avatar.png"}
              alt={invite.from_user.name}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="text-base text-gray-700">
                <span className="font-semibold">{invite.from_user.name}</span>{" "}
                has invited you to connect.
              </p>
              <button
                onClick={() => onViewGoal(invite)}
                className="text-base font-medium text-primary-500 hover:underline"
              >
                view details
              </button>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>{new Date(invite.created_at).toLocaleDateString()}</p>
            <p className="text-xs">
              {formatDistanceToNow(new Date(invite.created_at))} ago
            </p>
          </div>
        </div>
      ))}
    </motion.div>
  );
};
