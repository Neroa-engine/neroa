import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const buildRoomExecutionSource = readFileSync(
  new URL("../components/workspace/command-center-build-room-execution-panel.tsx", import.meta.url),
  "utf8"
);
const commandCenterSource = readFileSync(
  new URL("../components/workspace/project-command-center-v1.tsx", import.meta.url),
  "utf8"
);

test("Command Center middle stack keeps one primary request surface", () => {
  assert.match(buildRoomExecutionSource, /Request details/);
  assert.equal(buildRoomExecutionSource.match(/Request details/g)?.length ?? 0, 1);
  assert.doesNotMatch(buildRoomExecutionSource, /Command Center to Build Room/);
  assert.doesNotMatch(buildRoomExecutionSource, /Pending release queue/);
  assert.doesNotMatch(buildRoomExecutionSource, /Start Build Room work from Command Center/);
});

test("Execution support is merged into one status surface with compact details", () => {
  const requestDetailsIndex = buildRoomExecutionSource.indexOf("Request details");
  const executionStatusIndex = buildRoomExecutionSource.indexOf("Execution status");
  const recentTasksIndex = buildRoomExecutionSource.indexOf("Recent Build Room tasks");

  assert.notEqual(requestDetailsIndex, -1);
  assert.notEqual(executionStatusIndex, -1);
  assert.notEqual(recentTasksIndex, -1);
  assert.ok(requestDetailsIndex < executionStatusIndex);
  assert.ok(executionStatusIndex < recentTasksIndex);
  assert.match(buildRoomExecutionSource, /Pending execution support/);
  assert.match(buildRoomExecutionSource, /QA \/ release/);
  assert.match(buildRoomExecutionSource, /Billing \/ protection/);
  assert.doesNotMatch(buildRoomExecutionSource, /No execution request selected/);
});

test("Top operator structure and lower task or prompt support remain visible", () => {
  assert.match(commandCenterSource, /<CommandCenterAnalyzerPanelView/);
  assert.match(commandCenterSource, /<CommandCenterTaskQueuePanelView/);
  assert.match(commandCenterSource, /<CommandCenterPromptRunnerPanelView/);
});
