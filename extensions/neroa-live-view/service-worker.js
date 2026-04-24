importScripts("qc-library-client.js");

var STORAGE_KEY = "neroa-live-view-state";

function getDefaultState() {
  return {
    connection: null,
    connectionSyncStatus: "disconnected",
    connectionSyncedAt: null,
    recordingEnabled: false,
    latestInspection: null,
    latestExplicitInspection: null,
    inspectableTarget: null,
    lastError: null,
    activity: [],
    qcPageArtifacts: {}
  };
}

async function readState() {
  var stored = await chrome.storage.local.get(STORAGE_KEY);
  return Object.assign(getDefaultState(), stored[STORAGE_KEY] || {});
}

async function writeState(partial) {
  var current = await readState();
  var next = Object.assign({}, current, partial);
  await chrome.storage.local.set({
    [STORAGE_KEY]: next
  });
  return next;
}

async function captureRecordingFrame(windowId) {
  try {
    return await chrome.tabs.captureVisibleTab(windowId, {
      format: "png"
    });
  } catch {
    return null;
  }
}

function trimActivity(items) {
  return items.slice(Math.max(items.length - 80, 0));
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildPageAssociation(page) {
  var pathname = page.pathname || null;
  var pageLabel = (page.title && page.title.trim()) || pathname || page.url;
  var routeKey = slugify(pathname || pageLabel || page.url) || "page";

  return {
    url: page.url,
    pathname: pathname,
    title: page.title || null,
    pageLabel: pageLabel,
    routeKey: routeKey
  };
}

function buildQcPageKey(connection, page) {
  return connection.sessionId + "::" + page.routeKey;
}

function cloneQcPageArtifacts(state) {
  return Object.assign({}, (state && state.qcPageArtifacts) || {});
}

function readQcPageArtifact(state, pageKey) {
  var artifacts = cloneQcPageArtifacts(state);
  return artifacts[pageKey] || null;
}

function writeQcPageArtifact(state, pageKey, nextValue) {
  var artifacts = cloneQcPageArtifacts(state);

  if (nextValue) {
    artifacts[pageKey] = nextValue;
  } else {
    delete artifacts[pageKey];
  }

  return artifacts;
}

function countSeverity(items, severity) {
  return (items || []).filter(function bySeverity(item) {
    return item && item.severity === severity;
  }).length;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

function deriveQcOutcome(findings, guardrails) {
  if ((findings || []).some(function hasCritical(item) {
    return item && item.severity === "critical";
  })) {
    return "fail";
  }

  if (
    (findings || []).some(function hasWarning(item) {
      return item && item.severity === "warning";
    }) ||
    (guardrails || []).length > 0
  ) {
    return "warning";
  }

  return "pass";
}

var browserRuntimeLocalOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002"
];

function normalizeOrigin(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(String(value)).origin;
  } catch {
    return null;
  }
}

function uniqueOrigins(values) {
  return Array.from(
    new Set(
      (values || []).filter(function hasValue(value) {
        return Boolean(value);
      })
    )
  );
}

function buildRuntimeTargetFromOrigin(origin, allowedOrigins, existingTarget) {
  var normalizedOrigin = normalizeOrigin(origin) || browserRuntimeLocalOrigins[0];
  var parsed = new URL(normalizedOrigin);
  var host = parsed.hostname;
  var isLocal = browserRuntimeLocalOrigins.indexOf(normalizedOrigin) !== -1;
  var isNetlify = /\.netlify\.(app|live)$/i.test(host);
  var environment = isLocal
    ? "local"
    : /(^|\.)staging([.-]|$)/i.test(host)
      ? "staging"
      : isNetlify || /(^|\.)preview([.-]|$)/i.test(host) || host.indexOf("--") !== -1
        ? "preview"
        : "production";
  var provider = isLocal ? "local" : isNetlify ? "netlify" : "custom";

  return {
    id:
      (existingTarget && existingTarget.id) ||
      provider + ":" + environment + ":" + parsed.host,
    environment: environment,
    provider: provider,
    origin: normalizedOrigin,
    host: parsed.host,
    label:
      (existingTarget && existingTarget.label) ||
      (environment === "local"
        ? "Local runtime target"
        : environment === "preview" && provider === "netlify"
          ? "Netlify preview target"
          : environment === "preview"
            ? "Preview runtime target"
            : environment === "staging"
              ? "Staging runtime target"
              : provider === "netlify"
                ? "Netlify production target"
                : "Production runtime target"),
    siteOrigin:
      existingTarget && existingTarget.siteOrigin ? normalizeOrigin(existingTarget.siteOrigin) : null,
    allowedOrigins: uniqueOrigins(
      environment === "local"
        ? browserRuntimeLocalOrigins.concat(allowedOrigins || [], [normalizedOrigin])
        : [normalizedOrigin].concat(allowedOrigins || [])
    ),
    isEphemeral:
      typeof (existingTarget && existingTarget.isEphemeral) === "boolean"
        ? existingTarget.isEphemeral
        : environment === "preview"
  };
}

function inspectionAllowedOrigins(connection) {
  if (!connection) {
    return [];
  }

  if (connection.runtimeTarget && connection.runtimeTarget.environment === "local") {
    return uniqueOrigins(
      browserRuntimeLocalOrigins.concat(
        connection.runtimeTarget.allowedOrigins || [],
        connection.allowedOrigins || [],
        [connection.runtimeTarget.origin]
      )
    );
  }

  if (connection.runtimeTarget && connection.runtimeTarget.origin) {
    return [connection.runtimeTarget.origin];
  }

  return uniqueOrigins(connection.allowedOrigins || []);
}

function isInspectableOriginForConnection(connection, origin) {
  return inspectionAllowedOrigins(connection).indexOf(origin) !== -1;
}

function isInspectableTabUrl(connection, tabUrl) {
  if (!connection || !tabUrl) {
    return false;
  }

  try {
    var parsed = new URL(tabUrl);
    return (
      isInspectableOriginForConnection(connection, parsed.origin) &&
      parsed.pathname.indexOf("/live-view") === -1
    );
  } catch {
    return false;
  }
}

function buildInspectableTarget(connection, tab) {
  if (!tab || typeof tab.id !== "number" || !isInspectableTabUrl(connection, tab.url)) {
    return null;
  }

  return {
    tabId: tab.id,
    windowId: typeof tab.windowId === "number" ? tab.windowId : null,
    url: tab.url,
    title: tab.title || null,
    updatedAt: new Date().toISOString()
  };
}

function mapInspectionFinding(item) {
  return {
    id: isUuid(item.id) ? item.id : undefined,
    severity: item.severity,
    category: item.category,
    status: "open",
    title: item.title,
    detail: item.detail,
    recommendation: item.recommendation || null
  };
}

function mapGuardrail(item) {
  return {
    id: isUuid(item.id) ? item.id : undefined,
    severity: item.severity,
    title: item.title,
    detail: item.detail,
    recommendation: item.recommendation || null
  };
}

function getQcClient() {
  if (!self.naroaQcLibraryClient) {
    throw new Error("The Neroa QC bridge client is not available in this extension build.");
  }

  return self.naroaQcLibraryClient;
}

function buildQcTags() {
  return ["browser-runtime", "live-view"];
}

function resolveInspectionMode(trigger) {
  return trigger === "manual-refresh" ? "explicit" : "background";
}

function normalizeConnectionOverride(connectionOverride) {
  if (
    !connectionOverride ||
    !connectionOverride.sessionId ||
    !connectionOverride.token ||
    !connectionOverride.workspaceId ||
    !connectionOverride.projectId ||
    !connectionOverride.bridgeOrigin
  ) {
    return null;
  }

  return {
    sessionId: connectionOverride.sessionId,
    token: connectionOverride.token,
    workspaceId: connectionOverride.workspaceId,
    projectId: connectionOverride.projectId,
    projectTitle: connectionOverride.projectTitle || "Neroa Live View",
    bridgeOrigin: connectionOverride.bridgeOrigin,
    allowedOrigins: Array.isArray(connectionOverride.allowedOrigins)
      ? connectionOverride.allowedOrigins
      : [],
    runtimeTarget: buildRuntimeTargetFromOrigin(
      connectionOverride.runtimeTarget && connectionOverride.runtimeTarget.origin
        ? connectionOverride.runtimeTarget.origin
        : connectionOverride.bridgeOrigin,
      Array.isArray(connectionOverride.allowedOrigins) ? connectionOverride.allowedOrigins : [],
      connectionOverride.runtimeTarget || null
    )
  };
}

function buildRuntimeV2CommandSuccess(action, payload) {
  return Object.assign(
    {
      ok: true,
      action: action,
      error: null
    },
    payload || {}
  );
}

function buildRuntimeV2CommandError(action, error, payload) {
  return Object.assign(
    {
      ok: false,
      action: action,
      error: normalizeBridgeError(error, "Unable to complete the Browser Runtime V2 action.")
    },
    payload || {}
  );
}

function buildLiveViewUrl(connection, launchAt) {
  return (
    ((connection.runtimeTarget && connection.runtimeTarget.origin) || connection.bridgeOrigin) +
    "/workspace/" +
    connection.workspaceId +
    "/project/" +
    connection.projectId +
    "/live-view?sessionId=" +
    encodeURIComponent(connection.sessionId) +
    "&liveViewToken=" +
    encodeURIComponent(connection.token) +
    "&launchAt=" +
    encodeURIComponent(launchAt || new Date().toISOString())
  );
}

function buildPageAssociationFromTarget(target) {
  try {
    var parsed = new URL(target.url);
    return buildPageAssociation({
      url: target.url,
      pathname: parsed.pathname || null,
      title: target.title || null,
      pageLabel: target.title || parsed.pathname || target.url
    });
  } catch {
    return buildPageAssociation({
      url: target.url,
      pathname: null,
      title: target.title || null,
      pageLabel: target.title || target.url
    });
  }
}

async function updateRuntimeV2State(connection, patch) {
  var response = await fetch(connection.bridgeOrigin + "/api/live-view/runtime-v2/state", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + connection.token
    },
    body: JSON.stringify(patch)
  });
  var json = await response.json();

  if (!response.ok) {
    throw new Error(
      json && json.error ? json.error : "Unable to update Browser Runtime V2 session state."
    );
  }

  return json;
}

async function writeRuntimeV2Output(connection, input) {
  var response = await fetch(connection.bridgeOrigin + "/api/live-view/runtime-v2/output", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + connection.token
    },
    body: JSON.stringify(input)
  });
  var json = await response.json();

  if (!response.ok) {
    throw new Error(
      json && json.error ? json.error : "Unable to write the Browser Runtime V2 output."
    );
  }

  return json;
}

function toErrorMessage(error, fallback) {
  if (error && error.message) {
    return error.message;
  }

  return fallback;
}

function normalizeBridgeError(error, fallback) {
  var message = toErrorMessage(error, fallback);

  if (/message port closed before a response was received/i.test(message)) {
    return "The Neroa Live View extension lost the response channel before the browser command completed.";
  }

  if (/receiving end does not exist/i.test(message)) {
    return "Neroa could not reach the current browser tab. Reload the active runtime target page so the Live View bridge can reconnect.";
  }

  if (/No tab with id/i.test(message)) {
    return "The browser tab Neroa was tracking is no longer available. Open the target runtime page again and retry.";
  }

  return message;
}

function respondAsync(sendResponse, task, fallback) {
  Promise.resolve()
    .then(task)
    .then(function onResolved(payload) {
      sendResponse(
        payload || {
          ok: true
        }
      );
    })
    .catch(function onRejected(error) {
      sendResponse({
        ok: false,
        error: normalizeBridgeError(error, fallback || "Unable to complete the browser command.")
      });
    });

  return true;
}

async function resolveInspectableTarget(connection, state, options) {
  if (!connection) {
    return null;
  }

  var preferredOrigin = null;
  try {
    preferredOrigin = new URL(
      (connection.runtimeTarget && connection.runtimeTarget.origin) || connection.bridgeOrigin
    ).origin;
  } catch {
    preferredOrigin = null;
  }

  var preferredWindowId =
    options && typeof options.preferredWindowId === "number"
      ? options.preferredWindowId
      : null;
  var currentTarget = state && state.inspectableTarget;

  if (currentTarget && typeof currentTarget.tabId === "number") {
    try {
      var existingTab = await chrome.tabs.get(currentTarget.tabId);
      var validatedTarget = buildInspectableTarget(connection, existingTab);

      if (
        validatedTarget &&
        (!preferredOrigin ||
          (function matchesCurrentTargetOrigin() {
            try {
              return new URL(validatedTarget.url).origin === preferredOrigin;
            } catch {
              return false;
            }
          })())
      ) {
        return validatedTarget;
      }
    } catch {
      // Fall through to a broader tab query below.
    }
  }

  var tabs = await chrome.tabs.query({});
  var bestTarget = null;
  var bestScore = -1;

  for (var index = 0; index < tabs.length; index += 1) {
    var tab = tabs[index];
    var candidate = buildInspectableTarget(connection, tab);

    if (!candidate) {
      continue;
    }

    var candidateOrigin = null;
    try {
      candidateOrigin = new URL(candidate.url).origin;
    } catch {
      candidateOrigin = null;
    }

    var score = 0;

    if (preferredOrigin && candidateOrigin === preferredOrigin) {
      score += 100;
    }

    if (preferredWindowId !== null && tab.windowId === preferredWindowId) {
      score += 40;
    }

    if (currentTarget && currentTarget.url && currentTarget.url === candidate.url) {
      score += 20;
    }

    if (tab.active) {
      score += 10;
    }

    if (typeof tab.lastAccessed === "number") {
      score += Math.floor(tab.lastAccessed / 1000000000);
    }

    if (score > bestScore) {
      bestScore = score;
      bestTarget = candidate;
    }
  }

  return bestTarget;
}

async function sendMessageToInspectableTarget(target, message, fallback) {
  try {
    return await chrome.tabs.sendMessage(target.tabId, message);
  } catch (error) {
    throw new Error(normalizeBridgeError(error, fallback));
  }
}

async function ensureQcReportRunning(connection, state, page) {
  var qcClient = getQcClient();
  var pageKey = buildQcPageKey(connection, page);
  var artifact = readQcPageArtifact(state, pageKey) || {
    page: page,
    reportId: null,
    recordingId: null,
    recordingStartedAt: null,
    recordingStoragePath: null
  };
  var payload = {
    id: artifact.reportId || undefined,
    lifecycle: "running",
    outcome: null,
    summary: "Browser QC inspection is running for this page.",
    internalSummary: "Live View inspection started from the browser runtime.",
    customerSummary: null,
    page: page,
    findings: [],
    findingsCount: 0,
    warningsCount: 0,
    errorsCount: 0,
    guardrailsCount: 0,
    guardrails: [],
    linkedRecordingId: artifact.recordingId || null,
    statusReason: null,
    tags: buildQcTags()
  };
  var result = artifact.reportId
    ? await qcClient.updateQcReport(connection, payload)
    : await qcClient.createQcReport(connection, payload);

  return {
    pageKey: pageKey,
    artifact: Object.assign({}, artifact, {
      page: page,
      reportId: result.report.id
    }),
    report: result.report
  };
}

async function ensureQcRecordingActive(connection, state, page, reportId) {
  var qcClient = getQcClient();
  var pageKey = buildQcPageKey(connection, page);
  var artifact = readQcPageArtifact(state, pageKey) || {
    page: page,
    reportId: reportId || null,
    recordingId: null,
    recordingStartedAt: null,
    recordingStoragePath: null
  };
  var startedAt = artifact.recordingStartedAt || new Date().toISOString();
  var payload = {
    id: artifact.recordingId || undefined,
    lifecycle: artifact.recordingId ? "capturing" : "queued",
    summary: artifact.recordingId
      ? "Browser recording capture is active for this page."
      : "Browser recording capture has been initialized for this page.",
    page: page,
    linkedReportId: reportId || artifact.reportId || null,
    recordedAt: startedAt,
    durationMs: artifact.recordingStartedAt
      ? Math.max(Date.now() - Date.parse(startedAt), 0)
      : 0,
    fileSizeBytes: null,
    mimeType: artifact.recordingStoragePath ? "image/png" : null,
    storagePath: artifact.recordingStoragePath || null,
    thumbnailPath: artifact.recordingStoragePath || null,
    statusReason: null,
    tags: buildQcTags().concat(["recording"])
  };
  var result = artifact.recordingId
    ? await qcClient.updateQcRecording(connection, payload)
    : await qcClient.createQcRecording(connection, payload);

  return {
    pageKey: pageKey,
    artifact: Object.assign({}, artifact, {
      page: page,
      reportId: reportId || artifact.reportId || null,
      recordingId: result.recording.id,
      recordingStartedAt: startedAt
    }),
    recording: result.recording
  };
}

async function finalizeActiveQcRecordings(state) {
  var connection = state.connection;

  if (!connection) {
    return cloneQcPageArtifacts(state);
  }

  var qcClient = getQcClient();
  var artifacts = cloneQcPageArtifacts(state);
  var sessionPrefix = connection.sessionId + "::";
  var now = new Date().toISOString();
  var keys = Object.keys(artifacts).filter(function matchSession(key) {
    return key.indexOf(sessionPrefix) === 0 && artifacts[key] && artifacts[key].recordingId;
  });

  for (var index = 0; index < keys.length; index += 1) {
    var key = keys[index];
    var artifact = artifacts[key];
    var durationMs = artifact.recordingStartedAt
      ? Math.max(Date.now() - Date.parse(artifact.recordingStartedAt), 0)
      : null;
    var hasStoredFrame = Boolean(artifact.recordingStoragePath);
    var lifecycle = hasStoredFrame ? "ready" : "failed";
    var summary = hasStoredFrame
      ? "Browser recording capture metadata is ready for this page."
      : "Recording ended before any browser frame was captured.";
    var statusReason = hasStoredFrame
      ? "Stored as frame metadata until the full binary upload pipeline is added."
      : "No captured frame was stored for this recording session.";

    await qcClient.updateQcRecording(connection, {
      id: artifact.recordingId,
      lifecycle: lifecycle,
      summary: summary,
      page: artifact.page,
      linkedReportId: artifact.reportId || null,
      recordedAt: artifact.recordingStartedAt || now,
      durationMs: durationMs,
      fileSizeBytes: null,
      mimeType: hasStoredFrame ? "image/png" : null,
      storagePath: artifact.recordingStoragePath || null,
      thumbnailPath: artifact.recordingStoragePath || null,
      statusReason: statusReason,
      tags: buildQcTags().concat(["recording"])
    });

    artifacts[key] = Object.assign({}, artifact, {
      recordingId: null,
      recordingStartedAt: null,
      recordingStoragePath: null
    });
  }

  return artifacts;
}

async function bindConnectionToBackend(connection, tabUrl, pageTitle, source) {
  var response = await fetch(connection.bridgeOrigin + "/api/live-view/bind", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + connection.token
    },
    body: JSON.stringify({
      tabUrl: tabUrl,
      pageTitle: pageTitle || null,
      origin: new URL(tabUrl).origin,
      source: source
    })
  });
  var json = await response.json();
  if (!response.ok) {
    throw new Error(json && json.error ? json.error : "Unable to bind the Live View session.");
  }

  return json;
}

async function inspectLiveView(payload, sender) {
  var state = await readState();
  var connection = state.connection;

  if (!connection || !sender.tab || !sender.tab.url) {
    return {
      ok: false,
      error: "No active Neroa Live View session is connected yet."
    };
  }

  var currentOrigin = new URL(sender.tab.url).origin;
  if (!isInspectableOriginForConnection(connection, currentOrigin)) {
    return {
      ok: false,
      error: "This tab is outside the supported runtime target for the current session."
    };
  }

  var page = buildPageAssociation(payload.snapshot.page);
  var runningReport;

  try {
    runningReport = await ensureQcReportRunning(connection, state, page);
  } catch (error) {
    await writeState({
      lastError:
        error && error.message
          ? error.message
          : "Unable to create the browser QC report."
    });
    return {
      ok: false,
      error:
        error && error.message
          ? error.message
          : "Unable to create the browser QC report."
    };
  }

  var artifact = runningReport.artifact;
  var qcPageArtifacts = writeQcPageArtifact(state, runningReport.pageKey, artifact);

  if (state.recordingEnabled) {
    try {
      var activeRecording = await ensureQcRecordingActive(connection, {
        qcPageArtifacts: qcPageArtifacts
      }, page, artifact.reportId);
      artifact = activeRecording.artifact;
      qcPageArtifacts = writeQcPageArtifact(state, activeRecording.pageKey, artifact);
    } catch (error) {
      await writeState({
        qcPageArtifacts: qcPageArtifacts,
        lastError:
          error && error.message
            ? error.message
            : "Unable to initialize browser recording metadata."
      });
      return {
        ok: false,
        error:
          error && error.message
            ? error.message
            : "Unable to initialize browser recording metadata."
      };
    }
  }

  var screenshotDataUrl = null;
  if (state.recordingEnabled && typeof sender.tab.windowId === "number") {
    screenshotDataUrl = await captureRecordingFrame(sender.tab.windowId);
  }

  try {
    var response = await fetch(connection.bridgeOrigin + "/api/live-view/inspect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + connection.token
      },
      body: JSON.stringify({
        snapshot: payload.snapshot,
        actionLogs: payload.actionLogs || [],
        recordingEnabled: state.recordingEnabled,
        screenshotDataUrl: screenshotDataUrl
      })
    });
    var json = await response.json();
    if (!response.ok) {
      throw new Error(json && json.error ? json.error : "Live View inspection failed.");
    }

    var findings = (json.findings || []).map(mapInspectionFinding);
    var guardrails = (json.guardrails || []).map(mapGuardrail);
    var outcome = deriveQcOutcome(json.findings || [], json.guardrails || []);
    var inspectionMode = resolveInspectionMode(payload.snapshot.trigger);
    var updatedRecording = null;

    if (state.recordingEnabled && artifact.recordingId) {
      updatedRecording = await getQcClient().updateQcRecording(connection, {
        id: artifact.recordingId,
        lifecycle: json.snapshot && json.snapshot.screenshotPath ? "capturing" : "queued",
        summary: json.snapshot && json.snapshot.screenshotPath
          ? "Browser recording capture is storing live frame metadata for this page."
          : "Browser recording capture is active and waiting for the first stored frame.",
        page: page,
        linkedReportId: artifact.reportId || null,
        recordedAt:
          artifact.recordingStartedAt ||
          (json.snapshot && json.snapshot.capturedAt) ||
          new Date().toISOString(),
        durationMs: artifact.recordingStartedAt
          ? Math.max(Date.now() - Date.parse(artifact.recordingStartedAt), 0)
          : 0,
        fileSizeBytes: null,
        mimeType: json.snapshot && json.snapshot.screenshotPath ? "image/png" : null,
        storagePath:
          (json.snapshot && json.snapshot.screenshotPath) ||
          artifact.recordingStoragePath ||
          null,
        thumbnailPath:
          (json.snapshot && json.snapshot.screenshotPath) ||
          artifact.recordingStoragePath ||
          null,
        statusReason:
          json.snapshot && json.snapshot.screenshotPath
            ? "Frame metadata is being captured while full recording upload remains deferred."
            : null,
        tags: buildQcTags().concat(["recording"])
      });
      artifact = Object.assign({}, artifact, {
        recordingId: updatedRecording.recording.id,
        recordingStoragePath:
          (json.snapshot && json.snapshot.screenshotPath) ||
          artifact.recordingStoragePath ||
          null
      });
      qcPageArtifacts = writeQcPageArtifact(state, runningReport.pageKey, artifact);
    }

    var updatedReport = await getQcClient().updateQcReport(connection, {
      id: artifact.reportId,
      lifecycle: "ready",
      outcome: outcome,
      summary: json.summary || "Browser QC completed for this page.",
      internalSummary: json.summary || null,
      customerSummary: null,
      page: page,
      findings: findings,
      findingsCount: findings.length,
      warningsCount: countSeverity(findings, "warning"),
      errorsCount: countSeverity(findings, "critical"),
      guardrailsCount: guardrails.length,
      guardrails: guardrails,
      linkedRecordingId: artifact.recordingId || null,
      statusReason: null,
      tags: buildQcTags()
    });

    if (artifact.recordingId) {
      await getQcClient().attachRecordingToReport(connection, {
        reportId: updatedReport.report.id,
        recordingId: artifact.recordingId
      });
    }

    var inspectionRecord = {
      mode: inspectionMode,
      inspectedAt: new Date().toISOString(),
      trigger: payload.snapshot.trigger,
      tabId: sender.tab.id,
      pageUrl: payload.snapshot.page.url,
      pageTitle: payload.snapshot.page.title,
      summary: json.summary || null,
      findings: json.findings || [],
      guardrails: json.guardrails || [],
      recommendations: json.recommendations || [],
      qcAssets: {
        reportId: updatedReport.report.id,
        recordingId: artifact.recordingId || null
      }
    };

    var inspectableTarget = buildInspectableTarget(connection, sender.tab);

    await writeState({
      latestInspection: inspectionRecord,
      latestExplicitInspection:
        inspectionMode === "explicit"
          ? inspectionRecord
          : state.latestExplicitInspection || null,
      inspectableTarget: inspectableTarget || state.inspectableTarget || null,
      connectionSyncStatus: "connected",
      connectionSyncedAt: new Date().toISOString(),
      lastError: null,
      qcPageArtifacts: qcPageArtifacts,
      activity: trimActivity(
        (state.activity || []).concat([
          {
            timestamp: new Date().toISOString(),
            label: "Inspected " + payload.snapshot.page.pathname,
            url: payload.snapshot.page.url
          }
        ])
      )
    });

    return {
      ok: true,
      inspection: json,
      qc: {
        reportId: updatedReport.report.id,
        recordingId: artifact.recordingId || null
      }
    };
  } catch (error) {
    try {
      await getQcClient().updateQcReport(connection, {
        id: artifact.reportId,
        lifecycle: "failed",
        outcome: null,
        summary: "Browser QC inspection could not complete.",
        internalSummary:
          error && error.message ? error.message : "Live View inspection failed.",
        customerSummary: null,
        page: page,
        findings: [],
        findingsCount: 0,
        warningsCount: 0,
        errorsCount: 0,
        guardrailsCount: 0,
        guardrails: [],
        linkedRecordingId: artifact.recordingId || null,
        statusReason:
          error && error.message ? error.message : "Live View inspection failed.",
        tags: buildQcTags()
      });
    } catch (qcError) {
      error =
        error && error.message && qcError && qcError.message
          ? new Error(error.message + " " + qcError.message)
          : error;
    }

    await writeState({
      qcPageArtifacts: qcPageArtifacts,
      lastError: error && error.message ? error.message : "Unable to inspect the current page."
    });
    return {
      ok: false,
      error: error && error.message ? error.message : "Unable to inspect the current page."
    };
  }
}

async function loadLiveViewSession(connection) {
  var url =
    connection.bridgeOrigin +
    "/api/live-view/session?workspaceId=" +
    encodeURIComponent(connection.workspaceId) +
    "&projectId=" +
    encodeURIComponent(connection.projectId) +
    "&sessionId=" +
    encodeURIComponent(connection.sessionId) +
    "&liveViewToken=" +
    encodeURIComponent(connection.token);
  var response = await fetch(url, {
    method: "GET"
  });
  var json = await response.json();

  if (!response.ok) {
    throw new Error(json && json.error ? json.error : "Unable to read the live session.");
  }

  return json && json.session ? json.session : null;
}

function resolveRuntimeV2Connection(command, state) {
  return normalizeConnectionOverride(command && command.connectionOverride) || state.connection;
}

async function runBrowserRuntimeV2OpenBrowser(command, state, sender) {
  var connection = resolveRuntimeV2Connection(command, state);

  if (!connection) {
    return buildRuntimeV2CommandError(
      "open-browser",
      new Error("No live browser session is available for this project yet.")
    );
  }

  var now = new Date().toISOString();
  var preferredWindowId =
    sender && sender.tab && typeof sender.tab.windowId === "number"
      ? sender.tab.windowId
      : state.inspectableTarget && typeof state.inspectableTarget.windowId === "number"
        ? state.inspectableTarget.windowId
        : null;
  var nextUrl = buildLiveViewUrl(
    connection,
    command && command.payload && command.payload.launchAt ? command.payload.launchAt : now
  );
  var createdTab = await chrome.tabs.create(
    preferredWindowId !== null
      ? {
          url: nextUrl,
          active: true,
          windowId: preferredWindowId
        }
      : {
          url: nextUrl,
          active: true
        }
  );
  var target = {
    tabId: createdTab.id,
    windowId: typeof createdTab.windowId === "number" ? createdTab.windowId : null,
    url: createdTab.url || nextUrl,
    title: createdTab.title || "Neroa Live View",
    updatedAt: now
  };

  await writeState({
    connection: connection,
    connectionSyncStatus: state.connectionSyncStatus === "connected" ? "connected" : "binding",
    lastError: null,
    activity: trimActivity(
      (state.activity || []).concat([
        {
          timestamp: now,
          label: "Opened Live View in current browser context",
          url: target.url
        }
      ])
    )
  });

  var runtimeState = await updateRuntimeV2State(connection, {
    currentTarget: target,
    lastCommandAt: now,
    lastCommandAction: "open-browser",
    lastCommandError: null
  });

  return buildRuntimeV2CommandSuccess("open-browser", {
    target: target,
    state: runtimeState.session && runtimeState.session.runtimeV2 ? runtimeState.session.runtimeV2 : null,
    notice: "Live View opened in the current extension-enabled browser context."
  });
}

async function runBrowserRuntimeV2Inspect(command, state, sender) {
  var connection = resolveRuntimeV2Connection(command, state);

  if (!connection) {
    return buildRuntimeV2CommandError(
      "inspect.run",
      new Error("No Neroa Live View session is connected yet.")
    );
  }

  if (!normalizeConnectionOverride(command && command.connectionOverride) && state.connectionSyncStatus !== "connected") {
    return buildRuntimeV2CommandError(
      "inspect.run",
      new Error("Wait for the browser session to finish binding before running an explicit inspection.")
    );
  }

  var now = new Date().toISOString();
  var inspectableTarget = await resolveInspectableTarget(connection, state, {
    preferredWindowId:
      sender && sender.tab && typeof sender.tab.windowId === "number"
        ? sender.tab.windowId
        : null
  });

  if (!inspectableTarget || typeof inspectableTarget.tabId !== "number") {
    return buildRuntimeV2CommandError(
      "inspect.run",
      new Error("Open a supported runtime target page first so Neroa has a current app tab to inspect.")
    );
  }

  try {
    await writeState({
      connection: connection,
      connectionSyncStatus: "connected",
      connectionSyncedAt: now,
      inspectableTarget: inspectableTarget,
      lastError: null,
      activity: trimActivity(
        (state.activity || []).concat([
          {
            timestamp: now,
            label: "Requested explicit inspection",
            url: inspectableTarget.url
          }
        ])
      )
    });

    var runtimeState = await updateRuntimeV2State(connection, {
      currentTarget: inspectableTarget,
      lastCommandAt: now,
      lastCommandAction: "inspect.run",
      lastCommandError: null
    });

    await sendMessageToInspectableTarget(
      inspectableTarget,
      {
        type: "neroa-live-view:force-inspect"
      },
      "Unable to trigger an explicit inspection for the current app tab."
    );

    return buildRuntimeV2CommandSuccess("inspect.run", {
      target: inspectableTarget,
      state: runtimeState.session && runtimeState.session.runtimeV2 ? runtimeState.session.runtimeV2 : null,
      notice: "Inspection requested for the current live browser target."
    });
  } catch (error) {
    var nextState = await updateRuntimeV2State(connection, {
      currentTarget: inspectableTarget,
      lastCommandAt: now,
      lastCommandAction: "inspect.run",
      lastCommandError: normalizeBridgeError(
        error,
        "Unable to trigger an explicit inspection for the current app tab."
      )
    }).catch(function ignoreStateFailure() {
      return null;
    });
    await writeState({
      connection: connection,
      connectionSyncStatus: "connected",
      connectionSyncedAt: now,
      inspectableTarget: inspectableTarget,
      lastError: normalizeBridgeError(
        error,
        "Unable to trigger an explicit inspection for the current app tab."
      )
    });

    return buildRuntimeV2CommandError("inspect.run", error, {
      target: inspectableTarget,
      state: nextState && nextState.session && nextState.session.runtimeV2 ? nextState.session.runtimeV2 : null
    });
  }
}

function selectActiveRecordingArtifact(state, connection) {
  var prefix = connection.sessionId + "::";
  var keys = Object.keys((state && state.qcPageArtifacts) || {});

  for (var index = 0; index < keys.length; index += 1) {
    var key = keys[index];
    if (key.indexOf(prefix) !== 0) {
      continue;
    }

    if (state.qcPageArtifacts[key] && state.qcPageArtifacts[key].recordingId) {
      return state.qcPageArtifacts[key];
    }
  }

  return null;
}

async function runBrowserRuntimeV2RecordStart(command, state, sender) {
  var connection = resolveRuntimeV2Connection(command, state);

  if (!connection) {
    return buildRuntimeV2CommandError(
      "record.start",
      new Error("No Neroa Live View session is connected yet.")
    );
  }

  var target = await resolveInspectableTarget(connection, state, {
    preferredWindowId:
      sender && sender.tab && typeof sender.tab.windowId === "number"
        ? sender.tab.windowId
        : null
  });

  if (!target) {
    return buildRuntimeV2CommandError(
      "record.start",
      new Error("Open a supported runtime target page first so Neroa has a current browser target to record.")
    );
  }

  var page = buildPageAssociationFromTarget(target);
  var recording = await ensureQcRecordingActive(connection, state, page, null);
  var qcPageArtifacts = writeQcPageArtifact(state, recording.pageKey, recording.artifact);
  var now = recording.artifact.recordingStartedAt || new Date().toISOString();

  await writeState({
    connection: connection,
    recordingEnabled: true,
    inspectableTarget: target,
    qcPageArtifacts: qcPageArtifacts,
    lastError: null,
    activity: trimActivity(
      (state.activity || []).concat([
        {
          timestamp: now,
          label: "Started runtime recording",
          url: target.url
        }
      ])
    )
  });

  var runtimeState = await updateRuntimeV2State(connection, {
    currentTarget: target,
    lastCommandAt: now,
    lastCommandAction: "record.start",
    lastCommandError: null,
    recording: {
      status: "capturing",
      recordingId: recording.recording.id,
      linkedReportId: recording.artifact.reportId || null,
      startedAt: now,
      stoppedAt: null,
      summary: recording.recording.summary,
      storagePath: recording.recording.storagePath || null,
      durationMs: recording.recording.durationMs || 0,
      statusReason:
        "Recording foundation is active. Full binary video upload remains a later phase."
    }
  });

  return buildRuntimeV2CommandSuccess("record.start", {
    target: target,
    state: runtimeState.session && runtimeState.session.runtimeV2 ? runtimeState.session.runtimeV2 : null,
    notice: "Recording foundation started for the current browser target."
  });
}

async function runBrowserRuntimeV2RecordStop(command, state) {
  var connection = resolveRuntimeV2Connection(command, state);

  if (!connection) {
    return buildRuntimeV2CommandError(
      "record.stop",
      new Error("No Neroa Live View session is connected yet.")
    );
  }

  var activeRecordingArtifact = selectActiveRecordingArtifact(state, connection);
  var finalizedArtifacts = await finalizeActiveQcRecordings(state);
  var now = new Date().toISOString();
  var hasStoredFrame = Boolean(activeRecordingArtifact && activeRecordingArtifact.recordingStoragePath);
  var recordingStatus = activeRecordingArtifact
    ? hasStoredFrame
      ? "ready"
      : "failed"
    : "idle";

  await writeState({
    connection: connection,
    recordingEnabled: false,
    qcPageArtifacts: finalizedArtifacts,
    lastError: null,
    activity: trimActivity(
      (state.activity || []).concat([
        {
          timestamp: now,
          label: "Stopped runtime recording",
          url:
            (state.inspectableTarget && state.inspectableTarget.url) ||
            connection.bridgeOrigin
        }
      ])
    )
  });

  var runtimeState = await updateRuntimeV2State(connection, {
    lastCommandAt: now,
    lastCommandAction: "record.stop",
    lastCommandError: null,
    recording: {
      status: recordingStatus,
      recordingId: activeRecordingArtifact ? activeRecordingArtifact.recordingId : null,
      linkedReportId: activeRecordingArtifact ? activeRecordingArtifact.reportId || null : null,
      startedAt: activeRecordingArtifact ? activeRecordingArtifact.recordingStartedAt || null : null,
      stoppedAt: now,
      summary: activeRecordingArtifact
        ? hasStoredFrame
          ? "Recording metadata captured and finalized for the current browser target."
          : "Recording stopped before a stored frame was captured."
        : "No active recording was running.",
      storagePath:
        activeRecordingArtifact && activeRecordingArtifact.recordingStoragePath
          ? activeRecordingArtifact.recordingStoragePath
          : null,
      durationMs:
        activeRecordingArtifact && activeRecordingArtifact.recordingStartedAt
          ? Math.max(Date.now() - Date.parse(activeRecordingArtifact.recordingStartedAt), 0)
          : null,
      statusReason: activeRecordingArtifact
        ? hasStoredFrame
          ? "Stored as truthful frame metadata until full video export is implemented."
          : "No stored frame was available when recording stopped."
        : null
    }
  });

  return buildRuntimeV2CommandSuccess("record.stop", {
    state: runtimeState.session && runtimeState.session.runtimeV2 ? runtimeState.session.runtimeV2 : null,
    notice:
      recordingStatus === "ready"
        ? "Recording foundation stopped and finalized."
        : recordingStatus === "failed"
          ? "Recording stopped, but no stored frame was captured."
          : "No active recording was running."
  });
}

async function runBrowserRuntimeV2Walkthrough(command, state, sender, mode) {
  var connection = resolveRuntimeV2Connection(command, state);

  if (!connection) {
    return buildRuntimeV2CommandError(
      command.action,
      new Error("No Neroa Live View session is connected yet.")
    );
  }

  var target = await resolveInspectableTarget(connection, state, {
    preferredWindowId:
      sender && sender.tab && typeof sender.tab.windowId === "number"
        ? sender.tab.windowId
        : null
  });

  if (!target) {
    return buildRuntimeV2CommandError(
      command.action,
      new Error("Open a supported runtime target page first so Neroa has a current browser target for the walkthrough.")
    );
  }

  var now = new Date().toISOString();
  await updateRuntimeV2State(connection, {
    currentTarget: target,
    lastCommandAt: now,
    lastCommandAction: command.action,
    lastCommandError: null,
    walkthrough: {
      status: "running",
      startedAt: now,
      completedAt: null,
      targetUrl: target.url,
      summary: "Running the bounded Browser Runtime V2 walkthrough step.",
      nextActionLabel: null,
      lastExecutionMode: mode,
      statusReason: null
    }
  });

  var walkthroughResult = await sendMessageToInspectableTarget(
    target,
    {
      type: "neroa-browser-runtime-v2:walkthrough-step",
      mode: mode
    },
    "Unable to run the bounded walkthrough step for the current browser target."
  );

  if (!walkthroughResult || !walkthroughResult.ok) {
    throw new Error(
      walkthroughResult && walkthroughResult.error
        ? walkthroughResult.error
        : "Unable to run the bounded walkthrough step for the current browser target."
    );
  }

  var page = buildPageAssociationFromTarget(target);
  var outputResult = await writeRuntimeV2Output(connection, {
    kind: "ai_walkthrough_result",
    title:
      mode === "scan"
        ? "AI walkthrough scan"
        : mode === "focus-next"
          ? "AI walkthrough focus step"
          : "AI walkthrough activation step",
    summary: walkthroughResult.summary || "Browser Runtime V2 walkthrough completed.",
    lifecycle: "ready",
    outcome: null,
    page: page,
    runtimeTarget: connection.runtimeTarget || null,
    statusReason:
      "This is the bounded Browser Runtime V2 walkthrough/testing foundation, not a full autonomous agent run.",
    tags: ["browser-runtime-v2", "ai-walkthrough"],
    data: {
      mode: mode,
      target: walkthroughResult.target || null,
      snapshot: walkthroughResult.snapshot || null,
      nextActionLabel: walkthroughResult.nextActionLabel || null
    }
  });

  var persistedRuntime = await updateRuntimeV2State(connection, {
    currentTarget: target,
    lastCommandAt: new Date().toISOString(),
    lastCommandAction: command.action,
    lastCommandError: null,
    walkthrough: {
      status: "ready",
      outputId: outputResult.output.id,
      startedAt: now,
      completedAt: new Date().toISOString(),
      targetUrl: target.url,
      summary: outputResult.output.summary,
      nextActionLabel:
        walkthroughResult.nextActionLabel || "Review the latest walkthrough output.",
      lastExecutionMode: mode,
      statusReason:
        "Stored as bounded walkthrough output for later AI/browser test expansion."
    }
  });

  return buildRuntimeV2CommandSuccess(command.action, {
    target: target,
    state:
      persistedRuntime.session && persistedRuntime.session.runtimeV2
        ? persistedRuntime.session.runtimeV2
        : null,
    output: outputResult.summary,
    notice: walkthroughResult.summary || "Walkthrough output recorded."
  });
}

async function runBrowserRuntimeV2SopOutput(command, state) {
  var connection = resolveRuntimeV2Connection(command, state);

  if (!connection) {
    return buildRuntimeV2CommandError(
      "sop-output.generate",
      new Error("No Neroa Live View session is connected yet.")
    );
  }

  var session = await loadLiveViewSession(connection);
  var latestExplicit = session && session.inspectionState ? session.inspectionState.latestExplicit : null;
  var latestObserved = session && session.inspectionState ? session.inspectionState.latestObserved : null;
  var sourceInspection =
    command &&
    command.payload &&
    command.payload.source === "inspection" &&
    latestExplicit
      ? latestExplicit
      : latestExplicit || latestObserved;
  var targetUrl =
    (session &&
      session.runtimeV2 &&
      session.runtimeV2.currentTarget &&
      session.runtimeV2.currentTarget.url) ||
    (state.inspectableTarget && state.inspectableTarget.url) ||
    connection.bridgeOrigin;
  var targetTitle =
    (session &&
      session.runtimeV2 &&
      session.runtimeV2.currentTarget &&
      session.runtimeV2.currentTarget.title) ||
    (state.inspectableTarget && state.inspectableTarget.title) ||
    "Browser Runtime target";
  var page = buildPageAssociationFromTarget({
    tabId: state.inspectableTarget ? state.inspectableTarget.tabId : -1,
    windowId: state.inspectableTarget ? state.inspectableTarget.windowId || null : null,
    url: targetUrl,
    title: targetTitle,
    updatedAt: new Date().toISOString()
  });
  var summary =
    sourceInspection && sourceInspection.summary
      ? sourceInspection.summary
      : "Browser Runtime V2 generated a structured SOP/result output from the current browser session.";
  var now = new Date().toISOString();
  var outputResult = await writeRuntimeV2Output(connection, {
    kind: "sop_result",
    title: "Browser SOP / result output",
    summary: summary,
    lifecycle: "ready",
    outcome:
      sourceInspection && sourceInspection.findings && sourceInspection.findings.some(function hasCritical(item) {
        return item && item.severity === "critical";
      })
        ? "fail"
        : sourceInspection && sourceInspection.findings && sourceInspection.findings.some(function hasWarning(item) {
            return item && item.severity === "warning";
          })
          ? "warning"
          : null,
    page: page,
    runtimeTarget: connection.runtimeTarget || null,
    statusReason:
      "Generated from current inspection, recording, and walkthrough truth. This is a foundation output for later governed SOP/writeback flows.",
    tags: ["browser-runtime-v2", "sop-output"],
    data: {
      source: command && command.payload && command.payload.source ? command.payload.source : "inspection",
      sessionId: connection.sessionId,
      explicitInspection: latestExplicit,
      latestObservation: latestObserved,
      runtimeV2: session && session.runtimeV2 ? session.runtimeV2 : null
    }
  });
  var persistedRuntime = await updateRuntimeV2State(connection, {
    lastCommandAt: now,
    lastCommandAction: "sop-output.generate",
    lastCommandError: null,
    sopOutput: {
      status: "ready",
      outputId: outputResult.output.id,
      generatedAt: now,
      summary: outputResult.output.summary,
      statusReason:
        "Structured SOP/result output captured from the current browser-runtime truth."
    }
  });

  return buildRuntimeV2CommandSuccess("sop-output.generate", {
    state:
      persistedRuntime.session && persistedRuntime.session.runtimeV2
        ? persistedRuntime.session.runtimeV2
        : null,
    output: outputResult.summary,
    notice: "SOP / result output generated for the current browser session."
  });
}

async function executeBrowserRuntimeV2Command(command, sender) {
  if (!command || !command.action) {
    return buildRuntimeV2CommandError(
      "inspect.run",
      new Error("No Browser Runtime V2 action was provided.")
    );
  }

  var state = await readState();

  if (command.action === "open-browser") {
    return runBrowserRuntimeV2OpenBrowser(command, state, sender);
  }

  if (command.action === "inspect.run") {
    return runBrowserRuntimeV2Inspect(command, state, sender);
  }

  if (command.action === "record.start") {
    return runBrowserRuntimeV2RecordStart(command, state, sender);
  }

  if (command.action === "record.stop") {
    return runBrowserRuntimeV2RecordStop(command, state);
  }

  if (command.action === "ai-walkthrough.start") {
    return runBrowserRuntimeV2Walkthrough(command, state, sender, "scan");
  }

  if (command.action === "ai-walkthrough.step") {
    return runBrowserRuntimeV2Walkthrough(
      command,
      state,
      sender,
      command && command.payload && command.payload.mode ? command.payload.mode : "focus-next"
    );
  }

  if (command.action === "sop-output.generate") {
    return runBrowserRuntimeV2SopOutput(command, state);
  }

  return buildRuntimeV2CommandError(
    command.action,
    new Error("Unsupported Browser Runtime V2 action.")
  );
}

chrome.runtime.onInstalled.addListener(function onInstalled() {
  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true
  });
});

chrome.runtime.onMessage.addListener(function onMessage(message, sender, sendResponse) {
  if (!message || !message.type) {
    return;
  }

  if (message.type === "neroa-browser-runtime-v2:command") {
    return respondAsync(
      sendResponse,
      function onRuntimeV2Command() {
        return executeBrowserRuntimeV2Command(message.command, sender);
      },
      "Unable to complete the Browser Runtime V2 command."
    );
  }

  if (message.type === "neroa-live-view:connection-found") {
    return respondAsync(
      sendResponse,
      function onConnectionFound() {
        var normalizedConnection = normalizeConnectionOverride(message.payload) || message.payload;
        return readState()
      .then(function withState(currentState) {
        var resetInspectionState =
          !currentState.connection ||
          currentState.connection.sessionId !== normalizedConnection.sessionId;

        return writeState({
          connection: normalizedConnection,
          connectionSyncStatus: "binding",
          latestInspection: resetInspectionState ? null : currentState.latestInspection || null,
          latestExplicitInspection: resetInspectionState
            ? null
            : currentState.latestExplicitInspection || null,
          inspectableTarget: resetInspectionState
            ? null
            : currentState.inspectableTarget || null,
          lastError: null,
          activity: trimActivity(
            (currentState.activity || []).concat([
              {
                timestamp: new Date().toISOString(),
                label: "Connected to " + normalizedConnection.projectTitle,
                url: normalizedConnection.bridgeOrigin
              }
            ])
          )
        });
      })
      .then(function afterLocalConnection() {
        var tabUrl = (sender && sender.tab && sender.tab.url) || normalizedConnection.bridgeOrigin;
        var pageTitle = (sender && sender.tab && sender.tab.title) || normalizedConnection.projectTitle;

        return bindConnectionToBackend(
          normalizedConnection,
          tabUrl,
          pageTitle,
          "workspace-page"
        )
          .then(function onBound() {
            return writeState({
              connection: normalizedConnection,
              connectionSyncStatus: "connected",
              connectionSyncedAt: new Date().toISOString(),
              lastError: null
            });
          })
          .catch(function onBindError(error) {
            return writeState({
              connection: normalizedConnection,
              connectionSyncStatus: "error",
              lastError:
                error && error.message
                  ? error.message
                  : "Unable to bind the Live View session."
            });
          });
      })
      .then(function afterConnection(state) {
        return {
          ok: true,
          state: state
        };
      });
      },
      "Unable to bind the Live View session."
    );
  }

  if (message.type === "neroa-live-view:inspect") {
    return respondAsync(
      sendResponse,
      function onInspect() {
        return inspectLiveView(message.payload, sender);
      },
      "Unable to inspect the current page."
    );
  }

  if (message.type === "neroa-live-view:panel:get-state") {
    return respondAsync(
      sendResponse,
      function onGetState() {
        return readState().then(function onState(state) {
      return {
        ok: true,
        state: state
      };
    });
      },
      "Unable to load Live View state."
    );
  }

  if (message.type === "neroa-live-view:panel:set-recording") {
    return respondAsync(
      sendResponse,
      function onSetRecording() {
        return executeBrowserRuntimeV2Command(
          {
            action:
              message.payload && message.payload.enabled ? "record.start" : "record.stop",
            surface: "sidepanel"
          },
          sender
        ).then(function onRecording(response) {
          return readState().then(function onState(state) {
            return Object.assign({}, response, {
              state: state
            });
          });
        });
      },
      "Unable to update recording state."
    );
  }

  if (message.type === "neroa-live-view:panel:refresh-active-tab") {
    return respondAsync(
      sendResponse,
      function onRefreshActiveTab() {
        return chrome.tabs.query({ active: true, currentWindow: true }).then(function onTabs(tabs) {
      var activeTab = tabs && tabs[0];
      if (!activeTab || typeof activeTab.id !== "number") {
        return {
          ok: false,
          error: "No active tab is available."
        };
      }

      return Promise.allSettled([
        chrome.tabs.sendMessage(activeTab.id, {
          type: "neroa-live-view:refresh-connection"
        }),
        chrome.tabs.sendMessage(activeTab.id, {
          type: "neroa-live-view:force-inspect"
        })
      ]).then(function onRefresh(results) {
        var hasSuccess = results.some(function hasFulfilled(result) {
          return result.status === "fulfilled";
        });

        if (!hasSuccess) {
          var failedResult = results.find(function findRejected(result) {
            return result.status === "rejected";
          });
          return {
            ok: false,
            error:
              failedResult && failedResult.reason && failedResult.reason.message
                ? failedResult.reason.message
                : "Unable to refresh the active tab."
          };
        }

        return {
          ok: true
        };
      });
    });
      },
      "Unable to refresh the active tab."
    );
  }

  if (message.type === "neroa-live-view:panel:run-explicit-inspection") {
    return respondAsync(
      sendResponse,
      function onRunExplicitInspection() {
        return executeBrowserRuntimeV2Command(
          {
            action: "inspect.run",
            surface: "sidepanel",
            connectionOverride: message.connectionOverride || null
          },
          sender
        ).then(function onInspection(response) {
          return readState().then(function onState(state) {
            return Object.assign({}, response, {
              state: state
            });
          });
        });
      },
      "Unable to trigger an explicit inspection for the current app tab."
    );
  }

  if (message.type === "neroa-live-view:panel:open-workspace") {
    return respondAsync(
      sendResponse,
      function onOpenWorkspace() {
        return executeBrowserRuntimeV2Command(
          {
            action: "open-browser",
            surface: "sidepanel",
            connectionOverride: null,
            payload: {
              launchAt: new Date().toISOString()
            }
          },
          sender
        );
      },
      "Unable to open the workspace Live View page."
    );
  }
});
