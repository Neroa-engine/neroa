import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const commandCenterSource = readFileSync(
  new URL("../components/workspace/project-command-center-v1.tsx", import.meta.url),
  "utf8"
);

test("Lower half main flow keeps only Customer Tasks and Prompt Runner beneath the top operator surface", () => {
  const analyzerPanelIndex = commandCenterSource.indexOf("<CommandCenterAnalyzerPanelView");
  const taskPromptGridIndex = commandCenterSource.indexOf(
    '<div className="grid gap-3 md:grid-cols-2 md:items-stretch">'
  );

  assert.notEqual(analyzerPanelIndex, -1);
  assert.notEqual(taskPromptGridIndex, -1);
  assert.ok(analyzerPanelIndex < taskPromptGridIndex);
  assert.match(commandCenterSource, /<CommandCenterTaskQueuePanelView/);
  assert.match(commandCenterSource, /<CommandCenterPromptRunnerPanelView/);
  assert.doesNotMatch(commandCenterSource, /<CommandCenterBuildRoomExecutionPanel/);
  assert.doesNotMatch(
    commandCenterSource,
    /<GovernanceReferencePanel governancePolicy={governancePolicy} \/>/
  );
  assert.doesNotMatch(commandCenterSource, /<RoadmapReferencePanel roadmapPlan={roadmapPlan} \/>/);
  assert.doesNotMatch(
    commandCenterSource,
    /<ArchitectureReferencePanel architectureBlueprint={architectureBlueprint} \/>/
  );
});

test("Top operator structure and lower task or prompt support remain visible", () => {
  assert.match(commandCenterSource, /<CommandCenterAnalyzerPanelView/);
  assert.match(commandCenterSource, /<CommandCenterTaskQueuePanelView/);
  assert.match(commandCenterSource, /<CommandCenterPromptRunnerPanelView/);
});
