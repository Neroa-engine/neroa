import {
  type FieldStatus,
  type RiskLevel
} from "@/lib/governance";
import type {
  BranchClassificationResult,
  BranchResolutionTarget
} from "@/lib/intelligence/branching";
import {
  BRANCH_NARROWING_RECIPES,
  QUESTION_PRIORITY_BASE_SCORES,
  SPECIALIZATION_NARROWING_RECIPES,
  STATIC_QUESTION_TARGET_REGISTRY,
  TEXT_NARROWING_RECIPES,
  buildFieldTargetId,
  getQuestionRegistryEntry
} from "./catalog";
import type {
  QuestionCandidate,
  QuestionFollowUpMode,
  QuestionProgressOutcome,
  QuestionResponseSignal,
  QuestionSelectionCandidateContext,
  QuestionSelectionSuppression,
  QuestionTargetReference
} from "./types";
import type {
  ExtractionCategoryKey,
  ExtractionFieldKey,
  ExtractionFieldValue,
  ExtractionState,
  UnitIntervalConfidence
} from "@/lib/intelligence/extraction";

const RISK_LEVEL_SCORE: Record<RiskLevel, number> = {
  low: 12,
  moderate: 28,
  high: 52,
  critical: 80
};

function nowIso() {
  return new Date().toISOString();
}

export function createQuestionRecordId(prefix: string, seed: string) {
  const normalized = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return normalized ? `${prefix}-${normalized}` : `${prefix}-${Date.now()}`;
}

export function clampUnitInterval(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function createQuestionConfidence(
  score: number,
  notes?: string,
  minimum?: number
): UnitIntervalConfidence {
  const boundedScore = clampUnitInterval(score);
  const boundedMinimum =
    typeof minimum === "number" ? clampUnitInterval(minimum) : undefined;

  return {
    score: boundedScore,
    scale: "unit_interval",
    minimum: boundedMinimum,
    passed: boundedMinimum === undefined ? undefined : boundedScore >= boundedMinimum,
    notes
  };
}

export function dedupe<T>(values: T[]) {
  return [...new Set(values)];
}

export function mergeUnique<T>(...groups: Array<readonly T[]>) {
  return dedupe(groups.flatMap((group) => [...group]));
}

export function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function extractTextsFromValue(value: ExtractionFieldValue | null) {
  if (!value) {
    return [];
  }

  if (value.kind === "text") {
    return dedupe(
      [value.summary, value.detail, value.rawValue].filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0
      )
    );
  }

  return dedupe(
    [value.summary, ...(value.items ?? []), ...((value.rawValue as string[]) ?? [])].filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0
    )
  );
}

export function stagePriorityBoost(stage: "roadmap" | "execution") {
  return stage === "execution" ? 36 : 28;
}

export function riskLevelWeight(level: RiskLevel) {
  return RISK_LEVEL_SCORE[level];
}

export function fieldStatusWeight(status: FieldStatus) {
  switch (status) {
    case "conflicting":
      return 84;
    case "unanswered":
      return 72;
    case "partial":
      return 46;
    case "inferred":
      return 40;
    case "answered":
      return 12;
    case "validated":
      return 0;
    default:
      return 0;
  }
}

export function buildTargetReference(args: {
  targetId: string;
  label?: string;
  fieldKey?: ExtractionFieldKey;
  categoryKey?: ExtractionCategoryKey;
  contradictionId?: string;
  assumptionId?: string;
  unknownId?: string;
  overlayKey?: BranchClassificationResult["overlays"][keyof BranchClassificationResult["overlays"]]["overlayKey"];
  readinessStage?: "roadmap" | "execution";
  branchResolutionTarget?: BranchResolutionTarget;
}) {
  const registryEntry = getQuestionRegistryEntry(args.targetId);

  return {
    targetId: args.targetId,
    kind:
      registryEntry?.kind ??
      (args.contradictionId
        ? "contradiction"
        : args.assumptionId
        ? "assumption"
        : args.unknownId
        ? "unknown"
        : args.overlayKey
        ? "overlay"
        : args.readinessStage
        ? "readiness"
        : args.branchResolutionTarget
        ? "branch"
        : args.fieldKey
        ? "field"
        : args.categoryKey
        ? "category"
        : "field"),
    label: args.label ?? registryEntry?.label ?? args.targetId,
    fieldKey: args.fieldKey,
    categoryKey: args.categoryKey,
    contradictionId: args.contradictionId,
    assumptionId: args.assumptionId,
    unknownId: args.unknownId,
    overlayKey: args.overlayKey,
    readinessStage: args.readinessStage,
    branchResolutionTarget: args.branchResolutionTarget,
    registryId: registryEntry?.targetId
  } satisfies QuestionTargetReference;
}

export function describeTarget(target: QuestionTargetReference) {
  return target.label;
}

export function recoverySignal(signal?: QuestionResponseSignal) {
  return signal === "does_not_know" || signal === "uncertain" || signal === "avoided";
}

export function progressSuppressesRepeat(outcome: QuestionProgressOutcome) {
  return outcome === "resolved" || outcome === "no_change";
}

export function latestHistoryForTarget(
  context: QuestionSelectionCandidateContext,
  targetId: string
) {
  const matches = context.history.filter((entry) => entry.targetId === targetId);
  return matches.length > 0 ? matches[matches.length - 1] : null;
}

function fieldStatusChanged(
  current: ExtractionState,
  targetFieldKeys: ExtractionFieldKey[],
  snapshot?: Partial<Record<ExtractionFieldKey, FieldStatus>>
) {
  if (!snapshot) {
    return true;
  }

  return targetFieldKeys.some((fieldKey) => snapshot[fieldKey] !== current.fields[fieldKey].status);
}

export function evaluateSuppression(
  context: QuestionSelectionCandidateContext,
  candidate: QuestionCandidate
): QuestionSelectionSuppression {
  const latest = latestHistoryForTarget(context, candidate.target.targetId);

  if (!latest) {
    return { suppressed: false, reasons: [] };
  }

  const reasons: string[] = [];
  const reopened =
    candidate.relatedContradictionIds.length > 0 ||
    candidate.followUpMode === "reopen" ||
    candidate.questionType === "assumption_confirmation" ||
    candidate.questionType === "contradiction_resolution";
  const statusChanged = fieldStatusChanged(
    context.extractionState,
    candidate.relatedFieldKeys,
    latest.fieldStatusSnapshot
  );

  if (progressSuppressesRepeat(latest.outcome) && !statusChanged && !reopened) {
    reasons.push("The same target was already covered and no new blocking change reopened it.");
  }

  if (
    latest.outcome === "resolved" &&
    candidate.relatedFieldKeys.every((fieldKey) => {
      const status = context.extractionState.fields[fieldKey]?.status;
      return status === "answered" || status === "validated";
    }) &&
    !reopened
  ) {
    reasons.push("The related field is already answered or validated.");
  }

  if (
    latest.outcome === "no_change" &&
    !recoverySignal(candidate.status === "suppressed" ? undefined : context.lastResponseSignal) &&
    candidate.followUpMode !== "recovery" &&
    !reopened
  ) {
    reasons.push("Repeating the same target now would likely create a low-value loop.");
  }

  if (
    candidate.priorityScore < QUESTION_PRIORITY_BASE_SCORES.partial_truth_narrowing &&
    context.history.slice(-2).some((entry) =>
      entry.relatedCategoryKeys.some((categoryKey) =>
        candidate.relatedCategoryKeys.includes(categoryKey)
      )
    ) &&
    !statusChanged
  ) {
    reasons.push("This category is not ready for another lower-value follow-up yet.");
  }

  return {
    suppressed: reasons.length > 0,
    reasons
  };
}

export function selectRecoveryTargetId(args: {
  context: QuestionSelectionCandidateContext;
  targetId: string;
  preferredTargetIds?: string[];
}) {
  const registryEntry = getQuestionRegistryEntry(args.targetId);
  const candidates = [
    ...(args.preferredTargetIds ?? []),
    ...(registryEntry?.recoveryTargetIds ?? [])
  ];

  return (
    candidates.find((candidateTargetId) => {
      const entry = STATIC_QUESTION_TARGET_REGISTRY[candidateTargetId];

      if (!entry || entry.fieldKeys.length === 0) {
        return false;
      }

      return entry.fieldKeys.some((fieldKey) => {
        const status = args.context.extractionState.fields[fieldKey].status;
        return status === "unanswered" || status === "partial" || status === "inferred";
      });
    }) ?? null
  );
}

export function selectNarrowingTargetId(args: {
  context: QuestionSelectionCandidateContext;
  baseFieldKey?: ExtractionFieldKey;
}) {
  const texts = mergeUnique(
    ...Object.values(args.context.extractionState.fields).map((field) =>
      extractTextsFromValue(field.value).map((value) => normalizeText(value))
    )
  );
  const specializationRecipe = args.context.branchClassification.specialization
    ? SPECIALIZATION_NARROWING_RECIPES[args.context.branchClassification.specialization.key]
    : undefined;
  const branchRecipe =
    BRANCH_NARROWING_RECIPES[
      args.context.branchClassification.primaryBranch?.branch ?? "Hybrid / Composite System"
    ] ?? [];
  const textRecipe = TEXT_NARROWING_RECIPES.find((recipe) =>
    recipe.matchAny.some((keyword) => texts.some((text) => text.includes(keyword)))
  );
  const baseTargetIds = args.baseFieldKey
    ? STATIC_QUESTION_TARGET_REGISTRY[buildFieldTargetId(args.baseFieldKey)]?.narrowingTargetIds ?? []
    : [];
  const candidates = [
    ...(specializationRecipe ?? []),
    ...(textRecipe?.preferredTargetIds ?? []),
    ...branchRecipe,
    ...baseTargetIds
  ];

  return (
    candidates.find((targetId) => {
      const entry = STATIC_QUESTION_TARGET_REGISTRY[targetId];

      if (!entry) {
        return false;
      }

      return entry.fieldKeys.some((fieldKey) => {
        const status = args.context.extractionState.fields[fieldKey].status;
        return status === "unanswered" || status === "partial" || status === "inferred";
      });
    }) ?? null
  );
}

export function candidatePriorityBase(questionType: QuestionCandidate["questionType"]) {
  return QUESTION_PRIORITY_BASE_SCORES[questionType];
}

export function buildGapText(args: {
  fieldKey?: ExtractionFieldKey;
  categoryKey?: ExtractionCategoryKey;
  customGap?: string;
}) {
  if (args.customGap) {
    return args.customGap;
  }

  if (args.fieldKey === "primary_users") {
    return "Identify the first users, buyers, or operators clearly enough to stop actor ambiguity.";
  }

  if (args.fieldKey === "core_workflow") {
    return "Clarify the smallest missing workflow step that changes system shape.";
  }

  if (args.fieldKey === "mvp_out_of_scope") {
    return "Name what must stay out of the first version so roadmap scope stops drifting.";
  }

  if (args.fieldKey === "systems_touched" || args.fieldKey === "integrations") {
    return "Clarify which systems matter right away so architecture boundaries stay clean.";
  }

  if (args.fieldKey === "constraints") {
    return "Clarify the limiting constraint that should shape scope or sequencing.";
  }

  if (args.categoryKey === "branch_product_type") {
    return "Resolve the smallest remaining branch decision that changes roadmap direction.";
  }

  return "Clarify the smallest remaining decision gap instead of reopening the whole category.";
}

export function createLastUpdateMetadata(updateReason: string, updatedBy?: string) {
  return {
    updatedAt: nowIso(),
    updatedBy,
    updateReason
  };
}
