export type ExampleBuildTypeId = "saas" | "internal-software" | "external-app" | "mobile-app";
export type ExampleIntentMode = "known-industry" | "exploring-opportunities";
export type ExampleIndustryId =
  | "healthcare"
  | "beauty-skincare"
  | "fitness-wellness"
  | "finance-fintech"
  | "ecommerce-retail"
  | "real-estate"
  | "education"
  | "industrial-manufacturing"
  | "logistics-transportation"
  | "hospitality-travel"
  | "agriculture-farming"
  | "media-content"
  | "web-based-services";
export type ExampleOpportunityAreaId =
  | "ai-powered-internal-tools"
  | "vertical-saas-opportunities"
  | "workflow-automation-systems"
  | "marketplace-opportunities"
  | "creator-monetization-systems"
  | "data-dashboard-businesses"
  | "lead-generation-systems"
  | "niche-content-community-platforms";
export type ExampleFrameworkId =
  | "dashboard-data-platform"
  | "workflow-automation-system"
  | "marketplace-system"
  | "subscription-platform"
  | "internal-operations-system"
  | "lead-generation-system"
  | "content-community-platform"
  | "client-portal-service-platform";
export type ExampleBuildPathId = "diy-slower" | "diy-accelerated" | "managed";

export type ExampleBuildType = {
  id: ExampleBuildTypeId;
  label: string;
  description: string;
  selectorHint: string;
  marker: string;
};

export type ExampleIntentOption = {
  id: ExampleIntentMode;
  label: string;
  description: string;
  badge: string;
};

type ExampleContextProfile = {
  id: string;
  label: string;
  description: string;
  projectPrefix: string;
  marketFocus: string;
  audienceLabel: string;
  complexityBias: number;
};

export type ExampleIndustry = ExampleContextProfile & {
  id: ExampleIndustryId;
};

export type ExampleOpportunityArea = ExampleContextProfile & {
  id: ExampleOpportunityAreaId;
};

export type ExampleFramework = {
  id: ExampleFrameworkId;
  label: string;
  description: string;
  selectorHint: string;
  compatibleProductTypes: ExampleBuildTypeId[];
  systemValue: string;
  scopeAnchors: string[];
};

export type ExampleStackSystem = {
  label: string;
  role: string;
};

export type ExampleStackRecommendation = {
  headline: string;
  summary: string;
  systems: ExampleStackSystem[];
  notes: string[];
};

export type ExampleBuildPath = {
  id: ExampleBuildPathId;
  label: string;
  summary: string;
  timeline: string;
  controlLevel: string;
  supportLevel: string;
  bestFor: string;
  recommended: boolean;
};

export type ExampleBuildProject = {
  id: string;
  typeId: ExampleBuildTypeId;
  typeLabel: string;
  intentMode: ExampleIntentMode;
  industryId?: ExampleIndustryId;
  industryLabel?: string;
  opportunityAreaId?: ExampleOpportunityAreaId;
  opportunityAreaLabel?: string;
  frameworkId: ExampleFrameworkId;
  frameworkLabel: string;
  title: string;
  summary: string;
  problem: string;
  audience: string;
  coreFeatures: string[];
  keyModules: string[];
  firstBuild: string[];
  mvpSummary: string;
  mvpIncluded: string[];
  creditEstimate: string;
  estimateNote: string;
  stackRecommendation: ExampleStackRecommendation;
  buildPaths: ExampleBuildPath[];
};

export type ExampleBuildSelection = {
  productTypeId?: ExampleBuildTypeId | null;
  intentMode?: ExampleIntentMode | null;
  industryId?: ExampleIndustryId | null;
  opportunityAreaId?: ExampleOpportunityAreaId | null;
  frameworkId?: ExampleFrameworkId | null;
  exampleProjectId?: string | null;
};

function slugifySegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCreditRange(min: number, max: number) {
  return `${min.toLocaleString("en-US")} - ${max.toLocaleString("en-US")} Engine Credits`;
}

function roundToFiveHundred(value: number) {
  return Math.round(value / 500) * 500;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export const exampleBuildTypes: ExampleBuildType[] = [
  {
    id: "saas",
    label: "SaaS",
    description:
      "A recurring-revenue product with account access, product workflows, and a launch path that can grow into a commercial platform.",
    selectorHint:
      "Use this when the product needs customer accounts, repeat usage, and a productized value path.",
    marker: "SS"
  },
  {
    id: "internal-software",
    label: "Internal Software",
    description:
      "Operational systems for teams that need better workflow control, reporting, approvals, or automation inside the business.",
    selectorHint:
      "Use this when the build is primarily for your team, operators, or internal process owners.",
    marker: "IS"
  },
  {
    id: "external-app",
    label: "External App",
    description:
      "Customer-facing products such as portals, service platforms, and web apps that create a better outside-in user experience.",
    selectorHint:
      "Use this when customers, clients, or partners are the primary users of the product.",
    marker: "EA"
  },
  {
    id: "mobile-app",
    label: "Mobile App",
    description:
      "Mobile-first products for iPhone, Android, or cross-platform rollout with staged scope and launch pacing.",
    selectorHint:
      "Use this when the first experience must feel mobile-native instead of merely responsive.",
    marker: "MA"
  }
];

export const exampleIntentOptions: ExampleIntentOption[] = [
  {
    id: "known-industry",
    label: "I know my industry",
    description:
      "Start with the market you already understand and let Neroa shape the best-fit framework inside it.",
    badge: "Industry-led"
  },
  {
    id: "exploring-opportunities",
    label: "I'm exploring opportunities",
    description:
      "Start from a hot opportunity area and let Neroa show how it could turn into a product system.",
    badge: "Opportunity-led"
  }
];

export const exampleIndustries: ExampleIndustry[] = [
  {
    id: "healthcare",
    label: "Healthcare",
    description: "Systems for care operations, patient coordination, and regulated service workflows.",
    projectPrefix: "Care",
    marketFocus: "healthcare operators trying to reduce delays, missed handoffs, and fragmented reporting",
    audienceLabel: "practice operators, care coordinators, and healthcare administrators",
    complexityBias: 3
  },
  {
    id: "beauty-skincare",
    label: "Beauty / Skincare",
    description: "Products for service businesses, memberships, inventory visibility, and customer retention.",
    projectPrefix: "Studio",
    marketFocus: "beauty and skincare operators trying to unify bookings, memberships, and retail follow-up",
    audienceLabel: "salon owners, skincare clinics, and beauty operations teams",
    complexityBias: 1
  },
  {
    id: "fitness-wellness",
    label: "Fitness / Wellness",
    description: "Systems for memberships, coaching workflows, attendance, and client progress.",
    projectPrefix: "Member",
    marketFocus: "fitness and wellness teams trying to tighten memberships, scheduling, and client accountability",
    audienceLabel: "studio operators, wellness coaches, and program managers",
    complexityBias: 1
  },
  {
    id: "finance-fintech",
    label: "Finance / Fintech",
    description: "Products for financial workflows, client visibility, compliance-sensitive ops, and reporting.",
    projectPrefix: "Finance",
    marketFocus: "finance teams trying to improve reporting, service coordination, and account visibility",
    audienceLabel: "finance operators, fintech founders, and client success teams",
    complexityBias: 3
  },
  {
    id: "ecommerce-retail",
    label: "E-commerce / Retail",
    description: "Systems for orders, promotions, memberships, inventory, and customer retention.",
    projectPrefix: "Retail",
    marketFocus: "retail and ecommerce teams trying to connect orders, customer retention, and performance visibility",
    audienceLabel: "retail operators, ecommerce managers, and growth teams",
    complexityBias: 2
  },
  {
    id: "real-estate",
    label: "Real Estate",
    description: "Tools for property operations, approvals, lead routing, and client communication.",
    projectPrefix: "Property",
    marketFocus: "real-estate teams trying to reduce scattered communication, handoff delays, and lost leads",
    audienceLabel: "brokerage operators, property managers, and transaction coordinators",
    complexityBias: 2
  },
  {
    id: "education",
    label: "Education",
    description: "Platforms for member learning, internal coordination, and cohort or content delivery.",
    projectPrefix: "Learning",
    marketFocus: "education businesses trying to coordinate enrollment, progress visibility, and content delivery",
    audienceLabel: "program operators, education founders, and training teams",
    complexityBias: 1
  },
  {
    id: "industrial-manufacturing",
    label: "Industrial / Manufacturing",
    description: "Systems for plant operations, maintenance, approvals, and production visibility.",
    projectPrefix: "Plant",
    marketFocus: "manufacturing teams trying to remove manual routing, stale status updates, and bottlenecked approvals",
    audienceLabel: "plant managers, operations leads, and maintenance teams",
    complexityBias: 3
  },
  {
    id: "logistics-transportation",
    label: "Logistics / Transportation",
    description: "Products for routing, status visibility, dispatch coordination, and service operations.",
    projectPrefix: "Dispatch",
    marketFocus: "logistics teams trying to improve route visibility, service handoffs, and internal coordination",
    audienceLabel: "dispatch leads, operations managers, and transportation coordinators",
    complexityBias: 3
  },
  {
    id: "hospitality-travel",
    label: "Hospitality / Travel",
    description: "Systems for bookings, service delivery, membership access, and guest operations.",
    projectPrefix: "Guest",
    marketFocus: "hospitality businesses trying to reduce booking friction and improve service follow-through",
    audienceLabel: "hospitality operators, travel service teams, and guest experience managers",
    complexityBias: 2
  },
  {
    id: "agriculture-farming",
    label: "Agriculture / Farming",
    description: "Tools for field operations, reporting, maintenance, and seasonal planning.",
    projectPrefix: "Field",
    marketFocus: "agriculture operators trying to make field coordination, maintenance, and reporting more visible",
    audienceLabel: "farm operators, production managers, and field supervisors",
    complexityBias: 2
  },
  {
    id: "media-content",
    label: "Media / Content",
    description: "Platforms for publishing operations, memberships, community, and content workflows.",
    projectPrefix: "Creator",
    marketFocus: "media teams trying to connect audience growth, content delivery, and member retention",
    audienceLabel: "content operators, publishers, and creator-led businesses",
    complexityBias: 1
  },
  {
    id: "web-based-services",
    label: "Web-based Services",
    description: "Client portals, service workflows, dashboards, and recurring service systems.",
    projectPrefix: "Service",
    marketFocus: "service businesses trying to organize delivery, client communication, and revenue operations",
    audienceLabel: "agency operators, service founders, and client success teams",
    complexityBias: 1
  }
];

export const exampleOpportunityAreas: ExampleOpportunityArea[] = [
  {
    id: "ai-powered-internal-tools",
    label: "AI-powered internal tools",
    description: "Internal systems that save team time with better workflow structure and assistive intelligence.",
    projectPrefix: "Ops AI",
    marketFocus: "teams that want faster internal execution without hiring a full platform team first",
    audienceLabel: "operators and team leads who need immediate workflow leverage",
    complexityBias: 2
  },
  {
    id: "vertical-saas-opportunities",
    label: "Vertical SaaS opportunities",
    description: "Focused commercial products built around one market, one workflow, and one repeat pain point.",
    projectPrefix: "Vertical",
    marketFocus: "niche operators who can package a repeated workflow into subscription software",
    audienceLabel: "founders looking for a focused SaaS wedge with strong recurring-revenue potential",
    complexityBias: 2
  },
  {
    id: "workflow-automation-systems",
    label: "Workflow automation systems",
    description: "Products that replace approvals, follow-ups, and manual handoffs with structured workflows.",
    projectPrefix: "Workflow",
    marketFocus: "teams that still rely on forms, email, and manual routing for critical work",
    audienceLabel: "operators replacing repeated process friction with structured software",
    complexityBias: 2
  },
  {
    id: "marketplace-opportunities",
    label: "Marketplace opportunities",
    description: "Service matching, network effects, and transaction-driven platforms with multiple user roles.",
    projectPrefix: "Market",
    marketFocus: "founders exploring supply-demand products with service discovery or matching logic",
    audienceLabel: "builders aiming at multi-sided products and coordinated user journeys",
    complexityBias: 4
  },
  {
    id: "creator-monetization-systems",
    label: "Creator monetization systems",
    description: "Membership, content, community, and premium access products built around audience revenue.",
    projectPrefix: "Creator",
    marketFocus: "audience-led businesses that want recurring revenue, gated content, or community access",
    audienceLabel: "creators, publishers, and education brands turning audience attention into products",
    complexityBias: 1
  },
  {
    id: "data-dashboard-businesses",
    label: "Data dashboard businesses",
    description: "Products centered on analytics, reporting, and packaged insights for a defined user group.",
    projectPrefix: "Insight",
    marketFocus: "buyers who want clearer reporting and decision support than spreadsheets or generic tools provide",
    audienceLabel: "operators and founders packaging visibility into a software product",
    complexityBias: 2
  },
  {
    id: "lead-generation-systems",
    label: "Lead-generation systems",
    description: "Funnels, portals, and intake systems designed to capture demand and convert it into revenue.",
    projectPrefix: "Lead",
    marketFocus: "service businesses and operators who want a productized demand engine with better qualification",
    audienceLabel: "sales-led teams and founders building a predictable acquisition system",
    complexityBias: 1
  },
  {
    id: "niche-content-community-platforms",
    label: "Niche content + community platforms",
    description: "Products combining content, access, memberships, and community retention for a focused audience.",
    projectPrefix: "Member",
    marketFocus: "niche audiences that will pay for focused content, access, and ongoing participation",
    audienceLabel: "community-led founders building retention and monetization into the same product",
    complexityBias: 2
  }
];

export const exampleFrameworks: ExampleFramework[] = [
  {
    id: "dashboard-data-platform",
    label: "Dashboard + Data Platform",
    description: "A visibility-first system built around reporting, filters, views, and structured decision support.",
    selectorHint: "Strong when the product needs reporting, insight surfaces, and operational dashboards.",
    compatibleProductTypes: ["saas", "internal-software", "external-app"],
    systemValue: "Turns scattered activity into a usable operating surface.",
    scopeAnchors: ["dashboard", "reporting views", "filters", "shared data model"]
  },
  {
    id: "workflow-automation-system",
    label: "Workflow Automation System",
    description: "A process-driven system that routes tasks, approvals, and recurring work through structured automation.",
    selectorHint: "Strong when the core pain is manual routing, approvals, or repeated handoff work.",
    compatibleProductTypes: ["saas", "internal-software", "external-app", "mobile-app"],
    systemValue: "Makes execution smoother by reducing manual coordination.",
    scopeAnchors: ["workflow routing", "approval states", "task ownership", "automation triggers"]
  },
  {
    id: "marketplace-system",
    label: "Marketplace System",
    description: "A multi-role system for matching supply and demand, transactions, discovery, and service fulfillment.",
    selectorHint: "Use this when the product depends on providers, buyers, or a two-sided network effect.",
    compatibleProductTypes: ["saas", "external-app", "mobile-app"],
    systemValue: "Coordinates multiple user roles inside one product system.",
    scopeAnchors: ["multi-role accounts", "discovery", "transactions", "fulfillment logic"]
  },
  {
    id: "subscription-platform",
    label: "Subscription Platform",
    description: "A recurring-revenue system built around accounts, access, billing, and premium product value.",
    selectorHint: "Strong when recurring payments, gated access, or memberships are central to the business model.",
    compatibleProductTypes: ["saas", "external-app", "mobile-app"],
    systemValue: "Creates a clear commercial core with monetization built into the product.",
    scopeAnchors: ["billing", "plans", "account access", "member experience"]
  },
  {
    id: "internal-operations-system",
    label: "Internal Operations System",
    description: "A control-layer product for teams that need structured operations, status visibility, and internal governance.",
    selectorHint: "Best when the product is meant to replace disconnected internal workflows or spreadsheets.",
    compatibleProductTypes: ["saas", "internal-software"],
    systemValue: "Gives operators one coordinated system instead of fragmented tools.",
    scopeAnchors: ["ops dashboard", "permissions", "internal reporting", "decision visibility"]
  },
  {
    id: "lead-generation-system",
    label: "Lead Generation System",
    description: "A revenue-focused system for capturing, routing, qualifying, and converting inbound demand.",
    selectorHint: "Strong when the business needs a productized front door for demand capture and follow-up.",
    compatibleProductTypes: ["saas", "external-app"],
    systemValue: "Turns acquisition activity into a structured revenue engine.",
    scopeAnchors: ["landing flows", "intake", "qualification", "pipeline routing"]
  },
  {
    id: "content-community-platform",
    label: "Content + Community Platform",
    description: "A product that combines content delivery, member access, community retention, and monetization.",
    selectorHint: "Use this when content, membership, or audience engagement is part of the core value path.",
    compatibleProductTypes: ["saas", "external-app", "mobile-app"],
    systemValue: "Connects education, engagement, and recurring audience value in one system.",
    scopeAnchors: ["content access", "community layer", "profiles", "member retention"]
  },
  {
    id: "client-portal-service-platform",
    label: "Client Portal / Service Platform",
    description: "A customer-facing system for requests, bookings, project visibility, and service delivery.",
    selectorHint: "Strong when clients need a clear portal, service workflow, or account-based experience.",
    compatibleProductTypes: ["saas", "internal-software", "external-app"],
    systemValue: "Creates a structured outside-in experience without losing operational control.",
    scopeAnchors: ["client portal", "service requests", "status views", "communication workflow"]
  }
];

const buildTypeMap = new Map(exampleBuildTypes.map((item) => [item.id, item]));
const industryMap = new Map(exampleIndustries.map((item) => [item.id, item]));
const opportunityMap = new Map(exampleOpportunityAreas.map((item) => [item.id, item]));
const frameworkMap = new Map(exampleFrameworks.map((item) => [item.id, item]));

const productTypeBaseCredits: Record<ExampleBuildTypeId, number> = {
  saas: 10000,
  "internal-software": 8000,
  "external-app": 12000,
  "mobile-app": 15000
};

const frameworkCreditBias: Record<ExampleFrameworkId, number> = {
  "dashboard-data-platform": 2500,
  "workflow-automation-system": 3500,
  "marketplace-system": 9000,
  "subscription-platform": 5000,
  "internal-operations-system": 4000,
  "lead-generation-system": 3000,
  "content-community-platform": 4500,
  "client-portal-service-platform": 5000
};

const frameworkRankingBias: Record<ExampleFrameworkId, number> = {
  "dashboard-data-platform": 2,
  "workflow-automation-system": 2,
  "marketplace-system": 1,
  "subscription-platform": 2,
  "internal-operations-system": 2,
  "lead-generation-system": 1,
  "content-community-platform": 1,
  "client-portal-service-platform": 1
};

export function getExampleIndustries() {
  return exampleIndustries;
}

export function getExampleOpportunityAreas() {
  return exampleOpportunityAreas;
}

export function getExampleBuildTypes() {
  return exampleBuildTypes;
}

export function getExampleIntentOptions() {
  return exampleIntentOptions;
}

export function getExampleBuildType(typeId: ExampleBuildTypeId | string) {
  return buildTypeMap.get(typeId as ExampleBuildTypeId) ?? null;
}

export function getExampleBuildTypeLabel(typeId: ExampleBuildTypeId) {
  return getExampleBuildType(typeId)?.label ?? typeId;
}

function getContextProfile(args: {
  intentMode: ExampleIntentMode;
  industryId?: ExampleIndustryId | null;
  opportunityAreaId?: ExampleOpportunityAreaId | null;
}) {
  if (args.intentMode === "known-industry" && args.industryId) {
    return industryMap.get(args.industryId) ?? null;
  }

  if (args.intentMode === "exploring-opportunities" && args.opportunityAreaId) {
    return opportunityMap.get(args.opportunityAreaId) ?? null;
  }

  return null;
}

function buildFrameworkScore(args: {
  productTypeId: ExampleBuildTypeId;
  intentMode: ExampleIntentMode;
  industryId?: ExampleIndustryId | null;
  opportunityAreaId?: ExampleOpportunityAreaId | null;
  framework: ExampleFramework;
}) {
  let score = frameworkRankingBias[args.framework.id];

  if (args.productTypeId === "internal-software") {
    if (args.framework.id === "workflow-automation-system" || args.framework.id === "internal-operations-system") {
      score += 3;
    }
  }

  if (args.productTypeId === "saas") {
    if (args.framework.id === "subscription-platform" || args.framework.id === "dashboard-data-platform") {
      score += 3;
    }
  }

  if (args.productTypeId === "external-app") {
    if (args.framework.id === "client-portal-service-platform" || args.framework.id === "marketplace-system") {
      score += 3;
    }
  }

  if (args.productTypeId === "mobile-app") {
    if (args.framework.id === "marketplace-system" || args.framework.id === "content-community-platform") {
      score += 3;
    }
  }

  if (args.intentMode === "exploring-opportunities" && args.opportunityAreaId) {
    switch (args.opportunityAreaId) {
      case "ai-powered-internal-tools":
        if (
          args.framework.id === "workflow-automation-system" ||
          args.framework.id === "internal-operations-system" ||
          args.framework.id === "dashboard-data-platform"
        ) {
          score += 5;
        }
        break;
      case "vertical-saas-opportunities":
        if (
          args.framework.id === "subscription-platform" ||
          args.framework.id === "dashboard-data-platform" ||
          args.framework.id === "client-portal-service-platform"
        ) {
          score += 5;
        }
        break;
      case "workflow-automation-systems":
        if (args.framework.id === "workflow-automation-system") {
          score += 6;
        }
        break;
      case "marketplace-opportunities":
        if (args.framework.id === "marketplace-system") {
          score += 6;
        }
        break;
      case "creator-monetization-systems":
        if (
          args.framework.id === "content-community-platform" ||
          args.framework.id === "subscription-platform"
        ) {
          score += 5;
        }
        break;
      case "data-dashboard-businesses":
        if (args.framework.id === "dashboard-data-platform") {
          score += 6;
        }
        break;
      case "lead-generation-systems":
        if (args.framework.id === "lead-generation-system") {
          score += 6;
        }
        break;
      case "niche-content-community-platforms":
        if (args.framework.id === "content-community-platform") {
          score += 6;
        }
        break;
      default:
        break;
    }
  }

  if (args.intentMode === "known-industry" && args.industryId) {
    if (
      args.industryId === "industrial-manufacturing" ||
      args.industryId === "logistics-transportation"
    ) {
      if (
        args.framework.id === "workflow-automation-system" ||
        args.framework.id === "internal-operations-system"
      ) {
        score += 4;
      }
    }

    if (args.industryId === "finance-fintech" && args.framework.id === "dashboard-data-platform") {
      score += 4;
    }

    if (
      args.industryId === "media-content" &&
      args.framework.id === "content-community-platform"
    ) {
      score += 4;
    }

    if (
      args.industryId === "web-based-services" &&
      args.framework.id === "client-portal-service-platform"
    ) {
      score += 4;
    }
  }

  return score;
}

export function getExampleBuildFramework(frameworkId: ExampleFrameworkId | string) {
  return frameworkMap.get(frameworkId as ExampleFrameworkId) ?? null;
}

export function getExampleFrameworksForSelection(args: {
  productTypeId?: ExampleBuildTypeId | null;
  intentMode?: ExampleIntentMode | null;
  industryId?: ExampleIndustryId | null;
  opportunityAreaId?: ExampleOpportunityAreaId | null;
}) {
  if (!args.productTypeId) {
    return [];
  }

  const productTypeId = args.productTypeId;

  const compatible = exampleFrameworks.filter((framework) =>
    framework.compatibleProductTypes.includes(productTypeId)
  );

  if (!args.intentMode) {
    return compatible;
  }

  const intentMode = args.intentMode;

  return compatible
    .slice()
    .sort(
      (left, right) =>
        buildFrameworkScore({
          productTypeId,
          intentMode,
          industryId: args.industryId,
          opportunityAreaId: args.opportunityAreaId,
          framework: right
        }) -
        buildFrameworkScore({
          productTypeId,
          intentMode,
          industryId: args.industryId,
          opportunityAreaId: args.opportunityAreaId,
          framework: left
        })
    );
}

function getProjectContextLabel(args: {
  intentMode: ExampleIntentMode;
  industry?: ExampleIndustry | null;
  opportunityArea?: ExampleOpportunityArea | null;
}) {
  return args.intentMode === "known-industry"
    ? args.industry?.label ?? "Selected industry"
    : args.opportunityArea?.label ?? "Selected opportunity";
}

function getProjectTitles(args: {
  productType: ExampleBuildType;
  intentMode: ExampleIntentMode;
  industry?: ExampleIndustry | null;
  opportunityArea?: ExampleOpportunityArea | null;
  framework: ExampleFramework;
}) {
  const prefix = args.industry?.projectPrefix ?? args.opportunityArea?.projectPrefix ?? "Core";

  if (
    args.productType.id === "internal-software" &&
    args.intentMode === "known-industry" &&
    args.industry?.id === "industrial-manufacturing" &&
    args.framework.id === "workflow-automation-system"
  ) {
    return [
      "Plant operations dashboard",
      "Internal approvals workflow",
      "Maintenance task routing system"
    ];
  }

  if (
    args.productType.id === "saas" &&
    args.intentMode === "exploring-opportunities" &&
    args.opportunityArea?.id === "vertical-saas-opportunities" &&
    args.framework.id === "subscription-platform"
  ) {
    return [
      "Niche reporting SaaS",
      "Team analytics platform",
      "Vertical service management SaaS"
    ];
  }

  switch (args.framework.id) {
    case "dashboard-data-platform":
      if (args.productType.id === "internal-software") {
        return [
          `${prefix} operations dashboard`,
          `${prefix} reporting portal`,
          `${prefix} KPI workspace`
        ];
      }
      if (args.productType.id === "external-app") {
        return [
          `${prefix} customer insights portal`,
          `${prefix} reporting app`,
          `${prefix} analytics access platform`
        ];
      }
      return [
        `${prefix} analytics dashboard`,
        `${prefix} reporting platform`,
        `${prefix} insights workspace`
      ];
    case "workflow-automation-system":
      if (args.productType.id === "internal-software") {
        return [
          `${prefix} operations dashboard`,
          "Internal approvals workflow",
          `${prefix} task routing system`
        ];
      }
      if (args.productType.id === "mobile-app") {
        return [
          `${prefix} mobile workflow app`,
          `${prefix} field task routing app`,
          `${prefix} approvals companion`
        ];
      }
      if (args.productType.id === "external-app") {
        return [
          `${prefix} client workflow portal`,
          `${prefix} service automation app`,
          `${prefix} intake and routing platform`
        ];
      }
      return [
        `${prefix} workflow SaaS`,
        `${prefix} automation hub`,
        `${prefix} approvals management platform`
      ];
    case "marketplace-system":
      if (args.productType.id === "mobile-app") {
        return [
          `${prefix} mobile marketplace`,
          `${prefix} on-demand service app`,
          `${prefix} local network app`
        ];
      }
      if (args.productType.id === "saas") {
        return [
          `${prefix} vendor marketplace SaaS`,
          `${prefix} network platform`,
          `${prefix} transaction hub`
        ];
      }
      return [
        `${prefix} service marketplace`,
        `${prefix} provider matching platform`,
        `${prefix} booking marketplace`
      ];
    case "subscription-platform":
      if (args.productType.id === "mobile-app") {
        return [
          `${prefix} subscription mobile app`,
          `${prefix} premium access app`,
          `${prefix} member mobile platform`
        ];
      }
      if (args.productType.id === "external-app") {
        return [
          `${prefix} client subscription portal`,
          `${prefix} paid access platform`,
          `${prefix} member experience app`
        ];
      }
      return [
        `${prefix} subscription platform`,
        `${prefix} member platform`,
        `${prefix} recurring revenue SaaS`
      ];
    case "internal-operations-system":
      return [
        `${prefix} internal ops system`,
        `${prefix} process control center`,
        `${prefix} team operations hub`
      ];
    case "lead-generation-system":
      if (args.productType.id === "external-app") {
        return [
          `${prefix} quote and lead portal`,
          `${prefix} service inquiry platform`,
          `${prefix} conversion capture app`
        ];
      }
      return [
        `${prefix} lead engine SaaS`,
        `${prefix} pipeline capture platform`,
        `${prefix} inbound revenue system`
      ];
    case "content-community-platform":
      if (args.productType.id === "mobile-app") {
        return [
          `${prefix} mobile community MVP`,
          `${prefix} member mobile platform`,
          `${prefix} creator fan app`
        ];
      }
      if (args.productType.id === "external-app") {
        return [
          `${prefix} community platform`,
          `${prefix} member portal`,
          `${prefix} content and engagement app`
        ];
      }
      return [
        `${prefix} content membership platform`,
        `${prefix} expert community SaaS`,
        `${prefix} creator education hub`
      ];
    case "client-portal-service-platform":
      if (args.productType.id === "internal-software") {
        return [
          `${prefix} partner operations portal`,
          `${prefix} internal service desk`,
          `${prefix} approvals and access portal`
        ];
      }
      if (args.productType.id === "saas") {
        return [
          `${prefix} client portal SaaS`,
          `${prefix} service management portal`,
          `${prefix} customer success workspace`
        ];
      }
      return [
        `${prefix} client access platform`,
        `${prefix} customer booking portal`,
        `${prefix} service delivery portal`
      ];
    default:
      return [
        `${prefix} platform`,
        `${prefix} system`,
        `${prefix} workspace`
      ];
  }
}

function getExampleStackRecommendation(args: {
  productType: ExampleBuildType;
  framework: ExampleFramework;
  contextLabel: string;
}) {
  const systems: ExampleStackSystem[] = [
    {
      label: "Next.js",
      role: "Product shell, application routes, and the operational UI layer."
    },
    {
      label: "Supabase",
      role: "Database, auth foundation, and structured backend persistence."
    },
    {
      label: "GitHub",
      role: "Source control, workflow visibility, and implementation handoff."
    },
    {
      label: "Vercel",
      role: "Launch-ready deployment path with preview environments."
    }
  ];

  if (
    args.framework.id === "subscription-platform" ||
    args.framework.id === "marketplace-system"
  ) {
    systems.push({
      label: "Stripe",
      role: "Billing, subscriptions, and payment flows when monetization is part of the build."
    });
  }

  if (args.productType.id === "mobile-app") {
    systems.unshift({
      label: "React Native + Expo",
      role: "Cross-platform mobile shell for iPhone and Android rollout."
    });
  }

  if (
    args.framework.id === "client-portal-service-platform" ||
    args.framework.id === "lead-generation-system" ||
    args.framework.id === "subscription-platform"
  ) {
    systems.push({
      label: "Resend",
      role: "Transactional email, updates, and customer communication handoff."
    });
  }

  if (
    args.framework.id === "dashboard-data-platform" ||
    args.framework.id === "lead-generation-system" ||
    args.framework.id === "marketplace-system"
  ) {
    systems.push({
      label: "PostHog",
      role: "Product analytics, conversion visibility, and decision instrumentation."
    });
  }

  if (args.framework.id === "content-community-platform") {
    systems.push({
      label: "CMS layer",
      role: "Structured content publishing and controlled member-facing updates."
    });
  }

  systems.push({
    label: "Auth layer",
    role: "Role-based access for operators, customers, or members depending on the product system."
  });

  return {
    headline: `${args.framework.label} stack recommendation`,
    summary: `For ${args.contextLabel}, Neroa would likely anchor this example in a ${args.framework.label.toLowerCase()} with a modern web application shell, a durable data layer, and the supporting systems needed for launch clarity.`,
    systems,
    notes: [
      "These are example systems, not a live scoped implementation plan.",
      "The stack recommendation adapts to the product type and framework so the simulation feels closer to a real build."
    ]
  } satisfies ExampleStackRecommendation;
}

function buildScopedFeatureList(args: {
  framework: ExampleFramework;
  contextLabel: string;
}) {
  switch (args.framework.id) {
    case "dashboard-data-platform":
      return {
        coreFeatures: [
          "Role-based dashboard views",
          `Filtered reporting built around ${args.contextLabel.toLowerCase()}`,
          "Saved views and shareable insight surfaces",
          "Search, filters, and export-ready decision support"
        ],
        keyModules: [
          "Dashboard shell",
          "Data ingestion layer",
          "Filters and saved views",
          "Permissions and reporting controls"
        ],
        firstBuild: [
          "Launch one dashboard with the core reporting views that users need weekly",
          "Add filtering, drill-down, and one shared export path",
          "Prove the reporting loop before expanding into broader analytics"
        ],
        mvpIncluded: [
          "Primary dashboard",
          "Authenticated access",
          "Filtered core data views",
          "One export or reporting share flow"
        ]
      };
    case "workflow-automation-system":
      return {
        coreFeatures: [
          "Task routing and status ownership",
          "Approval checkpoints",
          `Workflow views tailored to ${args.contextLabel.toLowerCase()}`,
          "Automated follow-up and audit visibility"
        ],
        keyModules: [
          "Workflow engine",
          "Approval queue",
          "Notifications and reminders",
          "Internal reporting layer"
        ],
        firstBuild: [
          "Choose one high-friction workflow",
          "Map states, ownership, and approvals",
          "Launch the dashboard and routing logic that prove the new process is faster"
        ],
        mvpIncluded: [
          "Single workflow orchestration",
          "Task inbox",
          "Approval routing",
          "Status dashboard"
        ]
      };
    case "marketplace-system":
      return {
        coreFeatures: [
          "Multi-role accounts",
          "Listings or provider discovery",
          "Matching or booking flow",
          "Transaction or service fulfillment visibility"
        ],
        keyModules: [
          "Buyer and provider profiles",
          "Discovery and search",
          "Booking or transaction engine",
          "Admin oversight layer"
        ],
        firstBuild: [
          "Keep the first release to one core transaction path",
          "Launch provider discovery and one trust-building profile layer",
          "Prove matching and fulfillment before widening the network"
        ],
        mvpIncluded: [
          "Account roles",
          "Discovery flow",
          "One booking or transaction path",
          "Basic admin oversight"
        ]
      };
    case "subscription-platform":
      return {
        coreFeatures: [
          "Account access and permissions",
          "Plan-based or member-based product access",
          "Billing and retention surfaces",
          "Core workflow that makes the subscription feel valuable"
        ],
        keyModules: [
          "Auth and billing layer",
          "Plan management",
          "Member dashboard",
          "Usage or value-delivery surface"
        ],
        firstBuild: [
          "Launch one core value path",
          "Connect subscriptions to account access cleanly",
          "Keep the first release focused on retention, not breadth"
        ],
        mvpIncluded: [
          "Billing and account access",
          "Primary product workflow",
          "Member dashboard",
          "Support for one clear recurring use case"
        ]
      };
    case "internal-operations-system":
      return {
        coreFeatures: [
          "Operational visibility",
          "Team ownership and accountability",
          "Status reporting",
          "Permissions around internal decision-making"
        ],
        keyModules: [
          "Internal dashboard",
          "Permissions model",
          "Ops reporting",
          "Shared activity log"
        ],
        firstBuild: [
          "Replace the most painful spreadsheet or manual status loop",
          "Give operators one reliable control surface",
          "Expand only after the team trusts the new system"
        ],
        mvpIncluded: [
          "Ops dashboard",
          "Internal roles",
          "Status and activity log",
          "Weekly reporting view"
        ]
      };
    case "lead-generation-system":
      return {
        coreFeatures: [
          "Inbound capture flow",
          "Qualification logic",
          "Assignment or follow-up routing",
          "Pipeline visibility"
        ],
        keyModules: [
          "Landing and intake flow",
          "Lead routing engine",
          "Qualification tracking",
          "Revenue dashboard"
        ],
        firstBuild: [
          "Launch the intake path first",
          "Connect lead qualification to immediate routing",
          "Track what moves into revenue instead of just collecting form fills"
        ],
        mvpIncluded: [
          "Primary intake flow",
          "Lead routing",
          "Qualification tags",
          "Pipeline visibility"
        ]
      };
    case "content-community-platform":
      return {
        coreFeatures: [
          "Member access and profiles",
          "Structured content delivery",
          "Community or engagement layer",
          "Retention-focused value loop"
        ],
        keyModules: [
          "Membership access",
          "Content publishing",
          "Community surfaces",
          "Engagement reporting"
        ],
        firstBuild: [
          "Launch the paid access layer and one core content flow",
          "Keep community tight and intentional",
          "Prove retention before expanding content breadth"
        ],
        mvpIncluded: [
          "Member access",
          "Core content delivery",
          "Profile and participation basics",
          "One retention loop"
        ]
      };
    case "client-portal-service-platform":
      return {
        coreFeatures: [
          "Client or customer access",
          "Service request or booking flow",
          "Status visibility",
          "Communication and delivery checkpoints"
        ],
        keyModules: [
          "Portal shell",
          "Requests or bookings",
          "Status tracking",
          "Team response workflow"
        ],
        firstBuild: [
          "Launch one clear service path",
          "Make status visible to the customer and the team",
          "Prove the experience is smoother before adding secondary modules"
        ],
        mvpIncluded: [
          "Customer or client login",
          "Primary request path",
          "Status view",
          "Team coordination basics"
        ]
      };
    default:
      return {
        coreFeatures: ["Core workflow", "Account access", "Visibility layer", "Launch-ready path"],
        keyModules: ["App shell", "Data layer", "Access control", "Reporting"],
        firstBuild: ["Start small", "Validate the workflow", "Expand after traction"],
        mvpIncluded: ["Core feature path", "Access", "One reporting loop", "Launch setup"]
      };
  }
}

function getProjectComplexityScore(args: {
  productTypeId: ExampleBuildTypeId;
  frameworkId: ExampleFrameworkId;
  contextProfile: ExampleContextProfile | null;
}) {
  const productScore =
    args.productTypeId === "internal-software"
      ? 2
      : args.productTypeId === "saas"
        ? 3
        : args.productTypeId === "external-app"
          ? 4
          : 5;
  const frameworkScore =
    args.frameworkId === "marketplace-system"
      ? 4
      : args.frameworkId === "subscription-platform" ||
          args.frameworkId === "client-portal-service-platform"
        ? 3
        : args.frameworkId === "content-community-platform"
          ? 2
          : 1;

  return productScore + frameworkScore + (args.contextProfile?.complexityBias ?? 0);
}

function getExampleCreditRange(args: {
  productTypeId: ExampleBuildTypeId;
  frameworkId: ExampleFrameworkId;
  contextProfile: ExampleContextProfile | null;
}) {
  const base =
    productTypeBaseCredits[args.productTypeId] +
    frameworkCreditBias[args.frameworkId] +
    (args.contextProfile?.complexityBias ?? 0) * 750;
  const min = roundToFiveHundred(base * 0.88);
  const max = roundToFiveHundred(base * 1.16);

  return { min, max };
}

function getTimelineStrings(maxCredits: number) {
  const monthlySlow = Math.max(2, Math.ceil(maxCredits / 2500));
  const monthlyFast = Math.max(1, Math.ceil(maxCredits / 9000));
  const managedWeeks =
    maxCredits >= 22000 ? "8-12 weeks" : maxCredits >= 16000 ? "6-8 weeks" : "4-6 weeks";

  return {
    slow: `Approximately ${monthlySlow} months on monthly credits`,
    fast: `Approximately ${monthlyFast} months with added credits`,
    managed: managedWeeks
  };
}

function getBuildPaths(args: {
  productType: ExampleBuildType;
  framework: ExampleFramework;
  contextLabel: string;
  maxCredits: number;
}) {
  const timelines = getTimelineStrings(args.maxCredits);
  const complexityScore = getProjectComplexityScore({
    productTypeId: args.productType.id,
    frameworkId: args.framework.id,
    contextProfile: null
  });

  let recommended: ExampleBuildPathId = "diy-accelerated";

  if (
    args.productType.id === "internal-software" &&
    (args.framework.id === "workflow-automation-system" ||
      args.framework.id === "internal-operations-system")
  ) {
    recommended = "diy-slower";
  } else if (
    args.productType.id === "mobile-app" ||
    args.framework.id === "marketplace-system" ||
    complexityScore >= 8
  ) {
    recommended = "managed";
  }

  return [
    {
      id: "diy-slower",
      label: "DIY Build at slower monthly pace",
      summary: `Best when you want to pace ${args.contextLabel.toLowerCase()} more conservatively and stay inside the monthly credit rhythm.`,
      timeline: timelines.slow,
      controlLevel: "Highest",
      supportLevel: "Guided by Neroa, self-driven execution",
      bestFor: "Budget-aware builders who want to keep decisions close and move at a measured pace.",
      recommended: recommended === "diy-slower"
    },
    {
      id: "diy-accelerated",
      label: "DIY Build accelerated with added credits",
      summary: `Best when you want to keep control but compress the launch pace for this ${args.framework.label.toLowerCase()}.`,
      timeline: timelines.fast,
      controlLevel: "High",
      supportLevel: "Guided by Neroa with faster execution capacity",
      bestFor: "Founders who want the DIY path but do not want the timeline stretched across too many months.",
      recommended: recommended === "diy-accelerated"
    },
    {
      id: "managed",
      label: "Managed Build",
      summary: `Best when the product needs tighter coordination, faster execution, or more hands-on help across build and launch.`,
      timeline: timelines.managed,
      controlLevel: "Shared",
      supportLevel: "Highest with staged Neroa involvement",
      bestFor: "Higher-complexity builds, urgent launches, or teams that want structured execution support.",
      recommended: recommended === "managed"
    }
  ] satisfies ExampleBuildPath[];
}

function buildProjectCopy(args: {
  title: string;
  productType: ExampleBuildType;
  framework: ExampleFramework;
  contextLabel: string;
  contextProfile: ExampleContextProfile | null;
  creditEstimate: string;
}) {
  const featureSet = buildScopedFeatureList({
    framework: args.framework,
    contextLabel: args.contextLabel
  });

  return {
    summary: `${args.title} shows how Neroa could turn ${args.contextLabel.toLowerCase()} into a ${args.framework.label.toLowerCase()} with a first build that is structured, realistic, and launchable.`,
    problem: `${args.contextProfile?.marketFocus ?? `${args.contextLabel} teams`} often rely on scattered tools, fragmented updates, and delayed visibility around the workflow this product is meant to solve.`,
    audience: `${args.contextProfile?.audienceLabel ?? `${args.contextLabel} operators`} who need a more reliable system than spreadsheets, disconnected apps, or a hand-built workaround.`,
    coreFeatures: featureSet.coreFeatures,
    keyModules: featureSet.keyModules,
    firstBuild: featureSet.firstBuild,
    mvpSummary: `For ${args.title}, the MVP stays focused on the smallest version of the ${args.framework.label.toLowerCase()} that can prove value without pretending the full platform is already built.`,
    mvpIncluded: featureSet.mvpIncluded,
    estimateNote: `Example estimate only. Neroa would still scope ${args.title.toLowerCase()} in the real build flow before final credits, timeline, and execution pacing are locked. Current illustrative range: ${args.creditEstimate}.`
  };
}

function buildExampleProject(args: {
  title: string;
  index: number;
  productType: ExampleBuildType;
  intentMode: ExampleIntentMode;
  industry?: ExampleIndustry | null;
  opportunityArea?: ExampleOpportunityArea | null;
  framework: ExampleFramework;
}) {
  const contextProfile = (args.industry ?? args.opportunityArea ?? null) as ExampleContextProfile | null;
  const contextLabel = getProjectContextLabel({
    intentMode: args.intentMode,
    industry: args.industry,
    opportunityArea: args.opportunityArea
  });
  const credits = getExampleCreditRange({
    productTypeId: args.productType.id,
    frameworkId: args.framework.id,
    contextProfile
  });
  const creditEstimate = formatCreditRange(credits.min, credits.max);
  const projectCopy = buildProjectCopy({
    title: args.title,
    productType: args.productType,
    framework: args.framework,
    contextLabel,
    contextProfile,
    creditEstimate
  });
  const stackRecommendation = getExampleStackRecommendation({
    productType: args.productType,
    framework: args.framework,
    contextLabel
  });
  const buildPaths = getBuildPaths({
    productType: args.productType,
    framework: args.framework,
    contextLabel,
    maxCredits: credits.max
  });

  return {
    id: [
      args.productType.id,
      args.intentMode,
      args.industry?.id ?? args.opportunityArea?.id ?? "general",
      args.framework.id,
      slugifySegment(args.title),
      String(args.index + 1)
    ].join(":"),
    typeId: args.productType.id,
    typeLabel: args.productType.label,
    intentMode: args.intentMode,
    industryId: args.industry?.id,
    industryLabel: args.industry?.label,
    opportunityAreaId: args.opportunityArea?.id,
    opportunityAreaLabel: args.opportunityArea?.label,
    frameworkId: args.framework.id,
    frameworkLabel: args.framework.label,
    title: args.title,
    summary: projectCopy.summary,
    problem: projectCopy.problem,
    audience: projectCopy.audience,
    coreFeatures: projectCopy.coreFeatures,
    keyModules: projectCopy.keyModules,
    firstBuild: projectCopy.firstBuild,
    mvpSummary: projectCopy.mvpSummary,
    mvpIncluded: projectCopy.mvpIncluded,
    creditEstimate,
    estimateNote: projectCopy.estimateNote,
    stackRecommendation,
    buildPaths
  } satisfies ExampleBuildProject;
}

function buildProjectsForSelection(args: {
  productTypeId: ExampleBuildTypeId;
  intentMode: ExampleIntentMode;
  industryId?: ExampleIndustryId | null;
  opportunityAreaId?: ExampleOpportunityAreaId | null;
  frameworkId: ExampleFrameworkId;
}) {
  const productType = getExampleBuildType(args.productTypeId);
  const framework = getExampleBuildFramework(args.frameworkId);
  const industry = args.industryId ? industryMap.get(args.industryId) ?? null : null;
  const opportunityArea = args.opportunityAreaId ? opportunityMap.get(args.opportunityAreaId) ?? null : null;

  if (!productType || !framework) {
    return [];
  }

  if (args.intentMode === "known-industry" && !industry) {
    return [];
  }

  if (args.intentMode === "exploring-opportunities" && !opportunityArea) {
    return [];
  }

  return getProjectTitles({
    productType,
    intentMode: args.intentMode,
    industry,
    opportunityArea,
    framework
  }).map((title, index) =>
    buildExampleProject({
      title,
      index,
      productType,
      intentMode: args.intentMode,
      industry,
      opportunityArea,
      framework
    })
  );
}

function buildAllExampleProjects() {
  const projects: ExampleBuildProject[] = [];

  for (const productType of exampleBuildTypes) {
    for (const industry of exampleIndustries) {
      for (const framework of getExampleFrameworksForSelection({
        productTypeId: productType.id,
        intentMode: "known-industry",
        industryId: industry.id
      })) {
        projects.push(
          ...buildProjectsForSelection({
            productTypeId: productType.id,
            intentMode: "known-industry",
            industryId: industry.id,
            frameworkId: framework.id
          })
        );
      }
    }

    for (const opportunityArea of exampleOpportunityAreas) {
      for (const framework of getExampleFrameworksForSelection({
        productTypeId: productType.id,
        intentMode: "exploring-opportunities",
        opportunityAreaId: opportunityArea.id
      })) {
        projects.push(
          ...buildProjectsForSelection({
            productTypeId: productType.id,
            intentMode: "exploring-opportunities",
            opportunityAreaId: opportunityArea.id,
            frameworkId: framework.id
          })
        );
      }
    }
  }

  return projects;
}

export const exampleBuildProjects = buildAllExampleProjects();

const exampleProjectMap = new Map(exampleBuildProjects.map((project) => [project.id, project]));

export function getExampleProjectsForSelection(args: {
  productTypeId?: ExampleBuildTypeId | null;
  intentMode?: ExampleIntentMode | null;
  industryId?: ExampleIndustryId | null;
  opportunityAreaId?: ExampleOpportunityAreaId | null;
  frameworkId?: ExampleFrameworkId | null;
}) {
  return exampleBuildProjects.filter((project) => {
    if (args.productTypeId && project.typeId !== args.productTypeId) {
      return false;
    }

    if (args.intentMode && project.intentMode !== args.intentMode) {
      return false;
    }

    if (args.industryId && project.industryId !== args.industryId) {
      return false;
    }

    if (args.opportunityAreaId && project.opportunityAreaId !== args.opportunityAreaId) {
      return false;
    }

    if (args.frameworkId && project.frameworkId !== args.frameworkId) {
      return false;
    }

    return true;
  });
}

export function getExampleProjectsForType(productTypeId: ExampleBuildTypeId) {
  const defaultFramework =
    getExampleFrameworksForSelection({
      productTypeId,
      intentMode: "known-industry",
      industryId: "healthcare"
    })[0] ?? null;

  if (!defaultFramework) {
    return [];
  }

  return getExampleProjectsForSelection({
    productTypeId,
    intentMode: "known-industry",
    industryId: "healthcare",
    frameworkId: defaultFramework.id
  });
}

export function getExampleBuildProject(projectId: string) {
  return exampleProjectMap.get(projectId) ?? null;
}

export function mapExampleSelectionToStartProductType(args: {
  productTypeId?: ExampleBuildTypeId | null;
  frameworkId?: ExampleFrameworkId | null;
}) {
  if (args.productTypeId === "mobile-app") {
    return "custom-mobile-product";
  }

  switch (args.frameworkId) {
    case "dashboard-data-platform":
      return args.productTypeId === "internal-software"
        ? "custom-internal-dashboard"
        : "custom-analytics-platform";
    case "workflow-automation-system":
      return "custom-workflow-automation";
    case "marketplace-system":
      return "custom-marketplace";
    case "subscription-platform":
      return "custom-subscription-app";
    case "internal-operations-system":
      return "custom-internal-dashboard";
    case "lead-generation-system":
      return "custom-revenue-system";
    case "content-community-platform":
      return "custom-customer-portal";
    case "client-portal-service-platform":
      return "custom-customer-portal";
    default:
      return args.productTypeId === "saas"
        ? "custom-subscription-app"
        : args.productTypeId === "internal-software"
          ? "custom-internal-dashboard"
          : args.productTypeId === "external-app"
            ? "custom-customer-portal"
            : "custom-mobile-product";
  }
}

export function buildExampleSelectionSummary(args: {
  productType?: ExampleBuildType | null;
  intentMode?: ExampleIntentMode | null;
  industry?: ExampleIndustry | null;
  opportunityArea?: ExampleOpportunityArea | null;
  framework?: ExampleFramework | null;
  project?: ExampleBuildProject | null;
}) {
  const lines = [
    args.productType ? `Product type: ${args.productType.label}.` : null,
    args.intentMode === "known-industry" && args.industry
      ? `Industry: ${args.industry.label}.`
      : null,
    args.intentMode === "exploring-opportunities" && args.opportunityArea
      ? `Opportunity area: ${args.opportunityArea.label}.`
      : null,
    args.framework ? `Framework: ${args.framework.label}.` : null,
    args.project ? `Example project: ${args.project.title}.` : null
  ].filter(isDefined);

  return lines.join(" ");
}
