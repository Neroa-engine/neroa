import type { BuildRoomRelayMode } from "@/lib/build-room/contracts";
import type { BuildRoomTask, BuildRoomTaskDetail } from "@/lib/build-room/types";
import type { CommandCenterSummary } from "@/lib/workspace/command-center-summary";
import type { LiveViewSession } from "@/lib/live-view/types";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import { CommandCenterBuildRoomExecutionPanel } from "@/components/workspace/command-center-build-room-execution-panel";
import {
  CommandCenterAnalyzerPanelView,
  CommandCenterPromptRunnerPanelView,
  CommandCenterTaskQueuePanelView
} from "@/components/workspace/command-center-operator-panels";

type ProjectCommandCenterV1Props = {
  project: ProjectRecord;
  commandCenter: CommandCenterSummary;
  liveViewSession: LiveViewSession | null;
  canManageDecisions: boolean;
  accessMode: "owner" | "member";
  initialBuildRoomTasks: BuildRoomTask[];
  initialBuildRoomTaskDetail: BuildRoomTaskDetail | null;
  buildRoomCodexRelayMode: BuildRoomRelayMode;
  buildRoomWorkerTriggerMode: BuildRoomRelayMode;
  buildRoomStorageMessage?: string | null;
};

export function ProjectCommandCenterV1({
  project,
  commandCenter,
  liveViewSession,
  canManageDecisions,
  accessMode,
  initialBuildRoomTasks,
  initialBuildRoomTaskDetail,
  buildRoomCodexRelayMode,
  buildRoomWorkerTriggerMode,
  buildRoomStorageMessage = null
}: ProjectCommandCenterV1Props) {
  const roadmapApprovalRequired =
    commandCenter.roomState.dataState === "degraded" ||
    commandCenter.decisionInbox.blockingOpenCount > 0 ||
    commandCenter.activePhase.label === "Strategy" ||
    commandCenter.activePhase.label === "Scope Definition";

  return (
    <section className="surface-main relative overflow-visible rounded-[42px] p-5 xl:p-6 2xl:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[42px]">
        <div className="floating-wash rounded-[42px]" />
      </div>

      <div className="relative space-y-4">
        <section className="space-y-3">
          <CommandCenterAnalyzerPanelView
            workspaceId={project.workspaceId}
            analyzer={commandCenter.analyzer}
            changeImpactReview={commandCenter.changeImpactReview}
            roomState={commandCenter.roomState}
            executionReadiness={commandCenter.executionReadiness}
            blockers={commandCenter.blockers}
            decisionInbox={commandCenter.decisionInbox}
            taskQueue={commandCenter.taskQueue}
            browserStatus={commandCenter.browserStatus}
            designPreviewArchitecture={commandCenter.designPreviewArchitecture}
            designLibrary={commandCenter.designLibrary}
            brandSystem={commandCenter.brandSystem}
            projectTitle={project.title}
            projectId={project.id}
            initialLiveViewSession={liveViewSession}
            activePhase={commandCenter.activePhase}
            canManage={canManageDecisions}
          />
          <CommandCenterBuildRoomExecutionPanel
            workspaceId={project.workspaceId}
            project={project}
            accessMode={accessMode}
            initialTasks={initialBuildRoomTasks}
            initialTaskDetail={initialBuildRoomTaskDetail}
            codexRelayMode={buildRoomCodexRelayMode}
            workerTriggerMode={buildRoomWorkerTriggerMode}
            storageMessage={buildRoomStorageMessage}
            roadmapApprovalRequired={roadmapApprovalRequired}
            roadmapAreaLabel={
              commandCenter.taskQueue.currentRoadmapArea ?? commandCenter.activePhase.label
            }
          />
          <div className="grid gap-3 md:grid-cols-2 md:items-stretch">
            <CommandCenterTaskQueuePanelView
              workspaceId={project.workspaceId}
              taskQueue={commandCenter.taskQueue}
              canManage={canManageDecisions}
            />
            <CommandCenterPromptRunnerPanelView promptRunner={commandCenter.promptRunner} />
          </div>
        </section>
      </div>
    </section>
  );
}
