import {
  getPricingPlan,
  pricingPlans,
  type PricingPlan,
  type PricingPlanId
} from "@/lib/pricing/config";
import type { ProjectLaneRecord, ProjectRecord, ProjectTemplateId } from "@/lib/workspace/project-lanes";

export type BudgetScenario = "lean" | "standard" | "growth";

export type BudgetLaneLogicKey =
  | "business-strategy"
  | "business-plan"
  | "budget"
  | "branding"
  | "website"
  | "saas"
  | "automation";

export type BudgetItem = {
  id: string;
  name: string;
  category: string;
  laneType: BudgetLaneLogicKey;
  required: boolean;
  oneTimeCost: number;
  monthlyCost: number;
  coveredByNeroa: boolean;
  notes: string;
  scenarioVisibility: BudgetScenario[];
};

export type BudgetItemOverride = {
  required?: boolean;
  oneTimeCost?: number;
  monthlyCost?: number;
};

export type ComputedBudgetItem = BudgetItem & {
  computedRequired: boolean;
  computedOneTimeCost: number;
  computedMonthlyCost: number;
  currentPlanIncluded: boolean;
  minimumPlan: PricingPlan;
  recommendationCopy: string;
};

export type BudgetScenarioSummary = {
  id: BudgetScenario;
  label: string;
  headline: string;
  assumptions: string[];
};

export type BudgetReplacementCard = {
  id: "freelancer" | "consultant" | "agency" | "neroa" | "savings";
  title: string;
  amountLabel: string;
  detail: string;
};

export type BudgetLaneModel = {
  currentPlan: PricingPlan;
  laneMinimumPlan: PricingPlan;
  recommendedPlan: PricingPlan;
  laneIncludedInCurrentPlan: boolean;
  upgradeRequired: boolean;
  executionImpact: string;
  outsideSpendRequired: boolean;
  outsideSpendMessage: string;
  neroaCostLabel: string;
  startupBudgetLabel: string;
  monthlyOperatingCostLabel: string;
  estimatedSavingsLabel: string;
  launchTotal: number;
  monthlyOperatingCost: number;
  estimatedSavings: number;
  visibleItems: ComputedBudgetItem[];
  scenarioCards: BudgetScenarioSummary[];
  comparisonCards: BudgetReplacementCard[];
  recommendedAction: string;
  savingsGuidance: string;
};

type LaneLogicProfile = {
  label: string;
  minimumPlanId: PricingPlanId;
  noOutsideSpend: boolean;
  currentTierCopy: string;
  upgradeCopy: string;
  outsideSpendCopy: string;
};

const planRankOrder: PricingPlanId[] = pricingPlans.map((plan) => plan.id);

const scenarioMultiplier: Record<BudgetScenario, number> = {
  lean: 0.82,
  standard: 1,
  growth: 1.45
};

const scenarioSummaries: Record<BudgetScenario, BudgetScenarioSummary> = {
  lean: {
    id: "lean",
    label: "Lean Launch",
    headline: "Keep the launch narrow, protect cash, and use Neroa to replace light outside planning work.",
    assumptions: [
      "Use Neroa for most planning, structure, and budget work.",
      "Add only the minimum outside spend needed to launch credibly.",
      "Delay non-essential tooling, design, and scale-up costs."
    ]
  },
  standard: {
    id: "standard",
    label: "Standard Launch",
    headline: "Balance speed and quality with a fuller launch surface and clearer operating readiness.",
    assumptions: [
      "Add moderate outside spend where it directly improves launch readiness.",
      "Use Neroa to keep scope disciplined and reduce unnecessary vendor work.",
      "Fund the first operating layer, website path, and launch support systems."
    ]
  },
  growth: {
    id: "growth",
    label: "Growth Launch",
    headline: "Fund a heavier launch path with stronger execution support, richer tooling, and more capacity.",
    assumptions: [
      "Plan for more tooling, more support systems, and a broader launch motion.",
      "Expect higher Neroa usage if the project becomes build-heavy or implementation-heavy.",
      "Use premium planning now to reduce expensive rework later."
    ]
  }
};

const laneLogicProfiles: Record<BudgetLaneLogicKey, LaneLogicProfile> = {
  "business-strategy": {
    label: "Business Strategy",
    minimumPlanId: "starter",
    noOutsideSpend: true,
    currentTierCopy: "Included in Starter and above.",
    upgradeCopy: "Upgrade only when the work becomes more active, cross-lane, or execution-heavy.",
    outsideSpendCopy: "No outside spend required for this step unless you want extra services."
  },
  "business-plan": {
    label: "Business Plan",
    minimumPlanId: "starter",
    noOutsideSpend: true,
    currentTierCopy: "Included in Starter and above.",
    upgradeCopy: "Upgrade only when you want deeper structure, multi-lane planning, or heavier guidance.",
    outsideSpendCopy: "No outside spend required for this step unless you want optional expert help."
  },
  budget: {
    label: "Budget",
    minimumPlanId: "starter",
    noOutsideSpend: true,
    currentTierCopy: "Structured budget planning is included in Starter and above.",
    upgradeCopy: "Upgrade recommended if you want stronger scenario modeling, more active workspaces, or deeper execution budgeting.",
    outsideSpendCopy: "Neroa can complete the planning step internally. Outside spend appears only when the project itself needs it."
  },
  branding: {
    label: "Branding",
    minimumPlanId: "starter",
    noOutsideSpend: false,
    currentTierCopy: "Brand planning is supported in Starter and Builder tiers.",
    upgradeCopy: "Upgrade only when branding turns into a bigger launch surface or multi-lane execution need.",
    outsideSpendCopy: "Optional outside spend may be useful for design assets or premium identity work."
  },
  website: {
    label: "Website",
    minimumPlanId: "builder",
    noOutsideSpend: false,
    currentTierCopy: "Website and launch-surface planning are supported in Builder or higher.",
    upgradeCopy: "Upgrade recommended if the project needs richer launch planning or more active multi-lane work.",
    outsideSpendCopy: "Expect optional outside costs for domain, hosting, and any hands-on build support."
  },
  saas: {
    label: "SaaS Build",
    minimumPlanId: "builder",
    noOutsideSpend: false,
    currentTierCopy: "SaaS and build-heavy planning belong in Builder or Pro.",
    upgradeCopy: "Upgrade recommended for heavier feature scoping, more exports, and deeper multi-agent execution support.",
    outsideSpendCopy: "Expect possible outside tooling, infra, and engineering costs even when Neroa reduces planning overhead."
  },
  automation: {
    label: "Automation",
    minimumPlanId: "pro",
    noOutsideSpend: false,
    currentTierCopy: "Automation work is execution-heavy and should stay in Pro or higher.",
    upgradeCopy: "Upgrade recommended when automation design turns into active integration, testing, or deployment work.",
    outsideSpendCopy: "Optional tooling, connectors, and monitoring costs may still appear."
  }
};

const budgetItemCatalog: BudgetItem[] = [
  {
    id: "business-strategy-core",
    name: "Neroa strategy synthesis",
    category: "Planning",
    laneType: "business-strategy",
    required: true,
    oneTimeCost: 0,
    monthlyCost: 0,
    coveredByNeroa: true,
    notes: "Included in lower tiers for shaping the business direction and first roadmap.",
    scenarioVisibility: ["lean", "standard", "growth"]
  },
  {
    id: "business-plan-core",
    name: "Structured business plan",
    category: "Planning",
    laneType: "business-plan",
    required: true,
    oneTimeCost: 0,
    monthlyCost: 0,
    coveredByNeroa: true,
    notes: "Neroa can build the business plan internally without outside spend.",
    scenarioVisibility: ["lean", "standard", "growth"]
  },
  {
    id: "budget-model-core",
    name: "Budget scenario modeling",
    category: "Planning",
    laneType: "budget",
    required: true,
    oneTimeCost: 0,
    monthlyCost: 0,
    coveredByNeroa: true,
    notes: "Neroa covers the planning layer and keeps budget logic in one place.",
    scenarioVisibility: ["lean", "standard", "growth"]
  },
  {
    id: "branding-direction",
    name: "Brand direction and identity support",
    category: "Launch",
    laneType: "branding",
    required: false,
    oneTimeCost: 600,
    monthlyCost: 0,
    coveredByNeroa: false,
    notes: "Optional outside spend for identity polish, design assets, or visual execution.",
    scenarioVisibility: ["standard", "growth"]
  },
  {
    id: "website-launch",
    name: "Website, domain, and launch surface",
    category: "Launch",
    laneType: "website",
    required: false,
    oneTimeCost: 450,
    monthlyCost: 39,
    coveredByNeroa: false,
    notes: "Neroa reduces planning and copy effort, but domain, hosting, and build tools still cost money.",
    scenarioVisibility: ["lean", "standard", "growth"]
  },
  {
    id: "saas-scope",
    name: "SaaS scoping and developer brief",
    category: "Build",
    laneType: "saas",
    required: false,
    oneTimeCost: 4200,
    monthlyCost: 0,
    coveredByNeroa: false,
    notes: "High-execution work belongs in build tiers and may still need engineering or tooling spend.",
    scenarioVisibility: ["standard", "growth"]
  },
  {
    id: "automation-stack",
    name: "Automation tooling and monitoring",
    category: "Systems",
    laneType: "automation",
    required: false,
    oneTimeCost: 900,
    monthlyCost: 120,
    coveredByNeroa: false,
    notes: "Use this when integrations, monitoring, and production workflows become part of the project.",
    scenarioVisibility: ["standard", "growth"]
  }
];

function getPlanRank(planId: PricingPlanId) {
  return planRankOrder.indexOf(planId);
}

function maxPlanId(left: PricingPlanId, right: PricingPlanId) {
  return getPlanRank(left) >= getPlanRank(right) ? left : right;
}

function laneTypeForTitle(lane: ProjectLaneRecord): BudgetLaneLogicKey | null {
  const slug = lane.slug;

  if (slug.includes("strategy")) {
    return "business-strategy";
  }

  if (slug.includes("business-plan")) {
    return "business-plan";
  }

  if (slug.includes("budget")) {
    return "budget";
  }

  if (slug.includes("branding") || slug.includes("brand")) {
    return "branding";
  }

  if (slug.includes("website") || slug.includes("storefront") || slug.includes("launch-website")) {
    return "website";
  }

  if (slug.includes("launch")) {
    return "website";
  }

  if (
    slug.includes("automation") ||
    slug.includes("operations") ||
    slug.includes("operate") ||
    slug.includes("deployment") ||
    slug.includes("production")
  ) {
    return "automation";
  }

  if (
    slug.includes("saas") ||
    slug.includes("mobile") ||
    slug.includes("scope") ||
    slug.includes("build") ||
    slug.includes("test") ||
    slug.includes("coding") ||
    slug.includes("mvp") ||
    slug.includes("architecture") ||
    slug.includes("data-model")
  ) {
    return "saas";
  }

  return null;
}

function inferCurrentPlanId(project: ProjectRecord): PricingPlanId {
  switch (project.templateId) {
    case "business-launch":
      return "starter";
    case "ecommerce-brand":
      return "builder";
    case "saas-build":
    case "mobile-app-build":
      return "builder";
    case "coding-project":
      return "builder";
  }
}

function getRelevantLaneTypes(project: ProjectRecord): BudgetLaneLogicKey[] {
  const fromProject = project.lanes
    .map((lane) => laneTypeForTitle(lane))
    .filter((laneType): laneType is BudgetLaneLogicKey => Boolean(laneType));

  if (fromProject.length > 0) {
    return Array.from(new Set(fromProject));
  }

  if (
    project.templateId === "saas-build" ||
    project.templateId === "coding-project" ||
    project.templateId === "mobile-app-build"
  ) {
    return ["business-strategy", "budget", "website", "saas", "automation"];
  }

  return ["business-strategy", "business-plan", "budget", "branding", "website", "automation"];
}

function getItemLaneTypesForScenario(
  project: ProjectRecord,
  scenario: BudgetScenario
): BudgetLaneLogicKey[] {
  const types = getRelevantLaneTypes(project);

  if (scenario === "growth") {
    return Array.from(new Set([...types, "automation", "saas"]));
  }

  return types;
}

function getVisibleItems(
  project: ProjectRecord,
  scenario: BudgetScenario,
  overrides: Record<string, BudgetItemOverride>
): ComputedBudgetItem[] {
  const laneTypes = getItemLaneTypesForScenario(project, scenario);
  const currentPlan = getPricingPlan(inferCurrentPlanId(project));

  if (!currentPlan) {
    throw new Error("Missing current pricing plan configuration.");
  }

  return budgetItemCatalog
    .filter(
      (item) =>
        item.scenarioVisibility.includes(scenario) &&
        laneTypes.includes(item.laneType)
    )
    .map((item) => {
      const override = overrides[item.id];
      const multiplier = scenarioMultiplier[scenario];
      const minimumPlan = getPricingPlan(laneLogicProfiles[item.laneType].minimumPlanId);

      if (!minimumPlan) {
        throw new Error(`Missing pricing plan for ${laneLogicProfiles[item.laneType].minimumPlanId}`);
      }

      const computedRequired = override?.required ?? item.required;
      const computedOneTimeCost = Math.round((override?.oneTimeCost ?? item.oneTimeCost) * multiplier);
      const computedMonthlyCost = Math.round((override?.monthlyCost ?? item.monthlyCost) * multiplier);
      const currentPlanIncluded = getPlanRank(currentPlan.id) >= getPlanRank(minimumPlan.id);

      return {
        ...item,
        computedRequired,
        computedOneTimeCost,
        computedMonthlyCost,
        currentPlanIncluded,
        minimumPlan,
        recommendationCopy: currentPlanIncluded
          ? "Included in your current tier"
          : laneLogicProfiles[item.laneType].upgradeCopy
      };
    });
}

function getReplacementCosts(
  templateId: ProjectTemplateId,
  scenario: BudgetScenario
) {
  const base =
    templateId === "business-launch"
      ? { freelancer: 1200, consultant: 2200, agency: 6200 }
      : templateId === "ecommerce-brand"
        ? { freelancer: 1800, consultant: 3200, agency: 7800 }
        : templateId === "saas-build"
          ? { freelancer: 4200, consultant: 7600, agency: 18000 }
          : templateId === "mobile-app-build"
            ? { freelancer: 5600, consultant: 9800, agency: 22000 }
          : { freelancer: 3800, consultant: 6200, agency: 15000 };
  const multiplier = scenario === "lean" ? 0.84 : scenario === "growth" ? 1.45 : 1;

  return {
    freelancer: Math.round(base.freelancer * multiplier),
    consultant: Math.round(base.consultant * multiplier),
    agency: Math.round(base.agency * multiplier)
  };
}

function formatPrice(value: number | null) {
  if (value === null) {
    return "Custom";
  }

  return `$${value.toLocaleString("en-US")}`;
}

function computeRecommendedPlan(
  currentPlan: PricingPlan,
  items: ComputedBudgetItem[]
) {
  const requiredPlanId = items
    .filter((item) => item.computedRequired)
    .reduce<PricingPlanId>(
      (planId, item) => maxPlanId(planId, item.minimumPlan.id),
      currentPlan.id
    );
  const recommendedPlan = getPricingPlan(requiredPlanId);

  if (!recommendedPlan) {
    throw new Error(`Missing recommended plan ${requiredPlanId}`);
  }

  return recommendedPlan;
}

function createComparisonCards(
  project: ProjectRecord,
  scenario: BudgetScenario,
  recommendedPlan: PricingPlan,
  estimatedSavings: number
): BudgetReplacementCard[] {
  const replacementCosts = getReplacementCosts(project.templateId, scenario);
  const neroaPlanCost = recommendedPlan.priceMonthly ?? 0;

  return [
    {
      id: "freelancer",
      title: "Freelancer cost",
      amountLabel: formatPrice(replacementCosts.freelancer),
      detail: "Typical light outside planning or execution support for this phase."
    },
    {
      id: "consultant",
      title: "Consultant cost",
      amountLabel: formatPrice(replacementCosts.consultant),
      detail: "Typical structured strategy or planning engagement for a project like this."
    },
    {
      id: "agency",
      title: "Agency cost",
      amountLabel: formatPrice(replacementCosts.agency),
      detail: "Typical bundled outside support once the project widens into launch or build work."
    },
    {
      id: "neroa",
      title: "Neroa plan cost",
      amountLabel:
        recommendedPlan.priceMonthly === null
          ? "Custom"
          : `${formatPrice(neroaPlanCost)}/month`,
      detail: recommendedPlan.whyItMatters
    },
    {
      id: "savings",
      title: "Estimated savings",
      amountLabel: formatPrice(estimatedSavings),
      detail: "Approximate savings versus a blended outside-market option for this phase."
    }
  ];
}

export function isBudgetLane(lane: Pick<ProjectLaneRecord, "slug" | "title">) {
  return lane.slug.includes("budget") || lane.title.toLowerCase().includes("budget");
}

export function getBudgetLaneModel(args: {
  project: ProjectRecord;
  scenario: BudgetScenario;
  overrides: Record<string, BudgetItemOverride>;
}) {
  const currentPlan = getPricingPlan(inferCurrentPlanId(args.project));

  if (!currentPlan) {
    throw new Error("Missing inferred current plan configuration.");
  }

  const visibleItems = getVisibleItems(args.project, args.scenario, args.overrides);
  const laneMinimumPlan = getPricingPlan(laneLogicProfiles.budget.minimumPlanId);

  if (!laneMinimumPlan) {
    throw new Error("Missing minimum budget plan configuration.");
  }

  const recommendedPlan = computeRecommendedPlan(currentPlan, visibleItems);
  const laneIncludedInCurrentPlan = getPlanRank(currentPlan.id) >= getPlanRank(laneMinimumPlan.id);
  const upgradeRequired = !laneIncludedInCurrentPlan || getPlanRank(recommendedPlan.id) > getPlanRank(currentPlan.id);
  const launchTotal = visibleItems
    .filter((item) => item.computedRequired)
    .reduce((total, item) => total + item.computedOneTimeCost, 0);
  const monthlyOperatingCost = visibleItems
    .filter((item) => item.computedRequired)
    .reduce((total, item) => total + item.computedMonthlyCost, 0);
  const outsideSpendRequired = visibleItems.some(
    (item) => item.computedRequired && !item.coveredByNeroa && (item.computedOneTimeCost > 0 || item.computedMonthlyCost > 0)
  );
  const replacementCosts = getReplacementCosts(args.project.templateId, args.scenario);
  const blendedOutsideCost = Math.round(
    (replacementCosts.freelancer + replacementCosts.consultant + replacementCosts.agency) / 3
  );
  const neroaPlanCost = recommendedPlan.priceMonthly ?? 0;
  const estimatedSavings = Math.max(blendedOutsideCost - neroaPlanCost, 0);
  const executionImpact =
    recommendedPlan.category === "build" ||
    recommendedPlan.category === "scale" ||
    recommendedPlan.category === "agency"
      ? "Higher execution load with heavier usage and stronger orchestration needs."
      : outsideSpendRequired
        ? "Moderate execution load with some outside spend likely."
        : "Light planning load that can mostly stay inside Neroa.";
  const outsideSpendMessage = outsideSpendRequired
    ? "Outside spend is likely for the launch path shown here, even though Neroa reduces planning, scoping, and coordination cost."
    : "No outside spend required for this step unless you choose optional extras.";
  const scenarioCards = (Object.keys(scenarioSummaries) as BudgetScenario[]).map((scenarioId) => scenarioSummaries[scenarioId]);
  const comparisonCards = createComparisonCards(
    args.project,
    args.scenario,
    recommendedPlan,
    estimatedSavings
  );

  return {
    currentPlan,
    laneMinimumPlan,
    recommendedPlan,
    laneIncludedInCurrentPlan,
    upgradeRequired,
    executionImpact,
    outsideSpendRequired,
    outsideSpendMessage,
    neroaCostLabel:
      recommendedPlan.id === currentPlan.id
        ? `${formatPrice(currentPlan.priceMonthly)}/month`
        : `${formatPrice(currentPlan.priceMonthly)} now -> ${formatPrice(recommendedPlan.priceMonthly)} recommended`,
    startupBudgetLabel: formatPrice(launchTotal),
    monthlyOperatingCostLabel: formatPrice(monthlyOperatingCost),
    estimatedSavingsLabel: formatPrice(estimatedSavings),
    launchTotal,
    monthlyOperatingCost,
    estimatedSavings,
    visibleItems,
    scenarioCards,
    comparisonCards,
    recommendedAction: upgradeRequired
      ? `Upgrade to ${recommendedPlan.label} before execution-heavy work expands beyond your current plan.`
      : "Stay on the current tier and keep using Neroa to reduce unnecessary outside spend.",
    savingsGuidance:
      estimatedSavings > 0
        ? "Neroa is replacing early consultant, planner, and coordination work so you do not have to buy that clarity from multiple outside sources."
        : "Use Neroa to tighten scope first, then reassess whether the outside spend is truly necessary."
  } satisfies BudgetLaneModel;
}

export function createBudgetNaruaWelcome(model: BudgetLaneModel, scenario: BudgetScenario) {
  return `Neroa is active in Budget. I’m looking at the ${scenarioSummaries[scenario].label.toLowerCase()} path, your current plan, and the real-world launch budget so we can separate Neroa cost from outside spend.`;
}

export function createBudgetNaruaReply(
  model: BudgetLaneModel,
  scenario: BudgetScenario,
  message: string
) {
  const coverageCopy = model.laneIncludedInCurrentPlan
    ? "The Budget lane is included in your current tier."
    : `The Budget lane is not fully covered by ${model.currentPlan.label}.`;

  return [
    `Neroa is evaluating the ${scenarioSummaries[scenario].label.toLowerCase()} budget path.`,
    coverageCopy,
    model.outsideSpendMessage,
    `Based on "${message.trim()}", the next useful move is to tighten the required line items, compare that against ${model.recommendedPlan.label}, and decide whether you want the leaner or heavier launch path.`
  ].join(" ");
}
