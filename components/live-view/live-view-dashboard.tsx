"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LiveViewConnectionPayload, LiveViewSession, LiveViewSessionSummary } from "@/lib/live-view/types";

type LiveViewDashboardProps = {
  connection: LiveViewConnectionPayload;
  initialActiveSession: LiveViewSession;
  initialSessions: LiveViewSessionSummary[];
};

function statusClasses(status: LiveViewSessionSummary["status"]) {
  return status === "active"
    ? "border-emerald-300/30 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-500";
}

function severityClasses(severity: "critical" | "warning" | "info") {
  if (severity === "critical") {
    return "border-rose-300/35 bg-rose-50 text-rose-700";
  }

  if (severity === "warning") {
    return "border-amber-300/35 bg-amber-50 text-amber-700";
  }

  return "border-cyan-300/35 bg-cyan-50 text-cyan-700";
}

function connectionClasses(status: "connected" | "disconnected") {
  return status === "connected"
    ? "border-emerald-300/30 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-500";
}

function sessionClasses(status: LiveViewSessionSummary["status"]) {
  return status === "active"
    ? "border-cyan-300/30 bg-cyan-50 text-cyan-700"
    : "border-slate-200 bg-slate-100 text-slate-500";
}

function formatStamp(value: string | null) {
  if (!value) {
    return "Waiting for first inspection";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for first inspection";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function tokenSuffix(token: string) {
  return token.slice(-6);
}

function ConnectionBeacon({ connection }: { connection: LiveViewConnectionPayload }) {
  const payload = JSON.stringify(connection);

  return (
    <>
      <script
        id="neroa-live-view-connection"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: payload }}
      />
      <div
        hidden
        data-neroa-live-view-connection="true"
        data-session-id={connection.sessionId}
        data-token={connection.token}
        data-workspace-id={connection.workspaceId}
        data-project-id={connection.projectId}
        data-project-title={connection.projectTitle}
        data-bridge-origin={connection.bridgeOrigin}
        data-allowed-origins={JSON.stringify(connection.allowedOrigins)}
      />
    </>
  );
}

export function LiveViewDashboard({
  connection,
  initialActiveSession,
  initialSessions
}: LiveViewDashboardProps) {
  const [activeSession, setActiveSession] = useState(initialActiveSession);
  const [sessions, setSessions] = useState(initialSessions);
  const [pollError, setPollError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function poll() {
      try {
        const response = await fetch(
          `/api/live-view/session?workspaceId=${encodeURIComponent(connection.workspaceId)}&projectId=${encodeURIComponent(connection.projectId)}&sessionId=${encodeURIComponent(connection.sessionId)}`,
          {
            cache: "no-store"
          }
        );

        if (!response.ok) {
          throw new Error("Unable to refresh Live View session.");
        }

        const json = (await response.json()) as {
          session?: LiveViewSession;
          sessions?: LiveViewSessionSummary[];
        };

        if (!alive) {
          return;
        }

        if (json.session) {
          setActiveSession(json.session);
        }

        if (json.sessions) {
          setSessions(json.sessions);
        }

        setPollError(null);
      } catch (error) {
        if (!alive) {
          return;
        }

        setPollError(error instanceof Error ? error.message : "Unable to refresh Live View.");
      }
    }

    const interval = window.setInterval(poll, 5000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [connection.projectId, connection.sessionId, connection.workspaceId]);

  const latestRecommendation = activeSession.recommendations[0] ?? null;
  const extensionConnected = activeSession.extensionConnection.status === "connected";
  const inspectedPages = useMemo(
    () => [...activeSession.report.inspectedPages].sort((a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt)),
    [activeSession.report.inspectedPages]
  );

  return (
    <div className="space-y-6">
      <ConnectionBeacon connection={connection} />

      <section className="floating-plane overflow-hidden rounded-[34px] p-6 xl:p-7">
        <div className="floating-wash rounded-[34px]" />
        <div className="relative">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <img
                  src="/logo/neroa.png?v=approved-blue-lockup-20260412"
                  alt="Neroa Live View"
                  className="h-10 w-auto"
                />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    Neroa Live View
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Inspect live localhost apps with Naroa in real time
                  </h1>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
                This workspace is now broadcasting an active Live View session. Load the unpacked
                browser extension, open its side panel, and then move through your localhost app.
                Naroa will inspect rendered DOM state, visible UI text, runtime errors, route
                transitions, and guardrails without relying on screenshots alone.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[24rem] xl:grid-cols-1">
              <div className="rounded-[26px] border border-slate-200/70 bg-white/82 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Active session
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">{connection.sessionId}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Bound to {connection.projectTitle}. The extension will only post into this
                  workspace session.
                </p>
                <div className="mt-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${connectionClasses(
                      activeSession.extensionConnection.status
                    )}`}
                  >
                    {extensionConnected ? "Extension connected" : "Waiting for extension"}
                  </span>
                </div>
              </div>
              <div className="rounded-[26px] border border-slate-200/70 bg-white/82 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Supported localhost targets
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {connection.allowedOrigins.map((origin) => (
                    <span
                      key={origin}
                      className="rounded-full border border-cyan-300/25 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700"
                    >
                      {origin}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200/75 bg-white/82 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Quick start
              </p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>1. Load <code>extensions/neroa-live-view</code> as an unpacked Chrome extension.</li>
                <li>2. Keep this Live View page open once so the extension can bind to the active session.</li>
                <li>3. Inspect any supported localhost tab and let Naroa produce QA findings automatically.</li>
              </ol>
            </div>
            <div className="rounded-[24px] border border-slate-200/75 bg-white/82 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Recording
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Recording is optional. When enabled from the extension panel, Live View stores
                timestamped action logs, page-by-page inspection history, and recording frames for
                major checkpoints.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200/75 bg-white/82 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Current recommendation
              </p>
              <p className="mt-3 text-sm font-medium text-slate-950">
                {latestRecommendation?.title ?? "Waiting for the first live inspection"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {latestRecommendation?.detail ??
                  "Move through the app once the extension is connected and Naroa will start recommending the next correct action."}
              </p>
              {latestRecommendation?.ctaHref ? (
                <Link href={latestRecommendation.ctaHref} className="button-secondary mt-4 inline-flex">
                  {latestRecommendation.ctaLabel ?? "Open next step"}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200/70 bg-white/70 px-4 py-4 shadow-[0_10px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Live View debug
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Dev-facing handshake diagnostics for the active workspace session.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${sessionClasses(
                activeSession.status
              )}`}
            >
              Session {activeSession.status}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${connectionClasses(
                activeSession.extensionConnection.status
              )}`}
            >
              {extensionConnected ? "Extension connected" : "Extension disconnected"}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[18px] border border-slate-200/70 bg-white/82 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Workspace / session
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {connection.workspaceId} / {connection.sessionId}
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200/70 bg-white/82 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Token suffix
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              ...{tokenSuffix(connection.token)}
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200/70 bg-white/82 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Last bind time
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {formatStamp(activeSession.extensionConnection.boundAt)}
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200/70 bg-white/82 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Last heartbeat
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {formatStamp(activeSession.extensionConnection.lastHeartbeatAt)}
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200/70 bg-white/82 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Last origin seen
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {activeSession.extensionConnection.lastSeenOrigin ?? "Waiting for extension"}
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200/70 bg-white/82 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Last message type
            </p>
            <p className="mt-2 text-sm font-semibold capitalize text-slate-950">
              {activeSession.extensionConnection.lastEvent ?? "Waiting"}
            </p>
          </div>
        </div>
      </section>

      {pollError ? (
        <div className="rounded-2xl border border-amber-300/50 bg-amber-50/90 px-4 py-3 text-sm text-amber-700">
          {pollError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <section className="floating-plane overflow-hidden rounded-[34px] p-6">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                  QA report
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Live walkthrough results
                </h2>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${statusClasses(
                  sessions[0]?.status ?? "active"
                )}`}
              >
                {activeSession.recordingEnabled ? "Recording on" : "Recording off"}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">{activeSession.report.summary}</p>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Pages inspected
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {activeSession.report.inspectedPages.length}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Findings
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {activeSession.findings.length}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Guardrails
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {activeSession.guardrails.length}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Last activity
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {formatStamp(activeSession.updatedAt)}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Extension heartbeat
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {formatStamp(activeSession.extensionConnection.lastHeartbeatAt)}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {extensionConnected
                    ? `Live View is attached from ${activeSession.extensionConnection.lastSeenOrigin ?? "the current app origin"}.`
                    : "The session exists, but no active extension heartbeat has reached Neroa yet."}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1fr,0.92fr]">
              <div className="rounded-[24px] border border-slate-200/75 bg-white/84 p-5">
                <h3 className="text-sm font-semibold text-slate-950">Inspected pages</h3>
                <div className="mt-4 space-y-3">
                  {inspectedPages.length > 0 ? (
                    inspectedPages.map((page) => (
                      <div
                        key={page.url}
                        className="rounded-[20px] border border-slate-200/70 bg-white/85 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-950">
                              {page.title || page.url}
                            </p>
                            <p className="mt-2 truncate text-xs text-slate-500">{page.url}</p>
                          </div>
                          <span className="text-xs text-slate-400">{formatStamp(page.visitedAt)}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                            {page.findings} findings
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                            {page.runtimeErrors} runtime errors
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-slate-600">
                      No live pages inspected yet. Once the extension binds to this session and you
                      move through localhost, the page-by-page history will appear here.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/75 bg-white/84 p-5">
                <h3 className="text-sm font-semibold text-slate-950">Walkthrough checklist</h3>
                <div className="mt-4 space-y-3">
                  {activeSession.walkthrough.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[20px] border border-slate-200/70 bg-white/85 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                            item.status === "passed"
                              ? "border-emerald-300/30 bg-emerald-50 text-emerald-700"
                              : item.status === "failed"
                                ? "border-rose-300/30 bg-rose-50 text-rose-700"
                                : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                      {item.notes ? <p className="mt-2 text-xs text-slate-500">{item.notes}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="floating-plane overflow-hidden rounded-[34px] p-6">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Findings
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                What Naroa is flagging
              </h2>
              <div className="mt-5 space-y-3">
                {activeSession.findings.length > 0 ? (
                  activeSession.findings.slice(0, 8).map((finding) => (
                    <div
                      key={finding.id}
                      className={`rounded-[22px] border px-4 py-4 ${severityClasses(finding.severity)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{finding.title}</p>
                          <p className="mt-2 text-sm leading-6 opacity-90">{finding.detail}</p>
                          <p className="mt-2 text-xs opacity-75">{finding.recommendation}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.16em] opacity-75">
                          {finding.severity}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-600">
                    No issues yet. Once the extension inspects live pages, findings will collect
                    here with pass/fail context and recommended fixes.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="floating-plane overflow-hidden rounded-[34px] p-6">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Session history
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Recent Live View sessions
              </h2>
              <div className="mt-5 space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-[22px] border border-slate-200/75 bg-white/84 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{session.projectTitle}</p>
                        <p className="mt-2 text-xs text-slate-500">{session.id}</p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusClasses(
                          session.status
                        )}`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                        {session.inspectedPagesCount} pages
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                        {session.findingsCount} findings
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                        {session.guardrailsCount} guardrails
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Updated {formatStamp(session.updatedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
