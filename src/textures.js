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
