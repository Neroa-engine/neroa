import {
  buildActiveEngineLimitMessage,
  buildCreditsExceededMessage,
  buildMonthlyUsageResetMetadataUpdate,
  buildUsageConsumptionMetadataUpdate,
  engineCreditCosts,
  resolveAccountPlanAccess,
  type AccountPlanAccess
} from "@/lib/account/plan-access";
import {
  ensurePlatformAccountState,
  getCustomerFacingWorkspacePortfolio
} from "@/lib/platform/foundation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerSupabaseClient = ReturnType<typeof createSupabaseServerClient>;

type AuthenticatedUser = {
  id: string;
  email?: string | null;
  created_at?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
};

function mergeUserMetadata(user: AuthenticatedUser, data: Record<string, unknown>) {
  return {
    ...user,
    user_metadata: {
      ...(user.user_metadata ?? {}),
      ...data
    }
  };
}

async function updateUsageMetadata(
  supabase: ServerSupabaseClient,
  data: Record<string, unknown>
) {
  const { error } = await supabase.auth.updateUser({
    data
  });

  if (error) {
    throw new Error(error.message || "Unable to sync account usage.");
  }
}

export async function countActiveEnginesForUser(
  supabase: ServerSupabaseClient,
  userId: string
) {
  const portfolio = await getCustomerFacingWorkspacePortfolio({
    supabase,
    userId
  });

  return portfolio.currentCount;
}

export async function syncAccountPlanAccess(args: {
  supabase: ServerSupabaseClient;
  user: AuthenticatedUser;
  activeEnginesUsed?: number;
  seatsUsed?: number;
}) {
  const activeEnginesUsed =
    typeof args.activeEnginesUsed === "number"
      ? args.activeEnginesUsed
      : await countActiveEnginesForUser(args.supabase, args.user.id);
  let access = resolveAccountPlanAccess(args.user, {
    activeEnginesUsed,
    seatsUsed: args.seatsUsed
  });

  if (access.hasSelectedPlan && access.monthlyResetDate && access.engineCreditsRemaining !== null) {
    const resetDate = new Date(access.monthlyResetDate);

    if (!access.isAdmin && !Number.isNaN(resetDate.getTime()) && Date.now() >= resetDate.getTime()) {
      const metadataUpdate = buildMonthlyUsageResetMetadataUpdate(access, {
        activeEnginesUsed,
        seatsUsed: args.seatsUsed
      });
      await updateUsageMetadata(args.supabase, metadataUpdate);
      access = resolveAccountPlanAccess(mergeUserMetadata(args.user, metadataUpdate), {
        activeEnginesUsed,
        seatsUsed: args.seatsUsed
      });
    }
  }

  await ensurePlatformAccountState({
    supabase: args.supabase,
    user: args.user,
    access
  }).catch(() => {
    // Keep the product usable even before the phase 2 schema is applied.
  });

  return access;
}

export async function syncActiveEngineUsage(args: {
  supabase: ServerSupabaseClient;
  user: AuthenticatedUser;
  activeEnginesUsed: number;
  seatsUsed?: number;
}) {
  const access = await syncAccountPlanAccess({
    supabase: args.supabase,
    user: args.user,
    activeEnginesUsed: args.activeEnginesUsed,
    seatsUsed: args.seatsUsed
  });
  const metadataUpdate = buildUsageConsumptionMetadataUpdate(access, {
    activeEnginesUsed: args.activeEnginesUsed,
    seatsUsed: args.seatsUsed
  });

  await updateUsageMetadata(args.supabase, metadataUpdate);

  return resolveAccountPlanAccess(mergeUserMetadata(args.user, metadataUpdate), {
    activeEnginesUsed: args.activeEnginesUsed,
    seatsUsed: args.seatsUsed
  });
}

export function assertCanCreateEngine(access: AccountPlanAccess) {
  if (!access.hasSelectedPlan) {
    throw new Error("Choose a plan before creating your engine.");
  }

  if (
    !access.isAdmin &&
    access.activeEngineLimit !== null &&
    access.activeEnginesUsed >= access.activeEngineLimit
  ) {
    throw new Error(buildActiveEngineLimitMessage(access));
  }

  if (
    !access.isAdmin &&
    access.monthlyEngineCredits !== null &&
    access.engineCreditsRemaining !== null &&
    access.engineCreditsRemaining < engineCreditCosts.engineCreationFromTemplate
  ) {
    throw new Error(buildCreditsExceededMessage(access));
  }
}

export async function consumeEngineCreationCredits(args: {
  supabase: ServerSupabaseClient;
  user: AuthenticatedUser;
  activeEnginesUsed: number;
}) {
  const access = await syncAccountPlanAccess({
    supabase: args.supabase,
    user: args.user,
    activeEnginesUsed: args.activeEnginesUsed
  });
  const metadataUpdate = buildUsageConsumptionMetadataUpdate(access, {
    creditsToAdd: access.isAdmin ? 0 : engineCreditCosts.engineCreationFromTemplate,
    activeEnginesUsed: args.activeEnginesUsed
  });

  await updateUsageMetadata(args.supabase, metadataUpdate);

  return resolveAccountPlanAccess(mergeUserMetadata(args.user, metadataUpdate), {
    activeEnginesUsed: args.activeEnginesUsed
  });
}

export async function consumeAiChatCredits(args: {
  supabase: ServerSupabaseClient;
  user: AuthenticatedUser;
  creditsToAdd?: number;
}) {
  const activeEnginesUsed = await countActiveEnginesForUser(args.supabase, args.user.id);
  const access = await syncAccountPlanAccess({
    supabase: args.supabase,
    user: args.user,
    activeEnginesUsed
  });
  const creditCost = args.creditsToAdd ?? engineCreditCosts.aiChatMessage;

  if (
    !access.isAdmin &&
    access.monthlyEngineCredits !== null &&
    access.engineCreditsRemaining !== null &&
    access.engineCreditsRemaining < creditCost
  ) {
    throw new Error(buildCreditsExceededMessage(access));
  }

  const metadataUpdate = buildUsageConsumptionMetadataUpdate(access, {
    creditsToAdd: access.isAdmin ? 0 : creditCost,
    activeEnginesUsed
  });

  await updateUsageMetadata(args.supabase, metadataUpdate);

  return resolveAccountPlanAccess(mergeUserMetadata(args.user, metadataUpdate), {
    activeEnginesUsed
  });
}
