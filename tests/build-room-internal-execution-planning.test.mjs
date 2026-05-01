import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const buildRoomSource = readFileSync(
  new URL("../components/workspace/build-room-control-room.tsx", import.meta.url),
  "utf8"
);
const commandCenterSource = readFileSync(
  new URL("../components/workspace/project-command-center-v1.tsx", import.meta.url),
  "utf8"
);

test("Build Room exposes internal execution zones", () => {
  assert.match(buildRoomSource, /Execution Planning/);
  assert.match(buildRoomSource, /Build Execution/);
  assert.match(buildRoomSource, /QA \/ QC/);
  assert.match(buildRoomSource, /Evidence \/ Results/);
  assert.match(buildRoomSource, /Usage \/ Controls/);
  assert.match(buildRoomSource, /customer intent type/i);
  assert.match(buildRoomSource, /command center lane/i);
  assert.match(buildRoomSource, /normalized request/i);
  assert.match(buildRoomSource, /execution task type/i);
  assert.match(buildRoomSource, /requested output mode/i);
  assert.match(buildRoomSource, /prompt package status/i);
});

test("Build Room internal planning stays read-only and separate from worker changes", () => {
  assert.match(
    buildRoomSource,
    /does not\s+change worker behavior,\s+relay behavior,\s+or\s+customer-facing intake/i
  );
  assert.match(
    buildRoomSource,
    /read-only planning cue\.\s+Worker approval and execution behavior remain unchanged\./i
  );
});

test("Build Room demotes the old intake snapshot and keeps future QC surfaces as placeholders", () => {
  assert.doesNotMatch(buildRoomSource, /Execution Intake Snapshot/);
  assert.match(buildRoomSource, /Future browser inspection/);
  assert.match(buildRoomSource, /Future visual inspector/);
  assert.match(buildRoomSource, /Future QC inspector/);
  assert.match(buildRoomSource, /Future video recorder/);
});

test("Build Room no longer exposes customer intake controls", () => {
  assert.doesNotMatch(buildRoomSource, /Open Command Center Intake/);
  assert.doesNotMatch(buildRoomSource, /Start or Revise in Command Center/);
  assert.doesNotMatch(buildRoomSource, /build-room-title/);
  assert.doesNotMatch(buildRoomSource, /build-room-task-type/);
  assert.doesNotMatch(buildRoomSource, /build-room-output-mode/);
  assert.doesNotMatch(buildRoomSource, /build-room-user-request/);
  assert.doesNotMatch(buildRoomSource, /build-room-acceptance/);
  assert.doesNotMatch(buildRoomSource, /build-room-risk/);
  assert.doesNotMatch(buildRoomSource, /persistComposer/);
  assert.match(buildRoomSource, /No approved build handoff yet\. Start from Command Center\./);
  assert.match(buildRoomSource, /No Neroa One handoff package yet\./);
});

test("Build Room can bind a read-only handoff preview from live Command Center tasks", () => {
  assert.match(buildRoomSource, /buildBuildRoomCustomerTaskHandoffPackage/);
  assert.match(buildRoomSource, /A live Command Center task is staged here as a read-only handoff preview/i);
});

test("Command Center remains free of Prompt Runner after the stripdown", () => {
  assert.doesNotMatch(commandCenterSource, /PromptRunner/);
  assert.doesNotMatch(commandCenterSource, /Prompt Runner/);
});
