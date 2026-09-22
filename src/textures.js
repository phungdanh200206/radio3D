import * as THREE from 'three';

/**
 * Ultra-realistic Natural Wood Procedural Texture Generator
 * Features:
 * - Natural growth rings with organic radial curvature
 * - Micro-fibers and authentic wood grain striations
 * - Wood pore / vessel tom marks (tom gỗ)
 * - Matching Normal/Bump and Roughness maps for PBR physical shading
 */

export function createRealisticWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  // 1. Base natural warm oak/walnut gradient
  const baseGrad = ctx.createLinearGradient(0, 0, canvas.width * 0.3, canvas.height);
  baseGrad.addColorStop(0.0, '#cda073'); // Warm natural honey oak
  baseGrad.addColorStop(0.25, '#be8f60');
  baseGrad.addColorStop(0.5, '#af7d4e');
  baseGrad.addColorStop(0.75, '#be8f60');
  baseGrad.addColorStop(1.0, '#a67243');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Large undulating annual growth rings
  const ringCenter = { x: canvas.width * 0.45, y: -canvas.height * 0.8 };
  const numRings = 36;
  ctx.save();
  for (let r = 0; r < numRings; r++) {
    const radius = 600 + r * 65;
    ctx.beginPath();
    ctx.lineWidth = 18 + Math.sin(r * 0.7) * 8;
    ctx.strokeStyle = r % 2 === 0
      ? 'rgba(105, 62, 30, 0.26)'  // Darker autumn ring
      : 'rgba(235, 195, 150, 0.20)'; // Lighter spring ring

    for (let angle = 0; angle <= Math.PI; angle += 0.02) {
      // Natural organic wave distortion
      const distOffset = Math.sin(angle * 12 + r * 0.5) * 14 +
                         Math.cos(angle * 6) * 22 +
                         Math.sin(angle * 28) * 5;
      const curRadius = radius + distOffset;
      const x = ringCenter.x + Math.cos(angle) * (curRadius * 1.6);
      const y = ringCenter.y + Math.sin(angle) * curRadius;
      if (angle === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 3. Dense longitudinal wood fibers (thớ gỗ dài)
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 2400; i++) {
    const y = Math.random() * canvas.height;
    const alpha = 0.04 + Math.random() * 0.12;
    const isDark = Math.random() > 0.45;
    ctx.strokeStyle = isDark
      ? `rgba(75, 42, 18, ${alpha})`
      : `rgba(245, 215, 175, ${alpha * 0.8})`;

    ctx.beginPath();
    ctx.moveTo(0, y);
    // Slight wavy path
    let curX = 0;
    let curY = y;
    while (curX < canvas.width) {
      curX += 80;
      curY += (Math.random() - 0.5) * 3;
      ctx.lineTo(curX, curY);
    }
    ctx.stroke();
  }

  // 4. Wood Pores / Vessels (Tom gỗ li ti)
  for (let p = 0; p < 3500; p++) {
    const px = Math.random() * canvas.width;
    const py = Math.random() * canvas.height;
    const pLen = 6 + Math.random() * 18;
    ctx.strokeStyle = `rgba(55, 30, 12, ${0.15 + Math.random() * 0.25})`;
    ctx.lineWidth = 0.8 + Math.random() * 0.8;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + pLen, py + (Math.random() - 0.5) * 1.5);
    ctx.stroke();
  }

  // 5. Subtle natural knots and mineral streaks
  const knotCenters = [
    { x: canvas.width * 0.25, y: canvas.height * 0.35, rx: 60, ry: 28 },
    { x: canvas.width * 0.72, y: canvas.height * 0.68, rx: 75, ry: 35 }
  ];
  knotCenters.forEach(k => {
    const knotGrad = ctx.createRadialGradient(k.x, k.y, 2, k.x, k.y, k.rx);
    knotGrad.addColorStop(0.0, 'rgba(65, 32, 12, 0.45)');
    knotGrad.addColorStop(0.4, 'rgba(95, 52, 22, 0.25)');
    knotGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = knotGrad;
    ctx.beginPath();
    ctx.ellipse(k.x, k.y, k.rx, k.ry, 0.1, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  return texture;
}

export function createRealisticWoodBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Neutral mid-grey bump
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Micro-grooves along wood grain
  for (let i = 0; i < 1800; i++) {
    const y = Math.random() * canvas.height;
    const isRaised = Math.random() > 0.5;
    ctx.strokeStyle = isRaised
      ? `rgba(255, 255, 255, ${0.1 + Math.random() * 0.18})`
      : `rgba(0, 0, 0, ${0.12 + Math.random() * 0.22})`;
    ctx.lineWidth = 1 + Math.random() * 1.5;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }

  // Pores in bump map
  for (let p = 0; p < 2000; p++) {
    const px = Math.random() * canvas.width;
    const py = Math.random() * canvas.height;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 8 + Math.random() * 12, py);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  return texture;
}

export function createRealisticWoodRoughnessTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base roughness (~0.4 satin varnish)
  ctx.fillStyle = '#686868';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 600; i++) {
    const y = Math.random() * canvas.height;
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 2 + Math.random() * 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  return texture;
}

// Diamond Knurling Normal/Bump Map for the Ø35mm Metal Knob
export function createKnurlBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#7f7f7f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const step = 8;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  for (let i = -canvas.height; i < canvas.width * 2; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + canvas.height, canvas.height);
    ctx.stroke();
  }

  ctx.strokeStyle = '#222222';
  for (let i = -canvas.height; i < canvas.width * 2; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, canvas.height);
    ctx.lineTo(i + canvas.height, 0);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 4);
  return texture;
}

// Cassette Tape Label Texture ("Best Wishes" / Album "Tam Thái Tử" - J97)
export function createCassetteLabelTexture(songTitle = 'Best Wishes', themeStyle = 'classic') {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  // Classic Vintage Tape Label (As drawn in original Blueprint MB-001)
  ctx.fillStyle = '#f6efe0'; // Vintage cream paper
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border inset
  ctx.strokeStyle = '#d4cbb8';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Retro decorative stripes (Wine red & Navy)
  ctx.fillStyle = '#b93b2a';
  ctx.fillRect(40, 105, canvas.width - 80, 12);
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(40, 125, canvas.width - 80, 6);

  // Song / Album Title - Elegant cursive script font as drawn in MB-001
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'italic bold 52px "Brush Script MT", "Segoe Script", "Dancing Script", cursive, serif';
  ctx.textAlign = 'center';
  ctx.fillText(songTitle || 'Best Wishes', canvas.width / 2, 85);

  // Badges & Meta
  ctx.font = 'bold 28px "Courier New", monospace, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SIDE A', 60, 82);
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.fillText('MINI CASSETTE 60', 60, 175);

  ctx.textAlign = 'right';
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  ctx.fillText('MB-001', canvas.width - 60, 82);
  ctx.font = '18px "Segoe UI", sans-serif';
  ctx.fillText('HIGH FIDELITY STEREO', canvas.width - 60, 175);

  // Center window cutout area (dark smoke window)
  ctx.fillStyle = '#1c1b18';
  ctx.fillRect(230, 210, 540, 220);
  ctx.strokeStyle = '#8d8579';
  ctx.lineWidth = 4;
  ctx.strokeRect(230, 210, 540, 220);

  // Time counter scale
  ctx.fillStyle = '#f39c12';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('100   ·   50   ·    0', canvas.width / 2, 238);

  // Bottom trapezoid tape head area
  ctx.beginPath();
  ctx.moveTo(310, canvas.height - 30);
  ctx.lineTo(350, canvas.height - 130);
  ctx.lineTo(650, canvas.height - 130);
  ctx.lineTo(690, canvas.height - 30);
  ctx.closePath();
  ctx.fillStyle = '#22201e';
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 4 corner screws
  const screwPoints = [
    [50, 50],
    [canvas.width - 50, 50],
    [50, canvas.height - 50],
    [canvas.width - 50, canvas.height - 50]
  ];
  ctx.fillStyle = '#888';
  screwPoints.forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Diagonal Glass Specular Sheen Highlight
export function createGlassSheenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.42, 'rgba(255, 255, 255, 0.45)');
  grad.addColorStop(0.46, 'rgba(255, 255, 255, 0.15)');
  grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.35)');
  grad.addColorStop(0.60, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Brushed Metal Texture
export function createBrushedMetalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#dcdde1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 800; i++) {
    const x = Math.random() * canvas.width;
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(100, 105, 115, 0.25)';
    ctx.lineWidth = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Official Real Concept Photos of Jack - J97 (Album Tam Thái Tử)
 * Framed into authentic 35mm Film Slide Frame with Sprocket Holes and Kodak Portra 400 Markings
 */

const _imageCache = {};

export function preloadPhoto(url) {
  if (_imageCache[url]) return _imageCache[url];
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  _imageCache[url] = img;
  return img;
}

export const ALBUM_SLIDE_CONFIGS = [
  {
    title: 'Người Dưng',
    subtitle: 'ALBUM TAM THÁI TỬ • NO.2',
    imageUrl: '/photos/jack_water.png',
    frameCode: '01A',
    crop: null // Full cinematic shot: Jack in dark water at night
  },
  {
    title: 'Lưu Niên',
    subtitle: 'ALBUM TAM THÁI TỬ • NO.4',
    imageUrl: '/photos/jack_red_suit.jpg',
    frameCode: '02A',
    crop: null // Full shot: Jack in burgundy suit on wooden dock
  },
  {
    title: 'Anh Yêu Em (我爱你)',
    subtitle: 'ALBUM TAM THÁI TỬ • NO.3',
    imageUrl: '/photos/jack_boat_raw.png',
    frameCode: '03A',
    crop: { sx: 0, sy: 60, sw: 640, sh: 360 } // Cropped clean: removes 60px black bars top/bottom
  },
  {
    title: 'Hoa Trong Đá',
    subtitle: 'ALBUM TAM THÁI TỬ • NO.1',
    imageUrl: '/photos/jack_red_suit.jpg',
    frameCode: '04A',
    crop: { sx: 220, sy: 70, sw: 580, sh: 480 } // Portrait close-up on Jack in red suit
  },
  {
    title: 'Nát Tan Cõi Lòng',
    subtitle: 'ALBUM TAM THÁI TỬ',
    imageUrl: '/photos/jack_water.png',
    frameCode: '05A',
    crop: { sx: 280, sy: 60, sw: 500, sh: 460 } // Emotional close-up on Jack rising from dark water
  },
  {
    title: 'Tam Thái Tử',
    subtitle: 'CA KHÚC CHỦ ĐỀ • J97 PROMOTION',
    imageUrl: '/photos/jack_red_suit.jpg',
    frameCode: '06A',
    crop: null // Full official concept photo with Tam Thái Tử title
  },
  {
    title: 'Mỗi Lần Nhớ Em Là Một Ngày Mưa',
    subtitle: 'ALBUM TAM THÁI TỬ',
    imageUrl: '/photos/jack_water.png',
    frameCode: '07A',
    crop: null // Wide dark water shot
  }
];

export function createAlbumPhotoTextures() {
  const textures = [];
  for (let i = 0; i < ALBUM_SLIDE_CONFIGS.length; i++) {
    textures.push(createSingleAlbumPhotoTexture(i));
  }
  return textures;
}

export function createSingleAlbumPhotoTexture(index) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const config = ALBUM_SLIDE_CONFIGS[index % ALBUM_SLIDE_CONFIGS.length];
  const img = preloadPhoto(config.imageUrl);

  function drawSlide(image) {
    // 1. Film Strip Frame Background (Matte Charcoal with film border)
    ctx.fillStyle = '#111114';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Film Sprocket Holes (Lỗ răng cưa phim 35mm ở mép trên và mép dưới)
    const numHoles = 14;
    const holeWidth = 26;
    const holeHeight = 36;
    const holeRadius = 6;
    ctx.fillStyle = '#060608';
    ctx.strokeStyle = '#252528';
    ctx.lineWidth = 1.5;

    for (let h = 0; h < numHoles; h++) {
      const x = 50 + (h * (canvas.width - 100)) / (numHoles - 1) - holeWidth / 2;
      // Top hole
      drawRoundedRect(ctx, x, 14, holeWidth, holeHeight, holeRadius);
      ctx.fill();
      ctx.stroke();

      // Bottom hole
      drawRoundedRect(ctx, x, canvas.height - 50, holeWidth, holeHeight, holeRadius);
      ctx.fill();
      ctx.stroke();
    }

    // 3. Film Markings & Frame Stamp
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillStyle = '#f59e0b'; // Vintage Kodak Portra orange-gold ink
    ctx.textAlign = 'left';
    ctx.fillText(`▶ ${config.frameCode}`, 35, 75);
    ctx.textAlign = 'right';
    ctx.fillText('KODAK PORTRA 400', canvas.width - 35, 75);

    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText(
      `• 35MM STEREO REEL • ${config.title.toUpperCase()} • ${config.subtitle} •`,
      canvas.width / 2,
      canvas.height - 18
    );

    // 4. Central Photo Canvas Frame (880 x 480 px, 16:9 ratio)
    const px = 60;
    const py = 90;
    const pw = canvas.width - 120; // 904 px
    const ph = canvas.height - 170; // 510 px

    ctx.save();
    drawRoundedRect(ctx, px, py, pw, ph, 10);
    ctx.clip();

    if (image && image.complete && image.naturalWidth > 0) {
      if (config.crop) {
        ctx.drawImage(
          image,
          config.crop.sx,
          config.crop.sy,
          config.crop.sw,
          config.crop.sh,
          px,
          py,
          pw,
          ph
        );
      } else {
        ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, px, py, pw, ph);
      }
    } else {
      // Elegant placeholder while loading
      ctx.fillStyle = '#1c192b';
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(config.title, px + pw / 2, py + ph / 2);
    }

    // Soft photographic vignette overlay for authentic analog film look
    const vigGrad = ctx.createRadialGradient(
      px + pw / 2,
      py + ph / 2,
      pw * 0.3,
      px + pw / 2,
      py + ph / 2,
      pw * 0.68
    );
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(px, py, pw, ph);

    ctx.restore();

    // Inner frame border
    ctx.strokeStyle = '#383840';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, px, py, pw, ph, 10);
    ctx.stroke();

    texture.needsUpdate = true;
  }

  // Draw immediately if cached, or on load
  if (img.complete && img.naturalWidth > 0) {
    drawSlide(img);
  } else {
    drawSlide(null);
    img.addEventListener('load', () => {
      drawSlide(img);
    });
  }

  return texture;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// 1. NGƯỜI DƯNG - Đêm Thành Thị Cô Độc
function drawArtworkNguoiDung(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#090e1f');
  g.addColorStop(0.5, '#141c3a');
  g.addColorStop(1, '#2c1e40');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // Distant glowing moon
  ctx.fillStyle = '#fffae8';
  ctx.beginPath();
  ctx.arc(x + w * 0.78, y + h * 0.28, 48, 0, Math.PI * 2);
  ctx.fill();

  // Moon halo
  const moonGlow = ctx.createRadialGradient(x + w * 0.78, y + h * 0.28, 40, x + w * 0.78, y + h * 0.28, 120);
  moonGlow.addColorStop(0, 'rgba(255, 250, 230, 0.45)');
  moonGlow.addColorStop(1, 'rgba(255, 250, 230, 0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(x, y, w, h);

  // City skyline silhouette
  ctx.fillStyle = '#060a16';
  const buildings = [
    [0.05, 0.4, 0.12], [0.15, 0.55, 0.09], [0.22, 0.35, 0.15],
    [0.35, 0.6, 0.11], [0.44, 0.38, 0.14], [0.56, 0.52, 0.16],
    [0.70, 0.45, 0.12], [0.80, 0.62, 0.10], [0.88, 0.42, 0.12]
  ];
  buildings.forEach(([bx, bh, bw]) => {
    ctx.fillRect(x + w * bx, y + h * (1 - bh), w * bw, h * bh);
  });

  // Bokeh lights
  for (let i = 0; i < 40; i++) {
    const lx = x + (i * 37) % w;
    const ly = y + h * 0.65 + (i * 19) % (h * 0.35);
    const rad = 2 + (i % 6);
    ctx.fillStyle = (i % 3 === 0) ? 'rgba(254, 202, 87, 0.65)' : 'rgba(255, 107, 107, 0.45)';
    ctx.beginPath();
    ctx.arc(lx, ly, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lone silhouette under streetlight
  ctx.fillStyle = '#030508';
  ctx.beginPath();
  ctx.arc(x + w * 0.28, y + h * 0.74, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + w * 0.28 - 10, y + h * 0.76, 20, 60);

  // Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('NGƯỜI DƯNG', x + 50, y + h - 75);
  ctx.fillStyle = '#f39c12';
  ctx.font = '600 16px "Segoe UI", sans-serif';
  ctx.fillText('JACK - J97 • TRACK NO.2 • ALBUM TAM THÁI TỬ', x + 52, y + h - 45);
}

// 2. LƯU NIÊN - Hoàng Hôn Hoài Niệm & Cánh Đồng Lau
function drawArtworkLuuNien(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#2d1436');
  g.addColorStop(0.35, '#a72c38');
  g.addColorStop(0.65, '#e65c00');
  g.addColorStop(1, '#f9d423');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // Giant sunset sun
  const sunG = ctx.createRadialGradient(x + w * 0.5, y + h * 0.52, 20, x + w * 0.5, y + h * 0.52, 160);
  sunG.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
  sunG.addColorStop(0.4, 'rgba(255, 200, 80, 0.7)');
  sunG.addColorStop(1, 'rgba(255, 120, 0, 0)');
  ctx.fillStyle = sunG;
  ctx.fillRect(x, y, w, h);

  // Birds in flight
  ctx.strokeStyle = 'rgba(40, 10, 20, 0.75)';
  ctx.lineWidth = 2.5;
  [[0.35, 0.28], [0.42, 0.24], [0.48, 0.31], [0.65, 0.22], [0.72, 0.27]].forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(x + w * bx - 8, y + h * by, 8, Math.PI * 1.1, Math.PI * 1.9);
    ctx.arc(x + w * bx + 8, y + h * by, 8, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  });

  // Silhouettes of pampas grass / reeds
  ctx.strokeStyle = '#1a0808';
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 70; i++) {
    const rx = x + (i * 13) % w;
    const rHeight = 90 + ((i * 17) % 110);
    const bend = Math.sin(i) * 35;
    ctx.beginPath();
    ctx.moveTo(rx, y + h);
    ctx.quadraticCurveTo(rx + bend * 0.5, y + h - rHeight * 0.6, rx + bend, y + h - rHeight);
    ctx.stroke();
  }

  // Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('LƯU NIÊN', x + 50, y + h - 75);
  ctx.fillStyle = '#ffeaa7';
  ctx.font = '600 16px "Segoe UI", sans-serif';
  ctx.fillText('JACK - J97 • TRACK NO.4 • ALBUM TAM THÁI TỬ', x + 52, y + h - 45);
}

// 3. ANH YÊU EM (我爱你) - Lãng Mạn & Trái Tim Tím Pastel
function drawArtworkAnhYeuEm(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#360940');
  g.addColorStop(0.5, '#7b113a');
  g.addColorStop(1, '#ff758c');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // Large subtle Chinese calligraphy 我爱你 in background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.font = 'bold 170px "KaiTi", "SimSun", serif';
  ctx.textAlign = 'center';
  ctx.fillText('我爱你', x + w / 2, y + h * 0.62);

  // Glowing artistic heart outline
  ctx.strokeStyle = 'rgba(255, 230, 240, 0.85)';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#ff2a7a';
  ctx.shadowBlur = 24;

  const hx = x + w * 0.5;
  const hy = y + h * 0.44;
  ctx.beginPath();
  ctx.moveTo(hx, hy + 30);
  ctx.bezierCurveTo(hx - 90, hy - 70, hx - 90, hy + 60, hx, hy + 110);
  ctx.bezierCurveTo(hx + 90, hy + 60, hx + 90, hy - 70, hx, hy + 30);
  ctx.stroke();
  ctx.shadowBlur = 0; // reset

  // Floating sparkle particles
  for (let i = 0; i < 35; i++) {
    const sx = x + (i * 29) % w;
    const sy = y + (i * 23) % h;
    ctx.fillStyle = 'rgba(255, 240, 250, 0.7)';
    ctx.beginPath();
    ctx.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  // Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ANH YÊU EM (我爱你)', x + 50, y + h - 75);
  ctx.fillStyle = '#ffccd5';
  ctx.font = '600 16px "Segoe UI", sans-serif';
  ctx.fillText('JACK - J97 • TRACK NO.3 • ALBUM TAM THÁI TỬ', x + 52, y + h - 45);
}

// 4. HOA TRONG ĐÁ - Thạch Anh Kintsugi & Hoa Đỏ Kiên Cường
function drawArtworkHoaTrongDa(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#111418');
  g.addColorStop(0.5, '#222831');
  g.addColorStop(1, '#393e46');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // Kintsugi Golden Veins across stone
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#f39c12';
  ctx.shadowBlur = 15;

  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.7);
  ctx.lineTo(x + w * 0.35, y + h * 0.55);
  ctx.lineTo(x + w * 0.5, y + h * 0.5);
  ctx.lineTo(x + w * 0.65, y + h * 0.35);
  ctx.lineTo(x + w, y + h * 0.2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + h * 0.5);
  ctx.lineTo(x + w * 0.48, y + h);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Blooming red rose in the center
  const fx = x + w * 0.5;
  const fy = y + h * 0.45;

  // Petals
  ctx.fillStyle = '#d63031';
  for (let p = 0; p < 8; p++) {
    const angle = (p * Math.PI) / 4;
    ctx.beginPath();
    ctx.ellipse(fx + Math.cos(angle) * 26, fy + Math.sin(angle) * 26, 32, 22, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  // Rose center
  ctx.fillStyle = '#e84118';
  ctx.beginPath();
  ctx.arc(fx, fy, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fbc531';
  ctx.beginPath();
  ctx.arc(fx, fy, 9, 0, Math.PI * 2);
  ctx.fill();

  // Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('HOA TRONG ĐÁ', x + 50, y + h - 75);
  ctx.fillStyle = '#f5cd79';
  ctx.font = '600 16px "Segoe UI", sans-serif';
  ctx.fillText('JACK - J97 • TRACK NO.1 • ALBUM TAM THÁI TỬ', x + 52, y + h - 45);
}

// 5. NÁT TAN CÕI LÒNG - Sầu Muộn & Mảnh Vỡ Pha Lê
function drawArtworkNatTanCoiLong(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#050b14');
  g.addColorStop(0.5, '#0f2027');
  g.addColorStop(1, '#203a43');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // Concentric water ripples
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.28)';
  ctx.lineWidth = 1.5;
  for (let r = 1; r <= 6; r++) {
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.55, r * 45, r * 22, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Shattered crystal glass shards
  ctx.fillStyle = 'rgba(200, 235, 255, 0.25)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  const shards = [
    [[0.42, 0.35], [0.48, 0.25], [0.45, 0.42]],
    [[0.52, 0.30], [0.60, 0.36], [0.55, 0.46]],
    [[0.46, 0.48], [0.54, 0.47], [0.50, 0.60]],
    [[0.36, 0.42], [0.44, 0.46], [0.38, 0.56]],
    [[0.58, 0.45], [0.66, 0.52], [0.59, 0.62]]
  ];
  shards.forEach(pts => {
    ctx.beginPath();
    ctx.moveTo(x + w * pts[0][0], y + h * pts[0][1]);
    ctx.lineTo(x + w * pts[1][0], y + h * pts[1][1]);
    ctx.lineTo(x + w * pts[2][0], y + h * pts[2][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('NÁT TAN CÕI LÒNG', x + 50, y + h - 75);
  ctx.fillStyle = '#81ecec';
  ctx.font = '600 16px "Segoe UI", sans-serif';
  ctx.fillText('JACK - J97 • ALBUM TAM THÁI TỬ', x + 52, y + h - 45);
}

// 6. TAM THÁI TỬ - Hoàng Triều Quyền Uy & Rồng Vàng
function drawArtworkTamThaiTu(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#2b0006');
  g.addColorStop(0.4, '#7a0016');
  g.addColorStop(0.8, '#b8860b');
  g.addColorStop(1, '#ffc107');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // Royal seal medallion
  const cx = x + w * 0.5;
  const cy = y + h * 0.45;

  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#ffa502';
  ctx.shadowBlur = 20;

  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 68, 0, Math.PI * 2);
  ctx.stroke();

  // Crown symbol in gold
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(cx - 38, cy + 22);
  ctx.lineTo(cx - 44, cy - 18);
  ctx.lineTo(cx - 20, cy + 2);
  ctx.lineTo(cx, cy - 32);
  ctx.lineTo(cx + 20, cy + 2);
  ctx.lineTo(cx + 44, cy - 18);
  ctx.lineTo(cx + 38, cy + 22);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;

  // Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 42px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TAM THÁI TỬ', x + 50, y + h - 75);
  ctx.fillStyle = '#ffd700';
  ctx.font = '700 16px "Segoe UI", sans-serif';
  ctx.fillText('JACK - J97 • CA KHÚC CHỦ ĐỀ ALBUM', x + 52, y + h - 45);
}

// 7. MỖI LẦN NHỚ EM LÀ MỘT NGÀY MƯA - Mưa Rơi & Ô Nghiêng
function drawArtworkNgayMua(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#0c1b24');
  g.addColorStop(0.5, '#1b3a4b');
  g.addColorStop(1, '#2c6e69');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // Rain streaks
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 90; i++) {
    const rx = x + (i * 23) % w;
    const ry = y + (i * 17) % h;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 12, ry + 28);
    ctx.stroke();
  }

  // Silhouette of open umbrella
  const ux = x + w * 0.52;
  const uy = y + h * 0.44;

  ctx.fillStyle = '#102027';
  ctx.beginPath();
  ctx.arc(ux, uy, 56, Math.PI, 0);
  ctx.fill();

  // Umbrella handle
  ctx.strokeStyle = '#cfd8dc';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ux, uy);
  ctx.lineTo(ux, uy + 65);
  ctx.arc(ux - 10, uy + 65, 10, 0, Math.PI);
  ctx.stroke();

  // Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 34px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MỖI LẦN NHỚ EM LÀ MỘT NGÀY MƯA', x + 50, y + h - 75);
  ctx.fillStyle = '#80ed99';
  ctx.font = '600 16px "Segoe UI", sans-serif';
  ctx.fillText('JACK - J97 • ALBUM TAM THÁI TỬ', x + 52, y + h - 45);
}

