import * as path from "path";
import { CONFIG } from "./config";
import { ProcessingResult } from "./files/types";
import { ImageResizerRepo } from "./files/repo";

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
    const repo = new ImageResizerRepo();

    // Ensure input directory exists
    await repo.ensureDirectoryExists(CONFIG.INPUT_FOLDER);
    await repo.ensureDirectoryExists(CONFIG.OUTPUT_FOLDER);

    // Create timestamped output folder
    const timestampedFolderName = repo.createTimestampedFolderName();
    const timestampedOutputDir = path.join(
      CONFIG.OUTPUT_FOLDER,
      timestampedFolderName
    );
    await repo.ensureDirectoryExists(timestampedOutputDir);

    console.log(`Created output folder: ${timestampedFolderName}\n`);

    // Get all image files
    const imageFiles = await repo.getImageFiles(CONFIG.INPUT_FOLDER);

    if (imageFiles.length === 0) {
      console.log("No supported image files found in input folder.");
      console.log(`Supported formats: ${CONFIG.SUPPORTED_FORMATS.join(", ")}`);
      return;
    }

    console.log(`Found ${imageFiles.length} image(s) to process\n`);

    // Process each image
    const results: ProcessingResult[] = [];
    for (const imagePath of imageFiles) {
      const result = await repo.processImage(imagePath, timestampedOutputDir);
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
