import { z } from "zod";
import { architectureInputIdSchema } from "../architecture/types.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

export const strategyChangedAreaSchema = z.enum([
  "project_brief",
  "architecture",
  "roadmap",
  "governance",
  "open_questions"
]);

export type StrategyChangedArea = z.infer<typeof strategyChangedAreaSchema>;

export const strategyRevisionMaterialitySchema = z.enum([
  "non_material",
  "scope_tightening",
  "material"
]);

export type StrategyRevisionMateriality = z.infer<
  typeof strategyRevisionMaterialitySchema
>;

export const strategyRevisionStatusSchema = z.enum([
  "applied",
  "superseded"
]);

export type StrategyRevisionStatus = z.infer<
  typeof strategyRevisionStatusSchema
>;

export const strategyApprovalActionSchema = z.enum([
  "none",
  "request_review",
  "approve_scope"
]);

export type StrategyApprovalAction = z.infer<
  typeof strategyApprovalActionSchema
>;

export const strategyAnsweredInputSchema = z
  .object({
    inputId: architectureInputIdSchema,
    value: trimmedStringSchema
  })
  .strict();

export type StrategyAnsweredInput = z.infer<
  typeof strategyAnsweredInputSchema
>;

const strategyStringRecordSchema = z.record(
  z.string().trim().min(1),
  trimmedStringSchema
);

export const strategyProjectBriefPatchSchema = z
  .object({
    founderName: trimmedStringSchema.optional(),
    projectName: trimmedStringSchema.optional(),
    buyerPersonas: stringListSchema.optional(),
    operatorPersonas: stringListSchema.optional(),
    endCustomerPersonas: stringListSchema.optional(),
    adminPersonas: stringListSchema.optional(),
    productCategory: trimmedStringSchema.optional(),
    problemStatement: trimmedStringSchema.optional(),
    outcomePromise: trimmedStringSchema.optional(),
    mustHaveFeatures: stringListSchema.optional(),
    niceToHaveFeatures: stringListSchema.optional(),
    excludedFeatures: stringListSchema.optional(),
    surfaces: stringListSchema.optional(),
    integrations: stringListSchema.optional(),
    dataSources: stringListSchema.optional(),
    constraints: stringListSchema.optional(),
    complianceFlags: stringListSchema.optional(),
    trustRisks: stringListSchema.optional()
  })
  .strict();

export type StrategyProjectBriefPatch = z.infer<
  typeof strategyProjectBriefPatchSchema
>;

export const strategyArchitecturePatchSchema = z
  .object({
    selectedIntegrations: stringListSchema.optional(),
    assumptions: stringListSchema.optional()
  })
  .strict();

export type StrategyArchitecturePatch = z.infer<
  typeof strategyArchitecturePatchSchema
>;

export const strategyRoadmapPatchSchema = z
  .object({
    mvpSummary: trimmedStringSchema.optional(),
    explicitNotInScope: stringListSchema.optional(),
    phaseNotesById: strategyStringRecordSchema.optional(),
    assumptions: stringListSchema.optional()
  })
  .strict();

export type StrategyRoadmapPatch = z.infer<
  typeof strategyRoadmapPatchSchema
>;

export const strategyGovernancePatchSchema = z
  .object({
    approvalEvidenceByChecklistId: strategyStringRecordSchema.optional(),
    requestedAction: strategyApprovalActionSchema.optional()
  })
  .strict();

export type StrategyGovernancePatch = z.infer<
  typeof strategyGovernancePatchSchema
>;

export const strategyRevisionPatchSchema = z
  .object({
    projectBrief: strategyProjectBriefPatchSchema.optional(),
    architecture: strategyArchitecturePatchSchema.optional(),
    roadmap: strategyRoadmapPatchSchema.optional(),
    governance: strategyGovernancePatchSchema.optional(),
    answeredInputs: z.array(strategyAnsweredInputSchema).optional()
  })
  .strict();

export type StrategyRevisionPatch = z.infer<
  typeof strategyRevisionPatchSchema
>;

export const strategyOverrideStateSchema = z
  .object({
    projectBrief: strategyProjectBriefPatchSchema.nullable(),
    architecture: strategyArchitecturePatchSchema.nullable(),
    roadmap: strategyRoadmapPatchSchema.nullable(),
    governance: strategyGovernancePatchSchema.nullable(),
    answeredInputs: z.array(strategyAnsweredInputSchema),
    lastAppliedRevisionId: trimmedStringSchema.nullable(),
    updatedAt: trimmedStringSchema.nullable()
  })
  .strict();

export type StrategyOverrideState = z.infer<
  typeof strategyOverrideStateSchema
>;

export const strategyRevisionRecordSchema = z
  .object({
    revisionId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    createdAt: trimmedStringSchema,
    createdBy: trimmedStringSchema.nullable(),
    changedAreas: z.array(strategyChangedAreaSchema),
    patchPayload: strategyRevisionPatchSchema,
    materiality: strategyRevisionMaterialitySchema,
    requiresApprovalReset: z.boolean(),
    relatedApprovalRecordId: trimmedStringSchema.nullable(),
    summary: trimmedStringSchema,
    status: strategyRevisionStatusSchema
  })
  .strict();

export type StrategyRevisionRecord = z.infer<
  typeof strategyRevisionRecordSchema
>;

export const revisionApplicationResultSchema = z
  .object({
    applied: z.boolean(),
    changedAreas: z.array(strategyChangedAreaSchema),
    materiality: strategyRevisionMaterialitySchema,
    updatedLayerIds: stringListSchema,
    approvalInvalidated: z.boolean(),
    blockersChanged: z.boolean(),
    summary: trimmedStringSchema
  })
  .strict();

export type RevisionApplicationResult = z.infer<
  typeof revisionApplicationResultSchema
>;

export const approvalInvalidationResultSchema = z
  .object({
    approvalInvalidated: z.boolean(),
    requiresApprovalReset: z.boolean(),
    previousApprovalRecordId: trimmedStringSchema.nullable(),
    nextApprovalState: z.enum(["unchanged", "stale", "reset"]),
    reason: trimmedStringSchema
  })
  .strict();

export type ApprovalInvalidationResult = z.infer<
  typeof approvalInvalidationResultSchema
>;

export function loadStrategyRevisionPatch(value: unknown) {
  const result = strategyRevisionPatchSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadStrategyOverrideState(value: unknown) {
  const result = strategyOverrideStateSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadStrategyRevisionRecord(value: unknown) {
  const result = strategyRevisionRecordSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadRevisionApplicationResult(value: unknown) {
  const result = revisionApplicationResultSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadApprovalInvalidationResult(value: unknown) {
  const result = approvalInvalidationResultSchema.safeParse(value);
  return result.success ? result.data : null;
}
