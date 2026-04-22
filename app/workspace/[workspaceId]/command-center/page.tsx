import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ActiveProjectPortalShell } from "@/components/portal/portal-shells";
import { ProjectCommandCenterV1 } from "@/components/workspace/project-command-center-v1";
import { listLiveViewSessionsForProject, mapLiveViewSessionToRuntimeTarget } from "@/lib/live-view/store";
import { APP_ROUTES } from "@/lib/routes";
import { resolveBrowserRuntimeRequestOrigin } from "@/lib/browser-runtime-v2/runtime-target";
import {
  buildPortalProjectSummary,
  loadPortalProjectSummariesForUser
} from "@/lib/portal/server";
import { buildCommandCenterSummary } from "@/lib/workspace/command-center-summary";
import { getWorkspaceProjectContext } from "@/lib/workspace/server";

type CommandCenterPageProps = {
  params: {
    workspaceId: string;
  };
};

export default async function CommandCenterPage({ params }: CommandCenterPageProps) {
  noStore();
  const requestOrigin = resolveBrowserRuntimeRequestOrigin(headers());

  const { supabase, user, workspace, project, projectMetadata } = await getWorkspaceProjectContext(
    params.workspaceId,
    params.workspaceId,
    {
      nextPath: `/workspace/${params.workspaceId}/command-center`
    }
  );
  const liveViewSession =
    (
      await listLiveViewSessionsForProject({
        workspaceId: workspace.id,
        projectId: project.id,
        preferredOrigin: requestOrigin
      })
    )[0] ?? null;
  const runtimeTargetSession = liveViewSession
    ? mapLiveViewSessionToRuntimeTarget(liveViewSession, requestOrigin)
    : null;
  const commandCenter = buildCommandCenterSummary({
    project,
    projectMetadata,
    liveViewSession: runtimeTargetSession
  });
  const portalProjects = await loadPortalProjectSummariesForUser({
    supabase,
    userId: user.id
  });
  const activeProjectSummary =
    portalProjects.find((item) => item.workspaceId === params.workspaceId) ??
    buildPortalProjectSummary(workspace);

  if (activeProjectSummary.customerFacingState !== "current") {
    redirect(APP_ROUTES.projects);
  }

  const activeProject = {
    ...activeProjectSummary,
    phaseLabel: commandCenter.activePhase.label,
    statusLabel: commandCenter.executionReadiness.label
  };

  return (
    <ActiveProjectPortalShell
      currentRoom="command-center"
      userEmail={user.email ?? undefined}
      activeProject={activeProject}
      availableProjects={portalProjects}
    >
      <ProjectCommandCenterV1
        project={project}
        commandCenter={commandCenter}
        liveViewSession={runtimeTargetSession}
        canManageDecisions={activeProjectSummary.accessMode === "owner"}
      />
    </ActiveProjectPortalShell>
  );
}
