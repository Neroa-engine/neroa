import type { ExtractionState } from "@/lib/intelligence/extraction";
import {
  buildFrameworkUnresolvedQuestionRegister,
  deriveFrameworkConfidenceLevel,
  deriveFrameworkRoadmapClarityLevel,
  evaluateFrameworkTruth,
  type FrameworkConfidenceLevel,
  type FrameworkRoadmapClarityLevel
} from "./framework";
import {
  evaluateBuildDefinitionRecommendationReadiness,
  evaluateLaneRecommendationReadiness,
  evaluatePerceivedProjectReadiness,
  evaluateRoadmapGenerationReadiness,
  evaluateWorkspaceHandoffReadiness,
  type HiddenAlignmentGateResult
} from "./gates";

export interface PerceivedProjectOutput {
  productType: string | null;
  productFunction: string | null;
  targetUser: string | null;
  firstUseCase: string | null;
  businessGoal: string | null;
  projectNameState: string | null;
  readiness: HiddenAlignmentGateResult;
}

export interface StructuredProjectDefinitionOutput {
  founderOperatorContext: string | null;
  projectNameState: string | null;
  productType: string | null;
  productFunction: string | null;
  targetUser: string | null;
  firstUser: string | null;
  firstUseCase: string | null;
  businessGoal: string | null;
  primarySurfaces: string | null;
  keySystemsIntegrations: string | null;
  constraints: string | null;
  monetization: string | null;
  complianceSecuritySensitivity: string | null;
  aiUsage: string | null;
  dataStructureAssumptions: string | null;
  mobileExpectations: string | null;
  adminOpsComplexity: string | null;
  unresolvedQuestions: ReturnType<typeof buildFrameworkUnresolvedQuestionRegister>;
  roadmapClarityLevel: FrameworkRoadmapClarityLevel;
  confidenceLevel: FrameworkConfidenceLevel;
  readiness: HiddenAlignmentGateResult;
}

export interface RoadmapSeedOutput {
  firstReleaseDirection: string | null;
  phasedSequencing: string[];
  criticalDependencies: string[];
  majorAssumptions: string[];
  majorUnresolvedQuestions: string[];
  readiness: HiddenAlignmentGateResult;
}

export interface ScopeSummaryOutput {
  currentReleaseFocus: string | null;
  intentionallyDeferred: string[];
  stillTooUnclearToCommit: string[];
}

export interface BuildDefinitionRecommendationOutput {
  recommendation: "MVP" | "partial build" | "fuller build" | "not yet safe";
  reasoning: string;
  readiness: HiddenAlignmentGateResult;
}

export interface LaneRecommendationOutput {
  recommendation: "DIY" | "Managed" | "conditional / not yet safe";
  reasoning: string;
  readiness: HiddenAlignmentGateResult;
}

export interface UiUxDirectionRecommendationOutput {
  primarySurfaceDirection: string | null;
  experienceLevel: "functional" | "refined" | "elevated";
  notes: string[];
}

function truthSummary(state: ExtractionState, truthKey: Parameters<typeof evaluateFrameworkTruth>[1]) {
  return evaluateFrameworkTruth(state, truthKey).summary;
}

function dedupe<T>(values: readonly T[]) {
  return [...new Set(values)];
}

export function buildPerceivedProjectOutput(
  state: ExtractionState
): PerceivedProjectOutput {
  return {
    productType: truthSummary(state, "product_type"),
    productFunction: truthSummary(state, "product_function"),
    targetUser: truthSummary(state, "target_user"),
    firstUseCase: truthSummary(state, "first_use_case"),
    businessGoal: truthSummary(state, "business_goal"),
    projectNameState: truthSummary(state, "project_name_state"),
    readiness: evaluatePerceivedProjectReadiness(state)
  };
}

export function buildStructuredProjectDefinitionOutput(
  state: ExtractionState
): StructuredProjectDefinitionOutput {
  return {
    founderOperatorContext: truthSummary(state, "founder_operator_context"),
    projectNameState: truthSummary(state, "project_name_state"),
    productType: truthSummary(state, "product_type"),
    productFunction: truthSummary(state, "product_function"),
    targetUser: truthSummary(state, "target_user"),
    firstUser: truthSummary(state, "first_user"),
    firstUseCase: truthSummary(state, "first_use_case"),
    businessGoal: truthSummary(state, "business_goal"),
    primarySurfaces: truthSummary(state, "primary_surfaces"),
    keySystemsIntegrations: truthSummary(state, "key_systems_integrations"),
    constraints: truthSummary(state, "constraints"),
    monetization: truthSummary(state, "monetization"),
    complianceSecuritySensitivity: truthSummary(
      state,
      "compliance_security_sensitivity"
    ),
    aiUsage: truthSummary(state, "ai_usage"),
    dataStructureAssumptions: truthSummary(state, "data_structure_assumptions"),
    mobileExpectations: truthSummary(state, "mobile_expectations"),
    adminOpsComplexity: truthSummary(state, "admin_ops_complexity"),
    unresolvedQuestions: buildFrameworkUnresolvedQuestionRegister(state),
    roadmapClarityLevel: deriveFrameworkRoadmapClarityLevel(state),
    confidenceLevel: deriveFrameworkConfidenceLevel(state),
    readiness: evaluateWorkspaceHandoffReadiness(state)
  };
}

export function buildRoadmapSeedOutput(state: ExtractionState): RoadmapSeedOutput {
  const unresolved = buildFrameworkUnresolvedQuestionRegister(state);
  const phasedSequencing = dedupe(
    [
      truthSummary(state, "first_use_case"),
      truthSummary(state, "primary_surfaces"),
      truthSummary(state, "key_systems_integrations"),
      truthSummary(state, "constraints")
    ].filter((value): value is string => !!value)
  );

  return {
    firstReleaseDirection: truthSummary(state, "first_use_case"),
    phasedSequencing,
    criticalDependencies: dedupe(
      [
        truthSummary(state, "key_systems_integrations"),
        truthSummary(state, "compliance_security_sensitivity"),
        truthSummary(state, "mobile_expectations")
      ].filter((value): value is string => !!value)
    ),
    majorAssumptions: unresolved.openAssumptions,
    majorUnresolvedQuestions: dedupe([
      ...unresolved.unknownQuestions,
      ...unresolved.openContradictions
    ]),
    readiness: evaluateRoadmapGenerationReadiness(state)
  };
}

export function buildScopeSummaryOutput(state: ExtractionState): ScopeSummaryOutput {
  const deferred = state.fields.mvp_out_of_scope.value;
  const deferredItems =
    deferred?.kind === "list"
      ? deferred.items
      : deferred?.summary
      ? [deferred.summary]
      : [];
  const unclear = buildFrameworkUnresolvedQuestionRegister(state);

  return {
    currentReleaseFocus:
      truthSummary(state, "first_use_case") ??
      truthSummary(state, "product_function") ??
      truthSummary(state, "product_type"),
    intentionallyDeferred: deferredItems,
    stillTooUnclearToCommit: dedupe([
      ...unclear.unknownQuestions,
      ...unclear.openContradictions
    ])
  };
}

export function buildBuildDefinitionRecommendationOutput(
  state: ExtractionState
): BuildDefinitionRecommendationOutput {
  const readiness = evaluateBuildDefinitionRecommendationReadiness(state);
  const surfaceSummary = (truthSummary(state, "primary_surfaces") ?? "").toLowerCase();
  const integrationSummary = truthSummary(state, "key_systems_integrations") ?? "";
  const hasMultiSurface =
    surfaceSummary.includes(",") ||
    surfaceSummary.includes("mobile") ||
    surfaceSummary.includes("admin");
  const hasHeavyIntegration =
    integrationSummary.split(",").filter((item) => item.trim().length > 0).length >= 3;

  if (!readiness.ready) {
    return {
      recommendation: "not yet safe",
      reasoning:
        readiness.reasons[0] ??
        "The hidden contract does not yet have enough aligned truth for a stable build-definition recommendation.",
      readiness
    };
  }

  if (hasMultiSurface || hasHeavyIntegration) {
    return {
      recommendation: "partial build",
      reasoning:
        "The first release already spans multiple surfaces or a heavier systems surface, so a partial build is a safer recommendation than a minimal MVP label.",
      readiness
    };
  }

  if ((truthSummary(state, "admin_ops_complexity") ?? "").toLowerCase().includes("high")) {
    return {
      recommendation: "fuller build",
      reasoning:
        "Operational complexity appears high enough that the first workable release likely needs a fuller build shape.",
      readiness
    };
  }

  return {
    recommendation: "MVP",
    reasoning:
      "The hidden truth currently supports a narrower first release with one core use case and a manageable surface set.",
    readiness
  };
}

export function buildLaneRecommendationOutput(
  state: ExtractionState
): LaneRecommendationOutput {
  const readiness = evaluateLaneRecommendationReadiness(state);
  const compliance = (truthSummary(state, "compliance_security_sensitivity") ?? "").toLowerCase();
  const integrations = truthSummary(state, "key_systems_integrations") ?? "";

  if (!readiness.ready) {
    return {
      recommendation: "conditional / not yet safe",
      reasoning:
        readiness.reasons[0] ??
        "The hidden contract still has unresolved truths that make a lane recommendation unsafe.",
      readiness
    };
  }

  if (
    compliance.includes("regulated") ||
    compliance.includes("sensitive") ||
    integrations.split(",").filter((item) => item.trim().length > 0).length >= 3
  ) {
    return {
      recommendation: "Managed",
      reasoning:
        "Sensitive constraints or a heavier systems surface point toward a managed recommendation for the first execution path.",
      readiness
    };
  }

  return {
    recommendation: "DIY",
    reasoning:
      "The hidden planning record currently looks narrow enough that a DIY path remains plausible without stretching the first release shape.",
    readiness
  };
}

export function buildUiUxDirectionRecommendationOutput(
  state: ExtractionState
): UiUxDirectionRecommendationOutput {
  const surfaceSummary = truthSummary(state, "primary_surfaces");
  const brandDirection = (state.fields.brand_direction.value?.summary ?? "").toLowerCase();
  const experienceLevel =
    brandDirection.includes("premium") || brandDirection.includes("editorial")
      ? "elevated"
      : brandDirection.includes("clean") || brandDirection.includes("modern")
      ? "refined"
      : "functional";

  return {
    primarySurfaceDirection: surfaceSummary,
    experienceLevel,
    notes: dedupe(
      [
        truthSummary(state, "mobile_expectations"),
        state.fields.brand_direction.value?.summary ?? null,
        truthSummary(state, "admin_ops_complexity")
      ].filter((value): value is string => !!value)
    )
  };
}

