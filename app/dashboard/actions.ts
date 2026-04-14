"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
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
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildStoredProjectMetadata,
  encodeWorkspaceProjectDescription,
  parseCustomProjectLanes
} from "@/lib/workspace/project-metadata";

export async function createWorkspace(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const projectTemplateId = String(formData.get("projectTemplateId") ?? "").trim();
  const customLanes = parseCustomProjectLanes(
    String(formData.get("customLanes") ?? "").trim()
  );

  if (!name) {
    redirect("/dashboard?error=Engine name is required.");
  }

  const access = await syncAccountPlanAccess({
    supabase,
    user
  });

  try {
    assertCanCreateEngine(access);
  } catch (error) {
    await recordPlatformEvent({
      supabase,
      userId: user.id,
      eventType: "engine_creation_blocked",
      severity: "warning",
      details: {
        message: error instanceof Error ? error.message : "Unable to create engine."
      }
    }).catch(() => {
      // Optional platform event.
    });

    redirect(
      `/dashboard?error=${encodeURIComponent(
        error instanceof Error ? error.message : "Unable to create engine."
      )}`
    );
  }

  const storedMetadata = buildStoredProjectMetadata({
    title: name,
    description,
    templateId: projectTemplateId || null,
    customLanes
  });

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name,
      description: encodeWorkspaceProjectDescription(description, storedMetadata),
      owner_id: user.id
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/dashboard?error=${encodeURIComponent(error?.message ?? "Unable to create engine.")}`);
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
    workspaceName: name,
    visibleDescription: description,
    projectMetadata: storedMetadata,
    organizationId: tenancy.organizationId
  }).catch(() => {
    // Keep creation successful even before the phase 2 migration is applied.
  });

  await recordPlatformEvent({
    supabase,
    userId: user.id,
    workspaceId: data.id,
    organizationId: tenancy.organizationId,
    eventType: "engine_created",
    details: {
      templateId: storedMetadata.templateId
    }
  }).catch(() => {
    // Optional platform event.
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

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
