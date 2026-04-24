import { NextResponse } from "next/server";
import {
  requireApiUser,
  type AuthenticatedServerContext
} from "@/lib/auth";
import { getAccessibleWorkspace } from "@/lib/platform/foundation";
import {
  parseWorkspaceProjectDescription,
  type StoredProjectMetadata
} from "@/lib/workspace/project-metadata";

type ProjectQcRouteContextArgs = {
  workspaceId: string;
  projectId: string;
  message: string;
  requireOwner?: boolean;
};

export type ProjectQcRouteContext = {
  supabase: AuthenticatedServerContext["supabase"];
  user: AuthenticatedServerContext["user"];
  workspace: {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    accessMode: "owner" | "member";
  };
  projectMetadata: StoredProjectMetadata | null;
};

export async function requireProjectQcRouteContext(
  args: ProjectQcRouteContextArgs
):
  Promise<
    | {
        ok: true;
        context: ProjectQcRouteContext;
      }
    | {
        ok: false;
        response: NextResponse;
      }
  > {
  const auth = await requireApiUser({
    message: args.message
  });

  if (!auth.ok) {
    return {
      ok: false,
      response: auth.response
    };
  }

  const workspace = await getAccessibleWorkspace({
    supabase: auth.supabase,
    userId: auth.user.id,
    workspaceId: args.workspaceId
  });

  if (!workspace) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Workspace not found." }, { status: 404 })
    };
  }

  if (args.projectId !== workspace.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Project not found." }, { status: 404 })
    };
  }

  if (args.requireOwner && workspace.accessMode !== "owner") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Only the project owner can write QC assets." },
        { status: 403 }
      )
    };
  }

  const parsedWorkspace = parseWorkspaceProjectDescription(workspace.description);

  return {
    ok: true,
    context: {
      supabase: auth.supabase,
      user: auth.user,
      workspace: {
        ...workspace,
        description: parsedWorkspace.visibleDescription,
        accessMode: workspace.accessMode as "owner" | "member"
      },
      projectMetadata: parsedWorkspace.metadata
    }
  };
}
