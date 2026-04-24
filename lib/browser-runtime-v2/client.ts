"use client";

import type {
  BrowserRuntimeV2Action,
  BrowserRuntimeV2Command,
  BrowserRuntimeV2CommandResponse
} from "@/lib/browser-runtime-v2/contracts";

function createUnavailableResponse<TAction extends BrowserRuntimeV2Action>(
  action: TAction,
  error: string
): BrowserRuntimeV2CommandResponse {
  return {
    ok: false,
    action,
    error
  };
}

export function requestBrowserRuntimeCommand<TAction extends BrowserRuntimeV2Action>(
  command: BrowserRuntimeV2Command<TAction>
) {
  return new Promise<BrowserRuntimeV2CommandResponse>((resolve) => {
    if (typeof window === "undefined") {
      resolve(
        createUnavailableResponse(
          command.action,
          "Browser Runtime V2 is not available in this environment."
        )
      );
      return;
    }

    const requestId = `neroa-browser-runtime-v2-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2)}`;

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener(
        "neroa:browser-runtime-v2:response",
        onResponse as EventListener
      );
      window.removeEventListener("message", onWindowMessage as EventListener);
    }

    const timeout = window.setTimeout(() => {
      cleanup();
      resolve(
        createUnavailableResponse(
          command.action,
          "The Neroa Browser Runtime did not respond to the action request."
        )
      );
    }, 6000);

    function onResponse(event: Event) {
      const customEvent = event as CustomEvent<
        BrowserRuntimeV2CommandResponse & {
          requestId?: string;
        }
      >;

      if (customEvent.detail?.requestId !== requestId) {
        return;
      }

      cleanup();
      resolve({
        ok: Boolean(customEvent.detail?.ok),
        action: customEvent.detail?.action ?? command.action,
        error: customEvent.detail?.error ?? null,
        target: customEvent.detail?.target ?? null,
        state: customEvent.detail?.state ?? null,
        output: customEvent.detail?.output ?? null,
        notice: customEvent.detail?.notice ?? null
      });
    }

    function onWindowMessage(event: Event) {
      const messageEvent = event as MessageEvent<
        BrowserRuntimeV2CommandResponse & {
          requestId?: string;
          source?: string;
        }
      >;

      if (
        messageEvent.source !== window ||
        messageEvent.data?.source !== "neroa-browser-runtime-v2:response" ||
        messageEvent.data?.requestId !== requestId
      ) {
        return;
      }

      cleanup();
      resolve({
        ok: Boolean(messageEvent.data?.ok),
        action: messageEvent.data?.action ?? command.action,
        error: messageEvent.data?.error ?? null,
        target: messageEvent.data?.target ?? null,
        state: messageEvent.data?.state ?? null,
        output: messageEvent.data?.output ?? null,
        notice: messageEvent.data?.notice ?? null
      });
    }

    window.addEventListener(
      "neroa:browser-runtime-v2:response",
      onResponse as EventListener
    );
    window.addEventListener("message", onWindowMessage as EventListener);

    const payload = {
      requestId,
      command
    };

    window.dispatchEvent(
      new CustomEvent("neroa:browser-runtime-v2:command", {
        detail: payload
      })
    );

    window.postMessage(
      {
        source: "neroa-browser-runtime-v2:command",
        requestId,
        command
      },
      window.location.origin
    );
  });
}
