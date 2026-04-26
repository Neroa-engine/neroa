import type { ArchitectureLaneTemplate } from "./defaults.ts";
import { laneSchema, type DependencyEdge, type Lane, type SystemModule } from "./types.ts";

function uniqueStrings(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function buildArchitectureLanes(args: {
  laneTemplates: readonly ArchitectureLaneTemplate[];
  modules: readonly SystemModule[];
  dependencyGraph: readonly DependencyEdge[];
}) {
  const modulesById = new Map(args.modules.map((module) => [module.id, module]));

  return args.laneTemplates.map((template) => {
    const ownedModuleIds = args.modules
      .filter((module) => module.laneId === template.id)
      .map((module) => module.id);
    const dependencyLaneIds = args.dependencyGraph
      .filter((edge) => ownedModuleIds.includes(edge.fromModuleId))
      .map((edge) => modulesById.get(edge.toModuleId)?.laneId ?? null)
      .filter((laneId): laneId is string => Boolean(laneId))
      .filter((laneId) => laneId !== template.id);

    return laneSchema.parse({
      ...template,
      ownedModuleIds,
      dependsOnLaneIds: uniqueStrings([
        ...template.dependsOnLaneIds,
        ...dependencyLaneIds
      ])
    });
  }) satisfies Lane[];
}
