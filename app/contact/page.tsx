import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { PublicActionLink } from "@/components/site/public-action-link";
import { PublicContactForm } from "@/components/support/public-contact-form";
import { publicContactEmail, publicContactMailto } from "@/lib/data/public-contact";
import {
  publicInquiryTypeOptions,
  type PublicInquiryType
} from "@/lib/data/public-help";

type ContactPageProps = {
  searchParams?: {
    type?: string;
  };
};

function getInitialInquiryType(value?: string): PublicInquiryType {
  if (value === "early-access" || value === "general" || value === "seo-marketing-upgrade") {
    return "other";
  }

  if (
    value === "saas-project" ||
    value === "internal-software-project" ||
    value === "external-app-project" ||
    value === "mobile-app-project"
  ) {
    return "saas-project";
  }

  if (value === "partnership" || value === "agency-command") {
    return "agency-partner";
  }

  if (value === "managed-build" || value === "managed-build-quote") {
    return "managed-build-quote";
  }

  return publicInquiryTypeOptions.some((option) => option.value === value)
    ? (value as PublicInquiryType)
    : "other";
}

export default function ContactPage({ searchParams }: ContactPageProps) {
  const initialInquiryType = getInitialInquiryType(searchParams?.type);

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
              Contact Us
            </p>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem] xl:leading-[0.96]">
              Tell NEROA what you need and we&apos;ll route the right next conversation.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">
              Use this page for SaaS project planning, managed build quote requests, partnerships,
              or support questions. The public flow stays clear, and the team gets the context it
              needs to respond well.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {publicInquiryTypeOptions.map((option) => (
                <div key={option.value} className="floating-plane rounded-[26px] p-5">
                  <div className="floating-wash rounded-[26px]" />
                  <div className="relative">
                    <p className="text-sm font-semibold text-slate-950">{option.label}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Inquiry form
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Give NEROA the right starting context.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Choose the inquiry type that fits best, then add the product or support context the
                team needs to respond clearly.
              </p>

              <div className="mt-6">
                <PublicContactForm initialInquiryType={initialInquiryType} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Before you send
            </p>
            <div className="mt-6 grid gap-4">
              {[
                "Use SaaS project if you want help turning an idea into a scoped product, clearer MVP boundary, and real build path.",
                "If the software includes internal workflows, customer portals, or a mobile-ready rollout later, start with SaaS project and explain that in the message.",
                "Use Managed build quote when you want NEROA or a partner team to help execute, QA, deploy, and manage the software.",
                "Use Agency / builder partnership for client-delivery relationships, repeatable templates, or collaboration conversations.",
                "Use Support when you need help with pricing, the public site, or the right next step before starting a project."
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5 text-sm leading-7 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Need guidance first?
            </p>
            <div className="mt-6 grid gap-3">
              <Link href="/contact?type=support" className="button-secondary">
                Contact support
              </Link>
              <Link href="/pricing" className="button-secondary">
                Compare build paths
              </Link>
              <PublicActionLink
                href="/start"
                label="Start your build"
                className="button-secondary"
              >
                Start your build
              </PublicActionLink>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5">
              <p className="text-sm font-semibold text-slate-950">Direct contact email</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                If you prefer email, reach the team directly at{" "}
                <a
                  href={publicContactMailto}
                  className="font-medium text-cyan-700 transition hover:text-cyan-800"
                >
                  {publicContactEmail}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
