import type { Metadata } from "next";
import { NeroaAdminPortalSurface } from "@/components/neroa-portal/neroa-admin-portal-surface";

export const metadata: Metadata = {
  title: "Neroa | Admin Portal",
  description:
    "Open the Neroa Admin Portal shell to review internal admin structure for dashboard, users, projects, support, credits, content, QC, and settings."
};

export default function NeroaAdminPortalPage() {
  return <NeroaAdminPortalSurface />;
}
