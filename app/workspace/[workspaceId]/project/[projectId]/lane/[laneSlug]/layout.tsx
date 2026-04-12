import type { ReactNode } from "react";
import EngineShell from "@/components/workspace/engine-shell";
import { getWorkspaceProjectLaneContext } from "@/lib/workspace/server";

type LaneLayoutProps = {
  children: ReactNode;
  params: {
    workspaceId: string;
    projectId: string;
    laneSlug: string;
  };
};

export default async function ProjectLaneLayout({ children, params }: LaneLayoutProps) {
  const { workspace, project, lane } = await getWorkspaceProjectLaneContext(
    params.workspaceId,
    params.projectId,
    params.laneSlug
  );

  return (
    <EngineShell workspace={workspace} project={project} lane={lane} naruaEnabled>
      {children}
    </EngineShell>
  );
}
