import Link from "next/link";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";

const buildPaths = [
  {
    title: "DIY Build",
    eyebrow: "Best for",
    points: [
      "founders who want control",
      "builders who want guided structure",
      "teams comfortable reviewing and approving work",
      "lower monthly cost with governed Build Credits"
    ],
    includes: [
      "roadmap-first planning",
      "scoped tasks",
      "credit-governed execution",
      "review and approval checkpoints",
      "project workspace access"
    ]
  },
  {
    title: "Managed Build",
    eyebrow: "Best for",
    points: [
      "founders who want Neroa to handle more execution",
      "businesses that need speed and direction",
      "nontechnical users who want a guided done-with-you/done-for-you path",
      "projects needing heavier review, setup, and delivery support"
    ],
    includes: [
      "managed credit packages",
      "deeper execution support",
      "setup and delivery guidance",
      "stronger review loop",
      "more hands-on project handling"
    ]
  }
] as const;

const decisionRows = [
  {
    title: "Choose DIY if:",
    items: [
      "you want lower cost",
      "you want control",
      "you can review tasks and approve work",
      "your build can move in smaller governed steps"
    ]
  },
  {
    title: "Choose Managed if:",
    items: [
      "you want Neroa to carry more of the execution burden",
      "you need help turning scope into delivery",
      "you want more guidance and review support",
      "you prefer a stronger service layer"
    ]
  }
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

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-7 text-white/72">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-200/80" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function NeroaDiyManagedSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.7]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.18)_0%,rgba(4,7,10,0.42)_24%,rgba(3,6,8,0.82)_68%,rgba(3,6,8,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(190,255,240,0.13),transparent_10%),radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.05),transparent_20%)]" />
        <div className="absolute right-[2%] top-[2%] h-[42rem] w-[34rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.22),transparent_11%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.14),transparent_52%)] blur-xl" />
        <NeroaNorthStarAccent
          className="right-[18rem] top-[7rem]"
          testId="diy-managed-page-north-star"
        />
        <div className="absolute bottom-[8rem] left-[-8%] right-[-8%] h-[18rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.1),transparent_60%)]" />
      </div>

      <section className="relative mx-auto flex w-full max-w-[1680px] flex-col px-6 py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/neroa" className="flex items-center gap-3 text-white">
            <NorthStarIcon className="h-5 w-5 text-teal-200/86" />
            <span className="font-serif text-[2.15rem] tracking-tight">Neroa</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.18em] text-white/62 md:flex">
            <Link href="/neroa" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/neroa/pricing" className="transition hover:text-white">
              Pricing
            </Link>
            <Link href="/neroa/diy-vs-managed" className="text-teal-100 transition hover:text-white">
              DIY vs Managed
            </Link>
            <Link href="/neroa/auth" className="transition hover:text-white">
              Sign In
            </Link>
            <Link
              href="/neroa/pricing"
              className="inline-flex items-center rounded-full border border-teal-300/45 bg-teal-300/10 px-5 py-3 text-white shadow-[0_0_28px_rgba(45,212,191,0.12)] transition hover:border-teal-200/70 hover:bg-teal-300/16"
            >
              Start Your Project
            </Link>
          </nav>
        </header>

        <section className="grid gap-10 border-b border-white/10 py-14 lg:grid-cols-[1.2fr,0.8fr] lg:py-18">
          <div className="max-w-4xl space-y-8">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.34em] text-teal-200/78">
                Structured software building
              </p>
              <h1 className="font-serif text-[clamp(3.6rem,9vw,7rem)] leading-[0.95] tracking-[-0.05em] text-white">
                Two ways to build with Neroa.
              </h1>
              <p className="max-w-3xl text-[1.18rem] leading-8 text-white/70">
                Start with the same roadmap-first process, then choose how much of the
                execution you want Neroa to handle.
              </p>
              <p className="max-w-3xl text-[1rem] leading-8 text-white/62">
                Every project begins with structure: idea intake, roadmap, scope, decisions,
                approvals, and build readiness. From there, you can continue with guided DIY
                execution or choose a managed build path when you want more done for you.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/neroa/pricing"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-teal-300/45 bg-teal-300/12 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-teal-200/70 hover:bg-teal-300/22"
              >
                Compare plans
              </Link>
            </div>
          </div>

          <aside className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.92),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
              Shared foundation
            </p>
            <div className="mt-5 space-y-4">
              {[
                "roadmap-first planning",
                "scope before execution",
                "approvals at the right checkpoints",
                "evidence and review across the build path"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1rem] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-7 text-white/72"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="space-y-6 py-14">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">Comparison</p>
            <h2 className="font-serif text-[2.35rem] text-white">
              Pick the service layer that matches your project.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {buildPaths.map((path) => (
              <article
                key={path.title}
                className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.9),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                      {path.eyebrow}
                    </p>
                    <h3 className="font-serif text-[2rem] text-white">{path.title}</h3>
                  </div>

                  <BulletList items={path.points} />

                  <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-5">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                      Includes
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {path.includes.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center justify-center rounded-full border border-teal-300/24 bg-white/[0.04] px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-teal-100"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 border-y border-white/10 py-14 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">Decision guide</p>
            <h2 className="font-serif text-[2.35rem] text-white">Which one should you choose?</h2>
            <p className="max-w-2xl text-sm leading-7 text-white/60">
              Both options stay inside a roadmap-first process with approvals, evidence and
              review, and structured software building. The difference is how much of the
              execution burden Neroa carries for you.
            </p>
          </div>

          <div className="grid gap-4">
            {decisionRows.map((row) => (
              <article
                key={row.title}
                className="rounded-[1.45rem] border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
              >
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                  {row.title}
                </p>
                <div className="mt-4">
                  <BulletList items={row.items} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-14 lg:grid-cols-[0.95fr,1.05fr] lg:items-start">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">Positioning</p>
            <h2 className="font-serif text-[2.35rem] text-white">Both paths start with structure.</h2>
          </div>

          <div className="rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.88),rgba(6,9,13,0.72))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <p className="text-[1rem] leading-8 text-white/70">
              Neroa does not begin by throwing prompts at code. It starts by shaping the
              project, defining scope, surfacing decisions, and creating a clear build path
              before execution begins.
            </p>
          </div>
        </section>

        <section className="border-t border-white/10 py-14">
          <div className="flex flex-col gap-6 rounded-[1.8rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.9),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">Next step</p>
              <h2 className="font-serif text-[2.1rem] text-white">Start with pricing.</h2>
              <p className="max-w-2xl text-sm leading-7 text-white/60">
                Review the governed Build Credits and managed credits structure, then choose the
                path that fits your project.
              </p>
            </div>

            <Link
              href="/neroa/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-teal-300/45 bg-teal-300/12 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-teal-200/70 hover:bg-teal-300/22"
            >
              Start with pricing
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
