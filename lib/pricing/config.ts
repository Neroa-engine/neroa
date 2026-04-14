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
  credits: number;
  price: number;
  label: string;
  detail: string;
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
  "Every project is scoped before execution. Your subscription gives access, guidance, and monthly Engine Credits. Large or complex builds may require more credits, scope reduction, a higher plan, or a managed build package.";

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

export type PricingPlanCapacity = {
  aiSystemsIncluded: number | null;
  aiSystemsNote: string;
  activeWorkspaces: number | null;
  activeWorkspacesNote: string;
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
      "Used when Naroa shapes the problem, audience, scope, and first execution path for a new engine."
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
      "Used when Naroa brings in specialist systems for build planning, launch prep, design direction, or operating support."
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
    credits: 1000,
    price: 10,
    label: "Light top-up",
    detail: "Best for a short burst month when one engine needs extra guided support."
  },
  {
    credits: 5000,
    price: 40,
    label: "Build month",
    detail: "Best when repeated scoping, build assistance, and coordination runs stack up in one cycle."
  },
  {
    credits: 10000,
    price: 70,
    label: "Heavy sprint",
    detail: "Useful when launch prep, reporting, or multi-engine execution spikes usage for a focused stretch."
  }
];

export const pricingAddOns: PricingAddOn[] = [
  {
    id: "extra-credits",
    label: "Extra Engine Credits",
    pricing: "From $10",
    detail: "Add a top-up pack when you need extra guided execution capacity without immediately changing plans.",
    availability: "Available to paid plans"
  },
  {
    id: "extra-engines",
    label: "Extra engines",
    pricing: "From $19 / month",
    detail: "Expand the active engine limit when one more build needs continuity before a full plan upgrade makes sense.",
    availability: "Available from Builder and above"
  },
  {
    id: "extra-seats",
    label: "Additional Agency seats",
    pricing: "$99 / month per seat",
    detail: "Seat expansion starts at Agency / Command Center only, so Pro stays focused on one serious operator instead of turning into a team workaround.",
    availability: "Available on Agency / Command Center only"
  },
  {
    id: "premium-integrations",
    label: "Premium integrations",
    pricing: "From $49 / month",
    detail: "Layer in stronger connected workflows once execution moves beyond core planning and build guidance.",
    availability: "Available from Pro and above"
  },
  {
    id: "done-for-you-support",
    label: "Done-for-you support",
    pricing: "Custom",
    detail: "Bring in higher-touch help for setup, implementation, or operational follow-through when needed.",
    availability: "Contact us"
  }
];

export const hardCapPolicyPoints = [
  "Every plan can stay on a hard monthly Engine Credit cap so usage remains predictable.",
  "Top-ups are optional. Customers can keep them off and stop at the included monthly Engine Credit limit.",
  "Upgrade when heavier guided execution becomes your normal monthly pattern, not because one week was unusually busy."
] as const;

export const usageNotificationThresholds: ExecutionCreditUsageNotification[] = [
  {
    threshold: 0.75,
    label: "75%",
    detail: "Warn the customer before the included monthly Engine Credit pool starts to get tight."
  },
  {
    threshold: 1,
    label: "100%",
    detail: "Alert the customer when the included monthly Engine Credit pool is exhausted."
  }
] as const;

const defaultTopUpNote =
  "Add more capacity later with $10 / 1,000, $40 / 5,000, or $70 / 10,000 Engine Credit packs.";

export const teamPricingCallout = {
  title: "Need team or multi-client support?",
  description:
    "Agency / Command Center is the first seat-expandable plan, with 2 included seats and additional seats available at $99 / month per seat for client delivery or internal team execution.",
  actionLabel: "Talk to Naroa",
  actionHref: "/contact?type=partnership"
} as const;

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
    targetUser: "People taking a first look at Naroa before they commit to a real build workflow.",
    bestFor: "Light product exploration before you move into recurring guided execution.",
    whatYouGet: [
      "1 engine",
      "Strategy, Scope, MVP, and Budget preview only",
      "A small monthly Engine Credit pool",
      "A hard cap with no add-on credits"
    ],
    workflowAccess: ["Strategy", "Scope", "MVP preview", "Budget preview"],
    whyItMatters:
      "Lets people understand the product without pretending free usage can cover serious build work.",
    usageIncluded:
      "A low monthly pool of Engine Credits for early planning, scoping, and budget framing inside one engine.",
    agentAccess: "Naroa core guidance only.",
    exportsAndHandoffs: "Basic summary export only.",
    integrationsAccess: "No advanced build workflows, premium integrations, or deeper multi-agent execution.",
    upgradeTrigger:
      "Upgrade when you want recurring planning work, test-stage continuity, or anything beyond the preview lanes.",
    marketComparison:
      "Acts as a real but limited product entry point instead of a vague free-use promise.",
    usageBandLabel: "Light exploration",
    capacity: {
      aiSystemsIncluded: 1,
      aiSystemsNote: "Naroa only.",
      activeWorkspaces: 1,
      activeWorkspacesNote: "One active engine at a time.",
      teamSeatsIncluded: 1,
      teamSeatsNote: "1 seat included for a single guided evaluation path.",
      additionalSeatPriceMonthly: null,
      additionalSeatNote: "No extra seats. Upgrade to Agency / Command Center for multi-user access.",
      includedExecutionCreditsMonthly: 300,
      includedExecutionCreditsNote:
        "A low monthly Engine Credit cap for Strategy, Scope, MVP, and Budget preview workflows only.",
      extraExecutionCreditsNote: "No top-up packs on Free. Upgrade to continue when the cap is reached.",
      hardCapControlsNote: "Hard capped by default. Usage stops at the included monthly limit."
    },
    exclusions: [
      "No Build, Launch, or Operate workflows",
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
    targetUser: "People validating one real idea and turning it into a tighter execution path.",
    bestFor: "One focused engine with Naroa-led planning, testing, and decision support.",
    whatYouGet: [
      "1 active engine",
      "Strategy, Scope, MVP, Budget, and Test",
      "Monthly Engine Credits for recurring guided work",
      "Naroa core guidance with hard-cap controls"
    ],
    workflowAccess: ["Strategy", "Scope", "MVP", "Budget", "Test"],
    whyItMatters:
      "Keeps the first paid tier sharp around validation work instead of overpromising deep build capacity too early.",
    usageIncluded:
      "Monthly Engine Credits for roadmap shaping, MVP definition, budget analysis, and test-stage refinement in one active engine.",
    agentAccess: "Naroa primary, with focused coordinated support when the workflow truly needs it.",
    exportsAndHandoffs: "Light planning exports and structured summaries.",
    integrationsAccess: "No advanced integrations or heavier build-handoff tooling.",
    upgradeTrigger:
      "Move up when you want Build unlocked, deeper specialist coordination, or more than one active engine.",
    marketComparison:
      "Replaces scattered planning chats and notes with one system that keeps execution structure intact.",
    usageBandLabel: "Single-engine validation",
    capacity: {
      aiSystemsIncluded: 1,
      aiSystemsNote: "Naroa-led guidance built around one focused engine.",
      activeWorkspaces: 1,
      activeWorkspacesNote: "One active engine with saved continuity across planning and testing.",
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
      "No Build workflow",
      "No deep export or handoff support",
      "No multi-engine management"
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
    targetUser: "Users moving from planning into real product execution for SaaS, internal software, or external apps.",
    bestFor: "Build-focused work where scoping, execution structure, and handoffs start to matter.",
    whatYouGet: [
      "2 to 3 active engines",
      "Build unlocked",
      "Specialist AI systems unlocked",
      "Export and handoff support with a stronger Engine Credit pool"
    ],
    workflowAccess: ["Strategy", "Scope", "MVP", "Budget", "Test", "Build"],
    whyItMatters:
      "This is where Naroa starts acting like an execution system instead of a planning assistant.",
    usageIncluded:
      "Built for repeated scoping, build workflow assistance, AI coordination, and structured execution support across multiple engines.",
    agentAccess: "Naroa with Forge, Atlas, RepoLink, and the specialist systems needed for structured build support.",
    exportsAndHandoffs: "Roadmap exports, developer-brief handoffs, and stronger execution outputs.",
    integrationsAccess: "Core integrations and deeper workflow assistance.",
    upgradeTrigger:
      "Move up when launch planning, broader integrations, or several active engines become part of the normal operating rhythm.",
    marketComparison:
      "Usually replaces fragmented scoping calls, build notes, and disconnected execution docs with one coordinated system.",
    usageBandLabel: "Structured build execution",
    capacity: {
      aiSystemsIncluded: 4,
      aiSystemsNote: "Naroa plus the core specialist systems needed for product execution support.",
      activeWorkspaces: 3,
      activeWorkspacesNote: "Up to three active engines for parallel build paths or adjacent products.",
      teamSeatsIncluded: 1,
      teamSeatsNote: "1 seat included for one builder or operator.",
      additionalSeatPriceMonthly: null,
      additionalSeatNote: "No extra seats on Builder. Agency / Command Center is the first seat-expandable plan.",
      includedExecutionCreditsMonthly: 9000,
      includedExecutionCreditsNote:
        "Supports heavier monthly scoping, build workflow assistance, and coordinated AI runs.",
      extraExecutionCreditsNote: defaultTopUpNote,
      hardCapControlsNote: "Hard cap by default, with optional top-ups for burst months."
    }
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
    targetUser: "One serious operator running deeper builds, launch motion, and multiple active engines.",
    bestFor: "Single-operator execution with launch planning, stronger integrations, and deeper AI coordination.",
    whatYouGet: [
      "Multiple active engines",
      "Launch workflow access",
      "Stronger integrations and advanced execution support",
      "A larger monthly Engine Credit pool for deeper coordinated work",
      "1 seat only with no additional seats"
    ],
    workflowAccess: ["Strategy", "Scope", "MVP", "Budget", "Test", "Build", "Launch", "Operate"],
    whyItMatters:
      "Keeps scope, build planning, launch readiness, and operating follow-through inside one guided system.",
    usageIncluded:
      "Designed for multi-engine planning, deeper specialist coordination, launch workflow assistance, and recurring exports or handoffs.",
    agentAccess: "Naroa with deeper coordinated specialist support across build, launch, and operating execution.",
    exportsAndHandoffs: "Advanced exports, handoff packets, launch checklists, and stronger operating deliverables.",
    integrationsAccess: "Stronger integrations and advanced execution support.",
    upgradeTrigger:
      "Move up when you need client workflows, reusable templates, heavier reporting, or consistently higher monthly usage.",
    marketComparison:
      "Often replaces a mix of outside planning, launch support, and fragmented operating workflows that cost more and connect less cleanly.",
    usageBandLabel: "Deeper multi-engine execution",
    capacity: {
      aiSystemsIncluded: 6,
      aiSystemsNote: "Naroa plus the specialist systems typically needed for deeper build and launch coordination.",
      activeWorkspaces: 6,
      activeWorkspacesNote: "Multiple active engines for connected products, launches, or sustained workstreams.",
      teamSeatsIncluded: 1,
      teamSeatsNote: "1 seat included for one serious operator running deeper builds.",
      additionalSeatPriceMonthly: null,
      additionalSeatNote: "No additional seats available on Pro.",
      includedExecutionCreditsMonthly: 22000,
      includedExecutionCreditsNote:
        "Supports heavier build, launch, export, and coordinated AI activity across several active engines.",
      extraExecutionCreditsNote: defaultTopUpNote,
      hardCapControlsNote: "Hard caps stay available even at higher usage levels."
    }
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
    targetUser: "Builders, consultants, teams, or agencies managing multiple client or internal engines.",
    bestFor: "Client workflows, reusable templates, higher throughput, reporting, and deeper coordinated execution.",
    whatYouGet: [
      "Highest monthly Engine Credit pool",
      "Multiple active engines",
      "Client and team workflow support",
      "Reusable templates, reporting, and stronger handoff structure",
      "2 seats included with expandable team access"
    ],
    workflowAccess: [
      "Strategy",
      "Scope",
      "MVP",
      "Budget",
      "Test",
      "Build",
      "Launch",
      "Operate",
      "Client and team workflows"
    ],
    whyItMatters:
      "Supports agencies and heavier operators who need Naroa to function as a serious execution environment, not just a scoped planning layer.",
    usageIncluded:
      "Built for multi-engine throughput, client-facing exports, reusable operating templates, advanced reporting, and deeper guided execution.",
    agentAccess: "Full coordinated Naroa system under Naroa, with specialist AI brought in where the workflow requires it.",
    exportsAndHandoffs: "Advanced handoff support, reusable templates, reporting views, and stronger client-facing outputs.",
    integrationsAccess: "Priority-ready integrations and higher-touch expansion support.",
    upgradeTrigger:
      "Talk to Naroa when you need broader team rollout, custom routing, or a deeper operating model across multiple contributors.",
    marketComparison:
      "Usually replaces a large amount of fragmented scoping, reporting, and client handoff work with one coordinated system.",
    usageBandLabel: "Agency and multi-engine operations",
    capacity: {
      aiSystemsIncluded: 7,
      aiSystemsNote: "Full specialist stack with Naroa coordinating the operating flow.",
      activeWorkspaces: 15,
      activeWorkspacesNote: "Fifteen active engines for agencies, consultancies, or serious multi-engine teams.",
      teamSeatsIncluded: 2,
      teamSeatsNote: "2 seats included for an agency lead and one collaborator.",
      additionalSeatPriceMonthly: 99,
      additionalSeatNote: "Additional seats available at $99 / month per seat on Agency / Command Center only.",
      includedExecutionCreditsMonthly: 60000,
      includedExecutionCreditsNote:
        "Built for high-throughput planning, execution, reporting, and coordinated AI assistance across many active engines.",
      extraExecutionCreditsNote: defaultTopUpNote,
      hardCapControlsNote: "Hard caps and top-ups can both be used so larger accounts stay predictable."
    }
  }
];

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function getPricingPlan(planId: PricingPlanId) {
  return pricingPlans.find((plan) => plan.id === planId) ?? null;
}

export function getLaunchPricingPlans(audience?: PricingAudience) {
  return pricingPlans.filter((plan) => plan.launchEnabled && (!audience || plan.audience === audience));
}

export function getBillingInterval(intervalId: BillingIntervalId) {
  return publicBillingIntervals.find((interval) => interval.id === intervalId) ?? publicBillingIntervals[0];
}

export function calculateIntervalPrice(monthlyPrice: number | null, intervalId: BillingIntervalId) {
  const interval = getBillingInterval(intervalId);

  if (monthlyPrice === null) {
    return {
      interval,
      totalPrice: null,
      effectiveMonthlyPrice: null,
      savingsAmount: null
    };
  }

  const baseTotal = monthlyPrice * interval.months;
  const discountedTotal = roundCurrency(baseTotal * (1 - interval.discountRate));

  return {
    interval,
    totalPrice: discountedTotal,
    effectiveMonthlyPrice: roundCurrency(discountedTotal / interval.months),
    savingsAmount: roundCurrency(baseTotal - discountedTotal)
  };
}

export function getExecutionCreditUsageNotifications(usedCredits: number, includedCredits: number | null) {
  if (!includedCredits || includedCredits <= 0) {
    return [];
  }

  const usageRatio = usedCredits / includedCredits;

  return usageNotificationThresholds.filter((item) => usageRatio >= item.threshold);
}

export function getRecommendedExecutionCreditPack(requiredCredits: number) {
  if (requiredCredits <= 0) {
    return null;
  }

  return executionCreditPacks.find((pack) => pack.credits >= requiredCredits) ?? executionCreditPacks[executionCreditPacks.length - 1];
}
