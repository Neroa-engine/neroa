import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
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

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

function redirectWithError(request: Request, message: string) {
  const url = new URL("/dashboard", request.url);
  url.searchParams.set("error", message);

  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(
    formData.get("description") ?? formData.get("goal") ?? ""
  ).trim();
  const projectTemplateId = String(formData.get("projectTemplateId") ?? "").trim();
  const customLanes = parseCustomProjectLanes(
    String(formData.get("customLanes") ?? "").trim()
  );

  if (!name) {
    return redirectWithError(request, "Engine name is required.");
  }

  const storedMetadata = buildStoredProjectMetadata({
    title: name,
    description,
    templateId: projectTemplateId || null,
    customLanes
  });

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo(request, "/auth");
  }

  let access;

  try {
    access = await syncAccountPlanAccess({
      supabase,
      user
    });
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

    return redirectWithError(
      request,
      error instanceof Error ? error.message : "Unable to create engine."
    );
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name,
      description: encodeWorkspaceProjectDescription(description || null, storedMetadata),
      owner_id: user.id
    })
    .select("id")
    .single();

  if (error || !data) {
    return redirectWithError(
      request,
      error?.message ?? "Unable to create engine."
    );
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
    visibleDescription: description || null,
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
    return redirectTo(
      request,
      `/workspace/${data.id}/project/${data.id}?error=${encodeURIComponent(
        usageError instanceof Error
          ? `Engine created, but usage could not be synced. ${usageError.message}`
          : "Engine created, but usage could not be synced."
      )}`
    );
  }

  revalidatePath("/dashboard");

  return redirectTo(request, `/workspace/${data.id}/project/${data.id}`);
}
