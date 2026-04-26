import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildConversationSessionState } from "../lib/intelligence/conversation/index.ts";
import { scopeApprovalRecordSchema } from "../lib/intelligence/governance/index.ts";
import {
  applyPendingExecutionRelease,
  buildPendingExecutionItem,
  generateExecutionPacket
} from "../lib/intelligence/execution/index.ts";
import {
  buildTaskBillingProtectionContext,
  generateBillingProtectionState
} from "../lib/intelligence/billing/index.ts";
import {
  buildWorkspaceProjectIntelligence
} from "../lib/intelligence/project-brief-generator.ts";
import {
  createStrategyRevisionPersistenceUpdate
} from "../lib/intelligence/revisions/index.ts";
import { buildStoredProjectMetadata } from "../lib/workspace/project-metadata.ts";

function buildUserMessage(id, content) {
  return {
    id,
    role: "user",
    content
  };
}

function buildConversationState(messages) {
  return buildConversationSessionState({
    messages: messages.map((message, index) => buildUserMessage(`u${index + 1}`, message))
  });
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildSharedIntelligence(args) {
  const conversationBuild = buildConversationState(args.messages);
  const workspaceId = `workspace-${slugify(args.projectName)}`;
  const projectId = `project-${slugify(args.projectName)}`;
  let projectMetadata = buildStoredProjectMetadata({
    title: args.projectName,
    description: args.projectDescription,
    conversationState: conversationBuild.state
  });
  let projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId,
    projectId,
    projectTitle: args.projectName,
    projectDescription: args.projectDescription,
    projectMetadata
  });

  if (args.patch) {
    const update = createStrategyRevisionPersistenceUpdate({
      workspaceId,
      projectId,
      projectName: args.projectName,
      projectMetadata,
      projectBrief: projectIntelligence.projectBrief,
      architectureBlueprint: projectIntelligence.architectureBlueprint,
      roadmapPlan: projectIntelligence.roadmapPlan,
      governancePolicy: projectIntelligence.governancePolicy,
      patch: args.patch,
      createdAt: args.createdAt ?? "2026-04-26T15:00:00.000Z",
      createdBy: "owner@example.com"
    });

    projectMetadata = buildStoredProjectMetadata({
      title: args.projectName,
      description: args.projectDescription,
      conversationState: conversationBuild.state,
      governanceState: update.governanceState,
      strategyState: update.strategyState
    });
    projectIntelligence = buildWorkspaceProjectIntelligence({
      workspaceId,
      projectId,
      projectTitle: args.projectName,
      projectDescription: args.projectDescription,
      projectMetadata
    });
  }

  if (args.approved) {
    projectMetadata = buildStoredProjectMetadata({
      title: args.projectName,
      description: args.projectDescription,
      conversationState: conversationBuild.state,
      strategyState: projectMetadata.strategyState,
      governanceState: {
        ...(projectMetadata.governanceState ?? { roadmapRevisionRecords: [] }),
        roadmapRevisionRecords: [],
        scopeApprovalRecord: scopeApprovalRecordSchema.parse({
          approvalRecordId: `${projectIntelligence.governancePolicy.governanceId}:scope-approval`,
          sourceRoadmapPlanId: projectIntelligence.roadmapPlan.roadmapId,
          sourceGovernancePolicyId: projectIntelligence.governancePolicy.governanceId,
          status: "approved",
          approvedAt: "2026-04-26T16:00:00.000Z",
          approvedBy: "owner@example.com",
          unresolvedBlockerIds: [],
          supersededByRevisionId: null
        })
      }
    });
    projectIntelligence = buildWorkspaceProjectIntelligence({
      workspaceId,
      projectId,
      projectTitle: args.projectName,
      projectDescription: args.projectDescription,
      projectMetadata
    });
  }

  return {
    conversationBuild,
    workspaceId,
    projectId,
    projectMetadata,
    projectIntelligence,
    projectName: args.projectName,
    projectDescription: args.projectDescription
  };
}

function buildExecutionPacketForRequest(shared, request, overrides = {}) {
  return generateExecutionPacket({
    workspaceId: shared.workspaceId,
    projectId: shared.projectId,
    projectName: shared.projectIntelligence.projectBrief.projectName,
    sourceRequestId: overrides.sourceRequestId ?? `${shared.projectId}:request`,
    title: overrides.title ?? null,
    userRequest: request,
    acceptanceCriteriaText: overrides.acceptanceCriteriaText ?? null,
    taskType: overrides.taskType ?? "implementation",
    requestedOutputMode: overrides.requestedOutputMode ?? "patch_proposal",
    riskLevel: overrides.riskLevel ?? "medium",
    selectedBuildLaneSlug: overrides.selectedBuildLaneSlug ?? null,
    existingBuildRoomTaskId: overrides.existingBuildRoomTaskId ?? null,
    originatingSurface: "command_center",
    projectBrief: shared.projectIntelligence.projectBrief,
    architectureBlueprint: shared.projectIntelligence.architectureBlueprint,
    roadmapPlan: shared.projectIntelligence.roadmapPlan,
    governancePolicy: shared.projectIntelligence.governancePolicy
  });
}

function buildReleasedExecutionState(packet, buildRoomTaskId, createdAt = "2026-04-26T16:20:00.000Z") {
  const pendingItem = buildPendingExecutionItem({
    pendingExecutionId: `${packet.executionPacketId}:pending`,
    commandCenterTaskId: `${packet.executionPacketId}:command-task`,
    buildRoomTaskId,
    title: packet.buildRoomMapping.taskTitle,
    request: packet.requestSummary,
    roadmapArea: packet.phaseIds[0] ?? "Current roadmap phase",
    laneSlug: packet.buildRoomTaskPayload.laneSlug,
    taskType: packet.buildRoomTaskPayload.taskType,
    requestedOutputMode: packet.buildRoomTaskPayload.requestedOutputMode,
    acceptanceCriteria: packet.acceptanceCriteria,
    riskLevel: packet.riskLevel,
    createdAt
  });

  return applyPendingExecutionRelease({
    executionState: null,
    pendingItem,
    packet,
    buildRoomTaskId,
    now: createdAt,
    buildRoomTaskCreated: true
  }).executionState;
}

function buildCodexResult(packet, overrides = {}) {
  return {
    summary: overrides.summary ?? "Codex completed the requested work.",
    implementationPlan: overrides.implementationPlan ?? packet.acceptanceCriteria,
    suggestedFileTargets: overrides.suggestedFileTargets ?? [],
    patchText: overrides.patchText ?? null,
    warnings: overrides.warnings ?? [],
    blockers: overrides.blockers ?? [],
    outputMode: packet.buildRoomTaskPayload.requestedOutputMode,
    relayMode: overrides.relayMode ?? "mock",
    rawText: overrides.rawText ?? null
  };
}

function buildTaskDetailFromPacket(args) {
  const taskId = args.buildRoomTaskId ?? `${args.packet.executionPacketId}:build-room-task`;
  const status = args.taskStatus ?? "worker_complete";
  const workerRunStatus =
    status === "worker_complete"
      ? "complete"
      : status === "worker_failed"
        ? "failed"
        : status === "worker_running"
          ? "running"
          : status === "approved_for_worker"
            ? "queued"
            : "idle";
  const createdAt = args.createdAt ?? "2026-04-26T16:25:00.000Z";
  const updatedAt = args.updatedAt ?? "2026-04-26T16:35:00.000Z";
  const codexRunId = `${taskId}:codex-run`;
  const workerRunId = `${taskId}:worker-run`;
  const codexResponsePayload = buildCodexResult(args.packet, args.codexResult ?? {});

  return {
    task: {
      id: taskId,
      workspaceId: args.shared.workspaceId,
      projectId: args.shared.projectId,
      ownerId: "owner-id",
      createdByUserId: "owner-id",
      laneSlug: args.packet.buildRoomTaskPayload.laneSlug,
      title: args.packet.buildRoomTaskPayload.title,
      taskType: args.packet.buildRoomTaskPayload.taskType,
      requestedOutputMode: args.packet.buildRoomTaskPayload.requestedOutputMode,
      userRequest: args.packet.buildRoomTaskPayload.userRequest,
      acceptanceCriteria:
        args.packet.buildRoomTaskPayload.acceptanceCriteria.join("\n") || null,
      riskLevel: args.packet.buildRoomTaskPayload.riskLevel,
      status,
      codexRequestPayload: null,
      codexResponsePayload,
      approvedForExecution:
        status === "approved_for_worker" ||
        status === "worker_running" ||
        status === "worker_complete" ||
        status === "worker_failed",
      workerRunStatus,
      createdAt,
      updatedAt
    },
    messages: [],
    runs:
      args.runs ??
      [
        {
          id: codexRunId,
          taskId,
          workspaceId: args.shared.workspaceId,
          projectId: args.shared.projectId,
          ownerId: "owner-id",
          triggeredByUserId: "owner-id",
          runType: "codex",
          status: "complete",
          provider: "codex-cloud-mock",
          externalJobId: null,
          requestPayload: null,
          responsePayload: codexResponsePayload,
          logExcerpt: codexResponsePayload.summary,
          startedAt: createdAt,
          completedAt: "2026-04-26T16:28:00.000Z",
          createdAt,
          updatedAt
        },
        ...(status === "worker_complete" || status === "worker_failed"
          ? [
              {
                id: workerRunId,
                taskId,
                workspaceId: args.shared.workspaceId,
                projectId: args.shared.projectId,
                ownerId: "owner-id",
                triggeredByUserId: "owner-id",
                runType: "worker",
                status: status === "worker_complete" ? "complete" : "failed",
                provider: "droplet-worker-mock",
                externalJobId: "job-123",
                requestPayload: null,
                responsePayload: args.workerPayload ?? {},
                logExcerpt:
                  args.workerLogExcerpt ??
                  (status === "worker_complete"
                    ? "Worker completed the approved job."
                    : "Worker failed the approved job."),
                startedAt: "2026-04-26T16:30:00.000Z",
                completedAt: "2026-04-26T16:34:00.000Z",
                createdAt: "2026-04-26T16:30:00.000Z",
                updatedAt
              }
            ]
          : [])
      ],
    artifacts:
      args.artifacts ??
      [
        {
          id: `${taskId}:task-packet`,
          taskId,
          runId: codexRunId,
          ownerId: "owner-id",
          artifactType: "task_packet",
          title: `${args.packet.buildRoomMapping.taskTitle} task packet`,
          textContent: null,
          payload: {
            taskId,
            laneIds: args.packet.laneIds
          },
          createdAt
        },
        {
          id: `${taskId}:codex-result`,
          taskId,
          runId: codexRunId,
          ownerId: "owner-id",
          artifactType: "codex_result",
          title: `${args.packet.buildRoomMapping.taskTitle} Codex result`,
          textContent: args.codexArtifactText ?? codexResponsePayload.summary,
          payload: args.codexArtifactPayload ?? codexResponsePayload,
          createdAt: "2026-04-26T16:28:00.000Z"
        },
        ...(status === "worker_complete" || status === "worker_failed"
          ? [
              {
                id: `${taskId}:worker-result`,
                taskId,
                runId: workerRunId,
                ownerId: "owner-id",
                artifactType:
                  status === "worker_complete" ? "worker_result" : "worker_log",
                title: `${args.packet.buildRoomMapping.taskTitle} worker result`,
                textContent:
                  args.workerArtifactText ??
                  "Worker completed the approved job with validation evidence.",
                payload: args.workerArtifactPayload ?? args.workerPayload ?? {},
                createdAt: "2026-04-26T16:34:00.000Z"
              }
            ]
          : [])
      ]
  };
}

function buildBillingContext(shared, taskDetail, executionState, billingState = null) {
  return buildTaskBillingProtectionContext({
    workspaceId: shared.workspaceId,
    projectId: shared.projectId,
    projectName: shared.projectIntelligence.projectBrief.projectName,
    executionState,
    billingState,
    taskDetail,
    projectBrief: shared.projectIntelligence.projectBrief,
    architectureBlueprint: shared.projectIntelligence.architectureBlueprint,
    roadmapPlan: shared.projectIntelligence.roadmapPlan,
    governancePolicy: shared.projectIntelligence.governancePolicy
  });
}

test("crypto billable completion records a shared charge event after QA acceptance", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto Billing",
    projectDescription: messages.join(" "),
    patch: {
      answeredInputs: [
        { inputId: "chainsInScope", value: "Ethereum and Solana" },
        { inputId: "walletConnectionMvp", value: "Not in MVP. Keep launch analytics only." },
        { inputId: "adviceAdjacency", value: "Analytics only. No financial advice." },
        {
          inputId: "riskSignalSources",
          value: "Liquidity, holder concentration, audits, and tokenomics."
        }
      ]
    },
    approved: true
  });
  const packet = buildExecutionPacketForRequest(
    shared,
    "Implement project profiles, search and filter views"
  );
  const executionState = buildReleasedExecutionState(packet, "crypto-billing-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "crypto-billing-task",
    workerArtifactPayload: {
      uiValidated: true,
      acceptedCriteria: packet.acceptanceCriteria
    },
    workerArtifactText:
      "Watchlist dashboard filtering shipped and the investor-facing evidence was attached."
  });
  const billingContext = buildBillingContext(
    shared,
    taskDetail,
    executionState,
    shared.projectIntelligence.billingState
  );
  const persistedMetadata = buildStoredProjectMetadata({
    title: shared.projectName,
    description: shared.projectDescription,
    conversationState: shared.conversationBuild.state,
    governanceState: shared.projectMetadata.governanceState,
    strategyState: shared.projectMetadata.strategyState,
    executionState,
    billingState: billingContext.billingState
  });
  const rehydrated = buildWorkspaceProjectIntelligence({
    workspaceId: shared.workspaceId,
    projectId: shared.projectId,
    projectTitle: shared.projectName,
    projectDescription: shared.projectDescription,
    projectMetadata: persistedMetadata
  });

  assert.equal(shared.projectIntelligence.projectBrief.domainPack, "crypto_analytics");
  assert.equal(billingContext.billingState.latestChargeabilityDecision.billable, true);
  assert.equal(billingContext.billingState.latestChargeabilityDecision.canChargeCustomer, true);
  assert.equal(billingContext.billingState.currentStatus, "billable");
  assert.ok(
    billingContext.billingState.chargeEvents.some(
      (event) => event.eventType === "billable_completion"
    )
  );
  assert.equal(
    rehydrated.billingState?.latestChargeabilityDecision.billable,
    true
  );
  assert.ok((rehydrated.billingState?.chargeEvents.length ?? 0) > 0);
});

test("crypto methodology retries stay protected and cost guardrails can block further auto-retry", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto Retry Protection",
    projectDescription: messages.join(" "),
    patch: {
      answeredInputs: [
        { inputId: "chainsInScope", value: "Ethereum and Solana" },
        { inputId: "walletConnectionMvp", value: "Not in MVP. Keep launch analytics only." },
        { inputId: "adviceAdjacency", value: "Analytics only. No financial advice." },
        {
          inputId: "riskSignalSources",
          value: "Liquidity, holder concentration, audits, and tokenomics."
        }
      ]
    },
    approved: true
  });
  const packet = buildExecutionPacketForRequest(
    shared,
    "Update risk score methodology and admin rules thresholds",
    { riskLevel: "medium" }
  );
  const executionState = buildReleasedExecutionState(packet, "crypto-retry-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "crypto-retry-task",
    taskStatus: "worker_failed",
    workerLogExcerpt:
      "Risk scoring pipeline failed during provider retry and score generation.",
    workerArtifactText:
      "Worker failed the risk scoring pipeline while score generation retried.",
    runs: [
      {
        id: "crypto-retry-task:codex-run",
        taskId: "crypto-retry-task",
        workspaceId: shared.workspaceId,
        projectId: shared.projectId,
        ownerId: "owner-id",
        triggeredByUserId: "owner-id",
        runType: "codex",
        status: "complete",
        provider: "codex-cloud-mock",
        externalJobId: null,
        requestPayload: null,
        responsePayload: {},
        logExcerpt: "Codex prepared the implementation plan.",
        startedAt: "2026-04-26T16:20:00.000Z",
        completedAt: "2026-04-26T16:24:00.000Z",
        createdAt: "2026-04-26T16:20:00.000Z",
        updatedAt: "2026-04-26T16:24:00.000Z"
      },
      {
        id: "crypto-retry-task:worker-run-1",
        taskId: "crypto-retry-task",
        workspaceId: shared.workspaceId,
        projectId: shared.projectId,
        ownerId: "owner-id",
        triggeredByUserId: "owner-id",
        runType: "worker",
        status: "failed",
        provider: "droplet-worker-mock",
        externalJobId: "job-1",
        requestPayload: null,
        responsePayload: {
          error: "Risk scoring pipeline failed during provider retry."
        },
        logExcerpt: "Risk scoring pipeline failed during provider retry.",
        startedAt: "2026-04-26T16:25:00.000Z",
        completedAt: "2026-04-26T16:27:00.000Z",
        createdAt: "2026-04-26T16:25:00.000Z",
        updatedAt: "2026-04-26T16:27:00.000Z"
      },
      {
        id: "crypto-retry-task:worker-run-2",
        taskId: "crypto-retry-task",
        workspaceId: shared.workspaceId,
        projectId: shared.projectId,
        ownerId: "owner-id",
        triggeredByUserId: "owner-id",
        runType: "worker",
        status: "failed",
        provider: "droplet-worker-mock",
        externalJobId: "job-2",
        requestPayload: null,
        responsePayload: {
          error: "Score generation failed again after retry."
        },
        logExcerpt: "Score generation failed again after retry.",
        startedAt: "2026-04-26T16:28:00.000Z",
        completedAt: "2026-04-26T16:30:00.000Z",
        createdAt: "2026-04-26T16:28:00.000Z",
        updatedAt: "2026-04-26T16:30:00.000Z"
      }
    ]
  });
  const billingContext = buildBillingContext(
    shared,
    taskDetail,
    executionState,
    shared.projectIntelligence.billingState
  );

  assert.equal(billingContext.billingState.latestChargeabilityDecision.billable, false);
  assert.equal(
    billingContext.billingState.latestFailureClassification?.nonBillable,
    true
  );
  assert.equal(
    billingContext.billingState.latestRetryDecision?.action,
    "require_review"
  );
  assert.equal(
    billingContext.billingState.latestCostGuardrailDecision?.status,
    "block_auto_retry"
  );
  assert.equal(
    billingContext.billingState.latestCostGuardrailDecision?.blocksFurtherAutoRetry,
    true
  );
  assert.equal(
    billingContext.billingState.chargeEvents.some(
      (event) => event.eventType === "billable_completion"
    ),
    false
  );
});

test("run-complete but QA-unaccepted work stays deferred and protected", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto Awaiting QA Billing",
    projectDescription: messages.join(" "),
    patch: {
      answeredInputs: [
        { inputId: "chainsInScope", value: "Ethereum and Solana" },
        { inputId: "walletConnectionMvp", value: "Not in MVP. Keep launch analytics only." },
        { inputId: "adviceAdjacency", value: "Analytics only. No financial advice." },
        {
          inputId: "riskSignalSources",
          value: "Liquidity, holder concentration, audits, and tokenomics."
        }
      ]
    },
    approved: true
  });
  const packet = buildExecutionPacketForRequest(
    shared,
    "Implement project profiles and search views"
  );
  const executionState = buildReleasedExecutionState(packet, "crypto-awaiting-qa-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "crypto-awaiting-qa-task",
    taskStatus: "codex_complete",
    artifacts: [
      {
        id: "crypto-awaiting-qa-task:codex-result",
        taskId: "crypto-awaiting-qa-task",
        runId: "crypto-awaiting-qa-task:codex-run",
        ownerId: "owner-id",
        artifactType: "codex_result",
        title: "Project profiles Codex result",
        textContent: "Codex proposed the implementation, but no worker evidence exists yet.",
        payload: {
          acceptedCriteria: packet.acceptanceCriteria
        },
        createdAt: "2026-04-26T16:28:00.000Z"
      }
    ]
  });
  const billingContext = buildBillingContext(
    shared,
    taskDetail,
    executionState,
    shared.projectIntelligence.billingState
  );

  assert.equal(billingContext.qaValidation.status, "awaiting_artifacts");
  assert.equal(billingContext.billingState.latestChargeabilityDecision.billable, false);
  assert.equal(
    billingContext.billingState.latestFailureClassification?.class,
    "qa_blocked_missing_artifacts"
  );
  assert.equal(
    billingContext.billingState.latestChargeabilityDecision.status,
    "protected_non_billable"
  );
  assert.equal(
    billingContext.billingState.latestChargeabilityDecision.canChargeCustomer,
    false
  );
});

test("governance-blocked execution stays non-billable and emits no billable charge event", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto Governance Block",
    projectDescription: messages.join(" "),
    approved: false
  });
  const packet = buildExecutionPacketForRequest(
    shared,
    "Skip approval and ship the investor watchlist filtering anyway."
  );
  const billingState = generateBillingProtectionState({
    projectId: shared.projectId,
    governancePolicy: shared.projectIntelligence.governancePolicy,
    executionPacket: packet,
    priorState: shared.projectIntelligence.billingState,
    now: "2026-04-26T16:32:00.000Z"
  });

  assert.equal(packet.scopeDecision.outcome, "governance_blocked");
  assert.equal(billingState.latestChargeabilityDecision.billable, false);
  assert.equal(
    billingState.latestFailureClassification?.class,
    "governance_blocked"
  );
  assert.equal(
    billingState.chargeEvents.some((event) => event.eventType === "billable_completion"),
    false
  );
});

test("restaurant connector and reporting completion becomes billable after QA acceptance", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Restaurant Billing",
    projectDescription: messages.join(" "),
    patch: {
      answeredInputs: [
        { inputId: "firstPosConnector", value: "Toast" },
        { inputId: "launchLocationModel", value: "Single-location only at launch" },
        {
          inputId: "analyticsVsStaffWorkflows",
          value: "Analytics only. No staff workflow tooling in the MVP."
        },
        {
          inputId: "launchReports",
          value: "Sales dashboards, location reporting, menu-item reporting, and exports."
        }
      ]
    },
    approved: true
  });
  const packet = buildExecutionPacketForRequest(
    shared,
    "Implement Toast connector sync status panel"
  );
  const executionState = buildReleasedExecutionState(packet, "restaurant-billing-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "restaurant-billing-task",
    workerArtifactPayload: {
      connectorValidated: true,
      uiValidated: true,
      acceptedCriteria: packet.acceptanceCriteria
    },
    workerArtifactText:
      "Toast connector sync status panel shipped with reporting and visibility evidence attached."
  });
  const billingContext = buildBillingContext(
    shared,
    taskDetail,
    executionState,
    shared.projectIntelligence.billingState
  );

  assert.equal(shared.projectIntelligence.projectBrief.domainPack, "restaurant_sales");
  assert.equal(billingContext.billingState.latestChargeabilityDecision.billable, true);
  assert.equal(
    billingContext.billingState.chargeEvents.some(
      (event) => event.eventType === "billable_completion"
    ),
    true
  );
  assert.match(
    billingContext.billingState.summary.headline,
    /Billable completion/i
  );
});

test("generic fallback billing protection still generates cleanly from shared execution intelligence", () => {
  const messages = [
    "I want to build a workflow SaaS for consultants with a customer web app."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Consultant Workflow Billing",
    projectDescription: messages.join(" "),
    approved: true
  });
  const packet = buildExecutionPacketForRequest(
    shared,
    "Implement workflow search filters for consultant workspaces"
  );
  const executionState = buildReleasedExecutionState(packet, "generic-billing-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "generic-billing-task",
    workerArtifactPayload: {
      uiValidated: true,
      acceptedCriteria: packet.acceptanceCriteria
    }
  });
  const billingContext = buildBillingContext(
    shared,
    taskDetail,
    executionState,
    shared.projectIntelligence.billingState
  );

  assert.equal(shared.projectIntelligence.projectBrief.domainPack, "generic_saas");
  assert.equal(Array.isArray(billingContext.billingState.chargeEvents), true);
  assert.equal(
    typeof billingContext.billingState.latestChargeabilityDecision.billable,
    "boolean"
  );
  assert.equal("invoiceUrl" in billingContext.billingState, false);
});

test("Command Center and Build Room read the same shared billing-protection source without UI-local defaults", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto Shared Billing",
    projectDescription: messages.join(" "),
    patch: {
      answeredInputs: [
        { inputId: "chainsInScope", value: "Ethereum and Solana" },
        { inputId: "walletConnectionMvp", value: "Not in MVP. Keep launch analytics only." },
        { inputId: "adviceAdjacency", value: "Analytics only. No financial advice." },
        {
          inputId: "riskSignalSources",
          value: "Liquidity, holder concentration, audits, and tokenomics."
        }
      ]
    },
    approved: true
  });
  const packet = buildExecutionPacketForRequest(
    shared,
    "Implement investor watchlist dashboard filtering"
  );
  const executionState = buildReleasedExecutionState(packet, "crypto-shared-billing-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "crypto-shared-billing-task",
    workerArtifactPayload: {
      uiValidated: true,
      acceptedCriteria: packet.acceptanceCriteria
    }
  });
  const commandCenterContext = buildBillingContext(
    shared,
    taskDetail,
    executionState,
    shared.projectIntelligence.billingState
  );
  const buildRoomContext = buildBillingContext(
    shared,
    taskDetail,
    executionState,
    shared.projectIntelligence.billingState
  );
  const commandCenterPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/command-center/page.tsx", import.meta.url),
    "utf8"
  );
  const buildRoomPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/build-room/page.tsx", import.meta.url),
    "utf8"
  );
  const commandCenterComponentSource = readFileSync(
    new URL("../components/workspace/command-center-build-room-execution-panel.tsx", import.meta.url),
    "utf8"
  );
  const buildRoomComponentSource = readFileSync(
    new URL("../components/workspace/build-room-control-room.tsx", import.meta.url),
    "utf8"
  );

  assert.deepEqual(commandCenterContext.billingState, buildRoomContext.billingState);
  assert.match(commandCenterPageSource, /billingState=\{projectIntelligence\.billingState\}/);
  assert.match(buildRoomPageSource, /billingState=\{projectIntelligence\.billingState\}/);
  assert.match(commandCenterComponentSource, /buildTaskBillingProtectionContext/);
  assert.match(buildRoomComponentSource, /buildTaskBillingProtectionContext/);
  assert.doesNotMatch(commandCenterComponentSource, /Ethereum and Solana|Toast connector/i);
  assert.doesNotMatch(buildRoomComponentSource, /Ethereum and Solana|Toast connector/i);
});

test("step integrity keeps Build Room contracts and surfaces free of invoice or payment UI changes", () => {
  const buildRoomContractsSource = readFileSync(
    new URL("../lib/build-room/contracts.ts", import.meta.url),
    "utf8"
  );
  const buildRoomControlRoomSource = readFileSync(
    new URL("../components/workspace/build-room-control-room.tsx", import.meta.url),
    "utf8"
  );
  const commandCenterExecutionPanelSource = readFileSync(
    new URL("../components/workspace/command-center-build-room-execution-panel.tsx", import.meta.url),
    "utf8"
  );

  assert.match(
    buildRoomContractsSource,
    /"queued_for_codex"[\s\S]*"codex_running"[\s\S]*"codex_complete"[\s\S]*"approved_for_worker"[\s\S]*"worker_running"[\s\S]*"worker_complete"[\s\S]*"worker_failed"/
  );
  assert.doesNotMatch(
    buildRoomContractsSource,
    /billable_completion|invoice|payment provider|checkout/i
  );
  assert.doesNotMatch(buildRoomControlRoomSource, /invoice|checkout|stripe|pricing plan/i);
  assert.doesNotMatch(commandCenterExecutionPanelSource, /invoice|checkout|stripe|pricing plan/i);
});
