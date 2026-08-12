import { localizeDocument, t } from "../shared/i18n.mjs";
import {
  loadWindowLayout,
  resetWindowLayout,
  saveWindowLayout,
} from "../shared/preferences.mjs";
import { DEFAULT_WINDOW_LAYOUT } from "../shared/screen-layout.mjs";

localizeDocument();

const positionButtons = Array.from(
  document.querySelectorAll(".position-grid button"),
);
const widthInput = document.querySelector("#width-percent");
const heightInput = document.querySelector("#height-percent");
const widthValue = document.querySelector("#width-value");
const heightValue = document.querySelector("#height-value");
const windowPreview = document.querySelector("#window-preview");
const layoutSummary = document.querySelector("#layout-summary");
const saveButton = document.querySelector("#save-button");
const resetButton = document.querySelector("#reset-button");
const status = document.querySelector("#status");

const horizontalLabels = {
  left: t("horizontalLeft"),
  center: t("horizontalCenter"),
  right: t("horizontalRight"),
};
const verticalLabels = {
  top: t("verticalTop"),
  middle: t("verticalMiddle"),
  bottom: t("verticalBottom"),
};

let draftLayout = { ...DEFAULT_WINDOW_LAYOUT };

initialize();

for (const button of positionButtons) {
  button.addEventListener("click", () => {
    draftLayout.horizontal = button.dataset.horizontal;
    draftLayout.vertical = button.dataset.vertical;
    render();
    showStatus("");
  });
}

widthInput.addEventListener("input", () => {
  draftLayout.widthPercent = Number(widthInput.value);
  render();
  showStatus("");
});

heightInput.addEventListener("input", () => {
  draftLayout.heightPercent = Number(heightInput.value);
  render();
  showStatus("");
});

saveButton.addEventListener("click", async () => {
  setBusy(true);
  try {
    draftLayout = await saveWindowLayout(draftLayout);
    render();
    showStatus(t("settingsSavedStatus"));
  } catch (error) {
    showStatus(error?.message || t("errorSaveSettings"), true);
  } finally {
    setBusy(false);
  }
});

resetButton.addEventListener("click", async () => {
  setBusy(true);
  try {
    draftLayout = await resetWindowLayout();
    render();
    showStatus(t("defaultsRestoredStatus"));
  } catch (error) {
    showStatus(error?.message || t("errorResetSettings"), true);
  } finally {
    setBusy(false);
  }
});

async function initialize() {
  setBusy(true);
  try {
    draftLayout = await loadWindowLayout();
    render();
  } catch (error) {
    render();
    showStatus(error?.message || t("errorLoadSettings"), true);
  } finally {
    setBusy(false);
  }
}

function render() {
  widthInput.value = String(draftLayout.widthPercent);
  heightInput.value = String(draftLayout.heightPercent);
  widthValue.value = `${draftLayout.widthPercent}%`;
  heightValue.value = `${draftLayout.heightPercent}%`;

  for (const button of positionButtons) {
    const selected =
      button.dataset.horizontal === draftLayout.horizontal &&
      button.dataset.vertical === draftLayout.vertical;
    button.setAttribute("aria-pressed", String(selected));
  }

  renderPreview();
  layoutSummary.textContent = t("layoutSummary", [
    horizontalLabels[draftLayout.horizontal],
    verticalLabels[draftLayout.vertical],
    String(draftLayout.widthPercent),
    String(draftLayout.heightPercent),
  ]);
}

function renderPreview() {
  const horizontal = draftLayout.horizontal;
  const vertical = draftLayout.vertical;
  const transforms = [];

  windowPreview.style.width = `${draftLayout.widthPercent}%`;
  windowPreview.style.height = `${draftLayout.heightPercent}%`;
  windowPreview.style.left = "";
  windowPreview.style.right = "";
  windowPreview.style.top = "";
  windowPreview.style.bottom = "";

  if (horizontal === "left") {
    windowPreview.style.left = "0";
  } else if (horizontal === "right") {
    windowPreview.style.right = "0";
  } else {
    windowPreview.style.left = "50%";
    transforms.push("translateX(-50%)");
  }

  if (vertical === "top") {
    windowPreview.style.top = "0";
  } else if (vertical === "bottom") {
    windowPreview.style.bottom = "0";
  } else {
    windowPreview.style.top = "50%";
    transforms.push("translateY(-50%)");
  }

  windowPreview.style.transform = transforms.join(" ");
}

function setBusy(busy) {
  saveButton.disabled = busy;
  resetButton.disabled = busy;
}

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}
