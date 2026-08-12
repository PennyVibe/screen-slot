import {
  getScreenKey,
  getTargetScreens,
} from "../shared/display-select.mjs";
import { populateScreenSelect } from "../shared/display-ui.mjs";
import { localizeDocument, t } from "../shared/i18n.mjs";
import { requestTabMove } from "../shared/move-tab.mjs";
import {
  loadPreferredScreenKey,
  loadWindowLayout,
  savePreferredScreenKey,
} from "../shared/preferences.mjs";
import { getWindowBounds } from "../shared/screen-layout.mjs";

localizeDocument();

const moveButton = document.querySelector("#move-button");
const layoutSettingsButton = document.querySelector("#layout-settings-button");
const screenField = document.querySelector("#screen-field");
const screenSelect = document.querySelector("#screen-select");
const status = document.querySelector("#status");

let availableTargets = [];
let operationRunning = false;

if (!("getScreenDetails" in window)) {
  moveButton.disabled = true;
  showStatus(t("errorUnsupportedWindowManagement"), true);
} else {
  initialize();
}

moveButton.addEventListener("click", () => moveCurrentTab());
layoutSettingsButton.addEventListener("click", async () => {
  await chrome.runtime.openOptionsPage();
  window.close();
});

async function initialize() {
  setBusy(true);
  showStatus(t("checkingPermissionStatus"));

  const permissionState = await getWindowManagementPermissionState();
  setBusy(false);

  if (permissionState === "granted") {
    await moveCurrentTab(true);
  } else {
    showStatus("");
  }
}

async function moveCurrentTab(permissionAlreadyGranted = false) {
  if (operationRunning) {
    return;
  }

  operationRunning = true;
  setBusy(true);
  showStatus(t("checkingPermissionStatus"));

  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (typeof activeTab?.id !== "number") {
      throw new Error(t("errorUnableToDetermineActiveTab"));
    }

    const permissionState = permissionAlreadyGranted
      ? "granted"
      : await getWindowManagementPermissionState();
    if (permissionState !== "granted") {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`setup/setup.html?tabId=${activeTab.id}`),
        active: true,
      });
      window.close();
      return;
    }

    showStatus(t("readingDisplaysStatus"));
    const screenDetails = await window.getScreenDetails();
    availableTargets = getTargetScreens(screenDetails);

    if (availableTargets.length === 0) {
      showStatus(t("errorNoSecondDisplay"), true);
      return;
    }

    const targetIndex = await getTargetIndex(screenDetails.currentScreen);
    if (targetIndex === null) {
      return;
    }

    const targetScreen = availableTargets[targetIndex];
    if (!targetScreen) {
      throw new Error(t("errorSelectedDisplayUnavailableReopen"));
    }

    await savePreferredScreenKey(getScreenKey(targetScreen));

    const windowLayout = await loadWindowLayout();
    const bounds = getWindowBounds(targetScreen, windowLayout);
    await requestTabMove(activeTab.id, bounds);

    window.close();
  } catch (error) {
    showStatus(toUserMessage(error), true);
  } finally {
    operationRunning = false;
    setBusy(false);
  }
}

async function getTargetIndex(currentScreen) {
  if (availableTargets.length === 1) {
    return 0;
  }

  if (!screenField.hidden) {
    return Number(screenSelect.value);
  }

  const preferredKey = await loadPreferredScreenKey();
  const preferredIndex = availableTargets.findIndex(
    (screen) => getScreenKey(screen) === preferredKey,
  );
  if (preferredIndex >= 0) {
    return preferredIndex;
  }

  populateScreenSelect(screenSelect, availableTargets, currentScreen);
  screenField.hidden = false;
  moveButton.textContent = t("sendSelectedDisplayButton");
  showStatus(t("multipleDisplaysStatus"), false);
  return null;
}

function setBusy(busy) {
  moveButton.disabled = busy;
  screenSelect.disabled = busy;
}

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function toUserMessage(error) {
  if (error?.name === "NotAllowedError") {
    return t("errorPermissionUnavailable");
  }

  return error?.message || t("errorGeneric");
}

async function getWindowManagementPermissionState() {
  try {
    const permission = await navigator.permissions.query({
      name: "window-management",
    });
    return permission.state;
  } catch {
    return "unknown";
  }
}
