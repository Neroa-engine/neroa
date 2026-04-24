import {
  type PublicLaunchIntent
} from "@/lib/data/public-launch";

const PUBLIC_ENTRY_INTENT_KEY = "neroa:public-entry-intent";

export function storePublicEntryIntent(intent: PublicLaunchIntent) {
  try {
    window.sessionStorage.setItem(PUBLIC_ENTRY_INTENT_KEY, intent);
  } catch {}
}

export function readPublicEntryIntent(): PublicLaunchIntent | null {
  try {
    const value = window.sessionStorage.getItem(PUBLIC_ENTRY_INTENT_KEY);
    return value === "managed" || value === "diy" ? value : null;
  } catch {
    return null;
  }
}

export function consumePublicEntryIntent(): PublicLaunchIntent | null {
  const value = readPublicEntryIntent();

  try {
    window.sessionStorage.removeItem(PUBLIC_ENTRY_INTENT_KEY);
  } catch {}

  return value;
}
