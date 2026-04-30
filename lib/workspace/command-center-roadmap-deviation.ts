import { analyzeGovernanceDelta } from "@/lib/intelligence/governance/delta-analyzer";
import { getGovernanceDomainDefaults } from "@/lib/intelligence/governance/defaults";
import type { ArchitectureBlueprint } from "@/lib/intelligence/architecture";
import type {
  DeltaAnalysisResult,
  GovernancePolicy
} from "@/lib/intelligence/governance/types";
import type { ProjectBrief } from "@/lib/intelligence/project-brief";
import type { RoadmapPlan } from "@/lib/intelligence/roadmap";
import type {
  CommandCenterCustomerRequestType,
  CommandCenterTaskRoadmapDecisionOption,
  CommandCenterTaskRoadmapDeviation,
  StoredCommandCenterTask
} from "@/lib/workspace/command-center-tasks";

const UNCLEAR_SCOPE_PATTERN =
  /\b(?:not sure|unsure|unclear|help me decide|impact summary|clarif(?:y|ication)|what would change|which direction|should we|compare options|compare paths|maybe we should)\b/i;
const ROADMAP_IMPACT_SIGNAL_PATTERN =
  /\b(?:pricing model|pricing strategy|monetization|subscription tier|free plan|target customer|target user|buyer persona|audience shift|business model|go to market|go-to-market|technical architecture|tech stack|database|auth model|multi tenant|multi-tenant|native app|mobile app|marketplace|new portal|admin console|redesign the experience|new ux direction|new ui direction|brand direction|phase order|execution order|reorder the roadmap|move this earlier|move this later|replace the current direction)\b/i;

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function hasUnclearScopeSignal(request: string) {
  return UNCLEAR_SCOPE_PATTERN.test(request);
}

function hasRoadmapImpactSignal(request: string) {
  return ROADMAP_IMPACT_SIGNAL_PATTERN.test(request);
}

function resolveReviewKind(args: {
  request: string;
  requestType: CommandCenterCustomerRequestType;
  deltaAnalysis: DeltaAnalysisResult;
}) {
  if (args.requestType === "question_decision") {
    return "decision_required" as const;
  }

  if (args.deltaAnalysis.requestClass === "governance_conflict") {
    return "roadmap_deviation" as const;
  }

  if (
    args.requestType === "change_direction" ||
    args.deltaAnalysis.requiresRoadmapRevision ||
    args.deltaAnalysis.requiresArchitectureRevision ||
    hasRoadmapImpactSignal(args.request)
  ) {
    return "roadmap_deviation" as const;
  }

  if (hasUnclearScopeSignal(args.request)) {
    return "clarification_required" as const;
  }

  return null;
}

function buildChangedSummary(args: {
  requestType: CommandCenterCustomerRequestType;
  reviewKind: NonNullable<ReturnType<typeof resolveReviewKind>>;
  deltaAnalysis: DeltaAnalysisResult;
}) {
  if (args.requestType === "change_direction") {
    return "This request changes the currently approved direction.";
  }

  if (args.reviewKind === "decision_required") {
    return "This request needs a roadmap or product decision before it can become execution work.";
  }

  if (args.deltaAnalysis.requiresArchitectureRevision) {
    return "This request changes the approved architecture enough that the roadmap must be refreshed first.";
  }

  if (args.deltaAnalysis.requiresRoadmapRevision) {
    return "This request widens or reorders the approved roadmap before execution can continue.";
  }

  if (args.reviewKind === "clarification_required") {
    return "This request is still too unclear to turn into approved execution safely.";
  }

  return "This request changes approved project truth enough that Strategy Room needs to review it first.";
}

function buildRiskSummary(args: {
  requestType: CommandCenterCustomerRequestType;
  reviewKind: NonNullable<ReturnType<typeof resolveReviewKind>>;
  deltaAnalysis: DeltaAnalysisResult;
}) {
  if (args.reviewKind === "decision_required") {
    return "If Build Room received it now, Neroa would be forced to guess at an unresolved product decision.";
  }

  if (args.deltaAnalysis.requiresArchitectureRevision) {
    return "Execution would move forward against outdated architecture and roadmap assumptions.";
  }

  if (args.deltaAnalysis.requestClass === "governance_conflict") {
    return "Execution would bypass an active governance guardrail and create contradictory project truth.";
  }

  if (args.reviewKind === "clarification_required") {
    return "Execution could widen scope or pick the wrong direction before the roadmap is settled.";
  }

  if (args.requestType === "change_direction") {
    return "Execution would shift the product direction without an explicit approved replacement plan.";
  }

  return "Execution would widen or reorder approved work before the roadmap has been revised intentionally.";
}

function buildDecisionNeeded(args: {
  requestType: CommandCenterCustomerRequestType;
  reviewKind: NonNullable<ReturnType<typeof resolveReviewKind>>;
}) {
  if (args.reviewKind === "decision_required") {
    return "Decide whether to revise the roadmap, defer the request, reject it, replace the current direction, or ask for a clarification and impact summary.";
  }

  if (args.reviewKind === "clarification_required") {
    return "Clarify the request or decide whether it should become a roadmap revision, be deferred, or be rejected.";
  }

  if (args.requestType === "change_direction") {
    return "Decide whether to replace the current direction or keep the approved roadmap.";
  }

  return "Decide whether to approve a roadmap revision, defer the request, reject it, or replace the current direction.";
}

function resolveDeviationStatus(args: {
  existing?: CommandCenterTaskRoadmapDeviation | null;
}) {
  const existingStatus = args.existing?.status ?? null;

  if (existingStatus && existingStatus !== "resolved_for_execution") {
    return existingStatus;
  }

  return "pending_strategy_review" as const;
}

function taskStatusForDeviationStatus(
  status: CommandCenterTaskRoadmapDeviation["status"]
): StoredCommandCenterTask["status"] {
  if (status === "clarification_requested") {
    return "waiting_on_decision";
  }

  if (status === "deferred" || status === "rejected") {
    return "completed";
  }

  if (status === "resolved_for_execution") {
    return "queued";
  }

  return "in_review";
}

export function assessCommandCenterTaskRoadmapDeviation(args: {
  request: string;
  requestType: CommandCenterCustomerRequestType;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
  detectionStage: CommandCenterTaskRoadmapDeviation["detectionStage"];
  now: string;
  existing?: CommandCenterTaskRoadmapDeviation | null;
}) {
  const request = normalizeSpace(cleanText(args.request));

  if (!request) {
    return null;
  }

  const defaults = getGovernanceDomainDefaults(args.projectBrief.domainPack);
  const deltaAnalysis = analyzeGovernanceDelta({
    request,
    projectBrief: args.projectBrief,
    architectureBlueprint: args.architectureBlueprint,
    roadmapPlan: args.roadmapPlan,
    governancePolicy: args.governancePolicy,
    defaults
  });
  const reviewKind = resolveReviewKind({
    request,
    requestType: args.requestType,
    deltaAnalysis
  });

  if (!reviewKind) {
    return null;
  }

  return {
    reviewKind,
    status: resolveDeviationStatus({
      existing: args.existing
    }),
    detectionStage: args.detectionStage,
    requestClass: deltaAnalysis.requestClass,
    outcome: deltaAnalysis.outcome,
    reason: deltaAnalysis.reason,
    changedSummary: buildChangedSummary({
      requestType: args.requestType,
      reviewKind,
      deltaAnalysis
    }),
    riskSummary: buildRiskSummary({
      requestType: args.requestType,
      reviewKind,
      deltaAnalysis
    }),
    decisionNeeded: buildDecisionNeeded({
      requestType: args.requestType,
      reviewKind
    }),
    suggestedNextSurface: "strategy_room",
    suggestedNextAction: deltaAnalysis.suggestedNextAction,
    requiresRoadmapRevision: deltaAnalysis.requiresRoadmapRevision,
    requiresArchitectureRevision: deltaAnalysis.requiresArchitectureRevision,
    requiresGovernanceReview: true,
    requiresApprovalReset: deltaAnalysis.requiresApprovalReset,
    latestDecision: args.existing?.latestDecision ?? null,
    latestDecisionAt: args.existing?.latestDecisionAt ?? null,
    linkedStrategyRevisionId: args.existing?.linkedStrategyRevisionId ?? null,
    linkedRoadmapRevisionId: args.existing?.linkedRoadmapRevisionId ?? null,
    detectedAt: args.existing?.detectedAt ?? args.now,
    updatedAt: args.now,
    resolvedAt: null
  } satisfies CommandCenterTaskRoadmapDeviation;
}

export function buildCommandCenterRoadmapDeviationNotice(
  deviation: CommandCenterTaskRoadmapDeviation
) {
  return `${deviation.changedSummary} ${deviation.decisionNeeded}`.trim();
}

export function applyCommandCenterTaskRoadmapDecision(args: {
  task: StoredCommandCenterTask;
  decision: CommandCenterTaskRoadmapDecisionOption;
  now: string;
}) {
  const deviation = args.task.roadmapDeviation;

  if (!deviation) {
    return args.task;
  }

  let nextDeviationStatus: CommandCenterTaskRoadmapDeviation["status"];

  if (args.decision === "approve_roadmap_revision") {
    nextDeviationStatus = "approved_for_roadmap_revision";
  } else if (args.decision === "replace_current_direction") {
    nextDeviationStatus = "approved_as_replacement";
  } else if (args.decision === "defer_request") {
    nextDeviationStatus = "deferred";
  } else if (args.decision === "reject_request") {
    nextDeviationStatus = "rejected";
  } else {
    nextDeviationStatus = "clarification_requested";
  }

  return {
    ...args.task,
    status: taskStatusForDeviationStatus(nextDeviationStatus),
    roadmapDeviation: {
      ...deviation,
      status: nextDeviationStatus,
      latestDecision: args.decision,
      latestDecisionAt: args.now,
      updatedAt: args.now,
      resolvedAt: null
    }
  } satisfies StoredCommandCenterTask;
}

export function reconcileCommandCenterTaskAfterStrategyUpdate(args: {
  task: StoredCommandCenterTask;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
  now: string;
  linkedStrategyRevisionId?: string | null;
  linkedRoadmapRevisionId?: string | null;
}) {
  const existingDeviation = args.task.roadmapDeviation;

  if (!existingDeviation) {
    return args.task;
  }

  const requestType =
    args.task.intelligenceMetadata?.requestType ??
    (existingDeviation.reviewKind === "decision_required"
      ? "question_decision"
      : existingDeviation.reviewKind === "roadmap_deviation"
        ? "revision"
        : "new_request");
  const reassessedDeviation = assessCommandCenterTaskRoadmapDeviation({
    request: args.task.request,
    requestType,
    projectBrief: args.projectBrief,
    architectureBlueprint: args.architectureBlueprint,
    roadmapPlan: args.roadmapPlan,
    governancePolicy: args.governancePolicy,
    detectionStage: "strategy_room",
    now: args.now,
    existing: {
      ...existingDeviation,
      linkedStrategyRevisionId:
        args.linkedStrategyRevisionId ?? existingDeviation.linkedStrategyRevisionId,
      linkedRoadmapRevisionId:
        args.linkedRoadmapRevisionId ?? existingDeviation.linkedRoadmapRevisionId
    }
  });

  if (!reassessedDeviation) {
    return {
      ...args.task,
      status: "queued",
      roadmapDeviation: {
        ...existingDeviation,
        status: "resolved_for_execution",
        outcome: "execution_ready_after_gate",
        suggestedNextSurface: "build_room",
        suggestedNextAction:
          "This request now fits the approved roadmap and can move through the existing execution gate.",
        linkedStrategyRevisionId:
          args.linkedStrategyRevisionId ?? existingDeviation.linkedStrategyRevisionId,
        linkedRoadmapRevisionId:
          args.linkedRoadmapRevisionId ?? existingDeviation.linkedRoadmapRevisionId,
        updatedAt: args.now,
        resolvedAt: args.now
      }
    } satisfies StoredCommandCenterTask;
  }

  const nextStatus =
    reassessedDeviation.status === "clarification_requested"
      ? "waiting_on_decision"
      : reassessedDeviation.status === "deferred" || reassessedDeviation.status === "rejected"
        ? "completed"
        : "in_review";

  return {
    ...args.task,
    status: nextStatus,
    roadmapDeviation: {
      ...reassessedDeviation,
      linkedStrategyRevisionId:
        args.linkedStrategyRevisionId ?? reassessedDeviation.linkedStrategyRevisionId,
      linkedRoadmapRevisionId:
        args.linkedRoadmapRevisionId ?? reassessedDeviation.linkedRoadmapRevisionId,
      updatedAt: args.now
    }
  } satisfies StoredCommandCenterTask;
}

export function taskRequiresStrategyReview(task: Pick<StoredCommandCenterTask, "roadmapDeviation">) {
  return Boolean(task.roadmapDeviation && task.roadmapDeviation.status !== "resolved_for_execution");
}
