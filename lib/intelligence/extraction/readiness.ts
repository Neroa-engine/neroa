import {
  ARCHITECTURE_CONFIDENCE_THRESHOLDS,
  type FieldStatus
} from "@/lib/governance";
import {
  EXECUTION_MINIMUM_CATEGORY_KEYS,
  EXTRACTION_FIELD_DEFINITIONS,
  ROADMAP_MINIMUM_CATEGORY_KEYS,
  getCriticalFieldKeysForCategory,
  type ExtractionFieldKey
} from "./catalog";
import { buildConfidenceRollups, getFieldScore } from "./confidence";
import type { ExtractionReadinessEvaluation, ExtractionState } from "./types";

const ROADMAP_MINIMUM_FIELD_SCORE =
  ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionCriticalCategoryMinimum / 100;
const EXECUTION_MINIMUM_FIELD_SCORE =
  ARCHITECTURE_CONFIDENCE_THRESHOLDS.executionCriticalDimensionMinimum / 100;

function getRoadmapBlockingStatuses(status: FieldStatus) {
  return status === "unanswered" || status === "conflicting";
}

function getExecutionBlockingStatuses(status: FieldStatus) {
  return status === "unanswered" || status === "conflicting" || status === "partial";
}

function dedupe<T>(values: T[]) {
  return [...new Set(values)];
}

function deriveReadinessState(args: {
  ready: boolean;
  blocked: boolean;
  confidence: number;
  threshold: number;
}) {
  if (args.blocked) {
    return "blocked" as const;
  }

  if (args.ready) {
    return "ready" as const;
  }

  if (args.confidence >= args.threshold * 0.8) {
    return "provisional" as const;
  }

  return "not_ready" as const;
}

function collectCriticalFieldKeys(stage: "roadmap" | "execution") {
  const categories =
    stage === "roadmap"
      ? ROADMAP_MINIMUM_CATEGORY_KEYS
      : EXECUTION_MINIMUM_CATEGORY_KEYS;

  return dedupe(
    categories.flatMap((categoryKey) => getCriticalFieldKeysForCategory(categoryKey, stage))
  );
}

function getBlockingUnknowns(state: ExtractionState, stage: "roadmap" | "execution") {
  return state.unknowns.filter((unknown) => {
    if (unknown.resolved) {
      return false;
    }

    return (
      unknown.blockingStage === stage ||
      unknown.blockingStage === "both"
    );
  });
}

function getBlockingAssumptions(state: ExtractionState, stage: "roadmap" | "execution") {
  return state.assumptions.filter((assumption) => {
    if (assumption.status !== "open") {
      return false;
    }

    if (stage === "roadmap") {
      return (
        assumption.highSensitivity &&
        assumption.linkedFieldKeys.some((fieldKey) =>
          [
            "primary_branch",
            "mvp_in_scope",
            "mvp_out_of_scope",
            "systems_touched",
            "constraints"
          ].includes(fieldKey)
        )
      );
    }

    return assumption.highSensitivity || assumption.confirmationRequired;
  });
}

function buildBlockers(args: {
  missingFieldKeys: ExtractionFieldKey[];
  lowConfidenceFieldKeys: ExtractionFieldKey[];
  contradictionTitles: string[];
  unknownQuestions: string[];
  assumptionStatements: string[];
}) {
  return dedupe([
    ...args.missingFieldKeys.map(
      (fieldKey) => `Missing or conflicting field: ${EXTRACTION_FIELD_DEFINITIONS[fieldKey].label}.`
    ),
    ...args.lowConfidenceFieldKeys.map(
      (fieldKey) =>
        `Critical field below threshold: ${EXTRACTION_FIELD_DEFINITIONS[fieldKey].label}.`
    ),
    ...args.contradictionTitles.map(
      (title) => `Open contradiction: ${title}.`
    ),
    ...args.unknownQuestions.map(
      (question) => `Blocking unknown: ${question}.`
    ),
    ...args.assumptionStatements.map(
      (statement) => `Open assumption requiring confirmation: ${statement}.`
    )
  ]);
}

export function evaluateRoadmapReadiness(state: ExtractionState): ExtractionReadinessEvaluation {
  const confidenceRollups = buildConfidenceRollups(state);
  const criticalFieldKeys = collectCriticalFieldKeys("roadmap");
  const missingFieldKeys = criticalFieldKeys.filter((fieldKey) => {
    return getRoadmapBlockingStatuses(state.fields[fieldKey].status);
  });
  const lowConfidenceFieldKeys = criticalFieldKeys.filter((fieldKey) => {
    return getFieldScore(state, fieldKey) < ROADMAP_MINIMUM_FIELD_SCORE;
  });
  const blockingContradictions = state.contradictions.filter((contradiction) => {
    return contradiction.status === "open" && contradiction.severity === "critical";
  });
  const blockingUnknowns = getBlockingUnknowns(state, "roadmap");
  const blockingAssumptions = getBlockingAssumptions(state, "roadmap");
  const satisfiedCategoryKeys = ROADMAP_MINIMUM_CATEGORY_KEYS.filter((categoryKey) => {
    return confidenceRollups.categories[categoryKey].confidence.score >=
      ROADMAP_MINIMUM_FIELD_SCORE;
  });
  const ready =
    missingFieldKeys.length === 0 &&
    lowConfidenceFieldKeys.length === 0 &&
    blockingContradictions.length === 0 &&
    blockingUnknowns.length === 0 &&
    blockingAssumptions.length === 0 &&
    state.branchClassification.branchStability === "Stable" &&
    confidenceRollups.roadmapReadiness.score >=
      ARCHITECTURE_CONFIDENCE_THRESHOLDS.roadmapDrafting / 100;

  const blockers = buildBlockers({
    missingFieldKeys,
    lowConfidenceFieldKeys,
    contradictionTitles: blockingContradictions.map((contradiction) => contradiction.title),
    unknownQuestions: blockingUnknowns.map((unknown) => unknown.question),
    assumptionStatements: blockingAssumptions.map((assumption) => assumption.statement)
  });

  return {
    state: deriveReadinessState({
      ready,
      blocked: blockingContradictions.length > 0,
      confidence: confidenceRollups.roadmapReadiness.score,
      threshold: ARCHITECTURE_CONFIDENCE_THRESHOLDS.roadmapDrafting / 100
    }),
    ready,
    confidence: confidenceRollups.roadmapReadiness,
    satisfiedCategoryKeys,
    missingFieldKeys: dedupe([...missingFieldKeys, ...lowConfidenceFieldKeys]),
    blockingContradictionIds: blockingContradictions.map(
      (contradiction) => contradiction.contradictionId
    ),
    blockingUnknownIds: blockingUnknowns.map((unknown) => unknown.unknownId),
    blockingAssumptionIds: blockingAssumptions.map(
      (assumption) => assumption.assumptionId
    ),
    blockers
  };
}

export function evaluateExecutionReadiness(state: ExtractionState): ExtractionReadinessEvaluation {
  const confidenceRollups = buildConfidenceRollups(state);
  const criticalFieldKeys = collectCriticalFieldKeys("execution");
  const missingFieldKeys = criticalFieldKeys.filter((fieldKey) => {
    return getExecutionBlockingStatuses(state.fields[fieldKey].status);
  });
  const lowConfidenceFieldKeys = criticalFieldKeys.filter((fieldKey) => {
    return getFieldScore(state, fieldKey) < EXECUTION_MINIMUM_FIELD_SCORE;
  });
  const blockingContradictions = state.contradictions.filter((contradiction) => {
    return (
      contradiction.status === "open" &&
      (contradiction.severity === "high" || contradiction.severity === "critical")
    );
  });
  const blockingUnknowns = getBlockingUnknowns(state, "execution");
  const blockingAssumptions = getBlockingAssumptions(state, "execution");
  const satisfiedCategoryKeys = EXECUTION_MINIMUM_CATEGORY_KEYS.filter((categoryKey) => {
    return confidenceRollups.categories[categoryKey].confidence.score >=
      EXECUTION_MINIMUM_FIELD_SCORE;
  });
  const ready =
    missingFieldKeys.length === 0 &&
    lowConfidenceFieldKeys.length === 0 &&
    blockingContradictions.length === 0 &&
    blockingUnknowns.length === 0 &&
    blockingAssumptions.length === 0 &&
    state.branchClassification.branchStability === "Stable" &&
    confidenceRollups.executionReadiness.score >=
      ARCHITECTURE_CONFIDENCE_THRESHOLDS.executionEligibility / 100;

  const blockers = buildBlockers({
    missingFieldKeys,
    lowConfidenceFieldKeys,
    contradictionTitles: blockingContradictions.map((contradiction) => contradiction.title),
    unknownQuestions: blockingUnknowns.map((unknown) => unknown.question),
    assumptionStatements: blockingAssumptions.map((assumption) => assumption.statement)
  });

  return {
    state: deriveReadinessState({
      ready,
      blocked:
        blockingContradictions.length > 0 ||
        state.branchClassification.branchStability !== "Stable",
      confidence: confidenceRollups.executionReadiness.score,
      threshold: ARCHITECTURE_CONFIDENCE_THRESHOLDS.executionEligibility / 100
    }),
    ready,
    confidence: confidenceRollups.executionReadiness,
    satisfiedCategoryKeys,
    missingFieldKeys: dedupe([...missingFieldKeys, ...lowConfidenceFieldKeys]),
    blockingContradictionIds: blockingContradictions.map(
      (contradiction) => contradiction.contradictionId
    ),
    blockingUnknownIds: blockingUnknowns.map((unknown) => unknown.unknownId),
    blockingAssumptionIds: blockingAssumptions.map(
      (assumption) => assumption.assumptionId
    ),
    blockers
  };
}
