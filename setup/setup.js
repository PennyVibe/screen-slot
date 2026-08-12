import {
  getScreenKey,
  getTargetScreens,
} from "../shared/display-select.mjs";
import { populateScreenSelect } from "../shared/display-ui.mjs";
import { localizeDocument, t } from "../shared/i18n.mjs";
import { requestTabMove } from "../shared/move-tab.mjs";
import {
  loadWindowLayout,
  savePreferredScreenKey,
} from "../shared/preferences.mjs";
import { getWindowBounds } from "../shared/screen-layout.mjs";

localizeDocument();

const authorizeButton = document.querySelector("#authorize-button");
const permissionSettingsButton = document.querySelector("#permission-settings-button");
const layoutSettingsButton = document.querySelector("#layout-settings-button");
const screenField = document.querySelector("#screen-field");
const screenSelect = document.querySelector("#screen-select");
const status = document.querySelector("#status");

const tabIdParam = new URLSearchParams(location.search).get("tabId");
const tabId = tabIdParam === null ? Number.NaN : Number(tabIdParam);
let availableTargets = [];

if (!("getScreenDetails" in window)) {
  authorizeButton.disabled = true;
  showStatus(t("errorUnsupportedWindowManagementApi"), true);
} else if (!Number.isInteger(tabId)) {
  authorizeButton.disabled = true;
  showStatus(t("errorNoTargetTab"), true);
}

authorizeButton.addEventListener("click", async () => {
  setBusy(true);
  showStatus(t("permissionPromptStatus"));

  try {
    // This must be the first privileged call in the click handler so Chrome
    // sees a transient user activation and can present its permission prompt.
    const screenDetails = await window.getScreenDetails();
    availableTargets = getTargetScreens(screenDetails);

    if (availableTargets.length === 0) {
      showStatus(t("errorNoSecondDisplay"), true);
      return;
    }

    permissionSettingsButton.hidden = true;

    if (availableTargets.length > 1 && screenField.hidden) {
      populateScreenSelect(
        screenSelect,
        availableTargets,
        screenDetails.currentScreen,
      );
      screenField.hidden = false;
      authorizeButton.textContent = t("sendSelectedDisplayButton");
      showStatus(t("permissionGrantedChooseDisplayStatus"), false);
      return;
    }

    const targetIndex = screenField.hidden ? 0 : Number(screenSelect.value);
    const targetScreen = availableTargets[targetIndex];
    if (!targetScreen) {
      throw new Error(t("errorSelectedDisplayUnavailableRefresh"));
    }

    await savePreferredScreenKey(getScreenKey(targetScreen));

    const windowLayout = await loadWindowLayout();
    await requestTabMove(tabId, getWindowBounds(targetScreen, windowLayout));

    const setupTab = await chrome.tabs.getCurrent();
    if (typeof setupTab?.id === "number") {
      await chrome.tabs.remove(setupTab.id);
    }
  } catch (error) {
    if (error?.name === "NotAllowedError") {
      permissionSettingsButton.hidden = false;
      showStatus(t("errorPermissionDenied"), true);
    } else {
      showStatus(error?.message || t("errorGeneric"), true);
    }
  } finally {
    setBusy(false);
  }
});

permissionSettingsButton.addEventListener("click", async () => {
  try {
    await chrome.tabs.create({
      url: "chrome://settings/content/windowManagement",
      active: true,
    });
  } catch {
    showStatus(t("errorOpenPermissionSettings"), true);
  }
});

layoutSettingsButton.addEventListener("click", async () => {
  await chrome.runtime.openOptionsPage();
});

function setBusy(busy) {
  authorizeButton.disabled = busy;
  screenSelect.disabled = busy;
}

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}
