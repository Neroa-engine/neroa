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
import { APP_ROUTES } from "@/lib/routes";
import {
  buildStoredProjectMetadata,
  encodeWorkspaceProjectDescription,
  parseCustomProjectLanes
} from "@/lib/workspace/project-metadata";

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildErrorRedirect(path: string, message: string) {
  const params = new URLSearchParams();
  params.set("error", message);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export async function createWorkspace(formData: FormData) {
  const { supabase, user } = await requireUser();
  const errorPath = safeString(formData.get("errorPath")) || APP_ROUTES.dashboard;
  const name = safeString(formData.get("name"));
  const description = safeString(formData.get("description"));
  const projectTemplateId = safeString(formData.get("projectTemplateId"));
  const customLanes = parseCustomProjectLanes(
    safeString(formData.get("customLanes"))
  );

  if (!name) {
    redirect(buildErrorRedirect(errorPath, "Project name is required."));
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
      buildErrorRedirect(
        errorPath,
        error instanceof Error ? error.message : "Unable to create project."
      )
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
    redirect(buildErrorRedirect(errorPath, error?.message ?? "Unable to create project."));
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
    revalidatePath(APP_ROUTES.dashboard);
    revalidatePath(APP_ROUTES.projects);
    revalidatePath(APP_ROUTES.projectsNew);
    redirect(
      `/workspace/${data.id}/project/${data.id}?error=${encodeURIComponent(
        usageError instanceof Error
          ? `Engine created, but usage could not be synced. ${usageError.message}`
          : "Engine created, but usage could not be synced."
      )}`
    );
  }

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.projects);
  revalidatePath(APP_ROUTES.projectsNew);
  redirect(`/workspace/${data.id}/project/${data.id}`);
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
