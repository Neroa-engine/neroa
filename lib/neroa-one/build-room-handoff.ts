import {
  buildRoomHandoffPackageSchema,
  type BuildRoomHandoffPackage,
  type CommandCenterLane,
  type CustomerIntentEnvelope,
  type CustomerIntentType,
  type NeroaOneDecisionGate,
  type SpaceContext
} from "./schemas.ts";
import { classifyCustomerIntent } from "./classify-intent.ts";
import type { BuildRoomTaskDetail } from "../build-room/types.ts";

function clipText(value: string, maxLength = 88) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clipped = normalized.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return clipped || normalized;
}

function buildReadinessStatus(args: {
  status: BuildRoomTaskDetail["task"]["status"];
  blockerCount: number;
  isPendingExecution: boolean;
}): string {
  if (args.blockerCount > 0) {
    return "blocked";
  }

  if (args.isPendingExecution) {
    return "pending_release";
  }

  if (args.status === "worker_complete") {
    return "execution_recorded";
  }

  if (args.status === "approved_for_worker" || args.status === "worker_running") {
    return "execution_in_progress";
  }

  if (args.status === "codex_complete") {
    return "ready_for_internal_review";
  }

  if (args.status === "needs_revision") {
    return "needs_revision";
  }

  return "draft_handoff";
}

function buildReadinessDecisionGate(args: {
  readinessStatus: string;
  blockers: string[];
  pendingReason: string | null;
}): NeroaOneDecisionGate {
  if (args.blockers.length > 0) {
    return {
      status: "block",
      reason: "Build Room handoff is blocked by deterministic relay blockers.",
      blockedActions: ["release_execution"],
      requiredNextStep: "Resolve the recorded blockers before execution can continue."
    };
  }

  if (args.readinessStatus === "pending_release") {
    return {
      status: "needs_strategy_review",
      reason:
        args.pendingReason ??
        "The handoff is still held in pending execution and should be reviewed before release.",
      blockedActions: ["release_execution"],
      requiredNextStep: "Clear the pending execution hold before worker release."
    };
  }

  return {
    status: "allow",
    reason: "No blocking handoff issue was detected by the deterministic Build Room contract.",
    blockedActions: [],
    requiredNextStep: null
  };
}

function buildTaskIntentSummary(args: {
  taskType: string;
  intentType: CustomerIntentType;
  lane: CommandCenterLane;
}) {
  if (args.intentType === "execution_review" || args.taskType === "qa") {
    return "Execution review handoff";
  }

  if (args.lane === "revisions" || args.intentType === "revision") {
    return "Revision handoff";
  }

  if (args.lane === "roadmap_updates") {
    return "Roadmap update handoff";
  }

  if (args.lane === "decisions") {
    return "Decision-linked handoff";
  }

  return "Execution request handoff";
}

export function buildBuildRoomHandoffPackage(args: {
  spaceContext: SpaceContext;
  intent: CustomerIntentEnvelope;
  decisionGate: NeroaOneDecisionGate;
  executionProfile?: {
    taskType?: string | null;
    requestedOutputMode?: string | null;
    riskLevel?: string | null;
    acceptanceCriteria?: string | null;
    blockers?: string[];
    readinessStatus?: string | null;
  } | null;
}): BuildRoomHandoffPackage {
  return buildRoomHandoffPackageSchema.parse({
    packageId: `${args.spaceContext.projectId}:handoff:${args.intent.lane}`,
    workspaceId: args.spaceContext.workspaceId,
    projectId: args.spaceContext.projectId,
    taskTitle: clipText(args.intent.rawText),
    taskSummary: `Prepare Build Room handoff for ${args.spaceContext.project.title} from the ${args.intent.lane} lane.`,
    originalIntent: args.intent,
    customerIntentType: args.intent.intentType,
    commandCenterLane: args.intent.lane,
    normalizedRequest: args.intent.normalizedText,
    executionTaskType: args.executionProfile?.taskType ?? null,
    requestedOutputMode: args.executionProfile?.requestedOutputMode ?? null,
    riskLevel: args.executionProfile?.riskLevel ?? null,
    acceptanceCriteria: args.executionProfile?.acceptanceCriteria ?? null,
    blockers: args.executionProfile?.blockers ?? [],
    readinessStatus: args.executionProfile?.readinessStatus ?? "contract_prepared",
    decisionGate: args.decisionGate,
    emittedEvent: "neroa_one.build_room.handoff_prepared"
  });
}

export function buildBuildRoomTaskHandoffPackage(args: {
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  taskDetail: BuildRoomTaskDetail | null;
  isPendingExecution?: boolean;
  pendingReason?: string | null;
}): BuildRoomHandoffPackage | null {
  if (!args.taskDetail) {
    return null;
  }

  const blockers = args.taskDetail.task.codexResponsePayload?.blockers ?? [];
  const intent = classifyCustomerIntent({
    text: args.taskDetail.task.userRequest,
    source: "command_center",
    originalPayload: {
      buildRoomTaskId: args.taskDetail.task.id,
      laneSlug: args.taskDetail.task.laneSlug,
      taskType: args.taskDetail.task.taskType
    }
  });
  const readinessStatus = buildReadinessStatus({
    status: args.taskDetail.task.status,
    blockerCount: blockers.length,
    isPendingExecution: args.isPendingExecution ?? false
  });
  const decisionGate = buildReadinessDecisionGate({
    readinessStatus,
    blockers,
    pendingReason: args.pendingReason ?? null
  });
  const intentSummary = buildTaskIntentSummary({
    taskType: args.taskDetail.task.taskType,
    intentType: intent.intentType,
    lane: intent.lane
  });

  return buildRoomHandoffPackageSchema.parse({
    packageId: `${args.projectId}:build-room:${args.taskDetail.task.id}`,
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    taskTitle: args.taskDetail.task.title,
    taskSummary: `${intentSummary} for ${args.projectTitle}.`,
    originalIntent: intent,
    customerIntentType: intent.intentType,
    commandCenterLane: intent.lane,
    normalizedRequest: intent.normalizedText,
    executionTaskType: args.taskDetail.task.taskType,
    requestedOutputMode: args.taskDetail.task.requestedOutputMode,
    riskLevel: args.taskDetail.task.riskLevel,
    acceptanceCriteria: args.taskDetail.task.acceptanceCriteria ?? null,
    blockers,
    readinessStatus,
    decisionGate,
    emittedEvent: "neroa_one.build_room.handoff_bound"
  });
}
