import {
  billingProtectionSummarySchema,
  type BillingProtectionCurrentStatus,
  type BillingProtectionState,
  type BillingProtectionSummary,
  type ChargeabilityDecision,
  type CostGuardrailDecision,
  type RetryDecision
} from "./types.ts";

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildBillingProtectionSummary(args: {
  currentStatus: BillingProtectionCurrentStatus;
  latestChargeabilityDecision: ChargeabilityDecision;
  latestRetryDecision: RetryDecision | null;
  latestCostGuardrailDecision: CostGuardrailDecision | null;
  totals: BillingProtectionState["totals"];
  blockerLabels: string[];
}): BillingProtectionSummary {
  const headline =
    args.currentStatus === "billable"
      ? "Billable completion recorded"
      : args.currentStatus === "retrying"
        ? "Protected retry in progress"
        : args.currentStatus === "review_required"
          ? "Protected pending review"
          : args.currentStatus === "deferred"
            ? "Completion is still protected"
            : "Protected non-billable outcome";

  return billingProtectionSummarySchema.parse({
    headline,
    statusLabel: formatLabel(args.currentStatus),
    chargeabilityLabel: formatLabel(args.latestChargeabilityDecision.status),
    retryLabel: args.latestRetryDecision
      ? formatLabel(args.latestRetryDecision.action)
      : "No Retry",
    guardrailLabel: args.latestCostGuardrailDecision
      ? formatLabel(args.latestCostGuardrailDecision.status)
      : "No Guardrail Triggered",
    totalsLabel: `${args.totals.billableEventCount} billable / ${args.totals.protectedEventCount} protected / ${args.totals.deferredEventCount} deferred events`,
    blockerLabels: args.blockerLabels
  });
}

export function buildBillingProtectionSummaryFromState(
  state: BillingProtectionState
) {
  return buildBillingProtectionSummary({
    currentStatus: state.currentStatus,
    latestChargeabilityDecision: state.latestChargeabilityDecision,
    latestRetryDecision: state.latestRetryDecision,
    latestCostGuardrailDecision: state.latestCostGuardrailDecision,
    totals: state.totals,
    blockerLabels: state.summary.blockerLabels
  });
}
