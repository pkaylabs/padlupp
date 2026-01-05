import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Step1Interests } from "./-components/step-1";
import { Step2Goal } from "./-components/step-2";
import { Step3ProfileImage } from "./-components/step-3";
import { ProgressBar } from "./-components/progress";
import { useOnboarding } from "./-components/useOnboarding";

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
  const [currentStep, setCurrentStep] = useState(1);

  const { mutate: submitOnboarding, isPending } = useOnboarding();
  const { mutate: submitOnboardingAvatar, isPending: avatarLoading } =
    useOnboarding();

  const [formData, setFormData] = useState<OnboardingData>({
    interests: [],
    goal: "",
    profileImage: null,
  });

  const handleStep1Continue = (interests: string[]) => {
    setFormData((prev) => ({ ...prev, interests }));

    const payload = {
      experience: formData.goal,
      interests: formData.interests,
    };

    submitOnboarding(payload);

    setCurrentStep(3);
  };

  const handleStep2Continue = (goal: string) => {
    setFormData((prev) => ({ ...prev, goal }));
    setCurrentStep(2);
  };

  const handleStep3Finish = (profileImage: File | null) => {
    // const finalData = { ...formData, profileImage };

    const payload = {
      avatar: profileImage,
    };

    submitOnboardingAvatar(payload);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step2Goal onContinue={handleStep2Continue} />;
      case 2:
        return (
          <Step1Interests
            isPending={isPending}
            onContinue={handleStep1Continue}
          />
        );
      case 3:
        return (
          <Step3ProfileImage
            onFinish={handleStep3Finish}
            isPending={avatarLoading}
          />
        );
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
