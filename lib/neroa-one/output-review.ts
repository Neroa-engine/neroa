import { z } from "zod";
import {
  neroaOneCodexOutputBoxLane,
  neroaOneCodexOutputRecordSchema,
  neroaOneCodexOutputStatusSchema,
  type NeroaOneCodexOutputStatus,
  type NeroaOneCodexOutputRecord
} from "./codex-output-box.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

export const NEROA_ONE_OUTPUT_REVIEW_DECISIONS = [
  "approve_for_qc",
  "needs_repair",
  "rerun_required",
  "strategy_escalation",
  "customer_followup",
  "archive_complete"
] as const;

export const NEROA_ONE_OUTPUT_REVIEW_REPAIR_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent"
] as const;

export const NEROA_ONE_OUTPUT_REVIEW_NEXT_DESTINATIONS = [
  "qc_station",
  "repair_lane",
  "rerun_lane",
  "strategy_room_review",
  "command_center_follow_up",
  "archive_only"
] as const;

export const NEROA_ONE_OUTPUT_REVIEW_FRESH_REVIEW_ELIGIBLE_OUTPUT_STATUSES = [
  "pending_review"
] as const;

export const neroaOneOutputReviewDecisionSchema = z.enum(NEROA_ONE_OUTPUT_REVIEW_DECISIONS);
export const neroaOneOutputReviewRepairPrioritySchema = z.enum(
  NEROA_ONE_OUTPUT_REVIEW_REPAIR_PRIORITIES
);
export const neroaOneOutputReviewNextDestinationSchema = z.enum(
  NEROA_ONE_OUTPUT_REVIEW_NEXT_DESTINATIONS
);

export type NeroaOneOutputReviewDecision = z.infer<
  typeof neroaOneOutputReviewDecisionSchema
>;
export type NeroaOneOutputReviewRepairPriority = z.infer<
  typeof neroaOneOutputReviewRepairPrioritySchema
>;
export type NeroaOneOutputReviewNextDestination = z.infer<
  typeof neroaOneOutputReviewNextDestinationSchema
>;
export type NeroaOneOutputReviewFreshReviewEligibleOutputStatus =
  (typeof NEROA_ONE_OUTPUT_REVIEW_FRESH_REVIEW_ELIGIBLE_OUTPUT_STATUSES)[number];

const allowedNextDestinationsByDecisionSchema = z
  .object({
    approve_for_qc: z.tuple([z.literal("qc_station")]),
    needs_repair: z.tuple([z.literal("repair_lane")]),
    rerun_required: z.tuple([z.literal("rerun_lane")]),
    strategy_escalation: z.tuple([z.literal("strategy_room_review")]),
    customer_followup: z.tuple([z.literal("command_center_follow_up")]),
    archive_complete: z.tuple([z.literal("archive_only")])
  })
  .strict();

export const neroaOneOutputReviewRecordSchema = z
  .object({
    reviewId: trimmedStringSchema,
    outputId: trimmedStringSchema,
    executionPacketId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    decision: neroaOneOutputReviewDecisionSchema,
    reasoningSummary: trimmedStringSchema,
    repairPriority: neroaOneOutputReviewRepairPrioritySchema.nullable(),
    customerVisibleSummary: trimmedStringSchema,
    internalNotes: stringListSchema.default([]),
    createdAt: trimmedStringSchema
  })
  .strict();

export type NeroaOneOutputReviewRecord = z.infer<typeof neroaOneOutputReviewRecordSchema>;

export const neroaOneOutputReviewLaneDefinitionSchema = z
  .object({
    laneId: z.literal("output_review"),
    upstreamLaneId: z.literal("codex_output_box"),
    backendOnly: z.literal(true),
    extractionReady: z.literal(true),
    performsRealReviewNow: z.literal(false),
    callsAiNow: z.literal(false),
    ownsUiNow: z.literal(false),
    writesPersistenceNow: z.literal(false),
    displayPurposeInternal: trimmedStringSchema,
    internalOnlyNotes: stringListSchema.min(1),
    eligibleFreshReviewOutputStatuses: z
      .tuple([z.literal("pending_review")]),
    allowedNextDestinationsByDecision: allowedNextDestinationsByDecisionSchema,
    futureExtractionTarget: z
      .object({
        serviceName: trimmedStringSchema,
        queueName: trimmedStringSchema,
        notes: stringListSchema.min(1)
      })
      .strict()
  })
  .strict();

export type NeroaOneOutputReviewLaneDefinition = z.infer<
  typeof neroaOneOutputReviewLaneDefinitionSchema
>;

export type NeroaOneOutputReviewOutputValidationResult =
  | {
      allowed: true;
      outputLane: typeof neroaOneCodexOutputBoxLane;
      reviewLane: NeroaOneOutputReviewLaneDefinition;
      output: NeroaOneCodexOutputRecord;
    }
  | {
      allowed: false;
      outputLane: typeof neroaOneCodexOutputBoxLane;
      reviewLane: NeroaOneOutputReviewLaneDefinition;
      reason: string;
    };

export type NeroaOneOutputReviewDestinationValidationResult =
  | {
      allowed: true;
      reviewLane: NeroaOneOutputReviewLaneDefinition;
      decision: NeroaOneOutputReviewDecision;
      destination: NeroaOneOutputReviewNextDestination;
    }
  | {
      allowed: false;
      reviewLane: NeroaOneOutputReviewLaneDefinition;
      decision: NeroaOneOutputReviewDecision;
      destination: NeroaOneOutputReviewNextDestination;
      reason: string;
    };

export interface NeroaOneOutputReviewStorageAdapter {
  saveOutputReview(review: NeroaOneOutputReviewRecord): Promise<void>;
  getOutputReviewsByOutputId(outputId: string): Promise<NeroaOneOutputReviewRecord[]>;
}

export const neroaOneOutputReviewLane = neroaOneOutputReviewLaneDefinitionSchema.parse({
  laneId: "output_review",
  upstreamLaneId: "codex_output_box",
  backendOnly: true,
  extractionReady: true,
  performsRealReviewNow: false,
  callsAiNow: false,
  ownsUiNow: false,
  writesPersistenceNow: false,
  displayPurposeInternal:
    "Defines the backend-only Neroa One review contract for Codex outputs before QC, repair, rerun, escalation, or archival routing.",
  internalOnlyNotes: [
    "This lane defines typed review decisions only and must not perform real AI review, queue release, or UI behavior changes.",
    "This lane must remain extraction-ready so a future review service can own review persistence and routing without changing the contract."
  ],
  eligibleFreshReviewOutputStatuses: ["pending_review"],
  allowedNextDestinationsByDecision: {
    approve_for_qc: ["qc_station"],
    needs_repair: ["repair_lane"],
    rerun_required: ["rerun_lane"],
    strategy_escalation: ["strategy_room_review"],
    customer_followup: ["command_center_follow_up"],
    archive_complete: ["archive_only"]
  },
  futureExtractionTarget: {
    serviceName: "neroa-one-output-review-service",
    queueName: "neroa-one.output-review",
    notes: [
      "Future DigitalOcean review services may own post-execution review persistence and routing here.",
      "Current lane is contract-only and must not call models, dispatch work, or mutate runtime execution state."
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

function buildRejectedOutputValidationResult(
  reason: string
): NeroaOneOutputReviewOutputValidationResult {
  return {
    allowed: false,
    outputLane: neroaOneCodexOutputBoxLane,
    reviewLane: neroaOneOutputReviewLane,
    reason: normalizeText(reason) || "Codex output is not eligible for Neroa One output review."
  };
}

function buildRejectedDestinationValidationResult(args: {
  decision: NeroaOneOutputReviewDecision;
  destination: NeroaOneOutputReviewNextDestination;
  reason: string;
}): NeroaOneOutputReviewDestinationValidationResult {
  return {
    allowed: false,
    reviewLane: neroaOneOutputReviewLane,
    decision: args.decision,
    destination: args.destination,
    reason:
      normalizeText(args.reason) ||
      `Destination ${args.destination} is not allowed for decision ${args.decision}.`
  };
}

function buildReviewId(args: {
  outputId: string;
  decision: NeroaOneOutputReviewDecision;
  createdAt: string;
}) {
  const timestampPart = normalizeText(args.createdAt).replace(/[^0-9TZ]/g, "");
  return `${args.outputId}:review:${args.decision}:${timestampPart}`;
}

function buildReasoningSummary(
  output: NeroaOneCodexOutputRecord,
  decision: NeroaOneOutputReviewDecision
) {
  const outputSummary = normalizeText(output.summary);

  switch (decision) {
    case "approve_for_qc":
      return `Placeholder review marked output ${output.outputId} as ready for QC without invoking any live reviewer logic. ${outputSummary}`.trim();
    case "needs_repair":
      return `Placeholder review marked output ${output.outputId} for deterministic repair handling only. ${outputSummary}`.trim();
    case "rerun_required":
      return `Placeholder review marked output ${output.outputId} for deterministic rerun handling only. ${outputSummary}`.trim();
    case "strategy_escalation":
      return `Placeholder review marked output ${output.outputId} for internal strategy escalation only. ${outputSummary}`.trim();
    case "customer_followup":
      return `Placeholder review marked output ${output.outputId} for customer follow-up preparation only. ${outputSummary}`.trim();
    case "archive_complete":
      return `Placeholder review marked output ${output.outputId} as complete for archival only. ${outputSummary}`.trim();
  }
}

function buildCustomerVisibleSummary(decision: NeroaOneOutputReviewDecision) {
  switch (decision) {
    case "approve_for_qc":
      return "Implementation output is ready for the next internal quality check.";
    case "needs_repair":
      return "Implementation output needs an internal repair pass before it can move forward.";
    case "rerun_required":
      return "Implementation output needs an internal rerun before it can move forward.";
    case "strategy_escalation":
      return "Implementation output exposed an internal planning issue that needs strategy review.";
    case "customer_followup":
      return "Implementation output needs a customer-facing follow-up before work can continue.";
    case "archive_complete":
      return "Implementation output is complete and ready for archival.";
  }
}

function resolveRepairPriority(
  decision: NeroaOneOutputReviewDecision,
  repairPriority: NeroaOneOutputReviewRepairPriority | null | undefined
) {
  if (repairPriority) {
    return neroaOneOutputReviewRepairPrioritySchema.parse(repairPriority);
  }

  switch (decision) {
    case "needs_repair":
      return "medium";
    case "rerun_required":
      return "high";
    default:
      return null;
  }
}

function buildInternalNotes(args: {
  output: NeroaOneCodexOutputRecord;
  decision: NeroaOneOutputReviewDecision;
  internalNotes?: readonly string[] | null;
}) {
  return normalizeStringList([
    `Placeholder decision ${args.decision} created from Codex output box item ${args.output.outputId}.`,
    `Output status at review time: ${args.output.outputStatus}.`,
    args.output.filesChanged.length > 0
      ? `Files changed: ${args.output.filesChanged.join(", ")}.`
      : "Files changed: none recorded.",
    args.output.testsRun.length > 0
      ? `Tests recorded: ${args.output.testsRun.join(", ")}.`
      : "Tests recorded: none.",
    ...(args.internalNotes ?? [])
  ]);
}

export function getEligibleCodexOutputStatusesForFreshReview() {
  return [...neroaOneOutputReviewLane.eligibleFreshReviewOutputStatuses];
}

export function isEligibleCodexOutputStatusForFreshReview(
  outputStatus: NeroaOneCodexOutputStatus
) {
  return getEligibleCodexOutputStatusesForFreshReview().some((status) => status === outputStatus);
}

export function getAllowedOutputReviewNextDestinations(
  decision: NeroaOneOutputReviewDecision
) {
  return [...neroaOneOutputReviewLane.allowedNextDestinationsByDecision[decision]];
}

export function validateCodexOutputItemForOutputReview(args: {
  output: NeroaOneCodexOutputRecord;
}): NeroaOneOutputReviewOutputValidationResult {
  if (neroaOneOutputReviewLane.upstreamLaneId !== neroaOneCodexOutputBoxLane.laneId) {
    throw new Error(
      "Output review lane must reference the Codex output box lane as its only upstream boundary."
    );
  }

  const outputResult = neroaOneCodexOutputRecordSchema.safeParse(args.output);

  if (!outputResult.success) {
    const [issue] = outputResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "output";

    return buildRejectedOutputValidationResult(
      `Codex output is invalid for the Neroa One output review boundary at ${issuePath}.`
    );
  }

  const output = outputResult.data;

  if (!isEligibleCodexOutputStatusForFreshReview(output.outputStatus)) {
    return buildRejectedOutputValidationResult(
      `Codex output ${output.outputId} has status ${output.outputStatus} and cannot create a fresh output review decision. Allowed fresh-review statuses: ${getEligibleCodexOutputStatusesForFreshReview().join(", ")}.`
    );
  }

  return {
    allowed: true,
    outputLane: neroaOneCodexOutputBoxLane,
    reviewLane: neroaOneOutputReviewLane,
    output
  };
}

export function validateOutputReviewNextDestination(args: {
  decision: NeroaOneOutputReviewDecision;
  destination: NeroaOneOutputReviewNextDestination;
}): NeroaOneOutputReviewDestinationValidationResult {
  const decision = neroaOneOutputReviewDecisionSchema.parse(args.decision);
  const destination = neroaOneOutputReviewNextDestinationSchema.parse(args.destination);
  const allowedDestinations = getAllowedOutputReviewNextDestinations(decision);

  if (!allowedDestinations.includes(destination)) {
    return buildRejectedDestinationValidationResult({
      decision,
      destination,
      reason: `Destination ${destination} is not allowed for decision ${decision}. Allowed destination: ${allowedDestinations.join(", ")}.`
    });
  }

  return {
    allowed: true,
    reviewLane: neroaOneOutputReviewLane,
    decision,
    destination
  };
}

export function isAllowedOutputReviewNextDestination(args: {
  decision: NeroaOneOutputReviewDecision;
  destination: NeroaOneOutputReviewNextDestination;
}) {
  return validateOutputReviewNextDestination(args).allowed;
}

export function createPlaceholderOutputReviewDecisionFromOutputItem(args: {
  output: NeroaOneCodexOutputRecord;
  decision: NeroaOneOutputReviewDecision;
  reasoningSummary?: string | null;
  repairPriority?: NeroaOneOutputReviewRepairPriority | null;
  customerVisibleSummary?: string | null;
  internalNotes?: readonly string[] | null;
  createdAt?: string | null;
}): NeroaOneOutputReviewRecord {
  const outputValidation = validateCodexOutputItemForOutputReview({
    output: args.output
  });

  if (!outputValidation.allowed) {
    throw new Error(outputValidation.reason);
  }

  const output = outputValidation.output;
  const decision = neroaOneOutputReviewDecisionSchema.parse(args.decision);
  const createdAt = normalizeText(args.createdAt) || output.receivedAt || output.createdAt;

  return neroaOneOutputReviewRecordSchema.parse({
    reviewId: buildReviewId({
      outputId: output.outputId,
      decision,
      createdAt
    }),
    outputId: output.outputId,
    executionPacketId: output.executionPacketId,
    workspaceId: output.workspaceId,
    projectId: output.projectId,
    taskId: output.taskId,
    decision,
    reasoningSummary:
      normalizeText(args.reasoningSummary) || buildReasoningSummary(output, decision),
    repairPriority: resolveRepairPriority(decision, args.repairPriority),
    customerVisibleSummary:
      normalizeText(args.customerVisibleSummary) || buildCustomerVisibleSummary(decision),
    internalNotes: buildInternalNotes({
      output,
      decision,
      internalNotes: args.internalNotes
    }),
    createdAt
  });
}

export function createPlaceholderOutputReviewDecisionsFromOutputItems(args: {
  outputs: readonly NeroaOneCodexOutputRecord[];
  decision: NeroaOneOutputReviewDecision;
  createdAt?: string | null;
}) {
  return args.outputs.map((output) =>
    createPlaceholderOutputReviewDecisionFromOutputItem({
      output,
      decision: args.decision,
      createdAt: args.createdAt
    })
  );
}
