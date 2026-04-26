import type { HiddenIntelligenceBundle } from "@/lib/intelligence/adapters";
import { DEFAULT_CONVERSATION_POLICY } from "./policy.ts";
import {
  buildConversationLeadIn,
  questionTargetsForKey
} from "./session.ts";
import type {
  ConversationQuestionKey,
  ConversationQuestionPlan,
  ConversationSessionState,
  ConversationSlotMemory,
  ConversationSlotPath,
  ConversationTurnGuidance
} from "./types.ts";

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function slotHasMeaningfulValue(slot: ConversationSlotMemory) {
  if (slot.value == null) {
    return false;
  }

  return Array.isArray(slot.value) ? slot.value.length > 0 : slot.value.trim().length > 0;
}

function slotIsConflicted(slot: ConversationSlotMemory) {
  return slot.status === "conflicted";
}

function questionWasAlreadyAsked(
  state: ConversationSessionState,
  questionKey: ConversationQuestionKey
) {
  return state.questionHistory.some(
    (entry) => entry.questionKey === questionKey && entry.status !== "conflicted"
  );
}

function buildContextText(args: {
  state: ConversationSessionState;
  hiddenBundle?: HiddenIntelligenceBundle | null;
}) {
  return [
    args.state.productCategory,
    args.state.problemStatement,
    args.state.outcomePromise,
    args.state.audience.buyerPersonas.join(" "),
    args.state.audience.operatorPersonas.join(" "),
    args.hiddenBundle?.extractionState.requestSummary.requestedChangeOrInitiative ?? "",
    args.hiddenBundle?.extractionState.fields.core_concept.value?.summary ?? ""
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isCryptoContext(text: string) {
  return /\b(?:crypto|token|tokens|wallet|wallets|trader|trading|pre-sales|presale|risk engine)\b/.test(
    text
  );
}

function isRestaurantContext(text: string) {
  return /\b(?:restaurant|restaurants|pos|multi-location|store performance|sales platform)\b/.test(
    text
  );
}

function isAudienceFilled(state: ConversationSessionState) {
  return (
    slotHasMeaningfulValue(state.slots["audience.buyerPersonas"]) ||
    slotHasMeaningfulValue(state.slots["audience.operatorPersonas"])
  );
}

function questionShouldBeSuppressed(
  state: ConversationSessionState,
  questionKey: ConversationQuestionKey
) {
  const targets = questionTargetsForKey(questionKey);
  const hasConflict = targets.some((slotPath) => slotIsConflicted(state.slots[slotPath]));

  if (hasConflict) {
    return false;
  }

  if (
    DEFAULT_CONVERSATION_POLICY.questionPlanner.neverAskSameQuestionKeyTwiceUnlessConflict &&
    questionWasAlreadyAsked(state, questionKey)
  ) {
    return true;
  }

  if (
    questionKey === "buyer_or_operator_persona" &&
    DEFAULT_CONVERSATION_POLICY.audienceModel.rules.some(
      (rule) => rule.ifAudienceAlreadyFilled && rule.doNotAskAudienceAgain
    ) &&
    isAudienceFilled(state)
  ) {
    return true;
  }

  if (!DEFAULT_CONVERSATION_POLICY.questionPlanner.neverAskForFilledSlot) {
    return false;
  }

  if (questionKey === "buyer_or_operator_persona") {
    return isAudienceFilled(state);
  }

  return targets.every((slotPath) => slotHasMeaningfulValue(state.slots[slotPath]));
}

function buildQuestion(
  questionKey: ConversationQuestionKey,
  contextText: string
): string | null {
  const isCrypto = isCryptoContext(contextText);
  const isRestaurant = isRestaurantContext(contextText);

  switch (questionKey) {
    case "product_category":
      return "What kind of product are you building first: a workflow tool, a customer-facing platform, or something else?";
    case "buyer_or_operator_persona":
      if (isCrypto) {
        return "Who is this mainly for first: crypto investors, active traders, or someone else?";
      }

      if (isRestaurant) {
        return "Who needs this most first: owners, managers, or the same person doing both jobs?";
      }

      return "Who is this mainly for first: the buyer, the operator, or the same person?";
    case "problem_statement":
      if (isCrypto) {
        return "What is the first high-stakes problem here: spotting risky pre-sales, deciding when to buy, or comparing opportunities?";
      }

      if (isRestaurant) {
        return "What has to get better first for owners and managers: multi-location reporting, the first POS-linked report, or more reliable daily sales visibility?";
      }

      return "What is the main problem this needs to solve first?";
    case "outcome_promise":
      if (isCrypto) {
        return "What should this help them do first: avoid risky pre-sales, compare opportunities faster, or act with more confidence?";
      }

      if (isRestaurant) {
        return "What should improve first: daily reporting, faster decisions, or more reliable store-level visibility?";
      }

      return "What should improve first for the person using this?";
    case "must_have_features":
      if (isRestaurant) {
        return "For v1, what has to work first: multi-location reporting, the first POS connector, or MVP sales reporting needs?";
      }

      return "For v1, what absolutely has to work first?";
    case "constraints_and_compliance":
      if (isCrypto) {
        return "Are there any real constraints from compliance, market-data quality, or launch speed?";
      }

      return "What constraint is real right now: compliance, timeline, budget, or something else?";
    case "integrations_and_data_sources":
      if (isRestaurant) {
        return "What system has to connect first: the first POS connector, accounting, payroll, or something else?";
      }

      return "What data source or integration has to be there on day one?";
    case "monetization":
      return "How do you expect this to make money first?";
    case "nice_to_have_features":
      return "What can wait until after the first version works?";
    default:
      return null;
  }
}

export function planNextConversationQuestion(args: {
  state: ConversationSessionState;
  hiddenBundle?: HiddenIntelligenceBundle | null;
}): ConversationQuestionPlan | null {
  const contextText = buildContextText(args);

  for (const questionKey of DEFAULT_CONVERSATION_POLICY.questionPlanner.priorityOrder) {
    if (questionShouldBeSuppressed(args.state, questionKey)) {
      continue;
    }

    const question = buildQuestion(questionKey, contextText);

    if (!question) {
      continue;
    }

    return {
      questionKey,
      targetSlotPaths: questionTargetsForKey(questionKey),
      question
    };
  }

  return null;
}

export function buildConversationTurnGuidance(args: {
  state: ConversationSessionState;
  updatedSlotPaths: readonly ConversationSlotPath[];
  hiddenBundle?: HiddenIntelligenceBundle | null;
}): ConversationTurnGuidance {
  const questionPlan = planNextConversationQuestion({
    state: args.state,
    hiddenBundle: args.hiddenBundle
  });
  const leadIn = buildConversationLeadIn({
    state: args.state,
    updatedSlotPaths: args.updatedSlotPaths
  });
  const greetingModeActive =
    args.updatedSlotPaths.includes("identity.founderName") &&
    cleanText(args.state.founderName).length > 0;

  return {
    state: args.state,
    leadIn,
    question: questionPlan?.question ?? null,
    questionKey: questionPlan?.questionKey ?? null,
    targetSlotPaths: questionPlan?.targetSlotPaths ?? [],
    greetingModeActive
  };
}
