import {
  ARCHITECTURE_CONFIDENCE_THRESHOLDS,
  type ContradictionSeverity
} from "@/lib/governance";
import {
  EXECUTION_MINIMUM_CATEGORY_KEYS,
  EXTRACTION_CATEGORY_DEFINITIONS,
  EXTRACTION_CATEGORY_KEYS,
  EXTRACTION_FIELD_DEFINITIONS,
  ROADMAP_MINIMUM_CATEGORY_KEYS,
  getCategoryFields,
  type ExtractionCategoryKey,
  type ExtractionFieldKey
} from "./catalog";
import type {
  ExtractionCategoryConfidence,
  ExtractionConfidenceRollups,
  ExtractionFieldState,
  ExtractionState,
  UnitIntervalConfidence
} from "./types";

const STATUS_CONFIDENCE_RANGES = {
  unanswered: { min: 0, max: 0.05 },
  partial: { min: 0.2, max: 0.74 },
  answered: { min: 0.65, max: 0.9 },
  inferred: { min: 0.55, max: 0.78 },
  conflicting: { min: 0.05, max: 0.35 },
  validated: { min: 0.8, max: 1 }
} as const;

const CONTRADICTION_PENALTIES: Record<ContradictionSeverity, number> = {
  minor: 0.03,
  moderate: 0.08,
  high: 0.15,
  critical: 0.25
};

const UNKNOWN_PENALTIES = {
  low: 0.02,
  moderate: 0.05,
  high: 0.08,
  critical: 0.12
} as const;

function clampUnitInterval(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function createUnitIntervalConfidence(
  score: number,
  minimum?: number,
  notes?: string
): UnitIntervalConfidence {
  const boundedScore = clampUnitInterval(score);
  const boundedMinimum = minimum === undefined ? undefined : clampUnitInterval(minimum);

  return {
    score: boundedScore,
    scale: "unit_interval",
    minimum: boundedMinimum,
    passed: boundedMinimum === undefined ? undefined : boundedScore >= boundedMinimum,
    notes
  };
}

export function normalizeFieldConfidence(field: ExtractionFieldState): UnitIntervalConfidence {
  const range = STATUS_CONFIDENCE_RANGES[field.status];

  if (field.status === "unanswered" || field.value === null) {
    return createUnitIntervalConfidence(0, 0);
  }

  const evidenceBonus = Math.min(field.evidenceIds.length * 0.03, 0.12);
  const blockerPenalty = Math.min(field.dependencyBlockers.length * 0.05, 0.15);
  const followUpPenalty = field.followUpRequired ? 0.05 : 0;
  const conflictPenalty = field.status === "conflicting" ? 0.08 : 0;
  const validatedBonus = field.status === "validated" ? 0.05 : 0;
  const normalizedScore = clampUnitInterval(
    field.confidence.score + evidenceBonus + validatedBonus - blockerPenalty - followUpPenalty - conflictPenalty
  );

  return createUnitIntervalConfidence(
    Math.max(range.min, Math.min(range.max, normalizedScore)),
    field.confidence.minimum,
    field.confidence.notes
  );
}

function buildAssumptionsCategoryConfidence(state: ExtractionState): ExtractionCategoryConfidence {
  const openAssumptions = state.assumptions.filter((assumption) => assumption.status === "open");
  const averageScore = average(openAssumptions.map((assumption) => assumption.confidence.score));
  const highSensitivityPenalty = openAssumptions.some((assumption) => assumption.highSensitivity)
    ? 0.1
    : 0;
  const followUpPenalty = openAssumptions.some((assumption) => assumption.confirmationRequired)
    ? 0.08
    : 0;
  const score =
    openAssumptions.length === 0
      ? 1
      : clampUnitInterval(averageScore - highSensitivityPenalty - followUpPenalty);

  return {
    categoryKey: "assumptions",
    confidence: createUnitIntervalConfidence(score),
    fieldKeys: [],
    missingFieldKeys: [],
    conflictingFieldKeys: [],
    blockingContradictionIds: [],
    blockingUnknownIds: []
  };
}

function buildContradictionsCategoryConfidence(state: ExtractionState): ExtractionCategoryConfidence {
  const openContradictions = state.contradictions.filter(
    (contradiction) => contradiction.status === "open"
  );
  const penalty = openContradictions.reduce((sum, contradiction) => {
    return sum + CONTRADICTION_PENALTIES[contradiction.severity];
  }, 0);

  return {
    categoryKey: "contradictions",
    confidence: createUnitIntervalConfidence(clampUnitInterval(1 - penalty)),
    fieldKeys: [],
    missingFieldKeys: [],
    conflictingFieldKeys: [],
    blockingContradictionIds: openContradictions.map(
      (contradiction) => contradiction.contradictionId
    ),
    blockingUnknownIds: []
  };
}

function buildUnknownsCategoryConfidence(state: ExtractionState): ExtractionCategoryConfidence {
  const unresolvedUnknowns = state.unknowns.filter((unknown) => unknown.resolved === false);
  const penalty = unresolvedUnknowns.reduce((sum, unknown) => {
    return sum + UNKNOWN_PENALTIES[unknown.urgency];
  }, 0);

  return {
    categoryKey: "unknowns",
    confidence: createUnitIntervalConfidence(clampUnitInterval(1 - penalty)),
    fieldKeys: [],
    missingFieldKeys: [],
    conflictingFieldKeys: [],
    blockingContradictionIds: [],
    blockingUnknownIds: unresolvedUnknowns.map((unknown) => unknown.unknownId)
  };
}

export function buildCategoryConfidence(
  state: ExtractionState,
  categoryKey: ExtractionCategoryKey
): ExtractionCategoryConfidence {
  if (categoryKey === "assumptions") {
    return buildAssumptionsCategoryConfidence(state);
  }

  if (categoryKey === "contradictions") {
    return buildContradictionsCategoryConfidence(state);
  }

  if (categoryKey === "unknowns") {
    return buildUnknownsCategoryConfidence(state);
  }

  const fieldDefinitions = getCategoryFields(categoryKey);
  const fields = fieldDefinitions.map((definition) => state.fields[definition.key]);
  const fieldScores = fields.map((field) => normalizeFieldConfidence(field).score);
  const contradictions = state.contradictions.filter((contradiction) => {
    return (
      contradiction.status === "open" &&
      contradiction.linkedCategoryKeys.includes(categoryKey)
    );
  });
  const contradictionPenalty = contradictions.reduce((sum, contradiction) => {
    return sum + CONTRADICTION_PENALTIES[contradiction.severity];
  }, 0);
  const unresolvedUnknowns = state.unknowns.filter((unknown) => {
    return unknown.resolved === false && unknown.categoryKey === categoryKey;
  });
  const unknownPenalty = unresolvedUnknowns.reduce((sum, unknown) => {
    return sum + UNKNOWN_PENALTIES[unknown.urgency];
  }, 0);
  const categoryScore = clampUnitInterval(
    average(fieldScores) - contradictionPenalty - unknownPenalty
  );

  return {
    categoryKey,
    confidence: createUnitIntervalConfidence(categoryScore),
    fieldKeys: fieldDefinitions.map((definition) => definition.key),
    missingFieldKeys: fields
      .filter((field) => field.status === "unanswered")
      .map((field) => field.fieldKey),
    conflictingFieldKeys: fields
      .filter((field) => field.status === "conflicting")
      .map((field) => field.fieldKey),
    blockingContradictionIds: contradictions.map(
      (contradiction) => contradiction.contradictionId
    ),
    blockingUnknownIds: unresolvedUnknowns.map((unknown) => unknown.unknownId)
  };
}

function buildWeightedAverage(
  categories: readonly ExtractionCategoryKey[],
  scores: Record<ExtractionCategoryKey, ExtractionCategoryConfidence>
) {
  const weightedTotal = categories.reduce((sum, categoryKey) => {
    return (
      sum +
      scores[categoryKey].confidence.score *
        EXTRACTION_CATEGORY_DEFINITIONS[categoryKey].weight
    );
  }, 0);
  const totalWeight = categories.reduce((sum, categoryKey) => {
    return sum + EXTRACTION_CATEGORY_DEFINITIONS[categoryKey].weight;
  }, 0);

  return totalWeight === 0 ? 0 : weightedTotal / totalWeight;
}

function buildFieldAverage(state: ExtractionState) {
  const fields = Object.values(state.fields) as ExtractionFieldState[];
  return createUnitIntervalConfidence(
    average(fields.map((field) => normalizeFieldConfidence(field).score))
  );
}

function buildRoadmapConfidence(
  state: ExtractionState,
  categories: Record<ExtractionCategoryKey, ExtractionCategoryConfidence>,
  overallScore: number
) {
  const base = buildWeightedAverage(ROADMAP_MINIMUM_CATEGORY_KEYS, categories);
  const branchPenalty =
    state.branchClassification.branchStability === "Stable" ? 0 : 0.12;
  const contradictionPenalty = state.contradictions.some(
    (contradiction) =>
      contradiction.status === "open" && contradiction.severity === "critical"
  )
    ? 0.2
    : 0;
  const unknownPenalty = Math.min(
    state.unknowns.filter(
      (unknown) =>
        unknown.resolved === false &&
        (unknown.blockingStage === "roadmap" || unknown.blockingStage === "both")
    ).length * 0.05,
    0.2
  );

  return createUnitIntervalConfidence(
    clampUnitInterval(base * 0.75 + overallScore * 0.25 - branchPenalty - contradictionPenalty - unknownPenalty),
    ARCHITECTURE_CONFIDENCE_THRESHOLDS.roadmapDrafting / 100
  );
}

function buildExecutionConfidence(
  state: ExtractionState,
  categories: Record<ExtractionCategoryKey, ExtractionCategoryConfidence>,
  overallScore: number
) {
  const base = buildWeightedAverage(EXECUTION_MINIMUM_CATEGORY_KEYS, categories);
  const contradictionPenalty = state.contradictions.reduce((sum, contradiction) => {
    if (contradiction.status !== "open") {
      return sum;
    }

    if (contradiction.severity === "critical") {
      return sum + 0.25;
    }

    if (contradiction.severity === "high") {
      return sum + 0.15;
    }

    return sum;
  }, 0);
  const assumptionPenalty = Math.min(
    state.assumptions.filter((assumption) => {
      return (
        assumption.status === "open" &&
        (assumption.highSensitivity || assumption.confirmationRequired)
      );
    }).length * 0.06,
    0.24
  );
  const unknownPenalty = Math.min(
    state.unknowns.filter(
      (unknown) =>
        unknown.resolved === false &&
        (unknown.blockingStage === "execution" || unknown.blockingStage === "both")
    ).length * 0.08,
    0.24
  );

  return createUnitIntervalConfidence(
    clampUnitInterval(base * 0.7 + overallScore * 0.3 - contradictionPenalty - assumptionPenalty - unknownPenalty),
    ARCHITECTURE_CONFIDENCE_THRESHOLDS.executionEligibility / 100
  );
}

export function buildConfidenceRollups(state: ExtractionState): ExtractionConfidenceRollups {
  const categories = EXTRACTION_CATEGORY_KEYS.reduce(
    (record, categoryKey) => {
      record[categoryKey] = buildCategoryConfidence(state, categoryKey);
      return record;
    },
    {} as Record<ExtractionCategoryKey, ExtractionCategoryConfidence>
  );
  const overallScore = buildWeightedAverage(EXTRACTION_CATEGORY_KEYS, categories);

  return {
    fieldAverage: buildFieldAverage(state),
    categories,
    overall: createUnitIntervalConfidence(
      overallScore,
      ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionSufficiency / 100
    ),
    roadmapReadiness: buildRoadmapConfidence(state, categories, overallScore),
    executionReadiness: buildExecutionConfidence(state, categories, overallScore)
  };
}

export function getFieldScore(
  state: ExtractionState,
  fieldKey: ExtractionFieldKey
) {
  return normalizeFieldConfidence(state.fields[fieldKey]).score;
}
