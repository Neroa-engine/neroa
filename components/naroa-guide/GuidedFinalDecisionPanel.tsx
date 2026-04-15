"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAIOnboardingControl } from "@/components/onboarding/ai-onboarding-control-provider";
import { createBuildSession, recommendBuildPath } from "@/lib/onboarding/build-session";
import {
  homepageGuidePromptSuggestions,
  resolveGuidePrompt
} from "@/lib/marketing/naroa-guide";

type GuidedFinalDecisionPanelProps = {
  prompt: string;
  onPromptChange: (value: string) => void;
  onUseSuggestion: (value: string) => void;
};

export function GuidedFinalDecisionPanel({
  prompt,
  onPromptChange,
  onUseSuggestion
}: GuidedFinalDecisionPanelProps) {
  const router = useRouter();
  const {
    guidedMode,
    userIntent,
    onboardingStep,
    buildSession,
    setBuildSession,
    setGuidedBuildHandoff
  } = useAIOnboardingControl();
  const resolution = useMemo(() => resolveGuidePrompt(prompt), [prompt]);

  function persistGuideChoice(args: {
    href: string;
    label: string;
    pathId: "diy" | "managed" | "pricing";
  }) {
    const nextIntent =
      prompt.trim() ||
      userIntent.trim() ||
      `Continue from the Naroa homepage guide into ${args.label.toLowerCase()}.`;

    setGuidedBuildHandoff({
      source: "homepage-guide",
      selectedPathId: args.pathId,
      selectedPathLabel: args.label,
      preferences: [guidedMode ? "Guided mode active" : "Self-directed exploration"],
      userIntent: nextIntent,
      onboardingStep
    });
    setBuildSession(
      createBuildSession({
        sessionId: buildSession?.sessionId,
        source: "homepage-guide",
        userIntent: nextIntent,
        preferences: [guidedMode ? "Guided mode active" : "Self-directed exploration"],
        guidedMode,
        scope: {
          summary: nextIntent
        },
        credits: buildSession?.credits ?? { source: "pending" },
        path: recommendBuildPath({
          selectedPathId: args.pathId,
          selectedPathLabel: args.label
        }),
        progress: {
          phase: "homepage-guide",
          currentStep: "final-decision",
          currentStepLabel: "Choose a path",
          currentRoute: args.href,
          completedSteps: [
            "What Neroa is",
            "DIY vs Managed",
            "Budget and Engine Credits",
            "Build categories",
            "Guided build path",
            "Trust and proof"
          ]
        }
      })
    );
    router.push(args.href);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-cyan-200/75 bg-[linear-gradient(135deg,rgba(240,249,255,0.94),rgba(255,255,255,0.84))] px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Have you made a decision?
        </p>
        <h3 className="mt-3 text-xl font-semibold text-slate-950">
          Choose a path, or ask Naroa for one more nudge.
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          If you know your direction, jump into DIY, Managed Build, or pricing. If not, describe
          what you still need help with and Naroa will point you to the cleanest next step.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() =>
            persistGuideChoice({ href: "/start?resume=guided", label: "DIY Build", pathId: "diy" })
          }
          className="button-primary"
        >
          Start DIY Build
        </button>
        <button
          type="button"
          onClick={() =>
            persistGuideChoice({
              href: "/managed-build",
              label: "Managed Build",
              pathId: "managed"
            })
          }
          className="button-secondary"
        >
          Explore Managed Build
        </button>
        <button
          type="button"
          onClick={() =>
            persistGuideChoice({ href: "/pricing", label: "Pricing", pathId: "pricing" })
          }
          className="button-secondary"
        >
          Understand Pricing
        </button>
      </div>

      <div className="rounded-[24px] border border-slate-200/75 bg-white/82 px-5 py-5">
        <p className="text-sm font-semibold text-slate-950">How may I help you?</p>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          This is a lightweight guided prompt for now. It can route into full onboarding later.
        </p>

        <label htmlFor="naroa-guide-final-prompt" className="sr-only">
          Ask for one more recommendation
        </label>
        <textarea
          id="naroa-guide-final-prompt"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          className="input mt-4 min-h-[110px] resize-none"
          placeholder="Example: I have a limited budget and I am not sure whether to start with DIY or Managed Build."
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {homepageGuidePromptSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onUseSuggestion(suggestion)}
              className="rounded-full border border-slate-200/75 bg-white/88 px-3 py-2 text-sm text-slate-600 transition hover:border-cyan-300/35 hover:text-slate-950"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-[22px] border border-slate-200/75 bg-slate-50/80 px-4 py-4">
          <p className="text-sm font-semibold text-slate-950">Naroa&apos;s next-step suggestion</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{resolution.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {resolution.actions.map((action) => (
              <button
                key={`${action.href}:${action.label}`}
                type="button"
                onClick={() =>
                  persistGuideChoice({
                    href: action.href,
                    label: action.label,
                    pathId:
                      action.href.startsWith("/start")
                        ? "diy"
                        : action.href === "/managed-build"
                          ? "managed"
                          : "pricing"
                  })
                }
                className="button-secondary px-4 py-2.5 text-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
