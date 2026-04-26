import type {
  PlatformExecutionGateState
} from "../platform-context";
import type { ArchitectureBlueprint } from "../architecture/types.ts";
import {
  analyzeGovernanceDelta,
  getGovernanceDomainDefaults,
  type GovernancePolicy
} from "../governance";
import type { ProjectBrief } from "../project-brief.ts";
import type { RoadmapPlan } from "../roadmap/types.ts";
import {
  buildExecutionPacketBuildRoomPayload,
  buildPacketToBuildRoomMapping
} from "./build-room-mapper.ts";
import {
  executionPacketSchema,
  executionReadinessSchema,
  executionScopeDecisionSchema,
  type ExecutionPacket,
  type ExecutionRequestClass
} from "./types.ts";
import type {
  BuildRoomOutputMode,
  BuildRoomRiskLevel,
  BuildRoomTaskType
} from "@/lib/build-room/contracts";

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value: string) {
  return normalizeSpace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return normalizeSearchText(value).replace(/\s+/g, "-").slice(0, 64);
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

function parseTextareaLines(value?: string | null) {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return [];
  }

  return uniqueStrings(
    cleaned
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  );
}

function buildFallbackTitle(args: {
  title?: string | null;
  request: string;
  taskType: BuildRoomTaskType;
}) {
  const title = cleanText(args.title);

  if (title) {
    return title.length > 96 ? `${title.slice(0, 93).trimEnd()}...` : title;
  }

  const sentence =
    normalizeSpace(args.request).split(/[.!?]/)[0]?.trim() || normalizeSpace(args.request);
  const cleaned = sentence
    .replace(/^please\s+/i, "")
    .replace(/^can you\s+/i, "")
    .replace(/^could you\s+/i, "")
    .trim();

  if (cleaned) {
    return cleaned.length > 96 ? `${cleaned.slice(0, 93).trimEnd()}...` : cleaned;
  }

  return args.taskType === "research"
    ? "Research request"
    : args.taskType === "qa"
      ? "QA request"
      : args.taskType === "operations"
        ? "Operations request"
        : "Implementation request";
}

function classifyExecutionRequestClass(taskType: BuildRoomTaskType): ExecutionRequestClass {
  if (taskType === "research") {
    return "research_oriented";
  }

  if (taskType === "qa") {
    return "qa_oriented";
  }

  if (taskType === "operations") {
    return "operations_oriented";
  }

  return "execution_oriented";
}

function buildAcceptanceCriteria(args: {
  roadmapPlan: RoadmapPlan;
  phaseIds: readonly string[];
  moduleIds: readonly string[];
  laneIds: readonly string[];
  explicitAcceptanceCriteria: readonly string[];
}) {
  const relatedPhases = args.roadmapPlan.phases.filter(
    (phase) =>
      args.phaseIds.includes(phase.phaseId) ||
      phase.moduleIds.some((moduleId) => args.moduleIds.includes(moduleId)) ||
      phase.laneIds.some((laneId) => args.laneIds.includes(laneId))
  );
  const derived = relatedPhases.flatMap((phase) =>
    phase.acceptanceCriteria
      .filter(
        (criterion) =>
          criterion.moduleIds.some((moduleId) => args.moduleIds.includes(moduleId)) ||
          criterion.laneIds.some((laneId) => args.laneIds.includes(laneId)) ||
          criterion.moduleIds.length === 0
      )
      .map((criterion) => criterion.label)
  );
  const fallback =
    derived.length > 0
      ? []
      : [
          "Keep the change inside the currently approved roadmap scope.",
          "Preserve the current Build Room worker-approval gate."
        ];

  return uniqueStrings([
    ...args.explicitAcceptanceCriteria,
    ...derived,
    ...fallback
  ]);
}

function buildNotInScopeWarnings(args: {
  request: string;
  projectBrief: ProjectBrief;
  roadmapPlan: RoadmapPlan;
}) {
  const requestSearch = normalizeSearchText(args.request);
  const warnings = [
    ...args.projectBrief.excludedFeatures.filter((feature) =>
      requestSearch.includes(normalizeSearchText(feature))
    ),
    ...args.roadmapPlan.phases.flatMap((phase) =>
      phase.notInScope
        .filter((item) => requestSearch.includes(normalizeSearchText(item.label)))
        .map((item) => item.label)
    )
  ];

  return uniqueStrings(warnings);
}

function buildReadiness(args: {
  governancePolicy: GovernancePolicy;
  scopeDecision: ExecutionPacket["scopeDecision"];
  platformGate: PlatformExecutionGateState | null;
  riskLevel: BuildRoomRiskLevel;
}) {
  const approvalAllowed = args.governancePolicy.currentApprovalState.roadmapScopeApproved;
  const blockers = uniqueStrings([
    ...(!approvalAllowed ? ["Roadmap scope approval is still required before execution."] : []),
    ...(args.scopeDecision.outcome !== "execution_ready_after_gate"
      ? [args.scopeDecision.reason]
      : []),
    ...(args.platformGate?.approvalRequired && !args.platformGate.shouldExecute
      ? [args.platformGate.blockedPanel.body]
      : [])
  ]);
  const releaseAllowed =
    approvalAllowed &&
    args.scopeDecision.withinApprovedScope &&
    !args.scopeDecision.shouldRemainPendingExecution;
  const relayAllowed =
    releaseAllowed &&
    (args.platformGate ? args.platformGate.shouldExecute : true);
  const needsHumanReview =
    args.riskLevel === "high" ||
    args.scopeDecision.requiresGovernanceReview ||
    !releaseAllowed;
  const status = relayAllowed
    ? "ready_for_build_room"
    : args.scopeDecision.shouldRemainPendingExecution || !approvalAllowed
      ? "pending_execution"
      : "not_ready";
  const reason =
    blockers[0] ??
    (relayAllowed
      ? "The request is approved, within scope, and ready for the existing Build Room relay."
      : "The request still needs governance or approval follow-up before release.");

  return executionReadinessSchema.parse({
    status,
    approvalAllowed,
    blockers,
    releaseAllowed,
    relayAllowed,
    needsHumanReview,
    reason
  });
}

export type ExecutionPacketGeneratorInput = {
  workspaceId?: string | null;
  projectId: string;
  projectName?: string | null;
  sourceRequestId: string;
  title?: string | null;
  userRequest: string;
  acceptanceCriteriaText?: string | null;
  taskType: BuildRoomTaskType;
  requestedOutputMode: BuildRoomOutputMode;
  riskLevel: BuildRoomRiskLevel;
  selectedBuildLaneSlug?: string | null;
  existingBuildRoomTaskId?: string | null;
  originatingSurface?: "command_center" | "build_room";
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
  platformGate?: PlatformExecutionGateState | null;
};

export function generateExecutionPacket(
  args: ExecutionPacketGeneratorInput
): ExecutionPacket {
  const request = cleanText(args.userRequest);
  const delta = analyzeGovernanceDelta({
    request,
    projectBrief: args.projectBrief,
    architectureBlueprint: args.architectureBlueprint,
    roadmapPlan: args.roadmapPlan,
    governancePolicy: args.governancePolicy,
    defaults: getGovernanceDomainDefaults(args.governancePolicy.domainPack)
  });
  const withinApprovedScope =
    delta.outcome === "execution_ready_after_gate" &&
    args.governancePolicy.currentApprovalState.roadmapScopeApproved;
  const scopeDecision = executionScopeDecisionSchema.parse({
    outcome: delta.outcome,
    reason: delta.reason,
    withinApprovedScope,
    affectedLaneIds: delta.affectedLaneIds,
    affectedModuleIds: delta.affectedModuleIds,
    affectedPhaseIds: delta.affectedPhaseIds,
    requiresRoadmapRevision: delta.requiresRoadmapRevision,
    requiresArchitectureRevision: delta.requiresArchitectureRevision,
    requiresGovernanceReview: delta.requiresGovernanceReview,
    requiresApprovalReset: delta.requiresApprovalReset,
    shouldRemainPendingExecution:
      delta.shouldSaveAsPendingExecution ||
      !args.governancePolicy.currentApprovalState.roadmapScopeApproved,
    suggestedNextSurface: delta.suggestedNextSurface,
    suggestedNextAction: delta.suggestedNextAction
  });
  const acceptanceCriteria = buildAcceptanceCriteria({
    roadmapPlan: args.roadmapPlan,
    phaseIds: scopeDecision.affectedPhaseIds,
    moduleIds: scopeDecision.affectedModuleIds,
    laneIds: scopeDecision.affectedLaneIds,
    explicitAcceptanceCriteria: parseTextareaLines(args.acceptanceCriteriaText)
  });
  const notInScopeWarnings = buildNotInScopeWarnings({
    request,
    projectBrief: args.projectBrief,
    roadmapPlan: args.roadmapPlan
  });
  const readiness = buildReadiness({
    governancePolicy: args.governancePolicy,
    scopeDecision,
    platformGate: args.platformGate ?? null,
    riskLevel: args.riskLevel
  });
  const packetId = `${args.projectId}:execution-packet:${slugify(args.sourceRequestId) || "request"}`;
  const mapping = buildPacketToBuildRoomMapping({
    packetId,
    originatingSurface: args.originatingSurface ?? "command_center",
    title: buildFallbackTitle({
      title: args.title,
      request,
      taskType: args.taskType
    }),
    request,
    taskType: args.taskType,
    requestedOutputMode: args.requestedOutputMode,
    riskLevel: args.riskLevel,
    acceptanceCriteria,
    laneIds: scopeDecision.affectedLaneIds,
    phaseIds: scopeDecision.affectedPhaseIds,
    moduleIds: scopeDecision.affectedModuleIds,
    scopeReason: scopeDecision.reason,
    notInScopeWarnings,
    selectedBuildLaneSlug: args.selectedBuildLaneSlug ?? null,
    existingBuildRoomTaskId: args.existingBuildRoomTaskId ?? null
  });
  const buildRoomTaskPayload = buildExecutionPacketBuildRoomPayload({
    mapping
  });
  const assumptionsMade = uniqueStrings([
    ...(scopeDecision.affectedLaneIds.length === 0
      ? [
          "No architecture lane was matched from the request text, so the packet keeps the task at a general approved-scope handoff."
        ]
      : []),
    ...(scopeDecision.affectedModuleIds.length === 0
      ? [
          "No architecture module was matched from the request text, so module ownership may still need human confirmation."
        ]
      : []),
    ...(args.selectedBuildLaneSlug && scopeDecision.affectedLaneIds.length === 0
      ? [
          `Used the existing Build Room lane selection "${args.selectedBuildLaneSlug}" as the execution surface target while architecture lane matching stays broad.`
        ]
      : [])
  ]);
  const status = readiness.relayAllowed
    ? "ready_for_build_room"
    : scopeDecision.outcome === "governance_blocked"
      ? "governance_blocked"
      : scopeDecision.requiresRoadmapRevision || scopeDecision.requiresArchitectureRevision
        ? "revision_required"
        : "pending_execution";

  return executionPacketSchema.parse({
    executionPacketId: packetId,
    workspaceId: args.workspaceId ?? null,
    projectId: args.projectId,
    projectName: args.projectName ?? null,
    sourceRequestId: args.sourceRequestId,
    sourceProjectBriefRef: `${args.projectId}:project-brief`,
    sourceArchitectureBlueprintRef: args.architectureBlueprint.sourceProjectBriefRef.replace(
      /project-brief$/,
      "architecture-blueprint"
    ),
    sourceRoadmapPlanRef: args.roadmapPlan.roadmapId,
    sourceGovernancePolicyRef: args.governancePolicy.governanceId,
    sourceApprovalRecordId:
      args.governancePolicy.scopeApprovalRecord?.approvalRecordId ?? null,
    domainPack: args.projectBrief.domainPack,
    requestSummary: request,
    requestClass: classifyExecutionRequestClass(args.taskType),
    scopeDecision,
    readiness,
    laneIds: scopeDecision.affectedLaneIds,
    moduleIds: scopeDecision.affectedModuleIds,
    phaseIds: scopeDecision.affectedPhaseIds,
    acceptanceCriteria,
    riskLevel: args.riskLevel,
    notInScopeWarnings,
    workerApprovalRequired: true,
    buildRoomTaskPayload,
    buildRoomMapping: mapping,
    status,
    assumptionsMade
  });
}
