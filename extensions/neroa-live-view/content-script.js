(function installNeroaLiveViewContentScript() {
  if (window.__NEROA_LIVE_VIEW_CONTENT_SCRIPT__) {
    return;
  }

  window.__NEROA_LIVE_VIEW_CONTENT_SCRIPT__ = true;

  var pendingRuntimeIssues = [];
  var pendingActionLogs = [];
  var lastLocationHref = window.location.href;
  var inspectTimer = null;
  var isLiveViewControlPage = false;
  var lastConnectionSignature = null;
  var connectionCheckTimer = null;

  function sendMessage(payload) {
    try {
      chrome.runtime.sendMessage(payload);
    } catch {
      // Ignore extension runtime disconnects during development reloads.
    }
  }

  function respondToLiveViewCommand(requestId, payload) {
    window.dispatchEvent(
      new CustomEvent("neroa:live-view-command-response", {
        detail: Object.assign(
          {
            requestId: requestId
          },
          payload || {}
        )
      })
    );
  }

  function respondToLiveViewWindowMessage(requestId, payload) {
    window.postMessage(
      Object.assign(
        {
          source: "neroa-live-view-command-response",
          requestId: requestId
        },
        payload || {}
      ),
      window.location.origin
    );
  }

  function respondToBrowserRuntimeV2Command(requestId, respond, response, fallbackError) {
    respond(requestId, {
      ok: Boolean(response && response.ok),
      action: response && response.action ? response.action : null,
      error:
        response && response.ok
          ? null
          : response && response.error
            ? response.error
            : fallbackError,
      target: response && response.target ? response.target : null,
      state: response && response.state ? response.state : null,
      output: response && response.output ? response.output : null,
      notice: response && response.notice ? response.notice : null
    });
  }

  function requestBrowserRuntimeV2Command(requestId, respond, command, fallbackError) {
    try {
      chrome.runtime.sendMessage(
        {
          type: "neroa-browser-runtime-v2:command",
          command: command
        },
        function onCommandResponse(response) {
          if (chrome.runtime.lastError) {
            respond(requestId, {
              ok: false,
              error:
                chrome.runtime.lastError.message ||
                fallbackError ||
                "Unable to reach the Neroa Browser Runtime."
            });
            return;
          }

          respondToBrowserRuntimeV2Command(
            requestId,
            respond,
            response,
            fallbackError || "Unable to complete the browser action."
          );
        }
      );
    } catch (error) {
      respond(requestId, {
        ok: false,
        error:
          error && error.message
            ? error.message
            : fallbackError || "Unable to complete the browser action."
      });
    }
  }

  function requestExplicitInspection(requestId, respond, connectionOverride) {
    requestBrowserRuntimeV2Command(
      requestId,
      respond,
      {
        action: "inspect.run",
        surface: isLiveViewControlPage ? "live_view" : "command_center",
        connectionOverride: connectionOverride || null
      },
      "Unable to trigger an explicit inspection."
    );
  }

  function injectBridgeScript() {
    if (document.getElementById("neroa-live-view-page-bridge")) {
      return;
    }

    var script = document.createElement("script");
    script.id = "neroa-live-view-page-bridge";
    script.src = chrome.runtime.getURL("page-bridge.js");
    script.async = false;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }

  function isPotentialLiveViewPage(url) {
    try {
      return new URL(url || window.location.href, window.location.origin).pathname.indexOf("/live-view") !== -1;
    } catch {
      return window.location.pathname.indexOf("/live-view") !== -1;
    }
  }

  function isVisible(element) {
    if (!element) {
      return false;
    }

    var style = window.getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0" ||
      element.getAttribute("aria-hidden") === "true"
    ) {
      return false;
    }

    var rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function normalizeText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function createId(prefix, index) {
    return prefix + "-" + index;
  }

  function readConnectionBeacon() {
    var raw = document.getElementById("neroa-live-view-connection");
    if (raw && raw.textContent) {
      try {
        return JSON.parse(raw.textContent);
      } catch {
        // Fall through to the attribute beacon below.
      }
    }

    var beacon = document.querySelector("[data-neroa-live-view-connection='true']");
    if (!beacon) {
      return null;
    }

    var sessionId = beacon.getAttribute("data-session-id");
    var workspaceId = beacon.getAttribute("data-workspace-id");
    var projectId = beacon.getAttribute("data-project-id");
    var token = beacon.getAttribute("data-token");
    var projectTitle = beacon.getAttribute("data-project-title");
    var bridgeOrigin = beacon.getAttribute("data-bridge-origin");
    var allowedOrigins = beacon.getAttribute("data-allowed-origins");
    var runtimeTarget = beacon.getAttribute("data-runtime-target");

    if (!sessionId || !workspaceId || !projectId || !bridgeOrigin || !token) {
      return null;
    }

    try {
      allowedOrigins = allowedOrigins ? JSON.parse(allowedOrigins) : [];
    } catch {
      allowedOrigins = [];
    }

    try {
      runtimeTarget = runtimeTarget ? JSON.parse(runtimeTarget) : null;
    } catch {
      runtimeTarget = null;
    }

    return {
      sessionId: sessionId,
      token: token,
      workspaceId: workspaceId,
      projectId: projectId,
      bridgeOrigin: bridgeOrigin,
      projectTitle: projectTitle || document.title || "Neroa Live View",
      allowedOrigins: Array.isArray(allowedOrigins) ? allowedOrigins : [],
      runtimeTarget: runtimeTarget
    };
  }

  function collectVisibleText() {
    var elements = document.querySelectorAll("h1,h2,h3,h4,p,li,button,a,label,legend,[data-guide-target]");
    var values = [];

    Array.prototype.forEach.call(elements, function eachElement(element) {
      if (!isVisible(element)) {
        return;
      }

      var text = normalizeText(element.innerText || element.textContent || "");
      if (!text) {
        return;
      }

      values.push(text);
    });

    return values.slice(0, 120);
  }

  function collectHeadings() {
    return Array.prototype.slice
      .call(document.querySelectorAll("h1,h2,h3"))
      .map(function mapHeading(element) {
        return normalizeText(element.textContent || "");
      })
      .filter(Boolean)
      .slice(0, 16);
  }

  function detectControlKind(element) {
    var tag = element.tagName.toLowerCase();
    if (tag === "button") {
      return "button";
    }
    if (tag === "a") {
      return "link";
    }
    if (tag === "input") {
      return "input";
    }
    if (tag === "select") {
      return "select";
    }
    if (tag === "textarea") {
      return "textarea";
    }
    if (element.getAttribute("role") === "dialog") {
      return "modal";
    }
    if (element.getAttribute("role") === "menu" || element.getAttribute("role") === "menuitem") {
      return "menu";
    }
    if (tag === "section") {
      return "section";
    }
    return "other";
  }

  function collectControls() {
    var selector =
      "button,a,input,select,textarea,[role='button'],[role='link'],[role='menu'],[role='menuitem'],[role='dialog'],section";
    var elements = document.querySelectorAll(selector);

    return Array.prototype.slice
      .call(elements)
      .filter(isVisible)
      .slice(0, 100)
      .map(function mapControl(element, index) {
        return {
          id: element.id || createId("control", index),
          kind: detectControlKind(element),
          tagName: element.tagName.toLowerCase(),
          text: normalizeText(element.innerText || element.textContent || ""),
          label: normalizeText(element.getAttribute("aria-label") || element.getAttribute("name") || "") || null,
          href: element.getAttribute("href"),
          role: element.getAttribute("role"),
          type: element.getAttribute("type"),
          visible: true,
          disabled: Boolean(element.disabled || element.getAttribute("aria-disabled") === "true")
        };
      });
  }

  function collectSections() {
    var elements = document.querySelectorAll("main section, [data-guide-target], [role='dialog'], header, footer");
    return Array.prototype.slice
      .call(elements)
      .filter(isVisible)
      .slice(0, 24)
      .map(function mapSection(element, index) {
        var heading = element.querySelector("h1,h2,h3,h4");
        var description = element.querySelector("p");
        return {
          id: element.id || createId("section", index),
          label: normalizeText(heading ? heading.textContent || "" : element.getAttribute("aria-label") || "") || "Section",
          heading: normalizeText(heading ? heading.textContent || "" : "") || null,
          description: normalizeText(description ? description.textContent || "" : "") || null
        };
      });
  }

  function focusableControls() {
    var selector =
      "button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1']),[role='button'],[role='link']";

    return Array.prototype.slice
      .call(document.querySelectorAll(selector))
      .filter(isVisible);
  }

  function findWalkthroughTarget(mode) {
    var controls = focusableControls();
    if (!controls.length) {
      return null;
    }

    var activeElement = document.activeElement;
    var activeIndex = controls.indexOf(activeElement);

    if (mode === "focus-next") {
      return controls[(activeIndex + 1 + controls.length) % controls.length];
    }

    if (mode === "activate-focused") {
      if (activeElement && controls.indexOf(activeElement) !== -1) {
        return activeElement;
      }
    }

    return controls[0];
  }

  function describeWalkthroughTarget(target) {
    if (!target) {
      return null;
    }

    return {
      label:
        normalizeText(
          target.innerText ||
            target.textContent ||
            target.getAttribute("aria-label") ||
            target.getAttribute("name") ||
            ""
        ) || target.tagName.toLowerCase(),
      tagName: target.tagName.toLowerCase(),
      href: target.getAttribute("href"),
      role: target.getAttribute("role")
    };
  }

  function runWalkthroughStep(mode) {
    var snapshot = createSnapshot("manual-refresh");
    var target = findWalkthroughTarget(mode);
    var targetDescription = describeWalkthroughTarget(target);
    var summary =
      "Scanned " +
      snapshot.controls.length +
      " controls on " +
      snapshot.page.url +
      ".";
    var nextActionLabel = targetDescription
      ? (mode === "activate-focused" ? "Activated " : "Focus ") + targetDescription.label
      : "Review the current page and choose the next step.";

    if (mode === "focus-next" && target && typeof target.focus === "function") {
      target.focus();
      pushAction("navigation", "Walkthrough focused " + targetDescription.label, null);
      summary =
        "Focused the next actionable control: " + targetDescription.label + ".";
    }

    if (mode === "activate-focused" && target) {
      if (typeof target.click === "function") {
        target.click();
        pushAction("click", "Walkthrough activated " + targetDescription.label, targetDescription.href || null);
        summary =
          "Activated the focused control: " + targetDescription.label + ".";
      }
    }

    return {
      ok: true,
      snapshot: snapshot,
      target: targetDescription,
      summary: summary,
      nextActionLabel: nextActionLabel,
      mode: mode
    };
  }

  function detectCurrentStep() {
    var currentStep =
      document.querySelector("[data-onboarding-step]") ||
      document.querySelector("[aria-current='step']") ||
      document.querySelector("[data-current-step]");

    if (currentStep) {
      return normalizeText(currentStep.textContent || currentStep.getAttribute("data-onboarding-step") || "");
    }

    var headline = document.querySelector("h1,h2");
    if (headline) {
      return normalizeText(headline.textContent || "");
    }

    return null;
  }

  function collectMetrics() {
    var root = document.documentElement;
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth: root.scrollWidth,
      scrollHeight: root.scrollHeight,
      horizontalOverflow: root.scrollWidth > window.innerWidth + 4,
      modalOpen: Boolean(document.querySelector("[role='dialog'], [aria-modal='true']"))
    };
  }

  function createSnapshot(trigger) {
    return {
      trigger: trigger,
      page: {
        url: window.location.href,
        pathname: window.location.pathname,
        title: document.title || "",
        hostname: window.location.hostname
      },
      currentStep: detectCurrentStep(),
      headings: collectHeadings(),
      visibleText: collectVisibleText(),
      controls: collectControls(),
      sections: collectSections(),
      runtimeIssues: pendingRuntimeIssues.splice(0, pendingRuntimeIssues.length),
      metrics: collectMetrics()
    };
  }

  function flushActions() {
    return pendingActionLogs.splice(0, pendingActionLogs.length);
  }

  function requestInspection(trigger) {
    if (isLiveViewControlPage || isPotentialLiveViewPage(window.location.href)) {
      return;
    }

    sendMessage({
      type: "neroa-live-view:inspect",
      payload: {
        snapshot: createSnapshot(trigger),
        actionLogs: flushActions()
      }
    });
  }

  function scheduleInspection(trigger, delay) {
    if (inspectTimer) {
      window.clearTimeout(inspectTimer);
    }

    inspectTimer = window.setTimeout(function onInspectTimer() {
      requestInspection(trigger);
    }, delay);
  }

  function pushAction(type, label, detail) {
    pendingActionLogs.push({
      id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
      type: type,
      label: label,
      detail: detail || null,
      url: window.location.href
    });
  }

  function broadcastConnection(connection) {
    var signature = [
      connection.sessionId || "",
      connection.workspaceId || "",
      connection.projectId || "",
      connection.bridgeOrigin || ""
    ].join(":");

    if (signature && signature === lastConnectionSignature) {
      return;
    }

    lastConnectionSignature = signature;
    sendMessage({
      type: "neroa-live-view:connection-found",
      payload: connection
    });
  }

  function initializeConnectionBeacon() {
    var connection = readConnectionBeacon();
    isLiveViewControlPage = Boolean(connection);

    if (connection) {
      broadcastConnection(connection);
    }
  }

  function scheduleConnectionCheck(delay) {
    if (connectionCheckTimer) {
      window.clearTimeout(connectionCheckTimer);
    }

    connectionCheckTimer = window.setTimeout(function onConnectionTimer() {
      initializeConnectionBeacon();
    }, delay);
  }

  window.addEventListener("neroa:live-view-event", function onLiveViewEvent(event) {
    var detail = event.detail || {};
    if (detail.type === "runtime" && detail.payload) {
      pendingRuntimeIssues.push({
        id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
        kind: detail.payload.kind || "console-error",
        message: detail.payload.message || "Runtime issue",
        source: detail.payload.source || null,
        statusCode: detail.payload.statusCode || null,
        url: detail.payload.url || window.location.href,
        createdAt: detail.timestamp || new Date().toISOString()
      });
      scheduleInspection("runtime-signal", 300);
      return;
    }

    if (detail.type === "location" && detail.payload && detail.payload.url !== lastLocationHref) {
      lastLocationHref = detail.payload.url;
      pushAction("navigation", "Route changed", detail.payload.url);
      scheduleConnectionCheck(80);
      scheduleInspection("navigation", 500);
    }
  });

  window.addEventListener("neroa:live-view-command", function onLiveViewCommand(event) {
    var detail = event.detail || {};
    if (!detail || !detail.type || !detail.requestId) {
      return;
    }

    if (detail.type === "run-explicit-inspection") {
      requestExplicitInspection(
        detail.requestId,
        respondToLiveViewCommand,
        detail.connectionOverride || null
      );
    }
  });

  window.addEventListener("neroa:browser-runtime-v2:command", function onBrowserRuntimeV2Command(event) {
    var detail = event.detail || {};
    if (!detail || !detail.requestId || !detail.command || !detail.command.action) {
      return;
    }

    requestBrowserRuntimeV2Command(
      detail.requestId,
      function respondV2(requestId, payload) {
        window.dispatchEvent(
          new CustomEvent("neroa:browser-runtime-v2:response", {
            detail: Object.assign(
              {
                requestId: requestId
              },
              payload || {}
            )
          })
        );
      },
      detail.command,
      "Unable to complete the Browser Runtime V2 command."
    );
  });

  window.addEventListener("message", function onLiveViewCommandMessage(event) {
    if (event.source !== window) {
      return;
    }

    var detail = event.data || {};
    if (
      !detail ||
      detail.source !== "neroa-live-view-command" ||
      !detail.type ||
      !detail.requestId
    ) {
      return;
    }

    if (detail.type === "run-explicit-inspection") {
      requestExplicitInspection(
        detail.requestId,
        respondToLiveViewWindowMessage,
        detail.connectionOverride || null
      );
    }
  });

  window.addEventListener("message", function onBrowserRuntimeV2CommandMessage(event) {
    if (event.source !== window) {
      return;
    }

    var detail = event.data || {};
    if (
      !detail ||
      detail.source !== "neroa-browser-runtime-v2:command" ||
      !detail.requestId ||
      !detail.command ||
      !detail.command.action
    ) {
      return;
    }

    requestBrowserRuntimeV2Command(
      detail.requestId,
      function respondV2(requestId, payload) {
        window.postMessage(
          Object.assign(
            {
              source: "neroa-browser-runtime-v2:response",
              requestId: requestId
            },
            payload || {}
          ),
          window.location.origin
        );
      },
      detail.command,
      "Unable to complete the Browser Runtime V2 command."
    );
  });

  document.addEventListener(
    "click",
    function onClick(event) {
      var target = event.target && event.target.closest ? event.target.closest("button,a,[role='button'],[role='link']") : null;
      if (!target) {
        return;
      }

      pushAction(
        "click",
        normalizeText(target.innerText || target.textContent || target.getAttribute("aria-label") || "Clicked control"),
        target.getAttribute("href") || target.getAttribute("data-href") || null
      );
      scheduleInspection("click", 450);
    },
    true
  );

  document.addEventListener(
    "submit",
    function onSubmit(event) {
      var target = event.target;
      pushAction(
        "submit",
        target && target.getAttribute ? normalizeText(target.getAttribute("aria-label") || "Form submitted") : "Form submitted",
        null
      );
      scheduleInspection("submit", 450);
    },
    true
  );

  var observer = new MutationObserver(function onMutation() {
    scheduleConnectionCheck(80);
    scheduleInspection("dom-change", 1200);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: false
  });

  chrome.runtime.onMessage.addListener(function onRuntimeMessage(message, sender, sendResponse) {
    if (!message) {
      return;
    }

    if (message.type === "neroa-live-view:force-inspect") {
      requestInspection("manual-refresh");
      sendResponse({
        ok: true
      });
      return;
    }

    if (message.type === "neroa-browser-runtime-v2:walkthrough-step") {
      sendResponse(runWalkthroughStep(message.mode || "scan"));
      return;
    }

    if (message.type === "neroa-live-view:refresh-connection") {
      initializeConnectionBeacon();
      sendResponse({
        ok: true
      });
      return;
    }

  });

  injectBridgeScript();
  initializeConnectionBeacon();
  window.setTimeout(function delayedConnectionCheck() {
    initializeConnectionBeacon();
  }, 150);
  window.setTimeout(function secondDelayedConnectionCheck() {
    initializeConnectionBeacon();
  }, 700);
  window.addEventListener("load", function onLoad() {
    scheduleConnectionCheck(60);
  });
  document.addEventListener("visibilitychange", function onVisibilityChange() {
    if (document.visibilityState === "visible") {
      scheduleConnectionCheck(60);
    }
  });
  window.setInterval(function periodicConnectionCheck() {
    initializeConnectionBeacon();
  }, 2500);
  pushAction("page-load", "Page loaded", window.location.href);
  scheduleInspection("page-load", 1200);
})();
