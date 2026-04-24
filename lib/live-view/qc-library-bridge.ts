import { z } from "zod";
import type {
  LiveViewFinding,
  LiveViewGuardrail,
  LiveViewSession
} from "@/lib/live-view/types";
import { getLiveViewSessionByToken } from "@/lib/live-view/store";
import {
  getProjectQcRecordingById,
  getProjectQcReportById,
  projectQcFindingInputSchema,
  projectQcGuardrailInputSchema,
  projectQcPageAssociationSchema,
  projectQcRecordingWriteSchema,
  projectQcReportWriteSchema,
  writeProjectQcRecording,
  writeProjectQcReport,
  type ProjectQcPageAssociation,
  type ProjectQcReportOutcome
} from "@/lib/workspace/project-qc-library";

const liveViewQcMetadataRegistration = {
  registered: false,
  reason:
    "Live View token writes persist to the canonical QC library store, but workspace metadata asset registration still requires signed-in owner context."
} as const;

function isUuid(value: string | null | undefined) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value ?? ""
  );
}

export const liveViewQcReportMutationSchema = projectQcReportWriteSchema.omit({
  source: true,
  sourceSessionId: true,
  relatedSessionId: true,
  createdByUserId: true,
  createdByEmail: true
});

export const liveViewQcRecordingMutationSchema = projectQcRecordingWriteSchema.omit({
  source: true,
  sourceSessionId: true,
  relatedSessionId: true,
  createdByUserId: true,
  createdByEmail: true
});

export const liveViewQcLinkMutationSchema = z.object({
  reportId: z.string().uuid(),
  recordingId: z.string().uuid()
});

export function mapLiveViewFindingToProjectQcFinding(finding: LiveViewFinding) {
  return projectQcFindingInputSchema.parse({
    id: isUuid(finding.id) ? finding.id : undefined,
    severity: finding.severity,
    category: finding.category,
    status: "open",
    title: finding.title,
    detail: finding.detail,
    recommendation: finding.recommendation
  });
}

export function mapLiveViewGuardrailToProjectQcGuardrail(guardrail: LiveViewGuardrail) {
  return projectQcGuardrailInputSchema.parse({
    id: isUuid(guardrail.id) ? guardrail.id : undefined,
    severity: guardrail.severity,
    title: guardrail.title,
    detail: guardrail.detail,
    recommendation: guardrail.recommendation
  });
}

export function inferProjectQcOutcomeFromInspection(args: {
  findings: Array<Pick<LiveViewFinding, "severity">>;
  guardrails?: Array<Pick<LiveViewGuardrail, "severity">>;
}) {
  if (args.findings.some((finding) => finding.severity === "critical")) {
    return "fail" satisfies ProjectQcReportOutcome;
  }

  if (
    args.findings.some((finding) => finding.severity === "warning") ||
    (args.guardrails ?? []).length > 0
  ) {
    return "warning" satisfies ProjectQcReportOutcome;
  }

  return "pass" satisfies ProjectQcReportOutcome;
}

export function buildLiveViewQcPageAssociation(input: {
  url: string;
  pathname?: string | null;
  title?: string | null;
  pageLabel?: string | null;
  routeKey?: string | null;
}): ProjectQcPageAssociation {
  const parsed = projectQcPageAssociationSchema.parse({
    url: input.url,
    pathname: input.pathname ?? null,
    title: input.title ?? null,
    pageLabel: input.pageLabel ?? null,
    routeKey: input.routeKey ?? null
  });

  const inferredPathname =
    parsed.pathname ??
    (() => {
      try {
        return new URL(parsed.url).pathname || null;
      } catch {
        return null;
      }
    })();

  const pageLabel =
    parsed.pageLabel?.trim() ||
    parsed.title?.trim() ||
    inferredPathname ||
    parsed.url;

  const routeKey =
    parsed.routeKey?.trim() ||
    pageLabel
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) ||
    "page";

  return {
    url: parsed.url,
    pathname: inferredPathname,
    title: parsed.title,
    pageLabel,
    routeKey
  };
}

export async function requireLiveViewQcSession(token: string) {
  const session = await getLiveViewSessionByToken(token);

  if (!session) {
    throw new Error("Live View session not found.");
  }

  return session;
}

function extendBridgeMetadata(session: LiveViewSession) {
  return {
    source: "browser_runtime" as const,
    sourceSessionId: session.id,
    relatedSessionId: session.id,
    createdByUserId: session.createdByUserId,
    createdByEmail: session.createdByEmail
  };
}

export async function writeLiveViewQcReport(args: {
  session: LiveViewSession;
  input: z.input<typeof liveViewQcReportMutationSchema>;
}) {
  const parsed = liveViewQcReportMutationSchema.parse(args.input);
  const { report, asset } = await writeProjectQcReport({
    workspaceId: args.session.workspaceId,
    projectId: args.session.projectId,
    input: {
      ...parsed,
      ...extendBridgeMetadata(args.session)
    }
  });

  return {
    report,
    asset,
    metadataRegistration: liveViewQcMetadataRegistration
  };
}

export async function writeLiveViewQcRecording(args: {
  session: LiveViewSession;
  input: z.input<typeof liveViewQcRecordingMutationSchema>;
}) {
  const parsed = liveViewQcRecordingMutationSchema.parse(args.input);
  const { recording, asset } = await writeProjectQcRecording({
    workspaceId: args.session.workspaceId,
    projectId: args.session.projectId,
    input: {
      ...parsed,
      ...extendBridgeMetadata(args.session)
    }
  });

  return {
    recording,
    asset,
    metadataRegistration: liveViewQcMetadataRegistration
  };
}

function mapExistingReportToWriteInput(report: Awaited<ReturnType<typeof getProjectQcReportById>>) {
  if (!report) {
    return null;
  }

  return {
    id: report.id,
    lifecycle: report.lifecycle,
    outcome: report.outcome,
    summary: report.summary,
    internalSummary: report.internalSummary,
    customerSummary: report.customerSummary,
    page: report.page,
    findings: report.findings,
    findingsCount: report.findingsCount,
    warningsCount: report.warningsCount,
    errorsCount: report.errorsCount,
    guardrailsCount: report.guardrailsCount,
    guardrails: report.guardrails,
    linkedRecordingId: report.linkedRecordingId,
    generatedAt: report.generatedAt,
    statusReason: report.statusReason,
    tags: report.tags
  };
}

function mapExistingRecordingToWriteInput(
  recording: Awaited<ReturnType<typeof getProjectQcRecordingById>>
) {
  if (!recording) {
    return null;
  }

  return {
    id: recording.id,
    lifecycle: recording.lifecycle,
    summary: recording.summary,
    page: recording.page,
    linkedReportId: recording.linkedReportId,
    recordedAt: recording.recordedAt,
    durationMs: recording.durationMs,
    fileSizeBytes: recording.fileSizeBytes,
    mimeType: recording.mimeType,
    storagePath: recording.storagePath,
    thumbnailPath: recording.thumbnailPath,
    statusReason: recording.statusReason,
    tags: recording.tags
  };
}

export async function linkLiveViewQcArtifacts(args: {
  session: LiveViewSession;
  reportId: string;
  recordingId: string;
}) {
  const [existingReport, existingRecording] = await Promise.all([
    getProjectQcReportById({
      workspaceId: args.session.workspaceId,
      projectId: args.session.projectId,
      reportId: args.reportId
    }),
    getProjectQcRecordingById({
      workspaceId: args.session.workspaceId,
      projectId: args.session.projectId,
      recordingId: args.recordingId
    })
  ]);

  if (!existingReport) {
    throw new Error("QC report not found for this Live View session.");
  }

  if (!existingRecording) {
    throw new Error("QC recording not found for this Live View session.");
  }

  const reportInput = mapExistingReportToWriteInput(existingReport);
  const recordingInput = mapExistingRecordingToWriteInput(existingRecording);

  if (!reportInput || !recordingInput) {
    throw new Error("Unable to map the existing QC assets for linkage.");
  }

  const [reportResult, recordingResult] = await Promise.all([
    writeLiveViewQcReport({
      session: args.session,
      input: {
        ...reportInput,
        linkedRecordingId: args.recordingId
      }
    }),
    writeLiveViewQcRecording({
      session: args.session,
      input: {
        ...recordingInput,
        linkedReportId: args.reportId
      }
    })
  ]);

  return {
    report: reportResult.report,
    recording: recordingResult.recording,
    metadataRegistration: liveViewQcMetadataRegistration
  };
}

export type LiveViewQcPageAssociationInput = ProjectQcPageAssociation;
