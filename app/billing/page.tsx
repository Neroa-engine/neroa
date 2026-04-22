import { OuterPortalShell } from "@/components/portal/portal-shells";
import {
  PortalSectionBand,
  PortalSummaryRow
} from "@/components/portal/outer-portal-ui";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAccountBillingSnapshot } from "@/lib/billing/account";
import {
  buildBillingCatalogItem,
  buildProjectPacks,
  getAddOnOffer,
  getBuildProjectPack,
  getCreditPackOffer,
  getRecurringPlanOffers
} from "@/lib/billing/catalog";
import { executionCreditPacks, pricingAddOns } from "@/lib/pricing/config";
import { APP_ROUTES } from "@/lib/routes";
import { startMockOneTimeCheckout, startMockPlanCheckout } from "./actions";

type BillingSearchParams = Record<string, string | string[] | undefined>;

function formatCredits(value: number | null) {
  return value === null ? "Custom" : value.toLocaleString("en-US");
}

function readSearchParam(searchParams: BillingSearchParams, key: string) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function BillingBanner({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="rounded-[30px] border border-cyan-200/70 bg-[linear-gradient(140deg,rgba(255,255,255,0.96),rgba(236,254,255,0.88))] px-5 py-5 shadow-[0_24px_60px_rgba(34,211,238,0.08)] sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
        Billing
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">{detail}</p>
    </section>
  );
}

function PriceButton({
  label,
  ariaLabel
}: {
  label: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="submit"
      aria-label={ariaLabel}
      className="inline-flex min-w-[104px] items-center justify-center rounded-full bg-cyan-500 px-3.5 py-1.5 text-sm font-semibold leading-none text-white shadow-[0_12px_30px_rgba(6,182,212,0.24)] transition hover:bg-cyan-400"
    >
      {label}
    </button>
  );
}

function PurchaseRow({
  title,
  detail,
  priceLabel,
  action,
  hiddenFields,
  badge,
  selected = false
}: {
  title: string;
  detail: string;
  priceLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Array<{ name: string; value: string }>;
  badge?: string;
  selected?: boolean;
}) {
  return (
    <form action={action} className="w-full">
      {hiddenFields.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}

      <div
        className={`grid gap-3 rounded-[24px] border px-4 py-2.5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.45fr)_auto] sm:items-center sm:px-5 ${
          selected
            ? "border-cyan-300/80 bg-cyan-50/70"
            : "border-slate-200/75 bg-white/84 hover:border-cyan-200/90"
        }`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-950">{title}</p>
            {badge ? (
              <span className="rounded-full border border-cyan-300/40 bg-cyan-300/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                {badge}
              </span>
            ) : null}
          </div>
        </div>

        <p className="text-sm leading-7 text-slate-500 sm:pr-4">{detail}</p>

        <div className="sm:justify-self-end">
          <PriceButton label={priceLabel} ariaLabel={`${title} - ${priceLabel}`} />
        </div>
      </div>
    </form>
  );
}

function resolveBillingIntent(searchParams: BillingSearchParams) {
  const kind = readSearchParam(searchParams, "kind");

  if (kind === "plan") {
    const planId = readSearchParam(searchParams, "plan");
    const offer = getRecurringPlanOffers().find((item) => item.id === planId);

    if (!offer) {
      return null;
    }

    return buildBillingCatalogItem({
      plan: offer.plan
    });
  }

  if (kind === "credit_pack") {
    return buildBillingCatalogItem({
      creditPack: getCreditPackOffer(readSearchParam(searchParams, "pack"))
    });
  }

  if (kind === "build_project_pack") {
    return buildBillingCatalogItem({
      buildProjectPack: getBuildProjectPack(readSearchParam(searchParams, "pack"))
    });
  }

  if (kind === "addon") {
    return buildBillingCatalogItem({
      addOn: getAddOnOffer(readSearchParam(searchParams, "addon"))
    });
  }

  return null;
}

export default async function BillingPage({
  searchParams
}: {
  searchParams?: Promise<BillingSearchParams> | BillingSearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const { user } = await requireUser({
    nextPath: APP_ROUTES.billing
  });
  const supabase = createSupabaseServerClient();
  const snapshot = await getAccountBillingSnapshot({
    supabase,
    user
  });

  const selectedIntent = resolveBillingIntent(resolvedSearchParams);
  const currentPlanId = snapshot.currentPlan?.id ?? snapshot.access.selectedPlanId ?? "free";
  const recurringPlans = getRecurringPlanOffers();
  const addOnRows = pricingAddOns.filter((item) =>
    ["extra-credits", "extra-build-projects", "extra-seats"].includes(item.id)
  );
  const projectSlotsValue =
    snapshot.activeProjectLimit === null
      ? `${snapshot.activeProjectsUsed}`
      : `${snapshot.activeProjectsUsed}/${snapshot.activeProjectLimit}`;

  return (
    <OuterPortalShell
      currentPath={APP_ROUTES.billing}
      userEmail={user.email ?? undefined}
      showActiveProjectPanel={false}
      showActiveProjectChip={false}
    >
      <div className="space-y-6">
        <BillingBanner
          title="Billing integration is not live yet."
          detail="This page shows the real plan, credit, capacity, and add-on structure Neroa will hand to Stripe later. Purchase rows open the mock checkout preview only."
        />

        {selectedIntent ? (
          <section className="rounded-[28px] border border-cyan-200/70 bg-white/86 px-5 py-4 shadow-[0_16px_36px_rgba(34,211,238,0.06)] sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Selected billing intent
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-950">{selectedIntent.label}</p>
                <p className="mt-1 text-sm leading-7 text-slate-500">{selectedIntent.detail}</p>
              </div>
              <p className="text-sm font-semibold text-cyan-700 sm:text-right">
                {selectedIntent.priceLabel}
              </p>
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <PortalSectionBand
            title="Current account capacity"
            detail="Live account state, remaining included credits, and current build-slot usage."
          />
          <PortalSummaryRow
            label="Plan status"
            detail={
              snapshot.currentPlan
                ? `${snapshot.currentPlan.label} is the active account plan right now.`
                : "The account is using a custom billing configuration."
            }
            value="Active"
            emphasis="slate"
          />
          <PortalSummaryRow
            label="Credits remaining"
            detail="Current included credit capacity tied to the active plan before any top-up packs."
            value={formatCredits(snapshot.includedCredits)}
            emphasis="slate"
          />
          <PortalSummaryRow
            label="Credits saved"
            detail="Unused included credits still available before the current cycle resets."
            value={formatCredits(snapshot.creditsSaved)}
            emphasis="slate"
          />
          <PortalSummaryRow
            label="Project slots"
            detail="Matches the Current Projects view and excludes archived or legacy records from active slot usage."
            value={projectSlotsValue}
            emphasis="slate"
          />
        </section>

        <section className="space-y-3">
          <PortalSectionBand
            title="Pick the plan that should power the account"
            detail="Recurring plans stay as purchase rows. The blue button shows the actual monthly price."
          />
          {recurringPlans.map((offer) => (
            <PurchaseRow
              key={offer.id}
              title={offer.label}
              detail={offer.detail}
              priceLabel={offer.priceLabel}
              action={startMockPlanCheckout}
              hiddenFields={[{ name: "planId", value: offer.id }]}
              badge={offer.id === currentPlanId ? "Current plan" : undefined}
              selected={readSearchParam(resolvedSearchParams, "plan") === offer.id}
            />
          ))}
        </section>

        <section className="space-y-3">
          <PortalSectionBand
            title="Add extra execution credits"
            detail="Use a credit pack when a heavier build month needs more execution capacity without changing the recurring plan."
          />
          {executionCreditPacks
            .filter((pack) => ["heavy-sprint", "launch-push", "scale-pack"].includes(pack.id))
            .map((pack) => (
              <PurchaseRow
                key={pack.id}
                title={`${pack.credits.toLocaleString("en-US")} Engine Credits`}
                detail={pack.detail}
                priceLabel={`$${pack.price}`}
                action={startMockOneTimeCheckout}
                hiddenFields={[
                  { name: "purchaseKind", value: "credit_pack" },
                  { name: "itemId", value: pack.id }
                ]}
                selected={readSearchParam(resolvedSearchParams, "pack") === pack.id}
              />
            ))}
        </section>

        <section className="space-y-3">
          <PortalSectionBand
            title="Add more project capacity"
            detail="Expand active build-project capacity without changing the rest of the account structure."
          />
          {buildProjectPacks.map((pack) => (
            <PurchaseRow
              key={pack.id}
              title={pack.label}
              detail={pack.detail}
              priceLabel={`$${pack.price}`}
              action={startMockOneTimeCheckout}
              hiddenFields={[
                { name: "purchaseKind", value: "build_project_pack" },
                { name: "itemId", value: pack.id }
              ]}
              selected={readSearchParam(resolvedSearchParams, "pack") === pack.id}
            />
          ))}
        </section>

        <section className="space-y-3">
          <PortalSectionBand
            title="Extend support or delivery"
            detail="Add-ons stay as one-time or recurring support layers without changing the mock-checkout truth."
          />
          {addOnRows.map((addOn) => (
            <PurchaseRow
              key={addOn.id}
              title={addOn.label}
              detail={addOn.detail}
              priceLabel={addOn.pricing}
              action={startMockOneTimeCheckout}
              hiddenFields={[
                { name: "purchaseKind", value: "addon" },
                { name: "itemId", value: addOn.id }
              ]}
              selected={readSearchParam(resolvedSearchParams, "addon") === addOn.id}
            />
          ))}
        </section>
      </div>
    </OuterPortalShell>
  );
}
