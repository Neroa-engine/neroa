import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DEFAULT_CONVERSATION_POLICY,
  buildConversationSessionState,
  buildConversationTurnGuidance,
  recordConversationQuestionAsked
} from "../lib/intelligence/conversation/index.ts";

function buildUserMessage(id, content) {
  return {
    id,
    role: "user",
    content
  };
}

test("founder greeting stores the founder name and identifies the assistant as Neroa", () => {
  const result = buildConversationSessionState({
    messages: [buildUserMessage("u1", "Hi, my name is Tom.")]
  });
  const guidance = buildConversationTurnGuidance({
    state: result.state,
    updatedSlotPaths: result.updatedSlotPaths
  });

  assert.equal(result.state.founderName, "Tom");
  assert.match(guidance.leadIn ?? "", /Hi Tom/i);
  assert.match(guidance.leadIn ?? "", /Neroa/);
  assert.equal(guidance.questionKey, "product_category");
  assert.doesNotMatch(
    `${guidance.leadIn ?? ""} ${guidance.question ?? ""}`,
    /first intentional user/i
  );
});

test("crypto audience recognition fills the buyer slot and moves to the next missing strategic question", () => {
  const messages = [
    buildUserMessage("u1", "Hi, my name is Tom."),
    buildUserMessage(
      "u2",
      "I want to build a crypto analytics website with a risk engine for pre-sales."
    ),
    buildUserMessage("u3", "Crypto investors are my main customer.")
  ];
  let previousState = null;
  let buildResult = null;

  for (let index = 0; index < messages.length; index += 1) {
    buildResult = buildConversationSessionState({
      previousState,
      messages: messages.slice(0, index + 1)
    });
    previousState = buildResult.state;
  }

  const guidance = buildConversationTurnGuidance({
    state: buildResult.state,
    updatedSlotPaths: buildResult.updatedSlotPaths
  });

  assert.equal(buildResult.state.founderName, "Tom");
  assert.deepEqual(buildResult.state.audience.buyerPersonas, ["Crypto investors"]);
  assert.ok(buildResult.state.audience.operatorPersonas.includes("Crypto investors"));
  assert.ok(
    buildResult.state.slots["audience.buyerPersonas"].status === "filled" ||
      buildResult.state.slots["audience.buyerPersonas"].status === "confirmed"
  );
  assert.notEqual(guidance.questionKey, "buyer_or_operator_persona");
  assert.match(guidance.question ?? "", /problem|risk|pre-sales|opportunities/i);
  assert.doesNotMatch(
    `${guidance.leadIn ?? ""} ${guidance.question ?? ""}`,
    /first intentional user/i
  );
});

test("restaurant audience split writes owners to buyers and managers to operators, then advances the question", () => {
  const messages = [
    buildUserMessage("u1", "I want a restaurant sales platform."),
    buildUserMessage("u2", "It's for owners and managers.")
  ];
  let previousState = null;
  let buildResult = null;

  for (let index = 0; index < messages.length; index += 1) {
    buildResult = buildConversationSessionState({
      previousState,
      messages: messages.slice(0, index + 1)
    });
    previousState = buildResult.state;
  }

  const guidance = buildConversationTurnGuidance({
    state: buildResult.state,
    updatedSlotPaths: buildResult.updatedSlotPaths
  });

  assert.deepEqual(buildResult.state.audience.buyerPersonas, ["owners"]);
  assert.deepEqual(buildResult.state.audience.operatorPersonas, ["managers"]);
  assert.notEqual(guidance.questionKey, "buyer_or_operator_persona");
  assert.match(guidance.question ?? "", /multi-location|POS|report/i);
});

test("duplicate question prevention skips a previously asked audience question unless the slot is conflicted", () => {
  const buildResult = buildConversationSessionState({
    messages: [
      buildUserMessage("u1", "I want to build a crypto analytics website."),
      buildUserMessage("u2", "Crypto investors are my main customer.")
    ]
  });
  const askedState = recordConversationQuestionAsked({
    state: buildResult.state,
    questionKey: "buyer_or_operator_persona",
    askedTurnId: "a1"
  });
  const guidance = buildConversationTurnGuidance({
    state: askedState,
    updatedSlotPaths: []
  });

  assert.notEqual(guidance.questionKey, "buyer_or_operator_persona");
  assert.equal(
    askedState.questionHistory.some(
      (entry) =>
        entry.questionKey === "buyer_or_operator_persona" && entry.status === "asked"
    ),
    true
  );
});

test("null-style constraint answers count as real answers and advance the next planning question", () => {
  const base = buildConversationSessionState({
    messages: [
      buildUserMessage("u1", "Hi, my name is Tom."),
      buildUserMessage(
        "u2",
        "I want to build a crypto analytics website with a risk engine for pre-sales."
      ),
      buildUserMessage("u3", "Crypto investors are my main customer.")
    ]
  });
  const askedState = recordConversationQuestionAsked({
    state: base.state,
    questionKey: "constraints_and_compliance",
    askedTurnId: "assistant-constraints"
  });
  const answered = buildConversationSessionState({
    previousState: askedState,
    messages: [buildUserMessage("u4", "no constraint")]
  });
  const guidance = buildConversationTurnGuidance({
    state: answered.state,
    updatedSlotPaths: answered.updatedSlotPaths
  });

  assert.ok(
    answered.state.constraintsAndCompliance.includes(
      "No material constraints identified right now"
    )
  );
  assert.ok(
    answered.updatedSlotPaths.includes("constraints.constraintsAndCompliance")
  );
  assert.equal(
    answered.state.questionHistory.some(
      (entry) =>
        entry.questionKey === "constraints_and_compliance" && entry.status === "answered"
    ),
    true
  );
  assert.notEqual(guidance.questionKey, "constraints_and_compliance");
  assert.match(guidance.leadIn ?? "", /current launch constraints/i);
});

test("the planner returns exactly one next question at a time", () => {
  const buildResult = buildConversationSessionState({
    messages: [buildUserMessage("u1", "Hi, my name is Tom.")]
  });
  const guidance = buildConversationTurnGuidance({
    state: buildResult.state,
    updatedSlotPaths: buildResult.updatedSlotPaths
  });

  assert.equal(typeof guidance.question, "string");
  assert.equal((guidance.question.match(/\?/g) ?? []).length, 1);
  assert.equal(DEFAULT_CONVERSATION_POLICY.questionPlanner.askOneQuestionAtATime, true);
});

test("runtime intake files consume the shared conversation intelligence layer", () => {
  const planningChatSource = readFileSync(
    new URL("../lib/start/planning-chat.ts", import.meta.url),
    "utf8"
  );
  const entryFlowSource = readFileSync(
    new URL("../components/onboarding/canonical-entry-flow.tsx", import.meta.url),
    "utf8"
  );
  const startChatRouteSource = readFileSync(
    new URL("../app/api/start/chat/route.ts", import.meta.url),
    "utf8"
  );

  assert.match(planningChatSource, /buildConversationSessionState/);
  assert.match(planningChatSource, /buildConversationTurnGuidance/);
  assert.match(planningChatSource, /recordConversationQuestionAsked/);
  assert.match(entryFlowSource, /conversationState/);
  assert.match(startChatRouteSource, /conversationSessionStateSchema/);
  assert.doesNotMatch(planningChatSource, /first intentional user/i);
});
