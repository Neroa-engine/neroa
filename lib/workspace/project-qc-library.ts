import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { buildProjectRoomRoute } from "@/lib/portal/routes";
import type { ServerSupabaseClient } from "@/lib/platform/foundation";
import {
  buildStoredProjectMetadata,
  encodeWorkspaceProjectDescription,
  parseWorkspaceProjectDescription,
  type StoredProjectAsset,
  type StoredProjectMetadata
} from "@/lib/workspace/project-metadata";

const projectLibraryRoot = path.join(process.cwd(), ".neroa-project-library");
const projectQcLibraryRoot = path.join(projectLibraryRoot, "qc");

export const projectQcReportOutcomeValues = ["pass", "warning", "fail"] as const;
export const projectQcReportLifecycleValues = [
  "queued",
  "running",
  "draft",
  "ready",
  "failed",
  "superseded",
  "archived"
] as const;
export const projectQcRecordingLifecycleValues = [
  "queued",
  "capturing",
  "pending_upload",
  "processing",
  "ready",
  "failed",
  "archived"
] as const;
export const projectQcSourceValues = [
  "browser_runtime",
  "workspace_api",
  "naroa_review"
] as const;
export const projectQcFindingSeverityValues = ["critical", "warning", "info"] as const;
export const projectQcFindingStatusValues = [
  "open",
  "resolved",
  "accepted",
  "ignored"
] as const;

export type ProjectQcReportOutcome = (typeof projectQcReportOutcomeValues)[number];
export type ProjectQcReportLifecycle = (typeof projectQcReportLifecycleValues)[number];
export type ProjectQcRecordingLifecycle = (typeof projectQcRecordingLifecycleValues)[number];
export type ProjectQcSource = (typeof projectQcSourceValues)[number];
export type ProjectQcFindingSeverity = (typeof projectQcFindingSeverityValues)[number];
export type ProjectQcFindingStatus = (typeof projectQcFindingStatusValues)[number];

export const projectQcPageAssociationSchema = z.object({
  url: z.string().url(),
  pathname: z.string().trim().min(1).nullable().optional().default(null),
  title: z.string().trim().min(1).nullable().optional().default(null),
  pageLabel: z.string().trim().min(1).nullable().optional().default(null),
  routeKey: z.string().trim().min(1).nullable().optional().default(null)
});

export const projectQcFindingInputSchema = z.object({
  id: z.string().uuid().optional(),
  severity: z.enum(projectQcFindingSeverityValues),
  category: z.string().trim().min(1),
  status: z.enum(projectQcFindingStatusValues).optional().default("open"),
  title: z.string().trim().min(1),
  detail: z.string().trim().min(1),
  recommendation: z.string().trim().min(1).nullable().optional().default(null)
});

export const projectQcGuardrailInputSchema = z.object({
  id: z.string().uuid().optional(),
  severity: z.enum(projectQcFindingSeverityValues),
  title: z.string().trim().min(1),
  detail: z.string().trim().min(1),
  recommendation: z.string().trim().min(1).nullable().optional().default(null)
});

export const projectQcReportWriteSchema = z.object({
  id: z.string().uuid().optional(),
  lifecycle: z.enum(projectQcReportLifecycleValues).optional().default("ready"),
  outcome: z.enum(projectQcReportOutcomeValues).nullable().optional().default(null),
  summary: z.string().trim().min(1),
  internalSummary: z.string().trim().min(1).nullable().optional().default(null),
  customerSummary: z.string().trim().min(1).nullable().optional().default(null),
  page: projectQcPageAssociationSchema,
  findings: z.array(projectQcFindingInputSchema).optional().default([]),
  findingsCount: z.number().int().nonnegative().nullable().optional().default(null),
  warningsCount: z.number().int().nonnegative().nullable().optional().default(null),
  errorsCount: z.number().int().nonnegative().nullable().optional().default(null),
  guardrailsCount: z.number().int().nonnegative().nullable().optional().default(null),
  guardrails: z.array(projectQcGuardrailInputSchema).optional().default([]),
  linkedRecordingId: z.string().uuid().nullable().optional().default(null),
  source: z.enum(projectQcSourceValues).optional().default("workspace_api"),
  sourceSessionId: z.string().uuid().nullable().optional().default(null),
  relatedSessionId: z.string().uuid().nullable().optional().default(null),
  createdByUserId: z.string().trim().min(1).nullable().optional().default(null),
  createdByEmail: z.string().email().nullable().optional().default(null),
  generatedAt: z.string().datetime().optional(),
  statusReason: z.string().trim().min(1).nullable().optional().default(null),
  tags: z.array(z.string().trim().min(1)).optional().default([])
});

export const projectQcRecordingWriteSchema = z.object({
  id: z.string().uuid().optional(),
  lifecycle: z.enum(projectQcRecordingLifecycleValues).optional().default("ready"),
  summary: z.string().trim().min(1),
  page: projectQcPageAssociationSchema,
  linkedReportId: z.string().uuid().nullable().optional().default(null),
  source: z.enum(projectQcSourceValues).optional().default("workspace_api"),
  sourceSessionId: z.string().uuid().nullable().optional().default(null),
  relatedSessionId: z.string().uuid().nullable().optional().default(null),
  createdByUserId: z.string().trim().min(1).nullable().optional().default(null),
  createdByEmail: z.string().email().nullable().optional().default(null),
  recordedAt: z.string().datetime().optional(),
  durationMs: z.number().int().nonnegative().nullable().optional().default(null),
  fileSizeBytes: z.number().int().nonnegative().nullable().optional().default(null),
  mimeType: z.string().trim().min(1).nullable().optional().default(null),
  storagePath: z.string().trim().min(1).nullable().optional().default(null),
  thumbnailPath: z.string().trim().min(1).nullable().optional().default(null),
  statusReason: z.string().trim().min(1).nullable().optional().default(null),
  tags: z.array(z.string().trim().min(1)).optional().default([])
});

export type ProjectQcPageAssociation = {
  url: string;
  pathname: string | null;
  title: string | null;
  pageLabel: string;
  routeKey: string;
};

export type ProjectQcFinding = {
  id: string;
  severity: ProjectQcFindingSeverity;
  category: string;
  status: ProjectQcFindingStatus;
  title: string;
  detail: string;
  recommendation: string | null;
};

export type ProjectQcGuardrail = {
  id: string;
  severity: ProjectQcFindingSeverity;
  title: string;
  detail: string;
  recommendation: string | null;
};

export type ProjectQcReport = {
  id: string;
  type: "qc_report";
  workspaceId: string;
  projectId: string;
  name: string;
  lifecycle: ProjectQcReportLifecycle;
  outcome: ProjectQcReportOutcome | null;
  summary: string;
  internalSummary: string | null;
  customerSummary: string | null;
  page: ProjectQcPageAssociation;
  findings: ProjectQcFinding[];
  findingsCount: number;
  warningsCount: number;
  errorsCount: number;
  guardrailsCount: number;
  guardrails: ProjectQcGuardrail[];
  linkedRecordingId: string | null;
  source: ProjectQcSource;
  sourceSessionId: string | null;
  relatedSessionId: string | null;
  createdByUserId: string | null;
  createdByEmail: string | null;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  statusReason: string | null;
  tags: string[];
};

export type ProjectQcRecording = {
  id: string;
  type: "qc_recording";
  workspaceId: string;
  projectId: string;
  name: string;
  lifecycle: ProjectQcRecordingLifecycle;
  summary: string;
  page: ProjectQcPageAssociation;
  linkedReportId: string | null;
  source: ProjectQcSource;
  sourceSessionId: string | null;
  relatedSessionId: string | null;
  createdByUserId: string | null;
  createdByEmail: string | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
  durationMs: number | null;
  fileSizeBytes: number | null;
  mimeType: string | null;
  storagePath: string | null;
  thumbnailPath: string | null;
  statusReason: string | null;
  tags: string[];
};

export type ProjectQcPageSummary = {
  routeKey: string;
  pageLabel: string;
  url: string;
  latestReportOutcome: ProjectQcReportOutcome | null;
  latestActivityAt: string | null;
  reportCount: number;
  recordingCount: number;
};

export type ProjectQcLibraryDestination = {
  commandCenterRoute: string;
  listPath: string;
  reportWritePath: string;
  recordingWritePath: string;
};

export type ProjectQcLibrarySnapshot = {
  destination: ProjectQcLibraryDestination;
  reports: ProjectQcReport[];
  recordings: ProjectQcRecording[];
  pages: ProjectQcPageSummary[];
  registeredAssets: StoredProjectAsset[];
};

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function slugify(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((item) => item?.trim())
        .filter((item): item is string => Boolean(item))
    )
  );
}

function ensureValidIso(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function formatNameStamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Undated";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function durationLabel(durationMs: number | null) {
  if (!durationMs || durationMs <= 0) {
    return "Recording";
  }

  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function readPathnameFromUrl(url: string) {
  try {
    return new URL(url).pathname || null;
  } catch {
    return null;
  }
}

function normalizePageAssociation(input: z.infer<typeof projectQcPageAssociationSchema>): ProjectQcPageAssociation {
  const parsed = projectQcPageAssociationSchema.parse(input);
  const pathname = parsed.pathname ?? readPathnameFromUrl(parsed.url);
  const pageLabel =
    parsed.pageLabel?.trim() ||
    parsed.title?.trim() ||
    pathname ||
    parsed.url;
  const routeKey =
    parsed.routeKey?.trim() ||
    slugify(pathname || pageLabel || parsed.url) ||
    "page";

  return {
    url: parsed.url,
    pathname,
    title: parsed.title,
    pageLabel,
    routeKey
  };
}

function normalizeFinding(input: z.infer<typeof projectQcFindingInputSchema>): ProjectQcFinding {
  const parsed = projectQcFindingInputSchema.parse(input);

  return {
    id: parsed.id ?? randomUUID(),
    severity: parsed.severity,
    category: parsed.category,
    status: parsed.status,
    title: parsed.title,
    detail: parsed.detail,
    recommendation: parsed.recommendation
  };
}

function normalizeGuardrail(
  input: z.infer<typeof projectQcGuardrailInputSchema>
): ProjectQcGuardrail {
  const parsed = projectQcGuardrailInputSchema.parse(input);

  return {
    id: parsed.id ?? randomUUID(),
    severity: parsed.severity,
    title: parsed.title,
    detail: parsed.detail,
    recommendation: parsed.recommendation
  };
}

function reportLabel(outcome: ProjectQcReportOutcome | null) {
  if (!outcome) {
    return "Pending";
  }

  if (outcome === "pass") {
    return "Pass";
  }

  if (outcome === "warning") {
    return "Warning";
  }

  return "Fail";
}

function lifecycleLabel(
  lifecycle: ProjectQcReportLifecycle | ProjectQcRecordingLifecycle
) {
  return lifecycle.replace(/_/g, " ");
}

function countFindingSeverity(
  findings: ProjectQcFinding[],
  severity: ProjectQcFindingSeverity
) {
  return findings.filter((finding) => finding.severity === severity).length;
}

function buildProjectQcProjectDirectory(args: {
  workspaceId: string;
  projectId: string;
}) {
  return path.join(
    projectQcLibraryRoot,
    sanitizeSegment(args.workspaceId),
    sanitizeSegment(args.projectId)
  );
}

function getProjectQcReportsDirectory(args: {
  workspaceId: string;
  projectId: string;
}) {
  return path.join(buildProjectQcProjectDirectory(args), "reports");
}

function getProjectQcRecordingsDirectory(args: {
  workspaceId: string;
  projectId: string;
}) {
  return path.join(buildProjectQcProjectDirectory(args), "recordings");
}

function getProjectQcReportFilePath(args: {
  workspaceId: string;
  projectId: string;
  reportId: string;
}) {
  return path.join(
    getProjectQcReportsDirectory(args),
    `${sanitizeSegment(args.reportId)}.json`
  );
}

function getProjectQcRecordingFilePath(args: {
  workspaceId: string;
  projectId: string;
  recordingId: string;
}) {
  return path.join(
    getProjectQcRecordingsDirectory(args),
    `${sanitizeSegment(args.recordingId)}.json`
  );
}

async function ensureProjectQcDirectories(args: {
  workspaceId: string;
  projectId: string;
}) {
  await mkdir(getProjectQcReportsDirectory(args), { recursive: true });
  await mkdir(getProjectQcRecordingsDirectory(args), { recursive: true });
}

async function readJsonFile<T>(filePath: string) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJsonFile(filePath: string, value: unknown) {
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

const storedProjectQcFindingSchema = z.object({
  id: z.string().uuid(),
  severity: z.enum(projectQcFindingSeverityValues),
  category: z.string().trim().min(1),
  status: z.enum(projectQcFindingStatusValues),
  title: z.string().trim().min(1),
  detail: z.string().trim().min(1),
  recommendation: z.string().trim().min(1).nullable()
});

const storedProjectQcGuardrailSchema = z.object({
  id: z.string().uuid(),
  severity: z.enum(projectQcFindingSeverityValues),
  title: z.string().trim().min(1),
  detail: z.string().trim().min(1),
  recommendation: z.string().trim().min(1).nullable()
});

const storedProjectQcPageAssociationSchema = z.object({
  url: z.string().url(),
  pathname: z.string().trim().min(1).nullable(),
  title: z.string().trim().min(1).nullable(),
  pageLabel: z.string().trim().min(1),
  routeKey: z.string().trim().min(1)
});

const storedProjectQcReportSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("qc_report"),
  workspaceId: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().trim().min(1),
  lifecycle: z.enum(projectQcReportLifecycleValues),
  outcome: z.enum(projectQcReportOutcomeValues).nullable().optional().default(null),
  summary: z.string().trim().min(1),
  internalSummary: z.string().trim().min(1).nullable().optional().default(null),
  customerSummary: z.string().trim().min(1).nullable(),
  page: storedProjectQcPageAssociationSchema,
  findings: z.array(storedProjectQcFindingSchema),
  findingsCount: z.number().int().nonnegative().optional().default(0),
  warningsCount: z.number().int().nonnegative().optional().default(0),
  errorsCount: z.number().int().nonnegative().optional().default(0),
  guardrailsCount: z.number().int().nonnegative().optional().default(0),
  guardrails: z.array(storedProjectQcGuardrailSchema).optional().default([]),
  linkedRecordingId: z.string().uuid().nullable(),
  source: z.enum(projectQcSourceValues).optional().default("workspace_api"),
  sourceSessionId: z.string().uuid().nullable(),
  relatedSessionId: z.string().uuid().nullable().optional().default(null),
  createdByUserId: z.string().trim().min(1).nullable().optional().default(null),
  createdByEmail: z.string().email().nullable().optional().default(null),
  generatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  statusReason: z.string().trim().min(1).nullable(),
  tags: z.array(z.string().trim().min(1))
});

const storedProjectQcRecordingSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("qc_recording"),
  workspaceId: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().trim().min(1),
  lifecycle: z.enum(projectQcRecordingLifecycleValues),
  summary: z.string().trim().min(1),
  page: storedProjectQcPageAssociationSchema,
  linkedReportId: z.string().uuid().nullable(),
  source: z.enum(projectQcSourceValues).optional().default("workspace_api"),
  sourceSessionId: z.string().uuid().nullable(),
  relatedSessionId: z.string().uuid().nullable().optional().default(null),
  createdByUserId: z.string().trim().min(1).nullable().optional().default(null),
  createdByEmail: z.string().email().nullable().optional().default(null),
  recordedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  durationMs: z.number().int().nonnegative().nullable(),
  fileSizeBytes: z.number().int().nonnegative().nullable(),
  mimeType: z.string().trim().min(1).nullable(),
  storagePath: z.string().trim().min(1).nullable(),
  thumbnailPath: z.string().trim().min(1).nullable(),
  statusReason: z.string().trim().min(1).nullable(),
  tags: z.array(z.string().trim().min(1))
});

async function readProjectQcReports(args: {
  workspaceId: string;
  projectId: string;
}) {
  await ensureProjectQcDirectories(args);
  const files = await readdir(getProjectQcReportsDirectory(args));
  const reports = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map(async (file) => {
        const filePath = path.join(getProjectQcReportsDirectory(args), file);

        try {
          return storedProjectQcReportSchema.parse(await readJsonFile(filePath));
        } catch (error) {
          console.warn(`[project-qc-library] Skipping unreadable QC report: ${filePath}`, error);
          return null;
        }
      })
  );

  return reports
    .filter((item): item is ProjectQcReport => Boolean(item))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

async function readProjectQcRecordings(args: {
  workspaceId: string;
  projectId: string;
}) {
  await ensureProjectQcDirectories(args);
  const files = await readdir(getProjectQcRecordingsDirectory(args));
  const recordings = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map(async (file) => {
        const filePath = path.join(getProjectQcRecordingsDirectory(args), file);

        try {
          return storedProjectQcRecordingSchema.parse(await readJsonFile(filePath));
        } catch (error) {
          console.warn(
            `[project-qc-library] Skipping unreadable QC recording: ${filePath}`,
            error
          );
          return null;
        }
      })
  );

  return recordings
    .filter((item): item is ProjectQcRecording => Boolean(item))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function listProjectQcReports(args: {
  workspaceId: string;
  projectId: string;
}) {
  return readProjectQcReports(args);
}

export async function listProjectQcRecordings(args: {
  workspaceId: string;
  projectId: string;
}) {
  return readProjectQcRecordings(args);
}

export async function getProjectQcReportById(args: {
  workspaceId: string;
  projectId: string;
  reportId: string;
}) {
  const reports = await readProjectQcReports(args);
  return reports.find((report) => report.id === args.reportId) ?? null;
}

export async function getProjectQcRecordingById(args: {
  workspaceId: string;
  projectId: string;
  recordingId: string;
}) {
  const recordings = await readProjectQcRecordings(args);
  return recordings.find((recording) => recording.id === args.recordingId) ?? null;
}

export function buildProjectQcReportName(args: {
  page: ProjectQcPageAssociation;
  generatedAt: string;
  outcome: ProjectQcReportOutcome | null;
}) {
  return `QC Report - ${args.page.pageLabel} - ${reportLabel(args.outcome)} - ${formatNameStamp(
    args.generatedAt
  )}`;
}

export function buildProjectQcRecordingName(args: {
  page: ProjectQcPageAssociation;
  recordedAt: string;
}) {
  return `QC Recording - ${args.page.pageLabel} - ${formatNameStamp(args.recordedAt)}`;
}

export function buildProjectQcLibraryDestination(args: {
  workspaceId: string;
  projectId: string;
}): ProjectQcLibraryDestination {
  const basePath = `/api/workspace/${args.workspaceId}/project/${args.projectId}/qc-library`;

  return {
    commandCenterRoute: buildProjectRoomRoute(args.workspaceId, "command-center"),
    listPath: basePath,
    reportWritePath: `${basePath}/reports`,
    recordingWritePath: `${basePath}/recordings`
  };
}

export function buildProjectQcReportAsset(report: ProjectQcReport): StoredProjectAsset {
  return {
    id: report.id,
    name: report.name,
    kind: "qc_report",
    sizeLabel: `${reportLabel(report.outcome)} · ${lifecycleLabel(report.lifecycle)}`,
    addedAt: report.generatedAt
  };
}

export function buildProjectQcRecordingAsset(recording: ProjectQcRecording): StoredProjectAsset {
  return {
    id: recording.id,
    name: recording.name,
    kind: "qc_recording",
    sizeLabel: `${lifecycleLabel(recording.lifecycle)} · ${durationLabel(recording.durationMs)}`,
    addedAt: recording.recordedAt
  };
}

export async function writeProjectQcReport(args: {
  workspaceId: string;
  projectId: string;
  input: z.infer<typeof projectQcReportWriteSchema>;
}) {
  await ensureProjectQcDirectories(args);
  const parsed = projectQcReportWriteSchema.parse(args.input);
  const existing = parsed.id
    ? await readJsonFile<ProjectQcReport>(
        getProjectQcReportFilePath({
          workspaceId: args.workspaceId,
          projectId: args.projectId,
          reportId: parsed.id
        })
      ).catch(() => null)
    : null;
  const now = new Date().toISOString();
  const generatedAt = ensureValidIso(parsed.generatedAt, now);
  const page = normalizePageAssociation(parsed.page);
  const findings = parsed.findings.map((finding) => normalizeFinding(finding));
  const guardrails = parsed.guardrails.map((guardrail) => normalizeGuardrail(guardrail));
  const errorsCount = parsed.errorsCount ?? countFindingSeverity(findings, "critical");
  const warningsCount = parsed.warningsCount ?? countFindingSeverity(findings, "warning");
  const guardrailsCount = parsed.guardrailsCount ?? guardrails.length;
  const findingsCount = parsed.findingsCount ?? findings.length;
  const report: ProjectQcReport = {
    id: parsed.id ?? randomUUID(),
    type: "qc_report",
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    name: buildProjectQcReportName({
      page,
      generatedAt,
      outcome: parsed.outcome
    }),
    lifecycle: parsed.lifecycle,
    outcome: parsed.outcome,
    summary: parsed.summary,
    internalSummary: parsed.internalSummary,
    customerSummary: parsed.customerSummary,
    page,
    findings,
    findingsCount,
    warningsCount,
    errorsCount,
    guardrailsCount,
    guardrails,
    linkedRecordingId: parsed.linkedRecordingId,
    source: parsed.source,
    sourceSessionId: parsed.sourceSessionId,
    relatedSessionId: parsed.relatedSessionId,
    createdByUserId: parsed.createdByUserId,
    createdByEmail: parsed.createdByEmail,
    generatedAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    statusReason: parsed.statusReason,
    tags: uniqueStrings(parsed.tags)
  };

  await writeJsonFile(
    getProjectQcReportFilePath({
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      reportId: report.id
    }),
    report
  );

  return {
    report,
    asset: buildProjectQcReportAsset(report)
  };
}

export async function writeProjectQcRecording(args: {
  workspaceId: string;
  projectId: string;
  input: z.infer<typeof projectQcRecordingWriteSchema>;
}) {
  await ensureProjectQcDirectories(args);
  const parsed = projectQcRecordingWriteSchema.parse(args.input);
  const existing = parsed.id
    ? await readJsonFile<ProjectQcRecording>(
        getProjectQcRecordingFilePath({
          workspaceId: args.workspaceId,
          projectId: args.projectId,
          recordingId: parsed.id
        })
      ).catch(() => null)
    : null;
  const now = new Date().toISOString();
  const recordedAt = ensureValidIso(parsed.recordedAt, now);
  const page = normalizePageAssociation(parsed.page);
  const recording: ProjectQcRecording = {
    id: parsed.id ?? randomUUID(),
    type: "qc_recording",
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    name:
      existing?.name ??
      buildProjectQcRecordingName({
        page,
        recordedAt
      }),
    lifecycle: parsed.lifecycle,
    summary: parsed.summary,
    page,
    linkedReportId: parsed.linkedReportId,
    source: parsed.source,
    sourceSessionId: parsed.sourceSessionId,
    relatedSessionId: parsed.relatedSessionId,
    createdByUserId: parsed.createdByUserId,
    createdByEmail: parsed.createdByEmail,
    recordedAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    durationMs: parsed.durationMs,
    fileSizeBytes: parsed.fileSizeBytes,
    mimeType: parsed.mimeType,
    storagePath: parsed.storagePath,
    thumbnailPath: parsed.thumbnailPath,
    statusReason: parsed.statusReason,
    tags: uniqueStrings(parsed.tags)
  };

  await writeJsonFile(
    getProjectQcRecordingFilePath({
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      recordingId: recording.id
    }),
    recording
  );

  return {
    recording,
    asset: buildProjectQcRecordingAsset(recording)
  };
}

function mergeUniqueAssets(items: StoredProjectAsset[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function filterRegisteredProjectQcAssets(metadata: StoredProjectMetadata | null | undefined) {
  return (metadata?.assets ?? []).filter(
    (asset) => asset.kind === "qc_report" || asset.kind === "qc_recording"
  );
}

export async function registerProjectQcAssetInMetadata(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  workspaceId: string;
  asset: StoredProjectAsset;
}) {
  const { data: workspace, error } = await args.supabase
    .from("workspaces")
    .select("id, name, description")
    .eq("id", args.workspaceId)
    .eq("owner_id", args.userId)
    .maybeSingle();

  if (error) {
    return {
      registered: false as const,
      reason: error.message
    };
  }

  if (!workspace) {
    return {
      registered: false as const,
      reason: "Workspace owner write access is required to register project library assets."
    };
  }

  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const nextAssets = mergeUniqueAssets([...(parsed.metadata?.assets ?? []), args.asset]);
  const nextDescription = encodeWorkspaceProjectDescription(
    parsed.visibleDescription,
    buildStoredProjectMetadata({
      title: workspace.name,
      description: parsed.visibleDescription,
      templateId: parsed.metadata?.templateId ?? null,
      customLanes: parsed.metadata?.customLanes ?? [],
      archived: parsed.metadata?.archived ?? false,
      assets: nextAssets,
      commandCenterBrandSystem: parsed.metadata?.commandCenterBrandSystem ?? null,
      commandCenterDecisions: parsed.metadata?.commandCenterDecisions ?? [],
      commandCenterChangeReviews: parsed.metadata?.commandCenterChangeReviews ?? [],
      commandCenterTasks: parsed.metadata?.commandCenterTasks ?? [],
      commandCenterPreviewState: parsed.metadata?.commandCenterPreviewState ?? null,
      commandCenterApprovedDesignPackage:
        parsed.metadata?.commandCenterApprovedDesignPackage ?? null,
      guidedFlowPreset: parsed.metadata?.guidedFlowPreset,
      guidedEntryContext: parsed.metadata?.guidedEntryContext ?? null,
      buildSession: parsed.metadata?.buildSession ?? null,
      saasIntake: parsed.metadata?.saasIntake ?? null,
      mobileAppIntake: parsed.metadata?.mobileAppIntake ?? null
    })
  );

  const { data: updated, error: updateError } = await args.supabase
    .from("workspaces")
    .update({
      description: nextDescription
    })
    .eq("id", args.workspaceId)
    .eq("owner_id", args.userId)
    .select("id")
    .maybeSingle();

  if (updateError) {
    return {
      registered: false as const,
      reason: updateError.message
    };
  }

  return {
    registered: Boolean(updated),
    reason: updated ? null : "Workspace metadata did not confirm the QC asset registration."
  };
}

export async function getProjectQcLibrarySnapshot(args: {
  workspaceId: string;
  projectId: string;
  projectMetadata?: StoredProjectMetadata | null;
}) {
  const [reports, recordings] = await Promise.all([
    listProjectQcReports(args),
    listProjectQcRecordings(args)
  ]);
  const pageMap = new Map<string, ProjectQcPageSummary>();

  for (const report of reports) {
    const current = pageMap.get(report.page.routeKey) ?? {
      routeKey: report.page.routeKey,
      pageLabel: report.page.pageLabel,
      url: report.page.url,
      latestReportOutcome: null,
      latestActivityAt: null,
      reportCount: 0,
      recordingCount: 0
    };

    pageMap.set(report.page.routeKey, {
      ...current,
      latestReportOutcome: current.latestReportOutcome ?? report.outcome,
      latestActivityAt:
        !current.latestActivityAt || Date.parse(report.updatedAt) > Date.parse(current.latestActivityAt)
          ? report.updatedAt
          : current.latestActivityAt,
      reportCount: current.reportCount + 1
    });
  }

  for (const recording of recordings) {
    const current = pageMap.get(recording.page.routeKey) ?? {
      routeKey: recording.page.routeKey,
      pageLabel: recording.page.pageLabel,
      url: recording.page.url,
      latestReportOutcome: null,
      latestActivityAt: null,
      reportCount: 0,
      recordingCount: 0
    };

    pageMap.set(recording.page.routeKey, {
      ...current,
      latestActivityAt:
        !current.latestActivityAt || Date.parse(recording.updatedAt) > Date.parse(current.latestActivityAt)
          ? recording.updatedAt
          : current.latestActivityAt,
      recordingCount: current.recordingCount + 1
    });
  }

  return {
    destination: buildProjectQcLibraryDestination(args),
    reports,
    recordings,
    pages: Array.from(pageMap.values()).sort((a, b) => {
      const left = a.latestActivityAt ? Date.parse(a.latestActivityAt) : 0;
      const right = b.latestActivityAt ? Date.parse(b.latestActivityAt) : 0;
      return right - left;
    }),
    registeredAssets: filterRegisteredProjectQcAssets(args.projectMetadata)
  } satisfies ProjectQcLibrarySnapshot;
}
