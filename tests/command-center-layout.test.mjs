import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const commandCenterSource = readFileSync(
  new URL("../components/workspace/project-command-center-v1.tsx", import.meta.url),
  "utf8"
);

test("Command Center keeps the top operator surface ahead of the lower task flow", () => {
  const analyzerPanelIndex = commandCenterSource.indexOf("<CommandCenterAnalyzerPanelView");
  const taskQueuePanelIndex = commandCenterSource.indexOf("<CommandCenterTaskQueuePanelView");
  const promptRunnerPanelIndex = commandCenterSource.indexOf("<CommandCenterPromptRunnerPanelView");

  assert.notEqual(analyzerPanelIndex, -1);
  assert.notEqual(taskQueuePanelIndex, -1);
  assert.notEqual(promptRunnerPanelIndex, -1);
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

test("Lower half clutter is removed from the main page flow", () => {
  const taskPromptGridIndex = commandCenterSource.indexOf(
    '<div className="grid gap-3 md:grid-cols-2 md:items-stretch">'
  );

  assert.notEqual(taskPromptGridIndex, -1);
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
  assert.doesNotMatch(commandCenterSource, /<div className="grid gap-3 2xl:grid-cols-3">/);
});
