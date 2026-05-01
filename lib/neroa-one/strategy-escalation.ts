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

const STRATEGY_ESCALATION_UNSAFE_CONTENT_PATTERN = new RegExp(
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
    "futureCustomerFollowUpServiceTarget",
    "futureStrategyEscalationServiceTarget",
    "futureAuditServiceTarget",
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

export const NEROA_ONE_STRATEGY_ESCALATION_SOURCE_TYPES = [
  "roadmap_revision_required",
  "strategy_escalation"
] as const;
export const NEROA_ONE_STRATEGY_ESCALATION_ACCEPTED_OUTCOME_LANE_IDS = [
  "roadmap_revision_required"
] as const;
export const NEROA_ONE_STRATEGY_ESCALATION_ACCEPTED_OUTPUT_REVIEW_DECISIONS = [
  "strategy_escalation"
] as const;

export const NEROA_ONE_STRATEGY_ESCALATION_ITEM_STATUSES = [
  "draft",
  "ready_for_strategy_review",
  "waiting_for_customer_decision",
  "approved",
  "rejected",
  "archived",
  "failed"
] as const;

export const NEROA_ONE_STRATEGY_ESCALATION_TYPES = [
  "roadmap_change",
  "scope_change",
  "budget_change",
  "timeline_change",
  "product_direction_change",
  "architecture_change",
  "dependency_change",
  "risk_escalation",
  "other"
] as const;

export const NEROA_ONE_STRATEGY_ESCALATION_IMPACT_LEVELS = [
  "low",
  "medium",
  "high",
  "critical"
] as const;

export const neroaOneStrategyEscalationSourceTypeSchema = z.enum(
  NEROA_ONE_STRATEGY_ESCALATION_SOURCE_TYPES
);
export const neroaOneStrategyEscalationItemStatusSchema = z.enum(
  NEROA_ONE_STRATEGY_ESCALATION_ITEM_STATUSES
);
export const neroaOneStrategyEscalationTypeSchema = z.enum(
  NEROA_ONE_STRATEGY_ESCALATION_TYPES
);
export const neroaOneStrategyEscalationImpactLevelSchema = z.enum(
  NEROA_ONE_STRATEGY_ESCALATION_IMPACT_LEVELS
);
export const neroaOneStrategyEscalationAcceptedOutcomeLaneIdSchema = z.enum(
  NEROA_ONE_STRATEGY_ESCALATION_ACCEPTED_OUTCOME_LANE_IDS
);
export const neroaOneStrategyEscalationSourceLaneIdSchema = z.enum([
  "roadmap_revision_required",
  "output_review"
]);
export const neroaOneStrategyEscalationAcceptedOutputReviewDecisionSchema = z.enum(
  NEROA_ONE_STRATEGY_ESCALATION_ACCEPTED_OUTPUT_REVIEW_DECISIONS
);

export type NeroaOneStrategyEscalationSourceType = z.infer<
  typeof neroaOneStrategyEscalationSourceTypeSchema
>;
export type NeroaOneStrategyEscalationItemStatus = z.infer<
  typeof neroaOneStrategyEscalationItemStatusSchema
>;
export type NeroaOneStrategyEscalationType = z.infer<
  typeof neroaOneStrategyEscalationTypeSchema
>;
export type NeroaOneStrategyEscalationImpactLevel = z.infer<
  typeof neroaOneStrategyEscalationImpactLevelSchema
>;
export type NeroaOneStrategyEscalationAcceptedOutcomeLaneId = z.infer<
  typeof neroaOneStrategyEscalationAcceptedOutcomeLaneIdSchema
>;
export type NeroaOneStrategyEscalationSourceLaneId = z.infer<
  typeof neroaOneStrategyEscalationSourceLaneIdSchema
>;
export type NeroaOneStrategyEscalationAcceptedOutputReviewDecision = z.infer<
  typeof neroaOneStrategyEscalationAcceptedOutputReviewDecisionSchema
>;

export const neroaOneFutureStrategyEscalationServiceTargetSchema = z
  .object({
    deploymentProvider: z.literal("digitalocean"),
    serviceName: trimmedStringSchema,
    queueName: trimmedStringSchema,
    serviceType: z.literal("future_strategy_escalation_service"),
    readyForDispatch: z.literal(false),
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOneFutureStrategyEscalationServiceTarget = z.infer<
  typeof neroaOneFutureStrategyEscalationServiceTargetSchema
>;

const neroaOneStrategyEscalationItemBaseSchema = z
  .object({
    strategyEscalationItemId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    sourceId: trimmedStringSchema,
    status: neroaOneStrategyEscalationItemStatusSchema,
    escalationType: neroaOneStrategyEscalationTypeSchema,
    impactLevel: neroaOneStrategyEscalationImpactLevelSchema,
    strategyQuestion: trimmedStringSchema,
    customerSafeContext: trimmedStringSchema,
    proposedRoadmapImpactSummary: trimmedStringSchema,
    internalReason: trimmedStringSchema,
    createdAt: trimmedStringSchema,
    updatedAt: trimmedStringSchema,
    futureStrategyEscalationServiceTarget:
      neroaOneFutureStrategyEscalationServiceTargetSchema
  })
  .strict();

export const neroaOneStrategyEscalationItemSchema = z.union([
  neroaOneStrategyEscalationItemBaseSchema.extend({
    sourceLaneId: z.literal("roadmap_revision_required"),
    sourceType: z.literal("roadmap_revision_required")
  }),
  neroaOneStrategyEscalationItemBaseSchema.extend({
    sourceLaneId: z.literal("output_review"),
    sourceType: z.literal("strategy_escalation")
  })
]);

export type NeroaOneStrategyEscalationItem = z.infer<
  typeof neroaOneStrategyEscalationItemSchema
>;

const neroaOneCustomerSafeStrategyEscalationItemViewBaseSchema = z
  .object({
    strategyEscalationItemId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    sourceId: trimmedStringSchema,
    status: neroaOneStrategyEscalationItemStatusSchema,
    escalationType: neroaOneStrategyEscalationTypeSchema,
    impactLevel: neroaOneStrategyEscalationImpactLevelSchema,
    strategyQuestion: trimmedStringSchema,
    customerSafeContext: trimmedStringSchema,
    proposedRoadmapImpactSummary: trimmedStringSchema,
    createdAt: trimmedStringSchema,
    updatedAt: trimmedStringSchema
  })
  .strict();

export const neroaOneCustomerSafeStrategyEscalationItemViewSchema = z.union([
  neroaOneCustomerSafeStrategyEscalationItemViewBaseSchema.extend({
    sourceLaneId: z.literal("roadmap_revision_required"),
    sourceType: z.literal("roadmap_revision_required")
  }),
  neroaOneCustomerSafeStrategyEscalationItemViewBaseSchema.extend({
    sourceLaneId: z.literal("output_review"),
    sourceType: z.literal("strategy_escalation")
  })
]);

export type NeroaOneCustomerSafeStrategyEscalationItemView = z.infer<
  typeof neroaOneCustomerSafeStrategyEscalationItemViewSchema
>;

export const neroaOneStrategyEscalationLaneDefinitionSchema = z
  .object({
    laneId: z.literal("strategy_escalation"),
    backendOnly: z.literal(true),
    extractionReady: z.literal(true),
    independentlyReplaceable: z.literal(true),
    sideEffectLight: z.literal(true),
    uiDecoupled: z.literal(true),
    exposesCustomerSafeProjectionOnly: z.literal(true),
    storesStrategyEscalationItemsNow: z.literal(false),
    routesStrategyRoomNow: z.literal(false),
    writesPersistenceNow: z.literal(false),
    acceptedOutcomeLaneIds: z.tuple([z.literal("roadmap_revision_required")]),
    acceptedOutputReviewDecisions: z.tuple([z.literal("strategy_escalation")]),
    acceptedSourceTypes: z.tuple([
      z.literal("roadmap_revision_required"),
      z.literal("strategy_escalation")
    ]),
    allowedStatuses: z.tuple([
      z.literal("draft"),
      z.literal("ready_for_strategy_review"),
      z.literal("waiting_for_customer_decision"),
      z.literal("approved"),
      z.literal("rejected"),
      z.literal("archived"),
      z.literal("failed")
    ]),
    supportedEscalationTypes: z.tuple([
      z.literal("roadmap_change"),
      z.literal("scope_change"),
      z.literal("budget_change"),
      z.literal("timeline_change"),
      z.literal("product_direction_change"),
      z.literal("architecture_change"),
      z.literal("dependency_change"),
      z.literal("risk_escalation"),
      z.literal("other")
    ]),
    allowedImpactLevels: z.tuple([
      z.literal("low"),
      z.literal("medium"),
      z.literal("high"),
      z.literal("critical")
    ]),
    displayPurposeInternal: trimmedStringSchema,
    internalOnlyNotes: stringListSchema.min(1),
    futureStrategyEscalationServiceTarget: z
      .object({
        serviceName: trimmedStringSchema,
        queueName: trimmedStringSchema,
        notes: stringListSchema.min(1)
      })
      .strict()
  })
  .strict();

export type NeroaOneStrategyEscalationLaneDefinition = z.infer<
  typeof neroaOneStrategyEscalationLaneDefinitionSchema
>;

export type NeroaOneStrategyEscalationOutcomeValidationResult =
  | {
      allowed: true;
      lane: NeroaOneStrategyEscalationLaneDefinition;
      sourceLaneId: NeroaOneStrategyEscalationAcceptedOutcomeLaneId;
      sourceType: "roadmap_revision_required";
      sourceItem: NeroaOneOutcomeQueueItem;
      requiredDestinations: readonly string[];
    }
  | {
      allowed: false;
      lane: NeroaOneStrategyEscalationLaneDefinition;
      sourceType: string;
      reason: string;
    };

export type NeroaOneStrategyEscalationOutputReviewDecisionValidationResult =
  | {
      allowed: true;
      lane: NeroaOneStrategyEscalationLaneDefinition;
      reviewLane: typeof neroaOneOutputReviewLane;
      decision: "strategy_escalation";
      requiredDestinations: readonly string[];
    }
  | {
      allowed: false;
      lane: NeroaOneStrategyEscalationLaneDefinition;
      reviewLane: typeof neroaOneOutputReviewLane;
      decision: NeroaOneOutputReviewDecision;
      reason: string;
    };

export type NeroaOneStrategyEscalationOutputReviewValidationResult =
  | {
      allowed: true;
      lane: NeroaOneStrategyEscalationLaneDefinition;
      reviewLane: typeof neroaOneOutputReviewLane;
      review: NeroaOneOutputReviewRecord;
    }
  | {
      allowed: false;
      lane: NeroaOneStrategyEscalationLaneDefinition;
      reviewLane: typeof neroaOneOutputReviewLane;
      reason: string;
    };

export interface NeroaOneStrategyEscalationStorageAdapter {
  saveStrategyEscalationItem(item: NeroaOneStrategyEscalationItem): Promise<void>;
  getStrategyEscalationItemById(
    strategyEscalationItemId: string
  ): Promise<NeroaOneStrategyEscalationItem | null>;
  listStrategyEscalationItemsByTaskId(
    taskId: string
  ): Promise<NeroaOneStrategyEscalationItem[]>;
  listStrategyEscalationItemsBySourceId(
    sourceId: string
  ): Promise<NeroaOneStrategyEscalationItem[]>;
}

export const neroaOneStrategyEscalationLane =
  neroaOneStrategyEscalationLaneDefinitionSchema.parse({
    laneId: "strategy_escalation",
    backendOnly: true,
    extractionReady: true,
    independentlyReplaceable: true,
    sideEffectLight: true,
    uiDecoupled: true,
    exposesCustomerSafeProjectionOnly: true,
    storesStrategyEscalationItemsNow: false,
    routesStrategyRoomNow: false,
    writesPersistenceNow: false,
    acceptedOutcomeLaneIds: [...NEROA_ONE_STRATEGY_ESCALATION_ACCEPTED_OUTCOME_LANE_IDS],
    acceptedOutputReviewDecisions: [
      ...NEROA_ONE_STRATEGY_ESCALATION_ACCEPTED_OUTPUT_REVIEW_DECISIONS
    ],
    acceptedSourceTypes: ["roadmap_revision_required", "strategy_escalation"],
    allowedStatuses: [
      "draft",
      "ready_for_strategy_review",
      "waiting_for_customer_decision",
      "approved",
      "rejected",
      "archived",
      "failed"
    ],
    supportedEscalationTypes: [
      "roadmap_change",
      "scope_change",
      "budget_change",
      "timeline_change",
      "product_direction_change",
      "architecture_change",
      "dependency_change",
      "risk_escalation",
      "other"
    ],
    allowedImpactLevels: ["low", "medium", "high", "critical"],
    displayPurposeInternal:
      "Defines the backend-only Neroa One strategy escalation contract for roadmap, scope, architecture, and planning-review items produced by roadmap outcome lanes and output review strategy escalations.",
    internalOnlyNotes: [
      "This lane owns roadmap and scope escalation item contracts only.",
      "This lane is modular-monolith infrastructure only for now and must remain typed, backend-only, side-effect-light, UI-decoupled, and independently replaceable.",
      "This lane must not wire Strategy Room, Command Center, Build Room, persistence, or execution behavior.",
      "This lane must not classify analyzer outcomes or create or mutate Output Review records.",
      "This lane must not create execution packets, Prompt Room items, worker runs, QC jobs, evidence links, audit events, repair items, customer follow-up items, or roadmap records.",
      "Customer-safe strategy escalation items must never expose internal prompt text, raw worker instructions, protected file details, model routing, worker secrets, legacy extension runtime details, audit-only notes, future service targets, or file-path leakage."
    ],
    futureStrategyEscalationServiceTarget: {
      serviceName: "neroa-one-strategy-escalation-service",
      queueName: "neroa-one.strategy-escalation",
      notes: [
        "Future DigitalOcean strategy escalation services may persist, retrieve, and dispatch escalation items here without changing the contract.",
        "Current lane remains contract-only and must not wire Strategy Room UI, roadmap mutation, or customer-decision handling."
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

function assertCustomerSafeStrategyEscalationText(text: string) {
  if (STRATEGY_ESCALATION_UNSAFE_CONTENT_PATTERN.test(text)) {
    throw new Error(
      "Strategy escalation text must not expose internal execution, worker, runtime, audit-only, or service-target details."
    );
  }

  return text;
}

function stripProtectedStrategyEscalationDetails(text: string) {
  return normalizeText(text.replace(FILE_PATH_DETAIL_PATTERN, "internal detail"));
}

function sanitizeCustomerSafeStrategyEscalationText(text: string) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return "";
  }

  const safeSegments = normalized
    .split(SUMMARY_SEGMENT_SPLIT_PATTERN)
    .map((segment) => stripProtectedStrategyEscalationDetails(segment))
    .filter(
      (segment) => Boolean(segment) && !STRATEGY_ESCALATION_UNSAFE_CONTENT_PATTERN.test(segment)
    );

  return normalizeText(safeSegments.join(" "));
}

function buildRejectedOutcomeValidationResult(
  sourceType: string,
  reason: string
): NeroaOneStrategyEscalationOutcomeValidationResult {
  return {
    allowed: false,
    lane: neroaOneStrategyEscalationLane,
    sourceType,
    reason:
      normalizeText(reason) ||
      `Source ${sourceType} cannot create a strategy escalation item.`
  };
}

function buildRejectedOutputReviewDecisionValidationResult(
  decision: NeroaOneOutputReviewDecision,
  reason: string
): NeroaOneStrategyEscalationOutputReviewDecisionValidationResult {
  return {
    allowed: false,
    lane: neroaOneStrategyEscalationLane,
    reviewLane: neroaOneOutputReviewLane,
    decision,
    reason:
      normalizeText(reason) ||
      `Output review decision ${decision} cannot create a strategy escalation item.`
  };
}

function buildRejectedOutputReviewValidationResult(
  reason: string
): NeroaOneStrategyEscalationOutputReviewValidationResult {
  return {
    allowed: false,
    lane: neroaOneStrategyEscalationLane,
    reviewLane: neroaOneOutputReviewLane,
    reason:
      normalizeText(reason) ||
      "Output review is not eligible for strategy escalation item creation."
  };
}

function buildOutcomeSourceId(item: NeroaOneOutcomeQueueItem) {
  const timestampPart = normalizeText(item.createdAt).replace(/[^0-9TZ]/g, "");
  return `${item.analyzerOutcome}:${item.taskId}:${timestampPart}`;
}

function buildStrategyEscalationItemId(args: {
  sourceLaneId: NeroaOneStrategyEscalationSourceLaneId;
  sourceId: string;
  createdAt: string;
}) {
  const timestampPart = normalizeText(args.createdAt).replace(/[^0-9TZ]/g, "");
  return `${args.sourceLaneId}:${args.sourceId}:strategy-escalation:${timestampPart}`;
}

function resolveOutcomeEscalationType(
  sourceType: "roadmap_revision_required",
  escalationType: NeroaOneStrategyEscalationType | null | undefined
) {
  return escalationType
    ? neroaOneStrategyEscalationTypeSchema.parse(escalationType)
    : "roadmap_change";
}

function resolveOutputReviewEscalationType(
  escalationType: NeroaOneStrategyEscalationType | null | undefined
) {
  return escalationType
    ? neroaOneStrategyEscalationTypeSchema.parse(escalationType)
    : "risk_escalation";
}

function resolveImpactLevel(
  impactLevel: NeroaOneStrategyEscalationImpactLevel | null | undefined,
  sourceType: NeroaOneStrategyEscalationSourceType
) {
  if (impactLevel) {
    return neroaOneStrategyEscalationImpactLevelSchema.parse(impactLevel);
  }

  return sourceType === "roadmap_revision_required" ? "high" : "medium";
}

function getDefaultStrategyQuestionForOutcomeItem(item: NeroaOneOutcomeQueueItem) {
  const primaryPrompt =
    normalizeText(item.customerFacingSummary) ||
    normalizeText(item.readinessBlockers[0]);

  return (
    primaryPrompt ||
    "Please review whether roadmap or scope changes are required before work can continue."
  );
}

function getDefaultCustomerSafeContextForOutcomeItem(item: NeroaOneOutcomeQueueItem) {
  return (
    normalizeText(item.customerFacingSummary) ||
    "This request requires roadmap or scope review before backend work can continue."
  );
}

function getDefaultProposedRoadmapImpactSummaryForOutcomeItem(item: NeroaOneOutcomeQueueItem) {
  const blockers = item.readinessBlockers
    .map((blocker) => normalizeText(blocker))
    .filter(Boolean);

  return (
    normalizeText([item.customerFacingSummary, blockers[0]].filter(Boolean).join(" ")) ||
    "Roadmap review is required before execution eligibility can be reconsidered."
  );
}

function getDefaultStrategyQuestionForOutputReview(review: NeroaOneOutputReviewRecord) {
  return (
    normalizeText(review.customerVisibleSummary) ||
    "Please review whether strategy or roadmap changes are required before work can continue."
  );
}

function getDefaultCustomerSafeContextForOutputReview(review: NeroaOneOutputReviewRecord) {
  return (
    normalizeText(review.customerVisibleSummary) ||
    "This output requires strategy review before work can continue."
  );
}

function getDefaultProposedRoadmapImpactSummaryForOutputReview(review: NeroaOneOutputReviewRecord) {
  return (
    normalizeText(review.customerVisibleSummary) ||
    "Strategy review is required before the output can move forward."
  );
}

function buildInternalReasonFromOutcomeItem(item: NeroaOneOutcomeQueueItem) {
  return (
    normalizeText(item.internalSummary) ||
    `Strategy escalation required for analyzer outcome ${item.analyzerOutcome}.`
  );
}

function buildInternalReasonFromOutputReview(review: NeroaOneOutputReviewRecord) {
  return (
    normalizeText(review.reasoningSummary) ||
    `Strategy escalation required for output review ${review.reviewId}.`
  );
}

function buildFutureStrategyEscalationServiceTarget(
  override: Partial<NeroaOneFutureStrategyEscalationServiceTarget> | null | undefined
): NeroaOneFutureStrategyEscalationServiceTarget {
  const normalizedNotes = normalizeStringList(override?.notes);

  return neroaOneFutureStrategyEscalationServiceTargetSchema.parse({
    deploymentProvider: "digitalocean",
    serviceName:
      normalizeText(override?.serviceName) || "neroa-one-strategy-escalation-service",
    queueName: normalizeText(override?.queueName) || "neroa-one.strategy-escalation",
    serviceType: "future_strategy_escalation_service",
    readyForDispatch: false,
    notes:
      normalizedNotes.length > 0
        ? normalizedNotes
        : [
            "Future DigitalOcean strategy escalation services may persist, retrieve, and dispatch escalation items here.",
            "Current lane remains backend-only, storage-free, and does not trigger Strategy Room behavior."
          ]
  });
}

export function createCustomerSafeStrategyEscalationText(text: string | null | undefined) {
  const normalized = normalizeText(text);
  const sanitized = sanitizeCustomerSafeStrategyEscalationText(normalized);

  return assertCustomerSafeStrategyEscalationText(
    sanitized || (normalized ? "Strategy escalation details are available." : "")
  );
}

export function validateOutcomeLaneItemForStrategyEscalation(args: {
  item: NeroaOneOutcomeQueueItem;
}): NeroaOneStrategyEscalationOutcomeValidationResult {
  const itemResult = neroaOneOutcomeQueueItemSchema.safeParse(args.item);

  if (!itemResult.success) {
    const [issue] = itemResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "item";

    return buildRejectedOutcomeValidationResult(
      "invalid_outcome_item",
      `Outcome lane item is invalid for the strategy escalation boundary at ${issuePath}.`
    );
  }

  const item = itemResult.data;
  const sourceType = normalizeText(item.analyzerOutcome);

  if (
    !neroaOneStrategyEscalationLane.acceptedOutcomeLaneIds.some(
      (allowedSource) => allowedSource === sourceType
    )
  ) {
    return buildRejectedOutcomeValidationResult(
      sourceType,
      `Outcome lane ${sourceType} cannot create a strategy escalation item. Allowed outcome lanes: ${neroaOneStrategyEscalationLane.acceptedOutcomeLaneIds.join(", ")}.`
    );
  }

  const sourceLaneId = neroaOneStrategyEscalationAcceptedOutcomeLaneIdSchema.parse(sourceType);
  const laneValidation = validateNeroaOneOutcomeQueueItemForLane({
    laneId: sourceLaneId,
    item
  });

  if (!laneValidation.allowed) {
    return buildRejectedOutcomeValidationResult(sourceLaneId, laneValidation.reason);
  }

  const outcomeLane = getNeroaOneOutcomeLaneDefinition(sourceLaneId);

  if (!outcomeLane.allowedNextDestinations.includes("strategy_room_review")) {
    throw new Error(
      `Outcome lane ${sourceLaneId} must stay aligned with the strategy_room_review destination contract.`
    );
  }

  return {
    allowed: true,
    lane: neroaOneStrategyEscalationLane,
    sourceLaneId,
    sourceType: "roadmap_revision_required",
    sourceItem: item,
    requiredDestinations: [...outcomeLane.allowedNextDestinations]
  };
}

export function validateOutputReviewDecisionForStrategyEscalation(args: {
  decision: NeroaOneOutputReviewDecision;
}): NeroaOneStrategyEscalationOutputReviewDecisionValidationResult {
  const decision = normalizeText(args.decision) as NeroaOneOutputReviewDecision;

  if (
    !neroaOneStrategyEscalationLane.acceptedOutputReviewDecisions.some(
      (allowedDecision) => allowedDecision === decision
    )
  ) {
    return buildRejectedOutputReviewDecisionValidationResult(
      decision,
      `Output review decision ${decision} cannot create a strategy escalation item. Allowed output review decisions: ${neroaOneStrategyEscalationLane.acceptedOutputReviewDecisions.join(", ")}.`
    );
  }

  const requiredDestinations = getAllowedOutputReviewNextDestinations(decision);

  if (!requiredDestinations.includes("strategy_room_review")) {
    throw new Error(
      "Strategy escalation lane must stay aligned with the output review strategy_escalation destination contract."
    );
  }

  return {
    allowed: true,
    lane: neroaOneStrategyEscalationLane,
    reviewLane: neroaOneOutputReviewLane,
    decision: "strategy_escalation",
    requiredDestinations
  };
}

export function validateOutputReviewForStrategyEscalation(args: {
  review: NeroaOneOutputReviewRecord;
}): NeroaOneStrategyEscalationOutputReviewValidationResult {
  const reviewResult = neroaOneOutputReviewRecordSchema.safeParse(args.review);

  if (!reviewResult.success) {
    const [issue] = reviewResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "review";

    return buildRejectedOutputReviewValidationResult(
      `Output review is invalid for the strategy escalation boundary at ${issuePath}.`
    );
  }

  const review = reviewResult.data;
  const decisionValidation = validateOutputReviewDecisionForStrategyEscalation({
    decision: review.decision
  });

  if (!decisionValidation.allowed) {
    return buildRejectedOutputReviewValidationResult(
      `Output review ${review.reviewId} has decision ${review.decision} and cannot create a strategy escalation item.`
    );
  }

  return {
    allowed: true,
    lane: neroaOneStrategyEscalationLane,
    reviewLane: neroaOneOutputReviewLane,
    review
  };
}

export function canCreateStrategyEscalationItemFromOutcomeLaneItem(args: {
  item: NeroaOneOutcomeQueueItem;
}) {
  return validateOutcomeLaneItemForStrategyEscalation(args).allowed;
}

export function canCreateStrategyEscalationItemFromOutputReview(args: {
  review: NeroaOneOutputReviewRecord;
}) {
  return validateOutputReviewForStrategyEscalation(args).allowed;
}

export function createStrategyEscalationItemFromOutcomeLaneItem(args: {
  item: NeroaOneOutcomeQueueItem;
  status?: NeroaOneStrategyEscalationItemStatus | null;
  escalationType?: NeroaOneStrategyEscalationType | null;
  impactLevel?: NeroaOneStrategyEscalationImpactLevel | null;
  strategyQuestion?: string | null;
  customerSafeContext?: string | null;
  proposedRoadmapImpactSummary?: string | null;
  internalReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  futureStrategyEscalationServiceTarget?: Partial<NeroaOneFutureStrategyEscalationServiceTarget> | null;
}): NeroaOneStrategyEscalationItem {
  const validation = validateOutcomeLaneItemForStrategyEscalation({
    item: args.item
  });

  if (!validation.allowed) {
    throw new Error(validation.reason);
  }

  const item = validation.sourceItem;
  const status = neroaOneStrategyEscalationItemStatusSchema.parse(
    args.status ?? "ready_for_strategy_review"
  );
  const createdAt = normalizeText(args.createdAt) || item.createdAt;
  const updatedAt = normalizeText(args.updatedAt) || createdAt;
  const sourceId = buildOutcomeSourceId(item);
  const strategyQuestion =
    createCustomerSafeStrategyEscalationText(args.strategyQuestion) ||
    createCustomerSafeStrategyEscalationText(getDefaultStrategyQuestionForOutcomeItem(item)) ||
    "Please review the proposed strategy escalation.";
  const customerSafeContext =
    createCustomerSafeStrategyEscalationText(args.customerSafeContext) ||
    createCustomerSafeStrategyEscalationText(getDefaultCustomerSafeContextForOutcomeItem(item)) ||
    "This request requires strategy review before backend work can continue.";
  const proposedRoadmapImpactSummary =
    createCustomerSafeStrategyEscalationText(args.proposedRoadmapImpactSummary) ||
    createCustomerSafeStrategyEscalationText(
      getDefaultProposedRoadmapImpactSummaryForOutcomeItem(item)
    ) ||
    "Roadmap review is required before execution eligibility can be reconsidered.";

  return neroaOneStrategyEscalationItemSchema.parse({
    strategyEscalationItemId: buildStrategyEscalationItemId({
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
    escalationType: resolveOutcomeEscalationType(validation.sourceType, args.escalationType),
    impactLevel: resolveImpactLevel(args.impactLevel, validation.sourceType),
    strategyQuestion,
    customerSafeContext,
    proposedRoadmapImpactSummary,
    internalReason: normalizeText(args.internalReason) || buildInternalReasonFromOutcomeItem(item),
    createdAt,
    updatedAt,
    futureStrategyEscalationServiceTarget: buildFutureStrategyEscalationServiceTarget(
      args.futureStrategyEscalationServiceTarget
    )
  });
}

export function createStrategyEscalationItemsFromOutcomeLaneItems(args: {
  items: readonly NeroaOneOutcomeQueueItem[];
  status?: NeroaOneStrategyEscalationItemStatus | null;
  escalationType?: NeroaOneStrategyEscalationType | null;
  impactLevel?: NeroaOneStrategyEscalationImpactLevel | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}) {
  return args.items.map((item) =>
    createStrategyEscalationItemFromOutcomeLaneItem({
      item,
      status: args.status,
      escalationType: args.escalationType,
      impactLevel: args.impactLevel,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt
    })
  );
}

export function createStrategyEscalationItemFromOutputReview(args: {
  review: NeroaOneOutputReviewRecord;
  status?: NeroaOneStrategyEscalationItemStatus | null;
  escalationType?: NeroaOneStrategyEscalationType | null;
  impactLevel?: NeroaOneStrategyEscalationImpactLevel | null;
  strategyQuestion?: string | null;
  customerSafeContext?: string | null;
  proposedRoadmapImpactSummary?: string | null;
  internalReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  futureStrategyEscalationServiceTarget?: Partial<NeroaOneFutureStrategyEscalationServiceTarget> | null;
}): NeroaOneStrategyEscalationItem {
  const validation = validateOutputReviewForStrategyEscalation({
    review: args.review
  });

  if (!validation.allowed) {
    throw new Error(validation.reason);
  }

  const review = validation.review;
  const status = neroaOneStrategyEscalationItemStatusSchema.parse(
    args.status ?? "ready_for_strategy_review"
  );
  const createdAt = normalizeText(args.createdAt) || review.createdAt;
  const updatedAt = normalizeText(args.updatedAt) || createdAt;
  const sourceId = review.reviewId;
  const strategyQuestion =
    createCustomerSafeStrategyEscalationText(args.strategyQuestion) ||
    createCustomerSafeStrategyEscalationText(getDefaultStrategyQuestionForOutputReview(review)) ||
    "Please review the proposed strategy escalation.";
  const customerSafeContext =
    createCustomerSafeStrategyEscalationText(args.customerSafeContext) ||
    createCustomerSafeStrategyEscalationText(getDefaultCustomerSafeContextForOutputReview(review)) ||
    "This output requires strategy review before it can move forward.";
  const proposedRoadmapImpactSummary =
    createCustomerSafeStrategyEscalationText(args.proposedRoadmapImpactSummary) ||
    createCustomerSafeStrategyEscalationText(
      getDefaultProposedRoadmapImpactSummaryForOutputReview(review)
    ) ||
    "Strategy review is required before the output can move forward.";

  return neroaOneStrategyEscalationItemSchema.parse({
    strategyEscalationItemId: buildStrategyEscalationItemId({
      sourceLaneId: "output_review",
      sourceId,
      createdAt
    }),
    workspaceId: review.workspaceId,
    projectId: review.projectId,
    taskId: review.taskId,
    sourceLaneId: "output_review",
    sourceType: "strategy_escalation",
    sourceId,
    status,
    escalationType: resolveOutputReviewEscalationType(args.escalationType),
    impactLevel: resolveImpactLevel(args.impactLevel, "strategy_escalation"),
    strategyQuestion,
    customerSafeContext,
    proposedRoadmapImpactSummary,
    internalReason: normalizeText(args.internalReason) || buildInternalReasonFromOutputReview(review),
    createdAt,
    updatedAt,
    futureStrategyEscalationServiceTarget: buildFutureStrategyEscalationServiceTarget(
      args.futureStrategyEscalationServiceTarget
    )
  });
}

export function createStrategyEscalationItemsFromOutputReviews(args: {
  reviews: readonly NeroaOneOutputReviewRecord[];
  status?: NeroaOneStrategyEscalationItemStatus | null;
  escalationType?: NeroaOneStrategyEscalationType | null;
  impactLevel?: NeroaOneStrategyEscalationImpactLevel | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}) {
  return args.reviews.map((review) =>
    createStrategyEscalationItemFromOutputReview({
      review,
      status: args.status,
      escalationType: args.escalationType,
      impactLevel: args.impactLevel,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt
    })
  );
}

export function getCustomerSafeStrategyEscalationItemView(args: {
  item: NeroaOneStrategyEscalationItem;
}): NeroaOneCustomerSafeStrategyEscalationItemView {
  const item = neroaOneStrategyEscalationItemSchema.parse(args.item);

  return neroaOneCustomerSafeStrategyEscalationItemViewSchema.parse({
    strategyEscalationItemId: item.strategyEscalationItemId,
    workspaceId: item.workspaceId,
    projectId: item.projectId,
    taskId: item.taskId,
    sourceLaneId: item.sourceLaneId,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    status: item.status,
    escalationType: item.escalationType,
    impactLevel: item.impactLevel,
    strategyQuestion: createCustomerSafeStrategyEscalationText(item.strategyQuestion),
    customerSafeContext: createCustomerSafeStrategyEscalationText(item.customerSafeContext),
    proposedRoadmapImpactSummary: createCustomerSafeStrategyEscalationText(
      item.proposedRoadmapImpactSummary
    ),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  });
}

export function getStrategyEscalationSourceTypes() {
  return [...neroaOneStrategyEscalationLane.acceptedSourceTypes];
}

export function getStrategyEscalationItemStatuses() {
  return [...neroaOneStrategyEscalationLane.allowedStatuses];
}

export function getStrategyEscalationTypes() {
  return [...neroaOneStrategyEscalationLane.supportedEscalationTypes];
}

export function getStrategyEscalationImpactLevels() {
  return [...neroaOneStrategyEscalationLane.allowedImpactLevels];
}
