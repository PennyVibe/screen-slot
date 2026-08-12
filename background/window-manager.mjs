import { t } from "../shared/i18n.mjs";

export async function moveTabToScreen(tabId, bounds, chromeApi = chrome) {
  if (!Number.isInteger(tabId)) {
    throw new Error(t("errorInvalidTabId"));
  }

  validateBounds(bounds);
  const tab = await chromeApi.tabs.get(tabId);

  const newWindow = await chromeApi.windows.create({
    tabId,
    type: "normal",
    incognito: tab.incognito,
    focused: true,
    ...bounds,
  });

  if (typeof newWindow?.id !== "number") {
    throw new Error(t("errorWindowCreationFailed"));
  }

  // Some window managers initially apply a cascade position during creation.
  // Reapplying the bounds after creation makes the requested placement robust.
  await chromeApi.windows.update(newWindow.id, {
    focused: true,
    ...bounds,
  });

  return newWindow.id;
}

export function validateBounds(bounds) {
  const keys = ["left", "top", "width", "height"];
  if (!bounds || keys.some((key) => !Number.isInteger(bounds[key]))) {
    throw new Error(t("errorInvalidWindowBounds"));
  }

  if (bounds.width <= 0 || bounds.height <= 0) {
    throw new Error(t("errorInvalidWindowSize"));
  }
}
