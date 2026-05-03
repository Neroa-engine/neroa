import type { Metadata } from "next";
import { NeroaProjectPortalSurface } from "@/components/neroa-portal/neroa-project-portal-surface";

export const metadata: Metadata = {
  title: "Neroa | Project",
  description:
    "Open the Neroa Project Portal to shape strategy, review project structure, track command flow, and check QC review areas."
};

export default function NeroaProjectPortalPage() {
  return <NeroaProjectPortalSurface />;
}
