import * as THREE from 'three';

/**
 * Generates a realistic Summer Studio Environment Map for Three.js
 * providing authentic specular reflections and glass refraction.
 */
export function createStudioEnvironment(renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Summer sky & studio soft gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGrad.addColorStop(0, '#7dd3fc'); // Sky blue top
  skyGrad.addColorStop(0.4, '#e0f2fe'); // Soft pale blue
  skyGrad.addColorStop(0.5, '#fef08a'); // Warm horizon sunset light
  skyGrad.addColorStop(0.65, '#fed7aa'); // Warm peach
  skyGrad.addColorStop(1, '#94a3b8'); // Soft ground reflection
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft studio softbox lights for realistic glass highlights
  // Main Key Softbox
  const radGrad1 = ctx.createRadialGradient(250, 140, 10, 250, 140, 180);
  radGrad1.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  radGrad1.addColorStop(0.4, 'rgba(255, 250, 240, 0.7)');
  radGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radGrad1;
  ctx.fillRect(50, 0, 400, 300);

  // Rim Light Softbox
  const radGrad2 = ctx.createRadialGradient(750, 160, 10, 750, 160, 160);
  radGrad2.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  radGrad2.addColorStop(0.5, 'rgba(224, 242, 254, 0.5)');
  radGrad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radGrad2;
  ctx.fillRect(550, 20, 400, 300);

  // Studio overhead strip light (creates crisp horizontal glass reflection)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillRect(100, 60, 800, 28);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  texture.dispose();
  pmremGenerator.dispose();

  return envMap;
}
