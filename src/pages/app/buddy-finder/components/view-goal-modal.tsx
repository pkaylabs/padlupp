// src/components/goals/modals/ViewGoalModal.tsx
import React from "react";
import {
  Calendar,
  CheckCircle,
  Circle,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { GoalDetails } from "@/constants/goals-data";
import Button from "@/components/core/buttons";
import { Modal } from "@/components/core/modal";

interface ViewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: GoalDetails;
}

// A simple tag component for the modal
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
  goal,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="font-monts top-1/2 -translate-y-1/2"
    >
      <div className="p-6 w-full max-w-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Description
        </h3>
        <p className="text-sm text-gray-600 mb-4">{goal.description}</p>

        <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
          <Calendar size={16} />
          <span>{goal.dateRange}</span>
        </div>

        <h4 className="font-semibold text-gray-800 mb-2">Subtasks</h4>
        <div className="space-y-2 mb-4">
          {goal.subtasks.map((task, i) => (
            <div key={i} className="flex items-center gap-2">
              <Circle size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">{task.text}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          {goal.tags.map((tag) => (
            <GoalTag key={tag.label} tag={tag} />
          ))}
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Reject
          </Button>
          <Button variant="primary" className="w-full" onClick={onClose}>
            Commit
          </Button>
        </div>
      </div>
    </Modal>
  );
};
