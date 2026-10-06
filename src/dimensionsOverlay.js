import * as THREE from 'three';

/**
 * CAD Dimensions Overlay
 * Projecting accurate CAD 1:1 dimension callouts from 3D space to 2D SVG
 * Strictly verified against Drawing MB-001
 */

export class CADDimensionsOverlay {
  constructor(container, camera) {
    this.container = container;
    this.camera = camera;
    this.currentMode = 'none';
    this.selectedPart = null;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'cad-dimensions-svg');
    this.svg.style.position = 'absolute';
    this.svg.style.top = '0';
    this.svg.style.left = '0';
    this.svg.style.width = '100%';
    this.svg.style.height = '100%';
    this.svg.style.pointerEvents = 'none';
    this.svg.style.zIndex = '20';
    this.container.appendChild(this.svg);

    this.createMarkers();

    // STRICTLY VERIFIED DIMENSIONS ACCORDING TO BLUEPRINT MB-001
    this.presets = {
      front: [
        // 1. Chiều rộng tổng 150 mm
        { p1: new THREE.Vector3(-75, 55, 45), p2: new THREE.Vector3(75, 55, 45), label: '150 mm (Rộng tổng)', offset: [0, -32], type: 'linear' },
        // 2. Chiều cao tổng 110 mm
        { p1: new THREE.Vector3(-75, -55, 45), p2: new THREE.Vector3(-75, 55, 45), label: '110 mm (Cao tổng)', offset: [-32, 0], type: 'linear' },
        // 3. Khoang mở cửa trước: 118 mm (150 - 16*2)
        { p1: new THREE.Vector3(-59, 37, 45), p2: new THREE.Vector3(59, 37, 45), label: '118 mm (Cửa kính)', offset: [0, -18], type: 'linear' },
        // 4. Chiều cao khoang mở cửa trước: 72 mm (110 - 18 - 20)
        { p1: new THREE.Vector3(59, -35, 45), p2: new THREE.Vector3(59, 37, 45), label: '72 mm', offset: [18, 0], type: 'linear' },
        // 5. Độ dày vách trái: 16 mm
        { p1: new THREE.Vector3(-75, 37, 45), p2: new THREE.Vector3(-59, 37, 45), label: '16', offset: [0, -18], type: 'linear' },
        // 6. Độ dày vách phải: 16 mm
        { p1: new THREE.Vector3(59, 37, 45), p2: new THREE.Vector3(75, 37, 45), label: '16', offset: [0, -18], type: 'linear' },
        // 7. Khoảng cách mép trên: 18 mm
        { p1: new THREE.Vector3(-45, 37, 45), p2: new THREE.Vector3(-45, 55, 45), label: '18', offset: [-18, 0], type: 'linear' },
        // 8. Khoảng cách mép dưới: 20 mm
        { p1: new THREE.Vector3(-45, -55, 45), p2: new THREE.Vector3(-45, -35, 45), label: '20', offset: [-18, 0], type: 'linear' },
        // 9. Thẻ ảnh lật bên trong: 104 x 68 mm
        { p1: new THREE.Vector3(-52, -22, 20), p2: new THREE.Vector3(52, -22, 20), label: '104 mm (Ảnh)', offset: [0, 18], type: 'linear' },
        // 10. Bo góc ngoài: R20
        { p1: new THREE.Vector3(65, 45, 45), p2: new THREE.Vector3(88, 68, 45), label: 'R20 (Bo góc ngoài)', type: 'radius' }
      ],
      back: [
        { p1: new THREE.Vector3(75, 55, -45), p2: new THREE.Vector3(-75, 55, -45), label: '150 mm', offset: [0, -28], type: 'linear' },
        { p1: new THREE.Vector3(75, -55, -45), p2: new THREE.Vector3(75, 55, -45), label: '110 mm', offset: [28, 0], type: 'linear' },
        { p1: new THREE.Vector3(-65, 45, -45), p2: new THREE.Vector3(-85, 65, -45), label: 'R20', type: 'radius' },
        { p1: new THREE.Vector3(58, 40, -45), p2: new THREE.Vector3(98, 40, -45), label: '4x Vít thép M4 liên kết', type: 'leader' }
      ],
      top: [
        { p1: new THREE.Vector3(-75, 55, -45), p2: new THREE.Vector3(75, 55, -45), label: '150 mm', offset: [0, -28], type: 'linear' },
        { p1: new THREE.Vector3(-75, 55, -45), p2: new THREE.Vector3(-75, 55, 45), label: '90 mm (Chiều sâu)', offset: [-28, 0], type: 'linear' },
        { p1: new THREE.Vector3(-52.5, 55, 0), p2: new THREE.Vector3(52.5, 55, 0), label: '105 mm (Khe nắp trên)', offset: [0, -18], type: 'linear' },
        { p1: new THREE.Vector3(-75, 55, 0), p2: new THREE.Vector3(-52.5, 55, 0), label: '22', offset: [0, -18], type: 'linear' },
        { p1: new THREE.Vector3(52.5, 55, 0), p2: new THREE.Vector3(75, 55, 0), label: '22', offset: [0, -18], type: 'linear' },
        { p1: new THREE.Vector3(56, 55, -8), p2: new THREE.Vector3(56, 55, 8), label: '16 mm', offset: [18, 0], type: 'linear' }
      ],
      right: [
        { p1: new THREE.Vector3(75, 55, 45), p2: new THREE.Vector3(75, 55, -45), label: '90 mm (Chiều sâu)', offset: [0, -28], type: 'linear' },
        { p1: new THREE.Vector3(75, -55, 45), p2: new THREE.Vector3(75, 55, 45), label: '110 mm', offset: [28, 0], type: 'linear' },
        { p1: new THREE.Vector3(75, 40, 45), p2: new THREE.Vector3(75, 40, 29), label: '16', offset: [0, -18], type: 'linear' },
        { p1: new THREE.Vector3(75, 40, 29), p2: new THREE.Vector3(75, 40, -29), label: '58 mm (Lòng khoang)', offset: [0, -18], type: 'linear' },
        { p1: new THREE.Vector3(75, 40, -29), p2: new THREE.Vector3(75, 40, -45), label: '16', offset: [0, -18], type: 'linear' },
        { p1: new THREE.Vector3(75, 0, 20), p2: new THREE.Vector3(113, 0, 20), label: '38 mm (Tay quay nhô ra)', offset: [0, 22], type: 'linear' }
      ]
    };
  }

  createMarkers() {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrow-start" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" class="cad-marker-path" />
      </marker>
      <marker id="arrow-end" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" class="cad-marker-path" />
      </marker>
      <marker id="dot-marker" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6">
        <circle cx="5" cy="5" r="3.5" class="cad-marker-path" />
      </marker>
    `;
    this.svg.appendChild(defs);
  }

  setMode(mode) {
    this.currentMode = mode;
    this.selectedPart = null;
    this.update();
  }

  setInspectPart(partData) {
    this.selectedPart = partData;
    this.currentMode = partData ? 'part' : 'none';
    this.update();
  }

  toScreen(pos) {
    const v = pos.clone();
    v.project(this.camera);

    const rect = this.container.getBoundingClientRect();
    const x = ((v.x + 1) / 2) * rect.width;
    const y = ((-v.y + 1) / 2) * rect.height;

    const isVisible = v.z < 1.0;
    return { x, y, isVisible };
  }

  update() {
    const oldElems = this.svg.querySelectorAll('.cad-dim-element');
    oldElems.forEach(el => el.remove());

    if (this.currentMode === 'none') return;

    let itemsToDraw = [];

    if (this.currentMode === 'part' && this.selectedPart) {
      itemsToDraw = this.getPartDimensions(this.selectedPart);
    } else if (this.presets[this.currentMode]) {
      itemsToDraw = this.presets[this.currentMode];
    }

    itemsToDraw.forEach(item => {
      this.renderDimensionItem(item);
    });
  }

  getPartDimensions(part) {
    const pos = part.group.position.clone();
    const box = part.dimBox || { w: 50, h: 50, d: 20 };
    const hw = box.w / 2;
    const hh = box.h / 2;
    const hd = box.d / 2;

    const items = [];

    items.push({
      p1: new THREE.Vector3(pos.x - hw, pos.y + hh + 8, pos.z),
      p2: new THREE.Vector3(pos.x + hw, pos.y + hh + 8, pos.z),
      label: `${box.w} mm`,
      offset: [0, -15],
      type: 'linear'
    });

    items.push({
      p1: new THREE.Vector3(pos.x - hw - 8, pos.y - hh, pos.z),
      p2: new THREE.Vector3(pos.x - hw - 8, pos.y + hh, pos.z),
      label: `${box.h} mm`,
      offset: [-15, 0],
      type: 'linear'
    });

    if (box.d > 0) {
      items.push({
        p1: new THREE.Vector3(pos.x + hw, pos.y - hh, pos.z - hd),
        p2: new THREE.Vector3(pos.x + hw, pos.y - hh, pos.z + hd),
        label: `Dày ${box.d} mm`,
        offset: [15, 10],
        type: 'linear'
      });
    }

    return items;
  }

  renderDimensionItem(item) {
    const s1 = this.toScreen(item.p1);
    const s2 = this.toScreen(item.p2);

    if (!s1.isVisible || !s2.isVisible) return;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'cad-dim-element');

    const offX = item.offset ? item.offset[0] : 0;
    const offY = item.offset ? item.offset[1] : 0;

    const p1x = s1.x + offX;
    const p1y = s1.y + offY;
    const p2x = s2.x + offX;
    const p2y = s2.y + offY;

    if (item.type === 'linear') {
      if (offX !== 0 || offY !== 0) {
        const extLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        extLine1.setAttribute('x1', s1.x);
        extLine1.setAttribute('y1', s1.y);
        extLine1.setAttribute('x2', p1x);
        extLine1.setAttribute('y2', p1y);
        extLine1.setAttribute('class', 'cad-witness-line');
        g.appendChild(extLine1);

        const extLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        extLine2.setAttribute('x1', s2.x);
        extLine2.setAttribute('y1', s2.y);
        extLine2.setAttribute('x2', p2x);
        extLine2.setAttribute('y2', p2y);
        extLine2.setAttribute('class', 'cad-witness-line');
        g.appendChild(extLine2);
      }

      const dimLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      dimLine.setAttribute('x1', p1x);
      dimLine.setAttribute('y1', p1y);
      dimLine.setAttribute('x2', p2x);
      dimLine.setAttribute('y2', p2y);
      dimLine.setAttribute('marker-start', 'url(#arrow-start)');
      dimLine.setAttribute('marker-end', 'url(#arrow-end)');
      dimLine.setAttribute('class', 'cad-dim-line');
      g.appendChild(dimLine);

      const midX = (p1x + p2x) / 2;
      const midY = (p1y + p2y) / 2;
      this.appendBadge(g, midX, midY, item.label);
    } else if (item.type === 'radius' || item.type === 'diameter' || item.type === 'leader') {
      const leaderLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      leaderLine.setAttribute('x1', s1.x);
      leaderLine.setAttribute('y1', s1.y);
      leaderLine.setAttribute('x2', s2.x);
      leaderLine.setAttribute('y2', s2.y);
      leaderLine.setAttribute('marker-start', 'url(#dot-marker)');
      leaderLine.setAttribute('class', 'cad-leader-line');
      g.appendChild(leaderLine);

      this.appendBadge(g, s2.x, s2.y, item.label);
    }

    this.svg.appendChild(g);
  }

  appendBadge(parentGroup, x, y, text) {
    const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElem.setAttribute('x', x);
    textElem.setAttribute('y', y);
    textElem.setAttribute('class', 'cad-dim-text');
    textElem.setAttribute('text-anchor', 'middle');
    textElem.setAttribute('dominant-baseline', 'central');
    textElem.textContent = text;

    this.svg.appendChild(textElem);
    const bbox = textElem.getBBox();
    this.svg.removeChild(textElem);

    const padX = 7;
    const padY = 3.5;

    const rectElem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectElem.setAttribute('x', bbox.x - padX);
    rectElem.setAttribute('y', bbox.y - padY);
    rectElem.setAttribute('width', bbox.width + padX * 2);
    rectElem.setAttribute('height', bbox.height + padY * 2);
    rectElem.setAttribute('rx', 4);
    rectElem.setAttribute('class', 'cad-dim-badge');

    parentGroup.appendChild(rectElem);
    parentGroup.appendChild(textElem);
  }
}
