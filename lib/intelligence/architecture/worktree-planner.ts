import { worktreePlanSchema, type Lane, type WorktreePlan } from "./types.ts";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function joinModuleSummary(moduleIds: readonly string[]) {
  if (moduleIds.length === 0) {
    return "No modules are assigned yet.";
  }

  if (moduleIds.length === 1) {
    return moduleIds[0];
  }

  if (moduleIds.length === 2) {
    return `${moduleIds[0]} and ${moduleIds[1]}`;
  }

  return `${moduleIds.slice(0, -1).join(", ")}, and ${moduleIds[moduleIds.length - 1]}`;
}

export function buildWorktreePlans(args: {
  projectId: string;
  projectName?: string | null;
  lanes: readonly Lane[];
}) {
  const projectSlug = slugify(args.projectName ?? args.projectId) || "project";

  return args.lanes.map((lane) =>
    worktreePlanSchema.parse({
      id: `worktree-${lane.id}`,
      laneId: lane.id,
      branchName: `codex/${projectSlug}/${lane.id}`,
      purpose: `Isolate ${lane.name.toLowerCase()} implementation work behind one protected lane worktree.`,
      scopeSummary: `Own ${joinModuleSummary(lane.ownedModuleIds)} without widening into sibling lanes.`,
      blockedBy: [...lane.dependsOnLaneIds],
      approvalNotes:
        lane.dependsOnLaneIds.length === 0
          ? "This worktree can open after the architecture draft is reviewed in Strategy Room."
          : `Open after ${lane.dependsOnLaneIds.join(", ")} is stable and the roadmap gate approves execution.`
    })
  ) satisfies WorktreePlan[];
}
