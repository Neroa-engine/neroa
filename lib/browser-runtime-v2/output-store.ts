import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  buildLiveViewQcPageAssociation,
  type LiveViewQcPageAssociationInput
} from "@/lib/live-view/qc-library-bridge";
import type {
  BrowserRuntimeV2OutputKind,
  BrowserRuntimeV2OutputSummary
} from "@/lib/browser-runtime-v2/contracts";
import type { BrowserRuntimeV2RuntimeTarget } from "@/lib/browser-runtime-v2/runtime-target";

const browserRuntimeLibraryRoot = path.join(
  process.cwd(),
  ".neroa-project-library",
  "browser-runtime-v2"
);

export const browserRuntimeV2OutputKindValues = [
  "inspection_result",
  "recording_result",
  "ai_walkthrough_result",
  "sop_result"
] as const;

export const browserRuntimeV2OutputLifecycleValues = [
  "draft",
  "ready",
  "failed",
  "archived"
] as const;

const browserRuntimeV2RuntimeTargetSchema = z.object({
  id: z.string().trim().min(1),
  environment: z.enum(["local", "preview", "production", "staging"]),
  provider: z.enum(["local", "netlify", "custom"]),
  origin: z.string().url(),
  host: z.string().trim().min(1),
  label: z.string().trim().min(1),
  siteOrigin: z.string().url().nullable().optional().default(null),
  allowedOrigins: z.array(z.string().url()).optional().default([]),
  isEphemeral: z.boolean().optional().default(false)
});

export type BrowserRuntimeV2OutputLifecycle =
  (typeof browserRuntimeV2OutputLifecycleValues)[number];

export const browserRuntimeV2OutputWriteSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(browserRuntimeV2OutputKindValues),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  lifecycle: z.enum(browserRuntimeV2OutputLifecycleValues).optional().default("ready"),
  outcome: z.enum(["pass", "warning", "fail"]).nullable().optional().default(null),
  page: z
    .object({
      url: z.string().url(),
      pathname: z.string().nullable().optional(),
      title: z.string().nullable().optional(),
      pageLabel: z.string().nullable().optional(),
      routeKey: z.string().nullable().optional()
    })
    .nullable()
    .optional()
    .default(null),
  sourceSessionId: z.string().uuid().nullable().optional().default(null),
  relatedSessionId: z.string().uuid().nullable().optional().default(null),
  createdByUserId: z.string().trim().min(1).nullable().optional().default(null),
  createdByEmail: z.string().email().nullable().optional().default(null),
  statusReason: z.string().trim().min(1).nullable().optional().default(null),
  runtimeTarget: browserRuntimeV2RuntimeTargetSchema.nullable().optional().default(null),
  data: z.record(z.string(), z.unknown()).optional().default({}),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  generatedAt: z.string().datetime().optional()
});

export type BrowserRuntimeV2ProjectOutput = {
  id: string;
  workspaceId: string;
  projectId: string;
  kind: BrowserRuntimeV2OutputKind;
  title: string;
  summary: string;
  lifecycle: BrowserRuntimeV2OutputLifecycle;
  outcome: "pass" | "warning" | "fail" | null;
  page: LiveViewQcPageAssociationInput | null;
  sourceSessionId: string | null;
  relatedSessionId: string | null;
  createdByUserId: string | null;
  createdByEmail: string | null;
  statusReason: string | null;
  runtimeTarget: BrowserRuntimeV2RuntimeTarget | null;
  data: Record<string, unknown>;
  tags: string[];
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
};

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function outputDirectory(workspaceId: string, projectId: string) {
  return path.join(
    browserRuntimeLibraryRoot,
    sanitizeSegment(workspaceId),
    sanitizeSegment(projectId),
    "outputs"
  );
}

function outputFilePath(workspaceId: string, projectId: string, outputId: string) {
  return path.join(outputDirectory(workspaceId, projectId), `${outputId}.json`);
}

async function ensureOutputDirectory(workspaceId: string, projectId: string) {
  await mkdir(outputDirectory(workspaceId, projectId), { recursive: true });
}

function normalizeOutput(args: {
  workspaceId: string;
  projectId: string;
  input: z.input<typeof browserRuntimeV2OutputWriteSchema>;
}): BrowserRuntimeV2ProjectOutput {
  const parsed = browserRuntimeV2OutputWriteSchema.parse(args.input);
  const now = new Date().toISOString();
  const createdAt = parsed.generatedAt ?? now;

  return {
    id: parsed.id ?? randomUUID(),
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    kind: parsed.kind,
    title: parsed.title,
    summary: parsed.summary,
    lifecycle: parsed.lifecycle,
    outcome: parsed.outcome,
    page: parsed.page ? buildLiveViewQcPageAssociation(parsed.page) : null,
    sourceSessionId: parsed.sourceSessionId,
    relatedSessionId: parsed.relatedSessionId,
    createdByUserId: parsed.createdByUserId,
    createdByEmail: parsed.createdByEmail,
    statusReason: parsed.statusReason,
    runtimeTarget: parsed.runtimeTarget ?? null,
    data: parsed.data,
    tags: parsed.tags,
    generatedAt: parsed.generatedAt ?? now,
    createdAt,
    updatedAt: now
  };
}

export async function writeBrowserRuntimeV2Output(args: {
  workspaceId: string;
  projectId: string;
  input: z.input<typeof browserRuntimeV2OutputWriteSchema>;
}) {
  const output = normalizeOutput(args);

  await ensureOutputDirectory(args.workspaceId, args.projectId);
  await writeFile(
    outputFilePath(args.workspaceId, args.projectId, output.id),
    `${JSON.stringify(output, null, 2)}\n`,
    "utf8"
  );

  return {
    output,
    summary: mapBrowserRuntimeV2OutputSummary(output)
  };
}

export async function listBrowserRuntimeV2Outputs(args: {
  workspaceId: string;
  projectId: string;
}) {
  const dir = outputDirectory(args.workspaceId, args.projectId);

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const outputs = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map(async (entry) => {
          const raw = await readFile(path.join(dir, entry.name), "utf8");
          return JSON.parse(raw) as BrowserRuntimeV2ProjectOutput;
        })
    );

    return outputs.sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
  } catch {
    return [];
  }
}

export function mapBrowserRuntimeV2OutputSummary(
  output: BrowserRuntimeV2ProjectOutput
): BrowserRuntimeV2OutputSummary {
  return {
    id: output.id,
    kind: output.kind,
    title: output.title,
    summary: output.summary,
    createdAt: output.generatedAt,
    pageUrl: output.page?.url ?? null,
    runtimeTargetLabel: output.runtimeTarget?.label ?? null,
    runtimeTargetOrigin: output.runtimeTarget?.origin ?? null
  };
}
