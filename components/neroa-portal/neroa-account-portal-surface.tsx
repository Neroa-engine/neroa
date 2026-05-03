import Link from "next/link";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";

const accountSections = [
  {
    title: "Profile",
    eyebrow: "Identity",
    description:
      "Keep your Neroa profile, team identity, and workspace context organized in one clear account starting point.",
    detail:
      "A clean profile view helps you keep account details and workspace context aligned before you move deeper into a project."
  },
  {
    title: "Plan & Credits",
    eyebrow: "Plan Context",
    description:
      "Review the plan lane, Build Credit structure, managed-credit separation, and account access context that shape your workspace.",
    detail:
      "This page keeps pricing and credit language clear so account navigation stays grounded in the same governed Neroa model."
  },
  {
    title: "Projects",
    eyebrow: "Project Access",
    description:
      "Move between active projects, recent planning work, and the right project entry points from one calm account overview.",
    detail:
      "The account portal gives projects a consistent starting point without drifting into execution-room complexity."
  },
  {
    title: "Settings",
    eyebrow: "Preferences",
    description:
      "Keep personal preferences, workspace defaults, and communication choices easy to find in the same Neroa visual system.",
    detail:
      "A single account surface keeps settings readable and structured before you step into project-specific decisions."
  }
] as const;

const accountHighlights = [
  "One clean account starting point",
  "Plan context and Build Credit guidance",
  "Clear project access across your workspace",
  "Soft silver framing with teal wayfinding"
] as const;

const accountSignals = [
  "Profile context stays easy to scan.",
  "Plan language stays aligned with the public pricing flow.",
  "Project access remains calm, direct, and readable.",
  "Settings stay organized without crowding the page."
] as const;

export function NeroaAccountPortalSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] px-6 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.68]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.22)_0%,rgba(4,7,10,0.46)_28%,rgba(3,6,8,0.82)_70%,rgba(3,6,8,0.97)_100%)]" />
        <div className="absolute right-[5%] top-[3%] h-[38rem] w-[30rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.24),transparent_10%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.14),transparent_52%)] blur-xl" />
        <div className="absolute bottom-[10rem] left-[-6%] right-[-6%] h-[16rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.10),transparent_60%)]" />
        <NeroaNorthStarAccent className="right-[18rem] top-[7rem]" testId="account-page-north-star" />
      </div>
      <div className="relative mx-auto flex w-full max-w-[1680px] flex-col gap-8">
        <NeroaPortalNavigation currentPath="/neroa/account" tone="dark" />

        <section className="overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.92),rgba(6,9,13,0.8))] shadow-[0_32px_120px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="grid gap-8 border-b border-white/10 px-8 py-9 lg:grid-cols-[1.45fr,0.95fr] lg:px-10">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200/82">
                Account Portal
              </p>
              <div className="space-y-4">
                <h1 className="max-w-4xl font-serif text-4xl leading-tight text-slate-50 lg:text-5xl">
                  Manage your Neroa account, plan context, and project access from one clean starting point.
                </h1>
                <p className="max-w-3xl text-sm leading-8 text-slate-300 lg:text-base">
                  Keep profile details, plan guidance, project access, and settings in one calm
                  Neroa account overview built with the same dark charcoal, soft silver, and teal
                  direction as the public front door.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/neroa/pricing"
                  className="rounded-full border border-teal-300/35 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-300/16"
                >
                  View Pricing
                </Link>
                <Link
                  href="/neroa/project"
                  className="rounded-full border border-slate-400/25 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-teal-300/45 hover:text-teal-100"
                >
                  Open Project Portal
                </Link>
              </div>
            </div>
            <aside className="rounded-[1.7rem] border border-teal-300/16 bg-[linear-gradient(180deg,rgba(165,243,252,0.10)_0%,rgba(255,255,255,0.04)_100%)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
                Account Highlights
              </p>
              <div className="mt-5 space-y-3">
                {accountHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3 text-sm leading-7 text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="grid gap-4 px-8 py-8 lg:grid-cols-2 lg:px-10">
            {accountSections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(148,163,184,0.04)_100%)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.22)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200/80">
                  {section.eyebrow}
                </p>
                <h2 className="mt-3 font-serif text-2xl text-slate-50">{section.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">{section.description}</p>
                <p className="mt-4 rounded-[1.3rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300">
                  {section.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.25fr,0.95fr]">
          <article className="rounded-[2rem] border border-slate-400/20 bg-[linear-gradient(160deg,rgba(17,24,39,0.96)_0%,rgba(8,11,15,0.98)_100%)] px-8 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
              Account Overview
            </p>
            <h2 className="mt-3 font-serif text-3xl text-slate-50">
              A calm account view keeps the public Neroa experience aligned from pricing through project access.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
              The account portal stays focused on clarity: the right plan context, the right
              project entry points, and the same Neroa visual language users already see on the
              front door, pricing, and auth pages.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {accountSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200"
                >
                  {signal}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-8 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Account Path
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              <p>Start here to orient profile context, plan visibility, and project access.</p>
              <p>The same Neroa wordmark-first styling keeps public navigation consistent.</p>
              <p>Teal accents guide attention without adding noisy status language.</p>
              <p>Projects remain one click away when you are ready to move deeper into the workspace.</p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
