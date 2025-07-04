import * as path from "path";
import * as fs from "fs";
import sharp from "sharp";
import convert from "heic-convert";
import { CONFIG } from "../../config";
import { generateRandomId } from "../../utils";
import { ProcessingResult } from "../types";
import { extractImageMetadata } from "./metadata-extractor";

/**
 * Converts HEIC file to JPEG buffer using heic-convert
 */
async function convertHeicToJpeg(inputPath: string): Promise<Buffer> {
  const inputBuffer = await fs.promises.readFile(inputPath);
  const outputBuffer = await convert({
    buffer: inputBuffer,
    format: "JPEG",
    quality: 1,
  });
  return Buffer.from(outputBuffer);
}

/**
 * Creates a formatted folder name from the original filename
 */
function createFormattedFolderName(inputPath: string): string {
  const fileNameWithoutExt = path.basename(inputPath, path.extname(inputPath));
  let formattedFolderName = fileNameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, ""); // Remove any non-alphanumeric characters except dashes

  // Limit folder name to 15 characters max
  if (formattedFolderName.length > 15) {
    formattedFolderName = formattedFolderName.substring(0, 12) + "...";
  }

  return formattedFolderName;
}

/**
 * Prepares image source for processing (handles HEIC conversion)
 */
async function prepareImageSource(inputPath: string): Promise<{
  tempBuffer: Buffer | null;
  imageSource: string;
}> {
  const isHeicFile = path.extname(inputPath).toLowerCase() === ".heic";
  let tempBuffer: Buffer | null = null;

  if (isHeicFile) {
    try {
      tempBuffer = await convertHeicToJpeg(inputPath);
      console.log(
        `  → Converted HEIC to JPEG buffer for processing for ${inputPath}`
      );
    } catch (heicError) {
      console.warn(
        `  → HEIC conversion failed, trying Sharp directly:`,
        heicError
      );
    }
  }

  return { tempBuffer, imageSource: inputPath };
}

/**
 * Creates directory structure for organized output
 */
async function createOutputDirectories(
  outputDir: string,
  formattedFolderName: string
): Promise<string> {
  const imageIdDir = path.join(outputDir, formattedFolderName);
  await fs.promises.mkdir(imageIdDir, { recursive: true });
  return imageIdDir;
}

/**
 * Processes images for all format and size combinations
 */
async function processImageFormats(args: {
  tempBuffer: Buffer | null;
  imageSource: string;
  imageIdDir: string;
  formattedFolderName: string;
  randomId: string;
  metadata: any;
}): Promise<string[]> {
  const outputFiles: string[] = [];

  for (const format of CONFIG.TARGET_FORMATS) {
    // Create format subdirectory
    const formatDir = path.join(args.imageIdDir, format);
    await fs.promises.mkdir(formatDir, { recursive: true });

    for (const size of CONFIG.OUTPUT_SIZES) {
      const outputFileName = `${args.randomId}_${size}_${args.metadata.dateCreated}.${format}`;
      const outputPath = path.join(formatDir, outputFileName);

      // Process the image - use converted buffer if available, otherwise original file
      let sharpInstance;
      if (args.tempBuffer) {
        sharpInstance = sharp(args.tempBuffer);
      } else {
        sharpInstance = sharp(args.imageSource);
      }

      await sharpInstance
        .resize(size, size, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFormat(format as any)
        .toFile(outputPath);

      outputFiles.push(
        path.join(args.formattedFolderName, format, outputFileName)
      );
      console.log(
        `  → Generated: ${args.formattedFolderName}/${format}/${outputFileName}`
      );
    }
  }

  return outputFiles;
}

/**
 * Processes a single image file, creating multiple sizes and formats
 */
export async function processImage(
  inputPath: string,
  outputDir: string
): Promise<ProcessingResult> {
  const fileName = path.basename(inputPath);
  console.log(`Processing: ${fileName}`);

  try {
    // Extract metadata and generate ID
    const metadata = await extractImageMetadata(inputPath);
    const randomId = generateRandomId();

    // Create formatted folder name
    const formattedFolderName = createFormattedFolderName(inputPath);

    // Prepare image source (handle HEIC conversion)
    const { tempBuffer, imageSource } = await prepareImageSource(inputPath);

    // Create output directories
    const imageIdDir = await createOutputDirectories(
      outputDir,
      formattedFolderName
    );

    // Process all format and size combinations
    const outputFiles = await processImageFormats({
      tempBuffer,
      imageSource,
      imageIdDir,
      formattedFolderName,
      randomId,
      metadata,
    });

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
