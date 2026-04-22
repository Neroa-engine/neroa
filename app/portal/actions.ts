"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  ACTIVE_PROJECT_COOKIE,
  ACTIVE_PROJECT_COOKIE_MAX_AGE,
  persistActiveProjectId
} from "@/lib/portal/active-project";
import {
  buildProjectRoomRoute,
  type ProjectPortalRoomId
} from "@/lib/portal/routes";
import { getAccessibleWorkspace } from "@/lib/platform/foundation";
import { APP_ROUTES } from "@/lib/routes";
import { parseWorkspaceProjectDescription } from "@/lib/workspace/project-metadata";

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isProjectPortalRoomId(value: string): value is ProjectPortalRoomId {
  return (
    value === "strategy-room" ||
    value === "project-workspace" ||
    value === "command-center" ||
    value === "build-room"
  );
}

function withError(path: string, message: string) {
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}error=${encodeURIComponent(message)}`;
}

function isArchivedWorkspace(description: string | null) {
  const parsed = parseWorkspaceProjectDescription(description);
  return Boolean(parsed.metadata?.archived);
}

export async function setActiveProjectContext(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const destinationHint = safeString(formData.get("destination")) || APP_ROUTES.dashboard;
  const returnTo = safeString(formData.get("returnTo")) || APP_ROUTES.projects;
  const roomId = safeString(formData.get("roomId"));

  if (!workspaceId) {
    redirect(withError(returnTo, "Choose a project before switching context."));
  }

  const { supabase, user } = await requireUser({
    nextPath: destinationHint
  });
  const workspace = await getAccessibleWorkspace({
    supabase,
    userId: user.id,
    workspaceId
  }).catch(() => null);

  if (!workspace) {
    redirect(withError(returnTo, "That project is no longer available from this account."));
  }

  if (isArchivedWorkspace(workspace.description)) {
    redirect(withError(returnTo, "Restore this project before making it active again."));
  }

  const destination = isProjectPortalRoomId(roomId)
    ? buildProjectRoomRoute(workspaceId, roomId)
    : destinationHint;

  cookies().set(ACTIVE_PROJECT_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ACTIVE_PROJECT_COOKIE_MAX_AGE
  });

  await persistActiveProjectId({
    supabase,
    userId: user.id,
    workspaceId
  }).catch(() => {
    // Keep the active-project switch working even if the durable preference cannot be saved yet.
  });

  redirect(destination);
}
