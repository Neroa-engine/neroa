"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { GuidedModeToggle } from "@/components/onboarding/guided-mode-toggle";
import {
  ChoiceGrid,
  GuidedChatLead,
  PromptCard,
  StepShell
} from "@/components/onboarding/real-builder-ui";
import {
  useAIOnboardingControl,
  type AIOnboardingStep
} from "@/components/onboarding/ai-onboarding-control-provider";
import {
  buildBuildSessionSummary,
  loadSavedSession,
  type GuidedBuildSession
} from "@/lib/onboarding/build-session";
import {
  buildGuidedBuildHandoffSummary,
  normalizeGuidedBuildHandoff
} from "@/lib/onboarding/guided-handoff";
import { readPublicEntryIntent } from "@/lib/front-door/public-entry-intent";
import {
  buildRealBuilderHandoff,
  buildRealBuilderPlan,
  buildRealBuilderSelectionSummary,
  buildRealBuilderSession,
  createEmptyRealBuilderState,
  deriveRealBuilderCurrentStep,
  getRealBuilderFrameworkRecommendations,
  isBuildSetupComplete,
  isBusinessDirectionComplete,
  isFrameworkDirectionComplete,
  isProjectDefinitionComplete,
  realBuilderAutomationLevelOptions,
  realBuilderBuildStages,
  realBuilderComplexityOptions,
  realBuilderConceptOptions,
  realBuilderExperienceStyleOptions,
  realBuilderIntegrationOptions,
  realBuilderMonetizationOptions,
  realBuilderPlatformStyleOptions,
  realBuilderPriorityOptions,
  realBuilderSteps,
  realBuilderSurfaceOptions,
  realBuilderVentureOptions,
  restoreRealBuilderStateFromSession,
  type RealBuilderExecutionPathId,
  type RealBuilderState,
  type RealBuilderStepId
} from "@/lib/onboarding/real-diy-builder";
import {
  exampleBuildTypes,
  exampleIndustries,
  exampleOpportunityAreas,
  getExampleBuildType
} from "@/lib/marketing/example-build-data";
import type { BillingIntervalId, PricingPlanId } from "@/lib/pricing/config";

type GuidedStartFlowProps = {
  initialUserEmail?: string;
  initialSelectedPlanId?: PricingPlanId | null;
  initialBillingInterval?: BillingIntervalId;
  resumeRequested: boolean;
  entryPathId?: "diy" | "managed";
  initialError?: string | null;
  initialNotice?: string | null;
  startGuidedEngineWorkspaceAction: (formData: FormData) => void | Promise<void>;
};

function SubmitWorkspaceButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="button-primary" disabled={pending}>
      {pending ? "Opening workspace..." : "Continue into build workspace"}
    </button>
  );
}

function restoreSelectedPath(session: GuidedBuildSession | null, handoffLabel?: string | null) {
  const label = (session?.path.selectedPathLabel ?? handoffLabel ?? "").toLowerCase();
  if (label.includes("managed")) return "managed" as const;
  if (label.includes("accelerated")) return "diy-accelerated" as const;
  if (label.includes("diy")) return "diy-slower" as const;
  return null;
}

const stepMap: Record<RealBuilderStepId, AIOnboardingStep> = {
  "build-setup": "start-build-setup",
  "business-direction": "start-business-direction",
  "project-definition": "start-project-definition",
  "framework-direction": "start-framework-direction",
  "build-plan": "start-build-plan"
};

const assistCopy: Record<RealBuilderStepId, string> = {
  "build-setup":
    "Neroa is anchoring the product lane and build depth first so the rest of the builder can stay grounded.",
  "business-direction":
    "Neroa is narrowing the business context before it asks you to define deeper product logic.",
  "project-definition":
    "Neroa is shaping the workflow, features, monetization, and integration weight into a real project definition.",
  "framework-direction":
    "Neroa is matching the product definition to the strongest system framework and experience direction.",
  "build-plan":
    "Neroa is translating the defined product into a first serious build plan with systems, timing, and execution paths."
};

export default function GuidedStartFlow({
  initialUserEmail,
  resumeRequested,
  entryPathId = "diy",
  initialError,
  initialNotice,
  startGuidedEngineWorkspaceAction
}: GuidedStartFlowProps) {
  const {
    guidedMode,
    buildSession,
    guidedBuildHandoff,
    setGuidedMode,
    setOnboardingStep,
    setUserIntent,
    setNaroaContext,
    setGuidedBuildHandoff,
    clearGuidedBuildHandoff,
    setBuildSession,
    clearBuildSession
  } = useAIOnboardingControl();
  const [state, setState] = useState<RealBuilderState>(() => createEmptyRealBuilderState());
  const [activeStep, setActiveStep] = useState<RealBuilderStepId>("build-setup");
  const [selectedExecutionPath, setSelectedExecutionPath] = useState<RealBuilderExecutionPathId | null>(null);
  const [entryIntentPathId, setEntryIntentPathId] = useState<"diy" | "managed" | null>(
    entryPathId === "managed" ? "managed" : null
  );
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    let resumeSession = buildSession;
    let resumeHandoff = guidedBuildHandoff;
    const storedEntryIntent =
      !resumeRequested && entryPathId !== "managed" ? readPublicEntryIntent() : null;
    const initialEntryPathId =
      entryPathId === "managed" || storedEntryIntent === "managed" ? "managed" : "diy";
    setEntryIntentPathId(initialEntryPathId);

    if (resumeRequested && !resumeSession && !resumeHandoff) {
      resumeSession = loadSavedSession();

      try {
        const raw = window.localStorage.getItem("neroa:ai-onboarding-control");
        if (raw) {
          const parsed = JSON.parse(raw) as { guidedBuildHandoff?: unknown };
          resumeHandoff = normalizeGuidedBuildHandoff(parsed.guidedBuildHandoff);
        }
      } catch {}
    }

    const shouldResume =
      resumeRequested &&
      (resumeSession?.source === "start" ||
        resumeSession?.source === "example-build" ||
        resumeHandoff?.source === "start" ||
        resumeHandoff?.source === "example-build");

    if (shouldResume) {
      const restored = restoreRealBuilderStateFromSession({
        buildSession: resumeSession,
        guidedBuildHandoff: resumeHandoff
      });
      setState(restored);
      setActiveStep(deriveRealBuilderCurrentStep(restored));
      const restoredPath = restoreSelectedPath(
        resumeSession,
        resumeHandoff?.selectedPathLabel
      );
      setSelectedExecutionPath(
        restoredPath ?? (initialEntryPathId === "managed" ? "managed" : null)
      );
      if (resumeSession && !buildSession) setBuildSession(resumeSession);
      if (resumeHandoff && !guidedBuildHandoff) setGuidedBuildHandoff(resumeHandoff);
    } else {
      setState(createEmptyRealBuilderState());
      setActiveStep("build-setup");
      setSelectedExecutionPath(initialEntryPathId === "managed" ? "managed" : null);
      if (storedEntryIntent === "managed") {
        setSavedNotice("Managed lane preselected from your public entry choice.");
      }
      if (buildSession?.source === "start") clearBuildSession();
      if (guidedBuildHandoff?.source === "start") clearGuidedBuildHandoff();
    }

    setHydrated(true);
  }, [
    buildSession,
    clearBuildSession,
    clearGuidedBuildHandoff,
    entryPathId,
    guidedBuildHandoff,
    hydrated,
    resumeRequested
  ]);

  const derivedStep = deriveRealBuilderCurrentStep(state);
  const frameworkRecommendations = useMemo(() => getRealBuilderFrameworkRecommendations(state), [state]);
  const plan = useMemo(() => buildRealBuilderPlan(state), [state]);
  const trackedPathId =
    selectedExecutionPath ??
    (entryIntentPathId === "managed"
      ? "managed"
      : entryIntentPathId === "diy"
        ? "diy-slower"
        : null) ??
    plan?.recommendedPathId ??
    null;
  const effectivePath =
    selectedExecutionPath ??
    (entryIntentPathId === "managed" ? "managed" : null) ??
    plan?.recommendedPathId ??
    null;
  const currentSession = useMemo(
    () =>
      buildRealBuilderSession({
        state,
        selectedPathId: trackedPathId,
        currentRoute:
          entryPathId === "managed"
            ? resumeRequested
              ? "/start?entry=managed&resume=guided"
              : "/start?entry=managed"
            : resumeRequested
              ? "/start?resume=guided"
              : "/start",
        currentStep: activeStep
      }),
    [activeStep, entryPathId, resumeRequested, state, trackedPathId]
  );
  const currentHandoff = useMemo(
    () => buildRealBuilderHandoff({ state, selectedPathId: trackedPathId }),
    [state, trackedPathId]
  );

  useEffect(() => {
    if (!hydrated) return;
    const activeIndex = realBuilderSteps.findIndex((step) => step.id === activeStep);
    const derivedIndex = realBuilderSteps.findIndex((step) => step.id === derivedStep);
    if (activeIndex > derivedIndex) setActiveStep(derivedStep);
  }, [activeStep, derivedStep, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    setOnboardingStep(stepMap[activeStep]);
    setUserIntent(plan?.userIntent ?? state.businessDirection.businessGoal);
    setBuildSession(currentSession);
    if (currentHandoff) setGuidedBuildHandoff(currentHandoff);
    else if (guidedBuildHandoff?.source === "start") clearGuidedBuildHandoff();
    setNaroaContext(guidedMode ? assistCopy[activeStep] : null);
  }, [
    activeStep,
    clearGuidedBuildHandoff,
    currentHandoff,
    currentSession,
    guidedBuildHandoff?.source,
    guidedMode,
    hydrated,
    plan?.userIntent,
    setBuildSession,
    setGuidedBuildHandoff,
    setNaroaContext,
    setOnboardingStep,
    setUserIntent,
    state.businessDirection.businessGoal
  ]);

  const carriedSummary = useMemo(() => {
    const sessionSummary = buildBuildSessionSummary(buildSession);
    const handoffSummary = buildGuidedBuildHandoffSummary(guidedBuildHandoff);
    return [sessionSummary, handoffSummary].filter(Boolean).join(" ");
  }, [buildSession, guidedBuildHandoff]);

  if (!hydrated) {
    return <section className="section-stage px-6 py-8 sm:px-8 sm:py-10"><p className="text-sm leading-7 text-slate-600">Loading the guided build entry...</p></section>;
  }

  const stepIndex = Math.max(realBuilderSteps.findIndex((step) => step.id === activeStep), 0);
  const unlockedCount = Math.max(
    realBuilderSteps.findIndex((step) => step.id === derivedStep) + 1,
    1
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
      <div className="space-y-6">
        <section className="floating-plane rounded-[30px] p-5 sm:p-6">
          <div className="floating-wash rounded-[30px]" />
          <div className="relative">
            <div className="flow-ribbon">
              {realBuilderSteps.map((step, index) => {
                const unlocked = index + 1 <= unlockedCount;
                const active = step.id === activeStep;
                const complete = index < stepIndex;

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => setActiveStep(step.id)}
                    className={`flow-ribbon-item text-left ${active ? "border-cyan-300/50 bg-cyan-50/70 text-slate-950" : complete ? "border-cyan-200/60 bg-white/86 text-slate-700" : ""} ${!unlocked ? "cursor-not-allowed opacity-45" : ""}`}
                  >
                    <span className="flow-ribbon-index">{index + 1}</span>
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {activeStep === "build-setup" ? (
              <StepShell
                stepNumber={1}
                title="Tell us what you want to build"
                summary="Start fast. Anchor the software type and the build depth first. There is no chat here because Neroa should only begin guided questioning after the product lane is fixed."
              >
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-6">
                    <PromptCard eyebrow="Product type" title="Choose the software lane" description="This is the root choice. It shapes the later business questions, framework recommendations, and plan output.">
                      <div className="grid gap-3 md:grid-cols-2">
                        {exampleBuildTypes.map((type) => {
                          const selected = state.productTypeId === type.id;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setState((current) => ({ ...current, productTypeId: type.id, experienceDirection: { ...current.experienceDirection, frameworkId: null } }))}
                              className={`rounded-[24px] border p-5 text-left transition ${selected ? "border-cyan-300/60 bg-cyan-50/70 shadow-[0_16px_36px_rgba(34,211,238,0.12)]" : "border-slate-200/75 bg-white/84"}`}
                            >
                              <p className="text-lg font-semibold text-slate-950">{type.label}</p>
                              <p className="mt-3 text-sm leading-7 text-slate-600">{type.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </PromptCard>

                    <PromptCard eyebrow="Build stage" title="Choose the first build depth" description="This is the scope posture Neroa should optimize around before it starts asking guided product questions.">
                      <ChoiceGrid items={realBuilderBuildStages} selectedId={state.buildStageId} onSelect={(id) => setState((current) => ({ ...current, buildStageId: id }))} />
                    </PromptCard>
                  </div>

                  <div className="rounded-[28px] border border-slate-200/75 bg-white/84 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">Current setup</p>
                    <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                      <p><span className="font-semibold text-slate-950">Product Type:</span> {getExampleBuildType(state.productTypeId ?? "")?.label ?? "Choose one"}</p>
                      <p><span className="font-semibold text-slate-950">Build Stage:</span> {realBuilderBuildStages.find((stage) => stage.id === state.buildStageId)?.label ?? "Choose one"}</p>
                      <p>Neroa keeps chat out of Step 1 so this stays fast, clear, and confidence-building.</p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button type="button" className="button-primary" disabled={!isBuildSetupComplete(state)} onClick={() => setActiveStep("business-direction")}>
                        Continue to business direction
                      </button>
                    </div>
                  </div>
                </div>
              </StepShell>
            ) : null}

            {activeStep === "business-direction" ? (
              <StepShell
                stepNumber={2}
                title="Business Direction"
                summary="Neroa guided chat starts here. The goal is to understand the business direction before the product definition gets narrower."
              >
                <div className="space-y-5">
                  <GuidedChatLead
                    eyebrow="Neroa guided chat"
                    title="First, let’s anchor the business direction."
                    message="Neroa starts asking guided questions here because the product lane and build depth are already fixed. This stage is about understanding the business context, not jumping too early into features."
                    bullets={[
                      "What you are trying to create in practical terms",
                      "Whether the idea is already clear or still opportunity-led",
                      "Which market or opportunity context should shape the build",
                      "Whether the first release serves an existing business, a new venture, internal users, customers, or both"
                    ]}
                  />
                  <PromptCard eyebrow="Neroa asks" title="What are you trying to create?" description="Give one or two practical sentences. This becomes the anchor for the rest of the builder.">
                    <textarea
                      className="input min-h-[120px]"
                      value={state.businessDirection.businessGoal}
                      onChange={(event) => setState((current) => ({ ...current, businessDirection: { ...current.businessDirection, businessGoal: event.target.value } }))}
                      placeholder="Describe the product or business outcome you want Neroa to shape."
                    />
                  </PromptCard>
                  <PromptCard eyebrow="Neroa asks" title="Do you already have a clear concept?" description="Industry or opportunity logic belongs here, not as the first step in the builder.">
                    <ChoiceGrid items={realBuilderConceptOptions} selectedId={state.businessDirection.conceptMode} onSelect={(id) => setState((current) => ({ ...current, businessDirection: { ...current.businessDirection, conceptMode: id, industryId: id === "clear-concept" ? current.businessDirection.industryId : null, opportunityAreaId: id === "exploring-opportunities" ? current.businessDirection.opportunityAreaId : null } }))} />
                  </PromptCard>
                  {state.businessDirection.conceptMode === "clear-concept" ? (
                    <PromptCard eyebrow="Neroa asks" title="Which industry fits this build?" description="Choose the market context Neroa should use when it narrows the framework.">
                      <ChoiceGrid items={exampleIndustries.map((industry) => ({ id: industry.id, label: industry.label, description: industry.description }))} selectedId={state.businessDirection.industryId} onSelect={(id) => setState((current) => ({ ...current, businessDirection: { ...current.businessDirection, industryId: id, opportunityAreaId: null } }))} />
                    </PromptCard>
                  ) : null}
                  {state.businessDirection.conceptMode === "exploring-opportunities" ? (
                    <PromptCard eyebrow="Neroa asks" title="Which opportunity area is closest?" description="This gives Neroa enough context to recommend the right system shape later.">
                      <ChoiceGrid items={exampleOpportunityAreas.map((item) => ({ id: item.id, label: item.label, description: item.description }))} selectedId={state.businessDirection.opportunityAreaId} onSelect={(id) => setState((current) => ({ ...current, businessDirection: { ...current.businessDirection, opportunityAreaId: id, industryId: null } }))} />
                    </PromptCard>
                  ) : null}
                  <PromptCard eyebrow="Neroa asks" title="Is this for an existing business or a new venture?" description="This changes how Neroa thinks about urgency, proof, and scope discipline.">
                    <ChoiceGrid items={realBuilderVentureOptions} selectedId={state.businessDirection.ventureType} onSelect={(id) => setState((current) => ({ ...current, businessDirection: { ...current.businessDirection, ventureType: id } }))} />
                  </PromptCard>
                  <PromptCard eyebrow="Neroa asks" title="Is the first release customer-facing, internal, or both?" description="This helps Neroa frame experience direction before framework and build-path logic appear.">
                    <ChoiceGrid items={realBuilderSurfaceOptions} selectedId={state.businessDirection.surfaceType} onSelect={(id) => setState((current) => ({ ...current, businessDirection: { ...current.businessDirection, surfaceType: id } }))} />
                  </PromptCard>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className="button-secondary" onClick={() => setActiveStep("build-setup")}>Back</button>
                    <button type="button" className="button-primary" disabled={!isBusinessDirectionComplete(state)} onClick={() => setActiveStep("project-definition")}>
                      Continue to project definition
                    </button>
                  </div>
                </div>
              </StepShell>
            ) : null}
            {activeStep === "project-definition" ? (
              <StepShell
                stepNumber={3}
                title="Project Definition"
                summary="This is the second guided chat step. Neroa narrows the actual product: users, workflow, features, monetization, integrations, and tradeoffs."
              >
                <div className="space-y-5">
                  <GuidedChatLead
                    eyebrow="Neroa guided chat"
                    title="Now Neroa narrows the product itself."
                    message="With the business direction set, Neroa can shift into more serious product questions. This is where the first build boundary gets sharper so the later plan stays realistic."
                    bullets={[
                      "Who the first release should serve best",
                      "Which workflow must work well from end to end",
                      "Which features belong inside the first build boundary",
                      "How value is created, where integrations matter, and which tradeoff should lead the plan"
                    ]}
                  />
                  <PromptCard eyebrow="Neroa asks" title="Who are the primary users?" description="Name the main people Neroa should optimize the first release around.">
                    <textarea
                      className="input min-h-[96px]"
                      value={state.projectDefinition.targetUsers}
                      onChange={(event) => setState((current) => ({ ...current, projectDefinition: { ...current.projectDefinition, targetUsers: event.target.value } }))}
                      placeholder="Founders, clinic operators, dispatch managers, customers, members..."
                    />
                  </PromptCard>
                  <PromptCard eyebrow="Neroa asks" title="What is the core workflow?" description="Describe the one workflow this product must handle well in the first build.">
                    <textarea
                      className="input min-h-[110px]"
                      value={state.projectDefinition.coreWorkflow}
                      onChange={(event) => setState((current) => ({ ...current, projectDefinition: { ...current.projectDefinition, coreWorkflow: event.target.value } }))}
                      placeholder="What should happen from start to finish for the main user?"
                    />
                  </PromptCard>
                  <PromptCard eyebrow="Neroa asks" title="Which key features belong in the first version?" description="Separate them with commas or new lines so Neroa can keep the first build boundary clear.">
                    <textarea
                      className="input min-h-[110px]"
                      value={state.projectDefinition.keyFeatures.join(", ")}
                      onChange={(event) => setState((current) => ({ ...current, projectDefinition: { ...current.projectDefinition, keyFeatures: event.target.value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean) } }))}
                      placeholder="Accounts, approvals, reporting, booking flow, admin dashboard..."
                    />
                  </PromptCard>
                  <PromptCard eyebrow="Neroa asks" title="How does this make money or create operational value?" description="Choose the value model Neroa should keep in mind while it scopes the product.">
                    <ChoiceGrid items={realBuilderMonetizationOptions.map((item) => ({ id: item, label: item, description: "Use this if it best matches the first commercial or operational value path." }))} selectedId={state.projectDefinition.monetization} onSelect={(id) => setState((current) => ({ ...current, projectDefinition: { ...current.projectDefinition, monetization: id } }))} />
                  </PromptCard>
                  <PromptCard eyebrow="Neroa asks" title="Which integrations or automations already matter?" description="Select the systems that already influence the scope.">
                    <div className="flex flex-wrap gap-2">
                      {realBuilderIntegrationOptions.map((item) => {
                        const selected = state.projectDefinition.integrationNeeds.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setState((current) => {
                              const includes = current.projectDefinition.integrationNeeds.includes(item);
                              const integrationNeeds =
                                item === "No major integrations yet"
                                  ? ["No major integrations yet"]
                                  : includes
                                    ? current.projectDefinition.integrationNeeds.filter((value) => value !== item)
                                    : [...current.projectDefinition.integrationNeeds.filter((value) => value !== "No major integrations yet"), item];
                              return { ...current, projectDefinition: { ...current.projectDefinition, integrationNeeds } };
                            })}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${selected ? "border-cyan-300/55 bg-cyan-50 text-cyan-700" : "border-slate-200/80 bg-white text-slate-600"}`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </PromptCard>
                  <PromptCard eyebrow="Neroa asks" title="Which tradeoff matters most right now?" description="This helps Neroa decide whether the plan should bias speed, budget control, or product depth.">
                    <ChoiceGrid items={realBuilderPriorityOptions} selectedId={state.projectDefinition.priorityTradeoff} onSelect={(id) => setState((current) => ({ ...current, projectDefinition: { ...current.projectDefinition, priorityTradeoff: id } }))} />
                  </PromptCard>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className="button-secondary" onClick={() => setActiveStep("business-direction")}>Back</button>
                    <button type="button" className="button-primary" disabled={!isProjectDefinitionComplete(state)} onClick={() => setActiveStep("framework-direction")}>
                      Continue to framework direction
                    </button>
                  </div>
                </div>
              </StepShell>
            ) : null}
            {activeStep === "framework-direction" ? (
              <StepShell
                stepNumber={4}
                title="Framework + Experience Direction"
                summary="Now that the product is better defined, Neroa can recommend the right system framework and the right experience posture."
              >
                <div className="space-y-5">
                  <GuidedChatLead
                    eyebrow="Hybrid guidance"
                    title="Neroa now turns the definition into a system shape."
                    message="This step is lighter on chat and stronger on recommendations. Neroa uses the earlier answers to suggest the framework, experience posture, and technical direction that best fit the build."
                    bullets={[
                      "Recommended framework based on the product and business context",
                      "Experience direction for operational depth versus customer polish",
                      "Platform posture, automation expectations, and likely complexity level"
                    ]}
                  />
                  <PromptCard eyebrow="Recommended frameworks" title="Select the system framework" description="Framework belongs here, after business direction and project definition are already clear.">
                    <div className="grid gap-3 lg:grid-cols-2">
                      {frameworkRecommendations.frameworks.map((framework) => {
                        const selected = state.experienceDirection.frameworkId === framework.id;
                        const recommended = frameworkRecommendations.recommendedSet.has(framework.id);
                        return (
                          <button
                            key={framework.id}
                            type="button"
                            onClick={() => setState((current) => ({ ...current, experienceDirection: { ...current.experienceDirection, frameworkId: framework.id } }))}
                            className={`rounded-[24px] border p-5 text-left transition ${selected ? "border-cyan-300/60 bg-cyan-50/70 shadow-[0_16px_36px_rgba(34,211,238,0.12)]" : "border-slate-200/75 bg-white/84"}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-lg font-semibold text-slate-950">{framework.label}</p>
                              {recommended ? <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">Recommended</span> : null}
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{framework.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </PromptCard>
                  <PromptCard eyebrow="Experience" title="Choose the experience direction" description="This helps Neroa understand how polished, operational, or customer-facing the first release should feel.">
                    <ChoiceGrid items={realBuilderExperienceStyleOptions} selectedId={state.experienceDirection.experienceStyle} onSelect={(id) => setState((current) => ({ ...current, experienceDirection: { ...current.experienceDirection, experienceStyle: id } }))} />
                  </PromptCard>
                  <div className="grid gap-5 lg:grid-cols-3">
                    <PromptCard eyebrow="Platform" title="Platform style" description="Choose the platform posture for the first release.">
                      <ChoiceGrid items={realBuilderPlatformStyleOptions} selectedId={state.experienceDirection.platformStyle} onSelect={(id) => setState((current) => ({ ...current, experienceDirection: { ...current.experienceDirection, platformStyle: id } }))} columns="grid-cols-1" />
                    </PromptCard>
                    <PromptCard eyebrow="Automation" title="Automation needs" description="How strongly should automation shape the first plan?">
                      <ChoiceGrid items={realBuilderAutomationLevelOptions} selectedId={state.experienceDirection.automationLevel} onSelect={(id) => setState((current) => ({ ...current, experienceDirection: { ...current.experienceDirection, automationLevel: id } }))} columns="grid-cols-1" />
                    </PromptCard>
                    <PromptCard eyebrow="Complexity" title="Feature complexity" description="How deep should Neroa assume the first scope already is?">
                      <ChoiceGrid items={realBuilderComplexityOptions} selectedId={state.experienceDirection.complexityLevel} onSelect={(id) => setState((current) => ({ ...current, experienceDirection: { ...current.experienceDirection, complexityLevel: id } }))} columns="grid-cols-1" />
                    </PromptCard>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className="button-secondary" onClick={() => setActiveStep("project-definition")}>Back</button>
                    <button type="button" className="button-primary" disabled={!isFrameworkDirectionComplete(state)} onClick={() => setActiveStep("build-plan")}>
                      Generate build plan
                    </button>
                  </div>
                </div>
              </StepShell>
            ) : null}
            {activeStep === "build-plan" && plan ? (
              <StepShell
                stepNumber={5}
                title="Build Plan Output"
                summary="This is the structured plan page. Chat falls away here so the build direction, systems, estimate, and execution path read clearly."
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
                    <PromptCard eyebrow="Project summary" title={plan.title} description={plan.businessDirectionSummary}>
                      <p className="text-sm leading-7 text-slate-600">{plan.projectDefinitionSummary}</p>
                    </PromptCard>
                    <PromptCard eyebrow="Framework fit" title={plan.frameworkLabel} description={plan.frameworkSummary}>
                      <p className="text-sm leading-7 text-slate-600">{plan.experienceDirectionSummary}</p>
                    </PromptCard>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <PromptCard eyebrow="Likely systems" title="Systems and integrations Neroa expects" description="These are the likely systems based on the product type, business direction, framework, and integration needs you selected.">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {plan.systemCards.map((system) => (
                          <div key={system.label} className="rounded-[22px] border border-slate-200/75 bg-slate-50/80 p-4">
                            <p className="text-sm font-semibold text-slate-950">{system.label}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{system.role}</p>
                          </div>
                        ))}
                      </div>
                    </PromptCard>
                    <PromptCard eyebrow="Estimate" title={plan.estimateBaselineLabel} description={plan.estimateRangeLabel}>
                      <p className="text-sm leading-7 text-slate-600">{plan.timeEstimateLabel}</p>
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        Strong starting point: <span className="font-semibold text-slate-950">{plan.pricingStartingPointLabel}</span>. {plan.pricingStartingPointSummary}
                      </p>
                    </PromptCard>
                  </div>

                  <PromptCard eyebrow="Roadmap" title="Phased build path" description="Neroa now turns the product definition into a clearer phase sequence before execution begins.">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {plan.roadmap.map((phase) => (
                        <div key={phase.label} className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                          <p className="text-sm font-semibold text-slate-950">{phase.label}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{phase.summary}</p>
                        </div>
                      ))}
                    </div>
                  </PromptCard>

                  <PromptCard eyebrow="Build path" title={plan.recommendedPathLabel} description={plan.recommendedPathSummary}>
                    <div className="grid gap-4 lg:grid-cols-3">
                      {plan.pathOptions.map((path) => {
                        const active = effectivePath === path.id || (!effectivePath && path.recommended);
                        return (
                          <button
                            key={path.id}
                            type="button"
                            onClick={() => setSelectedExecutionPath(path.id)}
                            className={`rounded-[24px] border p-5 text-left transition ${active ? "border-cyan-300/60 bg-cyan-50/70 shadow-[0_16px_36px_rgba(34,211,238,0.12)]" : "border-slate-200/75 bg-white/84"}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-lg font-semibold text-slate-950">{path.label}</p>
                              {path.recommended ? <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">Recommended</span> : null}
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{path.summary}</p>
                            <div className="mt-4 space-y-1 text-sm leading-6 text-slate-500">
                              <p><span className="font-medium text-slate-950">Timeline:</span> {path.timeline}</p>
                              <p><span className="font-medium text-slate-950">Control:</span> {path.controlLevel}</p>
                              <p><span className="font-medium text-slate-950">Support:</span> {path.supportLevel}</p>
                              <p><span className="font-medium text-slate-950">Best for:</span> {path.bestFor}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </PromptCard>

                  <form action={startGuidedEngineWorkspaceAction} className="flex flex-wrap gap-3">
                    <input type="hidden" name="selectedPathId" value={effectivePath === "managed" ? "managed" : "diy"} />
                    <input type="hidden" name="selectedPathLabel" value={plan.pathOptions.find((path) => path.id === effectivePath)?.label ?? plan.recommendedPathLabel} />
                    <input type="hidden" name="buildSessionSnapshot" value={JSON.stringify(currentSession)} />
                    <input type="hidden" name="guidedBuildHandoff" value={currentHandoff ? JSON.stringify(currentHandoff) : ""} />
                    <SubmitWorkspaceButton />
                    <button type="button" className="button-secondary" onClick={() => setSavedNotice("Plan saved to this browser so you can return to it.")}>
                      Save plan
                    </button>
                    <button type="button" className="button-secondary" onClick={() => setActiveStep("project-definition")}>
                      Adjust scope
                    </button>
                    <Link href={effectivePath === "managed" ? "/managed-build" : "/pricing/diy"} className="button-secondary">
                      {effectivePath === "managed" ? "Explore managed path" : "Understand pricing"}
                    </Link>
                  </form>
                  {savedNotice ? <p className="text-sm leading-7 text-emerald-700">{savedNotice}</p> : null}
                </div>
              </StepShell>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <aside className="xl:sticky xl:top-28">
        <section className="section-stage px-5 py-5">
          <div className="floating-wash rounded-[32px]" />
          <div className="relative space-y-4">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              {entryPathId === "managed" ? "Managed build entry" : "Guided build entry"}
            </span>
            <p className="text-sm leading-7 text-slate-600">
              {entryPathId === "managed"
                ? "The setup and guided questions stay the same, but the build path is already being tracked as Managed while the plan takes shape."
                : "Step 1 stays structured. Guided chat starts in Step 2 and Step 3, then the build plan resolves the output in Step 5."}
            </p>
            <GuidedModeToggle guidedMode={guidedMode} onToggle={setGuidedMode} compact />
            <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">Selection summary</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{buildRealBuilderSelectionSummary(state) || "Choose product type and build stage to begin."}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">Neroa context</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{assistCopy[activeStep]}</p>
            </div>
            {resumeRequested && carriedSummary ? (
              <div className="rounded-[22px] border border-cyan-300/25 bg-cyan-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">Continuing from saved setup</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{carriedSummary}</p>
              </div>
            ) : null}
            {plan ? (
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">Build plan snapshot</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{plan.frameworkLabel}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{plan.estimateRangeLabel}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{plan.recommendedPathLabel}</p>
              </div>
            ) : null}
            {initialError ? <div className="rounded-[22px] border border-rose-200/80 bg-rose-50 p-4 text-sm text-rose-700">{initialError}</div> : null}
            {initialNotice ? <div className="rounded-[22px] border border-emerald-200/80 bg-emerald-50 p-4 text-sm text-emerald-700">{initialNotice}</div> : null}
            <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">Account</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{initialUserEmail ?? "Not signed in"}</p>
              <p className="mt-2 text-sm leading-7 text-slate-500">You can shape the plan here first. Sign-in only matters when you continue into the actual workspace.</p>
            </div>
          </div>
        </section>
      </aside>
    </section>
  );
}
