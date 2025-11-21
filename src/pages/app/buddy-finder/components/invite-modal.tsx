// src/components/goals/modals/InviteModal.tsx
import Button from "@/components/core/buttons";
import { Modal } from "@/components/core/modal";
import { type Person } from "@/constants/goals-data";
import React, { useState } from "react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  person,
}) => {
  const [note, setNote] = useState("");
  const maxLength = 300;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="w-md top-1/2 -translate-y-1/2"
    >
      <div className="p-6 w-full ">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Note</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={maxLength}
          placeholder={`Send a note to ${person?.name || "them"}...`}
          className="w-full h-32 p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {note.length}/{maxLength}
        </div>
        <Button variant="primary" className="w-full mt-4" onClick={onClose}>
          Send
        </Button>
      </div>
    </Modal>
  );
};
