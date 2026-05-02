import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const rootLandingSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const frontDoorSource = readFileSync(new URL("../app/neroa/page.tsx", import.meta.url), "utf8");
const frontDoorSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-front-door-surface.tsx", import.meta.url),
  "utf8"
);
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
const authPortalSource = readFileSync(new URL("../app/neroa/auth/page.tsx", import.meta.url), "utf8");
const projectPortalSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-project-portal-surface.tsx", import.meta.url),
  "utf8"
);
const authPortalSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-auth-surface.tsx", import.meta.url),
  "utf8"
);
const portalNavigationSource = readFileSync(
  new URL("../components/neroa-portal/neroa-portal-navigation.tsx", import.meta.url),
  "utf8"
);
const portalShellSource = readFileSync(
  new URL("../components/neroa-portal/neroa-clean-portal-shell.tsx", import.meta.url),
  "utf8"
);

const cleanPortalSources = [
  frontDoorSource,
  frontDoorSurfaceSource,
  accountPortalSource,
  accountPortalSurfaceSource,
  projectPortalSource,
  projectPortalSurfaceSource,
  authPortalSource,
  authPortalSurfaceSource,
  portalNavigationSource,
  portalShellSource
];
const accountPortalSources = [accountPortalSource, accountPortalSurfaceSource];
const projectPortalSources = [projectPortalSource, projectPortalSurfaceSource];

function countOccurrences(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

test("clean Neroa portal shell exports renderable pages and shell primitives", () => {
  assert.match(rootLandingSource, /export default function LandingPage/);
  assert.match(rootLandingSource, /NeroaFrontDoorSurface/);
  assert.match(frontDoorSource, /export default function NeroaPortalFrontDoorPage/);
  assert.match(frontDoorSource, /NeroaFrontDoorSurface/);
  assert.match(frontDoorSurfaceSource, /export function NeroaFrontDoorSurface/);
  assert.match(accountPortalSource, /export default function NeroaAccountPortalPage/);
  assert.match(accountPortalSource, /NeroaAccountPortalSurface/);
  assert.match(accountPortalSurfaceSource, /export function NeroaAccountPortalSurface/);
  assert.match(projectPortalSource, /export default function NeroaProjectPortalPage/);
  assert.match(projectPortalSource, /NeroaProjectPortalSurface/);
  assert.match(projectPortalSurfaceSource, /export function NeroaProjectPortalSurface/);
  assert.match(authPortalSource, /export default function NeroaAuthPage/);
  assert.match(authPortalSource, /NeroaAuthSurface/);
  assert.match(authPortalSurfaceSource, /export function NeroaAuthSurface/);
  assert.match(portalNavigationSource, /export function NeroaPortalNavigation/);
  assert.match(portalShellSource, /export function NeroaCleanPortalShell/);
});

test("/neroa front door stays inside the clean neroa portal namespace", () => {
  assert.match(frontDoorSource, /@\/components\/neroa-portal\/neroa-front-door-surface/);
  assert.doesNotMatch(frontDoorSource, /@\/components\/marketing\//);
  assert.doesNotMatch(frontDoorSource, /@\/components\/front-door\//);
  assert.doesNotMatch(frontDoorSource, /@\/components\/workspace\//);
  assert.doesNotMatch(frontDoorSource, /@\/lib\/auth\//);
  assert.doesNotMatch(frontDoorSource, /@\/lib\/billing\//);
});

test("root landing route reuses the clean Neroa front door instead of legacy front-door modules", () => {
  assert.match(rootLandingSource, /@\/components\/neroa-portal\/neroa-front-door-surface/);
  assert.doesNotMatch(rootLandingSource, /@\/components\/front-door\/front-door-home-hero/);
  assert.doesNotMatch(rootLandingSource, /@\/components\/front-door\/neroa-chat-card/);
  assert.doesNotMatch(rootLandingSource, /@\/components\/marketing\//);
  assert.doesNotMatch(rootLandingSource, /MarketingInfoShell/);
  assert.doesNotMatch(rootLandingSource, /JsonLdScript/);
  assert.doesNotMatch(rootLandingSource, /getOptionalUser/);
  assert.doesNotMatch(rootLandingSource, /publicLaunchEntryPath/);
  assert.doesNotMatch(rootLandingSource, /Open Strategy Room/);
});

test("root landing route metadata reflects the clean Neroa front door", () => {
  assert.match(rootLandingSource, /Neroa \| Project Front Door/);
  assert.match(
    rootLandingSource,
    /Neroa turns an idea into a structured project roadmap, scope, decisions, next steps, and a clean project workspace before execution begins\./
  );
  assert.doesNotMatch(rootLandingSource, /guided product build/i);
  assert.doesNotMatch(rootLandingSource, /Strategy Room first product building/i);
  assert.doesNotMatch(rootLandingSource, /Guided from idea to approval/i);
});

test("/neroa front door includes the clean conversational landing structure", () => {
  assert.match(frontDoorSurfaceSource, /SaaS done right\./);
  assert.match(frontDoorSurfaceSource, /Hi, I\\u2019m Neroa\. What should we build\?/);
  assert.match(frontDoorSurfaceSource, /I want to build a SaaS platform for my business\./);
  assert.match(
    frontDoorSurfaceSource,
    /Great\. I\\u2019ll help turn that into a structured roadmap, define scope, surface key decisions, and prepare a clean project workspace before execution begins\./
  );
  assert.match(frontDoorSurfaceSource, /Start with a structured plan, not a vague prompt\./);
  assert.match(frontDoorSurfaceSource, /Public-facing chat intake box/);
  assert.match(frontDoorSurfaceSource, /Guided intake/);
});

test("/neroa front door uses Neroa wordmark-first branding without logo assets or naming drift", () => {
  assert.match(frontDoorSurfaceSource, />\s*Neroa\s*</);
  assert.doesNotMatch(frontDoorSurfaceSource, /<img/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /<Image/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /\/logo\//);
  assert.doesNotMatch(frontDoorSurfaceSource, /\.(svg|png|jpe?g|webp)/i);
  assert.doesNotMatch(frontDoorSurfaceSource, />\s*N\s*</);
  assert.doesNotMatch(frontDoorSurfaceSource, /\bNerowa\b/);
  assert.doesNotMatch(frontDoorSurfaceSource, /\bNaroa\b/);
  assert.doesNotMatch(frontDoorSurfaceSource, /\bNarowa\b/);
});

test("/neroa front door CTAs point only to clean /neroa routes", () => {
  assert.match(frontDoorSurfaceSource, /href="\/neroa\/auth"/);
  assert.equal(countOccurrences(frontDoorSurfaceSource, /href="\/neroa\/auth"/g), 3);
  assert.equal(countOccurrences(frontDoorSurfaceSource, /href="\/neroa\/account"/g), 0);
  assert.equal(countOccurrences(frontDoorSurfaceSource, /href="\/neroa\/project"/g), 0);
  assert.match(frontDoorSurfaceSource, /Start your project/);
  assert.doesNotMatch(frontDoorSurfaceSource, /Open Strategy Room/);
  assert.doesNotMatch(frontDoorSurfaceSource, /Start the conversation/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /href="\/auth"/);
  assert.doesNotMatch(frontDoorSurfaceSource, /href="\/pricing"/);
  assert.doesNotMatch(frontDoorSurfaceSource, /href="\/diy"/);
  assert.doesNotMatch(frontDoorSurfaceSource, /href="\/managed"/);
});

test("root landing inherits the clean Neroa conversational front door content", () => {
  assert.match(rootLandingSource, /NeroaFrontDoorSurface/);
  assert.match(frontDoorSurfaceSource, /Hi, I\\u2019m Neroa\. What should we build\?/);
  assert.match(frontDoorSurfaceSource, /I want to build a SaaS platform for my business\./);
  assert.match(frontDoorSurfaceSource, /Start your project/);
  assert.match(frontDoorSurfaceSource, /href="\/neroa\/auth"/);
});

test("/neroa front door uses public-facing product language and avoids DIY Managed copy", () => {
  assert.match(frontDoorSurfaceSource, /SaaS done right\./);
  assert.match(frontDoorSurfaceSource, /Public-facing project intake/i);
  assert.match(frontDoorSurfaceSource, /SaaS done right/i);
  assert.match(frontDoorSurfaceSource, /Roadmap-first planning/i);
  assert.match(frontDoorSurfaceSource, /Build with roadmap, scope, approvals, and evidence from the start\./);
  assert.doesNotMatch(frontDoorSurfaceSource, /Share the idea/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /We'?ll build the path/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Start with a guided planning conversation/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Planning Chat/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Click here to start the conversation/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Project Front Door/);
  assert.doesNotMatch(frontDoorSurfaceSource, /Refined Project Preview/);
  assert.doesNotMatch(frontDoorSurfaceSource, /Control Layer/);
  assert.doesNotMatch(frontDoorSurfaceSource, /Surface Status/);
  assert.doesNotMatch(frontDoorSurfaceSource, /Placeholder-only/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Roadmap Progress/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Decisions Pending/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Scope Status/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Project Readiness/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /No forms, fake connected states/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /This page moves users/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /not choosing an execution model/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /front-door prompt/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /pretending live chat is already active/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /\bDIY\b/);
  assert.doesNotMatch(frontDoorSurfaceSource, /\bManaged\b/);
  assert.doesNotMatch(frontDoorSurfaceSource, /self-guided/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /done-for-you/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /pick a plan/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /choose a plan/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /plan choice/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /plan selection/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Unlimited AI/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Autonomous execution is live/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Build your full MVP today/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /Open Strategy Room/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /<form/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /<table/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /onSubmit=/);
  assert.doesNotMatch(frontDoorSurfaceSource, /<input/i);
});

test("root landing no longer carries the old public front-door strings", () => {
  assert.doesNotMatch(rootLandingSource, /Share the idea/i);
  assert.doesNotMatch(rootLandingSource, /We'?ll build the path/i);
  assert.doesNotMatch(rootLandingSource, /Open Strategy Room/i);
  assert.doesNotMatch(rootLandingSource, /Start with a guided planning conversation/i);
  assert.doesNotMatch(rootLandingSource, /Planning Chat/i);
  assert.doesNotMatch(rootLandingSource, /Start the conversation/i);
  assert.doesNotMatch(rootLandingSource, /Click here to start the conversation/i);
});

test("clean portal navigation links the three clean neroa routes only", () => {
  assert.match(portalNavigationSource, /href:\s*"\/neroa"/);
  assert.match(portalNavigationSource, /href:\s*"\/neroa\/account"/);
  assert.match(portalNavigationSource, /href:\s*"\/neroa\/project"/);
  assert.match(portalNavigationSource, /href:\s*"\/neroa\/auth"/);
  assert.match(portalNavigationSource, /label:\s*"Front Door"/);
  assert.match(portalNavigationSource, /label:\s*"Account Portal"/);
  assert.match(portalNavigationSource, /label:\s*"Project Portal"/);
  assert.match(portalNavigationSource, /label:\s*"Auth Surface"/);
});

test("/neroa front door reflects the locked dark luxury visual direction", () => {
  assert.match(frontDoorSurfaceSource, /bg-\[#05070b\]/);
  assert.match(frontDoorSurfaceSource, /SaaS done right\./);
  assert.match(frontDoorSurfaceSource, /Public-facing project intake/i);
  assert.match(frontDoorSurfaceSource, /Public-facing chat intake box/i);
  assert.match(frontDoorSurfaceSource, /Roadmap-first planning/i);
  assert.match(frontDoorSurfaceSource, /bg-\[radial-gradient\(circle_at_18%_0%,rgba\(45,212,191,0\.10\)/);
  assert.match(frontDoorSurfaceSource, /bg-\[linear-gradient\(180deg,rgba\(10,13,18,0\.94\),rgba\(5,8,12,0\.98\)\)/);
  assert.match(frontDoorSurfaceSource, /h-px w-full bg-gradient-to-r from-white\/5 via-white\/20 to-white\/5/);
  assert.match(frontDoorSurfaceSource, /text-teal-/);
  assert.match(frontDoorSurfaceSource, /shadow-\[0_36px_120px/);
  assert.match(frontDoorSurfaceSource, /rounded-\[2\.1rem\]/);
  assert.match(frontDoorSurfaceSource, /Scope before execution/);
  assert.match(frontDoorSurfaceSource, /Decisions and approvals/);
  assert.match(frontDoorSurfaceSource, /Evidence and review/);
  assert.match(frontDoorSurfaceSource, /roadmap/i);
  assert.match(frontDoorSurfaceSource, /scope/i);
  assert.match(frontDoorSurfaceSource, /approvals/i);
  assert.match(frontDoorSurfaceSource, /evidence/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /NeroaPortalNavigation/);
  assert.doesNotMatch(frontDoorSurfaceSource, /violet/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /fuchsia/i);
});

test("navigation uses Neroa wordmark text only and no image logo paths", () => {
  assert.match(portalNavigationSource, />\s*Neroa\s*</);
  assert.doesNotMatch(portalNavigationSource, /<img/i);
  assert.doesNotMatch(portalNavigationSource, /<Image/i);
  assert.doesNotMatch(portalNavigationSource, /\/logo\//);
  assert.doesNotMatch(portalNavigationSource, />\s*N\s*</);
});

test("clean auth route exports and renders a placeholder-only auth surface", () => {
  assert.match(authPortalSource, /NeroaAuthSurface/);
  assert.match(authPortalSource, /@\/components\/neroa-portal\/neroa-auth-surface/);
  assert.doesNotMatch(authPortalSource, /@\/components\/portal\//);
  assert.doesNotMatch(authPortalSource, /@\/components\/workspace\//);
  assert.doesNotMatch(authPortalSource, /@\/components\/auth-form/);
  assert.match(authPortalSurfaceSource, /NeroaPortalNavigation/);
  assert.match(authPortalSurfaceSource, /currentPath="\/neroa\/auth"/);
  assert.match(authPortalSurfaceSource, /"Sign in"/);
  assert.match(authPortalSurfaceSource, /"Create account"/);
  assert.match(authPortalSurfaceSource, /"Continue to Account Portal later"/);
  assert.match(authPortalSurfaceSource, /"Continue to Project Portal later"/);
});

test("clean auth surface includes future routing notes and no live auth claims", () => {
  assert.match(authPortalSurfaceSource, /Signed out users will start at \/neroa\/auth later\./);
  assert.match(authPortalSurfaceSource, /Signed in users will route to \/neroa\/account later\./);
  assert.match(authPortalSurfaceSource, /Users with an active project may continue to \/neroa\/project later\./);
  assert.match(authPortalSurfaceSource, /No live login or signup submission is active in this pass\./);
  assert.match(
    authPortalSurfaceSource,
    /Continue destinations are informational only and do not trigger redirect decisions\./
  );
  assert.match(authPortalSurfaceSource, /No route guards, session restoration, or redirect logic is active in this pass\./);
  assert.match(authPortalSurfaceSource, /No credential field capture in this pass/);
  assert.match(authPortalSurfaceSource, /No submission or redirect action in this pass/);
  assert.doesNotMatch(authPortalSurfaceSource, /<form/i);
  assert.doesNotMatch(authPortalSurfaceSource, /<button/i);
  assert.doesNotMatch(authPortalSurfaceSource, /type=\s*["']submit["']/i);
  assert.doesNotMatch(authPortalSurfaceSource, /onSubmit=/);
  assert.doesNotMatch(authPortalSurfaceSource, /Sign in now/i);
  assert.doesNotMatch(authPortalSurfaceSource, /Create account now/i);
  assert.doesNotMatch(authPortalSurfaceSource, /Continue with (Google|GitHub|Apple)/i);
  assert.doesNotMatch(authPortalSurfaceSource, /magic link/i);
  assert.doesNotMatch(authPortalSurfaceSource, /forgot password/i);
  assert.doesNotMatch(authPortalSurfaceSource, /\bConnected\b/);
});

test("clean auth surface uses Neroa wordmark text only without naming drift", () => {
  assert.match(authPortalSurfaceSource, />\s*Neroa\s*</);
  assert.doesNotMatch(authPortalSurfaceSource, /<img/i);
  assert.doesNotMatch(authPortalSurfaceSource, /<Image/i);
  assert.doesNotMatch(authPortalSurfaceSource, /\/logo\//);
  assert.doesNotMatch(authPortalSurfaceSource, /\.(svg|png|jpe?g|webp)/i);
  assert.doesNotMatch(authPortalSurfaceSource, />\s*N\s*</);
  assert.doesNotMatch(authPortalSurfaceSource, /\bNerowa\b/);
  assert.doesNotMatch(authPortalSurfaceSource, /\bNaroa\b/);
  assert.doesNotMatch(authPortalSurfaceSource, /\bNarowa\b/);
});

test("Account Portal placeholder sections are present", () => {
  assert.match(accountPortalSurfaceSource, /NeroaPortalNavigation/);
  assert.match(accountPortalSurfaceSource, /currentPath="\/neroa\/account"/);
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
  assert.match(projectPortalSurfaceSource, /NeroaPortalNavigation/);
  assert.match(projectPortalSurfaceSource, /currentPath="\/neroa\/project"/);
  assert.match(projectPortalSurfaceSource, /tone="dark"/);
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
  assert.match(projectPortalSurfaceSource, /Placeholder-only project shell/);
  assert.match(projectPortalSurfaceSource, /Clean placeholder control surface/);
});

test("Project Portal uses Neroa wordmark-first branding without rename drift", () => {
  assert.match(projectPortalSurfaceSource, />\s*Neroa\s*</);
  assert.match(projectPortalSurfaceSource, /Neroa wordmark-first direction/);
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
  assert.match(projectPortalSurfaceSource, /text-teal-/);
  assert.match(projectPortalSurfaceSource, /shadow-\[0_40px_120px/);
});

test("Project Portal does not imply live saving or connected runtime state", () => {
  assert.doesNotMatch(projectPortalSurfaceSource, /<form/i);
  assert.doesNotMatch(projectPortalSurfaceSource, /Connected\b/);
  assert.doesNotMatch(projectPortalSurfaceSource, /Save Changes/);
  assert.doesNotMatch(projectPortalSurfaceSource, /Sync Now/);
  assert.doesNotMatch(projectPortalSurfaceSource, /Connect /);
  assert.doesNotMatch(projectPortalSurfaceSource, /Start Build/i);
  assert.doesNotMatch(projectPortalSurfaceSource, /Run Now/i);
  assert.doesNotMatch(projectPortalSurfaceSource, /Launch QC/i);
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
  for (const source of [rootLandingSource, ...cleanPortalSources]) {
    assert.doesNotMatch(source, /FrontDoorHomeHero/);
    assert.doesNotMatch(source, /NeroaChatCard/);
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

test("clean auth surface does not import auth runtime session or guard modules", () => {
  for (const source of [authPortalSource, authPortalSurfaceSource]) {
    assert.doesNotMatch(source, /@\/lib\/auth/);
    assert.doesNotMatch(source, /@\/lib\/supabase\//);
    assert.doesNotMatch(source, /@\/lib\/portal\//);
    assert.doesNotMatch(source, /@\/lib\/workspace\//);
    assert.doesNotMatch(source, /@\/components\/auth-form/);
    assert.doesNotMatch(source, /@\/components\/auth\//);
    assert.doesNotMatch(source, /@\/components\/portal\//);
    assert.doesNotMatch(source, /@\/components\/workspace\//);
    assert.doesNotMatch(source, /@\/components\/marketing\//);
    assert.doesNotMatch(source, /@\/components\/command-center\//);
    assert.doesNotMatch(source, /@\/components\/strategy-room\//);
    assert.doesNotMatch(source, /@\/components\/build-room\//);
    assert.doesNotMatch(source, /@\/components\/front-door\//);
    assert.doesNotMatch(source, /@\/app\/auth\//);
    assert.doesNotMatch(source, /from\s+["'][^"']*supabase/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*stripe/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*next-auth/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*session/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*guard/i);
    assert.doesNotMatch(source, /\bredirect\(/);
  }
});

test("clean portal shell does not import Neroa One runtime wiring", () => {
  for (const source of [rootLandingSource, ...cleanPortalSources]) {
    assert.doesNotMatch(source, /@\/lib\/neroa-one\//);
    assert.doesNotMatch(source, /analyzeTaskWithNeroaOne/);
    assert.doesNotMatch(source, /commandCenterLanes/);
    assert.doesNotMatch(source, /createNeroaOneOutcomeQueueEntry/);
    assert.doesNotMatch(source, /createDraftCodexExecutionPacket/);
    assert.doesNotMatch(source, /createQueuedCodeExecutionWorkerRun/);
  }
});

test("clean portal shell stays UI-only and avoids runtime or schema behavior", () => {
  for (const source of [rootLandingSource, ...cleanPortalSources]) {
    assert.doesNotMatch(source, /createDraftPromptRoomItem/);
    assert.doesNotMatch(source, /submitCodex/);
    assert.doesNotMatch(source, /fetch\(/);
    assert.doesNotMatch(source, /process\.env/);
    assert.doesNotMatch(source, /from\s+["'][^"']*supabase/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*stripe/i);
    assert.doesNotMatch(source, /from\s+["']@\/lib\/auth/i);
    assert.doesNotMatch(source, /from\s+["']@\/components\/auth\//i);
    assert.doesNotMatch(source, /from\s+["']@\/app\/auth\//i);
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
  assert.doesNotMatch(projectPortalSource, /@\/components\/account\//);
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
    assert.doesNotMatch(source, /@\/components\/live-view\//);
    assert.doesNotMatch(source, /@\/lib\/ai\//);
    assert.doesNotMatch(source, /codex-relay/);
    assert.doesNotMatch(source, /worker-trigger/);
    assert.doesNotMatch(source, /browser-runtime-bridge/);
  }
});
