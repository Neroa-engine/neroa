import { createWorkspace } from "@/app/dashboard/actions";
import { APP_ROUTES } from "@/lib/routes";

export function WorkspaceCreateForm({
  errorPath = APP_ROUTES.projectsNew
}: {
  errorPath?: string;
}) {
  return (
    <form action={createWorkspace} className="space-y-4">
      <input type="hidden" name="errorPath" value={errorPath} />
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Project name</span>
        <input
          className="input"
          name="name"
          placeholder="Customer analytics launch"
          required
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Project summary</span>
        <textarea
          className="input min-h-28 resize-none"
          name="description"
          placeholder="What are you building, who is it for, and what should Neroa help shape next?"
        />
      </label>
      <button className="button-primary w-full" type="submit">
        Create project
      </button>
    </form>
  );
}
