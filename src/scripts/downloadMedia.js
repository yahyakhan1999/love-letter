const fs = require('fs');
const path = require('path');
const https = require('https');
const { sections } = require('../data/sections');

const PUBLIC_DIR = path.join(__dirname, '../../public');
const MEDIA_DIR = path.join(PUBLIC_DIR, 'media');

// Create media directories if they don't exist
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// Function to download a file
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${url} -> ${filepath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if there was an error
      console.error(`Error downloading ${url}:`, err.message);
      reject(err);
    });
  });
}

// Function to get filename from URL
function getFilenameFromUrl(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const filename = pathname.split('/').pop();
  return filename || 'unknown';
}

// Main function to process all media
async function processMedia() {
  const mediaUrls = new Set();
  const updatedSections = [];

  // Collect all unique media URLs
  sections.forEach(section => {
    if (section.image) mediaUrls.add(section.image);
    if (section.backgroundImage) mediaUrls.add(section.backgroundImage);
    if (section.backgroundGif) mediaUrls.add(section.backgroundGif);
    if (section.foregroundGif) mediaUrls.add(section.foregroundGif);
    if (section.videoUrl) mediaUrls.add(section.videoUrl);
  });

  // Download each media file
  for (const url of mediaUrls) {
    if (url.startsWith('http')) {
      const filename = getFilenameFromUrl(url);
      const filepath = path.join(MEDIA_DIR, filename);
      try {
        await downloadFile(url, filepath);
      } catch (error) {
        console.error(`Failed to download ${url}`);
      }
    }
  }

  // Create updated sections with local paths
  sections.forEach(section => {
    const updatedSection = { ...section };
    
    if (section.image && section.image.startsWith('http')) {
      updatedSection.image = `/media/${getFilenameFromUrl(section.image)}`;
    }
    if (section.backgroundImage && section.backgroundImage.startsWith('http')) {
      updatedSection.backgroundImage = `/media/${getFilenameFromUrl(section.backgroundImage)}`;
    }
    if (section.backgroundGif && section.backgroundGif.startsWith('http')) {
      updatedSection.backgroundGif = `/media/${getFilenameFromUrl(section.backgroundGif)}`;
    }
    if (section.foregroundGif && section.foregroundGif.startsWith('http')) {
      updatedSection.foregroundGif = `/media/${getFilenameFromUrl(section.foregroundGif)}`;
    }
    if (section.videoUrl && section.videoUrl.startsWith('http')) {
      updatedSection.videoUrl = `/media/${getFilenameFromUrl(section.videoUrl)}`;
    }
    
    updatedSections.push(updatedSection);
  });

  // Save updated sections to a new file
  const updatedSectionsPath = path.join(__dirname, '../data/sections.backup.js');
  const sectionsContent = `export const sections = ${JSON.stringify(updatedSections, null, 2)};\n`;
  fs.writeFileSync(updatedSectionsPath, sectionsContent);
  
  console.log('Media download complete!');
  console.log('Updated sections saved to sections.backup.js');
}

// Run the script
processMedia().catch(console.error); 