const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function run() {
  const publicDir = path.join(__dirname, '..', 'public');
  const artifactDir = 'C:/Users/Grun/.gemini/antigravity/brain/ad681467-3c87-41e2-a3e0-16e1c60866fc';

  // 1. EXACT ORIGINAL MOON EMBLEM on 4096x2304 16:9 canvas
  // Original moon badge is a circle #1a1a1a with #C1A98F border and the iconic crescent path M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z
  const moonCenteredSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="4096" height="2304" viewBox="0 0 4096 2304">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="65%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="#242424" />
          <stop offset="60%" stop-color="#181818" />
          <stop offset="100%" stop-color="#111111" />
        </radialGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#DFC8B0" />
          <stop offset="50%" stop-color="#C1A98F" />
          <stop offset="100%" stop-color="#9E856B" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="4096" height="2304" fill="url(#bgGrad)" />

      <!-- Center Moon Badge: exact same geometry as moon.svg / og-image.png, scaled up -->
      <g transform="translate(2048, 1152)">
        <circle cx="0" cy="0" r="700" fill="#1a1a1a" stroke="url(#goldGrad)" stroke-width="32" />
        <g transform="translate(-432, -432) scale(36)">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
    </svg>
  `;

  // 2. EXACT ORIGINAL FULL BANNER (Moon Badge + "My Lunar" typography + luxury double border) upscaled to 4096x2304
  const fullBrandBannerSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="4096" height="2304" viewBox="0 0 4096 2304">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="#242424" />
          <stop offset="70%" stop-color="#161616" />
          <stop offset="100%" stop-color="#111111" />
        </radialGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#DFC8B0" />
          <stop offset="50%" stop-color="#C1A98F" />
          <stop offset="100%" stop-color="#9E856B" />
        </linearGradient>
      </defs>

      <!-- Dark Luxury Background -->
      <rect width="4096" height="2304" fill="url(#bgGrad)" />

      <!-- Outer Luxury Double Border -->
      <rect x="100" y="100" width="3896" height="2104" fill="none" stroke="#C1A98F" stroke-width="5" stroke-opacity="0.3" rx="14" />
      <rect x="135" y="135" width="3826" height="2034" fill="none" stroke="#C1A98F" stroke-width="2.5" stroke-opacity="0.15" rx="8" />

      <!-- Center Moon Badge: matching og-image.png ratio exactly -->
      <g transform="translate(2048, 680)">
        <circle cx="0" cy="0" r="260" fill="#1a1a1a" stroke="url(#goldGrad)" stroke-width="12" />
        <g transform="translate(-150, -150) scale(12.5)">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="none" stroke="url(#goldGrad)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>

      <!-- Typography -->
      <text x="2048" y="1250" font-family="'Alex Brush', cursive, Georgia, serif" font-size="200" fill="#DFC8B0" text-anchor="middle" letter-spacing="8">
        My
      </text>
      <text x="2048" y="1490" font-family="Georgia, serif" font-size="150" font-weight="300" fill="#FFFFFF" text-anchor="middle" letter-spacing="50">
        L U N A R
      </text>

      <text x="2048" y="1710" font-family="system-ui, -apple-system, sans-serif" font-size="58" font-weight="400" fill="#A8A29E" text-anchor="middle" letter-spacing="22">
        LUXURY PERFUMES &amp; FINE JEWELRY
      </text>

      <line x1="1760" y1="1820" x2="2336" y2="1820" stroke="#C1A98F" stroke-width="3.5" stroke-opacity="0.4" />

      <text x="2048" y="1960" font-family="system-ui, -apple-system, sans-serif" font-size="50" font-weight="300" fill="#78716C" text-anchor="middle" letter-spacing="14">
        MYLUNAR.SHOP
      </text>
    </svg>
  `;

  // 3. TRANSPARENT MOON EMBLEM (4096x2304)
  const moonTransparentSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="4096" height="2304" viewBox="0 0 4096 2304">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#DFC8B0" />
          <stop offset="50%" stop-color="#C1A98F" />
          <stop offset="100%" stop-color="#9E856B" />
        </linearGradient>
      </defs>

      <g transform="translate(2048, 1152)">
        <circle cx="0" cy="0" r="700" fill="#1a1a1a" stroke="url(#goldGrad)" stroke-width="32" />
        <g transform="translate(-432, -432) scale(36)">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
    </svg>
  `;

  // Output paths
  const fileMoon = path.join(publicDir, 'ksiezyc-lunar-4096x2304.png');
  const fileFull = path.join(publicDir, 'my-lunar-official-4096x2304.png');
  const fileTrans = path.join(publicDir, 'ksiezyc-lunar-transparent-4096x2304.png');

  console.log('Rendering 1: Exact Moon Emblem (4096x2304)...');
  await sharp(Buffer.from(moonCenteredSvg)).resize(4096, 2304).png().toFile(fileMoon);

  console.log('Rendering 2: Official Full Brand Banner (4096x2304)...');
  await sharp(Buffer.from(fullBrandBannerSvg)).resize(4096, 2304).png().toFile(fileFull);

  console.log('Rendering 3: Transparent Moon (4096x2304)...');
  await sharp(Buffer.from(moonTransparentSvg)).resize(4096, 2304).png().toFile(fileTrans);

  // Copy to artifact directory for presentation & preview
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(fileMoon, path.join(artifactDir, 'ksiezyc-lunar-4096x2304.png'));
    fs.copyFileSync(fileFull, path.join(artifactDir, 'my-lunar-official-4096x2304.png'));
    fs.copyFileSync(fileTrans, path.join(artifactDir, 'ksiezyc-lunar-transparent-4096x2304.png'));
  }

  console.log('SUCCESS! All files generated in 4096x2304:');
  console.log(' - ' + fileMoon);
  console.log(' - ' + fileFull);
  console.log(' - ' + fileTrans);
}

run().catch(console.error);
