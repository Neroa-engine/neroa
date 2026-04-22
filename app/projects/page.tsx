import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { DashboardBoardShell } from "@/components/layout/page-shells";
import {
  loadPortalProjectSummariesForUser,
  resolveSmartResumeDestination
} from "@/lib/portal/server";
import { APP_ROUTES } from "@/lib/routes";
import { requireUser } from "@/lib/auth";

type ProjectsPageProps = {
  searchParams?: {
    error?: string;
  };
};

function formatCreatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  noStore();
  const { supabase, user } = await requireUser({
    nextPath: APP_ROUTES.projects
  });
  const projects = await loadPortalProjectSummariesForUser({
    supabase,
    userId: user.id
  });
  const smartResumeDestination = await resolveSmartResumeDestination({
    supabase,
    userId: user.id
  });

  return (
    <DashboardBoardShell
      userEmail={user.email ?? undefined}
      ctaHref={APP_ROUTES.startDiy}
      ctaLabel="New Project"
    >
      <div className="space-y-6">
        <section className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 xl:px-8">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
                Projects
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
                Choose the project you want to move forward.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                Projects is the signed-in continuation layer after the front door and Strategy Room.
                Open the active project workspace, step back into strategy, or continue into the
                project&apos;s Command Center from here.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={APP_ROUTES.startDiy} className="button-primary">
                Start another project
              </Link>
              <Link href={smartResumeDestination} className="button-secondary">
                Resume latest project
              </Link>
            </div>
          </div>
        </section>

        {searchParams?.error ? (
          <div className="rounded-2xl border border-rose-300/50 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
            {searchParams.error}
          </div>
        ) : null}

        {projects.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {projects.map((project) => (
              <section key={project.workspaceId} className="floating-plane rounded-[30px] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                      Active project
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                      {project.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {project.description ??
                        "This project is ready to continue through workspace, strategy, and command-center views."}
                    </p>
                  </div>
                  <span className="premium-pill text-slate-500">
                    Created {formatCreatedAt(project.createdAt)}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={project.workspaceRoute} className="button-secondary">
                    Project Workspace
                  </Link>
                  <Link href={project.strategyRoomRoute} className="button-secondary">
                    Strategy Room
                  </Link>
                  <Link href={project.commandCenterRoute} className="button-primary">
                    Command Center
                  </Link>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section className="floating-plane rounded-[30px] p-6">
            <p className="text-lg font-semibold text-slate-950">No projects yet</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Start with Strategy Room and Neroa will create the first project shell for you. Once a
              project exists, it will appear here as the continuation point into workspace and
              command surfaces.
            </p>
            <div className="mt-5">
              <Link href={APP_ROUTES.startDiy} className="button-primary">
                Open Strategy Room
              </Link>
            </div>
          </section>
        )}
      </div>
    </DashboardBoardShell>
  );
}
