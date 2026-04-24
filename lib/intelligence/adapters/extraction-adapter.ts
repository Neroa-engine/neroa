import type { GovernanceSystem } from "@/lib/governance";
import {
  addDirectAnswerToField,
  markFieldConflict,
  markFieldPartial,
  mergeFieldEvidence,
  recalculateExtractionState,
  recordAssumption,
  recordContradiction,
  recordInferredAnswer,
  recordUnknown,
  updateRequestSummary,
  upgradeFieldFromPartialToAnswered,
  type ExtractionCategoryKey,
  type ExtractionEvidenceReference,
  type ExtractionFieldKey,
  type ExtractionFieldValue,
  type ExtractionSourceReference,
  type ExtractionState
} from "@/lib/intelligence/extraction";
import {
  buildNormalizedArtifactEvidenceNotes,
  buildPotentialContradictionClass,
  deriveLikelyAffectedSystems,
  normalizeConversationArtifact
} from "./normalize";
import {
  createAdapterRecordId,
  sameListValue,
  sameTextValue
} from "./helpers";
import type {
  ExtractionAdapterResult,
  NormalizedConversationArtifact,
  NormalizedFieldSignal
} from "./types";

function dedupe<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function valueEquals(left: ExtractionFieldValue | null, right: ExtractionFieldValue) {
  if (!left) {
    return false;
  }

  if (left.kind === "text" && right.kind === "text") {
    return sameTextValue(left.summary, right.summary);
  }

  if (left.kind === "list" && right.kind === "list") {
    return sameListValue(left.items, right.items);
  }

  return false;
}

function upsertSourceRecord(
  state: ExtractionState,
  source: ExtractionSourceReference
) {
  if (state.sources[source.sourceId]) {
    return state;
  }

  return {
    ...state,
    sources: {
      ...state.sources,
      [source.sourceId]: source
    }
  };
}

function upsertEvidenceRecord(args: {
  state: ExtractionState;
  evidenceId: string;
  summary: string;
  sourceId: string;
  relatedFieldKeys: ExtractionFieldKey[];
  relatedCategoryKeys: ExtractionCategoryKey[];
  confidenceScore?: number;
}) {
  if (args.state.evidence[args.evidenceId]) {
    return args.state;
  }

  return {
    ...args.state,
    evidence: {
      ...args.state.evidence,
      [args.evidenceId]: {
        evidenceId: args.evidenceId,
        summary: args.summary,
        sourceId: args.sourceId,
        relatedFieldKeys: [...args.relatedFieldKeys],
        relatedCategoryKeys: [...args.relatedCategoryKeys],
        confidenceContribution:
          typeof args.confidenceScore === "number"
            ? {
                score: args.confidenceScore,
                scale: "unit_interval" as const
              }
            : undefined
      } satisfies ExtractionEvidenceReference
    }
  };
}

function collectNewKeys(previous: Record<string, unknown>, next: Record<string, unknown>) {
  return Object.keys(next).filter((key) => !(key in previous));
}

function contradictionClassForCategory(categoryKey: ExtractionCategoryKey) {
  switch (categoryKey) {
    case "mvp_boundary":
      return "MVP contradiction" as const;
    case "constraints":
      return "Budget / timeline contradiction" as const;
    case "branch_product_type":
    case "systems_integrations":
      return "Architecture contradiction" as const;
    default:
      return "Scope contradiction" as const;
  }
}

function resolveUnknownsAndAssumptions(
  state: ExtractionState,
  answeredFieldKeys: ExtractionFieldKey[],
  updatedBy?: string
) {
  if (answeredFieldKeys.length === 0) {
    return state;
  }

  const nextState = {
    ...state,
    unknowns: state.unknowns.map((unknown) =>
      unknown.linkedFieldKeys.some((fieldKey) => answeredFieldKeys.includes(fieldKey))
        ? { ...unknown, resolved: true }
        : unknown
    ),
    assumptions: state.assumptions.map((assumption) => {
      const allAnswered =
        assumption.linkedFieldKeys.length > 0 &&
        assumption.linkedFieldKeys.every((fieldKey) => {
          const status = state.fields[fieldKey].status;
          return status === "answered" || status === "validated";
        });

      return allAnswered && assumption.status === "open"
        ? { ...assumption, status: "validated" as const }
        : assumption;
    })
  };

  return recalculateExtractionState(nextState, {
    updatedBy,
    updateReason: "Resolved linked unknowns and assumptions after direct field updates."
  });
}

function applyFieldSignal(
  state: ExtractionState,
  normalized: NormalizedConversationArtifact,
  signal: NormalizedFieldSignal,
  updatedBy?: string
) {
  const currentField = state.fields[signal.fieldKey];
  const evidenceSummary = `${signal.reason} (${normalized.artifact.sourceSurface})`;
  const source = normalized.sourceMapping.source;
  const sameValue = valueEquals(currentField.value, signal.value);
  const hasExistingStableValue =
    currentField.value !== null &&
    ["answered", "validated", "inferred", "partial"].includes(currentField.status);

  if (sameValue) {
    if (
      signal.kind === "direct_answer" &&
      (currentField.status === "partial" || currentField.status === "inferred")
    ) {
      return upgradeFieldFromPartialToAnswered(state, {
        fieldKey: signal.fieldKey,
        value: signal.value,
        confidenceScore: signal.confidenceScore,
        source,
        evidenceSummary,
        followUpReason: signal.followUpReason,
        dependencyBlockers: signal.dependencyBlockers,
        mergeListValues: signal.value.kind === "list",
        reason: signal.reason,
        preparedBy: updatedBy
      });
    }

    return mergeFieldEvidence(state, {
      fieldKey: signal.fieldKey,
      source,
      evidenceSummary,
      confidenceScore: signal.confidenceScore,
      reason: signal.reason,
      preparedBy: updatedBy
    });
  }

  if (signal.kind === "contradiction_signal" || (hasExistingStableValue && signal.explicit)) {
    return markFieldConflict(state, {
      fieldKey: signal.fieldKey,
      conflictingValue: signal.value,
      confidenceScore: signal.confidenceScore,
      source,
      evidenceSummary,
      reason: signal.followUpReason ?? signal.reason,
      dependencyBlockers: signal.dependencyBlockers,
      preparedBy: updatedBy
    });
  }

  if (signal.kind === "inferred_answer") {
    return recordInferredAnswer(state, {
      fieldKey: signal.fieldKey,
      value: signal.value,
      confidenceScore: signal.confidenceScore,
      source,
      evidenceSummary,
      followUpReason: signal.followUpReason,
      dependencyBlockers: signal.dependencyBlockers,
      mergeListValues: signal.value.kind === "list",
      reason: signal.reason,
      preparedBy: updatedBy
    });
  }

  if (signal.kind === "partial_answer") {
    return markFieldPartial(state, {
      fieldKey: signal.fieldKey,
      value: signal.value,
      confidenceScore: signal.confidenceScore,
      source,
      evidenceSummary,
      followUpReason: signal.followUpReason,
      dependencyBlockers: signal.dependencyBlockers,
      mergeListValues: signal.value.kind === "list",
      reason: signal.reason,
      preparedBy: updatedBy
    });
  }

  return addDirectAnswerToField(state, {
    fieldKey: signal.fieldKey,
    value: signal.value,
    confidenceScore: signal.confidenceScore,
    source,
    evidenceSummary,
    followUpReason: signal.followUpReason,
    dependencyBlockers: signal.dependencyBlockers,
    mergeListValues: signal.value.kind === "list",
    reason: signal.reason,
    preparedBy: updatedBy
  });
}

export function applyNormalizedArtifactToExtractionState(
  state: ExtractionState,
  normalized: NormalizedConversationArtifact,
  updatedBy?: string
) {
  const initialState = upsertSourceRecord(state, normalized.sourceMapping.source);
  const affectedSystems = deriveLikelyAffectedSystems(normalized) as GovernanceSystem[];
  const appliedFieldKeys: ExtractionFieldKey[] = [];
  const assumptionIds: string[] = [];
  const contradictionIds: string[] = [];
  const unknownIds: string[] = [];
  const notes: string[] = [];
  const warnings = [...normalized.warnings];
  let nextState = initialState;

  if (
    normalized.artifact.role === "user" &&
    normalized.fieldSignals.some((signal) => signal.fieldKey === "request_summary")
  ) {
    nextState = updateRequestSummary(
      nextState,
      {
        requestedChangeOrInitiative: normalized.artifact.rawContent
      },
      {
        updatedBy,
        updateReason: "Updated request summary from conversation artifact."
      }
    );
  }

  for (const signal of normalized.fieldSignals) {
    const beforeField = nextState.fields[signal.fieldKey];
    nextState = applyFieldSignal(nextState, normalized, signal, updatedBy);
    const afterField = nextState.fields[signal.fieldKey];

    if (
      beforeField.status !== afterField.status ||
      !valueEquals(beforeField.value, afterField.value ?? signal.value)
    ) {
      appliedFieldKeys.push(signal.fieldKey);
    }

    if (
      afterField.status === "conflicting" &&
      !nextState.contradictions.some((item) =>
        item.linkedFieldKeys.includes(signal.fieldKey)
      )
    ) {
      nextState = recordContradiction(nextState, {
        id: createAdapterRecordId(
          "field-contradiction",
          `${normalized.artifact.artifactId}-${signal.fieldKey}`
        ),
        title: `Conflict in ${beforeField.label}`,
        contradictionClass: contradictionClassForCategory(signal.categoryKey),
        severity: signal.fieldKey === "primary_branch" ? "high" : "moderate",
        conflictingStatements: [normalized.artifact.rawContent],
        linkedFieldKeys: [signal.fieldKey],
        linkedCategoryKeys: [signal.categoryKey],
        affectedSystems,
        sourceIds: [normalized.sourceMapping.sourceId],
        recommendedResolutionPath: `Ask a direct resolving question for ${beforeField.label.toLowerCase()}.`,
        blocked: signal.fieldKey === "primary_branch",
        preparedBy: updatedBy
      });
      contradictionIds.push(
        createAdapterRecordId(
          "field-contradiction",
          `${normalized.artifact.artifactId}-${signal.fieldKey}`
        )
      );
    }
  }

  for (const signal of normalized.assumptionSignals) {
    const evidenceId = createAdapterRecordId(
      "assumption-evidence",
      `${signal.signalId}-${signal.statement}`
    );
    nextState = upsertEvidenceRecord({
      state: nextState,
      evidenceId,
      summary: signal.whyInferred,
      sourceId: normalized.sourceMapping.sourceId,
      relatedFieldKeys: signal.linkedFieldKeys,
      relatedCategoryKeys: signal.linkedCategoryKeys,
      confidenceScore: signal.confidenceScore
    });
    nextState = recordAssumption(nextState, {
      id: signal.signalId,
      statement: signal.statement,
      whyInferred: signal.whyInferred,
      confidenceScore: signal.confidenceScore,
      linkedFieldKeys: signal.linkedFieldKeys,
      linkedCategoryKeys: signal.linkedCategoryKeys,
      evidenceIds: [evidenceId],
      sourceIds: [normalized.sourceMapping.sourceId],
      invalidationTriggers: signal.invalidationTriggers,
      confirmationRequired: signal.confirmationRequired,
      affectedSystems,
      preparedBy: updatedBy
    });
    assumptionIds.push(signal.signalId);
  }

  for (const signal of normalized.contradictionSignals) {
    const evidenceId = createAdapterRecordId(
      "contradiction-evidence",
      `${signal.signalId}-${signal.title}`
    );
    nextState = upsertEvidenceRecord({
      state: nextState,
      evidenceId,
      summary: signal.recommendedResolutionPath,
      sourceId: normalized.sourceMapping.sourceId,
      relatedFieldKeys: signal.linkedFieldKeys,
      relatedCategoryKeys: signal.linkedCategoryKeys,
      confidenceScore: 0.44
    });
    nextState = recordContradiction(nextState, {
      id: signal.signalId,
      title: signal.title,
      contradictionClass: buildPotentialContradictionClass(normalized),
      severity: signal.severity === "low" ? "minor" : signal.severity,
      conflictingStatements: signal.conflictingStatements,
      linkedFieldKeys: signal.linkedFieldKeys,
      linkedCategoryKeys: signal.linkedCategoryKeys,
      affectedSystems,
      sourceIds: [normalized.sourceMapping.sourceId],
      evidenceIds: [evidenceId],
      recommendedResolutionPath: signal.recommendedResolutionPath,
      blocked: signal.blocked,
      preparedBy: updatedBy
    });
    contradictionIds.push(signal.signalId);
  }

  for (const signal of normalized.unknownSignals) {
    nextState = recordUnknown(nextState, {
      id: signal.signalId,
      question: signal.question,
      categoryKey: signal.categoryKey,
      linkedFieldKeys: signal.linkedFieldKeys,
      whyItMatters: signal.whyItMatters,
      whatItBlocks: signal.whatItBlocks,
      blockingStage: signal.blockingStage,
      urgency: signal.urgency,
      recommendedNextQuestionTarget: signal.recommendedNextQuestionTarget,
      preparedBy: updatedBy
    });
    unknownIds.push(signal.signalId);
  }

  nextState = resolveUnknownsAndAssumptions(nextState, appliedFieldKeys, updatedBy);

  const newSourceIds = collectNewKeys(state.sources, nextState.sources);
  const newEvidenceIds = collectNewKeys(state.evidence, nextState.evidence);

  if (!appliedFieldKeys.length && !assumptionIds.length && !contradictionIds.length && !unknownIds.length) {
    notes.push("Artifact did not materially change extraction truth.");
  } else {
    notes.push(...buildNormalizedArtifactEvidenceNotes(normalized));
  }

  return {
    extractionState: nextState,
    appliedFieldKeys: dedupe(appliedFieldKeys),
    assumptionIds: dedupe(assumptionIds),
    contradictionIds: dedupe(contradictionIds),
    unknownIds: dedupe(unknownIds),
    newSourceIds,
    newEvidenceIds,
    warnings,
    notes: dedupe(notes)
  } satisfies ExtractionAdapterResult;
}

export function applyConversationArtifactToExtractionState(
  state: ExtractionState,
  artifact: Parameters<typeof normalizeConversationArtifact>[0],
  updatedBy?: string
) {
  const normalized = normalizeConversationArtifact(artifact, updatedBy);
  return applyNormalizedArtifactToExtractionState(state, normalized, updatedBy);
}
