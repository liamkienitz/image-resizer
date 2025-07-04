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
 * Processes a single image file, creating multiple sizes and formats
 */
export async function processImage(
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

    // Create formatted folder name from original filename
    const fileNameWithoutExt = path.basename(
      inputPath,
      path.extname(inputPath)
    );
    const formattedFolderName = fileNameWithoutExt
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, ""); // Remove any non-alphanumeric characters except dashes

    // Check if this is a HEIC file and try to convert it first
    const isHeicFile = path.extname(inputPath).toLowerCase() === ".heic";
    let imageSource = inputPath;
    let tempBuffer: Buffer | null = null;

    if (isHeicFile) {
      try {
        tempBuffer = await convertHeicToJpeg(inputPath);
        console.log(`  → Converted HEIC to JPEG buffer for processing`);
      } catch (heicError) {
        console.warn(
          `  → HEIC conversion failed, trying Sharp directly:`,
          heicError
        );
      }
    }

    // Create organized directory structure: outputDir/formattedFolderName/format/
    const imageIdDir = path.join(outputDir, formattedFolderName);
    await fs.promises.mkdir(imageIdDir, { recursive: true });

    // Process each format and size combination
    for (const format of CONFIG.TARGET_FORMATS) {
      // Create format subdirectory
      const formatDir = path.join(imageIdDir, format);
      await fs.promises.mkdir(formatDir, { recursive: true });

      for (const size of CONFIG.OUTPUT_SIZES) {
        const outputFileName = `${randomId}_${size}_${metadata.dateCreated}.${format}`;
        const outputPath = path.join(formatDir, outputFileName);

        // Process the image - use converted buffer if available, otherwise original file
        let sharpInstance;
        if (tempBuffer) {
          sharpInstance = sharp(tempBuffer);
        } else {
          sharpInstance = sharp(imageSource);
        }

        await sharpInstance
          .resize(size, size, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .toFormat(format as any)
          .toFile(outputPath);

        outputFiles.push(
          path.join(formattedFolderName, format, outputFileName)
        );
        console.log(
          `  → Generated: ${formattedFolderName}/${format}/${outputFileName}`
        );
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
