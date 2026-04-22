export type CommandCenterDecisionStatus =
  | "unanswered"
  | "awaiting_review"
  | "resolved"
  | "deferred";

export type CommandCenterDecisionSeverity = "critical" | "important" | "normal";

export type CommandCenterDecisionSourceType =
  | "derived_planning_gap"
  | "user_requested_change"
  | "execution_precondition"
  | "future_system_placeholder";

export type CommandCenterDecisionRelatedArea =
  | "first_user"
  | "product_scope"
  | "naming"
  | "branding"
  | "roadmap"
  | "integrations"
  | "build_handoff"
  | "execution_logic"
  | "pricing"
  | "compliance"
  | "unknown";

export type StoredCommandCenterDecision = {
  id: string;
  title: string;
  prompt: string;
  rationale: string;
  category: string;
  severity: CommandCenterDecisionSeverity;
  status: CommandCenterDecisionStatus;
  blocking: boolean;
  sourceType: CommandCenterDecisionSourceType;
  relatedArea: CommandCenterDecisionRelatedArea;
  answerPreview: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const decisionStatuses: CommandCenterDecisionStatus[] = [
  "unanswered",
  "awaiting_review",
  "resolved",
  "deferred"
];

const decisionSeverities: CommandCenterDecisionSeverity[] = ["critical", "important", "normal"];

const decisionSourceTypes: CommandCenterDecisionSourceType[] = [
  "derived_planning_gap",
  "user_requested_change",
  "execution_precondition",
  "future_system_placeholder"
];

const decisionRelatedAreas: CommandCenterDecisionRelatedArea[] = [
  "first_user",
  "product_scope",
  "naming",
  "branding",
  "roadmap",
  "integrations",
  "build_handoff",
  "execution_logic",
  "pricing",
  "compliance",
  "unknown"
];

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeCommandCenterDecisionStatus(
  value: unknown
): CommandCenterDecisionStatus | null {
  return decisionStatuses.includes(value as CommandCenterDecisionStatus)
    ? (value as CommandCenterDecisionStatus)
    : null;
}

export function isOpenDecisionStatus(status: CommandCenterDecisionStatus) {
  return status === "unanswered" || status === "awaiting_review";
}

export function normalizeStoredCommandCenterDecision(
  value: unknown
): StoredCommandCenterDecision | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = asNonEmptyString(record.id);
  const title = asNonEmptyString(record.title);
  const prompt = asNonEmptyString(record.prompt);
  const rationale = asNonEmptyString(record.rationale);
  const category = asNonEmptyString(record.category);
  const severity = decisionSeverities.includes(record.severity as CommandCenterDecisionSeverity)
    ? (record.severity as CommandCenterDecisionSeverity)
    : null;
  const status = normalizeCommandCenterDecisionStatus(record.status);
  const sourceType = decisionSourceTypes.includes(
    record.sourceType as CommandCenterDecisionSourceType
  )
    ? (record.sourceType as CommandCenterDecisionSourceType)
    : null;
  const relatedArea = decisionRelatedAreas.includes(
    record.relatedArea as CommandCenterDecisionRelatedArea
  )
    ? (record.relatedArea as CommandCenterDecisionRelatedArea)
    : null;

  if (!id || !title || !prompt || !rationale || !category || !severity || !status || !sourceType || !relatedArea) {
    return null;
  }

  return {
    id,
    title,
    prompt,
    rationale,
    category,
    severity,
    status,
    blocking: Boolean(record.blocking),
    sourceType,
    relatedArea,
    answerPreview: asNullableString(record.answerPreview),
    createdAt: asNullableString(record.createdAt),
    updatedAt: asNullableString(record.updatedAt)
  };
}
