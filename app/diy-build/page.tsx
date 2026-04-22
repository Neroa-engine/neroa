import type { Metadata } from "next";
import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import {
  FaqSection,
  InfoCardGrid,
  JsonLdScript,
  PublicPageHero,
  SectionHeader,
  StepGrid
} from "@/components/marketing/public-page-sections";
import { PublicActionLink } from "@/components/site/public-action-link";
import { getOptionalUser } from "@/lib/auth";
import {
  publicLaunchManagedCta,
  publicLaunchPrimaryCta
} from "@/lib/data/public-launch";
import { buildFaqSchema, buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";
import { pricingScopeDisclaimer } from "@/lib/pricing/config";

const diySteps = [
  {
    title: "Define your product",
    description:
      "Start with the idea, the users, and the result you want the software to create."
  },
  {
    title: "Neroa scopes the build",
    description:
      "Neroa shapes the build path, trims the MVP, and turns the idea into a structured plan."
  },
  {
    title: "Credits power the work",
    description:
      "Planning, blueprinting, and execution steps consume Engine Credits as the project moves."
  },
  {
    title: "Build over time or accelerate",
    description:
      "Stay inside the monthly plan, add credit packs, or upgrade when the pace needs to change."
  },
  {
    title: "Launch when the scope is ready",
    description:
      "Move from scope to MVP to build and launch without losing context or budget visibility."
  }
] as const;

const engineCreditCards = [
  {
    eyebrow: "Monthly credits",
    title: "Engine Credits reset with your plan",
    description:
      "Each DIY plan includes a monthly Engine Credit pool. That gives the customer predictable guided build capacity without pretending one subscription includes unlimited product delivery."
  },
  {
    eyebrow: "Pacing",
    title: "Build at the speed your budget can support",
    description:
      "If a project needs more credits than a plan includes in one month, Neroa shows the slower monthly path and the faster options clearly before the work overruns budget."
  },
  {
    eyebrow: "Flexibility",
    title: "Accelerate with packs or upgrades when it makes sense",
    description:
      "DIY stays flexible. Customers can add credits for a busy month or move to a higher plan when build rhythm, scope, or urgency increases."
  }
] as const;

const exampleScenarios = [
  {
    eyebrow: "Example scenario",
    title: "Internal dashboard replacement",
    description:
      "A business replacing spreadsheets and manual reporting can start with a lean monthly plan, use credits for scope and build planning, and expand later if reporting, approvals, and integrations grow."
  },
  {
    eyebrow: "Example scenario",
    title: "Customer-facing SaaS MVP",
    description:
      "A founder can scope a subscription product, define the MVP, and build over time instead of needing a full agency budget upfront. Faster launch is possible with credit packs or a higher plan."
  },
  {
    eyebrow: "Example scenario",
    title: "Mobile app with staged rollout",
    description:
      "A team can validate the mobile flow, sequence the build, and push through milestones gradually instead of funding the entire iPhone and Android launch all at once."
  }
] as const;

const diyPowerCards = [
  {
    title: "Access software builds without full agency capital",
    description:
      "DIY makes high-end software more accessible because the customer can start with the budget available now instead of waiting for the full traditional build budget."
  },
  {
    title: "Keep the software inside one guided system",
    description:
      "Idea shaping, MVP planning, budget logic, build steps, and launch guidance stay connected instead of getting scattered across separate chats, docs, and contractor threads."
  },
  {
    title: "Choose between time, credits, and support",
    description:
      "Customers can move slower, accelerate with more credits, upgrade when the work proves itself, or shift into Managed Build when they want execution help."
  }
] as const;

const diyFitCards = [
  {
    title: "Founders testing software ideas",
    description:
      "Best for people who want a real path into SaaS or app building without hiring a full traditional dev team on day one."
  },
  {
    title: "Business owners replacing manual workflows",
    description:
      "Useful for operators who need internal tools, dashboards, CRMs, and process systems but want to stay in control of pacing."
  },
  {
    title: "Non-technical builders and side-project operators",
    description:
      "Strong for users who want guided structure and realistic execution support instead of raw code tools and vague AI chat."
  }
] as const;

const diyFaq = [
  {
    question: "How do monthly Engine Credits work?",
    answer:
      "Each DIY plan includes a monthly Engine Credit pool that powers planning, blueprinting, guided build work, and related execution support inside Neroa."
  },
  {
    question: "What if my project needs more credits than my plan includes?",
    answer:
      "Neroa shows the scoped credit estimate after the project is defined. If the build needs more than one month of credits, the customer can build over time, buy more credits, or move to a higher plan."
  },
  {
    question: "Can I build a SaaS slowly over time?",
    answer:
      "Yes. That is one of the main advantages of the DIY model. A founder can move through scope, MVP, build, and launch over multiple months instead of funding the whole build upfront."
  },
  {
    question: "Can I add credits later?",
    answer:
      "Yes. Credit packs are there for busier months or faster launch pushes when the customer needs more guided build capacity than the current monthly pool includes."
  },
  {
    question: "Can I switch to Managed Build later?",
    answer:
      "Yes. A customer can start in DIY, learn the product, shape the scope, and move into Managed Build later when the project needs more speed, support, or coordination."
  }
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "DIY Build | Build real software at your own pace with Neroa",
  description:
    "Use Neroa DIY Build to scope SaaS, internal software, external apps, and mobile apps with monthly Engine Credits, budget-aware pacing, and guided AI support.",
  path: "/diy-build",
  keywords: [
    "build software on a budget",
    "build SaaS with AI",
    "AI software builder",
    "build software without hiring developers",
    "DIY software build"
  ]
});

export default async function DiyBuildPage() {
  const user = await getOptionalUser();
  const initialAuthenticated = Boolean(user);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        name: "Neroa DIY Build",
        description:
          "Build real software at your own pace using monthly Engine Credits and guided AI execution.",
        path: "/diy-build"
      }),
      buildFaqSchema([...diyFaq])
    ]
  } as const;

  return (
    <MarketingInfoShell
      userEmail={user?.email ?? undefined}
      ctaHref="/start"
      ctaLabel="Start DIY Build"
      brandVariant="prominent"
      contentWidth="wide"
    >
      <JsonLdScript data={schema} />

      <section className="mx-auto max-w-6xl">
        <PublicPageHero
          eyebrow="DIY Build Platform"
          title="Build real software at your own pace."
          summary="Neroa lets users scope and build real software through monthly Engine Credits. Start with the budget you have, move at your own speed, and accelerate later when the project earns it."
          primaryAction={{ href: "/start", label: "Start DIY Build" }}
          secondaryAction={{ href: "/pricing/diy", label: "View Pricing", tone: "secondary" }}
          initialAuthenticated={initialAuthenticated}
          highlights={[
            "Build with your current budget",
            "Monthly Engine Credits reset with the plan",
            "Add credits or upgrade when needed"
          ]}
          panelTitle="Why DIY works"
          panelSummary="DIY is not about pretending software becomes free. It makes real product building accessible through guided pacing, scoped execution, and visible tradeoffs."
          panelItems={[
            "Scope the product before serious execution begins",
            "Build over multiple months when budget is tight",
            "Accelerate with credit packs when launch speed matters"
          ]}
          panelBadge="Budget-aware execution"
          supportingNote="DIY keeps the product inside one guided operating system so the customer sees scope, pace, and tradeoffs before execution gets expensive."
          metrics={[
            { label: "Starting point", value: "Use the monthly credit pool already inside the plan" },
            { label: "Acceleration", value: "Add credit packs only when speed matters more" },
            { label: "Path shift", value: "Move into Managed Build later if the project expands" }
          ]}
        />
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="How DIY works"
          title="A guided product path instead of a vague AI builder promise."
          summary="Neroa moves the work through a structured sequence so the customer can understand what happens next, what it will cost, and how fast the build can move."
        />
        <div className="mt-8">
          <StepGrid
            steps={[...diySteps]}
            guideContext={{ onboardingStep: "public-diy", intentPrefix: "Explore DIY build step" }}
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Engine Credits explained"
          title="Monthly credits define pace, not possibility."
          summary={pricingScopeDisclaimer}
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...engineCreditCards]}
            guideContext={{ onboardingStep: "public-diy", intentPrefix: "Explore DIY pricing logic" }}
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Example build scenarios"
          title="The same kind of product can move at different speeds depending on the budget."
          summary="These are example scenarios, not fake calculator promises. Neroa scopes each project before execution so the customer sees a realistic path."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...exampleScenarios]}
            guideContext={{ onboardingStep: "public-diy", intentPrefix: "Review DIY example scenario" }}
          />
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_0.96fr]">
        <div>
        <SectionHeader
          eyebrow="Why DIY is powerful"
          title="It opens access to software builds that often feel unreachable upfront."
          summary="A founder, operator, or business owner can start with the budget available now, learn the product as it is scoped, and keep moving without waiting for a full traditional build budget."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...diyPowerCards]}
            guideContext={{ onboardingStep: "public-diy", intentPrefix: "Explore DIY advantage" }}
          />
        </div>
      </div>

        <div>
        <SectionHeader
          eyebrow="Best fit"
          title="Who this path is designed for."
          summary="DIY works best when the customer wants control, budget flexibility, and a structured way to build over time."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...diyFitCards]}
            guideContext={{ onboardingStep: "public-diy", intentPrefix: "Check DIY fit" }}
          />
        </div>
      </div>
      </section>

      <section className="mt-16">
        <div className="floating-plane rounded-[38px] p-6 sm:p-8">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Path flexibility
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Start in DIY and move into Managed Build later if the scope changes.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Customers do not have to choose a forever lane on day one. If the project becomes
                more urgent, more complex, or more business-critical, Neroa can move it into a
                managed execution path without restarting the roadmap.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <PublicActionLink
                href={publicLaunchPrimaryCta.href}
                label={publicLaunchPrimaryCta.label}
                className="button-primary"
                initialAuthenticated={initialAuthenticated}
              />
              <PublicActionLink
                href={publicLaunchManagedCta.href}
                label={publicLaunchManagedCta.label}
                className="button-secondary"
                initialAuthenticated={initialAuthenticated}
              />
            </div>
          </div>

          <div className="comparison-band mt-6">
            <div className="comparison-metric">
              <span className="comparison-label">DIY lane</span>
              <span className="comparison-value">
                Shape the product and pace the work with monthly Engine Credits.
              </span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Transition point</span>
              <span className="comparison-value">
                Move when urgency, integrations, or launch pressure justify more support.
              </span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Managed lane</span>
              <span className="comparison-value">
                Add structured execution help, QA visibility, and launch coordination.
              </span>
            </div>
          </div>
        </div>
      </section>

      <FaqSection
        eyebrow="DIY FAQ"
        title="Useful questions before someone starts building with monthly Engine Credits."
        summary="These questions help remove the most common misunderstandings around budget, pacing, and what a DIY software build can realistically do."
        items={diyFaq}
        guideContext={{ onboardingStep: "public-diy", intentPrefix: "Review DIY question" }}
      />
    </MarketingInfoShell>
  );
}
