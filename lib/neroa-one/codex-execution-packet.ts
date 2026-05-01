import { z } from "zod";
import {
  buildRoomRiskLevelSchema,
  buildRoomTaskTypeSchema,
  type BuildRoomRiskLevel,
  type BuildRoomTaskType
} from "../build-room/contracts.ts";
import {
  canNeroaOneOutcomeLaneEnterCodexExecution,
  getNeroaOneOutcomeLaneIdsEligibleForCodexExecution,
  getNeroaOneOutcomeLaneDefinition,
  validateNeroaOneOutcomeQueueItemForLane
} from "./outcome-lanes.ts";
import {
  neroaOneOutcomeQueueEntrySchema,
  neroaOneOutcomeQueueItemSchema,
  type NeroaOneOutcomeQueueEntry,
  type NeroaOneOutcomeQueueItem
} from "./outcome-queues.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

export const neroaOneCodexExecutionPacketSourceLaneSchema = z.literal("ready_to_build");
export type NeroaOneCodexExecutionPacketSourceLane = z.infer<
  typeof neroaOneCodexExecutionPacketSourceLaneSchema
>;

export const neroaOneCodexExecutionPromptDraftSchema = z
  .object({
    status: z.literal("placeholder_only"),
    promptText: z.literal("PROMPT_GENERATION_DEFERRED"),
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOneCodexExecutionPromptDraft = z.infer<
  typeof neroaOneCodexExecutionPromptDraftSchema
>;

export const neroaOneCodexExecutionFutureDispatchTargetSchema = z
  .object({
    owner: z.literal("future_digitalocean_codex_dispatch_service"),
    queueName: trimmedStringSchema,
    dispatchMode: z.literal("deferred"),
    readyForDispatch: z.literal(false),
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOneCodexExecutionFutureDispatchTarget = z.infer<
  typeof neroaOneCodexExecutionFutureDispatchTargetSchema
>;

export const neroaOneCodexExecutionPacketSchema = z
  .object({
    executionPacketId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    sourceLaneId: neroaOneCodexExecutionPacketSourceLaneSchema,
    normalizedRequest: trimmedStringSchema,
    executionTaskType: buildRoomTaskTypeSchema,
    protectedAreas: stringListSchema,
    acceptanceCriteria: stringListSchema,
    testCommands: stringListSchema,
    riskLevel: buildRoomRiskLevelSchema,
    requiresQc: z.boolean(),
    requiresCustomerCheckpoint: z.boolean(),
    promptDraft: neroaOneCodexExecutionPromptDraftSchema,
    createdAt: trimmedStringSchema,
    futureDispatchTarget: neroaOneCodexExecutionFutureDispatchTargetSchema
  })
  .strict();

export type NeroaOneCodexExecutionPacket = z.infer<
  typeof neroaOneCodexExecutionPacketSchema
>;

export const neroaOneCodexExecutionPacketLaneDefinitionSchema = z
  .object({
    laneId: z.literal("codex_execution_packet_draft"),
    sourceLaneId: neroaOneCodexExecutionPacketSourceLaneSchema,
    backendOnly: z.literal(true),
    extractionReady: z.literal(true),
    selectsRuntimeWorkerInfrastructureNow: z.literal(false),
    callsCodexNow: z.literal(false),
    ownsUiNow: z.literal(false),
    writesPersistenceNow: z.literal(false),
    displayPurposeInternal: trimmedStringSchema,
    internalOnlyNotes: stringListSchema.min(1),
    futureDispatchTarget: neroaOneCodexExecutionFutureDispatchTargetSchema
  })
  .strict();

export type NeroaOneCodexExecutionPacketLaneDefinition = z.infer<
  typeof neroaOneCodexExecutionPacketLaneDefinitionSchema
>;

export const DEFAULT_NEROA_ONE_CODEX_EXECUTION_PROTECTED_AREAS = [
  "ui_layout",
  "customer_facing_copy",
  "command_center_panels",
  "build_room_panels",
  "strategy_room_behavior",
  "library_behavior",
  "browser_qc_runtime",
  "persistence_schema",
  "task_status_logic",
  "review_outcome_logic",
  "codex_relay_behavior",
  "worker_trigger_behavior",
  "execution_queue_behavior",
  "ai_model_calls"
] as const;

const DEFAULT_NEROA_ONE_CODEX_EXECUTION_PACKET_QUEUE_NAME =
  "neroa-one.codex-execution-packets";
const CODE_EXECUTION_WORKER_INFRASTRUCTURE_MARKERS = [
  "code-execution-worker",
  "codex_cli",
  "codex_cloud",
  "claude_code",
  "manual_operator",
  "future_engine"
] as const;

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

function pickStringListOrFallback(
  values: readonly string[] | null | undefined,
  fallback: readonly string[]
) {
  const normalized = normalizeStringList(values);
  return normalized.length > 0 ? normalized : [...fallback];
}

function inferExecutionTaskType(normalizedRequest: string): BuildRoomTaskType {
  const text = normalizeText(normalizedRequest).toLowerCase();

  if (
    /(qa|quality assurance|test|verify|validation|review evidence|acceptance)/.test(text)
  ) {
    return "qa";
  }

  if (/(bug|fix|broken|regression|repair|patch)/.test(text)) {
    return "bug_fix";
  }

  if (/(research|investigate|analyze|analysis|discovery)/.test(text)) {
    return "research";
  }

  if (/(ops|operations|deploy|release|runbook|handoff)/.test(text)) {
    return "operations";
  }

  return "implementation";
}

function buildExecutionPacketId(item: NeroaOneOutcomeQueueItem) {
  return [
    item.workspaceId,
    item.projectId,
    item.taskId,
    "codex-execution-packet-draft"
  ].join(":");
}

function buildPromptDraft(): NeroaOneCodexExecutionPromptDraft {
  return neroaOneCodexExecutionPromptDraftSchema.parse({
    status: "placeholder_only",
    promptText: "PROMPT_GENERATION_DEFERRED",
    notes: [
      "Prompt generation is intentionally deferred until a future approved dispatch template exists.",
      "This draft packet must not call Codex or synthesize a real prompt body in the current backend lane."
    ]
  });
}

function queueNameSelectsRuntimeWorkerInfrastructure(queueName: string) {
  const normalizedQueueName = normalizeText(queueName).toLowerCase();

  return CODE_EXECUTION_WORKER_INFRASTRUCTURE_MARKERS.some((marker) =>
    normalizedQueueName.includes(marker.toLowerCase())
  );
}

function buildFutureDispatchTarget(
  override: Partial<NeroaOneCodexExecutionFutureDispatchTarget> | null | undefined
): NeroaOneCodexExecutionFutureDispatchTarget {
  const queueName =
    normalizeText(override?.queueName) || DEFAULT_NEROA_ONE_CODEX_EXECUTION_PACKET_QUEUE_NAME;

  if (queueNameSelectsRuntimeWorkerInfrastructure(queueName)) {
    throw new Error(
      `Execution packet draft queue ${queueName} cannot select code execution worker infrastructure.`
    );
  }

  return neroaOneCodexExecutionFutureDispatchTargetSchema.parse({
    owner: "future_digitalocean_codex_dispatch_service",
    queueName,
    dispatchMode: "deferred",
    readyForDispatch: false,
    notes: pickStringListOrFallback(override?.notes, [
      "Future DigitalOcean dispatch may consume this packet after explicit release wiring is approved.",
      "Current lane is contract-only and does not perform dispatch, storage, queue release, Codex calls, or runtime worker selection."
    ])
  });
}

export const neroaOneCodexExecutionPacketLane =
  neroaOneCodexExecutionPacketLaneDefinitionSchema.parse({
    laneId: "codex_execution_packet_draft",
    sourceLaneId: "ready_to_build",
    backendOnly: true,
    extractionReady: true,
    selectsRuntimeWorkerInfrastructureNow: false,
    callsCodexNow: false,
    ownsUiNow: false,
    writesPersistenceNow: false,
    displayPurposeInternal:
      "Creates extraction-ready draft execution packets from approved ready_to_build work.",
    internalOnlyNotes: [
      "This lane is backend-only and must remain detached from UI panels and customer-facing behavior.",
      "This lane produces a typed draft contract only and must not select worker infrastructure, call Codex, generate real prompts, or store packet records."
    ],
    futureDispatchTarget: buildFutureDispatchTarget(null)
  });

export type NeroaOneCodexExecutionPacketEligibilityResult =
  | {
      allowed: true;
      sourceLane: ReturnType<typeof getNeroaOneOutcomeLaneDefinition>;
      packetLane: NeroaOneCodexExecutionPacketLaneDefinition;
    }
  | {
      allowed: false;
      sourceLane: ReturnType<typeof getNeroaOneOutcomeLaneDefinition>;
      packetLane: NeroaOneCodexExecutionPacketLaneDefinition;
      reason: string;
    };

function buildRejectedEligibilityResult(reason: string): NeroaOneCodexExecutionPacketEligibilityResult {
  return {
    allowed: false,
    sourceLane: getNeroaOneOutcomeLaneDefinition("ready_to_build"),
    packetLane: neroaOneCodexExecutionPacketLane,
    reason: normalizeText(reason) || "Lane item is not eligible for Codex execution packet drafting."
  };
}

function getRequiredCodexExecutionSourceLaneId(): NeroaOneCodexExecutionPacketSourceLane {
  const eligibleLaneIds = getNeroaOneOutcomeLaneIdsEligibleForCodexExecution();

  if (eligibleLaneIds.length !== 1 || eligibleLaneIds[0] !== "ready_to_build") {
    throw new Error(
      "Outcome lane definitions must expose exactly one Codex execution-eligible lane: ready_to_build."
    );
  }

  return eligibleLaneIds[0];
}

export function validateReadyToBuildLaneItemForCodexExecutionPacket(args: {
  item: NeroaOneOutcomeQueueItem;
}): NeroaOneCodexExecutionPacketEligibilityResult {
  const item = neroaOneOutcomeQueueItemSchema.parse(args.item);
  const requiredSourceLaneId = getRequiredCodexExecutionSourceLaneId();
  const sourceLane = getNeroaOneOutcomeLaneDefinition(requiredSourceLaneId);
  const sourceLaneValidation = validateNeroaOneOutcomeQueueItemForLane({
    laneId: requiredSourceLaneId,
    item
  });

  if (!sourceLaneValidation.allowed) {
    return buildRejectedEligibilityResult(sourceLaneValidation.reason);
  }

  if (!canNeroaOneOutcomeLaneEnterCodexExecution(sourceLane.laneId)) {
    return buildRejectedEligibilityResult(
      `Lane ${sourceLane.laneId} is not marked as execution-eligible.`
    );
  }

  return {
    allowed: true,
    sourceLane,
    packetLane: neroaOneCodexExecutionPacketLane
  };
}

export function validateReadyToBuildQueueEntryForCodexExecutionPacket(args: {
  entry: NeroaOneOutcomeQueueEntry;
}): NeroaOneCodexExecutionPacketEligibilityResult {
  const entry = neroaOneOutcomeQueueEntrySchema.parse(args.entry);
  const requiredSourceLaneId = getRequiredCodexExecutionSourceLaneId();

  if (entry.queue !== requiredSourceLaneId) {
    return buildRejectedEligibilityResult(
      `Queue entry ${entry.queue} cannot create a Codex execution packet draft.`
    );
  }

  return validateReadyToBuildLaneItemForCodexExecutionPacket({
    item: entry.item
  });
}

export function canCreateCodexExecutionPacketFromReadyToBuildLaneItem(args: {
  item: NeroaOneOutcomeQueueItem;
}) {
  return validateReadyToBuildLaneItemForCodexExecutionPacket(args).allowed;
}

export function assertReadyToBuildLaneItemCanCreateCodexExecutionPacket(args: {
  item: NeroaOneOutcomeQueueItem;
}) {
  const validation = validateReadyToBuildLaneItemForCodexExecutionPacket(args);

  if (!validation.allowed) {
    throw new Error(validation.reason);
  }

  return validation;
}

export function createDraftCodexExecutionPacket(args: {
  item: NeroaOneOutcomeQueueItem;
  executionTaskType?: BuildRoomTaskType | null;
  protectedAreas?: readonly string[] | null;
  acceptanceCriteria?: readonly string[] | null;
  testCommands?: readonly string[] | null;
  riskLevel?: BuildRoomRiskLevel | null;
  requiresQc?: boolean | null;
  requiresCustomerCheckpoint?: boolean | null;
  createdAt?: string | null;
  futureDispatchTarget?: Partial<NeroaOneCodexExecutionFutureDispatchTarget> | null;
}): NeroaOneCodexExecutionPacket {
  const item = neroaOneOutcomeQueueItemSchema.parse(args.item);
  assertReadyToBuildLaneItemCanCreateCodexExecutionPacket({
    item
  });
  const executionTaskType =
    args.executionTaskType ?? inferExecutionTaskType(item.normalizedRequest);
  const riskLevel = args.riskLevel ?? item.riskLevel;

  return neroaOneCodexExecutionPacketSchema.parse({
    executionPacketId: buildExecutionPacketId(item),
    workspaceId: item.workspaceId,
    projectId: item.projectId,
    taskId: item.taskId,
    sourceLaneId: getRequiredCodexExecutionSourceLaneId(),
    normalizedRequest: item.normalizedRequest,
    executionTaskType,
    protectedAreas: pickStringListOrFallback(
      args.protectedAreas,
      DEFAULT_NEROA_ONE_CODEX_EXECUTION_PROTECTED_AREAS
    ),
    acceptanceCriteria: normalizeStringList(args.acceptanceCriteria),
    testCommands: normalizeStringList(args.testCommands),
    riskLevel,
    requiresQc: args.requiresQc ?? (executionTaskType === "qa" || riskLevel === "high"),
    requiresCustomerCheckpoint: args.requiresCustomerCheckpoint ?? false,
    promptDraft: buildPromptDraft(),
    createdAt: normalizeText(args.createdAt) || item.createdAt,
    futureDispatchTarget: buildFutureDispatchTarget(args.futureDispatchTarget)
  });
}

export function createDraftCodexExecutionPacketFromQueueEntry(args: {
  entry: NeroaOneOutcomeQueueEntry;
  executionTaskType?: BuildRoomTaskType | null;
  protectedAreas?: readonly string[] | null;
  acceptanceCriteria?: readonly string[] | null;
  testCommands?: readonly string[] | null;
  riskLevel?: BuildRoomRiskLevel | null;
  requiresQc?: boolean | null;
  requiresCustomerCheckpoint?: boolean | null;
  createdAt?: string | null;
  futureDispatchTarget?: Partial<NeroaOneCodexExecutionFutureDispatchTarget> | null;
}) {
  const validation = validateReadyToBuildQueueEntryForCodexExecutionPacket({
    entry: args.entry
  });

  if (!validation.allowed) {
    throw new Error(validation.reason);
  }

  return createDraftCodexExecutionPacket({
    item: args.entry.item,
    executionTaskType: args.executionTaskType,
    protectedAreas: args.protectedAreas,
    acceptanceCriteria: args.acceptanceCriteria,
    testCommands: args.testCommands,
    riskLevel: args.riskLevel,
    requiresQc: args.requiresQc,
    requiresCustomerCheckpoint: args.requiresCustomerCheckpoint,
    createdAt: args.createdAt,
    futureDispatchTarget: args.futureDispatchTarget
  });
}
