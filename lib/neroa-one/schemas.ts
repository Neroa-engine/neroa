import { z } from "zod";

const trimmedStringSchema = z.string().trim().min(1);
const nullableTrimmedStringSchema = z.string().trim().min(1).nullable();
const stringListSchema = z.array(trimmedStringSchema);

export const commandCenterLanes = [
  "requests",
  "revisions",
  "roadmap_updates",
  "execution_review",
  "decisions"
] as const;

export const customerIntentTypes = [
  "new_request",
  "revision",
  "roadmap_update",
  "execution_review",
  "decision"
] as const;

export const neroaOneTriggers = [
  "page_load",
  "navigation",
  "lane_switch",
  "dashboard_display",
  "saved_task_view",
  "filtering",
  "customer_message",
  "manual_review",
  "task_handoff",
  "revision_analysis",
  "roadmap_impact",
  "architecture_change",
  "execution_planning",
  "failure_recovery"
] as const;

export const neroaOneReasoningTiers = [
  "none",
  "cheap_classification",
  "standard_reasoning",
  "high_reasoning"
] as const;

export const neroaOneRoomIds = [
  "project_room",
  "strategy_room",
  "command_center",
  "build_room",
  "library"
] as const;

export const neroaOneRoomClassifications = [
  "dashboard_control_panel",
  "planning_room",
  "customer_operations_room",
  "execution_room",
  "evidence_room"
] as const;

export const commandCenterLaneSchema = z.enum(commandCenterLanes);
export const customerIntentTypeSchema = z.enum(customerIntentTypes);
export const neroaOneTriggerSchema = z.enum(neroaOneTriggers);
export const neroaOneReasoningTierSchema = z.enum(neroaOneReasoningTiers);
export const neroaOneRoomIdSchema = z.enum(neroaOneRoomIds);
export const neroaOneRoomClassificationSchema = z.enum(neroaOneRoomClassifications);

export const neroaOneRoomContextSchema = z
  .object({
    roomId: neroaOneRoomIdSchema,
    classification: neroaOneRoomClassificationSchema,
    localStateAllowed: z.boolean(),
    metadataWritesAllowed: z.boolean()
  })
  .strict();

export const spaceContextInputSchema = z
  .object({
    workspaceId: trimmedStringSchema,
    projectId: nullableTrimmedStringSchema.optional(),
    projectTitle: trimmedStringSchema,
    projectDescription: nullableTrimmedStringSchema.optional(),
    projectTruthSummary: nullableTrimmedStringSchema.optional(),
    currentPhase: nullableTrimmedStringSchema.optional(),
    currentFocus: z.union([trimmedStringSchema, stringListSchema]).optional(),
    nextRecommendedAction: nullableTrimmedStringSchema.optional(),
    projectMetadata: z
      .object({
        archived: z.boolean().optional(),
        strategyState: z
          .object({
            revisionRecords: z.array(z.unknown()).optional(),
            planningThreadState: z
              .object({
                messages: z.array(z.unknown()).optional()
              })
              .partial()
              .nullable()
              .optional()
          })
          .partial()
          .nullable()
          .optional(),
        executionState: z
          .object({
            pendingExecutions: z.array(z.unknown()).optional(),
            executionPackets: z.array(z.unknown()).optional()
          })
          .partial()
          .nullable()
          .optional(),
        assets: z.array(z.unknown()).optional(),
        commandCenterDecisions: z.array(z.unknown()).optional(),
        commandCenterChangeReviews: z.array(z.unknown()).optional(),
        commandCenterTasks: z.array(z.unknown()).optional(),
        commandCenterPreviewState: z
          .object({
            status: nullableTrimmedStringSchema.optional()
          })
          .partial()
          .nullable()
          .optional(),
        commandCenterApprovedDesignPackage: z
          .object({
            status: nullableTrimmedStringSchema.optional()
          })
          .partial()
          .nullable()
          .optional(),
        buildSession: z
          .object({
            scope: z.record(z.string(), z.unknown()).optional()
          })
          .partial()
          .nullable()
          .optional(),
        saasIntake: z.unknown().nullable().optional(),
        mobileAppIntake: z.unknown().nullable().optional()
      })
      .partial()
      .nullable()
      .optional(),
    roomContexts: z.array(neroaOneRoomContextSchema).optional()
  })
  .strict();

export const usageCreditStateSchema = z
  .object({
    status: z.literal("placeholder"),
    note: trimmedStringSchema
  })
  .strict();

export const spaceContextSchema = z
  .object({
    spaceId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    compatibilityMode: z.boolean(),
    project: z
      .object({
        title: trimmedStringSchema,
        description: nullableTrimmedStringSchema,
        state: trimmedStringSchema,
        truthSummary: trimmedStringSchema,
        currentPhase: trimmedStringSchema,
        currentFocus: stringListSchema,
        nextRecommendedAction: trimmedStringSchema
      })
      .strict(),
    strategyState: z
      .object({
        status: trimmedStringSchema,
        revisionCount: z.number().int().nonnegative(),
        planningThreadMessageCount: z.number().int().nonnegative()
      })
      .strict(),
    commandState: z
      .object({
        decisionCount: z.number().int().nonnegative(),
        changeReviewCount: z.number().int().nonnegative(),
        taskCount: z.number().int().nonnegative(),
        previewStatus: nullableTrimmedStringSchema,
        approvedPackageStatus: nullableTrimmedStringSchema
      })
      .strict(),
    buildState: z
      .object({
        pendingExecutionCount: z.number().int().nonnegative(),
        executionPacketCount: z.number().int().nonnegative()
      })
      .strict(),
    libraryEvidenceState: z
      .object({
        assetCount: z.number().int().nonnegative()
      })
      .strict(),
    usageCreditState: usageCreditStateSchema,
    roomContexts: z.array(neroaOneRoomContextSchema)
  })
  .strict();

export const customerIntentEnvelopeSchema = z
  .object({
    messageId: nullableTrimmedStringSchema.default(null),
    source: z.enum([
      "command_center",
      "strategy_room",
      "project_room",
      "build_room",
      "library",
      "system"
    ]),
    rawText: trimmedStringSchema,
    normalizedText: trimmedStringSchema,
    intentType: customerIntentTypeSchema,
    lane: commandCenterLaneSchema,
    signals: stringListSchema,
    originalPayload: z.record(z.string(), z.unknown()).nullable().default(null)
  })
  .strict();

export const neroaOneDecisionGateSchema = z
  .object({
    status: z.enum(["allow", "needs_strategy_review", "block"]),
    reason: trimmedStringSchema,
    blockedActions: stringListSchema,
    requiredNextStep: nullableTrimmedStringSchema.default(null)
  })
  .strict();

export const neroaOneCostPolicySchema = z
  .object({
    trigger: neroaOneTriggerSchema,
    currentMode: z.literal("deterministic_only"),
    aiAllowedNow: z.boolean(),
    allowedReasoningTierNow: neroaOneReasoningTierSchema,
    futureReasoningTier: neroaOneReasoningTierSchema,
    reason: trimmedStringSchema
  })
  .strict();

export const roadmapImpactAssessmentSchema = z
  .object({
    summary: trimmedStringSchema,
    touchedAreas: stringListSchema,
    needsStrategyReview: z.boolean(),
    decisionGate: neroaOneDecisionGateSchema,
    emittedEvent: trimmedStringSchema
  })
  .strict();

export const buildRoomHandoffPackageSchema = z
  .object({
    packageId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskTitle: trimmedStringSchema,
    taskSummary: trimmedStringSchema,
    originalIntent: customerIntentEnvelopeSchema,
    decisionGate: neroaOneDecisionGateSchema,
    emittedEvent: trimmedStringSchema
  })
  .strict();

export const neroaOneRequestSchema = z
  .object({
    requestId: trimmedStringSchema,
    trigger: neroaOneTriggerSchema,
    intent: customerIntentEnvelopeSchema,
    spaceContext: spaceContextSchema,
    payload: z.record(z.string(), z.unknown()).nullable().default(null)
  })
  .strict();

export const neroaOneResponseSchema = z
  .object({
    requestId: trimmedStringSchema,
    lane: commandCenterLaneSchema,
    intentType: customerIntentTypeSchema,
    decisionGate: neroaOneDecisionGateSchema,
    costPolicy: neroaOneCostPolicySchema,
    roadmapImpact: roadmapImpactAssessmentSchema.nullable().default(null),
    buildRoomHandoff: buildRoomHandoffPackageSchema.nullable().default(null),
    emittedEvents: stringListSchema,
    requiresModel: z.literal(false)
  })
  .strict();

export type CommandCenterLane = z.infer<typeof commandCenterLaneSchema>;
export type CustomerIntentType = z.infer<typeof customerIntentTypeSchema>;
export type NeroaOneTrigger = z.infer<typeof neroaOneTriggerSchema>;
export type NeroaOneReasoningTier = z.infer<typeof neroaOneReasoningTierSchema>;
export type NeroaOneRoomId = z.infer<typeof neroaOneRoomIdSchema>;
export type NeroaOneRoomClassification = z.infer<typeof neroaOneRoomClassificationSchema>;
export type NeroaOneRoomContext = z.infer<typeof neroaOneRoomContextSchema>;
export type SpaceContextInput = z.infer<typeof spaceContextInputSchema>;
export type SpaceContext = z.infer<typeof spaceContextSchema>;
export type CustomerIntentEnvelope = z.infer<typeof customerIntentEnvelopeSchema>;
export type NeroaOneDecisionGate = z.infer<typeof neroaOneDecisionGateSchema>;
export type NeroaOneCostPolicy = z.infer<typeof neroaOneCostPolicySchema>;
export type RoadmapImpactAssessment = z.infer<typeof roadmapImpactAssessmentSchema>;
export type BuildRoomHandoffPackage = z.infer<typeof buildRoomHandoffPackageSchema>;
export type NeroaOneRequest = z.infer<typeof neroaOneRequestSchema>;
export type NeroaOneResponse = z.infer<typeof neroaOneResponseSchema>;
