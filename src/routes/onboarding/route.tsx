import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Step1Interests } from "./-components/step-1";
import { Step2Goal } from "./-components/step-2";
import { Step3ProfileImage } from "./-components/step-3";
import { ProgressBar } from "./-components/progress";
import { DASHBOARD } from "@/constants/page-path";
import { setExperience, ApiError, SetExperienceResponse, uploadAvatar } from "@/utils/api";
import { tryCatch } from "@/utils/try-catch";
import { notifyLoading, notifyError, notifySuccess } from "@/notifications";
import toast from "react-hot-toast";
import { useAuth } from "@/components/core/auth-context";

interface OnboardingData {
  interests: string[];
  goal: string;
  profileImage: File | null;
}

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    interests: [],
    goal: "",
    profileImage: null,
  });
  const [savingExperience, setSavingExperience] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const [savingInterests, setSavingInterests] = useState(false);

  const handleStep1Continue = async (interests: string[]) => {
    setFormData((prev) => ({ ...prev, interests }));
    setSavingInterests(true);
    const toastId = notifyLoading("Saving your interests...");
    const [data, err] = await tryCatch(
      setExperience({ interests: interests.join(",") })
    );
    setSavingInterests(false);
    toast.dismiss(toastId);
    if (err) {
      const detail = (err as ApiError).detail || "Failed to save interests";
      notifyError("Error", detail);
      return;
    }
    const { user, interests: saved } = data as SetExperienceResponse;
    setUser(user);
    setFormData((prev) => ({ ...prev, interests: saved }));
    notifySuccess("Interests saved", "Great choices!");
    setCurrentStep(3);
  };

  const handleStep2Continue = async (goal: string) => {
    setFormData((prev) => ({ ...prev, goal }));
    setSavingExperience(true);
    const toastId = notifyLoading("Saving your experience...");
    const [data, err] = await tryCatch(setExperience({ experience: goal }));
    setSavingExperience(false);
    toast.dismiss(toastId);
    if (err) {
      const detail = (err as ApiError).detail || "Failed to save experience";
      notifyError("Error", detail);
      return;
    }
    const { user } = data as SetExperienceResponse;
    setUser(user);
    notifySuccess("Experience saved", "We’ve tailored your journey");
    setCurrentStep(2);
  };

  const handleStep3Finish = async (profileImage: File | null) => {
    const finalData = { ...formData, profileImage };
    if (!profileImage) {
      router.navigate({ to: DASHBOARD });
      return;
    }
    setSavingAvatar(true);
    const toastId = notifyLoading("Updating your avatar...");
    const [user, err] = await tryCatch(uploadAvatar(profileImage));
    setSavingAvatar(false);
    toast.dismiss(toastId);
    if (err) {
      const detail = (err as ApiError).detail || "Failed to update avatar";
      notifyError("Error", detail);
      return;
    }
    setUser(user as any);
    notifySuccess("Avatar updated", "Looking great!");
    router.navigate({ to: DASHBOARD });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step2Goal onContinue={handleStep2Continue} isLoading={savingExperience} />;
      case 2:
        return (
          <Step1Interests
            onContinue={handleStep1Continue}
            isLoading={savingInterests}
          />
        );
      case 3:
        return <Step3ProfileImage onFinish={handleStep3Finish} isLoading={savingAvatar} />;
      default:
        return <Step2Goal onContinue={handleStep2Continue} />;
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-white pt-10 px-4">
      <ProgressBar step={currentStep} totalSteps={3} />
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
