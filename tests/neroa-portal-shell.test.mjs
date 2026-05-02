import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const frontDoorSource = readFileSync(new URL("../app/neroa/page.tsx", import.meta.url), "utf8");
const accountPortalSource = readFileSync(
  new URL("../app/neroa/account/page.tsx", import.meta.url),
  "utf8"
);
const accountPortalSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-account-portal-surface.tsx", import.meta.url),
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
  accountPortalSurfaceSource,
  projectPortalSource,
  portalShellSource
];

test("clean Neroa portal shell exports renderable pages and shell primitives", () => {
  assert.match(frontDoorSource, /export default function NeroaPortalFrontDoorPage/);
  assert.match(accountPortalSource, /export default function NeroaAccountPortalPage/);
  assert.match(accountPortalSource, /NeroaAccountPortalSurface/);
  assert.match(accountPortalSurfaceSource, /export function NeroaAccountPortalSurface/);
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
  assert.match(accountPortalSurfaceSource, /"Projects"/);
  assert.match(accountPortalSurfaceSource, /"Billing \/ Usage"/);
  assert.match(accountPortalSurfaceSource, /"Account Settings"/);
  assert.match(accountPortalSurfaceSource, /"Team \/ Access"/);
  assert.match(accountPortalSurfaceSource, /Integrations \/ Infrastructure/);
});

test("Account Portal integrations panel includes planned providers and migration worker guidance", () => {
  assert.match(accountPortalSurfaceSource, /"GitHub"/);
  assert.match(accountPortalSurfaceSource, /"Vercel"/);
  assert.match(accountPortalSurfaceSource, /"Supabase"/);
  assert.match(accountPortalSurfaceSource, /"Stripe"/);
  assert.match(accountPortalSurfaceSource, /"Resend"/);
  assert.match(accountPortalSurfaceSource, /"OpenAI \/ Neroa AI credits"/);
  assert.match(accountPortalSurfaceSource, /"DNS \/ domain setup later"/);
  assert.match(accountPortalSurfaceSource, /"Database Migration Worker later"/);
  assert.match(accountPortalSurfaceSource, /Browser automation is fallback and verification only/);
  assert.match(
    accountPortalSurfaceSource,
    /Risky database, payment, and production changes require explicit customer or admin[\s\S]*approval before execution\./
  );
  assert.match(accountPortalSurfaceSource, /approved Supabase CLI or Postgres worker path/);
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
    assert.doesNotMatch(source, /@\/components\/account\//);
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
    assert.doesNotMatch(source, /@\/lib\/auth/);
    assert.doesNotMatch(source, /@\/lib\/billing/);
    assert.doesNotMatch(source, /@\/components\/site\/public-account-menu/);
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
    assert.doesNotMatch(source, /from\s+["'][^"']*supabase/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*stripe/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*auth/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*redis/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*bullmq/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*openai/i);
    assert.doesNotMatch(source, /digitalocean/i);
    assert.doesNotMatch(source, /queue adapter/i);
    assert.doesNotMatch(source, /storage adapter/i);
  }
});
