import { z } from "zod";
import {
  NEROA_ONE_OUTPUT_REVIEW_DECISIONS,
  getAllowedOutputReviewNextDestinations,
  neroaOneOutputReviewDecisionSchema,
  neroaOneOutputReviewLane,
  neroaOneOutputReviewRecordSchema,
  type NeroaOneOutputReviewDecision,
  type NeroaOneOutputReviewRecord
} from "./output-review.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema);

export const NEROA_ONE_QC_STATION_JOB_TYPES = [
  "browser_inspection",
  "screenshot_capture",
  "video_recording",
  "walkthrough_generation",
  "qc_report_generation"
] as const;

export const NEROA_ONE_QC_STATION_JOB_STATUSES = [
  "queued",
  "running",
  "completed",
  "failed",
  "canceled"
] as const;

export const neroaOneQcStationJobTypeSchema = z.enum(NEROA_ONE_QC_STATION_JOB_TYPES);
export const neroaOneQcStationJobStatusSchema = z.enum(NEROA_ONE_QC_STATION_JOB_STATUSES);

export type NeroaOneQcStationJobType = z.infer<typeof neroaOneQcStationJobTypeSchema>;
export type NeroaOneQcStationJobStatus = z.infer<typeof neroaOneQcStationJobStatusSchema>;

export const neroaOneQcStationEvidencePolicySchema = z
  .object({
    requiresScreenshots: z.boolean(),
    requiresVideoRecording: z.boolean(),
    requiresWalkthroughArtifact: z.boolean(),
    requiresQcReport: z.boolean(),
    retainEvidenceInLibrary: z.literal(true),
    customerSafeEvidenceRequired: z.boolean(),
    notes: stringListSchema.default([])
  })
  .strict();

export type NeroaOneQcStationEvidencePolicy = z.infer<
  typeof neroaOneQcStationEvidencePolicySchema
>;

export const neroaOneQcStationFutureDigitalOceanWorkerTargetSchema = z
  .object({
    deploymentProvider: z.literal("digitalocean"),
    serviceName: trimmedStringSchema,
    queueName: trimmedStringSchema,
    workerType: z.literal("future_browser_qc_worker"),
    readyForExecution: z.literal(false),
    notes: stringListSchema.min(1)
  })
  .strict();

export type NeroaOneQcStationFutureDigitalOceanWorkerTarget = z.infer<
  typeof neroaOneQcStationFutureDigitalOceanWorkerTargetSchema
>;

export const neroaOneQcStationJobRecordSchema = z
  .object({
    qcJobId: trimmedStringSchema,
    workspaceId: trimmedStringSchema,
    projectId: trimmedStringSchema,
    taskId: trimmedStringSchema,
    outputId: trimmedStringSchema,
    reviewId: trimmedStringSchema,
    jobType: neroaOneQcStationJobTypeSchema,
    targetUrl: trimmedStringSchema,
    expectedResultSummary: trimmedStringSchema,
    status: neroaOneQcStationJobStatusSchema,
    evidencePolicy: neroaOneQcStationEvidencePolicySchema,
    createdAt: trimmedStringSchema,
    futureDigitalOceanWorkerTarget: neroaOneQcStationFutureDigitalOceanWorkerTargetSchema
  })
  .strict();

export type NeroaOneQcStationJobRecord = z.infer<typeof neroaOneQcStationJobRecordSchema>;

export const neroaOneQcStationLaneDefinitionSchema = z
  .object({
    laneId: z.literal("qc_station"),
    upstreamLaneId: z.literal("output_review"),
    requiredReviewDecision: z.literal("approve_for_qc"),
    backendOnly: z.literal(true),
    extractionReady: z.literal(true),
    ownsFutureQcJobContractsOnly: z.literal(true),
    createsCustomerSafeEvidenceSummariesNow: z.literal(false),
    dependsOnLegacyBrowserExtension: z.literal(false),
    dispatchesRealQcJobsNow: z.literal(false),
    ownsUiNow: z.literal(false),
    writesPersistenceNow: z.literal(false),
    displayPurposeInternal: trimmedStringSchema,
    internalOnlyNotes: stringListSchema.min(1),
    supportedJobTypes: z.tuple([
      z.literal("browser_inspection"),
      z.literal("screenshot_capture"),
      z.literal("video_recording"),
      z.literal("walkthrough_generation"),
      z.literal("qc_report_generation")
    ]),
    allowedStatuses: z.tuple([
      z.literal("queued"),
      z.literal("running"),
      z.literal("completed"),
      z.literal("failed"),
      z.literal("canceled")
    ]),
    futureExtractionTarget: z
      .object({
        serviceName: trimmedStringSchema,
        queueName: trimmedStringSchema,
        notes: stringListSchema.min(1)
      })
      .strict()
  })
  .strict();

export type NeroaOneQcStationLaneDefinition = z.infer<
  typeof neroaOneQcStationLaneDefinitionSchema
>;

export type NeroaOneQcStationReviewValidationResult =
  | {
      allowed: true;
      reviewLane: typeof neroaOneOutputReviewLane;
      qcLane: NeroaOneQcStationLaneDefinition;
      review: NeroaOneOutputReviewRecord;
    }
  | {
      allowed: false;
      reviewLane: typeof neroaOneOutputReviewLane;
      qcLane: NeroaOneQcStationLaneDefinition;
      reason: string;
    };

export type NeroaOneQcStationDecisionValidationResult =
  | {
      allowed: true;
      reviewLane: typeof neroaOneOutputReviewLane;
      qcLane: NeroaOneQcStationLaneDefinition;
      decision: NeroaOneOutputReviewDecision;
      requiredDecision: NeroaOneOutputReviewDecision;
    }
  | {
      allowed: false;
      reviewLane: typeof neroaOneOutputReviewLane;
      qcLane: NeroaOneQcStationLaneDefinition;
      decision: NeroaOneOutputReviewDecision;
      requiredDecision: NeroaOneOutputReviewDecision;
      reason: string;
    };

export interface NeroaOneQcStationStorageAdapter {
  saveQcJob(job: NeroaOneQcStationJobRecord): Promise<void>;
  getQcJobsByOutputId(outputId: string): Promise<NeroaOneQcStationJobRecord[]>;
}

export const neroaOneQcStationLane = neroaOneQcStationLaneDefinitionSchema.parse({
  laneId: "qc_station",
  upstreamLaneId: "output_review",
  requiredReviewDecision: "approve_for_qc",
  backendOnly: true,
  extractionReady: true,
  ownsFutureQcJobContractsOnly: true,
  createsCustomerSafeEvidenceSummariesNow: false,
  dependsOnLegacyBrowserExtension: false,
  dispatchesRealQcJobsNow: false,
  ownsUiNow: false,
  writesPersistenceNow: false,
  displayPurposeInternal:
    "Defines the backend-only QC Station lane contract for future browser, walkthrough, recording, and evidence jobs after output review approval.",
  internalOnlyNotes: [
    "This lane must stay detached from the legacy browser extension, Live View message channels, browser-tab activation flows, and extension-owned storage paths.",
    "This lane is contract-only for future DigitalOcean browser or QC workers and must not change current runtime behavior, schema, or queue execution."
  ],
  supportedJobTypes: [
    "browser_inspection",
    "screenshot_capture",
    "video_recording",
    "walkthrough_generation",
    "qc_report_generation"
  ],
  allowedStatuses: ["queued", "running", "completed", "failed", "canceled"],
  futureExtractionTarget: {
    serviceName: "neroa-one-qc-station-service",
    queueName: "neroa-one.qc-station",
    notes: [
      "Future DigitalOcean workers may consume QC Station jobs here after output review approves work for QC.",
      "Current lane is extraction-ready only and must not bind browser sessions, dispatch workers, or write evidence."
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

function buildRejectedReviewValidationResult(
  reason: string
): NeroaOneQcStationReviewValidationResult {
  return {
    allowed: false,
    reviewLane: neroaOneOutputReviewLane,
    qcLane: neroaOneQcStationLane,
    reason:
      normalizeText(reason) ||
      "Output review decision is not eligible for the Neroa One QC Station lane."
  };
}

function buildRejectedDecisionValidationResult(args: {
  decision: NeroaOneOutputReviewDecision;
  requiredDecision: NeroaOneOutputReviewDecision;
  reason: string;
}): NeroaOneQcStationDecisionValidationResult {
  return {
    allowed: false,
    reviewLane: neroaOneOutputReviewLane,
    qcLane: neroaOneQcStationLane,
    decision: args.decision,
    requiredDecision: args.requiredDecision,
    reason:
      normalizeText(args.reason) ||
      `Review decision ${args.decision} is not eligible for QC Station job creation.`
  };
}

function buildQcJobId(args: {
  reviewId: string;
  jobType: NeroaOneQcStationJobType;
  createdAt: string;
}) {
  const timestampPart = normalizeText(args.createdAt).replace(/[^0-9TZ]/g, "");
  return `${args.reviewId}:qc:${args.jobType}:${timestampPart}`;
}

function buildExpectedResultSummary(
  review: NeroaOneOutputReviewRecord,
  jobType: NeroaOneQcStationJobType
) {
  switch (jobType) {
    case "browser_inspection":
      return `Run a browser inspection pass for output ${review.outputId} and confirm the approved implementation behaves as expected.`;
    case "screenshot_capture":
      return `Capture screenshots for output ${review.outputId} that document the approved implementation state for evidence review.`;
    case "video_recording":
      return `Record a verification video for output ${review.outputId} that shows the approved implementation path end to end.`;
    case "walkthrough_generation":
      return `Generate a walkthrough artifact for output ${review.outputId} that explains the approved implementation path and expected checkpoints.`;
    case "qc_report_generation":
      return `Generate a QC report for output ${review.outputId} that summarizes inspection findings and linked evidence.`;
  }
}

function buildDefaultEvidencePolicy(
  jobType: NeroaOneQcStationJobType
): NeroaOneQcStationEvidencePolicy {
  switch (jobType) {
    case "browser_inspection":
      return neroaOneQcStationEvidencePolicySchema.parse({
        requiresScreenshots: true,
        requiresVideoRecording: false,
        requiresWalkthroughArtifact: false,
        requiresQcReport: false,
        retainEvidenceInLibrary: true,
        customerSafeEvidenceRequired: false,
        notes: [
          "Inspection jobs should preserve checkpoint evidence for later QC review."
        ]
      });
    case "screenshot_capture":
      return neroaOneQcStationEvidencePolicySchema.parse({
        requiresScreenshots: true,
        requiresVideoRecording: false,
        requiresWalkthroughArtifact: false,
        requiresQcReport: false,
        retainEvidenceInLibrary: true,
        customerSafeEvidenceRequired: true,
        notes: [
          "Screenshot capture should produce customer-safe evidence when possible."
        ]
      });
    case "video_recording":
      return neroaOneQcStationEvidencePolicySchema.parse({
        requiresScreenshots: false,
        requiresVideoRecording: true,
        requiresWalkthroughArtifact: false,
        requiresQcReport: false,
        retainEvidenceInLibrary: true,
        customerSafeEvidenceRequired: true,
        notes: [
          "Video jobs should produce a durable recording artifact for later review."
        ]
      });
    case "walkthrough_generation":
      return neroaOneQcStationEvidencePolicySchema.parse({
        requiresScreenshots: true,
        requiresVideoRecording: false,
        requiresWalkthroughArtifact: true,
        requiresQcReport: false,
        retainEvidenceInLibrary: true,
        customerSafeEvidenceRequired: false,
        notes: [
          "Walkthrough generation should preserve checkpoints that support later evidence packaging."
        ]
      });
    case "qc_report_generation":
      return neroaOneQcStationEvidencePolicySchema.parse({
        requiresScreenshots: false,
        requiresVideoRecording: false,
        requiresWalkthroughArtifact: false,
        requiresQcReport: true,
        retainEvidenceInLibrary: true,
        customerSafeEvidenceRequired: true,
        notes: [
          "QC report generation should summarize prior evidence without creating a new runtime path."
        ]
      });
  }
}

function buildFutureDigitalOceanWorkerTarget(
  jobType: NeroaOneQcStationJobType
): NeroaOneQcStationFutureDigitalOceanWorkerTarget {
  return neroaOneQcStationFutureDigitalOceanWorkerTargetSchema.parse({
    deploymentProvider: "digitalocean",
    serviceName: "neroa-one-qc-station-worker",
    queueName: `neroa-one.qc-station.${jobType}`,
    workerType: "future_browser_qc_worker",
    readyForExecution: false,
    notes: [
      `Future DigitalOcean worker may execute ${jobType} jobs once the browser and evidence runtime is approved for implementation.`,
      "Current contract must remain backend-only and must not depend on the legacy browser extension runtime."
    ]
  });
}

export function validateOutputReviewDecisionForQcStation(args: {
  decision: NeroaOneOutputReviewDecision;
}): NeroaOneQcStationDecisionValidationResult {
  const decision = neroaOneOutputReviewDecisionSchema.parse(args.decision);
  const requiredDecision = neroaOneOutputReviewDecisionSchema.parse(
    neroaOneQcStationLane.requiredReviewDecision
  );
  const allowedDestinations = getAllowedOutputReviewNextDestinations(requiredDecision);

  if (
    allowedDestinations.length !== 1 ||
    allowedDestinations[0] !== neroaOneQcStationLane.laneId
  ) {
    throw new Error(
      "QC Station lane must stay aligned with the output review approve_for_qc destination contract."
    );
  }

  if (decision !== requiredDecision) {
    return buildRejectedDecisionValidationResult({
      decision,
      requiredDecision,
      reason: `Review decision ${decision} cannot create a QC Station job. Required decision: ${requiredDecision}.`
    });
  }

  return {
    allowed: true,
    reviewLane: neroaOneOutputReviewLane,
    qcLane: neroaOneQcStationLane,
    decision,
    requiredDecision
  };
}

export function validateApprovedOutputReviewForQcStation(args: {
  review: NeroaOneOutputReviewRecord;
}): NeroaOneQcStationReviewValidationResult {
  if (neroaOneQcStationLane.upstreamLaneId !== neroaOneOutputReviewLane.laneId) {
    throw new Error(
      "QC Station lane must reference the output review lane as its only upstream boundary."
    );
  }

  const reviewResult = neroaOneOutputReviewRecordSchema.safeParse(args.review);

  if (!reviewResult.success) {
    const [issue] = reviewResult.error.issues;
    const issuePath = issue?.path?.length ? issue.path.join(".") : "review";

    return buildRejectedReviewValidationResult(
      `Output review is invalid for the QC Station boundary at ${issuePath}.`
    );
  }

  const review = reviewResult.data;
  const decisionValidation = validateOutputReviewDecisionForQcStation({
    decision: review.decision
  });

  if (!decisionValidation.allowed) {
    return buildRejectedReviewValidationResult(
      `Output review ${review.reviewId} has decision ${review.decision} and cannot create a QC Station job. Required decision: ${decisionValidation.requiredDecision}.`
    );
  }

  return {
    allowed: true,
    reviewLane: neroaOneOutputReviewLane,
    qcLane: neroaOneQcStationLane,
    review
  };
}

export function canCreateQcStationJobFromOutputReview(args: {
  review: NeroaOneOutputReviewRecord;
}) {
  return validateApprovedOutputReviewForQcStation(args).allowed;
}

export function createQueuedQcStationJobFromApprovedOutputReview(args: {
  review: NeroaOneOutputReviewRecord;
  jobType: NeroaOneQcStationJobType;
  targetUrl: string;
  expectedResultSummary?: string | null;
  evidencePolicy?: NeroaOneQcStationEvidencePolicy | null;
  createdAt?: string | null;
  futureDigitalOceanWorkerTarget?: NeroaOneQcStationFutureDigitalOceanWorkerTarget | null;
}): NeroaOneQcStationJobRecord {
  const reviewValidation = validateApprovedOutputReviewForQcStation({
    review: args.review
  });

  if (!reviewValidation.allowed) {
    throw new Error(reviewValidation.reason);
  }

  const review = reviewValidation.review;
  const jobType = neroaOneQcStationJobTypeSchema.parse(args.jobType);
  const createdAt = normalizeText(args.createdAt) || review.createdAt;

  return neroaOneQcStationJobRecordSchema.parse({
    qcJobId: buildQcJobId({
      reviewId: review.reviewId,
      jobType,
      createdAt
    }),
    workspaceId: review.workspaceId,
    projectId: review.projectId,
    taskId: review.taskId,
    outputId: review.outputId,
    reviewId: review.reviewId,
    jobType,
    targetUrl: normalizeText(args.targetUrl),
    expectedResultSummary:
      normalizeText(args.expectedResultSummary) || buildExpectedResultSummary(review, jobType),
    status: "queued",
    evidencePolicy:
      args.evidencePolicy != null
        ? neroaOneQcStationEvidencePolicySchema.parse({
            ...args.evidencePolicy,
            notes: normalizeStringList(args.evidencePolicy.notes)
          })
        : buildDefaultEvidencePolicy(jobType),
    createdAt,
    futureDigitalOceanWorkerTarget:
      args.futureDigitalOceanWorkerTarget != null
        ? neroaOneQcStationFutureDigitalOceanWorkerTargetSchema.parse({
            ...args.futureDigitalOceanWorkerTarget,
            notes: normalizeStringList(args.futureDigitalOceanWorkerTarget.notes)
          })
        : buildFutureDigitalOceanWorkerTarget(jobType)
  });
}

export function createQueuedQcStationJobsFromApprovedOutputReview(args: {
  review: NeroaOneOutputReviewRecord;
  jobTypes: readonly NeroaOneQcStationJobType[];
  targetUrl: string;
  createdAt?: string | null;
}) {
  return args.jobTypes.map((jobType) =>
    createQueuedQcStationJobFromApprovedOutputReview({
      review: args.review,
      jobType,
      targetUrl: args.targetUrl,
      createdAt: args.createdAt
    })
  );
}

export function getQcStationJobTypes() {
  return [...neroaOneQcStationLane.supportedJobTypes];
}

export function getQcStationJobStatuses() {
  return [...neroaOneQcStationLane.allowedStatuses];
}

export function isOutputReviewDecisionEligibleForQcStation(
  decision: NeroaOneOutputReviewDecision
) {
  return validateOutputReviewDecisionForQcStation({
    decision
  }).allowed;
}

export function getRejectedOutputReviewDecisionsForQcStation() {
  return NEROA_ONE_OUTPUT_REVIEW_DECISIONS.filter(
    (decision) => decision !== neroaOneQcStationLane.requiredReviewDecision
  );
}
