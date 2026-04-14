import {
  getPricingPlan,
  type BillingIntervalId,
  type PricingPlanId
} from "@/lib/pricing/config";

const ADMIN_OVERRIDE_EMAIL = "admin@neroa.io";

type MetadataRecord = Record<string, unknown> | null | undefined;

export type WorkflowStageId =
  | "strategy"
  | "scope"
  | "mvp"
  | "budget"
  | "test"
  | "build"
  | "launch"
  | "operate";

export type LaunchPermission = boolean | "limited";

type PlanPolicy = {
  billingRequired: boolean;
  defaultPlanStatus: "active" | "pending_billing";
  overagesAllowed: boolean;
  deployAllowed: boolean;
  launchAllowed: LaunchPermission;
  maxWorkflowStage: WorkflowStageId | "all";
  maxAdvancedModules: number | null;
  maxAiHeavyRuns: number | null;
  maxCollaborativeWorkflows: number | null;
  premiumBuildCategories: string[];
};

export type AccountPlanAccess = {
  selectedPlanId: PricingPlanId | null;
  planName: string | null;
  billingInterval: BillingIntervalId;
  planStatus: string | null;
  hasSelectedPlan: boolean;
  isAdmin: boolean;
  billingExempt: boolean;
  planOverride: "all_access" | null;
  accountCreatedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  billingRequired: boolean;
  monthlyEngineCredits: number | null;
  engineCreditsUsed: number;
  engineCreditsRemaining: number | null;
  activeEngineLimit: number | null;
  activeEnginesUsed: number;
  seatLimit: number | null;
  seatsUsed: number;
  overagesAllowed: boolean;
  deployAllowed: boolean;
  launchAllowed: LaunchPermission;
  maxWorkflowStage: WorkflowStageId | "all";
  maxAdvancedModules: number | null;
  advancedModulesUsed: number;
  maxAiHeavyRuns: number | null;
  aiHeavyRunsUsed: number;
  maxCollaborativeWorkflows: number | null;
  collaborativeWorkflowsUsed: number;
  premiumBuildCategories: string[];
  monthlyResetDate: string | null;
};

export const engineCreditCosts = {
  engineCreationFromTemplate: 50,
  strategyGeneration: 25,
  scopeGeneration: 25,
  mvpGeneration: 35,
  budgetPreview: 15,
  testPreview: 15,
  aiChatMessage: 5,
  buildOrDeployAction: 90
} as const;

const workflowStageOrder: WorkflowStageId[] = [
  "strategy",
  "scope",
  "mvp",
  "budget",
  "test",
  "build",
  "launch",
  "operate"
];

const planPolicyRegistry: Record<PricingPlanId, PlanPolicy> = {
  free: {
    billingRequired: false,
    defaultPlanStatus: "active",
    overagesAllowed: false,
    deployAllowed: false,
    launchAllowed: false,
    maxWorkflowStage: "mvp",
    maxAdvancedModules: 0,
    maxAiHeavyRuns: 10,
    maxCollaborativeWorkflows: 0,
    premiumBuildCategories: ["saas", "internal-app", "external-app", "mobile-app"]
  },
  starter: {
    billingRequired: true,
    defaultPlanStatus: "pending_billing",
    overagesAllowed: false,
    deployAllowed: true,
    launchAllowed: "limited",
    maxWorkflowStage: "test",
    maxAdvancedModules: 2,
    maxAiHeavyRuns: 50,
    maxCollaborativeWorkflows: 4,
    premiumBuildCategories: ["saas", "internal-app", "external-app", "mobile-app"]
  },
  builder: {
    billingRequired: true,
    defaultPlanStatus: "pending_billing",
    overagesAllowed: false,
    deployAllowed: true,
    launchAllowed: true,
    maxWorkflowStage: "launch",
    maxAdvancedModules: 5,
    maxAiHeavyRuns: 200,
    maxCollaborativeWorkflows: 20,
    premiumBuildCategories: ["saas", "internal-app", "external-app", "mobile-app"]
  },
  pro: {
    billingRequired: true,
    defaultPlanStatus: "pending_billing",
    overagesAllowed: false,
    deployAllowed: true,
    launchAllowed: true,
    maxWorkflowStage: "operate",
    maxAdvancedModules: 10,
    maxAiHeavyRuns: 600,
    maxCollaborativeWorkflows: 60,
    premiumBuildCategories: ["saas", "internal-app", "external-app", "mobile-app"]
  },
  "command-center": {
    billingRequired: true,
    defaultPlanStatus: "pending_billing",
    overagesAllowed: false,
    deployAllowed: true,
    launchAllowed: true,
    maxWorkflowStage: "operate",
    maxAdvancedModules: null,
    maxAiHeavyRuns: null,
    maxCollaborativeWorkflows: null,
    premiumBuildCategories: ["saas", "internal-app", "external-app", "mobile-app"]
  }
};

function getMetadataValue(metadata: MetadataRecord, keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getMetadataNumber(metadata: MetadataRecord, keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function getMetadataBoolean(metadata: MetadataRecord, keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();

      if (normalized === "true") {
        return true;
      }

      if (normalized === "false") {
        return false;
      }
    }
  }

  return null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : null;
}

function normalizeLaunchPermission(value: unknown): LaunchPermission | null {
  if (value === true || value === false || value === "limited") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }

    if (normalized === "limited") {
      return "limited";
    }
  }

  return null;
}

export function normalizePlanId(value: string | null): PricingPlanId | null {
  if (value === "agency") {
    return "command-center";
  }

  if (
    value === "free" ||
    value === "starter" ||
    value === "builder" ||
    value === "pro" ||
    value === "command-center"
  ) {
    return value;
  }

  return null;
}

export function normalizeBillingInterval(value: string | null): BillingIntervalId {
  return value === "annual" ? "annual" : "monthly";
}

function normalizeWorkflowStage(value: string | null): WorkflowStageId | "all" | null {
  if (
    value === "strategy" ||
    value === "scope" ||
    value === "mvp" ||
    value === "budget" ||
    value === "test" ||
    value === "build" ||
    value === "launch" ||
    value === "operate" ||
    value === "all"
  ) {
    return value;
  }

  return null;
}

function resolvePlanPolicy(planId: PricingPlanId | null) {
  if (!planId) {
    return null;
  }

  const plan = getPricingPlan(planId);
  const overrides = planPolicyRegistry[planId];

  return {
    planName: plan?.label ?? null,
    monthlyEngineCredits: plan?.capacity.includedExecutionCreditsMonthly ?? null,
    activeEngineLimit: plan?.capacity.activeWorkspaces ?? null,
    seatLimit: plan?.capacity.teamSeatsIncluded ?? null,
    ...overrides
  };
}

export function computeNextMonthlyResetDate(fromDate = new Date()) {
  const next = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth() + 1, 1));
  return next.toISOString();
}

export function needsMonthlyUsageReset(
  access: Pick<AccountPlanAccess, "monthlyResetDate" | "isAdmin">
) {
  if (access.isAdmin || !access.monthlyResetDate) {
    return false;
  }

  const resetAt = new Date(access.monthlyResetDate);

  if (Number.isNaN(resetAt.getTime())) {
    return false;
  }

  return Date.now() >= resetAt.getTime();
}

function getStageRank(stage: WorkflowStageId | "all") {
  if (stage === "all") {
    return Number.POSITIVE_INFINITY;
  }

  return workflowStageOrder.indexOf(stage);
}

export function resolveRequiredWorkflowStage(args: {
  laneTitle?: string | null;
  laneSlug?: string | null;
}) {
  const text = `${args.laneTitle ?? ""} ${args.laneSlug ?? ""}`.trim().toLowerCase();

  if (!text) {
    return "strategy" as const;
  }

  if (text.includes("scope")) {
    return "scope" as const;
  }

  if (text.includes("mvp")) {
    return "mvp" as const;
  }

  if (text.includes("budget")) {
    return "budget" as const;
  }

  if (text.includes("test")) {
    return "test" as const;
  }

  if (text.includes("build")) {
    return "build" as const;
  }

  if (
    text.includes("launch") ||
    text.includes("deployment") ||
    text.includes("release") ||
    text.includes("publish")
  ) {
    return "launch" as const;
  }

  if (text.includes("operate") || text.includes("operations")) {
    return "operate" as const;
  }

  return "strategy" as const;
}

export function isWorkflowStageAllowed(
  access: Pick<AccountPlanAccess, "isAdmin" | "maxWorkflowStage">,
  requiredStage: WorkflowStageId
) {
  if (access.isAdmin || access.maxWorkflowStage === "all") {
    return true;
  }

  return getStageRank(requiredStage) <= getStageRank(access.maxWorkflowStage);
}

export function buildCreditsExceededMessage(
  access: Pick<AccountPlanAccess, "selectedPlanId">
) {
  if (access.selectedPlanId === "free") {
    return "You’ve used your Free Engine Credits for this month. Upgrade to continue building.";
  }

  return "You’ve used the included Engine Credits for this month. Upgrade or add more capacity to continue building.";
}

export function buildActiveEngineLimitMessage(
  access: Pick<AccountPlanAccess, "selectedPlanId" | "activeEngineLimit">
) {
  if (access.selectedPlanId === "free") {
    return "Free includes 1 active Engine. Upgrade to create more Engines.";
  }

  if (access.activeEngineLimit === null) {
    return "This plan needs a higher engine allowance before another Engine can be created.";
  }

  return `This plan includes ${access.activeEngineLimit} active ${
    access.activeEngineLimit === 1 ? "Engine" : "Engines"
  }. Upgrade to create more.`;
}

export function buildWorkflowUpgradeMessage(
  access: Pick<AccountPlanAccess, "selectedPlanId" | "maxWorkflowStage">,
  requiredStage: WorkflowStageId
) {
  if (access.selectedPlanId === "free") {
    if (requiredStage === "budget" || requiredStage === "test") {
      return "Free includes preview-only budget and test guidance. Upgrade to continue deeper work in this stage.";
    }

    return "Free gets your idea to MVP planning. Upgrade to continue into build, deployment, and launch.";
  }

  if (access.selectedPlanId === "starter") {
    return "Starter is designed for Strategy, Scope, MVP, Budget, and Test. Upgrade to continue into build, deployment, and launch.";
  }

  if (access.selectedPlanId === "builder" && requiredStage === "operate") {
    return "Builder supports deeper execution and launch. Upgrade to Pro to continue into ongoing operating workflows.";
  }

  return "Upgrade your plan to continue into this stage.";
}

export function resolveAccountPlanAccess(
  user: {
    email?: string | null;
    created_at?: string | null;
    app_metadata?: MetadataRecord;
    user_metadata?: MetadataRecord;
  } | null,
  options?: {
    activeEnginesUsed?: number;
    seatsUsed?: number;
    now?: Date;
  }
): AccountPlanAccess {
  const email = user?.email?.trim().toLowerCase() ?? "";
  const isAdmin = email === ADMIN_OVERRIDE_EMAIL;
  const metadataPlan =
    normalizePlanId(
      getMetadataValue(user?.app_metadata, ["selected_plan", "plan", "subscription_tier", "tier"]) ??
        getMetadataValue(user?.user_metadata, ["selected_plan", "plan", "subscription_tier", "tier"])
    ) ?? null;
  const selectedPlanId = isAdmin ? "command-center" : metadataPlan;
  const policy = resolvePlanPolicy(selectedPlanId);
  const billingInterval = normalizeBillingInterval(
    getMetadataValue(user?.app_metadata, ["billing_interval"]) ??
      getMetadataValue(user?.user_metadata, ["billing_interval"])
  );
  const planStatus =
    (isAdmin ? "active" : null) ??
    getMetadataValue(user?.app_metadata, ["plan_status", "subscription_status"]) ??
    getMetadataValue(user?.user_metadata, ["plan_status", "subscription_status"]) ??
    policy?.defaultPlanStatus ??
    null;
  const accountCreatedAt =
    getMetadataValue(user?.user_metadata, ["account_created_at", "created_at"]) ??
    getMetadataValue(user?.app_metadata, ["account_created_at", "created_at"]) ??
    user?.created_at ??
    null;
  const createdAt =
    getMetadataValue(user?.user_metadata, ["created_at"]) ??
    getMetadataValue(user?.app_metadata, ["created_at"]) ??
    accountCreatedAt;
  const updatedAt =
    getMetadataValue(user?.user_metadata, ["updated_at"]) ??
    getMetadataValue(user?.app_metadata, ["updated_at"]) ??
    null;
  const monthlyResetDate =
    getMetadataValue(user?.user_metadata, ["monthly_reset_date"]) ??
    getMetadataValue(user?.app_metadata, ["monthly_reset_date"]) ??
    (selectedPlanId ? computeNextMonthlyResetDate(options?.now) : null);
  const resetDue =
    !isAdmin &&
    Boolean(monthlyResetDate) &&
    needsMonthlyUsageReset({
      monthlyResetDate,
      isAdmin
    });
  const metadataCreditsUsed =
    getMetadataNumber(user?.user_metadata, ["engine_credits_used"]) ??
    getMetadataNumber(user?.app_metadata, ["engine_credits_used"]) ??
    0;
  const monthlyEngineCredits =
    getMetadataNumber(user?.user_metadata, ["monthly_engine_credits"]) ??
    getMetadataNumber(user?.app_metadata, ["monthly_engine_credits"]) ??
    policy?.monthlyEngineCredits ??
    null;
  const engineCreditsUsed = resetDue ? 0 : metadataCreditsUsed;
  const engineCreditsRemaining =
    monthlyEngineCredits === null ? null : Math.max(monthlyEngineCredits - engineCreditsUsed, 0);
  const activeEngineLimit =
    getMetadataNumber(user?.user_metadata, ["active_engine_limit"]) ??
    getMetadataNumber(user?.app_metadata, ["active_engine_limit"]) ??
    policy?.activeEngineLimit ??
    null;
  const activeEnginesUsed =
    options?.activeEnginesUsed ??
    getMetadataNumber(user?.user_metadata, ["active_engines_used"]) ??
    getMetadataNumber(user?.app_metadata, ["active_engines_used"]) ??
    0;
  const seatLimit =
    getMetadataNumber(user?.user_metadata, ["seat_limit"]) ??
    getMetadataNumber(user?.app_metadata, ["seat_limit"]) ??
    policy?.seatLimit ??
    null;
  const seatsUsed =
    options?.seatsUsed ??
    getMetadataNumber(user?.user_metadata, ["seats_used"]) ??
    getMetadataNumber(user?.app_metadata, ["seats_used"]) ??
    1;
  const billingRequired =
    getMetadataBoolean(user?.user_metadata, ["billing_required"]) ??
    getMetadataBoolean(user?.app_metadata, ["billing_required"]) ??
    policy?.billingRequired ??
    false;
  const overagesAllowed =
    getMetadataBoolean(user?.user_metadata, ["overages_allowed"]) ??
    getMetadataBoolean(user?.app_metadata, ["overages_allowed"]) ??
    policy?.overagesAllowed ??
    false;
  const deployAllowed =
    getMetadataBoolean(user?.user_metadata, ["deploy_allowed"]) ??
    getMetadataBoolean(user?.app_metadata, ["deploy_allowed"]) ??
    policy?.deployAllowed ??
    false;
  const launchAllowed =
    normalizeLaunchPermission(user?.user_metadata?.["launch_allowed"]) ??
    normalizeLaunchPermission(user?.app_metadata?.["launch_allowed"]) ??
    policy?.launchAllowed ??
    false;
  const maxWorkflowStage =
    normalizeWorkflowStage(
      getMetadataValue(user?.user_metadata, ["max_workflow_stage"]) ??
        getMetadataValue(user?.app_metadata, ["max_workflow_stage"])
    ) ??
    policy?.maxWorkflowStage ??
    "all";
  const maxAdvancedModules =
    getMetadataNumber(user?.user_metadata, ["max_advanced_modules"]) ??
    getMetadataNumber(user?.app_metadata, ["max_advanced_modules"]) ??
    policy?.maxAdvancedModules ??
    null;
  const advancedModulesUsed =
    getMetadataNumber(user?.user_metadata, ["advanced_modules_used"]) ??
    getMetadataNumber(user?.app_metadata, ["advanced_modules_used"]) ??
    0;
  const maxAiHeavyRuns =
    getMetadataNumber(user?.user_metadata, ["max_ai_heavy_runs"]) ??
    getMetadataNumber(user?.app_metadata, ["max_ai_heavy_runs"]) ??
    policy?.maxAiHeavyRuns ??
    null;
  const aiHeavyRunsUsed =
    getMetadataNumber(user?.user_metadata, ["ai_heavy_runs_used"]) ??
    getMetadataNumber(user?.app_metadata, ["ai_heavy_runs_used"]) ??
    0;
  const maxCollaborativeWorkflows =
    getMetadataNumber(user?.user_metadata, ["max_collaborative_workflows"]) ??
    getMetadataNumber(user?.app_metadata, ["max_collaborative_workflows"]) ??
    policy?.maxCollaborativeWorkflows ??
    null;
  const collaborativeWorkflowsUsed =
    getMetadataNumber(user?.user_metadata, ["collaborative_workflows_used"]) ??
    getMetadataNumber(user?.app_metadata, ["collaborative_workflows_used"]) ??
    0;
  const premiumBuildCategories =
    normalizeStringArray(
      user?.user_metadata?.["premium_build_categories"] ??
        user?.app_metadata?.["premium_build_categories"]
    ) ??
    policy?.premiumBuildCategories ??
    [];
  const effectiveMonthlyEngineCredits = isAdmin ? null : monthlyEngineCredits;
  const effectiveEngineCreditsRemaining = isAdmin ? null : engineCreditsRemaining;
  const effectiveActiveEngineLimit = isAdmin ? null : activeEngineLimit;

  return {
    selectedPlanId,
    planName: policy?.planName ?? null,
    billingInterval,
    planStatus,
    hasSelectedPlan: Boolean(selectedPlanId),
    isAdmin,
    billingExempt: isAdmin,
    planOverride: isAdmin ? "all_access" : null,
    accountCreatedAt,
    createdAt,
    updatedAt,
    billingRequired: isAdmin ? false : billingRequired,
    monthlyEngineCredits: effectiveMonthlyEngineCredits,
    engineCreditsUsed,
    engineCreditsRemaining: effectiveEngineCreditsRemaining,
    activeEngineLimit: effectiveActiveEngineLimit,
    activeEnginesUsed,
    seatLimit,
    seatsUsed,
    overagesAllowed: isAdmin ? true : overagesAllowed,
    deployAllowed: isAdmin ? true : deployAllowed,
    launchAllowed: isAdmin ? true : launchAllowed,
    maxWorkflowStage: isAdmin ? "all" : maxWorkflowStage,
    maxAdvancedModules: isAdmin ? null : maxAdvancedModules,
    advancedModulesUsed: isAdmin ? 0 : advancedModulesUsed,
    maxAiHeavyRuns: isAdmin ? null : maxAiHeavyRuns,
    aiHeavyRunsUsed: isAdmin ? 0 : aiHeavyRunsUsed,
    maxCollaborativeWorkflows: isAdmin ? null : maxCollaborativeWorkflows,
    collaborativeWorkflowsUsed: isAdmin ? 0 : collaborativeWorkflowsUsed,
    premiumBuildCategories,
    monthlyResetDate
  };
}

export function buildAccountPlanMetadataUpdate(args: {
  planId: PricingPlanId;
  billingInterval: BillingIntervalId;
  existingAccess?: AccountPlanAccess | null;
  existingAccountCreatedAt?: string | null;
}) {
  const now = new Date();
  const policy = resolvePlanPolicy(args.planId);
  const preservedUsage =
    args.existingAccess?.selectedPlanId === args.planId &&
    args.existingAccess.monthlyResetDate &&
    !needsMonthlyUsageReset(args.existingAccess)
      ? args.existingAccess.engineCreditsUsed
      : 0;
  const preservedResetDate =
    args.existingAccess?.selectedPlanId === args.planId &&
    args.existingAccess.monthlyResetDate &&
    !needsMonthlyUsageReset(args.existingAccess)
      ? args.existingAccess.monthlyResetDate
      : computeNextMonthlyResetDate(now);
  const activeEnginesUsed = args.existingAccess?.activeEnginesUsed ?? 0;
  const seatsUsed = args.existingAccess?.seatsUsed ?? 1;
  const monthlyEngineCredits = policy?.monthlyEngineCredits ?? null;

  return {
    selected_plan: args.planId,
    plan: args.planId,
    plan_name: policy?.planName ?? args.planId,
    billing_interval: args.billingInterval,
    plan_status: policy?.defaultPlanStatus ?? "pending_billing",
    billing_required: policy?.billingRequired ?? true,
    overages_allowed: policy?.overagesAllowed ?? false,
    monthly_engine_credits: monthlyEngineCredits,
    engine_credits_used: preservedUsage,
    engine_credits_remaining:
      monthlyEngineCredits === null ? null : Math.max(monthlyEngineCredits - preservedUsage, 0),
    active_engine_limit: policy?.activeEngineLimit ?? null,
    active_engines_used: activeEnginesUsed,
    seat_limit: policy?.seatLimit ?? null,
    seats_used: seatsUsed,
    deploy_allowed: policy?.deployAllowed ?? false,
    launch_allowed: policy?.launchAllowed ?? false,
    max_workflow_stage: policy?.maxWorkflowStage ?? "all",
    max_advanced_modules: policy?.maxAdvancedModules ?? null,
    advanced_modules_used: args.existingAccess?.advancedModulesUsed ?? 0,
    max_ai_heavy_runs: policy?.maxAiHeavyRuns ?? null,
    ai_heavy_runs_used: args.existingAccess?.aiHeavyRunsUsed ?? 0,
    max_collaborative_workflows: policy?.maxCollaborativeWorkflows ?? null,
    collaborative_workflows_used: args.existingAccess?.collaborativeWorkflowsUsed ?? 0,
    premium_build_categories: policy?.premiumBuildCategories ?? [],
    monthly_reset_date: preservedResetDate,
    free_plan: args.planId === "free",
    trial_flag: args.planId === "free" ? "free-plan" : null,
    account_created_at:
      args.existingAccess?.accountCreatedAt ??
      args.existingAccountCreatedAt ??
      now.toISOString(),
    created_at:
      args.existingAccess?.createdAt ??
      args.existingAccess?.accountCreatedAt ??
      args.existingAccountCreatedAt ??
      now.toISOString(),
    updated_at: now.toISOString()
    // TODO: Route paid plans through Stripe Checkout before switching pending_billing to active in production.
  };
}

export function buildMonthlyUsageResetMetadataUpdate(
  access: AccountPlanAccess,
  args?: {
    activeEnginesUsed?: number;
    seatsUsed?: number;
  }
) {
  const now = new Date();

  return {
    engine_credits_used: 0,
    engine_credits_remaining: access.monthlyEngineCredits,
    active_engines_used: args?.activeEnginesUsed ?? access.activeEnginesUsed,
    seats_used: args?.seatsUsed ?? access.seatsUsed,
    monthly_reset_date: computeNextMonthlyResetDate(now),
    updated_at: now.toISOString()
  };
}

export function buildUsageConsumptionMetadataUpdate(
  access: AccountPlanAccess,
  args: {
    creditsToAdd?: number;
    activeEnginesUsed?: number;
    seatsUsed?: number;
  }
) {
  const creditsToAdd = Math.max(0, args.creditsToAdd ?? 0);
  const nextCreditsUsed = access.isAdmin ? access.engineCreditsUsed : access.engineCreditsUsed + creditsToAdd;
  const nextCreditsRemaining =
    access.monthlyEngineCredits === null
      ? null
      : Math.max(access.monthlyEngineCredits - nextCreditsUsed, 0);

  return {
    engine_credits_used: nextCreditsUsed,
    engine_credits_remaining: nextCreditsRemaining,
    active_engines_used: args.activeEnginesUsed ?? access.activeEnginesUsed,
    seats_used: args.seatsUsed ?? access.seatsUsed,
    updated_at: new Date().toISOString()
  };
}
