import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import exifr from "exifr";

// Configuration Constants
const CONFIG = {
  INPUT_FOLDER: "./input",
  OUTPUT_FOLDER: "./output",
  TARGET_FORMATS: ["png", "webp"] as const,
  OUTPUT_SIZES: [60, 120, 300, 600, 1200], // pixel dimensions
  SUPPORTED_FORMATS: [".png", ".jpg", ".jpeg", ".heic", ".svg"],
} as const;

// Types
interface ProcessingResult {
  inputFile: string;
  outputFiles: string[];
  success: boolean;
  error?: string;
}

interface ImageMetadata {
  dateCreated: string;
  width?: number;
  height?: number;
}

// Utility Functions
function generateRandomId(length: number = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
}

function createTimestampedFolderName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

async function extractImageMetadata(filePath: string): Promise<ImageMetadata> {
  try {
    // Try to extract EXIF data first
    const exifData = await exifr.parse(filePath);

    if (exifData?.DateTimeOriginal) {
      return {
        dateCreated: formatDate(new Date(exifData.DateTimeOriginal)),
      };
    }

    if (exifData?.CreateDate) {
      return {
        dateCreated: formatDate(new Date(exifData.CreateDate)),
      };
    }
  } catch (error) {
    console.warn(`Could not extract EXIF data from ${filePath}:`, error);
  }

  // Fallback to file creation date
  try {
    const stats = await fs.promises.stat(filePath);
    return {
      dateCreated: formatDate(stats.birthtime || stats.mtime),
    };
  } catch (error) {
    console.warn(`Could not get file stats for ${filePath}:`, error);
    return {
      dateCreated: formatDate(new Date()),
    };
  }
}

function isSupportedFormat(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return CONFIG.SUPPORTED_FORMATS.includes(ext as any);
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.promises.access(dirPath);
  } catch {
    await fs.promises.mkdir(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

async function processImage(
  inputPath: string,
  outputDir: string
): Promise<ProcessingResult> {
  const fileName = path.basename(inputPath);
  console.log(`Processing: ${fileName}`);

  try {
    // Extract metadata
    const metadata = await extractImageMetadata(inputPath);
    const randomId = generateRandomId();
    const outputFiles: string[] = [];

    // Process each format and size combination
    for (const format of CONFIG.TARGET_FORMATS) {
      for (const size of CONFIG.OUTPUT_SIZES) {
        const outputFileName = `${randomId}_${size}_${metadata.dateCreated}.${format}`;
        const outputPath = path.join(outputDir, outputFileName);

        // Process the image
        await sharp(inputPath)
          .resize(size, size, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .toFormat(format as any)
          .toFile(outputPath);

        outputFiles.push(outputFileName);
        console.log(`  → Generated: ${outputFileName}`);
      }
    }

    return {
      inputFile: fileName,
      outputFiles,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error processing ${fileName}:`, errorMessage);

    return {
      inputFile: fileName,
      outputFiles: [],
      success: false,
      error: errorMessage,
    };
  }
}

async function getImageFiles(inputDir: string): Promise<string[]> {
  try {
    const files = await fs.promises.readdir(inputDir);
    return files
      .filter((file) => isSupportedFormat(file))
      .map((file) => path.join(inputDir, file));
  } catch (error) {
    throw new Error(`Could not read input directory ${inputDir}: ${error}`);
  }
}

async function main(): Promise<void> {
  console.log("🖼️  Image Resizer Starting...");
  console.log(`Input folder: ${CONFIG.INPUT_FOLDER}`);
  console.log(`Output folder: ${CONFIG.OUTPUT_FOLDER}`);
  console.log(
    `Target formats: ${CONFIG.TARGET_FORMATS.map((f) => f.toUpperCase()).join(
      ", "
    )}`
  );
  console.log(`Output sizes: ${CONFIG.OUTPUT_SIZES.join(", ")} pixels`);
  console.log("");

  try {
    // Ensure input directory exists
    await ensureDirectoryExists(CONFIG.INPUT_FOLDER);
    await ensureDirectoryExists(CONFIG.OUTPUT_FOLDER);

    // Create timestamped output folder
    const timestampedFolderName = createTimestampedFolderName();
    const timestampedOutputDir = path.join(
      CONFIG.OUTPUT_FOLDER,
      timestampedFolderName
    );
    await ensureDirectoryExists(timestampedOutputDir);

    console.log(`Created output folder: ${timestampedFolderName}\n`);

    // Get all image files
    const imageFiles = await getImageFiles(CONFIG.INPUT_FOLDER);

    if (imageFiles.length === 0) {
      console.log("No supported image files found in input folder.");
      console.log(`Supported formats: ${CONFIG.SUPPORTED_FORMATS.join(", ")}`);
      return;
    }

    console.log(`Found ${imageFiles.length} image(s) to process\n`);

    // Process each image
    const results: ProcessingResult[] = [];
    for (const imagePath of imageFiles) {
      const result = await processImage(imagePath, timestampedOutputDir);
      results.push(result);
    }

    // Summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log("\n📊 Processing Summary:");
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(
      `📁 Total output files: ${results.reduce(
        (sum, r) => sum + r.outputFiles.length,
        0
      )}`
    );

    if (failed > 0) {
      console.log("\n❌ Failed files:");
      results
        .filter((r) => !r.success)
        .forEach((r) => console.log(`  - ${r.inputFile}: ${r.error}`));
    }

    console.log("\n🎉 Processing complete!");
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}

export { main, CONFIG };
