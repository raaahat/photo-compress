const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp'); // Correct import for Jimp

// Setup for face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load face recognition models
async function loadModels() {
  const modelPath = path.join(__dirname, 'models'); // Folder containing the models
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
}

// Detect and group faces
async function detectAndGroupFaces(inputFolder, outputFolder) {
  await loadModels(); // Load models before processing images

  const faceEncodings = [];
  const groupedPhotos = {};

  const imageFiles = fs.readdirSync(inputFolder).filter((file) => {
    return (
      file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
    );
  });

  for (const file of imageFiles) {
    const imagePath = path.join(inputFolder, file);
    const img = await canvas.loadImage(imagePath);

    // Detect faces in the image
    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (detections.length === 0) {
      console.log(`No faces detected in ${file}`);
      continue;
    }

    for (const detection of detections) {
      const faceEncoding = detection.descriptor;

      let found = false;
      for (const [groupKey, group] of Object.entries(faceEncodings)) {
        const match =
          faceapi.euclideanDistance(faceEncoding, group.encoding) < 0.6;
        if (match) {
          // If groupKey exists, add the detection
          if (!groupedPhotos[groupKey]) {
            groupedPhotos[groupKey] = []; // Initialize array if it doesn't exist
          }
          groupedPhotos[groupKey].push({ imagePath, detection });
          found = true;
          break;
        }
      }

      // If no match, create a new group for the face
      if (!found) {
        const groupKey = `person_${Object.keys(faceEncodings).length}`;
        faceEncodings.push({ encoding: faceEncoding });
        groupedPhotos[groupKey] = [{ imagePath, detection }]; // Initialize new group with this face
      }
    }
  }

  // Save cropped faces
  for (const [groupKey, images] of Object.entries(groupedPhotos)) {
    const personFolder = path.join(outputFolder, groupKey);
    if (!fs.existsSync(personFolder)) {
      fs.mkdirSync(personFolder, { recursive: true });
    }

    for (let i = 0; i < images.length; i++) {
      const { imagePath, detection } = images[i];
      const img = await Jimp.read(imagePath); // Load the image with Jimp

      // Define padding (e.g., 20 pixels)
      const padding = 40;

      // Get the bounding box of the detected face
      const box = detection.detection.box;

      // Calculate new dimensions with padding, ensuring they don't exceed the image boundaries
      const x = Math.max(box.x - padding, 0); // Ensure x is not negative
      const y = Math.max(box.y - padding, 0); // Ensure y is not negative
      const width = Math.min(box.width + padding * 2, img.bitmap.width - x); // Ensure width doesn't exceed image
      const height = Math.min(box.height + padding * 2, img.bitmap.height - y); // Ensure height doesn't exceed image

      // Crop the face with padding
      const faceImage = img.crop(x, y, width, height);

      // Save the cropped face with padding
      const outputFilePath = path.join(personFolder, `${i}.jpg`);
      await faceImage.writeAsync(outputFilePath);
      console.log(`Saved cropped face with padding: ${outputFilePath}`);
    }
  }
}

// Usage
const inputFolder = path.join(__dirname, 'compressed');
const outputFolder = path.join(__dirname, 'output_images');
detectAndGroupFaces(inputFolder, outputFolder);
