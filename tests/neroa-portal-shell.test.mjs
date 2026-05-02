import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const frontDoorSource = readFileSync(new URL("../app/neroa/page.tsx", import.meta.url), "utf8");
const accountPortalSource = readFileSync(
  new URL("../app/neroa/account/page.tsx", import.meta.url),
  "utf8"
);
const projectPortalSource = readFileSync(
  new URL("../app/neroa/project/page.tsx", import.meta.url),
  "utf8"
);
const portalShellSource = readFileSync(
  new URL("../components/neroa-portal/neroa-clean-portal-shell.tsx", import.meta.url),
  "utf8"
);

const cleanPortalSources = [
  frontDoorSource,
  accountPortalSource,
  projectPortalSource,
  portalShellSource
];

test("clean Neroa portal shell exports renderable pages and shell primitives", () => {
  assert.match(frontDoorSource, /export default function NeroaPortalFrontDoorPage/);
  assert.match(accountPortalSource, /export default function NeroaAccountPortalPage/);
  assert.match(projectPortalSource, /export default function NeroaProjectPortalPage/);
  assert.match(portalShellSource, /export function NeroaCleanPortalShell/);
});

test("Account Portal placeholder sections are present", () => {
  assert.match(accountPortalSource, /"Projects"/);
  assert.match(accountPortalSource, /"Billing \/ Usage"/);
  assert.match(accountPortalSource, /"Account Settings"/);
  assert.match(accountPortalSource, /"Team \/ Access"/);
  assert.match(accountPortalSource, /"Integrations \/ Infrastructure"/);
});

test("Project Portal placeholder sections are present", () => {
  assert.match(projectPortalSource, /"Strategy Room"/);
  assert.match(projectPortalSource, /"Command Center"/);
  assert.match(projectPortalSource, /"Project Room"/);
  assert.match(projectPortalSource, /"Evidence \/ Results"/);
  assert.match(projectPortalSource, /"Roadmap \/ Scope"/);
  assert.match(projectPortalSource, /"Approvals \/ Decisions"/);
});

test("clean portal shell does not import legacy room or runtime surfaces", () => {
  for (const source of cleanPortalSources) {
    assert.doesNotMatch(source, /@\/components\/workspace\//);
    assert.doesNotMatch(source, /@\/components\/live-view\//);
    assert.doesNotMatch(source, /@\/components\/marketing\//);
    assert.doesNotMatch(source, /@\/lib\/ai\//);
    assert.doesNotMatch(source, /@\/lib\/build-room\//);
    assert.doesNotMatch(source, /@\/lib\/live-view\//);
    assert.doesNotMatch(source, /codex-relay/);
    assert.doesNotMatch(source, /worker-trigger/);
    assert.doesNotMatch(source, /browser-runtime-bridge/);
    assert.doesNotMatch(source, /build-room-control-room/);
  }
});

test("clean portal shell stays UI-only and avoids runtime or schema behavior", () => {
  for (const source of cleanPortalSources) {
    assert.doesNotMatch(source, /createDraftCodexExecutionPacket/);
    assert.doesNotMatch(source, /createQueuedCodeExecutionWorkerRun/);
    assert.doesNotMatch(source, /createDraftPromptRoomItem/);
    assert.doesNotMatch(source, /submitCodex/);
    assert.doesNotMatch(source, /fetch\(/);
    assert.doesNotMatch(source, /process\.env/);
    assert.doesNotMatch(source, /supabase/i);
    assert.doesNotMatch(source, /redis/i);
    assert.doesNotMatch(source, /bullmq/i);
  }
});
