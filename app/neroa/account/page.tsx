import type { Metadata } from "next";
import { NeroaAccountPortalSurface } from "@/components/neroa-portal/neroa-account-portal-surface";

export const metadata: Metadata = {
  title: "Neroa Account Portal",
  description: "Clean Account Portal shell for future account-scoped Neroa surfaces."
};

export default function NeroaAccountPortalPage() {
  return <NeroaAccountPortalSurface />;
}
