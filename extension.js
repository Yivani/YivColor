/**
 * YivColor - VS Code Color Preview Extension
 * =========================================
 *
 * @copyright Copyright (c) 2023-2024 Yivani
 * @license GPL-3.0
 * @author Yivani
 * @version 1.5.0
 *
 * This extension displays color previews in Visual Studio Code for various color formats
 * including HEX, RGB, RGBA, HSL, HSV, HSB, CMYK, LAB, LCH, YUV and YCBCR.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const vscode = require("vscode");
const { ColorHistoryManager } = require("./src/history/color-history-manager");
const { ColorHistoryViewProvider } = require("./src/history/color-history-view");
const { CSS_COLORS } = require("./src/color/css-colors");
const { COLOR_REGEX } = require("./src/color/color-regex");
const { ColorUtils } = require("./src/color/color-parser");

// Externalized CSS_COLORS, COLOR_REGEX, and ColorUtils are imported above

// Core data structures
const colorDecorations = new Map();
let supportedFileTypes = [];
let enabledColorFormats = [];
let config = {};
let statusBarItem;
let statusViewProvider;
let colorHistoryViewProvider;

// Performance-related state
let masterRegex = null; // Combined regex based on enabled formats
let globalDecorationType = null; // Single reusable decoration type
const updateTimers = new Map(); // uri -> timeout
const docVersionCache = new Map(); // uri -> version last processed

// Our Activity Bar view provider for visual status and settings
class YivColorStatusViewProvider {
  constructor(extensionUri) {
    this.extensionUri = extensionUri;
    this.view = undefined;
  }

  resolveWebviewView(webviewView, context, _token) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    this.updateView();

    webviewView.webview.onDidReceiveMessage(message => {
      if (message.command === "toggle") {
        toggleExtension();
      } else if (message.command === "openSettings") {
        vscode.commands.executeCommand("workbench.action.openSettings", "yivcolor");
      } else if (message.command === "updateSetting") {
        vscode.workspace.getConfiguration("yivcolor").update(message.setting, message.value, true);
      }
    });
  }

  updateView() {
    if (!this.view) return;

    const isEnabled = config.get("enable");
    const previewSize = config.get("appearance.previewSize", 14);
    const previewBorder = config.get("appearance.previewBorder", true);
    const previewPosition = config.get("appearance.previewPosition", "before");
    const enabledFormats = config.get("colorFormats", ["HEX", "RGB", "RGBA", "HSL"]);

    this.view.webview.html = this.getHtmlContent(isEnabled, previewSize, previewBorder, previewPosition, enabledFormats);
  }

  getHtmlContent(isEnabled, previewSize, previewBorder, previewPosition, enabledFormats) {
    const statusColor = isEnabled ? "#57A64A" : "#808080"; // Green for on, gray for off
    const statusText = isEnabled ? "ON" : "OFF";
    const buttonClass = isEnabled ? "active" : "inactive";

    // Create checkboxes for the most common color formats
    const commonFormats = ["HEX", "RGB", "RGBA", "HSL"];
    const formatCheckboxes = commonFormats.map(format => {
      const checked = enabledFormats.includes(format) ? "checked" : "";
      return `
        <div class="setting-item">
          <input type="checkbox" id="${format}" ${checked} onchange="updateColorFormat('${format}', this.checked)">
          <label for="${format}">${format}</label>
        </div>
      `;
    }).join("");

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YivColor Status</title>
        <style>
          body {
            padding: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
          }
          .status-indicator {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 15px;
          }
          .status-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: ${statusColor};
            margin-bottom: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
          }
          .toggle-button, .settings-button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.2s;
            margin-bottom: 8px;
            width: 100%;
            text-align: center;
          }
          .toggle-button:hover, .settings-button:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
          .status-text {
            font-size: 12px;
            margin-top: 5px;
          }
          .active {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(87, 166, 74, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(87, 166, 74, 0); }
            100% { box-shadow: 0 0 0 0 rgba(87, 166, 74, 0); }
          }
          .settings-section {
            width: 100%;
            margin-top: 15px;
            border-top: 1px solid var(--vscode-panel-border);
            padding-top: 15px;
          }
          .settings-header {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .setting-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            width: 100%;
          }
          .setting-item label {
            margin-left: 5px;
            flex: 1;
          }
          .setting-item input[type="range"] {
            width: 100%;
            margin-top: 5px;
          }
          .setting-item select {
            width: 100%;
            background-color: var(--vscode-dropdown-background);
            color: var(--vscode-dropdown-foreground);
            border: 1px solid var(--vscode-dropdown-border);
            padding: 3px 5px;
            border-radius: 2px;
          }
          .value-display {
            margin-left: 5px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
          }
          .formats-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="status-indicator">
          <div class="status-circle ${buttonClass}">
            ${statusText}
          </div>
          <div class="status-text">YivColor is ${isEnabled ? "enabled" : "disabled"}</div>
        </div>

        <button class="toggle-button" id="toggleBtn">
          ${isEnabled ? "Disable" : "Enable"} YivColor
        </button>

        <div class="settings-section">
          <div class="settings-header">Quick Settings</div>

          <div class="setting-item">
            <label for="previewSize">Preview Size: <span id="sizeValue">${previewSize}px</span></label>
            <input type="range" id="previewSize" min="8" max="32" value="${previewSize}"
              onchange="updateSetting('appearance.previewSize', parseInt(this.value))">
          </div>

          <div class="setting-item">
            <input type="checkbox" id="previewBorder" ${previewBorder ? "checked" : ""}
              onchange="updateSetting('appearance.previewBorder', this.checked)">
            <label for="previewBorder">Show Border</label>
          </div>

          <div class="setting-item">
            <label for="previewPosition">Preview Position:</label>
            <select id="previewPosition" onchange="updateSetting('appearance.previewPosition', this.value)">
              <option value="before" ${previewPosition === "before" ? "selected" : ""}>Before</option>
              <option value="after" ${previewPosition === "after" ? "selected" : ""}>After</option>
            </select>
          </div>

          <div class="settings-header">Active Color Formats</div>
          <div class="formats-container">
            ${formatCheckboxes}
          </div>
        </div>

        <div class="settings-section">
          <button class="settings-button" id="openSettingsBtn">
            All YivColor Settings...
          </button>
        </div>

        <script>
          const vscode = acquireVsCodeApi();

          document.getElementById('toggleBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'toggle' });
          });

          document.getElementById('openSettingsBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'openSettings' });
          });

          function updateSetting(setting, value) {
            vscode.postMessage({ command: 'updateSetting', setting: setting, value: value });

            // Update the size display if changing preview size
            if (setting === 'appearance.previewSize') {
              document.getElementById('sizeValue').textContent = value + 'px';
            }
          }

          function updateColorFormat(format, isChecked) {
            // Get current enabled formats
            const enabledFormats = [
              ${enabledFormats.map(f => `"${f}"`).join(", ")}
            ];

            if (isChecked && !enabledFormats.includes(format)) {
              enabledFormats.push(format);
            } else if (!isChecked && enabledFormats.includes(format)) {
              const index = enabledFormats.indexOf(format);
              enabledFormats.splice(index, 1);
            }

            updateSetting('colorFormats', enabledFormats);
          }
        </script>
      </body>
      </html>`;
  }
}

// Updates the status displays in both Activity Bar and status bar
function updateStatusBar() {
  if (statusViewProvider && statusViewProvider.view) {
    statusViewProvider.updateView();
  }

  // Keep the old status bar functionality as a fallback
  if (statusBarItem) {
    const isEnabled = config.get("enable");

    if (isEnabled) {
      statusBarItem.text = "$(paintcan) YivColor: On";
      statusBarItem.tooltip = "YivColor is enabled. Click to disable.";
    } else {
      statusBarItem.text = "$(paintcan) YivColor: Off";
      statusBarItem.tooltip = "YivColor is disabled. Click to enable.";
    }
  }
}

// Toggles the extension on/off based on user interaction
function toggleExtension() {
  const currentState = config.get("enable");
  vscode.workspace.getConfiguration("yivcolor").update("enable", !currentState, true)
    .then(() => {
      const newState = !currentState;
      vscode.window.showInformationMessage(`YivColor ${newState ? "enabled" : "disabled"}`);
    });
}

// Loads all configuration settings from VS Code
function loadConfig() {
  config = vscode.workspace.getConfiguration("yivcolor");
  supportedFileTypes = config.get("supportedFileTypes") || [];

  enabledColorFormats = config.get("colorFormats") || ["HEX", "RGB", "RGBA", "HSL"];

  const isLoggingEnabled = config.get("experimental.enableLogging", false);
  if (isLoggingEnabled) {
    console.log(`YivColor: Loaded ${supportedFileTypes.length} supported file types`);
    console.log("YivColor: Enabled color formats:", enabledColorFormats);
  }

  updateStatusBar();

  // Rebuild master regex when config changes
  buildMasterRegex();
  // Recreate decoration type if needed (size/border/position do not affect type)
  if (!globalDecorationType) {
    globalDecorationType = vscode.window.createTextEditorDecorationType({
      isWholeLine: false,
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });
  }
}

// Build a single combined regex to reduce multiple passes
function buildMasterRegex() {
  try {
    const sources = [];
    for (const [key, rx] of Object.entries(COLOR_REGEX)) {
      if (key === "NAMED") continue; // add later to ensure case-insensitive names
      if (!enabledColorFormats.includes(key)) continue;
      sources.push(`(${rx.source})`);
    }
    // Always include named colors for convenience
    sources.push(`(${COLOR_REGEX.NAMED.source})`);
    masterRegex = new RegExp(sources.join("|"), "gi");
  } catch (e) {
    // Fallback to simple hex if something goes wrong
    masterRegex = COLOR_REGEX.HEX;
    masterRegex.lastIndex = 0;
  }
}

// Determines if a given file type should have color highlighting
function isFileTypeSupported(fileName) {
  const enableUntitled = config.get("experimental.enableUntitledFiles", true);
  const isLoggingEnabled = config.get("experimental.enableLogging", false);

  if (!fileName) {
    if (isLoggingEnabled) console.log("YivColor: No filename detected, likely an untitled file");
    return enableUntitled;
  }

  // Handle virtual documents and untitled files
  if (fileName.startsWith("Untitled:") ||
      fileName.startsWith("untitled:") ||
      fileName.includes("Untitled-") ||
      fileName === "Untitled" ||
      !fileName.includes(".")) {
    if (isLoggingEnabled) console.log(`YivColor: Detected untitled file: ${fileName}`);
    return enableUntitled;
  }

  // Extract filename from path and normalize it
  const normalizedFileName = fileName.replace(/\\/g, "/").toLowerCase();

  // First try to get extension from the last segment of the path
  const pathSegments = normalizedFileName.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];

  // More robust file extension extraction
  let fileExt = "";
  if (lastSegment.includes(".")) {
    fileExt = lastSegment.split(".").pop().toLowerCase().trim();

    // Handle some special file extensions with dots (like .d.ts)
    if (lastSegment.endsWith(".d.ts")) {
      fileExt = "ts";
    } else if (lastSegment.endsWith(".min.js")) {
      fileExt = "js";
    } else if (lastSegment.endsWith(".spec.ts") || lastSegment.endsWith(".test.ts")) {
      fileExt = "ts";
    }
  }

  if (!fileExt || fileExt === lastSegment) {
    if (isLoggingEnabled) console.log(`YivColor: Could not determine file extension for: ${fileName}`);
    return false;
  }

  // Check if the extension is in our supported list
  const isSupported = supportedFileTypes.some(
    (supportedType) => supportedType.toLowerCase().trim() === fileExt
  );

  if (isLoggingEnabled) {
    console.log(`YivColor: File ${fileName} with extension "${fileExt}" is ${isSupported ? "supported" : "not supported"}`);
    if (!isSupported) {
      console.log(`YivColor: Supported types: ${supportedFileTypes.join(", ")}`);
    }
  }

  return isSupported;
}

// Creates tooltips with color format conversions
function parseColorForTooltip(colorStr) {
  let tooltip = `Color: ${colorStr}`;

  // Parse color using our utility
  const parsedColor = ColorUtils.parseColor(colorStr);

  if (parsedColor) {
    // For named colors, show the corresponding hex value
    if (parsedColor.type === "named") {
      tooltip += `\nHEX: ${parsedColor.hex}`;
    }

    // Add all appropriate conversions to the tooltip
    if (parsedColor.hex && parsedColor.type !== "hex" && parsedColor.type !== "named") {
      tooltip += `\nHEX: ${parsedColor.hex}`;
    }

    if (parsedColor.rgb && parsedColor.type !== "rgb" && parsedColor.type !== "rgba") {
      tooltip += `\nRGB: rgb(${parsedColor.rgb.r}, ${parsedColor.rgb.g}, ${parsedColor.rgb.b})`;
    }

    if (parsedColor.rgba && parsedColor.type !== "rgba") {
      tooltip += `\nRGBA: rgba(${parsedColor.rgba.r}, ${parsedColor.rgba.g}, ${parsedColor.rgba.b}, ${parsedColor.rgba.a})`;
    }

    if (parsedColor.hsl && parsedColor.type !== "hsl") {
      tooltip += `\nHSL: hsl(${parsedColor.hsl.h}, ${parsedColor.hsl.s}%, ${parsedColor.hsl.l}%)`;
    }

    if (parsedColor.hsv && parsedColor.type !== "hsv" && parsedColor.type !== "hsb") {
      tooltip += `\nHSV: hsv(${parsedColor.hsv.h}, ${parsedColor.hsv.s}%, ${parsedColor.hsv.v}%)`;
    }

    if (parsedColor.cmyk && parsedColor.type !== "cmyk") {
      tooltip += `\nCMYK: cmyk(${parsedColor.cmyk.c}%, ${parsedColor.cmyk.m}%, ${parsedColor.cmyk.y}%, ${parsedColor.cmyk.k}%)`;
    }
  } else {
    // Fallback for formats we don't fully support yet
    if (colorStr.startsWith("rgba")) {
      tooltip += "\nFormat: RGBA";
    } else if (colorStr.startsWith("rgb")) {
      tooltip += "\nFormat: RGB";
    } else if (colorStr.startsWith("hsl")) {
      tooltip += "\nFormat: HSL";
    } else if (colorStr.startsWith("hsv")) {
      tooltip += "\nFormat: HSV";
    } else if (colorStr.startsWith("hsb")) {
      tooltip += "\nFormat: HSB";
    } else if (colorStr.startsWith("cmyk")) {
      tooltip += "\nFormat: CMYK";
    } else if (colorStr.startsWith("lab")) {
      tooltip += "\nFormat: LAB";
    } else if (colorStr.startsWith("lch")) {
      tooltip += "\nFormat: LCH";
    } else if (colorStr.startsWith("yuv")) {
      tooltip += "\nFormat: YUV";
    } else if (colorStr.startsWith("ycbcr")) {
      tooltip += "\nFormat: YCbCr";
    }
  }

  return tooltip;
}

// The main decoration function - finds colors and adds the previews
function updateDecorations(editor) {
  if (!editor) return;

  if (!config.get("enable")) {
    clearDecorations(editor);
    return;
  }

  const isLoggingEnabled = config.get("experimental.enableLogging", false);
  const fileName = editor.document.fileName;
  const isUntitled = editor.document.isUntitled;

  if (isLoggingEnabled) {
    console.log(`YivColor: Processing file ${fileName}, isUntitled: ${isUntitled}`);
  }

  if (!isFileTypeSupported(fileName) && !isUntitled) {
    clearDecorations(editor);
    return;
  }

  const doc = editor.document;
  const textLength = doc.getText().length;

  // Large file handling
  const throttleLarge = config.get("performance.throttleForLargeFiles", true);
  const largeThreshold = config.get("performance.largeFileThreshold", 100000);
  let text;
  if (throttleLarge && textLength > largeThreshold) {
    // Scan only the first N characters to avoid heavy work
    const range = new vscode.Range(doc.positionAt(0), doc.positionAt(largeThreshold));
    text = doc.getText(range);
    if (isLoggingEnabled) console.log(`YivColor: Large file detected (${textLength}). Scanning first ${largeThreshold} chars.`);
  } else {
    text = doc.getText();
  }
  const colorPositions = [];

  // Use master regex for a single pass
  if (!masterRegex) buildMasterRegex();
  const rx = masterRegex;
  rx.lastIndex = 0;

  let m;
  while ((m = rx.exec(text)) !== null) {
    const startPos = editor.document.positionAt(m.index);
    const endPos = editor.document.positionAt(m.index + m[0].length);
    const range = new vscode.Range(startPos, endPos);
    let color = m[0];
    // If it's a named color word, convert to hex for background
    const lower = color.toLowerCase();
    if (CSS_COLORS[lower]) {
      color = CSS_COLORS[lower];
    }
    colorPositions.push({ range, color, originalText: m[0] });
  }

  // Apply visual decorations for each color found
  const previewSize = config.get("appearance.previewSize", 14);
  const previewBorder = config.get("appearance.previewBorder", true);
  const previewPosition = config.get("appearance.previewPosition", "before");

  const decorations = colorPositions.map(({ range, color, originalText }) => {
    const renderOptions = {};
    const position = previewPosition === "before" ? "before" : "after";

    renderOptions[position] = {
      contentText: " ",
      backgroundColor: color,
      margin: "0 4px 0 0",
      width: `${previewSize}px`,
      height: `${previewSize}px`,
      borderRadius: "3px",
    };

    if (previewBorder) {
      renderOptions[position].border = "1px solid #88888844";
    }

    return {
      range,
      renderOptions,
      hoverMessage: new vscode.MarkdownString(parseColorForTooltip(originalText || color)),
    };
  });

  if (!globalDecorationType) {
    globalDecorationType = vscode.window.createTextEditorDecorationType({
      isWholeLine: false,
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });
  }

  // Clear previous and set new decorations using a single global type
  editor.setDecorations(globalDecorationType, decorations);

  colorDecorations.set(editor, {
    type: globalDecorationType,
    items: colorPositions,
  });

  // Update color history with unique hex values only
  try {
    const toHex = (c) => {
      // normalize to hex when possible
      if (!c) return undefined;
      if (c.startsWith("#")) return c.toLowerCase();
      // Try parse via ColorUtils for other formats (named, rgb, etc.)
      const parsed = ColorUtils.parseColor(c);
      return parsed && parsed.hex ? parsed.hex.toLowerCase() : undefined;
    };
    const unique = new Set(
      colorPositions
        .map(({ originalText, color }) => toHex(originalText || color))
        .filter(Boolean)
    );
    ColorHistoryManager.addColors(unique);
  } catch (e) {
    // non-fatal
  }
}

// Cleans up decorations from the editor
function clearDecorations(editor) {
  if (globalDecorationType) {
    editor.setDecorations(globalDecorationType, []);
  }
  colorDecorations.delete(editor);
}

// Extension activation point
function activate(context) {
  console.log("YivColor is now active");

  // Setup the Activity Bar and status indicators
  statusViewProvider = new YivColorStatusViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "yivcolor-status",
      statusViewProvider
    )
  );

  // Keep the status bar item as a fallback/alternative
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(statusBarItem);
  statusBarItem.command = "yivcolor.toggleExtension";
  statusBarItem.show();

  // Register the toggle command
  const toggleCommand = vscode.commands.registerCommand("yivcolor.toggleExtension", toggleExtension);
  context.subscriptions.push(toggleCommand);

  // Initialize Color History manager and view
  ColorHistoryManager.initialize(context.workspaceState, vscode.workspace.getConfiguration("yivcolor"));
  colorHistoryViewProvider = new ColorHistoryViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("yivcolor-history", colorHistoryViewProvider)
  );

  // Command to clear history
  context.subscriptions.push(
    vscode.commands.registerCommand("yivcolor.clearColorHistory", () => {
      ColorHistoryManager.clear();
      vscode.window.showInformationMessage("YivColor: Color history cleared");
    })
  );

  loadConfig();

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
  scheduleUpdate(editor);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
  scheduleUpdate(editor, event);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration("yivcolor")) {
        loadConfig();

        vscode.window.visibleTextEditors.forEach((editor) => {
          scheduleUpdate(editor);
        });

        if (config.get("experimental.enableLogging", false)) {
          console.log("YivColor: Configuration updated");
        }
      }
    },
    null,
    context.subscriptions
  );

  // Register the refresh settings command
  const refreshCommand = vscode.commands.registerCommand(
    "yivcolor.refreshSettings",
    () => {
      loadConfig();
      vscode.window.visibleTextEditors.forEach((editor) => {
  scheduleUpdate(editor);
      });
      vscode.window.showInformationMessage(
        `YivColor: Refreshed settings. Supporting ${supportedFileTypes.length} file types.`
      );
    }
  );

  context.subscriptions.push(refreshCommand);

  // Register the optimize performance command
  const optimizeCommand = vscode.commands.registerCommand(
    "yivcolor.optimizePerformance",
    () => {
      // Clear any existing caches
      colorDecorations.clear();

      // Force garbage collection by nullifying large objects
      COLOR_REGEX.lastIndex = 0;

      // Refresh decorations with optimized settings
      vscode.window.visibleTextEditors.forEach((editor) => {
  scheduleUpdate(editor);
      });

      vscode.window.showInformationMessage("YivColor: Performance optimized");
    }
  );

  context.subscriptions.push(optimizeCommand);

  // Initialize color decorations for all visible editors
  vscode.window.visibleTextEditors.forEach((editor) => {
    scheduleUpdate(editor);
  });
}

// Debounced update per editor/document
function scheduleUpdate(editor) {
  if (!editor) return;
  const uri = editor.document.uri.toString();
  const delayBase = config.get("performance.throttleDelay", 300);
  const throttleLarge = config.get("performance.throttleForLargeFiles", true);
  const largeThreshold = config.get("performance.largeFileThreshold", 100000);
  const textLen = editor.document.getText().length;
  const delay = throttleLarge && textLen > largeThreshold ? Math.min(2000, delayBase * 2) : delayBase;

  if (updateTimers.has(uri)) {
    clearTimeout(updateTimers.get(uri));
  }
  const handle = setTimeout(() => {
    // Skip if document version unchanged since last run
    const ver = editor.document.version;
    const cacheVer = docVersionCache.get(uri);
    if (cacheVer === ver) return;
    updateDecorations(editor);
    docVersionCache.set(uri, ver);
    updateTimers.delete(uri);
  }, delay);
  updateTimers.set(uri, handle);
}

/**
 * Extension deactivation handler - performs cleanup when extension is deactivated
 * Disposes all decorations, clears caches and releases UI resources
 */
function deactivate() {
  // Clean up all color decorations
  colorDecorations.forEach((decoration) => {
    decoration.type.dispose();
  });
  colorDecorations.clear();

  // Dispose status bar item
  if (statusBarItem) {
    statusBarItem.dispose();
  }

  // statusViewProvider is handled by the extension context
}

module.exports = {
  activate,
  deactivate,
};
