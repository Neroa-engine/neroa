import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { inspectLiveViewSession } from "@/lib/live-view/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const controlSchema = z.object({
  id: z.string().optional().default(""),
  kind: z
    .enum(["button", "link", "input", "select", "textarea", "menu", "modal", "section", "other"])
    .optional()
    .default("other"),
  tagName: z.string().optional().default(""),
  text: z.string().optional().default(""),
  label: z.string().nullable().optional().default(null),
  href: z.string().nullable().optional().default(null),
  role: z.string().nullable().optional().default(null),
  type: z.string().nullable().optional().default(null),
  visible: z.boolean().optional().default(true),
  disabled: z.boolean().optional().default(false)
});

const sectionSchema = z.object({
  id: z.string().optional().default(""),
  label: z.string().optional().default(""),
  heading: z.string().nullable().optional().default(null),
  description: z.string().nullable().optional().default(null)
});

const runtimeIssueSchema = z.object({
  id: z.string().optional().default(""),
  kind: z
    .enum([
      "console-error",
      "console-warn",
      "window-error",
      "unhandled-rejection",
      "network-failure",
      "route-error",
      "hydration-error"
    ])
    .optional()
    .default("console-error"),
  message: z.string(),
  source: z.string().nullable().optional().default(null),
  statusCode: z.number().nullable().optional().default(null),
  url: z.string().nullable().optional().default(null),
  createdAt: z.string().optional().default("")
});

const actionLogSchema = z.object({
  id: z.string().optional().default(""),
  timestamp: z.string().optional().default(""),
  type: z
    .enum(["page-load", "navigation", "click", "submit", "recording", "inspection"])
    .optional()
    .default("inspection"),
  label: z.string().optional().default("Inspection event"),
  detail: z.string().nullable().optional().default(null),
  url: z.string().optional().default("")
});

const inspectSchema = z.object({
  snapshot: z.object({
    trigger: z.string().optional().default("manual"),
    page: z.object({
      url: z.string().url(),
      pathname: z.string(),
      title: z.string().optional().default(""),
      hostname: z.string().optional().default("")
    }),
    currentStep: z.string().nullable().optional().default(null),
    headings: z.array(z.string()).optional().default([]),
    visibleText: z.array(z.string()).optional().default([]),
    controls: z.array(controlSchema).optional().default([]),
    sections: z.array(sectionSchema).optional().default([]),
    runtimeIssues: z.array(runtimeIssueSchema).optional().default([]),
    metrics: z.object({
      viewportWidth: z.number(),
      viewportHeight: z.number(),
      scrollWidth: z.number(),
      scrollHeight: z.number(),
      horizontalOverflow: z.boolean(),
      modalOpen: z.boolean()
    })
  }),
  actionLogs: z.array(actionLogSchema).optional().default([]),
  recordingEnabled: z.boolean().optional(),
  screenshotDataUrl: z.string().nullable().optional().default(null)
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

  const parsed = inspectSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Live View inspection payload." }, { status: 400 });
  }

  try {
    const result = await inspectLiveViewSession({
      token,
      payload: parsed.data
    });

    return NextResponse.json({
      ok: true,
      summary: result.summary,
      recommendations: result.session.recommendations,
      findings: result.session.findings.slice(0, 12),
      guardrails: result.session.guardrails
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to inspect the live session."
      },
      { status: 400 }
    );
  }
}
