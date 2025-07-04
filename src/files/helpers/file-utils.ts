import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "../../config";

/**
 * Checks if a file has a supported image format
 */
export function isSupportedFormat(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return CONFIG.SUPPORTED_FORMATS.includes(ext as any);
}

/**
 * Ensures a directory exists, creating it if necessary
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.promises.access(dirPath);
  } catch {
    await fs.promises.mkdir(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Gets all supported image files from a directory
 */
export async function getImageFiles(inputDir: string): Promise<string[]> {
  try {
    const files = await fs.promises.readdir(inputDir);
    return files
      .filter((file) => isSupportedFormat(file))
      .map((file) => path.join(inputDir, file));
  } catch (error) {
    throw new Error(`Could not read input directory ${inputDir}: ${error}`);
  }
}
