import {
  structuredAnswerExtractionResultSchema,
  structuredAnswerProviderMetadataSchema,
  type StructuredAnswerExtractionResult,
  type StructuredExtractionRequest
} from "./types.ts";

export type ModelProviderAdapter = {
  providerId: string;
  modelId: string;
  mode: "mock" | "live" | "deterministic";
  extractStructuredAnswer(
    request: StructuredExtractionRequest
  ): Promise<StructuredAnswerExtractionResult>;
};

export class MockBlockerExtractionAdapter implements ModelProviderAdapter {
  providerId = "mock";
  modelId = "mock-blocker-extractor";
  mode = "mock" as const;
  private readonly responder?:
    | ((
        request: StructuredExtractionRequest
      ) => StructuredAnswerExtractionResult | Promise<StructuredAnswerExtractionResult>)
    | undefined;

  constructor(
    responder?: (
      request: StructuredExtractionRequest
    ) => StructuredAnswerExtractionResult | Promise<StructuredAnswerExtractionResult>
  ) {
    this.responder = responder;
  }

  async extractStructuredAnswer(request: StructuredExtractionRequest) {
    if (!this.responder) {
      return structuredAnswerExtractionResultSchema.parse({
        blockerId: request.blocker.id,
        rawAnswer: request.rawAnswer,
        normalizedAnswer: request.normalizedAnswerPreview,
        structuredPatch: null,
        confidence: 0,
        status: "failed",
        clarificationPrompt: request.blocker.defaultClarificationPrompt,
        writeTargets: [],
        blockedWriteTargets: request.blockedWriteTargets,
        notes: ["Mock adapter had no responder configured."],
        providerMetadata: structuredAnswerProviderMetadataSchema.parse({
          providerId: this.providerId,
          modelId: this.modelId,
          mode: this.mode,
          traceId: null,
          adapterNotes: ["No mock response handler was provided."]
        })
      });
    }

    return structuredAnswerExtractionResultSchema.parse(await this.responder(request));
  }
}

export function createDeterministicProviderMetadata(args: {
  providerId?: string;
  modelId?: string;
  notes?: readonly string[];
}) {
  return structuredAnswerProviderMetadataSchema.parse({
    providerId: args.providerId ?? "deterministic",
    modelId: args.modelId ?? "intent-library-normalizer",
    mode: "deterministic",
    traceId: null,
    adapterNotes: [...(args.notes ?? [])]
  });
}
