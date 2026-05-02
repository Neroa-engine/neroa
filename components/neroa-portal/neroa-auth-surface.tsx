import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";

const authSections = [
  {
    title: "Sign in",
    eyebrow: "Future Entry Path",
    description:
      "Placeholder surface for future sign-in routing once clean auth infrastructure is intentionally connected.",
    detail:
      "This area does not submit credentials, open sessions, or connect to Supabase auth in this pass."
  },
  {
    title: "Create account",
    eyebrow: "Future Account Creation",
    description:
      "Placeholder surface for future account creation once the clean Neroa auth path is formally wired.",
    detail:
      "This area does not create users, store records, or trigger onboarding runtime yet."
  },
  {
    title: "Continue to Account Portal later",
    eyebrow: "Signed-In Destination",
    description:
      "Future routing destination for signed-in users after the clean auth entry path is connected.",
    detail:
      "Signed in users will route to /neroa/account later, but no redirect or session logic is active now."
  },
  {
    title: "Continue to Project Portal later",
    eyebrow: "Active Project Destination",
    description:
      "Future routing destination for users who already have an active project context.",
    detail:
      "Users with an active project may continue to /neroa/project later, but project runtime selection is not wired in this pass."
  }
] as const;

const futureRoutingNotes = [
  "Signed out users will start at /neroa/auth later.",
  "Signed in users will route to /neroa/account later.",
  "Users with an active project may continue to /neroa/project later."
] as const;

export function NeroaAuthSurface() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1f252d_0%,#11161d_42%,#090c10_100%)] px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <NeroaPortalNavigation currentPath="/neroa/auth" tone="dark" />

        <section className="overflow-hidden rounded-[2.2rem] border border-slate-500/30 bg-[linear-gradient(145deg,rgba(20,26,34,0.97)_0%,rgba(10,13,18,0.98)_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <div className="grid gap-8 border-b border-slate-200/10 px-8 py-9 lg:grid-cols-[1.7fr,1fr] lg:px-10">
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-teal-300/85">
                  Neroa
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Auth Surface
                </p>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-4xl font-serif text-4xl leading-tight text-slate-50 lg:text-5xl">
                  Clean authentication surface for the next Neroa entry flow.
                </h1>
                <p className="max-w-3xl text-sm leading-8 text-slate-300 lg:text-base">
                  This page prepares the clean Neroa auth experience with calm, premium routing
                  placeholders only. It does not claim live sign-in, session, billing, or runtime
                  access yet.
                </p>
              </div>
            </div>

            <aside className="rounded-[1.7rem] border border-teal-300/15 bg-[linear-gradient(180deg,rgba(165,243,252,0.10)_0%,rgba(255,255,255,0.04)_100%)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
                Surface Status
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Placeholder-only auth shell. No Supabase auth, session logic, redirects, route
                guards, or account creation behavior is connected in this pass.
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  Premium, spacious, and calm
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  Charcoal base with soft silver framing
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  Subtle teal guidance instead of loud status colors
                </div>
              </div>
            </aside>
          </div>

          <div className="grid gap-4 px-8 py-8 lg:grid-cols-2 lg:px-10">
            {authSections.map((section) => (
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
                <div className="mt-4 grid gap-3">
                  <div className="rounded-[1rem] border border-slate-300/15 bg-white/5 px-4 py-3 text-sm text-slate-400">
                    Placeholder field surface only
                  </div>
                  <div className="rounded-[1rem] border border-slate-300/15 bg-white/5 px-4 py-3 text-sm text-slate-400">
                    Placeholder action surface only
                  </div>
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Clean auth placeholder
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
          <article className="rounded-[2rem] border border-slate-400/20 bg-[linear-gradient(160deg,rgba(17,24,39,0.96)_0%,rgba(8,11,15,0.98)_100%)] px-8 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
              Future Routing Notes
            </p>
            <div className="mt-4 space-y-4 text-sm leading-8 text-slate-300">
              {futureRoutingNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-300/15 bg-white/5 px-8 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Boundary Notes
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              <p>No live login or signup submission is active in this pass.</p>
              <p>No route guards, session restoration, or redirect logic is active in this pass.</p>
              <p>No billing, project runtime, or Neroa One runtime access is implied here.</p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
