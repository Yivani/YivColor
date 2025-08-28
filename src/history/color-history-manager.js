/*
 * Color History Manager
 * Tracks colors seen in the workspace and persists them per-workspace.
 */
const vscode = require("vscode");

class ColorHistoryManager {
  constructor() {
    this._memento = undefined; // workspaceState
    this._items = []; // [{ color: '#rrggbb', count: number, lastUsed: number }]
    this._maxItems = 100;
    this._onDidChange = new vscode.EventEmitter();
    this.onDidChange = this._onDidChange.event;
  }

  initialize(memento, config) {
    this._memento = memento;
    this._maxItems = (config && config.get && config.get("history.maxItems", 100)) || 100;
    const saved = this._memento.get("yivcolor.history", []);
    if (Array.isArray(saved)) {
      this._items = saved;
    }
  }

  getAll() {
    return this._items.slice();
  }

  clear() {
    this._items = [];
    this._save();
  }

  addColors(colorsIterable) {
    if (!colorsIterable) return;
    const now = Date.now();
    const set = new Set(colorsIterable);
    let changed = false;

    for (const raw of set) {
      if (!raw || typeof raw !== "string") continue;
      const color = raw.trim().toLowerCase();
      if (!/^#([0-9a-f]{6}|[0-9a-f]{3})$/.test(color)) {
        // Only track canonical hex for simplicity
        continue;
      }
      const idx = this._items.findIndex((i) => i.color === color);
      if (idx >= 0) {
        const item = this._items[idx];
        item.count = (item.count || 0) + 1;
        item.lastUsed = now;
        // Move to front to reflect recency
        this._items.splice(idx, 1);
        this._items.unshift(item);
      } else {
        this._items.unshift({ color, count: 1, lastUsed: now });
        // Trim
        if (this._items.length > this._maxItems) {
          this._items.length = this._maxItems;
        }
      }
      changed = true;
    }

    if (changed) {
      this._save();
    }
  }

  _save() {
    if (!this._memento) return;
    this._memento.update("yivcolor.history", this._items);
    this._onDidChange.fire(this.getAll());
  }
}

module.exports = { ColorHistoryManager: new ColorHistoryManager() };
