import type { Metadata } from "next";
import { NeroaAccountPortalSurface } from "@/components/neroa-portal/neroa-account-portal-surface";

export const metadata: Metadata = {
  title: "Neroa | Account",
  description:
    "Manage your Neroa account, plan context, credits, and project access in one clear account overview."
};

export default function NeroaAccountPortalPage() {
  return <NeroaAccountPortalSurface />;
}
