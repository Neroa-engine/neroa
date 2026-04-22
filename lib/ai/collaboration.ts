import type { AgentId } from "@/lib/ai/agents";
import type { ProjectLaneRecord, ProjectRecord } from "@/lib/workspace/project-lanes";

export type CollaborationAgent = {
  id: AgentId;
  badge: string;
  active: boolean;
  roleLabel: string;
  description: string;
};

type LaneMode =
  | "strategy"
  | "budget"
  | "domain"
  | "plan"
  | "branding"
  | "website"
  | "launch"
  | "operations"
  | "marketing"
  | "build";

function laneMode(lane: Pick<ProjectLaneRecord, "slug" | "title" | "description">): LaneMode {
  const text = `${lane.slug} ${lane.title} ${lane.description}`.toLowerCase();

  if (text.includes("budget")) {
    return "budget";
  }

  if (text.includes("scope")) {
    return "strategy";
  }

  if (text.includes("domain") || text.includes("name")) {
    return "domain";
  }

  if (text.includes("business plan") || text.includes("plan")) {
    return "plan";
  }

  if (text.includes("brand") || text.includes("ui ux") || text.includes("design")) {
    return "branding";
  }

  if (text.includes("website") || text.includes("storefront") || text.includes("launch website")) {
    return "website";
  }

  if (
    text.includes("launch") ||
    text.includes("go-live") ||
    text.includes("release") ||
    text.includes("onboarding")
  ) {
    return "launch";
  }

  if (text.includes("operations") || text.includes("deployment") || text.includes("documentation")) {
    return "operations";
  }

  if (text.includes("marketing") || text.includes("growth") || text.includes("sales")) {
    return "marketing";
  }

  if (
    text.includes("coding") ||
    text.includes("architecture") ||
    text.includes("mvp") ||
    text.includes("mobile") ||
    text.includes("expo") ||
    text.includes("react native") ||
    text.includes("requirements") ||
    text.includes("testing") ||
    text.includes("product")
  ) {
    return "build";
  }

  return "strategy";
}

function naruaAgent(description: string): CollaborationAgent {
  return {
    id: "narua",
    badge: "Core",
    active: true,
    roleLabel: "Orchestration / framing",
    description
  };
}

export function getLaneAiCollaboration(
  lane: Pick<ProjectLaneRecord, "slug" | "title" | "description">
): CollaborationAgent[] {
  const mode = laneMode(lane);

  switch (mode) {
    case "budget":
      return [
        naruaAgent("Neroa compares plan cost, launch cost, and the next practical budget move."),
        {
          id: "atlas",
          badge: "Active",
          active: true,
          roleLabel: "Context / tradeoffs",
          description: "Atlas helps Neroa weigh assumptions, scenario tradeoffs, and decision risk."
        },
        {
          id: "ops",
          badge: "Active",
          active: true,
          roleLabel: "Operating cost logic",
          description: "Ops keeps the budget grounded in real operating steps, launch dependencies, and follow-through."
        }
      ];
    case "domain":
      return [
        naruaAgent("Neroa narrows naming direction and keeps the shortlist tied to the Engine."),
        {
          id: "nova",
          badge: "Active",
          active: true,
          roleLabel: "Brand and UX copy",
          description: "Nova helps shape names, brand language, and customer-facing clarity around the product."
        },
        {
          id: "repolink",
          badge: "Active",
          active: true,
          roleLabel: "Connected setup",
          description: "RepoLink supports domain, repository, and technical setup context when naming choices affect launch systems."
        }
      ];
    case "plan":
      return [
        naruaAgent("Neroa turns the plan into a structured direction with visible assumptions and next steps."),
        {
          id: "atlas",
          badge: "Active",
          active: true,
          roleLabel: "Research / product logic",
          description: "Atlas supports planning depth, architecture logic, assumptions, and milestone reasoning."
        },
        {
          id: "ops",
          badge: "Active",
          active: true,
          roleLabel: "Execution structure",
          description: "Ops keeps the plan grounded in milestones, workflow, launch operations, and operating reality."
        }
      ];
    case "branding":
      return [
        naruaAgent("Neroa keeps the brand direction aligned to the actual offer and audience."),
        {
          id: "nova",
          badge: "Active",
          active: true,
          roleLabel: "Design / customer-facing assets",
          description: "Nova shapes voice, visual direction, UX copy, and the customer-facing brand system."
        },
        {
          id: "atlas",
          badge: "Support",
          active: true,
          roleLabel: "Positioning logic",
          description: "Atlas supports product positioning, category clarity, and messaging coherence."
        }
      ];
    case "website":
      return [
        naruaAgent("Neroa maps the website into a launch-ready structure instead of loose page ideas."),
        {
          id: "nova",
          badge: "Active",
          active: true,
          roleLabel: "Experience / UX copy",
          description: "Nova shapes the page flow, UX language, and customer-facing experience."
        },
        {
          id: "forge",
          badge: "Active",
          active: true,
          roleLabel: "Build structure",
          description: "Forge frames the technical and content structure needed to ship the site."
        },
        {
          id: "pulse",
          badge: "Support",
          active: true,
          roleLabel: "Testing / feedback",
          description: "Pulse supports usability checks, launch-readiness review, and the first feedback loops."
        }
      ];
    case "operations":
      return [
        naruaAgent("Neroa converts the workflow into an execution system with clear next steps."),
        {
          id: "ops",
          badge: "Active",
          active: true,
          roleLabel: "Launch / operations",
          description: "Ops drafts the workflow map, deployment checklist, support flow, and execution sequence."
        },
        {
          id: "forge",
          badge: "Support",
          active: true,
          roleLabel: "Automation structure",
          description: "Forge supports repeatable system design when workflow automation and build support matter."
        }
      ];
    case "launch":
      return [
        naruaAgent("Neroa turns release planning into a clean launch path with a clear next move."),
        {
          id: "ops",
          badge: "Active",
          active: true,
          roleLabel: "Deployment / launch operations",
          description: "Ops keeps go-live readiness, connected services, onboarding steps, and handoff work operationally clear."
        },
        {
          id: "pulse",
          badge: "Support",
          active: true,
          roleLabel: "QA / usage signals",
          description: "Pulse supports launch testing, performance checks, and the first feedback loops after release."
        }
      ];
    case "marketing":
      return [
        naruaAgent("Neroa narrows the rollout into a practical customer-facing release plan."),
        {
          id: "nova",
          badge: "Active",
          active: true,
          roleLabel: "Content / brand",
          description: "Nova shapes the customer-facing language, content structure, and brand presentation around the release."
        },
        {
          id: "pulse",
          badge: "Support",
          active: true,
          roleLabel: "Feedback / response signals",
          description: "Pulse helps test response signals, usability friction, and early feedback once the release is live."
        }
      ];
    case "build":
      return [
        naruaAgent("Neroa translates the lane into a scoped execution path, decides which system should build or review, and keeps the repo work aligned."),
        {
          id: "forge",
          badge: "Active",
          active: true,
          roleLabel: "Execution scaffolding",
          description: "Forge shapes the implementation structure, tasks, and build sequence before backend repository execution starts."
        },
        {
          id: "repolink",
          badge: "Support",
          active: true,
          roleLabel: "GitHub / connected systems",
          description: "RepoLink supports GitHub, repositories, branches, pull requests, environments, and deployment context when the build turns technical."
        }
      ];
    case "strategy":
    default:
      return [
        naruaAgent("Neroa frames the direction, decides what matters, and keeps the lane focused."),
        {
          id: "atlas",
          badge: "Active",
          active: true,
          roleLabel: "Research / architecture",
          description: "Atlas supports reasoning depth, product logic, architecture framing, and directional clarity."
        }
      ];
  }
}

export function getProjectAiCollaboration(project: ProjectRecord): CollaborationAgent[] {
  const activeIds = new Set<AgentId>();
  const items: CollaborationAgent[] = [];

  for (const lane of project.lanes) {
    for (const agent of getLaneAiCollaboration(lane)) {
      if (activeIds.has(agent.id)) {
        continue;
      }

      activeIds.add(agent.id);
      items.push(agent);
    }
  }

  return items;
}
