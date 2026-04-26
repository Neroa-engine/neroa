import { z } from "zod";
import { architectureInputIdSchema } from "../intelligence/architecture/types.ts";
import { projectBriefSlotIdSchema } from "../intelligence/domain-contracts.ts";
import { strategyRevisionPatchSchema } from "../intelligence/revisions/types.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

export const blockerIdSchema = z.enum([
  "founder_name",
  "project_direction",
  "constraints",
  "integrations",
  "data_sources",
  "chains_in_scope",
  "wallet_boundary",
  "analytics_vs_advice_posture",
  "scoring_inputs",
  "first_pos_connector",
  "launch_location_model",
  "launch_reports",
  "core_user_roles",
  "compliance_sensitivity",
  "ai_integration_boundary",
  "pricing_model",
  "payments_billing_requirement",
  "marketplace_listings_requirement",
  "scheduling_dispatch_requirement",
  "customer_portal_requirement",
  "exports_requirement",
  "role_based_access_requirement",
  "multi_tenancy_requirement",
  "workflow_approval_requirement",
  "document_case_intake_requirement",
  "api_access_requirement",
  "reporting_depth_requirement",
  "admin_permissions_requirement",
  "notification_channels",
  "file_storage_requirement",
  "support_human_review_requirement",
  "mobile_priority_requirement",
  "public_vs_internal_surface",
  "search_saved_views_requirement",
  "audit_trail_requirement",
  "file_upload_requirement",
  "notifications_requirement",
  "admin_console_requirement",
  "search_filter_requirement",
  "dashboard_reporting_requirement"
]);

export type BlockerId = z.infer<typeof blockerIdSchema>;

export const blockerQuestionFamilySchema = z.enum([
  "identity",
  "product",
  "constraints",
  "systems",
  "domain_scope",
  "integrations",
  "roles",
  "compliance",
  "feature_boundary"
]);

export type BlockerQuestionFamily = z.infer<typeof blockerQuestionFamilySchema>;

export const blockerAnswerModeSchema = z.enum([
  "single_select",
  "multi_select",
  "freeform_structured",
  "boolean",
  "enum_plus_notes",
  "list"
]);

export type BlockerAnswerMode = z.infer<typeof blockerAnswerModeSchema>;

export const blockerSchemaIdSchema = z.enum([
  "founder_name",
  "product_direction",
  "constraints",
  "provider_list",
  "provider_requirement",
  "chain_list",
  "wallet_boundary",
  "posture_boundary",
  "connector_select",
  "location_model",
  "reports_list",
  "role_split",
  "compliance_sensitivity",
  "ai_integration_boundary",
  "feature_requirement",
  "pricing_model",
  "tenancy_requirement",
  "surface_boundary",
  "notification_channels"
]);

export type BlockerSchemaId = z.infer<typeof blockerSchemaIdSchema>;

export const blockerSchemaFieldTypeSchema = z.enum([
  "string",
  "boolean",
  "string_list",
  "enum",
  "provider_ref",
  "chain_ref",
  "role_split"
]);

export type BlockerSchemaFieldType = z.infer<typeof blockerSchemaFieldTypeSchema>;

export const slotSchemaFieldSchema = z
  .object({
    name: trimmedStringSchema,
    label: trimmedStringSchema,
    type: blockerSchemaFieldTypeSchema,
    required: z.boolean(),
    enumValues: stringListSchema.optional()
  })
  .strict();

export type SlotSchemaField = z.infer<typeof slotSchemaFieldSchema>;

export const slotSchemaDefinitionSchema = z
  .object({
    id: blockerSchemaIdSchema,
    label: trimmedStringSchema,
    description: trimmedStringSchema,
    answerMode: blockerAnswerModeSchema,
    fields: z.array(slotSchemaFieldSchema).min(1),
    allowsNotes: z.boolean()
  })
  .strict();

export type SlotSchemaDefinition = z.infer<typeof slotSchemaDefinitionSchema>;

export const normalizationRuleIdSchema = z.enum([
  "null_style_none",
  "mvp_boundary",
  "analytics_only",
  "provider_aliases",
  "pricing_aliases",
  "tenancy_aliases",
  "surface_aliases",
  "notification_channel_aliases",
  "chain_aliases",
  "pos_connector_aliases",
  "launch_location_aliases",
  "role_aliases",
  "report_aliases",
  "compliance_aliases",
  "feature_signal_aliases",
  "feature_requirement_aliases"
]);

export type NormalizationRuleId = z.infer<typeof normalizationRuleIdSchema>;

export const normalizationRuleSchema = z
  .object({
    id: normalizationRuleIdSchema,
    label: trimmedStringSchema,
    description: trimmedStringSchema,
    appliesTo: z.array(blockerIdSchema).min(1),
    examples: stringListSchema
  })
  .strict();

export type NormalizationRule = z.infer<typeof normalizationRuleSchema>;

export const strategyWriteTargetSchema = z.enum([
  "projectBrief.founderName",
  "projectBrief.projectName",
  "projectBrief.buyerPersonas",
  "projectBrief.operatorPersonas",
  "projectBrief.endCustomerPersonas",
  "projectBrief.adminPersonas",
  "projectBrief.productCategory",
  "projectBrief.problemStatement",
  "projectBrief.outcomePromise",
  "projectBrief.mustHaveFeatures",
  "projectBrief.niceToHaveFeatures",
  "projectBrief.excludedFeatures",
  "projectBrief.surfaces",
  "projectBrief.integrations",
  "projectBrief.dataSources",
  "projectBrief.constraints",
  "projectBrief.complianceFlags",
  "projectBrief.trustRisks",
  "answeredInputs.chainsInScope",
  "answeredInputs.walletConnectionMvp",
  "answeredInputs.adviceAdjacency",
  "answeredInputs.riskSignalSources",
  "answeredInputs.launchLocationModel",
  "answeredInputs.firstPosConnector",
  "answeredInputs.launchReports"
]);

export type StrategyWriteTarget = z.infer<typeof strategyWriteTargetSchema>;

export const blockerActiveWhenSchema = z
  .object({
    slotIds: z.array(projectBriefSlotIdSchema).default([]),
    inputIds: z.array(architectureInputIdSchema).default([]),
    questionTextHints: stringListSchema.default([]),
    capabilityHints: stringListSchema.default([])
  })
  .strict();

export type BlockerActiveWhen = z.infer<typeof blockerActiveWhenSchema>;

export const blockerDefinitionSchema = z
  .object({
    id: blockerIdSchema,
    label: trimmedStringSchema,
    description: trimmedStringSchema,
    questionText: trimmedStringSchema,
    questionFamily: blockerQuestionFamilySchema,
    schemaId: blockerSchemaIdSchema,
    answerMode: blockerAnswerModeSchema,
    allowedWriteTargets: z.array(strategyWriteTargetSchema).min(1),
    disallowedSlotTargets: z.array(strategyWriteTargetSchema),
    allowedNormalizationRules: z.array(normalizationRuleIdSchema),
    validExampleAnswers: stringListSchema,
    invalidExampleAnswers: stringListSchema,
    clarificationRules: stringListSchema,
    completionCriteria: stringListSchema,
    nextBlockerHints: stringListSchema.default([]),
    safeSecondaryHintBlockerIds: z.array(blockerIdSchema).default([]),
    activeWhen: blockerActiveWhenSchema,
    defaultClarificationPrompt: trimmedStringSchema,
    allowPartialSave: z.boolean()
  })
  .strict();

export type BlockerDefinition = z.infer<typeof blockerDefinitionSchema>;

export const blockerQuestionSourceSchema = z.enum([
  "project_brief",
  "architecture",
  "roadmap",
  "governance",
  "revision",
  "runtime"
]);

export type BlockerQuestionSource = z.infer<typeof blockerQuestionSourceSchema>;

export const blockerQuestionStateSchema = z
  .object({
    blockerId: blockerIdSchema,
    inputId: trimmedStringSchema,
    slotId: projectBriefSlotIdSchema.nullable(),
    label: trimmedStringSchema,
    question: trimmedStringSchema,
    source: blockerQuestionSourceSchema,
    currentValue: trimmedStringSchema.nullable()
  })
  .strict();

export type BlockerQuestionState = z.infer<typeof blockerQuestionStateSchema>;

export const structuredAnswerExtractionStatusSchema = z.enum([
  "parsed",
  "partial",
  "needs_clarification",
  "invalid",
  "failed"
]);

export type StructuredAnswerExtractionStatus = z.infer<
  typeof structuredAnswerExtractionStatusSchema
>;

export const structuredAnswerProviderMetadataSchema = z
  .object({
    providerId: trimmedStringSchema,
    modelId: trimmedStringSchema,
    mode: z.enum(["mock", "live", "deterministic"]),
    traceId: trimmedStringSchema.nullable(),
    adapterNotes: stringListSchema
  })
  .strict();

export type StructuredAnswerProviderMetadata = z.infer<
  typeof structuredAnswerProviderMetadataSchema
>;

export const structuredAnswerSecondaryHintSchema = z
  .object({
    blockerId: blockerIdSchema,
    summary: trimmedStringSchema,
    normalizedValue: z.record(z.string(), z.unknown()).nullable()
  })
  .strict();

export type StructuredAnswerSecondaryHint = z.infer<
  typeof structuredAnswerSecondaryHintSchema
>;

export const structuredAnswerExtractionResultSchema = z
  .object({
    blockerId: blockerIdSchema,
    rawAnswer: trimmedStringSchema,
    normalizedAnswer: z.record(z.string(), z.unknown()).nullable(),
    structuredPatch: strategyRevisionPatchSchema.nullable(),
    confidence: z.number().min(0).max(1),
    status: structuredAnswerExtractionStatusSchema,
    clarificationPrompt: trimmedStringSchema.nullable(),
    writeTargets: z.array(strategyWriteTargetSchema),
    blockedWriteTargets: z.array(strategyWriteTargetSchema),
    secondaryHints: z.array(structuredAnswerSecondaryHintSchema).default([]),
    notes: stringListSchema,
    providerMetadata: structuredAnswerProviderMetadataSchema.nullable()
  })
  .strict();

export type StructuredAnswerExtractionResult = z.infer<
  typeof structuredAnswerExtractionResultSchema
>;

export const clarificationDecisionSchema = z
  .object({
    outcome: z.enum(["advance", "clarify", "error"]),
    prompt: trimmedStringSchema,
    summary: trimmedStringSchema
  })
  .strict();

export type ClarificationDecision = z.infer<typeof clarificationDecisionSchema>;

export const blockerEvalCaseSchema = z
  .object({
    id: trimmedStringSchema,
    blockerId: blockerIdSchema,
    label: trimmedStringSchema,
    rawAnswer: trimmedStringSchema,
    knownFounderName: trimmedStringSchema.nullable().optional(),
    expectedStatus: structuredAnswerExtractionStatusSchema,
    expectedWriteTargets: z.array(strategyWriteTargetSchema),
    forbiddenWriteTargets: z.array(strategyWriteTargetSchema),
    expectedNormalizedSubset: z.record(z.string(), z.unknown()).nullable(),
    expectedPatch: strategyRevisionPatchSchema.nullable(),
    expectedClarificationPattern: trimmedStringSchema.nullable().optional(),
    expectedSecondaryHintBlockerIds: z.array(blockerIdSchema).optional()
  })
  .strict();

export type BlockerEvalCase = z.infer<typeof blockerEvalCaseSchema>;

export const structuredExtractionRequestSchema = z
  .object({
    blocker: blockerDefinitionSchema,
    blockerState: blockerQuestionStateSchema,
    schema: slotSchemaDefinitionSchema,
    rawAnswer: trimmedStringSchema,
    normalizedAnswerPreview: z.record(z.string(), z.unknown()).nullable(),
    allowedWriteTargets: z.array(strategyWriteTargetSchema),
    blockedWriteTargets: z.array(strategyWriteTargetSchema),
    knownProjectSignals: stringListSchema
  })
  .strict();

export type StructuredExtractionRequest = z.infer<
  typeof structuredExtractionRequestSchema
>;

export function loadStructuredAnswerExtractionResult(value: unknown) {
  const result = structuredAnswerExtractionResultSchema.safeParse(value);
  return result.success ? result.data : null;
}
