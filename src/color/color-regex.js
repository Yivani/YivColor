const { colorNamesPattern } = require("./css-colors");

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
  NAMED: new RegExp(colorNamesPattern, "gi")
};

module.exports = { COLOR_REGEX };
