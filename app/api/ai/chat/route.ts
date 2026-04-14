import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildCreditsExceededMessage } from "@/lib/account/plan-access";
import { consumeAiChatCredits, syncAccountPlanAccess } from "@/lib/account/plan-usage-server";
import { routeAI } from "@/lib/ai/router";
import { recordPlatformEvent } from "@/lib/platform/foundation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Sign in before using guided AI actions."
        },
        { status: 401 }
      );
    }

    const json = await request.json();
    console.log("AI_CHAT_RAW_BODY", json);

    const body = bodySchema.parse(json);
    console.log("AI_CHAT_REQUEST", body.workerId);
    const access = await syncAccountPlanAccess({
      supabase,
      user
    });

    if (!access.hasSelectedPlan) {
      await recordPlatformEvent({
        supabase,
        userId: user.id,
        eventType: "ai_action_gated_no_plan",
        severity: "warning"
      }).catch(() => {
        // Optional platform event.
      });

      return NextResponse.json(
        {
          ok: false,
          error: "Choose a plan before using guided AI actions."
        },
        { status: 403 }
      );
    }

    if (
      !access.isAdmin &&
      access.monthlyEngineCredits !== null &&
      access.engineCreditsRemaining !== null &&
      access.engineCreditsRemaining <= 0
    ) {
      await recordPlatformEvent({
        supabase,
        userId: user.id,
        eventType: "ai_action_gated_credit_limit",
        severity: "warning",
        details: {
          remainingCredits: access.engineCreditsRemaining
        }
      }).catch(() => {
        // Optional platform event.
      });

      return NextResponse.json(
        {
          ok: false,
          error: buildCreditsExceededMessage(access)
        },
        { status: 403 }
      );
    }

    const reply = await routeAI({
      workerId: body.workerId,
      message: body.message,
      context: normalizeContext(body.context),
    });

    await consumeAiChatCredits({
      supabase,
      user
    });

    return NextResponse.json({
      ok: true,
      worker: workerMeta[body.workerId],
      reply,
    });
  } catch (error) {
    console.error("AI_CHAT_ROUTE_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
