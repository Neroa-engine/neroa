import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getAccessibleWorkspace } from "@/lib/platform/foundation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildLiveViewConnectionPayload,
  createLiveViewSession,
  getLiveViewSessionById,
  listLiveViewSessionsForProject,
  mapLiveViewSessionSummaries
} from "@/lib/live-view/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSessionSchema = z.object({
  workspaceId: z.string().min(1),
  projectId: z.string().min(1),
  projectTitle: z.string().min(1).optional()
});

function resolveRequestOrigin() {
  const headerStore = headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function assertWorkspaceAccess(workspaceId: string) {
  const { user } = await requireUser({ requirePlan: false });
  const supabase = createSupabaseServerClient();
  const workspace = await getAccessibleWorkspace({
    supabase,
    userId: user.id,
    workspaceId
  });

  if (!workspace) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Workspace not found." }, { status: 404 })
    };
  }

  return {
    ok: true as const,
    supabase,
    user,
    workspace
  };
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const projectId = request.nextUrl.searchParams.get("projectId");
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!workspaceId || !projectId) {
    return NextResponse.json(
      { error: "workspaceId and projectId are required." },
      { status: 400 }
    );
  }

  const access = await assertWorkspaceAccess(workspaceId);
  if (!access.ok) {
    return access.response;
  }

  const sessions = await listLiveViewSessionsForProject({
    workspaceId,
    projectId
  });
  const activeSession = sessionId ? await getLiveViewSessionById(sessionId) : sessions[0] ?? null;

  return NextResponse.json({
    session: activeSession,
    connection: activeSession ? buildLiveViewConnectionPayload(activeSession) : null,
    sessions: mapLiveViewSessionSummaries(sessions)
  });
}

export async function POST(request: NextRequest) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const parsed = createSessionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Live View session request." }, { status: 400 });
  }

  const access = await assertWorkspaceAccess(parsed.data.workspaceId);
  if (!access.ok) {
    return access.response;
  }

  const session = await createLiveViewSession({
    workspaceId: parsed.data.workspaceId,
    projectId: parsed.data.projectId,
    projectTitle: parsed.data.projectTitle ?? access.workspace.name,
    bridgeOrigin: resolveRequestOrigin(),
    createdByUserId: access.user.id,
    createdByEmail: access.user.email ?? null
  });

  return NextResponse.json({
    session,
    connection: buildLiveViewConnectionPayload(session)
  });
}
