// Configuration Constants
export const CONFIG = {
  INPUT_FOLDER: "./input",
  OUTPUT_FOLDER: "./output",
  TARGET_FORMATS: ["png", "webp"] as const,
  OUTPUT_SIZES: [60, 120, 300, 600, 1200], // pixel dimensions
  SUPPORTED_FORMATS: [".png", ".jpg", ".jpeg", ".heic", ".svg"],
} as const;

export type TargetFormat = typeof CONFIG.TARGET_FORMATS[number];
export type SupportedFormat = typeof CONFIG.SUPPORTED_FORMATS[number];
