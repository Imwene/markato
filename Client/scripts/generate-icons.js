// scripts/generate-icons.js
import sharp from 'sharp';
import fs from 'fs/promises';
import { Buffer } from 'buffer';

const sizes = [
  { size: 16, name: 'favicon-16x16.png', maintainAspect: false },
  { size: 32, name: 'favicon-32x32.png', maintainAspect: false },
  { size: 180, name: 'apple-touch-icon.png', maintainAspect: true },
  { size: 192, name: 'android-chrome-192x192.png', maintainAspect: true },
  { size: 512, name: 'android-chrome-512x512.png', maintainAspect: true },
  { 
    width: 1200, 
    height: 630, 
    name: 'og-image.jpg', 
    maintainAspect: true 
  }
];

async function generateIcons() {
  const inputImage = await fs.readFile('src/assets/png_markato.png');
  
  // Get original image dimensions with error handling
  const metadata = await sharp(inputImage).metadata();
  const aspectRatio = metadata.width && metadata.height ? metadata.width / metadata.height : 1;

  for (const size of sizes) {
    // Handle both single size and width/height objects
    const width = size.width || size.size || 512;
    const height = size.height || size.size || 512;
    
    let resizeWidth = width;
    let resizeHeight = height;

    if (size.maintainAspect) {
      if (aspectRatio > 1) {
        resizeHeight = Math.round(width / aspectRatio);
      } else {
        resizeWidth = Math.round(height * aspectRatio);
      }
    }

    await sharp(inputImage)
      .resize(resizeWidth, resizeHeight, {
        fit: size.maintainAspect ? 'contain' : 'fill',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(`public/${size.name}`);
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

  // Generate OG Image specifically
  await sharp(inputImage)
    .resize(1200, 630, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .composite([{
      input: Buffer.from(`<svg><rect x="0" y="0" width="1200" height="630" fill="white"/></svg>`),
      blend: 'dest-over'
    }])
    .sharpen()
    .jpeg({ 
      quality: 100,
      chromaSubsampling: '4:4:4'
    })
    .toFile('public/og-image.jpg');

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);