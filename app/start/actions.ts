"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import {
  assertCanCreateEngine,
  consumeEngineCreationCredits,
  syncAccountPlanAccess
} from "@/lib/account/plan-usage-server";
import {
  ensureWorkspaceTenancyRecords,
  recordOnboardingDecisionAndBuildSession,
  recordPlatformEvent
} from "@/lib/platform/foundation";
import { buildWorkspaceName } from "@/lib/narua/planning";
import {
  buildGuidedBuildBlueprint,
  type BuildEntryMode,
  type BuildExperienceLevelId,
  type BuildGoalId,
  type BuildIndustryId,
  type BuildPreferenceId
} from "@/lib/onboarding/guided-build";
import { buildMobileAppWorkspaceBlueprint } from "@/lib/onboarding/mobile-app-intake";
import { buildSaasWorkspaceBlueprint } from "@/lib/onboarding/saas-intake";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildStoredProjectMetadata,
  encodeWorkspaceProjectDescription,
  parseCustomProjectLanes
} from "@/lib/workspace/project-metadata";
import { normalizeLaneId, parseSupportingLaneIds } from "@/lib/workspace/lanes";

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function createWorkspaceRecord(args: {
  supabase: ReturnType<typeof createSupabaseServerClient>;
  ownerId: string;
  name: string;
  visibleDescription: string | null;
  storedMetadata: ReturnType<typeof buildStoredProjectMetadata>;
}) {
  return args.supabase
    .from("workspaces")
    .insert({
      owner_id: args.ownerId,
      name: args.name,
      description: encodeWorkspaceProjectDescription(args.visibleDescription, args.storedMetadata)
    })
    .select("id")
    .single();
}

async function finalizeEngineProvisioning(args: {
  supabase: ReturnType<typeof createSupabaseServerClient>;
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown> | null;
  };
  access: Awaited<ReturnType<typeof syncAccountPlanAccess>>;
  workspaceId: string;
  workspaceName: string;
  visibleDescription: string | null;
  storedMetadata: ReturnType<typeof buildStoredProjectMetadata>;
}) {
  const tenancy = await ensureWorkspaceTenancyRecords({
    supabase: args.supabase,
    user: args.user,
    access: args.access,
    workspaceId: args.workspaceId
  }).catch(() => ({
    organizationId: null
  }));

  await recordOnboardingDecisionAndBuildSession({
    supabase: args.supabase,
    user: args.user,
    access: args.access,
    workspaceId: args.workspaceId,
    workspaceName: args.workspaceName,
    visibleDescription: args.visibleDescription,
    projectMetadata: args.storedMetadata,
    organizationId: tenancy.organizationId
  }).catch(() => {
    // Keep engine creation successful even if the phase 2 tables are not available yet.
  });

  await recordPlatformEvent({
    supabase: args.supabase,
    userId: args.user.id,
    workspaceId: args.workspaceId,
    organizationId: tenancy.organizationId,
    eventType: "engine_created",
    details: {
      templateId: args.storedMetadata.templateId,
      guidedFlowPreset: args.storedMetadata.guidedFlowPreset ?? null
    }
  }).catch(() => {
    // Event persistence is additive and should not block engine creation.
  });
}

function appendErrorToPath(path: string, message: string) {
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}error=${encodeURIComponent(message)}`;
}

async function requireUserReadyForEngineCreation(args: {
  authNextPath: string;
  startErrorPath: string;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?notice=Sign in to continue into your engine.&next=${encodeURIComponent(args.authNextPath)}`);
  }

  const initialAccess = resolveAccountPlanAccess(user);

  if (!initialAccess.hasSelectedPlan) {
    redirect(appendErrorToPath("/start?step=plan", "Choose a plan before creating your engine."));
  }

  const access = await syncAccountPlanAccess({
    supabase,
    user
  }).catch((error) =>
    redirect(
      appendErrorToPath(
        args.startErrorPath,
        error instanceof Error ? error.message : "Unable to validate the selected plan."
      )
    )
  );

  try {
    assertCanCreateEngine(access);
  } catch (error) {
    await recordPlatformEvent({
      supabase,
      userId: user.id,
      eventType: "engine_creation_blocked",
      severity: "warning",
      details: {
        message: error instanceof Error ? error.message : "Unable to create this engine right now."
      }
    }).catch(() => {
      // Optional platform event.
    });

    redirect(
      appendErrorToPath(
        args.startErrorPath,
        error instanceof Error ? error.message : "Unable to create this engine right now."
      )
    );
  }

  return {
    supabase,
    user,
    access
  };
}

export async function startWorkspace(formData: FormData) {
  const title = safeString(formData.get("title"));
  const description = safeString(formData.get("description"));
  const idea = safeString(formData.get("idea"));
  const projectTemplateId = safeString(formData.get("projectTemplateId"));
  const customLanes = parseCustomProjectLanes(
    safeString(formData.get("customLanes"))
  );
  const primaryLaneId = normalizeLaneId(safeString(formData.get("primaryLaneId"))) ?? "business";
  const supportingLaneIds = parseSupportingLaneIds(
    safeString(formData.get("supportingLaneIds"))
  ).filter((laneId) => laneId !== primaryLaneId);
  const visibleDescription = description || idea || null;
  const storedMetadata = buildStoredProjectMetadata({
    title: title || buildWorkspaceName(idea),
    description: visibleDescription,
    templateId: projectTemplateId || null,
    primaryLaneId,
    customLanes
  });

  const { supabase, user, access } = await requireUserReadyForEngineCreation({
    authNextPath: "/start",
    startErrorPath: "/start"
  });

  const { data, error } = await createWorkspaceRecord({
    supabase,
    ownerId: user.id,
    name: title || buildWorkspaceName(idea),
    visibleDescription,
    storedMetadata
  });

  if (error || !data) {
    redirect(`/start?error=${encodeURIComponent(error?.message ?? "Unable to create workspace.")}`);
  }

  await finalizeEngineProvisioning({
    supabase,
    user,
    access,
    workspaceId: data.id,
    workspaceName: title || buildWorkspaceName(idea),
    visibleDescription,
    storedMetadata
  });

  try {
    await consumeEngineCreationCredits({
      supabase,
      user,
      activeEnginesUsed: access.activeEnginesUsed + 1
    });
  } catch (usageError) {
    revalidatePath("/dashboard");
    redirect(
      `/workspace/${data.id}/project/${data.id}?error=${encodeURIComponent(
        usageError instanceof Error
          ? `Engine created, but usage could not be synced. ${usageError.message}`
          : "Engine created, but usage could not be synced."
      )}`
    );
  }

  revalidatePath("/dashboard");

  const searchParams = new URLSearchParams();
  searchParams.set("lane", primaryLaneId);

  if (supportingLaneIds.length > 0) {
    searchParams.set("supporting", supportingLaneIds.join(","));
  }

  redirect(`/workspace/${data.id}/project/${data.id}?${searchParams.toString()}`);
}

export async function startSaasWorkspace(formData: FormData) {
  const productSummary = safeString(formData.get("productSummary"));
  const customer = safeString(formData.get("customer"));
  const problem = safeString(formData.get("problem"));
  const features = safeString(formData.get("features"));
  const needsAccounts = safeString(formData.get("needsAccounts"));
  const takesPayments = safeString(formData.get("takesPayments"));
  const needsAdminDashboard = safeString(formData.get("needsAdminDashboard"));
  const guidanceMode = safeString(formData.get("guidanceMode"));

  if (
    !productSummary ||
    !customer ||
    !problem ||
    !features ||
    (needsAccounts !== "yes" && needsAccounts !== "no" && needsAccounts !== "not-sure") ||
    (takesPayments !== "yes" && takesPayments !== "no" && takesPayments !== "not-sure") ||
    (needsAdminDashboard !== "yes" &&
      needsAdminDashboard !== "no" &&
      needsAdminDashboard !== "not-sure") ||
    (guidanceMode !== "roadmap-only" && guidanceMode !== "guide-build")
  ) {
    redirect("/start?flow=saas-app&error=Complete all SaaS intake questions before opening the workspace.");
  }

  const saasBlueprint = buildSaasWorkspaceBlueprint({
    productSummary,
    customer,
    problem,
    features,
    needsAccounts,
    takesPayments,
    needsAdminDashboard,
    guidanceMode
  });

  const { supabase, user, access } = await requireUserReadyForEngineCreation({
    authNextPath: "/start?flow=saas-app",
    startErrorPath: "/start?flow=saas-app"
  });

  const storedMetadata = buildStoredProjectMetadata({
    title: saasBlueprint.projectName,
    description: saasBlueprint.projectSummary,
    templateId: "saas-build",
    customLanes: [],
    guidedFlowPreset: "saas-app",
    saasIntake: saasBlueprint
  });

  const { data, error } = await createWorkspaceRecord({
    supabase,
    ownerId: user.id,
    name: saasBlueprint.projectName,
    visibleDescription: saasBlueprint.projectSummary,
    storedMetadata
  });

  if (error || !data) {
    redirect(
      `/start?flow=saas-app&error=${encodeURIComponent(
        error?.message ?? "Unable to create SaaS workspace."
      )}`
    );
  }

  await finalizeEngineProvisioning({
    supabase,
    user,
    access,
    workspaceId: data.id,
    workspaceName: saasBlueprint.projectName,
    visibleDescription: saasBlueprint.projectSummary,
    storedMetadata
  });

  try {
    await consumeEngineCreationCredits({
      supabase,
      user,
      activeEnginesUsed: access.activeEnginesUsed + 1
    });
  } catch (usageError) {
    revalidatePath("/dashboard");
    redirect(
      `/workspace/${data.id}/project/${data.id}?error=${encodeURIComponent(
        usageError instanceof Error
          ? `Engine created, but usage could not be synced. ${usageError.message}`
          : "Engine created, but usage could not be synced."
      )}`
    );
  }

  revalidatePath("/dashboard");
  redirect(`/workspace/${data.id}/project/${data.id}`);
}

export async function startMobileAppWorkspace(formData: FormData) {
  const appSummary = safeString(formData.get("appSummary"));
  const audience = safeString(formData.get("audience"));
  const platformTarget = safeString(formData.get("platformTarget"));
  const needsAccounts = safeString(formData.get("needsAccounts"));
  const needsPayments = safeString(formData.get("needsPayments"));
  const needsNotifications = safeString(formData.get("needsNotifications"));
  const deviceFeatures = safeString(formData.get("deviceFeatures"));
  const companionSurface = safeString(formData.get("companionSurface"));
  const mvpVersion = safeString(formData.get("mvpVersion"));
  const budgetGuardrail = safeString(formData.get("budgetGuardrail"));
  const proofOutcome = safeString(formData.get("proofOutcome"));

  if (
    !appSummary ||
    !audience ||
    (platformTarget !== "iphone" && platformTarget !== "android" && platformTarget !== "both") ||
    (needsAccounts !== "yes" && needsAccounts !== "no" && needsAccounts !== "not-sure") ||
    (needsPayments !== "yes" && needsPayments !== "no" && needsPayments !== "not-sure") ||
    (needsNotifications !== "yes" && needsNotifications !== "no" && needsNotifications !== "not-sure") ||
    !deviceFeatures ||
    (companionSurface !== "none" &&
      companionSurface !== "admin-dashboard" &&
      companionSurface !== "web-companion" &&
      companionSurface !== "both" &&
      companionSurface !== "not-sure") ||
    !mvpVersion ||
    !budgetGuardrail ||
    !proofOutcome
  ) {
    redirect(
      "/start?flow=mobile-app&error=Complete all Mobile App intake questions before opening the engine."
    );
  }

  const mobileBlueprint = buildMobileAppWorkspaceBlueprint({
    appSummary,
    audience,
    platformTarget,
    needsAccounts,
    needsPayments,
    needsNotifications,
    deviceFeatures,
    companionSurface,
    mvpVersion,
    budgetGuardrail,
    proofOutcome
  });

  const { supabase, user, access } = await requireUserReadyForEngineCreation({
    authNextPath: "/start?flow=mobile-app",
    startErrorPath: "/start?flow=mobile-app"
  });

  const storedMetadata = buildStoredProjectMetadata({
    title: mobileBlueprint.projectName,
    description: mobileBlueprint.projectSummary,
    templateId: "mobile-app-build",
    customLanes: [],
    guidedFlowPreset: "mobile-app",
    mobileAppIntake: mobileBlueprint
  });

  const { data, error } = await createWorkspaceRecord({
    supabase,
    ownerId: user.id,
    name: mobileBlueprint.projectName,
    visibleDescription: mobileBlueprint.projectSummary,
    storedMetadata
  });

  if (error || !data) {
    redirect(
      `/start?flow=mobile-app&error=${encodeURIComponent(
        error?.message ?? "Unable to create Mobile App workspace."
      )}`
    );
  }

  await finalizeEngineProvisioning({
    supabase,
    user,
    access,
    workspaceId: data.id,
    workspaceName: mobileBlueprint.projectName,
    visibleDescription: mobileBlueprint.projectSummary,
    storedMetadata
  });

  try {
    await consumeEngineCreationCredits({
      supabase,
      user,
      activeEnginesUsed: access.activeEnginesUsed + 1
    });
  } catch (usageError) {
    revalidatePath("/dashboard");
    redirect(
      `/workspace/${data.id}/project/${data.id}?error=${encodeURIComponent(
        usageError instanceof Error
          ? `Engine created, but usage could not be synced. ${usageError.message}`
          : "Engine created, but usage could not be synced."
      )}`
    );
  }

  revalidatePath("/dashboard");
  redirect(`/workspace/${data.id}/project/${data.id}`);
}

export async function startGuidedEngineWorkspace(formData: FormData) {
  const entryMode = safeString(formData.get("entryMode"));
  const industryId = safeString(formData.get("industryId"));
  const customIndustry =
    safeString(formData.get("customIndustry")) || safeString(formData.get("custom_industry"));
  const goalId = safeString(formData.get("goalId"));
  const productTypeId = safeString(formData.get("productTypeId"));
  const experienceLevelId = safeString(formData.get("experienceLevelId"));
  const buildPreferenceId = safeString(formData.get("buildPreferenceId"));
  const selectedModuleIds = safeString(formData.get("selectedModuleIds"))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const workingIdeaName = safeString(formData.get("workingIdeaName"));
  const engineName = safeString(formData.get("engineName"));
  const projectSummary = safeString(formData.get("projectSummary"));

  if (
    (entryMode !== "known-industry" && entryMode !== "exploring") ||
    !industryId ||
    !goalId ||
    !productTypeId ||
    !experienceLevelId ||
    !buildPreferenceId
  ) {
    redirect("/start?error=Complete the guided decision flow before creating your engine.");
  }

  const resolvedEntryMode = entryMode as BuildEntryMode;
  const resolvedIndustryId = industryId as BuildIndustryId;
  const resolvedGoalId = goalId as BuildGoalId;
  const resolvedExperienceLevelId = experienceLevelId as BuildExperienceLevelId;
  const resolvedBuildPreferenceId = buildPreferenceId as BuildPreferenceId;

  const { supabase, user, access } = await requireUserReadyForEngineCreation({
    authNextPath: "/start",
    startErrorPath: "/start"
  });

  let blueprint;

  try {
    blueprint = buildGuidedBuildBlueprint({
      entryMode: resolvedEntryMode,
      industryId: resolvedIndustryId,
      customIndustry,
      goalId: resolvedGoalId,
      productTypeId,
      experienceLevelId: resolvedExperienceLevelId,
      buildPreferenceId: resolvedBuildPreferenceId,
      selectedPlanId: access.selectedPlanId,
      selectedModuleIds,
      engineName,
      workingIdeaName,
      projectSummary,
    });
  } catch (error) {
    redirect(
      `/start?error=${encodeURIComponent(
        error instanceof Error ? error.message : "Unable to prepare this guided system blueprint."
      )}`
    );
  }

  const storedMetadata = buildStoredProjectMetadata({
    title: blueprint.engineName,
    description: blueprint.projectSummary,
    templateId: blueprint.templateId,
    customLanes: [],
    guidedBuildIntake: blueprint
  });

  const { data, error } = await createWorkspaceRecord({
    supabase,
    ownerId: user.id,
    name: blueprint.engineName,
    visibleDescription: blueprint.projectSummary,
    storedMetadata
  });

  if (error || !data) {
    redirect(
      `/start?error=${encodeURIComponent(
        error?.message ?? "Unable to create engine."
      )}`
    );
  }

  await finalizeEngineProvisioning({
    supabase,
    user,
    access,
    workspaceId: data.id,
    workspaceName: blueprint.engineName,
    visibleDescription: blueprint.projectSummary,
    storedMetadata
  });

  try {
    await consumeEngineCreationCredits({
      supabase,
      user,
      activeEnginesUsed: access.activeEnginesUsed + 1
    });
  } catch (usageError) {
    revalidatePath("/dashboard");
    redirect(
      `/workspace/${data.id}/project/${data.id}?error=${encodeURIComponent(
        usageError instanceof Error
          ? `Engine created, but usage could not be synced. ${usageError.message}`
          : "Engine created, but usage could not be synced."
      )}`
    );
  }

  revalidatePath("/dashboard");
  redirect(`/workspace/${data.id}/project/${data.id}`);
}
