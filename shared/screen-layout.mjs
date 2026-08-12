export const DEFAULT_WINDOW_LAYOUT = Object.freeze({
  horizontal: "left",
  vertical: "bottom",
  widthPercent: 50,
  heightPercent: 50,
});

const HORIZONTAL_POSITIONS = new Set(["left", "center", "right"]);
const VERTICAL_POSITIONS = new Set(["top", "middle", "bottom"]);

export function normalizeWindowLayout(value) {
  return {
    horizontal: HORIZONTAL_POSITIONS.has(value?.horizontal)
      ? value.horizontal
      : DEFAULT_WINDOW_LAYOUT.horizontal,
    vertical: VERTICAL_POSITIONS.has(value?.vertical)
      ? value.vertical
      : DEFAULT_WINDOW_LAYOUT.vertical,
    widthPercent: normalizePercent(
      value?.widthPercent,
      DEFAULT_WINDOW_LAYOUT.widthPercent,
    ),
    heightPercent: normalizePercent(
      value?.heightPercent,
      DEFAULT_WINDOW_LAYOUT.heightPercent,
    ),
  };
}

export function getWindowBounds(screen, layout = DEFAULT_WINDOW_LAYOUT) {
  const normalized = normalizeWindowLayout(layout);
  const width = Math.max(
    1,
    Math.floor((screen.availWidth * normalized.widthPercent) / 100),
  );
  const height = Math.max(
    1,
    Math.floor((screen.availHeight * normalized.heightPercent) / 100),
  );

  return {
    left: getAxisStart(
      screen.availLeft,
      screen.availWidth,
      width,
      normalized.horizontal,
    ),
    top: getAxisStart(
      screen.availTop,
      screen.availHeight,
      height,
      normalized.vertical,
    ),
    width,
    height,
  };
}

function normalizePercent(value, fallback) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(100, Math.max(10, Math.round(value)));
}

function getAxisStart(availableStart, availableSize, windowSize, position) {
  if (position === "center" || position === "middle") {
    return Math.round(availableStart + (availableSize - windowSize) / 2);
  }

  if (position === "right" || position === "bottom") {
    return Math.round(availableStart + availableSize - windowSize);
  }

  return Math.round(availableStart);
}
