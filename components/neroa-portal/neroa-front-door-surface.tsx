"use client";

import { useState, type FormEvent, type ReactNode } from "react";
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
  body: ReactNode;
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
      <div
        className={[
          "max-w-[34rem] text-[1rem] leading-8",
          tone === "nero" ? "text-white/88" : "text-white/66"
        ].join(" ")}
      >
        {body}
      </div>
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
      className={["hidden items-center justify-center px-4 text-teal-200/72 lg:flex", className].join(" ")}
    >
      <NorthStarIcon className="h-3.5 w-3.5" />
    </span>
  );
}

function ValueButton({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex h-10 items-center justify-center rounded-full border border-white/70 bg-black/20 px-3 text-center text-[11px] font-semibold uppercase tracking-[0.13em] text-teal-200 whitespace-nowrap",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}

const neroaExplanation = (
  <>
    Nice to meet you, <span className="text-white">{"{name}"}</span>. I&apos;m Neroa
    {" - "}a structured software-building workspace that helps turn an idea into a
    clear roadmap before execution begins. Instead of dropping you into an
    open-ended chat or rushing straight into code, I help define the product,
    organize scope, surface key decisions, prepare approvals, and keep the build
    tied to evidence and review. The goal is to help you plan, scope, and
    prepare your next project the right way before work begins.
  </>
);

export function NeroaFrontDoorSurface({
  isSignedIn = false
}: {
  isSignedIn?: boolean;
}) {
  const [draftName, setDraftName] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  const nextProjectHref = isSignedIn ? "/neroa/project" : "/neroa/auth";
  const finalName = submittedName.trim();
  const hasStarted = finalName.length > 0;

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
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.78]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.2)_0%,rgba(4,7,10,0.38)_22%,rgba(3,6,8,0.68)_62%,rgba(3,6,8,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_17%,rgba(244,235,214,0.14),transparent_9%),radial-gradient(circle_at_76%_19%,rgba(255,255,255,0.05),transparent_18%)]" />
        <div className="northstar-energy-core absolute right-[3%] top-[1%] h-[44rem] w-[36rem] lg:w-[42rem]" />
        <div className="northstar-energy-beam northstar-energy-beam-primary absolute right-[15%] top-[5%] h-[76vh] w-[19rem] lg:w-[22rem]" />
        <div className="northstar-energy-beam northstar-energy-beam-secondary absolute right-[12%] top-[8%] h-[70vh] w-[15rem] lg:w-[18rem]" />
        <div className="northstar-energy-particles absolute right-[13%] top-[9%] h-[58vh] w-[22rem] lg:w-[26rem]" />
        <div className="absolute right-64 top-16 hidden text-teal-100/82 lg:block">
          <NorthStarIcon className="h-5 w-5 drop-shadow-[0_0_20px_rgba(148,255,236,0.38)]" />
        </div>
        <div className="absolute bottom-[14rem] left-[-4%] right-[-4%] h-[18rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.14),transparent_58%)]" />
        <div className="absolute inset-x-0 bottom-[9.5rem] h-[14rem] bg-[linear-gradient(180deg,transparent_0%,rgba(17,25,31,0.18)_34%,rgba(5,8,11,0.78)_76%,#04070a_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[12rem] bg-[linear-gradient(180deg,rgba(4,7,10,0)_0%,rgba(4,7,10,0.72)_42%,#04070a_100%)]" />
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

            <h1 className="mt-6 overflow-visible pb-3 font-serif text-[clamp(4.6rem,11vw,10.5rem)] leading-[0.94] tracking-[-0.06em] text-white">
              SaaS
              <br />
              <span className="inline-block pr-[0.08em] bg-gradient-to-r from-teal-200 via-teal-300 to-white bg-clip-text text-transparent">
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
            <div className="border-b border-white/8 pb-4">
              <div className="flex items-center gap-2 text-white">
                <NorthStarIcon className="h-4 w-4 text-teal-200/84" />
                <h2 className="font-serif text-[1.9rem] tracking-tight">Neroa</h2>
              </div>
            </div>

            <div className="chat-scroll min-h-0 flex-1 space-y-6 overflow-y-auto py-5 pr-2">
              <ChatMessage
                speaker="Neroa"
                body="Hi, I'm Neroa. What's your name?"
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
                    body={
                      <>
                        Nice to meet you, <span className="text-white">{finalName}</span>. I&apos;m Neroa
                        {" - "}a structured software-building workspace that helps turn an idea
                        into a clear roadmap before execution begins. Instead of dropping
                        you into an open-ended chat or rushing straight into code, I help
                        define the product, organize scope, surface key decisions, prepare
                        approvals, and keep the build tied to evidence and review. The goal
                        is to help you plan, scope, and prepare your next project the right
                        way before work begins.
                      </>
                    }
                  />
                  <ChatMessage speaker="Neroa" body="Let's begin." />
                </>
              ) : null}
            </div>

            <div className="border-t border-white/8 pt-4">
              {hasStarted ? (
                <div className="rounded-[1.35rem] border border-white/12 bg-white/[0.04] p-2.5">
                  <Link
                    href={nextProjectHref}
                    className="flex items-center justify-between rounded-[1rem] bg-teal-300 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#071113] transition hover:bg-teal-200"
                  >
                    <span>Let&apos;s Begin</span>
                    <span aria-hidden="true">-&gt;</span>
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

        <section className="relative min-h-[5.5rem] pb-10 pt-4 lg:pb-0">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 lg:hidden">
            {valuePills.map((pill, index) => (
              <div key={pill} className="contents">
                {index > 0 ? <ChipDivider className="flex px-3" /> : null}
                <ValueButton className="inline-flex">{pill}</ValueButton>
              </div>
            ))}
          </div>

          <div className="absolute bottom-8 left-8 right-8 hidden lg:block">
            <div
              className="grid w-full items-center"
              style={{
                gridTemplateColumns:
                  "220px minmax(24px,1fr) 20px minmax(24px,1fr) 220px minmax(24px,1fr) 20px minmax(24px,1fr) 220px minmax(24px,1fr) 20px minmax(24px,1fr) 220px minmax(24px,1fr) 20px minmax(24px,1fr) 220px"
              }}
            >
              <ValueButton className="w-[220px]">Roadmap-First Planning</ValueButton>
              <div aria-hidden="true" />
              <div className="flex h-10 items-center justify-center text-white/80">
                <NorthStarIcon className="h-3.5 w-3.5 text-teal-200/72" />
              </div>
              <div aria-hidden="true" />
              <ValueButton className="w-[220px]">Scope Before Execution</ValueButton>
              <div aria-hidden="true" />
              <div className="flex h-10 items-center justify-center text-white/80">
                <NorthStarIcon className="h-3.5 w-3.5 text-teal-200/72" />
              </div>
              <div aria-hidden="true" />
              <ValueButton className="w-[220px]">Decisions & Approvals</ValueButton>
              <div aria-hidden="true" />
              <div className="flex h-10 items-center justify-center text-white/80">
                <NorthStarIcon className="h-3.5 w-3.5 text-teal-200/72" />
              </div>
              <div aria-hidden="true" />
              <ValueButton className="w-[220px]">Evidence & Review</ValueButton>
              <div aria-hidden="true" />
              <div className="flex h-10 items-center justify-center text-white/80">
                <NorthStarIcon className="h-3.5 w-3.5 text-teal-200/72" />
              </div>
              <div aria-hidden="true" />
              <ValueButton className="w-[220px]">Build & Execute</ValueButton>
            </div>
          </div>
        </section>
      </section>
      <style jsx>{`
        .northstar-energy-core {
          background:
            radial-gradient(circle at 48% 7%, rgba(184, 255, 240, 0.44), transparent 8%),
            radial-gradient(circle at 50% 16%, rgba(101, 245, 216, 0.26), transparent 22%),
            radial-gradient(ellipse at 50% 42%, rgba(41, 183, 161, 0.22), transparent 50%);
          filter: blur(8px);
          animation: northstarFieldPulse 8.5s ease-in-out infinite;
        }

        .northstar-energy-beam {
          mix-blend-mode: screen;
          filter: blur(10px);
        }

        .northstar-energy-beam-primary {
          background:
            linear-gradient(
              180deg,
              rgba(134, 255, 232, 0) 0%,
              rgba(134, 255, 232, 0.18) 12%,
              rgba(72, 239, 200, 0.4) 36%,
              rgba(36, 191, 156, 0.22) 72%,
              rgba(36, 191, 156, 0) 100%
            );
          clip-path: polygon(49% 0%, 59% 0%, 67% 100%, 33% 100%);
          animation: northstarBeamShift 6.6s ease-in-out infinite;
        }

        .northstar-energy-beam-secondary {
          background:
            linear-gradient(
              180deg,
              rgba(113, 255, 226, 0) 0%,
              rgba(113, 255, 226, 0.12) 10%,
              rgba(67, 224, 193, 0.26) 38%,
              rgba(34, 148, 131, 0.14) 76%,
              rgba(34, 148, 131, 0) 100%
            );
          clip-path: polygon(46% 0%, 56% 0%, 62% 100%, 38% 100%);
          animation: northstarBeamShiftSecondary 9.8s ease-in-out infinite;
        }

        .northstar-energy-particles::before,
        .northstar-energy-particles::after {
          content: "";
          position: absolute;
          inset: 0;
          background-repeat: no-repeat;
          mix-blend-mode: screen;
        }

        .northstar-energy-particles::before {
          background-image:
            radial-gradient(circle, rgba(184, 255, 240, 0.42) 0 1.6px, transparent 2.2px),
            radial-gradient(circle, rgba(112, 245, 214, 0.32) 0 1.2px, transparent 1.8px),
            radial-gradient(circle, rgba(76, 234, 199, 0.24) 0 1px, transparent 1.6px);
          background-size: 160px 160px, 220px 220px, 280px 280px;
          background-position: 40% 6%, 61% 22%, 49% 40%;
          animation: northstarSparkleDrift 11.5s linear infinite;
          opacity: 0.82;
        }

        .northstar-energy-particles::after {
          background-image:
            linear-gradient(
              180deg,
              rgba(129, 255, 231, 0.18) 0%,
              rgba(129, 255, 231, 0.06) 34%,
              rgba(129, 255, 231, 0) 100%
            );
          filter: blur(14px);
          animation: northstarFieldPulse 7.8s ease-in-out infinite reverse;
          opacity: 0.72;
        }

        .chat-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(94, 234, 212, 0.45) transparent;
        }

        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-scroll::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(178, 255, 239, 0.84),
            rgba(56, 202, 172, 0.46)
          );
        }

        @keyframes northstarFieldPulse {
          0%,
          100% {
            opacity: 0.72;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(10px) scale(1.06);
          }
        }

        @keyframes northstarBeamShift {
          0%,
          100% {
            opacity: 0.52;
            transform: translateY(0) scaleX(1);
          }
          50% {
            opacity: 0.92;
            transform: translateY(18px) scaleX(1.12);
          }
        }

        @keyframes northstarBeamShiftSecondary {
          0%,
          100% {
            opacity: 0.36;
            transform: translateY(0) scaleX(1);
          }
          50% {
            opacity: 0.74;
            transform: translateY(22px) scaleX(1.08);
          }
        }

        @keyframes northstarSparkleDrift {
          0% {
            transform: translate3d(0, -10px, 0);
          }
          50% {
            transform: translate3d(5px, 18px, 0);
          }
          100% {
            transform: translate3d(-5px, 34px, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .northstar-energy-core,
          .northstar-energy-beam-primary,
          .northstar-energy-beam-secondary,
          .northstar-energy-particles::before,
          .northstar-energy-particles::after {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

export default NeroaFrontDoorSurface;
