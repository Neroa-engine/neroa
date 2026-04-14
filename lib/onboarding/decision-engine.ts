import type { AgentId } from "@/lib/ai/agents";
import {
  getPricingPlan,
  getRecommendedExecutionCreditPack,
  planScopedEstimateSupport,
  scopedOverageGuidance,
  type PricingPlanId
} from "@/lib/pricing/config";
import type { ProjectTemplateId } from "@/lib/workspace/project-lanes";

export type BuildCategoryId =
  | "saas"
  | "internal-app"
  | "external-app"
  | "mobile-app";

export type BuildFeatureStage = "MVP" | "Later";
export type GuidedBuildTemplateKind = "predefined" | "custom";

export type BuildEntryMode = "known-industry" | "exploring";
export type BuildIndustryId =
  | "crypto-web3"
  | "ai-automation"
  | "saas-software"
  | "finance-trading"
  | "ecommerce"
  | "local-services"
  | "content-media"
  | "health-wellness"
  | "custom";
export type BuildGoalId = "fast-revenue" | "scalable-platform" | "learn-experiment";
export type BuildExperienceLevelId = "beginner" | "intermediate" | "advanced";
export type BuildPreferenceId =
  | "recommend-best-path"
  | "manual-modules"
  | "start-lean-upgrade-later";
export type ComplexityLabel = "Lean" | "Moderate" | "Advanced";
export type UiDensity = "calm" | "balanced" | "dense";
export type VariationLayoutId = "mission-control" | "guided-operator" | "focus-column";
export type VariationNavigationId = "left-rail" | "hybrid" | "top-tabs";

export type BuildTemplateFeature = {
  id: string;
  label: string;
  whatItDoes: string;
  whyIncluded: string;
  stage: BuildFeatureStage;
};

export type GuidedBuildIndustry = {
  id: BuildIndustryId;
  label: string;
  description: string;
};

export type GuidedBuildGoal = {
  id: BuildGoalId;
  label: string;
  description: string;
};

export type GuidedBuildExperienceLevel = {
  id: BuildExperienceLevelId;
  label: string;
  description: string;
};

export type GuidedBuildPreference = {
  id: BuildPreferenceId;
  label: string;
  description: string;
};

export type GuidedBuildOpportunity = {
  id: string;
  label: string;
  industryId: BuildIndustryId;
  productTypeId: string;
  whyAttractive: string;
  monetizationModel: string;
  difficultyLevel: string;
  recommendedStartingSystem: string;
};

export type GuidedBuildProductType = {
  id: string;
  industryId: BuildIndustryId;
  label: string;
  description: string;
  buildCategory: BuildCategoryId;
  frameworkId: string;
};

type ModuleDefinition = {
  id: string;
  label: string;
  whatItDoes: string;
  whyIncluded: string;
  complexity: number;
  dataIntensity: number;
  aiIntensity: number;
  realtimeIntensity: number;
};

type FrameworkDefinition = {
  id: string;
  label: string;
  industryId: BuildIndustryId;
  buildCategory: BuildCategoryId;
  templateId: ProjectTemplateId;
  recommendationLead: string;
  architectureSummary: string;
  appStackValue: string;
  appStackDetail: string;
  commercialBuild: boolean;
  leanModuleIds: string[];
  coreModuleIds: string[];
  expansionModuleIds: string[];
  optionalModuleIds: string[];
  assignedAgents: AgentId[];
};

export type GuidedBuildBlueprint = {
  categoryId: BuildCategoryId;
  buildCategory: BuildCategoryId;
  categoryLabel: string;
  templateKind: GuidedBuildTemplateKind;
  templateIdeaId: string;
  templateIdeaLabel: string;
  selectedTemplateId: string;
  selectedTemplateName: string;
  customTemplateName?: string;
  customBuildGoal?: string;
  customDescription?: string;
  customProblem?: string;
  customAudience?: string;
  customFeatureIdeas?: string;
  engineName: string;
  generatedSummary: string;
  projectSummary: string;
  templateId: ProjectTemplateId;
  laneStructure: string[];
  primaryBuildPathLabel: "Recommended App Stack";
  primaryBuildPathValue: string;
  primaryBuildPathDetail: string;
  secondaryPathLabel?: string;
  secondaryPathValue?: string;
  secondaryPathDetail?: string;
  advisoryPathLabel?: string;
  advisoryPathValue?: string;
  advisoryPathDetail?: string;
  featureCards: BuildTemplateFeature[];
  selectedModuleIds: string[];
  selectedFeatures: string[];
  recommendedBuildPath: string;
  naroaRecommendation: string;
  buildRoadmap: string[];
  nextStepChecklist: string[];
  assignedAgents: AgentId[];
  createdFromOnboarding: true;
  entryMode?: BuildEntryMode;
  industryId?: BuildIndustryId;
  industryLabel?: string;
  customIndustry?: string;
  industryGroup?: string;
  industryDetail?: string;
  goalId?: BuildGoalId;
  goalLabel?: string;
  experienceLevelId?: BuildExperienceLevelId;
  experienceLevelLabel?: string;
  buildPreferenceId?: BuildPreferenceId;
  buildPreferenceLabel?: string;
  recommendedFrameworkId?: string;
  recommendedFrameworkLabel?: string;
  recommendedTierId?: PricingPlanId;
  recommendedTierLabel?: string;
  selectedPlanId?: PricingPlanId;
  selectedPlanLabel?: string;
  includedMonthlyEngineCredits?: number;
  estimatedTotalCreditsRequired?: number;
  estimatedCreditOverage?: number;
  estimatedTimeline?: string;
  estimatedTimelineDetail?: string;
  recommendedCreditPackLabel?: string;
  recommendedCreditPackDetail?: string;
  managedBuildRecommendation?: string;
  creditPoolWarning?: string;
  scopeExecutionNote?: string;
  recommendationReason?: string;
  pricingGateNotice?: string;
  complexityScore?: number;
  complexityLabel?: ComplexityLabel;
  complexitySummary?: string;
  executionIntensity?: string;
  uiDensity?: UiDensity;
  variationSeed?: string;
  variationLayoutId?: VariationLayoutId;
  variationLayoutLabel?: string;
  variationNavigationId?: VariationNavigationId;
  requiredModuleCards?: BuildTemplateFeature[];
  expansionModuleCards?: BuildTemplateFeature[];
  optionalModuleCards?: BuildTemplateFeature[];
};

const standardLaneStructure = [
  "Strategy",
  "Scope",
  "MVP",
  "Budget",
  "Test",
  "Build",
  "Launch",
  "Operate"
] as const;

const buildCategoryLabels: Record<BuildCategoryId, string> = {
  saas: "SaaS",
  "internal-app": "Internal App",
  "external-app": "External App",
  "mobile-app": "Mobile App"
};

const industries: GuidedBuildIndustry[] = [
  { id: "crypto-web3", label: "Crypto & Web3", description: "Analytics systems, trading education, signals, wallet products, and token-driven platforms." },
  { id: "ai-automation", label: "AI & Automation", description: "Workflow automation, client-facing AI systems, internal AI tools, and agent-powered products." },
  { id: "saas-software", label: "SaaS / Software", description: "Subscription platforms, operational software, customer portals, and workflow-driven products." },
  { id: "finance-trading", label: "Finance & Trading", description: "Signals, dashboards, investor tools, education systems, and portfolio-driven software." },
  { id: "ecommerce", label: "E-commerce", description: "Commerce systems, catalog products, marketplace layers, and branded revenue workflows." },
  { id: "local-services", label: "Local Services", description: "Lead systems, booking engines, dispatch tools, quote flows, and service business software." },
  { id: "content-media", label: "Content / Media", description: "Education, membership, publishing, community, analytics, and monetized media products." },
  { id: "health-wellness", label: "Health & Wellness", description: "Coaching platforms, client portals, progress tools, booking systems, and practice operations software." }
];

const goals: GuidedBuildGoal[] = [
  { id: "fast-revenue", label: "Fast Revenue (0-60 days)", description: "Bias the system toward a lean commercial launch path with faster time to value." },
  { id: "scalable-platform", label: "Scalable Platform (3-12 months)", description: "Bias the system toward stronger architecture, monetization, and expansion readiness." },
  { id: "learn-experiment", label: "MVP / Test Idea", description: "Bias the system toward a lighter validation build so you can learn before widening the scope." }
];

const experienceLevels: GuidedBuildExperienceLevel[] = [
  { id: "beginner", label: "Beginner", description: "Keep the path cleaner, more guided, and lighter on avoidable complexity." },
  { id: "intermediate", label: "Intermediate", description: "Balance speed with stronger system structure and clearer expansion planning." },
  { id: "advanced", label: "Advanced", description: "Allow richer architecture, denser modules, and more ambitious first-release thinking." }
];

const buildPreferences: GuidedBuildPreference[] = [
  { id: "recommend-best-path", label: "Recommend the best path for me", description: "Let Neroa choose the first build shape, module set, and pacing." },
  { id: "manual-modules", label: "Let me choose modules manually", description: "Keep the recommendation engine active, but let me decide which extra modules belong in the first system." },
  { id: "start-lean-upgrade-later", label: "Start lean and upgrade later", description: "Bias the system toward a smaller first release with a clearer expansion path." }
];

const moduleRegistry: Record<string, ModuleDefinition> = {
  "token-intelligence-dashboard": {
    id: "token-intelligence-dashboard",
    label: "Token Intelligence Dashboard",
    whatItDoes: "Gives users a live working surface for token metrics, status, and priority market signals.",
    whyIncluded: "A crypto analytics product needs one clear token-centric value path before it expands.",
    complexity: 3,
    dataIntensity: 3,
    aiIntensity: 1,
    realtimeIntensity: 2
  },
  "billing-subscription": {
    id: "billing-subscription",
    label: "Billing + Subscription",
    whatItDoes: "Handles plan access, subscription state, and recurring revenue logic.",
    whyIncluded: "Serious commercial builds should not treat monetization as a late afterthought.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 0
  },
  "watchlist-system": {
    id: "watchlist-system",
    label: "Watchlist System",
    whatItDoes: "Lets users save and monitor the assets, accounts, or records they care about most.",
    whyIncluded: "Watchlists increase recurring value once the first workflow is already clear.",
    complexity: 2,
    dataIntensity: 2,
    aiIntensity: 0,
    realtimeIntensity: 1
  },
  "wallet-tracking": {
    id: "wallet-tracking",
    label: "Wallet Tracking",
    whatItDoes: "Monitors wallet activity, movement, and concentration changes tied to the product's core data model.",
    whyIncluded: "Wallet behavior becomes valuable once the token data layer is already reliable.",
    complexity: 3,
    dataIntensity: 3,
    aiIntensity: 1,
    realtimeIntensity: 2
  },
  "liquidity-monitor": {
    id: "liquidity-monitor",
    label: "Liquidity Monitoring",
    whatItDoes: "Tracks liquidity shifts and market pressure indicators that can alter risk or opportunity.",
    whyIncluded: "It adds strong intelligence value, but it should not lead the build ahead of the core data layer.",
    complexity: 3,
    dataIntensity: 3,
    aiIntensity: 1,
    realtimeIntensity: 2
  },
  "unlock-vesting-tracker": {
    id: "unlock-vesting-tracker",
    label: "Unlock / Vesting Tracker",
    whatItDoes: "Surfaces token unlock schedules, vesting events, and likely supply pressure moments.",
    whyIncluded: "High-value later expansion for crypto intelligence once the token data layer is live.",
    complexity: 3,
    dataIntensity: 2,
    aiIntensity: 0,
    realtimeIntensity: 1
  },
  "ai-risk-summaries": {
    id: "ai-risk-summaries",
    label: "AI Risk Summaries",
    whatItDoes: "Generates AI-assisted summaries from token, wallet, liquidity, and concentration signals.",
    whyIncluded: "Useful differentiation, but it should be layered onto good data instead of replacing it.",
    complexity: 4,
    dataIntensity: 2,
    aiIntensity: 3,
    realtimeIntensity: 1
  },
  "admin-control-center": {
    id: "admin-control-center",
    label: "Admin Control Center",
    whatItDoes: "Gives operators a control layer for moderation, curation, billing exceptions, and support actions.",
    whyIncluded: "Strong admin controls matter once the system is commercial and user-facing.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 0
  },
  "whale-alerts": {
    id: "whale-alerts",
    label: "Whale Alerts",
    whatItDoes: "Flags large-holder movement and event-driven changes that can affect market interpretation.",
    whyIncluded: "Advanced monitoring add-on that raises data complexity quickly.",
    complexity: 3,
    dataIntensity: 3,
    aiIntensity: 1,
    realtimeIntensity: 3
  },
  "strategy-engine": {
    id: "strategy-engine",
    label: "Strategy Engine",
    whatItDoes: "Frames the core strategy, rules, and operating logic behind a signals or automation product.",
    whyIncluded: "This is the product logic layer users are actually paying for.",
    complexity: 3,
    dataIntensity: 1,
    aiIntensity: 1,
    realtimeIntensity: 1
  },
  "signal-delivery-layer": {
    id: "signal-delivery-layer",
    label: "Signal Delivery Layer",
    whatItDoes: "Distributes signals, prompts, or system outputs through one clear user-facing flow.",
    whyIncluded: "The core value needs a dependable delivery path before the product widens.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 1,
    realtimeIntensity: 2
  },
  "risk-warning-engine": {
    id: "risk-warning-engine",
    label: "Risk Warning Engine",
    whatItDoes: "Adds structured warnings and risk framing to product outputs and user decisions.",
    whyIncluded: "Signals and finance products should frame risk directly, not leave it implicit.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 1,
    realtimeIntensity: 1
  },
  "paper-trading": {
    id: "paper-trading",
    label: "Paper Trading",
    whatItDoes: "Lets users simulate trades or strategies without real capital exposure.",
    whyIncluded: "A strong later-phase expansion once the main product logic is already trusted.",
    complexity: 3,
    dataIntensity: 2,
    aiIntensity: 0,
    realtimeIntensity: 2
  },
  "portfolio-tracker": {
    id: "portfolio-tracker",
    label: "Portfolio Tracker",
    whatItDoes: "Tracks positions, performance, and account-level progress over time.",
    whyIncluded: "Useful growth module, but it increases scope beyond a lean first commercial loop.",
    complexity: 3,
    dataIntensity: 2,
    aiIntensity: 0,
    realtimeIntensity: 1
  },
  "course-delivery": {
    id: "course-delivery",
    label: "Course Delivery",
    whatItDoes: "Delivers structured lessons, modules, and content progression for learning products.",
    whyIncluded: "Education systems need a dependable content experience before extra community layers.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 0
  },
  "member-access": {
    id: "member-access",
    label: "Member Access",
    whatItDoes: "Controls who can access premium materials, tools, or gated education flows.",
    whyIncluded: "Education and membership builds need access control tied to billing from the start.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 0
  },
  "ai-coach": {
    id: "ai-coach",
    label: "AI Coach",
    whatItDoes: "Adds guided interpretation, prompts, or product coaching inside the learning experience.",
    whyIncluded: "Strong differentiator, but not the first thing to build before the teaching flow works.",
    complexity: 3,
    dataIntensity: 1,
    aiIntensity: 3,
    realtimeIntensity: 0
  },
  "community-layer": {
    id: "community-layer",
    label: "Community Layer",
    whatItDoes: "Adds shared conversations, peer interaction, or member collaboration inside the product.",
    whyIncluded: "Valuable later, but it should not crowd the first release unless the product depends on it.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 1
  },
  "workflow-dashboard": {
    id: "workflow-dashboard",
    label: "Workflow Dashboard",
    whatItDoes: "Gives operators one place to monitor workflow state, tasks, and execution progress.",
    whyIncluded: "Many commercial and internal systems need one control layer before deeper automation.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 1
  },
  "ai-task-orchestration": {
    id: "ai-task-orchestration",
    label: "AI Task Orchestration",
    whatItDoes: "Coordinates multi-step AI work, task routing, and structured automation inside the product.",
    whyIncluded: "Core AI systems should frame orchestration intentionally instead of acting like a loose chat tool.",
    complexity: 4,
    dataIntensity: 2,
    aiIntensity: 3,
    realtimeIntensity: 1
  },
  "client-workspaces": {
    id: "client-workspaces",
    label: "Client Workspaces",
    whatItDoes: "Creates separate customer or client surfaces with their own data and workflow boundaries.",
    whyIncluded: "Important once the system is multi-tenant or client-facing at scale.",
    complexity: 3,
    dataIntensity: 2,
    aiIntensity: 0,
    realtimeIntensity: 1
  },
  "crm-integration": {
    id: "crm-integration",
    label: "CRM Integration",
    whatItDoes: "Connects external customer or lead systems into the core workflow.",
    whyIncluded: "Strong expansion module when the product already owns the main user path.",
    complexity: 3,
    dataIntensity: 2,
    aiIntensity: 0,
    realtimeIntensity: 1
  },
  "lead-capture": {
    id: "lead-capture",
    label: "Lead Capture",
    whatItDoes: "Captures inbound interest and routes it into the product's revenue or service flow.",
    whyIncluded: "Important when fast revenue depends on bringing prospects into a structured system quickly.",
    complexity: 1,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 0
  },
  "core-dashboard": {
    id: "core-dashboard",
    label: "Core Dashboard",
    whatItDoes: "Acts as the main working surface where users see status, actions, and the system's value path.",
    whyIncluded: "Most software builds need a clear center of gravity for the first release.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 0
  },
  "user-auth": {
    id: "user-auth",
    label: "User Auth",
    whatItDoes: "Controls secure account access, role-aware usage, and returning-user continuity.",
    whyIncluded: "Real products need identity, saved state, and permission boundaries early.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 0
  },
  analytics: {
    id: "analytics",
    label: "Analytics",
    whatItDoes: "Adds product insights, reporting, and clearer operating visibility after core workflows are live.",
    whyIncluded: "Useful for expansion, but it usually follows the main product value path.",
    complexity: 2,
    dataIntensity: 2,
    aiIntensity: 0,
    realtimeIntensity: 0
  },
  notifications: {
    id: "notifications",
    label: "Notifications",
    whatItDoes: "Triggers messages, reminders, or alerts tied to user actions or important events.",
    whyIncluded: "Helpful after the product proves its core loop, but often not the first thing to ship.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 1
  },
  "workflow-engine": {
    id: "workflow-engine",
    label: "Workflow Engine",
    whatItDoes: "Runs the main product logic across tasks, approvals, stages, or user-driven flows.",
    whyIncluded: "Many internal and SaaS systems need this as the actual product backbone.",
    complexity: 3,
    dataIntensity: 2,
    aiIntensity: 0,
    realtimeIntensity: 1
  },
  "customer-portal": {
    id: "customer-portal",
    label: "Customer Portal",
    whatItDoes: "Gives customers a self-serve surface for status, documents, actions, or service history.",
    whyIncluded: "Useful when external experience matters more than internal tooling in the first release.",
    complexity: 2,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 0
  },
  marketplace: {
    id: "marketplace",
    label: "Marketplace Layer",
    whatItDoes: "Supports supply and demand interactions, listing management, and transaction flows.",
    whyIncluded: "High-value but scope-heavy. Better when the team is ready for richer two-sided logic.",
    complexity: 4,
    dataIntensity: 3,
    aiIntensity: 0,
    realtimeIntensity: 2
  },
  "mobile-navigation": {
    id: "mobile-navigation",
    label: "Mobile Navigation",
    whatItDoes: "Creates the screen flow, tab structure, and mobile interaction baseline for the app.",
    whyIncluded: "Mobile builds need a tighter screen structure before feature depth expands.",
    complexity: 2,
    dataIntensity: 0,
    aiIntensity: 0,
    realtimeIntensity: 0
  },
  "device-hooks": {
    id: "device-hooks",
    label: "Device Hooks",
    whatItDoes: "Connects push notifications, location, camera, or other device-specific capabilities.",
    whyIncluded: "Valuable only when the product actually needs native device behavior.",
    complexity: 3,
    dataIntensity: 1,
    aiIntensity: 0,
    realtimeIntensity: 1
  },
  "beta-testing": {
    id: "beta-testing",
    label: "Beta Testing",
    whatItDoes: "Prepares controlled release flows for real users before broader launch.",
    whyIncluded: "Critical for mobile and heavier systems once the main workflow is working.",
    complexity: 1,
    dataIntensity: 0,
    aiIntensity: 0,
    realtimeIntensity: 0
  }
};

function moduleCard(moduleId: string, stage: BuildFeatureStage = "Later"): BuildTemplateFeature {
  const definition = moduleRegistry[moduleId];

  if (!definition) {
    throw new Error(`Unknown module "${moduleId}" in Neroa decision engine.`);
  }

  return {
    id: definition.id,
    label: definition.label,
    whatItDoes: definition.whatItDoes,
    whyIncluded: definition.whyIncluded,
    stage
  };
}

const frameworks: Record<string, FrameworkDefinition> = {
  "crypto-analytics-engine": {
    id: "crypto-analytics-engine",
    label: "Crypto Analytics Engine",
    industryId: "crypto-web3",
    buildCategory: "saas",
    templateId: "saas-build",
    recommendationLead:
      "Neroa recommends a focused token analytics product before you widen into a full intelligence platform.",
    architectureSummary:
      "Start with one clear token-centric workflow, then layer in wallet intelligence, risk interpretation, and broader monitoring once the first product loop proves value.",
    appStackValue: "Next.js + Supabase + API integrations + Stripe",
    appStackDetail:
      "Best when you need a subscription-ready web product with external data feeds, accounts, and a cleaner launch path.",
    commercialBuild: true,
    leanModuleIds: ["token-intelligence-dashboard", "billing-subscription"],
    coreModuleIds: ["token-intelligence-dashboard", "user-auth", "billing-subscription", "watchlist-system"],
    expansionModuleIds: ["wallet-tracking", "liquidity-monitor", "ai-risk-summaries", "admin-control-center"],
    optionalModuleIds: ["unlock-vesting-tracker", "whale-alerts", "portfolio-tracker"],
    assignedAgents: ["narua", "atlas", "forge", "repolink", "ops", "pulse"]
  },
  "trading-signal-platform": {
    id: "trading-signal-platform",
    label: "Trading Signal Platform",
    industryId: "finance-trading",
    buildCategory: "saas",
    templateId: "saas-build",
    recommendationLead:
      "Neroa recommends starting with one signal-delivery loop, clear risk framing, and subscription access before adding portfolio depth.",
    architectureSummary:
      "Build a disciplined signal product first, then widen into simulations, tracking, or richer integrations when the core logic earns it.",
    appStackValue: "Next.js + Supabase + Stripe + messaging integrations",
    appStackDetail:
      "Best when the value depends on protected access, recurring billing, and a dependable delivery path.",
    commercialBuild: true,
    leanModuleIds: ["strategy-engine", "signal-delivery-layer", "billing-subscription"],
    coreModuleIds: [
      "strategy-engine",
      "signal-delivery-layer",
      "risk-warning-engine",
      "billing-subscription",
      "user-auth"
    ],
    expansionModuleIds: ["paper-trading", "portfolio-tracker", "notifications"],
    optionalModuleIds: ["analytics", "community-layer"],
    assignedAgents: ["narua", "atlas", "forge", "ops", "pulse"]
  },
  "trading-education-system": {
    id: "trading-education-system",
    label: "Trading Education System",
    industryId: "finance-trading",
    buildCategory: "saas",
    templateId: "saas-build",
    recommendationLead:
      "Neroa recommends a paid education loop first, then richer AI coaching or community after the core curriculum proves retention.",
    architectureSummary:
      "Lead with course delivery, member access, and billing. Add coaching, journaling, or community only when the teaching flow is solid.",
    appStackValue: "Next.js + Supabase + Stripe + video/content delivery",
    appStackDetail:
      "Best when education, paid membership, and progress-based access are central to the product.",
    commercialBuild: true,
    leanModuleIds: ["course-delivery", "member-access", "billing-subscription"],
    coreModuleIds: ["course-delivery", "member-access", "billing-subscription", "user-auth"],
    expansionModuleIds: ["ai-coach", "paper-trading", "analytics"],
    optionalModuleIds: ["community-layer", "portfolio-tracker"],
    assignedAgents: ["narua", "atlas", "nova", "forge", "ops"]
  },
  "ai-automation-platform": {
    id: "ai-automation-platform",
    label: "AI Automation Platform",
    industryId: "ai-automation",
    buildCategory: "saas",
    templateId: "saas-build",
    recommendationLead:
      "Neroa recommends starting with a narrow orchestration workflow instead of pretending one AI assistant can solve everything.",
    architectureSummary:
      "Frame one operational automation loop, then widen into integrations, client workspaces, or CRM depth once the workflow is reliable.",
    appStackValue: "Next.js + Supabase + workflow APIs + Stripe",
    appStackDetail:
      "Best when the product coordinates AI work, recurring tasks, and operational handoffs inside one customer-facing system.",
    commercialBuild: true,
    leanModuleIds: ["workflow-dashboard", "ai-task-orchestration", "billing-subscription"],
    coreModuleIds: [
      "workflow-dashboard",
      "ai-task-orchestration",
      "billing-subscription",
      "user-auth",
      "admin-control-center"
    ],
    expansionModuleIds: ["crm-integration", "client-workspaces", "analytics"],
    optionalModuleIds: ["notifications", "lead-capture"],
    assignedAgents: ["narua", "atlas", "forge", "repolink", "ops"]
  },
  "client-ai-assistant-system": {
    id: "client-ai-assistant-system",
    label: "Client AI System",
    industryId: "ai-automation",
    buildCategory: "external-app",
    templateId: "saas-build",
    recommendationLead:
      "Neroa recommends a customer-facing assistant with one dependable workflow before you widen into broader automation claims.",
    architectureSummary:
      "Start with a clear customer use case, controlled access, and one guided workflow. Add deeper integrations only after usage proves the direction.",
    appStackValue: "Next.js + Supabase + AI API routing + Stripe",
    appStackDetail:
      "Best when the product needs a protected customer-facing interface, recurring value, and clean billing from the first commercial release.",
    commercialBuild: true,
    leanModuleIds: ["customer-portal", "billing-subscription", "user-auth"],
    coreModuleIds: ["customer-portal", "workflow-engine", "billing-subscription", "user-auth"],
    expansionModuleIds: ["ai-task-orchestration", "admin-control-center", "analytics"],
    optionalModuleIds: ["crm-integration", "notifications"],
    assignedAgents: ["narua", "atlas", "forge", "nova", "ops"]
  },
  "niche-saas-system": {
    id: "niche-saas-system",
    label: "Niche SaaS System",
    industryId: "saas-software",
    buildCategory: "saas",
    templateId: "saas-build",
    recommendationLead:
      "Neroa recommends a single paid workflow with clean operations and billing before you widen into every feature idea.",
    architectureSummary:
      "Lead with one dashboard-driven workflow, secure access, and monetization. Add analytics, notifications, and extra controls after the core loop proves demand.",
    appStackValue: "Next.js + Supabase + Stripe",
    appStackDetail:
      "Best for subscription software that needs a disciplined web stack, secure accounts, and a clear launch path.",
    commercialBuild: true,
    leanModuleIds: ["core-dashboard", "user-auth", "billing-subscription"],
    coreModuleIds: ["core-dashboard", "user-auth", "billing-subscription", "workflow-engine"],
    expansionModuleIds: ["admin-control-center", "analytics", "notifications"],
    optionalModuleIds: ["ai-coach", "lead-capture", "community-layer"],
    assignedAgents: ["narua", "atlas", "forge", "ops", "nova"]
  },
  "internal-ops-system": {
    id: "internal-ops-system",
    label: "Internal Ops System",
    industryId: "saas-software",
    buildCategory: "internal-app",
    templateId: "saas-build",
    recommendationLead:
      "Neroa recommends a cleaner internal workflow system before you widen into analytics or automation depth.",
    architectureSummary:
      "Focus on the operational flow, user roles, and the main dashboard first. Expand into analytics or notification depth later.",
    appStackValue: "Next.js + Supabase",
    appStackDetail:
      "Best when the priority is replacing spreadsheets, manual work, or fragmented dashboards with one owned system.",
    commercialBuild: false,
    leanModuleIds: ["workflow-dashboard", "workflow-engine", "user-auth"],
    coreModuleIds: ["workflow-dashboard", "workflow-engine", "user-auth", "admin-control-center"],
    expansionModuleIds: ["analytics", "notifications", "crm-integration"],
    optionalModuleIds: ["ai-task-orchestration", "lead-capture"],
    assignedAgents: ["narua", "atlas", "forge", "ops", "pulse"]
  },
  "commerce-growth-system": {
    id: "commerce-growth-system",
    label: "Commerce Growth System",
    industryId: "ecommerce",
    buildCategory: "external-app",
    templateId: "ecommerce-brand",
    recommendationLead:
      "Neroa recommends a commerce engine that gets to paid conversion quickly, then expands into richer catalog or operational layers.",
    architectureSummary:
      "Lead with the product catalog, conversion path, and payment flow. Expand into marketplace depth or analytics once the purchase loop is working.",
    appStackValue: "Next.js + commerce APIs + Stripe + Supabase",
    appStackDetail:
      "Best when the product needs branded commerce, lead capture, or paid conversion from the first launch path.",
    commercialBuild: true,
    leanModuleIds: ["lead-capture", "billing-subscription", "core-dashboard"],
    coreModuleIds: ["lead-capture", "billing-subscription", "core-dashboard", "analytics"],
    expansionModuleIds: ["marketplace", "notifications", "customer-portal"],
    optionalModuleIds: ["community-layer", "admin-control-center"],
    assignedAgents: ["narua", "atlas", "nova", "forge", "ops"]
  },
  "service-revenue-system": {
    id: "service-revenue-system",
    label: "Service Revenue System",
    industryId: "local-services",
    buildCategory: "external-app",
    templateId: "business-launch",
    recommendationLead:
      "Neroa recommends a lead-and-booking engine that proves revenue before you widen into heavier internal tooling.",
    architectureSummary:
      "Lead with lead capture, booking or quote flow, and the first customer portal. Add dispatch, analytics, or automation once the business loop is earning.",
    appStackValue: "Next.js + Supabase + scheduling integrations + Stripe",
    appStackDetail:
      "Best when a service business needs a public-facing revenue path and a cleaner route into owned operations.",
    commercialBuild: true,
    leanModuleIds: ["lead-capture", "customer-portal", "billing-subscription"],
    coreModuleIds: ["lead-capture", "customer-portal", "billing-subscription", "workflow-dashboard"],
    expansionModuleIds: ["workflow-engine", "analytics", "notifications"],
    optionalModuleIds: ["crm-integration", "admin-control-center"],
    assignedAgents: ["narua", "atlas", "nova", "forge", "ops"]
  },
  "content-membership-system": {
    id: "content-membership-system",
    label: "Content Membership System",
    industryId: "content-media",
    buildCategory: "saas",
    templateId: "saas-build",
    recommendationLead:
      "Neroa recommends a paid content or member-access loop before you widen into broader media operations.",
    architectureSummary:
      "Start with membership access, core delivery, and monetization. Add analytics or community once the recurring value loop is working.",
    appStackValue: "Next.js + Supabase + Stripe + content delivery",
    appStackDetail:
      "Best for premium content, education media, or members-only systems that need access control and recurring revenue.",
    commercialBuild: true,
    leanModuleIds: ["member-access", "billing-subscription", "course-delivery"],
    coreModuleIds: ["member-access", "billing-subscription", "course-delivery", "user-auth"],
    expansionModuleIds: ["analytics", "community-layer", "notifications"],
    optionalModuleIds: ["ai-coach", "admin-control-center"],
    assignedAgents: ["narua", "atlas", "nova", "forge", "ops"]
  },
  "wellness-client-system": {
    id: "wellness-client-system",
    label: "Wellness Client System",
    industryId: "health-wellness",
    buildCategory: "external-app",
    templateId: "saas-build",
    recommendationLead:
      "Neroa recommends a client-facing membership or progress system before you widen into broader practice operations.",
    architectureSummary:
      "Lead with client access, progress or booking workflow, and monetization. Add advanced admin or analytics depth after the first user loop is strong.",
    appStackValue: "Next.js + Supabase + Stripe + scheduling integrations",
    appStackDetail:
      "Best for wellness, coaching, or program-based businesses that need a guided client experience with recurring value.",
    commercialBuild: true,
    leanModuleIds: ["customer-portal", "billing-subscription", "user-auth"],
    coreModuleIds: ["customer-portal", "billing-subscription", "user-auth", "workflow-dashboard"],
    expansionModuleIds: ["analytics", "notifications", "admin-control-center"],
    optionalModuleIds: ["community-layer", "ai-coach"],
    assignedAgents: ["narua", "atlas", "nova", "forge", "ops"]
  },
  "mobile-product-system": {
    id: "mobile-product-system",
    label: "Mobile Product System",
    industryId: "saas-software",
    buildCategory: "mobile-app",
    templateId: "mobile-app-build",
    recommendationLead:
      "Neroa recommends a disciplined mobile MVP with clear navigation and one primary workflow before heavy native expansion.",
    architectureSummary:
      "Start with screen structure, secure access, and the first recurring value loop. Add device hooks or richer beta depth when the workflow is stable.",
    appStackValue: "React Native + Expo + Supabase + Stripe",
    appStackDetail:
      "Best when you need a real iOS and Android path with controlled build speed, shared code, and a cleaner launch workflow.",
    commercialBuild: true,
    leanModuleIds: ["mobile-navigation", "user-auth", "billing-subscription"],
    coreModuleIds: ["mobile-navigation", "user-auth", "billing-subscription", "core-dashboard"],
    expansionModuleIds: ["device-hooks", "beta-testing", "notifications"],
    optionalModuleIds: ["workflow-engine", "analytics"],
    assignedAgents: ["narua", "atlas", "forge", "ops", "pulse"]
  }
};

const productTypes: GuidedBuildProductType[] = [
  { id: "crypto-analytics-platform", industryId: "crypto-web3", label: "Analytics Platform", description: "Token intelligence, wallet visibility, unlock tracking, and paid crypto insights.", buildCategory: "saas", frameworkId: "crypto-analytics-engine" },
  { id: "crypto-trading-tools", industryId: "crypto-web3", label: "Trading Tools", description: "Signals, trade workflows, or decision-support tools tied to crypto markets.", buildCategory: "saas", frameworkId: "trading-signal-platform" },
  { id: "wallet-infrastructure", industryId: "crypto-web3", label: "Wallet / Infrastructure", description: "Wallet-facing experiences, monitoring, or account-level infrastructure products.", buildCategory: "external-app", frameworkId: "crypto-analytics-engine" },
  { id: "signals-strategies", industryId: "crypto-web3", label: "Signals & Strategies", description: "Structured signal delivery, risk framing, or strategy-focused subscription products.", buildCategory: "saas", frameworkId: "trading-signal-platform" },
  { id: "crypto-education-platform", industryId: "crypto-web3", label: "Education Platform", description: "Member access, training, journals, and monetized learning systems for crypto.", buildCategory: "saas", frameworkId: "trading-education-system" },
  { id: "launchpad-presales", industryId: "crypto-web3", label: "Launchpad / Presales", description: "Launch-related information, access control, and community-facing project systems.", buildCategory: "external-app", frameworkId: "crypto-analytics-engine" },
  { id: "internal-ai-ops-tool", industryId: "ai-automation", label: "Internal AI Ops Tool", description: "Internal dashboards and workflow systems that help teams coordinate AI-heavy work.", buildCategory: "internal-app", frameworkId: "internal-ops-system" },
  { id: "client-facing-ai-assistant", industryId: "ai-automation", label: "Client-Facing AI Assistant", description: "Customer-facing assistant surfaces with one focused workflow and stronger execution logic.", buildCategory: "external-app", frameworkId: "client-ai-assistant-system" },
  { id: "workflow-automation-engine", industryId: "ai-automation", label: "Workflow Automation Engine", description: "Operational automation systems that orchestrate tasks, triggers, and AI work.", buildCategory: "saas", frameworkId: "ai-automation-platform" },
  { id: "ai-content-system", industryId: "ai-automation", label: "AI Content System", description: "Content generation or orchestration products with workflow logic and paid usage.", buildCategory: "saas", frameworkId: "ai-automation-platform" },
  { id: "sales-support-automation", industryId: "ai-automation", label: "Sales / Support Automation", description: "Automation products that help teams handle inbound, support, or lead workflows.", buildCategory: "saas", frameworkId: "ai-automation-platform" },
  { id: "internal-dashboard", industryId: "saas-software", label: "Internal Dashboard", description: "Operational dashboards, reporting surfaces, or internal command centers.", buildCategory: "internal-app", frameworkId: "internal-ops-system" },
  { id: "customer-portal", industryId: "saas-software", label: "Customer Portal", description: "Account surfaces, portals, and workflow-driven customer experiences.", buildCategory: "external-app", frameworkId: "client-ai-assistant-system" },
  { id: "marketplace-system", industryId: "saas-software", label: "Marketplace", description: "Two-sided systems with listings, transactions, and operator-side controls.", buildCategory: "external-app", frameworkId: "commerce-growth-system" },
  { id: "crm-workflow-tool", industryId: "saas-software", label: "CRM / Workflow Tool", description: "Workflow-driven business software for managing pipelines, teams, or internal actions.", buildCategory: "saas", frameworkId: "niche-saas-system" },
  { id: "subscription-app", industryId: "saas-software", label: "Subscription App", description: "Paid software products with recurring access and structured user workflows.", buildCategory: "saas", frameworkId: "niche-saas-system" },
  { id: "mobile-product", industryId: "saas-software", label: "Mobile Product", description: "Mobile-first products that need a real iOS/Android build path.", buildCategory: "mobile-app", frameworkId: "mobile-product-system" },
  { id: "trading-signals-platform", industryId: "finance-trading", label: "Signals Platform", description: "Signal delivery, risk framing, and subscription products for finance or trading users.", buildCategory: "saas", frameworkId: "trading-signal-platform" },
  { id: "investor-portal", industryId: "finance-trading", label: "Investor Portal", description: "Portal-based visibility products for investor updates, data, or deal flow.", buildCategory: "external-app", frameworkId: "client-ai-assistant-system" },
  { id: "finance-education-platform", industryId: "finance-trading", label: "Education Platform", description: "Learning systems for traders, investors, or finance-focused communities.", buildCategory: "saas", frameworkId: "trading-education-system" },
  { id: "budget-intelligence-app", industryId: "finance-trading", label: "Budget Intelligence App", description: "Budget visibility or financial planning tools for users or operators.", buildCategory: "saas", frameworkId: "niche-saas-system" },
  { id: "portfolio-tool", industryId: "finance-trading", label: "Portfolio Tracker", description: "Position, allocation, and account tracking products for finance users.", buildCategory: "saas", frameworkId: "trading-signal-platform" },
  { id: "commerce-operations-hub", industryId: "ecommerce", label: "Commerce Operations Hub", description: "Operations surfaces for catalog, orders, and business workflow control.", buildCategory: "internal-app", frameworkId: "commerce-growth-system" },
  { id: "subscription-commerce-system", industryId: "ecommerce", label: "Subscription Commerce System", description: "Recurring commerce products that combine catalog, payments, and member access.", buildCategory: "saas", frameworkId: "commerce-growth-system" },
  { id: "marketplace-storefront", industryId: "ecommerce", label: "Marketplace Storefront", description: "Marketplace commerce flows with listings, payments, and growth-ready expansion.", buildCategory: "external-app", frameworkId: "commerce-growth-system" },
  { id: "catalog-quote-portal", industryId: "ecommerce", label: "Catalog + Quote Portal", description: "Catalog-led quote or lead generation systems for productized businesses.", buildCategory: "external-app", frameworkId: "commerce-growth-system" },
  { id: "brand-growth-dashboard", industryId: "ecommerce", label: "Brand Growth Dashboard", description: "Growth monitoring, operations, or internal execution surfaces for commerce teams.", buildCategory: "internal-app", frameworkId: "internal-ops-system" },
  { id: "lead-generation-system", industryId: "local-services", label: "Lead Generation System", description: "Lead-first service funnels designed to prove revenue quickly.", buildCategory: "external-app", frameworkId: "service-revenue-system" },
  { id: "booking-operations-app", industryId: "local-services", label: "Booking Operations App", description: "Booking, scheduling, or service coordination systems for local businesses.", buildCategory: "external-app", frameworkId: "service-revenue-system" },
  { id: "dispatch-dashboard", industryId: "local-services", label: "Service Dispatch Dashboard", description: "Internal scheduling and dispatch command surfaces for operators.", buildCategory: "internal-app", frameworkId: "internal-ops-system" },
  { id: "quote-request-portal", industryId: "local-services", label: "Quote Request Portal", description: "Customer-facing quote intake and sales workflows for service businesses.", buildCategory: "external-app", frameworkId: "service-revenue-system" },
  { id: "client-care-portal", industryId: "local-services", label: "Client Care Portal", description: "Existing customer service surfaces for bookings, updates, and account access.", buildCategory: "external-app", frameworkId: "service-revenue-system" },
  { id: "member-content-platform", industryId: "content-media", label: "Member Content Platform", description: "Paid access content products with recurring value and structured delivery.", buildCategory: "saas", frameworkId: "content-membership-system" },
  { id: "education-media-hub", industryId: "content-media", label: "Education Media Hub", description: "Media-led learning systems with guided progression and premium access.", buildCategory: "saas", frameworkId: "content-membership-system" },
  { id: "creator-analytics-dashboard", industryId: "content-media", label: "Creator Analytics Dashboard", description: "Dashboards for audience, performance, or growth insights.", buildCategory: "internal-app", frameworkId: "internal-ops-system" },
  { id: "community-platform", industryId: "content-media", label: "Community Platform", description: "Member communities, social experiences, and interaction systems.", buildCategory: "external-app", frameworkId: "content-membership-system" },
  { id: "newsletter-intelligence-system", industryId: "content-media", label: "Newsletter Intelligence System", description: "Content operations and monetization products built around owned audience channels.", buildCategory: "saas", frameworkId: "content-membership-system" },
  { id: "client-progress-portal", industryId: "health-wellness", label: "Client Progress Portal", description: "Progress tracking and client-facing experiences for programs or coaching businesses.", buildCategory: "external-app", frameworkId: "wellness-client-system" },
  { id: "booking-membership-app", industryId: "health-wellness", label: "Booking + Membership App", description: "Recurring access systems combining booking, membership, and client continuity.", buildCategory: "saas", frameworkId: "wellness-client-system" },
  { id: "wellness-coaching-platform", industryId: "health-wellness", label: "Wellness Coaching Platform", description: "Program delivery, content, and client interaction systems for coaching businesses.", buildCategory: "saas", frameworkId: "wellness-client-system" },
  { id: "practice-operations-dashboard", industryId: "health-wellness", label: "Practice Operations Dashboard", description: "Internal operations tooling for teams, staff, and service workflows.", buildCategory: "internal-app", frameworkId: "internal-ops-system" },
  { id: "program-delivery-app", industryId: "health-wellness", label: "Program Delivery App", description: "Customer-facing program access or mobile experiences for wellness products.", buildCategory: "mobile-app", frameworkId: "mobile-product-system" }
];

const customIndustryProductTypes: GuidedBuildProductType[] = [
  {
    id: "custom-analytics-platform",
    industryId: "custom",
    label: "Analytics Platform",
    description: "A data-rich product that turns signals, reporting, or market visibility into one paid user workflow.",
    buildCategory: "saas",
    frameworkId: "crypto-analytics-engine"
  },
  {
    id: "custom-workflow-automation",
    industryId: "custom",
    label: "Workflow Automation Engine",
    description: "A system that coordinates internal or client-facing workflows, AI tasks, and operational handoffs.",
    buildCategory: "saas",
    frameworkId: "ai-automation-platform"
  },
  {
    id: "custom-subscription-app",
    industryId: "custom",
    label: "Subscription App",
    description: "A commercial SaaS product with user access, recurring billing, and a focused value loop.",
    buildCategory: "saas",
    frameworkId: "niche-saas-system"
  },
  {
    id: "custom-internal-dashboard",
    industryId: "custom",
    label: "Internal Dashboard",
    description: "An internal command surface for reporting, coordination, approvals, or operations management.",
    buildCategory: "internal-app",
    frameworkId: "internal-ops-system"
  },
  {
    id: "custom-customer-portal",
    industryId: "custom",
    label: "Customer Portal",
    description: "A client or customer-facing workspace for documents, actions, status, onboarding, or account access.",
    buildCategory: "external-app",
    frameworkId: "client-ai-assistant-system"
  },
  {
    id: "custom-marketplace",
    industryId: "custom",
    label: "Marketplace",
    description: "A two-sided product with listings, transactions, operator controls, and growth-ready expansion paths.",
    buildCategory: "external-app",
    frameworkId: "commerce-growth-system"
  },
  {
    id: "custom-revenue-system",
    industryId: "custom",
    label: "Lead / Booking System",
    description: "A commercial system built around lead capture, quote requests, bookings, or direct service revenue.",
    buildCategory: "external-app",
    frameworkId: "service-revenue-system"
  },
  {
    id: "custom-mobile-product",
    industryId: "custom",
    label: "Mobile Product",
    description: "A product that needs a real iOS and Android path with a guided mobile-first execution setup.",
    buildCategory: "mobile-app",
    frameworkId: "mobile-product-system"
  }
];

const explorationOpportunities: Record<BuildGoalId, GuidedBuildOpportunity[]> = {
  "fast-revenue": [
    { id: "crypto-analytics-opportunity", label: "Crypto Analytics Platforms", industryId: "crypto-web3", productTypeId: "crypto-analytics-platform", whyAttractive: "Recurring subscriptions can happen quickly when the product delivers one sharp intelligence loop.", monetizationModel: "Paid subscriptions and premium research access", difficultyLevel: "Moderate", recommendedStartingSystem: "Crypto Analytics Engine" },
    { id: "local-leads-opportunity", label: "Local Lead Generation Systems", industryId: "local-services", productTypeId: "lead-generation-system", whyAttractive: "Fast revenue often comes from solving a direct inbound or booking problem for a service business.", monetizationModel: "Lead fees, subscriptions, or setup retainers", difficultyLevel: "Lower", recommendedStartingSystem: "Service Revenue System" },
    { id: "ai-automation-opportunity", label: "AI Automation Tools", industryId: "ai-automation", productTypeId: "workflow-automation-engine", whyAttractive: "Businesses pay when automation replaces repetitive work and ties directly to time savings or revenue.", monetizationModel: "Subscription or retained implementation support", difficultyLevel: "Moderate", recommendedStartingSystem: "AI Automation Platform" },
    { id: "trading-education-opportunity", label: "Trading Education Systems", industryId: "finance-trading", productTypeId: "finance-education-platform", whyAttractive: "Education products can sell before the system needs the complexity of a full trading platform.", monetizationModel: "Memberships, paid courses, and premium content", difficultyLevel: "Lower to moderate", recommendedStartingSystem: "Trading Education System" }
  ],
  "scalable-platform": [
    { id: "scale-crypto-opportunity", label: "Crypto Analytics Platforms", industryId: "crypto-web3", productTypeId: "crypto-analytics-platform", whyAttractive: "Data-rich recurring products can widen into watchlists, risk scoring, alerts, and broader research tooling.", monetizationModel: "Tiered subscriptions and premium data access", difficultyLevel: "Moderate to advanced", recommendedStartingSystem: "Crypto Analytics Engine" },
    { id: "scale-ai-automation-opportunity", label: "AI Automation Tools", industryId: "ai-automation", productTypeId: "workflow-automation-engine", whyAttractive: "Workflow automation products can expand across clients, teams, and integration depth over time.", monetizationModel: "Usage or subscription pricing with team expansion", difficultyLevel: "Moderate to advanced", recommendedStartingSystem: "AI Automation Platform" },
    { id: "scale-niche-saas-opportunity", label: "Niche SaaS Tools", industryId: "saas-software", productTypeId: "subscription-app", whyAttractive: "Focused SaaS products scale best when they start with one paid workflow and widen intentionally.", monetizationModel: "Recurring subscription tiers", difficultyLevel: "Moderate", recommendedStartingSystem: "Niche SaaS System" },
    { id: "scale-commerce-opportunity", label: "Commerce Systems", industryId: "ecommerce", productTypeId: "subscription-commerce-system", whyAttractive: "Commerce systems can move from direct sales into richer catalog, retention, or marketplace layers.", monetizationModel: "Commerce revenue, subscriptions, or platform take rates", difficultyLevel: "Moderate to advanced", recommendedStartingSystem: "Commerce Growth System" }
  ],
  "learn-experiment": [
    { id: "learn-ai-opportunity", label: "AI Automation Tools", industryId: "ai-automation", productTypeId: "internal-ai-ops-tool", whyAttractive: "A lighter internal AI tool is a strong way to learn real automation workflows without forcing full public-product complexity.", monetizationModel: "Internal operating leverage first, paid product later", difficultyLevel: "Lower to moderate", recommendedStartingSystem: "Internal Ops System" },
    { id: "learn-saas-opportunity", label: "Niche SaaS Tools", industryId: "saas-software", productTypeId: "crm-workflow-tool", whyAttractive: "Focused software products teach structure, monetization, and product discipline without the scope of a giant platform.", monetizationModel: "Recurring subscription", difficultyLevel: "Moderate", recommendedStartingSystem: "Niche SaaS System" },
    { id: "learn-content-opportunity", label: "Content Membership Systems", industryId: "content-media", productTypeId: "member-content-platform", whyAttractive: "Membership products create a commercial loop quickly while staying lighter than a dense multi-tool SaaS.", monetizationModel: "Membership access and premium content", difficultyLevel: "Lower to moderate", recommendedStartingSystem: "Content Membership System" },
    { id: "learn-services-opportunity", label: "Local Lead Generation Systems", industryId: "local-services", productTypeId: "quote-request-portal", whyAttractive: "Service funnels are often faster to test than heavy platforms and still teach real acquisition logic.", monetizationModel: "Lead fees, retainers, or booking revenue", difficultyLevel: "Lower", recommendedStartingSystem: "Service Revenue System" }
  ]
};

const planOrder: PricingPlanId[] = ["free", "starter", "builder", "pro", "command-center"];

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function uniqueModuleIds(moduleIds: string[]) {
  return moduleIds.filter(
    (moduleId, index, collection) => collection.indexOf(moduleId) === index
  );
}

function getIndustry(industryId: BuildIndustryId | null | undefined) {
  return industries.find((item) => item.id === industryId) ?? null;
}

function getGoal(goalId: BuildGoalId | null | undefined) {
  return goals.find((item) => item.id === goalId) ?? null;
}

function getExperienceLevel(experienceLevelId: BuildExperienceLevelId | null | undefined) {
  return experienceLevels.find((item) => item.id === experienceLevelId) ?? null;
}

function getBuildPreference(buildPreferenceId: BuildPreferenceId | null | undefined) {
  return buildPreferences.find((item) => item.id === buildPreferenceId) ?? null;
}

function getFramework(frameworkId: string) {
  return frameworks[frameworkId] ?? null;
}

function getProductType(productTypeId: string | null | undefined) {
  return productTypes.find((item) => item.id === productTypeId) ?? null;
}

function moduleCardsFromIds(moduleIds: string[], stage: BuildFeatureStage) {
  return moduleIds.map((moduleId) => moduleCard(moduleId, stage));
}

function planRank(planId: PricingPlanId | null | undefined) {
  if (!planId) {
    return -1;
  }

  return planOrder.indexOf(planId);
}

function chooseTemplateId(categoryId: BuildCategoryId, industryId: BuildIndustryId) {
  if (categoryId === "mobile-app") {
    return "mobile-app-build" as const;
  }

  if (industryId === "ecommerce") {
    return "ecommerce-brand" as const;
  }

  if (industryId === "local-services" && categoryId === "external-app") {
    return "business-launch" as const;
  }

  return "saas-build" as const;
}

function buildSuggestedWorkingName(
  productType: GuidedBuildProductType,
  industry: Pick<GuidedBuildIndustry, "label">
) {
  const cleaned = productType.label.replace(" / ", " ").replace(/\s+/g, " ").trim();

  if (cleaned.toLowerCase().includes("platform") || cleaned.toLowerCase().includes("system")) {
    return `${industry.label.replace(" & ", " ").replace(" / ", " ")} ${cleaned}`;
  }

  return `${industry.label.replace(" & ", " ").replace(" / ", " ")} ${cleaned} System`;
}

export function buildSuggestedEngineName(rawValue: string | null | undefined, categoryLabel = "Engine") {
  const trimmed = rawValue?.trim() ?? "";

  if (!trimmed) {
    return `${categoryLabel} Engine`;
  }

  if (/engine$/i.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed} Engine`;
}

function buildSelectedModuleIds(args: {
  framework: FrameworkDefinition;
  goalId: BuildGoalId;
  experienceLevelId: BuildExperienceLevelId;
  buildPreferenceId: BuildPreferenceId;
  manualModuleIds?: string[] | null;
}) {
  const manualModuleIds = uniqueModuleIds(args.manualModuleIds ?? []);
  const beginnerBias = args.experienceLevelId === "beginner";
  const leanBias =
    args.goalId === "fast-revenue" ||
    args.goalId === "learn-experiment" ||
    args.buildPreferenceId === "start-lean-upgrade-later";
  const scaleBias = args.goalId === "scalable-platform" && args.experienceLevelId !== "beginner";

  let selected = leanBias || beginnerBias ? args.framework.leanModuleIds : args.framework.coreModuleIds;

  if (scaleBias) {
    selected = [...selected, ...args.framework.expansionModuleIds.slice(0, 1)];
  }

  if (args.buildPreferenceId === "manual-modules" && manualModuleIds.length > 0) {
    const allowedManualIds = new Set([
      ...args.framework.expansionModuleIds,
      ...args.framework.optionalModuleIds
    ]);
    selected = [
      ...selected,
      ...manualModuleIds.filter((moduleId) => allowedManualIds.has(moduleId))
    ];
  }

  if (args.framework.commercialBuild && !selected.includes("billing-subscription")) {
    selected = [...selected, "billing-subscription"];
  }

  return uniqueModuleIds(selected);
}

function buildComplexityScore(args: {
  framework: FrameworkDefinition;
  selectedModuleIds: string[];
  goalId: BuildGoalId;
  experienceLevelId: BuildExperienceLevelId;
  buildPreferenceId: BuildPreferenceId;
}) {
  const moduleScore = args.selectedModuleIds.reduce((total, moduleId) => {
    const definition = moduleRegistry[moduleId];

    if (!definition) {
      return total;
    }

    return (
      total +
      definition.complexity * 2 +
      definition.dataIntensity * 2 +
      definition.aiIntensity * 3 +
      definition.realtimeIntensity
    );
  }, 0);

  let score = moduleScore;

  if (args.goalId === "scalable-platform") {
    score += 8;
  }

  if (args.goalId === "fast-revenue") {
    score += 4;
  }

  if (args.buildPreferenceId === "manual-modules") {
    score += 3;
  }

  if (args.experienceLevelId === "advanced") {
    score += 4;
  }

  if (args.framework.buildCategory === "mobile-app") {
    score += 6;
  }

  return score;
}

function resolveComplexityLabel(score: number): ComplexityLabel {
  if (score >= 48) {
    return "Advanced";
  }

  if (score >= 28) {
    return "Moderate";
  }

  return "Lean";
}

function buildComplexitySummary(args: {
  complexityLabel: ComplexityLabel;
  goal: GuidedBuildGoal;
  framework: FrameworkDefinition;
}) {
  if (args.complexityLabel === "Advanced") {
    return `This route is ambitious. ${args.framework.label} can support it, but the first build should expect heavier planning, stronger execution sequencing, and a richer plan tier.`;
  }

  if (args.complexityLabel === "Moderate") {
    return "This route is commercially realistic without trying to do everything at once. Neroa keeps the first system focused enough to ship while still leaving room to widen later.";
  }

  return `This route stays intentionally lean. Neroa is biasing the first build toward speed, clarity, and a smaller first commercial loop for ${args.goal.label.toLowerCase()}.`;
}

function resolveRecommendedTier(args: {
  complexityScore: number;
  goalId: BuildGoalId;
  buildCategory: BuildCategoryId;
  selectedModuleCount: number;
}) {
  if (args.complexityScore >= 70 || args.selectedModuleCount >= 7) {
    return "command-center" as const;
  }

  if (
    args.complexityScore >= 52 ||
    args.buildCategory === "mobile-app" ||
    (args.goalId === "scalable-platform" && args.selectedModuleCount >= 5)
  ) {
    return "pro" as const;
  }

  if (args.complexityScore >= 30 || args.selectedModuleCount >= 4) {
    return "builder" as const;
  }

  return "starter" as const;
}

function buildPricingGateNotice(args: {
  selectedPlanId: PricingPlanId | null | undefined;
  recommendedTierId: PricingPlanId;
  framework: FrameworkDefinition;
  complexityLabel: ComplexityLabel;
}) {
  if (!args.selectedPlanId || planRank(args.selectedPlanId) >= planRank(args.recommendedTierId)) {
    return null;
  }

  const selectedPlan = getPricingPlan(args.selectedPlanId);
  const recommendedPlan = getPricingPlan(args.recommendedTierId);

  return `Neroa recommends ${recommendedPlan?.label ?? "a higher tier"} because ${args.framework.label.toLowerCase()} with ${args.complexityLabel.toLowerCase()} complexity will put pressure on Engine Credits, module depth, and execution support faster than ${selectedPlan?.label ?? "the selected plan"} was designed for.`;
}

function resolveExecutionIntensity(args: {
  complexityLabel: ComplexityLabel;
  selectedModuleCount: number;
  framework: FrameworkDefinition;
}) {
  if (args.complexityLabel === "Advanced" || args.selectedModuleCount >= 7) {
    return "High";
  }

  if (args.complexityLabel === "Moderate" || args.framework.buildCategory === "mobile-app") {
    return "Moderate";
  }

  return "Focused";
}

function resolveUiDensity(args: {
  experienceLevelId: BuildExperienceLevelId;
  buildPreferenceId: BuildPreferenceId;
  complexityLabel: ComplexityLabel;
}): UiDensity {
  if (args.buildPreferenceId === "start-lean-upgrade-later" || args.experienceLevelId === "beginner") {
    return "calm";
  }

  if (args.complexityLabel === "Advanced" || args.experienceLevelId === "advanced") {
    return "dense";
  }

  return "balanced";
}

function resolveVariation(seed: string) {
  const hash = hashString(seed);
  const layoutOptions: Array<{ id: VariationLayoutId; label: string }> = [
    { id: "mission-control", label: "Mission control layout" },
    { id: "guided-operator", label: "Guided operator layout" },
    { id: "focus-column", label: "Focused build layout" }
  ];
  const navigationOptions: VariationNavigationId[] = ["left-rail", "hybrid", "top-tabs"];
  const layout = layoutOptions[hash % layoutOptions.length];
  const navigation = navigationOptions[Math.floor(hash / 7) % navigationOptions.length];

  return {
    variationSeed: seed,
    variationLayoutId: layout.id,
    variationLayoutLabel: layout.label,
    variationNavigationId: navigation
  };
}

function buildRecommendationReason(args: {
  industry: GuidedBuildIndustry;
  productType: GuidedBuildProductType;
  framework: FrameworkDefinition;
  goal: GuidedBuildGoal;
  experienceLevel: GuidedBuildExperienceLevel;
  buildPreference: GuidedBuildPreference;
  complexityLabel: ComplexityLabel;
  pricingGateNotice: string | null;
}) {
  const lines = [
    `${args.framework.recommendationLead} This route fits ${args.productType.label.toLowerCase()} work inside ${args.industry.label}.`,
    args.goal.id === "fast-revenue"
      ? "Because the goal is fast revenue, Neroa keeps the first release closer to a paid workflow than a feature-heavy platform."
      : args.goal.id === "scalable-platform"
        ? "Because the goal is scale, Neroa keeps monetization, architecture, and expansion readiness visible from the start."
        : "Because the goal is learning and validation, Neroa trims avoidable complexity so the first build can teach you something quickly.",
    args.experienceLevel.id === "beginner"
      ? "Because the current experience level is beginner, Neroa deliberately holds back heavier modules until the first system proves its core value."
      : args.experienceLevel.id === "advanced"
        ? "Because the current experience level is advanced, Neroa allows a denser configuration without pretending every optional module belongs in version one."
        : "Because the current experience level is intermediate, Neroa balances speed with a cleaner system foundation.",
    args.buildPreference.id === "manual-modules"
      ? "You asked for manual module control, so Neroa keeps the framework opinionated while leaving expansion choices in your hands."
      : args.buildPreference.id === "start-lean-upgrade-later"
        ? "You asked to start lean, so Neroa is biasing the module set toward a smaller first release and a clearer upgrade path."
        : "You asked Neroa to choose the best route, so the system is biasing toward the cleanest commercially credible starting architecture.",
    args.pricingGateNotice
      ? args.pricingGateNotice
      : `The current scope sits in the ${args.complexityLabel.toLowerCase()} range, which keeps the recommended plan and architecture aligned.`
  ];

  return lines.join(" ");
}

function buildRoadmap(args: {
  framework: FrameworkDefinition;
  selectedModuleIds: string[];
  buildCategory: BuildCategoryId;
  goalId: BuildGoalId;
}) {
  const selectedModules = new Set(args.selectedModuleIds);

  if (args.framework.id === "crypto-analytics-engine") {
    const roadmap = ["Foundation", "Token Data Layer"];

    if (selectedModules.has("wallet-tracking")) {
      roadmap.push("Wallet Tracking");
    }

    if (selectedModules.has("liquidity-monitor")) {
      roadmap.push("Liquidity Monitoring");
    }

    if (selectedModules.has("ai-risk-summaries")) {
      roadmap.push("AI Risk Summaries");
    }

    roadmap.push("Billing + Subscription", "Launch Setup");
    return roadmap;
  }

  if (args.buildCategory === "mobile-app") {
    return [
      "Foundation",
      "Mobile Navigation",
      "Core Workflow",
      selectedModules.has("device-hooks") ? "Device Hooks" : "Account Access",
      "Billing + Subscription",
      "Launch Setup"
    ];
  }

  if (args.goalId === "fast-revenue") {
    return ["Foundation", "Core Workflow", "Billing + Subscription", "Launch Setup"];
  }

  return [
    "Foundation",
    "Core Workflow",
    "User Access",
    selectedModules.has("workflow-engine") ? "Workflow Engine" : "Product Modules",
    "Billing + Subscription",
    "Launch Setup"
  ];
}

function estimateTotalCreditsRequired(args: {
  framework: FrameworkDefinition;
  selectedModuleIds: string[];
  complexityScore: number;
  goalId: BuildGoalId;
  experienceLevelId: BuildExperienceLevelId;
  buildPreferenceId: BuildPreferenceId;
}) {
  const baseByCategory: Record<BuildCategoryId, number> = {
    saas: 6000,
    "internal-app": 4800,
    "external-app": 5600,
    "mobile-app": 8200
  };

  let total =
    baseByCategory[args.framework.buildCategory] +
    args.complexityScore * 185 +
    args.selectedModuleIds.length * 850;

  if (args.goalId === "scalable-platform") {
    total += 3200;
  }

  if (args.goalId === "fast-revenue") {
    total -= 800;
  }

  if (args.experienceLevelId === "advanced") {
    total += 1800;
  }

  if (args.buildPreferenceId === "manual-modules") {
    total += 1400;
  }

  return Math.max(1500, Math.round(total / 50) * 50);
}

function estimateTimeline(args: {
  complexityLabel: ComplexityLabel;
  buildCategory: BuildCategoryId;
  goalId: BuildGoalId;
  selectedModuleCount: number;
}) {
  const baseWeeks =
    args.complexityLabel === "Advanced"
      ? 16
      : args.complexityLabel === "Moderate"
        ? 10
        : 6;

  let totalWeeks = baseWeeks + Math.max(args.selectedModuleCount - 2, 0);

  if (args.buildCategory === "mobile-app") {
    totalWeeks += 3;
  }

  if (args.goalId === "fast-revenue") {
    totalWeeks = Math.max(totalWeeks - 2, 4);
  }

  const minWeeks = Math.max(totalWeeks - 2, 3);
  const maxWeeks = totalWeeks + 3;

  return {
    label: `${minWeeks}-${maxWeeks} weeks`,
    detail:
      args.complexityLabel === "Advanced"
        ? "This is a larger scoped build. Expect phased execution and stronger delivery discipline."
        : args.complexityLabel === "Moderate"
          ? "This is a meaningful build path with room for a launch-ready first release."
          : "This is a leaner scoped path designed to stay closer to a first commercial release."
  };
}

function buildManagedBuildRecommendation(args: {
  complexityLabel: ComplexityLabel;
  estimatedTotalCreditsRequired: number;
  includedMonthlyCredits: number | null;
  buildCategory: BuildCategoryId;
}) {
  const monthsOnSelectedPlan =
    args.includedMonthlyCredits && args.includedMonthlyCredits > 0
      ? Math.ceil(args.estimatedTotalCreditsRequired / args.includedMonthlyCredits)
      : null;

  if (
    args.complexityLabel === "Advanced" ||
    args.buildCategory === "mobile-app" ||
    (monthsOnSelectedPlan !== null && monthsOnSelectedPlan >= 4)
  ) {
    return "Managed Build is worth considering here if you want Neroa or the team to accelerate execution, QA, deployment, and launch support for a larger scope.";
  }

  return undefined;
}

function buildNextSteps(args: {
  framework: FrameworkDefinition;
  productType: GuidedBuildProductType;
  goal: GuidedBuildGoal;
  complexityLabel: ComplexityLabel;
  recommendedTierLabel: string;
}) {
  return [
    `Lock the first ${args.productType.label.toLowerCase()} value path before widening into extra modules.`,
    `Use Strategy and Scope to translate ${args.framework.label.toLowerCase()} into a sharper MVP sequence for ${args.goal.label.toLowerCase()}.`,
    `Keep the first build ${args.complexityLabel === "Lean" ? "lean enough to launch quickly" : "structured enough to justify the recommended plan tier"}.`,
    `Move into Build only after the first commercial or validation loop is clear inside ${args.recommendedTierLabel}.`
  ];
}

export function getGuidedBuildIndustries() {
  return industries;
}

export function getGuidedBuildGoals() {
  return goals;
}

export function getGuidedBuildExperienceLevels() {
  return experienceLevels;
}

export function getGuidedBuildPreferences() {
  return buildPreferences;
}

export function getGuidedBuildOpportunities(goalId: BuildGoalId | null | undefined) {
  return goalId ? explorationOpportunities[goalId] ?? [] : [];
}

export function getGuidedBuildProductTypes(industryId: BuildIndustryId | null | undefined) {
  if (industryId === "custom") {
    return customIndustryProductTypes;
  }

  return productTypes.filter((item) => item.industryId === industryId);
}

export function getGuidedBuildProductType(productTypeId: string | null | undefined) {
  return getProductType(productTypeId);
}

export function getManualModuleChoices(productTypeId: string | null | undefined) {
  const productType = getProductType(productTypeId);
  const framework = productType ? getFramework(productType.frameworkId) : null;

  if (!framework) {
    return {
      expansion: [] as BuildTemplateFeature[],
      optional: [] as BuildTemplateFeature[]
    };
  }

  return {
    expansion: moduleCardsFromIds(framework.expansionModuleIds, "Later"),
    optional: moduleCardsFromIds(framework.optionalModuleIds, "Later")
  };
}

export function inferBuildCategoryFromProductType(productTypeId: string | null | undefined) {
  return getProductType(productTypeId)?.buildCategory ?? null;
}

export function buildGuidedBuildBlueprint(args: {
  entryMode: BuildEntryMode;
  industryId: BuildIndustryId;
  customIndustry?: string | null;
  productTypeId: string;
  goalId: BuildGoalId;
  experienceLevelId: BuildExperienceLevelId;
  buildPreferenceId: BuildPreferenceId;
  selectedPlanId?: PricingPlanId | null;
  selectedModuleIds?: string[] | null;
  engineName?: string | null;
  workingIdeaName?: string | null;
  projectSummary?: string | null;
}) {
  const customIndustry = args.customIndustry?.trim() || "";
  const industry =
    args.industryId === "custom"
      ? customIndustry
        ? {
            id: "custom" as const,
            label: customIndustry,
            description:
              "A custom industry path where Neroa uses the product type and business goal to shape the right starting system."
          }
        : null
      : getIndustry(args.industryId);
  const productType = getProductType(args.productTypeId);
  const goal = getGoal(args.goalId);
  const experienceLevel = getExperienceLevel(args.experienceLevelId);
  const buildPreference = getBuildPreference(args.buildPreferenceId);

  if (!industry || !productType || !goal || !experienceLevel || !buildPreference) {
    throw new Error("Complete the decision flow before Neroa builds the system blueprint.");
  }

  const framework = getFramework(productType.frameworkId);

  if (!framework) {
    throw new Error("Neroa could not resolve the framework behind this product type.");
  }

  const selectedModuleIds = buildSelectedModuleIds({
    framework,
    goalId: args.goalId,
    experienceLevelId: args.experienceLevelId,
    buildPreferenceId: args.buildPreferenceId,
    manualModuleIds: args.selectedModuleIds
  });
  const requiredModuleCards = moduleCardsFromIds(selectedModuleIds, "MVP");
  const expansionModuleCards = moduleCardsFromIds(
    framework.expansionModuleIds.filter((moduleId) => !selectedModuleIds.includes(moduleId)),
    "Later"
  );
  const optionalModuleCards = moduleCardsFromIds(
    framework.optionalModuleIds.filter((moduleId) => !selectedModuleIds.includes(moduleId)),
    "Later"
  );
  const complexityScore = buildComplexityScore({
    framework,
    selectedModuleIds,
    goalId: args.goalId,
    experienceLevelId: args.experienceLevelId,
    buildPreferenceId: args.buildPreferenceId
  });
  const complexityLabel = resolveComplexityLabel(complexityScore);
  const complexitySummary = buildComplexitySummary({
    complexityLabel,
    goal,
    framework
  });
  const recommendedTierId = resolveRecommendedTier({
    complexityScore,
    goalId: args.goalId,
    buildCategory: framework.buildCategory,
    selectedModuleCount: selectedModuleIds.length
  });
  const recommendedTierLabel = getPricingPlan(recommendedTierId)?.label ?? "Builder";
  const selectedPlan = args.selectedPlanId ? getPricingPlan(args.selectedPlanId) : null;
  const includedMonthlyEngineCredits =
    selectedPlan?.capacity.includedExecutionCreditsMonthly ?? null;
  const estimatedTotalCreditsRequired = estimateTotalCreditsRequired({
    framework,
    selectedModuleIds,
    complexityScore,
    goalId: args.goalId,
    experienceLevelId: args.experienceLevelId,
    buildPreferenceId: args.buildPreferenceId
  });
  const estimatedCreditOverage = includedMonthlyEngineCredits
    ? Math.max(estimatedTotalCreditsRequired - includedMonthlyEngineCredits, 0)
    : 0;
  const timelineEstimate = estimateTimeline({
    complexityLabel,
    buildCategory: framework.buildCategory,
    goalId: args.goalId,
    selectedModuleCount: selectedModuleIds.length
  });
  const recommendedCreditPack =
    estimatedCreditOverage > 0 ? getRecommendedExecutionCreditPack(estimatedCreditOverage) : null;
  const pricingGateNotice = buildPricingGateNotice({
    selectedPlanId: args.selectedPlanId ?? null,
    recommendedTierId,
    framework,
    complexityLabel
  });
  const creditPoolWarning =
    estimatedCreditOverage > 0 ? scopedOverageGuidance : undefined;
  const managedBuildRecommendation = buildManagedBuildRecommendation({
    complexityLabel,
    estimatedTotalCreditsRequired,
    includedMonthlyCredits: includedMonthlyEngineCredits,
    buildCategory: framework.buildCategory
  });
  const executionIntensity = resolveExecutionIntensity({
    complexityLabel,
    selectedModuleCount: selectedModuleIds.length,
    framework
  });
  const uiDensity = resolveUiDensity({
    experienceLevelId: args.experienceLevelId,
    buildPreferenceId: args.buildPreferenceId,
    complexityLabel
  });
  const workingIdeaName =
    args.workingIdeaName?.trim() || buildSuggestedWorkingName(productType, industry);
  const engineName = buildSuggestedEngineName(
    args.engineName?.trim() || workingIdeaName,
    buildCategoryLabels[framework.buildCategory]
  );
  const projectSummary =
    args.projectSummary?.trim() ||
    `${workingIdeaName} is a ${productType.label.toLowerCase()} inside ${industry.label}. ${framework.architectureSummary}`;
  const recommendationReason = buildRecommendationReason({
    industry,
    productType,
    framework,
    goal,
    experienceLevel,
    buildPreference,
    complexityLabel,
    pricingGateNotice
  });
  const variation = resolveVariation(
    `${args.entryMode}:${industry.id}:${productType.id}:${goal.id}:${experienceLevel.id}:${buildPreference.id}:${workingIdeaName}`
  );
  const roadmapSteps = buildRoadmap({
    framework,
    selectedModuleIds,
    buildCategory: framework.buildCategory,
    goalId: goal.id
  });
  const nextStepChecklist = buildNextSteps({
    framework,
    productType,
    goal,
    complexityLabel,
    recommendedTierLabel
  });

  return {
    categoryId: framework.buildCategory,
    buildCategory: framework.buildCategory,
    categoryLabel: buildCategoryLabels[framework.buildCategory],
    templateKind: "predefined" as const,
    templateIdeaId: productType.id,
    templateIdeaLabel: workingIdeaName,
    selectedTemplateId: framework.id,
    selectedTemplateName: framework.label,
    engineName,
    generatedSummary: projectSummary,
    projectSummary,
    templateId: chooseTemplateId(framework.buildCategory, industry.id),
    laneStructure: [...standardLaneStructure],
    primaryBuildPathLabel: "Recommended App Stack" as const,
    primaryBuildPathValue: framework.appStackValue,
    primaryBuildPathDetail: framework.appStackDetail,
    featureCards: requiredModuleCards,
    selectedModuleIds,
    selectedFeatures: requiredModuleCards.map((item) => item.label),
    recommendedBuildPath: framework.appStackValue,
    naroaRecommendation: recommendationReason,
    buildRoadmap: roadmapSteps,
    nextStepChecklist,
    assignedAgents: framework.assignedAgents,
    createdFromOnboarding: true as const,
    entryMode: args.entryMode,
    industryId: industry.id,
    industryLabel: industry.label,
    customIndustry: industry.id === "custom" ? customIndustry : undefined,
    industryGroup: industry.id === "custom" ? "Custom" : industry.label,
    industryDetail: industry.id === "custom" ? customIndustry : industry.label,
    goalId: goal.id,
    goalLabel: goal.label,
    experienceLevelId: experienceLevel.id,
    experienceLevelLabel: experienceLevel.label,
    buildPreferenceId: buildPreference.id,
    buildPreferenceLabel: buildPreference.label,
    recommendedFrameworkId: framework.id,
    recommendedFrameworkLabel: framework.label,
    recommendedTierId,
    recommendedTierLabel,
    selectedPlanId: selectedPlan?.id,
    selectedPlanLabel: selectedPlan?.label,
    includedMonthlyEngineCredits: includedMonthlyEngineCredits ?? undefined,
    estimatedTotalCreditsRequired,
    estimatedCreditOverage,
    estimatedTimeline: timelineEstimate.label,
    estimatedTimelineDetail: timelineEstimate.detail,
    recommendedCreditPackLabel: recommendedCreditPack
      ? `${recommendedCreditPack.label} (${recommendedCreditPack.credits.toLocaleString("en-US")} credits)`
      : undefined,
    recommendedCreditPackDetail: recommendedCreditPack?.detail,
    managedBuildRecommendation,
    creditPoolWarning,
    scopeExecutionNote: planScopedEstimateSupport,
    recommendationReason,
    pricingGateNotice: pricingGateNotice ?? undefined,
    complexityScore,
    complexityLabel,
    complexitySummary,
    executionIntensity,
    uiDensity,
    variationSeed: variation.variationSeed,
    variationLayoutId: variation.variationLayoutId,
    variationLayoutLabel: variation.variationLayoutLabel,
    variationNavigationId: variation.variationNavigationId,
    requiredModuleCards,
    expansionModuleCards,
    optionalModuleCards
  } satisfies GuidedBuildBlueprint;
}
