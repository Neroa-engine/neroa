import type { ReadinessState } from "@/lib/governance";
import type { ExtractionState } from "@/lib/intelligence/extraction";
import {
  FRAMEWORK_TRUTH_KEYS,
  buildFrameworkUnresolvedQuestionRegister,
  deriveFrameworkConfidenceLevel,
  evaluateFrameworkTruth,
  evaluateFrameworkTruths,
  type FrameworkTruthKey
} from "./framework";

export const HIDDEN_ALIGNMENT_GATE_KEYS = [
  "perceived_project",
  "roadmap_generation",
  "build_definition_recommendation",
  "lane_recommendation",
  "workspace_handoff",
  "minimum_data_gate"
] as const;

export type HiddenAlignmentGateKey = (typeof HIDDEN_ALIGNMENT_GATE_KEYS)[number];

export interface HiddenAlignmentGateResult {
  gateKey: HiddenAlignmentGateKey;
  label: string;
  ready: boolean;
  state: ReadinessState;
  confidenceScore: number;
  satisfiedTruthKeys: FrameworkTruthKey[];
  missingTruthKeys: FrameworkTruthKey[];
  triggeredConditionalTruthKeys: FrameworkTruthKey[];
  deferredTruthKeys: FrameworkTruthKey[];
  blockingTruthKeys: FrameworkTruthKey[];
  blockingUnknownIds: string[];
  blockingContradictionIds: string[];
  blockingAssumptionIds: string[];
  reasons: string[];
}

function dedupe<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function deriveGateState(args: {
  ready: boolean;
  blocked: boolean;
  confidenceScore: number;
}) {
  if (args.blocked) {
    return "blocked" as const;
  }

  if (args.ready) {
    return "ready" as const;
  }

  if (args.confidenceScore >= 0.55) {
    return "provisional" as const;
  }

  return "not_ready" as const;
}

function contradictionIdsForGate(state: ExtractionState) {
  return state.contradictions
    .filter(
      (contradiction) =>
        contradiction.status === "open" &&
        (contradiction.severity === "critical" || contradiction.severity === "high")
    )
    .map((contradiction) => contradiction.contradictionId);
}

function assumptionIdsForGate(state: ExtractionState, requiredTruthKeys: readonly FrameworkTruthKey[]) {
  const requiredFieldKeys = new Set(
    requiredTruthKeys.flatMap((truthKey) => evaluateFrameworkTruth(state, truthKey).fieldKeys)
  );

  return state.assumptions
    .filter(
      (assumption) =>
        assumption.status === "open" &&
        (assumption.confirmationRequired || assumption.highSensitivity) &&
        assumption.linkedFieldKeys.some((fieldKey) => requiredFieldKeys.has(fieldKey))
    )
    .map((assumption) => assumption.assumptionId);
}

function unknownIdsForGate(state: ExtractionState, requiredTruthKeys: readonly FrameworkTruthKey[]) {
  const requiredFieldKeys = new Set(
    requiredTruthKeys.flatMap((truthKey) => evaluateFrameworkTruth(state, truthKey).fieldKeys)
  );

  return state.unknowns
    .filter(
      (unknown) =>
        !unknown.resolved &&
        unknown.linkedFieldKeys.some((fieldKey) => requiredFieldKeys.has(fieldKey))
    )
    .map((unknown) => unknown.unknownId);
}

function evaluateGate(args: {
  state: ExtractionState;
  gateKey: HiddenAlignmentGateKey;
  label: string;
  requiredTruthKeys: readonly FrameworkTruthKey[];
  allowDeferredConditionals?: boolean;
  requireNoCriticalContradictions?: boolean;
}) {
  const truths = evaluateFrameworkTruths(args.state);
  const triggeredConditionalTruthKeys = FRAMEWORK_TRUTH_KEYS.filter(
    (truthKey) =>
      truths[truthKey].requirementClass === "conditional_required" &&
      truths[truthKey].triggered
  );
  const relevantTruthKeys = dedupe([
    ...args.requiredTruthKeys,
    ...triggeredConditionalTruthKeys.filter((truthKey) =>
      args.requiredTruthKeys.includes(truthKey)
    )
  ]);
  const missingTruthKeys = relevantTruthKeys.filter((truthKey) => {
    const truth = truths[truthKey];
    return !truth.present && !(args.allowDeferredConditionals && truth.explicitDeferred);
  });
  const deferredTruthKeys = relevantTruthKeys.filter((truthKey) => truths[truthKey].explicitDeferred);
  const blockingTruthKeys = relevantTruthKeys.filter((truthKey) => {
    const truth = truths[truthKey];
    return truth.status === "conflicting" || (!truth.present && !truth.explicitDeferred);
  });
  const blockingContradictionIds = args.requireNoCriticalContradictions
    ? contradictionIdsForGate(args.state)
    : [];
  const blockingAssumptionIds = assumptionIdsForGate(args.state, relevantTruthKeys);
  const blockingUnknownIds = unknownIdsForGate(args.state, relevantTruthKeys);
  const confidenceScore = average(
    relevantTruthKeys.map((truthKey) => truths[truthKey].confidenceScore)
  );
  const ready =
    missingTruthKeys.length === 0 &&
    blockingTruthKeys.length === 0 &&
    blockingUnknownIds.length === 0 &&
    blockingAssumptionIds.length === 0 &&
    blockingContradictionIds.length === 0;
  const reasons = dedupe([
    ...missingTruthKeys.map(
      (truthKey) => `${truths[truthKey].label} is still missing from hidden structured truth.`
    ),
    ...blockingTruthKeys
      .filter((truthKey) => truths[truthKey].status === "conflicting")
      .map((truthKey) => `${truths[truthKey].label} is conflicting and needs resolution.`),
    ...blockingUnknownIds.map((unknownId) => `Blocking unknown remains open: ${unknownId}.`),
    ...blockingAssumptionIds.map(
      (assumptionId) => `Blocking assumption remains open: ${assumptionId}.`
    ),
    ...blockingContradictionIds.map(
      (contradictionId) => `Critical contradiction remains open: ${contradictionId}.`
    )
  ]);

  return {
    gateKey: args.gateKey,
    label: args.label,
    ready,
    state: deriveGateState({
      ready,
      blocked: blockingTruthKeys.length > 0 || blockingContradictionIds.length > 0,
      confidenceScore
    }),
    confidenceScore,
    satisfiedTruthKeys: relevantTruthKeys.filter((truthKey) => truths[truthKey].present),
    missingTruthKeys,
    triggeredConditionalTruthKeys,
    deferredTruthKeys,
    blockingTruthKeys,
    blockingUnknownIds,
    blockingContradictionIds,
    blockingAssumptionIds,
    reasons
  } satisfies HiddenAlignmentGateResult;
}

export function evaluatePerceivedProjectReadiness(state: ExtractionState) {
  return evaluateGate({
    state,
    gateKey: "perceived_project",
    label: "Perceived project readiness",
    requiredTruthKeys: [
      "product_type",
      "product_function",
      "target_user",
      "first_use_case",
      "business_goal",
      "project_name_state"
    ],
    requireNoCriticalContradictions: true
  });
}

export function evaluateRoadmapGenerationReadiness(state: ExtractionState) {
  return evaluateGate({
    state,
    gateKey: "roadmap_generation",
    label: "Roadmap generation readiness",
    requiredTruthKeys: [
      "founder_operator_context",
      "project_name_state",
      "product_type",
      "product_function",
      "target_user",
      "first_use_case",
      "business_goal",
      "primary_surfaces",
      "constraints",
      "compliance_security_sensitivity",
      "roadmap_clarity_level",
      "confidence_level",
      "unresolved_questions",
      "naming_help_state",
      "domain_intent",
      "domain_validation_path",
      "first_user",
      "key_systems_integrations",
      "monetization",
      "ai_usage",
      "data_structure_assumptions",
      "mobile_expectations",
      "admin_ops_complexity"
    ],
    allowDeferredConditionals: true,
    requireNoCriticalContradictions: true
  });
}

export function evaluateBuildDefinitionRecommendationReadiness(state: ExtractionState) {
  return evaluateGate({
    state,
    gateKey: "build_definition_recommendation",
    label: "Build-definition recommendation readiness",
    requiredTruthKeys: [
      "product_type",
      "first_use_case",
      "business_goal",
      "primary_surfaces",
      "constraints",
      "compliance_security_sensitivity",
      "key_systems_integrations",
      "monetization",
      "mobile_expectations",
      "admin_ops_complexity"
    ],
    allowDeferredConditionals: true,
    requireNoCriticalContradictions: true
  });
}

export function evaluateLaneRecommendationReadiness(state: ExtractionState) {
  return evaluateGate({
    state,
    gateKey: "lane_recommendation",
    label: "Lane recommendation readiness",
    requiredTruthKeys: [
      "product_type",
      "first_use_case",
      "primary_surfaces",
      "constraints",
      "compliance_security_sensitivity",
      "key_systems_integrations",
      "admin_ops_complexity"
    ],
    allowDeferredConditionals: true,
    requireNoCriticalContradictions: true
  });
}

export function evaluateWorkspaceHandoffReadiness(state: ExtractionState) {
  return evaluateGate({
    state,
    gateKey: "workspace_handoff",
    label: "Workspace handoff readiness",
    requiredTruthKeys: [
      "founder_operator_context",
      "project_name_state",
      "product_type",
      "product_function",
      "target_user",
      "first_use_case",
      "business_goal",
      "primary_surfaces",
      "constraints",
      "compliance_security_sensitivity",
      "roadmap_clarity_level",
      "confidence_level",
      "unresolved_questions",
      "naming_help_state",
      "domain_intent",
      "domain_validation_path",
      "first_user",
      "key_systems_integrations",
      "monetization",
      "ai_usage",
      "data_structure_assumptions",
      "mobile_expectations",
      "admin_ops_complexity"
    ],
    allowDeferredConditionals: true,
    requireNoCriticalContradictions: true
  });
}

export function evaluateMinimumDataGate(state: ExtractionState) {
  const handoff = evaluateWorkspaceHandoffReadiness(state);
  const unresolved = buildFrameworkUnresolvedQuestionRegister(state);

  return {
    ...handoff,
    gateKey: "minimum_data_gate",
    label: "Minimum Data Gate v1",
    reasons: dedupe([
      ...handoff.reasons,
      unresolved.unknownQuestions.length > 0 ||
      unresolved.openAssumptions.length > 0 ||
      unresolved.openContradictions.length > 0
        ? "Unresolved questions remain explicitly attached to the hidden planning record."
        : ""
    ]).filter(Boolean)
  } satisfies HiddenAlignmentGateResult;
}

