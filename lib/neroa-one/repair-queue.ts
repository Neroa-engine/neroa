import { z } from "zod";
import {
  getAllowedOutputReviewNextDestinations,
  neroaOneOutputReviewLane,
  neroaOneOutputReviewRecordSchema,
  type NeroaOneOutputReviewDecision,
  type NeroaOneOutputReviewRecord
} from "./output-review.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

const REPAIR_QUEUE_UNSAFE_CUSTOMER_CONTENT_PATTERN = new RegExp(
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

export const NEROA_ONE_REPAIR_QUEUE_SOURCE_DECISIONS = [
  "needs_repair",
  "rerun_required"
] as const;

export const NEROA_ONE_REPAIR_QUEUE_ITEM_STATUSES = [
  "draft",
  "queued",
  "ready_for_prompt_room",
  "ready_for_worker_rerun",
  "blocked",
  "archived",
  "failed"
] as const;

export const NEROA_ONE_REPAIR_QUEUE_PRIORITIES = [
  "low",
  "normal",
  "high",
  "critical"
] as const;

export const NEROA_ONE_REPAIR_QUEUE_TYPES = [
  "code_fix",
  "prompt_revision",
  "test_failure",
  "qc_failure",
  "worker_failure",
  "scope_conflict",
  "unknown"
] as const;

export const neroaOneRepairQueueSourceDecisionSchema = z.enum(
  NEROA_ONE_REPAIR_QUEUE_SOURCE_DECISIONS
);
export const neroaOneRepairQueueItemStatusSchema = z.enum(
  NEROA_ONE_REPAIR_QUEUE_ITEM_STATUSES
);
export const neroaOneRepairQueuePrioritySchema = z.enum(NEROA_ONE_REPAIR_QUEUE_PRIORITIES);
export const neroaOneRepairQueueTypeSchema = z.enum(NEROA_ONE_REPAIR_QUEUE_TYPES);

export type NeroaOneRepairQueueSourceDecision = z.infer<
  typeof neroaOneRepairQueueSourceDecisionSchema
>;
export type NeroaOneRepairQueueItemStatus = z.infer<
  typeof neroaOneRepairQueueItemStatusSchema
>;
export type NeroaOneRepairQueuePriority = z.infer<typeof neroaOneRepairQueuePrioritySchema>;
export type NeroaOneRepairQueueType = z.infer<typeof neroaOneRepairQueueTypeSchema>;

export const neroaOneFutureRepairServiceTargetSchema = z
  .object({
    deploymentProvider: z.literal("digitalocean"),
    serviceName: trimmedStringSchema,
    queueName: trimmedStringSchema,
    serviceType: z.literal("future_repair_queue_service"),
    readyForDispatch: z.literal(false),
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOneFutureRepairServiceTarget = z.infer<
  typeof neroaOneFutureRepairServiceTargetSchema
>;

export const neroaOneRepairQueueItemSchema = z
  .object({
    repairItemId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    outputId: trimmedStringSchema,
    reviewId: trimmedStringSchema,
    sourceDecision: neroaOneRepairQueueSourceDecisionSchema,
    repairType: neroaOneRepairQueueTypeSchema,
    priority: neroaOneRepairQueuePrioritySchema,
    status: neroaOneRepairQueueItemStatusSchema,
    repairSummary: trimmedStringSchema,
    internalRepairNotes: stringListSchema.default([]),
    customerSafeSummary: trimmedStringSchema,
    createdAt: trimmedStringSchema,
    updatedAt: trimmedStringSchema,
    futureRepairServiceTarget: neroaOneFutureRepairServiceTargetSchema
  })
  .strict();

export type NeroaOneRepairQueueItem = z.infer<typeof neroaOneRepairQueueItemSchema>;

export const neroaOneCustomerSafeRepairQueueItemViewSchema = z
  .object({
    repairItemId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    outputId: trimmedStringSchema,
    reviewId: trimmedStringSchema,
    sourceDecision: neroaOneRepairQueueSourceDecisionSchema,
    repairType: neroaOneRepairQueueTypeSchema,
    priority: neroaOneRepairQueuePrioritySchema,
    status: neroaOneRepairQueueItemStatusSchema,
    customerSafeSummary: trimmedStringSchema,
    createdAt: trimmedStringSchema,
    updatedAt: trimmedStringSchema
  })
  .strict();

export type NeroaOneCustomerSafeRepairQueueItemView = z.infer<
  typeof neroaOneCustomerSafeRepairQueueItemViewSchema
>;

export const neroaOneRepairQueueLaneDefinitionSchema = z
  .object({
    laneId: z.literal("repair_queue"),
    upstreamLaneId: z.literal("output_review"),
    backendOnly: z.literal(true),
    extractionReady: z.literal(true),
    independentlyReplaceable: z.literal(true),
    sideEffectLight: z.literal(true),
    uiDecoupled: z.literal(true),
    exposesCustomerSafeProjectionOnly: z.literal(true),
    storesRepairItemsNow: z.literal(false),
    routesPromptRoomNow: z.literal(false),
    routesWorkerRerunNow: z.literal(false),
    ownsUiNow: z.literal(false),
    writesPersistenceNow: z.literal(false),
    acceptedSourceDecisions: z.tuple([
      z.literal("needs_repair"),
      z.literal("rerun_required")
    ]),
    allowedStatuses: z.tuple([
      z.literal("draft"),
      z.literal("queued"),
      z.literal("ready_for_prompt_room"),
      z.literal("ready_for_worker_rerun"),
      z.literal("blocked"),
      z.literal("archived"),
      z.literal("failed")
    ]),
    allowedPriorities: z.tuple([
      z.literal("low"),
      z.literal("normal"),
      z.literal("high"),
      z.literal("critical")
    ]),
    supportedRepairTypes: z.tuple([
      z.literal("code_fix"),
      z.literal("prompt_revision"),
      z.literal("test_failure"),
      z.literal("qc_failure"),
      z.literal("worker_failure"),
      z.literal("scope_conflict"),
      z.literal("unknown")
    ]),
    displayPurposeInternal: trimmedStringSchema,
    internalOnlyNotes: stringListSchema.min(1),
    futureRepairServiceTarget: z
      .object({
        serviceName: trimmedStringSchema,
        queueName: trimmedStringSchema,
        notes: stringListSchema.min(1)
      })
      .strict()
  })
  .strict();

export type NeroaOneRepairQueueLaneDefinition = z.infer<
  typeof neroaOneRepairQueueLaneDefinitionSchema
>;

export type NeroaOneRepairQueueDecisionValidationResult =
  | {
      allowed: true;
      reviewLane: typeof neroaOneOutputReviewLane;
      repairLane: NeroaOneRepairQueueLaneDefinition;
      decision: NeroaOneRepairQueueSourceDecision;
      requiredDestinations: readonly string[];
    }
  | {
      allowed: false;
      reviewLane: typeof neroaOneOutputReviewLane;
      repairLane: NeroaOneRepairQueueLaneDefinition;
      decision: NeroaOneOutputReviewDecision;
      reason: string;
    };

export type NeroaOneRepairQueueReviewValidationResult =
  | {
      allowed: true;
      reviewLane: typeof neroaOneOutputReviewLane;
      repairLane: NeroaOneRepairQueueLaneDefinition;
      review: NeroaOneOutputReviewRecord;
    }
  | {
      allowed: false;
      reviewLane: typeof neroaOneOutputReviewLane;
      repairLane: NeroaOneRepairQueueLaneDefinition;
      reason: string;
    };

export interface NeroaOneRepairQueueStorageAdapter {
  saveRepairQueueItem(item: NeroaOneRepairQueueItem): Promise<void>;
  getRepairQueueItemById(repairItemId: string): Promise<NeroaOneRepairQueueItem | null>;
  listRepairQueueItemsByTaskId(taskId: string): Promise<NeroaOneRepairQueueItem[]>;
  listRepairQueueItemsByReviewId(reviewId: string): Promise<NeroaOneRepairQueueItem[]>;
}

export const neroaOneRepairQueueLane = neroaOneRepairQueueLaneDefinitionSchema.parse({
  laneId: "repair_queue",
  upstreamLaneId: "output_review",
  backendOnly: true,
  extractionReady: true,
  independentlyReplaceable: true,
  sideEffectLight: true,
  uiDecoupled: true,
  exposesCustomerSafeProjectionOnly: true,
  storesRepairItemsNow: false,
  routesPromptRoomNow: false,
  routesWorkerRerunNow: false,
  ownsUiNow: false,
  writesPersistenceNow: false,
  acceptedSourceDecisions: ["needs_repair", "rerun_required"],
  allowedStatuses: [
    "draft",
    "queued",
    "ready_for_prompt_room",
    "ready_for_worker_rerun",
    "blocked",
    "archived",
    "failed"
  ],
  allowedPriorities: ["low", "normal", "high", "critical"],
  supportedRepairTypes: [
    "code_fix",
    "prompt_revision",
    "test_failure",
    "qc_failure",
    "worker_failure",
    "scope_conflict",
    "unknown"
  ],
  displayPurposeInternal:
    "Defines the backend-only Neroa One repair queue contract for repair and rerun work emitted by Output Review before later approved Prompt Room or worker rerun routing.",
  internalOnlyNotes: [
    "This lane is modular-monolith infrastructure only for now and must remain typed, backend-only, side-effect-light, UI-decoupled, and independently replaceable.",
    "This lane creates repair and rerun queue items only and must not create or mutate Output Review records.",
    "Customer-safe repair projections must never expose internal prompt text, raw worker instructions, protected file details, model routing, worker secrets, legacy extension runtime details, or audit-only notes."
  ],
  futureRepairServiceTarget: {
    serviceName: "neroa-one-repair-queue-service",
    queueName: "neroa-one.repair-queue",
    notes: [
      "Future DigitalOcean repair workers may consume repair queue items here without changing the queue contract.",
      "Current lane remains contract-only and must not wire Prompt Room, worker reruns, persistence, queue execution, or UI behavior."
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

function assertCustomerSafeRepairSummary(summary: string) {
  if (REPAIR_QUEUE_UNSAFE_CUSTOMER_CONTENT_PATTERN.test(summary)) {
    throw new Error(
      "Customer-safe repair summaries must not expose internal execution, worker, runtime, or audit-only details."
    );
  }

  return summary;
}

function stripProtectedRepairDetails(text: string) {
  return normalizeText(text.replace(FILE_PATH_DETAIL_PATTERN, "internal detail"));
}

function sanitizeCustomerSafeRepairText(text: string) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return "";
  }

  const safeSegments = normalized
    .split(SUMMARY_SEGMENT_SPLIT_PATTERN)
    .map((segment) => stripProtectedRepairDetails(segment))
    .filter((segment) => Boolean(segment) && !REPAIR_QUEUE_UNSAFE_CUSTOMER_CONTENT_PATTERN.test(segment));

  return normalizeText(safeSegments.join(" "));
}

function buildRejectedDecisionValidationResult(
  decision: NeroaOneOutputReviewDecision,
  reason: string
): NeroaOneRepairQueueDecisionValidationResult {
  return {
    allowed: false,
    reviewLane: neroaOneOutputReviewLane,
    repairLane: neroaOneRepairQueueLane,
    decision,
    reason:
      normalizeText(reason) ||
      `Output review decision ${decision} cannot create a repair queue item.`
  };
}

function buildRejectedReviewValidationResult(
  reason: string
): NeroaOneRepairQueueReviewValidationResult {
  return {
    allowed: false,
    reviewLane: neroaOneOutputReviewLane,
    repairLane: neroaOneRepairQueueLane,
    reason:
      normalizeText(reason) || "Output review is not eligible for repair queue item creation."
  };
}

function buildRepairItemId(args: { reviewId: string; createdAt: string }) {
  const timestampPart = normalizeText(args.createdAt).replace(/[^0-9TZ]/g, "");
  return `${args.reviewId}:repair:${timestampPart}`;
}

function resolveRepairType(
  decision: NeroaOneRepairQueueSourceDecision,
  repairType: NeroaOneRepairQueueType | null | undefined
) {
  if (repairType) {
    return neroaOneRepairQueueTypeSchema.parse(repairType);
  }

  switch (decision) {
    case "needs_repair":
      return "code_fix";
    case "rerun_required":
      return "worker_failure";
  }
}

function resolveRepairPriority(args: {
  decision: NeroaOneRepairQueueSourceDecision;
  priority?: NeroaOneRepairQueuePriority | null;
}): NeroaOneRepairQueuePriority {
  if (args.priority) {
    return neroaOneRepairQueuePrioritySchema.parse(args.priority);
  }

  return args.decision === "rerun_required" ? "high" : "normal";
}

function getDefaultRepairSummary(
  review: NeroaOneOutputReviewRecord,
  repairType: NeroaOneRepairQueueType
) {
  return normalizeText(review.reasoningSummary) || `Repair item requires ${repairType}.`;
}

function getDefaultCustomerSafeRepairSummary(
  decision: NeroaOneRepairQueueSourceDecision,
  status: NeroaOneRepairQueueItemStatus
) {
  const nextStep =
    status === "ready_for_worker_rerun"
      ? "worker rerun"
      : status === "ready_for_prompt_room"
        ? "prompt preparation"
        : "the next approved internal step";

  switch (decision) {
    case "needs_repair":
      return `Implementation output needs an internal repair pass before it can return to ${nextStep}.`;
    case "rerun_required":
      return `Implementation output needs an internal rerun before it can return to ${nextStep}.`;
  }
}

function buildInternalRepairNotes(args: {
  review: NeroaOneOutputReviewRecord;
  status: NeroaOneRepairQueueItemStatus;
  repairType: NeroaOneRepairQueueType;
  internalRepairNotes?: readonly string[] | null;
}) {
  return normalizeStringList([
    `Repair queue item created from output review ${args.review.reviewId}.`,
    `Source decision: ${args.review.decision}.`,
    `Queue status: ${args.status}.`,
    `Repair type: ${args.repairType}.`,
    ...args.review.internalNotes,
    ...(args.internalRepairNotes ?? [])
  ]);
}

function buildFutureRepairServiceTarget(
  override: Partial<NeroaOneFutureRepairServiceTarget> | null | undefined
): NeroaOneFutureRepairServiceTarget {
  const normalizedNotes = normalizeStringList(override?.notes);

  return neroaOneFutureRepairServiceTargetSchema.parse({
    deploymentProvider: "digitalocean",
    serviceName:
      normalizeText(override?.serviceName) || "neroa-one-repair-queue-service",
    queueName: normalizeText(override?.queueName) || "neroa-one.repair-queue",
    serviceType: "future_repair_queue_service",
    readyForDispatch: false,
    notes:
      normalizedNotes.length > 0
        ? normalizedNotes
        : [
            "Future DigitalOcean repair workers may persist, retrieve, and dispatch repair queue items here.",
            "Current repair queue lane remains backend-only, storage-free, and does not trigger downstream workers."
          ]
  });
}

export function createCustomerSafeRepairSummary(args: {
  sourceDecision: NeroaOneRepairQueueSourceDecision;
  status?: NeroaOneRepairQueueItemStatus | null;
  repairSummary?: string | null;
  customerSafeSummary?: string | null;
}): string {
  const status = neroaOneRepairQueueItemStatusSchema.parse(args.status ?? "queued");
  const sanitizedSummary = sanitizeCustomerSafeRepairText(
    normalizeText(args.customerSafeSummary) || normalizeText(args.repairSummary)
  );

  return assertCustomerSafeRepairSummary(
    sanitizedSummary ||
      getDefaultCustomerSafeRepairSummary(args.sourceDecision, status)
  );
}

export function validateOutputReviewDecisionForRepairQueue(args: {
  decision: NeroaOneOutputReviewDecision;
}): NeroaOneRepairQueueDecisionValidationResult {
  const decision = normalizeText(args.decision) as NeroaOneOutputReviewDecision;

  if (
    !neroaOneRepairQueueLane.acceptedSourceDecisions.some(
      (allowedDecision) => allowedDecision === decision
    )
  ) {
    return buildRejectedDecisionValidationResult(
      decision,
      `Output review decision ${decision} cannot create a repair queue item. Allowed decisions: ${neroaOneRepairQueueLane.acceptedSourceDecisions.join(", ")}.`
    );
  }

  const sourceDecision = neroaOneRepairQueueSourceDecisionSchema.parse(decision);
  const requiredDestinations = getAllowedOutputReviewNextDestinations(sourceDecision);

  if (
    sourceDecision === "needs_repair" &&
    !requiredDestinations.includes("repair_lane")
  ) {
    throw new Error(
      "Repair queue lane must stay aligned with the output review needs_repair destination contract."
    );
  }

  if (
    sourceDecision === "rerun_required" &&
    !requiredDestinations.includes("rerun_lane")
  ) {
    throw new Error(
      "Repair queue lane must stay aligned with the output review rerun_required destination contract."
    );
  }

  return {
    allowed: true,
    reviewLane: neroaOneOutputReviewLane,
    repairLane: neroaOneRepairQueueLane,
    decision: sourceDecision,
    requiredDestinations
  };
}

export function validateOutputReviewForRepairQueue(args: {
  review: NeroaOneOutputReviewRecord;
}): NeroaOneRepairQueueReviewValidationResult {
  if (neroaOneRepairQueueLane.upstreamLaneId !== neroaOneOutputReviewLane.laneId) {
    throw new Error(
      "Repair queue lane must reference the output review lane as its only upstream boundary."
    );
  }

  const reviewResult = neroaOneOutputReviewRecordSchema.safeParse(args.review);

  if (!reviewResult.success) {
    const [issue] = reviewResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "review";

    return buildRejectedReviewValidationResult(
      `Output review is invalid for the repair queue boundary at ${issuePath}.`
    );
  }

  const review = reviewResult.data;
  const decisionValidation = validateOutputReviewDecisionForRepairQueue({
    decision: review.decision
  });

  if (!decisionValidation.allowed) {
    return buildRejectedReviewValidationResult(
      `Output review ${review.reviewId} has decision ${review.decision} and cannot create a repair queue item.`
    );
  }

  return {
    allowed: true,
    reviewLane: neroaOneOutputReviewLane,
    repairLane: neroaOneRepairQueueLane,
    review
  };
}

export function canCreateRepairQueueItemFromOutputReview(args: {
  review: NeroaOneOutputReviewRecord;
}) {
  return validateOutputReviewForRepairQueue(args).allowed;
}

export function createRepairQueueItemFromOutputReview(args: {
  review: NeroaOneOutputReviewRecord;
  repairType?: NeroaOneRepairQueueType | null;
  priority?: NeroaOneRepairQueuePriority | null;
  status?: NeroaOneRepairQueueItemStatus | null;
  repairSummary?: string | null;
  internalRepairNotes?: readonly string[] | null;
  customerSafeSummary?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  futureRepairServiceTarget?: Partial<NeroaOneFutureRepairServiceTarget> | null;
}): NeroaOneRepairQueueItem {
  const reviewValidation = validateOutputReviewForRepairQueue({
    review: args.review
  });

  if (!reviewValidation.allowed) {
    throw new Error(reviewValidation.reason);
  }

  const review = reviewValidation.review;
  const sourceDecision = neroaOneRepairQueueSourceDecisionSchema.parse(review.decision);
  const status = neroaOneRepairQueueItemStatusSchema.parse(args.status ?? "queued");
  const repairType = resolveRepairType(sourceDecision, args.repairType);
  const createdAt = normalizeText(args.createdAt) || review.createdAt;
  const updatedAt = normalizeText(args.updatedAt) || createdAt;
  const repairSummary =
    normalizeText(args.repairSummary) || getDefaultRepairSummary(review, repairType);

  return neroaOneRepairQueueItemSchema.parse({
    repairItemId: buildRepairItemId({
      reviewId: review.reviewId,
      createdAt
    }),
    workspaceId: review.workspaceId,
    projectId: review.projectId,
    taskId: review.taskId,
    outputId: review.outputId,
    reviewId: review.reviewId,
    sourceDecision,
    repairType,
    priority: resolveRepairPriority({
      decision: sourceDecision,
      priority: args.priority
    }),
    status,
    repairSummary,
    internalRepairNotes: buildInternalRepairNotes({
      review,
      status,
      repairType,
      internalRepairNotes: args.internalRepairNotes
    }),
    customerSafeSummary: createCustomerSafeRepairSummary({
      sourceDecision,
      status,
      repairSummary: review.customerVisibleSummary,
      customerSafeSummary: args.customerSafeSummary ?? args.repairSummary
    }),
    createdAt,
    updatedAt,
    futureRepairServiceTarget: buildFutureRepairServiceTarget(args.futureRepairServiceTarget)
  });
}

export function createRepairQueueItemsFromOutputReviews(args: {
  reviews: readonly NeroaOneOutputReviewRecord[];
  repairType?: NeroaOneRepairQueueType | null;
  priority?: NeroaOneRepairQueuePriority | null;
  status?: NeroaOneRepairQueueItemStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}) {
  return args.reviews.map((review) =>
    createRepairQueueItemFromOutputReview({
      review,
      repairType: args.repairType,
      priority: args.priority,
      status: args.status,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt
    })
  );
}

export function getCustomerSafeRepairQueueItemView(args: {
  item: NeroaOneRepairQueueItem;
}): NeroaOneCustomerSafeRepairQueueItemView {
  const item = neroaOneRepairQueueItemSchema.parse(args.item);

  return neroaOneCustomerSafeRepairQueueItemViewSchema.parse({
    repairItemId: item.repairItemId,
    workspaceId: item.workspaceId,
    projectId: item.projectId,
    taskId: item.taskId,
    outputId: item.outputId,
    reviewId: item.reviewId,
    sourceDecision: item.sourceDecision,
    repairType: item.repairType,
    priority: item.priority,
    status: item.status,
    customerSafeSummary: createCustomerSafeRepairSummary({
      sourceDecision: item.sourceDecision,
      status: item.status,
      customerSafeSummary: item.customerSafeSummary
    }),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  });
}

export function getRepairQueueSourceDecisions() {
  return [...neroaOneRepairQueueLane.acceptedSourceDecisions];
}

export function getRepairQueueItemStatuses() {
  return [...neroaOneRepairQueueLane.allowedStatuses];
}

export function getRepairQueuePriorities() {
  return [...neroaOneRepairQueueLane.allowedPriorities];
}

export function getRepairQueueTypes() {
  return [...neroaOneRepairQueueLane.supportedRepairTypes];
}
