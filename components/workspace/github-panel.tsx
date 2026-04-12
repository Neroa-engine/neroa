"use client";

import { useState } from "react";

type RepoEntry = {
  name: string;
  path: string;
  type: string;
  size: number | null;
  sha: string;
  url: string | null;
};

type FilePayload = {
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string;
};

type LoadedFolder = {
  entries: RepoEntry[];
  expanded: boolean;
};

function sortEntries(entries: RepoEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }

    return a.type === "dir" ? -1 : 1;
  });
}

export default function GitHubPanel() {
  const [owner, setOwner] = useState("vercel");
  const [repo, setRepo] = useState("next.js");
  const [pathInput, setPathInput] = useState("README.md");
  const [entries, setEntries] = useState<RepoEntry[]>([]);
  const [folders, setFolders] = useState<Record<string, LoadedFolder>>({});
  const [selectedPath, setSelectedPath] = useState("");
  const [file, setFile] = useState<FilePayload | null>(null);
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [error, setError] = useState("");

  async function loadRoot() {
    setLoadingRepo(true);
    setError("");
    setFile(null);
    setSelectedPath("");
    setFolders({});

    try {
      const response = await fetch("/api/github/repo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          owner,
          repo
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Unable to load repository.");
      }

      setEntries(sortEntries(data.contents ?? []));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load repository.");
    } finally {
      setLoadingRepo(false);
    }
  }

  async function loadFile(targetPath: string) {
    setLoadingFile(true);
    setError("");
    setSelectedPath(targetPath);

    try {
      const response = await fetch("/api/github/file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          owner,
          repo,
          path: targetPath
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Unable to load file.");
      }

      setFile(data.file);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load file.");
    } finally {
      setLoadingFile(false);
    }
  }

  async function toggleFolder(entry: RepoEntry) {
    const existing = folders[entry.path];

    if (existing) {
      setFolders((current) => ({
        ...current,
        [entry.path]: {
          ...existing,
          expanded: !existing.expanded
        }
      }));
      return;
    }

    setError("");

    try {
      const response = await fetch("/api/github/repo/contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          owner,
          repo,
          path: entry.path,
          branch: ""
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Unable to load folder.");
      }

      setFolders((current) => ({
        ...current,
        [entry.path]: {
          entries: sortEntries(data.contents ?? []),
          expanded: true
        }
      }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load folder.");
    }
  }

  function RepoNode({
    entry,
    level = 0
  }: {
    entry: RepoEntry;
    level?: number;
  }) {
    const folder = folders[entry.path];
    const isFolder = entry.type === "dir";
    const isSelected = selectedPath === entry.path;

    return (
      <div>
        <button
          type="button"
          onClick={() => (isFolder ? toggleFolder(entry) : loadFile(entry.path))}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
            isSelected
              ? "bg-neutral-800 text-white"
              : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <span className="w-4 text-xs text-neutral-500">{isFolder ? (folder?.expanded ? "-" : "+") : ""}</span>
          <span className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
            {isFolder ? "DIR" : "FILE"}
          </span>
          <span className="truncate text-sm">{entry.name}</span>
        </button>

        {isFolder && folder?.expanded ? (
          <div className="space-y-1">
            {folder.entries.map((child) => (
              <RepoNode key={child.path} entry={child} level={level + 1} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-neutral-900 text-white">
      <div className="border-b border-neutral-800 px-5 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
              GitHub workspace
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Repository browser</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Browse files on the left and inspect file content on the right.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <input
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              placeholder="owner"
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500"
            />
            <input
              value={repo}
              onChange={(event) => setRepo(event.target.value)}
              placeholder="repo"
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500"
            />
            <input
              value={pathInput}
              onChange={(event) => setPathInput(event.target.value)}
              placeholder="optional file path"
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500"
            />
            <button
              type="button"
              onClick={async () => {
                await loadRoot();
                if (pathInput.trim()) {
                  await loadFile(pathInput.trim());
                }
              }}
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950"
            >
              {loadingRepo ? "Loading..." : "Load repo"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-900 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        <div className="w-1/3 min-w-[280px] overflow-auto border-r border-neutral-800 bg-neutral-950 px-3 py-3">
          {loadingRepo ? (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              Loading repository...
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-1">
              {entries.map((entry) => (
                <RepoNode key={entry.path} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div className="max-w-[18rem]">
                <p className="text-base font-medium text-white">Open a repository</p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Enter an owner and repo, then load the tree to start browsing files.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto bg-neutral-900 px-5 py-4">
          {loadingFile ? (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              Loading file...
            </div>
          ) : file ? (
            <div className="flex min-h-full flex-col">
              <div className="border-b border-neutral-800 pb-4">
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  {file.path}
                </p>
              </div>

              <pre className="mt-4 overflow-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-sm leading-7 text-neutral-100">
                <code>{file.content}</code>
              </pre>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div className="max-w-[22rem]">
                <p className="text-base font-medium text-white">File viewer</p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Select a file from the repo tree to view its contents here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
