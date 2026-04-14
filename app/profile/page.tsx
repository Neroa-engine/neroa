import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { DashboardBoardShell } from "@/components/layout/page-shells";

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
  const { user } = await requireUser();

  return (
    <DashboardBoardShell
      userEmail={user.email ?? undefined}
      ctaHref="/dashboard"
      ctaLabel="Open engines"
    >
      <div className="space-y-6">
        <section className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 xl:px-8">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
                Account
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
                Profile presence for your Neroa engine access.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                This is the account connected to your current browser session. From here you can confirm the active identity, jump back into the engine board, or move into settings.
              </p>
            </div>

            <div className="premium-surface-soft min-w-[240px] p-5">
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
          <div className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Session details
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="premium-surface-soft p-5">
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">
                    {user.email ?? "No email on file"}
                  </p>
                </div>
                <div className="premium-surface-soft p-5">
                  <p className="text-sm font-medium text-slate-500">Last sign in</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">
                    {formatDate(user.last_sign_in_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="floating-plane rounded-[34px] p-6">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Next actions
              </p>
              <div className="mt-6 grid gap-3">
                <Link href="/dashboard" className="button-secondary justify-between">
                  <span>Open dashboard</span>
                  <span className="text-cyan-700">Go</span>
                </Link>
                <Link href="/settings" className="button-secondary justify-between">
                  <span>Account / Settings</span>
                  <span className="text-cyan-700">Open</span>
                </Link>
                <Link href="/support" className="button-secondary justify-between">
                  <span>Get support</span>
                  <span className="text-cyan-700">Help</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardBoardShell>
  );
}
