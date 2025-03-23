# YivColor

A Visual Studio Code extension that displays color previews in any file type.

## Features

- Display color previews for hex colors, rgb, rgba, and hsl formats
- Works in specific file types and unsaved files
- Automatically updates as you type

## Usage

Simply open any supported file and YivColor will automatically detect and display color previews next to any valid color codes.

### Supported Color Formats:

- Hex colors: `#ffffff`, `#fff`
- RGB: `rgb(255, 255, 255)`
- RGBA: `rgba(255, 255, 255, 0.5)`
- HSL: `hsl(360, 100%, 100%)`

### Supported File Types (by default):

- Python (.py)
- Java (.java)
- C (.c)
- C++ (.cpp)
- C/C++ Headers (.h)
- Go (.go)
- Rust (.rs)
- PHP (.php)
- Shell Scripts (.sh)
- YAML (.yaml, .yml)
- XML (.xml)
- SQL (.sql)
- TOML (.toml)

## Extension Settings

This extension contributes the following settings:

- `yivcolor.enable`: Enable/disable YivColor (default: true)
- `yivcolor.supportedFileTypes`: List of file extensions to enable color decorations (without the dot, e.g. 'py' for Python files)

### Adding Support for More File Types:

1. Open VS Code Settings
2. Search for "YivColor"
3. Edit the "Yivcolor: Supported File Types" setting
4. Add your desired file extensions (without the dot)
5. If changes don't apply immediately, run the "YivColor: Refresh Settings" command from the Command Palette (F1)

## Commands

- `YivColor: Refresh Settings` - Manually reload supported file types from settings

## Recent Changes

### Version 1.2.0
- Added support for unsaved/untitled files
- Colors now display even before saving the file

## In Progress

1. Clickable
2. Changeable with a color palatte

## License

GNU v3.0
