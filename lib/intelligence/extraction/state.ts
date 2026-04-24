import {
  BRANCH_STABILITY_STATES,
  OVERLAY_TYPES,
  type OverlayType
} from "@/lib/governance";
import {
  EXTRACTION_FIELD_DEFINITIONS,
  EXTRACTION_FIELD_KEYS,
  type ExtractionFieldKey
} from "./catalog";
import { buildConfidenceRollups, createUnitIntervalConfidence } from "./confidence";
import { evaluateExecutionReadiness, evaluateRoadmapReadiness } from "./readiness";
import type {
  ExtractionFieldState,
  ExtractionLastUpdateMetadata,
  ExtractionRequestSummary,
  ExtractionState
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

function sanitizeSeed(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildExtractionRecordId(prefix: string, seed?: string) {
  const normalized = seed ? sanitizeSeed(seed) : "";
  return normalized ? `${prefix}-${normalized}` : `${prefix}-${Date.now()}`;
}

function createFieldState(fieldKey: ExtractionFieldKey): ExtractionFieldState {
  const definition = EXTRACTION_FIELD_DEFINITIONS[fieldKey];

  return {
    fieldKey,
    categoryKey: definition.categoryKey,
    label: definition.label,
    valueKind: definition.valueKind,
    status: "unanswered",
    value: null,
    confidence: createUnitIntervalConfidence(0, 0),
    evidenceIds: [],
    sourceIds: [],
    followUpRequired: true,
    followUpReason: "No truth has been captured for this field yet.",
    dependencyBlockers: [],
    history: []
  };
}

function createDefaultFields() {
  return EXTRACTION_FIELD_KEYS.reduce(
    (record, fieldKey) => {
      record[fieldKey] = createFieldState(fieldKey);
      return record;
    },
    {} as Record<ExtractionFieldKey, ExtractionFieldState>
  );
}

function createDefaultOverlayActivations() {
  return OVERLAY_TYPES.reduce(
    (record, overlayType) => {
      record[overlayType] = {
        overlayType,
        determination: "unknown",
        confidence: createUnitIntervalConfidence(0),
        sourceFieldKeys: [],
        evidenceIds: []
      };
      return record;
    },
    {} as Record<OverlayType, ExtractionState["overlayActivations"][OverlayType]>
  );
}

function createLastUpdateMetadata(
  updateReason: string,
  updatedBy?: string
): ExtractionLastUpdateMetadata {
  return {
    updatedAt: nowIso(),
    updatedBy,
    updateReason
  };
}

export function createEmptyExtractionState(args?: {
  requestSummary?: Partial<ExtractionRequestSummary>;
  preparedBy?: string;
}): ExtractionState {
  const requestSummary: ExtractionRequestSummary = {
    requestId: args?.requestSummary?.requestId,
    requestedChangeOrInitiative:
      args?.requestSummary?.requestedChangeOrInitiative ?? "",
    whyItExists: args?.requestSummary?.whyItExists,
    desiredOutcome: args?.requestSummary?.desiredOutcome,
    currentContext: args?.requestSummary?.currentContext
  };

  const baseState: ExtractionState = {
    version: 1,
    preparedBy: args?.preparedBy ?? "Extraction Engine Core v1",
    requestSummary,
    branchClassification: {
      status: "unanswered",
      primaryBranch: null,
      secondaryBranches: [],
      branchStability: BRANCH_STABILITY_STATES[0],
      branchShiftSuspected: false,
      confidence: createUnitIntervalConfidence(0),
      sourceFieldKeys: ["primary_branch"],
      evidenceIds: []
    },
    overlayActivations: createDefaultOverlayActivations(),
    fields: createDefaultFields(),
    assumptions: [],
    contradictions: [],
    unknowns: [],
    sources: {},
    evidence: {},
    confidenceRollups: {
      fieldAverage: createUnitIntervalConfidence(0),
      categories: {} as ExtractionState["confidenceRollups"]["categories"],
      overall: createUnitIntervalConfidence(0),
      roadmapReadiness: createUnitIntervalConfidence(0),
      executionReadiness: createUnitIntervalConfidence(0)
    },
    roadmapReadiness: {
      state: "not_ready",
      ready: false,
      confidence: createUnitIntervalConfidence(0),
      satisfiedCategoryKeys: [],
      missingFieldKeys: [],
      blockingContradictionIds: [],
      blockingUnknownIds: [],
      blockingAssumptionIds: [],
      blockers: []
    },
    executionReadiness: {
      state: "not_ready",
      ready: false,
      confidence: createUnitIntervalConfidence(0),
      satisfiedCategoryKeys: [],
      missingFieldKeys: [],
      blockingContradictionIds: [],
      blockingUnknownIds: [],
      blockingAssumptionIds: [],
      blockers: []
    },
    lastUpdate: createLastUpdateMetadata("Created empty extraction state.", args?.preparedBy)
  };

  const confidenceRollups = buildConfidenceRollups(baseState);

  return {
    ...baseState,
    confidenceRollups,
    roadmapReadiness: evaluateRoadmapReadiness({
      ...baseState,
      confidenceRollups
    }),
    executionReadiness: evaluateExecutionReadiness({
      ...baseState,
      confidenceRollups
    })
  };
}

export function applyExtractionStateMeta(args: {
  state: ExtractionState;
  updateReason: string;
  updatedBy?: string;
}) {
  return {
    ...args.state,
    lastUpdate: createLastUpdateMetadata(args.updateReason, args.updatedBy)
  };
}
