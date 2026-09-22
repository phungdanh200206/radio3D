import * as THREE from 'three';

/**
 * 3D Liquid Glass Background System
 * Creates floating, undulating, refractive liquid glass bodies
 * in the background that interact with studio lighting and camera parallax.
 * Uses colors from the user's palette:
 * #1B1931, #44174E, #662249, #A34054, #ED9E59, #E9BCB9
 */

export class LiquidGlassBackground {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'LiquidGlassBackground';
    this.blobs = [];

    this.initLiquidGlass();
    this.scene.add(this.group);
  }

  initLiquidGlass() {
    // Liquid Glass Materials with chromatic sunset tones
    const matAmber = new THREE.MeshPhysicalMaterial({
      color: 0xed9e59, // #ED9E59 Sunset Amber
      transmission: 0.88,
      roughness: 0.08,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });

    const matPlum = new THREE.MeshPhysicalMaterial({
      color: 0x662249, // #662249 Wine Berry
      transmission: 0.85,
      roughness: 0.1,
      ior: 1.48,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });

    const matRose = new THREE.MeshPhysicalMaterial({
      color: 0xe9bcb9, // #E9BCB9 Blush Rose
      transmission: 0.92,
      roughness: 0.04,
      ior: 1.5,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.7,
      depthWrite: false
    });

    const matPurple = new THREE.MeshPhysicalMaterial({
      color: 0x44174e, // #44174E Royal Purple
      transmission: 0.85,
      roughness: 0.12,
      ior: 1.45,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });

    // 1. Organic Liquid Wave Ribbon in the backdrop
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-260, -80, -180),
      new THREE.Vector3(-120, 60, -150),
      new THREE.Vector3(50, -40, -160),
      new THREE.Vector3(180, 80, -140),
      new THREE.Vector3(280, -30, -170)
    ]);
    const ribbonGeom = new THREE.TubeGeometry(curve, 64, 28, 16, false);
    const ribbonMesh = new THREE.Mesh(ribbonGeom, matAmber);
    this.group.add(ribbonMesh);
    this.blobs.push({ mesh: ribbonMesh, rotSpeed: 0.0008, floatSpeed: 0.001, baseY: 0, amp: 12 });

    // 2. Large Liquid Glass Sphere 1 (Top Left - Rose/Blush)
    const sphere1Geom = new THREE.IcosahedronGeometry(60, 4);
    const sphere1 = new THREE.Mesh(sphere1Geom, matRose);
    sphere1.position.set(-160, 110, -160);
    this.group.add(sphere1);
    this.blobs.push({ mesh: sphere1, rotSpeed: 0.002, floatSpeed: 0.0015, baseY: 110, amp: 15 });

    // 3. Large Liquid Glass Sphere 2 (Bottom Right - Wine/Plum)
    const sphere2Geom = new THREE.IcosahedronGeometry(75, 4);
    const sphere2 = new THREE.Mesh(sphere2Geom, matPlum);
    sphere2.position.set(170, -70, -190);
    this.group.add(sphere2);
    this.blobs.push({ mesh: sphere2, rotSpeed: -0.0018, floatSpeed: 0.0012, baseY: -70, amp: 18 });

    // 4. Smooth Liquid Torus (Floating Liquid Ring)
    const torusGeom = new THREE.TorusGeometry(70, 18, 24, 60);
    const torusMesh = new THREE.Mesh(torusGeom, matPurple);
    torusMesh.position.set(0, 30, -220);
    torusMesh.rotation.x = Math.PI / 4;
    this.group.add(torusMesh);
    this.blobs.push({ mesh: torusMesh, rotSpeed: 0.0015, floatSpeed: 0.0009, baseY: 30, amp: 10 });
  }

  update(time) {
    this.blobs.forEach((item, idx) => {
      item.mesh.rotation.x += item.rotSpeed;
      item.mesh.rotation.y += item.rotSpeed * 1.3;
      item.mesh.position.y = item.baseY + Math.sin(time * 0.8 + idx * 1.5) * item.amp;
      // Gentle breathing pulse
      const scale = 1.0 + Math.sin(time * 0.5 + idx) * 0.04;
      item.mesh.scale.set(scale, scale, scale);
    });
  }
}
