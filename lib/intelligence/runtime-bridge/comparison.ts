import type { BranchClassificationResult } from "@/lib/intelligence/branching";
import {
  type ExtractionCategoryKey,
  type ExtractionFieldKey
} from "@/lib/intelligence/extraction";
import {
  getQuestionRegistryEntry,
  type QuestionCandidate,
  type QuestionSelectionResult,
  type QuestionSelectionType
} from "@/lib/intelligence/questions";
import {
  cleanText,
  dedupe,
  normalizeText,
  splitIntoSegments,
  stableHash
} from "@/lib/intelligence/adapters/helpers";
import {
  FRAMEWORK_TRUTH_DEFINITIONS,
  type FrameworkTruthKey
} from "@/lib/intelligence/contracts";
import type {
  CompareLiveAndHiddenQuestionTargetsInput,
  HiddenQuestionSelectionSnapshot,
  LiveVisibleQuestionAnalysis,
  LiveVisibleQuestionTarget,
  ShadowComparisonAreaId,
  ShadowComparisonAreaResult,
  ShadowMismatchDetail,
  ShadowQuestionComparisonResult,
  StartShadowMatchLevel,
  StartShadowTrace,
  StartVisibleStrategistLog
} from "./types";

function intersects<T>(left: readonly T[], right: readonly T[]) {
  return left.some((value) => right.includes(value));
}

function collectQuestionLines(assistantReply: string) {
  return assistantReply
    .split(/\n+/)
    .flatMap((line) => splitIntoSegments(line))
    .map((line) => cleanText(line))
    .filter((line) => line.includes("?"));
}

function buildVisibleTarget(args: {
  questionText: string;
  primaryTargetId: string | null;
  candidateTargetIds?: string[];
  label: string;
  confidenceScore: number;
  reason: string;
  questionTypeHint: QuestionSelectionType | null;
  branchResolutionRelevant?: boolean;
  contradictionRelevant?: boolean;
  unknownRelevant?: boolean;
  relatedFieldKeys?: ExtractionFieldKey[];
  relatedCategoryKeys?: ExtractionCategoryKey[];
}) {
  const candidateTargetIds = dedupe(
    [args.primaryTargetId, ...(args.candidateTargetIds ?? [])].filter(
      (value): value is string => typeof value === "string" && value.length > 0
    )
  );
  const registryEntries = candidateTargetIds
    .map((targetId) => getQuestionRegistryEntry(targetId))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return {
    questionText: args.questionText,
    primaryTargetId: args.primaryTargetId,
    candidateTargetIds,
    label: args.label,
    confidenceScore: args.confidenceScore,
    reason: args.reason,
    relatedFieldKeys: dedupe([
      ...(args.relatedFieldKeys ?? []),
      ...registryEntries.flatMap((entry) => entry.fieldKeys)
    ]),
    relatedCategoryKeys: dedupe([
      ...(args.relatedCategoryKeys ?? []),
      ...registryEntries.flatMap((entry) => entry.categoryKeys)
    ]),
    questionTypeHint: args.questionTypeHint,
    branchResolutionRelevant:
      args.branchResolutionRelevant ?? registryEntries.some((entry) => entry.branchRelevant),
    contradictionRelevant: args.contradictionRelevant ?? false,
    unknownRelevant: args.unknownRelevant ?? false
  } satisfies LiveVisibleQuestionTarget;
}

function inferVisibleTarget(questionText: string): LiveVisibleQuestionTarget {
  const normalized = normalizeText(questionText);

  if (
    normalized.includes("marketplace") &&
    (normalized.includes("brand storefront") ||
      normalized.includes("focused brand") ||
      normalized.includes("many sellers") ||
      normalized.includes("single brand") ||
      normalized.includes("broader shop") ||
      normalized.includes("catalog-driven"))
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "branch:ambiguity",
      candidateTargetIds: ["field:primary_branch", "field:product_type"],
      label: "Branch resolution",
      confidenceScore: 0.95,
      reason:
        "The live question is explicitly asking the user to choose between competing system shapes.",
      questionTypeHint: "branch_resolution",
      branchResolutionRelevant: true
    });
  }

  if (
    normalized.includes("before i map this forward, is this closer to") ||
    normalized.includes("what kind of product model is this actually closest to")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "branch:ambiguity",
      candidateTargetIds: ["field:primary_branch", "field:product_type"],
      label: "Branch resolution",
      confidenceScore: 0.96,
      reason:
        "The live question is explicitly trying to lock the product shape between competing branch models.",
      questionTypeHint: "branch_resolution",
      branchResolutionRelevant: true
    });
  }

  if (normalized.includes("two sides of the marketplace")) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "branch:ambiguity",
      candidateTargetIds: ["field:primary_users", "field:primary_buyers"],
      label: "Marketplace side clarification",
      confidenceScore: 0.9,
      reason:
        "The live question is trying to resolve a marketplace shape through actor clarification.",
      questionTypeHint: "branch_resolution",
      branchResolutionRelevant: true
    });
  }

  if (
    normalized.includes("what are you thinking about building") ||
    normalized.includes("what kind of product experience are you picturing") ||
    normalized.includes("what kind of product experience is this") ||
    normalized.includes("what kind of product or business is this experience actually for")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:core_concept",
      candidateTargetIds: ["field:request_summary", "field:product_type"],
      label: "Core concept clarification",
      confidenceScore: 0.9,
      reason: "The live question is still shaping the core product concept.",
      questionTypeHint: "critical_unknown",
      branchResolutionRelevant:
        normalized.includes("product or business") || normalized.includes("what kind of product"),
      relatedCategoryKeys: ["request_core_concept", "branch_product_type"]
    });
  }

  if (
    normalized.includes("who is this mainly for") ||
    normalized.includes("who is the first user or buyer") ||
    normalized.includes("who are you trying to win over first") ||
    normalized.includes("who needs to feel that most strongly")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:primary_users",
      candidateTargetIds: ["field:primary_buyers"],
      label: "Actor clarification",
      confidenceScore: 0.92,
      reason: "The live question is trying to identify the first user or buyer.",
      questionTypeHint: "actor_clarification"
    });
  }

  if (
    normalized.includes("who is going to run this day to day") ||
    normalized.includes("who will run this day to day")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:primary_admins",
      label: "Operator clarification",
      confidenceScore: 0.9,
      reason: "The live question is trying to identify the primary admin or operator.",
      questionTypeHint: "actor_clarification"
    });
  }

  if (
    normalized.includes("what problem is painful enough") ||
    normalized.includes("what problem does this solve")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:problem_statement",
      candidateTargetIds: ["field:desired_outcome"],
      label: "Problem clarification",
      confidenceScore: 0.92,
      reason: "The live question is clarifying the core problem worth solving.",
      questionTypeHint: "critical_unknown",
      unknownRelevant: true
    });
  }

  if (
    normalized.includes("what should it help them do first") ||
    normalized.includes("what changes for the user or the business") ||
    normalized.includes("what should someone feel or do within the first minute")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:desired_outcome",
      candidateTargetIds: ["field:problem_statement", "field:success_criteria"],
      label: "Outcome clarification",
      confidenceScore: 0.92,
      reason: "The live question is trying to clarify the first outcome or first win.",
      questionTypeHint: "critical_unknown"
    });
  }

  if (
    normalized.includes("what is the first experience or workflow") ||
    normalized.includes("what is the first transaction or connection")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:core_workflow",
      candidateTargetIds: ["field:systems_touched"],
      label: "Workflow clarification",
      confidenceScore: 0.94,
      reason: "The live question is trying to tighten the first workflow.",
      questionTypeHint: "workflow_clarification"
    });
  }

  if (
    normalized.includes("what has to feel excellent the first time") ||
    normalized.includes("what would make the first version feel unmistakably right")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:success_criteria",
      candidateTargetIds: ["field:mvp_in_scope", "field:desired_outcome"],
      label: "Success criteria clarification",
      confidenceScore: 0.88,
      reason:
        "The live question is tightening what the first version has to get right.",
      questionTypeHint: "partial_truth_narrowing"
    });
  }

  if (
    normalized.includes("should the experience feel") ||
    normalized.includes("is the brand closer") ||
    normalized.includes("visual direction") ||
    normalized.includes("luxury minimal") ||
    normalized.includes("cinematic")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:brand_direction",
      label: "Brand direction clarification",
      confidenceScore: 0.93,
      reason: "The live question is clarifying the intended brand or experience direction.",
      questionTypeHint: "partial_truth_narrowing"
    });
  }

  if (
    normalized.includes("in scope") ||
    normalized.includes("out of scope") ||
    normalized.includes("first version")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:mvp_in_scope",
      candidateTargetIds: ["field:mvp_out_of_scope"],
      label: "MVP boundary clarification",
      confidenceScore: 0.84,
      reason: "The live question is clarifying what belongs in the first release boundary.",
      questionTypeHint: "mvp_boundary_clarification"
    });
  }

  if (
    normalized.includes("how does this make money") ||
    normalized.includes("create value first")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:business_model",
      label: "Business model clarification",
      confidenceScore: 0.88,
      reason: "The live question is clarifying how the product creates or captures value.",
      questionTypeHint: "partial_truth_narrowing"
    });
  }

  if (
    normalized.includes("system") ||
    normalized.includes("integration") ||
    normalized.includes("data depend") ||
    normalized.includes("what systems")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:systems_touched",
      candidateTargetIds: ["field:integrations", "field:data_dependencies"],
      label: "Systems / integration clarification",
      confidenceScore: 0.86,
      reason: "The live question is clarifying systems or integration scope.",
      questionTypeHint: "systems_integration_clarification"
    });
  }

  if (normalized.includes("what data dependencies")) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:data_dependencies",
      candidateTargetIds: ["field:systems_touched", "field:integrations"],
      label: "Data dependency clarification",
      confidenceScore: 0.88,
      reason: "The live question is clarifying the data dependencies behind the product.",
      questionTypeHint: "systems_integration_clarification"
    });
  }

  if (
    normalized.includes("budget") ||
    normalized.includes("timeline") ||
    normalized.includes("deadline") ||
    normalized.includes("constraint")
  ) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:constraints",
      candidateTargetIds: ["field:budget_constraints", "field:timeline_constraints"],
      label: "Constraint clarification",
      confidenceScore: 0.84,
      reason: "The live question is clarifying budget, timing, or other constraints.",
      questionTypeHint: "constraint_clarification"
    });
  }

  if (normalized.includes("how should this feel when someone first lands")) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:brand_direction",
      label: "Brand direction clarification",
      confidenceScore: 0.92,
      reason: "The live question is clarifying the intended first-impression feel.",
      questionTypeHint: "partial_truth_narrowing"
    });
  }

  if (normalized.includes("i need to resolve one tension first")) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "category:contradictions",
      label: "Contradiction resolution",
      confidenceScore: 0.86,
      reason: "The live question is explicitly resolving a contradiction before moving forward.",
      questionTypeHint: "contradiction_resolution",
      contradictionRelevant: true
    });
  }

  if (normalized.includes("i want to confirm one thing")) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "category:assumptions",
      label: "Assumption confirmation",
      confidenceScore: 0.8,
      reason: "The live question is explicitly confirming an inferred assumption.",
      questionTypeHint: "assumption_confirmation"
    });
  }

  if (normalized.includes("what should i sharpen next")) {
    return buildVisibleTarget({
      questionText,
      primaryTargetId: "field:request_summary",
      candidateTargetIds: ["field:core_concept"],
      label: "Generic refinement",
      confidenceScore: 0.52,
      reason:
        "The live question is asking for a broad refinement signal without a narrower target.",
      questionTypeHint: "partial_truth_narrowing"
    });
  }

  return buildVisibleTarget({
    questionText,
    primaryTargetId: "field:request_summary",
    candidateTargetIds: ["field:core_concept"],
    label: "Unmapped live question",
    confidenceScore: 0.38,
    reason:
      "The live question is present, but the shadow bridge could only map it to a generic request-summary target.",
    questionTypeHint: "critical_unknown"
  });
}

function createLiveVisibleQuestionAnalysis(assistantReply: string) {
  const questions = collectQuestionLines(assistantReply);
  const inferredTargets = questions.map((questionText) => inferVisibleTarget(questionText));

  return {
    questions,
    inferredTargets,
    asksQuestion: questions.length > 0,
    questionCount: questions.length,
    questionSignature: stableHash(
      inferredTargets
        .map((target) => `${target.primaryTargetId ?? "none"}:${normalizeText(target.questionText)}`)
        .join("|")
    ),
    notes:
      questions.length === 0
        ? ["The live assistant reply did not expose an explicit question to compare."]
        : []
  } satisfies LiveVisibleQuestionAnalysis;
}

function createHiddenQuestionSelectionSnapshot(
  questionSelection: QuestionSelectionResult
) {
  return {
    selectedTargetId: questionSelection.selectedQuestionTarget?.targetId ?? null,
    selectedTargetLabel: questionSelection.selectedQuestionTarget?.label ?? null,
    selectedQuestionType: questionSelection.selectedQuestionType,
    whyChosen: questionSelection.whyChosen,
    priorityScore: questionSelection.priorityScore,
    relatedFieldKeys: questionSelection.relatedFieldKeys,
    relatedCategoryKeys: questionSelection.relatedCategoryKeys,
    relatedContradictionIds: questionSelection.relatedContradictionIds,
    relatedUnknownIds: questionSelection.relatedUnknownIds,
    branchResolutionRelevant: questionSelection.branchResolutionRelevant,
    roadmapReadinessRelevant: questionSelection.roadmapReadinessRelevant,
    executionReadinessRelevant: questionSelection.executionReadinessRelevant,
    roadmapGateState: questionSelection.roadmapGate.state,
    executionGateState: questionSelection.executionGate.state
  } satisfies HiddenQuestionSelectionSnapshot;
}

type ShadowAreaDefinition = {
  areaId: ShadowComparisonAreaId;
  label: string;
  truthKeys: FrameworkTruthKey[];
  phaseIds: readonly CompareLiveAndHiddenQuestionTargetsInput["strategyFramework"]["progressModel"]["currentPhaseId"][];
  branchIds: readonly CompareLiveAndHiddenQuestionTargetsInput["strategyFramework"]["activeBranchIds"][number][];
  liveTextPatterns: readonly string[];
  visibleTopicCategories: readonly NonNullable<
    StartVisibleStrategistLog["renderedTopicCategory"]
  >[];
};

const SHADOW_AREA_DEFINITIONS: readonly ShadowAreaDefinition[] = [
  {
    areaId: "naming_capture",
    label: "Naming capture quality",
    truthKeys: [
      "project_name_state",
      "naming_help_state",
      "domain_intent",
      "domain_validation_path"
    ],
    phaseIds: ["identity", "naming"],
    branchIds: [
      "existing_name_capture",
      "naming_help_requested",
      "naming_deferred",
      "domain_validation_intent"
    ],
    liveTextPatterns: ["name", "call this", "working name", "domain", "brandable"],
    visibleTopicCategories: ["product_shape", "assumption"]
  },
  {
    areaId: "ideation_handling",
    label: "I don't know handling",
    truthKeys: [
      "product_type",
      "product_function",
      "target_user",
      "first_use_case",
      "business_goal"
    ],
    phaseIds: ["core_idea", "product_definition"],
    branchIds: [
      "ideation_support",
      "industry_exploration",
      "user_exploration",
      "problem_discovery",
      "function_capability_narrowing"
    ],
    liveTextPatterns: ["what are you thinking about building", "what kind of product", "who is this mainly for", "what problem"],
    visibleTopicCategories: ["product_shape", "actors", "outcome", "workflow", "generic"]
  },
  {
    areaId: "product_definition_specificity",
    label: "Product-definition specificity",
    truthKeys: ["product_type", "product_function"],
    phaseIds: ["core_idea", "product_definition"],
    branchIds: ["product_type_narrowing"],
    liveTextPatterns: ["what kind of product", "what kind of product model", "marketplace", "platform", "product experience"],
    visibleTopicCategories: ["product_shape", "branch_model"]
  },
  {
    areaId: "user_definition_depth",
    label: "User-definition depth",
    truthKeys: ["target_user", "first_user"],
    phaseIds: ["user"],
    branchIds: ["user_exploration", "user_role_clarification"],
    liveTextPatterns: ["who is this", "who is the first user", "who are you trying to win", "who is going to run"],
    visibleTopicCategories: ["actors"]
  },
  {
    areaId: "function_capability_discovery",
    label: "Function/capability discovery",
    truthKeys: ["product_function", "first_use_case"],
    phaseIds: ["function"],
    branchIds: ["function_capability_narrowing"],
    liveTextPatterns: ["what should it help them do", "what is the first experience", "workflow", "transaction", "connection"],
    visibleTopicCategories: ["workflow", "product_shape"]
  },
  {
    areaId: "goals_outcomes_depth",
    label: "Goals/outcomes depth",
    truthKeys: ["business_goal"],
    phaseIds: ["goals_outcomes"],
    branchIds: ["problem_discovery", "monetization_direction"],
    liveTextPatterns: ["what changes for the user", "what success", "what would make", "how does this make money", "create value"],
    visibleTopicCategories: ["outcome", "business_model", "mvp_scope"]
  },
  {
    areaId: "surface_discovery_depth",
    label: "Surface discovery depth",
    truthKeys: ["primary_surfaces", "mobile_expectations"],
    phaseIds: ["surface_discovery"],
    branchIds: ["mobile_device_clarification"],
    liveTextPatterns: ["public", "portal", "dashboard", "admin", "mobile", "first screen"],
    visibleTopicCategories: ["product_surfaces", "experience"]
  },
  {
    areaId: "systems_integration_constraint_capture",
    label: "Systems/integration/constraint capture",
    truthKeys: [
      "key_systems_integrations",
      "constraints",
      "monetization",
      "compliance_security_sensitivity",
      "ai_usage",
      "data_structure_assumptions",
      "admin_ops_complexity"
    ],
    phaseIds: ["systems_integrations_constraints"],
    branchIds: [
      "integration_clarification",
      "compliance_screening",
      "ai_usage_clarification",
      "data_structure_clarification",
      "admin_ops_clarification",
      "monetization_direction"
    ],
    liveTextPatterns: [
      "system",
      "integration",
      "api",
      "data depend",
      "budget",
      "timeline",
      "constraint",
      "deadline",
      "make money"
    ],
    visibleTopicCategories: ["data_integrations", "constraints", "business_model", "overlay"]
  },
  {
    areaId: "handoff_gate_readiness_quality",
    label: "Handoff-gate readiness quality",
    truthKeys: [
      "project_name_state",
      "product_function",
      "target_user",
      "first_use_case",
      "business_goal"
    ],
    phaseIds: ["systems_integrations_constraints"],
    branchIds: ["execution_not_safe_yet"],
    liveTextPatterns: ["workspace", "handoff", "roadmap", "execution", "build milestone", "open the workspace"],
    visibleTopicCategories: ["readiness"]
  },
  {
    areaId: "summary_safety_risk",
    label: "Summary-safety risk",
    truthKeys: ["project_name_state", "product_function", "target_user", "business_goal"],
    phaseIds: ["identity", "naming", "core_idea", "product_definition", "function", "user", "goals_outcomes"],
    branchIds: ["execution_not_safe_yet"],
    liveTextPatterns: [
      "what are you thinking about building",
      "who is this mainly for",
      "what changes for the user",
      "what should it help them do"
    ],
    visibleTopicCategories: ["product_shape", "actors", "outcome", "workflow", "generic"]
  }
] as const;

const FOUNDATIONAL_PHASE_ORDER: Record<
  CompareLiveAndHiddenQuestionTargetsInput["strategyFramework"]["progressModel"]["currentPhaseId"],
  number
> = {
  identity: 1,
  naming: 2,
  core_idea: 3,
  product_definition: 4,
  function: 5,
  user: 6,
  goals_outcomes: 7,
  surface_discovery: 8,
  systems_integrations_constraints: 9
};

const LATE_STAGE_VISIBLE_TOPIC_CATEGORIES = new Set<
  NonNullable<StartVisibleStrategistLog["renderedTopicCategory"]>
>(["product_surfaces", "data_integrations", "experience", "constraints", "business_model", "mvp_scope", "readiness"]);

function fieldKeysForTruthKeys(truthKeys: readonly FrameworkTruthKey[]) {
  return dedupe(
    truthKeys.flatMap((truthKey) => FRAMEWORK_TRUTH_DEFINITIONS[truthKey].fieldKeys)
  );
}

function liveTargetsFieldKeys(live: LiveVisibleQuestionAnalysis) {
  return dedupe(live.inferredTargets.flatMap((target) => target.relatedFieldKeys));
}

function hiddenTargetsFieldKeys(hidden: HiddenQuestionSelectionSnapshot) {
  return dedupe(hidden.relatedFieldKeys);
}

function liveTextMatchesPatterns(
  assistantReply: string,
  live: LiveVisibleQuestionAnalysis,
  patterns: readonly string[]
) {
  const combined = [assistantReply, ...live.questions].join(" | ").toLowerCase();
  return patterns.some((pattern) => combined.includes(pattern.toLowerCase()));
}

function areaIsInFocus(
  definition: ShadowAreaDefinition,
  strategyFramework: CompareLiveAndHiddenQuestionTargetsInput["strategyFramework"]
) {
  if (definition.areaId === "handoff_gate_readiness_quality") {
    return (
      !strategyFramework.minimumDataGate.ready ||
      !strategyFramework.workspaceHandoffReadiness.ready
    );
  }

  if (definition.areaId === "summary_safety_risk") {
    return (
      !strategyFramework.summarySafeFields.conciseWhatYouAreBuilding ||
      !strategyFramework.summarySafeFields.conciseWhoItsFor ||
      !strategyFramework.summarySafeFields.concisePrimaryGoal ||
      !strategyFramework.minimumDataGate.ready
    );
  }

  const currentPhase =
    strategyFramework.phaseProgress[strategyFramework.progressModel.currentPhaseId];

  return (
    definition.phaseIds.includes(strategyFramework.progressModel.currentPhaseId) ||
    currentPhase.missingRequiredTruthKeys.some((truthKey) =>
      definition.truthKeys.includes(truthKey)
    ) ||
    strategyFramework.activeBranchIds.some((branchId) =>
      definition.branchIds.includes(branchId)
    )
  );
}

function hiddenTargetsArea(
  definition: ShadowAreaDefinition,
  hidden: HiddenQuestionSelectionSnapshot,
  strategyFramework: CompareLiveAndHiddenQuestionTargetsInput["strategyFramework"]
) {
  if (definition.areaId === "handoff_gate_readiness_quality") {
    return hidden.roadmapReadinessRelevant || hidden.executionReadinessRelevant;
  }

  if (definition.areaId === "summary_safety_risk") {
    const summaryFieldKeys = fieldKeysForTruthKeys(definition.truthKeys);
    return (
      intersects(hiddenTargetsFieldKeys(hidden), summaryFieldKeys) ||
      hidden.roadmapReadinessRelevant ||
      hidden.executionReadinessRelevant
    );
  }

  const areaFieldKeys = fieldKeysForTruthKeys(definition.truthKeys);

  return intersects(hiddenTargetsFieldKeys(hidden), areaFieldKeys);
}

function liveTargetsArea(args: {
  definition: ShadowAreaDefinition;
  assistantReply: string;
  live: LiveVisibleQuestionAnalysis;
  visibleStrategist?: StartVisibleStrategistLog | null;
}) {
  const areaFieldKeys = fieldKeysForTruthKeys(args.definition.truthKeys);
  const visibleTopicCategory = args.visibleStrategist?.renderedTopicCategory ?? null;

  if (
    visibleTopicCategory &&
    args.definition.visibleTopicCategories.includes(visibleTopicCategory)
  ) {
    return true;
  }

  if (intersects(liveTargetsFieldKeys(args.live), areaFieldKeys)) {
    return true;
  }

  return liveTextMatchesPatterns(
    args.assistantReply,
    args.live,
    args.definition.liveTextPatterns
  );
}

function buildCoverageAreas(args: {
  assistantReply: string;
  live: LiveVisibleQuestionAnalysis;
  hidden: HiddenQuestionSelectionSnapshot;
  strategyFramework: CompareLiveAndHiddenQuestionTargetsInput["strategyFramework"];
  visibleStrategist?: StartVisibleStrategistLog | null;
}) {
  return SHADOW_AREA_DEFINITIONS.map((definition) => {
    const inFocus = areaIsInFocus(definition, args.strategyFramework);
    const hiddenTargeted = hiddenTargetsArea(
      definition,
      args.hidden,
      args.strategyFramework
    );
    const liveTargeted = liveTargetsArea({
      definition,
      assistantReply: args.assistantReply,
      live: args.live,
      visibleStrategist: args.visibleStrategist
    });
    const status = !inFocus
      ? "not_in_focus"
      : hiddenTargeted && liveTargeted
      ? "match"
      : hiddenTargeted
      ? "hidden_stronger"
      : liveTargeted
      ? "live_acceptable"
      : "both_weak";
    const notes = [
      inFocus ? `${definition.label} is currently in focus.` : `${definition.label} is not currently in focus.`,
      hiddenTargeted
        ? "The hidden selector is actively targeting this area."
        : "The hidden selector is not actively targeting this area.",
      liveTargeted
        ? "The live reply is covering this area."
        : "The live reply is not covering this area."
    ];

    return {
      areaId: definition.areaId,
      label: definition.label,
      status,
      inFocus,
      hiddenTargeted,
      liveTargeted,
      notes
    } satisfies ShadowComparisonAreaResult;
  });
}

function liveTargetMatchesCandidate(
  liveTarget: LiveVisibleQuestionTarget,
  candidate: Pick<
    QuestionCandidate,
    | "target"
    | "relatedFieldKeys"
    | "relatedCategoryKeys"
    | "branchResolutionRelevant"
    | "questionType"
  >
) {
  const candidateFieldKeys = dedupe([
    ...candidate.relatedFieldKeys,
    ...(candidate.target.fieldKey ? [candidate.target.fieldKey] : [])
  ]);
  const candidateCategoryKeys = dedupe([
    ...candidate.relatedCategoryKeys,
    ...(candidate.target.categoryKey ? [candidate.target.categoryKey] : [])
  ]);

  return (
    liveTarget.candidateTargetIds.includes(candidate.target.targetId) ||
    intersects(liveTarget.relatedFieldKeys, candidateFieldKeys) ||
    intersects(liveTarget.relatedCategoryKeys, candidateCategoryKeys) ||
    (liveTarget.branchResolutionRelevant && candidate.branchResolutionRelevant) ||
    (liveTarget.questionTypeHint !== null &&
      liveTarget.questionTypeHint === candidate.questionType)
  );
}

function liveAnalysisCoversCandidates(
  liveAnalysis: LiveVisibleQuestionAnalysis,
  candidates: readonly Pick<
    QuestionCandidate,
    | "target"
    | "relatedFieldKeys"
    | "relatedCategoryKeys"
    | "branchResolutionRelevant"
    | "questionType"
  >[]
) {
  return liveAnalysis.inferredTargets.some((liveTarget) =>
    candidates.some((candidate) => liveTargetMatchesCandidate(liveTarget, candidate))
  );
}

function determineMatchLevel(args: {
  live: LiveVisibleQuestionAnalysis;
  questionSelection: QuestionSelectionResult;
}): StartShadowMatchLevel {
  const selected = args.questionSelection.selectedQuestion;

  if (!selected || !args.live.asksQuestion) {
    return "unavailable";
  }

  if (
    args.live.inferredTargets.some((liveTarget) =>
      liveTarget.candidateTargetIds.includes(selected.target.targetId)
    )
  ) {
    return "exact_target";
  }

  if (
    args.live.inferredTargets.some((liveTarget) =>
      liveTargetMatchesCandidate(liveTarget, selected)
    )
  ) {
    const hiddenCategories = dedupe([
      ...selected.relatedCategoryKeys,
      ...(selected.target.categoryKey ? [selected.target.categoryKey] : [])
    ]);

    return args.live.inferredTargets.some((liveTarget) =>
      intersects(liveTarget.relatedCategoryKeys, hiddenCategories)
    )
      ? "category_match"
      : "related_match";
  }

  return "mismatch";
}

export function detectVisibleRepetitionMismatch(args: {
  live: LiveVisibleQuestionAnalysis;
  questionSelection: QuestionSelectionResult;
  previousTrace?: StartShadowTrace | null;
}) {
  const previousTargets =
    args.previousTrace?.liveQuestionAnalysis.inferredTargets.map(
      (target) => target.primaryTargetId
    ) ?? [];
  const repeatedTargetIds = dedupe(
    args.live.inferredTargets
      .map((target) => target.primaryTargetId)
      .filter(
        (targetId): targetId is string =>
          typeof targetId === "string" && previousTargets.includes(targetId)
      )
  );
  const hiddenTargetId = args.questionSelection.selectedQuestionTarget?.targetId ?? null;
  const hiddenMoved = !!hiddenTargetId && !repeatedTargetIds.includes(hiddenTargetId);
  const flag = repeatedTargetIds.length > 0 && hiddenMoved;

  return {
    flag,
    reason: flag
      ? "The live reply repeated a previously mirrored target while the hidden selector moved to a different target."
      : null,
    relatedTargetIds: repeatedTargetIds,
    notes:
      repeatedTargetIds.length > 0
        ? [`Repeated visible targets: ${repeatedTargetIds.join(", ")}.`]
        : []
  } satisfies ShadowMismatchDetail;
}

export function detectContradictionHandlingMismatch(args: {
  live: LiveVisibleQuestionAnalysis;
  questionSelection: QuestionSelectionResult;
}) {
  const selected = args.questionSelection.selectedQuestion;
  const needsContradictionHandling =
    args.questionSelection.relatedContradictionIds.length > 0 ||
    args.questionSelection.selectedQuestionType === "contradiction_resolution";
  const liveAddressesContradiction = args.live.inferredTargets.some(
    (target) => target.contradictionRelevant
  );
  const flag = needsContradictionHandling && !liveAddressesContradiction;

  return {
    flag,
    reason: flag
      ? "The hidden selector is treating contradiction resolution as important, but the live reply is not targeting contradiction cleanup."
      : null,
    relatedTargetIds: selected ? [selected.target.targetId] : [],
    notes:
      needsContradictionHandling && !liveAddressesContradiction
        ? [
            `Hidden contradiction ids: ${args.questionSelection.relatedContradictionIds.join(", ")}.`
          ]
        : []
  } satisfies ShadowMismatchDetail;
}

export function detectUnknownHandlingMismatch(args: {
  live: LiveVisibleQuestionAnalysis;
  questionSelection: QuestionSelectionResult;
}) {
  const selected = args.questionSelection.selectedQuestion;
  const needsUnknownHandling =
    args.questionSelection.relatedUnknownIds.length > 0 ||
    args.questionSelection.selectedQuestionType === "critical_unknown" ||
    args.questionSelection.selectedQuestionType === "readiness_blocker_resolution";
  const liveAddressesUnknown = args.live.inferredTargets.some(
    (target) => target.unknownRelevant
  );
  const flag =
    needsUnknownHandling &&
    !liveAddressesUnknown &&
    !liveAnalysisCoversCandidates(args.live, selected ? [selected] : []);

  return {
    flag,
    reason: flag
      ? "The hidden selector is targeting unresolved unknowns, but the live reply is not addressing that blocker class."
      : null,
    relatedTargetIds: selected ? [selected.target.targetId] : [],
    notes:
      needsUnknownHandling
        ? [`Hidden unknown ids: ${args.questionSelection.relatedUnknownIds.join(", ")}.`]
        : []
  } satisfies ShadowMismatchDetail;
}

function detectBranchResolutionMismatch(args: {
  live: LiveVisibleQuestionAnalysis;
  questionSelection: QuestionSelectionResult;
  branchState: BranchClassificationResult;
}) {
  const branchResolutionNeeded =
    args.branchState.branchResolutionRequired &&
    args.questionSelection.branchResolutionRelevant;
  const liveAddressesBranchResolution = args.live.inferredTargets.some(
    (target) => target.branchResolutionRelevant
  );
  const flag = branchResolutionNeeded && !liveAddressesBranchResolution;

  return {
    flag,
    reason: flag
      ? "The hidden selector wants to resolve branch ambiguity, but the live reply is not asking a branch-shaping question."
      : null,
    relatedTargetIds:
      args.questionSelection.selectedQuestionTarget?.targetId !== undefined &&
      args.questionSelection.selectedQuestionTarget !== null
        ? [args.questionSelection.selectedQuestionTarget.targetId]
        : [],
    notes: branchResolutionNeeded
      ? [`Current branch ambiguity severity: ${args.branchState.ambiguity.severity}.`]
      : []
  } satisfies ShadowMismatchDetail;
}

function detectReadinessMismatch(args: {
  stage: "roadmap" | "execution";
  live: LiveVisibleQuestionAnalysis;
  questionSelection: QuestionSelectionResult;
}) {
  const candidates =
    args.stage === "roadmap"
      ? args.questionSelection.roadmapBlockingQuestions
      : args.questionSelection.executionBlockingQuestions;
  const gate = args.stage === "roadmap"
    ? args.questionSelection.roadmapGate
    : args.questionSelection.executionGate;
  const flag =
    !gate.canMove &&
    candidates.length > 0 &&
    !liveAnalysisCoversCandidates(args.live, candidates);

  return {
    flag,
    reason: flag
      ? `The live reply is not covering the current ${args.stage} blocker targets that the hidden selector found.`
      : null,
    relatedTargetIds: candidates.map((candidate) => candidate.target.targetId),
    notes: flag ? [...gate.reasons] : []
  } satisfies ShadowMismatchDetail;
}

function detectShallowSequencingMismatch(args: {
  assistantReply: string;
  live: LiveVisibleQuestionAnalysis;
  hidden: HiddenQuestionSelectionSnapshot;
  strategyFramework: CompareLiveAndHiddenQuestionTargetsInput["strategyFramework"];
  visibleStrategist?: StartVisibleStrategistLog | null;
}) {
  const currentPhaseId = args.strategyFramework.progressModel.currentPhaseId;
  const currentPhase =
    args.strategyFramework.phaseProgress[currentPhaseId];
  const missingCurrentPhaseFieldKeys = fieldKeysForTruthKeys(
    currentPhase.missingRequiredTruthKeys
  );
  const hiddenTargetsCurrentPhase =
    missingCurrentPhaseFieldKeys.length > 0 &&
    intersects(hiddenTargetsFieldKeys(args.hidden), missingCurrentPhaseFieldKeys);
  const liveVisibleTopic = args.visibleStrategist?.renderedTopicCategory ?? null;
  const liveLaterStageTopic =
    liveVisibleTopic !== null && LATE_STAGE_VISIBLE_TOPIC_CATEGORIES.has(liveVisibleTopic);
  const liveLaterStageText = liveTextMatchesPatterns(args.assistantReply, args.live, [
    "system",
    "integration",
    "api",
    "budget",
    "timeline",
    "constraint",
    "public",
    "portal",
    "dashboard",
    "admin",
    "mobile"
  ]);
  const flag =
    FOUNDATIONAL_PHASE_ORDER[currentPhaseId] <= FOUNDATIONAL_PHASE_ORDER.goals_outcomes &&
    hiddenTargetsCurrentPhase &&
    (liveLaterStageTopic || liveLaterStageText);

  return {
    flag,
    reason: flag
      ? "The live reply is moving into a later-stage discovery area before the hidden model's current-phase truth is locked."
      : null,
    relatedTargetIds: args.hidden.selectedTargetId ? [args.hidden.selectedTargetId] : [],
    notes: flag
      ? [
          `Current hidden phase: ${currentPhaseId}.`,
          `Missing current-phase truths: ${currentPhase.missingRequiredTruthKeys.join(", ")}.`
        ]
      : []
  } satisfies ShadowMismatchDetail;
}

function detectPrematureHandoffMismatch(args: {
  assistantReply: string;
  strategyFramework: CompareLiveAndHiddenQuestionTargetsInput["strategyFramework"];
}) {
  const handoffMentioned = /(?:workspace|handoff|roadmap|execution|build milestone|open the workspace)/i.test(
    args.assistantReply
  );
  const flag =
    handoffMentioned &&
    (!args.strategyFramework.minimumDataGate.ready ||
      !args.strategyFramework.workspaceHandoffReadiness.ready);

  return {
    flag,
    reason: flag
      ? "The live reply is leaning toward downstream handoff or execution language before the hidden minimum data gate is ready."
      : null,
    relatedTargetIds: [],
    notes: flag
      ? [
          ...args.strategyFramework.minimumDataGate.reasons.slice(0, 3),
          ...args.strategyFramework.workspaceHandoffReadiness.reasons.slice(0, 3)
        ]
      : []
  } satisfies ShadowMismatchDetail;
}

function detectMissingRequiredTruthMismatch(args: {
  live: LiveVisibleQuestionAnalysis;
  hidden: HiddenQuestionSelectionSnapshot;
  strategyFramework: CompareLiveAndHiddenQuestionTargetsInput["strategyFramework"];
}) {
  const currentPhase =
    args.strategyFramework.phaseProgress[
      args.strategyFramework.progressModel.currentPhaseId
    ];
  const missingFieldKeys = fieldKeysForTruthKeys(currentPhase.missingRequiredTruthKeys);
  const hiddenTargetsMissingTruth =
    missingFieldKeys.length > 0 &&
    intersects(hiddenTargetsFieldKeys(args.hidden), missingFieldKeys);
  const liveTargetsMissingTruth =
    missingFieldKeys.length > 0 &&
    intersects(liveTargetsFieldKeys(args.live), missingFieldKeys);
  const flag = hiddenTargetsMissingTruth && !liveTargetsMissingTruth;

  return {
    flag,
    reason: flag
      ? "The hidden selector is targeting a current-phase required truth that the live reply is still skipping."
      : null,
    relatedTargetIds: args.hidden.selectedTargetId ? [args.hidden.selectedTargetId] : [],
    notes: currentPhase.missingRequiredTruthKeys.map(
      (truthKey) => `${FRAMEWORK_TRUTH_DEFINITIONS[truthKey].label} is still missing.`
    )
  } satisfies ShadowMismatchDetail;
}

function detectVagueProductDefinitionMismatch(args: {
  coverageAreas: ShadowComparisonAreaResult[];
  strategyFramework: CompareLiveAndHiddenQuestionTargetsInput["strategyFramework"];
}) {
  const area = args.coverageAreas.find(
    (coverage) => coverage.areaId === "product_definition_specificity"
  );
  const productFamilies =
    args.strategyFramework.productDefinitionBlock.productSpecificityFamilies;
  const flag =
    area?.status === "hidden_stronger" &&
    productFamilies.length === 0;

  return {
    flag,
    reason: flag
      ? "The product definition is still broad, and the hidden selector is narrowing it more aggressively than the live reply."
      : null,
    relatedTargetIds: [],
    notes: flag
      ? [
          "No product-specificity family is locked yet in the hidden strategy framework."
        ]
      : []
  } satisfies ShadowMismatchDetail;
}

function detectWeakNamingCaptureMismatch(args: {
  coverageAreas: ShadowComparisonAreaResult[];
  strategyFramework: CompareLiveAndHiddenQuestionTargetsInput["strategyFramework"];
}) {
  const area = args.coverageAreas.find(
    (coverage) => coverage.areaId === "naming_capture"
  );
  const flag =
    area?.status === "hidden_stronger" &&
    args.strategyFramework.projectNamingBlock.namingStatus !== "named";

  return {
    flag,
    reason: flag
      ? "Naming is still unstable, and the live reply is not capturing or resolving that as well as the hidden selector."
      : null,
    relatedTargetIds: [],
    notes: flag
      ? [
          `Current naming status: ${args.strategyFramework.projectNamingBlock.namingStatus}.`
        ]
      : []
  } satisfies ShadowMismatchDetail;
}

export function summarizeShadowDifferences(
  comparison: ShadowQuestionComparisonResult
) {
  const issues: string[] = [];

  if (comparison.matchesConceptually) {
    issues.push("Hidden question targeting aligns conceptually with the current live reply.");
  } else {
    issues.push("Hidden question targeting diverges from the current live reply.");
  }

  if (comparison.repetitionMismatch.flag) {
    issues.push("The live reply appears to repeat a lower-value target.");
  }

  if (comparison.contradictionHandlingMismatch.flag) {
    issues.push("The live reply is missing contradiction cleanup that the hidden selector would prioritize.");
  }

  if (comparison.unknownHandlingMismatch.flag) {
    issues.push("The live reply is missing unresolved unknown handling that the hidden selector would prioritize.");
  }

  if (comparison.branchResolutionMismatch.flag) {
    issues.push("The live reply is not resolving branch ambiguity that still blocks the hidden model.");
  }

  if (comparison.roadmapBlockingMismatch.flag) {
    issues.push("The live reply is not covering the strongest roadmap blockers.");
  }

  if (comparison.executionBlockingMismatch.flag) {
    issues.push("The live reply is not covering the strongest execution blockers.");
  }

  if (comparison.shallowSequencingMismatch.flag) {
    issues.push("The live reply is sequencing later-stage discovery before stronger foundational truth is locked.");
  }

  if (comparison.prematureHandoffMismatch.flag) {
    issues.push("The live reply is leaning toward handoff or execution language before the hidden minimum data gate is ready.");
  }

  if (comparison.missingRequiredTruthMismatch.flag) {
    issues.push("The live reply is skipping a required current-phase truth that the hidden selector is already prioritizing.");
  }

  if (comparison.vagueProductDefinitionMismatch.flag) {
    issues.push("The hidden selector is doing a stronger job of narrowing an overly broad product definition.");
  }

  if (comparison.weakNamingCaptureMismatch.flag) {
    issues.push("The hidden selector is doing a stronger job of stabilizing naming capture.");
  }

  return issues.join(" ");
}

export function compareLiveAndHiddenQuestionTargets(
  input: CompareLiveAndHiddenQuestionTargetsInput
) {
  const live = createLiveVisibleQuestionAnalysis(input.assistantReply);
  const hidden = createHiddenQuestionSelectionSnapshot(input.questionSelection);
  const matchLevel = determineMatchLevel({
    live,
    questionSelection: input.questionSelection
  });
  const matchesConceptually =
    matchLevel === "exact_target" ||
    matchLevel === "category_match" ||
    matchLevel === "related_match";
  const repetitionMismatch = detectVisibleRepetitionMismatch({
    live,
    questionSelection: input.questionSelection,
    previousTrace: input.previousTrace
  });
  const contradictionHandlingMismatch = detectContradictionHandlingMismatch({
    live,
    questionSelection: input.questionSelection
  });
  const unknownHandlingMismatch = detectUnknownHandlingMismatch({
    live,
    questionSelection: input.questionSelection
  });
  const branchResolutionMismatch = detectBranchResolutionMismatch({
    live,
    questionSelection: input.questionSelection,
    branchState: input.branchState
  });
  const roadmapBlockingMismatch = detectReadinessMismatch({
    stage: "roadmap",
    live,
    questionSelection: input.questionSelection
  });
  const executionBlockingMismatch = detectReadinessMismatch({
    stage: "execution",
    live,
    questionSelection: input.questionSelection
  });
  const coverageAreas = buildCoverageAreas({
    assistantReply: input.assistantReply,
    live,
    hidden,
    strategyFramework: input.strategyFramework,
    visibleStrategist: input.visibleStrategist
  });
  const shallowSequencingMismatch = detectShallowSequencingMismatch({
    assistantReply: input.assistantReply,
    live,
    hidden,
    strategyFramework: input.strategyFramework,
    visibleStrategist: input.visibleStrategist
  });
  const prematureHandoffMismatch = detectPrematureHandoffMismatch({
    assistantReply: input.assistantReply,
    strategyFramework: input.strategyFramework
  });
  const missingRequiredTruthMismatch = detectMissingRequiredTruthMismatch({
    live,
    hidden,
    strategyFramework: input.strategyFramework
  });
  const vagueProductDefinitionMismatch = detectVagueProductDefinitionMismatch({
    coverageAreas,
    strategyFramework: input.strategyFramework
  });
  const weakNamingCaptureMismatch = detectWeakNamingCaptureMismatch({
    coverageAreas,
    strategyFramework: input.strategyFramework
  });
  const hiddenLikelyBetter =
    !!input.questionSelection.selectedQuestion &&
    (!matchesConceptually ||
      contradictionHandlingMismatch.flag ||
      unknownHandlingMismatch.flag ||
      branchResolutionMismatch.flag ||
      roadmapBlockingMismatch.flag ||
      executionBlockingMismatch.flag ||
      shallowSequencingMismatch.flag ||
      prematureHandoffMismatch.flag ||
      missingRequiredTruthMismatch.flag ||
      vagueProductDefinitionMismatch.flag ||
      weakNamingCaptureMismatch.flag ||
      coverageAreas.some((coverage) => coverage.status === "hidden_stronger"));
  const comparison = {
    live,
    hidden,
    matchLevel,
    matchesConceptually,
    summary: "",
    notes: dedupe([
      ...live.notes,
      ...coverageAreas
        .filter((coverage) => coverage.status === "both_weak")
        .map(
          (coverage) =>
            `${coverage.label} is still weak in both the live reply and the hidden selector.`
        ),
      hiddenLikelyBetter
        ? "The hidden selector would likely produce a stronger next-question target than the current live path."
        : "The hidden selector does not currently disagree strongly enough to imply a better visible target."
    ]),
    coverageAreas,
    repetitionMismatch,
    contradictionHandlingMismatch,
    unknownHandlingMismatch,
    branchResolutionMismatch,
    roadmapBlockingMismatch,
    executionBlockingMismatch,
    shallowSequencingMismatch,
    prematureHandoffMismatch,
    missingRequiredTruthMismatch,
    vagueProductDefinitionMismatch,
    weakNamingCaptureMismatch,
    mismatchFlags: {
      conceptualMismatch: !matchesConceptually,
      repetitionMismatch: repetitionMismatch.flag,
      contradictionMiss: contradictionHandlingMismatch.flag,
      unknownHandlingMiss: unknownHandlingMismatch.flag,
      branchResolutionMiss: branchResolutionMismatch.flag,
      roadmapBlockingMiss: roadmapBlockingMismatch.flag,
      executionBlockingMiss: executionBlockingMismatch.flag,
      shallowSequencingMismatch: shallowSequencingMismatch.flag,
      prematureHandoffMismatch: prematureHandoffMismatch.flag,
      missingRequiredTruthMismatch: missingRequiredTruthMismatch.flag,
      vagueProductDefinitionMismatch: vagueProductDefinitionMismatch.flag,
      weakNamingCaptureMismatch: weakNamingCaptureMismatch.flag,
      hiddenLikelyBetter
    }
  } satisfies ShadowQuestionComparisonResult;

  return {
    ...comparison,
    summary: summarizeShadowDifferences(comparison)
  } satisfies ShadowQuestionComparisonResult;
}
