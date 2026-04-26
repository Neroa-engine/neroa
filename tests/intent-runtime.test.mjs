import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildConversationSessionState } from "../lib/intelligence/conversation/index.ts";
import {
  scopeApprovalRecordSchema
} from "../lib/intelligence/governance/index.ts";
import { buildWorkspaceProjectIntelligence } from "../lib/intelligence/project-brief-generator.ts";
import {
  createStrategyRevisionPersistenceUpdate
} from "../lib/intelligence/revisions/index.ts";
import {
  blockerQueueEntrySchema,
  buildBlockerQuestionState,
  buildBlockerRuntimeState,
  evaluateBlockerCompletion,
  extractStructuredAnswerForBlocker,
  getActiveBlockerEntry
} from "../lib/intent-library/index.ts";
import { createPlanningChatPersistenceUpdate } from "../lib/start/planning-persistence.ts";
import { runPlanningChat } from "../lib/start/planning-chat.ts";
import {
  buildStoredProjectMetadata
} from "../lib/workspace/project-metadata.ts";

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
  const projectMetadata = buildStoredProjectMetadata({
    title: args.projectName,
    description: args.projectDescription,
    conversationState: conversationBuild.state,
    governanceState: args.governanceState ?? null,
    strategyState: args.strategyState ?? null
  });
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: `workspace-${slugify(args.projectName)}`,
    projectId: `project-${slugify(args.projectName)}`,
    projectTitle: args.projectName,
    projectDescription: args.projectDescription,
    projectMetadata
  });

  return {
    conversationBuild,
    projectMetadata,
    projectIntelligence
  };
}

function persistStrategyRevision(args) {
  const base = buildSharedIntelligence(args);
  const update = createStrategyRevisionPersistenceUpdate({
    workspaceId: `workspace-${slugify(args.projectName)}`,
    projectId: `project-${slugify(args.projectName)}`,
    projectName: args.projectName,
    projectMetadata: base.projectMetadata,
    projectBrief: base.projectIntelligence.projectBrief,
    architectureBlueprint: base.projectIntelligence.architectureBlueprint,
    roadmapPlan: base.projectIntelligence.roadmapPlan,
    governancePolicy: base.projectIntelligence.governancePolicy,
    patch: args.patch,
    createdAt: args.createdAt ?? "2026-04-26T12:00:00.000Z",
    createdBy: "owner@example.com"
  });
  const persistedMetadata = buildStoredProjectMetadata({
    title: args.projectName,
    description: args.projectDescription,
    conversationState: base.projectMetadata.conversationState,
    governanceState: update.governanceState,
    strategyState: update.strategyState
  });
  const hydratedIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: `workspace-${slugify(args.projectName)}`,
    projectId: `project-${slugify(args.projectName)}`,
    projectTitle: args.projectName,
    projectDescription: args.projectDescription,
    projectMetadata: persistedMetadata
  });

  return {
    base,
    update,
    persistedMetadata,
    hydratedIntelligence
  };
}

const CRYPTO_MESSAGES = [
  "Hi, my name is Tom.",
  "I want to build a crypto analytics website with a risk engine for pre-sales.",
  "Crypto investors are my main customer."
];

test("runtime queue generation dedupes unresolved shared intelligence and skips already-known starter blockers", () => {
  const base = buildSharedIntelligence({
    messages: CRYPTO_MESSAGES,
    projectName: "Tom Crypto Risk",
    projectDescription: CRYPTO_MESSAGES.join(" ")
  });
  const runtimeState = buildBlockerRuntimeState({
    projectMetadata: base.projectMetadata,
    projectBrief: base.projectIntelligence.projectBrief,
    architectureBlueprint: base.projectIntelligence.architectureBlueprint,
    roadmapPlan: base.projectIntelligence.roadmapPlan,
    governancePolicy: base.projectIntelligence.governancePolicy
  });
  const blockerIds = runtimeState.queue.entries.map((entry) => entry.blockerId);

  assert.equal(blockerIds.includes("founder_name"), false);
  assert.equal(blockerIds.includes("project_direction"), false);
  assert.equal(blockerIds.includes("chains_in_scope"), true);
  assert.equal(blockerIds.includes("wallet_boundary"), true);
  assert.equal(new Set(blockerIds).size, blockerIds.length);
});

test("runtime selects the first approval-critical blocker and plans the question deterministically", () => {
  const base = buildSharedIntelligence({
    messages: CRYPTO_MESSAGES,
    projectName: "Tom Crypto Risk",
    projectDescription: CRYPTO_MESSAGES.join(" ")
  });
  const runtimeState = buildBlockerRuntimeState({
    projectMetadata: base.projectMetadata,
    projectBrief: base.projectIntelligence.projectBrief,
    architectureBlueprint: base.projectIntelligence.architectureBlueprint,
    roadmapPlan: base.projectIntelligence.roadmapPlan,
    governancePolicy: base.projectIntelligence.governancePolicy
  });
  const activeEntry = getActiveBlockerEntry(runtimeState);
  const firstApprovalCritical = runtimeState.queue.entries.find(
    (entry) => entry.priority === "approval_critical" && entry.canAskNow
  );

  assert.ok(activeEntry);
  assert.ok(firstApprovalCritical);
  assert.equal(activeEntry.blockerId, firstApprovalCritical.blockerId);
  assert.equal(runtimeState.currentQuestionPlan?.blockerId, activeEntry.blockerId);
  assert.match(runtimeState.currentHelperText ?? "", /Answer in chat/i);
});

test("runtime completion logic keeps a provider blocker in clarification state after a safe partial answer", async () => {
  const blockerState = buildBlockerQuestionState({
    blockerId: "integrations",
    inputId: "integrations",
    slotId: "integrations",
    label: "Integrations",
    question: "Which integrations need to be in scope?",
    source: "governance"
  });
  const entry = blockerQueueEntrySchema.parse({
    blockerId: "integrations",
    label: "Integrations",
    inputId: "integrations",
    status: "active",
    priority: "approval_critical",
    sourceLayer: "governance",
    reason: "Launch integrations are still unresolved.",
    requiredForApproval: true,
    requiredForArchitecture: false,
    requiredForRoadmap: true,
    currentQuestionText: "Which integrations need to be in scope?",
    completionCriteriaSummary: "Integration list or explicit no-integration boundary captured.",
    unresolvedFields: ["integrations"],
    relatedWriteTargets: ["projectBrief.integrations", "projectBrief.constraints"],
    dependsOnBlockerIds: ["project_direction"],
    canAskNow: true,
    deferReason: null,
    currentValue: null
  });
  const extractionResult = await extractStructuredAnswerForBlocker({
    blockerState,
    rawAnswer: "CoinMarketCap"
  });
  const completion = evaluateBlockerCompletion({
    entry,
    extractionResult
  });

  assert.equal(extractionResult.status, "parsed");
  assert.equal(extractionResult.normalizedAnswer?.providers?.[0]?.canonicalId, "coinmarketcap_api");
  assert.equal(completion.decision.outcome, "blocker_partially_resolved");
  assert.equal(completion.decision.shouldReask, true);
  assert.match(completion.clarificationPlan?.prompt ?? "", /day one, later, or just a likely option/i);
});

test("runtime resolves a completed blocker and advances to the next deterministic question", async () => {
  const projectName = "Crypto Wallet Scope";
  const projectDescription = CRYPTO_MESSAGES.join(" ");
  const workspaceId = `workspace-${slugify(projectName)}`;
  const projectId = `project-${slugify(projectName)}`;
  const base = persistStrategyRevision({
    messages: CRYPTO_MESSAGES,
    projectName,
    projectDescription,
    patch: {
      answeredInputs: [
        {
          inputId: "chainsInScope",
          value: "Ethereum and Solana"
        }
      ]
    }
  });
  const forcedRuntimeState = buildBlockerRuntimeState({
    projectMetadata: base.persistedMetadata,
    projectBrief: base.hydratedIntelligence.projectBrief,
    architectureBlueprint: base.hydratedIntelligence.architectureBlueprint,
    roadmapPlan: base.hydratedIntelligence.roadmapPlan,
    governancePolicy: base.hydratedIntelligence.governancePolicy,
    forceActiveBlockerId: "wallet_boundary"
  });
  const chatResult = await runPlanningChat({
    threadId: "intent-runtime-wallet-boundary",
    lane: "managed",
    title: projectName,
    summary: projectDescription,
    messages: CRYPTO_MESSAGES.map((message, index) => buildUserMessage(`u${index + 1}`, message)),
    message: "not in MVP",
    conversationState: base.persistedMetadata.conversationState,
    existingProjectContext: true
  });
  const persistenceUpdate = await createPlanningChatPersistenceUpdate({
    workspaceId,
    projectId,
    projectName,
    projectMetadata: base.persistedMetadata,
    previousIntelligence: base.hydratedIntelligence,
    threadState: {
      ...chatResult.threadState,
      runtimeState: forcedRuntimeState
    },
    latestUserMessage: "not in MVP",
    createdAt: "2026-04-26T15:05:00.000Z",
    createdBy: "owner@example.com"
  });

  assert.equal(persistenceUpdate.intentResult?.status, "parsed");
  assert.equal(
    persistenceUpdate.transitionResult?.completionDecision.outcome,
    "blocker_resolved"
  );
  assert.notEqual(
    persistenceUpdate.updatedThreadState.runtimeState?.activeBlockerId,
    "wallet_boundary"
  );
  assert.equal(
    persistenceUpdate.patch.answeredInputs?.some(
      (item) => item.inputId === "walletConnectionMvp" && /not in mvp/i.test(item.value)
    ),
    true
  );
  assert.notEqual(
    persistenceUpdate.updatedThreadState.messages.at(-1)?.content,
    "Is wallet connection in MVP or post-MVP?"
  );
});

test("runtime marks dependency-bound blockers as deferred until prerequisites are resolved", () => {
  const base = buildSharedIntelligence({
    messages: CRYPTO_MESSAGES,
    projectName: "Tom Crypto Risk",
    projectDescription: CRYPTO_MESSAGES.join(" ")
  });
  const runtimeState = buildBlockerRuntimeState({
    projectMetadata: base.projectMetadata,
    projectBrief: base.projectIntelligence.projectBrief,
    architectureBlueprint: base.projectIntelligence.architectureBlueprint,
    roadmapPlan: base.projectIntelligence.roadmapPlan,
    governancePolicy: base.projectIntelligence.governancePolicy
  });
  const scoringInputsEntry = runtimeState.queue.entries.find(
    (entry) => entry.blockerId === "scoring_inputs"
  );

  assert.ok(scoringInputsEntry);
  assert.equal(scoringInputsEntry.canAskNow, false);
  assert.equal(scoringInputsEntry.status, "deferred");
  assert.ok(scoringInputsEntry.dependsOnBlockerIds.includes("analytics_vs_advice_posture"));
});

test("material revisions reopen only the affected blockers in the runtime queue", () => {
  const projectName = "Approved Crypto Runtime";
  const projectDescription = CRYPTO_MESSAGES.join(" ");
  const approvedBase = buildSharedIntelligence({
    messages: CRYPTO_MESSAGES,
    projectName,
    projectDescription,
    governanceState: {
      scopeApprovalRecord: scopeApprovalRecordSchema.parse({
        approvalRecordId: "approved-crypto-runtime:scope-approval",
        sourceRoadmapPlanId: "workspace-approved-crypto-runtime:project-approved-crypto-runtime:roadmap-plan",
        sourceGovernancePolicyId:
          "workspace-approved-crypto-runtime:project-approved-crypto-runtime:governance-policy",
        status: "approved",
        approvedAt: "2026-04-26T09:00:00.000Z",
        approvedBy: "owner@example.com",
        unresolvedBlockerIds: [],
        supersededByRevisionId: null
      }),
      roadmapRevisionRecords: []
    }
  });
  const update = createStrategyRevisionPersistenceUpdate({
    workspaceId: `workspace-${slugify(projectName)}`,
    projectId: `project-${slugify(projectName)}`,
    projectName,
    projectMetadata: approvedBase.projectMetadata,
    projectBrief: approvedBase.projectIntelligence.projectBrief,
    architectureBlueprint: approvedBase.projectIntelligence.architectureBlueprint,
    roadmapPlan: approvedBase.projectIntelligence.roadmapPlan,
    governancePolicy: approvedBase.projectIntelligence.governancePolicy,
    patch: {
      answeredInputs: [
        {
          inputId: "walletConnectionMvp",
          value: "Include wallet connection in MVP with wallet portfolio import."
        }
      ],
      projectBrief: {
        mustHaveFeatures: [
          ...approvedBase.projectIntelligence.projectBrief.mustHaveFeatures,
          "wallet portfolio import"
        ]
      }
    },
    createdAt: "2026-04-26T16:00:00.000Z",
    createdBy: "owner@example.com"
  });
  const persistedMetadata = buildStoredProjectMetadata({
    title: projectName,
    description: projectDescription,
    conversationState: approvedBase.projectMetadata.conversationState,
    governanceState: update.governanceState,
    strategyState: update.strategyState
  });
  const hydratedIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: `workspace-${slugify(projectName)}`,
    projectId: `project-${slugify(projectName)}`,
    projectTitle: projectName,
    projectDescription,
    projectMetadata: persistedMetadata
  });
  const runtimeState = buildBlockerRuntimeState({
    projectMetadata: persistedMetadata,
    projectBrief: hydratedIntelligence.projectBrief,
    architectureBlueprint: hydratedIntelligence.architectureBlueprint,
    roadmapPlan: hydratedIntelligence.roadmapPlan,
    governancePolicy: hydratedIntelligence.governancePolicy
  });
  const blockerIds = runtimeState.queue.entries.map((entry) => entry.blockerId);

  assert.equal(blockerIds.includes("wallet_boundary"), true);
  assert.equal(blockerIds.includes("integrations"), true);
  assert.equal(blockerIds.includes("founder_name"), false);
  assert.equal(blockerIds.includes("launch_location_model"), false);
});

test("Strategy Room and Command Center still resolve shared project intelligence while the support helper uses the blocker runtime", () => {
  const strategyRoomPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/strategy-room/page.tsx", import.meta.url),
    "utf8"
  );
  const commandCenterPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/command-center/page.tsx", import.meta.url),
    "utf8"
  );
  const supportSource = readFileSync(
    new URL("../lib/workspace/strategy-room-support.ts", import.meta.url),
    "utf8"
  );

  assert.match(strategyRoomPageSource, /projectBrief=\{projectIntelligence\.projectBrief\}/);
  assert.match(
    commandCenterPageSource,
    /projectIntelligence\.governancePolicy|governancePolicy:\s*projectIntelligence\.governancePolicy/
  );
  assert.match(supportSource, /buildBlockerRuntimeState/);
});
