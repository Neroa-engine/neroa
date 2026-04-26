import { z } from "zod";
import { domainPackIdSchema } from "../domain-contracts.ts";
import {
  architectureInputIdSchema,
  architectureRiskSeveritySchema,
  mergePolicySchema
} from "../architecture/types.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

export const approvalChecklistItemStatusSchema = z.enum([
  "satisfied",
  "open",
  "blocked"
]);

export type ApprovalChecklistItemStatus = z.infer<
  typeof approvalChecklistItemStatusSchema
>;

export const approvalChecklistBlockerLevelSchema = z.enum([
  "watch",
  "important",
  "blocking"
]);

export type ApprovalChecklistBlockerLevel = z.infer<
  typeof approvalChecklistBlockerLevelSchema
>;

export const governanceChecklistScopeAreaSchema = z.enum([
  "product_scope",
  "roadmap",
  "integrations",
  "compliance",
  "execution_logic",
  "build_handoff",
  "unknown"
]);

export type GovernanceChecklistScopeArea = z.infer<
  typeof governanceChecklistScopeAreaSchema
>;

export const approvalReadinessStatusSchema = z.enum([
  "not_ready",
  "review_ready",
  "approval_ready"
]);

export type ApprovalReadinessStatus = z.infer<
  typeof approvalReadinessStatusSchema
>;

export const scopeApprovalStatusSchema = z.enum([
  "draft",
  "pending_approval",
  "approved",
  "superseded",
  "rejected"
]);

export type ScopeApprovalStatus = z.infer<typeof scopeApprovalStatusSchema>;

export const roadmapRevisionStatusSchema = z.enum([
  "draft",
  "pending_review",
  "accepted",
  "resolved",
  "superseded"
]);

export type RoadmapRevisionStatus = z.infer<
  typeof roadmapRevisionStatusSchema
>;

export const deltaRequestClassSchema = z.enum([
  "within_approved_scope",
  "pre_approval_request",
  "scope_expansion",
  "architecture_expansion",
  "governance_conflict"
]);

export type DeltaRequestClass = z.infer<typeof deltaRequestClassSchema>;

export const deltaAnalysisOutcomeSchema = z.enum([
  "execution_ready_after_gate",
  "pending_execution",
  "roadmap_revision_required",
  "architecture_revision_required",
  "governance_blocked"
]);

export type DeltaAnalysisOutcome = z.infer<
  typeof deltaAnalysisOutcomeSchema
>;

export const governanceSuggestedSurfaceSchema = z.enum([
  "command_center",
  "strategy_room",
  "build_room"
]);

export type GovernanceSuggestedSurface = z.infer<
  typeof governanceSuggestedSurfaceSchema
>;

export const approvalChecklistItemSchema = z
  .object({
    id: trimmedStringSchema,
    label: trimmedStringSchema,
    status: approvalChecklistItemStatusSchema,
    blockerLevel: approvalChecklistBlockerLevelSchema,
    reason: trimmedStringSchema,
    relatedScopeArea: governanceChecklistScopeAreaSchema,
    relatedPhaseId: trimmedStringSchema.nullable(),
    relatedInputId: architectureInputIdSchema.nullable()
  })
  .strict();

export type ApprovalChecklistItem = z.infer<
  typeof approvalChecklistItemSchema
>;

export const approvalReadinessSchema = z
  .object({
    status: approvalReadinessStatusSchema,
    blockers: stringListSchema,
    satisfiedChecklistItemIds: stringListSchema,
    unresolvedChecklistItemIds: stringListSchema,
    readinessScore: z.number().int().min(0).max(100),
    reviewReady: z.boolean(),
    approvalAllowed: z.boolean()
  })
  .strict();

export type ApprovalReadiness = z.infer<typeof approvalReadinessSchema>;

export const hardGuardsSchema = z
  .object({
    noExecutionBeforeApproval: z.boolean(),
    noSilentScopeExpansion: z.boolean(),
    noArchitectureExpansionWithoutRefresh: z.boolean(),
    blockedRequestsStayPendingExecution: z.boolean(),
    strategyRoomApprovalAuthorityRequired: z.boolean(),
    approvalAuthoritySurface: z.literal("strategy_room"),
    notes: stringListSchema
  })
  .strict();

export type HardGuards = z.infer<typeof hardGuardsSchema>;

export const billingProtectionSchema = z
  .object({
    nonBillableFailureClasses: stringListSchema,
    maxSystemRetriesPerStep: z.number().int().min(0).max(10),
    architectureApprovalRequiredBeforeExecution: z.boolean(),
    deltaAnalysisRequiredForScopeChange: z.boolean(),
    systemFailuresDoNotAdvanceBilling: z.boolean(),
    plannerLoopProtection: z.boolean()
  })
  .strict();

export type BillingProtection = z.infer<typeof billingProtectionSchema>;

export const laneRulesSchema = z
  .object({
    noCrossLaneChangesWithoutApproval: z.boolean(),
    worktreePerLaneRequired: z.boolean(),
    protectedPathsByLane: z.record(z.string().trim().min(1), stringListSchema),
    mergePolicyByLane: z.record(z.string().trim().min(1), mergePolicySchema)
  })
  .strict();

export type LaneRules = z.infer<typeof laneRulesSchema>;

export const qaRulesSchema = z
  .object({
    qaRequiredBeforeMerge: z.boolean(),
    acceptanceArtifactsRequired: z.boolean(),
    rollbackPlanRequiredForRiskyChanges: z.boolean(),
    approvalEvidenceRequiredBeforeScopeApproval: z.boolean(),
    requiredArtifactClasses: stringListSchema
  })
  .strict();

export type QaRules = z.infer<typeof qaRulesSchema>;

export const deltaAnalyzerPolicySchema = z
  .object({
    sameScopeOutcome: deltaAnalysisOutcomeSchema,
    preApprovalOutcome: deltaAnalysisOutcomeSchema,
    scopeExpansionOutcome: deltaAnalysisOutcomeSchema,
    architectureExpansionOutcome: deltaAnalysisOutcomeSchema,
    governanceConflictOutcome: deltaAnalysisOutcomeSchema,
    roadmapExpansionSignals: stringListSchema,
    architectureExpansionSignals: stringListSchema,
    governanceConflictSignals: stringListSchema
  })
  .strict();

export type DeltaAnalyzerPolicy = z.infer<typeof deltaAnalyzerPolicySchema>;

export const governanceRiskSchema = z
  .object({
    id: trimmedStringSchema,
    title: trimmedStringSchema,
    severity: architectureRiskSeveritySchema,
    area: trimmedStringSchema,
    description: trimmedStringSchema,
    mitigation: trimmedStringSchema,
    relatedPhaseIds: stringListSchema,
    relatedModuleIds: stringListSchema,
    relatedInputIds: z.array(architectureInputIdSchema)
  })
  .strict();

export type GovernanceRisk = z.infer<typeof governanceRiskSchema>;

export const governanceAssumptionSchema = z
  .object({
    id: trimmedStringSchema,
    statement: trimmedStringSchema
  })
  .strict();

export type GovernanceAssumption = z.infer<typeof governanceAssumptionSchema>;

export const deltaAnalysisResultSchema = z
  .object({
    requestClass: deltaRequestClassSchema,
    outcome: deltaAnalysisOutcomeSchema,
    reason: trimmedStringSchema,
    affectedLaneIds: stringListSchema,
    affectedModuleIds: stringListSchema,
    affectedPhaseIds: stringListSchema,
    requiresRoadmapRevision: z.boolean(),
    requiresArchitectureRevision: z.boolean(),
    requiresGovernanceReview: z.boolean(),
    shouldSaveAsPendingExecution: z.boolean(),
    requiresApprovalReset: z.boolean(),
    suggestedNextSurface: governanceSuggestedSurfaceSchema,
    suggestedNextAction: trimmedStringSchema
  })
  .strict();

export type DeltaAnalysisResult = z.infer<typeof deltaAnalysisResultSchema>;

export const scopeApprovalRecordSchema = z
  .object({
    approvalRecordId: trimmedStringSchema,
    sourceRoadmapPlanId: trimmedStringSchema,
    sourceGovernancePolicyId: trimmedStringSchema,
    status: scopeApprovalStatusSchema,
    approvedAt: trimmedStringSchema.nullable(),
    approvedBy: trimmedStringSchema.nullable(),
    unresolvedBlockerIds: stringListSchema,
    supersededByRevisionId: trimmedStringSchema.nullable()
  })
  .strict();

export type ScopeApprovalRecord = z.infer<typeof scopeApprovalRecordSchema>;

export const roadmapRevisionRecordSchema = z
  .object({
    revisionId: trimmedStringSchema,
    reason: trimmedStringSchema,
    requestClass: deltaRequestClassSchema,
    triggeredBy: trimmedStringSchema,
    sourceRoadmapPlanId: trimmedStringSchema,
    sourceGovernancePolicyId: trimmedStringSchema,
    requiresArchitectureRefresh: z.boolean(),
    requiresRoadmapRefresh: z.boolean(),
    requiresApprovalReset: z.boolean(),
    status: roadmapRevisionStatusSchema
  })
  .strict();

export type RoadmapRevisionRecord = z.infer<typeof roadmapRevisionRecordSchema>;

export const currentApprovalStateSchema = z
  .object({
    status: z.enum([
      "draft",
      "review_ready",
      "approval_ready",
      "approved",
      "revision_required"
    ]),
    roadmapScopeApproved: z.boolean(),
    approvalRecordId: trimmedStringSchema.nullable(),
    activeRevisionId: trimmedStringSchema.nullable()
  })
  .strict();

export type CurrentApprovalState = z.infer<typeof currentApprovalStateSchema>;

export const governancePolicySchema = z
  .object({
    governanceId: trimmedStringSchema,
    workspaceId: trimmedStringSchema.nullable(),
    projectId: trimmedStringSchema,
    projectName: trimmedStringSchema.nullable(),
    sourceProjectBriefRef: trimmedStringSchema,
    sourceArchitectureBlueprintRef: trimmedStringSchema,
    sourceRoadmapPlanRef: trimmedStringSchema,
    domainPack: domainPackIdSchema,
    hardGuards: hardGuardsSchema,
    billingProtection: billingProtectionSchema,
    laneRules: laneRulesSchema,
    qaRules: qaRulesSchema,
    deltaAnalyzerPolicy: deltaAnalyzerPolicySchema,
    approvalChecklist: z.array(approvalChecklistItemSchema),
    approvalReadiness: approvalReadinessSchema,
    currentApprovalState: currentApprovalStateSchema,
    scopeApprovalRecord: scopeApprovalRecordSchema.nullable(),
    roadmapRevisionRecords: z.array(roadmapRevisionRecordSchema),
    assumptionsMade: z.array(governanceAssumptionSchema),
    governanceRisks: z.array(governanceRiskSchema)
  })
  .strict();

export type GovernancePolicy = z.infer<typeof governancePolicySchema>;

export function loadGovernancePolicy(value: unknown) {
  const result = governancePolicySchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadScopeApprovalRecord(value: unknown) {
  const result = scopeApprovalRecordSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadRoadmapRevisionRecord(value: unknown) {
  const result = roadmapRevisionRecordSchema.safeParse(value);
  return result.success ? result.data : null;
}
