import { getAccessibleWorkspace, type ServerSupabaseClient } from "@/lib/platform/foundation";
import {
  buildCustomerFacingStageLabel,
  buildCustomerFacingStageSummary
} from "@/lib/workspace/customer-project-truth";
import { deriveWorkspaceLanes } from "@/lib/workspace/lanes";
import {
  buildProjectModel,
  getFirstProjectLane,
  getProjectLanePhaseForLane
} from "@/lib/workspace/project-lanes";
import { parseWorkspaceProjectDescription } from "@/lib/workspace/project-metadata";
import type { BuildRoomProjectContext } from "@/lib/build-room/types";

export async function loadBuildRoomProjectContext(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  workspaceId: string;
  projectId: string;
}): Promise<BuildRoomProjectContext> {
  const workspace = await getAccessibleWorkspace({
    supabase: args.supabase,
    userId: args.userId,
    workspaceId: args.workspaceId
  });

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  if (args.projectId.trim() !== workspace.id) {
    throw new Error(
      "This non-canonical project route has been retired. Continue in the active project portal."
    );
  }

  const parsedWorkspace = parseWorkspaceProjectDescription(workspace.description);
  const cleanWorkspace = {
    ...workspace,
    description: parsedWorkspace.visibleDescription
  };
  const laneSelection = deriveWorkspaceLanes({
    name: cleanWorkspace.name,
    description: cleanWorkspace.description
  });
  const project = buildProjectModel({
    workspaceId: cleanWorkspace.id,
    projectId: args.projectId,
    title: cleanWorkspace.name,
    description: cleanWorkspace.description,
    templateId: parsedWorkspace.metadata?.templateId ?? null,
    primaryLaneId: laneSelection.primaryLaneId,
    customLanes: parsedWorkspace.metadata?.customLanes ?? []
  });
  const featuredLane = getFirstProjectLane(project);
  const phase = featuredLane ? getProjectLanePhaseForLane(featuredLane) : null;

  return {
    workspace: {
      id: cleanWorkspace.id,
      name: cleanWorkspace.name,
      description: cleanWorkspace.description,
      ownerId: cleanWorkspace.owner_id,
      accessMode: cleanWorkspace.accessMode === "member" ? "member" : "owner"
    },
    project,
    projectMetadata: parsedWorkspace.metadata,
    phaseId: phase?.id ?? "strategy",
    phaseLabel: buildCustomerFacingStageLabel(phase?.id),
    phaseSummary: buildCustomerFacingStageSummary(phase?.id)
  };
}
