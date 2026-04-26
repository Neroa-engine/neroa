import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildConversationSessionState } from "../lib/intelligence/conversation/index.ts";
import { generateArchitectureBlueprint } from "../lib/intelligence/architecture/index.ts";
import { generateRoadmapPlan } from "../lib/intelligence/roadmap/index.ts";
import {
  analyzeGovernanceDelta,
  buildGovernancePolicySummary,
  createRoadmapRevisionRecordFromDelta,
  generateGovernancePolicy,
  getGovernanceDomainDefaults,
  validateGovernanceDeltaReferences,
  validateGovernancePolicyReferences
} from "../lib/intelligence/governance/index.ts";
import {
  buildWorkspaceProjectIntelligence,
  generateProjectBrief
} from "../lib/intelligence/project-brief-generator.ts";
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

function buildGovernance(messages, projectName, projectDescription, projectMetadata = null) {
  const conversationBuild = buildConversationState(messages);
  const projectBrief = generateProjectBrief({
    projectName,
    projectDescription,
    conversationState: conversationBuild.state
  });
  const workspaceId = `workspace-${slugify(projectName)}`;
  const projectId = `project-${slugify(projectName)}`;
  const architectureBlueprint = generateArchitectureBlueprint({
    workspaceId,
    projectId,
    projectName,
    projectBrief
  });
  const roadmapPlan = generateRoadmapPlan({
    workspaceId,
    projectId,
    projectName,
    projectBrief,
    architectureBlueprint
  });
  const governancePolicy = generateGovernancePolicy({
    workspaceId,
    projectId,
    projectName,
    projectBrief,
    architectureBlueprint,
    roadmapPlan,
    projectMetadata
  });

  return {
    conversationBuild,
    projectBrief,
    architectureBlueprint,
    roadmapPlan,
    governancePolicy
  };
}

function buildSharedIntelligence(messages, projectName, projectDescription, governanceState = null) {
  const conversationBuild = buildConversationState(messages);
  const projectMetadata = buildStoredProjectMetadata({
    title: projectName,
    description: projectDescription,
    conversationState: conversationBuild.state,
    governanceState
  });
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: `workspace-${slugify(projectName)}`,
    projectId: `project-${slugify(projectName)}`,
    projectTitle: projectName,
    projectDescription,
    projectMetadata
  });

  return {
    conversationBuild,
    projectMetadata,
    projectIntelligence
  };
}

function buildDelta(governanceBundle, request) {
  return analyzeGovernanceDelta({
    request,
    projectBrief: governanceBundle.projectBrief,
    architectureBlueprint: governanceBundle.architectureBlueprint,
    roadmapPlan: governanceBundle.roadmapPlan,
    governancePolicy: governanceBundle.governancePolicy,
    defaults: getGovernanceDomainDefaults(governanceBundle.governancePolicy.domainPack)
  });
}

test("crypto governance generation produces checklist blockers, billing protection, and roadmap-revision delta routing", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const governanceBundle = buildGovernance(
    messages,
    "Tom Crypto Risk",
    messages.join(" ")
  );
  const delta = buildDelta(governanceBundle, "Add wallet portfolio import to MVP");
  const deltaValidation = validateGovernanceDeltaReferences({
    deltaAnalysis: delta,
    architectureBlueprint: governanceBundle.architectureBlueprint,
    roadmapPlan: governanceBundle.roadmapPlan
  });
  const policyValidation = validateGovernancePolicyReferences({
    governancePolicy: governanceBundle.governancePolicy,
    architectureBlueprint: governanceBundle.architectureBlueprint,
    roadmapPlan: governanceBundle.roadmapPlan
  });

  assert.equal(governanceBundle.governancePolicy.domainPack, "crypto_analytics");
  assert.ok(governanceBundle.governancePolicy.approvalChecklist.length > 0);
  assert.equal(governanceBundle.governancePolicy.approvalReadiness.status, "not_ready");
  assert.equal(governanceBundle.governancePolicy.hardGuards.noExecutionBeforeApproval, true);
  assert.equal(governanceBundle.governancePolicy.hardGuards.noSilentScopeExpansion, true);
  assert.ok(
    governanceBundle.governancePolicy.approvalReadiness.blockers.some((blocker) =>
      /supported chains|wallet connection|analytics-only vs advice-adjacent|scoring inputs/i.test(
        blocker
      )
    )
  );
  assert.ok(
    governanceBundle.governancePolicy.billingProtection.nonBillableFailureClasses.includes(
      "planner_loop"
    )
  );
  assert.ok(
    governanceBundle.governancePolicy.billingProtection.nonBillableFailureClasses.includes(
      "provider_ingestion_failure"
    )
  );
  assert.equal(
    governanceBundle.governancePolicy.billingProtection.systemFailuresDoNotAdvanceBilling,
    true
  );
  assert.equal(delta.requestClass, "scope_expansion");
  assert.equal(delta.outcome, "roadmap_revision_required");
  assert.equal(delta.requiresRoadmapRevision, true);
  assert.equal(delta.requiresArchitectureRevision, false);
  assert.equal(delta.shouldSaveAsPendingExecution, true);
  assert.equal(delta.suggestedNextSurface, "strategy_room");
  assert.match(
    buildGovernancePolicySummary(governanceBundle.governancePolicy).headline,
    /Not ready|Draft governance/i
  );
  assert.deepEqual(deltaValidation.unknownLaneIds, []);
  assert.deepEqual(deltaValidation.unknownModuleIds, []);
  assert.deepEqual(deltaValidation.unknownPhaseIds, []);
  assert.deepEqual(policyValidation.unknownLaneRuleLaneIds, []);
  assert.deepEqual(policyValidation.unknownChecklistPhaseIds, []);
  assert.deepEqual(policyValidation.unknownRiskPhaseIds, []);
  assert.deepEqual(policyValidation.unknownRiskModuleIds, []);
  assert.deepEqual(policyValidation.unknownApprovalBlockerIds, []);
});

test("restaurant governance generation keeps connector and launch-scope blockers open and routes connector expansion into roadmap revision", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const governanceBundle = buildGovernance(
    messages,
    "Restaurant Reporting",
    messages.join(" ")
  );
  const delta = buildDelta(governanceBundle, "Add a second POS connector to MVP");
  const deltaValidation = validateGovernanceDeltaReferences({
    deltaAnalysis: delta,
    architectureBlueprint: governanceBundle.architectureBlueprint,
    roadmapPlan: governanceBundle.roadmapPlan
  });

  assert.equal(governanceBundle.governancePolicy.domainPack, "restaurant_sales");
  assert.ok(governanceBundle.governancePolicy.approvalChecklist.length > 0);
  assert.equal(governanceBundle.governancePolicy.approvalReadiness.status, "not_ready");
  assert.ok(
    governanceBundle.governancePolicy.approvalReadiness.blockers.some((blocker) =>
      /first pos connector|multi-location depth|staff-workflow expansion|launch report/i.test(
        blocker
      )
    )
  );
  assert.ok(
    governanceBundle.governancePolicy.billingProtection.nonBillableFailureClasses.includes(
      "connector_sync_failure"
    )
  );
  assert.equal(delta.requestClass, "scope_expansion");
  assert.equal(delta.outcome, "roadmap_revision_required");
  assert.equal(delta.requiresRoadmapRevision, true);
  assert.equal(delta.requiresArchitectureRevision, false);
  assert.ok(delta.affectedLaneIds.includes("connectors"));
  assert.ok(delta.affectedPhaseIds.includes("phase_2_connector_flow"));
  assert.deepEqual(deltaValidation.unknownLaneIds, []);
  assert.deepEqual(deltaValidation.unknownModuleIds, []);
  assert.deepEqual(deltaValidation.unknownPhaseIds, []);
});

test("generic fallback governance still generates cleanly and can classify architecture expansion without execution-packet spillover", () => {
  const governanceBundle = buildGovernance(
    ["I want to build a workflow SaaS for consultants."],
    "Consultant Workflow",
    "Workflow SaaS for consultants."
  );
  const delta = buildDelta(
    governanceBundle,
    "Add a public API for partner integrations"
  );
  const deltaValidation = validateGovernanceDeltaReferences({
    deltaAnalysis: delta,
    architectureBlueprint: governanceBundle.architectureBlueprint,
    roadmapPlan: governanceBundle.roadmapPlan
  });

  assert.equal(governanceBundle.governancePolicy.domainPack, "generic_saas");
  assert.ok(governanceBundle.governancePolicy.approvalChecklist.length > 0);
  assert.equal(Array.isArray(governanceBundle.governancePolicy.governanceRisks), true);
  assert.equal(delta.requestClass, "architecture_expansion");
  assert.equal(delta.outcome, "architecture_revision_required");
  assert.equal(delta.requiresArchitectureRevision, true);
  assert.equal(delta.requiresRoadmapRevision, true);
  assert.deepEqual(deltaValidation.unknownLaneIds, []);
  assert.deepEqual(deltaValidation.unknownModuleIds, []);
  assert.deepEqual(deltaValidation.unknownPhaseIds, []);
  assert.equal("executionPackets" in governanceBundle.governancePolicy, false);
});

test("strategy room and command center read the same shared governance source without UI-local domain defaults", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const { projectIntelligence } = buildSharedIntelligence(
    messages,
    "Tom Crypto Risk",
    "Crypto analytics website with a risk engine for pre-sales."
  );
  const commandCenterPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/command-center/page.tsx", import.meta.url),
    "utf8"
  );
  const strategyRoomPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/strategy-room/page.tsx", import.meta.url),
    "utf8"
  );
  const commandCenterComponentSource = readFileSync(
    new URL("../components/workspace/project-command-center-v1.tsx", import.meta.url),
    "utf8"
  );
  const strategyRoomComponentSource = readFileSync(
    new URL("../components/workspace/project-strategy-room-v1.tsx", import.meta.url),
    "utf8"
  );

  assert.equal(
    projectIntelligence.governancePolicy.sourceRoadmapPlanRef,
    projectIntelligence.roadmapPlan.roadmapId
  );
  assert.equal(
    projectIntelligence.governancePolicy.sourceArchitectureBlueprintRef,
    projectIntelligence.roadmapPlan.sourceArchitectureBlueprintRef
  );
  assert.match(commandCenterPageSource, /governancePolicy:\s*projectIntelligence\.governancePolicy/);
  assert.match(strategyRoomPageSource, /governancePolicy=\{projectIntelligence\.governancePolicy\}/);
  assert.doesNotMatch(
    commandCenterPageSource,
    /wallet connection boundary is explicitly approved|first POS connector is explicitly chosen/i
  );
  assert.doesNotMatch(
    strategyRoomPageSource,
    /wallet connection boundary is explicitly approved|first POS connector is explicitly chosen/i
  );
  assert.doesNotMatch(
    commandCenterComponentSource,
    /wallet connection boundary is explicitly approved|first POS connector is explicitly chosen|skip approval/i
  );
  assert.doesNotMatch(
    strategyRoomComponentSource,
    /wallet connection boundary is explicitly approved|first POS connector is explicitly chosen|skip approval/i
  );
});

test("delta analysis stays deterministic and keeps pre-approval requests in pending execution until approval is complete", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const governanceBundle = buildGovernance(
    messages,
    "Restaurant Reporting",
    messages.join(" ")
  );
  const firstDelta = buildDelta(governanceBundle, "Rename dashboard labels");
  const secondDelta = buildDelta(governanceBundle, "Rename dashboard labels");
  const deltaValidation = validateGovernanceDeltaReferences({
    deltaAnalysis: firstDelta,
    architectureBlueprint: governanceBundle.architectureBlueprint,
    roadmapPlan: governanceBundle.roadmapPlan
  });
  const policyValidation = validateGovernancePolicyReferences({
    governancePolicy: governanceBundle.governancePolicy,
    architectureBlueprint: governanceBundle.architectureBlueprint,
    roadmapPlan: governanceBundle.roadmapPlan
  });

  assert.deepEqual(firstDelta, secondDelta);
  assert.equal(firstDelta.requestClass, "pre_approval_request");
  assert.equal(firstDelta.outcome, "pending_execution");
  assert.equal(firstDelta.shouldSaveAsPendingExecution, true);
  assert.equal(firstDelta.requiresRoadmapRevision, false);
  assert.equal(firstDelta.requiresArchitectureRevision, false);
  assert.equal(firstDelta.suggestedNextSurface, "strategy_room");
  assert.deepEqual(deltaValidation.unknownLaneIds, []);
  assert.deepEqual(deltaValidation.unknownModuleIds, []);
  assert.deepEqual(deltaValidation.unknownPhaseIds, []);
  assert.deepEqual(policyValidation.unknownApprovalBlockerIds, []);
});

test("approval readiness moves from not ready to review ready to approval ready, while scope stays unapproved until an approval record exists", () => {
  const unresolvedCrypto = buildGovernance(
    [
      "Hi, my name is Tom.",
      "I want to build a crypto analytics website with a risk engine for pre-sales.",
      "Crypto investors are my main customer."
    ],
    "Tom Crypto Risk",
    "Crypto analytics website with a risk engine for pre-sales."
  );
  const reviewReadyGeneric = buildGovernance(
    [
      "I want to build a workflow SaaS for consultants.",
      "Consulting firms are the buyer.",
      "The core problem is scattered client work.",
      "It must have task tracking, project spaces, and client updates."
    ],
    "Consultant Workflow",
    "Workflow SaaS for consultants."
  );
  const approvalReadyCrypto = buildGovernance(
    [
      "Hi, my name is Tom.",
      "I want to build a crypto analytics website with a risk engine for pre-sales.",
      "Crypto investors are my main customer.",
      "Start with Ethereum and Solana.",
      "No wallet connection in the MVP.",
      "Keep it analytics-only, not advice.",
      "Use on-chain activity, liquidity, audits, and holder concentration for the score."
    ],
    "Tom Crypto Risk",
    [
      "Hi, my name is Tom.",
      "I want to build a crypto analytics website with a risk engine for pre-sales.",
      "Crypto investors are my main customer.",
      "Start with Ethereum and Solana.",
      "No wallet connection in the MVP.",
      "Keep it analytics-only, not advice.",
      "Use on-chain activity, liquidity, audits, and holder concentration for the score."
    ].join(" ")
  );

  assert.equal(unresolvedCrypto.governancePolicy.approvalReadiness.status, "not_ready");
  assert.equal(reviewReadyGeneric.governancePolicy.approvalReadiness.status, "review_ready");
  assert.equal(reviewReadyGeneric.governancePolicy.approvalReadiness.approvalAllowed, false);
  assert.equal(approvalReadyCrypto.governancePolicy.approvalReadiness.status, "approval_ready");
  assert.equal(approvalReadyCrypto.governancePolicy.approvalReadiness.approvalAllowed, true);
  assert.equal(approvalReadyCrypto.governancePolicy.currentApprovalState.status, "approval_ready");
  assert.equal(
    approvalReadyCrypto.governancePolicy.currentApprovalState.roadmapScopeApproved,
    false
  );
});

test("revision metadata resets prior approval through the shared governance metadata path", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer.",
    "Start with Ethereum and Solana.",
    "No wallet connection in the MVP.",
    "Keep it analytics-only, not advice.",
    "Use on-chain activity, liquidity, audits, and holder concentration for the score."
  ];
  const description =
    "Crypto analytics website for crypto investors. Ethereum and Solana first. No wallet connection in the MVP. Analytics only, not advice.";
  const base = buildGovernance(messages, "Tom Crypto Risk", description);

  assert.ok(base.governancePolicy.scopeApprovalRecord);

  const approvedScopeApprovalRecord = {
    ...base.governancePolicy.scopeApprovalRecord,
    status: "approved",
    approvedAt: "2026-04-26T00:00:00.000Z",
    approvedBy: "founder@example.com",
    unresolvedBlockerIds: []
  };
  const approvedShared = buildSharedIntelligence(messages, "Tom Crypto Risk", description, {
    scopeApprovalRecord: approvedScopeApprovalRecord,
    roadmapRevisionRecords: []
  });
  const approvedDelta = analyzeGovernanceDelta({
    request: "Add wallet portfolio import to MVP",
    projectBrief: approvedShared.projectIntelligence.projectBrief,
    architectureBlueprint: approvedShared.projectIntelligence.architectureBlueprint,
    roadmapPlan: approvedShared.projectIntelligence.roadmapPlan,
    governancePolicy: approvedShared.projectIntelligence.governancePolicy,
    defaults: getGovernanceDomainDefaults(approvedShared.projectIntelligence.governancePolicy.domainPack)
  });
  const revisionRecord = createRoadmapRevisionRecordFromDelta({
    governancePolicy: approvedShared.projectIntelligence.governancePolicy,
    deltaAnalysis: approvedDelta,
    triggeredBy: "founder@example.com"
  });

  assert.equal(approvedShared.projectIntelligence.governancePolicy.currentApprovalState.status, "approved");
  assert.equal(approvedShared.projectIntelligence.governancePolicy.currentApprovalState.roadmapScopeApproved, true);
  assert.ok(revisionRecord);
  assert.equal(revisionRecord.requiresApprovalReset, true);
  assert.equal(revisionRecord.status, "pending_review");

  const revisedShared = buildSharedIntelligence(messages, "Tom Crypto Risk", description, {
    scopeApprovalRecord: approvedScopeApprovalRecord,
    roadmapRevisionRecords: [revisionRecord]
  });

  assert.equal(revisedShared.projectIntelligence.governancePolicy.currentApprovalState.status, "revision_required");
  assert.equal(
    revisedShared.projectIntelligence.governancePolicy.currentApprovalState.roadmapScopeApproved,
    false
  );
  assert.equal(
    revisedShared.projectIntelligence.governancePolicy.scopeApprovalRecord?.status,
    "superseded"
  );
  assert.equal(
    revisedShared.projectIntelligence.governancePolicy.scopeApprovalRecord?.supersededByRevisionId,
    revisionRecord.revisionId
  );
  assert.equal(
    revisedShared.projectIntelligence.governancePolicy.roadmapRevisionRecords[0]?.revisionId,
    revisionRecord.revisionId
  );
});
