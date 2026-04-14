import Link from "next/link";
import AgentAvatar from "@/components/ai/AgentAvatar";
import NaruaCore from "@/components/ai/NaruaCore";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { AGENTS, type AgentId } from "@/lib/ai/agents";

export const dynamic = "force-static";

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
    href: "/system/narua"
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

export default function LandingPage() {
  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start your build" brandVariant="prominent">
      <section className="grid gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
        <div className="max-w-3xl">
          <span className="premium-pill border-cyan-300/18 bg-cyan-300/12 text-cyan-700">
            Coordinated AI build system
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Most AI tools just talk. Neroa helps you build.
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl xl:text-[5.5rem] xl:leading-[0.92]">
            Build SaaS, internal software, external apps, and mobile apps with coordinated AI.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600 sm:text-xl">
            Neroa helps you move from idea to MVP, budget, validation, build, and launch using a guided system powered by Naroa and specialized AI support.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/start" className="button-primary">
              Start your build
            </Link>
            <Link href="/use-cases" className="button-secondary">
              Explore use cases
            </Link>
          </div>
        </div>

        <NaruaCore
          href="/system/narua"
          ctaLabel="Explore Naroa"
          description="Naroa is Neroa's core orchestrator. It frames the Engine, guides the workflow, and brings in specialist systems for strategy, architecture, build execution, GitHub coordination, design, testing, launch, and operations only when the work requires it."
          supportingAgentIds={["forge", "atlas", "repolink", "nova", "pulse", "ops"]}
          className="mx-auto w-full max-w-[660px]"
        />
      </section>

      <section className="mt-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
            Build categories
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Choose the kind of product you want to build.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Neroa is built around clear build paths so the system can shape the right MVP, budget, stack, and execution plan from the beginning.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {buildCategories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="micro-glow floating-plane rounded-[30px] p-6"
            >
              <div className="floating-wash rounded-[30px]" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                  Build category
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  {category.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{category.description}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-700">
                  Explore {category.title}
                  <span aria-hidden="true">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
            Guided path
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            One build path from direction to execution
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            The system is designed to keep the project moving in a clean sequence instead of fragmenting across disconnected chats, notes, and tools.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {guidedPath.map((step, index) => (
            <Link
              key={step.label}
              href={step.href}
              className="micro-glow floating-plane rounded-[28px] p-5"
            >
              <div className="floating-wash rounded-[28px]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-cyan-300/22 bg-cyan-300/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                    0{index + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-400">Open</span>
                </div>
                <p className="mt-4 text-xl font-semibold text-slate-950">{step.label}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <div className="flex items-center gap-5">
                <AgentAvatar id="narua" active size={120} showLabel={false} />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    Core orchestrator
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                    Naroa coordinates the system. Specialist AI expands execution only when needed.
                  </h2>
                </div>
              </div>

              <p className="mt-6 text-base leading-8 text-slate-600">
                Naroa is Neroa's core orchestrator. It frames the Engine, guides the workflow, and brings in specialist systems for strategy, architecture, build execution, GitHub coordination, design, testing, launch, and operations only when the work requires it.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/system/narua" className="button-primary">
                  Explore Naroa
                </Link>
                <Link href="/system/ai" className="button-secondary">
                  Explore AI systems
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {specialistCards.map((agent) => (
              <Link
                key={agent.id}
                href={`/system/${agent.id}`}
                className="micro-glow floating-plane rounded-[28px] p-5"
              >
                <div className="floating-wash rounded-[28px]" />
                <div className="relative">
                  <AgentAvatar id={agent.id} active size={88} showLabel={false} />
                  <p className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                    {AGENTS[agent.id].name}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{agent.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-20 pb-4">
        <div className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Final CTA
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Start with the right build path.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Choose what you want to build and let Neroa generate a structured next step.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/start" className="button-primary">
                Start your build
              </Link>
              <Link href="/use-cases" className="button-secondary">
                Explore use cases
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
