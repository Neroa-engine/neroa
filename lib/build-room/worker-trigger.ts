import {
  buildRoomWorkerJobPacketSchema,
  type BuildRoomCodexResult,
  type BuildRoomTaskPacket,
  type BuildRoomRelayMode
} from "@/lib/build-room/contracts";
import type {
  BuildRoomTask,
  BuildRoomWorkerPacketWithContext,
  BuildRoomWorkerTriggerResult
} from "@/lib/build-room/types";

type WorkerTriggerArgs = {
  runId: string;
  task: BuildRoomTask;
  packet: BuildRoomTaskPacket;
  codexResult: BuildRoomCodexResult;
  approvedByUserId: string;
  callbackUrl: string | null;
  callbackSecret: string | null;
};

function resolveWorkerTriggerMode(): BuildRoomRelayMode {
  const configured = process.env.BUILD_ROOM_WORKER_MODE?.trim().toLowerCase();

  if (configured === "real") {
    return "real";
  }

  if (configured === "mock") {
    return "mock";
  }

  // Keep first-rollout behavior in dry-run mode unless execution is explicitly promoted.
  return "mock";
}

function safeParseJson(value: string) {
  if (!value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function buildBuildRoomWorkerPacket(args: WorkerTriggerArgs): BuildRoomWorkerPacketWithContext {
  return {
    packet: buildRoomWorkerJobPacketSchema.parse({
      taskId: args.task.id,
      workspaceId: args.task.workspaceId,
      projectId: args.task.projectId,
      laneSlug: args.task.laneSlug,
      approvedByUserId: args.approvedByUserId,
      title: args.task.title,
      taskType: args.task.taskType,
      riskLevel: args.task.riskLevel,
      requestedOutputMode: args.task.requestedOutputMode,
      userRequest: args.task.userRequest,
      acceptanceCriteria: args.task.acceptanceCriteria,
      codexSummary: args.codexResult.summary,
      implementationPlan: args.codexResult.implementationPlan,
      suggestedFileTargets: args.codexResult.suggestedFileTargets,
      patchText: args.codexResult.patchText,
      warnings: args.codexResult.warnings,
      blockers: args.codexResult.blockers,
      constraints: args.packet.constraints,
      callback:
        args.callbackUrl && args.callbackSecret
          ? {
              url: args.callbackUrl,
              secretHeaderName: "x-build-room-worker-callback-secret",
              secret: args.callbackSecret
            }
          : null
    }),
    callbackUrl: args.callbackUrl,
    callbackSecret: args.callbackSecret
  };
}

async function triggerRealWorker(
  workerPacket: BuildRoomWorkerPacketWithContext
): Promise<BuildRoomWorkerTriggerResult> {
  const endpoint = process.env.BUILD_ROOM_WORKER_ENDPOINT?.trim();

  if (!endpoint) {
    throw new Error("Missing BUILD_ROOM_WORKER_ENDPOINT.");
  }

  const headers: HeadersInit = {
    "content-type": "application/json"
  };
  const sharedSecret = process.env.BUILD_ROOM_WORKER_SHARED_SECRET?.trim();

  if (sharedSecret) {
    headers["x-build-room-worker-secret"] = sharedSecret;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(workerPacket.packet),
    cache: "no-store"
  });
  const text = await response.text();
  const json = safeParseJson(text);

  if (!response.ok) {
    throw new Error(
      `Worker trigger failed with ${response.status}: ${
        (json?.error as string | undefined) ?? text.trim() ?? "Unknown worker error."
      }`
    );
  }

  const externalJobId =
    (typeof json?.jobId === "string" && json.jobId) ||
    (typeof json?.id === "string" && json.id) ||
    `worker-${Date.now()}`;
  const statusValue =
    typeof json?.status === "string" ? json.status.trim().toLowerCase() : "queued";
  const runStatus =
    statusValue === "complete" || json?.result
      ? "complete"
      : statusValue === "failed"
        ? "failed"
        : statusValue === "running"
          ? "running"
          : "queued";
  const logs = Array.isArray(json?.logs)
    ? json.logs.filter(
        (entry): entry is string => typeof entry === "string" && entry.trim().length > 0
      )
    : [];

  return {
    triggerMode: "real",
    externalJobId,
    runStatus,
    summary:
      (typeof json?.summary === "string" && json.summary) ||
      (runStatus === "complete"
        ? "Worker completed the approved Build Room job."
        : "Worker accepted the approved Build Room job."),
    logs,
    resultPayload: json,
    textContent:
      (typeof json?.textContent === "string" && json.textContent.trim()) || text.trim() || null
  };
}

function buildMockWorkerResult(
  workerPacket: BuildRoomWorkerPacketWithContext,
  runId: string
): BuildRoomWorkerTriggerResult {
  return {
    triggerMode: "mock",
    externalJobId: `mock-worker-${runId.slice(0, 8)}`,
    runStatus: "complete",
    summary:
      "Mock worker completed a governed dry run. No remote code execution happened, but the approval, packet, log, and result flow were exercised end to end.",
    logs: [
      "Approval gate passed.",
      "Worker received the approved task packet.",
      "Mock worker recorded a dry-run completion result."
    ],
    resultPayload: {
      dryRun: true,
      taskTitle: workerPacket.packet.title,
      requestedOutputMode: workerPacket.packet.requestedOutputMode
    },
    textContent:
      "Mock worker dry run completed. Review the approved packet, plan, and result metadata before wiring a real Droplet endpoint."
  };
}

export async function triggerBuildRoomWorker(
  args: WorkerTriggerArgs
): Promise<BuildRoomWorkerTriggerResult> {
  const workerPacket = buildBuildRoomWorkerPacket(args);
  const mode = resolveWorkerTriggerMode();

  if (mode === "mock") {
    return buildMockWorkerResult(workerPacket, args.runId);
  }

  return triggerRealWorker(workerPacket);
}

export function buildBuildRoomWorkerCallbackUrl(runId: string) {
  const baseUrl =
    process.env.BUILD_ROOM_WORKER_CALLBACK_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    null;

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl.replace(/\/$/, "")}/api/build-room/runs/${runId}/attach-result`;
}

export function getBuildRoomWorkerCallbackSecret() {
  return process.env.BUILD_ROOM_WORKER_CALLBACK_SECRET?.trim() || null;
}

export function getBuildRoomWorkerTriggerMode(): BuildRoomRelayMode {
  return resolveWorkerTriggerMode();
}
