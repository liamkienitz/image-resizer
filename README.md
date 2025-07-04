# Image Resizer

A modular TypeScript-based image processing tool that converts and resizes images to multiple dimensions with intelligent file organization and naming.

## Features

- **Multi-format Support**: PNG, JPEG, JPG, HEIC, SVG (case-insensitive)
- **HEIC Processing**: Advanced HEIC support with automatic conversion using `heic-convert` library
- **Multiple Output Formats**: Convert to multiple target formats (PNG, WebP by default)
- **Batch Processing**: Process entire folders of images simultaneously
- **Multiple Output Sizes**: Generate multiple resized versions of each image (60, 120, 300, 600, 1200px by default)
- **Organized File Structure**: Files organized by original filename and format type
- **Timestamped Runs**: Each processing run creates a timestamped folder with millisecond precision
- **Smart File Naming**: Uses random ID, size, and creation date for unique identification
- **Metadata Extraction**: Extracts creation date from EXIF data with fallback to file stats
- **Modular Architecture**: Clean separation of concerns with helper modules and repository pattern
- **Error Handling**: Robust error handling with detailed logging and processing summaries
- **TypeScript**: Full type safety and modern JavaScript features

## Installation

```bash
npm install
```

### VS Code Integration

Use the provided launch configurations (F5 or Debug panel):

- **Resize**: Builds the project and runs the compiled JavaScript for production use
- **Debug**: Runs in debug mode with TypeScript support and breakpoints enabled

## Configuration

Edit the `CONFIG` object in `src/config.ts`:

```typescript
const CONFIG = {
  INPUT_FOLDER: "./input", // Input directory path
  OUTPUT_FOLDER: "./output", // Output directory path
  TARGET_FORMATS: ["png", "webp"], // Output formats array
  OUTPUT_SIZES: [60, 120, 300, 600, 1200], // Pixel dimensions
  SUPPORTED_FORMATS: [".png", ".jpg", ".jpeg", ".heic", ".svg"],
};
```

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Run in development mode with ts-node
- `npm start`: Run compiled JavaScript
- `npm run clean`: Remove compiled files

## File Organization & Naming

### Directory Structure

Output files are organized in a hierarchical structure for easy management:

```
output/
└── 2024-07-04_14:30.123/          # Timestamped run folder (YYYY-MM-DD_HH:MM.SSS)
    ├── vacation-photo/             # Original filename (lowercase, spaces→dashes, max 15 chars)
    │   ├── png/                    # Format-specific folders
    │   │   ├── a1b2c3d4_60_2023-12-15.png
    │   │   ├── a1b2c3d4_120_2023-12-15.png
    │   │   ├── a1b2c3d4_300_2023-12-15.png
    │   │   ├── a1b2c3d4_600_2023-12-15.png
    │   │   └── a1b2c3d4_1200_2023-12-15.png
    │   └── webp/
    │       ├── a1b2c3d4_60_2023-12-15.webp
    │       ├── a1b2c3d4_120_2023-12-15.webp
    │       ├── a1b2c3d4_300_2023-12-15.webp
    │       ├── a1b2c3d4_600_2023-12-15.webp
    │       └── a1b2c3d4_1200_2023-12-15.webp
    └── img-7996/                   # HEIC file processed
        ├── png/
        └── webp/
```

### Naming Conventions

- **Timestamp Format**: `YYYY-MM-DD_HH:MM.SSS` (3-digit milliseconds)
- **Folder Names**: Original filename formatted as lowercase, spaces replaced with dashes, max 15 characters
- **File Names**: `<randomId>_<size>_<dateCreated>.<format>`

### Folder Name Examples

- `"Vacation Photo.jpg"` → `"vacation-photo"`
- `"IMG_7996.HEIC"` → `"img-7996"`
- `"Very Long Filename That Exceeds Limit.png"` → `"very-long-f..."`

## How It Works

1. **Creates** a timestamped output folder with millisecond precision
2. **Scans** the input folder for supported image formats
3. **Processes HEIC files** using `heic-convert` for better compatibility
4. **Extracts** creation date from EXIF metadata (fallback to file creation date)
5. **Generates** formatted folder names from original filenames
6. **Creates** organized directory structure by filename and format
7. **Generates** a unique 8-character random ID for each image
8. **Resizes** each image to all configured dimensions
9. **Converts** to all target formats (PNG and WebP by default)
10. **Saves** with organized structure and intelligent naming convention

## Dependencies

- **sharp**: High-performance image processing and resizing
- **heic-convert**: HEIC file format conversion support
- **exifr**: EXIF metadata extraction from images
- **TypeScript**: Type safety and modern JavaScript features

## Error Handling

- Unsupported file formats are skipped with warnings
- Processing errors are logged but don't stop batch processing
- Missing directories are created automatically
- Detailed summary report shows success/failure counts

## Development

### Project Structure

```
├── src/
│   ├── files/
│   │   ├── helpers/
│   │   │   ├── file-utils.ts         # File system utilities
│   │   │   ├── image-processor.ts    # Core image processing logic
│   │   │   └── metadata-extractor.ts # EXIF metadata extraction
│   │   ├── repo.ts                   # Repository pattern interface
│   │   └── types.ts                  # TypeScript interfaces
│   ├── config.ts                     # Configuration constants
│   ├── utils.ts                      # General utility functions
│   └── index.ts                      # Main application entry point
├── dist/                             # Compiled JavaScript (auto-generated)
├── .vscode/
│   ├── launch.json                   # VS Code debug configurations
│   └── tasks.json                    # VS Code build tasks
├── input/                            # Place images here for processing
│   └── .gitkeep                      # Keeps directory in git
├── output/                           # Processed images appear here
│   └── .gitkeep                      # Keeps directory in git
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── .gitignore                        # Git ignore rules
└── README.md                         # Documentation
```

### Architecture

The application follows a modular architecture with clear separation of concerns:

- **Repository Pattern**: Single interface (`ImageResizerRepo`) provides access to all helper functions
- **Modular Design**: Each helper file has a specific responsibility
- **Type Safety**: Full TypeScript support with defined interfaces
- **Error Handling**: Comprehensive error handling with detailed logging
