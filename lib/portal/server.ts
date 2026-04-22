import { APP_ROUTES } from "@/lib/routes";
import {
  buildProjectRoomRoute,
  buildProjectWorkspaceRoute
} from "@/lib/portal/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerSupabaseClient = ReturnType<typeof createSupabaseServerClient>;

type WorkspaceRecord = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type PortalProjectSummary = {
  workspaceId: string;
  projectId: string;
  title: string;
  description: string | null;
  createdAt: string;
  workspaceRoute: string;
  strategyRoomRoute: string;
  commandCenterRoute: string;
  buildRoomRoute: string;
};

function compactDescription(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.length > 220 ? `${trimmed.slice(0, 220).trimEnd()}...` : trimmed;
}

export function buildPortalProjectSummary(workspace: WorkspaceRecord): PortalProjectSummary {
  return {
    workspaceId: workspace.id,
    projectId: workspace.id,
    title: workspace.name,
    description: compactDescription(workspace.description),
    createdAt: workspace.created_at,
    workspaceRoute: buildProjectWorkspaceRoute(workspace.id),
    strategyRoomRoute: buildProjectRoomRoute(workspace.id, "strategy-room"),
    commandCenterRoute: buildProjectRoomRoute(workspace.id, "command-center"),
    buildRoomRoute: buildProjectRoomRoute(workspace.id, "build-room")
  };
}

export async function loadPortalProjectSummariesForUser(args: {
  supabase: ServerSupabaseClient;
  userId: string;
}) {
  const { data, error } = await args.supabase
    .from("workspaces")
    .select("id, name, description, created_at")
    .eq("owner_id", args.userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as WorkspaceRecord[]).map((workspace) => buildPortalProjectSummary(workspace));
}

export async function resolveSmartResumeDestination(args: {
  supabase: ServerSupabaseClient;
  userId: string;
}) {
  const projects = await loadPortalProjectSummariesForUser(args);
  return projects[0]?.workspaceRoute ?? APP_ROUTES.start;
}
