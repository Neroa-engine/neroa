import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const commandCenterSource = readFileSync(
  new URL("../components/workspace/project-command-center-v1.tsx", import.meta.url),
  "utf8"
);

test("Command Center restores the visible operator surface ahead of the rest of the workflow", () => {
  const analyzerPanelIndex = commandCenterSource.indexOf("<CommandCenterAnalyzerPanelView");
  const buildRoomPanelIndex = commandCenterSource.indexOf("<CommandCenterBuildRoomExecutionPanel");
  const taskQueuePanelIndex = commandCenterSource.indexOf("<CommandCenterTaskQueuePanelView");
  const promptRunnerPanelIndex = commandCenterSource.indexOf("<CommandCenterPromptRunnerPanelView");

  assert.notEqual(analyzerPanelIndex, -1);
  assert.notEqual(buildRoomPanelIndex, -1);
  assert.notEqual(taskQueuePanelIndex, -1);
  assert.notEqual(promptRunnerPanelIndex, -1);
  assert.ok(analyzerPanelIndex < buildRoomPanelIndex);
  assert.ok(analyzerPanelIndex < taskQueuePanelIndex);
  assert.ok(analyzerPanelIndex < promptRunnerPanelIndex);
});

test("Customer Tasks and Prompt Runner stay visible in the main page flow", () => {
  assert.match(
    commandCenterSource,
    /<div className="grid gap-3 md:grid-cols-2 md:items-stretch">[\s\S]*<CommandCenterTaskQueuePanelView[\s\S]*<CommandCenterPromptRunnerPanelView/
  );
});

test("Command Center no longer hides the main operator structure behind restoration regressions", () => {
  assert.doesNotMatch(commandCenterSource, /CommandCenterCompactSignal/);
  assert.doesNotMatch(commandCenterSource, /CommandCenterSupportSummary/);
  assert.doesNotMatch(commandCenterSource, /eyebrow="Operator support"/);
  assert.doesNotMatch(commandCenterSource, /eyebrow="Execution watch"/);
  assert.doesNotMatch(commandCenterSource, /eyebrow="Project intelligence"/);
});

test("Governance, roadmap, and architecture reference remain present without replacing the operator surface", () => {
  const taskPromptGridIndex = commandCenterSource.indexOf(
    '<div className="grid gap-3 md:grid-cols-2 md:items-stretch">'
  );
  const governancePanelIndex = commandCenterSource.indexOf(
    "<GovernanceReferencePanel governancePolicy={governancePolicy} />"
  );
  const roadmapPanelIndex = commandCenterSource.indexOf(
    "<RoadmapReferencePanel roadmapPlan={roadmapPlan} />"
  );
  const architecturePanelIndex = commandCenterSource.indexOf(
    "<ArchitectureReferencePanel architectureBlueprint={architectureBlueprint} />"
  );

  assert.notEqual(taskPromptGridIndex, -1);
  assert.notEqual(governancePanelIndex, -1);
  assert.notEqual(roadmapPanelIndex, -1);
  assert.notEqual(architecturePanelIndex, -1);
  assert.ok(taskPromptGridIndex < governancePanelIndex);
  assert.ok(taskPromptGridIndex < roadmapPanelIndex);
  assert.ok(taskPromptGridIndex < architecturePanelIndex);
});
