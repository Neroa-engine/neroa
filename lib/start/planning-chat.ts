import { routeAI } from "@/lib/ai/router";
import {
  buildConversationSessionState,
  buildConversationTurnGuidance,
  recordConversationQuestionAsked,
  sanitizeConversationText,
  type ConversationQuestionKey,
  type ConversationSessionState
} from "@/lib/intelligence/conversation";
import { generateArchitectureBlueprint } from "@/lib/intelligence/architecture";
import { generateGovernancePolicy } from "@/lib/intelligence/governance";
import { generateProjectBrief } from "@/lib/intelligence/project-brief-generator";
import { generateRoadmapPlan } from "@/lib/intelligence/roadmap";
import {
  buildStartVisibleStrategistDecision,
  type StartVisibleStrategistLog
} from "@/lib/intelligence/runtime-bridge";
import type {
  PlanningLaneId,
  PlanningMessage,
  PlanningMessageRole,
  PlanningThreadMetadata,
  PlanningThreadState
} from "@/lib/start/planning-thread";
import { analyzePlanningInputs, isWeakPlanningInput } from "@/lib/start/planning-thread";

type PlanningMessageInput = {
  id?: string | null;
  role: PlanningMessageRole;
  content: string;
  createdAt?: string | null;
};

export type PlanningChatResult = {
  threadState: PlanningThreadState;
  assistantMessage: PlanningMessage;
  provider: "vector" | "axiom" | "fallback";
  usedFallback: boolean;
  visibleStrategist: StartVisibleStrategistLog;
};

type VisibleConversationState = StartVisibleStrategistLog["visibleConversationState"];
type RenderedTopicCategory = StartVisibleStrategistLog["renderedTopicCategory"];

const INTERNAL_NAME_PATTERN =
  /\b(?:vector|axiom|forge|anchor|nureo|nuroa|narua|openai|anthropic|codex|gpt|claude)\b/gi;
const CASUAL_PATTERN =
  /^(?:hi|hello|hey|yo|sup|what's up|good morning|good afternoon|good evening|can you help me|could you help me|i have an idea|i've got an idea|i got an idea|thanks|thank you|cool|nice|okay|ok|sounds good|how are you)\b/i;
const EXECUTION_PATH_PATTERN =
  /\b(?:diy|managed|pricing|price|cost|plan|plans|billing|upgrade|done for you|do it myself|execution path|delivery path)\b/i;
const EXECUTION_REFERENCE_PATTERN =
  /\b(?:DIY Build|Managed Build|DIY workspace|managed workspace|operator-led lane|Neroa-guided lane|delivery lane|lane locked)\b/gi;
const OFF_TOPIC_PATTERN =
  /\b(?:movie|music|song|sports|weather|politics|restaurant|travel|vacation|joke|poem|dating|horoscope)\b/i;
const NAME_REQUEST_PATTERN = /what should i call you|what should i call you\?|what do you want me to call you/i;
const INTRODUCTION_PATTERN = /\b(?:i'?m|i am)\s+neroa\b/i;
const LOW_VALUE_CLARIFICATION_PATTERN =
  /\b(?:what do you mean by|what exactly do you mean by|can you clarify|clarify what you mean by|define|specify|be more specific about)\b/i;
const STYLE_DIRECTION_PATTERN =
  /\b(?:futuristic|future-forward|premium|luxury|high-end|high end|sleek|simple|minimal|minimalist|clean|bold|cinematic|editorial|experimental|elevated)\b/i;
const FUTURISTIC_PATTERN = /\b(?:futuristic|future-forward|sci[- ]?fi|tech-forward|next-gen)\b/i;
const PREMIUM_PATTERN = /\b(?:premium|luxury|high-end|high end|elevated)\b/i;
const SIMPLE_PATTERN = /\b(?:simple|minimal|minimalist|clean|restrained)\b/i;
const ECOMMERCE_PATTERN =
  /\b(?:ecommerce|e-commerce|commerce|store|storefront|shop|shopping|checkout|catalog|cart)\b/i;
const APPAREL_PATTERN = /\b(?:apparel|fashion|clothing|streetwear|merch|garment)\b/i;
const MARKETPLACE_PATTERN = /\bmarketplace\b/i;

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toDisplayName(value: string) {
  return value
    .split(/\s+/)
    .map((part) =>
      part ? `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}` : part
    )
    .join(" ");
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function buildMessageId(role: PlanningMessageRole) {
  return `${role}-${crypto.randomUUID()}`;
}

function isCasualOpeningMessage(message: string) {
  const cleanMessage = cleanText(message);

  if (!cleanMessage) {
    return false;
  }

  if (!CASUAL_PATTERN.test(cleanMessage)) {
    return false;
  }

  return cleanMessage.split(/\s+/).length <= 10 && isWeakPlanningInput(cleanMessage);
}

function assistantAskedForName(messages: PlanningMessage[]) {
  return messages.some(
    (message) => message.role === "assistant" && NAME_REQUEST_PATTERN.test(message.content)
  );
}

function extractLikelyName(message: string) {
  const cleanMessage = cleanText(message)
    .replace(/^(?:hi|hello|hey|good morning|good afternoon|good evening)[,\s-]*/i, "")
    .replace(/^(?:i(?:'m| am)|it(?:'s| is)|call me|my name is)\s+/i, "")
    .replace(/[.!?]+$/g, "")
    .trim();

  if (!cleanMessage) {
    return null;
  }

  if (cleanMessage.split(/\s+/).length > 4) {
    return null;
  }

  if (/[0-9?]/.test(cleanMessage)) {
    return null;
  }

  if (
    /\b(?:build|product|app|saas|platform|dashboard|portal|workflow|feature|customer|user|idea|analytics|crm|marketplace|billing)\b/i.test(
      cleanMessage
    )
  ) {
    return null;
  }

  if (!/^[a-zA-Z][a-zA-Z .'-]*$/.test(cleanMessage)) {
    return null;
  }

  return toDisplayName(cleanMessage);
}

function normalizeMessages(messages: PlanningMessageInput[]) {
  return messages
    .map((message) => ({
      id: cleanText(message.id) || buildMessageId(message.role),
      role: message.role,
      content: cleanText(message.content),
      createdAt: cleanText(message.createdAt) || new Date().toISOString()
    }))
    .filter((message) => message.content.length > 0)
    .slice(-18);
}

function deriveProjectTitle(args: {
  title?: string | null;
  summary?: string | null;
  userMessages: PlanningMessage[];
  shouldDeriveTitle: boolean;
}) {
  const explicitTitle = cleanText(args.title);

  if (explicitTitle) {
    return truncate(explicitTitle, 72);
  }

  if (!args.shouldDeriveTitle) {
    return null;
  }

  const summary = cleanText(args.summary);

  if (summary && !isWeakPlanningInput(summary)) {
    return truncate(summary, 72);
  }

  const firstUserMessage =
    args.userMessages.find((message) => !isWeakPlanningInput(message.content))?.content ?? "";
  const firstSentence = firstUserMessage
    .split(/[.!?]\s+/)
    .map((part) => part.trim())
    .find(Boolean);

  return firstSentence ? truncate(firstSentence, 72) : null;
}

function collectScopeNotes(args: {
  summary?: string | null;
  userMessages: PlanningMessage[];
  shouldRevealSummary: boolean;
}) {
  if (!args.shouldRevealSummary) {
    return [];
  }

  const combined = [cleanText(args.summary), ...args.userMessages.map((message) => message.content)]
    .filter(Boolean)
    .join("\n");
  const candidates = combined
    .split(/\n+|[.!?](?:\s+|$)/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 14);
  const notes: string[] = [];

  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase();

    if (notes.some((note) => note.toLowerCase() === normalized)) {
      continue;
    }

    notes.push(truncate(candidate, 140));

    if (notes.length >= 4) {
      break;
    }
  }

  return notes;
}

function buildRecommendedNextStep(args: {
  lane: PlanningLaneId;
  userMessages: PlanningMessage[];
  shouldRevealSummary: boolean;
}) {
  if (!args.shouldRevealSummary) {
    return "Keep sharpening the user, the first workflow, and the outcome that has to work.";
  }

  const latestUserMessage = args.userMessages.at(-1)?.content.toLowerCase() ?? "";
  const mentionsMigration =
    latestUserMessage.includes("migrat") ||
    latestUserMessage.includes("rebuild") ||
    latestUserMessage.includes("legacy");
  const mentionsLaunch =
    latestUserMessage.includes("launch") ||
    latestUserMessage.includes("go live") ||
    latestUserMessage.includes("ship");

  if (args.lane === "managed") {
    if (mentionsMigration) {
      return "Define migration risk, ownership boundaries, and delivery order before opening the workspace.";
    }

    if (mentionsLaunch) {
      return "Define delivery milestones, launch dependencies, and review checkpoints before opening the workspace.";
    }

    return "Define scope, delivery risk, and the first milestone before opening the workspace.";
  }

  if (mentionsLaunch) {
    return "Define the MVP boundary, first build milestone, and launch-critical blockers before opening the workspace.";
  }

  return "Define the MVP boundary, core user flow, and first build milestone before opening the workspace.";
}

function buildPlanningMetadata(args: {
  lane: PlanningLaneId;
  title?: string | null;
  summary?: string | null;
  userMessages: PlanningMessage[];
  shouldDeriveTitle: boolean;
  shouldRevealSummary: boolean;
}) {
  const projectTitle = deriveProjectTitle(args);
  const perceivedProject = args.shouldRevealSummary
    ? cleanText(args.summary) ||
      args.userMessages.at(-1)?.content.trim() ||
      args.userMessages.find((message) => !isWeakPlanningInput(message.content))?.content.trim() ||
      null
    : null;

  return {
    lane: args.lane,
    projectTitle,
    perceivedProject: perceivedProject ? truncate(perceivedProject, 220) : null,
    scopeNotes: collectScopeNotes(args),
    recommendedNextStep: buildRecommendedNextStep(args)
  } satisfies PlanningThreadMetadata;
}

function sanitizeInternalReferences(value: string) {
  return value.replace(INTERNAL_NAME_PATTERN, "Neroa");
}

function sanitizeVisiblePlanningText(value: string, allowExecutionPath: boolean) {
  const sanitized = sanitizeInternalReferences(value);

  if (allowExecutionPath) {
    return sanitizeConversationText(sanitized);
  }

  return sanitizeConversationText(
    sanitized
    .replace(EXECUTION_REFERENCE_PATTERN, "the current plan")
    .replace(/\b(?:DIY|Managed)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  );
}

function splitIntoSentences(value: string, allowExecutionPath: boolean) {
  return value
    .split(/\n+|(?<=[.!?])\s+/)
    .map((part) => sanitizeVisiblePlanningText(part, allowExecutionPath).trim())
    .filter(Boolean);
}

function extractPlanningSignals(value: string, allowExecutionPath: boolean) {
  const signals: string[] = [];

  for (const sentence of splitIntoSentences(value, allowExecutionPath)) {
    const normalized = sentence.toLowerCase();

    if (sentence.length < 18) {
      continue;
    }

    if (normalized.endsWith("?")) {
      continue;
    }

    if (
      normalized.startsWith("project frame") ||
      normalized.startsWith("planning focus") ||
      normalized.startsWith("current read") ||
      normalized.startsWith("what to lock next") ||
      normalized.startsWith("next question") ||
      LOW_VALUE_CLARIFICATION_PATTERN.test(normalized)
    ) {
      continue;
    }

    if (signals.some((existing) => existing.toLowerCase() === normalized)) {
      continue;
    }

    signals.push(truncate(sentence.replace(/^[-*]\s*/, ""), 150));

    if (signals.length >= 2) {
      break;
    }
  }

  return signals;
}

function isOffTopicMessage(message: string) {
  const cleanMessage = cleanText(message);

  if (!cleanMessage) {
    return true;
  }

  if (
    CASUAL_PATTERN.test(cleanMessage) &&
    cleanMessage.split(/\s+/).length <= 8 &&
    isWeakPlanningInput(cleanMessage)
  ) {
    return true;
  }

  if (OFF_TOPIC_PATTERN.test(cleanMessage) && isWeakPlanningInput(cleanMessage)) {
    return true;
  }

  return false;
}

function shouldDiscussExecutionPath(latestUserMessage: string, userMessages: PlanningMessage[]) {
  const combined = [latestUserMessage, ...userMessages.map((message) => message.content)].join(" \n ");
  return EXECUTION_PATH_PATTERN.test(combined);
}

function buildPlanningContext(args: {
  threadId: string;
  lane: PlanningLaneId;
  title?: string | null;
  summary?: string | null;
  messages: PlanningMessage[];
  metadata: PlanningThreadMetadata;
  shouldStructureReply: boolean;
  allowExecutionPath: boolean;
}) {
  const userTurns = args.messages.filter((message) => message.role === "user").length;

  return JSON.stringify({
    threadId: args.threadId,
    surface: "/start planning center",
    lane: args.lane,
    title: cleanText(args.title) || null,
    seedSummary: cleanText(args.summary) || null,
    recentMessages: args.messages.slice(-8).map((message) => ({
      role: message.role,
      content: message.content
    })),
    metadata: args.metadata,
    operatingMode: "structured project-intake strategist",
    constraints: [
      "Stay inside project planning, product definition, and build strategy.",
      "Do not mention worker names, provider names, model names, or internal system names.",
      "Do not mention the execution lane or pricing path unless the user explicitly asks about it.",
      "Infer obvious meaning before asking for clarification.",
      "Do not ask literal low-value questions about single words when the broader intent is obvious.",
      "Ask one high-leverage follow-up at a time unless two are genuinely needed.",
      "Do not drift into general chit-chat or unrelated advice.",
      "Keep the response concise, natural, and strategically useful."
    ],
    responseShape: args.shouldStructureReply
      ? {
          mode: "synthesis",
          structure:
            "Use one short interpretive synthesis paragraph and then ask at most two sharp next questions. Do not use headings.",
          nextInputQuestions: userTurns <= 1 ? 2 : 1
        }
      : {
          mode: "guided-intake",
          openingSentence:
            "Acknowledge the project direction naturally, show understanding, and ask only the single most useful next question unless two are clearly needed.",
          nextInputQuestions: userTurns <= 1 ? 2 : 1
        },
    tone: "professional, direct, founder/operator level, no fluff"
  });
}

function buildNextQuestions(args: {
  userMessages: PlanningMessage[];
  latestUserMessage: string;
  hasAudience: boolean;
  hasConstraints: boolean;
  hasWorkflow: boolean;
  hasOutcome: boolean;
}) {
  const turnCount = args.userMessages.length;

  if (isOffTopicMessage(args.latestUserMessage)) {
    return ["What are you thinking about building?"];
  }

  if (turnCount <= 1) {
    return [
      args.hasAudience
        ? "What should it help them do first?"
        : "Who is this mainly for?",
      "What kind of product experience are you picturing?"
    ];
  }

  if (!args.hasWorkflow && !args.hasAudience) {
    return ["What kind of product experience is this, and who is it really for first?"];
  }

  if (!args.hasWorkflow) {
    return ["What is the first experience or workflow someone should move through?"];
  }

  if (!args.hasAudience) {
    return ["Who is the first user or buyer this has to win over?"];
  }

  if (!args.hasOutcome && turnCount <= 3) {
    return ["If this works well, what changes for the user or the business?"];
  }

  if (!args.hasConstraints && turnCount <= 3) {
    return ["What has to feel excellent the first time someone uses it?"];
  }

  return ["What would make the first version feel unmistakably right?"];
}

function buildCurrentReadBullets(args: {
  metadata: PlanningThreadMetadata;
}) {
  const bullets = [
    args.metadata.perceivedProject
      ? `Product direction: ${truncate(args.metadata.perceivedProject, 150)}`
      : "Product direction: still sharpening from the intake thread",
    args.metadata.scopeNotes[0]
      ? `Scope signal: ${truncate(args.metadata.scopeNotes[0], 150)}`
      : `Immediate focus: ${truncate(args.metadata.recommendedNextStep, 150)}`
  ];

  return bullets.slice(0, 2);
}

function buildPlanningFocusBullets(args: {
  metadata: PlanningThreadMetadata;
  rawReply: string;
  allowExecutionPath: boolean;
}) {
  const aiSignals = extractPlanningSignals(args.rawReply, args.allowExecutionPath);
  const focus = [...aiSignals];

  for (const note of args.metadata.scopeNotes) {
    if (focus.length >= 2) {
      break;
    }

    if (focus.some((item) => item.toLowerCase() === note.toLowerCase())) {
      continue;
    }

    focus.push(note);
  }

  return focus.slice(0, 2).map((item) => truncate(item, 150));
}

function trimTerminalPunctuation(value: string) {
  return value.replace(/[.!?]+$/g, "").trim();
}

function buildReplyBody(opening: string, questions: string[], maxQuestions = 2) {
  const cleanOpening = cleanText(opening);
  const cleanQuestions = questions
    .map((question) => cleanText(question))
    .filter(Boolean)
    .slice(0, Math.max(0, maxQuestions));

  return [cleanOpening, ...cleanQuestions].filter(Boolean).join("\n\n");
}

function countQuestions(value: string) {
  return (value.match(/\?/g) ?? []).length;
}

function inferVisibleConversationStateFromSignals(args: {
  greetingModeActive: boolean;
  greetingHandoffMode: boolean;
  strategistState: VisibleConversationState;
  hasAudience: boolean;
  hasOutcome: boolean;
  hasWorkflow: boolean;
}) {
  if (args.greetingModeActive && !args.greetingHandoffMode) {
    return "greeting" as const;
  }

  if (args.greetingHandoffMode) {
    return "intake_grounding" as const;
  }

  if (args.strategistState) {
    return args.strategistState;
  }

  return args.hasAudience && args.hasOutcome && args.hasWorkflow
    ? "product_shaping"
    : "intake_grounding";
}

function buildInterpretiveFollowUp(args: {
  latestUserMessage: string;
  hasAudience: boolean;
  hasOutcome: boolean;
  hasWorkflow: boolean;
}) {
  const latestUserMessage = cleanText(args.latestUserMessage);
  const mentionsStyle = STYLE_DIRECTION_PATTERN.test(latestUserMessage);
  const mentionsFuturistic = FUTURISTIC_PATTERN.test(latestUserMessage);
  const mentionsPremium = PREMIUM_PATTERN.test(latestUserMessage);
  const mentionsSimple = SIMPLE_PATTERN.test(latestUserMessage);
  const mentionsCommerce = ECOMMERCE_PATTERN.test(latestUserMessage);
  const mentionsApparel = APPAREL_PATTERN.test(latestUserMessage);
  const mentionsMarketplace = MARKETPLACE_PATTERN.test(latestUserMessage);

  if (mentionsStyle) {
    let opening = "Got it - that's a strong design direction.";
    let styleQuestion = "Should the experience feel more sleek and high-end, or more bold and cinematic?";

    if (mentionsFuturistic && mentionsPremium && mentionsSimple) {
      opening =
        "Got it - you want this to feel future-facing, elevated, and restrained rather than flashy.";
      styleQuestion =
        "Should that feel closer to luxury-tech minimal, modern editorial, or something more cinematic?";
    } else if (mentionsFuturistic && mentionsPremium) {
      opening = "Got it - that sounds like a future-facing brand with a high-end feel.";
      styleQuestion =
        "Should the experience lean more luxury-tech minimal, or more cinematic and dramatic?";
    } else if (mentionsPremium && mentionsSimple) {
      opening =
        "Understood - that's a useful tension. You want it to feel elevated without feeling busy.";
      styleQuestion =
        "Should it lean more luxury minimal, clean tech, or modern editorial?";
    } else if (mentionsFuturistic) {
      opening = "Got it - that's a clear visual direction, not just a throwaway style word.";
      styleQuestion =
        "Should it feel more sleek and high-end, or more bold and experimental?";
    } else if (mentionsPremium) {
      opening = "Understood - premium is useful here when it feels intentional instead of ornate.";
      styleQuestion = "Is the brand closer to luxury minimal, modern editorial, or clean tech?";
    } else if (mentionsSimple) {
      opening =
        "Got it - simple can still feel expensive when the product and brand are really disciplined.";
      styleQuestion =
        "Do you want that simplicity to feel more editorial, more product-led, or more high-end tech?";
    }

    const questions = [styleQuestion];

    if (mentionsCommerce || mentionsApparel) {
      questions.push(
        mentionsMarketplace
          ? "Is this meant to be a marketplace, or a focused brand storefront with a tighter point of view?"
          : "Is this more of a focused brand storefront, or a broader shop with a wider catalog?"
      );
    } else if (!args.hasWorkflow) {
      questions.push("What kind of product or business is this experience actually for?");
    } else if (!args.hasAudience) {
      questions.push("Who needs to feel that most strongly the moment they land?");
    }

    return {
      opening,
      questions: questions.slice(0, 2)
    };
  }

  if (mentionsCommerce || mentionsApparel) {
    const opening = mentionsApparel
      ? "Got it - this sounds like an apparel commerce brand, so the identity and the shopping experience both matter."
      : "Got it - this sounds like a commerce product where the browsing and conversion flow both matter.";
    const questions = [
      mentionsMarketplace
        ? "Is this closer to a marketplace with many sellers, or a single brand with one clear point of view?"
        : mentionsApparel
          ? "Is this more of a focused brand storefront, or a larger catalog-driven shop?"
          : "Is this more of a brand storefront or a broader commerce platform?"
    ];

    if (!args.hasAudience) {
      questions.push("Who are you trying to win over first?");
    } else if (!args.hasOutcome) {
      questions.push("What should someone feel or do within the first minute?");
    }

    return {
      opening,
      questions: questions.slice(0, 2)
    };
  }

  if (mentionsMarketplace) {
    return {
      opening:
        "Got it - a marketplace changes the planning shape right away because discovery, trust, and supply all matter.",
      questions: [
        "Who are the two sides of the marketplace?",
        "What is the first transaction or connection you need to make easy?"
      ]
    };
  }

  return null;
}

function buildWarmGreetingReply(latestUserMessage: string) {
  if (/can you help me|could you help me/i.test(latestUserMessage)) {
    return "Absolutely - I'm Neroa. What should I call you?";
  }

  if (/i have an idea|i've got an idea|i got an idea/i.test(latestUserMessage)) {
    return "Love that. I'm Neroa. What should I call you?";
  }

  return "Hi - I'm Neroa. What should I call you?";
}

function buildWarmNameReply(name: string | null) {
  return name
    ? `Good to meet you, ${name}. What are you thinking about building?`
    : "Good to meet you. What are you thinking about building?";
}

function buildWarmGuidedPlanningReply(args: {
  latestUserMessage: string;
  threadMessages: PlanningMessage[];
  userMessages: PlanningMessage[];
  metadata: PlanningThreadMetadata;
  hasAudience: boolean;
  hasConstraints: boolean;
  hasOutcome: boolean;
  hasWorkflow: boolean;
  meaningfulTurnCount: number;
  maxQuestions?: number;
  controlledNextQuestions?: string[] | null;
  controlledLeadIn?: string | null;
}) {
  const likelyName = extractLikelyName(args.latestUserMessage);

  if (args.meaningfulTurnCount === 0 && likelyName && !INTRODUCTION_PATTERN.test(args.latestUserMessage)) {
    return buildWarmNameReply(likelyName);
  }

  if (args.meaningfulTurnCount === 0 && isCasualOpeningMessage(args.latestUserMessage)) {
    return buildWarmGreetingReply(args.latestUserMessage);
  }

  if (
    args.meaningfulTurnCount === 0 &&
    assistantAskedForName(args.threadMessages) &&
    !INTRODUCTION_PATTERN.test(args.latestUserMessage)
  ) {
    if (likelyName) {
      return buildWarmNameReply(likelyName);
    }
  }

  const interpretiveReply = buildInterpretiveFollowUp({
    latestUserMessage: args.latestUserMessage,
    hasAudience: args.hasAudience,
    hasOutcome: args.hasOutcome,
    hasWorkflow: args.hasWorkflow
  });

  if (
    interpretiveReply &&
    (!args.controlledNextQuestions || args.controlledNextQuestions.length === 0)
  ) {
    return buildReplyBody(
      interpretiveReply.opening,
      interpretiveReply.questions,
      args.maxQuestions ?? 2
    );
  }

  const nextQuestions =
    args.controlledNextQuestions && args.controlledNextQuestions.length > 0
      ? args.controlledNextQuestions
      : buildNextQuestions({
          userMessages: args.userMessages,
          latestUserMessage: args.latestUserMessage,
          hasAudience: args.hasAudience,
          hasConstraints: args.hasConstraints,
          hasWorkflow: args.hasWorkflow,
          hasOutcome: args.hasOutcome
        });
  const baseOpeningLine = isOffTopicMessage(args.latestUserMessage)
    ? "I can help with product strategy here. Bring me the product idea, and I'll help you shape it."
    : args.meaningfulTurnCount === 0
      ? "I'm here with you. Give me the rough shape of what you want to build."
      : !args.hasWorkflow && !args.hasAudience
        ? "I can feel the direction, but I still need the product shape and the first user in focus."
        : args.hasWorkflow && !args.hasAudience
          ? "I can see the product shape now. The next thing I want to understand is who it needs to win over first."
          : args.hasAudience && !args.hasWorkflow
            ? "I understand who this is for. Now I want the product experience itself a little more clearly."
          : !args.hasOutcome && args.meaningfulTurnCount <= 2
              ? "I'm following the direction. Now I want to understand what success actually looks like."
              : "This is starting to take shape. I just want to tighten the next important detail.";
  const openingLine =
    args.controlledNextQuestions && args.controlledNextQuestions.length > 0
      ? cleanText(args.controlledLeadIn)
      : args.controlledLeadIn && args.controlledLeadIn.trim().length > 0
        ? `${baseOpeningLine} ${args.controlledLeadIn}`.trim()
        : baseOpeningLine;

  return buildReplyBody(openingLine, nextQuestions, args.maxQuestions ?? 2);
}

function buildStructuredPlanningReply(args: {
  lane: PlanningLaneId;
  latestUserMessage: string;
  userMessages: PlanningMessage[];
  metadata: PlanningThreadMetadata;
  rawReply: string;
  hasAudience: boolean;
  hasConstraints: boolean;
  hasOutcome: boolean;
  hasWorkflow: boolean;
  allowExecutionPath: boolean;
  maxQuestions?: number;
  controlledNextQuestions?: string[] | null;
  controlledLeadIn?: string | null;
}) {
  const planningFocus = buildPlanningFocusBullets({
    metadata: args.metadata,
    rawReply: args.rawReply,
    allowExecutionPath: args.allowExecutionPath
  });
  const summarySource =
    args.metadata.perceivedProject ||
    args.metadata.scopeNotes[0] ||
    planningFocus[0] ||
    "the core product direction";
  const focusSource = planningFocus.find(
    (item) => item.toLowerCase() !== summarySource.toLowerCase()
  );
  const nextQuestions =
    args.controlledNextQuestions && args.controlledNextQuestions.length > 0
      ? args.controlledNextQuestions
      : buildNextQuestions({
          userMessages: args.userMessages,
          latestUserMessage: args.latestUserMessage,
          hasAudience: args.hasAudience,
          hasConstraints: args.hasConstraints,
          hasWorkflow: args.hasWorkflow,
          hasOutcome: args.hasOutcome
        });
  if (args.controlledNextQuestions && args.controlledNextQuestions.length > 0) {
    return buildReplyBody(cleanText(args.controlledLeadIn), nextQuestions, args.maxQuestions ?? 1);
  }

  const openingLine = `I'm starting to see the shape: ${truncate(
    trimTerminalPunctuation(summarySource),
    180
  )}.`;
  const focusLine =
    args.controlledLeadIn && args.controlledLeadIn.trim().length > 0
      ? args.controlledLeadIn
      : focusSource
      ? `The next thing I want to sharpen is ${trimTerminalPunctuation(focusSource)}.`
      : "The next thing I want to sharpen is the first user, the core workflow, and the first win.";

  return buildReplyBody(`${openingLine} ${focusLine}`.trim(), nextQuestions, args.maxQuestions ?? 2);
}

function buildFallbackPlanningNotes(args: {
  latestUserMessage: string;
  metadata: PlanningThreadMetadata;
}) {
  return buildReplyBody("I can work with that.", [
    "What is the first thing this needs to help someone do?"
  ], 1);
}

function mapConversationQuestionKeyToVisibleQuestionType(
  questionKey: ConversationQuestionKey | null
) {
  switch (questionKey) {
    case "buyer_or_operator_persona":
      return "actor_clarification" as const;
    case "problem_statement":
    case "product_category":
    case "outcome_promise":
      return "critical_unknown" as const;
    case "must_have_features":
    case "nice_to_have_features":
      return "mvp_boundary_clarification" as const;
    case "constraints_and_compliance":
      return "constraint_clarification" as const;
    case "integrations_and_data_sources":
      return "systems_integration_clarification" as const;
    case "monetization":
      return "partial_truth_narrowing" as const;
    default:
      return null;
  }
}

function mapConversationQuestionKeyToTopicCategory(
  questionKey: ConversationQuestionKey | null
): RenderedTopicCategory {
  switch (questionKey) {
    case "product_category":
      return "product_shape";
    case "buyer_or_operator_persona":
      return "actors";
    case "problem_statement":
    case "outcome_promise":
      return "outcome";
    case "must_have_features":
    case "nice_to_have_features":
      return "mvp_scope";
    case "constraints_and_compliance":
      return "constraints";
    case "integrations_and_data_sources":
      return "data_integrations";
    case "monetization":
      return "business_model";
    default:
      return null;
  }
}

export async function runPlanningChat(args: {
  threadId: string;
  lane: PlanningLaneId;
  title?: string | null;
  summary?: string | null;
  messages: PlanningMessageInput[];
  message: string;
  conversationState?: ConversationSessionState | null;
}) {
  const now = new Date().toISOString();
  const cleanMessage = cleanText(args.message);

  if (!cleanMessage) {
    throw new Error("Add a message before sending it to Neroa.");
  }

  const normalizedMessages = normalizeMessages(args.messages);
  const userMessage: PlanningMessage = {
    id: buildMessageId("user"),
    role: "user",
    content: cleanMessage,
    createdAt: now
  };
  const threadMessages = [...normalizedMessages, userMessage].slice(-18);
  const userMessages = threadMessages.filter((message) => message.role === "user");
  const planningSignals = analyzePlanningInputs(userMessages.map((message) => message.content));
  const allowExecutionPath = shouldDiscussExecutionPath(cleanMessage, userMessages);
  const metadata = buildPlanningMetadata({
    lane: args.lane,
    title: args.title,
    summary: args.summary,
    userMessages,
    shouldDeriveTitle: planningSignals.shouldDeriveTitle,
    shouldRevealSummary: planningSignals.shouldRevealSummary
  });
  const intelligenceThreadState: PlanningThreadState = {
    threadId: args.threadId,
    lane: args.lane,
    messages: threadMessages,
    metadata,
    conversationState: args.conversationState ?? null,
    projectBrief: null,
    architectureBlueprint: null,
    roadmapPlan: null,
    governancePolicy: null,
    updatedAt: now
  };
  const visibleStrategistDecision = buildStartVisibleStrategistDecision({
    threadState: intelligenceThreadState,
    latestUserMessage: cleanMessage,
    preparedBy: "Live Behavior Calibration Pass v1"
  });
  const conversationSessionBuild = buildConversationSessionState({
    previousState: args.conversationState,
    messages: threadMessages,
    hiddenBundle: visibleStrategistDecision.bundle
  });
  const conversationGuidance = buildConversationTurnGuidance({
    state: conversationSessionBuild.state,
    updatedSlotPaths: conversationSessionBuild.updatedSlotPaths,
    hiddenBundle: visibleStrategistDecision.bundle
  });
  const useConversationPlanner = Boolean(conversationGuidance.question);
  const latestLikelyName =
    conversationSessionBuild.state.founderName ?? extractLikelyName(cleanMessage);
  const casualGreetingMode =
    planningSignals.meaningfulTurnCount === 0 &&
    isCasualOpeningMessage(cleanMessage) &&
    !latestLikelyName;
  const greetingHandoffMode =
    planningSignals.meaningfulTurnCount === 0 &&
    !INTRODUCTION_PATTERN.test(cleanMessage) &&
    !!latestLikelyName;
  const preserveLegacyGreetingFlow =
    (casualGreetingMode || greetingHandoffMode) && !useConversationPlanner;
  const visibleConversationState = inferVisibleConversationStateFromSignals({
    greetingModeActive:
      preserveLegacyGreetingFlow || conversationGuidance.greetingModeActive,
    greetingHandoffMode,
    strategistState: visibleStrategistDecision.log.visibleConversationState,
    hasAudience: planningSignals.hasAudience,
    hasOutcome: planningSignals.hasOutcome,
    hasWorkflow: planningSignals.hasWorkflow
  });
  const earlySingleQuestionMode =
    visibleConversationState !== "product_shaping" || useConversationPlanner;
  const useHiddenVisibleStrategist =
    visibleStrategistDecision.usedHidden && !preserveLegacyGreetingFlow;
  const visibleStrategist =
    useHiddenVisibleStrategist
      ? visibleStrategistDecision.log
        : {
            ...visibleStrategistDecision.log,
            usedHidden: false,
            visibleConversationState,
            greetingModeActive: preserveLegacyGreetingFlow,
            greetingQuestionOnly: preserveLegacyGreetingFlow,
            questionStyleType: "fallback" as const,
            fallbackUsed: true,
            fallbackPhrasingUsed: true,
            forcedEarlyNarrowing: false,
            contradictionSurfaced: false,
            branchAmbiguitySurfaced: false,
            lowConfidenceRecoveryMode: false,
            renderedTopicCategory: null,
            repeatedPhrasePrevented: false,
            echoSuppressed: true,
            echoReplayPrevented: true,
            architectureDiscoveryAsked: false,
            adminSurfaceDiscoveryAsked: false,
            customerPortalDiscoveryAsked: false,
            apiIntegrationDiscoveryAsked: false,
            experientialDiscoveryAsked: false,
            suggestionOffered: false,
            intakeGroundingBlockedShaping: false,
            recentCategorySuppressed: false,
            repeatedCategoryPrevented: false,
            shapeLanguageBlocked: visibleConversationState !== "product_shaping",
            preservedGreetingFlow: preserveLegacyGreetingFlow,
            fallbackReason: preserveLegacyGreetingFlow
              ? "legacy_greeting_or_name_flow_preserved"
              : visibleStrategistDecision.log.fallbackReason
        };
  const conversationDrivenVisibleStrategist =
    useConversationPlanner
      ? {
          ...visibleStrategist,
          visibleConversationState: conversationGuidance.greetingModeActive
            ? ("greeting" as const)
            : visibleConversationState,
          greetingModeActive: conversationGuidance.greetingModeActive,
          renderedTargetSelected:
            conversationGuidance.targetSlotPaths[0] != null
              ? `slot:${conversationGuidance.targetSlotPaths[0]}`
              : visibleStrategist.renderedTargetSelected,
          renderedQuestionType:
            mapConversationQuestionKeyToVisibleQuestionType(conversationGuidance.questionKey) ??
            visibleStrategist.renderedQuestionType,
          questionStyleType: "narrowing" as const,
          renderedTopicCategory:
            mapConversationQuestionKeyToTopicCategory(conversationGuidance.questionKey) ??
            visibleStrategist.renderedTopicCategory,
          fallbackUsed: false,
          fallbackPhrasingUsed: false,
          preservedGreetingFlow: false
        }
      : visibleStrategist;

  let provider: "vector" | "axiom" | "fallback" = "vector";
  let rawAssistantContent = "";

  try {
    const workerId = process.env.OPENAI_API_KEY
      ? "vector"
      : process.env.ANTHROPIC_API_KEY
        ? "axiom"
        : "vector";
    const result = await routeAI({
      workerId,
      message: cleanMessage,
      context: buildPlanningContext({
        threadId: args.threadId,
        lane: args.lane,
        title: args.title,
        summary: args.summary,
        messages: threadMessages,
        metadata,
        shouldStructureReply: planningSignals.shouldStructureReply,
        allowExecutionPath
      })
    });

    rawAssistantContent = cleanText(result.reply);
    provider = workerId;

    if (!rawAssistantContent) {
      throw new Error("Neroa returned an empty planning response.");
    }
  } catch {
    provider = "fallback";
    rawAssistantContent = buildFallbackPlanningNotes({
      latestUserMessage: cleanMessage,
      metadata
    });
  }

  const assistantContent = sanitizeVisiblePlanningText(
    planningSignals.shouldStructureReply
      ? buildStructuredPlanningReply({
          lane: args.lane,
          latestUserMessage: cleanMessage,
          userMessages,
          metadata,
          rawReply: rawAssistantContent,
          hasAudience: planningSignals.hasAudience,
          hasConstraints: planningSignals.hasConstraints,
          hasOutcome: planningSignals.hasOutcome,
          hasWorkflow: planningSignals.hasWorkflow,
          allowExecutionPath,
          maxQuestions: earlySingleQuestionMode ? 1 : 2,
          controlledNextQuestions: useConversationPlanner
            ? [conversationGuidance.question ?? ""]
            : useHiddenVisibleStrategist
            ? [visibleStrategistDecision.renderedQuestion ?? ""]
            : null,
          controlledLeadIn: useConversationPlanner
            ? conversationGuidance.leadIn
            : useHiddenVisibleStrategist
            ? visibleStrategistDecision.strategistLeadIn
            : null
        })
      : buildWarmGuidedPlanningReply({
          latestUserMessage: cleanMessage,
          threadMessages,
          userMessages,
          metadata,
          hasAudience: planningSignals.hasAudience,
          hasConstraints: planningSignals.hasConstraints,
          hasOutcome: planningSignals.hasOutcome,
          hasWorkflow: planningSignals.hasWorkflow,
          meaningfulTurnCount: planningSignals.meaningfulTurnCount,
          maxQuestions: earlySingleQuestionMode ? 1 : 2,
          controlledNextQuestions: useConversationPlanner
            ? [conversationGuidance.question ?? ""]
            : useHiddenVisibleStrategist
            ? [visibleStrategistDecision.renderedQuestion ?? ""]
            : null,
          controlledLeadIn: useConversationPlanner
            ? conversationGuidance.leadIn
            : useHiddenVisibleStrategist
            ? visibleStrategistDecision.strategistLeadIn
            : null
        }),
    allowExecutionPath
  );
  const finalVisibleStrategist =
    preserveLegacyGreetingFlow
      ? {
          ...conversationDrivenVisibleStrategist,
          greetingQuestionOnly: countQuestions(assistantContent) <= 1
        }
      : conversationDrivenVisibleStrategist;

  const assistantMessage: PlanningMessage = {
    id: buildMessageId("assistant"),
    role: "assistant",
    content: assistantContent,
    createdAt: new Date().toISOString()
  };
  const finalConversationState = recordConversationQuestionAsked({
    state: conversationSessionBuild.state,
    questionKey: useConversationPlanner ? conversationGuidance.questionKey : null,
    askedTurnId: assistantMessage.id
  });
  const projectBrief = generateProjectBrief({
    projectName: metadata.projectTitle ?? args.title ?? null,
    projectDescription:
      metadata.perceivedProject ?? args.summary ?? cleanMessage,
    conversationState: finalConversationState,
    hiddenBundle: visibleStrategistDecision.bundle
  });
  const architectureBlueprint = generateArchitectureBlueprint({
    projectName: metadata.projectTitle ?? args.title ?? null,
    projectBrief
  });
  const roadmapPlan = generateRoadmapPlan({
    projectName: metadata.projectTitle ?? args.title ?? null,
    projectBrief,
    architectureBlueprint
  });
  const governancePolicy = generateGovernancePolicy({
    projectName: metadata.projectTitle ?? args.title ?? null,
    projectBrief,
    architectureBlueprint,
    roadmapPlan
  });
  const threadState: PlanningThreadState = {
    threadId: args.threadId,
    lane: args.lane,
    messages: [...threadMessages, assistantMessage].slice(-20),
    metadata,
    conversationState: finalConversationState,
    projectBrief,
    architectureBlueprint,
    roadmapPlan,
    governancePolicy,
    updatedAt: new Date().toISOString()
  };

  return {
    threadState,
    assistantMessage,
    provider,
    usedFallback: provider === "fallback",
    visibleStrategist: finalVisibleStrategist
  } satisfies PlanningChatResult;
}
