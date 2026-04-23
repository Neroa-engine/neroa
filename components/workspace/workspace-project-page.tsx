import { ActiveProjectPortalShell } from "@/components/portal/portal-shells";
import { ProjectWorkspaceV1 } from "@/components/workspace/project-workspace-v1";
import {
  buildPortalProjectSummary,
  loadPortalProjectSummariesForUser
} from "@/lib/portal/server";
import { getWorkspaceProjectContext } from "@/lib/workspace/server";

type WorkspaceProjectPageProps = {
  workspaceId: string;
  searchParams?: {
    error?: string | string[];
    lane?: string | string[];
    supporting?: string | string[];
  };
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeWorkspaceMessage(value: string | null) {
  if (!value) {
    return null;
  }

  return value
    .replace(/\b[Ee]ngine\b/g, (match) => (match === "Engine" ? "Project" : "project"))
    .replace(/command center/gi, "workspace")
    .replace(/execution routing/gi, "project flow");
}

export async function WorkspaceProjectPage({
  workspaceId,
  searchParams
}: WorkspaceProjectPageProps) {
  const { supabase, user, workspace, project, projectMetadata } =
    await getWorkspaceProjectContext(
      workspaceId,
      workspaceId,
      {
        requestedPrimaryLaneId: firstValue(searchParams?.lane),
        requestedSupportingLaneIds: firstValue(searchParams?.supporting),
        nextPath: `/workspace/${workspaceId}`
      }
    );

  const portalProjects = await loadPortalProjectSummariesForUser({
    supabase,
    userId: user.id
  });
  const activeProject =
    portalProjects.find((item) => item.workspaceId === workspace.id) ??
    buildPortalProjectSummary(workspace);

  return (
    <ActiveProjectPortalShell
      currentRoom="project-workspace"
      userEmail={user.email ?? undefined}
      activeProject={activeProject}
      availableProjects={portalProjects}
    >
      {sanitizeWorkspaceMessage(firstValue(searchParams?.error) ?? null) ? (
        <div className="mb-4 rounded-2xl border border-rose-300/50 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
          {sanitizeWorkspaceMessage(firstValue(searchParams?.error) ?? null)}
        </div>
      ) : null}

      <ProjectWorkspaceV1
        project={project}
        projectMetadata={projectMetadata}
      />
    </ActiveProjectPortalShell>
  );
}
