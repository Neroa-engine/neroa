var refreshButton = document.getElementById("refresh-button");
var openWorkspaceButton = document.getElementById("open-workspace-button");
var recordingToggle = document.getElementById("recording-toggle");
var connectionTitle = document.getElementById("connection-title");
var connectionDetail = document.getElementById("connection-detail");
var connectionPill = document.getElementById("connection-pill");
var inspectionTitle = document.getElementById("inspection-title");
var inspectionDetail = document.getElementById("inspection-detail");
var recommendationBlock = document.getElementById("recommendation-block");
var guardrailBlock = document.getElementById("guardrail-block");
var findingsList = document.getElementById("findings-list");
var activityList = document.getElementById("activity-list");
var errorBanner = document.getElementById("error-banner");

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
      ". Live localhost inspection is now bound to this Neroa session.";
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

function renderRecommendation(latestInspection) {
  recommendationBlock.innerHTML = "";

  if (!latestInspection || !latestInspection.recommendations || !latestInspection.recommendations.length) {
    recommendationBlock.classList.add("hidden");
    return;
  }

  var item = latestInspection.recommendations[0];
  recommendationBlock.classList.remove("hidden");
  recommendationBlock.innerHTML =
    "<h3>" +
    item.title +
    "</h3><p>" +
    item.detail +
    "</p>";
}

function renderGuardrails(latestInspection) {
  guardrailBlock.innerHTML = "";

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

function renderFindings(latestInspection) {
  findingsList.innerHTML = "";

  if (!latestInspection || !latestInspection.findings || !latestInspection.findings.length) {
    findingsList.className = "list-block empty-state";
    findingsList.textContent = "No findings yet. Start with the homepage and move through the app flow.";
    return;
  }

  findingsList.className = "list-block";
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
  var latestInspection = state.latestInspection;

  if (!latestInspection) {
    inspectionTitle.textContent = "No live app inspected yet";
    inspectionDetail.textContent =
      "Once you move through a supported localhost app, Naroa will summarize the current page, report findings, and suggest the next best action here.";
    renderRecommendation(null);
    renderGuardrails(null);
    renderFindings(null);
    return;
  }

  inspectionTitle.textContent = latestInspection.pageTitle || latestInspection.pageUrl;
  inspectionDetail.textContent =
    "Last inspected " +
    latestInspection.pageUrl +
    ". " +
    (latestInspection.summary && latestInspection.summary.nextAction
      ? latestInspection.summary.nextAction.title
      : "Review the current recommendation and findings below.");
  renderRecommendation(latestInspection);
  renderGuardrails(latestInspection);
  renderFindings(latestInspection);
}

function renderState(state) {
  recordingToggle.checked = Boolean(state.recordingEnabled);
  updateConnection(state);
  updateInspection(state);
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

refreshState();
window.setInterval(refreshState, 3500);
