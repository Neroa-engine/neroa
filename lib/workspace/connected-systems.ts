import type { ProjectRecord } from "@/lib/workspace/project-lanes";

export type ConnectedSystemId = "narua" | "forge" | "atlas" | "github" | "codex";

export type ConnectedSystemDefinition = {
  id: ConnectedSystemId;
  name: string;
  kind: "core-assistant" | "specialist-agent" | "integration" | "repo-native";
  architectureMode: "lane-thread" | "integration" | "repo-workflow";
  description: string;
  statusText: string;
};

function hasLane(project: ProjectRecord, values: string[]) {
  return project.lanes.some((lane) => values.includes(lane.slug));
}

export function buildConnectedSystems(project: ProjectRecord): ConnectedSystemDefinition[] {
  const codingRelevant = hasLane(project, ["coding", "architecture", "data-model", "deployment"]);

  return [
    {
      id: "narua",
      name: "Neroa",
      kind: "core-assistant",
      architectureMode: "lane-thread",
      description:
        "Neroa is the core assistant layer of Neroa and remains active across every project lane.",
      statusText: "Core assistant layer"
    },
    {
      id: "forge",
      name: "Forge",
      kind: "specialist-agent",
      architectureMode: "lane-thread",
      description:
        "Forge follows the standard project-plus-lane architecture and can be activated inside focused build lanes when implementation depth is needed.",
      statusText: codingRelevant ? "Ready for build lanes" : "Available when build depth is needed"
    },
    {
      id: "atlas",
      name: "Atlas",
      kind: "specialist-agent",
      architectureMode: "lane-thread",
      description:
        "Atlas follows the same lane-thread model and is best used where research, reasoning, and long-context analysis improve the project.",
      statusText: "Available across planning lanes"
    },
    {
      id: "github",
      name: "GitHub",
      kind: "integration",
      architectureMode: "integration",
      description:
        "GitHub is treated as connected infrastructure and repository context, not as a normal lane chat thread.",
      statusText: "Connected repository integration"
    },
    {
      id: "codex",
      name: "Codex",
      kind: "repo-native",
      architectureMode: "repo-workflow",
      description:
        "Codex remains repository-native and works through repo, environment, branch, and file workflows launched from relevant build lanes.",
      statusText: codingRelevant ? "Launch from coding lanes" : "Repo-native exception"
    }
  ];
}
