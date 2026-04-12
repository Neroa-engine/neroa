import WorkspaceShell from "@/components/workspace/workspace-shell";
import { deriveWorkspaceLanes } from "@/lib/workspace/lanes";
import { buildProjectModel } from "@/lib/workspace/project-lanes";
import { getWorkspaceProjectContext } from "@/lib/workspace/server";

type ProjectPageProps = {
  params: {
    workspaceId: string;
    projectId: string;
  };
  searchParams?: {
    error?: string | string[];
    lane?: string | string[];
    supporting?: string | string[];
  };
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { user, workspace } = await getWorkspaceProjectContext(
    params.workspaceId,
    params.projectId
  );

  const laneSelection = deriveWorkspaceLanes({
    name: workspace.name,
    description: workspace.description,
    requestedPrimaryLaneId: firstValue(searchParams?.lane),
    requestedSupportingLaneIds: firstValue(searchParams?.supporting)
  });
  const project = buildProjectModel({
    workspaceId: workspace.id,
    projectId: params.projectId,
    title: workspace.name,
    description: workspace.description,
    primaryLaneId: laneSelection.primaryLaneId
  });

  return (
    <main className="min-h-screen bg-[#060816] py-6 text-white">
      <div className="mx-auto w-full max-w-[1840px] px-4 sm:px-6 xl:px-8">
        {firstValue(searchParams?.error) ? (
          <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {firstValue(searchParams?.error)}
          </div>
        ) : null}

        <WorkspaceShell
          workspaceId={workspace.id}
          project={project}
          userEmail={user.email ?? undefined}
        />
      </div>
    </main>
  );
}
