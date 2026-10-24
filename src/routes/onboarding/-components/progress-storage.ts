export interface OnboardingFields {
  goal: string;
  interests: string[];
  bio: string;
}

interface OnboardingDraft extends OnboardingFields {
  version: 2;
  userId: number;
  currentStep: number;
}

export const onboardingStorageKey = (userId: number) => `onboarding-progress-v2:${userId}`;

export function parseInterests(value: unknown): string[] {
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return values.filter((item): item is string => typeof item === "string")
    .map((item) => item.trim()).filter(Boolean);
}

export function readOnboardingDraft(userId: number): OnboardingDraft | null {
  try {
    const stored = localStorage.getItem(onboardingStorageKey(userId));
    if (!stored) return null;
    const draft = JSON.parse(stored) as Partial<OnboardingDraft>;
    if (draft.version !== 2 || draft.userId !== userId || typeof draft.goal !== "string" ||
      typeof draft.bio !== "string" || !Array.isArray(draft.interests) ||
      !draft.interests.every((item) => typeof item === "string")) return null;
    return {
      version: 2, userId, goal: draft.goal, bio: draft.bio,
      interests: parseInterests(draft.interests),
      currentStep: Number.isInteger(draft.currentStep) ? Math.min(4, Math.max(1, draft.currentStep!)) : 1,
    };
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(userId: number, fields: OnboardingFields, currentStep: number) {
  try {
    localStorage.setItem(onboardingStorageKey(userId), JSON.stringify({
      ...fields, version: 2, userId, currentStep,
    }));
  } catch {
    // Setup can still be saved to the server when browser storage is unavailable.
  }
}

export function clearOnboardingDraft(userId: number) {
  try {
    localStorage.removeItem(onboardingStorageKey(userId));
  } catch {
    // Browser storage is optional; the server remains authoritative.
  }
}

export function accessibleOnboardingStep(fields: OnboardingFields, saved: OnboardingFields) {
  if (!saved.goal.trim() || fields.goal.trim() !== saved.goal.trim()) return 1;
  if (!saved.interests.length || !fields.interests.length ||
    JSON.stringify([...fields.interests].sort()) !== JSON.stringify([...saved.interests].sort())) return 2;
  if (!saved.bio.trim() || fields.bio.trim() !== saved.bio.trim()) return 3;
  return 4;
}
