import Button from "@/components/core/buttons";
import ButtonLoader from "@/components/loaders/button";
import { UserRoundPen } from "lucide-react";
import type { FormEvent } from "react";

interface BioStepProps {
  bio: string;
  onChange: (bio: string) => void;
  onContinue: () => void;
  onBack: () => void;
  isPending: boolean;
}

export function BioStep({ bio, onChange, onContinue, onBack, isPending }: BioStepProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (bio.trim() && !isPending) onContinue();
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#4E92F4]">
        <UserRoundPen size={28} aria-hidden="true" />
      </div>
      <h1 className="mb-3 text-center text-3xl font-bold text-gray-900">Tell us about yourself</h1>
      <p id="onboarding-bio-hint" className="mb-8 text-center text-sm leading-6 text-gray-500">
        Share a little about your goals, interests, or what you are looking for in a buddy.
        A bio helps people get to know you.
      </p>
      <label htmlFor="onboarding-bio" className="mb-2 w-full text-sm font-semibold text-gray-800">
        Your bio <span className="font-normal text-gray-500">(required)</span>
      </label>
      <textarea
        id="onboarding-bio"
        name="bio"
        value={bio}
        onChange={(event) => onChange(event.target.value)}
        placeholder="I'm working towards..."
        rows={6}
        required
        disabled={isPending}
        aria-describedby="onboarding-bio-hint"
        className="mb-3 w-full resize-y rounded-xl border border-gray-300 bg-gray-50 p-4 text-base leading-6 text-gray-900 outline-none focus:border-[#4E92F4] focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
      />
      <p className="mb-8 w-full text-xs text-gray-500">You can update your bio in Settings at any time.</p>
      <Button type="submit" disabled={!bio.trim() || isPending}>
        {isPending ? <ButtonLoader title="Saving bio..." /> : "Continue"}
      </Button>
      <Button type="button" variant="outline" onClick={onBack} disabled={isPending} className="mt-3">Back</Button>
    </form>
  );
}
