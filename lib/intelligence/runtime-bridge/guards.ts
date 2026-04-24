const DEFAULT_TRACE_LIMIT = 24;
const ENABLE_FLAG = "NEROA_ENABLE_START_SHADOW_INTELLIGENCE";
const TRACE_LIMIT_FLAG = "NEROA_START_SHADOW_TRACE_LIMIT";
const VISIBLE_ENABLE_FLAG = "NEROA_ENABLE_START_VISIBLE_INTELLIGENCE";

function parsePositiveInteger(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function isStartPlanningShadowEnabled() {
  return process.env[ENABLE_FLAG] === "1";
}

export function isStartVisibleIntelligenceEnabled() {
  return process.env[VISIBLE_ENABLE_FLAG] === "1";
}

export function getStartPlanningShadowTraceLimit() {
  return parsePositiveInteger(process.env[TRACE_LIMIT_FLAG]) ?? DEFAULT_TRACE_LIMIT;
}

export function getStartPlanningShadowGuardReason() {
  return isStartPlanningShadowEnabled()
    ? "Start planning shadow intelligence is enabled."
    : `Set ${ENABLE_FLAG}=1 to enable read-only Strategy Room shadow mirroring.`;
}

export function getStartVisibleIntelligenceGuardReason() {
  return isStartVisibleIntelligenceEnabled()
    ? "Start visible strategist intelligence is enabled."
    : `Set ${VISIBLE_ENABLE_FLAG}=1 to enable the controlled /start visible strategist switch.`;
}
