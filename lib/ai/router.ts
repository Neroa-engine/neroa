import { runAnthropic } from "@/lib/ai/providers/anthropic";
import { runCodex } from "@/lib/ai/providers/codex";
import { runOpenAI } from "@/lib/ai/providers/openai";
import type { AIChatRequest, WorkerConfig } from "@/lib/ai/types";
import { workerRegistry } from "@/lib/ai/workers";

type RouteAIResult = {
  worker: WorkerConfig;
  reply: string;
};

function createRouteError(message: string, status: number) {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}

export async function routeAI({
  workerId,
  message,
  context
}: AIChatRequest): Promise<RouteAIResult> {
  const worker = workerRegistry[workerId];

  if (!worker) {
    throw createRouteError(`Unsupported worker: ${workerId}.`, 400);
  }

  switch (worker.provider) {
    case "openai":
      return {
        worker,
        reply: await runOpenAI({
          systemPrompt: worker.systemPrompt,
          message,
          context
        })
      };
    case "anthropic":
      return {
        worker,
        reply: await runAnthropic({
          systemPrompt: worker.systemPrompt,
          message,
          context
        })
      };
    case "codex":
      return {
        worker,
        reply: await runCodex({
          systemPrompt: worker.systemPrompt,
          message,
          context
        })
      };
    case "github":
      throw createRouteError(
        "GitHub is a context connector and should use the GitHub routes unless repo context is supplied.",
        400
      );
    default:
      throw createRouteError(`Unsupported provider: ${worker.provider}.`, 400);
  }
}
