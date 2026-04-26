import { z } from "zod";
import {
  buildRoomOutputModeSchema,
  buildRoomRiskLevelSchema,
  buildRoomTaskTypeSchema
} from "@/lib/build-room/contracts";
import { domainPackIdSchema } from "../domain-contracts.ts";
import {
  deltaAnalysisOutcomeSchema,
  governanceSuggestedSurfaceSchema
} from "../governance/types.ts";

const trimmedStringSchema = z.string().trim().min(1);
const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();
const stringListSchema = z.array(trimmedStringSchema);

export const executionRequestClassSchema = z.enum([
  "execution_oriented",
  "research_oriented",
  "qa_oriented",
  "operations_oriented"
]);

export type ExecutionRequestClass = z.infer<typeof executionRequestClassSchema>;

export const executionPacketStatusSchema = z.enum([
  "pending_execution",
  "ready_for_build_room",
  "released_to_build_room",
  "revision_required",
  "governance_blocked"
]);

export type ExecutionPacketStatus = z.infer<typeof executionPacketStatusSchema>;

export const executionReadinessStatusSchema = z.enum([
  "not_ready",
  "pending_execution",
  "ready_for_build_room",
  "released_to_build_room"
]);

export type ExecutionReadinessStatus = z.infer<
  typeof executionReadinessStatusSchema
>;

export const executionScopeDecisionSchema = z
  .object({
    outcome: deltaAnalysisOutcomeSchema,
    reason: trimmedStringSchema,
    withinApprovedScope: z.boolean(),
    affectedLaneIds: stringListSchema,
    affectedModuleIds: stringListSchema,
    affectedPhaseIds: stringListSchema,
    requiresRoadmapRevision: z.boolean(),
    requiresArchitectureRevision: z.boolean(),
    requiresGovernanceReview: z.boolean(),
    requiresApprovalReset: z.boolean(),
    shouldRemainPendingExecution: z.boolean(),
    suggestedNextSurface: governanceSuggestedSurfaceSchema,
    suggestedNextAction: trimmedStringSchema
  })
  .strict();

export type ExecutionScopeDecision = z.infer<
  typeof executionScopeDecisionSchema
>;

export const executionReadinessSchema = z
  .object({
    status: executionReadinessStatusSchema,
    approvalAllowed: z.boolean(),
    blockers: stringListSchema,
    releaseAllowed: z.boolean(),
    relayAllowed: z.boolean(),
    needsHumanReview: z.boolean(),
    reason: trimmedStringSchema
  })
  .strict();

export type ExecutionReadiness = z.infer<typeof executionReadinessSchema>;

export const packetToBuildRoomMappingSchema = z
  .object({
    buildRoomTaskType: buildRoomTaskTypeSchema,
    taskTitle: trimmedStringSchema,
    taskDescription: trimmedStringSchema,
    acceptanceCriteria: stringListSchema,
    riskLevel: buildRoomRiskLevelSchema,
    requestedOutputMode: buildRoomOutputModeSchema,
    originatingSurface: z.enum(["command_center", "build_room"]),
    packetId: trimmedStringSchema,
    relatedLaneIds: stringListSchema,
    relatedPhaseIds: stringListSchema,
    selectedBuildLaneSlug: nullableTrimmedStringSchema.default(null),
    existingBuildRoomTaskId: nullableTrimmedStringSchema.default(null)
  })
  .strict();

export type PacketToBuildRoomMapping = z.infer<
  typeof packetToBuildRoomMappingSchema
>;

export const executionPacketBuildRoomPayloadSchema = z
  .object({
    existingTaskId: nullableTrimmedStringSchema.default(null),
    laneSlug: nullableTrimmedStringSchema.default(null),
    title: trimmedStringSchema,
    taskType: buildRoomTaskTypeSchema,
    requestedOutputMode: buildRoomOutputModeSchema,
    userRequest: trimmedStringSchema,
    acceptanceCriteria: stringListSchema,
    riskLevel: buildRoomRiskLevelSchema
  })
  .strict();

export type ExecutionPacketBuildRoomPayload = z.infer<
  typeof executionPacketBuildRoomPayloadSchema
>;

export const executionPacketSchema = z
  .object({
    executionPacketId: trimmedStringSchema,
    workspaceId: nullableTrimmedStringSchema.default(null),
    projectId: trimmedStringSchema,
    projectName: nullableTrimmedStringSchema.default(null),
    sourceRequestId: trimmedStringSchema,
    sourceProjectBriefRef: trimmedStringSchema,
    sourceArchitectureBlueprintRef: trimmedStringSchema,
    sourceRoadmapPlanRef: trimmedStringSchema,
    sourceGovernancePolicyRef: trimmedStringSchema,
    sourceApprovalRecordId: nullableTrimmedStringSchema.default(null),
    domainPack: domainPackIdSchema,
    requestSummary: trimmedStringSchema,
    requestClass: executionRequestClassSchema,
    scopeDecision: executionScopeDecisionSchema,
    readiness: executionReadinessSchema,
    laneIds: stringListSchema,
    moduleIds: stringListSchema,
    phaseIds: stringListSchema,
    acceptanceCriteria: stringListSchema,
    riskLevel: buildRoomRiskLevelSchema,
    notInScopeWarnings: stringListSchema,
    workerApprovalRequired: z.boolean(),
    buildRoomTaskPayload: executionPacketBuildRoomPayloadSchema,
    buildRoomMapping: packetToBuildRoomMappingSchema,
    status: executionPacketStatusSchema,
    assumptionsMade: stringListSchema
  })
  .strict();

export type ExecutionPacket = z.infer<typeof executionPacketSchema>;

export const executionPacketSummarySchema = z
  .object({
    packetId: trimmedStringSchema,
    sourceRequestId: trimmedStringSchema,
    buildRoomTaskId: nullableTrimmedStringSchema.default(null),
    pendingExecutionId: nullableTrimmedStringSchema.default(null),
    requestSummary: trimmedStringSchema,
    status: executionPacketStatusSchema,
    scopeOutcome: deltaAnalysisOutcomeSchema,
    readinessStatus: executionReadinessStatusSchema,
    laneIds: stringListSchema,
    moduleIds: stringListSchema,
    phaseIds: stringListSchema,
    approvalState: trimmedStringSchema,
    updatedAt: trimmedStringSchema
  })
  .strict();

export type ExecutionPacketSummary = z.infer<
  typeof executionPacketSummarySchema
>;

export const pendingExecutionStatusSchema = z.enum([
  "pending",
  "released",
  "revision_required",
  "governance_blocked"
]);

export type PendingExecutionStatus = z.infer<
  typeof pendingExecutionStatusSchema
>;

export const pendingExecutionItemSchema = z
  .object({
    pendingExecutionId: trimmedStringSchema,
    commandCenterTaskId: nullableTrimmedStringSchema.default(null),
    buildRoomTaskId: nullableTrimmedStringSchema.default(null),
    title: trimmedStringSchema,
    request: trimmedStringSchema,
    roadmapArea: trimmedStringSchema,
    laneSlug: nullableTrimmedStringSchema.default(null),
    taskType: buildRoomTaskTypeSchema,
    requestedOutputMode: buildRoomOutputModeSchema,
    acceptanceCriteria: stringListSchema,
    riskLevel: buildRoomRiskLevelSchema,
    status: pendingExecutionStatusSchema,
    latestPacketId: nullableTrimmedStringSchema.default(null),
    latestScopeOutcome: deltaAnalysisOutcomeSchema.nullable().default(null),
    latestReason: nullableTrimmedStringSchema.default(null),
    createdAt: trimmedStringSchema,
    updatedAt: trimmedStringSchema
  })
  .strict();

export type PendingExecutionItem = z.infer<typeof pendingExecutionItemSchema>;

export const pendingExecutionReleaseResultSchema = z
  .object({
    pendingExecutionId: trimmedStringSchema,
    packetCreated: z.boolean(),
    executionReady: z.boolean(),
    requestClass: executionRequestClassSchema,
    scopeOutcome: deltaAnalysisOutcomeSchema,
    buildRoomTaskCreated: z.boolean(),
    pendingExecutionReleased: z.boolean(),
    blockers: stringListSchema,
    reason: trimmedStringSchema,
    buildRoomTaskId: nullableTrimmedStringSchema.default(null),
    executionPacketId: nullableTrimmedStringSchema.default(null),
    summary: trimmedStringSchema
  })
  .strict();

export type PendingExecutionReleaseResult = z.infer<
  typeof pendingExecutionReleaseResultSchema
>;

export const executionStateSchema = z
  .object({
    pendingExecutions: z.array(pendingExecutionItemSchema),
    executionPackets: z.array(executionPacketSummarySchema)
  })
  .strict();

export type ExecutionState = z.infer<typeof executionStateSchema>;

export function loadExecutionPacket(value: unknown) {
  const result = executionPacketSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadExecutionPacketSummary(value: unknown) {
  const result = executionPacketSummarySchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadPendingExecutionItem(value: unknown) {
  const result = pendingExecutionItemSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadExecutionState(value: unknown) {
  const result = executionStateSchema.safeParse(value);
  return result.success ? result.data : null;
}
