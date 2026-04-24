import type { AccountPlanAccess } from "@/lib/account/plan-access";
import type { BillingIntervalId } from "@/lib/pricing/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";

export type ServerSupabaseClient = ReturnType<typeof createSupabaseServerClient>;

export type PlatformUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export type AccessibleWorkspaceRecord = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  owner_id: string;
  accessMode: "owner" | "member";
};

export type PlatformQueryError = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
};

export type PlatformEventSeverity = "info" | "warning" | "error";

export type RecommendationSummaryPayload = {
  frameworkId: string | null;
  frameworkLabel: string | null;
  recommendedTierId: string | null;
  recommendedTierLabel: string | null;
  complexityScore: number | null;
  complexityLabel: string | null;
  executionIntensity: string | null;
  moduleIds: string[];
};

function errorText(error: unknown) {
  if (!error || typeof error !== "object") {
    return "";
  }

  const record = error as PlatformQueryError;

  return [record.code, record.message, record.details, record.hint]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ");
}

export function isMissingPlatformTableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as PlatformQueryError;
  const text = errorText(error).toLowerCase();

  return (
    record.code === "42P01" ||
    record.code === "42703" ||
    record.code === "PGRST204" ||
    record.code === "PGRST205" ||
    text.includes("does not exist") ||
    text.includes("schema cache") ||
    text.includes("could not find the table") ||
    text.includes("could not find the column")
  );
}

export function normalizeEmail(user: { email?: string | null }) {
  return user.email?.trim().toLowerCase() ?? null;
}

export function buildDisplayName(user: { user_metadata?: Record<string, unknown> | null }) {
  const record = (user.user_metadata ?? {}) as Record<string, unknown>;

  for (const key of ["full_name", "name", "display_name"]) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function buildPersonalOrganizationName(user: PlatformUser) {
  const displayName = buildDisplayName(user);

  if (displayName) {
    return `${displayName}'s Neroa workspace`;
  }

  const email = normalizeEmail(user);

  if (email) {
    return `${email.split("@")[0]} workspace`;
  }

  return "Personal workspace";
}

function billingIntervalValue(
  access: AccountPlanAccess,
  billingInterval?: BillingIntervalId | null
) {
  return billingInterval ?? access.billingInterval;
}

export function buildQuotaRow(args: {
  user: Pick<PlatformUser, "id">;
  access: AccountPlanAccess;
  billingInterval?: BillingIntervalId | null;
}) {
  const now = new Date().toISOString();

  return {
    user_id: args.user.id,
    selected_plan_id: args.access.selectedPlanId,
    billing_interval: billingIntervalValue(args.access, args.billingInterval),
    plan_status: args.access.planStatus,
    billing_required: args.access.billingRequired,
    billing_exempt: args.access.billingExempt,
    plan_override: args.access.planOverride,
    monthly_engine_credits: args.access.monthlyEngineCredits,
    engine_credits_used: args.access.engineCreditsUsed,
    engine_credits_remaining: args.access.engineCreditsRemaining,
    active_engine_limit: args.access.activeEngineLimit,
    active_engines_used: args.access.activeEnginesUsed,
    seat_limit: args.access.seatLimit,
    seats_used: args.access.seatsUsed,
    overages_allowed: args.access.overagesAllowed,
    deploy_allowed: args.access.deployAllowed,
    launch_allowed: args.access.launchAllowed,
    max_workflow_stage: args.access.maxWorkflowStage,
    max_advanced_modules: args.access.maxAdvancedModules,
    advanced_modules_used: args.access.advancedModulesUsed,
    max_ai_heavy_runs: args.access.maxAiHeavyRuns,
    ai_heavy_runs_used: args.access.aiHeavyRunsUsed,
    max_collaborative_workflows: args.access.maxCollaborativeWorkflows,
    collaborative_workflows_used: args.access.collaborativeWorkflowsUsed,
    premium_build_categories: args.access.premiumBuildCategories,
    monthly_reset_date: args.access.monthlyResetDate,
    updated_at: now
  };
}

export function buildProfileRow(args: {
  user: PlatformUser;
  access: AccountPlanAccess;
  billingInterval?: BillingIntervalId | null;
}) {
  const now = new Date().toISOString();

  return {
    user_id: args.user.id,
    email: normalizeEmail(args.user),
    display_name: buildDisplayName(args.user),
    selected_plan_id: args.access.selectedPlanId,
    billing_interval: billingIntervalValue(args.access, args.billingInterval),
    plan_status: args.access.planStatus,
    billing_required: args.access.billingRequired,
    billing_exempt: args.access.billingExempt,
    account_created_at: args.access.accountCreatedAt ?? args.access.createdAt ?? now,
    last_seen_at: now,
    updated_at: now
  };
}

export function buildOrganizationSlug(userId: string) {
  return `personal-${userId}`.toLowerCase();
}

function slugifyId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildRecommendationSummary(metadata: StoredProjectMetadata | null): RecommendationSummaryPayload | null {
  const buildSession = metadata?.buildSession ?? null;

  if (!buildSession) {
    return null;
  }

  const moduleIds = [
    ...(buildSession.scope.keyModules ?? []),
    ...(buildSession.scope.firstBuild ?? [])
  ]
    .map((item) => slugifyId(item))
    .filter(Boolean);

  return {
    frameworkId: buildSession.scope.frameworkId ?? null,
    frameworkLabel: buildSession.scope.frameworkLabel ?? null,
    recommendedTierId: null,
    recommendedTierLabel: null,
    complexityScore: null,
    complexityLabel: null,
    executionIntensity:
      buildSession.path.recommendedPathMode === "managed"
        ? "High"
        : buildSession.path.recommendedPathMode === "diy"
          ? "Moderate"
          : null,
    moduleIds
  };
}

export async function safeUpsert(
  operation: PromiseLike<{ error: PlatformQueryError | null }>
) {
  const { error } = await operation;

  if (error && !isMissingPlatformTableError(error)) {
    throw new Error(error.message || "Unable to persist platform state.");
  }

  return !error;
}

export function planRank(planId: string | null | undefined) {
  const order = ["free", "starter", "builder", "pro", "command-center"];

  return planId ? order.indexOf(planId) : -1;
}
