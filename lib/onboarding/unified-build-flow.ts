import {
  buildExampleSelectionSummary,
  exampleIndustries,
  exampleOpportunityAreas,
  getExampleBuildFramework,
  getExampleBuildProject,
  getExampleBuildType,
  getExampleFrameworksForSelection,
  getExampleProjectsForSelection,
  type ExampleBuildTypeId,
  type ExampleFrameworkId,
  type ExampleIndustry,
  type ExampleIndustryId,
  type ExampleIntentMode,
  type ExampleOpportunityArea,
  type ExampleOpportunityAreaId
} from "@/lib/marketing/example-build-data";
import {
  createBuildSession,
  estimateCredits,
  recommendBuildPath,
  scopeProject,
  type GuidedBuildSession
} from "@/lib/onboarding/build-session";
import type {
  GuidedBuildHandoff,
  GuidedBuildHandoffSource,
  GuidedBuildPathId
} from "@/lib/onboarding/guided-handoff";

export type UnifiedBuildFlowStepId =
  | "product-type"
  | "industry-explore"
  | "framework"
  | "example"
  | "build";

export type UnifiedBuildSelection = {
  productTypeId: ExampleBuildTypeId | null;
  intentMode: ExampleIntentMode | null;
  industryId: ExampleIndustryId | null;
  opportunityAreaId: ExampleOpportunityAreaId | null;
  frameworkId: ExampleFrameworkId | null;
  exampleProjectId: string | null;
};

export const unifiedBuildFlowSteps = [
  { id: "product-type", label: "Product Type" },
  { id: "industry-explore", label: "Industry or Explore" },
  { id: "framework", label: "Framework" },
  { id: "example", label: "Example" },
  { id: "build", label: "Breakdown / Build" }
] as const satisfies ReadonlyArray<{
  id: UnifiedBuildFlowStepId;
  label: string;
}>;

export const emptyUnifiedBuildSelection: UnifiedBuildSelection = {
  productTypeId: null,
  intentMode: null,
  industryId: null,
  opportunityAreaId: null,
  frameworkId: null,
  exampleProjectId: null
};

function normalizeProductTypeId(value: unknown): ExampleBuildTypeId | null {
  return value === "saas" ||
    value === "internal-software" ||
    value === "external-app" ||
    value === "mobile-app"
    ? value
    : null;
}

function normalizeIntentMode(value: unknown): ExampleIntentMode | null {
  return value === "known-industry" || value === "exploring-opportunities" ? value : null;
}

function normalizeIndustryId(value: unknown): ExampleIndustryId | null {
  const industry = typeof value === "string" ? value.trim() : "";

  return exampleIndustries.some((item) => item.id === industry)
    ? (industry as ExampleIndustryId)
    : null;
}

function normalizeOpportunityAreaId(value: unknown): ExampleOpportunityAreaId | null {
  const opportunity = typeof value === "string" ? value.trim() : "";

  return exampleOpportunityAreas.some((item) => item.id === opportunity)
    ? (opportunity as ExampleOpportunityAreaId)
    : null;
}

function normalizeFrameworkId(value: unknown): ExampleFrameworkId | null {
  const framework = typeof value === "string" ? value.trim() : "";

  return getExampleBuildFramework(framework) ? (framework as ExampleFrameworkId) : null;
}

function normalizeExampleProjectId(value: unknown): string | null {
  const exampleId = typeof value === "string" ? value.trim() : "";

  return exampleId && getExampleBuildProject(exampleId) ? exampleId : null;
}

export function createUnifiedBuildSelection(
  overrides?:
    | Partial<UnifiedBuildSelection>
    | Partial<Record<keyof UnifiedBuildSelection, unknown>>
    | null
): UnifiedBuildSelection {
  return {
    productTypeId: normalizeProductTypeId(overrides?.productTypeId ?? null),
    intentMode: normalizeIntentMode(overrides?.intentMode ?? null),
    industryId: normalizeIndustryId(overrides?.industryId ?? null),
    opportunityAreaId: normalizeOpportunityAreaId(overrides?.opportunityAreaId ?? null),
    frameworkId: normalizeFrameworkId(overrides?.frameworkId ?? null),
    exampleProjectId: normalizeExampleProjectId(overrides?.exampleProjectId ?? null)
  };
}

export function selectUnifiedProductType(
  selection: UnifiedBuildSelection,
  productTypeId: ExampleBuildTypeId
) {
  return createUnifiedBuildSelection({
    ...selection,
    productTypeId,
    intentMode: null,
    industryId: null,
    opportunityAreaId: null,
    frameworkId: null,
    exampleProjectId: null
  });
}

export function selectUnifiedIntentMode(
  selection: UnifiedBuildSelection,
  intentMode: ExampleIntentMode
) {
  return createUnifiedBuildSelection({
    ...selection,
    intentMode,
    industryId: null,
    opportunityAreaId: null,
    frameworkId: null,
    exampleProjectId: null
  });
}

export function selectUnifiedIndustry(
  selection: UnifiedBuildSelection,
  industryId: ExampleIndustryId
) {
  return createUnifiedBuildSelection({
    ...selection,
    intentMode: "known-industry",
    industryId,
    opportunityAreaId: null,
    frameworkId: null,
    exampleProjectId: null
  });
}

export function selectUnifiedOpportunityArea(
  selection: UnifiedBuildSelection,
  opportunityAreaId: ExampleOpportunityAreaId
) {
  return createUnifiedBuildSelection({
    ...selection,
    intentMode: "exploring-opportunities",
    industryId: null,
    opportunityAreaId,
    frameworkId: null,
    exampleProjectId: null
  });
}

export function selectUnifiedFramework(
  selection: UnifiedBuildSelection,
  frameworkId: ExampleFrameworkId
) {
  return createUnifiedBuildSelection({
    ...selection,
    frameworkId,
    exampleProjectId: null
  });
}

export function selectUnifiedExampleProject(
  selection: UnifiedBuildSelection,
  exampleProjectId: string
) {
  return createUnifiedBuildSelection({
    ...selection,
    exampleProjectId
  });
}

export function resetUnifiedBuildToProductType() {
  return createUnifiedBuildSelection(emptyUnifiedBuildSelection);
}

export function resetUnifiedBuildToIntent(selection: UnifiedBuildSelection) {
  return createUnifiedBuildSelection({
    ...selection,
    intentMode: null,
    industryId: null,
    opportunityAreaId: null,
    frameworkId: null,
    exampleProjectId: null
  });
}

export function resetUnifiedBuildToFramework(selection: UnifiedBuildSelection) {
  return createUnifiedBuildSelection({
    ...selection,
    frameworkId: null,
    exampleProjectId: null
  });
}

export function resetUnifiedBuildToExample(selection: UnifiedBuildSelection) {
  return createUnifiedBuildSelection({
    ...selection,
    exampleProjectId: null
  });
}

export function getExampleIndustry(industryId: string | null | undefined): ExampleIndustry | null {
  const value = normalizeIndustryId(industryId);

  return value ? exampleIndustries.find((industry) => industry.id === value) ?? null : null;
}

export function getExampleOpportunityArea(
  opportunityAreaId: string | null | undefined
): ExampleOpportunityArea | null {
  const value = normalizeOpportunityAreaId(opportunityAreaId);

  return value
    ? exampleOpportunityAreas.find((opportunity) => opportunity.id === value) ?? null
    : null;
}

export function deriveUnifiedBuildState(selection: UnifiedBuildSelection) {
  const productType = selection.productTypeId ? getExampleBuildType(selection.productTypeId) : null;
  const industry = selection.industryId ? getExampleIndustry(selection.industryId) : null;
  const opportunityArea = selection.opportunityAreaId
    ? getExampleOpportunityArea(selection.opportunityAreaId)
    : null;
  const frameworks = getExampleFrameworksForSelection({
    productTypeId: selection.productTypeId,
    intentMode: selection.intentMode,
    industryId: selection.industryId,
    opportunityAreaId: selection.opportunityAreaId
  });
  const framework = selection.frameworkId ? getExampleBuildFramework(selection.frameworkId) : null;
  const projects = getExampleProjectsForSelection({
    productTypeId: selection.productTypeId,
    intentMode: selection.intentMode,
    industryId: selection.industryId,
    opportunityAreaId: selection.opportunityAreaId,
    frameworkId: selection.frameworkId
  });
  const project = selection.exampleProjectId ? getExampleBuildProject(selection.exampleProjectId) : null;
  const currentStep: UnifiedBuildFlowStepId = project
    ? "build"
    : framework
      ? "example"
      : selection.intentMode && (industry || opportunityArea)
        ? "framework"
        : productType
          ? "industry-explore"
          : "product-type";
  const currentStepIndex =
    currentStep === "product-type"
      ? 1
      : currentStep === "industry-explore"
        ? 2
        : currentStep === "framework"
          ? 3
          : currentStep === "example"
            ? 4
            : 5;

  return {
    selection,
    productType,
    industry,
    opportunityArea,
    frameworks,
    framework,
    projects,
    project,
    currentStep,
    currentStepIndex,
    stepLabel: unifiedBuildFlowSteps[currentStepIndex - 1]?.label ?? unifiedBuildFlowSteps[0].label,
    summary: buildExampleSelectionSummary({
      productType,
      intentMode: selection.intentMode,
      industry,
      opportunityArea,
      framework,
      project
    })
  };
}

export function getUnifiedBuildSelectionFromSources(args: {
  buildSession?: GuidedBuildSession | null;
  guidedBuildHandoff?: GuidedBuildHandoff | null;
}) {
  return createUnifiedBuildSelection({
    productTypeId:
      args.buildSession?.scope.productTypeId ??
      args.buildSession?.scope.buildTypeId ??
      args.guidedBuildHandoff?.productTypeId ??
      args.guidedBuildHandoff?.buildTypeId ??
      null,
    intentMode:
      args.buildSession?.scope.intentMode ??
      args.guidedBuildHandoff?.intentMode ??
      null,
    industryId:
      args.buildSession?.scope.industryId ??
      args.guidedBuildHandoff?.industryId ??
      null,
    opportunityAreaId:
      args.buildSession?.scope.opportunityAreaId ??
      args.guidedBuildHandoff?.opportunityAreaId ??
      null,
    frameworkId:
      args.buildSession?.scope.frameworkId ??
      args.guidedBuildHandoff?.frameworkId ??
      null,
    exampleProjectId:
      args.buildSession?.scope.exampleId ??
      args.guidedBuildHandoff?.exampleId ??
      null
  });
}

export function buildUnifiedBuildArtifacts(args: {
  selection: UnifiedBuildSelection;
  userIntent?: string | null;
  selectedPathId?: GuidedBuildPathId | null;
  selectedPathLabel?: string | null;
}) {
  const derived = deriveUnifiedBuildState(args.selection);
  const scope = scopeProject({
    productTypeId: derived.productType?.id,
    productTypeLabel: derived.productType?.label,
    buildTypeId: derived.productType?.id,
    buildTypeLabel: derived.productType?.label,
    selection: {
      productTypeId: derived.selection.productTypeId,
      intentMode: derived.selection.intentMode,
      industryId: derived.selection.industryId,
      opportunityAreaId: derived.selection.opportunityAreaId,
      frameworkId: derived.selection.frameworkId,
      exampleProjectId: derived.selection.exampleProjectId
    },
    stackRecommendation: derived.project?.stackRecommendation,
    project: derived.project,
    userIntent: args.userIntent ?? undefined
  });
  const credits = estimateCredits({ project: derived.project });
  const path = recommendBuildPath({
    selectedPathId: args.selectedPathId,
    selectedPathLabel: args.selectedPathLabel,
    project: derived.project
  });

  return {
    ...derived,
    scope,
    credits,
    path
  };
}

export function buildUnifiedBuildSession(args: {
  selection: UnifiedBuildSelection;
  source: GuidedBuildSession["source"];
  userIntent?: string | null;
  preferences?: string[];
  guidedMode?: boolean;
  selectedPathId?: GuidedBuildPathId | null;
  selectedPathLabel?: string | null;
  currentRoute: string;
  currentStep?: string;
  currentStepLabel?: string;
  sessionId?: string;
}) {
  const artifacts = buildUnifiedBuildArtifacts({
    selection: args.selection,
    userIntent: args.userIntent,
    selectedPathId: args.selectedPathId,
    selectedPathLabel: args.selectedPathLabel
  });
  const completedSteps = unifiedBuildFlowSteps
    .slice(0, Math.max(artifacts.currentStepIndex - 1, 0))
    .map((step) => step.label);

  return createBuildSession({
    sessionId: args.sessionId,
    source: args.source,
    userIntent: typeof args.userIntent === "string" ? args.userIntent.trim() : undefined,
    preferences: args.preferences,
    guidedMode: args.guidedMode,
    scope: artifacts.scope,
    credits: artifacts.credits,
    path: artifacts.path,
    progress: {
      phase: args.source === "example-build" ? "example-build" : "start-intake",
      currentStep: args.currentStep ?? artifacts.currentStep,
      currentStepLabel: args.currentStepLabel ?? artifacts.stepLabel,
      currentRoute: args.currentRoute,
      completedSteps
    }
  });
}

export function buildUnifiedBuildHandoff(args: {
  selection: UnifiedBuildSelection;
  source?: GuidedBuildHandoffSource | null;
  userIntent?: string | null;
  preferences?: string[];
  onboardingStep?: string;
  selectedPathId?: GuidedBuildPathId | null;
  selectedPathLabel?: string | null;
}) {
  if (!args.source) {
    return null;
  }

  const artifacts = buildUnifiedBuildArtifacts({
    selection: args.selection,
    userIntent: args.userIntent,
    selectedPathId: args.selectedPathId,
    selectedPathLabel: args.selectedPathLabel
  });

  if (!artifacts.productType) {
    return null;
  }

  return {
    source: args.source,
    productTypeId: artifacts.productType.id,
    productTypeLabel: artifacts.productType.label,
    buildTypeId: artifacts.productType.id,
    buildTypeLabel: artifacts.productType.label,
    intentMode: artifacts.selection.intentMode ?? undefined,
    industryId: artifacts.industry?.id,
    industryLabel: artifacts.industry?.label,
    opportunityAreaId: artifacts.opportunityArea?.id,
    opportunityAreaLabel: artifacts.opportunityArea?.label,
    frameworkId: artifacts.framework?.id,
    frameworkLabel: artifacts.framework?.label,
    exampleId: artifacts.project?.id,
    exampleLabel: artifacts.project?.title,
    selectedPathId: args.selectedPathId ?? undefined,
    selectedPathLabel: args.selectedPathLabel ?? undefined,
    recommendedPathId: artifacts.path.recommendedPathMode,
    recommendedPathLabel: artifacts.path.recommendedPathLabel,
    stackRecommendationLabel: artifacts.scope.stackRecommendationLabel,
    stackRecommendationSummary: artifacts.scope.stackRecommendationSummary,
    stackSystems: artifacts.scope.stackSystems,
    preferences: args.preferences,
    userIntent: typeof args.userIntent === "string" ? args.userIntent.trim() : undefined,
    onboardingStep: args.onboardingStep,
    updatedAt: new Date().toISOString()
  } satisfies GuidedBuildHandoff;
}

export function buildUnifiedIntegrationLabels(selection: UnifiedBuildSelection) {
  return (
    buildUnifiedBuildArtifacts({
      selection
    }).scope.stackSystems ?? []
  );
}

export function hasUnifiedSelection(selection: UnifiedBuildSelection) {
  return Boolean(
    selection.productTypeId ||
      selection.intentMode ||
      selection.industryId ||
      selection.opportunityAreaId ||
      selection.frameworkId ||
      selection.exampleProjectId
  );
}
