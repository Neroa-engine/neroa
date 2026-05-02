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

function NorthStarIcon({
  className = ""
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 1.8 11.8 8.2 18.2 10l-6.4 1.8L10 18.2l-1.8-6.4L1.8 10l6.4-1.8L10 1.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="1.1" fill="currentColor" />
    </svg>
  );
}

function ChatMessage({
  speaker,
  body,
  tone = "nero"
}: {
  speaker: string;
  body: string;
  tone?: "nero" | "visitor";
}) {
  return (
    <div className="space-y-2">
      <div
        className={[
          "text-[0.68rem] font-semibold uppercase tracking-[0.26em]",
          tone === "nero" ? "text-teal-200/76" : "text-white/42"
        ].join(" ")}
      >
        {speaker}
      </div>
      <p
        className={[
          "max-w-[34rem] text-[1rem] leading-8",
          tone === "nero" ? "text-white/88" : "text-white/66"
        ].join(" ")}
      >
        {body}
      </p>
    </div>
  );
}

function ChipDivider({
  className = ""
}: {
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        "hidden items-center justify-center text-teal-200/72 lg:flex",
        className
      ].join(" ")}
    >
      <NorthStarIcon className="h-3.5 w-3.5" />
    </span>
  );
}

export function NeroaFrontDoorSurface({
  isSignedIn = false
}: {
  isSignedIn?: boolean;
}) {
  const [draftName, setDraftName] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [thumbHeight, setThumbHeight] = useState(56);
  const [thumbOffset, setThumbOffset] = useState(0);
  const conversationRef = useRef<HTMLDivElement>(null);

  const nextProjectHref = isSignedIn ? "/neroa/project" : "/neroa/auth";
  const hasStarted = submittedName.trim().length > 0;
  const finalName = submittedName.trim();

  function syncScrollIndicator() {
    const element = conversationRef.current;

    if (!element) {
      return;
    }

    const visibleHeight = element.clientHeight;
    const totalHeight = element.scrollHeight;
    const maxScroll = Math.max(totalHeight - visibleHeight, 0);
    const nextHeight = totalHeight > 0
      ? Math.max((visibleHeight / totalHeight) * visibleHeight, 42)
      : 42;
    const nextOffset = maxScroll > 0
      ? (element.scrollTop / maxScroll) * Math.max(visibleHeight - nextHeight, 0)
      : 0;

    setThumbHeight(nextHeight);
    setThumbOffset(nextOffset);
  }

  useEffect(() => {
    const element = conversationRef.current;

    if (!element) {
      return;
    }

    element.scrollTop = element.scrollHeight;
    syncScrollIndicator();
  }, [submittedName]);

  useEffect(() => {
    syncScrollIndicator();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextName = draftName.trim();
    if (!nextName) {
      return;
    }

    setSubmittedName(nextName);
    setDraftName("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.74]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.28)_0%,rgba(4,7,10,0.54)_28%,rgba(3,6,8,0.76)_68%,rgba(3,6,8,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_17%,rgba(244,235,214,0.12),transparent_9%),radial-gradient(circle_at_76%_19%,rgba(255,255,255,0.04),transparent_18%)]" />
        <div className="northstar-energy-field absolute right-[5%] top-[3%] h-[40rem] w-[34rem] lg:w-[38rem]" />
        <div className="northstar-energy-beam absolute right-[18%] top-[7%] h-[72vh] w-[18rem] lg:w-[21rem]" />
        <div className="northstar-energy-sparks absolute right-[16%] top-[10%] h-[56vh] w-[20rem] lg:w-[24rem]" />
        <div className="absolute right-[24%] top-[12%] text-teal-100/90">
          <NorthStarIcon className="h-6 w-6 drop-shadow-[0_0_18px_rgba(148,255,236,0.45)]" />
        </div>
        <div className="absolute bottom-[14rem] left-[-4%] right-[-4%] h-[18rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.08),transparent_56%)]" />
        <div className="absolute inset-x-0 bottom-[9.5rem] h-[14rem] bg-[linear-gradient(180deg,transparent_0%,rgba(17,25,31,0.26)_38%,rgba(5,8,11,0.8)_76%,#04070a_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[12rem] bg-[linear-gradient(180deg,rgba(4,7,10,0)_0%,rgba(4,7,10,0.72)_42%,#04070a_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.016)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:92px_92px] opacity-14" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-6 py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/" className="flex items-center gap-3 text-white">
            <NorthStarIcon className="h-5 w-5 text-teal-200/86" />
            <span className="font-serif text-[2.15rem] tracking-tight">Neroa</span>
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

        <div className="grid flex-1 items-start gap-14 py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(28rem,0.92fr)] lg:gap-20 lg:py-16">
          <section className="max-w-4xl pt-4 lg:pt-10">
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

          <section className="relative mt-8 flex h-[27rem] flex-col self-start rounded-[2rem] border border-white/14 bg-[linear-gradient(180deg,rgba(6,10,13,0.9),rgba(7,11,15,0.78))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:h-[29rem] sm:p-8 lg:mt-10 lg:h-[30rem] lg:p-9">
            <div
              aria-hidden="true"
              className="scroll-rail pointer-events-none absolute bottom-7 right-4 top-24 w-px rounded-full bg-white/8"
            />
            <div
              aria-hidden="true"
              className="scroll-thumb pointer-events-none absolute right-[13px] w-[5px] rounded-full bg-gradient-to-b from-teal-200/85 via-teal-300/55 to-transparent shadow-[0_0_20px_rgba(45,212,191,0.28)] transition-all"
              style={{
                height: `${thumbHeight}px`,
                top: `calc(6rem + ${thumbOffset}px)`
              }}
            />

            <div className="border-b border-white/8 pb-4 pr-8">
              <div className="flex items-center gap-2 text-white">
                <NorthStarIcon className="h-4 w-4 text-teal-200/84" />
                <h2 className="font-serif text-[1.9rem] tracking-tight">Neroa</h2>
              </div>
            </div>

            <div
              ref={conversationRef}
              onScroll={syncScrollIndicator}
              className="min-h-0 flex-1 space-y-6 overflow-y-auto py-5 pr-8"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(94,234,212,0.45) transparent"
              }}
            >
              <ChatMessage
                speaker="Neroa"
                body="Hi, I’m Neroa. What’s your name?"
              />

              {hasStarted ? (
                <>
                  <ChatMessage
                    speaker={finalName}
                    body={`My name is ${finalName}.`}
                    tone="visitor"
                  />
                  <ChatMessage
                    speaker="Neroa"
                    body={`Nice to meet you, ${finalName}. I’m here to help you plan, scope, and prepare your next project before execution begins. Let’s begin.`}
                  />
                </>
              ) : null}
            </div>

            <div className="border-t border-white/8 pt-4 pr-8">
              {hasStarted ? (
                <div className="rounded-[1.35rem] border border-white/12 bg-white/[0.04] p-2.5">
                  <Link
                    href={nextProjectHref}
                    className="flex items-center justify-between rounded-[1rem] bg-teal-300 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#071113] transition hover:bg-teal-200"
                  >
                    <span>Let&apos;s Begin</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-[1.35rem] border border-white/12 bg-white/[0.035] p-2.5"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      placeholder="Type your name..."
                      aria-label="Type your name"
                      className="h-14 flex-1 bg-transparent px-4 text-base text-white outline-none placeholder:text-white/34"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-300 text-[#071113] transition hover:bg-teal-200"
                      aria-label="Submit your name"
                    >
                      <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                        <path
                          d="m6 4 7 6-7 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>

        <section className="pb-10 pt-4">
          <div className="flex flex-wrap items-center justify-center gap-y-3">
            {valuePills.map((pill, index) => (
              <div key={pill} className="flex items-center justify-center">
                {index > 0 ? (
                  <ChipDivider
                    className={index === 3 ? "mx-4 lg:mx-5" : "mx-3 lg:mx-4"}
                  />
                ) : null}
                <div className="flex min-h-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.035] px-3.5 py-2 text-center text-[0.68rem] font-semibold tracking-[0.16em] text-teal-200 shadow-[0_0_24px_rgba(45,212,191,0.05)] sm:px-4">
                  {pill}
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
      <style jsx>{`
        .northstar-energy-field {
          background:
            radial-gradient(circle at 52% 8%, rgba(184, 255, 240, 0.26), transparent 9%),
            radial-gradient(circle at 50% 20%, rgba(88, 241, 209, 0.14), transparent 24%),
            radial-gradient(ellipse at 50% 44%, rgba(24, 128, 120, 0.16), transparent 48%);
          filter: blur(10px);
          animation: northstarFieldPulse 10.5s ease-in-out infinite;
        }

        .northstar-energy-beam {
          background:
            linear-gradient(
              180deg,
              rgba(125, 255, 228, 0) 0%,
              rgba(125, 255, 228, 0.08) 12%,
              rgba(78, 238, 203, 0.26) 42%,
              rgba(41, 183, 161, 0.1) 78%,
              rgba(41, 183, 161, 0) 100%
            );
          clip-path: polygon(48% 0%, 56% 0%, 64% 100%, 36% 100%);
          filter: blur(14px);
          animation: northstarBeamShift 9s ease-in-out infinite;
        }

        .northstar-energy-sparks::before,
        .northstar-energy-sparks::after {
          content: "";
          position: absolute;
          inset: 0;
          background-repeat: no-repeat;
          mix-blend-mode: screen;
        }

        .northstar-energy-sparks::before {
          background-image:
            radial-gradient(circle, rgba(184, 255, 240, 0.34) 0 1.5px, transparent 2px),
            radial-gradient(circle, rgba(112, 245, 214, 0.26) 0 1.2px, transparent 1.8px),
            radial-gradient(circle, rgba(112, 245, 214, 0.18) 0 1px, transparent 1.5px);
          background-size: 160px 160px, 220px 220px, 280px 280px;
          background-position: 40% 8%, 62% 24%, 50% 42%;
          animation: northstarSparkleDrift 14s linear infinite;
          opacity: 0.68;
        }

        .northstar-energy-sparks::after {
          background-image: linear-gradient(
            180deg,
            rgba(129, 255, 231, 0.12) 0%,
            rgba(129, 255, 231, 0.02) 38%,
            rgba(129, 255, 231, 0) 100%
          );
          filter: blur(18px);
          animation: northstarBeamShift 12s ease-in-out infinite reverse;
          opacity: 0.55;
        }

        @keyframes northstarFieldPulse {
          0%,
          100% {
            opacity: 0.72;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 0.96;
            transform: translateY(10px) scale(1.04);
          }
        }

        @keyframes northstarBeamShift {
          0%,
          100% {
            opacity: 0.44;
            transform: translateY(0) scaleX(1);
          }
          50% {
            opacity: 0.78;
            transform: translateY(14px) scaleX(1.08);
          }
        }

        @keyframes northstarSparkleDrift {
          0% {
            transform: translate3d(0, -8px, 0);
          }
          50% {
            transform: translate3d(6px, 16px, 0);
          }
          100% {
            transform: translate3d(-4px, 28px, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .northstar-energy-field,
          .northstar-energy-beam,
          .northstar-energy-sparks::before,
          .northstar-energy-sparks::after {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

export default NeroaFrontDoorSurface;
