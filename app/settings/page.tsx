import Link from "next/link";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import { requireUser } from "@/lib/auth";
import {
  countActiveEnginesForUser,
  syncAccountPlanAccess
} from "@/lib/account/plan-usage-server";
import { DashboardBoardShell } from "@/components/layout/page-shells";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatPlanStatus(value: string | null) {
  if (!value) {
    return "not set";
  }

  return value.replace(/_/g, " ");
}

export default async function SettingsPage() {
  const { user } = await requireUser();
  const supabase = createSupabaseServerClient();
  const activeEnginesUsed = await countActiveEnginesForUser(supabase, user.id).catch(() => 0);
  const usage = await syncAccountPlanAccess({
    supabase,
    user,
    activeEnginesUsed
  }).catch(() =>
    resolveAccountPlanAccess(user, {
      activeEnginesUsed
    })
  );

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
                Account settings
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
                Keep your Neroa access, engine board entry, and support paths organized.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                This page gives the header account menu a real destination today while leaving room for fuller settings controls as the product expands.
              </p>
            </div>

            <div className="premium-surface-soft min-w-[240px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Active account
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">
                {user.email ?? "Neroa account"}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {usage.planName ?? "Plan required"} ·{" "}
                {usage.engineCreditsRemaining === null
                  ? "Custom Engine Credits"
                  : `${usage.engineCreditsRemaining.toLocaleString("en-US")} credits left`}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Available now
              </p>
              <div className="mt-6 grid gap-4">
                {[ 
                  [
                    "Engine access",
                  "Jump directly into your dashboard and open your active Neroa engines."
                  ],
                  [
                    "Usage visibility",
                    "See the current plan, Engine Credits, and active Engine limit without guessing what the account can do next."
                  ],
                  [
                    "Support routing",
                    "Use the public support and contact flow without getting pushed into broken routes."
                  ],
                  [
                    "Session control",
                    "Sign out cleanly when you want to close the current account session."
                  ]
                ].map(([title, description]) => (
                  <div key={title} className="premium-surface-soft p-5">
                    <p className="text-base font-semibold text-slate-950">{title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="floating-plane rounded-[34px] p-6">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Account usage
              </p>
              <div className="mt-6 space-y-4 rounded-[24px] border border-slate-200/70 bg-white/78 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Current plan</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatPlanStatus(usage.planStatus)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-cyan-700">
                    {usage.planName ?? "Select a plan"}
                  </p>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Engine Credits</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {usage.engineCreditsUsed.toLocaleString("en-US")} used this month
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-cyan-700">
                    {usage.engineCreditsRemaining === null
                      ? "Custom"
                      : `${usage.engineCreditsRemaining.toLocaleString("en-US")} left`}
                  </p>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Active Planning Engines</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {usage.activeEnginesUsed.toLocaleString("en-US")} active now
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-cyan-700">
                    {usage.activeEngineLimit === null
                      ? "Custom"
                      : `${usage.activeEnginesUsed}/${usage.activeEngineLimit}`}
                  </p>
                </div>
                <Link href="/pricing/diy" className="button-secondary justify-between">
                  <span>Upgrade plan</span>
                  <span className="text-cyan-700">View pricing</span>
                </Link>
              </div>
              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Account actions
              </p>
              <div className="mt-4 grid gap-3">
                <Link href="/profile" className="button-secondary justify-between">
                  <span>View profile</span>
                  <span className="text-cyan-700">Open</span>
                </Link>
                <Link href="/dashboard" className="button-secondary justify-between">
                  <span>Dashboard / Engines</span>
                  <span className="text-cyan-700">Go</span>
                </Link>
                <form method="post" action="/auth/sign-out">
                  <button type="submit" className="button-secondary w-full justify-between">
                    <span>Sign out</span>
                    <span className="text-cyan-700">Exit</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardBoardShell>
  );
}
