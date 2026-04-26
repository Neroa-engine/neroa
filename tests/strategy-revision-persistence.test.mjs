import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildConversationSessionState,
  recordConversationQuestionAsked
} from "../lib/intelligence/conversation/index.ts";
import { buildWorkspaceProjectIntelligence } from "../lib/intelligence/project-brief-generator.ts";
import {
  analyzeGovernanceDelta,
  getGovernanceDomainDefaults,
  scopeApprovalRecordSchema
} from "../lib/intelligence/governance/index.ts";
import {
  createStrategyRevisionPersistenceUpdate
} from "../lib/intelligence/revisions/index.ts";
import { createPlanningChatPersistenceUpdate } from "../lib/start/planning-persistence.ts";
import { runPlanningChat } from "../lib/start/planning-chat.ts";
import {
  buildStoredProjectMetadata,
  encodeWorkspaceProjectDescription,
  parseWorkspaceProjectDescription
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
  const encodedDescription = encodeWorkspaceProjectDescription(
    args.projectDescription,
    persistedMetadata
  );
  const parsed = parseWorkspaceProjectDescription(encodedDescription);
  const hydratedIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: `workspace-${slugify(args.projectName)}`,
    projectId: `project-${slugify(args.projectName)}`,
    projectTitle: args.projectName,
    projectDescription: parsed.visibleDescription,
    projectMetadata: parsed.metadata
  });

  return {
    base,
    update,
    persistedMetadata,
    encodedDescription,
    parsed,
    hydratedIntelligence
  };
}

test("crypto revision persistence rehydrates shared intelligence and reduces blockers when chains and wallet scope are answered", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const result = persistStrategyRevision({
    messages,
    projectName: "Tom Crypto Risk",
    projectDescription: messages.join(" "),
    patch: {
      answeredInputs: [
        {
          inputId: "chainsInScope",
          value: "Ethereum and Solana"
        },
        {
          inputId: "walletConnectionMvp",
          value: "Not in MVP. Keep the launch analytics only."
        }
      ]
    }
  });

  assert.equal(result.update.strategyState.revisionRecords.length, 1);
  assert.equal(
    result.hydratedIntelligence.projectBrief.missingCriticalSlots.includes("chainsInScope"),
    false
  );
  assert.equal(
    result.hydratedIntelligence.projectBrief.missingCriticalSlots.includes("walletConnectionMvp"),
    false
  );
  assert.ok(
    result.hydratedIntelligence.projectBrief.constraints.some((item) =>
      /Launch chains: Ethereum and Solana/i.test(item)
    )
  );
  assert.ok(
    result.hydratedIntelligence.projectBrief.constraints.some((item) =>
      /Wallet connection boundary: Not in MVP/i.test(item)
    )
  );
  assert.ok(
    result.hydratedIntelligence.projectBrief.excludedFeatures.includes("wallet connection")
  );
  assert.ok(
    result.hydratedIntelligence.governancePolicy.approvalReadiness.blockers.length <
      result.base.projectIntelligence.governancePolicy.approvalReadiness.blockers.length
  );
  assert.equal(
    result.hydratedIntelligence.architectureBlueprint.openQuestions.some(
      (question) => question.inputId === "chainsInScope"
    ),
    false
  );
  assert.equal(
    result.hydratedIntelligence.roadmapPlan.openQuestions.some(
      (question) => question.inputId === "walletConnectionMvp"
    ),
    false
  );
});

test("restaurant revision persistence rehydrates shared intelligence and reduces connector and launch-scope blockers", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const result = persistStrategyRevision({
    messages,
    projectName: "Restaurant Reporting",
    projectDescription: messages.join(" "),
    patch: {
      answeredInputs: [
        {
          inputId: "firstPosConnector",
          value: "Toast"
        },
        {
          inputId: "launchLocationModel",
          value: "Single-location only at launch"
        }
      ]
    }
  });

  assert.equal(
    result.hydratedIntelligence.projectBrief.missingCriticalSlots.includes("firstPosConnector"),
    false
  );
  assert.equal(
    result.hydratedIntelligence.projectBrief.missingCriticalSlots.includes("launchLocationModel"),
    false
  );
  assert.ok(
    result.hydratedIntelligence.projectBrief.integrations.some((item) => /Toast/i.test(item))
  );
  assert.ok(
    result.hydratedIntelligence.projectBrief.constraints.some((item) =>
      /Launch location model: Single-location only at launch/i.test(item)
    )
  );
  assert.ok(
    result.hydratedIntelligence.projectBrief.excludedFeatures.includes(
      "multi-location launch depth"
    )
  );
  assert.ok(
    result.hydratedIntelligence.governancePolicy.approvalReadiness.blockers.length <
      result.base.projectIntelligence.governancePolicy.approvalReadiness.blockers.length
  );
});

test("material revisions supersede approval and keep execution blocked until Strategy Room review returns", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const approvedBase = buildSharedIntelligence({
    messages,
    projectName: "Approved Crypto Risk",
    projectDescription: messages.join(" "),
    governanceState: {
      scopeApprovalRecord: scopeApprovalRecordSchema.parse({
        approvalRecordId: "approved-crypto:scope-approval",
        sourceRoadmapPlanId: "workspace-approved-crypto:project-approved-crypto:roadmap-plan",
        sourceGovernancePolicyId:
          "workspace-approved-crypto:project-approved-crypto:governance-policy",
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
    workspaceId: "workspace-approved-crypto-risk",
    projectId: "project-approved-crypto-risk",
    projectName: "Approved Crypto Risk",
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
    createdAt: "2026-04-26T13:00:00.000Z",
    createdBy: "owner@example.com"
  });
  const persistedMetadata = buildStoredProjectMetadata({
    title: "Approved Crypto Risk",
    description: messages.join(" "),
    conversationState: approvedBase.projectMetadata.conversationState,
    governanceState: update.governanceState,
    strategyState: update.strategyState
  });
  const hydratedIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: "workspace-approved-crypto-risk",
    projectId: "project-approved-crypto-risk",
    projectTitle: "Approved Crypto Risk",
    projectDescription: messages.join(" "),
    projectMetadata: persistedMetadata
  });

  assert.equal(update.revisionRecord.materiality, "material");
  assert.equal(update.revisionRecord.requiresApprovalReset, true);
  assert.equal(update.approvalInvalidation.approvalInvalidated, true);
  assert.equal(update.approvalInvalidation.requiresApprovalReset, true);
  assert.equal(update.governanceState.scopeApprovalRecord.status, "superseded");
  assert.equal(update.roadmapRevisionRecord.status, "pending_review");
  assert.equal(hydratedIntelligence.governancePolicy.currentApprovalState.status, "revision_required");
  assert.equal(hydratedIntelligence.governancePolicy.currentApprovalState.roadmapScopeApproved, false);
});

test("shared loader keeps Strategy Room and Command Center on the same revised intelligence source", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const result = persistStrategyRevision({
    messages,
    projectName: "Restaurant Reporting",
    projectDescription: messages.join(" "),
    patch: {
      answeredInputs: [
        {
          inputId: "firstPosConnector",
          value: "Toast"
        }
      ],
      roadmap: {
        explicitNotInScope: ["Staff workflow tooling in MVP"]
      }
    }
  });
  const strategyRoomPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/strategy-room/page.tsx", import.meta.url),
    "utf8"
  );
  const commandCenterPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/command-center/page.tsx", import.meta.url),
    "utf8"
  );
  const strategySavebackSource = readFileSync(
    new URL("../components/workspace/strategy-room-saveback-panel.tsx", import.meta.url),
    "utf8"
  );

  assert.match(strategyRoomPageSource, /projectBrief=\{projectIntelligence\.projectBrief\}/);
  assert.match(strategyRoomPageSource, /roadmapPlan=\{projectIntelligence\.roadmapPlan\}/);
  assert.match(commandCenterPageSource, /governancePolicy:\s*projectIntelligence\.governancePolicy/);
  assert.match(strategySavebackSource, /saveStrategyRevision/);
  assert.ok(
    result.hydratedIntelligence.projectBrief.integrations.some((item) => /Toast/i.test(item))
  );
  assert.doesNotMatch(
    strategySavebackSource,
    /Ethereum and Solana|wallet portfolio import|Toast POS connector/i
  );
});

test("delta analysis stays deterministic after revisions and still sees the revised shared intelligence", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const result = persistStrategyRevision({
    messages,
    projectName: "Tom Crypto Risk",
    projectDescription: messages.join(" "),
    patch: {
      answeredInputs: [
        {
          inputId: "chainsInScope",
          value: "Ethereum and Solana"
        },
        {
          inputId: "walletConnectionMvp",
          value: "Not in MVP. Keep the launch analytics only."
        }
      ]
    }
  });
  const request = "Add wallet portfolio import to MVP";
  const firstDelta = analyzeGovernanceDelta({
    request,
    projectBrief: result.hydratedIntelligence.projectBrief,
    architectureBlueprint: result.hydratedIntelligence.architectureBlueprint,
    roadmapPlan: result.hydratedIntelligence.roadmapPlan,
    governancePolicy: result.hydratedIntelligence.governancePolicy,
    defaults: getGovernanceDomainDefaults(result.hydratedIntelligence.governancePolicy.domainPack)
  });
  const secondDelta = analyzeGovernanceDelta({
    request,
    projectBrief: result.hydratedIntelligence.projectBrief,
    architectureBlueprint: result.hydratedIntelligence.architectureBlueprint,
    roadmapPlan: result.hydratedIntelligence.roadmapPlan,
    governancePolicy: result.hydratedIntelligence.governancePolicy,
    defaults: getGovernanceDomainDefaults(result.hydratedIntelligence.governancePolicy.domainPack)
  });

  assert.deepEqual(firstDelta, secondDelta);
  assert.notEqual(firstDelta.outcome, "execution_ready_after_gate");
});

test("Strategy Room chat answers persist blocker resolution through the shared revision spine", async () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const projectName = "Tom Crypto Risk";
  const projectDescription = messages.join(" ");
  const workspaceId = `workspace-${slugify(projectName)}`;
  const projectId = `project-${slugify(projectName)}`;
  const base = buildSharedIntelligence({
    messages,
    projectName,
    projectDescription
  });
  const userAnswer = "Ethereum and Solana. Keep wallet connection out of MVP.";
  const chatResult = await runPlanningChat({
    threadId: "strategy-room-chat-sync",
    lane: "managed",
    title: projectName,
    summary: projectDescription,
    messages: messages.map((message, index) => buildUserMessage(`u${index + 1}`, message)),
    message: userAnswer,
    conversationState: base.projectMetadata.conversationState,
    existingProjectContext: true
  });
  const persistenceUpdate = createPlanningChatPersistenceUpdate({
    workspaceId,
    projectId,
    projectName,
    projectMetadata: base.projectMetadata,
    previousIntelligence: base.projectIntelligence,
    threadState: chatResult.threadState,
    latestUserMessage: userAnswer,
    createdAt: "2026-04-26T13:30:00.000Z",
    createdBy: "owner@example.com"
  });
  const hydratedMetadata = buildStoredProjectMetadata({
    title: projectName,
    description: projectDescription,
    conversationState: persistenceUpdate.updatedThreadState.conversationState,
    governanceState: persistenceUpdate.governanceState,
    strategyState: persistenceUpdate.strategyState
  });
  const hydratedIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId,
    projectId,
    projectTitle: projectName,
    projectDescription,
    projectMetadata: hydratedMetadata
  });

  assert.ok(persistenceUpdate.strategyUpdate);
  assert.ok(
    persistenceUpdate.patch.answeredInputs?.some((item) => item.inputId === "chainsInScope")
  );
  assert.ok(
    persistenceUpdate.patch.answeredInputs?.some((item) => item.inputId === "walletConnectionMvp")
  );
  assert.ok(
    hydratedIntelligence.projectBrief.constraints.some((item) =>
      /Launch chains: Ethereum and Solana/i.test(item)
    )
  );
  assert.ok(
    hydratedIntelligence.projectBrief.constraints.some((item) =>
      /Wallet connection boundary: Ethereum and Solana\. Keep wallet connection out of MVP\./i.test(
        item
      )
    )
  );
  assert.ok(
    hydratedIntelligence.projectBrief.excludedFeatures.includes("wallet connection")
  );
  assert.ok(
    hydratedIntelligence.governancePolicy.approvalReadiness.blockers.length <
      base.projectIntelligence.governancePolicy.approvalReadiness.blockers.length
  );
  assert.equal(
    hydratedIntelligence.architectureBlueprint.openQuestions.some(
      (question) => question.inputId === "chainsInScope"
    ),
    false
  );
});

test("Strategy Room accepts valid null-style constraint answers without silently dropping the turn", async () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const projectName = "Tom Crypto Risk";
  const projectDescription = messages.join(" ");
  const workspaceId = `workspace-${slugify(projectName)}`;
  const projectId = `project-${slugify(projectName)}`;
  const base = buildSharedIntelligence({
    messages,
    projectName,
    projectDescription
  });
  const askedConstraintsState = recordConversationQuestionAsked({
    state: base.projectMetadata.conversationState,
    questionKey: "constraints_and_compliance",
    askedTurnId: "assistant-constraints"
  });
  const userAnswer = "no constraint";
  const chatResult = await runPlanningChat({
    threadId: "strategy-room-chat-constraints",
    lane: "managed",
    title: projectName,
    summary: projectDescription,
    messages: messages.map((message, index) => buildUserMessage(`u${index + 1}`, message)),
    message: userAnswer,
    conversationState: askedConstraintsState,
    existingProjectContext: true
  });
  const persistenceUpdate = createPlanningChatPersistenceUpdate({
    workspaceId,
    projectId,
    projectName,
    projectMetadata: {
      ...base.projectMetadata,
      conversationState: askedConstraintsState
    },
    previousIntelligence: base.projectIntelligence,
    threadState: chatResult.threadState,
    latestUserMessage: userAnswer,
    createdAt: "2026-04-26T13:45:00.000Z",
    createdBy: "owner@example.com"
  });
  const hydratedMetadata = buildStoredProjectMetadata({
    title: projectName,
    description: projectDescription,
    conversationState: persistenceUpdate.updatedThreadState.conversationState,
    governanceState: persistenceUpdate.governanceState,
    strategyState: persistenceUpdate.strategyState
  });
  const hydratedIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId,
    projectId,
    projectTitle: projectName,
    projectDescription,
    projectMetadata: hydratedMetadata
  });
  const lastAssistantMessage = chatResult.threadState.messages.at(-1);

  assert.equal(chatResult.threadState.messages.at(-2)?.content, userAnswer);
  assert.ok(
    chatResult.threadState.conversationState?.constraintsAndCompliance.includes(
      "No material constraints identified right now"
    )
  );
  assert.ok(lastAssistantMessage?.content.includes("?"));
  assert.ok(
    hydratedIntelligence.projectBrief.constraints.includes(
      "No material constraints identified right now"
    )
  );
});

test("Strategy Room treats short MVP-boundary answers like 'not in MVP' as valid blocker resolutions", async () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const projectName = "Tom Crypto Risk";
  const projectDescription = messages.join(" ");
  const workspaceId = `workspace-${slugify(projectName)}`;
  const projectId = `project-${slugify(projectName)}`;
  const base = persistStrategyRevision({
    messages,
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
  const userAnswer = "not in MVP";
  const chatResult = await runPlanningChat({
    threadId: "strategy-room-chat-wallet-boundary",
    lane: "managed",
    title: projectName,
    summary: projectDescription,
    messages: messages.map((message, index) => buildUserMessage(`u${index + 1}`, message)),
    message: userAnswer,
    conversationState: base.persistedMetadata.conversationState,
    existingProjectContext: true
  });
  const persistenceUpdate = createPlanningChatPersistenceUpdate({
    workspaceId,
    projectId,
    projectName,
    projectMetadata: base.persistedMetadata,
    previousIntelligence: base.hydratedIntelligence,
    threadState: chatResult.threadState,
    latestUserMessage: userAnswer,
    createdAt: "2026-04-26T13:50:00.000Z",
    createdBy: "owner@example.com"
  });
  const hydratedMetadata = buildStoredProjectMetadata({
    title: projectName,
    description: projectDescription,
    conversationState: persistenceUpdate.updatedThreadState.conversationState,
    governanceState: persistenceUpdate.governanceState,
    strategyState: persistenceUpdate.strategyState
  });
  const hydratedIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId,
    projectId,
    projectTitle: projectName,
    projectDescription,
    projectMetadata: hydratedMetadata
  });

  assert.equal(chatResult.threadState.messages.at(-2)?.content, userAnswer);
  assert.ok(
    persistenceUpdate.patch.answeredInputs?.some(
      (item) => item.inputId === "walletConnectionMvp" && /not in mvp/i.test(item.value)
    )
  );
  assert.ok(
    hydratedIntelligence.projectBrief.constraints.some((item) =>
      /Wallet connection boundary: not in MVP/i.test(item)
    )
  );
  assert.ok(
    hydratedIntelligence.projectBrief.excludedFeatures.includes("wallet connection")
  );
});

test("ambiguous but non-empty Strategy Room answers stay visible and trigger clarification instead of disappearing", async () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const base = buildSharedIntelligence({
    messages,
    projectName: "Tom Crypto Risk",
    projectDescription: messages.join(" ")
  });
  const userAnswer = "maybe later";
  const chatResult = await runPlanningChat({
    threadId: "strategy-room-chat-clarification",
    lane: "managed",
    title: "Tom Crypto Risk",
    summary: messages.join(" "),
    messages: messages.map((message, index) => buildUserMessage(`u${index + 1}`, message)),
    message: userAnswer,
    conversationState: base.projectMetadata.conversationState,
    existingProjectContext: true
  });
  const persistenceUpdate = createPlanningChatPersistenceUpdate({
    workspaceId: "workspace-tom-crypto-risk",
    projectId: "project-tom-crypto-risk",
    projectName: "Tom Crypto Risk",
    projectMetadata: base.projectMetadata,
    previousIntelligence: base.projectIntelligence,
    threadState: chatResult.threadState,
    latestUserMessage: userAnswer,
    createdAt: "2026-04-26T14:00:00.000Z",
    createdBy: "owner@example.com"
  });
  const lastAssistantMessage = chatResult.threadState.messages.at(-1);

  assert.equal(chatResult.threadState.messages.at(-2)?.content, userAnswer);
  assert.ok(lastAssistantMessage?.content.includes("?"));
  assert.equal(persistenceUpdate.patch.answeredInputs?.length ?? 0, 0);
});

test("Strategy Room submit failures surface explicit save errors instead of silently swallowing the answer", () => {
  const startChatRouteSource = readFileSync(
    new URL("../app/api/start/chat/route.ts", import.meta.url),
    "utf8"
  );
  const entryFlowSource = readFileSync(
    new URL("../components/onboarding/canonical-entry-flow.tsx", import.meta.url),
    "utf8"
  );

  assert.match(startChatRouteSource, /Your answer was not saved\. Try again\./);
  assert.doesNotMatch(
    startChatRouteSource,
    /Thread continuity persistence should never break visible planning chat delivery/
  );
  assert.doesNotMatch(entryFlowSource, /setMessages\(previousMessages\);/);
  assert.match(entryFlowSource, /setMessages\(\(currentMessages\) =>/);
});

test("Strategy Room right rail keeps blocker status visible without exposing primary answer inputs", () => {
  const strategySavebackSource = readFileSync(
    new URL("../components/workspace/strategy-room-saveback-panel.tsx", import.meta.url),
    "utf8"
  );
  const strategyRoomSource = readFileSync(
    new URL("../components/workspace/project-strategy-room-v1.tsx", import.meta.url),
    "utf8"
  );

  assert.match(strategySavebackSource, /Resolve in chat/);
  assert.match(strategySavebackSource, /Answer in chat/);
  assert.doesNotMatch(strategySavebackSource, /strategyAnswer:/);
  assert.doesNotMatch(strategySavebackSource, /name="projectName"|name="problemStatement"|name="evidence:/);
  assert.match(strategyRoomSource, /chatGuidance=\{chatHelper\}/);
});

test("generic strategy revisions still persist and rehydrate without undefined behavior", () => {
  const messages = ["I want to build a workflow SaaS for consultants."];
  const result = persistStrategyRevision({
    messages,
    projectName: "Consultant Workflow",
    projectDescription: messages.join(" "),
    patch: {
      projectBrief: {
        buyerPersonas: ["Consulting firm owners"],
        operatorPersonas: ["Consultants"],
        mustHaveFeatures: ["Client dashboard", "Project tracking"]
      },
      roadmap: {
        explicitNotInScope: ["Mobile app"]
      }
    }
  });

  assert.equal(result.hydratedIntelligence.projectBrief.domainPack, "generic_saas");
  assert.ok(
    result.hydratedIntelligence.projectBrief.buyerPersonas.includes("Consulting firm owners")
  );
  assert.ok(result.hydratedIntelligence.roadmapPlan.mvpDefinition.deferredItems.includes("Mobile app"));
  assert.equal(Array.isArray(result.hydratedIntelligence.governancePolicy.approvalChecklist), true);
});
