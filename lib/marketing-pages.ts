export type HowItWorksPage = {
  slug: string;
  index: string;
  title: string;
  eyebrow: string;
  intro: string;
  summary: string;
  outline: Array<{
    title: string;
    description: string;
  }>;
};

export const howItWorksPages: HowItWorksPage[] = [
  {
    slug: "create-a-workspace",
    index: "01",
    title: "Create a workspace",
    eyebrow: "How It Works",
    intro:
      "A Neroa workspace is the dedicated operating environment where a project keeps its context, AI stack, documents, decisions, and execution flow in one place.",
    summary:
      "Creating a workspace gives a real project one home for planning, writing, build work, and execution instead of scattering those threads across separate tools.",
    outline: [
      {
        title: "Start with a real project",
        description:
          "Each workspace opens around a concrete mission instead of an isolated prompt thread."
      },
      {
        title: "Capture context early",
        description:
          "Use the first project framing to define the goal, scope, constraints, and priorities."
      },
      {
        title: "Build continuity from day one",
        description:
          "Everything that follows stays tied to the same project operating context."
      }
    ]
  },
  {
    slug: "connect-your-stack",
    index: "02",
    title: "Connect your AI stack",
    eyebrow: "How It Works",
    intro:
      "Neroa is built around the idea that different AIs and connected systems should support different kinds of work inside the same project.",
    summary:
      "Connecting your stack means assigning clearer AI roles and keeping supporting systems close to the work instead of hidden behind separate context resets.",
    outline: [
      {
        title: "Use specialized AI roles",
        description:
          "Neroa, Forge, Atlas, RepoLink, Nova, Pulse, and Ops each sharpen a different part of the project."
      },
      {
        title: "Keep the system visible",
        description:
          "The AI stack stays understandable so users know what is active and why."
      },
      {
        title: "Connect the real execution layer",
        description:
          "Repositories, files, workflows, and operating systems can stay close to the same workspace."
      }
    ]
  },
  {
    slug: "build-inside-one-command-center",
    index: "03",
    title: "Build inside one command center",
    eyebrow: "How It Works",
    intro:
      "The command center is where planning, research, writing, coding, and execution stay connected instead of fragmenting across separate tabs and tool silos.",
    summary:
      "Neroa becomes the operating layer for active work, not just a place where prompts are typed and forgotten.",
    outline: [
      {
        title: "Route work through the right systems",
        description:
          "Neroa keeps the workflow focused and activates supporting AIs only when they add value."
      },
      {
        title: "Keep execution visible",
        description:
          "Outputs, tasks, AI threads, and project context stay tied to the same environment."
      },
      {
        title: "Move from idea to action",
        description:
          "The goal is not just better responses. The goal is better project momentum."
      }
    ]
  }
];

export function getHowItWorksPage(slug: string) {
  return howItWorksPages.find((page) => page.slug === slug);
}
