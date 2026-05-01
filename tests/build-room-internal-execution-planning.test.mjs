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

test("Build Room exposes an internal execution planning section", () => {
  assert.match(buildRoomSource, /Internal Execution Planning/);
  assert.match(buildRoomSource, /task intent/i);
  assert.match(buildRoomSource, /requested output mode/i);
  assert.match(buildRoomSource, /prompt package status/i);
});

test("Build Room internal planning stays read-only and separate from worker changes", () => {
  assert.match(
    buildRoomSource,
    /does not\s+change worker behavior,\s+relay behavior,\s+or customer-facing intake/i
  );
  assert.match(
    buildRoomSource,
    /read-only planning cue\.\s+Worker approval and execution behavior remain unchanged\./i
  );
});

test("Command Center remains free of Prompt Runner after the stripdown", () => {
  assert.doesNotMatch(commandCenterSource, /PromptRunner/);
  assert.doesNotMatch(commandCenterSource, /Prompt Runner/);
});
