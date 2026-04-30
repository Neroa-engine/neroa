import type {
  DeltaAnalysisResult,
  GovernanceSuggestedSurface
} from "@/lib/intelligence/governance/types";

export type CommandCenterTaskStatus =
  | "queued"
  | "in_review"
  | "waiting_on_decision"
  | "ready"
  | "active"
  | "completed";

export const COMMAND_CENTER_CUSTOMER_REQUEST_TYPES = [
  "new_request",
  "revision",
  "change_direction",
  "problem_bug",
  "question_decision"
] as const;

export type CommandCenterCustomerRequestType =
  (typeof COMMAND_CENTER_CUSTOMER_REQUEST_TYPES)[number];

export type CommandCenterTaskRequestTypeSource = "manual" | "inferred" | "system";

export type CommandCenterTaskRoutingHint =
  | "direct_execution_candidate"
  | "planning_review"
  | "bug_regression_review"
  | "decision_support";

export type CommandCenterTaskIntelligenceMetadata = {
  classifierVersion: "command_center_customer_request_v1";
  requestType: CommandCenterCustomerRequestType;
  requestTypeLabel: string;
  requestTypeSource: CommandCenterTaskRequestTypeSource;
  routingHint: CommandCenterTaskRoutingHint;
  planningCandidate: boolean;
  bugCandidate: boolean;
  regressionCandidate: boolean;
  billabilityReviewRequired: boolean;
};

export const COMMAND_CENTER_TASK_STRATEGY_REVIEW_KINDS = [
  "roadmap_deviation",
  "decision_required",
  "clarification_required"
] as const;

export type CommandCenterTaskStrategyReviewKind =
  (typeof COMMAND_CENTER_TASK_STRATEGY_REVIEW_KINDS)[number];

export const COMMAND_CENTER_TASK_ROADMAP_DEVIATION_STATUSES = [
  "pending_strategy_review",
  "clarification_requested",
  "approved_for_roadmap_revision",
  "approved_as_replacement",
  "deferred",
  "rejected",
  "resolved_for_execution"
] as const;

export type CommandCenterTaskRoadmapDeviationStatus =
  (typeof COMMAND_CENTER_TASK_ROADMAP_DEVIATION_STATUSES)[number];

export const COMMAND_CENTER_TASK_ROADMAP_DECISION_OPTIONS = [
  "approve_roadmap_revision",
  "defer_request",
  "reject_request",
  "replace_current_direction",
  "ask_for_clarification"
] as const;

export type CommandCenterTaskRoadmapDecisionOption =
  (typeof COMMAND_CENTER_TASK_ROADMAP_DECISION_OPTIONS)[number];

export type CommandCenterTaskRoadmapDeviation = {
  reviewKind: CommandCenterTaskStrategyReviewKind;
  status: CommandCenterTaskRoadmapDeviationStatus;
  detectionStage: "request_intake" | "execution_gate" | "pending_release" | "strategy_room";
  requestClass: DeltaAnalysisResult["requestClass"];
  outcome: DeltaAnalysisResult["outcome"];
  reason: string;
  changedSummary: string;
  riskSummary: string;
  decisionNeeded: string;
  suggestedNextSurface: GovernanceSuggestedSurface;
  suggestedNextAction: string;
  requiresRoadmapRevision: boolean;
  requiresArchitectureRevision: boolean;
  requiresGovernanceReview: boolean;
  requiresApprovalReset: boolean;
  latestDecision: CommandCenterTaskRoadmapDecisionOption | null;
  latestDecisionAt: string | null;
  linkedStrategyRevisionId: string | null;
  linkedRoadmapRevisionId: string | null;
  detectedAt: string | null;
  updatedAt: string | null;
  resolvedAt: string | null;
};

export type CommandCenterTaskSourceType =
  | "customer_request"
  | "decision_follow_up"
  | "change_review_follow_up"
  | "roadmap_follow_up"
  | "signal_cleanup";

export type StoredCommandCenterTask = {
  id: string;
  title: string;
  request: string;
  status: CommandCenterTaskStatus;
  roadmapArea: string;
  sourceType: CommandCenterTaskSourceType;
  intelligenceMetadata?: CommandCenterTaskIntelligenceMetadata | null;
  roadmapDeviation?: CommandCenterTaskRoadmapDeviation | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const taskStatuses: CommandCenterTaskStatus[] = [
  "queued",
  "in_review",
  "waiting_on_decision",
  "ready",
  "active",
  "completed"
];

const taskSourceTypes: CommandCenterTaskSourceType[] = [
  "customer_request",
  "decision_follow_up",
  "change_review_follow_up",
  "roadmap_follow_up",
  "signal_cleanup"
];

const taskRequestTypeSources: CommandCenterTaskRequestTypeSource[] = [
  "manual",
  "inferred",
  "system"
];

const taskRoutingHints: CommandCenterTaskRoutingHint[] = [
  "direct_execution_candidate",
  "planning_review",
  "bug_regression_review",
  "decision_support"
];

const taskStrategyReviewKinds: CommandCenterTaskStrategyReviewKind[] = [
  "roadmap_deviation",
  "decision_required",
  "clarification_required"
];

const taskRoadmapDeviationStatuses: CommandCenterTaskRoadmapDeviationStatus[] = [
  "pending_strategy_review",
  "clarification_requested",
  "approved_for_roadmap_revision",
  "approved_as_replacement",
  "deferred",
  "rejected",
  "resolved_for_execution"
];

const taskRoadmapDecisionOptions: CommandCenterTaskRoadmapDecisionOption[] = [
  "approve_roadmap_revision",
  "defer_request",
  "reject_request",
  "replace_current_direction",
  "ask_for_clarification"
];

const deltaRequestClasses: DeltaAnalysisResult["requestClass"][] = [
  "within_approved_scope",
  "pre_approval_request",
  "scope_expansion",
  "architecture_expansion",
  "governance_conflict"
];

const deltaOutcomes: DeltaAnalysisResult["outcome"][] = [
  "execution_ready_after_gate",
  "pending_execution",
  "roadmap_revision_required",
  "architecture_revision_required",
  "governance_blocked"
];

const governanceSuggestedSurfaces: GovernanceSuggestedSurface[] = [
  "command_center",
  "strategy_room",
  "build_room"
];

const requestTypeLabels: Record<CommandCenterCustomerRequestType, string> = {
  new_request: "New request",
  revision: "Revision",
  change_direction: "Change direction",
  problem_bug: "Problem / bug",
  question_decision: "Question / decision"
};

const roadmapDeviationStatusLabels: Record<
  CommandCenterTaskRoadmapDeviationStatus,
  string
> = {
  pending_strategy_review: "Strategy review required",
  clarification_requested: "Clarification requested",
  approved_for_roadmap_revision: "Roadmap revision approved",
  approved_as_replacement: "Replacement direction approved",
  deferred: "Deferred",
  rejected: "Rejected",
  resolved_for_execution: "Resolved for execution"
};

const roadmapDecisionOptionLabels: Record<
  CommandCenterTaskRoadmapDecisionOption,
  string
> = {
  approve_roadmap_revision: "Approve roadmap revision",
  defer_request: "Defer request",
  reject_request: "Reject request",
  replace_current_direction: "Replace current direction",
  ask_for_clarification: "Ask for clarification"
};

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function includesAny(text: string, candidates: readonly string[]) {
  return candidates.some((candidate) => text.includes(candidate));
}

function normalizeRequestText(value: string | null | undefined) {
  return typeof value === "string" ? value.toLowerCase().replace(/\s+/g, " ").trim() : "";
}

function inferRegressionCandidate(text: string) {
  return includesAny(text, [
    "regression",
    "regressed",
    "used to work",
    "worked before",
    "working before",
    "stopped working",
    "broke",
    "broken",
    "after the last",
    "after the recent",
    "after the update",
    "since the update"
  ]);
}

export function normalizeCommandCenterTaskStatus(
  value: unknown
): CommandCenterTaskStatus | null {
  return taskStatuses.includes(value as CommandCenterTaskStatus)
    ? (value as CommandCenterTaskStatus)
    : null;
}

function normalizeCommandCenterTaskRequestTypeSource(
  value: unknown
): CommandCenterTaskRequestTypeSource | null {
  return taskRequestTypeSources.includes(value as CommandCenterTaskRequestTypeSource)
    ? (value as CommandCenterTaskRequestTypeSource)
    : null;
}

function normalizeCommandCenterTaskRoutingHint(
  value: unknown
): CommandCenterTaskRoutingHint | null {
  return taskRoutingHints.includes(value as CommandCenterTaskRoutingHint)
    ? (value as CommandCenterTaskRoutingHint)
    : null;
}

function normalizeCommandCenterTaskStrategyReviewKind(
  value: unknown
): CommandCenterTaskStrategyReviewKind | null {
  return taskStrategyReviewKinds.includes(value as CommandCenterTaskStrategyReviewKind)
    ? (value as CommandCenterTaskStrategyReviewKind)
    : null;
}

function normalizeCommandCenterTaskRoadmapDeviationStatus(
  value: unknown
): CommandCenterTaskRoadmapDeviationStatus | null {
  return taskRoadmapDeviationStatuses.includes(value as CommandCenterTaskRoadmapDeviationStatus)
    ? (value as CommandCenterTaskRoadmapDeviationStatus)
    : null;
}

function normalizeCommandCenterTaskDeltaRequestClass(
  value: unknown
): DeltaAnalysisResult["requestClass"] | null {
  return deltaRequestClasses.includes(value as DeltaAnalysisResult["requestClass"])
    ? (value as DeltaAnalysisResult["requestClass"])
    : null;
}

function normalizeCommandCenterTaskDeltaOutcome(
  value: unknown
): DeltaAnalysisResult["outcome"] | null {
  return deltaOutcomes.includes(value as DeltaAnalysisResult["outcome"])
    ? (value as DeltaAnalysisResult["outcome"])
    : null;
}

function normalizeGovernanceSuggestedSurface(
  value: unknown
): GovernanceSuggestedSurface | null {
  return governanceSuggestedSurfaces.includes(value as GovernanceSuggestedSurface)
    ? (value as GovernanceSuggestedSurface)
    : null;
}

export function normalizeCommandCenterTaskSourceType(
  value: unknown
): CommandCenterTaskSourceType | null {
  return taskSourceTypes.includes(value as CommandCenterTaskSourceType)
    ? (value as CommandCenterTaskSourceType)
    : null;
}

export function normalizeCommandCenterCustomerRequestType(
  value: unknown
): CommandCenterCustomerRequestType | null {
  return COMMAND_CENTER_CUSTOMER_REQUEST_TYPES.includes(value as CommandCenterCustomerRequestType)
    ? (value as CommandCenterCustomerRequestType)
    : null;
}

function normalizeCommandCenterTaskIntelligenceMetadata(
  value: unknown
): CommandCenterTaskIntelligenceMetadata | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const requestType = normalizeCommandCenterCustomerRequestType(record.requestType);
  const requestTypeLabel = asNonEmptyString(record.requestTypeLabel);
  const requestTypeSource = normalizeCommandCenterTaskRequestTypeSource(record.requestTypeSource);
  const routingHint = normalizeCommandCenterTaskRoutingHint(record.routingHint);
  const classifierVersion =
    record.classifierVersion === "command_center_customer_request_v1"
      ? "command_center_customer_request_v1"
      : null;
  const planningCandidate = asBoolean(record.planningCandidate);
  const bugCandidate = asBoolean(record.bugCandidate);
  const regressionCandidate = asBoolean(record.regressionCandidate);
  const billabilityReviewRequired = asBoolean(record.billabilityReviewRequired);

  if (
    !requestType ||
    !requestTypeLabel ||
    !requestTypeSource ||
    !routingHint ||
    !classifierVersion ||
    planningCandidate === null ||
    bugCandidate === null ||
    regressionCandidate === null ||
    billabilityReviewRequired === null
  ) {
    return null;
  }

  return {
    classifierVersion,
    requestType,
    requestTypeLabel,
    requestTypeSource,
    routingHint,
    planningCandidate,
    bugCandidate,
    regressionCandidate,
    billabilityReviewRequired
  };
}

export function normalizeCommandCenterTaskRoadmapDecisionOption(
  value: unknown
): CommandCenterTaskRoadmapDecisionOption | null {
  return taskRoadmapDecisionOptions.includes(value as CommandCenterTaskRoadmapDecisionOption)
    ? (value as CommandCenterTaskRoadmapDecisionOption)
    : null;
}

function normalizeCommandCenterTaskRoadmapDeviation(
  value: unknown
): CommandCenterTaskRoadmapDeviation | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const reviewKind = normalizeCommandCenterTaskStrategyReviewKind(record.reviewKind);
  const status = normalizeCommandCenterTaskRoadmapDeviationStatus(record.status);
  const detectionStage =
    record.detectionStage === "request_intake" ||
    record.detectionStage === "execution_gate" ||
    record.detectionStage === "pending_release" ||
    record.detectionStage === "strategy_room"
      ? record.detectionStage
      : null;
  const requestClass = normalizeCommandCenterTaskDeltaRequestClass(record.requestClass);
  const outcome = normalizeCommandCenterTaskDeltaOutcome(record.outcome);
  const reason = asNonEmptyString(record.reason);
  const changedSummary = asNonEmptyString(record.changedSummary);
  const riskSummary = asNonEmptyString(record.riskSummary);
  const decisionNeeded = asNonEmptyString(record.decisionNeeded);
  const suggestedNextSurface = normalizeGovernanceSuggestedSurface(record.suggestedNextSurface);
  const suggestedNextAction = asNonEmptyString(record.suggestedNextAction);
  const requiresRoadmapRevision = asBoolean(record.requiresRoadmapRevision);
  const requiresArchitectureRevision = asBoolean(record.requiresArchitectureRevision);
  const requiresGovernanceReview = asBoolean(record.requiresGovernanceReview);
  const requiresApprovalReset = asBoolean(record.requiresApprovalReset);
  const latestDecision = normalizeCommandCenterTaskRoadmapDecisionOption(record.latestDecision);
  const latestDecisionAt = asNullableString(record.latestDecisionAt);
  const linkedStrategyRevisionId = asNullableString(record.linkedStrategyRevisionId);
  const linkedRoadmapRevisionId = asNullableString(record.linkedRoadmapRevisionId);
  const detectedAt = asNullableString(record.detectedAt);
  const updatedAt = asNullableString(record.updatedAt);
  const resolvedAt = asNullableString(record.resolvedAt);

  if (
    !reviewKind ||
    !status ||
    !detectionStage ||
    !requestClass ||
    !outcome ||
    !reason ||
    !changedSummary ||
    !riskSummary ||
    !decisionNeeded ||
    !suggestedNextSurface ||
    !suggestedNextAction ||
    requiresRoadmapRevision === null ||
    requiresArchitectureRevision === null ||
    requiresGovernanceReview === null ||
    requiresApprovalReset === null
  ) {
    return null;
  }

  return {
    reviewKind,
    status,
    detectionStage,
    requestClass,
    outcome,
    reason,
    changedSummary,
    riskSummary,
    decisionNeeded,
    suggestedNextSurface,
    suggestedNextAction,
    requiresRoadmapRevision,
    requiresArchitectureRevision,
    requiresGovernanceReview,
    requiresApprovalReset,
    latestDecision,
    latestDecisionAt,
    linkedStrategyRevisionId,
    linkedRoadmapRevisionId,
    detectedAt,
    updatedAt,
    resolvedAt
  };
}

export function formatCommandCenterCustomerRequestTypeLabel(
  value: CommandCenterCustomerRequestType
) {
  return requestTypeLabels[value];
}

export function formatCommandCenterTaskRoadmapDeviationStatusLabel(
  value: CommandCenterTaskRoadmapDeviationStatus
) {
  return roadmapDeviationStatusLabels[value];
}

export function formatCommandCenterTaskRoadmapDecisionOptionLabel(
  value: CommandCenterTaskRoadmapDecisionOption
) {
  return roadmapDecisionOptionLabels[value];
}

export function commandCenterTaskRoadmapDeviationBlocksExecution(
  value: CommandCenterTaskRoadmapDeviation | null | undefined
) {
  return Boolean(value && value.status !== "resolved_for_execution");
}

export function inferCommandCenterCustomerRequestType(
  request: string | null | undefined
): CommandCenterCustomerRequestType {
  const normalized = normalizeRequestText(request);

  if (!normalized) {
    return "new_request";
  }

  if (
    includesAny(normalized, [
      "bug",
      "issue",
      "problem",
      "broken",
      "broke",
      "error",
      "failing",
      "fix",
      "doesn't work",
      "doesnt work",
      "not working",
      "regression",
      "regressed",
      "crash"
    ])
  ) {
    return "problem_bug";
  }

  if (
    includesAny(normalized, [
      "change direction",
      "different direction",
      "go in a different direction",
      "pivot",
      "off roadmap",
      "off-roadmap",
      "instead of",
      "rather than",
      "switch direction",
      "new direction"
    ])
  ) {
    return "change_direction";
  }

  if (
    includesAny(normalized, [
      "question",
      "should we",
      "should i",
      "can we decide",
      "need a decision",
      "what do you think",
      "which should",
      "which option",
      "decide whether",
      "decision"
    ]) || /[?]/.test(normalized)
  ) {
    return "question_decision";
  }

  if (
    includesAny(normalized, [
      "revise",
      "revision",
      "adjust",
      "tweak",
      "tighten",
      "refine",
      "update",
      "improve",
      "edit",
      "change the current",
      "change what we have"
    ])
  ) {
    return "revision";
  }

  return "new_request";
}

export function isOpenCommandCenterTaskStatus(status: CommandCenterTaskStatus) {
  return status !== "completed";
}

export function normalizeStoredCommandCenterTask(
  value: unknown
): StoredCommandCenterTask | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = asNonEmptyString(record.id);
  const title = asNonEmptyString(record.title);
  const request = asNonEmptyString(record.request);
  const status = normalizeCommandCenterTaskStatus(record.status);
  const roadmapArea = asNonEmptyString(record.roadmapArea);
  const sourceType = normalizeCommandCenterTaskSourceType(record.sourceType);

  if (!id || !title || !request || !status || !roadmapArea || !sourceType) {
    return null;
  }

  return {
    id,
    title,
    request,
    status,
    roadmapArea,
    sourceType,
    intelligenceMetadata: normalizeCommandCenterTaskIntelligenceMetadata(record.intelligenceMetadata),
    roadmapDeviation: normalizeCommandCenterTaskRoadmapDeviation(record.roadmapDeviation),
    createdAt: asNullableString(record.createdAt),
    updatedAt: asNullableString(record.updatedAt)
  };
}
