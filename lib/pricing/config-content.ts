export type PricingPlanId = "free" | "starter" | "builder" | "pro" | "command-center";

export type PricingPlanCategory = "trial" | "validation" | "build" | "scale" | "agency";
export type PricingAudience = "founder" | "agency";

export type BillingIntervalId = "monthly" | "annual";

export type BillingInterval = {
  id: BillingIntervalId;
  label: string;
  months: number;
  discountRate: number;
  savingsLabel: string;
  helperText: string;
};

export type ExecutionCreditPack = {
  id: string;
  credits: number;
  price: number;
  label: string;
  detail: string;
};

export type GrowthLayerScenario = {
  id: string;
  label: string;
  description: string;
  totalCredits: number;
  targetAcceleratedMonths: number;
  defaultPlanId: PricingPlanId;
  complexity: "moderate" | "high" | "extreme";
  bestFor: string;
};

export type GrowthUpgrade = {
  id: string;
  label: string;
  pricing: string;
  detail: string;
  features: string[];
  availability: string;
};

export type CreditPackMixItem = {
  pack: ExecutionCreditPack;
  quantity: number;
};

export type ExecutionCreditAction = {
  id: string;
  label: string;
  creditsLabel: string;
  detail: string;
};

export type PricingAddOn = {
  id: string;
  label: string;
  pricing: string;
  detail: string;
  availability: string;
};

export type ExecutionCreditUsageNotification = {
  threshold: number;
  label: string;
  detail: string;
};

export const pricingScopeDisclaimer =
  "Your subscription gives you access, guidance, and monthly Engine Credits. Full build speed depends on your scope and available credits. Large or complex builds may require more credits, scope reduction, a higher plan, or a managed build package.";

export const planScopedEstimateHeadline =
  "Neroa estimates the credit cost after your scope is defined.";

export const planScopedEstimateSupport =
  "Plan includes monthly access and Engine Credits. Final build effort depends on scope.";

export const scopedOverageGuidance =
  "This scope exceeds your current monthly Engine Credit pool. You can simplify the project, use multiple months of credits, buy a credit pack, upgrade, or request a managed build quote.";

export const pricingTermDefinitions = [
  {
    term: "Subscription",
    definition: "Access to Neroa plus a monthly Engine Credit pool."
  },
  {
    term: "Credits",
    definition: "The actual AI and build consumption used by guided planning, execution, and launch work."
  },
  {
    term: "Managed Build",
    definition: "Neroa or team-assisted execution, QA, deployment, and management for scopes that need more than guided self-serve support."
  }
] as const;

export const planningVsBuildProjectsDefinition =
  "Planning engines are not build slots. Active build projects are scoped execution lanes with real Engine Credit usage and plan-based limits.";

export type PricingPlanCapacity = {
  aiSystemsIncluded: number | null;
  aiSystemsNote: string;
  activeWorkspaces: number | null;
  activeWorkspacesNote: string;
  activePlanningEngines: number | null;
  activePlanningEnginesNote: string;
  activeBuildProjects: number | null;
  activeBuildProjectsNote: string;
  teamSeatsIncluded: number | null;
  teamSeatsNote: string;
  additionalSeatPriceMonthly: number | null;
  additionalSeatNote: string;
  includedExecutionCreditsMonthly: number | null;
  includedExecutionCreditsNote: string;
  extraExecutionCreditsNote: string;
  hardCapControlsNote: string;
};

export type PricingPlan = {
  id: PricingPlanId;
  label: string;
  shortLabel: string;
  audience: PricingAudience;
  category: PricingPlanCategory;
  priceMonthly: number | null;
  launchEnabled: boolean;
  trialDays: number | null;
  targetUser: string;
  bestFor: string;
  whatYouGet: string[];
  workflowAccess: string[];
  whyItMatters: string;
  usageIncluded: string;
  agentAccess: string;
  exportsAndHandoffs: string;
  integrationsAccess: string;
  upgradeTrigger: string;
  marketComparison: string;
  usageBandLabel: string;
  capacity: PricingPlanCapacity;
  exclusions?: string[];
};

export type ManagedBuildPackage = {
  id: string;
  label: string;
  buildFeeRange: string;
  monthlyManagementRange: string;
  summary: string;
  includes: string[];
  excludes: string[];
};

export const publicBillingIntervals: BillingInterval[] = [
  {
    id: "monthly",
    label: "Monthly",
    months: 1,
    discountRate: 0,
    savingsLabel: "Standard monthly billing",
    helperText: "Flexible month-to-month access."
  },
  {
    id: "annual",
    label: "Annual",
    months: 12,
    discountRate: 0.12,
    savingsLabel: "Save 12% with annual billing",
    helperText: "Lower effective monthly cost with a yearly commitment."
  }
];

export const executionCreditActions: ExecutionCreditAction[] = [
  {
    id: "strategy-scope",
    label: "Strategy and scope definition",
    creditsLabel: "15-35 credits",
    detail:
      "Used when Neroa shapes the problem, audience, scope, and first execution path for a new engine."
  },
  {
    id: "mvp-planning",
    label: "MVP planning",
    creditsLabel: "30-60 credits",
    detail:
      "Used to reduce the concept to a testable first build with clearer priorities and deliverables."
  },
  {
    id: "budget-analysis",
    label: "Budget analysis",
    creditsLabel: "20-45 credits",
    detail:
      "Used for cost framing, stack review, timeline tradeoffs, and decision support before build spend accelerates."
  },
  {
    id: "ai-coordination",
    label: "Coordinated AI runs",
    creditsLabel: "45-120 credits",
    detail:
      "Used when Neroa brings in specialist systems for build planning, launch prep, design direction, or operating support."
  },
  {
    id: "build-workflow",
    label: "Build workflow assistance",
    creditsLabel: "50-110 credits",
    detail:
      "Used for scoped feature plans, implementation workflow support, testing guidance, and structured execution steps."
  },
  {
    id: "exports-handoffs",
    label: "Exports and handoffs",
    creditsLabel: "15-30 credits",
    detail:
      "Used for roadmap exports, handoff packets, reporting views, and other polished execution deliverables."
  }
];

export const executionCreditPacks: ExecutionCreditPack[] = [
  {
    id: "light-top-up",
    credits: 1000,
    price: 25,
    label: "Light top-up",
    detail: "Best for a short burst month when one engine needs extra guided support."
  },
  {
    id: "build-month",
    credits: 5000,
    price: 99,
    label: "Build month",
    detail: "Best when repeated scoping, build assistance, and coordination runs stack up in one cycle."
  },
  {
    id: "heavy-sprint",
    credits: 10000,
    price: 179,
    label: "Heavy sprint",
    detail: "Useful when launch prep, reporting, or multi-engine execution spikes usage for a focused stretch."
  },
  {
    id: "launch-push",
    credits: 25000,
    price: 399,
    label: "Launch push",
    detail: "Best when a serious scope needs a bigger acceleration window without immediately changing plans."
  },
  {
    id: "scale-pack",
    credits: 50000,
    price: 699,
    label: "Scale pack",
    detail: "Designed for large or multi-month execution pushes that need a deeper DIY credit reserve."
  }
];

export const growthLayerScenarios: GrowthLayerScenario[] = [
  {
    id: "internal-dashboard",
    label: "Internal dashboard replacement",
    description:
      "Replace spreadsheets and manual reporting with one internal dashboard that leadership can actually use.",
    totalCredits: 12000,
    targetAcceleratedMonths: 3,
    defaultPlanId: "starter",
    complexity: "moderate",
    bestFor: "Operators replacing internal reporting and approval habits."
  },
  {
    id: "customer-saas",
    label: "Customer-facing SaaS MVP",
    description:
      "Launch a subscription product with accounts, billing, and one clear customer workflow.",
    totalCredits: 40000,
    targetAcceleratedMonths: 4,
    defaultPlanId: "starter",
    complexity: "high",
    bestFor: "Founders who want a real SaaS path without full agency capital upfront."
  },
  {
    id: "marketplace-platform",
    label: "Marketplace or multi-role platform",
    description:
      "Coordinate buyers, sellers, admin workflows, and launch support for a heavier customer platform.",
    totalCredits: 90000,
    targetAcceleratedMonths: 6,
    defaultPlanId: "builder",
    complexity: "extreme",
    bestFor: "Teams dealing with higher operational complexity, roles, and integrations."
  }
] as const;

export const managedEscalationThresholdCredits = 30000;

export const growthUpgrades: GrowthUpgrade[] = [
  {
    id: "ai-seo-marketing-optimization",
    label: "AI SEO + Marketing Optimization",
    pricing: "From $199 / month",
    detail:
      "An optional ongoing support layer for public-facing products that need clearer launch positioning, keyword structure, landing-page refinement, and steadier organic growth support after the build is live.",
    features: [
      "SEO review and reporting for product, feature, and use-case intent",
      "Keyword and content structure for landing pages and launch messaging",
      "Landing-page optimization support for ongoing organic growth work"
    ],
    availability: "Available from Builder and above"
  }
] as const;

export const pricingAddOns: PricingAddOn[] = [
  {
    id: "extra-credits",
    label: "Extra Engine Credits",
    pricing: "From $25",
    detail: "Use a top-up pack when a scoped month runs heavier than the base plan allows and you want more guided execution capacity without changing the plan permanently.",
    availability: "Available to paid plans"
  },
  {
    id: "extra-build-projects",
    label: "Extra build projects",
    pricing: "From $19 / month",
    detail: "Expand the number of scoped execution lanes when the included active build-project limit is no longer enough for a team or agency workflow.",
    availability: "Available from Agency / Command Center only"
  },
  {
    id: "extra-seats",
    label: "Additional Agency seats",
    pricing: "$99 / month per seat",
    detail: "Seat expansion starts at Agency / Command Center so multi-user delivery stays intentional instead of turning lower plans into an improvised team workaround.",
    availability: "Available on Agency / Command Center only"
  },
  {
    id: "premium-integrations",
    label: "Premium integrations",
    pricing: "From $49 / month",
    detail: "Add higher-touch integration support when the build needs deeper connected workflows, operational automation, or more involved system coordination.",
    availability: "Available from Pro and above"
  },
  {
    id: "done-for-you-support",
    label: "Done-for-you support",
    pricing: "Custom",
    detail: "Bring in higher-touch help for implementation, QA follow-through, launch coordination, or operational support when self-serve pacing stops being the right fit.",
    availability: "Contact us"
  }
];

export const hardCapPolicyPoints = [
  "Every plan defaults to hard monthly Engine Credit caps so usage stays predictable.",
  "Users can buy credit packs or upgrade when more guided build capacity is needed.",
  "Execution pauses when credits run out. No plan includes unlimited usage or unlimited build labor."
] as const;

export const usageNotificationThresholds: ExecutionCreditUsageNotification[] = [
  {
    threshold: 0.8,
    label: "80%",
    detail: "Caution the customer when the included monthly Engine Credit pool is nearing its limit."
  },
  {
    threshold: 0.95,
    label: "95%",
    detail: "Warn the customer that immediate action is needed before the included monthly Engine Credit pool is effectively tapped out."
  }
] as const;

const defaultTopUpNote =
  "Add more capacity later with $25 / 1,000, $99 / 5,000, $179 / 10,000, $399 / 25,000, or $699 / 50,000 Engine Credit packs.";

export const teamPricingCallout = {
  title: "Need team or multi-client support?",
  description:
    "Agency / Command Center is the first seat-expandable plan, with 2 included seats and additional seats available at $99 / month per seat for client delivery or internal team execution.",
  actionLabel: "Talk to Neroa",
  actionHref: "/contact?type=partnership"
} as const;

export const managedBuildPackages: ManagedBuildPackage[] = [
  {
    id: "managed-mvp-internal-tool",
    label: "Managed MVP / Internal Tool",
    buildFeeRange: "$1,500-$3,500+",
    monthlyManagementRange: "$199-$499/month minimum",
    summary:
      "A lighter managed engagement for MVPs and internal tools that still need structured execution, QA, and launch follow-through.",
    includes: [
      "Scoped build plan and execution guidance",
      "QA support and launch preparation",
      "Monthly monitoring, updates, and small improvement cycles"
    ],
    excludes: [
      "Unlimited rebuilds",
      "Unlimited new modules without rescoping",
      "Separate new products outside the agreed scope"
    ]
  },
  {
    id: "managed-saas",
    label: "Managed SaaS",
    buildFeeRange: "$5,000-$15,000+",
    monthlyManagementRange: "$500-$1,500/month minimum",
    summary:
      "For founders who want Neroa and a partner team to help execute, QA, deploy, and manage a real SaaS product.",
    includes: [
      "Product scoping and structured execution support",
      "QA, deployment help, and launch support",
      "Monthly monitoring, maintenance, and guided improvement cycles"
    ],
    excludes: [
      "Unlimited product rebuilds",
      "Unlimited new feature delivery",
      "Large-scope expansion without a new quote"
    ]
  },
  {
    id: "managed-mobile-app",
    label: "Managed Mobile App",
    buildFeeRange: "$10,000-$30,000+",
    monthlyManagementRange: "$750-$2,500/month minimum",
    summary:
      "For cross-platform or store-ready mobile products that need more hands-on execution, QA, and release coordination.",
    includes: [
      "Mobile execution planning and delivery support",
      "QA, release prep, and deployment coordination",
      "Monthly monitoring, support, and small iteration cycles"
    ],
    excludes: [
      "Unlimited app rewrites",
      "Unlimited store-submission cycles without scope control",
      "Net-new product builds outside the engagement"
    ]
  },
  {
    id: "managed-external-platform",
    label: "Managed External Customer App / Marketplace / AI Platform",
    buildFeeRange: "$15,000-$50,000+",
    monthlyManagementRange: "$1,500-$5,000/month minimum",
    summary:
      "For larger customer-facing products, marketplaces, and AI platforms that need deeper coordination and more guided operational support.",
    includes: [
      "Execution support across larger scope and integration depth",
      "QA, deployment, and launch coordination",
      "Monthly monitoring, bug fixes, dependency updates, and managed improvements"
    ],
    excludes: [
      "Unlimited rebuilds",
      "Unlimited new products",
      "Open-ended feature expansion without scoped approval"
    ]
  }
] as const;

export const managedBuildPackageIntro =
  "Neroa subscriptions help you shape the product and pace the work. Managed Build Packages are separate when the scope needs Neroa or a delivery partner to carry more execution, QA, deployment, and operating support directly.";

export const managedBuildDisclaimer =
  "Managed Build pricing depends on scope, integration depth, QA burden, launch urgency, and the level of execution support Neroa needs to carry directly. The public ranges are directional by product type, then narrowed after scope is defined. Monthly management covers monitoring, updates, deployment support, dependency upkeep, usage review, and small improvement cycles. It does not mean unlimited rebuilds, unlimited feature expansion, or a blank-check delivery model.";

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    label: "Free",
    shortLabel: "Free",
    audience: "founder",
    category: "trial",
    priceMonthly: 0,
    launchEnabled: true,
    trialDays: null,
    targetUser: "People taking a first look at Neroa before they commit to a real build workflow.",
    bestFor: "Idea exploration and first-scope thinking before any build execution begins.",
    whatYouGet: [
      "300 Engine Credits / month",
      "1 active planning engine",
      "0 active build projects",
      "Idea exploration only"
    ],
    workflowAccess: ["Strategy", "Scope", "Budget preview", "Build Definition preview"],
    whyItMatters:
      "Lets people understand the product without pretending a free plan can cover real build execution.",
    usageIncluded:
      "A low monthly pool of Engine Credits for planning, scoping, and budget framing inside one planning engine.",
    agentAccess: "Neroa core guidance only.",
    exportsAndHandoffs: "Basic summary export only.",
    integrationsAccess: "No build execution, deployment management, or advanced integration support.",
    upgradeTrigger:
      "Upgrade when you want test-stage continuity, recurring planning work, or any real build execution.",
    marketComparison:
      "Acts as a real but limited product entry point instead of a vague free-use promise.",
    usageBandLabel: "Light exploration",
    capacity: {
      aiSystemsIncluded: 1,
      aiSystemsNote: "Neroa only.",
      activeWorkspaces: 1,
      activeWorkspacesNote: "One planning engine at a time.",
      activePlanningEngines: 1,
      activePlanningEnginesNote: "One planning engine for idea shaping and scope review.",
      activeBuildProjects: 0,
      activeBuildProjectsNote: "No build execution on Free.",
      teamSeatsIncluded: 1,
      teamSeatsNote: "1 seat included for a single guided evaluation path.",
      additionalSeatPriceMonthly: null,
      additionalSeatNote: "No extra seats. Upgrade to Agency / Command Center for multi-user access.",
      includedExecutionCreditsMonthly: 300,
      includedExecutionCreditsNote:
        "A low monthly Engine Credit cap for Strategy, Scope, Budget, and Build Definition preview workflows only.",
      extraExecutionCreditsNote: "No top-up packs on Free. Upgrade to continue when the cap is reached.",
      hardCapControlsNote: "Hard capped by default. Usage stops at the included monthly limit."
    },
    exclusions: [
      "No build execution",
      "No deployment management",
      "No active build projects",
      "No specialist AI routing",
      "No multi-engine management"
    ]
  },
  {
    id: "starter",
    label: "Starter",
    shortLabel: "Starter",
    audience: "founder",
    category: "validation",
    priceMonthly: 29,
    launchEnabled: true,
    trialDays: null,
    targetUser: "People validating one real idea and turning it into a tighter scoped plan before build execution begins.",
    bestFor: "One focused planning engine with Neroa-led planning, testing, and decision support.",
    whatYouGet: [
      "2,500 Engine Credits / month",
      "1 active planning engine",
      "0 active build projects",
      "Planning, Scope, Budget, Build Definition, and Test-stage support"
    ],
    workflowAccess: ["Strategy", "Scope", "Budget", "Build Definition", "Test"],
    whyItMatters:
      "Keeps the first paid tier sharp around validation work instead of overpromising deep build capacity too early.",
    usageIncluded:
      "Monthly Engine Credits for roadmap shaping, MVP definition, budget analysis, and test-stage refinement in one planning engine.",
    agentAccess: "Neroa primary, with focused coordinated support when the workflow truly needs it.",
    exportsAndHandoffs: "Light planning exports and structured summaries.",
    integrationsAccess: "No build execution or deployment management. Built for scoped planning and validation only.",
    upgradeTrigger:
      "Move up when you want Build unlocked, deeper specialist coordination, or your first active build project.",
    marketComparison:
      "Replaces scattered planning chats and notes with one system that keeps execution structure intact.",
    usageBandLabel: "Single-engine validation",
    capacity: {
      aiSystemsIncluded: 1,
      aiSystemsNote: "Neroa-led guidance built around one focused planning engine.",
      activeWorkspaces: 1,
      activeWorkspacesNote: "One active planning engine with saved continuity across planning and testing.",
      activePlanningEngines: 1,
      activePlanningEnginesNote: "One planning engine for validation work.",
      activeBuildProjects: 0,
      activeBuildProjectsNote: "No active build projects on Starter.",
      teamSeatsIncluded: 1,
      teamSeatsNote: "1 seat included for one founder or operator.",
      additionalSeatPriceMonthly: null,
      additionalSeatNote: "No extra seats on Starter. Move to Agency / Command Center for multi-user access.",
      includedExecutionCreditsMonthly: 2500,
      includedExecutionCreditsNote:
        "Enough for recurring strategy, scoping, MVP, budget, and test-stage activity each month.",
      extraExecutionCreditsNote: defaultTopUpNote,
      hardCapControlsNote: "Hard cap by default. Top-ups stay optional."
    },
    exclusions: [
      "No active build projects",
      "No completed SaaS build included",
      "No deployment management",
      "No deep export or handoff support"
    ]
  },
  {
    id: "builder",
    label: "Builder",
    shortLabel: "Builder",
    audience: "founder",
    category: "build",
    priceMonthly: 79,
    launchEnabled: true,
    trialDays: null,
    targetUser: "Users moving from planning into one real product execution lane for SaaS, internal software, or external apps.",
    bestFor: "Build-focused work where one scoped execution lane and stronger handoffs start to matter.",
    whatYouGet: [
      "9,000 Engine Credits / month",
      "3 active planning engines",
      "1 active build project",
      "Guided build workflow unlocked for one selected project only"
    ],
    workflowAccess: ["Strategy", "Scope", "Budget", "Build Definition", "Build", "Test"],
    whyItMatters:
      "This is where Neroa starts acting like an execution system without implying unlimited build labor.",
    usageIncluded:
      "Built for repeated scoping, build workflow assistance, AI coordination, and structured execution support across multiple planning engines and one active build project.",
    agentAccess: "Neroa with Forge, Atlas, RepoLink, and the specialist systems needed for structured build support.",
    exportsAndHandoffs: "Roadmap exports, developer-brief handoffs, and stronger execution outputs.",
    integrationsAccess: "Core integrations and guided build workflow support for one scoped build project.",
    upgradeTrigger:
      "Move up when launch planning, heavier integrations, or more than one active build project becomes part of the normal rhythm.",
    marketComparison:
      "Usually replaces fragmented scoping calls, build notes, and disconnected execution docs with one coordinated system.",
    usageBandLabel: "Structured build execution",
    capacity: {
      aiSystemsIncluded: 4,
      aiSystemsNote: "Neroa plus the core specialist systems needed for product execution support.",
      activeWorkspaces: 3,
      activeWorkspacesNote: "Up to three planning engines for parallel product shaping or adjacent scope work.",
      activePlanningEngines: 3,
      activePlanningEnginesNote: "Three planning engines for parallel product shaping.",
      activeBuildProjects: 1,
      activeBuildProjectsNote: "One active build project for scoped execution.",
      teamSeatsIncluded: 1,
      teamSeatsNote: "1 seat included for one builder or operator.",
      additionalSeatPriceMonthly: null,
      additionalSeatNote: "No extra seats on Builder. Agency / Command Center is the first seat-expandable plan.",
      includedExecutionCreditsMonthly: 9000,
      includedExecutionCreditsNote:
        "Supports heavier monthly scoping, build workflow assistance, and coordinated AI runs.",
      extraExecutionCreditsNote: defaultTopUpNote,
      hardCapControlsNote: "Hard cap by default, with optional top-ups for burst months."
    },
    exclusions: [
      "No completed SaaS build included",
      "No human QA included",
      "No deployment management included",
      "No unlimited build labor"
    ]
  },
  {
    id: "pro",
    label: "Pro",
    shortLabel: "Pro",
    audience: "founder",
    category: "scale",
    priceMonthly: 179,
    launchEnabled: true,
    trialDays: null,
    targetUser: "One serious operator running deeper builds, launch motion, and several planning engines with one active build project.",
    bestFor: "Single-operator execution with one deeper build lane, stronger integrations, and stronger handoff/export support.",
    whatYouGet: [
      "22,000 Engine Credits / month",
      "6 active planning engines",
      "1 active build project",
      "Deeper guided execution and stronger handoff/export support",
      "1 seat only with no additional seats"
    ],
    workflowAccess: ["Strategy", "Scope", "Budget", "Build Definition", "Build", "Test", "Launch", "Operate"],
    whyItMatters:
      "Keeps scope, build planning, launch readiness, and operating follow-through inside one guided system without implying done-for-you delivery.",
    usageIncluded:
      "Designed for multi-engine planning, one deeper build project, launch workflow assistance, and recurring exports or handoffs.",
    agentAccess: "Neroa with deeper coordinated specialist support across build, launch, and operating execution.",
    exportsAndHandoffs: "Advanced exports, handoff packets, launch checklists, and stronger operating deliverables.",
    integrationsAccess: "Stronger integrations and advanced execution support.",
    upgradeTrigger:
      "Move up when you need more than one active build project, client workflows, or consistently higher monthly usage.",
    marketComparison:
      "Often replaces a mix of outside planning, launch support, and fragmented operating workflows that cost more and connect less cleanly.",
    usageBandLabel: "Deeper multi-engine execution",
    capacity: {
      aiSystemsIncluded: 6,
      aiSystemsNote: "Neroa plus the specialist systems typically needed for deeper build and launch coordination.",
      activeWorkspaces: 6,
      activeWorkspacesNote: "Six planning engines for connected products, launches, or sustained workstreams.",
      activePlanningEngines: 6,
      activePlanningEnginesNote: "Six planning engines for broader product throughput.",
      activeBuildProjects: 1,
      activeBuildProjectsNote: "One active build project with deeper guided execution.",
      teamSeatsIncluded: 1,
      teamSeatsNote: "1 seat included for one serious operator running deeper builds.",
      additionalSeatPriceMonthly: null,
      additionalSeatNote: "No additional seats available on Pro.",
      includedExecutionCreditsMonthly: 22000,
      includedExecutionCreditsNote:
        "Supports heavier build, launch, export, and coordinated AI activity across several planning engines and one build project.",
      extraExecutionCreditsNote: defaultTopUpNote,
      hardCapControlsNote: "Hard caps stay available even at higher usage levels."
    },
    exclusions: [
      "No unlimited build labor",
      "No done-for-you development included",
      "No extra seats on Pro",
      "No unlimited active build projects"
    ]
  },
  {
    id: "command-center",
    label: "Agency / Command Center",
    shortLabel: "Agency",
    audience: "agency",
    category: "agency",
    priceMonthly: 399,
    launchEnabled: true,
    trialDays: null,
    targetUser: "Builders, consultants, teams, or agencies managing multiple client planning lanes and a limited number of active build projects.",
    bestFor: "Client workflows, reusable templates, higher planning throughput, and deeper coordinated execution.",
    whatYouGet: [
      "60,000 Engine Credits / month",
      "15 active planning engines",
      "2 active build projects",
      "Client and team workflow support",
      "Reusable templates, reporting, and stronger handoff structure",
      "2 seats included with expandable team access"
    ],
    workflowAccess: [
      "Strategy",
      "Scope",
      "Budget",
      "Build Definition",
      "Build",
      "Test",
      "Launch",
      "Operate",
      "Client and team workflows"
    ],
    whyItMatters:
      "Supports agencies and heavier operators who need Neroa to function as a serious execution environment without pretending the subscription covers unlimited build labor.",
    usageIncluded:
      "Built for multi-engine throughput, client-facing exports, reusable operating templates, advanced reporting, and limited active build-project execution.",
    agentAccess: "Full coordinated Neroa system under Neroa, with specialist AI brought in where the workflow requires it.",
    exportsAndHandoffs: "Advanced handoff support, reusable templates, reporting views, and stronger client-facing outputs.",
    integrationsAccess: "Priority-ready integrations and higher-touch expansion support.",
    upgradeTrigger:
      "Talk to Neroa when you need broader team rollout, more active build projects, or a deeper operating model across multiple contributors.",
    marketComparison:
      "Usually replaces a large amount of fragmented scoping, reporting, and client handoff work with one coordinated system.",
    usageBandLabel: "Agency and multi-engine operations",
    capacity: {
      aiSystemsIncluded: 7,
      aiSystemsNote: "Full specialist stack with Neroa coordinating the operating flow.",
      activeWorkspaces: 15,
      activeWorkspacesNote: "Fifteen planning engines for agencies, consultancies, or serious multi-engine teams.",
      activePlanningEngines: 15,
      activePlanningEnginesNote: "Fifteen planning engines for multi-client or multi-product shaping.",
      activeBuildProjects: 2,
      activeBuildProjectsNote: "Two active build projects. Additional build projects require add-on pricing.",
      teamSeatsIncluded: 2,
      teamSeatsNote: "2 seats included for an agency lead and one collaborator.",
      additionalSeatPriceMonthly: 99,
      additionalSeatNote: "Additional seats available at $99 / month per seat on Agency / Command Center only.",
      includedExecutionCreditsMonthly: 60000,
      includedExecutionCreditsNote:
        "Built for high-throughput planning, execution, reporting, and coordinated AI assistance across many active planning engines and two build projects.",
      extraExecutionCreditsNote: defaultTopUpNote,
      hardCapControlsNote: "Hard caps and top-ups can both be used so larger accounts stay predictable."
    },
    exclusions: [
      "No flat-rate full-build labor for SaaS or apps",
      "No unlimited active build projects",
      "No unlimited build labor",
      "Additional build projects require add-on pricing"
    ]
  }
];

