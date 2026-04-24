import type { FrameworkTruthKey } from "@/lib/intelligence/contracts";
import type {
  StrategyBranchId,
  StrategyBranchDefinition,
  StrategyCapabilityDefinition,
  StrategyOverlayId,
  StrategyOverlayDefinition,
  StrategyPhaseDefinition,
  StrategyPhaseExitCriterion,
  StrategyPhaseId,
  StrategyProductSpecificityFamilyDefinition,
  StrategyResearchIntentId,
  StrategyResearchIntentDefinition
} from "./types";

function criterion(
  criterionId: string,
  label: string,
  description: string,
  truthKeys: FrameworkTruthKey[],
  blocking = true
): StrategyPhaseExitCriterion {
  return {
    criterionId,
    label,
    description,
    truthKeys,
    blocking
  };
}

function phase(args: StrategyPhaseDefinition): StrategyPhaseDefinition {
  return args;
}

export const STRATEGY_PHASE_DEFINITIONS: Record<
  StrategyPhaseId,
  StrategyPhaseDefinition
> = {
  identity: phase({
    phaseId: "identity",
    order: 1,
    label: "Identity",
    description:
      "Capture who is driving the project and whether a working project identity already exists.",
    requiredTruthKeys: ["founder_operator_context", "project_name_state"],
    optionalTruthKeys: ["naming_help_state"],
    branchTriggerIds: ["existing_name_capture", "naming_help_requested", "naming_deferred"],
    overlayIds: [],
    exitCriteria: [
      criterion(
        "identity:operator_context",
        "Founder / operator context captured",
        "The hidden system knows who is driving the project or what operator reality frames the build.",
        ["founder_operator_context"]
      ),
      criterion(
        "identity:project_name_state",
        "Project name state is explicit",
        "The project is named, provisional, needs naming help, or is intentionally unnamed.",
        ["project_name_state"]
      )
    ],
    nextPhaseId: "naming"
  }),
  naming: phase({
    phaseId: "naming",
    order: 2,
    label: "Naming",
    description:
      "Handle existing name capture, working-name support, naming-help paths, and optional domain or brandability intent.",
    requiredTruthKeys: ["project_name_state"],
    optionalTruthKeys: ["naming_help_state", "domain_intent", "domain_validation_path"],
    branchTriggerIds: [
      "existing_name_capture",
      "naming_help_requested",
      "naming_deferred",
      "domain_validation_intent"
    ],
    overlayIds: ["brandability", "domain_intent"],
    exitCriteria: [
      criterion(
        "naming:naming_state",
        "Naming path is explicit",
        "The hidden record knows whether the project is named, provisional, needs help, or is intentionally unnamed for now.",
        ["project_name_state"]
      ),
      criterion(
        "naming:help_or_defer_path",
        "Naming help or deferral path is attached",
        "If naming is unresolved, the hidden system records whether help is wanted now or intentionally deferred.",
        ["project_name_state", "naming_help_state"],
        false
      )
    ],
    nextPhaseId: "core_idea"
  }),
  core_idea: phase({
    phaseId: "core_idea",
    order: 3,
    label: "Core Idea",
    description:
      "Narrow the founder's general direction into a stable first product idea, including explicit 'I don't know' ideation paths.",
    requiredTruthKeys: ["product_function"],
    optionalTruthKeys: ["product_type", "business_goal"],
    branchTriggerIds: ["ideation_support", "industry_exploration", "problem_discovery"],
    overlayIds: [],
    exitCriteria: [
      criterion(
        "core_idea:product_function",
        "Core product direction exists",
        "The hidden system has a first plain-language read of what the product should do.",
        ["product_function"]
      )
    ],
    nextPhaseId: "product_definition"
  }),
  product_definition: phase({
    phaseId: "product_definition",
    order: 4,
    label: "Product Definition",
    description:
      "Force broad categories into a sharper product type so Neroa can stop planning against vague labels.",
    requiredTruthKeys: ["product_type", "product_function"],
    optionalTruthKeys: ["first_use_case", "business_goal"],
    branchTriggerIds: ["product_type_narrowing"],
    overlayIds: ["market_crowding"],
    exitCriteria: [
      criterion(
        "product_definition:product_type",
        "Product type is stable",
        "The hidden record can distinguish broad categories such as marketplace, SaaS, internal ops, analytics, commerce, or similar shapes.",
        ["product_type"]
      ),
      criterion(
        "product_definition:product_function",
        "Broad concept has a stable function",
        "The product is no longer just 'an app' or 'a marketplace' and has a specific functional direction.",
        ["product_function"]
      )
    ],
    nextPhaseId: "function"
  }),
  function: phase({
    phaseId: "function",
    order: 5,
    label: "Function",
    description:
      "Extract the actions, jobs, and first capabilities the product must perform.",
    requiredTruthKeys: ["product_function", "first_use_case"],
    optionalTruthKeys: ["ai_usage", "data_structure_assumptions", "primary_surfaces"],
    branchTriggerIds: [
      "function_capability_narrowing",
      "ai_usage_clarification",
      "data_structure_clarification"
    ],
    overlayIds: ["ai_usage", "data_structure"],
    exitCriteria: [
      criterion(
        "function:first_use_case",
        "First use case is explicit",
        "The hidden record knows the first moment or workflow that must work on day one.",
        ["first_use_case"]
      ),
      criterion(
        "function:product_function",
        "Core function is explicit",
        "The hidden record knows what the product actually does, not just what category it belongs to.",
        ["product_function"]
      )
    ],
    nextPhaseId: "user"
  }),
  user: phase({
    phaseId: "user",
    order: 6,
    label: "User",
    description:
      "Identify who the product is for, who wins first, and whether buyer/admin/operator roles materially differ.",
    requiredTruthKeys: ["target_user"],
    optionalTruthKeys: ["first_user"],
    branchTriggerIds: ["user_exploration", "user_role_clarification"],
    overlayIds: [],
    exitCriteria: [
      criterion(
        "user:target_user",
        "Target user is explicit",
        "The hidden system has a stable primary user class instead of a generic or universal audience.",
        ["target_user"]
      ),
      criterion(
        "user:first_user",
        "First user is attached when distinct",
        "If the first adopter differs from the broad target user, the hidden record captures that difference.",
        ["first_user"],
        false
      )
    ],
    nextPhaseId: "goals_outcomes"
  }),
  goals_outcomes: phase({
    phaseId: "goals_outcomes",
    order: 7,
    label: "Goals / Outcomes",
    description:
      "Capture what changes if the product works and what initial success means for the user or business.",
    requiredTruthKeys: ["business_goal"],
    optionalTruthKeys: ["monetization", "constraints"],
    branchTriggerIds: ["monetization_direction"],
    overlayIds: ["monetization"],
    exitCriteria: [
      criterion(
        "goals:business_goal",
        "Business goal is explicit",
        "The hidden system knows what result matters first beyond a feature list.",
        ["business_goal"]
      )
    ],
    nextPhaseId: "surface_discovery"
  }),
  surface_discovery: phase({
    phaseId: "surface_discovery",
    order: 8,
    label: "Surface Discovery",
    description:
      "Clarify which surfaces must exist first: public site, dashboard, portal, admin, detail pages, comparison views, search, or monitoring surfaces.",
    requiredTruthKeys: ["primary_surfaces"],
    optionalTruthKeys: ["mobile_expectations", "admin_ops_complexity"],
    branchTriggerIds: ["mobile_device_clarification", "admin_ops_clarification"],
    overlayIds: ["mobile_device", "admin_ops"],
    exitCriteria: [
      criterion(
        "surface:primary_surfaces",
        "Primary surfaces are explicit",
        "The hidden record knows which first surfaces belong in the product shape.",
        ["primary_surfaces"]
      )
    ],
    nextPhaseId: "systems_integrations_constraints"
  }),
  systems_integrations_constraints: phase({
    phaseId: "systems_integrations_constraints",
    order: 9,
    label: "Systems / Integrations / Constraints",
    description:
      "Screen workflow-critical systems, data assumptions, monetization, compliance, AI, mobile expectations, and ops complexity before handoff.",
    requiredTruthKeys: ["constraints", "compliance_security_sensitivity"],
    optionalTruthKeys: [
      "key_systems_integrations",
      "monetization",
      "ai_usage",
      "data_structure_assumptions",
      "mobile_expectations",
      "admin_ops_complexity"
    ],
    branchTriggerIds: [
      "integration_clarification",
      "compliance_screening",
      "monetization_direction",
      "ai_usage_clarification",
      "data_structure_clarification",
      "mobile_device_clarification",
      "admin_ops_clarification",
      "execution_not_safe_yet"
    ],
    overlayIds: [
      "monetization",
      "compliance_security",
      "ai_usage",
      "data_structure",
      "mobile_device",
      "admin_ops"
    ],
    exitCriteria: [
      criterion(
        "systems:constraints",
        "Constraints are screened",
        "Budget, time, staffing, or launch reality is explicit enough to guide recommendations.",
        ["constraints"]
      ),
      criterion(
        "systems:compliance",
        "Compliance / security sensitivity is screened",
        "The hidden system knows whether regulated data, privacy, security, or permissions materially change the build.",
        ["compliance_security_sensitivity"]
      ),
      criterion(
        "systems:critical_dependencies",
        "Critical systems and integrations are attached when relevant",
        "If the first use case depends on external systems or non-trivial data, the hidden record shows that path.",
        ["key_systems_integrations", "data_structure_assumptions"],
        false
      )
    ],
    nextPhaseId: null
  })
};

export const STRATEGY_PHASE_SEQUENCE = Object.values(STRATEGY_PHASE_DEFINITIONS).sort(
  (left, right) => left.order - right.order
);

export const STRATEGY_BRANCH_DEFINITIONS: Record<
  StrategyBranchId,
  StrategyBranchDefinition
> = {
  existing_name_capture: {
    branchId: "existing_name_capture",
    label: "Existing name capture",
    description: "Capture an already existing or provisional project name path.",
    phaseIds: ["identity", "naming"],
    supportingTruthKeys: ["project_name_state"],
    blockingEffect: "non_blocking"
  },
  naming_help_requested: {
    branchId: "naming_help_requested",
    label: "Naming help requested",
    description: "Open a naming-support path without forcing domain or trademark work immediately.",
    phaseIds: ["identity", "naming"],
    supportingTruthKeys: ["project_name_state", "naming_help_state"],
    blockingEffect: "conditional_blocking"
  },
  naming_deferred: {
    branchId: "naming_deferred",
    label: "Naming deferred",
    description: "Allow the project to continue under a working identity when naming is intentionally deferred.",
    phaseIds: ["identity", "naming"],
    supportingTruthKeys: ["project_name_state"],
    blockingEffect: "non_blocking"
  },
  domain_validation_intent: {
    branchId: "domain_validation_intent",
    label: "Domain validation intent",
    description: "Open an optional path for domain viability, alternatives, or naming-fit checks later.",
    phaseIds: ["naming"],
    supportingTruthKeys: ["domain_intent", "domain_validation_path"],
    blockingEffect: "conditional_blocking"
  },
  ideation_support: {
    branchId: "ideation_support",
    label: "Ideation support",
    description: "Treat 'I don't know' as a supported exploration branch instead of a failed answer.",
    phaseIds: ["core_idea"],
    supportingTruthKeys: ["product_function", "product_type", "business_goal"],
    blockingEffect: "conditional_blocking"
  },
  industry_exploration: {
    branchId: "industry_exploration",
    label: "Industry exploration",
    description: "Explore industry direction when the user has a general area but not a stable product shape yet.",
    phaseIds: ["core_idea", "product_definition"],
    supportingTruthKeys: ["product_type", "target_user"],
    blockingEffect: "non_blocking"
  },
  user_exploration: {
    branchId: "user_exploration",
    label: "User exploration",
    description: "Help infer likely user classes when the founder is vague about who the product is for.",
    phaseIds: ["user"],
    supportingTruthKeys: ["target_user", "first_user"],
    blockingEffect: "conditional_blocking"
  },
  product_type_narrowing: {
    branchId: "product_type_narrowing",
    label: "Product-type narrowing",
    description: "Force broad labels such as AI app, crypto SaaS, or marketplace into a sharper product category.",
    phaseIds: ["product_definition"],
    supportingTruthKeys: ["product_type", "product_function", "first_use_case"],
    blockingEffect: "blocking"
  },
  problem_discovery: {
    branchId: "problem_discovery",
    label: "Problem discovery",
    description: "Discover the pain, decision, or workflow the product should improve when the core idea is still blurry.",
    phaseIds: ["core_idea", "goals_outcomes"],
    supportingTruthKeys: ["business_goal", "product_function"],
    blockingEffect: "conditional_blocking"
  },
  monetization_direction: {
    branchId: "monetization_direction",
    label: "Monetization direction",
    description: "Clarify pricing or revenue logic when the product model depends on it.",
    phaseIds: ["goals_outcomes", "systems_integrations_constraints"],
    supportingTruthKeys: ["monetization", "business_goal", "product_type"],
    blockingEffect: "conditional_blocking"
  },
  function_capability_narrowing: {
    branchId: "function_capability_narrowing",
    label: "Function / capability narrowing",
    description: "Turn broad product-function statements into specific verbs, jobs, and capabilities.",
    phaseIds: ["function"],
    supportingTruthKeys: ["product_function", "first_use_case"],
    blockingEffect: "blocking"
  },
  user_role_clarification: {
    branchId: "user_role_clarification",
    label: "User role clarification",
    description: "Separate primary user, buyer, admin, operator, reviewer, or end customer when those roles differ.",
    phaseIds: ["user"],
    supportingTruthKeys: ["target_user", "first_user"],
    blockingEffect: "conditional_blocking"
  },
  integration_clarification: {
    branchId: "integration_clarification",
    label: "Integration clarification",
    description: "Clarify whether the first workflow depends on APIs, data feeds, internal systems, or manual data.",
    phaseIds: ["systems_integrations_constraints"],
    supportingTruthKeys: ["key_systems_integrations", "data_structure_assumptions"],
    blockingEffect: "conditional_blocking"
  },
  compliance_screening: {
    branchId: "compliance_screening",
    label: "Compliance / security screening",
    description: "Raise sensitivity flags when regulated data, privacy, auditability, or permissions could change the architecture.",
    phaseIds: ["systems_integrations_constraints"],
    supportingTruthKeys: ["compliance_security_sensitivity", "constraints"],
    blockingEffect: "blocking"
  },
  ai_usage_clarification: {
    branchId: "ai_usage_clarification",
    label: "AI usage clarification",
    description: "Clarify whether AI is core product value, an internal acceleration layer, or only optional enrichment.",
    phaseIds: ["function", "systems_integrations_constraints"],
    supportingTruthKeys: ["ai_usage", "product_function"],
    blockingEffect: "conditional_blocking"
  },
  data_structure_clarification: {
    branchId: "data_structure_clarification",
    label: "Data structure clarification",
    description: "Clarify whether value depends on structured data, live feeds, manual data, or migrations.",
    phaseIds: ["function", "systems_integrations_constraints"],
    supportingTruthKeys: ["data_structure_assumptions", "key_systems_integrations"],
    blockingEffect: "conditional_blocking"
  },
  mobile_device_clarification: {
    branchId: "mobile_device_clarification",
    label: "Mobile / device clarification",
    description: "Clarify whether mobile is required now, later, or only as future readiness.",
    phaseIds: ["surface_discovery", "systems_integrations_constraints"],
    supportingTruthKeys: ["mobile_expectations", "primary_surfaces"],
    blockingEffect: "conditional_blocking"
  },
  admin_ops_clarification: {
    branchId: "admin_ops_clarification",
    label: "Admin / ops clarification",
    description: "Clarify how much moderation, reporting, approvals, or operational control the product needs.",
    phaseIds: ["surface_discovery", "systems_integrations_constraints"],
    supportingTruthKeys: ["admin_ops_complexity", "primary_surfaces"],
    blockingEffect: "conditional_blocking"
  },
  execution_not_safe_yet: {
    branchId: "execution_not_safe_yet",
    label: "Execution not safe yet",
    description: "Keep the system in planning mode when the minimum data gate is not satisfied.",
    phaseIds: ["systems_integrations_constraints"],
    supportingTruthKeys: [
      "project_name_state",
      "product_type",
      "product_function",
      "target_user",
      "first_use_case",
      "business_goal"
    ],
    blockingEffect: "blocking"
  }
};

export const STRATEGY_OVERLAY_DEFINITIONS: Record<
  StrategyOverlayId,
  StrategyOverlayDefinition
> = {
  brandability: {
    overlayId: "brandability",
    label: "Brandability",
    description: "Optional naming/brand-fit overlay for later brand or public-name refinement.",
    supportingTruthKeys: ["project_name_state", "naming_help_state"]
  },
  domain_intent: {
    overlayId: "domain_intent",
    label: "Domain intent",
    description: "Optional overlay for domain timing and validation-path intent.",
    supportingTruthKeys: ["domain_intent", "domain_validation_path"]
  },
  market_crowding: {
    overlayId: "market_crowding",
    label: "Market / crowding",
    description: "Optional overlay for competitive density and crowded-space research intent.",
    supportingTruthKeys: ["product_type", "business_goal"]
  },
  monetization: {
    overlayId: "monetization",
    label: "Monetization",
    description: "Optional overlay for pricing, revenue model, or commercial structure.",
    supportingTruthKeys: ["monetization", "business_goal"]
  },
  compliance_security: {
    overlayId: "compliance_security",
    label: "Compliance / security",
    description: "Overlay for privacy, permissions, regulated data, auditability, and security-sensitive planning.",
    supportingTruthKeys: ["compliance_security_sensitivity", "constraints"]
  },
  ai_usage: {
    overlayId: "ai_usage",
    label: "AI usage",
    description: "Overlay for AI value shape, cost, and risk implications.",
    supportingTruthKeys: ["ai_usage", "product_function"]
  },
  data_structure: {
    overlayId: "data_structure",
    label: "Data structure",
    description: "Overlay for data models, feeds, sources, and data-quality assumptions.",
    supportingTruthKeys: ["data_structure_assumptions", "key_systems_integrations"]
  },
  mobile_device: {
    overlayId: "mobile_device",
    label: "Mobile / device",
    description: "Overlay for mobile-first, mobile-later, or device-specific expectations.",
    supportingTruthKeys: ["mobile_expectations", "primary_surfaces"]
  },
  admin_ops: {
    overlayId: "admin_ops",
    label: "Admin / ops",
    description: "Overlay for admin controls, approvals, moderation, reporting, and operational complexity.",
    supportingTruthKeys: ["admin_ops_complexity", "primary_surfaces"]
  }
};

export const STRATEGY_RESEARCH_INTENT_DEFINITIONS: Record<
  StrategyResearchIntentId,
  StrategyResearchIntentDefinition
> = {
  domain_availability: {
    intentId: "domain_availability",
    label: "Domain availability intent",
    description: "Signals that domain availability or alternatives should be checked later.",
    supportingTruthKeys: ["domain_intent", "domain_validation_path"]
  },
  trademark_crowding: {
    intentId: "trademark_crowding",
    label: "Trademark / name-crowding intent",
    description: "Signals later checking for public-name or brandability conflicts.",
    supportingTruthKeys: ["project_name_state", "domain_validation_path"]
  },
  market_crowding: {
    intentId: "market_crowding",
    label: "Market / crowding intent",
    description: "Signals later research into crowded categories, competitors, or whitespace.",
    supportingTruthKeys: ["product_type", "business_goal"]
  }
};

export const STRATEGY_CAPABILITY_DEFINITIONS: readonly StrategyCapabilityDefinition[] = [
  {
    capabilityId: "analyze",
    label: "Analyze",
    description: "Interpret or inspect information to produce useful understanding.",
    keywords: ["analyze", "analysis", "inspect", "intelligence"]
  },
  {
    capabilityId: "score",
    label: "Score",
    description: "Rank or score entities based on rules, heuristics, or signals.",
    keywords: ["score", "rank", "grade", "rate"]
  },
  {
    capabilityId: "compare",
    label: "Compare",
    description: "Compare entities, options, or alternatives side by side.",
    keywords: ["compare", "comparison", "benchmark", "versus"]
  },
  {
    capabilityId: "monitor",
    label: "Monitor",
    description: "Track changes or state over time.",
    keywords: ["monitor", "watch", "track", "observe"]
  },
  {
    capabilityId: "alert",
    label: "Alert",
    description: "Notify users when thresholds, events, or changes occur.",
    keywords: ["alert", "notify", "notification", "trigger"]
  },
  {
    capabilityId: "automate",
    label: "Automate",
    description: "Automate repeated operational work or decisions.",
    keywords: ["automate", "automation", "workflow", "auto"]
  },
  {
    capabilityId: "review",
    label: "Review",
    description: "Support review, approval, or inspection flows.",
    keywords: ["review", "approve", "approval", "moderate"]
  },
  {
    capabilityId: "publish",
    label: "Publish",
    description: "Create or publish content, output, or decisions.",
    keywords: ["publish", "post", "release", "issue"]
  },
  {
    capabilityId: "transact",
    label: "Transact",
    description: "Support financial or operational transactions.",
    keywords: ["transact", "trade", "book", "purchase", "pay"]
  },
  {
    capabilityId: "approve",
    label: "Approve",
    description: "Approve or reject work, requests, or changes.",
    keywords: ["approve", "approve/reject", "accept", "reject"]
  },
  {
    capabilityId: "manage",
    label: "Manage",
    description: "Manage records, users, settings, or operational state.",
    keywords: ["manage", "admin", "operate", "control"]
  },
  {
    capabilityId: "generate",
    label: "Generate",
    description: "Generate content, assets, outputs, or recommendations.",
    keywords: ["generate", "create", "draft", "produce"]
  }
] as const;

export const STRATEGY_PRODUCT_SPECIFICITY_FAMILIES: readonly StrategyProductSpecificityFamilyDefinition[] =
  [
    {
      familyId: "analytics_intelligence",
      label: "Analytics / intelligence product",
      description: "Products that help users understand risk, performance, or priorities.",
      examples: ["analytics", "portfolio intelligence", "compliance intelligence"],
      keywords: ["analytics", "intelligence", "insight", "dashboard", "score", "signal"]
    },
    {
      familyId: "workflow_operations",
      label: "Workflow / operations platform",
      description: "Products that coordinate people, approvals, tasks, or internal operations.",
      examples: ["operations platform", "internal ops system", "approval workflow"],
      keywords: ["workflow", "ops", "operations", "approval", "task", "process"]
    },
    {
      familyId: "marketplace_booking",
      label: "Marketplace / booking product",
      description: "Products that match buyers to providers, inventory, or service availability.",
      examples: ["booking marketplace", "service marketplace", "multi-provider platform"],
      keywords: ["marketplace", "booking", "provider", "seller", "vendor", "inventory"]
    },
    {
      familyId: "commerce_storefront",
      label: "Commerce / storefront",
      description: "Products centered on product discovery, merchandising, and checkout.",
      examples: ["commerce storefront", "brand store", "direct product sales"],
      keywords: ["commerce", "ecommerce", "storefront", "catalog", "checkout", "shop"]
    },
    {
      familyId: "finance_risk_execution",
      label: "Finance / risk / execution support",
      description: "Products that support risk, trading, portfolio, wallet, custody, or tax workflows.",
      examples: ["wallet", "execution/trading support", "tax", "custody", "portfolio intelligence"],
      keywords: ["wallet", "trade", "portfolio", "risk", "tax", "custody", "token"]
    },
    {
      familyId: "developer_platform",
      label: "Developer platform / infrastructure",
      description: "Products centered on APIs, tooling, infra, or technical enablement.",
      examples: ["developer platform", "API product", "infrastructure tooling"],
      keywords: ["developer", "api", "sdk", "infrastructure", "platform", "integration"]
    },
    {
      familyId: "education_community",
      label: "Education / community / membership",
      description: "Products centered on learning, membership, content, or community interaction.",
      examples: ["education", "community", "membership", "content hub"],
      keywords: ["education", "learn", "course", "community", "membership", "content"]
    }
  ] as const;

export const MINIMUM_WORKSPACE_HANDOFF_TRUTH_KEYS: readonly FrameworkTruthKey[] = [
  "project_name_state",
  "product_type",
  "product_function",
  "target_user",
  "first_use_case",
  "business_goal"
] as const;
