import type { CommandCenterSummary } from "@/lib/workspace/command-center-summary";
import type { LiveViewSession } from "@/lib/live-view/types";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
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
};

export function ProjectCommandCenterV1({
  project,
  commandCenter,
  liveViewSession,
  canManageDecisions
}: ProjectCommandCenterV1Props) {
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
