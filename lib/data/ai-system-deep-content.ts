import type { AgentId } from "@/lib/ai/agents";

export type AiSystemDeepSection = {
  title: string;
  description: string;
};

export type AiSystemDeepContent = {
  story: string[];
  bestFor: string[];
  workflow: AiSystemDeepSection[];
  value: AiSystemDeepSection[];
};

export const aiSystemDeepContent: Record<AgentId, AiSystemDeepContent> = {
  narua: {
    story: [
      "Naroa keeps Neroa from feeling like a pile of disconnected tools. It starts with the build itself, frames the real objective, and decides what should happen next.",
      "Because Naroa stays present across the whole flow, the user does not have to keep resetting context, re-explaining the mission, or manually choosing which specialist, build system, or review system should take over."
    ],
    bestFor: [
      "Starting new Engines with low friction",
      "Turning rough build intent into a clear first move",
      "Keeping specialists, GitHub, and backend build-review systems coordinated"
    ],
    workflow: [
      {
        title: "Interpret the build",
        description:
          "Naroa translates raw input into a usable build direction and the first useful question."
      },
      {
        title: "Open the right specialist path",
        description:
          "It decides where the work should deepen instead of forcing the user to guess which system to use."
      },
      {
        title: "Keep continuity intact",
        description:
          "Naroa ties every supporting output, execution pass, and review result back into the same Engine flow."
      }
    ],
    value: [
      {
        title: "Less setup overhead",
        description: "Users can begin naturally and still arrive at a structured Engine."
      },
      {
        title: "Cleaner orchestration",
        description:
          "The specialist systems, GitHub layer, and backend execution loop feel coordinated instead of noisy."
      },
      {
        title: "Stronger continuity",
        description:
          "Plans, deliverables, repository work, and next moves stay attached to one operating layer."
      }
    ]
  },
  forge: {
    story: [
      "Forge is the system you want when a build must become executable, not just well-described. It turns product intent into implementation structure and delivery logic.",
      "Inside Neroa, Forge narrows ambiguity before repository work begins. It helps the team move from planning language into build logic without pretending to replace the full implementation layer."
    ],
    bestFor: [
      "SaaS, internal software, external app, and mobile build planning",
      "Implementation sequencing before GitHub work turns on",
      "Reducing ambiguity before execution"
    ],
    workflow: [
      {
        title: "Read the objective",
        description: "Forge identifies what must exist for the solution to become real."
      },
      {
        title: "Lay out the structure",
        description:
          "It drafts sequences, system shape, implementation boundaries, and build-path logic."
      },
      {
        title: "Support the execution handoff",
        description:
          "Forge gives repository work, reviews, and delivery steps a cleaner entry point into execution."
      }
    ],
    value: [
      {
        title: "Fewer wasted build cycles",
        description: "The team enters implementation with sharper structure and scope."
      },
      {
        title: "Better technical framing",
        description: "Build work becomes easier to discuss, sequence, and prioritize."
      },
      {
        title: "Cleaner transition to action",
        description: "Planning turns into execution without a full context reset."
      }
    ]
  },
  atlas: {
    story: [
      "Atlas exists for the moments where better context changes the decision. It deepens product logic, strategy, architecture reasoning, and research before the team commits time, money, or execution effort.",
      "Rather than producing generic analysis, Atlas strengthens the quality of direction inside Neroa so the rest of the system can move with more confidence."
    ],
    bestFor: [
      "Research, product logic, and architecture framing",
      "Comparing options and tradeoffs",
      "Pressure-testing plans before execution"
    ],
    workflow: [
      {
        title: "Clarify the real question",
        description:
          "Atlas identifies what build or product decision the team actually needs to make."
      },
      {
        title: "Compare context and tradeoffs",
        description:
          "It synthesizes options, assumptions, and implications into something decision-ready."
      },
      {
        title: "Feed a stronger direction back",
        description:
          "The next stage inherits better strategy and product logic instead of loose assumptions."
      }
    ],
    value: [
      {
        title: "Better calls earlier",
        description: "The Engine avoids widening around weak or untested assumptions."
      },
      {
        title: "Stronger shared context",
        description: "Research and reasoning stay attached to the same Engine flow."
      },
      {
        title: "More durable strategy",
        description: "The direction improves before execution costs begin to rise."
      }
    ]
  },
  repolink: {
    story: [
      "RepoLink keeps technical work inside Neroa connected to the real systems it depends on. It pulls GitHub, repository, branch, commit, pull-request, and environment context closer to decision-making.",
      "That matters because build-heavy projects break down when planning lives in one place and technical reality lives somewhere else. RepoLink helps close that gap."
    ],
    bestFor: [
      "GitHub-aware technical workflows",
      "Branch, commit, and pull-request coordination",
      "Build planning grounded in real systems"
    ],
    workflow: [
      {
        title: "Surface the real context",
        description:
          "RepoLink attaches repositories, branches, pull requests, or environment context to the work."
      },
      {
        title: "Inform the active stage",
        description:
          "That technical reality flows back into planning, build, launch, or operations decisions."
      },
      {
        title: "Improve connected execution",
        description: "The Engine stays closer to what it can actually ship through."
      }
    ],
    value: [
      {
        title: "Less abstract planning",
        description: "Technical work remains anchored to code, systems, and dependencies."
      },
      {
        title: "Better delivery visibility",
        description:
          "Repository, deployment, and integration context stay visible while decisions are made."
      },
      {
        title: "Stronger cross-lane coordination",
        description:
          "Technical and operational layers stay aligned around the same GitHub and connected-system reality."
      }
    ]
  },
  nova: {
    story: [
      "Nova helps design and customer-facing content inside Neroa feel intentional instead of ornamental. It sharpens visual direction, UX copy, brand structure, and customer-facing assets without drifting away from the build mission.",
      "Because Nova sits in the same operating system as Naroa, Atlas, Ops, and Pulse, design choices stay tied to strategy, usability, brand trust, and the actual customer experience."
    ],
    bestFor: [
      "Brand and identity direction",
      "Website, app, and interface experience",
      "Customer-facing content and UX copy"
    ],
    workflow: [
      {
        title: "Set the visual direction",
        description:
          "Nova defines tone, surface language, brand feel, and presentation priorities."
      },
      {
        title: "Shape the user-facing layer",
        description:
          "It turns that direction into clearer brand, UI, UX copy, and customer-facing structure."
      },
      {
        title: "Keep design aligned",
        description:
          "Creative work stays connected to product logic, clarity, and launch goals."
      }
    ],
    value: [
      {
        title: "Clearer brand expression",
        description: "The product looks more intentional and credible to the user."
      },
      {
        title: "Stronger interface thinking",
        description: "User-facing flows become easier to understand, refine, and explain."
      },
      {
        title: "Design and copy that support the mission",
        description: "Creative direction remains useful, not just decorative."
      }
    ]
  },
  pulse: {
    story: [
      "Pulse is the system that turns planning into feedback-aware execution. It helps Neroa move from internal clarity into testing, QA, performance checks, and usage-signal review.",
      "Because Pulse is connected to the same Engine context, it builds testing direction that stays grounded in the real product instead of turning into a detached QA checklist."
    ],
    bestFor: [
      "Testing, QA, and launch-readiness checks",
      "Usage signals and performance review",
      "Turning feedback into the next build decision"
    ],
    workflow: [
      {
        title: "Clarify what should be tested",
        description:
          "Pulse sharpens what the team needs to validate before the next stage of the build."
      },
      {
        title: "Build the feedback loop",
        description:
          "It drafts the right QA checks, launch tests, performance reviews, and post-release signals to watch."
      },
      {
        title: "Keep quality connected",
        description: "Testing and feedback stay tied to the real product and Engine flow."
      }
    ],
    value: [
      {
        title: "Clearer validation signals",
        description:
          "The team knows what is working, what is not, and what should change next."
      },
      {
        title: "More deliberate release quality",
        description:
          "Testing and performance review become sequenced instead of improvised."
      },
      {
        title: "Feedback that stays grounded",
        description: "Usage and QA signals remain connected to the actual product."
      }
    ]
  },
  ops: {
    story: [
      "Ops exists for the parts of the Engine where deployment, connected services, launch operations, and support workflows matter more than more ideas.",
      "When Ops is active, Neroa becomes better at release readiness and follow-through, not just planning. It is the system that helps keep work moving after the initial burst of momentum."
    ],
    bestFor: [
      "Deployment and connected-service setup",
      "Launch operations, checklists, and support workflows",
      "Engines that need stronger follow-through after build planning"
    ],
    workflow: [
      {
        title: "Surface the real release path",
        description:
          "Ops maps the deployment and launch workflow that should exist so execution becomes visible."
      },
      {
        title: "Turn it into operating structure",
        description:
          "It drafts checklists, sequences, connected-service setup, and SOP-style support."
      },
      {
        title: "Keep momentum visible",
        description:
          "The Engine maintains rhythm instead of losing continuity after planning and launch."
      }
    ],
    value: [
      {
        title: "More reliable execution",
        description: "Teams rely less on memory and improvisation to get work done."
      },
      {
        title: "Earlier blocker visibility",
        description:
          "Connected-service and deployment dependencies surface sooner, before they slow the whole Engine down."
      },
      {
        title: "Stronger follow-through",
        description:
          "The system creates real operational structure around launch and support, not just ideas."
      }
    ]
  }
};
