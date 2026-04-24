import { NextRequest, NextResponse } from "next/server";
import {
  requireLiveViewQcSession,
  type LiveViewQcPageAssociationInput
} from "@/lib/live-view/qc-library-bridge";
import { resolveLocalRuntimeStorageStatusCode } from "@/lib/runtime/local-runtime-storage";

function readBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}

export async function requireLiveViewQcRouteSession(request: NextRequest) {
  const token = readBearerToken(request);

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Missing Live View session token." },
        { status: 401 }
      )
    };
  }

  try {
    const session = await requireLiveViewQcSession(token);

    return {
      ok: true as const,
      token,
      session
    };
  } catch (error) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Live View session not found."
        },
        { status: resolveLocalRuntimeStorageStatusCode(error, 404) }
      )
    };
  }
}

export type { LiveViewQcPageAssociationInput };
