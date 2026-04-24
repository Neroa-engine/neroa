import {
  ARCHITECTURE_CONFIDENCE_THRESHOLDS,
  type ArchitecturalPhaseId,
  type ContradictionSeverity,
  type ExecutionGateOutcome,
  type GovernanceSystem,
  type GovernanceWorkflowStep
} from "../constants";
import type {
  AffectedPhase,
  AffectedSystem,
  ArchitectureConfidenceCheck,
  ChangeClassification,
  DeltaAnalyzerOutput,
  DependencyTouch,
  ExtractionSnapshot
} from "../types";
import type { GovernanceRunnerInput, GovernanceRunnerResolvedContext } from "./types";
import {
  averageConfidence,
  buildConfidenceDimensionScores,
  contradictionSeverityRank,
  createDeterministicRecordId,
  dedupeNumbers,
  evaluateGateOutcome,
  executionConfidenceMinimum,
  getPhaseForSystem,
  inferChangeType,
  riskLevelFromImpact,
  roadmapDraftingMinimum,
  summarizeImpactCategory,
  systemsTouchTrustLayer,
  toPercentageConfidence
} from "./helpers";

function createAffectedPhases(
  phaseIds: ArchitecturalPhaseId[],
  context: GovernanceRunnerResolvedContext
) {
  const sorted = [...phaseIds].sort((left, right) => left - right);
  const primaryPhaseId =
    context.currentApprovedPhase !== null && sorted.includes(context.currentApprovedPhase)
      ? context.currentApprovedPhase
      : (sorted[0] ?? null);

  const primaryPhase: AffectedPhase | null =
    primaryPhaseId === null
      ? null
      : {
          phaseId: primaryPhaseId,
          relation: context.futurePhaseIds.includes(primaryPhaseId)
            ? "future"
            : context.currentApprovedPhase === null ||
                primaryPhaseId === context.currentApprovedPhase
              ? "primary"
              : "secondary",
          notes:
            context.currentApprovedPhase !== null &&
            primaryPhaseId !== context.currentApprovedPhase
              ? "Primary affected phase differs from the current approved phase context."
              : undefined
        };

  const secondaryPhasesTouched = sorted
    .filter((phaseId) => phaseId !== primaryPhaseId)
    .filter((phaseId) => !context.futurePhaseIds.includes(phaseId))
    .map((phaseId) => ({
      phaseId,
      relation: "secondary" as const
    }));

  const futurePhasesTouched = sorted
    .filter((phaseId) => phaseId !== primaryPhaseId)
    .filter((phaseId) => context.futurePhaseIds.includes(phaseId))
    .map((phaseId) => ({
      phaseId,
      relation: "future" as const
    }));

  return {
    primaryPhase,
    secondaryPhasesTouched,
    futurePhasesTouched
  };
}

function buildAffectedSystems(
  systemsTouched: GovernanceSystem[],
  context: GovernanceRunnerResolvedContext
): AffectedSystem[] {
  return systemsTouched.map((system, index) => ({
    system,
    role:
      context.currentOwningSystem && system === context.currentOwningSystem
        ? "owning"
        : index === 0
          ? "owning"
          : systemsTouchTrustLayer([system])
            ? "sensitive"
            : "dependent",
    trustCritical: systemsTouchTrustLayer([system]),
    notes:
      context.currentOwningSystem && system === context.currentOwningSystem
        ? "Current owning system supplied by governance context."
        : undefined
  }));
}

function buildDependencyTouches(
  systemsTouched: GovernanceSystem[],
  context: GovernanceRunnerResolvedContext
): DependencyTouch[] {
  const touchedSet = new Set<GovernanceSystem>(systemsTouched);

  return context.dependencyMap
    .filter((edge) => touchedSet.has(edge.fromSystem) && touchedSet.has(edge.toSystem))
    .map((edge) => ({
      fromSystem: edge.fromSystem,
      toSystem: edge.toSystem,
      direction: edge.prohibitedDirection
        ? ("prohibited" as const)
        : edge.approvedDirection
          ? ("approved" as const)
          : ("crossed" as const),
      rationale: edge.rationale,
      concern: edge.notes
    }));
}

function createAutoContradictions(args: {
  phaseIds: ArchitecturalPhaseId[];
  currentApprovedPhase: ArchitecturalPhaseId | null;
  dependencyTouches: DependencyTouch[];
  futurePhaseCapabilitiesMentioned: string[];
  trustLayerTouched: boolean;
}) {
  const contradictions: ExtractionSnapshot["contradictions"] = [];
  const approvedPhase = args.currentApprovedPhase;
  const hasProhibitedDependency = args.dependencyTouches.some((touch) => {
    return touch.direction === "prohibited";
  });

  if (hasProhibitedDependency) {
    contradictions.push({
      contradictionId: createDeterministicRecordId(
        "contradiction",
        "prohibited-dependency-direction"
      ),
      title: "Prohibited dependency direction detected",
      contradictionClass: "Architecture contradiction",
      severity: "critical",
      status: "open",
      blocked: true
    });
  }

  const currentPhaseMismatch =
    approvedPhase !== null && args.phaseIds.some((phaseId) => phaseId > approvedPhase);

  if (currentPhaseMismatch) {
    contradictions.push({
      contradictionId: createDeterministicRecordId(
        "contradiction",
        "request-beyond-current-phase"
      ),
      title: "Requested change reaches beyond the current approved phase",
      contradictionClass: "Scope contradiction",
      severity: args.phaseIds.some((phaseId) => phaseId >= 5) ? "high" : "moderate",
      status: "open",
      blocked: false
    });
  }

  if (
    args.futurePhaseCapabilitiesMentioned.length > 0 &&
    approvedPhase !== null &&
    !args.phaseIds.some((phaseId) => phaseId >= 5)
  ) {
    contradictions.push({
      contradictionId: createDeterministicRecordId(
        "contradiction",
        "future-capability-without-phase-promotion"
      ),
      title: "Request mentions future capabilities without an active phase promotion",
      contradictionClass: "MVP contradiction",
      severity: "high",
      status: "open",
      blocked: false
    });
  }

  if (args.trustLayerTouched && approvedPhase !== 4) {
    contradictions.push({
      contradictionId: createDeterministicRecordId(
        "contradiction",
        "trust-layer-request-outside-supporting-phase"
      ),
      title: "Trust-layer work is being requested outside the supporting platform phase",
      contradictionClass: "Architecture contradiction",
      severity: "high",
      status: "open",
      blocked: false
    });
  }

  return contradictions;
}

function buildArchitectureConfidenceCheck(args: {
  truthCompleteness: number;
  consistency: number;
  branchCertainty: number;
  dependencyClarity: number;
  phaseClarity: number;
  deliveryFeasibility: number;
}): ArchitectureConfidenceCheck {
  const dimensionScores = buildConfidenceDimensionScores(args);
  const threshold = ARCHITECTURE_CONFIDENCE_THRESHOLDS.executionEligibility;
  const criticalMinimum = executionConfidenceMinimum();
  const criticalDimensionFailures = dimensionScores
    .filter((dimension) => dimension.score < criticalMinimum)
    .map((dimension) => ({
      dimension: dimension.dimension,
      score: dimension.score,
      minimum: criticalMinimum
    }));
  const overallScore = averageConfidence(dimensionScores.map((dimension) => dimension.score));

  return {
    overallScore: toPercentageConfidence(overallScore, threshold),
    threshold,
    passed: overallScore >= threshold && criticalDimensionFailures.length === 0,
    criticalDimensionFailures
  };
}

export function runDeltaAnalyzer(
  input: GovernanceRunnerInput,
  extractionSnapshot: ExtractionSnapshot,
  context: GovernanceRunnerResolvedContext
): DeltaAnalyzerOutput {
  const request = input.request;
  const approvedPhase = context.currentApprovedPhase;
  const systemsTouched = extractionSnapshot.systemsAndIntegrations.systemsTouched;
  const changeType = inferChangeType(request);
  const affectedSystems = buildAffectedSystems(systemsTouched, context);
  const phaseIds = dedupeNumbers(
    systemsTouched.map((system) => getPhaseForSystem(system, context))
  );
  const { primaryPhase, secondaryPhasesTouched, futurePhasesTouched } = createAffectedPhases(
    phaseIds,
    context
  );
  const dependencyTouches = buildDependencyTouches(systemsTouched, context);
  const trustLayerTouched = systemsTouchTrustLayer(systemsTouched);
  const autoContradictions = createAutoContradictions({
    phaseIds,
    currentApprovedPhase: context.currentApprovedPhase,
    dependencyTouches,
    futurePhaseCapabilitiesMentioned:
      extractionSnapshot.mvpBoundary.futurePhaseCapabilitiesMentioned ?? [],
    trustLayerTouched
  });
  const contradictionsIntroducedOrWorsened = [
    ...extractionSnapshot.contradictions,
    ...autoContradictions.filter((candidate) => {
      return !extractionSnapshot.contradictions.some((existing) => existing.title === candidate.title);
    })
  ];
  const highestContradictionSeverity = contradictionsIntroducedOrWorsened.reduce<ContradictionSeverity>(
    (highest, contradiction) => {
      return contradictionSeverityRank(contradiction.severity) >
        contradictionSeverityRank(highest)
        ? contradiction.severity
        : highest;
    },
    "minor"
  );
  const assumptionsAffected = extractionSnapshot.assumptions.filter((assumption) => {
    const branchTouched =
      (assumption.affectedBranches ?? []).length === 0 ||
      (assumption.affectedBranches ?? []).includes(
        extractionSnapshot.branchClassification.primaryBranch
      );
    const systemTouched =
      (assumption.affectedSystems ?? []).length === 0 ||
      (assumption.affectedSystems ?? []).some((system) => systemsTouched.includes(system));
    const phaseTouched =
      (assumption.affectedPhases ?? []).length === 0 ||
      (assumption.affectedPhases ?? []).some((phaseId) => phaseIds.includes(phaseId));

    return branchTouched && systemTouched && phaseTouched;
  });
  const currentPhaseMismatch =
    approvedPhase !== null && phaseIds.some((phaseId) => phaseId > approvedPhase);
  const futurePhaseTouched =
    futurePhasesTouched.length > 0 ||
    (primaryPhase !== null && context.futurePhaseIds.includes(primaryPhase.phaseId));
  const prohibitedDependencyDetected = dependencyTouches.some((touch) => {
    return touch.direction === "prohibited";
  });
  const blockedContradictionDetected = contradictionsIntroducedOrWorsened.some((contradiction) => {
    return contradiction.blocked === true || contradiction.severity === "critical";
  });
  const impactCategory =
    prohibitedDependencyDetected || blockedContradictionDetected
      ? "architectural"
      : futurePhaseTouched || trustLayerTouched || phaseIds.length >= 3 || systemsTouched.length >= 4
        ? "high"
        : currentPhaseMismatch || phaseIds.length >= 2 || systemsTouched.length >= 2
          ? "medium"
          : "local";
  const riskLevel = riskLevelFromImpact(impactCategory, changeType);
  const roadmapRevisionRequired =
    impactCategory === "high" ||
    impactCategory === "architectural" ||
    trustLayerTouched ||
    futurePhaseTouched;
  const rebuildRadius = {
    level: impactCategory,
    displayLabel: summarizeImpactCategory(impactCategory),
    rationale:
      impactCategory === "architectural"
        ? "The request crosses a prohibited dependency or creates a blocked contradiction."
        : impactCategory === "high"
          ? "The request touches supporting trust work, future/editor work, or broad multi-system change."
          : impactCategory === "medium"
            ? "The request crosses more than one current phase or system boundary."
            : "The request stays inside one current-phase system boundary."
  } as const;
  const truthCompleteness = extractionSnapshot.roadmapReadiness.architectureConfidence.score;
  const consistency = blockedContradictionDetected
    ? 25
    : highestContradictionSeverity === "high"
      ? 84
      : highestContradictionSeverity === "moderate"
        ? 88
        : 94;
  const dependencyClarity = prohibitedDependencyDetected
    ? 20
    : dependencyTouches.length === 0
      ? 92
      : dependencyTouches.every((touch) => touch.direction === "approved")
        ? 92
        : 82;
  const phaseClarity = futurePhaseTouched
    ? 82
    : currentPhaseMismatch
      ? 84
      : phaseIds.length > 1
        ? 86
        : 92;
  const deliveryFeasibility = blockedContradictionDetected
    ? 20
    : impactCategory === "high"
      ? 86
      : impactCategory === "medium"
        ? 88
        : 92;
  const architectureConfidenceCheck = buildArchitectureConfidenceCheck({
    truthCompleteness,
    consistency,
    branchCertainty: extractionSnapshot.branchClassification.branchConfidence.score,
    dependencyClarity,
    phaseClarity,
    deliveryFeasibility
  });
  const confidenceThresholdMetForExecutionEligibility = architectureConfidenceCheck.passed;
  const recommendedGateOutcome: ExecutionGateOutcome = evaluateGateOutcome({
    impactCategory,
    roadmapRevisionRequired,
    confidencePassed: confidenceThresholdMetForExecutionEligibility,
    futurePhaseTouched,
    outOfPhase: currentPhaseMismatch,
    prohibitedDependencyDetected,
    blockedContradictionDetected
  });
  const preliminaryExecutionStatus =
    architectureConfidenceCheck.overallScore.score >= roadmapDraftingMinimum() &&
    recommendedGateOutcome !== "Blocked because it causes architectural conflict"
      ? "Allowed to proceed to Rebuild Impact Report and gate review"
      : "Blocked pending clarification or roadmap revision";
  const regressionExposure = [
    ...(systemsTouched.length > 1 ? ["Cross-system coordination may require regression review."] : []),
    ...(trustLayerTouched ? ["Trust-layer changes can widen access or entitlement regressions."] : []),
    ...(prohibitedDependencyDetected
      ? ["A prohibited dependency direction risks bypassing approved control boundaries."]
      : [])
  ];
  const changeClassification: ChangeClassification = {
    impactCategory,
    rebuildRadius,
    riskLevel,
    changeType,
    rationale:
      impactCategory === "local"
        ? "Single-system change inside the current approved phase."
        : impactCategory === "medium"
          ? "Crosses current system or phase boundaries but stays out of prohibited trust or dependency paths."
          : impactCategory === "high"
            ? "Touches supporting trust work, future/editor work, or broad multi-system sequencing."
            : "Creates an architectural contradiction or prohibited dependency path."
  };
  const linkedRecordsToCreateOrUpdate: GovernanceWorkflowStep[] = [
    "Rebuild Impact Report",
    ...(roadmapRevisionRequired ? (["Roadmap Revision Record"] as GovernanceWorkflowStep[]) : []),
    "Phase Mapping Decision",
    "Execution Gate Decision"
  ];

  return {
    id: createDeterministicRecordId("delta", request.requestedChange),
    date: input.date ?? "read-only",
    preparedBy: input.preparedBy ?? "Governance Runner v1",
    requestedChangeSummary: request.summary ?? request.requestedChange,
    primaryPhase,
    secondaryPhasesTouched,
    futurePhasesTouched,
    affectedSystems,
    dependenciesTouched: dependencyTouches,
    assumptionsAffected,
    contradictionsIntroducedOrWorsened,
    rebuildRadius,
    regressionExposure,
    architectureConfidenceCheck,
    confidenceThresholdMetForExecutionEligibility,
    checks: [
      {
        name: "phase ownership check",
        passed: !currentPhaseMismatch || futurePhaseTouched,
        notes: currentPhaseMismatch
          ? "Requested change exceeds the current approved phase context."
          : "Affected phases stay within the current approved phase."
      },
      {
        name: "system boundary check",
        passed: systemsTouched.length <= 3 || impactCategory !== "local",
        notes: `${systemsTouched.length} governed system(s) are touched.`
      },
      {
        name: "branch stability check",
        passed: extractionSnapshot.branchClassification.branchStability === "Stable",
        notes: `Branch stability is ${extractionSnapshot.branchClassification.branchStability}.`,
        severityIfFailed: "moderate"
      },
      {
        name: "dependency direction check",
        passed: !prohibitedDependencyDetected,
        notes: prohibitedDependencyDetected
          ? "A prohibited dependency direction is present."
          : "No prohibited dependency direction was detected.",
        severityIfFailed: "critical"
      },
      {
        name: "contradiction amplification check",
        passed: !blockedContradictionDetected,
        notes:
          contradictionsIntroducedOrWorsened.length === 0
            ? "No open contradictions are present."
            : `${contradictionsIntroducedOrWorsened.length} contradiction(s) require tracking.`,
        severityIfFailed: highestContradictionSeverity
      },
      {
        name: "assumption invalidation check",
        passed: assumptionsAffected.every((assumption) => assumption.status !== "invalidated"),
        notes:
          assumptionsAffected.length === 0
            ? "No tracked assumptions are directly affected."
            : `${assumptionsAffected.length} assumption(s) should be revalidated.`
      },
      {
        name: "trust-layer impact check",
        passed: !trustLayerTouched || approvedPhase === 4,
        notes: trustLayerTouched
          ? "Trust-layer systems are in scope for this request."
          : "No trust-layer systems are touched.",
        severityIfFailed: trustLayerTouched ? "high" : undefined
      },
      {
        name: "rebuild radius check",
        passed: impactCategory !== "architectural",
        notes: rebuildRadius.rationale,
        severityIfFailed: riskLevel
      },
      {
        name: "regression exposure check",
        passed: regressionExposure.length === 0,
        notes:
          regressionExposure.length === 0
            ? "No special regression exposure was detected."
            : regressionExposure.join(" "),
        severityIfFailed: regressionExposure.length > 0 ? riskLevel : undefined
      },
      {
        name: "architecture confidence threshold check",
        passed: confidenceThresholdMetForExecutionEligibility,
        notes: `Execution threshold is ${architectureConfidenceCheck.threshold}.`,
        severityIfFailed: confidenceThresholdMetForExecutionEligibility ? undefined : "high"
      }
    ],
    changeClassification,
    roadmapRevisionRequired,
    preliminaryExecutionStatus,
    recommendedGateOutcome,
    recommendedNextAction:
      recommendedGateOutcome === "Approved as-is"
        ? "Create the Rebuild Impact Report and keep the request inside the current approved phase."
        : recommendedGateOutcome === "Approved but roadmap must be updated first"
          ? "Draft a Roadmap Revision Record before any execution planning begins."
          : recommendedGateOutcome === "Deferred to later phase"
            ? "Record a Phase Mapping Decision and defer the request to its owning phase."
            : "Resolve the architectural contradiction before any roadmap or execution step proceeds.",
    linkedRecordsToCreateOrUpdate
  };
}
