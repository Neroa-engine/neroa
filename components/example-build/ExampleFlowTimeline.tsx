"use client";

import { motion } from "framer-motion";
import {
  FocusBubbleTrigger,
  type FocusBubbleData
} from "@/components/marketing/focus-bubble-system";
import { useAIOnboardingControl } from "@/components/onboarding/ai-onboarding-control-provider";

const flowSteps = [
  {
    label: "Strategy",
    summary: "Define the problem and the customer.",
    whyItMatters:
      "Strategy keeps the product tied to a real business or operational outcome before scope starts expanding."
  },
  {
    label: "Scope",
    summary: "Choose the modules and the first release boundary.",
    whyItMatters:
      "Scope is where Neroa protects the product from overbuilding and makes the first release small enough to execute."
  },
  {
    label: "MVP",
    summary: "Reduce the product to the smallest valuable version.",
    whyItMatters:
      "The MVP decision determines what the first release must prove before more budget and complexity are added."
  },
  {
    label: "Budget",
    summary: "Show example credits and pacing options.",
    whyItMatters:
      "Budget logic turns abstract enthusiasm into a realistic launch pace, credit plan, or support decision."
  },
  {
    label: "Build",
    summary: "Compare slower DIY, faster DIY, and managed execution.",
    whyItMatters:
      "Build-path comparison makes the tradeoffs visible before execution becomes expensive or rushed."
  },
  {
    label: "Launch",
    summary: "Aim toward a real release path, not just a concept.",
    whyItMatters:
      "Launch thinking keeps the product pointed at something shippable instead of stopping at planning."
  }
] as const;

function buildTimelineBubble(
  step: (typeof flowSteps)[number],
  index: number
): FocusBubbleData {
  return {
    id: `example-flow:${step.label.toLowerCase()}`,
    eyebrow: `Step 0${index + 1}`,
    title: step.label,
    summary: step.summary,
    sections: [
      {
        label: "What happens here",
        body: step.summary
      },
      {
        label: "Why it matters",
        body: step.whyItMatters
      }
    ],
    actions: [
      {
        href: "/start",
        label: "Open live planning flow",
        tone: "secondary"
      }
    ],
    returnLabel: "Return"
  };
}

export function ExampleFlowTimeline() {
  const { guidedMode, syncCardInteraction } = useAIOnboardingControl();

  return (
    <section className="floating-plane rounded-[32px] p-6">
      <div className="floating-wash rounded-[32px]" />
      <div className="relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Step 6
            </span>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              The guided product path Neroa is simulating.
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Open any stage to bring the sequence into focus. This keeps the example path feeling
              like a real guided system instead of a flat ribbon of labels.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {flowSteps.map((step, index) => (
            <FocusBubbleTrigger
              key={step.label}
              bubble={buildTimelineBubble(step, index)}
              onOpen={() => {
                if (!guidedMode) {
                  return;
                }

                syncCardInteraction({
                  onboardingStep: "example-build-breakdown",
                  userIntent: `Review ${step.label} in the example flow`,
                  assistMessage: `${step.summary} ${step.whyItMatters}`
                });
              }}
            >
              {({ isActive, open }) => (
                <motion.button
                  type="button"
                  onClick={open}
                  aria-haspopup="dialog"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.28 }}
                  className={`micro-glow relative rounded-[24px] border p-5 text-left ${
                    isActive
                      ? "border-cyan-300/48 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.84))] shadow-[0_22px_58px_rgba(34,211,238,0.14)]"
                      : "border-slate-200/70 bg-white/80"
                  }`}
                >
                  <div className="absolute inset-0 rounded-[24px] bg-[linear-gradient(135deg,rgba(34,211,238,0.1),transparent_38%)]" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flow-ribbon-index">{index + 1}</span>
                      <span
                        className={`premium-pill ${
                          isActive
                            ? "border-cyan-300/24 bg-cyan-300/12 text-cyan-700"
                            : "border-slate-200/75 bg-white/84 text-slate-500"
                        }`}
                      >
                        {isActive ? "Focused" : "Open"}
                      </span>
                    </div>
                    <h4 className="mt-4 text-lg font-semibold text-slate-950">{step.label}</h4>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{step.summary}</p>
                  </div>
                </motion.button>
              )}
            </FocusBubbleTrigger>
          ))}
        </div>
      </div>
    </section>
  );
}
