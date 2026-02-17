// src/components/goals/modals/InviteModal.tsx
import React, { useState } from "react";
import Button from "@/components/core/buttons";
import { Modal } from "@/components/core/modal";
import { type Person } from "@/constants/goals-data";
import { useSendRequest } from "../hooks/useBuddies";

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
  const { mutate: sendRequest, isPending } = useSendRequest();
  const maxLength = 300;

  const handleSend = () => {
    if (person?.id) {
      sendRequest(
        { userId: Number(person.id), message: note },
        {
          onSuccess: () => {
            setNote("");
            onClose();
          },
        },
      );
    }
  };

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
          placeholder={`Send a note to ${person?.name || "them"}... (Optional)`}
          className="w-full h-32 p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {note.length}/{maxLength}
        </div>
        {/* <div className="mt-4 text-xs text-gray-400 italic">
          * Note: Messages are currently disabled in this version. Request will
          be sent immediately.
        </div> */}
        <Button
          variant="primary"
          className="w-full mt-4"
          onClick={handleSend}
          disabled={isPending}
        >
          {isPending ? "Sending Invitation..." : "Send"}
        </Button>
      </div>
    </Modal>
  );
};
