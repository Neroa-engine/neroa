export type UseCasePage = {
  slug: string;
  title: string;
  eyebrow: string;
  heroTitle: string;
  intro: string;
  summary: string;
  pillars: Array<{
    title: string;
    description: string;
  }>;
  workflow: string[];
};

export type HowItWorksPage = {
  slug: string;
  index: string;
  title: string;
  eyebrow: string;
  intro: string;
  summary: string;
  outline: Array<{
    title: string;
    description: string;
  }>;
};

export const useCasePages: UseCasePage[] = [
  {
    slug: "business-planning",
    title: "Business planning",
    eyebrow: "Use Case",
    heroTitle: "Use AI to shape strategy, structure decisions, and turn planning into action",
    intro:
      "Business planning inside Neroa brings strategy, market thinking, scenario building, stakeholder communication, and execution sequencing into one workspace.",
    summary:
      "AI can help teams move faster on business planning by drafting plans, pressure-testing assumptions, organizing priorities, and keeping decisions connected to execution.",
    pillars: [
      {
        title: "Clarify the business model",
        description:
          "Use AI to define the offer, customer, positioning, revenue logic, and operating constraints before work starts drifting."
      },
      {
        title: "Model strategic choices",
        description:
          "Explore scenarios, compare options, and map tradeoffs across pricing, go-to-market, resourcing, and sequencing."
      },
      {
        title: "Turn plans into operating structure",
        description:
          "Move from abstract direction into concrete priorities, milestones, owners, and execution plans."
      }
    ],
    workflow: [
      "Start with the goal, market, and operating context.",
      "Ask Neroa to map opportunities, risks, and execution options.",
      "Refine the plan into priorities, workstreams, and stakeholder-ready outputs."
    ]
  },
  {
    slug: "writing-and-research",
    title: "Writing and research",
    eyebrow: "Use Case",
    heroTitle: "Use AI for writing and research inside one connected project system",
    intro:
      "Writing and research in Neroa means using AI to gather context, synthesize information, structure arguments, and draft polished outputs without losing the thread of the project.",
    summary:
      "AI can help with research by collecting patterns, organizing source material, highlighting gaps, and translating notes into briefs, memos, documentation, and high-quality written work.",
    pillars: [
      {
        title: "Research with continuity",
        description:
          "Keep questions, findings, summaries, and follow-up directions together so research compounds instead of resetting every session."
      },
      {
        title: "Write from structured context",
        description:
          "Turn source material, notes, and positioning into documents, briefs, reports, and persuasive writing with much less friction."
      },
      {
        title: "Improve quality through iteration",
        description:
          "Use multiple AI systems for synthesis, critique, rewriting, expansion, and tightening until the work is ready to ship."
      }
    ],
    workflow: [
      "Gather source material, notes, and the core question inside one workspace.",
      "Route research and synthesis tasks through the right AI teammate.",
      "Draft, edit, and refine the final writing with context preserved."
    ]
  },
  {
    slug: "saas-product-development",
    title: "SaaS product development",
    eyebrow: "Use Case",
    heroTitle: "Bring SaaS product development into one multi-AI execution workspace",
    intro:
      "Neroa helps product teams connect product thinking, UX, technical planning, documentation, and implementation inside one operating system.",
    summary:
      "AI can support SaaS product development by accelerating idea validation, feature framing, user-flow design, technical planning, backlog creation, and implementation coordination.",
    pillars: [
      {
        title: "Define the product clearly",
        description:
          "Shape the problem, user value, feature scope, and release narrative before engineering work begins."
      },
      {
        title: "Connect planning to implementation",
        description:
          "Move from product specs and UX thinking into technical architecture, repo context, and engineering tasks."
      },
      {
        title: "Keep product work executable",
        description:
          "Make every decision easier to hand off into code, tasks, design revisions, and launch preparation."
      }
    ],
    workflow: [
      "Outline the product objective, users, and release scope.",
      "Use AI to produce specs, flows, technical plans, and implementation tasks.",
      "Coordinate coding, docs, and launch work inside the same workspace."
    ]
  },
  {
    slug: "coding-workflows",
    title: "Coding workflows",
    eyebrow: "Use Case",
    heroTitle: "Use multiple AIs to support coding workflows without losing project context",
    intro:
      "Coding workflows in Neroa combine planning, repository context, code generation, debugging support, documentation, and execution tracking inside one workspace.",
    summary:
      "AI can help coding teams generate implementation plans, draft code, reason through architecture, improve documentation, and keep development tied to the actual product goal.",
    pillars: [
      {
        title: "Plan before coding",
        description:
          "Structure the implementation path, dependencies, and constraints before jumping into execution."
      },
      {
        title: "Pair reasoning with code generation",
        description:
          "Use different AI teammates for architecture, implementation, review support, and source-grounded iteration."
      },
      {
        title: "Keep engineering tied to the real project",
        description:
          "Avoid isolated code sessions by keeping planning, decisions, tasks, and outputs in one system."
      }
    ],
    workflow: [
      "Define the feature or technical objective inside the workspace.",
      "Use AI to outline implementation, write code, and review tradeoffs.",
      "Track the work through debugging, documentation, and delivery."
    ]
  },
  {
    slug: "blockchain-projects",
    title: "Blockchain projects",
    eyebrow: "Use Case",
    heroTitle: "Use AI to move blockchain projects from concept to coordinated execution",
    intro:
      "Blockchain work often mixes strategy, token design, protocol analysis, smart-contract planning, technical implementation, and launch communication.",
    summary:
      "Neroa helps teams use AI to structure blockchain thinking, explore protocol choices, document system design, and connect technical work to launch execution.",
    pillars: [
      {
        title: "Clarify protocol and product logic",
        description:
          "Use AI to reason about architecture, incentives, user flows, token mechanics, and system constraints."
      },
      {
        title: "Support technical planning",
        description:
          "Move from concept documents into smart-contract implementation plans, repo workflows, and testing priorities."
      },
      {
        title: "Connect strategy to launch",
        description:
          "Keep narrative, ecosystem thinking, and technical delivery aligned inside one command center."
      }
    ],
    workflow: [
      "Define the chain, protocol, or product objective.",
      "Use AI to evaluate architecture, smart-contract strategy, and launch preparation.",
      "Coordinate technical build work and communication from the same workspace."
    ]
  },
  {
    slug: "operations-and-execution",
    title: "Operations and execution",
    eyebrow: "Use Case",
    heroTitle: "Use AI to drive operations and execution across real business systems",
    intro:
      "Operations and execution in Neroa means connecting planning, documents, software systems, tasks, and AI output so work moves forward with fewer gaps.",
    summary:
      "AI can help operations teams structure workflows, draft internal materials, coordinate handoffs, support ERP and systems thinking, and keep execution visible across the whole project.",
    pillars: [
      {
        title: "Coordinate moving parts",
        description:
          "Bring operating documents, active tasks, software systems, and AI support into one shared project environment."
      },
      {
        title: "Reduce friction in execution",
        description:
          "Use AI to write process docs, summarize progress, draft updates, and support operational decision-making."
      },
      {
        title: "Connect systems to work",
        description:
          "Tie AI output to the systems that matter, including ERP flows, documents, browser workflows, and execution checkpoints."
      }
    ],
    workflow: [
      "Map the operating workflow, systems, and current bottlenecks.",
      "Use AI to draft structure, coordination materials, and execution support.",
      "Track the work across systems and teams inside one command center."
    ]
  }
];

export const howItWorksPages: HowItWorksPage[] = [
  {
    slug: "create-a-workspace",
    index: "01",
    title: "Create a workspace",
    eyebrow: "How It Works",
    intro:
      "A Neroa workspace is the dedicated environment where a project gets its own context, AI stack, documents, decisions, and execution flow.",
    summary:
      "Creating a workspace gives a product, client, initiative, or operating stream one place to think, write, plan, build, and move forward.",
    outline: [
      {
        title: "Start with a real project",
        description:
          "Each workspace is created around a concrete mission, not just a loose chat session."
      },
      {
        title: "Capture context early",
        description:
          "Use the workspace description and first thread to define goals, scope, constraints, and priorities."
      },
      {
        title: "Build continuity from day one",
        description:
          "Everything that follows, including AI outputs, files, tasks, and saved jobs, stays tied to the same operating context."
      }
    ]
  },
  {
    slug: "connect-your-stack",
    index: "02",
    title: "Connect your AI stack",
    eyebrow: "How It Works",
    intro:
      "Neroa is built around the idea that different AIs and systems should support different kinds of work inside the same project.",
    summary:
      "Connecting your stack means assigning roles to AI teammates and linking the software systems that matter for execution.",
    outline: [
      {
        title: "Use specialized AI roles",
        description:
          "One AI can help with strategy and writing, another with deep reasoning, another with code generation."
      },
      {
        title: "Keep providers visible",
        description:
          "You can customize teammate names while keeping the underlying provider clear and attached to the work."
      },
      {
        title: "Connect systems too",
        description:
          "Source context, repositories, browser workflows, ERP tools, and docs can all sit around the same workspace."
      }
    ]
  },
  {
    slug: "build-inside-one-command-center",
    index: "03",
    title: "Build inside one command center",
    eyebrow: "How It Works",
    intro:
      "The command center is where planning, writing, coding, research, and execution stay connected instead of fragmenting across separate tabs and tools.",
    summary:
      "Building inside one command center means Neroa becomes the operating layer for active work, not just the place where prompts are written.",
    outline: [
      {
        title: "Route work through the right systems",
        description:
          "Use the workspace thread to direct work to the best AI teammate and connected context for the job."
      },
      {
        title: "Keep execution visible",
        description:
          "Tasks, saved jobs, software context, and project outputs stay tied to the same operating environment."
      },
      {
        title: "Move from idea to action",
        description:
          "The goal is not simply generating responses. The goal is shipping work with better continuity and control."
      }
    ]
  }
];

export function getUseCasePage(slug: string) {
  return useCasePages.find((page) => page.slug === slug);
}

export function getHowItWorksPage(slug: string) {
  return howItWorksPages.find((page) => page.slug === slug);
}
