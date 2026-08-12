export function getTargetScreens(screenDetails) {
  const screens = Array.from(screenDetails?.screens ?? []);

  if (screens.length < 2) {
    return [];
  }

  const hasInternalScreen = screens.some((screen) => screen.isInternal === true);
  if (hasInternalScreen) {
    return screens.filter((screen) => screen.isInternal === false);
  }

  // Desktop displays generally all report isInternal=false. In that case the
  // user should be allowed to choose any attached display explicitly.
  return screens;
}

export function formatScreenLabel(screen, currentScreen, messages) {
  const name = screen.label?.trim() || messages.fallbackName;
  const resolution = `${screen.availWidth}×${screen.availHeight}`;
  const current = isSameScreen(screen, currentScreen)
    ? ` · ${messages.currentMarker}`
    : "";
  return `${name} (${resolution}${current})`;
}

export function getScreenKey(screen) {
  return JSON.stringify([
    screen.label ?? "",
    screen.availLeft,
    screen.availTop,
    screen.availWidth,
    screen.availHeight,
  ]);
}

function isSameScreen(first, second) {
  if (!first || !second) {
    return false;
  }

  return (
    first.left === second.left &&
    first.top === second.top &&
    first.width === second.width &&
    first.height === second.height
  );
}
