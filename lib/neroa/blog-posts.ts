export type BlogPostSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  readTime: string;
  category: string;
  bodySections: BlogPostSection[];
};

export const NEROA_BLOG_INDEX_PATH = "/neroa/blog";

// Static public Build Journal source for now; future admin publishing can replace this module without changing the public blog routes.
export const blogPosts: BlogPost[] = [
  {
    slug: "why-no-code-ai-builders-break-down",
    title: "Why Today's No-Code and AI App Builders Still Break Down",
    summary:
      "Modern no-code and AI builders can be excellent for prototypes, websites, early demos, and fast visual iteration. The breakdown usually starts when founders expect generated screens to replace scope, architecture, data planning, auth, payments, permissions, QA, and long-term maintainability.",
    readTime: "8 min read",
    category: "Foundational article 01",
    bodySections: [
      {
        heading: "The promise of no-code and AI app builders",
        paragraphs: [
          "The promise is easy to understand. A founder has an idea, opens a builder, types a prompt, and sees screens appear quickly. That speed feels refreshing compared with a long consulting cycle or a blank code editor. It lowers the emotional barrier to starting, which matters because many good ideas never become visible enough to test in the first place.",
          "Tools like Bubble, Webflow, Framer, Lovable, Bolt, Replit, v0, and Cursor can be useful for prototypes, websites, early demos, and faster iteration. They help teams express direction, validate rough flows, and react to feedback faster than many traditional handoff-heavy workflows. The issue is not that these tools are bad. The issue is what people expect them to replace."
        ]
      },
      {
        heading: "Where these tools are genuinely useful",
        paragraphs: [
          "At the front of a project, speed is often more valuable than polish. A founder may need a landing page, a visual prototype, a clickable concept, or a rough internal demo for investor or customer conversations. In that stage, a no-code builder or AI-assisted coding tool can compress days of setup into hours and make the idea feel real enough to discuss.",
          "They are also useful for early product exploration. A team can test navigation concepts, message hierarchy, layout direction, or even whether a workflow is understandable to a user. That is real value. Rapid iteration is good when the objective is learning. Problems usually begin when a learning tool is treated like a complete production system before the hard product questions are settled."
        ]
      },
      {
        heading: "Where the breakdown usually starts",
        paragraphs: [
          "The breakdown normally starts when the project moves from concept to real SaaS expectations. A founder no longer needs a homepage and a few generated screens. They now need a dependable product with a clear project scope, a durable architecture, a stable data model, and a sequence for what should be built first. That is a different level of responsibility.",
          "Without that structure, teams keep rebuilding the same ideas in slightly different shapes. One prompt creates a dashboard, another adds a billing area, a third changes the onboarding flow, and a fourth rewrites the data assumptions behind the first three screens. The app can still look impressive in screenshots while becoming more fragile underneath every time the direction shifts."
        ]
      },
      {
        heading: "Why SaaS needs more than generated screens",
        paragraphs: [
          "A production-ready SaaS product is not just a collection of interfaces. It needs system truth. Who are the users? What outcomes matter? Which records exist? What state changes are allowed? What approvals are needed before data is written, plans are changed, or money moves? Which parts of the product are customer-facing and which parts are internal control surfaces? Generated screens do not answer those questions on their own.",
          "That is why architecture matters even for a so-called simple MVP. A small product still has dependencies, tradeoffs, and constraints. If the workflow depends on the wrong data relationships, the team pays for it later. If roles and permissions are unclear, the product becomes risky. If the path from demo to maintainability was never designed, every improvement becomes slower and more expensive than it should be."
        ]
      },
      {
        heading: "Auth, payments, data, permissions, and QA change the equation",
        paragraphs: [
          "As soon as a product needs auth, payments, permissions, and persistent customer data, the quality bar changes. A nice screen is no longer enough. You need to know what happens when a user signs up, resets access, changes a plan, loses a session, or belongs to the wrong role. You need to know whether the billing path matches the product promise, whether notifications are accurate, and whether the data model can support the workflows being sold.",
          "QA and maintainability matter for the same reason. If the team cannot confidently review what changed, verify what still works, and understand how one feature affects another, the system becomes fragile. A vague prompt can generate motion. It cannot substitute for evidence and review, approvals, regression thinking, and the discipline required to keep a real SaaS product healthy over time."
        ]
      },
      {
        heading: "Why vague prompts create fragile apps",
        paragraphs: [
          "Vague prompts create fragile apps because they hide missing decisions behind fluent output. The interface looks finished enough that a founder feels progress, but the underlying assumptions remain unresolved. Which users are primary? Which workflows belong in MVP? How should the project sequence handle admin tools, notifications, edge cases, and support flows? When those answers are missing, the app keeps growing around uncertainty instead of around product truth.",
          "This is why Neroa starts with roadmap-first planning and scope before execution. The goal is not to slow founders down for its own sake. The goal is to protect them from expensive rebuild loops by turning intent into a guided plan, clarifying architecture, confirming the data model, defining approvals, and making space for auth, payments, QA, and maintainability before the build claims to be SaaS done right."
        ]
      }
    ]
  },
  {
    slug: "why-neroa-can-build-differently",
    title: "Why Neroa Can Build Differently",
    summary:
      "Neroa is not an open-ended prompt box that rushes straight into code. It uses roadmap-first planning, scope before execution, approvals, evidence and review, and Build Credits to keep progress governed, visible, and easier to trust.",
    readTime: "8 min read",
    category: "Foundational article 02",
    bodySections: [
      {
        heading: "Neroa is not just another prompt box",
        paragraphs: [
          "Many builder experiences start with an empty field and a lot of optimism. Type what you want, watch something appear, and hope the result is close enough to keep moving. That model can be exciting, but it also makes it easy to confuse output with alignment. A project can look active long before the team has agreed on what is actually being built.",
          "Neroa is designed around a different idea. The system is meant to convert intent into a governed build path instead of turning every request into immediate execution. That difference matters because software projects usually become expensive when teams move too quickly without enough product truth, not when they pause long enough to structure the work."
        ]
      },
      {
        heading: "Roadmap before build",
        paragraphs: [
          "Roadmap-first means the team does not treat implementation as the first form of thinking. Before real build pressure takes over, the project needs direction. Which outcomes belong in the earliest release? Which dependencies are mandatory? Which surfaces are public, private, administrative, or supporting? What sequence reduces rework instead of multiplying it?",
          "A roadmap is not paperwork for its own sake. It is the mechanism that keeps a founder from paying twice for the same idea. When the path is visible, the team can discuss tradeoffs, stage work responsibly, and keep the build tied to a real objective instead of reacting to every new thought as if it deserves immediate code."
        ]
      },
      {
        heading: "Scope before execution",
        paragraphs: [
          "Scope before execution is one of the clearest differences between structured software building and chaotic app generation. If the system does not know what is in scope, out of scope, or deferred, everything competes for immediate attention. That is how dashboards arrive before permissions, billing arrives before plan logic is defined, and admin tools appear before the data model is stable enough to support them.",
          "Neroa treats project scope as a protective boundary. It helps teams identify what belongs in the first release, what should wait, and what should be rejected entirely. That reduces drift, keeps architecture coherent, and makes the build easier to review because the team is not quietly changing the product every time a new prompt sounds interesting."
        ]
      },
      {
        heading: "Decisions before irreversible work",
        paragraphs: [
          "Software contains irreversible moments. A data model gets chosen. An auth pattern is committed. A billing path is wired. A plan hierarchy changes how the product is sold. A workflow becomes the default expectation for users and support teams. Once those decisions are implemented deeply enough, changing them later is more expensive than deciding them well in the first place.",
          "That is why approvals matter. Neroa uses decisions and approvals as part of the build discipline, not as bureaucracy. The point is to make sure the team knows when a change is exploratory, when it is approved, and when it becomes part of the durable product direction. Clarity at that stage prevents rebuild loops that would otherwise look like normal progress until the costs arrive."
        ]
      },
      {
        heading: "Evidence before trust",
        paragraphs: [
          "Trust in software does not come from a confident paragraph or a beautiful mockup. It comes from evidence and review. What was changed? Why was it changed? Was it reviewed? Does it still match the roadmap? Does it satisfy the approved acceptance criteria? If the system cannot answer those questions, the team is relying on hope more than on governance.",
          "Neroa uses evidence and review so teams can trust progress without pretending that every generated output is automatically safe. Structured software building works better when changes remain visible, reviewable, and tied back to the approved plan. That gives founders a calmer way to move forward because they are not guessing what happened between idea and delivery."
        ]
      },
      {
        heading: "Build Credits as guardrails",
        paragraphs: [
          "Build Credits are part of that structure. They are not a claim of endless output and they are not a timer that magically converts to finished software. They represent governed execution across planning, implementation, review, corrections, QA, and approved forward motion. That framing matters because it reflects the actual work required to build responsibly.",
          "Managed credits stay distinct for the same reason. Different execution paths need different controls. By using Build Credits and managed credits as guardrails, Neroa can keep effort tied to approval checkpoints, visible scope, and reviewed progress instead of turning the project into an open-ended consumption loop with fuzzy boundaries."
        ]
      },
      {
        heading: "DIY and Managed paths reduce rebuild loops",
        paragraphs: [
          "Not every founder wants the same level of hands-on involvement. Some want a DIY path with more direct participation. Others want managed support with more guided execution. Neroa can support both because the structure stays consistent: roadmap-first planning, scope before execution, decisions and approvals, evidence and review, and governed execution that respects the project rather than rushing past it.",
          "That structure is why Neroa can build differently. The goal is not to make software feel heavier. The goal is to make it more reliable, more maintainable, and more economically sane. When the plan is clearer, the architecture is cleaner, and the approvals are explicit, teams spend less energy undoing vague work and more energy building SaaS done right."
        ]
      }
    ]
  },
  {
    slug: "how-many-credits-basic-saas-mvp",
    title: "How Many Credits Does It Take to Get a Basic SaaS to MVP?",
    summary:
      "There is no honest universal MVP total because credit use depends on scope, architecture, workflow depth, QA needs, and how much product truth is settled before execution. Build Credits represent governed work, not minutes or unlimited output.",
    readTime: "9 min read",
    category: "Foundational article 03",
    bodySections: [
      {
        heading: "Credits are not minutes",
        paragraphs: [
          "One of the biggest misunderstandings in AI-assisted software is the idea that effort can be measured like simple chat time. That framing sounds convenient, but it breaks down quickly once a project moves beyond surface-level output. Build Credits are not minutes. They are not a promise that a founder can type endlessly until a finished product appears. They represent governed work moving through planning, implementation, review, corrections, QA, and approved progress.",
          "That distinction protects expectations. A project that needs better architecture, a clearer data model, or stronger approvals will naturally use effort differently from a project with a narrow scope and few dependencies. Treating credits like a stopwatch hides the real cost drivers and makes founders think software is cheaper simply because the interface generating it is fast."
        ]
      },
      {
        heading: "What credits are used for",
        paragraphs: [
          "Credits support the full path of structured software building. That includes roadmap-first planning, turning requirements into a guided plan, defining project scope, clarifying architecture, reviewing the data model, sequencing implementation, checking outcomes, fixing mistakes, and confirming that the work still matches the approved direction. Even small products benefit from that discipline because it prevents guesswork from becoming production behavior.",
          "They also cover the reality that progress is not linear. A feature may need to be revised after review. A workflow may need a correction after QA. A founder may approve one direction and defer another. Governed execution needs room for those moments because real software is not just generated once and left untouched. It is shaped, reviewed, and improved as the approved picture becomes clearer."
        ]
      },
      {
        heading: "What makes a SaaS more expensive",
        paragraphs: [
          "Complexity does not come only from screen count. It comes from system responsibilities. Auth increases complexity. Payments increase complexity. Notifications, admin surfaces, integrations, multi-step workflows, role-based permissions, AI features, exports, auditability, and exception handling all add weight. Each one affects architecture, testing, and long-term maintainability, even if the interface still looks simple to an end user.",
          "This is why two products that both call themselves a basic SaaS can consume very different amounts of governed work. One may have a landing page, sign-in, a small dashboard, and a modest database. Another may need plans, approval logic, admin tools, customer messaging, reporting, and a billing path. The label sounds similar. The execution burden is not."
        ]
      },
      {
        heading: "Example complexity bands",
        paragraphs: [
          "A very small project might include a landing experience, auth, a simple dashboard, and a lightweight database with a narrow workflow. That kind of project usually has a tighter rebuild radius because fewer surfaces are involved. It still benefits from approvals, QA, and architecture thinking, but it tends to be more predictable than a broader SaaS.",
          "A basic SaaS often adds plans, a larger database footprint, dashboard states, an admin layer, notifications, and a simple billing path. A more complex SaaS can add deeper roles and permissions, AI features, external integrations, multi-step workflows, more operational tooling, and additional QA layers. Those examples are complexity bands only, not guaranteed totals. The more moving parts the product has, the more governed work it usually needs."
        ]
      },
      {
        heading: "Why scope affects credit usage",
        paragraphs: [
          "Scope is the biggest lever because it determines what work is actually being funded. If the MVP includes only the essential user path, credits are concentrated on the outcomes that matter most. If the product tries to include every nice-to-have feature from the start, the build spreads across more surfaces, more dependencies, more review paths, and more opportunities for rework.",
          "That is why scope before execution is not just process language. It is budget protection. A founder who knows what belongs in the first release can direct Build Credits toward the highest-value work. A founder who keeps changing the definition of MVP halfway through the build usually spends more credits chasing movement than securing maintainable progress."
        ]
      },
      {
        heading: "Roadmap-first planning protects credits",
        paragraphs: [
          "Roadmap-first planning protects credits because it keeps the team from building in the wrong order. When architecture is considered early, the project can make smarter decisions about auth, permissions, data relationships, and workflows before those choices become expensive to reverse. When approvals are explicit, the team is less likely to fund accidental drift.",
          "That is also why Neroa separates Build Credits from vague platform promises. The point is not to imply that software can be produced infinitely. The point is to show that credits are tied to governed execution, evidence and review, and a build path that respects maintainability. Founders do better when they buy clarity and approved progress, not the illusion of unlimited output."
        ]
      }
    ]
  },
  {
    slug: "prompting-is-not-product-strategy",
    title: "Prompting Is Not Product Strategy",
    summary:
      "A prompt can trigger output, but it cannot define a product by itself. Product strategy needs user truth, outcomes, workflows, architecture, monetization, approvals, and a sequence for what should happen before execution scales.",
    readTime: "8 min read",
    category: "Foundational article 04",
    bodySections: [
      {
        heading: "A prompt is an instruction, not a strategy",
        paragraphs: [
          "Typing build me an app is an instruction. It may produce screens, copy, or starter logic. What it does not do is decide which product should exist, what success means, or which tradeoffs the team is willing to accept. Strategy requires choices. Prompts often feel strategic because they are phrased in big terms, but big terms do not automatically create a coherent product direction.",
          "That gap matters because software teams often inherit the assumptions hidden inside a prompt without realizing it. A builder fills in missing details, and those details can look reasonable enough to keep moving. But if the assumptions were never reviewed, the project starts from borrowed logic instead of verified product truth."
        ]
      },
      {
        heading: "Product truth matters",
        paragraphs: [
          "Product truth means understanding who the user is, what outcome matters, and what problem is being solved first. It means knowing whether the product is for a solo operator, an internal team, an administrator, a customer account holder, or several roles that need different permissions and different experiences. Without that truth, a prompt tends to generate a generic answer to a very specific business problem.",
          "Real product truth also includes what should not be built yet. A team may be excited about dashboards, AI features, reporting, and automations, but the actual first release may need a simpler path that proves the core workflow. Strategy protects the project from adding noise before the core job is working well."
        ]
      },
      {
        heading: "Workflows, data, permissions, and monetization define the product",
        paragraphs: [
          "A useful SaaS product is shaped by its workflows. How does a user enter the system? What data must exist before the main action can happen? Which steps are required, optional, deferred, or admin-controlled? How are roles separated? Which permissions can alter records or trigger downstream actions? A prompt rarely resolves those details with the precision needed for a maintainable build.",
          "Monetization matters too. If the product has plans, gated functionality, approvals, or payments, those decisions affect architecture early. They influence the data model, the admin surface, customer messaging, error handling, and support operations. When strategy skips those topics, the team often discovers them only after visible work has already accumulated around weaker assumptions."
        ]
      },
      {
        heading: "Why unclear scope creates rebuilds",
        paragraphs: [
          "Unclear scope is one of the fastest ways to create rebuild loops. If nobody has confirmed what MVP includes, every stakeholder interprets progress differently. One person assumes analytics are part of the launch. Another assumes they are future scope. Someone adds team permissions because it seems prudent. Someone else removes them because the first release was meant to be single-user. The build keeps moving while the product keeps changing underneath it.",
          "That pattern burns time because the work being produced is not anchored to a stable definition. Even when the generated output looks polished, the team is spending energy on uncertainty. Rebuilds feel like momentum until the project has to unwind screens, flows, and code that should never have been treated as approved in the first place."
        ]
      },
      {
        heading: "Why approval checkpoints matter",
        paragraphs: [
          "Approval checkpoints matter because they distinguish thinking from commitment. A team should be able to explore without silently turning every exploration into durable product direction. When approvals are explicit, founders know what has been accepted, what still needs review, and what remains provisional. That makes discussions cleaner and prevents accidental drift from becoming hidden scope.",
          "Evidence and review reinforce the same discipline. The team can point to why a decision was made, how it connects to the roadmap, and whether the outcome still supports the original objective. Without those checkpoints, strategy becomes whatever the latest prompt happened to generate, and that is not a dependable way to build software meant to last."
        ]
      },
      {
        heading: "Neroa turns intent into roadmap-first execution",
        paragraphs: [
          "Neroa treats prompting as an input, not as the whole method. The aim is to capture intent, clarify the guided plan, define project scope, map the architecture, and create a roadmap before execution expands. That process gives the team a better foundation for decisions about auth, data model, permissions, payments, QA, and maintainability rather than hoping those concerns solve themselves later.",
          "Prompting can still be useful inside that structure. It helps express direction and accelerate exploration. But product strategy needs more than expression. It needs order, approvals, and governed execution. When intent becomes roadmap-first planning instead of open-ended generation, the project gains a more trustworthy path toward SaaS done right."
        ]
      }
    ]
  },
  {
    slug: "why-roadmap-first-building-saves-money",
    title: "Why Roadmap-First Building Saves Money",
    summary:
      "Most software waste comes from rework, not from careful planning. Roadmap-first building reduces rebuild loops by clarifying scope, sequencing architecture decisions, enforcing approvals, and keeping Build Credits pointed at governed progress instead of platform chaos.",
    readTime: "8 min read",
    category: "Foundational article 05",
    bodySections: [
      {
        heading: "Most wasted software spend comes from rework",
        paragraphs: [
          "Founders often assume money is wasted when a team moves too slowly. In reality, a large amount of software waste comes from moving quickly in the wrong direction and paying again to fix it later. Rework is expensive because it rarely affects only one file or one screen. It often changes flows, architecture, QA expectations, documentation, approvals, and customer-facing behavior all at once.",
          "That is why roadmap-first building saves money even before implementation begins. It reduces the chances that the team will spend meaningful effort on work that does not survive contact with real requirements. A clearer roadmap does not eliminate all change, but it makes change more intentional and less chaotic."
        ]
      },
      {
        heading: "Bad sequencing causes rebuilds",
        paragraphs: [
          "Bad sequencing is one of the quietest budget killers in software. A team builds dashboards before the data model is defined, adds roles before the auth path is clear, or starts a billing flow before plan logic and approval rules are settled. Each step may look productive in isolation. Together they create a stack of assumptions that becomes harder to undo with every new dependency.",
          "Roadmap-first planning improves sequencing by forcing the team to ask what must be true before the next layer is built. That helps architecture happen before late-stage patching, and it helps teams avoid the pattern of repeatedly remodeling the foundation after the visible parts of the house are already standing."
        ]
      },
      {
        heading: "Scope protects budget",
        paragraphs: [
          "Scope protects budget because it defines what the team is actually paying to achieve. Without clear scope, every request feels urgent and every nice-to-have feature competes with the core product path. The build expands, the review burden expands with it, and the project loses the ability to distinguish essential work from optional work.",
          "A defined project scope gives Build Credits a more useful job. Instead of feeding open-ended experimentation, they can support the specific work that moves the approved product forward. That makes forecasting calmer and reduces the chance that the team will discover too late that most of the budget was spent on activities that did not strengthen the MVP."
        ]
      },
      {
        heading: "Approval gates prevent accidental drift",
        paragraphs: [
          "Approval gates are a financial control as much as a product control. They stop the project from quietly drifting into a new definition every time someone has a fresh idea or sees a new competitor feature. Exploration still has value, but approved execution needs boundaries. Otherwise the team pays for constant interpretation instead of coordinated delivery.",
          "When approvals are built into the process, change becomes more honest. A founder can choose to widen scope, defer an idea, or revise the roadmap with eyes open. That is far better than discovering after the fact that the team effectively ran a different project from the one that was supposed to be funded."
        ]
      },
      {
        heading: "Evidence and review improve trust",
        paragraphs: [
          "Evidence and review save money because they reduce blind spots. If the team can see what changed, why it changed, and whether it was reviewed, problems are easier to catch while they are still cheap. That applies to copy, UX, logic, QA, and maintainability. Small issues become expensive when they travel too far without being seen clearly.",
          "Trust also affects decision speed. Founders make better calls when progress is visible and grounded in evidence rather than in confidence alone. That is part of structured software building: not just producing output, but producing output in a way that people can actually verify and approve."
        ]
      },
      {
        heading: "Clear roadmaps make Build Credits work better",
        paragraphs: [
          "Build Credits work better when the roadmap is clear because the project is no longer paying for confusion. Credits can be directed toward approved milestones, needed fixes, QA, and durable improvements instead of repeated resets. Managed credits benefit from the same clarity because guided execution still needs a stable definition of what success looks like.",
          "This is why Neroa charges for governed progress, not platform chaos. The goal is not to make planning feel heavy. The goal is to protect founders from expensive reorderings, missing architecture, late auth surprises, payment surprises, and rebuild loops that could have been reduced earlier. Roadmap-first building is ultimately about spending on progress that holds up after review, not just on movement that looks impressive for a week."
        ]
      }
    ]
  }
];

export function getStaticBlogPostSlugs() {
  return blogPosts.map((post) => post.slug);
}

export function getBlogPostRoute(slug: string) {
  return `${NEROA_BLOG_INDEX_PATH}/${slug}`;
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
