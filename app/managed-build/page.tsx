import type { Metadata } from "next";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import {
  ConversionStrip,
  FaqSection,
  InfoCardGrid,
  JsonLdScript,
  PublicPageHero,
  SectionHeader,
  StepGrid
} from "@/components/marketing/public-page-sections";
import { buildFaqSchema, buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";
import {
  managedBuildDisclaimer,
  managedBuildPackageIntro,
  managedBuildPackages
} from "@/lib/pricing/config";

const managedSteps = [
  {
    title: "Strategy and scope",
    description:
      "Neroa frames the business goal, user flow, and product logic before execution widens."
  },
  {
    title: "MVP definition",
    description:
      "The build is reduced to the smallest real release worth executing first."
  },
  {
    title: "Budget alignment",
    description:
      "The path, complexity, and support level are made visible before the build moves deeper."
  },
  {
    title: "Structured execution",
    description:
      "Build work advances in defined stages instead of disappearing into a black-box delivery cycle."
  },
  {
    title: "Review checkpoints",
    description:
      "The customer reviews progress before major continuation points so the build stays aligned."
  },
  {
    title: "Launch and support",
    description:
      "Neroa helps coordinate QA visibility, launch preparation, and post-launch management options."
  }
] as const;

const guardrailCards = [
  {
    eyebrow: "Visibility",
    title: "The customer stays informed during the build",
    description:
      "Managed Build is designed to reduce the fear of runaway delivery. The customer sees where the work is, what changed, and what needs approval before the project advances."
  },
  {
    eyebrow: "Control",
    title: "Approval checkpoints keep the scope grounded",
    description:
      "Major continuation points are structured. That keeps the product aligned with business goals instead of drifting because nobody reviewed it until the end."
  },
  {
    eyebrow: "Transparency",
    title: "Neroa explains what is being built and why",
    description:
      "The build is not framed as a mysterious outsourced project. Customers get guided visibility into the product structure, workflow, and launch path."
  }
] as const;

const managedFitCards = [
  {
    title: "Founders who want speed",
    description:
      "Best for people who want Neroa to help carry execution while keeping visibility into scope, checkpoints, and launch direction."
  },
  {
    title: "Non-technical operators",
    description:
      "Useful for businesses that need software but do not want to manage fragmented freelancers, vendors, and separate dev coordination."
  },
  {
    title: "DIY customers who now need help",
    description:
      "A strong next step when a project begins in DIY but later needs faster execution, QA support, or launch coordination."
  }
] as const;

const managedIncludes = [
  {
    title: "Guided scope alignment",
    description: "The work begins with a clear product direction, MVP boundary, and execution path."
  },
  {
    title: "Staged execution",
    description: "The project advances in controlled build increments instead of one long opaque delivery cycle."
  },
  {
    title: "Review checkpoints",
    description: "Customers review progress before major continuation points so the build stays aligned."
  },
  {
    title: "QA and testing visibility",
    description: "Testing and quality checks stay visible instead of arriving only at the end."
  },
  {
    title: "Launch support",
    description: "Deployment coordination and go-live preparation are part of the managed path."
  },
  {
    title: "Post-launch management options",
    description: "When appropriate, Neroa can continue into monitored operations and small improvement cycles."
  }
] as const;

const managedFaq = [
  {
    question: "What is the difference between DIY and Managed Build?",
    answer:
      "DIY lets the customer move at their own pace inside monthly Engine Credits. Managed Build adds structured execution support, staged checkpoints, QA visibility, deployment coordination, and a scoped quote."
  },
  {
    question: "How does approval-based progress work?",
    answer:
      "Managed Build uses structured checkpoints so the customer can review progress before the project moves into the next meaningful stage."
  },
  {
    question: "Will I be able to understand the software during the build?",
    answer:
      "Yes. Managed Build is designed to be educational and transparent. The customer sees what is being built, why it matters, and how the system is taking shape."
  },
  {
    question: "Can I move from DIY into Managed Build later?",
    answer:
      "Yes. That is a normal path when a project becomes more urgent, more complex, or more business-critical than the original DIY plan."
  },
  {
    question: "What kinds of products can Neroa help build?",
    answer:
      "Managed Build can support SaaS products, internal software, external customer apps, mobile apps, marketplaces, and more complex business systems when the scope is properly defined first."
  }
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "Managed Build | Structured AI-guided software execution with Neroa",
  description:
    "Use Neroa Managed Build for phased software execution with visibility, approval checkpoints, QA support, launch coordination, and managed delivery guidance.",
  path: "/managed-build",
  keywords: [
    "managed software build service",
    "done-for-you software development alternative",
    "AI-guided software build service",
    "build software without managing developers"
  ]
});

export default function ManagedBuildPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        name: "Neroa Managed Build",
        description:
          "Structured managed software execution with phased visibility, review checkpoints, and launch support.",
        path: "/managed-build"
      }),
      buildFaqSchema([...managedFaq])
    ]
  } as const;

  return (
    <MarketingInfoShell
      ctaHref="/contact?type=managed-build-quote"
      ctaLabel="Request Managed Build Quote"
      brandVariant="prominent"
      contentWidth="wide"
    >
      <JsonLdScript data={schema} />

      <section className="mx-auto max-w-6xl">
        <PublicPageHero
          eyebrow="Managed Build Services"
          title="Get your product built with structured AI-guided execution."
          summary="Managed Build helps customers move from idea into staged execution with review points, guided visibility, and launch coordination. The build stays understandable instead of disappearing into a black-box delivery process."
          primaryAction={{
            href: "/contact?type=managed-build-quote",
            label: "Request Managed Path"
          }}
          secondaryAction={{
            href: "/pricing/managed",
            label: "View Pricing",
            tone: "secondary"
          }}
          highlights={[
            "Phased delivery",
            "Approval checkpoints",
            "Educational transparency during the build"
          ]}
          panelTitle="Managed path overview"
          panelSummary="This path is built for customers who want more than DIY guidance but still want to understand the product while it is being built."
          panelItems={[
            "Structured scope before serious build work begins",
            "Review points before major continuation",
            "Launch support and post-launch management options"
          ]}
          panelBadge="Managed visibility"
          supportingNote="Managed Build is designed to feel controlled and understandable. The customer stays close to the software, the checkpoints, and the launch logic instead of waiting through an opaque delivery cycle."
          metrics={[
            { label: "Execution model", value: "Phased delivery with review points before the project widens" },
            { label: "Customer role", value: "Stay informed, approve progress, and learn the system during the build" },
            { label: "Best fit", value: "Use Managed when speed, coordination, or launch pressure outrun DIY pacing" }
          ]}
        />
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="How Managed Build works"
          title="A staged execution path designed to reduce fear, drift, and black-box delivery."
          summary="Managed Build keeps the customer informed, keeps the product aligned, and keeps major continuation decisions visible."
        />
        <div className="mt-8">
          <StepGrid
            steps={[...managedSteps]}
            guideContext={{ onboardingStep: "public-managed", intentPrefix: "Explore managed build step" }}
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Approval guardrails"
          title="Visibility and review are part of the experience, not an afterthought."
          summary="Managed execution should feel controlled and legible. Customers should understand what is being built, what changed, and what happens next."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...guardrailCards]}
            guideContext={{ onboardingStep: "public-managed", intentPrefix: "Explore managed guardrail" }}
          />
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_0.96fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Learn while it is being built
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              The customer does not disappear for 60 days and receive a mystery system.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Managed Build is designed so the customer can understand product logic, workflows,
              software structure, and launch decisions while the project is progressing.
            </p>
            <div className="mt-6 rounded-[26px] border border-slate-200/70 bg-white/78 px-5 py-5">
              <p className="text-sm leading-7 text-slate-600">{managedBuildPackageIntro}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.94),rgba(255,255,255,0.86))] px-6 py-6 sm:px-8">
          <p className="text-sm leading-7 text-slate-700">{managedBuildDisclaimer}</p>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Best fit"
          title="Who this path is designed for."
          summary="Managed Build works best when the customer wants more speed, more support, and less coordination overhead without losing visibility into the product."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...managedFitCards]}
            guideContext={{ onboardingStep: "public-managed", intentPrefix: "Check managed fit" }}
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Managed Build includes"
          title="What the managed path is built to support."
          summary="These are the kinds of structured delivery layers customers should expect from a managed execution model."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...managedIncludes]}
            guideContext={{ onboardingStep: "public-managed", intentPrefix: "Explore managed inclusion" }}
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Package ranges"
          title="Managed pricing stays scope-led instead of pretending every build fits one flat offer."
          summary="These ranges help customers understand the shape of the managed path before they request a quote."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={managedBuildPackages.map((pkg) => ({
              eyebrow: pkg.label,
              title: pkg.buildFeeRange,
              description: pkg.summary,
              expandedDescription: `Monthly management starts at ${pkg.monthlyManagementRange}. Managed pricing narrows further after the scope, integrations, launch pressure, and support expectations are confirmed.`,
              details: [
                `Build and setup range: ${pkg.buildFeeRange}`,
                `Monthly management: ${pkg.monthlyManagementRange}`
              ]
            }))}
            columns="two"
            guideContext={{ onboardingStep: "public-managed", intentPrefix: "Review managed package range" }}
          />
        </div>
      </section>

      <section className="mt-16">
        <ConversionStrip
          eyebrow="Interactive walkthrough"
          title="Want to see the guided build logic before you request a managed path?"
          summary="The Example Build route shows how Neroa frames strategy, scope, MVP, example credits, and execution choices. It is a useful way to understand the system before you choose the Managed lane."
          actions={[
            { href: "/example-build", label: "See an Example Build" },
            {
              href: "/contact?type=managed-build-quote",
              label: "Request Managed Path",
              tone: "secondary"
            },
            { href: "/pricing/managed", label: "View Managed Pricing", tone: "secondary" }
          ]}
        />
      </section>

      <ConversionStrip
        eyebrow="DIY to Managed transition"
        title="Start in DIY when you want control, then move into Managed Build when the project deserves more support."
        summary="The two lanes are designed to work together. Customers can learn the product in DIY first, then request structured execution help later when scope, urgency, or business impact changes."
        actions={[
          {
            href: "/contact?type=managed-build-quote",
            label: "Request Managed Path"
          },
          {
            href: "/diy-build",
            label: "Compare with DIY",
            tone: "secondary"
          }
        ]}
        aside={
          <div className="comparison-band">
            <div className="comparison-metric">
              <span className="comparison-label">Checkpoint logic</span>
              <span className="comparison-value">Review progress before major continuation instead of waiting until the end.</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Visibility</span>
              <span className="comparison-value">Keep scope, QA visibility, and launch preparation understandable as the build moves.</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Support level</span>
              <span className="comparison-value">Bring Neroa in when the project needs more speed, coordination, or operational help.</span>
            </div>
          </div>
        }
      />

      <FaqSection
        eyebrow="Managed Build FAQ"
        title="Questions that reduce fear before someone requests a managed path."
        summary="These answers are designed to make Managed Build feel structured, transparent, and credible instead of vague."
        items={managedFaq}
        guideContext={{ onboardingStep: "public-managed", intentPrefix: "Review managed question" }}
      />

      <ConversionStrip
        eyebrow="Next step"
        title="Bring Neroa in when the build needs more execution support, launch help, or coordinated visibility."
        summary="Managed Build is for customers who want software progress without disappearing into a black-box agency process."
        actions={[
          {
            href: "/contact?type=managed-build-quote",
            label: "Request Managed Build Quote"
          },
          {
            href: "/start",
            label: "Start with Neroa",
            tone: "secondary"
          },
          { href: "/example-build", label: "See an Example Build", tone: "secondary" }
        ]}
      />
    </MarketingInfoShell>
  );
}
