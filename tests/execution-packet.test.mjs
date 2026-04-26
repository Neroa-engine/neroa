import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildConversationSessionState } from "../lib/intelligence/conversation/index.ts";
import { scopeApprovalRecordSchema } from "../lib/intelligence/governance/index.ts";
import {
  applyPendingExecutionHold,
  applyPendingExecutionRelease,
  buildExecutionStateSummary,
  buildPendingExecutionItem,
  generateExecutionPacket
} from "../lib/intelligence/execution/index.ts";
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

test("crypto execution packet generation maps approved watchlist work into the existing Build Room payload", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto Risk",
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

  assert.equal(packet.domainPack, "crypto_analytics");
  assert.equal(packet.scopeDecision.outcome, "execution_ready_after_gate");
  assert.equal(packet.scopeDecision.withinApprovedScope, true);
  assert.equal(packet.readiness.status, "ready_for_build_room");
  assert.equal(packet.readiness.releaseAllowed, true);
  assert.equal(packet.readiness.relayAllowed, true);
  assert.equal(packet.status, "ready_for_build_room");
  assert.ok(packet.laneIds.includes("product_web"));
  assert.ok(
    packet.moduleIds.some((moduleId) =>
      ["search_filter", "investor_dashboard"].includes(moduleId)
    )
  );
  assert.ok(packet.phaseIds.includes("phase_3_investor_mvp"));
  assert.ok(packet.acceptanceCriteria.length > 0);
  assert.equal(packet.workerApprovalRequired, true);
  assert.equal(packet.buildRoomMapping.buildRoomTaskType, "implementation");
  assert.match(packet.buildRoomTaskPayload.userRequest, /Governed scope context:/i);
});

test("crypto out-of-scope wallet import stays non-runnable and remains pending execution", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto Risk",
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
  const packet = buildExecutionPacketForRequest(shared, "Add wallet portfolio import to MVP");
  const pendingItem = buildPendingExecutionItem({
    pendingExecutionId: "pending-wallet-import",
    commandCenterTaskId: "command-task-wallet-import",
    buildRoomTaskId: "build-task-wallet-import",
    title: "Add wallet portfolio import to MVP",
    request: "Add wallet portfolio import to MVP",
    roadmapArea: "Investor MVP",
    laneSlug: null,
    taskType: "implementation",
    requestedOutputMode: "patch_proposal",
    acceptanceCriteria: [],
    riskLevel: "high",
    createdAt: "2026-04-26T16:05:00.000Z"
  });
  const held = applyPendingExecutionHold({
    executionState: null,
    pendingItem,
    packet,
    now: "2026-04-26T16:06:00.000Z"
  });

  assert.equal(packet.scopeDecision.withinApprovedScope, false);
  assert.equal(packet.readiness.releaseAllowed, false);
  assert.equal(packet.readiness.relayAllowed, false);
  assert.ok(
    packet.scopeDecision.requiresArchitectureRevision || packet.scopeDecision.requiresRoadmapRevision
  );
  assert.equal(packet.status, "revision_required");
  assert.equal(held.result.packetCreated, false);
  assert.equal(held.result.executionReady, false);
  assert.equal(held.result.pendingExecutionReleased, false);
  assert.equal(held.pendingItem.status, "revision_required");
  assert.equal(held.pendingItem.latestScopeOutcome, packet.scopeDecision.outcome);
});

test("restaurant execution packet generation maps approved connector work into restaurant lanes and phases", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Restaurant Reporting",
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

  assert.equal(packet.domainPack, "restaurant_sales");
  assert.equal(packet.scopeDecision.outcome, "execution_ready_after_gate");
  assert.equal(packet.scopeDecision.withinApprovedScope, true);
  assert.equal(packet.readiness.releaseAllowed, true);
  assert.ok(packet.laneIds.includes("connectors"));
  assert.ok(
    packet.moduleIds.some((moduleId) =>
      ["pos_connector_layer", "connector_health", "admin_reporting_console"].includes(moduleId)
    )
  );
  assert.ok(
    packet.phaseIds.some((phaseId) =>
      ["phase_2_connector_flow", "phase_4_admin_and_multi_location"].includes(phaseId)
    )
  );
  assert.equal(packet.buildRoomMapping.buildRoomTaskType, "implementation");
  assert.equal(packet.buildRoomTaskPayload.riskLevel, "medium");
});

test("pending execution release turns a previously held request into a released packet once approval is restored", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const revisionPatch = {
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
  };
  const preApprovalShared = buildSharedIntelligence({
    messages,
    projectName: "Restaurant Reporting Release",
    projectDescription: messages.join(" "),
    patch: revisionPatch,
    approved: false
  });
  const preApprovalPacket = buildExecutionPacketForRequest(
    preApprovalShared,
    "Implement Toast connector sync status panel"
  );
  const pendingItem = buildPendingExecutionItem({
    pendingExecutionId: "pending-toast-sync",
    commandCenterTaskId: "command-task-toast-sync",
    buildRoomTaskId: "build-task-toast-sync",
    title: "Implement Toast connector sync status panel",
    request: "Implement Toast connector sync status panel",
    roadmapArea: "Connector MVP",
    laneSlug: null,
    taskType: "implementation",
    requestedOutputMode: "patch_proposal",
    acceptanceCriteria: ["Show connector sync status for the first approved POS connector."],
    riskLevel: "medium",
    createdAt: "2026-04-26T16:10:00.000Z"
  });
  const held = applyPendingExecutionHold({
    executionState: null,
    pendingItem,
    packet: preApprovalPacket,
    now: "2026-04-26T16:11:00.000Z"
  });
  const approvedShared = buildSharedIntelligence({
    messages,
    projectName: "Restaurant Reporting Release",
    projectDescription: messages.join(" "),
    patch: revisionPatch,
    approved: true
  });
  const approvedPacket = buildExecutionPacketForRequest(
    approvedShared,
    "Implement Toast connector sync status panel"
  );
  const released = applyPendingExecutionRelease({
    executionState: held.executionState,
    pendingItem: held.pendingItem,
    packet: approvedPacket,
    buildRoomTaskId: "build-task-toast-sync",
    now: "2026-04-26T16:20:00.000Z",
    buildRoomTaskCreated: false
  });
  const summary = buildExecutionStateSummary(released.executionState);

  assert.equal(preApprovalPacket.readiness.releaseAllowed, false);
  assert.equal(approvedPacket.readiness.releaseAllowed, true);
  assert.equal(released.result.packetCreated, true);
  assert.equal(released.result.executionReady, true);
  assert.equal(released.result.pendingExecutionReleased, true);
  assert.equal(released.pendingItem.status, "released");
  assert.equal(summary.pendingCount, 0);
  assert.equal(summary.releasedCount, 1);
  assert.equal(released.summary.buildRoomTaskId, "build-task-toast-sync");
});

test("generic fallback execution packet still generates cleanly from the shared intelligence spine", () => {
  const messages = [
    "I want to build a workflow SaaS for consultants with a customer web app."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Consultant Workflow",
    projectDescription: messages.join(" "),
    approved: true
  });
  const packet = buildExecutionPacketForRequest(
    shared,
    "Implement workflow search filters for consultant workspaces"
  );

  assert.equal(packet.domainPack, "generic_saas");
  assert.equal(packet.requestClass, "execution_oriented");
  assert.ok(Array.isArray(packet.laneIds));
  assert.ok(Array.isArray(packet.moduleIds));
  assert.ok(Array.isArray(packet.phaseIds));
  assert.equal("qaArtifactGate" in packet, false);
  assert.equal("billingOutcome" in packet, false);
});

test("Command Center and Build Room read the same execution state source without UI-local execution defaults", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const shared = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto Risk Shared",
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
  const pendingItem = buildPendingExecutionItem({
    pendingExecutionId: "pending-watchlist-filter",
    commandCenterTaskId: "command-task-watchlist-filter",
    buildRoomTaskId: "build-task-watchlist-filter",
    title: "Implement project profiles, search and filter views",
    request: "Implement project profiles, search and filter views",
    roadmapArea: "Investor MVP",
    laneSlug: null,
    taskType: "implementation",
    requestedOutputMode: "patch_proposal",
    acceptanceCriteria: packet.acceptanceCriteria,
    riskLevel: "medium",
    createdAt: "2026-04-26T16:25:00.000Z"
  });
  const released = applyPendingExecutionRelease({
    executionState: null,
    pendingItem,
    packet,
    buildRoomTaskId: "build-task-watchlist-filter",
    now: "2026-04-26T16:26:00.000Z",
    buildRoomTaskCreated: true
  });
  const metadata = buildStoredProjectMetadata({
    title: "Tom Crypto Risk Shared",
    description: messages.join(" "),
    conversationState: shared.projectMetadata.conversationState,
    strategyState: shared.projectMetadata.strategyState,
    governanceState: shared.projectMetadata.governanceState,
    executionState: released.executionState
  });
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: "workspace-tom-crypto-risk-shared",
    projectId: "project-tom-crypto-risk-shared",
    projectTitle: "Tom Crypto Risk Shared",
    projectDescription: messages.join(" "),
    projectMetadata: metadata
  });
  const commandCenterPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/command-center/page.tsx", import.meta.url),
    "utf8"
  );
  const buildRoomPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/build-room/page.tsx", import.meta.url),
    "utf8"
  );
  const commandCenterComponentSource = readFileSync(
    new URL("../components/workspace/project-command-center-v1.tsx", import.meta.url),
    "utf8"
  );
  const commandCenterExecutionPanelSource = readFileSync(
    new URL("../components/workspace/command-center-build-room-execution-panel.tsx", import.meta.url),
    "utf8"
  );
  const buildRoomControlRoomSource = readFileSync(
    new URL("../components/workspace/build-room-control-room.tsx", import.meta.url),
    "utf8"
  );
  const commandCenterActionsSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/command-center/actions.ts", import.meta.url),
    "utf8"
  );

  assert.equal(projectIntelligence.executionState.executionPackets[0].buildRoomTaskId, "build-task-watchlist-filter");
  assert.match(commandCenterPageSource, /executionState=\{projectIntelligence\.executionState\}/);
  assert.match(buildRoomPageSource, /executionState=\{projectIntelligence\.executionState\}/);
  assert.match(commandCenterComponentSource, /initialExecutionState=\{executionState\}/);
  assert.match(commandCenterExecutionPanelSource, /submitCommandCenterExecutionRequest/);
  assert.match(commandCenterExecutionPanelSource, /releaseEligiblePendingExecutionRequests/);
  assert.match(commandCenterActionsSource, /generateExecutionPacket/);
  assert.match(commandCenterActionsSource, /submitBuildRoomTaskToCodex/);
  assert.doesNotMatch(commandCenterExecutionPanelSource, /crypto_analytics|restaurant_sales|risk_engine|pos_connector_layer/);
  assert.doesNotMatch(buildRoomControlRoomSource, /crypto_analytics|restaurant_sales|risk_engine|pos_connector_layer/);
});
