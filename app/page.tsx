import type { Metadata } from "next";
import {
  ConversionStrip,
  InfoCardGrid,
  JsonLdScript,
  SectionHeader
} from "@/components/marketing/public-page-sections";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { PublicActionLink } from "@/components/site/public-action-link";
import { getOptionalUser } from "@/lib/auth";
import { publicLaunchEntryPath } from "@/lib/data/public-launch";

export const metadata: Metadata = {
  metadataBase: new URL("https://neroa.io"),
  title: "Neroa | Turn the idea into a guided product build",
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
  },
  robots: {
    index: true,
    follow: true
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
];

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

const productExperienceCards = [
  {
    eyebrow: "Roadmap",
    title: "The roadmap feels product-shaped, not tool-shaped",
    description:
      "Neroa turns the conversation into a roadmap with direction, sequencing, and first-release discipline before the build starts accelerating.",
    expandedDescription:
      "The roadmap is where Neroa translates product truth into a build path that still feels coherent once previews, revisions, and approvals begin to stack up.",
    details: [
      "Structured first-release thinking",
      "Real sequencing instead of vague planning",
      "Clearer next decisions throughout the build"
    ],
    footnote:
      "Customers stay inside one product journey instead of bouncing between disconnected planning screens."
  },
  {
    eyebrow: "Preview",
    title: "Preview stays tied to progress and readiness",
    description:
      "The customer can see what is changing, what is ready, and what still needs attention without managing the machinery behind it.",
    expandedDescription:
      "Preview and progress are part of the product experience, not separate infrastructure surfaces. Neroa keeps every review legible enough to support the next good decision.",
    details: [
      "Readable progress at each stage",
      "Preview before decisions harden",
      "Customer stays oriented without operator complexity"
    ],
    footnote:
      "The product stays calm because Neroa hides the internal moving parts behind one customer-facing shell."
  },
  {
    eyebrow: "Approvals",
    title: "Approvals and revisions never lose the thread",
    description:
      "Review, refine, and approve from the same product thread so momentum keeps moving instead of resetting between stages.",
    expandedDescription:
      "The strongest product experiences keep approvals, revisions, and next moves attached to the same path as the roadmap and preview. Neroa is designed to keep that continuity visible.",
    details: [
      "Revision requests stay grounded",
      "Approvals move the same build forward",
      "No context loss between planning and execution"
    ],
    footnote:
      "The customer should always know what changed, why it matters, and what happens after approval."
  }
];

const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Neroa",
      url: "https://neroa.io",
      description:
        "Neroa is an AI-powered product planning and building platform that guides founders from idea through roadmap, preview, inspection, approvals, and refinement."
    },
    {
      "@type": "SoftwareApplication",
      name: "Neroa",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://neroa.io",
      description:
        "Use Neroa to explain a product idea, shape a guided roadmap, and move through preview, inspection, approvals, and refinement inside one premium build experience."
    }
  ]
} as const;

export default async function LandingPage() {
  const user = await getOptionalUser();
  const initialAuthenticated = Boolean(user);

  return (
    <MarketingInfoShell
      userEmail={user?.email ?? undefined}
      ctaHref={publicLaunchEntryPath}
      ctaLabel="Open Strategy Room"
      brandVariant="prominent"
      contentWidth="wide"
      showHelpChat={false}
    >
      <JsonLdScript data={homepageSchema} />

      <section className="homepage-front-shell" aria-labelledby="neroa-homepage-title">
        <div className="homepage-hero-grid">
          <div className="homepage-hero-copy fade-up-soft">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Neroa
            </span>
            <p className="homepage-kicker">Strategy Room first</p>
            <h1 id="neroa-homepage-title" className="homepage-hero-title">
              Turn the idea into a product people can see, shape, and approve.
            </h1>
            <p className="homepage-hero-summary">
              Start with the idea. Neroa turns it into a guided roadmap, a visible build
              path, and a premium review loop with preview, inspection, revisions, and
              approvals in one calm product experience.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <PublicActionLink
                href={publicLaunchEntryPath}
                label="Open Strategy Room"
                className="button-primary px-6 py-4 text-base shadow-[0_22px_60px_rgba(59,130,246,0.28)]"
                initialAuthenticated={initialAuthenticated}
              />
              <PublicActionLink
                href="/auth"
                label="Continue in Neroa"
                className="button-secondary px-6 py-4 text-base"
                initialAuthenticated={initialAuthenticated}
              />
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

          <div className="homepage-hero-visual fade-up-soft-delay">
            <div className="homepage-floating-note">
              <span className="homepage-floating-note-label">Current build feel</span>
              <p>
                Guided, premium, and product-first. The customer sees one clear path while
                Neroa carries the underlying complexity.
              </p>
            </div>

            <div className="homepage-product-board floating-plane rounded-[38px] p-6 sm:p-8">
              <div className="homepage-board-header">
                <div>
                  <span className="premium-pill border-slate-200/80 bg-white/84 text-slate-700">
                    Inside Neroa
                  </span>
                  <h2 className="homepage-board-title">The build stays readable from the first idea.</h2>
                </div>
                <span className="homepage-board-status">Guided product flow</span>
              </div>

              <p className="homepage-board-summary">
                Neroa keeps roadmap, preview, inspection, and approvals attached to the same
                customer-facing thread so the work feels coherent as it moves.
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
              <span className="homepage-floating-note-label">What customers feel</span>
              <p>
                They explain the idea, watch the product become clearer, and approve the next
                move without ever feeling like they are operating a raw tool stack.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <div className="homepage-guided-strip section-stage px-6 py-8 sm:px-8 sm:py-10">
            <div className="homepage-guided-head fade-up-soft">
              <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                What the customer experiences
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                One guided thread from first idea to approved next move.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                The front door should feel clear and calm. Strategy Room, roadmap, preview,
                inspection, and approvals should read like one connected product experience,
                not a set of isolated tools.
              </p>
            </div>

            <div className="homepage-guided-grid mt-8">
              {frontDoorMoments.map((moment) => (
                <article key={moment.step} className="homepage-guided-card">
                  <span className="homepage-guided-step">{moment.step}</span>
                  <h3 className="homepage-guided-title">{moment.title}</h3>
                  <p className="homepage-guided-copy">{moment.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 pb-4" aria-labelledby="why-this-feels-different-heading">
        <SectionHeader
          eyebrow="Why this feels different"
          title="Neroa should feel like a product platform, not a stack of tools."
          summary="The homepage now leads with the customer experience first: guided planning, visible progress, stronger review context, and approvals that stay attached to the same build path."
        />
        <div className="mt-8">
          <InfoCardGrid
            items={[...productExperienceCards]}
            columns="three"
            affordanceMode="icon"
          />
        </div>
      </section>

      <ConversionStrip
        eyebrow="Continue into Neroa"
        title="Start with the product idea, then let Neroa carry the path forward."
        summary="Open Strategy Room, shape the roadmap, and move into previews, inspections, approvals, and refinements from the same premium product shell."
        actions={[
          {
            href: publicLaunchEntryPath,
            label: "Open Strategy Room"
          },
          {
            href: "/auth",
            label: "Continue in Neroa",
            tone: "secondary"
          }
        ]}
        aside={
          <div className="comparison-band">
            <div className="comparison-metric">
              <span className="comparison-label">Customer experience</span>
              <span className="comparison-value">Guided and premium</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Build path</span>
              <span className="comparison-value">Roadmap, preview, approvals</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Internal complexity</span>
              <span className="comparison-value">Hidden behind Neroa</span>
            </div>
          </div>
        }
        initialAuthenticated={initialAuthenticated}
      />
    </MarketingInfoShell>
  );
}
