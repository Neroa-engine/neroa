import type { Metadata } from "next";
import { NeroaContactSurface } from "@/components/neroa-portal/neroa-contact-surface";

export const metadata: Metadata = {
  title: "Neroa | Contact",
  description:
    "Contact Neroa Support for help with account access, billing questions, project setup, and technical issues."
};

export default function NeroaContactPage() {
  return <NeroaContactSurface />;
}
