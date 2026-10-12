import type { Metadata } from "next";

import { InterestsOnboarding } from "@/components/interests/interests-onboarding";

export const metadata: Metadata = {
  title: "Choose your interests",
};

export default function OnboardingPage() {
  return <InterestsOnboarding />;
}
