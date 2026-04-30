import {
  neroaOneDecisionGateSchema,
  roadmapImpactAssessmentSchema,
  type CustomerIntentEnvelope,
  type NeroaOneDecisionGate,
  type RoadmapImpactAssessment,
  type SpaceContext
} from "./schemas.ts";

function includesAny(text: string, patterns: readonly RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function buildDecisionGate(args: {
  intent: CustomerIntentEnvelope;
  needsStrategyReview: boolean;
}): NeroaOneDecisionGate {
  const text = args.intent.normalizedText;

  if (
    args.intent.intentType === "decision" &&
    includesAny(text, [/\bhold\b/, /\bblock\b/, /\bstop\b/, /\bdo not\b/, /\bdefer\b/])
  ) {
    return neroaOneDecisionGateSchema.parse({
      status: "block",
      reason: "Execution is explicitly blocked by the customer decision.",
      blockedActions: ["release_execution", "create_build_run"],
      requiredNextStep: "Resolve the blocking decision before execution resumes."
    });
  }

  if (args.needsStrategyReview) {
    return neroaOneDecisionGateSchema.parse({
      status: "needs_strategy_review",
      reason: "This request changes roadmap or architecture assumptions and should return to strategy review.",
      blockedActions: ["release_execution"],
      requiredNextStep: "Route the change through strategy review before Build Room release."
    });
  }

  return neroaOneDecisionGateSchema.parse({
    status: "allow",
    reason: "No blocking roadmap or architecture conflict was detected by the deterministic rules.",
    blockedActions: [],
    requiredNextStep: null
  });
}

export function analyzeRoadmapImpact(args: {
  intent: CustomerIntentEnvelope;
  spaceContext: SpaceContext;
}): RoadmapImpactAssessment {
  const text = args.intent.normalizedText;
  const touchedAreas = new Set<string>();

  if (args.intent.intentType === "roadmap_update" || /\broadmap\b/.test(text)) {
    touchedAreas.add("roadmap");
  }

  if (includesAny(text, [/\barchitecture\b/, /\bbackend\b/, /\bschema\b/, /\bdata model\b/])) {
    touchedAreas.add("architecture");
  }

  if (includesAny(text, [/\bphase\b/, /\bmilestone\b/, /\bsequence\b/, /\btimeline\b/])) {
    touchedAreas.add("phase_map");
  }

  if (includesAny(text, [/\badd\b/, /\bexpand\b/, /\bnew\b/, /\bextend\b/])) {
    touchedAreas.add("scope");
  }

  if (touchedAreas.size === 0) {
    touchedAreas.add("current_request");
  }

  const needsStrategyReview =
    args.intent.intentType === "roadmap_update" ||
    touchedAreas.has("architecture") ||
    (touchedAreas.has("scope") &&
      includesAny(text, [/\bphase\b/, /\broadmap\b/, /\barchitecture\b/, /\bplan\b/]));

  const decisionGate = buildDecisionGate({
    intent: args.intent,
    needsStrategyReview
  });
  const phaseLabel = args.spaceContext.project.currentPhase;

  return roadmapImpactAssessmentSchema.parse({
    summary: `Deterministic roadmap impact assessed for ${args.spaceContext.project.title} during ${phaseLabel}.`,
    touchedAreas: [...touchedAreas],
    needsStrategyReview,
    decisionGate,
    emittedEvent: "neroa_one.roadmap_impact.assessed"
  });
}

export function evaluateNeroaOneDecisionGate(args: {
  intent: CustomerIntentEnvelope;
  spaceContext: SpaceContext;
}) {
  return analyzeRoadmapImpact(args).decisionGate;
}
