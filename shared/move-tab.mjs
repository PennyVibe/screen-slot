import { t } from "./i18n.mjs";

export const MOVE_TAB_TO_SCREEN = "MOVE_TAB_TO_SCREEN";

export async function requestTabMove(tabId, bounds) {
  const result = await chrome.runtime.sendMessage({
    type: MOVE_TAB_TO_SCREEN,
    tabId,
    bounds,
  });

  if (!result?.ok) {
    throw new Error(result?.error || t("errorBackgroundMoveFailed"));
  }

  return result.windowId;
}
