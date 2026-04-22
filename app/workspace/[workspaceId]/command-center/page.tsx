import { DashboardBoardShell } from "@/components/layout/page-shells";
import { ProjectRoomPlaceholder } from "@/components/portal/project-room-placeholders";
import { buildPortalProjectSummary } from "@/lib/portal/server";
import {
  buildProjectRoomRoute,
  buildProjectWorkspaceRoute
} from "@/lib/portal/routes";
import { getWorkspaceForCurrentUser } from "@/lib/workspace/server";

type CommandCenterPageProps = {
  params: {
    workspaceId: string;
  };
};

export default async function CommandCenterPage({ params }: CommandCenterPageProps) {
  const { user, workspace } = await getWorkspaceForCurrentUser(params.workspaceId, {
    nextPath: buildProjectRoomRoute(params.workspaceId, "command-center")
  });
  const project = buildPortalProjectSummary(workspace);
  const workspaceHref = buildProjectWorkspaceRoute(params.workspaceId);
  const strategyRoomHref = buildProjectRoomRoute(params.workspaceId, "strategy-room");
  const buildRoomHref = buildProjectRoomRoute(params.workspaceId, "build-room");

  return (
    <DashboardBoardShell
      userEmail={user.email ?? undefined}
      ctaHref={workspaceHref}
      ctaLabel="Project Workspace"
    >
      <ProjectRoomPlaceholder
        eyebrow="Command Center"
        title={`Continue ${project.title} from the command layer.`}
        description="Command Center is now a stable project route again, so signed-in continuation can land here without a 404. It stays connected to the same project workspace and strategy thread."
        navigation={[
          {
            label: "Projects",
            href: "/projects"
          },
          {
            label: "Strategy Room",
            href: strategyRoomHref
          },
          {
            label: "Project Workspace",
            href: workspaceHref
          },
          {
            label: "Command Center",
            href: buildProjectRoomRoute(params.workspaceId, "command-center"),
            active: true
          },
          {
            label: "Build Room",
            href: buildRoomHref
          }
        ]}
        primaryAction={{
          label: "Open Project Workspace",
          href: workspaceHref
        }}
        secondaryAction={{
          label: "Review Build Room",
          href: buildRoomHref
        }}
        modules={[
          {
            label: "Execution view",
            title: "Stay in the same project context",
            body:
              "The command layer is now addressable again from the signed-in customer flow instead of failing on a missing route."
          },
          {
            label: "Room handoff",
            title: "Move between rooms cleanly",
            body:
              "You can move back to Strategy Room to refine what should be built or return to Project Workspace to review the currently active work areas."
          },
          {
            label: "Current scope",
            title: "Portal continuation restored first",
            body:
              "This pass restores the customer-facing continuation path and stable command route. Deeper operator/runtime systems remain separate from this narrow fix."
          }
        ]}
      />
    </DashboardBoardShell>
  );
}
