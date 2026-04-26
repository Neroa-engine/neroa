import type {
  BuildRoomOutputMode,
  BuildRoomRiskLevel,
  BuildRoomTaskType
} from "@/lib/build-room/contracts";
import {
  executionPacketBuildRoomPayloadSchema,
  packetToBuildRoomMappingSchema,
  type ExecutionPacketBuildRoomPayload,
  type PacketToBuildRoomMapping
} from "./types.ts";

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function uniqueStrings(values: readonly string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const value of values) {
    const normalized = normalizeSpace(value).toLowerCase();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(normalizeSpace(value));
  }

  return items;
}

function joinSection(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "Not explicitly matched";
}

export function buildExecutionPacketTaskDescription(args: {
  request: string;
  scopeReason: string;
  laneIds: readonly string[];
  moduleIds: readonly string[];
  phaseIds: readonly string[];
  notInScopeWarnings: readonly string[];
}) {
  const lines = [
    `Original request: ${normalizeSpace(args.request)}`,
    "",
    "Governed scope context:",
    `- Architecture lanes: ${joinSection(args.laneIds)}`,
    `- Architecture modules: ${joinSection(args.moduleIds)}`,
    `- Roadmap phases: ${joinSection(args.phaseIds)}`,
    `- Scope decision: ${normalizeSpace(args.scopeReason)}`
  ];

  if (args.notInScopeWarnings.length > 0) {
    lines.push(`- Watchouts: ${joinSection(args.notInScopeWarnings)}`);
  }

  return lines.join("\n");
}

export function buildPacketToBuildRoomMapping(args: {
  packetId: string;
  originatingSurface: "command_center" | "build_room";
  title: string;
  request: string;
  taskType: BuildRoomTaskType;
  requestedOutputMode: BuildRoomOutputMode;
  riskLevel: BuildRoomRiskLevel;
  acceptanceCriteria: readonly string[];
  laneIds: readonly string[];
  phaseIds: readonly string[];
  moduleIds: readonly string[];
  scopeReason: string;
  notInScopeWarnings: readonly string[];
  selectedBuildLaneSlug?: string | null;
  existingBuildRoomTaskId?: string | null;
}) {
  return packetToBuildRoomMappingSchema.parse({
    buildRoomTaskType: args.taskType,
    taskTitle: normalizeSpace(args.title),
    taskDescription: buildExecutionPacketTaskDescription({
      request: args.request,
      scopeReason: args.scopeReason,
      laneIds: args.laneIds,
      moduleIds: args.moduleIds,
      phaseIds: args.phaseIds,
      notInScopeWarnings: args.notInScopeWarnings
    }),
    acceptanceCriteria: uniqueStrings([...args.acceptanceCriteria]),
    riskLevel: args.riskLevel,
    requestedOutputMode: args.requestedOutputMode,
    originatingSurface: args.originatingSurface,
    packetId: args.packetId,
    relatedLaneIds: uniqueStrings([...args.laneIds]),
    relatedPhaseIds: uniqueStrings([...args.phaseIds]),
    selectedBuildLaneSlug: args.selectedBuildLaneSlug ?? null,
    existingBuildRoomTaskId: args.existingBuildRoomTaskId ?? null
  });
}

export function buildExecutionPacketBuildRoomPayload(args: {
  mapping: PacketToBuildRoomMapping;
}) {
  return executionPacketBuildRoomPayloadSchema.parse({
    existingTaskId: args.mapping.existingBuildRoomTaskId ?? null,
    laneSlug: args.mapping.selectedBuildLaneSlug ?? null,
    title: args.mapping.taskTitle,
    taskType: args.mapping.buildRoomTaskType,
    requestedOutputMode: args.mapping.requestedOutputMode,
    userRequest: args.mapping.taskDescription,
    acceptanceCriteria: uniqueStrings(args.mapping.acceptanceCriteria),
    riskLevel: args.mapping.riskLevel
  }) satisfies ExecutionPacketBuildRoomPayload;
}
