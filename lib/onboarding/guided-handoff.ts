export type GuidedBuildHandoffSource = "homepage-guide" | "example-build" | "start";
export type GuidedBuildPathId = "diy" | "managed" | "pricing";

export type GuidedBuildHandoff = {
  source: GuidedBuildHandoffSource;
  productTypeId?: string;
  productTypeLabel?: string;
  buildTypeId?: string;
  buildTypeLabel?: string;
  buildStageId?: string;
  buildStageLabel?: string;
  intentMode?: "known-industry" | "exploring-opportunities";
  industryId?: string;
  industryLabel?: string;
  opportunityAreaId?: string;
  opportunityAreaLabel?: string;
  frameworkId?: string;
  frameworkLabel?: string;
  selectedPathId?: GuidedBuildPathId;
  selectedPathLabel?: string;
  recommendedPathId?: GuidedBuildPathId;
  recommendedPathLabel?: string;
  exampleId?: string;
  exampleLabel?: string;
  stackRecommendationLabel?: string;
  stackRecommendationSummary?: string;
  stackSystems?: string[];
  preferences?: string[];
  userIntent?: string;
  onboardingStep?: string;
  title?: string;
  summary?: string;
  businessDirectionSummary?: string;
  projectDefinitionSummary?: string;
  experienceDirectionSummary?: string;
  estimateBaseline?: string;
  estimateRange?: string;
  timeEstimate?: string;
  updatedAt: string;
};

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizePreferences(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const preferences = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return preferences.length > 0 ? preferences : undefined;
}

function normalizePathId(value: unknown): GuidedBuildPathId | undefined {
  return value === "diy" || value === "managed" || value === "pricing" ? value : undefined;
}

function normalizeSource(value: unknown): GuidedBuildHandoffSource | null {
  return value === "homepage-guide" || value === "example-build" || value === "start" ? value : null;
}

function normalizeStep(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function normalizeGuidedBuildHandoff(value: unknown): GuidedBuildHandoff | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const source = normalizeSource(record.source);

  if (!source) {
    return null;
  }

  return {
    source,
    productTypeId: normalizeString(record.productTypeId),
    productTypeLabel: normalizeString(record.productTypeLabel),
    buildTypeId: normalizeString(record.buildTypeId),
    buildTypeLabel: normalizeString(record.buildTypeLabel),
    buildStageId: normalizeString(record.buildStageId),
    buildStageLabel: normalizeString(record.buildStageLabel),
    intentMode:
      record.intentMode === "known-industry" || record.intentMode === "exploring-opportunities"
        ? record.intentMode
        : undefined,
    industryId: normalizeString(record.industryId),
    industryLabel: normalizeString(record.industryLabel),
    opportunityAreaId: normalizeString(record.opportunityAreaId),
    opportunityAreaLabel: normalizeString(record.opportunityAreaLabel),
    frameworkId: normalizeString(record.frameworkId),
    frameworkLabel: normalizeString(record.frameworkLabel),
    selectedPathId: normalizePathId(record.selectedPathId),
    selectedPathLabel: normalizeString(record.selectedPathLabel),
    recommendedPathId: normalizePathId(record.recommendedPathId),
    recommendedPathLabel: normalizeString(record.recommendedPathLabel),
    exampleId: normalizeString(record.exampleId),
    exampleLabel: normalizeString(record.exampleLabel),
    stackRecommendationLabel: normalizeString(record.stackRecommendationLabel),
    stackRecommendationSummary: normalizeString(record.stackRecommendationSummary),
    stackSystems: normalizePreferences(record.stackSystems),
    preferences: normalizePreferences(record.preferences),
    userIntent: normalizeString(record.userIntent),
    onboardingStep: normalizeStep(record.onboardingStep),
    title: normalizeString(record.title),
    summary: normalizeString(record.summary),
    businessDirectionSummary: normalizeString(record.businessDirectionSummary),
    projectDefinitionSummary: normalizeString(record.projectDefinitionSummary),
    experienceDirectionSummary: normalizeString(record.experienceDirectionSummary),
    estimateBaseline: normalizeString(record.estimateBaseline),
    estimateRange: normalizeString(record.estimateRange),
    timeEstimate: normalizeString(record.timeEstimate),
    updatedAt: normalizeString(record.updatedAt) ?? new Date(0).toISOString(),
  };
}

export function buildGuidedBuildHandoffSummary(handoff: GuidedBuildHandoff | null) {
  if (!handoff) {
    return "";
  }

  const lines = [
    handoff.source === "example-build"
      ? "Continuing from guided setup via Example Build."
      : handoff.source === "start"
        ? "Continuing from the real DIY builder setup."
        : "Continuing from guided setup via the Neroa homepage guide.",
    handoff.productTypeLabel || handoff.buildTypeLabel
      ? `Product type: ${handoff.productTypeLabel ?? handoff.buildTypeLabel}.`
      : null,
    handoff.buildStageLabel ? `Build stage: ${handoff.buildStageLabel}.` : null,
    handoff.intentMode === "known-industry" && handoff.industryLabel
      ? `Industry: ${handoff.industryLabel}.`
      : null,
    handoff.intentMode === "exploring-opportunities" && handoff.opportunityAreaLabel
      ? `Opportunity area: ${handoff.opportunityAreaLabel}.`
      : null,
    handoff.frameworkLabel ? `Framework: ${handoff.frameworkLabel}.` : null,
    handoff.exampleLabel ? `Example explored: ${handoff.exampleLabel}.` : null,
    handoff.selectedPathLabel ? `Selected path: ${handoff.selectedPathLabel}.` : null,
    handoff.recommendedPathLabel ? `Recommended path: ${handoff.recommendedPathLabel}.` : null,
    handoff.stackRecommendationLabel
      ? `Stack direction: ${handoff.stackRecommendationLabel}.`
      : null,
    handoff.businessDirectionSummary
      ? `Business direction: ${handoff.businessDirectionSummary}.`
      : null,
    handoff.projectDefinitionSummary
      ? `Project definition: ${handoff.projectDefinitionSummary}.`
      : null,
    handoff.userIntent ? `Intent carried forward: ${handoff.userIntent}.` : null,
    handoff.preferences && handoff.preferences.length > 0
      ? `Preferences: ${handoff.preferences.join(", ")}.`
      : null,
  ].filter((line): line is string => Boolean(line));

  return lines.join(" ");
}
