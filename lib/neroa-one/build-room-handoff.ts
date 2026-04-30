import {
  buildRoomHandoffPackageSchema,
  type BuildRoomHandoffPackage,
  type CustomerIntentEnvelope,
  type NeroaOneDecisionGate,
  type SpaceContext
} from "./schemas.ts";

function clipText(value: string, maxLength = 88) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clipped = normalized.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return clipped || normalized;
}

export function buildBuildRoomHandoffPackage(args: {
  spaceContext: SpaceContext;
  intent: CustomerIntentEnvelope;
  decisionGate: NeroaOneDecisionGate;
}): BuildRoomHandoffPackage {
  return buildRoomHandoffPackageSchema.parse({
    packageId: `${args.spaceContext.projectId}:handoff:${args.intent.lane}`,
    workspaceId: args.spaceContext.workspaceId,
    projectId: args.spaceContext.projectId,
    taskTitle: clipText(args.intent.rawText),
    taskSummary: `Prepare Build Room handoff for ${args.spaceContext.project.title} from the ${args.intent.lane} lane.`,
    originalIntent: args.intent,
    decisionGate: args.decisionGate,
    emittedEvent: "neroa_one.build_room.handoff_prepared"
  });
}
