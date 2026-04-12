import { createWorkspace } from "@/app/dashboard/actions";

export function WorkspaceCreateForm() {
  return (
    <form action={createWorkspace} className="space-y-4">
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">NeuroEngine Name</span>
        <input className="input" name="name" placeholder="Customer Success Engine" required />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">NeuroEngine Description</span>
        <textarea
          className="input min-h-28 resize-none"
          name="description"
          placeholder="What should this NeuroEngine help execute?"
        />
      </label>
      <button className="button-primary w-full" type="submit">
        Launch a NeuroEngine
      </button>
    </form>
  );
}
