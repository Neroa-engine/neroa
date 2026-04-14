import BudgetLaneWorkspace from "@/components/workspace/budget-lane-workspace";
import GenericLaneWorkspace from "@/components/workspace/generic-lane-workspace";
import StrategyLaneWorkspace from "@/components/workspace/strategy-lane-workspace";
import { type ProjectLaneRecord, type ProjectRecord } from "@/lib/workspace/project-lanes";
import { isBudgetLane } from "@/lib/workspace/budget-lane";
import { isStrategyLane } from "@/lib/workspace/strategy-lane";

type EngineOverviewProps = {
  workspaceId: string;
  project: ProjectRecord;
  lane: ProjectLaneRecord;
};

export default function EngineOverview({
  workspaceId,
  project,
  lane
}: EngineOverviewProps) {
  if (isStrategyLane(lane)) {
    return <StrategyLaneWorkspace workspaceId={workspaceId} project={project} lane={lane} />;
  }

  if (isBudgetLane(lane)) {
    return <BudgetLaneWorkspace workspaceId={workspaceId} project={project} lane={lane} />;
  }

  return <GenericLaneWorkspace workspaceId={workspaceId} lane={lane} projectId={project.id} />;
}
