import type {
  AccountPlanAccess,
} from "@/lib/account/plan-access";
import { buildInitialBuildSessionState } from "@/lib/platform/build-orchestration";
import type { BillingIntervalId } from "@/lib/pricing/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";

type ServerSupabaseClient = ReturnType<typeof createSupabaseServerClient>;
type PlatformUser = {
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

type PlatformQueryError = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
};

type PlatformEventSeverity = "info" | "warning" | "error";

type RecommendationSummaryPayload = {
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

function normalizeEmail(user: { email?: string | null }) {
  return user.email?.trim().toLowerCase() ?? null;
}

function buildDisplayName(user: { user_metadata?: Record<string, unknown> | null }) {
  const record = (user.user_metadata ?? {}) as Record<string, unknown>;

  for (const key of ["full_name", "name", "display_name"]) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function buildPersonalOrganizationName(user: PlatformUser) {
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

function buildQuotaRow(args: {
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

function buildProfileRow(args: {
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

function buildOrganizationSlug(userId: string) {
  return `personal-${userId}`.toLowerCase();
}

function buildRecommendationSummary(metadata: StoredProjectMetadata | null): RecommendationSummaryPayload | null {
  const guided = metadata?.guidedBuildIntake ?? null;

  if (!guided) {
    return null;
  }

  return {
    frameworkId: guided.recommendedFrameworkId ?? guided.selectedTemplateId,
    frameworkLabel: guided.recommendedFrameworkLabel ?? guided.selectedTemplateName,
    recommendedTierId: guided.recommendedTierId ?? null,
    recommendedTierLabel: guided.recommendedTierLabel ?? null,
    complexityScore: guided.complexityScore ?? null,
    complexityLabel: guided.complexityLabel ?? null,
    executionIntensity: guided.executionIntensity ?? null,
    moduleIds:
      guided.selectedModuleIds.length > 0
        ? guided.selectedModuleIds
        : (guided.requiredModuleCards ?? guided.featureCards).map((item) => item.id)
  };
}

async function safeUpsert(operation: PromiseLike<{ error: PlatformQueryError | null }> | { then: (onfulfilled: (value: { error: PlatformQueryError | null }) => unknown) => unknown }) {
  const { error } = await operation;

  if (error && !isMissingPlatformTableError(error)) {
    throw new Error(error.message || "Unable to persist platform state.");
  }

  return !error;
}

export async function ensurePlatformAccountState(args: {
  supabase: ServerSupabaseClient;
  user: PlatformUser;
  access: AccountPlanAccess;
  billingInterval?: BillingIntervalId | null;
}) {
  const result = {
    organizationId: null as string | null,
    profilePersisted: false,
    quotaPersisted: false,
    adminPersisted: false
  };

  result.profilePersisted = await safeUpsert(
    args.supabase.from("profiles").upsert(buildProfileRow(args), {
      onConflict: "user_id"
    })
  );

  result.quotaPersisted = await safeUpsert(
    args.supabase.from("account_usage_quotas").upsert(buildQuotaRow(args), {
      onConflict: "user_id"
    })
  );

  if (args.access.isAdmin) {
    result.adminPersisted = await safeUpsert(
      args.supabase.from("admin_overrides").upsert(
        {
          user_id: args.user.id,
          email: normalizeEmail(args.user),
          is_active: true,
          billing_exempt: true,
          plan_override: "all_access",
          notes: "Platform admin override"
        },
        { onConflict: "email" }
      )
    );
  }

  const { data: existingOrganization, error: organizationError } = await args.supabase
    .from("organizations")
    .select("id")
    .eq("owner_user_id", args.user.id)
    .eq("personal", true)
    .maybeSingle();

  if (organizationError) {
    if (isMissingPlatformTableError(organizationError)) {
      return result;
    }

    throw new Error(organizationError.message || "Unable to resolve the account workspace.");
  }

  let organizationId = existingOrganization?.id ?? null;

  if (!organizationId) {
    const { data: createdOrganization, error: createOrganizationError } = await args.supabase
      .from("organizations")
      .insert({
        owner_user_id: args.user.id,
        name: buildPersonalOrganizationName(args.user),
        slug: buildOrganizationSlug(args.user.id),
        personal: true
      })
      .select("id")
      .single();

    if (createOrganizationError) {
      if (isMissingPlatformTableError(createOrganizationError)) {
        return result;
      }

      throw new Error(createOrganizationError.message || "Unable to create the personal workspace.");
    }

    organizationId = createdOrganization?.id ?? null;
  }

  result.organizationId = organizationId;

  if (!organizationId) {
    return result;
  }

  await safeUpsert(
    args.supabase.from("organization_memberships").upsert(
      {
        organization_id: organizationId,
        user_id: args.user.id,
        role: "owner",
        status: "active"
      },
      { onConflict: "organization_id,user_id" }
    )
  );

  return result;
}

export async function ensureWorkspaceTenancyRecords(args: {
  supabase: ServerSupabaseClient;
  user: PlatformUser;
  access: AccountPlanAccess;
  workspaceId: string;
  organizationId?: string | null;
  billingInterval?: BillingIntervalId | null;
}) {
  const accountState = await ensurePlatformAccountState({
    supabase: args.supabase,
    user: args.user,
    access: args.access,
    billingInterval: args.billingInterval
  });
  const organizationId = args.organizationId ?? accountState.organizationId;

  if (!organizationId) {
    return {
      organizationId: null
    };
  }

  const { error: workspaceUpdateError } = await args.supabase
    .from("workspaces")
    .update({
      organization_id: organizationId
    })
    .eq("id", args.workspaceId)
    .eq("owner_id", args.user.id);

  if (workspaceUpdateError && !isMissingPlatformTableError(workspaceUpdateError)) {
    throw new Error(workspaceUpdateError.message || "Unable to align workspace tenancy.");
  }

  await safeUpsert(
    args.supabase.from("workspace_memberships").upsert(
      {
        workspace_id: args.workspaceId,
        user_id: args.user.id,
        role: "owner",
        status: "active"
      },
      { onConflict: "workspace_id,user_id" }
    )
  );

  return {
    organizationId
  };
}

export async function recordPlatformEvent(args: {
  supabase: ServerSupabaseClient;
  userId?: string | null;
  workspaceId?: string | null;
  organizationId?: string | null;
  eventType: string;
  severity?: PlatformEventSeverity;
  details?: Record<string, unknown>;
}) {
  const { error } = await args.supabase.from("platform_events").insert({
    user_id: args.userId ?? null,
    workspace_id: args.workspaceId ?? null,
    organization_id: args.organizationId ?? null,
    event_type: args.eventType,
    severity: args.severity ?? "info",
    details: args.details ?? {}
  });

  if (error && !isMissingPlatformTableError(error)) {
    throw new Error(error.message || "Unable to record platform activity.");
  }
}

export async function recordOnboardingDecisionAndBuildSession(args: {
  supabase: ServerSupabaseClient;
  user: PlatformUser;
  access: AccountPlanAccess;
  workspaceId: string;
  workspaceName: string;
  visibleDescription?: string | null;
  projectMetadata?: StoredProjectMetadata | null;
  organizationId?: string | null;
  billingInterval?: BillingIntervalId | null;
}) {
  const tenancy = await ensureWorkspaceTenancyRecords({
    supabase: args.supabase,
    user: args.user,
    access: args.access,
    workspaceId: args.workspaceId,
    organizationId: args.organizationId,
    billingInterval: args.billingInterval
  });
  const buildSessionState = buildInitialBuildSessionState({
    workspaceId: args.workspaceId,
    workspaceName: args.workspaceName,
    visibleDescription: args.visibleDescription,
    projectMetadata: args.projectMetadata
  });
  const guided = args.projectMetadata?.guidedBuildIntake ?? null;
  const saas = args.projectMetadata?.saasIntake ?? null;
  const mobile = args.projectMetadata?.mobileAppIntake ?? null;
  const recommendationSummary = buildRecommendationSummary(args.projectMetadata ?? null);
  let onboardingDecisionId: string | null = null;

  const decisionPayload = guided
    ? {
        entryMode: guided.entryMode,
        industryId: guided.industryId,
        productTypeId: guided.templateIdeaId,
        goalId: guided.goalId,
        experienceLevelId: guided.experienceLevelId,
        buildPreferenceId: guided.buildPreferenceId,
        workingIdeaName: guided.templateIdeaLabel,
        selectedModuleIds: guided.selectedModuleIds
      }
    : saas
      ? {
          flow: "saas-intake",
          answers: saas.answers,
          mvpFeatureList: saas.mvpFeatureList
        }
      : mobile
        ? {
            flow: "mobile-app-intake",
            answers: mobile.answers,
            featureList: mobile.featureList,
            screenList: mobile.screenList
          }
        : {
            flow: "generic",
            templateId: args.projectMetadata?.templateId ?? null
          };

  const { data: createdDecision, error: decisionError } = await args.supabase
    .from("onboarding_decisions")
    .insert({
      user_id: args.user.id,
      organization_id: tenancy.organizationId,
      workspace_id: args.workspaceId,
      decision_payload: decisionPayload,
      summary_payload: {
        workspaceName: args.workspaceName,
        blueprintSummary: buildSessionState.buildConfiguration.blueprintSummary,
        recommendationSummary
      },
      accepted_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (decisionError) {
    if (!isMissingPlatformTableError(decisionError)) {
      throw new Error(decisionError.message || "Unable to persist the onboarding decision.");
    }
  } else {
    onboardingDecisionId = createdDecision?.id ?? null;
  }

  const frameworkId = buildSessionState.buildConfiguration.frameworkId;

  if (frameworkId) {
    const { error: frameworkError } = await args.supabase
      .from("framework_selections")
      .upsert(
        {
          workspace_id: args.workspaceId,
          user_id: args.user.id,
          framework_id: frameworkId,
          framework_label: buildSessionState.buildConfiguration.frameworkLabel,
          build_category: buildSessionState.buildConfiguration.categoryId,
          complexity_score: buildSessionState.buildConfiguration.complexityScore,
          recommended_tier_id: buildSessionState.buildConfiguration.recommendedTierId,
          selected_module_ids: [
            ...buildSessionState.buildConfiguration.modules.required.map((module) => module.id),
            ...buildSessionState.buildConfiguration.modules.expansion.map((module) => module.id),
            ...buildSessionState.buildConfiguration.modules.optional.map((module) => module.id)
          ]
        },
        { onConflict: "workspace_id,framework_id" }
      );

    if (frameworkError && !isMissingPlatformTableError(frameworkError)) {
      throw new Error(frameworkError.message || "Unable to persist the framework selection.");
    }
  }

  const moduleEntitlements = [
    ...buildSessionState.buildConfiguration.modules.required.map((module) => ({
      workspace_id: args.workspaceId,
      module_id: module.id,
      module_label: module.label,
      entitlement_state: "included",
      source: "blueprint",
      complexity_weight: 1
    })),
    ...buildSessionState.buildConfiguration.modules.expansion.map((module) => ({
      workspace_id: args.workspaceId,
      module_id: module.id,
      module_label: module.label,
      entitlement_state: "available",
      source: "blueprint",
      complexity_weight: 2
    })),
    ...buildSessionState.buildConfiguration.modules.optional.map((module) => ({
      workspace_id: args.workspaceId,
      module_id: module.id,
      module_label: module.label,
      entitlement_state: "locked",
      source: "blueprint",
      complexity_weight: 3
    }))
  ];

  if (moduleEntitlements.length > 0) {
    const { error: moduleError } = await args.supabase
      .from("workspace_module_entitlements")
      .upsert(moduleEntitlements, { onConflict: "workspace_id,module_id" });

    if (moduleError && !isMissingPlatformTableError(moduleError)) {
      throw new Error(moduleError.message || "Unable to persist the module entitlements.");
    }
  }

  let buildSessionId: string | null = null;
  const { data: buildSession, error: buildSessionError } = await args.supabase
    .from("build_sessions")
    .insert({
      workspace_id: args.workspaceId,
      user_id: args.user.id,
      organization_id: tenancy.organizationId,
      onboarding_decision_id: onboardingDecisionId,
      status: buildSessionState.status,
      stage: buildSessionState.stage,
      build_configuration: buildSessionState.buildConfiguration,
      progress_snapshot: buildSessionState.progressSnapshot
    })
    .select("id")
    .single();

  if (buildSessionError) {
    if (!isMissingPlatformTableError(buildSessionError)) {
      throw new Error(buildSessionError.message || "Unable to create the build session.");
    }
  } else {
    buildSessionId = buildSession?.id ?? null;
  }

  if (buildSessionId) {
    const { error: buildEventError } = await args.supabase
      .from("build_session_events")
      .insert({
        build_session_id: buildSessionId,
        event_type: "blueprint_confirmed",
        payload: {
          currentStep: buildSessionState.progressSnapshot.currentStep,
          nextStep: buildSessionState.progressSnapshot.nextStep,
          recommendationSummary
        }
      });

    if (buildEventError && !isMissingPlatformTableError(buildEventError)) {
      throw new Error(buildEventError.message || "Unable to create the first build event.");
    }
  }

  const { error: recommendationError } = await args.supabase
    .from("recommendation_history")
    .insert({
      user_id: args.user.id,
      onboarding_decision_id: onboardingDecisionId,
      workspace_id: args.workspaceId,
      input_snapshot: decisionPayload,
      recommendation_snapshot: {
        ...recommendationSummary,
        sourceFlow: buildSessionState.buildConfiguration.sourceFlow
      },
      user_action: "accepted"
    });

  if (recommendationError && !isMissingPlatformTableError(recommendationError)) {
    throw new Error(recommendationError.message || "Unable to store the recommendation history.");
  }

  return {
    organizationId: tenancy.organizationId,
    onboardingDecisionId,
    buildSessionId,
    buildSessionState
  };
}

export async function listAccessibleWorkspaces(args: {
  supabase: ServerSupabaseClient;
  userId: string;
}) {
  const { data: ownedWorkspaces, error: ownedError } = await args.supabase
    .from("workspaces")
    .select("id, name, description, created_at, owner_id")
    .eq("owner_id", args.userId)
    .order("created_at", { ascending: false });

  if (ownedError) {
    throw new Error(ownedError.message || "Unable to load owned workspaces.");
  }

  const workspaceMap = new Map<string, AccessibleWorkspaceRecord>();

  for (const workspace of ownedWorkspaces ?? []) {
    workspaceMap.set(workspace.id, {
      ...workspace,
      accessMode: "owner"
    });
  }

  const { data: memberships, error: membershipError } = await args.supabase
    .from("workspace_memberships")
    .select("workspace_id")
    .eq("user_id", args.userId)
    .eq("status", "active");

  if (membershipError) {
    if (isMissingPlatformTableError(membershipError)) {
      return [...workspaceMap.values()].sort((left, right) =>
        right.created_at.localeCompare(left.created_at)
      );
    }

    throw new Error(membershipError.message || "Unable to load shared workspaces.");
  }

  const sharedIds = (memberships ?? [])
    .map((item) => item.workspace_id as string)
    .filter((workspaceId) => workspaceId && !workspaceMap.has(workspaceId));

  if (sharedIds.length > 0) {
    const { data: sharedWorkspaces, error: sharedError } = await args.supabase
      .from("workspaces")
      .select("id, name, description, created_at, owner_id")
      .in("id", sharedIds);

    if (sharedError) {
      throw new Error(sharedError.message || "Unable to load workspace memberships.");
    }

    for (const workspace of sharedWorkspaces ?? []) {
      workspaceMap.set(workspace.id, {
        ...workspace,
        accessMode: workspace.owner_id === args.userId ? "owner" : "member"
      });
    }
  }

  return [...workspaceMap.values()].sort((left, right) =>
    right.created_at.localeCompare(left.created_at)
  );
}

export async function getAccessibleWorkspace(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  workspaceId: string;
}) {
  const { data: ownedWorkspace, error: ownedError } = await args.supabase
    .from("workspaces")
    .select("id, name, description, created_at, owner_id")
    .eq("id", args.workspaceId)
    .eq("owner_id", args.userId)
    .maybeSingle();

  if (ownedError) {
    throw new Error(ownedError.message || "Unable to load the workspace.");
  }

  if (ownedWorkspace) {
    return {
      ...ownedWorkspace,
      accessMode: "owner" as const
    };
  }

  const { data: membership, error: membershipError } = await args.supabase
    .from("workspace_memberships")
    .select("workspace_id")
    .eq("workspace_id", args.workspaceId)
    .eq("user_id", args.userId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    if (isMissingPlatformTableError(membershipError)) {
      return null;
    }

    throw new Error(membershipError.message || "Unable to resolve workspace membership.");
  }

  if (!membership) {
    return null;
  }

  const { data: sharedWorkspace, error: sharedError } = await args.supabase
    .from("workspaces")
    .select("id, name, description, created_at, owner_id")
    .eq("id", args.workspaceId)
    .maybeSingle();

  if (sharedError) {
    throw new Error(sharedError.message || "Unable to load the shared workspace.");
  }

  if (!sharedWorkspace) {
    return null;
  }

  return {
    ...sharedWorkspace,
    accessMode: sharedWorkspace.owner_id === args.userId ? "owner" : "member"
  };
}

function planRank(planId: string | null | undefined) {
  const order = ["free", "starter", "builder", "pro", "command-center"];

  return planId ? order.indexOf(planId) : -1;
}

export async function getAdminOperationsOverview(args: {
  supabase: ServerSupabaseClient;
}) {
  const { count: workspaceCount, error: workspaceCountError } = await args.supabase
    .from("workspaces")
    .select("id", { head: true, count: "exact" });

  if (workspaceCountError) {
    if (isMissingPlatformTableError(workspaceCountError)) {
      return {
        available: false as const,
        reason: "The phase 2 platform migration has not been applied yet."
      };
    }

    throw new Error(workspaceCountError.message || "Unable to load admin workspace totals.");
  }

  const [frameworkSelectionsResult, buildSessionsResult, eventsResult, recommendationsResult, quotasResult] =
    await Promise.all([
      args.supabase
        .from("framework_selections")
        .select(
          "workspace_id, framework_id, framework_label, build_category, complexity_score, recommended_tier_id, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(8),
      args.supabase
        .from("build_sessions")
        .select("id, workspace_id, status, stage, build_configuration, progress_snapshot, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      args.supabase
        .from("platform_events")
        .select("event_type, severity, user_id, workspace_id, details, created_at")
        .order("created_at", { ascending: false })
        .limit(12),
      args.supabase
        .from("recommendation_history")
        .select("user_id, workspace_id, recommendation_snapshot, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      args.supabase
        .from("account_usage_quotas")
        .select("user_id, selected_plan_id, active_engines_used, active_engine_limit, engine_credits_used, monthly_engine_credits")
    ]);

  for (const result of [
    frameworkSelectionsResult,
    buildSessionsResult,
    eventsResult,
    recommendationsResult,
    quotasResult
  ]) {
    if (result.error) {
      if (isMissingPlatformTableError(result.error)) {
        return {
          available: false as const,
          reason: "The phase 2 platform migration has not been applied yet."
        };
      }

      throw new Error(result.error.message || "Unable to load admin operations data.");
    }
  }

  const quotaByUser = new Map<string, Record<string, unknown>>();

  for (const row of quotasResult.data ?? []) {
    quotaByUser.set(String(row.user_id), row as Record<string, unknown>);
  }

  const tierMismatches = (recommendationsResult.data ?? [])
    .map((row) => {
      const snapshot =
        row.recommendation_snapshot && typeof row.recommendation_snapshot === "object"
          ? (row.recommendation_snapshot as Record<string, unknown>)
          : null;
      const quota = quotaByUser.get(String(row.user_id));
      const selectedPlanId =
        quota && typeof quota.selected_plan_id === "string" ? quota.selected_plan_id : null;
      const recommendedTierId =
        snapshot && typeof snapshot.recommendedTierId === "string"
          ? snapshot.recommendedTierId
          : null;

      if (!recommendedTierId || planRank(recommendedTierId) <= planRank(selectedPlanId)) {
        return null;
      }

      return {
        userId: String(row.user_id),
        workspaceId: row.workspace_id ? String(row.workspace_id) : null,
        selectedPlanId,
        recommendedTierId,
        createdAt: String(row.created_at)
      };
    })
    .filter(
      (item): item is {
        userId: string;
        workspaceId: string | null;
        selectedPlanId: string | null;
        recommendedTierId: string;
        createdAt: string;
      } => Boolean(item)
    )
    .slice(0, 8);

  const gatedAttempts = (eventsResult.data ?? []).filter(
    (event) =>
      typeof event.event_type === "string" &&
      (event.event_type.includes("blocked") || event.event_type.includes("gated"))
  );

  return {
    available: true as const,
    counts: {
      activeWorkspaces: workspaceCount ?? 0,
      buildSessions: buildSessionsResult.data?.length ?? 0,
      recentRecommendations: recommendationsResult.data?.length ?? 0,
      gatedAttempts: gatedAttempts.length
    },
    recentFrameworkSelections: frameworkSelectionsResult.data ?? [],
    recentBuildSessions: buildSessionsResult.data ?? [],
    recentPlatformEvents: eventsResult.data ?? [],
    tierMismatches
  };
}
