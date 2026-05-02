import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neroa Portal Shell",
  description:
    "Clean two-zone Neroa portal shell for future Account Portal and Project Portal surfaces."
};

const portalZones = [
  {
    title: "Account Portal",
    href: "/neroa/account",
    description:
      "Account-level shell for projects, billing, account settings, team access, and infrastructure placeholders."
  },
  {
    title: "Project Portal",
    href: "/neroa/project",
    description:
      "Project-level shell for strategy, command intake, project room, evidence, roadmap, and approvals placeholders."
  }
] as const;

export default function NeroaPortalFrontDoorPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f0dfbf_0%,#f8f4ec_42%,#fffdf8_100%)] px-6 py-10 text-stone-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-stone-300/70 bg-white/95 px-8 py-10 shadow-[0_30px_90px_rgba(120,94,46,0.12)] lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.7fr,1fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">
                Neroa
              </p>
              <h1 className="max-w-3xl font-serif text-4xl leading-tight text-stone-950 lg:text-5xl">
                Clean portal front door for the next Neroa shell.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-stone-600 lg:text-base">
                This route introduces a fresh shell for the Account Portal and Project Portal while
                keeping the legacy room architecture isolated. It is intentionally placeholder-only
                and does not claim live runtime execution.
              </p>
            </div>
            <aside className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-5 text-sm text-stone-700">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-900">
                Current Scope
              </p>
              <p className="mt-3 leading-7">
                Public front door shell only. Landing, pricing, auth entry, and runtime wiring stay
                for later passes.
              </p>
            </aside>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {portalZones.map((zone) => (
            <article
              key={zone.title}
              className="rounded-[2rem] border border-stone-300/70 bg-stone-950 px-8 py-8 text-stone-100 shadow-[0_28px_80px_rgba(36,26,12,0.24)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Clean Zone
              </p>
              <h2 className="mt-3 font-serif text-3xl text-white">{zone.title}</h2>
              <p className="mt-4 text-sm leading-7 text-stone-300">{zone.description}</p>
              <Link
                href={zone.href}
                className="mt-6 inline-flex rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-amber-300 hover:text-amber-200"
              >
                Open {zone.title}
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
