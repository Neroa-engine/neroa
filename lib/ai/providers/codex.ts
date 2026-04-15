import {
  buildOpenAITextInput,
  createOpenAIClient,
  sanitizeOpenAIResponseRequest,
} from "./openai-request";

type RunCodexInput = {
  systemPrompt: string;
  message: string;
  context?: string;
};

const DEFAULT_CODEX_MODEL = "gpt-5.4-mini";
const FALLBACK_CODEX_MODEL = "gpt-5.4";

function getPreferredCodexModel() {
  const configuredModel = process.env.OPENAI_CODEX_MODEL?.trim();
  return configuredModel && configuredModel.length > 0 ? configuredModel : DEFAULT_CODEX_MODEL;
}

function shouldFallbackCodexModel(error: unknown) {
  return (
    error instanceof Error &&
    /does not exist|not available|unsupported/i.test(error.message)
  );
}

export async function runCodex({ systemPrompt, message, context }: RunCodexInput) {
  const client = createOpenAIClient();
  const input = buildOpenAITextInput({
    systemPrompt,
    message,
    context,
  });

  const preferredModel = getPreferredCodexModel();

  async function requestWithModel(model: string) {
    return client.responses.create(
      sanitizeOpenAIResponseRequest({
        model,
        input,
      })
    );
  }

  let response;

  try {
    response = await requestWithModel(preferredModel);
  } catch (error) {
    if (!shouldFallbackCodexModel(error) || preferredModel === FALLBACK_CODEX_MODEL) {
      throw error;
    }

    response = await requestWithModel(FALLBACK_CODEX_MODEL);
  }

  const text = response.output_text?.trim();

  if (!text) {
    const error = new Error("Codex returned an empty response.") as Error & { status?: number };
    error.status = 502;
    throw error;
  }

  return text;
}
