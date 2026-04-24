import {
  getExecutionCreditUsageNotifications,
  getPricingPlan
} from "@/lib/pricing/config";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import {
  syncAccountPlanAccess
} from "@/lib/account/plan-usage-server";
import { getCustomerFacingWorkspacePortfolio } from "@/lib/platform/foundation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

type ServerSupabaseClient = ReturnType<typeof createSupabaseServerClient>;

type AuthenticatedUser = {
  id: string;
  email?: string | null;
  created_at?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
};

export async function getAccountBillingSnapshot(args: {
  supabase: ServerSupabaseClient;
  user: AuthenticatedUser;
}) {
  noStore();
  const portfolio = await getCustomerFacingWorkspacePortfolio({
    supabase: args.supabase,
    userId: args.user.id
  }).catch(() => ({
    currentCount: 0
  }));
  const activeEnginesUsed = portfolio.currentCount;
  const access = await syncAccountPlanAccess({
    supabase: args.supabase,
    user: args.user,
    activeEnginesUsed
  }).catch(() =>
    resolveAccountPlanAccess(args.user, {
      activeEnginesUsed
    })
  );
  const currentPlan = access.selectedPlanId ? getPricingPlan(access.selectedPlanId) : null;
  const includedCredits =
    currentPlan?.capacity.includedExecutionCreditsMonthly ?? access.monthlyEngineCredits;
  const usageNotifications = getExecutionCreditUsageNotifications(
    access.engineCreditsUsed,
    includedCredits
  );
  const creditsSaved =
    includedCredits === null ? null : Math.max(includedCredits - access.engineCreditsUsed, 0);

  return {
    access,
    currentPlan,
    activeProjectsUsed: activeEnginesUsed,
    activeProjectLimit: currentPlan?.capacity.activeBuildProjects ?? null,
    activeProjectLimitNote: currentPlan?.capacity.activeBuildProjectsNote ?? null,
    includedCredits,
    creditsSaved,
    usageNotifications
  };
}
