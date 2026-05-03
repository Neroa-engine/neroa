import type { Metadata } from "next";
import { NeroaDiyManagedSurface } from "@/components/neroa-portal/neroa-diy-managed-surface";

export const metadata: Metadata = {
  title: "Neroa | DIY vs Managed",
  description:
    "Compare Neroa DIY Build and Managed Build paths, both rooted in roadmap-first planning, scope before execution, approvals, and structured delivery."
};

export default function NeroaDiyVsManagedPage() {
  return <NeroaDiyManagedSurface />;
}
