import type { BranchFamily } from "@/lib/governance";
import {
  OVERLAY_DEFINITIONS,
  type NonHybridBranchFamily
} from "@/lib/intelligence/branching";
import {
  EXTRACTION_CATEGORY_DEFINITIONS,
  EXTRACTION_CATEGORY_KEYS,
  EXTRACTION_FIELD_DEFINITIONS,
  EXTRACTION_FIELD_KEYS,
  type ExtractionCategoryKey,
  type ExtractionFieldKey
} from "@/lib/intelligence/extraction";
import type {
  QuestionSelectionType,
  QuestionTargetRegistryEntry
} from "./types";

export const QUESTION_PRIORITY_BASE_SCORES: Record<QuestionSelectionType, number> = {
  contradiction_resolution: 1000,
  critical_unknown: 900,
  readiness_blocker_resolution: 860,
  actor_clarification: 840,
  workflow_clarification: 835,
  mvp_boundary_clarification: 830,
  systems_integration_clarification: 825,
  constraint_clarification: 815,
  partial_truth_narrowing: 760,
  branch_resolution: 720,
  overlay_confirmation: 660,
  assumption_confirmation: 620,
  roadmap_transition_readiness: 520,
  execution_transition_readiness: 500
};

export const QUESTION_STAGE_PRIORITY_BOOSTS = {
  roadmap: 28,
  execution: 36
} as const;

export const FIELD_QUESTION_TYPE_MAP: Record<
  ExtractionFieldKey,
  QuestionSelectionType
> = {
  request_summary: "critical_unknown",
  founder_operator_context: "partial_truth_narrowing",
  project_name_state: "partial_truth_narrowing",
  naming_help_state: "partial_truth_narrowing",
  domain_intent: "partial_truth_narrowing",
  domain_validation_path: "partial_truth_narrowing",
  core_concept: "critical_unknown",
  product_function: "partial_truth_narrowing",
  primary_branch: "branch_resolution",
  product_type: "branch_resolution",
  primary_users: "actor_clarification",
  first_user: "actor_clarification",
  primary_buyers: "actor_clarification",
  primary_admins: "actor_clarification",
  problem_statement: "critical_unknown",
  desired_outcome: "critical_unknown",
  business_goal: "partial_truth_narrowing",
  success_criteria: "partial_truth_narrowing",
  first_use_case: "workflow_clarification",
  core_workflow: "workflow_clarification",
  business_model: "partial_truth_narrowing",
  mvp_in_scope: "mvp_boundary_clarification",
  mvp_out_of_scope: "mvp_boundary_clarification",
  primary_surfaces: "systems_integration_clarification",
  systems_touched: "systems_integration_clarification",
  integrations: "systems_integration_clarification",
  data_dependencies: "systems_integration_clarification",
  constraints: "constraint_clarification",
  budget_constraints: "constraint_clarification",
  timeline_constraints: "constraint_clarification",
  compliance_security_sensitivity: "constraint_clarification",
  ai_usage: "systems_integration_clarification",
  mobile_expectations: "systems_integration_clarification",
  admin_ops_complexity: "systems_integration_clarification",
  brand_direction: "partial_truth_narrowing"
};

const BRANCH_RELEVANT_FIELDS = new Set<ExtractionFieldKey>([
  "founder_operator_context",
  "project_name_state",
  "primary_branch",
  "product_type",
  "product_function",
  "primary_users",
  "first_user",
  "primary_buyers",
  "primary_admins",
  "first_use_case",
  "core_workflow",
  "business_model",
  "request_summary",
  "core_concept"
]);

const OVERLAY_RELEVANT_FIELDS = new Set<ExtractionFieldKey>([
  "domain_intent",
  "domain_validation_path",
  "primary_surfaces",
  "systems_touched",
  "integrations",
  "data_dependencies",
  "constraints",
  "compliance_security_sensitivity",
  "ai_usage",
  "mobile_expectations",
  "admin_ops_complexity",
  "primary_admins",
  "core_workflow",
  "brand_direction"
]);

function fieldCriticality(fieldKey: ExtractionFieldKey) {
  const definition = EXTRACTION_FIELD_DEFINITIONS[fieldKey];

  if (definition.criticalForRoadmap) {
    return "roadmap_critical" as const;
  }

  if (definition.criticalForExecution) {
    return "execution_critical" as const;
  }

  return "supporting" as const;
}

function buildFieldRegistryEntry(fieldKey: ExtractionFieldKey): QuestionTargetRegistryEntry {
  const definition = EXTRACTION_FIELD_DEFINITIONS[fieldKey];

  return {
    targetId: `field:${fieldKey}`,
    label: definition.label,
    kind: "field",
    fieldKeys: [fieldKey],
    categoryKeys: [definition.categoryKey],
    criticality: fieldCriticality(fieldKey),
    branchRelevant: BRANCH_RELEVANT_FIELDS.has(fieldKey),
    overlayRelevant: OVERLAY_RELEVANT_FIELDS.has(fieldKey),
    commonBlockerClass:
      fieldKey === "primary_branch" || fieldKey === "product_type"
        ? "readiness"
        : definition.criticalForRoadmap || definition.criticalForExecution
        ? "missing_truth"
        : "partial_truth",
    escalationPriority:
      definition.criticalForRoadmap || definition.criticalForExecution ? 90 : 48,
    defaultQuestionType: FIELD_QUESTION_TYPE_MAP[fieldKey],
    recoveryTargetIds: [],
    narrowingTargetIds: []
  };
}

function buildCategoryRegistryEntry(
  categoryKey: ExtractionCategoryKey
): QuestionTargetRegistryEntry {
  const definition = EXTRACTION_CATEGORY_DEFINITIONS[categoryKey];
  const fieldKeys = EXTRACTION_FIELD_KEYS.filter(
    (fieldKey) => EXTRACTION_FIELD_DEFINITIONS[fieldKey].categoryKey === categoryKey
  );

  return {
    targetId: `category:${categoryKey}`,
    label: definition.label,
    kind: "category",
    fieldKeys: [...fieldKeys],
    categoryKeys: [categoryKey],
    criticality: definition.criticalForRoadmap
      ? "roadmap_critical"
      : definition.criticalForExecution
      ? "execution_critical"
      : "supporting",
    branchRelevant:
      categoryKey === "branch_product_type" ||
      categoryKey === "actors" ||
      categoryKey === "workflow" ||
      categoryKey === "business_model" ||
      categoryKey === "request_core_concept",
    overlayRelevant:
      categoryKey === "systems_integrations" ||
      categoryKey === "constraints" ||
      categoryKey === "brand_experience_direction",
    commonBlockerClass:
      categoryKey === "contradictions"
        ? "contradiction"
        : categoryKey === "unknowns"
        ? "unknown"
        : categoryKey === "assumptions"
        ? "assumption"
        : "missing_truth",
    escalationPriority: definition.criticalForRoadmap ? 92 : definition.criticalForExecution ? 82 : 40,
    defaultQuestionType:
      categoryKey === "actors"
        ? "actor_clarification"
        : categoryKey === "workflow"
        ? "workflow_clarification"
        : categoryKey === "constraints"
        ? "constraint_clarification"
        : categoryKey === "mvp_boundary"
        ? "mvp_boundary_clarification"
        : categoryKey === "systems_integrations"
        ? "systems_integration_clarification"
        : categoryKey === "branch_product_type"
        ? "branch_resolution"
        : "partial_truth_narrowing",
    recoveryTargetIds: [],
    narrowingTargetIds: []
  };
}

export const FIELD_REGISTRY_ENTRIES = Object.fromEntries(
  EXTRACTION_FIELD_KEYS.map((fieldKey) => [fieldKey, buildFieldRegistryEntry(fieldKey)])
) as Record<ExtractionFieldKey, QuestionTargetRegistryEntry>;

export const CATEGORY_REGISTRY_ENTRIES = Object.fromEntries(
  EXTRACTION_CATEGORY_KEYS.map((categoryKey) => [
    categoryKey,
    buildCategoryRegistryEntry(categoryKey)
  ])
) as Record<ExtractionCategoryKey, QuestionTargetRegistryEntry>;

FIELD_REGISTRY_ENTRIES.primary_branch.recoveryTargetIds = [
  "field:core_concept",
  "field:primary_users",
  "field:core_workflow"
];
FIELD_REGISTRY_ENTRIES.product_type.recoveryTargetIds = [
  "field:core_concept",
  "field:primary_users",
  "field:desired_outcome"
];
FIELD_REGISTRY_ENTRIES.primary_users.recoveryTargetIds = [
  "field:desired_outcome",
  "field:core_workflow",
  "field:primary_buyers"
];
FIELD_REGISTRY_ENTRIES.primary_buyers.recoveryTargetIds = [
  "field:primary_users",
  "field:business_model",
  "field:desired_outcome"
];
FIELD_REGISTRY_ENTRIES.primary_admins.recoveryTargetIds = [
  "field:core_workflow",
  "field:systems_touched",
  "field:constraints"
];
FIELD_REGISTRY_ENTRIES.core_workflow.recoveryTargetIds = [
  "field:desired_outcome",
  "field:primary_users",
  "field:mvp_in_scope"
];
FIELD_REGISTRY_ENTRIES.business_model.recoveryTargetIds = [
  "field:desired_outcome",
  "field:primary_buyers",
  "field:mvp_in_scope"
];
FIELD_REGISTRY_ENTRIES.mvp_in_scope.recoveryTargetIds = [
  "field:desired_outcome",
  "field:mvp_out_of_scope",
  "field:systems_touched"
];
FIELD_REGISTRY_ENTRIES.mvp_out_of_scope.recoveryTargetIds = [
  "field:mvp_in_scope",
  "field:constraints",
  "field:desired_outcome"
];
FIELD_REGISTRY_ENTRIES.systems_touched.recoveryTargetIds = [
  "field:core_workflow",
  "field:integrations",
  "field:data_dependencies"
];
FIELD_REGISTRY_ENTRIES.integrations.recoveryTargetIds = [
  "field:systems_touched",
  "field:data_dependencies",
  "field:core_workflow"
];
FIELD_REGISTRY_ENTRIES.data_dependencies.recoveryTargetIds = [
  "field:systems_touched",
  "field:integrations",
  "field:constraints"
];
FIELD_REGISTRY_ENTRIES.constraints.recoveryTargetIds = [
  "field:timeline_constraints",
  "field:budget_constraints",
  "field:mvp_in_scope"
];
FIELD_REGISTRY_ENTRIES.brand_direction.recoveryTargetIds = [
  "field:primary_buyers",
  "field:desired_outcome",
  "field:core_concept"
];

FIELD_REGISTRY_ENTRIES.request_summary.narrowingTargetIds = [
  "field:core_concept",
  "field:primary_users",
  "field:desired_outcome"
];
FIELD_REGISTRY_ENTRIES.founder_operator_context.recoveryTargetIds = [
  "field:core_concept",
  "field:primary_users",
  "field:desired_outcome"
];
FIELD_REGISTRY_ENTRIES.project_name_state.recoveryTargetIds = [
  "field:core_concept",
  "field:founder_operator_context",
  "field:domain_intent"
];
FIELD_REGISTRY_ENTRIES.naming_help_state.recoveryTargetIds = [
  "field:project_name_state",
  "field:domain_intent",
  "field:core_concept"
];
FIELD_REGISTRY_ENTRIES.domain_intent.recoveryTargetIds = [
  "field:project_name_state",
  "field:domain_validation_path",
  "field:core_concept"
];
FIELD_REGISTRY_ENTRIES.domain_validation_path.recoveryTargetIds = [
  "field:domain_intent",
  "field:project_name_state",
  "field:core_concept"
];
FIELD_REGISTRY_ENTRIES.core_concept.narrowingTargetIds = [
  "field:primary_branch",
  "field:product_type",
  "field:primary_users"
];
FIELD_REGISTRY_ENTRIES.product_function.recoveryTargetIds = [
  "field:core_concept",
  "field:first_use_case",
  "field:primary_users"
];
FIELD_REGISTRY_ENTRIES.primary_branch.narrowingTargetIds = [
  "field:product_type",
  "field:primary_users",
  "field:core_workflow"
];
FIELD_REGISTRY_ENTRIES.product_type.narrowingTargetIds = [
  "field:primary_users",
  "field:business_model",
  "field:core_workflow"
];
FIELD_REGISTRY_ENTRIES.primary_users.narrowingTargetIds = [
  "field:primary_buyers",
  "field:primary_admins",
  "field:desired_outcome"
];
FIELD_REGISTRY_ENTRIES.first_user.recoveryTargetIds = [
  "field:primary_users",
  "field:first_use_case",
  "field:business_goal"
];
FIELD_REGISTRY_ENTRIES.primary_buyers.narrowingTargetIds = [
  "field:primary_users",
  "field:business_model",
  "field:desired_outcome"
];
FIELD_REGISTRY_ENTRIES.primary_admins.narrowingTargetIds = [
  "field:core_workflow",
  "field:systems_touched",
  "field:constraints"
];
FIELD_REGISTRY_ENTRIES.problem_statement.narrowingTargetIds = [
  "field:desired_outcome",
  "field:success_criteria",
  "field:primary_users"
];
FIELD_REGISTRY_ENTRIES.business_goal.recoveryTargetIds = [
  "field:desired_outcome",
  "field:primary_users",
  "field:first_use_case"
];
FIELD_REGISTRY_ENTRIES.desired_outcome.narrowingTargetIds = [
  "field:success_criteria",
  "field:mvp_in_scope",
  "field:primary_users"
];
FIELD_REGISTRY_ENTRIES.first_use_case.recoveryTargetIds = [
  "field:core_workflow",
  "field:primary_users",
  "field:desired_outcome"
];
FIELD_REGISTRY_ENTRIES.core_workflow.narrowingTargetIds = [
  "field:mvp_in_scope",
  "field:systems_touched",
  "field:primary_admins"
];
FIELD_REGISTRY_ENTRIES.business_model.narrowingTargetIds = [
  "field:primary_buyers",
  "field:mvp_in_scope",
  "field:constraints"
];
FIELD_REGISTRY_ENTRIES.mvp_in_scope.narrowingTargetIds = [
  "field:mvp_out_of_scope",
  "field:systems_touched",
  "field:constraints"
];
FIELD_REGISTRY_ENTRIES.mvp_out_of_scope.narrowingTargetIds = [
  "field:mvp_in_scope",
  "field:constraints",
  "field:timeline_constraints"
];
FIELD_REGISTRY_ENTRIES.primary_surfaces.recoveryTargetIds = [
  "field:systems_touched",
  "field:mobile_expectations",
  "field:admin_ops_complexity"
];
FIELD_REGISTRY_ENTRIES.systems_touched.narrowingTargetIds = [
  "field:integrations",
  "field:data_dependencies",
  "field:constraints"
];
FIELD_REGISTRY_ENTRIES.integrations.narrowingTargetIds = [
  "field:data_dependencies",
  "field:systems_touched",
  "field:constraints"
];
FIELD_REGISTRY_ENTRIES.data_dependencies.narrowingTargetIds = [
  "field:integrations",
  "field:systems_touched",
  "field:constraints"
];
FIELD_REGISTRY_ENTRIES.constraints.narrowingTargetIds = [
  "field:budget_constraints",
  "field:timeline_constraints",
  "field:mvp_out_of_scope"
];
FIELD_REGISTRY_ENTRIES.budget_constraints.narrowingTargetIds = [
  "field:timeline_constraints",
  "field:constraints",
  "field:mvp_out_of_scope"
];
FIELD_REGISTRY_ENTRIES.timeline_constraints.narrowingTargetIds = [
  "field:constraints",
  "field:mvp_out_of_scope",
  "field:systems_touched"
];
FIELD_REGISTRY_ENTRIES.compliance_security_sensitivity.recoveryTargetIds = [
  "field:constraints",
  "field:systems_touched",
  "field:admin_ops_complexity"
];
FIELD_REGISTRY_ENTRIES.ai_usage.recoveryTargetIds = [
  "field:product_function",
  "field:data_dependencies",
  "field:systems_touched"
];
FIELD_REGISTRY_ENTRIES.mobile_expectations.recoveryTargetIds = [
  "field:primary_surfaces",
  "field:first_use_case",
  "field:systems_touched"
];
FIELD_REGISTRY_ENTRIES.admin_ops_complexity.recoveryTargetIds = [
  "field:primary_admins",
  "field:primary_surfaces",
  "field:systems_touched"
];
FIELD_REGISTRY_ENTRIES.brand_direction.narrowingTargetIds = [
  "field:primary_buyers",
  "field:primary_users",
  "field:core_concept"
];

FIELD_REGISTRY_ENTRIES.founder_operator_context.narrowingTargetIds = [
  "field:core_concept",
  "field:primary_users",
  "field:desired_outcome"
];
FIELD_REGISTRY_ENTRIES.project_name_state.narrowingTargetIds = [
  "field:naming_help_state",
  "field:domain_intent",
  "field:core_concept"
];
FIELD_REGISTRY_ENTRIES.naming_help_state.narrowingTargetIds = [
  "field:project_name_state",
  "field:domain_intent",
  "field:domain_validation_path"
];
FIELD_REGISTRY_ENTRIES.domain_intent.narrowingTargetIds = [
  "field:domain_validation_path",
  "field:project_name_state",
  "field:core_concept"
];
FIELD_REGISTRY_ENTRIES.domain_validation_path.narrowingTargetIds = [
  "field:domain_intent",
  "field:project_name_state",
  "field:core_concept"
];
FIELD_REGISTRY_ENTRIES.product_function.narrowingTargetIds = [
  "field:primary_branch",
  "field:product_type",
  "field:first_use_case"
];
FIELD_REGISTRY_ENTRIES.first_user.narrowingTargetIds = [
  "field:primary_users",
  "field:business_goal",
  "field:first_use_case"
];
FIELD_REGISTRY_ENTRIES.business_goal.narrowingTargetIds = [
  "field:desired_outcome",
  "field:success_criteria",
  "field:first_use_case"
];
FIELD_REGISTRY_ENTRIES.first_use_case.narrowingTargetIds = [
  "field:core_workflow",
  "field:mvp_in_scope",
  "field:primary_surfaces"
];
FIELD_REGISTRY_ENTRIES.primary_surfaces.narrowingTargetIds = [
  "field:systems_touched",
  "field:mobile_expectations",
  "field:admin_ops_complexity"
];
FIELD_REGISTRY_ENTRIES.compliance_security_sensitivity.narrowingTargetIds = [
  "field:constraints",
  "field:systems_touched",
  "field:admin_ops_complexity"
];
FIELD_REGISTRY_ENTRIES.ai_usage.narrowingTargetIds = [
  "field:data_dependencies",
  "field:systems_touched",
  "field:primary_surfaces"
];
FIELD_REGISTRY_ENTRIES.mobile_expectations.narrowingTargetIds = [
  "field:primary_surfaces",
  "field:first_use_case",
  "field:systems_touched"
];
FIELD_REGISTRY_ENTRIES.admin_ops_complexity.narrowingTargetIds = [
  "field:primary_admins",
  "field:systems_touched",
  "field:constraints"
];

export const STATIC_QUESTION_TARGET_REGISTRY: Record<string, QuestionTargetRegistryEntry> = {
  ...Object.fromEntries(
    Object.values(FIELD_REGISTRY_ENTRIES).map((entry) => [entry.targetId, entry])
  ),
  ...Object.fromEntries(
    Object.values(CATEGORY_REGISTRY_ENTRIES).map((entry) => [entry.targetId, entry])
  ),
  "branch:ambiguity": {
    targetId: "branch:ambiguity",
    label: "Branch ambiguity",
    kind: "branch",
    fieldKeys: [
      "primary_branch",
      "product_type",
      "product_function",
      "primary_users",
      "first_use_case"
    ],
    categoryKeys: ["branch_product_type", "actors", "workflow", "business_model"],
    criticality: "roadmap_critical",
    branchRelevant: true,
    overlayRelevant: false,
    commonBlockerClass: "readiness",
    escalationPriority: 94,
    defaultQuestionType: "branch_resolution",
    recoveryTargetIds: ["field:primary_users", "field:first_use_case", "field:business_model"],
    narrowingTargetIds: ["field:product_type", "field:product_function", "field:first_use_case"]
  },
  "readiness:roadmap": {
    targetId: "readiness:roadmap",
    label: "Roadmap transition readiness",
    kind: "readiness",
    fieldKeys: [],
    categoryKeys: [],
    criticality: "roadmap_critical",
    branchRelevant: true,
    overlayRelevant: false,
    commonBlockerClass: "transition",
    escalationPriority: 55,
    defaultQuestionType: "roadmap_transition_readiness",
    recoveryTargetIds: [],
    narrowingTargetIds: []
  },
  "readiness:execution": {
    targetId: "readiness:execution",
    label: "Execution transition readiness",
    kind: "readiness",
    fieldKeys: [],
    categoryKeys: [],
    criticality: "execution_critical",
    branchRelevant: true,
    overlayRelevant: true,
    commonBlockerClass: "transition",
    escalationPriority: 58,
    defaultQuestionType: "execution_transition_readiness",
    recoveryTargetIds: [],
    narrowingTargetIds: []
  }
};

export const BRANCH_NARROWING_RECIPES: Record<BranchFamily, string[]> = {
  "Commerce / Ecommerce": [
    "field:primary_buyers",
    "field:brand_direction",
    "field:mvp_in_scope",
    "field:systems_touched"
  ],
  "SaaS / Workflow Platform": [
    "field:primary_admins",
    "field:core_workflow",
    "field:success_criteria",
    "field:systems_touched"
  ],
  "Marketplace / Multi-Sided Platform": [
    "field:primary_users",
    "field:primary_admins",
    "field:business_model",
    "field:core_workflow"
  ],
  "Internal Operations / Backoffice Tool": [
    "field:primary_admins",
    "field:core_workflow",
    "field:constraints",
    "field:systems_touched"
  ],
  "Content / Community / Membership": [
    "field:business_model",
    "field:primary_users",
    "field:brand_direction",
    "field:mvp_in_scope"
  ],
  "Booking / Scheduling / Service Delivery": [
    "field:core_workflow",
    "field:primary_admins",
    "field:constraints",
    "field:systems_touched"
  ],
  "Hybrid / Composite System": [
    "branch:ambiguity",
    "field:primary_branch",
    "field:core_workflow",
    "field:business_model"
  ],
  "Developer Platform / API / Infrastructure": [
    "field:core_workflow",
    "field:systems_touched",
    "field:data_dependencies",
    "field:constraints"
  ],
  "Data / Analytics / Intelligence Platform": [
    "field:primary_users",
    "field:desired_outcome",
    "field:data_dependencies",
    "field:systems_touched"
  ]
};

export const SPECIALIZATION_NARROWING_RECIPES: Record<string, string[]> = {
  "apparel-ecommerce": [
    "field:primary_buyers",
    "field:brand_direction",
    "field:mvp_in_scope",
    "field:systems_touched"
  ],
  "marketplace-booking": [
    "field:business_model",
    "field:core_workflow",
    "field:primary_admins",
    "field:constraints"
  ],
  "internal-ops-client-portal": [
    "field:primary_admins",
    "field:primary_users",
    "field:systems_touched",
    "field:constraints"
  ],
  "analytics-saas-ai": [
    "field:primary_users",
    "field:desired_outcome",
    "field:data_dependencies",
    "field:systems_touched"
  ],
  "membership-content-hybrid": [
    "field:business_model",
    "field:primary_users",
    "field:brand_direction",
    "field:mvp_in_scope"
  ]
};

export const TEXT_NARROWING_RECIPES: Array<{
  label: string;
  matchAny: string[];
  preferredTargetIds: string[];
}> = [
  {
    label: "Apparel commerce narrowing",
    matchAny: ["apparel", "fashion", "clothing", "merch"],
    preferredTargetIds: [
      "field:primary_buyers",
      "field:brand_direction",
      "field:mvp_in_scope",
      "field:systems_touched"
    ]
  },
  {
    label: "Crypto analytics narrowing",
    matchAny: ["crypto", "blockchain", "token", "wallet", "onchain"],
    preferredTargetIds: [
      "field:primary_users",
      "field:desired_outcome",
      "field:data_dependencies",
      "field:systems_touched"
    ]
  },
  {
    label: "Booking marketplace narrowing",
    matchAny: ["booking", "appointment", "schedule", "provider", "seller"],
    preferredTargetIds: [
      "field:business_model",
      "field:core_workflow",
      "field:primary_admins",
      "field:constraints"
    ]
  }
];

export const ARCHITECTURE_RELEVANT_OVERLAYS = new Set(
  Object.values(OVERLAY_DEFINITIONS)
    .filter((overlay) => overlay.likelyAffectedSystems.length >= 2)
    .map((overlay) => overlay.key)
);

export function getQuestionRegistryEntry(targetId: string) {
  return STATIC_QUESTION_TARGET_REGISTRY[targetId] ?? null;
}

export function buildFieldTargetId(fieldKey: ExtractionFieldKey) {
  return `field:${fieldKey}`;
}

export function buildCategoryTargetId(categoryKey: ExtractionCategoryKey) {
  return `category:${categoryKey}`;
}
