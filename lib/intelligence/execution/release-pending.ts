import {
  executionPacketSummarySchema,
  executionStateSchema,
  pendingExecutionItemSchema,
  pendingExecutionReleaseResultSchema,
  type ExecutionPacket,
  type ExecutionPacketSummary,
  type ExecutionState,
  type PendingExecutionItem,
  type PendingExecutionReleaseResult
} from "./types.ts";
import {
  type BuildRoomOutputMode,
  type BuildRoomRiskLevel,
  type BuildRoomTaskType
} from "@/lib/build-room/contracts";

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

export function createEmptyExecutionState(): ExecutionState {
  return executionStateSchema.parse({
    pendingExecutions: [],
    executionPackets: []
  });
}

export function normalizeExecutionState(
  value?: unknown
): ExecutionState {
  if (!value || typeof value !== "object") {
    return createEmptyExecutionState();
  }

  const maybeState = value as {
    pendingExecutions?: unknown;
    executionPackets?: unknown;
  };

  return executionStateSchema.parse({
    pendingExecutions: Array.isArray(maybeState.pendingExecutions)
      ? maybeState.pendingExecutions
      : [],
    executionPackets: Array.isArray(maybeState.executionPackets)
      ? maybeState.executionPackets
      : []
  });
}

export function buildPendingExecutionItem(args: {
  pendingExecutionId: string;
  commandCenterTaskId?: string | null;
  buildRoomTaskId?: string | null;
  title: string;
  request: string;
  roadmapArea: string;
  laneSlug?: string | null;
  taskType: BuildRoomTaskType;
  requestedOutputMode: BuildRoomOutputMode;
  acceptanceCriteria: readonly string[];
  riskLevel: BuildRoomRiskLevel;
  createdAt: string;
  updatedAt?: string;
  status?: PendingExecutionItem["status"];
  latestPacketId?: string | null;
  latestScopeOutcome?: PendingExecutionItem["latestScopeOutcome"];
  latestReason?: string | null;
}) {
  return pendingExecutionItemSchema.parse({
    pendingExecutionId: args.pendingExecutionId,
    commandCenterTaskId: args.commandCenterTaskId ?? null,
    buildRoomTaskId: args.buildRoomTaskId ?? null,
    title: cleanText(args.title),
    request: cleanText(args.request),
    roadmapArea: cleanText(args.roadmapArea),
    laneSlug: args.laneSlug ?? null,
    taskType: args.taskType,
    requestedOutputMode: args.requestedOutputMode,
    acceptanceCriteria: uniqueStrings([...args.acceptanceCriteria]),
    riskLevel: args.riskLevel,
    status: args.status ?? "pending",
    latestPacketId: args.latestPacketId ?? null,
    latestScopeOutcome: args.latestScopeOutcome ?? null,
    latestReason: cleanText(args.latestReason) || null,
    createdAt: args.createdAt,
    updatedAt: args.updatedAt ?? args.createdAt
  });
}

export function buildExecutionPacketSummary(args: {
  packet: ExecutionPacket;
  buildRoomTaskId?: string | null;
  pendingExecutionId?: string | null;
  status?: ExecutionPacketSummary["status"];
  updatedAt: string;
}) {
  return executionPacketSummarySchema.parse({
    packetId: args.packet.executionPacketId,
    sourceRequestId: args.packet.sourceRequestId,
    buildRoomTaskId: args.buildRoomTaskId ?? args.packet.buildRoomTaskPayload.existingTaskId ?? null,
    pendingExecutionId: args.pendingExecutionId ?? null,
    requestSummary: args.packet.requestSummary,
    status: args.status ?? args.packet.status,
    scopeOutcome: args.packet.scopeDecision.outcome,
    readinessStatus: args.packet.readiness.status,
    laneIds: args.packet.laneIds,
    moduleIds: args.packet.moduleIds,
    phaseIds: args.packet.phaseIds,
    approvalState: args.packet.readiness.approvalAllowed ? "approved" : "pending_approval",
    updatedAt: args.updatedAt
  });
}

export function upsertExecutionPacketSummary(args: {
  executionState: ExecutionState | null | undefined;
  summary: ExecutionPacketSummary;
}) {
  const current = normalizeExecutionState(args.executionState);
  const nextSummaries = [
    args.summary,
    ...current.executionPackets.filter(
      (item) =>
        item.packetId !== args.summary.packetId &&
        (args.summary.buildRoomTaskId
          ? item.buildRoomTaskId !== args.summary.buildRoomTaskId
          : true)
    )
  ];

  return executionStateSchema.parse({
    ...current,
    executionPackets: nextSummaries
  });
}

export function upsertPendingExecutionItem(args: {
  executionState: ExecutionState | null | undefined;
  pendingItem: PendingExecutionItem;
}) {
  const current = normalizeExecutionState(args.executionState);
  const nextPending = [
    args.pendingItem,
    ...current.pendingExecutions.filter(
      (item) => item.pendingExecutionId !== args.pendingItem.pendingExecutionId
    )
  ];

  return executionStateSchema.parse({
    ...current,
    pendingExecutions: nextPending
  });
}

export function findPendingExecutionById(
  executionState: ExecutionState | null | undefined,
  pendingExecutionId: string
) {
  return (
    normalizeExecutionState(executionState).pendingExecutions.find(
      (item) => item.pendingExecutionId === pendingExecutionId
    ) ?? null
  );
}

export function findPendingExecutionByBuildRoomTaskId(
  executionState: ExecutionState | null | undefined,
  buildRoomTaskId?: string | null
) {
  if (!buildRoomTaskId) {
    return null;
  }

  return (
    normalizeExecutionState(executionState).pendingExecutions.find(
      (item) => item.buildRoomTaskId === buildRoomTaskId
    ) ?? null
  );
}

export function listActivePendingExecutions(
  executionState: ExecutionState | null | undefined
) {
  return normalizeExecutionState(executionState).pendingExecutions.filter(
    (item) => item.status !== "released"
  );
}

export function findExecutionPacketSummaryForTask(args: {
  executionState: ExecutionState | null | undefined;
  buildRoomTaskId?: string | null;
}) {
  if (!args.buildRoomTaskId) {
    return null;
  }

  return (
    normalizeExecutionState(args.executionState).executionPackets.find(
      (item) => item.buildRoomTaskId === args.buildRoomTaskId
    ) ?? null
  );
}

export function applyPendingExecutionHold(args: {
  executionState: ExecutionState | null | undefined;
  pendingItem: PendingExecutionItem;
  packet: ExecutionPacket;
  now: string;
}) {
  const heldItem = buildPendingExecutionItem({
    ...args.pendingItem,
    status:
      args.packet.scopeDecision.outcome === "governance_blocked"
        ? "governance_blocked"
        : args.packet.scopeDecision.requiresRoadmapRevision ||
            args.packet.scopeDecision.requiresArchitectureRevision
          ? "revision_required"
          : "pending",
    latestPacketId: null,
    latestScopeOutcome: args.packet.scopeDecision.outcome,
    latestReason: args.packet.readiness.reason,
    updatedAt: args.now
  });
  const executionState = upsertPendingExecutionItem({
    executionState: args.executionState,
    pendingItem: heldItem
  });
  const result = pendingExecutionReleaseResultSchema.parse({
    pendingExecutionId: heldItem.pendingExecutionId,
    packetCreated: false,
    executionReady: false,
    requestClass: args.packet.requestClass,
    scopeOutcome: args.packet.scopeDecision.outcome,
    buildRoomTaskCreated: false,
    pendingExecutionReleased: false,
    blockers: args.packet.readiness.blockers,
    reason: args.packet.readiness.reason,
    buildRoomTaskId: heldItem.buildRoomTaskId ?? null,
    executionPacketId: null,
    summary: `Pending execution stayed on hold: ${args.packet.readiness.reason}`
  }) satisfies PendingExecutionReleaseResult;

  return {
    executionState,
    pendingItem: heldItem,
    result
  };
}

export function applyPendingExecutionRelease(args: {
  executionState: ExecutionState | null | undefined;
  pendingItem: PendingExecutionItem;
  packet: ExecutionPacket;
  buildRoomTaskId: string;
  now: string;
  buildRoomTaskCreated: boolean;
}) {
  const releasedItem = buildPendingExecutionItem({
    ...args.pendingItem,
    buildRoomTaskId: args.buildRoomTaskId,
    status: "released",
    latestPacketId: args.packet.executionPacketId,
    latestScopeOutcome: args.packet.scopeDecision.outcome,
    latestReason: args.packet.readiness.reason,
    updatedAt: args.now
  });
  const summary = buildExecutionPacketSummary({
    packet: args.packet,
    buildRoomTaskId: args.buildRoomTaskId,
    pendingExecutionId: releasedItem.pendingExecutionId,
    status: "released_to_build_room",
    updatedAt: args.now
  });
  const nextState = upsertExecutionPacketSummary({
    executionState: upsertPendingExecutionItem({
      executionState: args.executionState,
      pendingItem: releasedItem
    }),
    summary
  });
  const result = pendingExecutionReleaseResultSchema.parse({
    pendingExecutionId: releasedItem.pendingExecutionId,
    packetCreated: true,
    executionReady: true,
    requestClass: args.packet.requestClass,
    scopeOutcome: args.packet.scopeDecision.outcome,
    buildRoomTaskCreated: args.buildRoomTaskCreated,
    pendingExecutionReleased: true,
    blockers: [],
    reason: args.packet.readiness.reason,
    buildRoomTaskId: args.buildRoomTaskId,
    executionPacketId: args.packet.executionPacketId,
    summary: "Pending execution was released into the existing Build Room relay."
  }) satisfies PendingExecutionReleaseResult;

  return {
    executionState: nextState,
    pendingItem: releasedItem,
    summary,
    result
  };
}
