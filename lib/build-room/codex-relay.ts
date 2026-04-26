import OpenAI from "openai";
import {
  buildRoomCodexResultSchema,
  type BuildRoomCodexResult,
  type BuildRoomRelayMode,
  type BuildRoomTaskPacket,
  type BuildRoomTaskType
} from "@/lib/build-room/contracts";

type RelayArgs = {
  taskTitle: string;
  taskType: BuildRoomTaskType;
  packet: BuildRoomTaskPacket;
};

function extractJsonBlock(text: string) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]+?)```/i);
  const candidate = fencedMatch?.[1]?.trim() ?? text.trim();
  const firstBraceIndex = candidate.indexOf("{");
  const lastBraceIndex = candidate.lastIndexOf("}");

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
    throw new Error("Codex relay returned content without a valid JSON object.");
  }

  return candidate.slice(firstBraceIndex, lastBraceIndex + 1);
}

function buildMockSuggestedTargets(packet: BuildRoomTaskPacket) {
  const signals = packet.repoContext.signals.map((signal) => signal.toLowerCase());
  const looksLikeNext = signals.some(
    (signal) =>
      signal.includes("next") || signal.includes("saas") || signal.includes("web") || signal.includes("app")
  );

  if (!looksLikeNext) {
    return [];
  }

  return [
    {
      path: "app/**",
      reason: "App routes, server handlers, and page-level integration usually land here."
    },
    {
      path: "components/**",
      reason: "User-facing build-room or feature-surface UI work typically lands here."
    },
    {
      path: "lib/**",
      reason: "Task orchestration, contracts, and integration logic usually live here."
    }
  ];
}

function buildMockCodexResult(args: RelayArgs): BuildRoomCodexResult {
  const warnings: string[] = [
    "Mock relay result. Review the plan before treating it as an implementation-ready answer."
  ];
  const blockers: string[] = [];

  if (!args.packet.acceptanceCriteria) {
    warnings.push("Acceptance criteria are thin, so the approval gate should stay tighter.");
  }

  if (args.packet.riskLevel === "high") {
    warnings.push("High-risk task. Keep worker execution limited and fully human-approved.");
  }

  if (args.packet.requestedOutputMode === "patch_proposal") {
    warnings.push("Mock relay does not generate executable diffs, only a governed proposal shape.");
  }

  return buildRoomCodexResultSchema.parse({
    summary: `Codex would frame "${args.taskTitle}" as a ${args.taskType.replace(/_/g, " ")} task, inspect the current workspace context, and return a governed implementation path before any execution is approved.`,
    implementationPlan: [
      "Review the workspace and lane context so the request stays scoped to the current project truth.",
      "Identify the smallest file or system surface that can satisfy the acceptance criteria cleanly.",
      "Prepare a governed recommendation with risks, review notes, and any file-target guidance before worker approval."
    ],
    suggestedFileTargets: buildMockSuggestedTargets(args.packet),
    patchText: null,
    warnings,
    blockers,
    outputMode: args.packet.requestedOutputMode,
    relayMode: "mock",
    rawText: null
  });
}

function resolveCodexRelayMode(): BuildRoomRelayMode {
  const configured = process.env.BUILD_ROOM_CODEX_MODE?.trim().toLowerCase();

  if (configured === "real") {
    return "real";
  }

  if (configured === "mock") {
    return "mock";
  }

  return process.env.OPENAI_API_KEY?.trim() ? "real" : "mock";
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  return new OpenAI({ apiKey });
}

async function runRealCodexRelay(args: RelayArgs): Promise<BuildRoomCodexResult> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: process.env.BUILD_ROOM_CODEX_MODEL?.trim() || "gpt-5-codex-mini",
    instructions:
      "You are the Neroa Build Room Codex relay. Return one JSON object only. Do not wrap it in markdown. The JSON must contain: summary (string), implementationPlan (string[]), suggestedFileTargets ({path, reason}[]), patchText (string|null), warnings (string[]), blockers (string[]). Respect requestedOutputMode. Never claim that code was executed, merged, or deployed. Any code change must stay proposed only.",
    input: JSON.stringify(args.packet, null, 2)
  });
  const text = response.output_text?.trim();

  if (!text) {
    throw new Error("Codex relay returned an empty response.");
  }

  const parsed = JSON.parse(extractJsonBlock(text));

  return buildRoomCodexResultSchema.parse({
    ...parsed,
    outputMode: parsed.outputMode ?? args.packet.requestedOutputMode,
    relayMode: "real",
    rawText: text
  });
}

export async function relayBuildRoomTaskToCodex(args: RelayArgs): Promise<BuildRoomCodexResult> {
  const mode = resolveCodexRelayMode();

  if (mode === "mock") {
    return buildMockCodexResult(args);
  }

  return runRealCodexRelay(args);
}

export function getBuildRoomCodexRelayMode(): BuildRoomRelayMode {
  return resolveCodexRelayMode();
}
