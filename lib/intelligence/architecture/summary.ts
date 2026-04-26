import type { ArchitectureBlueprint } from "./types.ts";

function joinList(values: readonly string[]) {
  if (values.length === 0) {
    return null;
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

export type ArchitectureBlueprintSummary = {
  headline: string;
  laneSummary: string;
  moduleNames: string[];
  worktreeBranches: string[];
  riskTitles: string[];
  openQuestionLabels: string[];
};

export function buildArchitectureBlueprintSummary(
  blueprint: ArchitectureBlueprint
): ArchitectureBlueprintSummary {
  const laneSummary =
    joinList(blueprint.lanes.map((lane) => lane.name)) ?? "Lanes still need planning.";

  return {
    headline: `${blueprint.systemType.replace(/_/g, " ")} / ${blueprint.tenancyModel.replace(
      /_/g,
      " "
    )}`,
    laneSummary,
    moduleNames: blueprint.modules.slice(0, 6).map((module) => module.name),
    worktreeBranches: blueprint.worktrees.slice(0, 4).map((worktree) => worktree.branchName),
    riskTitles: blueprint.architectureRisks.slice(0, 3).map((risk) => risk.title),
    openQuestionLabels: blueprint.openQuestions.slice(0, 3).map((question) => question.label)
  };
}
