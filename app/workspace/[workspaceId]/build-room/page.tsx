import { ActiveProjectPortalShell } from "@/components/portal/portal-shells";
import { BuildRoomRestrictedState } from "@/components/portal/project-room-placeholders";
import {
  buildPortalProjectSummary,
  loadPortalProjectSummariesForUser
} from "@/lib/portal/server";
import {
  buildProjectRoomRoute,
  buildProjectWorkspaceRoute
} from "@/lib/portal/routes";
import { getWorkspaceProjectContext } from "@/lib/workspace/server";

type BuildRoomPageProps = {
  params: {
    workspaceId: string;
  };
};

export default async function BuildRoomPage({ params }: BuildRoomPageProps) {
  const { supabase, user, workspace } = await getWorkspaceProjectContext(
    params.workspaceId,
    params.workspaceId,
    {
      nextPath: `/workspace/${params.workspaceId}/build-room`
    }
  );
  const portalProjects = await loadPortalProjectSummariesForUser({
    supabase,
    userId: user.id
  });
  const activeProject =
    portalProjects.find((item) => item.workspaceId === params.workspaceId) ??
    buildPortalProjectSummary(workspace);

  return (
    <ActiveProjectPortalShell
      currentRoom="build-room"
      userEmail={user.email ?? undefined}
      activeProject={activeProject}
      availableProjects={portalProjects}
    >
      <BuildRoomRestrictedState
        commandCenterHref={buildProjectRoomRoute(params.workspaceId, "command-center")}
        workspaceHref={buildProjectWorkspaceRoute(params.workspaceId)}
      />
    </ActiveProjectPortalShell>
  );
}
