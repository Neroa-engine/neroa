import { createQuestionConfidence, dedupe } from "./helpers";
import type {
  QuestionCandidate,
  QuestionReadinessGate,
  QuestionSelectionCandidateContext
} from "./types";
import {
  evaluateRoadmapGenerationReadiness,
  evaluateWorkspaceHandoffReadiness
} from "@/lib/intelligence/contracts";

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function deriveGateState(args: {
  canMove: boolean;
  blocked: boolean;
  hasProvisionalSignal: boolean;
}) {
  if (args.blocked) {
    return "blocked" as const;
  }

  if (args.canMove) {
    return "ready" as const;
  }

  if (args.hasProvisionalSignal) {
    return "provisional" as const;
  }

  return "not_ready" as const;
}

function buildBlockingReasons(args: {
  candidateReasons: string[];
  extractionReasons: string[];
  branchReasons: string[];
}) {
  return dedupe([
    ...args.extractionReasons,
    ...args.branchReasons,
    ...args.candidateReasons
  ]).filter(Boolean);
}

function buildBlockingIds(
  candidates: QuestionCandidate[],
  stage: "roadmap" | "execution"
) {
  const stageBlockers = candidates.filter((candidate) =>
    stage === "roadmap"
      ? candidate.blocksRoadmapMovement
      : candidate.blocksExecutionMovement
  );

  return {
    questionIds: dedupe(stageBlockers.map((candidate) => candidate.questionId)),
    targetIds: dedupe(stageBlockers.map((candidate) => candidate.target.targetId)),
    reasons: dedupe(
      stageBlockers
        .map((candidate) => candidate.blockingReason ?? candidate.whyChosen)
        .filter(Boolean)
    )
  };
}

export function canMoveTowardRoadmap(args: {
  context: QuestionSelectionCandidateContext;
  candidates: QuestionCandidate[];
}): QuestionReadinessGate {
  const candidateBlockers = buildBlockingIds(args.candidates, "roadmap");
  const extraction = evaluateRoadmapGenerationReadiness(args.context.extractionState);
  const branch = args.context.branchClassification.roadmapReadiness;
  const canMove =
    extraction.ready &&
    branch.ready &&
    candidateBlockers.questionIds.length === 0;
  const blocked =
    extraction.state === "blocked" ||
    branch.state === "blocked" ||
    candidateBlockers.questionIds.length > 0;
  const state = deriveGateState({
    canMove,
    blocked,
    hasProvisionalSignal:
      extraction.state === "provisional" ||
      extraction.state === "ready" ||
      branch.state === "provisional" ||
      branch.state === "ready"
  });

  return {
    stage: "roadmap",
    canMove,
    state,
    confidence: createQuestionConfidence(
      average([extraction.confidenceScore, branch.confidence.score]),
      "Combined roadmap readiness confidence from extraction and branch state."
    ),
    blockingQuestionIds: candidateBlockers.questionIds,
    blockingTargetIds: candidateBlockers.targetIds,
    reasons: buildBlockingReasons({
      candidateReasons: candidateBlockers.reasons,
      extractionReasons: extraction.reasons,
      branchReasons: branch.blockers
    })
  };
}

export function canMoveTowardExecution(args: {
  context: QuestionSelectionCandidateContext;
  candidates: QuestionCandidate[];
}): QuestionReadinessGate {
  const candidateBlockers = buildBlockingIds(args.candidates, "execution");
  const extraction = evaluateWorkspaceHandoffReadiness(args.context.extractionState);
  const branchStable =
    args.context.branchClassification.branchStability === "Stable" &&
    !args.context.branchClassification.branchResolutionRequired;
  const branchConfidence =
    args.context.branchClassification.primaryBranch?.confidence.score ?? 0;
  const canMove =
    extraction.ready &&
    branchStable &&
    candidateBlockers.questionIds.length === 0;
  const blocked =
    extraction.state === "blocked" ||
    !branchStable ||
    candidateBlockers.questionIds.length > 0;
  const state = deriveGateState({
    canMove,
    blocked,
    hasProvisionalSignal:
      extraction.state === "provisional" ||
      extraction.state === "ready" ||
      branchStable
  });

  return {
    stage: "execution",
    canMove,
    state,
    confidence: createQuestionConfidence(
      average([extraction.confidenceScore, branchConfidence]),
      "Combined execution readiness confidence from extraction and branch stability."
    ),
    blockingQuestionIds: candidateBlockers.questionIds,
    blockingTargetIds: candidateBlockers.targetIds,
    reasons: buildBlockingReasons({
      candidateReasons: candidateBlockers.reasons,
      extractionReasons: extraction.reasons,
      branchReasons: branchStable
        ? []
        : [
            "Branch classification is still unstable, so execution should not move yet."
          ]
    })
  };
}
