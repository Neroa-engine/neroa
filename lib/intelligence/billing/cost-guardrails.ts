import type { BuildRoomTaskDetail } from "@/lib/build-room/types";
import type { GovernancePolicy } from "../governance/types.ts";
import {
  costGuardrailDecisionSchema,
  type BillingProtectionState,
  type ChargeabilityDecision,
  type CostGuardrailDecision,
  type RetryDecision
} from "./types.ts";

function countFailedRuns(taskDetail?: BuildRoomTaskDetail | null) {
  if (!taskDetail) {
    return 0;
  }

  return taskDetail.runs.filter((run) => run.status === "failed").length;
}

export function buildCostGuardrailDecision(args: {
  governancePolicy: GovernancePolicy;
  currentDecision: ChargeabilityDecision;
  retryDecision: RetryDecision | null;
  priorState?: BillingProtectionState | null;
  taskDetail?: BuildRoomTaskDetail | null;
}): CostGuardrailDecision | null {
  const retryWasteCount = Math.max(
    countFailedRuns(args.taskDetail),
    args.priorState?.totals.retryAttemptCount ?? 0
  );
  const projectedChargeUnits = args.currentDecision.billable
    ? args.currentDecision.chargeUnits
    : 0;
  const nonBillableWasteUnits =
    (args.priorState?.totals.nonBillableWasteUnits ?? 0) +
    args.currentDecision.protectedUnits +
    (args.retryDecision?.action === "auto_retry" ? 1 : 0);
  const wasteScore = nonBillableWasteUnits + retryWasteCount;
  const maxRetries = args.governancePolicy.billingProtection.maxSystemRetriesPerStep;

  if (args.retryDecision?.action === "stop_auto_retry" || retryWasteCount >= maxRetries) {
    return costGuardrailDecisionSchema.parse({
      status: "block_auto_retry",
      reason:
        "Protected retry capacity is exhausted, so Neroa should stop automatic retries and require review.",
      projectedChargeUnits,
      nonBillableWasteUnits,
      wasteScore,
      retryWasteCount,
      exceedsProjectThreshold: true,
      blocksFurtherAutoRetry: true,
      requiresOperatorReview: true
    });
  }

  if (args.retryDecision?.action === "require_review") {
    return costGuardrailDecisionSchema.parse({
      status: "require_review",
      reason:
        "The current protected failure needs operator review before Neroa spends another attempt.",
      projectedChargeUnits,
      nonBillableWasteUnits,
      wasteScore,
      retryWasteCount,
      exceedsProjectThreshold: false,
      blocksFurtherAutoRetry: true,
      requiresOperatorReview: true
    });
  }

  if (nonBillableWasteUnits >= Math.max(2, maxRetries)) {
    return costGuardrailDecisionSchema.parse({
      status: "warn",
      reason:
        "Protected waste has started to accumulate, so the next retry should stay visible to the operator.",
      projectedChargeUnits,
      nonBillableWasteUnits,
      wasteScore,
      retryWasteCount,
      exceedsProjectThreshold: false,
      blocksFurtherAutoRetry: false,
      requiresOperatorReview: false
    });
  }

  return costGuardrailDecisionSchema.parse({
    status: "ok",
    reason:
      args.currentDecision.billable
        ? "The governed execution is release-ready and safe to count as billable."
        : "The current protected state still stays within the allowed internal waste threshold.",
    projectedChargeUnits,
    nonBillableWasteUnits,
    wasteScore,
    retryWasteCount,
    exceedsProjectThreshold: false,
    blocksFurtherAutoRetry: false,
    requiresOperatorReview: false
  });
}
