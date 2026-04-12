type GitHubError = Error & {
  status?: number;
  owner?: string;
  repo?: string;
  path?: string;
};

function createGitHubError(
  message: string,
  status: number,
  meta?: { owner?: string; repo?: string; path?: string }
) {
  const error = new Error(message) as GitHubError;
  error.status = status;
  error.owner = meta?.owner;
  error.repo = meta?.repo;
  error.path = meta?.path;
  return error;
}

function getGitHubHeaders(includeAuth: boolean) {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "neroa-github-integration"
  };

  if (includeAuth) {
    if (!process.env.GITHUB_TOKEN) {
      throw createGitHubError("Missing GITHUB_TOKEN", 500);
    }

    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHubJson(url: string, includeAuth: boolean) {
  console.log("GITHUB_REQUEST_URL", url);

  const response = await fetch(url, {
    method: "GET",
    headers: getGitHubHeaders(includeAuth),
    cache: "no-store"
  });

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

function buildRepoUrl(owner: string, repo: string) {
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

function buildContentsUrl(owner: string, repo: string, path = "") {
  const encodedPath = path
    ? `/${path.split("/").map((segment) => encodeURIComponent(segment)).join("/")}`
    : "";

  return `${buildRepoUrl(owner, repo)}/contents${encodedPath}`;
}

function getErrorMessage(data: unknown, fallback: string) {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (typeof data === "string" && data) {
    return data;
  }

  return fallback;
}

export async function getRepo(owner: string, repo: string) {
  const url = buildRepoUrl(owner, repo);
  const primary = await fetchGitHubJson(url, Boolean(process.env.GITHUB_TOKEN));

  if (!primary.ok) {
    throw createGitHubError(getErrorMessage(primary.data, "GitHub repo fetch failed"), primary.status, {
      owner,
      repo
    });
  }

  const data = primary.data as {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    default_branch: string;
    description: string | null;
    html_url: string;
  };

  return {
    id: data.id,
    name: data.name,
    fullName: data.full_name,
    private: data.private,
    defaultBranch: data.default_branch,
    description: data.description,
    htmlUrl: data.html_url
  };
}

export async function getRepoContents(owner: string, repo: string, path = "") {
  const url = buildContentsUrl(owner, repo, path);
  const primary = await fetchGitHubJson(url, Boolean(process.env.GITHUB_TOKEN));

  if (!primary.ok) {
    throw createGitHubError(getErrorMessage(primary.data, "GitHub contents fetch failed"), primary.status, {
      owner,
      repo,
      path
    });
  }

  const items = Array.isArray(primary.data) ? primary.data : [primary.data];

  return items.map((item) => {
    const typed = item as {
      name: string;
      path: string;
      type: string;
      size?: number;
      sha: string;
      html_url?: string | null;
    };

    return {
      name: typed.name,
      path: typed.path,
      type: typed.type,
      size: typeof typed.size === "number" ? typed.size : null,
      sha: typed.sha,
      url: typed.html_url ?? null
    };
  });
}

export async function getGitHubFileContent(owner: string, repo: string, path: string) {
  console.log("GITHUB_GET_FILE_CONTENT", { owner, repo, path });

  const url = buildContentsUrl(owner, repo, path);
  const attempts = process.env.GITHUB_TOKEN ? [true, false] : [false];
  let lastStatus = 500;
  let lastMessage = "GitHub file fetch failed";

  for (const includeAuth of attempts) {
    const result = await fetchGitHubJson(url, includeAuth);

    if (result.ok) {
      if (!result.data || Array.isArray(result.data)) {
        throw createGitHubError("GitHub response is not a file", 400, { owner, repo, path });
      }

      const data = result.data as {
        name: string;
        path: string;
        sha: string;
        size: number;
        type: string;
        encoding?: string | null;
        content?: string | null;
      };

      if (data.type !== "file") {
        throw createGitHubError("GitHub response is not a file", 400, { owner, repo, path });
      }

      const content =
        data.encoding === "base64" && typeof data.content === "string"
          ? Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8")
          : data.content ?? "";

      return {
        owner,
        repo,
        path,
        file: {
          name: data.name,
          path: data.path,
          sha: data.sha,
          size: data.size,
          content
        }
      };
    }

    lastStatus = result.status;
    lastMessage = getErrorMessage(result.data, "GitHub file fetch failed");

    if (!includeAuth || (result.status !== 403 && result.status !== 404)) {
      break;
    }
  }

  throw createGitHubError(lastMessage, lastStatus, { owner, repo, path });
}
