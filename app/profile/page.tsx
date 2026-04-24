import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { OuterPortalShell } from "@/components/portal/portal-shells";
import {
  PortalActionRow,
  PortalMetricTile
} from "@/components/portal/outer-portal-ui";
import { APP_ROUTES } from "@/lib/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  listSelectablePortalProjects,
  loadPortalProjectSummariesForUser,
  resolveActivePortalProject
} from "@/lib/portal/server";
import { unstable_noStore as noStore } from "next/cache";

function formatDate(value?: string) {
  if (!value) {
    return "Not available yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available yet";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default async function ProfilePage() {
  noStore();
  const { user } = await requireUser({
    nextPath: "/profile"
  });
  const supabase = createSupabaseServerClient();
  const portalProjects = await loadPortalProjectSummariesForUser({
    supabase,
    userId: user.id
  });
  const selectablePortalProjects = listSelectablePortalProjects(portalProjects);
  const activeProject = await resolveActivePortalProject({
    supabase,
    userId: user.id,
    projects: portalProjects
  });

  return (
    <OuterPortalShell
      currentPath={APP_ROUTES.profile}
      userEmail={user.email ?? undefined}
      activeProject={activeProject}
      availableProjects={selectablePortalProjects}
    >
      <div className="space-y-6">
        <section className="floating-plane relative overflow-hidden rounded-[36px] px-6 py-8 xl:px-8">
          <div className="floating-wash rounded-[36px]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
                Profile
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
                Confirm the account identity attached to this portal session.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                This page keeps the signed-in identity clear, then routes you back into Projects,
                Billing, Usage, or Settings without sending you through unrelated screens.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white/84 px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Signed in as
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">
                {user.email ?? "Neroa account"}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="floating-plane rounded-[32px] p-6 sm:p-7">
            <div className="floating-wash rounded-[32px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Session details
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <PortalMetricTile label="Email" value={user.email ?? "No email on file"} />
                <PortalMetricTile
                  label="Last sign in"
                  value={formatDate(user.last_sign_in_at)}
                />
              </div>
            </div>
          </div>

          <div className="floating-plane rounded-[32px] p-6">
            <div className="floating-wash rounded-[32px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Next actions
              </p>
              <div className="mt-6 grid gap-3">
                <PortalActionRow
                  title="Projects"
                  detail="Return to the outer project portal and manage current or archived work."
                  href={APP_ROUTES.projects}
                  actionLabel="Open"
                />
                <PortalActionRow
                  title="Resume Project"
                  detail="Jump straight into the current active project using the smart resume route."
                  href={APP_ROUTES.projectsResume}
                  actionLabel="Resume"
                />
                <PortalActionRow
                  title="Settings"
                  detail="Open account controls, support paths, and signed-in configuration."
                  href={APP_ROUTES.settings}
                  actionLabel="Open"
                />
                <PortalActionRow
                  title="Billing"
                  detail="Review plans, credits, project capacity, and purchase options."
                  href={APP_ROUTES.billing}
                  actionLabel="Open"
                />
                <PortalActionRow
                  title="Usage / Credits"
                  detail="See current credit usage, credits saved, and active project slots."
                  href={APP_ROUTES.usage}
                  actionLabel="Open"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </OuterPortalShell>
  );
}
