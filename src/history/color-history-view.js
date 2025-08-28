const vscode = require("vscode");
const { ColorHistoryManager } = require("./color-history-manager");

class ColorHistoryViewProvider {
  constructor(extensionUri) {
    this.extensionUri = extensionUri;
    this.view = undefined;
    this._disposables = [];
    ColorHistoryManager.onDidChange(() => this.update());
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [this.extensionUri] };
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.command) {
        case "copy":
          await vscode.env.clipboard.writeText(msg.color);
          vscode.window.showInformationMessage(`Copied ${msg.color}`);
          break;
        case "clear":
          ColorHistoryManager.clear();
          break;
      }
    });
    this.update();
  }

  update() {
    if (!this.view) return;
    const colors = ColorHistoryManager.getAll();
    this.view.webview.html = this._getHtml(colors);
  }

  _getHtml(items) {
    const cards = items
      .map(
        (i) => `
        <div class="color-card" title="${i.color} (used ${i.count}×)" onclick="copy('${i.color}')">
          <div class="swatch" style="background:${i.color}"></div>
          <div class="label">${i.color}</div>
        </div>`
      )
      .join("");

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: var(--vscode-font-family); padding: 8px; }
    .toolbar { display:flex; gap:8px; margin-bottom:8px; }
    .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(90px,1fr)); gap:8px; }
    .color-card { border:1px solid var(--vscode-panel-border); border-radius:6px; overflow:hidden; cursor:pointer; }
    .swatch { height:48px; border-bottom:1px solid var(--vscode-panel-border); }
    .label { font-size:12px; padding:6px; text-align:center; }
    button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border:none; padding:6px 10px; border-radius:4px; cursor:pointer; }
    button:hover { background: var(--vscode-button-hoverBackground); }
    .empty { color: var(--vscode-descriptionForeground); font-size:12px; }
  </style>
  <script>
    const vscode = acquireVsCodeApi();
    function copy(c){ vscode.postMessage({command:'copy', color:c}); }
    function clearAll(){ vscode.postMessage({command:'clear'}); }
  </script>
  <title>Color History</title>
  </head>
  <body>
    <div class="toolbar">
      <button onclick="clearAll()">Clear History</button>
    </div>
    ${items.length ? `<div class="grid">${cards}</div>` : "<div class=\"empty\">No colors yet. Start typing colors to build history.</div>"}
  </body>
</html>`;
  }
}

module.exports = { ColorHistoryViewProvider };
