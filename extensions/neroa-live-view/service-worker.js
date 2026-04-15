var STORAGE_KEY = "neroa-live-view-state";

function getDefaultState() {
  return {
    connection: null,
    connectionSyncStatus: "disconnected",
    connectionSyncedAt: null,
    recordingEnabled: false,
    latestInspection: null,
    lastError: null,
    activity: []
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
  if (connection.allowedOrigins.indexOf(currentOrigin) === -1) {
    return {
      ok: false,
      error: "This tab is outside the supported localhost targets."
    };
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

    await writeState({
      latestInspection: {
        inspectedAt: new Date().toISOString(),
        tabId: sender.tab.id,
        pageUrl: payload.snapshot.page.url,
        pageTitle: payload.snapshot.page.title,
        summary: json.summary || null,
        findings: json.findings || [],
        guardrails: json.guardrails || [],
        recommendations: json.recommendations || []
      },
      connectionSyncStatus: "connected",
      connectionSyncedAt: new Date().toISOString(),
      lastError: null,
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
      inspection: json
    };
  } catch (error) {
    await writeState({
      lastError: error && error.message ? error.message : "Unable to inspect the current page."
    });
    return {
      ok: false,
      error: error && error.message ? error.message : "Unable to inspect the current page."
    };
  }
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

  if (message.type === "neroa-live-view:connection-found") {
    readState()
      .then(function withState(currentState) {
        return writeState({
          connection: message.payload,
          connectionSyncStatus: "binding",
          lastError: null,
          activity: trimActivity(
            (currentState.activity || []).concat([
              {
                timestamp: new Date().toISOString(),
                label: "Connected to " + message.payload.projectTitle,
                url: message.payload.bridgeOrigin
              }
            ])
          )
        });
      })
      .then(function afterLocalConnection() {
        var tabUrl = (sender && sender.tab && sender.tab.url) || message.payload.bridgeOrigin;
        var pageTitle = (sender && sender.tab && sender.tab.title) || message.payload.projectTitle;

        return bindConnectionToBackend(
          message.payload,
          tabUrl,
          pageTitle,
          "workspace-page"
        )
          .then(function onBound() {
            return writeState({
              connection: message.payload,
              connectionSyncStatus: "connected",
              connectionSyncedAt: new Date().toISOString(),
              lastError: null
            });
          })
          .catch(function onBindError(error) {
            return writeState({
              connection: message.payload,
              connectionSyncStatus: "error",
              lastError:
                error && error.message
                  ? error.message
                  : "Unable to bind the Live View session."
            });
          });
      })
      .then(function afterConnection(state) {
        sendResponse({
          ok: true,
          state: state
        });
      });
    return true;
  }

  if (message.type === "neroa-live-view:inspect") {
    inspectLiveView(message.payload, sender).then(sendResponse);
    return true;
  }

  if (message.type === "neroa-live-view:panel:get-state") {
    readState().then(function onState(state) {
      sendResponse({
        ok: true,
        state: state
      });
    });
    return true;
  }

  if (message.type === "neroa-live-view:panel:set-recording") {
    writeState({
      recordingEnabled: Boolean(message.payload && message.payload.enabled)
    }).then(function onRecording(state) {
      sendResponse({
        ok: true,
        state: state
      });
    });
    return true;
  }

  if (message.type === "neroa-live-view:panel:refresh-active-tab") {
    chrome.tabs.query({ active: true, currentWindow: true }).then(function onTabs(tabs) {
      var activeTab = tabs && tabs[0];
      if (!activeTab || typeof activeTab.id !== "number") {
        sendResponse({
          ok: false,
          error: "No active tab is available."
        });
        return;
      }

      Promise.allSettled([
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
          sendResponse({
            ok: false,
            error:
              failedResult && failedResult.reason && failedResult.reason.message
                ? failedResult.reason.message
                : "Unable to refresh the active tab."
          });
          return;
        }

        sendResponse({
          ok: true
        });
      });
    });

    return true;
  }

  if (message.type === "neroa-live-view:panel:open-workspace") {
    readState().then(function onState(state) {
      if (!state.connection) {
        sendResponse({
          ok: false,
          error: "No workspace is connected yet."
        });
        return;
      }

      var url =
        state.connection.bridgeOrigin +
        "/workspace/" +
        state.connection.workspaceId +
        "/project/" +
        state.connection.projectId +
        "/live-view";

      chrome.tabs.create({ url: url }).then(function afterOpen() {
        sendResponse({
          ok: true
        });
      });
    });

    return true;
  }
});
