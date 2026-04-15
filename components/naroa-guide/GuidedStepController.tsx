"use client";

import type { HomepageGuideStep } from "@/lib/marketing/naroa-guide";

type GuidedStepControllerProps = {
  step: HomepageGuideStep;
  stepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onDismiss: () => void;
  isFirst: boolean;
  isLast: boolean;
};

export function GuidedStepController({
  step,
  stepIndex,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  onDismiss,
  isFirst,
  isLast
}: GuidedStepControllerProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-700">
            {step.eyebrow}
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            {step.sectionLabel}
          </p>
        </div>
        <span className="premium-pill border-slate-200/80 bg-white/80 text-slate-500">
          {stepIndex + 1} / {totalSteps}
        </span>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{step.title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{step.summary}</p>
        <p className="mt-3 text-sm leading-7 text-slate-500">{step.detail}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="button-quiet px-4 py-2.5 text-sm"
          disabled={isFirst}
        >
          Back
        </button>
        <button type="button" onClick={onNext} className="button-primary px-4 py-2.5 text-sm">
          {isLast ? "Review next steps" : "Next"}
        </button>
        {!isLast ? (
          <button type="button" onClick={onSkip} className="button-secondary px-4 py-2.5 text-sm">
            Skip to final decision
          </button>
        ) : null}
        <button type="button" onClick={onDismiss} className="button-quiet px-4 py-2.5 text-sm">
          Dismiss
        </button>
      </div>
    </div>
  );
}
