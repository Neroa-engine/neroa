import Link from "next/link";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import { requireUser } from "@/lib/auth";
import {
  countActiveEnginesForUser,
  syncAccountPlanAccess
} from "@/lib/account/plan-usage-server";
import { OuterPortalShell } from "@/components/portal/portal-shells";
import {
  PortalActionRow,
  PortalSummaryRow
} from "@/components/portal/outer-portal-ui";
import { APP_ROUTES } from "@/lib/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

function formatPlanStatus(value: string | null) {
  if (!value) {
    return "not set";
  }

  return value.replace(/_/g, " ");
}

export default async function SettingsPage() {
  noStore();
  const { user } = await requireUser({
    nextPath: APP_ROUTES.settings
  });
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
    <OuterPortalShell
      currentPath={APP_ROUTES.settings}
      userEmail={user.email ?? undefined}
      showActiveProjectPanel={false}
      showActiveProjectChip={false}
    >
      <div className="space-y-6">
        <section className="floating-plane relative overflow-hidden rounded-[34px] px-6 py-8 xl:px-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
                Settings
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white xl:text-6xl">
                Account controls, billing access, and support paths in one place.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--front-door-text-secondary)]">
                Keep this page operational and direct: move between Projects, billing, usage, and
                support without extra filler or duplicated controls.
              </p>
            </div>

            <div className="rounded-[22px] border border-[color:var(--front-door-border)] bg-[linear-gradient(140deg,rgba(11,18,33,0.94),rgba(8,11,24,0.96))] px-5 py-5 shadow-[0_18px_42px_rgba(7,10,20,0.3),0_0_0_1px_rgba(112,211,252,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--front-door-text-secondary)]">
                Signed-in account
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {user.email ?? "Neroa account"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--front-door-text-secondary)]">
                {usage.planName ?? "Plan required"} ·{" "}
                {usage.engineCreditsRemaining === null
                  ? "Custom credits"
                  : `${usage.engineCreditsRemaining.toLocaleString("en-US")} credits left`}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="floating-plane rounded-[28px] p-5 sm:p-6">
            <div className="floating-wash rounded-[28px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Control surfaces
              </p>
              <div className="mt-5 space-y-3">
                <PortalActionRow
                  title="Projects"
                  detail="Open the outer project portal, review active work, and switch the project Neroa should resume."
                  href={APP_ROUTES.projects}
                  actionLabel="Open"
                />
                <PortalActionRow
                  title="Resume Project"
                  detail="Jump back into the currently active project using the smart resume route."
                  href={APP_ROUTES.projectsResume}
                  actionLabel="Resume"
                />
                <PortalActionRow
                  title="Billing and Usage"
                  detail="Review plan access, credits used, credits saved, and purchase flows."
                  href={APP_ROUTES.billing}
                  actionLabel="Open"
                />
                <PortalActionRow
                  title="Support"
                  detail="Use the standard support path without leaving the signed-in surface."
                  href="/support"
                  actionLabel="Open"
                />
              </div>
            </div>
          </div>

          <div className="floating-plane rounded-[28px] p-5 sm:p-6">
            <div className="floating-wash rounded-[28px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Account summary
              </p>
              <div className="mt-5 rounded-[20px] border border-[color:var(--front-door-border)] bg-[linear-gradient(140deg,rgba(11,18,33,0.96),rgba(8,11,24,0.96))] px-5 py-4 shadow-[0_18px_42px_rgba(7,10,20,0.32),0_0_0_1px_rgba(112,211,252,0.1)]">
                <PortalSummaryRow
                  label="Current plan"
                  detail={formatPlanStatus(usage.planStatus)}
                  value={usage.planName ?? "Select a plan"}
                  variant="stack"
                />
                <PortalSummaryRow
                  label="Credits"
                  detail={`${usage.engineCreditsUsed.toLocaleString("en-US")} used this cycle`}
                  value={
                    usage.engineCreditsRemaining === null
                      ? "Custom"
                      : `${usage.engineCreditsRemaining.toLocaleString("en-US")} left`
                  }
                  variant="stack"
                />
                <PortalSummaryRow
                  label="Active engines"
                  detail="Currently counted against the account allowance"
                  value={
                    usage.activeEngineLimit === null
                      ? "Custom"
                      : `${usage.activeEnginesUsed}/${usage.activeEngineLimit}`
                  }
                  variant="stack"
                />
              </div>

              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Account actions
              </p>
              <div className="mt-4 grid gap-3">
                <Link href={APP_ROUTES.profile} className="button-secondary justify-between">
                  <span>Profile</span>
                  <span className="text-cyan-200">Open</span>
                </Link>
                <Link href={APP_ROUTES.usage} className="button-secondary justify-between">
                  <span>Usage / Credits</span>
                  <span className="text-cyan-200">Open</span>
                </Link>
                <form method="post" action="/auth/sign-out">
                  <button type="submit" className="button-secondary w-full justify-between">
                    <span>Sign out</span>
                    <span className="text-cyan-200">Exit</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </OuterPortalShell>
  );
}

