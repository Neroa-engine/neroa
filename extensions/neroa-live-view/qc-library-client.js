(function registerNeroaQcLibraryClient(globalScope) {
  function ensureConnection(connection) {
    if (!connection || !connection.bridgeOrigin || !connection.token) {
      throw new Error("No active Neroa Live View session is connected yet.");
    }
  }

  async function postJson(connection, path, payload) {
    ensureConnection(connection);

    var response = await fetch(connection.bridgeOrigin + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + connection.token
      },
      body: JSON.stringify(payload)
    });
    var json = await response.json().catch(function onParseFailure() {
      return null;
    });

    if (!response.ok) {
      throw new Error(
        json && json.error ? json.error : "Unable to write browser QC assets."
      );
    }

    return json;
  }

  globalScope.naroaQcLibraryClient = {
    createQcReport: function createQcReport(connection, payload) {
      return postJson(connection, "/api/live-view/qc/reports", payload);
    },
    updateQcReport: function updateQcReport(connection, payload) {
      return postJson(connection, "/api/live-view/qc/reports", payload);
    },
    createQcRecording: function createQcRecording(connection, payload) {
      return postJson(connection, "/api/live-view/qc/recordings", payload);
    },
    updateQcRecording: function updateQcRecording(connection, payload) {
      return postJson(connection, "/api/live-view/qc/recordings", payload);
    },
    attachRecordingToReport: function attachRecordingToReport(connection, payload) {
      return postJson(connection, "/api/live-view/qc/link", payload);
    }
  };
})(self);
