# 🌈 YivColor

A Visual Studio Code extension that displays color previews in any file type.

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Yivani.yivcolor?style=flat-square&label=VS%20Code%20Marketplace)

## ✨ Features

- 🎨 Display color previews for hex colors, rgb, rgba, hsl, hsv, hsb, cmyk, lab, lch, yuv, and ycbcr formats
- 📝 Works in specific file types and unsaved files
- ⚡ Automatically updates as you type
- 🔧 Highly customizable appearance options
- 📚 Support for numerous file types

![YivColor in action](images/preview.png)

### 🌟 Supported Color Formats:

- 🟣 Hex colors: `#ffffff`, `#fff`
- 🔴 RGB: `rgb(255, 255, 255)`
- 🟠 RGBA: `rgba(255, 255, 255, 0.5)`
- 🟡 HSL: `hsl(360, 100%, 100%)`
- 🟢 HSV: `hsv(360, 100%, 100%)`
- 🔵 HSB: `hsb(360, 100%, 100%)`
- 🟤 CMYK: `cmyk(0%, 100%, 100%, 0%)`
- ⚪ LAB: `lab(75%, 20, -10)`
- 🌕 LCH: `lch(75%, 30, 270)`
- 🌊 YUV: `yuv(50%, -30, 20)`
- 🌈 YCbCr: `ycbcr(235, 128, 128)`

### 📄 Supported File Types (by default):

- 🐍 Python (.py)
- ☕ Java (.java)
- 🔧 C (.c), C++ (.cpp), C/C++ Headers (.h)
- 🐹 Go (.go)
- 🦀 Rust (.rs)
- 🐘 PHP (.php)
- 🐚 Shell Scripts (.sh)
- 📋 YAML (.yaml, .yml)
- 📰 XML (.xml)
- 💾 SQL (.sql)
- 📝 TOML (.toml)
- 📊 JSON (.json)
- 📜 JavaScript (.js)
- 📘 TypeScript (.ts)
- ✒️ Markdown (.md)
- 📄 Text files (.txt)
- 📚 LaTeX (.tex)
- 🔖 INI (.ini)
- 📑 CSV (.csv), TSV (.tsv)
- 📓 Log files (.log)

---

## ⚙️ Configuration Options

YivColor offers numerous configuration options to customize its behavior according to your preferences.

### 🔍 How to Access Settings

There are multiple ways to access YivColor's settings:

1. **🖱️ Using the Settings UI:**
   - Go to File > Preferences > Settings (or press `Ctrl+,`)
   - Search for "YivColor" in the search bar
   - Adjust settings using the user-friendly interface

2. **📝 Using settings.json:**
   - Open your settings.json file
   - Add configuration under the "yivcolor" namespace

3. **⌨️ Using Command Palette:**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Preferences: Open Settings (UI)" and select it
   - Search for "YivColor"

### 🛠️ Available Settings

#### 🎛️ Basic Settings

- **🔌 Enable/Disable YivColor**: Turn the extension on or off globally
  - Setting: `yivcolor.enable`
  - Default: `true`

#### 🎭 Appearance Settings

- **📏 Preview Size**: Size of the color preview square in pixels
  - Setting: `yivcolor.appearance.previewSize`
  - Default: `14`
  - Range: 8-32 pixels

- **🖼️ Preview Border**: Show a border around color previews
  - Setting: `yivcolor.appearance.previewBorder`
  - Default: `true`
  - Helpful for making previews visible against similar-colored backgrounds

- **📍 Preview Position**: Where the color preview appears relative to the color code
  - Setting: `yivcolor.appearance.previewPosition`
  - Options: `before` (default) or `after`
  - Before: color preview appears before the color code
  - After: color preview appears after the color code

#### Color Format Settings

Select which color formats to detect and display:
- Setting: `yivcolor.colorFormats`
- Default: All formats enabled
- Available formats:
  - HEX: `#ffffff`, `#fff`
  - RGB: `rgb(255, 255, 255)`
  - RGBA: `rgba(255, 255, 255, 0.5)`
  - HSL: `hsl(360, 100%, 100%)`
  - HSV: `hsv(360, 100%, 100%)`
  - HSB: `hsb(360, 100%, 100%)`
  - CMYK: `cmyk(0%, 100%, 100%, 0%)`
  - LAB: `lab(75%, 20, -10)`
  - LCH: `lch(75%, 30, 270)`
  - YUV: `yuv(50%, -30, 20)`
  - YCBCR: `ycbcr(235, 128, 128)`

#### File Types

- **Supported File Types**: List of file extensions to enable color decorations
  - Setting: `yivcolor.supportedFileTypes`
  - Default: includes common programming, markup, and data file types

To add a new file type:
1. Go to VS Code settings
2. Search for "YivColor: Supported File Types"
3. Click "Add Item" and enter the file extension without the dot (e.g., `css` instead of `.css`)
4. Run the "YivColor: Refresh Settings" command from the Command Palette to apply changes

### Activity Bar Integration

YivColor adds a dedicated view in the Activity Bar that shows:
- A visual status indicator
- Quick settings controls
- Access to the full settings panel

### Status Bar Integration

YivColor adds a status bar indicator that shows whether the extension is active:
- ⚪️ When disabled: Shows "YivColor: Off"
- 🟢 When enabled: Shows "YivColor: On"
- Click on the status bar item to quickly toggle the extension on or off


#### Experimental Features

- **Untitled Files**: Enable color previews in untitled (unsaved) files
  - Setting: `yivcolor.experimental.enableUntitledFiles`
  - Default: `true`

- **Logging**: Enable console logging for debugging
  - Setting: `yivcolor.experimental.enableLogging`
  - Default: `false`
  - Only enable if you're experiencing issues

### Example settings.json Configuration

```json
{
  "yivcolor.enable": true,
  "yivcolor.appearance.previewSize": 16,
  "yivcolor.appearance.previewBorder": true,
  "yivcolor.appearance.previewPosition": "before",
  "yivcolor.colorFormats": ["HEX", "RGB", "RGBA", "HSL", "HSV"],
  "yivcolor.supportedFileTypes": [
    "py", "java", "js", "html", "css", "md"
  ],
  "yivcolor.experimental.enableUntitledFiles": true,
  "yivcolor.performance.enableCaching": true,
  "yivcolor.performance.throttleForLargeFiles": true
}
```

## Commands

- `YivColor: Refresh Settings` - Manually reload supported file types from settings. Use this after adding new file types to see immediate changes.
- `YivColor: Toggle Extension` - Enable or disable the extension.
- `YivColor: Optimize Performance` - Clean cache and optimize performance for color parsing.

To use these commands:
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open the Command Palette
2. Type the command name and select it

## Recent Changes

### Version 1.5.0
- Added performance optimization features
  - Color parsing cache to improve speed with repeated colors
  - Smart throttling for large files
  - Optimized regex patterns for better performance
- Added new "Optimize Performance" command
- Added performance configuration options

### Version 1.4.0
- Enhanced Activity Bar integration with visual status indicator and quick settings
- Added better file extension detection for special cases

### Version 1.3.0
- Enhanced settings interface with more customization options
- Support for additional file types
- Added support for HSV, HSB, CMYK, LAB, LCH, YUV, and YCbCr color formats

## Planned Features

### For Version 1.6.0
- Color history
  - Track recently detected colors in your workspace
  - Allow quick reuse of colors from history
  - Persistent color history between sessions

### Future Releases
1. Clickable color previews (Currently not available on VS Code)
2. Color picker integration (Currently not available on VS Code)
3. More intelligent color detection in comments and strings

## License

GNU v3.0
