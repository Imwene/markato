// scripts/generate-icons.js
import sharp from 'sharp';
import fs from 'fs/promises';

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' }
];

async function generateIcons() {
  const inputSvg = await fs.readFile('src/assets/markato-icon.svg');
  
  for (const { size, name } of sizes) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(`public/${name}`);
  }
  
  // Generate maskable icon with padding
  await sharp(inputSvg)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile('public/maskable-icon.png');
    
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);