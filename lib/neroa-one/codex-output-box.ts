import { z } from "zod";
import {
  neroaOneCodexExecutionPacketLane,
  neroaOneCodexExecutionPacketSchema,
  type NeroaOneCodexExecutionPacket
} from "./codex-execution-packet.ts";

const trimmedStringSchema = z.string().trim().min(1);
const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();
const stringListSchema = z.array(trimmedStringSchema);

export const NEROA_ONE_CODEX_OUTPUT_BOX_STATUSES = [
  "received",
  "pending_review",
  "reviewed",
  "archived",
  "repair_required",
  "customer_followup_required"
] as const;

export const neroaOneCodexOutputStatusSchema = z.enum(NEROA_ONE_CODEX_OUTPUT_BOX_STATUSES);
export type NeroaOneCodexOutputStatus = z.infer<typeof neroaOneCodexOutputStatusSchema>;

export const neroaOneCodexOutputArtifactSchema = z
  .object({
    artifactId: trimmedStringSchema,
    artifactType: trimmedStringSchema,
    title: trimmedStringSchema,
    uri: nullableTrimmedStringSchema.default(null),
    notes: stringListSchema.default([])
  })
  .strict();

export type NeroaOneCodexOutputArtifact = z.infer<typeof neroaOneCodexOutputArtifactSchema>;

export const neroaOneCodexOutputRecordSchema = z
  .object({
    outputId: trimmedStringSchema,
    executionPacketId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    codexRunId: trimmedStringSchema,
    outputStatus: neroaOneCodexOutputStatusSchema,
    summary: trimmedStringSchema,
    filesChanged: stringListSchema,
    testsRun: stringListSchema,
    rawOutput: trimmedStringSchema,
    artifacts: z.array(neroaOneCodexOutputArtifactSchema),
    createdAt: trimmedStringSchema,
    receivedAt: trimmedStringSchema
  })
  .strict();

export type NeroaOneCodexOutputRecord = z.infer<typeof neroaOneCodexOutputRecordSchema>;

export const neroaOneCodexOutputBoxLaneDefinitionSchema = z
  .object({
    laneId: z.literal("codex_output_box"),
    upstreamLaneId: z.literal("codex_execution_packet_draft"),
    backendOnly: z.literal(true),
    extractionReady: z.literal(true),
    receivesRealCodexOutputNow: z.literal(false),
    ownsUiNow: z.literal(false),
    writesPersistenceNow: z.literal(false),
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

export type NeroaOneCodexOutputBoxLaneDefinition = z.infer<
  typeof neroaOneCodexOutputBoxLaneDefinitionSchema
>;

export type NeroaOneCodexOutputBoxPacketValidationResult =
  | {
      allowed: true;
      packetLane: typeof neroaOneCodexExecutionPacketLane;
      outputLane: NeroaOneCodexOutputBoxLaneDefinition;
      executionPacket: NeroaOneCodexExecutionPacket;
    }
  | {
      allowed: false;
      packetLane: typeof neroaOneCodexExecutionPacketLane;
      outputLane: NeroaOneCodexOutputBoxLaneDefinition;
      reason: string;
    };

export interface NeroaOneCodexOutputBoxStorageAdapter {
  saveOutputRecord(record: NeroaOneCodexOutputRecord): Promise<void>;
  getOutputRecordById(outputId: string): Promise<NeroaOneCodexOutputRecord | null>;
}

export const neroaOneCodexOutputBoxLane = neroaOneCodexOutputBoxLaneDefinitionSchema.parse({
  laneId: "codex_output_box",
  upstreamLaneId: "codex_execution_packet_draft",
  backendOnly: true,
  extractionReady: true,
  receivesRealCodexOutputNow: false,
  ownsUiNow: false,
  writesPersistenceNow: false,
  displayPurposeInternal:
    "Defines the backend-only landing contract for Codex outputs before Neroa One review.",
  internalOnlyNotes: [
    "This lane must stay detached from Codex relay wiring until a later approved integration phase.",
    "This lane defines receipt and later review shape only and must not change Build Room behavior or persistence."
  ],
  futureExtractionTarget: {
    serviceName: "neroa-one-codex-output-box",
    queueName: "neroa-one.codex-output-box",
    notes: [
      "Future DigitalOcean services may receive and stage Codex outputs here before review.",
      "Current lane is a typed contract only and does not receive, store, or route live outputs."
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

function buildOutputId(args: {
  executionPacketId: string;
  codexRunId: string;
  receivedAt: string;
}) {
  const timestampPart = normalizeText(args.receivedAt).replace(/[^0-9TZ]/g, "");
  return `${args.executionPacketId}:output:${args.codexRunId}:${timestampPart}`;
}

function buildPlaceholderRawOutput(args: {
  executionPacket: NeroaOneCodexExecutionPacket;
  codexRunId: string;
}) {
  return [
    "CODEX_OUTPUT_NOT_WIRED",
    `executionPacketId=${args.executionPacket.executionPacketId}`,
    `codexRunId=${normalizeText(args.codexRunId)}`
  ].join("\n");
}

function buildRejectedPacketValidationResult(
  reason: string
): NeroaOneCodexOutputBoxPacketValidationResult {
  return {
    allowed: false,
    packetLane: neroaOneCodexExecutionPacketLane,
    outputLane: neroaOneCodexOutputBoxLane,
    reason:
      normalizeText(reason) ||
      "Execution packet is not eligible to create a Codex output box record."
  };
}

export function validateCodexExecutionPacketForOutputBox(args: {
  executionPacket: NeroaOneCodexExecutionPacket;
}): NeroaOneCodexOutputBoxPacketValidationResult {
  if (neroaOneCodexOutputBoxLane.upstreamLaneId !== neroaOneCodexExecutionPacketLane.laneId) {
    throw new Error(
      "Codex output box lane must reference the Codex execution packet lane as its only upstream boundary."
    );
  }

  const executionPacketResult = neroaOneCodexExecutionPacketSchema.safeParse(args.executionPacket);

  if (!executionPacketResult.success) {
    const [issue] = executionPacketResult.error.issues;
    const issuePath =
      issue?.path && issue.path.length > 0 ? issue.path.join(".") : "executionPacket";

    return buildRejectedPacketValidationResult(
      `Execution packet is invalid for the Codex output box boundary at ${issuePath}.`
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
    outputLane: neroaOneCodexOutputBoxLane,
    executionPacket
  };
}

export function createPendingReviewCodexOutputItem(args: {
  executionPacket: NeroaOneCodexExecutionPacket;
  codexRunId: string;
  summary?: string | null;
  filesChanged?: readonly string[] | null;
  testsRun?: readonly string[] | null;
  rawOutput?: string | null;
  artifacts?: readonly NeroaOneCodexOutputArtifact[] | null;
  createdAt?: string | null;
  receivedAt?: string | null;
}): NeroaOneCodexOutputRecord {
  const packetValidation = validateCodexExecutionPacketForOutputBox({
    executionPacket: args.executionPacket
  });

  if (!packetValidation.allowed) {
    throw new Error(packetValidation.reason);
  }

  const executionPacket = packetValidation.executionPacket;
  const codexRunId = normalizeText(args.codexRunId);
  const receivedAt =
    normalizeText(args.receivedAt) || normalizeText(args.createdAt) || executionPacket.createdAt;
  const createdAt = normalizeText(args.createdAt) || receivedAt;

  return neroaOneCodexOutputRecordSchema.parse({
    outputId: buildOutputId({
      executionPacketId: executionPacket.executionPacketId,
      codexRunId,
      receivedAt
    }),
    executionPacketId: executionPacket.executionPacketId,
    workspaceId: executionPacket.workspaceId,
    projectId: executionPacket.projectId,
    taskId: executionPacket.taskId,
    codexRunId,
    outputStatus: "pending_review",
    summary:
      normalizeText(args.summary) ||
      "Codex output received into the backend review box and is pending Neroa One review.",
    filesChanged: normalizeStringList(args.filesChanged),
    testsRun: normalizeStringList(args.testsRun),
    rawOutput:
      normalizeText(args.rawOutput) ||
      buildPlaceholderRawOutput({
        executionPacket,
        codexRunId
      }),
    artifacts: (args.artifacts ?? []).map((artifact) =>
      neroaOneCodexOutputArtifactSchema.parse(artifact)
    ),
    createdAt,
    receivedAt
  });
}
