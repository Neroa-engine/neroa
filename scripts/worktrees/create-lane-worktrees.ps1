[CmdletBinding()]
param(
  [string]$BaseRef = "origin/main",
  [string]$WorktreeRoot = "",
  [switch]$IncludeOptional,
  [switch]$ListOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$git = "C:\Users\Administrator\AppData\Local\GitHubDesktop\app-3.5.8\resources\app\git\cmd\git.exe"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptRoot "..\..")).Path
$registryPath = Join-Path $scriptRoot "lane-registry.json"

if (!(Test-Path -LiteralPath $git)) {
  throw "Git binary was not found at $git"
}

if (!(Test-Path -LiteralPath $registryPath)) {
  throw "Lane registry not found at $registryPath"
}

$registry = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json
$gitCommonDir = (& $git -C $repoRoot rev-parse --path-format=absolute --git-common-dir).Trim()

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($gitCommonDir)) {
  throw "Unable to resolve the git common directory for $repoRoot"
}

$canonicalRepoRoot = Split-Path -Parent $gitCommonDir

if ([string]::IsNullOrWhiteSpace($WorktreeRoot)) {
  $repoParent = Split-Path -Parent $canonicalRepoRoot
  $WorktreeRoot = Join-Path $repoParent "neroa-worktrees"
}

$selectedLanes = @(
  $registry.lanes | Where-Object {
    $_.required -or $IncludeOptional.IsPresent
  }
)

if ($selectedLanes.Count -eq 0) {
  throw "No lanes were selected from lane-registry.json"
}

New-Item -ItemType Directory -Force -Path $WorktreeRoot | Out-Null

foreach ($lane in $selectedLanes) {
  $targetPath = Join-Path $WorktreeRoot $lane.worktree
  $branchName = [string]$lane.branch
  $laneId = [string]$lane.id

  if ($ListOnly) {
    Write-Host "[plan] $laneId -> $targetPath ($branchName from $BaseRef)"
    continue
  }

  if (Test-Path -LiteralPath $targetPath) {
    Write-Host "[skip] $laneId already exists at $targetPath"
    continue
  }

  & $git -C $canonicalRepoRoot show-ref --verify --quiet "refs/heads/$branchName"
  $branchExists = $LASTEXITCODE -eq 0

  if ($branchExists) {
    Write-Host "[create] $laneId -> existing branch $branchName"
    & $git -C $canonicalRepoRoot worktree add $targetPath $branchName
  } else {
    Write-Host "[create] $laneId -> new branch $branchName from $BaseRef"
    & $git -C $canonicalRepoRoot worktree add -b $branchName $targetPath $BaseRef
  }

  if ($LASTEXITCODE -ne 0) {
    throw "Failed to create worktree for $laneId"
  }
}

Write-Host "Lane worktree scaffold completed."
