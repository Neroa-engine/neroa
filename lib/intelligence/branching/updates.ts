import { ARCHITECTURE_CONFIDENCE_THRESHOLDS } from "@/lib/governance";
import type { ExtractionState } from "@/lib/intelligence/extraction";
import { classifyBranchesFromExtractionState } from "./classify";
import {
  createBranchRecordId,
  nowIso,
  toUnitIntervalConfidence
} from "./helpers";
import { detectBranchShift } from "./shifts";
import type {
  BranchAmbiguitySeverity,
  BranchCandidate,
  BranchClassificationOptions,
  BranchClassificationResult,
  BranchConflictInput,
  ResolveBranchAmbiguityInput
} from "./types";

const AMBIGUITY_SEVERITY_RANK: Record<BranchAmbiguitySeverity, number> = {
  none: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4
};

function maxAmbiguitySeverity(
  left: BranchAmbiguitySeverity,
  right: BranchAmbiguitySeverity
) {
  return AMBIGUITY_SEVERITY_RANK[left] >= AMBIGUITY_SEVERITY_RANK[right] ? left : right;
}

function replacePrimaryCandidate(
  result: BranchClassificationResult,
  selectedPrimaryBranch: BranchCandidate
) {
  const currentPrimary = result.primaryBranch;
  const secondaries = result.secondaryBranches.filter(
    (candidate) => candidate.branch !== selectedPrimaryBranch.branch
  );

  if (currentPrimary && currentPrimary.branch !== selectedPrimaryBranch.branch) {
    secondaries.unshift(currentPrimary);
  }

  return {
    primaryBranch: selectedPrimaryBranch,
    secondaryBranches: secondaries.slice(0, 3)
  };
}

export function updateBranchClassificationWithEvidence(
  state: ExtractionState,
  previous?: BranchClassificationResult | null,
  options?: Omit<BranchClassificationOptions, "previous">
) {
  return classifyBranchesFromExtractionState(state, {
    previous: previous ?? undefined,
    updatedBy: options?.updatedBy,
    updateReason:
      options?.updateReason ?? "Updated branch classification from new extraction evidence."
  });
}

export function updateOverlayActivationsWithEvidence(
  state: ExtractionState,
  previous?: BranchClassificationResult | null,
  options?: Omit<BranchClassificationOptions, "previous">
) {
  return updateBranchClassificationWithEvidence(state, previous, {
    updatedBy: options?.updatedBy,
    updateReason:
      options?.updateReason ?? "Recalculated overlay activations from new extraction evidence."
  });
}

export function recalculateBranchClassification(
  state: ExtractionState,
  previous?: BranchClassificationResult | null,
  options?: Omit<BranchClassificationOptions, "previous">
) {
  return updateBranchClassificationWithEvidence(state, previous, {
    updatedBy: options?.updatedBy,
    updateReason: options?.updateReason ?? "Recalculated branch classification."
  });
}

export function resolveBranchAmbiguity(
  result: BranchClassificationResult,
  input: ResolveBranchAmbiguityInput
) {
  const selectedPrimary =
    result.primaryBranch?.branch === input.selectedPrimaryBranch
      ? result.primaryBranch
      : result.secondaryBranches.find(
          (candidate) => candidate.branch === input.selectedPrimaryBranch
        ) ?? {
          branch: input.selectedPrimaryBranch,
          rawScore: result.primaryBranch?.rawScore ?? 1,
          confidence: toUnitIntervalConfidence(0.76),
          rationale: "Primary branch was resolved manually after reviewing ambiguity.",
          signalIds: []
        };

  const replacement = replacePrimaryCandidate(result, selectedPrimary);
  const next = {
    ...result,
    ...replacement,
    branchStability:
      replacement.primaryBranch.confidence.score >= 0.72 ? "Stable" : "Unstable",
    ambiguity: {
      ...result.ambiguity,
      severity: input.reducedSeverity ?? "low",
      reason: input.reason,
      branchResolutionRequired: false,
      blocksRoadmap: false,
      missingInformationNeeded: [],
      competingBranches: [replacement.primaryBranch, ...replacement.secondaryBranches]
    },
    branchResolutionRequired: false,
    blockers: result.blockers.filter((blocker) => blocker.blockerId !== "branch-ambiguity"),
    roadmapReadiness: {
      ...result.roadmapReadiness,
      state:
        replacement.primaryBranch.confidence.score >=
        ARCHITECTURE_CONFIDENCE_THRESHOLDS.roadmapBranchCertaintyMinimum / 100
          ? "provisional"
          : result.roadmapReadiness.state,
      ready: false,
      confidence: replacement.primaryBranch.confidence,
      blockers: result.blockers
        .filter((blocker) => blocker.blockerId !== "branch-ambiguity")
        .filter((blocker) => blocker.blocksRoadmap)
        .map((blocker) => blocker.reason),
      missingInformationNeeded: []
    },
    lastUpdate: {
      updatedAt: nowIso(),
      updatedBy: input.preparedBy,
      updateReason: input.reason
    }
  } satisfies BranchClassificationResult;
  const shift = detectBranchShift(result, next);

  next.history = [
    ...result.history,
    {
      at: nowIso(),
      reason: input.reason,
      previousPrimaryBranch: result.primaryBranch?.branch ?? null,
      nextPrimaryBranch: next.primaryBranch?.branch ?? null,
      previousAmbiguitySeverity: result.ambiguity.severity,
      nextAmbiguitySeverity: next.ambiguity.severity,
      shiftLevel: shift.level
    }
  ];

  return next;
}

export function recordBranchConflict(
  result: BranchClassificationResult,
  input: BranchConflictInput
) {
  const severity = maxAmbiguitySeverity(result.ambiguity.severity, input.severity ?? "high");
  const competingBranches = [
    ...(result.primaryBranch ? [result.primaryBranch] : []),
    ...result.secondaryBranches
  ].filter((candidate) => input.competingBranches.includes(candidate.branch));
  const conflictBlockerId =
    input.id ?? createBranchRecordId("branch-conflict", input.reason);
  const next = {
    ...result,
    ambiguity: {
      ...result.ambiguity,
      severity,
      reason: input.reason,
      branchResolutionRequired: true,
      blocksRoadmap: true,
      competingBranches:
        competingBranches.length > 0 ? competingBranches : result.ambiguity.competingBranches,
      missingInformationNeeded:
        input.missingInformationNeeded ?? result.ambiguity.missingInformationNeeded,
      recommendedQuestionTarget:
        input.recommendedQuestionTarget ?? result.ambiguity.recommendedQuestionTarget
    },
    branchResolutionRequired: true,
    branchStability: "Unstable",
    blockers: [
      ...result.blockers.filter((blocker) => blocker.blockerId !== conflictBlockerId),
      {
        blockerId: conflictBlockerId,
        severity: severity === "critical" ? "critical" : "high",
        reason: input.reason,
        linkedFieldKeys: [],
        linkedCategoryKeys: ["branch_product_type"],
        missingInformationNeeded:
          input.missingInformationNeeded ?? result.ambiguity.missingInformationNeeded,
        recommendedQuestionTarget:
          input.recommendedQuestionTarget ?? result.ambiguity.recommendedQuestionTarget,
        blocksRoadmap: true
      }
    ],
    roadmapReadiness: {
      ...result.roadmapReadiness,
      state: "blocked",
      ready: false,
      blockers: [...result.roadmapReadiness.blockers, input.reason],
      missingInformationNeeded:
        input.missingInformationNeeded ?? result.roadmapReadiness.missingInformationNeeded,
      recommendedQuestionTarget:
        input.recommendedQuestionTarget ?? result.roadmapReadiness.recommendedQuestionTarget
    },
    lastUpdate: {
      updatedAt: nowIso(),
      updatedBy: input.preparedBy,
      updateReason: input.reason
    }
  } satisfies BranchClassificationResult;
  const shift = detectBranchShift(result, next);

  next.history = [
    ...result.history,
    {
      at: nowIso(),
      reason: input.reason,
      previousPrimaryBranch: result.primaryBranch?.branch ?? null,
      nextPrimaryBranch: next.primaryBranch?.branch ?? null,
      previousAmbiguitySeverity: result.ambiguity.severity,
      nextAmbiguitySeverity: next.ambiguity.severity,
      shiftLevel: shift.level
    }
  ];

  return next;
}
