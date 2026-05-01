import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  analyzeTaskWithNeroaOne,
  assertNeroaOneOutcomeQueueItemAllowedInLane,
  buildBuildRoomHandoffPackage,
  buildBuildRoomCustomerTaskHandoffPackage,
  buildNeroaOneTaskAnalysisRequest,
  buildBuildRoomTaskHandoffPackage,
  buildSpaceContext,
  canCreateCodexExecutionPacketFromReadyToBuildLaneItem,
  canNeroaOneOutcomeLaneEnterCodexExecution,
  classifyCustomerIntent,
  commandCenterLanes,
  createDraftCodexExecutionPacket,
  createDraftCodexExecutionPacketFromQueueEntry,
  createNeroaOneOutcomeQueueEntry,
  createNeroaOneResponse,
  evaluateNeroaOneDecisionGate,
  getNeroaOneOutcomeLaneIdsEligibleForCodexExecution,
  neroaOneCodexExecutionPacketLane,
  neroaOneOutcomeLanes,
  neroaOneOutcomeQueues,
  resolveNeroaOneCostPolicy,
  validateReadyToBuildLaneItemForCodexExecutionPacket,
  validateNeroaOneOutcomeQueueItemForLane
} from "../lib/neroa-one/index.ts";

const moduleSources = [
  "../lib/neroa-one/schemas.ts",
  "../lib/neroa-one/space-context.ts",
  "../lib/neroa-one/classify-intent.ts",
  "../lib/neroa-one/roadmap-impact.ts",
  "../lib/neroa-one/build-room-handoff.ts",
  "../lib/neroa-one/cost-policy.ts",
  "../lib/neroa-one/outcome-queues.ts",
  "../lib/neroa-one/outcome-lanes.ts",
  "../lib/neroa-one/codex-execution-packet.ts",
  "../lib/neroa-one/index.ts"
].map((specifier) => readFileSync(new URL(specifier, import.meta.url), "utf8"));

function buildFixtureSpaceContext(overrides = {}) {
  return buildSpaceContext({
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    projectTitle: "Alpha Project",
    projectDescription: "A controlled backend foundation for customer request handling.",
    projectMetadata: {
      strategyState: {
        revisionRecords: [{ id: "rev-1" }],
        planningThreadState: {
          messages: [{ id: "m1" }, { id: "m2" }]
        }
      },
      executionState: {
        pendingExecutions: [{ id: "pending-1" }],
        executionPackets: [{ id: "packet-1" }]
      },
      assets: [{ id: "asset-1" }],
      commandCenterDecisions: [{ id: "decision-1" }],
      commandCenterChangeReviews: [{ id: "review-1" }],
      commandCenterTasks: [{ id: "task-1" }]
    },
    ...overrides
  });
}

test("Neroa One foundation does not import or call model providers", () => {
  for (const source of moduleSources) {
    assert.doesNotMatch(source, /from\s+["']openai["']/i);
    assert.doesNotMatch(source, /@\/lib\/ai\//i);
    assert.doesNotMatch(source, /anthropic/i);
  }

  const response = createNeroaOneResponse({
    requestId: "req-1",
    trigger: "customer_message",
    customerMessage: "Please revise the execution checklist.",
    spaceContext: buildFixtureSpaceContext()
  });

  assert.equal(response.requiresModel, false);
  assert.equal(response.costPolicy.aiAllowedNow, false);
});

test("Outcome lane and Codex packet modules stay backend-only and UI-decoupled", () => {
  const outcomeLaneSource = moduleSources.find((source) =>
    source.includes("neroaOneOutcomeLaneOwnerSchema")
  );
  const codexPacketSource = moduleSources.find((source) =>
    source.includes("neroaOneCodexExecutionPacketSchema")
  );

  assert.ok(outcomeLaneSource);
  assert.ok(codexPacketSource);
  assert.doesNotMatch(outcomeLaneSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    outcomeLaneSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(codexPacketSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    codexPacketSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
});

test("Customer message can be classified deterministically", () => {
  const intent = classifyCustomerIntent({
    text: "Please revise the roadmap and adjust the milestone order."
  });

  assert.equal(intent.intentType, "roadmap_update");
  assert.equal(intent.lane, "roadmap_updates");
});

test("Five lanes are represented", () => {
  assert.deepEqual(commandCenterLanes, [
    "requests",
    "revisions",
    "roadmap_updates",
    "execution_review",
    "decisions"
  ]);
});

test("Five backend outcome queues are represented", () => {
  assert.deepEqual(Object.keys(neroaOneOutcomeQueues), [
    "ready_to_build",
    "needs_customer_answer",
    "roadmap_revision_required",
    "blocked_missing_information",
    "rejected_outside_scope"
  ]);
});

test("Five hardened backend outcome lanes are represented", () => {
  assert.deepEqual(Object.keys(neroaOneOutcomeLanes), [
    "ready_to_build",
    "needs_customer_answer",
    "roadmap_revision_required",
    "blocked_missing_information",
    "rejected_outside_scope"
  ]);
});

test("Outcome lanes are the only source of Codex execution eligibility", () => {
  assert.deepEqual(getNeroaOneOutcomeLaneIdsEligibleForCodexExecution(), ["ready_to_build"]);
  assert.equal(canNeroaOneOutcomeLaneEnterCodexExecution("ready_to_build"), true);
  assert.equal(canNeroaOneOutcomeLaneEnterCodexExecution("needs_customer_answer"), false);
  assert.equal(canNeroaOneOutcomeLaneEnterCodexExecution("roadmap_revision_required"), false);
  assert.equal(canNeroaOneOutcomeLaneEnterCodexExecution("blocked_missing_information"), false);
  assert.equal(canNeroaOneOutcomeLaneEnterCodexExecution("rejected_outside_scope"), false);
});

test("Analyzer output can be converted into a queue-ready backend item", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-queue-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-queue-1",
      title: "Revise release checklist",
      request: "Please revise the release checklist before the next handoff.",
      normalizedRequest: "please revise the release checklist before the next handoff."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_foundation_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });

  assert.equal(entry.queue, response.outcome);
  assert.equal(entry.item.workspaceId, "workspace-alpha");
  assert.equal(entry.item.projectId, "project-alpha");
  assert.equal(entry.item.taskId, "task-queue-1");
  assert.equal(
    entry.item.normalizedRequest,
    "please revise the release checklist before the next handoff."
  );
  assert.equal(entry.item.customerFacingSummary, response.reasoning.summary);
  assert.equal(entry.item.source.requestSource, "command_center");
  assert.equal(entry.item.source.caller, "neroa_one_foundation_test");
});

test("Queue-ready items can be validated against their hardened lane definitions", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-lane-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-lane-1",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_lane_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const validation = validateNeroaOneOutcomeQueueItemForLane({
    laneId: entry.queue,
    item: entry.item
  });

  assert.equal(validation.allowed, true);
  assert.equal(validation.lane.laneId, entry.queue);
  assert.equal(
    assertNeroaOneOutcomeQueueItemAllowedInLane({
      laneId: entry.queue,
      item: entry.item
    }).laneId,
    entry.queue
  );
});

test("Lane validation rejects queue items routed to the wrong hardened lane", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-lane-2",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-lane-2",
      title: "Roadmap shift request",
      request: "Please change the roadmap phase order before build starts.",
      normalizedRequest: "please change the roadmap phase order before build starts.",
      requestType: "change_direction"
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_lane_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const validation = validateNeroaOneOutcomeQueueItemForLane({
    laneId: "ready_to_build",
    item: entry.item
  });

  assert.equal(entry.queue, "roadmap_revision_required");
  assert.equal(validation.allowed, false);
  assert.match(validation.reason, /does not match lane ready_to_build/i);
});

test("Ready to build queue items can become safe draft Codex execution packets", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-codex-packet-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-codex-packet-1",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_codex_packet_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the module backend-only and extraction-ready."],
    testCommands: [".\\node_modules\\.bin\\tsc.cmd --noEmit --pretty false"]
  });

  assert.equal(entry.queue, "ready_to_build");
  assert.equal(
    validateReadyToBuildLaneItemForCodexExecutionPacket({ item: entry.item }).allowed,
    true
  );
  assert.equal(
    canCreateCodexExecutionPacketFromReadyToBuildLaneItem({ item: entry.item }),
    true
  );
  assert.equal(neroaOneCodexExecutionPacketLane.backendOnly, true);
  assert.equal(neroaOneCodexExecutionPacketLane.callsCodexNow, false);
  assert.equal(packet.executionPacketId, "workspace-alpha:project-alpha:task-codex-packet-1:codex-execution-packet-draft");
  assert.equal(packet.sourceLaneId, "ready_to_build");
  assert.equal(packet.workspaceId, "workspace-alpha");
  assert.equal(packet.projectId, "project-alpha");
  assert.equal(packet.taskId, "task-codex-packet-1");
  assert.equal(packet.executionTaskType, "implementation");
  assert.equal(packet.riskLevel, "low");
  assert.equal(packet.requiresQc, false);
  assert.equal(packet.requiresCustomerCheckpoint, false);
  assert.deepEqual(packet.acceptanceCriteria, [
    "Keep the module backend-only and extraction-ready."
  ]);
  assert.deepEqual(packet.testCommands, [
    ".\\node_modules\\.bin\\tsc.cmd --noEmit --pretty false"
  ]);
  assert.equal(packet.promptDraft.status, "placeholder_only");
  assert.equal(packet.promptDraft.promptText, "PROMPT_GENERATION_DEFERRED");
  assert.ok(packet.protectedAreas.includes("ui_layout"));
  assert.ok(packet.protectedAreas.includes("persistence_schema"));
  assert.equal(packet.futureDispatchTarget.owner, "future_digitalocean_codex_dispatch_service");
  assert.equal(packet.futureDispatchTarget.dispatchMode, "deferred");
  assert.equal(packet.futureDispatchTarget.readyForDispatch, false);
});

test("Non-ready_to_build items cannot create Codex execution packet drafts", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-codex-packet-2",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-codex-packet-2",
      title: "Roadmap shift request",
      request: "Please change the roadmap phase order before build starts.",
      normalizedRequest: "please change the roadmap phase order before build starts.",
      requestType: "change_direction"
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_codex_packet_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const validation = validateReadyToBuildLaneItemForCodexExecutionPacket({
    item: entry.item
  });

  assert.equal(entry.queue, "roadmap_revision_required");
  assert.equal(validation.allowed, false);
  assert.match(validation.reason, /does not match lane ready_to_build/i);
  assert.throws(
    () =>
      createDraftCodexExecutionPacket({
        item: entry.item
      }),
    /does not match lane ready_to_build/i
  );
});

test("Every non-ready outcome lane is explicitly blocked from Codex execution packet creation", () => {
  const blockedLanes = Object.keys(neroaOneOutcomeLanes).filter(
    (laneId) => laneId !== "ready_to_build"
  );

  for (const laneId of blockedLanes) {
    const item = {
      workspaceId: "workspace-alpha",
      projectId: "project-alpha",
      taskId: `task-${laneId}`,
      analyzerOutcome: laneId,
      normalizedRequest: `request for ${laneId}`,
      riskLevel: laneId === "roadmap_revision_required" ? "high" : "low",
      readinessBlockers: [],
      customerFacingSummary: `summary for ${laneId}`,
      internalSummary: `internal summary for ${laneId}`,
      createdAt: "2026-05-01T00:00:00.000Z",
      source: {
        requestSource:
          laneId === "roadmap_revision_required" || laneId === "rejected_outside_scope"
            ? "build_room"
            : "command_center",
        analyzerSource: "mock_fallback",
        caller: "boundary-test"
      }
    };
    const validation = validateReadyToBuildLaneItemForCodexExecutionPacket({
      item
    });

    assert.equal(validation.allowed, false);
    assert.match(validation.reason, /ready_to_build/i);
    assert.equal(canCreateCodexExecutionPacketFromReadyToBuildLaneItem({ item }), false);
    assert.throws(
      () =>
        createDraftCodexExecutionPacket({
          item
        }),
      /ready_to_build/i
    );
  }
});

test("Build Room handoff preserves original customer intent", () => {
  const spaceContext = buildFixtureSpaceContext();
  const intent = classifyCustomerIntent({
    text: "Create the implementation handoff for the approved request."
  });
  const decisionGate = evaluateNeroaOneDecisionGate({
    intent,
    spaceContext
  });
  const handoff = buildBuildRoomHandoffPackage({
    spaceContext,
    intent,
    decisionGate
  });

  assert.equal(
    handoff.originalIntent.rawText,
    "Create the implementation handoff for the approved request."
  );
  assert.equal(handoff.originalIntent.intentType, "new_request");
  assert.equal(handoff.customerIntentType, "new_request");
  assert.equal(handoff.commandCenterLane, "requests");
  assert.equal(handoff.normalizedRequest, "create the implementation handoff for the approved request.");
  assert.equal(handoff.readinessStatus, "contract_prepared");
});

test("Build Room task handoff preserves typed execution contract fields", () => {
  const handoff = buildBuildRoomTaskHandoffPackage({
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    projectTitle: "Alpha Project",
    isPendingExecution: true,
    pendingReason: "Waiting for internal packet release.",
    taskDetail: {
      task: {
        id: "task-42",
        workspaceId: "workspace-alpha",
        projectId: "project-alpha",
        ownerId: "owner-1",
        createdByUserId: "user-1",
        laneSlug: "build-lane",
        title: "Review the staged release package",
        taskType: "qa",
        requestedOutputMode: "implementation_guidance",
        userRequest: "Please review the staged release package and verify the acceptance notes.",
        acceptanceCriteria: "Acceptance notes are accurate and release-ready.",
        riskLevel: "medium",
        status: "codex_complete",
        codexRequestPayload: null,
        codexResponsePayload: {
          summary: "Review completed.",
          implementationPlan: [],
          suggestedFileTargets: [],
          patchText: null,
          warnings: [],
          blockers: ["Waiting for artifact upload"],
          outputMode: "implementation_guidance",
          relayMode: "mock",
          rawText: null
        },
        approvedForExecution: false,
        workerRunStatus: "idle",
        createdAt: "2026-04-30T00:00:00.000Z",
        updatedAt: "2026-04-30T00:05:00.000Z"
      },
      messages: [],
      runs: [],
      artifacts: []
    }
  });

  assert.ok(handoff);
  assert.equal(handoff.customerIntentType, "execution_review");
  assert.equal(handoff.commandCenterLane, "execution_review");
  assert.equal(handoff.executionTaskType, "qa");
  assert.equal(handoff.requestedOutputMode, "implementation_guidance");
  assert.equal(handoff.riskLevel, "medium");
  assert.equal(handoff.acceptanceCriteria, "Acceptance notes are accurate and release-ready.");
  assert.deepEqual(handoff.blockers, ["Waiting for artifact upload"]);
  assert.equal(handoff.readinessStatus, "blocked");
  assert.equal(handoff.decisionGate.status, "block");
});

test("Build Room can derive a handoff package from a live Command Center task", () => {
  const handoff = buildBuildRoomCustomerTaskHandoffPackage({
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    projectTitle: "Alpha Project",
    task: {
      id: "task-live-1",
      title: "Revise the onboarding checklist",
      request: "Please revise the onboarding checklist and tighten the approval copy.",
      normalizedRequest: "please revise the onboarding checklist and tighten the approval copy.",
      status: "queued",
      roadmapArea: "Launch preparation",
      sourceType: "customer_request",
      workflowLane: "revisions",
      intelligenceMetadata: {
        classifierVersion: "command_center_customer_request_v1",
        requestType: "revision",
        requestTypeLabel: "Revision",
        requestTypeSource: "manual",
        routingHint: "direct_execution_candidate",
        planningCandidate: false,
        bugCandidate: false,
        regressionCandidate: false,
        billabilityReviewRequired: false
      },
      createdAt: "2026-04-30T00:00:00.000Z",
      updatedAt: "2026-04-30T00:05:00.000Z"
    }
  });

  assert.ok(handoff);
  assert.equal(handoff.customerIntentType, "revision");
  assert.equal(handoff.commandCenterLane, "revisions");
  assert.equal(
    handoff.normalizedRequest,
    "please revise the onboarding checklist and tighten the approval copy."
  );
  assert.equal(handoff.executionTaskType, "implementation");
  assert.equal(handoff.requestedOutputMode, "patch_proposal");
});

test("Roadmap update can return needsStrategyReview", () => {
  const response = createNeroaOneResponse({
    requestId: "req-2",
    trigger: "customer_message",
    customerMessage: "Update the roadmap to add a new architecture phase before build.",
    spaceContext: buildFixtureSpaceContext()
  });

  assert.equal(response.roadmapImpact?.needsStrategyReview, true);
  assert.equal(response.decisionGate.status, "needs_strategy_review");
});

test("Decision can block execution", () => {
  const response = createNeroaOneResponse({
    requestId: "req-3",
    trigger: "manual_review",
    customerMessage: "Decision: hold execution and do not start build until pricing is approved.",
    spaceContext: buildFixtureSpaceContext()
  });

  assert.equal(response.intentType, "decision");
  assert.equal(response.decisionGate.status, "block");
  assert.ok(response.decisionGate.blockedActions.includes("release_execution"));
});

test("Cost policy blocks AI on page load and navigation", () => {
  const pageLoadPolicy = resolveNeroaOneCostPolicy("page_load");
  const navigationPolicy = resolveNeroaOneCostPolicy("navigation");

  assert.equal(pageLoadPolicy.aiAllowedNow, false);
  assert.equal(pageLoadPolicy.allowedReasoningTierNow, "none");
  assert.equal(navigationPolicy.aiAllowedNow, false);
  assert.equal(navigationPolicy.allowedReasoningTierNow, "none");
});

test("SpaceContext can accept precomputed room context without recomputing intelligence", () => {
  const context = buildSpaceContext({
    workspaceId: "workspace-compat",
    projectTitle: "Compatibility Project",
    projectDescription: "Short description",
    projectTruthSummary: "Precomputed shared truth summary.",
    currentPhase: "scope",
    currentFocus: ["Use the caller-provided context"],
    nextRecommendedAction: "Keep the backend module read-only.",
    roomContexts: [
      {
        roomId: "command_center",
        classification: "customer_operations_room",
        localStateAllowed: true,
        metadataWritesAllowed: true
      }
    ]
  });

  assert.equal(context.compatibilityMode, true);
  assert.equal(context.project.truthSummary, "Precomputed shared truth summary.");
  assert.deepEqual(context.project.currentFocus, ["Use the caller-provided context"]);
  assert.equal(context.project.nextRecommendedAction, "Keep the backend module read-only.");
  assert.equal(context.roomContexts.length, 1);
  assert.equal(context.roomContexts[0].roomId, "command_center");
});
