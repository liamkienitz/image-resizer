# Image Resizer

A TypeScript-based image processing tool that converts and resizes images to multiple dimensions with intelligent file naming.

## Features

- **Multi-format Support**: PNG, JPEG, JPG, HEIC, SVG (case-insensitive)
- **Multiple Output Formats**: Convert to multiple target formats (PNG, WebP by default)
- **Batch Processing**: Process entire folders of images
- **Multiple Output Sizes**: Generate multiple resized versions of each image
- **Timestamped Organization**: Each run creates a timestamped folder for organized output
- **Smart File Naming**: Uses random ID, size, and creation date
- **Metadata Extraction**: Extracts creation date from EXIF data with fallback to file stats
- **Error Handling**: Robust error handling with detailed logging
- **TypeScript**: Full type safety and modern JavaScript features

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create input and output directories:

```bash
mkdir input output
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### VS Code Integration

Use the provided launch configurations (F5 or Debug panel):

- **Resize**: Builds the project and runs the compiled JavaScript for production use
- **Debug**: Runs in debug mode with TypeScript support and breakpoints enabled

## Configuration

Edit the `CONFIG` object in `src/index.ts`:

```typescript
const CONFIG = {
  INPUT_FOLDER: "./input", // Input directory path
  OUTPUT_FOLDER: "./output", // Output directory path
  TARGET_FORMATS: ["png", "webp"], // Output formats array
  OUTPUT_SIZES: [60, 120, 300, 600, 1200], // Pixel dimensions
  SUPPORTED_FORMATS: [".png", ".jpg", ".jpeg", ".heic", ".svg"],
};
```

## File Naming Convention

Output files follow this pattern:

```
<randomId>_<size>_<dateCreated>.<ext>
```

**Example:**

- Input: `vacation.jpg`
- Output folder: `output/2025-07-03_21-13-41/`
- Outputs:
  - `a1b2c3d4_60_2023-12-15.png`
  - `a1b2c3d4_60_2023-12-15.webp`
  - `a1b2c3d4_120_2023-12-15.png`
  - `a1b2c3d4_120_2023-12-15.webp`
  - `a1b2c3d4_300_2023-12-15.png`
  - `a1b2c3d4_300_2023-12-15.webp`
  - `a1b2c3d4_600_2023-12-15.png`
  - `a1b2c3d4_600_2023-12-15.webp`
  - `a1b2c3d4_1200_2023-12-15.png`
  - `a1b2c3d4_1200_2023-12-15.webp`

## How It Works

1. **Creates** a timestamped output folder for the current run
2. **Scans** the input folder for supported image formats
3. **Extracts** creation date from EXIF metadata (fallback to file creation date)
4. **Generates** a unique 8-character random ID for each image
5. **Resizes** each image to all configured dimensions
6. **Converts** to all target formats (PNG and WebP by default)
7. **Saves** with the structured naming convention in the timestamped folder

## Dependencies

- **sharp**: High-performance image processing
- **exifr**: EXIF metadata extraction
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
│   └── index.ts          # Main TypeScript application
├── dist/                 # Compiled JavaScript (auto-generated)
├── .vscode/
│   ├── launch.json       # VS Code debug configurations
│   └── tasks.json        # VS Code build tasks
├── input/                # Place images here for processing
│   └── .gitkeep          # Keeps directory in git
├── output/               # Processed images appear here
│   └── .gitkeep          # Keeps directory in git
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .gitignore           # Git ignore rules
└── README.md            # Documentation
```

### Git Best Practices

The project follows git best practices:

- **Input/Output folders**: Tracked in git but contents are ignored
- **Build artifacts**: `dist/` folder and build files are ignored
- **Dependencies**: `node_modules/` and lock files are ignored
- **IDE settings**: Personal VS Code settings are ignored
- **OS files**: System files like `.DS_Store` are ignored

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Run in development mode with ts-node
- `npm start`: Run compiled JavaScript
- `npm run clean`: Remove compiled files

## License

MIT
