import Link from "next/link";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";

const projectSections = [
  {
    title: "Strategy Room",
    eyebrow: "Roadmap And Scope Review",
    description:
      "Future home for roadmap, scope, and project-truth review inside the clean Project Portal.",
    detail:
      "This surface is not the intelligence owner yet and does not connect to legacy Strategy Room runtime."
  },
  {
    title: "Command Center",
    eyebrow: "Customer-Safe Coordination",
    description:
      "Future home for customer-safe task, status, and decision visibility in the clean project experience.",
    detail:
      "This panel is not the routing owner and does not release work or reuse the legacy Command Center path."
  },
  {
    title: "Project Room",
    eyebrow: "Future Workspace Viewport",
    description:
      "Future home for a project-facing workspace viewport with calm navigation and review context.",
    detail:
      "This panel is not the execution home and does not represent Build Room, worker control, or runtime dispatch."
  },
  {
    title: "Evidence / Results",
    eyebrow: "Customer-Safe Summaries",
    description:
      "Future home for customer-safe evidence and result summaries once the clean review lanes are surfaced.",
    detail:
      "This panel is not Live View, QC runtime, browser recording, or extension-driven runtime."
  },
  {
    title: "Roadmap / Scope",
    eyebrow: "Project Visibility",
    description:
      "Future home for roadmap and scope visibility, checkpoints, and approval support across the project lifecycle.",
    detail:
      "This surface is not the live strategy runtime and does not own roadmap intelligence processing."
  },
  {
    title: "Approvals / Decisions",
    eyebrow: "Governance Queue",
    description:
      "Future home for customer and admin approvals, decisions, and governance checkpoints in the clean portal.",
    detail:
      "This panel is not a live workflow engine and does not trigger runtime approvals, execution, or queue behavior."
  }
] as const;

const luxuryPillars = [
  "Premium, spacious, and calm",
  "Charcoal base with soft silver framing",
  "Subtle teal guidance instead of loud status colors",
  "Neroa wordmark-first direction"
] as const;

export function NeroaProjectPortalSurface() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1f252d_0%,#11161d_42%,#090c10_100%)] px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <NeroaPortalNavigation currentPath="/neroa/project" tone="dark" />

        <section className="overflow-hidden rounded-[2.2rem] border border-slate-500/30 bg-[linear-gradient(145deg,rgba(20,26,34,0.97)_0%,rgba(10,13,18,0.98)_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <div className="grid gap-8 border-b border-slate-200/10 px-8 py-9 lg:grid-cols-[1.7fr,1fr] lg:px-10">
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
                  Dark luxury project surface for the next clean Neroa portal.
                </h1>
                <p className="max-w-3xl text-sm leading-8 text-slate-300 lg:text-base">
                  This Project Portal carries the calm, premium Neroa direction for future strategy,
                  command, evidence, roadmap, and approval surfaces without claiming that runtime,
                  execution, or Neroa One wiring is live yet.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/neroa"
                  className="rounded-full border border-slate-400/30 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-teal-300/60 hover:text-teal-200"
                >
                  Portal Front Door
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
                Surface Status
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Placeholder-only project shell. Strategy, command, evidence, approvals, and Neroa
                One runtime behavior remain intentionally disconnected in this pass.
              </p>
              <div className="mt-5 space-y-3">
                {luxuryPillars.map((pillar) => (
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
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Clean placeholder control surface
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
          <article className="rounded-[2rem] border border-slate-400/20 bg-[linear-gradient(160deg,rgba(17,24,39,0.96)_0%,rgba(8,11,15,0.98)_100%)] px-8 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
              Project Portal Boundaries
            </p>
            <h2 className="mt-3 font-serif text-3xl text-slate-50">
              Calm project visibility without inheriting legacy execution architecture.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
              This clean surface is for future visibility and governance only. It does not import
              legacy Strategy Room, Command Center, Build Room, Live View, Browser QC, auxiliary
              library surfaces, or Neroa One runtime modules.
            </p>
          </article>

          <article className="rounded-[2rem] border border-slate-300/15 bg-white/5 px-8 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Future Readiness Notes
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              <p>Customer-safe project visibility first, runtime ownership later.</p>
              <p>No forms, no fake connected states, and no live execution claims in this pass.</p>
              <p>Evidence and approvals stay review-oriented, not runtime-driven or queue-backed.</p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
