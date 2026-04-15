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
import {
  executionCreditPacks,
  getExecutionCreditPackUnitPrice,
  growthUpgrades,
  growthLayerScenarios,
  managedBuildPackages,
  pricingScopeDisclaimer
} from "@/lib/pricing/config";

const pricingSplitCards = [
  {
    eyebrow: "DIY Build Pricing",
    title: "Monthly access plus Engine Credits",
    description:
      "DIY pricing is for customers who want guided structure, budget control, and the ability to build over time instead of funding the entire product upfront.",
    href: "/pricing/diy",
    ctaLabel: "Open DIY pricing"
  },
  {
    eyebrow: "Managed Build Pricing",
    title: "Scoped execution plus management",
    description:
      "Managed pricing is for customers who want structured execution help, QA visibility, launch coordination, and a quote-led delivery path.",
    href: "/pricing/managed",
    ctaLabel: "Open managed pricing"
  }
] as const;

const diyLogicCards = [
  {
    title: "Plans include monthly Engine Credits",
    description:
      "The credit pool defines how much guided build activity can happen in a month. The pool resets with the plan instead of pretending the subscription includes endless labor."
  },
  {
    title: "Scope determines pace",
    description:
      "The same kind of software can move at very different speeds depending on scope. Neroa shows the estimate after the build is defined so customers can choose the right pacing path."
  },
  {
    title: "Scale up only when the work proves it",
    description:
      "Customers can start lower, add credits for heavier months, or upgrade when the project becomes more serious."
  }
] as const;

const pacingExamples = [
  {
    eyebrow: "Lean path",
    title: "Lower monthly budget",
    description:
      "Best for customers who want to move carefully, stay inside monthly plan limits, and let the product mature over time."
  },
  {
    eyebrow: "Balanced path",
    title: "Monthly credits plus occasional top-ups",
    description:
      "Useful when launch timing matters sometimes, but the customer still wants to stay largely inside the DIY model."
  },
  {
    eyebrow: "Fast path",
    title: "Higher plan, more credits, or managed support",
    description:
      "Best when the product needs to move faster, the integration depth is higher, or the software is becoming business-critical."
  }
] as const;

const managedSummaryCards = managedBuildPackages.map((pkg) => ({
  eyebrow: pkg.label,
  title: pkg.buildFeeRange,
  description: `${pkg.monthlyManagementRange}. ${pkg.summary}`
}));

const pathFitCards = [
  {
    title: "Choose DIY if you want control and flexible pacing",
    description:
      "DIY fits customers who want to learn the product, manage pace with monthly credits, and expand only when the software proves itself."
  },
  {
    title: "Choose Managed if you want structured execution help",
    description:
      "Managed fits customers who want Neroa to help carry execution, QA visibility, and launch coordination with a clearer delivery path."
  }
] as const;

const growthLayerCards = [
  {
    title: "Credit expansion keeps acceleration visible",
    description:
      "Customers can buy additional Engine Credits when they want to compress a build window instead of pretending the subscription includes unlimited speed."
  },
  {
    title: "Growth upgrades stay separate from the base build plan",
    description:
      "AI SEO + Marketing Optimization is positioned as a paid upgrade so product growth work does not get confused with core build capacity."
  },
  {
    title: "Managed escalation happens when the scope gets heavy",
    description:
      "When a project crosses the complexity comfort line, Neroa recommends managed or hybrid execution instead of relying on more credits alone."
  }
] as const;

const pricingFaq = [
  {
    question: "What do Neroa plans actually include?",
    answer:
      "DIY plans include access to the product plus a monthly Engine Credit pool. Managed Build uses separate scoped pricing and is not part of the monthly DIY subscription."
  },
  {
    question: "Why does pace matter in pricing?",
    answer:
      "Because the same project can be built slowly over time or pushed faster with more credits, a higher plan, or a managed path. Neroa makes that pacing logic visible instead of hiding it."
  },
  {
    question: "Does a higher plan mean unlimited build labor?",
    answer:
      "No. Even the higher DIY plans are still structured around monthly Engine Credits, visible build capacity, and scoped execution."
  },
  {
    question: "When should someone move from DIY into Managed Build?",
    answer:
      "Usually when the project becomes more urgent, more integration-heavy, or more business-critical than a DIY pacing model can comfortably support."
  }
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "Pricing | Choose the right Neroa build path and pace",
  description:
    "Compare Neroa DIY Build pricing and Managed Build pricing. Understand Engine Credits, monthly pacing, scoped execution, and which path fits your software build.",
  path: "/pricing",
  keywords: [
    "AI app builder pricing",
    "software build pricing",
    "build SaaS with AI pricing",
    "software development alternative pricing"
  ]
});

export default function PricingPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        name: "Neroa Pricing",
        description:
          "Choose between DIY Build pricing with monthly Engine Credits and Managed Build pricing with scoped execution support.",
        path: "/pricing"
      }),
      buildFaqSchema([...pricingFaq])
    ]
  } as const;

  return (
    <MarketingInfoShell
      ctaHref="/start"
      ctaLabel="Start DIY Build"
      brandVariant="prominent"
      contentWidth="wide"
    >
      <JsonLdScript data={schema} />

      <section className="mx-auto max-w-6xl">
        <PublicPageHero
          eyebrow="Pricing"
          title="Choose the build path and pace that fits your product."
          summary="Neroa pricing is designed to make the model legible: DIY subscriptions give access plus monthly Engine Credits, while Managed Build uses separate scoped pricing for customers who want more execution support."
          primaryAction={{ href: "/pricing/diy", label: "View DIY Pricing" }}
          secondaryAction={{ href: "/pricing/managed", label: "View Managed Pricing", tone: "secondary" }}
          highlights={[
            "DIY for flexible monthly pacing",
            "Managed for scoped execution support",
            "No fake unlimited-build pricing language"
          ]}
          panelTitle="How to read Neroa pricing"
          panelSummary="Pricing is easiest to understand when the customer separates monthly guided build capacity from managed execution support."
          panelItems={[
            "DIY plans define monthly pace through Engine Credits",
            "Managed Build is scoped separately from DIY subscriptions",
            "The right path depends on budget, urgency, and execution needs"
          ]}
          panelBadge="Path selection"
          supportingNote="Pricing should tell the customer how to think about pace, support, and scope, not just present a table of numbers with hidden assumptions."
          metrics={[
            { label: "DIY", value: "Monthly subscription plus Engine Credits for guided build capacity" },
            { label: "Managed", value: "Scoped quote plus structured execution and support" },
            { label: "Decision lens", value: "Choose by budget, urgency, and support needs" }
          ]}
        />
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Pricing split"
          title="Two lanes, one product logic."
          summary="The DIY and Managed paths are connected, but they should not be confused. One is paced by monthly credits. The other is quote-led and support-heavy."
        />
        <div className="mt-8">
          <ConversionStrip
            eyebrow="See it in motion"
            title="Want to see how a build gets framed before you compare plans?"
            summary="Open the interactive Example Build to watch Neroa move a product through strategy, scope, MVP, example credits, and build-path decisions before you pick the pricing lane that fits."
            actions={[
              { href: "/example-build", label: "See an Example Build" },
              { href: "/pricing/diy", label: "Open DIY Pricing", tone: "secondary" },
              { href: "/pricing/managed", label: "Open Managed Pricing", tone: "secondary" }
            ]}
          />
        </div>
        <div className="mt-8">
          <InfoCardGrid
            items={[...pricingSplitCards]}
            columns="two"
            guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Compare pricing lane" }}
          />
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_0.96fr]">
        <div>
          <SectionHeader
            eyebrow="DIY pricing logic"
            title="Monthly credits define pace and capacity."
            summary={pricingScopeDisclaimer}
          />
        <div className="mt-8">
          <InfoCardGrid
            items={[...diyLogicCards]}
            guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Explore DIY pricing logic" }}
          />
        </div>
      </div>

        <div>
          <SectionHeader
            eyebrow="Example pacing"
            title="Different budgets create different build rhythms."
            summary="Neroa helps customers understand how a project can move slowly, steadily, or quickly depending on plan level, added credits, and whether the build stays DIY."
          />
        <div className="mt-8">
          <InfoCardGrid
            items={[...pacingExamples]}
            guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Review pricing pace" }}
          />
        </div>
      </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Managed pricing"
          title="Managed work is priced around scope, complexity, and support level."
          summary="Managed Build pricing is intentionally separate from DIY pricing because it includes structured execution help, staged reviews, launch support, and ongoing management options."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={managedSummaryCards}
            columns="two"
            guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Review managed pricing range" }}
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Which path is right for you?"
          title="Use pricing to choose the right operating model, not just the lowest number."
          summary="The best path depends on how much control, support, speed, and coordination the project really needs."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...pathFitCards]}
            columns="two"
            guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Choose pricing path fit" }}
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Credit packs"
          title="Credit packs are there to accelerate, not to blur the rules."
          summary="Customers can buy more Engine Credits when a month runs heavier, but the product still stays explicit about pace, scope, and hard monthly limits."
        />
        <div className="mt-8 comparison-band">
          <div className="comparison-metric">
            <span className="comparison-label">Monthly plan</span>
            <span className="comparison-value">Sets the default build rhythm and recurring credit pool.</span>
          </div>
          <div className="comparison-metric">
            <span className="comparison-label">Credit packs</span>
            <span className="comparison-value">Create a faster month without pretending the subscription became unlimited.</span>
          </div>
          <div className="comparison-metric">
            <span className="comparison-label">Hard rule</span>
            <span className="comparison-value">Scope still governs execution, and heavy builds may need a higher tier or managed path.</span>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <InfoCardGrid
            items={executionCreditPacks.map((pack) => ({
              eyebrow: pack.label,
              title: `${pack.credits.toLocaleString()} Engine Credits`,
              description: `$${pack.price}`,
              footnote: `$${getExecutionCreditPackUnitPrice(pack).toFixed(3)} per credit`,
              expandedDescription: pack.detail,
              details: [
                "Use this when you want to accelerate a heavier month without changing the base plan.",
                "Credits increase pace, not unlimited labor."
              ]
            }))}
            columns="four"
            guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Review credit pack" }}
          />
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_0.96fr]">
        <div>
          <SectionHeader
            eyebrow="Growth layer"
            title="Pricing expands through credits, upgrades, and smarter escalation."
            summary="The base plan gets someone into Neroa. The growth layer explains how they accelerate, when they add revenue support, and when the scope should move into managed execution."
          />
        <div className="mt-8">
          <InfoCardGrid
            items={[...growthLayerCards]}
            guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Explore growth layer" }}
          />
        </div>
      </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Example acceleration logic
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              A heavier SaaS scope can start slowly or be accelerated intentionally.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              For example, the {growthLayerScenarios[1]?.label.toLowerCase()} scenario is modeled at{" "}
              {growthLayerScenarios[1]?.totalCredits.toLocaleString()} credits. That is exactly why
              Neroa shows slower monthly pacing, credit expansion, and managed support as separate choices.
            </p>
            <div className="comparison-band mt-6">
              <div className="comparison-metric">
                <span className="comparison-label">Stay on base plan</span>
                <span className="comparison-value">
                  Build more slowly with the included monthly credit pool.
                </span>
              </div>
              <div className="comparison-metric">
                <span className="comparison-label">Accelerate with credits</span>
                <span className="comparison-value">
                  Buy additional Engine Credits and compress the build window.
                </span>
              </div>
              <div className="comparison-metric">
                <span className="comparison-label">Escalate to managed</span>
                <span className="comparison-value">
                  Switch to a hybrid or managed path when execution risk gets heavier than credits alone should solve.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Paid upgrade layer"
          title="Optional growth services can sit on top of the build."
          summary="Neroa can add growth-focused work as a separate paid layer when the product also needs search positioning, landing-page generation, and content optimization."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={growthUpgrades.map((upgrade) => ({
              eyebrow: upgrade.availability,
              title: `${upgrade.label} - ${upgrade.pricing}`,
              description: `${upgrade.detail} Includes ${upgrade.features.join(", ")}.`,
              href: "/contact?type=seo-marketing-upgrade",
              ctaLabel: "Ask about this upgrade"
            }))}
            columns="two"
            guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Review paid growth upgrade" }}
          />
        </div>
      </section>

      <FaqSection
        eyebrow="Pricing FAQ"
        title="Questions that make the pricing model easier to trust."
        summary="These answers help customers understand how monthly pacing, credits, upgrades, and managed support fit together."
        items={pricingFaq}
        guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Review pricing question" }}
      />

      <ConversionStrip
        eyebrow="Next step"
        title="Start where the budget and urgency are honest."
        summary="DIY works when the customer wants flexible monthly pacing. Managed works when the project needs more direct execution help. Neroa supports both without blending the pricing into one confusing promise."
        actions={[
          { href: "/pricing/diy", label: "Open DIY Pricing" },
          { href: "/pricing/managed", label: "Open Managed Pricing", tone: "secondary" },
          { href: "/example-build", label: "See an Example Build", tone: "secondary" }
        ]}
        aside={
          <div className="comparison-band">
            <div className="comparison-metric">
              <span className="comparison-label">Control</span>
              <span className="comparison-value">DIY is better when the customer wants pacing flexibility and tighter budget control.</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Support</span>
              <span className="comparison-value">Managed is better when the build needs stronger execution help, QA visibility, or launch coordination.</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Upgrade path</span>
              <span className="comparison-value">The two lanes stay connected, so customers can switch as the product proves itself.</span>
            </div>
          </div>
        }
      />
    </MarketingInfoShell>
  );
}
