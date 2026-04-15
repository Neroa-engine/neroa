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

    if (!sessionId || !workspaceId || !projectId || !bridgeOrigin || !token) {
      return null;
    }

    try {
      allowedOrigins = allowedOrigins ? JSON.parse(allowedOrigins) : [];
    } catch {
      allowedOrigins = [];
    }

    return {
      sessionId: sessionId,
      token: token,
      workspaceId: workspaceId,
      projectId: projectId,
      bridgeOrigin: bridgeOrigin,
      projectTitle: projectTitle || document.title || "Neroa Live View",
      allowedOrigins: Array.isArray(allowedOrigins) ? allowedOrigins : []
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
    if (isLiveViewControlPage) {
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
      scheduleConnectionCheck(250);
      scheduleInspection("navigation", 500);
    }
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
    scheduleConnectionCheck(200);
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
  window.setInterval(function periodicConnectionCheck() {
    initializeConnectionBeacon();
  }, 2500);
  pushAction("page-load", "Page loaded", window.location.href);
  scheduleInspection("page-load", 1200);
})();
