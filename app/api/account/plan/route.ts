import { NextResponse } from "next/server";
import {
  buildAccountPlanMetadataUpdate,
  normalizeBillingInterval,
  normalizePlanId,
  resolveAccountPlanAccess
} from "@/lib/account/plan-access";
import {
  ensurePlatformAccountState,
  recordPlatformEvent
} from "@/lib/platform/foundation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Sign in before selecting a plan." },
      { status: 401 }
    );
  }

  let payload: { planId?: unknown; billingInterval?: unknown } | null = null;

  try {
    payload = (await request.json()) as { planId?: unknown; billingInterval?: unknown };
  } catch {
    return NextResponse.json(
      { message: "Plan selection payload could not be read." },
      { status: 400 }
    );
  }

  const planId =
    typeof payload?.planId === "string" ? normalizePlanId(payload.planId) : null;

  if (!planId) {
    return NextResponse.json(
      { message: "Choose a valid Neroa plan before continuing." },
      { status: 400 }
    );
  }

  const billingInterval =
    typeof payload?.billingInterval === "string"
      ? normalizeBillingInterval(payload.billingInterval)
      : "monthly";
  const existingAccess = resolveAccountPlanAccess(user);
  const metadataUpdate = buildAccountPlanMetadataUpdate({
    planId,
    billingInterval,
    existingAccess,
    existingAccountCreatedAt: existingAccess.accountCreatedAt
  });

  const { error } = await supabase.auth.updateUser({
    data: metadataUpdate
  });

  if (error) {
    return NextResponse.json(
      { message: error.message || "Unable to save the selected plan right now." },
      { status: 400 }
    );
  }

  const nextAccess = resolveAccountPlanAccess({
    ...user,
    user_metadata: {
      ...(user.user_metadata ?? {}),
      ...metadataUpdate
    }
  });

  await ensurePlatformAccountState({
    supabase,
    user,
    access: nextAccess,
    billingInterval
  }).catch(() => {
    // Keep plan selection working even before the phase 2 schema is applied.
  });

  await recordPlatformEvent({
    supabase,
    userId: user.id,
    eventType: "plan_selected",
    details: {
      planId,
      billingInterval,
      planStatus: metadataUpdate.plan_status
    }
  }).catch(() => {
    // Platform event storage is optional until the migration is present.
  });

  return NextResponse.json({
    ok: true,
    planId,
    billingInterval,
    planStatus: metadataUpdate.plan_status,
    message:
      planId === "free"
        ? "Free is active now. Choose what you want to build next."
        : "Plan selection saved. Billing will be connected before production launch."
  });
}
