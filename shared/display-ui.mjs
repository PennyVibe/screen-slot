import { formatScreenLabel } from "./display-select.mjs";
import { t } from "./i18n.mjs";

export function populateScreenSelect(select, screens, currentScreen) {
  select.replaceChildren(
    ...screens.map((screen, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = formatScreenLabel(screen, currentScreen, {
        fallbackName: t("displayFallback", [String(index + 1)]),
        currentMarker: t("displayCurrent"),
      });
      return option;
    }),
  );
}
