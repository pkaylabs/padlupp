// src/components/goals/modals/ViewGoalModal.tsx
import React from "react";
import { Calendar, Circle, Briefcase, Sparkles } from "lucide-react";
import { GoalDetails } from "@/constants/goals-data";
import Button from "@/components/core/buttons";
import { Modal } from "@/components/core/modal";
import { BuddyInvitation } from "../api";
import { useAcceptInvitation, useRejectInvitation } from "../hooks/useBuddies";

interface ViewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalDetails: GoalDetails; // Visual data only
  invitation: BuddyInvitation | null; // Real data for API ID
}

const GoalTag: React.FC<{ tag: GoalDetails["tags"][0] }> = ({ tag }) => {
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
  goalDetails,
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
      className="font-monts top-1/2 -translate-y-1/2"
    >
      <div className="p-6 w-full max-w-xl">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={invitation?.from_user.avatar || "/default-avatar.png"}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Invitation from {invitation?.from_user.name}
            </h3>
            <p className="text-xs text-gray-500">
              Sent{" "}
              {invitation
                ? new Date(invitation.created_at).toLocaleDateString()
                : ""}
            </p>
          </div>
        </div>

        <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
        <p className="text-sm text-gray-600 mb-4">{goalDetails.description}</p>

        <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
          <Calendar size={16} />
          <span>{goalDetails.dateRange}</span>
        </div>

        <h4 className="font-semibold text-gray-800 mb-2">Subtasks</h4>
        <div className="space-y-2 mb-4">
          {goalDetails.subtasks.map((task, i) => (
            <div key={i} className="flex items-center gap-2">
              <Circle size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">{task.text}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          {goalDetails.tags.map((tag) => (
            <GoalTag key={tag.label} tag={tag} />
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleReject}
            disabled={isLoading}
          >
            {isRejecting ? "Rejecting..." : "Reject"}
          </Button>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isAccepting ? "Connecting..." : "Commit"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
