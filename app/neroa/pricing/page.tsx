import type { Metadata } from "next";
import { NeroaPricingSurface } from "@/components/neroa-portal/neroa-pricing-surface";

export const metadata: Metadata = {
  title: "Neroa | Pricing",
  description:
    "Neroa pricing is built around governed Build Credits, project preview access, credit top-offs, and managed credits."
};

export default function NeroaPricingPage() {
  return <NeroaPricingSurface />;
}
