import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/marketing/seo-landing-template";
import { buildFaqSchema, buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";

const faqItems = [
  {
    question: "Can Neroa help build internal tools with AI?",
    answer:
      "Yes. Neroa is well suited for internal dashboards, CRMs, workflow tools, admin systems, reporting portals, and operations software."
  },
  {
    question: "Why use Neroa instead of piecing together forms and spreadsheets?",
    answer:
      "Because Neroa helps turn the workflow into a real scoped product path with roles, modules, budget logic, and an execution plan instead of more patchwork."
  },
  {
    question: "Can internal software be built gradually?",
    answer:
      "Yes. A business can start by scoping the most valuable internal workflow, then build over time inside monthly Engine Credits or move into Managed Build later."
  },
  {
    question: "Is this only for technical teams?",
    answer:
      "No. Neroa is designed for operators, business owners, and non-technical teams who need internal software but want a clearer route into building it."
  }
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "Build internal tools with AI | Internal software planning with Neroa",
  description:
    "Use Neroa to build internal tools with AI through guided workflow mapping, scope definition, budget planning, and structured execution for dashboards, CRMs, and operations systems.",
  path: "/build-internal-tools-with-ai",
  keywords: [
    "build internal tools with AI",
    "AI internal software builder",
    "build dashboards with AI",
    "AI workflow software planning"
  ]
});

export default function BuildInternalToolsWithAiPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        name: "Build internal tools with AI",
        description:
          "Guided internal software planning and execution for dashboards, CRMs, and workflow tools.",
        path: "/build-internal-tools-with-ai"
      }),
      buildFaqSchema([...faqItems])
    ]
  } as const;

  return (
    <SeoLandingTemplate
      schema={schema}
      hero={{
        eyebrow: "Build internal tools with AI",
        title: "Turn messy internal workflows into structured internal software.",
        summary:
          "Neroa helps businesses move from spreadsheets, disconnected forms, and manual work into scoped internal systems with a clearer path through workflow mapping, build planning, and rollout.",
    primaryAction: { href: "/start", label: "Start a conversation" },
        secondaryAction: {
          href: "/use-cases/internal-software",
          label: "Explore Internal Software",
          tone: "secondary"
        },
        highlights: [
          "Dashboards and CRMs",
          "Workflow-first planning",
          "DIY pace or managed support"
        ],
        panelTitle: "Common internal-tool outcomes",
        panelSummary:
          "This route is designed to help businesses replace manual work with clearer internal systems that people can actually use.",
        panelItems: [
          "Map the workflow and user roles first",
          "Turn the flow into a scoped internal system",
          "Choose DIY or managed execution based on speed and budget"
        ]
      }}
      coreSection={{
        eyebrow: "Why it works",
        title: "Neroa starts with the internal workflow instead of jumping straight to features.",
        summary:
          "That matters because internal software succeeds when the roles, approvals, reporting needs, and operational steps are clear before the build grows complicated.",
        cards: [
          {
            title: "Map the real operational bottleneck",
            description:
              "Neroa helps identify which workflow is worth solving first so the build is tied to measurable operational value."
          },
          {
            title: "Scope roles, approvals, dashboards, and reporting",
            description:
              "The system brings structure to user permissions, admin logic, reports, and workflow steps before technical build work expands."
          },
          {
            title: "Roll out at a pace the business can support",
            description:
              "Customers can move slowly in DIY or request managed execution when the internal system needs more delivery help."
          }
        ]
      }}
      fitSection={{
        eyebrow: "Best fit",
        title: "Who this route is built for.",
        summary:
          "This page is strongest for business operators and teams that know internal software could unlock time, clarity, or scale but need a cleaner path into building it.",
        cards: [
          {
            title: "Service businesses replacing admin overhead",
            description:
              "Useful when the business wants dashboards, approvals, reporting, or operational visibility instead of more manual coordination."
          },
          {
            title: "Growing teams needing better internal systems",
            description:
              "A strong path for CRMs, task systems, quoting tools, dispatch systems, and internal management software."
          },
          {
            title: "Operators who want to learn before scaling support",
            description:
              "Neroa lets the business start with a guided DIY path and move into Managed Build when the internal software becomes more important or complex."
          }
        ]
      }}
      faqSection={{
        eyebrow: "Internal software FAQ",
        title: "Questions businesses ask before building internal tools with AI.",
        summary:
          "These answers explain how Neroa helps move internal systems from workflow idea to structured software path.",
        items: [...faqItems]
      }}
      finalCta={{
        eyebrow: "Next step",
        title: "Start with the workflow you most want to replace, clarify, or scale.",
        summary:
          "Use Neroa when you want internal software that is shaped around real operations instead of generic feature sprawl.",
        actions: [
          { href: "/start", label: "Start a conversation" },
          { href: "/start", label: "Start Managed Build", tone: "secondary" }
        ]
      }}
    />
  );
}
