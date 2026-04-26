import test from "node:test";
import assert from "node:assert/strict";
import {
  buildBlockerQuestionState,
  extractStructuredAnswerForBlocker,
  getBlockerDefinition,
  getSeedBlockerEvalCases
} from "../lib/intent-library/index.ts";

function createBlockerState(blockerId, inputId = null) {
  const definition = getBlockerDefinition(blockerId);

  return buildBlockerQuestionState({
    blockerId,
    inputId: inputId ?? definition.activeWhen.inputIds[0] ?? definition.activeWhen.slotIds[0],
    slotId: definition.activeWhen.slotIds[0] ?? null,
    label: definition.label,
    question: definition.questionText,
    source: "project_brief",
    currentValue: null
  });
}

function expectSubset(actual, expected) {
  if (expected == null) {
    return;
  }

  if (Array.isArray(expected)) {
    assert.equal(Array.isArray(actual), true);
    assert.ok(actual.length >= expected.length);

    for (let index = 0; index < expected.length; index += 1) {
      expectSubset(actual[index], expected[index]);
    }

    return;
  }

  if (typeof expected === "object") {
    assert.equal(typeof actual, "object");
    assert.notEqual(actual, null);

    for (const [key, value] of Object.entries(expected)) {
      expectSubset(actual[key], value);
    }

    return;
  }

  assert.equal(actual, expected);
}

for (const evalCase of getSeedBlockerEvalCases()) {
  test(`intent eval: ${evalCase.id}`, async () => {
    const result = await extractStructuredAnswerForBlocker({
      blockerState: createBlockerState(evalCase.blockerId),
      rawAnswer: evalCase.rawAnswer
    });

    assert.equal(result.status, evalCase.expectedStatus);
    expectSubset(result.normalizedAnswer, evalCase.expectedNormalizedSubset);
    expectSubset(result.structuredPatch, evalCase.expectedPatch);

    for (const target of evalCase.expectedWriteTargets) {
      assert.equal(result.writeTargets.includes(target), true);
    }

    for (const target of evalCase.forbiddenWriteTargets) {
      assert.equal(result.writeTargets.includes(target), false);
    }

    if (evalCase.expectedClarificationPattern) {
      assert.match(
        result.clarificationPrompt ?? "",
        new RegExp(evalCase.expectedClarificationPattern, "i")
      );
    }

    if (evalCase.expectedSecondaryHintBlockerIds) {
      assert.deepEqual(
        result.secondaryHints.map((item) => item.blockerId),
        evalCase.expectedSecondaryHintBlockerIds
      );
    }
  });
}
