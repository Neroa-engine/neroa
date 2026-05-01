import { z } from "zod";
import {
  neroaOneAnalyzerOutcomeSchema,
  type NeroaOneAnalyzerOutcome
} from "./analyzer-contract.ts";
import {
  neroaOneOutcomeQueueItemSchema,
  type NeroaOneOutcomeQueueItem,
  type NeroaOneOutcomeQueueName
} from "./outcome-queues.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

export const neroaOneOutcomeLaneOwnerSchema = z.enum([
  "neroa_one_execution_router",
  "neroa_one_customer_resolution_router",
  "neroa_one_roadmap_review_router",
  "neroa_one_scope_guard"
]);

export const neroaOneOutcomeLaneInputSourceSchema = z.enum([
  "command_center",
  "build_room",
  "system"
]);

export const neroaOneOutcomeLaneDestinationSchema = z.enum([
  "command_center_follow_up",
  "strategy_room_review",
  "codex_execution_room",
  "qc_station",
  "archive_only"
]);

export const neroaOneOutcomeLaneArchiveBehaviorSchema = z.enum([
  "retain_until_execution_handoff",
  "retain_until_customer_resolution",
  "retain_until_roadmap_resolution",
  "retain_until_scope_resolution",
  "archive_after_scope_rejection"
]);

export const neroaOneOutcomeLaneCustomerVisibilitySchema = z.enum([
  "customer_safe_status_only",
  "customer_safe_question_required",
  "customer_safe_roadmap_review_required",
  "customer_safe_scope_rejection"
]);

export const neroaOneOutcomeLaneExtractionModeSchema = z.enum([
  "service_ready",
  "queue_ready",
  "worker_ready"
]);

export const neroaOneOutcomeLaneFutureExtractionTargetSchema = z
  .object({
    serviceName: trimmedStringSchema,
    queueName: trimmedStringSchema,
    extractionMode: neroaOneOutcomeLaneExtractionModeSchema,
    notes: stringListSchema
  })
  .strict();

export const neroaOneOutcomeLaneDefinitionSchema = z
  .object({
    laneId: neroaOneAnalyzerOutcomeSchema,
    displayPurposeInternal: trimmedStringSchema,
    customerFacingMeaning: trimmedStringSchema,
    customerVisibility: neroaOneOutcomeLaneCustomerVisibilitySchema,
    internalOnlyNotes: stringListSchema,
    owner: neroaOneOutcomeLaneOwnerSchema,
    allowedInputSources: z.array(neroaOneOutcomeLaneInputSourceSchema).min(1),
    allowedNextDestinations: z.array(neroaOneOutcomeLaneDestinationSchema).min(1),
    requiresCustomerAction: z.boolean(),
    requiresRoadmapImpactReview: z.boolean(),
    canEnterCodexExecution: z.boolean(),
    canEnterQcStation: z.boolean(),
    archiveBehavior: neroaOneOutcomeLaneArchiveBehaviorSchema,
    futureExtractionTarget: neroaOneOutcomeLaneFutureExtractionTargetSchema
  })
  .strict();

export type NeroaOneOutcomeLaneOwner = z.infer<typeof neroaOneOutcomeLaneOwnerSchema>;
export type NeroaOneOutcomeLaneInputSource = z.infer<typeof neroaOneOutcomeLaneInputSourceSchema>;
export type NeroaOneOutcomeLaneDestination = z.infer<
  typeof neroaOneOutcomeLaneDestinationSchema
>;
export type NeroaOneOutcomeLaneArchiveBehavior = z.infer<
  typeof neroaOneOutcomeLaneArchiveBehaviorSchema
>;
export type NeroaOneOutcomeLaneCustomerVisibility = z.infer<
  typeof neroaOneOutcomeLaneCustomerVisibilitySchema
>;
export type NeroaOneOutcomeLaneExtractionMode = z.infer<
  typeof neroaOneOutcomeLaneExtractionModeSchema
>;
export type NeroaOneOutcomeLaneFutureExtractionTarget = z.infer<
  typeof neroaOneOutcomeLaneFutureExtractionTargetSchema
>;
export type NeroaOneOutcomeLaneDefinition = z.infer<
  typeof neroaOneOutcomeLaneDefinitionSchema
>;

export const neroaOneOutcomeLanes = {
  ready_to_build: {
    laneId: "ready_to_build",
    displayPurposeInternal:
      "Holds analyzer-approved requests that can be packaged for internal Codex execution.",
    customerFacingMeaning:
      "The request is approved for backend preparation toward implementation.",
    customerVisibility: "customer_safe_status_only",
    internalOnlyNotes: [
      "Lane remains backend-only and must not expose internal queue mechanics to customers.",
      "This modular-monolith lane should be separable into an execution-routing service later."
    ],
    owner: "neroa_one_execution_router",
    allowedInputSources: ["command_center", "build_room", "system"],
    allowedNextDestinations: ["codex_execution_room", "archive_only"],
    requiresCustomerAction: false,
    requiresRoadmapImpactReview: false,
    canEnterCodexExecution: true,
    canEnterQcStation: false,
    archiveBehavior: "retain_until_execution_handoff",
    futureExtractionTarget: {
      serviceName: "neroa-one-ready-to-build-lane",
      queueName: "neroa-one.ready-to-build",
      extractionMode: "queue_ready",
      notes: [
        "Future DigitalOcean queue or worker may consume this lane after analyzer approval.",
        "Keep routing contract stable so execution packaging can be extracted without UI coupling."
      ]
    }
  },
  needs_customer_answer: {
    laneId: "needs_customer_answer",
    displayPurposeInternal:
      "Holds requests that require a customer answer before backend execution can proceed.",
    customerFacingMeaning:
      "A customer clarification or decision is needed before the request can move forward.",
    customerVisibility: "customer_safe_question_required",
    internalOnlyNotes: [
      "Only customer-safe follow-up summaries should leave this lane.",
      "Lane classifies analyzer outcomes only and must not own customer follow-up statuses, response types, or future customer-follow-up service routing.",
      "Lane should be extractable into a customer-resolution service without changing queue item shape."
    ],
    owner: "neroa_one_customer_resolution_router",
    allowedInputSources: ["command_center", "system"],
    allowedNextDestinations: ["command_center_follow_up", "archive_only"],
    requiresCustomerAction: true,
    requiresRoadmapImpactReview: false,
    canEnterCodexExecution: false,
    canEnterQcStation: false,
    archiveBehavior: "retain_until_customer_resolution",
    futureExtractionTarget: {
      serviceName: "neroa-one-customer-answer-lane",
      queueName: "neroa-one.needs-customer-answer",
      extractionMode: "service_ready",
      notes: [
        "Future DigitalOcean service can own outbound follow-up generation and answer reconciliation.",
        "Keep the lane detached from UI submission flow and persistence timing."
      ]
    }
  },
  roadmap_revision_required: {
    laneId: "roadmap_revision_required",
    displayPurposeInternal:
      "Holds requests that require roadmap or sequencing review before execution eligibility can be reconsidered.",
    customerFacingMeaning:
      "The request affects roadmap or sequencing decisions and needs planning review first.",
    customerVisibility: "customer_safe_roadmap_review_required",
    internalOnlyNotes: [
      "This lane must preserve roadmap-review boundaries and avoid direct execution handoff.",
      "Future extraction should support a dedicated roadmap-impact worker or review queue."
    ],
    owner: "neroa_one_roadmap_review_router",
    allowedInputSources: ["command_center", "build_room", "system"],
    allowedNextDestinations: ["strategy_room_review", "archive_only"],
    requiresCustomerAction: false,
    requiresRoadmapImpactReview: true,
    canEnterCodexExecution: false,
    canEnterQcStation: false,
    archiveBehavior: "retain_until_roadmap_resolution",
    futureExtractionTarget: {
      serviceName: "neroa-one-roadmap-review-lane",
      queueName: "neroa-one.roadmap-revision-required",
      extractionMode: "worker_ready",
      notes: [
        "Future DigitalOcean worker can package roadmap-review artifacts for Strategy Room review.",
        "Preserve strict backend ownership so planning review remains decoupled from UI panels."
      ]
    }
  },
  blocked_missing_information: {
    laneId: "blocked_missing_information",
    displayPurposeInternal:
      "Holds under-specified requests until enough information exists for deterministic backend routing.",
    customerFacingMeaning:
      "More information is needed before the request can be evaluated for execution.",
    customerVisibility: "customer_safe_question_required",
    internalOnlyNotes: [
      "Lane should only expose customer-safe blockers and never internal analyzer implementation details.",
      "Lane classifies analyzer outcomes only and must not own customer follow-up statuses, response types, or future customer-follow-up service routing.",
      "Future extraction may split clarification planning into its own bounded service."
    ],
    owner: "neroa_one_customer_resolution_router",
    allowedInputSources: ["command_center", "system"],
    allowedNextDestinations: ["command_center_follow_up", "archive_only"],
    requiresCustomerAction: true,
    requiresRoadmapImpactReview: false,
    canEnterCodexExecution: false,
    canEnterQcStation: false,
    archiveBehavior: "retain_until_customer_resolution",
    futureExtractionTarget: {
      serviceName: "neroa-one-missing-information-lane",
      queueName: "neroa-one.blocked-missing-information",
      extractionMode: "service_ready",
      notes: [
        "Future DigitalOcean service can turn missing-information blockers into deterministic follow-up payloads.",
        "Keep lane entry validation local and side-effect free so extraction remains straightforward."
      ]
    }
  },
  rejected_outside_scope: {
    laneId: "rejected_outside_scope",
    displayPurposeInternal:
      "Holds requests that must be closed out because they sit outside the approved project scope.",
    customerFacingMeaning:
      "The request is outside the currently approved scope and cannot proceed as-is.",
    customerVisibility: "customer_safe_scope_rejection",
    internalOnlyNotes: [
      "Lane should preserve a durable backend rejection record without exposing internal scope heuristics.",
      "Future extraction may move this into a dedicated scope-guard service or audit queue."
    ],
    owner: "neroa_one_scope_guard",
    allowedInputSources: ["command_center", "build_room", "system"],
    allowedNextDestinations: ["command_center_follow_up", "archive_only"],
    requiresCustomerAction: false,
    requiresRoadmapImpactReview: false,
    canEnterCodexExecution: false,
    canEnterQcStation: false,
    archiveBehavior: "archive_after_scope_rejection",
    futureExtractionTarget: {
      serviceName: "neroa-one-scope-guard-lane",
      queueName: "neroa-one.rejected-outside-scope",
      extractionMode: "queue_ready",
      notes: [
        "Future DigitalOcean queue may support audit, analytics, or escalation workflows for rejected requests.",
        "Keep customer-safe scope outcomes separated from internal rationale and routing internals."
      ]
    }
  }
} as const satisfies Record<NeroaOneOutcomeQueueName, NeroaOneOutcomeLaneDefinition>;

export type NeroaOneOutcomeLaneId = keyof typeof neroaOneOutcomeLanes;

export type NeroaOneOutcomeLaneValidationResult =
  | {
      allowed: true;
      lane: NeroaOneOutcomeLaneDefinition;
    }
  | {
      allowed: false;
      lane: NeroaOneOutcomeLaneDefinition;
      reason: string;
    };

function normalizeText(value: string | null | undefined) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function buildRejectedValidationResult(
  lane: NeroaOneOutcomeLaneDefinition,
  reason: string
): NeroaOneOutcomeLaneValidationResult {
  return {
    allowed: false,
    lane,
    reason: normalizeText(reason) || "Queue item is not eligible for this lane."
  };
}

export function getNeroaOneOutcomeLaneDefinition(
  laneId: NeroaOneOutcomeLaneId | NeroaOneAnalyzerOutcome
) {
  return neroaOneOutcomeLaneDefinitionSchema.parse(neroaOneOutcomeLanes[laneId]);
}

export function isAllowedNeroaOneLaneInputSource(
  laneId: NeroaOneOutcomeLaneId,
  inputSource: NeroaOneOutcomeLaneInputSource
) {
  return getNeroaOneOutcomeLaneDefinition(laneId).allowedInputSources.includes(inputSource);
}

export function canNeroaOneOutcomeLaneEnterCodexExecution(
  laneId: NeroaOneOutcomeLaneId | NeroaOneAnalyzerOutcome
) {
  const lane = getNeroaOneOutcomeLaneDefinition(laneId);
  return lane.canEnterCodexExecution && lane.allowedNextDestinations.includes("codex_execution_room");
}

export function getNeroaOneOutcomeLaneIdsEligibleForCodexExecution() {
  return (Object.keys(neroaOneOutcomeLanes) as NeroaOneOutcomeLaneId[]).filter((laneId) =>
    canNeroaOneOutcomeLaneEnterCodexExecution(laneId)
  );
}

export function validateNeroaOneOutcomeQueueItemForLane(args: {
  laneId: NeroaOneOutcomeLaneId;
  item: NeroaOneOutcomeQueueItem;
}): NeroaOneOutcomeLaneValidationResult {
  const lane = getNeroaOneOutcomeLaneDefinition(args.laneId);
  const item = neroaOneOutcomeQueueItemSchema.parse(args.item);

  if (item.analyzerOutcome !== lane.laneId) {
    return buildRejectedValidationResult(
      lane,
      `Queue item outcome ${item.analyzerOutcome} does not match lane ${lane.laneId}.`
    );
  }

  if (!lane.allowedInputSources.includes(item.source.requestSource)) {
    return buildRejectedValidationResult(
      lane,
      `Input source ${item.source.requestSource} is not allowed to enter lane ${lane.laneId}.`
    );
  }

  if (lane.canEnterCodexExecution && !lane.allowedNextDestinations.includes("codex_execution_room")) {
    return buildRejectedValidationResult(
      lane,
      `Lane ${lane.laneId} is marked execution-eligible without a Codex execution destination.`
    );
  }

  if (lane.canEnterQcStation && !lane.allowedNextDestinations.includes("qc_station")) {
    return buildRejectedValidationResult(
      lane,
      `Lane ${lane.laneId} is marked QC-eligible without a QC destination.`
    );
  }

  return {
    allowed: true,
    lane
  };
}

export function isNeroaOneOutcomeQueueItemAllowedInLane(args: {
  laneId: NeroaOneOutcomeLaneId;
  item: NeroaOneOutcomeQueueItem;
}) {
  return validateNeroaOneOutcomeQueueItemForLane(args).allowed;
}

export function assertNeroaOneOutcomeQueueItemAllowedInLane(args: {
  laneId: NeroaOneOutcomeLaneId;
  item: NeroaOneOutcomeQueueItem;
}) {
  const validation = validateNeroaOneOutcomeQueueItemForLane(args);

  if (!validation.allowed) {
    throw new Error(validation.reason);
  }

  return validation.lane;
}
