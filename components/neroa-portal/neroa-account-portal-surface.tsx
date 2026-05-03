import Link from "next/link";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";

const selectedPlanLabels = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  managed: "Managed Build"
} as const;

type SelectedPlan = keyof typeof selectedPlanLabels;

type NeroaAccountPortalSurfaceProps = {
  selectedPlan?: SelectedPlan | null;
};

type AccountSection = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  supportingCopy: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const accountSections: readonly AccountSection[] = [
  {
    id: "projects",
    title: "Projects",
    eyebrow: "Default Landing",
    description:
      "Start from your active projects, recent planning work, and the next project board entry point.",
    supportingCopy:
      "Projects stay at the top of the account portal so the next roadmap, scope, decision, and board handoff is never buried behind generic account copy.",
    ctaLabel: "Open Project Portal",
    ctaHref: "/neroa/project"
  },
  {
    id: "billing-usage",
    title: "Billing / Usage",
    eyebrow: "Supporting Context",
    description:
      "Review plan context, Build Credits, managed-credit separation, and account usage guidance.",
    supportingCopy:
      "Billing and usage stay visible as supporting guidance here without wiring live billing runtime or checkout behavior into the account shell.",
    ctaLabel: "View Pricing",
    ctaHref: "/neroa/pricing"
  },
  {
    id: "account",
    title: "Account",
    eyebrow: "Profile Context",
    description: "Manage profile context, preferences, and account access details.",
    supportingCopy:
      "Account details remain descriptive and calm here so the portal sets expectations without implying live profile editing where that flow is not wired."
  },
  {
    id: "project-board",
    title: "Project Board",
    eyebrow: "Workspace Entry",
    description:
      "Move into the project workspace where roadmap, scope, decisions, evidence, and build readiness come together.",
    supportingCopy:
      "Project board access stays close to Projects so the account portal acts like a controlled entry point into active work instead of a public overview page.",
    ctaLabel: "Open Project Portal",
    ctaHref: "/neroa/project"
  }
] as const;

const projectSignals = [
  "Projects lead the page instead of a generic account overview.",
  "Plan context stays visible as supporting guidance, not the main event.",
  "Project board access remains one clean step away.",
  "Dark charcoal, soft silver, and teal keep the portal in the current Neroa design family."
] as const;

export function NeroaAccountPortalSurface({
  selectedPlan = null
}: NeroaAccountPortalSurfaceProps) {
  const selectedPlanLabel = selectedPlan ? selectedPlanLabels[selectedPlan] : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] px-6 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.68]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.24)_0%,rgba(4,7,10,0.46)_28%,rgba(3,6,8,0.82)_70%,rgba(3,6,8,0.97)_100%)]" />
        <div className="absolute right-[5%] top-[3%] h-[38rem] w-[30rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.24),transparent_10%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.14),transparent_52%)] blur-xl" />
        <div className="absolute bottom-[10rem] left-[-6%] right-[-6%] h-[16rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.10),transparent_60%)]" />
        <NeroaNorthStarAccent className="right-[18rem] top-[7rem]" testId="account-page-north-star" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1680px] flex-col gap-8">
        <NeroaPortalNavigation currentPath="/neroa/account" tone="dark" />

        <section className="overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(145deg,rgba(17,24,39,0.96)_0%,rgba(8,11,15,0.98)_100%)] shadow-[0_32px_120px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="grid gap-8 border-b border-white/10 px-8 py-9 lg:grid-cols-[1.5fr,0.95fr] lg:px-10">
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-teal-200/84">
                  Account Portal
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Projects First
                </p>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-4xl font-serif text-4xl leading-tight text-slate-50 lg:text-5xl">
                  Projects are the default landing inside your Neroa account.
                </h1>
                <p className="max-w-3xl text-sm leading-8 text-slate-300 lg:text-base">
                  Start from active projects, recent planning work, and the next project board
                  entry point. Plan and credit context stay visible as supporting guidance without
                  turning the top of the account portal into a generic marketing overview.
                </p>
              </div>

              {selectedPlanLabel ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-teal-100">
                  Selected Plan: {selectedPlanLabel}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/neroa/project"
                  className="rounded-full border border-teal-300/35 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-300/16"
                >
                  Open Project Portal
                </Link>
                <Link
                  href="/neroa/pricing"
                  className="rounded-full border border-slate-400/25 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-teal-300/45 hover:text-teal-100"
                >
                  View Pricing
                </Link>
              </div>
            </div>

            <aside className="rounded-[1.7rem] border border-teal-300/16 bg-[linear-gradient(180deg,rgba(165,243,252,0.10)_0%,rgba(255,255,255,0.04)_100%)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
                Project Signals
              </p>
              <div className="mt-5 space-y-3">
                {projectSignals.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3 text-sm leading-7 text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[1rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300">
                {selectedPlanLabel
                  ? `Plan context is attached to this account entry through ${selectedPlanLabel}, then kept secondary to project access.`
                  : "Plan context appears here when a selected plan is present, but project access remains the primary landing focus."}
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.74fr,1.38fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(148,163,184,0.04)_100%)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
              Account Navigation
            </p>
            <div className="mt-5 space-y-3" aria-label="Account portal sections">
              {accountSections.map((section, index) => {
                const active = index === 0;

                return (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    aria-current={active ? "true" : undefined}
                    className={[
                      "block rounded-[1.35rem] border px-4 py-4 transition",
                      active
                        ? "border-teal-300/35 bg-teal-300/10 text-slate-50 shadow-[0_0_28px_rgba(45,212,191,0.12)]"
                        : "border-white/10 bg-black/20 text-slate-300 hover:border-teal-300/25 hover:text-slate-100"
                    ].join(" ")}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-200/78">
                      {section.eyebrow}
                    </p>
                    <p className="mt-2 text-lg font-semibold">{section.title}</p>
                    <p className="mt-2 text-sm leading-7 opacity-80">{section.description}</p>
                  </Link>
                );
              })}
            </div>
          </aside>

          <div className="space-y-5">
            {accountSections.map((section, index) => (
              <article
                id={section.id}
                key={section.id}
                className={[
                  "rounded-[2rem] border p-7 shadow-[0_28px_80px_rgba(0,0,0,0.26)]",
                  index === 0
                    ? "border-teal-300/24 bg-[linear-gradient(160deg,rgba(17,24,39,0.98)_0%,rgba(8,13,17,0.98)_100%)]"
                    : "border-white/10 bg-white/[0.04] backdrop-blur"
                ].join(" ")}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200/80">
                  {section.eyebrow}
                </p>
                <h2 className="mt-3 font-serif text-3xl text-slate-50">{section.title}</h2>
                <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
                  {section.description}
                </p>
                <p className="mt-4 rounded-[1.3rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300">
                  {section.supportingCopy}
                </p>
                {section.ctaHref && section.ctaLabel ? (
                  <div className="mt-5">
                    <Link
                      href={section.ctaHref}
                      className="inline-flex rounded-full border border-teal-300/35 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-300/16"
                    >
                      {section.ctaLabel}
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
