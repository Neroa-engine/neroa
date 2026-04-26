import { z } from "zod";
import {
  blockerAnswerModeSchema,
  blockerIdSchema,
  blockerQuestionStateSchema,
  blockerSchemaIdSchema,
  strategyWriteTargetSchema,
  structuredAnswerExtractionStatusSchema
} from "./types.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

export const blockerQueueEntryStatusSchema = z.enum([
  "unresolved",
  "active",
  "partially_resolved",
  "resolved",
  "blocked",
  "deferred"
]);

export type BlockerQueueEntryStatus = z.infer<typeof blockerQueueEntryStatusSchema>;

export const blockerPrioritySchema = z.enum([
  "approval_critical",
  "scope_defining",
  "architecture_shaping",
  "roadmap_tightening",
  "secondary_enrichment",
  "deferred"
]);

export type BlockerPriority = z.infer<typeof blockerPrioritySchema>;

export const blockerQueueSourceLayerSchema = z.enum([
  "project_brief",
  "architecture",
  "roadmap",
  "governance",
  "revision",
  "runtime"
]);

export type BlockerQueueSourceLayer = z.infer<typeof blockerQueueSourceLayerSchema>;

export const runtimeQuestionContextSchema = z
  .object({
    blockerId: blockerIdSchema,
    label: trimmedStringSchema,
    questionText: trimmedStringSchema,
    helperText: trimmedStringSchema,
    sourceLayer: blockerQueueSourceLayerSchema,
    answerMode: blockerAnswerModeSchema,
    expectedShape: trimmedStringSchema,
    examples: stringListSchema,
    allowedSchemaId: blockerSchemaIdSchema,
    allowedWriteTargets: z.array(strategyWriteTargetSchema),
    completionCriteriaSummary: trimmedStringSchema
  })
  .strict();

export type RuntimeQuestionContext = z.infer<typeof runtimeQuestionContextSchema>;

export const blockerQueueEntrySchema = z
  .object({
    blockerId: blockerIdSchema,
    label: trimmedStringSchema,
    inputId: trimmedStringSchema.nullable(),
    status: blockerQueueEntryStatusSchema,
    priority: blockerPrioritySchema,
    sourceLayer: blockerQueueSourceLayerSchema,
    reason: trimmedStringSchema,
    requiredForApproval: z.boolean(),
    requiredForArchitecture: z.boolean(),
    requiredForRoadmap: z.boolean(),
    currentQuestionText: trimmedStringSchema,
    completionCriteriaSummary: trimmedStringSchema,
    unresolvedFields: stringListSchema,
    relatedWriteTargets: z.array(strategyWriteTargetSchema),
    dependsOnBlockerIds: z.array(blockerIdSchema),
    canAskNow: z.boolean(),
    deferReason: trimmedStringSchema.nullable(),
    currentValue: trimmedStringSchema.nullable()
  })
  .strict();

export type BlockerQueueEntry = z.infer<typeof blockerQueueEntrySchema>;

export const blockerQueueSchema = z
  .object({
    entries: z.array(blockerQueueEntrySchema),
    unresolvedCount: z.number().int().min(0),
    approvalCriticalCount: z.number().int().min(0)
  })
  .strict();

export type BlockerQueue = z.infer<typeof blockerQueueSchema>;

export const activeBlockerDecisionSchema = z
  .object({
    blockerId: blockerIdSchema.nullable(),
    reason: trimmedStringSchema,
    sourceLayer: blockerQueueSourceLayerSchema.nullable(),
    priority: blockerPrioritySchema.nullable(),
    questionContext: runtimeQuestionContextSchema.nullable()
  })
  .strict();

export type ActiveBlockerDecision = z.infer<typeof activeBlockerDecisionSchema>;

export const blockerCompletionOutcomeSchema = z.enum([
  "blocker_resolved",
  "blocker_partially_resolved",
  "blocker_needs_clarification",
  "blocker_invalid_retry",
  "blocker_deferred"
]);

export type BlockerCompletionOutcome = z.infer<typeof blockerCompletionOutcomeSchema>;

export const blockerCompletionDecisionSchema = z
  .object({
    blockerId: blockerIdSchema,
    outcome: blockerCompletionOutcomeSchema,
    reason: trimmedStringSchema,
    safePatchAccepted: z.boolean(),
    shouldAdvance: z.boolean(),
    shouldReask: z.boolean(),
    shouldDefer: z.boolean(),
    needsClarification: z.boolean()
  })
  .strict();

export type BlockerCompletionDecision = z.infer<typeof blockerCompletionDecisionSchema>;

export const blockerClarificationPlanSchema = z
  .object({
    blockerId: blockerIdSchema,
    prompt: trimmedStringSchema,
    helperText: trimmedStringSchema,
    reason: trimmedStringSchema,
    examples: stringListSchema,
    basedOnStatus: structuredAnswerExtractionStatusSchema
  })
  .strict();

export type BlockerClarificationPlan = z.infer<typeof blockerClarificationPlanSchema>;

export const nextQuestionPlanSchema = z
  .object({
    blockerId: blockerIdSchema,
    questionText: trimmedStringSchema,
    helperText: trimmedStringSchema,
    reason: trimmedStringSchema,
    sourceLayer: blockerQueueSourceLayerSchema,
    answerMode: blockerAnswerModeSchema,
    expectedShape: trimmedStringSchema,
    examples: stringListSchema,
    clarificationOfBlockerId: blockerIdSchema.nullable()
  })
  .strict();

export type NextQuestionPlan = z.infer<typeof nextQuestionPlanSchema>;

export const blockerProgressSnapshotSchema = z
  .object({
    blockerId: blockerIdSchema,
    previousStatus: blockerQueueEntryStatusSchema.nullable(),
    nextStatus: blockerQueueEntryStatusSchema,
    readinessImpact: trimmedStringSchema,
    blockerCountDelta: z.number().int(),
    approvalCriticalDelta: z.number().int()
  })
  .strict();

export type BlockerProgressSnapshot = z.infer<typeof blockerProgressSnapshotSchema>;

export const blockerTransitionResultSchema = z
  .object({
    blockerId: blockerIdSchema,
    completionDecision: blockerCompletionDecisionSchema,
    clarificationPlan: blockerClarificationPlanSchema.nullable(),
    nextQuestionPlan: nextQuestionPlanSchema.nullable(),
    progressSnapshot: blockerProgressSnapshotSchema,
    appliedPatch: z.boolean()
  })
  .strict();

export type BlockerTransitionResult = z.infer<typeof blockerTransitionResultSchema>;

export const blockerRuntimeStateSchema = z
  .object({
    queue: blockerQueueSchema,
    activeBlockerId: blockerIdSchema.nullable(),
    currentQuestion: trimmedStringSchema.nullable(),
    currentHelperText: trimmedStringSchema.nullable(),
    currentAllowedSchemaId: blockerSchemaIdSchema.nullable(),
    currentAllowedWriteTargets: z.array(strategyWriteTargetSchema),
    currentClarificationState: blockerClarificationPlanSchema.nullable(),
    currentQuestionPlan: nextQuestionPlanSchema.nullable(),
    lastAnsweredBlockerId: blockerIdSchema.nullable(),
    lastTransition: blockerTransitionResultSchema.nullable(),
    readinessImpactSummary: trimmedStringSchema,
    unresolvedCount: z.number().int().min(0),
    approvalCriticalCount: z.number().int().min(0)
  })
  .strict();

export type BlockerRuntimeState = z.infer<typeof blockerRuntimeStateSchema>;

export const strategyPlanningRuntimeSummarySchema = z
  .object({
    headline: trimmedStringSchema,
    activeBlockerLabel: trimmedStringSchema.nullable(),
    activeQuestion: trimmedStringSchema.nullable(),
    unresolvedCount: z.number().int().min(0),
    approvalCriticalCount: z.number().int().min(0),
    currentFocus: trimmedStringSchema,
    statusLabel: trimmedStringSchema
  })
  .strict();

export type StrategyPlanningRuntimeSummary = z.infer<
  typeof strategyPlanningRuntimeSummarySchema
>;

export function loadBlockerRuntimeState(value: unknown) {
  const result = blockerRuntimeStateSchema.safeParse(value);
  return result.success ? result.data : null;
}
