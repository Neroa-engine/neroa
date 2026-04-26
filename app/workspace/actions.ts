"use server";

import { cookies } from "next/headers";
import {
  assertCanCreateEngine,
  consumeEngineCreationCredits,
  syncAccountPlanAccess
} from "@/lib/account/plan-usage-server";
import {
  ACTIVE_PROJECT_COOKIE,
  clearPersistedActiveProjectId
} from "@/lib/portal/active-project";
import {
  buildStoredProjectMetadata,
  encodeWorkspaceProjectDescription,
  parseWorkspaceProjectDescription,
  type StoredProjectAsset
} from "@/lib/workspace/project-metadata";
import {
  ensureWorkspaceTenancyRecords,
  recordOnboardingDecisionAndBuildSession,
  recordPlatformEvent
} from "@/lib/platform/foundation";
import {
  buildDescriptionWithMetadata,
  getOwnedWorkspace,
  getReturnTo,
  parseAssetsPayload,
  redirectWithError,
  revalidateWorkspacePaths,
  safeString,
  syncWorkspaceUsageSnapshot,
  uniqueAssets
} from "./workspace-action-helpers";

function workspaceWriteBlockedMessage(action: "archive" | "restore" | "rename" | "delete") {
  const actionLabel =
    action === "archive"
      ? "archive"
      : action === "restore"
        ? "restore"
        : action === "rename"
          ? "rename"
          : "delete";

  return `Project ${actionLabel} could not be confirmed. The live Supabase workspace owner-write policy still appears to be blocking updates for this account. Confirm the workspace owner write repair migration is applied, then try again.`;
}

export async function renameWorkspace(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const name = safeString(formData.get("name"));
  const returnTo = getReturnTo(formData, `/workspace/${workspaceId}/project/${workspaceId}`);

  if (!workspaceId || !name) {
    redirectWithError(returnTo, "Engine rename requires an id and a name.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Engine not found."
    )
  );

  const { supabase, workspace } = ownedWorkspace;
  const { data, error } = await supabase
    .from("workspaces")
    .update({
      name,
      description: buildDescriptionWithMetadata({
        workspace,
        title: name
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(returnTo, workspaceWriteBlockedMessage("rename"));
  }

  revalidateWorkspacePaths([
    "/dashboard",
    "/projects",
    "/profile",
    "/settings",
    "/billing",
    "/usage",
    `/workspace/${workspaceId}/project/${workspaceId}`
  ]);
}

export async function archiveWorkspace(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const returnTo = getReturnTo(formData, "/dashboard");

  if (!workspaceId) {
    redirectWithError(returnTo, "Engine archive requires an id.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Engine not found."
    )
  );

  const { supabase, workspace } = ownedWorkspace;
  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        archived: true
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(returnTo, workspaceWriteBlockedMessage("archive"));
  }

  await recordPlatformEvent({
    supabase,
    userId: ownedWorkspace.user.id,
    workspaceId,
    eventType: "engine_archived",
    details: {
      returnTo
    }
  }).catch(() => {
    // Optional platform event.
  });

  if (cookies().get(ACTIVE_PROJECT_COOKIE)?.value === workspaceId) {
    cookies().delete(ACTIVE_PROJECT_COOKIE);
  }

  await clearPersistedActiveProjectId({
    supabase,
    userId: ownedWorkspace.user.id,
    workspaceId
  }).catch(() => {
    // The durable preference should not block archive.
  });

  await syncWorkspaceUsageSnapshot(ownedWorkspace);
  revalidateWorkspacePaths([
    "/dashboard",
    "/projects",
    "/billing",
    "/usage",
    "/profile",
    "/settings"
  ]);
}

export async function restoreWorkspace(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const returnTo = getReturnTo(formData, "/dashboard");

  if (!workspaceId) {
    redirectWithError(returnTo, "Engine restore requires an id.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Engine not found."
    )
  );

  const { supabase, workspace } = ownedWorkspace;
  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        archived: false
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(returnTo, workspaceWriteBlockedMessage("restore"));
  }

  await recordPlatformEvent({
    supabase,
    userId: ownedWorkspace.user.id,
    workspaceId,
    eventType: "engine_restored",
    details: {
      returnTo
    }
  }).catch(() => {
    // Optional platform event.
  });

  await syncWorkspaceUsageSnapshot(ownedWorkspace);
  revalidateWorkspacePaths([
    "/dashboard",
    "/projects",
    "/billing",
    "/usage",
    "/profile",
    "/settings"
  ]);
}

export async function duplicateWorkspace(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const returnTo = getReturnTo(formData, "/dashboard");

  if (!workspaceId) {
    redirectWithError(returnTo, "Engine duplication requires an id.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Engine not found."
    )
  );

  const { supabase, user, workspace } = ownedWorkspace;
  const access = await syncAccountPlanAccess({
    supabase,
    user
  }).catch((error) =>
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Unable to validate the account plan."
    )
  );

  try {
    assertCanCreateEngine(access);
  } catch (error) {
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Unable to create another engine."
    );
  }
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const duplicateName = `${workspace.name} Copy`;
  const duplicateMetadata = buildStoredProjectMetadata({
    title: duplicateName,
    description: parsed.visibleDescription,
    templateId: parsed.metadata?.templateId ?? null,
    customLanes: parsed.metadata?.customLanes ?? [],
    conversationState: parsed.metadata?.conversationState ?? null,
    governanceState: parsed.metadata?.governanceState ?? null,
    strategyState: parsed.metadata?.strategyState ?? null,
    archived: false,
    assets: parsed.metadata?.assets ?? [],
    commandCenterDecisions: [],
    commandCenterChangeReviews: [],
    commandCenterPreviewState: null,
    commandCenterApprovedDesignPackage: null,
    guidedFlowPreset: parsed.metadata?.guidedFlowPreset,
    guidedEntryContext: parsed.metadata?.guidedEntryContext ?? null,
    buildSession: parsed.metadata?.buildSession ?? null,
    saasIntake: parsed.metadata?.saasIntake ?? null,
    mobileAppIntake: parsed.metadata?.mobileAppIntake ?? null
  });

  const { data, error } = await supabase.from("workspaces").insert({
    name: duplicateName,
    description: encodeWorkspaceProjectDescription(
      parsed.visibleDescription,
      duplicateMetadata
    ),
    owner_id: user.id
  })
  .select("id")
  .single();

  if (error || !data) {
    redirectWithError(returnTo, error?.message ?? "Unable to duplicate engine.");
  }

  const tenancy = await ensureWorkspaceTenancyRecords({
    supabase,
    user,
    access,
    workspaceId: data.id
  }).catch(() => ({
    organizationId: null
  }));

  await recordOnboardingDecisionAndBuildSession({
    supabase,
    user,
    access,
    workspaceId: data.id,
    workspaceName: duplicateName,
    visibleDescription: parsed.visibleDescription,
    projectMetadata: duplicateMetadata,
    organizationId: tenancy.organizationId
  }).catch(() => {
    // Keep duplication successful even before the phase 2 migration is applied.
  });

  await consumeEngineCreationCredits({
    supabase,
    user,
    activeEnginesUsed: access.activeEnginesUsed + 1
  }).catch((usageError) =>
    redirectWithError(
      returnTo,
      usageError instanceof Error
        ? `Engine duplicated, but usage could not be synced. ${usageError.message}`
        : "Engine duplicated, but usage could not be synced."
    )
  );

  await recordPlatformEvent({
    supabase,
    userId: user.id,
    workspaceId: data.id,
    organizationId: tenancy.organizationId,
    eventType: "engine_duplicated",
    details: {
      sourceWorkspaceId: workspaceId,
      templateId: duplicateMetadata.templateId
    }
  }).catch(() => {
    // Optional platform event.
  });

  revalidateWorkspacePaths([
    "/dashboard",
    "/projects",
    "/billing",
    "/usage",
    "/profile",
    "/settings"
  ]);
}

export async function deleteWorkspace(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const returnTo = getReturnTo(formData, "/dashboard");

  if (!workspaceId) {
    redirectWithError(returnTo, "Engine deletion requires an id.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Engine not found."
    )
  );

  const { supabase, user } = ownedWorkspace;

  await supabase
    .from("jobs")
    .delete()
    .eq("owner_id", user.id)
    .eq("workspace_id", workspaceId);

  const { data, error } = await supabase
    .from("workspaces")
    .delete()
    .eq("owner_id", user.id)
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(returnTo, workspaceWriteBlockedMessage("delete"));
  }

  await recordPlatformEvent({
    supabase,
    userId: user.id,
    workspaceId,
    eventType: "engine_deleted",
    severity: "warning",
    details: {
      returnTo
    }
  }).catch(() => {
    // Optional platform event.
  });

  if (cookies().get(ACTIVE_PROJECT_COOKIE)?.value === workspaceId) {
    cookies().delete(ACTIVE_PROJECT_COOKIE);
  }

  await clearPersistedActiveProjectId({
    supabase,
    userId: user.id,
    workspaceId
  }).catch(() => {
    // The durable preference should not block delete.
  });

  await syncWorkspaceUsageSnapshot(ownedWorkspace);
  revalidateWorkspacePaths([
    "/dashboard",
    "/projects",
    "/billing",
    "/usage",
    "/profile",
    "/settings"
  ]);
}

export async function registerWorkspaceAssets(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const assetPayload = safeString(formData.get("assetPayload"));
  const returnTo = getReturnTo(formData, "/dashboard");

  if (!workspaceId) {
    redirectWithError(returnTo, "Asset registration requires an engine.");
  }

  const incomingAssets = parseAssetsPayload(assetPayload);

  if (incomingAssets.length === 0) {
    redirectWithError(returnTo, "Choose at least one asset before uploading.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Engine not found."
    )
  );

  const { supabase, workspace } = ownedWorkspace;
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const mergedAssets = uniqueAssets([...(parsed.metadata?.assets ?? []), ...incomingAssets]);

  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        assets: mergedAssets
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(
      returnTo,
      "Asset upload could not be confirmed. Workspace write verification is still pending."
    );
  }

  await recordPlatformEvent({
    supabase,
    userId: ownedWorkspace.user.id,
    workspaceId,
    eventType: "assets_registered",
    details: {
      assetCount: incomingAssets.length
    }
  }).catch(() => {
    // Optional platform event.
  });

  revalidateWorkspacePaths([
    "/dashboard",
    "/projects",
    `/workspace/${workspaceId}/project/${workspaceId}`
  ]);
}
