"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  assertCanCreateEngine,
  consumeEngineCreationCredits,
  syncAccountPlanAccess
} from "@/lib/account/plan-usage-server";
import {
  buildAccountPlanMetadataUpdate,
  resolveAccountPlanAccess
} from "@/lib/account/plan-access";
import {
  buildFrontDoorBuildSession,
  buildFrontDoorPreview,
  normalizeFrontDoorIntakeDraft
} from "@/lib/front-door/intake";
import {
  ensureWorkspaceTenancyRecords,
  recordOnboardingDecisionAndBuildSession,
  recordPlatformEvent
} from "@/lib/platform/foundation";
import { buildAuthRedirectPath } from "@/lib/auth/routes";
import { getServerAuthContext } from "@/lib/auth";
import {
  buildStoredProjectMetadata,
  encodeWorkspaceProjectDescription
} from "@/lib/workspace/project-metadata";

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildRoadmapRedirect(params: { error?: string; notice?: string }) {
  const searchParams = new URLSearchParams();

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.notice) {
    searchParams.set("notice", params.notice);
  }

  return searchParams.size > 0 ? `/roadmap?${searchParams.toString()}` : "/roadmap";
}

function parseIntakeDraft(rawValue: string) {
  if (!rawValue.trim()) {
    return null;
  }

  try {
    return normalizeFrontDoorIntakeDraft(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

type ServerSupabaseClient = Awaited<ReturnType<typeof getServerAuthContext>>["supabase"];

async function ensureSelectedPlan(args: {
  supabase: ServerSupabaseClient;
  user: {
    id: string;
    email?: string | null;
    created_at?: string | null;
    user_metadata?: Record<string, unknown> | null;
  };
}) {
  const initialAccess = resolveAccountPlanAccess(args.user);
  let effectiveUser = args.user;

  if (!initialAccess.hasSelectedPlan) {
    const metadataUpdate = buildAccountPlanMetadataUpdate({
      planId: "free",
      billingInterval: "monthly",
      existingAccess: initialAccess,
      existingAccountCreatedAt: args.user.created_at ?? null
    });
    const { data, error } = await args.supabase.auth.updateUser({
      data: metadataUpdate
    });

    if (error) {
      throw new Error(error.message || "Unable to attach the default project plan.");
    }

    effectiveUser =
      data.user ??
      ({
        ...args.user,
        user_metadata: {
          ...(args.user.user_metadata ?? {}),
          ...metadataUpdate
        }
      } as typeof args.user);
  }

  const access = await syncAccountPlanAccess({
    supabase: args.supabase,
    user: effectiveUser
  });

  return {
    user: effectiveUser,
    access
  };
}

export async function createProjectFromRoadmap(formData: FormData) {
  const rawDraft = safeString(formData.get("intakePayload"));
  const draft = parseIntakeDraft(rawDraft);

  if (!draft) {
    redirect(
      buildRoadmapRedirect({
        error: "Your roadmap draft expired. Start the intake again."
      })
    );
  }

  const preview = buildFrontDoorPreview(draft);
  const buildSession = buildFrontDoorBuildSession(draft);

  if (!preview || !buildSession) {
    redirect(
      buildRoadmapRedirect({
        error: "We need a little more project detail before opening the workspace."
      })
    );
  }

  const { supabase, user } = await getServerAuthContext();

  if (!user) {
    redirect(
      buildAuthRedirectPath({
        nextPath: "/roadmap",
        notice: "Sign in to continue into your roadmap and workspace."
      })
    );
  }

  const { user: effectiveUser, access } = await ensureSelectedPlan({
    supabase,
    user
  });

  try {
    assertCanCreateEngine(access);
  } catch (error) {
    redirect(
      buildRoadmapRedirect({
        error:
          error instanceof Error
            ? error.message
            : "Unable to open a new project workspace right now."
      })
    );
  }

  const storedMetadata = buildStoredProjectMetadata({
    title: preview.title,
    description: preview.shortProductDescription,
    guidedEntryContext: {
      source: "homepage-guide",
      productTypeId: preview.productTypeId,
      productTypeLabel: preview.productTypeLabel,
      selectedPathId: preview.likelyPathId,
      selectedPathLabel: preview.likelyPathLabel,
      recommendedPathId: preview.likelyPathId,
      recommendedPathLabel: preview.likelyPathLabel,
      userIntent: preview.shortProductDescription,
      preferences: [
        preview.buildModeLabel,
        preview.recommendedStartingPointLabel,
        ...draft.concerns
      ].slice(0, 4),
      updatedAt: new Date().toISOString()
    },
    buildSession
  });

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      owner_id: effectiveUser.id,
      name: preview.title,
      description: encodeWorkspaceProjectDescription(
        preview.shortProductDescription,
        storedMetadata
      )
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      buildRoadmapRedirect({
        error: error?.message ?? "Unable to create the project workspace."
      })
    );
  }

  const tenancy = await ensureWorkspaceTenancyRecords({
    supabase,
    user: effectiveUser,
    access,
    workspaceId: data.id
  }).catch(() => ({
    organizationId: null
  }));

  await recordOnboardingDecisionAndBuildSession({
    supabase,
    user: effectiveUser,
    access,
    workspaceId: data.id,
    workspaceName: preview.title,
    visibleDescription: preview.shortProductDescription,
    projectMetadata: storedMetadata,
    organizationId: tenancy.organizationId
  }).catch(() => {
    // Keep the workspace usable even if supporting tables are not present yet.
  });

  await recordPlatformEvent({
    supabase,
    userId: effectiveUser.id,
    workspaceId: data.id,
    organizationId: tenancy.organizationId,
    eventType: "project_created_from_roadmap",
    details: {
      productType: preview.productTypeLabel,
      buildMode: preview.buildModeLabel,
      likelyPath: preview.likelyPathLabel,
      startingPoint: preview.recommendedStartingPointLabel
    }
  }).catch(() => {
    // Optional analytics trail.
  });

  try {
    await consumeEngineCreationCredits({
      supabase,
      user: effectiveUser,
      activeEnginesUsed: access.activeEnginesUsed + 1
    });
  } catch (usageError) {
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    redirect(
      `/workspace/${data.id}/project/${data.id}?error=${encodeURIComponent(
        usageError instanceof Error
          ? `Project created, but usage could not be synced. ${usageError.message}`
          : "Project created, but usage could not be synced."
      )}`
    );
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/workspace/${data.id}/project/${data.id}`);
}
