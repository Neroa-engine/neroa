import { AGENTS, type AgentId } from "@/lib/ai/agents";

export type AiSystemCapability = {
  title: string;
  description: string;
};

export type AiSystemCollaboration = {
  id: AgentId;
  label: string;
  description: string;
};

export type AiSystemPage = {
  slug: AgentId;
  id: AgentId;
  eyebrow: string;
  headline: string;
  description: string;
  summaryPanelTitle: string;
  summaryPanelItems: string[];
  capabilities: AiSystemCapability[];
  activatesWhen: string[];
  collaboration: AiSystemCollaboration[];
  outputs: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  finalCtaTitle: string;
  finalCtaSummary: string;
};

export const aiSystemPages: AiSystemPage[] = [
  {
    slug: "narua",
    id: "narua",
    eyebrow: "AI System",
    headline: "Neroa is the core orchestrator that turns build intent into the next useful move.",
    description:
      "Neroa is the main intelligence layer of Neroa. It guides the user-facing flow, frames the Engine, decides which specialist system should widen the work, and routes backend build or review systems only when execution really needs them.",
    summaryPanelTitle: "What Neroa anchors",
    summaryPanelItems: [
      "Guided intake, category selection, and Engine creation",
      "Workflow direction across Strategy, Scope, Budget, Build Definition, Build, Test, Launch, and Operate",
      "Specialist activation, backend execution routing, and next-step guidance"
    ],
    capabilities: [
      {
        title: "Frame the build",
        description:
          "Neroa turns a rough SaaS, internal software, external app, or mobile app idea into a defined direction and the right first question."
      },
      {
        title: "Guide the Engine flow",
        description:
          "It keeps the Engine moving from Strategy through Launch without making the user manually manage the system."
      },
      {
        title: "Coordinate the right systems",
        description:
          "Neroa decides when Atlas, Forge, RepoLink, Nova, Pulse, or Ops should activate, then routes backend execution or review only when the build requires it."
      }
    ],
    activatesWhen: [
      "A new Engine starts with vague intent, a loose category, or an unshaped idea.",
      "The system needs to decide which stage, lane, or specialist should activate next.",
      "Multiple outputs must stay aligned to one build path, budget reality, and next step."
    ],
    collaboration: [
      {
        id: "atlas",
        label: "Strategy and architecture",
        description:
          "Neroa pulls in Atlas when the build needs stronger product logic, research, or architecture reasoning before the team commits."
      },
      {
        id: "forge",
        label: "Execution planning",
        description:
          "Neroa activates Forge when the plan must harden into implementation structure, build sequencing, and execution logic."
      },
      {
        id: "repolink",
        label: "GitHub coordination",
        description:
          "Neroa brings in RepoLink when GitHub, repositories, branches, commits, or pull-request context should shape the next move."
      }
    ],
    outputs: [
      "Engine framing and build-path recommendations",
      "Specialist activation guidance with clearer next steps",
      "A guided path that keeps the user moving instead of stalling in chat"
    ],
    primaryCtaLabel: "Start with Neroa",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Explore all AI systems",
    secondaryCtaHref: "/system",
    finalCtaTitle: "Use Neroa as the control layer for the whole build",
    finalCtaSummary:
      "Start in one place, let Neroa define the next useful step, and widen the system only when it improves the build."
  },
  {
    slug: "forge",
    id: "forge",
    eyebrow: "AI System",
    headline: "Forge shapes build execution, implementation planning, and delivery structure.",
    description:
      "Forge is Neroa's build execution system. It takes the work Neroa has framed and turns it into implementation structure, technical sequencing, and a clearer delivery path across SaaS, internal software, external apps, and mobile apps.",
    summaryPanelTitle: "Where Forge adds value",
    summaryPanelItems: [
      "Implementation structure and execution sequencing",
      "Build planning before repository work turns on",
      "Handoffs that are easier to route into real delivery"
    ],
    capabilities: [
      {
        title: "Translate intent into structure",
        description:
          "Forge turns product intent into cleaner implementation steps, system shape, and delivery order."
      },
      {
        title: "Reduce build ambiguity",
        description:
          "It narrows the build scope so the next engineering, automation, or product move is easier to execute."
      },
      {
        title: "Support the execution handoff",
        description:
          "Forge prepares the work for repository execution, review, and shipping without pretending to replace the full implementation layer."
      }
    ],
    activatesWhen: [
      "A build path must become a system, workflow, architecture outline, or implementation sequence.",
      "An Engine moves from idea and MVP framing into real build planning.",
      "The team needs structure before repository edits, testing, or delivery begins."
    ],
    collaboration: [
      {
        id: "narua",
        label: "Orchestration",
        description:
          "Neroa decides when Forge should step in so execution work stays aligned to the product goal."
      },
      {
        id: "repolink",
        label: "Repository context",
        description:
          "Forge pairs with RepoLink when GitHub, codebase, branch, commit, or pull-request context matters."
      },
      {
        id: "ops",
        label: "Delivery readiness",
        description:
          "Forge and Ops work together when a build needs deployment planning, connected services, and repeatable delivery structure."
      }
    ],
    outputs: [
      "Implementation outlines and build sequences",
      "Technical maps, execution scaffolds, and stack-shaping notes",
      "Cleaner handoffs into repository work, review, and delivery"
    ],
    primaryCtaLabel: "Explore SaaS builds",
    primaryCtaHref: "/use-cases/saas",
    secondaryCtaLabel: "Back to AI systems",
    secondaryCtaHref: "/system",
    finalCtaTitle: "Use Forge when the work has to become buildable",
    finalCtaSummary:
      "Bring Forge in when planning alone is no longer enough and the Engine needs a sharper execution structure."
  },
  {
    slug: "atlas",
    id: "atlas",
    eyebrow: "AI System",
    headline: "Atlas strengthens strategy, architecture, research, and product logic before the team commits.",
    description:
      "Atlas is the strategy and architecture system inside Neroa. It helps the build stay grounded in better product logic, stronger research, and clearer tradeoff thinking before execution costs start rising.",
    summaryPanelTitle: "Where Atlas operates best",
    summaryPanelItems: [
      "Research synthesis and decision-ready reasoning",
      "Architecture and product-logic support",
      "Pressure-testing assumptions before the build widens"
    ],
    capabilities: [
      {
        title: "Deepen analysis",
        description:
          "Atlas is useful when the Engine needs better judgment, sharper framing, or more durable strategic reasoning."
      },
      {
        title: "Strengthen product decisions",
        description:
          "It helps compare options, surface tradeoffs, and keep the build direction grounded in better product context."
      },
      {
        title: "Support architecture logic",
        description:
          "Atlas helps clarify system logic, product boundaries, and why the build should take one path instead of another."
      }
    ],
    activatesWhen: [
      "An Engine needs stronger strategy, research, or architecture framing.",
      "The team is comparing options, feature boundaries, or roadmap directions.",
      "Neroa needs a clearer decision base before routing the next move."
    ],
    collaboration: [
      {
        id: "narua",
        label: "Decision flow",
        description:
          "Neroa uses Atlas to sharpen product thinking before it turns the work into output."
      },
      {
        id: "forge",
        label: "Implementation planning",
        description:
          "Atlas gives Forge stronger product logic when the work moves into implementation planning and build sequencing."
      },
      {
        id: "nova",
        label: "Customer-facing clarity",
        description:
          "Atlas helps Nova when design direction, UX copy, or brand decisions need stronger strategic grounding."
      }
    ],
    outputs: [
      "Research summaries and option comparisons",
      "Clearer product logic, system boundaries, and roadmap guidance",
      "Decision support that improves the rest of the build system"
    ],
    primaryCtaLabel: "Explore internal software",
    primaryCtaHref: "/use-cases/internal-software",
    secondaryCtaLabel: "Back to AI systems",
    secondaryCtaHref: "/system",
    finalCtaTitle: "Use Atlas when better context changes the decision",
    finalCtaSummary:
      "Bring Atlas into the flow when the work needs sharper reasoning before the team commits to build, launch, or execution."
  },
  {
    slug: "repolink",
    id: "repolink",
    eyebrow: "AI System",
    headline: "RepoLink brings GitHub, repositories, commits, pull requests, and connected systems into the build flow.",
    description:
      "RepoLink is Neroa's repository coordination system. It keeps GitHub, codebases, branches, commits, pull requests, and deployment-linked context attached to the Engine so the build stays grounded in the real source of truth.",
    summaryPanelTitle: "What RepoLink connects",
    summaryPanelItems: [
      "GitHub, repository, and codebase context",
      "Branch, commit, and pull-request coordination",
      "Deployment-adjacent technical awareness across the Engine"
    ],
    capabilities: [
      {
        title: "Anchor repository context",
        description:
          "RepoLink ties the system back to the real repo, codebase, branch, and environment instead of leaving the work abstract."
      },
      {
        title: "Improve delivery continuity",
        description:
          "It supports build, deployment, and implementation lanes where outside system context matters."
      },
      {
        title: "Support pull-request coordination",
        description:
          "RepoLink helps the rest of the system stay aware of what changed, what shipping depends on, and what review should happen next."
      }
    ],
    activatesWhen: [
      "An Engine needs GitHub, repository, or connected-system context.",
      "Build work must stay grounded in actual files, branches, commits, or technical dependencies.",
      "The project is moving closer to implementation, deployment, or integration."
    ],
    collaboration: [
      {
        id: "forge",
        label: "Build context",
        description:
          "RepoLink pairs with Forge when technical planning needs a real repository anchor before implementation begins."
      },
      {
        id: "ops",
        label: "Delivery context",
        description:
          "RepoLink keeps Ops aware of what deployment, connected services, and launch workflows depend on."
      },
      {
        id: "narua",
        label: "System framing",
        description:
          "Neroa uses RepoLink when broader build decisions need GitHub and codebase reality attached."
      }
    ],
    outputs: [
      "Repo-aware technical context",
      "Branch, commit, and pull-request visibility",
      "Cleaner coordination across build-heavy lanes and connected services"
    ],
    primaryCtaLabel: "Explore internal software",
    primaryCtaHref: "/use-cases/internal-software",
    secondaryCtaLabel: "Back to AI systems",
    secondaryCtaHref: "/system",
    finalCtaTitle: "Use RepoLink when the project needs real technical grounding",
    finalCtaSummary:
      "Bring RepoLink into the flow when shipping depends on GitHub, repositories, pull requests, environments, and connected deployment context."
  },
  {
    slug: "nova",
    id: "nova",
    eyebrow: "AI System",
    headline: "Nova shapes content, design direction, UX copy, brand systems, and customer-facing assets.",
    description:
      "Nova is Neroa's customer-facing design system. It helps teams shape brand direction, interface priorities, UX copy, and content assets without disconnecting presentation from the rest of the build.",
    summaryPanelTitle: "Where Nova shines",
    summaryPanelItems: [
      "Brand direction and customer-facing content",
      "UX copy, interface priorities, and surface clarity",
      "Design language that stays connected to the product and launch goal"
    ],
    capabilities: [
      {
        title: "Clarify the visual direction",
        description:
          "Nova helps identify the design system, tone, and presentation style that best support the product."
      },
      {
        title: "Support branding and UX copy",
        description:
          "It is useful for brand identity, customer-facing content, website structure, interface thinking, and polished presentation."
      },
      {
        title: "Keep customer-facing work tied to the mission",
        description:
          "Nova avoids decorative drift by staying connected to the user, offer, and Engine objective."
      }
    ],
    activatesWhen: [
      "The Engine needs brand, UX copy, customer-facing content, or interface clarity.",
      "A website, app, or launch surface needs a more refined experience.",
      "Neroa needs design support to make the output more usable, credible, or conversion-ready."
    ],
    collaboration: [
      {
        id: "narua",
        label: "Core framing",
        description:
          "Neroa brings Nova in when the user-facing layer should sharpen the Engine result."
      },
      {
        id: "atlas",
        label: "Positioning",
        description:
          "Nova often pairs with Atlas when design and UX-copy choices depend on strategy, product logic, and positioning context."
      },
      {
        id: "ops",
        label: "Launch surfaces",
        description:
          "Nova and Ops work together when customer-facing assets must stay aligned with launch operations, connected services, and support workflows."
      }
    ],
    outputs: [
      "Brand direction and customer-facing content structure",
      "Interface, UX-copy, and website guidance",
      "Sharper assets that support launch, usability, and credibility"
    ],
    primaryCtaLabel: "Explore external apps",
    primaryCtaHref: "/use-cases/external-apps",
    secondaryCtaLabel: "Back to AI systems",
    secondaryCtaHref: "/system",
    finalCtaTitle: "Use Nova when the project needs better customer-facing clarity",
    finalCtaSummary:
      "Activate Nova when brand, UX copy, and customer-facing presentation need to rise to the level of the build strategy."
  },
  {
    slug: "pulse",
    id: "pulse",
    eyebrow: "AI System",
    headline: "Pulse handles testing, QA, usage signals, performance checks, and feedback loops.",
    description:
      "Pulse is Neroa's quality and feedback system. It helps the Engine test assumptions, check usability and performance, surface usage signals, and close the loop between launch and the next build decision.",
    summaryPanelTitle: "What Pulse handles best",
    summaryPanelItems: [
      "Testing, QA, and launch-readiness checks",
      "Usage signals, performance checks, and feedback loops",
      "Post-launch learning that stays tied to the real product"
    ],
    capabilities: [
      {
        title: "Turn testing into guidance",
        description:
          "Pulse helps the team turn QA findings, usage signals, and customer feedback into clearer next moves."
      },
      {
        title: "Shape the test loop",
        description:
          "It is strong in prototype tests, beta planning, launch-readiness checks, and the performance loop after release."
      },
      {
        title: "Keep quality practical",
        description:
          "Pulse works best when quality, testing, and feedback need to stay connected to the actual product and Engine history."
      }
    ],
    activatesWhen: [
      "The Engine is moving into Test, Launch, or post-launch iteration.",
      "The team needs QA, usability checks, feedback loops, or performance visibility.",
      "Neroa wants to turn real signals into the next iteration step."
    ],
    collaboration: [
      {
        id: "narua",
        label: "Orchestration",
        description:
          "Neroa activates Pulse when the work should expand from planning into validation, testing, or feedback-driven iteration."
      },
      {
        id: "atlas",
        label: "Product logic",
        description:
          "Atlas helps Pulse when testing results need stronger product reasoning before the team changes scope or direction."
      },
      {
        id: "ops",
        label: "Launch coordination",
        description:
          "Ops keeps launch operations and support workflows aligned with the quality and feedback loops Pulse is surfacing."
      }
    ],
    outputs: [
      "Testing plans, QA notes, and launch-readiness checks",
      "Feedback summaries, usage signals, and performance observations",
      "Next-step guidance grounded in what users and the product are actually doing"
    ],
    primaryCtaLabel: "Explore mobile apps",
    primaryCtaHref: "/use-cases/mobile-apps",
    secondaryCtaLabel: "Back to AI systems",
    secondaryCtaHref: "/system",
    finalCtaTitle: "Use Pulse when the work needs testing and feedback clarity",
    finalCtaSummary:
      "Bring Pulse in when the build needs QA, launch-readiness checks, and feedback loops before the next iteration begins."
  },
  {
    slug: "ops",
    id: "ops",
    eyebrow: "AI System",
    headline: "Ops keeps deployment, connected services, launch operations, and support workflows structured.",
    description:
      "Ops is Neroa's operations and launch system. It helps the Engine move from planning into deployment readiness, connected-service setup, release operations, support workflows, and practical next actions.",
    summaryPanelTitle: "What Ops keeps tight",
    summaryPanelItems: [
      "Deployment, connected services, and release operations",
      "Checklists, SOPs, and support workflows",
      "Blocker visibility and next-action discipline"
    ],
    capabilities: [
      {
        title: "Coordinate launch operations",
        description:
          "Ops supports deployment steps, launch checklists, connected services, and handoff structure."
      },
      {
        title: "Support connected systems",
        description:
          "It keeps domains, DNS, SMTP, Stripe, Vercel, Expo, and store-launch dependencies visible when they matter."
      },
      {
        title: "Keep support workflows practical",
        description:
          "Ops turns launch and post-launch support into visible sequences instead of scattered follow-up."
      }
    ],
    activatesWhen: [
      "The Engine needs deployment readiness, launch operations, or connected-service setup.",
      "The team needs support workflows, checklists, or blocker visibility around release work.",
      "Neroa wants to turn a plan into a more reliable operating sequence."
    ],
    collaboration: [
      {
        id: "narua",
        label: "Execution framing",
        description:
          "Neroa keeps Ops tied to the actual build objective so the process stays useful."
      },
      {
        id: "forge",
        label: "Build support",
        description:
          "Ops pairs with Forge when launch operations depend on technical structure, delivery sequencing, or implementation support."
      },
      {
        id: "repolink",
        label: "Connected context",
        description:
          "Ops and RepoLink work together when deployment, repository, pull-request, or connected-service context must stay aligned."
      }
    ],
    outputs: [
      "Deployment checklists, support workflows, and SOP drafts",
      "Connected-service visibility with blockers and dependencies surfaced",
      "Next-step guidance that keeps launch and operations moving"
    ],
    primaryCtaLabel: "Explore mobile apps",
    primaryCtaHref: "/use-cases/mobile-apps",
    secondaryCtaLabel: "Back to AI systems",
    secondaryCtaHref: "/system",
    finalCtaTitle: "Use Ops when launch readiness matters more than more ideas",
    finalCtaSummary:
      "Bring Ops into the system when deployment, connected services, launch coordination, and support workflows need to tighten up."
  }
];

export const aiSystemCards = aiSystemPages.map((page) => ({
  id: page.id,
  slug: page.slug,
  name: AGENTS[page.id].name,
  role: AGENTS[page.id].role,
  description: page.description
}));

export function normalizeAiSystemSlug(slug: string) {
  // Preserve the retired "naroa" slug as a read-only alias while directing
  // all canonical system routes through the current "narua" page.
  return slug === "naroa" ? "narua" : slug;
}

export function getAiSystemPage(slug: string) {
  const normalizedSlug = normalizeAiSystemSlug(slug);
  return aiSystemPages.find((page) => page.slug === normalizedSlug) ?? null;
}

export function getAiSystemStaticParams() {
  return aiSystemPages.map((page) => ({ slug: page.slug }));
}
