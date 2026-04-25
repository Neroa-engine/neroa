"use client";

import { useRouter } from "next/navigation";
import { useAIOnboardingControl } from "@/components/onboarding/ai-onboarding-control-provider";
import { storePublicEntryIntent } from "@/lib/front-door/public-entry-intent";
import {
  createBuildSession,
  estimateCredits,
  recommendBuildPath,
  scopeProject
} from "@/lib/onboarding/build-session";
import {
  publicLaunchManagedCta,
  publicLaunchPrimaryCta
} from "@/lib/data/public-launch";
import type {
  ExampleBuildProject,
  ExampleBuildType,
  ExampleFramework,
  ExampleIndustry,
  ExampleOpportunityArea
} from "@/lib/marketing/example-build-data";

const conversionChoices = [
  {
    title: publicLaunchPrimaryCta.label,
    description:
      "Open the real guided build flow, define your product, and let Neroa scope the work around your budget and pace.",
    href: publicLaunchPrimaryCta.href,
    tone: "primary",
    pathId: "diy",
    pathLabel: "DIY Build"
  },
  {
    title: publicLaunchManagedCta.label,
    description:
      "Open the shared guided intake with the Managed lane already carried forward so scope, support, and roadmap logic stay aligned.",
    href: publicLaunchManagedCta.href,
    tone: "secondary",
    pathId: "managed",
    pathLabel: "Managed Build"
  },
  {
    title: "Understand Pricing",
    description:
      "Compare monthly Engine Credits, build pacing, and the difference between DIY capacity and managed execution.",
    href: "/pricing",
    tone: "secondary",
    pathId: "pricing",
    pathLabel: "Pricing"
  }
] as const;

export function ExampleBuildFinalCTA({
  buildType,
  industry,
  opportunityArea,
  framework,
  project,
  onSelectPath
}: {
  buildType: ExampleBuildType;
  industry: ExampleIndustry | null;
  opportunityArea: ExampleOpportunityArea | null;
  framework: ExampleFramework;
  project: ExampleBuildProject;
  onSelectPath: (pathId: "diy" | "managed" | "pricing", pathLabel: string) => void;
}) {
  const router = useRouter();
  const {
    guidedMode,
    userIntent,
    onboardingStep,
    buildSession,
    setBuildSession,
    setGuidedBuildHandoff
  } = useAIOnboardingControl();

  function handleChoiceClick(choice: (typeof conversionChoices)[number]) {
    const nextIntent =
      userIntent.trim() ||
      `Continue from the ${project.title} example into the ${choice.pathLabel.toLowerCase()} path.`;
    const recommendedExamplePath = project.buildPaths.find((path) => path.recommended) ?? null;

    onSelectPath(choice.pathId, choice.pathLabel);
    if (choice.pathId === "managed" || choice.pathId === "diy") {
      storePublicEntryIntent(choice.pathId);
    }
    setGuidedBuildHandoff({
      source: "start",
      productTypeId: buildType.id,
      productTypeLabel: buildType.label,
      buildTypeId: buildType.id,
      buildTypeLabel: buildType.label,
      intentMode: industry ? "known-industry" : "exploring-opportunities",
      industryId: industry?.id,
      industryLabel: industry?.label,
      opportunityAreaId: opportunityArea?.id,
      opportunityAreaLabel: opportunityArea?.label,
      frameworkId: framework.id,
      frameworkLabel: framework.label,
      exampleId: project.id,
      exampleLabel: project.title,
      selectedPathId: choice.pathId,
      selectedPathLabel: choice.pathLabel,
      recommendedPathId:
        recommendedExamplePath?.id === "managed"
          ? "managed"
          : recommendedExamplePath
            ? "diy"
            : undefined,
      recommendedPathLabel: recommendedExamplePath?.label,
      stackRecommendationLabel: project.stackRecommendation.headline,
      stackRecommendationSummary: project.stackRecommendation.summary,
      stackSystems: project.stackRecommendation.systems.map((system) => system.label),
      preferences: [
        guidedMode ? "Guided mode active" : "Self-directed exploration",
        "Example Build walkthrough"
      ],
      userIntent: nextIntent,
      onboardingStep
    });
    setBuildSession(
      createBuildSession({
        sessionId: buildSession?.sessionId,
        source: "start",
        userIntent: nextIntent,
        preferences: [
          guidedMode ? "Guided mode active" : "Self-directed exploration",
          "Example Build walkthrough"
        ],
        guidedMode,
        scope: scopeProject({
          productTypeId: buildType.id,
          productTypeLabel: buildType.label,
          buildTypeId: buildType.id,
          buildTypeLabel: buildType.label,
          selection: {
            productTypeId: buildType.id,
            intentMode: industry ? "known-industry" : "exploring-opportunities",
            industryId: industry?.id,
            opportunityAreaId: opportunityArea?.id,
            frameworkId: framework.id,
            exampleProjectId: project.id
          },
          stackRecommendation: project.stackRecommendation,
          project,
          userIntent: nextIntent
        }),
        credits: estimateCredits({ project }),
        path: recommendBuildPath({
          selectedPathId: choice.pathId,
          selectedPathLabel: choice.pathLabel,
          project
        }),
        progress: {
          phase: "engine-review",
          currentStep: "example-build-final-cta",
          currentStepLabel: "Ready to build your own?",
          currentRoute: choice.href,
          completedSteps: [
            "Product Type",
            "Industry or Explore",
            "Framework",
            "Example Project",
            "Guided Breakdown"
          ]
        }
      })
    );
    router.push(choice.href);
  }

  return (
    <section className="section-stage px-6 py-8 sm:px-8 sm:py-10">
      <div className="floating-wash rounded-[38px]" />
      <div className="relative">
        <div className="max-w-4xl">
          <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
            Step 7
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Ready to build your own?
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            This example showed how Neroa could take a {buildType.label.toLowerCase()} idea, shape
            it through {industry ? industry.label : opportunityArea?.label}, anchor it in the{" "}
            {framework.label.toLowerCase()}, and then turn it into strategy, scope, MVP, stack,
            example credits, and execution choices. The next step is continuing with the real build
            flow, exploring Managed Build, or tightening how pricing and pace work.
          </p>
        </div>

        <div className="comparison-band mt-7">
          <div className="comparison-metric">
            <span className="comparison-label">What just happened</span>
            <span className="comparison-value">
              You moved through the same planning layers that make Neroa feel more like a guided
              product system than a static AI demo.
            </span>
          </div>
          <div className="comparison-metric">
            <span className="comparison-label">What this proves</span>
            <span className="comparison-value">
              Neroa can make software decisions feel understandable before you commit to a real build.
            </span>
          </div>
          <div className="comparison-metric">
            <span className="comparison-label">Natural next step</span>
            <span className="comparison-value">
              Open your real build flow now, or compare the path that matches your budget and support
              needs.
            </span>
          </div>
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
                      Recommended
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                  {choice.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                  {choice.description}
                </p>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => handleChoiceClick(choice)}
                    className={
                      choice.tone === "primary" ? "button-primary w-full" : "button-secondary w-full"
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
          You can start in DIY and move into Managed Build later if the scope grows, the timeline
          tightens, or you want Neroa more involved in execution.
        </p>
      </div>
    </section>
  );
}
