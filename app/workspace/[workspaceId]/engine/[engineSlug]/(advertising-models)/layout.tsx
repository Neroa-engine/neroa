import type { ReactNode } from "react";
import { LaneWorkspaceShell } from "@/components/layout/page-shells";
import EngineShell from "@/components/workspace/engine-shell";
import { getWorkspaceEngineContext } from "@/lib/workspace/server";

type AdvertisingLayoutProps = {
  children: ReactNode;
  params: {
    workspaceId: string;
    engineSlug: string;
  };
};

export default async function AdvertisingModelLayout({
  children,
  params
}: AdvertisingLayoutProps) {
  const { user, workspace, project, lane } = await getWorkspaceEngineContext(
    params.workspaceId,
    params.engineSlug
  );

  return (
    <LaneWorkspaceShell
      userEmail={user.email ?? undefined}
      ctaHref={`/workspace/${workspace.id}/project/${project.id}`}
      ctaLabel="Engine"
    >
        <EngineShell workspace={workspace} project={project} lane={lane} naruaEnabled={false}>
          {children}
        </EngineShell>
    </LaneWorkspaceShell>
  );
}
