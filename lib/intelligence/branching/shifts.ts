import { type BranchFamily } from "@/lib/governance";
import { ARCHITECTURAL_BRANCH_SHIFT_PAIRS } from "./catalog";
import { riskLevelRank } from "./helpers";
import type {
  BranchClassificationResult,
  BranchOverlayKey,
  BranchShiftAnalysis
} from "./types";

function samePair(
  left: readonly [BranchFamily, BranchFamily],
  right: readonly [BranchFamily, BranchFamily]
) {
  return (
    (left[0] === right[0] && left[1] === right[1]) ||
    (left[0] === right[1] && left[1] === right[0])
  );
}

function overlayIsActive(result: BranchClassificationResult, overlayKey: BranchOverlayKey) {
  const overlay = result.overlays[overlayKey];
  return overlay.state === "active" || overlay.state === "high-confidence active";
}

function listOverlayDiff(
  previous: BranchClassificationResult,
  next: BranchClassificationResult
) {
  const keys = Object.keys(next.overlays) as BranchOverlayKey[];
  const overlaysAdded = keys.filter(
    (overlayKey) => overlayIsActive(next, overlayKey) && !overlayIsActive(previous, overlayKey)
  );
  const overlaysRemoved = keys.filter(
    (overlayKey) => overlayIsActive(previous, overlayKey) && !overlayIsActive(next, overlayKey)
  );

  return { overlaysAdded, overlaysRemoved };
}

function complexityDelta(previous: BranchClassificationResult, next: BranchClassificationResult) {
  const pairs = [
    [previous.architectureHints.likelyRoleComplexity, next.architectureHints.likelyRoleComplexity],
    [
      previous.architectureHints.likelyTrustSensitivity,
      next.architectureHints.likelyTrustSensitivity
    ],
    [
      previous.architectureHints.likelyWorkflowComplexity,
      next.architectureHints.likelyWorkflowComplexity
    ],
    [
      previous.architectureHints.likelyTransactionComplexity,
      next.architectureHints.likelyTransactionComplexity
    ]
  ] as const;

  return Math.max(
    ...pairs.map(([before, after]) => Math.abs(riskLevelRank(after) - riskLevelRank(before)))
  );
}

function isArchitecturalShiftPair(
  previousPrimaryBranch: BranchFamily | null,
  nextPrimaryBranch: BranchFamily | null
) {
  if (!previousPrimaryBranch || !nextPrimaryBranch || previousPrimaryBranch === nextPrimaryBranch) {
    return false;
  }

  return ARCHITECTURAL_BRANCH_SHIFT_PAIRS.some((pair) =>
    samePair(pair, [previousPrimaryBranch, nextPrimaryBranch])
  );
}

export function detectBranchShift(
  previous: BranchClassificationResult,
  next: BranchClassificationResult
): BranchShiftAnalysis {
  const previousPrimaryBranch = previous.primaryBranch?.branch ?? null;
  const nextPrimaryBranch = next.primaryBranch?.branch ?? null;
  const changedPrimaryBranch = previousPrimaryBranch !== nextPrimaryBranch;
  const { overlaysAdded, overlaysRemoved } = listOverlayDiff(previous, next);
  const complexityJump = complexityDelta(previous, next);
  const previousSpecialization = previous.specialization?.label ?? null;
  const nextSpecialization = next.specialization?.label ?? null;
  const communityOverlayEscalated =
    !overlayIsActive(previous, "community-ugc") && overlayIsActive(next, "community-ugc");
  const ambiguityWorsened =
    previous.ambiguity.severity !== "high" && next.ambiguity.severity === "high";

  let level: BranchShiftAnalysis["level"] = "no_meaningful_branch_shift";
  let reason = "The dominant branch shape remains materially unchanged.";

  if (
    changedPrimaryBranch &&
    (isArchitecturalShiftPair(previousPrimaryBranch, nextPrimaryBranch) ||
      complexityJump >= 2 ||
      nextPrimaryBranch === "Hybrid / Composite System")
  ) {
    level = "architectural_branch_shift";
    reason =
      "The primary branch changed in a way that materially alters role, trust, or system architecture.";
  } else if (
    changedPrimaryBranch ||
    complexityJump >= 2 ||
    communityOverlayEscalated ||
    overlaysAdded.length + overlaysRemoved.length >= 2
  ) {
    level = "significant_branch_shift";
    reason =
      "The branch shape changed enough that roadmap sequencing should be revisited before execution.";
  } else if (
    overlaysAdded.length > 0 ||
    overlaysRemoved.length > 0 ||
    previousSpecialization !== nextSpecialization ||
    ambiguityWorsened
  ) {
    level = "mild_drift";
    reason =
      "The core branch remains similar, but the shape drifted enough to merit a fresh change review.";
  }

  return {
    level,
    previousPrimaryBranch,
    nextPrimaryBranch,
    changedPrimaryBranch,
    overlaysAdded,
    overlaysRemoved,
    previousSpecialization,
    nextSpecialization,
    reason,
    triggerDeltaAnalyzer: level !== "no_meaningful_branch_shift",
    triggerRoadmapRevision:
      level === "significant_branch_shift" || level === "architectural_branch_shift"
  };
}
