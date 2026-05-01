import { z } from "zod";
import {
  neroaOneAnalyzerOutcomeSchema,
  type NeroaOneAnalyzerOutcome
} from "./analyzer-contract.ts";
import {
  neroaOneCodeExecutionWorkerLane,
  neroaOneCodeExecutionWorkerRunSchema,
  validateCodexExecutionPacketForCodeExecutionWorkerRun,
  type NeroaOneCodeExecutionWorkerRun
} from "./code-execution-worker.ts";
import {
  neroaOneCodexExecutionPacketLane,
  neroaOneCodexExecutionPacketSchema,
  type NeroaOneCodexExecutionPacket
} from "./codex-execution-packet.ts";
import {
  neroaOneCodexOutputBoxLane,
  neroaOneCodexOutputRecordSchema,
  type NeroaOneCodexOutputRecord
} from "./codex-output-box.ts";
import {
  neroaOneOutcomeQueueItemSchema,
  type NeroaOneOutcomeQueueItem
} from "./outcome-queues.ts";
import {
  neroaOneOutputReviewLane,
  neroaOneOutputReviewRecordSchema,
  type NeroaOneOutputReviewRecord
} from "./output-review.ts";
import {
  neroaOnePromptRoomItemSchema,
  neroaOnePromptRoomLane,
  type NeroaOnePromptRoomItem
} from "./prompt-room.ts";
import {
  neroaOneQcStationJobRecordSchema,
  neroaOneQcStationLane,
  validateApprovedOutputReviewForQcStation,
  type NeroaOneQcStationJobRecord
} from "./qc-station.ts";

const trimmedStringSchema = z.string().trim().min(1);
const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();
const stringListSchema = z.array(trimmedStringSchema);

export const NEROA_ONE_EVIDENCE_LINK_STATUSES = [
  "draft",
  "awaiting_qc",
  "evidence_ready",
  "customer_result_ready",
  "archived",
  "failed"
] as const;

export const NEROA_ONE_EVIDENCE_ARTIFACT_POINTER_TYPES = [
  "screenshot",
  "video",
  "qc_report",
  "raw_worker_output",
  "audit_trace",
  "customer_summary",
  "other"
] as const;

export const NEROA_ONE_CUSTOMER_SAFE_EVIDENCE_ARTIFACT_POINTER_TYPES = [
  "screenshot",
  "video",
  "qc_report",
  "customer_summary"
] as const;

export const neroaOneEvidenceLinkStatusSchema = z.enum(NEROA_ONE_EVIDENCE_LINK_STATUSES);
export const neroaOneEvidenceArtifactPointerTypeSchema = z.enum(
  NEROA_ONE_EVIDENCE_ARTIFACT_POINTER_TYPES
);
export const neroaOneCustomerSafeEvidenceArtifactPointerTypeSchema = z.enum(
  NEROA_ONE_CUSTOMER_SAFE_EVIDENCE_ARTIFACT_POINTER_TYPES
);

export type NeroaOneEvidenceLinkStatus = z.infer<typeof neroaOneEvidenceLinkStatusSchema>;
export type NeroaOneEvidenceArtifactPointerType = z.infer<
  typeof neroaOneEvidenceArtifactPointerTypeSchema
>;
export type NeroaOneCustomerSafeEvidenceArtifactPointerType = z.infer<
  typeof neroaOneCustomerSafeEvidenceArtifactPointerTypeSchema
>;

export const neroaOneEvidenceArtifactPointerSchema = z
  .object({
    artifactPointerId: trimmedStringSchema,
    artifactId: trimmedStringSchema,
    pointerType: neroaOneEvidenceArtifactPointerTypeSchema,
    title: trimmedStringSchema,
    uri: nullableTrimmedStringSchema.default(null),
    createdAt: trimmedStringSchema,
    notes: stringListSchema.default([])
  })
  .strict();

export type NeroaOneEvidenceArtifactPointer = z.infer<
  typeof neroaOneEvidenceArtifactPointerSchema
>;

export const neroaOneEvidenceLinkPipelineIdsSchema = z
  .object({
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    analyzerOutcome: neroaOneAnalyzerOutcomeSchema,
    outcomeLaneId: neroaOneAnalyzerOutcomeSchema,
    executionPacketId: trimmedStringSchema,
    promptRoomItemId: trimmedStringSchema,
    workerRunId: trimmedStringSchema,
    outputId: nullableTrimmedStringSchema.default(null),
    reviewId: nullableTrimmedStringSchema.default(null),
    qcJobId: nullableTrimmedStringSchema.default(null),
    evidenceId: nullableTrimmedStringSchema.default(null),
    recordingId: nullableTrimmedStringSchema.default(null),
    screenshotIds: z.array(trimmedStringSchema).default([]),
    reportId: nullableTrimmedStringSchema.default(null),
    customerResultId: nullableTrimmedStringSchema.default(null)
  })
  .strict();

export type NeroaOneEvidenceLinkPipelineIds = z.infer<
  typeof neroaOneEvidenceLinkPipelineIdsSchema
>;

export const neroaOneFutureEvidenceServiceTargetSchema = z
  .object({
    deploymentProvider: z.literal("digitalocean"),
    serviceName: trimmedStringSchema,
    queueName: trimmedStringSchema,
    serviceType: z.literal("future_evidence_linking_service"),
    readyForStorage: z.literal(false),
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOneFutureEvidenceServiceTarget = z.infer<
  typeof neroaOneFutureEvidenceServiceTargetSchema
>;

export const neroaOneEvidenceLinkRecordSchema = z
  .object({
    evidenceLinkId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    analyzerOutcome: neroaOneAnalyzerOutcomeSchema,
    outcomeLaneId: neroaOneAnalyzerOutcomeSchema,
    executionPacketId: trimmedStringSchema,
    promptRoomItemId: trimmedStringSchema,
    workerRunId: trimmedStringSchema,
    outputId: nullableTrimmedStringSchema.default(null),
    reviewId: nullableTrimmedStringSchema.default(null),
    qcJobId: nullableTrimmedStringSchema.default(null),
    evidenceId: nullableTrimmedStringSchema.default(null),
    recordingId: nullableTrimmedStringSchema.default(null),
    screenshotIds: z.array(trimmedStringSchema).default([]),
    reportId: nullableTrimmedStringSchema.default(null),
    customerResultId: nullableTrimmedStringSchema.default(null),
    status: neroaOneEvidenceLinkStatusSchema,
    artifactPointers: z.array(neroaOneEvidenceArtifactPointerSchema).default([]),
    createdAt: trimmedStringSchema,
    updatedAt: trimmedStringSchema,
    futureEvidenceServiceTarget: neroaOneFutureEvidenceServiceTargetSchema
  })
  .strict();

export type NeroaOneEvidenceLinkRecord = z.infer<typeof neroaOneEvidenceLinkRecordSchema>;

export const neroaOneEvidenceLinkingLaneDefinitionSchema = z
  .object({
    laneId: z.literal("evidence_linking"),
    backendOnly: z.literal(true),
    extractionReady: z.literal(true),
    independentlyReplaceable: z.literal(true),
    linksExecutionTraceOnly: z.literal(true),
    ownsExecutionNow: z.literal(false),
    ownsReviewNow: z.literal(false),
    ownsQcNow: z.literal(false),
    ownsCustomerUiNow: z.literal(false),
    storesEvidenceNow: z.literal(false),
    writesPersistenceNow: z.literal(false),
    exposesCustomerSafeProjectionOnly: z.literal(true),
    displayPurposeInternal: trimmedStringSchema,
    internalOnlyNotes: stringListSchema.min(1),
    allowedStatuses: z.tuple([
      z.literal("draft"),
      z.literal("awaiting_qc"),
      z.literal("evidence_ready"),
      z.literal("customer_result_ready"),
      z.literal("archived"),
      z.literal("failed")
    ]),
    allowedArtifactPointerTypes: z.tuple([
      z.literal("screenshot"),
      z.literal("video"),
      z.literal("qc_report"),
      z.literal("raw_worker_output"),
      z.literal("audit_trace"),
      z.literal("customer_summary"),
      z.literal("other")
    ]),
    futureEvidenceServiceTarget: z
      .object({
        serviceName: trimmedStringSchema,
        queueName: trimmedStringSchema,
        notes: stringListSchema.min(1)
      })
      .strict()
  })
  .strict();

export type NeroaOneEvidenceLinkingLaneDefinition = z.infer<
  typeof neroaOneEvidenceLinkingLaneDefinitionSchema
>;

export type NeroaOneEvidenceLinkPipelineIdsValidationResult =
  | {
      allowed: true;
      evidenceLane: NeroaOneEvidenceLinkingLaneDefinition;
      pipelineIds: NeroaOneEvidenceLinkPipelineIds;
    }
  | {
      allowed: false;
      evidenceLane: NeroaOneEvidenceLinkingLaneDefinition;
      reason: string;
    };

export type NeroaOneEvidenceLinkPipelineRecordValidationResult =
  | {
      allowed: true;
      evidenceLane: NeroaOneEvidenceLinkingLaneDefinition;
      outcomeItem: NeroaOneOutcomeQueueItem;
      executionPacket: NeroaOneCodexExecutionPacket;
      promptRoomItem: NeroaOnePromptRoomItem;
      workerRun: NeroaOneCodeExecutionWorkerRun;
      output: NeroaOneCodexOutputRecord | null;
      review: NeroaOneOutputReviewRecord | null;
      qcJob: NeroaOneQcStationJobRecord | null;
      pipelineIds: NeroaOneEvidenceLinkPipelineIds;
    }
  | {
      allowed: false;
      evidenceLane: NeroaOneEvidenceLinkingLaneDefinition;
      reason: string;
    };

export const neroaOneCustomerSafeEvidenceArtifactPointerSummarySchema = z
  .object({
    artifactPointerId: trimmedStringSchema,
    artifactId: trimmedStringSchema,
    pointerType: neroaOneCustomerSafeEvidenceArtifactPointerTypeSchema
  })
  .strict();

export type NeroaOneCustomerSafeEvidenceArtifactPointerSummary = z.infer<
  typeof neroaOneCustomerSafeEvidenceArtifactPointerSummarySchema
>;

export const neroaOneCustomerSafeEvidenceSummarySchema = z
  .object({
    evidenceLinkId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    status: neroaOneEvidenceLinkStatusSchema,
    evidenceId: nullableTrimmedStringSchema.default(null),
    recordingId: nullableTrimmedStringSchema.default(null),
    screenshotIds: z.array(trimmedStringSchema).default([]),
    reportId: nullableTrimmedStringSchema.default(null),
    customerResultId: nullableTrimmedStringSchema.default(null),
    customerSafeArtifactPointers: z
      .array(neroaOneCustomerSafeEvidenceArtifactPointerSummarySchema)
      .default([]),
    updatedAt: trimmedStringSchema
  })
  .strict();

export type NeroaOneCustomerSafeEvidenceSummary = z.infer<
  typeof neroaOneCustomerSafeEvidenceSummarySchema
>;

export interface NeroaOneEvidenceLinkingStorageAdapter {
  saveEvidenceLink(link: NeroaOneEvidenceLinkRecord): Promise<void>;
  getEvidenceLinkById(evidenceLinkId: string): Promise<NeroaOneEvidenceLinkRecord | null>;
  getEvidenceLinksByTaskId(taskId: string): Promise<NeroaOneEvidenceLinkRecord[]>;
}

export interface NeroaOneEvidenceArtifactPointerStorageAdapter {
  saveArtifactPointer(pointer: NeroaOneEvidenceArtifactPointer): Promise<void>;
  listArtifactPointersByEvidenceLinkId(
    evidenceLinkId: string
  ): Promise<NeroaOneEvidenceArtifactPointer[]>;
}

export const neroaOneEvidenceLinkingLane = neroaOneEvidenceLinkingLaneDefinitionSchema.parse({
  laneId: "evidence_linking",
  backendOnly: true,
  extractionReady: true,
  independentlyReplaceable: true,
  linksExecutionTraceOnly: true,
  ownsExecutionNow: false,
  ownsReviewNow: false,
  ownsQcNow: false,
  ownsCustomerUiNow: false,
  storesEvidenceNow: false,
  writesPersistenceNow: false,
  exposesCustomerSafeProjectionOnly: true,
  displayPurposeInternal:
    "Defines the backend-only Evidence Linking lane that connects execution-trace identifiers and evidence pointers without owning execution, review, QC, or customer-facing UI behavior.",
  internalOnlyNotes: [
    "Evidence Linking may reference analyzer, packet, Prompt Room, worker, output, review, and QC identifiers, but it must not own or mutate those lane behaviors.",
    "Customer-safe projections must never expose internal prompts, raw worker instructions, protected file details, model routing, or worker secrets."
  ],
  allowedStatuses: [
    "draft",
    "awaiting_qc",
    "evidence_ready",
    "customer_result_ready",
    "archived",
    "failed"
  ],
  allowedArtifactPointerTypes: [
    "screenshot",
    "video",
    "qc_report",
    "raw_worker_output",
    "audit_trace",
    "customer_summary",
    "other"
  ],
  futureEvidenceServiceTarget: {
    serviceName: "neroa-one-evidence-linking-service",
    queueName: "neroa-one.evidence-linking",
    notes: [
      "Future DigitalOcean evidence services may persist and retrieve evidence links behind this contract after approved extraction work.",
      "Current lane remains modular-monolith infrastructure only and must not store evidence, wire QC Station, or change runtime behavior."
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

function buildRejectedPipelineValidationResult(
  reason: string
): NeroaOneEvidenceLinkPipelineIdsValidationResult {
  return {
    allowed: false,
    evidenceLane: neroaOneEvidenceLinkingLane,
    reason:
      normalizeText(reason) ||
      "Evidence link pipeline identifiers are not valid for the Neroa One evidence boundary."
  };
}

function buildRejectedRecordValidationResult(
  reason: string
): NeroaOneEvidenceLinkPipelineRecordValidationResult {
  return {
    allowed: false,
    evidenceLane: neroaOneEvidenceLinkingLane,
    reason:
      normalizeText(reason) ||
      "Evidence link pipeline records are not valid for the Neroa One evidence boundary."
  };
}

function buildFutureEvidenceServiceTarget(
  override: Partial<NeroaOneFutureEvidenceServiceTarget> | null | undefined
): NeroaOneFutureEvidenceServiceTarget {
  const normalizedNotes = normalizeStringList(override?.notes);

  return neroaOneFutureEvidenceServiceTargetSchema.parse({
    deploymentProvider: "digitalocean",
    serviceName:
      normalizeText(override?.serviceName) || "neroa-one-evidence-linking-service",
    queueName: normalizeText(override?.queueName) || "neroa-one.evidence-linking",
    serviceType: "future_evidence_linking_service",
    readyForStorage: false,
    notes:
      normalizedNotes.length > 0
        ? normalizedNotes
        : [
            "Future DigitalOcean evidence services may persist evidence-link records and customer-safe projections here.",
            "Current lane remains typed, backend-only, and storage-free."
          ]
  });
}

function buildEvidenceLinkId(args: {
  taskId: string;
  executionPacketId: string;
  createdAt: string;
}) {
  const timestampPart = normalizeText(args.createdAt).replace(/[^0-9TZ]/g, "");
  return `${args.taskId}:evidence-link:${args.executionPacketId}:${timestampPart}`;
}

function buildArtifactPointerId(args: {
  evidenceLinkId: string;
  pointerType: NeroaOneEvidenceArtifactPointerType;
  artifactId: string;
}) {
  return `${args.evidenceLinkId}:artifact:${args.pointerType}:${args.artifactId}`;
}

function isCustomerSafePointerType(
  pointerType: NeroaOneEvidenceArtifactPointerType
): pointerType is NeroaOneCustomerSafeEvidenceArtifactPointerType {
  return NEROA_ONE_CUSTOMER_SAFE_EVIDENCE_ARTIFACT_POINTER_TYPES.some(
    (allowedType) => allowedType === pointerType
  );
}

function buildPipelineIdsFromRecords(args: {
  outcomeItem: NeroaOneOutcomeQueueItem;
  executionPacket: NeroaOneCodexExecutionPacket;
  promptRoomItem: NeroaOnePromptRoomItem;
  workerRun: NeroaOneCodeExecutionWorkerRun;
  output?: NeroaOneCodexOutputRecord | null;
  review?: NeroaOneOutputReviewRecord | null;
  qcJob?: NeroaOneQcStationJobRecord | null;
  evidenceId?: string | null;
  recordingId?: string | null;
  screenshotIds?: readonly string[] | null;
  reportId?: string | null;
  customerResultId?: string | null;
}) {
  return neroaOneEvidenceLinkPipelineIdsSchema.parse({
    workspaceId: args.executionPacket.workspaceId,
    projectId: args.executionPacket.projectId,
    taskId: args.executionPacket.taskId,
    analyzerOutcome: args.outcomeItem.analyzerOutcome,
    outcomeLaneId: args.outcomeItem.analyzerOutcome,
    executionPacketId: args.executionPacket.executionPacketId,
    promptRoomItemId: args.promptRoomItem.promptRoomItemId,
    workerRunId: args.workerRun.workerRunId,
    outputId: normalizeNullableText(args.output?.outputId),
    reviewId: normalizeNullableText(args.review?.reviewId),
    qcJobId: normalizeNullableText(args.qcJob?.qcJobId),
    evidenceId: normalizeNullableText(args.evidenceId),
    recordingId: normalizeNullableText(args.recordingId),
    screenshotIds: normalizeStringList(args.screenshotIds),
    reportId: normalizeNullableText(args.reportId),
    customerResultId: normalizeNullableText(args.customerResultId)
  });
}

function inferStatusFromPipelineIds(
  pipelineIds: NeroaOneEvidenceLinkPipelineIds
): NeroaOneEvidenceLinkStatus {
  if (pipelineIds.customerResultId) {
    return "customer_result_ready";
  }

  if (pipelineIds.evidenceId || pipelineIds.recordingId || pipelineIds.reportId) {
    return "evidence_ready";
  }

  if (pipelineIds.qcJobId) {
    return "awaiting_qc";
  }

  return "draft";
}

export function validateEvidenceLinkPipelineIds(args: {
  pipelineIds: NeroaOneEvidenceLinkPipelineIds;
}): NeroaOneEvidenceLinkPipelineIdsValidationResult {
  const pipelineIdsResult = neroaOneEvidenceLinkPipelineIdsSchema.safeParse(args.pipelineIds);

  if (!pipelineIdsResult.success) {
    const [issue] = pipelineIdsResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "pipelineIds";

    return buildRejectedPipelineValidationResult(
      `Evidence link pipeline identifiers are invalid at ${issuePath}.`
    );
  }

  const pipelineIds = pipelineIdsResult.data;

  if (pipelineIds.analyzerOutcome !== "ready_to_build") {
    return buildRejectedPipelineValidationResult(
      `Evidence Linking currently requires analyzerOutcome ready_to_build. Received ${pipelineIds.analyzerOutcome}.`
    );
  }

  if (pipelineIds.outcomeLaneId !== "ready_to_build") {
    return buildRejectedPipelineValidationResult(
      `Evidence Linking currently requires outcomeLaneId ready_to_build. Received ${pipelineIds.outcomeLaneId}.`
    );
  }

  if (pipelineIds.reviewId && !pipelineIds.outputId) {
    return buildRejectedPipelineValidationResult(
      "Evidence link reviewId cannot be attached before outputId is present."
    );
  }

  if (pipelineIds.qcJobId && (!pipelineIds.outputId || !pipelineIds.reviewId)) {
    return buildRejectedPipelineValidationResult(
      "Evidence link qcJobId cannot be attached before outputId and reviewId are present."
    );
  }

  if (pipelineIds.customerResultId && !pipelineIds.evidenceId) {
    return buildRejectedPipelineValidationResult(
      "Evidence link customerResultId cannot be attached before evidenceId is present."
    );
  }

  return {
    allowed: true,
    evidenceLane: neroaOneEvidenceLinkingLane,
    pipelineIds
  };
}

export function validateEvidenceLinkPipelineRecords(args: {
  outcomeItem: NeroaOneOutcomeQueueItem;
  executionPacket: NeroaOneCodexExecutionPacket;
  promptRoomItem: NeroaOnePromptRoomItem;
  workerRun: NeroaOneCodeExecutionWorkerRun;
  output?: NeroaOneCodexOutputRecord | null;
  review?: NeroaOneOutputReviewRecord | null;
  qcJob?: NeroaOneQcStationJobRecord | null;
  evidenceId?: string | null;
  recordingId?: string | null;
  screenshotIds?: readonly string[] | null;
  reportId?: string | null;
  customerResultId?: string | null;
}): NeroaOneEvidenceLinkPipelineRecordValidationResult {
  if (neroaOnePromptRoomLane.upstreamLaneId !== neroaOneCodexExecutionPacketLane.laneId) {
    throw new Error(
      "Prompt Room lane must stay aligned with the Codex execution packet lane for evidence linking."
    );
  }

  if (neroaOneCodeExecutionWorkerLane.upstreamLaneId !== neroaOnePromptRoomLane.laneId) {
    throw new Error(
      "Code execution worker lane must stay aligned with the Prompt Room lane for evidence linking."
    );
  }

  if (neroaOneOutputReviewLane.upstreamLaneId !== neroaOneCodexOutputBoxLane.laneId) {
    throw new Error(
      "Output review lane must stay aligned with the Codex output box lane for evidence linking."
    );
  }

  if (neroaOneQcStationLane.upstreamLaneId !== neroaOneOutputReviewLane.laneId) {
    throw new Error(
      "QC Station lane must stay aligned with the output review lane for evidence linking."
    );
  }

  const outcomeItemResult = neroaOneOutcomeQueueItemSchema.safeParse(args.outcomeItem);
  const executionPacketResult = neroaOneCodexExecutionPacketSchema.safeParse(args.executionPacket);
  const promptRoomItemResult = neroaOnePromptRoomItemSchema.safeParse(args.promptRoomItem);
  const workerRunResult = neroaOneCodeExecutionWorkerRunSchema.safeParse(args.workerRun);
  const outputResult = z
    .nullable(neroaOneCodexOutputRecordSchema)
    .safeParse(args.output ?? null);
  const reviewResult = z
    .nullable(neroaOneOutputReviewRecordSchema)
    .safeParse(args.review ?? null);
  const qcJobResult = z
    .nullable(neroaOneQcStationJobRecordSchema)
    .safeParse(args.qcJob ?? null);

  if (!outcomeItemResult.success) {
    const [issue] = outcomeItemResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "outcomeItem";
    return buildRejectedRecordValidationResult(
      `Outcome queue item is invalid for evidence linking at ${issuePath}.`
    );
  }

  if (!executionPacketResult.success) {
    const [issue] = executionPacketResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "executionPacket";
    return buildRejectedRecordValidationResult(
      `Execution packet is invalid for evidence linking at ${issuePath}.`
    );
  }

  if (!promptRoomItemResult.success) {
    const [issue] = promptRoomItemResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "promptRoomItem";
    return buildRejectedRecordValidationResult(
      `Prompt Room item is invalid for evidence linking at ${issuePath}.`
    );
  }

  if (!workerRunResult.success) {
    const [issue] = workerRunResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "workerRun";
    return buildRejectedRecordValidationResult(
      `Worker run is invalid for evidence linking at ${issuePath}.`
    );
  }

  if (!outputResult.success) {
    const [issue] = outputResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "output";
    return buildRejectedRecordValidationResult(
      `Output record is invalid for evidence linking at ${issuePath}.`
    );
  }

  if (!reviewResult.success) {
    const [issue] = reviewResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "review";
    return buildRejectedRecordValidationResult(
      `Output review is invalid for evidence linking at ${issuePath}.`
    );
  }

  if (!qcJobResult.success) {
    const [issue] = qcJobResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "qcJob";
    return buildRejectedRecordValidationResult(
      `QC job is invalid for evidence linking at ${issuePath}.`
    );
  }

  const outcomeItem = outcomeItemResult.data;
  const executionPacket = executionPacketResult.data;
  const promptRoomItem = promptRoomItemResult.data;
  const workerRun = workerRunResult.data;
  const output = outputResult.data;
  const review = reviewResult.data;
  const qcJob = qcJobResult.data;

  const workerBoundaryValidation = validateCodexExecutionPacketForCodeExecutionWorkerRun({
    promptRoomItem
  });

  if (!workerBoundaryValidation.allowed) {
    return buildRejectedRecordValidationResult(workerBoundaryValidation.reason);
  }

  if (outcomeItem.analyzerOutcome !== executionPacket.sourceLaneId) {
    return buildRejectedRecordValidationResult(
      `Outcome lane ${outcomeItem.analyzerOutcome} does not match execution packet source lane ${executionPacket.sourceLaneId}.`
    );
  }

  if (
    outcomeItem.workspaceId !== executionPacket.workspaceId ||
    outcomeItem.projectId !== executionPacket.projectId ||
    outcomeItem.taskId !== executionPacket.taskId
  ) {
    return buildRejectedRecordValidationResult(
      "Outcome item and execution packet do not reference the same workspace, project, and task identifiers."
    );
  }

  if (promptRoomItem.executionPacketId !== executionPacket.executionPacketId) {
    return buildRejectedRecordValidationResult(
      "Prompt Room item does not reference the same execution packet as the evidence-link pipeline."
    );
  }

  if (workerRun.executionPacketId !== executionPacket.executionPacketId) {
    return buildRejectedRecordValidationResult(
      "Worker run does not reference the same execution packet as the evidence-link pipeline."
    );
  }

  if (
    workerRun.workspaceId !== executionPacket.workspaceId ||
    workerRun.projectId !== executionPacket.projectId ||
    workerRun.taskId !== executionPacket.taskId
  ) {
    return buildRejectedRecordValidationResult(
      "Worker run does not reference the same workspace, project, and task identifiers as the evidence-link pipeline."
    );
  }

  if (output && output.executionPacketId !== executionPacket.executionPacketId) {
    return buildRejectedRecordValidationResult(
      "Output record does not reference the same execution packet as the evidence-link pipeline."
    );
  }

  if (review && output == null) {
    return buildRejectedRecordValidationResult(
      "Output review cannot be linked before an output record is present."
    );
  }

  if (review && output && review.outputId !== output.outputId) {
    return buildRejectedRecordValidationResult(
      "Output review does not reference the linked output record."
    );
  }

  if (qcJob && review == null) {
    return buildRejectedRecordValidationResult(
      "QC job cannot be linked before an output review is present."
    );
  }

  if (qcJob && review) {
    const qcReviewValidation = validateApprovedOutputReviewForQcStation({
      review
    });

    if (!qcReviewValidation.allowed) {
      return buildRejectedRecordValidationResult(qcReviewValidation.reason);
    }

    if (qcJob.reviewId !== review.reviewId || qcJob.outputId !== review.outputId) {
      return buildRejectedRecordValidationResult(
        "QC job does not reference the linked output review and output record."
      );
    }
  }

  const pipelineIdsValidation = validateEvidenceLinkPipelineIds({
    pipelineIds: buildPipelineIdsFromRecords({
      outcomeItem,
      executionPacket,
      promptRoomItem,
      workerRun,
      output,
      review,
      qcJob,
      evidenceId: args.evidenceId,
      recordingId: args.recordingId,
      screenshotIds: args.screenshotIds,
      reportId: args.reportId,
      customerResultId: args.customerResultId
    })
  });

  if (!pipelineIdsValidation.allowed) {
    return buildRejectedRecordValidationResult(pipelineIdsValidation.reason);
  }

  return {
    allowed: true,
    evidenceLane: neroaOneEvidenceLinkingLane,
    outcomeItem,
    executionPacket,
    promptRoomItem,
    workerRun,
    output,
    review,
    qcJob,
    pipelineIds: pipelineIdsValidation.pipelineIds
  };
}

export function createDraftEvidenceLinkFromPipelineIds(args: {
  pipelineIds: NeroaOneEvidenceLinkPipelineIds;
  status?: NeroaOneEvidenceLinkStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  artifactPointers?: readonly NeroaOneEvidenceArtifactPointer[] | null;
  futureEvidenceServiceTarget?: Partial<NeroaOneFutureEvidenceServiceTarget> | null;
}): NeroaOneEvidenceLinkRecord {
  const pipelineIdsValidation = validateEvidenceLinkPipelineIds({
    pipelineIds: args.pipelineIds
  });

  if (!pipelineIdsValidation.allowed) {
    throw new Error(pipelineIdsValidation.reason);
  }

  const pipelineIds = pipelineIdsValidation.pipelineIds;
  const createdAt = normalizeText(args.createdAt) || new Date().toISOString();
  const updatedAt = normalizeText(args.updatedAt) || createdAt;
  const status = neroaOneEvidenceLinkStatusSchema.parse(
    args.status ?? inferStatusFromPipelineIds(pipelineIds)
  );

  return neroaOneEvidenceLinkRecordSchema.parse({
    evidenceLinkId: buildEvidenceLinkId({
      taskId: pipelineIds.taskId,
      executionPacketId: pipelineIds.executionPacketId,
      createdAt
    }),
    ...pipelineIds,
    status,
    artifactPointers: (args.artifactPointers ?? []).map((pointer) =>
      neroaOneEvidenceArtifactPointerSchema.parse({
        ...pointer,
        notes: normalizeStringList(pointer.notes)
      })
    ),
    createdAt,
    updatedAt,
    futureEvidenceServiceTarget: buildFutureEvidenceServiceTarget(
      args.futureEvidenceServiceTarget
    )
  });
}

export function createDraftEvidenceLinkFromPipelineRecords(args: {
  outcomeItem: NeroaOneOutcomeQueueItem;
  executionPacket: NeroaOneCodexExecutionPacket;
  promptRoomItem: NeroaOnePromptRoomItem;
  workerRun: NeroaOneCodeExecutionWorkerRun;
  output?: NeroaOneCodexOutputRecord | null;
  review?: NeroaOneOutputReviewRecord | null;
  qcJob?: NeroaOneQcStationJobRecord | null;
  evidenceId?: string | null;
  recordingId?: string | null;
  screenshotIds?: readonly string[] | null;
  reportId?: string | null;
  customerResultId?: string | null;
  status?: NeroaOneEvidenceLinkStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  artifactPointers?: readonly NeroaOneEvidenceArtifactPointer[] | null;
  futureEvidenceServiceTarget?: Partial<NeroaOneFutureEvidenceServiceTarget> | null;
}): NeroaOneEvidenceLinkRecord {
  const recordValidation = validateEvidenceLinkPipelineRecords(args);

  if (!recordValidation.allowed) {
    throw new Error(recordValidation.reason);
  }

  return createDraftEvidenceLinkFromPipelineIds({
    pipelineIds: recordValidation.pipelineIds,
    status: args.status,
    createdAt: args.createdAt ?? args.executionPacket.createdAt,
    updatedAt: args.updatedAt ?? args.executionPacket.createdAt,
    artifactPointers: args.artifactPointers,
    futureEvidenceServiceTarget: args.futureEvidenceServiceTarget
  });
}

export function createEvidenceArtifactPointer(args: {
  evidenceLinkId: string;
  artifactId: string;
  pointerType: NeroaOneEvidenceArtifactPointerType;
  title: string;
  uri?: string | null;
  createdAt?: string | null;
  notes?: readonly string[] | null;
}): NeroaOneEvidenceArtifactPointer {
  const evidenceLinkId = normalizeText(args.evidenceLinkId);
  const artifactId = normalizeText(args.artifactId);
  const pointerType = neroaOneEvidenceArtifactPointerTypeSchema.parse(args.pointerType);
  const createdAt = normalizeText(args.createdAt) || new Date().toISOString();

  return neroaOneEvidenceArtifactPointerSchema.parse({
    artifactPointerId: buildArtifactPointerId({
      evidenceLinkId,
      pointerType,
      artifactId
    }),
    artifactId,
    pointerType,
    title: normalizeText(args.title),
    uri: normalizeNullableText(args.uri),
    createdAt,
    notes: normalizeStringList(args.notes)
  });
}

export function attachArtifactPointerToEvidenceLink(args: {
  link: NeroaOneEvidenceLinkRecord;
  pointer: NeroaOneEvidenceArtifactPointer;
  updatedAt?: string | null;
}): NeroaOneEvidenceLinkRecord {
  const link = neroaOneEvidenceLinkRecordSchema.parse(args.link);
  const pointer = neroaOneEvidenceArtifactPointerSchema.parse({
    ...args.pointer,
    notes: normalizeStringList(args.pointer.notes)
  });
  const artifactPointers = [
    ...link.artifactPointers.filter(
      (existingPointer) => existingPointer.artifactPointerId !== pointer.artifactPointerId
    ),
    pointer
  ];
  const nextScreenshotIds = [...link.screenshotIds];
  let recordingId = link.recordingId;
  let reportId = link.reportId;
  let customerResultId = link.customerResultId;

  if (pointer.pointerType === "screenshot" && !nextScreenshotIds.includes(pointer.artifactId)) {
    nextScreenshotIds.push(pointer.artifactId);
  }

  if (pointer.pointerType === "video" && !recordingId) {
    recordingId = pointer.artifactId;
  }

  if (pointer.pointerType === "qc_report" && !reportId) {
    reportId = pointer.artifactId;
  }

  if (pointer.pointerType === "customer_summary" && !customerResultId) {
    customerResultId = pointer.artifactId;
  }

  return neroaOneEvidenceLinkRecordSchema.parse({
    ...link,
    artifactPointers,
    recordingId,
    screenshotIds: normalizeStringList(nextScreenshotIds),
    reportId,
    customerResultId,
    updatedAt: normalizeText(args.updatedAt) || pointer.createdAt || link.updatedAt
  });
}

export function attachArtifactPointersToEvidenceLink(args: {
  link: NeroaOneEvidenceLinkRecord;
  pointers: readonly NeroaOneEvidenceArtifactPointer[];
  updatedAt?: string | null;
}): NeroaOneEvidenceLinkRecord {
  return args.pointers.reduce(
    (link, pointer) =>
      attachArtifactPointerToEvidenceLink({
        link,
        pointer,
        updatedAt: args.updatedAt
      }),
    neroaOneEvidenceLinkRecordSchema.parse(args.link)
  );
}

export function getCustomerSafeEvidenceSummary(args: {
  link: NeroaOneEvidenceLinkRecord;
}): NeroaOneCustomerSafeEvidenceSummary {
  const link = neroaOneEvidenceLinkRecordSchema.parse(args.link);

  return neroaOneCustomerSafeEvidenceSummarySchema.parse({
    evidenceLinkId: link.evidenceLinkId,
    workspaceId: link.workspaceId,
    projectId: link.projectId,
    taskId: link.taskId,
    status: link.status,
    evidenceId: link.evidenceId,
    recordingId: link.recordingId,
    screenshotIds: normalizeStringList(link.screenshotIds),
    reportId: link.reportId,
    customerResultId: link.customerResultId,
    customerSafeArtifactPointers: link.artifactPointers
      .filter((pointer) => isCustomerSafePointerType(pointer.pointerType))
      .map((pointer) =>
        neroaOneCustomerSafeEvidenceArtifactPointerSummarySchema.parse({
          artifactPointerId: pointer.artifactPointerId,
          artifactId: pointer.artifactId,
          pointerType: pointer.pointerType
        })
      ),
    updatedAt: link.updatedAt
  });
}

export function getEvidenceLinkStatuses() {
  return [...neroaOneEvidenceLinkingLane.allowedStatuses];
}

export function getEvidenceArtifactPointerTypes() {
  return [...neroaOneEvidenceLinkingLane.allowedArtifactPointerTypes];
}
