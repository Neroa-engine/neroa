import { z } from "zod";
import {
  neroaOneEvidenceLinkRecordSchema,
  type NeroaOneEvidenceLinkRecord
} from "./evidence-linking.ts";

const trimmedStringSchema = z.string().trim().min(1);
const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();
const stringListSchema = z.array(trimmedStringSchema);

const AUDIT_ROOM_UNSAFE_CUSTOMER_CONTENT_PATTERN = new RegExp(
  [
    "internalPromptDraft",
    "promptText",
    "raw worker instructions?",
    "raw_worker_output",
    "protectedAreas",
    "model routing",
    "selectedEngine",
    "worker secret",
    "futureDigitalOceanWorkerTarget",
    ['legacy', 'browser', 'extension'].join("\\s+"),
    ['Live', 'View'].join("\\s+"),
    ['side-panel', 'runtime', 'messaging'].join("\\s+"),
    ['chrome', 'storage'].join("\\."),
    ['browser', 'runtime'].join("\\."),
    ['active', 'Tab'].join(""),
    "internal audit-only notes?"
  ].join("|"),
  "i"
);

export const NEROA_ONE_AUDIT_ROOM_EVENT_TYPES = [
  "lane_transition",
  "policy_violation",
  "stuck_item",
  "retry_loop",
  "qc_failure",
  "worker_failure",
  "cost_waste",
  "customer_blocker",
  "strategy_escalation",
  "evidence_ready",
  "system_health"
] as const;

export const NEROA_ONE_AUDIT_ROOM_SEVERITY_LEVELS = [
  "info",
  "warning",
  "critical"
] as const;

export const NEROA_ONE_AUDIT_ROOM_RECOMMENDED_ACTIONS = [
  "observe",
  "notify_admin",
  "create_repair_task",
  "request_customer_answer",
  "escalate_strategy",
  "pause_execution",
  "archive"
] as const;

export const NEROA_ONE_AUDIT_ROOM_SOURCE_LANE_IDS = [
  "ready_to_build",
  "needs_customer_answer",
  "roadmap_revision_required",
  "blocked_missing_information",
  "rejected_outside_scope",
  "codex_execution_packet_draft",
  "prompt_room",
  "code_execution_worker",
  "codex_output_box",
  "output_review",
  "qc_station",
  "evidence_linking",
  "audit_room"
] as const;

export const neroaOneAuditRoomEventTypeSchema = z.enum(NEROA_ONE_AUDIT_ROOM_EVENT_TYPES);
export const neroaOneAuditRoomSeveritySchema = z.enum(NEROA_ONE_AUDIT_ROOM_SEVERITY_LEVELS);
export const neroaOneAuditRoomRecommendedActionSchema = z.enum(
  NEROA_ONE_AUDIT_ROOM_RECOMMENDED_ACTIONS
);
export const neroaOneAuditRoomSourceLaneIdSchema = z.enum(
  NEROA_ONE_AUDIT_ROOM_SOURCE_LANE_IDS
);

export type NeroaOneAuditRoomEventType = z.infer<typeof neroaOneAuditRoomEventTypeSchema>;
export type NeroaOneAuditRoomSeverity = z.infer<typeof neroaOneAuditRoomSeveritySchema>;
export type NeroaOneAuditRoomRecommendedAction = z.infer<
  typeof neroaOneAuditRoomRecommendedActionSchema
>;
export type NeroaOneAuditRoomSourceLaneId = z.infer<
  typeof neroaOneAuditRoomSourceLaneIdSchema
>;

export const neroaOneAuditRoomRelatedIdsSchema = z
  .object({
    executionPacketId: nullableTrimmedStringSchema.default(null),
    promptRoomItemId: nullableTrimmedStringSchema.default(null),
    workerRunId: nullableTrimmedStringSchema.default(null),
    outputId: nullableTrimmedStringSchema.default(null),
    reviewId: nullableTrimmedStringSchema.default(null),
    qcJobId: nullableTrimmedStringSchema.default(null),
    evidenceLinkId: nullableTrimmedStringSchema.default(null),
    evidenceId: nullableTrimmedStringSchema.default(null),
    recordingId: nullableTrimmedStringSchema.default(null),
    reportId: nullableTrimmedStringSchema.default(null),
    customerResultId: nullableTrimmedStringSchema.default(null),
    sourceRecordId: nullableTrimmedStringSchema.default(null),
    upstreamAuditEventId: nullableTrimmedStringSchema.default(null)
  })
  .strict();

export type NeroaOneAuditRoomRelatedIds = z.infer<typeof neroaOneAuditRoomRelatedIdsSchema>;

export const neroaOneFutureAuditServiceTargetSchema = z
  .object({
    deploymentProvider: z.literal("digitalocean"),
    serviceName: trimmedStringSchema,
    queueName: trimmedStringSchema,
    serviceType: z.literal("future_audit_admin_service"),
    readyForMonitoring: z.literal(false),
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOneFutureAuditServiceTarget = z.infer<
  typeof neroaOneFutureAuditServiceTargetSchema
>;

export const neroaOneAuditRoomEventSchema = z
  .object({
    auditEventId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    sourceLaneId: neroaOneAuditRoomSourceLaneIdSchema,
    relatedIds: neroaOneAuditRoomRelatedIdsSchema,
    eventType: neroaOneAuditRoomEventTypeSchema,
    severity: neroaOneAuditRoomSeveritySchema,
    recommendedAction: neroaOneAuditRoomRecommendedActionSchema,
    internalSummary: trimmedStringSchema,
    customerSafeSummary: trimmedStringSchema,
    createdAt: trimmedStringSchema,
    futureAuditServiceTarget: neroaOneFutureAuditServiceTargetSchema
  })
  .strict();

export type NeroaOneAuditRoomEvent = z.infer<typeof neroaOneAuditRoomEventSchema>;

export const neroaOneCustomerSafeAuditEventViewSchema = z
  .object({
    auditEventId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    sourceLaneId: neroaOneAuditRoomSourceLaneIdSchema,
    eventType: neroaOneAuditRoomEventTypeSchema,
    severity: neroaOneAuditRoomSeveritySchema,
    recommendedAction: neroaOneAuditRoomRecommendedActionSchema,
    customerSafeSummary: trimmedStringSchema,
    createdAt: trimmedStringSchema
  })
  .strict();

export type NeroaOneCustomerSafeAuditEventView = z.infer<
  typeof neroaOneCustomerSafeAuditEventViewSchema
>;

export const neroaOneAdminOversightEstimatedWasteRiskSchema = z.enum([
  "low",
  "medium",
  "high"
]);

export type NeroaOneAdminOversightEstimatedWasteRisk = z.infer<
  typeof neroaOneAdminOversightEstimatedWasteRiskSchema
>;

export const neroaOneAdminOversightSummarySchema = z
  .object({
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    openWarnings: z.number().int().min(0),
    criticalAlerts: z.number().int().min(0),
    stuckItems: z.number().int().min(0),
    retryLoopCount: z.number().int().min(0),
    qcFailureCount: z.number().int().min(0),
    workerFailureCount: z.number().int().min(0),
    estimatedWasteRisk: neroaOneAdminOversightEstimatedWasteRiskSchema,
    recommendedAdminAction: neroaOneAuditRoomRecommendedActionSchema,
    updatedAt: trimmedStringSchema
  })
  .strict();

export type NeroaOneAdminOversightSummary = z.infer<
  typeof neroaOneAdminOversightSummarySchema
>;

export const neroaOneAuditRoomLaneDefinitionSchema = z
  .object({
    laneId: z.literal("audit_room"),
    backendOnly: z.literal(true),
    internalOnly: z.literal(true),
    extractionReady: z.literal(true),
    independentlyReplaceable: z.literal(true),
    observerSafe: z.literal(true),
    watchesAllNeroaOneLanes: z.literal(true),
    ownsBackgroundGovernanceSignalsOnly: z.literal(true),
    createsEvidenceLinksNow: z.literal(false),
    mutatesEvidenceLinksNow: z.literal(false),
    archivesEvidenceLinksNow: z.literal(false),
    failsEvidenceLinksNow: z.literal(false),
    storesEvidenceLinksNow: z.literal(false),
    ownsCustomerFacingUiNow: z.literal(false),
    ownsExecutionControlNow: z.literal(false),
    ownsQcRuntimeNow: z.literal(false),
    callsAiNow: z.literal(false),
    storesAuditEventsNow: z.literal(false),
    writesPersistenceNow: z.literal(false),
    exposesCustomerSafeProjectionOnly: z.literal(true),
    displayPurposeInternal: trimmedStringSchema,
    internalOnlyNotes: stringListSchema.min(1),
    supportedEventTypes: z.tuple([
      z.literal("lane_transition"),
      z.literal("policy_violation"),
      z.literal("stuck_item"),
      z.literal("retry_loop"),
      z.literal("qc_failure"),
      z.literal("worker_failure"),
      z.literal("cost_waste"),
      z.literal("customer_blocker"),
      z.literal("strategy_escalation"),
      z.literal("evidence_ready"),
      z.literal("system_health")
    ]),
    supportedSeverityLevels: z.tuple([
      z.literal("info"),
      z.literal("warning"),
      z.literal("critical")
    ]),
    supportedRecommendedActions: z.tuple([
      z.literal("observe"),
      z.literal("notify_admin"),
      z.literal("create_repair_task"),
      z.literal("request_customer_answer"),
      z.literal("escalate_strategy"),
      z.literal("pause_execution"),
      z.literal("archive")
    ]),
    futureAuditServiceTarget: z
      .object({
        serviceName: trimmedStringSchema,
        queueName: trimmedStringSchema,
        notes: stringListSchema.min(1)
      })
      .strict()
  })
  .strict();

export type NeroaOneAuditRoomLaneDefinition = z.infer<
  typeof neroaOneAuditRoomLaneDefinitionSchema
>;

export type NeroaOneAuditRoomEvidenceLinkValidationResult =
  | {
      allowed: true;
      auditLane: NeroaOneAuditRoomLaneDefinition;
      evidenceLaneId: "evidence_linking";
      link: NeroaOneEvidenceLinkRecord;
    }
  | {
      allowed: false;
      auditLane: NeroaOneAuditRoomLaneDefinition;
      evidenceLaneId: "evidence_linking";
      reason: string;
    };

export interface NeroaOneAuditRoomStorageAdapter {
  saveAuditEvent(event: NeroaOneAuditRoomEvent): Promise<void>;
  listAuditEventsByTaskId(taskId: string): Promise<NeroaOneAuditRoomEvent[]>;
}

export interface NeroaOneAdminOversightSummaryAdapter {
  getAdminOversightSummaryByTaskId(
    taskId: string
  ): Promise<NeroaOneAdminOversightSummary | null>;
}

export const neroaOneAuditRoomLane = neroaOneAuditRoomLaneDefinitionSchema.parse({
  laneId: "audit_room",
  backendOnly: true,
  internalOnly: true,
  extractionReady: true,
  independentlyReplaceable: true,
  observerSafe: true,
  watchesAllNeroaOneLanes: true,
  ownsBackgroundGovernanceSignalsOnly: true,
  createsEvidenceLinksNow: false,
  mutatesEvidenceLinksNow: false,
  archivesEvidenceLinksNow: false,
  failsEvidenceLinksNow: false,
  storesEvidenceLinksNow: false,
  ownsCustomerFacingUiNow: false,
  ownsExecutionControlNow: false,
  ownsQcRuntimeNow: false,
  callsAiNow: false,
  storesAuditEventsNow: false,
  writesPersistenceNow: false,
  exposesCustomerSafeProjectionOnly: true,
  displayPurposeInternal:
    "Defines the backend-only Audit Room and Admin Oversight lane that observes Neroa One work across lanes for stuck items, retries, failures, waste risk, and escalation signals.",
  internalOnlyNotes: [
    "Audit Room is a background governor only and must not become a customer-facing room, Build Room surface, or runtime control plane.",
    "This lane is contract-only for a future DigitalOcean audit and admin service and must not store events, wire UI, or call models."
  ],
  supportedEventTypes: [
    "lane_transition",
    "policy_violation",
    "stuck_item",
    "retry_loop",
    "qc_failure",
    "worker_failure",
    "cost_waste",
    "customer_blocker",
    "strategy_escalation",
    "evidence_ready",
    "system_health"
  ],
  supportedSeverityLevels: ["info", "warning", "critical"],
  supportedRecommendedActions: [
    "observe",
    "notify_admin",
    "create_repair_task",
    "request_customer_answer",
    "escalate_strategy",
    "pause_execution",
    "archive"
  ],
  futureAuditServiceTarget: {
    serviceName: "neroa-one-audit-room-service",
    queueName: "neroa-one.audit-room",
    notes: [
      "Future DigitalOcean audit services may observe lane events and produce admin summaries behind this contract.",
      "Current lane remains typed, backend-only, side-effect-light, and storage-free."
    ]
  }
});

function normalizeText(value: string | null | undefined) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function normalizeNullableText(value: string | null | undefined) {
  const normalizedValue = normalizeText(value);
  return normalizedValue || null;
}

function normalizeStringList(values: readonly string[] | null | undefined) {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => normalizeText(value))
        .filter((value): value is string => Boolean(value))
    )
  );
}

function assertCustomerSafeAuditSummary(summary: string) {
  if (AUDIT_ROOM_UNSAFE_CUSTOMER_CONTENT_PATTERN.test(summary)) {
    throw new Error(
      "Customer-safe audit summaries must not expose internal execution, worker, runtime, or audit-only details."
    );
  }

  return summary;
}

function buildRejectedEvidenceLinkValidationResult(
  reason: string
): NeroaOneAuditRoomEvidenceLinkValidationResult {
  return {
    allowed: false,
    auditLane: neroaOneAuditRoomLane,
    evidenceLaneId: "evidence_linking",
    reason:
      normalizeText(reason) ||
      "Evidence link is not valid for Audit Room event creation."
  };
}

function buildFutureAuditServiceTarget(
  override: Partial<NeroaOneFutureAuditServiceTarget> | null | undefined
): NeroaOneFutureAuditServiceTarget {
  const normalizedNotes = normalizeStringList(override?.notes);

  return neroaOneFutureAuditServiceTargetSchema.parse({
    deploymentProvider: "digitalocean",
    serviceName: normalizeText(override?.serviceName) || "neroa-one-audit-room-service",
    queueName: normalizeText(override?.queueName) || "neroa-one.audit-room",
    serviceType: "future_audit_admin_service",
    readyForMonitoring: false,
    notes:
      normalizedNotes.length > 0
        ? normalizedNotes
        : [
            "Future DigitalOcean audit services may observe Neroa One lanes and provide admin oversight summaries here.",
            "Current lane remains contract-only and does not persist audit state or trigger runtime actions."
          ]
  });
}

function buildRelatedIds(
  override: Partial<NeroaOneAuditRoomRelatedIds> | null | undefined
): NeroaOneAuditRoomRelatedIds {
  return neroaOneAuditRoomRelatedIdsSchema.parse({
    executionPacketId: normalizeNullableText(override?.executionPacketId),
    promptRoomItemId: normalizeNullableText(override?.promptRoomItemId),
    workerRunId: normalizeNullableText(override?.workerRunId),
    outputId: normalizeNullableText(override?.outputId),
    reviewId: normalizeNullableText(override?.reviewId),
    qcJobId: normalizeNullableText(override?.qcJobId),
    evidenceLinkId: normalizeNullableText(override?.evidenceLinkId),
    evidenceId: normalizeNullableText(override?.evidenceId),
    recordingId: normalizeNullableText(override?.recordingId),
    reportId: normalizeNullableText(override?.reportId),
    customerResultId: normalizeNullableText(override?.customerResultId),
    sourceRecordId: normalizeNullableText(override?.sourceRecordId),
    upstreamAuditEventId: normalizeNullableText(override?.upstreamAuditEventId)
  });
}

function buildAuditEventId(args: {
  sourceLaneId: NeroaOneAuditRoomSourceLaneId;
  eventType: NeroaOneAuditRoomEventType;
  taskId: string;
  createdAt: string;
}) {
  const timestampPart = normalizeText(args.createdAt).replace(/[^0-9TZ]/g, "");
  return `${args.taskId}:audit:${args.sourceLaneId}:${args.eventType}:${timestampPart}`;
}

export function validateEvidenceLinkForAuditRoomEvent(args: {
  link: NeroaOneEvidenceLinkRecord;
}): NeroaOneAuditRoomEvidenceLinkValidationResult {
  const linkResult = neroaOneEvidenceLinkRecordSchema.safeParse(args.link);

  if (!linkResult.success) {
    const [issue] = linkResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "link";

    return buildRejectedEvidenceLinkValidationResult(
      `Evidence link is invalid for Audit Room event creation at ${issuePath}.`
    );
  }

  const link = linkResult.data;

  if (!link.evidenceLinkId || !link.workspaceId || !link.projectId || !link.taskId) {
    return buildRejectedEvidenceLinkValidationResult(
      "Evidence link is missing the required identity fields for Audit Room event creation."
    );
  }

  return {
    allowed: true,
    auditLane: neroaOneAuditRoomLane,
    evidenceLaneId: "evidence_linking",
    link
  };
}

function getDefaultRecommendedAction(
  eventType: NeroaOneAuditRoomEventType,
  severity: NeroaOneAuditRoomSeverity
): NeroaOneAuditRoomRecommendedAction {
  if (severity === "critical") {
    switch (eventType) {
      case "policy_violation":
      case "worker_failure":
      case "qc_failure":
        return "pause_execution";
      case "strategy_escalation":
        return "escalate_strategy";
      case "customer_blocker":
        return "request_customer_answer";
      default:
        return "notify_admin";
    }
  }

  switch (eventType) {
    case "customer_blocker":
      return "request_customer_answer";
    case "strategy_escalation":
      return "escalate_strategy";
    case "qc_failure":
    case "worker_failure":
      return "create_repair_task";
    case "evidence_ready":
      return "archive";
    case "cost_waste":
    case "retry_loop":
    case "stuck_item":
    case "policy_violation":
      return "notify_admin";
    default:
      return "observe";
  }
}

function getDefaultCustomerSafeSummary(
  eventType: NeroaOneAuditRoomEventType,
  recommendedAction: NeroaOneAuditRoomRecommendedAction
) {
  switch (eventType) {
    case "lane_transition":
      return "Internal workflow progress was recorded for this task.";
    case "policy_violation":
      return `Internal policy review flagged this task and recommends ${recommendedAction}.`;
    case "stuck_item":
      return `Internal monitoring detected stalled work and recommends ${recommendedAction}.`;
    case "retry_loop":
      return `Internal monitoring detected repeated retry behavior and recommends ${recommendedAction}.`;
    case "qc_failure":
      return `Internal quality review flagged a failure and recommends ${recommendedAction}.`;
    case "worker_failure":
      return `Internal execution monitoring detected a worker failure and recommends ${recommendedAction}.`;
    case "cost_waste":
      return `Internal cost monitoring flagged potential waste risk and recommends ${recommendedAction}.`;
    case "customer_blocker":
      return `Internal monitoring detected a customer blocker and recommends ${recommendedAction}.`;
    case "strategy_escalation":
      return `Internal monitoring flagged a strategy escalation and recommends ${recommendedAction}.`;
    case "evidence_ready":
      return "Internal evidence packaging is ready for the next administrative step.";
    case "system_health":
      return "Internal system health monitoring recorded a platform status update.";
  }
}

function selectRecommendedAdminAction(
  events: readonly NeroaOneAuditRoomEvent[]
): NeroaOneAuditRoomRecommendedAction {
  if (
    events.some(
      (event) =>
        event.severity === "critical" && event.recommendedAction === "pause_execution"
    )
  ) {
    return "pause_execution";
  }

  if (events.some((event) => event.recommendedAction === "escalate_strategy")) {
    return "escalate_strategy";
  }

  if (events.some((event) => event.recommendedAction === "request_customer_answer")) {
    return "request_customer_answer";
  }

  if (events.some((event) => event.recommendedAction === "create_repair_task")) {
    return "create_repair_task";
  }

  if (events.some((event) => event.recommendedAction === "notify_admin")) {
    return "notify_admin";
  }

  if (events.some((event) => event.recommendedAction === "archive")) {
    return "archive";
  }

  return "observe";
}

function estimateWasteRiskFromEvents(events: readonly NeroaOneAuditRoomEvent[]) {
  const criticalCount = events.filter((event) => event.severity === "critical").length;
  const warningCount = events.filter((event) => event.severity === "warning").length;
  const retryCount = events.filter((event) => event.eventType === "retry_loop").length;
  const wasteCount = events.filter((event) => event.eventType === "cost_waste").length;

  if (criticalCount > 0 || retryCount >= 2 || wasteCount >= 2) {
    return "high" as const;
  }

  if (warningCount > 0 || retryCount > 0 || wasteCount > 0) {
    return "medium" as const;
  }

  return "low" as const;
}

export function createAuditRoomEventFromLaneAndEvidenceIds(args: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  sourceLaneId: NeroaOneAuditRoomSourceLaneId;
  relatedIds?: Partial<NeroaOneAuditRoomRelatedIds> | null;
  eventType: NeroaOneAuditRoomEventType;
  severity?: NeroaOneAuditRoomSeverity | null;
  recommendedAction?: NeroaOneAuditRoomRecommendedAction | null;
  internalSummary: string;
  customerSafeSummary?: string | null;
  createdAt?: string | null;
  futureAuditServiceTarget?: Partial<NeroaOneFutureAuditServiceTarget> | null;
}): NeroaOneAuditRoomEvent {
  const sourceLaneId = neroaOneAuditRoomSourceLaneIdSchema.parse(args.sourceLaneId);
  const eventType = neroaOneAuditRoomEventTypeSchema.parse(args.eventType);
  const severity = neroaOneAuditRoomSeveritySchema.parse(args.severity ?? "info");
  const recommendedAction = neroaOneAuditRoomRecommendedActionSchema.parse(
    args.recommendedAction ?? getDefaultRecommendedAction(eventType, severity)
  );
  const createdAt = normalizeText(args.createdAt) || new Date().toISOString();
  const customerSafeSummary = assertCustomerSafeAuditSummary(
    normalizeText(args.customerSafeSummary) ||
      getDefaultCustomerSafeSummary(eventType, recommendedAction)
  );

  return neroaOneAuditRoomEventSchema.parse({
    auditEventId: buildAuditEventId({
      sourceLaneId,
      eventType,
      taskId: normalizeText(args.taskId),
      createdAt
    }),
    workspaceId: normalizeText(args.workspaceId),
    projectId: normalizeText(args.projectId),
    taskId: normalizeText(args.taskId),
    sourceLaneId,
    relatedIds: buildRelatedIds(args.relatedIds),
    eventType,
    severity,
    recommendedAction,
    internalSummary: normalizeText(args.internalSummary),
    customerSafeSummary,
    createdAt,
    futureAuditServiceTarget: buildFutureAuditServiceTarget(args.futureAuditServiceTarget)
  });
}

export function createAuditRoomEventFromEvidenceLink(args: {
  link: NeroaOneEvidenceLinkRecord;
  sourceLaneId?: NeroaOneAuditRoomSourceLaneId | null;
  eventType?: NeroaOneAuditRoomEventType | null;
  severity?: NeroaOneAuditRoomSeverity | null;
  recommendedAction?: NeroaOneAuditRoomRecommendedAction | null;
  internalSummary?: string | null;
  customerSafeSummary?: string | null;
  createdAt?: string | null;
  futureAuditServiceTarget?: Partial<NeroaOneFutureAuditServiceTarget> | null;
}): NeroaOneAuditRoomEvent {
  const evidenceValidation = validateEvidenceLinkForAuditRoomEvent({
    link: args.link
  });

  if (!evidenceValidation.allowed) {
    throw new Error(evidenceValidation.reason);
  }

  const link = evidenceValidation.link;
  const eventType = neroaOneAuditRoomEventTypeSchema.parse(
    args.eventType ?? (link.status === "evidence_ready" ? "evidence_ready" : "system_health")
  );

  return createAuditRoomEventFromLaneAndEvidenceIds({
    workspaceId: link.workspaceId,
    projectId: link.projectId,
    taskId: link.taskId,
    sourceLaneId: args.sourceLaneId ?? "evidence_linking",
    relatedIds: {
      executionPacketId: link.executionPacketId,
      promptRoomItemId: link.promptRoomItemId,
      workerRunId: link.workerRunId,
      outputId: link.outputId,
      reviewId: link.reviewId,
      qcJobId: link.qcJobId,
      evidenceLinkId: link.evidenceLinkId,
      evidenceId: link.evidenceId,
      recordingId: link.recordingId,
      reportId: link.reportId,
      customerResultId: link.customerResultId,
      sourceRecordId: link.evidenceLinkId
    },
    eventType,
    severity: args.severity ?? (eventType === "evidence_ready" ? "info" : "warning"),
    recommendedAction: args.recommendedAction,
    internalSummary:
      normalizeText(args.internalSummary) ||
      `Audit observed evidence link ${link.evidenceLinkId} with status ${link.status}.`,
    customerSafeSummary: args.customerSafeSummary,
    createdAt: args.createdAt ?? link.updatedAt,
    futureAuditServiceTarget: args.futureAuditServiceTarget
  });
}

export function getCustomerSafeAuditEventView(args: {
  event: NeroaOneAuditRoomEvent;
}): NeroaOneCustomerSafeAuditEventView {
  const event = neroaOneAuditRoomEventSchema.parse(args.event);

  return neroaOneCustomerSafeAuditEventViewSchema.parse({
    auditEventId: event.auditEventId,
    workspaceId: event.workspaceId,
    projectId: event.projectId,
    taskId: event.taskId,
    sourceLaneId: event.sourceLaneId,
    eventType: event.eventType,
    severity: event.severity,
    recommendedAction: event.recommendedAction,
    customerSafeSummary: assertCustomerSafeAuditSummary(event.customerSafeSummary),
    createdAt: event.createdAt
  });
}

export function createAdminOversightSummaryFromAuditEvents(args: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  events: readonly NeroaOneAuditRoomEvent[];
  updatedAt?: string | null;
}): NeroaOneAdminOversightSummary {
  const events = args.events.map((event) => neroaOneAuditRoomEventSchema.parse(event));
  const updatedAt =
    normalizeText(args.updatedAt) ||
    events.reduce((latest, event) => (event.createdAt > latest ? event.createdAt : latest), "");

  return neroaOneAdminOversightSummarySchema.parse({
    workspaceId: normalizeText(args.workspaceId),
    projectId: normalizeText(args.projectId),
    taskId: normalizeText(args.taskId),
    openWarnings: events.filter((event) => event.severity === "warning").length,
    criticalAlerts: events.filter((event) => event.severity === "critical").length,
    stuckItems: events.filter((event) => event.eventType === "stuck_item").length,
    retryLoopCount: events.filter((event) => event.eventType === "retry_loop").length,
    qcFailureCount: events.filter((event) => event.eventType === "qc_failure").length,
    workerFailureCount: events.filter((event) => event.eventType === "worker_failure").length,
    estimatedWasteRisk: estimateWasteRiskFromEvents(events),
    recommendedAdminAction: selectRecommendedAdminAction(events),
    updatedAt: updatedAt || new Date().toISOString()
  });
}

export function getAuditRoomEventTypes() {
  return [...neroaOneAuditRoomLane.supportedEventTypes];
}

export function getAuditRoomSeverityLevels() {
  return [...neroaOneAuditRoomLane.supportedSeverityLevels];
}

export function getAuditRoomRecommendedActions() {
  return [...neroaOneAuditRoomLane.supportedRecommendedActions];
}
