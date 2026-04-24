import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isMissingPlatformTableError } from "@/lib/platform/foundation-shared";

export const ACTIVE_PROJECT_COOKIE = "neroa-active-project";

export const ACTIVE_PROJECT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type ServerSupabaseClient = ReturnType<typeof createSupabaseServerClient>;

export function normalizeActiveProjectId(value: string | null | undefined) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

export function extractWorkspaceIdFromPathname(pathname: string) {
  const match = pathname.match(/^\/workspace\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function resolveActiveProjectId(args: {
  cookieValue?: string | null;
  persistedValue?: string | null;
  accessibleWorkspaceIds: string[];
}) {
  const normalizedCookie = normalizeActiveProjectId(args.cookieValue);
  const normalizedPersisted = normalizeActiveProjectId(args.persistedValue);

  if (normalizedCookie && args.accessibleWorkspaceIds.includes(normalizedCookie)) {
    return normalizedCookie;
  }

  if (normalizedPersisted && args.accessibleWorkspaceIds.includes(normalizedPersisted)) {
    return normalizedPersisted;
  }

  return null;
}

export async function loadPersistedActiveProjectId(args: {
  supabase: ServerSupabaseClient;
  userId: string;
}) {
  const { data, error } = await args.supabase
    .from("profiles")
    .select("active_workspace_id")
    .eq("user_id", args.userId)
    .maybeSingle();

  if (error) {
    if (isMissingPlatformTableError(error)) {
      return null;
    }

    throw new Error(error.message || "Unable to load the saved active project.");
  }

  return normalizeActiveProjectId(data?.active_workspace_id ?? null);
}

export async function persistActiveProjectId(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  workspaceId: string;
}) {
  const normalizedWorkspaceId = normalizeActiveProjectId(args.workspaceId);

  if (!normalizedWorkspaceId) {
    return false;
  }

  const now = new Date().toISOString();
  const { error } = await args.supabase.from("profiles").upsert(
    {
      user_id: args.userId,
      active_workspace_id: normalizedWorkspaceId,
      last_seen_at: now,
      updated_at: now
    },
    {
      onConflict: "user_id"
    }
  );

  if (error) {
    if (isMissingPlatformTableError(error)) {
      return false;
    }

    throw new Error(error.message || "Unable to save the active project.");
  }

  return true;
}

export async function clearPersistedActiveProjectId(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  workspaceId?: string | null;
}) {
  let query = args.supabase
    .from("profiles")
    .update({
      active_workspace_id: null,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", args.userId);

  const normalizedWorkspaceId = normalizeActiveProjectId(args.workspaceId);

  if (normalizedWorkspaceId) {
    query = query.eq("active_workspace_id", normalizedWorkspaceId);
  }

  const { error } = await query;

  if (error && !isMissingPlatformTableError(error)) {
    throw new Error(error.message || "Unable to clear the saved active project.");
  }
}
