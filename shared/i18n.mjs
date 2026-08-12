export function t(messageName, substitutions) {
  return chrome.i18n.getMessage(messageName, substitutions) || messageName;
}

export function localizeDocument(root = document) {
  root.documentElement.lang = chrome.i18n.getUILanguage().replaceAll("_", "-");

  localizeText(root);
  localizeAttribute(root, "data-i18n-title", "title");
  localizeAttribute(root, "data-i18n-aria-label", "aria-label");
}

function localizeText(root) {
  for (const element of root.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
}

function localizeAttribute(root, dataAttribute, targetAttribute) {
  for (const element of root.querySelectorAll(`[${dataAttribute}]`)) {
    element.setAttribute(targetAttribute, t(element.getAttribute(dataAttribute)));
  }
}
