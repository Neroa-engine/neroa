import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildConversationSessionState } from "../lib/intelligence/conversation/index.ts";
import {
  generateArchitectureBlueprint
} from "../lib/intelligence/architecture/index.ts";
import {
  buildRoadmapPlanSummary,
  generateRoadmapPlan,
  validateRoadmapPlanReferences
} from "../lib/intelligence/roadmap/index.ts";
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

function buildRoadmap(messages, projectName, projectDescription) {
  const conversationBuild = buildConversationState(messages);
  const projectBrief = generateProjectBrief({
    projectName,
    projectDescription,
    conversationState: conversationBuild.state
  });
  const architectureBlueprint = generateArchitectureBlueprint({
    workspaceId: `workspace-${projectName.toLowerCase().replace(/\s+/g, "-")}`,
    projectId: `project-${projectName.toLowerCase().replace(/\s+/g, "-")}`,
    projectName,
    projectBrief
  });
  const roadmapPlan = generateRoadmapPlan({
    workspaceId: architectureBlueprint.workspaceId,
    projectId: architectureBlueprint.projectId,
    projectName,
    projectBrief,
    architectureBlueprint
  });

  return {
    conversationBuild,
    projectBrief,
    architectureBlueprint,
    roadmapPlan
  };
}

test("crypto roadmap generation produces a typed roadmap with dependency-ordered phases and crypto open questions", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const { architectureBlueprint, roadmapPlan } = buildRoadmap(
    messages,
    "Tom Crypto Risk",
    messages.join(" ")
  );

  assert.equal(roadmapPlan.domainPack, "crypto_analytics");
  assert.deepEqual(roadmapPlan.phases.map((phase) => phase.phaseId), [
    "phase_1_foundation",
    "phase_2_data_and_scoring",
    "phase_3_investor_mvp",
    "phase_4_admin_trust"
  ]);
  assert.ok(
    roadmapPlan.phases.find((phase) => phase.phaseId === "phase_2_data_and_scoring")?.laneIds.includes("data_ingestion")
  );
  assert.ok(
    roadmapPlan.phases.find((phase) => phase.phaseId === "phase_2_data_and_scoring")?.laneIds.includes("risk_engine")
  );
  assert.deepEqual(
    roadmapPlan.phases.find((phase) => phase.phaseId === "phase_2_data_and_scoring")?.dependsOnPhaseIds,
    ["phase_1_foundation"]
  );
  assert.ok(roadmapPlan.criticalPath.length >= roadmapPlan.phases.length);
  assert.ok(roadmapPlan.phases.every((phase) => phase.acceptanceCriteria.length > 0));
  assert.ok(roadmapPlan.phases.every((phase) => phase.notInScope.length > 0));
  assert.ok(roadmapPlan.openQuestions.some((question) => question.inputId === "chainsInScope"));
  assert.ok(roadmapPlan.openQuestions.some((question) => question.inputId === "walletConnectionMvp"));
  assert.ok(roadmapPlan.missingCriticalScopeInputs.includes("chainsInScope"));
  assert.ok(roadmapPlan.missingCriticalScopeInputs.includes("walletConnectionMvp"));
  assert.match(
    buildRoadmapPlanSummary(roadmapPlan).mvpSummary,
    /crypto analytics MVP/i
  );
  assert.ok(
    architectureBlueprint.worktrees.some((worktree) =>
      roadmapPlan.phases
        .find((phase) => phase.phaseId === "phase_2_data_and_scoring")
        ?.worktreeHints.includes(worktree.branchName)
    )
  );
});

test("restaurant roadmap generation keeps connector and reporting phases in dependency order with POS follow-up still open", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const { roadmapPlan } = buildRoadmap(
    messages,
    "Restaurant Reporting",
    messages.join(" ")
  );

  assert.equal(roadmapPlan.domainPack, "restaurant_sales");
  assert.deepEqual(roadmapPlan.phases.map((phase) => phase.phaseId), [
    "phase_1_foundation",
    "phase_2_connector_flow",
    "phase_3_reporting_mvp",
    "phase_4_admin_and_multi_location"
  ]);
  assert.ok(
    roadmapPlan.phases.find((phase) => phase.phaseId === "phase_2_connector_flow")?.laneIds.includes("connectors")
  );
  assert.ok(
    roadmapPlan.phases.find((phase) => phase.phaseId === "phase_3_reporting_mvp")?.laneIds.includes("analytics_reporting")
  );
  assert.ok(
    roadmapPlan.phases.find((phase) => phase.phaseId === "phase_3_reporting_mvp")?.dependsOnPhaseIds.includes("phase_2_connector_flow")
  );
  assert.ok(roadmapPlan.criticalPath.length >= roadmapPlan.phases.length);
  assert.ok(roadmapPlan.openQuestions.some((question) => question.inputId === "firstPosConnector"));
  assert.ok(roadmapPlan.openQuestions.some((question) => question.inputId === "launchReports"));
  assert.ok(roadmapPlan.missingCriticalScopeInputs.includes("firstPosConnector"));
  assert.ok(roadmapPlan.missingCriticalScopeInputs.includes("launchReports"));
});

test("generic fallback roadmap still generates cleanly from the shared architecture input", () => {
  const { architectureBlueprint, roadmapPlan } = buildRoadmap(
    ["I want to build a workflow SaaS for consultants."],
    "Consultant Workflow",
    "Workflow SaaS for consultants."
  );

  assert.equal(roadmapPlan.domainPack, "generic_saas");
  assert.equal(roadmapPlan.sourceProjectBriefRef, architectureBlueprint.sourceProjectBriefRef);
  assert.match(roadmapPlan.sourceArchitectureBlueprintRef, /architecture-blueprint$/);
  assert.ok(roadmapPlan.phases.length > 0);
  assert.ok(roadmapPlan.criticalPath.length > 0);
});

test("strategy room and command center read the same shared roadmap source without page-local defaults", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const conversationBuild = buildConversationState(messages);
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
    projectIntelligence.roadmapPlan.domainPack,
    projectIntelligence.architectureBlueprint.domainPack
  );
  assert.equal(projectIntelligence.roadmapPlan.projectId, "project-crypto");
  assert.match(commandCenterPageSource, /roadmapPlan:\s*projectIntelligence\.roadmapPlan/);
  assert.match(strategyRoomPageSource, /roadmapPlan=\{projectIntelligence\.roadmapPlan\}/);
  assert.doesNotMatch(commandCenterPageSource, /phase_2_data_and_scoring|phase_3_reporting_mvp/);
  assert.doesNotMatch(strategyRoomPageSource, /phase_2_data_and_scoring|phase_3_reporting_mvp/);
  assert.doesNotMatch(
    commandCenterComponentSource,
    /crypto_analytics|restaurant_sales|phase_2_connector_flow|phase_2_data_and_scoring/
  );
  assert.doesNotMatch(
    strategyRoomComponentSource,
    /crypto_analytics|restaurant_sales|phase_2_connector_flow|phase_2_data_and_scoring/
  );
});

test("roadmap references stay valid, scope boundaries stay explicit, and this step stops before governance or execution planning", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const { architectureBlueprint, roadmapPlan } = buildRoadmap(
    messages,
    "Restaurant Reporting",
    "Restaurant sales platform for owners and managers with multi-location reporting."
  );
  const validation = validateRoadmapPlanReferences({
    roadmapPlan,
    architectureBlueprint
  });

  assert.deepEqual(validation.unknownPhaseModuleIds, []);
  assert.deepEqual(validation.unknownPhaseLaneIds, []);
  assert.deepEqual(validation.unknownCriticalPathPhaseIds, []);
  assert.deepEqual(validation.unknownCriticalPathDependencyIds, []);
  assert.ok(roadmapPlan.phases.every((phase) => phase.notInScope.length > 0));
  assert.ok(roadmapPlan.missingCriticalScopeInputs.length > 0);
  assert.ok(roadmapPlan.readinessScore < 100);
  assert.equal("governancePolicies" in roadmapPlan, false);
  assert.equal("executionTasks" in roadmapPlan, false);
});
