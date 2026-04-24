import type { ExtractionState } from "@/lib/intelligence/extraction";
import {
  buildScopeSummaryOutput,
  buildStructuredProjectDefinitionOutput,
  buildFrameworkUnresolvedQuestionRegister,
  deriveFrameworkConfidenceLevel,
  evaluateFrameworkTruth,
  evaluateFrameworkTruths,
  evaluateMinimumDataGate,
  evaluateWorkspaceHandoffReadiness
} from "@/lib/intelligence/contracts";
import {
  MINIMUM_WORKSPACE_HANDOFF_TRUTH_KEYS,
  STRATEGY_BRANCH_DEFINITIONS,
  STRATEGY_CAPABILITY_DEFINITIONS,
  STRATEGY_OVERLAY_DEFINITIONS,
  STRATEGY_PHASE_DEFINITIONS,
  STRATEGY_PHASE_SEQUENCE,
  STRATEGY_PRODUCT_SPECIFICITY_FAMILIES,
  STRATEGY_RESEARCH_INTENT_DEFINITIONS
} from "./catalog";
import type {
  StrategyBranchId,
  StrategyCapabilityMatch,
  StrategyFrameworkOutput,
  StrategyNamingMaturity,
  StrategyNamingStatus,
  StrategyOverlayActivation,
  StrategyOverlayId,
  StrategyPhaseCompletionState,
  StrategyPhaseId,
  StrategyPhaseProgress,
  StrategyResearchIntentStatus,
  StrategySummarySafeFields
} from "./types";

const UNKNOWN_PATTERNS = [
  "i don't know",
  "i dont know",
  "not sure",
  "need help",
  "want ideas",
  "want direction",
  "general direction",
  "unclear"
] as const;

const BROAD_PRODUCT_PATTERNS = [
  "ai app",
  "marketplace",
  "crypto saas",
  "platform",
  "tool",
  "app"
] as const;

const GENERIC_AUDIENCE_PATTERNS = [
  "everyone",
  "anyone",
  "all users",
  "businesses",
  "teams",
  "people"
] as const;

const SENSITIVE_PATTERNS = [
  "compliance",
  "regulated",
  "security",
  "privacy",
  "audit",
  "sensitive"
] as const;

const PROJECT_NAME_CAPTURE_PATTERNS = [
  /(?:named|called|project name is|working name is)\s+["']?([A-Z][A-Za-z0-9 _.-]{1,40})["']?/i,
  /["']([A-Z][A-Za-z0-9 _.-]{1,40})["']/
] as const;

function dedupe<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function includesAny(value: string | null | undefined, patterns: readonly string[]) {
  const normalized = normalizeText(value);
  return patterns.some((pattern) => normalized.includes(pattern));
}

function truthSummary(
  state: ExtractionState,
  truthKey: Parameters<typeof evaluateFrameworkTruth>[1]
) {
  return evaluateFrameworkTruth(state, truthKey).summary;
}

function combinedTruthContext(state: ExtractionState) {
  return [
    truthSummary(state, "product_type"),
    truthSummary(state, "product_function"),
    truthSummary(state, "target_user"),
    truthSummary(state, "first_use_case"),
    truthSummary(state, "business_goal"),
    truthSummary(state, "primary_surfaces"),
    truthSummary(state, "key_systems_integrations"),
    state.requestSummary.requestedChangeOrInitiative
  ]
    .filter((value): value is string => !!value)
    .join(" | ");
}

function extractProjectNameCandidate(state: ExtractionState) {
  const sources = [
    truthSummary(state, "project_name_state"),
    truthSummary(state, "domain_validation_path")
  ].filter((value): value is string => !!value);

  for (const source of sources) {
    for (const pattern of PROJECT_NAME_CAPTURE_PATTERNS) {
      const match = source.match(pattern);
      const candidate = match?.[1]?.trim();

      if (candidate && candidate.length >= 2) {
        return candidate;
      }
    }
  }

  return null;
}

function deriveNamingStatus(state: ExtractionState): StrategyNamingStatus {
  const nameSummary = truthSummary(state, "project_name_state");
  const namingHelpSummary = truthSummary(state, "naming_help_state");
  const combined = `${nameSummary ?? ""} ${namingHelpSummary ?? ""}`;

  if (includesAny(combined, ["needs naming help", "naming help requested"])) {
    return "needs_help";
  }

  if (includesAny(combined, ["intentionally unnamed", "unnamed for now"])) {
    return "intentionally_unnamed";
  }

  if (includesAny(combined, ["provisional", "working"])) {
    return "working_name";
  }

  if (includesAny(combined, ["named", "identity exists"])) {
    return "named";
  }

  return "deferred";
}

function deriveNamingMaturity(
  namingStatus: StrategyNamingStatus
): StrategyNamingMaturity {
  switch (namingStatus) {
    case "named":
      return "high";
    case "working_name":
      return "medium";
    default:
      return "low";
  }
}

function deriveDisplayProjectName(
  namingStatus: StrategyNamingStatus,
  workingProjectName: string | null
) {
  if (workingProjectName) {
    return workingProjectName;
  }

  switch (namingStatus) {
    case "needs_help":
      return "Naming help needed";
    case "intentionally_unnamed":
      return "Intentionally unnamed project";
    case "working_name":
      return "Working title pending";
    default:
      return "Untitled project";
  }
}

function deriveCapabilities(state: ExtractionState): StrategyCapabilityMatch[] {
  const source = combinedTruthContext(state);

  return STRATEGY_CAPABILITY_DEFINITIONS.map((capability) => {
    const matchedKeywords = capability.keywords.filter((keyword) =>
      normalizeText(source).includes(keyword)
    );

    return matchedKeywords.length > 0
      ? {
          capabilityId: capability.capabilityId,
          label: capability.label,
          matchedKeywords
        }
      : null;
  }).filter((value): value is StrategyCapabilityMatch => value !== null);
}

function deriveProductSpecificityFamilies(state: ExtractionState) {
  const source = combinedTruthContext(state);

  return STRATEGY_PRODUCT_SPECIFICITY_FAMILIES.filter((family) =>
    family.keywords.some((keyword) => normalizeText(source).includes(keyword))
  ).map((family) => family.label);
}

function deriveUserRoles(state: ExtractionState) {
  const values = [
    truthSummary(state, "target_user"),
    truthSummary(state, "first_user"),
    state.fields.primary_buyers.value?.summary ?? null,
    state.fields.primary_admins.value?.summary ?? null
  ]
    .filter((value): value is string => !!value)
    .map((value) => value.toLowerCase());

  const roles = new Set<string>();

  if (values.some((value) => value.includes("buyer") || value.includes("pay"))) {
    roles.add("buyer");
  }

  if (values.some((value) => value.includes("admin") || value.includes("operator"))) {
    roles.add("admin/operator");
  }

  if (values.some((value) => value.includes("manager") || value.includes("lead"))) {
    roles.add("manager/reviewer");
  }

  if (values.some((value) => value.includes("customer") || value.includes("client"))) {
    roles.add("end customer");
  }

  if (roles.size === 0 && values.length > 0) {
    roles.add("primary user");
  }

  return [...roles];
}

function branchActive(state: ExtractionState, branchId: StrategyBranchId) {
  const truths = evaluateFrameworkTruths(state);
  const combined = combinedTruthContext(state);
  const namingStatus = deriveNamingStatus(state);

  switch (branchId) {
    case "existing_name_capture":
      return namingStatus === "named" || namingStatus === "working_name";
    case "naming_help_requested":
      return (
        namingStatus === "needs_help" ||
        truths.naming_help_state.present ||
        includesAny(truthSummary(state, "naming_help_state"), ["help"])
      );
    case "naming_deferred":
      return namingStatus === "deferred" || namingStatus === "intentionally_unnamed";
    case "domain_validation_intent":
      return truths.domain_intent.present || truths.domain_validation_path.present;
    case "ideation_support":
      return (
        !truths.product_function.present ||
        includesAny(combined, UNKNOWN_PATTERNS)
      );
    case "industry_exploration":
      return !truths.product_type.present && includesAny(combined, UNKNOWN_PATTERNS);
    case "user_exploration":
      return (
        !truths.target_user.present ||
        includesAny(truthSummary(state, "target_user"), GENERIC_AUDIENCE_PATTERNS)
      );
    case "product_type_narrowing":
      return (
        !truths.product_type.present ||
        includesAny(truthSummary(state, "product_type"), BROAD_PRODUCT_PATTERNS) ||
        includesAny(truthSummary(state, "product_function"), BROAD_PRODUCT_PATTERNS)
      );
    case "problem_discovery":
      return !truths.business_goal.present && includesAny(combined, UNKNOWN_PATTERNS);
    case "monetization_direction":
      return truths.monetization.triggered && !truths.monetization.present;
    case "function_capability_narrowing":
      return !truths.first_use_case.present || deriveCapabilities(state).length === 0;
    case "user_role_clarification":
      return (
        !truths.first_user.present ||
        includesAny(truthSummary(state, "target_user"), GENERIC_AUDIENCE_PATTERNS)
      );
    case "integration_clarification":
      return (
        truths.key_systems_integrations.triggered &&
        !truths.key_systems_integrations.present
      );
    case "compliance_screening":
      return (
        !truths.compliance_security_sensitivity.present ||
        includesAny(
          truthSummary(state, "compliance_security_sensitivity"),
          SENSITIVE_PATTERNS
        )
      );
    case "ai_usage_clarification":
      return truths.ai_usage.triggered && !truths.ai_usage.present;
    case "data_structure_clarification":
      return (
        truths.data_structure_assumptions.triggered &&
        !truths.data_structure_assumptions.present
      );
    case "mobile_device_clarification":
      return (
        truths.mobile_expectations.triggered &&
        !truths.mobile_expectations.present
      );
    case "admin_ops_clarification":
      return (
        truths.admin_ops_complexity.triggered &&
        !truths.admin_ops_complexity.present
      );
    case "execution_not_safe_yet":
      return !evaluateMinimumDataGate(state).ready;
    default:
      return false;
  }
}

function deriveActiveBranchIds(state: ExtractionState): StrategyBranchId[] {
  return Object.values(STRATEGY_BRANCH_DEFINITIONS)
    .filter((definition) => branchActive(state, definition.branchId))
    .map((definition) => definition.branchId);
}

function deriveActiveOverlays(state: ExtractionState): StrategyOverlayActivation[] {
  const truths = evaluateFrameworkTruths(state);
  const combined = combinedTruthContext(state);

  return Object.values(STRATEGY_OVERLAY_DEFINITIONS).map((definition) => {
    const active =
      definition.supportingTruthKeys.some((truthKey) => truths[truthKey].present) ||
      (definition.overlayId === "market_crowding" &&
        includesAny(combined, ["crowded", "competitive", "market"])) ||
      (definition.overlayId === "ai_usage" &&
        (truths.ai_usage.present ||
          state.overlayActivations["automation-ai"].determination === "active")) ||
      (definition.overlayId === "data_structure" &&
        state.overlayActivations["data-intelligence"].determination === "active") ||
      (definition.overlayId === "admin_ops" &&
        state.overlayActivations["admin-backoffice"].determination === "active");

    const why = active
      ? `Triggered by ${definition.supportingTruthKeys
          .filter((truthKey) => truths[truthKey].present)
          .join(", ") || "related hidden context"}.`
      : "Not currently triggered by the hidden structured truth.";

    return {
      overlayId: definition.overlayId,
      label: definition.label,
      active,
      why
    };
  });
}

function deriveResearchIntentHooks(
  state: ExtractionState
): StrategyResearchIntentStatus[] {
  const truths = evaluateFrameworkTruths(state);
  const combined = combinedTruthContext(state);

  return Object.values(STRATEGY_RESEARCH_INTENT_DEFINITIONS).map((definition) => {
    let requested = definition.supportingTruthKeys.some((truthKey) => truths[truthKey].present);

    if (definition.intentId === "market_crowding") {
      requested = requested || includesAny(combined, ["crowded", "competitive", "category"]);
    }

    return {
      intentId: definition.intentId,
      label: definition.label,
      requested,
      notes: requested
        ? `Hidden truth suggests ${definition.label.toLowerCase()} may matter later.`
        : `${definition.label} is not currently requested by the hidden record.`
    };
  });
}

function derivePhaseCompletionState(args: {
  missingRequiredTruthKeys: string[];
  conflictingRequiredTruth: boolean;
  readyToExit: boolean;
  anyRequiredTruthPresent: boolean;
  blockingBranchesActive: boolean;
}): StrategyPhaseCompletionState {
  if (args.conflictingRequiredTruth || args.blockingBranchesActive) {
    return "blocked";
  }

  if (args.readyToExit) {
    return "complete";
  }

  if (!args.anyRequiredTruthPresent && args.missingRequiredTruthKeys.length > 0) {
    return "not_started";
  }

  return "in_progress";
}

function derivePhaseReadinessState(
  completionState: StrategyPhaseCompletionState,
  readyToExit: boolean,
  anyRequiredTruthPresent: boolean
) {
  if (completionState === "blocked") {
    return "blocked";
  }

  if (readyToExit) {
    return "ready";
  }

  if (anyRequiredTruthPresent) {
    return "provisional";
  }

  return "not_ready";
}

function buildPhaseProgress(
  state: ExtractionState,
  phaseId: StrategyPhaseId,
  activeBranchIds: StrategyBranchId[],
  activeOverlayIds: StrategyOverlayId[]
): StrategyPhaseProgress {
  const phase = STRATEGY_PHASE_DEFINITIONS[phaseId];
  const truths = evaluateFrameworkTruths(state);
  const satisfiedRequiredTruthKeys = phase.requiredTruthKeys.filter(
    (truthKey) => truths[truthKey].present || truths[truthKey].explicitDeferred
  );
  const missingRequiredTruthKeys = phase.requiredTruthKeys.filter(
    (truthKey) => !truths[truthKey].present && !truths[truthKey].explicitDeferred
  );
  const conflictingRequiredTruth = phase.requiredTruthKeys.some(
    (truthKey) => truths[truthKey].status === "conflicting"
  );
  const readyToExit = phase.exitCriteria.every((criterion) =>
    criterion.truthKeys.every((truthKey) => {
      const truth = truths[truthKey];
      return truth.present || truth.explicitDeferred || !criterion.blocking;
    })
  );
  const blockers = dedupe([
    ...missingRequiredTruthKeys.map(
      (truthKey) => `${truths[truthKey].label} is still missing.`
    ),
    ...phase.exitCriteria
      .filter(
        (criterion) =>
          criterion.blocking &&
          criterion.truthKeys.some((truthKey) => {
            const truth = truths[truthKey];
            return !truth.present && !truth.explicitDeferred;
          })
      )
      .map((criterion) => criterion.description)
  ]);
  const phaseActiveBranchIds = activeBranchIds.filter((branchId) =>
    phase.branchTriggerIds.includes(branchId)
  );
  const blockingBranchesActive = phaseActiveBranchIds.some((branchId) => {
    const definition = STRATEGY_BRANCH_DEFINITIONS[branchId];
    return definition.blockingEffect === "blocking" && blockers.length > 0;
  });
  const anyRequiredTruthPresent = satisfiedRequiredTruthKeys.length > 0;
  const completionState = derivePhaseCompletionState({
    missingRequiredTruthKeys,
    conflictingRequiredTruth,
    readyToExit,
    anyRequiredTruthPresent,
    blockingBranchesActive
  });

  return {
    phaseId,
    label: phase.label,
    completionState,
    readinessState: derivePhaseReadinessState(
      completionState,
      readyToExit,
      anyRequiredTruthPresent
    ),
    requiredTruthKeys: phase.requiredTruthKeys,
    optionalTruthKeys: phase.optionalTruthKeys,
    satisfiedRequiredTruthKeys,
    missingRequiredTruthKeys,
    activeBranchIds: phaseActiveBranchIds,
    activeOverlayIds: activeOverlayIds.filter((overlayId) =>
      phase.overlayIds.includes(overlayId)
    ),
    readyToExit,
    blockers
  };
}

function buildPhaseProgressMap(
  state: ExtractionState,
  activeBranchIds: StrategyBranchId[],
  activeOverlayIds: StrategyOverlayId[]
) {
  return STRATEGY_PHASE_SEQUENCE.reduce(
    (result, phase) => {
      result[phase.phaseId] = buildPhaseProgress(
        state,
        phase.phaseId,
        activeBranchIds,
        activeOverlayIds
      );
      return result;
    },
    {} as Record<StrategyPhaseId, StrategyPhaseProgress>
  );
}

function deriveCurrentPhaseId(progress: Record<StrategyPhaseId, StrategyPhaseProgress>) {
  return (
    STRATEGY_PHASE_SEQUENCE.find(
      (phase) => progress[phase.phaseId].completionState !== "complete"
    )?.phaseId ?? STRATEGY_PHASE_SEQUENCE[STRATEGY_PHASE_SEQUENCE.length - 1].phaseId
  );
}

function deriveNextBestPhaseId(
  progress: Record<StrategyPhaseId, StrategyPhaseProgress>,
  currentPhaseId: StrategyPhaseId
) {
  const currentPhase = STRATEGY_PHASE_DEFINITIONS[currentPhaseId];

  if (progress[currentPhaseId].completionState === "complete") {
    return currentPhase.nextPhaseId;
  }

  return currentPhaseId;
}

function buildSummarySafeFields(state: ExtractionState): StrategySummarySafeFields {
  const structured = buildStructuredProjectDefinitionOutput(state);
  const namingStatus = deriveNamingStatus(state);
  const workingProjectName = extractProjectNameCandidate(state);
  const displayProjectName = deriveDisplayProjectName(
    namingStatus,
    workingProjectName
  );
  const productLine = structured.productFunction ?? structured.productType;
  const userLine = structured.firstUser ?? structured.targetUser;
  const focusLine =
    structured.firstUseCase ??
    structured.businessGoal ??
    structured.primarySurfaces ??
    structured.productFunction;

  return {
    displayProjectName,
    conciseWhatYouAreBuilding: productLine,
    conciseWhoItsFor: userLine,
    concisePrimaryGoal: structured.businessGoal,
    conversationSnapshotProduct: productLine,
    conversationSnapshotUsers: userLine,
    conversationSnapshotFocus: focusLine
  };
}

export function buildStrategyFrameworkOutput(
  state: ExtractionState
): StrategyFrameworkOutput {
  const structured = buildStructuredProjectDefinitionOutput(state);
  const minimumDataGate = evaluateMinimumDataGate(state);
  const workspaceHandoffReadiness = evaluateWorkspaceHandoffReadiness(state);
  const scopeSummary = buildScopeSummaryOutput(state);
  const namingStatus = deriveNamingStatus(state);
  const workingProjectName = extractProjectNameCandidate(state);
  const activeBranchIds = deriveActiveBranchIds(state);
  const activeOverlays = deriveActiveOverlays(state);
  const phaseProgress = buildPhaseProgressMap(
    state,
    activeBranchIds,
    activeOverlays.filter((overlay) => overlay.active).map((overlay) => overlay.overlayId)
  );
  const currentPhaseId = deriveCurrentPhaseId(phaseProgress);
  const nextBestPhaseId = deriveNextBestPhaseId(phaseProgress, currentPhaseId);
  const unresolved = buildFrameworkUnresolvedQuestionRegister(state);
  const summarySafeFields = buildSummarySafeFields(state);

  return {
    founderIdentityBlock: {
      founderOperatorContext: structured.founderOperatorContext
    },
    projectNamingBlock: {
      namingStatus,
      namingMaturity: deriveNamingMaturity(namingStatus),
      workingProjectName,
      displayProjectName: summarySafeFields.displayProjectName,
      namingHelpState: truthSummary(state, "naming_help_state"),
      domainIntent: truthSummary(state, "domain_intent"),
      domainValidationPath: truthSummary(state, "domain_validation_path")
    },
    productDefinitionBlock: {
      productType: structured.productType,
      productFunction: structured.productFunction,
      productSpecificityFamilies: deriveProductSpecificityFamilies(state)
    },
    functionCapabilityBlock: {
      firstUseCase: structured.firstUseCase,
      capabilities: deriveCapabilities(state)
    },
    userBlock: {
      targetUser: structured.targetUser,
      firstUser: structured.firstUser,
      inferredUserRoles: deriveUserRoles(state)
    },
    goalsOutcomesBlock: {
      businessGoal: structured.businessGoal,
      roadmapClarityLevel: structured.roadmapClarityLevel,
      confidenceLevel: structured.confidenceLevel
    },
    surfaceBlock: {
      primarySurfaces: structured.primarySurfaces,
      mobileExpectations: structured.mobileExpectations
    },
    systemsIntegrationBlock: {
      keySystemsIntegrations: structured.keySystemsIntegrations,
      constraints: structured.constraints,
      monetization: structured.monetization,
      complianceSecuritySensitivity: structured.complianceSecuritySensitivity,
      aiUsage: structured.aiUsage,
      dataStructureAssumptions: structured.dataStructureAssumptions,
      adminOpsComplexity: structured.adminOpsComplexity
    },
    activeBranchIds,
    activeOverlays,
    researchIntentHooks: deriveResearchIntentHooks(state),
    phaseProgress,
    minimumDataGate,
    workspaceHandoffReadiness,
    summarySafeFields,
    progressModel: {
      currentPhaseId,
      nextBestPhaseId,
      phaseCompletionCount: STRATEGY_PHASE_SEQUENCE.filter(
        (phase) => phaseProgress[phase.phaseId].completionState === "complete"
      ).length,
      totalPhaseCount: STRATEGY_PHASE_SEQUENCE.length,
      readinessConfidence: deriveFrameworkConfidenceLevel(state),
      workspaceHandoffConfidence: workspaceHandoffReadiness.confidenceScore,
      unresolvedBlockers: dedupe([
        ...minimumDataGate.reasons,
        ...workspaceHandoffReadiness.reasons,
        ...scopeSummary.stillTooUnclearToCommit,
        ...unresolved.unknownQuestions
      ])
    }
  };
}

export function evaluateMinimumWorkspaceHandoffTruthCoverage(state: ExtractionState) {
  const truths = evaluateFrameworkTruths(state);

  return {
    satisfiedTruthKeys: MINIMUM_WORKSPACE_HANDOFF_TRUTH_KEYS.filter(
      (truthKey) => truths[truthKey].present || truths[truthKey].explicitDeferred
    ),
    missingTruthKeys: MINIMUM_WORKSPACE_HANDOFF_TRUTH_KEYS.filter(
      (truthKey) => !truths[truthKey].present && !truths[truthKey].explicitDeferred
    )
  };
}
