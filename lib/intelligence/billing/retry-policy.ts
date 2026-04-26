import type { BuildRoomTaskDetail } from "@/lib/build-room/types";
import type { GovernancePolicy } from "../governance/types.ts";
import type { ExecutionPacket } from "../execution/types.ts";
import {
  retryDecisionSchema,
  type BillingProtectionState,
  type FailureClassification,
  type RetryDecision
} from "./types.ts";

function countFailedRuns(taskDetail?: BuildRoomTaskDetail | null) {
  if (!taskDetail) {
    return 0;
  }

  return taskDetail.runs.filter((run) => run.status === "failed").length;
}

function countRecordedRetryAttempts(
  priorState?: BillingProtectionState | null,
  sourceExecutionPacketId?: string | null
) {
  if (!priorState || !sourceExecutionPacketId) {
    return 0;
  }

  return priorState.chargeEvents.filter(
    (event) =>
      event.sourceExecutionPacketId === sourceExecutionPacketId &&
      event.retryAttempt !== null
  ).length;
}

export function buildRetryDecision(args: {
  governancePolicy: GovernancePolicy;
  executionPacket: ExecutionPacket;
  failureClassification: FailureClassification | null;
  taskDetail?: BuildRoomTaskDetail | null;
  priorState?: BillingProtectionState | null;
}): RetryDecision | null {
  if (!args.failureClassification) {
    return null;
  }

  const maxRetries = args.governancePolicy.billingProtection.maxSystemRetriesPerStep;
  const failedRuns = countFailedRuns(args.taskDetail);
  const recordedAttempts = countRecordedRetryAttempts(
    args.priorState,
    args.executionPacket.executionPacketId
  );
  const retryAttempts = Math.max(failedRuns, recordedAttempts);
  const remainingRetries = Math.max(maxRetries - retryAttempts, 0);
  const isTransientSystemFailure =
    args.failureClassification.systemCaused &&
    args.failureClassification.retryEligible &&
    args.failureClassification.class !== "planner_loop" &&
    args.failureClassification.class !== "schema_failure" &&
    args.failureClassification.class !== "tool_contract_failure";

  if (!isTransientSystemFailure) {
    return retryDecisionSchema.parse({
      action:
        args.failureClassification.class === "planner_loop" ||
        args.executionPacket.riskLevel === "high"
          ? "require_review"
          : "none",
      reason:
        args.failureClassification.reason ||
        "This outcome is not eligible for an automatic retry.",
      retryEligible: false,
      maxRetries,
      remainingRetries,
      nextDelayMs: null,
      billableOnRetry: false,
      requiresHumanReview:
        args.failureClassification.class === "planner_loop" ||
        args.executionPacket.riskLevel === "high"
    });
  }

  if (args.executionPacket.riskLevel === "high") {
    return retryDecisionSchema.parse({
      action: "require_review",
      reason:
        "The failure is retry-eligible, but the governed risk level requires review before Neroa spends another attempt.",
      retryEligible: true,
      maxRetries,
      remainingRetries,
      nextDelayMs: null,
      billableOnRetry: false,
      requiresHumanReview: true
    });
  }

  if (remainingRetries <= 0) {
    return retryDecisionSchema.parse({
      action: "stop_auto_retry",
      reason:
        "Automatic retry capacity is exhausted for this governed step.",
      retryEligible: true,
      maxRetries,
      remainingRetries,
      nextDelayMs: null,
      billableOnRetry: false,
      requiresHumanReview: true
    });
  }

  return retryDecisionSchema.parse({
    action: "auto_retry",
    reason:
      "The failure looks transient and still stays within the protected retry allowance.",
    retryEligible: true,
    maxRetries,
    remainingRetries,
    nextDelayMs: Math.min(remainingRetries, 3) * 30000,
    billableOnRetry: false,
    requiresHumanReview: false
  });
}
