import {
  generateRandomId,
  formatDate,
  createTimestampedFolderName,
} from "../utils";
import {
  isSupportedFormat,
  ensureDirectoryExists,
  getImageFiles,
} from "./helpers/file-utils";
import { processImage } from "./helpers/image-processor";
import { extractImageMetadata } from "./helpers/metadata-extractor";

/**
 * Repository class that provides access to all helper functions and utilities
 */
export class ImageResizerRepo {
  // Utility functions
  generateRandomId = generateRandomId;
  formatDate = formatDate;
  createTimestampedFolderName = createTimestampedFolderName;

  // File utilities
  isSupportedFormat = isSupportedFormat;
  ensureDirectoryExists = ensureDirectoryExists;
  getImageFiles = getImageFiles;

  // Image processing
  processImage = processImage;
  extractImageMetadata = extractImageMetadata;
}
