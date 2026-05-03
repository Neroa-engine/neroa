import Link from "next/link";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0/month",
    eyebrow: "Project preview",
    description: "Preview the Neroa planning flow before you move into a paid governed Build Credit lane.",
    highlights: [
      "Guided idea intake",
      "Roadmap and scope preview",
      "Command Center preview",
      "Limited trial credits included",
      "1 starter project"
    ],
    detail: "Free is a limited preview experience for shaping an idea, not a free execution or MVP promise."
  },
  {
    id: "starter",
    name: "Starter",
    price: "$49.99/month",
    eyebrow: "Roadmap-first launch",
    description: "Structured planning and governed Build Credits for one active project at a time.",
    highlights: [
      "200 Build Credits",
      "30 Strategy Room messages",
      "1 active project"
    ],
    detail: "Starter is for shaping and progressing a bounded project, not promising a full MVP out of the box."
  },
  {
    id: "pro",
    name: "Pro",
    price: "$179/month",
    eyebrow: "Multi-project momentum",
    description: "More governed Build Credits and more room to move across a small portfolio.",
    highlights: [
      "600 Build Credits",
      "60 Strategy Room messages",
      "up to 3 active projects"
    ],
    detail: "Build Credits remain tracked separately from managed credits."
  },
  {
    id: "business",
    name: "Business",
    price: "$499/month",
    eyebrow: "Scaled operating lane",
    description: "For teams that need higher governed usage, review capacity, and controlled project throughput.",
    highlights: [
      "1,600 Build Credits",
      "150 Strategy Room messages",
      "5-10 active projects"
    ],
    detail: "Built for portfolio oversight, approvals, and evidence-backed progress with clear governed usage."
  },
  {
    id: "managed",
    name: "Managed Build",
    price: "from $750",
    eyebrow: "Managed execution credits",
    description: "For guided delivery lanes where managed build credits are purchased separately from DIY usage.",
    highlights: [
      "500 managed credits / $750",
      "1,500 managed credits / $2,250",
      "3,000 managed credits / $4,500",
      "5,000 managed credits / $7,500"
    ],
    detail: "Managed credits stay distinct from standard Build Credits."
  }
] as const;

const diyTopOffs = [
  "200 credits / $60",
  "500 credits / $150",
  "1,000 credits / $300",
  "2,000 credits / $600"
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

export function NeroaPricingSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.7]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.18)_0%,rgba(4,7,10,0.42)_26%,rgba(3,6,8,0.8)_68%,rgba(3,6,8,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(190,255,240,0.14),transparent_10%),radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.05),transparent_20%)]" />
        <div className="absolute right-[4%] top-[3%] h-[42rem] w-[34rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.24),transparent_11%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.14),transparent_52%)] blur-xl" />
        <NeroaNorthStarAccent className="right-[18rem] top-[7rem]" testId="pricing-page-north-star" />
        <div className="absolute bottom-[10rem] left-[-8%] right-[-8%] h-[18rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.10),transparent_60%)]" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-6 py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/" className="flex items-center gap-3 text-white">
            <NorthStarIcon className="h-5 w-5 text-teal-200/86" />
            <span className="font-serif text-[2.15rem] tracking-tight">Neroa</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.18em] text-white/62 md:flex">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/neroa/pricing" className="transition hover:text-white">
              Pricing
            </Link>
            <Link href="/neroa/diy-vs-managed" className="transition hover:text-white">
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

        <section className="space-y-8 py-14 lg:py-16">
          <div className="max-w-5xl space-y-8 pt-4 lg:pt-8">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.34em] text-teal-200/78">
                Governed Build Credits
              </p>
              <h1 className="max-w-4xl font-serif text-[clamp(3.8rem,9vw,7.2rem)] leading-[0.95] tracking-[-0.05em] text-white">
                Choose the Neroa lane that fits your project.
              </h1>
              <p className="max-w-3xl text-[1.12rem] leading-8 text-white/68">
                Neroa pricing is structured around governed Build Credits and separate
                managed credits. Pick the
                lane that matches your project scope, then continue into account
                setup with the plan context already attached.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                "Build Credits govern approved work",
                "DIY and Managed credits remain separate",
                "No live checkout or billing runtime is wired on this page"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.3rem] border border-white/10 bg-white/[0.035] px-5 py-4 text-sm leading-7 text-white/72 shadow-[0_0_24px_rgba(45,212,191,0.05)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="plans" className="space-y-6 pb-14">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">
                Plan Selection
              </p>
              <h2 className="font-serif text-[2.4rem] text-white">
                Structured pricing for roadmap-first software building.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/56">
              Plan buttons route into auth with the selected plan context only. No
              Stripe checkout, billing runtime, or live payment claims are active
              here.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="flex h-full min-h-[29rem] flex-col rounded-[1.55rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.88),rgba(6,9,13,0.72))] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.32)] lg:p-4 xl:p-5"
              >
                <div className="space-y-3">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                    {plan.eyebrow}
                  </p>
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-[1.65rem] leading-tight text-white">{plan.name}</h3>
                    <p className="text-[1.2rem] text-teal-100">{plan.price}</p>
                  </div>
                  <p className="text-[0.86rem] leading-6 text-white/62">{plan.description}</p>
                </div>

                <div className="mt-4 space-y-2.5">
                  {plan.highlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-[0.95rem] border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-[0.8rem] leading-5 text-white/74"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <p className="mt-4 flex-1 text-[0.82rem] leading-6 text-white/54">{plan.detail}</p>

                <Link
                  href={`/neroa/auth?plan=${plan.id}`}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-teal-300/45 bg-teal-300/12 px-4 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-teal-200/70 hover:bg-teal-300/22"
                >
                  Select {plan.name}
                </Link>
              </article>
            ))}
          </div>

          <div className="rounded-[1.45rem] border border-white/10 bg-black/20 px-5 py-4 lg:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-2">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                  Credit Top-Offs
                </p>
                <p className="text-sm leading-7 text-white/62">
                  Add more governed build credits when your project needs additional approved work.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 lg:flex-nowrap lg:justify-end">
                {diyTopOffs.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center justify-center rounded-full border border-teal-300/24 bg-white/[0.04] px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-teal-100 whitespace-nowrap"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
