import type { HiddenIntelligenceBundle } from "@/lib/intelligence/adapters";
import type { ExtractionFieldState } from "@/lib/intelligence/extraction";
import type { PlanningMessage } from "@/lib/start/planning-thread";
import { buildConversationGreeting } from "./policy.ts";
import {
  conversationSessionStateSchema,
  type ConversationQuestionKey,
  type ConversationSessionBuildResult,
  type ConversationSessionState,
  type ConversationSlotMemory,
  type ConversationSlotPath,
  type ConversationSlotStatus
} from "./types.ts";

const EMPTY_LIST: string[] = [];
const QUESTION_TARGETS: Record<ConversationQuestionKey, ConversationSlotPath[]> = {
  product_category: ["product.productCategory"],
  buyer_or_operator_persona: [
    "audience.buyerPersonas",
    "audience.operatorPersonas"
  ],
  problem_statement: ["problem.problemStatement"],
  outcome_promise: ["outcome.outcomePromise"],
  must_have_features: ["scope.mustHaveFeatures"],
  constraints_and_compliance: ["constraints.constraintsAndCompliance"],
  integrations_and_data_sources: ["systems.integrationsAndDataSources"],
  monetization: ["business.monetization"],
  nice_to_have_features: ["scope.niceToHaveFeatures"]
};

function nowIso() {
  return new Date().toISOString();
}

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .map((part) =>
      part ? `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}` : part
    )
    .join(" ");
}

function uniqueStrings(values: readonly string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const value of values) {
    const normalized = normalizeSpace(value).toLowerCase();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(normalizeSpace(value));
  }

  return items;
}

function buildEmptySlot(slotPath: ConversationSlotPath): ConversationSlotMemory {
  return {
    slotPath,
    value: null,
    status: "empty",
    confidence: 0,
    evidence: [],
    askedCount: 0,
    lastQuestionKey: null
  };
}

function buildDefaultSlots() {
  return {
    "identity.founderName": buildEmptySlot("identity.founderName"),
    "product.productCategory": buildEmptySlot("product.productCategory"),
    "audience.buyerPersonas": buildEmptySlot("audience.buyerPersonas"),
    "audience.operatorPersonas": buildEmptySlot("audience.operatorPersonas"),
    "audience.endCustomerPersonas": buildEmptySlot("audience.endCustomerPersonas"),
    "audience.adminPersonas": buildEmptySlot("audience.adminPersonas"),
    "problem.problemStatement": buildEmptySlot("problem.problemStatement"),
    "outcome.outcomePromise": buildEmptySlot("outcome.outcomePromise"),
    "scope.mustHaveFeatures": buildEmptySlot("scope.mustHaveFeatures"),
    "constraints.constraintsAndCompliance": buildEmptySlot(
      "constraints.constraintsAndCompliance"
    ),
    "systems.integrationsAndDataSources": buildEmptySlot(
      "systems.integrationsAndDataSources"
    ),
    "business.monetization": buildEmptySlot("business.monetization"),
    "scope.niceToHaveFeatures": buildEmptySlot("scope.niceToHaveFeatures")
  } satisfies ConversationSessionState["slots"];
}

export function createConversationSessionState(): ConversationSessionState {
  return {
    version: 1,
    assistantName: "Neroa",
    founderName: null,
    audience: {
      buyerPersonas: [],
      operatorPersonas: [],
      endCustomerPersonas: [],
      adminPersonas: []
    },
    productCategory: null,
    problemStatement: null,
    outcomePromise: null,
    mustHaveFeatures: [],
    constraintsAndCompliance: [],
    integrationsAndDataSources: [],
    monetization: null,
    niceToHaveFeatures: [],
    slots: buildDefaultSlots(),
    questionHistory: [],
    processedUserTurnIds: [],
    lastUpdatedAt: null
  };
}

export function loadConversationSessionState(value: unknown): ConversationSessionState {
  const result = conversationSessionStateSchema.safeParse(value);
  return result.success ? result.data : createConversationSessionState();
}

function cloneState(state: ConversationSessionState): ConversationSessionState {
  return {
    ...state,
    audience: {
      buyerPersonas: [...state.audience.buyerPersonas],
      operatorPersonas: [...state.audience.operatorPersonas],
      endCustomerPersonas: [...state.audience.endCustomerPersonas],
      adminPersonas: [...state.audience.adminPersonas]
    },
    mustHaveFeatures: [...state.mustHaveFeatures],
    constraintsAndCompliance: [...state.constraintsAndCompliance],
    integrationsAndDataSources: [...state.integrationsAndDataSources],
    niceToHaveFeatures: [...state.niceToHaveFeatures],
    slots: Object.fromEntries(
      Object.entries(state.slots).map(([slotPath, slot]) => [
        slotPath,
        {
          ...slot,
          value: Array.isArray(slot.value) ? [...slot.value] : slot.value,
          evidence: [...slot.evidence]
        }
      ])
    ) as ConversationSessionState["slots"],
    questionHistory: state.questionHistory.map((entry) => ({
      ...entry,
      targetSlotPaths: [...entry.targetSlotPaths]
    })),
    processedUserTurnIds: [...state.processedUserTurnIds]
  };
}

function trimEvidence(evidence: string[]) {
  return uniqueStrings(evidence).slice(-6);
}

function slotHasMeaningfulValue(slot: ConversationSlotMemory) {
  if (slot.value == null) {
    return false;
  }

  return Array.isArray(slot.value) ? slot.value.length > 0 : slot.value.trim().length > 0;
}

function mergeStatus(
  current: ConversationSlotStatus,
  next: ConversationSlotStatus
): ConversationSlotStatus {
  if (current === "conflicted" || next === "conflicted") {
    return "conflicted";
  }

  if (current === "confirmed" || next === "confirmed") {
    return "confirmed";
  }

  if (current === "filled" || next === "filled") {
    return "filled";
  }

  if (current === "inferred" || next === "inferred") {
    return "inferred";
  }

  if (current === "partial" || next === "partial") {
    return "partial";
  }

  return next;
}

function updateTextSlot(args: {
  state: ConversationSessionState;
  slotPath: ConversationSlotPath;
  value: string;
  status: ConversationSlotStatus;
  confidence: number;
  evidence: string;
}) {
  const slot = args.state.slots[args.slotPath];
  const currentValue = typeof slot.value === "string" ? slot.value : null;
  const nextValue = normalizeSpace(args.value);

  if (!nextValue) {
    return false;
  }

  let nextStatus = args.status;

  if (currentValue) {
    if (currentValue.toLowerCase() === nextValue.toLowerCase()) {
      nextStatus = slot.status === "filled" || slot.status === "confirmed" ? "confirmed" : args.status;
    } else {
      nextStatus = "conflicted";
    }
  }

  args.state.slots[args.slotPath] = {
    ...slot,
    value: nextValue,
    status: mergeStatus(slot.status, nextStatus),
    confidence: Math.max(slot.confidence, args.confidence),
    evidence: trimEvidence([...slot.evidence, args.evidence])
  };

  return true;
}

function updateListSlot(args: {
  state: ConversationSessionState;
  slotPath: ConversationSlotPath;
  values: readonly string[];
  status: ConversationSlotStatus;
  confidence: number;
  evidence: string;
}) {
  const nextValues = uniqueStrings(args.values);

  if (nextValues.length === 0) {
    return false;
  }

  const slot = args.state.slots[args.slotPath];
  const currentValues = Array.isArray(slot.value) ? slot.value : EMPTY_LIST;
  const merged = uniqueStrings([...currentValues, ...nextValues]);
  const overlap = currentValues.some((item) =>
    nextValues.some((nextItem) => nextItem.toLowerCase() === item.toLowerCase())
  );
  const nextStatus =
    currentValues.length === 0
      ? args.status
      : overlap
      ? slot.status === "filled" || slot.status === "confirmed"
        ? "confirmed"
        : args.status
      : "conflicted";

  args.state.slots[args.slotPath] = {
    ...slot,
    value: merged,
    status: mergeStatus(slot.status, nextStatus),
    confidence: Math.max(slot.confidence, args.confidence),
    evidence: trimEvidence([...slot.evidence, args.evidence])
  };

  return true;
}

function syncStructuredSummary(state: ConversationSessionState) {
  state.founderName =
    typeof state.slots["identity.founderName"].value === "string"
      ? state.slots["identity.founderName"].value
      : null;
  state.audience.buyerPersonas = Array.isArray(state.slots["audience.buyerPersonas"].value)
    ? [...state.slots["audience.buyerPersonas"].value]
    : [];
  state.audience.operatorPersonas = Array.isArray(state.slots["audience.operatorPersonas"].value)
    ? [...state.slots["audience.operatorPersonas"].value]
    : [];
  state.audience.endCustomerPersonas = Array.isArray(
    state.slots["audience.endCustomerPersonas"].value
  )
    ? [...state.slots["audience.endCustomerPersonas"].value]
    : [];
  state.audience.adminPersonas = Array.isArray(state.slots["audience.adminPersonas"].value)
    ? [...state.slots["audience.adminPersonas"].value]
    : [];
  state.productCategory =
    typeof state.slots["product.productCategory"].value === "string"
      ? state.slots["product.productCategory"].value
      : null;
  state.problemStatement =
    typeof state.slots["problem.problemStatement"].value === "string"
      ? state.slots["problem.problemStatement"].value
      : null;
  state.outcomePromise =
    typeof state.slots["outcome.outcomePromise"].value === "string"
      ? state.slots["outcome.outcomePromise"].value
      : null;
  state.mustHaveFeatures = Array.isArray(state.slots["scope.mustHaveFeatures"].value)
    ? [...state.slots["scope.mustHaveFeatures"].value]
    : [];
  state.constraintsAndCompliance = Array.isArray(
    state.slots["constraints.constraintsAndCompliance"].value
  )
    ? [...state.slots["constraints.constraintsAndCompliance"].value]
    : [];
  state.integrationsAndDataSources = Array.isArray(
    state.slots["systems.integrationsAndDataSources"].value
  )
    ? [...state.slots["systems.integrationsAndDataSources"].value]
    : [];
  state.monetization =
    typeof state.slots["business.monetization"].value === "string"
      ? state.slots["business.monetization"].value
      : null;
  state.niceToHaveFeatures = Array.isArray(state.slots["scope.niceToHaveFeatures"].value)
    ? [...state.slots["scope.niceToHaveFeatures"].value]
    : [];
}

function extractLikelyFounderName(message: string) {
  const cleanMessage = cleanText(message)
    .replace(/^(?:hi|hello|hey|good morning|good afternoon|good evening)[,\s-]*/i, "")
    .replace(/^(?:my name is|call me|i(?:'m| am))\s+/i, "")
    .replace(/[.!?]+$/g, "")
    .trim();

  if (!cleanMessage || cleanMessage.split(/\s+/).length > 3) {
    return null;
  }

  if (
    /^(?:no|none|nope|nothing|nothing yet|none yet|not right now|no constraint|no constraints|analytics only|not in mvp|maybe later)$/i.test(
      cleanMessage
    )
  ) {
    return null;
  }

  if (
    /\b(?:build|product|app|saas|platform|website|dashboard|portal|customer|investor|manager|restaurant|crypto)\b/i.test(
      cleanMessage
    )
  ) {
    return null;
  }

  if (!/^[a-zA-Z][a-zA-Z .'-]*$/.test(cleanMessage)) {
    return null;
  }

  return toTitleCase(cleanMessage);
}

function shouldExtractFounderName(
  state: ConversationSessionState,
  message: string,
  pendingQuestionKey: ConversationQuestionKey | null
) {
  if (slotHasMeaningfulValue(state.slots["identity.founderName"])) {
    return false;
  }

  const cleanMessage = cleanText(message);

  if (!cleanMessage) {
    return false;
  }

  const explicitIntroduction =
    /^(?:hi|hello|hey|good morning|good afternoon|good evening)[,\s-]*/i.test(cleanMessage) ||
    /^(?:my name is|call me|i(?:'m| am))\s+/i.test(cleanMessage);

  if (explicitIntroduction) {
    return true;
  }

  if (pendingQuestionKey) {
    return false;
  }

  const hasPlanningContext =
    slotHasMeaningfulValue(state.slots["product.productCategory"]) ||
    slotHasMeaningfulValue(state.slots["problem.problemStatement"]) ||
    slotHasMeaningfulValue(state.slots["outcome.outcomePromise"]) ||
    slotHasMeaningfulValue(state.slots["audience.buyerPersonas"]) ||
    slotHasMeaningfulValue(state.slots["audience.operatorPersonas"]);

  return !hasPlanningContext;
}

function extractProductCategory(message: string) {
  const patterns = [
    /\b(?:i want to build|want to build|building|build)\s+(?:an?|the)?\s*([^.!?\n]+?)(?:\s+(?:for|with)\b|[.!?\n]|$)/i,
    /\b(?:i want|want)\s+(?!to\b)(?:an?|the)?\s*([^.!?\n]+?)(?:\s+(?:for|with)\b|[.!?\n]|$)/i,
    /\b(?:it's|it is|this is)\s+(?:an?|the)?\s*([^.!?\n]+?)(?:\s+(?:for|with)\b|[.!?\n]|$)/i
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    const candidate = normalizeSpace(match?.[1] ?? "");

    if (candidate && !/^for\b/i.test(candidate)) {
      return candidate.replace(/^(?:a|an|the)\s+/i, "").trim();
    }
  }

  return null;
}

function extractSimpleText(message: string, pattern: RegExp) {
  const match = message.match(pattern);
  return normalizeSpace(match?.[1] ?? "");
}

function extractMainCustomer(message: string) {
  const forward =
    message.match(/\b(.+?)\s+(?:is|are)\s+my main customer(?:s)?\b/i)?.[1] ??
    message.match(/\bmy main customer(?:s)?\s+(?:is|are)\s+(.+?)\b/i)?.[1] ??
    "";

  return normalizeSpace(forward.replace(/[.!?]+$/g, ""));
}

function splitCommaOrAndList(value: string) {
  return uniqueStrings(
    value
      .split(/\s*(?:,|and|\/)\s*/i)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function normalizeAnswerCandidate(value: string) {
  return normalizeSpace(value).replace(/[.!?]+$/g, "").trim().toLowerCase();
}

function getPendingQuestionKey(state: ConversationSessionState): ConversationQuestionKey | null {
  return (
    [...state.questionHistory]
      .reverse()
      .find((entry) => entry.status === "asked")?.questionKey ?? null
  );
}

function interpretNullStyleAnswerForQuestion(
  questionKey: ConversationQuestionKey | null,
  message: string
) {
  const normalized = normalizeAnswerCandidate(message);

  if (!normalized) {
    return null;
  }

  switch (questionKey) {
    case "constraints_and_compliance":
      return /^(?:no|none|nope|nothing|nothing yet|none yet|not right now|nothing right now|none right now|no constraint|no constraints|no real constraint|no real constraints|no compliance|no compliance needs|no launch constraint|no launch constraints)$/.test(
        normalized
      )
        ? {
            slotPath: "constraints.constraintsAndCompliance" as const,
            values: ["No material constraints identified right now"],
            leadIn: "That helps - I have the current launch constraints."
          }
        : null;
    case "integrations_and_data_sources":
      return /^(?:no|none|nope|nothing|nothing yet|none yet|not right now|nothing right now|none right now|no integrations|no integration|no data sources|no external data|no connectors)$/.test(
        normalized
      )
        ? {
            slotPath: "systems.integrationsAndDataSources" as const,
            values: ["No required integrations or external data sources identified right now"],
            leadIn: "That helps - I have the current integration boundary."
          }
        : null;
    default:
      return null;
  }
}

function looksSelfServeB2C(text: string) {
  const normalized = text.toLowerCase();

  if (
    /\b(?:internal|ops|operator|admin team|staff|employee|manager portal|backoffice)\b/.test(
      normalized
    )
  ) {
    return false;
  }

  return /\b(?:website|app|self-serve|self serve|dashboard|analytics|investor|consumer|member|creator|founder tool|portfolio)\b/.test(
    normalized
  );
}

function applyPendingQuestionAnswerRules(args: {
  state: ConversationSessionState;
  message: string;
  evidence: string;
  updatedSlotPaths: ConversationSlotPath[];
}) {
  const interpreted = interpretNullStyleAnswerForQuestion(
    getPendingQuestionKey(args.state),
    args.message
  );

  if (!interpreted) {
    return;
  }

  if (
    updateListSlot({
      state: args.state,
      slotPath: interpreted.slotPath,
      values: interpreted.values,
      status: "filled",
      confidence: 0.78,
      evidence: args.evidence
    })
  ) {
    args.updatedSlotPaths.push(interpreted.slotPath);
  }
}

function resolvePendingQuestionHistory(
  state: ConversationSessionState,
  answeredTurnId: string,
  updatedSlotPaths: ConversationSlotPath[]
) {
  if (updatedSlotPaths.length === 0) {
    return;
  }

  const pendingIndex = [...state.questionHistory]
    .map((entry, index) => ({ entry, index }))
    .reverse()
    .find(({ entry }) => entry.status === "asked")?.index;

  if (pendingIndex == null) {
    return;
  }

  const pending = state.questionHistory[pendingIndex];
  const touched = pending.targetSlotPaths.some((slotPath) => updatedSlotPaths.includes(slotPath));

  if (!touched) {
    return;
  }

  const anyConflict = pending.targetSlotPaths.some(
    (slotPath) => state.slots[slotPath].status === "conflicted"
  );
  const allResolved = pending.targetSlotPaths.every((slotPath) =>
    slotHasMeaningfulValue(state.slots[slotPath])
  );

  state.questionHistory[pendingIndex] = {
    ...pending,
    answeredTurnId,
    status: anyConflict ? "conflicted" : allResolved ? "answered" : "partial"
  };
}

function slotText(field?: ExtractionFieldState | null) {
  if (!field?.value) {
    return [];
  }

  if (field.value.kind === "text") {
    return [field.value.summary, field.value.detail, field.value.rawValue]
      .filter((item): item is string => Boolean(cleanText(item)))
      .map((item) => normalizeSpace(item));
  }

  return uniqueStrings([field.value.summary, ...field.value.items, ...(field.value.rawValue ?? [])]);
}

function applyBundleInference(
  state: ConversationSessionState,
  slotPath: ConversationSlotPath,
  field: ExtractionFieldState | null | undefined,
  asList: boolean
) {
  if (!field || slotHasMeaningfulValue(state.slots[slotPath])) {
    return;
  }

  const values = slotText(field);

  if (values.length === 0) {
    return;
  }

  const confidence = Math.max(0.35, Math.min(0.82, field.confidence.score));
  const evidence = `Inferred from ${field.label}.`;

  if (asList) {
    updateListSlot({
      state,
      slotPath,
      values,
      status: "inferred",
      confidence,
      evidence
    });
    return;
  }

  updateTextSlot({
    state,
    slotPath,
    value: values[0],
    status: "inferred",
    confidence,
    evidence
  });
}

function applyHiddenBundleInferences(
  state: ConversationSessionState,
  hiddenBundle?: HiddenIntelligenceBundle | null
) {
  if (!hiddenBundle) {
    return;
  }

  const fields = hiddenBundle.extractionState.fields;

  applyBundleInference(state, "product.productCategory", fields.product_type, false);
  applyBundleInference(state, "problem.problemStatement", fields.problem_statement, false);
  applyBundleInference(state, "outcome.outcomePromise", fields.desired_outcome, false);
  applyBundleInference(state, "scope.mustHaveFeatures", fields.mvp_in_scope, true);
  applyBundleInference(
    state,
    "constraints.constraintsAndCompliance",
    fields.constraints,
    true
  );
  applyBundleInference(
    state,
    "systems.integrationsAndDataSources",
    fields.integrations,
    true
  );
  applyBundleInference(
    state,
    "business.monetization",
    fields.business_model,
    false
  );
  applyBundleInference(
    state,
    "scope.niceToHaveFeatures",
    fields.mvp_out_of_scope,
    true
  );

  if (!slotHasMeaningfulValue(state.slots["audience.buyerPersonas"])) {
    applyBundleInference(state, "audience.buyerPersonas", fields.primary_buyers, true);
  }

  if (!slotHasMeaningfulValue(state.slots["audience.operatorPersonas"])) {
    applyBundleInference(state, "audience.operatorPersonas", fields.primary_users, true);
  }

  if (!slotHasMeaningfulValue(state.slots["audience.adminPersonas"])) {
    applyBundleInference(state, "audience.adminPersonas", fields.primary_admins, true);
  }
}

function applyAudienceRules(
  state: ConversationSessionState,
  message: string,
  updatedSlotPaths: ConversationSlotPath[]
) {
  const evidence = normalizeSpace(message);
  const normalized = message.toLowerCase();

  if (/\bowners?\s+and\s+managers?\b/i.test(message)) {
    if (
      updateListSlot({
        state,
        slotPath: "audience.buyerPersonas",
        values: ["owners"],
        status: "filled",
        confidence: 0.96,
        evidence
      })
    ) {
      updatedSlotPaths.push("audience.buyerPersonas");
    }

    if (
      updateListSlot({
        state,
        slotPath: "audience.operatorPersonas",
        values: ["managers"],
        status: "filled",
        confidence: 0.96,
        evidence
      })
    ) {
      updatedSlotPaths.push("audience.operatorPersonas");
    }

    return;
  }

  const mainCustomer = extractMainCustomer(message);

  if (mainCustomer) {
    if (
      updateListSlot({
        state,
        slotPath: "audience.buyerPersonas",
        values: splitCommaOrAndList(mainCustomer),
        status: "filled",
        confidence: 0.97,
        evidence
      })
    ) {
      updatedSlotPaths.push("audience.buyerPersonas");
    }
  }

  const directAudience = extractSimpleText(message, /\b(?:it(?:'s| is)|this is)\s+for\s+(.+?)$/i);

  if (directAudience) {
    if (
      updateListSlot({
        state,
        slotPath: "audience.buyerPersonas",
        values: splitCommaOrAndList(directAudience),
        status: "filled",
        confidence: 0.9,
        evidence
      })
    ) {
      updatedSlotPaths.push("audience.buyerPersonas");
    }
  }

  const buyerPersonas = Array.isArray(state.slots["audience.buyerPersonas"].value)
    ? state.slots["audience.buyerPersonas"].value
    : EMPTY_LIST;
  const operatorPersonas = Array.isArray(state.slots["audience.operatorPersonas"].value)
    ? state.slots["audience.operatorPersonas"].value
    : EMPTY_LIST;
  const productCategory =
    typeof state.slots["product.productCategory"].value === "string"
      ? state.slots["product.productCategory"].value
      : state.productCategory;
  const combinedAudienceText = [
    productCategory,
    ...buyerPersonas,
    ...operatorPersonas,
    normalized
  ]
    .filter(Boolean)
    .join(" ");

  if (
    buyerPersonas.length > 0 &&
    operatorPersonas.length === 0 &&
    looksSelfServeB2C(combinedAudienceText)
  ) {
    if (
      updateListSlot({
        state,
        slotPath: "audience.operatorPersonas",
        values: buyerPersonas,
        status: "inferred",
        confidence: 0.68,
        evidence: "Inferred operator persona from buyer persona for a self-serve product."
      })
    ) {
      updatedSlotPaths.push("audience.operatorPersonas");
    }
  }
}

function applyUserMessage(
  state: ConversationSessionState,
  messageId: string,
  message: string
) {
  if (state.processedUserTurnIds.includes(messageId)) {
    return {
      state,
      updatedSlotPaths: [] as ConversationSlotPath[]
    };
  }

  const nextState = cloneState(state);
  const updatedSlotPaths: ConversationSlotPath[] = [];
  const evidence = normalizeSpace(message);
  const pendingQuestionKey = getPendingQuestionKey(nextState);
  const founderName = shouldExtractFounderName(nextState, message, pendingQuestionKey)
    ? extractLikelyFounderName(message)
    : null;
  const productCategory = extractProductCategory(message);
  const problemStatement = extractSimpleText(
    message,
    /\b(?:the problem is|problem is|biggest problem is)\s+(.+?)$/i
  );
  const outcomePromise = extractSimpleText(
    message,
    /\b(?:so that|so they can|help them|help users)\s+(.+?)$/i
  );
  const monetization = extractSimpleText(
    message,
    /\b(?:make money from|monetized through|revenue comes from)\s+(.+?)$/i
  );

  if (
    founderName &&
    updateTextSlot({
      state: nextState,
      slotPath: "identity.founderName",
      value: founderName,
      status: "filled",
      confidence: 0.99,
      evidence
    })
  ) {
    updatedSlotPaths.push("identity.founderName");
  }

  if (
    productCategory &&
    updateTextSlot({
      state: nextState,
      slotPath: "product.productCategory",
      value: productCategory,
      status: "filled",
      confidence: 0.9,
      evidence
    })
  ) {
    updatedSlotPaths.push("product.productCategory");
  }

  applyAudienceRules(nextState, message, updatedSlotPaths);
  applyPendingQuestionAnswerRules({
    state: nextState,
    message,
    evidence,
    updatedSlotPaths
  });

  if (
    problemStatement &&
    updateTextSlot({
      state: nextState,
      slotPath: "problem.problemStatement",
      value: problemStatement,
      status: "filled",
      confidence: 0.87,
      evidence
    })
  ) {
    updatedSlotPaths.push("problem.problemStatement");
  }

  if (
    outcomePromise &&
    updateTextSlot({
      state: nextState,
      slotPath: "outcome.outcomePromise",
      value: outcomePromise,
      status: "filled",
      confidence: 0.84,
      evidence
    })
  ) {
    updatedSlotPaths.push("outcome.outcomePromise");
  }

  if (
    monetization &&
    updateTextSlot({
      state: nextState,
      slotPath: "business.monetization",
      value: monetization,
      status: "filled",
      confidence: 0.8,
      evidence
    })
  ) {
    updatedSlotPaths.push("business.monetization");
  }

  resolvePendingQuestionHistory(nextState, messageId, updatedSlotPaths);
  nextState.processedUserTurnIds.push(messageId);
  nextState.lastUpdatedAt = nowIso();
  syncStructuredSummary(nextState);

  return {
    state: nextState,
    updatedSlotPaths: uniqueStrings(updatedSlotPaths) as ConversationSlotPath[]
  };
}

export function buildConversationSessionState(args: {
  previousState?: ConversationSessionState | null;
  messages: readonly PlanningMessage[];
  hiddenBundle?: HiddenIntelligenceBundle | null;
}): ConversationSessionBuildResult {
  let state = loadConversationSessionState(args.previousState);
  const updatedSlotPaths: ConversationSlotPath[] = [];

  for (const message of args.messages) {
    if (message.role !== "user") {
      continue;
    }

    const result = applyUserMessage(state, message.id, message.content);
    state = result.state;
    updatedSlotPaths.push(...result.updatedSlotPaths);
  }

  applyHiddenBundleInferences(state, args.hiddenBundle);
  syncStructuredSummary(state);

  return {
    state,
    updatedSlotPaths: uniqueStrings(updatedSlotPaths) as ConversationSlotPath[]
  };
}

export function recordConversationQuestionAsked(args: {
  state: ConversationSessionState;
  questionKey: ConversationQuestionKey | null;
  askedTurnId: string;
}) {
  if (!args.questionKey) {
    return args.state;
  }

  const nextState = cloneState(args.state);
  const targetSlotPaths = QUESTION_TARGETS[args.questionKey];
  const alreadyAsked = nextState.questionHistory.some(
    (entry) => entry.askedTurnId === args.askedTurnId && entry.questionKey === args.questionKey
  );

  if (!alreadyAsked) {
    nextState.questionHistory.push({
      questionKey: args.questionKey,
      targetSlotPaths,
      askedTurnId: args.askedTurnId,
      answeredTurnId: null,
      status: "asked"
    });
  }

  for (const slotPath of targetSlotPaths) {
    const slot = nextState.slots[slotPath];
    nextState.slots[slotPath] = {
      ...slot,
      askedCount: slot.askedCount + 1,
      lastQuestionKey: args.questionKey
    };
  }

  nextState.lastUpdatedAt = nowIso();
  syncStructuredSummary(nextState);
  return nextState;
}

export function questionTargetsForKey(questionKey: ConversationQuestionKey) {
  return QUESTION_TARGETS[questionKey];
}

export function buildConversationLeadIn(args: {
  state: ConversationSessionState;
  updatedSlotPaths: readonly ConversationSlotPath[];
}) {
  if (args.updatedSlotPaths.includes("identity.founderName")) {
    return buildConversationGreeting(args.state.founderName);
  }

  if (
    args.updatedSlotPaths.includes("audience.buyerPersonas") ||
    args.updatedSlotPaths.includes("audience.operatorPersonas")
  ) {
    return "That helps - I have who this is for.";
  }

  if (args.updatedSlotPaths.includes("product.productCategory")) {
    return "That helps - I have the product direction.";
  }

  if (args.updatedSlotPaths.includes("problem.problemStatement")) {
    return "That helps - I have the core problem.";
  }

  if (args.updatedSlotPaths.includes("outcome.outcomePromise")) {
    return "That helps - I have the outcome you want to create.";
  }

  if (args.updatedSlotPaths.includes("constraints.constraintsAndCompliance")) {
    return "That helps - I have the current launch constraints.";
  }

  if (args.updatedSlotPaths.includes("systems.integrationsAndDataSources")) {
    return "That helps - I have the current integration boundary.";
  }

  return null;
}
