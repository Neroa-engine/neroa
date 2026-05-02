import type {
  NeroaOneAdminOversightSummary,
  NeroaOneAuditRoomEvent
} from "./audit-room.ts";
import type {
  NeroaOneCodeExecutionWorkerRun
} from "./code-execution-worker.ts";
import type { NeroaOneCodexExecutionPacket } from "./codex-execution-packet.ts";
import type { NeroaOneCodexOutputRecord } from "./codex-output-box.ts";
import type {
  NeroaOneCustomerFollowUpItem
} from "./customer-follow-up.ts";
import type { NeroaOneEvidenceLinkRecord } from "./evidence-linking.ts";
import type { NeroaOneOutcomeQueueEntry } from "./outcome-queues.ts";
import type { NeroaOneOutputReviewRecord } from "./output-review.ts";
import type { NeroaOnePromptRoomItem } from "./prompt-room.ts";
import type { NeroaOneQcStationJobRecord } from "./qc-station.ts";
import type { NeroaOneRepairQueueItem } from "./repair-queue.ts";
import type {
  NeroaOneStrategyEscalationItem
} from "./strategy-escalation.ts";

export const NEROA_ONE_QUEUE_ITEM_STATUSES = [
  "pending",
  "queued",
  "running",
  "completed",
  "failed",
  "canceled",
  "dead_lettered"
] as const;

export const NEROA_ONE_QUEUE_PRIORITY_LEVELS = [
  "low",
  "normal",
  "high",
  "critical"
] as const;

export type NeroaOneQueueItemStatus = (typeof NEROA_ONE_QUEUE_ITEM_STATUSES)[number];
export type NeroaOneQueuePriority = (typeof NEROA_ONE_QUEUE_PRIORITY_LEVELS)[number];

export interface NeroaOneQueueAdapterError {
  code: string;
  message: string;
  retryable: boolean;
  details?: Readonly<Record<string, unknown>> | null;
  traceContext?: NeroaOneQueueTraceContext | null;
}

export interface NeroaOneQueueTraceContext {
  workspaceId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  laneId?: string | null;
  queueItemId?: string | null;
  sourceLaneId?: string | null;
  destinationLaneId?: string | null;
  requestId?: string | null;
  traceId?: string | null;
  correlationId?: string | null;
  caller?: string | null;
  actorId?: string | null;
  origin?: string | null;
  note?: string | null;
  metadata?: Readonly<Record<string, unknown>> | null;
}

export interface NeroaOneQueueRoutingKey {
  sourceLaneId: string;
  destinationLaneId: string;
  routeType?: string | null;
  routeHint?: string | null;
  partitionKey?: string | null;
}

export interface NeroaOneQueueDelayPolicy {
  availableAt?: string | null;
  delayMs?: number | null;
  reason?: string | null;
}

export interface NeroaOneQueueRetryPolicy {
  maxAttempts: number;
  backoffStrategy: "fixed" | "linear" | "exponential" | "provider_defined";
  baseDelayMs?: number | null;
  maxDelayMs?: number | null;
  retryableErrorCodes?: readonly string[] | null;
}

export interface NeroaOneQueueDeadLetterPolicy {
  deadLetterAfterAttempts: number;
  deadLetterLaneId?: string | null;
  reason?: string | null;
}

export interface NeroaOneQueueObservationEvent {
  eventId: string;
  eventType: string;
  occurredAt: string;
  status?: NeroaOneQueueItemStatus | null;
  summary?: string | null;
  metadata?: Readonly<Record<string, unknown>> | null;
  traceContext?: NeroaOneQueueTraceContext | null;
}

export interface NeroaOneQueueRecord<
  TPayload,
  TLaneId extends string = string,
  TRoutingKey extends NeroaOneQueueRoutingKey = NeroaOneQueueRoutingKey
> {
  queueItemId: string;
  laneId: TLaneId;
  status: NeroaOneQueueItemStatus;
  payload: Readonly<TPayload>;
  routingKey: Readonly<TRoutingKey>;
  priority: NeroaOneQueuePriority;
  attemptCount: number;
  traceContext?: NeroaOneQueueTraceContext | null;
  delayPolicy?: NeroaOneQueueDelayPolicy | null;
  retryPolicy?: NeroaOneQueueRetryPolicy | null;
  deadLetterPolicy?: NeroaOneQueueDeadLetterPolicy | null;
  lastError?: NeroaOneQueueAdapterError | null;
  observations?: readonly NeroaOneQueueObservationEvent[] | null;
  metadata?: Readonly<Record<string, unknown>> | null;
  enqueuedAt: string;
  availableAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  canceledAt?: string | null;
  deadLetteredAt?: string | null;
}

export interface NeroaOneQueueQueryScope {
  workspaceId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  laneId?: string | null;
  sourceLaneId?: string | null;
  destinationLaneId?: string | null;
}

export interface NeroaOneQueuePagination {
  limit?: number | null;
  cursor?: string | null;
  sortDirection?: "asc" | "desc";
}

export interface NeroaOneQueueStatusFilter {
  statuses?: readonly NeroaOneQueueItemStatus[] | null;
  excludeStatuses?: readonly NeroaOneQueueItemStatus[] | null;
}

export interface NeroaOneQueueEnqueueArgs<
  TPayload,
  TRoutingKey extends NeroaOneQueueRoutingKey = NeroaOneQueueRoutingKey
> {
  laneId: string;
  payload: Readonly<TPayload>;
  routingKey: Readonly<TRoutingKey>;
  priority?: NeroaOneQueuePriority | null;
  delayPolicy?: NeroaOneQueueDelayPolicy | null;
  retryPolicy?: NeroaOneQueueRetryPolicy | null;
  deadLetterPolicy?: NeroaOneQueueDeadLetterPolicy | null;
  traceContext?: NeroaOneQueueTraceContext | null;
  metadata?: Readonly<Record<string, unknown>> | null;
}

export interface NeroaOneQueueEnqueueDelayedArgs<
  TPayload,
  TRoutingKey extends NeroaOneQueueRoutingKey = NeroaOneQueueRoutingKey
> extends NeroaOneQueueEnqueueArgs<TPayload, TRoutingKey> {
  delayPolicy: NeroaOneQueueDelayPolicy;
}

export interface NeroaOneQueueGetByIdArgs {
  id: string;
  scope?: NeroaOneQueueQueryScope | null;
  traceContext?: NeroaOneQueueTraceContext | null;
}

export interface NeroaOneQueueListArgs {
  scope?: NeroaOneQueueQueryScope | null;
  statusFilter?: NeroaOneQueueStatusFilter | null;
  pagination?: NeroaOneQueuePagination | null;
  traceContext?: NeroaOneQueueTraceContext | null;
}

export interface NeroaOneQueueListByStatusArgs {
  statusFilter: NeroaOneQueueStatusFilter;
  scope?: NeroaOneQueueQueryScope | null;
  pagination?: NeroaOneQueuePagination | null;
  traceContext?: NeroaOneQueueTraceContext | null;
}

export interface NeroaOneQueueAckArgs {
  id: string;
  scope?: NeroaOneQueueQueryScope | null;
  reason?: string | null;
  metadata?: Readonly<Record<string, unknown>> | null;
  traceContext?: NeroaOneQueueTraceContext | null;
}

export interface NeroaOneQueueFailArgs extends NeroaOneQueueAckArgs {
  error: NeroaOneQueueAdapterError;
  retryPolicy?: NeroaOneQueueRetryPolicy | null;
}

export interface NeroaOneQueueDeadLetterArgs extends NeroaOneQueueAckArgs {
  error?: NeroaOneQueueAdapterError | null;
  deadLetterPolicy?: NeroaOneQueueDeadLetterPolicy | null;
}

export interface NeroaOneQueueAppendObservationArgs {
  id: string;
  observation: NeroaOneQueueObservationEvent;
  scope?: NeroaOneQueueQueryScope | null;
  traceContext?: NeroaOneQueueTraceContext | null;
}

export type NeroaOneQueueEnqueueResult<TQueueItem> =
  | {
      ok: true;
      enqueued: true;
      queueItem: Readonly<TQueueItem>;
      error: null;
      traceContext?: NeroaOneQueueTraceContext | null;
      warnings?: readonly string[] | null;
    }
  | {
      ok: false;
      enqueued: false;
      queueItem: null;
      error: NeroaOneQueueAdapterError;
      traceContext?: NeroaOneQueueTraceContext | null;
      warnings?: readonly string[] | null;
    };

export type NeroaOneQueueReadResult<TQueueItem> =
  | {
      ok: true;
      found: true;
      queueItem: Readonly<TQueueItem>;
      error: null;
      traceContext?: NeroaOneQueueTraceContext | null;
    }
  | {
      ok: true;
      found: false;
      queueItem: null;
      error: null;
      traceContext?: NeroaOneQueueTraceContext | null;
    }
  | {
      ok: false;
      found: false;
      queueItem: null;
      error: NeroaOneQueueAdapterError;
      traceContext?: NeroaOneQueueTraceContext | null;
    };

export type NeroaOneQueueListResult<TQueueItem> =
  | {
      ok: true;
      queueItems: readonly Readonly<TQueueItem>[];
      totalCount: number | null;
      nextCursor: string | null;
      error: null;
      traceContext?: NeroaOneQueueTraceContext | null;
    }
  | {
      ok: false;
      queueItems: readonly [];
      totalCount: null;
      nextCursor: null;
      error: NeroaOneQueueAdapterError;
      traceContext?: NeroaOneQueueTraceContext | null;
    };

export type NeroaOneQueueAckResult<TQueueItem> =
  | {
      ok: true;
      acknowledged: true;
      queueItem: Readonly<TQueueItem>;
      error: null;
      traceContext?: NeroaOneQueueTraceContext | null;
      warnings?: readonly string[] | null;
    }
  | {
      ok: false;
      acknowledged: false;
      queueItem: null;
      error: NeroaOneQueueAdapterError;
      traceContext?: NeroaOneQueueTraceContext | null;
      warnings?: readonly string[] | null;
    };

export type NeroaOneQueueFailResult<TQueueItem> =
  | {
      ok: true;
      failed: true;
      queueItem: Readonly<TQueueItem>;
      willRetry: boolean;
      scheduledRetryAt: string | null;
      error: null;
      traceContext?: NeroaOneQueueTraceContext | null;
      warnings?: readonly string[] | null;
    }
  | {
      ok: false;
      failed: false;
      queueItem: null;
      willRetry: false;
      scheduledRetryAt: null;
      error: NeroaOneQueueAdapterError;
      traceContext?: NeroaOneQueueTraceContext | null;
      warnings?: readonly string[] | null;
    };

export type NeroaOneQueueDeadLetterResult<TQueueItem> =
  | {
      ok: true;
      deadLettered: true;
      queueItem: Readonly<TQueueItem>;
      error: null;
      traceContext?: NeroaOneQueueTraceContext | null;
      warnings?: readonly string[] | null;
    }
  | {
      ok: false;
      deadLettered: false;
      queueItem: null;
      error: NeroaOneQueueAdapterError;
      traceContext?: NeroaOneQueueTraceContext | null;
      warnings?: readonly string[] | null;
    };

export interface NeroaOneQueueAdapterContract<
  TPayload,
  TRoutingKey extends NeroaOneQueueRoutingKey = NeroaOneQueueRoutingKey,
  TQueueItem extends NeroaOneQueueRecord<TPayload, string, TRoutingKey> = NeroaOneQueueRecord<
    TPayload,
    string,
    TRoutingKey
  >
> {
  enqueue(
    args: NeroaOneQueueEnqueueArgs<TPayload, TRoutingKey>
  ): Promise<NeroaOneQueueEnqueueResult<TQueueItem>>;
  enqueueDelayed(
    args: NeroaOneQueueEnqueueDelayedArgs<TPayload, TRoutingKey>
  ): Promise<NeroaOneQueueEnqueueResult<TQueueItem>>;
  getById(args: NeroaOneQueueGetByIdArgs): Promise<NeroaOneQueueReadResult<TQueueItem>>;
  listByProject(
    args: { projectId: string } & NeroaOneQueueListArgs
  ): Promise<NeroaOneQueueListResult<TQueueItem>>;
  listByWorkspace(
    args: { workspaceId: string } & NeroaOneQueueListArgs
  ): Promise<NeroaOneQueueListResult<TQueueItem>>;
  listByTask(
    args: { taskId: string } & NeroaOneQueueListArgs
  ): Promise<NeroaOneQueueListResult<TQueueItem>>;
  listByStatus(
    args: NeroaOneQueueListByStatusArgs
  ): Promise<NeroaOneQueueListResult<TQueueItem>>;
  markRunning(args: NeroaOneQueueAckArgs): Promise<NeroaOneQueueAckResult<TQueueItem>>;
  markCompleted(args: NeroaOneQueueAckArgs): Promise<NeroaOneQueueAckResult<TQueueItem>>;
  markFailed(args: NeroaOneQueueFailArgs): Promise<NeroaOneQueueFailResult<TQueueItem>>;
  cancel(args: NeroaOneQueueAckArgs): Promise<NeroaOneQueueAckResult<TQueueItem>>;
  retry(args: NeroaOneQueueAckArgs): Promise<NeroaOneQueueAckResult<TQueueItem>>;
  deadLetter(
    args: NeroaOneQueueDeadLetterArgs
  ): Promise<NeroaOneQueueDeadLetterResult<TQueueItem>>;
  appendObservation(
    args: NeroaOneQueueAppendObservationArgs
  ): Promise<NeroaOneQueueAckResult<TQueueItem>>;
}

export type NeroaOneOutcomeLaneQueueItem = NeroaOneQueueRecord<
  NeroaOneOutcomeQueueEntry,
  "outcome_lanes"
>;
export type NeroaOneCodexExecutionPacketQueueItem = NeroaOneQueueRecord<
  NeroaOneCodexExecutionPacket,
  "codex_execution_packet_draft"
>;
export type NeroaOnePromptRoomQueueItem = NeroaOneQueueRecord<
  NeroaOnePromptRoomItem,
  "prompt_room"
>;
export type NeroaOneCodeExecutionWorkerQueueItem = NeroaOneQueueRecord<
  NeroaOneCodeExecutionWorkerRun,
  "code_execution_worker"
>;
export type NeroaOneCodexOutputBoxQueueItem = NeroaOneQueueRecord<
  NeroaOneCodexOutputRecord,
  "codex_output_box"
>;
export type NeroaOneOutputReviewQueueItem = NeroaOneQueueRecord<
  NeroaOneOutputReviewRecord,
  "output_review"
>;
export type NeroaOneRepairQueueQueueItem = NeroaOneQueueRecord<
  NeroaOneRepairQueueItem,
  "repair_queue"
>;
export type NeroaOneQcStationQueueItem = NeroaOneQueueRecord<
  NeroaOneQcStationJobRecord,
  "qc_station"
>;
export type NeroaOneEvidenceLinkingQueueItem = NeroaOneQueueRecord<
  NeroaOneEvidenceLinkRecord,
  "evidence_linking"
>;
export type NeroaOneAuditRoomQueueItem = NeroaOneQueueRecord<
  NeroaOneAuditRoomEvent,
  "audit_room"
>;
export type NeroaOneAdminOversightQueueItem = NeroaOneQueueRecord<
  NeroaOneAdminOversightSummary,
  "admin_oversight"
>;
export type NeroaOneCustomerFollowUpQueueItem = NeroaOneQueueRecord<
  NeroaOneCustomerFollowUpItem,
  "customer_follow_up"
>;
export type NeroaOneStrategyEscalationQueueItem = NeroaOneQueueRecord<
  NeroaOneStrategyEscalationItem,
  "strategy_escalation"
>;

export interface NeroaOneOutcomeLaneQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneOutcomeQueueEntry,
    NeroaOneQueueRoutingKey,
    NeroaOneOutcomeLaneQueueItem
  > {}

export interface NeroaOneCodexExecutionPacketQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneCodexExecutionPacket,
    NeroaOneQueueRoutingKey,
    NeroaOneCodexExecutionPacketQueueItem
  > {}

export interface NeroaOnePromptRoomQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOnePromptRoomItem,
    NeroaOneQueueRoutingKey,
    NeroaOnePromptRoomQueueItem
  > {}

export interface NeroaOneCodeExecutionWorkerQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneCodeExecutionWorkerRun,
    NeroaOneQueueRoutingKey,
    NeroaOneCodeExecutionWorkerQueueItem
  > {}

export interface NeroaOneCodexOutputBoxQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneCodexOutputRecord,
    NeroaOneQueueRoutingKey,
    NeroaOneCodexOutputBoxQueueItem
  > {}

export interface NeroaOneOutputReviewQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneOutputReviewRecord,
    NeroaOneQueueRoutingKey,
    NeroaOneOutputReviewQueueItem
  > {}

export interface NeroaOneRepairQueueQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneRepairQueueItem,
    NeroaOneQueueRoutingKey,
    NeroaOneRepairQueueQueueItem
  > {}

export interface NeroaOneQcStationQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneQcStationJobRecord,
    NeroaOneQueueRoutingKey,
    NeroaOneQcStationQueueItem
  > {}

export interface NeroaOneEvidenceLinkingQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneEvidenceLinkRecord,
    NeroaOneQueueRoutingKey,
    NeroaOneEvidenceLinkingQueueItem
  > {}

export interface NeroaOneAuditRoomQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneAuditRoomEvent,
    NeroaOneQueueRoutingKey,
    NeroaOneAuditRoomQueueItem
  > {}

export interface NeroaOneAdminOversightQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneAdminOversightSummary,
    NeroaOneQueueRoutingKey,
    NeroaOneAdminOversightQueueItem
  > {}

export interface NeroaOneAuditRoomAdminOversightQueueAdapterContract {
  auditRoom: NeroaOneAuditRoomQueueAdapterContract;
  adminOversight: NeroaOneAdminOversightQueueAdapterContract;
}

export interface NeroaOneCustomerFollowUpQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneCustomerFollowUpItem,
    NeroaOneQueueRoutingKey,
    NeroaOneCustomerFollowUpQueueItem
  > {}

export interface NeroaOneStrategyEscalationQueueAdapterContract
  extends NeroaOneQueueAdapterContract<
    NeroaOneStrategyEscalationItem,
    NeroaOneQueueRoutingKey,
    NeroaOneStrategyEscalationQueueItem
  > {}
