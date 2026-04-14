import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
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
  if (value === "early-access" || value === "general") {
    return "other";
  }

  if (value === "partnership") {
    return "agency-partner";
  }

  return publicInquiryTypeOptions.some((option) => option.value === value)
    ? (value as PublicInquiryType)
    : "other";
}

export default function ContactPage({ searchParams }: ContactPageProps) {
  const initialInquiryType = getInitialInquiryType(searchParams?.type);

  return (
    <MarketingInfoShell ctaHref="/support" ctaLabel="Get support" brandVariant="prominent">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
              Contact Us
            </p>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem] xl:leading-[0.96]">
              Tell Neroa what you want to build and we’ll route the right next conversation.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">
              Use this page for SaaS projects, internal software, external apps, builder partnerships, or support questions. Everything stays inside the public-site experience, with a clear confirmation state after submission.
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
                Tell us what you need.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Choose the build path or inquiry type that fits best, then add the product context the team needs to respond well.
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
                "Use SaaS project if you want help turning a product idea into an MVP scope, budget, and build plan.",
                "Use Internal software project for CRMs, admin systems, workflow tools, portals, and operations software.",
                "Use External app / customer-facing product for websites, portals, booking tools, and branded digital products.",
                "Use Agency / builder partnership for client delivery, repeatable templates, or builder collaboration conversations."
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
              <Link href="/support" className="button-secondary">
                Open support page
              </Link>
              <Link href="/instructions" className="button-secondary">
                Read instructions
              </Link>
              <Link href="/start" className="button-secondary">
                Start your build
              </Link>
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
