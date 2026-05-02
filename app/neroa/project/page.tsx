import type { Metadata } from "next";
import { NeroaProjectPortalSurface } from "@/components/neroa-portal/neroa-project-portal-surface";

export const metadata: Metadata = {
  title: "Neroa Project Portal",
  description: "Clean Project Portal shell for future project-scoped Neroa surfaces."
};

export default function NeroaProjectPortalPage() {
  return <NeroaProjectPortalSurface />;
}
