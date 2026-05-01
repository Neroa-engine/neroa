import { z } from "zod";
import {
  getNeroaOneOutcomeLaneDefinition,
  validateNeroaOneOutcomeQueueItemForLane
} from "./outcome-lanes.ts";
import {
  neroaOneOutcomeQueueItemSchema,
  type NeroaOneOutcomeQueueItem
} from "./outcome-queues.ts";
import {
  getAllowedOutputReviewNextDestinations,
  neroaOneOutputReviewLane,
  neroaOneOutputReviewRecordSchema,
  type NeroaOneOutputReviewDecision,
  type NeroaOneOutputReviewRecord
} from "./output-review.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

const CUSTOMER_FOLLOW_UP_UNSAFE_CONTENT_PATTERN = new RegExp(
  [
    "internalPromptDraft",
    "promptText",
    "raw worker instructions?",
    "raw_worker_output",
    "protectedAreas",
    "protected file details?",
    "model routing",
    "selectedEngine",
    "worker secret",
    "futureDigitalOceanWorkerTarget",
    "futurePromptServiceTarget",
    "futureRepairServiceTarget",
    ['legacy', 'browser', 'extension'].join("\\s+"),
    ['side-panel', 'runtime', 'messaging'].join("\\s+"),
    ['chrome', 'storage'].join("\\."),
    ['browser', 'runtime'].join("\\."),
    ['active', 'Tab'].join(""),
    "audit-only notes?",
    "api key",
    "access token",
    "secret token",
    "codex_cli",
    "codex_cloud",
    "claude_code",
    "manual_operator",
    "future_engine"
  ].join("|"),
  "i"
);

const FILE_PATH_DETAIL_PATTERN =
  /\b(?:[A-Za-z]:\\[^\s,;]+|(?:\.{0,2}[\\/]|\/)[^\s,;]+|[\w.-]+\.(?:ts|tsx|js|jsx|mjs|cjs|json|md|sql|yml|yaml))\b/g;
const SUMMARY_SEGMENT_SPLIT_PATTERN = /(?<=[.!?])\s+|\s*[;\n]+\s*/;

export const NEROA_ONE_CUSTOMER_FOLLOW_UP_SOURCE_TYPES = [
  "needs_customer_answer",
  "blocked_missing_information",
  "customer_followup"
] as const;

export const NEROA_ONE_CUSTOMER_FOLLOW_UP_ITEM_STATUSES = [
  "draft",
  "ready_for_customer",
  "waiting_for_customer",
  "answered",
  "canceled",
  "archived",
  "failed"
] as const;

export const NEROA_ONE_CUSTOMER_FOLLOW_UP_TYPES = [
  "clarification_question",
  "missing_information",
  "customer_decision_needed",
  "scope_confirmation",
  "output_review_followup",
  "blocked_work_notice",
  "other"
] as const;

export const NEROA_ONE_CUSTOMER_FOLLOW_UP_ALLOWED_RESPONSE_TYPES = [
  "free_text",
  "yes_no",
  "approve_reject",
  "select_one",
  "upload_required",
  "none"
] as const;

export const neroaOneCustomerFollowUpSourceTypeSchema = z.enum(
  NEROA_ONE_CUSTOMER_FOLLOW_UP_SOURCE_TYPES
);
export const neroaOneCustomerFollowUpItemStatusSchema = z.enum(
  NEROA_ONE_CUSTOMER_FOLLOW_UP_ITEM_STATUSES
);
export const neroaOneCustomerFollowUpTypeSchema = z.enum(
  NEROA_ONE_CUSTOMER_FOLLOW_UP_TYPES
);
export const neroaOneCustomerFollowUpAllowedResponseTypeSchema = z.enum(
  NEROA_ONE_CUSTOMER_FOLLOW_UP_ALLOWED_RESPONSE_TYPES
);
export const neroaOneCustomerFollowUpAcceptedOutcomeLaneIdSchema = z.enum([
  "needs_customer_answer",
  "blocked_missing_information"
]);
export const neroaOneCustomerFollowUpSourceLaneIdSchema = z.enum([
  "needs_customer_answer",
  "blocked_missing_information",
  "output_review"
]);

export type NeroaOneCustomerFollowUpSourceType = z.infer<
  typeof neroaOneCustomerFollowUpSourceTypeSchema
>;
export type NeroaOneCustomerFollowUpItemStatus = z.infer<
  typeof neroaOneCustomerFollowUpItemStatusSchema
>;
export type NeroaOneCustomerFollowUpType = z.infer<
  typeof neroaOneCustomerFollowUpTypeSchema
>;
export type NeroaOneCustomerFollowUpAllowedResponseType = z.infer<
  typeof neroaOneCustomerFollowUpAllowedResponseTypeSchema
>;
export type NeroaOneCustomerFollowUpAcceptedOutcomeLaneId = z.infer<
  typeof neroaOneCustomerFollowUpAcceptedOutcomeLaneIdSchema
>;
export type NeroaOneCustomerFollowUpSourceLaneId = z.infer<
  typeof neroaOneCustomerFollowUpSourceLaneIdSchema
>;

export const neroaOneFutureCustomerFollowUpServiceTargetSchema = z
  .object({
    deploymentProvider: z.literal("digitalocean"),
    serviceName: trimmedStringSchema,
    queueName: trimmedStringSchema,
    serviceType: z.literal("future_customer_follow_up_service"),
    readyForDispatch: z.literal(false),
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOneFutureCustomerFollowUpServiceTarget = z.infer<
  typeof neroaOneFutureCustomerFollowUpServiceTargetSchema
>;

export const neroaOneCustomerFollowUpItemSchema = z
  .object({
    followUpItemId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    sourceLaneId: neroaOneCustomerFollowUpSourceLaneIdSchema,
    sourceType: neroaOneCustomerFollowUpSourceTypeSchema,
    sourceId: trimmedStringSchema,
    status: neroaOneCustomerFollowUpItemStatusSchema,
    followUpType: neroaOneCustomerFollowUpTypeSchema,
    customerQuestion: trimmedStringSchema,
    customerSafeContext: trimmedStringSchema,
    allowedResponseType: neroaOneCustomerFollowUpAllowedResponseTypeSchema,
    internalReason: trimmedStringSchema,
    createdAt: trimmedStringSchema,
    updatedAt: trimmedStringSchema,
    futureCustomerFollowUpServiceTarget: neroaOneFutureCustomerFollowUpServiceTargetSchema
  })
  .strict();

export type NeroaOneCustomerFollowUpItem = z.infer<
  typeof neroaOneCustomerFollowUpItemSchema
>;

export const neroaOneCustomerSafeCustomerFollowUpItemViewSchema = z
  .object({
    followUpItemId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    sourceLaneId: neroaOneCustomerFollowUpSourceLaneIdSchema,
    sourceType: neroaOneCustomerFollowUpSourceTypeSchema,
    sourceId: trimmedStringSchema,
    status: neroaOneCustomerFollowUpItemStatusSchema,
    followUpType: neroaOneCustomerFollowUpTypeSchema,
    customerQuestion: trimmedStringSchema,
    customerSafeContext: trimmedStringSchema,
    allowedResponseType: neroaOneCustomerFollowUpAllowedResponseTypeSchema,
    createdAt: trimmedStringSchema,
    updatedAt: trimmedStringSchema
  })
  .strict();

export type NeroaOneCustomerSafeCustomerFollowUpItemView = z.infer<
  typeof neroaOneCustomerSafeCustomerFollowUpItemViewSchema
>;

export const neroaOneCustomerFollowUpLaneDefinitionSchema = z
  .object({
    laneId: z.literal("customer_follow_up"),
    backendOnly: z.literal(true),
    extractionReady: z.literal(true),
    independentlyReplaceable: z.literal(true),
    sideEffectLight: z.literal(true),
    uiDecoupled: z.literal(true),
    exposesCustomerSafeProjectionOnly: z.literal(true),
    storesFollowUpItemsNow: z.literal(false),
    routesCommandCenterNow: z.literal(false),
    writesPersistenceNow: z.literal(false),
    acceptedOutcomeLaneIds: z.tuple([
      z.literal("needs_customer_answer"),
      z.literal("blocked_missing_information")
    ]),
    acceptedOutputReviewDecisions: z.tuple([z.literal("customer_followup")]),
    acceptedSourceTypes: z.tuple([
      z.literal("needs_customer_answer"),
      z.literal("blocked_missing_information"),
      z.literal("customer_followup")
    ]),
    allowedStatuses: z.tuple([
      z.literal("draft"),
      z.literal("ready_for_customer"),
      z.literal("waiting_for_customer"),
      z.literal("answered"),
      z.literal("canceled"),
      z.literal("archived"),
      z.literal("failed")
    ]),
    supportedFollowUpTypes: z.tuple([
      z.literal("clarification_question"),
      z.literal("missing_information"),
      z.literal("customer_decision_needed"),
      z.literal("scope_confirmation"),
      z.literal("output_review_followup"),
      z.literal("blocked_work_notice"),
      z.literal("other")
    ]),
    allowedResponseTypes: z.tuple([
      z.literal("free_text"),
      z.literal("yes_no"),
      z.literal("approve_reject"),
      z.literal("select_one"),
      z.literal("upload_required"),
      z.literal("none")
    ]),
    displayPurposeInternal: trimmedStringSchema,
    internalOnlyNotes: stringListSchema.min(1),
    futureCustomerFollowUpServiceTarget: z
      .object({
        serviceName: trimmedStringSchema,
        queueName: trimmedStringSchema,
        notes: stringListSchema.min(1)
      })
      .strict()
  })
  .strict();

export type NeroaOneCustomerFollowUpLaneDefinition = z.infer<
  typeof neroaOneCustomerFollowUpLaneDefinitionSchema
>;

export type NeroaOneCustomerFollowUpOutcomeValidationResult =
  | {
      allowed: true;
      lane: NeroaOneCustomerFollowUpLaneDefinition;
      sourceLaneId: NeroaOneCustomerFollowUpAcceptedOutcomeLaneId;
      sourceType: NeroaOneCustomerFollowUpAcceptedOutcomeLaneId;
      sourceItem: NeroaOneOutcomeQueueItem;
      requiredDestinations: readonly string[];
    }
  | {
      allowed: false;
      lane: NeroaOneCustomerFollowUpLaneDefinition;
      sourceType: string;
      reason: string;
    };

export type NeroaOneCustomerFollowUpOutputReviewDecisionValidationResult =
  | {
      allowed: true;
      lane: NeroaOneCustomerFollowUpLaneDefinition;
      reviewLane: typeof neroaOneOutputReviewLane;
      decision: "customer_followup";
      requiredDestinations: readonly string[];
    }
  | {
      allowed: false;
      lane: NeroaOneCustomerFollowUpLaneDefinition;
      reviewLane: typeof neroaOneOutputReviewLane;
      decision: NeroaOneOutputReviewDecision;
      reason: string;
    };

export type NeroaOneCustomerFollowUpOutputReviewValidationResult =
  | {
      allowed: true;
      lane: NeroaOneCustomerFollowUpLaneDefinition;
      reviewLane: typeof neroaOneOutputReviewLane;
      review: NeroaOneOutputReviewRecord;
    }
  | {
      allowed: false;
      lane: NeroaOneCustomerFollowUpLaneDefinition;
      reviewLane: typeof neroaOneOutputReviewLane;
      reason: string;
    };

export interface NeroaOneCustomerFollowUpStorageAdapter {
  saveCustomerFollowUpItem(item: NeroaOneCustomerFollowUpItem): Promise<void>;
  getCustomerFollowUpItemById(
    followUpItemId: string
  ): Promise<NeroaOneCustomerFollowUpItem | null>;
  listCustomerFollowUpItemsByTaskId(taskId: string): Promise<NeroaOneCustomerFollowUpItem[]>;
  listCustomerFollowUpItemsBySourceId(
    sourceId: string
  ): Promise<NeroaOneCustomerFollowUpItem[]>;
}

export const neroaOneCustomerFollowUpLane =
  neroaOneCustomerFollowUpLaneDefinitionSchema.parse({
    laneId: "customer_follow_up",
    backendOnly: true,
    extractionReady: true,
    independentlyReplaceable: true,
    sideEffectLight: true,
    uiDecoupled: true,
    exposesCustomerSafeProjectionOnly: true,
    storesFollowUpItemsNow: false,
    routesCommandCenterNow: false,
    writesPersistenceNow: false,
    acceptedOutcomeLaneIds: ["needs_customer_answer", "blocked_missing_information"],
    acceptedOutputReviewDecisions: ["customer_followup"],
    acceptedSourceTypes: [
      "needs_customer_answer",
      "blocked_missing_information",
      "customer_followup"
    ],
    allowedStatuses: [
      "draft",
      "ready_for_customer",
      "waiting_for_customer",
      "answered",
      "canceled",
      "archived",
      "failed"
    ],
    supportedFollowUpTypes: [
      "clarification_question",
      "missing_information",
      "customer_decision_needed",
      "scope_confirmation",
      "output_review_followup",
      "blocked_work_notice",
      "other"
    ],
    allowedResponseTypes: [
      "free_text",
      "yes_no",
      "approve_reject",
      "select_one",
      "upload_required",
      "none"
    ],
    displayPurposeInternal:
      "Defines the backend-only Neroa One customer follow-up contract for customer-safe items produced by customer-resolution outcome lanes and output review follow-up decisions.",
    internalOnlyNotes: [
      "This lane is modular-monolith infrastructure only for now and must remain typed, backend-only, side-effect-light, UI-decoupled, and independently replaceable.",
      "This lane must not wire Command Center, Strategy Room, Build Room, persistence, or execution behavior.",
      "Customer-safe follow-up items must never expose internal prompt text, raw worker instructions, protected file details, model routing, worker secrets, legacy extension runtime details, audit-only notes, or file-path leakage."
    ],
    futureCustomerFollowUpServiceTarget: {
      serviceName: "neroa-one-customer-follow-up-service",
      queueName: "neroa-one.customer-follow-up",
      notes: [
        "Future DigitalOcean customer follow-up services may persist, retrieve, and dispatch follow-up items here without changing the contract.",
        "Current lane remains contract-only and must not wire customer UI, answer collection, or response reconciliation."
      ]
    }
  });

function normalizeText(value: string | null | undefined) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function normalizeStringList(values: readonly string[] | null | undefined) {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => normalizeText(value))
        .filter((value): value is string => Boolean(value))
    )
  );
}

function assertCustomerSafeFollowUpText(text: string) {
  if (CUSTOMER_FOLLOW_UP_UNSAFE_CONTENT_PATTERN.test(text)) {
    throw new Error(
      "Customer follow-up text must not expose internal execution, worker, runtime, or audit-only details."
    );
  }

  return text;
}

function stripProtectedFollowUpDetails(text: string) {
  return normalizeText(text.replace(FILE_PATH_DETAIL_PATTERN, "internal detail"));
}

function sanitizeCustomerSafeFollowUpText(text: string) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return "";
  }

  const safeSegments = normalized
    .split(SUMMARY_SEGMENT_SPLIT_PATTERN)
    .map((segment) => stripProtectedFollowUpDetails(segment))
    .filter(
      (segment) => Boolean(segment) && !CUSTOMER_FOLLOW_UP_UNSAFE_CONTENT_PATTERN.test(segment)
    );

  return normalizeText(safeSegments.join(" "));
}

function buildRejectedOutcomeValidationResult(
  sourceType: string,
  reason: string
): NeroaOneCustomerFollowUpOutcomeValidationResult {
  return {
    allowed: false,
    lane: neroaOneCustomerFollowUpLane,
    sourceType,
    reason:
      normalizeText(reason) ||
      `Source ${sourceType} cannot create a customer follow-up item.`
  };
}

function buildRejectedOutputReviewDecisionValidationResult(
  decision: NeroaOneOutputReviewDecision,
  reason: string
): NeroaOneCustomerFollowUpOutputReviewDecisionValidationResult {
  return {
    allowed: false,
    lane: neroaOneCustomerFollowUpLane,
    reviewLane: neroaOneOutputReviewLane,
    decision,
    reason:
      normalizeText(reason) ||
      `Output review decision ${decision} cannot create a customer follow-up item.`
  };
}

function buildRejectedOutputReviewValidationResult(
  reason: string
): NeroaOneCustomerFollowUpOutputReviewValidationResult {
  return {
    allowed: false,
    lane: neroaOneCustomerFollowUpLane,
    reviewLane: neroaOneOutputReviewLane,
    reason:
      normalizeText(reason) ||
      "Output review is not eligible for customer follow-up item creation."
  };
}

function buildOutcomeSourceId(item: NeroaOneOutcomeQueueItem) {
  const timestampPart = normalizeText(item.createdAt).replace(/[^0-9TZ]/g, "");
  return `${item.analyzerOutcome}:${item.taskId}:${timestampPart}`;
}

function buildCustomerFollowUpItemId(args: {
  sourceLaneId: NeroaOneCustomerFollowUpSourceLaneId;
  sourceId: string;
  createdAt: string;
}) {
  const timestampPart = normalizeText(args.createdAt).replace(/[^0-9TZ]/g, "");
  return `${args.sourceLaneId}:${args.sourceId}:follow-up:${timestampPart}`;
}

function resolveOutcomeFollowUpType(
  sourceType: NeroaOneCustomerFollowUpAcceptedOutcomeLaneId,
  followUpType: NeroaOneCustomerFollowUpType | null | undefined
) {
  if (followUpType) {
    return neroaOneCustomerFollowUpTypeSchema.parse(followUpType);
  }

  switch (sourceType) {
    case "needs_customer_answer":
      return "clarification_question";
    case "blocked_missing_information":
      return "missing_information";
  }
}

function resolveOutputReviewFollowUpType(
  followUpType: NeroaOneCustomerFollowUpType | null | undefined
) {
  return followUpType
    ? neroaOneCustomerFollowUpTypeSchema.parse(followUpType)
    : "output_review_followup";
}

function resolveAllowedResponseType(
  allowedResponseType: NeroaOneCustomerFollowUpAllowedResponseType | null | undefined
) {
  return allowedResponseType
    ? neroaOneCustomerFollowUpAllowedResponseTypeSchema.parse(allowedResponseType)
    : "free_text";
}

function getDefaultCustomerQuestionForOutcomeItem(item: NeroaOneOutcomeQueueItem) {
  const primaryPrompt =
    normalizeText(item.readinessBlockers[0]) || normalizeText(item.customerFacingSummary);

  if (primaryPrompt) {
    return primaryPrompt;
  }

  return item.analyzerOutcome === "needs_customer_answer"
    ? "Please provide the clarification needed before work can continue."
    : "Please provide the missing information needed before work can continue.";
}

function getDefaultCustomerSafeContextForOutcomeItem(item: NeroaOneOutcomeQueueItem) {
  return (
    normalizeText(item.customerFacingSummary) ||
    "This request is waiting for customer follow-up before backend work can continue."
  );
}

function getDefaultCustomerQuestionForOutputReview(review: NeroaOneOutputReviewRecord) {
  return (
    normalizeText(review.customerVisibleSummary) ||
    "Please provide the follow-up needed before work can continue."
  );
}

function getDefaultCustomerSafeContextForOutputReview(review: NeroaOneOutputReviewRecord) {
  return (
    normalizeText(review.customerVisibleSummary) ||
    "A customer-facing follow-up is needed before this output can move forward."
  );
}

function buildInternalReasonFromOutcomeItem(item: NeroaOneOutcomeQueueItem) {
  return (
    normalizeText(item.internalSummary) ||
    `Customer follow-up required for analyzer outcome ${item.analyzerOutcome}.`
  );
}

function buildInternalReasonFromOutputReview(review: NeroaOneOutputReviewRecord) {
  return (
    normalizeText(review.reasoningSummary) ||
    `Customer follow-up required for output review ${review.reviewId}.`
  );
}

function buildFutureCustomerFollowUpServiceTarget(
  override: Partial<NeroaOneFutureCustomerFollowUpServiceTarget> | null | undefined
): NeroaOneFutureCustomerFollowUpServiceTarget {
  const normalizedNotes = normalizeStringList(override?.notes);

  return neroaOneFutureCustomerFollowUpServiceTargetSchema.parse({
    deploymentProvider: "digitalocean",
    serviceName:
      normalizeText(override?.serviceName) || "neroa-one-customer-follow-up-service",
    queueName: normalizeText(override?.queueName) || "neroa-one.customer-follow-up",
    serviceType: "future_customer_follow_up_service",
    readyForDispatch: false,
    notes:
      normalizedNotes.length > 0
        ? normalizedNotes
        : [
            "Future DigitalOcean customer follow-up services may persist, retrieve, and dispatch follow-up items here.",
            "Current lane remains backend-only, storage-free, and does not trigger customer UI behavior."
          ]
  });
}

export function createCustomerSafeFollowUpText(text: string | null | undefined) {
  const normalized = normalizeText(text);
  const sanitized = sanitizeCustomerSafeFollowUpText(normalized);

  return assertCustomerSafeFollowUpText(
    sanitized || (normalized ? "Customer follow-up details are available." : "")
  );
}

export function validateOutcomeLaneItemForCustomerFollowUp(args: {
  item: NeroaOneOutcomeQueueItem;
}): NeroaOneCustomerFollowUpOutcomeValidationResult {
  const itemResult = neroaOneOutcomeQueueItemSchema.safeParse(args.item);

  if (!itemResult.success) {
    const [issue] = itemResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "item";

    return buildRejectedOutcomeValidationResult(
      "invalid_outcome_item",
      `Outcome lane item is invalid for the customer follow-up boundary at ${issuePath}.`
    );
  }

  const item = itemResult.data;
  const sourceType = normalizeText(item.analyzerOutcome);

  if (
    !neroaOneCustomerFollowUpLane.acceptedOutcomeLaneIds.some(
      (allowedSource) => allowedSource === sourceType
    )
  ) {
    return buildRejectedOutcomeValidationResult(
      sourceType,
      `Outcome lane ${sourceType} cannot create a customer follow-up item. Allowed source types: ${neroaOneCustomerFollowUpLane.acceptedSourceTypes.join(", ")}.`
    );
  }

  const sourceLaneId = neroaOneCustomerFollowUpAcceptedOutcomeLaneIdSchema.parse(sourceType);
  const laneValidation = validateNeroaOneOutcomeQueueItemForLane({
    laneId: sourceLaneId,
    item
  });

  if (!laneValidation.allowed) {
    return buildRejectedOutcomeValidationResult(sourceLaneId, laneValidation.reason);
  }

  const outcomeLane = getNeroaOneOutcomeLaneDefinition(sourceLaneId);

  if (!outcomeLane.allowedNextDestinations.includes("command_center_follow_up")) {
    throw new Error(
      `Outcome lane ${sourceLaneId} must stay aligned with the command_center_follow_up destination contract.`
    );
  }

  return {
    allowed: true,
    lane: neroaOneCustomerFollowUpLane,
    sourceLaneId,
    sourceType: sourceLaneId,
    sourceItem: item,
    requiredDestinations: [...outcomeLane.allowedNextDestinations]
  };
}

export function validateOutputReviewDecisionForCustomerFollowUp(args: {
  decision: NeroaOneOutputReviewDecision;
}): NeroaOneCustomerFollowUpOutputReviewDecisionValidationResult {
  const decision = normalizeText(args.decision) as NeroaOneOutputReviewDecision;

  if (
    !neroaOneCustomerFollowUpLane.acceptedOutputReviewDecisions.some(
      (allowedDecision) => allowedDecision === decision
    )
  ) {
    return buildRejectedOutputReviewDecisionValidationResult(
      decision,
      `Output review decision ${decision} cannot create a customer follow-up item. Allowed source types: ${neroaOneCustomerFollowUpLane.acceptedSourceTypes.join(", ")}.`
    );
  }

  const requiredDestinations = getAllowedOutputReviewNextDestinations(decision);

  if (!requiredDestinations.includes("command_center_follow_up")) {
    throw new Error(
      "Customer follow-up lane must stay aligned with the output review customer_followup destination contract."
    );
  }

  return {
    allowed: true,
    lane: neroaOneCustomerFollowUpLane,
    reviewLane: neroaOneOutputReviewLane,
    decision: "customer_followup",
    requiredDestinations
  };
}

export function validateOutputReviewForCustomerFollowUp(args: {
  review: NeroaOneOutputReviewRecord;
}): NeroaOneCustomerFollowUpOutputReviewValidationResult {
  const reviewResult = neroaOneOutputReviewRecordSchema.safeParse(args.review);

  if (!reviewResult.success) {
    const [issue] = reviewResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "review";

    return buildRejectedOutputReviewValidationResult(
      `Output review is invalid for the customer follow-up boundary at ${issuePath}.`
    );
  }

  const review = reviewResult.data;
  const decisionValidation = validateOutputReviewDecisionForCustomerFollowUp({
    decision: review.decision
  });

  if (!decisionValidation.allowed) {
    return buildRejectedOutputReviewValidationResult(
      `Output review ${review.reviewId} has decision ${review.decision} and cannot create a customer follow-up item.`
    );
  }

  return {
    allowed: true,
    lane: neroaOneCustomerFollowUpLane,
    reviewLane: neroaOneOutputReviewLane,
    review
  };
}

export function canCreateCustomerFollowUpItemFromOutcomeLaneItem(args: {
  item: NeroaOneOutcomeQueueItem;
}) {
  return validateOutcomeLaneItemForCustomerFollowUp(args).allowed;
}

export function canCreateCustomerFollowUpItemFromOutputReview(args: {
  review: NeroaOneOutputReviewRecord;
}) {
  return validateOutputReviewForCustomerFollowUp(args).allowed;
}

export function createCustomerFollowUpItemFromOutcomeLaneItem(args: {
  item: NeroaOneOutcomeQueueItem;
  status?: NeroaOneCustomerFollowUpItemStatus | null;
  followUpType?: NeroaOneCustomerFollowUpType | null;
  customerQuestion?: string | null;
  customerSafeContext?: string | null;
  allowedResponseType?: NeroaOneCustomerFollowUpAllowedResponseType | null;
  internalReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  futureCustomerFollowUpServiceTarget?: Partial<NeroaOneFutureCustomerFollowUpServiceTarget> | null;
}): NeroaOneCustomerFollowUpItem {
  const validation = validateOutcomeLaneItemForCustomerFollowUp({
    item: args.item
  });

  if (!validation.allowed) {
    throw new Error(validation.reason);
  }

  const item = validation.sourceItem;
  const status = neroaOneCustomerFollowUpItemStatusSchema.parse(
    args.status ?? "ready_for_customer"
  );
  const createdAt = normalizeText(args.createdAt) || item.createdAt;
  const updatedAt = normalizeText(args.updatedAt) || createdAt;
  const sourceId = buildOutcomeSourceId(item);
  const customerQuestion =
    createCustomerSafeFollowUpText(args.customerQuestion) ||
    createCustomerSafeFollowUpText(getDefaultCustomerQuestionForOutcomeItem(item)) ||
    "Please provide the requested follow-up.";
  const customerSafeContext =
    createCustomerSafeFollowUpText(args.customerSafeContext) ||
    createCustomerSafeFollowUpText(getDefaultCustomerSafeContextForOutcomeItem(item)) ||
    "This request is waiting for customer follow-up.";

  return neroaOneCustomerFollowUpItemSchema.parse({
    followUpItemId: buildCustomerFollowUpItemId({
      sourceLaneId: validation.sourceLaneId,
      sourceId,
      createdAt
    }),
    workspaceId: item.workspaceId,
    projectId: item.projectId,
    taskId: item.taskId,
    sourceLaneId: validation.sourceLaneId,
    sourceType: validation.sourceType,
    sourceId,
    status,
    followUpType: resolveOutcomeFollowUpType(validation.sourceType, args.followUpType),
    customerQuestion,
    customerSafeContext,
    allowedResponseType: resolveAllowedResponseType(args.allowedResponseType),
    internalReason: normalizeText(args.internalReason) || buildInternalReasonFromOutcomeItem(item),
    createdAt,
    updatedAt,
    futureCustomerFollowUpServiceTarget: buildFutureCustomerFollowUpServiceTarget(
      args.futureCustomerFollowUpServiceTarget
    )
  });
}

export function createCustomerFollowUpItemsFromOutcomeLaneItems(args: {
  items: readonly NeroaOneOutcomeQueueItem[];
  status?: NeroaOneCustomerFollowUpItemStatus | null;
  followUpType?: NeroaOneCustomerFollowUpType | null;
  allowedResponseType?: NeroaOneCustomerFollowUpAllowedResponseType | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}) {
  return args.items.map((item) =>
    createCustomerFollowUpItemFromOutcomeLaneItem({
      item,
      status: args.status,
      followUpType: args.followUpType,
      allowedResponseType: args.allowedResponseType,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt
    })
  );
}

export function createCustomerFollowUpItemFromOutputReview(args: {
  review: NeroaOneOutputReviewRecord;
  status?: NeroaOneCustomerFollowUpItemStatus | null;
  followUpType?: NeroaOneCustomerFollowUpType | null;
  customerQuestion?: string | null;
  customerSafeContext?: string | null;
  allowedResponseType?: NeroaOneCustomerFollowUpAllowedResponseType | null;
  internalReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  futureCustomerFollowUpServiceTarget?: Partial<NeroaOneFutureCustomerFollowUpServiceTarget> | null;
}): NeroaOneCustomerFollowUpItem {
  const validation = validateOutputReviewForCustomerFollowUp({
    review: args.review
  });

  if (!validation.allowed) {
    throw new Error(validation.reason);
  }

  const review = validation.review;
  const status = neroaOneCustomerFollowUpItemStatusSchema.parse(
    args.status ?? "ready_for_customer"
  );
  const createdAt = normalizeText(args.createdAt) || review.createdAt;
  const updatedAt = normalizeText(args.updatedAt) || createdAt;
  const sourceId = review.reviewId;
  const customerQuestion =
    createCustomerSafeFollowUpText(args.customerQuestion) ||
    createCustomerSafeFollowUpText(getDefaultCustomerQuestionForOutputReview(review)) ||
    "Please provide the requested follow-up.";
  const customerSafeContext =
    createCustomerSafeFollowUpText(args.customerSafeContext) ||
    createCustomerSafeFollowUpText(getDefaultCustomerSafeContextForOutputReview(review)) ||
    "A customer follow-up is required before this work can continue.";

  return neroaOneCustomerFollowUpItemSchema.parse({
    followUpItemId: buildCustomerFollowUpItemId({
      sourceLaneId: "output_review",
      sourceId,
      createdAt
    }),
    workspaceId: review.workspaceId,
    projectId: review.projectId,
    taskId: review.taskId,
    sourceLaneId: "output_review",
    sourceType: "customer_followup",
    sourceId,
    status,
    followUpType: resolveOutputReviewFollowUpType(args.followUpType),
    customerQuestion,
    customerSafeContext,
    allowedResponseType: resolveAllowedResponseType(args.allowedResponseType),
    internalReason: normalizeText(args.internalReason) || buildInternalReasonFromOutputReview(review),
    createdAt,
    updatedAt,
    futureCustomerFollowUpServiceTarget: buildFutureCustomerFollowUpServiceTarget(
      args.futureCustomerFollowUpServiceTarget
    )
  });
}

export function createCustomerFollowUpItemsFromOutputReviews(args: {
  reviews: readonly NeroaOneOutputReviewRecord[];
  status?: NeroaOneCustomerFollowUpItemStatus | null;
  followUpType?: NeroaOneCustomerFollowUpType | null;
  allowedResponseType?: NeroaOneCustomerFollowUpAllowedResponseType | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}) {
  return args.reviews.map((review) =>
    createCustomerFollowUpItemFromOutputReview({
      review,
      status: args.status,
      followUpType: args.followUpType,
      allowedResponseType: args.allowedResponseType,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt
    })
  );
}

export function getCustomerSafeCustomerFollowUpItemView(args: {
  item: NeroaOneCustomerFollowUpItem;
}): NeroaOneCustomerSafeCustomerFollowUpItemView {
  const item = neroaOneCustomerFollowUpItemSchema.parse(args.item);

  return neroaOneCustomerSafeCustomerFollowUpItemViewSchema.parse({
    followUpItemId: item.followUpItemId,
    workspaceId: item.workspaceId,
    projectId: item.projectId,
    taskId: item.taskId,
    sourceLaneId: item.sourceLaneId,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    status: item.status,
    followUpType: item.followUpType,
    customerQuestion: createCustomerSafeFollowUpText(item.customerQuestion),
    customerSafeContext: createCustomerSafeFollowUpText(item.customerSafeContext),
    allowedResponseType: item.allowedResponseType,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  });
}

export function getCustomerFollowUpSourceTypes() {
  return [...neroaOneCustomerFollowUpLane.acceptedSourceTypes];
}

export function getCustomerFollowUpItemStatuses() {
  return [...neroaOneCustomerFollowUpLane.allowedStatuses];
}

export function getCustomerFollowUpTypes() {
  return [...neroaOneCustomerFollowUpLane.supportedFollowUpTypes];
}

export function getCustomerFollowUpAllowedResponseTypes() {
  return [...neroaOneCustomerFollowUpLane.allowedResponseTypes];
}
