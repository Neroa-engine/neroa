import { getLaneById } from "@/lib/workspace/lanes";
import type { LaneId } from "@/lib/workspace/types";

export type WorkspaceIntakeField =
  | "idea"
  | "businessType"
  | "targetCustomer"
  | "services"
  | "operationSize"
  | "startupBudget"
  | "timeline"
  | "geographicFocus"
  | "websiteNeeds";

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
  startupBudget: string;
  timeline: string;
  geographicFocus: string;
  websiteNeeds: string;
};

export type WorkspaceGeneratedSections = {
  overview: string[];
  businessStrategy: string[];
  businessPlan: string[];
  websiteDomainSetup: string[];
  offer: string[];
  roadmap: string[];
  budgetModel: string[];
  executionSteps: string[];
};

type WorkspaceIntakeProfile = {
  intro: string;
  helperText: string;
  questionFields: WorkspaceIntakeField[];
};

const businessWorkspaceProfile: WorkspaceIntakeProfile = {
  intro:
    "Naroa is active in this Business NeuroEngine. Give me the business idea first and I will run a guided intake before I build the execution plan.",
  helperText:
    "Start intake with Naroa. Tap the mic and speak naturally, then press Send when you are ready.",
  questionFields: [
    "businessType",
    "targetCustomer",
    "services",
    "operationSize",
    "startupBudget",
    "timeline",
    "geographicFocus",
    "websiteNeeds"
  ]
};

const genericWorkspaceProfile: WorkspaceIntakeProfile = {
  intro:
    "Naroa is active in this NeuroEngine. Start with the core idea and I will gather the minimum context needed before I shape the execution plan.",
  helperText:
    "Start intake with Naroa. Tap the mic and speak naturally, then press Send when you are ready.",
  questionFields: [
    "businessType",
    "targetCustomer",
    "services",
    "timeline",
    "geographicFocus",
    "websiteNeeds"
  ]
};

function splitList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function firstSentence(value: string) {
  return value.trim().replace(/[.!?]+$/, "");
}

function buildBusinessTypePrompt(idea: string) {
  const normalized = idea.toLowerCase();

  if (normalized.includes("screen print")) {
    return "What type of screen print company do you want to build?";
  }

  if (normalized.includes("agency")) {
    return "What type of agency do you want to build?";
  }

  if (normalized.includes("service")) {
    return "What kind of service business is this?";
  }

  return "What type of business do you want to build?";
}

function buildPrompt(
  laneId: LaneId,
  field: WorkspaceIntakeField,
  answers: WorkspaceIntakeAnswers
) {
  if (laneId === "business") {
    switch (field) {
      case "businessType":
        return buildBusinessTypePrompt(answers.idea);
      case "targetCustomer":
        return "Who is the target customer you want to serve first?";
      case "services":
        return "What services will you offer in the first version of the business?";
      case "operationSize":
        return "What size operation are you planning at launch?";
      case "startupBudget":
        return "What startup budget are you working with?";
      case "timeline":
        return "What timeline are you trying to hit for launch?";
      case "geographicFocus":
        return "What geographic market do you want to serve first?";
      case "websiteNeeds":
        return "Do you need Naroa to include website, domain, and brand setup in the plan?";
      case "idea":
        return "Tell me the business idea first.";
    }
  }

  switch (field) {
    case "businessType":
      return "What type of project, business, or system is this?";
    case "targetCustomer":
      return "Who is this for first?";
    case "services":
      return "What should the first offer or first release actually do?";
    case "operationSize":
      return "What size should the first operating scope be?";
    case "startupBudget":
      return "What budget does Naroa need to plan around?";
    case "timeline":
      return "What timeline should Naroa plan around?";
    case "geographicFocus":
      return "What market, territory, or user segment matters first?";
    case "websiteNeeds":
      return "Should Naroa include website, domain, or brand setup in the plan?";
    case "idea":
      return "Tell me the core idea first.";
  }
}

export function createWorkspaceIntakeAnswers(): WorkspaceIntakeAnswers {
  return {
    idea: "",
    businessType: "",
    targetCustomer: "",
    services: "",
    operationSize: "",
    startupBudget: "",
    timeline: "",
    geographicFocus: "",
    websiteNeeds: ""
  };
}

export function getWorkspaceIntakeProfile(laneId: LaneId) {
  return laneId === "business" ? businessWorkspaceProfile : genericWorkspaceProfile;
}

export function getWorkspaceIntakeQuestionByField(
  laneId: LaneId,
  field: WorkspaceIntakeField,
  answers: WorkspaceIntakeAnswers
): WorkspaceIntakeQuestion {
  return {
    field,
    prompt: buildPrompt(laneId, field, answers)
  };
}

export function createWorkspaceIntakeWelcome(
  laneId: LaneId,
  workspaceName: string,
  workspaceDescription?: string | null
) {
  const profile = getWorkspaceIntakeProfile(laneId);
  const lane = getLaneById(laneId);
  const descriptionText = workspaceDescription
    ? ` ${workspaceDescription}`
    : ` ${lane.name} is the lead execution engine in this workspace.`;

  return `${profile.intro}${descriptionText} Workspace: ${workspaceName}.`;
}

export function applyWorkspaceIntakeMessage(
  laneId: LaneId,
  answers: WorkspaceIntakeAnswers,
  message: string,
  currentQuestion: WorkspaceIntakeQuestion | null
) {
  const nextAnswers = { ...answers };
  const value = message.trim();

  if (!value) {
    return nextAnswers;
  }

  if (!nextAnswers.idea.trim()) {
    nextAnswers.idea = value;
    return nextAnswers;
  }

  if (currentQuestion) {
    nextAnswers[currentQuestion.field] = value;
    return nextAnswers;
  }

  const nextQuestion = getNextWorkspaceIntakeQuestion(laneId, nextAnswers);

  if (nextQuestion) {
    nextAnswers[nextQuestion.field] = value;
  }

  return nextAnswers;
}

export function getNextWorkspaceIntakeQuestion(
  laneId: LaneId,
  answers: WorkspaceIntakeAnswers
) {
  const profile = getWorkspaceIntakeProfile(laneId);

  for (const field of profile.questionFields) {
    if (!answers[field].trim()) {
      return getWorkspaceIntakeQuestionByField(laneId, field, answers);
    }
  }

  return null;
}

export function hasWorkspaceIntakeEnoughContext(
  laneId: LaneId,
  answers: WorkspaceIntakeAnswers
) {
  if (!answers.idea.trim()) {
    return false;
  }

  return getWorkspaceIntakeProfile(laneId).questionFields.every(
    (field) => answers[field].trim().length > 0
  );
}

function createWebsiteSetupSection(answers: WorkspaceIntakeAnswers) {
  const normalized = answers.websiteNeeds.toLowerCase();
  const websiteNeeded =
    !normalized || normalized.includes("yes") || normalized.includes("need") || normalized.includes("build");

  if (!websiteNeeded && normalized.includes("already")) {
    return [
      "Audit the current website, domain, and brand setup before rebuilding anything.",
      "Tighten the offer and customer path so the existing site can convert better.",
      "Only rebuild the site if the current structure cannot support the launch offer."
    ];
  }

  if (!websiteNeeded && normalized.includes("no")) {
    return [
      "Website and domain setup are not part of the first launch scope yet.",
      "Keep the digital footprint minimal until the offer and operating model are validated.",
      "Revisit site and brand work after the first customer motion is clearer."
    ];
  }

  return [
    "Choose the brand direction, working name, and domain path that best match the offer.",
    "Launch a simple website with an offer page, service breakdown, proof points, and a quote or contact path.",
    "Use the website to support trust, explain the workflow, and capture the first inbound demand."
  ];
}

export function createWorkspaceGeneratedSections(
  laneId: LaneId,
  answers: WorkspaceIntakeAnswers
): WorkspaceGeneratedSections {
  const lane = getLaneById(laneId);
  const services = splitList(answers.services);
  const offerLines =
    services.length > 0
      ? services
      : ["Core production service", "Rush turnaround option", "Customer coordination workflow"];
  const businessType = firstSentence(answers.businessType || lane.name.toLowerCase());
  const targetCustomer = firstSentence(answers.targetCustomer || "a clear first customer segment");
  const operationSize = firstSentence(answers.operationSize || "a controlled, execution-first launch");
  const startupBudget = firstSentence(answers.startupBudget || "a conservative first-launch budget");
  const timeline = firstSentence(answers.timeline || "a practical first-launch timeline");
  const geographicFocus = firstSentence(answers.geographicFocus || "the most reachable first market");

  return {
    overview: [
      `${answers.idea} is being structured as a ${businessType}.`,
      `The first customer focus is ${targetCustomer}.`,
      `Naroa is keeping Business as the lead engine while Website, Marketing, and Operations support execution.`
    ],
    businessStrategy: [
      `Start with a narrow market: ${targetCustomer}.`,
      `Use ${offerLines[0]} as the lead offer so the business can launch around one clear sales motion.`,
      `Keep the first operating footprint at ${operationSize} so the business can validate demand before scaling.`,
      `Focus the first launch in ${geographicFocus} and tighten the offer around a realistic go-to-market path.`
    ],
    businessPlan: [
      `Business type: ${businessType}.`,
      `Primary service mix: ${offerLines.join(", ")}.`,
      `Launch scope: ${operationSize}.`,
      `Timeline: ${timeline}.`
    ],
    websiteDomainSetup: createWebsiteSetupSection(answers),
    offer: offerLines.map((item, index) =>
      index === 0 ? `Lead offer: ${item}.` : `Supporting offer: ${item}.`
    ),
    roadmap: [
      "Days 1-30: lock the positioning, service mix, customer target, and pricing direction.",
      "Days 31-60: set up website and domain steps, operating workflow, and the first customer acquisition motion.",
      "Days 61-90: launch outreach, close the first customers, and refine operations from live feedback."
    ],
    budgetModel: [
      `Startup budget target: ${startupBudget}.`,
      "Separate essential launch costs from optional scale-up costs so the first 90 days stay disciplined.",
      "Reserve budget for operations, website/domain setup, and customer acquisition before non-essential expansion."
    ],
    executionSteps: [
      `Write the one-sentence positioning statement for ${answers.idea}.`,
      `Turn ${offerLines[0]} into the first sellable offer with a simple pricing and delivery workflow.`,
      "Set the first 90-day task sequence across Business, Website, Marketing, and Operations."
    ]
  };
}

export function createWorkspaceIntakeSynthesisMessage(
  laneId: LaneId,
  answers: WorkspaceIntakeAnswers
) {
  const lane = getLaneById(laneId);

  return `Naroa has enough context to draft the ${lane.name.toLowerCase()} execution system for ${answers.idea}. Review the generated strategy, budget, website setup, and roadmap, then refine the next action from there.`;
}
