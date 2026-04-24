import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import { getServerAuthContext } from "@/lib/auth";
import { buildAuthRedirectPath } from "@/lib/auth/routes";
import {
  assertCanCreateEngine,
  consumeEngineCreationCredits,
  syncAccountPlanAccess
} from "@/lib/account/plan-usage-server";
import { normalizeBuildSession, type GuidedBuildSession } from "@/lib/onboarding/build-session";
import {
  normalizeGuidedBuildHandoff,
  type GuidedBuildHandoff,
  type GuidedBuildPathId
} from "@/lib/onboarding/guided-handoff";
import {
  ensureWorkspaceTenancyRecords,
  recordOnboardingDecisionAndBuildSession,
  recordPlatformEvent
} from "@/lib/platform/foundation";
import { APP_ROUTES } from "@/lib/routes";
import {
  encodeWorkspaceProjectDescription,
  type StoredProjectMetadata
} from "@/lib/workspace/project-metadata";

export type ServerSupabaseClient = Awaited<ReturnType<typeof getServerAuthContext>>["supabase"];
type ServerUser = NonNullable<Awaited<ReturnType<typeof getServerAuthContext>>["user"]>;
export type EngineCreationAccess = Awaited<ReturnType<typeof syncAccountPlanAccess>>;

export function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseGuidedBuildHandoff(rawValue: string): GuidedBuildHandoff | null {
  if (!rawValue.trim()) {
    return null;
  }

  try {
    return normalizeGuidedBuildHandoff(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

export function parseBuildSessionSnapshot(rawValue: string): GuidedBuildSession | null {
  if (!rawValue.trim()) {
    return null;
  }

  try {
    return normalizeBuildSession(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

export function appendErrorToPath(path: string, message: string) {
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}error=${encodeURIComponent(message)}`;
}

export function normalizeEntryPathId(value: string): GuidedBuildPathId {
  return value === "managed" ? "managed" : "diy";
}

async function createWorkspaceRecord(args: {
  supabase: ServerSupabaseClient;
  ownerId: string;
  name: string;
  visibleDescription: string | null;
  storedMetadata: StoredProjectMetadata;
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
  supabase: ServerSupabaseClient;
  user: ServerUser;
  access: EngineCreationAccess;
  workspaceId: string;
  workspaceName: string;
  visibleDescription: string | null;
  storedMetadata: StoredProjectMetadata;
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

export async function requireUserReadyForEngineCreation(args: {
  authNextPath: string;
  startErrorPath: string;
  planErrorPath?: string;
}) {
  const { supabase, user } = await getServerAuthContext();

  if (!user) {
    redirect(
      buildAuthRedirectPath({
        nextPath: args.authNextPath,
        notice: "Sign in to continue into your engine."
      })
    );
  }

  const initialAccess = resolveAccountPlanAccess(user);

  if (!initialAccess.hasSelectedPlan) {
    redirect(
      appendErrorToPath(
        args.planErrorPath ?? APP_ROUTES.startDiy,
        "Choose a plan before creating your engine."
      )
    );
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

export async function createProvisionedWorkspace(args: {
  authNextPath: string;
  startErrorPath: string;
  planErrorPath?: string;
  createErrorPath: string;
  createErrorMessage: string;
  workspaceName: string;
  visibleDescription: string | null;
  storedMetadata: StoredProjectMetadata;
}) {
  const { supabase, user, access } = await requireUserReadyForEngineCreation({
    authNextPath: args.authNextPath,
    startErrorPath: args.startErrorPath,
    planErrorPath: args.planErrorPath
  });

  const { data, error } = await createWorkspaceRecord({
    supabase,
    ownerId: user.id,
    name: args.workspaceName,
    visibleDescription: args.visibleDescription,
    storedMetadata: args.storedMetadata
  });

  if (error || !data) {
    redirect(
      appendErrorToPath(
        args.createErrorPath,
        error?.message ?? args.createErrorMessage
      )
    );
  }

  await finalizeEngineProvisioning({
    supabase,
    user,
    access,
    workspaceId: data.id,
    workspaceName: args.workspaceName,
    visibleDescription: args.visibleDescription,
    storedMetadata: args.storedMetadata
  });

  return {
    supabase,
    user,
    access,
    workspaceId: data.id
  };
}

export async function syncEngineCreationUsageOrRedirect(args: {
  supabase: ServerSupabaseClient;
  user: ServerUser;
  access: EngineCreationAccess;
  workspaceId: string;
  createdLabel: "Engine" | "Workspace";
}) {
  try {
    await consumeEngineCreationCredits({
      supabase: args.supabase,
      user: args.user,
      activeEnginesUsed: args.access.activeEnginesUsed + 1
    });
  } catch (usageError) {
    revalidatePath("/dashboard");
    redirect(
      `/workspace/${args.workspaceId}/project/${args.workspaceId}?error=${encodeURIComponent(
        usageError instanceof Error
          ? `${args.createdLabel} created, but usage could not be synced. ${usageError.message}`
          : `${args.createdLabel} created, but usage could not be synced.`
      )}`
    );
  }
}

export function revalidateWorkspaceStart(paths: string[]) {
  for (const path of Array.from(new Set(paths))) {
    revalidatePath(path);
  }
}
