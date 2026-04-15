"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GuidedModeToggle } from "@/components/onboarding/guided-mode-toggle";
import { GuidedFinalDecisionPanel } from "@/components/naroa-guide/GuidedFinalDecisionPanel";
import { GuidedStepController } from "@/components/naroa-guide/GuidedStepController";
import { VoiceGuidanceToggle } from "@/components/naroa-guide/VoiceGuidanceToggle";
import type { GuideDockPosition, HomepageGuideStep } from "@/lib/marketing/naroa-guide";

type NaroaGuidePanelProps = {
  open: boolean;
  guidedMode: boolean;
  guideActive: boolean;
  currentStep: HomepageGuideStep;
  currentStepIndex: number;
  totalSteps: number;
  voiceEnabled: boolean;
  voiceSupported: boolean;
  prompt: string;
  onPromptChange: (value: string) => void;
  onUseSuggestion: (value: string) => void;
  onToggleGuidedMode: (next: boolean) => void;
  onStartGuide: () => void;
  onDeclineGuide: () => void;
  onDismiss: () => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onToggleVoice: (next: boolean) => void;
  position: GuideDockPosition | null;
  onMeasure: (size: { width: number; height: number }) => void;
};

export function NaroaGuidePanel({
  open,
  guidedMode,
  guideActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  voiceEnabled,
  voiceSupported,
  prompt,
  onPromptChange,
  onUseSuggestion,
  onToggleGuidedMode,
  onStartGuide,
  onDeclineGuide,
  onDismiss,
  onBack,
  onNext,
  onSkip,
  onToggleVoice,
  position,
  onMeasure
}: NaroaGuidePanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const isFinalStep = currentStepIndex === totalSteps - 1;
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = panelRef.current;

    if (!node || !open) {
      return;
    }

    const measure = () => {
      const rect = node.getBoundingClientRect();
      onMeasure({
        width: rect.width,
        height: rect.height
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [currentStepIndex, guideActive, onMeasure, open, prompt, voiceEnabled]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16, scale: prefersReducedMotion ? 1 : 0.98 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            top: position?.bubbleTop,
            left: position?.bubbleLeft,
            width: position?.bubbleWidth
          }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 12, scale: prefersReducedMotion ? 1 : 0.98 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.28,
            ease: [0.16, 1, 0.3, 1]
          }}
          data-guide-placement={position?.placement ?? "floating"}
          style={{
            maxHeight: position ? `${position.bubbleMaxHeight}px` : undefined
          }}
          className="naroa-guide-bubble fixed z-[114] w-[min(calc(100vw-2rem),360px)] overflow-y-auto"
          aria-live="polite"
        >
          <div className="floating-plane relative overflow-hidden rounded-[30px] p-4">
            <div className="floating-wash rounded-[30px]" />
            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 pb-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    {guideActive ? currentStep.eyebrow : "Naroa guide"}
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {guideActive ? currentStep.sectionLabel : "Optional homepage walkthrough"}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    A lightweight guide that follows the page instead of taking it over.
                  </p>
                </div>

                <button type="button" onClick={onDismiss} className="button-quiet px-3 py-2 text-sm">
                  Close
                </button>
              </div>

              {!guideActive ? (
                <>
                  <div className="rounded-[24px] border border-cyan-200/75 bg-[linear-gradient(135deg,rgba(240,249,255,0.94),rgba(255,255,255,0.84))] px-4 py-4">
                    <p className="text-base font-semibold text-slate-950">I&apos;m Naroa, your build orchestrator.</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Want me to guide you through how to build with Neroa?
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <GuidedModeToggle guidedMode={guidedMode} onToggle={onToggleGuidedMode} compact />
                    <VoiceGuidanceToggle
                      enabled={voiceEnabled}
                      supported={voiceSupported}
                      onToggle={onToggleVoice}
                      compact
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={onStartGuide} className="button-primary">
                      Yes, guide me
                    </button>
                    <button type="button" onClick={onDeclineGuide} className="button-secondary">
                      I&apos;ll explore myself
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <GuidedStepController
                    step={currentStep}
                    stepIndex={currentStepIndex}
                    totalSteps={totalSteps}
                    onBack={onBack}
                    onNext={onNext}
                    onSkip={onSkip}
                    onDismiss={onDismiss}
                    isFirst={currentStepIndex === 0}
                    isLast={isFinalStep}
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <GuidedModeToggle guidedMode={guidedMode} onToggle={onToggleGuidedMode} compact />
                    <VoiceGuidanceToggle
                      enabled={voiceEnabled}
                      supported={voiceSupported}
                      onToggle={onToggleVoice}
                      compact
                    />
                  </div>

                  {isFinalStep ? (
                    <GuidedFinalDecisionPanel
                      prompt={prompt}
                      onPromptChange={onPromptChange}
                      onUseSuggestion={onUseSuggestion}
                    />
                  ) : null}
                </>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
