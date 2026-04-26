import { z } from "zod";
import {
  buildRoomRiskLevelSchema,
  buildRoomTaskTypeSchema
} from "@/lib/build-room/contracts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);
const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

export const artifactRequirementKindSchema = z.enum([
  "execution_result",
  "surface_evidence",
  "connector_evidence",
  "logic_review_evidence",
  "permissions_evidence",
  "rollback_plan",
  "review_evidence"
]);

export type ArtifactRequirementKind = z.infer<
  typeof artifactRequirementKindSchema
>;

export const acceptanceArtifactKindSchema = z.enum([
  "task_packet",
  "codex_result",
  "worker_packet",
  "worker_result",
  "worker_log",
  "execution_result",
  "surface_evidence",
  "connector_evidence",
  "logic_review_evidence",
  "permissions_evidence",
  "rollback_plan",
  "review_evidence"
]);

export type AcceptanceArtifactKind = z.infer<
  typeof acceptanceArtifactKindSchema
>;

export const acceptanceArtifactStatusSchema = z.enum([
  "available",
  "accepted",
  "warning"
]);

export type AcceptanceArtifactStatus = z.infer<
  typeof acceptanceArtifactStatusSchema
>;

export const acceptanceCriterionStatusSchema = z.enum([
  "pending",
  "satisfied",
  "failed",
  "blocked"
]);

export type AcceptanceCriterionStatus = z.infer<
  typeof acceptanceCriterionStatusSchema
>;

export const qaReviewStatusSchema = z.enum([
  "not_requested",
  "pending_human_review",
  "approved",
  "rejected"
]);

export type QAReviewStatus = z.infer<typeof qaReviewStatusSchema>;

export const completionReadinessStatusSchema = z.enum([
  "not_ready",
  "awaiting_run_completion",
  "awaiting_artifacts",
  "awaiting_review",
  "remediation_required",
  "release_ready",
  "failed"
]);

export type CompletionReadinessStatus = z.infer<
  typeof completionReadinessStatusSchema
>;

export const releaseDecisionStatusSchema = z.enum([
  "blocked",
  "awaiting_artifacts",
  "awaiting_review",
  "remediation_required",
  "release_ready"
]);

export type ReleaseDecisionStatus = z.infer<
  typeof releaseDecisionStatusSchema
>;

export const qaValidationStatusSchema = completionReadinessStatusSchema;

export type QAValidationStatus = z.infer<typeof qaValidationStatusSchema>;

export const artifactRequirementSchema = z
  .object({
    id: trimmedStringSchema,
    kind: artifactRequirementKindSchema,
    label: trimmedStringSchema,
    required: z.boolean(),
    reason: trimmedStringSchema,
    relatedPhaseIds: stringListSchema,
    relatedLaneIds: stringListSchema,
    relatedModuleIds: stringListSchema,
    requiredForRiskLevels: z.array(buildRoomRiskLevelSchema),
    requiredForTaskTypes: z.array(buildRoomTaskTypeSchema)
  })
  .strict();

export type ArtifactRequirement = z.infer<typeof artifactRequirementSchema>;

export const acceptanceArtifactSchema = z
  .object({
    artifactId: trimmedStringSchema,
    kind: acceptanceArtifactKindSchema,
    label: trimmedStringSchema,
    source: trimmedStringSchema,
    reference: trimmedStringSchema,
    status: acceptanceArtifactStatusSchema,
    notes: nullableTrimmedStringSchema.default(null),
    generatedAt: nullableTrimmedStringSchema.default(null),
    generatedBy: nullableTrimmedStringSchema.default(null)
  })
  .strict();

export type AcceptanceArtifact = z.infer<typeof acceptanceArtifactSchema>;

export const acceptanceCriterionResultSchema = z
  .object({
    criterionId: trimmedStringSchema,
    label: trimmedStringSchema,
    status: acceptanceCriterionStatusSchema,
    evidenceArtifactIds: stringListSchema,
    reason: trimmedStringSchema,
    relatedPhaseId: nullableTrimmedStringSchema.default(null),
    relatedLaneIds: stringListSchema
  })
  .strict();

export type AcceptanceCriterionResult = z.infer<
  typeof acceptanceCriterionResultSchema
>;

export const qaReviewRecordSchema = z
  .object({
    reviewRecordId: trimmedStringSchema,
    sourceExecutionPacketId: trimmedStringSchema,
    sourceTaskId: trimmedStringSchema,
    sourceRunId: nullableTrimmedStringSchema.default(null),
    reviewKind: z.enum(["automated", "human_required", "human_recorded"]),
    status: qaReviewStatusSchema,
    reviewer: nullableTrimmedStringSchema.default(null),
    notes: nullableTrimmedStringSchema.default(null),
    evidenceArtifactIds: stringListSchema,
    createdAt: nullableTrimmedStringSchema.default(null),
    updatedAt: nullableTrimmedStringSchema.default(null)
  })
  .strict();

export type QAReviewRecord = z.infer<typeof qaReviewRecordSchema>;

export const remediationRequirementSchema = z
  .object({
    id: trimmedStringSchema,
    label: trimmedStringSchema,
    reason: trimmedStringSchema,
    relatedCriterionIds: stringListSchema,
    relatedArtifactRequirementIds: stringListSchema,
    nextAction: trimmedStringSchema
  })
  .strict();

export type RemediationRequirement = z.infer<
  typeof remediationRequirementSchema
>;

export const completionReadinessSchema = z
  .object({
    status: completionReadinessStatusSchema,
    runFinished: z.boolean(),
    artifactsSatisfied: z.boolean(),
    acceptanceSatisfied: z.boolean(),
    governanceQASatisfied: z.boolean(),
    releaseReady: z.boolean(),
    blockers: stringListSchema,
    reason: trimmedStringSchema
  })
  .strict();

export type CompletionReadiness = z.infer<typeof completionReadinessSchema>;

export const releaseDecisionSchema = z
  .object({
    status: releaseDecisionStatusSchema,
    canPresentAsComplete: z.boolean(),
    canMarkReleaseReady: z.boolean(),
    requiresRemediation: z.boolean(),
    requiresHumanReview: z.boolean(),
    blockerIds: stringListSchema,
    nextAction: trimmedStringSchema,
    nextSurface: z.enum(["command_center", "build_room", "strategy_room"])
  })
  .strict();

export type ReleaseDecision = z.infer<typeof releaseDecisionSchema>;

export const qaValidationResultSchema = z
  .object({
    qaValidationId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    sourceExecutionPacketId: trimmedStringSchema,
    sourceGovernancePolicyId: trimmedStringSchema,
    sourceRoadmapPlanId: trimmedStringSchema,
    sourceTaskId: nullableTrimmedStringSchema.default(null),
    sourceRunId: nullableTrimmedStringSchema.default(null),
    artifactRequirements: z.array(artifactRequirementSchema),
    artifacts: z.array(acceptanceArtifactSchema),
    criterionResults: z.array(acceptanceCriterionResultSchema),
    blockers: stringListSchema,
    warnings: stringListSchema,
    status: qaValidationStatusSchema,
    needsHumanReview: z.boolean(),
    completionReadiness: completionReadinessSchema,
    releaseDecision: releaseDecisionSchema,
    reviewRecord: qaReviewRecordSchema.nullable(),
    remediationRequirements: z.array(remediationRequirementSchema),
    assumptionsMade: stringListSchema
  })
  .strict();

export type QAValidationResult = z.infer<typeof qaValidationResultSchema>;

export const qaValidationSummarySchema = z
  .object({
    validationId: trimmedStringSchema,
    status: qaValidationStatusSchema,
    headline: trimmedStringSchema,
    completionLabel: trimmedStringSchema,
    releaseLabel: trimmedStringSchema,
    blockerLabels: stringListSchema,
    warningLabels: stringListSchema,
    needsHumanReview: z.boolean(),
    canPresentAsComplete: z.boolean(),
    artifactProgressLabel: trimmedStringSchema,
    criterionProgressLabel: trimmedStringSchema
  })
  .strict();

export type QAValidationSummary = z.infer<typeof qaValidationSummarySchema>;

export function loadQAValidationResult(value: unknown) {
  const result = qaValidationResultSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadQAReviewRecord(value: unknown) {
  const result = qaReviewRecordSchema.safeParse(value);
  return result.success ? result.data : null;
}
