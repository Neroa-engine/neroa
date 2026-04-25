const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export type BlogPostStatus = "draft" | "published" | "scheduled";

export type BlogPostSection = {
  id: string;
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: {
    title: string;
    content: string;
  };
};

export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  dek: string;
  intro: string[];
  body: BlogPostSection[];
  category: string;
  tags: string[];
  publishedAt: string;
  status: BlogPostStatus;
  canonicalUrl: string;
  socialTitle: string;
  socialDescription: string;
  authorName: string;
  attribution: string;
  heroPanelTitle: string;
  heroPanelItems: string[];
  keyTakeaways?: string[];
  relatedSlugs?: string[];
  heroImage?: string | null;
  cta: {
    title: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
};

export type BlogPublishPayload = {
  title: string;
  url: string;
  excerpt: string;
  heroImage: string | null;
  socialTitle: string;
  socialDescription: string;
  socialCopyVariants: Array<{
    channel: "x" | "linkedin" | "short";
    copy: string;
  }>;
};

function canonical(path: string) {
  return new URL(path, SITE_ORIGIN).toString();
}

function sortPostsByDateDescending(a: BlogPost, b: BlogPost) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

const blogPostContent = [
  {
    title: "How AI Can Build a SaaS from Front End to Back End",
    slug: "how-ai-can-build-a-saas-from-front-end-to-back-end",
    excerpt:
      "AI can now help move a SaaS idea through product planning, interface design, database structure, authentication, payments, admin tools, deployment, and iteration. The advantage is not just faster code. It is a guided build path from concept to working product.",
    dek:
      "A real SaaS build needs more than code generation. It needs strategy, scope, MVP definition, interface logic, backend structure, payments, launch readiness, and iteration after feedback. Coordinated AI can help hold that path together.",
    intro: [
      "A SaaS product is not only a collection of screens and endpoints. It is a chain of decisions: what the product does, who it is for, what the smallest viable version looks like, how the data model works, how accounts and payments behave, and what should happen after the first release.",
      "That is where a guided build system becomes more useful than a one-off coding assistant. NEROA starts with Neroa to frame the product, then carries the plan through budget, build definition, implementation, testing, launch, and iteration without resetting context."
    ],
    body: [
      {
        id: "strategy-and-definition",
        eyebrow: "Strategy",
        title: "Start by defining the product before you rush into the stack",
        paragraphs: [
          "The first job in a SaaS build is product definition. What does the product actually do, which customer is it built for, what painful workflow does it improve, and what part of the idea belongs in version one instead of version three?",
          "Neroa is useful here because it turns messy ambition into a structured product frame. That gives the rest of the system something real to build on instead of forcing every later decision to compensate for a vague starting point."
        ],
        bullets: [
          "Clarify the customer and the painful workflow first.",
          "Define the business model and the first outcome the product must deliver.",
          "Choose the product direction before build complexity starts compounding."
        ]
      },
      {
        id: "mvp-and-ux",
        eyebrow: "Scope",
        title: "Reduce the SaaS into an MVP, then shape the screens and user flow",
        paragraphs: [
          "Most SaaS ideas become expensive because the first version tries to include every dashboard, role, automation, and integration the founder can imagine. A better path is to reduce the concept to a testable MVP with a smaller feature set and a clearer outcome.",
          "Once that scope is clear, AI can help map the frontend: key screens, dashboard states, navigation, onboarding steps, empty states, and the UX decisions that make the product usable instead of merely technically complete."
        ],
        bullets: [
          "Define the smallest valuable version worth building.",
          "Map onboarding, primary workflow, and key screens.",
          "Use design guidance to reduce clutter before engineering work begins."
        ],
        callout: {
          title: "The real win",
          content:
            "The value is not just generating UI ideas faster. The value is protecting the build from unnecessary complexity before it becomes expensive."
        }
      },
      {
        id: "backend-auth-payments",
        eyebrow: "Build",
        title: "Backend structure, accounts, subscriptions, and admin logic all need planning",
        paragraphs: [
          "A working SaaS depends on system structure behind the interface. Database entities, permissions, events, account roles, billing logic, subscription states, and admin visibility all influence what can be built cleanly later.",
          "Guided planning helps break this into understandable layers. Neroa keeps the sequence coherent so data, auth, payment, and implementation decisions stay tied to the product brief instead of drifting into isolated technical work."
        ],
        bullets: [
          "Plan the database and core entities before writing scattered features.",
          "Decide whether users need accounts, roles, and admin controls early.",
          "Model subscription or payment logic before launch becomes urgent."
        ]
      },
      {
        id: "testing-launch-iteration",
        eyebrow: "Launch",
        title: "Testing, launch, and iteration are part of the build path, not an afterthought",
        paragraphs: [
          "A SaaS does not end when the first version is deployed. The product still needs testing priorities, launch sequencing, feedback loops, onboarding refinement, and a way to decide which improvements matter after the first users arrive.",
          "That is why NEROA treats the workflow as Strategy, Scope, Budget, Build Definition, Build, Test, Launch, and Operate. AI should help shape the release path and the post-launch loop, not just generate code in the middle."
        ],
        bullets: [
          "Create a go-live checklist before release pressure spikes.",
          "Turn user feedback into the next scoped iteration instead of random backlog growth.",
          "Use the same system for planning, building, launching, and improving the product."
        ]
      }
    ],
    category: "SaaS",
    tags: ["SaaS", "MVP", "Build systems"],
    publishedAt: "2026-04-13",
    status: "published",
    canonicalUrl: canonical("/blog/how-ai-can-build-a-saas-from-front-end-to-back-end"),
    socialTitle: "How AI Can Build a SaaS from Front End to Back End",
    socialDescription:
      "See how coordinated AI can help define, scope, build, test, launch, and improve a SaaS product from first concept to working release.",
    authorName: "NEROA product team",
    attribution: "Build note",
    heroPanelTitle: "What this article covers",
    heroPanelItems: [
      "Strategy and product definition before code",
      "MVP scope, screens, backend structure, auth, and payments",
      "Testing, launch, and iteration after the first release"
    ],
    keyTakeaways: [
      "SaaS products need coordinated decisions, not just faster code generation.",
      "AI is most useful when it helps hold strategy, scope, build, and launch together.",
      "A guided build path protects the product from wasted complexity."
    ],
    relatedSlugs: [
      "why-neroa-starts-with-neroa-instead-of-a-dashboard"
    ],
    heroImage: null,
    cta: {
      title: "Explore the SaaS build path",
      description:
        "See how Neroa helps shape SaaS ideas into an MVP, budget, build plan, and launch path with coordinated AI support.",
      primaryLabel: "Explore SaaS",
      primaryHref: "/use-cases/saas",
      secondaryLabel: "View pricing",
      secondaryHref: "/pricing"
    }
  },
  {
    title: "Internal Software: Replacing Broken Spreadsheets with AI-Built Systems",
    slug: "internal-software-replacing-broken-spreadsheets-with-ai-built-systems",
    excerpt:
      "Many companies run on spreadsheets, disconnected forms, and manual processes. Internal software gives teams a better way to manage workflows, data, approvals, dashboards, and operations without waiting months for custom development.",
    dek:
      "Internal software is often where operational pain hides in plain sight. Coordinated AI can help teams turn spreadsheet chaos into structured systems like CRMs, dashboards, reporting portals, approval flows, and workflow tools.",
    intro: [
      "Many businesses do not realize they need internal software until the spreadsheet stack starts breaking the team. One form feeds another sheet, one approval lives in email, one dashboard gets updated by hand, and no one fully trusts the numbers anymore.",
      "Neroa is useful here because the job is not generic productivity. The job is building an internal system that matches how the team actually works. Neroa helps frame the workflow, then coordinated AI helps shape the software structure, budget, and rollout path."
    ],
    body: [
      {
        id: "find-the-broken-workflow",
        eyebrow: "Strategy",
        title: "Start with the operational bottleneck, not the tool category",
        paragraphs: [
          "Internal software projects often fail because the team jumps straight to the idea of a CRM, dashboard, or portal without first defining the operational bottleneck that needs to change. The better starting point is the broken workflow: lead tracking, approvals, reporting, inventory, service delivery, or employee operations.",
          "When Neroa frames the problem first, the system can define what the software needs to do instead of copying features from another tool that only partly fits."
        ],
        bullets: [
          "Identify the manual process that is wasting time or creating errors.",
          "Define who uses the system and what decisions it must support.",
          "Separate must-have workflow logic from nice-to-have admin polish."
        ]
      },
      {
        id: "turn-operations-into-software",
        eyebrow: "Scope",
        title: "AI can help map CRMs, approval flows, portals, and operating dashboards",
        paragraphs: [
          "Once the core problem is clear, coordinated AI can help map internal software patterns: CRMs, data-entry systems, reporting portals, inventory tools, approval workflows, employee tools, and operations trackers.",
          "That is where AI becomes practical. It can outline the user roles, the objects in the system, the screen flow, the reporting needs, and the decision points that matter to the team."
        ],
        bullets: [
          "CRMs and pipeline systems",
          "Admin dashboards and reporting portals",
          "Approval workflows and operational tracking systems",
          "Employee tools, forms, and data-entry flows"
        ]
      },
      {
        id: "budget-build-automation",
        eyebrow: "Build",
        title: "The value is faster build planning and better operational fit",
        paragraphs: [
          "Internal tools are often funded reluctantly, so cost clarity matters. Budget, stack choice, automation scope, and build order all shape whether the project becomes usable or turns into a half-finished internal burden.",
          "Neroa helps reduce that risk by keeping strategy, MVP definition, budget framing, and build sequencing connected. The result is a clearer decision about what should be automated now, what should stay manual a bit longer, and what can be phased into later iterations."
        ],
        bullets: [
          "Budget around the highest-value workflow first.",
          "Phase automation instead of overbuilding the first release.",
          "Treat internal software like an operating asset, not a side request."
        ]
      },
      {
        id: "launch-and-adoption",
        eyebrow: "Operate",
        title: "Internal software succeeds only if the team actually uses it",
        paragraphs: [
          "Shipping the software is not the finish line. The system still needs training, adoption, reporting discipline, ongoing improvements, and clear ownership after release. Otherwise the team drifts back to spreadsheets and side channels.",
          "That is why internal software needs a launch and operating path too. Coordinated AI can help shape the rollout checklist, the workflow transition, and the next round of improvements once real usage begins."
        ],
        callout: {
          title: "What changes",
          content:
            "The goal is not to make prettier dashboards. The goal is to replace fragile manual operations with a system the team can actually trust and use."
        }
      }
    ],
    category: "Internal Software",
    tags: ["Internal tools", "Operations software", "CRMs"],
    publishedAt: "2026-04-12",
    status: "draft",
    canonicalUrl: canonical("/blog/internal-software-replacing-broken-spreadsheets-with-ai-built-systems"),
    socialTitle: "Internal Software: Replacing Broken Spreadsheets with AI-Built Systems",
    socialDescription:
      "See how coordinated AI can help replace spreadsheets and disconnected workflows with internal software that teams can actually use.",
    authorName: "NEROA product team",
    attribution: "Internal systems note",
    heroPanelTitle: "Inside this piece",
    heroPanelItems: [
      "How to identify the right internal software problem to solve",
      "Where AI helps with CRMs, dashboards, reporting, and approvals",
      "Why rollout and adoption matter as much as the build"
    ],
    keyTakeaways: [
      "Internal software starts with the broken workflow, not the label on the tool.",
      "AI helps most when it connects workflow design, budget, and build planning.",
      "Adoption and iteration determine whether the new system replaces the spreadsheet stack."
    ],
    relatedSlugs: [
      "building-a-coordinated-ai-system-instead-of-one-generic-assistant",
      "how-ai-can-build-a-saas-from-front-end-to-back-end",
      "external-apps-launching-customer-facing-products-faster-with-ai"
    ],
    heroImage: null,
    cta: {
      title: "Explore internal software builds",
      description:
        "See how Neroa helps plan CRMs, admin dashboards, workflow systems, reporting portals, and custom internal tools.",
      primaryLabel: "Explore Internal Software",
      primaryHref: "/use-cases/internal-software",
      secondaryLabel: "View pricing",
      secondaryHref: "/pricing"
    }
  },
  {
    title: "External Apps: Launching Customer-Facing Products Faster with AI",
    slug: "external-apps-launching-customer-facing-products-faster-with-ai",
    excerpt:
      "External apps help businesses serve customers through portals, booking tools, mobile app concepts, branded websites, client dashboards, and digital product experiences. AI can shorten the path from idea to launch by guiding scope, design, build, testing, and rollout.",
    dek:
      "Customer-facing products need clearer scope, stronger UX, launch discipline, and faster iteration. Coordinated AI helps shape external apps so the work moves from concept to real release with less drift.",
    intro: [
      "External apps sit in front of the customer, which means the build has to solve two jobs at once. It has to work operationally, and it has to feel clear, trustworthy, and usable for real people who have no context about how the team built it.",
      "That is why external apps benefit from a guided system. Neroa helps connect the path from strategy and scope into UX, build planning, testing, launch, and post-launch improvement instead of treating each step like a disconnected chat prompt."
    ],
    body: [
      {
        id: "plan-the-customer-journey",
        eyebrow: "Strategy",
        title: "Start with the customer journey and the outcome the product must deliver",
        paragraphs: [
          "External apps can mean many things: a branded website, a customer portal, a booking flow, a mobile app concept, a digital product experience, or a client dashboard. The common question is what the customer is trying to achieve and what the product needs to make easy.",
          "Neroa is useful because it can translate a broad product ambition into a clearer user journey, feature boundary, and launch path before the build becomes visually polished but strategically weak."
        ],
        bullets: [
          "Define the customer and the job they are trying to complete.",
          "Clarify whether the experience is a portal, booking flow, website, app concept, or product dashboard.",
          "Set the feature boundary around the first usable release."
        ]
      },
      {
        id: "design-scope-and-flows",
        eyebrow: "MVP",
        title: "AI can help shape pages, portals, booking flows, and branded product experiences",
        paragraphs: [
          "Customer-facing products need stronger front-end decisions than internal tools because trust, clarity, and conversion matter more. That means navigation, landing pages, onboarding, forms, calls to action, and visual hierarchy all influence whether the product works.",
          "Coordinated AI can help define the MVP screen set, the page flow, the lead-capture or payment path, and the branded experience that makes the product feel intentional instead of improvised."
        ],
        bullets: [
          "Landing pages and customer entry points",
          "Portals, booking systems, and dashboards",
          "Lead capture, payment, and onboarding flows",
          "Branded UX that supports trust and conversion"
        ]
      },
      {
        id: "test-build-launch",
        eyebrow: "Launch",
        title: "The launch path matters just as much as the build path",
        paragraphs: [
          "External apps succeed when teams validate the product before overbuilding it, test the customer flow before scaling promotion, and prepare the launch sequence before traffic arrives. Otherwise the product can look finished while still failing the real user journey.",
          "Neroa helps keep those stages connected. Strategy informs scope. Scope informs MVP. MVP informs budget. Budget informs build decisions. Test and launch then happen as part of the same operating path instead of becoming separate last-minute work."
        ],
        bullets: [
          "Test the customer flow before scaling spend or promotion.",
          "Use launch checklists instead of improvising release steps.",
          "Treat rollout as part of product execution, not marketing cleanup."
        ]
      },
      {
        id: "post-launch-improvement",
        eyebrow: "Operate",
        title: "Post-launch improvement is where customer-facing products compound",
        paragraphs: [
          "Once the app is live, the work shifts to improvement. Teams need to see what users do, where the flow breaks, what feedback repeats, and which changes will create the most value without bloating the roadmap.",
          "That is where coordinated AI helps again. The same system that framed the build can help interpret the next stage of iteration so the product keeps improving with context instead of restarting from scratch."
        ],
        callout: {
          title: "The advantage",
          content:
            "External apps move faster when the same coordinated system supports planning, UX decisions, build structure, launch testing, and post-launch iteration."
        }
      }
    ],
    category: "External Apps",
    tags: ["Customer-facing apps", "Launch", "UX"],
    publishedAt: "2026-04-11",
    status: "draft",
    canonicalUrl: canonical("/blog/external-apps-launching-customer-facing-products-faster-with-ai"),
    socialTitle: "External Apps: Launching Customer-Facing Products Faster with AI",
    socialDescription:
      "See how coordinated AI can guide strategy, scope, UX, build planning, testing, launch, and iteration for customer-facing products.",
    authorName: "NEROA product team",
    attribution: "Launch note",
    heroPanelTitle: "What this article covers",
    heroPanelItems: [
      "Planning portals, booking systems, branded sites, and app concepts",
      "How AI helps with UX, scope, and launch readiness",
      "Why post-launch iteration should stay in the same system"
    ],
    keyTakeaways: [
      "Customer-facing products need better scope and launch discipline, not just faster production.",
      "Coordinated AI helps keep UX, build planning, testing, and rollout connected.",
      "The same system should support the launch and the iteration that follows."
    ],
    relatedSlugs: [
      "how-ai-can-build-a-saas-from-front-end-to-back-end",
      "internal-software-replacing-broken-spreadsheets-with-ai-built-systems",
      "building-a-coordinated-ai-system-instead-of-one-generic-assistant"
    ],
    heroImage: null,
    cta: {
      title: "Explore external app builds",
      description:
        "See how Neroa helps shape portals, booking systems, branded websites, and customer-facing digital products from concept to launch.",
      primaryLabel: "Explore External Apps",
      primaryHref: "/use-cases/external-apps",
      secondaryLabel: "View pricing",
      secondaryHref: "/pricing"
    }
  },
  {
    title: "Why NEROA starts with Neroa instead of a dashboard",
    slug: "why-neroa-starts-with-neroa-instead-of-a-dashboard",
    excerpt:
      "Most build workflows break before they start because users are dropped into tools before the system understands what they are trying to build. NEROA begins with Neroa so the work is framed before the interface widens.",
    dek:
      "A dashboard looks like software readiness, but it does not tell a founder or builder what to do first. Neroa exists so NEROA can start with the build problem, not just the container around it.",
    intro: [
      "Dashboards are useful after a build already has structure. They help people revisit work, compare status, and move between known surfaces. They are far less useful when the user is still trying to define the product, the customer, the first version, and the right execution path.",
      "NEROA starts with Neroa because the first job is framing. Neroa helps define the problem, the audience, the scope, and the right next move before the system expands into Strategy, Scope, Budget, Build Definition, Build, Test, Launch, and Operate."
    ],
    body: [
      {
        id: "dashboard-problem",
        eyebrow: "Problem",
        title: "A dashboard is a container. A build needs a frame.",
        paragraphs: [
          "When a product starts with a dashboard, it assumes the user already knows which module matters, which workflow should lead, and how the project should be structured. That is rarely true at the start of a SaaS, internal software, or external app build.",
          "The result is familiar: users click through surfaces that look complete while the core build question is still unclear. The interface feels active, but the project itself is not yet shaped."
        ],
        bullets: [
          "The user has to choose a tool before the product understands the build.",
          "Context fragments early because the first output does not exist yet.",
          "The UI looks ready, but the execution path is still undefined."
        ]
      },
      {
        id: "neroa-frame",
        eyebrow: "Neroa",
        title: "Neroa creates the first build brief before the system widens",
        paragraphs: [
          "Neroa is the core orchestrator because it can turn a rough idea into a structured working brief. That means defining what is being built, who it is for, which workflow matters first, and what the smallest credible path looks like.",
          "Once that frame exists, the rest of Neroa becomes far more useful. The workspace, the lanes, the specialist AI support, and the next actions are all responding to a real build definition instead of a blank starting state."
        ],
        callout: {
          title: "Why this matters",
          content:
            "Neroa does not ask users to navigate first and think second. Neroa helps users think first so navigation and workflow structure become useful."
        }
      },
      {
        id: "specialists-after-frame",
        eyebrow: "System behavior",
        title: "Specialist AI should activate after the build path is clear",
        paragraphs: [
          "Specialist support matters because different phases of execution need different kinds of help. But specialization only creates value if the system brings the right depth in at the right time.",
          "Neroa keeps that activation disciplined. It decides when the work needs deeper strategy support, tighter scoping, build planning, launch preparation, or operating follow-through. That is what makes NEROA feel like one build system instead of a pile of disconnected assistants."
        ],
        bullets: [
          "Neroa keeps the build path coherent.",
          "Specialist AI activates only when the work genuinely needs it.",
          "The user sees a clearer next move instead of another menu of tools."
        ]
      },
      {
        id: "continuity",
        eyebrow: "Outcome",
        title: "The result is continuity from first idea to real execution",
        paragraphs: [
          "Starting with Neroa changes the product shape. The user can move from framing into MVP, budget, testing, build, and launch without constantly rebuilding context from scratch.",
          "That continuity is the difference between a smart-looking interface and a real execution system. NEROA stays anchored to the build itself, not just the screen the user happens to be on."
        ],
        bullets: [
          "One clearer first brief",
          "One guided path into the right workflow stages",
          "One system that stays aligned from idea to build"
        ]
      }
    ],
    category: "Product System",
    tags: ["Neroa", "Onboarding", "Build system"],
    publishedAt: "2026-04-10",
    status: "published",
    canonicalUrl: canonical("/blog/why-neroa-starts-with-neroa-instead-of-a-dashboard"),
    socialTitle: "Why NEROA starts with Neroa instead of a dashboard",
    socialDescription:
      "NEROA starts with Neroa because a build needs framing before a dashboard can be useful.",
    authorName: "NEROA product team",
    attribution: "Product note",
    heroPanelTitle: "In this article",
    heroPanelItems: [
      "Why dashboards are weak starting points for build work",
      "How Neroa creates the first build brief",
      "Why specialist AI should activate only after the path is clearer"
    ],
    keyTakeaways: [
      "A dashboard is useful after structure exists, not before.",
      "Neroa gives Neroa a build-first entry point instead of a tool-first entry point.",
      "Better framing creates better specialist AI orchestration later."
    ],
    relatedSlugs: [
      "how-ai-can-build-a-saas-from-front-end-to-back-end"
    ],
    heroImage: null,
    cta: {
      title: "See how NEROA starts the build correctly",
      description:
        "Explore the use-case path and let Neroa frame the work before the system expands into the full execution flow.",
      primaryLabel: "Explore use cases",
      primaryHref: "/use-cases",
      secondaryLabel: "View pricing",
      secondaryHref: "/pricing"
    }
  },
  {
    title: "Building a coordinated AI system instead of one generic assistant",
    slug: "building-a-coordinated-ai-system-instead-of-one-generic-assistant",
    excerpt:
      "One assistant can answer many questions, but it rarely creates the right operating model for real build work. Neroa is designed around visible AI coordination instead of one undifferentiated assistant.",
    dek:
      "Generic AI is useful for broad conversation. Coordinated AI is better for sustained execution. Neroa uses Neroa as the control layer so strategy, scope, build, launch, and operations can stay inside one guided system.",
    intro: [
      "There is a big difference between getting an answer and building something real. A general assistant may be good at conversation, but real execution work asks for different kinds of help at different moments: product framing, scoping, research, technical planning, design direction, launch readiness, and operating follow-through.",
      "Neroa is built around the idea that those roles should stay visible. Neroa is the core orchestrator. The supporting systems exist to extend execution when the work truly requires it."
    ],
    body: [
      {
        id: "generic-limit",
        eyebrow: "Model problem",
        title: "A single assistant hides too many different jobs inside one interaction",
        paragraphs: [
          "The main problem with a generic assistant is not intelligence. It is role collapse. Strategy, scope, UX, build logic, data planning, launch support, and operations all get flattened into one style of answer, even when the project needs different kinds of reasoning and output structure.",
          "That makes it harder for the user to understand what the system is doing, what kind of expertise is active, and how to improve the result."
        ],
        bullets: [
          "The system role is unclear.",
          "The user cannot see when the work changes from planning to build to launch.",
          "Outputs feel less like a workflow and more like disconnected responses."
        ]
      },
      {
        id: "neroa-control-layer",
        eyebrow: "Orchestration",
        title: "Neroa coordinates the system and specialist AI expands execution only when needed",
        paragraphs: [
          "Neroa frames the build, keeps the engine coherent, and decides when the project needs more specialized help. Atlas strengthens strategy and architecture. Forge sharpens build execution. RepoLink connects GitHub and repository context. Nova supports design direction and customer-facing assets. Pulse handles testing and feedback loops. Ops supports deployment, launch operations, and support workflows.",
          "This is useful because the system behavior becomes legible. The user can understand why a specialist is active and what kind of contribution it is making."
        ],
        callout: {
          title: "The coordination principle",
          content:
            "Specialization creates value only when the system also provides orchestration. Neroa is what keeps the AI stack acting like one build system instead of several separate assistants."
        }
      },
      {
        id: "workflow-continuity",
        eyebrow: "Workflow",
        title: "Coordination matters because the workflow compounds over time",
        paragraphs: [
          "Strategy decisions affect MVP scope. MVP decisions affect budget. Budget affects build sequencing. Build affects launch. Launch affects operations. If each step happens in isolation, the user ends up stitching the product together manually.",
          "Neroa keeps those stages in one system: Strategy, Scope, MVP, Budget, Test, Build, Launch, and Operate. The AI model supports the workflow instead of replacing it with one endless chat thread."
        ],
        bullets: [
          "One engine frame",
          "One visible AI stack",
          "One clearer path from idea to execution"
        ]
      },
      {
        id: "deliverables",
        eyebrow: "Customer value",
        title: "The point is better deliverables, not more AI theater",
        paragraphs: [
          "A coordinated AI system should produce better planning artifacts, clearer build direction, stronger budget framing, more usable exports, and better launch support. Otherwise the AI structure is just branding.",
          "Neroa is useful when the coordination creates visible output quality and better momentum for the person actually trying to build something."
        ],
        bullets: [
          "Clearer role visibility",
          "Better context retention",
          "Stronger transitions from framing into execution"
        ]
      }
    ],
    category: "AI System",
    tags: ["Coordinated AI", "Neroa", "Execution"],
    publishedAt: "2026-04-09",
    status: "draft",
    canonicalUrl: canonical("/blog/building-a-coordinated-ai-system-instead-of-one-generic-assistant"),
    socialTitle: "Building a coordinated AI system instead of one generic assistant",
    socialDescription:
      "Neroa uses coordinated AI so strategy, scope, build, launch, and operations stay inside one guided execution system.",
    authorName: "NEROA product team",
    attribution: "Architecture note",
    heroPanelTitle: "What this piece covers",
    heroPanelItems: [
      "Why one generic assistant is not enough for real build work",
      "How Neroa coordinates specialist AI systems",
      "Why coordination leads to better execution output"
    ],
    keyTakeaways: [
      "Specialization helps only when the user can see how the system is coordinated.",
      "Neroa is the control layer that keeps Neroa coherent.",
      "The point of AI coordination is better execution, not more complexity."
    ],
    relatedSlugs: [
      "why-neroa-starts-with-neroa-instead-of-a-dashboard",
      "how-ai-can-build-a-saas-from-front-end-to-back-end",
      "internal-software-replacing-broken-spreadsheets-with-ai-built-systems"
    ],
    heroImage: null,
    cta: {
      title: "Explore the coordinated AI system",
      description:
        "See how Neroa, Forge, Atlas, RepoLink, Nova, Pulse, and Ops fit together around real build workflows.",
      primaryLabel: "Explore AI systems",
      primaryHref: "/system/ai",
      secondaryLabel: "Explore use cases",
      secondaryHref: "/use-cases"
    }
  }
] satisfies BlogPost[];

export const blogPosts: BlogPost[] = [...blogPostContent].sort(sortPostsByDateDescending);

export function getAllBlogPosts() {
  return blogPosts;
}

export function getPublishedBlogPosts() {
  return blogPosts.filter((post) => post.status === "published");
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPublishedBlogPostBySlug(slug: string) {
  const post = getBlogPostBySlug(slug);

  if (!post || post.status !== "published") {
    return null;
  }

  return post;
}

export function getRelatedBlogPosts(post: BlogPost) {
  const relatedSlugs = post.relatedSlugs ?? [];

  return relatedSlugs
    .map((slug) => getPublishedBlogPostBySlug(slug))
    .filter((candidate): candidate is BlogPost => Boolean(candidate));
}

export function getBlogStaticParams() {
  return getPublishedBlogPosts().map((post) => ({
    slug: post.slug
  }));
}

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

function createSocialCopyVariants(post: BlogPost) {
  return [
    {
      channel: "x" as const,
      copy: `${post.title} - ${post.excerpt}`
    },
    {
      channel: "linkedin" as const,
      copy: `${post.title}\n\n${post.dek}\n\n${post.canonicalUrl}`
    },
    {
      channel: "short" as const,
      copy: `${post.title}. ${post.canonicalUrl}`
    }
  ];
}

export function buildBlogPublishPayload(post: BlogPost): BlogPublishPayload {
  return {
    title: post.title,
    url: post.canonicalUrl,
    excerpt: post.excerpt,
    heroImage: post.heroImage ?? null,
    socialTitle: post.socialTitle,
    socialDescription: post.socialDescription,
    socialCopyVariants: createSocialCopyVariants(post)
  };
}
