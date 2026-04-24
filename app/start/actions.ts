"use server";

import { redirect } from "next/navigation";
import { buildWorkspaceName } from "@/lib/narua/planning";
import { createBuildSession } from "@/lib/onboarding/build-session";
import { buildMobileAppWorkspaceBlueprint } from "@/lib/onboarding/mobile-app-intake";
import { buildSaasWorkspaceBlueprint } from "@/lib/onboarding/saas-intake";
import { buildStoredProjectMetadata, parseCustomProjectLanes } from "@/lib/workspace/project-metadata";
import { normalizeLaneId, parseSupportingLaneIds } from "@/lib/workspace/lanes";
import {
  appendErrorToPath,
  createProvisionedWorkspace,
  normalizeEntryPathId,
  parseBuildSessionSnapshot,
  parseGuidedBuildHandoff,
  revalidateWorkspaceStart,
  safeString,
  syncEngineCreationUsageOrRedirect
} from "./start-engine-helpers";

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

  const workspaceName = title || buildWorkspaceName(idea);
  const { supabase, user, access, workspaceId } = await createProvisionedWorkspace({
    authNextPath: "/start",
    startErrorPath: "/start",
    createErrorPath: "/start",
    createErrorMessage: "Unable to create workspace.",
    workspaceName,
    visibleDescription,
    storedMetadata
  });

  await syncEngineCreationUsageOrRedirect({
    supabase,
    user,
    access,
    workspaceId,
    createdLabel: "Engine"
  });
  revalidateWorkspaceStart(["/dashboard"]);

  const searchParams = new URLSearchParams();
  searchParams.set("lane", primaryLaneId);

  if (supportingLaneIds.length > 0) {
    searchParams.set("supporting", supportingLaneIds.join(","));
  }

  redirect(`/workspace/${workspaceId}/project/${workspaceId}?${searchParams.toString()}`);
}

export async function startEntryWorkspace(formData: FormData) {
  const selectedPathId = normalizeEntryPathId(safeString(formData.get("selectedPathId")));
  const title = safeString(formData.get("title"));
  const description = safeString(formData.get("description"));

  if (!title || !description) {
    redirect(
      appendErrorToPath(
        `/start?entry=${selectedPathId}`,
        "Add a project name and short build description before continuing."
      )
    );
  }

  const startPath = `/start?entry=${selectedPathId}`;
  const selectedPathLabel = selectedPathId === "managed" ? "Managed Build" : "DIY Build";
  const buildSession = createBuildSession({
    source: "start",
    userIntent: description,
    preferences: [selectedPathLabel],
    scope: {
      title,
      summary: description,
      buildStageLabel: selectedPathLabel
    },
    path: {
      selectedPathId,
      selectedPathLabel,
      recommendedPathMode: selectedPathId,
      recommendedPathLabel: selectedPathLabel
    },
    credits: {
      source: "pending",
      note:
        selectedPathId === "managed"
          ? "Managed path selected from the canonical entry flow."
          : "DIY path selected from the canonical entry flow."
    },
    progress: {
      phase: "start-intake",
      currentStep: "entry-flow",
      currentStepLabel: "Canonical Entry",
      currentRoute: startPath,
      completedSteps: ["entry-flow"]
    }
  });

  const storedMetadata = buildStoredProjectMetadata({
    title,
    description,
    guidedEntryContext: {
      source: "start",
      selectedPathId,
      selectedPathLabel,
      recommendedPathId: selectedPathId,
      recommendedPathLabel: selectedPathLabel,
      userIntent: description,
      title,
      summary: description,
      onboardingStep: "canonical-entry",
      preferences: [selectedPathLabel],
      updatedAt: new Date().toISOString()
    },
    buildSession
  });

  const { supabase, user, access, workspaceId } = await createProvisionedWorkspace({
    authNextPath: startPath,
    startErrorPath: startPath,
    planErrorPath: selectedPathId === "managed" ? "/pricing/managed" : "/pricing/diy",
    createErrorPath: startPath,
    createErrorMessage: "Unable to create the workspace from the entry flow.",
    workspaceName: title,
    visibleDescription: description,
    storedMetadata
  });

  await syncEngineCreationUsageOrRedirect({
    supabase,
    user,
    access,
    workspaceId,
    createdLabel: "Workspace"
  });
  revalidateWorkspaceStart(["/dashboard", "/projects"]);
  redirect(`/workspace/${workspaceId}`);
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

  const { supabase, user, access, workspaceId } = await createProvisionedWorkspace({
    authNextPath: "/start?flow=saas-app",
    startErrorPath: "/start?flow=saas-app",
    createErrorPath: "/start?flow=saas-app",
    createErrorMessage: "Unable to create SaaS workspace.",
    workspaceName: saasBlueprint.projectName,
    visibleDescription: saasBlueprint.projectSummary,
    storedMetadata: buildStoredProjectMetadata({
      title: saasBlueprint.projectName,
      description: saasBlueprint.projectSummary,
      templateId: "saas-build",
      customLanes: [],
      guidedFlowPreset: "saas-app",
      saasIntake: saasBlueprint
    })
  });

  await syncEngineCreationUsageOrRedirect({
    supabase,
    user,
    access,
    workspaceId,
    createdLabel: "Engine"
  });
  revalidateWorkspaceStart(["/dashboard"]);
  redirect(`/workspace/${workspaceId}/project/${workspaceId}`);
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

  const { supabase, user, access, workspaceId } = await createProvisionedWorkspace({
    authNextPath: "/start?flow=mobile-app",
    startErrorPath: "/start?flow=mobile-app",
    createErrorPath: "/start?flow=mobile-app",
    createErrorMessage: "Unable to create Mobile App workspace.",
    workspaceName: mobileBlueprint.projectName,
    visibleDescription: mobileBlueprint.projectSummary,
    storedMetadata: buildStoredProjectMetadata({
      title: mobileBlueprint.projectName,
      description: mobileBlueprint.projectSummary,
      templateId: "mobile-app-build",
      customLanes: [],
      guidedFlowPreset: "mobile-app",
      mobileAppIntake: mobileBlueprint
    })
  });

  await syncEngineCreationUsageOrRedirect({
    supabase,
    user,
    access,
    workspaceId,
    createdLabel: "Engine"
  });
  revalidateWorkspaceStart(["/dashboard"]);
  redirect(`/workspace/${workspaceId}/project/${workspaceId}`);
}

export async function startGuidedEngineWorkspace(formData: FormData) {
  const selectedPathId = safeString(formData.get("selectedPathId"));
  const selectedPathLabel = safeString(formData.get("selectedPathLabel"));
  const guidedBuildHandoff = parseGuidedBuildHandoff(safeString(formData.get("guidedBuildHandoff")));
  const buildSessionSnapshot = parseBuildSessionSnapshot(
    safeString(formData.get("buildSessionSnapshot"))
  );

  if (
    !buildSessionSnapshot ||
    buildSessionSnapshot.source !== "start" ||
    !buildSessionSnapshot.scope.productTypeId ||
    !buildSessionSnapshot.scope.buildStageId ||
    !buildSessionSnapshot.scope.frameworkId ||
    !buildSessionSnapshot.scope.title ||
    !buildSessionSnapshot.scope.summary
  ) {
    redirect("/start?error=Complete the guided build flow before creating your engine.");
  }

  const resolvedPathId =
    selectedPathId === "diy" || selectedPathId === "managed" ? selectedPathId : null;
  const canonicalBuildSession = createBuildSession({
    ...buildSessionSnapshot,
    userIntent: buildSessionSnapshot.userIntent,
    scope: {
      ...buildSessionSnapshot.scope
    },
    path: {
      ...buildSessionSnapshot.path,
      selectedPathId: resolvedPathId ?? buildSessionSnapshot.path.selectedPathId,
      selectedPathLabel:
        selectedPathLabel || buildSessionSnapshot.path.selectedPathLabel,
      recommendedPathMode:
        buildSessionSnapshot.path.recommendedPathMode ?? (resolvedPathId ?? undefined)
    },
    credits: {
      ...buildSessionSnapshot.credits
    },
    progress: {
      ...buildSessionSnapshot.progress,
      phase: "start-intake",
      currentStep: "build-plan",
      currentStepLabel: "Build Plan Output",
      currentRoute: "/start?resume=guided"
    }
  });
  const workspaceName = canonicalBuildSession.scope.title ?? "NEROA Engine";
  const workspaceSummary = canonicalBuildSession.scope.summary ?? null;
  const storedMetadata = buildStoredProjectMetadata({
    title: workspaceName,
    description: workspaceSummary,
    templateId: null,
    customLanes: [],
    guidedEntryContext: guidedBuildHandoff,
    buildSession: canonicalBuildSession
  });

  const { supabase, user, access, workspaceId } = await createProvisionedWorkspace({
    authNextPath: "/start?resume=guided",
    startErrorPath: "/start?resume=guided",
    planErrorPath: "/pricing/diy",
    createErrorPath: "/start",
    createErrorMessage: "Unable to create engine.",
    workspaceName,
    visibleDescription: workspaceSummary,
    storedMetadata
  });

  await syncEngineCreationUsageOrRedirect({
    supabase,
    user,
    access,
    workspaceId,
    createdLabel: "Engine"
  });
  revalidateWorkspaceStart(["/dashboard"]);
  redirect(`/workspace/${workspaceId}/project/${workspaceId}`);
}
