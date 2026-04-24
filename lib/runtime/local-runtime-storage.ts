const localRuntimeStorageOverride = process.env.NEROA_LOCAL_RUNTIME_STORAGE
  ?.trim()
  .toLowerCase();

function cwdLooksLikeReadonlyServerlessRuntime() {
  const currentWorkingDirectory = process.cwd().replace(/\\/g, "/");

  return (
    currentWorkingDirectory === "/var/task" ||
    currentWorkingDirectory.startsWith("/var/task/")
  );
}

export function isLocalRuntimeStorageEnabled() {
  if (
    localRuntimeStorageOverride === "enabled" ||
    localRuntimeStorageOverride === "true" ||
    localRuntimeStorageOverride === "1"
  ) {
    return true;
  }

  if (
    localRuntimeStorageOverride === "disabled" ||
    localRuntimeStorageOverride === "false" ||
    localRuntimeStorageOverride === "0"
  ) {
    return false;
  }

  return !(
    process.env.VERCEL === "1" ||
    Boolean(process.env.VERCEL_ENV) ||
    cwdLooksLikeReadonlyServerlessRuntime()
  );
}

export class LocalRuntimeStorageUnavailableError extends Error {
  constructor(scope = "Local runtime storage") {
    super(
      `${scope} is unavailable in this deployed environment. Neroa keeps Live View, Command Center browser runtime storage, and local QC disk writes disabled on Vercel/serverless deployments. Use localhost or another persistent runtime to enable them.`
    );
    this.name = "LocalRuntimeStorageUnavailableError";
  }
}

export function createLocalRuntimeStorageUnavailableError(scope?: string) {
  return new LocalRuntimeStorageUnavailableError(scope);
}

export function assertLocalRuntimeStorageEnabled(scope?: string) {
  if (!isLocalRuntimeStorageEnabled()) {
    throw createLocalRuntimeStorageUnavailableError(scope);
  }
}

export function isLocalRuntimeStorageUnavailableError(
  error: unknown
): error is LocalRuntimeStorageUnavailableError {
  return (
    error instanceof LocalRuntimeStorageUnavailableError ||
    (error instanceof Error &&
      error.name === "LocalRuntimeStorageUnavailableError")
  );
}

export function resolveLocalRuntimeStorageStatusCode(
  error: unknown,
  fallbackStatus = 400
) {
  return isLocalRuntimeStorageUnavailableError(error) ? 503 : fallbackStatus;
}
