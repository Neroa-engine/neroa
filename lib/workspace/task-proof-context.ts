import {
  commandCenterTaskRoadmapDeviationBlocksExecution,
  formatCommandCenterCustomerRequestTypeLabel,
  formatCommandCenterTaskRoadmapDecisionOptionLabel,
  formatCommandCenterTaskRoadmapDeviationStatusLabel,
  type CommandCenterTaskStatus,
  type StoredCommandCenterTask
} from "@/lib/workspace/command-center-tasks";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";
import {
  normalizeTaskExecutionLink,
  type TaskExecutionLink
} from "@/lib/workspace/task-linking";

const commandCenterTaskStatusLabels: Record<CommandCenterTaskStatus, string> = {
  queued: "Queued",
  in_review: "In review",
  waiting_on_decision: "Waiting on decision",
  ready: "Ready",
  active: "Active",
  completed: "Completed"
};

export type TaskProofContext = {
  taskLink: TaskExecutionLink;
  customerTaskId: string | null;
  taskLabel: string;
  taskStatusLabel: string | null;
  requestTypeLabel: string | null;
  roadmapArea: string | null;
  inspectionFocus: string;
  strategyRoomHref: string | null;
  roadmapBlocked: boolean;
  roadmapDeviation:
    | {
        statusLabel: string;
        latestDecisionLabel: string | null;
        changedSummary: string;
        reason: string;
        riskSummary: string;
        decisionNeeded: string;
        executionAllowed: boolean;
      }
    | null;
};

function quoteTaskLabel(value: string | null | undefined) {
  return value?.trim() ? `"${value.trim()}"` : "this linked task";
}

function buildInspectionFocus(task: StoredCommandCenterTask | null, roadmapBlocked: boolean) {
  const subject = quoteTaskLabel(task?.title);
  const requestType = task?.intelligenceMetadata?.requestType ?? null;

  if (roadmapBlocked) {
    return `Inspect the current approved experience related to ${subject} and capture supporting proof before execution resumes.`;
  }

  if (requestType === "problem_bug") {
    return `Inspect the failing page, route, or interaction related to ${subject} and capture evidence for the reported issue.`;
  }

  if (requestType === "revision") {
    return `Inspect the current experience related to ${subject} so the requested revision stays grounded in the approved task scope.`;
  }

  if (requestType === "change_direction") {
    return `Inspect the current approved experience related to ${subject} so any proposed direction change can be reviewed against real proof.`;
  }

  if (requestType === "question_decision") {
    return `Inspect the current experience related to ${subject} so the pending product decision is grounded in live evidence.`;
  }

  if (requestType === "new_request") {
    return `Inspect the target flow or surface related to ${subject} and keep new evidence attached to the same task.`;
  }

  return "Inspect the current runtime target and keep evidence linked to this task.";
}

function resolveCustomerTaskId(args: {
  projectMetadata?: StoredProjectMetadata | null;
  taskLink: TaskExecutionLink;
}) {
  const executionState = args.projectMetadata?.executionState;

  if (!executionState) {
    return null;
  }

  if (args.taskLink.executionPacketId) {
    const packetMatch = executionState.executionPackets?.find(
      (item) => item.packetId === args.taskLink.executionPacketId
    );

    if (packetMatch?.sourceRequestId) {
      return packetMatch.sourceRequestId;
    }
  }

  if (args.taskLink.buildRoomTaskId) {
    const packetMatch = executionState.executionPackets?.find(
      (item) => item.buildRoomTaskId === args.taskLink.buildRoomTaskId
    );

    if (packetMatch?.sourceRequestId) {
      return packetMatch.sourceRequestId;
    }

    const pendingMatch = executionState.pendingExecutions?.find(
      (item) => item.buildRoomTaskId === args.taskLink.buildRoomTaskId
    );

    if (pendingMatch?.commandCenterTaskId) {
      return pendingMatch.commandCenterTaskId;
    }
  }

  if (args.taskLink.executionPacketId) {
    const pendingMatch = executionState.pendingExecutions?.find(
      (item) => item.latestPacketId === args.taskLink.executionPacketId
    );

    if (pendingMatch?.commandCenterTaskId) {
      return pendingMatch.commandCenterTaskId;
    }
  }

  return null;
}

function resolveLinkedTask(args: {
  projectMetadata?: StoredProjectMetadata | null;
  customerTaskId: string | null;
}) {
  if (!args.customerTaskId) {
    return null;
  }

  return (
    args.projectMetadata?.commandCenterTasks?.find((item) => item.id === args.customerTaskId) ??
    null
  );
}

function buildTaskLabel(args: {
  task: StoredCommandCenterTask | null;
  customerTaskId: string | null;
}) {
  if (args.task?.title?.trim()) {
    return args.task.title.trim();
  }

  if (args.task?.intelligenceMetadata?.requestType) {
    return `${formatCommandCenterCustomerRequestTypeLabel(
      args.task.intelligenceMetadata.requestType
    )} task`;
  }

  if (args.customerTaskId) {
    return `Customer Task ${args.customerTaskId}`;
  }

  return "Linked customer task";
}

export function buildTaskProofContext(args: {
  projectMetadata?: StoredProjectMetadata | null;
  taskLink?: TaskExecutionLink | null;
  strategyRoomHref?: string | null;
}) {
  const taskLink = normalizeTaskExecutionLink(args.taskLink);

  if (!taskLink) {
    return null;
  }

  const customerTaskId = resolveCustomerTaskId({
    projectMetadata: args.projectMetadata,
    taskLink
  });
  const task = resolveLinkedTask({
    projectMetadata: args.projectMetadata,
    customerTaskId
  });
  const roadmapBlocked = commandCenterTaskRoadmapDeviationBlocksExecution(task?.roadmapDeviation);

  return {
    taskLink,
    customerTaskId,
    taskLabel: buildTaskLabel({
      task,
      customerTaskId
    }),
    taskStatusLabel: task ? commandCenterTaskStatusLabels[task.status] : null,
    requestTypeLabel:
      task?.intelligenceMetadata?.requestTypeLabel ??
      (task?.intelligenceMetadata?.requestType
        ? formatCommandCenterCustomerRequestTypeLabel(task.intelligenceMetadata.requestType)
        : null),
    roadmapArea: task?.roadmapArea ?? null,
    inspectionFocus: buildInspectionFocus(task, roadmapBlocked),
    strategyRoomHref: args.strategyRoomHref ?? null,
    roadmapBlocked,
    roadmapDeviation: task?.roadmapDeviation
      ? {
          statusLabel: formatCommandCenterTaskRoadmapDeviationStatusLabel(
            task.roadmapDeviation.status
          ),
          latestDecisionLabel: task.roadmapDeviation.latestDecision
            ? formatCommandCenterTaskRoadmapDecisionOptionLabel(
                task.roadmapDeviation.latestDecision
              )
            : null,
          changedSummary: task.roadmapDeviation.changedSummary,
          reason: task.roadmapDeviation.reason,
          riskSummary: task.roadmapDeviation.riskSummary,
          decisionNeeded: task.roadmapDeviation.decisionNeeded,
          executionAllowed: !roadmapBlocked
        }
      : null
  } satisfies TaskProofContext;
}
