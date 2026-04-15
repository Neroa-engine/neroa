import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bindLiveViewSession } from "@/lib/live-view/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bindSchema = z.object({
  tabUrl: z.string().url(),
  pageTitle: z.string().nullable().optional().default(null),
  origin: z.string().url(),
  source: z.enum(["workspace-page", "extension-panel", "inspection"])
});

function readBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}

export async function POST(request: NextRequest) {
  const token = readBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing Live View session token." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const parsed = bindSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Live View bind payload." }, { status: 400 });
  }

  try {
    const result = await bindLiveViewSession({
      token,
      payload: parsed.data
    });

    return NextResponse.json({
      ok: true,
      summary: result.summary
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to bind the Live View session."
      },
      { status: 400 }
    );
  }
}
