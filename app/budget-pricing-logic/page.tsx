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
import { pricingScopeDisclaimer } from "@/lib/pricing/config";

const budgetEffectCards = [
  {
    eyebrow: "Scope",
    title: "Budget changes what belongs in phase one",
    description:
      "Budget helps decide what should launch now, what should wait, and how much of the full product should be carried in the first serious build."
  },
  {
    eyebrow: "Pace",
    title: "Budget changes how quickly the product can move",
    description:
      "A product can move slowly over time, move steadily with occasional acceleration, or move faster with more credits, more support, or a managed lane."
  },
  {
    eyebrow: "Complexity",
    title: "Budget has to match systems, integrations, and workflow depth",
    description:
      "The more data models, user roles, integrations, approvals, automation, and QA pressure a product carries, the more build effort it usually needs."
  },
  {
    eyebrow: "Support",
    title: "Budget also changes how much execution help belongs in the path",
    description:
      "Some products can stay comfortably in DIY. Others need more coordination, oversight, and delivery support than a self-driven pace should carry."
  }
] as const;

const diyVsManagedCards = [
  {
    eyebrow: "DIY budgeting",
    title: "Monthly credits shape capacity and rhythm",
    description:
      "DIY budgeting is usually about monthly Engine Credits, how much guided build work fits in the current cycle, and what should be deferred into later phases when scope is heavier than the monthly pool."
  },
  {
    eyebrow: "Managed budgeting",
    title: "Managed budgeting is quote-led and support-aware",
    description:
      "Managed budgeting is shaped around scope, systems, launch pressure, QA expectations, implementation depth, and how much Neroa needs to carry directly during execution."
  }
] as const;

const complexityDrivers = [
  {
    title: "More user roles and permissions",
    description:
      "A product with admins, operators, customers, vendors, or multiple account types takes more structure than a simple single-user workflow."
  },
  {
    title: "Heavier integrations and automations",
    description:
      "Payments, messaging, analytics, CRMs, inventory systems, scheduling, external APIs, and data sync all increase build and testing effort."
  },
  {
    title: "Deeper workflow logic",
    description:
      "Approvals, routing, dashboards, state changes, edge cases, and reporting layers all add real complexity even when the interface looks visually simple."
  },
  {
    title: "Launch and operating expectations",
    description:
      "QA depth, release timing, training, SOP handoff, bug handling, and post-launch support also affect the real build path and cost."
  }
] as const;

const managedFitCards = [
  {
    title: "The product is larger than a steady DIY pace",
    description:
      "If the roadmap is heavier than the monthly credit rhythm can comfortably support, Managed Build may be the cleaner next move."
  },
  {
    title: "The founder does not want to drive execution personally",
    description:
      "Some customers want clarity and involvement, but not the operational burden of carrying the whole execution lane themselves."
  },
  {
    title: "Launch urgency or business risk is high",
    description:
      "When timing, customer pressure, or internal dependence rises, more direct execution support often becomes the safer path."
  }
] as const;

const budgetFaq = [
  {
    question: "Why can two similar-looking products have very different budgets?",
    answer:
      "Because the visible interface is only part of the work. User roles, integrations, workflow depth, QA needs, launch expectations, and support requirements all change the real execution effort."
  },
  {
    question: "How does DIY budgeting work inside Neroa?",
    answer:
      "DIY budgeting uses the subscription plus monthly Engine Credits to define guided build capacity. The product can move within that monthly rhythm, be accelerated with extra credits, or be phased over time."
  },
  {
    question: "How is Managed Build budgeting different?",
    answer:
      "Managed Build is scoped separately because it includes more direct execution support, review cadence, QA visibility, launch coordination, and delivery responsibility than the DIY lane."
  },
  {
    question: "Does a smaller budget mean the product is impossible?",
    answer:
      "Not necessarily. It usually means the scope, timing, and support model need to be adjusted so the first phase is practical instead of pretending the full roadmap can land immediately."
  },
  {
    question: "When should someone move from DIY to Managed?",
    answer:
      "Usually when the project becomes more complex, more urgent, or more operationally important than a steady self-driven pace should reasonably carry."
  }
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "Budget and Pricing Logic | Honest build budgeting with NEROA",
  description:
    "Understand how budget changes scope, pace, credits, support, and execution lanes in NEROA. Learn the difference between DIY build budgeting and managed build budgeting before you choose a path.",
  path: "/budget-pricing-logic",
  keywords: [
    "software budget logic",
    "build budget explainer",
    "DIY software build budgeting",
    "managed software build budgeting"
  ]
});

export default function BudgetPricingLogicPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        name: "Budget and Pricing Logic",
        description:
          "Educational product page explaining how budget changes scope, pace, credits, complexity, and execution lanes in NEROA.",
        path: "/budget-pricing-logic"
      }),
      buildFaqSchema([...budgetFaq])
    ]
  } as const;

  return (
    <MarketingInfoShell
      ctaHref="/pricing"
      ctaLabel="Compare the paths"
      brandVariant="prominent"
      contentWidth="wide"
    >
      <JsonLdScript data={schema} />

      <section className="mx-auto max-w-6xl">
        <PublicPageHero
          eyebrow="Budget and pricing logic"
          title="Budget should explain what is realistic, not sell a fantasy."
          summary="NEROA treats budget as a planning tool. It changes scope, pace, support level, sequencing, and when a product should stay DIY or move into Managed."
          primaryAction={{ href: "/start", label: "Start your DIY Build" }}
          secondaryAction={{
            href: "/start",
            label: "Start Managed Build",
            tone: "secondary"
          }}
          highlights={[
            "Budget affects scope and pace",
            "DIY and Managed use different budgeting logic",
            "Complex products need heavier execution support"
          ]}
          panelTitle="The core rule"
          panelSummary="Budget is not only about affordability. It decides what belongs in phase one, how fast it should move, and how much Neroa should carry directly."
          panelItems={[
            "Use a smaller budget to shape a stronger first phase instead of pretending the full roadmap can launch now",
            "Use credits, timeline, and scope reduction deliberately in DIY",
            "Move to Managed when complexity, QA burden, or urgency makes the execution lane heavier"
          ]}
          panelBadge="Honest planning"
          supportingNote={pricingScopeDisclaimer}
          metrics={[
            { label: "DIY", value: "Monthly Engine Credits define guided capacity and build rhythm" },
            { label: "Managed", value: "Scope, support, and complexity define the quote and delivery model" },
            { label: "Decision lens", value: "Choose by scope honesty, not just by chasing the lowest number" }
          ]}
        />
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="What budget changes"
          title="Budget shapes more than price."
          summary="A serious budget discussion should explain what belongs in the first phase, how fast the work can move, and whether the build should stay DIY or shift into a more supported lane."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...budgetEffectCards]}
            columns="two"
            affordanceMode="icon"
            guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Explore budget logic effect" }}
          />
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_0.96fr]">
        <div>
          <SectionHeader
            eyebrow="DIY vs Managed"
            title="The two lanes use different budgeting logic."
            summary="DIY is paced by monthly capacity and can stretch over time. Managed is scoped around delivery support, execution weight, and the operational load Neroa takes on directly."
          />
          <div className="mt-8">
            <InfoCardGrid
              items={[...diyVsManagedCards]}
              columns="two"
              affordanceMode="icon"
              guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Compare DIY and managed budgeting" }}
            />
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Practical budgeting lens
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Smaller budget does not mean no path. It means sharper sequencing.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              A tighter starting budget often points toward a stronger MVP cut, a slower monthly
              pace, or a phased build strategy. That can still produce a serious product when the
              first release is chosen carefully.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Larger or more urgent builds often need heavier delivery support, deeper QA, more
              integrations, and a faster review rhythm. That is where Managed Build becomes more
              appropriate than forcing everything through DIY alone.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Complexity drivers"
          title="These are the factors that usually make one build heavier than another."
          summary="If a build feels expensive, the answer is usually inside the workflow depth, systems, roles, and release expectations, not the visual design alone."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...complexityDrivers]}
            affordanceMode="icon"
            guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Review build complexity driver" }}
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="When Managed becomes the better fit"
          title="Some products should not stay in a light DIY lane forever."
          summary="NEROA should recommend Managed when complexity, urgency, QA burden, or operational importance gets heavy enough that credits alone stop being the right answer."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...managedFitCards]}
            affordanceMode="icon"
            guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Check managed recommendation" }}
          />
        </div>
      </section>

      <FaqSection
        eyebrow="Budget logic FAQ"
        title="Questions people ask once they want the pricing model to make real sense."
        summary="These answers reduce ambiguity before someone chooses DIY, Managed, or a phased path between them."
        items={budgetFaq}
        guideContext={{ onboardingStep: "public-pricing", intentPrefix: "Review budget logic question" }}
      />

      <ConversionStrip
        eyebrow="Choose the next step"
        title="Use the budgeting logic to choose the right lane, not just the cheapest-sounding one."
        summary="DIY is strongest when you want control and structured pacing. Managed is strongest when the build needs more execution support, coordination, or launch pressure relief."
        actions={[
          { href: "/pricing", label: "Compare the Two Paths" },
          { href: "/start", label: "Start Managed Build", tone: "secondary" }
        ]}
        aside={
          <div className="comparison-band">
            <div className="comparison-metric">
              <span className="comparison-label">DIY best fit</span>
              <span className="comparison-value">
                Better when the customer wants to pace the build and stay hands-on.
              </span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Managed best fit</span>
              <span className="comparison-value">
                Better when the execution lane is too heavy, urgent, or operationally important.
              </span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Shared rule</span>
              <span className="comparison-value">
                Honest scope and realistic sequencing create better outcomes than fake low-cost promises.
              </span>
            </div>
          </div>
        }
      />
    </MarketingInfoShell>
  );
}
