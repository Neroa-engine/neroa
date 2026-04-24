import Link from "next/link";
import type { BrowserRuntimeV2ProjectOutput } from "@/lib/browser-runtime-v2/output-store";
import type {
  ProjectQcLibrarySnapshot,
  ProjectQcRecording,
  ProjectQcReport
} from "@/lib/workspace/project-qc-library";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";

type ProjectLibraryPageProps = {
  project: ProjectRecord;
  projectMetadata?: StoredProjectMetadata | null;
  snapshot: ProjectQcLibrarySnapshot;
  browserRuntimeOutputs: BrowserRuntimeV2ProjectOutput[];
};

function outcomeTone(outcome: ProjectQcReport["outcome"] | null) {
  if (outcome === "pass") {
    return "border-emerald-300/35 bg-emerald-300/12 text-emerald-700";
  }

  if (outcome === "warning") {
    return "border-amber-300/40 bg-amber-300/14 text-amber-700";
  }

  if (outcome === "fail") {
    return "border-rose-300/40 bg-rose-300/14 text-rose-700";
  }

  return "border-slate-200 bg-white/82 text-slate-500";
}

function lifecycleTone(value: string) {
  if (value === "ready" || value === "pass") {
    return "border-cyan-300/35 bg-cyan-300/12 text-cyan-700";
  }

  if (
    value === "processing" ||
    value === "draft" ||
    value === "warning" ||
    value === "queued" ||
    value === "running" ||
    value === "capturing"
  ) {
    return "border-amber-300/40 bg-amber-300/14 text-amber-700";
  }

  if (value === "failed" || value === "archived" || value === "superseded" || value === "fail") {
    return "border-rose-300/40 bg-rose-300/14 text-rose-700";
  }

  return "border-slate-200 bg-white/82 text-slate-500";
}

function formatTimestamp(value: string | null | undefined) {
  if (!value) {
    return "Not recorded yet";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function SurfaceStat({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white/80 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}

function PageSummaryCard({
  item
}: {
  item: ProjectQcLibrarySnapshot["pages"][number];
}) {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/78 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${outcomeTone(
            item.latestReportOutcome
          )}`}
        >
          {item.latestReportOutcome ? item.latestReportOutcome : "No report yet"}
        </span>
        <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {item.reportCount} reports
        </span>
        <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {item.recordingCount} recordings
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.pageLabel}</h3>
      <p className="mt-2 break-all text-sm leading-6 text-slate-600">{item.url}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">
        Latest activity {formatTimestamp(item.latestActivityAt)}
      </p>
    </div>
  );
}

function ReportCard({ report }: { report: ProjectQcReport }) {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/78 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${outcomeTone(
            report.outcome
          )}`}
        >
          {report.outcome ?? "pending"}
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${lifecycleTone(
            report.lifecycle
          )}`}
        >
          {report.lifecycle.replace(/_/g, " ")}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-950">{report.name}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{report.summary}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Page
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-900">{report.page.pageLabel}</p>
          <p className="mt-2 break-all text-sm leading-6 text-slate-600">{report.page.url}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            History
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Generated {formatTimestamp(report.generatedAt)}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Updated {formatTimestamp(report.updatedAt)}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Source {report.source.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-[18px] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Findings
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{report.findingsCount}</p>
        </div>
        <div className="rounded-[18px] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Warnings
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{report.warningsCount}</p>
        </div>
        <div className="rounded-[18px] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Errors
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{report.errorsCount}</p>
        </div>
        <div className="rounded-[18px] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Guardrails
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{report.guardrailsCount}</p>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Findings
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {report.findingsCount} structured findings recorded for this QC pass.
        </p>
        {report.findings.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {report.findings.slice(0, 3).map((finding) => (
              <li key={finding.id} className="rounded-[18px] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${lifecycleTone(
                      finding.severity === "critical"
                        ? "failed"
                        : finding.severity === "warning"
                          ? "warning"
                          : "ready"
                    )}`}
                  >
                    {finding.severity}
                  </span>
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    {finding.category}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{finding.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{finding.detail}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {report.linkedRecordingId ? (
        <div className="mt-5 rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Linked Recording
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Recording {report.linkedRecordingId} is attached to this report for page-level replay and later review.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function RecordingCard({ recording }: { recording: ProjectQcRecording }) {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/78 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${lifecycleTone(
            recording.lifecycle
          )}`}
        >
          {recording.lifecycle.replace(/_/g, " ")}
        </span>
        {recording.mimeType ? (
          <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {recording.mimeType}
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-950">{recording.name}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{recording.summary}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Page
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-900">{recording.page.pageLabel}</p>
          <p className="mt-2 break-all text-sm leading-6 text-slate-600">{recording.page.url}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Recording Details
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Recorded {formatTimestamp(recording.recordedAt)}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Duration{" "}
            {recording.durationMs ? `${Math.round(recording.durationMs / 1000)}s` : "Not recorded"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Source {recording.source.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      {recording.linkedReportId ? (
        <div className="mt-5 rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Linked Report
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Report {recording.linkedReportId} is attached to this recording for the same page and session history.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function BrowserRuntimeOutputCard({
  output
}: {
  output: BrowserRuntimeV2ProjectOutput;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/78 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${lifecycleTone(
            output.lifecycle
          )}`}
        >
          {output.lifecycle.replace(/_/g, " ")}
        </span>
        <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {output.kind.replace(/_/g, " ")}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-950">{output.title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{output.summary}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Page
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-900">
            {output.page?.pageLabel ?? "No page association"}
          </p>
          <p className="mt-2 break-all text-sm leading-6 text-slate-600">
            {output.page?.url ?? "This runtime output is not tied to one page URL."}
          </p>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Output details
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Generated {formatTimestamp(output.generatedAt)}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Updated {formatTimestamp(output.updatedAt)}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Outcome {output.outcome ?? "not graded"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Runtime target{" "}
            {output.runtimeTarget
              ? `${output.runtimeTarget.label} (${output.runtimeTarget.origin})`
              : "not captured"}
          </p>
        </div>
      </div>

      {output.statusReason ? (
        <div className="mt-5 rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Runtime note
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{output.statusReason}</p>
        </div>
      ) : null}
    </div>
  );
}

export function ProjectLibraryPage({
  project,
  projectMetadata,
  snapshot,
  browserRuntimeOutputs
}: ProjectLibraryPageProps) {
  const projectWorkspaceHref = `/workspace/${project.workspaceId}/project/${project.id}`;
  const commandCenterHref = `/workspace/${project.workspaceId}/command-center`;
  const totalAssets = snapshot.reports.length + snapshot.recordings.length + browserRuntimeOutputs.length;
  const metadataAssetCount = snapshot.registeredAssets.length;

  return (
    <section className="surface-main relative overflow-hidden rounded-[42px] p-6 xl:p-8 2xl:p-10">
      <div className="floating-wash rounded-[42px]" />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Project Library
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-5xl">
              QC reports and recordings now have a stable project home.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 xl:text-base">
              This library keeps page-level QC history, structured findings, and linked recordings
              attached to the project record before the browser runtime begins writing into it
              directly.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={projectWorkspaceHref} className="button-secondary">
              Return to Project
            </Link>
            <Link href={commandCenterHref} className="button-primary">
              Open Command Center
            </Link>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <SurfaceStat
            label="QC Reports"
            value={String(snapshot.reports.length)}
            helper="Structured report history that later browser QC runs can append to."
          />
          <SurfaceStat
            label="QC Recordings"
            value={String(snapshot.recordings.length)}
            helper="Recording assets kept alongside the project instead of as detached session output."
          />
          <SurfaceStat
            label="Tracked Pages"
            value={String(snapshot.pages.length)}
            helper="Page-level associations give each report and recording a stable destination."
          />
          <SurfaceStat
            label="Runtime Outputs"
            value={String(browserRuntimeOutputs.length)}
            helper="Walkthrough and SOP artifacts now write into the same project history instead of a disconnected browser-only store."
          />
          <SurfaceStat
            label="Project Record Assets"
            value={String(metadataAssetCount)}
            helper={
              projectMetadata?.assets?.length
                ? `${totalAssets} runtime artifacts stored, ${metadataAssetCount} registered in project metadata.`
                : `${totalAssets} runtime artifacts stored and ready for project-level history.`
            }
          />
        </div>

        <section className="floating-plane rounded-[34px] p-5 xl:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Page Association
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Every QC artifact can attach to a specific page, route, and URL so future runs build
                real timestamped history instead of raw transcript output.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {snapshot.pages.length > 0 ? (
              snapshot.pages.map((item) => <PageSummaryCard key={item.routeKey} item={item} />)
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/72 px-5 py-6 text-sm leading-7 text-slate-600 xl:col-span-3">
                No QC assets have been written yet. Browser Runtime and Live View recordings will
                land here automatically once the first capture runs against this project.
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
          <section className="floating-plane rounded-[34px] p-5 xl:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              QC Reports
            </p>
            <div className="mt-5 space-y-4">
              {snapshot.reports.length > 0 ? (
                snapshot.reports.map((report) => <ReportCard key={report.id} report={report} />)
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/72 px-5 py-6 text-sm leading-7 text-slate-600">
                  No reports have been stored yet. The browser QC bridge is ready, but this project
                  has not received its first report yet.
                </div>
              )}
            </div>
          </section>

          <section className="floating-plane rounded-[34px] p-5 xl:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              QC Recordings
            </p>
            <div className="mt-5 space-y-4">
              {snapshot.recordings.length > 0 ? (
                snapshot.recordings.map((recording) => (
                  <RecordingCard key={recording.id} recording={recording} />
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/72 px-5 py-6 text-sm leading-7 text-slate-600">
                  No recordings have been stored yet. Recording metadata will appear here once Live
                  View capture is enabled and the browser stores its first frame-backed asset.
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="floating-plane rounded-[34px] p-5 xl:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Browser Runtime V2 Outputs
          </p>
          <div className="mt-5 space-y-4">
            {browserRuntimeOutputs.length > 0 ? (
              browserRuntimeOutputs.map((output) => (
                <BrowserRuntimeOutputCard key={output.id} output={output} />
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/72 px-5 py-6 text-sm leading-7 text-slate-600">
                No Browser Runtime V2 walkthrough or SOP outputs have been stored yet. The new
                runtime actions will land here once the first bounded walkthrough or SOP generation
                run completes.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
