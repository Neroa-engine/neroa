import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { formatRelativeDate } from "@/lib/format";
import { buildProjectWorkspaceRoute } from "@/lib/portal/routes";
import { updateJob } from "@/app/jobs/[id]/actions";

type JobPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    error?: string;
    notice?: string;
  };
};

export default async function JobPage({ params, searchParams }: JobPageProps) {
  const { supabase, user } = await requireUser();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, title, notes, workspace_id, created_at, updated_at")
    .eq("id", params.id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  if (!job) {
    redirect("/dashboard?error=Job not found.");
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("id", job.workspace_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  const saveAction = updateJob.bind(null, job.id);

  return (
    <main className="shell py-8">
      <section className="surface-main p-6 md:p-8">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/dashboard" className="text-sm font-medium text-white/70 transition hover:text-white">
              Back to dashboard
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-white/55">
              Saved job
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
              {job.title}
            </h1>
            <p className="mt-3 max-w-2xl text-white/75">
              Reopen this saved job any time, adjust the notes, and save it again.
            </p>
          </div>

          <div className="surface-subtle min-w-[240px] p-5">
            <p className="text-sm font-medium text-white">Job details</p>
            <dl className="mt-4 space-y-3 text-sm text-white/75">
              <div className="flex items-center justify-between gap-4">
                <dt>Created</dt>
                <dd>{formatRelativeDate(job.created_at)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Updated</dt>
                <dd>{formatRelativeDate(job.updated_at)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Workspace</dt>
                <dd>
                  {workspace ? (
                    <Link href={buildProjectWorkspaceRoute(workspace.id)} className="text-white underline-offset-4 hover:underline">
                      {workspace.name}
                    </Link>
                  ) : (
                    "Unavailable"
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {searchParams?.error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {searchParams.error}
          </div>
        ) : null}

        {searchParams?.notice ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {searchParams.notice}
          </div>
        ) : null}

        <section className="surface-subtle mt-8 p-6">
          <h2 className="text-2xl font-semibold text-white">Edit saved job</h2>
          <p className="mt-3 text-sm leading-7 text-white/85">
            Update the saved job details here, then save again whenever you need to refresh it.
          </p>

          <form action={saveAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm">
                Job title
              </label>
              <input
                id="title"
                name="title"
                defaultValue={job.title}
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="mb-2 block text-sm">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                defaultValue={job.notes ?? ""}
                rows={6}
              />
            </div>

            <button className="button-primary" type="submit">
              Save job again
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
