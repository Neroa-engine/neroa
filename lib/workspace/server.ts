import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { deriveWorkspaceLanes } from "@/lib/workspace/lanes";
import { parseWorkspaceProjectDescription } from "@/lib/workspace/project-metadata";
import {
  getFirstProjectLane,
  buildProjectModel,
  type CustomProjectLaneInput,
  type ProjectRecord
} from "@/lib/workspace/project-lanes";
import {
  getAccessibleWorkspace
} from "@/lib/platform/foundation";
import { buildProjectWorkspaceRoute } from "@/lib/portal/routes";

type WorkspaceProjectContextOptions = {
  requestedPrimaryLaneId?: string | null;
  requestedSupportingLaneIds?: string | null;
  nextPath?: string | null;
};

export async function getWorkspaceForCurrentUser(
  workspaceId: string,
  options?: {
    nextPath?: string | null;
  }
) {
  const { supabase, user, access } = await requireUser({
    nextPath: options?.nextPath ?? `/workspace/${workspaceId}`
  });

  const workspace = await getAccessibleWorkspace({
    supabase,
    userId: user.id,
    workspaceId
  }).catch((error) =>
    redirect(
      `/dashboard?error=${encodeURIComponent(
        error instanceof Error ? error.message : "Unable to load workspace."
      )}`
    )
  );

  if (!workspace) {
    redirect("/dashboard?error=Workspace not found.");
  }

  return { supabase, user, access, workspace };
}

function buildWorkspaceProjectFromRecord(args: {
  workspace: {
    id: string;
    name: string;
    description: string | null;
  };
  projectId: string;
  persistedTemplateId?: ProjectRecord["templateId"] | null;
  persistedCustomLanes?: CustomProjectLaneInput[];
  options?: WorkspaceProjectContextOptions;
}) {
  const laneSelection = deriveWorkspaceLanes({
    name: args.workspace.name,
    description: args.workspace.description,
    requestedPrimaryLaneId: args.options?.requestedPrimaryLaneId,
    requestedSupportingLaneIds: args.options?.requestedSupportingLaneIds
  });

  return buildProjectModel({
    workspaceId: args.workspace.id,
    projectId: args.projectId,
    title: args.workspace.name,
    description: args.workspace.description,
    templateId: args.persistedTemplateId ?? null,
    primaryLaneId: laneSelection.primaryLaneId,
    customLanes: args.persistedCustomLanes ?? []
  });
}

function buildCanonicalWorkspaceErrorRoute(workspaceId: string, message: string) {
  return `${buildProjectWorkspaceRoute(workspaceId)}?error=${encodeURIComponent(message)}`;
}

export async function getWorkspaceProjectContext(
  workspaceId: string,
  projectId: string,
  options?: WorkspaceProjectContextOptions
) {
  const { supabase, user, access, workspace } = await getWorkspaceForCurrentUser(workspaceId, {
    nextPath: options?.nextPath ?? buildProjectWorkspaceRoute(workspaceId)
  });

  if (!projectId.trim()) {
    redirect(buildCanonicalWorkspaceErrorRoute(workspace.id, "Project not found."));
  }

  if (projectId !== workspace.id) {
    redirect(
      buildCanonicalWorkspaceErrorRoute(
        workspace.id,
        "This non-canonical project route has been retired. Continue in the active project portal."
      )
    );
  }

  const parsedWorkspace = parseWorkspaceProjectDescription(workspace.description);
  const cleanWorkspace = {
    ...workspace,
    description: parsedWorkspace.visibleDescription
  };
  const project = buildWorkspaceProjectFromRecord({
    workspace: cleanWorkspace,
    projectId,
    persistedTemplateId: parsedWorkspace.metadata?.templateId ?? null,
    persistedCustomLanes: parsedWorkspace.metadata?.customLanes ?? [],
    options
  });

  return {
    supabase,
    user,
    access,
    workspace: cleanWorkspace,
    project,
    projectMetadata: parsedWorkspace.metadata
  };
}

export function getProjectFeaturedLane(project: ProjectRecord) {
  return getFirstProjectLane(project);
}
