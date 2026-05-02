"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode
} from "react";
import Link from "next/link";

const valuePills = [
  "Roadmap-First Planning",
  "Scope Before Execution",
  "Decisions & Approvals",
  "Evidence & Review",
  "Build & Execute"
] as const;

const neroaExplanation =
  "Neroa helps you turn a software idea into a structured project before anyone starts building. Most AI builders and dev shops jump straight from a vague prompt into code, which often creates messy rebuilds, unclear scope, wasted credits, and features that do not connect. Neroa works differently. We help define the product, map the roadmap, clarify the scope, capture key decisions, organize approvals, and prepare the project for controlled execution. The goal is to make the build visible, structured, and reviewable before real work begins, so you know what is being built, why it matters, what comes next, and where the risks are before money and time are wasted.";

function extractName(input: string) {
  const match = input.match(
    /\b(?:my name is|i am|i'm)\s+([a-z][a-z' -]{0,30})/i
  );

  if (!match) {
    return "";
  }

  return match[1]
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function PillSeparator() {
  return (
    <span
      aria-hidden="true"
      className="hidden shrink-0 items-center justify-center text-teal-200/70 lg:flex"
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
        <path
          d="M10 2.5 11.8 8.2 17.5 10l-5.7 1.8L10 17.5l-1.8-5.7L2.5 10l5.7-1.8L10 2.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function ChatAvatar({
  children,
  variant = "nero"
}: {
  children: ReactNode;
  variant?: "nero" | "visitor";
}) {
  return (
    <div
      className={[
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm",
        variant === "nero"
          ? "border-teal-300/30 bg-teal-300/10 text-teal-100 shadow-[0_0_24px_rgba(45,212,191,0.16)]"
          : "border-white/12 bg-white/8 text-white/78"
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function MessageRow({
  author,
  timestamp,
  body,
  avatar,
  variant = "nero"
}: {
  author: string;
  timestamp: string;
  body: string;
  avatar: ReactNode;
  variant?: "nero" | "visitor";
}) {
  return (
    <div className="flex gap-4 border-b border-white/8 pb-5 last:border-b-0 last:pb-0">
      <ChatAvatar variant={variant}>{avatar}</ChatAvatar>
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-white/34">
          <span>{author}</span>
          <span>{timestamp}</span>
        </div>
        <p className="text-[1.02rem] leading-8 text-white/88">{body}</p>
      </div>
    </div>
  );
}

export function NeroaFrontDoorSurface({
  isSignedIn = false
}: {
  isSignedIn?: boolean;
}) {
  const [draftMessage, setDraftMessage] = useState("");
  const [introMessage, setIntroMessage] = useState("");
  const [capturedName, setCapturedName] = useState("");
  const [conversationStep, setConversationStep] = useState<
    "intro" | "awaiting-name" | "complete"
  >("intro");
  const [thumbHeight, setThumbHeight] = useState(56);
  const [thumbOffset, setThumbOffset] = useState(0);
  const conversationRef = useRef<HTMLDivElement>(null);

  const nextProjectHref = isSignedIn ? "/neroa/project" : "/neroa/auth";
  const finalCtaLabel = "Let's Get Started";

  const messages = [
    {
      key: "neroa-hello",
      author: "Neroa",
      timestamp: "10:21 AM",
      body: "Hello.",
      avatar: "AI",
      variant: "nero" as const
    },
    ...(introMessage
      ? [
          {
            key: "visitor-intro",
            author: "Visitor",
            timestamp: "10:21 AM",
            body: introMessage,
            avatar:
              introMessage.trim().charAt(0).toUpperCase() || "V",
            variant: "visitor" as const
          },
          {
            key: "neroa-name",
            author: "Neroa",
            timestamp: "10:22 AM",
            body: "Hi, I'm Neroa. What's your name?",
            avatar: "AI",
            variant: "nero" as const
          }
        ]
      : []),
    ...(capturedName
      ? [
          {
            key: "visitor-name",
            author: capturedName,
            timestamp: "10:22 AM",
            body: capturedName,
            avatar: capturedName.charAt(0).toUpperCase(),
            variant: "visitor" as const
          },
          {
            key: "neroa-explainer",
            author: "Neroa",
            timestamp: "10:23 AM",
            body: neroaExplanation,
            avatar: "AI",
            variant: "nero" as const
          }
        ]
      : [])
  ];

  function syncScrollIndicator() {
    const element = conversationRef.current;

    if (!element) {
      return;
    }

    const visibleHeight = element.clientHeight;
    const totalHeight = element.scrollHeight;
    const maxScroll = Math.max(totalHeight - visibleHeight, 0);
    const nextThumbHeight = totalHeight > 0
      ? Math.max((visibleHeight / totalHeight) * visibleHeight, 42)
      : 42;
    const nextThumbOffset = maxScroll > 0
      ? (element.scrollTop / maxScroll) * Math.max(visibleHeight - nextThumbHeight, 0)
      : 0;

    setThumbHeight(nextThumbHeight);
    setThumbOffset(nextThumbOffset);
  }

  useEffect(() => {
    const element = conversationRef.current;

    if (!element) {
      return;
    }

    element.scrollTop = element.scrollHeight;
    syncScrollIndicator();
  }, [conversationStep, introMessage, capturedName]);

  useEffect(() => {
    syncScrollIndicator();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextMessage = draftMessage.trim();
    if (!nextMessage) {
      return;
    }

    if (conversationStep === "intro") {
      setIntroMessage(nextMessage);
      setDraftMessage(extractName(nextMessage));
      setConversationStep("awaiting-name");
      return;
    }

    if (conversationStep === "awaiting-name") {
      setCapturedName(nextMessage);
      setDraftMessage("");
      setConversationStep("complete");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080b] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_20%,rgba(255,244,219,0.15),transparent_10%),radial-gradient(circle_at_34%_20%,rgba(255,255,255,0.08),transparent_18%),linear-gradient(180deg,rgba(3,7,10,0.15),#05080b_72%)]" />
        <div className="absolute left-[18%] top-[8%] h-[32rem] w-[32rem] rounded-full border border-[#f7ead1]/30 shadow-[0_0_110px_rgba(255,236,198,0.18),inset_0_0_60px_rgba(255,236,198,0.05)]" />
        <div className="absolute left-[21%] top-[8%] h-[32rem] w-[32rem] rounded-full bg-[#05080b]/95" />
        <div className="absolute inset-x-0 bottom-0 h-[22rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.16),transparent_42%),linear-gradient(180deg,transparent,rgba(4,7,10,0.84)_64%,#05080b)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:88px_88px] opacity-20" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-6 py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/" className="font-serif text-[2.15rem] tracking-tight text-white">
            Neroa
          </Link>

          <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.18em] text-white/62 md:flex">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/neroa/pricing" className="transition hover:text-white">
              Pricing
            </Link>
            <Link href="/neroa/auth" className="transition hover:text-white">
              Sign In
            </Link>
            <Link
              href="/neroa/auth"
              className="inline-flex items-center rounded-full border border-teal-300/45 bg-teal-300/10 px-5 py-3 text-white shadow-[0_0_28px_rgba(45,212,191,0.12)] transition hover:border-teal-200/70 hover:bg-teal-300/16"
            >
              Start Your Project
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(28rem,0.92fr)] lg:gap-20 lg:py-20">
          <section className="max-w-4xl">
            <p className="text-sm uppercase tracking-[0.38em] text-teal-200/78">SaaS Done Right</p>

            <h1 className="mt-6 font-serif text-[clamp(4.6rem,11vw,10.5rem)] leading-[0.86] tracking-[-0.08em] text-white">
              SaaS
              <br />
              <span className="bg-gradient-to-r from-teal-200 via-teal-300 to-white bg-clip-text text-transparent">
                done
              </span>{" "}
              right.
            </h1>

            <p className="mt-8 max-w-2xl text-[clamp(1.2rem,2vw,1.8rem)] leading-relaxed text-white/72">
              Start with a structured plan, not a vague prompt.
            </p>

            <p className="mt-5 max-w-3xl text-[clamp(1rem,1.4vw,1.28rem)] leading-9 text-white/58">
              Neroa turns your idea into roadmap, scope, decisions, approvals, and a clear project path before execution begins.
            </p>
          </section>

          <section className="relative self-start lg:mt-8 flex h-[31rem] flex-col rounded-[2rem] border border-white/14 bg-black/42 p-6 shadow-[0_28px_110px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:h-[33rem] sm:p-8 lg:h-[37rem] lg:p-9">
            <div
              aria-hidden="true"
              className="scroll-rail pointer-events-none absolute bottom-8 right-4 top-28 w-px rounded-full bg-white/8"
            />
            <div
              aria-hidden="true"
              className="scroll-thumb pointer-events-none absolute right-[13px] w-[5px] rounded-full bg-gradient-to-b from-teal-200/85 via-teal-300/55 to-transparent shadow-[0_0_20px_rgba(45,212,191,0.28)] transition-all"
              style={{
                height: `${thumbHeight}px`,
                top: `calc(7rem + ${thumbOffset}px)`
              }}
            />

            <div className="border-b border-white/10 pb-5 pr-8">
              <h2 className="font-serif text-3xl tracking-tight text-white">Neroa</h2>
              <p className="mt-2 text-sm leading-7 text-white/46">
                Plan the project first, then move into the next step with structure.
              </p>
            </div>

            <div
              ref={conversationRef}
              onScroll={syncScrollIndicator}
              className="min-h-0 flex-1 space-y-5 overflow-y-auto py-6 pr-8"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(94,234,212,0.45) transparent"
              }}
            >
              {messages.map((message) => (
                <MessageRow
                  key={message.key}
                  author={message.author}
                  timestamp={message.timestamp}
                  body={message.body}
                  avatar={message.avatar}
                  variant={message.variant}
                />
              ))}
            </div>

            <div className="border-t border-white/10 pt-5 pr-8">
              {conversationStep === "complete" ? (
                <div className="rounded-[1.4rem] border border-white/12 bg-white/[0.04] p-3">
                  <Link
                    href={nextProjectHref}
                    className="flex items-center justify-between rounded-[1.1rem] bg-teal-300 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#071113] transition hover:bg-teal-200"
                  >
                    <span>{finalCtaLabel}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-[1.4rem] border border-white/12 bg-white/[0.035] p-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      placeholder={
                        conversationStep === "intro"
                          ? "Say hello or introduce yourself"
                          : "Tell Neroa your name"
                      }
                      aria-label={
                        conversationStep === "intro"
                          ? "Start the conversation"
                          : "Tell Neroa your name"
                      }
                      className="h-14 flex-1 bg-transparent px-4 text-base text-white outline-none placeholder:text-white/34"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-14 items-center justify-center rounded-full bg-teal-300 px-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#071113] transition hover:bg-teal-200"
                    >
                      {conversationStep === "intro" ? "Continue" : "Share Name"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>

        <section className="pb-10">
          <div className="flex flex-wrap items-center justify-center gap-y-3 lg:flex-nowrap lg:justify-between">
            {valuePills.map((pill, index) => (
              <div key={pill} className="flex items-center gap-3">
                {index > 0 ? <PillSeparator /> : null}
                <div className="flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/[0.035] px-3.5 py-2.5 text-center text-[0.68rem] font-semibold tracking-[0.16em] text-teal-200 shadow-[0_0_24px_rgba(45,212,191,0.05)] sm:px-4">
                  {pill}
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default NeroaFrontDoorSurface;
