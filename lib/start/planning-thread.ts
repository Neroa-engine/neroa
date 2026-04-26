import {
  conversationSessionStateSchema,
  type ConversationSessionState
} from "@/lib/intelligence/conversation";
import type { ArchitectureBlueprint } from "@/lib/intelligence/architecture";
import type { GovernancePolicy } from "@/lib/intelligence/governance";
import type { ProjectBrief } from "@/lib/intelligence/project-brief";
import type { RoadmapPlan } from "@/lib/intelligence/roadmap";

export type PlanningLaneId = "diy" | "managed";

export type PlanningMessageRole = "assistant" | "user";

export type PlanningMessage = {
  id: string;
  role: PlanningMessageRole;
  content: string;
  createdAt?: string;
};

export type PlanningThreadMetadata = {
  lane: PlanningLaneId;
  projectTitle: string | null;
  perceivedProject: string | null;
  scopeNotes: string[];
  recommendedNextStep: string;
};

export type PlanningThreadState = {
  threadId: string;
  lane: PlanningLaneId;
  messages: PlanningMessage[];
  metadata: PlanningThreadMetadata;
  conversationState?: ConversationSessionState | null;
  projectBrief?: ProjectBrief | null;
  architectureBlueprint?: ArchitectureBlueprint | null;
  roadmapPlan?: RoadmapPlan | null;
  governancePolicy?: GovernancePolicy | null;
  updatedAt: string;
};

export type PlanningSignalState = {
  userTurnCount: number;
  meaningfulTurnCount: number;
  combinedMeaningfulText: string;
  hasAudience: boolean;
  hasOutcome: boolean;
  hasWorkflow: boolean;
  hasConstraints: boolean;
  shouldStructureReply: boolean;
  shouldRevealSummary: boolean;
  shouldDeriveTitle: boolean;
};

const PLANNING_RESET_COMMAND_PATTERN =
  /^\s*(?:start over|start over please|clear this|clear this chat|clear chat|clear thread|reset|reset this|reset this chat|reset this thread|delete that|delete this|wipe this|wipe this chat)\s*[.!?]*\s*$/i;
const CASUAL_KICKOFF_PATTERN =
  /^(?:hi|hello|hey|yo|sup|thanks|thank you|cool|nice|okay|ok|sounds good|how are you|what's up|good morning|good afternoon|good evening|i have an idea|i've got an idea|i got an idea|can you help me|could you help me|hmm|hmmm|test)\b/i;
const PRODUCT_SIGNAL_PATTERN =
  /\b(?:build|app|saas|platform|dashboard|portal|tool|product|system|workflow|automation|crm|marketplace|member|client|admin|project|site|website)\b/i;
const AUDIENCE_SIGNAL_PATTERN =
  /\b(?:for|user|customer|client|admin|team|staff|member|operator|manager|buyer|seller|agency|freelancer|creator|patient|student)\b/i;
const OUTCOME_SIGNAL_PATTERN =
  /\b(?:need|want|goal|outcome|deliver|launch|ship|improve|reduce|save|increase|track|manage|book|sell|schedule|coordinate|automate|replace)\b/i;
const WORKFLOW_SIGNAL_PATTERN =
  /\b(?:onboarding|dashboard|portal|checkout|booking|payment|billing|approval|reporting|sync|upload|search|messaging|workflow|login|auth|crm|subscription|analytics)\b/i;
const CONSTRAINT_SIGNAL_PATTERN =
  /\b(?:budget|timeline|deadline|constraint|integration|migration|compliance|permission|auth|technical|ops|staffing|handoff|launch risk)\b/i;

function cleanPlanningText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePlanningText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseConversationState(value: unknown) {
  const result = conversationSessionStateSchema.safeParse(value);
  return result.success ? result.data : null;
}

function sanitizePlanningMessages(messages: unknown) {
  if (!Array.isArray(messages)) {
    return [] as PlanningMessage[];
  }

  const sanitizedMessages: PlanningMessage[] = [];

  for (const message of messages) {
    if (!message || typeof message !== "object") {
      continue;
    }

    const record = message as Record<string, unknown>;
    const role = record.role;
    const content = cleanPlanningText(
      typeof record.content === "string" ? record.content : null
    );

    if ((role !== "assistant" && role !== "user") || !content) {
      continue;
    }

    const sanitizedMessage: PlanningMessage = {
      id:
        cleanPlanningText(typeof record.id === "string" ? record.id : null) ||
        `${role}-${Math.random().toString(36).slice(2, 10)}`,
      role,
      content
    };

    const createdAt = cleanPlanningText(
      typeof record.createdAt === "string" ? record.createdAt : null
    );

    if (createdAt) {
      sanitizedMessage.createdAt = createdAt;
    }

    sanitizedMessages.push(sanitizedMessage);
  }

  return sanitizedMessages.slice(-20);
}

function parsePlanningMetadata(
  value: unknown,
  lane: PlanningLaneId
): PlanningThreadMetadata | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const scopeNotes = Array.isArray(record.scopeNotes)
    ? record.scopeNotes
        .filter((note): note is string => typeof note === "string" && note.trim().length > 0)
        .map((note) => normalizePlanningText(note))
        .slice(0, 6)
    : [];
  const recommendedNextStep = cleanPlanningText(
    typeof record.recommendedNextStep === "string" ? record.recommendedNextStep : null
  );

  if (!recommendedNextStep) {
    return null;
  }

  return {
    lane,
    projectTitle: cleanPlanningText(
      typeof record.projectTitle === "string" ? record.projectTitle : null
    ) || null,
    perceivedProject: cleanPlanningText(
      typeof record.perceivedProject === "string" ? record.perceivedProject : null
    ) || null,
    scopeNotes,
    recommendedNextStep
  };
}

function parsePlanningTimestamp(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function cleanPlanningValue(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeKeySegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildSeedSignature(title?: string, summary?: string) {
  const seed = `${title?.trim() ?? ""}|${summary?.trim() ?? ""}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647;
  }

  return hash.toString(36);
}

export function buildPlanningThreadStorageKey(args: {
  userEmail?: string;
  lane: PlanningLaneId;
  title?: string;
  summary?: string;
}) {
  const identity = normalizeKeySegment(args.userEmail ?? "anonymous") || "anonymous";
  const seedSignature = buildSeedSignature(args.title, args.summary);
  return `neroa:start-thread:${identity}:${args.lane}:${seedSignature}`;
}

export function loadPlanningThreadState(value: unknown): PlanningThreadState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const lane = record.lane === "managed" ? "managed" : record.lane === "diy" ? "diy" : null;
  const threadId = cleanPlanningText(
    typeof record.threadId === "string" ? record.threadId : null
  );
  const updatedAt = cleanPlanningText(
    typeof record.updatedAt === "string" ? record.updatedAt : null
  );

  if (!lane || !threadId || !updatedAt) {
    return null;
  }

  const messages = sanitizePlanningMessages(record.messages);
  const metadata = parsePlanningMetadata(record.metadata, lane);

  if (messages.length === 0 || !metadata) {
    return null;
  }

  return {
    threadId,
    lane,
    messages,
    metadata,
    conversationState: parseConversationState(record.conversationState),
    updatedAt
  };
}

export function createPersistedPlanningThreadState(
  threadState: PlanningThreadState
): PlanningThreadState {
  const normalizedMessages = sanitizePlanningMessages(threadState.messages);
  const metadata = parsePlanningMetadata(threadState.metadata, threadState.lane);

  if (normalizedMessages.length === 0 || !metadata) {
    throw new Error("Cannot persist an empty planning thread.");
  }

  return {
    threadId: cleanPlanningText(threadState.threadId),
    lane: threadState.lane,
    messages: normalizedMessages,
    metadata,
    conversationState: threadState.conversationState ?? null,
    updatedAt: cleanPlanningText(threadState.updatedAt) || new Date().toISOString()
  };
}

export function hasPlanningThreadHistory(value: PlanningThreadState | null | undefined) {
  if (!value) {
    return false;
  }

  return value.messages.some(
    (message) => message.id !== "assistant-intro" && cleanPlanningText(message.content).length > 0
  );
}

export function hasMeaningfulPlanningConversationState(
  value: ConversationSessionState | null | undefined
) {
  if (!value) {
    return false;
  }

  return Boolean(
    value.founderName ||
      value.productCategory ||
      value.problemStatement ||
      value.outcomePromise ||
      value.monetization ||
      value.audience.buyerPersonas.length > 0 ||
      value.audience.operatorPersonas.length > 0 ||
      value.questionHistory.length > 0 ||
      value.processedUserTurnIds.length > 0
  );
}

export function choosePreferredPlanningThreadState(args: {
  persistedThreadState?: PlanningThreadState | null;
  localThreadState?: PlanningThreadState | null;
}) {
  const persisted = args.persistedThreadState ?? null;
  const local = args.localThreadState ?? null;

  if (!local) {
    return persisted;
  }

  if (!persisted) {
    return local;
  }

  return parsePlanningTimestamp(local.updatedAt) >= parsePlanningTimestamp(persisted.updatedAt)
    ? local
    : persisted;
}

export function buildProjectResumePlanningThread(args: {
  threadId: string;
  lane: PlanningLaneId;
  projectTitle: string;
  projectSummary?: string | null;
  currentFocus?: string | null;
  blockers?: readonly string[];
  nextStep?: string | null;
  conversationState?: ConversationSessionState | null;
}) {
  const now = new Date().toISOString();
  const summary =
    cleanPlanningText(args.projectSummary) || `Continue planning ${args.projectTitle}.`;
  const blockerText =
    args.blockers && args.blockers.length > 0
      ? args.blockers.slice(0, 2).join(" ")
      : "No blocking approval items are open right now.";
  const assistantMessage = [
    `We're resuming ${args.projectTitle}.`,
    args.currentFocus ? `Current focus: ${args.currentFocus}.` : null,
    `Open blockers: ${blockerText}`,
    args.nextStep ? `Next move: ${args.nextStep}` : null
  ]
    .filter(Boolean)
    .join(" ");

  return {
    threadId: cleanPlanningText(args.threadId) || `project-thread-${Date.now()}`,
    lane: args.lane,
    messages: [
      buildPlanningIntroMessage(args.lane),
      {
        id: "project-resume-summary",
        role: "user",
        content: summary,
        createdAt: now
      },
      {
        id: "project-resume-assistant",
        role: "assistant",
        content: assistantMessage,
        createdAt: now
      }
    ],
    metadata: {
      lane: args.lane,
      projectTitle: cleanPlanningText(args.projectTitle) || null,
      perceivedProject: summary,
      scopeNotes: [summary].filter(Boolean),
      recommendedNextStep:
        cleanPlanningText(args.nextStep) ||
        "Keep tightening the scope and approval blockers in this room."
    },
    conversationState: args.conversationState ?? null,
    updatedAt: now
  } satisfies PlanningThreadState;
}

export function hasSavedProjectPlanningState(args: {
  planningThreadState?: PlanningThreadState | null;
  conversationState?: ConversationSessionState | null;
  hasStrategyOverrides?: boolean;
  hasRevisionHistory?: boolean;
  hasSavedPlanningArtifacts?: boolean;
  projectSummary?: string | null;
}) {
  return Boolean(
    hasPlanningThreadHistory(args.planningThreadState ?? null) ||
      hasMeaningfulPlanningConversationState(args.conversationState ?? null) ||
      args.hasStrategyOverrides ||
      args.hasRevisionHistory ||
      args.hasSavedPlanningArtifacts ||
      cleanPlanningText(args.projectSummary).length > 0
  );
}

export function buildStrategyRoomInitialThreadState(args: {
  lane: PlanningLaneId;
  planningThreadState?: PlanningThreadState | null;
  conversationState?: ConversationSessionState | null;
  hasStrategyOverrides?: boolean;
  hasRevisionHistory?: boolean;
  hasSavedPlanningArtifacts?: boolean;
  projectTitle: string;
  projectSummary?: string | null;
  currentFocus?: string | null;
  blockers?: readonly string[];
  nextStep?: string | null;
  fallbackThreadId?: string | null;
}) {
  if (hasPlanningThreadHistory(args.planningThreadState ?? null)) {
    return args.planningThreadState ?? null;
  }

  if (
    !hasSavedProjectPlanningState({
      planningThreadState: args.planningThreadState,
      conversationState: args.conversationState,
      hasStrategyOverrides: args.hasStrategyOverrides,
      hasRevisionHistory: args.hasRevisionHistory,
      hasSavedPlanningArtifacts: args.hasSavedPlanningArtifacts,
      projectSummary: args.projectSummary
    })
  ) {
    return null;
  }

  return buildProjectResumePlanningThread({
    threadId:
      cleanPlanningText(args.fallbackThreadId) ||
      args.planningThreadState?.threadId ||
      `project-thread-${Date.now()}`,
    lane: args.lane,
    projectTitle: args.projectTitle,
    projectSummary: args.projectSummary,
    currentFocus: args.currentFocus,
    blockers: args.blockers,
    nextStep: args.nextStep,
    conversationState: args.conversationState ?? args.planningThreadState?.conversationState ?? null
  });
}

export function isPlanningResetCommand(value?: string | null) {
  const cleanValue = cleanPlanningValue(value);
  return cleanValue ? PLANNING_RESET_COMMAND_PATTERN.test(cleanValue) : false;
}

export function isWeakPlanningInput(value?: string | null) {
  const cleanValue = cleanPlanningValue(value);

  if (!cleanValue) {
    return true;
  }

  if (isPlanningResetCommand(cleanValue)) {
    return false;
  }

  const wordCount = cleanValue.split(/\s+/).length;
  const hasProductSignal = PRODUCT_SIGNAL_PATTERN.test(cleanValue) || WORKFLOW_SIGNAL_PATTERN.test(cleanValue);
  const hasAudience = AUDIENCE_SIGNAL_PATTERN.test(cleanValue);
  const hasOutcome = OUTCOME_SIGNAL_PATTERN.test(cleanValue);

  if (CASUAL_KICKOFF_PATTERN.test(cleanValue) && wordCount <= 8) {
    return true;
  }

  if (wordCount <= 3 && !hasProductSignal && !hasAudience && !hasOutcome) {
    return true;
  }

  if (cleanValue.length < 24 && !hasProductSignal && !hasAudience && !hasOutcome) {
    return true;
  }

  if (
    /^(?:i'?m|i am|thinking|thinking about|maybe|possibly|kind of|sort of|just|hmm|hmmm)\b/i.test(cleanValue) &&
    cleanValue.length < 60 &&
    !(hasProductSignal && (hasAudience || hasOutcome))
  ) {
    return true;
  }

  return false;
}

export function analyzePlanningInputs(values: string[]): PlanningSignalState {
  const userInputs = values.map((value) => cleanPlanningValue(value)).filter(Boolean);
  const meaningfulInputs = userInputs.filter((value) => !isWeakPlanningInput(value));
  const combinedMeaningfulText = meaningfulInputs.join(" \n ");
  const hasAudience = AUDIENCE_SIGNAL_PATTERN.test(combinedMeaningfulText);
  const hasOutcome = OUTCOME_SIGNAL_PATTERN.test(combinedMeaningfulText);
  const hasWorkflow =
    PRODUCT_SIGNAL_PATTERN.test(combinedMeaningfulText) ||
    WORKFLOW_SIGNAL_PATTERN.test(combinedMeaningfulText);
  const hasConstraints = CONSTRAINT_SIGNAL_PATTERN.test(combinedMeaningfulText);
  const totalMeaningfulLength = combinedMeaningfulText.length;
  const shouldStructureReply =
    meaningfulInputs.length >= 4 ||
    (meaningfulInputs.length >= 3 &&
      totalMeaningfulLength >= 220 &&
      hasWorkflow &&
      hasAudience &&
      (hasOutcome || hasConstraints));
  const shouldRevealSummary =
    meaningfulInputs.length >= 3 ||
    (meaningfulInputs.length >= 2 &&
      totalMeaningfulLength >= 180 &&
      hasWorkflow &&
      (hasAudience || hasOutcome));
  const shouldDeriveTitle =
    meaningfulInputs.length >= 3 ||
    (meaningfulInputs.length >= 2 &&
      totalMeaningfulLength >= 180 &&
      (hasWorkflow && hasAudience || (hasWorkflow && hasOutcome)));

  return {
    userTurnCount: userInputs.length,
    meaningfulTurnCount: meaningfulInputs.length,
    combinedMeaningfulText,
    hasAudience,
    hasOutcome,
    hasWorkflow,
    hasConstraints,
    shouldStructureReply,
    shouldRevealSummary,
    shouldDeriveTitle
  };
}

export function buildPlanningIntroMessage(lane: PlanningLaneId): PlanningMessage {
  return {
    id: "assistant-intro",
    role: "assistant",
    content: [
      "Neroa is ready.",
      "Open naturally, learn the person's name if they have not shared it yet, and then shape what they want to build.",
      lane === "managed"
        ? "Once there is enough product signal, tighten scope, delivery risk, and launch dependencies."
        : "Once there is enough product signal, tighten scope, the first workflow, and the first release boundary."
    ].join("\n"),
    createdAt: new Date().toISOString()
  };
}

export function buildInitialPlanningMessages(args: {
  lane: PlanningLaneId;
  initialSummary?: string;
}) {
  const messages: PlanningMessage[] = [buildPlanningIntroMessage(args.lane)];
  const summary = args.initialSummary?.trim();

  if (summary) {
    messages.push({
      id: "user-initial-summary",
      role: "user",
      content: summary,
      createdAt: new Date().toISOString()
    });
  }

  return messages;
}
