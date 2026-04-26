import type { BuildRoomRelayMode } from "@/lib/build-room/contracts";
import type { BuildRoomTask, BuildRoomTaskDetail } from "@/lib/build-room/types";
import type {
  PlatformContext,
  PlatformExecutionGateSignalInput
} from "@/lib/intelligence/platform-context";
import {
  buildArchitectureBlueprintSummary,
  type ArchitectureBlueprint
} from "@/lib/intelligence/architecture";
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
  architectureBlueprint: ArchitectureBlueprint;
  platformContext: PlatformContext;
  liveViewSession: LiveViewSession | null;
  canManageDecisions: boolean;
  accessMode: "owner" | "member";
  initialBuildRoomTasks: BuildRoomTask[];
  initialBuildRoomTaskDetail: BuildRoomTaskDetail | null;
  buildRoomCodexRelayMode: BuildRoomRelayMode;
  buildRoomWorkerTriggerMode: BuildRoomRelayMode;
  buildRoomStorageMessage?: string | null;
};

function ArchitectureReferencePanel({
  architectureBlueprint
}: {
  architectureBlueprint: ArchitectureBlueprint;
}) {
  const architectureSummary = buildArchitectureBlueprintSummary(architectureBlueprint);

  return (
    <section className="floating-plane rounded-[28px] border border-slate-200/70 bg-white/80 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Architecture blueprint
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            {architectureSummary.headline}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {architectureBlueprint.domainPack.replace(/_/g, " ")} / readiness{" "}
            {architectureBlueprint.readinessScore}
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {architectureBlueprint.lanes.length} lanes / {architectureBlueprint.worktrees.length} worktrees
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Modules
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {architectureSummary.moduleNames.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Lanes
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {architectureSummary.laneSummary}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Planned worktrees
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {architectureSummary.worktreeBranches.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Open architecture questions
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {architectureSummary.openQuestionLabels.length > 0 ? (
              architectureSummary.openQuestionLabels.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>Architecture questions are currently covered.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ProjectCommandCenterV1({
  project,
  commandCenter,
  architectureBlueprint,
  platformContext,
  liveViewSession,
  canManageDecisions,
  accessMode,
  initialBuildRoomTasks,
  initialBuildRoomTaskDetail,
  buildRoomCodexRelayMode,
  buildRoomWorkerTriggerMode,
  buildRoomStorageMessage = null
}: ProjectCommandCenterV1Props) {
  const roadmapGateSignals: PlatformExecutionGateSignalInput = {
    roomStateDataState: commandCenter.roomState.dataState,
    blockingOpenCount: commandCenter.decisionInbox.blockingOpenCount,
    activePhaseLabel: commandCenter.activePhase.label
  };

  return (
    <section className="surface-main relative overflow-visible rounded-[42px] p-5 xl:p-6 2xl:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[42px]">
        <div className="floating-wash rounded-[42px]" />
      </div>

      <div className="relative space-y-4">
        <section className="space-y-3">
          <ArchitectureReferencePanel architectureBlueprint={architectureBlueprint} />
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
            platformContext={platformContext}
            roadmapGateSignals={roadmapGateSignals}
            initialTasks={initialBuildRoomTasks}
            initialTaskDetail={initialBuildRoomTaskDetail}
            codexRelayMode={buildRoomCodexRelayMode}
            workerTriggerMode={buildRoomWorkerTriggerMode}
            storageMessage={buildRoomStorageMessage}
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
