const vscode = require("vscode");

const COLOR_REGEX = {
  HEX: /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g,
  RGB: /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g,
  RGBA: /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0?\.\d+|1|0)\s*\)/g,
  HSL: /hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/g,
  HSV: /hsv\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/g,
  HSB: /hsb\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/g,
  CMYK: /cmyk\(\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/g,
  LAB: /lab\(\s*(\d{1,3})%\s*,\s*(-?\d{1,3})\s*,\s*(-?\d{1,3})\s*\)/g,
  LCH: /lch\(\s*(\d{1,3})%\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g,
  YUV: /yuv\(\s*(\d{1,3})%\s*,\s*(-?\d{1,3})\s*,\s*(-?\d{1,3})\s*\)/g,
  YCBCR: /ycbcr\(\s*(\d{1,3})\s*,\s*(-?\d{1,3})\s*,\s*(-?\d{1,3})\s*\)/g,
};

const colorDecorations = new Map();
let supportedFileTypes = [];
let enabledColorFormats = [];
let config = {};

function loadConfig() {
  config = vscode.workspace.getConfiguration("yivcolor");
  supportedFileTypes = config.get("supportedFileTypes") || [];

  enabledColorFormats = config.get("colorFormats") || ["HEX", "RGB", "RGBA", "HSL"];

  const isLoggingEnabled = config.get("experimental.enableLogging", false);
  if (isLoggingEnabled) {
    console.log(`YivColor: Loaded ${supportedFileTypes.length} supported file types`);
    console.log("YivColor: Enabled color formats:", enabledColorFormats);
  }
}

function isFileTypeSupported(fileName) {
  const enableUntitled = config.get("experimental.enableUntitledFiles", true);
  const isLoggingEnabled = config.get("experimental.enableLogging", false);

  if (!fileName) {
    if (isLoggingEnabled) console.log("YivColor: No filename detected, likely an untitled file");
    return enableUntitled;
  }

  if (fileName.startsWith("Untitled:") ||
      fileName.startsWith("untitled:") ||
      fileName.includes("Untitled-") ||
      fileName === "Untitled" ||
      !fileName.includes(".")) {
    if (isLoggingEnabled) console.log(`YivColor: Detected untitled file: ${fileName}`);
    return enableUntitled;
  }

  const fileExt = fileName.split(".").pop().toLowerCase().trim();

  if (!fileExt || fileExt === fileName) {
    if (isLoggingEnabled) console.log(`YivColor: Could not determine file extension for: ${fileName}`);
    return false;
  }

  return supportedFileTypes.some(
    (supportedType) => supportedType.toLowerCase().trim() === fileExt
  );
}

function parseColorForTooltip(colorStr) {
  let tooltip = `Color: ${colorStr}`;

  if (colorStr.startsWith("#")) {
    let hex = colorStr.substring(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    tooltip += `\nRGB: ${r}, ${g}, ${b}`;
  } else if (colorStr.startsWith("rgba")) {
    tooltip += "\nFormat: RGBA";
  } else if (colorStr.startsWith("rgb")) {
    tooltip += "\nFormat: RGB";
  } else if (colorStr.startsWith("hsl")) {
    tooltip += "\nFormat: HSL";
  } else if (colorStr.startsWith("hsv") || colorStr.startsWith("hsb")) {
    tooltip += `\nFormat: ${colorStr.substring(0, 3).toUpperCase()}`;
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

  return tooltip;
}

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

  const text = editor.document.getText();
  const colorPositions = [];

  for (const [type, regex] of Object.entries(COLOR_REGEX)) {
    if (!enabledColorFormats.includes(type)) continue;

    let match;
    regex.lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      const startPos = editor.document.positionAt(match.index);
      const endPos = editor.document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);

      colorPositions.push({
        range,
        color: match[0],
      });
    }
  }

  const previewSize = config.get("appearance.previewSize", 14);
  const previewBorder = config.get("appearance.previewBorder", true);
  const previewPosition = config.get("appearance.previewPosition", "before");

  const decorations = colorPositions.map(({ range, color }) => {
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
      hoverMessage: new vscode.MarkdownString(parseColorForTooltip(color)),
    };
  });

  const decorationType = vscode.window.createTextEditorDecorationType({
    isWholeLine: false,
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  });

  clearDecorations(editor);

  editor.setDecorations(decorationType, decorations);

  colorDecorations.set(editor, {
    type: decorationType,
    items: colorPositions,
  });
}

function clearDecorations(editor) {
  if (colorDecorations.has(editor)) {
    const decoration = colorDecorations.get(editor);
    decoration.type.dispose();
    colorDecorations.delete(editor);
  }
}

function activate(context) {
  console.log("YivColor is now active");

  loadConfig();

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        updateDecorations(editor);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        updateDecorations(editor);
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
          updateDecorations(editor);
        });

        if (config.get("experimental.enableLogging", false)) {
          console.log("YivColor: Configuration updated");
        }
      }
    },
    null,
    context.subscriptions
  );

  const refreshCommand = vscode.commands.registerCommand(
    "yivcolor.refreshSettings",
    () => {
      loadConfig();
      vscode.window.visibleTextEditors.forEach((editor) => {
        updateDecorations(editor);
      });
      vscode.window.showInformationMessage(
        `YivColor: Refreshed settings. Supporting ${supportedFileTypes.length} file types.`
      );
    }
  );

  context.subscriptions.push(refreshCommand);

  vscode.window.visibleTextEditors.forEach((editor) => {
    updateDecorations(editor);
  });
}

function deactivate() {
  colorDecorations.forEach((decoration) => {
    decoration.type.dispose();
  });
  colorDecorations.clear();
}

module.exports = {
  activate,
  deactivate,
};
