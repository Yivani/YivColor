const { CSS_COLORS } = require("./css-colors");

const ColorUtils = {
  hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
  },
  rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
      const h = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return h.length === 1 ? "0" + h : h;
    }).join("");
  },
  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  },
  hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    if (s === 0) return { r: Math.round(l * 255), g: Math.round(l * 255), b: Math.round(l * 255) };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    h /= 360;
    const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
    return { r, g, b };
  },
  rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max; const d = max - min; s = max === 0 ? 0 : d / max;
    if (max === min) h = 0; else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
  },
  hsvToRgb(h, s, v) {
    s /= 100; v /= 100; const i = Math.floor(h / 60); const f = h / 60 - i;
    const p = v * (1 - s); const q = v * (1 - s * f); const t = v * (1 - s * (1 - f));
    let r, g, b; switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  },
  rgbToCmyk(r, g, b) {
    r /= 255; g /= 255; b /= 255; const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = (1 - r - k) / (1 - k); const m = (1 - g - k) / (1 - k); const y = (1 - b - k) / (1 - k);
    return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
  },
  cmykToRgb(c, m, y, k) {
    c /= 100; m /= 100; y /= 100; k /= 100;
    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));
    return { r, g, b };
  },
  parseColor(colorStr) {
    const lower = colorStr.toLowerCase();
    if (CSS_COLORS[lower]) {
      const hexColor = CSS_COLORS[lower];
      const rgb = this.hexToRgb(hexColor);
      return { type: "named", name: colorStr, hex: hexColor, rgb, hsl: this.rgbToHsl(rgb.r, rgb.g, rgb.b), hsv: this.rgbToHsv(rgb.r, rgb.g, rgb.b), cmyk: this.rgbToCmyk(rgb.r, rgb.g, rgb.b) };
    }
    if (colorStr.startsWith("#")) {
      const rgb = this.hexToRgb(colorStr);
      return { type: "hex", hex: colorStr, rgb, hsl: this.rgbToHsl(rgb.r, rgb.g, rgb.b), hsv: this.rgbToHsv(rgb.r, rgb.g, rgb.b), cmyk: this.rgbToCmyk(rgb.r, rgb.g, rgb.b) };
    }
    if (colorStr.startsWith("rgb(")) {
      const m = colorStr.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
      if (m) { const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10); return { type: "rgb", rgb: { r, g, b }, hex: this.rgbToHex(r, g, b), hsl: this.rgbToHsl(r, g, b), hsv: this.rgbToHsv(r, g, b), cmyk: this.rgbToCmyk(r, g, b) }; }
    }
    if (colorStr.startsWith("rgba(")) {
      const m = colorStr.match(/rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0?\.\d+|1|0)\s*\)/);
      if (m) { const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10), a = parseFloat(m[4]); return { type: "rgba", rgba: { r, g, b, a }, rgb: { r, g, b }, hex: this.rgbToHex(r, g, b), hsl: this.rgbToHsl(r, g, b), hsv: this.rgbToHsv(r, g, b), cmyk: this.rgbToCmyk(r, g, b) }; }
    }
    if (colorStr.startsWith("hsl(")) {
      const m = colorStr.match(/hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/);
      if (m) { const h = parseInt(m[1], 10), s = parseInt(m[2], 10), l = parseInt(m[3], 10); const rgb = this.hslToRgb(h, s, l); return { type: "hsl", hsl: { h, s, l }, rgb, hex: this.rgbToHex(rgb.r, rgb.g, rgb.b), hsv: this.rgbToHsv(rgb.r, rgb.g, rgb.b), cmyk: this.rgbToCmyk(rgb.r, rgb.g, rgb.b) }; }
    }
    if (colorStr.startsWith("hsv(")) {
      const m = colorStr.match(/hsv\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/);
      if (m) { const h = parseInt(m[1], 10), s = parseInt(m[2], 10), v = parseInt(m[3], 10); const rgb = this.hsvToRgb(h, s, v); return { type: "hsv", hsv: { h, s, v }, rgb, hex: this.rgbToHex(rgb.r, rgb.g, rgb.b), hsl: this.rgbToHsl(rgb.r, rgb.g, rgb.b), cmyk: this.rgbToCmyk(rgb.r, rgb.g, rgb.b) }; }
    }
    if (colorStr.startsWith("hsb(")) {
      const m = colorStr.match(/hsb\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/);
      if (m) { const h = parseInt(m[1], 10), s = parseInt(m[2], 10), b = parseInt(m[3], 10); const rgb = this.hsvToRgb(h, s, b); return { type: "hsb", hsb: { h, s, b }, rgb, hex: this.rgbToHex(rgb.r, rgb.g, rgb.b), hsl: this.rgbToHsl(rgb.r, rgb.g, rgb.b), cmyk: this.rgbToCmyk(rgb.r, rgb.g, rgb.b) }; }
    }
    if (colorStr.startsWith("cmyk(")) {
      const m = colorStr.match(/cmyk\(\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/);
      if (m) { const c = parseInt(m[1], 10), m2 = parseInt(m[2], 10), y = parseInt(m[3], 10), k = parseInt(m[4], 10); const rgb = this.cmykToRgb(c, m2, y, k); return { type: "cmyk", cmyk: { c, m: m2, y, k }, rgb, hex: this.rgbToHex(rgb.r, rgb.g, rgb.b), hsl: this.rgbToHsl(rgb.r, rgb.g, rgb.b), hsv: this.rgbToHsv(rgb.r, rgb.g, rgb.b) }; }
    }
    return null;
  }
};

module.exports = { ColorUtils };
