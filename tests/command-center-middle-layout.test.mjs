import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildCommandCenterTaskAnalyzerClassification,
  buildCommandCenterTaskIntelligenceMetadata,
  formatCommandCenterRoadmapReviewOutcomeLabel
} from "../lib/workspace/command-center-tasks.ts";
import { classifyCommandCenterTaskIntake } from "../lib/workspace/command-center-intake.ts";

const commandCenterSource = readFileSync(
  new URL("../components/workspace/project-command-center-v1.tsx", import.meta.url),
  "utf8"
);
const smartSurfaceSource = readFileSync(
  new URL("../components/workspace/command-center-smart-operator-surface.tsx", import.meta.url),
  "utf8"
);
const commandCenterActionsSource = readFileSync(
  new URL("../app/workspace/[workspaceId]/command-center/actions.ts", import.meta.url),
  "utf8"
);
const commandCenterIntakeSource = readFileSync(
  new URL("../lib/workspace/command-center-intake.ts", import.meta.url),
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
  assert.match(smartSurfaceSource, /shouldShowDecisionReviewPrompt\(task\)/);
  assert.match(smartSurfaceSource, /shouldShowClarificationPrompt\(task\)/);
  assert.match(smartSurfaceSource, /visualCheckpointGuidance\(task\)/);
  assert.match(smartSurfaceSource, /Decision Review/);
  assert.match(smartSurfaceSource, /Clarification Needed/);
  assert.match(smartSurfaceSource, /Neroa needs an answer before moving this task forward\./);
  assert.match(smartSurfaceSource, /Add Answer/);
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

test("Command Center intake can classify through the Neroa One analyzer fallback without execution wiring", async () => {
  const response = await classifyCommandCenterTaskIntake({
    workspaceId: "workspace-alpha",
    workspaceName: "Alpha Workspace",
    visibleDescription: "Keep runtime wiring limited to D-Analyzer outcome classification.",
    projectMetadata: null,
    taskId: "task-alpha",
    title: "Clarify the request",
    request: "Fix this",
    normalizedRequest: "fix this",
    roadmapArea: "General coordination",
    requestType: "new_request",
    workflowLane: "requests",
    sourceType: "customer_request",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z"
  });

  assert.ok(response);
  assert.equal(response.analyzer.source, "mock_fallback");
  assert.equal(response.outcome, "blocked_missing_information");
});

test("Command Center task intelligence preserves all five Neroa One analyzer outcomes", () => {
  const cases = [
    ["ready_to_build", "approved_for_roadmap"],
    ["needs_customer_answer", "decision_needed"],
    ["roadmap_revision_required", "roadmap_revision_needed"],
    ["blocked_missing_information", "needs_clarification"],
    ["rejected_outside_scope", "out_of_scope"]
  ];

  for (const [outcome, reviewOutcome] of cases) {
    const analyzerResponse = {
      requestId: `req-${outcome}`,
      analyzedAt: "2026-05-01T00:00:00.000Z",
      analyzer: {
        source: "mock_fallback",
        version: "neroa_one_task_analyzer_boundary_v1"
      },
      outcome,
      reasoning: {
        summary: `summary for ${outcome}`,
        reasons: [`reason for ${outcome}`],
        missingInformation: [],
        customerQuestions: []
      },
      effects: {
        buildRoomReady: outcome === "ready_to_build",
        requiresRoadmapReview: outcome === "roadmap_revision_required",
        shouldHoldForCustomerAnswer:
          outcome === "needs_customer_answer" || outcome === "blocked_missing_information",
        shouldReject: outcome === "rejected_outside_scope"
      },
      metadata: {
        preserveCurrentBehavior: true,
        caller: "command_center_middle_layout_test"
      }
    };
    const metadata = buildCommandCenterTaskIntelligenceMetadata({
      request: `request for ${outcome}`,
      requestType: outcome === "needs_customer_answer" ? "question_decision" : "new_request",
      workflowLane: outcome === "needs_customer_answer" ? "decisions" : "requests",
      roadmapArea: "General coordination",
      projectMetadata: null,
      analyzerResponse
    });
    const analyzerClassification = buildCommandCenterTaskAnalyzerClassification(analyzerResponse);

    assert.equal(metadata.roadmapReviewOutcome, reviewOutcome);
    assert.deepEqual(metadata.analyzerClassification, analyzerClassification);
    assert.equal(metadata.analyzerClassification?.analyzerOutcome, outcome);
    assert.equal(metadata.analyzerClassification?.analyzerSource, "mock_fallback");
  }
});

test("Command Center create-task intake uses the analyzer boundary and does not wake execution paths", () => {
  const createTaskBranchStart = commandCenterActionsSource.indexOf('if (mutation === "create_task")');
  const createTaskBranchEnd = commandCenterActionsSource.indexOf("} else {", createTaskBranchStart);
  const createTaskBranch = commandCenterActionsSource.slice(createTaskBranchStart, createTaskBranchEnd);

  assert.notEqual(createTaskBranchStart, -1);
  assert.notEqual(createTaskBranchEnd, -1);
  assert.match(createTaskBranch, /classifyCommandCenterTaskIntake\(/);
  assert.match(createTaskBranch, /buildCommandCenterTaskIntelligenceMetadata\(/);
  assert.doesNotMatch(createTaskBranch, /submitBuildRoomTaskToCodex|createBuildRoomTask|updateBuildRoomTask/i);
  assert.doesNotMatch(createTaskBranch, /generateExecutionPacket|buildExecutionPacketSummary|upsertExecutionPacketSummary/i);
  assert.doesNotMatch(createTaskBranch, /createDraftPromptRoomItem|createQueuedCodeExecutionWorkerRun/i);
});

test("Command Center intake helper stays isolated from legacy runtime and provider paths", () => {
  assert.match(commandCenterIntakeSource, /analyzeTaskWithNeroaOne/);
  assert.match(commandCenterIntakeSource, /buildNeroaOneTaskAnalysisRequestFromSpaceContext/);
  assert.doesNotMatch(commandCenterIntakeSource, /build-room\/service|codex-relay|worker-trigger/i);
  assert.doesNotMatch(commandCenterIntakeSource, /generateExecutionPacket|createDraftPromptRoomItem|createQueuedCodeExecutionWorkerRun/i);
  assert.doesNotMatch(commandCenterIntakeSource, /live-view|browser-runtime|browser-extension/i);
  assert.doesNotMatch(commandCenterIntakeSource, /@\/lib\/ai\/|openai|anthropic/i);
});

test("Command Center analyzer wiring does not introduce schema or migration changes", () => {
  assert.doesNotMatch(commandCenterIntakeSource, /create table|alter table|drop table|migration|schema/i);
  assert.doesNotMatch(commandCenterActionsSource, /create table|alter table|drop table|migration/i);
});
