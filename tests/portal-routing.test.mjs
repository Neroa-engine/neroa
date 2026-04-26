import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const portalRoutesSource = readFileSync(
  new URL("../lib/portal/routes.ts", import.meta.url),
  "utf8"
);
const portalServerSource = readFileSync(
  new URL("../lib/portal/server.ts", import.meta.url),
  "utf8"
);
const legacyProjectPageSource = readFileSync(
  new URL("../app/workspace/[workspaceId]/project/[projectId]/page.tsx", import.meta.url),
  "utf8"
);
const workspaceServerSource = readFileSync(
  new URL("../lib/workspace/server.ts", import.meta.url),
  "utf8"
);
const portalShellSource = readFileSync(
  new URL("../components/portal/portal-shells.tsx", import.meta.url),
  "utf8"
);
const projectsDashboardSource = readFileSync(
  new URL("../components/dashboard/projects-dashboard-page.tsx", import.meta.url),
  "utf8"
);
const buildRoomControlRoomSource = readFileSync(
  new URL("../components/workspace/build-room-control-room.tsx", import.meta.url),
  "utf8"
);
const projectLibrarySource = readFileSync(
  new URL("../components/workspace/project-library-page.tsx", import.meta.url),
  "utf8"
);
const publicAccountMenuSource = readFileSync(
  new URL("../components/site/public-account-menu.tsx", import.meta.url),
  "utf8"
);

test("Project nav destination correctness stays explicit by room", () => {
  assert.match(portalRoutesSource, /export function buildProjectWorkspaceRoute/);
  assert.match(portalRoutesSource, /export function buildProjectStrategyRoomRoute/);
  assert.match(portalRoutesSource, /export function buildProjectCommandCenterRoute/);
  assert.match(portalRoutesSource, /export function buildProjectBuildRoomRoute/);
  assert.match(portalRoutesSource, /const projectPortalRouteBuilders: Record</);
  assert.match(
    portalRoutesSource,
    /"strategy-room": buildProjectStrategyRoomRoute/
  );
  assert.match(
    portalRoutesSource,
    /"project-workspace": buildProjectWorkspaceRoute/
  );
  assert.match(
    portalRoutesSource,
    /"command-center": buildProjectCommandCenterRoute/
  );
  assert.match(
    portalRoutesSource,
    /"build-room": buildProjectBuildRoomRoute/
  );
  assert.match(
    portalShellSource,
    /href=\{resolveProjectPortalHref\(activeProject, roomId\)\}/
  );
});

test("Guard and redirect precision only keeps the intended Strategy Room fallback", () => {
  assert.match(
    portalServerSource,
    /if \(projectNeedsStrategyResume\(project\)\) {\s*return project\.strategyRoomRoute;\s*}\s*return project\.workspaceRoute;/s
  );
  assert.match(
    legacyProjectPageSource,
    /redirect\(\s*buildCanonicalWorkspaceRedirect\(\{/
  );
  assert.match(
    workspaceServerSource,
    /function buildCanonicalWorkspaceErrorRoute\(workspaceId: string, message: string\)/
  );
  assert.match(
    workspaceServerSource,
    /This legacy project route has been retired\. Continue in the active project portal\./
  );
  assert.doesNotMatch(legacyProjectPageSource, /strategy-room/);
});

test("Shared portal routing surfaces now use the canonical route helpers", () => {
  assert.match(
    projectsDashboardSource,
    /route: buildProjectWorkspaceRoute\(project\.workspaceId\)/
  );
  assert.match(
    buildRoomControlRoomSource,
    /const commandCenterHref = buildProjectCommandCenterRoute\(workspaceId\);/
  );
  assert.match(
    projectLibrarySource,
    /const projectWorkspaceHref = buildProjectWorkspaceRoute\(project\.workspaceId\);/
  );
  assert.match(
    projectLibrarySource,
    /const commandCenterHref = buildProjectCommandCenterRoute\(project\.workspaceId\);/
  );
});

test("Usage and billing navigation stay mapped to their own routes", () => {
  assert.match(
    portalShellSource,
    /currentPath\.startsWith\(APP_ROUTES\.billing\) \|\| currentPath\.startsWith\(APP_ROUTES\.usage\)/
  );
  assert.match(publicAccountMenuSource, /href="\/billing"/);
  assert.match(publicAccountMenuSource, /href="\/usage"/);
  assert.match(publicAccountMenuSource, /href="\/projects"/);
});
