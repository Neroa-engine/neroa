import {
  ARCHITECTURE_CONFIDENCE_THRESHOLDS,
  type ExtractionCategory,
  type GovernanceWorkflowStep
} from "../constants";
import type { ExtractionSnapshot } from "../types";
import { TRUST_CRITICAL_SYSTEMS } from "./context";
import {
  averageConfidence,
  buildRequestSearchText,
  createDeterministicRecordId,
  createField,
  dedupeStrings,
  inferBranchFamily,
  inferOverlayTypes,
  inferSystemsTouched,
  mapAssumptionsToReferences,
  mapContradictionsToReferences,
  statusFromPresence,
  toPercentageConfidence
} from "./helpers";
import type { GovernanceRunnerInput, GovernanceRunnerResolvedContext } from "./types";

const CRITICAL_EXTRACTION_CATEGORIES: readonly ExtractionCategory[] = [
  "Request identity",
  "Primary branch classification",
  "User / buyer / operator",
  "Core outcome",
  "MVP scope",
  "Workflow truth",
  "Systems touched",
  "Constraints"
];

const DOWNSTREAM_EXECUTION_STEPS: GovernanceWorkflowStep[] = [
  "Delta-Analyzer Worksheet",
  "Rebuild Impact Report",
  "Phase Mapping Decision",
  "Execution Gate Decision"
];

export function buildExtractionSnapshot(
  input: GovernanceRunnerInput,
  context: GovernanceRunnerResolvedContext
): ExtractionSnapshot {
  const request = input.request;
  const branchInference = inferBranchFamily(request);
  const systemsTouched = inferSystemsTouched(request, context);
  const overlays = inferOverlayTypes(request, systemsTouched, branchInference.primary);
  const contradictions = mapContradictionsToReferences(input.contradictions);
  const assumptions = mapAssumptionsToReferences(
    input.assumptions,
    branchInference.primary,
    systemsTouched,
    context.currentApprovedPhase
  );
  const unknowns = input.unknowns ?? [];
  const explicitBranchConflict =
    request.primaryBranch !== undefined && request.primaryBranch !== branchInference.primary;
  const requestSearchText = buildRequestSearchText(request);
  const branchStatus =
    explicitBranchConflict === true
      ? "conflicting"
      : request.primaryBranch
        ? "answered"
        : "inferred";
  const systemsStatus = request.systemsTouched?.length ? "answered" : "inferred";
  const actorStatus = statusFromPresence([
    (request.primaryUsers ?? []).join(", "),
    (request.primaryBuyers ?? []).join(", "),
    (request.primaryAdminsOrOperators ?? []).join(", ")
  ]);
  const coreOutcomeStatus = statusFromPresence([
    request.summary,
    request.why,
    request.desiredOutcome
  ]);
  const mvpScopeStatus = statusFromPresence([
    (request.inScopeNow ?? []).join(", "),
    (request.outOfScopeNow ?? []).join(", ")
  ]);
  const workflowStatus = statusFromPresence([request.coreWorkflow, request.currentContext]);
  const dataIntegrationStatus = statusFromPresence([
    (request.dataDependencies ?? []).join(", "),
    (request.integrations ?? []).join(", ")
  ]);
  const constraintsStatus = statusFromPresence([
    (request.budgetConstraints ?? []).join(", "),
    (request.timelineConstraints ?? []).join(", "),
    (request.staffingOrOwnershipConstraints ?? []).join(", "),
    (request.operationalOrComplianceConstraints ?? []).join(", ")
  ]);
  const successCriteriaStatus = statusFromPresence([
    (request.coreSuccessCriteria ?? []).join(", "),
    request.desiredOutcome
  ]);
  const assumptionsStatus = assumptions.length > 0 ? "answered" : "partial";
  const unknownsStatus = unknowns.length > 0 ? "answered" : "partial";
  const futureSignals = dedupeStrings([
    ...(request.futurePhaseCapabilitiesMentioned ?? []),
    ...(requestSearchText.includes("future visual editor") ? ["Future visual editor"] : []),
    ...(requestSearchText.includes("orchestration") ? ["Future orchestration layer"] : [])
  ]);
  const fields = [
    createField({
      category: "Request identity",
      status: "answered",
      score: 95,
      minimum: ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionCriticalCategoryMinimum,
      valueSummary: request.requestedChange
    }),
    createField({
      category: "Primary branch classification",
      status: branchStatus,
      score:
        branchStatus === "answered"
          ? 95
          : branchStatus === "conflicting"
            ? 45
            : 78,
      minimum: ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionCriticalCategoryMinimum,
      notes: explicitBranchConflict
        ? "Explicit branch input diverges from deterministic request inference."
        : undefined,
      valueSummary: branchInference.primary
    }),
    createField({
      category: "User / buyer / operator",
      status: actorStatus,
      score: actorStatus === "answered" ? 90 : actorStatus === "partial" ? 72 : 35,
      minimum: ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionCriticalCategoryMinimum,
      valueSummary: [
        ...(request.primaryUsers ?? []),
        ...(request.primaryBuyers ?? []),
        ...(request.primaryAdminsOrOperators ?? [])
      ].join(", ")
    }),
    createField({
      category: "Core outcome",
      status: coreOutcomeStatus,
      score: coreOutcomeStatus === "answered" ? 88 : coreOutcomeStatus === "partial" ? 74 : 40,
      minimum: ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionCriticalCategoryMinimum,
      valueSummary: request.desiredOutcome ?? request.summary ?? request.requestedChange
    }),
    createField({
      category: "MVP scope",
      status: mvpScopeStatus,
      score: mvpScopeStatus === "answered" ? 86 : mvpScopeStatus === "partial" ? 70 : 42,
      minimum: ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionCriticalCategoryMinimum,
      valueSummary: (request.inScopeNow ?? []).join(", ")
    }),
    createField({
      category: "Workflow truth",
      status: workflowStatus,
      score: workflowStatus === "answered" ? 88 : workflowStatus === "partial" ? 70 : 38,
      minimum: ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionCriticalCategoryMinimum,
      valueSummary: request.coreWorkflow ?? request.currentContext
    }),
    createField({
      category: "Systems touched",
      status: systemsStatus,
      score: systemsStatus === "answered" ? 92 : 78,
      minimum: ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionCriticalCategoryMinimum,
      valueSummary: systemsTouched.join(", ")
    }),
    createField({
      category: "Data / integrations",
      status: dataIntegrationStatus,
      score:
        dataIntegrationStatus === "answered"
          ? 84
          : dataIntegrationStatus === "partial"
            ? 66
            : 50,
      valueSummary: dedupeStrings([
        ...(request.dataDependencies ?? []),
        ...(request.integrations ?? [])
      ]).join(", ")
    }),
    createField({
      category: "Constraints",
      status: constraintsStatus,
      score:
        constraintsStatus === "answered" ? 85 : constraintsStatus === "partial" ? 68 : 56,
      minimum: ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionCriticalCategoryMinimum,
      valueSummary: dedupeStrings([
        ...(request.budgetConstraints ?? []),
        ...(request.timelineConstraints ?? []),
        ...(request.staffingOrOwnershipConstraints ?? []),
        ...(request.operationalOrComplianceConstraints ?? [])
      ]).join(", ")
    }),
    createField({
      category: "Success criteria",
      status: successCriteriaStatus,
      score:
        successCriteriaStatus === "answered"
          ? 86
          : successCriteriaStatus === "partial"
            ? 70
            : 48,
      valueSummary: dedupeStrings([
        ...(request.coreSuccessCriteria ?? []),
        ...(request.desiredOutcome ? [request.desiredOutcome] : [])
      ]).join(", ")
    }),
    createField({
      category: "Assumptions",
      status: assumptionsStatus,
      score: assumptions.length > 0 ? 82 : 62,
      valueSummary: assumptions.map((assumption) => assumption.statement).join("; ")
    }),
    createField({
      category: "Unknowns",
      status: unknownsStatus,
      score: unknowns.length > 0 ? 80 : 64,
      valueSummary: unknowns.map((unknown) => unknown.question).join("; ")
    })
  ];
  const architectureConfidenceScore = averageConfidence(
    fields
      .filter((field) => CRITICAL_EXTRACTION_CATEGORIES.includes(field.category))
      .map((field) => field.confidence.score)
  );
  const criticalCategoriesSatisfied = fields
    .filter((field) => CRITICAL_EXTRACTION_CATEGORIES.includes(field.category))
    .filter((field) => {
      return (
        field.status !== "unanswered" &&
        field.status !== "conflicting" &&
        field.confidence.score >=
          ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionCriticalCategoryMinimum
      );
    })
    .map((field) => field.category);
  const unresolvedCriticalContradiction = contradictions.some((contradiction) => {
    return contradiction.blocked === true && contradiction.severity === "critical";
  });
  const readyToMoveToDeltaAndRoadmapWork =
    criticalCategoriesSatisfied.length === CRITICAL_EXTRACTION_CATEGORIES.length &&
    architectureConfidenceScore >= ARCHITECTURE_CONFIDENCE_THRESHOLDS.roadmapDrafting &&
    !unresolvedCriticalContradiction;
  const roadmapBlockers = dedupeStrings([
    ...(criticalCategoriesSatisfied.length === CRITICAL_EXTRACTION_CATEGORIES.length
      ? []
      : ["Critical extraction categories remain below the roadmap-readiness threshold."]),
    ...(unresolvedCriticalContradiction
      ? ["A blocked critical contradiction exists in the current extracted truth."]
      : []),
    ...(explicitBranchConflict
      ? ["Primary branch classification must be reconciled before roadmap work proceeds cleanly."]
      : [])
  ]);

  return {
    id: input.id ?? createDeterministicRecordId("extraction", request.requestedChange),
    date: input.date ?? "read-only",
    preparedBy: input.preparedBy ?? "Governance Runner v1",
    sourceRequestOrThread: request.requestId,
    requestSummary: {
      requestedChangeOrInitiative: request.requestedChange,
      whyItExists: request.why,
      desiredOutcome: request.desiredOutcome,
      currentContext: request.currentContext ?? request.summary
    },
    branchClassification: {
      primaryBranch: branchInference.primary,
      secondaryBranches: branchInference.secondary,
      overlays,
      branchConfidence: toPercentageConfidence(branchInference.confidence),
      branchStability: request.branchStability ?? branchInference.stability,
      branchShiftSuspected: explicitBranchConflict || branchInference.stability === "Unstable"
    },
    primaryActors: {
      primaryUsers: request.primaryUsers ?? [],
      primaryBuyers: request.primaryBuyers ?? [],
      primaryAdminsOrOperators: request.primaryAdminsOrOperators ?? [],
      secondaryActors: request.secondaryActors ?? []
    },
    productTruth: {
      coreWorkflow:
        request.coreWorkflow ??
        "Structured product-truth and change-governance workflow supplied manually.",
      productType: request.productType,
      businessModel: request.businessModel,
      brandOrExperienceDirection: request.brandOrExperienceDirection,
      coreSuccessCriteria: request.coreSuccessCriteria ?? []
    },
    mvpBoundary: {
      inScopeNow: request.inScopeNow ?? [request.requestedChange],
      outOfScopeNow: request.outOfScopeNow ?? [],
      futurePhaseCapabilitiesMentioned: futureSignals,
      currentPhaseAssumption: context.currentRoadmapAssumption
    },
    systemsAndIntegrations: {
      systemsTouched,
      dataDependencies: request.dataDependencies ?? [],
      integrations: request.integrations ?? [],
      trustLayerSystemsTouched: systemsTouched.filter((system) =>
        TRUST_CRITICAL_SYSTEMS.includes(system as (typeof TRUST_CRITICAL_SYSTEMS)[number])
      )
    },
    constraintsAndRisks: {
      budgetConstraints: request.budgetConstraints ?? [],
      timelineConstraints: request.timelineConstraints ?? [],
      staffingOrOwnershipConstraints: request.staffingOrOwnershipConstraints ?? [],
      operationalOrComplianceConstraints: request.operationalOrComplianceConstraints ?? [],
      knownRisks: request.knownRisks ?? []
    },
    assumptions,
    contradictions,
    unknowns,
    fields,
    roadmapReadiness: {
      state: unresolvedCriticalContradiction
        ? "blocked"
        : readyToMoveToDeltaAndRoadmapWork
          ? "ready"
          : architectureConfidenceScore >=
                ARCHITECTURE_CONFIDENCE_THRESHOLDS.extractionSufficiency
            ? "provisional"
            : "not_ready",
      criticalCategoriesSatisfied,
      unresolvedCriticalContradiction,
      architectureConfidence: toPercentageConfidence(
        architectureConfidenceScore,
        ARCHITECTURE_CONFIDENCE_THRESHOLDS.roadmapDrafting
      ),
      readyToMoveToDeltaAndRoadmapWork,
      blockers: roadmapBlockers
    },
    executionReadiness: {
      state: unresolvedCriticalContradiction ? "blocked" : "not_ready",
      executionMayBegin: false,
      downstreamStepsRequired: DOWNSTREAM_EXECUTION_STEPS,
      preliminaryBlockers: dedupeStrings([
        "Execution cannot begin directly from extraction output in the read-only governance runner.",
        ...roadmapBlockers
      ])
    }
  };
}
