import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  buildWorkflowUpgradeMessage,
  isWorkflowStageAllowed,
  resolveRequiredWorkflowStage
} from "@/lib/account/plan-access";
import { deriveWorkspaceLanes } from "@/lib/workspace/lanes";
import { parseWorkspaceProjectDescription } from "@/lib/workspace/project-metadata";
import { buildWorkspaceProjectIntelligence } from "@/lib/intelligence/project-brief-generator";
import {
  getFirstProjectLane,
  buildProjectModel,
  getProjectLaneBySlug,
  resolveProjectLaneSlug,
  type CustomProjectLaneInput,
  type ProjectRecord
} from "@/lib/workspace/project-lanes";
import {
  getAccessibleWorkspace,
  recordPlatformEvent
} from "@/lib/platform/foundation";
import { buildProjectWorkspaceRoute } from "@/lib/portal/routes";

type WorkspaceProjectContextOptions = {
  requestedPrimaryLaneId?: string | null;
  requestedSupportingLaneIds?: string | null;
};

export async function getWorkspaceForCurrentUser(workspaceId: string) {
  const { supabase, user, access } = await requireUser();

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

function getProjectNotFoundRoute(workspaceId: string, projectId: string) {
  if (projectId !== workspaceId) {
    return buildCanonicalWorkspaceErrorRoute(
      workspaceId,
      "This legacy project route has been retired. Continue in the active project portal."
    );
  }

  return buildCanonicalWorkspaceErrorRoute(workspaceId, "Project not found.");
}

function getLaneNotFoundRoute(workspaceId: string) {
  return buildCanonicalWorkspaceErrorRoute(workspaceId, "Lane not found.");
}

export async function getWorkspaceProjectContext(
  workspaceId: string,
  projectId: string,
  options?: WorkspaceProjectContextOptions
) {
  const { supabase, user, access, workspace } = await getWorkspaceForCurrentUser(workspaceId);

  if (projectId !== workspace.id) {
    redirect(getProjectNotFoundRoute(workspaceId, projectId));
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
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: cleanWorkspace.id,
    projectId,
    projectTitle: cleanWorkspace.name,
    projectDescription: cleanWorkspace.description,
    projectMetadata: parsedWorkspace.metadata
  });

  return {
    supabase,
    user,
    access,
    workspace: cleanWorkspace,
    project,
    projectMetadata: parsedWorkspace.metadata,
    projectIntelligence
  };
}

export async function getWorkspaceProjectLaneContext(
  workspaceId: string,
  projectId: string,
  laneSlug: string,
  options?: WorkspaceProjectContextOptions
) {
  const { supabase, user, access, workspace, project } = await getWorkspaceProjectContext(
    workspaceId,
    projectId,
    options
  );
  const resolvedLaneSlug = resolveProjectLaneSlug(project, laneSlug);

  if (!resolvedLaneSlug) {
    redirect(getLaneNotFoundRoute(workspaceId));
  }

  const lane = getProjectLaneBySlug(project, resolvedLaneSlug);

  if (!lane) {
    redirect(getLaneNotFoundRoute(workspaceId));
  }

  const requiredStage = resolveRequiredWorkflowStage({
    laneTitle: lane.title,
    laneSlug: lane.slug
  });

  if (!isWorkflowStageAllowed(access, requiredStage)) {
    await recordPlatformEvent({
      supabase,
      userId: user.id,
      workspaceId,
      eventType: "workflow_stage_gated",
      severity: "warning",
      details: {
        requiredStage,
        laneSlug: lane.slug,
        laneTitle: lane.title,
        maxWorkflowStage: access.maxWorkflowStage
      }
    }).catch(() => {
      // Optional platform event.
    });

    redirect(
      buildCanonicalWorkspaceErrorRoute(
        workspaceId,
        buildWorkflowUpgradeMessage(access, requiredStage)
      )
    );
  }

  return {
    user,
    access,
    workspace,
    project,
    lane
  };
}

export async function getWorkspaceEngineContext(workspaceId: string, engineSlug: string) {
  const { user, workspace, project, lane } = await getWorkspaceProjectLaneContext(
    workspaceId,
    workspaceId,
    engineSlug
  );

  return {
    user,
    workspace,
    project,
    laneId: lane.slug,
    lane
  };
}

export function getProjectFeaturedLane(project: ProjectRecord) {
  return getFirstProjectLane(project);
}
