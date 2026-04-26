import {
  dependencyEdgeSchema,
  type ArchitectureBlueprint,
  type DependencyEdge,
  type SystemModule
} from "./types.ts";

function uniqueStrings(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function buildDependencyGraph(modules: readonly SystemModule[]) {
  const modulesById = new Map(modules.map((module) => [module.id, module]));
  const edges: DependencyEdge[] = [];

  for (const module of modules) {
    for (const dependencyId of uniqueStrings(module.dependsOn)) {
      const dependency = modulesById.get(dependencyId);

      if (!dependency) {
        continue;
      }

      edges.push(
        dependencyEdgeSchema.parse({
          fromModuleId: module.id,
          toModuleId: dependency.id,
          type: "hard",
          reason: `${module.name} depends on ${dependency.name} to deliver its purpose cleanly.`
        })
      );
    }
  }

  return edges;
}

export function validateArchitectureBlueprintReferences(
  blueprint: ArchitectureBlueprint
) {
  const moduleIds = new Set(blueprint.modules.map((module) => module.id));
  const laneIds = new Set(blueprint.lanes.map((lane) => lane.id));

  return {
    unknownDependencyModuleIds: blueprint.dependencyGraph.flatMap((edge) => {
      const unknown: string[] = [];

      if (!moduleIds.has(edge.fromModuleId)) {
        unknown.push(edge.fromModuleId);
      }

      if (!moduleIds.has(edge.toModuleId)) {
        unknown.push(edge.toModuleId);
      }

      return unknown;
    }),
    unknownLaneModuleIds: blueprint.lanes.flatMap((lane) =>
      lane.ownedModuleIds.filter((moduleId) => !moduleIds.has(moduleId))
    ),
    unknownWorktreeLaneIds: blueprint.worktrees.flatMap((worktree) => {
      const unknown: string[] = [];

      if (!laneIds.has(worktree.laneId)) {
        unknown.push(worktree.laneId);
      }

      for (const blockedLaneId of worktree.blockedBy) {
        if (!laneIds.has(blockedLaneId)) {
          unknown.push(blockedLaneId);
        }
      }

      return unknown;
    })
  };
}
