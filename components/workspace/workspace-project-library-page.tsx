import { ActiveProjectPortalShell } from "@/components/portal/portal-shells";
import { ProjectLibraryPage } from "@/components/workspace/project-library-page";
import { listBrowserRuntimeV2Outputs } from "@/lib/browser-runtime-v2/output-store";
import {
  buildPortalProjectSummary,
  loadPortalProjectSummariesForUser
} from "@/lib/portal/server";
import { getProjectQcLibrarySnapshot } from "@/lib/workspace/project-qc-library";
import { getWorkspaceProjectContext } from "@/lib/workspace/server";

type WorkspaceProjectLibraryPageProps = {
  workspaceId: string;
  projectId: string;
};

export async function WorkspaceProjectLibraryPage({
  workspaceId,
  projectId
}: WorkspaceProjectLibraryPageProps) {
  const { supabase, user, workspace, project, projectMetadata } = await getWorkspaceProjectContext(
    workspaceId,
    projectId
  );
  const portalProjects = await loadPortalProjectSummariesForUser({
    supabase,
    userId: user.id
  });
  const activeProject =
    portalProjects.find((item) => item.workspaceId === workspace.id) ??
    buildPortalProjectSummary(workspace);
  const snapshot = await getProjectQcLibrarySnapshot({
    workspaceId,
    projectId,
    projectMetadata
  });
  const browserRuntimeOutputs = await listBrowserRuntimeV2Outputs({
    workspaceId,
    projectId
  });

  return (
    <ActiveProjectPortalShell
      currentRoom="project-workspace"
      userEmail={user.email ?? undefined}
      activeProject={activeProject}
      availableProjects={portalProjects}
    >
      <ProjectLibraryPage
        project={project}
        projectMetadata={projectMetadata}
        snapshot={snapshot}
        browserRuntimeOutputs={browserRuntimeOutputs}
      />
    </ActiveProjectPortalShell>
  );
}
