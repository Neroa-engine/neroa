import type { Metadata } from "next";
import { NeroaProjectPortalSurface } from "@/components/neroa-portal/neroa-project-portal-surface";

export const metadata: Metadata = {
  title: "Neroa | Project",
  description:
    "See your Neroa project roadmap, scope, decisions, evidence, and build readiness in one calm project overview."
};

export default function NeroaProjectPortalPage() {
  return <NeroaProjectPortalSurface />;
}
