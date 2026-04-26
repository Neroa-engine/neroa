import {
  findPendingExecutionByBuildRoomTaskId,
  findExecutionPacketSummaryForTask,
  listActivePendingExecutions
} from "./release-pending.ts";
import type { ExecutionState } from "./types.ts";

export function buildExecutionStateSummary(
  executionState: ExecutionState | null | undefined
) {
  const pendingExecutions = listActivePendingExecutions(executionState);
  const releasedCount =
    executionState?.pendingExecutions.filter((item) => item.status === "released").length ?? 0;

  return {
    pendingCount: pendingExecutions.length,
    releasedCount,
    pendingExecutions
  };
}

export function getExecutionPacketRelationship(args: {
  executionState: ExecutionState | null | undefined;
  buildRoomTaskId?: string | null;
}) {
  const packetSummary = findExecutionPacketSummaryForTask({
    executionState: args.executionState,
    buildRoomTaskId: args.buildRoomTaskId
  });

  return {
    packetSummary,
    hasPacket: Boolean(packetSummary)
  };
}

export function getPendingExecutionRelationship(args: {
  executionState: ExecutionState | null | undefined;
  buildRoomTaskId?: string | null;
}) {
  const pendingItem = findPendingExecutionByBuildRoomTaskId(
    args.executionState,
    args.buildRoomTaskId
  );
  const isActivePending =
    pendingItem?.status === "pending" ||
    pendingItem?.status === "revision_required" ||
    pendingItem?.status === "governance_blocked";

  return {
    pendingItem,
    isActivePending
  };
}
