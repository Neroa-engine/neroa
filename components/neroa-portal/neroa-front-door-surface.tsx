import Link from "next/link";

const valuePills = [
  {
    label: "Roadmap-First Planning",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M4 7h5l3 10h8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="4" cy="7" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="9" cy="7" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="17" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="20" cy="17" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    label: "Scope Before Execution",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Decisions & Approvals",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M12 3 20 6v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m8.5 12.3 2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Evidence & Review",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Build & Execute",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M13.5 4.5c3.6.5 5.5 2.4 6 6L13 17l-4-4 4.5-8.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 15.5 5 19l4.5-1.5M15 6.5l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.5 14.2 9.8 21.5 12 14.2 14.2 12 21.5 9.8 14.2 2.5 12 9.8 9.8 12 2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M12 7.6V12h4.4" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

function ChatAvatar({
  children,
  variant = "nero",
}: {
  children: React.ReactNode;
  variant?: "nero" | "visitor";
}) {
  return (
    <div
      className={[
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm",
        variant === "nero"
          ? "border-teal-300/35 bg-teal-400/18 text-teal-100 shadow-[0_0_28px_rgba(45,212,191,0.22)]"
          : "border-white/15 bg-white/8 text-white/80",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function NeroaFrontDoorSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080b] text-white">
      {/* Moon / North Star atmosphere. CSS only, no image assets. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_34%,rgba(255,244,219,0.12),transparent_14%),radial-gradient(circle_at_42%_34%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,rgba(5,8,11,0.25),#05080b_75%)]" />
        <div className="absolute left-[30%] top-[12%] h-[34rem] w-[34rem] rounded-full border border-[#f7ead1]/35 shadow-[0_0_80px_rgba(255,238,202,0.18),inset_0_0_50px_rgba(255,238,202,0.05)]" />
        <div className="absolute left-[33%] top-[12%] h-[34rem] w-[34rem] rounded-full bg-[#05080b]/95" />
        <div className="absolute left-[7%] top-[20%] h-20 w-20 text-white/75">
          <div className="absolute left-1/2 top-0 h-20 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/70 to-transparent" />
          <div className="absolute left-0 top-1/2 h-px w-20 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_28px_rgba(255,255,255,0.9)]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[28rem] bg-[radial-gradient(ellipse_at_center,rgba(43,211,191,0.12),transparent_40%),linear-gradient(180deg,transparent,rgba(4,7,9,0.92)_62%,#05080b)]" />
        <div className="absolute inset-x-0 bottom-0 h-[18rem] bg-[linear-gradient(165deg,transparent_0%,transparent_48%,rgba(255,255,255,0.05)_49%,transparent_50%),linear-gradient(25deg,transparent_0%,transparent_58%,rgba(255,255,255,0.04)_59%,transparent_60%)] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:96px_96px] opacity-25" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-8 py-8 lg:px-14">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/" className="group flex items-center gap-4">
            <SparkIcon className="h-8 w-8 text-white/80 transition group-hover:text-teal-200" />
            <span className="font-serif text-4xl tracking-tight text-white">Neroa</span>
          </Link>

          <nav className="hidden items-center gap-12 text-base text-white/78 md:flex">
            <Link href="/" className="border-b border-teal-300 pb-2 text-white">
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
              className="inline-flex items-center gap-3 rounded-full border border-teal-300/60 bg-teal-300/8 px-7 py-3 text-white shadow-[0_0_32px_rgba(45,212,191,0.12)] transition hover:border-teal-200 hover:bg-teal-300/14"
            >
              Start Your Project
              <SparkIcon className="h-4 w-4 text-teal-100" />
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <div className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1fr_0.92fr] lg:py-20">
          <section className="max-w-4xl">
            <h1 className="font-serif text-[clamp(5rem,10vw,11rem)] leading-[0.88] tracking-[-0.07em] text-white">
              SaaS
              <br />
              <span className="bg-gradient-to-r from-teal-300 via-teal-200 to-white bg-clip-text text-transparent">
                done
              </span>{" "}
              right.
            </h1>

            <p className="mt-9 text-[clamp(1.35rem,2vw,2rem)] leading-relaxed text-white/68">
              Start with a structured plan, not a vague prompt.
            </p>

            <p className="mt-6 max-w-3xl text-[clamp(1.05rem,1.35vw,1.35rem)] leading-9 text-white/62">
              Neroa turns your idea into roadmap, scope, decisions, approvals, and a clear project path before execution begins.
            </p>

            <div className="mt-14 flex flex-wrap gap-4">
              {valuePills.map((pill) => (
                <div
                  key={pill.label}
                  className="inline-flex min-h-16 items-center gap-3 rounded-2xl border border-white/20 bg-black/28 px-5 py-3 text-teal-200 shadow-[0_0_30px_rgba(20,184,166,0.07)] backdrop-blur"
                >
                  <span className="text-teal-300">{pill.icon}</span>
                  <span className="max-w-[9rem] text-sm font-semibold uppercase leading-5 tracking-[0.08em]">
                    {pill.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Chat Intake */}
          <section className="rounded-[2.25rem] border border-white/28 bg-black/45 p-8 shadow-[0_24px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-11">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-serif text-3xl text-white">Neroa</h2>
              <span className="rounded-full border border-white/12 px-4 py-2 text-xs uppercase tracking-[0.26em] text-white/45">
                Guided Intake
              </span>
            </div>

            <div className="space-y-7">
              <div className="flex gap-5 border-b border-white/10 pb-6">
                <ChatAvatar>
                  <SparkIcon className="h-5 w-5" />
                </ChatAvatar>
                <div>
                  <div className="mb-2 flex items-center gap-4 text-sm text-white/45">
                    <span>Neroa</span>
                    <span>10:21 AM</span>
                  </div>
                  <p className="text-[1.35rem] leading-8 text-white">
                    Hi, I’m Neroa. What’s your name?
                  </p>
                </div>
              </div>

              <div className="flex gap-5 border-b border-white/10 pb-6">
                <ChatAvatar variant="visitor">T</ChatAvatar>
                <div>
                  <div className="mb-2 flex items-center gap-4 text-sm text-white/45">
                    <span>Tom</span>
                    <span>10:21 AM</span>
                  </div>
                  <p className="text-[1.35rem] leading-8 text-white">
                    My name is Tom.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <ChatAvatar>
                  <SparkIcon className="h-5 w-5" />
                </ChatAvatar>
                <div>
                  <div className="mb-2 flex items-center gap-4 text-sm text-white/45">
                    <span>Neroa</span>
                    <span>10:22 AM</span>
                  </div>
                  <p className="text-[1.12rem] leading-8 text-white/88">
                    Nice to meet you, Tom. I’m here to help you plan, scope, and prepare your next project before execution begins. Let’s begin.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-9 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.035] p-3">
              <div className="flex-1 px-4 text-lg text-white/42">
                Type your message...
              </div>
              <Link
                href="/neroa/auth"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-300 text-black shadow-[0_0_28px_rgba(45,212,191,0.25)] transition hover:bg-teal-200"
                aria-label="Start your project"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default NeroaFrontDoorSurface;