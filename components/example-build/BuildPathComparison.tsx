"use client";

import { motion } from "framer-motion";
import {
  FocusBubbleTrigger,
  type FocusBubbleAction,
  type FocusBubbleData
} from "@/components/marketing/focus-bubble-system";
import { useAIOnboardingControl } from "@/components/onboarding/ai-onboarding-control-provider";
import { publicLaunchManagedCta } from "@/lib/data/public-launch";
import type { ExampleBuildPath } from "@/lib/marketing/example-build-data";

function getPathAction(path: ExampleBuildPath): FocusBubbleAction {
  if (path.id === "managed") {
    return {
      href: publicLaunchManagedCta.href,
      label: publicLaunchManagedCta.label,
      tone: "primary"
    };
  }

  if (path.id === "diy-accelerated") {
    return {
      href: "/pricing/diy",
      label: "View DIY Pricing",
      tone: "primary"
    };
  }

  return {
    href: "/start",
  label: "Start a conversation",
    tone: "primary"
  };
}

function buildPathBubble(path: ExampleBuildPath): FocusBubbleData {
  return {
    id: `example-path:${path.id}`,
    eyebrow: path.recommended ? "Recommended example path" : "Build path",
    title: path.label,
    summary: path.summary,
    sections: [
      {
        label: "Rough timeline",
        body: path.timeline
      },
      {
        label: "Why someone chooses this path",
        body: `${path.bestFor} Control level is ${path.controlLevel.toLowerCase()} and support level is ${path.supportLevel.toLowerCase()}.`
      }
    ],
    details: [
      `Control level: ${path.controlLevel}`,
      `Support level: ${path.supportLevel}`,
      `Best for: ${path.bestFor}`
    ],
    footnote: path.recommended
      ? "Neroa recommends this route for the current example because it balances speed, support, and the shape of the product most effectively."
      : "This route stays available when your budget, urgency, or desired support level points in a different direction.",
    actions: [
      getPathAction(path),
      {
        href: "/example-build",
        label: "Return to Example Build",
        tone: "secondary"
      }
    ]
  };
}

export function BuildPathComparison({ paths }: { paths: ExampleBuildPath[] }) {
  const { guidedMode, syncCardInteraction } = useAIOnboardingControl();
  const recommendedPath =
    paths.find((path) => path.recommended)?.label ?? "Choose the path that fits your pace";

  return (
    <section className="floating-plane rounded-[34px] p-6 sm:p-8">
      <div className="floating-wash rounded-[34px]" />
      <div className="relative">
        <div className="max-w-3xl">
          <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
            Build paths
          </span>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Compare the three ways this example product could move.
          </h3>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Open any path to bring it into focus. The goal is to compare timeline, support depth,
            control, and which route fits the product best before you commit to the next move.
          </p>
        </div>

        <div className="comparison-band mt-8">
          <div className="comparison-metric">
            <span className="comparison-label">Comparison lens</span>
            <span className="comparison-value">
              Time to launch, support depth, and how hands-on you want to stay.
            </span>
          </div>
          <div className="comparison-metric">
            <span className="comparison-label">Best example fit</span>
            <span className="comparison-value">{recommendedPath}</span>
          </div>
          <div className="comparison-metric">
            <span className="comparison-label">Decision outcome</span>
            <span className="comparison-value">
              Choose slower budget pacing, accelerate with credits, or move into Managed Build.
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {paths.map((path, index) => (
            <FocusBubbleTrigger
              key={path.id}
              bubble={buildPathBubble(path)}
              onOpen={() => {
                if (!guidedMode) {
                  return;
                }

                syncCardInteraction({
                  onboardingStep: "example-build-breakdown",
                  userIntent: `Compare ${path.label}`,
                  assistMessage: `${path.summary} Timeline: ${path.timeline}. Control level: ${path.controlLevel}. Support level: ${path.supportLevel}.`
                });
              }}
            >
              {({ isActive, open }) => (
                <motion.button
                  type="button"
                  onClick={open}
                  aria-haspopup="dialog"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.32 }}
                  className={`micro-glow relative overflow-hidden rounded-[30px] border p-6 text-left ${
                    isActive || path.recommended
                      ? "border-cyan-300/60 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.84))] shadow-[0_22px_58px_rgba(34,211,238,0.16)]"
                      : "border-slate-200/70 bg-white/82"
                  }`}
                >
                  <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.1),transparent_28%)]" />
                  {path.recommended ? (
                    <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(34,211,238,0.9),rgba(59,130,246,0.88),rgba(139,92,246,0.9))]" />
                  ) : null}
                  <div className="relative">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-600">
                        {path.label}
                      </span>
                      <span
                        className={`premium-pill ${
                          path.recommended || isActive
                            ? "border-cyan-300/24 bg-cyan-300/12 text-cyan-700"
                            : "border-slate-200/75 bg-white/82 text-slate-500"
                        }`}
                      >
                        {path.recommended ? "Recommended" : isActive ? "Focused" : "Open"}
                      </span>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-600">{path.summary}</p>

                    <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                        Rough timeline estimate
                      </p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                        {path.timeline}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-500">Open focused comparison</p>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/75 bg-white/84 text-base text-slate-500">
                        ↗
                      </span>
                    </div>
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
