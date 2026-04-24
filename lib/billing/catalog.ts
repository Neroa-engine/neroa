import {
  executionCreditPacks,
  getLaunchPricingPlans,
  pricingAddOns,
  type BillingIntervalId,
  type ExecutionCreditPack,
  type PricingAddOn,
  type PricingPlan,
  type PricingPlanId
} from "@/lib/pricing/config";
import { APP_ROUTES } from "@/lib/routes";

export type BillingPurchaseKind = "plan" | "credit_pack" | "build_project_pack" | "addon";
export type BillingMode = "recurring" | "one_time";

export type BuildProjectPack = {
  id: string;
  projectSlots: number;
  price: number;
  label: string;
  detail: string;
};

export type BillingCatalogItem = {
  id: string;
  kind: BillingPurchaseKind;
  mode: BillingMode;
  label: string;
  priceLabel: string;
  detail: string;
};

export const buildProjectPacks: BuildProjectPack[] = [
  {
    id: "project-slot-1",
    projectSlots: 1,
    price: 29,
    label: "+1 active build project",
    detail:
      "Adds one extra active build-project slot for teams that need another execution lane without changing plans immediately."
  },
  {
    id: "project-slot-3",
    projectSlots: 3,
    price: 79,
    label: "+3 active build projects",
    detail:
      "A larger project-slot pack for agency-style workflows or teams carrying multiple active builds at once."
  }
] as const;

export function getRecurringPlanOffers() {
  return getLaunchPricingPlans().map((plan) => ({
    id: plan.id,
    kind: "plan" as const,
    mode: "recurring" as const,
    label: plan.label,
    priceLabel: plan.priceMonthly === null ? "Custom" : `$${plan.priceMonthly}/month`,
    detail: plan.bestFor,
    plan
  }));
}

export function getCreditPackOffer(packId: string) {
  return executionCreditPacks.find((pack) => pack.id === packId) ?? null;
}

export function getBuildProjectPack(packId: string) {
  return buildProjectPacks.find((pack) => pack.id === packId) ?? null;
}

export function getAddOnOffer(addOnId: string) {
  return pricingAddOns.find((addOn) => addOn.id === addOnId) ?? null;
}

export function buildBillingIntentPath(args: {
  kind: BillingPurchaseKind;
  planId?: PricingPlanId;
  billingInterval?: BillingIntervalId;
  packId?: string;
  addOnId?: string;
}) {
  const params = new URLSearchParams();
  params.set("kind", args.kind);

  if (args.planId) {
    params.set("plan", args.planId);
  }

  if (args.billingInterval) {
    params.set("interval", args.billingInterval);
  }

  if (args.packId) {
    params.set("pack", args.packId);
  }

  if (args.addOnId) {
    params.set("addon", args.addOnId);
  }

  return `${APP_ROUTES.billing}?${params.toString()}`;
}

export function buildBillingCatalogItem(args: {
  plan?: PricingPlan | null;
  creditPack?: ExecutionCreditPack | null;
  buildProjectPack?: BuildProjectPack | null;
  addOn?: PricingAddOn | null;
}): BillingCatalogItem | null {
  if (args.plan) {
    return {
      id: args.plan.id,
      kind: "plan",
      mode: "recurring",
      label: args.plan.label,
      priceLabel: args.plan.priceMonthly === null ? "Custom" : `$${args.plan.priceMonthly}/month`,
      detail: args.plan.bestFor
    };
  }

  if (args.creditPack) {
    return {
      id: args.creditPack.id,
      kind: "credit_pack",
      mode: "one_time",
      label: `${args.creditPack.credits.toLocaleString("en-US")} Engine Credits`,
      priceLabel: `$${args.creditPack.price}`,
      detail: args.creditPack.detail
    };
  }

  if (args.buildProjectPack) {
    return {
      id: args.buildProjectPack.id,
      kind: "build_project_pack",
      mode: "one_time",
      label: args.buildProjectPack.label,
      priceLabel: `$${args.buildProjectPack.price}`,
      detail: args.buildProjectPack.detail
    };
  }

  if (args.addOn) {
    return {
      id: args.addOn.id,
      kind: "addon",
      mode: "one_time",
      label: args.addOn.label,
      priceLabel: args.addOn.pricing,
      detail: args.addOn.detail
    };
  }

  return null;
}
