"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { BuildTypeSelector } from "@/components/example-build/BuildTypeSelector";
import { ExampleBuildBreakdown } from "@/components/example-build/ExampleBuildBreakdown";
import { ExampleFrameworkSelector } from "@/components/example-build/ExampleFrameworkSelector";
import { ExampleIntentSelector } from "@/components/example-build/ExampleIntentSelector";
import { ExampleProjectSelector } from "@/components/example-build/ExampleProjectSelector";
import {
  useAIOnboardingControl,
  type AIOnboardingStep
} from "@/components/onboarding/ai-onboarding-control-provider";
import { GuidedModeToggle } from "@/components/onboarding/guided-mode-toggle";
import {
  buildExampleSelectionSummary,
  exampleBuildTypes,
  exampleFrameworks,
  exampleIndustries,
  exampleOpportunityAreas,
  getExampleBuildFramework,
  getExampleBuildProject,
  getExampleBuildType,
  getExampleFrameworksForSelection,
  getExampleIntentOptions,
  getExampleProjectsForSelection,
  type ExampleBuildTypeId,
  type ExampleFrameworkId,
  type ExampleIndustryId,
  type ExampleIntentMode,
  type ExampleOpportunityAreaId
} from "@/lib/marketing/example-build-data";
import {
  createBuildSession,
  estimateCredits,
  recommendBuildPath,
  scopeProject
} from "@/lib/onboarding/build-session";

const entrySteps = [
  "Product Type",
  "Industry or Explore",
  "Framework",
  "Example Project",
  "Guided Breakdown"
] as const;

const stepContext = {
  1: {
    eyebrow: "Simulation start",
    title: "Choose the kind of product Neroa should simulate.",
    summary:
      "The first choice sets the product lane so the rest of the walkthrough can behave like a real planning system instead of a generic example picker.",
    nextAction: "Select SaaS, Internal Software, External App, or Mobile App.",
    preparing:
      "Naroa is narrowing the simulation to the right product lane before it chooses market context, framework, and example scope."
  },
  2: {
    eyebrow: "Market context",
    title: "Decide whether the simulation should follow a real industry or a hot opportunity area.",
    summary:
      "This is where the example starts feeling market-aware. Neroa needs either a real industry or an opportunity area before it can rank the right frameworks.",
    nextAction: "Choose an industry or a hot opportunity area.",
    preparing:
      "Naroa is narrowing the market context so the framework and example projects feel grounded in a real product direction."
  },
  3: {
    eyebrow: "Framework logic",
    title: "Pick the system framework Neroa should design around.",
    summary:
      "Framework selection replaces generic example logic. It decides the planning shape, the stack direction, and what belongs in the first build.",
    nextAction: "Select the framework that best matches the product system.",
    preparing:
      "Naroa is ranking the strongest system frameworks for this product type and market context."
  },
  4: {
    eyebrow: "Example shaping",
    title: "Choose the filtered example project that feels closest to your idea.",
    summary:
      "Now the simulation becomes personal. The example list is shaped by your product type, your market context, and the framework Neroa is designing around.",
    nextAction: "Pick the example project you want Neroa to break down.",
    preparing:
      "Naroa is preparing strategy, scope, MVP, stack direction, example credits, and build-path comparison for the selected example."
  },
  5: {
    eyebrow: "Guided breakdown",
    title: "See how Neroa turns the selected product system into a real build plan.",
    summary:
      "This is the full guided view: strategy, scope, MVP, stack recommendation, example credits, build pacing, and the handoff into the real builder.",
    nextAction: "Review the breakdown, compare build paths, and continue into the real build flow.",
    preparing:
      "Naroa is showing the full system plan, build path tradeoffs, and the continuation into the real guided build intake."
  }
} as const;

const onboardingStepMap: Record<1 | 2 | 3 | 4 | 5, AIOnboardingStep> = {
  1: "example-build-type",
  2: "example-build-intent",
  3: "example-build-framework",
  4: "example-build-project",
  5: "example-build-breakdown"
};

export function ExampleBuildEntry() {
  const {
    guidedMode,
    onboardingStep,
    userIntent,
    naroaContext,
    buildSession,
    setGuidedMode,
    setOnboardingStep,
    setUserIntent,
    setNaroaContext,
    setBuildSession,
    setGuidedBuildHandoff,
    clearGuidedBuildHandoff,
    syncCardInteraction
  } = useAIOnboardingControl();

  const [selectedProductTypeId, setSelectedProductTypeId] = useState<ExampleBuildTypeId | null>(null);
  const [intentMode, setIntentMode] = useState<ExampleIntentMode | null>(null);
  const [selectedIndustryId, setSelectedIndustryId] = useState<ExampleIndustryId | null>(null);
  const [selectedOpportunityAreaId, setSelectedOpportunityAreaId] = useState<ExampleOpportunityAreaId | null>(null);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<ExampleFrameworkId | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const intentSectionRef = useRef<HTMLDivElement | null>(null);
  const frameworkSectionRef = useRef<HTMLDivElement | null>(null);
  const projectSectionRef = useRef<HTMLDivElement | null>(null);
  const breakdownSectionRef = useRef<HTMLDivElement | null>(null);

  const intentOptions = useMemo(() => getExampleIntentOptions(), []);
  const selectedProductType = selectedProductTypeId ? getExampleBuildType(selectedProductTypeId) : null;
  const selectedIndustry = selectedIndustryId
    ? exampleIndustries.find((industry) => industry.id === selectedIndustryId) ?? null
    : null;
  const selectedOpportunityArea = selectedOpportunityAreaId
    ? exampleOpportunityAreas.find((opportunity) => opportunity.id === selectedOpportunityAreaId) ?? null
    : null;
  const frameworks = useMemo(
    () =>
      getExampleFrameworksForSelection({
        productTypeId: selectedProductTypeId,
        intentMode,
        industryId: selectedIndustryId,
        opportunityAreaId: selectedOpportunityAreaId
      }),
    [intentMode, selectedIndustryId, selectedOpportunityAreaId, selectedProductTypeId]
  );
  const selectedFramework = selectedFrameworkId ? getExampleBuildFramework(selectedFrameworkId) : null;
  const projects = useMemo(
    () =>
      getExampleProjectsForSelection({
        productTypeId: selectedProductTypeId,
        intentMode,
        industryId: selectedIndustryId,
        opportunityAreaId: selectedOpportunityAreaId,
        frameworkId: selectedFrameworkId
      }),
    [intentMode, selectedFrameworkId, selectedIndustryId, selectedOpportunityAreaId, selectedProductTypeId]
  );
  const selectedProject = selectedProjectId ? getExampleBuildProject(selectedProjectId) : null;

  const currentStep = selectedProject
    ? 5
    : selectedFramework
      ? 4
      : intentMode && (selectedIndustry || selectedOpportunityArea)
        ? 3
        : selectedProductType
          ? 2
          : 1;
  const currentContext = stepContext[currentStep];
  const selectionSummary = buildExampleSelectionSummary({
    productType: selectedProductType,
    intentMode,
    industry: selectedIndustry,
    opportunityArea: selectedOpportunityArea,
    framework: selectedFramework,
    project: selectedProject
  });
  const recommendedPath =
    selectedProject?.buildPaths.find((path) => path.recommended)?.label ??
    "Appears after the example project is selected";
  const assistMessage = useMemo(() => {
    if (!guidedMode) {
      return "Self mode is active. The UI will keep progressing normally, but Naroa will stay quiet until you switch guided mode back on.";
    }

    return naroaContext ?? currentContext.preparing;
  }, [currentContext.preparing, guidedMode, naroaContext]);

  useEffect(() => {
    if (!buildSession) {
      return;
    }

    if (buildSession.source !== "example-build" && buildSession.progress.phase !== "example-build") {
      return;
    }

    if (!selectedProductTypeId) {
      const nextProductType =
        (buildSession.scope.productTypeId as ExampleBuildTypeId | undefined) ??
        (buildSession.scope.buildTypeId as ExampleBuildTypeId | undefined);

      if (nextProductType && getExampleBuildType(nextProductType)) {
        setSelectedProductTypeId(nextProductType);
      }
    }

    if (!intentMode && buildSession.scope.intentMode) {
      setIntentMode(buildSession.scope.intentMode);
    }

    if (!selectedIndustryId && buildSession.scope.industryId) {
      const nextIndustryId = buildSession.scope.industryId as ExampleIndustryId;

      if (exampleIndustries.some((industry) => industry.id === nextIndustryId)) {
        setSelectedIndustryId(nextIndustryId);
      }
    }

    if (!selectedOpportunityAreaId && buildSession.scope.opportunityAreaId) {
      const nextOpportunityAreaId = buildSession.scope.opportunityAreaId as ExampleOpportunityAreaId;

      if (exampleOpportunityAreas.some((opportunity) => opportunity.id === nextOpportunityAreaId)) {
        setSelectedOpportunityAreaId(nextOpportunityAreaId);
      }
    }

    if (!selectedFrameworkId && buildSession.scope.frameworkId) {
      const nextFrameworkId = buildSession.scope.frameworkId as ExampleFrameworkId;

      if (getExampleBuildFramework(nextFrameworkId)) {
        setSelectedFrameworkId(nextFrameworkId);
      }
    }

    if (!selectedProjectId && buildSession.scope.exampleId) {
      const nextProjectId = buildSession.scope.exampleId;

      if (nextProjectId && getExampleBuildProject(nextProjectId)) {
        setSelectedProjectId(nextProjectId);
      }
    }
  }, [
    buildSession,
    intentMode,
    selectedFrameworkId,
    selectedIndustryId,
    selectedOpportunityAreaId,
    selectedProductTypeId,
    selectedProjectId
  ]);

  useEffect(() => {
    setOnboardingStep(onboardingStepMap[currentStep]);

    if (currentStep === 1 && !userIntent) {
      setUserIntent("Explore how Neroa turns product systems into real build plans");
    }
  }, [currentStep, setOnboardingStep, setUserIntent, userIntent]);

  function scrollToTarget(target: HTMLDivElement | null) {
    if (!target) {
      return;
    }

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function buildPreferenceList() {
    return [
      guidedMode ? "Guided mode active" : "Self mode active",
      "Example Build walkthrough",
      intentMode === "known-industry" ? "Industry-led simulation" : "Opportunity-led simulation"
    ].filter(Boolean) as string[];
  }

  function saveExampleBuildHandoff(args?: {
    selectedPathId?: "diy" | "managed" | "pricing";
    selectedPathLabel?: string;
    nextIntent?: string;
  }) {
    if (!selectedProductType && !selectedProject && !selectedFramework && !selectedIndustry && !selectedOpportunityArea) {
      clearGuidedBuildHandoff();
      return;
    }

    const recommendedExamplePath = selectedProject?.buildPaths.find((path) => path.recommended) ?? null;

    setGuidedBuildHandoff({
      source: "example-build",
      productTypeId: selectedProductType?.id,
      productTypeLabel: selectedProductType?.label,
      buildTypeId: selectedProductType?.id,
      buildTypeLabel: selectedProductType?.label,
      intentMode: intentMode ?? undefined,
      industryId: selectedIndustry?.id,
      industryLabel: selectedIndustry?.label,
      opportunityAreaId: selectedOpportunityArea?.id,
      opportunityAreaLabel: selectedOpportunityArea?.label,
      frameworkId: selectedFramework?.id,
      frameworkLabel: selectedFramework?.label,
      exampleId: selectedProject?.id,
      exampleLabel: selectedProject?.title,
      selectedPathId: args?.selectedPathId,
      selectedPathLabel: args?.selectedPathLabel,
      recommendedPathId:
        recommendedExamplePath?.id === "managed"
          ? "managed"
          : recommendedExamplePath
            ? "diy"
            : undefined,
      recommendedPathLabel: recommendedExamplePath?.label,
      stackRecommendationLabel: selectedProject?.stackRecommendation.headline,
      stackRecommendationSummary: selectedProject?.stackRecommendation.summary,
      stackSystems: selectedProject?.stackRecommendation.systems.map((system) => system.label),
      preferences: buildPreferenceList(),
      userIntent: args?.nextIntent ?? userIntent,
      onboardingStep
    });
  }

  function persistExampleSession(args?: {
    selectedPathId?: "diy" | "managed" | "pricing";
    selectedPathLabel?: string;
    nextIntent?: string;
  }) {
    const sessionStep = currentStep;

    setBuildSession(
      createBuildSession({
        sessionId: buildSession?.sessionId,
        source: "example-build",
        userIntent: args?.nextIntent ?? userIntent,
        preferences: buildPreferenceList(),
        guidedMode,
        scope: scopeProject({
          productTypeId: selectedProductType?.id,
          productTypeLabel: selectedProductType?.label,
          buildTypeId: selectedProductType?.id,
          buildTypeLabel: selectedProductType?.label,
          selection: {
            productTypeId: selectedProductType?.id,
            intentMode,
            industryId: selectedIndustry?.id,
            opportunityAreaId: selectedOpportunityArea?.id,
            frameworkId: selectedFramework?.id,
            exampleProjectId: selectedProject?.id
          },
          stackRecommendation: selectedProject?.stackRecommendation,
          project: selectedProject,
          userIntent: args?.nextIntent ?? userIntent
        }),
        credits: estimateCredits({ project: selectedProject }),
        path: recommendBuildPath({
          selectedPathId: args?.selectedPathId,
          selectedPathLabel: args?.selectedPathLabel,
          project: selectedProject
        }),
        progress: {
          phase: "example-build",
          currentStep: onboardingStepMap[sessionStep],
          currentStepLabel: entrySteps[sessionStep - 1],
          currentRoute: "/example-build",
          completedSteps: entrySteps.slice(0, sessionStep - 1).map((step) => step)
        }
      })
    );
  }

  function handleTypeSelect(typeId: ExampleBuildTypeId) {
    const type = getExampleBuildType(typeId);
    const nextIntent = type ? `Plan a ${type.label} product system` : "Plan a product system";

    setSelectedProductTypeId(typeId);
    setIntentMode(null);
    setSelectedIndustryId(null);
    setSelectedOpportunityAreaId(null);
    setSelectedFrameworkId(null);
    setSelectedProjectId(null);

    syncCardInteraction({
      onboardingStep: "example-build-intent",
      userIntent: nextIntent,
      assistMessage: type
        ? `Naroa narrowed the simulation to ${type.label}. Next, choose whether this should follow a real industry or a hot opportunity area so the framework logic can become more specific.`
        : currentContext.preparing
    });

    window.setTimeout(() => {
      scrollToTarget(intentSectionRef.current);
    }, 60);
  }

  function handleModeSelect(mode: ExampleIntentMode) {
    const nextIntent =
      mode === "known-industry"
        ? `Choose a real industry for this ${selectedProductType?.label ?? "product"} system`
        : `Explore opportunity areas for this ${selectedProductType?.label ?? "product"} system`;

    setIntentMode(mode);
    setSelectedIndustryId(null);
    setSelectedOpportunityAreaId(null);
    setSelectedFrameworkId(null);
    setSelectedProjectId(null);

    syncCardInteraction({
      onboardingStep: "example-build-intent",
      userIntent: nextIntent,
      assistMessage:
        mode === "known-industry"
          ? "Naroa is waiting for the exact market so it can rank the strongest frameworks for that industry."
          : "Naroa is waiting for the opportunity zone so it can recommend a system framework that makes commercial sense."
    });
  }

  function handleIndustrySelect(industryId: ExampleIndustryId) {
    const industry = exampleIndustries.find((item) => item.id === industryId) ?? null;
    const nextIntent = industry
      ? `Review ${industry.label} frameworks for ${selectedProductType?.label ?? "this"}`
      : "Review industry-fit frameworks";

    setSelectedIndustryId(industryId);
    setSelectedOpportunityAreaId(null);
    setSelectedFrameworkId(null);
    setSelectedProjectId(null);

    syncCardInteraction({
      onboardingStep: "example-build-framework",
      userIntent: nextIntent,
      assistMessage: industry
        ? `Naroa is ranking frameworks for ${industry.label} so the example build feels like a real system plan instead of a generic preset.`
        : stepContext[3].preparing
    });

    window.setTimeout(() => {
      scrollToTarget(frameworkSectionRef.current);
    }, 60);
  }

  function handleOpportunityAreaSelect(opportunityAreaId: ExampleOpportunityAreaId) {
    const opportunityArea =
      exampleOpportunityAreas.find((item) => item.id === opportunityAreaId) ?? null;
    const nextIntent = opportunityArea
      ? `Review ${opportunityArea.label} frameworks for ${selectedProductType?.label ?? "this"}`
      : "Review opportunity-fit frameworks";

    setSelectedOpportunityAreaId(opportunityAreaId);
    setSelectedIndustryId(null);
    setSelectedFrameworkId(null);
    setSelectedProjectId(null);

    syncCardInteraction({
      onboardingStep: "example-build-framework",
      userIntent: nextIntent,
      assistMessage: opportunityArea
        ? `Naroa is ranking frameworks for ${opportunityArea.label} so the example build feels commercially grounded before the project examples appear.`
        : stepContext[3].preparing
    });

    window.setTimeout(() => {
      scrollToTarget(frameworkSectionRef.current);
    }, 60);
  }

  function handleFrameworkSelect(frameworkId: ExampleFrameworkId) {
    const framework = getExampleBuildFramework(frameworkId);
    const nextIntent = framework
      ? `Review ${framework.label} example projects`
      : "Review filtered example projects";

    setSelectedFrameworkId(frameworkId);
    setSelectedProjectId(null);

    syncCardInteraction({
      onboardingStep: "example-build-project",
      userIntent: nextIntent,
      assistMessage: framework
        ? `Naroa is filtering example projects through ${framework.label} so the next choices feel like product systems, not generic presets.`
        : stepContext[4].preparing
    });

    saveExampleBuildHandoff({ nextIntent });
    persistExampleSession({ nextIntent });

    window.setTimeout(() => {
      scrollToTarget(projectSectionRef.current);
    }, 80);
  }

  function handleProjectSelect(projectId: string) {
    const project = getExampleBuildProject(projectId);
    const nextIntent = project ? `Review the ${project.title} example build` : "Review the example build";

    setSelectedProjectId(projectId);

    syncCardInteraction({
      onboardingStep: "example-build-breakdown",
      userIntent: nextIntent,
      assistMessage: project
        ? `Naroa is expanding ${project.title} into strategy, scope, MVP, stack direction, example credits, and build-path choices so you can compare the real next move.`
        : stepContext[5].preparing
    });

    window.setTimeout(() => {
      scrollToTarget(breakdownSectionRef.current);
    }, 90);
  }

  function handleBackToTypes() {
    setSelectedProductTypeId(null);
    setIntentMode(null);
    setSelectedIndustryId(null);
    setSelectedOpportunityAreaId(null);
    setSelectedFrameworkId(null);
    setSelectedProjectId(null);
    clearGuidedBuildHandoff();
    setBuildSession(null);
    syncCardInteraction({
      onboardingStep: "example-build-type",
      userIntent: "Compare example build product types",
      assistMessage: stepContext[1].preparing
    });
  }

  function handleBackToIntent() {
    setIntentMode(null);
    setSelectedIndustryId(null);
    setSelectedOpportunityAreaId(null);
    setSelectedFrameworkId(null);
    setSelectedProjectId(null);
    saveExampleBuildHandoff({
      nextIntent: selectedProductType
        ? `Choose market context for ${selectedProductType.label}`
        : "Choose market context"
    });
    persistExampleSession({
      nextIntent: selectedProductType
        ? `Choose market context for ${selectedProductType.label}`
        : "Choose market context"
    });
    syncCardInteraction({
      onboardingStep: "example-build-intent",
      userIntent: selectedProductType
        ? `Choose market context for ${selectedProductType.label}`
        : "Choose market context",
      assistMessage: stepContext[2].preparing
    });
  }

  function handleBackToFrameworks() {
    setSelectedFrameworkId(null);
    setSelectedProjectId(null);
    saveExampleBuildHandoff({
      nextIntent: "Compare system frameworks"
    });
    persistExampleSession({
      nextIntent: "Compare system frameworks"
    });
    syncCardInteraction({
      onboardingStep: "example-build-framework",
      userIntent: "Compare system frameworks",
      assistMessage: stepContext[3].preparing
    });
    scrollToTarget(frameworkSectionRef.current);
  }

  function handleBackToProjects() {
    setSelectedProjectId(null);
    saveExampleBuildHandoff({
      nextIntent: "Compare filtered example projects"
    });
    persistExampleSession({
      nextIntent: "Compare filtered example projects"
    });
    syncCardInteraction({
      onboardingStep: "example-build-project",
      userIntent: "Compare filtered example projects",
      assistMessage: stepContext[4].preparing
    });
    scrollToTarget(projectSectionRef.current);
  }

  useEffect(() => {
    saveExampleBuildHandoff();
    persistExampleSession();
  }, [
    currentStep,
    guidedMode,
    intentMode,
    selectedFramework,
    selectedIndustry,
    selectedOpportunityArea,
    selectedProductType,
    selectedProject,
    userIntent
  ]);

  return (
    <section
      id="example-build-entry"
      className="mt-14 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_390px] xl:items-start"
    >
      <div className="space-y-6">
        <section className="section-stage px-6 py-7 sm:px-8 sm:py-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] lg:items-start">
            <div>
              <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                Guided AI build simulation
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Follow the same structured planning order Neroa uses before a real build starts.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                This is no longer a generic example-first walkthrough. Neroa starts with product
                type, then market context, then framework logic, then filtered example projects,
                and only then opens the guided breakdown, stack direction, credits, and build paths.
              </p>

              <div className="comparison-band mt-6">
                <div className="comparison-metric">
                  <span className="comparison-label">Product first</span>
                  <span className="comparison-value">
                    The product type sets the lane before the example list appears.
                  </span>
                </div>
                <div className="comparison-metric">
                  <span className="comparison-label">Framework before project</span>
                  <span className="comparison-value">
                    Neroa chooses the system logic before you look at example builds.
                  </span>
                </div>
                <div className="comparison-metric">
                  <span className="comparison-label">Real continuation</span>
                  <span className="comparison-value">
                    The final handoff carries the simulation state into the real build intake.
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Product lanes
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {exampleBuildTypes.length}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  SaaS, Internal Software, External App, and Mobile App.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Market contexts
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {exampleIndustries.length + exampleOpportunityAreas.length}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Real industries plus hot opportunity areas that shape the framework logic.
                </p>
              </div>
              <div className="rounded-[24px] border border-cyan-300/24 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.86))] px-5 py-5 shadow-[0_18px_40px_rgba(34,211,238,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  System frameworks
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {exampleFrameworks.length}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Framework logic replaces generic preset logic before example projects appear.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="floating-plane rounded-[30px] p-5 sm:p-6">
          <div className="floating-wash rounded-[30px]" />
          <div className="relative">
            <div className="flow-ribbon">
              {entrySteps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isComplete = stepNumber < currentStep;

                return (
                  <motion.div
                    key={step}
                    layout
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className={`flow-ribbon-item ${
                      isActive
                        ? "border-cyan-300/50 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.88))] text-slate-950 shadow-[0_18px_36px_rgba(34,211,238,0.1)]"
                        : isComplete
                          ? "border-cyan-200/60 bg-cyan-50/70 text-slate-700"
                          : ""
                    }`}
                  >
                    <span className="flow-ribbon-index">{stepNumber}</span>
                    <span>{step}</span>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
              className="comparison-band mt-5"
            >
              <div className="comparison-metric">
                <span className="comparison-label">{currentContext.eyebrow}</span>
                <span className="comparison-value">{currentContext.title}</span>
              </div>
              <div className="comparison-metric">
                <span className="comparison-label">What this step does</span>
                <span className="comparison-value">{currentContext.summary}</span>
              </div>
              <div className="comparison-metric">
                <span className="comparison-label">Next action</span>
                <span className="comparison-value">{currentContext.nextAction}</span>
              </div>
            </motion.div>
          </div>
        </section>

        <div ref={intentSectionRef} />

        <AnimatePresence mode="wait">
          {!selectedProductType ? (
            <motion.div
              key="type-selector"
              initial={{ opacity: 0, y: 22, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.992 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <BuildTypeSelector
                types={exampleBuildTypes}
                selectedTypeId={selectedProductTypeId}
                onSelect={handleTypeSelect}
              />
            </motion.div>
          ) : !selectedFramework ? (
            <motion.div
              key="intent-framework"
              initial={{ opacity: 0, y: 22, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.992 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <ExampleIntentSelector
                buildType={selectedProductType}
                intentOptions={intentOptions}
                intentMode={intentMode}
                industries={exampleIndustries}
                selectedIndustryId={selectedIndustryId}
                opportunities={exampleOpportunityAreas}
                selectedOpportunityAreaId={selectedOpportunityAreaId}
                onModeSelect={handleModeSelect}
                onIndustrySelect={handleIndustrySelect}
                onOpportunitySelect={handleOpportunityAreaSelect}
                onBack={handleBackToTypes}
              />

              {intentMode && (selectedIndustry || selectedOpportunityArea) ? (
                <>
                  <div ref={frameworkSectionRef} />
                  <ExampleFrameworkSelector
                    buildType={selectedProductType}
                    industry={selectedIndustry}
                    opportunityArea={selectedOpportunityArea}
                    frameworks={frameworks}
                    selectedFrameworkId={selectedFrameworkId}
                    onBack={handleBackToIntent}
                    onSelect={handleFrameworkSelect}
                  />
                </>
              ) : null}
            </motion.div>
          ) : !selectedProject ? (
            <motion.div
              key="project-selector"
              initial={{ opacity: 0, y: 22, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.992 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div ref={projectSectionRef} />
              <ExampleProjectSelector
                buildType={selectedProductType}
                industry={selectedIndustry}
                opportunityArea={selectedOpportunityArea}
                framework={selectedFramework}
                projects={projects}
                selectedProjectId={selectedProjectId}
                onBack={handleBackToFrameworks}
                onSelect={handleProjectSelect}
              />
            </motion.div>
          ) : (
            <motion.div
              key="build-breakdown"
              initial={{ opacity: 0, y: 22, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.992 }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <div ref={breakdownSectionRef} />
              <ExampleBuildBreakdown
                buildType={selectedProductType}
                industry={selectedIndustry}
                opportunityArea={selectedOpportunityArea}
                framework={selectedFramework}
                project={selectedProject}
                onBackToProjects={handleBackToProjects}
                onBackToFrameworks={handleBackToFrameworks}
                onBackToIntent={handleBackToIntent}
                onBackToTypes={handleBackToTypes}
                onSelectPath={(pathId, pathLabel) =>
                  saveExampleBuildHandoff({
                    selectedPathId: pathId,
                    selectedPathLabel: pathLabel
                  })
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.aside layout className="xl:sticky xl:top-28">
        <div className="section-stage px-6 py-6">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Example build guide
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentStep}-${selectedProductTypeId ?? "none"}-${selectedFrameworkId ?? "none"}-${selectedProjectId ?? "none"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24 }}
              >
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                  {currentContext.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{currentContext.summary}</p>

                <div className="mt-6 rounded-[24px] border border-cyan-300/24 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.86))] px-5 py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    What Naroa is preparing
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{assistMessage}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6">
              <GuidedModeToggle
                guidedMode={guidedMode}
                onToggle={(next) => {
                  setGuidedMode(next);

                  if (next) {
                    setNaroaContext(currentContext.preparing);
                  } else {
                    setNaroaContext(null);
                  }
                }}
              />
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Current step
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {entrySteps[currentStep - 1]}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Product type
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {selectedProductType?.label ?? "Not selected yet"}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Industry or opportunity
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {selectedIndustry?.label ?? selectedOpportunityArea?.label ?? "Choose the market context next"}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Framework
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {selectedFramework?.label ?? "Not selected yet"}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Example project
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {selectedProject?.title ?? "Choose a scenario next"}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Control layer
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {guidedMode ? "Guided mode is active" : "Self mode is active"}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Onboarding state
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{onboardingStep}</p>
              </div>
              <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  User intent
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {userIntent || "Not captured yet"}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Build path recommendation
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{recommendedPath}</p>
              </div>
            </div>

            <div className="comparison-band mt-6">
              <div className="comparison-metric">
                <span className="comparison-label">Selection summary</span>
                <span className="comparison-value">
                  {selectionSummary || "Make the first product choice to start the simulation."}
                </span>
              </div>
              <div className="comparison-metric">
                <span className="comparison-label">Available projects</span>
                <span className="comparison-value">
                  {selectedFramework ? `${projects.length} filtered examples` : "Choose a framework first"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </section>
  );
}
