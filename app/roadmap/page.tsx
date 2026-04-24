import type { Metadata } from "next";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { RoadmapLandingShell } from "@/components/front-door/roadmap-landing-shell";
import { requireUser } from "@/lib/auth";

type RoadmapPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
  };
};

export const metadata: Metadata = {
  title: "NEROA | Roadmap",
  description:
    "Review your NEROA roadmap landing, see the recommended SaaS path, and continue into the real workspace."
};

export default async function RoadmapPage({ searchParams }: RoadmapPageProps) {
  const { user } = await requireUser({
    nextPath: "/roadmap"
  });

  return (
    <MarketingInfoShell
      userEmail={user.email ?? undefined}
      ctaHref="/projects"
      ctaLabel="Projects"
      brandVariant="prominent"
      contentWidth="wide"
      showHelpChat={false}
    >
      <section className="mx-auto max-w-6xl pb-4">
        <RoadmapLandingShell
          userEmail={user.email ?? undefined}
          error={searchParams?.error}
          notice={searchParams?.notice}
        />
      </section>
    </MarketingInfoShell>
  );
}
