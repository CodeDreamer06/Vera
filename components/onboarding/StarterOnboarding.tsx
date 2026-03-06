"use client";

import { Sprout } from "lucide-react";

import type { OnboardingStep } from "@/lib/onboarding/types";

interface StarterOnboardingProps {
  open: boolean;
  step: OnboardingStep | null;
  progressLabel: string;
  canGoBack: boolean;
  isLastStep: boolean;
  busy: boolean;
  onClose: () => void;
  onBack: () => void;
  onAction: () => void;
  onNext: () => void;
  onFinish: () => void;
  onReset: () => void;
}

export function StarterOnboarding({
  open,
  step,
  progressLabel,
  canGoBack,
  isLastStep,
  busy,
  onClose,
  onBack,
  onAction,
  onNext,
  onFinish,
  onReset,
}: StarterOnboardingProps) {
  if (!open || !step) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm md:items-center">
      <div className="neo-box w-full max-w-2xl bg-white p-5 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-4 border-b-[3px] border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-[var(--color-accent)]">
              <Sprout size={18} />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/60">
                Starter Walkthrough
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">
                {step.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            className="neo-box px-3 py-1 text-xs font-mono font-bold uppercase"
            onClick={onClose}
          >
            close
          </button>
        </div>

        <p className="neo-inset bg-gray-50 p-4 font-mono text-sm leading-relaxed text-black/80">
          {step.summary}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="font-mono text-xs uppercase text-black/55">
            Step {progressLabel}
          </div>
          <button
            type="button"
            className="font-mono text-xs uppercase underline decoration-2 underline-offset-2"
            onClick={onReset}
          >
            restart walkthrough
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {canGoBack ? (
            <button
              type="button"
              className="neo-box neo-button bg-white"
              onClick={onBack}
              disabled={busy}
            >
              Back
            </button>
          ) : null}
          {step.actionLabel ? (
            <button
              type="button"
              className="neo-box neo-button neo-button-accent"
              onClick={onAction}
              disabled={busy}
            >
              {busy ? "Working..." : step.actionLabel}
            </button>
          ) : null}
          <button
            type="button"
            className="neo-box neo-button bg-white"
            onClick={isLastStep ? onFinish : onNext}
            disabled={busy}
          >
            {isLastStep ? "Finish tour" : (step.doneLabel ?? "I did this")}
          </button>
        </div>
      </div>
    </div>
  );
}
