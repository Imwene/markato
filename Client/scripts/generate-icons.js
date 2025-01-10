// scripts/generate-icons.js
import sharp from 'sharp';
import fs from 'fs/promises';

const sizes = [
  { size: 16, name: 'favicon-16x16.png', maintainAspect: false },
  { size: 32, name: 'favicon-32x32.png', maintainAspect: false },
  { size: 180, name: 'apple-touch-icon.png', maintainAspect: true },
  { size: 192, name: 'android-chrome-192x192.png', maintainAspect: true },
  { size: 512, name: 'android-chrome-512x512.png', maintainAspect: true }
];

async function generateIcons() {
  const inputImage = await fs.readFile('src/assets/png_markato.png');
  
  // Get original image dimensions
  const metadata = await sharp(inputImage).metadata();
  const aspectRatio = metadata.width / metadata.height;

  for (const { size, name, maintainAspect } of sizes) {
    let width = size;
    let height = size;

    if (maintainAspect) {
      // For larger icons, maintain the original aspect ratio
      // but ensure the image fits within the target size
      if (aspectRatio > 1) {
        height = Math.round(size / aspectRatio);
      } else {
        width = Math.round(size * aspectRatio);
      }
    }

    await sharp(inputImage)
      .resize(width, height, {
        fit: maintainAspect ? 'contain' : 'fill',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(`public/${name}`);
  }

  // Generate maskable icon with padding and background
  const maskableSize = 512;
  const padding = Math.round(maskableSize * 0.1); // 10% padding

  await sharp(inputImage)
    .resize(maskableSize - (padding * 2), Math.round((maskableSize - (padding * 2)) / aspectRatio), {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile('public/maskable-icon.png');

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);