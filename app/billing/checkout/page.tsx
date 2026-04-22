import Link from "next/link";
import { DashboardBoardShell } from "@/components/layout/page-shells";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAccountBillingSnapshot } from "@/lib/billing/account";
import { APP_ROUTES } from "@/lib/routes";

type BillingCheckoutPageProps = {
  searchParams?: {
    intent?: string;
    kind?: string;
    mode?: string;
    item?: string;
    label?: string;
    price?: string;
    detail?: string;
    status?: string;
    message?: string;
  };
};

export default async function BillingCheckoutPage({
  searchParams
}: BillingCheckoutPageProps) {
  const { user } = await requireUser({
    nextPath: "/billing/checkout"
  });
  const supabase = createSupabaseServerClient();
  const snapshot = await getAccountBillingSnapshot({
    supabase,
    user
  });
  const previewCompleteHref = `/billing/checkout?intent=${encodeURIComponent(
    searchParams?.intent ?? "mock-intent"
  )}&kind=${encodeURIComponent(searchParams?.kind ?? "plan")}&mode=${encodeURIComponent(
    searchParams?.mode ?? "recurring"
  )}&item=${encodeURIComponent(searchParams?.item ?? "item")}&label=${encodeURIComponent(
    searchParams?.label ?? "Billing item"
  )}&price=${encodeURIComponent(searchParams?.price ?? "Pricing not provided")}&detail=${encodeURIComponent(
    searchParams?.detail ??
      "The selected item will appear here once the billing flow opens from the account area."
  )}&status=mock_complete&message=${encodeURIComponent(
    "Mock completion preview only. In live billing this step would return from Stripe, then apply the plan or entitlement through webhooks."
  )}`;
  const liveBillingSummary =
    searchParams?.mode === "recurring"
      ? "In live billing, Stripe Checkout would start a recurring subscription change for this account and the new plan would apply after webhook confirmation."
      : "In live billing, Stripe Checkout would process a one-time purchase and the entitlement would be added to this signed-in account after webhook confirmation.";

  return (
    <DashboardBoardShell
      userEmail={user.email ?? undefined}
      ctaHref={APP_ROUTES.billing}
      ctaLabel="Back to billing"
      commandCenterPath={APP_ROUTES.billing}
    >
      <div className="space-y-6">
        <section className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 xl:px-8">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative space-y-5">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
                Mock checkout
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
                Review the purchase flow before live billing is connected.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                This mock checkout intentionally does not change your account. It exists so Neroa
                can show the real billing path, purchase type, and entitlement target before
                Stripe sessions and webhooks are wired in a later pass.
              </p>
            </div>

          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Checkout session
              </p>
              <div className="mt-5 rounded-[24px] border border-slate-200/70 bg-white/84 p-4">
                <p className="text-sm font-semibold text-slate-950">Current plan</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {snapshot.access.planName ?? "No active plan"}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {snapshot.currentPlan?.bestFor ??
                    "This checkout preview can still open before a recurring plan is fully selected."}
                </p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="premium-surface-soft p-5">
                  <p className="text-sm font-medium text-slate-500">Intent id</p>
                  <p className="mt-3 text-base font-semibold text-slate-950">
                    {searchParams?.intent ?? "mock intent"}
                  </p>
                </div>
                <div className="premium-surface-soft p-5">
                  <p className="text-sm font-medium text-slate-500">Billing mode</p>
                  <p className="mt-3 text-base font-semibold capitalize text-slate-950">
                    {searchParams?.mode?.replace(/_/g, " ") ?? "mock"}
                  </p>
                </div>
                <div className="premium-surface-soft p-5">
                  <p className="text-sm font-medium text-slate-500">Purchase type</p>
                  <p className="mt-3 text-base font-semibold capitalize text-slate-950">
                    {searchParams?.kind?.replace(/_/g, " ") ?? "not provided"}
                  </p>
                </div>
                <div className="premium-surface-soft p-5">
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <p className="mt-3 text-base font-semibold capitalize text-slate-950">
                    {searchParams?.status?.replace(/_/g, " ") ?? "mock pending"}
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-[24px] border border-slate-200/70 bg-slate-50/90 p-4">
                <p className="text-sm font-semibold text-slate-950">What live billing would do</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{liveBillingSummary}</p>
              </div>
            </div>
          </div>

          <div className="floating-plane rounded-[34px] p-6">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Selected item
              </p>
              <div className="mt-6 rounded-[26px] border border-slate-200/70 bg-white/80 p-5">
                <p className="text-xl font-semibold text-slate-950">
                  {searchParams?.label ?? "Billing item"}
                </p>
                <p className="mt-3 text-sm font-semibold text-cyan-700">
                  {searchParams?.price ?? "Pricing not provided"}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {searchParams?.detail ??
                    "The selected item will appear here once the billing flow opens from the account area."}
                </p>
              </div>

              <div className="mt-5 rounded-[24px] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.92),rgba(255,255,255,0.84))] p-4 text-sm leading-7 text-slate-700">
                {searchParams?.message ??
                  "Billing integration is not live yet. No charges or entitlement changes will be applied from this screen."}
              </div>

              <div className="mt-5 rounded-[24px] border border-slate-200/70 bg-white/84 p-4">
                <p className="text-sm font-semibold text-slate-950">Mock completion preview</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  This step is intentionally a preview state. You can review the selected item,
                  preview a completed mock return, and then go back to billing without changing the
                  account.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href={APP_ROUTES.billing} className="button-primary">
                  Return to billing
                </Link>
                <Link href={APP_ROUTES.usage} className="button-secondary">
                  Review usage first
                </Link>
                <Link href={previewCompleteHref} className="button-secondary">
                  Preview mock completion
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardBoardShell>
  );
}
