import type { Metadata } from "next";
import { NeroaFrontDoorSurface } from "@/components/neroa-portal/neroa-front-door-surface";

export const metadata: Metadata = {
  title: "Neroa Front Door",
  description:
    "Start with your idea, shape the roadmap and scope, and move into the clean Neroa project workspace with guardrails before execution."
};

export default function NeroaPortalFrontDoorPage() {
  return <NeroaFrontDoorSurface />;
}
