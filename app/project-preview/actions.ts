"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
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
import { buildAuthRedirectPath, normalizeAppPath } from "@/lib/auth/routes";
import { getServerAuthContext } from "@/lib/auth";
import {
  buildStoredProjectMetadata,
  encodeWorkspaceProjectDescription
} from "@/lib/workspace/project-metadata";

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function safeNextPath(value: string, fallback = "/project-preview") {
  return normalizeAppPath(value, fallback);
}

function buildPreviewRedirect(params: { error?: string; notice?: string }) {
  const searchParams = new URLSearchParams();

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.notice) {
    searchParams.set("notice", params.notice);
  }

  return searchParams.size > 0 ? `/project-preview?${searchParams.toString()}` : "/project-preview";
}

function normalizeAuthErrorMessage(message: string) {
  if (message.toLowerCase() === "email not confirmed") {
    return "Email not confirmed. Confirm your email first, then sign in to continue.";
  }

  return message;
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

function resolveSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const headerStore = headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin.replace(/\/$/, "");
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto =
    headerStore.get("x-forwarded-proto") ??
    (host?.includes("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");

  if (host) {
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

function buildPreviewConfirmationUrl() {
  const url = new URL("/auth/confirm", resolveSiteOrigin());
  url.searchParams.set("next", "/project-preview");
  return url.toString();
}

async function ensureSelectedPlan(args: {
  supabase: Awaited<ReturnType<typeof getServerAuthContext>>["supabase"];
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

export async function signInFromPreview(formData: FormData) {
  const email = safeString(formData.get("email"));
  const password = safeString(formData.get("password"));
  const next = safeNextPath(safeString(formData.get("next")));

  const { supabase } = await getServerAuthContext();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(buildPreviewRedirect({ error: normalizeAuthErrorMessage(error.message) }));
  }

  redirect(next);
}

export async function signUpFromPreview(formData: FormData) {
  const email = safeString(formData.get("email"));
  const password = safeString(formData.get("password"));
  const name = safeString(formData.get("name"));
  const next = safeNextPath(safeString(formData.get("next")));

  const { supabase } = await getServerAuthContext();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: buildPreviewConfirmationUrl(),
      data: {
        name,
        full_name: name
      }
    }
  });

  if (error) {
    redirect(buildPreviewRedirect({ error: error.message }));
  }

  if (!data.session) {
    redirect(
      buildPreviewRedirect({
        notice:
          "Account created. Confirm your email, then sign in to continue into your project workspace."
      })
    );
  }

  redirect(next);
}

export async function createProjectFromPreview(formData: FormData) {
  const rawDraft = safeString(formData.get("intakePayload"));
  const draft = parseIntakeDraft(rawDraft);

  if (!draft) {
    redirect(
      buildPreviewRedirect({
        error: "Your project preview expired. Start the intake again."
      })
    );
  }

  const preview = buildFrontDoorPreview(draft);
  const buildSession = buildFrontDoorBuildSession(draft);

  if (!preview || !buildSession) {
    redirect(
      buildPreviewRedirect({
        error: "We need a little more project detail before opening the workspace."
      })
    );
  }

  const { supabase, user } = await getServerAuthContext();

  if (!user) {
    redirect(
      buildAuthRedirectPath({
        nextPath: "/project-preview",
        notice: "Create your account or sign in to continue into the project workspace."
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
      buildPreviewRedirect({
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
      preferences: [preview.buildModeLabel, ...draft.concerns].slice(0, 4),
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
      buildPreviewRedirect({
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
    eventType: "project_created_from_preview",
    details: {
      productType: preview.productTypeLabel,
      buildMode: preview.buildModeLabel,
      likelyPath: preview.likelyPathLabel
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
