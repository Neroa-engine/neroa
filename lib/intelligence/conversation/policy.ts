import { conversationPolicySchema, type ConversationPolicy } from "./types.ts";

export const DEFAULT_CONVERSATION_POLICY = conversationPolicySchema.parse({
  identity: {
    assistantName: "Neroa",
    greetingWithName:
      "Hi {founderName} — I’m Neroa. I’ll help turn your idea into a clean roadmap and architecture.",
    greetingWithoutName:
      "Hi — I’m Neroa. I’ll help turn your idea into a clean roadmap and architecture."
  },
  forbiddenPhrases: ["first intentional user"],
  audienceModel: {
    slots: [
      "buyerPersonas",
      "operatorPersonas",
      "endCustomerPersonas",
      "adminPersonas"
    ],
    rules: [
      {
        ifUserSays: "main customer is <audience>",
        writeTo: ["buyerPersonas"],
        markStatus: "filled"
      },
      {
        ifProductTypeLooksB2COrSelfServe: true,
        copyBuyerToOperatorWhenSameHumanUsesProduct: true
      },
      {
        ifUserSays: "owners and managers",
        writeTo: {
          buyerPersonas: ["owners"],
          operatorPersonas: ["managers"]
        }
      },
      {
        ifAudienceAlreadyFilled: true,
        doNotAskAudienceAgain: true
      }
    ]
  },
  questionPlanner: {
    askOneQuestionAtATime: true,
    neverAskForFilledSlot: true,
    neverAskSameQuestionKeyTwiceUnlessConflict: true,
    priorityOrder: [
      "product_category",
      "buyer_or_operator_persona",
      "problem_statement",
      "outcome_promise",
      "must_have_features",
      "constraints_and_compliance",
      "integrations_and_data_sources",
      "monetization",
      "nice_to_have_features"
    ],
    advanceRule:
      "When a slot is answered, acknowledge it and move to the next highest-impact unknown slot."
  }
});

export function loadConversationPolicy(value: unknown): ConversationPolicy {
  const result = conversationPolicySchema.safeParse(value);
  return result.success ? result.data : DEFAULT_CONVERSATION_POLICY;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function sanitizeConversationText(value: string) {
  let sanitized = value;

  for (const phrase of DEFAULT_CONVERSATION_POLICY.forbiddenPhrases) {
    sanitized = sanitized.replace(new RegExp(escapeRegExp(phrase), "gi"), "primary audience");
  }

  return sanitized;
}

export function buildConversationGreeting(founderName?: string | null) {
  const template = founderName
    ? DEFAULT_CONVERSATION_POLICY.identity.greetingWithName
    : DEFAULT_CONVERSATION_POLICY.identity.greetingWithoutName;

  return template.replace("{founderName}", founderName ?? "").trim();
}
