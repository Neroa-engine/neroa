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

export type PlanningThreadNormalizationOptions = {
  suppressStarterPrompts?: boolean;
  founderNameKnown?: boolean;
  productDirectionKnown?: boolean;
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
const STARTER_NAME_PROMPT_PATTERN = /\bwhat should i call you\b/i;
const STARTER_BUILD_PROMPT_PATTERN = /\bwhat are you thinking about building\b/i;
const STARTER_HELLO_PATTERN = /\b(?:hi|hello|love that|absolutely)\b/i;
const GOOD_TO_MEET_YOU_PATTERN = /\bgood to meet you\b/i;
const STARTER_SYSTEM_INTRO_PATTERN =
  /\bopen naturally, learn the person's name if they have not shared it yet\b/i;
const SYNTHETIC_PLANNING_MESSAGE_IDS = new Set([
  "assistant-intro",
  "user-initial-summary",
  "project-resume-summary",
  "project-resume-assistant"
]);
const PLACEHOLDER_PROJECT_TITLE_PATTERNS = [
  /^untitled(?:\s+project)?$/i,
  /^new\s+project$/i,
  /^project(?:\s+workspace)?$/i,
  /^working\s+title\s+pending$/i,
  /^naming\s+help\s+needed$/i,
  /^intentionally\s+unnamed\s+project$/i
] as const;

function cleanPlanningText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePlanningText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function hasMeaningfulPlanningText(value?: string | null) {
  return cleanPlanningText(value).length > 0;
}

function hasMeaningfulPlanningList(values?: readonly string[] | null) {
  return Boolean(values?.some((value) => hasMeaningfulPlanningText(value)));
}

function messageHasStarterNamePrompt(value?: string | null) {
  return STARTER_NAME_PROMPT_PATTERN.test(cleanPlanningText(value));
}

function messageHasStarterBuildPrompt(value?: string | null) {
  return STARTER_BUILD_PROMPT_PATTERN.test(cleanPlanningText(value));
}

function messageLooksLikeStarterAssistantPrompt(message: PlanningMessage) {
  if (message.role !== "assistant") {
    return false;
  }

  if (message.id === "assistant-intro") {
    return true;
  }

  const content = cleanPlanningText(message.content);

  if (!content) {
    return false;
  }

  if (STARTER_SYSTEM_INTRO_PATTERN.test(content)) {
    return true;
  }

  if (
    messageHasStarterNamePrompt(content) &&
    (/i['’]?m neroa/i.test(content) || /i am neroa/i.test(content) || STARTER_HELLO_PATTERN.test(content))
  ) {
    return true;
  }

  if (messageHasStarterNamePrompt(content)) {
    return true;
  }

  if (messageHasStarterBuildPrompt(content) && GOOD_TO_MEET_YOU_PATTERN.test(content)) {
    return true;
  }

  if (messageHasStarterBuildPrompt(content)) {
    return true;
  }

  return false;
}

function isLikelyPlanningNameOnlyResponse(value?: string | null) {
  const cleanValue = cleanPlanningText(value).replace(/[.!?]+$/g, "").trim();

  if (!cleanValue) {
    return false;
  }

  if (cleanValue.split(/\s+/).length > 4) {
    return false;
  }

  if (/[0-9]/.test(cleanValue)) {
    return false;
  }

  if (
    PRODUCT_SIGNAL_PATTERN.test(cleanValue) ||
    AUDIENCE_SIGNAL_PATTERN.test(cleanValue) ||
    OUTCOME_SIGNAL_PATTERN.test(cleanValue) ||
    WORKFLOW_SIGNAL_PATTERN.test(cleanValue)
  ) {
    return false;
  }

  return /^[a-zA-Z][a-zA-Z .'-]*$/.test(cleanValue);
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

export function hasKnownPlanningFounderName(
  conversationState?: ConversationSessionState | null,
  projectBrief?: ProjectBrief | null
) {
  return Boolean(
    cleanPlanningText(conversationState?.founderName) ||
      cleanPlanningText(projectBrief?.founderName)
  );
}

export function hasKnownPlanningProductDirection(args: {
  conversationState?: ConversationSessionState | null;
  projectBrief?: ProjectBrief | null;
  projectTitle?: string | null;
  projectSummary?: string | null;
  planningThreadState?: PlanningThreadState | null;
}) {
  return Boolean(
    cleanPlanningText(args.projectSummary) ||
      cleanPlanningText(args.planningThreadState?.metadata.perceivedProject) ||
      cleanPlanningText(args.conversationState?.productCategory) ||
      cleanPlanningText(args.conversationState?.problemStatement) ||
      cleanPlanningText(args.conversationState?.outcomePromise) ||
      cleanPlanningText(args.projectBrief?.productCategory) ||
      cleanPlanningText(args.projectBrief?.problemStatement) ||
      cleanPlanningText(args.projectBrief?.outcomePromise) ||
      hasMeaningfulPlanningList(args.projectBrief?.buyerPersonas) ||
      hasMeaningfulPlanningList(args.projectBrief?.operatorPersonas) ||
      hasMeaningfulProjectTitle(args.projectTitle ?? args.projectBrief?.projectName)
  );
}

export function normalizePlanningThreadState(args: {
  threadState?: PlanningThreadState | null;
  options?: PlanningThreadNormalizationOptions;
}): PlanningThreadState | null {
  const threadState = args.threadState ?? null;
  const options = args.options ?? {};

  if (!threadState) {
    return null;
  }

  const normalizedMessages = sanitizePlanningMessages(threadState.messages);

  if (normalizedMessages.length === 0) {
    return null;
  }

  let skipLikelyNameResponse = false;
  const filteredMessages: PlanningMessage[] = [];

  for (const message of normalizedMessages) {
    const content = cleanPlanningText(message.content);
    const suppressSyntheticStarterSummary =
      options.suppressStarterPrompts && message.id === "user-initial-summary";
    const suppressStarterPrompt =
      options.suppressStarterPrompts && messageLooksLikeStarterAssistantPrompt(message);
    const suppressFounderPrompt =
      message.role === "assistant" &&
      options.founderNameKnown &&
      messageHasStarterNamePrompt(content);
    const suppressProductPrompt =
      message.role === "assistant" &&
      options.productDirectionKnown &&
      messageHasStarterBuildPrompt(content);

    if (suppressSyntheticStarterSummary) {
      continue;
    }

    if (suppressStarterPrompt || suppressFounderPrompt || suppressProductPrompt) {
      skipLikelyNameResponse = message.role === "assistant" && messageHasStarterNamePrompt(content);
      continue;
    }

    if (
      skipLikelyNameResponse &&
      message.role === "user" &&
      isLikelyPlanningNameOnlyResponse(content)
    ) {
      skipLikelyNameResponse = false;
      continue;
    }

    skipLikelyNameResponse = false;
    filteredMessages.push(message);
  }

  const finalMessages = sanitizePlanningMessages(filteredMessages);

  if (finalMessages.length === 0) {
    return null;
  }

  return {
    ...threadState,
    messages: finalMessages
  };
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
    (message) =>
      !SYNTHETIC_PLANNING_MESSAGE_IDS.has(message.id) &&
      !messageLooksLikeStarterAssistantPrompt(message) &&
      cleanPlanningText(message.content).length > 0
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

export function hasMeaningfulProjectTitle(value?: string | null) {
  const normalized = normalizePlanningText(cleanPlanningText(value));

  if (!normalized) {
    return false;
  }

  return !PLACEHOLDER_PROJECT_TITLE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function hasMeaningfulProjectBrief(value: ProjectBrief | null | undefined) {
  if (!value) {
    return false;
  }

  return Boolean(
    hasMeaningfulProjectTitle(value.projectName) ||
      hasMeaningfulPlanningText(value.founderName) ||
      hasMeaningfulPlanningText(value.productCategory) ||
      hasMeaningfulPlanningText(value.problemStatement) ||
      hasMeaningfulPlanningText(value.outcomePromise) ||
      hasMeaningfulPlanningList(value.buyerPersonas) ||
      hasMeaningfulPlanningList(value.operatorPersonas) ||
      hasMeaningfulPlanningList(value.endCustomerPersonas) ||
      hasMeaningfulPlanningList(value.adminPersonas)
  );
}

export function hasMeaningfulProjectPlanningState(args: {
  planningThreadState?: PlanningThreadState | null;
  conversationState?: ConversationSessionState | null;
  projectBrief?: ProjectBrief | null;
  hasStrategyOverrides?: boolean;
  hasRevisionHistory?: boolean;
  hasSavedPlanningArtifacts?: boolean;
  projectTitle?: string | null;
  projectSummary?: string | null;
  currentFocus?: string | null;
  blockers?: readonly string[];
  nextStep?: string | null;
}) {
  return Boolean(
    hasPlanningThreadHistory(args.planningThreadState ?? null) ||
      hasMeaningfulPlanningConversationState(
        args.conversationState ?? args.planningThreadState?.conversationState ?? null
      ) ||
      hasMeaningfulProjectTitle(args.projectTitle ?? args.projectBrief?.projectName) ||
      hasMeaningfulProjectBrief(args.projectBrief ?? null) ||
      hasMeaningfulPlanningText(args.projectSummary) ||
      hasMeaningfulPlanningText(args.currentFocus) ||
      hasMeaningfulPlanningList(args.blockers) ||
      hasMeaningfulPlanningText(args.nextStep) ||
      args.hasStrategyOverrides ||
      args.hasRevisionHistory ||
      args.hasSavedPlanningArtifacts
  );
}

export function choosePreferredPlanningThreadState(args: {
  persistedThreadState?: PlanningThreadState | null;
  localThreadState?: PlanningThreadState | null;
  allowSyntheticFallback?: boolean;
}) {
  const persisted = args.persistedThreadState ?? null;
  const local = args.localThreadState ?? null;

  if (hasPlanningThreadHistory(persisted)) {
    return persisted;
  }

  if (hasPlanningThreadHistory(local)) {
    return local;
  }

  if (args.allowSyntheticFallback === false) {
    return persisted;
  }

  return persisted ?? local;
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
  projectBrief?: ProjectBrief | null;
  hasStrategyOverrides?: boolean;
  hasRevisionHistory?: boolean;
  hasSavedPlanningArtifacts?: boolean;
  projectTitle?: string | null;
  projectSummary?: string | null;
  currentFocus?: string | null;
  blockers?: readonly string[];
  nextStep?: string | null;
}) {
  return hasMeaningfulProjectPlanningState({
    planningThreadState: args.planningThreadState,
    conversationState: args.conversationState,
    projectBrief: args.projectBrief,
    hasStrategyOverrides: args.hasStrategyOverrides,
    hasRevisionHistory: args.hasRevisionHistory,
    hasSavedPlanningArtifacts: args.hasSavedPlanningArtifacts,
    projectTitle: args.projectTitle,
    projectSummary: args.projectSummary,
    currentFocus: args.currentFocus,
    blockers: args.blockers,
    nextStep: args.nextStep
  });
}

export function buildStrategyRoomInitialThreadState(args: {
  lane: PlanningLaneId;
  planningThreadState?: PlanningThreadState | null;
  conversationState?: ConversationSessionState | null;
  projectBrief?: ProjectBrief | null;
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
  const founderNameKnown = hasKnownPlanningFounderName(
    args.conversationState ?? args.planningThreadState?.conversationState ?? null,
    args.projectBrief ?? null
  );
  const productDirectionKnown = hasKnownPlanningProductDirection({
    conversationState:
      args.conversationState ?? args.planningThreadState?.conversationState ?? null,
    projectBrief: args.projectBrief ?? null,
    projectTitle: args.projectTitle,
    projectSummary: args.projectSummary,
    planningThreadState: args.planningThreadState ?? null
  });
  const meaningfulExistingProjectState = hasSavedProjectPlanningState({
    planningThreadState: args.planningThreadState,
    conversationState: args.conversationState,
    projectBrief: args.projectBrief,
    hasStrategyOverrides: args.hasStrategyOverrides,
    hasRevisionHistory: args.hasRevisionHistory,
    hasSavedPlanningArtifacts: args.hasSavedPlanningArtifacts,
    projectTitle: args.projectTitle,
    projectSummary: args.projectSummary,
    currentFocus: args.currentFocus,
    blockers: args.blockers,
    nextStep: args.nextStep
  });
  const normalizedPlanningThreadState = normalizePlanningThreadState({
    threadState: args.planningThreadState ?? null,
    options: {
      suppressStarterPrompts: meaningfulExistingProjectState,
      founderNameKnown,
      productDirectionKnown
    }
  });

  if (hasPlanningThreadHistory(normalizedPlanningThreadState)) {
    return normalizedPlanningThreadState;
  }

  if (
    !hasSavedProjectPlanningState({
      planningThreadState: normalizedPlanningThreadState,
      conversationState: args.conversationState,
      projectBrief: args.projectBrief,
      hasStrategyOverrides: args.hasStrategyOverrides,
      hasRevisionHistory: args.hasRevisionHistory,
      hasSavedPlanningArtifacts: args.hasSavedPlanningArtifacts,
      projectTitle: args.projectTitle,
      projectSummary: args.projectSummary,
      currentFocus: args.currentFocus,
      blockers: args.blockers,
      nextStep: args.nextStep
    })
  ) {
    return null;
  }

  return buildProjectResumePlanningThread({
    threadId:
      cleanPlanningText(args.fallbackThreadId) ||
      normalizedPlanningThreadState?.threadId ||
      args.planningThreadState?.threadId ||
      `project-thread-${Date.now()}`,
    lane: args.lane,
    projectTitle: args.projectTitle,
    projectSummary: args.projectSummary,
    currentFocus: args.currentFocus,
    blockers: args.blockers,
    nextStep: args.nextStep,
    conversationState:
      args.conversationState ??
      normalizedPlanningThreadState?.conversationState ??
      args.planningThreadState?.conversationState ??
      null
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
