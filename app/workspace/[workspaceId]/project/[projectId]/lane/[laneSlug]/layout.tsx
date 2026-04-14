import type { ReactNode } from "react";
import { LaneWorkspaceShell } from "@/components/layout/page-shells";
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
  const { user, workspace, project, lane } = await getWorkspaceProjectLaneContext(
    params.workspaceId,
    params.projectId,
    params.laneSlug
  );

  return (
    <LaneWorkspaceShell
      userEmail={user.email ?? undefined}
      ctaHref={`/workspace/${workspace.id}/project/${project.id}`}
      ctaLabel="Engine"
    >
        <EngineShell workspace={workspace} project={project} lane={lane} naruaEnabled>
          {children}
        </EngineShell>
    </LaneWorkspaceShell>
  );
}
