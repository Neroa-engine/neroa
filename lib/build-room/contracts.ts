import { z } from "zod";

const nonEmptyStringSchema = z.string().trim().min(1);
const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

export const buildRoomTaskTypeSchema = z.enum([
  "implementation",
  "bug_fix",
  "qa",
  "research",
  "operations"
]);
export type BuildRoomTaskType = z.infer<typeof buildRoomTaskTypeSchema>;

export const buildRoomRiskLevelSchema = z.enum(["low", "medium", "high"]);
export type BuildRoomRiskLevel = z.infer<typeof buildRoomRiskLevelSchema>;

export const buildRoomOutputModeSchema = z.enum([
  "plan_only",
  "patch_proposal",
  "implementation_guidance"
]);
export type BuildRoomOutputMode = z.infer<typeof buildRoomOutputModeSchema>;

export const buildRoomTaskStatusSchema = z.enum([
  "draft",
  "queued_for_codex",
  "codex_running",
  "codex_complete",
  "needs_revision",
  "approved_for_worker",
  "worker_running",
  "worker_complete",
  "worker_failed"
]);
export type BuildRoomTaskStatus = z.infer<typeof buildRoomTaskStatusSchema>;

export const buildRoomWorkerRunStatusSchema = z.enum(["idle", "queued", "running", "complete", "failed"]);
export type BuildRoomWorkerRunStatus = z.infer<typeof buildRoomWorkerRunStatusSchema>;

export const buildRoomRunTypeSchema = z.enum(["codex", "worker"]);
export type BuildRoomRunType = z.infer<typeof buildRoomRunTypeSchema>;

export const buildRoomRunStatusSchema = z.enum(["queued", "running", "complete", "failed"]);
export type BuildRoomRunStatus = z.infer<typeof buildRoomRunStatusSchema>;

export const buildRoomMessageRoleSchema = z.enum(["user", "system", "codex", "worker"]);
export type BuildRoomMessageRole = z.infer<typeof buildRoomMessageRoleSchema>;

export const buildRoomArtifactTypeSchema = z.enum([
  "task_packet",
  "codex_result",
  "worker_packet",
  "worker_result",
  "worker_log"
]);
export type BuildRoomArtifactType = z.infer<typeof buildRoomArtifactTypeSchema>;

export const buildRoomRelayModeSchema = z.enum(["real", "mock"]);
export type BuildRoomRelayMode = z.infer<typeof buildRoomRelayModeSchema>;

export const buildRoomSuggestedFileTargetSchema = z.object({
  path: nonEmptyStringSchema,
  reason: nonEmptyStringSchema
});
export type BuildRoomSuggestedFileTarget = z.infer<typeof buildRoomSuggestedFileTargetSchema>;

export const buildRoomLaneContextSchema = z.object({
  slug: nonEmptyStringSchema,
  title: nonEmptyStringSchema,
  description: nullableTrimmedStringSchema.default(null),
  phaseLabel: nullableTrimmedStringSchema.default(null),
  deliverables: z.array(nonEmptyStringSchema).default([]),
  starterPrompts: z.array(nonEmptyStringSchema).default([])
});

export const buildRoomProjectSummarySchema = z.object({
  title: nonEmptyStringSchema,
  templateLabel: nonEmptyStringSchema,
  description: nullableTrimmedStringSchema.default(null),
  buildingSummary: nullableTrimmedStringSchema.default(null),
  audienceSummary: nullableTrimmedStringSchema.default(null),
  primaryGoal: nullableTrimmedStringSchema.default(null),
  activePhaseLabel: nonEmptyStringSchema,
  activePhaseSummary: nullableTrimmedStringSchema.default(null),
  currentFocus: z.array(nonEmptyStringSchema).default([])
});

export const buildRoomRepoContextSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  projectId: nonEmptyStringSchema,
  templateId: nullableTrimmedStringSchema.default(null),
  templateLabel: nonEmptyStringSchema,
  availableLanes: z
    .array(
      z.object({
        slug: nonEmptyStringSchema,
        title: nonEmptyStringSchema,
        description: nullableTrimmedStringSchema.default(null),
        status: nonEmptyStringSchema
      })
    )
    .default([]),
  signals: z.array(nonEmptyStringSchema).default([])
});

export const buildRoomTaskPacketSchema = z.object({
  projectSummary: buildRoomProjectSummarySchema,
  currentLaneContext: buildRoomLaneContextSchema.nullable(),
  userRequest: nonEmptyStringSchema,
  acceptanceCriteria: nullableTrimmedStringSchema.default(null),
  riskLevel: buildRoomRiskLevelSchema,
  constraints: z.array(nonEmptyStringSchema).default([]),
  repoContext: buildRoomRepoContextSchema,
  requestedOutputMode: buildRoomOutputModeSchema
});
export type BuildRoomTaskPacket = z.infer<typeof buildRoomTaskPacketSchema>;

export const buildRoomCodexResultSchema = z.object({
  summary: nonEmptyStringSchema,
  implementationPlan: z.array(nonEmptyStringSchema).default([]),
  suggestedFileTargets: z.array(buildRoomSuggestedFileTargetSchema).default([]),
  patchText: nullableTrimmedStringSchema.default(null),
  warnings: z.array(nonEmptyStringSchema).default([]),
  blockers: z.array(nonEmptyStringSchema).default([]),
  outputMode: buildRoomOutputModeSchema,
  relayMode: buildRoomRelayModeSchema,
  rawText: nullableTrimmedStringSchema.default(null)
});
export type BuildRoomCodexResult = z.infer<typeof buildRoomCodexResultSchema>;

export const buildRoomWorkerJobPacketSchema = z.object({
  taskId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  projectId: nonEmptyStringSchema,
  laneSlug: nullableTrimmedStringSchema.default(null),
  approvedByUserId: nonEmptyStringSchema,
  title: nonEmptyStringSchema,
  taskType: buildRoomTaskTypeSchema,
  riskLevel: buildRoomRiskLevelSchema,
  requestedOutputMode: buildRoomOutputModeSchema,
  userRequest: nonEmptyStringSchema,
  acceptanceCriteria: nullableTrimmedStringSchema.default(null),
  codexSummary: nonEmptyStringSchema,
  implementationPlan: z.array(nonEmptyStringSchema).default([]),
  suggestedFileTargets: z.array(buildRoomSuggestedFileTargetSchema).default([]),
  patchText: nullableTrimmedStringSchema.default(null),
  warnings: z.array(nonEmptyStringSchema).default([]),
  blockers: z.array(nonEmptyStringSchema).default([]),
  constraints: z.array(nonEmptyStringSchema).default([]),
  callback: z
    .object({
      url: nonEmptyStringSchema,
      secretHeaderName: nonEmptyStringSchema,
      secret: nonEmptyStringSchema
    })
    .nullable()
    .default(null)
});
export type BuildRoomWorkerJobPacket = z.infer<typeof buildRoomWorkerJobPacketSchema>;

export const buildRoomTaskInputSchema = z.object({
  workspaceId: z.string().uuid(),
  projectId: nonEmptyStringSchema,
  laneSlug: nullableTrimmedStringSchema.default(null),
  title: nonEmptyStringSchema.max(160),
  taskType: buildRoomTaskTypeSchema,
  requestedOutputMode: buildRoomOutputModeSchema.default("patch_proposal"),
  userRequest: nonEmptyStringSchema.max(6000),
  acceptanceCriteria: nullableTrimmedStringSchema.default(null),
  riskLevel: buildRoomRiskLevelSchema
});
export type BuildRoomTaskInput = z.infer<typeof buildRoomTaskInputSchema>;

export const buildRoomTaskPatchSchema = z
  .object({
    laneSlug: nullableTrimmedStringSchema,
    title: nonEmptyStringSchema.max(160).optional(),
    taskType: buildRoomTaskTypeSchema.optional(),
    requestedOutputMode: buildRoomOutputModeSchema.optional(),
    userRequest: nonEmptyStringSchema.max(6000).optional(),
    acceptanceCriteria: nullableTrimmedStringSchema,
    riskLevel: buildRoomRiskLevelSchema.optional(),
    status: buildRoomTaskStatusSchema.optional(),
    approvedForExecution: z.boolean().optional(),
    workerRunStatus: buildRoomWorkerRunStatusSchema.optional(),
    codexRequestPayload: buildRoomTaskPacketSchema.nullable().optional(),
    codexResponsePayload: buildRoomCodexResultSchema.nullable().optional(),
    revisionNotes: nullableTrimmedStringSchema
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "At least one task field must be updated."
  });
export type BuildRoomTaskPatch = z.infer<typeof buildRoomTaskPatchSchema>;

export const buildRoomWorkerResultAttachSchema = z.object({
  status: z.enum(["running", "complete", "failed"]),
  externalJobId: nullableTrimmedStringSchema.default(null),
  summary: nullableTrimmedStringSchema.default(null),
  logs: z.array(nonEmptyStringSchema).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
  artifactTitle: nullableTrimmedStringSchema.default(null),
  resultPayload: z.record(z.string(), z.unknown()).nullable().default(null),
  textContent: nullableTrimmedStringSchema.default(null)
});
export type BuildRoomWorkerResultAttach = z.infer<typeof buildRoomWorkerResultAttachSchema>;
