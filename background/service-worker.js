import { MOVE_TAB_TO_SCREEN } from "../shared/move-tab.mjs";
import { moveTabToScreen } from "./window-manager.mjs";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== MOVE_TAB_TO_SCREEN) {
    return false;
  }

  moveTabToScreen(message.tabId, message.bounds)
    .then((windowId) => sendResponse({ ok: true, windowId }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  // Keep the response channel open while the new window is created. This
  // service worker survives even when moving the only tab closes its old window.
  return true;
});
