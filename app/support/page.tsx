import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { PublicActionLink } from "@/components/site/public-action-link";
import { publicContactEmail, publicContactMailto } from "@/lib/data/public-contact";

export default function SupportPage() {
  return (
    <MarketingInfoShell
      ctaHref="/contact?type=support"
      ctaLabel="Contact support"
      brandVariant="prominent"
    >
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
              Support / Help
            </p>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem] xl:leading-[0.96]">
              Need help with pricing, routing, or where to go next?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">
              NEROA support is here to keep the public flow understandable. Use it when you need a
              clearer next step, a real support contact, or help choosing between DIY and Managed.
            </p>
          </div>

          <div className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Support channels
              </p>
              <div className="mt-6 grid gap-4">
                {[
                  {
                    title: "AI help chat",
                    description:
                      "Open the built-in site guide for page-aware help, quick links, and next-step routing.",
                    href: "/support?help=open",
                    ctaLabel: "Open guide chat"
                  },
                  {
                    title: "Contact support",
                    description:
                      "Use the support inquiry form when you want a direct response from the team about pricing, routing, or what to do next.",
                    href: "/contact?type=support",
                    ctaLabel: "Contact support"
                  },
                  {
                    title: "Email support",
                    description: `Email ${publicContactEmail} for direct help, pricing clarification, or route questions.`,
                    href: publicContactMailto,
                    ctaLabel: `Email ${publicContactEmail}`,
                    external: true
                  },
                  {
                    title: "Start a project",
                    description:
                      "Move into the guided builder when you already know you are ready to start shaping the product directly.",
                    href: "/start",
                    ctaLabel: "Start your build"
                  }
                ].map((item) =>
                  item.external ? (
                    <a
                      key={item.title}
                      href={item.href}
                      className="micro-glow rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5"
                    >
                      <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-700">
                        {item.ctaLabel}
                        <span aria-hidden="true">&rarr;</span>
                      </div>
                    </a>
                  ) : item.href.startsWith("/start") ? (
                    <PublicActionLink
                      key={item.title}
                      href={item.href}
                      label={item.ctaLabel}
                      className="micro-glow rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5"
                    >
                      <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-700">
                        {item.ctaLabel}
                        <span aria-hidden="true">&rarr;</span>
                      </div>
                    </PublicActionLink>
                  ) : (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="micro-glow rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5"
                    >
                      <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-700">
                        {item.ctaLabel}
                        <span aria-hidden="true">&rarr;</span>
                      </div>
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Common help topics
            </p>
            <div className="mt-6 grid gap-4">
              {[
                {
                  title: "Need help understanding the SaaS path?",
                  description:
                    "Use the SaaS explainer first if you need a cleaner product definition before you compare paths or start the builder.",
                  href: "/what-is-saas"
                },
                {
                  title: "Need help choosing a plan?",
                  description:
                    "The pricing pages explain realistic pace, monthly Engine Credits, and when DIY stops being the right answer.",
                  href: "/pricing"
                },
                {
                  title: "Need help understanding budget logic?",
                  description:
                    "Use the budget logic page to understand how scope, pace, support, and timing change the right path.",
                  href: "/budget-pricing-logic"
                },
                {
                  title: "Need help deciding what to read next?",
                  description:
                    "Use the instructions page if you want the public-site walkthrough before you start.",
                  href: "/instructions"
                }
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="micro-glow rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5"
                >
                  <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Next step
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              If you still need help, take the cleanest next step.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Use Contact support for a direct response, or start the builder if you already know
              you are ready to move.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link href="/contact?type=support" className="button-primary">
                Contact support
              </Link>
              <PublicActionLink
                href="/start"
                label="Start your build"
                className="button-secondary"
              >
                Start your build
              </PublicActionLink>
              <Link href="/instructions" className="button-secondary">
                Read instructions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
