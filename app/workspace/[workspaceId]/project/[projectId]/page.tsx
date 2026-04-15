import WorkspaceShell from "@/components/workspace/workspace-shell";
import { DashboardBoardShell } from "@/components/layout/page-shells";
import { renameWorkspace } from "@/app/workspace/actions";
import { getWorkspaceProjectContext } from "@/lib/workspace/server";
import Link from "next/link";

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
  const { user, workspace, project, projectMetadata } = await getWorkspaceProjectContext(
    params.workspaceId,
    params.projectId,
    {
      requestedPrimaryLaneId: firstValue(searchParams?.lane),
      requestedSupportingLaneIds: firstValue(searchParams?.supporting)
    }
  );

  return (
    <DashboardBoardShell userEmail={user.email ?? undefined} ctaHref="/dashboard" ctaLabel="Dashboard">
        {firstValue(searchParams?.error) ? (
          <div className="mb-4 rounded-2xl border border-rose-300/50 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
            {firstValue(searchParams?.error)}
          </div>
        ) : null}

        <section className="floating-plane mb-4 rounded-[30px] px-5 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Engine control
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{project.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Rename the engine here without leaving the command center.
              </p>
            </div>

            <form action={renameWorkspace} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <input type="hidden" name="workspaceId" value={workspace.id} />
              <input
                type="hidden"
                name="returnTo"
                value={`/workspace/${workspace.id}/project/${project.id}`}
              />
              <input
                type="text"
                name="name"
                defaultValue={project.title}
                className="input flex-1"
                placeholder="Rename engine"
              />
              <button type="submit" className="button-secondary whitespace-nowrap">
                Save name
              </button>
            </form>

            <Link
              href={`/workspace/${workspace.id}/project/${project.id}/live-view`}
              className="button-quiet px-4 py-3 text-sm"
            >
              Open Live View
            </Link>
          </div>
        </section>

        <WorkspaceShell
          workspaceId={workspace.id}
          project={project}
          projectMetadata={projectMetadata}
          userEmail={user.email ?? undefined}
        />
    </DashboardBoardShell>
  );
}
