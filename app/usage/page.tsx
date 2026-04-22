import Link from "next/link";
import { OuterPortalShell } from "@/components/portal/portal-shells";
import {
  PortalMetricTile,
  PortalSummaryRow
} from "@/components/portal/outer-portal-ui";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAccountBillingSnapshot } from "@/lib/billing/account";
import { APP_ROUTES } from "@/lib/routes";
import { unstable_noStore as noStore } from "next/cache";

function formatCredits(value: number | null) {
  return value === null ? "Custom" : value.toLocaleString("en-US");
}

export default async function UsagePage() {
  noStore();
  const { user } = await requireUser({
    nextPath: APP_ROUTES.usage
  });
  const supabase = createSupabaseServerClient();
  const snapshot = await getAccountBillingSnapshot({
    supabase,
    user
  });

  return (
    <OuterPortalShell
      currentPath={APP_ROUTES.usage}
      userEmail={user.email ?? undefined}
      showActiveProjectPanel={false}
      showActiveProjectChip={false}
    >
      <div className="space-y-6">
        <section className="floating-plane relative overflow-hidden rounded-[36px] px-6 py-8 xl:px-8">
          <div className="floating-wash rounded-[36px]" />
          <div className="relative max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
              Usage / Credits
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
              See current credit usage, saved capacity, and project limits at a glance.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              Usage stays separate from plan changes here, so you can monitor what the account has
              already consumed, what is still saved this cycle, and where the next limit will hit.
            </p>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          <PortalMetricTile
            label="Included credits"
            value={formatCredits(snapshot.includedCredits)}
            detail="Monthly credits included by the current plan."
          />
          <PortalMetricTile
            label="Credits used"
            value={snapshot.access.engineCreditsUsed.toLocaleString("en-US")}
            detail="Activity already consumed in the current billing cycle."
          />
          <PortalMetricTile
            label="Credits saved"
            value={formatCredits(snapshot.creditsSaved)}
            detail="Unused credits still available before the cycle resets."
          />
          <PortalMetricTile
            label="Project slots"
            value={
              snapshot.activeProjectLimit === null
                ? `${snapshot.activeProjectsUsed}`
                : `${snapshot.activeProjectsUsed}/${snapshot.activeProjectLimit}`
            }
            detail="Matches the Current Projects view and excludes archived or legacy records."
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <div className="floating-plane rounded-[32px] p-6 sm:p-7">
            <div className="floating-wash rounded-[32px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Capacity view
              </p>
              <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-4">
                <PortalSummaryRow
                  label="Active projects"
                  detail={
                    snapshot.activeProjectLimit === null
                      ? `${snapshot.activeProjectsUsed} customer-facing current projects are tracked now.`
                      : `${snapshot.activeProjectsUsed} of ${snapshot.activeProjectLimit} current build-project slots are in use.`
                  }
                  value={
                    snapshot.activeProjectLimit === null
                      ? "Custom"
                      : `${snapshot.activeProjectsUsed}/${snapshot.activeProjectLimit}`
                  }
                  variant="stack"
                />
                <PortalSummaryRow
                  label="Active engines"
                  detail={
                    snapshot.access.activeEngineLimit === null
                      ? "The plan uses a custom engine allowance."
                      : `${snapshot.access.activeEnginesUsed} of ${snapshot.access.activeEngineLimit} active engines are currently counted.`
                  }
                  value={
                    snapshot.access.activeEngineLimit === null
                      ? "Custom"
                      : `${snapshot.access.activeEnginesUsed}/${snapshot.access.activeEngineLimit}`
                  }
                  variant="stack"
                />
                <PortalSummaryRow
                  label="Monthly reset"
                  detail={
                    snapshot.access.monthlyResetDate
                      ? `Next reset is scheduled for ${new Date(snapshot.access.monthlyResetDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}.`
                      : "Reset scheduling becomes active once the plan is fully established."
                  }
                  value={
                    snapshot.access.monthlyResetDate
                      ? new Date(snapshot.access.monthlyResetDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric"
                        })
                      : "Pending"
                  }
                  variant="stack"
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
              <div className="mt-6 space-y-3">
                <Link href={APP_ROUTES.billing} className="button-primary justify-between">
                  <span>Open billing</span>
                  <span className="text-cyan-100">Manage</span>
                </Link>
                <Link
                  href={`${APP_ROUTES.billing}?kind=credit_pack`}
                  className="button-secondary justify-between"
                >
                  <span>Review credit packs</span>
                  <span className="text-cyan-700">Open</span>
                </Link>
                <Link
                  href={`${APP_ROUTES.billing}?kind=build_project_pack`}
                  className="button-secondary justify-between"
                >
                  <span>Review project packs</span>
                  <span className="text-cyan-700">Open</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </OuterPortalShell>
  );
}
