import type { Metadata } from "next";
import {
  NeroaCleanPortalShell,
  type NeroaPortalSection
} from "@/components/neroa-portal/neroa-clean-portal-shell";

export const metadata: Metadata = {
  title: "Neroa Account Portal",
  description: "Clean Account Portal shell for future account-scoped Neroa surfaces."
};

const accountPortalSections: readonly NeroaPortalSection[] = [
  {
    title: "Projects",
    description:
      "Placeholder for project listing, creation entry, and portfolio-level navigation inside the clean account shell."
  },
  {
    title: "Billing / Usage",
    description:
      "Placeholder for future billing summaries, plan controls, and usage reporting without coupling to legacy pricing or marketing flows."
  },
  {
    title: "Account Settings",
    description:
      "Placeholder for profile, preferences, and account-level configuration once the new portal stack is ready."
  },
  {
    title: "Team / Access",
    description:
      "Placeholder for roles, invites, and access review workflows in the future account administration surface."
  },
  {
    title: "Integrations / Infrastructure",
    description:
      "Placeholder for account-level integrations and infrastructure controls that stay separate from the core Neroa One execution spine."
  }
] as const;

export default function NeroaAccountPortalPage() {
  return (
    <NeroaCleanPortalShell
      eyebrow="Account Portal"
      title="Clean account shell for the next Neroa portal."
      summary="This account-facing shell establishes a fresh surface for projects, billing, team access, and infrastructure placeholders without inheriting legacy room behavior."
      sections={accountPortalSections}
      zoneLabel="Account Portal"
      zonePath="/neroa/account"
    />
  );
}
