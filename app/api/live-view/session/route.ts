import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser, type AuthenticatedServerContext } from "@/lib/auth";
import { getAccessibleWorkspace } from "@/lib/platform/foundation";
import {
  buildLiveViewConnectionPayload,
  createLiveViewSession,
  getOrCreateProjectLiveViewSession,
  getLiveViewSessionById,
  getLiveViewSessionByToken,
  listLiveViewSessionsForProject,
  mapLiveViewSessionToRuntimeTarget,
  mapLiveViewSessionSummaries
} from "@/lib/live-view/store";
import { resolveLocalRuntimeStorageStatusCode } from "@/lib/runtime/local-runtime-storage";
import { resolveBrowserRuntimeRequestOrigin } from "@/lib/browser-runtime-v2/runtime-target";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSessionSchema = z.object({
  workspaceId: z.string().min(1),
  projectId: z.string().min(1),
  projectTitle: z.string().min(1).optional(),
  reuseExisting: z.boolean().optional().default(true)
});

async function assertWorkspaceAccess(
  workspaceId: string,
  auth: Pick<AuthenticatedServerContext, "supabase" | "user">
) {
  const { supabase, user } = auth;
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
  const liveViewToken = request.nextUrl.searchParams.get("liveViewToken")?.trim() || null;
  const requestOrigin = resolveBrowserRuntimeRequestOrigin(headers());

  if (!workspaceId || !projectId) {
    return NextResponse.json(
      { error: "workspaceId and projectId are required." },
      { status: 400 }
    );
  }

  if (sessionId && liveViewToken) {
    const tokenSession = await getLiveViewSessionByToken(liveViewToken).then((session) =>
      session &&
      session.id === sessionId &&
      session.workspaceId === workspaceId &&
      session.projectId === projectId
        ? session
        : null
    );

    if (tokenSession) {
      const runtimeTargetSession = mapLiveViewSessionToRuntimeTarget(tokenSession, requestOrigin);

      return NextResponse.json({
        session: runtimeTargetSession,
        connection: buildLiveViewConnectionPayload(runtimeTargetSession),
        sessions: mapLiveViewSessionSummaries([runtimeTargetSession])
      });
    }
  }

  const auth = await requireApiUser({
    message: "Sign in before using Live View."
  });
  if (!auth.ok) {
    return auth.response;
  }

  const access = await assertWorkspaceAccess(workspaceId, auth);
  if (!access.ok) {
    return access.response;
  }

  const sessions = await listLiveViewSessionsForProject({
    workspaceId,
    projectId,
    preferredOrigin: requestOrigin
  });
  const activeSession = sessionId
    ? await getLiveViewSessionById(sessionId).then((session) =>
        session &&
        session.workspaceId === workspaceId &&
        session.projectId === projectId
          ? session
          : null
      )
    : sessions[0] ?? null;
  const mappedSessions = sessions.map((session) =>
    mapLiveViewSessionToRuntimeTarget(session, requestOrigin)
  );
  const mappedActiveSession = activeSession
    ? mapLiveViewSessionToRuntimeTarget(activeSession, requestOrigin)
    : null;

  return NextResponse.json({
    session: mappedActiveSession,
    connection: mappedActiveSession
      ? buildLiveViewConnectionPayload(mappedActiveSession)
      : null,
    sessions: mapLiveViewSessionSummaries(mappedSessions)
  });
}

export async function POST(request: NextRequest) {
  const requestOrigin = resolveBrowserRuntimeRequestOrigin(headers());
  const auth = await requireApiUser({
    message: "Sign in before using Live View."
  });
  if (!auth.ok) {
    return auth.response;
  }

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

  const access = await assertWorkspaceAccess(parsed.data.workspaceId, auth);
  if (!access.ok) {
    return access.response;
  }

  try {
    const session = parsed.data.reuseExisting
      ? await getOrCreateProjectLiveViewSession({
          workspaceId: parsed.data.workspaceId,
          projectId: parsed.data.projectId,
          projectTitle: parsed.data.projectTitle ?? access.workspace.name,
          bridgeOrigin: requestOrigin,
          preferredOrigin: requestOrigin,
          createdByUserId: access.user.id,
          createdByEmail: access.user.email ?? null
        })
      : await createLiveViewSession({
          workspaceId: parsed.data.workspaceId,
          projectId: parsed.data.projectId,
          projectTitle: parsed.data.projectTitle ?? access.workspace.name,
          bridgeOrigin: requestOrigin,
          createdByUserId: access.user.id,
          createdByEmail: access.user.email ?? null
        });

    const mappedSession = mapLiveViewSessionToRuntimeTarget(session, requestOrigin);

    return NextResponse.json({
      session: mappedSession,
      connection: buildLiveViewConnectionPayload(mappedSession)
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create or attach the live browser session."
      },
      { status: resolveLocalRuntimeStorageStatusCode(error, 400) }
    );
  }
}
