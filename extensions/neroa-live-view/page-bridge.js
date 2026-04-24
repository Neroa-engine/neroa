(function installNeroaLiveViewBridge() {
  if (window.__NEROA_LIVE_VIEW_BRIDGE__) {
    return;
  }

  window.__NEROA_LIVE_VIEW_BRIDGE__ = true;

  function emit(type, detail) {
    window.dispatchEvent(
      new CustomEvent("neroa:live-view-event", {
        detail: {
          type: type,
          payload: detail,
          timestamp: new Date().toISOString()
        }
      })
    );
  }

  function shouldIgnoreRuntimeSignal(message) {
    return /NEXT_REDIRECT/i.test(message || "");
  }

  function serialize(args) {
    return args
      .map(function mapArg(item) {
        if (typeof item === "string") {
          return item;
        }

        if (item instanceof Error) {
          return item.message;
        }

        try {
          return JSON.stringify(item);
        } catch {
          return String(item);
        }
      })
      .join(" ");
  }

  var originalConsoleError = console.error;
  console.error = function wrappedConsoleError() {
    var message = serialize(Array.prototype.slice.call(arguments));
    if (!shouldIgnoreRuntimeSignal(message)) {
      emit("runtime", {
        kind: "console-error",
        message: message,
        source: window.location.href,
        statusCode: null,
        url: window.location.href
      });
    }
    return originalConsoleError.apply(console, arguments);
  };

  var originalConsoleWarn = console.warn;
  console.warn = function wrappedConsoleWarn() {
    var message = serialize(Array.prototype.slice.call(arguments));
    if (!shouldIgnoreRuntimeSignal(message)) {
      emit("runtime", {
        kind: "console-warn",
        message: message,
        source: window.location.href,
        statusCode: null,
        url: window.location.href
      });
    }
    return originalConsoleWarn.apply(console, arguments);
  };

  window.addEventListener("error", function onError(event) {
    if (shouldIgnoreRuntimeSignal(event.message || "")) {
      return;
    }

    emit("runtime", {
      kind: /hydration/i.test(event.message || "") ? "hydration-error" : "window-error",
      message: event.message || "Unhandled window error",
      source: event.filename || window.location.href,
      statusCode: null,
      url: window.location.href
    });
  });

  window.addEventListener("unhandledrejection", function onRejection(event) {
    var reason = event.reason;
    var message = reason && reason.message ? reason.message : String(reason);
    if (shouldIgnoreRuntimeSignal(message)) {
      return;
    }

    emit("runtime", {
      kind: "unhandled-rejection",
      message: message,
      source: window.location.href,
      statusCode: null,
      url: window.location.href
    });
  });

  if (window.fetch) {
    var originalFetch = window.fetch;
    window.fetch = function wrappedFetch() {
      var args = Array.prototype.slice.call(arguments);
      var requestTarget = typeof args[0] === "string" ? args[0] : args[0] && args[0].url ? args[0].url : window.location.href;

      return originalFetch.apply(window, args).then(
        function onResolve(response) {
          if (response.status >= 400) {
            emit("runtime", {
              kind: response.status >= 500 ? "route-error" : "network-failure",
              message: "Request failed with status " + response.status,
              source: "fetch",
              statusCode: response.status,
              url: requestTarget
            });
          }

          return response;
        },
        function onReject(error) {
          emit("runtime", {
            kind: "network-failure",
            message: error && error.message ? error.message : "Fetch request failed",
            source: "fetch",
            statusCode: null,
            url: requestTarget
          });
          throw error;
        }
      );
    };
  }

  if (window.XMLHttpRequest) {
    var originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function wrappedSend() {
      var request = this;
      var requestUrl = request.responseURL || window.location.href;

      request.addEventListener("loadend", function onLoadEnd() {
        if (request.status >= 400) {
          emit("runtime", {
            kind: request.status >= 500 ? "route-error" : "network-failure",
            message: "XHR failed with status " + request.status,
            source: "xhr",
            statusCode: request.status,
            url: request.responseURL || requestUrl
          });
        }
      });

      return originalSend.apply(this, arguments);
    };
  }

  function announceLocation() {
    emit("location", {
      url: window.location.href,
      title: document.title
    });
  }

  ["pushState", "replaceState"].forEach(function wrapHistoryMethod(methodName) {
    var original = history[methodName];
    history[methodName] = function wrappedHistoryMethod() {
      var result = original.apply(history, arguments);
      window.setTimeout(announceLocation, 0);
      return result;
    };
  });

  window.addEventListener("popstate", function onPopState() {
    window.setTimeout(announceLocation, 0);
  });

  announceLocation();
})();
