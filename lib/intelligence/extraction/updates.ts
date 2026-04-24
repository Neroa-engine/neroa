import type {
  AssumptionStatus,
  BranchFamily,
  GovernanceSystem,
  OverlayType
} from "@/lib/governance";
import { BRANCH_STABILITY_STATES } from "@/lib/governance";
import {
  BRANCH_FAMILY_LOOKUP,
  EXTRACTION_FIELD_DEFINITIONS,
  type ExtractionCategoryKey,
  type ExtractionFieldKey
} from "./catalog";
import { buildConfidenceRollups } from "./confidence";
import { evaluateExecutionReadiness, evaluateRoadmapReadiness } from "./readiness";
import {
  applyExtractionStateMeta,
  buildExtractionRecordId
} from "./state";
import type {
  ExtractionAssumptionInput,
  ExtractionContradictionInput,
  ExtractionEvidenceMergeInput,
  ExtractionFieldConflictInput,
  ExtractionFieldState,
  ExtractionFieldUpdateInput,
  ExtractionSourceReference,
  ExtractionState,
  ExtractionUnknownInput
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

function dedupe<T>(values: T[]) {
  return [...new Set(values)];
}

function mergeStringLists(current: string[], incoming: string[]) {
  return dedupe([...current, ...incoming.map((item) => item.trim()).filter(Boolean)]);
}

function createFieldTransition(args: {
  field: ExtractionFieldState;
  toStatus: ExtractionFieldState["status"];
  reason: string;
  nextValueSummary?: string;
  sourceIds: string[];
  evidenceIds: string[];
}) {
  return {
    at: nowIso(),
    fromStatus: args.field.status,
    toStatus: args.toStatus,
    reason: args.reason,
    previousValueSummary: args.field.value?.summary,
    nextValueSummary: args.nextValueSummary,
    sourceIds: args.sourceIds,
    evidenceIds: args.evidenceIds
  };
}

function inferFollowUp(args: {
  status: ExtractionFieldState["status"];
  followUpReason?: string;
  dependencyBlockers: string[];
}) {
  if (args.followUpReason) {
    return {
      followUpRequired: true,
      followUpReason: args.followUpReason
    };
  }

  if (args.dependencyBlockers.length > 0) {
    return {
      followUpRequired: true,
      followUpReason: "This field is blocked by one or more dependent truths."
    };
  }

  if (args.status === "partial") {
    return {
      followUpRequired: true,
      followUpReason: "This field still needs more detail before it becomes stable."
    };
  }

  if (args.status === "inferred") {
    return {
      followUpRequired: true,
      followUpReason: "This field is inferred and still needs confirmation."
    };
  }

  if (args.status === "conflicting") {
    return {
      followUpRequired: true,
      followUpReason: "This field contains conflicting signals and needs resolution."
    };
  }

  return {
    followUpRequired: false,
    followUpReason: undefined
  };
}

function upsertSourceReference(
  state: ExtractionState,
  source:
    | (Omit<ExtractionSourceReference, "sourceId"> & { sourceId?: string })
    | undefined,
  seed: string
) {
  if (!source) {
    return {
      state,
      sourceId: undefined as string | undefined
    };
  }

  const sourceId = source.sourceId ?? buildExtractionRecordId("source", seed);

  return {
    state: {
      ...state,
      sources: {
        ...state.sources,
        [sourceId]: {
          ...source,
          sourceId
        }
      }
    },
    sourceId
  };
}

function upsertEvidenceReference(args: {
  state: ExtractionState;
  fieldKey: ExtractionFieldKey;
  categoryKey: ExtractionCategoryKey;
  sourceId?: string;
  evidenceSummary?: string;
  confidenceScore?: number;
}) {
  if (!args.sourceId || !args.evidenceSummary) {
    return {
      state: args.state,
      evidenceId: undefined as string | undefined
    };
  }

  const evidenceId = buildExtractionRecordId(
    "evidence",
    `${args.fieldKey}-${args.evidenceSummary}`
  );

  return {
    state: {
      ...args.state,
      evidence: {
        ...args.state.evidence,
        [evidenceId]: {
          evidenceId,
          summary: args.evidenceSummary,
          sourceId: args.sourceId,
          relatedFieldKeys: [args.fieldKey],
          relatedCategoryKeys: [args.categoryKey],
          confidenceContribution:
            typeof args.confidenceScore === "number"
              ? {
                  score: Math.max(0, Math.min(1, args.confidenceScore)),
                  scale: "unit_interval" as const
                }
              : undefined
        }
      }
    },
    evidenceId
  };
}

function mergeFieldValue(args: {
  field: ExtractionFieldState;
  value: ExtractionFieldUpdateInput["value"];
  mergeListValues?: boolean;
}) {
  if (
    args.mergeListValues &&
    args.field.value?.kind === "list" &&
    args.value.kind === "list"
  ) {
    const items = mergeStringLists(args.field.value.items, args.value.items);

    return {
      kind: "list" as const,
      items,
      summary: items.join(", "),
      rawValue: items
    };
  }

  return args.value;
}

function syncBranchClassification(state: ExtractionState): ExtractionState {
  const branchField = state.fields.primary_branch;
  const productTypeField = state.fields.product_type;
  const sourceFieldKeys: ExtractionFieldKey[] = productTypeField.value
    ? ["primary_branch", "product_type"]
    : ["primary_branch"];
  const branchCandidate =
    branchField.value?.kind === "text" &&
    BRANCH_FAMILY_LOOKUP.has(branchField.value.summary as BranchFamily)
      ? (branchField.value.summary as BranchFamily)
      : null;

  return {
    ...state,
    branchClassification: {
      ...state.branchClassification,
      status: branchField.status,
      primaryBranch: branchCandidate,
      confidence: branchField.confidence,
      branchStability:
        branchField.status === "conflicting" || branchCandidate === null
          ? "Unstable"
          : BRANCH_STABILITY_STATES[0],
      branchShiftSuspected:
        branchField.status === "conflicting" ||
        state.contradictions.some(
          (contradiction) =>
            contradiction.status === "open" &&
            contradiction.linkedCategoryKeys.includes("branch_product_type")
        ),
      sourceFieldKeys,
      evidenceIds: dedupe([
        ...branchField.evidenceIds,
        ...productTypeField.evidenceIds
      ])
    }
  };
}

function recalculateDerivedState(
  state: ExtractionState,
  updateReason: string,
  updatedBy?: string
) {
  const withBranchReference = syncBranchClassification(state);
  const confidenceRollups = buildConfidenceRollups(withBranchReference);
  const withRollups = {
    ...withBranchReference,
    confidenceRollups
  };
  const roadmapReadiness = evaluateRoadmapReadiness(withRollups);
  const executionReadiness = evaluateExecutionReadiness(withRollups);

  return applyExtractionStateMeta({
    state: {
      ...withRollups,
      roadmapReadiness,
      executionReadiness
    },
    updateReason,
    updatedBy
  });
}

function updateFieldState(args: {
  state: ExtractionState;
  fieldKey: ExtractionFieldKey;
  status: ExtractionFieldState["status"];
  value: ExtractionFieldUpdateInput["value"];
  confidenceScore: number;
  source?: ExtractionFieldUpdateInput["source"];
  evidenceSummary?: string;
  followUpReason?: string;
  dependencyBlockers?: string[];
  mergeListValues?: boolean;
  reason: string;
  updatedBy?: string;
}) {
  const currentField = args.state.fields[args.fieldKey];
  const dependencyBlockers = args.dependencyBlockers ?? [];
  const sourceSeed = `${args.fieldKey}-${args.reason}`;
  const sourceResult = upsertSourceReference(args.state, args.source, sourceSeed);
  const evidenceResult = upsertEvidenceReference({
    state: sourceResult.state,
    fieldKey: args.fieldKey,
    categoryKey: currentField.categoryKey,
    sourceId: sourceResult.sourceId,
    evidenceSummary: args.evidenceSummary,
    confidenceScore: args.confidenceScore
  });
  const nextValue = mergeFieldValue({
    field: currentField,
    value: args.value,
    mergeListValues: args.mergeListValues
  });
  const followUp = inferFollowUp({
    status: args.status,
    followUpReason: args.followUpReason,
    dependencyBlockers
  });
  const sourceIds = dedupe([
    ...currentField.sourceIds,
    ...(sourceResult.sourceId ? [sourceResult.sourceId] : [])
  ]);
  const evidenceIds = dedupe([
    ...currentField.evidenceIds,
    ...(evidenceResult.evidenceId ? [evidenceResult.evidenceId] : [])
  ]);
  const nextField: ExtractionFieldState = {
    ...currentField,
    status: args.status,
    value: nextValue,
    confidence: {
      score: Math.max(0, Math.min(1, args.confidenceScore)),
      scale: "unit_interval" as const
    },
    sourceIds,
    evidenceIds,
    dependencyBlockers,
    followUpRequired: followUp.followUpRequired,
    followUpReason: followUp.followUpReason,
    history: [
      ...currentField.history,
      createFieldTransition({
        field: currentField,
        toStatus: args.status,
        reason: args.reason,
        nextValueSummary: nextValue.summary,
        sourceIds,
        evidenceIds
      })
    ]
  };

  return recalculateDerivedState(
    {
      ...evidenceResult.state,
      fields: {
        ...evidenceResult.state.fields,
        [args.fieldKey]: nextField
      }
    },
    args.reason,
    args.updatedBy
  );
}

function isHighSensitivityAssumption(args: {
  linkedFieldKeys: ExtractionFieldKey[];
  affectedSystems: GovernanceSystem[];
}) {
  return (
    args.linkedFieldKeys.some((fieldKey) =>
      [
        "primary_branch",
        "mvp_in_scope",
        "mvp_out_of_scope",
        "systems_touched",
        "constraints"
      ].includes(fieldKey)
    ) ||
    args.affectedSystems.some((system) =>
      [
        "Auth",
        "Billing / account",
        "Routing",
        "Protected routing",
        "Workspace / project surfaces"
      ].includes(system)
    )
  );
}

export function updateRequestSummary(
  state: ExtractionState,
  requestSummary: Partial<ExtractionState["requestSummary"]>,
  metadata?: { updatedBy?: string; updateReason?: string }
) {
  return recalculateDerivedState(
    {
      ...state,
      requestSummary: {
        ...state.requestSummary,
        ...requestSummary
      }
    },
    metadata?.updateReason ?? "Updated request summary.",
    metadata?.updatedBy
  );
}

export function addDirectAnswerToField(
  state: ExtractionState,
  input: ExtractionFieldUpdateInput
) {
  return updateFieldState({
    state,
    fieldKey: input.fieldKey,
    status: "answered",
    value: input.value,
    confidenceScore: input.confidenceScore,
    source: input.source,
    evidenceSummary: input.evidenceSummary,
    followUpReason: input.followUpReason,
    dependencyBlockers: input.dependencyBlockers,
    mergeListValues: input.mergeListValues,
    reason:
      input.reason ??
      `Added a direct answer to ${EXTRACTION_FIELD_DEFINITIONS[input.fieldKey].label}.`,
    updatedBy: input.preparedBy
  });
}

export function recordInferredAnswer(
  state: ExtractionState,
  input: ExtractionFieldUpdateInput
) {
  return updateFieldState({
    state,
    fieldKey: input.fieldKey,
    status: "inferred",
    value: input.value,
    confidenceScore: input.confidenceScore,
    source: input.source,
    evidenceSummary: input.evidenceSummary,
    followUpReason:
      input.followUpReason ??
      "This truth is inferred and should be confirmed explicitly later.",
    dependencyBlockers: input.dependencyBlockers,
    mergeListValues: input.mergeListValues,
    reason:
      input.reason ??
      `Recorded an inferred answer for ${EXTRACTION_FIELD_DEFINITIONS[input.fieldKey].label}.`,
    updatedBy: input.preparedBy
  });
}

export function markFieldPartial(
  state: ExtractionState,
  input: ExtractionFieldUpdateInput
) {
  return updateFieldState({
    state,
    fieldKey: input.fieldKey,
    status: "partial",
    value: input.value,
    confidenceScore: input.confidenceScore,
    source: input.source,
    evidenceSummary: input.evidenceSummary,
    followUpReason:
      input.followUpReason ??
      "Only part of the required truth is captured so far.",
    dependencyBlockers: input.dependencyBlockers,
    mergeListValues: input.mergeListValues,
    reason:
      input.reason ??
      `Marked ${EXTRACTION_FIELD_DEFINITIONS[input.fieldKey].label} as partial.`,
    updatedBy: input.preparedBy
  });
}

export function upgradeFieldFromPartialToAnswered(
  state: ExtractionState,
  input: ExtractionFieldUpdateInput
) {
  return updateFieldState({
    state,
    fieldKey: input.fieldKey,
    status: "answered",
    value: input.value,
    confidenceScore: input.confidenceScore,
    source: input.source,
    evidenceSummary: input.evidenceSummary,
    followUpReason: input.followUpReason,
    dependencyBlockers: input.dependencyBlockers,
    mergeListValues: input.mergeListValues,
    reason:
      input.reason ??
      `Upgraded ${EXTRACTION_FIELD_DEFINITIONS[input.fieldKey].label} from partial to answered.`,
    updatedBy: input.preparedBy
  });
}

export function markFieldConflict(
  state: ExtractionState,
  input: ExtractionFieldConflictInput
) {
  return updateFieldState({
    state,
    fieldKey: input.fieldKey,
    status: "conflicting",
    value: input.conflictingValue,
    confidenceScore: input.confidenceScore ?? 0.25,
    source: input.source,
    evidenceSummary: input.evidenceSummary,
    followUpReason: input.reason,
    dependencyBlockers: input.dependencyBlockers,
    mergeListValues: false,
    reason: input.reason,
    updatedBy: input.preparedBy
  });
}

export function mergeFieldEvidence(
  state: ExtractionState,
  input: ExtractionEvidenceMergeInput
) {
  const field = state.fields[input.fieldKey];
  const sourceSeed = `${input.fieldKey}-${input.evidenceSummary}`;
  const sourceResult = upsertSourceReference(state, input.source, sourceSeed);
  const evidenceResult = upsertEvidenceReference({
    state: sourceResult.state,
    fieldKey: input.fieldKey,
    categoryKey: field.categoryKey,
    sourceId: sourceResult.sourceId,
    evidenceSummary: input.evidenceSummary,
    confidenceScore: input.confidenceScore
  });
  const nextField: ExtractionFieldState = {
    ...field,
    sourceIds: dedupe([
      ...field.sourceIds,
      ...(sourceResult.sourceId ? [sourceResult.sourceId] : [])
    ]),
    evidenceIds: dedupe([
      ...field.evidenceIds,
      ...(evidenceResult.evidenceId ? [evidenceResult.evidenceId] : [])
    ]),
    history: [
      ...field.history,
      createFieldTransition({
        field,
        toStatus: field.status,
        reason: input.reason ?? `Merged additional evidence into ${field.label}.`,
        nextValueSummary: field.value?.summary,
        sourceIds: dedupe([
          ...field.sourceIds,
          ...(sourceResult.sourceId ? [sourceResult.sourceId] : [])
        ]),
        evidenceIds: dedupe([
          ...field.evidenceIds,
          ...(evidenceResult.evidenceId ? [evidenceResult.evidenceId] : [])
        ])
      })
    ]
  };

  return recalculateDerivedState(
    {
      ...evidenceResult.state,
      fields: {
        ...evidenceResult.state.fields,
        [input.fieldKey]: nextField
      }
    },
    input.reason ?? `Merged evidence into ${field.label}.`,
    input.preparedBy
  );
}

export function setBranchClassificationReference(args: {
  state: ExtractionState;
  primaryBranch: BranchFamily;
  secondaryBranches?: BranchFamily[];
  branchStability?: "Stable" | "Unstable";
  branchShiftSuspected?: boolean;
  confidenceScore: number;
  updatedBy?: string;
  updateReason?: string;
}) {
  const nextState: ExtractionState = {
    ...args.state,
    branchClassification: {
      ...args.state.branchClassification,
      status: "answered",
      primaryBranch: args.primaryBranch,
      secondaryBranches: args.secondaryBranches ?? [],
      branchStability: args.branchStability ?? "Stable",
      branchShiftSuspected: args.branchShiftSuspected ?? false,
      confidence: {
        score: Math.max(0, Math.min(1, args.confidenceScore)),
        scale: "unit_interval" as const
      }
    }
  };

  return recalculateDerivedState(
    nextState,
    args.updateReason ?? "Updated branch classification reference.",
    args.updatedBy
  );
}

export function setOverlayActivationReference(args: {
  state: ExtractionState;
  overlayType: OverlayType;
  determination: "unknown" | "active" | "inactive";
  confidenceScore: number;
  rationale?: string;
  sourceFieldKeys?: ExtractionFieldKey[];
  evidenceIds?: string[];
  updatedBy?: string;
  updateReason?: string;
}) {
  return recalculateDerivedState(
    {
      ...args.state,
      overlayActivations: {
        ...args.state.overlayActivations,
        [args.overlayType]: {
          overlayType: args.overlayType,
          determination: args.determination,
          confidence: {
            score: Math.max(0, Math.min(1, args.confidenceScore)),
            scale: "unit_interval" as const
          },
          rationale: args.rationale,
          sourceFieldKeys: args.sourceFieldKeys ?? [],
          evidenceIds: args.evidenceIds ?? []
        }
      }
    },
    args.updateReason ?? `Updated overlay reference for ${args.overlayType}.`,
    args.updatedBy
  );
}

export function recordAssumption(
  state: ExtractionState,
  input: ExtractionAssumptionInput
) {
  const linkedFieldKeys = input.linkedFieldKeys ?? [];
  const affectedSystems = input.affectedSystems ?? [];
  const assumptionId =
    input.id ?? buildExtractionRecordId("assumption", input.statement);
  const categoryKeys =
    input.linkedCategoryKeys ??
    dedupe(
      linkedFieldKeys.map(
        (fieldKey) => EXTRACTION_FIELD_DEFINITIONS[fieldKey].categoryKey
      )
    );

  return recalculateDerivedState(
    {
      ...state,
      assumptions: [
        ...state.assumptions.filter(
          (assumption) => assumption.assumptionId !== assumptionId
        ),
        {
          assumptionId,
          statement: input.statement,
          categoryKey: input.categoryKey,
          linkedFieldKeys,
          linkedCategoryKeys: categoryKeys,
          evidenceIds: input.evidenceIds ?? [],
          sourceIds: input.sourceIds ?? [],
          confidence: {
            score: Math.max(0, Math.min(1, input.confidenceScore)),
            scale: "unit_interval" as const
          },
          whyInferred: input.whyInferred,
          invalidationTriggers: input.invalidationTriggers ?? [],
          confirmationRequired: input.confirmationRequired ?? false,
          highSensitivity: isHighSensitivityAssumption({
            linkedFieldKeys,
            affectedSystems
          }),
          affectedSystems,
          affectedPhases: input.affectedPhases ?? [],
          status: input.status ?? ("open" as AssumptionStatus)
        }
      ]
    },
    `Recorded assumption: ${input.statement}`,
    input.preparedBy
  );
}

export function recordContradiction(
  state: ExtractionState,
  input: ExtractionContradictionInput
) {
  const contradictionId =
    input.id ?? buildExtractionRecordId("contradiction", input.title);
  const linkedFieldKeys = input.linkedFieldKeys ?? [];
  const linkedCategoryKeys =
    input.linkedCategoryKeys ??
    dedupe(
      linkedFieldKeys.map(
        (fieldKey) => EXTRACTION_FIELD_DEFINITIONS[fieldKey].categoryKey
      )
    );

  return recalculateDerivedState(
    {
      ...state,
      contradictions: [
        ...state.contradictions.filter(
          (contradiction) => contradiction.contradictionId !== contradictionId
        ),
        {
          contradictionId,
          title: input.title,
          contradictionClass: input.contradictionClass,
          severity: input.severity,
          status: input.status ?? "open",
          blocked: input.blocked ?? input.severity === "critical",
          conflictingStatements: input.conflictingStatements,
          linkedFieldKeys,
          linkedCategoryKeys,
          affectedSystems: input.affectedSystems ?? [],
          affectedPhases: input.affectedPhases ?? [],
          relatedAssumptionIds: input.relatedAssumptionIds ?? [],
          sourceIds: input.sourceIds ?? [],
          evidenceIds: input.evidenceIds ?? [],
          recommendedResolutionPath: input.recommendedResolutionPath
        }
      ]
    },
    `Recorded contradiction: ${input.title}`,
    input.preparedBy
  );
}

export function recordUnknown(
  state: ExtractionState,
  input: ExtractionUnknownInput
) {
  const unknownId = input.id ?? buildExtractionRecordId("unknown", input.question);

  return recalculateDerivedState(
    {
      ...state,
      unknowns: [
        ...state.unknowns.filter((unknown) => unknown.unknownId !== unknownId),
        {
          unknownId,
          question: input.question,
          categoryKey: input.categoryKey,
          linkedFieldKeys: input.linkedFieldKeys ?? [],
          whyItMatters: input.whyItMatters,
          whatItBlocks: input.whatItBlocks,
          blockingStage: input.blockingStage ?? "roadmap",
          urgency: input.urgency ?? "moderate",
          recommendedNextQuestionTarget: input.recommendedNextQuestionTarget,
          resolved: input.resolved ?? false
        }
      ]
    },
    `Recorded unknown: ${input.question}`,
    input.preparedBy
  );
}

export function recalculateExtractionState(
  state: ExtractionState,
  metadata?: { updatedBy?: string; updateReason?: string }
) {
  return recalculateDerivedState(
    state,
    metadata?.updateReason ?? "Recalculated extraction state.",
    metadata?.updatedBy
  );
}
