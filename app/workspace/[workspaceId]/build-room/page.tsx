import { DashboardBoardShell } from "@/components/layout/page-shells";
import { BuildRoomRestrictedState } from "@/components/portal/project-room-placeholders";
import { buildProjectRoomRoute, buildProjectWorkspaceRoute } from "@/lib/portal/routes";
import { getWorkspaceForCurrentUser } from "@/lib/workspace/server";

type BuildRoomPageProps = {
  params: {
    workspaceId: string;
  };
};

export default async function BuildRoomPage({ params }: BuildRoomPageProps) {
  const { user } = await getWorkspaceForCurrentUser(params.workspaceId, {
    nextPath: buildProjectRoomRoute(params.workspaceId, "build-room")
  });
  const workspaceHref = buildProjectWorkspaceRoute(params.workspaceId);
  const commandCenterHref = buildProjectRoomRoute(params.workspaceId, "command-center");

  return (
    <DashboardBoardShell
      userEmail={user.email ?? undefined}
      ctaHref={workspaceHref}
      ctaLabel="Project Workspace"
    >
      <BuildRoomRestrictedState
        navigation={[
          {
            label: "Projects",
            href: "/projects"
          },
          {
            label: "Project Workspace",
            href: workspaceHref
          },
          {
            label: "Command Center",
            href: commandCenterHref
          },
          {
            label: "Build Room",
            href: buildProjectRoomRoute(params.workspaceId, "build-room"),
            active: true
          }
        ]}
        commandCenterHref={commandCenterHref}
        workspaceHref={workspaceHref}
      />
    </DashboardBoardShell>
  );
}
