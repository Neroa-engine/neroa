import type { CollaborationAgent } from "@/lib/ai/collaboration";
import { getLaneAiCollaboration } from "@/lib/ai/collaboration";
import type { NaruaMessage } from "@/lib/narua/planning";
import type { ProjectLaneRecord, ProjectRecord } from "@/lib/workspace/project-lanes";

export type LaneArtifact = {
  id: string;
  title: string;
  summary: string;
  items: string[];
};

export type LaneWorkspaceOutputs = {
  title: string;
  summary: string;
  artifacts: LaneArtifact[];
  whatChanged: string[];
  nextMove: string;
  collaboration: CollaborationAgent[];
};

export type LaneWorkspaceSnapshot = {
  version: 1;
  messages: NaruaMessage[];
  draft: string;
  updatedAt: string;
  contextTitle: string | null;
  outputs: LaneWorkspaceOutputs | null;
  lastPrompt: string | null;
};

type LaneInteractionResult = {
  acknowledgement: string;
  reply: string;
  outputs: LaneWorkspaceOutputs;
};

function createMessage(role: NaruaMessage["role"], content: string): NaruaMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content
  };
}

function laneMode(lane: Pick<ProjectLaneRecord, "slug" | "title" | "description">) {
  const text = `${lane.slug} ${lane.title} ${lane.description}`.toLowerCase();

  if (text.includes("domain") || text.includes("name")) {
    return "domain";
  }

  if (text.includes("business plan") || text.includes("plan")) {
    return "business_plan";
  }

  if (text.includes("brand") || text.includes("ui ux") || text.includes("design")) {
    return "branding";
  }

  if (text.includes("website") || text.includes("storefront") || text.includes("launch website")) {
    return "website";
  }

  if (text.includes("operations") || text.includes("deployment") || text.includes("documentation")) {
    return "operations";
  }

  if (text.includes("marketing") || text.includes("growth") || text.includes("sales")) {
    return "marketing";
  }

  return "build";
}

function cleanInput(value: string) {
  return value.trim().replace(/[.!?]+$/, "");
}

function titleWords(project: ProjectRecord) {
  return cleanInput(project.title)
    .split(/\s+/)
    .filter(Boolean);
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function buildDomainCandidates(project: ProjectRecord, prompt: string) {
  const words = unique(
    [...titleWords(project), ...cleanInput(prompt).split(/\s+/)]
      .map((item) => item.toLowerCase().replace(/[^a-z0-9]/g, ""))
      .filter((item) => item.length > 2)
  ).slice(0, 4);
  const seed = words[0] ?? "narua";
  const alt = words[1] ?? "studio";
  const third = words[2] ?? "works";

  return [
    `${seed}${alt}.com`,
    `${seed}${third}.com`,
    `${seed}hq.com`,
    `${seed}${alt}.io`
  ];
}

function buildBusinessPlanOutputs(project: ProjectRecord, lane: ProjectLaneRecord, prompt: string): LaneWorkspaceOutputs {
  const subject = cleanInput(prompt) || project.title;

  return {
    title: "Business plan draft",
    summary: `Naroa drafted the first business plan structure for ${subject}.`,
    whatChanged: [
      "Built the first plan section structure.",
      "Mapped milestone logic for the opening phase.",
      "Surfaced assumptions that still need validation."
    ],
    nextMove: "Review the milestone sequence, then tighten the budget assumptions before moving deeper into execution.",
    collaboration: getLaneAiCollaboration(lane),
    artifacts: [
      {
        id: "plan-sections",
        title: "Plan sections",
        summary: "The core plan structure Naroa generated for this business direction.",
        items: [
          "Business model and problem being solved",
          "Target customer and demand signal",
          "Offer, pricing, and first delivery scope",
          "Launch milestones and operating assumptions"
        ]
      },
      {
        id: "milestones",
        title: "Milestones",
        summary: "The first practical sequence for moving this plan into action.",
        items: [
          "Lock positioning and customer focus",
          "Define the first offer and pricing logic",
          "Prepare launch assets and workflow steps",
          "Review execution risk before widening the project"
        ]
      },
      {
        id: "assumptions",
        title: "Assumptions",
        summary: "The assumptions Naroa wants validated before the plan hardens.",
        items: [
          "The customer segment is specific enough to message clearly",
          "The first offer can be delivered without operational sprawl",
          "The launch budget can support the first 90-day push"
        ]
      }
    ]
  };
}

function buildDomainOutputs(project: ProjectRecord, lane: ProjectLaneRecord, prompt: string): LaneWorkspaceOutputs {
  const candidates = buildDomainCandidates(project, prompt);

  return {
    title: "Name and domain shortlist",
    summary: "Naroa generated the first candidate matrix and registrar setup path.",
    whatChanged: [
      "Created a focused naming shortlist.",
      "Mapped an initial domain availability matrix.",
      "Added the first registrar and connection flow."
    ],
    nextMove: "Choose two candidates to pressure-test against brand tone, then confirm registrar and connection steps.",
    collaboration: getLaneAiCollaboration(lane),
    artifacts: [
      {
        id: "candidate-names",
        title: "Candidate names",
        summary: "Naroa narrowed the naming direction to options that can still flex into brand and launch work.",
        items: candidates.map((item) => item.replace(/\.(com|io)$/, ""))
      },
      {
        id: "domain-matrix",
        title: "Domain matrix",
        summary: "Initial availability assumptions to help narrow the shortlist.",
        items: candidates.map((item, index) =>
          `${item} - ${index === 0 ? "best-fit primary" : index === 1 ? "strong alternate" : index === 2 ? "brandable fallback" : "tech-forward option"}`
        )
      },
      {
        id: "connect-flow",
        title: "Registrar and connect flow",
        summary: "What happens after a candidate is chosen.",
        items: [
          "Reserve the strongest domain with registrar ownership under the project operator",
          "Point DNS toward the future website or launch stack",
          "Track naming conflicts before brand and website work move forward"
        ]
      }
    ]
  };
}

function buildBrandingOutputs(project: ProjectRecord, lane: ProjectLaneRecord, prompt: string): LaneWorkspaceOutputs {
  const subject = cleanInput(prompt) || project.title;

  return {
    title: "Brand direction",
    summary: `Naroa generated the first brand system for ${subject}.`,
    whatChanged: [
      "Defined the first voice and tone direction.",
      "Mapped brand pillars and positioning cues.",
      "Outlined the visual direction the rest of the product should follow."
    ],
    nextMove: "Choose the strongest tone direction, then carry it into domain and website work so the system stays aligned.",
    collaboration: getLaneAiCollaboration(lane),
    artifacts: [
      {
        id: "voice",
        title: "Voice and tone",
        summary: "The voice Naroa recommends for the first outward-facing version.",
        items: [
          "Confident and precise instead of generic",
          "Clear about value, not overloaded with hype",
          "Premium enough to support trust and conversion"
        ]
      },
      {
        id: "pillars",
        title: "Brand pillars",
        summary: "The brand ideas Naroa wants repeated consistently.",
        items: [
          "Clarity in what the offer does",
          "Credibility in how the work is delivered",
          "Momentum in how the business moves from idea to launch"
        ]
      },
      {
        id: "visual",
        title: "Visual direction",
        summary: "The first visual system direction to guide future creative decisions.",
        items: [
          "Light premium interface system with cyan and violet emphasis",
          "Minimal visual clutter with soft depth and atmospheric gradients",
          "Strong typography hierarchy over decorative UI chrome"
        ]
      }
    ]
  };
}

function buildWebsiteOutputs(project: ProjectRecord, lane: ProjectLaneRecord): LaneWorkspaceOutputs {
  return {
    title: "Website structure draft",
    summary: "Naroa drafted the first website structure, page flow, and conversion path.",
    whatChanged: [
      "Mapped the first sitemap.",
      "Defined the page sequence and page requirements.",
      "Added a launch checklist and conversion path."
    ],
    nextMove: "Review the page flow, then move into copy or launch requirements before build work starts.",
    collaboration: getLaneAiCollaboration(lane),
    artifacts: [
      {
        id: "sitemap",
        title: "Sitemap",
        summary: "The first page structure Naroa recommends for launch.",
        items: ["Home", "Offer / Solution", "How it works", "About / Credibility", "Contact or CTA page"]
      },
      {
        id: "page-requirements",
        title: "Page requirements",
        summary: "What each page needs so the site can actually perform.",
        items: [
          "Clear headline and outcome framing",
          "Proof, process, and trust elements",
          "Primary CTA and next-step path"
        ]
      },
      {
        id: "launch-checklist",
        title: "Launch checklist",
        summary: "The minimum set of tasks before the site should go live.",
        items: [
          "Finalize brand and naming direction",
          "Approve page copy and CTA logic",
          "Confirm analytics, forms, and handoff path"
        ]
      }
    ]
  };
}

function buildOperationsOutputs(project: ProjectRecord, lane: ProjectLaneRecord): LaneWorkspaceOutputs {
  return {
    title: "Workflow map",
    summary: "Naroa generated the first workflow map, SOP draft, and execution checklist.",
    whatChanged: [
      "Mapped the core workflow path.",
      "Drafted SOP-style handoff steps.",
      "Built the first execution checklist."
    ],
    nextMove: "Pressure-test the workflow against real delivery steps, then automate only the sections that repeat cleanly.",
    collaboration: getLaneAiCollaboration(lane),
    artifacts: [
      {
        id: "workflow",
        title: "Workflow map",
        summary: "The first operating flow Naroa recommends.",
        items: [
          "Intake and scope confirmation",
          "Execution handoff and delivery step sequencing",
          "Review, approval, and completion tracking"
        ]
      },
      {
        id: "sops",
        title: "SOP drafts",
        summary: "The first standard operating procedures Naroa wants formalized.",
        items: [
          "Client or task intake checklist",
          "Internal handoff and owner assignment",
          "Completion review and follow-up sequence"
        ]
      },
      {
        id: "execution-checklist",
        title: "Execution checklist",
        summary: "The actions Naroa wants repeated the same way every cycle.",
        items: [
          "Confirm scope before execution begins",
          "Track blockers and dependencies daily",
          "Close the loop with completion notes and next actions"
        ]
      }
    ]
  };
}

function buildMarketingOutputs(project: ProjectRecord, lane: ProjectLaneRecord): LaneWorkspaceOutputs {
  return {
    title: "Marketing plan",
    summary: "Naroa generated the first launch marketing plan and demand-channel sequence.",
    whatChanged: [
      "Built the first campaign priority stack.",
      "Mapped the strongest early demand channels.",
      "Added the first promotion path and next move."
    ],
    nextMove: "Choose the first acquisition channel, then narrow the message before the full launch motion expands.",
    collaboration: getLaneAiCollaboration(lane),
    artifacts: [
      {
        id: "marketing-plan",
        title: "Marketing plan",
        summary: "The first practical launch motion Naroa recommends.",
        items: [
          "Define the primary message and call to action",
          "Choose one channel to prove demand first",
          "Support the launch with repeatable weekly content or outreach"
        ]
      },
      {
        id: "channel-priorities",
        title: "Channel priorities",
        summary: "The channels Naroa wants tested before wider spend.",
        items: ["Direct outreach", "Owned content", "Referral or partner motion"]
      },
      {
        id: "promotion-path",
        title: "Launch promotion path",
        summary: "How the first demand push should unfold.",
        items: [
          "Lock the message and landing path",
          "Activate one channel with focused weekly motion",
          "Measure response before widening campaign complexity"
        ]
      }
    ]
  };
}

function buildBuildOutputs(project: ProjectRecord, lane: ProjectLaneRecord): LaneWorkspaceOutputs {
  return {
    title: "Execution structure",
    summary: `Naroa generated the first ${lane.title.toLowerCase()} deliverable set and execution path.`,
    whatChanged: [
      "Built the first deliverable structure for this lane.",
      "Mapped the main task sequence.",
      "Added a next move so the work does not stall."
    ],
    nextMove: "Review the generated structure, confirm the priority order, then open the next adjacent lane only if it unblocks delivery.",
    collaboration: getLaneAiCollaboration(lane),
    artifacts: [
      {
        id: "lane-structure",
        title: lane.title,
        summary: "The first structured output Naroa generated for this lane.",
        items: lane.deliverables.length > 0 ? lane.deliverables : ["Initial scoped output", "Priority sequence", "Execution notes"]
      },
      {
        id: "task-sequence",
        title: "Task sequence",
        summary: "The first working order Naroa recommends for execution.",
        items: [
          "Lock the scope and expected outcome",
          "Break the lane into the smallest useful deliverables",
          "Sequence the work so blockers surface early"
        ]
      },
      {
        id: "decision-risks",
        title: "Decision risks",
        summary: "The areas Naroa wants watched before the lane expands.",
        items: [
          "Scope growing before the first output is validated",
          "Dependencies not being surfaced early enough",
          "Opening too many adjacent lanes too soon"
        ]
      }
    ]
  };
}

function buildOutputs(project: ProjectRecord, lane: ProjectLaneRecord, prompt: string) {
  switch (laneMode(lane)) {
    case "domain":
      return buildDomainOutputs(project, lane, prompt);
    case "business_plan":
      return buildBusinessPlanOutputs(project, lane, prompt);
    case "branding":
      return buildBrandingOutputs(project, lane, prompt);
    case "website":
      return buildWebsiteOutputs(project, lane);
    case "operations":
      return buildOperationsOutputs(project, lane);
    case "marketing":
      return buildMarketingOutputs(project, lane);
    case "build":
    default:
      return buildBuildOutputs(project, lane);
  }
}

export function createLaneWorkspaceWelcome(project: ProjectRecord, lane: ProjectLaneRecord) {
  const outputs = buildOutputs(project, lane, project.description ?? project.title);

  return {
    version: 1 as const,
    messages: [
      createMessage(
        "narua",
        `Naroa is ready to generate the first ${lane.title.toLowerCase()} deliverable for ${project.title}.`
      )
    ],
    draft: "",
    updatedAt: new Date(0).toISOString(),
    contextTitle: lane.title,
    outputs: null,
    lastPrompt: null
  } satisfies LaneWorkspaceSnapshot;
}

export function parseLaneWorkspaceSnapshot(value: string | null): LaneWorkspaceSnapshot | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<LaneWorkspaceSnapshot> | null;

    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.messages) || typeof parsed.draft !== "string") {
      return null;
    }

    return {
      version: 1,
      messages: parsed.messages as NaruaMessage[],
      draft: parsed.draft,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
      contextTitle: typeof parsed.contextTitle === "string" ? parsed.contextTitle : null,
      outputs:
        parsed.outputs &&
        typeof parsed.outputs.title === "string" &&
        typeof parsed.outputs.summary === "string" &&
        Array.isArray(parsed.outputs.artifacts) &&
        Array.isArray(parsed.outputs.whatChanged) &&
        typeof parsed.outputs.nextMove === "string" &&
        Array.isArray(parsed.outputs.collaboration)
          ? {
              title: parsed.outputs.title,
              summary: parsed.outputs.summary,
              artifacts: parsed.outputs.artifacts as LaneArtifact[],
              whatChanged: parsed.outputs.whatChanged as string[],
              nextMove: parsed.outputs.nextMove,
              collaboration: parsed.outputs.collaboration as CollaborationAgent[]
            }
          : null,
      lastPrompt: typeof parsed.lastPrompt === "string" ? parsed.lastPrompt : null
    };
  } catch {
    return null;
  }
}

export function buildLaneWorkspaceStorageValue(snapshot: LaneWorkspaceSnapshot) {
  return JSON.stringify(snapshot);
}

export function getLaneWorkspaceSuggestedPrompts(lane: ProjectLaneRecord) {
  return lane.starterPrompts.slice(0, 4);
}

export function runLaneWorkspacePrompt(args: {
  project: ProjectRecord;
  lane: ProjectLaneRecord;
  snapshot: LaneWorkspaceSnapshot;
  prompt: string;
}): LaneInteractionResult {
  const cleaned = cleanInput(args.prompt);
  const outputs = buildOutputs(args.project, args.lane, cleaned);
  const acknowledgement = `Naroa is generating the first ${outputs.title.toLowerCase()} for ${args.lane.title}.`;
  const reply = `${outputs.summary} ${outputs.nextMove}`;

  return {
    acknowledgement,
    reply,
    outputs
  };
}

export function buildLaneWorkspaceNextSnapshot(args: {
  project: ProjectRecord;
  lane: ProjectLaneRecord;
  snapshot: LaneWorkspaceSnapshot;
  prompt: string;
}) {
  const trimmed = args.prompt.trim();

  if (!trimmed) {
    return {
      snapshot: args.snapshot,
      acknowledgement: "",
      reply: ""
    };
  }

  const result = runLaneWorkspacePrompt(args);
  const nextMessages = [
    ...args.snapshot.messages,
    createMessage("user", trimmed),
    createMessage("narua", result.acknowledgement),
    createMessage("narua", result.reply)
  ];

  return {
    acknowledgement: result.acknowledgement,
    reply: result.reply,
    snapshot: {
      ...args.snapshot,
      messages: nextMessages,
      draft: "",
      updatedAt: new Date().toISOString(),
      outputs: result.outputs,
      lastPrompt: trimmed
    } satisfies LaneWorkspaceSnapshot
  };
}
