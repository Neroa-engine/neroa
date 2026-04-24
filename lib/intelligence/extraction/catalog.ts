import type {
  BranchFamily,
  ExtractionCategory as GovernanceExtractionCategory,
  OverlayType
} from "@/lib/governance";

export const EXTRACTION_CATEGORY_KEYS = [
  "request_core_concept",
  "branch_product_type",
  "actors",
  "problem_outcome",
  "workflow",
  "business_model",
  "mvp_boundary",
  "systems_integrations",
  "constraints",
  "brand_experience_direction",
  "assumptions",
  "contradictions",
  "unknowns"
] as const;

export type ExtractionCategoryKey = (typeof EXTRACTION_CATEGORY_KEYS)[number];

export interface ExtractionCategoryDefinition {
  key: ExtractionCategoryKey;
  label: string;
  description: string;
  criticalForRoadmap: boolean;
  criticalForExecution: boolean;
  weight: number;
  governanceMappings: GovernanceExtractionCategory[];
  usesFieldStates: boolean;
}

export const EXTRACTION_CATEGORY_DEFINITIONS: Record<
  ExtractionCategoryKey,
  ExtractionCategoryDefinition
> = {
  request_core_concept: {
    key: "request_core_concept",
    label: "Request / core concept",
    description: "What the user is trying to build or change and how they frame it.",
    criticalForRoadmap: true,
    criticalForExecution: true,
    weight: 1.15,
    governanceMappings: ["Request identity", "Core outcome"],
    usesFieldStates: true
  },
  branch_product_type: {
    key: "branch_product_type",
    label: "Branch / product type",
    description: "Which branch and product type the request belongs to.",
    criticalForRoadmap: true,
    criticalForExecution: true,
    weight: 1.15,
    governanceMappings: ["Primary branch classification"],
    usesFieldStates: true
  },
  actors: {
    key: "actors",
    label: "Actors / users / buyers / admins",
    description: "Who uses, buys, or operates the system first.",
    criticalForRoadmap: true,
    criticalForExecution: true,
    weight: 1.1,
    governanceMappings: ["User / buyer / operator"],
    usesFieldStates: true
  },
  problem_outcome: {
    key: "problem_outcome",
    label: "Problem / outcome",
    description: "What problem is being solved and what result matters first.",
    criticalForRoadmap: true,
    criticalForExecution: true,
    weight: 1.15,
    governanceMappings: ["Core outcome", "Success criteria"],
    usesFieldStates: true
  },
  workflow: {
    key: "workflow",
    label: "Workflow",
    description: "The core workflow or sequence the product must support.",
    criticalForRoadmap: true,
    criticalForExecution: true,
    weight: 1.1,
    governanceMappings: ["Workflow truth"],
    usesFieldStates: true
  },
  business_model: {
    key: "business_model",
    label: "Business model",
    description: "How value is packaged, sold, or sustained.",
    criticalForRoadmap: false,
    criticalForExecution: false,
    weight: 0.95,
    governanceMappings: [],
    usesFieldStates: true
  },
  mvp_boundary: {
    key: "mvp_boundary",
    label: "MVP boundary",
    description: "What is in scope, out of scope, and explicitly deferred.",
    criticalForRoadmap: true,
    criticalForExecution: true,
    weight: 1.15,
    governanceMappings: ["MVP scope"],
    usesFieldStates: true
  },
  systems_integrations: {
    key: "systems_integrations",
    label: "Systems / integrations",
    description: "What systems, integrations, and data dependencies are involved.",
    criticalForRoadmap: true,
    criticalForExecution: true,
    weight: 1.15,
    governanceMappings: ["Systems touched", "Data / integrations"],
    usesFieldStates: true
  },
  constraints: {
    key: "constraints",
    label: "Constraints",
    description: "Budget, time, staffing, compliance, and operational limits.",
    criticalForRoadmap: true,
    criticalForExecution: true,
    weight: 1.1,
    governanceMappings: ["Constraints"],
    usesFieldStates: true
  },
  brand_experience_direction: {
    key: "brand_experience_direction",
    label: "Brand / experience direction",
    description: "How the product should feel or present itself.",
    criticalForRoadmap: false,
    criticalForExecution: false,
    weight: 0.9,
    governanceMappings: [],
    usesFieldStates: true
  },
  assumptions: {
    key: "assumptions",
    label: "Assumptions",
    description: "Inferred truths that must remain traceable and revisitable.",
    criticalForRoadmap: false,
    criticalForExecution: true,
    weight: 0.85,
    governanceMappings: ["Assumptions"],
    usesFieldStates: false
  },
  contradictions: {
    key: "contradictions",
    label: "Contradictions",
    description: "Conflicts that reduce confidence and may block readiness.",
    criticalForRoadmap: true,
    criticalForExecution: true,
    weight: 1.2,
    governanceMappings: [],
    usesFieldStates: false
  },
  unknowns: {
    key: "unknowns",
    label: "Unknowns",
    description: "Unresolved truths that still need targeted follow-up.",
    criticalForRoadmap: true,
    criticalForExecution: true,
    weight: 1,
    governanceMappings: ["Unknowns"],
    usesFieldStates: false
  }
};

export const ROADMAP_MINIMUM_CATEGORY_KEYS: readonly ExtractionCategoryKey[] = [
  "branch_product_type",
  "actors",
  "problem_outcome",
  "mvp_boundary",
  "systems_integrations",
  "constraints"
] as const;

export const EXECUTION_MINIMUM_CATEGORY_KEYS: readonly ExtractionCategoryKey[] = [
  "request_core_concept",
  "branch_product_type",
  "actors",
  "problem_outcome",
  "workflow",
  "mvp_boundary",
  "systems_integrations",
  "constraints"
] as const;

export const EXTRACTION_FIELD_KEYS = [
  "request_summary",
  "founder_operator_context",
  "project_name_state",
  "naming_help_state",
  "domain_intent",
  "domain_validation_path",
  "core_concept",
  "product_function",
  "primary_branch",
  "product_type",
  "primary_users",
  "first_user",
  "primary_buyers",
  "primary_admins",
  "problem_statement",
  "desired_outcome",
  "business_goal",
  "success_criteria",
  "first_use_case",
  "core_workflow",
  "business_model",
  "mvp_in_scope",
  "mvp_out_of_scope",
  "primary_surfaces",
  "systems_touched",
  "integrations",
  "data_dependencies",
  "constraints",
  "budget_constraints",
  "timeline_constraints",
  "compliance_security_sensitivity",
  "ai_usage",
  "mobile_expectations",
  "admin_ops_complexity",
  "brand_direction"
] as const;

export type ExtractionFieldKey = (typeof EXTRACTION_FIELD_KEYS)[number];

export interface ExtractionFieldDefinition {
  key: ExtractionFieldKey;
  categoryKey: ExtractionCategoryKey;
  label: string;
  description: string;
  valueKind: "text" | "list";
  criticalForRoadmap: boolean;
  criticalForExecution: boolean;
}

export const EXTRACTION_FIELD_DEFINITIONS: Record<
  ExtractionFieldKey,
  ExtractionFieldDefinition
> = {
  request_summary: {
    key: "request_summary",
    categoryKey: "request_core_concept",
    label: "Request summary",
    description: "The best current plain-language summary of the request.",
    valueKind: "text",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  founder_operator_context: {
    key: "founder_operator_context",
    categoryKey: "request_core_concept",
    label: "Founder / operator context",
    description:
      "The operator reality, business context, or ownership frame behind the request.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  project_name_state: {
    key: "project_name_state",
    categoryKey: "request_core_concept",
    label: "Project name state",
    description:
      "Whether the project is named, provisional, needs naming help, or is intentionally unnamed.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  naming_help_state: {
    key: "naming_help_state",
    categoryKey: "request_core_concept",
    label: "Naming help state",
    description:
      "Whether naming help is requested and whether it is currently blocking progress.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  domain_intent: {
    key: "domain_intent",
    categoryKey: "request_core_concept",
    label: "Domain intent",
    description:
      "Whether domain work matters now, later, or not at all for the current project.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  domain_validation_path: {
    key: "domain_validation_path",
    categoryKey: "request_core_concept",
    label: "Domain validation path",
    description:
      "How Neroa should validate domain viability, alternatives, or naming fit when needed.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  core_concept: {
    key: "core_concept",
    categoryKey: "request_core_concept",
    label: "Core concept",
    description: "The product or system concept being shaped.",
    valueKind: "text",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  product_function: {
    key: "product_function",
    categoryKey: "request_core_concept",
    label: "Product function",
    description: "A plain-language description of what the product actually does.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  primary_branch: {
    key: "primary_branch",
    categoryKey: "branch_product_type",
    label: "Primary branch",
    description: "The current best branch classification.",
    valueKind: "text",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  product_type: {
    key: "product_type",
    categoryKey: "branch_product_type",
    label: "Product type",
    description: "The concrete product type within the branch.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  primary_users: {
    key: "primary_users",
    categoryKey: "actors",
    label: "Primary users",
    description: "The people using the system first.",
    valueKind: "list",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  first_user: {
    key: "first_user",
    categoryKey: "actors",
    label: "First user",
    description:
      "The first real user Neroa expects to win when it differs from the broader target user.",
    valueKind: "list",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  primary_buyers: {
    key: "primary_buyers",
    categoryKey: "actors",
    label: "Primary buyers",
    description: "The people buying or sponsoring the system first.",
    valueKind: "list",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  primary_admins: {
    key: "primary_admins",
    categoryKey: "actors",
    label: "Primary admins / operators",
    description: "The people operating, administering, or managing the system.",
    valueKind: "list",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  problem_statement: {
    key: "problem_statement",
    categoryKey: "problem_outcome",
    label: "Problem statement",
    description: "The problem Neroa believes needs to be solved.",
    valueKind: "text",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  desired_outcome: {
    key: "desired_outcome",
    categoryKey: "problem_outcome",
    label: "Desired outcome",
    description: "The first outcome that should become true if this works.",
    valueKind: "text",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  business_goal: {
    key: "business_goal",
    categoryKey: "problem_outcome",
    label: "Business goal",
    description: "The first business result the project should produce.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  success_criteria: {
    key: "success_criteria",
    categoryKey: "problem_outcome",
    label: "Success criteria",
    description: "How the first outcome will be recognized.",
    valueKind: "list",
    criticalForRoadmap: false,
    criticalForExecution: true
  },
  first_use_case: {
    key: "first_use_case",
    categoryKey: "workflow",
    label: "First use case",
    description: "The first workflow or job that must work well on day one.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  core_workflow: {
    key: "core_workflow",
    categoryKey: "workflow",
    label: "Core workflow",
    description: "The core user or operator workflow that matters first.",
    valueKind: "text",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  business_model: {
    key: "business_model",
    categoryKey: "business_model",
    label: "Business model",
    description: "How the product creates value or captures value.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  mvp_in_scope: {
    key: "mvp_in_scope",
    categoryKey: "mvp_boundary",
    label: "MVP in scope",
    description: "What belongs in the current phase or MVP.",
    valueKind: "list",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  mvp_out_of_scope: {
    key: "mvp_out_of_scope",
    categoryKey: "mvp_boundary",
    label: "MVP out of scope",
    description: "What should not be included yet.",
    valueKind: "list",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  primary_surfaces: {
    key: "primary_surfaces",
    categoryKey: "systems_integrations",
    label: "Primary surfaces",
    description:
      "The first major surfaces involved, such as web app, dashboard, admin console, portal, or mobile.",
    valueKind: "list",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  systems_touched: {
    key: "systems_touched",
    categoryKey: "systems_integrations",
    label: "Systems touched",
    description: "Which systems or product surfaces the request touches.",
    valueKind: "list",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  integrations: {
    key: "integrations",
    categoryKey: "systems_integrations",
    label: "Integrations",
    description: "Which external or internal integrations matter first.",
    valueKind: "list",
    criticalForRoadmap: false,
    criticalForExecution: true
  },
  data_dependencies: {
    key: "data_dependencies",
    categoryKey: "systems_integrations",
    label: "Data dependencies",
    description: "Data sources, data sinks, or state dependencies the system relies on.",
    valueKind: "list",
    criticalForRoadmap: false,
    criticalForExecution: true
  },
  constraints: {
    key: "constraints",
    categoryKey: "constraints",
    label: "Constraints",
    description: "The best current combined view of the key constraints.",
    valueKind: "list",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  budget_constraints: {
    key: "budget_constraints",
    categoryKey: "constraints",
    label: "Budget constraints",
    description: "Budget-specific limits or guardrails.",
    valueKind: "list",
    criticalForRoadmap: false,
    criticalForExecution: true
  },
  timeline_constraints: {
    key: "timeline_constraints",
    categoryKey: "constraints",
    label: "Timeline constraints",
    description: "Time-specific limits, deadlines, or launch windows.",
    valueKind: "list",
    criticalForRoadmap: false,
    criticalForExecution: true
  },
  compliance_security_sensitivity: {
    key: "compliance_security_sensitivity",
    categoryKey: "constraints",
    label: "Compliance / security sensitivity",
    description:
      "Whether regulated data, security sensitivity, auditability, or privacy materially changes planning.",
    valueKind: "text",
    criticalForRoadmap: true,
    criticalForExecution: true
  },
  ai_usage: {
    key: "ai_usage",
    categoryKey: "systems_integrations",
    label: "AI usage",
    description:
      "Whether AI is core to the value proposition, internal tooling, or an optional enhancement.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  mobile_expectations: {
    key: "mobile_expectations",
    categoryKey: "systems_integrations",
    label: "Mobile / device expectations",
    description:
      "Whether mobile or device-specific support is required now, later, or only as future readiness.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  admin_ops_complexity: {
    key: "admin_ops_complexity",
    categoryKey: "systems_integrations",
    label: "Admin / ops complexity",
    description:
      "How much back-office, moderation, reporting, or operational control the product needs.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  },
  brand_direction: {
    key: "brand_direction",
    categoryKey: "brand_experience_direction",
    label: "Brand / experience direction",
    description: "The intended tone, aesthetic, or brand direction.",
    valueKind: "text",
    criticalForRoadmap: false,
    criticalForExecution: false
  }
};

export const OVERLAY_REFERENCE_DEFAULTS: readonly OverlayType[] = [
  "automation-ai",
  "commerce",
  "multi-tenant-collaboration",
  "content-community",
  "admin-backoffice",
  "browser-live-view",
  "data-intelligence"
] as const;

export const BRANCH_FAMILY_LOOKUP = new Set<BranchFamily>([
  "Commerce / Ecommerce",
  "SaaS / Workflow Platform",
  "Marketplace / Multi-Sided Platform",
  "Internal Operations / Backoffice Tool",
  "Content / Community / Membership",
  "Booking / Scheduling / Service Delivery",
  "Hybrid / Composite System",
  "Developer Platform / API / Infrastructure",
  "Data / Analytics / Intelligence Platform"
]);

export function getCategoryFields(categoryKey: ExtractionCategoryKey) {
  return (Object.values(EXTRACTION_FIELD_DEFINITIONS) as ExtractionFieldDefinition[]).filter(
    (definition) => definition.categoryKey === categoryKey
  );
}

export function getCriticalFieldKeysForCategory(
  categoryKey: ExtractionCategoryKey,
  stage: "roadmap" | "execution"
) {
  return getCategoryFields(categoryKey)
    .filter((definition) =>
      stage === "roadmap"
        ? definition.criticalForRoadmap
        : definition.criticalForExecution
    )
    .map((definition) => definition.key);
}
