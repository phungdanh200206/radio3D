import * as THREE from 'three';
import {
  createRealisticWoodTexture,
  createRealisticWoodBumpTexture,
  createRealisticWoodRoughnessTexture,
  createKnurlBumpTexture,
  createCassetteLabelTexture,
  createBrushedMetalTexture,
  createGlassSheenTexture
} from './textures.js';

/**
 * Procedural CAD-accurate 3D model builder for "MÁY PHÁT BĂNG CASSETTE MINI" (MB-001)
 * Scale: 1 Three.js unit = 1 millimeter (mm)
 * Supports multiple aesthetic color themes: Oak, Walnut, Summer Retro, Seafoam, Midnight Plum, Nordic White
 */

export function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}

export function createGearGeometry(pitchRadius, numTeeth, toothDepth, holeRadius, thickness) {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / numTeeth;
  const rRoot = pitchRadius - toothDepth * 0.5;
  const rTip = pitchRadius + toothDepth * 0.5;

  for (let i = 0; i < numTeeth; i++) {
    const angle0 = i * step;
    const angle1 = angle0 + step * 0.25;
    const angle2 = angle0 + step * 0.5;
    const angle3 = angle0 + step * 0.75;

    const p0 = [Math.cos(angle0) * rRoot, Math.sin(angle0) * rRoot];
    const p1 = [Math.cos(angle1) * rTip, Math.sin(angle1) * rTip];
    const p2 = [Math.cos(angle2) * rTip, Math.sin(angle2) * rTip];
    const p3 = [Math.cos(angle3) * rRoot, Math.sin(angle3) * rRoot];

    if (i === 0) shape.moveTo(p0[0], p0[1]);
    shape.lineTo(p1[0], p1[1]);
    shape.lineTo(p2[0], p2[1]);
    shape.lineTo(p3[0], p3[1]);
  }
  shape.closePath();

  if (holeRadius > 0) {
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);
  }

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.2,
    bevelSegments: 2
  });
  geom.center();
  return geom;
}

export function buildCassettePlayerModel(activeTheme = 'oak') {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'CassettePlayerRoot';

  const partsList = [];

  // PBR Textures
  const woodMap = createRealisticWoodTexture();
  const woodBump = createRealisticWoodBumpTexture();
  const woodRoughness = createRealisticWoodRoughnessTexture();
  const knurlBump = createKnurlBumpTexture();
  const cassetteLabel = createCassetteLabelTexture('Tam Thái Tử', activeTheme);
  const brushedMetal = createBrushedMetalTexture();
  const glassSheen = createGlassSheenTexture();

  // THEME COLOR MATERIALS
  let outerChassisMat, frontBezelMat, knobMat, topLidMat, backMat, cradleMat, knobAccentMat;

  if (activeTheme === 'walnut') {
    // 1. Gỗ Óc Chó & Đồng Thau (Walnut Wood & Brass)
    const walnutMat = new THREE.MeshStandardMaterial({
      map: woodMap,
      color: 0x6e432d, // Deep rich dark walnut
      bumpMap: woodBump,
      bumpScale: 0.95,
      roughnessMap: woodRoughness,
      roughness: 0.38,
      metalness: 0.04
    });
    outerChassisMat = walnutMat;
    frontBezelMat = walnutMat;
    topLidMat = walnutMat;
    backMat = walnutMat;
    cradleMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 });
    knobMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Royal Brass
      metalness: 0.92,
      roughness: 0.22,
      bumpMap: knurlBump,
      bumpScale: 0.85
    });
    knobAccentMat = knobMat;

  } else if (activeTheme === 'summer') {
    // 2. Mùa Hè Retro (Coral Red & Sunshine Gold)
    outerChassisMat = new THREE.MeshPhysicalMaterial({
      color: 0xe6503f, // Coral Red
      roughness: 0.15,
      metalness: 0.08,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08
    });
    frontBezelMat = new THREE.MeshPhysicalMaterial({
      color: 0xf39c12, // Sunshine Mango Gold
      roughness: 0.2,
      clearcoat: 0.7
    });
    topLidMat = outerChassisMat;
    backMat = new THREE.MeshPhysicalMaterial({ color: 0xd94635, roughness: 0.2 });
    cradleMat = new THREE.MeshStandardMaterial({ color: 0x2a9d8f, metalness: 0.6, roughness: 0.35 });
    knobMat = new THREE.MeshStandardMaterial({
      color: 0x2b2344, // Dark Retro Indigo
      metalness: 0.85,
      roughness: 0.25,
      bumpMap: knurlBump,
      bumpScale: 0.8
    });
    knobAccentMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, metalness: 0.9, roughness: 0.2 });

  } else if (activeTheme === 'seafoam') {
    // 3. Seafoam Breeze (Xanh Bạc Hà Đại Dương)
    outerChassisMat = new THREE.MeshPhysicalMaterial({
      color: 0x38a3a5, // Seafoam Teal
      roughness: 0.15,
      clearcoat: 0.85
    });
    frontBezelMat = new THREE.MeshPhysicalMaterial({
      color: 0x80ed99, // Mint Seafoam
      roughness: 0.2,
      clearcoat: 0.6
    });
    topLidMat = outerChassisMat;
    backMat = new THREE.MeshPhysicalMaterial({ color: 0x22577a, roughness: 0.2 });
    cradleMat = new THREE.MeshStandardMaterial({ color: 0x22577a, metalness: 0.6, roughness: 0.35 });
    knobMat = new THREE.MeshStandardMaterial({
      color: 0xf4a261, // Sand Gold
      metalness: 0.88,
      roughness: 0.25,
      bumpMap: knurlBump,
      bumpScale: 0.8
    });
    knobAccentMat = knobMat;

  } else if (activeTheme === 'midnight') {
    // 4. Midnight Plum & Amber (Tam Thái Tử Sunset)
    outerChassisMat = new THREE.MeshPhysicalMaterial({
      color: 0x1b1931, // Midnight Plum
      roughness: 0.12,
      metalness: 0.2,
      clearcoat: 1.0
    });
    frontBezelMat = new THREE.MeshPhysicalMaterial({
      color: 0xed9e59, // Sunset Amber
      roughness: 0.15,
      clearcoat: 0.8
    });
    topLidMat = new THREE.MeshPhysicalMaterial({ color: 0x44174e, roughness: 0.15, clearcoat: 0.8 });
    backMat = new THREE.MeshPhysicalMaterial({ color: 0x1b1931, roughness: 0.2 });
    cradleMat = new THREE.MeshStandardMaterial({ color: 0x662249, metalness: 0.65, roughness: 0.3 });
    knobMat = new THREE.MeshStandardMaterial({
      color: 0xa34054, // Rosewood
      metalness: 0.85,
      roughness: 0.25,
      bumpMap: knurlBump,
      bumpScale: 0.8
    });
    knobAccentMat = new THREE.MeshStandardMaterial({ color: 0xed9e59, metalness: 0.9, roughness: 0.2 });

  } else if (activeTheme === 'nordic') {
    // 5. Trắng Sứ Bắc Âu (Nordic Minimalist Ceramic White)
    const whiteCeramicMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.18,
      metalness: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08
    });
    outerChassisMat = whiteCeramicMat;
    frontBezelMat = new THREE.MeshPhysicalMaterial({ color: 0xe2e8f0, roughness: 0.25, clearcoat: 0.6 });
    topLidMat = whiteCeramicMat;
    backMat = whiteCeramicMat;
    cradleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.35 });
    knobMat = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      metalness: 0.92,
      roughness: 0.25,
      bumpMap: knurlBump,
      bumpScale: 0.85
    });
    knobAccentMat = knobMat;

  } else {
    // 6. Gỗ Sồi Cổ Điển (Natural Oak Wood - Default)
    const oakWoodMat = new THREE.MeshStandardMaterial({
      map: woodMap,
      bumpMap: woodBump,
      bumpScale: 0.9,
      roughnessMap: woodRoughness,
      roughness: 0.42,
      metalness: 0.02
    });
    outerChassisMat = oakWoodMat;
    frontBezelMat = oakWoodMat;
    topLidMat = oakWoodMat;
    backMat = oakWoodMat;
    cradleMat = new THREE.MeshStandardMaterial({ color: 0x333538, metalness: 0.6, roughness: 0.35 });
    knobMat = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      metalness: 0.92,
      roughness: 0.25,
      bumpMap: knurlBump,
      bumpScale: 0.85
    });
    knobAccentMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.85, roughness: 0.3 });
  }

  // ULTRA REALISTIC OPTICAL GLASS (High Clarity + Mirror Specular Gloss)
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.96, // Clear optical transmission allows cassette to be seen inside
    opacity: 1.0,
    transparent: true,
    roughness: 0.018, // Ultra smooth gloss
    ior: 1.52, // Optical glass
    metalness: 0.0,
    reflectivity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.4, // Specular studio reflections
    depthWrite: false // Crucial: allows cassette inside to render without depth clipping
  });

  const brassGearMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.22,
    envMapIntensity: 1.5
  });

  const silverGearMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.88,
    roughness: 0.25,
    envMapIntensity: 1.4
  });

  const steelShaftMaterial = new THREE.MeshStandardMaterial({
    map: brushedMetal,
    color: 0xffffff,
    metalness: 0.95,
    roughness: 0.18,
    envMapIntensity: 1.6
  });

  const blackPlasticMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.45,
    metalness: 0.1
  });

  function registerPart({ group, mesh, id, stt, name, material, quantity, dimensions, notes, category, explodedOffset, dimBox }) {
    const partData = {
      id,
      stt,
      name,
      material,
      quantity,
      dimensions,
      notes,
      category,
      group,
      mesh: mesh || group,
      defaultPos: group.position.clone(),
      explodedOffset: explodedOffset || new THREE.Vector3(0, 0, 0),
      dimBox
    };

    group.traverse((child) => {
      if (child.isMesh) {
        child.userData.partData = partData;
      }
    });

    partsList.push(partData);
    rootGroup.add(group);
    return partData;
  }

  // ==========================================
  // PART 1: KHUNG VỎ CHÍNH (150 x 110 x 90 mm, bo R20, vách dày 16mm)
  // KHOANG CỬA TRƯỚC: 118 x 72 mm (Trái 16, Phải 16, Trên 18, Dưới 20 mm)
  // ==========================================
  const woodCaseGroup = new THREE.Group();
  woodCaseGroup.name = 'KhungGoGroup';

  const outerShape = createRoundedRectShape(150, 110, 20);

  // Opening cutout: 118 x 72 mm
  // Top wall = 18 mm, Bottom wall = 20 mm -> Center Y offset = +1 mm
  const frontHole = new THREE.Path();
  const hw = 118 / 2;
  const hh = 72 / 2;
  const hyOffset = 1;
  const hr = 4;
  frontHole.moveTo(-hw + hr, -hh + hyOffset);
  frontHole.lineTo(hw - hr, -hh + hyOffset);
  frontHole.quadraticCurveTo(hw, -hh + hyOffset, hw, -hh + hr + hyOffset);
  frontHole.lineTo(hw, hh - hr + hyOffset);
  frontHole.quadraticCurveTo(hw, hh + hyOffset, hw - hr, hh + hyOffset);
  frontHole.lineTo(-hw + hr, hh + hyOffset);
  frontHole.quadraticCurveTo(-hw, hh + hyOffset, -hw, hh - hr + hyOffset);
  frontHole.lineTo(-hw, -hh + hr + hyOffset);
  frontHole.quadraticCurveTo(-hw, -hh + hyOffset, -hw + hr, -hh + hyOffset);
  outerShape.holes.push(frontHole);

  const frontBezelGeom = new THREE.ExtrudeGeometry(outerShape, {
    depth: 16,
    bevelEnabled: true,
    bevelThickness: 1.4,
    bevelSize: 1.4,
    bevelSegments: 4
  });
  frontBezelGeom.center();
  const frontBezelMesh = new THREE.Mesh(frontBezelGeom, frontBezelMat);
  frontBezelMesh.position.set(0, 0, 37);
  woodCaseGroup.add(frontBezelMesh);

  // Outer casing shell (depth 58 mm between front 16mm and back 16mm)
  const midShape = createRoundedRectShape(150, 110, 20);
  const midHole = createRoundedRectShape(118, 78, 6);
  midShape.holes.push(midHole);
  const midRingGeom = new THREE.ExtrudeGeometry(midShape, {
    depth: 58,
    bevelEnabled: false
  });
  midRingGeom.center();
  const midRingMesh = new THREE.Mesh(midRingGeom, outerChassisMat);
  midRingMesh.position.set(0, 0, 0);
  woodCaseGroup.add(midRingMesh);

  const shaftBushingGeom = new THREE.CylinderGeometry(5, 5, 18, 24);
  shaftBushingGeom.rotateZ(Math.PI / 2);
  const shaftBushingMesh = new THREE.Mesh(shaftBushingGeom, silverGearMaterial);
  shaftBushingMesh.position.set(70, 0, 8);
  woodCaseGroup.add(shaftBushingMesh);

  registerPart({
    group: woodCaseGroup,
    id: 'khung_go',
    stt: 1,
    name: 'Khung vỏ máy chính',
    material: activeTheme.includes('wood') || activeTheme === 'oak' || activeTheme === 'walnut'
      ? 'Gỗ tự nhiên cao cấp (Vân gỗ sồi/óc chó tự nhiên)'
      : 'Hợp kim nhôm Anodized cao cấp',
    quantity: '1',
    dimensions: '150 × 110 × 90 mm (Dày thành 16 mm, bo góc R20)',
    notes: 'Kích thước ngoài 150×110×90 mm, bo góc R20 mm. Thành dày 16 mm, lòng trong khoang trước 118×72 mm (mép trên 18 mm, mép dưới 20 mm, mép bên 16 mm).',
    category: 'Vỏ máy',
    explodedOffset: new THREE.Vector3(0, 0, 0),
    dimBox: { w: 150, h: 110, d: 90 }
  });

  // ==========================================
  // PART 2: NẮP TRÊN & KHE XẺ (105 x 16 mm, lề 22mm, bo tròn 2 đầu R8)
  // ==========================================
  const topLidGroup = new THREE.Group();
  topLidGroup.name = 'NapTrenGroup';

  const topSlotShape = new THREE.Shape();
  const tsw = 105 / 2;
  const tsd = 16 / 2;
  const tsr = tsd;
  topSlotShape.moveTo(-tsw + tsr, -tsd);
  topSlotShape.lineTo(tsw - tsr, -tsd);
  topSlotShape.absarc(tsw - tsr, 0, tsr, -Math.PI / 2, Math.PI / 2, false);
  topSlotShape.lineTo(-tsw + tsr, tsd);
  topSlotShape.absarc(-tsw + tsr, 0, tsr, Math.PI / 2, -Math.PI / 2, false);

  const topSlotGeom = new THREE.ExtrudeGeometry(topSlotShape, {
    depth: 6,
    bevelEnabled: true,
    bevelThickness: 1.0,
    bevelSize: 1.0,
    bevelSegments: 3
  });
  topSlotGeom.center();
  topSlotGeom.rotateX(Math.PI / 2);

  const topLidMesh = new THREE.Mesh(topSlotGeom, topLidMat);
  topLidGroup.add(topLidMesh);

  const slotInnerGeom = new THREE.CylinderGeometry(3, 3, 90, 24);
  slotInnerGeom.rotateZ(Math.PI / 2);
  const slotInnerMesh = new THREE.Mesh(slotInnerGeom, silverGearMaterial);
  slotInnerMesh.position.set(0, 0, 0);
  topLidGroup.add(slotInnerMesh);

  topLidGroup.position.set(0, 55, 0);

  registerPart({
    group: topLidGroup,
    id: 'nap_tren',
    stt: 2,
    name: 'Nắp trên & Khe xẻ',
    material: 'Vỏ gỗ tự nhiên / Hợp kim',
    quantity: '1',
    dimensions: '105 × 16 mm (Khoảng cách mép 22 mm, Dày 16 mm)',
    notes: 'Chi tiết gắn tại mặt trên, chiều dài 105 mm, cách 2 mép bên 22 mm. Hai đầu bo tròn bán kính R8 mm.',
    category: 'Vỏ máy',
    explodedOffset: new THREE.Vector3(0, 55, 0),
    dimBox: { w: 105, h: 16, d: 16 }
  });

  // ==========================================
  // PART 3: TẤM KÍNH THỦY TINH / MICA CỬA TRƯỚC (118 x 72 x 3 mm, bo R5)
  // BÓNG BẢY, TRONG SUỐT NHÌN RÕ BĂNG CASSETTE BÊN TRONG
  // ==========================================
  const micaGroup = new THREE.Group();
  micaGroup.name = 'TamMicaGroup';

  const micaShape = createRoundedRectShape(118, 72, 5);
  const micaGeom = new THREE.ExtrudeGeometry(micaShape, {
    depth: 3,
    bevelEnabled: true,
    bevelThickness: 0.6,
    bevelSize: 0.6,
    bevelSegments: 3
  });
  micaGeom.center();
  const micaMesh = new THREE.Mesh(micaGeom, glassMaterial);
  micaGroup.add(micaMesh);

  // Specular sheen diagonal glint
  const sheenGeom = new THREE.PlaneGeometry(116, 70);
  const sheenMat = new THREE.MeshBasicMaterial({
    map: glassSheen,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const sheenMesh = new THREE.Mesh(sheenGeom, sheenMat);
  sheenMesh.position.set(0, 0, 1.6);
  micaGroup.add(sheenMesh);

  // Chamfer border highlight line
  const micaBorderGeom = new THREE.EdgesGeometry(micaGeom, 30);
  const micaBorderLine = new THREE.LineSegments(
    micaBorderGeom,
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
  );
  micaGroup.add(micaBorderLine);

  micaGroup.position.set(0, 1, 44);

  registerPart({
    group: micaGroup,
    id: 'tam_mica',
    stt: 3,
    name: 'Tấm kính mica trong suốt (Cửa trước)',
    material: 'Thủy tinh quang học cao cấp (Optical Glass / Acrylic)',
    quantity: '1',
    dimensions: '118 × 72 × 3 mm (Bo góc R5)',
    notes: 'Mặt kính thủy tinh cao cấp bảo vệ khoang máy, dày 3 mm, bo góc R5 mm. Độ truyền quang cao 96%, phản chiếu bóng gương chân thực, quan sát rõ ràng băng cassette bên trong.',
    category: 'Cửa quan sát',
    explodedOffset: new THREE.Vector3(0, 0, 125),
    dimBox: { w: 118, h: 72, d: 3 }
  });

  // ==========================================
  // PART 4: BĂNG CASSETTE (100 x 63 x 12 mm tiêu chuẩn)
  // ==========================================
  const cassetteGroup = new THREE.Group();
  cassetteGroup.name = 'BangCassetteGroup';

  const cassShape = createRoundedRectShape(100, 63, 4);

  const cwHole = new THREE.Path();
  const cwh_w = 48 / 2;
  const cwh_h = 18 / 2;
  cwHole.moveTo(-cwh_w, -cwh_h);
  cwHole.lineTo(cwh_w, -cwh_h);
  cwHole.lineTo(cwh_w, cwh_h);
  cwHole.lineTo(-cwh_w, cwh_h);
  cassShape.holes.push(cwHole);

  const reelHoleL = new THREE.Path();
  reelHoleL.absarc(-21, 0, 8, 0, Math.PI * 2, true);
  cassShape.holes.push(reelHoleL);

  const reelHoleR = new THREE.Path();
  reelHoleR.absarc(21, 0, 8, 0, Math.PI * 2, true);
  cassShape.holes.push(reelHoleR);

  const cassGeom = new THREE.ExtrudeGeometry(cassShape, {
    depth: 12,
    bevelEnabled: true,
    bevelThickness: 0.6,
    bevelSize: 0.6,
    bevelSegments: 2
  });
  cassGeom.center();

  const cassBodyMat = new THREE.MeshStandardMaterial({
    color: activeTheme === 'midnight' ? 0x1b1931 : 0x222222,
    roughness: 0.35,
    metalness: 0.1
  });

  const cassFrontStickerMat = new THREE.MeshStandardMaterial({
    map: cassetteLabel,
    roughness: 0.3,
    metalness: 0.05
  });

  const cassBodyMesh = new THREE.Mesh(cassGeom, [cassBodyMat, cassFrontStickerMat]);
  cassetteGroup.add(cassBodyMesh);

  // 2 Rotating Spools
  const spools = [];
  function createCassetteSpool(posX) {
    const spoolGroup = new THREE.Group();
    spoolGroup.position.set(posX, 0, 0);

    const spoolColor = activeTheme === 'midnight' || activeTheme === 'walnut' ? 0xed9e59 : 0xffffff;
    const spoolRimGeom = new THREE.CylinderGeometry(7.5, 7.5, 11.5, 32, 1, true);
    spoolRimGeom.rotateX(Math.PI / 2);
    const spoolRimMesh = new THREE.Mesh(
      spoolRimGeom,
      new THREE.MeshStandardMaterial({ color: spoolColor, roughness: 0.35 })
    );
    spoolGroup.add(spoolRimMesh);

    for (let k = 0; k < 6; k++) {
      const spokeGeom = new THREE.BoxGeometry(1.4, 2.2, 11.2);
      const spokeMesh = new THREE.Mesh(
        spokeGeom,
        new THREE.MeshStandardMaterial({ color: spoolColor, roughness: 0.35 })
      );
      const angle = (k * Math.PI) / 3;
      spokeMesh.position.set(Math.cos(angle) * 5.2, Math.sin(angle) * 5.2, 0);
      spokeMesh.rotation.z = angle;
      spoolGroup.add(spokeMesh);
    }

    cassetteGroup.add(spoolGroup);
    spools.push(spoolGroup);
    return spoolGroup;
  }

  const spoolLeft = createCassetteSpool(-21);
  const spoolRight = createCassetteSpool(21);

  // Magnetic tape rolls
  const tapeRollLGeom = new THREE.CylinderGeometry(14, 14, 8, 32);
  tapeRollLGeom.rotateX(Math.PI / 2);
  const tapeRollMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8 });
  const tapeRollL = new THREE.Mesh(tapeRollLGeom, tapeRollMat);
  tapeRollL.position.set(-21, 0, 0);
  cassetteGroup.add(tapeRollL);

  const tapeRollRGeom = new THREE.CylinderGeometry(11, 11, 8, 32);
  tapeRollRGeom.rotateX(Math.PI / 2);
  const tapeRollR = new THREE.Mesh(tapeRollRGeom, tapeRollMat);
  tapeRollR.position.set(21, 0, 0);
  cassetteGroup.add(tapeRollR);

  cassetteGroup.position.set(0, 1, 28);

  registerPart({
    group: cassetteGroup,
    id: 'bang_cassette',
    stt: 4,
    name: 'Băng cassette ("Best Wishes")',
    material: 'Nhựa cao cấp (ABS)',
    quantity: '1',
    dimensions: '100 × 63 × 12 mm (Kích thước tiêu chuẩn)',
    notes: 'Băng cassette tiêu chuẩn 100×63×12 mm với nhãn hoài niệm, tích hợp 2 cuộn bánh xe quay (spools) quay đồng bộ khi phát nhạc.',
    category: 'Môi chất phát',
    explodedOffset: new THREE.Vector3(0, 0, 85),
    dimBox: { w: 100, h: 63, d: 12 }
  });

  // ==========================================
  // PART 5: GIÁ ĐỠ BĂNG CASSETTE (101 x 64 x 3 mm)
  // ==========================================
  const cradleGroup = new THREE.Group();
  cradleGroup.name = 'GiaDoBangGroup';

  const cradleShape = createRoundedRectShape(101, 64, 3);
  const cradleHole = createRoundedRectShape(88, 50, 4);
  cradleShape.holes.push(cradleHole);

  const cradleGeom = new THREE.ExtrudeGeometry(cradleShape, {
    depth: 3,
    bevelEnabled: true,
    bevelThickness: 0.4,
    bevelSize: 0.4,
    bevelSegments: 2
  });
  cradleGeom.center();
  const cradleMesh = new THREE.Mesh(cradleGeom, cradleMat);
  cradleGroup.add(cradleMesh);

  const pinLGeom = new THREE.CylinderGeometry(2, 2, 8, 16);
  pinLGeom.rotateZ(Math.PI / 2);
  const pinL = new THREE.Mesh(pinLGeom, silverGearMaterial);
  pinL.position.set(-36, -32, 2);
  cradleGroup.add(pinL);

  const pinR = pinL.clone();
  pinR.position.set(36, -32, 2);
  cradleGroup.add(pinR);

  cradleGroup.position.set(0, 1, 19);

  registerPart({
    group: cradleGroup,
    id: 'gia_do_bang',
    stt: 5,
    name: 'Giá đỡ băng cassette',
    material: 'Nhựa kỹ thuật / Hợp kim nhôm',
    quantity: '1',
    dimensions: '101 × 64 × 3 mm (2 chốt định vị R2)',
    notes: 'Kích thước 101×64 mm, dày 3 mm, có 2 chốt gờ bo R2 mm ở cạnh dưới giúp giữ chặt băng cassette đúng vị trí tiếp xúc đầu từ.',
    category: 'Khung cơ khí',
    explodedOffset: new THREE.Vector3(0, 0, 48),
    dimBox: { w: 101, h: 64, d: 3 }
  });

  // ==========================================
  // INTERNAL MECHANISM ASSEMBLY
  // ==========================================
  const internalBracketGroup = new THREE.Group();
  internalBracketGroup.name = 'KhungCoCauGroup';
  const bracketGeom = new THREE.BoxGeometry(100, 70, 2);
  const bracketMat = new THREE.MeshStandardMaterial({
    map: brushedMetal,
    color: 0xd0d4d8,
    metalness: 0.9,
    roughness: 0.25
  });
  const bracketMesh = new THREE.Mesh(bracketGeom, bracketMat);
  internalBracketGroup.add(bracketMesh);

  const pillarGeom = new THREE.CylinderGeometry(3, 3, 20, 16);
  pillarGeom.rotateX(Math.PI / 2);
  const p1 = new THREE.Mesh(pillarGeom, silverGearMaterial);
  p1.position.set(-42, 28, 10);
  internalBracketGroup.add(p1);
  const p2 = p1.clone();
  p2.position.set(42, 28, 10);
  internalBracketGroup.add(p2);
  const p3 = p1.clone();
  p3.position.set(-42, -28, 10);
  internalBracketGroup.add(p3);
  const p4 = p1.clone();
  p4.position.set(42, -28, 10);
  internalBracketGroup.add(p4);

  internalBracketGroup.position.set(0, 0, 4);

  registerPart({
    group: internalBracketGroup,
    id: 'khung_co_cau',
    stt: 12,
    name: 'Khung vách cơ cấu & chi tiết phụ',
    material: 'Thép mạ / Đồng thau kỹ thuật',
    quantity: '1 bộ',
    dimensions: '100 × 70 × 20 mm (Trụ đỡ, chốt, bạc lót)',
    notes: 'Bộ khung vách đỡ cụm truyền động bánh răng và trục thép bên trong thân máy, đảm bảo độ đồng tâm quay theo mục 4 bản vẽ.',
    category: 'Khung cơ khí',
    explodedOffset: new THREE.Vector3(25, 0, 15),
    dimBox: { w: 100, h: 70, d: 20 }
  });

  // PART 6: BÁNH RĂNG LỚN (Ø26 mm)
  const gearLargeGroup = new THREE.Group();
  gearLargeGroup.name = 'BanhRangLonGroup';
  const gearLargeGeom = createGearGeometry(13, 22, 2.4, 3, 4);
  const gearLargeMesh = new THREE.Mesh(gearLargeGeom, brassGearMaterial);
  gearLargeGroup.add(gearLargeMesh);
  gearLargeGroup.position.set(10, -5, 10);

  registerPart({
    group: gearLargeGroup,
    id: 'banh_rang_lon',
    stt: 6,
    name: 'Bánh răng lớn',
    material: 'Đồng thau nguyên khối (Brass)',
    quantity: '1',
    dimensions: 'Đường kính Ø26 mm, dày 4 mm (Lỗ trục Ø6 mm)',
    notes: 'Bánh răng chủ động lớn Ø26 mm, 22 răng mô-đun chính xác, liên kết với cụm trục truyền động chính.',
    category: 'Bộ truyền động',
    explodedOffset: new THREE.Vector3(50, -10, 5),
    dimBox: { w: 26, h: 26, d: 4 }
  });

  // PART 7: BÁNH RĂNG TRUNG GIAN (Ø18 mm)
  const gearMedGroup = new THREE.Group();
  gearMedGroup.name = 'BanhRangTrungGianGroup';
  const gearMedGeom = createGearGeometry(9, 16, 2.0, 3, 4);
  const gearMedMesh = new THREE.Mesh(gearMedGeom, silverGearMaterial);
  gearMedGroup.add(gearMedMesh);
  gearMedGroup.position.set(28, 8, 10);

  registerPart({
    group: gearMedGroup,
    id: 'banh_rang_trung_gian',
    stt: 7,
    name: 'Bánh răng trung gian',
    material: 'Thép mạ Chrome / Nhựa POM',
    quantity: '1',
    dimensions: 'Đường kính Ø18 mm, dày 4 mm (Lỗ trục Ø6 mm)',
    notes: 'Bánh răng trung gian Ø18 mm, 16 răng, đảo chiều và truyền mô-men từ bánh răng lớn sang các bánh răng truyền động phụ.',
    category: 'Bộ truyền động',
    explodedOffset: new THREE.Vector3(75, 15, 5),
    dimBox: { w: 18, h: 18, d: 4 }
  });

  // PART 8: BÁNH RĂNG NHỎ (Ø12 mm - 2 units)
  const gearSmallGroup = new THREE.Group();
  gearSmallGroup.name = 'BanhRangNhoGroup';

  const gearSmallGeom1 = createGearGeometry(6, 12, 1.6, 2, 4);
  const gearSmallMesh1 = new THREE.Mesh(gearSmallGeom1, brassGearMaterial);
  gearSmallMesh1.position.set(0, 0, 0);
  gearSmallGroup.add(gearSmallMesh1);

  const gearSmallMesh2 = new THREE.Mesh(gearSmallGeom1, silverGearMaterial);
  gearSmallMesh2.position.set(0, 14, 0);
  gearSmallGroup.add(gearSmallMesh2);

  gearSmallGroup.position.set(40, -10, 10);

  registerPart({
    group: gearSmallGroup,
    id: 'banh_rang_nho',
    stt: 8,
    name: 'Bánh răng nhỏ',
    material: 'Đồng thau & Thép mạ',
    quantity: '2',
    dimensions: 'Đường kính Ø12 mm (2 cái, Dày 4 mm)',
    notes: 'Bộ 2 bánh răng nhỏ Ø12 mm với 12 răng, ăn khớp với trục quay cassette và cơ cấu điều tốc.',
    category: 'Bộ truyền động',
    explodedOffset: new THREE.Vector3(98, -8, 5),
    dimBox: { w: 12, h: 26, d: 4 }
  });

  // PART 9: TRỤC TRUYỀN ĐỘNG (Ø6 mm, L=50 mm)
  const shaftGroup = new THREE.Group();
  shaftGroup.name = 'TrucThepGroup';

  const shaftMidGeom = new THREE.CylinderGeometry(3, 3, 30, 24);
  shaftMidGeom.rotateZ(Math.PI / 2);
  const shaftMidMesh = new THREE.Mesh(shaftMidGeom, steelShaftMaterial);
  shaftGroup.add(shaftMidMesh);

  const shaftEndLGeom = new THREE.CylinderGeometry(2.5, 2.5, 10, 24);
  shaftEndLGeom.rotateZ(Math.PI / 2);
  const shaftEndLMesh = new THREE.Mesh(shaftEndLGeom, steelShaftMaterial);
  shaftEndLMesh.position.set(-20, 0, 0);
  shaftGroup.add(shaftEndLMesh);

  const shaftEndRMesh = shaftEndLMesh.clone();
  shaftEndRMesh.position.set(20, 0, 0);
  shaftGroup.add(shaftEndRMesh);

  shaftGroup.position.set(35, 0, 10);

  registerPart({
    group: shaftGroup,
    id: 'truc_thep',
    stt: 9,
    name: 'Trục truyền động',
    material: 'Thép không gỉ mạ bóng (Stainless Steel)',
    quantity: '1',
    dimensions: 'Đường kính Ø6 mm, Chiều dài 50 mm (10-30-10 mm)',
    notes: 'Trục thép chính gia công tiện CNC chuẩn xác, chia bậc 10 - 30 - 10 mm, đảm bảo độ đồng tâm quay và chịu tải mô-men.',
    category: 'Cơ khí chính xác',
    explodedOffset: new THREE.Vector3(115, 0, 10),
    dimBox: { w: 50, h: 6, d: 6 }
  });

  // PART 10: NÚM XOAY (Ø35 mm, Dày 18 mm)
  const knobGroup = new THREE.Group();
  knobGroup.name = 'NumXoayGroup';

  const knobGeom = new THREE.CylinderGeometry(17.5, 17.5, 18, 48);
  knobGeom.rotateZ(Math.PI / 2);
  const knobMesh = new THREE.Mesh(knobGeom, knobMat);
  knobGroup.add(knobMesh);

  const knobCapGeom = new THREE.CylinderGeometry(16.5, 17.5, 1.5, 48);
  knobCapGeom.rotateZ(Math.PI / 2);
  const knobCapMesh = new THREE.Mesh(knobCapGeom, knobAccentMat);
  knobCapMesh.position.set(9.5, 0, 0);
  knobGroup.add(knobCapMesh);

  const dotGeom = new THREE.CylinderGeometry(1, 1, 1, 16);
  dotGeom.rotateZ(Math.PI / 2);
  const dotMesh = new THREE.Mesh(dotGeom, blackPlasticMaterial);
  dotMesh.position.set(10.2, 12, 0);
  knobGroup.add(dotMesh);

  const stemGeom = new THREE.CylinderGeometry(4, 4, 14, 24);
  stemGeom.rotateZ(Math.PI / 2);
  const stemMesh = new THREE.Mesh(stemGeom, silverGearMaterial);
  stemMesh.position.set(-11, 0, 0);
  knobGroup.add(stemMesh);

  knobGroup.position.set(84, 0, 8);

  registerPart({
    group: knobGroup,
    id: 'num_xoay',
    stt: 10,
    name: 'Núm xoay kim loại nguyên khối',
    material: 'Kim loại tiện nguyên khối khía ca-rô chống trượt',
    quantity: '1',
    dimensions: 'Đường kính Ø35 mm, Dày 18 mm (Chốt gắn Ø8 mm)',
    notes: 'Núm xoay kim loại tiện nguyên khối, khắc vân khía ca-rô (knurled diamond pattern) chống trượt, chốt gắn Ø8 mm.',
    category: 'Giao diện điều khiển',
    explodedOffset: new THREE.Vector3(145, 0, 8),
    dimBox: { w: 18, h: 35, d: 35 }
  });

  // PART 11: MẶT SAU & 4 VÍT LIÊN KẾT (150 x 110 x 16 mm)
  const backCoverGroup = new THREE.Group();
  backCoverGroup.name = 'MatSauGroup';

  const backShape = createRoundedRectShape(150, 110, 20);
  const backPlateGeom = new THREE.ExtrudeGeometry(backShape, {
    depth: 16,
    bevelEnabled: true,
    bevelThickness: 1.0,
    bevelSize: 1.0,
    bevelSegments: 3
  });
  backPlateGeom.center();
  const backPlateMesh = new THREE.Mesh(backPlateGeom, backMat);
  backCoverGroup.add(backPlateMesh);

  const screwGeom = new THREE.CylinderGeometry(2.5, 1.8, 4, 16);
  screwGeom.rotateX(Math.PI / 2);
  const screwMat = new THREE.MeshStandardMaterial({
    color: activeTheme === 'walnut' || activeTheme === 'midnight' ? 0xed9e59 : 0xcccccc,
    metalness: 0.9,
    roughness: 0.2
  });

  const screwPositions = [
    [-58, 40, -8.2],
    [58, 40, -8.2],
    [-58, -40, -8.2],
    [58, -40, -8.2]
  ];

  screwPositions.forEach(([sx, sy, sz]) => {
    const sMesh = new THREE.Mesh(screwGeom, screwMat);
    sMesh.position.set(sx, sy, sz);

    const slot1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.6, 0.8), blackPlasticMaterial);
    slot1.position.set(sx, sy, sz - 1.8);
    backCoverGroup.add(slot1);

    const slot2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.2, 0.8), blackPlasticMaterial);
    slot2.position.set(sx, sy, sz - 1.8);
    backCoverGroup.add(slot2);

    backCoverGroup.add(sMesh);
  });

  backCoverGroup.position.set(0, 0, -37);

  registerPart({
    group: backCoverGroup,
    id: 'mat_sau_vit',
    stt: 11,
    name: 'Mặt sau & 4 vít liên kết',
    material: 'Vỏ máy & 4 Vít thép M4',
    quantity: '1 nắp + 4 vít',
    dimensions: '150 × 110 × 16 mm (4 vít thép M4 liên kết)',
    notes: 'Nắp lưng bo góc R20 mm, cố định bằng 4 vít thép chịu lực chìm đều 4 góc, dễ dàng tháo lắp bảo dưỡng cơ cấu bên trong.',
    category: 'Vỏ máy',
    explodedOffset: new THREE.Vector3(0, 0, -85),
    dimBox: { w: 150, h: 110, d: 16 }
  });

  return {
    rootGroup,
    partsList,
    spools: [spoolLeft, spoolRight],
    gears: [gearLargeGroup, gearMedGroup, gearSmallGroup],
    knob: knobGroup,
    cassBodyMesh,
    updateCassetteSticker: (newTitle) => {
      const newTexture = createCassetteLabelTexture(newTitle, activeTheme);
      cassBodyMesh.material[1].map = newTexture;
      cassBodyMesh.material[1].needsUpdate = true;
    }
  };
}
