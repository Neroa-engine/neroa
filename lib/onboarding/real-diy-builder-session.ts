import {
  exampleIndustries,
  exampleOpportunityAreas,
  getExampleBuildType
} from "@/lib/marketing/example-build-data";
import { createBuildSession, type GuidedBuildSession } from "@/lib/onboarding/build-session";
import type { GuidedBuildHandoff, GuidedBuildPathId } from "@/lib/onboarding/guided-handoff";
import {
  buildBusinessDirectionSummary,
  buildExperienceDirectionSummary,
  buildProjectDefinitionSummary,
  findBuildStage,
  findLabel,
  getRealBuilderReferenceProject,
  getSelectedFramework,
  normalizeExecutionPathId,
  titleCaseFromSummary
} from "@/lib/onboarding/real-diy-builder-helpers";
import {
  realBuilderSteps,
  type RealBuilderExecutionPathId,
  type RealBuilderPlan,
  type RealBuilderState,
  type RealBuilderStepId
} from "@/lib/onboarding/real-diy-builder-options";
import { buildRealBuilderPlan } from "@/lib/onboarding/real-diy-builder-plan";
import {
  deriveRealBuilderCurrentStep,
  normalizeRealBuilderState
} from "@/lib/onboarding/real-diy-builder-state";

function mapExecutionPathToGuidedPath(pathId: RealBuilderExecutionPathId): GuidedBuildPathId {
  return pathId === "managed" ? "managed" : "diy";
}

const executionPathLabelMap: Record<RealBuilderExecutionPathId, string> = {
  "diy-slower": "DIY Build",
  "diy-accelerated": "DIY Accelerated",
  managed: "Managed Build"
};

function pathLabelForSelection(
  plan: RealBuilderPlan | null,
  pathId: RealBuilderExecutionPathId | null
) {
  if (!pathId) {
    return null;
  }

  if (!plan) {
    return executionPathLabelMap[pathId];
  }

  const selected = plan.pathOptions.find((path) => path.id === pathId);
  return selected?.label ?? executionPathLabelMap[pathId] ?? plan.recommendedPathLabel;
}

export function buildRealBuilderSession(args: {
  state: RealBuilderState;
  selectedPathId?: RealBuilderExecutionPathId | null;
  currentRoute: string;
  currentStep?: RealBuilderStepId | null;
  sessionId?: string;
  source?: "start" | "example-build";
}): GuidedBuildSession {
  const plan = buildRealBuilderPlan(args.state);
  const productType = args.state.productTypeId ? getExampleBuildType(args.state.productTypeId) : null;
  const buildStage = findBuildStage(args.state.buildStageId);
  const referenceProject = getRealBuilderReferenceProject(args.state);
  const selectedPathId = normalizeExecutionPathId(args.selectedPathId) ?? plan?.recommendedPathId ?? null;
  const selectedPathLabel = pathLabelForSelection(plan, selectedPathId);
  const currentStep = args.currentStep ?? deriveRealBuilderCurrentStep(args.state);
  const source = args.source ?? "start";
  const completedSteps = realBuilderSteps
    .slice(0, Math.max(realBuilderSteps.findIndex((step) => step.id === currentStep), 0))
    .map((step) => step.label);

  return createBuildSession({
    sessionId: args.sessionId,
    source,
    userIntent: plan?.userIntent ?? args.state.businessDirection.businessGoal,
    preferences: [
      productType?.label ?? null,
      buildStage?.label ?? null,
      args.state.businessDirection.surfaceType,
      args.state.projectDefinition.priorityTradeoff,
      selectedPathLabel
    ].filter((item): item is string => Boolean(item)),
    scope: {
      productTypeId: args.state.productTypeId ?? undefined,
      productTypeLabel: productType?.label,
      buildTypeId: args.state.productTypeId ?? undefined,
      buildTypeLabel: productType?.label,
      buildStageId: args.state.buildStageId ?? undefined,
      buildStageLabel: buildStage?.label,
      intentMode:
        args.state.businessDirection.conceptMode === "clear-concept"
          ? "known-industry"
          : args.state.businessDirection.conceptMode === "exploring-opportunities"
            ? "exploring-opportunities"
            : undefined,
      industryId: args.state.businessDirection.industryId ?? undefined,
      industryLabel:
        findLabel(exampleIndustries, args.state.businessDirection.industryId)?.label ?? undefined,
      opportunityAreaId: args.state.businessDirection.opportunityAreaId ?? undefined,
      opportunityAreaLabel:
        findLabel(exampleOpportunityAreas, args.state.businessDirection.opportunityAreaId)?.label ??
        undefined,
      frameworkId: args.state.experienceDirection.frameworkId ?? undefined,
      frameworkLabel: getSelectedFramework(args.state)?.label ?? undefined,
      exampleId: referenceProject?.id,
      exampleLabel: referenceProject?.title,
      stackRecommendationLabel: plan?.frameworkLabel,
      stackRecommendationSummary: plan?.frameworkSummary,
      stackSystems: plan?.systemsStack,
      title: plan?.title ?? titleCaseFromSummary(args.state.businessDirection.businessGoal),
      summary:
        plan?.projectDefinitionSummary ||
        buildProjectDefinitionSummary(args.state) ||
        args.state.businessDirection.businessGoal,
      problem: args.state.businessDirection.businessGoal || undefined,
      audience: args.state.projectDefinition.targetUsers || undefined,
      coreFeatures: args.state.projectDefinition.keyFeatures,
      keyModules: plan?.roadmap.map((step) => step.label) ?? undefined,
      firstBuild:
        args.state.projectDefinition.keyFeatures.length > 0
          ? args.state.projectDefinition.keyFeatures.slice(0, 4)
          : undefined,
      mvpSummary: plan?.roadmap.find((step) => step.label === buildStage?.label)?.summary,
      businessGoal: args.state.businessDirection.businessGoal || undefined,
      conceptMode: args.state.businessDirection.conceptMode ?? undefined,
      ventureType: args.state.businessDirection.ventureType ?? undefined,
      surfaceType: args.state.businessDirection.surfaceType ?? undefined,
      businessDirectionSummary:
        plan?.businessDirectionSummary || buildBusinessDirectionSummary(args.state),
      projectDefinitionSummary:
        plan?.projectDefinitionSummary || buildProjectDefinitionSummary(args.state),
      targetUsers: args.state.projectDefinition.targetUsers || undefined,
      coreWorkflow: args.state.projectDefinition.coreWorkflow || undefined,
      keyFeatures: args.state.projectDefinition.keyFeatures,
      monetization: args.state.projectDefinition.monetization || undefined,
      integrationNeeds: args.state.projectDefinition.integrationNeeds,
      priorityTradeoff: args.state.projectDefinition.priorityTradeoff ?? undefined,
      experienceDirectionSummary:
        plan?.experienceDirectionSummary || buildExperienceDirectionSummary(args.state),
      experienceStyle: args.state.experienceDirection.experienceStyle ?? undefined,
      platformStyle: args.state.experienceDirection.platformStyle ?? undefined,
      automationLevel: args.state.experienceDirection.automationLevel ?? undefined,
      complexityLevel: args.state.experienceDirection.complexityLevel ?? undefined,
      estimateBaseline: plan?.estimateBaselineLabel,
      estimateRange: plan?.estimateRangeLabel,
      timeEstimate: plan?.timeEstimateLabel
    },
    path: {
      selectedPathId: selectedPathId ? mapExecutionPathToGuidedPath(selectedPathId) : undefined,
      selectedPathLabel: selectedPathLabel ?? undefined,
      recommendedPathMode: plan ? mapExecutionPathToGuidedPath(plan.recommendedPathId) : undefined,
      recommendedPathLabel: plan?.recommendedPathLabel,
      recommendationReason: plan?.recommendedPathSummary
    },
    credits: {
      source: plan ? "scoped" : "pending",
      estimateLabel: plan?.estimateRangeLabel,
      estimatedTotal: plan
        ? Number(plan.estimateBaselineLabel.replace(/[^0-9]/g, ""))
        : undefined,
      estimatedTimeline: plan?.timeEstimateLabel,
      note: plan?.pricingStartingPointSummary
    },
    progress: {
      phase: source === "example-build" ? "example-build" : "start-intake",
      currentStep,
      currentStepLabel:
        realBuilderSteps.find((step) => step.id === currentStep)?.label ?? realBuilderSteps[0].label,
      currentRoute: args.currentRoute,
      completedSteps
    }
  });
}

export function buildRealBuilderHandoff(args: {
  state: RealBuilderState;
  selectedPathId?: RealBuilderExecutionPathId | null;
  source?: "start" | "example-build";
}): GuidedBuildHandoff | null {
  const productType = args.state.productTypeId ? getExampleBuildType(args.state.productTypeId) : null;
  const buildStage = findBuildStage(args.state.buildStageId);

  if (!productType || !buildStage) {
    return null;
  }

  const plan = buildRealBuilderPlan(args.state);
  const referenceProject = getRealBuilderReferenceProject(args.state);
  const selectedPathId = normalizeExecutionPathId(args.selectedPathId) ?? plan?.recommendedPathId ?? null;
  const source = args.source ?? "start";

  return {
    source,
    productTypeId: args.state.productTypeId ?? undefined,
    productTypeLabel: productType.label,
    buildTypeId: args.state.productTypeId ?? undefined,
    buildTypeLabel: productType.label,
    buildStageId: args.state.buildStageId ?? undefined,
    buildStageLabel: buildStage.label,
    intentMode:
      args.state.businessDirection.conceptMode === "clear-concept"
        ? "known-industry"
        : args.state.businessDirection.conceptMode === "exploring-opportunities"
          ? "exploring-opportunities"
          : undefined,
    industryId: args.state.businessDirection.industryId ?? undefined,
    industryLabel:
      findLabel(exampleIndustries, args.state.businessDirection.industryId)?.label ?? undefined,
    opportunityAreaId: args.state.businessDirection.opportunityAreaId ?? undefined,
    opportunityAreaLabel:
      findLabel(exampleOpportunityAreas, args.state.businessDirection.opportunityAreaId)?.label ??
      undefined,
    frameworkId: args.state.experienceDirection.frameworkId ?? undefined,
    frameworkLabel: getSelectedFramework(args.state)?.label ?? undefined,
    exampleId: referenceProject?.id,
    exampleLabel: referenceProject?.title,
    selectedPathId: selectedPathId ? mapExecutionPathToGuidedPath(selectedPathId) : undefined,
    selectedPathLabel: pathLabelForSelection(plan, selectedPathId) ?? undefined,
    recommendedPathId: plan ? mapExecutionPathToGuidedPath(plan.recommendedPathId) : undefined,
    recommendedPathLabel: plan?.recommendedPathLabel,
    stackRecommendationLabel: plan?.frameworkLabel,
    stackRecommendationSummary: plan?.frameworkSummary,
    stackSystems: plan?.systemsStack,
    preferences: [
      buildStage.label,
      args.state.projectDefinition.priorityTradeoff ?? "",
      args.state.experienceDirection.experienceStyle ?? ""
    ].filter(Boolean),
    userIntent: plan?.userIntent ?? args.state.businessDirection.businessGoal ?? undefined,
    onboardingStep: deriveRealBuilderCurrentStep(args.state),
    title: plan?.title,
    summary: plan?.projectDefinitionSummary || buildProjectDefinitionSummary(args.state),
    businessDirectionSummary:
      plan?.businessDirectionSummary || buildBusinessDirectionSummary(args.state),
    projectDefinitionSummary:
      plan?.projectDefinitionSummary || buildProjectDefinitionSummary(args.state),
    experienceDirectionSummary:
      plan?.experienceDirectionSummary || buildExperienceDirectionSummary(args.state),
    estimateBaseline: plan?.estimateBaselineLabel,
    estimateRange: plan?.estimateRangeLabel,
    timeEstimate: plan?.timeEstimateLabel,
    updatedAt: new Date().toISOString()
  };
}

export function restoreRealBuilderStateFromSession(args: {
  buildSession?: GuidedBuildSession | null;
  guidedBuildHandoff?: GuidedBuildHandoff | null;
}) {
  const scope = args.buildSession?.scope;

  return normalizeRealBuilderState({
    productTypeId: scope?.productTypeId ?? args.guidedBuildHandoff?.productTypeId ?? null,
    buildStageId: scope?.buildStageId ?? args.guidedBuildHandoff?.buildStageId ?? null,
    businessDirection: {
      businessGoal: scope?.businessGoal ?? "",
      conceptMode:
        scope?.conceptMode ??
        (scope?.intentMode === "known-industry"
          ? "clear-concept"
          : scope?.intentMode === "exploring-opportunities"
            ? "exploring-opportunities"
            : null),
      industryId: scope?.industryId ?? args.guidedBuildHandoff?.industryId ?? null,
      opportunityAreaId:
        scope?.opportunityAreaId ?? args.guidedBuildHandoff?.opportunityAreaId ?? null,
      ventureType: scope?.ventureType ?? null,
      surfaceType: scope?.surfaceType ?? null
    },
    projectDefinition: {
      targetUsers: scope?.targetUsers ?? "",
      coreWorkflow: scope?.coreWorkflow ?? "",
      keyFeatures: scope?.keyFeatures ?? [],
      monetization: scope?.monetization ?? "",
      integrationNeeds: scope?.integrationNeeds ?? [],
      priorityTradeoff: scope?.priorityTradeoff ?? null
    },
    experienceDirection: {
      frameworkId: scope?.frameworkId ?? args.guidedBuildHandoff?.frameworkId ?? null,
      experienceStyle: scope?.experienceStyle ?? null,
      platformStyle: scope?.platformStyle ?? null,
      automationLevel: scope?.automationLevel ?? null,
      complexityLevel: scope?.complexityLevel ?? null
    }
  });
}

