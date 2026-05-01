import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const commandCenterSource = readFileSync(
  new URL("../components/workspace/project-command-center-v1.tsx", import.meta.url),
  "utf8"
);
const smartSurfaceSource = readFileSync(
  new URL("../components/workspace/command-center-smart-operator-surface.tsx", import.meta.url),
  "utf8"
);

test("Main flow keeps one shared workflow surface above the customer task queue", () => {
  const headerIndex = commandCenterSource.indexOf("Command Center");
  const workflowSurfaceIndex = commandCenterSource.indexOf("<CommandCenterSmartOperatorSurface");
  const liveTaskSourceIndex = commandCenterSource.indexOf("sortTasksForCustomerQueue(");

  assert.notEqual(headerIndex, -1);
  assert.notEqual(workflowSurfaceIndex, -1);
  assert.notEqual(liveTaskSourceIndex, -1);
  assert.ok(headerIndex < workflowSurfaceIndex);
  assert.ok(liveTaskSourceIndex < workflowSurfaceIndex);
  assert.match(commandCenterSource, /<CommandCenterSmartOperatorSurface/);
  assert.doesNotMatch(commandCenterSource, /<CommandCenterTaskQueuePanelView/);
  assert.doesNotMatch(commandCenterSource, /<CommandCenterPromptRunnerPanelView/);
  assert.doesNotMatch(commandCenterSource, /<CommandCenterAnalyzerPanelView/);
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

test("Customer workflow language replaces the old operator and prompt framing", () => {
  assert.match(commandCenterSource, /Send requests, revisions, decisions, and review notes from one place\./);
  assert.match(commandCenterSource, /<CommandCenterSmartOperatorSurface/);
  assert.match(commandCenterSource, /liveCommandCenterTasks/);
  assert.doesNotMatch(commandCenterSource, /PromptRunner/);
  assert.doesNotMatch(commandCenterSource, /AnalyzerPanel/);
});

test("Customer queue keeps the live row list and empty state behavior", () => {
  assert.match(smartSurfaceSource, /No customer tasks are in/);
  assert.match(smartSurfaceSource, /tasks\.filter\(\(task\) => resolveTaskTab\(task\) === activeTab\)/);
  assert.match(smartSurfaceSource, /bucketTasks\.map\(\(task\) =>/);
  assert.match(smartSurfaceSource, /cursor-pointer/);
  assert.match(smartSurfaceSource, /min-h-\[52px\]/);
});

test("Composer stays populated on failure paths and prevents repeat submits while pending", () => {
  assert.doesNotMatch(
    smartSurfaceSource,
    /catch[\s\S]*setRequestValue\(""\)/
  );
  assert.match(smartSurfaceSource, /const \[isSubmitting, setIsSubmitting\] = useState\(false\)/);
  assert.match(smartSurfaceSource, /disabled=\{!canManage \|\| isSubmitting\}/);
  assert.match(smartSurfaceSource, /const canSubmitRequest = canManage && requestValue\.trim\(\)\.length > 0 && !isSubmitting;/);
});
