import type {
  BranchOverlayActivation,
  BranchResolutionTarget
} from "@/lib/intelligence/branching";
import {
  ARCHITECTURE_RELEVANT_OVERLAYS,
  FIELD_QUESTION_TYPE_MAP,
  FIELD_REGISTRY_ENTRIES,
  STATIC_QUESTION_TARGET_REGISTRY,
  buildCategoryTargetId,
  buildFieldTargetId
} from "./catalog";
import {
  buildGapText,
  buildTargetReference,
  candidatePriorityBase,
  createQuestionConfidence,
  createQuestionRecordId,
  dedupe,
  fieldStatusWeight,
  mergeUnique,
  recoverySignal,
  riskLevelWeight,
  selectNarrowingTargetId,
  selectRecoveryTargetId,
  stagePriorityBoost
} from "./helpers";
import type {
  QuestionCandidate,
  QuestionCandidateStatus,
  QuestionPriorityBucket,
  QuestionSelectionCandidateContext,
  QuestionSelectionType
} from "./types";
import type {
  ExtractionCategoryKey,
  ExtractionFieldKey
} from "@/lib/intelligence/extraction";
import {
  EXTRACTION_CATEGORY_KEYS,
  EXTRACTION_FIELD_DEFINITIONS,
  EXTRACTION_FIELD_KEYS
} from "@/lib/intelligence/extraction";

const TRUST_CRITICAL_OVERLAY_SYSTEMS = new Set<string>([
  "Auth",
  "Billing / account",
  "Protected routing",
  "Backend governance"
] as const);

const CONTRADICTION_SEVERITY_SCORE = {
  critical: 96,
  high: 72,
  moderate: 48,
  minor: 28
} as const;

const BRANCH_AMBIGUITY_SCORE = {
  none: 0,
  low: 22,
  moderate: 44,
  high: 72,
  critical: 92
} as const;

const OVERLAY_STATE_SCORE = {
  inactive: 0,
  possible: 34,
  active: 24,
  "high-confidence active": 0
} as const;

const HIGH_IMPACT_ROADMAP_FIELDS = new Set<ExtractionFieldKey>([
  "primary_branch",
  "product_function",
  "primary_users",
  "problem_statement",
  "desired_outcome",
  "first_use_case",
  "core_workflow",
  "mvp_in_scope",
  "mvp_out_of_scope",
  "primary_surfaces",
  "systems_touched",
  "constraints",
  "compliance_security_sensitivity"
]);

function nowIso() {
  return new Date().toISOString();
}

function uniqueFieldSources(
  context: QuestionSelectionCandidateContext,
  fieldKeys: ExtractionFieldKey[]
) {
  return fieldKeys.flatMap((fieldKey) => context.extractionState.fields[fieldKey].sourceIds);
}

function uniqueFieldEvidence(
  context: QuestionSelectionCandidateContext,
  fieldKeys: ExtractionFieldKey[]
) {
  return fieldKeys.flatMap((fieldKey) => context.extractionState.fields[fieldKey].evidenceIds);
}

function uniqueFieldCategories(fieldKeys: readonly ExtractionFieldKey[]) {
  return dedupe(
    fieldKeys.map((fieldKey) => EXTRACTION_FIELD_DEFINITIONS[fieldKey].categoryKey)
  );
}

function categoryTargetReference(categoryKey: ExtractionCategoryKey) {
  const entry = STATIC_QUESTION_TARGET_REGISTRY[buildCategoryTargetId(categoryKey)];

  return buildTargetReference({
    targetId: entry.targetId,
    label: entry.label,
    categoryKey
  });
}

function resolutionTargetReference(target?: BranchResolutionTarget) {
  if (!target) {
    return buildTargetReference({
      targetId: "branch:ambiguity",
      label: STATIC_QUESTION_TARGET_REGISTRY["branch:ambiguity"].label,
      branchResolutionTarget: "branch_product_type"
    });
  }

  if ((EXTRACTION_FIELD_KEYS as readonly string[]).includes(target)) {
    return fieldTargetReference(target as ExtractionFieldKey);
  }

  if ((EXTRACTION_CATEGORY_KEYS as readonly string[]).includes(target)) {
    return categoryTargetReference(target as ExtractionCategoryKey);
  }

  return buildTargetReference({
    targetId: "branch:ambiguity",
    label: STATIC_QUESTION_TARGET_REGISTRY["branch:ambiguity"].label,
    branchResolutionTarget: "branch_product_type"
  });
}

function blocksRoadmap(fieldKey: ExtractionFieldKey, status: string) {
  const definition = FIELD_REGISTRY_ENTRIES[fieldKey];

  if (
    definition.criticality === "roadmap_critical" &&
    (status === "unanswered" || status === "partial" || status === "conflicting")
  ) {
    return true;
  }

  return status === "inferred" && HIGH_IMPACT_ROADMAP_FIELDS.has(fieldKey);
}

function blocksExecution(fieldKey: ExtractionFieldKey, status: string) {
  const definition = FIELD_REGISTRY_ENTRIES[fieldKey];

  if (
    definition.criticality !== "roadmap_critical" &&
    definition.criticality !== "execution_critical"
  ) {
    return false;
  }

  return (
    status === "unanswered" ||
    status === "partial" ||
    status === "conflicting" ||
    status === "inferred"
  );
}

function stageBoost(args: {
  context: QuestionSelectionCandidateContext;
  roadmapRelevant: boolean;
  executionRelevant: boolean;
}) {
  if (args.context.currentStage === "roadmap" && args.roadmapRelevant) {
    return stagePriorityBoost("roadmap");
  }

  if (args.context.currentStage === "execution-prep" && args.executionRelevant) {
    return stagePriorityBoost("execution");
  }

  return 0;
}

function buildFieldWhyChosen(args: {
  fieldKey: ExtractionFieldKey;
  status: string;
  recovery: boolean;
  retargeted: boolean;
}) {
  const label = EXTRACTION_FIELD_DEFINITIONS[args.fieldKey].label;

  if (args.recovery) {
    return `The last response signaled uncertainty, so the engine moved sideways to a smaller adjacent truth instead of repeating ${label}.`;
  }

  if (args.status === "conflicting") {
    return `Conflicting truth around ${label} should be resolved before confidence degrades further.`;
  }

  if (args.status === "inferred") {
    return `${label} is currently inferred rather than confirmed, so the engine should validate it before using it as stable truth.`;
  }

  if (args.status === "partial" && args.retargeted) {
    return `Partial truth around ${label} can be narrowed efficiently with a smaller adjacent question.`;
  }

  if (args.status === "partial") {
    return `${label} is only partially known, so the next question should tighten it before roadmap confidence drifts.`;
  }

  return `${label} is still missing and remains one of the next deterministic truth gaps to close.`;
}

function hasOpenContradictionForField(
  context: QuestionSelectionCandidateContext,
  fieldKey: ExtractionFieldKey
) {
  return context.extractionState.contradictions.some(
    (contradiction) =>
      contradiction.status === "open" &&
      contradiction.linkedFieldKeys.includes(fieldKey)
  );
}

function hasOpenAssumptionForField(
  context: QuestionSelectionCandidateContext,
  fieldKey: ExtractionFieldKey
) {
  return context.extractionState.assumptions.some(
    (assumption) =>
      assumption.status === "open" &&
      assumption.linkedFieldKeys.includes(fieldKey) &&
      (assumption.confirmationRequired || assumption.highSensitivity)
  );
}

function highImpactFieldPriorityBoost(fieldKey: ExtractionFieldKey) {
  if (HIGH_IMPACT_ROADMAP_FIELDS.has(fieldKey)) {
    return 28;
  }

  return FIELD_REGISTRY_ENTRIES[fieldKey].criticality === "execution_critical" ? 18 : 0;
}

function bucketForQuestionType(questionType: QuestionSelectionType): QuestionPriorityBucket {
  switch (questionType) {
    case "contradiction_resolution":
      return "contradiction";
    case "critical_unknown":
      return "critical_unknown";
    case "branch_resolution":
      return "branch_resolution";
    case "overlay_confirmation":
      return "overlay_confirmation";
    case "assumption_confirmation":
      return "assumption_confirmation";
    case "roadmap_transition_readiness":
    case "execution_transition_readiness":
    case "readiness_blocker_resolution":
      return "readiness";
    case "partial_truth_narrowing":
      return "partial_gap";
    default:
      return "critical_gap";
  }
}

function followUpModeFor(args: {
  questionType: QuestionSelectionType;
  status?: QuestionCandidateStatus;
  recovery?: boolean;
  reopen?: boolean;
  transition?: boolean;
}) {
  if (args.transition) {
    return "transition" as const;
  }

  if (args.recovery) {
    return "recovery" as const;
  }

  if (args.reopen) {
    return "reopen" as const;
  }

  if (
    args.questionType === "assumption_confirmation" ||
    args.questionType === "overlay_confirmation"
  ) {
    return "confirmation" as const;
  }

  if (
    args.questionType === "partial_truth_narrowing" ||
    args.questionType === "actor_clarification" ||
    args.questionType === "workflow_clarification" ||
    args.questionType === "mvp_boundary_clarification" ||
    args.questionType === "systems_integration_clarification" ||
    args.questionType === "constraint_clarification"
  ) {
    return "narrowing" as const;
  }

  return "fresh" as const;
}

function candidateStatus(suppressed: boolean): QuestionCandidateStatus {
  return suppressed ? "suppressed" : "selectable";
}

function buildCandidate(args: {
  context: QuestionSelectionCandidateContext;
  target: QuestionCandidate["target"];
  questionType: QuestionSelectionType;
  priorityScore: number;
  whyChosen: string;
  smallestDecisionGap: string;
  selectionHint: string;
  blockingReason?: string;
  relatedFieldKeys: ExtractionFieldKey[];
  relatedCategoryKeys: ExtractionCategoryKey[];
  relatedAssumptionIds?: string[];
  relatedContradictionIds?: string[];
  relatedUnknownIds?: string[];
  branchResolutionRelevant?: boolean;
  roadmapReadinessRelevant?: boolean;
  executionReadinessRelevant?: boolean;
  blocksRoadmapMovement?: boolean;
  blocksExecutionMovement?: boolean;
  followUpMode: QuestionCandidate["followUpMode"];
  suppressionReasons?: string[];
  sourceIds?: string[];
  evidenceIds?: string[];
  expectedConfidenceGain?: number;
}) {
  const suppressionReasons = args.suppressionReasons ?? [];
  const status = candidateStatus(suppressionReasons.length > 0);
  const questionId = createQuestionRecordId(
    "question",
    `${args.target.targetId}-${args.questionType}-${args.selectionHint}`
  );

  return {
    id: questionId,
    date: nowIso(),
    questionId,
    target: args.target,
    questionType: args.questionType,
    priorityBucket: bucketForQuestionType(args.questionType),
    priorityScore: args.priorityScore,
    whyChosen: args.whyChosen,
    smallestDecisionGap: args.smallestDecisionGap,
    blockingReason: args.blockingReason,
    selectionHint: args.selectionHint,
    relatedFieldKeys: dedupe(args.relatedFieldKeys),
    relatedCategoryKeys: dedupe(args.relatedCategoryKeys),
    relatedAssumptionIds: dedupe(args.relatedAssumptionIds ?? []),
    relatedContradictionIds: dedupe(args.relatedContradictionIds ?? []),
    relatedUnknownIds: dedupe(args.relatedUnknownIds ?? []),
    branchResolutionRelevant: args.branchResolutionRelevant ?? false,
    roadmapReadinessRelevant: args.roadmapReadinessRelevant ?? false,
    executionReadinessRelevant: args.executionReadinessRelevant ?? false,
    blocksRoadmapMovement: args.blocksRoadmapMovement ?? false,
    blocksExecutionMovement: args.blocksExecutionMovement ?? false,
    followUpMode: args.followUpMode,
    status,
    suppressionReasons,
    sourceIds: dedupe(args.sourceIds ?? []),
    evidenceIds: dedupe(args.evidenceIds ?? []),
    expectedConfidenceGain: createQuestionConfidence(
      args.expectedConfidenceGain ?? 0.18,
      "Expected confidence gain from resolving this question."
    ),
    preparedBy: args.context.preparedBy
  } satisfies QuestionCandidate;
}

function fieldTargetReference(fieldKey: ExtractionFieldKey) {
  const entry = STATIC_QUESTION_TARGET_REGISTRY[buildFieldTargetId(fieldKey)];

  return buildTargetReference({
    targetId: entry.targetId,
    label: entry.label,
    fieldKey,
    categoryKey: entry.categoryKeys[0]
  });
}

function questionTypeForField(fieldKey: ExtractionFieldKey, status: string) {
  if (status === "inferred") {
    return "assumption_confirmation" as const;
  }

  if (status === "conflicting") {
    return fieldKey === "primary_branch" || fieldKey === "product_type"
      ? ("branch_resolution" as const)
      : ("readiness_blocker_resolution" as const);
  }

  return FIELD_QUESTION_TYPE_MAP[fieldKey];
}

export function buildContradictionCandidates(context: QuestionSelectionCandidateContext) {
  return context.extractionState.contradictions
    .filter((contradiction) => contradiction.status === "open")
    .map((contradiction) => {
      const branchRelevant = contradiction.linkedCategoryKeys.some((categoryKey) =>
        ["branch_product_type", "actors", "workflow", "business_model"].includes(categoryKey)
      );
      const severityScore =
        CONTRADICTION_SEVERITY_SCORE[
          contradiction.severity as keyof typeof CONTRADICTION_SEVERITY_SCORE
        ] ?? 36;
      const targetFieldKey = contradiction.linkedFieldKeys[0];
      const targetCategoryKey = contradiction.linkedCategoryKeys[0];
      const target = targetFieldKey
        ? fieldTargetReference(targetFieldKey)
        : buildTargetReference({
            targetId: `contradiction:${contradiction.contradictionId}`,
            label: contradiction.title,
            contradictionId: contradiction.contradictionId,
            categoryKey: targetCategoryKey
          });

      return buildCandidate({
        context,
        target,
        questionType: "contradiction_resolution",
        priorityScore:
          candidatePriorityBase("contradiction_resolution") +
          severityScore +
          (contradiction.blocked ? 28 : 0),
        whyChosen:
          contradiction.blocked || contradiction.severity === "critical"
            ? "A blocking contradiction must be resolved before roadmap or execution can stay trustworthy."
            : "An open contradiction is reducing confidence and can reopen downstream decisions.",
        smallestDecisionGap: contradiction.recommendedResolutionPath,
        selectionHint: contradiction.title,
        blockingReason: contradiction.blocked ? contradiction.title : undefined,
        relatedFieldKeys: contradiction.linkedFieldKeys,
        relatedCategoryKeys: contradiction.linkedCategoryKeys,
        relatedContradictionIds: [contradiction.contradictionId],
        branchResolutionRelevant: branchRelevant,
        roadmapReadinessRelevant: contradiction.blocked || contradiction.severity === "critical",
        executionReadinessRelevant:
          contradiction.blocked ||
          contradiction.severity === "high" ||
          contradiction.severity === "critical",
        blocksRoadmapMovement: contradiction.blocked || contradiction.severity === "critical",
        blocksExecutionMovement:
          contradiction.blocked ||
          contradiction.severity === "high" ||
          contradiction.severity === "critical",
        followUpMode: followUpModeFor({
          questionType: "contradiction_resolution",
          reopen: true
        }),
        sourceIds: contradiction.sourceIds,
        evidenceIds: contradiction.evidenceIds,
        expectedConfidenceGain:
          contradiction.blocked || contradiction.severity === "critical" ? 0.36 : 0.24
      });
    });
}

export function buildUnknownCandidates(context: QuestionSelectionCandidateContext) {
  return context.extractionState.unknowns
    .filter((unknown) => !unknown.resolved)
    .map((unknown) => {
      const targetFieldKey = unknown.linkedFieldKeys[0];
      const target = targetFieldKey
        ? fieldTargetReference(targetFieldKey)
        : buildTargetReference({
            targetId: `unknown:${unknown.unknownId}`,
            label: unknown.question,
            unknownId: unknown.unknownId,
            categoryKey: unknown.categoryKey,
            branchResolutionTarget:
              unknown.recommendedNextQuestionTarget as BranchResolutionTarget
          });
      const branchRelevant = unknown.categoryKey === "branch_product_type";
      const roadmapRelevant =
        unknown.blockingStage === "roadmap" || unknown.blockingStage === "both";
      const executionRelevant =
        unknown.blockingStage === "execution" || unknown.blockingStage === "both";

      return buildCandidate({
        context,
        target,
        questionType: "critical_unknown",
        priorityScore:
          candidatePriorityBase("critical_unknown") +
          riskLevelWeight(unknown.urgency) +
          (roadmapRelevant || executionRelevant ? 24 : 0),
        whyChosen:
          unknown.blockingStage === "both"
            ? "This unresolved unknown blocks both roadmap and execution movement."
            : unknown.blockingStage === "roadmap"
            ? "This unresolved unknown is blocking roadmap movement."
            : unknown.blockingStage === "execution"
            ? "This unresolved unknown is blocking execution movement."
            : "This unresolved unknown still reduces confidence materially.",
        smallestDecisionGap: unknown.whyItMatters,
        selectionHint: unknown.question,
        blockingReason: unknown.whatItBlocks,
        relatedFieldKeys: unknown.linkedFieldKeys,
        relatedCategoryKeys: [unknown.categoryKey],
        relatedUnknownIds: [unknown.unknownId],
        branchResolutionRelevant: branchRelevant,
        roadmapReadinessRelevant: roadmapRelevant,
        executionReadinessRelevant: executionRelevant,
        blocksRoadmapMovement: roadmapRelevant,
        blocksExecutionMovement: executionRelevant,
        followUpMode: followUpModeFor({
          questionType: "critical_unknown"
        }),
        sourceIds: uniqueFieldSources(context, unknown.linkedFieldKeys),
        evidenceIds: uniqueFieldEvidence(context, unknown.linkedFieldKeys),
        expectedConfidenceGain: roadmapRelevant || executionRelevant ? 0.32 : 0.22
      });
    });
}

function determineFieldTarget(args: {
  context: QuestionSelectionCandidateContext;
  fieldKey: ExtractionFieldKey;
}) {
  const field = args.context.extractionState.fields[args.fieldKey];
  const lastSignalIsRecovery = recoverySignal(args.context.lastResponseSignal);

  if (lastSignalIsRecovery) {
    const recoveryTargetId = selectRecoveryTargetId({
      context: args.context,
      targetId: buildFieldTargetId(args.fieldKey)
    });

    if (recoveryTargetId?.startsWith("field:")) {
      return {
        targetFieldKey: recoveryTargetId.slice("field:".length) as ExtractionFieldKey,
        recovery: true,
        retargeted: recoveryTargetId !== buildFieldTargetId(args.fieldKey)
      };
    }
  }

  if (field.status === "partial") {
    const narrowingTargetId = selectNarrowingTargetId({
      context: args.context,
      baseFieldKey: args.fieldKey
    });

    if (narrowingTargetId?.startsWith("field:")) {
      return {
        targetFieldKey: narrowingTargetId.slice("field:".length) as ExtractionFieldKey,
        recovery: false,
        retargeted: narrowingTargetId !== buildFieldTargetId(args.fieldKey)
      };
    }
  }

  return {
    targetFieldKey: args.fieldKey,
    recovery: false,
    retargeted: false
  };
}

export function buildFieldCandidates(context: QuestionSelectionCandidateContext) {
  return EXTRACTION_FIELD_KEYS.flatMap((fieldKey) => {
    const field = context.extractionState.fields[fieldKey];

    if (field.status === "answered" || field.status === "validated") {
      return [];
    }

    if (
      (fieldKey === "primary_branch" || fieldKey === "product_type") &&
      context.branchClassification.branchResolutionRequired
    ) {
      return [];
    }

    if (field.status === "inferred" && hasOpenAssumptionForField(context, fieldKey)) {
      return [];
    }

    if (field.status === "conflicting" && hasOpenContradictionForField(context, fieldKey)) {
      return [];
    }

    const targetDecision = determineFieldTarget({
      context,
      fieldKey
    });
    const targetFieldKey = targetDecision.targetFieldKey;
    const targetField = context.extractionState.fields[targetFieldKey];
    const questionType =
      targetDecision.recovery && targetFieldKey !== fieldKey
        ? questionTypeForField(targetFieldKey, targetField.status)
        : targetDecision.retargeted && field.status === "partial"
        ? ("partial_truth_narrowing" as const)
        : questionTypeForField(fieldKey, field.status);
    const relatedFieldKeys = dedupe(
      targetFieldKey === fieldKey ? [fieldKey] : [fieldKey, targetFieldKey]
    );
    const relatedCategoryKeys = uniqueFieldCategories(relatedFieldKeys);
    const roadmapRelevant = relatedFieldKeys.some((key) =>
      blocksRoadmap(key, context.extractionState.fields[key].status)
    );
    const executionRelevant = relatedFieldKeys.some((key) =>
      blocksExecution(key, context.extractionState.fields[key].status)
    );
    const registryEntry = FIELD_REGISTRY_ENTRIES[fieldKey];
    const targetRegistryEntry = FIELD_REGISTRY_ENTRIES[targetFieldKey];
    const priorityScore =
      candidatePriorityBase(questionType) +
      fieldStatusWeight(field.status) +
      highImpactFieldPriorityBoost(fieldKey) +
      (registryEntry.branchRelevant ? 12 : 0) +
      (targetRegistryEntry.overlayRelevant ? 8 : 0) +
      field.dependencyBlockers.length * 6 +
      stageBoost({
        context,
        roadmapRelevant,
        executionRelevant
      });
    const selectionHint = targetDecision.recovery
      ? `Recover ${field.label} by asking about ${targetField.label}.`
      : targetDecision.retargeted
      ? `Narrow ${field.label} through ${targetField.label}.`
      : `Clarify ${field.label}.`;

    return [
      buildCandidate({
        context,
        target: fieldTargetReference(targetFieldKey),
        questionType,
        priorityScore,
        whyChosen: buildFieldWhyChosen({
          fieldKey,
          status: field.status,
          recovery: targetDecision.recovery,
          retargeted: targetDecision.retargeted
        }),
        smallestDecisionGap: buildGapText({
          fieldKey: targetFieldKey
        }),
        selectionHint,
        blockingReason:
          field.dependencyBlockers.length > 0
            ? field.dependencyBlockers.join(" ")
            : roadmapRelevant || executionRelevant
            ? `${field.label} is still blocking a later transition.`
            : undefined,
        relatedFieldKeys,
        relatedCategoryKeys,
        branchResolutionRelevant:
          registryEntry.branchRelevant || targetRegistryEntry.branchRelevant,
        roadmapReadinessRelevant: roadmapRelevant,
        executionReadinessRelevant: executionRelevant,
        blocksRoadmapMovement: roadmapRelevant,
        blocksExecutionMovement: executionRelevant,
        followUpMode: followUpModeFor({
          questionType,
          recovery: targetDecision.recovery
        }),
        sourceIds: uniqueFieldSources(context, relatedFieldKeys),
        evidenceIds: uniqueFieldEvidence(context, relatedFieldKeys),
        expectedConfidenceGain:
          field.status === "conflicting"
            ? 0.28
            : field.status === "partial"
            ? 0.22
            : field.status === "inferred"
            ? 0.18
            : 0.24
      })
    ];
  });
}

export function buildBranchResolutionCandidates(
  context: QuestionSelectionCandidateContext
) {
  if (!context.branchClassification.branchResolutionRequired) {
    return [];
  }

  const ambiguity = context.branchClassification.ambiguity;
  const primaryLabel = context.branchClassification.primaryBranch?.branch ?? "Unresolved branch";
  const competingLabel =
    ambiguity.competingBranches[1]?.branch ?? ambiguity.competingBranches[0]?.branch;
  const target = resolutionTargetReference(ambiguity.recommendedQuestionTarget);
  const relatedFieldKeys = dedupe(
    mergeUnique(
      context.branchClassification.sourceFieldKeys,
      context.branchClassification.blockers.flatMap((blocker) => blocker.linkedFieldKeys)
    )
  );
  const relatedCategoryKeys = dedupe(
    mergeUnique(
      uniqueFieldCategories(relatedFieldKeys),
      context.branchClassification.blockers.flatMap((blocker) => blocker.linkedCategoryKeys)
    )
  );

  return [
    buildCandidate({
      context,
      target,
      questionType: "branch_resolution",
      priorityScore:
        candidatePriorityBase("branch_resolution") +
        BRANCH_AMBIGUITY_SCORE[ambiguity.severity] +
        (ambiguity.blocksRoadmap ? 42 : 0) +
        stageBoost({
          context,
          roadmapRelevant: true,
          executionRelevant: true
        }),
      whyChosen:
        ambiguity.blocksRoadmap || ambiguity.severity === "high"
          ? "Branch ambiguity is still large enough to change architecture and roadmap direction."
          : "Multiple branch families are still competing, so the next question should collapse that ambiguity first.",
      smallestDecisionGap:
        ambiguity.missingInformationNeeded[0] ??
        "Resolve the smallest remaining branch-shape decision.",
      selectionHint: competingLabel
        ? `Separate ${primaryLabel} from ${competingLabel}.`
        : "Resolve the remaining branch ambiguity.",
      blockingReason: ambiguity.blocksRoadmap ? ambiguity.reason : undefined,
      relatedFieldKeys,
      relatedCategoryKeys,
      branchResolutionRelevant: true,
      roadmapReadinessRelevant: true,
      executionReadinessRelevant: true,
      blocksRoadmapMovement: ambiguity.blocksRoadmap,
      blocksExecutionMovement: context.branchClassification.branchStability !== "Stable",
      followUpMode: followUpModeFor({
        questionType: "branch_resolution",
        reopen: ambiguity.severity === "high" || ambiguity.severity === "critical"
      }),
      sourceIds: context.branchClassification.sourceIds,
      evidenceIds: context.branchClassification.evidenceIds,
      expectedConfidenceGain: ambiguity.blocksRoadmap ? 0.34 : 0.24
    })
  ];
}

function overlayBlocksRoadmap(overlay: BranchOverlayActivation) {
  const architectureRelevant = ARCHITECTURE_RELEVANT_OVERLAYS.has(overlay.overlayKey);
  const trustRelevant = overlay.likelyAffectedSystems.some((system) =>
    TRUST_CRITICAL_OVERLAY_SYSTEMS.has(system)
  );

  return (
    architectureRelevant &&
    (overlay.state === "possible" ||
      (overlay.state === "active" && overlay.confidence.score < 0.78)) &&
    (trustRelevant || overlay.likelyAffectedSystems.length >= 3)
  );
}

function overlayBlocksExecution(overlay: BranchOverlayActivation) {
  const trustRelevant = overlay.likelyAffectedSystems.some((system) =>
    TRUST_CRITICAL_OVERLAY_SYSTEMS.has(system)
  );

  return (
    trustRelevant &&
    (overlay.state === "possible" ||
      (overlay.state === "active" && overlay.confidence.score < 0.82))
  );
}

export function buildOverlayConfirmationCandidates(
  context: QuestionSelectionCandidateContext
) {
  return Object.values(context.branchClassification.overlays)
    .filter((overlay) => {
      if (!ARCHITECTURE_RELEVANT_OVERLAYS.has(overlay.overlayKey)) {
        return false;
      }

      return (
        overlay.state === "possible" ||
        (overlay.state === "active" && overlay.confidence.score < 0.82)
      );
    })
    .map((overlay) => {
      const roadmapRelevant = overlayBlocksRoadmap(overlay);
      const executionRelevant = overlayBlocksExecution(overlay);
      const relatedCategoryKeys = uniqueFieldCategories(overlay.sourceFieldKeys);
      const trustRelevant = overlay.likelyAffectedSystems.some((system) =>
        TRUST_CRITICAL_OVERLAY_SYSTEMS.has(system)
      );

      return buildCandidate({
        context,
        target: buildTargetReference({
          targetId: `overlay:${overlay.overlayKey}`,
          label: overlay.label,
          overlayKey: overlay.overlayKey
        }),
        questionType: "overlay_confirmation",
        priorityScore:
          candidatePriorityBase("overlay_confirmation") +
          OVERLAY_STATE_SCORE[overlay.state] +
          (trustRelevant ? 22 : 0) +
          stageBoost({
            context,
            roadmapRelevant,
            executionRelevant
          }),
        whyChosen:
          overlay.state === "possible"
            ? "This overlay is only partially supported but could materially change system surfaces."
            : "The overlay looks active, but confidence is not yet high enough to treat it as stable architecture truth.",
        smallestDecisionGap: overlay.reason,
        selectionHint: `Confirm ${overlay.label} overlay scope.`,
        blockingReason:
          roadmapRelevant || executionRelevant
            ? `${overlay.label} changes downstream architecture assumptions.`
            : undefined,
        relatedFieldKeys: overlay.sourceFieldKeys,
        relatedCategoryKeys,
        roadmapReadinessRelevant: roadmapRelevant,
        executionReadinessRelevant: executionRelevant,
        blocksRoadmapMovement: roadmapRelevant,
        blocksExecutionMovement: executionRelevant,
        followUpMode: followUpModeFor({
          questionType: "overlay_confirmation"
        }),
        sourceIds: overlay.sourceIds,
        evidenceIds: overlay.evidenceIds,
        expectedConfidenceGain: roadmapRelevant || executionRelevant ? 0.22 : 0.16
      });
    });
}

function assumptionBlocksRoadmap(
  linkedFieldKeys: readonly ExtractionFieldKey[],
  highSensitivity: boolean
) {
  return (
    highSensitivity &&
    linkedFieldKeys.some((fieldKey) => HIGH_IMPACT_ROADMAP_FIELDS.has(fieldKey))
  );
}

function assumptionRiskLevel(args: {
  highSensitivity: boolean;
  confirmationRequired: boolean;
}) {
  if (args.highSensitivity && args.confirmationRequired) {
    return "high" as const;
  }

  if (args.highSensitivity) {
    return "moderate" as const;
  }

  return "low" as const;
}

export function buildAssumptionCandidates(context: QuestionSelectionCandidateContext) {
  return context.extractionState.assumptions
    .filter(
      (assumption) =>
        assumption.status === "open" &&
        (assumption.confirmationRequired || assumption.highSensitivity)
    )
    .map((assumption) => {
      const baseFieldKey = assumption.linkedFieldKeys[0];
      const lastSignalIsRecovery = recoverySignal(context.lastResponseSignal);
      const recoveryTargetId =
        lastSignalIsRecovery && baseFieldKey
          ? selectRecoveryTargetId({
              context,
              targetId: buildFieldTargetId(baseFieldKey)
            })
          : null;
      const targetFieldKey =
        recoveryTargetId?.startsWith("field:")
          ? (recoveryTargetId.slice("field:".length) as ExtractionFieldKey)
          : baseFieldKey;
      const target = targetFieldKey
        ? fieldTargetReference(targetFieldKey)
        : assumption.linkedCategoryKeys[0]
        ? categoryTargetReference(assumption.linkedCategoryKeys[0])
        : buildTargetReference({
            targetId: `assumption:${assumption.assumptionId}`,
            label: assumption.statement,
            assumptionId: assumption.assumptionId,
            categoryKey: assumption.categoryKey
          });
      const relatedFieldKeys = dedupe(
        targetFieldKey && baseFieldKey && targetFieldKey !== baseFieldKey
          ? [...assumption.linkedFieldKeys, targetFieldKey]
          : assumption.linkedFieldKeys
      );
      const relatedCategoryKeys = dedupe(
        mergeUnique(assumption.linkedCategoryKeys, uniqueFieldCategories(relatedFieldKeys))
      );
      const derivedRiskLevel = assumptionRiskLevel({
        highSensitivity: assumption.highSensitivity,
        confirmationRequired: assumption.confirmationRequired
      });
      const roadmapRelevant = assumptionBlocksRoadmap(
        relatedFieldKeys,
        assumption.highSensitivity
      );
      const executionRelevant = assumption.highSensitivity || assumption.confirmationRequired;

      return buildCandidate({
        context,
        target,
        questionType:
          lastSignalIsRecovery && targetFieldKey
            ? questionTypeForField(targetFieldKey, context.extractionState.fields[targetFieldKey].status)
            : "assumption_confirmation",
        priorityScore:
          candidatePriorityBase("assumption_confirmation") +
          riskLevelWeight(derivedRiskLevel) +
          (assumption.confirmationRequired ? 18 : 0) +
          stageBoost({
            context,
            roadmapRelevant,
            executionRelevant
          }),
        whyChosen: lastSignalIsRecovery
          ? "The last response signaled uncertainty, so the engine shifted to a smaller adjacent truth that can confirm or disprove the assumption indirectly."
          : assumption.highSensitivity
          ? "This open assumption is high-sensitivity and should not stay implicit for too long."
          : "This inferred assumption still needs explicit confirmation before later execution work depends on it.",
        smallestDecisionGap:
          assumption.invalidationTriggers[0] ??
          assumption.whyInferred,
        selectionHint: lastSignalIsRecovery && targetFieldKey
          ? `Recover assumption via ${EXTRACTION_FIELD_DEFINITIONS[targetFieldKey].label}.`
          : `Confirm assumption: ${assumption.statement}`,
        blockingReason:
          roadmapRelevant || executionRelevant
            ? "A high-impact assumption is still unresolved."
            : undefined,
        relatedFieldKeys,
        relatedCategoryKeys,
        relatedAssumptionIds: [assumption.assumptionId],
        branchResolutionRelevant: relatedCategoryKeys.includes("branch_product_type"),
        roadmapReadinessRelevant: roadmapRelevant,
        executionReadinessRelevant: executionRelevant,
        blocksRoadmapMovement: roadmapRelevant,
        blocksExecutionMovement: executionRelevant,
        followUpMode: followUpModeFor({
          questionType: "assumption_confirmation",
          recovery: lastSignalIsRecovery
        }),
        sourceIds: dedupe([...assumption.sourceIds, ...uniqueFieldSources(context, relatedFieldKeys)]),
        evidenceIds: dedupe([
          ...assumption.evidenceIds,
          ...uniqueFieldEvidence(context, relatedFieldKeys)
        ]),
        expectedConfidenceGain: roadmapRelevant || executionRelevant ? 0.24 : 0.18
      });
    });
}

export function buildReadinessTransitionCandidates(
  context: QuestionSelectionCandidateContext
) {
  const candidates: QuestionCandidate[] = [];
  const roadmapState = context.extractionState.roadmapReadiness;
  const executionState = context.extractionState.executionReadiness;

  if (
    !context.branchClassification.branchResolutionRequired &&
    (roadmapState.state === "provisional" || roadmapState.state === "ready")
  ) {
    candidates.push(
      buildCandidate({
        context,
        target: buildTargetReference({
          targetId: "readiness:roadmap",
          label: STATIC_QUESTION_TARGET_REGISTRY["readiness:roadmap"].label,
          readinessStage: "roadmap"
        }),
        questionType: "roadmap_transition_readiness",
        priorityScore:
          candidatePriorityBase("roadmap_transition_readiness") +
          (roadmapState.ready ? 36 : 14) +
          stageBoost({
            context,
            roadmapRelevant: true,
            executionRelevant: false
          }),
        whyChosen: roadmapState.ready
          ? "Roadmap-critical truth looks sufficiently complete, so the next question can confirm transition readiness instead of reopening lower-value details."
          : "Roadmap readiness is close enough that a final readiness check can be more valuable than another broad refinement question.",
        smallestDecisionGap:
          roadmapState.blockers[0] ??
          "Confirm whether enough roadmap-critical truth exists to move forward.",
        selectionHint: roadmapState.ready
          ? "Confirm roadmap transition readiness."
          : "Resolve the last roadmap transition blocker.",
        relatedFieldKeys: roadmapState.missingFieldKeys,
        relatedCategoryKeys: roadmapState.satisfiedCategoryKeys,
        roadmapReadinessRelevant: true,
        blocksRoadmapMovement: false,
        followUpMode: followUpModeFor({
          questionType: "roadmap_transition_readiness",
          transition: true
        }),
        expectedConfidenceGain: roadmapState.ready ? 0.16 : 0.12
      })
    );
  }

  if (
    context.currentStage === "execution-prep" &&
    context.branchClassification.branchStability === "Stable" &&
    (executionState.state === "provisional" || executionState.state === "ready")
  ) {
    candidates.push(
      buildCandidate({
        context,
        target: buildTargetReference({
          targetId: "readiness:execution",
          label: STATIC_QUESTION_TARGET_REGISTRY["readiness:execution"].label,
          readinessStage: "execution"
        }),
        questionType: "execution_transition_readiness",
        priorityScore:
          candidatePriorityBase("execution_transition_readiness") +
          (executionState.ready ? 42 : 18) +
          stageBoost({
            context,
            roadmapRelevant: false,
            executionRelevant: true
          }),
        whyChosen: executionState.ready
          ? "Execution-critical truth looks sufficiently complete, so the next question can confirm whether execution movement is now safe."
          : "Execution readiness is close enough that one more transition-focused question may be more valuable than another broad refinement.",
        smallestDecisionGap:
          executionState.blockers[0] ??
          "Confirm whether enough execution-critical truth exists to move toward implementation.",
        selectionHint: executionState.ready
          ? "Confirm execution transition readiness."
          : "Resolve the last execution transition blocker.",
        relatedFieldKeys: executionState.missingFieldKeys,
        relatedCategoryKeys: executionState.satisfiedCategoryKeys,
        executionReadinessRelevant: true,
        blocksExecutionMovement: false,
        followUpMode: followUpModeFor({
          questionType: "execution_transition_readiness",
          transition: true
        }),
        expectedConfidenceGain: executionState.ready ? 0.18 : 0.12
      })
    );
  }

  return candidates;
}

function dedupeCandidatesByTarget(candidates: QuestionCandidate[]) {
  const bestByTarget = new Map<string, QuestionCandidate>();

  for (const candidate of candidates) {
    const existing = bestByTarget.get(candidate.target.targetId);

    if (!existing || candidate.priorityScore > existing.priorityScore) {
      bestByTarget.set(candidate.target.targetId, candidate);
    }
  }

  return [...bestByTarget.values()];
}

export function buildQuestionCandidates(context: QuestionSelectionCandidateContext) {
  return dedupeCandidatesByTarget([
    ...buildContradictionCandidates(context),
    ...buildUnknownCandidates(context),
    ...buildFieldCandidates(context),
    ...buildBranchResolutionCandidates(context),
    ...buildOverlayConfirmationCandidates(context),
    ...buildAssumptionCandidates(context),
    ...buildReadinessTransitionCandidates(context)
  ]);
}
