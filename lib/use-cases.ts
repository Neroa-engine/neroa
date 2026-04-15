import type { AgentId } from "@/lib/ai/agents";
import { launchReadyUseCaseSlugs } from "@/lib/data/public-launch";

export type UseCasePageSummary = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
};

export type UseCaseWorkflowStep = {
  title: string;
  description: string;
  detailSlug?: string;
};

export type UseCaseCapability = {
  title: string;
  description: string;
  detailSlug?: string;
};

export type UseCasePricingStack = {
  heading: string;
  recommendedStack: string;
  monthlyPrice: string;
  bestFor: string;
  included: string[];
  rationale: string;
};

export type UseCaseDetailPage = {
  slug: string;
  aliases?: string[];
  title: string;
  eyebrow: string;
  heroTitle: string;
  intro: string;
  summary: string;
  heroHighlights: string[];
  heroPanelTitle: string;
  heroPanelSummary: string;
  heroPanelItems: string[];
  workflow: UseCaseWorkflowStep[];
  capabilities: UseCaseCapability[];
  collaboration: Array<{
    id: AgentId;
    badge: string;
    description: string;
  }>;
  pricingStack?: UseCasePricingStack;
  deliverablesTitle: string;
  deliverables: string[];
  outcomesTitle: string;
  outcomes: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  finalCtaTitle: string;
  finalCtaSummary: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
};

export const useCaseDetailPages: UseCaseDetailPage[] = [
  {
    slug: "business-plan-writing-and-research",
    aliases: ["business-planning", "writing-and-research"],
    title: "Business Plan Writing and Research",
    eyebrow: "Use Case",
    heroTitle: "Build a business plan, research base, and decision-ready writing system in one workspace",
    intro:
      "Use Neroa when planning work needs more than a draft. Naroa can frame the business direction, Atlas can deepen the research context, and the workspace can keep strategy, notes, writing, and next moves connected.",
    summary:
      "This use case is for founders, operators, consultants, and teams that need business plans, research briefs, market thinking, and stakeholder-ready writing without losing continuity between sessions.",
    heroHighlights: [
      "Business direction and customer framing",
      "Research synthesis and decision-ready notes",
      "Plan sections, assumptions, and milestones",
      "Writing outputs that stay tied to execution"
    ],
    heroPanelTitle: "What this workspace helps you produce",
    heroPanelSummary:
      "Neroa keeps planning, research, and writing in the same operating flow so outputs stay aligned to the actual build or launch.",
    heroPanelItems: [
      "Business plan sections and milestone framing",
      "Research summaries and assumption checks",
      "Executive memos, briefs, and stakeholder updates"
    ],
    workflow: [
      {
        title: "Frame the core business question",
        description:
          "Start with the offer, market, customer, or operating decision Naroa needs to clarify first.",
        detailSlug: "frame-the-core-business-question"
      },
      {
        title: "Build the research base",
        description:
          "Use the workspace to synthesize context, test assumptions, and separate solid insight from loose speculation.",
        detailSlug: "build-the-research-base"
      },
      {
        title: "Drafting the plan",
        description:
          "Turn the strategy into plan sections, decision memos, and written deliverables that are ready for review.",
        detailSlug: "drafting-the-plan"
      },
      {
        title: "Writing outputs",
        description:
          "Shape business-plan sections, investor-ready notes, and internal writing outputs that carry the same decision logic forward.",
        detailSlug: "writing-outputs"
      }
    ],
    capabilities: [
      {
        title: "Business model clarity",
        description:
          "Define the offer, customer, positioning, and operating logic before the plan grows messy.",
        detailSlug: "business-model-clarity"
      },
      {
        title: "Research continuity",
        description:
          "Keep findings, summaries, and open questions tied to the same project instead of scattered across tools.",
        detailSlug: "research-continuity"
      },
      {
        title: "Decision-ready writing",
        description:
          "Translate the work into business-plan sections, briefs, proposals, and updates that are ready to use.",
        detailSlug: "decision-writing"
      },
      {
        title: "Execution-facing outputs",
        description:
          "Keep every section connected to milestones, risks, and the next practical move.",
        detailSlug: "execution-facing-outputs"
      }
    ],
    collaboration: [
      {
        id: "narua",
        badge: "Core",
        description: "Naroa holds the planning flow together and turns the work into a usable operating direction."
      },
      {
        id: "atlas",
        badge: "Research",
        description: "Atlas helps pressure-test assumptions, structure findings, and strengthen analysis."
      },
      {
        id: "ops",
        badge: "Execution",
        description: "Ops keeps the plan grounded in milestones, workflow, and practical follow-through."
      }
    ],
    pricingStack: {
      heading: "Suggested Monthly Price",
      recommendedStack: "Naroa + Atlas + Ops",
      monthlyPrice: "$19.99/month",
      bestFor: "Founders, operators, and small teams needing planning, research, and writing continuity in one workspace.",
      included: [
        "Guided Naroa intake and business framing",
        "Research support and assumption pressure-testing",
        "Business-plan drafting, decision writing, and milestone continuity"
      ],
      rationale:
        "This stack fits business planning work because it keeps strategy, research, and writing in one operating flow without forcing users into build-heavy execution pricing too early."
    },
    deliverablesTitle: "Typical deliverables",
    deliverables: [
      "Business plan outline and key sections",
      "Research brief and assumptions log",
      "Milestone sequence and execution notes",
      "Decision memo or stakeholder summary"
    ],
    outcomesTitle: "Ideal outcomes",
    outcomes: [
      "A business plan that is clear enough to act on",
      "Research that directly improves the plan instead of sitting in notes",
      "Writing outputs that support decisions, funding, or internal alignment"
    ],
    primaryCtaLabel: "Start with Naroa",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "See how Neroa works",
    secondaryCtaHref: "/how-it-works",
    finalCtaTitle: "Use one workspace for planning, research, and writing",
    finalCtaSummary:
      "Open a project, let Naroa define the first useful question, and turn the result into a real plan instead of another disconnected document."
  },
  {
    slug: "saas",
    aliases: ["saas-product-development"],
    title: "SaaS",
    eyebrow: "Use Case",
    heroTitle: "Turn a SaaS idea into an MVP scope, budget, build plan, and launch path with coordinated AI",
    intro:
      "Neroa helps founders and product teams move from SaaS idea to structured execution. Naroa frames the product, Atlas helps validate demand, Forge shapes the build logic, and the workspace keeps MVP, budget, and launch decisions connected.",
    summary:
      "Use this path for subscription software, AI tools, dashboards, portals, and digital products that need a clear route from idea to MVP and launch.",
    heroHighlights: [
      "Customer problem and MVP framing",
      "Feature trimming and product scope",
      "Build planning, stack thinking, and budget clarity",
      "Validation, launch path, and next-step structure"
    ],
    heroPanelTitle: "What this SaaS workflow helps you produce",
    heroPanelSummary:
      "Neroa keeps the product story, MVP scope, cost model, and build path connected so the work can move from concept into real execution.",
    heroPanelItems: [
      "MVP brief, feature list, and user flow",
      "Build plan, complexity view, and first-stack decisions",
      "Budget expectations, validation steps, and launch path"
    ],
    workflow: [
      {
        title: "Clarify the SaaS idea and customer",
        description:
          "Use Naroa and Atlas to define the problem, customer, and the first useful MVP boundary."
      },
      {
        title: "Turn the MVP into a real build plan",
        description:
          "Move through features, architecture, implementation sequencing, and execution planning without resetting context."
      },
      {
        title: "Connect budget, validation, and launch",
        description:
          "Keep cost planning, launch prep, and test-to-launch decisions tied back to the same SaaS direction."
      }
    ],
    capabilities: [
      {
        title: "Sharper MVP framing",
        description:
          "Clarify the problem, customer, value proposition, and first release before build work expands."
      },
      {
        title: "Build continuity",
        description:
          "Connect product planning, implementation structure, budget logic, and launch preparation in one system."
      },
      {
        title: "Validation and budget clarity",
        description:
          "Use one workflow to pressure-test the idea, see likely startup cost, and decide what belongs in the first release."
      },
      {
        title: "Launch-aware execution",
        description:
          "Keep launch steps, acquisition thinking, and release priorities aligned with the real product plan."
      }
    ],
    collaboration: [
      {
        id: "narua",
        badge: "Core",
        description: "Naroa frames the SaaS idea, keeps the MVP focused, and routes the work into the right build sequence."
      },
      {
        id: "atlas",
        badge: "Validation",
        description: "Atlas strengthens customer reasoning, validation thinking, and the assumptions behind the first release."
      },
      {
        id: "forge",
        badge: "Build",
        description: "Forge helps structure architecture, implementation sequencing, and technical execution planning."
      },
      {
        id: "ops",
        badge: "Execution",
        description: "Ops helps carry the SaaS plan into launch steps, operating checkpoints, and follow-through."
      }
    ],
    deliverablesTitle: "Typical deliverables",
    deliverables: [
      "SaaS product brief and MVP feature list",
      "Build plan and complexity estimate",
      "Startup cost estimate and validation checklist",
      "Launch path and next-step execution checklist"
    ],
    outcomesTitle: "Ideal outcomes",
    outcomes: [
      "A SaaS direction the team can actually build",
      "A clearer bridge from concept into implementation",
      "A launch path grounded in the real MVP instead of a loose idea"
    ],
    primaryCtaLabel: "Start a SaaS build",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Explore use cases",
    secondaryCtaHref: "/use-cases",
    finalCtaTitle: "Start the SaaS build in one coordinated system",
    finalCtaSummary:
      "Start with Naroa, shape the MVP, clarify the budget, and let the build and launch workflow open around the real product.",
    faq: [
      {
        question: "Can Neroa help me scope a real SaaS MVP before build work starts?",
        answer:
          "Yes. The SaaS path is built to clarify the customer problem, feature cut line, budget logic, and launch path before the product expands into a harder build."
      },
      {
        question: "Should a SaaS idea start in DIY or Managed Build?",
        answer:
          "Many SaaS ideas start well in DIY when the founder wants to pace the work with monthly Engine Credits. Move into Managed Build when speed, integrations, or business pressure justify more execution help."
      },
      {
        question: "Does Neroa help with pricing, scope, and launch thinking too?",
        answer:
          "Yes. The SaaS lane is designed to keep MVP planning, budget logic, validation, build sequencing, and launch preparation connected in one system."
      }
    ]
  },
  {
    slug: "internal-software",
    aliases: ["coding-workflows"],
    title: "Internal Software",
    eyebrow: "Use Case",
    heroTitle: "Create internal software, workflow systems, and admin tools with a clearer planning-to-build path",
    intro:
      "Use Neroa when you need to shape internal software with real operating constraints in view. This path is built for CRMs, admin dashboards, reporting portals, workflow tools, and custom back-office systems that need planning, budget clarity, and implementation structure.",
    summary:
      "Instead of treating internal systems like generic coding tasks, Neroa keeps the user problem, workflow design, feature plan, and build sequence inside one coordinated process.",
    heroHighlights: [
      "Workflow design and operating requirements",
      "Role-aware feature planning and admin logic",
      "Build sequencing, reporting, and dashboard structure",
      "Budget, rollout, and maintenance planning"
    ],
    heroPanelTitle: "What this internal software workflow helps you produce",
    heroPanelSummary:
      "Neroa helps teams move from messy internal requirements into a cleaner build plan for systems people will actually use.",
    heroPanelItems: [
      "Internal system brief and user-role mapping",
      "Feature plan, admin/dashboard structure, and build sequence",
      "Budget expectations, rollout notes, and operational next steps"
    ],
    workflow: [
      {
        title: "Map the internal workflow first",
        description:
          "Define the people, processes, and system bottlenecks the internal tool needs to improve."
      },
      {
        title: "Turn the workflow into software structure",
        description:
          "Use Naroa, Atlas, and Forge to shape requirements, dashboards, permissions, and implementation order."
      },
      {
        title: "Carry the system into rollout and maintenance",
        description:
          "Keep budget, deployment, adoption, and operating follow-through attached to the same project thread."
      }
    ],
    capabilities: [
      {
        title: "Workflow-first planning",
        description:
          "Start with the real operational workflow so the tool solves a real internal problem."
      },
      {
        title: "Role and permissions clarity",
        description:
          "Make admin roles, user actions, approvals, and visibility rules explicit before the build expands."
      },
      {
        title: "Implementation continuity",
        description:
          "Keep requirements, dashboards, reports, automations, and build tasks connected in one operating system."
      },
      {
        title: "Operational rollout support",
        description:
          "Carry the work into onboarding, maintenance, KPI review, and operating updates after launch."
      }
    ],
    collaboration: [
      {
        id: "narua",
        badge: "Core",
        description: "Naroa frames the internal system around the real workflow and keeps the build tied to the operating need."
      },
      {
        id: "forge",
        badge: "Build",
        description: "Forge supports admin structures, implementation sequence, and system scaffolding."
      },
      {
        id: "atlas",
        badge: "Planning",
        description: "Atlas helps pressure-test workflows, process logic, and what the team actually needs the system to do."
      },
      {
        id: "repolink",
        badge: "Systems",
        description: "RepoLink helps connect the plan to repository, tooling, data, and implementation context where needed."
      },
    ],
    deliverablesTitle: "Typical deliverables",
    deliverables: [
      "Internal software brief and workflow map",
      "Role-based feature list and dashboard structure",
      "Build sequence, budget range, and rollout checklist",
      "Maintenance priorities and operating checkpoints"
    ],
    outcomesTitle: "Ideal outcomes",
    outcomes: [
      "The team gets a clearer internal software plan before build work starts",
      "Internal tools are scoped around workflow value instead of feature sprawl",
      "Rollout and maintenance thinking stay visible from the start"
    ],
    primaryCtaLabel: "Explore internal software",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Back to use cases",
    secondaryCtaHref: "/use-cases",
    finalCtaTitle: "Turn internal workflow problems into a structured software plan",
    finalCtaSummary:
      "Use Neroa to shape the workflow, feature logic, budget, and rollout path before the internal system becomes another messy build.",
    faq: [
      {
        question: "What kinds of internal systems fit this Neroa lane best?",
        answer:
          "This lane is strongest for CRMs, dashboards, reporting systems, approvals, dispatch tools, admin workflows, and other internal software that needs clearer operational structure before build execution begins."
      },
      {
        question: "Can internal software start small and expand later?",
        answer:
          "Yes. Neroa helps teams start with the most valuable workflow first, then widen roles, reports, automations, and integrations later instead of overbuilding the first release."
      },
      {
        question: "Is this only for technical teams?",
        answer:
          "No. The internal software lane is designed for operators and business teams that need the workflow, role logic, and rollout path clarified before technical delivery scales up."
      }
    ]
  },
  {
    slug: "external-apps",
    title: "External Apps",
    eyebrow: "Use Case",
    heroTitle: "Plan and build customer-facing apps, portals, websites, and branded digital products with a clear validation-to-launch flow",
    intro:
      "This path is built for customer-facing products that need more than a generic website brief. Use Neroa to clarify the audience, shape the MVP, understand likely budget, and turn the concept into a launch-ready build direction.",
    summary:
      "Use this workflow for websites, portals, booking tools, client experiences, and branded digital products that need validation, build planning, and a cleaner public launch path.",
    heroHighlights: [
      "Audience, offer, and user-flow clarity",
      "Customer-facing feature scope and interface direction",
      "Budget visibility and validation planning",
      "Build, launch, and handoff structure"
    ],
    heroPanelTitle: "What this external-app workflow helps you produce",
    heroPanelSummary:
      "Neroa helps connect product thinking, experience design, implementation planning, and launch preparation in one coordinated system.",
    heroPanelItems: [
      "Audience brief, user flow, and first-release structure",
      "Build plan, feature priorities, and customer-facing page logic",
      "Budget view, validation steps, and launch checklist"
    ],
    workflow: [
      {
        title: "Define the audience and the experience",
        description:
          "Start with the user, the core action, and what the product or experience should help them do."
      },
      {
        title: "Shape the first release",
        description:
          "Turn the concept into pages, flows, features, and a first launch boundary that can actually be built."
      },
      {
        title: "Connect validation, build, and launch",
        description:
          "Keep testing, budget logic, implementation, and launch sequencing tied to the same external product direction."
      }
    ],
    capabilities: [
      {
        title: "Customer-facing clarity",
        description:
          "Define the audience, value proposition, experience flow, and first action before build work widens."
      },
      {
        title: "Branded product direction",
        description:
          "Shape portals, booking tools, websites, or app concepts with clearer interface and experience priorities."
      },
      {
        title: "Launch-aware build planning",
        description:
          "Connect validation, budget, feature scope, and public launch decisions in one place."
      },
      {
        title: "Cleaner handoff into delivery",
        description:
          "Make it easier to move the concept into design, development, and go-live preparation without rebuilding context."
      }
    ],
    collaboration: [
      {
        id: "narua",
        badge: "Core",
        description: "Naroa frames the product direction, customer experience, and next execution moves."
      },
      {
        id: "nova",
        badge: "Experience",
        description: "Nova supports interface direction, user flow, and the quality of the customer-facing experience."
      },
      {
        id: "forge",
        badge: "Build",
        description: "Forge structures the technical plan, feature sequencing, and implementation path."
      },
      {
        id: "pulse",
        badge: "Launch",
        description: "Pulse helps carry the product into launch messaging, demand testing, and release prep."
      }
    ],
    deliverablesTitle: "Typical deliverables",
    deliverables: [
      "Audience brief and product concept framing",
      "Feature scope, page flow, and launch structure",
      "Budget estimate and validation checklist",
      "Build plan and customer-facing rollout path"
    ],
    outcomesTitle: "Ideal outcomes",
    outcomes: [
      "A customer-facing product concept the team can actually execute",
      "Clearer experience and build priorities before launch work expands",
      "A stronger path from concept into validation, build, and public release"
    ],
    primaryCtaLabel: "Explore external apps",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Back to use cases",
    secondaryCtaHref: "/use-cases",
    finalCtaTitle: "Move from concept to customer-facing launch with one coordinated system",
    finalCtaSummary:
      "Use Neroa to clarify the audience, shape the release, understand the cost, and move the external product into a cleaner launch path.",
    faq: [
      {
        question: "What kinds of external apps fit this path?",
        answer:
          "This lane works well for customer portals, booking systems, branded web apps, service platforms, lead flows, and other customer-facing products that need a stronger route from concept into launch."
      },
      {
        question: "How does Neroa help before design and development get expensive?",
        answer:
          "Neroa clarifies the audience, user flow, first release, budget logic, and build path first so the external app does not widen into a vague customer-facing project with too many moving parts."
      },
      {
        question: "Can I start in DIY and later move the product into managed support?",
        answer:
          "Yes. That is a normal transition when the external app becomes more important to revenue, customer experience, or launch timing than a self-paced lane can comfortably support."
      }
    ]
  },
  {
    slug: "mobile-apps",
    aliases: ["mobile-app"],
    title: "Mobile Apps",
    eyebrow: "Use Case",
    heroTitle: "Plan and build mobile apps with a guided path from MVP definition to launch readiness",
    intro:
      "Use Neroa when the product is truly mobile-first. Naroa frames the app, Forge shapes the React Native + Expo build path, Atlas helps validate the product logic, RepoLink supports the implementation layer, and Ops keeps launch and release work operationally grounded.",
    summary:
      "This path is built for iPhone apps, Android apps, cross-platform startups, companion mobile products, and mobile MVPs that need strategy, scope, budget, build structure, and app-store readiness in one coordinated system.",
    heroHighlights: [
      "Mobile product direction and platform target",
      "Screen list, feature scope, and MVP cut line",
      "React Native + Expo build planning and budget protection",
      "Beta, app-store prep, and post-launch operations"
    ],
    heroPanelTitle: "What this Mobile App workflow helps you produce",
    heroPanelSummary:
      "Neroa keeps mobile strategy, screen scope, stack recommendation, budget, and launch prep connected so the app can move from concept into a real build path.",
    heroPanelItems: [
      "Mobile product brief, screen list, and MVP cut line",
      "Primary build-path recommendation and technical execution outline",
      "Budget estimate, beta sequence, and launch-readiness checklist"
    ],
    workflow: [
      {
        title: "Define the app and the user",
        description:
          "Start with the mobile problem, target user, platform target, and the first outcome the app should prove."
      },
      {
        title: "Shape the mobile MVP",
        description:
          "Turn the concept into a screen list, feature cut line, device-feature scope, and the smallest launchable version worth testing."
      },
      {
        title: "Choose the real build path",
        description:
          "Use the engine to compare React Native + Expo, a lighter PWA MVP, and advisory-only native paths without losing budget discipline."
      },
      {
        title: "Carry the app into beta and launch",
        description:
          "Connect testing, store-prep, release steps, and post-launch operations to the same product direction."
      }
    ],
    capabilities: [
      {
        title: "Mobile-specific scope clarity",
        description:
          "Define screens, auth, payments, notifications, device features, and any admin or web companion needs before build work spreads."
      },
      {
        title: "Disciplined stack recommendation",
        description:
          "Use React Native + Expo as the primary supported path, keep PWA as the secondary MVP route, and treat Flutter or native builds as advisory only."
      },
      {
        title: "Budget-aware mobile planning",
        description:
          "Understand likely build cost, backend spend, store-prep cost, and the budget guardrails that should shape the first release."
      },
      {
        title: "Launch-readiness support",
        description:
          "Keep beta planning, TestFlight, Android prep, store assets, and release checklists visible before the app moves toward submission."
      }
    ],
    collaboration: [
      {
        id: "narua",
        badge: "Core",
        description: "Naroa holds the mobile product direction, stack logic, and execution sequence together."
      },
      {
        id: "forge",
        badge: "Build",
        description: "Forge shapes the React Native + Expo path, implementation sequence, and technical execution structure."
      },
      {
        id: "atlas",
        badge: "Validation",
        description: "Atlas helps validate the mobile use case, the MVP cut line, and the logic behind the first release."
      },
      {
        id: "repolink",
        badge: "Systems",
        description: "RepoLink supports backend, auth, data, and repository context where the mobile engine turns technical."
      },
      {
        id: "ops",
        badge: "Operate",
        description: "Ops keeps beta planning, release prep, bug-fix rhythm, and post-launch operations grounded."
      }
    ],
    deliverablesTitle: "Typical deliverables",
    deliverables: [
      "Mobile product brief and platform recommendation",
      "Screen list, feature scope, and MVP cut line",
      "Build-path recommendation, backend outline, and budget estimate",
      "Beta, launch, and post-release operating checklist"
    ],
    outcomesTitle: "Ideal outcomes",
    outcomes: [
      "A mobile app concept the team can actually execute",
      "A clearer route from idea into MVP, budget, and build planning",
      "A launch path that stays honest about supported mobile stacks"
    ],
    primaryCtaLabel: "Start a mobile app build",
    primaryCtaHref: "/start?flow=mobile-app",
    secondaryCtaLabel: "Back to use cases",
    secondaryCtaHref: "/use-cases",
    finalCtaTitle: "Open the mobile app engine with the right build path from the start",
    finalCtaSummary:
      "Use Neroa to shape the app, protect the budget, recommend the stack, and carry the work into beta and launch without losing the execution thread.",
    faq: [
      {
        question: "Can Neroa help plan both iPhone and Android launch paths?",
        answer:
          "Yes. The mobile app lane is designed to help customers think through cross-platform scope, store-readiness, beta sequencing, and launch support instead of treating the app like a generic web build."
      },
      {
        question: "What mobile stack does Neroa support most directly?",
        answer:
          "Neroa keeps React Native plus Expo as the primary supported mobile path, while lighter PWA paths and advisory-only native alternatives stay secondary so the build logic remains disciplined."
      },
      {
        question: "When should a mobile app move into Managed Build?",
        answer:
          "Move into Managed Build when the app needs faster execution, store-submission coordination, deeper integrations, or more launch support than a self-paced DIY lane can comfortably provide."
      }
    ]
  },
  {
    slug: "blockchain-projects",
    title: "Blockchain Projects",
    eyebrow: "Use Case",
    heroTitle: "Coordinate blockchain strategy, protocol logic, technical build work, and launch thinking in one workspace",
    intro:
      "Blockchain work often mixes product framing, token or incentive logic, protocol analysis, smart-contract planning, technical implementation, and ecosystem communication. Neroa helps keep those layers connected.",
    summary:
      "Use this flow when the project needs clearer protocol thinking, better technical structure, and a launch path that reflects the actual system being built.",
    heroHighlights: [
      "Protocol and product direction",
      "Smart-contract and architecture planning",
      "Testing, deployment, and repo context",
      "Narrative and launch coordination"
    ],
    heroPanelTitle: "What Neroa helps organize",
    heroPanelSummary:
      "The workspace can carry blockchain work from concept through build and launch without losing the relationship between system design and ecosystem-facing output.",
    heroPanelItems: [
      "Protocol logic and architecture reasoning",
      "Implementation structure and testing focus",
      "Launch narrative and ecosystem rollout thinking"
    ],
    workflow: [
      {
        title: "Clarify the chain, protocol, or product objective",
        description:
          "Start with the system being built and the core value it needs to create."
      },
      {
        title: "Shape the technical and incentive structure",
        description:
          "Use the workspace to reason through architecture, constraints, and the parts of the system that matter most."
      },
      {
        title: "Connect build work to launch motion",
        description:
          "Keep technical execution, documentation, and rollout language aligned."
      }
    ],
    capabilities: [
      {
        title: "Sharper protocol reasoning",
        description:
          "Use AI support to clarify incentives, system constraints, and architecture choices."
      },
      {
        title: "Connected build context",
        description:
          "Keep smart-contract planning, implementation notes, testing, and repository context together."
      },
      {
        title: "Launch-aware technical planning",
        description:
          "Make sure narrative, ecosystem messaging, and technical delivery stay aligned."
      },
      {
        title: "Cleaner execution flow",
        description:
          "Reduce fragmentation between technical work and the strategic story around it."
      }
    ],
    collaboration: [
      {
        id: "narua",
        badge: "Core",
        description: "Naroa orchestrates the project and keeps technical, strategic, and launch decisions coherent."
      },
      {
        id: "atlas",
        badge: "Context",
        description: "Atlas supports reasoning depth around protocol choices, incentives, and ecosystem tradeoffs."
      },
      {
        id: "forge",
        badge: "Build",
        description: "Forge shapes implementation structure, smart-contract planning, and system scaffolding."
      },
      {
        id: "repolink",
        badge: "Infrastructure",
        description: "RepoLink carries codebase, repository, and deployment context where needed."
      }
    ],
    deliverablesTitle: "Typical deliverables",
    deliverables: [
      "Protocol or product brief",
      "Architecture and smart-contract planning notes",
      "Implementation and testing sequence",
      "Launch narrative and rollout checkpoints"
    ],
    outcomesTitle: "Ideal outcomes",
    outcomes: [
      "A sharper link between protocol thinking and build work",
      "Better technical execution planning before coding widens",
      "Launch communication that reflects the real system design"
    ],
    primaryCtaLabel: "Start a blockchain project",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Explore how Neroa works",
    secondaryCtaHref: "/how-it-works",
    finalCtaTitle: "Keep protocol, build, and launch decisions in one operating layer",
    finalCtaSummary:
      "Use Neroa when blockchain work needs tighter reasoning, cleaner technical sequencing, and a launch path grounded in the actual system."
  },
  {
    slug: "operations-and-execution",
    title: "Operations and Execution",
    eyebrow: "Use Case",
    heroTitle: "Run operations, workflows, execution support, and coordination through one AI command center",
    intro:
      "Operations work becomes more useful when AI is tied to the systems, documents, handoffs, and workflow steps that actually move delivery forward. Neroa is built to hold that operating context together.",
    summary:
      "Use this workspace for SOP drafting, workflow mapping, status alignment, recurring coordination, execution checklists, and reducing friction across systems and teams.",
    heroHighlights: [
      "Workflow mapping and operating structure",
      "SOP drafts and execution checklists",
      "Coordination across systems and dependencies",
      "Progress visibility and next-move guidance"
    ],
    heroPanelTitle: "What operations teams get here",
    heroPanelSummary:
      "Neroa turns planning and coordination into a usable execution surface so work keeps moving instead of disappearing into updates and scattered docs.",
    heroPanelItems: [
      "Workflow maps and role-specific steps",
      "Process notes, SOPs, and recurring checklists",
      "Dependency tracking and blocker visibility"
    ],
    workflow: [
      {
        title: "Map the operating workflow",
        description:
          "Define the real steps, systems, and handoffs that make the work run."
      },
      {
        title: "Generate the supporting structure",
        description:
          "Let Naroa and Ops draft process notes, checklists, and repeatable sequences."
      },
      {
        title: "Keep execution visible",
        description:
          "Track blockers, dependencies, and the next best move without leaving the workspace."
      }
    ],
    capabilities: [
      {
        title: "Workflow clarity",
        description:
          "Turn scattered process knowledge into a clearer delivery sequence."
      },
      {
        title: "Operational writing support",
        description:
          "Draft SOPs, status notes, handoff materials, and execution-facing documentation faster."
      },
      {
        title: "Dependency visibility",
        description:
          "Surface the blockers and operating gaps that usually slow teams down."
      },
      {
        title: "More reliable follow-through",
        description:
          "Keep the next move obvious so execution does not stall after planning."
      }
    ],
    collaboration: [
      {
        id: "narua",
        badge: "Core",
        description: "Naroa frames the operating context and keeps the lane focused on useful execution output."
      },
      {
        id: "ops",
        badge: "Workflow",
        description: "Ops supports SOPs, workflow sequencing, and operational reliability."
      },
      {
        id: "forge",
        badge: "Systems",
        description: "Forge helps when the workflow needs automation or more structured system support."
      },
      {
        id: "pulse",
        badge: "Coordination",
        description: "Pulse can support rollout communication and launch-facing coordination where needed."
      }
    ],
    deliverablesTitle: "Typical deliverables",
    deliverables: [
      "Workflow map and operating sequence",
      "SOP drafts and checklists",
      "Dependency log and blocker visibility",
      "Execution notes and next-step guidance"
    ],
    outcomesTitle: "Ideal outcomes",
    outcomes: [
      "Teams know what happens next and why",
      "Workflow knowledge becomes usable instead of tribal",
      "Execution support stays tied to the real operating system"
    ],
    primaryCtaLabel: "Start an operations workspace",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "See the system flow",
    secondaryCtaHref: "/how-it-works",
    finalCtaTitle: "Use Neroa as the operating layer for execution work",
    finalCtaSummary:
      "Bring workflow structure, recurring coordination, and next-step clarity into one project so operations work stays visible and actionable."
  }
];

export const useCasePages: UseCasePageSummary[] = useCaseDetailPages.map((page) => ({
  slug: page.slug,
  title: page.title,
  eyebrow: page.eyebrow,
  summary: page.summary
}));

export const launchReadyUseCasePages: UseCasePageSummary[] = useCasePages.filter((page) =>
  launchReadyUseCaseSlugs.includes(page.slug as (typeof launchReadyUseCaseSlugs)[number])
);

export function getUseCasePage(slug: string) {
  return (
    useCaseDetailPages.find((page) => page.slug === slug) ??
    useCaseDetailPages.find((page) => page.aliases?.includes(slug))
  );
}

export function getUseCaseStaticParams() {
  return useCaseDetailPages.flatMap((page) => [
    { slug: page.slug },
    ...(page.aliases ?? []).map((alias) => ({ slug: alias }))
  ]);
}
