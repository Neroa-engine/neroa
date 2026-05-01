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

test("Review outcomes show compact lane guidance in the task row summary", () => {
  assert.match(smartSurfaceSource, /function reviewLaneGuidance\(task: CommandCenterWorkflowTaskCard\)/);
  assert.match(
    smartSurfaceSource,
    /Use Revisions or Roadmap Updates to align this request with the current roadmap\./
  );
  assert.match(
    smartSurfaceSource,
    /Move this through Decisions so Neroa gets the answer needed to continue\./
  );
  assert.match(
    smartSurfaceSource,
    /Add clarification in Decisions before this request moves forward\./
  );
  assert.match(smartSurfaceSource, /Not in current roadmap\./);
  assert.match(smartSurfaceSource, /Ready for prompt review queue\./);
  assert.match(smartSurfaceSource, /Reviewing roadmap fit\./);
});

test("Roadmap revision-needed tasks show a compact revision review prompt when expanded", () => {
  assert.match(smartSurfaceSource, /function shouldShowRevisionReviewPrompt\(task: CommandCenterWorkflowTaskCard\)/);
  assert.match(smartSurfaceSource, /Revision Review/);
  assert.match(
    smartSurfaceSource,
    /This request appears to change the approved roadmap or build\s+direction\./
  );
  assert.match(
    smartSurfaceSource,
    /Please confirm before changing direction\./
  );
  assert.match(smartSurfaceSource, /Confirm Revision/);
  assert.match(smartSurfaceSource, /Keep Current Roadmap/);
  assert.match(smartSurfaceSource, /Not yet wired/);
  assert.match(smartSurfaceSource, /type="button"/);
  assert.match(smartSurfaceSource, /disabled/);
});

test("Approved roadmap tasks show a compact prompt review queue prompt when expanded", () => {
  assert.match(smartSurfaceSource, /function shouldShowExecutionReviewPrompt\(task: CommandCenterWorkflowTaskCard\)/);
  assert.match(smartSurfaceSource, /Prompt Review Queue/);
  assert.match(
    smartSurfaceSource,
    /This task fits the current roadmap and will be prepared for\s+the internal prompt\/build queue\./
  );
  assert.match(smartSurfaceSource, /Prepare Queue Entry/);
  assert.match(smartSurfaceSource, /Pause Queue Prep/);
  assert.doesNotMatch(
    smartSurfaceSource,
    /This task fits the current roadmap and is ready for execution\s+review\./
  );
  assert.doesNotMatch(
    smartSurfaceSource,
    /Please approve before sending to Build Room\./
  );
  assert.doesNotMatch(smartSurfaceSource, /Approve Execution/);
  assert.doesNotMatch(smartSurfaceSource, /Hold Task/);
  assert.match(smartSurfaceSource, /Not yet wired/);
  assert.match(smartSurfaceSource, /type="button"/);
  assert.match(smartSurfaceSource, /disabled/);
});

test("Expanded review prompts use tighter spacing and padding", () => {
  assert.match(smartSurfaceSource, /mt-2 space-y-2/);
  assert.match(smartSurfaceSource, /rounded-\[14px\] border border-amber-300\/25 bg-amber-400\/10 px-3 py-2\.5/);
  assert.match(smartSurfaceSource, /rounded-\[14px\] border border-emerald-300\/25 bg-emerald-400\/10 px-3 py-2\.5/);
  assert.match(smartSurfaceSource, /mt-1\.5 text-sm leading-5/);
  assert.match(smartSurfaceSource, /mt-2 flex flex-wrap gap-1\.5/);
  assert.match(smartSurfaceSource, /px-3 py-1\.5 text-\[10px\]/);
});

test("Decision-needed and clarification tasks show compact answer prompts when expanded", () => {
  assert.match(
    smartSurfaceSource,
    /function shouldShowDecisionReviewPrompt\(task: CommandCenterWorkflowTaskCard\)/
  );
  assert.match(
    smartSurfaceSource,
    /function shouldShowClarificationPrompt\(task: CommandCenterWorkflowTaskCard\)/
  );
  assert.match(smartSurfaceSource, /Decision Review/);
  assert.match(smartSurfaceSource, /Clarification Needed/);
  assert.match(
    smartSurfaceSource,
    /Neroa needs an answer before moving this task forward\./
  );
  assert.match(smartSurfaceSource, /Add Answer/);
  assert.match(smartSurfaceSource, /Not yet wired/);
  assert.match(smartSurfaceSource, /type="button"/);
  assert.match(smartSurfaceSource, /disabled/);
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
