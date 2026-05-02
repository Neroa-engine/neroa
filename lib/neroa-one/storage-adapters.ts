import type {
  NeroaOneAdminOversightSummary,
  NeroaOneAuditRoomEvent
} from "./audit-room.ts";
import type {
  NeroaOneCodeExecutionWorkerRun,
  NeroaOneCodeExecutionWorkerRunStatus
} from "./code-execution-worker.ts";
import type { NeroaOneCodexExecutionPacket } from "./codex-execution-packet.ts";
import type {
  NeroaOneCodexOutputRecord,
  NeroaOneCodexOutputStatus
} from "./codex-output-box.ts";
import type {
  NeroaOneCustomerFollowUpItem,
  NeroaOneCustomerFollowUpItemStatus
} from "./customer-follow-up.ts";
import type {
  NeroaOneEvidenceArtifactPointer,
  NeroaOneEvidenceLinkRecord,
  NeroaOneEvidenceLinkStatus
} from "./evidence-linking.ts";
import type {
  NeroaOneOutcomeQueueEntry,
  NeroaOneOutcomeQueueName
} from "./outcome-queues.ts";
import type { NeroaOneOutputReviewRecord } from "./output-review.ts";
import type { NeroaOnePromptRoomItem, NeroaOnePromptRoomStatus } from "./prompt-room.ts";
import type { NeroaOneQcStationJobRecord, NeroaOneQcStationJobStatus } from "./qc-station.ts";
import type { NeroaOneRepairQueueItem, NeroaOneRepairQueueItemStatus } from "./repair-queue.ts";
import type {
  NeroaOneStrategyEscalationItem,
  NeroaOneStrategyEscalationItemStatus
} from "./strategy-escalation.ts";

export interface NeroaOneStorageTraceContext {
  workspaceId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  laneId?: string | null;
  requestId?: string | null;
  traceId?: string | null;
  correlationId?: string | null;
  caller?: string | null;
  actorId?: string | null;
  origin?: string | null;
  note?: string | null;
  metadata?: Readonly<Record<string, unknown>> | null;
}

export interface NeroaOneStorageAdapterError {
  code: string;
  message: string;
  retryable: boolean;
  details?: Readonly<Record<string, unknown>> | null;
  traceContext?: NeroaOneStorageTraceContext | null;
}

export interface NeroaOneStorageQueryScope {
  workspaceId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  laneId?: string | null;
  sourceLaneId?: string | null;
}

export interface NeroaOneStorageStatusFilter<TStatus extends string = string> {
  statuses?: readonly TStatus[] | null;
  excludeStatuses?: readonly TStatus[] | null;
  includeArchived?: boolean;
  includeFailed?: boolean;
}

export interface NeroaOneStoragePagination {
  limit?: number | null;
  cursor?: string | null;
  sortDirection?: "asc" | "desc";
}

export interface NeroaOneStorageEventEnvelope<TEventType extends string = string> {
  eventType: TEventType;
  occurredAt: string;
  summary?: string | null;
  metadata?: Readonly<Record<string, unknown>> | null;
}

export type NeroaOneStorageWriteResult<TRecord> =
  | {
      ok: true;
      record: Readonly<TRecord>;
      error: null;
      traceContext?: NeroaOneStorageTraceContext | null;
      warnings?: readonly string[] | null;
    }
  | {
      ok: false;
      record: null;
      error: NeroaOneStorageAdapterError;
      traceContext?: NeroaOneStorageTraceContext | null;
      warnings?: readonly string[] | null;
    };

export type NeroaOneStorageReadResult<TRecord> =
  | {
      ok: true;
      found: true;
      record: Readonly<TRecord>;
      error: null;
      traceContext?: NeroaOneStorageTraceContext | null;
    }
  | {
      ok: true;
      found: false;
      record: null;
      error: null;
      traceContext?: NeroaOneStorageTraceContext | null;
    }
  | {
      ok: false;
      found: false;
      record: null;
      error: NeroaOneStorageAdapterError;
      traceContext?: NeroaOneStorageTraceContext | null;
    };

export type NeroaOneStorageListResult<TRecord> =
  | {
      ok: true;
      records: readonly Readonly<TRecord>[];
      totalCount: number | null;
      nextCursor: string | null;
      error: null;
      traceContext?: NeroaOneStorageTraceContext | null;
    }
  | {
      ok: false;
      records: readonly [];
      totalCount: null;
      nextCursor: null;
      error: NeroaOneStorageAdapterError;
      traceContext?: NeroaOneStorageTraceContext | null;
    };

export type NeroaOneStorageDeleteResult =
  | {
      ok: true;
      deleted: boolean;
      archived: boolean;
      error: null;
      traceContext?: NeroaOneStorageTraceContext | null;
    }
  | {
      ok: false;
      deleted: false;
      archived: false;
      error: NeroaOneStorageAdapterError;
      traceContext?: NeroaOneStorageTraceContext | null;
    };

export interface NeroaOneStorageCreateArgs<TRecord> {
  record: Readonly<TRecord>;
  scope?: NeroaOneStorageQueryScope | null;
  traceContext?: NeroaOneStorageTraceContext | null;
}

export interface NeroaOneStorageGetByIdArgs<TRecordId extends string = string> {
  id: TRecordId;
  scope?: NeroaOneStorageQueryScope | null;
  traceContext?: NeroaOneStorageTraceContext | null;
}

export interface NeroaOneStorageListArgs<TStatus extends string = string> {
  scope?: NeroaOneStorageQueryScope | null;
  statusFilter?: NeroaOneStorageStatusFilter<TStatus> | null;
  pagination?: NeroaOneStoragePagination | null;
  traceContext?: NeroaOneStorageTraceContext | null;
}

export interface NeroaOneStorageListByStatusArgs<TStatus extends string = string> {
  statusFilter: NeroaOneStorageStatusFilter<TStatus>;
  scope?: NeroaOneStorageQueryScope | null;
  pagination?: NeroaOneStoragePagination | null;
  traceContext?: NeroaOneStorageTraceContext | null;
}

export interface NeroaOneStorageUpdateStatusArgs<
  TRecordId extends string = string,
  TStatus extends string = string
> {
  id: TRecordId;
  status: TStatus;
  scope?: NeroaOneStorageQueryScope | null;
  reason?: string | null;
  metadata?: Readonly<Record<string, unknown>> | null;
  traceContext?: NeroaOneStorageTraceContext | null;
}

export interface NeroaOneStorageAppendEventArgs<
  TRecordId extends string = string,
  TEventType extends string = string
> {
  id: TRecordId;
  event: NeroaOneStorageEventEnvelope<TEventType>;
  scope?: NeroaOneStorageQueryScope | null;
  traceContext?: NeroaOneStorageTraceContext | null;
}

export interface NeroaOneStorageArchiveArgs<TRecordId extends string = string> {
  id: TRecordId;
  scope?: NeroaOneStorageQueryScope | null;
  reason?: string | null;
  traceContext?: NeroaOneStorageTraceContext | null;
}

export interface NeroaOneStorageMarkFailedArgs<TRecordId extends string = string> {
  id: TRecordId;
  scope?: NeroaOneStorageQueryScope | null;
  reason: string;
  error?: NeroaOneStorageAdapterError | null;
  traceContext?: NeroaOneStorageTraceContext | null;
}

export interface NeroaOneStorageAdapterContract<
  TRecord,
  TRecordId extends string = string,
  TStatus extends string = string,
  TEventType extends string = string
> {
  create(args: NeroaOneStorageCreateArgs<TRecord>): Promise<NeroaOneStorageWriteResult<TRecord>>;
  getById(
    args: NeroaOneStorageGetByIdArgs<TRecordId>
  ): Promise<NeroaOneStorageReadResult<TRecord>>;
  listByProject(
    args: { projectId: string } & NeroaOneStorageListArgs<TStatus>
  ): Promise<NeroaOneStorageListResult<TRecord>>;
  listByWorkspace(
    args: { workspaceId: string } & NeroaOneStorageListArgs<TStatus>
  ): Promise<NeroaOneStorageListResult<TRecord>>;
  listByTask(
    args: { taskId: string } & NeroaOneStorageListArgs<TStatus>
  ): Promise<NeroaOneStorageListResult<TRecord>>;
  listByStatus(
    args: NeroaOneStorageListByStatusArgs<TStatus>
  ): Promise<NeroaOneStorageListResult<TRecord>>;
  updateStatus(
    args: NeroaOneStorageUpdateStatusArgs<TRecordId, TStatus>
  ): Promise<NeroaOneStorageWriteResult<TRecord>>;
  appendEvent(
    args: NeroaOneStorageAppendEventArgs<TRecordId, TEventType>
  ): Promise<NeroaOneStorageWriteResult<TRecord>>;
  archive(args: NeroaOneStorageArchiveArgs<TRecordId>): Promise<NeroaOneStorageDeleteResult>;
  markFailed(
    args: NeroaOneStorageMarkFailedArgs<TRecordId>
  ): Promise<NeroaOneStorageWriteResult<TRecord>>;
}

export type NeroaOneOutcomeLaneStorageStatus = NeroaOneOutcomeQueueName | "archived" | "failed";
export type NeroaOneCodexExecutionPacketStorageStatus = "draft" | "archived" | "failed";
export type NeroaOneOutputReviewStorageStatus = "recorded" | "archived" | "failed";
export type NeroaOneAuditRoomStorageStatus = "recorded" | "archived" | "failed";
export type NeroaOneAdminOversightStorageStatus = "current" | "archived" | "failed";

export type NeroaOneOutcomeLaneStorageEventType =
  | "created"
  | "queue_recorded"
  | "status_updated"
  | "archived"
  | "failed";
export type NeroaOneCodexExecutionPacketStorageEventType =
  | "created"
  | "dispatch_prepared"
  | "status_updated"
  | "archived"
  | "failed";
export type NeroaOnePromptRoomStorageEventType =
  | "created"
  | "draft_status_changed"
  | "customer_safe_status_changed"
  | "archived"
  | "failed";
export type NeroaOneCodeExecutionWorkerStorageEventType =
  | "created"
  | "engine_selected"
  | "run_status_changed"
  | "archived"
  | "failed";
export type NeroaOneCodexOutputBoxStorageEventType =
  | "created"
  | "output_status_changed"
  | "artifacts_appended"
  | "archived"
  | "failed";
export type NeroaOneOutputReviewStorageEventType =
  | "created"
  | "decision_recorded"
  | "archived"
  | "failed";
export type NeroaOneRepairQueueStorageEventType =
  | "created"
  | "repair_status_changed"
  | "archived"
  | "failed";
export type NeroaOneQcStationStorageEventType =
  | "created"
  | "job_status_changed"
  | "evidence_policy_updated"
  | "archived"
  | "failed";
export type NeroaOneEvidenceLinkingStorageEventType =
  | "created"
  | "evidence_status_changed"
  | "artifact_pointer_appended"
  | "archived"
  | "failed";
export type NeroaOneAuditRoomStorageEventType =
  | "created"
  | "event_recorded"
  | "archived"
  | "failed";
export type NeroaOneAdminOversightStorageEventType =
  | "created"
  | "summary_updated"
  | "archived"
  | "failed";
export type NeroaOneCustomerFollowUpStorageEventType =
  | "created"
  | "follow_up_status_changed"
  | "archived"
  | "failed";
export type NeroaOneStrategyEscalationStorageEventType =
  | "created"
  | "escalation_status_changed"
  | "archived"
  | "failed";

export interface NeroaOneOutcomeLaneStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneOutcomeQueueEntry,
    string,
    NeroaOneOutcomeLaneStorageStatus,
    NeroaOneOutcomeLaneStorageEventType
  > {}

export interface NeroaOneCodexExecutionPacketStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneCodexExecutionPacket,
    string,
    NeroaOneCodexExecutionPacketStorageStatus,
    NeroaOneCodexExecutionPacketStorageEventType
  > {}

export interface NeroaOnePromptRoomStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOnePromptRoomItem,
    string,
    NeroaOnePromptRoomStatus,
    NeroaOnePromptRoomStorageEventType
  > {}

export interface NeroaOneCodeExecutionWorkerStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneCodeExecutionWorkerRun,
    string,
    NeroaOneCodeExecutionWorkerRunStatus,
    NeroaOneCodeExecutionWorkerStorageEventType
  > {}

export interface NeroaOneCodexOutputBoxStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneCodexOutputRecord,
    string,
    NeroaOneCodexOutputStatus,
    NeroaOneCodexOutputBoxStorageEventType
  > {}

export interface NeroaOneOutputReviewStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneOutputReviewRecord,
    string,
    NeroaOneOutputReviewStorageStatus,
    NeroaOneOutputReviewStorageEventType
  > {}

export interface NeroaOneRepairQueueStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneRepairQueueItem,
    string,
    NeroaOneRepairQueueItemStatus,
    NeroaOneRepairQueueStorageEventType
  > {}

export interface NeroaOneQcStationStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneQcStationJobRecord,
    string,
    NeroaOneQcStationJobStatus,
    NeroaOneQcStationStorageEventType
  > {}

export interface NeroaOneEvidenceLinkingStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneEvidenceLinkRecord,
    string,
    NeroaOneEvidenceLinkStatus,
    NeroaOneEvidenceLinkingStorageEventType
  > {
  appendArtifactPointer(args: {
    id: string;
    artifactPointer: NeroaOneEvidenceArtifactPointer;
    scope?: NeroaOneStorageQueryScope | null;
    traceContext?: NeroaOneStorageTraceContext | null;
  }): Promise<NeroaOneStorageWriteResult<NeroaOneEvidenceLinkRecord>>;
}

export interface NeroaOneAuditRoomStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneAuditRoomEvent,
    string,
    NeroaOneAuditRoomStorageStatus,
    NeroaOneAuditRoomStorageEventType
  > {}

export interface NeroaOneAdminOversightStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneAdminOversightSummary,
    string,
    NeroaOneAdminOversightStorageStatus,
    NeroaOneAdminOversightStorageEventType
  > {}

export interface NeroaOneAuditRoomAdminOversightStorageAdapterContract {
  auditRoom: NeroaOneAuditRoomStorageAdapterContract;
  adminOversight: NeroaOneAdminOversightStorageAdapterContract;
}

export interface NeroaOneCustomerFollowUpStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneCustomerFollowUpItem,
    string,
    NeroaOneCustomerFollowUpItemStatus,
    NeroaOneCustomerFollowUpStorageEventType
  > {}

export interface NeroaOneStrategyEscalationStorageAdapterContract
  extends NeroaOneStorageAdapterContract<
    NeroaOneStrategyEscalationItem,
    string,
    NeroaOneStrategyEscalationItemStatus,
    NeroaOneStrategyEscalationStorageEventType
  > {}
