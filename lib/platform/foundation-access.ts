import {
  isMissingPlatformTableError,
  planRank,
  type AccessibleWorkspaceRecord,
  type ServerSupabaseClient
} from "./foundation-shared";
import { classifyCustomerFacingWorkspaces } from "@/lib/workspace/customer-project-truth";

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

export async function getCustomerFacingWorkspacePortfolio(args: {
  supabase: ServerSupabaseClient;
  userId: string;
}) {
  const workspaces = await listAccessibleWorkspaces(args);
  const classification = classifyCustomerFacingWorkspaces(workspaces);

  return {
    workspaces,
    ...classification
  };
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
