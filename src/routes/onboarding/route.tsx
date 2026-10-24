import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Step1Interests } from "./-components/step-1";
import { Step2Goal } from "./-components/step-2";
import { Step3ProfileImage } from "./-components/step-3";
import { BioStep } from "./-components/bio-step";
import { ProgressBar } from "./-components/progress";
import { useOnboarding } from "./-components/useOnboarding";
import { useOnboardingAvatar } from "./-components/useOnboardingAvatar";
import {
  accessibleOnboardingStep, clearOnboardingDraft, parseInterests,
  readOnboardingDraft, saveOnboardingDraft, type OnboardingFields,
} from "./-components/progress-storage";
import { useAuthStore } from "@/features/auth/authStore";
import { getUserProfile, type UserProfile } from "@/pages/auth/api/profile";
import { GOALS } from "@/constants/page-path";
import { getApiErrorMessage } from "@/utils/api-error";
import Button from "@/components/core/buttons";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/signin", search: { redirect: "/onboarding" } });
    }
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const userId = useAuthStore((state) => state.user?.id);
  const sessionId = useAuthStore((state) => state.sessionId);
  const profile = useQuery({
    queryKey: ["onboarding-profile", userId, sessionId],
    queryFn: getUserProfile,
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (!profile.isFetchedAfterMount || profile.isPending) {
    return <div role="status" className="flex min-h-screen items-center justify-center bg-white text-gray-600">Loading your setup...</div>;
  }
  if (profile.isError || !userId || profile.data?.user.id !== userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <p role="alert" className="text-gray-700">We could not load your profile. Please try again to continue setup.</p>
          <Button onClick={() => void profile.refetch()} disabled={profile.isFetching}>Try again</Button>
        </div>
      </div>
    );
  }
  return <OnboardingFlow key={`${userId}:${sessionId}`} userId={userId} sessionId={sessionId} profile={profile.data} />;
}

function OnboardingFlow({ userId, sessionId, profile }: { userId: number; sessionId: string | null; profile: UserProfile }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState<OnboardingFields>(() => ({
    goal: profile.experience ?? "", interests: parseInterests(profile.interests), bio: profile.bio ?? "",
  }));
  const [initialDraft] = useState(() => readOnboardingDraft(userId));
  const [fields, setFields] = useState<OnboardingFields>(() => initialDraft ?? saved);
  const [currentStep, setCurrentStep] = useState(() => Math.min(
    initialDraft?.currentStep ?? 1, accessibleOnboardingStep(initialDraft ?? saved, saved),
  ));
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const save = useOnboarding();
  const finish = useOnboardingAvatar();
  const pending = save.isPending || finish.isPending;
  const accessibleStep = accessibleOnboardingStep(fields, saved);

  useEffect(() => {
    saveOnboardingDraft(userId, fields, currentStep);
  }, [userId, fields, currentStep]);

  useEffect(() => () => {
    if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
  }, [profileImagePreview]);

  const isCurrentSession = () => {
    const auth = useAuthStore.getState();
    return auth.user?.id === userId && auth.sessionId === sessionId;
  };

  const updateFields = (patch: Partial<OnboardingFields>) => {
    setFields((previous) => ({ ...previous, ...patch }));
    setError(null);
  };

  const selectStep = (step: number) => {
    if (!pending && step <= accessibleStep) {
      setError(null);
      setCurrentStep(step);
    }
  };

  const saveStep = (step: number) => {
    if (pending || !isCurrentSession()) return;
    if (step === 1 && !fields.goal.trim()) return;
    if (step === 2 && !fields.interests.length) return;
    if (step === 3 && !fields.bio.trim()) return;
    setError(null);
    const payload = step === 1 ? { experience: fields.goal.trim() }
      : step === 2 ? { interests: fields.interests } : { bio: fields.bio.trim() };
    save.mutate(payload, {
      onSuccess: (updatedProfile) => {
        if (!isCurrentSession()) return;
        const persisted = {
          goal: updatedProfile.experience ?? "",
          interests: parseInterests(updatedProfile.interests),
          bio: updatedProfile.bio ?? "",
        };
        if (updatedProfile.user?.id !== userId ||
          (step === 1 && !persisted.goal.trim()) ||
          (step === 2 && !persisted.interests.length) ||
          (step === 3 && !persisted.bio.trim())) {
          setError("We could not confirm that this step was saved. Please try again.");
          return;
        }
        setSaved(persisted);
        setCurrentStep(Math.min(step + 1, accessibleOnboardingStep(fields, persisted)));
      },
      onError: (failure) => {
        if (isCurrentSession()) setError(getApiErrorMessage(failure, "Could not save this step. Please try again."));
      },
    });
  };

  const finishSetup = (includeImage: boolean) => {
    if (pending || !isCurrentSession()) return;
    if (accessibleStep < 4) {
      setCurrentStep(accessibleStep);
      setError("Please save the required setup details before finishing.");
      return;
    }
    setError(null);
    finish.mutate({ avatar: includeImage ? profileImage : null }, {
      onSuccess: ({ user, profile: completedProfile }) => {
        if (!isCurrentSession()) return;
        if (user.id !== userId || completedProfile.user?.id !== userId || !completedProfile.bio?.trim()) {
          setError("We could not confirm your saved bio. Please try again.");
          return;
        }
        useAuthStore.getState().updateUser(user);
        queryClient.setQueryData(["user-profile"], completedProfile);
        void queryClient.invalidateQueries({ queryKey: ["bio-prompt-profile", userId] });
        clearOnboardingDraft(userId);
        void router.invalidate();
        void router.navigate({ to: GOALS, replace: true });
      },
      onError: (failure) => {
        if (isCurrentSession()) setError(getApiErrorMessage(failure, "Could not finish setup. Please try again."));
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white px-4 pb-10 pt-10">
      <ProgressBar step={currentStep} totalSteps={4} maxAccessibleStep={accessibleStep} onStepSelect={selectStep} disabled={pending} />
      <div className="w-full max-w-lg">
        {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
            {currentStep === 1 && <Step2Goal initialGoal={fields.goal} onChange={(goal) => updateFields({ goal })} onContinue={() => saveStep(1)} isPending={pending} />}
            {currentStep === 2 && <Step1Interests initialSelected={fields.interests} onChange={(interests) => updateFields({ interests })} onContinue={() => saveStep(2)} onBack={() => selectStep(1)} isPending={pending} />}
            {currentStep === 3 && <BioStep bio={fields.bio} onChange={(bio) => updateFields({ bio })} onContinue={() => saveStep(3)} onBack={() => selectStep(2)} isPending={pending} />}
            {currentStep === 4 && <Step3ProfileImage preview={profileImagePreview ?? (profileImage ? null : profile.user.avatar || null)} onFileSelect={(file, preview) => {
              setProfileImage(file);
              setProfileImagePreview(preview);
              setError(null);
            }} onBack={() => selectStep(3)} onFinish={() => finishSetup(true)} onSkip={() => finishSetup(false)} isPending={pending} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
