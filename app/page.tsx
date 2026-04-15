import type { Metadata } from "next";
import Link from "next/link";
import AgentAvatar from "@/components/ai/AgentAvatar";
import {
  FaqSection,
  InfoCardGrid,
  StepGrid
} from "@/components/marketing/public-page-sections";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { NaroaHomepageGuide } from "@/components/naroa-guide/NaroaHomepageGuide";
import { AGENTS, type AgentId } from "@/lib/ai/agents";

export const dynamic = "force-static";

export const metadata: Metadata = {
  metadataBase: new URL("https://neroa.io"),
  title: "Neroa | Build real software with AI, on your budget or with managed execution",
  description:
    "Neroa is an AI-powered product build system for SaaS, internal software, external apps, and mobile apps. Build through DIY Engine Credits or move into managed build execution with staged approvals.",
  keywords: [
    "build SaaS with AI",
    "build software without hiring developers",
    "AI app builder",
    "build internal tools with AI",
    "guided AI software builder",
    "build apps on a budget",
    "managed software build service",
    "AI-powered product development"
  ],
  alternates: {
    canonical: "https://neroa.io/"
  },
  openGraph: {
    title: "Build real software with AI, on your budget or with managed execution",
    description:
      "Move from idea to scope, MVP, budget, build, and launch with Neroa's guided AI build system. Choose DIY Engine Credits or managed build execution.",
    url: "https://neroa.io/",
    siteName: "Neroa",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Neroa | Build real software with AI",
    description:
      "DIY build with monthly Engine Credits or move into managed build execution with guided approvals."
  },
  robots: {
    index: true,
    follow: true
  }
};

const heroPathCards = [
  {
    label: "DIY Build",
    summary: "Build at your own pace with monthly Engine Credits and budget-aware execution.",
    points: [
      "Start with your budget",
      "Build over time",
      "Accelerate with more credits"
    ],
    href: "/start",
    ctaLabel: "Start DIY Build"
  },
  {
    label: "We Build It For You",
    summary: "Use managed execution with staged approvals, guided visibility, and structured checkpoints.",
    points: [
      "Phased checkpoint approvals",
      "Guided visibility",
      "Launch support"
    ],
    href: "/managed-build",
    ctaLabel: "Explore Managed Build"
  }
] as const;

const whyNeroaPoints = [
  {
    title: "Guided from idea to launch",
    description:
      "Neroa moves the work through scope, MVP, budget, build, and launch instead of leaving the customer with disconnected notes and prompts."
  },
  {
    title: "Build real software without hiring a traditional dev team",
    description:
      "The system is designed for founders and operators who want structured execution without immediately assembling a full freelance or agency stack."
  },
  {
    title: "One product path for DIY and managed execution",
    description:
      "Customers can self-drive inside monthly Engine Credits, then move into managed build support later if the scope or urgency changes."
  }
] as const;

const diyAdvantagePoints = [
  {
    title: "Monthly Engine Credits",
    description:
      "DIY plans include monthly Engine Credits that reset with the plan, so you can keep planning and guided execution inside a predictable credit pool."
  },
  {
    title: "Scoped build pace",
    description:
      "Build speed depends on scope and available credits. Neroa shows the pace clearly instead of implying that one subscription includes unlimited full-build labor."
  },
  {
    title: "Hard caps with options",
    description:
      "You stay in control of budget because users do not exceed monthly caps unless they intentionally buy credit packs or upgrade."
  }
] as const;

const exampleScenarioOptions = [
  {
    title: "Build over time",
    description:
      "Use the monthly credits already included in the plan and move through the work at a controlled pace."
  },
  {
    title: "Accelerate with credits",
    description:
      "Buy credit packs when launch urgency matters more than slow budget pacing."
  },
  {
    title: "Move into managed support",
    description:
      "Switch into the managed path if the scope becomes more business-critical or coordination-heavy."
  }
] as const;

const managedBuildBullets = [
  "Done-with-you or done-for-you execution",
  "QA and launch support",
  "Deployment coordination",
  "Monthly management after launch",
  "Scope-based quote before work begins"
] as const;

const managedCheckpoints = [
  {
    title: "Scope checkpoint",
    description:
      "Neroa frames scope, system structure, and approval gates before serious build work begins."
  },
  {
    title: "Build checkpoint",
    description:
      "Structured portions of the build are completed, reviewed, and approved before the project advances."
  },
  {
    title: "Launch checkpoint",
    description:
      "QA, deployment, and release work stay visible so the customer understands what is shipping and why."
  }
] as const;

const buildCategories = [
  {
    title: "SaaS",
    description:
      "Build subscription software, dashboards, portals, AI tools, and digital products with a guided MVP-to-launch workflow.",
    href: "/use-cases/saas"
  },
  {
    title: "Internal Software",
    description:
      "Create CRMs, admin dashboards, workflow systems, reporting portals, operations tools, and custom internal platforms.",
    href: "/use-cases/internal-software"
  },
  {
    title: "External Apps",
    description:
      "Plan and build customer-facing websites, portals, booking systems, and branded digital products.",
    href: "/use-cases/external-apps"
  },
  {
    title: "Mobile Apps",
    description:
      "Plan iPhone apps, Android apps, and cross-platform mobile MVPs with a guided path through scope, budget, build, testing, and launch.",
    href: "/use-cases/mobile-apps"
  }
] as const;

const guidedPath = [
  {
    label: "Strategy",
    description: "Define the problem, audience, and product direction.",
    href: "/system/naroa"
  },
  {
    label: "Scope",
    description: "Clarify what belongs in the project and what does not.",
    href: "/use-cases"
  },
  {
    label: "MVP",
    description: "Reduce the concept to the smallest valuable version worth testing.",
    href: "/use-cases/saas"
  },
  {
    label: "Budget",
    description: "Understand cost, stack, timing, and what to avoid overspending on.",
    href: "/use-cases/saas"
  },
  {
    label: "Test",
    description: "Validate demand, workflow, and market response before scaling build effort.",
    href: "/use-cases/external-apps"
  },
  {
    label: "Build",
    description: "Activate the right specialist systems to move into structured execution.",
    href: "/system/ai"
  },
  {
    label: "Launch",
    description: "Prepare the go-live path, user flow, and release steps.",
    href: "/use-cases/external-apps"
  },
  {
    label: "Operate",
    description: "Manage improvements, iterations, and next-stage execution.",
    href: "/use-cases/internal-software"
  }
] as const;

const specialistCards: Array<{
  id: Exclude<AgentId, "narua">;
  summary: string;
}> = [
  {
    id: "forge",
    summary: "Shapes the build structure, technical plan, and execution sequence."
  },
  {
    id: "atlas",
    summary: "Strengthens strategy, validation thinking, and product decision quality."
  },
  {
    id: "repolink",
    summary: "Connects repositories, systems, and implementation context when the build widens."
  },
  {
    id: "nova",
    summary: "Shapes design direction, UX copy, brand presentation, and customer-facing assets."
  },
  {
    id: "pulse",
    summary: "Handles testing, QA, usage signals, performance checks, and feedback loops."
  },
  {
    id: "ops",
    summary: "Keeps deployment, connected services, launch operations, and support workflows structured."
  }
];

const trustPoints = [
  {
    title: "Budget-aware planning",
    description: "Budget-aware planning before execution accelerates."
  },
  {
    title: "Structured scope",
    description: "Structured scope before serious build effort starts."
  },
  {
    title: "Phased visibility",
    description: "Phased visibility instead of black-box delivery."
  },
  {
    title: "DIY to managed path",
    description: "A clean path from DIY build into managed support."
  },
  {
    title: "Educational transparency",
    description: "Customers learn the product while it is being built."
  }
] as const;

const faqItems = [
  {
    question: "Can I build SaaS, internal tools, and mobile apps with Neroa?",
    answer:
      "Yes. Neroa supports SaaS products, internal software, external apps, and mobile apps through the same guided path from idea to scope, MVP, budget, build, and launch."
  },
  {
    question: "Does a monthly plan include unlimited software development?",
    answer:
      "No. Neroa subscriptions provide access, guidance, and a monthly Engine Credit pool. The actual amount of build execution you can complete depends on scope, complexity, and available credits."
  },
  {
    question: "What is the difference between DIY Build and Managed Build?",
    answer:
      "DIY Build lets you move at your own pace inside monthly Engine Credits. Managed Build adds staged execution support, QA visibility, deployment coordination, and a scope-based quote when you want Neroa to help carry the work."
  },
  {
    question: "Can I start in DIY and switch into Managed Build later?",
    answer:
      "Yes. A customer can begin in the DIY path, learn the product, tighten scope, and move into Managed Build later if speed, complexity, or launch pressure changes."
  }
] as const;

const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Neroa",
      url: "https://neroa.io",
      description:
        "Neroa is an AI-powered product build system for SaaS, internal software, external apps, and mobile apps."
    },
    {
      "@type": "SoftwareApplication",
      name: "Neroa",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://neroa.io",
      description:
        "Build real software with guided AI through DIY Engine Credits or managed build execution.",
      offers: {
        "@type": "Offer",
        name: "Neroa DIY Build Platform",
        url: "https://neroa.io/pricing/diy",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock"
      }
    },
    {
      "@type": "Service",
      name: "Neroa Managed Build Services",
      serviceType: "Managed software build service",
      provider: {
        "@type": "Organization",
        name: "Neroa"
      },
      url: "https://neroa.io/managed-build",
      description:
        "Managed software build execution with staged approvals, QA support, deployment coordination, and monthly management."
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    }
  ]
} as const;

export default function LandingPage() {
  return (
    <MarketingInfoShell
      ctaHref="/start"
      ctaLabel="Start DIY Build"
      brandVariant="prominent"
      contentWidth="wide"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />

      <section
        aria-labelledby="hero-heading"
        data-naroa-guide-section="what-neroa-is"
        className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center"
      >
        <div className="max-w-3xl">
          <span className="premium-pill border-cyan-300/18 bg-cyan-300/12 text-cyan-700">
            AI-powered product build system
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Guided software execution from idea to launch
          </p>
          <h1
            id="hero-heading"
            className="mt-5 text-5xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl xl:text-[5.7rem] xl:leading-[0.9]"
          >
            Build real software with AI, on your budget or with managed execution.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600 sm:text-xl">
            Neroa helps users move from idea to structured plan to MVP to launch across SaaS,
            internal software, external apps, and mobile apps with a guided system powered by
            Naroa and specialist AI support.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/start" className="button-primary" prefetch>
              Start DIY Build
            </Link>
            <Link href="/example-build" className="button-secondary">
              See an Example Build
            </Link>
            <Link href="/managed-build" className="button-secondary">
              Explore Managed Build
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-cyan-700">
            <Link href="/pricing/diy" className="hover:text-slate-950">
              See how pricing works
            </Link>
            <Link href="/example-build" className="hover:text-slate-950">
              See an Example Build
            </Link>
            <a href="#guided-build-path" className="hover:text-slate-950">
              See build paths
            </a>
          </div>
        </div>

        <div
          role="img"
          aria-label="AI-guided build system showing the path from idea to launch across DIY Build and Managed Build."
          className="floating-plane relative overflow-hidden rounded-[40px] p-6 sm:p-8"
        >
          <div className="floating-wash rounded-[40px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(96,165,250,0.18),transparent_32%),radial-gradient(circle_at_72%_78%,rgba(139,92,246,0.2),transparent_34%)]" />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/70 bg-white/78 px-4 py-2 text-sm font-medium text-slate-700">
                <AgentAvatar id="narua" active size={28} showLabel={false} />
                <span>Naroa orchestrator active</span>
              </div>
              <span className="rounded-full border border-slate-200/70 bg-white/74 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Idea -&gt; MVP -&gt; Launch
              </span>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[28px] border border-slate-200/70 bg-white/82 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Guided sequence
                </p>
                <div className="mt-4 grid gap-3">
                  {guidedPath.slice(0, 6).map((step, index) => (
                    <div key={step.label} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-xs font-semibold text-cyan-700">
                        0{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{step.label}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4" data-naroa-guide-section="diy-vs-managed">
                <InfoCardGrid
                  items={heroPathCards.map((card) => ({
                    eyebrow: card.label,
                    title: card.summary,
                    description:
                      card.label === "DIY Build"
                        ? "Use the guided build lane when you want budget control, monthly pacing, and the option to accelerate later."
                        : "Use the managed lane when the product needs more coordination, staged approvals, and closer execution support.",
                    details: [...card.points],
                    href: card.href,
                    ctaLabel: card.ctaLabel
                  }))}
                  columns="one"
                  guideContext={{ onboardingStep: "public-home", intentPrefix: "Compare homepage build path" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="why-neroa-heading" className="mt-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
            Why Neroa
          </p>
          <h2 id="why-neroa-heading" className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Structured AI execution instead of disconnected prompts, freelancers, and guesswork.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Neroa is built for people who want real software outcomes without juggling a traditional
            dev team, fragmented tools, or endless prompt loops that stop before execution.
          </p>
        </div>

        <InfoCardGrid
          items={[...whyNeroaPoints]}
          guideContext={{ onboardingStep: "public-home", intentPrefix: "Explore why Neroa" }}
        />
      </section>

      <section
        id="diy-build"
        aria-labelledby="diy-heading"
        data-naroa-guide-section="budget-engine-credits"
        className="mt-20"
      >
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
            DIY advantage
          </p>
          <h2 id="diy-heading" className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Build at your own pace with monthly Engine Credits.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Neroa keeps DIY pricing legible: credits reset monthly based on the plan, build speed
            depends on scope and available credits, and users stay inside hard monthly caps unless
            they intentionally buy more capacity or upgrade. This gives founders and operators a
            path to build real software without hiring a traditional dev team on day one.
          </p>
        </div>

        <InfoCardGrid
          items={[...diyAdvantagePoints]}
          guideContext={{ onboardingStep: "public-home", intentPrefix: "Explore DIY advantage" }}
        />

        <div className="mt-6 rounded-[30px] border border-cyan-200/70 bg-[linear-gradient(135deg,rgba(240,249,255,0.94),rgba(255,255,255,0.84))] px-6 py-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Example build scenario
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                The financial unlock is pace control, not magic unlimited labor.
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-700">
                A traditional custom build might require a $30,000 to $40,000 upfront budget
                before meaningful software ships. Neroa scopes execution first, shows the Engine
                Credit estimate, and lets the customer decide whether to build over time, add
                credits, or move into managed execution.
              </p>
              <p className="mt-4 text-base leading-8 text-slate-700">
                If a plan includes 2,500 Engine Credits per month and the scoped project requires
                40,000 credits, Neroa can show that the work may take roughly 16 months using only
                monthly credits, or less time with credit packs, plan changes, or managed support.
              </p>
              <div className="mt-6">
                <Link href="/example-build" className="button-secondary">
                  See an Example Build
                </Link>
              </div>
            </div>

            <InfoCardGrid
              items={[...exampleScenarioOptions]}
              columns="one"
              guideContext={{ onboardingStep: "public-home", intentPrefix: "Review homepage pacing option" }}
            />
          </div>
        </div>
      </section>

      <section id="managed-build-summary" aria-labelledby="managed-heading" className="mt-20">
        <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
          <div className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
                We Build It For You
              </p>
              <h2 id="managed-heading" className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Want Neroa to build it for you?
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                If you prefer not to manage the build yourself, Neroa can help scope, execute, QA,
                deploy, and manage the project through a separate managed build package.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/managed-build" className="button-primary">
                  Explore Managed Build Services
                </Link>
                <Link href="/pricing/managed" className="button-secondary">
                  View Managed Pricing
                </Link>
              </div>
            </div>
          </div>

          <StepGrid
            steps={managedCheckpoints.map((item, index) => ({
              title: item.title,
              description: item.description,
              eyebrow: `Phase 0${index + 1}`
            }))}
            guideContext={{ onboardingStep: "public-home", intentPrefix: "Review managed checkpoint" }}
          />
        </div>

        <div className="mt-6 floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-start">
            <div>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Managed build is designed to feel transparent instead of mysterious. The customer
                reviews staged checkpoints, learns what is being built, and keeps visibility while
                the project advances in structured increments.
              </p>
            </div>

            <div className="rounded-[26px] border border-slate-200/70 bg-white/80 px-5 py-5">
              <p className="text-sm font-semibold text-slate-950">Managed build includes</p>
              <div className="mt-4 grid gap-3">
                {managedBuildBullets.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-cyan-500" />
                    <p className="text-sm leading-7 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[30px] border border-slate-200/70 bg-white/82 px-6 py-6 sm:px-8">
          <p className="text-base leading-8 text-slate-700">
            Start DIY and switch later. If you begin in DIY and get stuck, Neroa can review your
            scope and move the project into a managed build path.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="categories-heading"
        data-naroa-guide-section="build-categories"
        className="mt-20"
      >
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
            Build categories
          </p>
          <h2 id="categories-heading" className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            One system for the kinds of software people actually need to launch.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Neroa supports the build categories most often blocked by budget, unclear scope, or
            disconnected execution.
          </p>
        </div>

        <InfoCardGrid
          items={buildCategories.map((category) => ({
            eyebrow: "Build category",
            title: category.title,
            description: category.description,
            href: category.href,
            ctaLabel: `Explore ${category.title}`
          }))}
          columns="four"
          guideContext={{ onboardingStep: "public-home", intentPrefix: "Explore build category" }}
        />
      </section>

      <section
        id="guided-build-path"
        aria-labelledby="guided-path-heading"
        data-naroa-guide-section="guided-build-path"
        className="mt-20"
      >
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
            Guided path
          </p>
          <h2 id="guided-path-heading" className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            The product begins guiding execution before signup, not after confusion has already started.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            The sequence below is one of Neroa's strongest differentiators: a practical,
            budget-aware path from concept to launched software.
          </p>
        </div>

        <StepGrid
          steps={guidedPath.map((step, index) => ({
            title: step.label,
            description: step.description,
            eyebrow: `0${index + 1}`,
            href: step.href,
            ctaLabel: "Open step"
          }))}
          guideContext={{ onboardingStep: "public-home", intentPrefix: "Explore guided build path" }}
        />
      </section>

      <section aria-labelledby="ai-systems-heading" className="mt-20">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <div className="flex items-center gap-5">
                <AgentAvatar id="narua" active size={120} showLabel={false} />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    AI orchestration
                  </p>
                  <h2 id="ai-systems-heading" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                    Naroa orchestrates the build. Specialist systems appear only when the work needs them.
                  </h2>
                </div>
              </div>

              <p className="mt-6 text-base leading-8 text-slate-600">
                Public visitors do not need lore. The simple truth is that Naroa frames the work,
                keeps the product aligned, and brings in strategy, build, testing, design, repo,
                and operations support when the system needs more than one intelligence layer.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/system/naroa" className="button-primary">
                  Explore Naroa
                </Link>
                <Link href="/system/ai" className="button-secondary">
                  Explore AI systems
                </Link>
              </div>
            </div>
          </div>

          <InfoCardGrid
            items={specialistCards.map((agent) => ({
              eyebrow: "Specialist system",
              title: AGENTS[agent.id].name,
              description: agent.summary,
              href: `/system/${agent.id}`,
              ctaLabel: `Explore ${AGENTS[agent.id].name}`
            }))}
            columns="three"
            guideContext={{ onboardingStep: "public-home", intentPrefix: "Explore specialist system" }}
          />
        </div>
      </section>

      <section
        aria-labelledby="trust-heading"
        data-naroa-guide-section="proof-trust"
        className="mt-20"
      >
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
            Built for real execution
          </p>
          <h2 id="trust-heading" className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Built for real-world execution, not just ideas.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Neroa is designed to make software building more understandable, more budget-aware,
            and less opaque from the first decision onward.
          </p>
        </div>

        <InfoCardGrid
          items={[...trustPoints]}
          columns="four"
          guideContext={{ onboardingStep: "public-home", intentPrefix: "Review trust signal" }}
        />
      </section>

      <FaqSection
        eyebrow="FAQ"
        title="Common questions before someone starts building with Neroa."
        summary="These are the questions most often asked by founders, operators, and teams comparing AI-guided software building against agencies, freelancers, and disconnected AI tools."
        items={faqItems}
        guideContext={{ onboardingStep: "public-home", intentPrefix: "Review homepage question" }}
      />

      <section data-naroa-guide-section="final-decision" className="mt-20 pb-4">
        <div className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Start building
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Choose the path that matches your budget, scope, and urgency.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Start DIY if you want guided structure and budget control. Explore Managed Build if
                you want Neroa to help execute, QA, deploy, and manage the software with phased visibility.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/start" className="button-primary" prefetch>
                Start DIY Build
              </Link>
              <Link href="/managed-build" className="button-secondary">
                Explore Managed Build Services
              </Link>
              <Link href="/pricing" className="button-secondary">
                Understand Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <NaroaHomepageGuide />
    </MarketingInfoShell>
  );
}
