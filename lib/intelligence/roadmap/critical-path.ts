import type { ArchitectureBlueprint } from "../architecture/types.ts";
import {
  criticalPathStepSchema,
  type CriticalPathStep,
  type RoadmapPhase,
  type RoadmapPlan
} from "./types.ts";

function uniqueStrings(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildCriticalPathReason(args: {
  phase: RoadmapPhase;
  blueprint: ArchitectureBlueprint;
}) {
  const relatedLaneNames = args.blueprint.lanes
    .filter((lane) => args.phase.laneIds.includes(lane.id))
    .map((lane) => lane.name);

  if (relatedLaneNames.length > 0) {
    return `${args.phase.goal} This phase is on the critical path because it unlocks ${relatedLaneNames.join(
      ", "
    )}.`;
  }

  return args.phase.goal;
}

export function buildRoadmapCriticalPath(args: {
  phases: readonly RoadmapPhase[];
  blueprint: ArchitectureBlueprint;
}) {
  return args.phases.map((phase) =>
    criticalPathStepSchema.parse({
      id: `critical-${phase.phaseId}`,
      label: phase.name,
      phaseId: phase.phaseId,
      dependsOn: phase.dependsOnPhaseIds.map((dependencyPhaseId) => `critical-${dependencyPhaseId}`),
      reason: buildCriticalPathReason({
        phase,
        blueprint: args.blueprint
      })
    })
  );
}

export function validateRoadmapPlanReferences(args: {
  roadmapPlan: RoadmapPlan;
  architectureBlueprint: ArchitectureBlueprint;
}) {
  const moduleIds = new Set(args.architectureBlueprint.modules.map((module) => module.id));
  const laneIds = new Set(args.architectureBlueprint.lanes.map((lane) => lane.id));
  const phaseIds = new Set(args.roadmapPlan.phases.map((phase) => phase.phaseId));
  const criticalPathIds = new Set(args.roadmapPlan.criticalPath.map((step) => step.id));

  return {
    unknownPhaseModuleIds: uniqueStrings(
      args.roadmapPlan.phases.flatMap((phase) =>
        phase.moduleIds.filter((moduleId) => !moduleIds.has(moduleId))
      )
    ),
    unknownPhaseLaneIds: uniqueStrings(
      args.roadmapPlan.phases.flatMap((phase) =>
        phase.laneIds.filter((laneId) => !laneIds.has(laneId))
      )
    ),
    unknownCriticalPathPhaseIds: uniqueStrings(
      args.roadmapPlan.criticalPath.flatMap((step) =>
        phaseIds.has(step.phaseId) ? [] : [step.phaseId]
      )
    ),
    unknownCriticalPathDependencyIds: uniqueStrings(
      args.roadmapPlan.criticalPath.flatMap((step) =>
        step.dependsOn.filter((dependencyId) => !criticalPathIds.has(dependencyId))
      )
    )
  };
}
