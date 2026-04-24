import { classifyBranchesFromExtractionState } from "@/lib/intelligence/branching";
import {
  addDirectAnswerToField,
  createContradictionExample,
  createEarlyWeakInputExample,
  createEmptyExtractionState,
  createPartialEcommerceTruthExample,
  markFieldPartial
} from "@/lib/intelligence/extraction";
import { recalculateNextQuestion, selectInitialNextQuestion } from "./updates";
import type { QuestionSelectionHistoryEntry } from "./types";

function nowIso() {
  return new Date().toISOString();
}

function withMessageSource(label: string, excerpt: string) {
  return {
    kind: "message" as const,
    label,
    excerpt
  };
}

export function createWeakInputQuestionExample() {
  const extractionState = createEarlyWeakInputExample();
  const branchClassification = classifyBranchesFromExtractionState(extractionState, {
    updatedBy: "Question Engine Example",
    updateReason: "Derived branch state for weak-input question example."
  });

  return selectInitialNextQuestion({
    extractionState,
    branchClassification,
    preparedBy: "Question Engine Example"
  });
}

export function createPartialEcommerceNarrowingExample() {
  const extractionState = createPartialEcommerceTruthExample();
  const branchClassification = classifyBranchesFromExtractionState(extractionState, {
    updatedBy: "Question Engine Example",
    updateReason: "Derived branch state for partial ecommerce question example."
  });

  return selectInitialNextQuestion({
    extractionState,
    branchClassification,
    preparedBy: "Question Engine Example"
  });
}

export function createSaasActorWorkflowGapExample() {
  let extractionState = createEmptyExtractionState({
    preparedBy: "Question Engine Example",
    requestSummary: {
      requestedChangeOrInitiative:
        "Build a SaaS workflow platform for agencies to manage client delivery."
    }
  });

  extractionState = addDirectAnswerToField(extractionState, {
    fieldKey: "request_summary",
    value: {
      kind: "text",
      summary: "Build a SaaS workflow platform for agencies to manage client delivery."
    },
    confidenceScore: 0.94,
    source: withMessageSource(
      "SaaS request",
      "Build a SaaS workflow platform for agencies to manage client delivery."
    ),
    evidenceSummary: "The request clearly describes a SaaS workflow platform."
  });

  extractionState = addDirectAnswerToField(extractionState, {
    fieldKey: "primary_branch",
    value: {
      kind: "text",
      summary: "SaaS / Workflow Platform"
    },
    confidenceScore: 0.92,
    source: withMessageSource(
      "Branch",
      "It is definitely a SaaS workflow platform."
    ),
    evidenceSummary: "The branch is explicit."
  });

  extractionState = markFieldPartial(extractionState, {
    fieldKey: "primary_users",
    value: {
      kind: "list",
      summary: "agency operators",
      items: ["agency operators"]
    },
    confidenceScore: 0.62,
    source: withMessageSource(
      "Actors",
      "Agency operators will definitely use it."
    ),
    evidenceSummary: "One actor is known, but role coverage is still incomplete."
  });

  extractionState = addDirectAnswerToField(extractionState, {
    fieldKey: "desired_outcome",
    value: {
      kind: "text",
      summary: "Replace spreadsheet-based delivery tracking with one system."
    },
    confidenceScore: 0.86,
    source: withMessageSource(
      "Outcome",
      "Replace spreadsheet-based delivery tracking with one system."
    ),
    evidenceSummary: "Desired outcome is clear."
  });

  const branchClassification = classifyBranchesFromExtractionState(extractionState, {
    updatedBy: "Question Engine Example",
    updateReason: "Derived branch state for SaaS actor/workflow gap example."
  });

  return selectInitialNextQuestion({
    extractionState,
    branchClassification,
    preparedBy: "Question Engine Example"
  });
}

export function createBranchAmbiguityQuestionExample() {
  let extractionState = createEmptyExtractionState({
    preparedBy: "Question Engine Example",
    requestSummary: {
      requestedChangeOrInitiative:
        "Build a platform where customers discover service providers and book appointments."
    }
  });

  extractionState = addDirectAnswerToField(extractionState, {
    fieldKey: "request_summary",
    value: {
      kind: "text",
      summary:
        "Build a platform where customers discover service providers and book appointments."
    },
    confidenceScore: 0.94,
    source: withMessageSource(
      "Ambiguity request",
      "Build a platform where customers discover service providers and book appointments."
    ),
    evidenceSummary: "The request mixes provider matching with booking behavior."
  });

  extractionState = addDirectAnswerToField(extractionState, {
    fieldKey: "primary_users",
    value: {
      kind: "list",
      summary: "customers, service providers",
      items: ["customers", "service providers"]
    },
    confidenceScore: 0.87,
    source: withMessageSource(
      "Actors",
      "The main users are customers and service providers."
    ),
    evidenceSummary: "Demand-side and supply-side roles are explicit."
  });

  extractionState = addDirectAnswerToField(extractionState, {
    fieldKey: "core_workflow",
    value: {
      kind: "text",
      summary:
        "Customers browse providers, compare listings, then book appointment slots."
    },
    confidenceScore: 0.9,
    source: withMessageSource(
      "Workflow",
      "Customers browse providers, compare listings, then book appointment slots."
    ),
    evidenceSummary: "Workflow combines matching and booking."
  });

  extractionState = addDirectAnswerToField(extractionState, {
    fieldKey: "business_model",
    value: {
      kind: "text",
      summary: "Charge a take rate on completed bookings."
    },
    confidenceScore: 0.85,
    source: withMessageSource(
      "Business model",
      "Charge a take rate on completed bookings."
    ),
    evidenceSummary: "Marketplace economics are present."
  });

  const branchClassification = classifyBranchesFromExtractionState(extractionState, {
    updatedBy: "Question Engine Example",
    updateReason: "Derived branch state for ambiguity question example."
  });

  return selectInitialNextQuestion({
    extractionState,
    branchClassification,
    preparedBy: "Question Engine Example"
  });
}

export function createContradictionBlockingRoadmapQuestionExample() {
  const extractionState = createContradictionExample();
  const branchClassification = classifyBranchesFromExtractionState(extractionState, {
    updatedBy: "Question Engine Example",
    updateReason: "Derived branch state for contradiction question example."
  });

  return selectInitialNextQuestion({
    extractionState,
    branchClassification,
    preparedBy: "Question Engine Example"
  });
}

export function createRepeatedAnswerSuppressionExample() {
  const extractionState = createPartialEcommerceTruthExample();
  const branchClassification = classifyBranchesFromExtractionState(extractionState, {
    updatedBy: "Question Engine Example",
    updateReason: "Derived branch state for repetition-suppression example."
  });
  const first = selectInitialNextQuestion({
    extractionState,
    branchClassification,
    preparedBy: "Question Engine Example"
  });
  const selected = first.selectedQuestion;
  const history: QuestionSelectionHistoryEntry[] = selected
    ? [
        {
          id: "history-repeat-1",
          date: nowIso(),
          preparedBy: "Question Engine Example",
          targetId: selected.target.targetId,
          questionType: selected.questionType,
          askedAt: nowIso(),
          responseSignal: "does_not_know",
          outcome: "no_change",
          relatedFieldKeys: selected.relatedFieldKeys,
          relatedCategoryKeys: selected.relatedCategoryKeys,
          fieldStatusSnapshot: Object.fromEntries(
            selected.relatedFieldKeys.map((fieldKey) => [
              fieldKey,
              extractionState.fields[fieldKey].status
            ])
          ),
          notes: "The user stayed uncertain, so the next pass should suppress direct repetition."
        }
      ]
    : [];
  const second = recalculateNextQuestion(extractionState, {
    branchClassification,
    history,
    lastResponseSignal: "does_not_know",
    preparedBy: "Question Engine Example",
    updateReason: "Recalculated after a repeated uncertain answer."
  });

  return {
    first,
    second
  };
}

export const QUESTION_SELECTION_ENGINE_EXAMPLES = {
  weakInput: createWeakInputQuestionExample(),
  partialEcommerce: createPartialEcommerceNarrowingExample(),
  saasActorWorkflowGap: createSaasActorWorkflowGapExample(),
  branchAmbiguity: createBranchAmbiguityQuestionExample(),
  contradictionBlockingRoadmap: createContradictionBlockingRoadmapQuestionExample(),
  repeatedAnswerSuppression: createRepeatedAnswerSuppressionExample()
};
