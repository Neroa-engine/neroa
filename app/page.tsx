import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getOptionalUser } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL("https://neroa.io"),
  title: "Neroa | Turn the idea into a product people can shape and approve",
  description:
    "Neroa helps you explain the idea, shape the roadmap, review previews and inspection, and move through approvals in one premium product-building experience.",
  alternates: {
    canonical: "https://neroa.io/"
  },
  openGraph: {
    title: "Neroa | Strategy Room first product building",
    description:
      "Start in Strategy Room, get a guided roadmap, and move through preview, inspection, approvals, and refinements inside one clear Neroa experience.",
    url: "https://neroa.io/",
    siteName: "Neroa",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Neroa | Guided from idea to approval",
    description:
      "Neroa turns the idea into a guided roadmap, a visible build path, and a premium review loop with preview, inspection, revisions, and approvals."
  }
};

const frontDoorMoments = [
  {
    step: "01",
    title: "Explain the idea in Strategy Room",
    description:
      "Start with the product, the customer, and the first outcome that matters so the build begins with clarity instead of scattered requests."
  },
  {
    step: "02",
    title: "Get a guided roadmap",
    description:
      "Shape the first release, the next priorities, and the decisions that should wait so the product path stays focused and believable."
  },
  {
    step: "03",
    title: "Move through preview and inspection",
    description:
      "See the product taking shape, review readiness in context, and keep progress readable without dropping into raw tooling."
  },
  {
    step: "04",
    title: "Approve and refine in one thread",
    description:
      "Keep revisions, approvals, and the next decision attached to the same product path so momentum never disappears between reviews."
  }
] as const;

const heroStages = [
  {
    index: "01",
    title: "Strategy Room",
    description: "Capture the idea, the customer, and the outcome in one guided starting point."
  },
  {
    index: "02",
    title: "Guided roadmap",
    description: "Sharpen the first release and keep the near-term path visible."
  },
  {
    index: "03",
    title: "Preview and inspection",
    description: "Review what is changing and what is ready without carrying the tooling."
  },
  {
    index: "04",
    title: "Approvals and revisions",
    description: "Keep decisions grounded and move the same product forward."
  }
] as const;

const heroProofPoints = [
  {
    label: "Start point",
    value: "Explain the idea"
  },
  {
    label: "Build rhythm",
    value: "Roadmap, preview, approvals"
  },
  {
    label: "Customer feel",
    value: "Guided and premium"
  }
] as const;

const experienceCards = [
  {
    eyebrow: "Roadmap",
    title: "The roadmap feels product-shaped, not tool-shaped",
    description:
      "Neroa turns the conversation into a roadmap with direction, sequencing, and first-release discipline before the build starts accelerating."
  },
  {
    eyebrow: "Preview",
    title: "Preview stays tied to progress and readiness",
    description:
      "The customer can see what is changing, what is ready, and what still needs attention without managing the machinery behind it."
  },
  {
    eyebrow: "Approvals",
    title: "Approvals and revisions never lose the thread",
    description:
      "Review, refine, and approve from the same product thread so momentum keeps moving instead of resetting between stages."
  }
] as const;

export default async function LandingPage() {
  const user = await getOptionalUser();

  return (
    <main className="homepage-root min-h-screen overflow-hidden text-white">
      <div className="homepage-atmosphere homepage-atmosphere-cyan" />
      <div className="homepage-atmosphere homepage-atmosphere-violet" />
      <div className="homepage-atmosphere homepage-atmosphere-blue" />

      <SiteHeader
        userEmail={user?.email ?? undefined}
        ctaHref="/start"
        ctaLabel="Open Strategy Room"
      />

      <div className="shell relative pb-24 pt-6">
        <section className="homepage-front-shell" aria-labelledby="homepage-title">
          <div className="homepage-hero-grid">
            <div className="homepage-hero-copy">
              <span className="homepage-pill">Neroa</span>
              <p className="homepage-kicker">Strategy Room first</p>

              <h1 id="homepage-title" className="homepage-hero-title">
                Turn the idea into a product people can see, shape, and approve.
              </h1>

              <p className="homepage-hero-summary">
                Start with the idea. Neroa turns it into a guided roadmap, a visible build
                path, and a premium review loop with preview, inspection, revisions, and
                approvals in one calm product experience.
              </p>

              <div className="homepage-action-row">
                <Link href="/start" className="button-primary">
                  Open Strategy Room
                </Link>
                <Link href="/auth" className="button-secondary">
                  Continue in Neroa
                </Link>
              </div>

              <p className="homepage-hero-support">
                Neroa keeps the planning, preview, inspection, and approvals connected behind
                one product shell, so the customer never feels dropped into infrastructure or
                operator mechanics.
              </p>

              <div className="homepage-proof-grid">
                {heroProofPoints.map((point) => (
                  <div key={point.label} className="homepage-proof-card">
                    <span className="homepage-proof-label">{point.label}</span>
                    <span className="homepage-proof-value">{point.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="homepage-hero-visual">
              <div className="homepage-floating-note">
                <span className="homepage-floating-label">Current build feel</span>
                <p>
                  Guided, premium, and product-first. The customer sees one clear path while
                  Neroa carries the underlying complexity.
                </p>
              </div>

              <div className="homepage-product-board">
                <div className="homepage-board-header">
                  <div>
                    <span className="homepage-mini-pill">Inside Neroa</span>
                    <h2 className="homepage-board-title">
                      The build stays readable from the first idea.
                    </h2>
                  </div>
                  <span className="homepage-board-status">Guided product flow</span>
                </div>

                <p className="homepage-board-summary">
                  Neroa keeps roadmap, preview, inspection, and approvals attached to the
                  same customer-facing thread so the work feels coherent as it moves.
                </p>

                <div className="homepage-stage-grid">
                  {heroStages.map((stage) => (
                    <article key={stage.index} className="homepage-stage-card">
                      <span className="homepage-stage-index">{stage.index}</span>
                      <h3 className="homepage-stage-title">{stage.title}</h3>
                      <p className="homepage-stage-body">{stage.description}</p>
                    </article>
                  ))}
                </div>

                <div className="homepage-board-footer">
                  <div className="homepage-board-stat">
                    <span className="homepage-board-stat-label">Preview</span>
                    <span className="homepage-board-stat-value">Visible in context</span>
                  </div>
                  <div className="homepage-board-stat">
                    <span className="homepage-board-stat-label">Inspection</span>
                    <span className="homepage-board-stat-value">Supports decisions</span>
                  </div>
                  <div className="homepage-board-stat">
                    <span className="homepage-board-stat-label">Approvals</span>
                    <span className="homepage-board-stat-value">Keep momentum moving</span>
                  </div>
                </div>
              </div>

              <div className="homepage-floating-note homepage-floating-note-secondary">
                <span className="homepage-floating-label">What customers feel</span>
                <p>
                  They explain the idea, watch the product become clearer, and approve the
                  next move without ever feeling like they are operating a raw tool stack.
                </p>
              </div>
            </div>
          </div>

          <div className="homepage-guided-strip">
            <div className="homepage-guided-head">
              <span className="homepage-pill">What the customer experiences</span>
              <h2 className="homepage-guided-title">
                One guided thread from first idea to approved next move.
              </h2>
              <p className="homepage-guided-summary">
                The front door should feel clear and calm. Strategy Room, roadmap, preview,
                inspection, and approvals should read like one connected product experience,
                not a set of isolated tools.
              </p>
            </div>

            <div className="homepage-guided-grid">
              {frontDoorMoments.map((moment) => (
                <article key={moment.step} className="homepage-guided-card">
                  <span className="homepage-guided-step">{moment.step}</span>
                  <h3 className="homepage-guided-card-title">{moment.title}</h3>
                  <p className="homepage-guided-copy">{moment.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="homepage-experience-section">
          <div className="homepage-section-copy">
            <p className="homepage-section-eyebrow">Why this feels different</p>
            <h2 className="homepage-section-title">
              Neroa should feel like a product platform, not a stack of tools.
            </h2>
            <p className="homepage-section-summary">
              The front section now leads with the customer experience first: guided planning,
              visible progress, stronger review context, and approvals that stay attached to
              the same build path.
            </p>
          </div>

          <div className="homepage-experience-grid">
            {experienceCards.map((card) => (
              <article key={card.title} className="homepage-experience-card">
                <p className="homepage-experience-eyebrow">{card.eyebrow}</p>
                <h3 className="homepage-experience-title">{card.title}</h3>
                <p className="homepage-experience-copy">{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="homepage-close-section">
          <div className="homepage-close-panel">
            <div className="homepage-close-copy">
              <p className="homepage-section-eyebrow">Continue into Neroa</p>
              <h2 className="homepage-section-title">
                Start with the product idea, then let Neroa carry the path forward.
              </h2>
              <p className="homepage-section-summary">
                Open Strategy Room, shape the roadmap, and move into previews, inspections,
                approvals, and refinements from the same premium product shell.
              </p>
            </div>

            <div className="homepage-action-row">
              <Link href="/start" className="button-primary">
                Open Strategy Room
              </Link>
              <Link href="/auth" className="button-secondary">
                Continue in Neroa
              </Link>
            </div>

            <div className="homepage-proof-grid">
              <div className="homepage-proof-card">
                <span className="homepage-proof-label">Customer experience</span>
                <span className="homepage-proof-value">Guided and premium</span>
              </div>
              <div className="homepage-proof-card">
                <span className="homepage-proof-label">Build path</span>
                <span className="homepage-proof-value">Roadmap, preview, approvals</span>
              </div>
              <div className="homepage-proof-card">
                <span className="homepage-proof-label">Internal complexity</span>
                <span className="homepage-proof-value">Hidden behind Neroa</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
