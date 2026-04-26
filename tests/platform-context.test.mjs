import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COMMAND_CENTER_PENDING_EXECUTION_TASK_SOURCE_TYPE,
  COMMAND_CENTER_PENDING_EXECUTION_TASK_STATUS,
  DEFAULT_PLATFORM_CONTEXT,
  buildPendingExecutionCaptureRecord,
  getPlatformSurface,
  isPlatformApprovalAuthority,
  loadPlatformContext,
  resolvePlatformApprovalRoute,
  resolvePlatformExecutionGateState
} from "../lib/intelligence/platform-context.ts";

test("loads the default operating intelligence when no stored platform context exists", () => {
  const platformContext = loadPlatformContext(null);

  assert.deepEqual(platformContext, DEFAULT_PLATFORM_CONTEXT);
  assert.equal(platformContext.verification.referenceCommit, "f671e76abcebc21c681a2d57ec23493a365d170e");
});

test("blocked Command Center execution reads copy and CTA routing from operating intelligence", () => {
  const executionGate = resolvePlatformExecutionGateState({
    platformContext: DEFAULT_PLATFORM_CONTEXT,
    workspaceId: "workspace-123",
    signals: {
      roomStateDataState: "degraded",
      blockingOpenCount: 0,
      activePhaseLabel: "MVP Build Plan"
    }
  });

  assert.equal(executionGate.approvalRequired, true);
  assert.equal(executionGate.shouldExecute, false);
  assert.equal(
    executionGate.blockedPanel.title,
    DEFAULT_PLATFORM_CONTEXT.executionGate.whenBlocked.messageTitle
  );
  assert.equal(
    executionGate.blockedPanel.body,
    DEFAULT_PLATFORM_CONTEXT.executionGate.whenBlocked.messageBody
  );
  assert.equal(executionGate.blockedPanel.noteLabel, "Saved as pending execution");
  assert.deepEqual(
    executionGate.blockedPanel.ctas.map((cta) => cta.href),
    [
      "/workspace/workspace-123/strategy-room",
      "/workspace/workspace-123/strategy-room"
    ]
  );
});

test("Strategy Room remains the roadmap and scope approval authority", () => {
  const strategyRoomSurface = getPlatformSurface(DEFAULT_PLATFORM_CONTEXT, "strategy_room");

  assert.ok(strategyRoomSurface);
  assert.equal(strategyRoomSurface?.purpose, DEFAULT_PLATFORM_CONTEXT.surfaces.strategyRoom.purpose);
  assert.equal(isPlatformApprovalAuthority(DEFAULT_PLATFORM_CONTEXT, "strategy_room"), true);
  assert.equal(
    resolvePlatformApprovalRoute(DEFAULT_PLATFORM_CONTEXT, "workspace-123"),
    "/workspace/workspace-123/strategy-room"
  );
});

test("pending execution capture keeps the existing stored task model while marking the request as pending execution", () => {
  const pendingCapture = buildPendingExecutionCaptureRecord({
    platformContext: DEFAULT_PLATFORM_CONTEXT,
    id: "task-123",
    title: "Tighten scope",
    request: "Please tighten the scope before running this task.",
    roadmapArea: "Product direction",
    createdAt: "2026-04-25T10:00:00.000Z",
    updatedAt: "2026-04-25T10:00:00.000Z"
  });

  assert.equal(pendingCapture.execute, false);
  assert.equal(pendingCapture.saveRequestAs, "pending_execution");
  assert.equal(
    pendingCapture.commandCenterTask.status,
    COMMAND_CENTER_PENDING_EXECUTION_TASK_STATUS
  );
  assert.equal(
    pendingCapture.commandCenterTask.sourceType,
    COMMAND_CENTER_PENDING_EXECUTION_TASK_SOURCE_TYPE
  );
});

test("execution can proceed once roadmap approval signals are clear", () => {
  const executionGate = resolvePlatformExecutionGateState({
    platformContext: DEFAULT_PLATFORM_CONTEXT,
    workspaceId: "workspace-123",
    signals: {
      roomStateDataState: "stable",
      blockingOpenCount: 0,
      activePhaseLabel: "MVP Build Plan"
    }
  });

  assert.equal(executionGate.approvalRequired, false);
  assert.equal(executionGate.shouldExecute, true);
});

test("runtime files consume the shared operating intelligence helpers", () => {
  const commandCenterPanelSource = readFileSync(
    new URL("../components/workspace/command-center-build-room-execution-panel.tsx", import.meta.url),
    "utf8"
  );
  const commandCenterActionSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/command-center/actions.ts", import.meta.url),
    "utf8"
  );
  const strategyRoomSource = readFileSync(
    new URL("../components/workspace/project-strategy-room-v1.tsx", import.meta.url),
    "utf8"
  );

  assert.match(commandCenterPanelSource, /resolvePlatformExecutionGateState/);
  assert.match(commandCenterActionSource, /buildPendingExecutionCaptureRecord/);
  assert.match(strategyRoomSource, /isPlatformApprovalAuthority/);
  assert.doesNotMatch(commandCenterPanelSource, /Execution blocked/);
  assert.doesNotMatch(
    commandCenterPanelSource,
    /Your recent task was saved, but it cannot be executed yet because the current roadmap and scope have not been approved\./
  );
});
