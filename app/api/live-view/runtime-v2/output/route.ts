import { NextRequest, NextResponse } from "next/server";
import { browserRuntimeV2OutputWriteSchema, writeBrowserRuntimeV2Output } from "@/lib/browser-runtime-v2/output-store";
import { requireLiveViewQcSession } from "@/lib/live-view/qc-library-bridge";
import { resolveLocalRuntimeStorageStatusCode } from "@/lib/runtime/local-runtime-storage";
import { resolveBrowserRuntimeV2RuntimeTarget } from "@/lib/browser-runtime-v2/runtime-target";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}

export async function POST(request: NextRequest) {
  const token = readBearerToken(request);
  if (!token) {
    return NextResponse.json(
      { error: "Missing Live View session token." },
      { status: 401 }
    );
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const parsed = browserRuntimeV2OutputWriteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid Browser Runtime V2 output payload." },
      { status: 400 }
    );
  }

  try {
    const session = await requireLiveViewQcSession(token);
    const runtimeTarget =
      session.runtimeV2.runtimeTarget ?? resolveBrowserRuntimeV2RuntimeTarget(session.bridgeOrigin);
    const result = await writeBrowserRuntimeV2Output({
      workspaceId: session.workspaceId,
      projectId: session.projectId,
      input: {
        ...parsed.data,
        sourceSessionId: session.id,
        relatedSessionId: session.id,
        createdByUserId: session.createdByUserId,
        createdByEmail: session.createdByEmail,
        runtimeTarget: parsed.data.runtimeTarget ?? runtimeTarget
      }
    });

    return NextResponse.json({
      ok: true,
      output: result.output,
      summary: result.summary
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to write the Browser Runtime V2 output."
      },
      { status: resolveLocalRuntimeStorageStatusCode(error, 400) }
    );
  }
}
