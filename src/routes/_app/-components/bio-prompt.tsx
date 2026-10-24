import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { UserRoundPen, X } from "lucide-react";
import Button from "@/components/core/buttons";
import ButtonLoader from "@/components/loaders/button";
import { useAuthStore } from "@/features/auth/authStore";
import { getUserProfile, updateExtendedProfile } from "@/pages/auth/api/profile";
import { getApiErrorMessage } from "@/utils/api-error";

export function BioPrompt() {
  const userId = useAuthStore((state) => state.user?.id);
  const sessionId = useAuthStore((state) => state.sessionId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated || !userId) return null;
  return <SessionBioPrompt key={`${userId}:${sessionId}`} userId={userId} sessionId={sessionId} />;
}

function SessionBioPrompt({ userId, sessionId }: { userId: number; sessionId: string | null }) {
  const queryClient = useQueryClient();
  const dismissed = useAuthStore((state) => state.bioPromptDismissed);
  const dismiss = useAuthStore((state) => state.dismissBioPrompt);
  const [bio, setBio] = useState("");
  // A login-scoped query must succeed before deciding whether this user's bio is missing.
  const profile = useQuery({
    queryKey: ["bio-prompt-profile", userId, sessionId],
    queryFn: getUserProfile,
    enabled: !dismissed,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: false,
  });
  const isCurrentSession = () => {
    const auth = useAuthStore.getState();
    return auth.isAuthenticated && auth.user?.id === userId && auth.sessionId === sessionId;
  };
  const save = useMutation({
    mutationFn: async (value: string) => {
      const updated = await updateExtendedProfile({ bio: value });
      if (updated.user?.id !== userId || !updated.bio?.trim()) {
        throw new Error("Your bio could not be confirmed. Please try again.");
      }
      return updated;
    },
    onSuccess: (updated) => {
      if (!isCurrentSession()) return;
      queryClient.setQueryData(["user-profile"], updated);
      queryClient.setQueryData(["bio-prompt-profile", userId, sessionId], updated);
      dismiss();
    },
  });
  const open = !dismissed && profile.isSuccess && profile.isFetchedAfterMount &&
    profile.data.user?.id === userId && !profile.data.bio?.trim();
  const close = () => {
    if (!save.isPending && isCurrentSession()) dismiss();
  };
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = bio.trim();
    if (trimmed && !save.isPending && isCurrentSession()) save.mutate(trimmed);
  };

  return (
    <Dialog open={open} onClose={close} className="relative z-[80]">
      <DialogBackdrop className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <DialogPanel className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            <button type="button" onClick={close} disabled={save.isPending} aria-label="Dismiss bio reminder" className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-[#4E92F4] disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800">
              <X size={18} aria-hidden="true" />
            </button>
            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#4E92F4] dark:bg-blue-950">
              <UserRoundPen size={28} aria-hidden="true" />
            </div>
            <DialogTitle className="pr-5 text-xl font-semibold text-gray-900 dark:text-slate-100">Let your buddies get to know you</DialogTitle>
            <Description className="mb-6 mt-2 text-sm leading-6 text-gray-600 dark:text-slate-400">
              Your profile is missing a bio. Share your goals, interests, or what you are looking for in a buddy to help people connect with you.
            </Description>
            <form onSubmit={handleSubmit}>
              <label htmlFor="login-bio" className="mb-2 block text-sm font-semibold text-gray-800 dark:text-slate-200">Your bio</label>
              <textarea id="login-bio" name="bio" data-autofocus value={bio} onChange={(event) => {
                setBio(event.target.value);
                if (save.isError) save.reset();
              }} rows={5} required disabled={save.isPending} aria-describedby="login-bio-hint" aria-invalid={save.isError || undefined} aria-errormessage={save.isError ? "login-bio-error" : undefined} placeholder="I'm working towards..." className="w-full resize-y rounded-xl border border-gray-300 bg-gray-50 p-3 text-base leading-6 text-gray-900 outline-none focus:border-[#4E92F4] focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-950" />
              <p id="login-bio-hint" className="mb-5 mt-2 text-xs text-gray-500 dark:text-slate-400">You can edit this later in Settings.</p>
              {save.isError && <p id="login-bio-error" role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">{getApiErrorMessage(save.error, "Could not save your bio. Please try again.")}</p>}
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button type="button" variant="outline" onClick={close} disabled={save.isPending}>Maybe later</Button>
                <Button type="submit" disabled={!bio.trim() || save.isPending}>
                  {save.isPending ? <ButtonLoader title="Saving bio..." /> : "Save bio"}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
