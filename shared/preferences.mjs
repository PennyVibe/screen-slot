import {
  DEFAULT_WINDOW_LAYOUT,
  normalizeWindowLayout,
} from "./screen-layout.mjs";

const WINDOW_LAYOUT_KEY = "windowLayout";
const PREFERRED_SCREEN_KEY = "preferredScreenKey";

export async function loadWindowLayout() {
  const stored = await chrome.storage.local.get(WINDOW_LAYOUT_KEY);
  return normalizeWindowLayout(stored[WINDOW_LAYOUT_KEY]);
}

export async function saveWindowLayout(layout) {
  const normalized = normalizeWindowLayout(layout);
  await chrome.storage.local.set({ [WINDOW_LAYOUT_KEY]: normalized });
  return normalized;
}

export async function resetWindowLayout() {
  await chrome.storage.local.remove(WINDOW_LAYOUT_KEY);
  return { ...DEFAULT_WINDOW_LAYOUT };
}

export async function loadPreferredScreenKey() {
  const stored = await chrome.storage.local.get(PREFERRED_SCREEN_KEY);
  if (typeof stored[PREFERRED_SCREEN_KEY] === "string") {
    return stored[PREFERRED_SCREEN_KEY];
  }

  const legacyValue = readLegacyPreference();
  if (typeof legacyValue !== "string") {
    return null;
  }

  await chrome.storage.local.set({ [PREFERRED_SCREEN_KEY]: legacyValue });
  removeLegacyPreference();
  return legacyValue;
}

export async function savePreferredScreenKey(screenKey) {
  await chrome.storage.local.set({ [PREFERRED_SCREEN_KEY]: screenKey });
  removeLegacyPreference();
}

function readLegacyPreference() {
  try {
    return globalThis.localStorage?.getItem(PREFERRED_SCREEN_KEY) ?? null;
  } catch {
    return null;
  }
}

function removeLegacyPreference() {
  try {
    globalThis.localStorage?.removeItem(PREFERRED_SCREEN_KEY);
  } catch {
    // Migration cleanup is best-effort; chrome.storage.local is authoritative.
  }
}
