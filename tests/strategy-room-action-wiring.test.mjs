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
const strategySavebackSource = readFileSync(
  new URL("../components/workspace/strategy-room-saveback-panel.tsx", import.meta.url),
  "utf8"
);
const strategyActionsSource = readFileSync(
  new URL("../app/workspace/[workspaceId]/strategy-room/actions.ts", import.meta.url),
  "utf8"
);

test("Save revision button stays wired to the shared Strategy Room save action", () => {
  assert.match(strategyRoomSource, /<StrategyRoomHeaderActions/);
  assert.match(strategyHeaderActionsSource, /<form action=\{saveStrategyRevision\}/);
  assert.match(strategyHeaderActionsSource, /name="workspaceId" value=\{workspaceId\}/);
  assert.match(strategyHeaderActionsSource, /name="returnTo" value=\{returnTo\}/);
  assert.match(strategyHeaderActionsSource, /name="saveMode" value="chat_checkpoint"/);
  assert.match(strategyHeaderActionsSource, /idleLabel="Save revision"/);
  assert.match(strategyHeaderActionsSource, /pendingLabel="Saving revision\.\.\."/);
});

test("Approve roadmap scope button stays wired to the shared Strategy Room approval action", () => {
  assert.match(strategyRoomSource, /approvalAllowed=\{governancePolicy\.approvalReadiness\.approvalAllowed\}/);
  assert.match(strategyHeaderActionsSource, /<form action=\{approveStrategyScope\}/);
  assert.match(strategyHeaderActionsSource, /idleLabel="Approve roadmap scope"/);
  assert.match(strategyHeaderActionsSource, /pendingLabel="Approving roadmap scope\.\.\."/);
  assert.match(strategyHeaderActionsSource, /disabled=\{!approvalAllowed\}/);
});

test("Visible Strategy Room actions no longer point to orphaned form ids after chat-first composition", () => {
  assert.doesNotMatch(strategyRoomSource, /form="strategy-saveback-form"|form="strategy-approve-form"/);
  assert.doesNotMatch(strategySavebackSource, /id="strategy-saveback-form"|id="strategy-approve-form"/);
  assert.match(strategySavebackSource, /Actions stay in the header/);
  assert.match(
    strategySavebackSource,
    /Save revision and approve roadmap scope stay mounted in the header with the shared/
  );
});

test("Strategy Room header preserves the shared save and approval backend path", () => {
  assert.match(strategyActionsSource, /export async function saveStrategyRevision/);
  assert.match(strategyActionsSource, /export async function approveStrategyScope/);
  assert.match(
    strategyHeaderActionsSource,
    /from "@\/app\/workspace\/\[workspaceId\]\/strategy-room\/actions"/
  );
  assert.doesNotMatch(strategyHeaderActionsSource, /createStrategyRevisionPersistenceUpdate|scopeApprovalRecordSchema|supabase\.from/);
  assert.doesNotMatch(strategySavebackSource, /saveStrategyRevision|approveStrategyScope/);
});
