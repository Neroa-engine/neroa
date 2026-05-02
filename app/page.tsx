import type { Metadata } from "next";
import { getOptionalUser } from "@/lib/auth";
import { NeroaFrontDoorSurface } from "@/components/neroa-portal/neroa-front-door-surface";

export const metadata: Metadata = {
  metadataBase: new URL("https://neroa.io"),
  title: "Neroa | Project Front Door",
  description:
    "Start with your idea, shape the roadmap and scope, and move into the clean Neroa project workspace with guardrails before execution.",
  alternates: {
    canonical: "https://neroa.io/"
  },
  openGraph: {
    title: "Neroa | Project Front Door",
    description:
      "Neroa turns an idea into a structured project roadmap, scope, decisions, next steps, and a clean project workspace before execution begins.",
    url: "https://neroa.io/",
    siteName: "Neroa",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Neroa | Project Front Door",
    description:
      "Start with the idea, shape the roadmap and scope, and move into the clean Neroa project workspace with guardrails before execution."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function LandingPage() {
  const user = await getOptionalUser();

  return <NeroaFrontDoorSurface isSignedIn={Boolean(user)} />;
}
