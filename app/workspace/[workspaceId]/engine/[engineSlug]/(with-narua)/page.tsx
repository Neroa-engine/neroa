import EngineOverview from "@/components/workspace/engine-overview";
import { getWorkspaceEngineContext } from "@/lib/workspace/server";

type EnginePageProps = {
  params: {
    workspaceId: string;
    engineSlug: string;
  };
};

export default async function EnginePage({ params }: EnginePageProps) {
  const { project, lane } = await getWorkspaceEngineContext(params.workspaceId, params.engineSlug);

  return (
    <EngineOverview
      workspaceId={params.workspaceId}
      project={project}
      lane={lane}
    />
  );
}
