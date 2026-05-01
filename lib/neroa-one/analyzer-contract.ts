import { z } from "zod";
import { spaceContextSchema, type SpaceContext } from "./schemas.ts";

const trimmedStringSchema = z.string().trim().min(1);
const nullableTrimmedStringSchema = z.string().trim().min(1).nullable();
const stringListSchema = z.array(trimmedStringSchema);

export const neroaOneAnalyzerTaskRequestTypeSchema = z.enum([
  "new_request",
  "revision",
  "change_direction",
  "problem_bug",
  "question_decision"
]);

export const neroaOneAnalyzerTaskWorkflowLaneSchema = z.enum([
  "requests",
  "revisions",
  "roadmap_updates",
  "execution_review",
  "decisions",
  "qc_evidence"
]);

export const neroaOneAnalyzerTaskSourceTypeSchema = z.enum([
  "customer_request",
  "decision_follow_up",
  "change_review_follow_up",
  "roadmap_follow_up",
  "signal_cleanup"
]);

export const neroaOneAnalyzerOutcomeSchema = z.enum([
  "ready_to_build",
  "needs_customer_answer",
  "roadmap_revision_required",
  "blocked_missing_information",
  "rejected_outside_scope"
]);

export const neroaOneAnalyzerSourceSchema = z.enum([
  "digitalocean_service",
  "mock_fallback"
]);

export const neroaOneAnalyzerTaskPayloadSchema = z
  .object({
    taskId: trimmedStringSchema,
    title: trimmedStringSchema,
    request: trimmedStringSchema,
    normalizedRequest: nullableTrimmedStringSchema.default(null),
    roadmapArea: nullableTrimmedStringSchema.default(null),
    requestType: neroaOneAnalyzerTaskRequestTypeSchema.nullable().default(null),
    workflowLane: neroaOneAnalyzerTaskWorkflowLaneSchema.nullable().default(null),
    sourceType: neroaOneAnalyzerTaskSourceTypeSchema.nullable().default(null),
    createdAt: nullableTrimmedStringSchema.default(null),
    updatedAt: nullableTrimmedStringSchema.default(null)
  })
  .strict();

export const neroaOneTaskAnalysisRequestSchema = z
  .object({
    requestId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    source: z.enum(["command_center", "build_room", "system"]).default("command_center"),
    task: neroaOneAnalyzerTaskPayloadSchema,
    spaceContext: spaceContextSchema,
    compatibility: z
      .object({
        preserveCurrentBehavior: z.boolean(),
        caller: trimmedStringSchema
      })
      .strict()
  })
  .strict();

export const neroaOneTaskAnalysisResponseSchema = z
  .object({
    requestId: trimmedStringSchema,
    analyzedAt: trimmedStringSchema,
    analyzer: z
      .object({
        source: neroaOneAnalyzerSourceSchema,
        version: trimmedStringSchema
      })
      .strict(),
    outcome: neroaOneAnalyzerOutcomeSchema,
    reasoning: z
      .object({
        summary: trimmedStringSchema,
        reasons: stringListSchema.default([]),
        missingInformation: stringListSchema.default([]),
        customerQuestions: stringListSchema.default([])
      })
      .strict(),
    effects: z
      .object({
        buildRoomReady: z.boolean(),
        requiresRoadmapReview: z.boolean(),
        shouldHoldForCustomerAnswer: z.boolean(),
        shouldReject: z.boolean()
      })
      .strict(),
    metadata: z.record(z.string(), z.unknown()).default({})
  })
  .strict();

export type NeroaOneAnalyzerTaskRequestType = z.infer<
  typeof neroaOneAnalyzerTaskRequestTypeSchema
>;
export type NeroaOneAnalyzerTaskWorkflowLane = z.infer<
  typeof neroaOneAnalyzerTaskWorkflowLaneSchema
>;
export type NeroaOneAnalyzerTaskSourceType = z.infer<
  typeof neroaOneAnalyzerTaskSourceTypeSchema
>;
export type NeroaOneAnalyzerOutcome = z.infer<typeof neroaOneAnalyzerOutcomeSchema>;
export type NeroaOneAnalyzerSource = z.infer<typeof neroaOneAnalyzerSourceSchema>;
export type NeroaOneAnalyzerTaskPayload = z.infer<typeof neroaOneAnalyzerTaskPayloadSchema>;
export type NeroaOneTaskAnalysisRequest = z.infer<typeof neroaOneTaskAnalysisRequestSchema>;
export type NeroaOneTaskAnalysisResponse = z.infer<typeof neroaOneTaskAnalysisResponseSchema>;

export type NeroaOneTaskAnalysisRequestInput = {
  requestId?: string | null;
  workspaceId: string;
  projectId: string;
  source?: NeroaOneTaskAnalysisRequest["source"];
  task: Omit<NeroaOneAnalyzerTaskPayload, "taskId"> & {
    taskId?: string | null;
  };
  spaceContext: SpaceContext;
  compatibility?: Partial<NeroaOneTaskAnalysisRequest["compatibility"]> | null;
};
