import type { NaruaMessage } from "@/lib/narua/planning";

export function createStrategyLaneMessage(role: NaruaMessage["role"], content: string): NaruaMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content
  };
}

export function appendUniqueTop(items: string[], item: string, maxItems = 4) {
  return [item, ...items.filter((value) => value !== item)].slice(0, maxItems);
}

export function truncateStrategySupportText(value: string, maxLength = 180) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

export function trimStrategySupportTail(value: string) {
  return value.replace(/[.!?]+$/g, "").trim();
}
