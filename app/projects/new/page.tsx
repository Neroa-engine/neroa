import { unstable_noStore as noStore } from "next/cache";
import { OuterPortalShell } from "@/components/portal/portal-shells";
import { WorkspaceCreateForm } from "@/components/workspace-create-form";
import { requireUser } from "@/lib/auth";
import {
  buildPortalProjectSummary,
  resolveActivePortalProject
} from "@/lib/portal/server";
import { getCustomerFacingWorkspacePortfolio } from "@/lib/platform/foundation";
import { APP_ROUTES } from "@/lib/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProjectsNewPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function ProjectsNewPage({ searchParams }: ProjectsNewPageProps) {
  noStore();
  const { user } = await requireUser({
    nextPath: APP_ROUTES.projectsNew
  });
  const supabase = createSupabaseServerClient();
  const customerFacingPortfolio = await getCustomerFacingWorkspacePortfolio({
    supabase,
    userId: user.id
  }).catch(() => ({
    workspaces: [],
    currentWorkspaceIds: [],
    archivedWorkspaceIds: [],
    legacyWorkspaceIds: [],
    currentCount: 0,
    archivedCount: 0,
    legacyCount: 0
  }));
  const portalProjects = (customerFacingPortfolio.workspaces ?? []).map((workspace) =>
    buildPortalProjectSummary(workspace)
  );
  const activeProject = await resolveActivePortalProject({
    supabase,
    userId: user.id,
    projects: portalProjects
  });

  return (
    <OuterPortalShell
      currentPath={APP_ROUTES.projectsNew}
      userEmail={user.email ?? undefined}
      activeProject={activeProject}
      availableProjects={portalProjects}
    >
      <section className="panel p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="premium-pill w-fit text-cyan-700">New project</div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Start a new project inside the active portal.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                Create the next project here, then Neroa will open its project workspace instead of
                dropping you back into the public strategy page.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Projects root", "Keep new work inside the same signed-in portal."],
                ["Real workspace routes", "New projects open into the actual project interior."],
                ["No public fallback", "Signed-in creation stays out of the public /start flow."]
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-slate-200/75 bg-white/82 p-5"
                >
                  <p className="text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white/84 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Create project
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Give the project a name and a short summary. Neroa will open the project workspace as
              soon as it is created.
            </p>

            {searchParams?.error ? (
              <div className="mt-5 rounded-2xl border border-rose-300/30 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {searchParams.error}
              </div>
            ) : null}

            <div className="mt-6">
              <WorkspaceCreateForm errorPath={APP_ROUTES.projectsNew} />
            </div>
          </div>
        </div>
      </section>
    </OuterPortalShell>
  );
}
