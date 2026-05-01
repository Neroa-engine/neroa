export * from "./schemas.ts";
export * from "./analyzer-contract.ts";
export * from "./analyzer-client.ts";
export * from "./space-context.ts";
export * from "./classify-intent.ts";
export * from "./roadmap-impact.ts";
export * from "./build-room-handoff.ts";
export * from "./cost-policy.ts";
export * from "./outcome-queues.ts";
export * from "./outcome-lanes.ts";
export * from "./codex-execution-packet.ts";
export * from "./prompt-room.ts";
export * from "./code-execution-worker.ts";
export * from "./codex-output-box.ts";
export * from "./output-review.ts";
export * from "./repair-queue.ts";
export * from "./qc-station.ts";
export * from "./evidence-linking.ts";
export * from "./audit-room.ts";

import { buildBuildRoomHandoffPackage } from "./build-room-handoff.ts";
import { classifyCustomerIntent } from "./classify-intent.ts";
import { resolveNeroaOneCostPolicy } from "./cost-policy.ts";
import { analyzeRoadmapImpact } from "./roadmap-impact.ts";
import { neroaOneResponseSchema, type NeroaOneResponse, type SpaceContext } from "./schemas.ts";

export function createNeroaOneResponse(args: {
  requestId: string;
  trigger: Parameters<typeof resolveNeroaOneCostPolicy>[0];
  customerMessage: string;
  spaceContext: SpaceContext;
  messageId?: string | null;
  source?: Parameters<typeof classifyCustomerIntent>[0]["source"];
  originalPayload?: Record<string, unknown> | null;
}): NeroaOneResponse {
  const intent = classifyCustomerIntent({
    text: args.customerMessage,
    messageId: args.messageId,
    source: args.source,
    originalPayload: args.originalPayload
  });
  const costPolicy = resolveNeroaOneCostPolicy(args.trigger);
  const roadmapImpact = analyzeRoadmapImpact({
    intent,
    spaceContext: args.spaceContext
  });
  const buildRoomHandoff =
    intent.lane === "requests" || intent.lane === "execution_review"
      ? buildBuildRoomHandoffPackage({
          spaceContext: args.spaceContext,
          intent,
          decisionGate: roadmapImpact.decisionGate
        })
      : null;

  return neroaOneResponseSchema.parse({
    requestId: args.requestId,
    lane: intent.lane,
    intentType: intent.intentType,
    decisionGate: roadmapImpact.decisionGate,
    costPolicy,
    roadmapImpact,
    buildRoomHandoff,
    emittedEvents: [
      roadmapImpact.emittedEvent,
      ...(buildRoomHandoff ? [buildRoomHandoff.emittedEvent] : [])
    ],
    requiresModel: false
  });
}
