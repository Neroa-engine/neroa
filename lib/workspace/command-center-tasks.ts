export type CommandCenterTaskStatus =
  | "queued"
  | "in_review"
  | "waiting_on_decision"
  | "ready"
  | "active"
  | "completed";

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

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeCommandCenterTaskStatus(
  value: unknown
): CommandCenterTaskStatus | null {
  return taskStatuses.includes(value as CommandCenterTaskStatus)
    ? (value as CommandCenterTaskStatus)
    : null;
}

export function normalizeCommandCenterTaskSourceType(
  value: unknown
): CommandCenterTaskSourceType | null {
  return taskSourceTypes.includes(value as CommandCenterTaskSourceType)
    ? (value as CommandCenterTaskSourceType)
    : null;
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
    createdAt: asNullableString(record.createdAt),
    updatedAt: asNullableString(record.updatedAt)
  };
}
