import type { AccountPlanAccess } from "@/lib/account/plan-access";
import { buildInitialBuildSessionState } from "@/lib/platform/build-orchestration";
import type { BillingIntervalId } from "@/lib/pricing/config";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";
import { ensureWorkspaceTenancyRecords } from "./foundation-account";
import {
  buildRecommendationSummary,
  isMissingPlatformTableError,
  type PlatformEventSeverity,
  type PlatformUser,
  type ServerSupabaseClient
} from "./foundation-shared";

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
  const guidedSession = args.projectMetadata?.buildSession ?? null;
  const saas = args.projectMetadata?.saasIntake ?? null;
  const mobile = args.projectMetadata?.mobileAppIntake ?? null;
  const recommendationSummary = buildRecommendationSummary(args.projectMetadata ?? null);
  let onboardingDecisionId: string | null = null;

  const decisionPayload = guidedSession
    ? {
        flow: "guided-builder",
        source: guidedSession.source,
        sessionId: guidedSession.sessionId,
        productTypeId: guidedSession.scope.productTypeId ?? guidedSession.scope.buildTypeId ?? null,
        intentMode: guidedSession.scope.intentMode ?? null,
        industryId: guidedSession.scope.industryId ?? null,
        opportunityAreaId: guidedSession.scope.opportunityAreaId ?? null,
        frameworkId: guidedSession.scope.frameworkId ?? null,
        exampleId: guidedSession.scope.exampleId ?? null,
        selectedPathId: guidedSession.path.selectedPathId ?? null,
        selectedPathLabel: guidedSession.path.selectedPathLabel ?? null,
        recommendedPathId: guidedSession.path.recommendedPathMode ?? null,
        recommendedPathLabel: guidedSession.path.recommendedPathLabel ?? null,
        stackSystems: guidedSession.scope.stackSystems ?? [],
        currentStep: guidedSession.progress.currentStep
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
