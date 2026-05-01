import { z } from "zod";
import {
  neroaOneCodexExecutionPacketLane,
  neroaOneCodexExecutionPacketSchema,
  type NeroaOneCodexExecutionPacket
} from "./codex-execution-packet.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

export const NEROA_ONE_CODE_EXECUTION_WORKER_ENGINES = [
  "codex_cli",
  "codex_cloud",
  "claude_code",
  "manual_operator",
  "future_engine"
] as const;

export const NEROA_ONE_CODE_EXECUTION_WORKER_RUN_STATUSES = [
  "queued",
  "running",
  "completed",
  "failed",
  "canceled"
] as const;

export const NEROA_ONE_CODE_EXECUTION_MODES = [
  "plan_only",
  "patch_proposal",
  "implementation_guidance"
] as const;

export const NEROA_ONE_CODE_EXECUTION_RISK_LEVELS = ["low", "medium", "high"] as const;

export const neroaOneCodeExecutionWorkerEngineSchema = z.enum(
  NEROA_ONE_CODE_EXECUTION_WORKER_ENGINES
);
export const neroaOneCodeExecutionWorkerRunStatusSchema = z.enum(
  NEROA_ONE_CODE_EXECUTION_WORKER_RUN_STATUSES
);
export const neroaOneCodeExecutionModeSchema = z.enum(NEROA_ONE_CODE_EXECUTION_MODES);
export const neroaOneCodeExecutionRiskLevelSchema = z.enum(
  NEROA_ONE_CODE_EXECUTION_RISK_LEVELS
);

export type NeroaOneCodeExecutionWorkerEngine = z.infer<
  typeof neroaOneCodeExecutionWorkerEngineSchema
>;
export type NeroaOneCodeExecutionWorkerRunStatus = z.infer<
  typeof neroaOneCodeExecutionWorkerRunStatusSchema
>;
export type NeroaOneCodeExecutionMode = z.infer<typeof neroaOneCodeExecutionModeSchema>;
export type NeroaOneCodeExecutionRiskLevel = z.infer<
  typeof neroaOneCodeExecutionRiskLevelSchema
>;

export const neroaOneCodeExecutionPromptPayloadSchema = z
  .object({
    status: z.enum(["placeholder_only", "prepared_text"]),
    promptText: trimmedStringSchema,
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOneCodeExecutionPromptPayload = z.infer<
  typeof neroaOneCodeExecutionPromptPayloadSchema
>;

export const neroaOneCodeExecutionFutureDigitalOceanWorkerTargetSchema = z
  .object({
    deploymentProvider: z.literal("digitalocean"),
    serviceName: trimmedStringSchema,
    queueName: trimmedStringSchema,
    workerType: z.literal("future_code_execution_worker"),
    readyForExecution: z.literal(false),
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOneCodeExecutionFutureDigitalOceanWorkerTarget = z.infer<
  typeof neroaOneCodeExecutionFutureDigitalOceanWorkerTargetSchema
>;

export const neroaOneCodeExecutionWorkerRunSchema = z
  .object({
    workerRunId: trimmedStringSchema,
    executionPacketId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    selectedEngine: neroaOneCodeExecutionWorkerEngineSchema,
    executionMode: neroaOneCodeExecutionModeSchema,
    promptPayload: neroaOneCodeExecutionPromptPayloadSchema,
    protectedAreas: stringListSchema,
    acceptanceCriteria: stringListSchema,
    testCommands: stringListSchema,
    riskLevel: neroaOneCodeExecutionRiskLevelSchema,
    createdAt: trimmedStringSchema,
    futureDigitalOceanWorkerTarget: neroaOneCodeExecutionFutureDigitalOceanWorkerTargetSchema,
    status: neroaOneCodeExecutionWorkerRunStatusSchema
  })
  .strict();

export type NeroaOneCodeExecutionWorkerRun = z.infer<
  typeof neroaOneCodeExecutionWorkerRunSchema
>;

export const neroaOneCodeExecutionWorkerLaneDefinitionSchema = z
  .object({
    laneId: z.literal("code_execution_worker"),
    upstreamLaneId: z.literal("codex_execution_packet_draft"),
    backendOnly: z.literal(true),
    extractionReady: z.literal(true),
    engineAgnostic: z.literal(true),
    independentlyReplaceable: z.literal(true),
    treatsBuildRoomAsViewportOnly: z.literal(true),
    ownsUiNow: z.literal(false),
    dispatchesRealDigitalOceanJobsNow: z.literal(false),
    writesPersistenceNow: z.literal(false),
    supportedEngines: z.tuple([
      z.literal("codex_cli"),
      z.literal("codex_cloud"),
      z.literal("claude_code"),
      z.literal("manual_operator"),
      z.literal("future_engine")
    ]),
    allowedStatuses: z.tuple([
      z.literal("queued"),
      z.literal("running"),
      z.literal("completed"),
      z.literal("failed"),
      z.literal("canceled")
    ]),
    displayPurposeInternal: trimmedStringSchema,
    internalOnlyNotes: stringListSchema.min(1),
    futureExtractionTarget: z
      .object({
        serviceName: trimmedStringSchema,
        queueName: trimmedStringSchema,
        notes: stringListSchema.min(1)
      })
      .strict()
  })
  .strict();

export type NeroaOneCodeExecutionWorkerLaneDefinition = z.infer<
  typeof neroaOneCodeExecutionWorkerLaneDefinitionSchema
>;

export type NeroaOneCodeExecutionWorkerPacketValidationResult =
  | {
      allowed: true;
      packetLane: typeof neroaOneCodexExecutionPacketLane;
      workerLane: NeroaOneCodeExecutionWorkerLaneDefinition;
      executionPacket: NeroaOneCodexExecutionPacket;
    }
  | {
      allowed: false;
      packetLane: typeof neroaOneCodexExecutionPacketLane;
      workerLane: NeroaOneCodeExecutionWorkerLaneDefinition;
      reason: string;
    };

export interface NeroaOneCodeExecutionWorkerStorageAdapter {
  saveWorkerRun(run: NeroaOneCodeExecutionWorkerRun): Promise<void>;
  getWorkerRunById(workerRunId: string): Promise<NeroaOneCodeExecutionWorkerRun | null>;
}

export const neroaOneCodeExecutionWorkerLane =
  neroaOneCodeExecutionWorkerLaneDefinitionSchema.parse({
    laneId: "code_execution_worker",
    upstreamLaneId: "codex_execution_packet_draft",
    backendOnly: true,
    extractionReady: true,
    engineAgnostic: true,
    independentlyReplaceable: true,
    treatsBuildRoomAsViewportOnly: true,
    ownsUiNow: false,
    dispatchesRealDigitalOceanJobsNow: false,
    writesPersistenceNow: false,
    supportedEngines: [
      "codex_cli",
      "codex_cloud",
      "claude_code",
      "manual_operator",
      "future_engine"
    ],
    allowedStatuses: ["queued", "running", "completed", "failed", "canceled"],
    displayPurposeInternal:
      "Defines the backend-only DigitalOcean-hosted code execution worker lane contract for engine-agnostic implementation runs outside Build Room.",
    internalOnlyNotes: [
      "Build Room remains a viewport and control surface only and must not become the execution home for code engines.",
      "This lane is contract-only for a future DigitalOcean worker boundary and must not call Codex, DigitalOcean, persistence, queues, or UI code today."
    ],
    futureExtractionTarget: {
      serviceName: "neroa-one-code-execution-worker",
      queueName: "neroa-one.code-execution-worker",
      notes: [
        "Future DigitalOcean services may extract this worker lane behind a backend-only API or queue without changing the request contract.",
        "Current lane remains a typed modular-monolith boundary with no live dispatch, storage, or Build Room wiring."
      ]
    }
  });

function normalizeText(value: string | null | undefined) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
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

function buildRejectedPacketValidationResult(
  reason: string
): NeroaOneCodeExecutionWorkerPacketValidationResult {
  return {
    allowed: false,
    packetLane: neroaOneCodexExecutionPacketLane,
    workerLane: neroaOneCodeExecutionWorkerLane,
    reason:
      normalizeText(reason) ||
      "Execution packet is not eligible to create a code execution worker run."
  };
}

function buildPromptPayloadFromExecutionPacket(
  executionPacket: NeroaOneCodexExecutionPacket
): NeroaOneCodeExecutionPromptPayload {
  return neroaOneCodeExecutionPromptPayloadSchema.parse({
    status: executionPacket.promptDraft.status,
    promptText: executionPacket.promptDraft.promptText,
    notes: normalizeStringList([
      ...executionPacket.promptDraft.notes,
      "Prompt payload remains placeholder-only until a future approved backend dispatcher is implemented."
    ])
  });
}

function buildFutureDigitalOceanWorkerTarget(args: {
  selectedEngine: NeroaOneCodeExecutionWorkerEngine;
  override?:
    | Partial<NeroaOneCodeExecutionFutureDigitalOceanWorkerTarget>
    | null
    | undefined;
}): NeroaOneCodeExecutionFutureDigitalOceanWorkerTarget {
  const normalizedNotes = normalizeStringList(args.override?.notes);

  return neroaOneCodeExecutionFutureDigitalOceanWorkerTargetSchema.parse({
    deploymentProvider: "digitalocean",
    serviceName:
      normalizeText(args.override?.serviceName) || "neroa-one-code-execution-worker",
    queueName:
      normalizeText(args.override?.queueName) ||
      `neroa-one.code-execution-worker.${args.selectedEngine}`,
    workerType: "future_code_execution_worker",
    readyForExecution: false,
    notes:
      normalizedNotes.length > 0
        ? normalizedNotes
        : [
            `Future DigitalOcean worker lanes may route ${args.selectedEngine} execution without changing the contract shape.`,
            "Current lane is backend-only, queue-shaped, and extraction-ready, but it must not dispatch live worker jobs."
          ]
  });
}

function buildWorkerRunId(args: {
  executionPacketId: string;
  selectedEngine: NeroaOneCodeExecutionWorkerEngine;
  createdAt: string;
}) {
  const timestampPart = normalizeText(args.createdAt).replace(/[^0-9TZ]/g, "");
  return `${args.executionPacketId}:worker:${args.selectedEngine}:${timestampPart}`;
}

export function validateCodexExecutionPacketForCodeExecutionWorkerRun(args: {
  executionPacket: NeroaOneCodexExecutionPacket;
}): NeroaOneCodeExecutionWorkerPacketValidationResult {
  if (neroaOneCodeExecutionWorkerLane.upstreamLaneId !== neroaOneCodexExecutionPacketLane.laneId) {
    throw new Error(
      "Code execution worker lane must reference the Codex execution packet lane as its current upstream boundary."
    );
  }

  const executionPacketResult = neroaOneCodexExecutionPacketSchema.safeParse(args.executionPacket);

  if (!executionPacketResult.success) {
    const [issue] = executionPacketResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "executionPacket";

    return buildRejectedPacketValidationResult(
      `Execution packet is invalid for the code execution worker boundary at ${issuePath}.`
    );
  }

  const executionPacket = executionPacketResult.data;

  if (executionPacket.sourceLaneId !== neroaOneCodexExecutionPacketLane.sourceLaneId) {
    return buildRejectedPacketValidationResult(
      `Execution packet source lane ${executionPacket.sourceLaneId} does not match the required ${neroaOneCodexExecutionPacketLane.sourceLaneId} source lane.`
    );
  }

  return {
    allowed: true,
    packetLane: neroaOneCodexExecutionPacketLane,
    workerLane: neroaOneCodeExecutionWorkerLane,
    executionPacket
  };
}

export function canCreateCodeExecutionWorkerRunFromCodexExecutionPacket(args: {
  executionPacket: NeroaOneCodexExecutionPacket;
}) {
  return validateCodexExecutionPacketForCodeExecutionWorkerRun(args).allowed;
}

export function createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket(args: {
  executionPacket: NeroaOneCodexExecutionPacket;
  selectedEngine?: NeroaOneCodeExecutionWorkerEngine | null;
  executionMode?: NeroaOneCodeExecutionMode | null;
  promptPayload?: NeroaOneCodeExecutionPromptPayload | null;
  protectedAreas?: readonly string[] | null;
  acceptanceCriteria?: readonly string[] | null;
  testCommands?: readonly string[] | null;
  riskLevel?: NeroaOneCodeExecutionRiskLevel | null;
  createdAt?: string | null;
  futureDigitalOceanWorkerTarget?:
    | Partial<NeroaOneCodeExecutionFutureDigitalOceanWorkerTarget>
    | null;
}): NeroaOneCodeExecutionWorkerRun {
  const packetValidation = validateCodexExecutionPacketForCodeExecutionWorkerRun({
    executionPacket: args.executionPacket
  });

  if (!packetValidation.allowed) {
    throw new Error(packetValidation.reason);
  }

  const executionPacket = packetValidation.executionPacket;
  const selectedEngine = neroaOneCodeExecutionWorkerEngineSchema.parse(
    args.selectedEngine ?? "codex_cli"
  );
  const createdAt = normalizeText(args.createdAt) || executionPacket.createdAt;

  return neroaOneCodeExecutionWorkerRunSchema.parse({
    workerRunId: buildWorkerRunId({
      executionPacketId: executionPacket.executionPacketId,
      selectedEngine,
      createdAt
    }),
    executionPacketId: executionPacket.executionPacketId,
    workspaceId: executionPacket.workspaceId,
    projectId: executionPacket.projectId,
    taskId: executionPacket.taskId,
    selectedEngine,
    executionMode: args.executionMode ?? "patch_proposal",
    promptPayload:
      args.promptPayload != null
        ? neroaOneCodeExecutionPromptPayloadSchema.parse({
            ...args.promptPayload,
            notes: normalizeStringList(args.promptPayload.notes)
          })
        : buildPromptPayloadFromExecutionPacket(executionPacket),
    protectedAreas: normalizeStringList(args.protectedAreas ?? executionPacket.protectedAreas),
    acceptanceCriteria: normalizeStringList(
      args.acceptanceCriteria ?? executionPacket.acceptanceCriteria
    ),
    testCommands: normalizeStringList(args.testCommands ?? executionPacket.testCommands),
    riskLevel: args.riskLevel ?? executionPacket.riskLevel,
    createdAt,
    futureDigitalOceanWorkerTarget: buildFutureDigitalOceanWorkerTarget({
      selectedEngine,
      override: args.futureDigitalOceanWorkerTarget
    }),
    status: "queued"
  });
}

export function getCodeExecutionWorkerEngines() {
  return [...neroaOneCodeExecutionWorkerLane.supportedEngines];
}

export function getCodeExecutionWorkerRunStatuses() {
  return [...neroaOneCodeExecutionWorkerLane.allowedStatuses];
}
