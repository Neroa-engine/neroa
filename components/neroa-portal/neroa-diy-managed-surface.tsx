"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";
import { NeroaPublicNavigation } from "@/components/neroa-portal/neroa-public-navigation";

type Concept = {
  id: string;
  label: string;
  explanation: string;
};

type ConceptSection = {
  title: string;
  eyebrow: string;
  points?: readonly string[];
  concepts: readonly Concept[];
};

const sharedFoundationConcepts: readonly Concept[] = [
  {
    id: "shared-roadmap-first-planning",
    label: "Roadmap-first planning",
    explanation:
      "Roadmap-first planning means the project is organized before code starts. Neroa helps define the end goal, user flow, required features, build phases, and decision points so the work has a clear sequence instead of becoming a pile of disconnected prompts."
  },
  {
    id: "shared-scope-before-execution",
    label: "Scope before execution",
    explanation:
      "Scope before execution means Neroa defines what should be built, what should wait, and what would create unnecessary rebuild risk before work begins. This helps protect credits, reduce rework, and keep the project moving through approved steps instead of uncontrolled changes."
  },
  {
    id: "shared-approvals-at-checkpoints",
    label: "Approvals at checkpoints",
    explanation:
      "Approvals at checkpoints mean important decisions are reviewed before the next build step continues. Instead of letting execution run ahead blindly, Neroa uses approval moments for roadmap, scope, design direction, feature changes, and build readiness."
  },
  {
    id: "shared-evidence-and-review",
    label: "Evidence and review across the build path",
    explanation:
      "Evidence and review means progress should be tied to visible proof: screenshots, summaries, completed tasks, test results, or review notes. This gives the customer a way to understand what changed, what passed, what needs revision, and what should happen next."
  }
];

const buildPaths: readonly ConceptSection[] = [
  {
    title: "DIY Build",
    eyebrow: "Best for",
    points: [
      "founders who want control",
      "builders who want guided structure",
      "teams comfortable reviewing and approving work",
      "lower monthly cost with governed Build Credits"
    ],
    concepts: [
      {
        id: "diy-roadmap-first-planning",
        label: "Roadmap-first planning",
        explanation:
          "In DIY Build, roadmap-first planning gives the customer a structured build path they can follow. Neroa helps organize the idea into phases and tasks so the customer is not guessing what to build next or spending credits on scattered changes."
      },
      {
        id: "diy-scoped-tasks",
        label: "Scoped tasks",
        explanation:
          "Scoped tasks are specific, bounded pieces of work that can be reviewed and approved. Instead of saying 'build the whole app,' Neroa breaks the project into clear tasks with expected outcomes, limits, and acceptance criteria."
      },
      {
        id: "diy-credit-governed-execution",
        label: "Credit-governed execution",
        explanation:
          "Credit-governed execution means build work is controlled by the credits available and the value of the approved task. Credits are not unlimited AI usage; they are a way to govern forward progress, prevent runaway rebuilds, and keep work aligned to the roadmap."
      },
      {
        id: "diy-review-and-approval-checkpoints",
        label: "Review and approval checkpoints",
        explanation:
          "In DIY Build, review and approval checkpoints give the customer control. The customer can inspect progress, approve the next step, request revisions, or pause before spending more credits on additional work."
      },
      {
        id: "diy-project-workspace",
        label: "Project workspace",
        explanation:
          "The project workspace is where the roadmap, scope, tasks, decisions, and review items come together. It gives the customer one organized place to understand where the project stands and what needs to happen next."
      }
    ]
  },
  {
    title: "Managed Build",
    eyebrow: "Best for",
    points: [
      "founders who want Neroa to handle more execution",
      "businesses that need speed and direction",
      "nontechnical users who want a guided done-with-you/done-for-you path",
      "projects needing heavier review, setup, and delivery support"
    ],
    concepts: [
      {
        id: "managed-credit-packages",
        label: "Managed credit packages",
        explanation:
          "Managed credit packages are used for builds where Neroa carries more of the execution burden. Managed credits are separate from regular Build Credits because managed work includes more service, review, setup, coordination, and delivery support."
      },
      {
        id: "managed-deeper-execution-support",
        label: "Deeper execution support",
        explanation:
          "Deeper execution support means the customer is not expected to manage every task alone. Neroa helps translate roadmap and scope into clearer build action, supports decisions, and carries more of the operational burden throughout the project."
      },
      {
        id: "managed-setup-and-delivery-guidance",
        label: "Setup and delivery guidance",
        explanation:
          "Setup and delivery guidance helps customers handle the harder parts of getting a SaaS project ready: account setup, integrations, deployment path, review flow, and what needs to be ready before launch or handoff."
      },
      {
        id: "managed-stronger-review-loop",
        label: "Stronger review loop",
        explanation:
          "A stronger review loop means managed projects get more structured review, feedback, correction, and approval handling. This is useful when the customer wants Neroa to help catch issues, organize revisions, and keep the build moving in the right direction."
      },
      {
        id: "managed-more-hands-on-project-handling",
        label: "More hands-on project handling",
        explanation:
          "More hands-on project handling means Neroa takes a larger role in guiding the project through planning, execution, review, and readiness. It is designed for customers who want more help and less day-to-day build management."
      }
    ]
  }
];

const decisionRows = [
  {
    title: "Choose DIY if:",
    items: [
      "you want lower cost",
      "you want control",
      "you can review tasks and approve work",
      "your build can move in smaller governed steps"
    ]
  },
  {
    title: "Choose Managed if:",
    items: [
      "you want Neroa to carry more of the execution burden",
      "you need help turning scope into delivery",
      "you want more guidance and review support",
      "you prefer a stronger service layer"
    ]
  }
] as const;

function NorthStarIcon({
  className = ""
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 1.8 11.8 8.2 18.2 10l-6.4 1.8L10 18.2l-1.8-6.4L1.8 10l6.4-1.8L10 1.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="1.1" fill="currentColor" />
    </svg>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-7 text-white/72">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-200/80" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M7 2.2v9.6M2.2 7h9.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function ConceptButton({
  concept,
  sectionTitle,
  isActive,
  onOpen
}: {
  concept: Concept;
  sectionTitle: string;
  isActive: boolean;
  onOpen: (concept: Concept) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(concept)}
      className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] px-4 py-2 text-left text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-teal-100 transition duration-200 hover:border-teal-200/50 hover:bg-[linear-gradient(180deg,rgba(150,255,233,0.12),rgba(255,255,255,0.05))] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200/80"
      aria-label={`${concept.label} Learn more in ${sectionTitle}`}
      aria-expanded={isActive}
      aria-haspopup="dialog"
    >
      <span>{concept.label}</span>
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[0.58rem] tracking-[0.16em] text-white/70 transition group-hover:border-teal-200/40 group-hover:text-white/88">
        <PlusIcon />
        Learn more
      </span>
    </button>
  );
}

function ConceptModal({
  concept,
  dialogId,
  onClose
}: {
  concept: Concept | null;
  dialogId: string;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!concept) {
      return;
    }

    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [concept]);

  if (!concept) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 sm:px-6">
      <button
        type="button"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,167,0.14),transparent_36%),rgba(1,4,7,0.78)] backdrop-blur-[6px]"
        aria-label="Close explanation"
        onClick={onClose}
      />
      <div
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/18 bg-[linear-gradient(180deg,rgba(24,28,32,0.97),rgba(12,15,18,0.98))] p-6 shadow-[0_40px_140px_rgba(0,0,0,0.62)] sm:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(104,211,175,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_28%)]" />
        <div className="relative flex items-start justify-between gap-6">
          <div className="space-y-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-white/48">
              Premium explanation bubble
            </p>
            <h3
              id={titleId}
              className="max-w-2xl font-serif text-[clamp(2rem,4vw,3.2rem)] leading-tight tracking-[-0.03em] text-teal-200"
            >
              {concept.label}
            </h3>
            <p id={descriptionId} className="max-w-2xl text-[1rem] leading-8 text-white/76">
              {concept.explanation}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/[0.06] text-white/72 transition hover:border-teal-200/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200/80"
            aria-label="Close explanation bubble"
          >
            <span aria-hidden="true" className="text-xl leading-none">&times;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function NeroaDiyManagedSurface() {
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);

  const allConcepts = [...sharedFoundationConcepts, ...buildPaths.flatMap((path) => path.concepts)];

  const activeConcept = allConcepts.find((concept) => concept.id === activeConceptId) ?? null;
  const activeDialogId = activeConcept ? `neroa-diy-managed-dialog-${activeConcept.id}` : "";

  useEffect(() => {
    if (!activeConceptId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveConceptId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeConceptId]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.7]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.18)_0%,rgba(4,7,10,0.42)_24%,rgba(3,6,8,0.82)_68%,rgba(3,6,8,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(190,255,240,0.13),transparent_10%),radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.05),transparent_20%)]" />
        <div className="absolute right-[2%] top-[2%] h-[42rem] w-[34rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.22),transparent_11%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.14),transparent_52%)] blur-xl" />
        <NeroaNorthStarAccent
          className="right-[18rem] top-[7rem]"
          testId="diy-managed-page-north-star"
        />
        <div className="absolute bottom-[8rem] left-[-8%] right-[-8%] h-[18rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.1),transparent_60%)]" />
      </div>

      <ConceptModal
        concept={activeConcept}
        dialogId={activeDialogId}
        onClose={() => setActiveConceptId(null)}
      />

      <section className="relative mx-auto flex w-full max-w-[1680px] flex-col px-6 py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/neroa" className="flex items-center gap-3 text-white">
            <NorthStarIcon className="h-5 w-5 text-teal-200/86" />
            <span className="font-serif text-[2.15rem] tracking-tight">Neroa</span>
          </Link>

          <NeroaPublicNavigation currentPath="/neroa/diy-vs-managed" />
        </header>

        <section className="grid gap-10 border-b border-white/10 py-14 lg:grid-cols-[1.2fr,0.8fr] lg:py-18">
          <div className="max-w-4xl space-y-8">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.34em] text-teal-200/78">
                Structured software building
              </p>
              <h1 className="font-serif text-[clamp(3.6rem,9vw,7rem)] leading-[0.95] tracking-[-0.05em] text-white">
                Two ways to build with Neroa.
              </h1>
              <p className="max-w-3xl text-[1.18rem] leading-8 text-white/70">
                Start with the same roadmap-first process, then choose how much of the
                execution you want Neroa to handle.
              </p>
              <p className="max-w-3xl text-[1rem] leading-8 text-white/62">
                Every project begins with structure: idea intake, roadmap, scope, decisions,
                approvals, and build readiness. From there, you can continue with guided DIY
                execution or choose a managed build path when you want more done for you.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/neroa/pricing"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-teal-300/45 bg-teal-300/12 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-teal-200/70 hover:bg-teal-300/22"
              >
                Compare plans
              </Link>
            </div>
          </div>

          <aside className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.92),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
              Shared foundation
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {sharedFoundationConcepts.map((concept) => (
                <ConceptButton
                  key={concept.id}
                  concept={concept}
                  sectionTitle="Shared foundation"
                  isActive={activeConceptId === concept.id}
                  onOpen={(nextConcept) => setActiveConceptId(nextConcept.id)}
                />
              ))}
            </div>
          </aside>
        </section>

        <section className="space-y-6 py-14">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">Comparison</p>
            <h2 className="font-serif text-[2.35rem] text-white">
              Pick the service layer that matches your project.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {buildPaths.map((path) => (
              <article
                key={path.title}
                className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.9),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                      {path.eyebrow}
                    </p>
                    <h3 className="font-serif text-[2rem] text-white">{path.title}</h3>
                  </div>

                  <BulletList items={path.points ?? []} />

                  <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-5">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                      Includes
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {path.concepts.map((concept) => (
                        <ConceptButton
                          key={concept.id}
                          concept={concept}
                          sectionTitle={path.title}
                          isActive={activeConceptId === concept.id}
                          onOpen={(nextConcept) => setActiveConceptId(nextConcept.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 border-y border-white/10 py-14 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">Decision guide</p>
            <h2 className="font-serif text-[2.35rem] text-white">Which one should you choose?</h2>
            <p className="max-w-2xl text-sm leading-7 text-white/60">
              Both options stay inside a roadmap-first process with approvals, evidence and
              review, and structured software building. The difference is how much of the
              execution burden Neroa carries for you.
            </p>
          </div>

          <div className="grid gap-4">
            {decisionRows.map((row) => (
              <article
                key={row.title}
                className="rounded-[1.45rem] border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
              >
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                  {row.title}
                </p>
                <div className="mt-4">
                  <BulletList items={row.items} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-14 lg:grid-cols-[0.95fr,1.05fr] lg:items-start">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">Positioning</p>
            <h2 className="font-serif text-[2.35rem] text-white">Both paths start with structure.</h2>
          </div>

          <div className="rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.88),rgba(6,9,13,0.72))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <p className="text-[1rem] leading-8 text-white/70">
              Neroa does not begin by throwing prompts at code. It starts by shaping the
              project, defining scope, surfacing decisions, and creating a clear build path
              before execution begins.
            </p>
          </div>
        </section>

        <section className="border-t border-white/10 py-14">
          <div className="flex flex-col gap-6 rounded-[1.8rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.9),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">Next step</p>
              <h2 className="font-serif text-[2.1rem] text-white">Start with pricing.</h2>
              <p className="max-w-2xl text-sm leading-7 text-white/60">
                Review the governed Build Credits and managed credits structure, then choose the
                path that fits your project.
              </p>
            </div>

            <Link
              href="/neroa/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-teal-300/45 bg-teal-300/12 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-teal-200/70 hover:bg-teal-300/22"
            >
              Start with pricing
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
