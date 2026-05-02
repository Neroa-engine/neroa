import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  analyzeTaskWithNeroaOne,
  assertNeroaOneOutcomeQueueItemAllowedInLane,
  attachArtifactPointersToEvidenceLink,
  createAdminOversightSummaryFromAuditEvents,
  createAuditRoomEventFromEvidenceLink,
  createAuditRoomEventFromLaneAndEvidenceIds,
  buildBuildRoomHandoffPackage,
  buildBuildRoomCustomerTaskHandoffPackage,
  buildNeroaOneTaskAnalysisRequest,
  buildBuildRoomTaskHandoffPackage,
  buildSpaceContext,
  canCreateCodeExecutionWorkerRunFromCodexExecutionPacket,
  canCreateCodexExecutionPacketFromReadyToBuildLaneItem,
  canCreatePromptRoomItemFromCodexExecutionPacket,
  createDraftEvidenceLinkFromPipelineIds,
  createDraftEvidenceLinkFromPipelineRecords,
  canNeroaOneOutcomeLaneEnterCodexExecution,
  canCreateCustomerFollowUpItemFromOutcomeLaneItem,
  canCreateCustomerFollowUpItemFromOutputReview,
  canCreateStrategyEscalationItemFromOutcomeLaneItem,
  canCreateStrategyEscalationItemFromOutputReview,
  createPlaceholderOutputReviewDecisionFromOutputItem,
  createPlaceholderOutputReviewDecisionsFromOutputItems,
  createCustomerFollowUpItemFromOutcomeLaneItem,
  createCustomerFollowUpItemFromOutputReview,
  createCustomerFollowUpItemsFromOutcomeLaneItems,
  createCustomerFollowUpItemsFromOutputReviews,
  createCustomerSafeFollowUpText,
  createCustomerSafeStrategyEscalationText,
  createCustomerSafeRepairSummary,
  createRepairQueueItemFromOutputReview,
  createRepairQueueItemsFromOutputReviews,
  createStrategyEscalationItemFromOutcomeLaneItem,
  createStrategyEscalationItemFromOutputReview,
  createStrategyEscalationItemsFromOutcomeLaneItems,
  createStrategyEscalationItemsFromOutputReviews,
  createQueuedQcStationJobFromApprovedOutputReview,
  createQueuedQcStationJobsFromApprovedOutputReview,
  classifyCustomerIntent,
  commandCenterLanes,
  createEvidenceArtifactPointer,
  createPendingReviewCodexOutputItem,
  createDraftCodexExecutionPacket,
  createDraftCodexExecutionPacketFromQueueEntry,
  createDraftPromptRoomItemFromCodexExecutionPacket,
  createNeroaOneOutcomeQueueEntry,
  createNeroaOneResponse,
  createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket,
  evaluateNeroaOneDecisionGate,
  getAuditRoomEventTypes,
  getAuditRoomRecommendedActions,
  getAuditRoomSeverityLevels,
  getCodeExecutionWorkerEngines,
  getCodeExecutionWorkerRunStatuses,
  getCustomerFollowUpAllowedResponseTypes,
  getCustomerFollowUpItemStatuses,
  getCustomerFollowUpSourceTypes,
  getCustomerFollowUpTypes,
  getCustomerSafeAuditEventView,
  getCustomerSafeCustomerFollowUpItemView,
  getCustomerSafeEvidenceSummary,
  getCustomerSafeStrategyEscalationItemView,
  getEligibleCodexOutputStatusesForFreshReview,
  getEvidenceArtifactPointerTypes,
  getEvidenceLinkStatuses,
  getPromptRoomCustomerSafeStatus,
  getPromptRoomCustomerSafeStatuses,
  getPromptRoomStatuses,
  getRepairQueueItemStatuses,
  getRepairQueuePriorities,
  getRepairQueueSourceDecisions,
  getRepairQueueTypes,
  getQcStationJobStatuses,
  getQcStationJobTypes,
  getRejectedOutputReviewDecisionsForQcStation,
  getNeroaOneOutcomeLaneIdsEligibleForCodexExecution,
  getAllowedOutputReviewNextDestinations,
  getStrategyEscalationImpactLevels,
  getStrategyEscalationItemStatuses,
  getStrategyEscalationSourceTypes,
  getStrategyEscalationTypes,
  NEROA_ONE_CODEX_OUTPUT_BOX_STATUSES,
  NEROA_ONE_CODE_EXECUTION_WORKER_ENGINES,
  NEROA_ONE_CODE_EXECUTION_WORKER_RUN_STATUSES,
  NEROA_ONE_AUDIT_ROOM_EVENT_TYPES,
  NEROA_ONE_AUDIT_ROOM_RECOMMENDED_ACTIONS,
  NEROA_ONE_AUDIT_ROOM_SEVERITY_LEVELS,
  NEROA_ONE_CUSTOMER_FOLLOW_UP_ALLOWED_RESPONSE_TYPES,
  NEROA_ONE_CUSTOMER_FOLLOW_UP_ITEM_STATUSES,
  NEROA_ONE_CUSTOMER_FOLLOW_UP_SOURCE_TYPES,
  NEROA_ONE_CUSTOMER_FOLLOW_UP_TYPES,
  NEROA_ONE_STRATEGY_ESCALATION_IMPACT_LEVELS,
  NEROA_ONE_STRATEGY_ESCALATION_ACCEPTED_OUTCOME_LANE_IDS,
  NEROA_ONE_STRATEGY_ESCALATION_ACCEPTED_OUTPUT_REVIEW_DECISIONS,
  NEROA_ONE_STRATEGY_ESCALATION_ITEM_STATUSES,
  NEROA_ONE_STRATEGY_ESCALATION_SOURCE_TYPES,
  NEROA_ONE_STRATEGY_ESCALATION_TYPES,
  NEROA_ONE_EVIDENCE_ARTIFACT_POINTER_TYPES,
  NEROA_ONE_EVIDENCE_LINK_STATUSES,
  NEROA_ONE_OUTPUT_REVIEW_DECISIONS,
  NEROA_ONE_OUTPUT_REVIEW_FRESH_REVIEW_ELIGIBLE_OUTPUT_STATUSES,
  NEROA_ONE_PROMPT_ROOM_CUSTOMER_SAFE_STATUSES,
  NEROA_ONE_PROMPT_ROOM_STATUSES,
  NEROA_ONE_REPAIR_QUEUE_ITEM_STATUSES,
  NEROA_ONE_REPAIR_QUEUE_PRIORITIES,
  NEROA_ONE_REPAIR_QUEUE_SOURCE_DECISIONS,
  NEROA_ONE_REPAIR_QUEUE_TYPES,
  NEROA_ONE_QC_STATION_JOB_STATUSES,
  NEROA_ONE_QC_STATION_JOB_TYPES,
  canCreateRepairQueueItemFromOutputReview,
  isEligibleCodexOutputStatusForFreshReview,
  isOutputReviewDecisionEligibleForQcStation,
  canCreateQcStationJobFromOutputReview,
  validateOutputReviewDecisionForQcStation,
  validateCodexExecutionPacketForOutputBox,
  validateCodexOutputItemForOutputReview,
  validateApprovedOutputReviewForQcStation,
  validateCodexExecutionPacketForCodeExecutionWorkerRun,
  validateCodexExecutionPacketForPromptRoom,
  validateEvidenceLinkPipelineIds,
  validateEvidenceLinkPipelineRecords,
  validateEvidenceLinkForAuditRoomEvent,
  validateOutcomeLaneItemForCustomerFollowUp,
  validateOutcomeLaneItemForStrategyEscalation,
  validateQcStationJobReferenceForEvidenceLink,
  validateOutputReviewNextDestination,
  validateOutputReviewDecisionForCustomerFollowUp,
  validateOutputReviewDecisionForStrategyEscalation,
  validateOutputReviewForCustomerFollowUp,
  validateOutputReviewForStrategyEscalation,
  validateOutputReviewDecisionForRepairQueue,
  validateOutputReviewForRepairQueue,
  neroaOneAuditRoomLane,
  neroaOneCodeExecutionWorkerLane,
  neroaOneCodexOutputBoxLane,
  neroaOneCodexExecutionPacketLane,
  neroaOneCustomerFollowUpLane,
  neroaOneEvidenceLinkingLane,
  neroaOneOutcomeLanes,
  neroaOneOutcomeQueues,
  neroaOneOutputReviewLane,
  neroaOnePromptRoomLane,
  neroaOneRepairQueueLane,
  neroaOneQcStationLane,
  neroaOneStrategyEscalationLane,
  neroaOneStrategyEscalationItemSchema,
  resolveNeroaOneCostPolicy,
  validateReadyToBuildLaneItemForCodexExecutionPacket,
  validateNeroaOneOutcomeQueueItemForLane,
  getCustomerSafeRepairQueueItemView
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
  "../lib/neroa-one/prompt-room.ts",
  "../lib/neroa-one/code-execution-worker.ts",
  "../lib/neroa-one/codex-output-box.ts",
  "../lib/neroa-one/output-review.ts",
  "../lib/neroa-one/customer-follow-up.ts",
  "../lib/neroa-one/strategy-escalation.ts",
  "../lib/neroa-one/repair-queue.ts",
  "../lib/neroa-one/qc-station.ts",
  "../lib/neroa-one/evidence-linking.ts",
  "../lib/neroa-one/audit-room.ts",
  "../lib/neroa-one/queue-adapters.ts",
  "../lib/neroa-one/storage-adapters.ts",
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

async function buildEvidenceLinkFixturePipeline() {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-evidence-link-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-evidence-link-1",
      title: "Prepare evidence trace contract",
      request:
        "Prepare the approved execution trace contract and keep the backend lane extraction-ready.",
      normalizedRequest:
        "prepare the approved execution trace contract and keep the backend lane extraction-ready."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_evidence_link_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const executionPacket = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: [
      "Keep evidence linking backend-only and extraction-ready.",
      "Do not expose internal prompt or worker details in customer-safe outputs."
    ],
    testCommands: ["node --test tests/neroa-one-foundation.test.mjs"],
    createdAt: "2026-05-01T14:00:00.000Z"
  });
  const promptRoomItem = createDraftPromptRoomItemFromCodexExecutionPacket({
    executionPacket,
    status: "ready_for_code_builder",
    createdAt: "2026-05-01T14:01:00.000Z"
  });
  const workerRun = createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket({
    promptRoomItem,
    selectedEngine: "codex_cli",
    createdAt: "2026-05-01T14:02:00.000Z"
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket,
    codexRunId: "codex-run-evidence-link-1",
    createdAt: "2026-05-01T14:03:00.000Z",
    receivedAt: "2026-05-01T14:03:00.000Z"
  });
  const review = createPlaceholderOutputReviewDecisionFromOutputItem({
    output,
    decision: "approve_for_qc",
    createdAt: "2026-05-01T14:04:00.000Z"
  });
  const qcJob = createQueuedQcStationJobFromApprovedOutputReview({
    review,
    jobType: "qc_report_generation",
    targetUrl: "https://example.com/evidence-link-preview",
    createdAt: "2026-05-01T14:05:00.000Z"
  });

  return {
    request,
    response,
    entry,
    executionPacket,
    promptRoomItem,
    workerRun,
    output,
    review,
    qcJob
  };
}

async function buildAuditRoomFixture() {
  const { entry, executionPacket, promptRoomItem, workerRun, output, review, qcJob } =
    await buildEvidenceLinkFixturePipeline();
  const evidenceLink = createDraftEvidenceLinkFromPipelineRecords({
    outcomeItem: entry.item,
    executionPacket,
    promptRoomItem,
    workerRun,
    output,
    review,
    qcJob,
    evidenceId: "evidence-bundle-audit-1",
    reportId: "qc-report-audit-1",
    createdAt: "2026-05-01T14:11:00.000Z",
    updatedAt: "2026-05-01T14:11:00.000Z"
  });

  return {
    entry,
    executionPacket,
    promptRoomItem,
    workerRun,
    output,
    review,
    qcJob,
    evidenceLink
  };
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
  const promptRoomSource = moduleSources.find((source) =>
    source.includes("neroaOnePromptRoomItemSchema")
  );
  const codeExecutionWorkerSource = moduleSources.find((source) =>
    source.includes("neroaOneCodeExecutionWorkerRunSchema")
  );
  const codexOutputBoxSource = moduleSources.find((source) =>
    source.includes("neroaOneCodexOutputRecordSchema")
  );
  const outputReviewSource = moduleSources.find((source) =>
    source.includes("neroaOneOutputReviewRecordSchema")
  );
  const customerFollowUpSource = moduleSources.find((source) =>
    source.includes("neroaOneCustomerFollowUpItemSchema")
  );
  const strategyEscalationSource = moduleSources.find((source) =>
    source.includes("neroaOneStrategyEscalationItemSchema")
  );
  const repairQueueSource = moduleSources.find((source) =>
    source.includes("neroaOneRepairQueueItemSchema")
  );
  const qcStationSource = moduleSources.find((source) =>
    source.includes("neroaOneQcStationJobRecordSchema")
  );
  const evidenceLinkingSource = moduleSources.find((source) =>
    source.includes("neroaOneEvidenceLinkRecordSchema")
  );
  const auditRoomSource = moduleSources.find((source) =>
    source.includes("neroaOneAuditRoomEventSchema")
  );
  const storageAdaptersSource = moduleSources.find((source) =>
    source.includes("interface NeroaOneStorageTraceContext")
  );

  assert.ok(outcomeLaneSource);
  assert.ok(codexPacketSource);
  assert.ok(promptRoomSource);
  assert.ok(codeExecutionWorkerSource);
  assert.ok(codexOutputBoxSource);
  assert.ok(outputReviewSource);
  assert.ok(customerFollowUpSource);
  assert.ok(strategyEscalationSource);
  assert.ok(repairQueueSource);
  assert.ok(qcStationSource);
  assert.ok(evidenceLinkingSource);
  assert.ok(auditRoomSource);
  assert.ok(storageAdaptersSource);
  assert.doesNotMatch(outcomeLaneSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    outcomeLaneSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|strategy-room\/page|admin|library|live-view|browser-extension|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(
    outcomeLaneSource,
    /ready_for_customer|waiting_for_customer|allowedResponseType|futureCustomerFollowUpServiceTarget|ready_for_strategy_review|waiting_for_customer_decision|impactLevel|futureStrategyEscalationServiceTarget|createCustomerFollowUpItemFromOutcomeLaneItem|createCustomerFollowUpItemFromOutputReview|createStrategyEscalationItemFromOutcomeLaneItem|createStrategyEscalationItemFromOutputReview/i
  );
  assert.doesNotMatch(codexPacketSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    codexPacketSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(
    codexPacketSource,
    /selectedEngine|futureDigitalOceanWorkerTarget|future_code_execution_worker/i
  );
  assert.doesNotMatch(promptRoomSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(promptRoomSource, /from\s+["']\.\/build-room-handoff\.ts["']/i);
  assert.doesNotMatch(
    promptRoomSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(
    promptRoomSource,
    /selectedEngine|futureDigitalOceanWorkerTarget|future_code_execution_worker/i
  );
  assert.doesNotMatch(promptRoomSource, /openai|anthropic|from\s+["'][^"']*ai[^"']*["']/i);
  assert.match(promptRoomSource, /interface\s+NeroaOnePromptRoomStorageAdapter/);
  assert.doesNotMatch(codeExecutionWorkerSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(codeExecutionWorkerSource, /from\s+["']\.\/build-room-handoff\.ts["']/i);
  assert.doesNotMatch(
    codeExecutionWorkerSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(
    codeExecutionWorkerSource,
    /getNeroaOneOutcomeLaneIdsEligibleForCodexExecution|validateReadyToBuildLaneItemForCodexExecutionPacket|getPromptRoomCustomerSafeStatus/i
  );
  assert.doesNotMatch(codeExecutionWorkerSource, /fetch\(|DigitalOcean\(/i);
  assert.match(
    codeExecutionWorkerSource,
    /interface\s+NeroaOneCodeExecutionWorkerStorageAdapter/
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
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|strategy-room\/page|admin|library|live-view|browser-extension|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(outputReviewSource, /openai|anthropic|model review/i);
  assert.doesNotMatch(outputReviewSource, /createPendingReviewCodexOutputItem/i);
  assert.doesNotMatch(
    outputReviewSource,
    /from\s+["']\.\/qc-station\.ts["']|createQueuedQcStationJobFromApprovedOutputReview|createQueuedQcStationJobsFromApprovedOutputReview/i
  );
  assert.doesNotMatch(
    outputReviewSource,
    /repairPriority|futureRepairServiceTarget|ready_for_prompt_room|ready_for_worker_rerun|ready_for_customer|waiting_for_customer|allowedResponseType|futureCustomerFollowUpServiceTarget|ready_for_strategy_review|waiting_for_customer_decision|impactLevel|futureStrategyEscalationServiceTarget|createCustomerFollowUpItemFromOutcomeLaneItem|createCustomerFollowUpItemFromOutputReview|createStrategyEscalationItemFromOutcomeLaneItem|createStrategyEscalationItemFromOutputReview/i
  );
  assert.doesNotMatch(outputReviewSource, /saveOutputRecord|getOutputRecordById/i);
  assert.match(outputReviewSource, /interface\s+NeroaOneOutputReviewStorageAdapter/);
  assert.doesNotMatch(customerFollowUpSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    customerFollowUpSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(customerFollowUpSource, /openai|anthropic|from\s+["'][^"']*ai[^"']*["']/i);
  assert.doesNotMatch(
    customerFollowUpSource,
    /analyzeTaskWithNeroaOne|createNeroaOneOutcomeQueueEntry|createDraftCodexExecutionPacket|buildBuildRoomHandoffPackage|buildBuildRoomTaskHandoffPackage|buildBuildRoomCustomerTaskHandoffPackage|createDraftPromptRoomItemFromCodexExecutionPacket|createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket|createRepairQueueItemFromOutputReview|createQueuedQcStationJobFromApprovedOutputReview|createDraftEvidenceLinkFromPipelineRecords|createDraftEvidenceLinkFromPipelineIds|createAuditRoomEventFromEvidenceLink|createAuditRoomEventFromLaneAndEvidenceIds|createAdminOversightSummaryFromAuditEvents/i
  );
  assert.doesNotMatch(
    customerFollowUpSource,
    /saveOutputReview|getOutputReviewsByOutputId|saveRepairQueueItem|getRepairQueueItemById|savePromptRoomItem|saveWorkerRun/i
  );
  assert.match(
    customerFollowUpSource,
    /interface\s+NeroaOneCustomerFollowUpStorageAdapter/
  );
  assert.doesNotMatch(strategyEscalationSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    strategyEscalationSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|strategy-room\/page|admin|library|live-view|browser-extension|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(
    strategyEscalationSource,
    /legacy browser extension|Live View|side-panel runtime messaging|chrome\.storage|browser\.runtime|activeTab/i
  );
  assert.doesNotMatch(
    strategyEscalationSource,
    /openai|anthropic|from\s+["'][^"']*ai[^"']*["']/i
  );
  assert.doesNotMatch(
    strategyEscalationSource,
    /analyzeTaskWithNeroaOne|createNeroaOneOutcomeQueueEntry|createDraftCodexExecutionPacket|buildBuildRoomHandoffPackage|buildBuildRoomTaskHandoffPackage|buildBuildRoomCustomerTaskHandoffPackage|createDraftPromptRoomItemFromCodexExecutionPacket|createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket|createRepairQueueItemFromOutputReview|createQueuedQcStationJobFromApprovedOutputReview|createDraftEvidenceLinkFromPipelineRecords|createDraftEvidenceLinkFromPipelineIds|createAuditRoomEventFromEvidenceLink|createAuditRoomEventFromLaneAndEvidenceIds|createAdminOversightSummaryFromAuditEvents/i
  );
  assert.doesNotMatch(
    strategyEscalationSource,
    /saveOutputReview|getOutputReviewsByOutputId|saveRepairQueueItem|getRepairQueueItemById|saveCustomerFollowUpItem|getCustomerFollowUpItemById|savePromptRoomItem|saveWorkerRun/i
  );
  assert.match(
    strategyEscalationSource,
    /interface\s+NeroaOneStrategyEscalationStorageAdapter/
  );
  assert.doesNotMatch(repairQueueSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    repairQueueSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(repairQueueSource, /openai|anthropic|from\s+["'][^"']*ai[^"']*["']/i);
  assert.doesNotMatch(
    repairQueueSource,
    /createDraftPromptRoomItemFromCodexExecutionPacket|createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket|savePromptRoomItem|saveWorkerRun/i
  );
  assert.doesNotMatch(
    repairQueueSource,
    /saveOutputReview|getOutputReviewsByOutputId|createPlaceholderOutputReviewDecisionFromOutputItem|createPlaceholderOutputReviewDecisionsFromOutputItems/i
  );
  assert.match(repairQueueSource, /interface\s+NeroaOneRepairQueueStorageAdapter/);
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
  assert.doesNotMatch(
    qcStationSource,
    /getCustomerSafeEvidenceSummary|createDraftEvidenceLinkFromPipelineIds|createDraftEvidenceLinkFromPipelineRecords/i
  );
  assert.match(qcStationSource, /interface\s+NeroaOneQcStationStorageAdapter/);
  assert.doesNotMatch(evidenceLinkingSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    evidenceLinkingSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(
    evidenceLinkingSource,
    /legacy browser extension|Live View message channels|side-panel runtime messaging|chrome\.storage|browser\.runtime|activeTab/i
  );
  assert.doesNotMatch(evidenceLinkingSource, /openai|anthropic|from\s+["'][^"']*ai[^"']*["']/i);
  assert.doesNotMatch(
    evidenceLinkingSource,
    /getPromptRoomCustomerSafeStatus|createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket|createQueuedQcStationJobFromApprovedOutputReview/i
  );
  assert.doesNotMatch(
    evidenceLinkingSource,
    /createAuditRoomEventFromEvidenceLink|createAdminOversightSummaryFromAuditEvents|validateEvidenceLinkForAuditRoomEvent|getAuditRoomRecommendedActions|getAuditRoomSeverityLevels/i
  );
  assert.match(
    evidenceLinkingSource,
    /interface\s+NeroaOneEvidenceLinkingStorageAdapter/
  );
  assert.doesNotMatch(auditRoomSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    auditRoomSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(
    auditRoomSource,
    /legacy browser extension|Live View message channels|side-panel runtime messaging|chrome\.storage|browser\.runtime|activeTab/i
  );
  assert.doesNotMatch(auditRoomSource, /openai|anthropic|from\s+["'][^"']*ai[^"']*["']/i);
  assert.doesNotMatch(
    auditRoomSource,
    /createQueuedQcStationJobFromApprovedOutputReview|createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket|getPromptRoomCustomerSafeStatus/i
  );
  assert.doesNotMatch(
    auditRoomSource,
    /attachArtifactPointerToEvidenceLink|attachArtifactPointersToEvidenceLink|createDraftEvidenceLinkFromPipelineIds|createDraftEvidenceLinkFromPipelineRecords/i
  );
  assert.match(auditRoomSource, /interface\s+NeroaOneAuditRoomStorageAdapter/);
  assert.match(auditRoomSource, /interface\s+NeroaOneAdminOversightSummaryAdapter/);
  assert.match(storageAdaptersSource, /interface\s+NeroaOneStorageAdapterContract/);
  assert.match(storageAdaptersSource, /workspaceId\?: string \| null;/);
  assert.match(storageAdaptersSource, /projectId\?: string \| null;/);
  assert.match(storageAdaptersSource, /taskId\?: string \| null;/);
  assert.match(storageAdaptersSource, /laneId\?: string \| null;/);
  assert.match(storageAdaptersSource, /requestId\?: string \| null;/);
  assert.match(storageAdaptersSource, /traceId\?: string \| null;/);
  assert.match(storageAdaptersSource, /interface\s+NeroaOneOutcomeLaneStorageAdapterContract/);
  assert.match(
    storageAdaptersSource,
    /interface\s+NeroaOneCodexExecutionPacketStorageAdapterContract/
  );
  assert.match(storageAdaptersSource, /interface\s+NeroaOnePromptRoomStorageAdapterContract/);
  assert.match(
    storageAdaptersSource,
    /interface\s+NeroaOneCodeExecutionWorkerStorageAdapterContract/
  );
  assert.match(
    storageAdaptersSource,
    /interface\s+NeroaOneCodexOutputBoxStorageAdapterContract/
  );
  assert.match(
    storageAdaptersSource,
    /interface\s+NeroaOneOutputReviewStorageAdapterContract/
  );
  assert.match(storageAdaptersSource, /interface\s+NeroaOneRepairQueueStorageAdapterContract/);
  assert.match(storageAdaptersSource, /interface\s+NeroaOneQcStationStorageAdapterContract/);
  assert.match(
    storageAdaptersSource,
    /interface\s+NeroaOneEvidenceLinkingStorageAdapterContract/
  );
  assert.match(storageAdaptersSource, /interface\s+NeroaOneAuditRoomStorageAdapterContract/);
  assert.match(
    storageAdaptersSource,
    /interface\s+NeroaOneAdminOversightStorageAdapterContract/
  );
  assert.match(
    storageAdaptersSource,
    /interface\s+NeroaOneCustomerFollowUpStorageAdapterContract/
  );
  assert.match(
    storageAdaptersSource,
    /interface\s+NeroaOneStrategyEscalationStorageAdapterContract/
  );
  assert.match(
    storageAdaptersSource,
    /NeroaOneOutcomeQueueEntry|NeroaOneCodexExecutionPacket|NeroaOnePromptRoomItem|NeroaOneCodeExecutionWorkerRun|NeroaOneCodexOutputRecord|NeroaOneOutputReviewRecord|NeroaOneRepairQueueItem|NeroaOneQcStationJobRecord|NeroaOneEvidenceLinkRecord|NeroaOneAuditRoomEvent|NeroaOneAdminOversightSummary|NeroaOneCustomerFollowUpItem|NeroaOneStrategyEscalationItem/
  );
  assert.match(
    storageAdaptersSource,
    /export \* from "\.\/storage-adapters\.ts";|interface NeroaOneStorageTraceContext/
  );
});

test("Storage adapter contracts stay backend-only, schema-neutral, and implementation-free", () => {
  const storageAdaptersSource = moduleSources.find((source) =>
    source.includes("interface NeroaOneStorageTraceContext")
  );
  const queueAdaptersSource = moduleSources.find((source) =>
    source.includes("interface NeroaOneQueueTraceContext")
  );
  const indexSource = moduleSources.at(-1);

  assert.ok(storageAdaptersSource);
  assert.ok(queueAdaptersSource);
  assert.ok(indexSource);
  assert.match(indexSource, /export \* from "\.\/storage-adapters\.ts";/);
  assert.doesNotMatch(
    storageAdaptersSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|strategy-room\/page|admin|library|live-view|browser-extension|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(
    storageAdaptersSource,
    /from\s+["'][^"']*(postgres|prisma|kysely|drizzle|sequelize|typeorm|mongodb|sqlite)[^"']*["']/i
  );
  assert.doesNotMatch(
    storageAdaptersSource,
    /from\s+["'][^"']*(redis|bull|bullmq|bee-queue|pg-boss|amqplib|sqs|rabbitmq|kafka|minio|s3|digitalocean|supabase-js)[^"']*["']/i
  );
  assert.doesNotMatch(storageAdaptersSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    storageAdaptersSource,
    /legacy browser extension|Live View|side-panel runtime messaging|chrome\.storage|browser\.runtime|activeTab/i
  );
  assert.doesNotMatch(
    storageAdaptersSource,
    /openai|anthropic|from\s+["'][^"']*\/ai\/[^"']*["']/i
  );
  assert.doesNotMatch(storageAdaptersSource, /from\s+["']zod["']/i);
  assert.doesNotMatch(
    storageAdaptersSource,
    /\bfetch\(|\bnew\s+[A-Z]\w+|\bclass\s+\w+|\bimplements\b|=>\s*\{|function\s+\w+/i
  );
  assert.doesNotMatch(storageAdaptersSource, /export\s+const\s+/);
  assert.doesNotMatch(storageAdaptersSource, /\bparse\(|schema|tableName|schemaName|bucketName|sql|insert into|update set|delete from|create table/i);
  assert.doesNotMatch(
    storageAdaptersSource,
    /callback|webhook|onComplete|onSuccess|onFailure|enqueue|dequeue|publish|subscribe/i
  );
  assert.match(storageAdaptersSource, /import type\s+\{/);
  assert.match(storageAdaptersSource, /Readonly<TRecord>/);
  assert.match(storageAdaptersSource, /appendEvent\(/);
  assert.match(storageAdaptersSource, /updateStatus\(/);
  assert.match(storageAdaptersSource, /archive\(/);
  assert.match(storageAdaptersSource, /markFailed\(/);
  assert.doesNotMatch(storageAdaptersSource, /from\s+["']\.\/queue-adapters\.ts["']/i);
  assert.doesNotMatch(storageAdaptersSource, /\bNeroaOneQueue[A-Z]\w+/);
  assert.doesNotMatch(queueAdaptersSource, /from\s+["']\.\/storage-adapters\.ts["']/i);
});

test("Queue adapter contracts are exported, lane-typed, and implementation-free", () => {
  const queueAdaptersSource = moduleSources.find((source) =>
    source.includes("interface NeroaOneQueueTraceContext")
  );
  const indexSource = moduleSources.at(-1);

  assert.ok(queueAdaptersSource);
  assert.ok(indexSource);
  assert.match(indexSource, /export \* from "\.\/queue-adapters\.ts";/);
  assert.match(
    queueAdaptersSource,
    /export type NeroaOneQueueItemStatus =[\s\S]*"pending"[\s\S]*"queued"[\s\S]*"running"[\s\S]*"completed"[\s\S]*"failed"[\s\S]*"canceled"[\s\S]*"dead_lettered"/
  );
  assert.match(
    queueAdaptersSource,
    /export type NeroaOneQueuePriority = "low" \| "normal" \| "high" \| "critical";/
  );
  assert.match(queueAdaptersSource, /interface\s+NeroaOneQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneOutcomeLaneQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneCodexExecutionPacketQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOnePromptRoomQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneCodeExecutionWorkerQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneCodexOutputBoxQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneOutputReviewQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneRepairQueueQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneQcStationQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneEvidenceLinkingQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneAuditRoomQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneAdminOversightQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneCustomerFollowUpQueueAdapterContract/);
  assert.match(queueAdaptersSource, /interface\s+NeroaOneStrategyEscalationQueueAdapterContract/);
  assert.match(queueAdaptersSource, /NeroaOneOutcomeQueueEntry/);
  assert.match(queueAdaptersSource, /NeroaOneCodexExecutionPacket/);
  assert.match(queueAdaptersSource, /NeroaOnePromptRoomItem/);
  assert.match(queueAdaptersSource, /NeroaOneCodeExecutionWorkerRun/);
  assert.match(queueAdaptersSource, /NeroaOneCodexOutputRecord/);
  assert.match(queueAdaptersSource, /NeroaOneOutputReviewRecord/);
  assert.match(queueAdaptersSource, /NeroaOneRepairQueueItem/);
  assert.match(queueAdaptersSource, /NeroaOneQcStationJobRecord/);
  assert.match(queueAdaptersSource, /NeroaOneEvidenceLinkRecord/);
  assert.match(queueAdaptersSource, /NeroaOneAuditRoomEvent/);
  assert.match(queueAdaptersSource, /NeroaOneAdminOversightSummary/);
  assert.match(queueAdaptersSource, /NeroaOneCustomerFollowUpItem/);
  assert.match(queueAdaptersSource, /NeroaOneStrategyEscalationItem/);
  assert.match(
    queueAdaptersSource,
    /workspaceId[\s\S]*projectId[\s\S]*taskId[\s\S]*laneId[\s\S]*queueItemId[\s\S]*sourceLaneId[\s\S]*destinationLaneId[\s\S]*requestId[\s\S]*traceId/
  );
  assert.match(queueAdaptersSource, /enqueue\(/);
  assert.match(queueAdaptersSource, /enqueueDelayed\(/);
  assert.match(queueAdaptersSource, /getById\(/);
  assert.match(queueAdaptersSource, /listByProject\(/);
  assert.match(queueAdaptersSource, /listByWorkspace\(/);
  assert.match(queueAdaptersSource, /listByTask\(/);
  assert.match(queueAdaptersSource, /listByStatus\(/);
  assert.match(queueAdaptersSource, /markRunning\(/);
  assert.match(queueAdaptersSource, /markCompleted\(/);
  assert.match(queueAdaptersSource, /markFailed\(/);
  assert.match(queueAdaptersSource, /cancel\(/);
  assert.match(queueAdaptersSource, /retry\(/);
  assert.match(queueAdaptersSource, /deadLetter\(/);
  assert.match(queueAdaptersSource, /appendObservation\(/);
  assert.doesNotMatch(
    queueAdaptersSource,
    /from\s+["'][^"']*(components\/|app\/workspace\/|command-center\/page|build-room\/page|strategy-room\/page|admin|library|live-view|browser-extension|supabase)[^"']*["']/i
  );
  assert.doesNotMatch(
    queueAdaptersSource,
    /from\s+["'][^"']*(postgres|prisma|kysely|drizzle|sequelize|typeorm|mongodb|sqlite)[^"']*["']/i
  );
  assert.doesNotMatch(
    queueAdaptersSource,
    /from\s+["'][^"']*(redis|bull|bullmq|bee-queue|pg-boss|amqplib|sqs|rabbitmq|kafka|pubsub|minio|s3|digitalocean|supabase-js)[^"']*["']/i
  );
  assert.doesNotMatch(queueAdaptersSource, /codex-relay|worker-trigger/i);
  assert.doesNotMatch(
    queueAdaptersSource,
    /legacy browser extension|Live View|side-panel runtime messaging|chrome\.storage|browser\.runtime|activeTab/i
  );
  assert.doesNotMatch(
    queueAdaptersSource,
    /openai|anthropic|from\s+["'][^"']*\/ai\/[^"']*["']/i
  );
  assert.doesNotMatch(queueAdaptersSource, /from\s+["']\.\/storage-adapters\.ts["']/i);
  assert.doesNotMatch(queueAdaptersSource, /\bNeroaOneStorage[A-Z]\w+/);
  assert.doesNotMatch(queueAdaptersSource, /queueName|topicName|workerUrl|callbackUrl|webhookRoute|redisUrl/i);
  assert.doesNotMatch(queueAdaptersSource, /\bthrow\b|throws|throw new Error/i);
  assert.doesNotMatch(
    queueAdaptersSource,
    /\bfetch\(|\bnew\s+[A-Z]\w+|\bclass\s+\w+|\bimplements\b|function\s+\w+/i
  );
  assert.doesNotMatch(queueAdaptersSource, /export\s+const\s+/);
  assert.match(queueAdaptersSource, /^import type/m);
});

test("Lane modules stay free of shared storage and queue adapter implementation responsibility", () => {
  const laneSources = moduleSources.slice(0, -3);

  for (const source of laneSources) {
    assert.doesNotMatch(source, /from\s+["']\.\/storage-adapters\.ts["']/i);
    assert.doesNotMatch(source, /from\s+["']\.\/queue-adapters\.ts["']/i);
    assert.doesNotMatch(
      source,
      /\b(?:supabase|postgres|prisma|kysely|drizzle|sequelize|typeorm|mongodb|sqlite|redis|bullmq|bee-queue|pg-boss|amqplib|sqs|rabbitmq|kafka|minio|s3)\b|digitalocean spaces/i
    );
    assert.doesNotMatch(
      source,
      /tableName|schemaName|bucketName|insert into|update set|delete from|create table/i
    );
    assert.doesNotMatch(
      source,
      /interface\s+NeroaOne\w+QueueAdapterContract|enqueueDelayed\(|deadLetter\(|appendObservation\(/i
    );
  }
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

test("Code execution worker lane stays typed, backend-only, and engine-agnostic", () => {
  assert.deepEqual([...NEROA_ONE_CODE_EXECUTION_WORKER_ENGINES], [
    "codex_cli",
    "codex_cloud",
    "claude_code",
    "manual_operator",
    "future_engine"
  ]);
  assert.deepEqual([...NEROA_ONE_CODE_EXECUTION_WORKER_RUN_STATUSES], [
    "queued",
    "running",
    "completed",
    "failed",
    "canceled"
  ]);
  assert.equal(neroaOneCodeExecutionWorkerLane.backendOnly, true);
  assert.equal(neroaOneCodeExecutionWorkerLane.extractionReady, true);
  assert.equal(neroaOneCodeExecutionWorkerLane.upstreamLaneId, "prompt_room");
  assert.equal(neroaOneCodeExecutionWorkerLane.createsRunsOnlyFromReadyPromptRoomItems, true);
  assert.equal(neroaOneCodeExecutionWorkerLane.selectsExecutionEngineAtWorkerLane, true);
  assert.equal(neroaOneCodeExecutionWorkerLane.engineAgnostic, true);
  assert.equal(neroaOneCodeExecutionWorkerLane.independentlyReplaceable, true);
  assert.equal(neroaOneCodeExecutionWorkerLane.treatsBuildRoomAsViewportOnly, true);
  assert.equal(neroaOneCodeExecutionWorkerLane.dispatchesRealDigitalOceanJobsNow, false);
  assert.equal(neroaOneCodeExecutionWorkerLane.writesPersistenceNow, false);
  assert.deepEqual(getCodeExecutionWorkerEngines(), [...NEROA_ONE_CODE_EXECUTION_WORKER_ENGINES]);
  assert.deepEqual(
    getCodeExecutionWorkerRunStatuses(),
    [...NEROA_ONE_CODE_EXECUTION_WORKER_RUN_STATUSES]
  );
});

test("Codex execution packet lane stays draft-only and does not select runtime worker infrastructure", () => {
  assert.equal(neroaOneCodexExecutionPacketLane.backendOnly, true);
  assert.equal(neroaOneCodexExecutionPacketLane.extractionReady, true);
  assert.equal(neroaOneCodexExecutionPacketLane.selectsRuntimeWorkerInfrastructureNow, false);
  assert.equal(
    neroaOneCodexExecutionPacketLane.futureDispatchTarget.queueName,
    "neroa-one.codex-execution-packets"
  );
});

test("Prompt Room lane stays internal-only, backend-only, and customer-safe by projection", () => {
  assert.deepEqual([...NEROA_ONE_PROMPT_ROOM_STATUSES], [
    "draft_pending",
    "draft_ready",
    "validation_failed",
    "ready_for_code_builder",
    "canceled"
  ]);
  assert.deepEqual([...NEROA_ONE_PROMPT_ROOM_CUSTOMER_SAFE_STATUSES], [
    "preparing_build_task",
    "build_queued",
    "build_blocked",
    "build_canceled"
  ]);
  assert.equal(neroaOnePromptRoomLane.backendOnly, true);
  assert.equal(neroaOnePromptRoomLane.internalOnly, true);
  assert.equal(neroaOnePromptRoomLane.extractionReady, true);
  assert.equal(neroaOnePromptRoomLane.independentlyReplaceable, true);
  assert.equal(neroaOnePromptRoomLane.exposesCustomerSafeStatusOnly, true);
  assert.equal(neroaOnePromptRoomLane.selectsExecutionEngineNow, false);
  assert.equal(neroaOnePromptRoomLane.selectsRuntimeWorkerInfrastructureNow, false);
  assert.equal(neroaOnePromptRoomLane.callsAiNow, false);
  assert.equal(neroaOnePromptRoomLane.storesPromptDraftsNow, false);
  assert.equal(neroaOnePromptRoomLane.writesPersistenceNow, false);
  assert.deepEqual(getPromptRoomStatuses(), [...NEROA_ONE_PROMPT_ROOM_STATUSES]);
  assert.deepEqual(
    getPromptRoomCustomerSafeStatuses(),
    [...NEROA_ONE_PROMPT_ROOM_CUSTOMER_SAFE_STATUSES]
  );
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
  assert.match(
    neroaOneOutputReviewLane.internalOnlyNotes.join(" "),
    /typed review decisions only/i
  );
  assert.match(
    neroaOneOutputReviewLane.internalOnlyNotes.join(" "),
    /must not own strategy escalation statuses, impact levels, or future strategy-escalation service routing/i
  );
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

test("Customer Follow-Up lane stays typed, backend-only, and extraction-ready", () => {
  assert.deepEqual([...NEROA_ONE_CUSTOMER_FOLLOW_UP_SOURCE_TYPES], [
    "needs_customer_answer",
    "blocked_missing_information",
    "customer_followup"
  ]);
  assert.deepEqual([...NEROA_ONE_CUSTOMER_FOLLOW_UP_ITEM_STATUSES], [
    "draft",
    "ready_for_customer",
    "waiting_for_customer",
    "answered",
    "canceled",
    "archived",
    "failed"
  ]);
  assert.deepEqual([...NEROA_ONE_CUSTOMER_FOLLOW_UP_TYPES], [
    "clarification_question",
    "missing_information",
    "customer_decision_needed",
    "scope_confirmation",
    "output_review_followup",
    "blocked_work_notice",
    "other"
  ]);
  assert.deepEqual([...NEROA_ONE_CUSTOMER_FOLLOW_UP_ALLOWED_RESPONSE_TYPES], [
    "free_text",
    "yes_no",
    "approve_reject",
    "select_one",
    "upload_required",
    "none"
  ]);
  assert.deepEqual(getCustomerFollowUpSourceTypes(), [
    "needs_customer_answer",
    "blocked_missing_information",
    "customer_followup"
  ]);
  assert.deepEqual(getCustomerFollowUpItemStatuses(), [
    "draft",
    "ready_for_customer",
    "waiting_for_customer",
    "answered",
    "canceled",
    "archived",
    "failed"
  ]);
  assert.deepEqual(getCustomerFollowUpTypes(), [
    "clarification_question",
    "missing_information",
    "customer_decision_needed",
    "scope_confirmation",
    "output_review_followup",
    "blocked_work_notice",
    "other"
  ]);
  assert.deepEqual(getCustomerFollowUpAllowedResponseTypes(), [
    "free_text",
    "yes_no",
    "approve_reject",
    "select_one",
    "upload_required",
    "none"
  ]);
  assert.equal(neroaOneCustomerFollowUpLane.backendOnly, true);
  assert.equal(neroaOneCustomerFollowUpLane.extractionReady, true);
  assert.equal(neroaOneCustomerFollowUpLane.independentlyReplaceable, true);
  assert.equal(neroaOneCustomerFollowUpLane.sideEffectLight, true);
  assert.equal(neroaOneCustomerFollowUpLane.uiDecoupled, true);
  assert.equal(neroaOneCustomerFollowUpLane.exposesCustomerSafeProjectionOnly, true);
  assert.equal(neroaOneCustomerFollowUpLane.storesFollowUpItemsNow, false);
  assert.equal(neroaOneCustomerFollowUpLane.routesCommandCenterNow, false);
  assert.equal(neroaOneCustomerFollowUpLane.writesPersistenceNow, false);
  assert.match(
    neroaOneCustomerFollowUpLane.internalOnlyNotes.join(" "),
    /must not classify analyzer outcomes/i
  );
  assert.match(
    neroaOneCustomerFollowUpLane.internalOnlyNotes.join(" "),
    /must not create execution packets, Prompt Room items, worker runs, QC jobs, evidence links, audit events, repair items, or strategy revisions/i
  );
});

test("Strategy Escalation lane stays typed, backend-only, and extraction-ready", () => {
  assert.deepEqual([...NEROA_ONE_STRATEGY_ESCALATION_ACCEPTED_OUTCOME_LANE_IDS], [
    "roadmap_revision_required"
  ]);
  assert.deepEqual([...NEROA_ONE_STRATEGY_ESCALATION_ACCEPTED_OUTPUT_REVIEW_DECISIONS], [
    "strategy_escalation"
  ]);
  assert.deepEqual([...NEROA_ONE_STRATEGY_ESCALATION_SOURCE_TYPES], [
    "roadmap_revision_required",
    "strategy_escalation"
  ]);
  assert.deepEqual([...NEROA_ONE_STRATEGY_ESCALATION_ITEM_STATUSES], [
    "draft",
    "ready_for_strategy_review",
    "waiting_for_customer_decision",
    "approved",
    "rejected",
    "archived",
    "failed"
  ]);
  assert.deepEqual([...NEROA_ONE_STRATEGY_ESCALATION_TYPES], [
    "roadmap_change",
    "scope_change",
    "budget_change",
    "timeline_change",
    "product_direction_change",
    "architecture_change",
    "dependency_change",
    "risk_escalation",
    "other"
  ]);
  assert.deepEqual([...NEROA_ONE_STRATEGY_ESCALATION_IMPACT_LEVELS], [
    "low",
    "medium",
    "high",
    "critical"
  ]);
  assert.deepEqual(getStrategyEscalationSourceTypes(), [
    "roadmap_revision_required",
    "strategy_escalation"
  ]);
  assert.deepEqual(getStrategyEscalationItemStatuses(), [
    "draft",
    "ready_for_strategy_review",
    "waiting_for_customer_decision",
    "approved",
    "rejected",
    "archived",
    "failed"
  ]);
  assert.deepEqual(getStrategyEscalationTypes(), [
    "roadmap_change",
    "scope_change",
    "budget_change",
    "timeline_change",
    "product_direction_change",
    "architecture_change",
    "dependency_change",
    "risk_escalation",
    "other"
  ]);
  assert.deepEqual(getStrategyEscalationImpactLevels(), [
    "low",
    "medium",
    "high",
    "critical"
  ]);
  assert.equal(neroaOneStrategyEscalationLane.backendOnly, true);
  assert.equal(neroaOneStrategyEscalationLane.extractionReady, true);
  assert.equal(neroaOneStrategyEscalationLane.independentlyReplaceable, true);
  assert.equal(neroaOneStrategyEscalationLane.sideEffectLight, true);
  assert.equal(neroaOneStrategyEscalationLane.uiDecoupled, true);
  assert.equal(neroaOneStrategyEscalationLane.exposesCustomerSafeProjectionOnly, true);
  assert.equal(neroaOneStrategyEscalationLane.storesStrategyEscalationItemsNow, false);
  assert.equal(neroaOneStrategyEscalationLane.routesStrategyRoomNow, false);
  assert.equal(neroaOneStrategyEscalationLane.writesPersistenceNow, false);
  assert.deepEqual(neroaOneStrategyEscalationLane.acceptedOutcomeLaneIds, [
    "roadmap_revision_required"
  ]);
  assert.deepEqual(neroaOneStrategyEscalationLane.acceptedOutputReviewDecisions, [
    "strategy_escalation"
  ]);
  assert.match(
    neroaOneStrategyEscalationLane.internalOnlyNotes.join(" "),
    /owns roadmap and scope escalation item contracts only/i
  );
  assert.match(
    neroaOneStrategyEscalationLane.internalOnlyNotes.join(" "),
    /must not classify analyzer outcomes/i
  );
  assert.match(
    neroaOneStrategyEscalationLane.internalOnlyNotes.join(" "),
    /must not create execution packets, Prompt Room items, worker runs, QC jobs, evidence links, audit events, repair items, customer follow-up items, or roadmap records/i
  );
});

test("Repair Queue lane stays typed, backend-only, and extraction-ready", () => {
  assert.deepEqual([...NEROA_ONE_REPAIR_QUEUE_SOURCE_DECISIONS], [
    "needs_repair",
    "rerun_required"
  ]);
  assert.deepEqual([...NEROA_ONE_REPAIR_QUEUE_ITEM_STATUSES], [
    "draft",
    "queued",
    "ready_for_prompt_room",
    "ready_for_worker_rerun",
    "blocked",
    "archived",
    "failed"
  ]);
  assert.deepEqual([...NEROA_ONE_REPAIR_QUEUE_PRIORITIES], [
    "low",
    "normal",
    "high",
    "critical"
  ]);
  assert.deepEqual([...NEROA_ONE_REPAIR_QUEUE_TYPES], [
    "code_fix",
    "prompt_revision",
    "test_failure",
    "qc_failure",
    "worker_failure",
    "scope_conflict",
    "unknown"
  ]);
  assert.deepEqual(getRepairQueueSourceDecisions(), [
    "needs_repair",
    "rerun_required"
  ]);
  assert.deepEqual(getRepairQueueItemStatuses(), [
    "draft",
    "queued",
    "ready_for_prompt_room",
    "ready_for_worker_rerun",
    "blocked",
    "archived",
    "failed"
  ]);
  assert.deepEqual(getRepairQueuePriorities(), [
    "low",
    "normal",
    "high",
    "critical"
  ]);
  assert.deepEqual(getRepairQueueTypes(), [
    "code_fix",
    "prompt_revision",
    "test_failure",
    "qc_failure",
    "worker_failure",
    "scope_conflict",
    "unknown"
  ]);
  assert.equal(neroaOneRepairQueueLane.backendOnly, true);
  assert.equal(neroaOneRepairQueueLane.extractionReady, true);
  assert.equal(neroaOneRepairQueueLane.independentlyReplaceable, true);
  assert.equal(neroaOneRepairQueueLane.sideEffectLight, true);
  assert.equal(neroaOneRepairQueueLane.uiDecoupled, true);
  assert.equal(neroaOneRepairQueueLane.storesRepairItemsNow, false);
  assert.equal(neroaOneRepairQueueLane.routesPromptRoomNow, false);
  assert.equal(neroaOneRepairQueueLane.routesWorkerRerunNow, false);
  assert.equal(neroaOneRepairQueueLane.writesPersistenceNow, false);
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
  assert.equal(neroaOneQcStationLane.ownsFutureQcJobContractsOnly, true);
  assert.equal(neroaOneQcStationLane.createsCustomerSafeEvidenceSummariesNow, false);
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

test("Evidence Linking lane stays typed, backend-only, and extraction-ready", () => {
  assert.deepEqual([...NEROA_ONE_EVIDENCE_LINK_STATUSES], [
    "draft",
    "awaiting_qc",
    "evidence_ready",
    "customer_result_ready",
    "archived",
    "failed"
  ]);
  assert.deepEqual([...NEROA_ONE_EVIDENCE_ARTIFACT_POINTER_TYPES], [
    "screenshot",
    "video",
    "qc_report",
    "raw_worker_output",
    "audit_trace",
    "customer_summary",
    "other"
  ]);
  assert.equal(neroaOneEvidenceLinkingLane.backendOnly, true);
  assert.equal(neroaOneEvidenceLinkingLane.extractionReady, true);
  assert.equal(neroaOneEvidenceLinkingLane.independentlyReplaceable, true);
  assert.equal(neroaOneEvidenceLinkingLane.observerSafe, true);
  assert.equal(neroaOneEvidenceLinkingLane.linksExecutionTraceOnly, true);
  assert.equal(neroaOneEvidenceLinkingLane.referencesQcJobsWithoutOwningQcNow, true);
  assert.equal(neroaOneEvidenceLinkingLane.createsQcJobsNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.mutatesQcJobsNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.runsQcJobsNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.cancelsQcJobsNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.completesQcJobsNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.createsAuditEventsNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.classifiesAuditSeverityNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.recommendsAdminActionNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.detectsStuckWorkNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.detectsRetryLoopsNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.detectsCostWasteNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.detectsPolicyViolationsNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.ownsExecutionNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.ownsReviewNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.ownsQcNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.ownsCustomerUiNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.dependsOnLegacyBrowserRuntimeNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.storesEvidenceNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.writesPersistenceNow, false);
  assert.equal(neroaOneEvidenceLinkingLane.exposesCustomerSafeProjectionOnly, true);
  assert.deepEqual(getEvidenceLinkStatuses(), [...NEROA_ONE_EVIDENCE_LINK_STATUSES]);
  assert.deepEqual(
    getEvidenceArtifactPointerTypes(),
    [...NEROA_ONE_EVIDENCE_ARTIFACT_POINTER_TYPES]
  );
});

test("Audit Room lane stays typed, backend-only, internal-only, and extraction-ready", () => {
  assert.deepEqual([...NEROA_ONE_AUDIT_ROOM_EVENT_TYPES], [
    "lane_transition",
    "policy_violation",
    "stuck_item",
    "retry_loop",
    "qc_failure",
    "worker_failure",
    "cost_waste",
    "customer_blocker",
    "strategy_escalation",
    "evidence_ready",
    "system_health"
  ]);
  assert.deepEqual([...NEROA_ONE_AUDIT_ROOM_SEVERITY_LEVELS], ["info", "warning", "critical"]);
  assert.deepEqual([...NEROA_ONE_AUDIT_ROOM_RECOMMENDED_ACTIONS], [
    "observe",
    "notify_admin",
    "create_repair_task",
    "request_customer_answer",
    "escalate_strategy",
    "pause_execution",
    "archive"
  ]);
  assert.equal(neroaOneAuditRoomLane.backendOnly, true);
  assert.equal(neroaOneAuditRoomLane.internalOnly, true);
  assert.equal(neroaOneAuditRoomLane.extractionReady, true);
  assert.equal(neroaOneAuditRoomLane.independentlyReplaceable, true);
  assert.equal(neroaOneAuditRoomLane.observerSafe, true);
  assert.equal(neroaOneAuditRoomLane.watchesAllNeroaOneLanes, true);
  assert.equal(neroaOneAuditRoomLane.ownsBackgroundGovernanceSignalsOnly, true);
  assert.equal(neroaOneAuditRoomLane.createsEvidenceLinksNow, false);
  assert.equal(neroaOneAuditRoomLane.mutatesEvidenceLinksNow, false);
  assert.equal(neroaOneAuditRoomLane.archivesEvidenceLinksNow, false);
  assert.equal(neroaOneAuditRoomLane.failsEvidenceLinksNow, false);
  assert.equal(neroaOneAuditRoomLane.storesEvidenceLinksNow, false);
  assert.equal(neroaOneAuditRoomLane.ownsCustomerFacingUiNow, false);
  assert.equal(neroaOneAuditRoomLane.ownsExecutionControlNow, false);
  assert.equal(neroaOneAuditRoomLane.ownsQcRuntimeNow, false);
  assert.equal(neroaOneAuditRoomLane.callsAiNow, false);
  assert.equal(neroaOneAuditRoomLane.storesAuditEventsNow, false);
  assert.equal(neroaOneAuditRoomLane.writesPersistenceNow, false);
  assert.equal(neroaOneAuditRoomLane.exposesCustomerSafeProjectionOnly, true);
  assert.deepEqual(getAuditRoomEventTypes(), [...NEROA_ONE_AUDIT_ROOM_EVENT_TYPES]);
  assert.deepEqual(
    getAuditRoomSeverityLevels(),
    [...NEROA_ONE_AUDIT_ROOM_SEVERITY_LEVELS]
  );
  assert.deepEqual(
    getAuditRoomRecommendedActions(),
    [...NEROA_ONE_AUDIT_ROOM_RECOMMENDED_ACTIONS]
  );
});

test("Audit Room can create typed events from lane and evidence identifiers", async () => {
  const { evidenceLink } = await buildAuditRoomFixture();
  const event = createAuditRoomEventFromLaneAndEvidenceIds({
    workspaceId: evidenceLink.workspaceId,
    projectId: evidenceLink.projectId,
    taskId: evidenceLink.taskId,
    sourceLaneId: "qc_station",
    relatedIds: {
      executionPacketId: evidenceLink.executionPacketId,
      promptRoomItemId: evidenceLink.promptRoomItemId,
      workerRunId: evidenceLink.workerRunId,
      outputId: evidenceLink.outputId,
      reviewId: evidenceLink.reviewId,
      qcJobId: evidenceLink.qcJobId,
      evidenceLinkId: evidenceLink.evidenceLinkId,
      evidenceId: evidenceLink.evidenceId,
      reportId: evidenceLink.reportId
    },
    eventType: "qc_failure",
    severity: "warning",
    internalSummary:
      "Audit Room observed a QC failure signal tied to the linked evidence chain.",
    customerSafeSummary:
      "Internal quality monitoring flagged a failure and recommends create_repair_task.",
    createdAt: "2026-05-01T14:12:00.000Z"
  });

  assert.match(event.auditEventId, /:audit:qc_station:qc_failure:/i);
  assert.equal(event.sourceLaneId, "qc_station");
  assert.equal(event.eventType, "qc_failure");
  assert.equal(event.severity, "warning");
  assert.equal(event.recommendedAction, "create_repair_task");
  assert.equal(event.relatedIds.evidenceLinkId, evidenceLink.evidenceLinkId);
  assert.equal(event.relatedIds.qcJobId, evidenceLink.qcJobId);
});

test("Audit Room can create evidence-ready events and admin summaries from evidence links", async () => {
  const { evidenceLink } = await buildAuditRoomFixture();
  const evidenceValidation = validateEvidenceLinkForAuditRoomEvent({
    link: evidenceLink
  });
  const evidenceReadyEvent = createAuditRoomEventFromEvidenceLink({
    link: evidenceLink,
    createdAt: "2026-05-01T14:13:00.000Z"
  });
  const retryEvent = createAuditRoomEventFromLaneAndEvidenceIds({
    workspaceId: evidenceLink.workspaceId,
    projectId: evidenceLink.projectId,
    taskId: evidenceLink.taskId,
    sourceLaneId: "code_execution_worker",
    relatedIds: {
      workerRunId: evidenceLink.workerRunId,
      evidenceLinkId: evidenceLink.evidenceLinkId
    },
    eventType: "retry_loop",
    severity: "warning",
    internalSummary: "Audit observed repeated worker retry behavior on this task.",
    createdAt: "2026-05-01T14:13:30.000Z"
  });
  const criticalEvent = createAuditRoomEventFromLaneAndEvidenceIds({
    workspaceId: evidenceLink.workspaceId,
    projectId: evidenceLink.projectId,
    taskId: evidenceLink.taskId,
    sourceLaneId: "code_execution_worker",
    relatedIds: {
      workerRunId: evidenceLink.workerRunId,
      evidenceLinkId: evidenceLink.evidenceLinkId
    },
    eventType: "worker_failure",
    severity: "critical",
    internalSummary: "Audit observed a worker failure requiring execution pause.",
    createdAt: "2026-05-01T14:14:00.000Z"
  });
  const summary = createAdminOversightSummaryFromAuditEvents({
    workspaceId: evidenceLink.workspaceId,
    projectId: evidenceLink.projectId,
    taskId: evidenceLink.taskId,
    events: [evidenceReadyEvent, retryEvent, criticalEvent],
    updatedAt: "2026-05-01T14:14:00.000Z"
  });

  assert.equal(evidenceValidation.allowed, true);
  assert.equal(evidenceValidation.evidenceLaneId, "evidence_linking");
  assert.equal(evidenceReadyEvent.sourceLaneId, "evidence_linking");
  assert.equal(evidenceReadyEvent.eventType, "evidence_ready");
  assert.equal(evidenceReadyEvent.relatedIds.evidenceLinkId, evidenceLink.evidenceLinkId);
  assert.equal(summary.openWarnings, 1);
  assert.equal(summary.criticalAlerts, 1);
  assert.equal(summary.retryLoopCount, 1);
  assert.equal(summary.workerFailureCount, 1);
  assert.equal(summary.estimatedWasteRisk, "high");
  assert.equal(summary.recommendedAdminAction, "pause_execution");
});

test("Malformed or incomplete evidence links are rejected from Audit Room event creation", async () => {
  const { evidenceLink } = await buildAuditRoomFixture();
  const malformedEvidenceLink = {
    ...evidenceLink,
    taskId: "",
    evidenceLinkId: ""
  };
  const validation = validateEvidenceLinkForAuditRoomEvent({
    link: malformedEvidenceLink
  });

  assert.equal(validation.allowed, false);
  assert.match(validation.reason, /invalid for Audit Room event creation at/i);
  assert.throws(
    () =>
      createAuditRoomEventFromEvidenceLink({
        link: malformedEvidenceLink,
        createdAt: "2026-05-01T14:14:30.000Z"
      }),
    /Evidence link is invalid for Audit Room event creation/i
  );
});

test("Audit Room remains observer-only and does not own evidence lifecycle behavior", async () => {
  const { evidenceLink } = await buildAuditRoomFixture();
  const event = createAuditRoomEventFromEvidenceLink({
    link: evidenceLink,
    eventType: "system_health",
    severity: "warning",
    createdAt: "2026-05-01T14:15:00.000Z"
  });

  assert.equal(neroaOneAuditRoomLane.createsEvidenceLinksNow, false);
  assert.equal(neroaOneAuditRoomLane.mutatesEvidenceLinksNow, false);
  assert.equal(neroaOneAuditRoomLane.archivesEvidenceLinksNow, false);
  assert.equal(neroaOneAuditRoomLane.failsEvidenceLinksNow, false);
  assert.equal(neroaOneAuditRoomLane.storesEvidenceLinksNow, false);
  assert.equal(event.relatedIds.evidenceLinkId, evidenceLink.evidenceLinkId);
  assert.equal(evidenceLink.status, "evidence_ready");
  assert.equal(event.eventType, "system_health");
  assert.equal(event.recommendedAction, "observe");
});

test("Audit Room customer-safe projection strips internal execution and audit-only details", async () => {
  const { evidenceLink } = await buildAuditRoomFixture();
  const event = createAuditRoomEventFromLaneAndEvidenceIds({
    workspaceId: evidenceLink.workspaceId,
    projectId: evidenceLink.projectId,
    taskId: evidenceLink.taskId,
    sourceLaneId: "evidence_linking",
    relatedIds: {
      evidenceLinkId: evidenceLink.evidenceLinkId,
      workerRunId: evidenceLink.workerRunId,
      qcJobId: evidenceLink.qcJobId
    },
    eventType: "evidence_ready",
    severity: "info",
    internalSummary:
      "Internal audit-only notes captured worker and prompt boundary context for evidence readiness.",
    customerSafeSummary: "Internal evidence packaging is ready for the next administrative step.",
    createdAt: "2026-05-01T14:15:00.000Z"
  });
  const customerSafeView = getCustomerSafeAuditEventView({
    event
  });
  const customerSafeJson = JSON.stringify(customerSafeView);

  assert.equal(customerSafeView.eventType, "evidence_ready");
  assert.equal(customerSafeView.sourceLaneId, "evidence_linking");
  assert.doesNotMatch(customerSafeJson, /internalSummary|relatedIds|internal audit-only notes/i);
  assert.doesNotMatch(customerSafeJson, /promptText|raw worker instructions?|protectedAreas/i);
  assert.doesNotMatch(customerSafeJson, /model routing|selectedEngine|worker secret/i);
  assert.doesNotMatch(
    customerSafeJson,
    /legacy browser extension|Live View|side-panel runtime messaging|chrome\.storage|browser\.runtime|activeTab/i
  );
  assert.throws(
    () =>
      createAuditRoomEventFromLaneAndEvidenceIds({
        workspaceId: evidenceLink.workspaceId,
        projectId: evidenceLink.projectId,
        taskId: evidenceLink.taskId,
        sourceLaneId: "audit_room",
        eventType: "policy_violation",
        severity: "critical",
        internalSummary: "Audit policy violation contains internal details.",
        customerSafeSummary: "promptText and worker secret leaked here",
        createdAt: "2026-05-01T14:16:00.000Z"
      }),
    /Customer-safe audit summaries must not expose internal execution, worker, runtime, or audit-only details/i
  );
});

test("Valid pipeline records can create a draft evidence link and attach typed artifacts", async () => {
  const { entry, executionPacket, promptRoomItem, workerRun, output, review, qcJob } =
    await buildEvidenceLinkFixturePipeline();
  const validation = validateEvidenceLinkPipelineRecords({
    outcomeItem: entry.item,
    executionPacket,
    promptRoomItem,
    workerRun,
    output,
    review,
    qcJob,
    evidenceId: "evidence-bundle-1",
    reportId: "qc-report-1"
  });

  assert.equal(validation.allowed, true);

  const link = createDraftEvidenceLinkFromPipelineRecords({
    outcomeItem: entry.item,
    executionPacket,
    promptRoomItem,
    workerRun,
    output,
    review,
    qcJob,
    evidenceId: "evidence-bundle-1",
    reportId: "qc-report-1",
    createdAt: "2026-05-01T14:06:00.000Z",
    updatedAt: "2026-05-01T14:06:00.000Z"
  });
  const screenshotPointer = createEvidenceArtifactPointer({
    evidenceLinkId: link.evidenceLinkId,
    artifactId: "screenshot-1",
    pointerType: "screenshot",
    title: "Release capture",
    createdAt: "2026-05-01T14:07:00.000Z"
  });
  const reportPointer = createEvidenceArtifactPointer({
    evidenceLinkId: link.evidenceLinkId,
    artifactId: "qc-report-1",
    pointerType: "qc_report",
    title: "QC report",
    createdAt: "2026-05-01T14:08:00.000Z"
  });
  const linkedEvidence = attachArtifactPointersToEvidenceLink({
    link,
    pointers: [screenshotPointer, reportPointer],
    updatedAt: "2026-05-01T14:08:00.000Z"
  });

  assert.equal(link.status, "evidence_ready");
  assert.equal(link.outputId, output.outputId);
  assert.equal(link.reviewId, review.reviewId);
  assert.equal(link.qcJobId, qcJob.qcJobId);
  assert.equal(link.evidenceId, "evidence-bundle-1");
  assert.equal(link.workerRunId, workerRun.workerRunId);
  assert.equal(link.promptRoomItemId, promptRoomItem.promptRoomItemId);
  assert.equal(link.executionPacketId, executionPacket.executionPacketId);
  assert.equal(link.outcomeLaneId, "ready_to_build");
  assert.equal(linkedEvidence.reportId, "qc-report-1");
  assert.deepEqual(linkedEvidence.screenshotIds, ["screenshot-1"]);
  assert.equal(linkedEvidence.artifactPointers.length, 2);
});

test("A valid QC job can be referenced by Evidence Linking without Evidence Linking owning QC behavior", async () => {
  const { executionPacket, output, review, qcJob } = await buildEvidenceLinkFixturePipeline();
  const validation = validateQcStationJobReferenceForEvidenceLink({
    qcJob,
    reviewId: review.reviewId,
    outputId: output.outputId,
    workspaceId: executionPacket.workspaceId,
    projectId: executionPacket.projectId,
    taskId: executionPacket.taskId
  });

  assert.equal(validation.allowed, true);
  assert.equal(validation.qcJob.qcJobId, qcJob.qcJobId);
  assert.equal(validation.reviewId, review.reviewId);
  assert.equal(validation.outputId, output.outputId);
  assert.equal(validation.qcLane.laneId, "qc_station");
  assert.equal(validation.evidenceLane.laneId, "evidence_linking");
});

test("Malformed or incomplete pipeline identifiers are rejected for evidence linking", () => {
  const malformedPipelineIds = {
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    taskId: "task-evidence-link-bad",
    analyzerOutcome: "ready_to_build",
    outcomeLaneId: "ready_to_build",
    executionPacketId: "packet-bad",
    promptRoomItemId: "prompt-room-bad",
    workerRunId: "worker-run-bad",
    outputId: null,
    reviewId: "review-bad",
    qcJobId: null,
    evidenceId: null,
    recordingId: null,
    screenshotIds: [],
    reportId: null,
    customerResultId: null
  };
  const validation = validateEvidenceLinkPipelineIds({
    pipelineIds: malformedPipelineIds
  });

  assert.equal(validation.allowed, false);
  assert.match(validation.reason, /reviewId cannot be attached before outputId/i);
  assert.throws(
    () =>
      createDraftEvidenceLinkFromPipelineIds({
        pipelineIds: malformedPipelineIds
      }),
    /reviewId cannot be attached before outputId/i
  );
});

test("Malformed QC job references are rejected from Evidence Linking", async () => {
  const { executionPacket, promptRoomItem, workerRun, output, review, qcJob } =
    await buildEvidenceLinkFixturePipeline();
  const malformedQcJob = {
    ...qcJob,
    qcJobId: `wrong-review:qc:${qcJob.jobType}:20260501T140500000Z`,
    taskId: "task-evidence-link-other"
  };
  const validation = validateQcStationJobReferenceForEvidenceLink({
    qcJob: malformedQcJob,
    reviewId: review.reviewId,
    outputId: output.outputId,
    workspaceId: executionPacket.workspaceId,
    projectId: executionPacket.projectId,
    taskId: executionPacket.taskId
  });

  assert.equal(validation.allowed, false);
  assert.match(validation.reason, /workspace, project, and task identifiers|reviewId-generated QC job format/i);
  assert.equal(
    validateEvidenceLinkPipelineIds({
      pipelineIds: {
        workspaceId: executionPacket.workspaceId,
        projectId: executionPacket.projectId,
        taskId: executionPacket.taskId,
        analyzerOutcome: "ready_to_build",
        outcomeLaneId: "ready_to_build",
        executionPacketId: executionPacket.executionPacketId,
        promptRoomItemId: promptRoomItem.promptRoomItemId,
        workerRunId: workerRun.workerRunId,
        outputId: output.outputId,
        reviewId: review.reviewId,
        qcJobId: "wrong-review:qc:qc_report_generation:20260501T140500000Z",
        evidenceId: null,
        recordingId: null,
        screenshotIds: [],
        reportId: null,
        customerResultId: null
      }
    }).allowed,
    false
  );
});

test("Evidence Linking customer-safe summary strips internal prompt, worker, and protected detail", async () => {
  const { entry, executionPacket, promptRoomItem, workerRun, output, review, qcJob } =
    await buildEvidenceLinkFixturePipeline();
  const link = createDraftEvidenceLinkFromPipelineRecords({
    outcomeItem: entry.item,
    executionPacket,
    promptRoomItem,
    workerRun,
    output,
    review,
    qcJob,
    evidenceId: "evidence-bundle-2",
    createdAt: "2026-05-01T14:09:00.000Z",
    updatedAt: "2026-05-01T14:09:00.000Z"
  });
  const screenshotPointer = createEvidenceArtifactPointer({
    evidenceLinkId: link.evidenceLinkId,
    artifactId: "screenshot-2",
    pointerType: "screenshot",
    title: "Customer-safe capture",
    createdAt: "2026-05-01T14:10:00.000Z"
  });
  const rawWorkerPointer = createEvidenceArtifactPointer({
    evidenceLinkId: link.evidenceLinkId,
    artifactId: "raw-output-1",
    pointerType: "raw_worker_output",
    title: "Internal worker trace",
    uri: "s3://internal/raw-output-1",
    createdAt: "2026-05-01T14:10:30.000Z"
  });
  const summary = getCustomerSafeEvidenceSummary({
    link: attachArtifactPointersToEvidenceLink({
      link,
      pointers: [screenshotPointer, rawWorkerPointer],
      updatedAt: "2026-05-01T14:10:30.000Z"
    })
  });
  const summaryJson = JSON.stringify(summary);

  assert.equal(summary.status, "evidence_ready");
  assert.equal(summary.evidenceId, "evidence-bundle-2");
  assert.deepEqual(summary.screenshotIds, ["screenshot-2"]);
  assert.deepEqual(summary.customerSafeArtifactPointers, [
    {
      artifactPointerId: screenshotPointer.artifactPointerId,
      artifactId: "screenshot-2",
      pointerType: "screenshot"
    }
  ]);
  assert.doesNotMatch(summaryJson, /internalPromptDraft|promptText|protectedAreas/i);
  assert.doesNotMatch(summaryJson, /raw_worker_output|selectedEngine|futureDigitalOceanWorkerTarget/i);
  assert.doesNotMatch(summaryJson, /secret|model routing|instruction/i);
  assert.doesNotMatch(
    summaryJson,
    /legacy browser extension|Live View|side-panel runtime messaging|chrome\.storage|browser\.runtime|activeTab/i
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

test("Execution packet drafting rejects worker infrastructure queue selection", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-codex-packet-boundary-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-codex-packet-boundary-1",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_codex_packet_boundary_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });

  assert.throws(
    () =>
      createDraftCodexExecutionPacketFromQueueEntry({
        entry,
        futureDispatchTarget: {
          queueName: "neroa-one.code-execution-worker.codex_cli"
        }
      }),
    /cannot select code execution worker infrastructure/i
  );
});

test("Valid execution packets can become internal Prompt Room draft items", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-prompt-room-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-prompt-room-1",
      title: "Prepare prompt room contract",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_prompt_room_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the Prompt Room lane backend-only and internal-only."],
    testCommands: ["node --test tests\\neroa-one-foundation.test.mjs"]
  });
  const validation = validateCodexExecutionPacketForPromptRoom({
    executionPacket: packet
  });
  const promptRoomItem = createDraftPromptRoomItemFromCodexExecutionPacket({
    executionPacket: packet,
    status: "draft_ready",
    createdAt: "2026-05-01T12:18:00.000Z"
  });

  assert.equal(validation.allowed, true);
  assert.equal(
    canCreatePromptRoomItemFromCodexExecutionPacket({
      executionPacket: packet
    }),
    true
  );
  assert.equal(validation.packetLane.laneId, "codex_execution_packet_draft");
  assert.equal(validation.promptLane.laneId, "prompt_room");
  assert.equal(promptRoomItem.executionPacketId, packet.executionPacketId);
  assert.equal(promptRoomItem.workspaceId, "workspace-alpha");
  assert.equal(promptRoomItem.projectId, "project-alpha");
  assert.equal(promptRoomItem.taskId, "task-prompt-room-1");
  assert.equal(promptRoomItem.sourceLaneId, "ready_to_build");
  assert.equal(promptRoomItem.status, "draft_ready");
  assert.equal(promptRoomItem.customerSafeStatus, "preparing_build_task");
  assert.equal(promptRoomItem.internalPromptDraft.status, "placeholder_only");
  assert.equal(promptRoomItem.internalPromptDraft.promptText, "PROMPT_ROOM_DRAFT_DEFERRED");
  assert.ok(promptRoomItem.protectedAreas.includes("build_room_panels"));
  assert.equal(promptRoomItem.futurePromptServiceTarget.deploymentProvider, "digitalocean");
  assert.equal(promptRoomItem.futurePromptServiceTarget.serviceType, "future_prompt_room_service");
  assert.equal(promptRoomItem.futurePromptServiceTarget.readyForDrafting, false);
});

test("Prompt Room rejects worker infrastructure queue selection", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-prompt-room-3",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-prompt-room-3",
      title: "Prepare prompt room contract",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_prompt_room_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const executionPacket = createDraftCodexExecutionPacketFromQueueEntry({
    entry
  });

  assert.throws(
    () =>
      createDraftPromptRoomItemFromCodexExecutionPacket({
        executionPacket,
        futurePromptServiceTarget: {
          queueName: "neroa-one.code-execution-worker.codex_cloud"
        }
      }),
    /cannot select code execution worker infrastructure/i
  );
});

test("Prompt Room customer-safe helper never exposes internal prompt draft text", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-prompt-room-2",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-prompt-room-2",
      title: "Prepare prompt room contract",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest: "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_prompt_room_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry
  });
  const promptRoomItem = createDraftPromptRoomItemFromCodexExecutionPacket({
    executionPacket: packet,
    status: "ready_for_code_builder",
    createdAt: "2026-05-01T12:19:00.000Z"
  });
  const customerSafeStatus = getPromptRoomCustomerSafeStatus({
    item: promptRoomItem
  });

  assert.equal(promptRoomItem.internalPromptDraft.promptText, "PROMPT_ROOM_DRAFT_DEFERRED");
  assert.equal(customerSafeStatus.promptRoomItemId, promptRoomItem.promptRoomItemId);
  assert.equal(customerSafeStatus.executionPacketId, packet.executionPacketId);
  assert.equal(customerSafeStatus.customerSafeStatus, "build_queued");
  assert.deepEqual(Object.keys(customerSafeStatus).sort(), [
    "customerSafeStatus",
    "executionPacketId",
    "promptRoomItemId"
  ]);
  assert.equal("internalPromptDraft" in customerSafeStatus, false);
  assert.equal("protectedAreas" in customerSafeStatus, false);
  assert.equal("selectedEngine" in customerSafeStatus, false);
  assert.equal("futureDigitalOceanWorkerTarget" in customerSafeStatus, false);
  assert.doesNotMatch(JSON.stringify(customerSafeStatus), /PROMPT_ROOM_DRAFT_DEFERRED/i);
  assert.doesNotMatch(JSON.stringify(customerSafeStatus), /placeholder_only/i);
  assert.doesNotMatch(JSON.stringify(customerSafeStatus), /build_room_panels|codex_cli|manual_operator/i);
});

test("Ready_for_code_builder Prompt Room items can become queued DigitalOcean worker lane runs", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-worker-lane-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-worker-lane-1",
      title: "Prepare execution worker contract",
      request: "Prepare the approved execution worker contract for backend execution.",
      normalizedRequest: "prepare the approved execution worker contract for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_worker_lane_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const executionPacket = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the worker lane backend-only and replaceable."],
    testCommands: ["node --test tests\\neroa-one-foundation.test.mjs"]
  });
  const promptRoomItem = createDraftPromptRoomItemFromCodexExecutionPacket({
    executionPacket,
    status: "ready_for_code_builder",
    createdAt: "2026-05-01T12:19:00.000Z"
  });
  const validation = validateCodexExecutionPacketForCodeExecutionWorkerRun({
    promptRoomItem
  });
  const workerRun = createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket({
    promptRoomItem,
    selectedEngine: "claude_code",
    executionMode: "implementation_guidance",
    createdAt: "2026-05-01T12:20:00.000Z"
  });

  assert.equal(validation.allowed, true);
  assert.equal(
    canCreateCodeExecutionWorkerRunFromCodexExecutionPacket({
      promptRoomItem
    }),
    true
  );
  assert.equal(validation.promptLane.laneId, "prompt_room");
  assert.equal(validation.workerLane.laneId, "code_execution_worker");
  assert.equal(workerRun.workerRunId.includes(":worker:claude_code:"), true);
  assert.equal(workerRun.executionPacketId, executionPacket.executionPacketId);
  assert.equal(workerRun.workspaceId, "workspace-alpha");
  assert.equal(workerRun.projectId, "project-alpha");
  assert.equal(workerRun.taskId, "task-worker-lane-1");
  assert.equal(workerRun.selectedEngine, "claude_code");
  assert.equal(workerRun.executionMode, "implementation_guidance");
  assert.equal(workerRun.status, "queued");
  assert.deepEqual(workerRun.acceptanceCriteria, [
    "Keep the worker lane backend-only and replaceable."
  ]);
  assert.deepEqual(workerRun.testCommands, [
    "node --test tests\\neroa-one-foundation.test.mjs"
  ]);
  assert.equal(workerRun.promptPayload.status, "placeholder_only");
  assert.equal(workerRun.promptPayload.promptText, "PROMPT_ROOM_DRAFT_DEFERRED");
  assert.ok(workerRun.protectedAreas.includes("build_room_panels"));
  assert.equal(workerRun.futureDigitalOceanWorkerTarget.deploymentProvider, "digitalocean");
  assert.equal(
    workerRun.futureDigitalOceanWorkerTarget.workerType,
    "future_code_execution_worker"
  );
  assert.equal(workerRun.futureDigitalOceanWorkerTarget.readyForExecution, false);
  assert.equal(
    workerRun.futureDigitalOceanWorkerTarget.queueName,
    "neroa-one.code-execution-worker.claude_code"
  );
});

test("Worker lane remains explicit and engine-agnostic across all supported engines", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-worker-lane-2",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-worker-lane-2",
      title: "Prepare execution worker contract",
      request: "Prepare the approved execution worker contract for backend execution.",
      normalizedRequest: "prepare the approved execution worker contract for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_worker_lane_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const executionPacket = createDraftCodexExecutionPacketFromQueueEntry({
    entry
  });
  const promptRoomItem = createDraftPromptRoomItemFromCodexExecutionPacket({
    executionPacket,
    status: "ready_for_code_builder",
    createdAt: "2026-05-01T12:24:00.000Z"
  });

  for (const selectedEngine of getCodeExecutionWorkerEngines()) {
    const workerRun = createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket({
      promptRoomItem,
      selectedEngine,
      createdAt: "2026-05-01T12:25:00.000Z"
    });

    assert.equal(workerRun.selectedEngine, selectedEngine);
    assert.equal(workerRun.status, "queued");
    assert.match(workerRun.workerRunId, new RegExp(`:worker:${selectedEngine}:`, "i"));
    assert.equal(
      workerRun.futureDigitalOceanWorkerTarget.queueName,
      `neroa-one.code-execution-worker.${selectedEngine}`
    );
  }
});

test("Non-ready Prompt Room statuses are rejected from worker-run creation", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-worker-lane-3",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-worker-lane-3",
      title: "Prepare execution worker contract",
      request: "Prepare the approved execution worker contract for backend execution.",
      normalizedRequest: "prepare the approved execution worker contract for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_worker_lane_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const executionPacket = createDraftCodexExecutionPacketFromQueueEntry({
    entry
  });

  for (const status of ["draft_pending", "draft_ready", "validation_failed", "canceled"]) {
    const promptRoomItem = createDraftPromptRoomItemFromCodexExecutionPacket({
      executionPacket,
      status,
      createdAt: "2026-05-01T12:26:00.000Z"
    });
    const validation = validateCodexExecutionPacketForCodeExecutionWorkerRun({
      promptRoomItem
    });

    assert.equal(validation.allowed, false);
    assert.match(validation.reason, /ready_for_code_builder/i);
    assert.equal(
      canCreateCodeExecutionWorkerRunFromCodexExecutionPacket({
        promptRoomItem
      }),
      false
    );
    assert.throws(
      () =>
        createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket({
          promptRoomItem
        }),
      /ready_for_code_builder/i
    );
  }
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
  assert.equal("repairPriority" in review, false);
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
  assert.equal("repairPriority" in reviews[0], false);
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

test("Customer Follow-Up accepts only customer-resolution outcome lanes and output review follow-up decisions", async () => {
  const needsCustomerAnswerItem = {
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    taskId: "task-follow-up-1",
    analyzerOutcome: "needs_customer_answer",
    normalizedRequest: "confirm whether the staged release should include analytics",
    riskLevel: "moderate",
    readinessBlockers: ["Should the staged release include analytics support?"],
    customerFacingSummary: "A customer clarification is needed before this request can proceed.",
    internalSummary:
      "Analyzer needs a customer clarification before deterministic routing can continue.",
    createdAt: "2026-05-01T15:30:00.000Z",
    source: {
      requestSource: "command_center",
      analyzerSource: "mock_fallback",
      caller: "neroa_one_customer_follow_up_test"
    }
  };
  const missingInformationItem = {
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    taskId: "task-follow-up-2",
    analyzerOutcome: "blocked_missing_information",
    normalizedRequest: "provide the launch asset bundle details",
    riskLevel: "moderate",
    readinessBlockers: ["Please provide the missing launch asset details."],
    customerFacingSummary: "More information is needed before this request can proceed.",
    internalSummary:
      "Analyzer blocked the request because the launch asset details are missing.",
    createdAt: "2026-05-01T15:31:00.000Z",
    source: {
      requestSource: "system",
      analyzerSource: "mock_fallback",
      caller: "neroa_one_customer_follow_up_test"
    }
  };
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-customer-follow-up-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-customer-follow-up-1",
      title: "Prepare follow-up boundary",
      request: "Prepare the customer follow-up contract for output review decisions.",
      normalizedRequest: "prepare the customer follow-up contract for output review decisions."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_customer_follow_up_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep customer follow-up backend-only and extraction-ready."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-customer-follow-up-1",
    createdAt: "2026-05-01T15:32:00.000Z"
  });
  const review = createPlaceholderOutputReviewDecisionFromOutputItem({
    output,
    decision: "customer_followup",
    createdAt: "2026-05-01T15:33:00.000Z"
  });
  const needsAnswerValidation = validateOutcomeLaneItemForCustomerFollowUp({
    item: needsCustomerAnswerItem
  });
  const missingInfoValidation = validateOutcomeLaneItemForCustomerFollowUp({
    item: missingInformationItem
  });
  const reviewDecisionValidation = validateOutputReviewDecisionForCustomerFollowUp({
    decision: "customer_followup"
  });
  const reviewValidation = validateOutputReviewForCustomerFollowUp({
    review
  });
  const needsAnswerFollowUp = createCustomerFollowUpItemFromOutcomeLaneItem({
    item: needsCustomerAnswerItem,
    createdAt: "2026-05-01T15:34:00.000Z",
    updatedAt: "2026-05-01T15:35:00.000Z"
  });
  const missingInfoFollowUp = createCustomerFollowUpItemFromOutcomeLaneItem({
    item: missingInformationItem,
    status: "waiting_for_customer",
    createdAt: "2026-05-01T15:36:00.000Z"
  });
  const reviewFollowUp = createCustomerFollowUpItemFromOutputReview({
    review,
    status: "ready_for_customer",
    createdAt: "2026-05-01T15:37:00.000Z"
  });
  const outcomeSet = createCustomerFollowUpItemsFromOutcomeLaneItems({
    items: [needsCustomerAnswerItem, missingInformationItem],
    status: "draft",
    createdAt: "2026-05-01T15:38:00.000Z"
  });
  const reviewSet = createCustomerFollowUpItemsFromOutputReviews({
    reviews: [review],
    status: "waiting_for_customer",
    createdAt: "2026-05-01T15:39:00.000Z"
  });

  assert.equal(needsAnswerValidation.allowed, true);
  assert.equal(missingInfoValidation.allowed, true);
  assert.equal(reviewDecisionValidation.allowed, true);
  assert.equal(reviewValidation.allowed, true);
  assert.equal(
    canCreateCustomerFollowUpItemFromOutcomeLaneItem({ item: needsCustomerAnswerItem }),
    true
  );
  assert.equal(
    canCreateCustomerFollowUpItemFromOutcomeLaneItem({ item: missingInformationItem }),
    true
  );
  assert.equal(canCreateCustomerFollowUpItemFromOutputReview({ review }), true);
  assert.equal(needsAnswerFollowUp.sourceLaneId, "needs_customer_answer");
  assert.equal(needsAnswerFollowUp.sourceType, "needs_customer_answer");
  assert.equal(needsAnswerFollowUp.followUpType, "clarification_question");
  assert.equal(needsAnswerFollowUp.allowedResponseType, "free_text");
  assert.equal(needsAnswerFollowUp.status, "ready_for_customer");
  assert.equal(missingInfoFollowUp.sourceLaneId, "blocked_missing_information");
  assert.equal(missingInfoFollowUp.sourceType, "blocked_missing_information");
  assert.equal(missingInfoFollowUp.followUpType, "missing_information");
  assert.equal(missingInfoFollowUp.status, "waiting_for_customer");
  assert.equal(reviewFollowUp.sourceLaneId, "output_review");
  assert.equal(reviewFollowUp.sourceType, "customer_followup");
  assert.equal(reviewFollowUp.sourceId, review.reviewId);
  assert.equal(reviewFollowUp.followUpType, "output_review_followup");
  assert.equal(
    reviewFollowUp.futureCustomerFollowUpServiceTarget.deploymentProvider,
    "digitalocean"
  );
  assert.equal(reviewFollowUp.futureCustomerFollowUpServiceTarget.readyForDispatch, false);
  assert.equal(outcomeSet.length, 2);
  assert.deepEqual(
    outcomeSet.map((item) => item.sourceType),
    ["needs_customer_answer", "blocked_missing_information"]
  );
  assert.equal(reviewSet.length, 1);
  assert.equal(reviewSet[0].sourceType, "customer_followup");
});

test("Customer Follow-Up rejects non-follow-up outcome lanes and non-follow-up output review decisions", async () => {
  const rejectedOutcomeItems = [
    {
      workspaceId: "workspace-alpha",
      projectId: "project-alpha",
      taskId: "task-follow-up-reject-ready",
      analyzerOutcome: "ready_to_build",
      normalizedRequest: "prepare the approved implementation packet",
      riskLevel: "low",
      readinessBlockers: [],
      customerFacingSummary: "This request is approved for backend preparation.",
      internalSummary: "Execution packaging may begin.",
      createdAt: "2026-05-01T15:40:00.000Z",
      source: {
        requestSource: "command_center",
        analyzerSource: "mock_fallback",
        caller: "neroa_one_customer_follow_up_test"
      }
    },
    {
      workspaceId: "workspace-alpha",
      projectId: "project-alpha",
      taskId: "task-follow-up-reject-roadmap",
      analyzerOutcome: "roadmap_revision_required",
      normalizedRequest: "re-sequence the roadmap before build",
      riskLevel: "high",
      readinessBlockers: [],
      customerFacingSummary: "Planning review is required before this request can proceed.",
      internalSummary: "Roadmap review is required before execution can continue.",
      createdAt: "2026-05-01T15:41:00.000Z",
      source: {
        requestSource: "build_room",
        analyzerSource: "mock_fallback",
        caller: "neroa_one_customer_follow_up_test"
      }
    },
    {
      workspaceId: "workspace-alpha",
      projectId: "project-alpha",
      taskId: "task-follow-up-reject-scope",
      analyzerOutcome: "rejected_outside_scope",
      normalizedRequest: "add an out-of-scope platform",
      riskLevel: "low",
      readinessBlockers: [],
      customerFacingSummary: "This request is outside the approved scope.",
      internalSummary: "Scope guard rejected the request.",
      createdAt: "2026-05-01T15:42:00.000Z",
      source: {
        requestSource: "command_center",
        analyzerSource: "mock_fallback",
        caller: "neroa_one_customer_follow_up_test"
      }
    }
  ];
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-customer-follow-up-2",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-customer-follow-up-2",
      title: "Prepare follow-up rejection boundary",
      request: "Prepare the customer follow-up rejection contract for output review decisions.",
      normalizedRequest:
        "prepare the customer follow-up rejection contract for output review decisions."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_customer_follow_up_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep customer follow-up boundary isolated."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-customer-follow-up-2",
    createdAt: "2026-05-01T15:43:00.000Z"
  });

  for (const item of rejectedOutcomeItems) {
    const validation = validateOutcomeLaneItemForCustomerFollowUp({
      item
    });

    assert.equal(validation.allowed, false);
    assert.equal(canCreateCustomerFollowUpItemFromOutcomeLaneItem({ item }), false);
    assert.match(validation.reason, /allowed source types/i);
    assert.throws(
      () =>
        createCustomerFollowUpItemFromOutcomeLaneItem({
          item
        }),
      /cannot create a customer follow-up item/i
    );
  }

  for (const decision of NEROA_ONE_OUTPUT_REVIEW_DECISIONS.filter(
    (value) => value !== "customer_followup"
  )) {
    const decisionValidation = validateOutputReviewDecisionForCustomerFollowUp({
      decision
    });
    const review = createPlaceholderOutputReviewDecisionFromOutputItem({
      output,
      decision,
      createdAt: "2026-05-01T15:44:00.000Z"
    });
    const reviewValidation = validateOutputReviewForCustomerFollowUp({
      review
    });

    assert.equal(decisionValidation.allowed, false);
    assert.equal(reviewValidation.allowed, false);
    assert.equal(canCreateCustomerFollowUpItemFromOutputReview({ review }), false);
    assert.match(decisionValidation.reason, /allowed source types/i);
    assert.match(reviewValidation.reason, new RegExp(`decision ${decision}`, "i"));
    assert.throws(
      () =>
        createCustomerFollowUpItemFromOutputReview({
          review
        }),
      /cannot create a customer follow-up item/i
    );
  }
});

test("Customer Follow-Up customer-safe projection strips internal execution details", () => {
  const unsafeText = createCustomerSafeFollowUpText(
    "Review internalPromptDraft promptText and raw worker instructions in lib/neroa-one/customer-follow-up.ts; check browser.runtime, audit-only notes, selectedEngine codex_cli, futureCustomerFollowUpServiceTarget, futureAuditServiceTarget, and C:\\secret\\notes.md."
  );
  const item = createCustomerFollowUpItemFromOutcomeLaneItem({
    item: {
      workspaceId: "workspace-alpha",
      projectId: "project-alpha",
      taskId: "task-follow-up-safe-1",
      analyzerOutcome: "needs_customer_answer",
      normalizedRequest: "confirm the release plan",
      riskLevel: "moderate",
      readinessBlockers: ["Please confirm the release plan."],
      customerFacingSummary: "A customer answer is needed before work can continue.",
      internalSummary:
        "internalPromptDraft promptText selectedEngine codex_cli browser.runtime C:\\secret\\build.ts raw worker instructions",
      createdAt: "2026-05-01T15:45:00.000Z",
      source: {
        requestSource: "command_center",
        analyzerSource: "mock_fallback",
        caller: "neroa_one_customer_follow_up_test"
      }
    },
    customerQuestion:
      "Use internalPromptDraft promptText and raw worker instructions in lib/neroa-one/customer-follow-up.ts before the customer answers. futureCustomerFollowUpServiceTarget.",
    customerSafeContext:
      "Review selectedEngine codex_cli, audit-only notes, browser.runtime, futureAuditServiceTarget, and C:\\secret\\build.ts before answering.",
    createdAt: "2026-05-01T15:46:00.000Z"
  });
  const customerView = getCustomerSafeCustomerFollowUpItemView({
    item
  });

  assert.doesNotMatch(
    unsafeText,
    /internalPromptDraft|promptText|raw worker instructions|selectedEngine|browser\.runtime|audit-only|codex_cli|futureCustomerFollowUpServiceTarget|futureAuditServiceTarget|customer-follow-up\.ts|C:\\secret/i
  );
  assert.match(unsafeText, /customer follow-up details are available|internal detail|review/i);
  assert.doesNotMatch(
    item.customerQuestion,
    /internalPromptDraft|promptText|raw worker instructions|futureCustomerFollowUpServiceTarget|customer-follow-up\.ts/i
  );
  assert.doesNotMatch(
    item.customerSafeContext,
    /selectedEngine|browser\.runtime|audit-only|codex_cli|futureAuditServiceTarget|C:\\secret/i
  );
  assert.equal(customerView.followUpItemId, item.followUpItemId);
  assert.equal(customerView.sourceId, item.sourceId);
  assert.equal(customerView.allowedResponseType, item.allowedResponseType);
  assert.equal(customerView.customerQuestion, item.customerQuestion);
  assert.equal(customerView.customerSafeContext, item.customerSafeContext);
  assert.equal("internalReason" in customerView, false);
  assert.equal("futureCustomerFollowUpServiceTarget" in customerView, false);
});

test("Customer Follow-Up remains follow-up-only and does not own analyzer, review, execution, repair, evidence, audit, strategy, or UI behavior", async () => {
  const needsCustomerAnswerItem = {
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    taskId: "task-follow-up-boundary-1",
    analyzerOutcome: "needs_customer_answer",
    normalizedRequest: "confirm the supported launch regions",
    riskLevel: "moderate",
    readinessBlockers: ["Please confirm the supported launch regions."],
    customerFacingSummary: "A customer answer is needed before work can continue.",
    internalSummary: "Analyzer is waiting for customer clarification on launch regions.",
    createdAt: "2026-05-01T15:47:00.000Z",
    source: {
      requestSource: "command_center",
      analyzerSource: "mock_fallback",
      caller: "neroa_one_customer_follow_up_test"
    }
  };
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-customer-follow-up-3",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-customer-follow-up-3",
      title: "Prepare follow-up-only boundary",
      request: "Prepare the follow-up-only customer boundary for output review decisions.",
      normalizedRequest:
        "prepare the follow-up-only customer boundary for output review decisions."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_customer_follow_up_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the customer follow-up lane follow-up-only."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-customer-follow-up-3",
    createdAt: "2026-05-01T15:48:00.000Z"
  });
  const review = createPlaceholderOutputReviewDecisionFromOutputItem({
    output,
    decision: "customer_followup",
    createdAt: "2026-05-01T15:49:00.000Z"
  });
  const outcomeFollowUp = createCustomerFollowUpItemFromOutcomeLaneItem({
    item: needsCustomerAnswerItem,
    status: "ready_for_customer",
    allowedResponseType: "yes_no",
    createdAt: "2026-05-01T15:50:00.000Z"
  });
  const reviewFollowUp = createCustomerFollowUpItemFromOutputReview({
    review,
    status: "waiting_for_customer",
    allowedResponseType: "approve_reject",
    createdAt: "2026-05-01T15:51:00.000Z"
  });

  assert.equal(needsCustomerAnswerItem.analyzerOutcome, "needs_customer_answer");
  assert.equal("status" in needsCustomerAnswerItem, false);
  assert.equal("allowedResponseType" in needsCustomerAnswerItem, false);
  assert.equal("futureCustomerFollowUpServiceTarget" in needsCustomerAnswerItem, false);
  assert.equal(review.decision, "customer_followup");
  assert.equal("status" in review, false);
  assert.equal("allowedResponseType" in review, false);
  assert.equal("futureCustomerFollowUpServiceTarget" in review, false);
  assert.equal(outcomeFollowUp.sourceType, "needs_customer_answer");
  assert.equal(outcomeFollowUp.status, "ready_for_customer");
  assert.equal(outcomeFollowUp.allowedResponseType, "yes_no");
  assert.equal(reviewFollowUp.sourceType, "customer_followup");
  assert.equal(reviewFollowUp.status, "waiting_for_customer");
  assert.equal(reviewFollowUp.allowedResponseType, "approve_reject");
  assert.equal("decision" in outcomeFollowUp, false);
  assert.equal("analyzerOutcome" in outcomeFollowUp, false);
  assert.equal("executionPacketId" in outcomeFollowUp, false);
  assert.equal("repairItemId" in outcomeFollowUp, false);
  assert.equal("evidenceId" in outcomeFollowUp, false);
  assert.equal("auditEventId" in outcomeFollowUp, false);
});

test("Strategy Escalation accepts only roadmap_revision_required outcome lanes and output review strategy escalations", async () => {
  const roadmapRevisionItem = {
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    taskId: "task-strategy-escalation-1",
    analyzerOutcome: "roadmap_revision_required",
    normalizedRequest: "re-sequence the launch roadmap for a phased rollout",
    riskLevel: "high",
    readinessBlockers: ["Roadmap sequencing review is required before work can continue."],
    customerFacingSummary:
      "This request affects roadmap or sequencing decisions and needs planning review first.",
    internalSummary:
      "Analyzer requires roadmap review before execution eligibility can be reconsidered.",
    createdAt: "2026-05-01T16:00:00.000Z",
    source: {
      requestSource: "build_room",
      analyzerSource: "mock_fallback",
      caller: "neroa_one_strategy_escalation_test"
    }
  };
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-strategy-escalation-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-strategy-escalation-1",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest:
        "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_strategy_escalation_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep strategy escalation backend-only and extraction-ready."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-strategy-escalation-1",
    createdAt: "2026-05-01T16:01:00.000Z"
  });
  const review = createPlaceholderOutputReviewDecisionFromOutputItem({
    output,
    decision: "strategy_escalation",
    createdAt: "2026-05-01T16:02:00.000Z"
  });
  const roadmapValidation = validateOutcomeLaneItemForStrategyEscalation({
    item: roadmapRevisionItem
  });
  const reviewDecisionValidation = validateOutputReviewDecisionForStrategyEscalation({
    decision: "strategy_escalation"
  });
  const reviewValidation = validateOutputReviewForStrategyEscalation({
    review
  });
  const roadmapEscalation = createStrategyEscalationItemFromOutcomeLaneItem({
    item: roadmapRevisionItem,
    createdAt: "2026-05-01T16:03:00.000Z",
    updatedAt: "2026-05-01T16:04:00.000Z"
  });
  const reviewEscalation = createStrategyEscalationItemFromOutputReview({
    review,
    status: "waiting_for_customer_decision",
    impactLevel: "high",
    createdAt: "2026-05-01T16:05:00.000Z"
  });
  const roadmapSet = createStrategyEscalationItemsFromOutcomeLaneItems({
    items: [roadmapRevisionItem],
    status: "draft",
    createdAt: "2026-05-01T16:06:00.000Z"
  });
  const reviewSet = createStrategyEscalationItemsFromOutputReviews({
    reviews: [review],
    status: "ready_for_strategy_review",
    createdAt: "2026-05-01T16:07:00.000Z"
  });

  assert.equal(roadmapValidation.allowed, true);
  assert.equal(reviewDecisionValidation.allowed, true);
  assert.equal(reviewValidation.allowed, true);
  assert.equal(
    canCreateStrategyEscalationItemFromOutcomeLaneItem({ item: roadmapRevisionItem }),
    true
  );
  assert.equal(canCreateStrategyEscalationItemFromOutputReview({ review }), true);
  assert.equal(roadmapEscalation.sourceLaneId, "roadmap_revision_required");
  assert.equal(roadmapEscalation.sourceType, "roadmap_revision_required");
  assert.equal(roadmapEscalation.escalationType, "roadmap_change");
  assert.equal(roadmapEscalation.impactLevel, "high");
  assert.equal(roadmapEscalation.status, "ready_for_strategy_review");
  assert.equal(reviewEscalation.sourceLaneId, "output_review");
  assert.equal(reviewEscalation.sourceType, "strategy_escalation");
  assert.equal(reviewEscalation.sourceId, review.reviewId);
  assert.equal(reviewEscalation.escalationType, "risk_escalation");
  assert.equal(reviewEscalation.impactLevel, "high");
  assert.equal(reviewEscalation.status, "waiting_for_customer_decision");
  assert.equal(
    reviewEscalation.futureStrategyEscalationServiceTarget.deploymentProvider,
    "digitalocean"
  );
  assert.equal(
    reviewEscalation.futureStrategyEscalationServiceTarget.readyForDispatch,
    false
  );
  assert.equal(roadmapSet.length, 1);
  assert.equal(roadmapSet[0].sourceType, "roadmap_revision_required");
  assert.equal(reviewSet.length, 1);
  assert.equal(reviewSet[0].sourceType, "strategy_escalation");
});

test("Strategy Escalation rejects non-strategy outcome lanes and non-strategy output review decisions", async () => {
  const rejectedOutcomeItems = [
    {
      workspaceId: "workspace-alpha",
      projectId: "project-alpha",
      taskId: "task-strategy-reject-ready",
      analyzerOutcome: "ready_to_build",
      normalizedRequest: "prepare the approved implementation packet",
      riskLevel: "low",
      readinessBlockers: [],
      customerFacingSummary: "This request is approved for backend preparation.",
      internalSummary: "Execution packaging may begin.",
      createdAt: "2026-05-01T16:08:00.000Z",
      source: {
        requestSource: "command_center",
        analyzerSource: "mock_fallback",
        caller: "neroa_one_strategy_escalation_test"
      }
    },
    {
      workspaceId: "workspace-alpha",
      projectId: "project-alpha",
      taskId: "task-strategy-reject-customer",
      analyzerOutcome: "needs_customer_answer",
      normalizedRequest: "confirm the launch checklist",
      riskLevel: "moderate",
      readinessBlockers: ["Please confirm the launch checklist."],
      customerFacingSummary: "A customer answer is needed before work can continue.",
      internalSummary: "Waiting for customer clarification.",
      createdAt: "2026-05-01T16:09:00.000Z",
      source: {
        requestSource: "command_center",
        analyzerSource: "mock_fallback",
        caller: "neroa_one_strategy_escalation_test"
      }
    },
    {
      workspaceId: "workspace-alpha",
      projectId: "project-alpha",
      taskId: "task-strategy-reject-missing",
      analyzerOutcome: "blocked_missing_information",
      normalizedRequest: "provide the asset bundle details",
      riskLevel: "moderate",
      readinessBlockers: ["Please provide the missing asset bundle details."],
      customerFacingSummary: "More information is needed before work can continue.",
      internalSummary: "Missing information blocks routing.",
      createdAt: "2026-05-01T16:10:00.000Z",
      source: {
        requestSource: "system",
        analyzerSource: "mock_fallback",
        caller: "neroa_one_strategy_escalation_test"
      }
    },
    {
      workspaceId: "workspace-alpha",
      projectId: "project-alpha",
      taskId: "task-strategy-reject-scope",
      analyzerOutcome: "rejected_outside_scope",
      normalizedRequest: "add an out-of-scope delivery platform",
      riskLevel: "low",
      readinessBlockers: [],
      customerFacingSummary: "This request is outside the approved scope.",
      internalSummary: "Scope guard rejected the request.",
      createdAt: "2026-05-01T16:11:00.000Z",
      source: {
        requestSource: "command_center",
        analyzerSource: "mock_fallback",
        caller: "neroa_one_strategy_escalation_test"
      }
    }
  ];
  const rejectedOutcomeLaneIds = rejectedOutcomeItems.map((item) => item.analyzerOutcome);
  const expectedRejectedOutcomeLaneIds = Object.keys(neroaOneOutcomeLanes).filter(
    (laneId) => laneId !== "roadmap_revision_required"
  );
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-strategy-escalation-2",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-strategy-escalation-2",
      title: "Prepare strategy rejection boundary",
      request: "Prepare the strategy escalation rejection contract for review decisions.",
      normalizedRequest:
        "prepare the strategy escalation rejection contract for review decisions."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_strategy_escalation_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep strategy escalation boundary isolated."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-strategy-escalation-2",
    createdAt: "2026-05-01T16:12:00.000Z"
  });
  const rejectedReviewDecisions = NEROA_ONE_OUTPUT_REVIEW_DECISIONS.filter(
    (value) => value !== "strategy_escalation"
  );

  assert.deepEqual(rejectedOutcomeLaneIds, expectedRejectedOutcomeLaneIds);
  assert.deepEqual(
    rejectedReviewDecisions,
    NEROA_ONE_OUTPUT_REVIEW_DECISIONS.filter(
      (value) =>
        !NEROA_ONE_STRATEGY_ESCALATION_ACCEPTED_OUTPUT_REVIEW_DECISIONS.includes(value)
    )
  );

  for (const item of rejectedOutcomeItems) {
    const validation = validateOutcomeLaneItemForStrategyEscalation({
      item
    });

    assert.equal(validation.allowed, false);
    assert.equal(canCreateStrategyEscalationItemFromOutcomeLaneItem({ item }), false);
    assert.match(validation.reason, /allowed outcome lanes/i);
    assert.throws(
      () =>
        createStrategyEscalationItemFromOutcomeLaneItem({
          item
        }),
      /cannot create a strategy escalation item/i
    );
  }

  for (const decision of rejectedReviewDecisions) {
    const decisionValidation = validateOutputReviewDecisionForStrategyEscalation({
      decision
    });
    const review = createPlaceholderOutputReviewDecisionFromOutputItem({
      output,
      decision,
      createdAt: "2026-05-01T16:13:00.000Z"
    });
    const reviewValidation = validateOutputReviewForStrategyEscalation({
      review
    });

    assert.equal(decisionValidation.allowed, false);
    assert.equal(reviewValidation.allowed, false);
    assert.equal(canCreateStrategyEscalationItemFromOutputReview({ review }), false);
    assert.match(decisionValidation.reason, /allowed output review decisions/i);
    assert.match(reviewValidation.reason, new RegExp(`decision ${decision}`, "i"));
    assert.throws(
      () =>
        createStrategyEscalationItemFromOutputReview({
          review
        }),
      /cannot create a strategy escalation item/i
    );
  }
});

test("Strategy Escalation schema rejects mismatched source lane and source type pairs", () => {
  assert.throws(
    () =>
      neroaOneStrategyEscalationItemSchema.parse({
        strategyEscalationItemId:
          "roadmap_revision_required:task-boundary:strategy-escalation:20260501T162100000Z",
        workspaceId: "workspace-alpha",
        projectId: "project-alpha",
        taskId: "task-strategy-schema-boundary-1",
        sourceLaneId: "roadmap_revision_required",
        sourceType: "strategy_escalation",
        sourceId: "roadmap_revision_required:task-strategy-schema-boundary-1:20260501T162100000Z",
        status: "ready_for_strategy_review",
        escalationType: "roadmap_change",
        impactLevel: "high",
        strategyQuestion: "Please review the proposed strategy escalation.",
        customerSafeContext: "This request requires strategy review before backend work can continue.",
        proposedRoadmapImpactSummary:
          "Roadmap review is required before execution eligibility can be reconsidered.",
        internalReason: "Strategy escalation required for analyzer outcome roadmap_revision_required.",
        createdAt: "2026-05-01T16:21:00.000Z",
        updatedAt: "2026-05-01T16:21:00.000Z",
        futureStrategyEscalationServiceTarget: {
          deploymentProvider: "digitalocean",
          serviceName: "neroa-one-strategy-escalation-service",
          queueName: "neroa-one.strategy-escalation",
          serviceType: "future_strategy_escalation_service",
          readyForDispatch: false,
          notes: [
            "Future DigitalOcean strategy escalation services may persist, retrieve, and dispatch escalation items here."
          ]
        }
      }),
    /sourceType/i
  );
});

test("Strategy Escalation customer-safe projection strips internal execution details", () => {
  const unsafeText = createCustomerSafeStrategyEscalationText(
    "Review internalPromptDraft promptText and raw worker instructions in lib/neroa-one/strategy-escalation.ts; check browser.runtime, audit-only notes, selectedEngine codex_cli, futureStrategyEscalationServiceTarget, futureAuditServiceTarget, and C:\\secret\\notes.md."
  );
  const item = createStrategyEscalationItemFromOutcomeLaneItem({
    item: {
      workspaceId: "workspace-alpha",
      projectId: "project-alpha",
      taskId: "task-strategy-safe-1",
      analyzerOutcome: "roadmap_revision_required",
      normalizedRequest: "re-sequence the launch roadmap",
      riskLevel: "high",
      readinessBlockers: ["Roadmap review is required before work can continue."],
      customerFacingSummary: "Roadmap review is required before work can continue.",
      internalSummary:
        "internalPromptDraft promptText selectedEngine codex_cli browser.runtime C:\\secret\\build.ts raw worker instructions futureStrategyEscalationServiceTarget",
      createdAt: "2026-05-01T16:14:00.000Z",
      source: {
        requestSource: "build_room",
        analyzerSource: "mock_fallback",
        caller: "neroa_one_strategy_escalation_test"
      }
    },
    strategyQuestion:
      "Use internalPromptDraft promptText and raw worker instructions in lib/neroa-one/strategy-escalation.ts before planning review. futureStrategyEscalationServiceTarget.",
    customerSafeContext:
      "Review selectedEngine codex_cli, audit-only notes, browser.runtime, futureAuditServiceTarget, and C:\\secret\\build.ts before planning review.",
    proposedRoadmapImpactSummary:
      "Review futureStrategyEscalationServiceTarget and internalPromptDraft promptText in C:\\secret\\roadmap.md before roadmap review.",
    createdAt: "2026-05-01T16:15:00.000Z"
  });
  const customerView = getCustomerSafeStrategyEscalationItemView({
    item
  });

  assert.doesNotMatch(
    unsafeText,
    /internalPromptDraft|promptText|raw worker instructions|selectedEngine|browser\.runtime|audit-only|codex_cli|futureStrategyEscalationServiceTarget|futureAuditServiceTarget|strategy-escalation\.ts|C:\\secret/i
  );
  assert.match(
    unsafeText,
    /strategy escalation details are available|internal detail|review/i
  );
  assert.doesNotMatch(
    item.strategyQuestion,
    /internalPromptDraft|promptText|raw worker instructions|futureStrategyEscalationServiceTarget|strategy-escalation\.ts/i
  );
  assert.doesNotMatch(
    item.customerSafeContext,
    /selectedEngine|browser\.runtime|audit-only|codex_cli|futureAuditServiceTarget|C:\\secret/i
  );
  assert.doesNotMatch(
    item.proposedRoadmapImpactSummary,
    /futureStrategyEscalationServiceTarget|internalPromptDraft|promptText|C:\\secret/i
  );
  assert.equal(customerView.strategyEscalationItemId, item.strategyEscalationItemId);
  assert.equal(customerView.sourceId, item.sourceId);
  assert.equal(customerView.impactLevel, item.impactLevel);
  assert.equal(customerView.strategyQuestion, item.strategyQuestion);
  assert.equal(customerView.customerSafeContext, item.customerSafeContext);
  assert.equal(
    customerView.proposedRoadmapImpactSummary,
    item.proposedRoadmapImpactSummary
  );
  assert.equal("internalReason" in customerView, false);
  assert.equal("futureStrategyEscalationServiceTarget" in customerView, false);
});

test("Strategy Escalation remains escalation-only and does not own analyzer, review, execution, repair, evidence, audit, follow-up, strategy runtime, or UI behavior", async () => {
  const roadmapRevisionItem = {
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    taskId: "task-strategy-boundary-1",
    analyzerOutcome: "roadmap_revision_required",
    normalizedRequest: "re-sequence the release roadmap",
    riskLevel: "high",
    readinessBlockers: ["Roadmap review is required before work can continue."],
    customerFacingSummary: "Roadmap review is required before work can continue.",
    internalSummary: "Analyzer is waiting for roadmap review.",
    createdAt: "2026-05-01T16:16:00.000Z",
    source: {
      requestSource: "build_room",
      analyzerSource: "mock_fallback",
      caller: "neroa_one_strategy_escalation_test"
    }
  };
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-strategy-escalation-3",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-strategy-escalation-3",
      title: "Prepare implementation packet",
      request: "Prepare the approved implementation packet for backend execution.",
      normalizedRequest:
        "prepare the approved implementation packet for backend execution."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_strategy_escalation_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the strategy escalation lane escalation-only."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-strategy-escalation-3",
    createdAt: "2026-05-01T16:17:00.000Z"
  });
  const review = createPlaceholderOutputReviewDecisionFromOutputItem({
    output,
    decision: "strategy_escalation",
    createdAt: "2026-05-01T16:18:00.000Z"
  });
  const roadmapEscalation = createStrategyEscalationItemFromOutcomeLaneItem({
    item: roadmapRevisionItem,
    status: "ready_for_strategy_review",
    impactLevel: "critical",
    createdAt: "2026-05-01T16:19:00.000Z"
  });
  const reviewEscalation = createStrategyEscalationItemFromOutputReview({
    review,
    status: "approved",
    impactLevel: "medium",
    createdAt: "2026-05-01T16:20:00.000Z"
  });

  assert.equal(roadmapRevisionItem.analyzerOutcome, "roadmap_revision_required");
  assert.equal("status" in roadmapRevisionItem, false);
  assert.equal("impactLevel" in roadmapRevisionItem, false);
  assert.equal("futureStrategyEscalationServiceTarget" in roadmapRevisionItem, false);
  assert.equal(review.decision, "strategy_escalation");
  assert.equal("status" in review, false);
  assert.equal("impactLevel" in review, false);
  assert.equal("futureStrategyEscalationServiceTarget" in review, false);
  assert.equal(roadmapEscalation.sourceType, "roadmap_revision_required");
  assert.equal(roadmapEscalation.status, "ready_for_strategy_review");
  assert.equal(roadmapEscalation.impactLevel, "critical");
  assert.equal(reviewEscalation.sourceType, "strategy_escalation");
  assert.equal(reviewEscalation.status, "approved");
  assert.equal(reviewEscalation.impactLevel, "medium");
  assert.equal("decision" in roadmapEscalation, false);
  assert.equal("analyzerOutcome" in roadmapEscalation, false);
  assert.equal("executionPacketId" in roadmapEscalation, false);
  assert.equal("followUpItemId" in roadmapEscalation, false);
  assert.equal("repairItemId" in roadmapEscalation, false);
  assert.equal("evidenceId" in roadmapEscalation, false);
  assert.equal("auditEventId" in roadmapEscalation, false);
});

test("Repair Queue accepts only needs_repair and rerun_required output review decisions", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-repair-queue-1",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-repair-queue-1",
      title: "Prepare repair queue contract",
      request: "Prepare the repair queue backend contract for review outcomes.",
      normalizedRequest: "prepare the repair queue backend contract for review outcomes."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_repair_queue_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep the repair queue lane backend-only and extraction-ready."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-repair-1",
    summary: "Patch proposal staged for repair queue routing.",
    filesChanged: ["lib/neroa-one/repair-queue.ts"],
    testsRun: ["node --test tests\\neroa-one-foundation.test.mjs"],
    createdAt: "2026-05-01T15:00:00.000Z",
    receivedAt: "2026-05-01T15:01:00.000Z"
  });
  const repairReview = createPlaceholderOutputReviewDecisionFromOutputItem({
    output,
    decision: "needs_repair",
    createdAt: "2026-05-01T15:02:00.000Z"
  });
  const rerunReview = createPlaceholderOutputReviewDecisionFromOutputItem({
    output,
    decision: "rerun_required",
    createdAt: "2026-05-01T15:03:00.000Z"
  });
  const blockedDecisionValidation = validateOutputReviewDecisionForRepairQueue({
    decision: "approve_for_qc"
  });
  const repairValidation = validateOutputReviewForRepairQueue({
    review: repairReview
  });
  const rerunValidation = validateOutputReviewForRepairQueue({
    review: rerunReview
  });
  const repairItem = createRepairQueueItemFromOutputReview({
    review: repairReview,
    repairType: "code_fix",
    status: "ready_for_prompt_room",
    createdAt: "2026-05-01T15:04:00.000Z",
    updatedAt: "2026-05-01T15:05:00.000Z"
  });
  const rerunItem = createRepairQueueItemFromOutputReview({
    review: rerunReview,
    status: "ready_for_worker_rerun",
    createdAt: "2026-05-01T15:06:00.000Z"
  });
  const itemSet = createRepairQueueItemsFromOutputReviews({
    reviews: [repairReview, rerunReview],
    status: "queued",
    createdAt: "2026-05-01T15:07:00.000Z"
  });

  assert.equal(blockedDecisionValidation.allowed, false);
  assert.match(blockedDecisionValidation.reason, /allowed decisions: needs_repair, rerun_required/i);
  assert.equal(repairValidation.allowed, true);
  assert.equal(rerunValidation.allowed, true);
  assert.equal(canCreateRepairQueueItemFromOutputReview({ review: repairReview }), true);
  assert.equal(canCreateRepairQueueItemFromOutputReview({ review: rerunReview }), true);
  assert.equal(repairItem.sourceDecision, "needs_repair");
  assert.equal(repairItem.repairType, "code_fix");
  assert.equal(repairItem.priority, "normal");
  assert.equal(repairItem.status, "ready_for_prompt_room");
  assert.equal(repairItem.outputId, output.outputId);
  assert.equal(repairItem.reviewId, repairReview.reviewId);
  assert.equal(repairItem.futureRepairServiceTarget.deploymentProvider, "digitalocean");
  assert.equal(repairItem.futureRepairServiceTarget.readyForDispatch, false);
  assert.match(repairItem.repairItemId, /:repair:/i);
  assert.equal(rerunItem.sourceDecision, "rerun_required");
  assert.equal(rerunItem.repairType, "worker_failure");
  assert.equal(rerunItem.priority, "high");
  assert.equal(rerunItem.status, "ready_for_worker_rerun");
  assert.equal(itemSet.length, 2);
  assert.deepEqual(
    itemSet.map((item) => item.sourceDecision),
    ["needs_repair", "rerun_required"]
  );
});

test("Repair Queue rejects every non-repair output review decision and keeps Output Review decision-only", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-repair-queue-1b",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-repair-queue-1b",
      title: "Validate repair queue boundary",
      request: "Validate that only repair review decisions can enter the repair queue.",
      normalizedRequest:
        "validate that only repair review decisions can enter the repair queue."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_repair_queue_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep review decisions separate from repair queue items."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-repair-1b",
    createdAt: "2026-05-01T15:20:00.000Z"
  });

  const rejectedDecisions = NEROA_ONE_OUTPUT_REVIEW_DECISIONS.filter(
    (decision) =>
      !NEROA_ONE_REPAIR_QUEUE_SOURCE_DECISIONS.includes(decision)
  );

  for (const decision of rejectedDecisions) {
    const decisionValidation = validateOutputReviewDecisionForRepairQueue({
      decision
    });
    const review = createPlaceholderOutputReviewDecisionFromOutputItem({
      output,
      decision,
      createdAt: "2026-05-01T15:21:00.000Z"
    });
    const reviewValidation = validateOutputReviewForRepairQueue({
      review
    });

    assert.equal(decisionValidation.allowed, false);
    assert.equal(decisionValidation.decision, decision);
    assert.equal(reviewValidation.allowed, false);
    assert.equal(canCreateRepairQueueItemFromOutputReview({ review }), false);
    assert.equal("repairPriority" in review, false);
    assert.match(reviewValidation.reason, new RegExp(`decision ${decision}`, "i"));
    assert.throws(
      () =>
        createRepairQueueItemFromOutputReview({
          review,
          createdAt: "2026-05-01T15:22:00.000Z"
        }),
      /cannot create a repair queue item/i
    );
  }
});

test("Repair Queue customer-safe summary strips internal execution details", async () => {
  const request = buildNeroaOneTaskAnalysisRequest({
    requestId: "req-repair-queue-2",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    task: {
      taskId: "task-repair-queue-2",
      title: "Prepare repair queue sanitization",
      request: "Prepare repair queue sanitization coverage for review outcomes.",
      normalizedRequest:
        "prepare repair queue sanitization coverage for review outcomes."
    },
    spaceContext: buildFixtureSpaceContext(),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: "neroa_one_repair_queue_test"
    }
  });
  const response = await analyzeTaskWithNeroaOne(request);
  const entry = createNeroaOneOutcomeQueueEntry({
    request,
    response
  });
  const packet = createDraftCodexExecutionPacketFromQueueEntry({
    entry,
    acceptanceCriteria: ["Keep repair queue customer summaries safe and backend-only."]
  });
  const output = createPendingReviewCodexOutputItem({
    executionPacket: packet,
    codexRunId: "codex-run-repair-2",
    createdAt: "2026-05-01T15:10:00.000Z"
  });
  const repairReview = createPlaceholderOutputReviewDecisionFromOutputItem({
    output,
    decision: "needs_repair",
    createdAt: "2026-05-01T15:11:00.000Z"
  });
  const unsafeSummary = createCustomerSafeRepairSummary({
    sourceDecision: "needs_repair",
    status: "queued",
    customerSafeSummary:
      "Use internalPromptDraft promptText and raw worker instructions for codex_cli; review protectedAreas in lib/neroa-one/repair-queue.ts; check browser.runtime and internal audit-only notes."
  });
  const item = createRepairQueueItemFromOutputReview({
    review: repairReview,
    repairSummary:
      "Repair lib/neroa-one/repair-queue.ts with raw worker instructions, selectedEngine codex_cli, worker secret rotation, and browser.runtime fallback.",
    customerSafeSummary:
      "Repair lib/neroa-one/repair-queue.ts with raw worker instructions, selectedEngine codex_cli, worker secret rotation, and browser.runtime fallback.",
    createdAt: "2026-05-01T15:12:00.000Z"
  });
  const customerView = getCustomerSafeRepairQueueItemView({
    item
  });

  assert.doesNotMatch(
    unsafeSummary,
    /internalPromptDraft|promptText|raw worker instructions|protectedAreas|selectedEngine|worker secret|browser\.runtime|audit-only|codex_cli/i
  );
  assert.match(unsafeSummary, /implementation output needs an internal repair pass|internal detail/i);
  assert.doesNotMatch(
    item.customerSafeSummary,
    /internalPromptDraft|promptText|raw worker instructions|protectedAreas|selectedEngine|worker secret|browser\.runtime|audit-only|codex_cli|repair-queue\.ts/i
  );
  assert.equal(customerView.repairItemId, item.repairItemId);
  assert.equal(customerView.reviewId, item.reviewId);
  assert.equal(customerView.status, item.status);
  assert.equal(customerView.priority, item.priority);
  assert.equal(customerView.customerSafeSummary, item.customerSafeSummary);
  assert.equal("repairSummary" in customerView, false);
  assert.equal("internalRepairNotes" in customerView, false);
  assert.equal("futureRepairServiceTarget" in customerView, false);
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

test("Malformed execution packets cannot create Prompt Room items", () => {
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
    createdAt: "2026-05-01T12:20:00.000Z",
    futureDispatchTarget: {
      owner: "future_digitalocean_codex_dispatch_service",
      queueName: "neroa-one.codex-execution-packets",
      dispatchMode: "deferred",
      readyForDispatch: false,
      notes: ["Current lane is contract-only."]
    }
  };
  const validation = validateCodexExecutionPacketForPromptRoom({
    executionPacket: malformedPacket
  });

  assert.equal(validation.allowed, false);
  assert.match(validation.reason, /taskId/i);
  assert.equal(
    canCreatePromptRoomItemFromCodexExecutionPacket({
      executionPacket: malformedPacket
    }),
    false
  );
  assert.throws(
    () =>
      createDraftPromptRoomItemFromCodexExecutionPacket({
        executionPacket: malformedPacket
      }),
    /taskId/i
  );
});

test("Malformed Prompt Room items cannot create queued worker lane runs", () => {
  const malformedPromptRoomItem = {
    promptRoomItemId: "workspace-alpha:project-alpha:task-bad:prompt-room:20260501T122100000Z",
    executionPacketId: "workspace-alpha:project-alpha:task-bad:codex-execution-packet-draft",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    sourceLaneId: "ready_to_build",
    normalizedRequest: "prepare the approved worker lane contract.",
    internalPromptDraft: {
      status: "placeholder_only",
      promptText: "PROMPT_ROOM_DRAFT_DEFERRED",
      notes: ["Prompt generation is intentionally deferred."]
    },
    customerSafeStatus: "build_queued",
    protectedAreas: ["ui_layout"],
    acceptanceCriteria: [],
    testCommands: [],
    riskLevel: "low",
    status: "ready_for_code_builder",
    createdAt: "2026-05-01T12:21:00.000Z",
    futurePromptServiceTarget: {
      deploymentProvider: "digitalocean",
      serviceName: "neroa-one-prompt-room-service",
      queueName: "neroa-one.prompt-room",
      serviceType: "future_prompt_room_service",
      readyForDrafting: false,
      notes: ["Current lane is contract-only."]
    }
  };
  const validation = validateCodexExecutionPacketForCodeExecutionWorkerRun({
    promptRoomItem: malformedPromptRoomItem
  });

  assert.equal(validation.allowed, false);
  assert.match(validation.reason, /taskId/i);
  assert.equal(
    canCreateCodeExecutionWorkerRunFromCodexExecutionPacket({
      promptRoomItem: malformedPromptRoomItem
    }),
    false
  );
  assert.throws(
    () =>
      createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket({
        promptRoomItem: malformedPromptRoomItem
      }),
    /taskId/i
  );
});

test("Worker lane rejects Prompt Room items that leak worker infrastructure selection", () => {
  const leakedPromptRoomItem = {
    promptRoomItemId: "workspace-alpha:project-alpha:task-leak:prompt-room:20260501T122200000Z",
    executionPacketId: "workspace-alpha:project-alpha:task-leak:codex-execution-packet-draft",
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    taskId: "task-leak",
    sourceLaneId: "ready_to_build",
    normalizedRequest: "prepare the approved implementation packet for backend execution.",
    internalPromptDraft: {
      status: "placeholder_only",
      promptText: "PROMPT_ROOM_DRAFT_DEFERRED",
      notes: ["Prompt generation is intentionally deferred."]
    },
    customerSafeStatus: "build_queued",
    protectedAreas: ["ui_layout"],
    acceptanceCriteria: [],
    testCommands: [],
    riskLevel: "low",
    status: "ready_for_code_builder",
    createdAt: "2026-05-01T12:22:00.000Z",
    futurePromptServiceTarget: {
      deploymentProvider: "digitalocean",
      serviceName: "neroa-one-prompt-room-service",
      queueName: "neroa-one.code-execution-worker.manual_operator",
      serviceType: "future_prompt_room_service",
      readyForDrafting: false,
      notes: ["Packet boundary should not pick worker infrastructure."]
    }
  };
  const validation = validateCodexExecutionPacketForCodeExecutionWorkerRun({
    promptRoomItem: leakedPromptRoomItem
  });

  assert.equal(validation.allowed, false);
  assert.match(validation.reason, /leaked runtime worker infrastructure selection/i);
  assert.equal(
    canCreateCodeExecutionWorkerRunFromCodexExecutionPacket({
      promptRoomItem: leakedPromptRoomItem
    }),
    false
  );
  assert.throws(
    () =>
      createQueuedCodeExecutionWorkerRunFromCodexExecutionPacket({
        promptRoomItem: leakedPromptRoomItem,
        selectedEngine: "manual_operator"
      }),
    /leaked runtime worker infrastructure selection/i
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
