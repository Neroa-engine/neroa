import { z } from "zod";

const trimmedStringSchema = z.string().trim().min(1);
const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();
const stringListSchema = z.array(trimmedStringSchema);

export const nonBillableReasonSchema = z.enum([
  "governance_blocked",
  "pending_execution",
  "approval_missing",
  "roadmap_revision_required",
  "architecture_revision_required",
  "strategy_revision_invalidated",
  "planner_loop",
  "schema_failure",
  "tool_contract_failure",
  "relay_failure",
  "transient_executor_failure",
  "auto_retry_system_failure",
  "qa_blocked_missing_artifacts",
  "qa_failed_unaccepted",
  "release_not_ready",
  "operator_review_required_before_acceptance",
  "provider_ingestion_failure",
  "score_generation_failure",
  "connector_sync_failure",
  "reporting_refresh_failure",
  "integration_failure",
  "worker_trigger_failure",
  "classification_failure",
  "storage_unavailable",
  "retry_exhausted"
]);

export type NonBillableReason = z.infer<typeof nonBillableReasonSchema>;

export const chargeabilityStatusSchema = z.enum([
  "billable",
  "deferred",
  "protected_non_billable",
  "review_required"
]);

export type ChargeabilityStatus = z.infer<typeof chargeabilityStatusSchema>;

export const chargeEventTypeSchema = z.enum([
  "pending_execution_captured",
  "governance_blocked",
  "execution_started",
  "execution_deferred",
  "system_failure_protected",
  "retry_protected",
  "retry_blocked",
  "qa_protected",
  "review_required",
  "billable_completion"
]);

export type ChargeEventType = z.infer<typeof chargeEventTypeSchema>;

export const chargeEventStatusSchema = z.enum(["recorded", "superseded"]);

export type ChargeEventStatus = z.infer<typeof chargeEventStatusSchema>;

export const failureClassificationSeveritySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical"
]);

export type FailureClassificationSeverity = z.infer<
  typeof failureClassificationSeveritySchema
>;

export const retryActionSchema = z.enum([
  "none",
  "auto_retry",
  "stop_auto_retry",
  "require_review"
]);

export type RetryAction = z.infer<typeof retryActionSchema>;

export const costGuardrailStatusSchema = z.enum([
  "ok",
  "warn",
  "block_auto_retry",
  "require_review"
]);

export type CostGuardrailStatus = z.infer<typeof costGuardrailStatusSchema>;

export const billingProtectionCurrentStatusSchema = z.enum([
  "billable",
  "protected",
  "deferred",
  "retrying",
  "review_required"
]);

export type BillingProtectionCurrentStatus = z.infer<
  typeof billingProtectionCurrentStatusSchema
>;

export const chargeEventSchema = z
  .object({
    chargeEventId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    sourceRequestId: nullableTrimmedStringSchema.default(null),
    sourceExecutionPacketId: trimmedStringSchema,
    sourceQAValidationId: nullableTrimmedStringSchema.default(null),
    sourceGovernancePolicyId: nullableTrimmedStringSchema.default(null),
    sourceTaskId: nullableTrimmedStringSchema.default(null),
    sourceRunId: nullableTrimmedStringSchema.default(null),
    eventType: chargeEventTypeSchema,
    status: chargeEventStatusSchema,
    chargeability: chargeabilityStatusSchema,
    classification: trimmedStringSchema,
    chargeUnits: z.number().int().min(0),
    protectedUnits: z.number().int().min(0),
    reason: trimmedStringSchema,
    failureClass: nonBillableReasonSchema.nullable().default(null),
    retryAttempt: z.number().int().min(0).nullable().default(null),
    createdAt: trimmedStringSchema
  })
  .strict();

export type ChargeEvent = z.infer<typeof chargeEventSchema>;

export const chargeabilityDecisionSchema = z
  .object({
    status: chargeabilityStatusSchema,
    billable: z.boolean(),
    classification: trimmedStringSchema,
    reason: trimmedStringSchema,
    canChargeCustomer: z.boolean(),
    safeToCountTowardSpend: z.boolean(),
    requiresHumanReview: z.boolean(),
    chargeUnits: z.number().int().min(0),
    protectedUnits: z.number().int().min(0)
  })
  .strict();

export type ChargeabilityDecision = z.infer<
  typeof chargeabilityDecisionSchema
>;

export const failureClassificationSchema = z
  .object({
    class: nonBillableReasonSchema,
    systemCaused: z.boolean(),
    retryEligible: z.boolean(),
    nonBillable: z.boolean(),
    severity: failureClassificationSeveritySchema,
    reason: trimmedStringSchema
  })
  .strict();

export type FailureClassification = z.infer<
  typeof failureClassificationSchema
>;

export const retryDecisionSchema = z
  .object({
    action: retryActionSchema,
    reason: trimmedStringSchema,
    retryEligible: z.boolean(),
    maxRetries: z.number().int().min(0),
    remainingRetries: z.number().int().min(0),
    nextDelayMs: z.number().int().min(0).nullable(),
    billableOnRetry: z.boolean(),
    requiresHumanReview: z.boolean()
  })
  .strict();

export type RetryDecision = z.infer<typeof retryDecisionSchema>;

export const costGuardrailDecisionSchema = z
  .object({
    status: costGuardrailStatusSchema,
    reason: trimmedStringSchema,
    projectedChargeUnits: z.number().int().min(0),
    nonBillableWasteUnits: z.number().int().min(0),
    wasteScore: z.number().int().min(0),
    retryWasteCount: z.number().int().min(0),
    exceedsProjectThreshold: z.boolean(),
    blocksFurtherAutoRetry: z.boolean(),
    requiresOperatorReview: z.boolean()
  })
  .strict();

export type CostGuardrailDecision = z.infer<
  typeof costGuardrailDecisionSchema
>;

export const billingProtectionTotalsSchema = z
  .object({
    billableEventCount: z.number().int().min(0),
    protectedEventCount: z.number().int().min(0),
    deferredEventCount: z.number().int().min(0),
    reviewRequiredEventCount: z.number().int().min(0),
    billableUnits: z.number().int().min(0),
    protectedUnits: z.number().int().min(0),
    nonBillableWasteUnits: z.number().int().min(0),
    retryAttemptCount: z.number().int().min(0),
    blockedRetryCount: z.number().int().min(0)
  })
  .strict();

export type BillingProtectionTotals = z.infer<
  typeof billingProtectionTotalsSchema
>;

export const billingProtectionSummarySchema = z
  .object({
    headline: trimmedStringSchema,
    statusLabel: trimmedStringSchema,
    chargeabilityLabel: trimmedStringSchema,
    retryLabel: trimmedStringSchema,
    guardrailLabel: trimmedStringSchema,
    totalsLabel: trimmedStringSchema,
    blockerLabels: stringListSchema
  })
  .strict();

export type BillingProtectionSummary = z.infer<
  typeof billingProtectionSummarySchema
>;

export const billingProtectionStateSchema = z
  .object({
    projectId: trimmedStringSchema,
    sourceGovernancePolicyId: trimmedStringSchema,
    sourceExecutionPacketId: nullableTrimmedStringSchema.default(null),
    sourceQAValidationId: nullableTrimmedStringSchema.default(null),
    latestChargeabilityDecision: chargeabilityDecisionSchema,
    latestFailureClassification: failureClassificationSchema.nullable(),
    latestRetryDecision: retryDecisionSchema.nullable(),
    latestCostGuardrailDecision: costGuardrailDecisionSchema.nullable(),
    chargeEvents: z.array(chargeEventSchema),
    totals: billingProtectionTotalsSchema,
    currentStatus: billingProtectionCurrentStatusSchema,
    summary: billingProtectionSummarySchema
  })
  .strict();

export type BillingProtectionState = z.infer<
  typeof billingProtectionStateSchema
>;

export function loadChargeEvent(value: unknown) {
  const result = chargeEventSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadBillingProtectionState(value: unknown) {
  const result = billingProtectionStateSchema.safeParse(value);
  return result.success ? result.data : null;
}
