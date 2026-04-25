"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ExampleBuildEntrySidebar } from "@/components/example-build/example-build-entry-sidebar";
import { ExampleBuildEntrySteps } from "@/components/example-build/example-build-entry-steps";
import {
  useAIOnboardingControl,
  type AIOnboardingStep
} from "@/components/onboarding/ai-onboarding-control-provider";
import {
  buildBuildSessionSummary,
  saveSession,
  type GuidedBuildSession
} from "@/lib/onboarding/build-session";
import { buildGuidedBuildHandoffSummary } from "@/lib/onboarding/guided-handoff";
import {
  buildRealBuilderHandoff,
  buildRealBuilderPlan,
  buildRealBuilderSession,
  createEmptyRealBuilderState,
  deriveRealBuilderCurrentStep,
  getRealBuilderFrameworkRecommendations,
  getRealBuilderReferenceProject,
  realBuilderBuildStages,
  realBuilderSteps,
  restoreRealBuilderStateFromSession,
  type RealBuilderExecutionPathId,
  type RealBuilderState,
  type RealBuilderStepId
} from "@/lib/onboarding/real-diy-builder";
import { exampleBuildTypes } from "@/lib/marketing/example-build-data";

function restoreSelectedPath(session: GuidedBuildSession | null, handoffLabel?: string | null) {
  const label = (session?.path.selectedPathLabel ?? handoffLabel ?? "").toLowerCase();
  if (label.includes("managed")) return "managed" as const;
  if (label.includes("accelerated")) return "diy-accelerated" as const;
  if (label.includes("diy")) return "diy-slower" as const;
  return null;
}

const stepMap: Record<RealBuilderStepId, AIOnboardingStep> = {
  "build-setup": "example-build-setup",
  "business-direction": "example-build-business-direction",
  "project-definition": "example-build-project-definition",
  "framework-direction": "example-build-framework-direction",
  "build-plan": "example-build-plan"
};

const assistCopy: Record<RealBuilderStepId, string> = {
  "build-setup":
    "Neroa is anchoring the simulation with the same product lane and build depth the real builder now uses.",
  "business-direction":
    "Neroa is simulating the same business-direction questions the real builder uses before product scope gets narrower.",
  "project-definition":
    "Neroa is turning the simulated product into a more serious project definition so the plan can feel grounded rather than generic.",
  "framework-direction":
    "Neroa is matching the simulated product definition to the strongest framework and experience posture before the plan resolves.",
  "build-plan":
    "Neroa is showing the simulated build plan output using the same architecture as the real builder, while keeping the project match and estimates clearly illustrative."
};

export function ExampleBuildEntry() {
  const router = useRouter();
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
  const [selectedExecutionPath, setSelectedExecutionPath] = useState<RealBuilderExecutionPathId | null>(
    null
  );
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [restoredFromSaved, setRestoredFromSaved] = useState(false);

  useEffect(() => {
    if (hydrated) return;

    const hasSavedSimulation =
      buildSession?.source === "example-build" || guidedBuildHandoff?.source === "example-build";

    if (hasSavedSimulation) {
      const restored = restoreRealBuilderStateFromSession({ buildSession, guidedBuildHandoff });
      setState(restored);
      setActiveStep(deriveRealBuilderCurrentStep(restored));
      setSelectedExecutionPath(restoreSelectedPath(buildSession, guidedBuildHandoff?.selectedPathLabel));
      setRestoredFromSaved(true);
    } else {
      setState(createEmptyRealBuilderState());
      setActiveStep("build-setup");
      setSelectedExecutionPath(null);
      setRestoredFromSaved(false);
    }

    setHydrated(true);
  }, [buildSession, guidedBuildHandoff, hydrated]);

  const derivedStep = deriveRealBuilderCurrentStep(state);
  const frameworkRecommendations = useMemo(() => getRealBuilderFrameworkRecommendations(state), [state]);
  const referenceProject = useMemo(() => getRealBuilderReferenceProject(state), [state]);
  const plan = useMemo(() => buildRealBuilderPlan(state), [state]);
  const effectivePath = selectedExecutionPath ?? plan?.recommendedPathId ?? null;
  const currentSession = useMemo(
    () =>
      buildRealBuilderSession({
        state,
        selectedPathId: effectivePath,
        currentRoute: "/start",
        currentStep: activeStep,
        sessionId: buildSession?.source === "example-build" ? buildSession.sessionId : undefined,
        source: "example-build"
      }),
    [activeStep, buildSession?.sessionId, buildSession?.source, effectivePath, state]
  );
  const currentHandoff = useMemo(
    () =>
      buildRealBuilderHandoff({
        state,
        selectedPathId: effectivePath,
        source: "example-build"
      }),
    [effectivePath, state]
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
    else if (guidedBuildHandoff?.source === "example-build") clearGuidedBuildHandoff();
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

  function resetSimulation() {
    setState(createEmptyRealBuilderState());
    setActiveStep("build-setup");
    setSelectedExecutionPath(null);
    setSavedNotice(null);
    setRestoredFromSaved(false);
    if (buildSession?.source === "example-build") clearBuildSession();
    if (guidedBuildHandoff?.source === "example-build") clearGuidedBuildHandoff();
    setOnboardingStep("example-build-setup");
    setUserIntent("Simulate a build plan before entering the real builder");
    setNaroaContext(assistCopy["build-setup"]);
  }

  function persistForRoute(args: {
    href: string;
    selectedPathId?: RealBuilderExecutionPathId | null;
    selectedPathLabel?: string;
  }) {
    const nextPathId = args.selectedPathId ?? effectivePath;
    const handoffSource = args.href.startsWith("/start") ? "start" : "example-build";
    const nextSession = buildRealBuilderSession({
      state,
      selectedPathId: nextPathId,
      currentRoute: args.href,
      currentStep: activeStep,
      sessionId: currentSession.sessionId,
      source: handoffSource
    });
    const nextHandoff = buildRealBuilderHandoff({
      state,
      selectedPathId: nextPathId,
      source: handoffSource
    });

    setBuildSession(nextSession);
    saveSession(nextSession);

    if (nextHandoff) {
      const persistedHandoff = {
        ...nextHandoff,
        selectedPathLabel: args.selectedPathLabel ?? nextHandoff.selectedPathLabel
      };
      setGuidedBuildHandoff(persistedHandoff);

      try {
        window.localStorage.setItem(
          "neroa:ai-onboarding-control",
          JSON.stringify({
            guidedMode,
            onboardingStep: stepMap[activeStep],
            userIntent: plan?.userIntent ?? state.businessDirection.businessGoal,
            guidedBuildHandoff: persistedHandoff
          })
        );
      } catch {}
    }

    router.push(args.href);

    window.setTimeout(() => {
      const currentHref = `${window.location.pathname}${window.location.search}`;
      if (currentHref !== args.href) {
        window.location.assign(args.href);
      }
    }, 120);
  }

  if (!hydrated) {
    return (
      <section className="section-stage px-6 py-8 sm:px-8 sm:py-10">
        <p className="text-sm leading-7 text-slate-600">
          Loading the aligned example-build simulation...
        </p>
      </section>
    );
  }

  const stepIndex = Math.max(realBuilderSteps.findIndex((step) => step.id === activeStep), 0);
  const unlockedCount = Math.max(
    realBuilderSteps.findIndex((step) => step.id === derivedStep) + 1,
    1
  );

  return (
    <section
      id="example-build-entry"
      className="mt-14 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]"
    >
      <div className="space-y-6">
        <section className="section-stage px-6 py-7 sm:px-8 sm:py-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <div>
              <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                Example Build simulation
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                The simulation now follows the exact same build architecture as the real DIY builder.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                Start with Build Setup, move through Business Direction and Project Definition,
                choose the Framework + Experience Direction, and then review a simulated Build Plan
                Output that matches the same structure Neroa uses in the real flow.
              </p>

              <div className="comparison-band mt-6">
                <div className="comparison-metric">
                  <span className="comparison-label">Same step order</span>
                  <span className="comparison-value">
                    No separate example-project decision maze anymore.
                  </span>
                </div>
                <div className="comparison-metric">
                  <span className="comparison-label">Same state model</span>
                  <span className="comparison-value">
                    Product type, build stage, business direction, project definition, framework,
                    and path logic now line up with the real builder.
                  </span>
                </div>
                <div className="comparison-metric">
                  <span className="comparison-label">Simulation only where appropriate</span>
                  <span className="comparison-value">
                    The final plan still marks the reference project and estimates as illustrative.
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
                  The same four product lanes the real builder anchors on in Step 1.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Guided stages
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {realBuilderSteps.length}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  The simulation and the real builder now use the same five-stage progression.
                </p>
              </div>
              <div className="rounded-[24px] border border-cyan-300/24 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.86))] px-5 py-5 shadow-[0_18px_40px_rgba(34,211,238,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Final output
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Simulated
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Reference project matching and estimates are illustrative, not live scoped.
                </p>
              </div>
            </div>
          </div>
        </section>

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
                    className={`flow-ribbon-item text-left ${
                      active
                        ? "border-cyan-300/50 bg-cyan-50/70 text-slate-950"
                        : complete
                          ? "border-cyan-200/60 bg-white/86 text-slate-700"
                          : ""
                    } ${!unlocked ? "cursor-not-allowed opacity-45" : ""}`}
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
            <ExampleBuildEntrySteps
              activeStep={activeStep}
              state={state}
              setState={setState}
              setActiveStep={setActiveStep}
              frameworkRecommendations={frameworkRecommendations}
              plan={plan}
              referenceProject={referenceProject}
              effectivePath={effectivePath}
              setSelectedExecutionPath={setSelectedExecutionPath}
              savedNotice={savedNotice}
              persistForRoute={persistForRoute}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <ExampleBuildEntrySidebar
        guidedMode={guidedMode}
        setGuidedMode={setGuidedMode}
        state={state}
        assistMessage={assistCopy[activeStep]}
        restoredFromSaved={restoredFromSaved}
        carriedSummary={carriedSummary}
        referenceProject={referenceProject}
        plan={plan}
        onReset={resetSimulation}
        onSave={() =>
          setSavedNotice("The aligned example-build simulation is already saved in this browser.")
        }
      />
    </section>
  );
}
