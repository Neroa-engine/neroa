import { z } from "zod";
import { domainPackIdSchema, projectBriefQuestionStageSchema } from "../domain-contracts.ts";
import {
  architectureInputIdSchema,
  architectureRiskSeveritySchema
} from "../architecture/types.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

export const roadmapStatusSchema = z.enum([
  "draft",
  "review_ready",
  "approval_ready"
]);

export type RoadmapStatus = z.infer<typeof roadmapStatusSchema>;

export const notInScopeReasonSchema = z.enum([
  "mvp_boundary",
  "scope_decision",
  "dependency",
  "later_phase"
]);

export type NotInScopeReason = z.infer<typeof notInScopeReasonSchema>;

export const acceptanceCriterionSchema = z
  .object({
    id: trimmedStringSchema,
    label: trimmedStringSchema,
    description: trimmedStringSchema,
    moduleIds: stringListSchema,
    laneIds: stringListSchema
  })
  .strict();

export type AcceptanceCriterion = z.infer<typeof acceptanceCriterionSchema>;

export const notInScopeItemSchema = z
  .object({
    id: trimmedStringSchema,
    label: trimmedStringSchema,
    reason: trimmedStringSchema,
    deferredBecause: notInScopeReasonSchema
  })
  .strict();

export type NotInScopeItem = z.infer<typeof notInScopeItemSchema>;

export const roadmapPhaseSchema = z
  .object({
    phaseId: trimmedStringSchema,
    name: trimmedStringSchema,
    goal: trimmedStringSchema,
    deliverables: stringListSchema,
    moduleIds: stringListSchema,
    laneIds: stringListSchema,
    prerequisites: stringListSchema,
    dependsOnPhaseIds: stringListSchema,
    acceptanceCriteria: z.array(acceptanceCriterionSchema),
    notInScope: z.array(notInScopeItemSchema),
    riskNotes: stringListSchema,
    worktreeHints: stringListSchema,
    targetOutcome: trimmedStringSchema
  })
  .strict();

export type RoadmapPhase = z.infer<typeof roadmapPhaseSchema>;

export const criticalPathStepSchema = z
  .object({
    id: trimmedStringSchema,
    label: trimmedStringSchema,
    phaseId: trimmedStringSchema,
    dependsOn: stringListSchema,
    reason: trimmedStringSchema
  })
  .strict();

export type CriticalPathStep = z.infer<typeof criticalPathStepSchema>;

export const roadmapRiskSchema = z
  .object({
    id: trimmedStringSchema,
    title: trimmedStringSchema,
    severity: architectureRiskSeveritySchema,
    area: trimmedStringSchema,
    description: trimmedStringSchema,
    mitigation: trimmedStringSchema,
    relatedPhaseIds: stringListSchema,
    relatedModuleIds: stringListSchema
  })
  .strict();

export type RoadmapRisk = z.infer<typeof roadmapRiskSchema>;

export const roadmapOpenQuestionSchema = z
  .object({
    id: trimmedStringSchema,
    inputId: architectureInputIdSchema,
    label: trimmedStringSchema,
    question: trimmedStringSchema,
    stage: projectBriefQuestionStageSchema,
    whyItMatters: trimmedStringSchema,
    relatedPhaseIds: stringListSchema,
    blockingLevel: z.enum(["low", "medium", "high"])
  })
  .strict();

export type RoadmapOpenQuestion = z.infer<typeof roadmapOpenQuestionSchema>;

export const roadmapAssumptionSchema = z
  .object({
    id: trimmedStringSchema,
    statement: trimmedStringSchema,
    affectsPhaseIds: stringListSchema
  })
  .strict();

export type RoadmapAssumption = z.infer<typeof roadmapAssumptionSchema>;

export const mvpDefinitionSchema = z
  .object({
    summary: trimmedStringSchema,
    targetPersonas: stringListSchema,
    mustHaveFeatures: stringListSchema,
    includedPhaseIds: stringListSchema,
    includedModuleIds: stringListSchema,
    includedLaneIds: stringListSchema,
    includedSurfaces: stringListSchema,
    deferredItems: stringListSchema
  })
  .strict();

export type MvpDefinition = z.infer<typeof mvpDefinitionSchema>;

export const roadmapApprovalReadinessSchema = z
  .object({
    status: roadmapStatusSchema,
    readyForStrategyReview: z.boolean(),
    readyForApproval: z.boolean()
  })
  .strict();

export type RoadmapApprovalReadiness = z.infer<typeof roadmapApprovalReadinessSchema>;

export const roadmapPlanSchema = z
  .object({
    roadmapId: trimmedStringSchema,
    workspaceId: trimmedStringSchema.nullable(),
    projectId: trimmedStringSchema,
    projectName: trimmedStringSchema.nullable(),
    sourceProjectBriefRef: trimmedStringSchema,
    sourceArchitectureBlueprintRef: trimmedStringSchema,
    domainPack: domainPackIdSchema,
    status: roadmapStatusSchema,
    approvalReadiness: roadmapApprovalReadinessSchema,
    mvpDefinition: mvpDefinitionSchema,
    phases: z.array(roadmapPhaseSchema),
    criticalPath: z.array(criticalPathStepSchema),
    sequencingNotes: stringListSchema,
    roadmapRisks: z.array(roadmapRiskSchema),
    openQuestions: z.array(roadmapOpenQuestionSchema),
    readinessScore: z.number().int().min(0).max(100),
    missingCriticalScopeInputs: z.array(architectureInputIdSchema),
    assumptionsMade: z.array(roadmapAssumptionSchema)
  })
  .strict();

export type RoadmapPlan = z.infer<typeof roadmapPlanSchema>;

export function loadRoadmapPlan(value: unknown) {
  const result = roadmapPlanSchema.safeParse(value);
  return result.success ? result.data : null;
}
