"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LiveViewConnectionPayload, LiveViewSession, LiveViewSessionSummary } from "@/lib/live-view/types";
import { requestBrowserRuntimeCommand } from "@/lib/browser-runtime-v2/client";
import type { BrowserRuntimeV2Action } from "@/lib/browser-runtime-v2/contracts";

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

function formatStamp(value: string | null, waitingLabel: string) {
  if (!value) {
    return waitingLabel;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return waitingLabel;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function humanizeTrigger(trigger: string | null | undefined) {
  if (!trigger) {
    return "background observation";
  }

  switch (trigger) {
    case "manual-refresh":
      return "manual refresh";
    case "page-load":
      return "page load";
    case "dom-change":
      return "DOM change";
    case "runtime-signal":
      return "runtime signal";
    default:
      return trigger.replace(/-/g, " ");
  }
}

function parseTimestamp(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function chooseLatestHistoricalInspection(
  session: LiveViewSession,
  currentExplicitTimestamp: number | null
) {
  const candidates = [
    session.inspectionState.latestObserved
      ? {
          source: "background" as const,
          inspection: session.inspectionState.latestObserved
        }
      : null,
    session.inspectionState.latestExplicit &&
    parseTimestamp(session.inspectionState.latestExplicit.capturedAt) !== currentExplicitTimestamp
      ? {
          source: "explicit" as const,
          inspection: session.inspectionState.latestExplicit
        }
      : null
  ].filter(Boolean) as Array<{
    source: "background" | "explicit";
    inspection: NonNullable<LiveViewSession["inspectionState"]["latestObserved"]>;
  }>;

  candidates.sort((left, right) => {
    return (
      (parseTimestamp(right.inspection.capturedAt) ?? 0) -
      (parseTimestamp(left.inspection.capturedAt) ?? 0)
    );
  });

  return candidates[0] ?? null;
}

function buildInspectionLayer(session: LiveViewSession) {
  const latestExplicit = session.inspectionState.latestExplicit;
  const bindTimestamp = parseTimestamp(session.extensionConnection.boundAt);
  const explicitTimestamp = parseTimestamp(latestExplicit?.capturedAt);
  const currentExplicit =
    latestExplicit &&
    explicitTimestamp !== null &&
    bindTimestamp !== null &&
    explicitTimestamp >= bindTimestamp
      ? latestExplicit
      : null;
  const latestHistorical = chooseLatestHistoricalInspection(
    session,
    currentExplicit ? explicitTimestamp : null
  );

  if (currentExplicit) {
    const recommendation = currentExplicit.recommendations[0] ?? null;

    return {
      statusLabel: "Explicit inspection ready",
      title: recommendation?.title ?? (currentExplicit.pageTitle || currentExplicit.pageUrl),
      detail:
        recommendation?.detail ??
        currentExplicit.summary ??
        "An explicit inspection result is current for this session.",
      ctaLabel: recommendation?.ctaLabel ?? null,
      ctaHref: recommendation?.ctaHref ?? null,
      findings: currentExplicit.findings,
      guardrails: currentExplicit.guardrails,
      summary:
        currentExplicit.summary ??
        "An explicit inspection run has been captured for the current session.",
      timestamp: currentExplicit.capturedAt,
      mode: "explicit" as const,
      history: latestHistorical
        ? {
            source: latestHistorical.source,
            title:
              latestHistorical.inspection.pageTitle || latestHistorical.inspection.pageUrl,
            detail:
              latestHistorical.source === "explicit"
                ? "A prior explicit inspection remains available here for comparison, but it is not the current result state."
                : `Latest passive observation came from ${latestHistorical.inspection.pageTitle || latestHistorical.inspection.pageUrl} via ${humanizeTrigger(latestHistorical.inspection.trigger)}. It remains historical context while the current explicit inspection stays primary.`,
            findings: latestHistorical.inspection.findings,
            guardrails: latestHistorical.inspection.guardrails,
            summary:
              latestHistorical.inspection.summary ??
              "A previous inspection snapshot remains available as historical context.",
            timestamp: latestHistorical.inspection.capturedAt
          }
        : null
    };
  }

  if (bindTimestamp !== null) {
    return {
      statusLabel: "Bound and ready",
      title: "Waiting for a new explicit inspection",
      detail:
        "This session is now bound and ready. Historical findings stay available below, but no new explicit inspection has been recorded since the latest bind.",
      ctaLabel: null,
      ctaHref: null,
      findings: [],
      guardrails: [],
      summary:
        "The browser session is connected. A new explicit inspection must run before current findings are promoted into the primary result lane.",
      timestamp: session.extensionConnection.boundAt,
      mode: "ready" as const,
      history: latestHistorical
        ? {
            source: latestHistorical.source,
            title:
              latestHistorical.inspection.pageTitle || latestHistorical.inspection.pageUrl,
            detail:
              latestHistorical.source === "explicit"
                ? "These findings came from a prior explicit inspection and remain historical until a new explicit inspection is recorded for this bind."
                : `Latest passive observation came from ${latestHistorical.inspection.pageTitle || latestHistorical.inspection.pageUrl} via ${humanizeTrigger(latestHistorical.inspection.trigger)}. It remains prior history until a new explicit inspection is promoted for this bound session.`,
            findings: latestHistorical.inspection.findings,
            guardrails: latestHistorical.inspection.guardrails,
            summary:
              latestHistorical.inspection.summary ??
              "Historical inspection context remains available below.",
            timestamp: latestHistorical.inspection.capturedAt
          }
        : null
    };
  }

  return {
    statusLabel: "Waiting for first explicit inspection",
    title: "No explicit inspection result yet",
    detail:
      "Bind the browser session first. Background observation may still collect, but current inspection results only appear after a supported explicit inspection trigger.",
    ctaLabel: null,
    ctaHref: null,
    findings: [],
    guardrails: [],
    summary:
      "No explicit inspection has been captured yet for this session.",
    timestamp: null,
    mode: "none" as const,
    history: latestHistorical
      ? {
          source: latestHistorical.source,
          title: latestHistorical.inspection.pageTitle || latestHistorical.inspection.pageUrl,
          detail:
            latestHistorical.source === "explicit"
              ? "A prior explicit inspection exists, but the current session has not recorded a new bind-linked explicit inspection yet."
              : `A prior passive observation from ${latestHistorical.inspection.pageTitle || latestHistorical.inspection.pageUrl} is available as history only.`,
          findings: latestHistorical.inspection.findings,
          guardrails: latestHistorical.inspection.guardrails,
          summary:
            latestHistorical.inspection.summary ??
            "Historical inspection context remains available below.",
          timestamp: latestHistorical.inspection.capturedAt
        }
      : null
  };
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
        data-runtime-target={JSON.stringify(connection.runtimeTarget)}
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
  const [runtimeActionBusy, setRuntimeActionBusy] = useState<BrowserRuntimeV2Action | null>(null);
  const [runtimeActionNotice, setRuntimeActionNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const refreshSession = useCallback(async () => {
    const response = await fetch(
      `/api/live-view/session?workspaceId=${encodeURIComponent(connection.workspaceId)}&projectId=${encodeURIComponent(connection.projectId)}&sessionId=${encodeURIComponent(connection.sessionId)}&liveViewToken=${encodeURIComponent(connection.token)}`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error("Unable to refresh Live View session.");
    }

    return (await response.json()) as {
      session?: LiveViewSession;
      sessions?: LiveViewSessionSummary[];
    };
  }, [connection.projectId, connection.sessionId, connection.token, connection.workspaceId]);

  useEffect(() => {
    let alive = true;

    async function poll() {
      try {
        const json = await refreshSession();

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
  }, [refreshSession]);

  const extensionConnected = activeSession.extensionConnection.status === "connected";
  const hasRealBind = Boolean(activeSession.extensionConnection.boundAt);
  const bindTimestamp = parseTimestamp(activeSession.extensionConnection.boundAt);
  const latestObservedTimestamp = parseTimestamp(activeSession.inspectionState.latestObserved?.capturedAt);
  const latestExplicitTimestamp = parseTimestamp(activeSession.inspectionState.latestExplicit?.capturedAt);
  const inspectionLayer = useMemo(() => buildInspectionLayer(activeSession), [activeSession]);
  const inspectedPages = useMemo(
    () => [...activeSession.report.inspectedPages].sort((a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt)),
    [activeSession.report.inspectedPages]
  );
  const hasCurrentInspectionContext = Boolean(
    activeSession.report.inspectedPages.length > 0 ||
      latestObservedTimestamp !== null ||
      latestExplicitTimestamp !== null
  );
  const runtimeTargetContextLabel =
    connection.runtimeTarget.environment === "local"
      ? "local runtime target"
      : connection.runtimeTarget.environment === "preview"
        ? "preview runtime target"
        : connection.runtimeTarget.environment === "staging"
          ? "staging runtime target"
          : "production runtime target";
  const canRunExplicitInspection = extensionConnected && hasCurrentInspectionContext;
  const recordingActive =
    activeSession.runtimeV2.recording.status === "capturing" || activeSession.recordingEnabled;
  const canRunRecordAction =
    extensionConnected &&
    Boolean(activeSession.runtimeV2.currentTarget?.url || hasCurrentInspectionContext);
  const canRunWalkthrough =
    extensionConnected &&
    Boolean(activeSession.runtimeV2.currentTarget?.url || hasCurrentInspectionContext);
  const canGenerateSop = Boolean(
    latestExplicitTimestamp !== null ||
      activeSession.runtimeV2.walkthrough.outputId ||
      activeSession.runtimeV2.recording.recordingId ||
      activeSession.runtimeV2.sopOutput.outputId
  );
  const inspectionActionLabel =
    inspectionLayer.mode === "explicit" ? "Run another explicit inspection" : "Run explicit inspection";
  const inspectionActionHelper = !extensionConnected
    ? "Reconnect the Neroa Live View extension first. Explicit inspection only runs once the session is actively connected."
    : canRunExplicitInspection
      ? hasRealBind
        ? `This promotes a current explicit inspection from the latest page Neroa observed on the current ${runtimeTargetContextLabel}.`
        : `This page is already being observed. Neroa can promote a current explicit inspection now while the first bind catches up on this ${runtimeTargetContextLabel}.`
      : !hasRealBind
        ? `Open a supported ${runtimeTargetContextLabel} page first so Neroa has current page context while the first bind is still catching up.`
        : `Open a supported ${runtimeTargetContextLabel} page first so Neroa has a current app tab to inspect when you request an explicit inspection.`;

  const runRuntimeAction = useCallback(
    async (
      command: Parameters<typeof requestBrowserRuntimeCommand>[0],
      buildSuccessMessage: (result: Awaited<ReturnType<typeof requestBrowserRuntimeCommand>>) => string
    ) => {
      setRuntimeActionBusy(command.action);
      setRuntimeActionNotice(null);

      try {
        const result = await requestBrowserRuntimeCommand({
          surface: "live_view",
          connectionOverride: {
            sessionId: connection.sessionId,
            token: connection.token,
            workspaceId: connection.workspaceId,
            projectId: connection.projectId,
            projectTitle: connection.projectTitle,
            bridgeOrigin: connection.bridgeOrigin,
            allowedOrigins: connection.allowedOrigins,
            runtimeTarget: connection.runtimeTarget
          },
          ...command
        });

        if (!result.ok) {
          throw new Error(result.error ?? "Unable to complete the browser runtime action.");
        }

        setRuntimeActionNotice({
          tone: "success",
          message: buildSuccessMessage(result)
        });

        window.setTimeout(() => {
          void refreshSession()
            .then((json) => {
              if (json.session) {
                setActiveSession(json.session);
              }

              if (json.sessions) {
                setSessions(json.sessions);
              }

              setPollError(null);
            })
            .catch((error) => {
              setPollError(error instanceof Error ? error.message : "Unable to refresh Live View.");
            });
        }, 900);
      } catch (error) {
        setRuntimeActionNotice({
          tone: "error",
          message:
            error instanceof Error ? error.message : "Unable to complete the browser runtime action."
        });
      } finally {
        setRuntimeActionBusy(null);
      }
    },
    [connection, refreshSession]
  );

  const handleExplicitInspection = useCallback(async () => {
    await runRuntimeAction(
      {
        action: "inspect.run"
      },
      (result) =>
        result.target?.url
          ? `Inspection requested for ${result.target.url}. Neroa will promote the current inspection result as soon as the active page responds.`
          : "Inspection requested. Neroa will promote the current inspection result as soon as the active page responds."
    );
  }, [runRuntimeAction]);

  const handleRecordingToggle = useCallback(async () => {
    await runRuntimeAction(
      {
        action: recordingActive ? "record.stop" : "record.start"
      },
      (result) =>
        result.notice ??
        (recordingActive
          ? "Recording foundation stopped for the current browser target."
          : "Recording foundation started for the current browser target.")
    );
  }, [recordingActive, runRuntimeAction]);

  const handleWalkthrough = useCallback(async () => {
    await runRuntimeAction(
      {
        action: "ai-walkthrough.start",
        payload: {
          intent: "Live View browser walkthrough"
        }
      },
      (result) =>
        result.notice ?? "AI walkthrough foundation completed for the current browser target."
    );
  }, [runRuntimeAction]);

  const handleSopOutput = useCallback(async () => {
    await runRuntimeAction(
      {
        action: "sop-output.generate",
        payload: {
          source: "inspection"
        }
      },
      (result) =>
        result.notice ?? "SOP / result output generated for the current browser session."
    );
  }, [runRuntimeAction]);

  return (
    <div className="space-y-6">
      <ConnectionBeacon connection={connection} />

      <section className="floating-plane overflow-hidden rounded-[34px] p-6 xl:p-7">
        <div className="floating-wash rounded-[34px]" />
        <div className="relative">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                  Neroa
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    Neroa Live View
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Inspect live runtime targets with Neroa in real time
                  </h1>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
                This workspace is now broadcasting an active Live View session. Load the unpacked
                browser extension, open its side panel, and then move through the current local,
                preview, or production target. Neroa will inspect rendered DOM state, visible UI
                text, runtime errors, route transitions, and guardrails without relying on
                screenshots alone.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[24rem] xl:grid-cols-1">
              <div className="rounded-[26px] border border-slate-200/70 bg-white/82 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Active session
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">{connection.sessionId}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {hasRealBind
                    ? `Bound to ${connection.projectTitle}. The extension will only post into this workspace session.`
                    : `This session is reserved for ${connection.projectTitle}. Browser observation can still arrive from the current ${runtimeTargetContextLabel} before the first real bind is recorded.`}
                </p>
                <div className="mt-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${connectionClasses(
                      activeSession.extensionConnection.status
                    )}`}
                  >
                    {hasRealBind
                      ? "Extension bound"
                      : extensionConnected
                        ? "Inspect-only heartbeat"
                        : "Waiting for extension"}
                  </span>
                </div>
              </div>
              <div className="rounded-[26px] border border-slate-200/70 bg-white/82 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Runtime target
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  {connection.runtimeTarget.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Primary origin {connection.runtimeTarget.origin}
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
                <li>3. Background observation starts automatically, but explicit inspection only becomes current after a supported inspection trigger on the current runtime target.</li>
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
                Inspection status
              </p>
              <p className="mt-3 text-sm font-medium text-slate-950">
                {inspectionLayer.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {inspectionLayer.detail}
              </p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {inspectionLayer.statusLabel}
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  className="button-primary inline-flex w-full justify-center sm:w-auto"
                  disabled={!canRunExplicitInspection || runtimeActionBusy !== null}
                  onClick={handleExplicitInspection}
                >
                  {runtimeActionBusy === "inspect.run"
                    ? "Requesting inspection..."
                    : inspectionActionLabel}
                </button>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="button-secondary inline-flex"
                    disabled={!canRunRecordAction || runtimeActionBusy !== null}
                    onClick={handleRecordingToggle}
                  >
                    {runtimeActionBusy === (recordingActive ? "record.stop" : "record.start")
                      ? recordingActive
                        ? "Stopping..."
                        : "Starting..."
                      : recordingActive
                        ? "Stop Record"
                        : "Start Record"}
                  </button>
                  <button
                    type="button"
                    className="button-secondary inline-flex"
                    disabled={!canRunWalkthrough || runtimeActionBusy !== null}
                    onClick={handleWalkthrough}
                  >
                    {runtimeActionBusy === "ai-walkthrough.start"
                      ? "Running..."
                      : "AI Walkthrough"}
                  </button>
                  <button
                    type="button"
                    className="button-secondary inline-flex"
                    disabled={!canGenerateSop || runtimeActionBusy !== null}
                    onClick={handleSopOutput}
                  >
                    {runtimeActionBusy === "sop-output.generate"
                      ? "Generating..."
                      : "Generate SOP"}
                  </button>
                </div>
                <p className="text-xs leading-6 text-slate-500">{inspectionActionHelper}</p>
                {runtimeActionNotice ? (
                  <p
                    className={`rounded-[18px] border px-3 py-2 text-xs leading-6 ${
                      runtimeActionNotice.tone === "success"
                        ? "border-emerald-300/35 bg-emerald-50 text-emerald-700"
                        : "border-rose-300/35 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {runtimeActionNotice.message}
                  </p>
                ) : null}
              </div>
              {inspectionLayer.ctaHref ? (
                <Link href={inspectionLayer.ctaHref} className="button-secondary mt-4 inline-flex">
                  {inspectionLayer.ctaLabel ?? "Open next step"}
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
              {hasRealBind
                ? "Extension bound"
                : extensionConnected
                  ? "Inspect-only heartbeat"
                  : "Extension disconnected"}
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
              {formatStamp(activeSession.extensionConnection.boundAt, "Waiting for first bind")}
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200/70 bg-white/82 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Last heartbeat
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {formatStamp(activeSession.extensionConnection.lastHeartbeatAt, "Waiting for first heartbeat")}
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
              Last connection signal
            </p>
            <p className="mt-2 text-sm font-semibold capitalize text-slate-950">
              {activeSession.extensionConnection.lastEvent ?? "Waiting"}
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200/70 bg-white/82 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Inspection layer
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{inspectionLayer.statusLabel}</p>
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
                  {inspectionLayer.mode === "explicit" ? "QA report" : "Session readiness"}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  {inspectionLayer.mode === "explicit"
                    ? "Live walkthrough results"
                    : "Current session readiness and prior walkthrough history"}
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

            <p className="mt-4 text-sm leading-7 text-slate-600">
              {inspectionLayer.mode === "explicit"
                ? inspectionLayer.summary
                : inspectionLayer.summary}
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {inspectionLayer.mode === "explicit" ? "Pages inspected" : "Historical pages"}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {activeSession.report.inspectedPages.length}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {inspectionLayer.mode === "explicit" ? "Findings" : "Historical findings"}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {activeSession.findings.length}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {inspectionLayer.mode === "explicit" ? "Guardrails" : "Historical guardrails"}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {activeSession.guardrails.length}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {inspectionLayer.mode === "explicit" ? "Last activity" : "History updated"}
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {formatStamp(activeSession.updatedAt, "Waiting for first update")}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/75 bg-white/82 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Extension heartbeat
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {formatStamp(activeSession.extensionConnection.lastHeartbeatAt, "Waiting for first heartbeat")}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {hasRealBind
                    ? `Live View is bound from ${activeSession.extensionConnection.lastSeenOrigin ?? "the current app origin"}.`
                    : extensionConnected
                      ? "Browser observation is arriving, but the first real bind has not been recorded yet."
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
                            <span className="text-xs text-slate-400">
                              {formatStamp(page.visitedAt, "Waiting for page visit")}
                            </span>
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
                      move through the runtime target, the page-by-page history will appear here.
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
                {inspectionLayer.mode === "explicit" ? "Current explicit inspection" : "Findings history"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {inspectionLayer.mode === "explicit"
                  ? "What the current inspection is flagging"
                  : "Previous findings"}
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {inspectionLayer.mode === "explicit"
                  ? "These findings belong to the current explicit inspection run."
                  : inspectionLayer.history
                    ? inspectionLayer.history.detail
                    : "Historical findings will appear here after background observation or an explicit inspection run occurs."}
              </p>
              {inspectionLayer.history?.timestamp ? (
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                  Last historical snapshot {formatStamp(inspectionLayer.history.timestamp, "Unavailable")}
                </p>
              ) : null}
              <div className="mt-5 space-y-3">
                {(inspectionLayer.mode === "explicit"
                  ? inspectionLayer.findings
                  : inspectionLayer.history?.findings ?? []
                ).length > 0 ? (
                  (inspectionLayer.mode === "explicit"
                    ? inspectionLayer.findings
                    : inspectionLayer.history?.findings ?? []
                  )
                    .slice(0, 8)
                    .map((finding) => (
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
                    {inspectionLayer.mode === "explicit"
                      ? "The current explicit inspection has not flagged any issues yet."
                      : "No historical findings are visible yet. Bind the browser session first, then run an explicit inspection when you want current findings promoted here."}
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
                      Updated {formatStamp(session.updatedAt, "Waiting for update")}
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
