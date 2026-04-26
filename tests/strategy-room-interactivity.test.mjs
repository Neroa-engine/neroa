import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const strategyRoomSource = readFileSync(
  new URL("../components/workspace/project-strategy-room-v1.tsx", import.meta.url),
  "utf8"
);
const strategyHeaderActionsSource = readFileSync(
  new URL("../components/workspace/strategy-room-header-actions.tsx", import.meta.url),
  "utf8"
);
const canonicalEntryFlowSource = readFileSync(
  new URL("../components/onboarding/canonical-entry-flow.tsx", import.meta.url),
  "utf8"
);

test("Strategy Room visible controls are mounted above inert decorative layers", () => {
  assert.match(
    strategyRoomSource,
    /pointer-events-none absolute inset-0 bg-\[radial-gradient/
  );
  assert.match(strategyRoomSource, /<div className="relative z-10">/);
  assert.match(
    strategyHeaderActionsSource,
    /className="relative z-10 flex flex-wrap items-center gap-3"/
  );
});

test("Header actions remain wired to the shared Strategy Room actions", () => {
  assert.match(strategyHeaderActionsSource, /<form action=\{saveStrategyRevision\}/);
  assert.match(strategyHeaderActionsSource, /<form action=\{approveStrategyScope\}/);
});

test("Chat controls stay in the interactive stack for the embedded Strategy Room", () => {
  assert.match(canonicalEntryFlowSource, /aria-hidden="true"[\s\S]*floating-wash/);
  assert.match(canonicalEntryFlowSource, /relative z-10 flex flex-col/);
  assert.match(
    canonicalEntryFlowSource,
    /relative z-10 mx-auto flex w-full items-center justify-between gap-4 border-b pb-4/
  );
  assert.match(
    canonicalEntryFlowSource,
    /relative z-10 flex-1 min-h-0 overflow-y-auto/
  );
  assert.match(
    canonicalEntryFlowSource,
    /relative z-10 border-t backdrop-blur-xl/
  );
  assert.match(canonicalEntryFlowSource, /onClick=\{\(\) => resetPlanningThread\(\)\}/);
  assert.match(canonicalEntryFlowSource, /onClick=\{\(\) => void handleSend\(\)\}/);
});

test("No Strategy Room header overlay remains able to intercept primary controls", () => {
  assert.doesNotMatch(strategyRoomSource, /className="absolute inset-0 bg-\[radial-gradient/);
});
