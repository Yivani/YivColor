const vscode = require("vscode");

const COLOR_REGEX = {
  HEX: /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g,
  RGB: /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g,
  RGBA: /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0?\.\d+|1|0)\s*\)/g,
  HSL: /hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/g,
};

const colorDecorations = new Map();
let supportedFileTypes = [];

function loadSupportedFileTypes() {
  const config = vscode.workspace.getConfiguration("yivcolor");
  supportedFileTypes = config.get("supportedFileTypes") || [];
  console.log(
    `YivColor: Loaded ${supportedFileTypes.length} supported file types`
  );
}

function isFileTypeSupported(fileName) {
  // Better handling for untitled/unsaved files
  if (!fileName) {
    console.log("YivColor: No filename detected, likely an untitled file");
    return true;
  }

  // Check for untitled files in various formats
  if (fileName.startsWith("Untitled:") ||
      fileName.startsWith("untitled:") ||
      fileName.includes("Untitled-") ||
      fileName === "Untitled" ||
      !fileName.includes(".")) {
    console.log(`YivColor: Detected untitled file: ${fileName}`);
    return true;
  }

  const fileExt = fileName.split(".").pop().toLowerCase().trim();

  if (!fileExt || fileExt === fileName) {
    console.log(`YivColor: Could not determine file extension for: ${fileName}`);
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
  }

  return tooltip;
}

function updateDecorations(editor) {
  if (!editor) return;

  const config = vscode.workspace.getConfiguration("yivcolor");
  if (!config.get("enable")) {
    clearDecorations(editor);
    return;
  }

  // Add logging for debugging untitled files
  const fileName = editor.document.fileName;
  const isUntitled = editor.document.isUntitled;

  console.log(`YivColor: Processing file ${fileName}, isUntitled: ${isUntitled}`);

  // Use both checks for untitled files
  if (!isFileTypeSupported(fileName) && !isUntitled) {
    clearDecorations(editor);
    return;
  }

  const text = editor.document.getText();
  const colorPositions = [];

  for (const [type, regex] of Object.entries(COLOR_REGEX)) {
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

  const decorations = colorPositions.map(({ range, color }) => {
    return {
      range,
      renderOptions: {
        before: {
          contentText: " ",
          backgroundColor: color,
          border: "1px solid #88888844",
          margin: "0 5px 0 0",
          width: "12px",
          height: "12px",
          borderRadius: "3px",
        },
      },
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

  loadSupportedFileTypes();

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
        loadSupportedFileTypes();

        vscode.window.visibleTextEditors.forEach((editor) => {
          updateDecorations(editor);
        });

        console.log("YivColor: Configuration updated");
      }
    },
    null,
    context.subscriptions
  );

  const refreshCommand = vscode.commands.registerCommand(
    "yivcolor.refreshSettings",
    () => {
      loadSupportedFileTypes();
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
