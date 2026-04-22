"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import {
  buildBillingCatalogItem,
  getAddOnOffer,
  getBuildProjectPack,
  getCreditPackOffer,
  getRecurringPlanOffers
} from "@/lib/billing/catalog";
import {
  buildMockCheckoutPath,
  createMockCheckoutIntent
} from "@/lib/billing/mock-checkout";
import { recordPlatformEvent } from "@/lib/platform/foundation";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function recordMockCheckoutEvent(args: {
  supabase: ReturnType<typeof createSupabaseServerClient>;
  userId: string;
  kind: string;
  itemId: string;
  itemLabel: string;
}) {
  await recordPlatformEvent({
    supabase: args.supabase,
    userId: args.userId,
    eventType: "mock_checkout_started",
    details: {
      kind: args.kind,
      itemId: args.itemId,
      itemLabel: args.itemLabel
    }
  }).catch(() => {
    // Event logging is additive.
  });
}

export async function startMockPlanCheckout(formData: FormData) {
  const { user } = await requireUser({
    nextPath: "/billing"
  });
  const planId = readString(formData, "planId");
  const planOffer = getRecurringPlanOffers().find((offer) => offer.id === planId);

  if (!planOffer) {
    redirect("/billing?error=Choose+a+valid+plan+before+continuing.");
  }

  const item = buildBillingCatalogItem({
    plan: planOffer.plan
  });

  if (!item) {
    redirect("/billing?error=That+plan+could+not+be+loaded.");
  }

  const intent = createMockCheckoutIntent({
    kind: item.kind,
    mode: item.mode,
    itemId: item.id,
    itemLabel: item.label,
    priceLabel: item.priceLabel,
    detail: item.detail
  });

  const supabase = createSupabaseServerClient();
  await recordMockCheckoutEvent({
    supabase,
    userId: user.id,
    kind: item.kind,
    itemId: item.id,
    itemLabel: item.label
  });

  redirect(buildMockCheckoutPath(intent));
}

export async function startMockOneTimeCheckout(formData: FormData) {
  const { user } = await requireUser({
    nextPath: "/billing"
  });
  const kind = readString(formData, "purchaseKind");
  const itemId = readString(formData, "itemId");
  const item =
    kind === "credit_pack"
      ? buildBillingCatalogItem({
          creditPack: getCreditPackOffer(itemId)
        })
      : kind === "build_project_pack"
        ? buildBillingCatalogItem({
            buildProjectPack: getBuildProjectPack(itemId)
          })
        : kind === "addon"
          ? buildBillingCatalogItem({
              addOn: getAddOnOffer(itemId)
            })
          : null;

  if (!item) {
    redirect("/billing?error=Choose+a+valid+purchase+option+before+continuing.");
  }

  const intent = createMockCheckoutIntent({
    kind: item.kind,
    mode: item.mode,
    itemId: item.id,
    itemLabel: item.label,
    priceLabel: item.priceLabel,
    detail: item.detail
  });

  const supabase = createSupabaseServerClient();
  await recordMockCheckoutEvent({
    supabase,
    userId: user.id,
    kind: item.kind,
    itemId: item.id,
    itemLabel: item.label
  });

  redirect(buildMockCheckoutPath(intent));
}
