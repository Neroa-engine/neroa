import { getStartPlanningShadowTraceLimit } from "./guards";
import type { StartShadowSessionRecord } from "./types";

interface StartPlanningShadowStore {
  sessions: Map<string, StartShadowSessionRecord>;
}

declare global {
  var __neroaStartPlanningShadowStore__: StartPlanningShadowStore | undefined;
}

function getStore() {
  if (!globalThis.__neroaStartPlanningShadowStore__) {
    globalThis.__neroaStartPlanningShadowStore__ = {
      sessions: new Map<string, StartShadowSessionRecord>()
    };
  }

  return globalThis.__neroaStartPlanningShadowStore__;
}

export function getStartPlanningShadowSession(threadId: string) {
  return getStore().sessions.get(threadId) ?? null;
}

export function setStartPlanningShadowSession(record: StartShadowSessionRecord) {
  const traceLimit = getStartPlanningShadowTraceLimit();
  const trimmedTraces = record.traces.slice(-traceLimit);
  const nextRecord = {
    ...record,
    latestTrace: trimmedTraces.at(-1) ?? null,
    traces: trimmedTraces
  } satisfies StartShadowSessionRecord;

  getStore().sessions.set(record.threadId, nextRecord);
  return nextRecord;
}

export function listStartPlanningShadowSessions() {
  return [...getStore().sessions.values()];
}

export function clearStartPlanningShadowSession(threadId: string) {
  getStore().sessions.delete(threadId);
}

export function clearStartPlanningShadowStore() {
  getStore().sessions.clear();
}
