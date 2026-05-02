import type { Metadata } from "next";
import {
  NeroaCleanPortalShell,
  type NeroaPortalSection
} from "@/components/neroa-portal/neroa-clean-portal-shell";

export const metadata: Metadata = {
  title: "Neroa Project Portal",
  description: "Clean Project Portal shell for future project-scoped Neroa surfaces."
};

const projectPortalSections: readonly NeroaPortalSection[] = [
  {
    title: "Strategy Room",
    description:
      "Placeholder for future strategy review inside the clean project shell, without reusing the legacy Strategy Room implementation."
  },
  {
    title: "Command Center",
    description:
      "Placeholder for future clean intake and orchestration views once the new project portal wiring is ready."
  },
  {
    title: "Project Room",
    description:
      "Placeholder for future project-specific working context inside the clean portal, separate from legacy workspace rooms."
  },
  {
    title: "Evidence / Results",
    description:
      "Placeholder for future customer-safe result views and evidence summaries once the backend review lanes are wired."
  },
  {
    title: "Roadmap / Scope",
    description:
      "Placeholder for roadmap and scope review surfaces connected to the clean project portal rather than the old room architecture."
  },
  {
    title: "Approvals / Decisions",
    description:
      "Placeholder for approvals, decision checkpoints, and governance review within the clean project shell."
  }
] as const;

export default function NeroaProjectPortalPage() {
  return (
    <NeroaCleanPortalShell
      eyebrow="Project Portal"
      title="Clean project shell for future Neroa One-facing workflows."
      summary="This project-facing shell is intentionally limited to placeholder structure so the new portal can grow in parallel without importing the legacy Command Center, Strategy Room, Build Room, or Live View stack."
      sections={projectPortalSections}
      zoneLabel="Project Portal"
      zonePath="/neroa/project"
    />
  );
}
