import { z } from "zod";
import { RISK_LEVELS, type RiskLevel } from "../governance/constants/literals.ts";
import {
  neroaOneAnalyzerOutcomeSchema,
  neroaOneAnalyzerSourceSchema,
  type NeroaOneAnalyzerOutcome,
  type NeroaOneTaskAnalysisRequest,
  type NeroaOneTaskAnalysisResponse
} from "./analyzer-contract.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

const requestSourceSchema = z.enum(["command_center", "build_room", "system"]);
const riskLevelSchema = z.enum(RISK_LEVELS);

export type NeroaOneOutcomeQueueName = NeroaOneAnalyzerOutcome;

export type NeroaOneOutcomeQueueDefinition = {
  queue: NeroaOneOutcomeQueueName;
  description: string;
  executionEligible: boolean;
  customerActionRequired: boolean;
  roadmapReviewRequired: boolean;
};

export const neroaOneOutcomeQueues = {
  ready_to_build: {
    queue: "ready_to_build",
    description: "Approved backend routing state for internal execution preparation.",
    executionEligible: true,
    customerActionRequired: false,
    roadmapReviewRequired: false
  },
  needs_customer_answer: {
    queue: "needs_customer_answer",
    description: "Paused until Neroa One receives a customer decision or clarification.",
    executionEligible: false,
    customerActionRequired: true,
    roadmapReviewRequired: false
  },
  roadmap_revision_required: {
    queue: "roadmap_revision_required",
    description: "Escalated because roadmap or sequencing must be revised before execution.",
    executionEligible: false,
    customerActionRequired: false,
    roadmapReviewRequired: true
  },
  blocked_missing_information: {
    queue: "blocked_missing_information",
    description: "Blocked because the request lacks the minimum information needed to proceed.",
    executionEligible: false,
    customerActionRequired: true,
    roadmapReviewRequired: false
  },
  rejected_outside_scope: {
    queue: "rejected_outside_scope",
    description: "Rejected because the request falls outside the currently approved scope.",
    executionEligible: false,
    customerActionRequired: false,
    roadmapReviewRequired: false
  }
} as const satisfies Record<NeroaOneOutcomeQueueName, NeroaOneOutcomeQueueDefinition>;

export const neroaOneOutcomeQueueSourceSchema = z
  .object({
    requestSource: requestSourceSchema,
    analyzerSource: neroaOneAnalyzerSourceSchema,
    caller: trimmedStringSchema.nullable()
  })
  .strict();

export const neroaOneOutcomeQueueItemSchema = z
  .object({
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    analyzerOutcome: neroaOneAnalyzerOutcomeSchema,
    normalizedRequest: trimmedStringSchema,
    riskLevel: riskLevelSchema,
    readinessBlockers: stringListSchema.default([]),
    customerFacingSummary: trimmedStringSchema,
    internalSummary: trimmedStringSchema,
    createdAt: trimmedStringSchema,
    source: neroaOneOutcomeQueueSourceSchema
  })
  .strict();

export const neroaOneOutcomeQueueEntrySchema = z
  .object({
    queue: neroaOneAnalyzerOutcomeSchema,
    item: neroaOneOutcomeQueueItemSchema
  })
  .strict();

export type NeroaOneOutcomeQueueSource = z.infer<typeof neroaOneOutcomeQueueSourceSchema>;
export type NeroaOneOutcomeQueueItem = z.infer<typeof neroaOneOutcomeQueueItemSchema>;
export type NeroaOneOutcomeQueueEntry = z.infer<typeof neroaOneOutcomeQueueEntrySchema>;

export type CreateNeroaOneOutcomeQueueItemArgs = {
  request: NeroaOneTaskAnalysisRequest;
  response: NeroaOneTaskAnalysisResponse;
  riskLevel?: RiskLevel | null;
  readinessBlockers?: string[] | null;
  customerFacingSummary?: string | null;
  internalSummary?: string | null;
  createdAt?: string | null;
};

function normalizeText(value: string | null | undefined) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function resolveRiskLevel(outcome: NeroaOneOutcomeQueueName): RiskLevel {
  switch (outcome) {
    case "ready_to_build":
      return "low";
    case "needs_customer_answer":
    case "blocked_missing_information":
      return "moderate";
    case "roadmap_revision_required":
      return "high";
    case "rejected_outside_scope":
      return "low";
  }
}

function resolveReadinessBlockers(response: NeroaOneTaskAnalysisResponse): string[] {
  const blockers = [
    ...response.reasoning.missingInformation,
    ...(response.outcome === "needs_customer_answer"
      ? response.reasoning.customerQuestions
      : response.reasoning.reasons)
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  return Array.from(new Set(blockers));
}

function buildInternalSummary(
  request: NeroaOneTaskAnalysisRequest,
  response: NeroaOneTaskAnalysisResponse
) {
  const details = [
    ...response.reasoning.reasons,
    ...response.reasoning.missingInformation.map((value) => `Missing information: ${value}`),
    ...response.reasoning.customerQuestions.map((value) => `Customer question: ${value}`)
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  return [
    `Queue ${response.outcome} for task ${request.task.taskId}.`,
    normalizeText(response.reasoning.summary),
    ...details
  ].join(" ");
}

export function getNeroaOneOutcomeQueueDefinition(outcome: NeroaOneOutcomeQueueName) {
  return neroaOneOutcomeQueues[outcome];
}

export function createNeroaOneOutcomeQueueSource(
  request: NeroaOneTaskAnalysisRequest,
  response: NeroaOneTaskAnalysisResponse
): NeroaOneOutcomeQueueSource {
  return neroaOneOutcomeQueueSourceSchema.parse({
    requestSource: request.source,
    analyzerSource: response.analyzer.source,
    caller: normalizeText(request.compatibility.caller) || null
  });
}

export function createNeroaOneOutcomeQueueItem(
  args: CreateNeroaOneOutcomeQueueItemArgs
): NeroaOneOutcomeQueueItem {
  const normalizedRequest =
    normalizeText(args.request.task.normalizedRequest) ||
    normalizeText(args.request.task.request);

  return neroaOneOutcomeQueueItemSchema.parse({
    workspaceId: args.request.workspaceId,
    projectId: args.request.projectId,
    taskId: args.request.task.taskId,
    analyzerOutcome: args.response.outcome,
    normalizedRequest,
    riskLevel: args.riskLevel ?? resolveRiskLevel(args.response.outcome),
    readinessBlockers: args.readinessBlockers ?? resolveReadinessBlockers(args.response),
    customerFacingSummary:
      normalizeText(args.customerFacingSummary) || normalizeText(args.response.reasoning.summary),
    internalSummary:
      normalizeText(args.internalSummary) || buildInternalSummary(args.request, args.response),
    createdAt: normalizeText(args.createdAt) || args.response.analyzedAt,
    source: createNeroaOneOutcomeQueueSource(args.request, args.response)
  });
}

export function createNeroaOneOutcomeQueueEntry(
  args: CreateNeroaOneOutcomeQueueItemArgs
): NeroaOneOutcomeQueueEntry {
  return neroaOneOutcomeQueueEntrySchema.parse({
    queue: args.response.outcome,
    item: createNeroaOneOutcomeQueueItem(args)
  });
}

export function createNeroaOneOutcomeQueueEntries(
  items: readonly CreateNeroaOneOutcomeQueueItemArgs[]
): NeroaOneOutcomeQueueEntry[] {
  return items.map((item) => createNeroaOneOutcomeQueueEntry(item));
}
