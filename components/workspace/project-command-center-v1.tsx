import type { BuildRoomRelayMode } from "@/lib/build-room/contracts";
import type { BuildRoomTask, BuildRoomTaskDetail } from "@/lib/build-room/types";
import type {
  PlatformContext,
  PlatformExecutionGateSignalInput
} from "@/lib/intelligence/platform-context";
import type { ProjectBrief } from "@/lib/intelligence/project-brief";
import {
  buildArchitectureBlueprintSummary,
  type ArchitectureBlueprint
} from "@/lib/intelligence/architecture";
import {
  buildGovernancePolicySummary,
  type GovernancePolicy
} from "@/lib/intelligence/governance";
import type { BillingProtectionState } from "@/lib/intelligence/billing";
import {
  buildRoadmapPlanSummary,
  type RoadmapPlan
} from "@/lib/intelligence/roadmap";
import type { ExecutionState } from "@/lib/intelligence/execution";
import type { CommandCenterSummary } from "@/lib/workspace/command-center-summary";
import type { LiveViewSession } from "@/lib/live-view/types";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import { CommandCenterBuildRoomExecutionPanel } from "@/components/workspace/command-center-build-room-execution-panel";
import {
  CommandCenterAnalyzerPanelView,
  CommandCenterPromptRunnerPanelView,
  CommandCenterTaskQueuePanelView
} from "@/components/workspace/command-center-operator-panels";
import {
  CommandCenterCompactSignal,
  CommandCenterPanel,
  CommandCenterSourceBadge
} from "@/components/workspace/command-center-ui";

type ProjectCommandCenterV1Props = {
  project: ProjectRecord;
  commandCenter: CommandCenterSummary;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
  executionState: ExecutionState | null;
  billingState: BillingProtectionState | null;
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

function GovernanceReferencePanel({
  governancePolicy
}: {
  governancePolicy: GovernancePolicy;
}) {
  const governanceSummary = buildGovernancePolicySummary(governancePolicy);
  const deltaRoutes = [
    `Within scope: ${governancePolicy.deltaAnalyzerPolicy.sameScopeOutcome.replace(/_/g, " ")}`,
    `Pre-approval: ${governancePolicy.deltaAnalyzerPolicy.preApprovalOutcome.replace(/_/g, " ")}`,
    `Scope expansion: ${governancePolicy.deltaAnalyzerPolicy.scopeExpansionOutcome.replace(/_/g, " ")}`,
    `Architecture expansion: ${governancePolicy.deltaAnalyzerPolicy.architectureExpansionOutcome.replace(
      /_/g,
      " "
    )}`
  ];

  return (
    <section className="floating-plane rounded-[28px] border border-slate-200/70 bg-white/80 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Governance reference
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            {governanceSummary.headline}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {governanceSummary.readinessLabel}
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {governancePolicy.approvalChecklist.length} checklist items /{" "}
          {governancePolicy.approvalReadiness.blockers.length} blockers
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Approval state
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {governanceSummary.approvalStateLabel}
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-500">
            {governanceSummary.revisionLabel}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Blocking now
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {governanceSummary.blockerLabels.length > 0 ? (
              governanceSummary.blockerLabels.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>No governance blockers are open right now.</li>
            )}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Hard guards
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {governanceSummary.guardrailLabels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Delta routing
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {deltaRoutes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function RoadmapReferencePanel({
  roadmapPlan
}: {
  roadmapPlan: RoadmapPlan;
}) {
  const roadmapSummary = buildRoadmapPlanSummary(roadmapPlan);

  return (
    <section className="floating-plane rounded-[28px] border border-slate-200/70 bg-white/80 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Roadmap reference
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            {roadmapSummary.headline}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {roadmapSummary.statusLabel}
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {roadmapPlan.phases.length} phases / {roadmapPlan.criticalPath.length} critical steps
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            MVP definition
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{roadmapSummary.mvpSummary}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Phase order
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {roadmapSummary.phaseNames.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Critical path
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {roadmapSummary.criticalPathLabels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Open roadmap questions
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {roadmapSummary.openQuestionLabels.length > 0 ? (
              roadmapSummary.openQuestionLabels.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>Roadmap questions are currently covered.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

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

function CommandCenterSupportSummary({
  eyebrow,
  title,
  detail,
  actionLabel,
  source,
  badges
}: {
  eyebrow: string;
  title: string;
  detail: string;
  actionLabel: string;
  source?: Parameters<typeof CommandCenterSourceBadge>[0]["source"];
  badges: string[];
}) {
  return (
    <CommandCenterPanel className="rounded-[28px] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-base font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {source ? <CommandCenterSourceBadge source={source} /> : null}
          <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {actionLabel}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600"
          >
            {badge}
          </span>
        ))}
      </div>
    </CommandCenterPanel>
  );
}

export function ProjectCommandCenterV1({
  project,
  commandCenter,
  projectBrief,
  architectureBlueprint,
  roadmapPlan,
  governancePolicy,
  executionState,
  billingState,
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
  const governanceSummary = buildGovernancePolicySummary(governancePolicy);
  const roadmapSummary = buildRoadmapPlanSummary(roadmapPlan);
  const architectureSummary = buildArchitectureBlueprintSummary(architectureBlueprint);
  const blockingCount = commandCenter.decisionInbox.blockingOpenCount;
  const openDecisionCount = commandCenter.decisionInbox.openCount;
  const nextTaskCount = commandCenter.taskQueue.nextTasks.length;
  const queuedPromptCount = commandCenter.promptRunner.queue.length;
  const leadingTaskTitle =
    commandCenter.taskQueue.currentTask?.title ?? "No task is leading the room yet";
  const upcomingPromptLabel =
    commandCenter.promptRunner.upcomingRunId ??
    commandCenter.promptRunner.runId ??
    "No follow-up prompt is staged yet";

  return (
    <section className="surface-main relative overflow-visible rounded-[42px] p-5 xl:p-6 2xl:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[42px]">
        <div className="floating-wash rounded-[42px]" />
      </div>

      <div className="relative space-y-4">
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
          <CommandCenterCompactSignal
            label="Current status"
            value={commandCenter.executionReadiness.label}
            detail={commandCenter.executionReadiness.detail}
            tone={blockingCount > 0 ? "warning" : "accent"}
          />
          <CommandCenterCompactSignal
            label="Blocking now"
            value={
              blockingCount > 0
                ? `${blockingCount} blocker${blockingCount === 1 ? "" : "s"}`
                : "No blockers"
            }
            detail={
              blockingCount > 0
                ? `${openDecisionCount} open decision${
                    openDecisionCount === 1 ? "" : "s"
                  } still need attention before the full execution path can clear.`
                : "No blocking decisions are holding the primary operator flow right now."
            }
            tone={blockingCount > 0 ? "warning" : "neutral"}
          />
          <CommandCenterCompactSignal
            label="Active phase"
            value={commandCenter.activePhase.label}
            detail={`Current roadmap area: ${
              commandCenter.taskQueue.currentRoadmapArea ?? commandCenter.activePhase.label
            }.`}
            tone="neutral"
          />
          <CommandCenterCompactSignal
            label="What to do now"
            value={commandCenter.analyzer.statusLabel}
            detail={commandCenter.analyzer.recommendation}
            tone="accent"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] xl:items-start">
          <div>
            <CommandCenterBuildRoomExecutionPanel
              workspaceId={project.workspaceId}
              project={project}
              accessMode={accessMode}
              platformContext={platformContext}
              roadmapGateSignals={roadmapGateSignals}
              projectBrief={projectBrief}
              architectureBlueprint={architectureBlueprint}
              roadmapPlan={roadmapPlan}
              governancePolicy={governancePolicy}
              initialTasks={initialBuildRoomTasks}
              initialTaskDetail={initialBuildRoomTaskDetail}
              initialExecutionState={executionState}
              initialBillingState={billingState}
              codexRelayMode={buildRoomCodexRelayMode}
              workerTriggerMode={buildRoomWorkerTriggerMode}
              storageMessage={buildRoomStorageMessage}
              roadmapAreaLabel={
                commandCenter.taskQueue.currentRoadmapArea ?? commandCenter.activePhase.label
              }
            />
          </div>

          <aside className="space-y-3">
            <details>
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <CommandCenterSupportSummary
                  eyebrow="Operator support"
                  title={commandCenter.analyzer.currentAnalysis}
                  detail={commandCenter.analyzer.recommendation}
                  actionLabel="Open support controls"
                  source={commandCenter.analyzer.source}
                  badges={[
                    commandCenter.analyzer.statusLabel,
                    `${commandCenter.decisionInbox.blockingOpenCount} blocking decisions`,
                    `Phase ${commandCenter.activePhase.label}`
                  ]}
                />
              </summary>

              <div className="mt-3">
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
              </div>
            </details>

            <details>
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <CommandCenterSupportSummary
                  eyebrow="Execution watch"
                  title={leadingTaskTitle}
                  detail={`Queued next: ${nextTaskCount} task${
                    nextTaskCount === 1 ? "" : "s"
                  }. Next prompt: ${upcomingPromptLabel}.`}
                  actionLabel="Open queue detail"
                  source={commandCenter.taskQueue.source}
                  badges={[
                    `${nextTaskCount} next tasks`,
                    `${queuedPromptCount} queued prompts`,
                    commandCenter.promptRunner.statusLabel
                  ]}
                />
              </summary>

              <div className="mt-3 space-y-3">
                <CommandCenterTaskQueuePanelView
                  workspaceId={project.workspaceId}
                  taskQueue={commandCenter.taskQueue}
                  canManage={canManageDecisions}
                />
                <CommandCenterPromptRunnerPanelView promptRunner={commandCenter.promptRunner} />
              </div>
            </details>
          </aside>
        </div>

        <details>
          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <CommandCenterSupportSummary
              eyebrow="Project intelligence"
              title="Governance, roadmap, and architecture stay available as compact reference"
              detail={`${governanceSummary.approvalStateLabel}. ${roadmapSummary.statusLabel}. Architecture readiness ${architectureBlueprint.readinessScore}.`}
              actionLabel="Expand intelligence"
              badges={[
                `${governancePolicy.approvalReadiness.blockers.length} governance blockers`,
                `${roadmapPlan.phases.length} roadmap phases`,
                `${architectureBlueprint.lanes.length} architecture lanes`,
                `${architectureSummary.openQuestionLabels.length} open architecture questions`
              ]}
            />
          </summary>

          <div className="mt-3 grid gap-3 2xl:grid-cols-3">
            <GovernanceReferencePanel governancePolicy={governancePolicy} />
            <RoadmapReferencePanel roadmapPlan={roadmapPlan} />
            <ArchitectureReferencePanel architectureBlueprint={architectureBlueprint} />
          </div>
        </details>
      </div>
    </section>
  );
}
