import { ActiveProjectPortalShell } from "@/components/portal/portal-shells";
import { ProjectStrategyRoomV1 } from "@/components/workspace/project-strategy-room-v1";
import {
  buildPortalProjectSummary,
  loadPortalProjectSummariesForUser
} from "@/lib/portal/server";
import { getWorkspaceProjectContext } from "@/lib/workspace/server";

type StrategyRoomPageProps = {
  params: {
    workspaceId: string;
  };
  searchParams?: {
    error?: string | string[];
    notice?: string | string[];
  };
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeStrategyMessage(value: string | null) {
  if (!value) {
    return null;
  }

  return value
    .replace(/\b[Ee]ngine\b/g, (match) => (match === "Engine" ? "Project" : "project"))
    .replace(/command center/gi, "project workspace")
    .replace(/execution routing/gi, "project flow");
}

export default async function StrategyRoomPage({
  params,
  searchParams
}: StrategyRoomPageProps) {
  const { supabase, user, workspace, project, projectMetadata, projectIntelligence } =
    await getWorkspaceProjectContext(params.workspaceId, params.workspaceId);
  const portalProjects = await loadPortalProjectSummariesForUser({
    supabase,
    userId: user.id
  });
  const activeProject =
    portalProjects.find((item) => item.workspaceId === params.workspaceId) ??
    buildPortalProjectSummary(workspace);

  return (
    <ActiveProjectPortalShell
      currentRoom="strategy-room"
      userEmail={user.email ?? undefined}
      activeProject={activeProject}
      availableProjects={portalProjects}
    >
      <ProjectStrategyRoomV1
        userEmail={user.email ?? undefined}
        project={project}
        projectMetadata={projectMetadata}
        projectBrief={projectIntelligence.projectBrief}
        architectureBlueprint={projectIntelligence.architectureBlueprint}
        roadmapPlan={projectIntelligence.roadmapPlan}
        governancePolicy={projectIntelligence.governancePolicy}
        platformContext={projectIntelligence.platformContext}
        initialError={sanitizeStrategyMessage(firstValue(searchParams?.error) ?? null)}
        initialNotice={sanitizeStrategyMessage(firstValue(searchParams?.notice) ?? null)}
      />
    </ActiveProjectPortalShell>
  );
}
