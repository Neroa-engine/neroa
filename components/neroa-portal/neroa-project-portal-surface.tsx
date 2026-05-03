import Link from "next/link";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";

const projectSections = [
  {
    title: "Roadmap",
    eyebrow: "Project Direction",
    description:
      "See the shape of the project, the sequence of work, and the milestones that anchor the build path.",
    detail:
      "A clear roadmap helps every project stay grounded in approved direction before execution pressure builds."
  },
  {
    title: "Scope",
    eyebrow: "Boundaries",
    description:
      "Keep what belongs in the project, what stays out, and what deserves another pass easy to understand.",
    detail:
      "Scope stays readable when the project portal makes priorities, constraints, and tradeoffs visible at a glance."
  },
  {
    title: "Decisions",
    eyebrow: "Approvals",
    description:
      "Track the calls that shape the build, the approvals that unblock motion, and the questions that still matter.",
    detail:
      "Decisions stay useful when they are visible in the same workspace as roadmap and scope."
  },
  {
    title: "Evidence",
    eyebrow: "Review Signals",
    description:
      "Keep summaries, proof points, and review signals gathered in one place so progress is easy to trust.",
    detail:
      "Evidence brings clarity to the project without burying the workspace in noisy status fragments."
  },
  {
    title: "Build Readiness",
    eyebrow: "Next Step Clarity",
    description:
      "Know when the project is ready to move forward, what still needs alignment, and what the next step should be.",
    detail:
      "Readiness improves when roadmap, scope, decisions, and evidence all stay visible in one calm project overview."
  }
] as const;

const projectHighlights = [
  "Roadmap, scope, decisions, and evidence in one view",
  "Dark charcoal base with soft silver framing",
  "Subtle teal guidance across the project workspace",
  "Neroa wordmark-first direction"
] as const;

const readinessNotes = [
  "Roadmap stays visible from the first planning pass onward.",
  "Scope is easier to protect when the workspace stays calm and direct.",
  "Decisions and evidence belong beside the work, not scattered across pages.",
  "Build readiness becomes clearer when the whole project story is in one place."
] as const;

export function NeroaProjectPortalSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] px-6 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.68]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.24)_0%,rgba(4,7,10,0.42)_26%,rgba(3,6,8,0.82)_68%,rgba(3,6,8,0.97)_100%)]" />
        <div className="absolute right-[5%] top-[3%] h-[40rem] w-[32rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.24),transparent_10%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.14),transparent_52%)] blur-xl" />
        <div className="absolute bottom-[10rem] left-[-6%] right-[-6%] h-[16rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.10),transparent_60%)]" />
        <NeroaNorthStarAccent className="right-[18rem] top-[7rem]" testId="project-page-north-star" />
      </div>
      <div className="relative mx-auto flex w-full max-w-[1680px] flex-col gap-8">
        <NeroaPortalNavigation currentPath="/neroa/project" tone="dark" />

        <section className="overflow-hidden rounded-[2.2rem] border border-white/12 bg-[linear-gradient(145deg,rgba(20,26,34,0.97)_0%,rgba(10,13,18,0.98)_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <div className="grid gap-8 border-b border-slate-200/10 px-8 py-9 lg:grid-cols-[1.55fr,0.95fr] lg:px-10">
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-teal-300/85">
                  Neroa
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Project Portal
                </p>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-4xl font-serif text-4xl leading-tight text-slate-50 lg:text-5xl">
                  Your project workspace will organize roadmap, scope, decisions, evidence, and build readiness as your plan takes shape.
                </h1>
                <p className="max-w-3xl text-sm leading-8 text-slate-300 lg:text-base">
                  The project portal keeps the whole project story visible in one clean Neroa
                  overview so progress feels structured, reviewable, and ready for the next step.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/neroa"
                  className="rounded-full border border-slate-400/30 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-teal-300/60 hover:text-teal-200"
                >
                  Home
                </Link>
                <Link
                  href="/neroa/account"
                  className="rounded-full border border-slate-400/30 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-teal-300/60 hover:text-teal-200"
                >
                  Account Portal
                </Link>
              </div>
            </div>

            <aside className="rounded-[1.7rem] border border-teal-300/15 bg-[linear-gradient(180deg,rgba(165,243,252,0.10)_0%,rgba(255,255,255,0.04)_100%)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
                Project Highlights
              </p>
              <div className="mt-5 space-y-3">
                {projectHighlights.map((pillar) => (
                  <div
                    key={pillar}
                    className="rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200"
                  >
                    {pillar}
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="grid gap-4 px-8 py-8 lg:grid-cols-2 lg:px-10">
            {projectSections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.7rem] border border-slate-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(148,163,184,0.04)_100%)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.22)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200/80">
                  {section.eyebrow}
                </p>
                <h2 className="mt-3 font-serif text-2xl text-slate-50">{section.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">{section.description}</p>
                <p className="mt-4 rounded-[1.3rem] border border-slate-200/10 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300">
                  {section.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
          <article className="rounded-[2rem] border border-slate-400/20 bg-[linear-gradient(160deg,rgba(17,24,39,0.96)_0%,rgba(8,11,15,0.98)_100%)] px-8 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
              Project Overview
            </p>
            <h2 className="mt-3 font-serif text-3xl text-slate-50">
              Calm project visibility keeps the plan readable before build pressure takes over.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
              Roadmap, scope, decisions, evidence, and build readiness belong together. This
              project portal keeps them framed in one clear workspace so the next move feels
              intentional instead of improvised.
            </p>
          </article>

          <article className="rounded-[2rem] border border-slate-300/15 bg-white/5 px-8 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Readiness Notes
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              {readinessNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
