import type { Metadata } from "next";
import { NeroaContactSurface } from "@/components/neroa-portal/neroa-contact-surface";

export const metadata: Metadata = {
  title: "Neroa | Contact",
  description:
    "Contact Neroa for help with account access, plan questions, project setup, and build guidance."
};

export default function NeroaContactPage() {
  return <NeroaContactSurface />;
}
