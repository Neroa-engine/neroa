"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { PublicActionLink } from "@/components/site/public-action-link";
import { publicLaunchDiyPath } from "@/lib/data/public-launch";
import { APP_ROUTES } from "@/lib/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const previewConversationRows = [
  {
    prompt: "What do you want to build?",
    response:
      "A calm product system that keeps scope, preview, and approvals visible from the first idea."
  },
  {
    prompt: "Who is it for?",
    response:
      "Founders and operators who need a clear first release before the build gets wider."
  },
  {
    prompt: "What's the first release?",
    response:
      "Strategy Room, roadmap framing, preview, inspection, revisions, and approvals in one guided thread."
  }
] as const;

type NeroaChatCardProps = {
  mode?: "preview" | "starter";
  initialAuthenticated?: boolean;
  summaryPlacement?: "below" | "header-side";
};

type StarterPhase = "idle" | "collecting-name" | "guided";

type StarterMessage =
  | {
      id: string;
      role: "assistant";
      text: string;
    }
  | {
      id: string;
      role: "user";
      text: string;
    };

function buildStarterMessages({
  phase,
  name
}: {
  phase: StarterPhase;
  name: string;
}): StarterMessage[] {
  if (phase === "idle") {
    return [];
  }

  const messages: StarterMessage[] = [
    {
      id: "hello",
      role: "assistant",
      text: "Hi, I\u2019m Neroa. What\u2019s your name?"
    }
  ];

  if (phase !== "guided" || !name) {
    return messages;
  }

  messages.push(
    {
      id: "name",
      role: "user",
      text: name
    },
    {
      id: "intro",
      role: "assistant",
      text:
        `Hi, ${name}. I\u2019m Neroa.\n\nI help turn an idea into a visible product path through strategy, roadmap, preview, inspection, approvals, and refinement.\n\nWhat makes Neroa different is that planning and execution stay connected instead of fragmented, so the experience feels premium, guided, and clear rather than chaotic or tool-heavy.`
    },
    {
      id: "ready",
      role: "assistant",
      text: "Let\u2019s get started."
    }
  );

  return messages;
}

export function NeroaChatCard({
  mode = "preview",
  initialAuthenticated = false,
  summaryPlacement = "below"
}: NeroaChatCardProps) {
  const [phase, setPhase] = useState<StarterPhase>("idle");
  const [draftName, setDraftName] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(initialAuthenticated);
  const inputId = useId();
  const normalizedName = draftName.trim();

  useEffect(() => {
    let active = true;

    try {
      const supabase = createSupabaseBrowserClient();

      void supabase.auth.getUser().then(({ data }) => {
        if (!active) {
          return;
        }

        setIsAuthenticated(Boolean(data.user));
      });

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) {
          return;
        }

        setIsAuthenticated(Boolean(session?.user));
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    } catch {
      setIsAuthenticated(initialAuthenticated);

      return () => {
        active = false;
      };
    }
  }, [initialAuthenticated]);

  const starterMessages = useMemo(() => {
    if (mode !== "starter") {
      return [];
    }

    return buildStarterMessages({
      phase,
      name: submittedName
    });
  }, [mode, phase, submittedName]);
  const starterCtaHref = isAuthenticated ? APP_ROUTES.projects : APP_ROUTES.startDiy;
  const summaryInHeader = summaryPlacement === "header-side";

  function activateStarter() {
    if (mode !== "starter") {
      return;
    }

    setPhase((currentPhase) => (currentPhase === "idle" ? "collecting-name" : currentPhase));
  }

  function handleStarterDraftNameChange(value: string) {
    if (phase === "idle") {
      setPhase("collecting-name");
    }

    setDraftName(value);
  }

  function handleStarterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    activateStarter();

    if (!normalizedName) {
      setPhase("collecting-name");
      return;
    }

    setSubmittedName(normalizedName);
    setPhase("guided");
  }

  return (
    <div
      className="ai-builder-product-card"
      onClick={mode === "starter" ? activateStarter : undefined}
      onFocusCapture={mode === "starter" ? activateStarter : undefined}
      onPointerDownCapture={mode === "starter" ? activateStarter : undefined}
    >
      <div
        className={`ai-builder-product-card-header ${
          summaryInHeader ? "ai-builder-product-card-header-summary-side" : ""
        }`.trim()}
      >
        <div className="ai-builder-product-card-header-main">
          <span className="premium-pill border-[rgba(118,179,232,0.18)] bg-[rgba(7,14,25,0.84)] text-[#9ED9FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            Neroa conversation
          </span>
          <h2 className="ai-builder-product-card-title">
            Start with a guided planning conversation.
          </h2>
        </div>
        <span className="ai-builder-product-card-status">Planning chat</span>
        {summaryInHeader ? (
          <p className="ai-builder-product-card-summary ai-builder-product-card-summary-header-side">
            Neroa helps turn your software idea into a structured roadmap before execution, so you
            can reduce rework, protect credits, and stay mobile-ready from the beginning.
          </p>
        ) : null}
      </div>

      {summaryInHeader ? null : (
        <p className="ai-builder-product-card-summary">
          Neroa helps turn your software idea into a structured roadmap before execution, so you can
          reduce rework, protect credits, and stay mobile-ready from the beginning.
        </p>
      )}

      <div
        className="ai-builder-chat-thread thin-scrollbar"
        aria-label={
          mode === "starter"
            ? "Neroa front-door smart chat"
            : "Neroa guided conversation preview"
        }
      >
        {mode === "starter"
          ? starterMessages.map((message) =>
              message.role === "assistant" ? (
                <div key={message.id} className="ai-builder-chat-row">
                  <div
                    className={`ai-builder-chat-prompt ${
                      message.id === "hello" ? "ai-builder-chat-prompt-opening" : ""
                    }`.trim()}
                  >
                    <span className="ai-builder-chat-dot" aria-hidden="true" />
                    <p>{message.text}</p>
                  </div>
                </div>
              ) : (
                <div key={message.id} className="ai-builder-chat-row">
                  <div className="ai-builder-chat-response ai-builder-chat-response-user">
                    <p>{message.text}</p>
                  </div>
                </div>
              )
            )
          : previewConversationRows.map((row) => (
              <div key={row.prompt} className="ai-builder-chat-row">
                <div className="ai-builder-chat-prompt">
                  <span className="ai-builder-chat-dot" aria-hidden="true" />
                  <p>{row.prompt}</p>
                </div>
                <div className="ai-builder-chat-response">
                  <p>{row.response}</p>
                </div>
              </div>
            ))}
      </div>

      {mode === "starter" ? (
        phase === "guided" ? (
          <div className="ai-builder-chat-composer ai-builder-chat-cta-stack">
            <Link
              href={starterCtaHref}
              className="button-primary ai-builder-chat-cta ai-builder-chat-cta-centered"
              prefetch
            >
              Let&apos;s get started
            </Link>
          </div>
        ) : (
          <form className="ai-builder-chat-composer ai-builder-chat-form" onSubmit={handleStarterSubmit}>
            <label className="ai-builder-chat-input" htmlFor={inputId}>
              <span className="ai-builder-chat-input-label">
                {phase === "idle" ? "Start the conversation" : "Your name"}
              </span>
              <input
                id={inputId}
                className="ai-builder-chat-entry-input"
                type="text"
                value={draftName}
                onChange={(event) => handleStarterDraftNameChange(event.target.value)}
                onClick={activateStarter}
                onFocus={activateStarter}
                placeholder={
                  phase === "idle"
                    ? "Click here to start the conversation..."
                    : "Enter your name..."
                }
                autoComplete="name"
              />
            </label>
            <button type="submit" className="button-primary ai-builder-chat-cta">
              Continue
            </button>
          </form>
        )
      ) : (
        <div className="ai-builder-chat-composer">
          <div className="ai-builder-chat-input">
            <span className="ai-builder-chat-input-label">Type the idea...</span>
            <p>Share the product, customer, or first release.</p>
          </div>
          <PublicActionLink
            href={publicLaunchDiyPath}
            label="Start a conversation"
            className="button-primary ai-builder-chat-cta"
            initialAuthenticated={initialAuthenticated}
          />
        </div>
      )}
    </div>
  );
}
