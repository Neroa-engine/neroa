import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { browserRuntimeV2ActionValues } from "@/lib/browser-runtime-v2/contracts";
import { patchLiveViewRuntimeV2State } from "@/lib/live-view/store";
import { resolveLocalRuntimeStorageStatusCode } from "@/lib/runtime/local-runtime-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const targetSchema = z.object({
  tabId: z.number(),
  windowId: z.number().nullable(),
  url: z.string().url(),
  title: z.string().nullable(),
  updatedAt: z.string().datetime()
});

const runtimeV2StateSchema = z.object({
  currentTarget: targetSchema.nullable().optional(),
  lastCommandAt: z.string().datetime().nullable().optional(),
  lastCommandAction: z.enum(browserRuntimeV2ActionValues).nullable().optional(),
  lastCommandError: z.string().nullable().optional(),
  recording: z
    .object({
      status: z.enum(["idle", "capturing", "processing", "ready", "failed"]).optional(),
      recordingId: z.string().uuid().nullable().optional(),
      linkedReportId: z.string().uuid().nullable().optional(),
      startedAt: z.string().datetime().nullable().optional(),
      stoppedAt: z.string().datetime().nullable().optional(),
      summary: z.string().nullable().optional(),
      storagePath: z.string().nullable().optional(),
      durationMs: z.number().nullable().optional(),
      statusReason: z.string().nullable().optional()
    })
    .optional(),
  walkthrough: z
    .object({
      status: z.enum(["idle", "running", "ready", "failed"]).optional(),
      outputId: z.string().uuid().nullable().optional(),
      startedAt: z.string().datetime().nullable().optional(),
      completedAt: z.string().datetime().nullable().optional(),
      targetUrl: z.string().url().nullable().optional(),
      summary: z.string().nullable().optional(),
      nextActionLabel: z.string().nullable().optional(),
      lastExecutionMode: z.enum(["scan", "focus-next", "activate-focused"]).nullable().optional(),
      statusReason: z.string().nullable().optional()
    })
    .optional(),
  sopOutput: z
    .object({
      status: z.enum(["idle", "ready", "failed"]).optional(),
      outputId: z.string().uuid().nullable().optional(),
      generatedAt: z.string().datetime().nullable().optional(),
      summary: z.string().nullable().optional(),
      statusReason: z.string().nullable().optional()
    })
    .optional()
});

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

  const parsed = runtimeV2StateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid Browser Runtime V2 state payload." },
      { status: 400 }
    );
  }

  try {
    const result = await patchLiveViewRuntimeV2State({
      token,
      patch: parsed.data
    });

    return NextResponse.json({
      ok: true,
      session: result.session,
      summary: result.summary
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update Browser Runtime V2 session state."
      },
      { status: resolveLocalRuntimeStorageStatusCode(error, 400) }
    );
  }
}
