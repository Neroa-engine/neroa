import type { Dispatch, SetStateAction } from "react";
import {
  PromptCard,
  StepShell
} from "@/components/onboarding/real-builder-ui";
import type {
  RealBuilderExecutionPathId,
  RealBuilderPlan
} from "@/lib/onboarding/real-diy-builder";
import type { ExampleBuildProject } from "@/lib/marketing/example-build-data";
import {
  publicLaunchManagedCta,
  publicLaunchPrimaryCta
} from "@/lib/data/public-launch";
import { storePublicEntryIntent } from "@/lib/front-door/public-entry-intent";

type PersistForRouteArgs = {
  href: string;
  selectedPathId?: RealBuilderExecutionPathId | null;
  selectedPathLabel?: string;
};

type ExampleBuildEntryPlanStepProps = {
  activeStep: string;
  plan: RealBuilderPlan | null;
  referenceProject: ExampleBuildProject | null;
  effectivePath: RealBuilderExecutionPathId | null;
  setSelectedExecutionPath: Dispatch<SetStateAction<RealBuilderExecutionPathId | null>>;
  savedNotice: string | null;
  persistForRoute: (args: PersistForRouteArgs) => void;
};

const conversionChoices = [
  {
    title: publicLaunchPrimaryCta.label,
    description:
      "Carry this setup into the real guided builder so Neroa can continue from the same product direction instead of restarting cold.",
    tone: "primary" as const
  },
  {
    title: publicLaunchManagedCta.label,
    description:
      "Carry this setup into the same shared builder entry while keeping the Managed lane selected from the start.",
    tone: "secondary" as const
  },
  {
    title: "Understand Pricing",
    description:
      "Review how pacing, credits, and path selection work before you decide how fast to move the real build forward.",
    tone: "secondary" as const
  }
] as const;

export function ExampleBuildEntryPlanStep({
  activeStep,
  plan,
  referenceProject,
  effectivePath,
  setSelectedExecutionPath,
  savedNotice,
  persistForRoute
}: ExampleBuildEntryPlanStepProps) {
  return (
    <>
            {activeStep === "build-plan" && plan ? (
              <StepShell
                stepNumber={5}
                title="Build Plan Output"
                summary="This uses the same final output structure as the real builder. The difference is that the reference project match and estimate framing are clearly marked as illustrative."
              >
                <div className="space-y-6">
                  <div className="comparison-band">
                    <div className="comparison-metric">
                      <span className="comparison-label">Product type</span>
                      <span className="comparison-value">{plan.productTypeLabel}</span>
                    </div>
                    <div className="comparison-metric">
                      <span className="comparison-label">Build stage</span>
                      <span className="comparison-value">{plan.buildStageLabel}</span>
                    </div>
                    <div className="comparison-metric">
                      <span className="comparison-label">Direction</span>
                      <span className="comparison-value">{plan.businessDirectionLabel}</span>
                    </div>
                    <div className="comparison-metric">
                      <span className="comparison-label">Framework</span>
                      <span className="comparison-value">{plan.frameworkLabel}</span>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <PromptCard
                      eyebrow="Simulated project summary"
                      title={plan.title}
                      description={plan.businessDirectionSummary}
                    >
                      <p className="text-sm leading-7 text-slate-600">
                        {plan.projectDefinitionSummary}
                      </p>
                    </PromptCard>
                    <PromptCard
                      eyebrow="Framework fit"
                      title={plan.frameworkLabel}
                      description={plan.frameworkSummary}
                    >
                      <p className="text-sm leading-7 text-slate-600">
                        {plan.experienceDirectionSummary}
                      </p>
                    </PromptCard>
                  </div>

                  {referenceProject ? (
                    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                      <PromptCard
                        eyebrow="Illustrative reference example"
                        title={referenceProject.title}
                        description={referenceProject.summary}
                      >
                        <div className="grid gap-4">
                          <div className="rounded-[22px] border border-slate-200/75 bg-slate-50/80 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                              Problem
                            </p>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              {referenceProject.problem}
                            </p>
                          </div>
                          <div className="rounded-[22px] border border-slate-200/75 bg-slate-50/80 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                              Audience
                            </p>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              {referenceProject.audience}
                            </p>
                          </div>
                          <div className="rounded-[22px] border border-slate-200/75 bg-slate-50/80 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                              First build boundary
                            </p>
                            <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-600">
                              {referenceProject.firstBuild.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </PromptCard>
                      <PromptCard
                        eyebrow="Illustrative estimate"
                        title={referenceProject.creditEstimate}
                        description={referenceProject.estimateNote}
                      >
                        <div className="space-y-4">
                          <div className="rounded-[22px] border border-cyan-300/25 bg-cyan-50/70 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                              Why this is still useful
                            </p>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              The reference project is illustrative, but it is now matched through
                              the same builder logic as the real flow rather than a separate preset
                              picker.
                            </p>
                          </div>
                          <div className="rounded-[22px] border border-slate-200/75 bg-slate-50/80 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                              MVP framing
                            </p>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              {referenceProject.mvpSummary}
                            </p>
                          </div>
                        </div>
                      </PromptCard>
                    </div>
                  ) : null}

                  <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <PromptCard
                      eyebrow="Likely systems"
                      title="Systems and integrations Neroa expects"
                      description="The systems layer is now derived from the same state model the real builder uses."
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        {plan.systemCards.map((system) => (
                          <div
                            key={system.label}
                            className="rounded-[22px] border border-slate-200/75 bg-slate-50/80 p-4"
                          >
                            <p className="text-sm font-semibold text-slate-950">{system.label}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{system.role}</p>
                          </div>
                        ))}
                      </div>
                    </PromptCard>
                    <PromptCard
                      eyebrow="Estimate"
                      title={plan.estimateBaselineLabel}
                      description={plan.estimateRangeLabel}
                    >
                      <p className="text-sm leading-7 text-slate-600">{plan.timeEstimateLabel}</p>
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        Strong starting point:{" "}
                        <span className="font-semibold text-slate-950">
                          {plan.pricingStartingPointLabel}
                        </span>
                        . {plan.pricingStartingPointSummary}
                      </p>
                      <p className="mt-4 text-sm leading-7 text-slate-500">
                        This is still a simulated output, but the range and pacing now come from the
                        same plan logic the real builder uses.
                      </p>
                    </PromptCard>
                  </div>

                  <PromptCard
                    eyebrow="Roadmap"
                    title="Phased build path"
                    description="The roadmap uses the same stage logic as the real builder output."
                  >
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {plan.roadmap.map((phase) => (
                        <div
                          key={phase.label}
                          className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4"
                        >
                          <p className="text-sm font-semibold text-slate-950">{phase.label}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{phase.summary}</p>
                        </div>
                      ))}
                    </div>
                  </PromptCard>

                  <PromptCard
                    eyebrow="Build path"
                    title={plan.recommendedPathLabel}
                    description={plan.recommendedPathSummary}
                  >
                    <div className="grid gap-4 lg:grid-cols-3">
                      {plan.pathOptions.map((path) => {
                        const active = effectivePath === path.id || (!effectivePath && path.recommended);
                        return (
                          <button
                            key={path.id}
                            type="button"
                            onClick={() => setSelectedExecutionPath(path.id)}
                            className={`rounded-[24px] border p-5 text-left transition ${
                              active
                                ? "border-cyan-300/60 bg-cyan-50/70 shadow-[0_16px_36px_rgba(34,211,238,0.12)]"
                                : "border-slate-200/75 bg-white/84"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-lg font-semibold text-slate-950">{path.label}</p>
                              {path.recommended ? (
                                <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                                  Recommended
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{path.summary}</p>
                            <div className="mt-4 space-y-1 text-sm leading-6 text-slate-500">
                              <p>
                                <span className="font-medium text-slate-950">Timeline:</span>{" "}
                                {path.timeline}
                              </p>
                              <p>
                                <span className="font-medium text-slate-950">Control:</span>{" "}
                                {path.controlLevel}
                              </p>
                              <p>
                                <span className="font-medium text-slate-950">Support:</span>{" "}
                                {path.supportLevel}
                              </p>
                              <p>
                                <span className="font-medium text-slate-950">Best for:</span>{" "}
                                {path.bestFor}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </PromptCard>

                  <section className="section-stage px-6 py-8 sm:px-8 sm:py-10">
                    <div className="floating-wash rounded-[38px]" />
                    <div className="relative">
                      <div className="max-w-4xl">
                        <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                          Final step
                        </span>
                        <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                          Ready to continue from the simulation into a real path?
                        </h3>
                        <p className="mt-4 text-base leading-8 text-slate-600">
                          This simulation now mirrors the real builder architecture. The next move is
                          either resuming inside the real DIY builder with this setup carried
                          forward, comparing the Managed Build path, or tightening pricing logic
                          before you decide how fast to move.
                        </p>
                      </div>

                      <div className="mt-8 grid gap-4 lg:grid-cols-3">
                        {conversionChoices.map((choice) => (
                          <article
                            key={choice.title}
                            className={`relative overflow-hidden rounded-[30px] border p-6 ${
                              choice.tone === "primary"
                                ? "border-cyan-300/40 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.84))] shadow-[0_22px_58px_rgba(34,211,238,0.12)]"
                                : "border-slate-200/70 bg-white/82"
                            }`}
                          >
                            <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.1),transparent_28%)]" />
                            <div className="relative flex h-full flex-col">
                              <div className="flex items-center justify-between gap-3">
                                <span className="premium-pill border-slate-200/80 bg-white/78 text-slate-600">
                                  {choice.tone === "primary" ? "Best next move" : "Next option"}
                                </span>
                                {choice.tone === "primary" ? (
                                  <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                                    Continue
                                  </span>
                                ) : null}
                              </div>

                              <h4 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                                {choice.title}
                              </h4>
                              <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                                {choice.description}
                              </p>

                              <div className="mt-6">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (choice.title === publicLaunchPrimaryCta.label) {
                                      storePublicEntryIntent("diy");
                                      persistForRoute({
                                        href: "/start?resume=guided",
                                        selectedPathId: effectivePath
                                      });
                                      return;
                                    }

                                    if (choice.title === publicLaunchManagedCta.label) {
                                      storePublicEntryIntent("managed");
                                      persistForRoute({
                                        href: "/start?resume=guided",
                                        selectedPathId: "managed",
                                        selectedPathLabel: "Managed Build"
                                      });
                                      return;
                                    }

                                    persistForRoute({
                                      href: "/pricing",
                                      selectedPathId: effectivePath,
                                      selectedPathLabel: plan.recommendedPathLabel
                                    });
                                  }}
                                  className={
                                    choice.tone === "primary"
                                      ? "button-primary w-full"
                                      : "button-secondary w-full"
                                  }
                                >
                                  {choice.title}
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>

                      <p className="mt-6 text-sm leading-7 text-slate-500">
                        The real builder will continue from this setup. The simulation itself stays
                        illustrative, but the carried state now matches the same real builder model.
                      </p>
                    </div>
                  </section>

                  {savedNotice ? (
                    <p className="text-sm leading-7 text-emerald-700">{savedNotice}</p>
                  ) : null}
                </div>
              </StepShell>
            ) : null}
    </>
  );
}

