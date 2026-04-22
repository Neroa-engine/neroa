import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getOptionalUser();

  if (!user) {
    redirect("/auth");
  }

  const supabase = createSupabaseServerClient();
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, description, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, notes, workspace_id, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#060816] py-8 text-white">
      <section className="shell">
        <div className="surface-main p-6 md:p-8">
          <div className="flex flex-col gap-6 border-b border-white/8 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
                Dashboard
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
                Welcome back, {user.email}
              </h1>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Continue inside Neroa, open Strategy Room when you need a new plan, and keep every
                build visible from roadmap to preview and approvals.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/start" className="button-primary">
                Open Strategy Room
              </Link>
              <form action="/auth/sign-out" method="post">
                <button className="button-secondary" type="submit">
                  Sign out
                </button>
              </form>
            </div>
          </div>

          {searchParams?.error ? (
            <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {searchParams.error}
            </div>
          ) : null}

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <section className="surface-subtle p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Start flow
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Strategy Room first</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Use `/start` whenever you want to begin new work. Neroa will turn the idea into a
                guided roadmap and first build direction before the workspace opens.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Planning, preview, progress, and approvals stay connected behind one customer-facing
                product shell.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Explain the product idea or the business problem.",
                  "Let Neroa ask only the minimum useful follow-up questions.",
                  "Open the build once the roadmap and next move are clear."
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-[#090f1d] px-4 py-3 text-sm leading-7 text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-subtle p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Active builds
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Your Neroa builds</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                    These are the current builds, product threads, and workspaces attached to your
                    Neroa account.
                  </p>
                </div>
                <span className="rounded-full bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
                  {workspaces?.length ?? 0} total
                </span>
              </div>

              {workspaces && workspaces.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {workspaces.map((workspace) => (
                    <Link
                      key={workspace.id}
                      href={`/workspace/${workspace.id}/project/${workspace.id}`}
                      className="surface-inner block p-5 transition hover:bg-white/[0.06]"
                    >
                      <p className="text-lg font-semibold text-white">{workspace.name}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-400">
                        {workspace.description || "No description added yet."}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="surface-inner mt-6 p-8 text-center">
                  <p className="text-xl font-semibold text-white">No builds yet</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Start in Strategy Room to launch your first build instead of filling out a blank
                    setup form.
                  </p>
                  <div className="mt-6">
                    <Link href="/start" className="button-primary">
                      Open your first build
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </div>

          <section className="surface-subtle mt-6 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Saved jobs
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Reusable outputs</h2>
              </div>
              <span className="rounded-full bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
                {jobs?.length ?? 0} total
              </span>
            </div>

            {jobs && jobs.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="surface-inner block p-5 transition hover:bg-white/[0.06]"
                  >
                    <p className="text-lg font-semibold text-white">{job.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      {job.notes || "No notes saved for this job yet."}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                      Workspace {job.workspace_id}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="surface-inner mt-6 p-8 text-center">
                <p className="text-xl font-semibold text-white">No jobs saved yet</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Saved jobs will appear here once workspaces start producing reusable outputs.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
