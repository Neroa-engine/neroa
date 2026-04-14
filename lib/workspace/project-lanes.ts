import type { NaruaMessage } from "@/lib/narua/planning";
import { normalizeLaneId } from "@/lib/workspace/lanes";
import type { LaneId } from "@/lib/workspace/types";

export type ProjectTemplateId =
  | "business-launch"
  | "saas-build"
  | "mobile-app-build"
  | "coding-project"
  | "ecommerce-brand";

export type ProjectLaneStatus = "active" | "recommended" | "optional";

export type ProjectLanePhaseId =
  | "strategy"
  | "build"
  | "budget"
  | "launch"
  | "operations";

export type ProjectLanePhaseDefinition = {
  id: ProjectLanePhaseId;
  label: string;
  summary: string;
};

export type ProjectLanePhaseGroup = ProjectLanePhaseDefinition & {
  lanes: ProjectLaneRecord[];
};

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

const projectLanePhaseOrder: ProjectLanePhaseId[] = [
  "strategy",
  "build",
  "budget",
  "launch",
  "operations"
];

const projectLanePhaseRegistry: Record<ProjectLanePhaseId, ProjectLanePhaseDefinition> = {
  strategy: {
    id: "strategy",
    label: "Strategy Lane",
    summary: "Define the direction, offer, plan, and positioning before execution widens."
  },
  build: {
    id: "build",
    label: "Build Lane",
    summary: "Turn the plan into scoped execution across SaaS, websites, apps, and technical work."
  },
  budget: {
    id: "budget",
    label: "Budget Lane",
    summary: "Model startup cost, stack cost, timing, and the operating reality behind the project."
  },
  launch: {
    id: "launch",
    label: "Launch Lane",
    summary: "Prepare go-live motion, release readiness, onboarding, and marketing rollout."
  },
  operations: {
    id: "operations",
    label: "Operations Lane",
    summary: "Keep the project running through maintenance, updates, automation, and ongoing management."
  }
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
        recommendedAIStack: ["Naroa Execution Layer", "Strategy brief", "Offer logic"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Business plan", "Roadmap"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Budget model", "Cost planning"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Naming shortlist", "Domain setup"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Brand narrative", "Voice system"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Site map", "Copy system", "Launch site"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Workflow map", "SOPs"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Marketing plan", "Campaign map"],
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
    label: "Guided Build Engine",
    description:
      "Structured for taking a product idea from strategy and scope into MVP, budget, testing, build, launch, and operations.",
    lanes: [
      {
        title: "Strategy",
        description:
          "Define the problem, user, product direction, and success criteria before the engine widens into execution.",
        status: "active",
        focusLabel: "Product strategy",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Problem map",
          "Audience definition",
          "Product direction"
        ],
        starterPrompts: [
          "Clarify the product direction and the customer problem.",
          "Define who this engine is for and what it needs to prove.",
          "Set the strategic direction before scope spreads."
        ],
        deliverables: [
          "Product brief",
          "Problem statement",
          "Audience definition",
          "Strategic direction"
        ]
      },
      {
        title: "Scope",
        description:
          "Decide what belongs in the engine, what stays out, and which workflows or surfaces matter in version one.",
        status: "active",
        focusLabel: "Scope definition",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Scope map",
          "Surface list",
          "Feature boundary"
        ],
        starterPrompts: [
          "Define what belongs in scope for version one.",
          "Separate must-have surfaces from later additions.",
          "Clarify which user flows should stay outside the MVP."
        ],
        deliverables: [
          "Scope map",
          "Feature boundary",
          "Surface list",
          "Out-of-scope list"
        ]
      },
      {
        title: "MVP",
        description:
          "Reduce the concept to the smallest valuable version worth testing before more build effort is committed.",
        status: "active",
        focusLabel: "MVP cut line",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "MVP outline",
          "Version-two backlog",
          "Validation target"
        ],
        starterPrompts: [
          "Cut the engine down to the smallest launchable version.",
          "List the features that should move to version two.",
          "Define what outcome would prove the MVP is working."
        ],
        deliverables: [
          "MVP outline",
          "Version-two backlog",
          "Validation target",
          "Core workflow"
        ]
      },
      {
        title: "Budget",
        description:
          "Estimate build cost, stack cost, timing, and the operating realities that should shape product decisions.",
        status: "active",
        focusLabel: "Budget planning",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Startup budget",
          "Complexity estimate",
          "Cost model"
        ],
        starterPrompts: [
          "Estimate the startup and stack cost for this engine.",
          "Compare the lean build path with the more ambitious version.",
          "Clarify what drives complexity, timing, and operating cost."
        ],
        deliverables: [
          "Startup cost estimate",
          "Build complexity",
          "Stack cost",
          "Operating cost"
        ]
      },
      {
        title: "Test",
        description:
          "Design the validation path, prototype checks, beta tests, or lightweight market proof that should happen before deeper build spend.",
        status: "active",
        focusLabel: "Validation test",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Test plan",
          "Validation checkpoints",
          "Feedback loop"
        ],
        starterPrompts: [
          "Plan the fastest useful validation test for this engine.",
          "Define the feedback signals that matter before building further.",
          "Choose the lightest test that can prove or disprove the direction."
        ],
        deliverables: [
          "Validation test plan",
          "Feedback goals",
          "Test checkpoints",
          "Learning loop"
        ]
      },
      {
        title: "Build",
        description:
          "Turn the plan into structured execution, implementation order, technical decisions, and the first real build sequence.",
        status: "active",
        focusLabel: "Build execution",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Technical scope",
          "Developer brief",
          "Implementation sequence"
        ],
        starterPrompts: [
          "Map the implementation sequence for version one.",
          "Create the first technical brief for the build path.",
          "Define the build order once scope and MVP are clear."
        ],
        deliverables: [
          "Technical scope",
          "Developer brief",
          "Implementation sequence",
          "Build roadmap"
        ]
      },
      {
        title: "Launch",
        description:
          "Prepare the go-live path, release readiness, onboarding flow, and launch checklist once build work becomes real.",
        status: "recommended",
        focusLabel: "Launch readiness",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Go-live checklist",
          "Onboarding flow",
          "Release plan"
        ],
        starterPrompts: [
          "Build the launch and go-live checklist.",
          "Define the onboarding path for the first users.",
          "Sequence release prep for the first launch."
        ],
        deliverables: [
          "Go-live checklist",
          "Onboarding plan",
          "Release prep",
          "Launch communication path"
        ]
      },
      {
        title: "Operate",
        description:
          "Keep the engine running after launch with maintenance, KPI review, automation, and next-stage execution planning.",
        status: "recommended",
        focusLabel: "Operating system",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Operating checklist",
          "Automation backlog",
          "KPI rhythm"
        ],
        starterPrompts: [
          "Define the first operating routines after launch.",
          "Map the KPI review and update cycle.",
          "Find the first automation opportunities after release."
        ],
        deliverables: [
          "Operating checklist",
          "KPI review",
          "Automation opportunities",
          "Maintenance rhythm"
        ]
      }
    ]
  },
  "mobile-app-build": {
    id: "mobile-app-build",
    label: "Mobile App Build",
    description:
      "Structured for taking a mobile app from strategy and MVP planning into budget, test, build, launch, and post-release operations.",
    lanes: [
      {
        title: "Strategy",
        description:
          "Define the app purpose, target user, platform target, business model, and app-store viability before mobile scope widens.",
        status: "active",
        focusLabel: "Mobile strategy",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Mobile product brief",
          "User problem map",
          "Platform viability"
        ],
        starterPrompts: [
          "Clarify the mobile app purpose and who it should help first.",
          "Define whether this should launch on iPhone, Android, or both.",
          "Pressure-test whether the app is viable enough for app-store distribution."
        ],
        deliverables: [
          "App purpose",
          "Target user",
          "Platform target",
          "Business model",
          "App-store viability"
        ]
      },
      {
        title: "Scope",
        description:
          "Turn the idea into a mobile-specific screen list, feature scope, device requirements, and companion-surface decision.",
        status: "active",
        focusLabel: "Mobile scope",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Screen list",
          "Feature map",
          "Companion-surface plan"
        ],
        starterPrompts: [
          "Map the core screens and user flow for the app.",
          "Separate must-have mobile features from version-two features.",
          "Decide whether the app needs an admin dashboard or web companion."
        ],
        deliverables: [
          "Screen list",
          "Feature list",
          "Device feature requirements",
          "Auth, payments, and notification needs",
          "Admin dashboard or web companion plan"
        ]
      },
      {
        title: "MVP",
        description:
          "Cut the mobile app down to the smallest launchable version, identify version-two features, and set the validation target.",
        status: "active",
        focusLabel: "Mobile MVP",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "MVP cut line",
          "Validation target",
          "Version-two backlog"
        ],
        starterPrompts: [
          "Define the smallest launchable version of the mobile app.",
          "List the features that should be cut from version one.",
          "Clarify the outcome that would prove the app is worth building further."
        ],
        deliverables: [
          "Smallest launchable version",
          "Cut features",
          "Version-two features",
          "Validation target"
        ]
      },
      {
        title: "Budget",
        description:
          "Estimate mobile build cost, backend cost, testing cost, store-prep cost, and the maintenance range behind the app.",
        status: "active",
        focusLabel: "Mobile budget",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Mobile budget model",
          "Complexity estimate",
          "Cost guardrails"
        ],
        starterPrompts: [
          "Estimate the mobile build cost for the first release.",
          "Compare the Expo path with a lighter PWA MVP path.",
          "Protect the budget by identifying the biggest cost drivers."
        ],
        deliverables: [
          "Mobile build cost",
          "Backend cost",
          "Testing cost",
          "Launch and store-prep cost",
          "Maintenance estimate"
        ]
      },
      {
        title: "Test",
        description:
          "Plan prototype tests, waitlist or landing-page validation, beta sequencing, and the feedback signals needed before scaling.",
        status: "recommended",
        focusLabel: "Validation test",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Prototype test plan",
          "Beta plan",
          "Feedback goals"
        ],
        starterPrompts: [
          "Design the prototype or click-through test for the mobile app.",
          "Plan the waitlist, landing-page, or beta test path.",
          "Define the feedback signals that matter before building further."
        ],
        deliverables: [
          "Prototype test",
          "Waitlist or landing-page test",
          "Beta test planning",
          "Feedback goals"
        ]
      },
      {
        title: "Build",
        description:
          "Choose the real mobile stack, map backend/auth/data, sequence screen implementation, and outline the API and data model path.",
        status: "recommended",
        focusLabel: "Mobile build path",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "React Native + Expo path",
          "Supabase architecture",
          "Implementation sequence"
        ],
        starterPrompts: [
          "Recommend the primary mobile build path for this app.",
          "Map the React Native + Expo build sequence and backend structure.",
          "Outline the API, auth, and data model path for the first version."
        ],
        deliverables: [
          "Primary Build Path: React Native + Expo",
          "Secondary MVP Path: PWA / mobile web",
          "Advisory Path: Flutter, native iOS, native Android",
          "Backend, auth, and data path",
          "Screen implementation order",
          "API and data model outline"
        ]
      },
      {
        title: "Launch",
        description:
          "Prepare TestFlight, Android beta, app-store assets, submission readiness, and the first mobile release checklist.",
        status: "recommended",
        focusLabel: "Mobile launch",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Store-prep checklist",
          "Beta release path",
          "Submission readiness"
        ],
        starterPrompts: [
          "Build the TestFlight and Android beta preparation plan.",
          "List the app-store assets and submission requirements.",
          "Sequence the release checklist for the first mobile launch."
        ],
        deliverables: [
          "TestFlight prep",
          "Android beta prep",
          "App store asset checklist",
          "Submission readiness",
          "Release checklist"
        ]
      },
      {
        title: "Operate",
        description:
          "Plan analytics, bug-fix rhythm, roadmap updates, retention improvements, and version planning after launch.",
        status: "recommended",
        focusLabel: "Mobile operations",
        recommendedAIStack: [
          "Naroa Execution Layer",
          "Analytics rhythm",
          "Version roadmap",
          "Retention improvements"
        ],
        starterPrompts: [
          "Define the first analytics and retention review loop.",
          "Plan bug-fix and release version rhythm after launch.",
          "Build the roadmap for improvements after the first release."
        ],
        deliverables: [
          "Analytics plan",
          "Bug-fix rhythm",
          "Roadmap updates",
          "Retention improvements",
          "Version planning"
        ]
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
        recommendedAIStack: ["Naroa Execution Layer", "Requirements brief", "Acceptance criteria"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Architecture notes", "Dependency map"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Implementation plan", "Task list"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Test plan", "Regression checks"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Release checklist", "Deployment notes"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Docs outline", "Onboarding notes"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Brand strategy", "Positioning"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Catalog plan", "Product priorities"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Storefront plan", "Conversion path"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Naming shortlist", "Domain setup"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Identity direction", "Voice system"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Ops plan", "Fulfillment map"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Launch marketing", "Channel plan"],
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
        recommendedAIStack: ["Naroa Execution Layer", "Budget model", "Cost planning"],
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
    recommendedAIStack: blueprint.recommendedAIStack ?? ["Naroa Execution Layer"],
    starterPrompts: blueprint.starterPrompts ?? [],
    deliverables: blueprint.deliverables ?? []
  };
}

export function getProjectTemplateDefinition(templateId: ProjectTemplateId) {
  return projectTemplateRegistry[templateId];
}

export function getProjectLanePhaseDefinition(phaseId: ProjectLanePhaseId) {
  return projectLanePhaseRegistry[phaseId];
}

export function getProjectLanePhaseForLane(
  lane: Pick<ProjectLaneRecord, "slug" | "title" | "description">
): ProjectLanePhaseDefinition {
  const text = `${lane.slug} ${lane.title} ${lane.description}`.toLowerCase();

  if (text.includes("budget")) {
    return projectLanePhaseRegistry.budget;
  }

  if (text.includes("scope") || text.includes("mvp")) {
    return projectLanePhaseRegistry.strategy;
  }

  if (
    text.includes("operations") ||
    text.includes("operate") ||
    text.includes("automation") ||
    text.includes("deployment") ||
    text.includes("documentation") ||
    text.includes("maintenance") ||
    text.includes("kpi") ||
    text.includes("fulfillment")
  ) {
    return projectLanePhaseRegistry.operations;
  }

  if (
    text.includes("website") ||
    text.includes("storefront") ||
    text.includes("saas") ||
    text.includes("app") ||
    text.includes("mobile") ||
    text.includes("expo") ||
    text.includes("react native") ||
    text.includes("coding") ||
    text.includes("architecture") ||
    text.includes("mvp") ||
    text.includes("feature") ||
    text.includes("technical") ||
    text.includes("requirements") ||
    text.includes("testing") ||
    text.includes("data model") ||
    text.includes("ui ux")
  ) {
    return projectLanePhaseRegistry.build;
  }

  if (
    text.includes("marketing") ||
    text.includes("growth") ||
    text.includes("sales") ||
    text.includes("campaign") ||
    text.includes("launch") ||
    text.includes("go-live") ||
    text.includes("release") ||
    text.includes("onboarding")
  ) {
    return projectLanePhaseRegistry.launch;
  }

  return projectLanePhaseRegistry.strategy;
}

export function inferProjectTemplate(args: {
  name: string;
  description?: string | null;
  primaryLaneId?: LaneId | null;
}) {
  const text = `${args.name}\n${args.description ?? ""}`.toLowerCase();

  if (
    text.includes("mobile") ||
    text.includes("ios") ||
    text.includes("iphone") ||
    text.includes("android") ||
    text.includes("react native") ||
    text.includes("expo") ||
    text.includes("testflight") ||
    text.includes("play store")
  ) {
    return "mobile-app-build" as const;
  }

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
  templateId?: ProjectTemplateId | null;
  primaryLaneId?: LaneId | null;
  customLanes?: CustomProjectLaneInput[];
}) {
  const templateId =
    args.templateId ??
    inferProjectTemplate({
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

export function sortProjectLanes(lanes: ProjectLaneRecord[]) {
  return [...lanes].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getOrderedProjectLanes(project: ProjectRecord) {
  return sortProjectLanes(project.lanes);
}

export function getProjectLanePhaseGroups(project: ProjectRecord) {
  return projectLanePhaseOrder
    .map((phaseId) => ({
      ...projectLanePhaseRegistry[phaseId],
      lanes: sortProjectLanes(
        project.lanes.filter((lane) => getProjectLanePhaseForLane(lane).id === phaseId)
      )
    }))
    .filter((group): group is ProjectLanePhaseGroup => group.lanes.length > 0);
}

export function getFirstProjectLane(project: ProjectRecord) {
  return getOrderedProjectLanes(project)[0] ?? null;
}

export function getProjectLanesByStatus(
  project: ProjectRecord,
  status: ProjectLaneStatus
) {
  return sortProjectLanes(project.lanes.filter((lane) => lane.status === status));
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
    const parsed = JSON.parse(value) as Partial<LaneConversationSnapshot> | null;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

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
