import {
  createEmptyExtractionState,
  type ExtractionFieldKey,
  type ExtractionState
} from "@/lib/intelligence/extraction";
import type {
  QuestionSelectionHistoryEntry
} from "@/lib/intelligence/questions";
import { buildStrategyFrameworkOutput } from "@/lib/intelligence/strategy";
import { sortConversationArtifactsDeterministically } from "./sources";
import { recalculateBranchStateFromExtractionState } from "./branch-adapter";
import { applyNormalizedArtifactToExtractionState } from "./extraction-adapter";
import { buildArtifactDuplicateKey, createAdapterRecordId } from "./helpers";
import { normalizeConversationArtifact } from "./normalize";
import { recalculateQuestionSelectionFromStates } from "./question-adapter";
import type {
  ArtifactOrchestrationOptions,
  ConversationArtifact,
  HiddenIntelligenceBundle,
  IntelligenceTraceEntry,
  ProcessedArtifactRecord
} from "./types";

function dedupe<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function snapshotFieldStatuses(
  extractionState: ExtractionState,
  fieldKeys: readonly ExtractionFieldKey[]
) {
  return Object.fromEntries(
    fieldKeys.map((fieldKey) => [fieldKey, extractionState.fields[fieldKey].status])
  );
}

function buildQuestionHistoryEntry(args: {
  bundle: HiddenIntelligenceBundle;
  normalized: ReturnType<typeof normalizeConversationArtifact>;
  nextExtractionState: ExtractionState;
  nextBranchState: HiddenIntelligenceBundle["branchState"];
  appliedFieldKeys: ExtractionFieldKey[];
  updatedBy?: string;
}) {
  if (args.normalized.artifact.role !== "user" || !args.bundle.questionSelection.selectedQuestion) {
    return null;
  }

  const selected = args.bundle.questionSelection.selectedQuestion;
  const relatedFieldKeys = selected.relatedFieldKeys;
  const hasResolvedFields =
    relatedFieldKeys.length > 0 &&
    relatedFieldKeys.every((fieldKey) => {
      const status = args.nextExtractionState.fields[fieldKey].status;
      return status === "answered" || status === "validated";
    });
  const stillConflicting = relatedFieldKeys.some((fieldKey) => {
    const status = args.nextExtractionState.fields[fieldKey].status;
    return status === "conflicting";
  });
  const touched = relatedFieldKeys.some((fieldKey) => args.appliedFieldKeys.includes(fieldKey));
  const outcome = stillConflicting
    ? "reopened"
    : hasResolvedFields
    ? "resolved"
    : touched
    ? "partial_progress"
    : "no_change";

  return {
    id: createAdapterRecordId(
      "question-history",
      `${args.normalized.artifact.artifactId}-${selected.target.targetId}`
    ),
    date: args.normalized.artifact.createdAt,
    preparedBy: args.updatedBy,
    questionId: selected.questionId,
    targetId: selected.target.targetId,
    questionType: selected.questionType,
    askedAt: args.bundle.questionSelection.lastUpdate.updatedAt,
    responseSignal: args.normalized.responseSignal ?? "indirect",
    outcome,
    relatedFieldKeys,
    relatedCategoryKeys: selected.relatedCategoryKeys,
    fieldStatusSnapshot: snapshotFieldStatuses(args.nextExtractionState, relatedFieldKeys),
    branchAmbiguitySeverityAfter: args.nextBranchState.ambiguity.severity,
    notes:
      outcome === "resolved"
        ? "The artifact resolved the previously selected question target."
        : outcome === "partial_progress"
        ? "The artifact moved the selected question target forward but did not fully resolve it."
        : outcome === "reopened"
        ? "The artifact reopened or preserved a conflict around the selected question target."
        : "The artifact did not materially change the selected question target."
  } satisfies QuestionSelectionHistoryEntry;
}

function createTraceEntry(args: {
  bundle: HiddenIntelligenceBundle;
  artifact: ConversationArtifact;
  responseSignal: QuestionSelectionHistoryEntry["responseSignal"] | null;
  appliedFieldKeys: ExtractionFieldKey[];
  assumptionIds: string[];
  contradictionIds: string[];
  unknownIds: string[];
  nextBundle: HiddenIntelligenceBundle;
  warnings: string[];
  notes: string[];
}) {
  return {
    artifactId: args.artifact.artifactId,
    sourceSurface: args.artifact.sourceSurface,
    responseSignal: args.responseSignal,
    appliedFieldKeys: args.appliedFieldKeys,
    assumptionIds: args.assumptionIds,
    contradictionIds: args.contradictionIds,
    unknownIds: args.unknownIds,
    previousPrimaryBranch: args.bundle.branchState.primaryBranch,
    nextPrimaryBranch: args.nextBundle.branchState.primaryBranch,
    previousQuestionTargetId: args.bundle.questionSelection.selectedQuestionTarget?.targetId ?? null,
    nextQuestionTargetId: args.nextBundle.questionSelection.selectedQuestionTarget?.targetId ?? null,
    warnings: args.warnings,
    notes: args.notes
  } satisfies IntelligenceTraceEntry;
}

function createProcessedArtifactRecord(args: {
  artifact: ConversationArtifact;
  duplicateKey: string;
  responseSignal: ProcessedArtifactRecord["responseSignal"];
  sourceId: string;
  skippedAsDuplicate: boolean;
}) {
  return {
    artifactId: args.artifact.artifactId,
    duplicateKey: args.duplicateKey,
    processedAt: args.artifact.createdAt,
    responseSignal: args.responseSignal,
    sourceId: args.sourceId,
    skippedAsDuplicate: args.skippedAsDuplicate
  } satisfies ProcessedArtifactRecord;
}

export function createEmptyIntelligenceBundle(options?: ArtifactOrchestrationOptions) {
  const extractionState = createEmptyExtractionState({
    preparedBy: options?.preparedBy ?? "Conversation Artifact Adapter + Hidden State Orchestrator v1"
  });
  const branchResult = recalculateBranchStateFromExtractionState(
    extractionState,
    null,
    options?.preparedBy
  );
  const questionResult = recalculateQuestionSelectionFromStates({
    extractionState: branchResult.extractionState,
    branchState: branchResult.branchState,
    questionHistory: [],
    currentStage: options?.currentStage,
    updatedBy: options?.preparedBy
  });

  return {
    id: options?.id ?? createAdapterRecordId("intelligence-bundle", "empty"),
    date: options?.date ?? extractionState.lastUpdate.updatedAt,
    preparedBy: options?.preparedBy,
    version: 1,
    extractionState: branchResult.extractionState,
    branchState: branchResult.branchState,
    branchShiftAnalysis: null,
    questionSelection: questionResult.questionSelection,
    questionHistory: [],
    strategyFramework: buildStrategyFrameworkOutput(branchResult.extractionState),
    processedArtifacts: [],
    processedArtifactIds: [],
    processedDuplicateKeys: [],
    trace: [],
    warnings: [],
    recompute: {
      mode: options?.rebuiltFromScratch ? "rebuild" : "manual_recalc",
      processedArtifactIds: [],
      newSourceIds: [],
      newEvidenceIds: [],
      rebuiltFromScratch: !!options?.rebuiltFromScratch,
      decisionNotes: []
    },
    lastUpdate: questionResult.questionSelection.lastUpdate
  } satisfies HiddenIntelligenceBundle;
}

export function applyArtifactToIntelligenceState(
  bundle: HiddenIntelligenceBundle,
  artifact: ConversationArtifact,
  options?: ArtifactOrchestrationOptions
) {
  const duplicateKey = buildArtifactDuplicateKey(artifact);

  if (
    !options?.ignoreDuplicates &&
    (bundle.processedArtifactIds.includes(artifact.artifactId) ||
      bundle.processedDuplicateKeys.includes(duplicateKey))
  ) {
    return {
      ...bundle,
      warnings: dedupe([
        ...bundle.warnings,
        `Skipped duplicate artifact ${artifact.artifactId}.`
      ]),
      recompute: {
        ...bundle.recompute,
        decisionNotes: dedupe([
          ...bundle.recompute.decisionNotes,
          `Skipped duplicate artifact ${artifact.artifactId}.`
        ])
      }
    };
  }

  const normalized = normalizeConversationArtifact(artifact, options?.preparedBy);
  const extractionResult = applyNormalizedArtifactToExtractionState(
    bundle.extractionState,
    normalized,
    options?.preparedBy
  );
  const branchResult = recalculateBranchStateFromExtractionState(
    extractionResult.extractionState,
    bundle.branchState,
    options?.preparedBy
  );
  const historyEntry = buildQuestionHistoryEntry({
    bundle,
    normalized,
    nextExtractionState: branchResult.extractionState,
    nextBranchState: branchResult.branchState,
    appliedFieldKeys: extractionResult.appliedFieldKeys,
    updatedBy: options?.preparedBy
  });
  const questionHistory = historyEntry
    ? [...bundle.questionHistory, historyEntry]
    : [...bundle.questionHistory];
  const questionResult = recalculateQuestionSelectionFromStates({
    extractionState: branchResult.extractionState,
    branchState: branchResult.branchState,
    questionHistory,
    lastResponseSignal: normalized.responseSignal ?? undefined,
    currentStage: options?.currentStage,
    updatedBy: options?.preparedBy
  });
  const nextBundle = {
    ...bundle,
    extractionState: branchResult.extractionState,
    branchState: branchResult.branchState,
    branchShiftAnalysis: branchResult.branchShiftAnalysis,
    questionSelection: questionResult.questionSelection,
    questionHistory,
    strategyFramework: buildStrategyFrameworkOutput(branchResult.extractionState),
    processedArtifacts: [
      ...bundle.processedArtifacts,
      createProcessedArtifactRecord({
        artifact,
        duplicateKey,
        responseSignal: normalized.responseSignal,
        sourceId: normalized.sourceMapping.sourceId,
        skippedAsDuplicate: false
      })
    ],
    processedArtifactIds: dedupe([...bundle.processedArtifactIds, artifact.artifactId]),
    processedDuplicateKeys: dedupe([...bundle.processedDuplicateKeys, duplicateKey]),
    warnings: dedupe([
      ...bundle.warnings,
      ...normalized.warnings,
      ...extractionResult.warnings,
      ...branchResult.warnings,
      ...questionResult.warnings
    ]),
    recompute: {
      mode: options?.rebuiltFromScratch ? "rebuild" : "incremental",
      processedArtifactIds: dedupe([
        ...bundle.recompute.processedArtifactIds,
        artifact.artifactId
      ]),
      newSourceIds: dedupe([
        ...bundle.recompute.newSourceIds,
        ...extractionResult.newSourceIds
      ]),
      newEvidenceIds: dedupe([
        ...bundle.recompute.newEvidenceIds,
        ...extractionResult.newEvidenceIds
      ]),
      rebuiltFromScratch: !!options?.rebuiltFromScratch,
      decisionNotes: dedupe([
        ...bundle.recompute.decisionNotes,
        ...extractionResult.notes,
        ...branchResult.warnings,
        ...questionResult.warnings
      ])
    },
    lastUpdate: questionResult.questionSelection.lastUpdate
  } satisfies HiddenIntelligenceBundle;
  const traceEntry = createTraceEntry({
    bundle,
    artifact,
    responseSignal: normalized.responseSignal,
    appliedFieldKeys: extractionResult.appliedFieldKeys,
    assumptionIds: extractionResult.assumptionIds,
    contradictionIds: extractionResult.contradictionIds,
    unknownIds: extractionResult.unknownIds,
    nextBundle,
    warnings: dedupe([
      ...normalized.warnings,
      ...extractionResult.warnings,
      ...branchResult.warnings,
      ...questionResult.warnings
    ]),
    notes: extractionResult.notes
  });

  return {
    ...nextBundle,
    trace: [...bundle.trace, traceEntry]
  } satisfies HiddenIntelligenceBundle;
}

export function applyArtifactsToIntelligenceState(
  bundle: HiddenIntelligenceBundle,
  artifacts: readonly ConversationArtifact[],
  options?: ArtifactOrchestrationOptions
) {
  return sortConversationArtifactsDeterministically([...artifacts]).reduce(
    (currentBundle, artifact) =>
      applyArtifactToIntelligenceState(currentBundle, artifact, options),
    bundle
  );
}

export function rebuildIntelligenceStateFromArtifacts(
  artifacts: readonly ConversationArtifact[],
  options?: ArtifactOrchestrationOptions
) {
  return applyArtifactsToIntelligenceState(
    createEmptyIntelligenceBundle({
      ...options,
      rebuiltFromScratch: true
    }),
    artifacts,
    {
      ...options,
      rebuiltFromScratch: true
    }
  );
}

export function recalculateQuestionSelectionFromBundle(
  bundle: HiddenIntelligenceBundle,
  options?: ArtifactOrchestrationOptions
) {
  const questionResult = recalculateQuestionSelectionFromStates({
    extractionState: bundle.extractionState,
    branchState: bundle.branchState,
    questionHistory: bundle.questionHistory,
    currentStage: options?.currentStage,
    updatedBy: options?.preparedBy
  });

  return {
    ...bundle,
    questionSelection: questionResult.questionSelection,
    strategyFramework: buildStrategyFrameworkOutput(bundle.extractionState),
    warnings: dedupe([...bundle.warnings, ...questionResult.warnings]),
    lastUpdate: questionResult.questionSelection.lastUpdate
  } satisfies HiddenIntelligenceBundle;
}

export function recalculateBranchStateFromBundle(
  bundle: HiddenIntelligenceBundle,
  options?: ArtifactOrchestrationOptions
) {
  const branchResult = recalculateBranchStateFromExtractionState(
    bundle.extractionState,
    bundle.branchState,
    options?.preparedBy
  );
  const questionResult = recalculateQuestionSelectionFromStates({
    extractionState: branchResult.extractionState,
    branchState: branchResult.branchState,
    questionHistory: bundle.questionHistory,
    currentStage: options?.currentStage,
    updatedBy: options?.preparedBy
  });

  return {
    ...bundle,
    extractionState: branchResult.extractionState,
    branchState: branchResult.branchState,
    branchShiftAnalysis: branchResult.branchShiftAnalysis,
    questionSelection: questionResult.questionSelection,
    strategyFramework: buildStrategyFrameworkOutput(branchResult.extractionState),
    warnings: dedupe([
      ...bundle.warnings,
      ...branchResult.warnings,
      ...questionResult.warnings
    ]),
    lastUpdate: questionResult.questionSelection.lastUpdate
  } satisfies HiddenIntelligenceBundle;
}
