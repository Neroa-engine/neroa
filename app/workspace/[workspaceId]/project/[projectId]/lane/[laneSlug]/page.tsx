import EngineOverview from "@/components/workspace/engine-overview";
import { getWorkspaceProjectLaneContext } from "@/lib/workspace/server";

type LanePageProps = {
  params: {
    workspaceId: string;
    projectId: string;
    laneSlug: string;
  };
};

export default async function ProjectLanePage({ params }: LanePageProps) {
  const { project, lane } = await getWorkspaceProjectLaneContext(
    params.workspaceId,
    params.projectId,
    params.laneSlug
  );

  return (
    <EngineOverview
      workspaceId={params.workspaceId}
      projectId={params.projectId}
      lane={lane}
      siblingLanes={project.lanes}
    />
  );
}
