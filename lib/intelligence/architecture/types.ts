import { z } from "zod";
import {
  domainPackIdSchema,
  projectBriefQuestionStageSchema
} from "../domain-contracts.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

export const architectureInputIdSchema = z.enum([
  "productCategory",
  "buyerPersonas",
  "operatorPersonas",
  "problemStatement",
  "mustHaveFeatures",
  "surfaces",
  "integrations",
  "dataSources",
  "constraints",
  "chainsInScope",
  "walletConnectionMvp",
  "adviceAdjacency",
  "riskSignalSources",
  "launchLocationModel",
  "firstPosConnector",
  "analyticsVsStaffWorkflows",
  "launchReports"
]);

export type ArchitectureInputId = z.infer<typeof architectureInputIdSchema>;

export const architectureSystemTypeSchema = z.enum([
  "generic_saas_platform",
  "analytics_platform",
  "intelligence_platform",
  "ops_reporting_platform"
]);

export type ArchitectureSystemType = z.infer<typeof architectureSystemTypeSchema>;

export const tenancyModelSchema = z.enum([
  "single_workspace",
  "multi_tenant_saas",
  "multi_location_hierarchy"
]);

export type TenancyModel = z.infer<typeof tenancyModelSchema>;

export const systemModuleKindSchema = z.enum([
  "foundation",
  "domain_service",
  "data_pipeline",
  "experience",
  "admin",
  "observability"
]);

export type SystemModuleKind = z.infer<typeof systemModuleKindSchema>;

export const dataEntityCategorySchema = z.enum([
  "identity",
  "domain",
  "analytics",
  "configuration",
  "integration"
]);

export type DataEntityCategory = z.infer<typeof dataEntityCategorySchema>;

export const integrationCategorySchema = z.enum([
  "auth",
  "data_provider",
  "wallet",
  "pos",
  "analytics",
  "export",
  "generic"
]);

export type IntegrationCategory = z.infer<typeof integrationCategorySchema>;

export const dependencyEdgeTypeSchema = z.enum(["hard", "soft"]);

export type DependencyEdgeType = z.infer<typeof dependencyEdgeTypeSchema>;

export const architectureRiskSeveritySchema = z.enum(["low", "medium", "high"]);

export type ArchitectureRiskSeverity = z.infer<typeof architectureRiskSeveritySchema>;

export const mergePolicySchema = z.enum([
  "review_required",
  "foundation_first",
  "dependency_ordered"
]);

export type MergePolicy = z.infer<typeof mergePolicySchema>;

export const systemModuleSchema = z
  .object({
    id: trimmedStringSchema,
    name: trimmedStringSchema,
    kind: systemModuleKindSchema,
    purpose: trimmedStringSchema,
    ownedSurface: trimmedStringSchema.nullable(),
    dependsOn: stringListSchema,
    laneId: trimmedStringSchema,
    riskLevel: architectureRiskSeveritySchema
  })
  .strict();

export type SystemModule = z.infer<typeof systemModuleSchema>;

export const dataEntitySchema = z
  .object({
    id: trimmedStringSchema,
    name: trimmedStringSchema,
    category: dataEntityCategorySchema,
    description: trimmedStringSchema,
    ownerModuleId: trimmedStringSchema,
    containsSensitiveData: z.boolean(),
    sourceIntegrationIds: stringListSchema
  })
  .strict();

export type DataEntity = z.infer<typeof dataEntitySchema>;

export const integrationRequirementSchema = z
  .object({
    id: trimmedStringSchema,
    name: trimmedStringSchema,
    category: integrationCategorySchema,
    purpose: trimmedStringSchema,
    requiredForMvp: z.boolean(),
    moduleIds: stringListSchema,
    dataEntityIds: stringListSchema,
    notes: trimmedStringSchema.nullable()
  })
  .strict();

export type IntegrationRequirement = z.infer<typeof integrationRequirementSchema>;

export const dependencyEdgeSchema = z
  .object({
    fromModuleId: trimmedStringSchema,
    toModuleId: trimmedStringSchema,
    type: dependencyEdgeTypeSchema,
    reason: trimmedStringSchema
  })
  .strict();

export type DependencyEdge = z.infer<typeof dependencyEdgeSchema>;

export const laneSchema = z
  .object({
    id: trimmedStringSchema,
    name: trimmedStringSchema,
    purpose: trimmedStringSchema,
    ownedModuleIds: stringListSchema,
    dependsOnLaneIds: stringListSchema,
    protectedPaths: stringListSchema,
    mergePolicy: mergePolicySchema
  })
  .strict();

export type Lane = z.infer<typeof laneSchema>;

export const worktreePlanSchema = z
  .object({
    id: trimmedStringSchema,
    laneId: trimmedStringSchema,
    branchName: trimmedStringSchema,
    purpose: trimmedStringSchema,
    scopeSummary: trimmedStringSchema,
    blockedBy: stringListSchema,
    approvalNotes: trimmedStringSchema.nullable()
  })
  .strict();

export type WorktreePlan = z.infer<typeof worktreePlanSchema>;

export const architectureRiskSchema = z
  .object({
    id: trimmedStringSchema,
    title: trimmedStringSchema,
    severity: architectureRiskSeveritySchema,
    area: trimmedStringSchema,
    description: trimmedStringSchema,
    mitigation: trimmedStringSchema,
    relatedModuleIds: stringListSchema,
    relatedInputIds: z.array(architectureInputIdSchema)
  })
  .strict();

export type ArchitectureRisk = z.infer<typeof architectureRiskSchema>;

export const architectureOpenQuestionSchema = z
  .object({
    inputId: architectureInputIdSchema,
    label: trimmedStringSchema,
    question: trimmedStringSchema,
    stage: projectBriefQuestionStageSchema,
    whyItMatters: trimmedStringSchema,
    relatedModuleIds: stringListSchema
  })
  .strict();

export type ArchitectureOpenQuestion = z.infer<typeof architectureOpenQuestionSchema>;

export const architectureBlueprintSchema = z
  .object({
    workspaceId: trimmedStringSchema.nullable(),
    projectId: trimmedStringSchema,
    projectName: trimmedStringSchema.nullable(),
    sourceProjectBriefRef: trimmedStringSchema,
    domainPack: domainPackIdSchema,
    systemType: architectureSystemTypeSchema,
    tenancyModel: tenancyModelSchema,
    surfaces: stringListSchema,
    modules: z.array(systemModuleSchema),
    dataEntities: z.array(dataEntitySchema),
    integrations: z.array(integrationRequirementSchema),
    dependencyGraph: z.array(dependencyEdgeSchema),
    lanes: z.array(laneSchema),
    worktrees: z.array(worktreePlanSchema),
    architectureRisks: z.array(architectureRiskSchema),
    openQuestions: z.array(architectureOpenQuestionSchema),
    readinessScore: z.number().int().min(0).max(100),
    missingCriticalArchitectureInputs: z.array(architectureInputIdSchema),
    assumptionsMade: z.array(trimmedStringSchema)
  })
  .strict();

export type ArchitectureBlueprint = z.infer<typeof architectureBlueprintSchema>;

export function loadArchitectureBlueprint(value: unknown) {
  const result = architectureBlueprintSchema.safeParse(value);
  return result.success ? result.data : null;
}
