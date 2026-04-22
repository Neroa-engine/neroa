export type CommandCenterChangeType =
  | "project_truth_gap"
  | "decision_state_change"
  | "scope_change"
  | "roadmap_change"
  | "build_handoff_change"
  | "metadata_change"
  | "unknown";

export type CommandCenterImpactLevel = "light" | "moderate" | "significant";

export type CommandCenterImpactConfidence = "low" | "medium" | "high";

export type CommandCenterReadinessEffect =
  | "no_change"
  | "review_needed"
  | "more_blocked"
  | "less_blocked";

export type CommandCenterDecisionEffect =
  | "none"
  | "reopen_existing"
  | "create_new"
  | "review_existing";

export type CommandCenterChangeSourceType =
  | "derived_review"
  | "decision_inbox_signal"
  | "project_metadata_signal"
  | "future_system_placeholder";

export type CommandCenterChangeReviewStatus =
  | "active"
  | "acknowledged"
  | "follow_up_needed"
  | "no_longer_relevant";

export type StoredCommandCenterChangeReview = {
  id: string;
  title: string;
  summary: string;
  changeType: CommandCenterChangeType;
  impactLevel: CommandCenterImpactLevel;
  confidence: CommandCenterImpactConfidence;
  affectedAreas: string[];
  readinessEffect: CommandCenterReadinessEffect;
  decisionEffect: CommandCenterDecisionEffect;
  followUpRequired: boolean;
  sourceType: CommandCenterChangeSourceType;
  relatedDecisionIds: string[];
  reviewStatus: CommandCenterChangeReviewStatus;
  reviewNote: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const changeTypes: CommandCenterChangeType[] = [
  "project_truth_gap",
  "decision_state_change",
  "scope_change",
  "roadmap_change",
  "build_handoff_change",
  "metadata_change",
  "unknown"
];

const impactLevels: CommandCenterImpactLevel[] = ["light", "moderate", "significant"];

const impactConfidences: CommandCenterImpactConfidence[] = ["low", "medium", "high"];

const readinessEffects: CommandCenterReadinessEffect[] = [
  "no_change",
  "review_needed",
  "more_blocked",
  "less_blocked"
];

const decisionEffects: CommandCenterDecisionEffect[] = [
  "none",
  "reopen_existing",
  "create_new",
  "review_existing"
];

const changeSourceTypes: CommandCenterChangeSourceType[] = [
  "derived_review",
  "decision_inbox_signal",
  "project_metadata_signal",
  "future_system_placeholder"
];

const changeReviewStatuses: CommandCenterChangeReviewStatus[] = [
  "active",
  "acknowledged",
  "follow_up_needed",
  "no_longer_relevant"
];

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

export function normalizeCommandCenterChangeReviewStatus(
  value: unknown
): CommandCenterChangeReviewStatus | null {
  return changeReviewStatuses.includes(value as CommandCenterChangeReviewStatus)
    ? (value as CommandCenterChangeReviewStatus)
    : null;
}

export function isActiveChangeReviewStatus(status: CommandCenterChangeReviewStatus) {
  return status === "active" || status === "acknowledged" || status === "follow_up_needed";
}

export function needsFollowUpChangeReviewStatus(status: CommandCenterChangeReviewStatus) {
  return status === "active" || status === "follow_up_needed";
}

export function normalizeStoredCommandCenterChangeReview(
  value: unknown
): StoredCommandCenterChangeReview | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = asNonEmptyString(record.id);
  const title = asNonEmptyString(record.title);
  const summary = asNonEmptyString(record.summary);
  const changeType = changeTypes.includes(record.changeType as CommandCenterChangeType)
    ? (record.changeType as CommandCenterChangeType)
    : null;
  const impactLevel = impactLevels.includes(record.impactLevel as CommandCenterImpactLevel)
    ? (record.impactLevel as CommandCenterImpactLevel)
    : null;
  const confidence = impactConfidences.includes(record.confidence as CommandCenterImpactConfidence)
    ? (record.confidence as CommandCenterImpactConfidence)
    : null;
  const readinessEffect = readinessEffects.includes(
    record.readinessEffect as CommandCenterReadinessEffect
  )
    ? (record.readinessEffect as CommandCenterReadinessEffect)
    : null;
  const decisionEffect = decisionEffects.includes(
    record.decisionEffect as CommandCenterDecisionEffect
  )
    ? (record.decisionEffect as CommandCenterDecisionEffect)
    : null;
  const sourceType = changeSourceTypes.includes(record.sourceType as CommandCenterChangeSourceType)
    ? (record.sourceType as CommandCenterChangeSourceType)
    : null;
  const reviewStatus = normalizeCommandCenterChangeReviewStatus(record.reviewStatus);

  if (
    !id ||
    !title ||
    !summary ||
    !changeType ||
    !impactLevel ||
    !confidence ||
    !readinessEffect ||
    !decisionEffect ||
    !sourceType ||
    !reviewStatus
  ) {
    return null;
  }

  return {
    id,
    title,
    summary,
    changeType,
    impactLevel,
    confidence,
    affectedAreas: normalizeStringArray(record.affectedAreas),
    readinessEffect,
    decisionEffect,
    followUpRequired: Boolean(record.followUpRequired),
    sourceType,
    relatedDecisionIds: normalizeStringArray(record.relatedDecisionIds),
    reviewStatus,
    reviewNote: asNullableString(record.reviewNote),
    createdAt: asNullableString(record.createdAt),
    updatedAt: asNullableString(record.updatedAt)
  };
}
