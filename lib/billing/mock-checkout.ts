import type { BillingMode, BillingPurchaseKind } from "@/lib/billing/catalog";

export type MockCheckoutIntent = {
  id: string;
  kind: BillingPurchaseKind;
  mode: BillingMode;
  itemId: string;
  itemLabel: string;
  priceLabel: string;
  detail: string;
  status: "mock_pending";
  message: string;
};

function randomSegment() {
  return Math.random().toString(36).slice(2, 8);
}

export function createMockCheckoutIntent(args: {
  kind: BillingPurchaseKind;
  mode: BillingMode;
  itemId: string;
  itemLabel: string;
  priceLabel: string;
  detail: string;
}): MockCheckoutIntent {
  return {
    id: `mockchk_${Date.now().toString(36)}_${randomSegment()}`,
    kind: args.kind,
    mode: args.mode,
    itemId: args.itemId,
    itemLabel: args.itemLabel,
    priceLabel: args.priceLabel,
    detail: args.detail,
    status: "mock_pending",
    message:
      "Billing integration is not live yet. This mock checkout shows the exact product and entitlement target that Stripe will handle later."
  };
}

export function buildMockCheckoutPath(intent: MockCheckoutIntent) {
  const params = new URLSearchParams();
  params.set("intent", intent.id);
  params.set("kind", intent.kind);
  params.set("mode", intent.mode);
  params.set("item", intent.itemId);
  params.set("label", intent.itemLabel);
  params.set("price", intent.priceLabel);
  params.set("detail", intent.detail);
  params.set("status", intent.status);
  params.set("message", intent.message);
  return `/billing/checkout?${params.toString()}`;
}
