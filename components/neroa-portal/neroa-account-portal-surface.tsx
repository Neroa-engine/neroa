import Link from "next/link";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";

const accountSections = [
  {
    title: "Projects",
    eyebrow: "Account-Level Planning",
    description:
      "Use this clean placeholder surface for future project selection, creation entry, and portfolio management at the account level. It is not the project execution home.",
    detail:
      "Project execution, task intake, and Neroa One runtime flow remain outside this surface until the clean project portal is wired later."
  },
  {
    title: "Billing / Usage",
    eyebrow: "Plan And Spend",
    description:
      "Future home for plan, usage, credits, invoices, and spending review once a clean billing runtime is intentionally introduced.",
    detail:
      "This panel is a control placeholder only and does not connect to Stripe, payment state, credits, or invoice data yet."
  },
  {
    title: "Account Settings",
    eyebrow: "Profile And Preferences",
    description:
      "Future home for profile, company details, preferences, and notification controls inside the clean account portal.",
    detail:
      "No auth runtime, profile saving, or settings persistence is connected in this pass."
  },
  {
    title: "Team / Access",
    eyebrow: "Roles And Collaboration",
    description:
      "Future home for collaborators, roles, invitations, and permission review across the account and its projects.",
    detail:
      "This panel does not connect to team membership, invites, auth providers, or access enforcement yet."
  }
] as const;

const integrationProviders = [
  "GitHub",
  "Vercel",
  "Supabase",
  "Stripe",
  "Resend",
  "OpenAI / Neroa AI credits",
  "DNS / domain setup later",
  "Database Migration Worker later"
] as const;

export function NeroaAccountPortalSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f6f1e8_0%,#fbf8f2_50%,#fffdf8_100%)] px-6 py-10 text-stone-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[8%] top-[3%] h-[20rem] w-[20rem] bg-[radial-gradient(circle_at_50%_28%,rgba(115,227,209,0.14),transparent_12%),radial-gradient(ellipse_at_50%_52%,rgba(45,212,191,0.08),transparent_58%)] blur-xl" />
        <NeroaNorthStarAccent className="right-[14rem] top-[6.5rem] text-teal-300/70" />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <NeroaPortalNavigation currentPath="/neroa/account" />

        <section className="overflow-hidden rounded-[2rem] border border-stone-300/70 bg-white/95 shadow-[0_30px_90px_rgba(120,94,46,0.12)]">
          <div className="grid gap-6 border-b border-stone-200/80 px-8 py-8 lg:grid-cols-[1.8fr,1fr] lg:px-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">
                Account Portal
              </p>
              <div className="space-y-3">
                <h1 className="max-w-3xl font-serif text-4xl leading-tight text-stone-950 lg:text-5xl">
                  Clean account-level control area for the next Neroa portal.
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-stone-600 lg:text-base">
                  This surface organizes account-level navigation and planning for projects,
                  billing, settings, team access, and integrations without reusing legacy portal
                  logic or claiming that runtime systems are live.
                </p>
              </div>
            </div>
            <aside className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-5 text-sm text-stone-700">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-900">
                Clean Surface Status
              </p>
              <p className="mt-3 leading-7">
                Account Portal planning only. Auth, billing, projects, integrations, and Neroa One
                runtime wiring remain intentionally disconnected in this pass.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/neroa"
                  className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
                >
                  Portal Front Door
                </Link>
                <Link
                  href="/neroa/project"
                  className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
                >
                  Project Portal
                </Link>
              </div>
            </aside>
          </div>

          <div className="grid gap-4 px-8 py-8 lg:grid-cols-2 lg:px-10">
            {accountSections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-6 shadow-[0_18px_50px_rgba(120,94,46,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  {section.eyebrow}
                </p>
                <h2 className="mt-3 font-serif text-2xl text-stone-950">{section.title}</h2>
                <p className="mt-4 text-sm leading-7 text-stone-600">{section.description}</p>
                <p className="mt-4 rounded-[1.25rem] border border-white/80 bg-white px-4 py-4 text-sm leading-7 text-stone-600">
                  {section.detail}
                </p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Clean placeholder control surface
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
          <article className="rounded-[2rem] border border-stone-300/70 bg-stone-950 px-8 py-8 text-stone-100 shadow-[0_28px_80px_rgba(36,26,12,0.24)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Integrations / Infrastructure
            </p>
            <h2 className="mt-3 font-serif text-3xl text-white">
              Future setup surface for connected systems and platform operations.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300">
              This panel reflects the clean account-level onboarding roadmap only. It does not
              create connections, fake connected states, or imply that provider runtime flows are
              active.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {integrationProviders.map((provider) => (
                <div
                  key={provider}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-stone-200"
                >
                  {provider}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-stone-300/70 bg-white/95 px-8 py-8 shadow-[0_28px_80px_rgba(120,94,46,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
              Integration Guardrails
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-stone-600">
              <p>
                Official APIs, CLI flows, and OAuth should come first for future integrations and
                infrastructure onboarding.
              </p>
              <p>
                Browser automation is fallback and verification only, not the primary integration
                path.
              </p>
              <p>
                Risky database, payment, and production changes require explicit customer or admin
                approval before execution.
              </p>
              <p>
                Database Migration Worker later should generate and validate SQL migration files,
                then apply them through an approved Supabase CLI or Postgres worker path when
                authorization is present.
              </p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
