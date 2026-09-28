const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;
const fs = require('fs');
const path = require('path');

const svgFile = path.join(__dirname, 'apps/super-admin/public/medrevflow-icon.svg');
const dirs = [
  path.join(__dirname, 'frontend/public'),
  path.join(__dirname, 'apps/super-admin/public')
];

async function generate() {
  const svgBuffer = fs.readFileSync(svgFile);

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Copy to favicon.svg
    fs.copyFileSync(svgFile, path.join(dir, 'favicon.svg'));

    // Generate PNGs
    await sharp(svgBuffer).resize(32, 32).toFile(path.join(dir, 'favicon-32x32.png'));
    await sharp(svgBuffer).resize(16, 16).toFile(path.join(dir, 'favicon-16x16.png'));
    await sharp(svgBuffer).resize(180, 180).toFile(path.join(dir, 'apple-touch-icon.png'));
    await sharp(svgBuffer).resize(192, 192).toFile(path.join(dir, 'icon-192.png'));
    await sharp(svgBuffer).resize(512, 512).toFile(path.join(dir, 'icon-512.png'));

    // Create intermediate pngs for ICO
    await sharp(svgBuffer).resize(48, 48).toFile(path.join(dir, 'icon-48.png'));

    // Generate ICO
    const buf = await pngToIco([
      path.join(dir, 'favicon-16x16.png'),
      path.join(dir, 'favicon-32x32.png'),
      path.join(dir, 'icon-48.png')
    ]);
    fs.writeFileSync(path.join(dir, 'favicon.ico'), buf);
    fs.unlinkSync(path.join(dir, 'icon-48.png'));
    
    console.log('Finished generating icons in', dir);
  }
}

generate().catch(console.error);
