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
  assert.match(buildRoomExecutionSource, /Request intake/);
  assert.match(buildRoomExecutionSource, /Request details/);
  assert.equal(buildRoomExecutionSource.match(/Request details/g)?.length ?? 0, 1);
  assert.match(buildRoomExecutionSource, /Submit Request/);
  assert.doesNotMatch(buildRoomExecutionSource, /Routing/);
  assert.doesNotMatch(buildRoomExecutionSource, /Pending queue/);
  assert.doesNotMatch(buildRoomExecutionSource, /Working task/);
  assert.doesNotMatch(buildRoomExecutionSource, /Pending execution support/);
});

test("Execution admin slabs are hidden out of the main Command Center flow", () => {
  const requestDetailsIndex = buildRoomExecutionSource.indexOf("Request details");
  const hiddenExecutionIndex = buildRoomExecutionSource.indexOf('className="hidden space-y-4"');
  const hiddenRecentTasksIndex = buildRoomExecutionSource.indexOf('className="hidden mt-4');

  assert.notEqual(requestDetailsIndex, -1);
  assert.notEqual(hiddenExecutionIndex, -1);
  assert.notEqual(hiddenRecentTasksIndex, -1);
  assert.ok(requestDetailsIndex < hiddenExecutionIndex);
  assert.ok(hiddenExecutionIndex < hiddenRecentTasksIndex);
  assert.match(buildRoomExecutionSource, /Execution status/);
  assert.match(buildRoomExecutionSource, /Recent Build Room tasks/);
  assert.match(buildRoomExecutionSource, /Open Build Room Detail/);
});

test("Top operator structure and lower task or prompt support remain visible", () => {
  assert.match(commandCenterSource, /<CommandCenterAnalyzerPanelView/);
  assert.match(commandCenterSource, /<CommandCenterTaskQueuePanelView/);
  assert.match(commandCenterSource, /<CommandCenterPromptRunnerPanelView/);
});
