import {
  exampleIndustries,
  exampleOpportunityAreas,
  getExampleBuildFramework,
  getExampleProjectsForSelection,
  type ExampleBuildProject,
  type ExampleBuildTypeId,
  type ExampleFramework,
  type ExampleFrameworkId,
  type ExampleIndustryId,
  type ExampleIntentMode,
  type ExampleOpportunityAreaId
} from "@/lib/marketing/example-build-data";
import { parseExampleCreditEstimate } from "@/lib/onboarding/build-session";
import type { PricingPlanId } from "@/lib/pricing/config";
import {
  realBuilderAutomationLevelOptions,
  realBuilderBuildStages,
  realBuilderComplexityOptions,
  realBuilderExperienceStyleOptions,
  realBuilderPlatformStyleOptions,
  realBuilderPriorityOptions,
  realBuilderSurfaceOptions,
  realBuilderVentureOptions,
  type RealBuilderAutomationLevel,
  type RealBuilderBuildStageId,
  type RealBuilderComplexityLevel,
  type RealBuilderConceptMode,
  type RealBuilderExecutionPathId,
  type RealBuilderExperienceStyle,
  type RealBuilderPlatformStyle,
  type RealBuilderPriorityTradeoff,
  type RealBuilderState,
  type RealBuilderSurfaceType,
  type RealBuilderVentureType
} from "@/lib/onboarding/real-diy-builder-options";

export const assistantRoleMap: Record<string, string> = {
  GitHub: "Source control and delivery workflow",
  "Next.js": "Core application shell and front-end architecture",
  Supabase: "Database, auth, and data services",
  Vercel: "Deployment and hosting workflow",
  Stripe: "Billing, plans, or payments",
  Resend: "Transactional email and notifications",
  PostHog: "Analytics, reporting, and usage visibility",
  Auth: "Account access and permissions",
  Expo: "Mobile delivery workflow",
  "React Native": "Mobile application surface",
  "AI workflow": "Assistive automation and structured AI actions",
  "Calendar sync": "Scheduling, availability, and booking coordination",
  "CRM sync": "Lead or relationship data continuity"
};

export function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function normalizeDelimitedList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const normalized = normalizeString(value);

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeBuildStageId(value: unknown): RealBuilderBuildStageId | null {
  return value === "mvp" || value === "partial-build" || value === "full-build" ? value : null;
}

export function normalizeConceptMode(value: unknown): RealBuilderConceptMode | null {
  return value === "clear-concept" || value === "exploring-opportunities" ? value : null;
}

export function normalizeVentureType(value: unknown): RealBuilderVentureType | null {
  return value === "existing-business" || value === "new-venture" ? value : null;
}

export function normalizeSurfaceType(value: unknown): RealBuilderSurfaceType | null {
  return value === "customer-facing" || value === "internal" || value === "both" ? value : null;
}

export function normalizePriorityTradeoff(value: unknown): RealBuilderPriorityTradeoff | null {
  return value === "speed" || value === "cost" || value === "complexity" ? value : null;
}

export function normalizeExperienceStyle(value: unknown): RealBuilderExperienceStyle | null {
  return value === "internal-utility" || value === "balanced" || value === "polished-customer"
    ? value
    : null;
}

export function normalizePlatformStyle(value: unknown): RealBuilderPlatformStyle | null {
  return value === "web-first" || value === "mobile-ready-web" || value === "mobile-first"
    ? value
    : null;
}

export function normalizeAutomationLevel(value: unknown): RealBuilderAutomationLevel | null {
  return value === "light" || value === "moderate" || value === "heavy" ? value : null;
}

export function normalizeComplexityLevel(value: unknown): RealBuilderComplexityLevel | null {
  return value === "lean" || value === "moderate" || value === "advanced" ? value : null;
}

export function normalizeProductTypeId(value: unknown): ExampleBuildTypeId | null {
  return value === "saas" ||
    value === "internal-software" ||
    value === "external-app" ||
    value === "mobile-app"
    ? value
    : null;
}

export function normalizeIndustryId(value: unknown): ExampleIndustryId | null {
  const id = normalizeString(value);
  return exampleIndustries.some((industry) => industry.id === id) ? (id as ExampleIndustryId) : null;
}

export function normalizeOpportunityAreaId(value: unknown): ExampleOpportunityAreaId | null {
  const id = normalizeString(value);

  return exampleOpportunityAreas.some((opportunity) => opportunity.id === id)
    ? (id as ExampleOpportunityAreaId)
    : null;
}

export function normalizeFrameworkId(value: unknown): ExampleFrameworkId | null {
  const id = normalizeString(value);
  return getExampleBuildFramework(id) ? (id as ExampleFrameworkId) : null;
}

export function normalizeExecutionPathId(value: unknown): RealBuilderExecutionPathId | null {
  return value === "diy-slower" || value === "diy-accelerated" || value === "managed"
    ? value
    : null;
}

export function findBuildStage(stageId: RealBuilderBuildStageId | null) {
  return realBuilderBuildStages.find((stage) => stage.id === stageId) ?? null;
}

export function findLabel<T extends { id: string; label: string }>(items: T[], id: string | null) {
  if (!id) {
    return null;
  }

  return items.find((item) => item.id === id) ?? null;
}

function roundToFiveHundred(value: number) {
  return Math.round(value / 500) * 500;
}

export function titleCaseFromSummary(value: string) {
  const summary = value.trim().replace(/\.$/, "");

  if (!summary) {
    return "NEROA build plan";
  }

  const firstSentence = summary.split(/[.!?]/)[0]?.trim() ?? summary;

  if (firstSentence.length <= 74) {
    return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
  }

  return `${firstSentence.slice(0, 72).trimEnd()}...`;
}

function joinWithAnd(parts: string[]) {
  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return parts[0] ?? "";
  }

  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }

  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

export function getContextParts(state: RealBuilderState): {
  industry: (typeof exampleIndustries)[number] | null;
  opportunityArea: (typeof exampleOpportunityAreas)[number] | null;
  intentMode: ExampleIntentMode | null;
} {
  const industry = findLabel(exampleIndustries, state.businessDirection.industryId);
  const opportunityArea = findLabel(
    exampleOpportunityAreas,
    state.businessDirection.opportunityAreaId
  );

  return {
    industry,
    opportunityArea,
    intentMode:
      state.businessDirection.conceptMode === "exploring-opportunities"
        ? ("exploring-opportunities" satisfies ExampleIntentMode)
        : state.businessDirection.conceptMode === "clear-concept"
          ? ("known-industry" satisfies ExampleIntentMode)
          : null
  };
}

export function getSelectedFramework(state: RealBuilderState) {
  return state.experienceDirection.frameworkId
    ? getExampleBuildFramework(state.experienceDirection.frameworkId)
    : null;
}

function scoreReferenceProject(project: ExampleBuildProject, state: RealBuilderState) {
  const haystack = `${project.title} ${project.summary} ${project.problem} ${project.coreFeatures.join(" ")} ${project.keyModules.join(" ")}`
    .toLowerCase();
  const signals = [
    state.businessDirection.businessGoal,
    state.projectDefinition.coreWorkflow,
    ...state.projectDefinition.keyFeatures,
    state.projectDefinition.monetization,
    ...state.projectDefinition.integrationNeeds
  ]
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
    .filter((item) => item.length >= 4);

  const keywordScore = signals.reduce(
    (score, word) => (haystack.includes(word) ? score + 1 : score),
    0
  );
  const buildStageScore =
    state.buildStageId === "mvp"
      ? project.buildPaths.some((path) => path.id === "diy-slower") ? 2 : 0
      : state.buildStageId === "full-build"
        ? project.buildPaths.some((path) => path.id === "managed") ? 2 : 0
        : 1;

  return keywordScore + buildStageScore;
}

export function getReferenceProject(state: RealBuilderState) {
  const context = getContextParts(state);

  if (!state.productTypeId || !context.intentMode || !state.experienceDirection.frameworkId) {
    return null;
  }

  const projects = getExampleProjectsForSelection({
    productTypeId: state.productTypeId,
    intentMode: context.intentMode,
    industryId: state.businessDirection.industryId,
    opportunityAreaId: state.businessDirection.opportunityAreaId,
    frameworkId: state.experienceDirection.frameworkId
  });

  if (projects.length === 0) {
    return null;
  }

  return [...projects].sort(
    (left, right) => scoreReferenceProject(right, state) - scoreReferenceProject(left, state)
  )[0] ?? null;
}

export function getRealBuilderReferenceProject(state: RealBuilderState) {
  return getReferenceProject(state);
}

export function buildBusinessDirectionLabel(state: RealBuilderState) {
  const context = getContextParts(state);

  if (context.industry) {
    return context.industry.label;
  }

  if (context.opportunityArea) {
    return context.opportunityArea.label;
  }

  return "Not defined yet";
}

export function buildBusinessDirectionSummary(state: RealBuilderState) {
  const contextLabel = buildBusinessDirectionLabel(state);
  const venture = findLabel(realBuilderVentureOptions, state.businessDirection.ventureType);
  const surface = findLabel(realBuilderSurfaceOptions, state.businessDirection.surfaceType);
  const parts = [
    state.businessDirection.businessGoal,
    contextLabel !== "Not defined yet" ? `Context: ${contextLabel}` : "",
    venture ? venture.label : "",
    surface ? surface.label : ""
  ].filter(Boolean);

  return parts.join(" | ");
}

export function buildProjectDefinitionSummary(state: RealBuilderState) {
  const parts = [
    state.projectDefinition.targetUsers
      ? `Users: ${state.projectDefinition.targetUsers}`
      : "",
    state.projectDefinition.coreWorkflow
      ? `Workflow: ${state.projectDefinition.coreWorkflow}`
      : "",
    state.projectDefinition.keyFeatures.length > 0
      ? `First features: ${joinWithAnd(state.projectDefinition.keyFeatures.slice(0, 4))}`
      : "",
    state.projectDefinition.monetization
      ? `Value model: ${state.projectDefinition.monetization}`
      : "",
    state.projectDefinition.integrationNeeds.length > 0
      ? `Integrations: ${joinWithAnd(state.projectDefinition.integrationNeeds.slice(0, 4))}`
      : "",
    state.projectDefinition.priorityTradeoff
      ? `Priority: ${
          findLabel(realBuilderPriorityOptions, state.projectDefinition.priorityTradeoff)?.label ??
          state.projectDefinition.priorityTradeoff
        }`
      : ""
  ].filter(Boolean);

  return parts.join(" | ");
}

export function buildExperienceDirectionSummary(state: RealBuilderState) {
  const framework = getSelectedFramework(state);
  const experience = findLabel(
    realBuilderExperienceStyleOptions,
    state.experienceDirection.experienceStyle
  );
  const platform = findLabel(realBuilderPlatformStyleOptions, state.experienceDirection.platformStyle);
  const automation = findLabel(
    realBuilderAutomationLevelOptions,
    state.experienceDirection.automationLevel
  );
  const complexity = findLabel(
    realBuilderComplexityOptions,
    state.experienceDirection.complexityLevel
  );

  return [
    framework ? framework.label : "",
    experience ? experience.label : "",
    platform ? platform.label : "",
    automation ? automation.label : "",
    complexity ? complexity.label : ""
  ]
    .filter(Boolean)
    .join(" | ");
}

function getStageMultiplier(stageId: RealBuilderBuildStageId | null) {
  switch (stageId) {
    case "mvp":
      return 0.72;
    case "partial-build":
      return 1;
    case "full-build":
      return 1.34;
    default:
      return 1;
  }
}

function getAutomationMultiplier(level: RealBuilderAutomationLevel | null) {
  switch (level) {
    case "light":
      return 0.92;
    case "moderate":
      return 1.05;
    case "heavy":
      return 1.18;
    default:
      return 1;
  }
}

function getComplexityMultiplier(level: RealBuilderComplexityLevel | null) {
  switch (level) {
    case "lean":
      return 0.9;
    case "moderate":
      return 1.04;
    case "advanced":
      return 1.2;
    default:
      return 1;
  }
}

function getPriorityMultiplier(priority: RealBuilderPriorityTradeoff | null) {
  switch (priority) {
    case "speed":
      return 1.08;
    case "cost":
      return 0.94;
    case "complexity":
      return 1.06;
    default:
      return 1;
  }
}

export function buildEstimateRange(state: RealBuilderState, referenceProject: ExampleBuildProject | null) {
  const parsed = parseExampleCreditEstimate(referenceProject?.creditEstimate);
  const baseMin = parsed.min ?? 5000;
  const baseMax = parsed.max ?? 8500;
  const baseCenter = (baseMin + baseMax) / 2;
  const multiplier =
    getStageMultiplier(state.buildStageId) *
    getAutomationMultiplier(state.experienceDirection.automationLevel) *
    getComplexityMultiplier(state.experienceDirection.complexityLevel) *
    getPriorityMultiplier(state.projectDefinition.priorityTradeoff);
  const platformAdjustment =
    state.productTypeId === "mobile-app" && state.experienceDirection.platformStyle === "mobile-first"
      ? 1.08
      : 1;
  const baselineCredits = roundToFiveHundred(baseCenter * multiplier * platformAdjustment);
  const rangeMinCredits = roundToFiveHundred(baselineCredits * 0.82);
  const rangeMaxCredits = roundToFiveHundred(baselineCredits * 1.18);

  return {
    baselineCredits,
    rangeMinCredits,
    rangeMaxCredits
  };
}

export function resolvePricingStartingPoint(baselineCredits: number, state: RealBuilderState): PricingPlanId {
  if (
    state.buildStageId === "full-build" ||
    state.experienceDirection.complexityLevel === "advanced" ||
    baselineCredits >= 20000
  ) {
    return "pro";
  }

  if (baselineCredits >= 9000 || state.buildStageId === "partial-build") {
    return "builder";
  }

  return "starter";
}

export function buildManagedTimeline(rangeMaxCredits: number) {
  if (rangeMaxCredits >= 30000) {
    return "8-12 weeks with staged approvals";
  }

  if (rangeMaxCredits >= 18000) {
    return "6-9 weeks with staged approvals";
  }

  return "4-6 weeks with staged approvals";
}


