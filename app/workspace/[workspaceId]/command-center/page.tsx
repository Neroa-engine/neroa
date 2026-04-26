import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ActiveProjectPortalShell } from "@/components/portal/portal-shells";
import { ProjectCommandCenterV1 } from "@/components/workspace/project-command-center-v1";
import { getBuildRoomCodexRelayMode } from "@/lib/build-room/codex-relay";
import {
  BuildRoomStorageUnavailableError,
  getBuildRoomTaskDetail,
  listBuildRoomTasks
} from "@/lib/build-room/data";
import type { BuildRoomTask, BuildRoomTaskDetail } from "@/lib/build-room/types";
import { getBuildRoomWorkerTriggerMode } from "@/lib/build-room/worker-trigger";
import { listLiveViewSessionsForProject, mapLiveViewSessionToRuntimeTarget } from "@/lib/live-view/store";
import { isLocalRuntimeStorageEnabled } from "@/lib/runtime/local-runtime-storage";
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
  const browserRuntimeSupported = isLocalRuntimeStorageEnabled();

  const { supabase, user, workspace, project, projectMetadata, projectIntelligence } =
    await getWorkspaceProjectContext(
    params.workspaceId,
    params.workspaceId
  );
  let initialBuildRoomTasks: BuildRoomTask[] = [];
  let initialBuildRoomTaskDetail: BuildRoomTaskDetail | null = null;
  let buildRoomStorageMessage: string | null = null;
  const buildRoomCodexRelayMode = getBuildRoomCodexRelayMode();
  const buildRoomWorkerTriggerMode = getBuildRoomWorkerTriggerMode();
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
    projectBrief: projectIntelligence.projectBrief,
    roadmapPlan: projectIntelligence.roadmapPlan,
    governancePolicy: projectIntelligence.governancePolicy,
    liveViewSession: runtimeTargetSession,
    browserRuntimeSupported
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

  try {
    initialBuildRoomTasks = await listBuildRoomTasks({
      supabase,
      workspaceId: params.workspaceId,
      projectId: params.workspaceId
    });
    initialBuildRoomTaskDetail =
      initialBuildRoomTasks.length > 0
        ? await getBuildRoomTaskDetail({
            supabase,
            taskId: initialBuildRoomTasks[0].id
          })
        : null;
  } catch (error) {
    if (error instanceof BuildRoomStorageUnavailableError) {
      buildRoomStorageMessage = error.message;
    } else {
      throw error;
    }
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
        projectBrief={projectIntelligence.projectBrief}
        architectureBlueprint={projectIntelligence.architectureBlueprint}
        roadmapPlan={projectIntelligence.roadmapPlan}
        governancePolicy={projectIntelligence.governancePolicy}
        executionState={projectIntelligence.executionState}
        billingState={projectIntelligence.billingState}
        platformContext={projectIntelligence.platformContext}
        liveViewSession={runtimeTargetSession}
        canManageDecisions={activeProjectSummary.accessMode === "owner"}
        accessMode={activeProjectSummary.accessMode}
        initialBuildRoomTasks={initialBuildRoomTasks}
        initialBuildRoomTaskDetail={initialBuildRoomTaskDetail}
        buildRoomCodexRelayMode={buildRoomCodexRelayMode}
        buildRoomWorkerTriggerMode={buildRoomWorkerTriggerMode}
        buildRoomStorageMessage={buildRoomStorageMessage}
      />
    </ActiveProjectPortalShell>
  );
}
