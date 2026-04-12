import type { NaruaMessage } from "@/lib/narua/planning";
import { normalizeLaneId } from "@/lib/workspace/lanes";
import type { LaneId } from "@/lib/workspace/types";

export type ProjectTemplateId =
  | "business-launch"
  | "saas-build"
  | "coding-project"
  | "ecommerce-brand";

export type ProjectLaneStatus = "active" | "recommended" | "optional";

export type ProjectLaneBlueprint = {
  title: string;
  description: string;
  status: ProjectLaneStatus;
  focusLabel: string;
  recommendedAIStack: string[];
  starterPrompts: string[];
  deliverables: string[];
};

export type CustomProjectLaneInput = Partial<ProjectLaneBlueprint> & {
  title: string;
  description: string;
};

export type ProjectLaneRecord = {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  description: string;
  status: ProjectLaneStatus;
  sortOrder: number;
  focusLabel: string;
  recommendedAIStack: string[];
  starterPrompts: string[];
  deliverables: string[];
};

export type ProjectRecord = {
  id: string;
  workspaceId: string;
  templateId: ProjectTemplateId;
  templateLabel: string;
  title: string;
  description: string | null;
  lanes: ProjectLaneRecord[];
};

export type LaneConversationSnapshot = {
  messages: NaruaMessage[];
  draft: string;
  updatedAt: string;
};

type ProjectTemplateDefinition = {
  id: ProjectTemplateId;
  label: string;
  description: string;
  lanes: ProjectLaneBlueprint[];
};

const projectTemplateRegistry: Record<ProjectTemplateId, ProjectTemplateDefinition> = {
  "business-launch": {
    id: "business-launch",
    label: "Business Launch",
    description: "Structured for launching a new business, offer, and operating system.",
    lanes: [
      {
        title: "Strategy",
        description: "Clarify the business direction, target customer, offer logic, and launch priorities.",
        status: "active",
        focusLabel: "Business direction",
        recommendedAIStack: ["Narua Execution Layer", "Strategy brief", "Offer logic"],
        starterPrompts: [
          "Clarify the business model and positioning.",
          "Define the first customer segment.",
          "Tighten the launch direction."
        ],
        deliverables: ["Positioning", "Target customer", "Offer logic", "Launch direction"]
      },
      {
        title: "Business Plan",
        description: "Turn the concept into a structured business plan, milestones, and launch assumptions.",
        status: "active",
        focusLabel: "Business structure",
        recommendedAIStack: ["Narua Execution Layer", "Business plan", "Roadmap"],
        starterPrompts: [
          "Draft the first business plan.",
          "Map the 90-day milestone sequence.",
          "Define the launch assumptions."
        ],
        deliverables: ["Business plan", "Milestones", "Launch assumptions", "Operating scope"]
      },
      {
        title: "Budget",
        description: "Model the startup budget, cost priorities, and early financial assumptions.",
        status: "active",
        focusLabel: "Financial planning",
        recommendedAIStack: ["Narua Execution Layer", "Budget model", "Cost planning"],
        starterPrompts: [
          "Build the startup budget.",
          "Map the essential launch costs.",
          "Define the cash priorities."
        ],
        deliverables: ["Startup budget", "Cost assumptions", "Cash priorities", "Budget checkpoints"]
      },
      {
        title: "Domain Search",
        description: "Explore naming and domain options for the business launch path.",
        status: "recommended",
        focusLabel: "Digital foundation",
        recommendedAIStack: ["Narua Execution Layer", "Naming shortlist", "Domain setup"],
        starterPrompts: [
          "Find naming directions that fit the offer.",
          "Build a shortlist of domain ideas.",
          "Map the first domain setup steps."
        ],
        deliverables: ["Naming options", "Domain shortlist", "Setup checklist", "Launch domain notes"]
      },
      {
        title: "Branding",
        description: "Define the brand voice, message pillars, and presentation system.",
        status: "recommended",
        focusLabel: "Brand system",
        recommendedAIStack: ["Narua Execution Layer", "Brand narrative", "Voice system"],
        starterPrompts: [
          "Develop the brand direction.",
          "Define the voice and message pillars.",
          "Align the brand to the offer."
        ],
        deliverables: ["Brand narrative", "Voice system", "Message pillars", "Presentation notes"]
      },
      {
        title: "Website",
        description: "Plan the site structure, content flow, and digital launch path.",
        status: "recommended",
        focusLabel: "Website execution",
        recommendedAIStack: ["Narua Execution Layer", "Site map", "Copy system", "Launch site"],
        starterPrompts: [
          "Plan the first website structure.",
          "Outline the page flow.",
          "Define what the site needs for launch."
        ],
        deliverables: ["Site map", "Page flow", "Launch checklist", "Conversion path"]
      },
      {
        title: "Operations",
        description: "Map the internal workflow, delivery process, and operating routines.",
        status: "recommended",
        focusLabel: "Operational readiness",
        recommendedAIStack: ["Narua Execution Layer", "Workflow map", "SOPs"],
        starterPrompts: [
          "Map the operating workflow.",
          "List the key delivery steps.",
          "Define the first SOPs."
        ],
        deliverables: ["Workflow map", "Delivery process", "SOP notes", "Execution checklist"]
      },
      {
        title: "Marketing",
        description: "Turn the business into a launch motion with channels, campaigns, and demand generation.",
        status: "recommended",
        focusLabel: "Go-to-market motion",
        recommendedAIStack: ["Narua Execution Layer", "Marketing plan", "Campaign map"],
        starterPrompts: [
          "Build the first marketing plan.",
          "Choose the first demand channels.",
          "Sequence the launch promotion path."
        ],
        deliverables: ["Marketing plan", "Campaign priorities", "Acquisition ideas", "Launch promotion steps"]
      }
    ]
  },
  "saas-build": {
    id: "saas-build",
    label: "SaaS Build",
    description: "Structured for product planning, software build, launch, and growth.",
    lanes: [
      {
        title: "Product Strategy",
        description: "Define the product direction, problem framing, user, and value proposition.",
        status: "active",
        focusLabel: "Product direction",
        recommendedAIStack: ["Narua Execution Layer", "Product brief", "User problem map"],
        starterPrompts: [
          "Define the product opportunity.",
          "Clarify the first user problem.",
          "Tighten the value proposition."
        ],
        deliverables: ["Product brief", "User problem", "Value proposition", "Launch positioning"]
      },
      {
        title: "MVP Scope",
        description: "Reduce the product to the smallest useful buildable version.",
        status: "active",
        focusLabel: "MVP definition",
        recommendedAIStack: ["Narua Execution Layer", "MVP scope", "Feature trim"],
        starterPrompts: [
          "Define the MVP boundary.",
          "Cut the feature set to the smallest useful version.",
          "Clarify the first release."
        ],
        deliverables: ["MVP definition", "Feature priorities", "Release boundary", "User flow"]
      },
      {
        title: "Architecture",
        description: "Map the technical architecture, data flow, and system decisions.",
        status: "active",
        focusLabel: "Technical architecture",
        recommendedAIStack: ["Narua Execution Layer", "Architecture notes", "System map"],
        starterPrompts: [
          "Outline the technical architecture.",
          "Choose the core system shape.",
          "Map the data and API boundaries."
        ],
        deliverables: ["Architecture notes", "System map", "Data flow", "Technical decisions"]
      },
      {
        title: "Coding",
        description: "Drive implementation planning, engineering tasks, and build execution.",
        status: "active",
        focusLabel: "Implementation execution",
        recommendedAIStack: ["Narua Execution Layer", "Build backlog", "Engineering tasks"],
        starterPrompts: [
          "Turn the product into an implementation backlog.",
          "Sequence the first build milestones.",
          "Define the engineering priorities."
        ],
        deliverables: ["Engineering backlog", "Implementation phases", "Task breakdown", "Build sequence"]
      },
      {
        title: "Data Model",
        description: "Define entities, relationships, and data boundaries for the product.",
        status: "recommended",
        focusLabel: "Data structure",
        recommendedAIStack: ["Narua Execution Layer", "Data model", "Entity map"],
        starterPrompts: [
          "Map the core entities.",
          "Design the first data model.",
          "Define the data relationships."
        ],
        deliverables: ["Entity map", "Data model", "Relationship notes", "Schema outline"]
      },
      {
        title: "UI UX",
        description: "Shape the interface system, product flow, and user-facing experience.",
        status: "recommended",
        focusLabel: "Interface design",
        recommendedAIStack: ["Narua Execution Layer", "UX flow", "Interface notes"],
        starterPrompts: [
          "Map the primary user journey.",
          "Define the interface priorities.",
          "Shape the product flow."
        ],
        deliverables: ["User flow", "Interface priorities", "Screen notes", "UX decisions"]
      },
      {
        title: "Launch Website",
        description: "Plan the public-facing website, launch page, and conversion surface for the product.",
        status: "optional",
        focusLabel: "Public launch surface",
        recommendedAIStack: ["Narua Execution Layer", "Launch site", "Messaging system"],
        starterPrompts: [
          "Plan the launch site.",
          "Draft the landing page structure.",
          "Define the launch messaging."
        ],
        deliverables: ["Landing page plan", "Launch messaging", "Site structure", "Conversion goals"]
      },
      {
        title: "Growth",
        description: "Build the initial go-to-market, acquisition, and growth plan for the product.",
        status: "optional",
        focusLabel: "Growth motion",
        recommendedAIStack: ["Narua Execution Layer", "Growth plan", "Launch channels"],
        starterPrompts: [
          "Build the first growth plan.",
          "Choose the first acquisition channels.",
          "Map the launch sequence."
        ],
        deliverables: ["Growth plan", "Acquisition channels", "Launch sequence", "Early experiments"]
      }
    ]
  },
  "coding-project": {
    id: "coding-project",
    label: "Coding Project",
    description: "Structured for software delivery, code organization, testing, and release.",
    lanes: [
      {
        title: "Requirements",
        description: "Clarify what needs to be built, fixed, or refactored before code starts moving.",
        status: "active",
        focusLabel: "Build requirements",
        recommendedAIStack: ["Narua Execution Layer", "Requirements brief", "Acceptance criteria"],
        starterPrompts: [
          "Clarify the technical goal.",
          "Define the acceptance criteria.",
          "List the key constraints."
        ],
        deliverables: ["Requirements brief", "Acceptance criteria", "Constraints", "Scope notes"]
      },
      {
        title: "Architecture",
        description: "Map the codebase structure, affected systems, and technical decisions.",
        status: "active",
        focusLabel: "Code structure",
        recommendedAIStack: ["Narua Execution Layer", "Architecture notes", "Dependency map"],
        starterPrompts: [
          "Map the relevant architecture.",
          "Identify the affected subsystems.",
          "Clarify the technical approach."
        ],
        deliverables: ["Architecture notes", "Dependency map", "Risk areas", "Technical approach"]
      },
      {
        title: "Coding",
        description: "Drive implementation, code changes, and engineering execution.",
        status: "active",
        focusLabel: "Code execution",
        recommendedAIStack: ["Narua Execution Layer", "Implementation plan", "Task list"],
        starterPrompts: [
          "Break the work into implementation steps.",
          "Sequence the code changes.",
          "Define the next engineering task."
        ],
        deliverables: ["Implementation plan", "Task list", "Change set", "Execution order"]
      },
      {
        title: "Testing",
        description: "Plan verification, coverage, regression safety, and release confidence.",
        status: "recommended",
        focusLabel: "Verification",
        recommendedAIStack: ["Narua Execution Layer", "Test plan", "Regression checks"],
        starterPrompts: [
          "Define the test plan.",
          "List the key regression risks.",
          "Map the verification steps."
        ],
        deliverables: ["Test plan", "Regression checklist", "Coverage focus", "Verification notes"]
      },
      {
        title: "Deployment",
        description: "Map the release path, rollout concerns, and deployment readiness.",
        status: "recommended",
        focusLabel: "Release readiness",
        recommendedAIStack: ["Narua Execution Layer", "Release checklist", "Deployment notes"],
        starterPrompts: [
          "Plan the deployment path.",
          "List the rollout risks.",
          "Define the release checklist."
        ],
        deliverables: ["Release checklist", "Deployment notes", "Rollout risks", "Launch sequence"]
      },
      {
        title: "Documentation",
        description: "Capture docs, onboarding notes, and operational context for the codebase.",
        status: "optional",
        focusLabel: "Technical documentation",
        recommendedAIStack: ["Narua Execution Layer", "Docs outline", "Onboarding notes"],
        starterPrompts: [
          "List the docs that need updating.",
          "Define the onboarding notes.",
          "Plan the documentation updates."
        ],
        deliverables: ["Docs outline", "Onboarding notes", "Release notes", "Usage updates"]
      }
    ]
  },
  "ecommerce-brand": {
    id: "ecommerce-brand",
    label: "Ecommerce Brand",
    description: "Structured for brand launch, storefront planning, catalog, operations, and marketing.",
    lanes: [
      {
        title: "Brand Strategy",
        description: "Define the brand direction, customer promise, and positioning in market.",
        status: "active",
        focusLabel: "Brand direction",
        recommendedAIStack: ["Narua Execution Layer", "Brand strategy", "Positioning"],
        starterPrompts: [
          "Clarify the brand positioning.",
          "Define the customer promise.",
          "Map the brand direction."
        ],
        deliverables: ["Positioning", "Customer promise", "Brand direction", "Message pillars"]
      },
      {
        title: "Product Catalog",
        description: "Map the first product lineup, merchandising logic, and product priorities.",
        status: "active",
        focusLabel: "Merchandising plan",
        recommendedAIStack: ["Narua Execution Layer", "Catalog plan", "Product priorities"],
        starterPrompts: [
          "Define the launch catalog.",
          "Choose the first product priorities.",
          "Map the merchandising logic."
        ],
        deliverables: ["Catalog plan", "Product priorities", "Merchandising notes", "Product lineup"]
      },
      {
        title: "Storefront",
        description: "Plan the ecommerce storefront, conversion path, and shopping flow.",
        status: "active",
        focusLabel: "Storefront execution",
        recommendedAIStack: ["Narua Execution Layer", "Storefront plan", "Conversion path"],
        starterPrompts: [
          "Plan the storefront experience.",
          "Outline the shopping flow.",
          "Define the key conversion pages."
        ],
        deliverables: ["Storefront plan", "Shopping flow", "Conversion pages", "Launch structure"]
      },
      {
        title: "Domain Search",
        description: "Explore the domain and naming path for the ecommerce brand.",
        status: "recommended",
        focusLabel: "Naming and domain",
        recommendedAIStack: ["Narua Execution Layer", "Naming shortlist", "Domain setup"],
        starterPrompts: [
          "Create a naming shortlist.",
          "Find domain options.",
          "Map the domain setup path."
        ],
        deliverables: ["Name shortlist", "Domain options", "Setup notes", "Brand naming direction"]
      },
      {
        title: "Branding",
        description: "Define the voice, identity direction, and presentation system for the brand.",
        status: "recommended",
        focusLabel: "Brand identity",
        recommendedAIStack: ["Narua Execution Layer", "Identity direction", "Voice system"],
        starterPrompts: [
          "Define the visual direction.",
          "Clarify the voice and tone.",
          "Align branding with the product line."
        ],
        deliverables: ["Identity direction", "Voice system", "Brand notes", "Message system"]
      },
      {
        title: "Operations",
        description: "Map fulfillment, delivery workflows, inventory assumptions, and support systems.",
        status: "recommended",
        focusLabel: "Store operations",
        recommendedAIStack: ["Narua Execution Layer", "Ops plan", "Fulfillment map"],
        starterPrompts: [
          "Map the fulfillment workflow.",
          "Define the inventory assumptions.",
          "Plan the support and delivery system."
        ],
        deliverables: ["Fulfillment map", "Inventory assumptions", "Support flow", "Ops checklist"]
      },
      {
        title: "Marketing",
        description: "Build the brand launch motion, acquisition channels, and promotional strategy.",
        status: "recommended",
        focusLabel: "Launch marketing",
        recommendedAIStack: ["Narua Execution Layer", "Launch marketing", "Channel plan"],
        starterPrompts: [
          "Build the launch marketing plan.",
          "Choose the first channels.",
          "Sequence the promotional rollout."
        ],
        deliverables: ["Launch marketing plan", "Channel priorities", "Promo sequence", "Acquisition ideas"]
      },
      {
        title: "Budget",
        description: "Model startup costs, inventory assumptions, and launch budget needs.",
        status: "optional",
        focusLabel: "Launch budget",
        recommendedAIStack: ["Narua Execution Layer", "Budget model", "Cost planning"],
        starterPrompts: [
          "Build the launch budget.",
          "Define the inventory and marketing budget.",
          "Map the startup cash priorities."
        ],
        deliverables: ["Launch budget", "Cost assumptions", "Inventory budget", "Cash priorities"]
      }
    ]
  }
};

const legacyLaneKeywords: Record<LaneId, string[]> = {
  business: ["strategy", "business-plan", "brand-strategy"],
  branding: ["branding", "domain-search", "brand-strategy"],
  website: ["website", "launch-website", "storefront"],
  "saas-app": ["coding", "mvp-scope", "product-strategy", "architecture"],
  marketing: ["marketing", "growth"],
  sales: ["marketing", "growth"],
  "content-media": ["marketing", "branding"],
  operations: ["operations", "deployment"],
  "automation-ai-systems": ["operations", "architecture"],
  crypto: ["strategy", "budget", "marketing"]
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeLaneBlueprint(
  blueprint: ProjectLaneBlueprint | CustomProjectLaneInput
): ProjectLaneBlueprint {
  return {
    title: blueprint.title,
    description: blueprint.description,
    status: blueprint.status ?? "optional",
    focusLabel: blueprint.focusLabel ?? blueprint.title,
    recommendedAIStack: blueprint.recommendedAIStack ?? ["Narua Execution Layer"],
    starterPrompts: blueprint.starterPrompts ?? [],
    deliverables: blueprint.deliverables ?? []
  };
}

export function getProjectTemplateDefinition(templateId: ProjectTemplateId) {
  return projectTemplateRegistry[templateId];
}

export function inferProjectTemplate(args: {
  name: string;
  description?: string | null;
  primaryLaneId?: LaneId | null;
}) {
  const text = `${args.name}\n${args.description ?? ""}`.toLowerCase();

  if (
    text.includes("shopify") ||
    text.includes("ecommerce") ||
    text.includes("e-commerce") ||
    text.includes("storefront") ||
    text.includes("product catalog") ||
    text.includes("brand launch")
  ) {
    return "ecommerce-brand" as const;
  }

  if (
    text.includes("coding") ||
    text.includes("codebase") ||
    text.includes("repository") ||
    text.includes("repo") ||
    text.includes("sdk") ||
    text.includes("library") ||
    text.includes("cli") ||
    text.includes("refactor") ||
    text.includes("bug fix")
  ) {
    return "coding-project" as const;
  }

  if (
    args.primaryLaneId === "saas-app" ||
    text.includes("saas") ||
    text.includes("software") ||
    text.includes("app") ||
    text.includes("platform")
  ) {
    return "saas-build" as const;
  }

  return "business-launch" as const;
}

export function createProjectLaneRecord(args: {
  projectId: string;
  sortOrder: number;
  blueprint: ProjectLaneBlueprint | CustomProjectLaneInput;
}) {
  const normalizedBlueprint = normalizeLaneBlueprint(args.blueprint);
  const slug = slugify(normalizedBlueprint.title);

  return {
    id: `${args.projectId}:${slug}`,
    projectId: args.projectId,
    title: normalizedBlueprint.title,
    slug,
    description: normalizedBlueprint.description,
    status: normalizedBlueprint.status,
    sortOrder: args.sortOrder,
    focusLabel: normalizedBlueprint.focusLabel,
    recommendedAIStack: normalizedBlueprint.recommendedAIStack,
    starterPrompts: normalizedBlueprint.starterPrompts,
    deliverables: normalizedBlueprint.deliverables
  } satisfies ProjectLaneRecord;
}

export function buildProjectModel(args: {
  workspaceId: string;
  projectId: string;
  title: string;
  description?: string | null;
  primaryLaneId?: LaneId | null;
  customLanes?: CustomProjectLaneInput[];
}) {
  const templateId = inferProjectTemplate({
    name: args.title,
    description: args.description,
    primaryLaneId: args.primaryLaneId
  });
  const template = getProjectTemplateDefinition(templateId);
  const laneBlueprints = [...template.lanes, ...(args.customLanes ?? [])];
  const lanes = laneBlueprints.map((blueprint, index) =>
    createProjectLaneRecord({
      projectId: args.projectId,
      sortOrder: index,
      blueprint
    })
  );

  return {
    id: args.projectId,
    workspaceId: args.workspaceId,
    templateId,
    templateLabel: template.label,
    title: args.title,
    description: args.description ?? null,
    lanes
  } satisfies ProjectRecord;
}

export function getProjectLaneBySlug(project: ProjectRecord, laneSlug: string) {
  return project.lanes.find((lane) => lane.slug === laneSlug) ?? null;
}

export function getProjectLanesByStatus(
  project: ProjectRecord,
  status: ProjectLaneStatus
) {
  return project.lanes
    .filter((lane) => lane.status === status)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function resolveProjectLaneSlug(project: ProjectRecord, value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalizedValue = slugify(value);
  const directMatch = project.lanes.find((lane) => lane.slug === normalizedValue);

  if (directMatch) {
    return directMatch.slug;
  }

  const legacyLaneId = normalizeLaneId(value);

  if (!legacyLaneId) {
    return null;
  }

  const keywordMatch = legacyLaneKeywords[legacyLaneId]
    .flatMap((keyword) => project.lanes.filter((lane) => lane.slug.includes(keyword)))
    .sort((left, right) => left.sortOrder - right.sortOrder)[0];

  return keywordMatch?.slug ?? project.lanes[0]?.slug ?? null;
}

export function buildProjectRoute(workspaceId: string, projectId: string) {
  return `/workspace/${workspaceId}/project/${projectId}`;
}

export function buildProjectLaneRoute(
  workspaceId: string,
  projectId: string,
  laneSlug: string
) {
  return `${buildProjectRoute(workspaceId, projectId)}/lane/${laneSlug}`;
}

export function buildLaneConversationStorageKey(args: {
  workspaceId: string;
  projectId: string;
  laneSlug: string;
}) {
  return `narua:lane-thread:v2:${args.workspaceId}:${args.projectId}:${args.laneSlug}`;
}

export function parseLaneConversationSnapshot(
  value: string | null
): LaneConversationSnapshot | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<LaneConversationSnapshot>;

    if (!Array.isArray(parsed.messages) || typeof parsed.draft !== "string") {
      return null;
    }

    return {
      messages: parsed.messages,
      draft: parsed.draft,
      updatedAt:
        typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString()
    };
  } catch {
    return null;
  }
}
