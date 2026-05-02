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

test("/neroa front door stays minimal and clean", () => {
  assert.match(frontDoorSource, /"Account Portal"/);
  assert.match(frontDoorSource, /"Project Portal"/);
  assert.match(frontDoorSource, /Public front door shell only\./);
  assert.doesNotMatch(frontDoorSource, /Open Strategy Room/);
  assert.doesNotMatch(frontDoorSource, /Pricing/);
  assert.doesNotMatch(frontDoorSource, /Auth entry/);
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

test("clean portal shell does not introduce UI UX Library or Design Library surfaces", () => {
  for (const source of cleanPortalSources) {
    assert.doesNotMatch(source, /UI\/UX Library/);
    assert.doesNotMatch(source, /Design Library/);
    assert.doesNotMatch(source, /visual editor/i);
    assert.doesNotMatch(source, /design mode/i);
    assert.doesNotMatch(source, /colorway/i);
    assert.doesNotMatch(source, /component-library/i);
  }
});

test("clean portal shell does not import legacy room or runtime surfaces", () => {
  for (const source of cleanPortalSources) {
    assert.doesNotMatch(source, /@\/components\/workspace\//);
    assert.doesNotMatch(source, /@\/components\/live-view\//);
    assert.doesNotMatch(source, /@\/components\/marketing\//);
    assert.doesNotMatch(source, /@\/lib\/ai\//);
    assert.doesNotMatch(source, /@\/lib\/build-room\//);
    assert.doesNotMatch(source, /@\/lib\/live-view\//);
    assert.doesNotMatch(source, /command-center\/actions/);
    assert.doesNotMatch(source, /strategy-room\/actions/);
    assert.doesNotMatch(source, /build-room\/service/);
    assert.doesNotMatch(source, /build-room\/contracts/);
    assert.doesNotMatch(source, /codex-relay/);
    assert.doesNotMatch(source, /worker-trigger/);
    assert.doesNotMatch(source, /browser-runtime-bridge/);
    assert.doesNotMatch(source, /qc-library-bridge/);
    assert.doesNotMatch(source, /extension runtime/i);
    assert.doesNotMatch(source, /recording runtime/i);
    assert.doesNotMatch(source, /build-room-control-room/);
  }
});

test("clean portal shell does not import legacy marketing auth or routing surfaces", () => {
  for (const source of cleanPortalSources) {
    assert.doesNotMatch(source, /FrontDoorHomeHero/);
    assert.doesNotMatch(source, /MarketingInfoShell/);
    assert.doesNotMatch(source, /public-launch/);
    assert.doesNotMatch(source, /requireUser/);
    assert.doesNotMatch(source, /getOptionalUser/);
    assert.doesNotMatch(source, /redirect\(/);
  }
});

test("clean portal shell does not import Neroa One runtime wiring", () => {
  for (const source of cleanPortalSources) {
    assert.doesNotMatch(source, /@\/lib\/neroa-one\//);
    assert.doesNotMatch(source, /analyzeTaskWithNeroaOne/);
    assert.doesNotMatch(source, /commandCenterLanes/);
    assert.doesNotMatch(source, /createNeroaOneOutcomeQueueEntry/);
    assert.doesNotMatch(source, /createDraftCodexExecutionPacket/);
    assert.doesNotMatch(source, /createQueuedCodeExecutionWorkerRun/);
  }
});

test("clean portal shell stays UI-only and avoids runtime or schema behavior", () => {
  for (const source of cleanPortalSources) {
    assert.doesNotMatch(source, /createDraftPromptRoomItem/);
    assert.doesNotMatch(source, /submitCodex/);
    assert.doesNotMatch(source, /fetch\(/);
    assert.doesNotMatch(source, /process\.env/);
    assert.doesNotMatch(source, /supabase/i);
    assert.doesNotMatch(source, /redis/i);
    assert.doesNotMatch(source, /bullmq/i);
    assert.doesNotMatch(source, /digitalocean/i);
    assert.doesNotMatch(source, /queue adapter/i);
    assert.doesNotMatch(source, /storage adapter/i);
  }
});
