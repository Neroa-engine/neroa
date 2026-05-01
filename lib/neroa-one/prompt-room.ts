import { z } from "zod";
import {
  neroaOneCodexExecutionPacketLane,
  neroaOneCodexExecutionPacketSchema,
  neroaOneCodexExecutionPacketSourceLaneSchema,
  type NeroaOneCodexExecutionPacket
} from "./codex-execution-packet.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);
const CODE_EXECUTION_WORKER_INFRASTRUCTURE_MARKERS = [
  "code-execution-worker",
  "codex_cli",
  "codex_cloud",
  "claude_code",
  "manual_operator",
  "future_engine"
] as const;

export const NEROA_ONE_PROMPT_ROOM_STATUSES = [
  "draft_pending",
  "draft_ready",
  "validation_failed",
  "ready_for_code_builder",
  "canceled"
] as const;

export const NEROA_ONE_PROMPT_ROOM_CUSTOMER_SAFE_STATUSES = [
  "preparing_build_task",
  "build_queued",
  "build_blocked",
  "build_canceled"
] as const;

export const neroaOnePromptRoomStatusSchema = z.enum(NEROA_ONE_PROMPT_ROOM_STATUSES);
export const neroaOnePromptRoomCustomerSafeStatusSchema = z.enum(
  NEROA_ONE_PROMPT_ROOM_CUSTOMER_SAFE_STATUSES
);

export type NeroaOnePromptRoomStatus = z.infer<typeof neroaOnePromptRoomStatusSchema>;
export type NeroaOnePromptRoomCustomerSafeStatus = z.infer<
  typeof neroaOnePromptRoomCustomerSafeStatusSchema
>;

export const neroaOnePromptRoomInternalPromptDraftSchema = z
  .object({
    status: z.literal("placeholder_only"),
    promptText: z.literal("PROMPT_ROOM_DRAFT_DEFERRED"),
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOnePromptRoomInternalPromptDraft = z.infer<
  typeof neroaOnePromptRoomInternalPromptDraftSchema
>;

export const neroaOnePromptRoomFuturePromptServiceTargetSchema = z
  .object({
    deploymentProvider: z.literal("digitalocean"),
    serviceName: trimmedStringSchema,
    queueName: trimmedStringSchema,
    serviceType: z.literal("future_prompt_room_service"),
    readyForDrafting: z.literal(false),
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOnePromptRoomFuturePromptServiceTarget = z.infer<
  typeof neroaOnePromptRoomFuturePromptServiceTargetSchema
>;

export const neroaOnePromptRoomItemSchema = z
  .object({
    promptRoomItemId: trimmedStringSchema,
    executionPacketId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    sourceLaneId: neroaOneCodexExecutionPacketSourceLaneSchema,
    normalizedRequest: trimmedStringSchema,
    internalPromptDraft: neroaOnePromptRoomInternalPromptDraftSchema,
    customerSafeStatus: neroaOnePromptRoomCustomerSafeStatusSchema,
    protectedAreas: stringListSchema,
    acceptanceCriteria: stringListSchema,
    testCommands: stringListSchema,
    riskLevel: z.enum(["low", "medium", "high"]),
    status: neroaOnePromptRoomStatusSchema,
    createdAt: trimmedStringSchema,
    futurePromptServiceTarget: neroaOnePromptRoomFuturePromptServiceTargetSchema
  })
  .strict();

export type NeroaOnePromptRoomItem = z.infer<typeof neroaOnePromptRoomItemSchema>;

export const neroaOnePromptRoomLaneDefinitionSchema = z
  .object({
    laneId: z.literal("prompt_room"),
    upstreamLaneId: z.literal("codex_execution_packet_draft"),
    backendOnly: z.literal(true),
    internalOnly: z.literal(true),
    extractionReady: z.literal(true),
    independentlyReplaceable: z.literal(true),
    exposesCustomerSafeStatusOnly: z.literal(true),
    selectsExecutionEngineNow: z.literal(false),
    selectsRuntimeWorkerInfrastructureNow: z.literal(false),
    ownsUiNow: z.literal(false),
    callsAiNow: z.literal(false),
    storesPromptDraftsNow: z.literal(false),
    writesPersistenceNow: z.literal(false),
    allowedStatuses: z.tuple([
      z.literal("draft_pending"),
      z.literal("draft_ready"),
      z.literal("validation_failed"),
      z.literal("ready_for_code_builder"),
      z.literal("canceled")
    ]),
    allowedCustomerSafeStatuses: z.tuple([
      z.literal("preparing_build_task"),
      z.literal("build_queued"),
      z.literal("build_blocked"),
      z.literal("build_canceled")
    ]),
    displayPurposeInternal: trimmedStringSchema,
    internalOnlyNotes: stringListSchema.min(1),
    futurePromptServiceTarget: z
      .object({
        serviceName: trimmedStringSchema,
        queueName: trimmedStringSchema,
        notes: stringListSchema.min(1)
      })
      .strict()
  })
  .strict();

export type NeroaOnePromptRoomLaneDefinition = z.infer<
  typeof neroaOnePromptRoomLaneDefinitionSchema
>;

export type NeroaOnePromptRoomPacketValidationResult =
  | {
      allowed: true;
      packetLane: typeof neroaOneCodexExecutionPacketLane;
      promptLane: NeroaOnePromptRoomLaneDefinition;
      executionPacket: NeroaOneCodexExecutionPacket;
    }
  | {
      allowed: false;
      packetLane: typeof neroaOneCodexExecutionPacketLane;
      promptLane: NeroaOnePromptRoomLaneDefinition;
      reason: string;
    };

export const neroaOnePromptRoomCustomerSafeStatusViewSchema = z
  .object({
    promptRoomItemId: trimmedStringSchema,
    executionPacketId: trimmedStringSchema,
    customerSafeStatus: neroaOnePromptRoomCustomerSafeStatusSchema
  })
  .strict();

export type NeroaOnePromptRoomCustomerSafeStatusView = z.infer<
  typeof neroaOnePromptRoomCustomerSafeStatusViewSchema
>;

export interface NeroaOnePromptRoomStorageAdapter {
  savePromptRoomItem(item: NeroaOnePromptRoomItem): Promise<void>;
  getPromptRoomItemById(promptRoomItemId: string): Promise<NeroaOnePromptRoomItem | null>;
}

export const neroaOnePromptRoomLane = neroaOnePromptRoomLaneDefinitionSchema.parse({
  laneId: "prompt_room",
  upstreamLaneId: "codex_execution_packet_draft",
  backendOnly: true,
  internalOnly: true,
  extractionReady: true,
  independentlyReplaceable: true,
  exposesCustomerSafeStatusOnly: true,
  selectsExecutionEngineNow: false,
  selectsRuntimeWorkerInfrastructureNow: false,
  ownsUiNow: false,
  callsAiNow: false,
  storesPromptDraftsNow: false,
  writesPersistenceNow: false,
  allowedStatuses: [
    "draft_pending",
    "draft_ready",
    "validation_failed",
    "ready_for_code_builder",
    "canceled"
  ],
  allowedCustomerSafeStatuses: [
    "preparing_build_task",
    "build_queued",
    "build_blocked",
    "build_canceled"
  ],
  displayPurposeInternal:
    "Defines the backend-only Prompt Room lane that turns valid execution packets into internal prompt-draft work items before later code-builder routing.",
  internalOnlyNotes: [
    "Prompt Room is internal-only and must never expose internal prompt text, model routing, protected file details, or raw execution instructions to customer-facing helpers.",
    "This lane is contract-only and must not call AI, wire Command Center or Build Room, store prompt drafts, or change runtime behavior."
  ],
  futurePromptServiceTarget: {
    serviceName: "neroa-one-prompt-room-service",
    queueName: "neroa-one.prompt-room",
    notes: [
      "Future DigitalOcean prompt services may consume Prompt Room items after explicit backend extraction is approved.",
      "Current lane remains modular-monolith infrastructure only and does not draft live prompts or call model logic."
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

function queueNameSelectsRuntimeWorkerInfrastructure(queueName: string) {
  const normalizedQueueName = normalizeText(queueName).toLowerCase();

  return CODE_EXECUTION_WORKER_INFRASTRUCTURE_MARKERS.some((marker) =>
    normalizedQueueName.includes(marker.toLowerCase())
  );
}

function buildRejectedPacketValidationResult(
  reason: string
): NeroaOnePromptRoomPacketValidationResult {
  return {
    allowed: false,
    packetLane: neroaOneCodexExecutionPacketLane,
    promptLane: neroaOnePromptRoomLane,
    reason:
      normalizeText(reason) || "Execution packet is not eligible for the Prompt Room boundary."
  };
}

function mapPromptRoomStatusToCustomerSafeStatus(
  status: NeroaOnePromptRoomStatus
): NeroaOnePromptRoomCustomerSafeStatus {
  switch (status) {
    case "draft_pending":
    case "draft_ready":
      return "preparing_build_task";
    case "validation_failed":
      return "build_blocked";
    case "ready_for_code_builder":
      return "build_queued";
    case "canceled":
      return "build_canceled";
  }
}

function buildInternalPromptDraft(): NeroaOnePromptRoomInternalPromptDraft {
  return neroaOnePromptRoomInternalPromptDraftSchema.parse({
    status: "placeholder_only",
    promptText: "PROMPT_ROOM_DRAFT_DEFERRED",
    notes: [
      "Prompt Room draft generation is intentionally deferred until a future approved prompt builder service exists.",
      "This internal draft must remain hidden from customer-safe status helpers."
    ]
  });
}

function buildFuturePromptServiceTarget(
  override: Partial<NeroaOnePromptRoomFuturePromptServiceTarget> | null | undefined
): NeroaOnePromptRoomFuturePromptServiceTarget {
  const normalizedNotes = normalizeStringList(override?.notes);
  const queueName = normalizeText(override?.queueName) || "neroa-one.prompt-room";

  if (queueNameSelectsRuntimeWorkerInfrastructure(queueName)) {
    throw new Error(
      `Prompt Room queue ${queueName} cannot select code execution worker infrastructure.`
    );
  }

  return neroaOnePromptRoomFuturePromptServiceTargetSchema.parse({
    deploymentProvider: "digitalocean",
    serviceName:
      normalizeText(override?.serviceName) || "neroa-one-prompt-room-service",
    queueName,
    serviceType: "future_prompt_room_service",
    readyForDrafting: false,
    notes:
      normalizedNotes.length > 0
        ? normalizedNotes
        : [
            "Future DigitalOcean prompt services may draft internal prompts here after explicit backend extraction is approved.",
            "Current Prompt Room items are typed placeholders only and must not call model logic."
          ]
  });
}

function buildPromptRoomItemId(args: { executionPacketId: string; createdAt: string }) {
  const timestampPart = normalizeText(args.createdAt).replace(/[^0-9TZ]/g, "");
  return `${args.executionPacketId}:prompt-room:${timestampPart}`;
}

export function validateCodexExecutionPacketForPromptRoom(args: {
  executionPacket: NeroaOneCodexExecutionPacket;
}): NeroaOnePromptRoomPacketValidationResult {
  if (neroaOnePromptRoomLane.upstreamLaneId !== neroaOneCodexExecutionPacketLane.laneId) {
    throw new Error(
      "Prompt Room lane must reference the Codex execution packet lane as its current upstream boundary."
    );
  }

  const executionPacketResult = neroaOneCodexExecutionPacketSchema.safeParse(args.executionPacket);

  if (!executionPacketResult.success) {
    const [issue] = executionPacketResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "executionPacket";

    return buildRejectedPacketValidationResult(
      `Execution packet is invalid for the Prompt Room boundary at ${issuePath}.`
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
    promptLane: neroaOnePromptRoomLane,
    executionPacket
  };
}

export function canCreatePromptRoomItemFromCodexExecutionPacket(args: {
  executionPacket: NeroaOneCodexExecutionPacket;
}) {
  return validateCodexExecutionPacketForPromptRoom(args).allowed;
}

export function createDraftPromptRoomItemFromCodexExecutionPacket(args: {
  executionPacket: NeroaOneCodexExecutionPacket;
  status?: NeroaOnePromptRoomStatus | null;
  createdAt?: string | null;
  futurePromptServiceTarget?: Partial<NeroaOnePromptRoomFuturePromptServiceTarget> | null;
}): NeroaOnePromptRoomItem {
  const packetValidation = validateCodexExecutionPacketForPromptRoom({
    executionPacket: args.executionPacket
  });

  if (!packetValidation.allowed) {
    throw new Error(packetValidation.reason);
  }

  const executionPacket = packetValidation.executionPacket;
  const status = neroaOnePromptRoomStatusSchema.parse(args.status ?? "draft_pending");
  const createdAt = normalizeText(args.createdAt) || executionPacket.createdAt;

  return neroaOnePromptRoomItemSchema.parse({
    promptRoomItemId: buildPromptRoomItemId({
      executionPacketId: executionPacket.executionPacketId,
      createdAt
    }),
    executionPacketId: executionPacket.executionPacketId,
    workspaceId: executionPacket.workspaceId,
    projectId: executionPacket.projectId,
    taskId: executionPacket.taskId,
    sourceLaneId: executionPacket.sourceLaneId,
    normalizedRequest: executionPacket.normalizedRequest,
    internalPromptDraft: buildInternalPromptDraft(),
    customerSafeStatus: mapPromptRoomStatusToCustomerSafeStatus(status),
    protectedAreas: normalizeStringList(executionPacket.protectedAreas),
    acceptanceCriteria: normalizeStringList(executionPacket.acceptanceCriteria),
    testCommands: normalizeStringList(executionPacket.testCommands),
    riskLevel: executionPacket.riskLevel,
    status,
    createdAt,
    futurePromptServiceTarget: buildFuturePromptServiceTarget(args.futurePromptServiceTarget)
  });
}

export function getPromptRoomCustomerSafeStatus(args: {
  item: NeroaOnePromptRoomItem;
}): NeroaOnePromptRoomCustomerSafeStatusView {
  const item = neroaOnePromptRoomItemSchema.parse(args.item);

  return neroaOnePromptRoomCustomerSafeStatusViewSchema.parse({
    promptRoomItemId: item.promptRoomItemId,
    executionPacketId: item.executionPacketId,
    customerSafeStatus: item.customerSafeStatus
  });
}

export function getPromptRoomStatuses() {
  return [...neroaOnePromptRoomLane.allowedStatuses];
}

export function getPromptRoomCustomerSafeStatuses() {
  return [...neroaOnePromptRoomLane.allowedCustomerSafeStatuses];
}
