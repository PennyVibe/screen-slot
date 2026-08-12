# ScreenSlot

[简体中文](README.zh-CN.md)

ScreenSlot is a Chrome extension that detaches the active tab into a new window and places it in a configurable area of an external display.

## Features

- Moves only the active Chrome tab; it does not manage windows from other applications.
- Uses the display's available work area, avoiding the menu bar, Dock, or taskbar.
- Supports setups with one or multiple external displays.
- Provides nine position anchors and independently adjustable window width and height.
- Remembers the selected target while the display layout remains unchanged.
- Automatically follows Chrome's UI language, with English and Simplified Chinese included.
- Runs locally and does not read, capture, or upload screen contents.

## Requirements

- Chrome 111 or later
- At least two connected displays

## Install from source

1. Clone or download this repository.
2. Open `chrome://extensions/` in Chrome.
3. Enable **Developer mode** in the upper-right corner.
4. Click **Load unpacked** and select the repository directory.
5. Optionally pin ScreenSlot to the toolbar from the extensions menu.

The default layout is the lower-left quarter of the target display.

## Window layout settings

Open the settings page in any of these ways:

- Right-click the ScreenSlot toolbar icon and choose **Options**.
- Click **Window layout settings** when the ScreenSlot popup or first-time setup page remains open.
- Open ScreenSlot's details from `chrome://extensions/` and select **Extension options**.

The settings page lets you:

- Anchor the window to any of nine positions: top-left, top-center, top-right, middle-left, center, middle-right, bottom-left, bottom-center, or bottom-right.
- Adjust width and height independently from 10% to 100% of the target display's available work area.
- Preview the selected position and dimensions before saving.
- Restore the default lower-left, 50% × 50% layout.

Saved settings are stored locally in Chrome and take effect the next time a tab is moved.

## Usage

1. Switch to the tab you want to move.
2. Click the ScreenSlot icon.
3. On first use, ScreenSlot opens a separate setup page. Click **Allow and move tab**, then approve Chrome's window-management prompt.
4. If multiple target displays are available, select one and click the move button again.

Chrome's toolbar popup is not a reliable host for the browser permission prompt, so first-time authorization takes place on a separate page. After permission is granted:

- With one external display, clicking the extension icon immediately moves the active tab and closes the popup.
- With multiple external displays, ScreenSlot remembers the first selected target. It asks again only when the display layout or resolution changes.

If the source Chrome window contains only one tab, moving that tab also closes the original window. This is normal Chrome behavior.

## Behavior and limitations

- If window-management permission is denied, or only one display is connected, no tab is moved.
- Chrome or the operating system's window manager may slightly adjust the final window size or position.
- Tab detachment and window placement run in the extension's background service worker, so moving the only tab in a window does not interrupt the operation.

## Development

ScreenSlot uses plain HTML, CSS, and JavaScript and has no build step or runtime dependencies.

Run all unit, syntax, manifest, asset, and localization checks with Node.js:

```sh
npm run check
```

Build a clean Chrome Web Store ZIP containing only runtime files:

```sh
npm run package
```

The archive is written to `dist/`. To test the complete extension flow, reload it from `chrome://extensions/` and follow the [multi-display test checklist](tests/manual/multi-display.md).

For layout-only development without installing the extension, serve the repository over HTTP and open `tests/fixtures/options-preview.html?locale=en` or use `locale=zh_CN`.

## Project structure

```text
manifest.json   Extension entry point and permissions
_locales/       English and Simplified Chinese messages
background/     Service worker and testable window management
popup/          Toolbar popup
setup/          First-time permission flow
options/        Window layout settings and preview
shared/         Layout, display, preferences, messaging, and i18n modules
tests/unit/     Node.js unit tests
tests/manual/   Multi-display regression checklist
tests/fixtures/ Browser preview fixtures backed by real locale files
scripts/        Validation and release packaging
icons/          Extension icons and source SVG
```

GitHub Actions runs `npm run check` and verifies the packaged extension on every push and pull request.

## License

ScreenSlot is released under the [MIT License](LICENSE).
