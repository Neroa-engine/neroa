import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { ActiveProjectPortalShell } from "@/components/portal/portal-shells";
import { BuildRoomControlRoom } from "@/components/workspace/build-room-control-room";
import { getBuildRoomCodexRelayMode } from "@/lib/build-room/codex-relay";
import {
  buildPortalProjectSummary,
  loadPortalProjectSummariesForUser
} from "@/lib/portal/server";
import { APP_ROUTES } from "@/lib/routes";
import {
  BuildRoomStorageUnavailableError,
  getBuildRoomTaskDetail,
  listBuildRoomTasks
} from "@/lib/build-room/data";
import type { BuildRoomTask, BuildRoomTaskDetail } from "@/lib/build-room/types";
import { getBuildRoomWorkerTriggerMode } from "@/lib/build-room/worker-trigger";
import { getWorkspaceProjectContext } from "@/lib/workspace/server";

type BuildRoomPageProps = {
  params: {
    workspaceId: string;
  };
};

export default async function BuildRoomPage({ params }: BuildRoomPageProps) {
  noStore();
  const { supabase, user, workspace, project, projectIntelligence } = await getWorkspaceProjectContext(
    params.workspaceId,
    params.workspaceId
  );
  const portalProjects = await loadPortalProjectSummariesForUser({
    supabase,
    userId: user.id
  });
  const activeProject =
    portalProjects.find((item) => item.workspaceId === params.workspaceId) ??
    buildPortalProjectSummary(workspace);
  let initialTasks: BuildRoomTask[] = [];
  let initialTaskDetail: BuildRoomTaskDetail | null = null;
  let storageMessage: string | null = null;
  const codexRelayMode = getBuildRoomCodexRelayMode();
  const workerTriggerMode = getBuildRoomWorkerTriggerMode();

  if (activeProject.customerFacingState !== "current") {
    redirect(APP_ROUTES.projects);
  }

  try {
    initialTasks = await listBuildRoomTasks({
      supabase,
      workspaceId: params.workspaceId,
      projectId: params.workspaceId
    });
    initialTaskDetail =
      initialTasks.length > 0
        ? await getBuildRoomTaskDetail({
            supabase,
            taskId: initialTasks[0].id
          })
        : null;
  } catch (error) {
    if (error instanceof BuildRoomStorageUnavailableError) {
      storageMessage = error.message;
    } else {
      throw error;
    }
  }

  return (
    <ActiveProjectPortalShell
      currentRoom="build-room"
      userEmail={user.email ?? undefined}
      activeProject={activeProject}
      availableProjects={portalProjects}
    >
      <BuildRoomControlRoom
        workspaceId={params.workspaceId}
        project={project}
        accessMode={activeProject.accessMode}
        initialTasks={initialTasks}
        initialTaskDetail={initialTaskDetail}
        executionState={projectIntelligence.executionState}
        codexRelayMode={codexRelayMode}
        workerTriggerMode={workerTriggerMode}
        storageMessage={storageMessage}
      />
    </ActiveProjectPortalShell>
  );
}
