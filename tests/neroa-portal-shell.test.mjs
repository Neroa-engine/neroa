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
const projectPortalSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-project-portal-surface.tsx", import.meta.url),
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
  projectPortalSurfaceSource,
  portalShellSource
];
const accountPortalSources = [accountPortalSource, accountPortalSurfaceSource];
const projectPortalSources = [projectPortalSource, projectPortalSurfaceSource];

test("clean Neroa portal shell exports renderable pages and shell primitives", () => {
  assert.match(frontDoorSource, /export default function NeroaPortalFrontDoorPage/);
  assert.match(accountPortalSource, /export default function NeroaAccountPortalPage/);
  assert.match(accountPortalSource, /NeroaAccountPortalSurface/);
  assert.match(accountPortalSurfaceSource, /export function NeroaAccountPortalSurface/);
  assert.match(projectPortalSource, /export default function NeroaProjectPortalPage/);
  assert.match(projectPortalSource, /NeroaProjectPortalSurface/);
  assert.match(projectPortalSurfaceSource, /export function NeroaProjectPortalSurface/);
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

test("Account Portal remains account-level only and does not promote project portal sections as primary sections", () => {
  assert.doesNotMatch(accountPortalSurfaceSource, /title:\s*"Strategy Room"/);
  assert.doesNotMatch(accountPortalSurfaceSource, /title:\s*"Command Center"/);
  assert.doesNotMatch(accountPortalSurfaceSource, /title:\s*"Project Room"/);
  assert.doesNotMatch(accountPortalSurfaceSource, /title:\s*"Evidence \/ Results"/);
  assert.doesNotMatch(accountPortalSurfaceSource, /title:\s*"Roadmap \/ Scope"/);
  assert.doesNotMatch(accountPortalSurfaceSource, /title:\s*"Approvals \/ Decisions"/);
});

test("Account Portal panels stay planning-only and not live runtime surfaces", () => {
  assert.match(accountPortalSurfaceSource, /It is not the project execution home\./);
  assert.match(accountPortalSurfaceSource, /does not connect to Stripe, payment state, credits, or invoice data yet\./);
  assert.match(accountPortalSurfaceSource, /No auth runtime, profile saving, or settings persistence is connected in this pass\./);
  assert.match(accountPortalSurfaceSource, /does not connect to team membership, invites, auth providers, or access enforcement yet\./);
  assert.match(
    accountPortalSurfaceSource,
    /does not[\s\S]*create connections, fake connected states, or imply that provider runtime flows are[\s\S]*active\./
  );
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

test("Account Portal does not imply live saving or connected integration state", () => {
  assert.doesNotMatch(accountPortalSurfaceSource, /<form/i);
  assert.doesNotMatch(accountPortalSurfaceSource, /Connected\b/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Save Changes/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Sync Now/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Connect /);
});

test("Project Portal placeholder sections are present", () => {
  assert.match(projectPortalSurfaceSource, /title:\s*"Strategy Room"/);
  assert.match(projectPortalSurfaceSource, /title:\s*"Command Center"/);
  assert.match(projectPortalSurfaceSource, /title:\s*"Project Room"/);
  assert.match(projectPortalSurfaceSource, /title:\s*"Evidence \/ Results"/);
  assert.match(projectPortalSurfaceSource, /title:\s*"Roadmap \/ Scope"/);
  assert.match(projectPortalSurfaceSource, /title:\s*"Approvals \/ Decisions"/);
});

test("Project Portal remains project-level only and does not promote account sections as primary sections", () => {
  assert.doesNotMatch(projectPortalSurfaceSource, /title:\s*"Projects"/);
  assert.doesNotMatch(projectPortalSurfaceSource, /title:\s*"Billing \/ Usage"/);
  assert.doesNotMatch(projectPortalSurfaceSource, /title:\s*"Account Settings"/);
  assert.doesNotMatch(projectPortalSurfaceSource, /title:\s*"Team \/ Access"/);
  assert.doesNotMatch(projectPortalSurfaceSource, /title:\s*"Integrations \/ Infrastructure"/);
});

test("Project Portal panels stay planning-only and not live runtime surfaces", () => {
  assert.match(projectPortalSurfaceSource, /not the intelligence owner yet/);
  assert.match(projectPortalSurfaceSource, /not the routing owner/);
  assert.match(projectPortalSurfaceSource, /not the execution home/);
  assert.match(projectPortalSurfaceSource, /not Live View, QC runtime, browser recording, or extension-driven runtime/);
  assert.match(projectPortalSurfaceSource, /not the live strategy runtime/);
  assert.match(projectPortalSurfaceSource, /not a live workflow engine/);
});

test("Project Portal uses Neroa wordmark-first branding without rename drift", () => {
  assert.match(projectPortalSurfaceSource, />\s*Neroa\s*</);
  assert.doesNotMatch(projectPortalSurfaceSource, /\bNerowa\b/);
  assert.doesNotMatch(projectPortalSurfaceSource, /\bNaroa\b/);
  assert.doesNotMatch(projectPortalSurfaceSource, /\bNarowa\b/);
  assert.doesNotMatch(projectPortalSurfaceSource, />\s*N\s*</);
});

test("Project Portal reflects the locked dark luxury visual direction", () => {
  assert.match(projectPortalSurfaceSource, /bg-\[radial-gradient/);
  assert.match(projectPortalSurfaceSource, /charcoal/i);
  assert.match(projectPortalSurfaceSource, /soft silver/i);
  assert.match(projectPortalSurfaceSource, /subtle teal/i);
  assert.match(projectPortalSurfaceSource, /Premium, spacious, and calm/);
  assert.match(projectPortalSurfaceSource, /Neroa wordmark-first direction/);
});

test("Project Portal does not imply live saving or connected runtime state", () => {
  assert.doesNotMatch(projectPortalSurfaceSource, /<form/i);
  assert.doesNotMatch(projectPortalSurfaceSource, /Connected\b/);
  assert.doesNotMatch(projectPortalSurfaceSource, /Save Changes/);
  assert.doesNotMatch(projectPortalSurfaceSource, /Sync Now/);
  assert.doesNotMatch(projectPortalSurfaceSource, /Connect /);
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
    assert.doesNotMatch(source, /@\/components\/portal\//);
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

test("Account Portal route stays inside the clean neroa portal namespace", () => {
  assert.match(accountPortalSource, /@\/components\/neroa-portal\/neroa-account-portal-surface/);
  assert.doesNotMatch(accountPortalSource, /@\/components\/portal\//);
  assert.doesNotMatch(accountPortalSource, /@\/components\/workspace\//);
});

test("Account Portal does not import old account billing auth or project runtime modules", () => {
  for (const source of accountPortalSources) {
    assert.doesNotMatch(source, /@\/components\/account\//);
    assert.doesNotMatch(source, /@\/lib\/billing\//);
    assert.doesNotMatch(source, /@\/lib\/auth\//);
    assert.doesNotMatch(source, /@\/app\/workspace\//);
    assert.doesNotMatch(source, /@\/lib\/workspace\//);
    assert.doesNotMatch(source, /from\s+["'][^"']*stripe/i);
  }
  assert.match(accountPortalSurfaceSource, /"Stripe"/);
});

test("Project Portal route stays inside the clean neroa portal namespace", () => {
  assert.match(projectPortalSource, /@\/components\/neroa-portal\/neroa-project-portal-surface/);
  assert.doesNotMatch(projectPortalSource, /@\/components\/portal\//);
  assert.doesNotMatch(projectPortalSource, /@\/components\/workspace\//);
});

test("Project Portal does not import old project workspace billing auth or runtime modules", () => {
  for (const source of projectPortalSources) {
    assert.doesNotMatch(source, /@\/components\/workspace\//);
    assert.doesNotMatch(source, /@\/components\/account\//);
    assert.doesNotMatch(source, /@\/lib\/billing\//);
    assert.doesNotMatch(source, /@\/lib\/auth\//);
    assert.doesNotMatch(source, /@\/app\/workspace\//);
    assert.doesNotMatch(source, /@\/lib\/workspace\//);
    assert.doesNotMatch(source, /from\s+["'][^"']*supabase/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*stripe/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*auth/i);
  }
});
