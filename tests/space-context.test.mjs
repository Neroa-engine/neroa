import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSpaceContext, buildRoomContracts } from "../lib/space/space-context.ts";

const spaceContextSource = readFileSync(
  new URL("../lib/space/space-context.ts", import.meta.url),
  "utf8"
);

function buildWorkspaceStyleMetadata() {
  return {
    strategyState: {
      revisionRecords: [{ id: "revision-1" }],
      planningThreadState: {
        messages: [{ id: "msg-1" }, { id: "msg-2" }]
      }
    },
    governanceState: {
      scopeApprovalRecord: {
        status: "approved"
      },
      roadmapRevisionRecords: [{ id: "roadmap-revision-1" }]
    },
    executionState: {
      pendingExecutions: [{ id: "pending-1" }],
      executionPackets: [{ id: "packet-1" }]
    },
    commandCenterDecisions: [{ id: "decision-1" }],
    commandCenterChangeReviews: [{ id: "change-review-1" }],
    commandCenterTasks: [{ id: "task-1" }],
    commandCenterPreviewState: {
      state: "previewing"
    },
    commandCenterApprovedDesignPackage: {
      status: "approved_for_implementation"
    },
    assets: [{ id: "asset-1" }, { id: "asset-2" }],
    billingState: {
      engineCreditsRemaining: 120,
      selectedPlanId: "builder"
    },
    buildSession: {
      scope: {
        summary: "A guided project truth spine for all active rooms.",
        businessGoal: "Create one shared read model.",
        firstBuild: ["Shared status surface"],
        keyFeatures: ["Read-only room contracts"],
        frameworkLabel: "Next.js"
      }
    }
  };
}

test("SpaceContext can be built from existing workspace-style metadata", () => {
  const context = buildSpaceContext({
    workspaceId: "workspace-alpha",
    projectId: "project-alpha",
    projectTitle: "Alpha Project",
    projectDescription: "Workspace metadata driven project.",
    projectMetadata: buildWorkspaceStyleMetadata()
  });

  assert.equal(context.projectTitle, "Alpha Project");
  assert.equal(context.projectTruthSummary, "A guided project truth spine for all active rooms.");
  assert.equal(context.commandState.taskCount, 1);
  assert.equal(context.buildState.executionPacketCount, 1);
});

test("SpaceContext preserves workspaceId and projectId separately", () => {
  const context = buildSpaceContext({
    workspaceId: "workspace-alpha",
    projectId: "project-beta",
    projectTitle: "Separated Project",
    projectMetadata: buildWorkspaceStyleMetadata()
  });

  assert.equal(context.workspaceId, "workspace-alpha");
  assert.equal(context.projectId, "project-beta");
  assert.equal(context.spaceId, "project-beta");
});

test("SpaceContext marks compatibility mode when projectId === workspaceId", () => {
  const context = buildSpaceContext({
    workspaceId: "workspace-alpha",
    projectId: "workspace-alpha",
    projectTitle: "Compatibility Project",
    projectMetadata: buildWorkspaceStyleMetadata()
  });

  assert.equal(context.compatibilityMode, "workspace_project_compat");
  assert.equal(context.isCompatibilityMode, true);
});

test("Project Room is classified as dashboard control panel", () => {
  const contract = buildRoomContracts().find((item) => item.roomId === "project");

  assert.ok(contract);
  assert.equal(contract?.classification, "dashboard_control_panel");
});

test("Strategy Room is classified as planning room", () => {
  const contract = buildRoomContracts().find((item) => item.roomId === "strategy");

  assert.ok(contract);
  assert.equal(contract?.classification, "planning_room");
});

test("Command Center is classified as customer operations room", () => {
  const contract = buildRoomContracts().find((item) => item.roomId === "command");

  assert.ok(contract);
  assert.equal(contract?.classification, "customer_operations_room");
});

test("Build Room is classified as execution room", () => {
  const contract = buildRoomContracts().find((item) => item.roomId === "build");

  assert.ok(contract);
  assert.equal(contract?.classification, "execution_room");
});

test("Library is classified as evidence room", () => {
  const contract = buildRoomContracts().find((item) => item.roomId === "library");

  assert.ok(contract);
  assert.equal(contract?.classification, "evidence_room");
});

test("RoomContract defines allowed and blocked actions for each room", () => {
  for (const contract of buildRoomContracts()) {
    assert.ok(contract.allowedActions.length > 0);
    assert.ok(contract.blockedActions.length > 0);
    assert.ok(contract.truthInputs.length > 0);
    assert.ok(contract.truthOutputs.length > 0);
  }
});

test("No AI or model call is made by the SpaceContext builder", () => {
  assert.doesNotMatch(spaceContextSource, /from\s+["']openai["']/i);
  assert.doesNotMatch(spaceContextSource, /@\/lib\/ai\//i);
  assert.doesNotMatch(spaceContextSource, /buildWorkspaceProjectIntelligence/);
  assert.doesNotMatch(spaceContextSource, /createNeroaOneResponse|classifyCustomerIntent|OpenAI|anthropic/i);
});

test("SpaceContext can be passed forward without recomputing intelligence", () => {
  const context = buildSpaceContext({
    workspaceId: "workspace-gamma",
    projectTitle: "Forwarded Context Project",
    projectMetadata: buildWorkspaceStyleMetadata(),
    precomputed: {
      projectTruthSummary: "Precomputed shared truth summary.",
      currentPhase: "scope",
      currentFocus: ["Use the forwarded shared read model."],
      nextRecommendedAction: "Keep using the precomputed SpaceContext."
    }
  });

  assert.equal(context.projectTruthSummary, "Precomputed shared truth summary.");
  assert.equal(context.currentPhase, "scope");
  assert.deepEqual(context.currentFocus, ["Use the forwarded shared read model."]);
  assert.equal(
    context.nextRecommendedAction,
    "Keep using the precomputed SpaceContext."
  );
});
