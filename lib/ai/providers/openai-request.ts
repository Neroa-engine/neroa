import OpenAI from "openai";
import type {
  ResponseCreateParamsNonStreaming,
  Tool,
} from "openai/resources/responses/responses";

type SupportedOpenAIResponseRequest = {
  model: ResponseCreateParamsNonStreaming["model"];
  input: ResponseCreateParamsNonStreaming["input"];
  tools?: Tool[];
  temperature?: ResponseCreateParamsNonStreaming["temperature"];
  max_output_tokens?: ResponseCreateParamsNonStreaming["max_output_tokens"];
};

type BuildOpenAITextInputArgs = {
  systemPrompt: string;
  message: string;
  context?: unknown;
  closingInstruction?: string;
};

function normalizeOptionalText(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (value == null) {
    return null;
  }

  return String(value);
}

export function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  return new OpenAI({ apiKey });
}

export function buildOpenAITextInput({
  systemPrompt,
  message,
  context,
  closingInstruction,
}: BuildOpenAITextInputArgs) {
  const parts = [
    normalizeOptionalText(systemPrompt),
    `User: ${message.trim()}`,
    context == null ? null : `Context:\n${normalizeOptionalText(context) ?? ""}`,
    normalizeOptionalText(closingInstruction),
  ].filter((part): part is string => Boolean(part));

  return parts.join("\n\n");
}

export function sanitizeOpenAIResponseRequest(
  request: SupportedOpenAIResponseRequest
): SupportedOpenAIResponseRequest {
  const sanitized: SupportedOpenAIResponseRequest = {
    model: request.model,
    input: request.input,
  };

  if (Array.isArray(request.tools) && request.tools.length > 0) {
    sanitized.tools = request.tools;
  }

  if (typeof request.temperature === "number") {
    sanitized.temperature = request.temperature;
  }

  if (typeof request.max_output_tokens === "number") {
    sanitized.max_output_tokens = request.max_output_tokens;
  }

  return sanitized;
}
