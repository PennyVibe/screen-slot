import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_WINDOW_LAYOUT,
  getWindowBounds,
  normalizeWindowLayout,
} from "../../shared/screen-layout.mjs";
import {
  formatScreenLabel,
  getScreenKey,
  getTargetScreens,
} from "../../shared/display-select.mjs";

test("selects only external screens when an internal screen exists", () => {
  const internal = { isInternal: true };
  const external = { isInternal: false };

  assert.deepEqual(getTargetScreens({ screens: [internal, external] }), [external]);
});

test("keeps all displays selectable on desktop setups", () => {
  const first = { isInternal: false };
  const second = { isInternal: false };

  assert.deepEqual(getTargetScreens({ screens: [first, second] }), [first, second]);
});

test("rejects single-screen setups", () => {
  assert.deepEqual(getTargetScreens({ screens: [{ isInternal: false }] }), []);
});

test("uses the lower-left quarter as the default layout", () => {
  assert.deepEqual(
    getWindowBounds({
      availLeft: -1920,
      availTop: 25,
      availWidth: 1920,
      availHeight: 1079,
    }),
    {
      left: -1920,
      top: 565,
      width: 960,
      height: 539,
    },
  );
});

test("calculates a centered custom-size window", () => {
  assert.deepEqual(
    getWindowBounds(
      {
        availLeft: 100,
        availTop: 20,
        availWidth: 1600,
        availHeight: 900,
      },
      {
        horizontal: "center",
        vertical: "middle",
        widthPercent: 65,
        heightPercent: 40,
      },
    ),
    {
      left: 380,
      top: 290,
      width: 1040,
      height: 360,
    },
  );
});

test("aligns a custom window to the top-right corner", () => {
  assert.deepEqual(
    getWindowBounds(
      {
        availLeft: -1200,
        availTop: 30,
        availWidth: 1200,
        availHeight: 800,
      },
      {
        horizontal: "right",
        vertical: "top",
        widthPercent: 25,
        heightPercent: 75,
      },
    ),
    {
      left: -300,
      top: 30,
      width: 300,
      height: 600,
    },
  );
});

test("normalizes invalid and out-of-range layout settings", () => {
  assert.deepEqual(
    normalizeWindowLayout({
      horizontal: "outside",
      vertical: "middle",
      widthPercent: 2,
      heightPercent: 125.4,
    }),
    {
      ...DEFAULT_WINDOW_LAYOUT,
      vertical: "middle",
      widthPercent: 10,
      heightPercent: 100,
    },
  );
});

test("formats a localized fallback display label and current marker", () => {
  const screen = {
    label: "",
    availWidth: 1440,
    availHeight: 900,
    left: 0,
    top: 0,
    width: 1440,
    height: 900,
  };

  assert.equal(
    formatScreenLabel(screen, screen, {
      fallbackName: "Display 2",
      currentMarker: "current",
    }),
    "Display 2 (1440×900 · current)",
  );
});

test("builds a stable preference key from screen work area", () => {
  assert.equal(
    getScreenKey({
      label: "Studio Display",
      availLeft: 1728,
      availTop: 0,
      availWidth: 2560,
      availHeight: 1415,
    }),
    '["Studio Display",1728,0,2560,1415]',
  );
});
