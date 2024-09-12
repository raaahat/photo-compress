const fs = require('fs');
const path = require('path');

// Directory where your files are located
const directory = 'compressed';

// Function to rename files
fs.readdir(directory, (err, files) => {
  if (err) {
    console.error('Error reading the directory:', err);
    return;
  }

  files.forEach((file, index) => {
    const oldPath = path.join(directory, file);

    // Create a new file name based on the current file name or other logic
    const newFileName = `image-${index}${path.extname(file)}`; // Example: new-file-name-1.txt
    const newPath = path.join(directory, newFileName);

    // Rename the file
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error(`Error renaming file ${file}:`, err);
      } else {
        console.log(`Renamed ${file} to ${newFileName}`);
      }
    });
  });
});
