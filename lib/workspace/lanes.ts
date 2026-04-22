import { getModuleDefinitions } from "@/lib/workspace/modules";
import type { LaneDefinition, LaneId } from "@/lib/workspace/types";

export const laneRegistry: Record<LaneId, LaneDefinition> = {
  business: {
    id: "business",
    name: "Business",
    description: "Shape the business foundation, plan, offer, and execution path.",
    icon: "BU",
    status: "active",
    layoutType: "planning",
    defaultModules: ["overview", "roadmap", "business-plan", "strategy", "budget", "launch-plan", "risk-notes"],
    recommendedAIStack: ["Neroa Execution Layer", "Business plan", "Roadmap", "Budget model"],
    starterPrompts: [
      "Clarify the business model and first offer.",
      "Map the first 90 days of execution.",
      "Turn the concept into a practical business plan."
    ],
    supportingLanes: ["website", "marketing", "operations"]
  },
  branding: {
    id: "branding",
    name: "Branding",
    description: "Define brand direction, naming, and presentation system.",
    icon: "BR",
    status: "active",
    layoutType: "content",
    defaultModules: ["overview", "domain-brand", "copy", "pages"],
    recommendedAIStack: ["Neroa Execution Layer", "Brand narrative", "Naming matrix", "Page messaging"],
    starterPrompts: [
      "Develop the brand direction and voice.",
      "Explore naming and domain options.",
      "Align the brand story with the offer."
    ],
    supportingLanes: ["website", "marketing"]
  },
  website: {
    id: "website",
    name: "Website",
    description: "Plan the site structure, messaging, and release priorities.",
    icon: "WE",
    status: "active",
    layoutType: "content",
    defaultModules: ["overview", "site-plan", "pages", "copy", "launch-plan"],
    recommendedAIStack: ["Neroa Execution Layer", "Site plan", "Page map", "Copy system"],
    starterPrompts: [
      "Plan the first website version.",
      "Map the page structure and key pages.",
      "Draft conversion-focused site copy."
    ],
    supportingLanes: ["branding", "marketing"]
  },
  "saas-app": {
    id: "saas-app",
    name: "SaaS / App",
    description: "Scope the product, MVP, roadmap, and implementation direction.",
    icon: "SA",
    status: "active",
    layoutType: "planning",
    defaultModules: ["overview", "product-brief", "mvp-scope", "features", "tech-stack", "roadmap", "tasks"],
    recommendedAIStack: ["Neroa Execution Layer", "Next.js App Router", "TypeScript", "Supabase"],
    starterPrompts: [
      "Define the product brief and MVP.",
      "Sequence the app into build phases.",
      "Recommend the first technical stack."
    ],
    supportingLanes: ["website", "marketing", "operations"]
  },
  marketing: {
    id: "marketing",
    name: "Marketing",
    description: "Translate the strategy into campaigns, positioning, and launch motion.",
    icon: "MK",
    status: "active",
    layoutType: "campaign",
    defaultModules: ["overview", "marketing-plan", "campaigns", "funnels", "content-calendar", "launch-plan"],
    recommendedAIStack: ["Neroa Execution Layer", "Campaign plan", "Funnel map", "Content calendar"],
    starterPrompts: [
      "Build the initial marketing plan.",
      "Create the first campaigns and funnel ideas.",
      "Sequence launch marketing around the offer."
    ],
    supportingLanes: ["content-media", "sales", "website"]
  },
  sales: {
    id: "sales",
    name: "Sales",
    description: "Support pipeline thinking, outbound strategy, and conversion operations.",
    icon: "SL",
    status: "active",
    layoutType: "campaign",
    defaultModules: ["overview", "strategy", "funnels", "tasks"],
    recommendedAIStack: ["Neroa Execution Layer", "Pipeline plan", "Outbound sequence", "Conversion workflow"],
    starterPrompts: [
      "Outline an outbound or pipeline strategy.",
      "Turn the offer into a sales motion.",
      "Create a simple conversion workflow."
    ],
    supportingLanes: ["marketing", "operations"]
  },
  "content-media": {
    id: "content-media",
    name: "Content / Media",
    description: "Coordinate content direction, publishing, and media execution.",
    icon: "CM",
    status: "active",
    layoutType: "content",
    defaultModules: ["overview", "content-calendar", "copy", "community-plan"],
    recommendedAIStack: ["Neroa Execution Layer", "Content calendar", "Copy system", "Distribution plan"],
    starterPrompts: [
      "Plan the first content series.",
      "Map content around audience and offer.",
      "Turn the brand into repeatable media output."
    ],
    supportingLanes: ["marketing", "branding"]
  },
  operations: {
    id: "operations",
    name: "Operations",
    description: "Organize workflows, SOPs, systems, and ongoing operating work.",
    icon: "OP",
    status: "active",
    layoutType: "workflow",
    defaultModules: ["overview", "workflow-map", "sops", "data-entry", "advertising-ops", "automation-ideas", "tasks"],
    recommendedAIStack: ["Neroa Execution Layer", "Workflow map", "SOPs", "Automation layer"],
    starterPrompts: [
      "Map the current workflow and bottlenecks.",
      "Define the SOPs and repetitive tasks.",
      "Find the highest leverage automation opportunities."
    ],
    supportingLanes: ["automation-ai-systems", "sales", "content-media"]
  },
  "automation-ai-systems": {
    id: "automation-ai-systems",
    name: "Automation / AI Systems",
    description: "Support AI systems thinking, automations, and structured task routing.",
    icon: "AI",
    status: "active",
    layoutType: "planning",
    defaultModules: ["overview", "automation-ideas", "workflow-map", "tech-stack", "tasks"],
    recommendedAIStack: ["Neroa Execution Layer", "Automation map", "System design", "Tool stack"],
    starterPrompts: [
      "Identify AI systems that remove repetitive work.",
      "Map automations across the workflow.",
      "Recommend the first automation architecture."
    ],
    supportingLanes: ["operations", "saas-app"]
  },
  crypto: {
    id: "crypto",
    name: "Crypto",
    description: "Plan crypto, protocol, and blockchain product initiatives with more structure.",
    icon: "CR",
    status: "active",
    layoutType: "planning",
    defaultModules: ["overview", "project-concept", "mvp-scope", "community-plan", "risk-notes", "launch-plan"],
    recommendedAIStack: ["Neroa Execution Layer", "Project concept", "Launch plan", "Community strategy"],
    starterPrompts: [
      "Turn the crypto idea into a structured project concept.",
      "Define the first release and ecosystem plan.",
      "Map risk, launch sequencing, and community motion."
    ],
    supportingLanes: ["marketing", "website", "operations"]
  }
};

export const activeLanes = Object.values(laneRegistry).filter((lane) => lane.status === "active");

export function getLaneById(laneId: LaneId) {
  return laneRegistry[laneId];
}

export function getVisibleLanes() {
  return activeLanes;
}

export function normalizeLaneId(value: string | null | undefined): LaneId | null {
  if (!value) {
    return null;
  }

  const laneId = value as LaneId;
  return laneRegistry[laneId] ? laneId : null;
}

export function parseSupportingLaneIds(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => normalizeLaneId(item.trim()))
        .filter((item): item is LaneId => Boolean(item))
    )
  );
}

export function inferLaneSelection(input: string) {
  const normalized = input.toLowerCase();

  if (
    normalized.includes("erp") ||
    normalized.includes("data entry") ||
    normalized.includes("operations") ||
    normalized.includes("workflow") ||
    normalized.includes("repetitive task") ||
    normalized.includes("back office")
  ) {
    return {
      primaryLaneId: "operations" as LaneId,
      supportingLaneIds: ["automation-ai-systems", "sales"] as LaneId[]
    };
  }

  if (
    normalized.includes("saas") ||
    normalized.includes("software") ||
    normalized.includes("app") ||
    normalized.includes("platform")
  ) {
    return {
      primaryLaneId: "saas-app" as LaneId,
      supportingLaneIds: ["website", "marketing", "operations"] as LaneId[]
    };
  }

  if (
    normalized.includes("website") ||
    normalized.includes("landing page") ||
    normalized.includes("site")
  ) {
    return {
      primaryLaneId: "website" as LaneId,
      supportingLaneIds: ["branding", "marketing"] as LaneId[]
    };
  }

  if (
    normalized.includes("crypto") ||
    normalized.includes("blockchain") ||
    normalized.includes("token") ||
    normalized.includes("wallet")
  ) {
    return {
      primaryLaneId: "crypto" as LaneId,
      supportingLaneIds: ["website", "marketing", "operations"] as LaneId[]
    };
  }

  if (
    normalized.includes("marketing") ||
    normalized.includes("campaign") ||
    normalized.includes("ads") ||
    normalized.includes("advertising")
  ) {
    return {
      primaryLaneId: "marketing" as LaneId,
      supportingLaneIds: ["content-media", "sales", "website"] as LaneId[]
    };
  }

  return {
    primaryLaneId: "business" as LaneId,
    supportingLaneIds: ["website", "marketing", "operations"] as LaneId[]
  };
}

export function deriveWorkspaceLanes(args: {
  name: string;
  description?: string | null;
  requestedPrimaryLaneId?: string | null;
  requestedSupportingLaneIds?: string | null;
}) {
  const requestedPrimaryLaneId = normalizeLaneId(args.requestedPrimaryLaneId);
  const requestedSupportingLaneIds = parseSupportingLaneIds(args.requestedSupportingLaneIds);

  if (requestedPrimaryLaneId) {
    const supportingLaneIds = requestedSupportingLaneIds.filter(
      (laneId) => laneId !== requestedPrimaryLaneId
    );

    return {
      primaryLaneId: requestedPrimaryLaneId,
      supportingLaneIds
    };
  }

  const inferred = inferLaneSelection(`${args.name}\n${args.description ?? ""}`);

  return inferred;
}

export function getLaneModuleDefinitions(laneId: LaneId) {
  return getModuleDefinitions(laneRegistry[laneId].defaultModules);
}

export function getLaneLayoutSections(laneId: LaneId) {
  const lane = laneRegistry[laneId];

  return {
    planning: [
      {
        title: "Planning focus",
        text: "This lane is built for thinking, sequencing, and scope control before execution spreads too wide."
      },
      {
        title: "Use Neroa here for",
        text: "Clarifying priorities, narrowing the first release, and tightening decision quality."
      }
    ],
    content: [
      {
        title: "Content focus",
        text: "This lane is built for structure, messaging, pages, and outward-facing presentation."
      },
      {
        title: "Use Neroa here for",
        text: "Clarifying page roles, message hierarchy, and what content should exist first."
      }
    ],
    campaign: [
      {
        title: "Campaign focus",
        text: "This lane is built for growth motion, launch sequencing, and repeatable marketing or sales activity."
      },
      {
        title: "Use Neroa here for",
        text: "Choosing channels, sequencing campaigns, and narrowing the next test."
      }
    ],
    workflow: [
      {
        title: "Workflow focus",
        text: "This lane is built for operational movement, SOPs, systems, and repetitive work support."
      },
      {
        title: "Use Neroa here for",
        text: "Mapping systems, identifying bottlenecks, and deciding what should be automated first."
      }
    ]
  }[lane.layoutType];
}
