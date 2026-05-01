import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildCommandCenterTaskIntelligenceMetadata,
  formatCommandCenterRoadmapReviewOutcomeLabel
} from "../lib/workspace/command-center-tasks.ts";

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
  assert.match(smartSurfaceSource, /Reviewing/);
  assert.match(smartSurfaceSource, /reviewLaneGuidance\(task\)/);
  assert.match(smartSurfaceSource, /shouldShowRevisionReviewPrompt\(task\)/);
  assert.match(smartSurfaceSource, /shouldShowExecutionReviewPrompt\(task\)/);
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

test("Roadmap review outcomes are derived deterministically from local task and project metadata", () => {
  const roadmapChange = buildCommandCenterTaskIntelligenceMetadata({
    request: "Shift the roadmap and add a new milestone before build.",
    requestType: "change_direction",
    workflowLane: "roadmap_updates",
    roadmapArea: "Product direction",
    projectMetadata: {
      buildSession: {
        scope: {
          summary: "Build the core customer workflow.",
          keyFeatures: ["task queue"]
        }
      }
    }
  });
  const clarification = buildCommandCenterTaskIntelligenceMetadata({
    request: "Fix this",
    requestType: "new_request",
    workflowLane: "requests",
    roadmapArea: "General coordination",
    projectMetadata: null
  });
  const decision = buildCommandCenterTaskIntelligenceMetadata({
    request: "Which option should we approve for launch?",
    requestType: "question_decision",
    workflowLane: "decisions",
    roadmapArea: "Launch",
    projectMetadata: {
      buildSession: {
        scope: {
          summary: "Prepare launch decisions."
        }
      }
    }
  });
  const approved = buildCommandCenterTaskIntelligenceMetadata({
    request: "Revise the onboarding copy in the current launch flow.",
    requestType: "revision",
    workflowLane: "revisions",
    roadmapArea: "Launch",
    projectMetadata: {
      buildSession: {
        scope: {
          summary: "Launch the current customer workflow."
        }
      }
    }
  });
  const outside = buildCommandCenterTaskIntelligenceMetadata({
    request: "Start a brand new project from scratch for a separate product.",
    requestType: "new_request",
    workflowLane: "requests",
    roadmapArea: "Launch",
    projectMetadata: {
      buildSession: {
        scope: {
          summary: "Ship the existing workspace product."
        }
      }
    }
  });

  assert.equal(roadmapChange.roadmapReviewOutcome, "roadmap_revision_needed");
  assert.equal(clarification.roadmapReviewOutcome, "needs_clarification");
  assert.equal(decision.roadmapReviewOutcome, "decision_needed");
  assert.equal(approved.roadmapReviewOutcome, "approved_for_roadmap");
  assert.equal(outside.roadmapReviewOutcome, "out_of_scope");
  assert.equal(
    formatCommandCenterRoadmapReviewOutcomeLabel(roadmapChange.roadmapReviewOutcome),
    "Roadmap revision needed"
  );
});
