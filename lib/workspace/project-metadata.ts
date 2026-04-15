import { normalizeLaneId } from "@/lib/workspace/lanes";
import type { LaneId } from "@/lib/workspace/types";
import type { AgentId } from "@/lib/ai/agents";
import type {
  BuildEntryMode,
  BuildCategoryId,
  BuildExperienceLevelId,
  BuildGoalId,
  BuildIndustryId,
  BuildPreferenceId,
  BuildTemplateFeature,
  ComplexityLabel,
  GuidedBuildBlueprint
} from "@/lib/onboarding/guided-build";
import type { PricingPlanId } from "@/lib/pricing/config";
import type { SaasWorkspaceBlueprint } from "@/lib/onboarding/saas-intake";
import type { MobileAppWorkspaceBlueprint } from "@/lib/onboarding/mobile-app-intake";
import {
  normalizeBuildSession,
  type GuidedBuildSession
} from "@/lib/onboarding/build-session";
import {
  normalizeGuidedBuildHandoff,
  type GuidedBuildHandoff
} from "@/lib/onboarding/guided-handoff";
import {
  getProjectTemplateDefinition,
  inferProjectTemplate,
  type CustomProjectLaneInput,
  type ProjectLaneStatus,
  type ProjectTemplateId
} from "@/lib/workspace/project-lanes";

const METADATA_PREFIX = "<!--NEROA_PROJECT_META:";
const METADATA_SUFFIX = "-->";

export type StoredProjectMetadata = {
  version: 1;
  templateId: ProjectTemplateId;
  customLanes: CustomProjectLaneInput[];
  archived?: boolean;
  assets?: StoredProjectAsset[];
  guidedFlowPreset?: "saas-app" | "mobile-app";
  guidedBuildIntake?: GuidedBuildBlueprint | null;
  guidedEntryContext?: GuidedBuildHandoff | null;
  buildSession?: GuidedBuildSession | null;
  saasIntake?: SaasWorkspaceBlueprint | null;
  mobileAppIntake?: MobileAppWorkspaceBlueprint | null;
};

export type StoredProjectAsset = {
  id: string;
  name: string;
  kind: string;
  sizeLabel: string | null;
  addedAt: string;
};

export type ParsedWorkspaceProjectDescription = {
  visibleDescription: string | null;
  metadata: StoredProjectMetadata | null;
};

function normalizeStatus(value: unknown): ProjectLaneStatus | undefined {
  if (value === "active" || value === "recommended" || value === "optional") {
    return value;
  }

  return undefined;
}

function normalizeAsset(value: unknown): StoredProjectAsset | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const kind = typeof record.kind === "string" ? record.kind.trim() : "";
  const sizeLabel =
    typeof record.sizeLabel === "string" && record.sizeLabel.trim()
      ? record.sizeLabel.trim()
      : null;
  const addedAt = typeof record.addedAt === "string" ? record.addedAt : new Date(0).toISOString();

  if (!id || !name || !kind) {
    return null;
  }

  return {
    id,
    name,
    kind,
    sizeLabel,
    addedAt
  };
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);

  return items.length > 0 ? items : undefined;
}

function normalizeBuildCategoryId(value: unknown): BuildCategoryId | null {
  if (
    value === "saas" ||
    value === "internal-app" ||
    value === "external-app" ||
    value === "mobile-app"
  ) {
    return value;
  }

  return null;
}

function normalizeEntryMode(value: unknown): BuildEntryMode | undefined {
  return value === "known-industry" || value === "exploring" ? value : undefined;
}

function normalizeIndustryId(value: unknown): BuildIndustryId | undefined {
  return value === "crypto-web3" ||
    value === "ai-automation" ||
    value === "saas-software" ||
    value === "finance-trading" ||
    value === "ecommerce" ||
    value === "local-services" ||
    value === "content-media" ||
    value === "health-wellness" ||
    value === "custom"
    ? value
    : undefined;
}

function normalizeGoalId(value: unknown): BuildGoalId | undefined {
  return value === "fast-revenue" ||
    value === "scalable-platform" ||
    value === "learn-experiment"
    ? value
    : undefined;
}

function normalizeExperienceLevelId(value: unknown): BuildExperienceLevelId | undefined {
  return value === "beginner" || value === "intermediate" || value === "advanced"
    ? value
    : undefined;
}

function normalizeBuildPreferenceId(value: unknown): BuildPreferenceId | undefined {
  return value === "recommend-best-path" ||
    value === "manual-modules" ||
    value === "start-lean-upgrade-later"
    ? value
    : undefined;
}

function normalizePricingPlanId(value: unknown): PricingPlanId | undefined {
  return value === "free" ||
    value === "starter" ||
    value === "builder" ||
    value === "pro" ||
    value === "command-center"
    ? value
    : undefined;
}

function normalizeComplexityLabel(value: unknown): ComplexityLabel | undefined {
  return value === "Lean" || value === "Moderate" || value === "Advanced"
    ? value
    : undefined;
}

function normalizeFeatureCard(value: unknown): BuildTemplateFeature | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const label = typeof record.label === "string" ? record.label.trim() : "";
  const whatItDoes =
    typeof record.whatItDoes === "string" ? record.whatItDoes.trim() : "";
  const whyIncluded =
    typeof record.whyIncluded === "string" ? record.whyIncluded.trim() : "";
  const stage = record.stage === "Later" ? "Later" : record.stage === "MVP" ? "MVP" : null;

  if (!id || !label || !whatItDoes || !whyIncluded || !stage) {
    return null;
  }

  return {
    id,
    label,
    whatItDoes,
    whyIncluded,
    stage
  };
}

function normalizeGuidedBuildIntake(value: unknown): GuidedBuildBlueprint | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const categoryId = normalizeBuildCategoryId(record.categoryId);
  const buildCategory = normalizeBuildCategoryId(record.buildCategory) ?? categoryId;
  const categoryLabel =
    typeof record.categoryLabel === "string" ? record.categoryLabel.trim() : "";
  const templateKind =
    record.templateKind === "custom" ? "custom" : "predefined";
  const templateIdeaId =
    typeof record.templateIdeaId === "string" ? record.templateIdeaId.trim() : "";
  const templateIdeaLabel =
    typeof record.templateIdeaLabel === "string"
      ? record.templateIdeaLabel.trim()
      : "";
  const selectedTemplateId =
    typeof record.selectedTemplateId === "string" && record.selectedTemplateId.trim()
      ? record.selectedTemplateId.trim()
      : templateIdeaId;
  const selectedTemplateName =
    typeof record.selectedTemplateName === "string" && record.selectedTemplateName.trim()
      ? record.selectedTemplateName.trim()
      : templateIdeaLabel;
  const customTemplateName =
    typeof record.customTemplateName === "string" && record.customTemplateName.trim()
      ? record.customTemplateName.trim()
      : undefined;
  const customBuildGoal =
    typeof record.customBuildGoal === "string" && record.customBuildGoal.trim()
      ? record.customBuildGoal.trim()
      : undefined;
  const customDescription =
    typeof record.customDescription === "string" && record.customDescription.trim()
      ? record.customDescription.trim()
      : undefined;
  const customProblem =
    typeof record.customProblem === "string" && record.customProblem.trim()
      ? record.customProblem.trim()
      : undefined;
  const customAudience =
    typeof record.customAudience === "string" && record.customAudience.trim()
      ? record.customAudience.trim()
      : undefined;
  const customFeatureIdeas =
    typeof record.customFeatureIdeas === "string" && record.customFeatureIdeas.trim()
      ? record.customFeatureIdeas.trim()
      : undefined;
  const engineName =
    typeof record.engineName === "string" ? record.engineName.trim() : "";
  const generatedSummary =
    typeof record.generatedSummary === "string" && record.generatedSummary.trim()
      ? record.generatedSummary.trim()
      : "";
  const projectSummary =
    typeof record.projectSummary === "string" ? record.projectSummary.trim() : "";
  const templateId = normalizeProjectTemplateId(record.templateId);
  const laneStructure = normalizeStringArray(record.laneStructure) ?? [];
  const primaryBuildPathLabel =
    record.primaryBuildPathLabel === "Primary Build Path" ||
    record.primaryBuildPathLabel === "Recommended App Stack"
      ? "Recommended App Stack"
      : null;
  const primaryBuildPathValue =
    typeof record.primaryBuildPathValue === "string"
      ? record.primaryBuildPathValue.trim()
      : "";
  const primaryBuildPathDetail =
    typeof record.primaryBuildPathDetail === "string"
      ? record.primaryBuildPathDetail.trim()
      : "";
  const secondaryPathLabel =
    typeof record.secondaryPathLabel === "string" && record.secondaryPathLabel.trim()
      ? record.secondaryPathLabel.trim()
      : undefined;
  const secondaryPathValue =
    typeof record.secondaryPathValue === "string" && record.secondaryPathValue.trim()
      ? record.secondaryPathValue.trim()
      : undefined;
  const secondaryPathDetail =
    typeof record.secondaryPathDetail === "string" && record.secondaryPathDetail.trim()
      ? record.secondaryPathDetail.trim()
      : undefined;
  const advisoryPathLabel =
    typeof record.advisoryPathLabel === "string" && record.advisoryPathLabel.trim()
      ? record.advisoryPathLabel.trim()
      : undefined;
  const advisoryPathValue =
    typeof record.advisoryPathValue === "string" && record.advisoryPathValue.trim()
      ? record.advisoryPathValue.trim()
      : undefined;
  const advisoryPathDetail =
    typeof record.advisoryPathDetail === "string" && record.advisoryPathDetail.trim()
      ? record.advisoryPathDetail.trim()
      : undefined;
  const featureCards = Array.isArray(record.featureCards)
    ? record.featureCards
        .map((item) => normalizeFeatureCard(item))
        .filter((item): item is BuildTemplateFeature => Boolean(item))
    : [];
  const selectedModuleIds = normalizeStringArray(record.selectedModuleIds) ?? [];
  const selectedFeatures = normalizeStringArray(record.selectedFeatures) ?? [];
  const recommendedBuildPath =
    typeof record.recommendedBuildPath === "string" && record.recommendedBuildPath.trim()
      ? record.recommendedBuildPath.trim()
      : primaryBuildPathValue;
  const naroaRecommendation =
    typeof record.naroaRecommendation === "string" && record.naroaRecommendation.trim()
      ? record.naroaRecommendation.trim()
      : typeof record.naruwaRecommendation === "string" && record.naruwaRecommendation.trim()
        ? record.naruwaRecommendation.trim()
        : "Naroa selected this structure because this product type needs a clear dashboard, secure user access, core workflow modules, admin controls, billing, and a launch-ready setup path.";
  const buildRoadmap = normalizeStringArray(record.buildRoadmap) ?? [];
  const nextStepChecklist = normalizeStringArray(record.nextStepChecklist) ?? [];
  const entryMode = normalizeEntryMode(record.entryMode);
  const industryId = normalizeIndustryId(record.industryId);
  const industryLabel =
    typeof record.industryLabel === "string" && record.industryLabel.trim()
      ? record.industryLabel.trim()
      : undefined;
  const customIndustry =
    typeof record.customIndustry === "string" && record.customIndustry.trim()
      ? record.customIndustry.trim()
      : typeof record.custom_industry === "string" && record.custom_industry.trim()
        ? record.custom_industry.trim()
        : undefined;
  const industryGroup =
    typeof record.industryGroup === "string" && record.industryGroup.trim()
      ? record.industryGroup.trim()
      : typeof record.industry_group === "string" && record.industry_group.trim()
        ? record.industry_group.trim()
        : undefined;
  const industryDetail =
    typeof record.industryDetail === "string" && record.industryDetail.trim()
      ? record.industryDetail.trim()
      : typeof record.industry_detail === "string" && record.industry_detail.trim()
        ? record.industry_detail.trim()
        : undefined;
  const goalId = normalizeGoalId(record.goalId);
  const goalLabel =
    typeof record.goalLabel === "string" && record.goalLabel.trim()
      ? record.goalLabel.trim()
      : undefined;
  const experienceLevelId = normalizeExperienceLevelId(record.experienceLevelId);
  const experienceLevelLabel =
    typeof record.experienceLevelLabel === "string" && record.experienceLevelLabel.trim()
      ? record.experienceLevelLabel.trim()
      : undefined;
  const buildPreferenceId = normalizeBuildPreferenceId(record.buildPreferenceId);
  const buildPreferenceLabel =
    typeof record.buildPreferenceLabel === "string" && record.buildPreferenceLabel.trim()
      ? record.buildPreferenceLabel.trim()
      : undefined;
  const recommendedFrameworkId =
    typeof record.recommendedFrameworkId === "string" && record.recommendedFrameworkId.trim()
      ? record.recommendedFrameworkId.trim()
      : undefined;
  const recommendedFrameworkLabel =
    typeof record.recommendedFrameworkLabel === "string" && record.recommendedFrameworkLabel.trim()
      ? record.recommendedFrameworkLabel.trim()
      : undefined;
  const recommendedTierId = normalizePricingPlanId(record.recommendedTierId);
  const recommendedTierLabel =
    typeof record.recommendedTierLabel === "string" && record.recommendedTierLabel.trim()
      ? record.recommendedTierLabel.trim()
      : undefined;
  const selectedPlanId = normalizePricingPlanId(record.selectedPlanId);
  const selectedPlanLabel =
    typeof record.selectedPlanLabel === "string" && record.selectedPlanLabel.trim()
      ? record.selectedPlanLabel.trim()
      : undefined;
  const includedMonthlyEngineCredits =
    typeof record.includedMonthlyEngineCredits === "number" &&
    Number.isFinite(record.includedMonthlyEngineCredits)
      ? record.includedMonthlyEngineCredits
      : undefined;
  const estimatedTotalCreditsRequired =
    typeof record.estimatedTotalCreditsRequired === "number" &&
    Number.isFinite(record.estimatedTotalCreditsRequired)
      ? record.estimatedTotalCreditsRequired
      : undefined;
  const estimatedCreditOverage =
    typeof record.estimatedCreditOverage === "number" &&
    Number.isFinite(record.estimatedCreditOverage)
      ? record.estimatedCreditOverage
      : undefined;
  const estimatedTimeline =
    typeof record.estimatedTimeline === "string" && record.estimatedTimeline.trim()
      ? record.estimatedTimeline.trim()
      : undefined;
  const estimatedTimelineDetail =
    typeof record.estimatedTimelineDetail === "string" && record.estimatedTimelineDetail.trim()
      ? record.estimatedTimelineDetail.trim()
      : undefined;
  const recommendedCreditPackLabel =
    typeof record.recommendedCreditPackLabel === "string" && record.recommendedCreditPackLabel.trim()
      ? record.recommendedCreditPackLabel.trim()
      : undefined;
  const recommendedCreditPackDetail =
    typeof record.recommendedCreditPackDetail === "string" && record.recommendedCreditPackDetail.trim()
      ? record.recommendedCreditPackDetail.trim()
      : undefined;
  const managedBuildRecommendation =
    typeof record.managedBuildRecommendation === "string" && record.managedBuildRecommendation.trim()
      ? record.managedBuildRecommendation.trim()
      : undefined;
  const creditPoolWarning =
    typeof record.creditPoolWarning === "string" && record.creditPoolWarning.trim()
      ? record.creditPoolWarning.trim()
      : undefined;
  const scopeExecutionNote =
    typeof record.scopeExecutionNote === "string" && record.scopeExecutionNote.trim()
      ? record.scopeExecutionNote.trim()
      : undefined;
  const recommendationReason =
    typeof record.recommendationReason === "string" && record.recommendationReason.trim()
      ? record.recommendationReason.trim()
      : undefined;
  const pricingGateNotice =
    typeof record.pricingGateNotice === "string" && record.pricingGateNotice.trim()
      ? record.pricingGateNotice.trim()
      : undefined;
  const complexityScore =
    typeof record.complexityScore === "number" && Number.isFinite(record.complexityScore)
      ? record.complexityScore
      : undefined;
  const complexityLabel = normalizeComplexityLabel(record.complexityLabel);
  const complexitySummary =
    typeof record.complexitySummary === "string" && record.complexitySummary.trim()
      ? record.complexitySummary.trim()
      : undefined;
  const executionIntensity =
    typeof record.executionIntensity === "string" && record.executionIntensity.trim()
      ? record.executionIntensity.trim()
      : undefined;
  const uiDensity =
    record.uiDensity === "calm" || record.uiDensity === "balanced" || record.uiDensity === "dense"
      ? record.uiDensity
      : undefined;
  const variationSeed =
    typeof record.variationSeed === "string" && record.variationSeed.trim()
      ? record.variationSeed.trim()
      : undefined;
  const variationLayoutId =
    record.variationLayoutId === "mission-control" ||
    record.variationLayoutId === "guided-operator" ||
    record.variationLayoutId === "focus-column"
      ? record.variationLayoutId
      : undefined;
  const variationLayoutLabel =
    typeof record.variationLayoutLabel === "string" && record.variationLayoutLabel.trim()
      ? record.variationLayoutLabel.trim()
      : undefined;
  const variationNavigationId =
    record.variationNavigationId === "left-rail" ||
    record.variationNavigationId === "hybrid" ||
    record.variationNavigationId === "top-tabs"
      ? record.variationNavigationId
      : undefined;
  const requiredModuleCards = Array.isArray(record.requiredModuleCards)
    ? record.requiredModuleCards
        .map((item) => normalizeFeatureCard(item))
        .filter((item): item is BuildTemplateFeature => Boolean(item))
    : [];
  const expansionModuleCards = Array.isArray(record.expansionModuleCards)
    ? record.expansionModuleCards
        .map((item) => normalizeFeatureCard(item))
        .filter((item): item is BuildTemplateFeature => Boolean(item))
    : [];
  const optionalModuleCards = Array.isArray(record.optionalModuleCards)
    ? record.optionalModuleCards
        .map((item) => normalizeFeatureCard(item))
        .filter((item): item is BuildTemplateFeature => Boolean(item))
    : [];
  const assignedAgents =
    (normalizeStringArray(record.assignedAgents) ?? []).filter(
      (item): item is AgentId =>
        item === "narua" ||
        item === "forge" ||
        item === "atlas" ||
        item === "repolink" ||
        item === "nova" ||
        item === "pulse" ||
        item === "ops"
    );

  if (
    !categoryId ||
    !categoryLabel ||
    !templateIdeaId ||
    !templateIdeaLabel ||
    !engineName ||
    !projectSummary ||
    !templateId ||
    laneStructure.length === 0 ||
    !primaryBuildPathLabel ||
    !primaryBuildPathValue ||
    !primaryBuildPathDetail
  ) {
    return null;
  }

  return {
    categoryId,
    buildCategory: buildCategory ?? categoryId,
    categoryLabel,
    templateKind,
    templateIdeaId,
    templateIdeaLabel,
    selectedTemplateId,
    selectedTemplateName,
    customTemplateName,
    customBuildGoal,
    customDescription,
    customProblem,
    customAudience,
    customFeatureIdeas,
    engineName,
    generatedSummary: generatedSummary || projectSummary,
    projectSummary,
    templateId,
    laneStructure,
    primaryBuildPathLabel,
    primaryBuildPathValue,
    primaryBuildPathDetail,
    secondaryPathLabel,
    secondaryPathValue,
    secondaryPathDetail,
    advisoryPathLabel,
    advisoryPathValue,
    advisoryPathDetail,
    featureCards,
    selectedModuleIds,
    selectedFeatures: selectedFeatures.length > 0 ? selectedFeatures : featureCards.map((item) => item.label),
    recommendedBuildPath,
    naroaRecommendation,
    buildRoadmap,
    nextStepChecklist,
    assignedAgents,
    createdFromOnboarding: true,
    entryMode,
    industryId,
    industryLabel,
    customIndustry,
    industryGroup,
    industryDetail,
    goalId,
    goalLabel,
    experienceLevelId,
    experienceLevelLabel,
    buildPreferenceId,
    buildPreferenceLabel,
    recommendedFrameworkId,
    recommendedFrameworkLabel,
    recommendedTierId,
    recommendedTierLabel,
    selectedPlanId,
    selectedPlanLabel,
    includedMonthlyEngineCredits,
    estimatedTotalCreditsRequired,
    estimatedCreditOverage,
    estimatedTimeline,
    estimatedTimelineDetail,
    recommendedCreditPackLabel,
    recommendedCreditPackDetail,
    managedBuildRecommendation,
    creditPoolWarning,
    scopeExecutionNote,
    recommendationReason,
    pricingGateNotice,
    complexityScore,
    complexityLabel,
    complexitySummary,
    executionIntensity,
    uiDensity,
    variationSeed,
    variationLayoutId,
    variationLayoutLabel,
    variationNavigationId,
    requiredModuleCards,
    expansionModuleCards,
    optionalModuleCards
  };
}

function normalizeSaasIntake(value: unknown): SaasWorkspaceBlueprint | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const projectName = typeof record.projectName === "string" ? record.projectName.trim() : "";
  const projectSummary =
    typeof record.projectSummary === "string" ? record.projectSummary.trim() : "";
  const mvpFeatureList = normalizeStringArray(record.mvpFeatureList) ?? [];
  const nextStepChecklist = normalizeStringArray(record.nextStepChecklist) ?? [];
  const assignedAgents =
    (normalizeStringArray(record.assignedAgents) ?? []).filter(
      (item): item is AgentId =>
        item === "narua" ||
        item === "forge" ||
        item === "atlas" ||
        item === "repolink" ||
        item === "nova" ||
        item === "pulse" ||
        item === "ops"
    );
  const buildComplexityValue =
    record.buildComplexity && typeof record.buildComplexity === "object"
      ? (record.buildComplexity as Record<string, unknown>)
      : null;
  const startupCostValue =
    record.startupCostEstimate && typeof record.startupCostEstimate === "object"
      ? (record.startupCostEstimate as Record<string, unknown>)
      : null;
  const answersValue =
    record.answers && typeof record.answers === "object"
      ? (record.answers as Record<string, unknown>)
      : null;

  if (!projectName || !projectSummary || !buildComplexityValue || !startupCostValue || !answersValue) {
    return null;
  }

  const complexityLabel =
    buildComplexityValue.label === "Lean" ||
    buildComplexityValue.label === "Moderate" ||
    buildComplexityValue.label === "Advanced"
      ? buildComplexityValue.label
      : null;
  const complexitySummary =
    typeof buildComplexityValue.summary === "string" ? buildComplexityValue.summary.trim() : "";
  const rangeLabel =
    typeof startupCostValue.rangeLabel === "string" ? startupCostValue.rangeLabel.trim() : "";
  const startupSummary =
    typeof startupCostValue.summary === "string" ? startupCostValue.summary.trim() : "";
  const normalizeChoice = (choice: unknown) =>
    choice === "yes" || choice === "no" || choice === "not-sure" ? choice : null;
  const guidanceMode =
    answersValue.guidanceMode === "roadmap-only" || answersValue.guidanceMode === "guide-build"
      ? answersValue.guidanceMode
      : null;

  if (!complexityLabel || !complexitySummary || !rangeLabel || !startupSummary || !guidanceMode) {
    return null;
  }

  const productSummary =
    typeof answersValue.productSummary === "string" ? answersValue.productSummary.trim() : "";
  const customer = typeof answersValue.customer === "string" ? answersValue.customer.trim() : "";
  const problem = typeof answersValue.problem === "string" ? answersValue.problem.trim() : "";
  const features = typeof answersValue.features === "string" ? answersValue.features.trim() : "";
  const needsAccounts = normalizeChoice(answersValue.needsAccounts);
  const takesPayments = normalizeChoice(answersValue.takesPayments);
  const needsAdminDashboard = normalizeChoice(answersValue.needsAdminDashboard);

  if (
    !productSummary ||
    !customer ||
    !problem ||
    !features ||
    !needsAccounts ||
    !takesPayments ||
    !needsAdminDashboard
  ) {
    return null;
  }

  return {
    projectName,
    projectSummary,
    mvpFeatureList,
    buildComplexity: {
      label: complexityLabel,
      summary: complexitySummary
    },
    startupCostEstimate: {
      rangeLabel,
      summary: startupSummary
    },
    nextStepChecklist,
    assignedAgents,
    answers: {
      productSummary,
      customer,
      problem,
      features,
      needsAccounts,
      takesPayments,
      needsAdminDashboard,
      guidanceMode
    }
  };
}

function normalizeMobileAppIntake(value: unknown): MobileAppWorkspaceBlueprint | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const projectName = typeof record.projectName === "string" ? record.projectName.trim() : "";
  const projectSummary =
    typeof record.projectSummary === "string" ? record.projectSummary.trim() : "";
  const screenList = normalizeStringArray(record.screenList) ?? [];
  const featureList = normalizeStringArray(record.featureList) ?? [];
  const nextStepChecklist = normalizeStringArray(record.nextStepChecklist) ?? [];
  const assignedAgents =
    (normalizeStringArray(record.assignedAgents) ?? []).filter(
      (item): item is AgentId =>
        item === "narua" ||
        item === "forge" ||
        item === "atlas" ||
        item === "repolink" ||
        item === "nova" ||
        item === "pulse" ||
        item === "ops"
    );
  const buildComplexityValue =
    record.buildComplexity && typeof record.buildComplexity === "object"
      ? (record.buildComplexity as Record<string, unknown>)
      : null;
  const startupCostValue =
    record.startupCostEstimate && typeof record.startupCostEstimate === "object"
      ? (record.startupCostEstimate as Record<string, unknown>)
      : null;
  const stackRecommendationValue =
    record.stackRecommendation && typeof record.stackRecommendation === "object"
      ? (record.stackRecommendation as Record<string, unknown>)
      : null;
  const answersValue =
    record.answers && typeof record.answers === "object"
      ? (record.answers as Record<string, unknown>)
      : null;

  if (
    !projectName ||
    !projectSummary ||
    !buildComplexityValue ||
    !startupCostValue ||
    !stackRecommendationValue ||
    !answersValue
  ) {
    return null;
  }

  const complexityLabel =
    buildComplexityValue.label === "Lean" ||
    buildComplexityValue.label === "Moderate" ||
    buildComplexityValue.label === "Advanced"
      ? buildComplexityValue.label
      : null;
  const complexitySummary =
    typeof buildComplexityValue.summary === "string" ? buildComplexityValue.summary.trim() : "";
  const rangeLabel =
    typeof startupCostValue.rangeLabel === "string" ? startupCostValue.rangeLabel.trim() : "";
  const startupSummary =
    typeof startupCostValue.summary === "string" ? startupCostValue.summary.trim() : "";
  const primaryBuildPath =
    stackRecommendationValue.primaryBuildPath === "React Native + Expo"
      ? "React Native + Expo"
      : null;
  const secondaryMvpPath =
    stackRecommendationValue.secondaryMvpPath === "PWA / mobile web"
      ? "PWA / mobile web"
      : null;
  const advisoryPaths = (normalizeStringArray(stackRecommendationValue.advisoryPaths) ?? []).filter(
    (item): item is "Flutter" | "native iOS" | "native Android" =>
      item === "Flutter" || item === "native iOS" || item === "native Android"
  );
  const recommendedPathLabel =
    stackRecommendationValue.recommendedPathLabel === "Primary Build Path" ||
    stackRecommendationValue.recommendedPathLabel === "Secondary MVP Path" ||
    stackRecommendationValue.recommendedPathLabel === "Advisory Path"
      ? stackRecommendationValue.recommendedPathLabel
      : null;
  const recommendedPathValue =
    typeof stackRecommendationValue.recommendedPathValue === "string"
      ? stackRecommendationValue.recommendedPathValue.trim()
      : "";
  const recommendationSummary =
    typeof stackRecommendationValue.summary === "string"
      ? stackRecommendationValue.summary.trim()
      : "";
  const rationale = normalizeStringArray(stackRecommendationValue.rationale) ?? [];

  const normalizeBinary = (choice: unknown) =>
    choice === "yes" || choice === "no" || choice === "not-sure" ? choice : null;
  const platformTarget =
    answersValue.platformTarget === "iphone" ||
    answersValue.platformTarget === "android" ||
    answersValue.platformTarget === "both"
      ? answersValue.platformTarget
      : null;
  const companionSurface =
    answersValue.companionSurface === "none" ||
    answersValue.companionSurface === "admin-dashboard" ||
    answersValue.companionSurface === "web-companion" ||
    answersValue.companionSurface === "both" ||
    answersValue.companionSurface === "not-sure"
      ? answersValue.companionSurface
      : null;
  const appSummary = typeof answersValue.appSummary === "string" ? answersValue.appSummary.trim() : "";
  const audience = typeof answersValue.audience === "string" ? answersValue.audience.trim() : "";
  const deviceFeatures =
    typeof answersValue.deviceFeatures === "string" ? answersValue.deviceFeatures.trim() : "";
  const mvpVersion =
    typeof answersValue.mvpVersion === "string" ? answersValue.mvpVersion.trim() : "";
  const budgetGuardrail =
    typeof answersValue.budgetGuardrail === "string" ? answersValue.budgetGuardrail.trim() : "";
  const proofOutcome =
    typeof answersValue.proofOutcome === "string" ? answersValue.proofOutcome.trim() : "";
  const needsAccounts = normalizeBinary(answersValue.needsAccounts);
  const needsPayments = normalizeBinary(answersValue.needsPayments);
  const needsNotifications = normalizeBinary(answersValue.needsNotifications);

  if (
    !complexityLabel ||
    !complexitySummary ||
    !rangeLabel ||
    !startupSummary ||
    !primaryBuildPath ||
    !secondaryMvpPath ||
    !recommendedPathLabel ||
    !recommendedPathValue ||
    !recommendationSummary ||
    !platformTarget ||
    !companionSurface ||
    !appSummary ||
    !audience ||
    !mvpVersion ||
    !budgetGuardrail ||
    !proofOutcome ||
    !needsAccounts ||
    !needsPayments ||
    !needsNotifications
  ) {
    return null;
  }

  return {
    projectName,
    projectSummary,
    screenList,
    featureList,
    buildComplexity: {
      label: complexityLabel,
      summary: complexitySummary
    },
    startupCostEstimate: {
      rangeLabel,
      summary: startupSummary
    },
    stackRecommendation: {
      primaryBuildPath,
      secondaryMvpPath,
      advisoryPaths,
      recommendedPathLabel,
      recommendedPathValue,
      summary: recommendationSummary,
      rationale
    },
    nextStepChecklist,
    assignedAgents,
    answers: {
      appSummary,
      audience,
      platformTarget,
      needsAccounts,
      needsPayments,
      needsNotifications,
      deviceFeatures,
      companionSurface,
      mvpVersion,
      budgetGuardrail,
      proofOutcome
    }
  };
}

function normalizeCustomLane(value: unknown): CustomProjectLaneInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const description = typeof record.description === "string" ? record.description.trim() : "";

  if (!title || !description) {
    return null;
  }

  return {
    title,
    description,
    status: normalizeStatus(record.status),
    focusLabel: typeof record.focusLabel === "string" ? record.focusLabel.trim() : undefined,
    recommendedAIStack: normalizeStringArray(record.recommendedAIStack),
    starterPrompts: normalizeStringArray(record.starterPrompts),
    deliverables: normalizeStringArray(record.deliverables)
  };
}

export function parseCustomProjectLanes(value: string | null | undefined) {
  if (!value?.trim()) {
    return [] as CustomProjectLaneInput[];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeCustomLane(item))
      .filter((item): item is CustomProjectLaneInput => Boolean(item));
  } catch {
    return [];
  }
}

export function normalizeProjectTemplateId(
  value: unknown
): ProjectTemplateId | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  return getProjectTemplateDefinition(value as ProjectTemplateId)
    ? (value as ProjectTemplateId)
    : null;
}

export function buildStoredProjectMetadata(args: {
  title: string;
  description?: string | null;
  templateId?: string | ProjectTemplateId | null;
  primaryLaneId?: LaneId | string | null;
  customLanes?: CustomProjectLaneInput[];
  archived?: boolean;
  assets?: StoredProjectAsset[];
  guidedFlowPreset?: "saas-app" | "mobile-app";
  guidedBuildIntake?: GuidedBuildBlueprint | null;
  guidedEntryContext?: GuidedBuildHandoff | null;
  buildSession?: GuidedBuildSession | null;
  saasIntake?: SaasWorkspaceBlueprint | null;
  mobileAppIntake?: MobileAppWorkspaceBlueprint | null;
}) {
  const normalizedPrimaryLaneId = normalizeLaneId(
    typeof args.primaryLaneId === "string" ? args.primaryLaneId : null
  );
  const resolvedTemplateId =
    normalizeProjectTemplateId(args.templateId) ??
    inferProjectTemplate({
      name: args.title,
      description: args.description,
      primaryLaneId: normalizedPrimaryLaneId
    });

  return {
    version: 1 as const,
    templateId: resolvedTemplateId,
    customLanes: args.customLanes ?? [],
    archived: args.archived ?? false,
    assets: args.assets ?? [],
    guidedFlowPreset: args.guidedFlowPreset,
    guidedBuildIntake: args.guidedBuildIntake ?? null,
    guidedEntryContext: args.guidedEntryContext ?? null,
    buildSession: args.buildSession ?? null,
    saasIntake: args.saasIntake ?? null,
    mobileAppIntake: args.mobileAppIntake ?? null
  };
}

function encodeMetadata(metadata: StoredProjectMetadata) {
  return encodeURIComponent(JSON.stringify(metadata));
}

function decodeMetadata(value: string) {
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<StoredProjectMetadata> | null;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const templateId = normalizeProjectTemplateId(parsed.templateId);

    if (!templateId) {
      return null;
    }

    return {
      version: 1 as const,
      templateId,
      customLanes: Array.isArray(parsed.customLanes)
        ? parsed.customLanes
            .map((item) => normalizeCustomLane(item))
            .filter((item): item is CustomProjectLaneInput => Boolean(item))
        : [],
      archived: Boolean(parsed.archived),
      assets: Array.isArray(parsed.assets)
        ? parsed.assets
            .map((item) => normalizeAsset(item))
            .filter((item): item is StoredProjectAsset => Boolean(item))
        : [],
      guidedFlowPreset:
        parsed.guidedFlowPreset === "saas-app" || parsed.guidedFlowPreset === "mobile-app"
          ? parsed.guidedFlowPreset
          : undefined,
      guidedBuildIntake: normalizeGuidedBuildIntake(parsed.guidedBuildIntake),
      guidedEntryContext: normalizeGuidedBuildHandoff(parsed.guidedEntryContext),
      buildSession: normalizeBuildSession(parsed.buildSession),
      saasIntake: normalizeSaasIntake(parsed.saasIntake),
      mobileAppIntake: normalizeMobileAppIntake(parsed.mobileAppIntake)
    };
  } catch {
    return null;
  }
}

export function encodeWorkspaceProjectDescription(
  visibleDescription: string | null | undefined,
  metadata: StoredProjectMetadata | null
) {
  const cleanDescription = visibleDescription?.trim() || "";

  if (!metadata) {
    return cleanDescription || null;
  }

  const payload = `${METADATA_PREFIX}${encodeMetadata(metadata)}${METADATA_SUFFIX}`;

  return cleanDescription ? `${cleanDescription}\n\n${payload}` : payload;
}

export function parseWorkspaceProjectDescription(
  value: string | null | undefined
): ParsedWorkspaceProjectDescription {
  if (!value?.trim()) {
    return {
      visibleDescription: null,
      metadata: null
    };
  }

  const trimmed = value.trim();
  const markerIndex = trimmed.lastIndexOf(METADATA_PREFIX);

  if (markerIndex === -1 || !trimmed.endsWith(METADATA_SUFFIX)) {
    return {
      visibleDescription: trimmed || null,
      metadata: null
    };
  }

  const metadataValue = trimmed
    .slice(markerIndex + METADATA_PREFIX.length, trimmed.length - METADATA_SUFFIX.length)
    .trim();
  const metadata = decodeMetadata(metadataValue);
  const visibleDescription = trimmed.slice(0, markerIndex).trim();

  return {
    visibleDescription: visibleDescription || null,
    metadata
  };
}
