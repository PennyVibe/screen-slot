import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import {
  loadPreferredScreenKey,
  loadWindowLayout,
  resetWindowLayout,
  savePreferredScreenKey,
  saveWindowLayout,
} from "../../shared/preferences.mjs";

const storedValues = {};
const legacyValues = {};

globalThis.chrome = {
  storage: {
    local: {
      async get(key) {
        return { [key]: storedValues[key] };
      },
      async remove(key) {
        delete storedValues[key];
      },
      async set(update) {
        Object.assign(storedValues, update);
      },
    },
  },
};

globalThis.localStorage = {
  getItem(key) {
    return legacyValues[key] ?? null;
  },
  removeItem(key) {
    delete legacyValues[key];
  },
  setItem(key, value) {
    legacyValues[key] = String(value);
  },
};

beforeEach(() => {
  for (const key of Object.keys(storedValues)) {
    delete storedValues[key];
  }
  for (const key of Object.keys(legacyValues)) {
    delete legacyValues[key];
  }
});

test("loads the default layout when no preference is stored", async () => {
  assert.deepEqual(await loadWindowLayout(), {
    horizontal: "left",
    vertical: "bottom",
    widthPercent: 50,
    heightPercent: 50,
  });
});

test("normalizes and persists a custom layout", async () => {
  assert.deepEqual(
    await saveWindowLayout({
      horizontal: "right",
      vertical: "top",
      widthPercent: 72,
      heightPercent: 36,
    }),
    {
      horizontal: "right",
      vertical: "top",
      widthPercent: 72,
      heightPercent: 36,
    },
  );

  assert.deepEqual(await loadWindowLayout(), {
    horizontal: "right",
    vertical: "top",
    widthPercent: 72,
    heightPercent: 36,
  });
});

test("removes the stored preference when restoring defaults", async () => {
  await saveWindowLayout({
    horizontal: "center",
    vertical: "middle",
    widthPercent: 80,
    heightPercent: 70,
  });

  assert.deepEqual(await resetWindowLayout(), {
    horizontal: "left",
    vertical: "bottom",
    widthPercent: 50,
    heightPercent: 50,
  });
  assert.deepEqual(await loadWindowLayout(), {
    horizontal: "left",
    vertical: "bottom",
    widthPercent: 50,
    heightPercent: 50,
  });
});

test("migrates the preferred display from legacy localStorage", async () => {
  localStorage.setItem("preferredScreenKey", "legacy-display");

  assert.equal(await loadPreferredScreenKey(), "legacy-display");
  assert.equal(storedValues.preferredScreenKey, "legacy-display");
  assert.equal(localStorage.getItem("preferredScreenKey"), null);
});

test("stores the preferred display in extension storage", async () => {
  localStorage.setItem("preferredScreenKey", "outdated-display");

  await savePreferredScreenKey("current-display");

  assert.equal(await loadPreferredScreenKey(), "current-display");
  assert.equal(localStorage.getItem("preferredScreenKey"), null);
});
