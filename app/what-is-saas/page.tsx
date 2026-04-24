import type { Metadata } from "next";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import {
  ConversionStrip,
  FaqSection,
  InfoCardGrid,
  JsonLdScript,
  PublicPageHero,
  SectionHeader
} from "@/components/marketing/public-page-sections";
import { buildFaqSchema, buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";

const definitionCards = [
  {
    eyebrow: "What SaaS is",
    title: "Software people log into and use repeatedly",
    description:
      "SaaS usually means a product people access through accounts, roles, data, and recurring workflows instead of a one-time static website."
  },
  {
    eyebrow: "What SaaS does",
    title: "It becomes the system that runs a business process",
    description:
      "A serious SaaS product helps people complete work, track activity, manage customers, coordinate teams, or deliver a repeatable service through software."
  },
  {
    eyebrow: "Why founders get confused",
    title: "Many products called an app are really a SaaS system",
    description:
      "Portals, dashboards, booking systems, marketplaces, member platforms, and workflow tools often share the same underlying SaaS logic even when the founder uses different language."
  }
] as const;

const productShapeCards = [
  {
    eyebrow: "Internal apps",
    title: "Operations software and team dashboards",
    description:
      "This includes approval systems, internal reporting, CRMs, admin panels, and workflow software that helps a team run the business more cleanly."
  },
  {
    eyebrow: "External apps",
    title: "Customer-facing portals and service flows",
    description:
      "This covers products where customers log in, submit requests, manage bookings, track activity, or access an ongoing service experience."
  },
  {
    eyebrow: "Dashboards and portals",
    title: "Data visibility plus user access in one product",
    description:
      "Many SaaS products combine reporting, account access, notifications, and role-specific views so founders can serve customers and manage the business from one system."
  },
  {
    eyebrow: "Marketplaces",
    title: "Multi-sided products with more than one user role",
    description:
      "A marketplace or service network often needs buyers, sellers, admins, payouts, approvals, messaging, and operational controls in one coordinated product."
  },
  {
    eyebrow: "Workflow systems",
    title: "Process software that replaces manual work",
    description:
      "A workflow product can route approvals, tasks, documents, scheduling, or service steps through software instead of keeping the business trapped in email and spreadsheets."
  },
  {
    eyebrow: "Subscription and service platforms",
    title: "Recurring-value software with real product logic",
    description:
      "This can include subscription platforms, client service hubs, member systems, and recurring delivery software where access, retention, and lifecycle matter."
  }
] as const;

const founderOrientationCards = [
  {
    title: "You might be building internal software",
    description:
      "If the product is mainly for your own team, ops, reporting, approvals, or service delivery, the right frame may be internal software even if it still uses SaaS-style accounts and dashboards."
  },
  {
    title: "You might be building an external product",
    description:
      "If customers, clients, vendors, or members log in and interact with the system directly, you are likely shaping a customer-facing SaaS or service platform."
  },
  {
    title: "You may be building a hybrid system",
    description:
      "Many serious products have both sides: a customer portal on the front end and internal dashboards, approvals, and operations software on the back end."
  }
] as const;

const saasFaq = [
  {
    question: "What counts as SaaS if I am not building the next big startup app?",
    answer:
      "SaaS does not only mean a venture-backed startup product. It can also mean client portals, internal operations systems, service platforms, workflow software, reporting dashboards, or niche subscription tools."
  },
  {
    question: "Can an internal app still be part of a SaaS-style product system?",
    answer:
      "Yes. Internal tools often use the same foundations as SaaS: accounts, roles, dashboards, approvals, reporting, and recurring operational workflows."
  },
  {
    question: "What makes a product mobile-ready from the start?",
    answer:
      "Mobile-ready planning means the account structure, workflow logic, permissions, notifications, and interface priorities are shaped so the product can support a strong mobile experience later without a full rethink."
  },
  {
    question: "How does Neroa help a non-technical founder name the product correctly?",
    answer:
      "NEROA helps founders describe the product by workflow, user type, and operating model instead of getting stuck on vague labels. That makes scope, budget, and build-path decisions much clearer."
  }
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "What Is SaaS? | Product education for non-technical founders with NEROA",
  description:
    "Learn what SaaS actually means, what kinds of products NEROA can help shape, and how dashboards, portals, workflows, marketplaces, and mobile-ready planning fit into one serious product path.",
  path: "/what-is-saas",
  keywords: [
    "what is SaaS",
    "SaaS explainer",
    "what kind of software am I building",
    "non technical founder SaaS guide"
  ]
});

export default function WhatIsSaasPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        name: "What Is SaaS?",
        description:
          "Educational product page explaining what SaaS is, what it can do, and how NEROA helps founders shape the right software path.",
        path: "/what-is-saas"
      }),
      buildFaqSchema([...saasFaq])
    ]
  } as const;

  return (
    <MarketingInfoShell
      ctaHref="/start"
      ctaLabel="Start a conversation"
      brandVariant="prominent"
      contentWidth="wide"
    >
      <JsonLdScript data={schema} />

      <section className="mx-auto max-w-6xl">
        <PublicPageHero
          eyebrow="SaaS explainer"
          title="Understand what kind of SaaS product you may actually be building."
          summary="NEROA helps non-technical founders describe the software correctly before they overspend, underscope it, or treat a real product system like a vague app idea."
          primaryAction={{ href: "/start", label: "Start a conversation" }}
          secondaryAction={{
            href: "/start",
            label: "Start Managed Build",
            tone: "secondary"
          }}
          highlights={[
            "Clarify the product before execution",
            "See the real software shape behind the idea",
            "Plan mobile-ready from the start"
          ]}
          panelTitle="What this page does"
          panelSummary="This page is here to make the product easier to name, easier to scope, and easier to route into the right next build decision."
          panelItems={[
            "Separate internal tools from customer-facing systems",
            "Recognize dashboards, portals, marketplaces, and service platforms clearly",
            "Understand what mobile-ready planning changes before the build starts"
          ]}
          panelBadge="Founder education"
          supportingNote="A cleaner product definition makes MVP, budget, and execution-lane decisions much easier to trust."
          metrics={[
            { label: "Good first outcome", value: "Name the product correctly before scoping it" },
            { label: "Common mistake", value: "Calling a multi-role system just an app or just a dashboard" },
            { label: "Next step", value: "Move into DIY or Managed once the product shape is clear" }
          ]}
        />
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="What SaaS means"
          title="SaaS is a working product system, not just a startup label."
          summary="A serious SaaS product combines accounts, workflows, data, permissions, and recurring usage, which is why it is often much bigger than one feature list."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...definitionCards]}
            affordanceMode="icon"
            guideContext={{ onboardingStep: "public-seo-landing", intentPrefix: "Explore SaaS definition" }}
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Common product shapes"
          title="These are the kinds of products NEROA can help founders shape."
          summary="The same build system can support internal software, customer-facing software, or hybrid products that combine both sides of the business."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...productShapeCards]}
            columns="three"
            affordanceMode="icon"
            guideContext={{ onboardingStep: "public-seo-landing", intentPrefix: "Review SaaS product shape" }}
          />
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_0.96fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Mobile-ready planning
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Mobile-ready does not mean build a second product first.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              It means the account structure, navigation, notifications, approvals, and user flows
              are shaped so the product can support a strong mobile experience later without
              changing the whole core offer.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              NEROA uses that framing to help founders avoid overcommitting to native mobile too
              early while still planning the software correctly from day one.
            </p>
          </div>
        </div>

        <div>
          <SectionHeader
            eyebrow="Founder orientation"
            title="A clearer label leads to a clearer build path."
            summary="This is usually where a founder realizes the product is internal, external, or hybrid and can scope it more honestly."
          />
          <div className="mt-8">
            <InfoCardGrid
              items={[...founderOrientationCards]}
              affordanceMode="icon"
              guideContext={{ onboardingStep: "public-seo-landing", intentPrefix: "Orient SaaS founder" }}
            />
          </div>
        </div>
      </section>

      <FaqSection
        eyebrow="SaaS explainer FAQ"
        title="Questions founders usually ask once the product starts getting real."
        summary="These answers clarify the product category before the founder chooses DIY or Managed."
        items={saasFaq}
        guideContext={{ onboardingStep: "public-seo-landing", intentPrefix: "Review SaaS explainer question" }}
      />

      <ConversionStrip
        eyebrow="Next action"
        title="Pressure-test the product against budget and the right next path."
        summary="Once the software shape is clear, the next useful step is deciding whether it should stay in a builder-paced lane or move toward a more supported execution path."
        actions={[
          { href: "/budget-pricing-logic", label: "Understand Budget Logic" },
          { href: "/start", label: "Start a conversation", tone: "secondary" }
        ]}
        aside={
          <div className="comparison-band">
            <div className="comparison-metric">
              <span className="comparison-label">DIY</span>
              <span className="comparison-value">
                Best when you want to control pace and learn the product while shaping it.
              </span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Managed</span>
              <span className="comparison-value">
                Best when execution weight, speed, or coordination is too heavy to carry alone.
              </span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Budget logic</span>
              <span className="comparison-value">
                Scope, pace, and support level still determine how the product should move.
              </span>
            </div>
          </div>
        }
      />
    </MarketingInfoShell>
  );
}
