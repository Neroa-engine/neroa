export type UseCaseFocusPage = {
  useCaseSlug: string;
  detailSlug: string;
  title: string;
  eyebrow: string;
  intro: string;
  whyItMatters: string;
  whatNeroaDoes: string[];
  outputs: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export const useCaseFocusPages: UseCaseFocusPage[] = [
  {
    useCaseSlug: "business-plan-writing-and-research",
    detailSlug: "frame-the-core-business-question",
    title: "Frame the core business question",
    eyebrow: "Business Plan Workflow",
    intro:
      "This step defines the actual business question Neroa should solve first, whether that is the offer, target customer, market entry path, or an operating decision that everything else depends on.",
    whyItMatters:
      "Without a sharp business question, research and writing expand in the wrong direction. Framing the question first keeps the rest of the plan grounded in a decision that matters.",
    whatNeroaDoes: [
      "Neroa interprets the business objective and narrows it into a usable planning question.",
      "Atlas helps test whether the framing is too broad, too vague, or missing the real constraint.",
      "The workspace captures that framing so every later research note and plan section stays aligned."
    ],
    outputs: [
      "A clarified business question or planning objective",
      "A sharper scope for the research and writing that follows",
      "A decision-ready framing statement the team can work from"
    ],
    primaryCtaLabel: "Start with Neroa",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Back to use case",
    secondaryCtaHref: "/use-cases/business-plan-writing-and-research"
  },
  {
    useCaseSlug: "business-plan-writing-and-research",
    detailSlug: "build-the-research-base",
    title: "Build the research base",
    eyebrow: "Business Plan Workflow",
    intro:
      "This step creates the research layer behind the business plan so the writing is supported by better context, better assumptions, and clearer evidence.",
    whyItMatters:
      "Business plans become weak when research sits in scattered notes or never meaningfully connects to the final decisions. A structured research base lets the plan carry more weight.",
    whatNeroaDoes: [
      "Neroa keeps the research tied to the actual business objective instead of turning it into endless exploration.",
      "Atlas synthesizes findings, assumptions, and open questions into something decision-ready.",
      "The workspace preserves continuity so the research directly improves later writing and planning sections."
    ],
    outputs: [
      "Research summaries and assumption checks",
      "A more durable evidence base for the business plan",
      "Clearer open questions and decision points"
    ],
    primaryCtaLabel: "Open research workflow",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Back to use case",
    secondaryCtaHref: "/use-cases/business-plan-writing-and-research"
  },
  {
    useCaseSlug: "business-plan-writing-and-research",
    detailSlug: "drafting-the-plan",
    title: "Drafting the plan",
    eyebrow: "Business Plan Workflow",
    intro:
      "This is the phase where the strategy and research turn into the actual business-plan structure: sections, milestones, assumptions, sequencing, and the written logic behind the project.",
    whyItMatters:
      "A strong plan is not just a document. It is a working operating structure that explains what the business is, why it matters, how it launches, and what happens next.",
    whatNeroaDoes: [
      "Neroa keeps the business plan coherent and moves the writing in the right sequence.",
      "Atlas contributes stronger context where a section needs evidence, comparison, or pressure-testing.",
      "Ops helps keep the document connected to milestones, workflow, and next actions instead of just polished text."
    ],
    outputs: [
      "Business-plan sections and operating milestones",
      "A clearer planning structure for review or stakeholder alignment",
      "Writing that stays tied to execution instead of becoming abstract"
    ],
    primaryCtaLabel: "Build the plan",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Back to use case",
    secondaryCtaHref: "/use-cases/business-plan-writing-and-research"
  },
  {
    useCaseSlug: "business-plan-writing-and-research",
    detailSlug: "writing-outputs",
    title: "Writing outputs",
    eyebrow: "Business Plan Workflow",
    intro:
      "This step turns the planning work into the specific documents the user actually needs, such as memos, briefs, investor-facing summaries, internal updates, and stakeholder writing.",
    whyItMatters:
      "Teams often finish the thinking but still lose time rewriting the same logic into different formats. A writing-output layer makes the plan easier to communicate and use.",
    whatNeroaDoes: [
      "Neroa adapts the same business logic into the right output format for the audience.",
      "The workspace keeps those outputs tied to the same project instead of scattering them into one-off docs.",
      "Users can move from strategy into presentable writing without rebuilding context from scratch."
    ],
    outputs: [
      "Stakeholder-ready summaries and briefs",
      "Internal decision memos or external-facing writing",
      "Consistent messaging across the business-plan flow"
    ],
    primaryCtaLabel: "Create writing outputs",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Back to use case",
    secondaryCtaHref: "/use-cases/business-plan-writing-and-research"
  },
  {
    useCaseSlug: "business-plan-writing-and-research",
    detailSlug: "business-model-clarity",
    title: "Business model clarity",
    eyebrow: "Business Plan Outcome",
    intro:
      "Business model clarity means the plan clearly explains the offer, the customer, the reason the model works, and the operational logic behind it.",
    whyItMatters:
      "If the business model is fuzzy, the research, writing, and milestones all become harder to trust. This is the layer that keeps the plan anchored in a coherent business shape.",
    whatNeroaDoes: [
      "Neroa helps define the offer, customer, and first operating model with less noise.",
      "Atlas strengthens the reasoning behind that model before the plan grows too large.",
      "The workspace keeps later deliverables tied to the same business logic."
    ],
    outputs: [
      "A clearer description of how the business works",
      "Better alignment between offer, customer, and plan sections",
      "Stronger foundational logic for the rest of the workspace"
    ],
    primaryCtaLabel: "Clarify the model",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Back to use case",
    secondaryCtaHref: "/use-cases/business-plan-writing-and-research"
  },
  {
    useCaseSlug: "business-plan-writing-and-research",
    detailSlug: "research-continuity",
    title: "Research continuity",
    eyebrow: "Business Plan Outcome",
    intro:
      "Research continuity means the notes, findings, questions, and assumption checks all stay attached to the same project instead of being lost across separate tools or sessions.",
    whyItMatters:
      "Teams often repeat research because earlier context disappears. Continuity turns research into a compounding asset instead of disposable prep work.",
    whatNeroaDoes: [
      "Neroa keeps the research connected to the current planning question.",
      "Atlas helps synthesize findings instead of letting them pile up unstructured.",
      "The workspace preserves the thread so later writing and decisions inherit the same context."
    ],
    outputs: [
      "Research that compounds across sessions",
      "Fewer repeated context resets",
      "Stronger continuity between findings and final writing"
    ],
    primaryCtaLabel: "Keep research connected",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Back to use case",
    secondaryCtaHref: "/use-cases/business-plan-writing-and-research"
  },
  {
    useCaseSlug: "business-plan-writing-and-research",
    detailSlug: "decision-writing",
    title: "Decision writing",
    eyebrow: "Business Plan Outcome",
    intro:
      "Decision writing is the part of the workflow that translates planning and research into writing that helps a founder, operator, investor, or team actually make a call.",
    whyItMatters:
      "A business plan is most useful when it supports decisions, not just when it reads well. Good decision writing makes the plan actionable.",
    whatNeroaDoes: [
      "Neroa turns the planning thread into memos, briefs, and summaries that support action.",
      "The workspace keeps each document tied to the same evidence base and business logic.",
      "Users can reframe the same material for different audiences without losing continuity."
    ],
    outputs: [
      "Decision memos and executive summaries",
      "Writing designed for alignment, approval, or planning clarity",
      "Stakeholder-ready outputs that stay grounded in the actual work"
    ],
    primaryCtaLabel: "Draft decision writing",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Back to use case",
    secondaryCtaHref: "/use-cases/business-plan-writing-and-research"
  },
  {
    useCaseSlug: "business-plan-writing-and-research",
    detailSlug: "execution-facing-outputs",
    title: "Execution-facing outputs",
    eyebrow: "Business Plan Outcome",
    intro:
      "Execution-facing outputs are the parts of the plan that help the team move beyond thinking and into milestones, operating priorities, and next moves.",
    whyItMatters:
      "A plan should not stop at explanation. It should help the business move into action with clearer milestones, dependencies, and near-term priorities.",
    whatNeroaDoes: [
      "Ops helps surface milestones, sequencing, and practical follow-through.",
      "Neroa keeps those outputs connected to the strategy and business question that shaped them.",
      "The workspace makes it easier to carry the plan into real execution rather than ending with static documents."
    ],
    outputs: [
      "Milestone-ready planning outputs",
      "Execution notes and next-step guidance",
      "A cleaner handoff from business planning into delivery"
    ],
    primaryCtaLabel: "Turn planning into execution",
    primaryCtaHref: "/start",
    secondaryCtaLabel: "Back to use case",
    secondaryCtaHref: "/use-cases/business-plan-writing-and-research"
  }
];

export function getUseCaseFocusPage(useCaseSlug: string, detailSlug: string) {
  return (
    useCaseFocusPages.find(
      (page) => page.useCaseSlug === useCaseSlug && page.detailSlug === detailSlug
    ) ?? null
  );
}

export function getUseCaseFocusStaticParams() {
  return useCaseFocusPages.map((page) => ({
    slug: page.useCaseSlug,
    detailSlug: page.detailSlug
  }));
}
