# Multi-display regression checklist

Run this checklist on the minimum supported Chrome version and the current stable version when preparing a release.

## Permission flow

- [ ] First use opens the separate setup page and shows Chrome's window-management permission prompt.
- [ ] Allowing permission moves the original target tab, not the setup tab.
- [ ] Denying permission shows recovery guidance without moving a tab.
- [ ] The permission-settings button either opens Chrome settings or shows the manual settings URL.

## Display selection

- [ ] A single-display setup reports that no second display is available.
- [ ] A laptop with one external display automatically selects the external display.
- [ ] A desktop with multiple displays offers every attached display.
- [ ] The selected display is reused after reopening the popup.
- [ ] Changing display resolution or layout causes the target to be selected again.
- [ ] An existing `localStorage` display preference migrates without losing the selection.

## Window layout

- [ ] All nine position anchors place the window in the expected area.
- [ ] Width and height values at 10%, 50%, and 100% produce usable windows.
- [ ] Menu bars, docks, and taskbars are excluded through the available work area.
- [ ] Restoring defaults returns to bottom-left at 50% width and 50% height.

## Tab and window behavior

- [ ] Moving one tab from a multi-tab window leaves the source window open.
- [ ] Moving the only tab closes the source window but still completes placement.
- [ ] Chrome remains focused on the newly created window.
- [ ] Incognito tabs move correctly when the extension is allowed in incognito mode.

## Localization

- [ ] English Chrome shows English Manifest, popup, setup, options, status, and error text.
- [ ] Simplified Chinese Chrome shows Chinese text in the same locations.
- [ ] Longer English labels do not overflow at the supported page widths.
