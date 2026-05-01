import type { BuildRoomRelayMode } from "@/lib/build-room/contracts";
import type { BuildRoomTask, BuildRoomTaskDetail } from "@/lib/build-room/types";
import type {
  PlatformContext
} from "@/lib/intelligence/platform-context";
import type { ProjectBrief } from "@/lib/intelligence/project-brief";
import type { ArchitectureBlueprint } from "@/lib/intelligence/architecture";
import type { GovernancePolicy } from "@/lib/intelligence/governance";
import type { BillingProtectionState } from "@/lib/intelligence/billing";
import type { RoadmapPlan } from "@/lib/intelligence/roadmap";
import type { ExecutionState } from "@/lib/intelligence/execution";
import type { CommandCenterSummary } from "@/lib/workspace/command-center-summary";
import type { LiveViewSession } from "@/lib/live-view/types";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import type { StoredCommandCenterTask } from "@/lib/workspace/command-center-tasks";
import { updateCommandCenterTask } from "@/app/workspace/[workspaceId]/command-center/actions";
import {
  CommandCenterSmartOperatorSurface,
  type CommandCenterWorkflowTaskCard
} from "@/components/workspace/command-center-smart-operator-surface";

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
  liveCommandCenterTasks: StoredCommandCenterTask[];
  initialBuildRoomTasks: BuildRoomTask[];
  initialBuildRoomTaskDetail: BuildRoomTaskDetail | null;
  buildRoomCodexRelayMode: BuildRoomRelayMode;
  buildRoomWorkerTriggerMode: BuildRoomRelayMode;
  buildRoomStorageMessage?: string | null;
};

function bucketLabelForTask(task: StoredCommandCenterTask) {
  if (task.status === "active") {
    return "In progress";
  }

  if (task.status === "waiting_on_decision") {
    return "Waiting on answers";
  }

  if (task.status === "in_review") {
    return "In review";
  }

  if (task.status === "completed") {
    return "Recently cleared";
  }

  return "Up next";
}

function sortTasksForCustomerQueue(tasks: StoredCommandCenterTask[]) {
  return [...tasks].sort((left, right) => {
    if (left.status === "completed" && right.status !== "completed") {
      return 1;
    }

    if (left.status !== "completed" && right.status === "completed") {
      return -1;
    }

    const leftStamp = left.updatedAt ?? left.createdAt ?? "";
    const rightStamp = right.updatedAt ?? right.createdAt ?? "";

    if (leftStamp !== rightStamp) {
      return leftStamp < rightStamp ? 1 : -1;
    }

    return left.title.localeCompare(right.title);
  });
}

export function ProjectCommandCenterV1(props: ProjectCommandCenterV1Props) {
  const {
    project,
    commandCenter,
    liveCommandCenterTasks,
    canManageDecisions
  } = props;
  const taskCards: CommandCenterWorkflowTaskCard[] = sortTasksForCustomerQueue(
    liveCommandCenterTasks
  ).map((task) => ({
    id: task.id,
    title: task.title,
    request: task.request,
    status: task.status,
    sourceType: task.sourceType,
    workflowLane: task.workflowLane ?? null,
    requestType: task.intelligenceMetadata?.requestType ?? null,
    reviewOutcome: task.intelligenceMetadata?.roadmapReviewOutcome ?? null,
    normalizedRequest: task.normalizedRequest ?? null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    bucketLabel: bucketLabelForTask(task)
  }));

  return (
    <section className="surface-main relative overflow-visible rounded-[42px] p-5 xl:p-6 2xl:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[42px]">
        <div className="floating-wash rounded-[42px]" />
      </div>

      <div className="relative space-y-4">
        <section className="space-y-3">
          <div className="rounded-[28px] border border-slate-200 bg-white/82 px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Command Center
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
              Send requests, revisions, decisions, and review notes from one place.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Keep customer workflow simple here: choose a category, send the update, and track
              what is open in the queue below.
            </p>
          </div>

          <CommandCenterSmartOperatorSurface
            workspaceId={project.workspaceId}
            returnTo={`/workspace/${project.workspaceId}/command-center`}
            canManage={canManageDecisions}
            createTaskAction={updateCommandCenterTask}
            tasks={taskCards}
            defaultRoadmapArea={
              commandCenter.taskQueue.currentRoadmapArea ??
              commandCenter.taskQueue.availableRoadmapAreas[0] ??
              "General coordination"
            }
            blockedItemCount={commandCenter.blockers.items.length}
            decisionCount={commandCenter.decisionInbox.openCount}
            reviewCount={commandCenter.changeImpactReview.activeCount}
            creditSummary={null}
            availableRoadmapAreas={commandCenter.taskQueue.availableRoadmapAreas}
          />
        </section>
      </div>
    </section>
  );
}
