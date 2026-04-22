import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { deriveWorkspaceLanes } from "@/lib/workspace/lanes";
import {
  buildProjectModel,
  getProjectLaneBySlug,
  resolveProjectLaneSlug
} from "@/lib/workspace/project-lanes";

export async function getWorkspaceForCurrentUser(
  workspaceId: string,
  options?: {
    nextPath?: string;
  }
) {
  const { supabase, user } = await requireUser({
    nextPath: options?.nextPath ?? `/workspace/${workspaceId}`
  });

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("id, name, description, created_at")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  if (!workspace) {
    redirect("/dashboard?error=Workspace not found.");
  }

  return { supabase, user, workspace };
}

export async function getWorkspaceProjectContext(
  workspaceId: string,
  projectId: string,
  options?: {
    nextPath?: string;
  }
) {
  const { user, workspace } = await getWorkspaceForCurrentUser(workspaceId, {
    nextPath: options?.nextPath ?? `/workspace/${workspaceId}/project/${projectId}`
  });

  if (projectId !== workspace.id) {
    redirect(`/workspace/${workspaceId}/project/${workspace.id}?error=Project not found.`);
  }

  const laneSelection = deriveWorkspaceLanes({
    name: workspace.name,
    description: workspace.description
  });
  const project = buildProjectModel({
    workspaceId: workspace.id,
    projectId,
    title: workspace.name,
    description: workspace.description,
    primaryLaneId: laneSelection.primaryLaneId
  });

  return {
    user,
    workspace,
    project
  };
}

export async function getWorkspaceProjectLaneContext(
  workspaceId: string,
  projectId: string,
  laneSlug: string,
  options?: {
    nextPath?: string;
  }
) {
  const { user, workspace, project } = await getWorkspaceProjectContext(workspaceId, projectId, {
    nextPath:
      options?.nextPath ?? `/workspace/${workspaceId}/project/${projectId}/lane/${laneSlug}`
  });
  const resolvedLaneSlug = resolveProjectLaneSlug(project, laneSlug);

  if (!resolvedLaneSlug) {
    redirect(`/workspace/${workspaceId}/project/${projectId}?error=Lane not found.`);
  }

  const lane = getProjectLaneBySlug(project, resolvedLaneSlug);

  if (!lane) {
    redirect(`/workspace/${workspaceId}/project/${projectId}?error=Lane not found.`);
  }

  return {
    user,
    workspace,
    project,
    lane
  };
}

export async function getWorkspaceEngineContext(
  workspaceId: string,
  engineSlug: string,
  options?: {
    nextPath?: string;
  }
) {
  const { user, workspace, project, lane } = await getWorkspaceProjectLaneContext(
    workspaceId,
    workspaceId,
    engineSlug,
    {
      nextPath: options?.nextPath ?? `/workspace/${workspaceId}/engine/${engineSlug}`
    }
  );

  return {
    user,
    workspace,
    project,
    laneId: lane.slug,
    lane
  };
}
