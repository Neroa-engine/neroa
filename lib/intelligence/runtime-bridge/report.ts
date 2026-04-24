import { dedupe } from "@/lib/intelligence/adapters/helpers";
import type {
  ShadowComparisonAreaAggregate,
  ShadowComparisonAreaId,
  ShadowReplacementReadinessStatus,
  ShadowReplacementRecommendation,
  StartShadowSessionRecord,
  StartShadowSessionReport
} from "./types";

const COMPARABLE_AREA_STATUSES = [
  "match",
  "hidden_stronger",
  "live_acceptable",
  "both_weak"
] as const;

type ComparableAreaStatus = (typeof COMPARABLE_AREA_STATUSES)[number];

const CRITICAL_AREA_IDS: readonly ShadowComparisonAreaId[] = [
  "naming_capture",
  "ideation_handling",
  "product_definition_specificity",
  "user_definition_depth",
  "function_capability_discovery",
  "handoff_gate_readiness_quality",
  "summary_safety_risk"
] as const;

const RECOMMENDATION_BY_AREA: Partial<
  Record<ShadowComparisonAreaId, ShadowReplacementRecommendation>
> = {
  naming_capture: {
    scopeId: "naming_capture_only",
    label: "Naming capture only",
    why: "Naming is a bounded early-phase slice with clear structured truth fields and low UI surface risk.",
    evidence: []
  },
  ideation_handling: {
    scopeId: "unknown_ideation_handling_only",
    label: "\"I don't know\" ideation handling only",
    why: "Unknown-handling can improve early discovery without replacing the whole strategist.",
    evidence: []
  },
  product_definition_specificity: {
    scopeId: "product_definition_narrowing_only",
    label: "Product-definition narrowing only",
    why: "Product-type narrowing is a high-value, bounded replacement slice for shallow live questions.",
    evidence: []
  },
  user_definition_depth: {
    scopeId: "user_definition_depth_only",
    label: "User-definition depth only",
    why: "Actor clarification is narrow, reversible, and strongly tied to structured truth quality.",
    evidence: []
  },
  function_capability_discovery: {
    scopeId: "function_capability_discovery_only",
    label: "Function/capability discovery only",
    why: "Function discovery is a contained question-selection upgrade with low layout risk.",
    evidence: []
  },
  handoff_gate_readiness_quality: {
    scopeId: "handoff_gate_enforcement_only",
    label: "Handoff-gate enforcement only",
    why: "Minimum-gate enforcement is the safest visible slice when summary and workspace drift remain the main risk.",
    evidence: []
  }
};

function createStatusCounts() {
  return {
    match: 0,
    hidden_stronger: 0,
    live_acceptable: 0,
    both_weak: 0
  } satisfies Record<ComparableAreaStatus, number>;
}

function chooseAggregateStatus(
  counts: Record<ComparableAreaStatus, number>
): ComparableAreaStatus {
  if (counts.both_weak > 0) {
    return "both_weak";
  }

  if (counts.hidden_stronger > 0) {
    return "hidden_stronger";
  }

  if (counts.match > 0) {
    return "match";
  }

  return "live_acceptable";
}

function buildAreaAggregate(
  session: StartShadowSessionRecord,
  areaId: ShadowComparisonAreaId
) {
  const matchingAreas = session.traces
    .map((trace) => trace.comparison.coverageAreas.find((area) => area.areaId === areaId) ?? null)
    .filter((area): area is NonNullable<typeof area> => area !== null)
    .filter((area) => area.status !== "not_in_focus");

  if (matchingAreas.length === 0) {
    return null;
  }

  const counts = matchingAreas.reduce((result, area) => {
    result[area.status as ComparableAreaStatus] += 1;
    return result;
  }, createStatusCounts());
  const status = chooseAggregateStatus(counts);
  const evidence = dedupe(
    matchingAreas
      .filter((area) => area.status === status)
      .flatMap((area) => area.notes)
      .slice(0, 4)
  );

  return {
    areaId,
    label: matchingAreas[0].label,
    status,
    comparedTraceCount: matchingAreas.length,
    counts,
    evidence
  } satisfies ShadowComparisonAreaAggregate;
}

function collectMismatchHotspots(session: StartShadowSessionRecord) {
  const traces = session.traces;
  const hotspotChecks = [
    {
      label: "repetition mismatch",
      count: traces.filter((trace) => trace.comparison.mismatchFlags.repetitionMismatch).length
    },
    {
      label: "contradiction mismatch",
      count: traces.filter((trace) => trace.comparison.mismatchFlags.contradictionMiss).length
    },
    {
      label: "unknown-handling mismatch",
      count: traces.filter((trace) => trace.comparison.mismatchFlags.unknownHandlingMiss).length
    },
    {
      label: "shallow-sequencing mismatch",
      count: traces.filter((trace) => trace.comparison.mismatchFlags.shallowSequencingMismatch).length
    },
    {
      label: "premature-handoff mismatch",
      count: traces.filter((trace) => trace.comparison.mismatchFlags.prematureHandoffMismatch).length
    },
    {
      label: "missing-required-truth mismatch",
      count: traces.filter((trace) => trace.comparison.mismatchFlags.missingRequiredTruthMismatch).length
    },
    {
      label: "vague-product-definition mismatch",
      count: traces.filter((trace) => trace.comparison.mismatchFlags.vagueProductDefinitionMismatch).length
    },
    {
      label: "weak-naming-capture mismatch",
      count: traces.filter((trace) => trace.comparison.mismatchFlags.weakNamingCaptureMismatch).length
    }
  ];

  return hotspotChecks
    .filter((hotspot) => hotspot.count > 0)
    .map((hotspot) => `${hotspot.label}: ${hotspot.count}`);
}

function chooseReplacementRecommendation(
  hiddenStrongerAreas: ShadowComparisonAreaAggregate[]
): ShadowReplacementRecommendation | null {
  const candidate = hiddenStrongerAreas
    .filter((area) => RECOMMENDATION_BY_AREA[area.areaId])
    .sort((left, right) => right.comparedTraceCount - left.comparedTraceCount)[0];

  if (!candidate) {
    return null;
  }

  const recommendation = RECOMMENDATION_BY_AREA[candidate.areaId];

  if (!recommendation) {
    return null;
  }

  return {
    ...recommendation,
    evidence: [
      `${candidate.label} showed hidden-over-live strength across ${candidate.comparedTraceCount} trace(s).`,
      ...candidate.evidence
    ]
  };
}

function determineReadinessStatus(args: {
  comparedTraceCount: number;
  hiddenStrongerAreas: ShadowComparisonAreaAggregate[];
  bothWeakAreas: ShadowComparisonAreaAggregate[];
}) {
  if (args.comparedTraceCount === 0) {
    return "not_ready" as ShadowReplacementReadinessStatus;
  }

  if (args.comparedTraceCount < 2) {
    return "not_ready" as ShadowReplacementReadinessStatus;
  }

  if (args.bothWeakAreas.length > 0) {
    return "not_ready" as ShadowReplacementReadinessStatus;
  }

  if (args.hiddenStrongerAreas.length >= 4 && args.comparedTraceCount >= 6) {
    return "ready_for_broader_replacement" as ShadowReplacementReadinessStatus;
  }

  if (args.hiddenStrongerAreas.length >= 2 && args.comparedTraceCount >= 4) {
    return "ready_for_phase_limited_replacement" as ShadowReplacementReadinessStatus;
  }

  if (args.hiddenStrongerAreas.length >= 1) {
    return "ready_for_narrow_replacement" as ShadowReplacementReadinessStatus;
  }

  return "not_ready" as ShadowReplacementReadinessStatus;
}

export function buildStartShadowSessionReport(
  session: StartShadowSessionRecord
) {
  const areaSummaries = (
    [
      "naming_capture",
      "ideation_handling",
      "product_definition_specificity",
      "user_definition_depth",
      "function_capability_discovery",
      "goals_outcomes_depth",
      "surface_discovery_depth",
      "systems_integration_constraint_capture",
      "handoff_gate_readiness_quality",
      "summary_safety_risk"
    ] as const
  )
    .map((areaId) => buildAreaAggregate(session, areaId))
    .filter((area): area is ShadowComparisonAreaAggregate => area !== null);

  const comparedTraceCount = Math.max(
    0,
    ...areaSummaries.map((area) => area.comparedTraceCount),
    session.traces.length > 0 ? 1 : 0
  );
  const allHiddenStrongerAreas = areaSummaries.filter(
    (area) => area.status === "hidden_stronger"
  );
  const allBothWeakAreas = areaSummaries.filter((area) => area.status === "both_weak");
  const hiddenStrongerAreas = allHiddenStrongerAreas.filter(
    (area) =>
      CRITICAL_AREA_IDS.includes(area.areaId)
  );
  const bothWeakAreas = allBothWeakAreas.filter(
    (area) =>
      CRITICAL_AREA_IDS.includes(area.areaId)
  );
  const readinessStatus = determineReadinessStatus({
    comparedTraceCount,
    hiddenStrongerAreas,
    bothWeakAreas
  });
  const smallestSafeReplacementScope =
    readinessStatus === "not_ready"
      ? null
      : chooseReplacementRecommendation(hiddenStrongerAreas);
  const blockerReasons = dedupe([
    comparedTraceCount === 0
      ? "No shadow comparison traces exist yet for this planning thread."
      : "",
    comparedTraceCount > 0 && comparedTraceCount < 2
      ? "Shadow evidence is still too thin to justify visible replacement."
      : "",
    ...bothWeakAreas.map(
      (area) => `${area.label} is still weak in both live and hidden behavior.`
    ),
    ...session.latestBundle.strategyFramework.progressModel.unresolvedBlockers.slice(0, 6)
  ]).filter(Boolean);
  const notes = dedupe([
    readinessStatus === "ready_for_narrow_replacement"
      ? "Evidence supports only a narrow, reversible visible replacement slice."
      : readinessStatus === "ready_for_phase_limited_replacement"
      ? "Evidence supports a phase-limited visible replacement, not a broad strategist swap."
      : readinessStatus === "ready_for_broader_replacement"
      ? "Evidence is strong across multiple areas, but the replacement still needs explicit scope control."
      : "The current evidence still argues for hidden comparison and refinement before visible replacement.",
    smallestSafeReplacementScope
      ? `Smallest safe replacement scope: ${smallestSafeReplacementScope.label}.`
      : "No safe visible replacement scope is currently justified."
  ]);

  return {
    id: session.id,
    date: session.latestMirroredAt,
    preparedBy: session.preparedBy,
    threadId: session.threadId,
    lane: session.lane,
    traceCount: session.traces.length,
    comparedTraceCount,
    readinessStatus,
    smallestSafeReplacementScope,
    hiddenMateriallyStronger: allHiddenStrongerAreas.length > 0,
    areaSummaries,
    whereLiveAndHiddenMatch: areaSummaries
      .filter((area) => area.status === "match")
      .map((area) => area.areaId),
    whereHiddenIsStronger: allHiddenStrongerAreas.map((area) => area.areaId),
    whereLiveIsStillAcceptable: areaSummaries
      .filter((area) => area.status === "live_acceptable")
      .map((area) => area.areaId),
    whereBothAreWeak: allBothWeakAreas.map((area) => area.areaId),
    mismatchHotspots: collectMismatchHotspots(session),
    blockerReasons,
    notes
  } satisfies StartShadowSessionReport;
}
