import {
  completionReadinessSchema,
  releaseDecisionSchema,
  type CompletionReadiness,
  type QAReviewRecord,
  type ReleaseDecision
} from "./types.ts";

function uniqueStrings(values: readonly string[]) {
  return Array.from(
    new Set(
      values
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

export function buildCompletionReadiness(args: {
  runFinished: boolean;
  artifactsSatisfied: boolean;
  acceptanceSatisfied: boolean;
  governanceQASatisfied: boolean;
  reviewRecord: QAReviewRecord | null;
  blockers: readonly string[];
  scopeStillApproved: boolean;
  hasExecutionFailure: boolean;
}) {
  const blockers = uniqueStrings(args.blockers);
  const reviewPending =
    args.reviewRecord?.status === "pending_human_review";
  const reviewRejected = args.reviewRecord?.status === "rejected";
  const reviewRequired =
    args.reviewRecord?.reviewKind !== undefined &&
    args.reviewRecord.reviewKind !== "automated";
  const status: CompletionReadiness["status"] = !args.scopeStillApproved
    ? "not_ready"
    : args.hasExecutionFailure
      ? "failed"
      : !args.runFinished
        ? "awaiting_run_completion"
        : !args.artifactsSatisfied
          ? "awaiting_artifacts"
          : !args.acceptanceSatisfied || reviewRejected
            ? "remediation_required"
            : reviewPending
              ? "awaiting_review"
              : args.governanceQASatisfied
                ? "release_ready"
                : "awaiting_review";
  const releaseReady = status === "release_ready";
  const reason =
    blockers[0] ??
    (releaseReady
      ? "Required artifacts, acceptance checks, and review rules are satisfied."
      : status === "awaiting_run_completion"
        ? "The task has not reached a completed run state yet."
        : status === "awaiting_artifacts"
          ? "A completed run exists, but required QA artifacts are still missing."
          : status === "awaiting_review"
            ? "The task is waiting on the remaining QA or human review step."
            : status === "failed"
              ? "The latest run failed, so this task is not ready for release."
              : "The task still needs remediation before it can be release-ready.");

  const completionReadiness = completionReadinessSchema.parse({
    status,
    runFinished: args.runFinished,
    artifactsSatisfied: args.artifactsSatisfied,
    acceptanceSatisfied: args.acceptanceSatisfied,
    governanceQASatisfied: args.governanceQASatisfied,
    releaseReady,
    blockers,
    reason
  }) satisfies CompletionReadiness;

  const releaseDecisionStatus: ReleaseDecision["status"] =
    status === "release_ready"
      ? "release_ready"
      : status === "awaiting_artifacts"
        ? "awaiting_artifacts"
        : status === "awaiting_review" || status === "not_ready"
          ? "awaiting_review"
          : status === "awaiting_run_completion"
            ? "blocked"
            : "remediation_required";
  const releaseDecision = releaseDecisionSchema.parse({
    status: releaseDecisionStatus,
    canPresentAsComplete: releaseReady,
    canMarkReleaseReady: releaseReady,
    requiresRemediation:
      status === "failed" ||
      status === "remediation_required" ||
      status === "awaiting_artifacts",
    requiresHumanReview: reviewRequired && !releaseReady,
    blockerIds: blockers,
    nextAction: releaseReady
      ? "Present the task as complete and keep the current release-ready evidence attached."
      : !args.scopeStillApproved
        ? "Return to Strategy Room or governance review before treating this task as complete."
        : status === "awaiting_run_completion"
          ? "Wait for the existing Build Room run to finish before QA can complete."
          : status === "awaiting_artifacts"
            ? "Collect the missing QA artifacts or reroute remediation through the existing execution path."
            : status === "awaiting_review"
              ? "Add the required review evidence before marking this task as accepted."
              : "Route remediation back through the existing execution path before trying to mark the task complete.",
    nextSurface: releaseReady
      ? "command_center"
      : !args.scopeStillApproved
        ? "strategy_room"
        : "build_room"
  }) satisfies ReleaseDecision;

  return {
    completionReadiness,
    releaseDecision
  };
}
