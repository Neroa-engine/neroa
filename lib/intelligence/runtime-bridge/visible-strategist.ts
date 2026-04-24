import type { BranchFamily } from "@/lib/governance";
import {
  createArtifactsFromPlanningThreadState,
  rebuildIntelligenceStateFromArtifacts,
  type HiddenIntelligenceBundle
} from "@/lib/intelligence/adapters";
import { cleanText, normalizeText } from "@/lib/intelligence/adapters/helpers";
import type { BranchOverlayKey } from "@/lib/intelligence/branching";
import type { ExtractionFieldKey } from "@/lib/intelligence/extraction";
import { getQuestionRegistryEntry, type QuestionSelectionType } from "@/lib/intelligence/questions";
import { isStartVisibleIntelligenceEnabled } from "./guards";
import type {
  StartVisibleStrategistDecision,
  StartVisibleStrategistInput,
  StartVisibleStrategistLog
} from "./types";

const UNCERTAINTY_PATTERN =
  /\b(?:i don't know|idk|not sure|unsure|maybe|kind of|sort of|not really sure|hard to say|probably|guess|roughly|something like)\b/i;
const AVOIDANCE_PATTERN =
  /\b(?:whatever|anything|you decide|not important|either one|doesn't matter)\b/i;
const AI_PATTERN = /\b(?:ai|agent|copilot|assistant|llm|model)\b/i;
const CRYPTO_PATTERN = /\b(?:crypto|token|tokens|wallet|wallets|onchain|trader|trading|exchange|defi)\b/i;
const APPAREL_PATTERN = /\b(?:apparel|fashion|clothing|streetwear|merch|garment|shop|storefront)\b/i;
const SAAS_PATTERN = /\b(?:saas|software|dashboard|portal|workspace|subscription)\b/i;
const INTERNAL_PATTERN = /\b(?:internal|ops|operations|staff|employee|backoffice|back office)\b/i;
const ANALYTICS_PATTERN = /\b(?:analytics|insight|metric|metrics|report|reporting|forecast|signal)\b/i;
const MARKETPLACE_PATTERN = /\b(?:marketplace|seller|vendor|providers|multiple providers|multiple sellers|listings)\b/i;
const BOOKING_PATTERN = /\b(?:booking|appointment|schedule|scheduled|reservation|timeslot|availability)\b/i;

const BROAD_FIELD_KEYS = new Set<ExtractionFieldKey>([
  "request_summary",
  "core_concept",
  "product_type"
]);

const DETAIL_FIELD_KEYS = new Set<ExtractionFieldKey>([
  "core_workflow",
  "business_model",
  "systems_touched",
  "integrations",
  "data_dependencies",
  "mvp_in_scope",
  "mvp_out_of_scope",
  "constraints",
  "budget_constraints",
  "timeline_constraints",
  "success_criteria"
]);

const BRANCH_RESOLVING_FIELD_KEYS = new Set<ExtractionFieldKey>([
  "primary_branch",
  "product_type",
  "primary_users",
  "primary_buyers",
  "primary_admins",
  "core_workflow",
  "business_model"
]);

const ARCHITECTURE_CONTRADICTION_FIELD_KEYS = new Set<ExtractionFieldKey>([
  "primary_branch",
  "product_type",
  "primary_users",
  "primary_buyers",
  "primary_admins",
  "core_workflow",
  "business_model",
  "systems_touched",
  "integrations",
  "mvp_in_scope",
  "mvp_out_of_scope"
]);

const FOUNDATIONAL_FIELD_KEYS: readonly ExtractionFieldKey[] = [
  "request_summary",
  "core_concept",
  "primary_users",
  "desired_outcome"
] as const;

type ConfidenceLevel = StartVisibleStrategistLog["questionConfidenceLevel"];
type QuestionStyleType = StartVisibleStrategistLog["questionStyleType"];
type RenderedTopicCategory = StartVisibleStrategistLog["renderedTopicCategory"];
type VisibleConversationState = StartVisibleStrategistLog["visibleConversationState"];
type PlanningTurnMessage = StartVisibleStrategistInput["threadState"]["messages"][number];

type RendererAcknowledgementFamily =
  | "product_shape"
  | "actors"
  | "outcome"
  | "workflow"
  | "business_model"
  | "mvp_scope"
  | "product_surfaces"
  | "data_integrations"
  | "experience"
  | "constraints"
  | "contradiction"
  | "branch_model"
  | "assumption"
  | "overlay"
  | "readiness"
  | "recovery"
  | "generic";

type RendererResponsePatternFamily =
  | "question_only"
  | "lead_in_plus_question"
  | "summary_plus_question";

type RendererSessionMemory = {
  lastAcknowledgementFamily: RendererAcknowledgementFamily | null;
  lastRenderedQuestionStyle: QuestionStyleType;
  lastRenderedTopicCategory: RenderedTopicCategory;
  lastResponsePatternFamily: RendererResponsePatternFamily | null;
  recentAcknowledgementFamilies: RendererAcknowledgementFamily[];
  recentQuestionStyles: QuestionStyleType[];
  recentTopicCategories: RenderedTopicCategory[];
  recentResponsePatternFamilies: RendererResponsePatternFamily[];
  recentQuestionSignatures: string[];
  architectureDiscoveryAsked: boolean;
  adminSurfaceDiscoveryAsked: boolean;
  customerPortalDiscoveryAsked: boolean;
  apiIntegrationDiscoveryAsked: boolean;
  experientialDiscoveryAsked: boolean;
};

type VisibleStrategistContext = {
  bundle: HiddenIntelligenceBundle;
  latestUserMessage: string;
  combinedContextText: string;
  selectedQuestionType: QuestionSelectionType | null;
  selectedTargetId: string | null;
  primaryFieldKey: ExtractionFieldKey | null;
  questionConfidenceScore: number | null;
  questionConfidenceLevel: ConfidenceLevel;
  primaryBranch: BranchFamily | null;
  lowConfidenceRecoveryMode: boolean;
  visibleConversationState: VisibleConversationState;
  rendererMemory: RendererSessionMemory;
};

type VisibleCalibrationDecision = {
  effectiveQuestionType: QuestionSelectionType | null;
  effectiveTargetId: string | null;
  effectiveFieldKey: ExtractionFieldKey | null;
  effectiveOverlayKey: BranchOverlayKey | null;
  questionStyleType: QuestionStyleType;
  questionConfidenceScore: number | null;
  questionConfidenceLevel: ConfidenceLevel;
  forcedEarlyNarrowing: boolean;
  contradictionSurfaced: boolean;
  branchAmbiguitySurfaced: boolean;
  lowConfidenceRecoveryMode: boolean;
  renderedTopicCategory: RenderedTopicCategory;
  visibleConversationState: VisibleConversationState;
  intakeGroundingBlockedShaping: boolean;
  recentCategorySuppressed: boolean;
  repeatedCategoryPrevented: boolean;
  calibrationNotes: string[];
};

type RenderedLeadIn = {
  text: string | null;
  family: RendererAcknowledgementFamily | null;
  responsePatternFamily: RendererResponsePatternFamily;
  repeatedPhrasePrevented: boolean;
};

type RenderedVisibleQuestion = {
  question: string;
  leadIn: string | null;
  styleType: QuestionStyleType;
  confidenceScore: number | null;
  confidenceLevel: ConfidenceLevel;
  renderedTargetId: string | null;
  renderedQuestionType: QuestionSelectionType | null;
  forcedEarlyNarrowing: boolean;
  contradictionSurfaced: boolean;
  branchAmbiguitySurfaced: boolean;
  lowConfidenceRecoveryMode: boolean;
  renderedTopicCategory: RenderedTopicCategory;
  repeatedPhrasePrevented: boolean;
  echoSuppressed: boolean;
  echoReplayPrevented: boolean;
  architectureDiscoveryAsked: boolean;
  adminSurfaceDiscoveryAsked: boolean;
  customerPortalDiscoveryAsked: boolean;
  apiIntegrationDiscoveryAsked: boolean;
  experientialDiscoveryAsked: boolean;
  suggestionOffered: boolean;
  visibleConversationState: VisibleConversationState;
  intakeGroundingBlockedShaping: boolean;
  recentCategorySuppressed: boolean;
  repeatedCategoryPrevented: boolean;
  shapeLanguageBlocked: boolean;
  calibrationNotes: string[];
};

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function truncate(value: string, maxLength = 120) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function pickFirst<T>(values: readonly (T | null | undefined)[]) {
  for (const value of values) {
    if (value != null) {
      return value;
    }
  }

  return null;
}

function normalizeQuestionSignature(question: string) {
  return normalizeText(question)
    .replace(
      /\b(?:the|a|an|this|that|your|first|mainly|really|just|do|does|is|are|will|should|need|needs|want|wants|here|there|version|v1)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function extractQuestionLines(content: string) {
  return content
    .split(/\n+/)
    .map((line) => cleanText(line))
    .filter((line) => line.includes("?"));
}

function inferTopicCategoryFromFieldKey(
  fieldKey: ExtractionFieldKey | null
): RenderedTopicCategory {
  switch (fieldKey) {
    case "request_summary":
    case "core_concept":
    case "primary_branch":
    case "product_type":
      return "product_shape";
    case "primary_users":
    case "primary_buyers":
    case "primary_admins":
      return "actors";
    case "problem_statement":
    case "desired_outcome":
    case "success_criteria":
      return "outcome";
    case "core_workflow":
      return "workflow";
    case "business_model":
      return "business_model";
    case "mvp_in_scope":
    case "mvp_out_of_scope":
      return "mvp_scope";
    case "systems_touched":
      return "product_surfaces";
    case "integrations":
    case "data_dependencies":
      return "data_integrations";
    case "brand_direction":
      return "experience";
    case "constraints":
    case "budget_constraints":
    case "timeline_constraints":
      return "constraints";
    default:
      return "generic";
  }
}

function inferTopicCategoryFromQuestionText(questionText: string): RenderedTopicCategory {
  const normalized = normalizeText(questionText);

  if (
    normalized.includes("marketplace") ||
    normalized.includes("single-provider") ||
    normalized.includes("multiple providers") ||
    normalized.includes("internal tool") ||
    normalized.includes("external customers")
  ) {
    return "branch_model";
  }

  if (normalized.includes("which version is actually true") || normalized.includes("does not line up")) {
    return "contradiction";
  }

  if (
    normalized.includes("who is this for") ||
    normalized.includes("who has to win first") ||
    normalized.includes("who runs this") ||
    normalized.includes("who actually pays")
  ) {
    return "actors";
  }

  if (
    normalized.includes("what happens first") ||
    normalized.includes("first screen") ||
    normalized.includes("browse") ||
    normalized.includes("compare") ||
    normalized.includes("monitor over time")
  ) {
    return "workflow";
  }

  if (
    normalized.includes("public") ||
    normalized.includes("portal") ||
    normalized.includes("dashboard") ||
    normalized.includes("admin side") ||
    normalized.includes("watchlist") ||
    normalized.includes("detail pages")
  ) {
    return "product_surfaces";
  }

  if (
    normalized.includes("api") ||
    normalized.includes("outside data") ||
    normalized.includes("third-party") ||
    normalized.includes("external feeds") ||
    normalized.includes("integration") ||
    normalized.includes("calendar") ||
    normalized.includes("payments") ||
    normalized.includes("crm") ||
    normalized.includes("email")
  ) {
    return "data_integrations";
  }

  if (
    normalized.includes("should this feel") ||
    normalized.includes("when someone lands") ||
    normalized.includes("premium") ||
    normalized.includes("trusted") ||
    normalized.includes("simple") ||
    normalized.includes("data-heavy")
  ) {
    return "experience";
  }

  if (
    normalized.includes("what decision should") ||
    normalized.includes("what should improve") ||
    normalized.includes("what would prove")
  ) {
    return "outcome";
  }

  return "generic";
}

function resolveRenderedTopicCategory(args: {
  questionType: QuestionSelectionType | null;
  fieldKey: ExtractionFieldKey | null;
  overlayKey: BranchOverlayKey | null;
}) {
  switch (args.questionType) {
    case "contradiction_resolution":
      return "contradiction";
    case "branch_resolution":
      return "branch_model";
    case "assumption_confirmation":
      return "assumption";
    case "overlay_confirmation":
      return "overlay";
    case "readiness_blocker_resolution":
    case "roadmap_transition_readiness":
    case "execution_transition_readiness":
      return "readiness";
    default:
      return inferTopicCategoryFromFieldKey(args.fieldKey);
  }
}

function fieldGroupHasMeaningfulTruth(
  bundle: HiddenIntelligenceBundle,
  fieldKeys: readonly ExtractionFieldKey[]
) {
  return fieldKeys.some((fieldKey) => fieldHasMeaningfulTruth(bundle, fieldKey));
}

function computeGroundingStatus(bundle: HiddenIntelligenceBundle) {
  const productShapeGrounded = fieldGroupHasMeaningfulTruth(bundle, [
    "request_summary",
    "core_concept",
    "primary_branch",
    "product_type"
  ]);
  const primaryUserGrounded = fieldGroupHasMeaningfulTruth(bundle, [
    "primary_users",
    "primary_buyers",
    "primary_admins"
  ]);
  const primaryUseMomentGrounded = fieldGroupHasMeaningfulTruth(bundle, [
    "core_workflow",
    "desired_outcome",
    "problem_statement"
  ]);

  return {
    productShapeGrounded,
    primaryUserGrounded,
    primaryUseMomentGrounded,
    groundingComplete:
      productShapeGrounded && primaryUserGrounded && primaryUseMomentGrounded
  };
}

function determineVisibleConversationState(bundle: HiddenIntelligenceBundle): VisibleConversationState {
  return computeGroundingStatus(bundle).groundingComplete
    ? "product_shaping"
    : "intake_grounding";
}

function isGroundingTopicCategory(topicCategory: RenderedTopicCategory) {
  return (
    topicCategory === "product_shape" ||
    topicCategory === "actors" ||
    topicCategory === "workflow" ||
    topicCategory === "outcome" ||
    topicCategory === "branch_model" ||
    topicCategory === "contradiction" ||
    topicCategory === "generic"
  );
}

function chooseGroundingField(
  context: VisibleStrategistContext,
  suppressedTopicCategory: RenderedTopicCategory | null
) {
  const grounding = computeGroundingStatus(context.bundle);

  if (!grounding.productShapeGrounded) {
    const productShapeCandidates: ExtractionFieldKey[] = ["core_concept", "product_type", "request_summary"];
    if (suppressedTopicCategory === "product_shape") {
      productShapeCandidates.push("primary_branch");
    }

    return choosePreferredField(context.bundle, productShapeCandidates);
  }

  if (!grounding.primaryUserGrounded) {
    const actorCandidates: ExtractionFieldKey[] = ["primary_users", "primary_buyers", "primary_admins"];
    return choosePreferredField(context.bundle, actorCandidates);
  }

  if (!grounding.primaryUseMomentGrounded) {
    const workflowCandidates: ExtractionFieldKey[] = ["core_workflow", "desired_outcome", "problem_statement"];
    return choosePreferredField(context.bundle, workflowCandidates);
  }

  return null;
}

function inferAcknowledgementFamilyFromMessage(
  content: string
): RendererAcknowledgementFamily | null {
  const normalized = normalizeText(content);

  if (!normalized) {
    return null;
  }

  if (normalized.includes("one thing does not line up")) {
    return "contradiction";
  }

  if (
    normalized.includes("lock the product model") ||
    normalized.includes("which product shape is this really")
  ) {
    return "branch_model";
  }

  if (normalized.includes("verify one assumption")) {
    return "assumption";
  }

  if (normalized.includes("architecture detail matters")) {
    return "overlay";
  }

  if (normalized.includes("blocker still matters")) {
    return "readiness";
  }

  if (normalized.includes("let's narrow this down") || normalized.includes("let's keep this small")) {
    return "recovery";
  }

  if (normalized.includes("lock who this is really for")) {
    return "actors";
  }

  if (normalized.includes("lock the first real outcome")) {
    return "outcome";
  }

  if (normalized.includes("lock the first workflow")) {
    return "workflow";
  }

  if (normalized.includes("lock how this creates value")) {
    return "business_model";
  }

  if (normalized.includes("lock what belongs in v1")) {
    return "mvp_scope";
  }

  if (normalized.includes("lock the first system boundary")) {
    return "product_surfaces";
  }

  if (normalized.includes("lock the product feel")) {
    return "experience";
  }

  if (normalized.includes("lock the real constraint")) {
    return "constraints";
  }

  if (normalized.includes("lock what this product actually is")) {
    return "product_shape";
  }

  if (normalized.includes("starting to see the shape") || normalized.includes("take shape")) {
    return "generic";
  }

  return null;
}

function inferQuestionStyleFromMessage(content: string): QuestionStyleType {
  const normalized = normalizeText(content);
  const question = extractQuestionLines(content)[0] ?? "";
  const questionNormalized = normalizeText(question);

  if (
    normalized.includes("does not line up") ||
    questionNormalized.includes("which version is actually true") ||
    questionNormalized.includes("single-brand platform or multiple sellers")
  ) {
    return "contradiction";
  }

  if (
    questionNormalized.includes("single-provider service") ||
    questionNormalized.includes("multiple providers") ||
    questionNormalized.includes("multiple sellers") ||
    questionNormalized.includes("which product shape")
  ) {
    return "branch_resolution";
  }

  if (normalized.includes("let's narrow this down") || normalized.includes("let's keep this small")) {
    return "recovery";
  }

  if (normalized.includes("verify one assumption")) {
    return "assumption_confirmation";
  }

  if (normalized.includes("architecture detail matters")) {
    return "overlay_confirmation";
  }

  if (normalized.includes("blocker still matters")) {
    return "readiness_blocker";
  }

  return question ? "narrowing" : null;
}

function inferResponsePatternFamilyFromMessage(
  content: string
): RendererResponsePatternFamily | null {
  const lines = content
    .split(/\n+/)
    .map((line) => cleanText(line))
    .filter(Boolean);
  const questionLines = lines.filter((line) => line.includes("?"));
  const nonQuestionLines = lines.filter((line) => !line.includes("?"));

  if (questionLines.length === 0) {
    return null;
  }

  if (nonQuestionLines.length === 0) {
    return "question_only";
  }

  if (nonQuestionLines.length === 1 && nonQuestionLines[0].split(/\s+/).length <= 12) {
    return "lead_in_plus_question";
  }

  return "summary_plus_question";
}

function collectRendererMemory(messages: PlanningTurnMessage[]): RendererSessionMemory {
  const assistantMessages = messages.filter((message) => message.role === "assistant").slice(-6);
  const acknowledgementFamilies = assistantMessages
    .map((message) => inferAcknowledgementFamilyFromMessage(message.content))
    .filter(
      (family): family is RendererAcknowledgementFamily =>
        family !== null
    );
  const questionStyles = assistantMessages
    .map((message) => inferQuestionStyleFromMessage(message.content))
    .filter((style): style is QuestionStyleType => style !== null);
  const questionLines = assistantMessages.flatMap((message) => extractQuestionLines(message.content));
  const topicCategories = questionLines
    .map((question) => inferTopicCategoryFromQuestionText(question))
    .filter((category): category is RenderedTopicCategory => category !== null);
  const responsePatterns = assistantMessages
    .map((message) => inferResponsePatternFamilyFromMessage(message.content))
    .filter(
      (pattern): pattern is RendererResponsePatternFamily =>
        pattern !== null
    );
  const normalizedQuestions = questionLines.map((question) => normalizeText(question));

  const architectureDiscoveryAsked = normalizedQuestions.some(
    (question) =>
      question.includes("public") ||
      question.includes("logged-in") ||
      question.includes("portal") ||
      question.includes("dashboard") ||
      question.includes("admin side") ||
      question.includes("watchlist") ||
      question.includes("detail pages")
  );
  const adminSurfaceDiscoveryAsked = normalizedQuestions.some(
    (question) =>
      question.includes("admin side") ||
      question.includes("ops team") ||
      question.includes("manage scores") ||
      question.includes("review projects") ||
      question.includes("who runs this day to day")
  );
  const customerPortalDiscoveryAsked = normalizedQuestions.some(
    (question) =>
      question.includes("customer portal") ||
      question.includes("logged-in dashboard") ||
      question.includes("account area") ||
      question.includes("customer-facing dashboard")
  );
  const apiIntegrationDiscoveryAsked = normalizedQuestions.some(
    (question) =>
      question.includes("outside data") ||
      question.includes("third-party") ||
      question.includes("external feeds") ||
      question.includes("integration") ||
      question.includes("calendar") ||
      question.includes("payments") ||
      question.includes("crm") ||
      question.includes("email") ||
      question.includes("api")
  );
  const experientialDiscoveryAsked = normalizedQuestions.some(
    (question) =>
      question.includes("should this feel") ||
      question.includes("when someone lands") ||
      question.includes("first screen") ||
      question.includes("browse") ||
      question.includes("compare") ||
      question.includes("monitor over time")
  );

  return {
    lastAcknowledgementFamily: acknowledgementFamilies.at(-1) ?? null,
    lastRenderedQuestionStyle: questionStyles.at(-1) ?? null,
    lastRenderedTopicCategory: topicCategories.at(-1) ?? null,
    lastResponsePatternFamily: responsePatterns.at(-1) ?? null,
    recentAcknowledgementFamilies: acknowledgementFamilies.slice(-3),
    recentQuestionStyles: questionStyles.slice(-3),
    recentTopicCategories: topicCategories.slice(-3),
    recentResponsePatternFamilies: responsePatterns.slice(-3),
    recentQuestionSignatures: questionLines
      .map((question) => normalizeQuestionSignature(question))
      .filter(Boolean)
      .slice(-4),
    architectureDiscoveryAsked,
    adminSurfaceDiscoveryAsked,
    customerPortalDiscoveryAsked,
    apiIntegrationDiscoveryAsked,
    experientialDiscoveryAsked
  };
}

function hasQuoteEcho(question: string) {
  return question.includes("\"");
}

function hasSubstantiveLatestUserSignal(latestUserMessage: string) {
  const cleanMessage = cleanText(latestUserMessage);

  if (!cleanMessage) {
    return false;
  }

  return !hasUncertaintySignal(cleanMessage) && cleanMessage.split(/\s+/).length >= 4;
}

function shouldSuppressRecentCategory(
  context: VisibleStrategistContext,
  topicCategory: RenderedTopicCategory,
  fieldKey: ExtractionFieldKey | null
) {
  if (topicCategory == null || isResolutionQuestionType(context.selectedQuestionType)) {
    return false;
  }

  if (!hasSubstantiveLatestUserSignal(context.latestUserMessage)) {
    return false;
  }

  const recentCategories = context.rendererMemory.recentTopicCategories.slice(-2);

  if (!recentCategories.includes(topicCategory)) {
    return false;
  }

  switch (topicCategory) {
    case "actors":
      return fieldGroupHasMeaningfulTruth(context.bundle, [
        "primary_users",
        "primary_buyers",
        "primary_admins"
      ]);
    case "product_shape":
      return fieldGroupHasMeaningfulTruth(context.bundle, [
        "request_summary",
        "core_concept",
        "primary_branch",
        "product_type"
      ]);
    case "workflow":
      return fieldGroupHasMeaningfulTruth(context.bundle, ["core_workflow"]);
    case "outcome":
      return fieldGroupHasMeaningfulTruth(context.bundle, ["desired_outcome", "problem_statement"]);
    default:
      return fieldKey != null ? fieldHasMeaningfulTruth(context.bundle, fieldKey) : false;
  }
}

function confidenceLevelFromScore(score: number | null): ConfidenceLevel {
  if (score == null) {
    return null;
  }

  if (score < 0.45) {
    return "low";
  }

  if (score < 0.75) {
    return "medium";
  }

  return "high";
}

function buildCombinedContextText(bundle: HiddenIntelligenceBundle, latestUserMessage: string) {
  const requestSummary = bundle.extractionState.requestSummary.requestedChangeOrInitiative;
  const desiredOutcome = bundle.extractionState.requestSummary.desiredOutcome;
  const coreConcept = bundle.extractionState.fields.core_concept.value?.summary;
  const requestField = bundle.extractionState.fields.request_summary.value?.summary;
  const primaryUsers = bundle.extractionState.fields.primary_users.value?.summary;
  const workflow = bundle.extractionState.fields.core_workflow.value?.summary;
  const specialization = bundle.branchState.specialization?.label;

  return normalizeText(
    [latestUserMessage, requestSummary, desiredOutcome, coreConcept, requestField, primaryUsers, workflow, specialization]
      .filter(Boolean)
      .join(" ")
  );
}

function hasUncertaintySignal(latestUserMessage: string) {
  const cleanMessage = cleanText(latestUserMessage);

  if (!cleanMessage) {
    return true;
  }

  const wordCount = cleanMessage.split(/\s+/).length;
  return UNCERTAINTY_PATTERN.test(cleanMessage) || AVOIDANCE_PATTERN.test(cleanMessage) || wordCount <= 4;
}

function detectProductContextFlags(contextText: string) {
  return {
    ai: AI_PATTERN.test(contextText),
    crypto: CRYPTO_PATTERN.test(contextText),
    apparel: APPAREL_PATTERN.test(contextText),
    saas: SAAS_PATTERN.test(contextText),
    internal: INTERNAL_PATTERN.test(contextText),
    analytics: ANALYTICS_PATTERN.test(contextText),
    marketplace: MARKETPLACE_PATTERN.test(contextText),
    booking: BOOKING_PATTERN.test(contextText)
  };
}

function targetFieldKeyFromTargetId(targetId: string | null) {
  if (!targetId?.startsWith("field:")) {
    return null;
  }

  return targetId.slice("field:".length) as ExtractionFieldKey;
}

function resolvePrimaryFieldKey(bundle: HiddenIntelligenceBundle) {
  const selectedTarget = bundle.questionSelection.selectedQuestionTarget;
  const selectedQuestion = bundle.questionSelection.selectedQuestion;
  const targetId = selectedTarget?.targetId ?? selectedQuestion?.target.targetId ?? null;
  const registryEntry = targetId ? getQuestionRegistryEntry(targetId) : null;

  return pickFirst<ExtractionFieldKey>([
    selectedTarget?.fieldKey,
    targetFieldKeyFromTargetId(targetId),
    selectedQuestion?.relatedFieldKeys[0],
    registryEntry?.fieldKeys[0]
  ]);
}

function fieldNeedsClarification(bundle: HiddenIntelligenceBundle, fieldKey: ExtractionFieldKey) {
  const status = bundle.extractionState.fields[fieldKey].status;
  return status !== "answered" && status !== "validated";
}

function fieldHasMeaningfulTruth(
  bundle: HiddenIntelligenceBundle,
  fieldKey: ExtractionFieldKey
) {
  return bundle.extractionState.fields[fieldKey].status !== "unanswered";
}

function candidateSupportsField(
  bundle: HiddenIntelligenceBundle,
  fieldKey: ExtractionFieldKey
) {
  return bundle.questionSelection.candidatePool.some(
    (candidate) => candidate.target.targetId === `field:${fieldKey}`
  );
}

function choosePreferredField(
  bundle: HiddenIntelligenceBundle,
  fieldKeys: readonly ExtractionFieldKey[]
) {
  for (const fieldKey of fieldKeys) {
    if (candidateSupportsField(bundle, fieldKey) && fieldNeedsClarification(bundle, fieldKey)) {
      return fieldKey;
    }
  }

  for (const fieldKey of fieldKeys) {
    if (fieldNeedsClarification(bundle, fieldKey)) {
      return fieldKey;
    }
  }

  for (const fieldKey of fieldKeys) {
    if (candidateSupportsField(bundle, fieldKey)) {
      return fieldKey;
    }
  }

  return fieldKeys[0] ?? null;
}

function foundationalTruthCount(bundle: HiddenIntelligenceBundle) {
  return FOUNDATIONAL_FIELD_KEYS.filter((fieldKey) =>
    fieldHasMeaningfulTruth(bundle, fieldKey)
  ).length;
}

function computeQuestionConfidenceScore(bundle: HiddenIntelligenceBundle) {
  const selectedQuestion = bundle.questionSelection.selectedQuestion;

  if (!selectedQuestion) {
    return bundle.extractionState.confidenceRollups.overall.score;
  }

  const fieldScores = selectedQuestion.relatedFieldKeys
    .map((fieldKey) => bundle.extractionState.fields[fieldKey].confidence.score)
    .filter((value) => Number.isFinite(value));

  if (fieldScores.length > 0) {
    return average(fieldScores);
  }

  const categoryScores = selectedQuestion.relatedCategoryKeys
    .map((categoryKey) => bundle.extractionState.confidenceRollups.categories[categoryKey]?.confidence.score)
    .filter((value): value is number => Number.isFinite(value));

  if (categoryScores.length > 0) {
    return average(categoryScores);
  }

  return bundle.extractionState.confidenceRollups.overall.score;
}

function defaultQuestionTypeForField(fieldKey: ExtractionFieldKey | null) {
  if (!fieldKey) {
    return null;
  }

  return getQuestionRegistryEntry(`field:${fieldKey}`)?.defaultQuestionType ?? null;
}

function mapQuestionStyleType(
  questionType: QuestionSelectionType | null,
  recoveryMode: boolean
): StartVisibleStrategistLog["questionStyleType"] {
  switch (questionType) {
    case "contradiction_resolution":
      return "contradiction";
    case "critical_unknown":
      return recoveryMode ? "recovery" : "unknown";
    case "branch_resolution":
      return "branch_resolution";
    case "overlay_confirmation":
      return "overlay_confirmation";
    case "assumption_confirmation":
      return "assumption_confirmation";
    case "readiness_blocker_resolution":
    case "roadmap_transition_readiness":
    case "execution_transition_readiness":
      return "readiness_blocker";
    default:
      return recoveryMode ? "recovery" : "narrowing";
  }
}

function isResolutionQuestionType(questionType: QuestionSelectionType | null) {
  return (
    questionType === "contradiction_resolution" ||
    questionType === "branch_resolution" ||
    questionType === "overlay_confirmation" ||
    questionType === "assumption_confirmation" ||
    questionType === "readiness_blocker_resolution" ||
    questionType === "roadmap_transition_readiness" ||
    questionType === "execution_transition_readiness"
  );
}

function isDetailedFieldKey(fieldKey: ExtractionFieldKey | null) {
  return fieldKey != null && DETAIL_FIELD_KEYS.has(fieldKey);
}

function shouldSurfaceBlockedContradiction(context: VisibleStrategistContext) {
  const blockedContradictions = context.bundle.extractionState.contradictions.filter(
    (item) => item.blocked
  );

  if (blockedContradictions.length === 0) {
    return false;
  }

  if (context.selectedQuestionType === "contradiction_resolution") {
    return false;
  }

  const architectureRelevant = blockedContradictions.some((item) =>
    item.linkedFieldKeys.some((fieldKey) =>
      ARCHITECTURE_CONTRADICTION_FIELD_KEYS.has(fieldKey)
    )
  );
  const highSeverity = blockedContradictions.some(
    (item) => item.severity === "critical" || item.severity === "high"
  );
  const hasFoundationalTruth = foundationalTruthCount(context.bundle) >= 1;

  if (!hasFoundationalTruth && !highSeverity) {
    return false;
  }

  if (highSeverity) {
    return true;
  }

  if (architectureRelevant && context.bundle.branchState.ambiguity.severity !== "none") {
    return true;
  }

  if (architectureRelevant && isDetailedFieldKey(context.primaryFieldKey)) {
    return true;
  }

  return architectureRelevant && foundationalTruthCount(context.bundle) >= 2;
}

function shouldSurfaceBranchAmbiguity(context: VisibleStrategistContext) {
  const ambiguity = context.bundle.branchState.ambiguity;

  if (!context.bundle.branchState.branchResolutionRequired) {
    return false;
  }

  if (context.selectedQuestionType === "branch_resolution") {
    return false;
  }

  const selectedAlreadyResolvingBranch =
    context.primaryFieldKey != null && BRANCH_RESOLVING_FIELD_KEYS.has(context.primaryFieldKey);
  const hasFoundationalTruth = foundationalTruthCount(context.bundle) >= 1;

  if (ambiguity.severity === "critical" || ambiguity.severity === "high") {
    return !selectedAlreadyResolvingBranch;
  }

  if (ambiguity.severity !== "moderate") {
    return false;
  }

  if (selectedAlreadyResolvingBranch) {
    return false;
  }

  return (
    ambiguity.blocksRoadmap &&
    hasFoundationalTruth &&
    (isDetailedFieldKey(context.primaryFieldKey) ||
      context.selectedQuestionType === "systems_integration_clarification" ||
      context.selectedQuestionType === "mvp_boundary_clarification" ||
      context.selectedQuestionType === "constraint_clarification" ||
      context.selectedQuestionType === "readiness_blocker_resolution")
  );
}

function hasActiveAiOverlay(bundle: HiddenIntelligenceBundle) {
  const aiOverlay = bundle.branchState.overlays["ai-copilot"];
  return aiOverlay.state === "active" || aiOverlay.state === "high-confidence active";
}

function selectEarlyNarrowingField(context: VisibleStrategistContext) {
  const flags = detectProductContextFlags(context.combinedContextText);
  const shouldPreferNarrowing =
    context.primaryFieldKey == null ||
    BROAD_FIELD_KEYS.has(context.primaryFieldKey) ||
    context.selectedQuestionType === "critical_unknown";

  if (!shouldPreferNarrowing || isResolutionQuestionType(context.selectedQuestionType)) {
    return null;
  }

  if (
    (flags.marketplace || context.primaryBranch === "Marketplace / Multi-Sided Platform") &&
    context.bundle.branchState.branchResolutionRequired
  ) {
    return null;
  }

  if (flags.crypto) {
    return choosePreferredField(context.bundle, [
      "desired_outcome",
      "primary_users",
      "data_dependencies"
    ]);
  }

  if (flags.ai || hasActiveAiOverlay(context.bundle)) {
    return choosePreferredField(context.bundle, [
      "primary_users",
      "core_workflow",
      "product_type"
    ]);
  }

  if (flags.analytics || context.primaryBranch === "Data / Analytics / Intelligence Platform") {
    return choosePreferredField(context.bundle, [
      "desired_outcome",
      "primary_users",
      "data_dependencies"
    ]);
  }

  if (flags.apparel || context.primaryBranch === "Commerce / Ecommerce") {
    return choosePreferredField(context.bundle, [
      "primary_buyers",
      "mvp_in_scope",
      "brand_direction"
    ]);
  }

  if (flags.saas || context.primaryBranch === "SaaS / Workflow Platform") {
    return choosePreferredField(context.bundle, [
      "primary_users",
      "core_workflow",
      "desired_outcome"
    ]);
  }

  if (context.primaryBranch === "Marketplace / Multi-Sided Platform") {
    return choosePreferredField(context.bundle, [
      "primary_users",
      "business_model",
      "core_workflow"
    ]);
  }

  if (flags.booking || context.primaryBranch === "Booking / Scheduling / Service Delivery") {
    return choosePreferredField(context.bundle, [
      "core_workflow",
      "primary_admins",
      "constraints"
    ]);
  }

  if (flags.internal || context.primaryBranch === "Internal Operations / Backoffice Tool") {
    return choosePreferredField(context.bundle, [
      "primary_admins",
      "primary_users",
      "core_workflow"
    ]);
  }

  return choosePreferredField(context.bundle, [
    "primary_users",
    "desired_outcome",
    "core_workflow"
  ]);
}

function compactFieldKeys(values: readonly (ExtractionFieldKey | null | undefined)[]) {
  return values.filter((value): value is ExtractionFieldKey => value != null);
}

function hasEnoughShapeForPracticalDiscovery(context: VisibleStrategistContext) {
  return (
    foundationalTruthCount(context.bundle) >= 2 ||
    (context.primaryBranch != null && context.questionConfidenceLevel !== "low")
  );
}

function selectPracticalDiscoveryField(context: VisibleStrategistContext) {
  if (!hasEnoughShapeForPracticalDiscovery(context)) {
    return null;
  }

  const flags = detectProductContextFlags(context.combinedContextText);
  const memory = context.rendererMemory;

  if (flags.crypto || flags.analytics || context.primaryBranch === "Data / Analytics / Intelligence Platform") {
    return choosePreferredField(
      context.bundle,
      compactFieldKeys([
        !memory.architectureDiscoveryAsked ? "systems_touched" : null,
        !memory.apiIntegrationDiscoveryAsked ? "data_dependencies" : null,
        !memory.adminSurfaceDiscoveryAsked ? "primary_admins" : null,
        !memory.apiIntegrationDiscoveryAsked ? "integrations" : null,
        !memory.customerPortalDiscoveryAsked ? "business_model" : null,
        !memory.experientialDiscoveryAsked ? "brand_direction" : null
      ])
    );
  }

  if (context.primaryBranch === "Marketplace / Multi-Sided Platform" || flags.marketplace) {
    return choosePreferredField(
      context.bundle,
      compactFieldKeys([
        !memory.architectureDiscoveryAsked ? "systems_touched" : null,
        !memory.adminSurfaceDiscoveryAsked ? "primary_admins" : null,
        !memory.apiIntegrationDiscoveryAsked ? "integrations" : null,
        "business_model"
      ])
    );
  }

  if (context.primaryBranch === "Booking / Scheduling / Service Delivery" || flags.booking) {
    return choosePreferredField(
      context.bundle,
      compactFieldKeys([
        !memory.architectureDiscoveryAsked ? "systems_touched" : null,
        !memory.adminSurfaceDiscoveryAsked ? "primary_admins" : null,
        !memory.apiIntegrationDiscoveryAsked ? "integrations" : null,
        "core_workflow"
      ])
    );
  }

  if (
    context.primaryBranch === "SaaS / Workflow Platform" ||
    context.primaryBranch === "Internal Operations / Backoffice Tool" ||
    flags.saas ||
    flags.internal
  ) {
    return choosePreferredField(
      context.bundle,
      compactFieldKeys([
        !memory.architectureDiscoveryAsked ? "systems_touched" : null,
        !memory.adminSurfaceDiscoveryAsked ? "primary_admins" : null,
        !memory.apiIntegrationDiscoveryAsked ? "integrations" : null,
        !memory.customerPortalDiscoveryAsked ? "business_model" : null,
        !memory.experientialDiscoveryAsked ? "brand_direction" : null
      ])
    );
  }

  if (context.primaryBranch === "Commerce / Ecommerce" || flags.apparel) {
    return choosePreferredField(
      context.bundle,
      compactFieldKeys([
        !memory.architectureDiscoveryAsked ? "systems_touched" : null,
        !memory.customerPortalDiscoveryAsked ? "business_model" : null,
        !memory.adminSurfaceDiscoveryAsked ? "primary_admins" : null,
        !memory.experientialDiscoveryAsked ? "brand_direction" : null
      ])
    );
  }

  return null;
}

function humanizeBranchFamily(branch: BranchFamily | null) {
  switch (branch) {
    case "Commerce / Ecommerce":
      return "commerce platform";
    case "SaaS / Workflow Platform":
      return "workflow platform";
    case "Marketplace / Multi-Sided Platform":
      return "marketplace";
    case "Internal Operations / Backoffice Tool":
      return "internal ops tool";
    case "Content / Community / Membership":
      return "content or community product";
    case "Booking / Scheduling / Service Delivery":
      return "booking or service platform";
    case "Hybrid / Composite System":
      return "hybrid product";
    case "Developer Platform / API / Infrastructure":
      return "developer platform";
    case "Data / Analytics / Intelligence Platform":
      return "data or analytics product";
    default:
      return "product";
  }
}

function buildDefaultRecoveryQuestion(context: VisibleStrategistContext) {
  const flags = detectProductContextFlags(context.combinedContextText);

  if (flags.crypto) {
    return {
      question:
        "Let's narrow this down - is this mainly for daily trading decisions, or for checking risk before someone buys?",
      renderedTargetId: "field:primary_users"
    };
  }

  if (flags.analytics || context.primaryBranch === "Data / Analytics / Intelligence Platform") {
    return {
      question:
        "Let's narrow this down - is this mainly for people watching performance every day, or for people deciding where to focus next?",
      renderedTargetId: "field:primary_users"
    };
  }

  if (flags.ai || hasActiveAiOverlay(context.bundle)) {
    return {
      question:
        "Let's narrow this down - is AI the product people come for, or is it helping them do an existing job faster?",
      renderedTargetId: "field:core_concept"
    };
  }

  if (flags.apparel || context.primaryBranch === "Commerce / Ecommerce") {
    return {
      question:
        "Let's narrow this down - is this mainly a focused brand storefront, or a broader shop people browse across?",
      renderedTargetId: "field:core_concept"
    };
  }

  if (context.primaryBranch === "SaaS / Workflow Platform" || flags.internal) {
    return {
      question:
        "Let's narrow this down - is this mainly a tool people use every day, or something they check only when something needs attention?",
      renderedTargetId: "field:core_concept"
    };
  }

  return {
    question:
      "Let's narrow this down - is this mainly a tool people use every day, or something they check only when they need an answer?",
    renderedTargetId: "field:core_concept"
  };
}

function isAnalyticsLike(
  context: VisibleStrategistContext,
  flags: ReturnType<typeof detectProductContextFlags>
) {
  return flags.crypto || flags.analytics || context.primaryBranch === "Data / Analytics / Intelligence Platform";
}

function renderSurfaceQuestion(
  context: VisibleStrategistContext,
  flags: ReturnType<typeof detectProductContextFlags>
) {
  if (isAnalyticsLike(context, flags)) {
    return "Does v1 need a public research surface, a logged-in dashboard, an admin review side, or just one of those to start?";
  }

  if (context.primaryBranch === "Marketplace / Multi-Sided Platform" || flags.marketplace) {
    return "Does v1 need a public marketplace, provider accounts, and an admin review side, or can one of those wait?";
  }

  if (context.primaryBranch === "Booking / Scheduling / Service Delivery" || flags.booking) {
    return "Does v1 need a public booking flow, a provider portal, and an admin side, or can one of those wait?";
  }

  if (
    context.primaryBranch === "SaaS / Workflow Platform" ||
    context.primaryBranch === "Internal Operations / Backoffice Tool" ||
    flags.saas ||
    flags.internal
  ) {
    return "Does v1 need just the working product, or also a customer portal, an admin side, and reporting?";
  }

  if (context.primaryBranch === "Commerce / Ecommerce" || flags.apparel) {
    return "Does v1 need only the storefront, or also customer accounts and an admin side to manage catalog and orders?";
  }

  return "Does v1 need just the main product surface, or also a logged-in area and an admin side?";
}

function renderIntegrationQuestion(
  context: VisibleStrategistContext,
  flags: ReturnType<typeof detectProductContextFlags>
) {
  if (isAnalyticsLike(context, flags)) {
    return "If this is tracking risk or unlocks, what needs to connect first: market data, research sources, alerts, or nothing external yet?";
  }

  if (context.primaryBranch === "Marketplace / Multi-Sided Platform" || flags.marketplace) {
    return "What needs to connect first: payments, messaging, or identity and verification?";
  }

  if (context.primaryBranch === "Booking / Scheduling / Service Delivery" || flags.booking) {
    return "Which integration matters first: calendar, payments, or messaging?";
  }

  if (context.primaryBranch === "SaaS / Workflow Platform" || flags.saas) {
    return "What needs to connect first: CRM, email, billing, or another core system?";
  }

  return "Which integration matters first: payments, messaging, calendar, or another core system?";
}

function renderDataDependencyQuestion(
  context: VisibleStrategistContext,
  flags: ReturnType<typeof detectProductContextFlags>
) {
  if (flags.crypto) {
    return "This may need outside market or token data - do you want v1 to pull from third-party sources, or start with data your team manages manually?";
  }

  if (flags.analytics || context.primaryBranch === "Data / Analytics / Intelligence Platform") {
    return "This might need outside data feeds - do you want the first version to pull them automatically, or start with data your team manages manually?";
  }

  if (context.primaryBranch === "SaaS / Workflow Platform" || flags.internal) {
    return "Will the first version rely on live product data, or can your team manage the key data manually at first?";
  }

  return "Does v1 depend on outside data, or can the first version start with data your team manages manually?";
}

function renderExperienceQuestion(
  context: VisibleStrategistContext,
  flags: ReturnType<typeof detectProductContextFlags>
) {
  if (isAnalyticsLike(context, flags)) {
    return "When someone lands on this, should it feel more trusted and research-heavy, or faster and more signal-driven?";
  }

  if (context.primaryBranch === "Commerce / Ecommerce" || flags.apparel) {
    return "When someone lands, should this feel more premium and editorial, or faster and easier to shop?";
  }

  if (
    context.primaryBranch === "SaaS / Workflow Platform" ||
    context.primaryBranch === "Internal Operations / Backoffice Tool" ||
    flags.saas ||
    flags.internal
  ) {
    return "Should this feel more fast and lightweight, or more trusted and operationally serious?";
  }

  return "Should this feel more simple and clean, or more fast and high-energy?";
}

function renderFieldQuestion(fieldKey: ExtractionFieldKey, context: VisibleStrategistContext) {
  const flags = detectProductContextFlags(context.combinedContextText);

  switch (fieldKey) {
    case "request_summary":
    case "core_concept":
      if (flags.ai || hasActiveAiOverlay(context.bundle)) {
        return "Is AI the product people come for, or is it helping them finish an existing workflow faster?";
      }

      if (flags.crypto) {
        return "What decision should this help users make first: when to buy, when to exit, or which tokens look risky?";
      }

      if (flags.analytics || context.primaryBranch === "Data / Analytics / Intelligence Platform") {
        return "What decision should this help users make first: where to focus, what to fix, or what to stop?";
      }

      if (flags.marketplace && flags.booking) {
        return "Is this mainly for booking one provider, or for helping people choose among many providers?";
      }

      if (flags.apparel || context.primaryBranch === "Commerce / Ecommerce") {
        return "Is this mainly a focused brand storefront, or a broader commerce experience people browse across?";
      }

      if (context.lowConfidenceRecoveryMode) {
        return buildDefaultRecoveryQuestion(context).question;
      }

      if (context.primaryBranch === "SaaS / Workflow Platform") {
        return "What should this software help someone do first: capture work, review work, or move work forward?";
      }

      return "What decision should this product help someone make first?";
    case "primary_branch":
    case "product_type":
      return renderBranchResolutionQuestion(context);
    case "primary_users":
      if (flags.crypto) {
        return "Is this for active traders making daily decisions, or investors checking risk before buying?";
      }

      if (flags.analytics || context.primaryBranch === "Data / Analytics / Intelligence Platform") {
        return "Is this for operators watching performance daily, or leaders checking where to focus next?";
      }

      if (context.primaryBranch === "Internal Operations / Backoffice Tool" || flags.internal) {
        return "Is this mainly for the team doing the work, or for managers overseeing it?";
      }

      if (context.primaryBranch === "SaaS / Workflow Platform") {
        return "Is this mainly for the operator doing the work, or the manager checking progress?";
      }

      return context.lowConfidenceRecoveryMode
        ? "Let's narrow this down - is this mainly for the person doing the work, or the person approving it?"
        : "Who has to win first here: the person doing the work, or the person checking the result?";
    case "primary_buyers":
      return "Who actually pays first: the end user, a team lead, or the business?";
    case "primary_admins":
      if (isAnalyticsLike(context, flags)) {
        return "Does your team need an admin side to review projects, manage scores, or publish research before anything goes live?";
      }

      if (context.primaryBranch === "Commerce / Ecommerce" || flags.apparel) {
        return "Does your team need an admin side just to manage orders and catalog, or also to control content and merchandising?";
      }

      return "Who runs this day to day: an ops team, an admin team, or the same people using it?";
    case "problem_statement":
      return "What is hurting most right now: wasted time, bad decisions, or missed revenue?";
    case "desired_outcome":
      if (flags.crypto) {
        return "What should improve first: confidence before buying, faster trade decisions, or clearer risk signals?";
      }

      if (flags.ai || hasActiveAiOverlay(context.bundle)) {
        return "What should improve first: speed, quality, or less manual work?";
      }

      if (flags.analytics || context.primaryBranch === "Data / Analytics / Intelligence Platform") {
        return "What decision should the dashboard help users make first: where to focus, what to fix, or what to stop?";
      }

      return "What should improve first: speed, clarity, or confidence?";
    case "success_criteria":
      return "What would prove v1 is working: more usage, better conversion, or fewer mistakes?";
    case "core_workflow":
      if (flags.ai || hasActiveAiOverlay(context.bundle)) {
        return "What should AI help someone do first: create something, decide something, or automate a repeated task?";
      }

      if (isAnalyticsLike(context, flags)) {
        return "When someone lands, should the first screen help them check one token, compare projects, or monitor a watchlist over time?";
      }

      if (flags.marketplace && flags.booking) {
        return "What happens first here: someone chooses a provider, books a slot, or confirms the service?";
      }

      if (flags.booking || context.primaryBranch === "Booking / Scheduling / Service Delivery") {
        return "What happens first here: someone picks a time, confirms a booking, or gets the service delivered?";
      }

      if (context.primaryBranch === "Marketplace / Multi-Sided Platform") {
        return "What happens first here: someone discovers supply, compares options, or commits to a transaction?";
      }

      return context.lowConfidenceRecoveryMode
        ? "Let's keep this small - what happens first here: someone submits something, reviews something, or completes something?"
        : "What happens first here: someone submits something, reviews something, or completes something?";
    case "business_model":
      if (isAnalyticsLike(context, flags)) {
        return "Is this mainly public research with a premium member area, or a fully logged-in product from day one?";
      }

      if (context.primaryBranch === "Marketplace / Multi-Sided Platform" || flags.marketplace) {
        return "Does the business make money from transaction fees, subscriptions, or service packages?";
      }

      if (context.primaryBranch === "Commerce / Ecommerce" || flags.apparel) {
        return "Will revenue come from direct product sales, subscriptions, or both?";
      }

      return "Will people pay for access, pay per transaction, or pay for a managed service?";
    case "mvp_in_scope":
      if (isAnalyticsLike(context, flags)) {
        return "What has to be there in v1: token pages, risk scores, unlock calendars, watchlists, or something else first?";
      }

      return "For v1, what absolutely has to work: discovery, decision support, or transaction flow?";
    case "mvp_out_of_scope":
      return "What can wait until later: collaboration, automation, or deeper analytics?";
    case "systems_touched":
      return context.lowConfidenceRecoveryMode
        ? "Does v1 need more than one surface right away, or can it start with one clear product surface?"
        : renderSurfaceQuestion(context, flags);
    case "integrations":
      return renderIntegrationQuestion(context, flags);
    case "data_dependencies":
      return renderDataDependencyQuestion(context, flags);
    case "constraints":
      return "Which constraint is real right now: speed to launch, accuracy, or compliance?";
    case "budget_constraints":
      return "Is the real constraint budget, headcount, or time?";
    case "timeline_constraints":
      return "Are you aiming for a hard launch date, or just the fastest safe first release?";
    case "brand_direction":
      return renderExperienceQuestion(context, flags);
    default:
      return null;
  }
}

function renderBranchResolutionQuestion(context: VisibleStrategistContext) {
  const competingBranches = context.bundle.branchState.ambiguity.competingBranches
    .map((candidate) => candidate.branch)
    .slice(0, 2);
  const [firstBranch, secondBranch] = competingBranches;

  if (
    competingBranches.includes("Marketplace / Multi-Sided Platform") &&
    competingBranches.includes("Booking / Scheduling / Service Delivery")
  ) {
    return "Is this a single-provider service, or are multiple providers offering services on the platform?";
  }

  if (
    competingBranches.includes("Commerce / Ecommerce") &&
    competingBranches.includes("Marketplace / Multi-Sided Platform")
  ) {
    return "Are you selling your own offering, or letting multiple sellers list theirs?";
  }

  if (
    competingBranches.includes("SaaS / Workflow Platform") &&
    competingBranches.includes("Internal Operations / Backoffice Tool")
  ) {
    return "Is this mainly for your internal team, or for external customers using it directly?";
  }

  if (
    competingBranches.includes("SaaS / Workflow Platform") &&
    competingBranches.includes("Data / Analytics / Intelligence Platform")
  ) {
    return "Is this mainly a workflow tool teams use daily, or an analytics product people use to make decisions?";
  }

  if (firstBranch && secondBranch) {
    return `Which is closer: a ${humanizeBranchFamily(firstBranch)}, or a ${humanizeBranchFamily(secondBranch)}?`;
  }

  if (context.primaryBranch === "Hybrid / Composite System") {
    return "What is the real product center: a workflow tool, a marketplace, or a data product?";
  }

  return "Which product shape is this really: a workflow tool, a marketplace, a commerce product, or something else?";
}

function renderContradictionQuestion(context: VisibleStrategistContext) {
  const contradictionId =
    context.bundle.questionSelection.selectedQuestionTarget?.contradictionId ??
    context.bundle.questionSelection.relatedContradictionIds[0] ??
    null;
  const contradiction = contradictionId
    ? context.bundle.extractionState.contradictions.find(
        (item) => item.contradictionId === contradictionId
      )
    : context.bundle.extractionState.contradictions.find((item) => item.blocked);
  const conflictingText = contradiction?.conflictingStatements.map((item) => normalizeText(item)) ?? [];

  if (
    conflictingText.some((item) => item.includes("marketplace")) &&
    conflictingText.some(
      (item) =>
        item.includes("single vendor") ||
        item.includes("one vendor") ||
        item.includes("single brand") ||
        item.includes("single provider")
    )
  ) {
    return "You mentioned a marketplace but only one provider - do you want a single-brand platform or multiple sellers on it?";
  }

  if (
    conflictingText.some((item) => item.includes("internal")) &&
    conflictingText.some((item) => item.includes("customer") || item.includes("external"))
  ) {
    return "Is this mainly an internal tool, or something customers use directly?";
  }

  if (
    conflictingText.some((item) => item.includes("booking") || item.includes("appointment")) &&
    conflictingText.some((item) => item.includes("marketplace") || item.includes("provider"))
  ) {
    return "Is this a single-provider service, or are multiple providers offering services on the platform?";
  }

  if (
    contradiction?.linkedFieldKeys.includes("mvp_in_scope") &&
    contradiction.linkedFieldKeys.includes("mvp_out_of_scope")
  ) {
    return "Should this capability be in v1, or should it wait until a later phase?";
  }

  if (
    contradiction?.linkedFieldKeys.includes("business_model") &&
    (context.primaryBranch === "Marketplace / Multi-Sided Platform" ||
      context.primaryBranch === "SaaS / Workflow Platform")
  ) {
    return "What is the real business model first: subscriptions, transaction revenue, or a service-led offering?";
  }

  if (
    contradiction?.linkedFieldKeys.some((fieldKey) =>
      fieldKey === "primary_users" || fieldKey === "primary_buyers" || fieldKey === "primary_admins"
    )
  ) {
    return "Who is the real first user here: the person doing the work, the manager, or the customer?";
  }

  if (
    contradiction?.linkedFieldKeys.some(
      (fieldKey) =>
        fieldKey === "systems_touched" ||
        fieldKey === "integrations" ||
        fieldKey === "data_dependencies"
    )
  ) {
    return "Does v1 need outside data and extra systems from day one, or should the first version stay more controlled?";
  }

  if (
    contradiction?.linkedFieldKeys.some(
      (fieldKey) =>
        fieldKey === "desired_outcome" ||
        fieldKey === "problem_statement" ||
        fieldKey === "success_criteria"
    )
  ) {
    return "What matters first here: helping someone make a better decision, complete a task, or monitor something over time?";
  }

  if (contradiction?.conflictingStatements.length && contradiction.conflictingStatements.length >= 2) {
    const left = truncate(cleanText(contradiction.conflictingStatements[0]), 54);
    const right = truncate(cleanText(contradiction.conflictingStatements[1]), 54);
    return `You said "${left}", but also "${right}" - which is actually true?`;
  }

  return "One thing does not line up yet - which version is actually true?";
}

function renderOverlayQuestion(overlayKey: BranchOverlayKey | null) {
  switch (overlayKey) {
    case "ai-copilot":
      return "Is AI part of the core product experience, or just a supporting feature behind the scenes?";
    case "multi-tenant-team-workspace":
      return "Does v1 need separate teams or workspaces with their own access, or is one shared space enough?";
    case "approval-workflow-governance":
      return "Does anything important need approval before it moves forward?";
    case "community-ugc":
      return "Will users create content here, or mostly consume what is already published?";
    case "commerce":
      return "Does money move through the product itself, or is payment handled outside it?";
    case "mobile-first-native-experience":
      return "Does this need to feel mobile-first on day one, or is web-first enough for v1?";
    case "compliance-security-sensitive-data":
      return "Will this handle sensitive or regulated data from day one?";
    case "international-localization":
      return "Does v1 need multiple languages, regions, or currencies?";
    default:
      return "Is this architectural detail part of the core product from day one, or only a later refinement?";
  }
}

function renderAssumptionQuestion(context: VisibleStrategistContext) {
  const assumptionId =
    context.bundle.questionSelection.selectedQuestionTarget?.assumptionId ??
    context.bundle.questionSelection.relatedAssumptionIds[0] ??
    null;
  const assumption = assumptionId
    ? context.bundle.extractionState.assumptions.find((item) => item.assumptionId === assumptionId)
    : context.bundle.extractionState.assumptions.find((item) => item.confirmationRequired);
  const statement = cleanText(assumption?.statement);

  if (!statement) {
    return "I may be inferring something important here - is that assumption actually right?";
  }

  const trimmedStatement = statement.replace(/^[Tt]hat\s+/, "");
  return context.lowConfidenceRecoveryMode
    ? `Let's test one assumption - is it true that ${truncate(trimmedStatement, 100)}?`
    : `I may be assuming that ${truncate(trimmedStatement, 100)} - is that right?`;
}

function renderReadinessQuestion(context: VisibleStrategistContext) {
  if (context.bundle.extractionState.contradictions.some((item) => item.blocked)) {
    return renderContradictionQuestion(context);
  }

  if (context.bundle.branchState.branchResolutionRequired) {
    return renderBranchResolutionQuestion(context);
  }

  const blockingTargetId = pickFirst<string>([
    context.bundle.questionSelection.roadmapBlockingQuestions[0]?.target.targetId,
    context.bundle.questionSelection.executionBlockingQuestions[0]?.target.targetId,
    context.selectedTargetId
  ]);

  const blockingFieldKey = pickFirst<ExtractionFieldKey>([
    targetFieldKeyFromTargetId(blockingTargetId),
    context.primaryFieldKey
  ]);

  if (blockingFieldKey) {
    return renderFieldQuestion(blockingFieldKey, context);
  }

  return "Before I move this forward, what still needs to be true first: the user, the workflow, or the MVP boundary?";
}

function acknowledgementFamilyFromTopic(
  topicCategory: RenderedTopicCategory,
  questionStyleType: QuestionStyleType
): RendererAcknowledgementFamily {
  switch (questionStyleType) {
    case "contradiction":
      return "contradiction";
    case "branch_resolution":
      return "branch_model";
    case "assumption_confirmation":
      return "assumption";
    case "overlay_confirmation":
      return "overlay";
    case "readiness_blocker":
      return "readiness";
    case "recovery":
      return "recovery";
    default:
      switch (topicCategory) {
        case "product_shape":
          return "product_shape";
        case "actors":
          return "actors";
        case "outcome":
          return "outcome";
        case "workflow":
          return "workflow";
        case "business_model":
          return "business_model";
        case "mvp_scope":
          return "mvp_scope";
        case "product_surfaces":
          return "product_surfaces";
        case "data_integrations":
          return "data_integrations";
        case "experience":
          return "experience";
        case "constraints":
          return "constraints";
        default:
          return "generic";
      }
  }
}

function leadInVariantForFamily(family: RendererAcknowledgementFamily) {
  switch (family) {
    case "contradiction":
      return "One thing does not line up yet.";
    case "branch_model":
      return "Before I go deeper, I need to lock the product model.";
    case "assumption":
      return "I want to verify one assumption.";
    case "overlay":
      return "One architecture detail matters before I keep going.";
    case "readiness":
      return "One blocker still matters before I move forward.";
    case "recovery":
      return "Let's make this concrete.";
    case "product_shape":
      return "I want to lock what this product really is.";
    case "actors":
      return "I want to lock who this has to win first.";
    case "outcome":
      return "I want to lock the first real win.";
    case "workflow":
      return "I want to lock what the first user action really is.";
    case "business_model":
      return "I want to lock how this creates value.";
    case "mvp_scope":
      return "I want to lock what belongs in the first version.";
    case "product_surfaces":
      return "I want to lock which product surfaces v1 really needs.";
    case "data_integrations":
      return "I want to lock the first data and integration boundary.";
    case "experience":
      return "I want to lock how this should feel on first use.";
    case "constraints":
      return "I want to lock the real constraint.";
    default:
      return "I want to sharpen one important decision.";
  }
}

function buildStrategistLeadIn(args: {
  context: VisibleStrategistContext;
  calibration: VisibleCalibrationDecision;
  question: string;
}): RenderedLeadIn {
  const acknowledgementFamily = acknowledgementFamilyFromTopic(
    args.calibration.renderedTopicCategory,
    args.calibration.questionStyleType
  );
  const questionSignature = normalizeQuestionSignature(args.question);
  const repeatedTopic =
    args.context.rendererMemory.lastRenderedTopicCategory === args.calibration.renderedTopicCategory &&
    args.calibration.renderedTopicCategory !== "contradiction" &&
    args.calibration.renderedTopicCategory !== "branch_model";
  const repeatedStyle =
    args.context.rendererMemory.lastRenderedQuestionStyle === args.calibration.questionStyleType &&
    args.calibration.questionStyleType !== "contradiction" &&
    args.calibration.questionStyleType !== "branch_resolution";
  const recentlyUsedFamily =
    acknowledgementFamily === args.context.rendererMemory.lastAcknowledgementFamily ||
    args.context.rendererMemory.recentAcknowledgementFamilies.includes(acknowledgementFamily);
  const nearDuplicateQuestion =
    questionSignature.length > 0 &&
    args.context.rendererMemory.recentQuestionSignatures.includes(questionSignature);

  if (
    recentlyUsedFamily ||
    nearDuplicateQuestion ||
    (repeatedTopic && repeatedStyle) ||
    (args.context.rendererMemory.lastResponsePatternFamily === "lead_in_plus_question" &&
      repeatedTopic)
  ) {
    return {
      text: null,
      family: acknowledgementFamily,
      responsePatternFamily: "question_only",
      repeatedPhrasePrevented: true
    };
  }

  return {
    text: leadInVariantForFamily(acknowledgementFamily),
    family: acknowledgementFamily,
    responsePatternFamily: "lead_in_plus_question",
    repeatedPhrasePrevented: false
  };
}

function buildRenderedDiscoveryFlags(args: {
  question: string;
  topicCategory: RenderedTopicCategory;
  fieldKey: ExtractionFieldKey | null;
}) {
  const normalized = normalizeText(args.question);

  return {
    architectureDiscoveryAsked:
      args.topicCategory === "product_surfaces" ||
      normalized.includes("public research surface") ||
      normalized.includes("public marketplace") ||
      normalized.includes("public booking flow") ||
      normalized.includes("logged-in dashboard") ||
      normalized.includes("customer portal") ||
      normalized.includes("admin side"),
    adminSurfaceDiscoveryAsked:
      args.fieldKey === "primary_admins" ||
      normalized.includes("admin side") ||
      normalized.includes("manage scores") ||
      normalized.includes("review projects") ||
      normalized.includes("manage catalog and orders"),
    customerPortalDiscoveryAsked:
      normalized.includes("logged-in dashboard") ||
      normalized.includes("customer portal") ||
      normalized.includes("customer accounts"),
    apiIntegrationDiscoveryAsked:
      args.topicCategory === "data_integrations" ||
      normalized.includes("outside data") ||
      normalized.includes("third-party") ||
      normalized.includes("external") ||
      normalized.includes("integration") ||
      normalized.includes("market data") ||
      normalized.includes("calendar") ||
      normalized.includes("payments") ||
      normalized.includes("crm") ||
      normalized.includes("email"),
    experientialDiscoveryAsked:
      args.topicCategory === "experience" ||
      normalized.includes("when someone lands") ||
      normalized.includes("first screen") ||
      normalized.includes("should this feel"),
    suggestionOffered:
      normalized.includes("may need") ||
      normalized.includes("might need") ||
      normalized.includes("or just one of those to start") ||
      normalized.includes("or can one of those wait") ||
      normalized.includes("or start with")
  };
}

function buildBaseContext(
  bundle: HiddenIntelligenceBundle,
  latestUserMessage: string,
  rendererMemory: RendererSessionMemory
): VisibleStrategistContext {
  const selectedQuestion = bundle.questionSelection.selectedQuestion;
  const selectedTargetId =
    bundle.questionSelection.selectedQuestionTarget?.targetId ??
    selectedQuestion?.target.targetId ??
    null;
  const selectedQuestionType = bundle.questionSelection.selectedQuestionType;
  const questionConfidenceScore = computeQuestionConfidenceScore(bundle);
  const questionConfidenceLevel = confidenceLevelFromScore(questionConfidenceScore);

  return {
    bundle,
    latestUserMessage,
    combinedContextText: buildCombinedContextText(bundle, latestUserMessage),
    selectedQuestionType,
    selectedTargetId,
    primaryFieldKey: resolvePrimaryFieldKey(bundle),
    questionConfidenceScore,
    questionConfidenceLevel,
    primaryBranch: bundle.branchState.primaryBranch?.branch ?? null,
    lowConfidenceRecoveryMode:
      !isResolutionQuestionType(selectedQuestionType) &&
      (selectedQuestion?.followUpMode === "recovery" ||
        hasUncertaintySignal(latestUserMessage) ||
        questionConfidenceLevel === "low" ||
        !selectedQuestion),
    visibleConversationState: determineVisibleConversationState(bundle),
    rendererMemory
  };
}

function buildCalibrationDecision(context: VisibleStrategistContext): VisibleCalibrationDecision {
  const selectedOverlayKey =
    context.bundle.questionSelection.selectedQuestionTarget?.overlayKey ?? null;
  const calibrationNotes: string[] = [];
  const selectedTopicCategory = resolveRenderedTopicCategory({
    questionType: context.selectedQuestionType,
    fieldKey: context.primaryFieldKey,
    overlayKey: selectedOverlayKey
  });
  let effectiveQuestionType = context.selectedQuestionType;
  let effectiveTargetId = context.selectedTargetId;
  let effectiveFieldKey = context.primaryFieldKey;
  let effectiveOverlayKey = selectedOverlayKey;
  let forcedEarlyNarrowing = false;
  let contradictionSurfaced = false;
  let branchAmbiguitySurfaced = false;
  let intakeGroundingBlockedShaping = false;
  let recentCategorySuppressed = false;
  let repeatedCategoryPrevented = false;

  if (shouldSurfaceBlockedContradiction(context)) {
    effectiveQuestionType = "contradiction_resolution";
    effectiveTargetId =
      context.bundle.questionSelection.relatedContradictionIds[0] != null
        ? `contradiction:${context.bundle.questionSelection.relatedContradictionIds[0]}`
        : "category:contradictions";
    contradictionSurfaced = true;
    calibrationNotes.push("Surfaced a blocked contradiction before continuing broader exploration.");
  } else if (shouldSurfaceBranchAmbiguity(context)) {
    effectiveQuestionType = "branch_resolution";
    effectiveTargetId = "branch:ambiguity";
    branchAmbiguitySurfaced = true;
    calibrationNotes.push("Surfaced architecture-relevant branch ambiguity before detailed questioning.");
  } else {
    const repeatedTopic =
      selectedTopicCategory != null &&
      context.rendererMemory.lastRenderedTopicCategory === selectedTopicCategory;
    const recentCategoryShouldSuppress = shouldSuppressRecentCategory(
      context,
      selectedTopicCategory,
      context.primaryFieldKey
    );
    const groundingField = chooseGroundingField(
      context,
      recentCategoryShouldSuppress ? selectedTopicCategory : null
    );
    const narrowedFieldKey = selectEarlyNarrowingField(context);

    if (context.visibleConversationState === "intake_grounding") {
      const selectedIsGroundingRelevant =
        isGroundingTopicCategory(selectedTopicCategory) ||
        effectiveQuestionType === "critical_unknown" ||
        effectiveQuestionType === "partial_truth_narrowing";

      if (recentCategoryShouldSuppress) {
        recentCategorySuppressed = true;
        repeatedCategoryPrevented = true;
      }

      if (
        groundingField &&
        (!selectedIsGroundingRelevant ||
          recentCategoryShouldSuppress ||
          context.primaryFieldKey == null ||
          !fieldHasMeaningfulTruth(context.bundle, context.primaryFieldKey))
      ) {
        effectiveFieldKey = groundingField;
        effectiveTargetId = `field:${groundingField}`;
        effectiveQuestionType =
          defaultQuestionTypeForField(groundingField) ??
          effectiveQuestionType ??
          "critical_unknown";
        intakeGroundingBlockedShaping = !selectedIsGroundingRelevant;
        forcedEarlyNarrowing = context.primaryFieldKey == null || BROAD_FIELD_KEYS.has(context.primaryFieldKey);
        calibrationNotes.push(
          recentCategoryShouldSuppress
            ? `Suppressed a recently answered ${selectedTopicCategory} question and moved to ${groundingField}.`
            : `Held the conversation in intake grounding and moved to ${groundingField}.`
        );
      } else if (!effectiveFieldKey && context.lowConfidenceRecoveryMode) {
        const defaultRecovery = buildDefaultRecoveryQuestion(context);
        effectiveFieldKey = targetFieldKeyFromTargetId(defaultRecovery.renderedTargetId);
        effectiveTargetId = defaultRecovery.renderedTargetId;
        effectiveQuestionType =
          defaultQuestionTypeForField(effectiveFieldKey) ?? "critical_unknown";
        calibrationNotes.push("Used a low-confidence recovery question instead of falling back.");
      }
    } else {
      const practicalDiscoveryField = selectPracticalDiscoveryField(context);

      if (
        practicalDiscoveryField &&
        practicalDiscoveryField !== context.primaryFieldKey &&
        (repeatedTopic ||
          context.primaryFieldKey == null ||
          BROAD_FIELD_KEYS.has(context.primaryFieldKey))
      ) {
        forcedEarlyNarrowing = true;
        effectiveFieldKey = practicalDiscoveryField;
        effectiveTargetId = `field:${practicalDiscoveryField}`;
        effectiveQuestionType =
          defaultQuestionTypeForField(practicalDiscoveryField) ??
          effectiveQuestionType ??
          "systems_integration_clarification";
        calibrationNotes.push(
          `Moved earlier into practical product discovery around ${practicalDiscoveryField}.`
        );
      } else if (narrowedFieldKey && narrowedFieldKey !== context.primaryFieldKey) {
        forcedEarlyNarrowing = true;
        effectiveFieldKey = narrowedFieldKey;
        effectiveTargetId = `field:${narrowedFieldKey}`;
        effectiveQuestionType =
          defaultQuestionTypeForField(narrowedFieldKey) ??
          effectiveQuestionType ??
          "partial_truth_narrowing";
        calibrationNotes.push(
          `Forced earlier narrowing toward ${narrowedFieldKey} instead of staying broad.`
        );
      } else if (!effectiveFieldKey && context.lowConfidenceRecoveryMode) {
        const defaultRecovery = buildDefaultRecoveryQuestion(context);
        effectiveFieldKey = targetFieldKeyFromTargetId(defaultRecovery.renderedTargetId);
        effectiveTargetId = defaultRecovery.renderedTargetId;
        effectiveQuestionType =
          defaultQuestionTypeForField(effectiveFieldKey) ?? "critical_unknown";
        calibrationNotes.push("Used a low-confidence recovery question instead of falling back.");
      }
    }
  }

  const renderedTopicCategory = resolveRenderedTopicCategory({
    questionType: effectiveQuestionType,
    fieldKey: effectiveFieldKey,
    overlayKey: effectiveOverlayKey
  });

  return {
    effectiveQuestionType,
    effectiveTargetId,
    effectiveFieldKey,
    effectiveOverlayKey,
    questionStyleType: mapQuestionStyleType(
      effectiveQuestionType,
      context.lowConfidenceRecoveryMode &&
        !contradictionSurfaced &&
        !branchAmbiguitySurfaced
    ),
    questionConfidenceScore: context.questionConfidenceScore,
    questionConfidenceLevel: context.questionConfidenceLevel,
    forcedEarlyNarrowing,
    contradictionSurfaced,
    branchAmbiguitySurfaced,
    lowConfidenceRecoveryMode: context.lowConfidenceRecoveryMode,
    renderedTopicCategory,
    visibleConversationState: context.visibleConversationState,
    intakeGroundingBlockedShaping,
    recentCategorySuppressed,
    repeatedCategoryPrevented,
    calibrationNotes
  };
}

function renderQuestionFromCalibration(
  context: VisibleStrategistContext,
  calibration: VisibleCalibrationDecision
): RenderedVisibleQuestion | null {
  let question: string | null = null;
  let renderedTargetId = calibration.effectiveTargetId;

  switch (calibration.effectiveQuestionType) {
    case "contradiction_resolution":
      question = renderContradictionQuestion(context);
      break;
    case "branch_resolution":
      question = renderBranchResolutionQuestion(context);
      renderedTargetId = "branch:ambiguity";
      break;
    case "overlay_confirmation":
      question = renderOverlayQuestion(calibration.effectiveOverlayKey);
      renderedTargetId = calibration.effectiveOverlayKey
        ? `overlay:${calibration.effectiveOverlayKey}`
        : renderedTargetId;
      break;
    case "assumption_confirmation":
      question = renderAssumptionQuestion(context);
      break;
    case "readiness_blocker_resolution":
    case "roadmap_transition_readiness":
    case "execution_transition_readiness":
      question = renderReadinessQuestion(context);
      break;
    default:
      if (calibration.effectiveFieldKey) {
        question = renderFieldQuestion(calibration.effectiveFieldKey, context);
        renderedTargetId = `field:${calibration.effectiveFieldKey}`;
      } else if (calibration.lowConfidenceRecoveryMode) {
        const defaultRecovery = buildDefaultRecoveryQuestion(context);
        question = defaultRecovery.question;
        renderedTargetId = defaultRecovery.renderedTargetId;
      }
      break;
  }

  if (!cleanText(question)) {
    return null;
  }

  const renderedQuestionText = cleanText(question);

  const leadIn = buildStrategistLeadIn({
    context,
    calibration,
    question: renderedQuestionText
  });
  const discoveryFlags = buildRenderedDiscoveryFlags({
    question: renderedQuestionText,
    topicCategory: calibration.renderedTopicCategory,
    fieldKey: calibration.effectiveFieldKey
  });

  return {
    question: renderedQuestionText,
    leadIn: leadIn.text,
    styleType: calibration.questionStyleType,
    confidenceScore: calibration.questionConfidenceScore,
    confidenceLevel: calibration.questionConfidenceLevel,
    renderedTargetId,
    renderedQuestionType: calibration.effectiveQuestionType,
    forcedEarlyNarrowing: calibration.forcedEarlyNarrowing,
    contradictionSurfaced: calibration.contradictionSurfaced,
    branchAmbiguitySurfaced: calibration.branchAmbiguitySurfaced,
    lowConfidenceRecoveryMode: calibration.lowConfidenceRecoveryMode,
    renderedTopicCategory: calibration.renderedTopicCategory,
    repeatedPhrasePrevented: leadIn.repeatedPhrasePrevented,
    echoSuppressed: !hasQuoteEcho(renderedQuestionText),
    echoReplayPrevented: !hasQuoteEcho(renderedQuestionText),
    architectureDiscoveryAsked: discoveryFlags.architectureDiscoveryAsked,
    adminSurfaceDiscoveryAsked: discoveryFlags.adminSurfaceDiscoveryAsked,
    customerPortalDiscoveryAsked: discoveryFlags.customerPortalDiscoveryAsked,
    apiIntegrationDiscoveryAsked: discoveryFlags.apiIntegrationDiscoveryAsked,
    experientialDiscoveryAsked: discoveryFlags.experientialDiscoveryAsked,
    suggestionOffered: discoveryFlags.suggestionOffered,
    visibleConversationState: calibration.visibleConversationState,
    intakeGroundingBlockedShaping: calibration.intakeGroundingBlockedShaping,
    recentCategorySuppressed: calibration.recentCategorySuppressed,
    repeatedCategoryPrevented: calibration.repeatedCategoryPrevented,
    shapeLanguageBlocked: calibration.visibleConversationState !== "product_shaping",
    calibrationNotes: calibration.calibrationNotes
  };
}

function buildVisibleStrategistLog(args: {
  enabled: boolean;
  usedHidden: boolean;
  visibleConversationState: VisibleConversationState;
  greetingModeActive: boolean;
  greetingQuestionOnly: boolean;
  bundle: HiddenIntelligenceBundle | null;
  renderedTargetSelected: string | null;
  renderedQuestionType: QuestionSelectionType | null;
  questionStyleType: QuestionStyleType;
  questionConfidenceScore: number | null;
  questionConfidenceLevel: ConfidenceLevel;
  forcedEarlyNarrowing: boolean;
  contradictionSurfaced: boolean;
  branchAmbiguitySurfaced: boolean;
  lowConfidenceRecoveryMode: boolean;
  renderedTopicCategory: RenderedTopicCategory;
  repeatedPhrasePrevented: boolean;
  echoSuppressed: boolean;
  echoReplayPrevented: boolean;
  architectureDiscoveryAsked: boolean;
  adminSurfaceDiscoveryAsked: boolean;
  customerPortalDiscoveryAsked: boolean;
  apiIntegrationDiscoveryAsked: boolean;
  experientialDiscoveryAsked: boolean;
  suggestionOffered: boolean;
  intakeGroundingBlockedShaping: boolean;
  recentCategorySuppressed: boolean;
  repeatedCategoryPrevented: boolean;
  shapeLanguageBlocked: boolean;
  fallbackUsed: boolean;
  fallbackPhrasingUsed: boolean;
  fallbackReason: string | null;
  preservedGreetingFlow: boolean;
}) {
  return {
    enabled: args.enabled,
    usedHidden: args.usedHidden,
    visibleConversationState: args.visibleConversationState,
    greetingModeActive: args.greetingModeActive,
    greetingQuestionOnly: args.greetingQuestionOnly,
    hiddenTargetSelected:
      args.bundle?.questionSelection.selectedQuestionTarget?.targetId ??
      args.bundle?.questionSelection.selectedQuestion?.target.targetId ??
      null,
    renderedTargetSelected: args.renderedTargetSelected,
    hiddenQuestionType: args.bundle?.questionSelection.selectedQuestionType ?? null,
    renderedQuestionType: args.renderedQuestionType,
    questionStyleType: args.questionStyleType,
    questionConfidenceLevel: args.questionConfidenceLevel,
    questionConfidenceScore: args.questionConfidenceScore,
    forcedEarlyNarrowing: args.forcedEarlyNarrowing,
    contradictionSurfaced: args.contradictionSurfaced,
    branchAmbiguitySurfaced: args.branchAmbiguitySurfaced,
    lowConfidenceRecoveryMode: args.lowConfidenceRecoveryMode,
    renderedTopicCategory: args.renderedTopicCategory,
    repeatedPhrasePrevented: args.repeatedPhrasePrevented,
    echoSuppressed: args.echoSuppressed,
    echoReplayPrevented: args.echoReplayPrevented,
    architectureDiscoveryAsked: args.architectureDiscoveryAsked,
    adminSurfaceDiscoveryAsked: args.adminSurfaceDiscoveryAsked,
    customerPortalDiscoveryAsked: args.customerPortalDiscoveryAsked,
    apiIntegrationDiscoveryAsked: args.apiIntegrationDiscoveryAsked,
    experientialDiscoveryAsked: args.experientialDiscoveryAsked,
    suggestionOffered: args.suggestionOffered,
    intakeGroundingBlockedShaping: args.intakeGroundingBlockedShaping,
    recentCategorySuppressed: args.recentCategorySuppressed,
    repeatedCategoryPrevented: args.repeatedCategoryPrevented,
    shapeLanguageBlocked: args.shapeLanguageBlocked,
    fallbackUsed: args.fallbackUsed,
    fallbackPhrasingUsed: args.fallbackPhrasingUsed,
    fallbackReason: args.fallbackReason,
    preservedGreetingFlow: args.preservedGreetingFlow,
    branchAmbiguityState: args.bundle?.branchState.ambiguity.severity ?? null,
    contradictionBlockerPresent:
      args.bundle?.extractionState.contradictions.some((item) => item.blocked) ?? false,
    unknownBlockerPresent:
      args.bundle?.extractionState.unknowns.some(
        (item) => !item.resolved && item.blockingStage !== "none"
      ) ?? false,
    roadmapReadinessState:
      args.bundle?.questionSelection.roadmapGate.state ??
      args.bundle?.extractionState.roadmapReadiness.state ??
      null,
    executionReadinessState:
      args.bundle?.questionSelection.executionGate.state ??
      args.bundle?.extractionState.executionReadiness.state ??
      null
  } satisfies StartVisibleStrategistLog;
}

function createFallbackDecision(args: {
  enabled: boolean;
  bundle: HiddenIntelligenceBundle | null;
  fallbackReason: string;
  questionConfidenceScore?: number | null;
  questionConfidenceLevel?: ConfidenceLevel;
}) {
  return {
    enabled: args.enabled,
    usedHidden: false,
    bundle: args.bundle,
    renderedQuestion: null,
    renderedTargetId: null,
    renderedQuestionType: null,
    strategistLeadIn: null,
    blockingReason: args.bundle?.questionSelection.blockingReason ?? null,
    whyChosen: args.bundle?.questionSelection.whyChosen ?? null,
    fallbackUsed: true,
    fallbackReason: args.fallbackReason,
    log: buildVisibleStrategistLog({
      enabled: args.enabled,
      usedHidden: false,
      visibleConversationState: null,
      greetingModeActive: false,
      greetingQuestionOnly: false,
      bundle: args.bundle,
      renderedTargetSelected: null,
      renderedQuestionType: null,
      questionStyleType: "fallback",
      questionConfidenceScore: args.questionConfidenceScore ?? null,
      questionConfidenceLevel: args.questionConfidenceLevel ?? null,
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
      shapeLanguageBlocked: false,
      fallbackUsed: true,
      fallbackPhrasingUsed: true,
      fallbackReason: args.fallbackReason,
      preservedGreetingFlow: false
    })
  } satisfies StartVisibleStrategistDecision;
}

export function buildStartVisibleStrategistDecision(
  args: StartVisibleStrategistInput
): StartVisibleStrategistDecision {
  const enabled = isStartVisibleIntelligenceEnabled();

  if (!enabled) {
    return createFallbackDecision({
      enabled: false,
      bundle: null,
      fallbackReason: "visible_intelligence_flag_disabled"
    });
  }

  try {
    const artifacts = createArtifactsFromPlanningThreadState(
      args.threadState,
      args.preparedBy ?? "Live Behavior Calibration Pass v1"
    );
    const bundle = rebuildIntelligenceStateFromArtifacts(artifacts, {
      preparedBy: args.preparedBy ?? "Live Behavior Calibration Pass v1"
    });
    const context = buildBaseContext(
      bundle,
      args.latestUserMessage,
      collectRendererMemory(args.threadState.messages)
    );
    const calibration = buildCalibrationDecision(context);
    const rendered = renderQuestionFromCalibration(context, calibration);

    if (!rendered) {
      return createFallbackDecision({
        enabled: true,
        bundle,
        fallbackReason: "calibration_no_renderable_question",
        questionConfidenceScore: calibration.questionConfidenceScore,
        questionConfidenceLevel: calibration.questionConfidenceLevel
      });
    }

    return {
      enabled: true,
      usedHidden: true,
      bundle,
      renderedQuestion: rendered.question,
      renderedTargetId: rendered.renderedTargetId,
      renderedQuestionType: rendered.renderedQuestionType,
      strategistLeadIn: rendered.leadIn,
      blockingReason: bundle.questionSelection.blockingReason ?? null,
      whyChosen:
        [bundle.questionSelection.whyChosen, ...rendered.calibrationNotes]
          .filter(Boolean)
          .join(" ")
          .trim() || null,
      fallbackUsed: false,
      fallbackReason: null,
      log: buildVisibleStrategistLog({
        enabled: true,
        usedHidden: true,
        visibleConversationState: rendered.visibleConversationState,
        greetingModeActive: false,
        greetingQuestionOnly: false,
        bundle,
        renderedTargetSelected: rendered.renderedTargetId,
        renderedQuestionType: rendered.renderedQuestionType,
        questionStyleType: rendered.styleType,
        questionConfidenceScore: rendered.confidenceScore,
        questionConfidenceLevel: rendered.confidenceLevel,
        forcedEarlyNarrowing: rendered.forcedEarlyNarrowing,
        contradictionSurfaced: rendered.contradictionSurfaced,
        branchAmbiguitySurfaced: rendered.branchAmbiguitySurfaced,
        lowConfidenceRecoveryMode: rendered.lowConfidenceRecoveryMode,
        renderedTopicCategory: rendered.renderedTopicCategory,
        repeatedPhrasePrevented: rendered.repeatedPhrasePrevented,
        echoSuppressed: rendered.echoSuppressed,
        echoReplayPrevented: rendered.echoReplayPrevented,
        architectureDiscoveryAsked: rendered.architectureDiscoveryAsked,
        adminSurfaceDiscoveryAsked: rendered.adminSurfaceDiscoveryAsked,
        customerPortalDiscoveryAsked: rendered.customerPortalDiscoveryAsked,
        apiIntegrationDiscoveryAsked: rendered.apiIntegrationDiscoveryAsked,
        experientialDiscoveryAsked: rendered.experientialDiscoveryAsked,
        suggestionOffered: rendered.suggestionOffered,
        intakeGroundingBlockedShaping: rendered.intakeGroundingBlockedShaping,
        recentCategorySuppressed: rendered.recentCategorySuppressed,
        repeatedCategoryPrevented: rendered.repeatedCategoryPrevented,
        shapeLanguageBlocked: rendered.shapeLanguageBlocked,
        fallbackUsed: false,
        fallbackPhrasingUsed: false,
        fallbackReason: null,
        preservedGreetingFlow: false
      })
    } satisfies StartVisibleStrategistDecision;
  } catch {
    return createFallbackDecision({
      enabled: true,
      bundle: null,
      fallbackReason: "hidden_visible_switch_error"
    });
  }
}
