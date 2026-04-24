import { type ExtractionSourceReference } from "@/lib/intelligence/extraction";
import type {
  ArtifactSourceMapping,
  ConversationArtifact,
  ConversationArtifactRole
} from "./types";

export function nowIso() {
  return new Date().toISOString();
}

export function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeText(value: string) {
  return cleanText(value).toLowerCase().replace(/\s+/g, " ");
}

export function clampUnitInterval(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function dedupe<T>(values: readonly T[]) {
  return [...new Set(values)];
}

export function mergeUnique<T>(...groups: Array<readonly T[]>) {
  return dedupe(groups.flatMap((group) => [...group]));
}

export function sanitizeSeed(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function createAdapterRecordId(prefix: string, seed: string) {
  const normalized = sanitizeSeed(seed);
  return normalized ? `${prefix}-${normalized}` : `${prefix}-${stableHash(seed || prefix)}`;
}

export function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

export function buildArtifactDuplicateKey(artifact: ConversationArtifact) {
  const key = [
    artifact.threadId,
    artifact.sourceSurface,
    artifact.role,
    cleanText(artifact.createdAt),
    normalizeText(artifact.rawContent)
  ].join("|");

  return `artifact-${stableHash(key)}`;
}

export function splitIntoSegments(value: string) {
  return value
    .split(/\n+|(?<=[.!?])\s+/)
    .map((segment) => cleanText(segment))
    .filter(Boolean);
}

export function splitListLikeText(value: string) {
  return dedupe(
    value
      .split(/,|\/|;|\band\b|\bor\b|\n+/i)
      .map((part) => cleanText(part))
      .filter((part) => part.length > 0)
  );
}

export function summarizeText(value: string, maxLength = 180) {
  const cleanValue = cleanText(value);

  if (cleanValue.length <= maxLength) {
    return cleanValue;
  }

  return `${cleanValue.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

export function hasQuestionMark(value: string) {
  return cleanText(value).includes("?");
}

export function mapExternalRoleToArtifactRole(value: string): ConversationArtifactRole {
  switch (value) {
    case "user":
      return "user";
    case "assistant":
    case "narua":
      return "assistant";
    case "system":
      return "system";
    default:
      return "planner_note";
  }
}

export function buildSourceMapping(
  artifact: ConversationArtifact,
  preparedBy?: string
): ArtifactSourceMapping {
  const sourceId = createAdapterRecordId(
    "artifact-source",
    `${artifact.artifactId}-${artifact.threadId}-${artifact.sourceSurface}-${artifact.kind}`
  );
  const sourceKind: ExtractionSourceReference["kind"] =
    artifact.kind === "thread_snapshot"
      ? "artifact"
      : artifact.kind === "planning_note" || artifact.role === "system"
      ? "system"
      : "message";
  const source = {
    id: sourceId,
    date: artifact.createdAt,
    preparedBy,
    sourceId,
    kind: sourceKind,
    label: `${artifact.sourceSurface}:${artifact.role}`,
    excerpt: summarizeText(artifact.rawContent, 220),
    messageId: artifact.artifactId,
    threadId: artifact.threadId
  } satisfies ExtractionSourceReference;

  return {
    sourceId,
    source
  };
}

export function createTextValue(summary: string, detail?: string, rawValue?: string) {
  return {
    kind: "text" as const,
    summary: summarizeText(summary, 220),
    detail: detail ? summarizeText(detail, 400) : undefined,
    rawValue: rawValue ? summarizeText(rawValue, 400) : undefined
  };
}

export function createListValue(items: string[], fallbackSummary?: string) {
  const deduped = dedupe(
    items.map((item) => cleanText(item)).filter((item) => item.length > 0)
  );

  return {
    kind: "list" as const,
    summary:
      deduped.length > 0
        ? summarizeText(deduped.join(", "), 220)
        : summarizeText(fallbackSummary ?? "", 220),
    items: deduped,
    rawValue: deduped
  };
}

export function sameTextValue(left?: string | null, right?: string | null) {
  return normalizeText(left ?? "") === normalizeText(right ?? "");
}

export function sameListValue(left: readonly string[], right: readonly string[]) {
  const leftNormalized = dedupe(left.map((item) => normalizeText(item)).filter(Boolean));
  const rightNormalized = dedupe(right.map((item) => normalizeText(item)).filter(Boolean));

  if (leftNormalized.length !== rightNormalized.length) {
    return false;
  }

  return leftNormalized.every((value, index) => value === rightNormalized[index]);
}
