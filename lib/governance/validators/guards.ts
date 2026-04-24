import {
  BRANCH_FAMILIES,
  CONTRADICTION_SEVERITIES,
  EXECUTION_GATE_OUTCOMES,
  FIELD_STATUSES,
  CONFIDENCE_SCORE_RANGES,
  type BranchFamily,
  type ContradictionSeverity,
  type ExecutionGateOutcome,
  type FieldStatus
} from "../constants";
import type { ConfidenceState } from "../types";

function isLiteralMember<T extends readonly string[]>(
  values: T,
  value: unknown
): value is T[number] {
  return typeof value === "string" && values.includes(value as T[number]);
}

export function isExecutionGateOutcome(value: unknown): value is ExecutionGateOutcome {
  return isLiteralMember(EXECUTION_GATE_OUTCOMES, value);
}

export function isBranchFamily(value: unknown): value is BranchFamily {
  return isLiteralMember(BRANCH_FAMILIES, value);
}

export function isFieldStatus(value: unknown): value is FieldStatus {
  return isLiteralMember(FIELD_STATUSES, value);
}

export function isContradictionSeverity(value: unknown): value is ContradictionSeverity {
  return isLiteralMember(CONTRADICTION_SEVERITIES, value);
}

export function isUnitIntervalConfidenceScore(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= CONFIDENCE_SCORE_RANGES.unitIntervalMin &&
    value <= CONFIDENCE_SCORE_RANGES.unitIntervalMax
  );
}

export function isPercentageConfidenceScore(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= CONFIDENCE_SCORE_RANGES.percentageMin &&
    value <= CONFIDENCE_SCORE_RANGES.percentageMax
  );
}

export function hasConfidenceRangeSanity(value: unknown, scale: ConfidenceState["scale"]) {
  return scale === "unit_interval"
    ? isUnitIntervalConfidenceScore(value)
    : isPercentageConfidenceScore(value);
}

export function isConfidenceState(value: unknown): value is ConfidenceState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<ConfidenceState>;

  if (record.scale !== "unit_interval" && record.scale !== "percentage") {
    return false;
  }

  return hasConfidenceRangeSanity(record.score, record.scale);
}
