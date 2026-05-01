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

test("Command Center keeps the top operator surface ahead of the lower task flow", () => {
  const headerIndex = commandCenterSource.indexOf("Send requests, revisions, decisions, and review notes from one place.");
  const workflowSurfaceIndex = commandCenterSource.indexOf("<CommandCenterSmartOperatorSurface");
  const taskCardsIndex = commandCenterSource.indexOf("const taskCards: CommandCenterWorkflowTaskCard[] = sortTasksForCustomerQueue(");

  assert.notEqual(headerIndex, -1);
  assert.notEqual(workflowSurfaceIndex, -1);
  assert.notEqual(taskCardsIndex, -1);
  assert.ok(headerIndex < workflowSurfaceIndex);
  assert.ok(taskCardsIndex < workflowSurfaceIndex);
});

test("Command Center keeps one shared workflow surface and a lower customer task queue", () => {
  assert.match(
    commandCenterSource,
    /<CommandCenterSmartOperatorSurface[\s\S]*tasks=\{taskCards\}/
  );
  assert.match(commandCenterSource, /liveCommandCenterTasks: StoredCommandCenterTask\[];/);
  assert.match(commandCenterSource, /Send requests, revisions, decisions, and review notes from one place\./);
  assert.doesNotMatch(commandCenterSource, /<CommandCenterPromptRunnerPanelView/);
  assert.doesNotMatch(commandCenterSource, /<CommandCenterTaskQueuePanelView/);
});

test("Customer tasks render as compact expandable live rows instead of oversized cards", () => {
  assert.match(smartSurfaceSource, /<details/);
  assert.match(smartSurfaceSource, /<summary className="flex min-h-\[52px\] cursor-pointer/);
  assert.match(smartSurfaceSource, /View/);
  assert.match(smartSurfaceSource, /formatTaskTimestamp\(task\)/);
  assert.match(smartSurfaceSource, /reviewStatusLabel\(task\)/);
  assert.match(smartSurfaceSource, /reviewStatusClasses\(/);
  assert.doesNotMatch(
    smartSurfaceSource,
    /<article[\s\S]*<p className="mt-2 text-sm leading-6 text-slate-600">\{task\.request\}<\/p>/
  );
});

test("Every live task row shows a compact review status chip", () => {
  assert.match(smartSurfaceSource, /function reviewStatusLabel\(task: CommandCenterWorkflowTaskCard\)/);
  assert.match(smartSurfaceSource, /return "Reviewing";/);
  assert.match(smartSurfaceSource, /formatCommandCenterRoadmapReviewOutcomeLabel/);
  assert.match(smartSurfaceSource, /approved_for_roadmap/);
  assert.match(smartSurfaceSource, /needs_clarification/);
  assert.match(smartSurfaceSource, /roadmap_revision_needed/);
  assert.match(smartSurfaceSource, /decision_needed/);
  assert.match(smartSurfaceSource, /out_of_scope/);
});

test("Command Center composer clears only after successful submit", () => {
  assert.match(smartSurfaceSource, /async function handleCreateTask\(formData: FormData\)/);
  assert.match(smartSurfaceSource, /await createTaskAction\(formData\);[\s\S]*setRequestValue\(""\)/);
  assert.match(smartSurfaceSource, /finally \{[\s\S]*setIsSubmitting\(false\);/);
  assert.match(smartSurfaceSource, /disabled=\{!canSubmitRequest\}/);
  assert.match(smartSurfaceSource, /Sending\.\.\./);
});

test("Command Center task list does not reintroduce placeholder sample blocks", () => {
  assert.doesNotMatch(smartSurfaceSource, /Start homepage/i);
  assert.doesNotMatch(smartSurfaceSource, /sample task/i);
});

test("Command Center no longer hides the main operator structure behind restoration regressions", () => {
  assert.doesNotMatch(commandCenterSource, /CommandCenterCompactSignal/);
  assert.doesNotMatch(commandCenterSource, /CommandCenterSupportSummary/);
  assert.doesNotMatch(commandCenterSource, /eyebrow="Operator support"/);
  assert.doesNotMatch(commandCenterSource, /eyebrow="Execution watch"/);
  assert.doesNotMatch(commandCenterSource, /eyebrow="Project intelligence"/);
});

test("Lower half clutter is removed from the main page flow", () => {
  assert.match(commandCenterSource, /<CommandCenterSmartOperatorSurface/);
  assert.doesNotMatch(commandCenterSource, /<CommandCenterBuildRoomExecutionPanel/);
  assert.doesNotMatch(commandCenterSource, /<CommandCenterAnalyzerPanelView/);
  assert.doesNotMatch(commandCenterSource, /<CommandCenterPromptRunnerPanelView/);
  assert.doesNotMatch(commandCenterSource, /<CommandCenterTaskQueuePanelView/);
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
