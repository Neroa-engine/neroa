import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";

const instructionSections = [
  {
    title: "What Neroa is",
    paragraphs: [
      "Neroa is a guided AI build system built around project framing, specialist AI coordination, GitHub-backed execution, and visible delivery structure.",
      "The public site explains the system clearly and routes people directly into the live build flow when they are ready."
    ]
  },
  {
    title: "What Naroa does",
    paragraphs: [
      "Naroa is the orchestration layer. It frames the project, narrows the first useful question, and activates specialist systems only when they make the output stronger.",
      "Naroa also decides when one system should implement, when another should review, and when the next move should stay in planning instead of widening too early.",
      "That is why the public product story starts with Naroa instead of a generic dashboard."
    ]
  },
  {
    title: "How build orchestration works",
    paragraphs: [
      "GitHub is the source-of-truth repository layer. It holds the codebase, branches, commits, pull requests, and deployment-linked history for the Engine.",
      "Codex is the specialist build agent for implementation work such as repo edits, bug fixes, tests, and PR-style execution. Anthropic or Claude is the specialist review agent for architecture review, requirements critique, UX critique, and second-pass code review.",
      "The normal loop is build pass, review pass, fix pass, then Naroa summary so the user sees what changed, what was reviewed, what still needs testing, and what should happen next."
    ]
  },
  {
    title: "How connected services fit in",
    paragraphs: [
      "Neroa treats connected services as part of the build model, not an afterthought. GitHub, Supabase, Vercel, Stripe, domain and DNS providers, SMTP, Expo, Apple Developer, and Google Play Console all have a defined role when the Engine needs them.",
      "That makes Neroa feel like a build command center instead of one generic assistant with disconnected outputs."
    ]
  },
  {
    title: "How the public site is structured",
    paragraphs: [
      "The public site is organized around a few clear paths: homepage, pricing, how it works, Naroa and AI system pages, selected use cases, blog, support, and contact.",
      "Each page is meant to help a visitor understand the system, choose the right build path, and move into the product without confusion."
    ]
  },
  {
    title: "How the live product flow works",
    paragraphs: [
      "Start on the homepage or use-case pages to choose the kind of product you want to build.",
      "From there, move into the Naroa-led intake and create an engine that carries the right lanes, AI stack, connected-service setup, and next-step structure."
    ]
  },
  {
    title: "How pricing works",
    paragraphs: [
      "Pricing explains active engine limits, monthly Engine Credits, workflow access, add-on credit packs, and the upgrade path from validation work into build-heavy execution.",
      "The plans are intentionally designed to show real capacity, and usage notifications warn customers at 75% and 100% of their included monthly Engine Credits."
    ]
  },
  {
    title: "How to get started and get support",
    paragraphs: [
      "Use Start your build when you are ready to move into the working product flow, or use Contact if you need help before you start.",
      "Use Support for guidance, Contact for direct questions, and the site guide chat for quick help while browsing."
    ]
  }
];

export default function InstructionsPage() {
  return (
    <MarketingInfoShell ctaHref="/support" ctaLabel="Get support" brandVariant="prominent">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
            Instructions
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem] xl:leading-[0.96]">
            How to use the Neroa public site and move into the live build flow cleanly.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-600">
            This page is the practical walkthrough for the live product: what Neroa is, how Naroa fits in, which pages to use first, how pricing works, and where to go when you need help.
          </p>
        </div>
      </section>

      <section className="mt-16 grid gap-6">
        {instructionSections.map((section, index) => (
          <div key={section.title} className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative grid gap-6 lg:grid-cols-[140px_1fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Step 0{index + 1}
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                  {section.title}
                </h2>
                <div className="mt-5 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-slate-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Read pricing",
            description: "See how plans expand by Engine Credits, active planning engines, build projects, and deeper execution support.",
            href: "/pricing/diy"
          },
          {
            title: "Start your build",
            description: "Move into the Naroa-led intake and create your first engine.",
            href: "/start"
          },
          {
            title: "Get support",
            description: "Use support or contact if you want help deciding what to do next.",
            href: "/support"
          }
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="micro-glow floating-plane rounded-[28px] p-5"
          >
            <div className="floating-wash rounded-[28px]" />
            <div className="relative">
              <p className="text-xl font-semibold tracking-tight text-slate-950">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </div>
          </Link>
        ))}
      </section>
    </MarketingInfoShell>
  );
}
