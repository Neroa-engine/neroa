import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const commandCenterSource = readFileSync(
  new URL("../components/workspace/project-command-center-v1.tsx", import.meta.url),
  "utf8"
);

test("Command Center keeps the primary execution intake above support surfaces", () => {
  const buildRoomPanelIndex = commandCenterSource.indexOf("<CommandCenterBuildRoomExecutionPanel");
  const analyzerPanelIndex = commandCenterSource.indexOf("<CommandCenterAnalyzerPanelView");
  const taskQueuePanelIndex = commandCenterSource.indexOf("<CommandCenterTaskQueuePanelView");
  const promptRunnerPanelIndex = commandCenterSource.indexOf("<CommandCenterPromptRunnerPanelView");

  assert.notEqual(buildRoomPanelIndex, -1);
  assert.notEqual(analyzerPanelIndex, -1);
  assert.notEqual(taskQueuePanelIndex, -1);
  assert.notEqual(promptRunnerPanelIndex, -1);
  assert.ok(buildRoomPanelIndex < analyzerPanelIndex);
  assert.ok(buildRoomPanelIndex < taskQueuePanelIndex);
  assert.ok(buildRoomPanelIndex < promptRunnerPanelIndex);
});

test("Command Center exposes a compact status strip before the main intake", () => {
  assert.match(commandCenterSource, /label="Current status"/);
  assert.match(commandCenterSource, /label="Blocking now"/);
  assert.match(commandCenterSource, /label="Active phase"/);
  assert.match(commandCenterSource, /label="What to do now"/);
  assert.match(
    commandCenterSource,
    /<div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">[\s\S]*<CommandCenterBuildRoomExecutionPanel/
  );
});

test("Support and intelligence surfaces are collapsed behind compact summaries", () => {
  assert.match(commandCenterSource, /eyebrow="Operator support"/);
  assert.match(commandCenterSource, /eyebrow="Execution watch"/);
  assert.match(commandCenterSource, /eyebrow="Project intelligence"/);
  assert.match(commandCenterSource, /actionLabel="Open support controls"/);
  assert.match(commandCenterSource, /actionLabel="Open queue detail"/);
  assert.match(commandCenterSource, /actionLabel="Expand intelligence"/);
});

test("Reference slabs no longer sit ahead of the primary Command Center intake", () => {
  assert.doesNotMatch(
    commandCenterSource,
    /<GovernanceReferencePanel governancePolicy=\{governancePolicy\} \/>\s*<RoadmapReferencePanel roadmapPlan=\{roadmapPlan\} \/>\s*<ArchitectureReferencePanel architectureBlueprint=\{architectureBlueprint\} \/>\s*<CommandCenterAnalyzerPanelView[\s\S]*<CommandCenterBuildRoomExecutionPanel/
  );
});

test("Project intelligence still retains governance, roadmap, and architecture references", () => {
  assert.match(commandCenterSource, /<GovernanceReferencePanel governancePolicy=\{governancePolicy\} \/>/);
  assert.match(commandCenterSource, /<RoadmapReferencePanel roadmapPlan=\{roadmapPlan\} \/>/);
  assert.match(
    commandCenterSource,
    /<ArchitectureReferencePanel architectureBlueprint=\{architectureBlueprint\} \/>/
  );
});
