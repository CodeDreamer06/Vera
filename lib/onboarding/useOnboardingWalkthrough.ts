"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { OnboardingState, OnboardingStep } from "@/lib/onboarding/types";

const defaultState: OnboardingState = {
  completed: false,
  currentStepIndex: 0,
  autoShown: false,
};

const parseState = (raw: string | null): OnboardingState | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    if (
      typeof parsed.completed === "boolean" &&
      typeof parsed.currentStepIndex === "number"
    ) {
      return {
        completed: parsed.completed,
        currentStepIndex: Math.max(0, Math.floor(parsed.currentStepIndex)),
        autoShown: parsed.autoShown === true,
      };
    }
    return null;
  } catch {
    return null;
  }
};

interface UseOnboardingWalkthroughArgs {
  key: string;
  steps: OnboardingStep[];
  enabled: boolean;
}

export function useOnboardingWalkthrough({
  key,
  steps,
  enabled,
}: UseOnboardingWalkthroughArgs) {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (steps.length === 0) {
      setState(defaultState);
      setOpen(false);
      setReady(true);
      return;
    }

    const stored = parseState(window.localStorage.getItem(key));
    if (stored) {
      const bounded = {
        completed: stored.completed,
        currentStepIndex: Math.min(
          stored.currentStepIndex,
          Math.max(steps.length - 1, 0),
        ),
        autoShown: stored.autoShown,
      };
      if (!bounded.completed && !bounded.autoShown) {
        const firstAutoOpen = { ...bounded, autoShown: true };
        setState(firstAutoOpen);
        window.localStorage.setItem(key, JSON.stringify(firstAutoOpen));
        setOpen(true);
      } else {
        setState(bounded);
        setOpen(false);
      }
    } else {
      const firstAutoOpen = { ...defaultState, autoShown: true };
      setState(firstAutoOpen);
      window.localStorage.setItem(key, JSON.stringify(firstAutoOpen));
      setOpen(true);
    }

    setReady(true);
  }, [enabled, key, steps.length]);

  const persist = useCallback(
    (next: OnboardingState) => {
      setState(next);
      window.localStorage.setItem(key, JSON.stringify(next));
    },
    [key],
  );

  const currentStep = useMemo(() => {
    return steps[state.currentStepIndex] ?? null;
  }, [state.currentStepIndex, steps]);

  const totalSteps = steps.length;
  const atLastStep = state.currentStepIndex >= totalSteps - 1;

  const advance = useCallback(() => {
    if (totalSteps === 0) {
      return;
    }

    if (atLastStep) {
      const done = {
        completed: true,
        currentStepIndex: totalSteps - 1,
        autoShown: true,
      };
      persist(done);
      setOpen(false);
      return;
    }

    persist({
      completed: false,
      currentStepIndex: state.currentStepIndex + 1,
      autoShown: state.autoShown,
    });
  }, [atLastStep, persist, state.autoShown, state.currentStepIndex, totalSteps]);

  const back = useCallback(() => {
    if (state.currentStepIndex <= 0) {
      return;
    }

    persist({
      completed: false,
      currentStepIndex: state.currentStepIndex - 1,
      autoShown: state.autoShown,
    });
  }, [persist, state.autoShown, state.currentStepIndex]);

  const complete = useCallback(() => {
    if (totalSteps === 0) {
      return;
    }

    persist({
      completed: true,
      currentStepIndex: totalSteps - 1,
      autoShown: true,
    });
    setOpen(false);
  }, [persist, totalSteps]);

  const reset = useCallback(() => {
    persist({ ...defaultState, autoShown: true });
    setOpen(true);
  }, [persist]);

  return {
    ready,
    open,
    setOpen,
    state,
    currentStep,
    totalSteps,
    atLastStep,
    progressLabel: `${Math.min(state.currentStepIndex + 1, totalSteps)} / ${totalSteps}`,
    advance,
    back,
    complete,
    reset,
  };
}
