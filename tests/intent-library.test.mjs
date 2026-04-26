import test from "node:test";
import assert from "node:assert/strict";
import {
  MockBlockerExtractionAdapter,
  buildBlockerQuestionState,
  createOpenAIBlockerExtractionAdapter,
  extractStructuredAnswerForBlocker,
  getBlockerDefinition,
  getBlockerSchemaDefinition
} from "../lib/intent-library/index.ts";

function createBlockerState(blockerId, inputId, question = null) {
  const definition = getBlockerDefinition(blockerId);

  return buildBlockerQuestionState({
    blockerId,
    inputId,
    slotId: inputId,
    label: definition?.label ?? blockerId,
    question: question ?? definition?.questionText ?? blockerId,
    source: "project_brief",
    currentValue: null
  });
}

test("constraint regression keeps writes inside the constraints family", async () => {
  const result = await extractStructuredAnswerForBlocker({
    blockerState: createBlockerState("constraints", "constraints"),
    rawAnswer: "no constraint"
  });

  assert.equal(result.status, "parsed");
  assert.deepEqual(result.writeTargets, ["projectBrief.constraints"]);
  assert.equal(result.blockedWriteTargets.includes("projectBrief.founderName"), false);
  assert.deepEqual(result.structuredPatch?.projectBrief?.constraints, [
    "No material constraints identified right now"
  ]);
  assert.equal(result.structuredPatch?.projectBrief?.founderName, undefined);
});

test("integration regression normalizes CoinMarketCap without unrelated slot mutation", async () => {
  const result = await extractStructuredAnswerForBlocker({
    blockerState: createBlockerState("integrations", "integrations"),
    rawAnswer: "CoinMarketCap"
  });

  assert.equal(result.status, "parsed");
  assert.equal(result.normalizedAnswer?.providers?.[0]?.canonicalId, "coinmarketcap_api");
  assert.deepEqual(result.writeTargets, ["projectBrief.integrations"]);
  assert.equal(result.structuredPatch?.projectBrief?.integrations?.includes("CoinMarketCap API"), true);
  assert.equal(result.structuredPatch?.projectBrief?.founderName, undefined);
});

test("OpenAI integration normalization maps ChatGPT and OpenAI answers to OpenAI API plus GPT-5.4 Thinking", async () => {
  const integrationsResult = await extractStructuredAnswerForBlocker({
    blockerState: createBlockerState("integrations", "integrations"),
    rawAnswer: "OpenAI API"
  });
  const aiBoundaryResult = await extractStructuredAnswerForBlocker({
    blockerState: createBlockerState("ai_integration_boundary", "integrations"),
    rawAnswer: "ChatGPT 5.4"
  });

  assert.equal(integrationsResult.normalizedAnswer?.providers?.[0]?.canonicalId, "openai_api");
  assert.equal(integrationsResult.normalizedAnswer?.providers?.[0]?.modelId, "gpt-5.4-thinking");
  assert.equal(aiBoundaryResult.normalizedAnswer?.provider?.canonicalId, "openai_api");
  assert.equal(aiBoundaryResult.normalizedAnswer?.provider?.modelId, "gpt-5.4-thinking");
  assert.equal(aiBoundaryResult.structuredPatch?.projectBrief?.integrations?.[0], "OpenAI API");
});

test("wallet boundary regression accepts not in MVP and keeps the answer in the wallet family", async () => {
  const result = await extractStructuredAnswerForBlocker({
    blockerState: createBlockerState("wallet_boundary", "walletConnectionMvp"),
    rawAnswer: "not in MVP"
  });

  assert.equal(result.status, "parsed");
  assert.equal(result.normalizedAnswer?.boundary, "excluded_from_mvp");
  assert.deepEqual(result.writeTargets, ["answeredInputs.walletConnectionMvp"]);
  assert.equal(
    result.structuredPatch?.answeredInputs?.some(
      (item) => item.inputId === "walletConnectionMvp" && /not in mvp/i.test(item.value)
    ),
    true
  );
});

test("known founder protection blocks unrelated blockers from overwriting founderName", async () => {
  const result = await extractStructuredAnswerForBlocker({
    blockerState: createBlockerState("constraints", "constraints"),
    rawAnswer: "no constraint",
    projectBrief: {
      founderName: "Tom"
    }
  });

  assert.equal(result.structuredPatch?.projectBrief?.founderName, undefined);
  assert.equal(result.writeTargets.includes("projectBrief.founderName"), false);
});

test("ambiguous but non-empty answers return clarification instead of silent failure", async () => {
  const result = await extractStructuredAnswerForBlocker({
    blockerState: createBlockerState("first_pos_connector", "firstPosConnector"),
    rawAnswer: "maybe later"
  });

  assert.equal(result.status, "needs_clarification");
  assert.match(result.clarificationPrompt ?? "", /which POS connector/i);
  assert.equal(result.structuredPatch, null);
});

test("provider abstraction keeps mock and OpenAI adapters on the same contract", async () => {
  const mock = new MockBlockerExtractionAdapter((request) => ({
    blockerId: request.blocker.id,
    rawAnswer: request.rawAnswer,
    normalizedAnswer: {
      provider: "mock"
    },
    structuredPatch: null,
    confidence: 0.5,
    status: "needs_clarification",
    clarificationPrompt: request.blocker.defaultClarificationPrompt,
    writeTargets: [],
    blockedWriteTargets: request.blockedWriteTargets,
    notes: ["mock"],
    providerMetadata: {
      providerId: "mock",
      modelId: "mock-blocker-extractor",
      mode: "mock",
      traceId: null,
      adapterNotes: ["mock"]
    }
  }));
  const openai = createOpenAIBlockerExtractionAdapter();
  const definition = getBlockerDefinition("integrations");
  const schema = getBlockerSchemaDefinition(definition.schemaId);
  const request = {
    blocker: definition,
    blockerState: createBlockerState("integrations", "integrations"),
    schema,
    rawAnswer: "CoinMarketCap",
    normalizedAnswerPreview: null,
    allowedWriteTargets: definition.allowedWriteTargets,
    blockedWriteTargets: definition.disallowedSlotTargets,
    knownProjectSignals: []
  };
  const result = await mock.extractStructuredAnswer(request);

  assert.equal(typeof mock.extractStructuredAnswer, "function");
  assert.equal(typeof openai.extractStructuredAnswer, "function");
  assert.equal(mock.providerId, "mock");
  assert.equal(openai.providerId, "openai");
  assert.equal(result.status, "needs_clarification");
});
