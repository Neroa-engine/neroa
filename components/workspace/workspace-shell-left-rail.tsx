import Link from "next/link";
import NaruaCore from "@/components/ai/NaruaCore";

type WorkspaceShellThread = {
  messages: Array<{ id: string; role: string; content: string }>;
  draft: string;
  setDraft: (value: string) => void;
  handleSend: () => void;
};

type WorkspaceShellLeftRailProps = {
  projectTitle: string;
  thread: WorkspaceShellThread;
};

export function WorkspaceShellLeftRail({
  projectTitle,
  thread
}: WorkspaceShellLeftRailProps) {
  return (
        <aside className="thin-scrollbar border-b border-slate-200/70 px-6 py-6 xl:overflow-y-auto xl:border-b-0 xl:border-r xl:px-7 xl:py-8">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Neroa control
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {projectTitle}
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Ask Neroa what matters next, what feels unclear, or when you want a person to step in.
              </p>
            </div>

            <NaruaCore className="w-full" />

            <div className="floating-plane rounded-[30px] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Help and support
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use this same conversation for strategy guidance, roadmap clarification, build
                help, blockers, or when you want human support.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    thread.setDraft("I do not understand the next step yet. Can you walk me through it?")
                  }
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-[11px] text-slate-600 transition hover:bg-white"
                >
                  Ask for guidance
                </button>
                <button
                  type="button"
                  onClick={() => thread.setDraft("Can I talk to a person about this?")}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-[11px] text-slate-600 transition hover:bg-white"
                >
                  Ask for a person
                </button>
                <Link href="/contact?type=support" className="button-secondary">
                  Contact support
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {thread.messages.slice(-4).map((message) => (
                <div
                  key={message.id}
                  className={`rounded-[26px] px-4 py-4 ${
                    message.role === "narua"
                      ? "floating-plane"
                      : "bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(96,165,250,0.14),rgba(139,92,246,0.12))] shadow-[0_24px_60px_rgba(56,189,248,0.08)]"
                  }`}
                >
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${message.role === "narua" ? "text-cyan-700" : "text-slate-500"}`}>
                    {message.role === "narua" ? "Neroa" : "You"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{message.content}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {[
                "Give me the next best lane to open.",
                "Summarize the current engine state.",
                "I do not understand the roadmap yet.",
                "Where is the biggest execution risk right now?",
                "Can I talk to a person about this?"
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => thread.setDraft(prompt)}
                  className="micro-glow w-full border-b border-slate-200/70 pb-3 text-left text-sm leading-6 text-slate-600 last:border-b-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="floating-plane rounded-[30px] p-4">
              <textarea
                value={thread.draft}
                onChange={(event) => thread.setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    thread.handleSend();
                  }
                }}
                placeholder="Ask about strategy, next steps, blockers, or support..."
                className="input min-h-[110px] w-full resize-none"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Overview guidance can clarify the plan, help when something is not working, or route you to support without changing lane outputs.
                </span>
                <button
                  type="button"
                  onClick={() => thread.handleSend()}
                  disabled={!thread.draft.trim()}
                  className="button-primary disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </aside>

  );
}

