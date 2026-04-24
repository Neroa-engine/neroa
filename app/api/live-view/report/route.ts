import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getAccessibleWorkspace } from "@/lib/platform/foundation";
import { getLiveViewSessionById } from "@/lib/live-view/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser({
    message: "Sign in before reading Live View reports."
  });
  if (!auth.ok) {
    return auth.response;
  }

  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!workspaceId || !sessionId) {
    return NextResponse.json(
      { error: "workspaceId and sessionId are required." },
      { status: 400 }
    );
  }

  const { supabase, user } = auth;
  const workspace = await getAccessibleWorkspace({
    supabase,
    userId: user.id,
    workspaceId
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  }

  const session = await getLiveViewSessionById(sessionId);
  if (!session || session.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Live View session not found." }, { status: 404 });
  }

  return NextResponse.json({
    report: session.report,
    findings: session.findings,
    guardrails: session.guardrails,
    recommendations: session.recommendations
  });
}
