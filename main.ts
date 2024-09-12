import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

// Function to compress images in a folder
const compressImages = async (
  inputDir: string,
  outputDir: string,
  quality: number
) => {
  try {
    // Ensure output directory exists
    await fs.ensureDir(outputDir);

    // Read all files from the input directory
    const files = await fs.readdir(inputDir);

    // Process each image file
    for (const file of files) {
      const filePath = path.join(inputDir, file);
      const outputFilePath = path.join(outputDir, file);

      // Check if the file is an image
      if (/\.(jpg|jpeg|png)$/i.test(file)) {
        await sharp(filePath).jpeg({ quality }).toFile(outputFilePath);

        console.log(`Compressed: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error compressing images:', error);
  }
};

// Define input and output directories and quality
const inputDir = './input'; // Replace with the path to your photos folder
const outputDir = './compressed'; // Output folder for compressed images
const quality = 50; // Compression quality (1-100)

compressImages(inputDir, outputDir, quality);
