"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  assertCanCreateEngine,
  consumeEngineCreationCredits,
  countActiveEnginesForUser,
  syncAccountPlanAccess,
  syncActiveEngineUsage
} from "@/lib/account/plan-usage-server";
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

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getReturnTo(formData: FormData, fallback: string) {
  return safeString(formData.get("returnTo")) || fallback;
}

function redirectWithError(returnTo: string, message: string): never {
  const join = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${join}error=${encodeURIComponent(message)}`);
}

function normalizeAsset(value: unknown): StoredProjectAsset | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const kind = typeof record.kind === "string" ? record.kind.trim() : "";
  const sizeLabel =
    typeof record.sizeLabel === "string" && record.sizeLabel.trim()
      ? record.sizeLabel.trim()
      : null;
  const addedAt = typeof record.addedAt === "string" ? record.addedAt : new Date().toISOString();

  if (!id || !name || !kind) {
    return null;
  }

  return {
    id,
    name,
    kind,
    sizeLabel,
    addedAt
  };
}

function parseAssetsPayload(value: string) {
  if (!value.trim()) {
    return [] as StoredProjectAsset[];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeAsset(item))
      .filter((item): item is StoredProjectAsset => Boolean(item));
  } catch {
    return [];
  }
}

function uniqueAssets(items: StoredProjectAsset[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

async function getOwnedWorkspace(workspaceId: string) {
  const { supabase, user } = await requireUser();
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("id, name, description")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !workspace) {
    throw new Error(error?.message ?? "Engine not found.");
  }

  return { supabase, user, workspace };
}

function buildDescriptionWithMetadata(args: {
  workspace: {
    name: string;
    description: string | null;
  };
  title?: string;
  archived?: boolean;
  assets?: StoredProjectAsset[];
}) {
  const parsed = parseWorkspaceProjectDescription(args.workspace.description);

  return encodeWorkspaceProjectDescription(
    parsed.visibleDescription,
    buildStoredProjectMetadata({
      title: args.title ?? args.workspace.name,
      description: parsed.visibleDescription,
      templateId: parsed.metadata?.templateId ?? null,
      customLanes: parsed.metadata?.customLanes ?? [],
      archived: args.archived ?? parsed.metadata?.archived ?? false,
      assets: args.assets ?? parsed.metadata?.assets ?? [],
      guidedFlowPreset: parsed.metadata?.guidedFlowPreset,
      guidedBuildIntake: parsed.metadata?.guidedBuildIntake ?? null,
      saasIntake: parsed.metadata?.saasIntake ?? null,
      mobileAppIntake: parsed.metadata?.mobileAppIntake ?? null
    })
  );
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

  const { error } = await supabase
    .from("workspaces")
    .update({
      name,
      description: buildDescriptionWithMetadata({
        workspace,
        title: name
      })
    })
    .eq("id", workspaceId);

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/workspace/${workspaceId}/project/${workspaceId}`);
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
  const { error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        archived: true
      })
    })
    .eq("id", workspaceId);

  if (error) {
    redirectWithError(returnTo, error.message);
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

  await syncActiveEngineUsage({
    supabase,
    user: ownedWorkspace.user,
    activeEnginesUsed: await countActiveEnginesForUser(supabase, ownedWorkspace.user.id)
  }).catch(() => {
    // Keep the archive action successful even if usage metadata refresh fails.
  });

  revalidatePath("/dashboard");
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
    archived: false,
    assets: parsed.metadata?.assets ?? [],
    guidedFlowPreset: parsed.metadata?.guidedFlowPreset,
    guidedBuildIntake: parsed.metadata?.guidedBuildIntake ?? null,
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

  revalidatePath("/dashboard");
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

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("owner_id", user.id)
    .eq("id", workspaceId);

  if (error) {
    redirectWithError(returnTo, error.message);
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

  await syncActiveEngineUsage({
    supabase,
    user,
    activeEnginesUsed: await countActiveEnginesForUser(supabase, user.id)
  }).catch(() => {
    // Keep deletion successful even if usage metadata refresh fails.
  });

  revalidatePath("/dashboard");
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

  const { error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        assets: mergedAssets
      })
    })
    .eq("id", workspaceId);

  if (error) {
    redirectWithError(returnTo, error.message);
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

  revalidatePath("/dashboard");
  revalidatePath(`/workspace/${workspaceId}/project/${workspaceId}`);
}
