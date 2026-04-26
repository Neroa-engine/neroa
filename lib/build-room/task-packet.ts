import type { BuildRoomTaskPacket } from "@/lib/build-room/contracts";
import type { BuildRoomProjectContext, BuildRoomTask } from "@/lib/build-room/types";
import { buildProjectContextSnapshot } from "@/lib/workspace/project-context-summary";
import { getProjectLaneBySlug, getProjectLanePhaseForLane } from "@/lib/workspace/project-lanes";

function normalizeList(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => (typeof value === "string" ? [value] : []))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

export function createBuildRoomTaskPacket(args: {
  task: BuildRoomTask;
  projectContext: BuildRoomProjectContext;
}): BuildRoomTaskPacket {
  const { task, projectContext } = args;
  const { project, projectMetadata } = projectContext;
  const projectSnapshot = buildProjectContextSnapshot({
    project,
    projectMetadata
  });
  const lane = task.laneSlug ? getProjectLaneBySlug(project, task.laneSlug) : null;
  const lanePhase = lane ? getProjectLanePhaseForLane(lane) : null;
  const buildSession = projectMetadata?.buildSession ?? null;

  return {
    projectSummary: {
      title: project.title,
      templateLabel: project.templateLabel,
      description: project.description,
      buildingSummary: projectSnapshot.buildingSummary,
      audienceSummary: projectSnapshot.audienceSummary,
      primaryGoal: projectSnapshot.primaryGoal,
      activePhaseLabel: projectContext.phaseLabel,
      activePhaseSummary: projectContext.phaseSummary,
      currentFocus: projectSnapshot.currentFocus
    },
    currentLaneContext: lane
      ? {
          slug: lane.slug,
          title: lane.title,
          description: lane.description,
          phaseLabel: lanePhase?.label ?? null,
          deliverables: lane.deliverables,
          starterPrompts: lane.starterPrompts
        }
      : null,
    userRequest: task.userRequest,
    acceptanceCriteria: task.acceptanceCriteria,
    riskLevel: task.riskLevel,
    constraints: normalizeList([
      "Return a governed response only. Do not claim that code was executed or merged.",
      "Worker execution is blocked until a human explicitly approves it.",
      task.requestedOutputMode === "plan_only"
        ? "Prefer plan clarity, sequencing, risks, and file-target guidance over concrete code."
        : "A patch proposal is allowed, but it must remain a proposal until worker approval.",
      task.riskLevel === "high"
        ? "Treat this as a high-risk task and call out blockers, uncertainty, and rollback concerns."
        : null
    ]),
    repoContext: {
      workspaceId: project.workspaceId,
      projectId: project.id,
      templateId: project.templateId,
      templateLabel: project.templateLabel,
      availableLanes: project.lanes.map((projectLane) => ({
        slug: projectLane.slug,
        title: projectLane.title,
        description: projectLane.description,
        status: projectLane.status
      })),
      signals: normalizeList([
        buildSession?.scope.frameworkLabel,
        buildSession?.scope.buildTypeLabel,
        buildSession?.scope.productTypeLabel,
        ...(buildSession?.scope.keyModules ?? []),
        ...(buildSession?.scope.integrationNeeds ?? []),
        ...(buildSession?.scope.firstBuild ?? [])
      ])
    },
    requestedOutputMode: task.requestedOutputMode
  };
}
