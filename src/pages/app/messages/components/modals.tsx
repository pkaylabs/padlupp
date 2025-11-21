// src/components/chat/ChatModals.tsx
import React, { useState } from "react";
import { Star, Calendar } from "lucide-react";
import { Modal } from "@/components/core/modal";
import Button from "@/components/core/buttons";

// --- 1. Create Goal Modal ---
export const CreateGoalModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="max-w-lg w-full p-6 top-1/2 -translate-y-1/2 "
    >
      <h2 className="text-xl font-semibold mb-6 text-center">Create goal</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title..."
          className="w-full text-lg font-medium border-none focus:ring-0 p-0 placeholder:text-gray-800"
        />
        <input
          type="text"
          placeholder="Description"
          className="w-full text-sm border-none focus:ring-0 p-0 text-gray-600"
        />

        <button className="flex items-center text-gray-500 hover:text-gray-700 text-sm gap-2">
          <Calendar size={16} /> Add dates
        </button>

        <button className="flex items-center text-gray-500 hover:text-gray-700 text-sm gap-2">
          + Add subtask
        </button>

        <div className="flex gap-2 pt-2">
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            ◎ Status
          </span>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            ☆ Priority
          </span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            ≔ Category
          </span>
        </div>

        <Button variant="primary" className="w-full mt-4" onClick={onClose}>
          Create
        </Button>
      </div>
    </Modal>
  );
};

// --- 2. Rate User Modal ---
export const RateUserModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const options = [
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur.",
  ];
  const [selectedOption, setSelectedOption] = useState(0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="max-w-md w-full p-6 top-1/2 -translate-y-1/2"
    >
      <h2 className="text-lg font-semibold mb-2 text-center">Rate XY</h2>
      <p className="text-xs text-gray-500 text-center mb-6 px-4">
        Lorem ipsum dolor sit amet consectetur. Purus convallis volutpat mollis
        vitae dolor.
      </p>

      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={28}
            className={`cursor-pointer ${star <= rating ? "fill-gray-300 text-gray-300" : "text-gray-200"}`} // Visual style based on screenshot
            onClick={() => setRating(star)}
          />
        ))}
      </div>

      <div className="space-y-3 mb-4">
        {options.map((opt, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
            onClick={() => setSelectedOption(idx)}
          >
            <span className="text-sm text-gray-600">{opt}</span>
            <div
              className={`w-4 h-4 rounded-full border ${selectedOption === idx ? "border-4 border-orange-400" : "border-gray-300"}`}
            />
          </div>
        ))}
      </div>

      <textarea
        placeholder="Add note"
        className="w-full h-24 bg-gray-50 border-none rounded-lg p-3 text-sm resize-none mb-4"
      />

      <Button variant="primary" className="w-full" onClick={onClose}>
        Submit
      </Button>
    </Modal>
  );
};

// --- 3. Report User Modal ---
export const ReportUserModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [selectedOption, setSelectedOption] = useState(0);
  const options = [
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur.",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="max-w-md w-full p-6 top-1/2 -translate-y-1/2"
    >
      <h2 className="text-lg font-semibold mb-2 text-center">
        why are you reporting userXY
      </h2>
      <p className="text-xs text-gray-500 text-center mb-6 px-4">
        our report helps keep Padlupp and our community safe. We will not notify
        the user when this report is submitted. don't wait.
      </p>

      <div className="space-y-3 mb-6">
        {options.map((opt, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 cursor-pointer"
            onClick={() => setSelectedOption(idx)}
          >
            <span className="text-sm text-gray-600">{opt}</span>
            <div
              className={`w-4 h-4 rounded-full border ${selectedOption === idx ? "border-4 border-orange-400" : "border-gray-300"}`}
            />
          </div>
        ))}
      </div>

      <Button variant="primary" className="w-full" onClick={onClose}>
        Submit
      </Button>
    </Modal>
  );
};
