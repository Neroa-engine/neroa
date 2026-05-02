import type { Metadata } from "next";
import { NeroaPricingSurface } from "@/components/neroa-portal/neroa-pricing-surface";

export const metadata: Metadata = {
  title: "Neroa | Pricing",
  description:
    "Choose a Neroa plan with governed build credits, separate managed credits, and separate workspace hours before starting your project."
};

export default function NeroaPricingPage() {
  return <NeroaPricingSurface />;
}
