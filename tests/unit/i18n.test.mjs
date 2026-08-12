import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { localizeDocument, t } from "../../shared/i18n.mjs";

const projectRoot = new URL("../../", import.meta.url);
const localeNames = ["zh_CN", "en"];

async function readProjectFile(path) {
  return readFile(new URL(path, projectRoot), "utf8");
}

async function readMessages(locale) {
  return JSON.parse(await readProjectFile(`_locales/${locale}/messages.json`));
}

test("Chinese and English locales define the same message keys", async () => {
  const [chinese, english] = await Promise.all(localeNames.map(readMessages));

  assert.deepEqual(Object.keys(english).sort(), Object.keys(chinese).sort());
});

test("every referenced localization message exists in both locales", async () => {
  const sourcePaths = [
    "manifest.json",
    "background/window-manager.mjs",
    "popup/popup.html",
    "popup/popup.js",
    "setup/setup.html",
    "setup/setup.js",
    "options/options.html",
    "options/options.js",
    "shared/display-ui.mjs",
    "shared/move-tab.mjs",
  ];
  const sources = await Promise.all(sourcePaths.map(readProjectFile));
  const referencedKeys = new Set();

  for (const source of sources) {
    for (const match of source.matchAll(/__MSG_([A-Za-z0-9_]+)__/g)) {
      referencedKeys.add(match[1]);
    }
    for (const match of source.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) {
      referencedKeys.add(match[1]);
    }
    for (const match of source.matchAll(/\b(?:t|message)\("([^"]+)"/g)) {
      referencedKeys.add(match[1]);
    }
  }

  for (const locale of localeNames) {
    const messages = await readMessages(locale);
    const missingKeys = [...referencedKeys].filter((key) => !(key in messages));
    assert.deepEqual(missingKeys, [], `${locale} is missing localization messages`);
  }
});

test("the English locale does not contain Chinese text", async () => {
  const englishSource = await readProjectFile("_locales/en/messages.json");
  assert.doesNotMatch(englishSource, /\p{Script=Han}/u);
});

test("localizes page text, attributes, and document language", () => {
  const textElement = { dataset: { i18n: "saveSettingsButton" }, textContent: "" };
  const ariaValues = {};
  const ariaElement = {
    getAttribute() {
      return "previewRegionAria";
    },
    setAttribute(name, value) {
      ariaValues[name] = value;
    },
  };
  const root = {
    documentElement: { lang: "" },
    querySelectorAll(selector) {
      if (selector === "[data-i18n]") {
        return [textElement];
      }
      if (selector === "[data-i18n-aria-label]") {
        return [ariaElement];
      }
      return [];
    },
  };

  globalThis.chrome = {
    i18n: {
      getMessage(messageName, substitutions) {
        if (messageName === "layoutSummary") {
          return substitutions.join("|");
        }
        return {
          saveSettingsButton: "Save settings",
          previewRegionAria: "Layout preview",
        }[messageName];
      },
      getUILanguage() {
        return "en-US";
      },
    },
  };

  localizeDocument(root);

  assert.equal(root.documentElement.lang, "en-US");
  assert.equal(textElement.textContent, "Save settings");
  assert.equal(ariaValues["aria-label"], "Layout preview");
  assert.equal(t("layoutSummary", ["Right", "Top", "70", "35"]), "Right|Top|70|35");
});
