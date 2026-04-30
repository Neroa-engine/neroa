import {
  customerIntentEnvelopeSchema,
  type CommandCenterLane,
  type CustomerIntentEnvelope,
  type CustomerIntentType
} from "./schemas.ts";

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function includesAny(text: string, patterns: readonly RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function resolveIntentType(text: string): {
  intentType: CustomerIntentType;
  lane: CommandCenterLane;
  signals: string[];
} {
  const loweredText = text.toLowerCase();

  if (
    includesAny(loweredText, [
      /\bapprove\b/,
      /\bdecision\b/,
      /\bchoose\b/,
      /\bhold\b/,
      /\bblock\b/,
      /\bdefer\b/,
      /\bgo ahead\b/
    ])
  ) {
    return {
      intentType: "decision",
      lane: "decisions",
      signals: ["decision"]
    };
  }

  if (
    includesAny(loweredText, [
      /\broadmap\b/,
      /\bphase\b/,
      /\bmilestone\b/,
      /\bsequence\b/,
      /\btimeline\b/,
      /\bplan update\b/
    ])
  ) {
    return {
      intentType: "roadmap_update",
      lane: "roadmap_updates",
      signals: ["roadmap"]
    };
  }

  if (
    includesAny(loweredText, [
      /\breview\b/,
      /\bqa\b/,
      /\bverify\b/,
      /\bcheck\b/,
      /\bacceptance\b/,
      /\btest\b/
    ])
  ) {
    return {
      intentType: "execution_review",
      lane: "execution_review",
      signals: ["review"]
    };
  }

  if (
    includesAny(loweredText, [
      /\brevise\b/,
      /\brevision\b/,
      /\bchange\b/,
      /\badjust\b/,
      /\bupdate\b/,
      /\bedit\b/
    ])
  ) {
    return {
      intentType: "revision",
      lane: "revisions",
      signals: ["revision"]
    };
  }

  return {
    intentType: "new_request",
    lane: "requests",
    signals: ["request"]
  };
}

export function classifyCustomerIntent(args: {
  text: string;
  messageId?: string | null;
  source?: CustomerIntentEnvelope["source"];
  originalPayload?: Record<string, unknown> | null;
}): CustomerIntentEnvelope {
  const normalizedText = normalizeText(args.text);
  const result = resolveIntentType(normalizedText);

  return customerIntentEnvelopeSchema.parse({
    messageId: args.messageId ?? null,
    source: args.source ?? "command_center",
    rawText: normalizedText,
    normalizedText: normalizedText.toLowerCase(),
    intentType: result.intentType,
    lane: result.lane,
    signals: result.signals,
    originalPayload: args.originalPayload ?? null
  });
}
