import type { FieldStatus } from "@/lib/governance";
import type { ExtractionFieldKey, ExtractionState } from "@/lib/intelligence/extraction";

export const FRAMEWORK_REQUIREMENT_CLASSES = [
  "universal_required",
  "conditional_required",
  "optional_enrichment",
  "derived_required"
] as const;

export type FrameworkRequirementClass =
  (typeof FRAMEWORK_REQUIREMENT_CLASSES)[number];

export const FRAMEWORK_TRUTH_KEYS = [
  "founder_operator_context",
  "project_name_state",
  "naming_help_state",
  "domain_intent",
  "domain_validation_path",
  "product_type",
  "product_function",
  "target_user",
  "first_user",
  "first_use_case",
  "business_goal",
  "primary_surfaces",
  "key_systems_integrations",
  "constraints",
  "monetization",
  "compliance_security_sensitivity",
  "ai_usage",
  "data_structure_assumptions",
  "mobile_expectations",
  "admin_ops_complexity",
  "roadmap_clarity_level",
  "confidence_level",
  "unresolved_questions"
] as const;

export type FrameworkTruthKey = (typeof FRAMEWORK_TRUTH_KEYS)[number];

export const FRAMEWORK_ROADMAP_CLARITY_LEVELS = [
  "low",
  "emerging",
  "workable",
  "strong"
] as const;

export type FrameworkRoadmapClarityLevel =
  (typeof FRAMEWORK_ROADMAP_CLARITY_LEVELS)[number];

export const FRAMEWORK_CONFIDENCE_LEVELS = [
  "still_in_extraction",
  "ready_for_roadmap_drafting",
  "ready_for_handoff",
  "not_safe_to_proceed"
] as const;

export type FrameworkConfidenceLevel =
  (typeof FRAMEWORK_CONFIDENCE_LEVELS)[number];

export type FrameworkTruthStatus = FieldStatus | "derived";

export interface FrameworkTruthDefinition {
  key: FrameworkTruthKey;
  label: string;
  requirementClass: FrameworkRequirementClass;
  description: string;
  fieldKeys: ExtractionFieldKey[];
}

export interface FrameworkTruthEvaluation {
  key: FrameworkTruthKey;
  label: string;
  requirementClass: FrameworkRequirementClass;
  triggered: boolean;
  fieldKeys: ExtractionFieldKey[];
  status: FrameworkTruthStatus;
  present: boolean;
  explicitDeferred: boolean;
  confidenceScore: number;
  summary: string | null;
  missingReasons: string[];
}

const STATUS_RANK: Record<FieldStatus, number> = {
  unanswered: 0,
  conflicting: 1,
  partial: 2,
  inferred: 3,
  answered: 4,
  validated: 5
};

const DEFERRED_PATTERNS = [
  "later",
  "not now",
  "defer",
  "future phase",
  "intentionally deferred",
  "not needed",
  "not at all"
] as const;

const RAW_UNIVERSAL_TRUTH_KEYS: readonly FrameworkTruthKey[] = [
  "founder_operator_context",
  "project_name_state",
  "product_type",
  "product_function",
  "target_user",
  "first_use_case",
  "business_goal",
  "primary_surfaces",
  "constraints",
  "compliance_security_sensitivity"
] as const;

export const FRAMEWORK_TRUTH_DEFINITIONS: Record<
  FrameworkTruthKey,
  FrameworkTruthDefinition
> = {
  founder_operator_context: {
    key: "founder_operator_context",
    label: "Founder / operator context",
    requirementClass: "universal_required",
    description:
      "Who is driving the project and what operator reality shapes the build.",
    fieldKeys: ["founder_operator_context"]
  },
  project_name_state: {
    key: "project_name_state",
    label: "Project name state",
    requirementClass: "universal_required",
    description:
      "Whether the project is named, provisional, needs naming help, or intentionally unnamed.",
    fieldKeys: ["project_name_state"]
  },
  naming_help_state: {
    key: "naming_help_state",
    label: "Naming help state",
    requirementClass: "conditional_required",
    description:
      "Whether naming help is requested and whether naming is blocking launch identity.",
    fieldKeys: ["naming_help_state", "project_name_state"]
  },
  domain_intent: {
    key: "domain_intent",
    label: "Domain intent",
    requirementClass: "conditional_required",
    description:
      "Whether domain work matters now, later, or not at all for the current project.",
    fieldKeys: ["domain_intent", "project_name_state"]
  },
  domain_validation_path: {
    key: "domain_validation_path",
    label: "Domain validation path",
    requirementClass: "conditional_required",
    description:
      "Whether Neroa should validate domain viability, alternatives, or naming fit.",
    fieldKeys: ["domain_validation_path", "domain_intent"]
  },
  product_type: {
    key: "product_type",
    label: "Product type",
    requirementClass: "universal_required",
    description: "The stable product type Neroa is planning for.",
    fieldKeys: ["product_type", "primary_branch"]
  },
  product_function: {
    key: "product_function",
    label: "Product function",
    requirementClass: "universal_required",
    description: "What the product actually does in plain language.",
    fieldKeys: ["product_function", "core_concept", "request_summary"]
  },
  target_user: {
    key: "target_user",
    label: "Target user",
    requirementClass: "universal_required",
    description: "The primary user class the product is meant to serve.",
    fieldKeys: ["primary_users"]
  },
  first_user: {
    key: "first_user",
    label: "First user",
    requirementClass: "conditional_required",
    description:
      "The first real user Neroa expects to win, especially if different from the broader target user.",
    fieldKeys: ["first_user", "primary_users"]
  },
  first_use_case: {
    key: "first_use_case",
    label: "First use case",
    requirementClass: "universal_required",
    description: "The first workflow or job that must work well on day one.",
    fieldKeys: ["first_use_case", "core_workflow", "mvp_in_scope"]
  },
  business_goal: {
    key: "business_goal",
    label: "Business goal",
    requirementClass: "universal_required",
    description: "The first business result that matters for the project.",
    fieldKeys: ["business_goal", "desired_outcome", "problem_statement"]
  },
  primary_surfaces: {
    key: "primary_surfaces",
    label: "Primary surfaces",
    requirementClass: "universal_required",
    description:
      "The first major surfaces involved, such as web app, dashboard, admin console, portal, or mobile.",
    fieldKeys: ["primary_surfaces", "systems_touched"]
  },
  key_systems_integrations: {
    key: "key_systems_integrations",
    label: "Key systems / integrations",
    requirementClass: "conditional_required",
    description:
      "The external systems, internal systems, or integrations the first workflow depends on.",
    fieldKeys: ["systems_touched", "integrations", "data_dependencies"]
  },
  constraints: {
    key: "constraints",
    label: "Constraints",
    requirementClass: "universal_required",
    description: "Budget, timeline, staffing, launch, and operational reality.",
    fieldKeys: ["constraints", "budget_constraints", "timeline_constraints"]
  },
  monetization: {
    key: "monetization",
    label: "Monetization",
    requirementClass: "conditional_required",
    description:
      "How the product makes money when revenue logic materially shapes the MVP or recommendation.",
    fieldKeys: ["business_model"]
  },
  compliance_security_sensitivity: {
    key: "compliance_security_sensitivity",
    label: "Compliance / security sensitivity",
    requirementClass: "universal_required",
    description:
      "Whether regulated data, permissions, privacy, auditability, or security sensitivity materially changes planning.",
    fieldKeys: ["compliance_security_sensitivity", "constraints"]
  },
  ai_usage: {
    key: "ai_usage",
    label: "AI usage",
    requirementClass: "conditional_required",
    description:
      "Whether AI is core to the product, internal tooling, or only an optional enhancement.",
    fieldKeys: ["ai_usage"]
  },
  data_structure_assumptions: {
    key: "data_structure_assumptions",
    label: "Data structure / data source assumptions",
    requirementClass: "conditional_required",
    description:
      "What data exists, where it comes from, and what structure the product assumes.",
    fieldKeys: ["data_dependencies"]
  },
  mobile_expectations: {
    key: "mobile_expectations",
    label: "Mobile / device expectations",
    requirementClass: "conditional_required",
    description:
      "Whether mobile support is required now, later, or only as future readiness.",
    fieldKeys: ["mobile_expectations", "primary_surfaces"]
  },
  admin_ops_complexity: {
    key: "admin_ops_complexity",
    label: "Admin / ops complexity",
    requirementClass: "conditional_required",
    description:
      "How much back-office, moderation, reporting, or operational control the product needs.",
    fieldKeys: ["admin_ops_complexity", "primary_admins"]
  },
  roadmap_clarity_level: {
    key: "roadmap_clarity_level",
    label: "Roadmap clarity level",
    requirementClass: "derived_required",
    description:
      "Derived hidden signal describing whether roadmap clarity is low, emerging, workable, or strong.",
    fieldKeys: []
  },
  confidence_level: {
    key: "confidence_level",
    label: "Confidence level",
    requirementClass: "derived_required",
    description:
      "Derived hidden signal describing whether the project is still in extraction, ready for roadmap drafting, ready for handoff, or not safe to proceed.",
    fieldKeys: []
  },
  unresolved_questions: {
    key: "unresolved_questions",
    label: "Unresolved questions",
    requirementClass: "derived_required",
    description:
      "Derived register of unknowns, assumptions, contradictions, and deferred decisions still attached to the project record.",
    fieldKeys: []
  }
};

export const FRAMEWORK_TERMINOLOGY_NORMALIZATION = {
  target_user: ["primary_users"],
  first_use_case: ["first_use_case", "core_workflow"],
  business_goal: ["business_goal", "desired_outcome"],
  key_systems_integrations: ["systems_touched", "integrations"],
  monetization: ["business_model"],
  data_structure_assumptions: ["data_dependencies"]
} as const;

export const FRAMEWORK_FIELD_TO_TRUTH_KEYS = Object.values(
  FRAMEWORK_TRUTH_DEFINITIONS
).reduce(
  (record, definition) => {
    for (const fieldKey of definition.fieldKeys) {
      const current = record[fieldKey] ?? [];
      record[fieldKey] = [...current, definition.key];
    }

    return record;
  },
  {} as Partial<Record<ExtractionFieldKey, FrameworkTruthKey[]>>
);

function fieldPresent(status: FieldStatus) {
  return status === "partial" || status === "answered" || status === "inferred" || status === "validated";
}

function chooseBestStatus(statuses: FieldStatus[]) {
  if (statuses.length === 0) {
    return "unanswered" as FieldStatus;
  }

  return [...statuses].sort((left, right) => STATUS_RANK[right] - STATUS_RANK[left])[0];
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

function firstNonEmptySummary(state: ExtractionState, fieldKeys: readonly ExtractionFieldKey[]) {
  return (
    fieldKeys
      .map((fieldKey) => state.fields[fieldKey].value?.summary?.trim() ?? "")
      .find((summary) => summary.length > 0) ?? null
  );
}

function mergedListSummary(state: ExtractionState, fieldKeys: readonly ExtractionFieldKey[]) {
  const summaries = fieldKeys
    .flatMap((fieldKey) => {
      const value = state.fields[fieldKey].value;

      if (!value) {
        return [];
      }

      return value.kind === "list" ? value.items : [value.summary];
    })
    .map((item) => item.trim())
    .filter(Boolean);

  return summaries.length > 0 ? dedupe(summaries).join(", ") : null;
}

function summaryIncludes(summary: string | null, keywords: readonly string[]) {
  if (!summary) {
    return false;
  }

  const normalized = summary.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function overlayActive(state: ExtractionState, overlayType: keyof ExtractionState["overlayActivations"]) {
  const overlay = state.overlayActivations[overlayType];
  return overlay?.determination === "active";
}

function branchNeedsMonetization(state: ExtractionState) {
  const branch = state.branchClassification.primaryBranch;

  return (
    branch === "Commerce / Ecommerce" ||
    branch === "SaaS / Workflow Platform" ||
    branch === "Marketplace / Multi-Sided Platform" ||
    branch === "Booking / Scheduling / Service Delivery" ||
    branch === "Content / Community / Membership"
  );
}

export function isConditionalFrameworkTruthTriggered(
  state: ExtractionState,
  truthKey: FrameworkTruthKey
) {
  switch (truthKey) {
    case "naming_help_state":
      return summaryIncludes(firstNonEmptySummary(state, ["project_name_state"]), [
        "needs naming help",
        "naming help"
      ]);
    case "domain_intent":
      return (
        fieldPresent(state.fields.project_name_state.status) ||
        fieldPresent(state.fields.domain_intent.status) ||
        fieldPresent(state.fields.domain_validation_path.status)
      );
    case "domain_validation_path":
      return (
        fieldPresent(state.fields.domain_validation_path.status) ||
        summaryIncludes(firstNonEmptySummary(state, ["domain_intent"]), [
          "now",
          "validate",
          "launch",
          "domain matters"
        ])
      );
    case "first_user":
      return (
        fieldPresent(state.fields.first_user.status) ||
        (state.fields.primary_users.value?.kind === "list" &&
          state.fields.primary_users.value.items.length > 1)
      );
    case "key_systems_integrations":
      return (
        fieldPresent(state.fields.systems_touched.status) ||
        fieldPresent(state.fields.integrations.status) ||
        fieldPresent(state.fields.data_dependencies.status) ||
        ["Marketplace / Multi-Sided Platform", "Booking / Scheduling / Service Delivery", "Developer Platform / API / Infrastructure", "Data / Analytics / Intelligence Platform"].includes(
          state.branchClassification.primaryBranch ?? ""
        )
      );
    case "monetization":
      return fieldPresent(state.fields.business_model.status) || branchNeedsMonetization(state);
    case "ai_usage":
      return fieldPresent(state.fields.ai_usage.status) || overlayActive(state, "automation-ai");
    case "data_structure_assumptions":
      return (
        fieldPresent(state.fields.data_dependencies.status) ||
        ["Developer Platform / API / Infrastructure", "Data / Analytics / Intelligence Platform", "Marketplace / Multi-Sided Platform"].includes(
          state.branchClassification.primaryBranch ?? ""
        )
      );
    case "mobile_expectations":
      return (
        fieldPresent(state.fields.mobile_expectations.status) ||
        summaryIncludes(firstNonEmptySummary(state, ["primary_surfaces"]), ["mobile", "ios", "android"]) ||
        overlayActive(state, "browser-live-view")
      );
    case "admin_ops_complexity":
      return (
        fieldPresent(state.fields.admin_ops_complexity.status) ||
        fieldPresent(state.fields.primary_admins.status) ||
        overlayActive(state, "admin-backoffice")
      );
    default:
      return false;
  }
}

export function isFrameworkTruthExplicitlyDeferred(
  state: ExtractionState,
  truthKey: FrameworkTruthKey
) {
  const definition = FRAMEWORK_TRUTH_DEFINITIONS[truthKey];
  const summary =
    truthKey === "key_systems_integrations"
      ? mergedListSummary(state, definition.fieldKeys)
      : firstNonEmptySummary(state, definition.fieldKeys);

  return summaryIncludes(summary, DEFERRED_PATTERNS);
}

export function deriveFrameworkRoadmapClarityLevel(
  state: ExtractionState
): FrameworkRoadmapClarityLevel {
  const presentCount = RAW_UNIVERSAL_TRUTH_KEYS.filter((truthKey) =>
    evaluateFrameworkTruth(state, truthKey).present
  ).length;
  const blockerCount =
    state.contradictions.filter((contradiction) => contradiction.status === "open").length +
    state.unknowns.filter((unknown) => !unknown.resolved).length;
  const ratio = presentCount / RAW_UNIVERSAL_TRUTH_KEYS.length;

  if (blockerCount >= 4 || ratio < 0.35) {
    return "low";
  }

  if (blockerCount >= 2 || ratio < 0.6) {
    return "emerging";
  }

  if (blockerCount >= 1 || ratio < 0.82) {
    return "workable";
  }

  return "strong";
}

export function deriveFrameworkConfidenceLevel(
  state: ExtractionState
): FrameworkConfidenceLevel {
  const hasOpenCriticalContradiction = state.contradictions.some(
    (contradiction) =>
      contradiction.status === "open" &&
      (contradiction.severity === "critical" || contradiction.severity === "high")
  );

  if (hasOpenCriticalContradiction || state.executionReadiness.state === "blocked") {
    return "not_safe_to_proceed";
  }

  if (state.executionReadiness.ready) {
    return "ready_for_handoff";
  }

  if (state.roadmapReadiness.ready) {
    return "ready_for_roadmap_drafting";
  }

  return "still_in_extraction";
}

export function buildFrameworkUnresolvedQuestionRegister(state: ExtractionState) {
  return {
    unknownQuestions: state.unknowns
      .filter((unknown) => !unknown.resolved)
      .map((unknown) => unknown.question),
    openAssumptions: state.assumptions
      .filter((assumption) => assumption.status === "open")
      .map((assumption) => assumption.statement),
    openContradictions: state.contradictions
      .filter((contradiction) => contradiction.status === "open")
      .map((contradiction) => contradiction.title)
  };
}

function derivedSummaryForTruth(state: ExtractionState, truthKey: FrameworkTruthKey) {
  if (truthKey === "roadmap_clarity_level") {
    return deriveFrameworkRoadmapClarityLevel(state);
  }

  if (truthKey === "confidence_level") {
    return deriveFrameworkConfidenceLevel(state).replaceAll("_", " ");
  }

  if (truthKey === "unresolved_questions") {
    const unresolved = buildFrameworkUnresolvedQuestionRegister(state);
    const total =
      unresolved.unknownQuestions.length +
      unresolved.openAssumptions.length +
      unresolved.openContradictions.length;

    return total > 0
      ? `${total} unresolved items remain attached to the hidden planning record.`
      : "No unresolved hidden questions are currently attached to the planning record.";
  }

  return null;
}

function derivedConfidenceForTruth(state: ExtractionState, truthKey: FrameworkTruthKey) {
  if (truthKey === "roadmap_clarity_level") {
    const clarity = deriveFrameworkRoadmapClarityLevel(state);
    return clarity === "strong"
      ? 0.92
      : clarity === "workable"
      ? 0.78
      : clarity === "emerging"
      ? 0.58
      : 0.34;
  }

  if (truthKey === "confidence_level") {
    const level = deriveFrameworkConfidenceLevel(state);
    return level === "ready_for_handoff"
      ? 0.92
      : level === "ready_for_roadmap_drafting"
      ? 0.78
      : level === "still_in_extraction"
      ? 0.52
      : 0.24;
  }

  const unresolved = buildFrameworkUnresolvedQuestionRegister(state);
  const total =
    unresolved.unknownQuestions.length +
    unresolved.openAssumptions.length +
    unresolved.openContradictions.length;

  return total === 0 ? 0.92 : Math.max(0.2, 0.86 - total * 0.08);
}

function summaryForTruth(state: ExtractionState, truthKey: FrameworkTruthKey) {
  const definition = FRAMEWORK_TRUTH_DEFINITIONS[truthKey];

  switch (truthKey) {
    case "target_user":
      return mergedListSummary(state, definition.fieldKeys);
    case "first_user":
      return mergedListSummary(state, definition.fieldKeys);
    case "primary_surfaces":
      return mergedListSummary(state, definition.fieldKeys);
    case "key_systems_integrations":
      return mergedListSummary(state, definition.fieldKeys);
    case "constraints":
      return mergedListSummary(state, definition.fieldKeys);
    case "data_structure_assumptions":
      return mergedListSummary(state, definition.fieldKeys);
    case "roadmap_clarity_level":
    case "confidence_level":
    case "unresolved_questions":
      return derivedSummaryForTruth(state, truthKey);
    default:
      return firstNonEmptySummary(state, definition.fieldKeys);
  }
}

function confidenceForTruth(state: ExtractionState, truthKey: FrameworkTruthKey) {
  if (
    truthKey === "roadmap_clarity_level" ||
    truthKey === "confidence_level" ||
    truthKey === "unresolved_questions"
  ) {
    return derivedConfidenceForTruth(state, truthKey);
  }

  const definition = FRAMEWORK_TRUTH_DEFINITIONS[truthKey];
  const scores = definition.fieldKeys
    .map((fieldKey) => state.fields[fieldKey].confidence.score)
    .filter((score) => Number.isFinite(score));

  return average(scores);
}

export function evaluateFrameworkTruth(
  state: ExtractionState,
  truthKey: FrameworkTruthKey
): FrameworkTruthEvaluation {
  const definition = FRAMEWORK_TRUTH_DEFINITIONS[truthKey];
  const triggered =
    definition.requirementClass !== "conditional_required" ||
    isConditionalFrameworkTruthTriggered(state, truthKey);
  const explicitDeferred = isFrameworkTruthExplicitlyDeferred(state, truthKey);

  if (definition.requirementClass === "derived_required") {
    return {
      key: truthKey,
      label: definition.label,
      requirementClass: definition.requirementClass,
      triggered: true,
      fieldKeys: [],
      status: "derived",
      present: true,
      explicitDeferred: false,
      confidenceScore: derivedConfidenceForTruth(state, truthKey),
      summary: derivedSummaryForTruth(state, truthKey),
      missingReasons: []
    };
  }

  const statuses = definition.fieldKeys.map((fieldKey) => state.fields[fieldKey].status);
  const bestStatus = chooseBestStatus(statuses);
  const present = definition.fieldKeys.some((fieldKey) => fieldPresent(state.fields[fieldKey].status));
  const summary = summaryForTruth(state, truthKey);
  const missingReasons: string[] = [];

  if (triggered && !present && !explicitDeferred) {
    missingReasons.push(`${definition.label} is still missing from the hidden planning record.`);
  }

  if (triggered && bestStatus === "conflicting") {
    missingReasons.push(`${definition.label} is currently conflicting and cannot be trusted yet.`);
  }

  return {
    key: truthKey,
    label: definition.label,
    requirementClass: definition.requirementClass,
    triggered,
    fieldKeys: definition.fieldKeys,
    status: bestStatus,
    present,
    explicitDeferred,
    confidenceScore: confidenceForTruth(state, truthKey),
    summary,
    missingReasons
  };
}

export function evaluateFrameworkTruths(state: ExtractionState) {
  return Object.fromEntries(
    FRAMEWORK_TRUTH_KEYS.map((truthKey) => [truthKey, evaluateFrameworkTruth(state, truthKey)])
  ) as Record<FrameworkTruthKey, FrameworkTruthEvaluation>;
}

export function getFrameworkTruthKeysByRequirementClass(
  requirementClass: FrameworkRequirementClass
) {
  return FRAMEWORK_TRUTH_KEYS.filter(
    (truthKey) =>
      FRAMEWORK_TRUTH_DEFINITIONS[truthKey].requirementClass === requirementClass
  );
}

