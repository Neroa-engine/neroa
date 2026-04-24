import {
  recalculateNextQuestion,
  selectInitialNextQuestion,
  type QuestionResponseSignal,
  type QuestionSelectionHistoryEntry,
  type QuestionSelectionStage,
  type QuestionSelectionResult
} from "@/lib/intelligence/questions";
import type { BranchClassificationResult } from "@/lib/intelligence/branching";
import type { ExtractionState } from "@/lib/intelligence/extraction";
import type { QuestionAdapterResult } from "./types";

function dedupe<T>(values: readonly T[]) {
  return [...new Set(values)];
}

export function recalculateQuestionSelectionFromStates(args: {
  extractionState: ExtractionState;
  branchState: BranchClassificationResult;
  questionHistory?: QuestionSelectionHistoryEntry[];
  lastResponseSignal?: QuestionResponseSignal;
  currentStage?: QuestionSelectionStage;
  updatedBy?: string;
}) {
  const hasHistory = (args.questionHistory?.length ?? 0) > 0;
  const questionSelection: QuestionSelectionResult = hasHistory
    ? recalculateNextQuestion(args.extractionState, {
        branchClassification: args.branchState,
        history: args.questionHistory,
        lastResponseSignal: args.lastResponseSignal,
        currentStage: args.currentStage,
        preparedBy: args.updatedBy,
        updateReason: "Recalculated next question after conversation artifact processing."
      })
    : selectInitialNextQuestion({
        extractionState: args.extractionState,
        branchClassification: args.branchState,
        history: args.questionHistory,
        lastResponseSignal: args.lastResponseSignal,
        currentStage: args.currentStage,
        preparedBy: args.updatedBy
      });
  const warnings: string[] = [];

  if (
    !questionSelection.selectedQuestion &&
    (!questionSelection.roadmapGate.canMove || !questionSelection.executionGate.canMove)
  ) {
    warnings.push("Question selection found blockers but no active next question candidate.");
  }

  return {
    questionSelection,
    questionHistory: args.questionHistory ?? [],
    warnings: dedupe(warnings)
  } satisfies QuestionAdapterResult;
}
