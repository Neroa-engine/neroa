import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildConversationSessionState } from "../lib/intelligence/conversation/index.ts";
import {
  generateArchitectureBlueprint,
  validateArchitectureBlueprintReferences
} from "../lib/intelligence/architecture/index.ts";
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

test("crypto architecture generation produces modules, lanes, worktrees, and unanswered crypto inputs", () => {
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
  const blueprint = generateArchitectureBlueprint({
    workspaceId: "workspace-crypto",
    projectId: "project-crypto",
    projectName: "Tom Crypto Risk",
    projectBrief
  });

  assert.equal(blueprint.domainPack, "crypto_analytics");
  assert.ok(blueprint.modules.some((module) => module.id === "risk_engine"));
  assert.ok(blueprint.modules.some((module) => module.id === "data_ingestion_pipeline"));
  assert.ok(blueprint.lanes.some((lane) => lane.id === "foundation"));
  assert.ok(blueprint.lanes.some((lane) => lane.id === "data_ingestion"));
  assert.ok(blueprint.lanes.some((lane) => lane.id === "risk_engine"));
  assert.ok(blueprint.lanes.some((lane) => lane.id === "product_web"));
  assert.ok(blueprint.worktrees.length >= blueprint.lanes.length);
  assert.ok(blueprint.missingCriticalArchitectureInputs.includes("chainsInScope"));
  assert.ok(blueprint.missingCriticalArchitectureInputs.includes("walletConnectionMvp"));
  assert.ok(blueprint.missingCriticalArchitectureInputs.includes("adviceAdjacency"));
  assert.ok(blueprint.missingCriticalArchitectureInputs.includes("riskSignalSources"));
  assert.ok(blueprint.openQuestions.some((question) => question.inputId === "chainsInScope"));
});

test("restaurant architecture generation produces org, connector, and reporting lanes with open POS follow-up", () => {
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
  const blueprint = generateArchitectureBlueprint({
    workspaceId: "workspace-restaurant",
    projectId: "project-restaurant",
    projectName: "Restaurant Reporting",
    projectBrief
  });

  assert.equal(blueprint.domainPack, "restaurant_sales");
  assert.ok(blueprint.modules.some((module) => module.id === "org_location_hierarchy"));
  assert.ok(blueprint.modules.some((module) => module.id === "pos_connector_layer"));
  assert.ok(blueprint.modules.some((module) => module.id === "reporting_engine"));
  assert.ok(blueprint.lanes.some((lane) => lane.id === "foundation_org_model"));
  assert.ok(blueprint.lanes.some((lane) => lane.id === "connectors"));
  assert.ok(blueprint.lanes.some((lane) => lane.id === "analytics_reporting"));
  assert.ok(blueprint.worktrees.length >= blueprint.lanes.length);
  assert.ok(blueprint.missingCriticalArchitectureInputs.includes("firstPosConnector"));
  assert.ok(
    blueprint.openQuestions.some((question) => question.inputId === "firstPosConnector")
  );
  assert.ok(blueprint.openQuestions.some((question) => question.inputId === "launchReports"));
});

test("generic fallback architecture still generates cleanly with structured lanes and worktrees", () => {
  const conversationBuild = buildConversationState([
    "I want to build a workflow SaaS for consultants."
  ]);
  const projectBrief = generateProjectBrief({
    projectName: "Consultant Workflow",
    projectDescription: "Workflow SaaS for consultants.",
    conversationState: conversationBuild.state
  });
  const blueprint = generateArchitectureBlueprint({
    workspaceId: "workspace-generic",
    projectId: "project-generic",
    projectName: "Consultant Workflow",
    projectBrief
  });

  assert.equal(blueprint.domainPack, "generic_saas");
  assert.ok(blueprint.modules.length > 0);
  assert.ok(blueprint.lanes.length > 0);
  assert.ok(blueprint.worktrees.length > 0);
  assert.equal(Array.isArray(blueprint.missingCriticalArchitectureInputs), true);
});

test("command center and strategy room read the same architecture blueprint source without UI-local defaults", () => {
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
    workspaceId: "workspace-crypto",
    projectId: "project-crypto",
    projectTitle: "Tom Crypto Risk",
    projectDescription: "Crypto analytics website with a risk engine for pre-sales.",
    projectMetadata: metadata
  });
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
    projectIntelligence.architectureBlueprint.domainPack,
    projectIntelligence.projectBrief.domainPack
  );
  assert.equal(projectIntelligence.architectureBlueprint.projectId, "project-crypto");
  assert.match(
    commandCenterPageSource,
    /architectureBlueprint=\{projectIntelligence\.architectureBlueprint\}/
  );
  assert.match(
    strategyRoomPageSource,
    /architectureBlueprint=\{projectIntelligence\.architectureBlueprint\}/
  );
  assert.doesNotMatch(commandCenterPageSource, /crypto_analytics|restaurant_sales|risk_engine/);
  assert.doesNotMatch(strategyRoomPageSource, /crypto_analytics|restaurant_sales|risk_engine/);
  assert.doesNotMatch(
    commandCenterComponentSource,
    /crypto_analytics|restaurant_sales|foundation_org_model|pos_connector_layer/
  );
  assert.doesNotMatch(
    strategyRoomComponentSource,
    /crypto_analytics|restaurant_sales|foundation_org_model|pos_connector_layer/
  );
});

test("dependency graph, lane ownership, and worktree references stay valid and scoped", () => {
  const conversationBuild = buildConversationState([
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ]);
  const projectBrief = generateProjectBrief({
    projectName: "Restaurant Reporting",
    projectDescription:
      "Restaurant sales platform for owners and managers with multi-location reporting.",
    conversationState: conversationBuild.state
  });
  const blueprint = generateArchitectureBlueprint({
    workspaceId: "workspace-restaurant",
    projectId: "project-restaurant",
    projectName: "Restaurant Reporting",
    projectBrief
  });
  const validation = validateArchitectureBlueprintReferences(blueprint);

  assert.deepEqual(validation.unknownDependencyModuleIds, []);
  assert.deepEqual(validation.unknownLaneModuleIds, []);
  assert.deepEqual(validation.unknownWorktreeLaneIds, []);
  assert.equal("roadmapPhases" in blueprint, false);
  assert.equal("governancePolicies" in blueprint, false);
});
