import type { ExtractionState } from "@/lib/intelligence/extraction";
import { createLastUpdateMetadata } from "./helpers";
import { selectNextQuestion } from "./select";
import type {
  QuestionSelectionInput,
  QuestionSelectionRecalculationOptions,
  QuestionSelectionResult
} from "./types";

function withEnginePreparedBy(preparedBy?: string) {
  return preparedBy ?? "Question Selection Engine v1";
}

function applyUpdateMetadata(args: {
  result: QuestionSelectionResult;
  updateReason?: string;
  updatedBy?: string;
}) {
  if (!args.updateReason) {
    return args.result;
  }

  return {
    ...args.result,
    lastUpdate: createLastUpdateMetadata(
      args.updateReason,
      withEnginePreparedBy(args.updatedBy)
    )
  };
}

export function selectInitialNextQuestion(
  input: QuestionSelectionInput
): QuestionSelectionResult {
  return selectNextQuestion({
    ...input,
    preparedBy: withEnginePreparedBy(input.preparedBy)
  });
}

export function recalculateNextQuestion(
  extractionState: ExtractionState,
  options?: QuestionSelectionRecalculationOptions
) {
  const { updateReason, ...selectionOptions } = options ?? {};

  return applyUpdateMetadata({
    result: selectNextQuestion({
      ...selectionOptions,
      extractionState,
      preparedBy: withEnginePreparedBy(selectionOptions.preparedBy)
    }),
    updateReason,
    updatedBy: selectionOptions.preparedBy
  });
}

export function reprioritizeAfterContradictions(
  extractionState: ExtractionState,
  options?: QuestionSelectionRecalculationOptions
) {
  return recalculateNextQuestion(extractionState, {
    ...options,
    preparedBy: withEnginePreparedBy(options?.preparedBy),
    updateReason:
      options?.updateReason ??
      "Reprioritized question selection after contradiction changes."
  });
}

export function reprioritizeAfterBranchShift(
  extractionState: ExtractionState,
  options?: QuestionSelectionRecalculationOptions
) {
  return recalculateNextQuestion(extractionState, {
    ...options,
    preparedBy: withEnginePreparedBy(options?.preparedBy),
    updateReason:
      options?.updateReason ??
      "Reprioritized question selection after branch-state changes."
  });
}

export function suppressAlreadyCoveredQuestions(
  input: QuestionSelectionInput
) {
  return selectNextQuestion({
    ...input,
    preparedBy: withEnginePreparedBy(input.preparedBy)
  });
}

export function escalateUnresolvedBlockers(
  input: QuestionSelectionInput
): QuestionSelectionResult {
  const result = selectNextQuestion({
    ...input,
    preparedBy: withEnginePreparedBy(input.preparedBy)
  });

  if (
    result.selectedQuestion ||
    (result.roadmapBlockingQuestions.length === 0 &&
      result.executionBlockingQuestions.length === 0)
  ) {
    return result;
  }

  const escalatedQuestion =
    result.roadmapBlockingQuestions[0] ?? result.executionBlockingQuestions[0] ?? null;

  return {
    ...result,
    selectedQuestion: escalatedQuestion,
    selectedQuestionTarget: escalatedQuestion?.target ?? null,
    selectedQuestionType: escalatedQuestion?.questionType ?? null,
    whyChosen: escalatedQuestion
      ? "Higher-level blockers remain unresolved, so the engine escalated the strongest blocking question even though it would otherwise be suppressed."
      : result.whyChosen,
    priorityScore: escalatedQuestion?.priorityScore ?? result.priorityScore,
    blockingReason: escalatedQuestion?.blockingReason ?? result.blockingReason,
    relatedFieldKeys: escalatedQuestion?.relatedFieldKeys ?? result.relatedFieldKeys,
    relatedCategoryKeys:
      escalatedQuestion?.relatedCategoryKeys ?? result.relatedCategoryKeys,
    relatedAssumptionIds:
      escalatedQuestion?.relatedAssumptionIds ?? result.relatedAssumptionIds,
    relatedContradictionIds:
      escalatedQuestion?.relatedContradictionIds ?? result.relatedContradictionIds,
    relatedUnknownIds:
      escalatedQuestion?.relatedUnknownIds ?? result.relatedUnknownIds,
    branchResolutionRelevant:
      escalatedQuestion?.branchResolutionRelevant ?? result.branchResolutionRelevant,
    roadmapReadinessRelevant:
      escalatedQuestion?.roadmapReadinessRelevant ?? result.roadmapReadinessRelevant,
    executionReadinessRelevant:
      escalatedQuestion?.executionReadinessRelevant ?? result.executionReadinessRelevant,
    followUpMode: escalatedQuestion?.followUpMode ?? result.followUpMode,
    sourceIds: escalatedQuestion?.sourceIds ?? result.sourceIds,
    evidenceIds: escalatedQuestion?.evidenceIds ?? result.evidenceIds,
    lastUpdate: createLastUpdateMetadata(
      "Escalated unresolved blocking question.",
      withEnginePreparedBy(input.preparedBy)
    )
  };
}
