import {
  getExampleBuildFramework,
  getExampleBuildType,
  getExampleFrameworksForSelection,
  type ExampleBuildProject,
  type ExampleFramework
} from "@/lib/marketing/example-build-data";
import { getPricingPlan, type PricingPlanId } from "@/lib/pricing/config";
import {
  assistantRoleMap,
  buildBusinessDirectionLabel,
  buildBusinessDirectionSummary,
  buildEstimateRange,
  buildExperienceDirectionSummary,
  buildManagedTimeline,
  buildProjectDefinitionSummary,
  findBuildStage,
  findLabel,
  getContextParts,
  getRealBuilderReferenceProject,
  getSelectedFramework,
  resolvePricingStartingPoint,
  titleCaseFromSummary
} from "@/lib/onboarding/real-diy-builder-helpers";
import {
  realBuilderExperienceStyleOptions,
  type PlanComputation,
  type RealBuilderExecutionPathId,
  type RealBuilderPathOption,
  type RealBuilderPlan,
  type RealBuilderState
} from "@/lib/onboarding/real-diy-builder-options";
import {
  isBuildSetupComplete,
  isBusinessDirectionComplete,
  isFrameworkDirectionComplete,
  isProjectDefinitionComplete
} from "@/lib/onboarding/real-diy-builder-state";

function buildExecutionPathComputation(
  state: RealBuilderState,
  baselineCredits: number,
  rangeMaxCredits: number
) {
  const starterCredits =
    getPricingPlan("starter")?.capacity.includedExecutionCreditsMonthly ?? 2500;
  const builderCredits =
    getPricingPlan("builder")?.capacity.includedExecutionCreditsMonthly ?? 9000;
  const proCredits = getPricingPlan("pro")?.capacity.includedExecutionCreditsMonthly ?? 22000;
  const slowMonths = Math.max(1, Math.ceil(rangeMaxCredits / starterCredits));
  const acceleratedMonths = Math.max(1, Math.ceil(rangeMaxCredits / builderCredits));
  const deepAccelerationMonths = Math.max(1, Math.ceil(rangeMaxCredits / proCredits));
  const shouldRecommendManaged =
    state.productTypeId === "mobile-app" ||
    state.buildStageId === "full-build" ||
    state.experienceDirection.complexityLevel === "advanced" ||
    state.experienceDirection.automationLevel === "heavy" ||
    rangeMaxCredits >= 26000;
  const shouldRecommendAccelerated =
    !shouldRecommendManaged &&
    (state.projectDefinition.priorityTradeoff === "speed" ||
      baselineCredits >= 10000 ||
      state.buildStageId === "partial-build");
  const recommendedPathId: RealBuilderExecutionPathId = shouldRecommendManaged
    ? "managed"
    : shouldRecommendAccelerated
      ? "diy-accelerated"
      : "diy-slower";

  const pathOptions: RealBuilderPathOption[] = [
    {
      id: "diy-slower",
      label: "DIY Build",
      summary:
        "Move at a measured monthly pace with Neroa's structure, guidance, and scope guardrails still in place.",
      timeline: `Approximately ${slowMonths} months on a slower monthly cadence`,
      controlLevel: "Highest",
      supportLevel: "Guided by Neroa",
      bestFor:
        "Budget-aware teams who want to keep control tight and stretch the build over time.",
      recommended: recommendedPathId === "diy-slower"
    },
    {
      id: "diy-accelerated",
      label: "DIY accelerated",
      summary:
        "Keep the guided DIY path, but compress the timeline through a higher plan or added credit capacity.",
      timeline: `Approximately ${Math.min(acceleratedMonths, deepAccelerationMonths)}-${Math.max(acceleratedMonths, deepAccelerationMonths)} months with higher capacity`,
      controlLevel: "High",
      supportLevel: "Guided by Neroa with faster throughput",
      bestFor:
        "Builders who still want control but do not want the first release stretched across too many months.",
      recommended: recommendedPathId === "diy-accelerated"
    },
    {
      id: "managed",
      label: "Managed Build",
      summary:
        "Move through staged approvals, stronger delivery support, and a more coordinated execution path.",
      timeline: buildManagedTimeline(rangeMaxCredits),
      controlLevel: "Shared",
      supportLevel: "Highest",
      bestFor:
        "Heavier scope, higher urgency, or products that already look too coordinated for a lighter DIY lane.",
      recommended: recommendedPathId === "managed"
    }
  ];

  return {
    recommendedPathId,
    pathOptions
  };
}

function buildRoadmap(
  state: RealBuilderState,
  framework: ExampleFramework,
  referenceProject: ExampleBuildProject | null
) {
  const stageLabel = findBuildStage(state.buildStageId)?.label ?? "Build";
  const contextLabel = buildBusinessDirectionLabel(state);

  return [
    {
      label: "Strategy",
      summary: `Tighten the commercial direction, the users, and the reason ${contextLabel.toLowerCase()} should care before the product surface widens.`
    },
    {
      label: "Scope",
      summary: `Define the first release around ${state.projectDefinition.coreWorkflow.toLowerCase() || "one clear workflow"} so the ${framework.label.toLowerCase()} stays disciplined.`
    },
    {
      label: stageLabel,
      summary:
        state.buildStageId === "mvp"
          ? "Lock the smallest release worth validating, not a shallow shell with loose product logic."
          : state.buildStageId === "partial-build"
            ? "Shape the functional phase that matters most first so the product can advance without pretending the full platform is already done."
            : "Sequence the fuller product into phases so the current build still stays executable and budget-aware."
    },
    {
      label: "Systems",
      summary: `Set the core systems, integrations, and operational modules ${referenceProject ? `that ${referenceProject.title.toLowerCase()} suggests` : "the plan points toward"} before execution accelerates.`
    },
    {
      label: "Build + Test",
      summary:
        "Implement the first serious workflow, validate it with the right users, and tighten quality before launch pressure creates rework."
    },
    {
      label: "Launch",
      summary:
        "Launch with a clearer operator model, visibility into usage, and the next phase already framed instead of guessed."
    }
  ];
}

function buildLikelySystems(state: RealBuilderState, referenceProject: ExampleBuildProject | null) {
  const cards =
    referenceProject?.stackRecommendation.systems.map((system) => ({
      label: system.label,
      role: system.role
    })) ?? [];
  const seen = new Set(cards.map((card) => card.label));
  const extraSystems: Array<{ label: string; role: string }> = [];
  const monetizationText = state.projectDefinition.monetization.toLowerCase();

  if (!seen.has("Stripe") && /(subscription|payment|booking|transaction|fee|revenue)/.test(monetizationText)) {
    extraSystems.push({
      label: "Stripe",
      role: assistantRoleMap.Stripe
    });
  }

  if (
    state.experienceDirection.platformStyle === "mobile-first" &&
    state.productTypeId === "mobile-app" &&
    !seen.has("Expo")
  ) {
    extraSystems.push({
      label: "Expo",
      role: assistantRoleMap.Expo
    });
  }

  const integrationLabels = state.projectDefinition.integrationNeeds;

  if (integrationLabels.some((item) => /analytics|reporting/i.test(item)) && !seen.has("PostHog")) {
    extraSystems.push({
      label: "PostHog",
      role: assistantRoleMap.PostHog
    });
  }

  if (integrationLabels.some((item) => /email|notification/i.test(item)) && !seen.has("Resend")) {
    extraSystems.push({
      label: "Resend",
      role: assistantRoleMap.Resend
    });
  }

  if (integrationLabels.some((item) => /crm|pipeline/i.test(item)) && !seen.has("CRM sync")) {
    extraSystems.push({
      label: "CRM sync",
      role: assistantRoleMap["CRM sync"]
    });
  }

  if (integrationLabels.some((item) => /calendar|schedule/i.test(item)) && !seen.has("Calendar sync")) {
    extraSystems.push({
      label: "Calendar sync",
      role: assistantRoleMap["Calendar sync"]
    });
  }

  if (integrationLabels.some((item) => /ai|automation/i.test(item)) && !seen.has("AI workflow")) {
    extraSystems.push({
      label: "AI workflow",
      role: assistantRoleMap["AI workflow"]
    });
  }

  const combined = [...cards, ...extraSystems].filter((card) => {
    if (seen.has(card.label)) {
      return cards.some((existing) => existing.label === card.label);
    }

    seen.add(card.label);
    return true;
  });

  return {
    cards: combined,
    labels: combined.map((card) => card.label)
  };
}

function buildFrameworkSummary(state: RealBuilderState, framework: ExampleFramework) {
  const experience = findLabel(
    realBuilderExperienceStyleOptions,
    state.experienceDirection.experienceStyle
  );

  return `${framework.description} ${experience ? `${experience.label} keeps the first experience aligned with the users and launch context.` : ""}`.trim();
}

function buildRecommendedFrameworkIds(state: RealBuilderState) {
  const context = getContextParts(state);

  if (!state.productTypeId || !context.intentMode) {
    return [];
  }

  const ranked = [...getExampleFrameworksForSelection({
    productTypeId: state.productTypeId,
    intentMode: context.intentMode,
    industryId: state.businessDirection.industryId,
    opportunityAreaId: state.businessDirection.opportunityAreaId
  })];
  const workflowText = state.projectDefinition.coreWorkflow.toLowerCase();
  const featuresText = state.projectDefinition.keyFeatures.join(" ").toLowerCase();
  const monetizationText = state.projectDefinition.monetization.toLowerCase();
  const surfaceType = state.businessDirection.surfaceType;

  return ranked
    .sort((left, right) => {
      const score = (framework: ExampleFramework) => {
        let total = 0;

        if (/dashboard|report|analytics|visibility/.test(`${workflowText} ${featuresText}`)) {
          total += framework.id === "dashboard-data-platform" ? 4 : 0;
        }

        if (/approval|task|workflow|routing|automation/.test(`${workflowText} ${featuresText}`)) {
          total += framework.id === "workflow-automation-system" ? 4 : 0;
        }

        if (/portal|client|service|booking/.test(`${workflowText} ${featuresText}`)) {
          total += framework.id === "client-portal-service-platform" ? 4 : 0;
        }

        if (/subscription|member|billing|paid access/.test(monetizationText)) {
          total += framework.id === "subscription-platform" ? 4 : 0;
        }

        if (/marketplace|matching|provider/.test(`${workflowText} ${featuresText}`)) {
          total += framework.id === "marketplace-system" ? 5 : 0;
        }

        if (/content|community|creator|audience/.test(`${workflowText} ${featuresText}`)) {
          total += framework.id === "content-community-platform" ? 4 : 0;
        }

        if (surfaceType === "internal") {
          total += framework.id === "internal-operations-system" ? 4 : 0;
        }

        if (surfaceType === "customer-facing") {
          total += framework.id === "client-portal-service-platform" ? 2 : 0;
          total += framework.id === "subscription-platform" ? 1 : 0;
        }

        return total;
      };

      return score(right) - score(left);
    })
    .map((framework) => framework.id);
}

function buildPricingStartingPointSummary(
  planId: PricingPlanId,
  recommendedPathId: RealBuilderExecutionPathId
) {
  const plan = getPricingPlan(planId);

  if (!plan) {
    return "Start with the plan that matches the first pace you can realistically sustain.";
  }

  if (recommendedPathId === "managed") {
    return "Use this as a pricing anchor for DIY pacing, but expect the managed path to be scoped separately.";
  }

  return `${plan.label} is the strongest starting point when this build needs ${plan.usageBandLabel.toLowerCase()} without implying unlimited labor.`;
}

function computePlan(state: RealBuilderState): PlanComputation | null {
  if (
    !isBuildSetupComplete(state) ||
    !isBusinessDirectionComplete(state) ||
    !isProjectDefinitionComplete(state) ||
    !isFrameworkDirectionComplete(state)
  ) {
    return null;
  }

  const referenceProject = getRealBuilderReferenceProject(state);
  const estimate = buildEstimateRange(state, referenceProject);
  const { recommendedPathId, pathOptions } = buildExecutionPathComputation(
    state,
    estimate.baselineCredits,
    estimate.rangeMaxCredits
  );
  const pricingStartingPointId = resolvePricingStartingPoint(estimate.baselineCredits, state);
  const pricingStartingPointLabel = getPricingPlan(pricingStartingPointId)?.label ?? "Starter";

  return {
    referenceProject,
    baselineCredits: estimate.baselineCredits,
    rangeMinCredits: estimate.rangeMinCredits,
    rangeMaxCredits: estimate.rangeMaxCredits,
    recommendedPathId,
    pricingStartingPointId,
    pricingStartingPointLabel,
    pathOptions
  };
}

export function getRealBuilderFrameworkRecommendations(state: RealBuilderState) {
  const recommendedIds = buildRecommendedFrameworkIds(state);
  const recommendedSet = new Set(recommendedIds);
  const frameworks = recommendedIds
    .map((frameworkId) => getExampleBuildFramework(frameworkId))
    .filter((framework): framework is ExampleFramework => Boolean(framework));

  return {
    frameworks,
    recommendedIds,
    recommendedSet
  };
}

export function buildRealBuilderSelectionSummary(state: RealBuilderState) {
  const productType = state.productTypeId ? getExampleBuildType(state.productTypeId) : null;
  const stage = findBuildStage(state.buildStageId);
  const framework = getSelectedFramework(state);
  const contextLabel = buildBusinessDirectionLabel(state);
  const pieces = [
    productType ? `Product type: ${productType.label}` : "",
    stage ? `Build stage: ${stage.label}` : "",
    contextLabel !== "Not defined yet" ? `Direction: ${contextLabel}` : "",
    framework ? `Framework: ${framework.label}` : ""
  ].filter(Boolean);

  return pieces.join(" | ");
}

export function buildRealBuilderPlan(state: RealBuilderState): RealBuilderPlan | null {
  const productType = state.productTypeId ? getExampleBuildType(state.productTypeId) : null;
  const buildStage = findBuildStage(state.buildStageId);
  const framework = getSelectedFramework(state);
  const computation = computePlan(state);

  if (!productType || !buildStage || !framework || !computation) {
    return null;
  }

  const systems = buildLikelySystems(state, computation.referenceProject);
  const businessDirectionSummary = buildBusinessDirectionSummary(state);
  const projectDefinitionSummary = buildProjectDefinitionSummary(state);
  const experienceDirectionSummary = buildExperienceDirectionSummary(state);
  const pathLabels: Record<RealBuilderExecutionPathId, string> = {
    "diy-slower": "DIY Build",
    "diy-accelerated": "DIY accelerated",
    managed: "Managed Build"
  };
  const recommendedPath = computation.pathOptions.find((path) => path.id === computation.recommendedPathId);
  const title = titleCaseFromSummary(
    state.businessDirection.businessGoal || state.projectDefinition.coreWorkflow
  );

  return {
    title,
    userIntent:
      state.businessDirection.businessGoal ||
      state.projectDefinition.coreWorkflow ||
      `Build a ${productType.label} in Neroa`,
    productTypeLabel: productType.label,
    buildStageLabel: buildStage.label,
    businessDirectionLabel: buildBusinessDirectionLabel(state),
    businessDirectionSummary,
    projectDefinitionSummary,
    frameworkId: framework.id,
    frameworkLabel: framework.label,
    frameworkSummary: buildFrameworkSummary(state, framework),
    experienceDirectionSummary,
    systemsStack: systems.labels,
    systemCards: systems.cards,
    roadmap: buildRoadmap(state, framework, computation.referenceProject),
    estimateBaselineLabel: `${computation.baselineCredits.toLocaleString("en-US")} Engine Credits baseline`,
    estimateRangeLabel: `${computation.rangeMinCredits.toLocaleString("en-US")} - ${computation.rangeMaxCredits.toLocaleString("en-US")} Engine Credits`,
    timeEstimateLabel:
      recommendedPath?.timeline ??
      computation.pathOptions.find((path) => path.recommended)?.timeline ??
      "Timeline depends on scope and execution path",
    pricingStartingPointId: computation.pricingStartingPointId,
    pricingStartingPointLabel: computation.pricingStartingPointLabel,
    pricingStartingPointSummary: buildPricingStartingPointSummary(
      computation.pricingStartingPointId,
      computation.recommendedPathId
    ),
    referenceProjectTitle: computation.referenceProject?.title ?? null,
    recommendedPathId: computation.recommendedPathId,
    recommendedPathLabel: pathLabels[computation.recommendedPathId],
    recommendedPathSummary:
      recommendedPath?.summary ??
      "Neroa will shape the best fit once the scope is confirmed in the workspace.",
    pathOptions: computation.pathOptions
  };
}


