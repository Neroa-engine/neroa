import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  workerId: z.enum(["vector", "axiom", "forge", "anchor"]),
  message: z.string().min(1),
  context: z.unknown().optional(),
});

const workerMeta = {
  vector: {
    id: "vector",
    name: "Vector",
    provider: "openai",
    role: "Strategy / Execution",
  },
  axiom: {
    id: "axiom",
    name: "Axiom",
    provider: "anthropic",
    role: "Research / Long-form Reasoning",
  },
  forge: {
    id: "forge",
    name: "Forge",
    provider: "codex",
    role: "Engineering / Build",
  },
  anchor: {
    id: "anchor",
    name: "Anchor",
    provider: "github",
    role: "Repository / Source Context",
  },
} as const;

function normalizeContext(context: unknown) {
  if (typeof context === "string") {
    return context;
  }

  if (context == null) {
    return undefined;
  }

  try {
    return JSON.stringify(context, null, 2);
  } catch {
    return String(context);
  }
}

function isMissingOpenAIKeyError(error: unknown) {
  return error instanceof Error && /Missing OPENAI_API_KEY|Missing credentials/i.test(error.message);
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    console.log("AI_CHAT_RAW_BODY", json);

    const body = bodySchema.parse(json);
    console.log("AI_CHAT_REQUEST", body.workerId);

    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: "OPENAI_API_KEY is not configured on the server."
        },
        { status: 503 }
      );
    }

    const { routeAI } = await import("@/lib/ai/router");
    const reply = await routeAI({
      workerId: body.workerId,
      message: body.message,
      context: normalizeContext(body.context),
    });

    return NextResponse.json({
      ok: true,
      worker: workerMeta[body.workerId],
      reply,
    });
  } catch (error) {
    console.error("AI_CHAT_ROUTE_ERROR", error);

    if (isMissingOpenAIKeyError(error)) {
      return NextResponse.json(
        {
          ok: false,
          error: "OPENAI_API_KEY is not configured on the server."
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
