import { inferProjectTemplate, type ProjectTemplateId } from "@/lib/workspace/project-lanes";
import { getModuleDefinitions } from "@/lib/workspace/modules";
import { getLaneById, inferLaneSelection } from "@/lib/workspace/lanes";
import type { LaneId, ModuleId } from "@/lib/workspace/types";

export type NaruaStage = "intake" | "clarification" | "synthesis" | "review";

export type PlanningField =
  | "idea"
  | "projectType"
  | "targetUser"
  | "mainGoal"
  | "mvp"
  | "integrations";

export type PlanningAnswers = {
  idea: string;
  projectType: string;
  targetUser: string;
  mainGoal: string;
  mvp: string;
  integrations: string;
};

export type NaruaMessage = {
  id: string;
  role: "narua" | "user";
  content: string;
};

export type NaruaQuestion = {
  field: PlanningField;
  prompt: string;
};

export type TeammateRecommendation = {
  id: "narua" | "atlas" | "forge" | "repolink";
  name: string;
  provider: "chatgpt" | "claude" | "codex" | "github";
  role: string;
  status: "active" | "recommended" | "standby";
  reason: string;
};

export type GeneratedPlan = {
  title: string;
  projectTemplateId: ProjectTemplateId;
  overview: string;
  projectSummary: string;
  targetUser: string;
  mainGoal: string;
  mvpScope: string[];
  primaryLaneId: LaneId;
  supportingLaneIds: LaneId[];
  recommendedModules: ModuleId[];
  recommendedStack: string[];
  phases: Array<{
    title: string;
    summary: string;
    items: string[];
  }>;
  teammates: TeammateRecommendation[];
  nextSteps: string[];
  expandedSection: {
    title: string;
    paragraphs: string[];
  } | null;
  tasks: string[];
  refinementNotes: string[];
};

export type ReviewAction = "refine" | "expand" | "tasks" | "build_app";

export type NaruaEngineContext = {
  workspaceId: string;
  workspaceName: string;
  workspaceDescription?: string | null;
  engineSlug: string;
  engineTitle: string;
  engineDescription: string;
  recommendedAIStack: string[];
};

export type NaruaWorkspaceContext = {
  workspaceId: string;
  workspaceName: string;
  workspaceDescription?: string | null;
  primaryLaneName: string;
  supportingLaneNames: string[];
};

export type WorkspaceIntakeField =
  | "idea"
  | "businessType"
  | "targetCustomer"
  | "services"
  | "operationSize"
  | "budgetTimeline";

export type WorkspaceIntakeQuestion = {
  field: WorkspaceIntakeField;
  prompt: string;
};

export type WorkspaceIntakeAnswers = {
  idea: string;
  businessType: string;
  targetCustomer: string;
  services: string;
  operationSize: string;
  budgetTimeline: string;
};

export type WorkspaceGeneratedSections = {
  overview: string[];
  businessModel: string[];
  offer: string[];
  roadmap: string[];
  budgetModel: string[];
  executionSteps: string[];
};

const questionOrder: NaruaQuestion[] = [
  {
    field: "targetUser",
    prompt: "Who is this for first? Tell me the primary customer, user, or buyer."
  },
  {
    field: "mainGoal",
    prompt: "What is the main outcome this should produce for you, the team, or the business?"
  },
  {
    field: "mvp",
    prompt: "What should the MVP do first? Give me the smallest valuable first version."
  },
  {
    field: "integrations",
    prompt: "What systems matter right away, like GitHub, ERP, docs, payments, browser workflows, or automations?"
  }
];

export function createEmptyAnswers(): PlanningAnswers {
  return {
    idea: "",
    projectType: "",
    targetUser: "",
    mainGoal: "",
    mvp: "",
    integrations: ""
  };
}

export function createWelcomeMessage() {
  return "Hi, I'm Naroa. Tell me what you want to build and I'll shape it into a real execution plan.";
}

export function buildWorkspaceName(idea: string) {
  const cleaned = idea.trim().replace(/[.!?]+$/, "");

  if (!cleaned) {
    return "New Neroa Workspace";
  }

  return cleaned
    .split(/\s+/)
    .slice(0, 8)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function inferProjectType(idea: string) {
  const normalized = idea.toLowerCase();

  if (normalized.includes("screen print") || normalized.includes("agency") || normalized.includes("service")) {
    return "Service business";
  }

  if (normalized.includes("website") || normalized.includes("landing page")) {
    return "Website build";
  }

  if (normalized.includes("saas") || normalized.includes("app") || normalized.includes("platform")) {
    return "SaaS product";
  }

  if (normalized.includes("erp") || normalized.includes("ops") || normalized.includes("operations")) {
    return "Operations system";
  }

  if (normalized.includes("crypto") || normalized.includes("blockchain") || normalized.includes("token")) {
    return "Crypto project";
  }

  return "Business initiative";
}

export function splitList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function countUsefulAnswers(answers: PlanningAnswers) {
  return [
    answers.idea,
    answers.targetUser,
    answers.mainGoal,
    answers.mvp,
    answers.integrations
  ].filter((value) => value.trim().length > 0).length;
}

export function getNextQuestion(answers: PlanningAnswers) {
  for (const question of questionOrder) {
    if (!answers[question.field].trim()) {
      return question;
    }
  }

  return null;
}

export function hasEnoughContext(answers: PlanningAnswers) {
  const usefulAnswerCount = countUsefulAnswers(answers);

  if (answers.idea.trim() && answers.targetUser.trim() && answers.mainGoal.trim() && answers.mvp.trim()) {
    return true;
  }

  return usefulAnswerCount >= 4;
}

export function applyUserMessage(
  answers: PlanningAnswers,
  message: string,
  currentQuestion: NaruaQuestion | null
) {
  const nextAnswers = { ...answers };
  const value = message.trim();

  if (!value) {
    return nextAnswers;
  }

  if (!nextAnswers.idea.trim()) {
    nextAnswers.idea = value;
    nextAnswers.projectType = inferProjectType(value);
    return nextAnswers;
  }

  if (currentQuestion) {
    nextAnswers[currentQuestion.field] = value;
  }

  return nextAnswers;
}

function createDefaultTeammateSet(): TeammateRecommendation[] {
  return [
    {
      id: "narua",
      name: "Naroa",
      provider: "chatgpt",
      role: "Core orchestrator / execution layer",
      status: "active",
      reason: "Naroa drives intake, planning, synthesis, routing, and execution guidance across the product."
    },
    {
      id: "atlas",
      name: "Atlas",
      provider: "claude",
      role: "Research / long-form reasoning",
      status: "standby",
      reason: "Atlas stays on standby until deeper reasoning or long-context analysis will improve execution."
    },
    {
      id: "forge",
      name: "Forge",
      provider: "codex",
      role: "Engineering / build",
      status: "standby",
      reason: "Forge stays on standby until product, site, automation, or implementation work is ready."
    },
    {
      id: "repolink",
      name: "RepoLink",
      provider: "github",
      role: "Repository / source context",
      status: "standby",
      reason: "RepoLink stays on standby until source or software systems context becomes relevant."
    }
  ];
}

export function getDefaultTeammates() {
  return createDefaultTeammateSet();
}

function buildRecommendedModules(primaryLaneId: LaneId, supportingLaneIds: LaneId[]) {
  const moduleIds = [
    ...getLaneById(primaryLaneId).defaultModules,
    ...supportingLaneIds.flatMap((laneId) => getLaneById(laneId).defaultModules.slice(0, 2))
  ];

  return Array.from(new Set(moduleIds)).slice(0, 10);
}

function buildRecommendedStack(primaryLaneId: LaneId, supportingLaneIds: LaneId[], answers: PlanningAnswers) {
  const stack = ["Naroa Workspace", "Naroa Execution Layer"];

  if (primaryLaneId === "website") {
    stack.push("Marketing site structure", "Copy and page system");
  }

  if (primaryLaneId === "saas-app" || supportingLaneIds.includes("saas-app")) {
    stack.push("Next.js App Router", "TypeScript", "Supabase");
  }

  if (primaryLaneId === "operations" || supportingLaneIds.includes("operations")) {
    stack.push("SOP docs", "Workflow mapping", "Automation layer");
  }

  if (answers.integrations.toLowerCase().includes("github")) {
    stack.push("GitHub context");
  }

  if (answers.integrations.toLowerCase().includes("erp")) {
    stack.push("ERP connector");
  }

  return Array.from(new Set(stack));
}

function buildPhases(primaryLaneId: LaneId, supportingLaneIds: LaneId[], answers: PlanningAnswers) {
  const primaryLane = getLaneById(primaryLaneId);
  const supportingLaneNames = supportingLaneIds.map((laneId) => getLaneById(laneId).name);

  return [
    {
      title: "Foundation",
      summary: `Clarify the ${primaryLane.name.toLowerCase()} direction and lock the first execution target.`,
      items: [
        `Turn the idea into a sharper ${answers.projectType.toLowerCase()} direction.`,
        `Define the target user around ${answers.targetUser || "the clearest customer segment"}.`,
        `Use Naroa to tighten the goal: ${answers.mainGoal || "create a measurable first outcome"}.`
      ]
    },
    {
      title: "First Build Scope",
      summary: "Translate the concept into the smallest deliverable first version.",
      items: [
        `Scope the MVP around ${answers.mvp || "one focused first workflow"}.`,
        `Sequence the default ${primaryLane.layoutType} modules into a working plan.`,
        supportingLaneNames.length > 0
          ? `Use supporting lanes for ${supportingLaneNames.join(", ")} where they directly move the first release forward.`
          : "Keep the workspace narrow so version one stays practical."
      ]
    },
    {
      title: "Execution",
      summary: "Move from planning into real work with a visible execution path.",
      items: [
        "Break the work into roadmap checkpoints and concrete tasks.",
        "Activate only the AI teammates that match the next phase of work.",
        "Carry the plan into the workspace and start executing lane by lane."
      ]
    }
  ];
}

function buildTeammates(primaryLaneId: LaneId, supportingLaneIds: LaneId[], answers: PlanningAnswers) {
  const teammates = createDefaultTeammateSet();
  const shouldActivateAtlas =
    primaryLaneId === "business" ||
    primaryLaneId === "marketing" ||
    primaryLaneId === "crypto" ||
    answers.mainGoal.length > 48;
  const shouldActivateForge =
    primaryLaneId === "saas-app" ||
    primaryLaneId === "website" ||
    primaryLaneId === "automation-ai-systems" ||
    supportingLaneIds.includes("saas-app") ||
    supportingLaneIds.includes("website");
  const shouldActivateRepo =
    answers.integrations.toLowerCase().includes("github") ||
    primaryLaneId === "saas-app" ||
    primaryLaneId === "website" ||
    primaryLaneId === "operations";

  return teammates.map((teammate) => {
    if (teammate.id === "atlas" && shouldActivateAtlas) {
      return {
        ...teammate,
        status: "recommended" as const,
        reason: "Naroa recommends Atlas for deeper reasoning, research, and long-context analysis."
      };
    }

    if (teammate.id === "forge" && shouldActivateForge) {
      return {
        ...teammate,
        status: "recommended" as const,
        reason: "Naroa recommends Forge when the plan needs product, site, automation, or implementation help."
      };
    }

    if (teammate.id === "repolink" && shouldActivateRepo) {
      return {
        ...teammate,
        status: "recommended" as const,
        reason: "Naroa recommends RepoLink when repository or systems context will affect execution."
      };
    }

    return teammate;
  });
}

function buildNextSteps(primaryLaneId: LaneId, supportingLaneIds: LaneId[], answers: PlanningAnswers) {
  const primaryLane = getLaneById(primaryLaneId);
  const nextSteps = [
    `Lock the first ${primaryLane.name.toLowerCase()} decision that changes execution speed.`,
    `Reduce the MVP to the smallest useful version of ${answers.mvp || "the core workflow"}.`,
    "Turn the plan into task groups and milestone checkpoints."
  ];

  if (supportingLaneIds.includes("website")) {
    nextSteps.push("Draft the initial site or landing structure alongside the plan.");
  }

  if (supportingLaneIds.includes("operations")) {
    nextSteps.push("Map the first workflows and operating constraints before launch.");
  }

  return nextSteps;
}

export function generatePlan(answers: PlanningAnswers): GeneratedPlan {
  const laneSelection = inferLaneSelection(
    [
      answers.idea,
      answers.projectType,
      answers.targetUser,
      answers.mainGoal,
      answers.mvp,
      answers.integrations
    ].join("\n")
  );
  const primaryLane = getLaneById(laneSelection.primaryLaneId);
  const supportingLaneIds = laneSelection.supportingLaneIds.filter(
    (laneId) => laneId !== laneSelection.primaryLaneId
  );
  const supportingLanes = supportingLaneIds.map((laneId) => getLaneById(laneId));
  const projectTemplateId = inferProjectTemplate({
    name: answers.idea || buildWorkspaceName(answers.idea),
    description: [
      answers.projectType,
      answers.targetUser,
      answers.mainGoal,
      answers.mvp,
      answers.integrations
    ]
      .filter(Boolean)
      .join("\n"),
    primaryLaneId: laneSelection.primaryLaneId
  });

  return {
    title: buildWorkspaceName(answers.idea),
    projectTemplateId,
    overview: `${answers.idea} Naroa is framing this as a ${primaryLane.name.toLowerCase()} workspace with the right supporting lanes to carry the idea into execution.`,
    projectSummary: `${answers.projectType || "Initiative"} for ${answers.targetUser || "a defined user"} focused on ${answers.mainGoal || "a concrete business or product outcome"}.`,
    targetUser: answers.targetUser || "Target user still needs refinement.",
    mainGoal: answers.mainGoal || "Primary outcome still needs refinement.",
    mvpScope:
      splitList(answers.mvp).length > 0
        ? splitList(answers.mvp)
        : ["Define the first user workflow.", "Ship the smallest useful version."],
    primaryLaneId: laneSelection.primaryLaneId,
    supportingLaneIds,
    recommendedModules: buildRecommendedModules(laneSelection.primaryLaneId, supportingLaneIds),
    recommendedStack: buildRecommendedStack(laneSelection.primaryLaneId, supportingLaneIds, answers),
    phases: buildPhases(laneSelection.primaryLaneId, supportingLaneIds, answers),
    teammates: buildTeammates(laneSelection.primaryLaneId, supportingLaneIds, answers),
    nextSteps: buildNextSteps(laneSelection.primaryLaneId, supportingLaneIds, answers),
    expandedSection: null,
    tasks: [],
    refinementNotes: supportingLanes.length > 0
      ? [`Naroa assigned supporting lanes: ${supportingLanes.map((lane) => lane.name).join(", ")}.`]
      : []
  };
}

export function createSynthesisMessage(plan: GeneratedPlan) {
  const primaryLane = getLaneById(plan.primaryLaneId);
  const supportingText =
    plan.supportingLaneIds.length > 0
      ? ` with supporting lanes for ${plan.supportingLaneIds.map((laneId) => getLaneById(laneId).name).join(", ")}`
      : "";

  return `Perfect. Naroa has enough context to draft this as a ${primaryLane.name} workspace${supportingText}. Review the plan below, then refine it or open the workspace.`;
}

export function applyReviewAction(
  action: ReviewAction,
  plan: GeneratedPlan,
  answers: PlanningAnswers
) {
  if (action === "refine") {
    const refinedPlan: GeneratedPlan = {
      ...plan,
      nextSteps: [
        "Tighten the positioning into one clear sentence before building anything broad.",
        ...plan.nextSteps
      ],
      refinementNotes: [
        ...plan.refinementNotes,
        "Naroa refined the plan by tightening the positioning, narrowing the MVP, and sharpening the execution path."
      ]
    };

    return {
      plan: refinedPlan,
      reply: "Naroa refined the plan by tightening the positioning and making the first phase more execution-focused."
    };
  }

  if (action === "expand") {
    const primaryLane = getLaneById(plan.primaryLaneId);

    return {
      plan: {
        ...plan,
        expandedSection: {
          title: `${primaryLane.name} execution notes`,
          paragraphs: [
            `Keep the first release centered on ${answers.mvp || plan.mvpScope[0]}.`,
            `Use the ${primaryLane.name} lane as the lead context, then pull in supporting lanes only when they directly unblock delivery.`,
            "Anything that does not help validation, launch readiness, or operational clarity should stay out of version one."
          ]
        }
      },
      reply: "Naroa expanded the plan so the first execution phase is more concrete."
    };
  }

  if (action === "tasks") {
    return {
      plan: {
        ...plan,
        tasks: [
          "Write the one-sentence positioning statement.",
          "List the MVP steps in the order a real user would experience them.",
          "Turn the roadmap phases into owners and deadlines.",
          "Identify the first integration or system dependency.",
          "Start the workspace and activate only the next-needed teammate."
        ]
      },
      reply: "Naroa turned the plan into an initial task sequence so execution can move faster."
    };
  }

  const supportingLaneIds = Array.from(
    new Set(
      plan.primaryLaneId === "saas-app"
        ? plan.supportingLaneIds
        : [...plan.supportingLaneIds, "saas-app" as LaneId]
    )
  );

  return {
    plan: {
      ...plan,
      supportingLaneIds,
      refinementNotes: [
        ...plan.refinementNotes,
        "Naroa reframed the plan toward an app build path and added SaaS / App support."
      ]
    },
    reply: "Naroa adjusted the plan so it can move more directly into an app build workflow."
  };
}

export function getPlanModuleDefinitions(plan: GeneratedPlan) {
  return getModuleDefinitions(plan.recommendedModules);
}

export function createEngineWelcomeMessage(context: NaruaEngineContext) {
  return `Naroa is ready to generate the first ${context.engineTitle.toLowerCase()} output inside ${context.workspaceName}. ${context.engineDescription} will stay centered in this lane so the next deliverable is clear.`;
}

export function createEngineReply(context: NaruaEngineContext, message: string) {
  const recommendedStack = context.recommendedAIStack.slice(0, 3).join(", ");

  return [
    `Naroa is keeping the ${context.engineTitle} lane focused on ${context.engineDescription.toLowerCase()}.`,
    `Based on "${message.trim()}", the next move is to tighten the outcome, identify the immediate blocker, and sequence the next deliverable inside this lane thread only.`,
    recommendedStack
      ? `Recommended stack in this lane: ${recommendedStack}.`
      : "Recommended stack will sharpen as the lane context grows."
  ].join(" ");
}

export function createWorkspaceWelcomeMessage(context: NaruaWorkspaceContext) {
  const supportingText =
    context.supportingLaneNames.length > 0
      ? ` Supporting lanes currently include ${context.supportingLaneNames.join(", ")}.`
      : "";

  return `Naroa has ${context.primaryLaneName} leading inside ${context.workspaceName}.${supportingText}`;
}

export function createWorkspaceReply(context: NaruaWorkspaceContext, message: string) {
  const supportingText =
    context.supportingLaneNames.length > 0
      ? ` If this needs adjacent context, I can pull from ${context.supportingLaneNames.join(", ")} without widening the whole workspace.`
      : " I’ll keep this workspace narrow until a second lane is truly needed.";

  return [
    `Naroa is treating ${context.primaryLaneName} as the lead operating context in ${context.workspaceName}.`,
    `Based on "${message.trim()}", the next move is to tighten the immediate outcome, choose the next concrete deliverable, and keep the work anchored to the active lane.`,
    supportingText
  ].join(" ");
}
