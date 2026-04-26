import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolveExtensionlessCandidate(requestedPath) {
  const candidates = [
    `${requestedPath}.ts`,
    `${requestedPath}.tsx`,
    `${requestedPath}.js`,
    `${requestedPath}.mjs`,
    path.join(requestedPath, "index.ts"),
    path.join(requestedPath, "index.tsx"),
    path.join(requestedPath, "index.js"),
    path.join(requestedPath, "index.mjs")
  ];

  return (
    candidates.find((candidate) => {
      if (!existsSync(candidate)) {
        return false;
      }

      return statSync(candidate).isFile();
    }) ?? null
  );
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const resolvedPath = resolveExtensionlessCandidate(
      path.join(rootDir, specifier.slice(2).replaceAll("/", path.sep))
    );

    if (resolvedPath) {
      return nextResolve(pathToFileURL(resolvedPath).href, context);
    }
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !path.extname(specifier)
  ) {
    const parentPath = context.parentURL
      ? path.dirname(fileURLToPath(context.parentURL))
      : rootDir;
    const resolvedPath = resolveExtensionlessCandidate(
      path.resolve(parentPath, specifier)
    );

    if (resolvedPath) {
      return nextResolve(pathToFileURL(resolvedPath).href, context);
    }
  }

  return nextResolve(specifier, context);
}
