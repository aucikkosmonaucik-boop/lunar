const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateAssets() {
  const publicIconsDir = path.join(__dirname, 'public', 'icons');
  if (!fs.existsSync(publicIconsDir)) {
    fs.mkdirSync(publicIconsDir, { recursive: true });
  }

  const createIconSvg = (size, bg = true) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${bg ? `<circle cx="${size/2}" cy="${size/2}" r="${size/2 * 0.95}" fill="#1a1a1a" stroke="#C1A98F" stroke-width="${Math.max(1, size * 0.03)}"/>` : ''}
      <g transform="translate(${size * 0.22}, ${size * 0.22}) scale(${size * 0.56 / 24})">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="none" stroke="#C1A98F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>
  `;

  const sizes = [
    { size: 16, dest: path.join(__dirname, 'public', 'favicon-16x16.png') },
    { size: 32, dest: path.join(__dirname, 'public', 'favicon-32x32.png') },
    { size: 48, dest: path.join(publicIconsDir, 'icon-48.png') },
    { size: 96, dest: path.join(publicIconsDir, 'icon-96.png') },
    { size: 144, dest: path.join(publicIconsDir, 'icon-144.png') },
    { size: 180, dest: path.join(publicIconsDir, 'apple-touch-icon.png') },
    { size: 192, dest: path.join(publicIconsDir, 'icon-192.png') },
    { size: 512, dest: path.join(publicIconsDir, 'icon-512.png') },
    { size: 512, dest: path.join(publicIconsDir, 'icon-maskable-512.png') },
  ];

  for (const item of sizes) {
    const svgBuffer = Buffer.from(createIconSvg(item.size, true));
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(item.dest);
    console.log(`Generated: ${item.dest} (${item.size}x${item.size})`);
  }

  const ico32Buffer = await sharp(Buffer.from(createIconSvg(32, true))).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), ico32Buffer);
  console.log('Generated: public/favicon.ico');

  const ogSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="#242424" />
          <stop offset="100%" stop-color="#121212" />
        </radialGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#DFC8B0" />
          <stop offset="50%" stop-color="#C1A98F" />
          <stop offset="100%" stop-color="#9E856B" />
        </linearGradient>
      </defs>

      <rect width="1200" height="630" fill="url(#bgGrad)" />
      <rect x="30" y="30" width="1140" height="570" fill="none" stroke="#C1A98F" stroke-width="1.5" stroke-opacity="0.3" rx="4" />
      <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#C1A98F" stroke-width="0.75" stroke-opacity="0.15" rx="2" />

      <g transform="translate(540, 130)">
        <circle cx="60" cy="60" r="58" fill="#1a1a1a" stroke="url(#goldGrad)" stroke-width="2.5" />
        <g transform="translate(27, 27) scale(2.75)">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="none" stroke="url(#goldGrad)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>

      <text x="600" y="345" font-family="'Alex Brush', cursive, Georgia, serif" font-size="56" fill="#DFC8B0" text-anchor="middle" letter-spacing="2">
        My
      </text>
      <text x="600" y="410" font-family="Georgia, serif" font-size="42" font-weight="300" fill="#FFFFFF" text-anchor="middle" letter-spacing="14">
        L U N A R
      </text>

      <text x="600" y="470" font-family="system-ui, sans-serif" font-size="16" font-weight="400" fill="#A8A29E" text-anchor="middle" letter-spacing="6">
        LUXURY PERFUMES &amp; FINE JEWELRY
      </text>

      <line x1="520" y1="500" x2="680" y2="500" stroke="#C1A98F" stroke-width="1" stroke-opacity="0.4" />
      
      <text x="600" y="540" font-family="system-ui, sans-serif" font-size="14" font-weight="300" fill="#78716C" text-anchor="middle" letter-spacing="4">
        MYLUNAR.SHOP
      </text>
    </svg>
  `;

  const ogBuffer = Buffer.from(ogSvg);
  const ogDest = path.join(__dirname, 'public', 'og-image.png');
  await sharp(ogBuffer)
    .resize(1200, 630)
    .png({ quality: 95 })
    .toFile(ogDest);
  console.log(`Generated: ${ogDest} (1200x630)`);
}

generateAssets().then(() => console.log('All brand assets successfully generated!')).catch(console.error);
