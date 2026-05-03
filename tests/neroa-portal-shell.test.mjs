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
const contactPortalSource = readFileSync(
  new URL("../app/neroa/contact/page.tsx", import.meta.url),
  "utf8"
);
const contactPortalSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-contact-surface.tsx", import.meta.url),
  "utf8"
);
const projectPortalSource = readFileSync(
  new URL("../app/neroa/project/page.tsx", import.meta.url),
  "utf8"
);
const authPortalSource = readFileSync(new URL("../app/neroa/auth/page.tsx", import.meta.url), "utf8");
const cleanAuthConfirmRouteSource = readFileSync(
  new URL("../app/neroa/auth/confirm/route.ts", import.meta.url),
  "utf8"
);
const cleanResetPasswordPageSource = readFileSync(
  new URL("../app/neroa/auth/reset-password/page.tsx", import.meta.url),
  "utf8"
);
const pricingPortalSource = readFileSync(
  new URL("../app/neroa/pricing/page.tsx", import.meta.url),
  "utf8"
);
const blogPortalSource = readFileSync(new URL("../app/neroa/blog/page.tsx", import.meta.url), "utf8");
const blogArticlePageSource = readFileSync(
  new URL("../app/neroa/blog/[slug]/page.tsx", import.meta.url),
  "utf8"
);
const diyManagedPortalSource = readFileSync(
  new URL("../app/neroa/diy-vs-managed/page.tsx", import.meta.url),
  "utf8"
);
const projectPortalSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-project-portal-surface.tsx", import.meta.url),
  "utf8"
);
const authPortalSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-auth-surface.tsx", import.meta.url),
  "utf8"
);
const cleanResetPasswordSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-reset-password-surface.tsx", import.meta.url),
  "utf8"
);
const pricingPortalSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-pricing-surface.tsx", import.meta.url),
  "utf8"
);
const blogPortalSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-blog-surface.tsx", import.meta.url),
  "utf8"
);
const blogArticleSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-blog-article-surface.tsx", import.meta.url),
  "utf8"
);
const diyManagedPortalSurfaceSource = readFileSync(
  new URL("../components/neroa-portal/neroa-diy-managed-surface.tsx", import.meta.url),
  "utf8"
);
const blogPostsSource = readFileSync(new URL("../lib/neroa/blog-posts.ts", import.meta.url), "utf8");
const northStarAccentSource = readFileSync(
  new URL("../components/neroa-portal/neroa-north-star-accent.tsx", import.meta.url),
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
  contactPortalSource,
  contactPortalSurfaceSource,
  projectPortalSource,
  projectPortalSurfaceSource,
  authPortalSource,
  authPortalSurfaceSource,
  cleanAuthConfirmRouteSource,
  cleanResetPasswordPageSource,
  cleanResetPasswordSurfaceSource,
  pricingPortalSource,
  pricingPortalSurfaceSource,
  blogPortalSource,
  blogPortalSurfaceSource,
  blogArticlePageSource,
  blogArticleSurfaceSource,
  diyManagedPortalSource,
  diyManagedPortalSurfaceSource,
  northStarAccentSource,
  portalNavigationSource,
  portalShellSource
];
const publicEntrySources = [
  rootLandingSource,
  frontDoorSource,
  frontDoorSurfaceSource,
  pricingPortalSource,
  pricingPortalSurfaceSource,
  blogPortalSource,
  blogPortalSurfaceSource,
  blogArticlePageSource,
  blogArticleSurfaceSource,
  diyManagedPortalSource,
  diyManagedPortalSurfaceSource,
  authPortalSource,
  authPortalSurfaceSource,
  cleanAuthConfirmRouteSource,
  cleanResetPasswordPageSource,
  cleanResetPasswordSurfaceSource,
  accountPortalSource,
  accountPortalSurfaceSource,
  contactPortalSource,
  contactPortalSurfaceSource,
  projectPortalSource,
  projectPortalSurfaceSource
];
const landingWrapperSources = [rootLandingSource, frontDoorSource];
const uiOnlyPortalSources = [
  frontDoorSurfaceSource,
  accountPortalSource,
  accountPortalSurfaceSource,
  contactPortalSource,
  contactPortalSurfaceSource,
  projectPortalSource,
  projectPortalSurfaceSource,
  authPortalSource,
  authPortalSurfaceSource,
  cleanResetPasswordPageSource,
  cleanResetPasswordSurfaceSource,
  pricingPortalSource,
  pricingPortalSurfaceSource,
  blogPortalSource,
  blogPortalSurfaceSource,
  blogArticlePageSource,
  blogArticleSurfaceSource,
  diyManagedPortalSource,
  diyManagedPortalSurfaceSource,
  northStarAccentSource,
  portalNavigationSource,
  portalShellSource
];
const nonRuntimeUiPortalSources = [
  frontDoorSurfaceSource,
  accountPortalSurfaceSource,
  contactPortalSource,
  contactPortalSurfaceSource,
  projectPortalSource,
  projectPortalSurfaceSource,
  pricingPortalSource,
  pricingPortalSurfaceSource,
  blogPortalSource,
  blogPortalSurfaceSource,
  blogArticlePageSource,
  blogArticleSurfaceSource,
  diyManagedPortalSource,
  diyManagedPortalSurfaceSource,
  northStarAccentSource,
  portalNavigationSource,
  portalShellSource
];
const accountPortalSources = [accountPortalSource, accountPortalSurfaceSource];
const contactPortalSources = [contactPortalSource, contactPortalSurfaceSource];
const projectPortalSources = [projectPortalSource, projectPortalSurfaceSource];
const publicNeroaNavSources = [
  frontDoorSurfaceSource,
  pricingPortalSurfaceSource,
  diyManagedPortalSurfaceSource,
  blogPortalSurfaceSource,
  blogArticleSurfaceSource,
  authPortalSurfaceSource,
  cleanResetPasswordSurfaceSource,
  contactPortalSurfaceSource
];
const blogContentSources = [
  blogPortalSource,
  blogPortalSurfaceSource,
  blogArticlePageSource,
  blogArticleSurfaceSource,
  blogPostsSource
];

function countOccurrences(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

test("clean Neroa portal shell exports renderable pages and shell primitives", () => {
  assert.match(rootLandingSource, /export default async function LandingPage/);
  assert.match(rootLandingSource, /NeroaFrontDoorSurface/);
  assert.match(frontDoorSource, /export default async function NeroaPortalFrontDoorPage/);
  assert.match(frontDoorSource, /NeroaFrontDoorSurface/);
  assert.match(frontDoorSurfaceSource, /export function NeroaFrontDoorSurface/);
  assert.match(accountPortalSource, /export default async function NeroaAccountPortalPage/);
  assert.match(accountPortalSource, /NeroaAccountPortalSurface/);
  assert.match(accountPortalSurfaceSource, /export function NeroaAccountPortalSurface/);
  assert.match(contactPortalSource, /export default function NeroaContactPage/);
  assert.match(contactPortalSource, /NeroaContactSurface/);
  assert.match(contactPortalSurfaceSource, /export function NeroaContactSurface/);
  assert.match(projectPortalSource, /export default function NeroaProjectPortalPage/);
  assert.match(projectPortalSource, /NeroaProjectPortalSurface/);
  assert.match(projectPortalSurfaceSource, /export function NeroaProjectPortalSurface/);
  assert.match(authPortalSource, /export default async function NeroaAuthPage/);
  assert.match(authPortalSource, /NeroaAuthSurface/);
  assert.match(authPortalSurfaceSource, /export function NeroaAuthSurface/);
  assert.match(cleanAuthConfirmRouteSource, /export async function GET/);
  assert.match(cleanResetPasswordPageSource, /export default async function NeroaResetPasswordPage/);
  assert.match(cleanResetPasswordSurfaceSource, /export function NeroaResetPasswordSurface/);
  assert.match(pricingPortalSource, /export default function NeroaPricingPage/);
  assert.match(pricingPortalSource, /NeroaPricingSurface/);
  assert.match(pricingPortalSurfaceSource, /export function NeroaPricingSurface/);
  assert.match(blogPortalSource, /export default function NeroaBlogPage/);
  assert.match(blogPortalSource, /NeroaBlogSurface/);
  assert.match(blogArticlePageSource, /export default async function NeroaBlogArticlePage/);
  assert.match(blogArticlePageSource, /NeroaBlogArticleSurface/);
  assert.match(blogPortalSurfaceSource, /export function NeroaBlogSurface/);
  assert.match(blogArticleSurfaceSource, /export function NeroaBlogArticleSurface/);
  assert.match(diyManagedPortalSource, /export default function NeroaDiyVsManagedPage/);
  assert.match(diyManagedPortalSource, /NeroaDiyManagedSurface/);
  assert.match(diyManagedPortalSurfaceSource, /export function NeroaDiyManagedSurface/);
  assert.match(northStarAccentSource, /export function NeroaNorthStarAccent/);
  assert.match(portalNavigationSource, /export function NeroaPortalNavigation/);
  assert.match(portalShellSource, /export function NeroaCleanPortalShell/);
});

test("/neroa front door stays inside the clean neroa portal namespace", () => {
  assert.match(frontDoorSource, /@\/components\/neroa-portal\/neroa-front-door-surface/);
  assert.match(frontDoorSource, /@\/lib\/auth/);
  assert.match(frontDoorSource, /getOptionalUser/);
  assert.doesNotMatch(frontDoorSource, /@\/components\/marketing\//);
  assert.doesNotMatch(frontDoorSource, /@\/components\/front-door\//);
  assert.doesNotMatch(frontDoorSource, /@\/components\/workspace\//);
  assert.doesNotMatch(frontDoorSource, /@\/lib\/billing\//);
});

test("root landing route reuses the clean Neroa front door instead of legacy front-door modules", () => {
  assert.match(rootLandingSource, /@\/components\/neroa-portal\/neroa-front-door-surface/);
  assert.match(rootLandingSource, /@\/lib\/auth/);
  assert.match(rootLandingSource, /getOptionalUser/);
  assert.doesNotMatch(rootLandingSource, /@\/components\/front-door\/front-door-home-hero/);
  assert.doesNotMatch(rootLandingSource, /@\/components\/front-door\/neroa-chat-card/);
  assert.doesNotMatch(rootLandingSource, /@\/components\/marketing\//);
  assert.doesNotMatch(rootLandingSource, /MarketingInfoShell/);
  assert.doesNotMatch(rootLandingSource, /JsonLdScript/);
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

test("/neroa front door includes the polished chat-first flow", () => {
  assert.match(frontDoorSurfaceSource, /"use client"/);
  assert.match(frontDoorSurfaceSource, /useState/);
  assert.doesNotMatch(frontDoorSurfaceSource, /useEffect/);
  assert.doesNotMatch(frontDoorSurfaceSource, /useRef/);
  assert.match(frontDoorSurfaceSource, /Hi, I(?:'|â€™|’)m Neroa\. What(?:'|â€™|’)s your name\?/);
  assert.match(frontDoorSurfaceSource, /My name is \$\{finalName\}\./);
  assert.match(frontDoorSurfaceSource, /structured software-building workspace/);
  assert.match(frontDoorSurfaceSource, /open-ended chat or rushing straight into code/);
  assert.match(
    frontDoorSurfaceSource,
    /prepare[\s\S]*approvals, and keep the build tied to evidence and review/,
  );
  assert.match(frontDoorSurfaceSource, /Let(?:'|â€™|’)s begin\./);
  assert.match(frontDoorSurfaceSource, /Type your name\.\.\./);
  assert.match(frontDoorSurfaceSource, /aria-label="Submit your name"/);
  assert.match(frontDoorSurfaceSource, /Let&apos;s Begin/);
  assert.match(frontDoorSurfaceSource, /onSubmit=\{handleSubmit\}/);
  assert.match(frontDoorSurfaceSource, /Home/);
  assert.match(frontDoorSurfaceSource, /Pricing/);
  assert.match(frontDoorSurfaceSource, /DIY vs Managed/);
  assert.match(frontDoorSurfaceSource, /Blog/);
  assert.match(frontDoorSurfaceSource, /Contact/);
  assert.match(frontDoorSurfaceSource, /Sign In/);
  assert.match(frontDoorSurfaceSource, /Start Your Project/);
});

test("clean Neroa public navigation includes the Contact route on every public surface", () => {
  for (const source of publicNeroaNavSources) {
    assert.match(source, /href="\/neroa\/contact"/);
  }
});

test("/neroa front door uses Neroa wordmark-first branding without logo assets or naming drift", () => {
  assert.match(frontDoorSurfaceSource, />\s*Neroa\s*</);
  assert.doesNotMatch(frontDoorSurfaceSource, /<img/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /<Image/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /\/logo\//);
  assert.match(frontDoorSurfaceSource, /\/brand\/background\.png/);
  assert.doesNotMatch(frontDoorSurfaceSource, />\s*N\s*</);
  assert.doesNotMatch(frontDoorSurfaceSource, /\bNerowa\b/);
  assert.doesNotMatch(frontDoorSurfaceSource, /\bNaroa\b/);
  assert.doesNotMatch(frontDoorSurfaceSource, /\bNarowa\b/);
  assert.doesNotMatch(frontDoorSurfaceSource, /\bNarua\b/);
});

test("/neroa front door CTAs point only to clean /neroa routes", () => {
  assert.match(frontDoorSurfaceSource, /const startProjectHref = "\/neroa\/pricing"/);
  assert.equal(countOccurrences(frontDoorSurfaceSource, /href=\{startProjectHref\}/g), 2);
  assert.equal(countOccurrences(frontDoorSurfaceSource, /href="\/neroa\/pricing"/g), 1);
  assert.match(frontDoorSurfaceSource, /href="\/neroa"/);
  assert.match(frontDoorSurfaceSource, /href="\/neroa\/diy-vs-managed"/);
  assert.match(frontDoorSurfaceSource, /href="\/neroa\/blog"/);
  assert.equal(countOccurrences(frontDoorSurfaceSource, /href="\/neroa\/account"/g), 0);
  assert.match(frontDoorSurfaceSource, /Start Your Project/);
  assert.match(frontDoorSurfaceSource, /Let&apos;s Begin/);
  assert.doesNotMatch(frontDoorSurfaceSource, /Open Strategy Room/);
  assert.doesNotMatch(frontDoorSurfaceSource, /href="\/auth"/);
  assert.doesNotMatch(frontDoorSurfaceSource, /href="\/diy"/);
  assert.doesNotMatch(frontDoorSurfaceSource, /href="\/managed"/);
});

test("root landing inherits the clean Neroa conversational front door content", () => {
  assert.match(rootLandingSource, /NeroaFrontDoorSurface/);
  assert.match(frontDoorSurfaceSource, /Hi, I(?:'|â€™|’)m Neroa\. What(?:'|â€™|’)s your name\?/);
  assert.match(frontDoorSurfaceSource, /My name is \$\{finalName\}\./);
  assert.match(frontDoorSurfaceSource, /Let&apos;s Begin/);
  assert.match(frontDoorSurfaceSource, /const startProjectHref = "\/neroa\/pricing"/);
});

test("/neroa front door uses public-facing product language and avoids DIY Managed copy", () => {
  assert.match(frontDoorSurfaceSource, /SaaS[\s\S]*right\./);
  assert.match(frontDoorSurfaceSource, /Roadmap-First Planning/);
  assert.match(frontDoorSurfaceSource, /Scope Before Execution/);
  assert.match(frontDoorSurfaceSource, /Decisions & Approvals/);
  assert.match(frontDoorSurfaceSource, /Evidence & Review/);
  assert.match(frontDoorSurfaceSource, /Build & Execute/);
  assert.match(frontDoorSurfaceSource, /Neroa turns your idea into roadmap, scope, decisions, approvals, and a clear project path before execution begins\./);
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
  assert.doesNotMatch(frontDoorSurfaceSource, /<table/i);
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
  assert.match(portalNavigationSource, /NorthStarIcon/);
  assert.match(portalNavigationSource, /label:\s*"Home"/);
  assert.match(portalNavigationSource, /label:\s*"Account Portal"/);
  assert.match(portalNavigationSource, /label:\s*"Project Portal"/);
  assert.doesNotMatch(portalNavigationSource, /label:\s*"Front Door"/);
  assert.doesNotMatch(portalNavigationSource, /label:\s*"Auth Surface"/);
  assert.doesNotMatch(portalNavigationSource, /Authentication Surface/);
  assert.doesNotMatch(portalNavigationSource, /Clean Portal/);
  assert.doesNotMatch(portalNavigationSource, />\s*NS\s*</);
});

test("/neroa front door reflects the locked dark luxury visual direction", () => {
  assert.match(frontDoorSurfaceSource, /bg-\[#04070a\]/);
  assert.match(frontDoorSurfaceSource, /SaaS[\s\S]*right\./);
  assert.match(frontDoorSurfaceSource, /What(?:'|â€™|’)s your name\?/);
  assert.match(frontDoorSurfaceSource, /Roadmap-First Planning/);
  assert.match(frontDoorSurfaceSource, /Build & Execute/);
  assert.match(frontDoorSurfaceSource, /NorthStarIcon/);
  assert.match(frontDoorSurfaceSource, /url\('\/brand\/background\.png'\)/);
  assert.match(frontDoorSurfaceSource, /northstar-energy-core/);
  assert.match(frontDoorSurfaceSource, /northstar-energy-beam/);
  assert.match(frontDoorSurfaceSource, /northstar-energy-beam-primary/);
  assert.match(frontDoorSurfaceSource, /northstar-energy-beam-secondary/);
  assert.match(frontDoorSurfaceSource, /northstar-energy-particles/);
  assert.match(frontDoorSurfaceSource, /northstarFieldPulse/);
  assert.match(frontDoorSurfaceSource, /northstarBeamShift/);
  assert.match(frontDoorSurfaceSource, /northstarBeamShiftSecondary/);
  assert.match(frontDoorSurfaceSource, /northstarSparkleDrift/);
  assert.match(frontDoorSurfaceSource, /prefers-reduced-motion: reduce/);
  assert.match(frontDoorSurfaceSource, /border-b border-white\/10 pb-6/);
  assert.match(frontDoorSurfaceSource, /text-teal-/);
  assert.match(frontDoorSurfaceSource, /shadow-\[0_30px_120px/);
  assert.match(frontDoorSurfaceSource, /rounded-\[2rem\]/);
  assert.doesNotMatch(frontDoorSurfaceSource, /right-\[24%\] top-\[12%\] text-teal-100\/90/);
  assert.equal(countOccurrences(frontDoorSurfaceSource, /testId="front-door-floating-north-star"/g), 1);
  assert.match(frontDoorSurfaceSource, /NeroaNorthStarAccent/);
  assert.match(frontDoorSurfaceSource, /className="right-\[26rem\] top-\[7rem\]"/);
  assert.doesNotMatch(frontDoorSurfaceSource, /left-\[8%\] top-\[18%\] hidden text-teal-100\/82 lg:block/);
  assert.match(northStarAccentSource, /pointer-events-none absolute z-10 hidden text-teal-100\/82 lg:block/);
  assert.match(northStarAccentSource, /drop-shadow-\[0_0_20px_rgba\(148,255,236,0\.38\)\]/);
  assert.match(frontDoorSurfaceSource, /h-\[27rem\]/);
  assert.match(frontDoorSurfaceSource, /sm:h-\[29rem\]/);
  assert.match(frontDoorSurfaceSource, /lg:h-\[30rem\]/);
  assert.match(frontDoorSurfaceSource, /mt-8/);
  assert.match(frontDoorSurfaceSource, /lg:mt-10/);
  assert.match(frontDoorSurfaceSource, /overflow-y-auto/);
  assert.match(frontDoorSurfaceSource, /chat-scroll/);
  assert.match(frontDoorSurfaceSource, /scrollbar-width: thin/);
  assert.match(frontDoorSurfaceSource, /::-webkit-scrollbar/);
  assert.doesNotMatch(frontDoorSurfaceSource, /scroll-rail/);
  assert.doesNotMatch(frontDoorSurfaceSource, /scroll-thumb/);
  assert.match(frontDoorSurfaceSource, /ChipDivider/);
  assert.match(frontDoorSurfaceSource, /px-4 text-teal-200\/72/);
  assert.match(frontDoorSurfaceSource, /flex flex-wrap items-center justify-center gap-x-3 gap-y-3 lg:hidden/);
  assert.match(frontDoorSurfaceSource, /function ValueButton/);
  assert.match(frontDoorSurfaceSource, /absolute bottom-8 left-8 right-8 hidden lg:block/);
  assert.match(frontDoorSurfaceSource, /gridTemplateColumns:\s*"220px minmax\(24px,1fr\) 20px minmax\(24px,1fr\) 220px minmax\(24px,1fr\) 20px minmax\(24px,1fr\) 220px minmax\(24px,1fr\) 20px minmax\(24px,1fr\) 220px minmax\(24px,1fr\) 20px minmax\(24px,1fr\) 220px"/);
  assert.match(frontDoorSurfaceSource, /flex h-10 items-center justify-center rounded-full border border-white\/70 bg-black\/20 px-3 text-center text-\[11px\] font-semibold uppercase tracking-\[0\.13em\] text-teal-200 whitespace-nowrap/);
  assert.match(frontDoorSurfaceSource, /className="w-\[220px\]"/);
  assert.match(frontDoorSurfaceSource, /flex h-10 items-center justify-center text-white\/80/);
  assert.match(frontDoorSurfaceSource, /Scope Before Execution/);
  assert.match(frontDoorSurfaceSource, /Decisions & Approvals/);
  assert.match(frontDoorSurfaceSource, /Evidence & Review/);
  assert.match(frontDoorSurfaceSource, /rounded-full border border-teal-300\/45 bg-teal-300\/10/);
  assert.match(frontDoorSurfaceSource, /roadmap/i);
  assert.match(frontDoorSurfaceSource, /scope/i);
  assert.match(frontDoorSurfaceSource, /approvals/i);
  assert.match(frontDoorSurfaceSource, /evidence/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /NeroaPortalNavigation/);
  assert.doesNotMatch(frontDoorSurfaceSource, /violet/i);
  assert.doesNotMatch(frontDoorSurfaceSource, /fuchsia/i);
});

test("/neroa pricing route renders the clean pricing page and plan-selection handoff", () => {
  assert.match(pricingPortalSource, /@\/components\/neroa-portal\/neroa-pricing-surface/);
  assert.doesNotMatch(pricingPortalSource, /@\/lib\/billing\//);
  assert.doesNotMatch(pricingPortalSource, /@\/components\/marketing\//);
  assert.match(pricingPortalSource, /Neroa \| Pricing/);
  assert.match(
    pricingPortalSource,
    /Neroa pricing is built around governed Build Credits, project preview access, credit top-offs, and managed credits\./
  );
  assert.match(pricingPortalSurfaceSource, /Governed Build Credits/);
  assert.match(pricingPortalSurfaceSource, /Build Credits govern approved work/);
  assert.match(pricingPortalSurfaceSource, /Choose the Neroa lane that fits your project\./);
  assert.match(pricingPortalSurfaceSource, /DIY and Managed credits remain separate/);
  assert.match(pricingPortalSurfaceSource, /No live checkout or billing runtime is wired on this page/);
  assert.match(pricingPortalSurfaceSource, /Free/);
  assert.match(pricingPortalSurfaceSource, /Project preview/);
  assert.match(pricingPortalSurfaceSource, /\$0\/month/);
  assert.match(pricingPortalSurfaceSource, /Guided idea intake/);
  assert.match(pricingPortalSurfaceSource, /Roadmap and scope preview/);
  assert.match(pricingPortalSurfaceSource, /Command Center preview/);
  assert.match(pricingPortalSurfaceSource, /Limited trial credits included/);
  assert.match(pricingPortalSurfaceSource, /1 starter project/);
  assert.match(pricingPortalSurfaceSource, /Starter/);
  assert.match(pricingPortalSurfaceSource, /\$49\.99\/month/);
  assert.match(pricingPortalSurfaceSource, /200 Build Credits/);
  assert.match(
    pricingPortalSurfaceSource,
    /Starter is for shaping and progressing a bounded project, not promising a full MVP out of the box\./
  );
  assert.match(pricingPortalSurfaceSource, /Pro/);
  assert.match(pricingPortalSurfaceSource, /\$179\/month/);
  assert.match(pricingPortalSurfaceSource, /600 Build Credits/);
  assert.match(pricingPortalSurfaceSource, /Business/);
  assert.match(pricingPortalSurfaceSource, /\$499\/month/);
  assert.match(pricingPortalSurfaceSource, /1,600 Build Credits/);
  assert.match(pricingPortalSurfaceSource, /Managed Build/);
  assert.match(pricingPortalSurfaceSource, /from \$750/);
  assert.match(pricingPortalSurfaceSource, /500 managed credits \/ \$750/);
  assert.match(pricingPortalSurfaceSource, /1,500 managed credits \/ \$2,250/);
  assert.match(pricingPortalSurfaceSource, /3,000 managed credits \/ \$4,500/);
  assert.match(pricingPortalSurfaceSource, /5,000 managed credits \/ \$7,500/);
  assert.match(pricingPortalSurfaceSource, /Credit Top-Offs/);
  assert.match(pricingPortalSurfaceSource, /DIY vs Managed/);
  assert.match(pricingPortalSurfaceSource, /Blog/);
  assert.match(pricingPortalSurfaceSource, /href="\/neroa\/diy-vs-managed"/);
  assert.match(pricingPortalSurfaceSource, /href="\/neroa\/blog"/);
  assert.match(
    pricingPortalSurfaceSource,
    /Add more governed build credits when your project needs additional approved work\./
  );
  assert.match(pricingPortalSurfaceSource, /200 credits \/ \$60/);
  assert.match(pricingPortalSurfaceSource, /500 credits \/ \$150/);
  assert.match(pricingPortalSurfaceSource, /1,000 credits \/ \$300/);
  assert.match(pricingPortalSurfaceSource, /2,000 credits \/ \$600/);
  assert.match(pricingPortalSurfaceSource, /lg:flex-row lg:items-center lg:justify-between/);
  assert.match(pricingPortalSurfaceSource, /lg:flex-nowrap lg:justify-end/);
  assert.match(pricingPortalSurfaceSource, /href=\{`\/neroa\/auth\?plan=\$\{plan\.id\}`\}/);
  assert.match(pricingPortalSurfaceSource, /id: "free"/);
  assert.match(pricingPortalSurfaceSource, /id: "starter"/);
  assert.match(pricingPortalSurfaceSource, /id: "pro"/);
  assert.match(pricingPortalSurfaceSource, /id: "business"/);
  assert.match(pricingPortalSurfaceSource, /id: "managed"/);
  assert.doesNotMatch(pricingPortalSurfaceSource, /const workspaceTopOffs/);
  assert.doesNotMatch(pricingPortalSurfaceSource, /40 build credits/i);
  assert.doesNotMatch(pricingPortalSurfaceSource, /0-10 trial credits/i);
  assert.doesNotMatch(pricingPortalSurfaceSource, /Workspace Hours/);
  assert.doesNotMatch(pricingPortalSurfaceSource, /10 \/ \$10/);
  assert.doesNotMatch(pricingPortalSurfaceSource, /25 \/ \$20/);
  assert.doesNotMatch(pricingPortalSurfaceSource, /50 \/ \$35/);
  assert.doesNotMatch(pricingPortalSurfaceSource, /workspace-hour/i);
  assert.doesNotMatch(pricingPortalSurfaceSource, /workspace pack/i);
  assert.doesNotMatch(pricingPortalSurfaceSource, /buy workspace time/i);
  assert.doesNotMatch(pricingPortalSurfaceSource, /@\/lib\/billing\//);
  assert.doesNotMatch(pricingPortalSurfaceSource, /from\s+["'][^"']*stripe/i);
  assert.doesNotMatch(pricingPortalSurfaceSource, /checkoutSession/i);
  assert.doesNotMatch(pricingPortalSurfaceSource, /unlimited ai/i);
  assert.doesNotMatch(pricingPortalSurfaceSource, /GPT-5\.5/i);
});

test("/neroa/blog route exists and stays inside the clean Neroa portal namespace", () => {
  assert.match(blogPortalSource, /@\/components\/neroa-portal\/neroa-blog-surface/);
  assert.match(blogPortalSource, /The Neroa Build Journal \| Neroa/);
  assert.match(
    blogPortalSource,
    /Read the Neroa Build Journal for roadmap-first thinking about structured software building, Build Credits, approvals, and governed execution\./
  );
  assert.match(blogPortalSource, /canonical: NEROA_BLOG_INDEX_PATH/);
  assert.match(blogPortalSource, /title: "The Neroa Build Journal"/);
  assert.match(blogPortalSource, /type: "website"/);
  assert.match(blogPortalSource, /card: "summary_large_image"/);
  assert.doesNotMatch(blogPortalSource, /@\/components\/marketing\//);
  assert.doesNotMatch(blogPortalSource, /@\/lib\/billing\//);
});

test("/neroa/blog includes the build journal hero, foundational article links, and governed language", () => {
  assert.match(blogPortalSurfaceSource, /The Neroa Build Journal/);
  assert.match(
    blogPortalSurfaceSource,
    /Roadmap-first thinking for founders, businesses, and builders who want software built with structure instead of chaos\./
  );
  assert.match(blogPortalSurfaceSource, /Most software projects do not fail because the idea is bad\./);
  assert.match(blogPortalSurfaceSource, /Foundational Articles/);
  assert.doesNotMatch(blogPortalSurfaceSource, /Five places to start/);
  assert.match(blogPortalSurfaceSource, /href=\{getBlogPostRoute\(post\.slug\)\}/);
  assert.match(blogPortalSurfaceSource, /Read article/);
  assert.match(blogPortalSurfaceSource, /roadmap-first/i);
  assert.match(blogPortalSurfaceSource, /structured software building/i);
  assert.match(blogPortalSurfaceSource, /Build Credits/);
  assert.match(blogPortalSurfaceSource, /managed credits/);
  assert.match(blogPortalSurfaceSource, /evidence and review/i);
  assert.match(blogPortalSurfaceSource, /governed execution/i);
  assert.match(blogPortalSurfaceSource, /href=\{NEROA_BLOG_INDEX_PATH\}/);
  assert.match(blogPortalSurfaceSource, /aria-current="page"/);
  assert.match(blogPortalSurfaceSource, /href="\/neroa\/pricing"/);
  assert.match(blogPortalSurfaceSource, /testId="blog-page-north-star"/);
  assert.doesNotMatch(blogPortalSurfaceSource, /<img/i);
  assert.doesNotMatch(blogPortalSurfaceSource, /<Image/i);
  assert.doesNotMatch(blogPortalSurfaceSource, /\/logo\//);
});

test("blog post data defines all five foundational article titles, slugs, and public-safe language", () => {
  assert.match(blogPostsSource, /NEROA_BLOG_INDEX_PATH = "\/neroa\/blog"/);
  assert.match(
    blogPostsSource,
    /future admin publishing can replace this module without changing the public blog routes/i
  );
  assert.match(blogPostsSource, /export function getStaticBlogPostSlugs/);
  assert.match(blogPostsSource, /export function getBlogPostRoute/);
  assert.match(blogPostsSource, /slug: "why-no-code-ai-builders-break-down"/);
  assert.match(blogPostsSource, /slug: "why-neroa-can-build-differently"/);
  assert.match(blogPostsSource, /slug: "how-many-credits-basic-saas-mvp"/);
  assert.match(blogPostsSource, /slug: "prompting-is-not-product-strategy"/);
  assert.match(blogPostsSource, /slug: "why-roadmap-first-building-saves-money"/);
  assert.match(blogPostsSource, /Why Today's No-Code and AI App Builders Still Break Down/);
  assert.match(blogPostsSource, /Why Neroa Can Build Differently/);
  assert.match(blogPostsSource, /How Many Credits Does It Take to Get a Basic SaaS to MVP\?/);
  assert.match(blogPostsSource, /Prompting Is Not Product Strategy/);
  assert.match(blogPostsSource, /Why Roadmap-First Building Saves Money/);
  assert.match(blogPostsSource, /Bubble/);
  assert.match(blogPostsSource, /Webflow/);
  assert.match(blogPostsSource, /Framer/);
  assert.match(blogPostsSource, /Lovable/);
  assert.match(blogPostsSource, /Bolt/);
  assert.match(blogPostsSource, /Replit/);
  assert.match(blogPostsSource, /v0/);
  assert.match(blogPostsSource, /Cursor/);
  assert.match(blogPostsSource, /useful for prototypes/);
  assert.match(blogPostsSource, /roadmap-first/i);
  assert.match(blogPostsSource, /structured software building/i);
  assert.match(blogPostsSource, /Build Credits/);
  assert.match(blogPostsSource, /managed credits/i);
  assert.match(blogPostsSource, /The issue is not that these tools are bad\./);
  assert.doesNotMatch(blogPostsSource, /\bscam\b/i);
  assert.doesNotMatch(blogPostsSource, /\buseless\b/i);
  assert.doesNotMatch(blogPostsSource, /cannot build apps/i);
});

test("/neroa/blog/[slug] exists as a static public route with structured article metadata", () => {
  assert.match(blogArticlePageSource, /@\/components\/neroa-portal\/neroa-blog-article-surface/);
  assert.match(blogArticlePageSource, /@\/lib\/neroa\/blog-posts/);
  assert.match(blogArticlePageSource, /export const dynamicParams = false/);
  assert.match(blogArticlePageSource, /export function generateStaticParams/);
  assert.match(blogArticlePageSource, /getStaticBlogPostSlugs\(\)\.map\(\(slug\) => \(\{ slug \}\)\)/);
  assert.match(blogArticlePageSource, /params:\s*Promise<PageParams>/);
  assert.match(blogArticlePageSource, /getBlogPostBySlug/);
  assert.match(blogArticlePageSource, /canonical: getBlogPostRoute\(post\.slug\)/);
  assert.match(blogArticlePageSource, /type: "article"/);
  assert.match(blogArticlePageSource, /card: "summary_large_image"/);
  assert.match(blogArticlePageSource, /notFound\(\)/);
  assert.doesNotMatch(blogArticlePageSource, /@\/lib\/billing\//);
  assert.doesNotMatch(blogArticlePageSource, /@\/lib\/auth/);
});

test("/neroa/blog/[slug] article surface keeps the hardened Neroa public UI and CTA path", () => {
  assert.match(blogArticleSurfaceSource, /Build Journal/);
  assert.match(blogArticleSurfaceSource, /Back to Build Journal/);
  assert.match(blogArticleSurfaceSource, /aria-label="Breadcrumb"/);
  assert.match(blogArticleSurfaceSource, /aria-current="page"/);
  assert.match(blogArticleSurfaceSource, /scope before execution/);
  assert.match(blogArticleSurfaceSource, /evidence and review/);
  assert.match(blogArticleSurfaceSource, /governed execution/);
  assert.match(blogArticleSurfaceSource, /SaaS done right/);
  assert.match(blogArticleSurfaceSource, /Detailed public guidance for roadmap-first, structured software building\./);
  assert.match(blogArticleSurfaceSource, /href="\/neroa\/pricing"/);
  assert.match(blogArticleSurfaceSource, /href=\{NEROA_BLOG_INDEX_PATH\}/);
  assert.match(blogArticleSurfaceSource, /testId="blog-article-page-north-star"/);
  assert.doesNotMatch(blogArticleSurfaceSource, /<img/i);
  assert.doesNotMatch(blogArticleSurfaceSource, /<Image/i);
  assert.doesNotMatch(blogArticleSurfaceSource, /\/logo\//);
});

test("blog nav links stay aligned with the hardened Neroa public routes", () => {
  for (const source of [blogPortalSurfaceSource, blogArticleSurfaceSource]) {
    assert.match(source, /href="\/neroa"/);
    assert.match(source, /href="\/neroa\/pricing"/);
    assert.match(source, /href="\/neroa\/diy-vs-managed"/);
    assert.match(source, /href=\{NEROA_BLOG_INDEX_PATH\}/);
    assert.match(source, /href="\/neroa\/auth"/);
    assert.match(source, /Start Your Project/);
  }
});

test("blog content sources stay static-only and do not introduce admin CMS or backend publishing imports", () => {
  for (const source of blogContentSources) {
    assert.doesNotMatch(source, /from\s+["']@\/lib\/supabase\//i);
    assert.doesNotMatch(source, /from\s+["']@\/lib\/billing\//i);
    assert.doesNotMatch(source, /from\s+["']@\/lib\/stripe\//i);
    assert.doesNotMatch(source, /from\s+["']@\/lib\/schema/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*\/migrations?\//i);
    assert.doesNotMatch(source, /from\s+["'][^"']*\/models?\//i);
    assert.doesNotMatch(source, /from\s+["'][^"']*openai/i);
    assert.doesNotMatch(source, /from\s+["']@\/app\/admin\//i);
    assert.doesNotMatch(source, /from\s+["'][^"']*cms/i);
  }
});

test("/neroa/diy-vs-managed route exists and stays inside the clean Neroa portal namespace", () => {
  assert.match(diyManagedPortalSource, /@\/components\/neroa-portal\/neroa-diy-managed-surface/);
  assert.match(diyManagedPortalSource, /Neroa \| DIY vs Managed/);
  assert.match(
    diyManagedPortalSource,
    /Compare Neroa DIY Build and Managed Build paths, both rooted in roadmap-first planning, scope before execution, approvals, and structured delivery\./
  );
  assert.doesNotMatch(diyManagedPortalSource, /@\/lib\/auth/);
  assert.doesNotMatch(diyManagedPortalSource, /@\/components\/marketing\//);
  assert.doesNotMatch(diyManagedPortalSource, /@\/lib\/billing\//);
});

test("/neroa/diy-vs-managed page explains the two public build paths and links to pricing", () => {
  assert.match(diyManagedPortalSurfaceSource, /"use client"/);
  assert.match(diyManagedPortalSurfaceSource, /useState/);
  assert.match(diyManagedPortalSurfaceSource, /useEffect/);
  assert.match(diyManagedPortalSurfaceSource, /useId/);
  assert.match(diyManagedPortalSurfaceSource, /useRef/);
  assert.match(diyManagedPortalSurfaceSource, /Two ways to build with Neroa\./);
  assert.match(diyManagedPortalSurfaceSource, /DIY Build/);
  assert.match(diyManagedPortalSurfaceSource, /Managed Build/);
  assert.match(diyManagedPortalSurfaceSource, /Shared foundation/);
  assert.match(diyManagedPortalSurfaceSource, /Roadmap-first planning/);
  assert.match(diyManagedPortalSurfaceSource, /Scope before execution/);
  assert.match(diyManagedPortalSurfaceSource, /Approvals at checkpoints/);
  assert.match(diyManagedPortalSurfaceSource, /Evidence and review across the build path/);
  assert.match(diyManagedPortalSurfaceSource, /Scoped tasks/);
  assert.match(diyManagedPortalSurfaceSource, /Credit-governed execution/);
  assert.match(diyManagedPortalSurfaceSource, /Review and approval checkpoints/);
  assert.match(diyManagedPortalSurfaceSource, /Project workspace/);
  assert.match(diyManagedPortalSurfaceSource, /Managed credit packages/);
  assert.match(diyManagedPortalSurfaceSource, /Deeper execution support/);
  assert.match(diyManagedPortalSurfaceSource, /Setup and delivery guidance/);
  assert.match(diyManagedPortalSurfaceSource, /Stronger review loop/);
  assert.match(diyManagedPortalSurfaceSource, /More hands-on project handling/);
  assert.match(diyManagedPortalSurfaceSource, /Learn more/);
  assert.match(diyManagedPortalSurfaceSource, /type="button"/);
  assert.match(diyManagedPortalSurfaceSource, /role="dialog"/);
  assert.match(diyManagedPortalSurfaceSource, /aria-modal="true"/);
  assert.match(diyManagedPortalSurfaceSource, /aria-labelledby=\{titleId\}/);
  assert.match(diyManagedPortalSurfaceSource, /aria-describedby=\{descriptionId\}/);
  assert.match(diyManagedPortalSurfaceSource, /aria-haspopup="dialog"/);
  assert.match(diyManagedPortalSurfaceSource, /aria-expanded=\{isActive\}/);
  assert.match(diyManagedPortalSurfaceSource, /Close explanation bubble/);
  assert.match(diyManagedPortalSurfaceSource, /event\.key === "Escape"/);
  assert.match(diyManagedPortalSurfaceSource, /document\.body\.style\.overflow = "hidden"/);
  assert.match(diyManagedPortalSurfaceSource, /previousActiveElement\?\.focus\(\)/);
  assert.match(diyManagedPortalSurfaceSource, /Credit-governed execution means build work is controlled by the credits available/);
  assert.match(diyManagedPortalSurfaceSource, /Managed credits are separate from regular Build Credits/);
  assert.match(diyManagedPortalSurfaceSource, /Both paths start with structure\./);
  assert.match(diyManagedPortalSurfaceSource, /Neroa does not begin by throwing prompts at code\./);
  assert.match(diyManagedPortalSurfaceSource, /Which one should you choose\?/);
  assert.match(diyManagedPortalSurfaceSource, /Choose DIY if:/);
  assert.match(diyManagedPortalSurfaceSource, /Choose Managed if:/);
  assert.match(diyManagedPortalSurfaceSource, /Compare plans/);
  assert.match(diyManagedPortalSurfaceSource, /Start with pricing/);
  assert.match(diyManagedPortalSurfaceSource, /Home/);
  assert.match(diyManagedPortalSurfaceSource, /Pricing/);
  assert.match(diyManagedPortalSurfaceSource, /DIY vs Managed/);
  assert.match(diyManagedPortalSurfaceSource, /Blog/);
  assert.match(diyManagedPortalSurfaceSource, /Sign In/);
  assert.match(diyManagedPortalSurfaceSource, /Start Your Project/);
  assert.match(diyManagedPortalSurfaceSource, /href="\/neroa\/pricing"/);
  assert.match(diyManagedPortalSurfaceSource, /href="\/neroa"/);
  assert.match(diyManagedPortalSurfaceSource, /href="\/neroa\/diy-vs-managed"/);
  assert.match(diyManagedPortalSurfaceSource, /href="\/neroa\/blog"/);
  assert.match(diyManagedPortalSurfaceSource, /href="\/neroa\/auth"/);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /href="#/);
  assert.match(diyManagedPortalSurfaceSource, /NeroaNorthStarAccent/);
  assert.match(diyManagedPortalSurfaceSource, /testId="diy-managed-page-north-star"/);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /<img/i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /<Image/i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /\/logo\//i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /\/logos\//i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /instant full MVP/i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /magic app builder/i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /cheap clone builder/i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /GPT-5\.5/i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /checkout/i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /\bNaroa\b/);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /\bNerowa\b/);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /\bNarowa\b/);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /\bNarua\b/);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /from\s+["'][^"']*stripe/i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /from\s+["']@\/lib\/billing\//i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /browser-runtime-bridge/i);
  assert.doesNotMatch(diyManagedPortalSurfaceSource, /from\s+["'][^"']*model/i);
});

test("/neroa/diy-vs-managed keeps unique concept identities and locks the public nav routes", () => {
  assert.match(diyManagedPortalSurfaceSource, /id: "shared-roadmap-first-planning"/);
  assert.match(diyManagedPortalSurfaceSource, /id: "diy-roadmap-first-planning"/);
  assert.match(diyManagedPortalSurfaceSource, /id: "diy-credit-governed-execution"/);
  assert.match(diyManagedPortalSurfaceSource, /id: "managed-credit-packages"/);
  assert.match(diyManagedPortalSurfaceSource, /activeConceptId/);
  assert.match(diyManagedPortalSurfaceSource, /concept\.id === activeConceptId/);
  assert.match(diyManagedPortalSurfaceSource, /setActiveConceptId\(nextConcept\.id\)/);
  assert.match(diyManagedPortalSurfaceSource, /aria-label="Neroa public navigation"/);
  assert.match(diyManagedPortalSurfaceSource, /href="\/neroa"/);
  assert.match(diyManagedPortalSurfaceSource, /href="\/neroa\/pricing"/);
  assert.match(diyManagedPortalSurfaceSource, /href="\/neroa\/diy-vs-managed"/);
  assert.match(diyManagedPortalSurfaceSource, /href="\/neroa\/blog"/);
  assert.match(diyManagedPortalSurfaceSource, /href="\/neroa\/auth"/);
  assert.equal(countOccurrences(diyManagedPortalSurfaceSource, /href="\/neroa\/pricing"/g), 4);
});

test("navigation uses Neroa wordmark text only and no image logo paths", () => {
  assert.match(portalNavigationSource, />\s*Neroa\s*</);
  assert.doesNotMatch(portalNavigationSource, /<img/i);
  assert.doesNotMatch(portalNavigationSource, /<Image/i);
  assert.doesNotMatch(portalNavigationSource, /\/logo\//);
  assert.doesNotMatch(portalNavigationSource, />\s*N\s*</);
});

test("clean auth route exports and renders the Neroa auth page UI", () => {
  assert.match(authPortalSource, /NeroaAuthSurface/);
  assert.match(authPortalSource, /@\/components\/neroa-portal\/neroa-auth-surface/);
  assert.match(authPortalSource, /selectedPlanFromQuery/);
  assert.match(authPortalSource, /selectedPlan = selectedPlanFromQuery \?\? "free"/);
  assert.match(authPortalSource, /hasExplicitPlan = selectedPlanFromQuery !== null/);
  assert.match(authPortalSource, /initialError/);
  assert.match(authPortalSource, /initialNotice/);
  assert.doesNotMatch(authPortalSource, /@\/components\/portal\//);
  assert.doesNotMatch(authPortalSource, /@\/components\/workspace\//);
  assert.doesNotMatch(authPortalSource, /@\/components\/auth-form/);
  assert.match(authPortalSource, /Neroa \| Sign In/);
  assert.match(authPortalSurfaceSource, /"use client"/);
  assert.match(authPortalSurfaceSource, /createSupabaseBrowserClient/);
  assert.match(authPortalSurfaceSource, /useRouter/);
  assert.match(authPortalSurfaceSource, /Welcome to Neroa/);
  assert.match(authPortalSurfaceSource, /Start with a plan before the build begins\./);
  assert.match(authPortalSurfaceSource, /Structured Project Access/);
  assert.match(authPortalSurfaceSource, /Sign in or create an account to start your project\./);
  assert.match(authPortalSurfaceSource, /Sign In/);
  assert.match(authPortalSurfaceSource, /Create Account/);
  assert.match(authPortalSurfaceSource, /Email/);
  assert.match(authPortalSurfaceSource, /Password/);
  assert.match(authPortalSurfaceSource, /Confirm Password/);
  assert.match(authPortalSurfaceSource, /Forgot password\?/);
  assert.match(authPortalSurfaceSource, /NeroaNorthStarAccent/);
});

test("clean auth surface includes local form controls and removes placeholder copy", () => {
  assert.match(authPortalSurfaceSource, /useState/);
  assert.match(authPortalSurfaceSource, /lg:grid-cols-\[minmax\(0,1\.05fr\)_minmax\(24rem,34rem\)\]/);
  assert.match(authPortalSurfaceSource, /justify-self-end/);
  assert.match(authPortalSurfaceSource, /Roadmap-first planning/);
  assert.match(authPortalSurfaceSource, /Scope before execution/);
  assert.match(authPortalSurfaceSource, /Decisions and approvals/);
  assert.match(authPortalSurfaceSource, /Evidence and review/);
  assert.match(authPortalSurfaceSource, /Build with direction/);
  assert.match(authPortalSurfaceSource, /Sign in or create an account to begin shaping your project\./);
  assert.match(authPortalSurfaceSource, /showSignInPassword/);
  assert.match(authPortalSurfaceSource, /showCreatePassword/);
  assert.match(authPortalSurfaceSource, /supabase\.auth\.signInWithPassword/);
  assert.match(authPortalSurfaceSource, /supabase\.auth\.signUp/);
  assert.match(authPortalSurfaceSource, /supabase\.auth\.resetPasswordForEmail/);
  assert.match(authPortalSurfaceSource, /Forgot password\?/);
  assert.match(authPortalSurfaceSource, /Send Reset Link/);
  assert.match(authPortalSurfaceSource, /Starting with Free Project Preview\. You can choose or upgrade a plan after account creation\./);
  assert.match(authPortalSurfaceSource, /type=\{showSignInPassword \? "text" : "password"\}/);
  assert.match(authPortalSurfaceSource, /type=\{showCreatePassword \? "text" : "password"\}/);
  assert.match(authPortalSurfaceSource, /aria-label=\{showSignInPassword \? "Hide password" : "Show password"\}/);
  assert.match(authPortalSurfaceSource, /aria-label=\{showCreatePassword \? "Hide password" : "Show password"\}/);
  assert.match(authPortalSurfaceSource, /onSubmit=\{handleSignInSubmit\}/);
  assert.match(authPortalSurfaceSource, /onSubmit=\{handleCreateSubmit\}/);
  assert.match(authPortalSurfaceSource, /onSubmit=\{handleForgotPasswordSubmit\}/);
  assert.match(authPortalSurfaceSource, /type="submit"/);
  assert.match(authPortalSurfaceSource, /buildAccountPathForSignIn/);
  assert.match(authPortalSurfaceSource, /buildAccountPathForSignup/);
  assert.match(authPortalSurfaceSource, /\/neroa\/account/);
  assert.match(authPortalSurfaceSource, /\/neroa\/auth\/confirm/);
  assert.match(authPortalSurfaceSource, /\/neroa\/auth\/reset-password/);
  assert.match(authPortalSurfaceSource, /selectedPlanLabels/);
  assert.match(authPortalSurfaceSource, /Selected Plan:/);
  assert.match(authPortalSurfaceSource, /free: "Free"/);
  assert.match(authPortalSurfaceSource, /managed: "Managed Build"/);
  assert.match(authPortalSurfaceSource, /selected_plan: selectedPlan/);
  assert.match(authPortalSurfaceSource, /Back to pricing/);
  assert.match(authPortalSurfaceSource, /Didn&apos;t receive it\? Check spam or confirm the email address is correct\./);
  assert.match(authPortalSurfaceSource, /className="right-\[18rem\] top-\[7rem\]"/);
  assert.match(authPortalSurfaceSource, /Home/);
  assert.match(authPortalSurfaceSource, /Pricing/);
  assert.match(authPortalSurfaceSource, /DIY vs Managed/);
  assert.match(authPortalSurfaceSource, /Blog/);
  assert.match(authPortalSurfaceSource, /Start Your Project/);
  assert.match(authPortalSurfaceSource, /href="\/neroa\/pricing"/);
  assert.match(authPortalSurfaceSource, /href="\/neroa\/diy-vs-managed"/);
  assert.match(authPortalSurfaceSource, /href="\/neroa\/blog"/);
  assert.doesNotMatch(authPortalSurfaceSource, /NeroaPortalNavigation/);
  assert.doesNotMatch(authPortalSurfaceSource, /@\/components\/auth\//);
  assert.doesNotMatch(authPortalSurfaceSource, /@\/app\/auth\//);
  assert.doesNotMatch(authPortalSurfaceSource, /placeholder-only/i);
  assert.doesNotMatch(authPortalSurfaceSource, /future routing notes/i);
  assert.doesNotMatch(authPortalSurfaceSource, /Continue to Account Portal later/);
  assert.doesNotMatch(authPortalSurfaceSource, /Continue to Project Portal later/);
  assert.doesNotMatch(authPortalSurfaceSource, /clean auth surface/i);
  assert.doesNotMatch(authPortalSurfaceSource, /surface status/i);
  assert.doesNotMatch(authPortalSurfaceSource, /control layer/i);
  assert.doesNotMatch(authPortalSurfaceSource, /runtime-free/i);
  assert.doesNotMatch(authPortalSurfaceSource, /No live login or signup submission is active in this pass\./);
  assert.doesNotMatch(authPortalSurfaceSource, /No route guards, session restoration, or redirect logic is active in this pass\./);
  assert.doesNotMatch(authPortalSurfaceSource, /Continue destinations are informational only and do not trigger redirect decisions\./);
  assert.doesNotMatch(authPortalSurfaceSource, /magic link/i);
  assert.doesNotMatch(authPortalSurfaceSource, /\bConnected\b/);
  assert.doesNotMatch(authPortalSurfaceSource, /href="#"/);
  assert.doesNotMatch(authPortalSurfaceSource, /new URL\("\/auth\/confirm"/);
  assert.doesNotMatch(authPortalSurfaceSource, /["'`]\/reset-password["'`]/);
});

test("clean auth surface uses Neroa wordmark text only without naming drift", () => {
  assert.match(authPortalSurfaceSource, />\s*Neroa\s*</);
  assert.doesNotMatch(authPortalSurfaceSource, /<img/i);
  assert.doesNotMatch(authPortalSurfaceSource, /<Image/i);
  assert.doesNotMatch(authPortalSurfaceSource, /\/logo\//);
  assert.match(authPortalSurfaceSource, /\/brand\/background\.png/);
  assert.doesNotMatch(authPortalSurfaceSource, />\s*N\s*</);
  assert.doesNotMatch(authPortalSurfaceSource, /\bNerowa\b/);
  assert.doesNotMatch(authPortalSurfaceSource, /\bNaroa\b/);
  assert.doesNotMatch(authPortalSurfaceSource, /\bNarowa\b/);
  assert.doesNotMatch(authPortalSurfaceSource, /\bNarua\b/);
});

test("Account Portal lands on an account-first shell with authenticated navigation", () => {
  assert.match(accountPortalSurfaceSource, /NeroaPortalNavigation/);
  assert.match(accountPortalSurfaceSource, /NeroaNorthStarAccent/);
  assert.match(accountPortalSurfaceSource, /testId="account-page-north-star"/);
  assert.match(accountPortalSurfaceSource, /className="right-\[18rem\] top-\[7rem\]"/);
  assert.match(accountPortalSurfaceSource, /currentPath="\/neroa\/account"/);
  assert.match(accountPortalSurfaceSource, /tone="dark"/);
  assert.match(accountPortalSurfaceSource, /"use client"/);
  assert.match(accountPortalSurfaceSource, /useState<AccountTab>\("Account"\)/);
  assert.match(accountPortalSurfaceSource, /Project Board/);
  assert.match(accountPortalSurfaceSource, /Billing \/ Usage/);
  assert.match(accountPortalSurfaceSource, /Account/);
  assert.match(accountPortalSurfaceSource, /Contact/);
  assert.match(accountPortalSurfaceSource, /role="tablist"/);
  assert.match(accountPortalSurfaceSource, /role="tab"/);
  assert.match(accountPortalSurfaceSource, /role="tabpanel"/);
  assert.match(accountPortalSurfaceSource, /aria-label="Account portal sections"/);
  assert.match(accountPortalSurfaceSource, /aria-label=\{`Open \$\{tab\}`\}/);
  assert.match(accountPortalSurfaceSource, /aria-selected=\{active\}/);
  assert.match(accountPortalSurfaceSource, /aria-controls=\{panelId\}/);
  assert.match(accountPortalSurfaceSource, /href="\/neroa\/project"/);
  assert.match(accountPortalSurfaceSource, /href="\/neroa\/pricing"/);
  assert.match(accountPortalSurfaceSource, /href="\/neroa\/contact"/);
});

test("Account Portal defaults to an honest Project Board shell without fake project data", () => {
  assert.match(accountPortalSurfaceSource, /Track active projects, open work, paused items, and next project actions\./);
  assert.match(accountPortalSurfaceSource, /Active Projects/);
  assert.match(accountPortalSurfaceSource, /Open Items/);
  assert.match(accountPortalSurfaceSource, /Paused \/ Waiting/);
  assert.match(accountPortalSurfaceSource, /Completed \/ Archived/);
  assert.match(accountPortalSurfaceSource, /Next Action/);
  assert.match(accountPortalSurfaceSource, /No active projects yet\./);
  assert.match(accountPortalSurfaceSource, /No open items yet\./);
  assert.match(accountPortalSurfaceSource, /No paused items yet\./);
  assert.match(accountPortalSurfaceSource, /No completed projects yet\./);
  assert.match(
    accountPortalSurfaceSource,
    /No next action yet\. Start a project or open the Project Portal when you are ready to\s+organize roadmap, scope, decisions, evidence, and build readiness\./
  );
  assert.match(accountPortalSurfaceSource, /Start a Project/);
  assert.match(accountPortalSurfaceSource, /View Project Portal/);
  assert.match(accountPortalSurfaceSource, /aria-label="Start a project from pricing"/);
  assert.match(accountPortalSurfaceSource, /aria-label="View the Project Portal"/);
  assert.doesNotMatch(accountPortalSurfaceSource, /const\s+\w*projects\w*\s*=\s*\[/i);
  assert.doesNotMatch(accountPortalSurfaceSource, /\bname:\s*["']/);
  assert.doesNotMatch(accountPortalSurfaceSource, /\bstatus:\s*["']/);
  assert.doesNotMatch(accountPortalSurfaceSource, /fake project/i);
});

test("Account Portal removes oversized hero copy, duplicate sections, and banned labels", () => {
  assert.match(accountPortalSurfaceSource, /Pricing Path: \{selectedPlanLabel\}/);
  assert.match(accountPortalSurfaceSource, /Managed path/);
  assert.doesNotMatch(portalNavigationSource, /Front Door/);
  assert.doesNotMatch(portalNavigationSource, /Auth Surface/);
  assert.doesNotMatch(portalNavigationSource, /Authentication Surface/);
  assert.doesNotMatch(portalNavigationSource, /Clean Portal/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Projects are the default landing inside your Neroa account\./);
  assert.doesNotMatch(accountPortalSurfaceSource, /Projects First/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Project Signals/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Default Landing/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Resume Project/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Supporting Context/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Workspace Entry/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Profile Context/);
  assert.doesNotMatch(accountPortalSurfaceSource, /"Projects",/);
  assert.doesNotMatch(accountPortalSurfaceSource, /href="#/);
  assert.doesNotMatch(accountPortalSurfaceSource, /placeholder/i);
  assert.doesNotMatch(accountPortalSurfaceSource, /Surface Status/i);
  assert.doesNotMatch(accountPortalSurfaceSource, /front door/i);
  assert.doesNotMatch(accountPortalSurfaceSource, /authentication surface/i);
  assert.doesNotMatch(accountPortalSurfaceSource, /clean portal/i);
  assert.doesNotMatch(accountPortalSurfaceSource, /runtime-free/i);
});

test("Account Portal reflects the locked dark Neroa visual direction", () => {
  assert.match(accountPortalSurfaceSource, /bg-\[#04070a\]/);
  assert.match(accountPortalSurfaceSource, /url\('\/brand\/background\.png'\)/);
  assert.match(accountPortalSurfaceSource, /text-teal-/);
  assert.match(accountPortalSurfaceSource, /border-white\/10/);
  assert.match(accountPortalSurfaceSource, /backdrop-blur/);
  assert.match(accountPortalSurfaceSource, /shadow-\[0_22px_70px/);
});

test("Account Portal does not imply live saving or connected integration state", () => {
  assert.doesNotMatch(accountPortalSurfaceSource, /<form/i);
  assert.doesNotMatch(accountPortalSurfaceSource, /Connected\b/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Save Changes/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Sync Now/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Connect /);
  assert.doesNotMatch(accountPortalSurfaceSource, /Stripe/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Supabase/);
});

test("Account Portal preserves plan query handling without wiring billing runtime", () => {
  assert.match(accountPortalSource, /searchParams/);
  assert.match(accountPortalSource, /normalizeSelectedPlan/);
  assert.match(accountPortalSource, /buildAccountProfileSnapshot/);
  assert.match(accountPortalSource, /createSupabaseServerClient/);
  assert.match(accountPortalSource, /normalizeSessionPlanLabel/);
  assert.match(accountPortalSource, /readSessionPlanLabel/);
  assert.match(accountPortalSource, /noStore\(\)/);
  assert.match(accountPortalSource, /case "free"/);
  assert.match(accountPortalSource, /case "starter"/);
  assert.match(accountPortalSource, /case "pro"/);
  assert.match(accountPortalSource, /case "business"/);
  assert.match(accountPortalSource, /case "managed"/);
  assert.match(accountPortalSource, /selectedPlan=\{selectedPlan\}/);
  assert.match(accountPortalSource, /accountProfile=\{accountProfile\}/);
  assert.doesNotMatch(accountPortalSource, /@\/lib\/billing\//);
  assert.doesNotMatch(accountPortalSource, /@\/lib\/account\//);
  assert.doesNotMatch(accountPortalSource, /@\/lib\/pricing\//);
  assert.doesNotMatch(accountPortalSource, /from\s+["'][^"']*stripe/i);
});

test("Account Portal billing, account, and contact panels stay UI-only", () => {
  assert.match(
    accountPortalSurfaceSource,
    /Review your current plan, Build Credits, usage summaries, and credit top-off guidance\s+without implying live billing is already connected\./
  );
  assert.match(accountPortalSurfaceSource, /Current Plan/);
  assert.match(accountPortalSurfaceSource, /Plan/);
  assert.match(accountPortalSurfaceSource, /Included Build Credits/);
  assert.match(accountPortalSurfaceSource, /Billing cycle/);
  assert.match(accountPortalSurfaceSource, /Plan status/);
  assert.match(accountPortalSurfaceSource, /Not available yet/);
  assert.match(
    accountPortalSurfaceSource,
    /Live plan details will appear here once account billing and the credit ledger are\s+connected\./
  );
  assert.match(accountPortalSurfaceSource, /Change Plan/);
  assert.match(accountPortalSurfaceSource, /Current Credit Balance/);
  assert.match(accountPortalSurfaceSource, /Available credits/);
  assert.match(accountPortalSurfaceSource, /Used this month/);
  assert.match(accountPortalSurfaceSource, /Remaining credits/);
  assert.match(accountPortalSurfaceSource, /Top-off credits/);
  assert.match(
    accountPortalSurfaceSource,
    /Live credit balances will appear here once the credit ledger is connected\./
  );
  assert.match(accountPortalSurfaceSource, /Usage Summary/);
  assert.match(accountPortalSurfaceSource, /Monthly credits used/);
  assert.match(accountPortalSurfaceSource, /Year-to-date credits used/);
  assert.match(accountPortalSurfaceSource, /Lifetime credits used/);
  assert.match(accountPortalSurfaceSource, /Pending credit ledger/);
  assert.match(accountPortalSurfaceSource, /Project Credit Usage/);
  assert.match(accountPortalSurfaceSource, /Credits used this month/);
  assert.match(accountPortalSurfaceSource, /Credits used total/);
  assert.match(accountPortalSurfaceSource, /Last activity/);
  assert.match(accountPortalSurfaceSource, /Status/);
  assert.match(accountPortalSurfaceSource, /No project credit usage yet\./);
  assert.match(
    accountPortalSurfaceSource,
    /Activity time may be shown later as a project insight, but billing remains\s+credit-based\./
  );
  assert.match(accountPortalSurfaceSource, /Credit Top-Offs/);
  assert.match(accountPortalSurfaceSource, /200 credits \/ \$60/);
  assert.match(accountPortalSurfaceSource, /500 credits \/ \$150/);
  assert.match(accountPortalSurfaceSource, /1,000 credits \/ \$300/);
  assert.match(accountPortalSurfaceSource, /2,000 credits \/ \$600/);
  assert.match(accountPortalSurfaceSource, /View Top-Offs/);
  assert.match(accountPortalSurfaceSource, /Managed Credits/);
  assert.match(
    accountPortalSurfaceSource,
    /Managed credits are separate from standard Build Credits\./
  );
  assert.match(
    accountPortalSurfaceSource,
    /Managed balance and usage will appear here once connected\./
  );
  assert.match(accountPortalSurfaceSource, /View Managed Build Options/);
  assert.match(
    accountPortalSurfaceSource,
    /Review the account details attached to this Neroa session, understand your current plan\s+path, and reach the next security step without exposing risky account actions here\./
  );
  assert.match(
    accountPortalSurfaceSource,
    /Profile/
  );
  assert.match(accountPortalSurfaceSource, /Name/);
  assert.match(accountPortalSurfaceSource, /Organization/);
  assert.match(accountPortalSurfaceSource, /Email/);
  assert.match(
    accountPortalSurfaceSource,
    /Signed-in email will appear here once account profile data is connected\./
  );
  assert.match(accountPortalSurfaceSource, /Plan Context/);
  assert.match(accountPortalSurfaceSource, /Current Plan/);
  assert.match(accountPortalSurfaceSource, /Build Credit path/);
  assert.match(accountPortalSurfaceSource, /View Billing \/ Usage/);
  assert.match(accountPortalSurfaceSource, /Security/);
  assert.match(accountPortalSurfaceSource, /Change Email/);
  assert.match(
    accountPortalSurfaceSource,
    /Email changes will be handled here once account security settings are connected\./
  );
  assert.match(accountPortalSurfaceSource, /Reset Password/);
  assert.match(accountPortalSource, /\/neroa\/auth\/reset-password/);
  assert.match(accountPortalSurfaceSource, /Sign Out/);
  assert.match(
    accountPortalSurfaceSource,
    /Sign out will be available once account session controls are connected\./
  );
  assert.match(accountPortalSurfaceSource, /Danger Zone/);
  assert.match(accountPortalSurfaceSource, /Delete Account/);
  assert.match(
    accountPortalSurfaceSource,
    /Account deletion requires confirmation\s+and data review\.\s+Contact support for deletion\s+requests until self-service deletion is available\./
  );
  assert.match(
    accountPortalSurfaceSource,
    /Need help with your plan, project setup, or account access\? Contact Neroa support\./
  );
  assert.match(accountPortalSurfaceSource, /Contact Support/);
  assert.match(accountPortalSurfaceSource, /aria-label="Open the Neroa contact page"/);
  assert.match(
    accountPortalSurfaceSource,
    /aria-label="Contact support about account deletion"/
  );
  assert.match(accountPortalSurfaceSource, /href="\/neroa\/pricing"/);
  assert.match(accountPortalSurfaceSource, /href="\/neroa\/contact"/);
  assert.match(accountPortalSurfaceSource, /Pricing Path:/);
  assert.doesNotMatch(accountPortalSurfaceSource, /Workspace Hours/);
  assert.doesNotMatch(accountPortalSurfaceSource, /billable hours/i);
  assert.doesNotMatch(accountPortalSurfaceSource, /Stripe/);
  assert.doesNotMatch(accountPortalSurfaceSource, /billing runtime/i);
  assert.doesNotMatch(accountPortalSurfaceSource, /Delete this account now/i);
});

test("Account Portal sources avoid spelling drift, runtime imports, and schema-style dependencies", () => {
  for (const source of accountPortalSources) {
    assert.doesNotMatch(source, /\bNaroa\b/);
    assert.doesNotMatch(source, /\bNerowa\b/);
    assert.doesNotMatch(source, /\bNarowa\b/);
    assert.doesNotMatch(source, /\bNarua\b/);
    assert.doesNotMatch(source, /from\s+["'][^"']*stripe/i);
    assert.doesNotMatch(source, /from\s+["']@\/lib\/billing\//i);
    assert.doesNotMatch(source, /from\s+["'][^"']*runtime/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*model(?:s)?(?:\/|["'])/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*schema(?:\/|["'])/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*migration(?:s)?(?:\/|["'])/i);
    assert.doesNotMatch(source, /\bschema\b/i);
    assert.doesNotMatch(source, /\bmigration\b/i);
  }
});

test("Contact page stays inside the hardened Neroa support scope", () => {
  assert.match(contactPortalSource, /Neroa \| Contact/);
  assert.match(contactPortalSource, /NeroaContactSurface/);
  assert.match(contactPortalSurfaceSource, /Contact Neroa/);
  assert.match(
    contactPortalSurfaceSource,
    /Get help with your account, plan, project setup, or build path\./
  );
  assert.match(contactPortalSurfaceSource, /Account Access/);
  assert.match(contactPortalSurfaceSource, /Billing \/ Usage/);
  assert.match(contactPortalSurfaceSource, /Project Setup/);
  assert.match(contactPortalSurfaceSource, /Managed Build Questions/);
  assert.match(contactPortalSurfaceSource, /General Support/);
  assert.match(contactPortalSurfaceSource, /Email Support/);
  assert.match(contactPortalSurfaceSource, /support@neroa\.io/);
  assert.match(
    contactPortalSurfaceSource,
    /Support chat is planned for a later release\.\s+For now, email support is the safest\s+way to reach Neroa\./
  );
  assert.doesNotMatch(contactPortalSurfaceSource, /AI chat is live/i);
  assert.doesNotMatch(contactPortalSurfaceSource, /ticket backend/i);
  assert.doesNotMatch(contactPortalSurfaceSource, /<form/i);
});

test("Contact page sources avoid spelling drift, runtime imports, and schema-style dependencies", () => {
  for (const source of contactPortalSources) {
    assert.doesNotMatch(source, /\bNaroa\b/);
    assert.doesNotMatch(source, /\bNerowa\b/);
    assert.doesNotMatch(source, /\bNarowa\b/);
    assert.doesNotMatch(source, /\bNarua\b/);
    assert.doesNotMatch(source, /from\s+["'][^"']*stripe/i);
    assert.doesNotMatch(source, /from\s+["']@\/lib\/billing\//i);
    assert.doesNotMatch(source, /from\s+["'][^"']*runtime/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*model(?:s)?(?:\/|["'])/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*schema(?:\/|["'])/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*migration(?:s)?(?:\/|["'])/i);
    assert.doesNotMatch(source, /\bschema\b/i);
    assert.doesNotMatch(source, /\bmigration\b/i);
  }
});

test("Project Portal presents the public project overview content", () => {
  assert.match(projectPortalSurfaceSource, /NeroaPortalNavigation/);
  assert.match(projectPortalSurfaceSource, /NeroaNorthStarAccent/);
  assert.match(projectPortalSurfaceSource, /testId="project-page-north-star"/);
  assert.match(projectPortalSurfaceSource, /className="right-\[18rem\] top-\[7rem\]"/);
  assert.match(projectPortalSurfaceSource, /currentPath="\/neroa\/project"/);
  assert.match(projectPortalSurfaceSource, /tone="dark"/);
  assert.match(
    projectPortalSurfaceSource,
    /Your project workspace will organize roadmap, scope, decisions, evidence, and build readiness as your plan takes shape\./
  );
  assert.match(projectPortalSurfaceSource, /title:\s*"Roadmap"/);
  assert.match(projectPortalSurfaceSource, /title:\s*"Scope"/);
  assert.match(projectPortalSurfaceSource, /title:\s*"Decisions"/);
  assert.match(projectPortalSurfaceSource, /title:\s*"Evidence"/);
  assert.match(projectPortalSurfaceSource, /title:\s*"Build Readiness"/);
  assert.match(projectPortalSurfaceSource, /Project Highlights/);
  assert.match(projectPortalSurfaceSource, /Project Overview/);
  assert.match(projectPortalSurfaceSource, /Readiness Notes/);
});

test("Project Portal remains project-level only and does not promote account sections as primary sections", () => {
  assert.doesNotMatch(projectPortalSurfaceSource, /title:\s*"Profile"/);
  assert.doesNotMatch(projectPortalSurfaceSource, /title:\s*"Plan & Credits"/);
  assert.doesNotMatch(projectPortalSurfaceSource, /title:\s*"Projects"/);
  assert.doesNotMatch(projectPortalSurfaceSource, /title:\s*"Settings"/);
});

test("Project Portal stays public-facing and avoids placeholder or legacy runtime wording", () => {
  assert.match(projectPortalSurfaceSource, /Roadmap, scope, decisions, and evidence in one view/);
  assert.doesNotMatch(projectPortalSurfaceSource, /Surface Status/);
  assert.doesNotMatch(projectPortalSurfaceSource, /Placeholder-only/i);
  assert.doesNotMatch(projectPortalSurfaceSource, /placeholder/i);
  assert.doesNotMatch(projectPortalSurfaceSource, /control layer/i);
  assert.doesNotMatch(projectPortalSurfaceSource, /future routing/i);
  assert.doesNotMatch(projectPortalSurfaceSource, /Strategy Room/i);
  assert.doesNotMatch(projectPortalSurfaceSource, /Command Center/i);
  assert.doesNotMatch(projectPortalSurfaceSource, /Build Room/i);
  assert.doesNotMatch(projectPortalSurfaceSource, /Live View/i);
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
  assert.match(projectPortalSurfaceSource, /bg-\[#04070a\]/);
  assert.match(projectPortalSurfaceSource, /url\('\/brand\/background\.png'\)/);
  assert.match(projectPortalSurfaceSource, /charcoal/i);
  assert.match(projectPortalSurfaceSource, /soft silver/i);
  assert.match(projectPortalSurfaceSource, /subtle teal/i);
  assert.match(projectPortalSurfaceSource, /Roadmap, scope, decisions, and evidence in one view/);
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
  for (const source of uiOnlyPortalSources) {
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

test("landing wrappers only use optional auth lookup for post-chat routing", () => {
  for (const source of landingWrapperSources) {
    assert.match(source, /getOptionalUser/);
    assert.match(source, /Boolean\(user\)/);
    assert.doesNotMatch(source, /requireUser/);
    assert.doesNotMatch(source, /redirect\(/);
    assert.doesNotMatch(source, /@\/lib\/billing/);
  }

  assert.doesNotMatch(frontDoorSurfaceSource, /@\/lib\/auth/);
});

test("clean auth page accepts selected plan context without wiring billing runtime", () => {
  assert.match(authPortalSource, /searchParams/);
  assert.match(authPortalSource, /normalizeSelectedPlan/);
  assert.match(authPortalSource, /case "free"/);
  assert.match(authPortalSource, /case "starter"/);
  assert.match(authPortalSource, /case "pro"/);
  assert.match(authPortalSource, /case "business"/);
  assert.match(authPortalSource, /case "managed"/);
  assert.match(authPortalSource, /selectedPlan=\{selectedPlan\}/);
  assert.match(authPortalSource, /hasExplicitPlan=\{hasExplicitPlan\}/);
  assert.doesNotMatch(authPortalSource, /@\/lib\/billing\//);
  assert.doesNotMatch(authPortalSource, /stripe/i);
});

test("clean auth surface does not import auth runtime session or guard modules", () => {
  for (const source of [authPortalSource, authPortalSurfaceSource]) {
    assert.doesNotMatch(source, /@\/lib\/auth/);
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
    assert.doesNotMatch(source, /from\s+["'][^"']*stripe/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*next-auth/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*session/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*guard/i);
    assert.doesNotMatch(source, /\bredirect\(/);
  }

  assert.doesNotMatch(authPortalSource, /@\/lib\/supabase\//);
  assert.match(authPortalSurfaceSource, /@\/lib\/supabase\/browser/);
  assert.doesNotMatch(authPortalSurfaceSource, /@\/lib\/supabase\/server/);
  assert.doesNotMatch(authPortalSurfaceSource, /service_role/i);
});

test("clean auth confirmation and reset routes stay inside the new Neroa auth architecture", () => {
  assert.match(cleanAuthConfirmRouteSource, /@\/lib\/supabase\/server/);
  assert.match(cleanAuthConfirmRouteSource, /\/neroa\/auth/);
  assert.match(cleanAuthConfirmRouteSource, /\/neroa\/account/);
  assert.match(cleanAuthConfirmRouteSource, /safeNextPath/);
  assert.match(cleanAuthConfirmRouteSource, /new URL\(next, requestUrl\.origin\)/);
  assert.match(cleanAuthConfirmRouteSource, /destination\.searchParams\.set\("notice"/);
  assert.doesNotMatch(cleanAuthConfirmRouteSource, /buildAuthRedirectPath/);
  assert.doesNotMatch(cleanAuthConfirmRouteSource, /APP_ROUTES/);
  assert.doesNotMatch(cleanAuthConfirmRouteSource, /@\/app\/auth\//);
  assert.doesNotMatch(cleanAuthConfirmRouteSource, /@\/components\/auth\//);
  assert.doesNotMatch(cleanAuthConfirmRouteSource, /@\/lib\/billing\//);
  assert.doesNotMatch(cleanAuthConfirmRouteSource, /stripe/i);

  assert.match(cleanResetPasswordPageSource, /@\/components\/neroa-portal\/neroa-reset-password-surface/);
  assert.match(cleanResetPasswordSurfaceSource, /createSupabaseBrowserClient/);
  assert.match(cleanResetPasswordSurfaceSource, /supabase\.auth\.updateUser/);
  assert.match(cleanResetPasswordSurfaceSource, /supabase\.auth\.signOut/);
  assert.match(cleanResetPasswordSurfaceSource, /Password updated\. Sign in with your new password\./);
  assert.match(cleanResetPasswordSurfaceSource, /Reset Password/);
  assert.match(cleanResetPasswordSurfaceSource, /Update Password/);
  assert.match(cleanResetPasswordSurfaceSource, /Back to Sign In/);
  assert.match(cleanResetPasswordSurfaceSource, /DIY vs Managed/);
  assert.match(cleanResetPasswordSurfaceSource, /Blog/);
  assert.match(cleanResetPasswordSurfaceSource, /Start Your Project/);
  assert.match(cleanResetPasswordSurfaceSource, /href="\/neroa\/diy-vs-managed"/);
  assert.match(cleanResetPasswordSurfaceSource, /href="\/neroa\/blog"/);
  assert.match(cleanResetPasswordSurfaceSource, /href="\/neroa\/pricing"/);
  assert.doesNotMatch(cleanResetPasswordSurfaceSource, /@\/components\/auth\//);
  assert.doesNotMatch(cleanResetPasswordSurfaceSource, /@\/app\/auth\//);
  assert.doesNotMatch(cleanResetPasswordSurfaceSource, /\/logo\//);
});

test("clean auth flow does not introduce schema or migration dependencies", () => {
  for (const source of [
    authPortalSource,
    authPortalSurfaceSource,
    cleanAuthConfirmRouteSource,
    cleanResetPasswordPageSource,
    cleanResetPasswordSurfaceSource
  ]) {
    assert.doesNotMatch(source, /schema/i);
    assert.doesNotMatch(source, /migration/i);
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
  for (const source of nonRuntimeUiPortalSources) {
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

test("clean auth plan flow keeps public CTAs and plan routing aligned", () => {
  assert.match(frontDoorSurfaceSource, /const startProjectHref = "\/neroa\/pricing"/);
  assert.doesNotMatch(frontDoorSurfaceSource, /href="\/neroa\/auth\?plan=/);
  assert.match(pricingPortalSurfaceSource, /DIY vs Managed/);
  assert.match(pricingPortalSurfaceSource, /Blog/);
  assert.match(pricingPortalSurfaceSource, /href="\/neroa\/pricing"/);
  assert.match(pricingPortalSurfaceSource, /href="\/neroa\/blog"/);
  assert.doesNotMatch(pricingPortalSurfaceSource, /href="#plans"/);
  assert.match(pricingPortalSurfaceSource, /id:\s*"free"/);
  assert.match(pricingPortalSurfaceSource, /id:\s*"starter"/);
  assert.match(pricingPortalSurfaceSource, /id:\s*"pro"/);
  assert.match(pricingPortalSurfaceSource, /id:\s*"business"/);
  assert.match(pricingPortalSurfaceSource, /id:\s*"managed"/);
  assert.match(pricingPortalSurfaceSource, /href=\{`\/neroa\/auth\?plan=\$\{plan\.id\}`\}/);
  assert.match(authPortalSource, /selectedPlan = selectedPlanFromQuery \?\? "free"/);
  assert.match(authPortalSurfaceSource, /hasExplicitPlan = false/);
  assert.match(authPortalSurfaceSource, /Selected Plan: \{selectedPlanLabel\}/);
  assert.match(authPortalSurfaceSource, /Starting with Free Project Preview\./);
  assert.match(authPortalSurfaceSource, /buildAccountPathForSignIn\(selectedPlan, hasExplicitPlan\)/);
  assert.match(authPortalSurfaceSource, /buildAccountPathForSignup\(selectedPlan\)/);
});

test("pricing preserves the governed public plan rules and top-off values", () => {
  assert.match(pricingPortalSurfaceSource, /Project preview/);
  assert.match(
    pricingPortalSurfaceSource,
    /Free is a limited preview experience for shaping an idea, not a free execution or MVP promise\./
  );
  assert.match(pricingPortalSurfaceSource, /Build Credits/);
  assert.match(pricingPortalSurfaceSource, /Managed credits stay distinct from standard Build Credits\./);
  assert.match(pricingPortalSurfaceSource, /200 credits \/ \$60/);
  assert.match(pricingPortalSurfaceSource, /500 credits \/ \$150/);
  assert.match(pricingPortalSurfaceSource, /1,000 credits \/ \$300/);
  assert.match(pricingPortalSurfaceSource, /2,000 credits \/ \$600/);
  assert.doesNotMatch(pricingPortalSurfaceSource, /40 credits/i);
  assert.doesNotMatch(pricingPortalSurfaceSource, /Workspace Hours/i);
  assert.doesNotMatch(pricingPortalSurfaceSource, /workspace-hour/i);
});

test("account and project metadata stay public-facing and drop shell wording", () => {
  assert.match(accountPortalSource, /title:\s*"Neroa \| Account"/);
  assert.match(
    accountPortalSource,
    /Open your Neroa account from the project board, account navigation, and supporting plan context\./
  );
  assert.match(projectPortalSource, /title:\s*"Neroa \| Project"/);
  assert.match(
    projectPortalSource,
    /See your Neroa project roadmap, scope, decisions, evidence, and build readiness in one calm project overview\./
  );
  assert.doesNotMatch(accountPortalSource, /shell/i);
  assert.doesNotMatch(accountPortalSource, /future/i);
  assert.doesNotMatch(projectPortalSource, /shell/i);
  assert.doesNotMatch(projectPortalSource, /future/i);
});

test("auth confirm route only hands off to safe /neroa destinations", () => {
  assert.match(cleanAuthConfirmRouteSource, /const safePortalPathPattern = \/\^\\\/neroa\(\?:\\\/\|\$\)\//);
  assert.match(cleanAuthConfirmRouteSource, /safePortalPathPattern\.test\(value\)/);
  assert.doesNotMatch(cleanAuthConfirmRouteSource, /value && value\.startsWith\("\/"\) && !value\.startsWith\("\/\/"\)\)/);
});

test("public entry sources remove spelling drift, legacy marketing strings, and old logo paths", () => {
  for (const source of publicEntrySources) {
    assert.doesNotMatch(source, /\bNaroa\b/);
    assert.doesNotMatch(source, /\bNerowa\b/);
    assert.doesNotMatch(source, /\bNarowa\b/);
    assert.doesNotMatch(source, /\bNarua\b/);
    assert.doesNotMatch(source, /Open Strategy Room/i);
    assert.doesNotMatch(source, /Share the idea/i);
    assert.doesNotMatch(source, /Workspace Hours/i);
    assert.doesNotMatch(source, /workspace-hour/i);
    assert.doesNotMatch(source, /\/logo\//i);
    assert.doesNotMatch(source, /\/logos\//i);
  }
});

test("blog content sources remove spelling drift and unsafe public copy", () => {
  for (const source of blogContentSources) {
    assert.doesNotMatch(source, /\bNurova\b/);
    assert.doesNotMatch(source, /\bNaroa\b/);
    assert.doesNotMatch(source, /\bNerowa\b/);
    assert.doesNotMatch(source, /\bNarowa\b/);
    assert.doesNotMatch(source, /\bNarua\b/);
    assert.doesNotMatch(source, /unlimited ai/i);
    assert.doesNotMatch(source, /instant full app/i);
    assert.doesNotMatch(source, /magic app builder/i);
    assert.doesNotMatch(source, /GPT-5\.5/i);
    assert.doesNotMatch(source, /\/logo\//i);
    assert.doesNotMatch(source, /\/logos\//i);
  }
});

test("public entry sources avoid Stripe, billing runtime, schema, migration, and model imports", () => {
  for (const source of publicEntrySources) {
    assert.doesNotMatch(source, /from\s+["'][^"']*stripe/i);
    assert.doesNotMatch(source, /from\s+["']@\/lib\/billing\//i);
    assert.doesNotMatch(source, /from\s+["']@\/lib\/stripe\//i);
    assert.doesNotMatch(source, /from\s+["']@\/lib\/schema/i);
    assert.doesNotMatch(source, /from\s+["']@\/lib\/migrations?\//i);
    assert.doesNotMatch(source, /from\s+["']@\/models?\//i);
    assert.doesNotMatch(source, /from\s+["'][^"']*\/schema(?:\/|["'])/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*\/migration(?:s)?(?:\/|["'])/i);
    assert.doesNotMatch(source, /from\s+["'][^"']*\/model(?:s)?(?:\/|["'])/i);
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
