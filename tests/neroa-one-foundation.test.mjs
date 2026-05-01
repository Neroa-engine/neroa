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
  createPlaceholderOutputReviewDecisionFromOutputItem,
  createPlaceholderOutputReviewDecisionsFromOutputItems,
  createQueuedQcStationJobFromApprovedOutputReview,
  createQueuedQcStationJobsFromApprovedOutputReview,
  classifyCustomerIntent,
  commandCenterLanes,
  createPendingReviewCodexOutputItem,
  createDraftCodexExecutionPacket,
  createDraftCodexExecutionPacketFromQueueEntry,
  createNeroaOneOutcomeQueueEntry,
  createNeroaOneResponse,
  evaluateNeroaOneDecisionGate,
  getEligibleCodexOutputStatusesForFreshReview,
  getQcStationJobStatuses,
  getQcStationJobTypes,
  getRejectedOutputReviewDecisionsForQcStation,
  getNeroaOneOutcomeLaneIdsEligibleForCodexExecution,
  getAllowedOutputReviewNextDestinations,
  NEROA_ONE_CODEX_OUTPUT_BOX_STATUSES,
  NEROA_ONE_OUTPUT_REVIEW_DECISIONS,
  NEROA_ONE_OUTPUT_REVIEW_FRESH_REVIEW_ELIGIBLE_OUTPUT_STATUSES,
  NEROA_ONE_QC_STATION_JOB_STATUSES,
  NEROA_ONE_QC_STATION_JOB_TYPES,
  isEligibleCodexOutputStatusForFreshReview,
  isOutputReviewDecisionEligibleForQcStation,
  canCreateQcStationJobFromOutputReview,
  validateOutputReviewDecisionForQcStation,
  validateCodexExecutionPacketForOutputBox,
  validateCodexOutputItemForOutputReview,
  validateApprovedOutputReviewForQcStation,
  validateOutputReviewNextDestination,
  neroaOneCodexOutputBoxLane,
  neroaOneCodexExecutionPacketLane,
  neroaOneOutcomeLanes,
  neroaOneOutcomeQueues,
  neroaOneOutputReviewLane,
  neroaOneQcStationLane,
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
  "../lib/neroa-one/codex-output-box.ts",
  "../lib/neroa-one/output-review.ts",
  "../lib/neroa-one/qc-station.ts",
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
  const codexOutputBoxSource = moduleSources.find((source) =>
    source.includes("neroaOneCodexOutputRecordSchema")
  );
  const outputReviewSource = moduleSources.find((source) =>
    source.includes("neroaOneOutputReviewRecordSchema")
  );
  const qcStationSource = moduleSources.find((source) =>
    source.includes("neroaOneQcStationJobRecordSchema")
  );

  assert.ok(outcomeLaneSource);
  assert.ok(codexPacketSource);
  assert.ok(codexOutputBoxSource);
  assert.ok(outputReviewSource);
  assert.ok(qcStationSource);
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
  assert.doesNotMatch(codexOutputBoxSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    codexOutputBoxSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(
    codexOutputBoxSource,
    /"approve_for_qc"|"needs_repair"|"rerun_required"|"strategy_escalation"|"customer_followup"|"archive_complete"/i
  );
  assert.doesNotMatch(codexOutputBoxSource, /createDraftCodexExecutionPacket/i);
  assert.doesNotMatch(codexOutputBoxSource, /createPlaceholderOutputReviewDecision/i);
  assert.match(codexOutputBoxSource, /interface\s+NeroaOneCodexOutputBoxStorageAdapter/);
  assert.doesNotMatch(outputReviewSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    outputReviewSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(outputReviewSource, /openai|anthropic|model review/i);
  assert.doesNotMatch(outputReviewSource, /createPendingReviewCodexOutputItem/i);
  assert.doesNotMatch(
    outputReviewSource,
    /from\s+["']\.\/qc-station\.ts["']|createQueuedQcStationJobFromApprovedOutputReview|createQueuedQcStationJobsFromApprovedOutputReview/i
  );
  assert.doesNotMatch(outputReviewSource, /saveOutputRecord|getOutputRecordById/i);
  assert.match(outputReviewSource, /interface\s+NeroaOneOutputReviewStorageAdapter/);
  assert.doesNotMatch(qcStationSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    qcStationSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(
    qcStationSource,
    /extension session|recording state|side-panel runtime messaging|activeTab|chrome\.storage|browser\.runtime|local extension storage/i
  );
  assert.doesNotMatch(qcStationSource, /createPendingReviewCodexOutputItem/i);
  assert.doesNotMatch(
    qcStationSource,
    /createPlaceholderOutputReviewDecisionFromOutputItem|createPlaceholderOutputReviewDecisionsFromOutputItems/i
  );
  assert.match(qcStationSource, /interface\s+NeroaOneQcStationStorageAdapter/);
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

test("Codex output box statuses stay typed and backend-only", () => {
  assert.deepEqual([...NEROA_ONE_CODEX_OUTPUT_BOX_STATUSES], [
    "received",
    "pending_review",
    "reviewed",
    "archived",
    "repair_required",
    "customer_followup_required"
  ]);
  assert.equal(neroaOneCodexOutputBoxLane.backendOnly, true);
  assert.equal(neroaOneCodexOutputBoxLane.extractionReady, true);
  assert.equal(neroaOneCodexOutputBoxLane.receivesRealCodexOutputNow, false);
  assert.equal(neroaOneCodexOutputBoxLane.writesPersistenceNow, false);
});

test("Output review decisions and explicit destinations stay typed and backend-only", () => {
  assert.deepEqual([...NEROA_ONE_OUTPUT_REVIEW_DECISIONS], [
    "approve_for_qc",
    "needs_repair",
    "rerun_required",
    "strategy_escalation",
    "customer_followup",
    "archive_complete"
  ]);
  assert.deepEqual([...NEROA_ONE_OUTPUT_REVIEW_FRESH_REVIEW_ELIGIBLE_OUTPUT_STATUSES], [
    "pending_review"
  ]);
  assert.equal(neroaOneOutputReviewLane.backendOnly, true);
  assert.equal(neroaOneOutputReviewLane.extractionReady, true);
  assert.equal(neroaOneOutputReviewLane.performsRealReviewNow, false);
  assert.equal(neroaOneOutputReviewLane.callsAiNow, false);
  assert.equal(neroaOneOutputReviewLane.writesPersistenceNow, false);
  assert.deepEqual(getEligibleCodexOutputStatusesForFreshReview(), ["pending_review"]);
  assert.equal(isEligibleCodexOutputStatusForFreshReview("pending_review"), true);
  assert.equal(isEligibleCodexOutputStatusForFreshReview("received"), false);
  assert.equal(isEligibleCodexOutputStatusForFreshReview("reviewed"), false);
  assert.equal(isEligibleCodexOutputStatusForFreshReview("archived"), false);
  assert.equal(isEligibleCodexOutputStatusForFreshReview("repair_required"), false);
  assert.equal(isEligibleCodexOutputStatusForFreshReview("customer_followup_required"), false);
  assert.deepEqual(getAllowedOutputReviewNextDestinations("approve_for_qc"), ["qc_station"]);
  assert.deepEqual(getAllowedOutputReviewNextDestinations("needs_repair"), ["repair_lane"]);
  assert.deepEqual(getAllowedOutputReviewNextDestinations("rerun_required"), ["rerun_lane"]);
  assert.deepEqual(getAllowedOutputReviewNextDestinations("strategy_escalation"), [
    "strategy_room_review"
  ]);
  assert.deepEqual(getAllowedOutputReviewNextDestinations("customer_followup"), [
    "command_center_follow_up"
  ]);
  assert.deepEqual(getAllowedOutputReviewNextDestinations("archive_complete"), ["archive_only"]);
});

test("QC Station lane stays typed, backend-only, and DigitalOcean-ready", () => {
  assert.deepEqual([...NEROA_ONE_QC_STATION_JOB_TYPES], [
    "browser_inspection",
    "screenshot_capture",
    "video_recording",
    "walkthrough_generation",
    "qc_report_generation"
  ]);
  assert.deepEqual([...NEROA_ONE_QC_STATION_JOB_STATUSES], [
    "queued",
    "running",
    "completed",
    "failed",
    "canceled"
  ]);
  assert.equal(neroaOneQcStationLane.backendOnly, true);
  assert.equal(neroaOneQcStationLane.extractionReady, true);
  assert.equal(neroaOneQcStationLane.dependsOnLegacyBrowserExtension, false);
  assert.equal(neroaOneQcStationLane.dispatchesRealQcJobsNow, false);
  assert.equal(neroaOneQcStationLane.writesPersistenceNow, false);
  assert.deepEqual(getQcStationJobTypes(), [...NEROA_ONE_QC_STATION_JOB_TYPES]);
  assert.deepEqual(getQcStationJobStatuses(), [...NEROA_ONE_QC_STATION_JOB_STATUSES]);
  assert.deepEqual(getRejectedOutputReviewDecisionsForQcStation(), [
    "needs_repair",
    "rerun_required",
    "strategy_escalation",
    "customer_followup",
    "archive_complete"
  ]);
  assert.equal(isOutputReviewDecisionEligibleForQcStation("approve_for_qc"), true);
  assert.equal(isOutputReviewDecisionEligibleForQcStation("needs_repair"), false);
  assert.equal(validateOutputReviewDecisionForQcStation({ decision: "approve_for_qc" }).allowed, true);
  assert.equal(
    validateOutputReviewDecisionForQcStation({ decision: "rerun_required" }).allowed,
    false
  );
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

test("Codex output box can create a pending review item from a draft execution packet", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-codex-output-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-codex-output-1",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_codex_output_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the module backend-only and extraction-ready."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-123",
    summary: "Patch proposal staged for Neroa One review.",
    filesChanged: ["lib/neroa-one/codex-output-box.ts"],
    testsRun: [".\\node_modules\\.bin\\tsc.cmd --noEmit --pretty false"],
    artifacts: [
      {
        artifactId: "artifact-1",
        artifactType: "patch",
        title: "Patch draft",
        uri: null,
        notes: ["Backend-only placeholder artifact."]
      }
    ],
    createdAt: "2026-05-01T12:00:00.000Z",
    receivedAt: "2026-05-01T12:01:00.000Z"
  });

  assert.equal(output.executionPacketId, packet.executionPacketId);
  assert.equal(output.workspaceId, "workspace-alpha");
  assert.equal(output.projectId, "project-alpha");
  assert.equal(output.taskId, "task-codex-output-1");
  assert.equal(output.codexRunId, "codex-run-123");
  assert.equal(output.outputStatus, "pending_review");
  assert.equal(output.summary, "Patch proposal staged for Neroa One review.");
  assert.deepEqual(output.filesChanged, ["lib/neroa-one/codex-output-box.ts"]);
  assert.deepEqual(output.testsRun, [".\\node_modules\\.bin\\tsc.cmd --noEmit --pretty false"]);
  assert.match(output.rawOutput, /CODEX_OUTPUT_NOT_WIRED/);
  assert.equal(output.artifacts.length, 1);
  assert.equal(output.artifacts[0].artifactType, "patch");
  assert.equal(output.createdAt, "2026-05-01T12:00:00.000Z");
  assert.equal(output.receivedAt, "2026-05-01T12:01:00.000Z");
});

test("Codex output box validates valid execution packets and safely defaults optional output fields", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-codex-output-2",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-codex-output-2",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_codex_output_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the module backend-only and extraction-ready."]
  });
  const validation = validateCodexExecutionPacketForOutputBox({
    executionPacket: packet
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-456",
    summary: "   ",
    filesChanged: [" lib/neroa-one/codex-output-box.ts ", "lib/neroa-one/codex-output-box.ts"],
    testsRun: ["  ", ".\\node_modules\\.bin\\tsc.cmd --noEmit --pretty false"],
    rawOutput: "   ",
    createdAt: "2026-05-01T12:02:00.000Z"
  });

  assert.equal(validation.allowed, true);
  assert.equal(validation.packetLane.laneId, "codex_execution_packet_draft");
  assert.equal(validation.outputLane.laneId, "codex_output_box");
  assert.equal(output.outputStatus, "pending_review");
  assert.equal(
    output.summary,
    "Codex output received into the backend review box and is pending Neroa One review."
  );
  assert.deepEqual(output.filesChanged, ["lib/neroa-one/codex-output-box.ts"]);
  assert.deepEqual(output.testsRun, [".\\node_modules\\.bin\\tsc.cmd --noEmit --pretty false"]);
  assert.match(output.rawOutput, /CODEX_OUTPUT_NOT_WIRED/);
  assert.equal(output.createdAt, "2026-05-01T12:02:00.000Z");
  assert.equal(output.receivedAt, "2026-05-01T12:02:00.000Z");
});

test("Output review can create safe placeholder review decisions from output box items", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-output-review-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-output-review-1",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_output_review_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the review lane backend-only and extraction-ready."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-review-1",
    summary: "Patch proposal staged for Neroa One review.",
    filesChanged: ["lib/neroa-one/output-review.ts"],
    testsRun: ["node --test tests\\neroa-one-foundation.test.mjs"],
    createdAt: "2026-05-01T12:10:00.000Z",
    receivedAt: "2026-05-01T12:11:00.000Z"
  });
  const validation = validateCodexOutputItemForOutputReview({
    output
  });
  const review = createPlaceholderOutputReviewDecisionFromOutputItem({
    output,
    decision: "needs_repair",
    internalNotes: ["Review remains placeholder-only for now."],
    createdAt: "2026-05-01T12:12:00.000Z"
  });

  assert.equal(validation.allowed, true);
  assert.equal(validation.outputLane.laneId, "codex_output_box");
  assert.equal(validation.reviewLane.laneId, "output_review");
  assert.equal(review.outputId, output.outputId);
  assert.equal(review.executionPacketId, packet.executionPacketId);
  assert.equal(review.workspaceId, "workspace-alpha");
  assert.equal(review.projectId, "project-alpha");
  assert.equal(review.taskId, "task-output-review-1");
  assert.equal(review.decision, "needs_repair");
  assert.equal(review.repairPriority, "medium");
  assert.match(review.reasoningSummary, /deterministic repair handling only/i);
  assert.equal(
    review.customerVisibleSummary,
    "Implementation output needs an internal repair pass before it can move forward."
  );
  assert.match(review.reviewId, /:review:needs_repair:/i);
  assert.ok(
    review.internalNotes.includes("Review remains placeholder-only for now."),
    "expected custom internal note to be preserved"
  );
  assert.equal(review.createdAt, "2026-05-01T12:12:00.000Z");
});

test("Output review destination validation is explicit and review rejects archived outputs", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-output-review-2",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-output-review-2",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_output_review_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the review lane backend-only and extraction-ready."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-review-2",
    createdAt: "2026-05-01T12:20:00.000Z"
  });
  const allowedDestination = validateOutputReviewNextDestination({
    decision: "approve_for_qc",
    destination: "qc_station"
  });
  const blockedDestination = validateOutputReviewNextDestination({
    decision: "approve_for_qc",
    destination: "repair_lane"
  });
  const archivedValidation = validateCodexOutputItemForOutputReview({
    output: {
      ...output,
      outputStatus: "archived"
    }
  });
  const reviews = createPlaceholderOutputReviewDecisionsFromOutputItems({
    outputs: [output],
    decision: "archive_complete",
    createdAt: "2026-05-01T12:21:00.000Z"
  });

  assert.equal(allowedDestination.allowed, true);
  assert.equal(allowedDestination.destination, "qc_station");
  assert.equal(blockedDestination.allowed, false);
  assert.match(blockedDestination.reason, /not allowed for decision approve_for_qc/i);
  assert.equal(archivedValidation.allowed, false);
  assert.match(archivedValidation.reason, /archived/i);
  assert.equal(reviews.length, 1);
  assert.equal(reviews[0].decision, "archive_complete");
  assert.equal(reviews[0].repairPriority, null);
});

test("Output review rejects every non-pending output status for fresh review creation", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-output-review-3",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-output-review-3",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_output_review_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the review lane backend-only and extraction-ready."]
  });
  const pendingOutput = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-review-3",
    createdAt: "2026-05-01T12:30:00.000Z"
  });

  for (const outputStatus of NEROA_ONE_CODEX_OUTPUT_BOX_STATUSES.filter(
    (status) => status !== "pending_review"
  )) {
    const validation = validateCodexOutputItemForOutputReview({
      output: {
        ...pendingOutput,
        outputStatus
      }
    });

    assert.equal(validation.allowed, false);
    assert.match(validation.reason, new RegExp(`status ${outputStatus}`, "i"));
    assert.match(validation.reason, /pending_review/i);
    assert.throws(
      () =>
        createPlaceholderOutputReviewDecisionFromOutputItem({
          output: {
            ...pendingOutput,
            outputStatus
          },
          decision: "approve_for_qc"
        }),
      new RegExp(`status ${outputStatus}`, "i")
    );
  }
});

test("QC Station can create queued jobs only from approve_for_qc output review decisions", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-qc-station-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-qc-station-1",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_qc_station_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the QC lane backend-only and extraction-ready."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-qc-1",
    summary: "Patch proposal staged for QC station lane review.",
    filesChanged: ["lib/neroa-one/qc-station.ts"],
    testsRun: ["node --test tests\\neroa-one-foundation.test.mjs"],
    createdAt: "2026-05-01T12:40:00.000Z",
    receivedAt: "2026-05-01T12:41:00.000Z"
  });
  const approvedReview = createPlaceholderOutputReviewDecisionFromOutputItem({
    output,
    decision: "approve_for_qc",
    createdAt: "2026-05-01T12:42:00.000Z"
  });
  const reviewValidation = validateApprovedOutputReviewForQcStation({
    review: approvedReview
  });
  const job = createQueuedQcStationJobFromApprovedOutputReview({
    review: approvedReview,
    jobType: "browser_inspection",
    targetUrl: "https://example.com/release-preview",
    createdAt: "2026-05-01T12:43:00.000Z"
  });
  const jobSet = createQueuedQcStationJobsFromApprovedOutputReview({
    review: approvedReview,
    jobTypes: ["screenshot_capture", "qc_report_generation"],
    targetUrl: "https://example.com/release-preview",
    createdAt: "2026-05-01T12:44:00.000Z"
  });

  assert.equal(reviewValidation.allowed, true);
  assert.equal(canCreateQcStationJobFromOutputReview({ review: approvedReview }), true);
  assert.equal(reviewValidation.reviewLane.laneId, "output_review");
  assert.equal(reviewValidation.qcLane.laneId, "qc_station");
  assert.equal(job.workspaceId, "workspace-alpha");
  assert.equal(job.projectId, "project-alpha");
  assert.equal(job.taskId, "task-qc-station-1");
  assert.equal(job.outputId, output.outputId);
  assert.equal(job.reviewId, approvedReview.reviewId);
  assert.equal(job.jobType, "browser_inspection");
  assert.equal(job.targetUrl, "https://example.com/release-preview");
  assert.equal(job.status, "queued");
  assert.equal(job.evidencePolicy.requiresScreenshots, true);
  assert.equal(job.evidencePolicy.requiresVideoRecording, false);
  assert.equal(job.futureDigitalOceanWorkerTarget.deploymentProvider, "digitalocean");
  assert.equal(job.futureDigitalOceanWorkerTarget.readyForExecution, false);
  assert.match(job.qcJobId, /:qc:browser_inspection:/i);
  assert.equal(jobSet.length, 2);
  assert.deepEqual(
    jobSet.map((item) => item.jobType),
    ["screenshot_capture", "qc_report_generation"]
  );
});

test("QC Station rejects output review decisions that are not approved for QC", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-qc-station-2",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-qc-station-2",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_qc_station_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the QC lane backend-only and extraction-ready."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-qc-2",
    createdAt: "2026-05-01T12:50:00.000Z"
  });
  const repairReview = createPlaceholderOutputReviewDecisionFromOutputItem({
    output,
    decision: "needs_repair",
    createdAt: "2026-05-01T12:51:00.000Z"
  });
  const validation = validateApprovedOutputReviewForQcStation({
    review: repairReview
  });

  assert.equal(validation.allowed, false);
  assert.equal(canCreateQcStationJobFromOutputReview({ review: repairReview }), false);
  assert.match(validation.reason, /required decision: approve_for_qc/i);
  assert.throws(
    () =>
      createQueuedQcStationJobFromApprovedOutputReview({
        review: repairReview,
        jobType: "video_recording",
        targetUrl: "https://example.com/release-preview"
      }),
    /approve_for_qc/i
  );
});

test("QC Station rejects every non-QC output review decision from job creation", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-qc-station-3",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-qc-station-3",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_qc_station_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the QC lane backend-only and extraction-ready."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-qc-3",
    createdAt: "2026-05-01T13:00:00.000Z"
  });

  for (const decision of getRejectedOutputReviewDecisionsForQcStation()) {
    const decisionValidation = validateOutputReviewDecisionForQcStation({
      decision
    });
    const review = createPlaceholderOutputReviewDecisionFromOutputItem({
      output,
      decision,
      createdAt: "2026-05-01T13:01:00.000Z"
    });
    const reviewValidation = validateApprovedOutputReviewForQcStation({
      review
    });

    assert.equal(decisionValidation.allowed, false);
    assert.equal(decisionValidation.decision, decision);
    assert.equal(decisionValidation.requiredDecision, "approve_for_qc");
    assert.equal(isOutputReviewDecisionEligibleForQcStation(decision), false);
    assert.equal(canCreateQcStationJobFromOutputReview({ review }), false);
    assert.equal(reviewValidation.allowed, false);
    assert.match(reviewValidation.reason, new RegExp(`decision ${decision}`, "i"));
    assert.throws(
      () =>
        createQueuedQcStationJobFromApprovedOutputReview({
          review,
          jobType: "walkthrough_generation",
          targetUrl: "https://example.com/release-preview",
          createdAt: "2026-05-01T13:02:00.000Z"
        }),
      /approve_for_qc/i
    );
  }
});

test("Codex output box rejects malformed or incomplete execution packet data", () => {
  const malformedPacket = {
    executionPacketId: "workspace-alpha:project-alpha:task-bad:codex-execution-packet-draft",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    sourceLaneId: "ready_to_build",
    normalizedRequest: "prepare the approved implementation packet for backend execution.",
    executionTaskType: "implementation",
    protectedAreas: ["ui_layout"],
    acceptanceCriteria: [],
    testCommands: [],
    riskLevel: "low",
    requiresQc: false,
    requiresCustomerCheckpoint: false,
    promptDraft: {
      status: "placeholder_only",
      promptText: "PROMPT_GENERATION_DEFERRED",
      notes: ["Prompt generation is intentionally deferred."]
    },
    createdAt: "2026-05-01T12:03:00.000Z",
    futureDispatchTarget: {
      owner: "future_digitalocean_codex_dispatch_service",
      queueName: "neroa-one.codex-execution-packets",
      dispatchMode: "deferred",
      readyForDispatch: false,
      notes: ["Current lane is contract-only."]
    }
  };
  const validation = validateCodexExecutionPacketForOutputBox({
    executionPacket: malformedPacket
  });

  assert.equal(validation.allowed, false);
  assert.match(validation.reason, /taskId/i);
  assert.throws(
    () =>
      createPendingReviewCodexOutputItem({
        executionPacket: malformedPacket,
        codexRunId: "codex-run-bad"
      }),
    /taskId/i
  );
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
