import type {
  BranchFamily,
  FieldStatus,
  GovernanceSystem,
  OverlayType as GovernanceOverlayType,
  RiskLevel
} from "@/lib/governance";
import type { ExtractionFieldKey } from "@/lib/intelligence/extraction";
import type { BranchOverlayKey, BranchResolutionTarget } from "./types";

export type NonHybridBranchFamily = Exclude<
  BranchFamily,
  "Hybrid / Composite System"
>;

export const NON_HYBRID_BRANCH_FAMILIES: readonly NonHybridBranchFamily[] = [
  "Commerce / Ecommerce",
  "SaaS / Workflow Platform",
  "Marketplace / Multi-Sided Platform",
  "Internal Operations / Backoffice Tool",
  "Content / Community / Membership",
  "Booking / Scheduling / Service Delivery",
  "Developer Platform / API / Infrastructure",
  "Data / Analytics / Intelligence Platform"
] as const;

export interface BranchDefinition {
  branch: NonHybridBranchFamily;
  description: string;
  generalKeywords: readonly string[];
  actorKeywords: readonly string[];
  workflowKeywords: readonly string[];
  businessModelKeywords: readonly string[];
  likelyRequiredSystems: readonly GovernanceSystem[];
  baseRoleComplexity: RiskLevel;
  baseTrustSensitivity: RiskLevel;
  baseWorkflowComplexity: RiskLevel;
  baseTransactionComplexity: RiskLevel;
}

export interface OverlayDefinition {
  key: BranchOverlayKey;
  label: string;
  description: string;
  keywords: readonly string[];
  likelyAffectedSystems: readonly GovernanceSystem[];
  governanceOverlayAliases: readonly GovernanceOverlayType[];
}

export const FIELD_STATUS_MULTIPLIERS: Record<FieldStatus, number> = {
  unanswered: 0,
  partial: 0.58,
  answered: 0.9,
  inferred: 0.78,
  conflicting: 0.35,
  validated: 1
};

export const BRANCH_FIELD_WEIGHTS: Record<ExtractionFieldKey, number> = {
  request_summary: 0.95,
  founder_operator_context: 0.18,
  project_name_state: 0.04,
  naming_help_state: 0.04,
  domain_intent: 0.06,
  domain_validation_path: 0.04,
  core_concept: 1,
  product_function: 0.92,
  primary_branch: 1.25,
  product_type: 1.1,
  primary_users: 1.05,
  first_user: 0.72,
  primary_buyers: 1,
  primary_admins: 0.92,
  problem_statement: 0.6,
  desired_outcome: 0.6,
  business_goal: 0.58,
  success_criteria: 0.45,
  first_use_case: 1.05,
  core_workflow: 1.15,
  business_model: 1.08,
  mvp_in_scope: 0.82,
  mvp_out_of_scope: 0.35,
  primary_surfaces: 0.34,
  systems_touched: 0.5,
  integrations: 0.42,
  data_dependencies: 0.48,
  constraints: 0.24,
  budget_constraints: 0.16,
  timeline_constraints: 0.16,
  compliance_security_sensitivity: 0.24,
  ai_usage: 0.28,
  mobile_expectations: 0.18,
  admin_ops_complexity: 0.24,
  brand_direction: 0.12
};

export const BRANCH_DEFINITIONS: Record<NonHybridBranchFamily, BranchDefinition> = {
  "Commerce / Ecommerce": {
    branch: "Commerce / Ecommerce",
    description:
      "Catalog, checkout, order flow, merchandising, and fulfillment are central.",
    generalKeywords: [
      "ecommerce",
      "commerce",
      "storefront",
      "catalog",
      "checkout",
      "cart",
      "inventory",
      "shipping",
      "fulfillment",
      "sku",
      "order",
      "merch",
      "retail",
      "d2c",
      "apparel",
      "fashion"
    ],
    actorKeywords: ["shopper", "customer", "buyer", "merchant"],
    workflowKeywords: [
      "browse",
      "buy",
      "purchase",
      "add to cart",
      "checkout",
      "ship",
      "fulfill"
    ],
    businessModelKeywords: [
      "sell products",
      "sell goods",
      "product sales",
      "retail sales",
      "average order value",
      "conversion"
    ],
    likelyRequiredSystems: ["Product", "Billing / account", "Routing"],
    baseRoleComplexity: "moderate",
    baseTrustSensitivity: "moderate",
    baseWorkflowComplexity: "moderate",
    baseTransactionComplexity: "high"
  },
  "SaaS / Workflow Platform": {
    branch: "SaaS / Workflow Platform",
    description:
      "Recurring software centered on user workflows, permissions, and ongoing usage.",
    generalKeywords: [
      "saas",
      "software",
      "app",
      "web app",
      "workflow",
      "dashboard",
      "workspace",
      "portal",
      "subscription",
      "seat",
      "team",
      "project management"
    ],
    actorKeywords: ["team", "operator", "manager", "admin", "customer account"],
    workflowKeywords: [
      "manage",
      "track",
      "collaborate",
      "workflow",
      "assign",
      "monitor",
      "operate"
    ],
    businessModelKeywords: [
      "subscription",
      "monthly plan",
      "annual plan",
      "seat-based",
      "recurring revenue"
    ],
    likelyRequiredSystems: [
      "Product",
      "Auth",
      "Protected routing",
      "Billing / account",
      "Workspace / project surfaces"
    ],
    baseRoleComplexity: "moderate",
    baseTrustSensitivity: "moderate",
    baseWorkflowComplexity: "high",
    baseTransactionComplexity: "moderate"
  },
  "Marketplace / Multi-Sided Platform": {
    branch: "Marketplace / Multi-Sided Platform",
    description:
      "Supply and demand sides, matching, trust, payout, and governance shape the system.",
    generalKeywords: [
      "marketplace",
      "multi-sided",
      "two-sided",
      "listing",
      "vendor",
      "seller",
      "provider",
      "host",
      "buyer",
      "customer demand",
      "supply",
      "take rate",
      "commission"
    ],
    actorKeywords: ["vendor", "seller", "provider", "host", "buyer", "guest"],
    workflowKeywords: [
      "match",
      "discover providers",
      "connect buyers and sellers",
      "accept providers",
      "manage listings"
    ],
    businessModelKeywords: [
      "take rate",
      "commission",
      "transaction fee",
      "marketplace fee"
    ],
    likelyRequiredSystems: [
      "Product",
      "Auth",
      "Protected routing",
      "Billing / account",
      "Backend governance"
    ],
    baseRoleComplexity: "high",
    baseTrustSensitivity: "high",
    baseWorkflowComplexity: "high",
    baseTransactionComplexity: "high"
  },
  "Internal Operations / Backoffice Tool": {
    branch: "Internal Operations / Backoffice Tool",
    description:
      "Internal staff workflows, operator tools, and backoffice reliability dominate.",
    generalKeywords: [
      "internal tool",
      "backoffice",
      "ops dashboard",
      "operations",
      "staff tool",
      "admin tool",
      "employee portal",
      "internal workflow"
    ],
    actorKeywords: ["employee", "staff", "operator", "ops team", "backoffice"],
    workflowKeywords: [
      "triage",
      "review queue",
      "approve",
      "process requests",
      "ops workflow"
    ],
    businessModelKeywords: ["internal efficiency", "internal operations", "cost savings"],
    likelyRequiredSystems: ["Product", "Workspace / project surfaces", "Backend"],
    baseRoleComplexity: "moderate",
    baseTrustSensitivity: "moderate",
    baseWorkflowComplexity: "high",
    baseTransactionComplexity: "low"
  },
  "Content / Community / Membership": {
    branch: "Content / Community / Membership",
    description:
      "Content publishing, community loops, and membership value are central.",
    generalKeywords: [
      "content",
      "community",
      "membership",
      "member",
      "forum",
      "creator",
      "newsletter",
      "course",
      "media",
      "ugc",
      "discussion",
      "comment"
    ],
    actorKeywords: ["member", "creator", "moderator", "subscriber", "reader"],
    workflowKeywords: [
      "publish",
      "read",
      "discuss",
      "moderate",
      "comment",
      "share"
    ],
    businessModelKeywords: [
      "membership",
      "subscription",
      "paid content",
      "community access"
    ],
    likelyRequiredSystems: ["Product", "Auth", "Protected routing", "Routing"],
    baseRoleComplexity: "moderate",
    baseTrustSensitivity: "moderate",
    baseWorkflowComplexity: "moderate",
    baseTransactionComplexity: "low"
  },
  "Booking / Scheduling / Service Delivery": {
    branch: "Booking / Scheduling / Service Delivery",
    description:
      "Availability, scheduling, service delivery, and capacity management are core.",
    generalKeywords: [
      "booking",
      "scheduling",
      "appointment",
      "reservation",
      "calendar",
      "availability",
      "timeslot",
      "service delivery",
      "staff capacity"
    ],
    actorKeywords: ["client", "patient", "guest", "practitioner", "staff"],
    workflowKeywords: [
      "book",
      "schedule",
      "confirm appointment",
      "manage availability",
      "deliver service"
    ],
    businessModelKeywords: [
      "service fee",
      "session fee",
      "bookings",
      "appointments",
      "service packages"
    ],
    likelyRequiredSystems: ["Product", "Auth", "Billing / account", "Backend"],
    baseRoleComplexity: "moderate",
    baseTrustSensitivity: "moderate",
    baseWorkflowComplexity: "high",
    baseTransactionComplexity: "moderate"
  },
  "Developer Platform / API / Infrastructure": {
    branch: "Developer Platform / API / Infrastructure",
    description:
      "APIs, infrastructure contracts, environments, and developer workflows define the product.",
    generalKeywords: [
      "developer",
      "api",
      "sdk",
      "cli",
      "infrastructure",
      "devops",
      "deployment",
      "webhook",
      "environment",
      "provisioning"
    ],
    actorKeywords: ["developer", "engineer", "operator"],
    workflowKeywords: [
      "integrate",
      "deploy",
      "provision",
      "configure",
      "monitor environments"
    ],
    businessModelKeywords: [
      "api usage",
      "platform fee",
      "developer plan",
      "infrastructure subscription"
    ],
    likelyRequiredSystems: [
      "Backend",
      "Auth",
      "Protected routing",
      "Backend governance"
    ],
    baseRoleComplexity: "high",
    baseTrustSensitivity: "high",
    baseWorkflowComplexity: "high",
    baseTransactionComplexity: "low"
  },
  "Data / Analytics / Intelligence Platform": {
    branch: "Data / Analytics / Intelligence Platform",
    description:
      "Data flows, reporting, intelligence output, and recommendation loops create value.",
    generalKeywords: [
      "data",
      "analytics",
      "intelligence",
      "dashboard",
      "reporting",
      "insight",
      "metrics",
      "forecast",
      "recommendation",
      "pipeline"
    ],
    actorKeywords: ["analyst", "operator", "executive", "data team"],
    workflowKeywords: [
      "analyze",
      "report",
      "forecast",
      "monitor metrics",
      "generate insights"
    ],
    businessModelKeywords: [
      "analytics subscription",
      "data product",
      "reporting plan",
      "insight delivery"
    ],
    likelyRequiredSystems: ["Backend", "Product", "Backend governance"],
    baseRoleComplexity: "moderate",
    baseTrustSensitivity: "high",
    baseWorkflowComplexity: "high",
    baseTransactionComplexity: "low"
  }
};

export const OVERLAY_DEFINITIONS: Record<BranchOverlayKey, OverlayDefinition> = {
  "ai-copilot": {
    key: "ai-copilot",
    label: "AI / Copilot",
    description:
      "AI assistance, copilots, agents, or model-driven workflows materially affect the product.",
    keywords: [
      "ai",
      "copilot",
      "assistant",
      "agent",
      "llm",
      "model",
      "automation",
      "generate",
      "summarize"
    ],
    likelyAffectedSystems: [
      "Planning intelligence",
      "Extraction engine",
      "Question engine",
      "Backend"
    ],
    governanceOverlayAliases: ["automation-ai"]
  },
  "multi-tenant-team-workspace": {
    key: "multi-tenant-team-workspace",
    label: "Multi-tenant / Team / Workspace",
    description:
      "Multiple teams, organizations, workspaces, or permission boundaries shape the system.",
    keywords: [
      "tenant",
      "multi-tenant",
      "team",
      "workspace",
      "organization",
      "permissions",
      "roles",
      "shared space",
      "collaboration"
    ],
    likelyAffectedSystems: [
      "Auth",
      "Protected routing",
      "Workspace / project surfaces"
    ],
    governanceOverlayAliases: ["multi-tenant-collaboration"]
  },
  "approval-workflow-governance": {
    key: "approval-workflow-governance",
    label: "Approval / Workflow Governance",
    description:
      "Approvals, review stages, audit trails, or workflow governance materially change execution.",
    keywords: [
      "approval",
      "approve",
      "review",
      "signoff",
      "governance",
      "audit trail",
      "policy",
      "escalation"
    ],
    likelyAffectedSystems: ["Backend governance", "Protected routing", "Product"],
    governanceOverlayAliases: ["admin-backoffice"]
  },
  "community-ugc": {
    key: "community-ugc",
    label: "Community / UGC",
    description:
      "Community participation, moderation, or user-generated content adds new system demands.",
    keywords: [
      "community",
      "forum",
      "discussion",
      "comment",
      "ugc",
      "user-generated",
      "creator",
      "moderation",
      "post"
    ],
    likelyAffectedSystems: ["Product", "Auth", "Protected routing"],
    governanceOverlayAliases: ["content-community"]
  },
  commerce: {
    key: "commerce",
    label: "Commerce",
    description:
      "Transactions, checkout, pricing, fulfillment, or commercial flows materially affect the system.",
    keywords: [
      "commerce",
      "checkout",
      "cart",
      "pricing",
      "payment",
      "order",
      "catalog",
      "subscription",
      "sell"
    ],
    likelyAffectedSystems: ["Billing / account", "Product", "Routing"],
    governanceOverlayAliases: ["commerce"]
  },
  "mobile-first-native-experience": {
    key: "mobile-first-native-experience",
    label: "Mobile-First / Native Experience",
    description:
      "Mobile-native workflows, device constraints, or native app behavior materially affect the system.",
    keywords: [
      "mobile",
      "ios",
      "android",
      "native app",
      "app store",
      "push notification",
      "offline mode"
    ],
    likelyAffectedSystems: ["Product", "Backend"],
    governanceOverlayAliases: []
  },
  "compliance-security-sensitive-data": {
    key: "compliance-security-sensitive-data",
    label: "Compliance / Security / Sensitive Data",
    description:
      "Security, auditability, regulated data, or compliance obligations shape the system.",
    keywords: [
      "security",
      "compliance",
      "sensitive data",
      "pii",
      "phi",
      "hipaa",
      "soc 2",
      "gdpr",
      "audit",
      "regulated"
    ],
    likelyAffectedSystems: ["Auth", "Protected routing", "Backend governance"],
    governanceOverlayAliases: []
  },
  "international-localization": {
    key: "international-localization",
    label: "International / Localization",
    description:
      "Localization, regionalization, currency, language, or timezone support shapes the system.",
    keywords: [
      "localization",
      "translation",
      "multi-language",
      "international",
      "global",
      "currency",
      "timezone",
      "regional"
    ],
    likelyAffectedSystems: ["Product", "Routing", "Backend"],
    governanceOverlayAliases: []
  }
};

export const BRANCH_RESOLUTION_PLAYBOOK: Array<{
  branches: readonly [BranchFamily, BranchFamily];
  recommendedQuestionTarget: BranchResolutionTarget;
  missingInformationNeeded: readonly string[];
  reason: string;
}> = [
  {
    branches: [
      "Marketplace / Multi-Sided Platform",
      "Booking / Scheduling / Service Delivery"
    ],
    recommendedQuestionTarget: "workflow",
    missingInformationNeeded: [
      "Whether third-party supply/demand matching is the dominant value loop",
      "Whether scheduled service delivery is the real first-class workflow"
    ],
    reason:
      "The request mixes provider matching with appointment flow and needs a core workflow decision."
  },
  {
    branches: [
      "Commerce / Ecommerce",
      "Marketplace / Multi-Sided Platform"
    ],
    recommendedQuestionTarget: "business_model",
    missingInformationNeeded: [
      "Whether value comes from direct sales or third-party seller/provider participation",
      "Who controls inventory, fulfillment, or listing ownership"
    ],
    reason:
      "The request mixes direct commerce and marketplace economics."
  },
  {
    branches: [
      "SaaS / Workflow Platform",
      "Internal Operations / Backoffice Tool"
    ],
    recommendedQuestionTarget: "actors",
    missingInformationNeeded: [
      "Whether the primary users are internal staff only or external customers with accounts",
      "Whether the core workflow is internal efficiency or external recurring software usage"
    ],
    reason:
      "The request mixes internal operations language with external software signals."
  },
  {
    branches: [
      "SaaS / Workflow Platform",
      "Data / Analytics / Intelligence Platform"
    ],
    recommendedQuestionTarget: "problem_outcome",
    missingInformationNeeded: [
      "Whether the product's first value is operational workflow or intelligence output",
      "Whether analytics is the product or only a supporting feature"
    ],
    reason:
      "The request mixes workflow software and analytics-product signals."
  }
] as const;

export const ARCHITECTURAL_BRANCH_SHIFT_PAIRS: ReadonlyArray<
  readonly [BranchFamily, BranchFamily]
> = [
  ["Commerce / Ecommerce", "Marketplace / Multi-Sided Platform"],
  ["SaaS / Workflow Platform", "Marketplace / Multi-Sided Platform"],
  ["Internal Operations / Backoffice Tool", "SaaS / Workflow Platform"],
  ["Booking / Scheduling / Service Delivery", "Marketplace / Multi-Sided Platform"],
  ["Commerce / Ecommerce", "Hybrid / Composite System"],
  ["SaaS / Workflow Platform", "Hybrid / Composite System"],
  ["Marketplace / Multi-Sided Platform", "Hybrid / Composite System"]
] as const;
