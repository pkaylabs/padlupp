import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Step1Interests } from "./-components/step-1";
import { Step2Goal } from "./-components/step-2";
import { Step3ProfileImage } from "./-components/step-3";
import { ProgressBar } from "./-components/progress";
import { useOnboarding } from "./-components/useOnboarding";
import { useOnboardingAvatar } from "./-components/useOnboardingAvatar";

interface OnboardingData {
  interests: string[];
  goal: string;
  profileImage: File | null;
}

const ONBOARDING_STORAGE_KEY = "onboarding-progress-v1";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null,
  );

  const { mutate: submitOnboarding, isPending } = useOnboarding();
  const { mutate: submitOnboardingAvatar, isPending: avatarLoading } =
    useOnboardingAvatar();

  const [formData, setFormData] = useState<OnboardingData>({
    interests: [],
    goal: "",
    profileImage: null,
  });

  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!stored) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        currentStep?: number;
        goal?: string;
        interests?: string[];
      };

      if (parsed.currentStep && parsed.currentStep >= 1 && parsed.currentStep <= 3) {
        setCurrentStep(parsed.currentStep);
      }
      setFormData((prev) => ({
        ...prev,
        goal: parsed.goal ?? prev.goal,
        interests: Array.isArray(parsed.interests) ? parsed.interests : prev.interests,
      }));
    } catch {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({
        currentStep,
        goal: formData.goal,
        interests: formData.interests,
      }),
    );
  }, [currentStep, formData.goal, formData.interests, isHydrated]);

  useEffect(
    () => () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
    },
    [profileImagePreview],
  );

  const handleStep1Continue = (interests: string[]) => {
    const payload = {
      experience: formData.goal,
      interests,
    };

    submitOnboarding(payload, {
      onSuccess: () => {
        setFormData((prev) => ({ ...prev, interests }));
        setCurrentStep(3);
      },
    });
  };

  const handleStep2Continue = (goal: string) => {
    setFormData((prev) => ({ ...prev, goal }));
    submitOnboarding({
      experience: goal,
      interests: formData.interests,
    });
    setCurrentStep(2);
  };

  const handleStep3Finish = () => {
    submitOnboardingAvatar(
      {
        avatar: formData.profileImage,
      },
      {
        onSuccess: () => {
          localStorage.removeItem(ONBOARDING_STORAGE_KEY);
          if (profileImagePreview) {
            URL.revokeObjectURL(profileImagePreview);
          }
          setProfileImagePreview(null);
        },
      },
    );
  };

  const handleProfileImageSelect = (file: File | null, preview: string | null) => {
    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setProfileImagePreview(preview);
    setFormData((prev) => ({ ...prev, profileImage: file }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step2Goal
            onContinue={handleStep2Continue}
            initialGoal={formData.goal}
          />
        );
      case 2:
        return (
          <Step1Interests
            isPending={isPending}
            onContinue={handleStep1Continue}
            onBack={() => setCurrentStep(1)}
            initialSelected={formData.interests}
          />
        );
      case 3:
        return (
          <Step3ProfileImage
            preview={profileImagePreview}
            onFileSelect={handleProfileImageSelect}
            onBack={() => setCurrentStep(2)}
            onFinish={handleStep3Finish}
            onSkip={() => {
              localStorage.removeItem(ONBOARDING_STORAGE_KEY);
              if (profileImagePreview) {
                URL.revokeObjectURL(profileImagePreview);
              }
              setProfileImagePreview(null);
            }}
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
