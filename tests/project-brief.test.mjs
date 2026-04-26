import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildConversationSessionState,
  buildConversationTurnGuidance
} from "../lib/intelligence/conversation/index.ts";
import {
  buildWorkspaceProjectIntelligence,
  generateProjectBrief
} from "../lib/intelligence/project-brief-generator.ts";
import { buildProjectContextSnapshot } from "../lib/workspace/project-context-summary.ts";
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

test("crypto domain resolution produces a typed project brief with domain defaults and unanswered domain slots", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const conversationBuild = buildConversationState(messages);
  const projectBrief = generateProjectBrief({
    projectName: "Tom Crypto Risk",
    projectDescription: messages.join(" "),
    conversationState: conversationBuild.state
  });
  const guidance = buildConversationTurnGuidance({
    state: conversationBuild.state,
    updatedSlotPaths: conversationBuild.updatedSlotPaths
  });

  assert.equal(projectBrief.domainPack, "crypto_analytics");
  assert.equal(projectBrief.founderName, "Tom");
  assert.ok(projectBrief.buyerPersonas.includes("Crypto investors"));
  assert.match(projectBrief.productCategory ?? "", /crypto analytics platform/i);
  assert.ok(projectBrief.mustHaveFeatures.includes("risk score"));
  assert.ok(projectBrief.mustHaveFeatures.includes("score explanation / reasoning"));
  assert.ok(projectBrief.missingCriticalSlots.includes("chainsInScope"));
  assert.ok(projectBrief.missingCriticalSlots.includes("walletConnectionMvp"));
  assert.ok(projectBrief.missingCriticalSlots.includes("adviceAdjacency"));
  assert.ok(projectBrief.missingCriticalSlots.includes("riskSignalSources"));
  assert.notEqual(guidance.questionKey, "buyer_or_operator_persona");
});

test("restaurant domain resolution produces restaurant defaults and leaves POS questions open when unanswered", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const conversationBuild = buildConversationState(messages);
  const projectBrief = generateProjectBrief({
    projectName: "Restaurant Reporting",
    projectDescription: messages.join(" "),
    conversationState: conversationBuild.state
  });

  assert.equal(projectBrief.domainPack, "restaurant_sales");
  assert.ok(projectBrief.buyerPersonas.includes("owners"));
  assert.ok(projectBrief.operatorPersonas.includes("managers"));
  assert.ok(projectBrief.mustHaveFeatures.includes("sales dashboards"));
  assert.ok(projectBrief.mustHaveFeatures.includes("menu-item reporting"));
  assert.ok(projectBrief.integrations.includes("POS connector"));
  assert.ok(projectBrief.missingCriticalSlots.includes("firstPosConnector"));
  assert.ok(projectBrief.missingCriticalSlots.includes("analyticsVsStaffWorkflows"));
  assert.ok(projectBrief.missingCriticalSlots.includes("launchReports"));
});

test("generic fallback still generates a project brief for a vague SaaS request", () => {
  const conversationBuild = buildConversationState([
    "I want to build a workflow SaaS for consultants."
  ]);
  const projectBrief = generateProjectBrief({
    projectName: "Consultant Workflow",
    projectDescription: "Workflow SaaS for consultants.",
    conversationState: conversationBuild.state
  });

  assert.equal(projectBrief.domainPack, "generic_saas");
  assert.ok(projectBrief.productCategory);
  assert.ok(Array.isArray(projectBrief.mustHaveFeatures));
  assert.equal(projectBrief.openQuestions.length > 0, true);
});

test("workspace intelligence and project context read the same project brief source, and domain packs stay outside UI files", () => {
  const conversationBuild = buildConversationState([
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ]);
  const metadata = buildStoredProjectMetadata({
    title: "Tom Crypto Risk",
    description: "Crypto analytics website with a risk engine for pre-sales.",
    conversationState: conversationBuild.state
  });
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    projectTitle: "Tom Crypto Risk",
    projectDescription: "Crypto analytics website with a risk engine for pre-sales.",
    projectMetadata: metadata
  });
  const projectContext = buildProjectContextSnapshot({
    project: {
      title: "Tom Crypto Risk",
      description: "Crypto analytics website with a risk engine for pre-sales."
    },
    projectMetadata: metadata,
    projectBrief: projectIntelligence.projectBrief
  });
  const commandCenterPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/command-center/page.tsx", import.meta.url),
    "utf8"
  );
  const strategyRoomPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/strategy-room/page.tsx", import.meta.url),
    "utf8"
  );
  const planningChatSource = readFileSync(
    new URL("../lib/start/planning-chat.ts", import.meta.url),
    "utf8"
  );
  const startActionsSource = readFileSync(
    new URL("../app/start/actions.ts", import.meta.url),
    "utf8"
  );

  assert.equal(projectContext.projectBrief.domainPack, projectIntelligence.projectBrief.domainPack);
  assert.equal(projectContext.projectBrief.readinessScore, projectIntelligence.projectBrief.readinessScore);
  assert.match(commandCenterPageSource, /projectBrief:\s*projectIntelligence\.projectBrief/);
  assert.match(strategyRoomPageSource, /projectBrief=\{projectIntelligence\.projectBrief\}/);
  assert.match(planningChatSource, /generateProjectBrief/);
  assert.match(startActionsSource, /conversationState/);
  assert.doesNotMatch(commandCenterPageSource, /crypto_analytics|restaurant_sales/);
  assert.doesNotMatch(strategyRoomPageSource, /crypto_analytics|restaurant_sales/);
});

test("readiness logic distinguishes focused-question readiness from architecture readiness", () => {
  const incompleteConversation = buildConversationState([
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ]);
  const incompleteBrief = generateProjectBrief({
    projectName: "Tom Crypto Risk",
    projectDescription:
      "Crypto analytics website with a risk engine for pre-sales and crypto investors.",
    conversationState: incompleteConversation.state
  });
  const architectureReadyBrief = generateProjectBrief({
    projectName: "Tom Crypto Risk",
    projectDescription:
      "Crypto analytics website for crypto investors. Ethereum and Solana first. Wallet connection is not in the MVP. Analytics only, not financial advice. The risk score uses liquidity, holder concentration, audits, and tokenomics.",
    conversationState: incompleteConversation.state
  });

  assert.equal(incompleteBrief.readiness.canContinueFocusedQuestions, true);
  assert.equal(incompleteBrief.readiness.readyForArchitectureGeneration, false);
  assert.equal(architectureReadyBrief.readiness.readyForArchitectureGeneration, true);
  assert.equal(architectureReadyBrief.readiness.readyForRoadmapApproval, false);
  assert.ok(architectureReadyBrief.readinessScore > incompleteBrief.readinessScore);
});
