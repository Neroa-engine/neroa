"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";

const valuePills = [
  "ROADMAP-FIRST PLANNING",
  "SCOPE BEFORE EXECUTION",
  "DECISIONS & APPROVALS",
  "EVIDENCE & REVIEW",
  "BUILD & EXECUTE"
] as const;

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
  const [draftName, setDraftName] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  const trimmedName = submittedName.trim();
  const hasStarted = trimmedName.length > 0;
  const nextProjectHref = isSignedIn ? "/neroa/project" : "/neroa/auth";
  const ctaLabel = isSignedIn ? "Open Projects" : "Start Your Project";

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

          <section className="relative rounded-[2rem] border border-white/14 bg-black/42 p-6 shadow-[0_28px_110px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-8 lg:p-9">
            <div
              aria-hidden="true"
              className="scroll-rail pointer-events-none absolute inset-y-8 right-4 w-px rounded-full bg-white/8"
            />
            <div
              className={[
                "scroll-thumb pointer-events-none absolute right-[13px] w-[5px] rounded-full bg-gradient-to-b from-teal-200/85 via-teal-300/55 to-transparent shadow-[0_0_20px_rgba(45,212,191,0.28)] transition-all",
                hasStarted ? "top-[34%] h-24" : "top-[18%] h-14"
              ].join(" ")}
            />

            <div className="pr-8">
              <div className="mb-7 border-b border-white/10 pb-5">
                <h2 className="font-serif text-3xl tracking-tight text-white">Neroa</h2>
                <p className="mt-2 text-sm leading-7 text-white/46">
                  Plan the project first, then move into the next step with structure.
                </p>
              </div>

              <div className="space-y-5">
                <MessageRow
                  author="Neroa"
                  timestamp="10:21 AM"
                  body="Hi, I'm Neroa. What's your name?"
                  avatar="AI"
                />

                {hasStarted ? (
                  <>
                    <MessageRow
                      author={trimmedName}
                      timestamp="10:22 AM"
                      body={`My name is ${trimmedName}.`}
                      avatar={trimmedName.charAt(0).toUpperCase()}
                      variant="visitor"
                    />

                    <MessageRow
                      author="Neroa"
                      timestamp="10:22 AM"
                      body={`Nice to meet you, ${trimmedName}. I'm here to help you plan, scope, and prepare your next project before execution begins. Let's begin.`}
                      avatar="AI"
                    />
                  </>
                ) : null}
              </div>

              {hasStarted ? (
                <div className="mt-7 rounded-[1.4rem] border border-white/12 bg-white/[0.04] p-3">
                  <Link
                    href={nextProjectHref}
                    className="flex items-center justify-between rounded-[1.1rem] bg-teal-300 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#071113] transition hover:bg-teal-200"
                  >
                    <span>{ctaLabel}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-7 rounded-[1.4rem] border border-white/12 bg-white/[0.035] p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      placeholder="Type your name"
                      aria-label="What is your name?"
                      className="h-14 flex-1 bg-transparent px-4 text-base text-white outline-none placeholder:text-white/34"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-14 items-center justify-center rounded-full bg-teal-300 px-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#071113] transition hover:bg-teal-200"
                    >
                      Let&apos;s Begin
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>

        <section className="pb-10">
          <div className="flex flex-wrap gap-3">
            {valuePills.map((pill) => (
              <div
                key={pill}
                className="inline-flex min-h-12 items-center rounded-full border border-white/14 bg-white/[0.035] px-5 py-3 text-[0.72rem] font-semibold tracking-[0.18em] text-white/76 shadow-[0_0_24px_rgba(45,212,191,0.05)]"
              >
                {pill}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default NeroaFrontDoorSurface;
