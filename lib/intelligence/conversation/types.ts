import { z } from "zod";

export const conversationSlotStatusSchema = z.enum([
  "empty",
  "partial",
  "filled",
  "confirmed",
  "inferred",
  "conflicted"
]);

export type ConversationSlotStatus = z.infer<typeof conversationSlotStatusSchema>;

export const conversationAudienceSlotSchema = z.enum([
  "buyerPersonas",
  "operatorPersonas",
  "endCustomerPersonas",
  "adminPersonas"
]);

export type ConversationAudienceSlot = z.infer<typeof conversationAudienceSlotSchema>;

export const conversationQuestionKeySchema = z.enum([
  "product_category",
  "buyer_or_operator_persona",
  "problem_statement",
  "outcome_promise",
  "must_have_features",
  "constraints_and_compliance",
  "integrations_and_data_sources",
  "monetization",
  "nice_to_have_features"
]);

export type ConversationQuestionKey = z.infer<typeof conversationQuestionKeySchema>;

export const conversationQuestionHistoryStatusSchema = z.enum([
  "asked",
  "answered",
  "partial",
  "conflicted",
  "skipped"
]);

export type ConversationQuestionHistoryStatus = z.infer<
  typeof conversationQuestionHistoryStatusSchema
>;

export const conversationSlotPathSchema = z.enum([
  "identity.founderName",
  "product.productCategory",
  "audience.buyerPersonas",
  "audience.operatorPersonas",
  "audience.endCustomerPersonas",
  "audience.adminPersonas",
  "problem.problemStatement",
  "outcome.outcomePromise",
  "scope.mustHaveFeatures",
  "constraints.constraintsAndCompliance",
  "systems.integrationsAndDataSources",
  "business.monetization",
  "scope.niceToHaveFeatures"
]);

export type ConversationSlotPath = z.infer<typeof conversationSlotPathSchema>;

const conversationSlotValueSchema = z.union([
  z.string().trim().min(1),
  z.array(z.string().trim().min(1)).min(1)
]);

export type ConversationSlotValue = z.infer<typeof conversationSlotValueSchema>;

export const conversationSlotMemorySchema = z
  .object({
    slotPath: conversationSlotPathSchema,
    value: conversationSlotValueSchema.nullable(),
    status: conversationSlotStatusSchema,
    confidence: z.number().min(0).max(1),
    evidence: z.array(z.string().trim().min(1)).max(8),
    askedCount: z.number().int().min(0),
    lastQuestionKey: conversationQuestionKeySchema.nullable()
  })
  .strict();

export type ConversationSlotMemory = z.infer<typeof conversationSlotMemorySchema>;

export const conversationQuestionHistoryEntrySchema = z
  .object({
    questionKey: conversationQuestionKeySchema,
    targetSlotPaths: z.array(conversationSlotPathSchema).min(1),
    askedTurnId: z.string().trim().min(1),
    answeredTurnId: z.string().trim().min(1).nullable(),
    status: conversationQuestionHistoryStatusSchema
  })
  .strict();

export type ConversationQuestionHistoryEntry = z.infer<
  typeof conversationQuestionHistoryEntrySchema
>;

const audienceWriteMapSchema = z
  .object({
    buyerPersonas: z.array(z.string().trim().min(1)).optional(),
    operatorPersonas: z.array(z.string().trim().min(1)).optional(),
    endCustomerPersonas: z.array(z.string().trim().min(1)).optional(),
    adminPersonas: z.array(z.string().trim().min(1)).optional()
  })
  .strict();

const audienceRuleSchema = z
  .object({
    ifUserSays: z.string().trim().min(1).optional(),
    ifProductTypeLooksB2COrSelfServe: z.boolean().optional(),
    copyBuyerToOperatorWhenSameHumanUsesProduct: z.boolean().optional(),
    writeTo: z.union([z.array(conversationAudienceSlotSchema), audienceWriteMapSchema]).optional(),
    markStatus: conversationSlotStatusSchema.optional(),
    ifAudienceAlreadyFilled: z.boolean().optional(),
    doNotAskAudienceAgain: z.boolean().optional()
  })
  .strict();

export const conversationPolicySchema = z
  .object({
    identity: z
      .object({
        assistantName: z.string().trim().min(1),
        greetingWithName: z.string().trim().min(1),
        greetingWithoutName: z.string().trim().min(1)
      })
      .strict(),
    forbiddenPhrases: z.array(z.string().trim().min(1)).min(1),
    audienceModel: z
      .object({
        slots: z.array(conversationAudienceSlotSchema).min(1),
        rules: z.array(audienceRuleSchema).min(1)
      })
      .strict(),
    questionPlanner: z
      .object({
        askOneQuestionAtATime: z.boolean(),
        neverAskForFilledSlot: z.boolean(),
        neverAskSameQuestionKeyTwiceUnlessConflict: z.boolean(),
        priorityOrder: z.array(conversationQuestionKeySchema).min(1),
        advanceRule: z.string().trim().min(1)
      })
      .strict()
  })
  .strict();

export type ConversationPolicy = z.infer<typeof conversationPolicySchema>;

export const conversationSessionStateSchema = z
  .object({
    version: z.literal(1),
    assistantName: z.string().trim().min(1),
    founderName: z.string().trim().min(1).nullable(),
    audience: z
      .object({
        buyerPersonas: z.array(z.string().trim().min(1)),
        operatorPersonas: z.array(z.string().trim().min(1)),
        endCustomerPersonas: z.array(z.string().trim().min(1)),
        adminPersonas: z.array(z.string().trim().min(1))
      })
      .strict(),
    productCategory: z.string().trim().min(1).nullable(),
    problemStatement: z.string().trim().min(1).nullable(),
    outcomePromise: z.string().trim().min(1).nullable(),
    mustHaveFeatures: z.array(z.string().trim().min(1)),
    constraintsAndCompliance: z.array(z.string().trim().min(1)),
    integrationsAndDataSources: z.array(z.string().trim().min(1)),
    monetization: z.string().trim().min(1).nullable(),
    niceToHaveFeatures: z.array(z.string().trim().min(1)),
    slots: z
      .object({
        "identity.founderName": conversationSlotMemorySchema,
        "product.productCategory": conversationSlotMemorySchema,
        "audience.buyerPersonas": conversationSlotMemorySchema,
        "audience.operatorPersonas": conversationSlotMemorySchema,
        "audience.endCustomerPersonas": conversationSlotMemorySchema,
        "audience.adminPersonas": conversationSlotMemorySchema,
        "problem.problemStatement": conversationSlotMemorySchema,
        "outcome.outcomePromise": conversationSlotMemorySchema,
        "scope.mustHaveFeatures": conversationSlotMemorySchema,
        "constraints.constraintsAndCompliance": conversationSlotMemorySchema,
        "systems.integrationsAndDataSources": conversationSlotMemorySchema,
        "business.monetization": conversationSlotMemorySchema,
        "scope.niceToHaveFeatures": conversationSlotMemorySchema
      })
      .strict(),
    questionHistory: z.array(conversationQuestionHistoryEntrySchema),
    processedUserTurnIds: z.array(z.string().trim().min(1)),
    lastUpdatedAt: z.string().trim().min(1).nullable()
  })
  .strict();

export type ConversationSessionState = z.infer<typeof conversationSessionStateSchema>;

export type ConversationSessionBuildResult = {
  state: ConversationSessionState;
  updatedSlotPaths: ConversationSlotPath[];
};

export type ConversationQuestionPlan = {
  questionKey: ConversationQuestionKey;
  targetSlotPaths: ConversationSlotPath[];
  question: string;
};

export type ConversationTurnGuidance = {
  state: ConversationSessionState;
  leadIn: string | null;
  question: string | null;
  questionKey: ConversationQuestionKey | null;
  targetSlotPaths: ConversationSlotPath[];
  greetingModeActive: boolean;
};
