import { NeroaChatCard } from "@/components/front-door/neroa-chat-card";
import { PublicActionLink } from "@/components/site/public-action-link";
import { publicLaunchEntryPath } from "@/lib/data/public-launch";

const heroTrustMarks = [
  "Strategy Room",
  "Guided Roadmap",
  "Preview",
  "Inspection",
  "Approvals"
] as const;

export function FrontDoorHomeHero({
  initialAuthenticated = false
}: {
  initialAuthenticated?: boolean;
}) {
  return (
    <section className="homepage-front-shell" aria-labelledby="neroa-homepage-title">
      <div className="homepage-hero-grid">
        <div className="homepage-hero-copy fade-up-soft">
          <h1 id="neroa-homepage-title" className="homepage-hero-title">
            Share the idea.
            <br />
            <span className="homepage-hero-accent">We&apos;ll build the path.</span>
          </h1>
          <p className="homepage-hero-summary">
            Start with the idea. NEROA turns it into a guided roadmap, a visible build
            path, and a premium review loop with preview, inspection, revisions, and
            approvals inside one calm product experience.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <PublicActionLink
              href={publicLaunchEntryPath}
              label="Open Strategy Room"
              className="button-primary px-6 py-4 text-base"
              initialAuthenticated={initialAuthenticated}
            />
          </div>

          <p className="homepage-hero-support">
            NEROA keeps the planning, preview, inspection, and approvals connected behind
            one product shell, so the customer never feels dropped into infrastructure or
            operator mechanics.
          </p>
        </div>

        <div className="homepage-hero-visual fade-up-soft-delay">
          <div className="homepage-chat-shell">
            <NeroaChatCard
              mode="starter"
              initialAuthenticated={initialAuthenticated}
              summaryPlacement="header-side"
            />
          </div>
        </div>
      </div>

      <div
        className="homepage-trust-row homepage-trust-row-centered fade-up-soft-delay"
        aria-label="NEROA guided product flow"
      >
        {heroTrustMarks.map((mark) => (
          <span key={mark} className="homepage-trust-mark">
            {mark}
          </span>
        ))}
      </div>
    </section>
  );
}
