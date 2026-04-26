import type { ConversationSessionState } from "@/lib/intelligence/conversation";

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
