import assert from "node:assert/strict";
import test from "node:test";

import {
  moveTabToScreen,
  validateBounds,
} from "../../background/window-manager.mjs";

const messages = {
  errorInvalidTabId: "Invalid tab ID.",
  errorWindowCreationFailed: "Window creation failed.",
  errorInvalidWindowBounds: "Invalid window bounds.",
  errorInvalidWindowSize: "Invalid window size.",
};

globalThis.chrome = {
  i18n: {
    getMessage(messageName) {
      return messages[messageName] ?? messageName;
    },
  },
};

test("moves a tab into a new window and reapplies its bounds", async () => {
  const calls = [];
  const chromeApi = {
    tabs: {
      async get(tabId) {
        calls.push(["tabs.get", tabId]);
        return { incognito: true };
      },
    },
    windows: {
      async create(options) {
        calls.push(["windows.create", options]);
        return { id: 42 };
      },
      async update(windowId, options) {
        calls.push(["windows.update", windowId, options]);
      },
    },
  };
  const bounds = { left: 10, top: 20, width: 800, height: 600 };

  assert.equal(await moveTabToScreen(7, bounds, chromeApi), 42);
  assert.deepEqual(calls, [
    ["tabs.get", 7],
    [
      "windows.create",
      {
        tabId: 7,
        type: "normal",
        incognito: true,
        focused: true,
        ...bounds,
      },
    ],
    ["windows.update", 42, { focused: true, ...bounds }],
  ]);
});

test("rejects invalid tab IDs and window bounds", async () => {
  await assert.rejects(() => moveTabToScreen("7", {}, {}), /Invalid tab ID/);
  assert.throws(
    () => validateBounds({ left: 0, top: 0, width: 0, height: 600 }),
    /Invalid window size/,
  );
  assert.throws(
    () => validateBounds({ left: 0, top: 0, width: 800, height: 1.5 }),
    /Invalid window bounds/,
  );
});

test("fails when Chrome does not return a new window ID", async () => {
  const chromeApi = {
    tabs: { async get() { return { incognito: false }; } },
    windows: { async create() { return {}; } },
  };

  await assert.rejects(
    () =>
      moveTabToScreen(
        7,
        { left: 0, top: 0, width: 800, height: 600 },
        chromeApi,
      ),
    /Window creation failed/,
  );
});
