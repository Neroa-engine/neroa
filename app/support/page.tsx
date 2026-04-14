import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { publicContactEmail, publicContactMailto } from "@/lib/data/public-contact";

export default function SupportPage() {
  return (
    <MarketingInfoShell ctaHref="/contact" ctaLabel="Contact Us" brandVariant="prominent">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
              Support / Help
            </p>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem] xl:leading-[0.96]">
              Need help understanding the platform, pricing, or where to start?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">
              Neroa support on the public site is built to guide people through the system clearly: what the pages mean, what pricing covers, how the build flow works, and where to go next if they need a real answer from the team.
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
                      "Use the floating guide in the bottom-right corner for page-aware help, quick links, and next-step guidance."
                  },
                  {
                    title: "Email support",
                    description: `Email ${publicContactEmail} for direct support, build questions, or pricing clarification.`
                  },
                  {
                    title: "Contact form",
                    description:
                      "Use Contact Us for support questions, build inquiries, general contact, or partnership conversations."
                  },
                  {
                    title: "Instructions",
                    description:
                      "Use the instructions page for a practical walkthrough of how the public site, AI system, pricing, and build flow work."
                  }
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5"
                  >
                    <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                ))}
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
                  title: "Need help starting your build?",
                  description:
                    "Start with use cases if you need direction first, then move into the build flow when you are ready to create your first engine.",
                  href: "/use-cases"
                },
                {
                  title: "Need help choosing a plan?",
                  description:
                    "The pricing page explains active engine limits, monthly Engine Credits, the hard-cap model, and when to top up versus upgrade.",
                  href: "/pricing"
                },
                {
                  title: "Need help understanding Naroa or the AI system?",
                  description:
                    "The system pages explain Naroa's role, how the supporting AIs activate, and why the product starts with orchestration first.",
                  href: "/system/ai"
                },
                {
                  title: "Need help deciding what to read next?",
                  description:
                    "Use the site guide chat or the instructions page to move through the public site in the intended order.",
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
              If you still need help, send the team a message.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Use Contact Us for a direct support question, a pricing question, or a build inquiry. You will stay on the public site the whole time.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link href="/contact?type=support" className="button-primary">
                Contact support
              </Link>
              <a href={publicContactMailto} className="button-secondary">
                Email {publicContactEmail}
              </a>
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
