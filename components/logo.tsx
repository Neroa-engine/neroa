import NeroaLogo from "@/components/brand/neroa-logo";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <NeroaLogo className="h-10 w-auto" />
      <div>
        <p className="text-sm font-medium text-white/90">Neroa</p>
        <p className="text-xs text-white/55">AI workspaces for focused teams</p>
      </div>
    </div>
  );
}
