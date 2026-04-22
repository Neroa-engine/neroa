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

export type ExampleContextProfile = {
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

export function slugifySegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatCreditRange(min: number, max: number) {
  return `${min.toLocaleString("en-US")} - ${max.toLocaleString("en-US")} Engine Credits`;
}

export function roundToFiveHundred(value: number) {
  return Math.round(value / 500) * 500;
}

export function isDefined<T>(value: T | null | undefined): value is T {
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
export const industryMap = new Map(exampleIndustries.map((item) => [item.id, item]));
export const opportunityMap = new Map(exampleOpportunityAreas.map((item) => [item.id, item]));
const frameworkMap = new Map(exampleFrameworks.map((item) => [item.id, item]));

export const productTypeBaseCredits: Record<ExampleBuildTypeId, number> = {
  saas: 10000,
  "internal-software": 8000,
  "external-app": 12000,
  "mobile-app": 15000
};

export const frameworkCreditBias: Record<ExampleFrameworkId, number> = {
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

