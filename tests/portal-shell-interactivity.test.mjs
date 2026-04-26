import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const portalShellSource = readFileSync(
  new URL("../components/portal/portal-shells.tsx", import.meta.url),
  "utf8"
);
const activeProjectSelectSource = readFileSync(
  new URL("../components/portal/active-project-select-control.tsx", import.meta.url),
  "utf8"
);
const strategyRoomSource = readFileSync(
  new URL("../components/workspace/project-strategy-room-v1.tsx", import.meta.url),
  "utf8"
);
const canonicalEntryFlowSource = readFileSync(
  new URL("../components/onboarding/canonical-entry-flow.tsx", import.meta.url),
  "utf8"
);
const commandCenterPopoverSource = readFileSync(
  new URL("../components/workspace/command-center-popover-bar.tsx", import.meta.url),
  "utf8"
);

test("Shared portal nav controls are isolated into interactive shell regions", () => {
  const shellHeaderMatches = portalShellSource.match(/pointer-events-none relative z-\[200\]/g) ?? [];

  assert.equal(shellHeaderMatches.length, 2);
  assert.match(
    portalShellSource,
    /neroa-brand-link pointer-events-auto relative z-10/
  );
  assert.match(
    portalShellSource,
    /floating-nav neroa-nav-pane pointer-events-auto relative z-10/
  );
  assert.match(
    portalShellSource,
    /pointer-events-auto relative z-10 flex flex-wrap items-center gap-2/
  );
  assert.match(
    portalShellSource,
    /pointer-events-auto relative z-10 flex flex-wrap gap-2/
  );
  assert.match(
    activeProjectSelectSource,
    /pointer-events-auto relative z-10 shrink-0 flex flex-wrap items-center gap-2/
  );
});

test("Shell-level navigation stays above room popovers and content overlays", () => {
  assert.match(commandCenterPopoverSource, /pointer-events-none fixed inset-0 z-\[160\]/);
  assert.match(portalShellSource, /pointer-events-none relative z-\[200\]/);
  assert.match(portalShellSource, /<section className="relative z-0 mx-auto w-full max-w-\[1880px\]/);
});

test("Strategy Room local controls remain interactive after the shell fix", () => {
  assert.match(
    strategyRoomSource,
    /pointer-events-none absolute inset-0 bg-\[radial-gradient/
  );
  assert.match(strategyRoomSource, /<div className="relative z-10">/);
  assert.match(canonicalEntryFlowSource, /relative z-10 flex flex-col/);
  assert.match(canonicalEntryFlowSource, /relative z-10 border-t backdrop-blur-xl/);
});

test("Portal shell route targets stay mapped to the intended destinations", () => {
  assert.match(portalShellSource, /href=\{APP_ROUTES\.home\}/);
  assert.match(portalShellSource, /href=\{APP_ROUTES\.projects\}/);
  assert.match(portalShellSource, /href=\{APP_ROUTES\.projectsResume\}/);
  assert.match(portalShellSource, /href=\{activeProject\.workspaceRoute\}/);
  assert.match(
    portalShellSource,
    /destination=\{buildProjectRoomRoute\(activeProject\.workspaceId, currentRoom\)\}/
  );
  assert.match(
    portalShellSource,
    /href=\{resolveProjectPortalHref\(activeProject, roomId\)\}/
  );
  assert.match(
    portalShellSource,
    /href=\{activeProject\.buildRoomRoute\}/
  );
});
