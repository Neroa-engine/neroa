import type {
  BuildRoomRun,
  BuildRoomTaskDetail
} from "@/lib/build-room/types";
import type { ArchitectureBlueprint } from "../architecture/types.ts";
import type { ExecutionState, ExecutionPacket } from "../execution/types.ts";
import type { GovernancePolicy } from "../governance/types.ts";
import type { ProjectBrief } from "../project-brief.ts";
import {
  buildTaskQAValidationContext,
  type TaskQAValidationContext,
  type QAValidationResult
} from "../qa/index.ts";
import type { RoadmapPlan } from "../roadmap/types.ts";
import { buildCostGuardrailDecision } from "./cost-guardrails.ts";
import {
  buildBillingProtectionTotals,
  mergeChargeEvents
} from "./ledger.ts";
import { buildRetryDecision } from "./retry-policy.ts";
import { buildBillingProtectionSummary } from "./summary.ts";
import {
  billingProtectionStateSchema,
  chargeEventSchema,
  chargeabilityDecisionSchema,
  failureClassificationSchema,
  retryDecisionSchema,
  type BillingProtectionCurrentStatus,
  type BillingProtectionState,
  type ChargeEvent,
  type ChargeabilityDecision,
  type CostGuardrailDecision,
  type FailureClassification,
  type RetryDecision
} from "./types.ts";

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value: string) {
  return normalizeSpace(value).toLowerCase();
}

function uniqueStrings(values: readonly string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const value of values) {
    const normalized = normalizeSearchText(value);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(normalizeSpace(value));
  }

  return items;
}

function sortRuns(runs: readonly BuildRoomRun[]) {
  return [...runs].sort((left, right) => {
    const leftTime = left.completedAt ?? left.updatedAt ?? left.createdAt;
    const rightTime = right.completedAt ?? right.updatedAt ?? right.createdAt;
    return rightTime.localeCompare(leftTime);
  });
}

function latestRun(taskDetail?: BuildRoomTaskDetail | null) {
  return taskDetail ? sortRuns(taskDetail.runs)[0] ?? null : null;
}

function latestFailedRun(taskDetail?: BuildRoomTaskDetail | null) {
  return (
    taskDetail
      ? sortRuns(taskDetail.runs).find((run) => run.status === "failed") ?? null
      : null
  );
}

function taskRunFinished(taskDetail?: BuildRoomTaskDetail | null) {
  const status = taskDetail?.task.status;

  return (
    status === "codex_complete" ||
    status === "worker_complete" ||
    status === "worker_failed" ||
    status === "needs_revision"
  );
}

function buildFailureCorpus(args: {
  executionPacket: ExecutionPacket;
  taskDetail?: BuildRoomTaskDetail | null;
}) {
  return normalizeSearchText(
    [
      args.executionPacket.requestSummary,
      args.taskDetail?.task.userRequest,
      args.taskDetail?.task.codexResponsePayload?.summary,
      ...(args.taskDetail?.task.codexResponsePayload?.warnings ?? []),
      ...(args.taskDetail?.task.codexResponsePayload?.blockers ?? []),
      latestRun(args.taskDetail)?.logExcerpt,
      JSON.stringify(latestRun(args.taskDetail)?.responsePayload ?? {}),
      ...((args.taskDetail?.artifacts ?? []).map((artifact) => artifact.textContent ?? "")),
      ...((args.taskDetail?.artifacts ?? []).map((artifact) =>
        JSON.stringify(artifact.payload ?? {})
      ))
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function classifyScopeOrApprovalFailure(args: {
  governancePolicy: GovernancePolicy;
  executionPacket: ExecutionPacket;
}): FailureClassification | null {
  const approvalState = args.governancePolicy.currentApprovalState;
  const scopeDecision = args.executionPacket.scopeDecision;

  if (scopeDecision.outcome === "governance_blocked") {
    return failureClassificationSchema.parse({
      class: "governance_blocked",
      systemCaused: false,
      retryEligible: false,
      nonBillable: true,
      severity: "high",
      reason: scopeDecision.reason
    });
  }

  if (approvalState.status === "revision_required" || scopeDecision.requiresApprovalReset) {
    return failureClassificationSchema.parse({
      class: "strategy_revision_invalidated",
      systemCaused: false,
      retryEligible: false,
      nonBillable: true,
      severity: "high",
      reason:
        "A saved strategy or roadmap revision invalidated the prior approval state, so the execution remains protected."
    });
  }

  if (!args.executionPacket.readiness.approvalAllowed) {
    return failureClassificationSchema.parse({
      class: "approval_missing",
      systemCaused: false,
      retryEligible: false,
      nonBillable: true,
      severity: "high",
      reason:
        "Roadmap scope approval is still missing, so the execution cannot become billable."
    });
  }

  if (scopeDecision.requiresArchitectureRevision) {
    return failureClassificationSchema.parse({
      class: "architecture_revision_required",
      systemCaused: false,
      retryEligible: false,
      nonBillable: true,
      severity: "high",
      reason: scopeDecision.reason
    });
  }

  if (scopeDecision.requiresRoadmapRevision) {
    return failureClassificationSchema.parse({
      class: "roadmap_revision_required",
      systemCaused: false,
      retryEligible: false,
      nonBillable: true,
      severity: "high",
      reason: scopeDecision.reason
    });
  }

  if (scopeDecision.shouldRemainPendingExecution || args.executionPacket.status === "pending_execution") {
    return failureClassificationSchema.parse({
      class: "pending_execution",
      systemCaused: false,
      retryEligible: false,
      nonBillable: true,
      severity: "medium",
      reason:
        "This request is still captured as pending execution, so it must stay protected and non-billable."
    });
  }

  return null;
}

function classifyRunFailure(args: {
  governancePolicy: GovernancePolicy;
  executionPacket: ExecutionPacket;
  taskDetail?: BuildRoomTaskDetail | null;
}): FailureClassification | null {
  const failedRun = latestFailedRun(args.taskDetail);
  const taskStatus = args.taskDetail?.task.status ?? null;

  if (!failedRun && taskStatus !== "worker_failed" && taskStatus !== "needs_revision") {
    return null;
  }

  const corpus = buildFailureCorpus(args);
  const failedRuns =
    args.taskDetail?.runs.filter((run) => run.status === "failed").length ?? 0;

  if (/planner loop|same blocker repeated|retry exhausted|loop detected/.test(corpus)) {
    return failureClassificationSchema.parse({
      class: "planner_loop",
      systemCaused: true,
      retryEligible: false,
      nonBillable: true,
      severity: "high",
      reason:
        "The execution is circling through the same failure shape, so Neroa must stop and protect the customer from planner-loop waste."
    });
  }

  if (/schema|zod|validation error|invalid schema/.test(corpus)) {
    return failureClassificationSchema.parse({
      class: "schema_failure",
      systemCaused: true,
      retryEligible: false,
      nonBillable: true,
      severity: "high",
      reason:
        "A schema or validation contract failed inside the execution path, so the run remains protected."
    });
  }

  if (/tool contract|callback secret|callback url|contract mismatch|payload shape/.test(corpus)) {
    return failureClassificationSchema.parse({
      class: "tool_contract_failure",
      systemCaused: true,
      retryEligible: false,
      nonBillable: true,
      severity: "high",
      reason:
        "A tool or callback contract failed, so Neroa should protect the run and require a fix before charging."
    });
  }

  if (
    args.executionPacket.domainPack === "restaurant_sales" &&
    /connector|sync|toast|square|clover|report refresh/.test(corpus)
  ) {
    return failureClassificationSchema.parse({
      class:
        /report|dashboard|export/.test(corpus)
          ? "reporting_refresh_failure"
          : "connector_sync_failure",
      systemCaused: true,
      retryEligible: true,
      nonBillable: true,
      severity: failedRuns > 1 ? "high" : "medium",
      reason:
        "A restaurant connector or reporting refresh failed, so the work stays protected until the system path stabilizes."
    });
  }

  if (
    args.executionPacket.domainPack === "crypto_analytics" &&
    /provider|ingest|ingestion|normalize|normalization|chain|signal|score generation/.test(
      corpus
    )
  ) {
    return failureClassificationSchema.parse({
      class:
        /score|scoring|risk/.test(corpus)
          ? "score_generation_failure"
          : "provider_ingestion_failure",
      systemCaused: true,
      retryEligible: true,
      nonBillable: true,
      severity: failedRuns > 1 ? "high" : "medium",
      reason:
        "A crypto ingestion or scoring pipeline failed, so the run remains protected and non-billable."
    });
  }

  if (failedRuns > 1) {
    return failureClassificationSchema.parse({
      class: "auto_retry_system_failure",
      systemCaused: true,
      retryEligible: true,
      nonBillable: true,
      severity: "high",
      reason:
        "Repeated system-caused failures already consumed protected retry attempts, so the run must stay non-billable."
    });
  }

  if (failedRun?.runType === "codex") {
    return failureClassificationSchema.parse({
      class: "relay_failure",
      systemCaused: true,
      retryEligible: true,
      nonBillable: true,
      severity: "medium",
      reason:
        "The Codex relay failed before accepted delivery, so the run stays protected."
    });
  }

  return failureClassificationSchema.parse({
    class: "transient_executor_failure",
    systemCaused: true,
    retryEligible: true,
    nonBillable: true,
    severity: "medium",
    reason:
      "The worker execution failed in a system-controlled way, so the run remains protected and eligible for guarded retry review."
  });
}

function classifyQABillingFailure(args: {
  qaValidation?: QAValidationResult | null;
}): FailureClassification | null {
  const qaValidation = args.qaValidation ?? null;

  if (!qaValidation) {
    return null;
  }

  if (
    qaValidation.releaseDecision.requiresHumanReview ||
    qaValidation.releaseDecision.status === "awaiting_review"
  ) {
    return failureClassificationSchema.parse({
      class: "operator_review_required_before_acceptance",
      systemCaused: false,
      retryEligible: false,
      nonBillable: true,
      severity: "high",
      reason:
        "QA still requires explicit human review before Neroa can safely treat this work as accepted or billable."
    });
  }

  if (qaValidation.status === "awaiting_artifacts") {
    return failureClassificationSchema.parse({
      class: "qa_blocked_missing_artifacts",
      systemCaused: false,
      retryEligible: false,
      nonBillable: true,
      severity: "medium",
      reason:
        "Required QA artifacts are still missing, so the run cannot become billable."
    });
  }

  if (
    qaValidation.status === "failed" ||
    qaValidation.status === "remediation_required"
  ) {
    return failureClassificationSchema.parse({
      class: "qa_failed_unaccepted",
      systemCaused: false,
      retryEligible: false,
      nonBillable: true,
      severity: "high",
      reason:
        "QA failed or still requires remediation, so the work remains protected and non-billable."
    });
  }

  if (!qaValidation.releaseDecision.canMarkReleaseReady) {
    return failureClassificationSchema.parse({
      class: "release_not_ready",
      systemCaused: false,
      retryEligible: false,
      nonBillable: true,
      severity: "medium",
      reason:
        "The run is not yet release-ready, so Neroa should defer billing."
    });
  }

  return null;
}

export function classifyFailureForBilling(args: {
  governancePolicy: GovernancePolicy;
  executionPacket: ExecutionPacket;
  qaValidation?: QAValidationResult | null;
  taskDetail?: BuildRoomTaskDetail | null;
}): FailureClassification | null {
  return (
    classifyScopeOrApprovalFailure(args) ??
    classifyRunFailure(args) ??
    classifyQABillingFailure(args)
  );
}

function buildChargeabilityDecision(args: {
  governancePolicy: GovernancePolicy;
  executionPacket: ExecutionPacket;
  qaValidation?: QAValidationResult | null;
  taskDetail?: BuildRoomTaskDetail | null;
  failureClassification: FailureClassification | null;
  retryDecision: RetryDecision | null;
  costGuardrailDecision: CostGuardrailDecision | null;
}): ChargeabilityDecision {
  const scopeStillApproved =
    args.executionPacket.scopeDecision.withinApprovedScope &&
    args.executionPacket.readiness.approvalAllowed &&
    args.governancePolicy.currentApprovalState.roadmapScopeApproved;
  const runFinished =
    args.qaValidation?.completionReadiness.runFinished ??
    taskRunFinished(args.taskDetail);
  const qaAccepted = args.qaValidation?.releaseDecision.canMarkReleaseReady ?? false;
  const requiresReview =
    args.costGuardrailDecision?.requiresOperatorReview ||
    args.retryDecision?.requiresHumanReview ||
    args.qaValidation?.releaseDecision.requiresHumanReview ||
    args.failureClassification?.class === "operator_review_required_before_acceptance";

  if (scopeStillApproved && runFinished && qaAccepted) {
    return chargeabilityDecisionSchema.parse({
      status: "billable",
      billable: true,
      classification: "approved_release_ready_completion",
      reason:
        "The work is approved, within scope, run-finished, and QA-accepted, so it is safe to count as billable.",
      canChargeCustomer: true,
      safeToCountTowardSpend: true,
      requiresHumanReview: false,
      chargeUnits: 1,
      protectedUnits: 0
    });
  }

  if (requiresReview) {
    return chargeabilityDecisionSchema.parse({
      status: "review_required",
      billable: false,
      classification:
        args.failureClassification?.class ?? "operator_review_required_before_acceptance",
      reason:
        args.costGuardrailDecision?.reason ??
        args.retryDecision?.reason ??
        args.failureClassification?.reason ??
        "Human review is required before this work can become billable.",
      canChargeCustomer: false,
      safeToCountTowardSpend: false,
      requiresHumanReview: true,
      chargeUnits: 0,
      protectedUnits: runFinished ? 1 : 0
    });
  }

  if (args.failureClassification) {
    const protectedUnits =
      args.failureClassification.systemCaused || runFinished ? 1 : 0;

    return chargeabilityDecisionSchema.parse({
      status: "protected_non_billable",
      billable: false,
      classification: args.failureClassification.class,
      reason: args.failureClassification.reason,
      canChargeCustomer: false,
      safeToCountTowardSpend: false,
      requiresHumanReview: false,
      chargeUnits: 0,
      protectedUnits
    });
  }

  return chargeabilityDecisionSchema.parse({
    status: "deferred",
    billable: false,
    classification: runFinished ? "qa_or_release_pending" : "execution_in_progress",
    reason: runFinished
      ? "The run finished, but billing stays deferred until the shared QA and release checks are fully satisfied."
      : "Execution is still in progress, so Neroa should defer any billing decision.",
    canChargeCustomer: false,
    safeToCountTowardSpend: false,
    requiresHumanReview: false,
    chargeUnits: 0,
    protectedUnits: runFinished ? 1 : 0
  });
}

function deriveBillingCurrentStatus(args: {
  decision: ChargeabilityDecision;
  retryDecision: RetryDecision | null;
}): BillingProtectionCurrentStatus {
  if (args.decision.billable) {
    return "billable";
  }

  if (args.retryDecision?.action === "auto_retry") {
    return "retrying";
  }

  if (args.decision.status === "review_required") {
    return "review_required";
  }

  if (args.decision.status === "deferred") {
    return "deferred";
  }

  return "protected";
}

function buildChargeEventId(args: {
  executionPacket: ExecutionPacket;
  taskDetail?: BuildRoomTaskDetail | null;
  qaValidation?: QAValidationResult | null;
  eventType: ChargeEvent["eventType"];
  retryAttempt?: number | null;
}) {
  const base =
    args.taskDetail?.task.id ??
    args.qaValidation?.sourceTaskId ??
    args.executionPacket.sourceRequestId;
  const anchor =
    args.qaValidation?.sourceRunId ??
    latestRun(args.taskDetail)?.id ??
    args.qaValidation?.qaValidationId ??
    args.executionPacket.executionPacketId;
  const retrySuffix =
    args.retryAttempt && args.retryAttempt > 0 ? `:${args.retryAttempt}` : "";

  return `${base}:billing:${args.eventType}:${anchor}${retrySuffix}`;
}

function buildChargeEvents(args: {
  projectId: string;
  executionPacket: ExecutionPacket;
  governancePolicy: GovernancePolicy;
  qaValidation?: QAValidationResult | null;
  taskDetail?: BuildRoomTaskDetail | null;
  decision: ChargeabilityDecision;
  failureClassification: FailureClassification | null;
  retryDecision: RetryDecision | null;
  currentStatus: BillingProtectionCurrentStatus;
  now: string;
}) {
  const run = latestRun(args.taskDetail);
  const runFinished =
    args.qaValidation?.completionReadiness.runFinished ??
    taskRunFinished(args.taskDetail);
  const retryAttempt =
    args.retryDecision && args.retryDecision.action !== "none"
      ? Math.max(
          (args.taskDetail?.runs.filter((item) => item.status === "failed").length ?? 0),
          1
        )
      : null;

  let eventType: ChargeEvent["eventType"];

  if (args.decision.billable) {
    eventType = "billable_completion";
  } else if (args.failureClassification?.class === "pending_execution") {
    eventType = "pending_execution_captured";
  } else if (args.failureClassification?.class === "governance_blocked") {
    eventType = "governance_blocked";
  } else if (args.retryDecision?.action === "auto_retry") {
    eventType = "retry_protected";
  } else if (
    args.retryDecision?.action === "stop_auto_retry" ||
    args.retryDecision?.action === "require_review"
  ) {
    eventType = "retry_blocked";
  } else if (args.decision.status === "review_required") {
    eventType = "review_required";
  } else if (args.failureClassification?.systemCaused) {
    eventType = "system_failure_protected";
  } else if (runFinished) {
    eventType = "qa_protected";
  } else if (args.taskDetail) {
    eventType = "execution_started";
  } else {
    eventType = "execution_deferred";
  }

  return [
    chargeEventSchema.parse({
      chargeEventId: buildChargeEventId({
        executionPacket: args.executionPacket,
        taskDetail: args.taskDetail,
        qaValidation: args.qaValidation,
        eventType,
        retryAttempt
      }),
      projectId: args.projectId,
      sourceRequestId: args.executionPacket.sourceRequestId,
      sourceExecutionPacketId: args.executionPacket.executionPacketId,
      sourceQAValidationId: args.qaValidation?.qaValidationId ?? null,
      sourceGovernancePolicyId: args.governancePolicy.governanceId,
      sourceTaskId: args.taskDetail?.task.id ?? null,
      sourceRunId: run?.id ?? null,
      eventType,
      status: "recorded",
      chargeability: args.decision.status,
      classification: args.decision.classification,
      chargeUnits: args.decision.chargeUnits,
      protectedUnits: args.decision.protectedUnits,
      reason: args.decision.reason,
      failureClass: args.failureClassification?.class ?? null,
      retryAttempt,
      createdAt:
        run?.completedAt ??
        run?.updatedAt ??
        args.taskDetail?.task.updatedAt ??
        args.now
    })
  ] satisfies ChargeEvent[];
}

export function generateBillingProtectionState(args: {
  projectId: string;
  governancePolicy: GovernancePolicy;
  executionPacket: ExecutionPacket;
  qaValidation?: QAValidationResult | null;
  taskDetail?: BuildRoomTaskDetail | null;
  priorState?: BillingProtectionState | null;
  now?: string;
}): BillingProtectionState {
  const now =
    cleanText(args.now) ||
    latestRun(args.taskDetail)?.completedAt ||
    args.taskDetail?.task.updatedAt ||
    new Date().toISOString();
  const failureClassification = classifyFailureForBilling({
    governancePolicy: args.governancePolicy,
    executionPacket: args.executionPacket,
    qaValidation: args.qaValidation ?? null,
    taskDetail: args.taskDetail ?? null
  });
  const provisionalRetryDecision = buildRetryDecision({
    governancePolicy: args.governancePolicy,
    executionPacket: args.executionPacket,
    failureClassification,
    taskDetail: args.taskDetail ?? null,
    priorState: args.priorState ?? null
  });
  const provisionalDecision = buildChargeabilityDecision({
    governancePolicy: args.governancePolicy,
    executionPacket: args.executionPacket,
    qaValidation: args.qaValidation ?? null,
    taskDetail: args.taskDetail ?? null,
    failureClassification,
    retryDecision: provisionalRetryDecision,
    costGuardrailDecision: null
  });
  const costGuardrailDecision = buildCostGuardrailDecision({
    governancePolicy: args.governancePolicy,
    currentDecision: provisionalDecision,
    retryDecision: provisionalRetryDecision,
    priorState: args.priorState ?? null,
    taskDetail: args.taskDetail ?? null
  });
  const retryDecision =
    provisionalRetryDecision && costGuardrailDecision?.blocksFurtherAutoRetry
      ? retryDecisionSchema.parse({
          ...provisionalRetryDecision,
          action:
            costGuardrailDecision.requiresOperatorReview
              ? "require_review"
              : "stop_auto_retry",
          reason: costGuardrailDecision.reason,
          nextDelayMs: null,
          requiresHumanReview: costGuardrailDecision.requiresOperatorReview
        })
      : provisionalRetryDecision;
  const latestChargeabilityDecision = buildChargeabilityDecision({
    governancePolicy: args.governancePolicy,
    executionPacket: args.executionPacket,
    qaValidation: args.qaValidation ?? null,
    taskDetail: args.taskDetail ?? null,
    failureClassification,
    retryDecision,
    costGuardrailDecision
  });
  const currentStatus = deriveBillingCurrentStatus({
    decision: latestChargeabilityDecision,
    retryDecision
  });
  const chargeEvents = mergeChargeEvents({
    priorEvents: args.priorState?.chargeEvents ?? [],
    nextEvents: buildChargeEvents({
      projectId: args.projectId,
      executionPacket: args.executionPacket,
      governancePolicy: args.governancePolicy,
      qaValidation: args.qaValidation ?? null,
      taskDetail: args.taskDetail ?? null,
      decision: latestChargeabilityDecision,
      failureClassification,
      retryDecision,
      currentStatus,
      now
    })
  });
  const totals = buildBillingProtectionTotals(chargeEvents);
  const blockerLabels = uniqueStrings([
    ...(!latestChargeabilityDecision.billable
      ? [latestChargeabilityDecision.reason]
      : []),
    ...(costGuardrailDecision?.requiresOperatorReview
      ? [costGuardrailDecision.reason]
      : []),
    ...(retryDecision?.requiresHumanReview ? [retryDecision.reason] : [])
  ]);
  const summary = buildBillingProtectionSummary({
    currentStatus,
    latestChargeabilityDecision,
    latestRetryDecision: retryDecision,
    latestCostGuardrailDecision: costGuardrailDecision,
    totals,
    blockerLabels
  });

  return billingProtectionStateSchema.parse({
    projectId: args.projectId,
    sourceGovernancePolicyId: args.governancePolicy.governanceId,
    sourceExecutionPacketId: args.executionPacket.executionPacketId,
    sourceQAValidationId: args.qaValidation?.qaValidationId ?? null,
    latestChargeabilityDecision,
    latestFailureClassification: failureClassification,
    latestRetryDecision: retryDecision,
    latestCostGuardrailDecision: costGuardrailDecision,
    chargeEvents,
    totals,
    currentStatus,
    summary
  });
}

export type TaskBillingProtectionContext = TaskQAValidationContext & {
  billingState: BillingProtectionState;
};

export function buildTaskBillingProtectionContext(args: {
  workspaceId?: string | null;
  projectId: string;
  projectName?: string | null;
  executionState: ExecutionState | null | undefined;
  billingState: BillingProtectionState | null | undefined;
  taskDetail: BuildRoomTaskDetail;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
}) {
  const qaContext = buildTaskQAValidationContext({
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectName: args.projectName,
    executionState: args.executionState,
    taskDetail: args.taskDetail,
    projectBrief: args.projectBrief,
    architectureBlueprint: args.architectureBlueprint,
    roadmapPlan: args.roadmapPlan,
    governancePolicy: args.governancePolicy
  });
  const billingState = generateBillingProtectionState({
    projectId: args.projectId,
    governancePolicy: args.governancePolicy,
    executionPacket: qaContext.executionPacket,
    qaValidation: qaContext.qaValidation,
    taskDetail: args.taskDetail,
    priorState: args.billingState ?? null,
    now: args.taskDetail.task.updatedAt
  });

  return {
    ...qaContext,
    billingState
  } satisfies TaskBillingProtectionContext;
}
