export interface OnboardingStep {
  id: string;
  title: string;
  summary: string;
  actionLabel?: string;
  doneLabel?: string;
}

export interface OnboardingState {
  completed: boolean;
  currentStepIndex: number;
}
