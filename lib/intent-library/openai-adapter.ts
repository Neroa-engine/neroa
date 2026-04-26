import {
  buildOpenAITextInput,
  createOpenAIClient,
  sanitizeOpenAIResponseRequest
} from "../ai/providers/openai-request.ts";
import {
  structuredAnswerExtractionResultSchema,
  type StructuredAnswerExtractionResult,
  type StructuredExtractionRequest
} from "./types.ts";
import type { ModelProviderAdapter } from "./provider-adapter.ts";

const OPENAI_EXTRACTION_RESPONSE_SCHEMA_DESCRIPTION = `Return strict JSON with:
{
  "status": "parsed" | "partial" | "needs_clarification" | "invalid" | "failed",
  "confidence": number between 0 and 1,
  "normalizedAnswer": object or null,
  "structuredPatch": StrategyRevisionPatch-compatible object or null,
  "clarificationPrompt": string or null,
  "notes": string[]
}
Only write to the allowed targets. If confidence is low, prefer needs_clarification over guessing.`;

export class OpenAIBlockerExtractionAdapter implements ModelProviderAdapter {
  providerId = "openai";
  modelId: string;
  mode = "live" as const;

  constructor(args?: { modelId?: string }) {
    this.modelId = args?.modelId ?? "gpt-5.4";
  }

  async extractStructuredAnswer(
    request: StructuredExtractionRequest
  ): Promise<StructuredAnswerExtractionResult> {
    const client = createOpenAIClient();
    const response = await client.responses.create(
      sanitizeOpenAIResponseRequest({
        model: this.modelId,
        input: buildOpenAITextInput({
          systemPrompt: [
            "You are a blocker-specific extractor for Neroa Strategy Room.",
            "Do not choose your own blocker or write target.",
            "Use only the blocker definition, schema, and allowed write targets provided.",
            OPENAI_EXTRACTION_RESPONSE_SCHEMA_DESCRIPTION
          ].join("\n"),
          message: request.rawAnswer,
          context: {
            blocker: request.blocker,
            blockerState: request.blockerState,
            schema: request.schema,
            normalizedAnswerPreview: request.normalizedAnswerPreview,
            allowedWriteTargets: request.allowedWriteTargets,
            blockedWriteTargets: request.blockedWriteTargets,
            knownProjectSignals: request.knownProjectSignals
          },
          closingInstruction: "Return JSON only."
        }),
        max_output_tokens: 500
      })
    );
    const rawText = response.output_text?.trim() ?? "";

    if (!rawText) {
      throw new Error("OpenAI extraction adapter returned no content.");
    }

    const parsed = JSON.parse(rawText);
    return structuredAnswerExtractionResultSchema.parse({
      blockerId: request.blocker.id,
      rawAnswer: request.rawAnswer,
      normalizedAnswer: parsed.normalizedAnswer ?? null,
      structuredPatch: parsed.structuredPatch ?? null,
      confidence:
        typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0,
      status: parsed.status ?? "failed",
      clarificationPrompt:
        typeof parsed.clarificationPrompt === "string" && parsed.clarificationPrompt.trim()
          ? parsed.clarificationPrompt.trim()
          : null,
      writeTargets: request.allowedWriteTargets,
      blockedWriteTargets: request.blockedWriteTargets,
      notes: Array.isArray(parsed.notes) ? parsed.notes.filter((item: unknown) => typeof item === "string") : [],
      providerMetadata: {
        providerId: this.providerId,
        modelId: this.modelId,
        mode: this.mode,
        traceId: response.id ?? null,
        adapterNotes: ["Parsed from OpenAI Responses API JSON output."]
      }
    });
  }
}

export function createOpenAIBlockerExtractionAdapter(args?: { modelId?: string }) {
  return new OpenAIBlockerExtractionAdapter(args);
}
