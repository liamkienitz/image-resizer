import * as fs from "fs";
import exifr from "exifr";
import { formatDate } from "../../utils";
import { ImageMetadata } from "../types";

/**
 * Extracts metadata from an image file, including creation date from EXIF data
 */
export async function extractImageMetadata(
  filePath: string
): Promise<ImageMetadata> {
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
