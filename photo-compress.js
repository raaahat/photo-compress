"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
// Function to compress images in a folder
const compressImages = (inputDir, outputDir, quality) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure output directory exists
        yield fs_extra_1.default.ensureDir(outputDir);
        // Read all files from the input directory
        const files = yield fs_extra_1.default.readdir(inputDir);
        // Process each image file
        for (const file of files) {
            const filePath = path_1.default.join(inputDir, file);
            const outputFilePath = path_1.default.join(outputDir, file);
            // Check if the file is an image
            if (/\.(jpg|jpeg|png)$/i.test(file)) {
                yield (0, sharp_1.default)(filePath).jpeg({ quality }).toFile(outputFilePath);
                console.log(`Compressed: ${file}`);
            }
        }
    }
    catch (error) {
        console.error('Error compressing images:', error);
    }
});
// Define input and output directories and quality
const inputDir = './input'; // Replace with the path to your photos folder
const outputDir = './compressed'; // Output folder for compressed images
const quality = 50; // Compression quality (1-100)
compressImages(inputDir, outputDir, quality);
