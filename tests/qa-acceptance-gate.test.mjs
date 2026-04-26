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
import { buildTaskQAValidationContext } from "../lib/intelligence/qa/index.ts";
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
    projectIntelligence
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

function buildQAContext(shared, packet, taskDetail, executionState) {
  return buildTaskQAValidationContext({
    workspaceId: shared.workspaceId,
    projectId: shared.projectId,
    projectName: shared.projectIntelligence.projectBrief.projectName,
    executionState,
    taskDetail,
    projectBrief: shared.projectIntelligence.projectBrief,
    architectureBlueprint: shared.projectIntelligence.architectureBlueprint,
    roadmapPlan: shared.projectIntelligence.roadmapPlan,
    governancePolicy: shared.projectIntelligence.governancePolicy
  });
}

test("crypto QA validation marks completed investor-facing work as release-ready when required artifacts are present", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto Risk QA",
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
  const executionState = buildReleasedExecutionState(packet, "crypto-watchlist-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "crypto-watchlist-task",
    workerArtifactPayload: {
      uiValidated: true,
      acceptedCriteria: packet.acceptanceCriteria
    },
    workerArtifactText:
      "Watchlist filtering shipped. UI validated for the investor dashboard."
  });
  const context = buildQAContext(shared, packet, taskDetail, executionState);

  assert.equal(context.qaValidation.status, "release_ready");
  assert.equal(context.qaValidation.completionReadiness.releaseReady, true);
  assert.equal(context.qaValidation.releaseDecision.canPresentAsComplete, true);
  assert.equal(context.qaValidation.releaseDecision.canMarkReleaseReady, true);
  assert.ok(
    context.qaValidation.artifactRequirements.some(
      (requirement) => requirement.kind === "surface_evidence"
    )
  );
  assert.ok(context.qaValidation.criterionResults.every((criterion) => criterion.status === "satisfied"));
});

test("crypto methodology-affecting work stays out of release-ready without stronger evidence and review", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto Risk QA Blockers",
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
    { riskLevel: "high" }
  );
  const executionState = buildReleasedExecutionState(packet, "crypto-risk-engine-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "crypto-risk-engine-task",
    workerArtifactPayload: {
      acceptedCriteria: packet.acceptanceCriteria
    },
    workerArtifactText: "Risk engine updated, but no methodology review evidence was attached."
  });
  const context = buildQAContext(shared, packet, taskDetail, executionState);

  assert.equal(context.qaValidation.needsHumanReview, true);
  assert.equal(context.qaValidation.releaseDecision.canPresentAsComplete, false);
  assert.equal(context.qaValidation.completionReadiness.releaseReady, false);
  assert.ok(
    context.qaValidation.artifactRequirements.some(
      (requirement) => requirement.kind === "logic_review_evidence"
    )
  );
  assert.ok(
    context.qaValidation.blockers.some((blocker) =>
      /methodology|review evidence|rollback/i.test(blocker)
    )
  );
});

test("restaurant QA validation deterministically accepts approved reporting and connector work", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Restaurant Reporting QA",
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
  const executionState = buildReleasedExecutionState(packet, "restaurant-toast-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "restaurant-toast-task",
    workerArtifactPayload: {
      connectorValidated: true,
      uiValidated: true,
      acceptedCriteria: packet.acceptanceCriteria
    },
    workerArtifactText:
      "Toast connector sync status panel implemented and reporting evidence attached."
  });
  const firstContext = buildQAContext(shared, packet, taskDetail, executionState);
  const secondContext = buildQAContext(shared, packet, taskDetail, executionState);

  assert.equal(firstContext.qaValidation.status, "release_ready");
  assert.deepEqual(firstContext.qaValidation, secondContext.qaValidation);
  assert.ok(
    firstContext.qaValidation.artifactRequirements.some(
      (requirement) => requirement.kind === "connector_evidence"
    )
  );
  assert.ok(firstContext.qaValidation.criterionResults.every((criterion) => criterion.status === "satisfied"));
});

test("generic fallback QA validation still generates cleanly without QA-local domain branching", () => {
  const messages = [
    "I want to build a workflow SaaS for consultants with a customer web app."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Consultant Workflow QA",
    projectDescription: messages.join(" "),
    approved: true
  });
  const packet = buildExecutionPacketForRequest(
    shared,
    "Implement workflow search filters for consultant workspaces"
  );
  const executionState = buildReleasedExecutionState(packet, "generic-workflow-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "generic-workflow-task",
    workerArtifactPayload: {
      uiValidated: true,
      acceptedCriteria: packet.acceptanceCriteria
    }
  });
  const context = buildQAContext(shared, packet, taskDetail, executionState);

  assert.equal(shared.projectIntelligence.projectBrief.domainPack, "generic_saas");
  assert.equal(Array.isArray(context.qaValidation.artifactRequirements), true);
  assert.equal(Array.isArray(context.qaValidation.criterionResults), true);
  assert.equal("billingOutcome" in context.qaValidation, false);
});

test("Command Center and Build Room derive the same QA state from the same shared helper without UI-local defaults", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto QA Shared",
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
  const executionState = buildReleasedExecutionState(packet, "crypto-watchlist-shared-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "crypto-watchlist-shared-task",
    workerArtifactPayload: {
      uiValidated: true,
      acceptedCriteria: packet.acceptanceCriteria
    }
  });
  const commandCenterContext = buildQAContext(shared, packet, taskDetail, executionState);
  const buildRoomContext = buildQAContext(shared, packet, taskDetail, executionState);
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

  assert.deepEqual(commandCenterContext.qaValidation, buildRoomContext.qaValidation);
  assert.match(commandCenterPageSource, /projectBrief=\{projectIntelligence\.projectBrief\}/);
  assert.match(buildRoomPageSource, /projectBrief=\{projectIntelligence\.projectBrief\}/);
  assert.match(commandCenterComponentSource, /buildTaskQAValidationContext/);
  assert.match(buildRoomComponentSource, /buildTaskQAValidationContext/);
  assert.doesNotMatch(commandCenterComponentSource, /Ethereum and Solana|Toast connector|risk engine methodology/i);
  assert.doesNotMatch(buildRoomComponentSource, /Ethereum and Solana|Toast connector|risk engine methodology/i);
});

test("a task can be run-complete while QA is still not release-ready", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto QA Distinction",
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
  const executionState = buildReleasedExecutionState(packet, "crypto-watchlist-distinction-task");
  const taskDetail = buildTaskDetailFromPacket({
    shared,
    packet,
    buildRoomTaskId: "crypto-watchlist-distinction-task",
    taskStatus: "codex_complete",
    artifacts: [
      {
        id: "crypto-watchlist-distinction-task:codex-result",
        taskId: "crypto-watchlist-distinction-task",
        runId: "crypto-watchlist-distinction-task:codex-run",
        ownerId: "owner-id",
        artifactType: "codex_result",
        title: "Watchlist filtering Codex result",
        textContent: "Codex proposed the implementation, but no worker result exists yet.",
        payload: {
          acceptedCriteria: packet.acceptanceCriteria
        },
        createdAt: "2026-04-26T16:28:00.000Z"
      }
    ]
  });
  const context = buildQAContext(shared, packet, taskDetail, executionState);

  assert.equal(taskDetail.task.status, "codex_complete");
  assert.equal(context.qaValidation.completionReadiness.runFinished, true);
  assert.equal(context.qaValidation.releaseDecision.canPresentAsComplete, false);
  assert.equal(context.qaValidation.status, "awaiting_artifacts");
  assert.ok(
    context.qaValidation.blockers.some((blocker) =>
      /execution result artifact|user-facing evidence/i.test(blocker)
    )
  );
});
