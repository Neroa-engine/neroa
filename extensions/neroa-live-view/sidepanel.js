var refreshButton = document.getElementById("refresh-button");
var openWorkspaceButton = document.getElementById("open-workspace-button");
var recordingToggle = document.getElementById("recording-toggle");
var connectionTitle = document.getElementById("connection-title");
var connectionDetail = document.getElementById("connection-detail");
var connectionPill = document.getElementById("connection-pill");
var inspectionTitle = document.getElementById("inspection-title");
var inspectionDetail = document.getElementById("inspection-detail");
var inspectionButton = document.getElementById("inspection-button");
var inspectionActionCopy = document.getElementById("inspection-action-copy");
var inspectionActionNotice = document.getElementById("inspection-action-notice");
var walkthroughButton = document.getElementById("walkthrough-button");
var sopButton = document.getElementById("sop-button");
var runtimeActionsCopy = document.getElementById("runtime-actions-copy");
var runtimeActionNotice = document.getElementById("runtime-action-notice");
var recommendationBlock = document.getElementById("recommendation-block");
var guardrailBlock = document.getElementById("guardrail-block");
var findingsTitle = document.getElementById("findings-title");
var findingsList = document.getElementById("findings-list");
var activityList = document.getElementById("activity-list");
var errorBanner = document.getElementById("error-banner");
var inspectionActionBusy = false;
var runtimeActionBusy = null;

function sendMessage(message) {
  return chrome.runtime.sendMessage(message);
}

function setBanner(message) {
  if (!message) {
    errorBanner.classList.add("hidden");
    errorBanner.textContent = "";
    return;
  }

  errorBanner.classList.remove("hidden");
  errorBanner.textContent = message;
}

function setInspectionActionNotice(message, tone) {
  if (!inspectionActionNotice) {
    return;
  }

  if (!message) {
    inspectionActionNotice.className = "action-note hidden";
    inspectionActionNotice.textContent = "";
    return;
  }

  inspectionActionNotice.className = "action-note " + (tone === "error" ? "error" : "success");
  inspectionActionNotice.textContent = message;
}

function setRuntimeActionNotice(message, tone) {
  if (!runtimeActionNotice) {
    return;
  }

  if (!message) {
    runtimeActionNotice.className = "action-note hidden";
    runtimeActionNotice.textContent = "";
    return;
  }

  runtimeActionNotice.className = "action-note " + (tone === "error" ? "error" : "success");
  runtimeActionNotice.textContent = message;
}

function describeRuntimeTarget(connection) {
  if (!connection || !connection.runtimeTarget) {
    return "runtime target";
  }

  if (connection.runtimeTarget.environment === "local") {
    return "local runtime target";
  }

  if (connection.runtimeTarget.environment === "preview") {
    return "preview runtime target";
  }

  if (connection.runtimeTarget.environment === "staging") {
    return "staging runtime target";
  }

  return "production runtime target";
}

function updateConnection(state) {
  if (!state.connection) {
    connectionTitle.textContent = "Waiting for a Neroa workspace session";
    connectionDetail.textContent =
      "Open a project Live View page in Neroa. The extension will bind to that active workspace/session automatically.";
    connectionPill.textContent = "Disconnected";
    connectionPill.className = "pill muted";
    return;
  }

  connectionTitle.textContent = state.connection.projectTitle;
  if (state.connectionSyncStatus === "connected") {
    connectionDetail.textContent =
      "Connected to workspace " +
      state.connection.workspaceId +
      ". Live " +
      describeRuntimeTarget(state.connection) +
      " inspection is now bound to this Neroa session.";
    connectionPill.textContent = "Connected";
    connectionPill.className = "pill success";
    return;
  }

  if (state.connectionSyncStatus === "binding") {
    connectionDetail.textContent =
      "Workspace session detected. Binding the extension to Neroa now.";
    connectionPill.textContent = "Binding";
    connectionPill.className = "pill warning";
    return;
  }

  if (state.connectionSyncStatus === "error") {
    connectionDetail.textContent =
      "The workspace session was detected, but the backend bind did not complete yet.";
    connectionPill.textContent = "Needs retry";
    connectionPill.className = "pill error";
    return;
  }

  connectionDetail.textContent =
    "Workspace session detected. Open the Live View page again or press Refresh to finish binding.";
  connectionPill.textContent = "Detected";
  connectionPill.className = "pill warning";
}

function humanizeTrigger(trigger) {
  if (!trigger) {
    return "background observation";
  }

  return String(trigger).replace(/-/g, " ");
}

function parseTimestamp(value) {
  var timestamp = Date.parse(value || "");
  return Number.isNaN(timestamp) ? null : timestamp;
}

function chooseHistoricalInspection(items) {
  return items
    .filter(function hasInspection(item) {
      return Boolean(item && item.inspection);
    })
    .sort(function byMostRecent(left, right) {
      return (
        (parseTimestamp(right.inspection.inspectedAt) || 0) -
        (parseTimestamp(left.inspection.inspectedAt) || 0)
      );
    })[0] || null;
}

function resolveInspectionContext(state) {
  var bindTimestamp = parseTimestamp(state.connectionSyncedAt);
  var explicitTimestamp = parseTimestamp(
    state.latestExplicitInspection && state.latestExplicitInspection.inspectedAt
  );
  var currentExplicit =
    state.latestExplicitInspection &&
    bindTimestamp &&
    explicitTimestamp &&
    explicitTimestamp >= bindTimestamp
      ? state.latestExplicitInspection
      : null;
  var historical = chooseHistoricalInspection([
    state.latestInspection
      ? {
          mode: "background",
          inspection: state.latestInspection
        }
      : null,
    state.latestExplicitInspection && state.latestExplicitInspection !== currentExplicit
      ? {
          mode: "explicit-history",
          inspection: state.latestExplicitInspection
        }
      : null
  ]);

  if (currentExplicit) {
    return {
      mode: "explicit",
      inspection: currentExplicit,
      history: historical
    };
  }

  return {
    mode: "none",
    inspection: null,
    history: historical
  };
}

function hasInspectableTarget(state) {
  return Boolean(
    state.inspectableTarget &&
      typeof state.inspectableTarget.tabId === "number" &&
      state.inspectableTarget.url
  );
}

function canRunExplicitInspection(state) {
  return Boolean(
    state.connection &&
      state.connectionSyncStatus === "connected" &&
      hasInspectableTarget(state)
  );
}

function canRunWalkthrough(state) {
  return canRunExplicitInspection(state);
}

function canGenerateSop(state) {
  return Boolean(
    state.connection &&
      (state.latestExplicitInspection ||
        state.latestInspection ||
        (state.qcPageArtifacts && Object.keys(state.qcPageArtifacts).length))
  );
}

function inspectionActionLabel(context) {
  if (inspectionActionBusy) {
    return "Requesting inspection...";
  }

  return context.mode === "explicit" ? "Run another explicit inspection" : "Run explicit inspection";
}

function inspectionActionHelper(state) {
  if (!state.connection) {
    return "Open a Neroa project Live View page first so the extension can detect an active workspace session.";
  }

  if (state.connectionSyncStatus !== "connected") {
    return "Wait for the browser session to finish connecting before requesting an explicit inspection.";
  }

  if (canRunExplicitInspection(state)) {
    return state.connectionSyncedAt
      ? "This runs a current explicit inspection against the latest supported " +
          describeRuntimeTarget(state.connection) +
          " page Neroa observed for this session."
      : "The current browser page is already being observed. Neroa can run an explicit inspection now while Live View bind catches up.";
  }

  return state.connectionSyncedAt
    ? "Open a supported " +
        describeRuntimeTarget(state.connection) +
        " page first so Neroa has a current app tab to inspect when you request an explicit inspection."
    : "Open a supported " +
        describeRuntimeTarget(state.connection) +
        " page first so Neroa has current page context while the first bind is still catching up.";
}

function updateInspectionAction(state, context) {
  if (!inspectionButton || !inspectionActionCopy) {
    return;
  }

  inspectionButton.textContent = inspectionActionLabel(context);
  inspectionButton.disabled = inspectionActionBusy || !canRunExplicitInspection(state);
  inspectionActionCopy.textContent = inspectionActionHelper(state);
}

function updateRuntimeActions(state) {
  if (!walkthroughButton || !sopButton || !runtimeActionsCopy) {
    return;
  }

  walkthroughButton.disabled = runtimeActionBusy !== null || !canRunWalkthrough(state);
  sopButton.disabled = runtimeActionBusy !== null || !canGenerateSop(state);
  walkthroughButton.textContent =
    runtimeActionBusy === "ai-walkthrough.start" ? "Running..." : "Run AI walkthrough";
  sopButton.textContent =
    runtimeActionBusy === "sop-output.generate" ? "Generating..." : "Generate SOP output";

  if (!state.connection) {
    runtimeActionsCopy.textContent =
      "Open a Neroa workspace session first so walkthrough and SOP output can use the current browser context.";
    return;
  }

  if (state.connectionSyncStatus !== "connected") {
    runtimeActionsCopy.textContent =
      "Wait for the current browser session to finish binding before walkthrough and SOP output are enabled.";
    return;
  }

  runtimeActionsCopy.textContent =
    "Walkthrough and SOP output use the same current browser session and project/library linkage as inspection.";
}

function renderRecommendation(context) {
  recommendationBlock.innerHTML = "";
  var latestInspection = context.inspection;

  if (!latestInspection || !latestInspection.recommendations || !latestInspection.recommendations.length) {
    recommendationBlock.classList.add("hidden");
    return;
  }

  var item = latestInspection.recommendations[0];
  recommendationBlock.classList.remove("hidden");
  recommendationBlock.innerHTML = context.mode === "explicit"
    ? "<h3>" +
      item.title +
      "</h3><p>" +
      item.detail +
      "</p>"
    : "<h3>Latest historical guidance</h3><p>" +
      item.detail +
      " This is prior inspection context, not the current explicit inspection step.</p>";
}

function renderGuardrails(context) {
  guardrailBlock.innerHTML = "";
  var latestInspection = context.mode === "explicit"
    ? context.inspection
    : context.history && context.history.inspection;

  if (!latestInspection || !latestInspection.guardrails || !latestInspection.guardrails.length) {
    return;
  }

  latestInspection.guardrails.slice(0, 4).forEach(function eachGuardrail(item) {
    var pill = document.createElement("span");
    pill.className = "pill warning";
    pill.textContent = item.title;
    guardrailBlock.appendChild(pill);
  });
}

function renderFindings(context) {
  findingsList.innerHTML = "";
  var latestInspection = context.mode === "explicit"
    ? context.inspection
    : context.history && context.history.inspection;
  if (findingsTitle) {
    findingsTitle.textContent =
      context.mode === "explicit" ? "Current explicit findings" : "Historical findings";
  }

  if (!latestInspection || !latestInspection.findings || !latestInspection.findings.length) {
    findingsList.className = "list-block empty-state";
    findingsList.textContent = context.mode === "explicit"
      ? "No issues in the current explicit inspection yet."
      : "No historical findings yet. Background observation stays separate until an explicit inspection run is promoted.";
    return;
  }

  findingsList.className = "list-block";
  if (context.mode !== "explicit") {
    var note = document.createElement("div");
    note.className = "activity-item";
    note.innerHTML =
      "<p class='activity-title'>History only</p><p class='activity-copy'>These findings remain secondary until a new explicit inspection is recorded for the current bind.</p>";
    findingsList.appendChild(note);
  }

  latestInspection.findings.slice(0, 8).forEach(function eachFinding(item) {
    var row = document.createElement("div");
    row.className = "finding-item";
    row.innerHTML =
      "<p class='finding-title'>" +
      item.title +
      "</p><p class='finding-copy'>" +
      item.detail +
      "</p><p class='finding-copy'>" +
      item.recommendation +
      "</p>";
    findingsList.appendChild(row);
  });
}

function renderActivity(state) {
  activityList.innerHTML = "";
  var items = (state.activity || []).slice().reverse();

  if (!items.length) {
    activityList.className = "list-block empty-state";
    activityList.textContent = "No activity yet.";
    return;
  }

  activityList.className = "list-block";
  items.slice(0, 10).forEach(function eachActivity(item) {
    var row = document.createElement("div");
    row.className = "activity-item";
    row.innerHTML =
      "<p class='activity-title'>" +
      item.label +
      "</p><p class='activity-copy'>" +
      (item.url || "") +
      "</p><p class='activity-copy'>" +
      new Date(item.timestamp).toLocaleString() +
      "</p>";
    activityList.appendChild(row);
  });
}

function updateInspection(state) {
  var context = resolveInspectionContext(state);
  var latestInspection = context.inspection;

  if (!latestInspection) {
    inspectionTitle.textContent =
      state.connectionSyncStatus === "connected"
        ? "No new explicit inspection yet"
        : "No explicit inspection yet";
    inspectionDetail.textContent =
      state.connectionSyncStatus === "connected"
        ? "This session is bound and ready. Historical findings stay secondary until a new explicit inspection is promoted for the current bind."
        : "Background observation may still collect from supported runtime target pages, but current inspection results only appear here after a supported explicit inspection trigger.";
    renderRecommendation(context);
    renderGuardrails(context);
    renderFindings(context);
    return context;
  }

  if (context.mode === "explicit") {
    inspectionTitle.textContent = latestInspection.pageTitle || latestInspection.pageUrl;
    inspectionDetail.textContent =
      "Explicit inspection is current for " +
      latestInspection.pageUrl +
      ". Review the recommendation and findings below as the active result state.";
  }

  renderRecommendation(context);
  renderGuardrails(context);
  renderFindings(context);
  return context;
}

function renderState(state) {
  recordingToggle.checked = Boolean(state.recordingEnabled);
  updateConnection(state);
  updateInspectionAction(state, updateInspection(state));
  updateRuntimeActions(state);
  renderActivity(state);
  setBanner(state.lastError || null);
}

async function refreshState() {
  try {
    var response = await sendMessage({
      type: "neroa-live-view:panel:get-state"
    });
    if (!response || !response.ok) {
      throw new Error(response && response.error ? response.error : "Unable to load Live View state.");
    }

    renderState(response.state);
  } catch (error) {
    setBanner(error && error.message ? error.message : "Unable to load Live View state.");
  }
}

refreshButton.addEventListener("click", async function onRefresh() {
  var response = await sendMessage({
    type: "neroa-live-view:panel:refresh-active-tab"
  });

  if (!response || !response.ok) {
    setBanner(response && response.error ? response.error : "Unable to refresh the active tab.");
    return;
  }

  window.setTimeout(refreshState, 500);
});

openWorkspaceButton.addEventListener("click", async function onOpenWorkspace() {
  var response = await sendMessage({
    type: "neroa-live-view:panel:open-workspace"
  });

  if (!response || !response.ok) {
    setBanner(response && response.error ? response.error : "Unable to open the workspace Live View page.");
  }
});

recordingToggle.addEventListener("change", async function onToggle() {
  var response = await sendMessage({
    type: "neroa-live-view:panel:set-recording",
    payload: {
      enabled: recordingToggle.checked
    }
  });

  if (!response || !response.ok) {
    setBanner(response && response.error ? response.error : "Unable to update recording state.");
    return;
  }

  renderState(response.state);
});

walkthroughButton.addEventListener("click", async function onWalkthrough() {
  runtimeActionBusy = "ai-walkthrough.start";
  setRuntimeActionNotice(null, "success");
  setBanner(null);
  await refreshState();

  try {
    var response = await sendMessage({
      type: "neroa-browser-runtime-v2:command",
      command: {
        action: "ai-walkthrough.start",
        surface: "sidepanel"
      }
    });

    if (!response || !response.ok) {
      throw new Error(
        response && response.error
          ? response.error
          : "Unable to run the Browser Runtime walkthrough."
      );
    }

    setRuntimeActionNotice(
      response.notice || "AI walkthrough foundation completed for the current browser target.",
      "success"
    );

    await refreshState();
  } catch (error) {
    var message =
      error && error.message ? error.message : "Unable to run the Browser Runtime walkthrough.";
    setRuntimeActionNotice(message, "error");
    setBanner(message);
  } finally {
    runtimeActionBusy = null;
    await refreshState();
  }
});

sopButton.addEventListener("click", async function onSop() {
  runtimeActionBusy = "sop-output.generate";
  setRuntimeActionNotice(null, "success");
  setBanner(null);
  await refreshState();

  try {
    var response = await sendMessage({
      type: "neroa-browser-runtime-v2:command",
      command: {
        action: "sop-output.generate",
        surface: "sidepanel",
        payload: {
          source: "inspection"
        }
      }
    });

    if (!response || !response.ok) {
      throw new Error(
        response && response.error
          ? response.error
          : "Unable to generate the Browser Runtime SOP output."
      );
    }

    setRuntimeActionNotice(
      response.notice || "SOP / result output generated for the current browser session.",
      "success"
    );

    await refreshState();
  } catch (error) {
    var message =
      error && error.message
        ? error.message
        : "Unable to generate the Browser Runtime SOP output.";
    setRuntimeActionNotice(message, "error");
    setBanner(message);
  } finally {
    runtimeActionBusy = null;
    await refreshState();
  }
});

inspectionButton.addEventListener("click", async function onExplicitInspection() {
  inspectionActionBusy = true;
  setBanner(null);
  setInspectionActionNotice(null, "success");
  await refreshState();

  try {
    var response = await sendMessage({
      type: "neroa-browser-runtime-v2:command",
      command: {
        action: "inspect.run",
        surface: "sidepanel"
      }
    });

    if (!response || !response.ok) {
      throw new Error(
        response && response.error
          ? response.error
          : "Unable to trigger an explicit inspection for the current browser session."
      );
    }

    setInspectionActionNotice(
      response.target && response.target.url
        ? "Inspection requested for " +
            response.target.url +
            ". Neroa will promote the current inspection result as soon as the active page responds."
        : "Inspection requested. Neroa will promote the current inspection result as soon as the active page responds.",
      "success"
    );

    await refreshState();
    window.setTimeout(refreshState, 900);
  } catch (error) {
    var message =
      error && error.message
        ? error.message
        : "Unable to trigger an explicit inspection for the current browser session.";
    setInspectionActionNotice(message, "error");
    setBanner(message);
  } finally {
    inspectionActionBusy = false;
    await refreshState();
  }
});

refreshState();
window.setInterval(refreshState, 3500);
