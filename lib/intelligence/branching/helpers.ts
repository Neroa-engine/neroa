import type {
  FieldStatus,
  RiskLevel
} from "@/lib/governance";
import type {
  ExtractionCategoryKey,
  ExtractionFieldKey,
  ExtractionFieldValue,
  ExtractionState,
  UnitIntervalConfidence
} from "@/lib/intelligence/extraction";
import {
  BRANCH_FIELD_WEIGHTS,
  FIELD_STATUS_MULTIPLIERS
} from "./catalog";

export interface BranchTextSignalEntry {
  entryId: string;
  text: string;
  normalizedText: string;
  fieldKey: ExtractionFieldKey | null;
  categoryKey: ExtractionCategoryKey;
  sourceIds: string[];
  evidenceIds: string[];
  confidenceMultiplier: number;
  status: FieldStatus;
}

const RISK_LEVEL_RANK: Record<RiskLevel, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4
};

export function nowIso() {
  return new Date().toISOString();
}

export function clampUnitInterval(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function createBranchRecordId(prefix: string, seed: string) {
  const normalized = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return normalized ? `${prefix}-${normalized}` : `${prefix}-record`;
}

export function toUnitIntervalConfidence(
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

export function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function maxRiskLevel(left: RiskLevel, right: RiskLevel): RiskLevel {
  return RISK_LEVEL_RANK[left] >= RISK_LEVEL_RANK[right] ? left : right;
}

export function riskLevelRank(level: RiskLevel) {
  return RISK_LEVEL_RANK[level];
}

export function riskLevelFromRank(rank: number): RiskLevel {
  if (rank >= 4) {
    return "critical";
  }

  if (rank >= 3) {
    return "high";
  }

  if (rank >= 2) {
    return "moderate";
  }

  return "low";
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeText(value: string) {
  return normalizeWhitespace(value.toLowerCase());
}

export function titleCase(value: string) {
  return value
    .split(/\s+/)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function containsKeyword(text: string, keyword: string) {
  const pattern = escapeRegExp(normalizeText(keyword)).replace(/\\ /g, "\\s+");
  return new RegExp(`(^|[^a-z0-9])${pattern}($|[^a-z0-9])`, "i").test(text);
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

function fieldScoreMultiplier(args: {
  fieldKey: ExtractionFieldKey;
  status: FieldStatus;
  confidenceScore: number;
}) {
  return clampUnitInterval(
    BRANCH_FIELD_WEIGHTS[args.fieldKey] *
      FIELD_STATUS_MULTIPLIERS[args.status] *
      clampUnitInterval(args.confidenceScore)
  );
}

function createFieldEntry(args: {
  prefix: string;
  text: string;
  fieldKey: ExtractionFieldKey;
  categoryKey: ExtractionCategoryKey;
  status: FieldStatus;
  confidenceScore: number;
  sourceIds: string[];
  evidenceIds: string[];
}) {
  const text = normalizeWhitespace(args.text);

  return {
    entryId: createBranchRecordId(
      args.prefix,
      `${args.fieldKey}-${text.slice(0, 80)}`
    ),
    text,
    normalizedText: normalizeText(text),
    fieldKey: args.fieldKey,
    categoryKey: args.categoryKey,
    sourceIds: args.sourceIds,
    evidenceIds: args.evidenceIds,
    confidenceMultiplier: fieldScoreMultiplier({
      fieldKey: args.fieldKey,
      status: args.status,
      confidenceScore: args.confidenceScore
    }),
    status: args.status
  };
}

export function collectExtractionSignalEntries(state: ExtractionState) {
  const entries: BranchTextSignalEntry[] = [];

  for (const field of Object.values(state.fields)) {
    for (const text of extractTextsFromValue(field.value)) {
      entries.push(
        createFieldEntry({
          prefix: "branch-field",
          text,
          fieldKey: field.fieldKey,
          categoryKey: field.categoryKey,
          status: field.status,
          confidenceScore: field.confidence.score,
          sourceIds: field.sourceIds,
          evidenceIds: field.evidenceIds
        })
      );
    }
  }

  const requestTexts = [
    state.requestSummary.requestedChangeOrInitiative,
    state.requestSummary.whyItExists,
    state.requestSummary.desiredOutcome,
    state.requestSummary.currentContext
  ].filter((item): item is string => typeof item === "string" && item.trim().length > 0);

  for (const text of requestTexts) {
    entries.push(
      createFieldEntry({
        prefix: "branch-request",
        text,
        fieldKey: "request_summary",
        categoryKey: "request_core_concept",
        status: state.fields.request_summary.status,
        confidenceScore: state.fields.request_summary.confidence.score,
        sourceIds: state.fields.request_summary.sourceIds,
        evidenceIds: state.fields.request_summary.evidenceIds
      })
    );
  }

  return entries;
}

export function getBranchCriticalMissingFieldKeys(state: ExtractionState) {
  return (
    [
      "primary_branch",
      "product_type",
      "primary_users",
      "core_workflow",
      "business_model"
    ] as const
  ).filter((fieldKey) => {
    const field = state.fields[fieldKey];
    return field.status === "unanswered" || field.status === "partial";
  });
}

export function getBranchRelatedUnknowns(state: ExtractionState) {
  return state.unknowns.filter((unknown) =>
    [
      "branch_product_type",
      "actors",
      "workflow",
      "business_model",
      "request_core_concept"
    ].includes(unknown.categoryKey)
  );
}

export function getBranchRelatedContradictions(state: ExtractionState) {
  return state.contradictions.filter((contradiction) =>
    contradiction.linkedCategoryKeys.some((categoryKey) =>
      [
        "branch_product_type",
        "actors",
        "workflow",
        "business_model",
        "request_core_concept"
      ].includes(categoryKey)
    )
  );
}

export function getBranchRelatedAssumptions(state: ExtractionState) {
  return state.assumptions.filter((assumption) =>
    assumption.linkedCategoryKeys.some((categoryKey) =>
      [
        "branch_product_type",
        "actors",
        "workflow",
        "business_model"
      ].includes(categoryKey)
    )
  );
}
