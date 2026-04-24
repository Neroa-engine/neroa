import { classifyBranchesFromExtractionState } from "@/lib/intelligence/branching";
import { buildQuestionCandidates } from "./candidates";
import {
  createLastUpdateMetadata,
  createQuestionRecordId,
  evaluateSuppression
} from "./helpers";
import { canMoveTowardExecution, canMoveTowardRoadmap } from "./readiness";
import type {
  QuestionCandidate,
  QuestionSelectionCandidateContext,
  QuestionSelectionInput,
  QuestionSelectionResult
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

function sortCandidates(candidates: QuestionCandidate[]) {
  return [...candidates].sort((left, right) => {
    if (right.priorityScore !== left.priorityScore) {
      return right.priorityScore - left.priorityScore;
    }

    if (right.expectedConfidenceGain.score !== left.expectedConfidenceGain.score) {
      return right.expectedConfidenceGain.score - left.expectedConfidenceGain.score;
    }

    return left.target.targetId.localeCompare(right.target.targetId);
  });
}

function applySuppression(
  context: QuestionSelectionCandidateContext,
  candidates: QuestionCandidate[]
) {
  return candidates.map((candidate) => {
    const suppression = evaluateSuppression(context, candidate);

    return {
      ...candidate,
      status: suppression.suppressed ? ("suppressed" as const) : ("selectable" as const),
      suppressionReasons: suppression.reasons
    } satisfies QuestionCandidate;
  });
}

function buildSelectionId(input: QuestionSelectionInput) {
  const seed =
    input.extractionState.requestSummary.requestedChangeOrInitiative ||
    input.extractionState.requestSummary.desiredOutcome ||
    input.extractionState.requestSummary.requestId ||
    "question-selection";

  return createQuestionRecordId("question-selection", seed);
}

export function createQuestionSelectionContext(
  input: QuestionSelectionInput
): QuestionSelectionCandidateContext {
  return {
    id: input.id,
    date: input.date,
    preparedBy: input.preparedBy ?? "Question Selection Engine v1",
    extractionState: input.extractionState,
    branchClassification:
      input.branchClassification ??
      classifyBranchesFromExtractionState(input.extractionState, {
        updatedBy: input.preparedBy,
        updateReason: "Derived branch classification for question selection."
      }),
    history: input.history ?? [],
    currentStage: input.currentStage ?? "extraction",
    lastResponseSignal: input.lastResponseSignal
  };
}

export function selectNextQuestion(
  input: QuestionSelectionInput
): QuestionSelectionResult {
  const context = createQuestionSelectionContext(input);
  const rawCandidates = buildQuestionCandidates(context);
  const candidatesWithSuppression = sortCandidates(
    applySuppression(context, rawCandidates)
  );
  const candidatePool = candidatesWithSuppression.filter(
    (candidate) => candidate.status === "selectable"
  );
  const suppressedCandidates = candidatesWithSuppression.filter(
    (candidate) => candidate.status === "suppressed"
  );
  const roadmapBlockingQuestions = sortCandidates(
    candidatesWithSuppression.filter((candidate) => candidate.blocksRoadmapMovement)
  );
  const executionBlockingQuestions = sortCandidates(
    candidatesWithSuppression.filter((candidate) => candidate.blocksExecutionMovement)
  );
  const roadmapGate = canMoveTowardRoadmap({
    context,
    candidates: candidatesWithSuppression
  });
  const executionGate = canMoveTowardExecution({
    context,
    candidates: candidatesWithSuppression
  });
  const selectedQuestion = candidatePool[0] ?? null;

  return {
    id: buildSelectionId(input),
    date: nowIso(),
    preparedBy: context.preparedBy,
    version: 1,
    selectedQuestion,
    selectedQuestionTarget: selectedQuestion?.target ?? null,
    selectedQuestionType: selectedQuestion?.questionType ?? null,
    whyChosen:
      selectedQuestion?.whyChosen ??
      (roadmapGate.canMove && executionGate.canMove
        ? "No blocking question remains; the current truth is ready to move forward."
        : null),
    priorityScore: selectedQuestion?.priorityScore ?? null,
    blockingReason: selectedQuestion?.blockingReason,
    relatedFieldKeys: selectedQuestion?.relatedFieldKeys ?? [],
    relatedCategoryKeys: selectedQuestion?.relatedCategoryKeys ?? [],
    relatedAssumptionIds: selectedQuestion?.relatedAssumptionIds ?? [],
    relatedContradictionIds: selectedQuestion?.relatedContradictionIds ?? [],
    relatedUnknownIds: selectedQuestion?.relatedUnknownIds ?? [],
    branchResolutionRelevant: selectedQuestion?.branchResolutionRelevant ?? false,
    roadmapReadinessRelevant: selectedQuestion?.roadmapReadinessRelevant ?? false,
    executionReadinessRelevant: selectedQuestion?.executionReadinessRelevant ?? false,
    followUpMode: selectedQuestion?.followUpMode ?? null,
    sourceIds: selectedQuestion?.sourceIds ?? [],
    evidenceIds: selectedQuestion?.evidenceIds ?? [],
    candidatePool,
    suppressedCandidates,
    roadmapBlockingQuestions,
    executionBlockingQuestions,
    roadmapGate,
    executionGate,
    lastUpdate: createLastUpdateMetadata(
      "Selected next deterministic question candidate.",
      context.preparedBy
    )
  };
}
