import type { ReactNode } from "react";
import EngineShell from "@/components/workspace/engine-shell";
import { getWorkspaceEngineContext } from "@/lib/workspace/server";

type EngineLayoutProps = {
  children: ReactNode;
  params: {
    workspaceId: string;
    engineSlug: string;
  };
};

export default async function NaruaEnabledEngineLayout({
  children,
  params
}: EngineLayoutProps) {
  const { workspace, project, lane } = await getWorkspaceEngineContext(
    params.workspaceId,
    params.engineSlug
  );

  return (
    <EngineShell workspace={workspace} project={project} lane={lane} naruaEnabled>
      {children}
    </EngineShell>
  );
}
