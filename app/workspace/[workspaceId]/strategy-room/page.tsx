import { DashboardBoardShell } from "@/components/layout/page-shells";
import { ProjectRoomPlaceholder } from "@/components/portal/project-room-placeholders";
import {
  buildPortalProjectSummary
} from "@/lib/portal/server";
import {
  buildProjectRoomRoute,
  buildProjectWorkspaceRoute
} from "@/lib/portal/routes";
import { getWorkspaceForCurrentUser } from "@/lib/workspace/server";

type StrategyRoomPageProps = {
  params: {
    workspaceId: string;
  };
};

export default async function StrategyRoomPage({ params }: StrategyRoomPageProps) {
  const { user, workspace } = await getWorkspaceForCurrentUser(params.workspaceId, {
    nextPath: buildProjectRoomRoute(params.workspaceId, "strategy-room")
  });
  const project = buildPortalProjectSummary(workspace);
  const workspaceHref = buildProjectWorkspaceRoute(params.workspaceId);
  const commandCenterHref = buildProjectRoomRoute(params.workspaceId, "command-center");

  return (
    <DashboardBoardShell
      userEmail={user.email ?? undefined}
      ctaHref={workspaceHref}
      ctaLabel="Project Workspace"
    >
      <ProjectRoomPlaceholder
        eyebrow="Strategy Room"
        title={`Keep shaping ${project.title} from strategy.`}
        description="This room is the project-specific continuation point for product direction, roadmap tightening, and decision clarity before deeper execution work."
        navigation={[
          {
            label: "Projects",
            href: "/projects"
          },
          {
            label: "Strategy Room",
            href: buildProjectRoomRoute(params.workspaceId, "strategy-room"),
            active: true
          },
          {
            label: "Project Workspace",
            href: workspaceHref
          },
          {
            label: "Command Center",
            href: commandCenterHref
          }
        ]}
        primaryAction={{
          label: "Open Project Workspace",
          href: workspaceHref
        }}
        secondaryAction={{
          label: "Open Command Center",
          href: commandCenterHref
        }}
        modules={[
          {
            label: "Planning",
            title: "Keep the direction clear",
            body:
              "Use Strategy Room to keep the product definition, first user, and first release boundary readable before the execution surface widens."
          },
          {
            label: "Roadmap",
            title: "Stay tied to the same project",
            body:
              "This route now stays attached to the active project so the customer can move through planning, workspace, and command surfaces without losing context."
          },
          {
            label: "Next move",
            title: "Hand off without dead links",
            body:
              "When you are ready to move forward, continue into the project workspace or command surface from here instead of bouncing into a missing route."
          }
        ]}
      />
    </DashboardBoardShell>
  );
}
