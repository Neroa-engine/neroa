# Lane Worktree Scaffold

This folder contains the lane/worktree scaffold for future isolated Neroa work.

Files:

- `lane-registry.json`
  - canonical lane list
  - branch names
  - worktree paths
  - ownership summaries
- `create-lane-worktrees.ps1`
  - creates the recommended lane worktrees from the protected base branch

Recommended usage:

```powershell
pwsh -File .\scripts\worktrees\create-lane-worktrees.ps1 -ListOnly
pwsh -File .\scripts\worktrees\create-lane-worktrees.ps1
pwsh -File .\scripts\worktrees\create-lane-worktrees.ps1 -IncludeOptional
```

Default worktree root:

- `../neroa-worktrees`

Default base ref:

- `origin/main`

If you run the scaffold from a temporary validation worktree instead of the
protected base checkout, the script uses the git common directory to resolve the
canonical repo root before it chooses the default worktree location.
