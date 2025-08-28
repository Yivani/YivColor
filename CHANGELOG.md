# Change Log

All notable changes to the "YivColor" extension will be documented in this file.

## [1.6.0] - 2025-08-28

### Added
- Workspace Color History: tracks recently detected colors across your workspace
- Activity Bar "Color History" view with copy and clear actions
- Command: "YivColor: Clear Color History"
- Setting: `yivcolor.history.maxItems` to control history size

### Performance
- Single-pass combined regex for color detection
- Debounced updates per document with version cache
- Shared decoration type to reduce churn
- Large-file handling with configurable thresholds and delays

### Changed
- Refactored color logic into modules under `src/color/` for maintainability
- Internal cleanup and minor stability improvements

## [1.2.1] - 2023-11-27

### Added
- Support for unsaved/untitled files
- Color preview now works even before saving a file
- Improved detection of untitled/unsaved files
- Added better logging for diagnosing file type issues

## [1.2.0] - 2023-11-26

### Added
- Support for unsaved/untitled files
- Color preview now works even before saving a file

## [1.1.0] - 2023-11-25

### Added
- "Refresh Settings" command for better handling of configuration changes
- Improved file type detection with better error handling
- Enhanced settings update mechanism
- Fixed issues with adding new file types through settings

## [1.0.0] - 2023-11-24

### Added
- Initial release
- Color preview for various formats (hex, rgb, rgba, hsl)
- Support for multiple file types (.py, .java, .c, .cpp, .h, .go, .rs, .php, .sh, .yaml, .yml, .xml, .sql, .toml)
- Configuration options to enable/disable extension
- Configuration options to specify supported file types
