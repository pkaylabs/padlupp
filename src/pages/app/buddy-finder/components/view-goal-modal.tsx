// src/components/goals/modals/ViewGoalModal.tsx
import React from "react";
import { Calendar, Circle, Briefcase, Sparkles } from "lucide-react";
import Button from "@/components/core/buttons";
import { Modal } from "@/components/core/modal";
import { BuddyInvitation } from "../api";
import { useAcceptInvitation, useRejectInvitation } from "../hooks/useBuddies";

interface ViewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: BuddyInvitation | null; // Real data for API ID
}

const GoalTag: React.FC<{ tag: { label: string; type: string } }> = ({ tag }) => {
  const Icon =
    tag.type === "inProgress"
      ? Briefcase
      : tag.type === "regular"
        ? Sparkles
        : Circle;
  const colors =
    tag.type === "inProgress"
      ? "bg-pink-100 text-pink-700"
      : tag.type === "regular"
        ? "bg-green-100 text-green-700"
        : "bg-blue-100 text-blue-700";

  return (
    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${colors}`}>
      <Icon size={14} />
      <span className="text-xs font-medium">{tag.label}</span>
    </div>
  );
};

export const ViewGoalModal: React.FC<ViewGoalModalProps> = ({
  isOpen,
  onClose,
  invitation,
}) => {
  const { mutate: accept, isPending: isAccepting } = useAcceptInvitation();
  const { mutate: reject, isPending: isRejecting } = useRejectInvitation();

  const isLoading = isAccepting || isRejecting;

  const handleAccept = () => {
    if (invitation) {
      accept(invitation.id, { onSuccess: onClose });
    }
  };

  const handleReject = () => {
    if (invitation) {
      reject(invitation.id, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="font-monts top-1/2 -translate-y-1/2 w-[calc(100%-1.5rem)] max-w-xl max-h-[90vh]"
    >
      <div className="p-4 sm:p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={invitation?.from_user.avatar || "/default-avatar.png"}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Invitation from {invitation?.from_user.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Sent{" "}
              {invitation
                ? new Date(invitation.created_at).toLocaleDateString()
                : ""}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto pr-1">
          <h4 className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Invitation note</h4>
          <p className="text-sm text-gray-600 dark:text-slate-300 mb-4 break-words">
            {invitation?.message?.trim() ||
              `${invitation?.from_user.name || "This user"} invited you to connect and work on goals together.`}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 mb-4">
            <Calendar size={16} />
            <span>
              {invitation
                ? new Date(invitation.created_at).toLocaleDateString()
                : "N/A"}
            </span>
          </div>

          {invitation?.goal_title && (
            <>
              <h4 className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Goal</h4>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Circle size={16} className="text-gray-400 dark:text-slate-500" />
                  <span className="text-sm text-gray-600 dark:text-slate-300 break-words">
                    {invitation.goal_title}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 mb-6">
            <GoalTag tag={{ label: "Invitation", type: "regular" }} />
            <GoalTag tag={{ label: "Connection", type: "inProgress" }} />
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4 mt-auto pt-2 bg-white dark:bg-slate-900">
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleReject}
            disabled={isLoading}
          >
            {isRejecting ? "Declining..." : "Decline"}
          </Button>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isAccepting ? "Accepting..." : "Accept"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
