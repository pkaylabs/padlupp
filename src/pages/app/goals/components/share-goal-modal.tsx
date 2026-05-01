import { useMemo, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { CheckCircle2, Copy, MailPlus, X } from "lucide-react";
import { Modal } from "@/components/core/modal";
import Button from "@/components/core/buttons";
import { cn } from "@/utils/cs";
import { toast } from "sonner";

interface EmailChip {
  id: string;
  value: string;
  isValid: boolean;
}

interface ShareGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalTitle: string;
  shareLink?: string | null;
  isSubmitting?: boolean;
  onSendInvites: (payload: { emails: string[]; message?: string }) => Promise<void>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (value: string) => EMAIL_REGEX.test(value);

const splitEmails = (value: string) =>
  value
    .split(/[,\s;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const toChip = (email: string): EmailChip => ({
  id: `${email}-${Math.random().toString(36).slice(2)}`,
  value: email,
  isValid: isValidEmail(email),
});

export const ShareGoalModal = ({
  isOpen,
  onClose,
  goalTitle,
  shareLink,
  isSubmitting = false,
  onSendInvites,
}: ShareGoalModalProps) => {
  const [chips, setChips] = useState<EmailChip[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState("");

  const validEmails = useMemo(
    () =>
      chips
        .filter((chip) => chip.isValid)
        .map((chip) => chip.value.toLowerCase())
        .filter((value, index, array) => array.indexOf(value) === index),
    [chips],
  );

  const invalidCount = useMemo(
    () => chips.filter((chip) => !chip.isValid).length,
    [chips],
  );

  const clearDraft = () => {
    setChips([]);
    setInputValue("");
    setMessage("");
  };

  const addEmailsFromText = (raw: string) => {
    const parsed = splitEmails(raw);
    if (!parsed.length) return;

    setChips((prev) => {
      const existing = new Set(prev.map((chip) => chip.value.toLowerCase()));
      const next = [...prev];
      parsed.forEach((email) => {
        const normalized = email.toLowerCase();
        if (existing.has(normalized)) return;
        existing.add(normalized);
        next.push(toChip(email));
      });
      return next;
    });
  };

  const handleClose = () => {
    if (isSubmitting) return;
    clearDraft();
    onClose();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
      event.preventDefault();
      if (!inputValue.trim()) return;
      addEmailsFromText(inputValue);
      setInputValue("");
    }
  };

  const handleInputBlur = () => {
    if (!inputValue.trim()) return;
    addEmailsFromText(inputValue);
    setInputValue("");
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    if (!text) return;
    event.preventDefault();
    addEmailsFromText(text);
  };

  const handleRemoveChip = (id: string) => {
    setChips((prev) => prev.filter((chip) => chip.id !== id));
  };

  const handleCopyLink = async () => {
    if (!shareLink) {
      toast.error("Share link is not available yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied.");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleSend = async () => {
    if (!validEmails.length) {
      toast.error("Add at least one valid email.");
      return;
    }

    await onSendInvites({
      emails: validEmails,
      message: message.trim() || undefined,
    });
    clearDraft();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton
      className="top-1/2 -translate-y-1/2 w-[95vw] sm:w-[640px] p-6"
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Share goal
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Invite people to collaborate on{" "}
            <span className="font-semibold text-gray-700 dark:text-slate-200">
              {goalTitle}
            </span>
            .
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Invite by email
          </label>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 min-h-14">
            <div className="flex flex-wrap gap-2 items-center">
              {chips.map((chip) => (
                <span
                  key={chip.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border",
                    chip.isValid
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
                  )}
                >
                  {chip.value}
                  <button
                    type="button"
                    aria-label={`Remove ${chip.value}`}
                    onClick={() => handleRemoveChip(chip.id)}
                    className="text-current/80 hover:text-current"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleInputKeyDown}
                onBlur={handleInputBlur}
                onPaste={handlePaste}
                placeholder={
                  chips.length
                    ? "Add more emails..."
                    : "Type email and press Enter"
                }
                className="flex-1 min-w-[180px] py-1 text-sm bg-transparent text-gray-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <p className="text-gray-500 dark:text-slate-400">
              Use Enter, comma, Tab, or paste multiple emails.
            </p>
            {invalidCount > 0 && (
              <p className="text-red-500">{invalidCount} invalid email(s)</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Message (optional)
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Add a message to your invite..."
            className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/20 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <MailPlus size={16} />
            <p className="text-sm font-medium">
              Or share your public invite link
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={shareLink || ""}
              readOnly
              placeholder="Public share link will appear here"
              className="w-full rounded-lg border border-blue-200 dark:border-blue-800/60 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-700 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-800/60 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700"
            >
              <Copy size={14} /> Copy
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-60"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            disabled={isSubmitting || validEmails.length === 0}
            onClick={() => void handleSend()}
            className="px-4 py-2 inline-flex items-center gap-1.5"
          >
            {isSubmitting ? (
              "Sending..."
            ) : (
              <>
                <CheckCircle2 size={16} /> Send invite
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
