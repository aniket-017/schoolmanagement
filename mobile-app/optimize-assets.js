const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

async function optimizeImage(inputPath, outputPath, options = {}) {
  try {
    const defaultOptions = {
      quality: 80,
      format: 'png',
      ...options
    };

    await sharp(inputPath)
      .resize(options.width, options.height, { 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ quality: defaultOptions.quality })
      .toFile(outputPath);

    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✓ ${path.basename(inputPath)}: ${(originalSize/1024).toFixed(1)}KB → ${(optimizedSize/1024).toFixed(1)}KB (${reduction}% reduction)`);
    
    return { originalSize, optimizedSize, reduction };
  } catch (error) {
    console.error(`✗ Error optimizing ${inputPath}:`, error.message);
    return null;
  }
}

async function optimizeAssets() {
  console.log('🔧 Optimizing assets for size reduction...\n');

  const optimizations = [
    {
      input: 'icon.png',
      output: 'icon-optimized.png',
      options: { width: 1024, height: 1024, quality: 85 }
    },
    {
      input: 'adaptive-icon.png',
      output: 'adaptive-icon-optimized.png',
      options: { width: 1024, height: 1024, quality: 85 }
    },
    {
      input: 'splash.png',
      output: 'splash-optimized.png',
      options: { width: 1242, height: 2436, quality: 80 }
    }
  ];

  let totalSaved = 0;
  let totalOriginal = 0;

  for (const opt of optimizations) {
    const inputPath = path.join(assetsDir, opt.input);
    const outputPath = path.join(assetsDir, opt.output);

    if (fs.existsSync(inputPath)) {
      const result = await optimizeImage(inputPath, outputPath, opt.options);
      if (result) {
        totalOriginal += result.originalSize;
        totalSaved += (result.originalSize - result.optimizedSize);
      }
    }
  }

  console.log(`\n📊 Total optimization results:`);
  console.log(`   Original size: ${(totalOriginal/1024).toFixed(1)}KB`);
  console.log(`   Saved: ${(totalSaved/1024).toFixed(1)}KB`);
  console.log(`   Reduction: ${(totalSaved/totalOriginal*100).toFixed(1)}%`);
}

optimizeAssets().catch(console.error); 