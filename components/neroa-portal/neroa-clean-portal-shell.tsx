import Link from "next/link";

export type NeroaPortalSection = {
  readonly title: string;
  readonly description: string;
};

type NeroaPortalShellProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly sections: readonly NeroaPortalSection[];
  readonly zoneLabel: string;
  readonly zonePath: string;
};

function sectionSlug(title: string) {
  return title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function NeroaCleanPortalShell({
  eyebrow,
  title,
  summary,
  sections,
  zoneLabel,
  zonePath
}: NeroaPortalShellProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f1e8_0%,#fbf8f2_50%,#fffdf8_100%)] px-6 py-10 text-stone-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-stone-300/70 bg-white/95 shadow-[0_30px_90px_rgba(120,94,46,0.12)]">
          <div className="grid gap-6 border-b border-stone-200/80 px-8 py-8 lg:grid-cols-[1.8fr,1fr] lg:px-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">
                {eyebrow}
              </p>
              <div className="space-y-3">
                <h1 className="max-w-3xl font-serif text-4xl leading-tight text-stone-950 lg:text-5xl">
                  {title}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-stone-600 lg:text-base">
                  {summary}
                </p>
              </div>
            </div>
            <aside className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-5 text-sm text-stone-700">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-900">
                Clean Shell Status
              </p>
              <p className="mt-3 leading-7">
                This route is a portal shell only. Runtime wiring, auth, and execution behavior are
                intentionally out of scope for this pass.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/neroa"
                  className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
                >
                  Portal Front Door
                </Link>
                <span className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-50">
                  {zoneLabel}
                </span>
              </div>
            </aside>
          </div>
          <div className="grid gap-4 px-8 py-8 lg:grid-cols-2 lg:px-10">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-5 shadow-[0_18px_50px_rgba(120,94,46,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <h2
                      id={sectionSlug(section.title)}
                      className="font-serif text-2xl text-stone-950"
                    >
                      {section.title}
                    </h2>
                    <p className="text-sm leading-7 text-stone-600">{section.description}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Placeholder
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="grid gap-4 rounded-[2rem] border border-stone-300/70 bg-stone-950 px-8 py-7 text-stone-100 shadow-[0_28px_80px_rgba(36,26,12,0.25)] lg:grid-cols-[1.4fr,1fr] lg:px-10">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Isolation Guardrails
            </p>
            <p className="max-w-3xl text-sm leading-7 text-stone-300 lg:text-base">
              This clean portal shell stays parallel to the legacy workspace rooms and avoids old
              routing, Build Room relay, Live View runtime, AI router, and legacy execution paths.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Active Zone
            </p>
            <p className="mt-3 text-lg font-semibold text-white">{zoneLabel}</p>
            <p className="mt-2 text-sm leading-7 text-stone-300">
              Canonical shell route: <span className="font-mono text-stone-100">{zonePath}</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
