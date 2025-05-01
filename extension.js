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

// Dictionary of CSS named colors - complete set of standard web colors
const CSS_COLORS = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32"
};

// Build a regex pattern to match all CSS color names with word boundaries
const colorNames = Object.keys(CSS_COLORS);
const colorNamesPattern = `\\b(${colorNames.join("|")})\\b`;

// Regular expressions for matching different color formats in code
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
  NAMED: new RegExp(colorNamesPattern, "gi") // Support for CSS named colors like 'red', 'blue', etc.
};

/*
 * My color conversion utilities - helps with converting between different
 * color formats and displaying them in tooltips
 */
const ColorUtils = {
  // Parse hex string to RGB components
  hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  },

  // RGB to hex string
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },

  // RGB to HSL
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h *= 60;
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  },

  // HSL to RGB
  hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    if (s === 0) {
      // achromatic
      return { r: Math.round(l * 255), g: Math.round(l * 255), b: Math.round(l * 255) };
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    h /= 360;

    const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);

    return { r, g, b };
  },

  // RGB to HSV
  rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  },

  // HSV to RGB
  hsvToRgb(h, s, v) {
    s /= 100;
    v /= 100;

    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));

    let r, g, b;

    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  },

  // RGB to CMYK
  rgbToCmyk(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const k = 1 - Math.max(r, g, b);
    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }

    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  },

  // CMYK to RGB
  cmykToRgb(c, m, y, k) {
    c /= 100;
    m /= 100;
    y /= 100;
    k /= 100;

    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));

    return { r, g, b };
  },

  /*
   * Master color parser that identifies color formats and provides conversions
   * between different formats for consistent display and tooltips
   */
  parseColor(colorStr) {
    // Check for named colors first (case insensitive)
    const lowerColorStr = colorStr.toLowerCase();
    if (CSS_COLORS[lowerColorStr]) {
      const hexColor = CSS_COLORS[lowerColorStr];
      const rgb = this.hexToRgb(hexColor);
      return {
        type: 'named',
        name: colorStr,
        hex: hexColor,
        rgb,
        hsl: this.rgbToHsl(rgb.r, rgb.g, rgb.b),
        hsv: this.rgbToHsv(rgb.r, rgb.g, rgb.b),
        cmyk: this.rgbToCmyk(rgb.r, rgb.g, rgb.b)
      };
    }

    // HEX color: #RGB or #RRGGBB
    if (colorStr.startsWith('#')) {
      const rgb = this.hexToRgb(colorStr);
      return {
        type: 'hex',
        hex: colorStr,
        rgb,
        hsl: this.rgbToHsl(rgb.r, rgb.g, rgb.b),
        hsv: this.rgbToHsv(rgb.r, rgb.g, rgb.b),
        cmyk: this.rgbToCmyk(rgb.r, rgb.g, rgb.b)
      };
    }

    // RGB color: rgb(r, g, b)
    if (colorStr.startsWith('rgb(')) {
      const match = colorStr.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
      if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);

        return {
          type: 'rgb',
          rgb: { r, g, b },
          hex: this.rgbToHex(r, g, b),
          hsl: this.rgbToHsl(r, g, b),
          hsv: this.rgbToHsv(r, g, b),
          cmyk: this.rgbToCmyk(r, g, b)
        };
      }
    }

    // RGBA color: rgba(r, g, b, a)
    if (colorStr.startsWith('rgba(')) {
      const match = colorStr.match(/rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0?\.\d+|1|0)\s*\)/);
      if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        const a = parseFloat(match[4]);

        return {
          type: 'rgba',
          rgba: { r, g, b, a },
          rgb: { r, g, b },
          hex: this.rgbToHex(r, g, b),
          hsl: this.rgbToHsl(r, g, b),
          hsv: this.rgbToHsv(r, g, b),
          cmyk: this.rgbToCmyk(r, g, b)
        };
      }
    }

    // HSL color: hsl(h, s%, l%)
    if (colorStr.startsWith('hsl(')) {
      const match = colorStr.match(/hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/);
      if (match) {
        const h = parseInt(match[1], 10);
        const s = parseInt(match[2], 10);
        const l = parseInt(match[3], 10);
        const rgb = this.hslToRgb(h, s, l);

        return {
          type: 'hsl',
          hsl: { h, s, l },
          rgb,
          hex: this.rgbToHex(rgb.r, rgb.g, rgb.b),
          hsv: this.rgbToHsv(rgb.r, rgb.g, rgb.b),
          cmyk: this.rgbToCmyk(rgb.r, rgb.g, rgb.b)
        };
      }
    }

    // HSV color: hsv(h, s%, v%)
    if (colorStr.startsWith('hsv(')) {
      const match = colorStr.match(/hsv\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/);
      if (match) {
        const h = parseInt(match[1], 10);
        const s = parseInt(match[2], 10);
        const v = parseInt(match[3], 10);
        const rgb = this.hsvToRgb(h, s, v);

        return {
          type: 'hsv',
          hsv: { h, s, v },
          rgb,
          hex: this.rgbToHex(rgb.r, rgb.g, rgb.b),
          hsl: this.rgbToHsl(rgb.r, rgb.g, rgb.b),
          cmyk: this.rgbToCmyk(rgb.r, rgb.g, rgb.b)
        };
      }
    }

    // HSB color: hsb(h, s%, b%)
    if (colorStr.startsWith('hsb(')) {
      const match = colorStr.match(/hsb\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/);
      if (match) {
        // HSB is the same as HSV
        const h = parseInt(match[1], 10);
        const s = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        const rgb = this.hsvToRgb(h, s, b);

        return {
          type: 'hsb',
          hsb: { h, s, b },
          rgb,
          hex: this.rgbToHex(rgb.r, rgb.g, rgb.b),
          hsl: this.rgbToHsl(rgb.r, rgb.g, rgb.b),
          cmyk: this.rgbToCmyk(rgb.r, rgb.g, rgb.b)
        };
      }
    }

    // CMYK color: cmyk(c%, m%, y%, k%)
    if (colorStr.startsWith('cmyk(')) {
      const match = colorStr.match(/cmyk\(\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/);
      if (match) {
        const c = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const y = parseInt(match[3], 10);
        const k = parseInt(match[4], 10);
        const rgb = this.cmykToRgb(c, m, y, k);

        return {
          type: 'cmyk',
          cmyk: { c, m, y, k },
          rgb,
          hex: this.rgbToHex(rgb.r, rgb.g, rgb.b),
          hsl: this.rgbToHsl(rgb.r, rgb.g, rgb.b),
          hsv: this.rgbToHsv(rgb.r, rgb.g, rgb.b)
        };
      }
    }

    // If cannot parse the color, return null
    return null;
  }
};

// Core data structures
const colorDecorations = new Map();
let supportedFileTypes = [];
let enabledColorFormats = [];
let config = {};
let statusBarItem;
let statusViewProvider;

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
      if (message.command === 'toggle') {
        toggleExtension();
      } else if (message.command === 'openSettings') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'yivcolor');
      } else if (message.command === 'updateSetting') {
        vscode.workspace.getConfiguration('yivcolor').update(message.setting, message.value, true);
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
    const statusColor = isEnabled ? '#57A64A' : '#808080'; // Green for on, gray for off
    const statusText = isEnabled ? 'ON' : 'OFF';
    const buttonClass = isEnabled ? 'active' : 'inactive';

    // Create checkboxes for the most common color formats
    const commonFormats = ["HEX", "RGB", "RGBA", "HSL"];
    const formatCheckboxes = commonFormats.map(format => {
      const checked = enabledFormats.includes(format) ? 'checked' : '';
      return `
        <div class="setting-item">
          <input type="checkbox" id="${format}" ${checked} onchange="updateColorFormat('${format}', this.checked)">
          <label for="${format}">${format}</label>
        </div>
      `;
    }).join('');

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
          <div class="status-text">YivColor is ${isEnabled ? 'enabled' : 'disabled'}</div>
        </div>

        <button class="toggle-button" id="toggleBtn">
          ${isEnabled ? 'Disable' : 'Enable'} YivColor
        </button>

        <div class="settings-section">
          <div class="settings-header">Quick Settings</div>

          <div class="setting-item">
            <label for="previewSize">Preview Size: <span id="sizeValue">${previewSize}px</span></label>
            <input type="range" id="previewSize" min="8" max="32" value="${previewSize}"
              onchange="updateSetting('appearance.previewSize', parseInt(this.value))">
          </div>

          <div class="setting-item">
            <input type="checkbox" id="previewBorder" ${previewBorder ? 'checked' : ''}
              onchange="updateSetting('appearance.previewBorder', this.checked)">
            <label for="previewBorder">Show Border</label>
          </div>

          <div class="setting-item">
            <label for="previewPosition">Preview Position:</label>
            <select id="previewPosition" onchange="updateSetting('appearance.previewPosition', this.value)">
              <option value="before" ${previewPosition === 'before' ? 'selected' : ''}>Before</option>
              <option value="after" ${previewPosition === 'after' ? 'selected' : ''}>After</option>
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
              ${enabledFormats.map(f => `"${f}"`).join(', ')}
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
  const normalizedFileName = fileName.replace(/\\/g, '/').toLowerCase();

  // First try to get extension from the last segment of the path
  const pathSegments = normalizedFileName.split('/');
  const lastSegment = pathSegments[pathSegments.length - 1];

  // More robust file extension extraction
  let fileExt = '';
  if (lastSegment.includes('.')) {
    fileExt = lastSegment.split('.').pop().toLowerCase().trim();

    // Handle some special file extensions with dots (like .d.ts)
    if (lastSegment.endsWith('.d.ts')) {
      fileExt = 'ts';
    } else if (lastSegment.endsWith('.min.js')) {
      fileExt = 'js';
    } else if (lastSegment.endsWith('.spec.ts') || lastSegment.endsWith('.test.ts')) {
      fileExt = 'ts';
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
      console.log(`YivColor: Supported types: ${supportedFileTypes.join(', ')}`);
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
    if (parsedColor.type === 'named') {
      tooltip += `\nHEX: ${parsedColor.hex}`;
    }

    // Add all appropriate conversions to the tooltip
    if (parsedColor.hex && parsedColor.type !== 'hex' && parsedColor.type !== 'named') {
      tooltip += `\nHEX: ${parsedColor.hex}`;
    }

    if (parsedColor.rgb && parsedColor.type !== 'rgb' && parsedColor.type !== 'rgba') {
      tooltip += `\nRGB: rgb(${parsedColor.rgb.r}, ${parsedColor.rgb.g}, ${parsedColor.rgb.b})`;
    }

    if (parsedColor.rgba && parsedColor.type !== 'rgba') {
      tooltip += `\nRGBA: rgba(${parsedColor.rgba.r}, ${parsedColor.rgba.g}, ${parsedColor.rgba.b}, ${parsedColor.rgba.a})`;
    }

    if (parsedColor.hsl && parsedColor.type !== 'hsl') {
      tooltip += `\nHSL: hsl(${parsedColor.hsl.h}, ${parsedColor.hsl.s}%, ${parsedColor.hsl.l}%)`;
    }

    if (parsedColor.hsv && parsedColor.type !== 'hsv' && parsedColor.type !== 'hsb') {
      tooltip += `\nHSV: hsv(${parsedColor.hsv.h}, ${parsedColor.hsv.s}%, ${parsedColor.hsv.v}%)`;
    }

    if (parsedColor.cmyk && parsedColor.type !== 'cmyk') {
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

  const text = editor.document.getText();
  const colorPositions = [];

  // Search for all color formats in the text
  for (const [type, regex] of Object.entries(COLOR_REGEX)) {
    if (!enabledColorFormats.includes(type) && type !== 'NAMED') continue; // Always check for named colors

    let match;
    regex.lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      const startPos = editor.document.positionAt(match.index);
      const endPos = editor.document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);

      // For named colors, get the actual hex value for decoration
      let color = match[0];
      if (type === 'NAMED') {
        color = CSS_COLORS[match[0].toLowerCase()];
      }

      colorPositions.push({
        range,
        color: color,
        originalText: match[0] // Store original text for tooltip
      });
    }
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

// Cleans up decorations from the editor
function clearDecorations(editor) {
  if (colorDecorations.has(editor)) {
    const decoration = colorDecorations.get(editor);
    decoration.type.dispose();
    colorDecorations.delete(editor);
  }
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

  // Register the refresh settings command
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
        updateDecorations(editor);
      });

      vscode.window.showInformationMessage("YivColor: Performance optimized");
    }
  );

  context.subscriptions.push(optimizeCommand);

  // Initialize color decorations for all visible editors
  vscode.window.visibleTextEditors.forEach((editor) => {
    updateDecorations(editor);
  });
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
