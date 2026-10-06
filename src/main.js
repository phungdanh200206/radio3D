import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { buildCassettePlayerModel } from './modelBuilder.js';
import { CADDimensionsOverlay } from './dimensionsOverlay.js';
import { createStudioEnvironment } from './environment.js';
import { SummerAudioPlayer, TRACK_PLAYLIST } from './audioPlayer.js';
import { ALBUM_SLIDE_CONFIGS } from './textures.js';

// Application State
const state = {
  isDarkTheme: false, // Default: Clean Studio Light Mode
  colorTheme: 'oak', // Default: Natural Oak Wood
  currentView: 'default',
  explodedProgress: 0.0,
  isPlaying: false,
  isAutoRotating: false,
  hoveredPart: null,
  selectedPart: null,
  currentPhotoIndex: 0
};

// DOM Elements
const container = document.getElementById('canvas-container');
const btnTheme = document.getElementById('btn-theme-toggle');
const iconThemeDark = document.getElementById('icon-theme-dark');
const iconThemeLight = document.getElementById('icon-theme-light');
const themeText = document.getElementById('theme-text');
const swatchBtns = document.querySelectorAll('.swatch-btn[data-theme]');

// Music Drawer Elements
const btnMusicDrawer = document.getElementById('btn-music-drawer');
const musicDrawer = document.getElementById('music-drawer');
const btnCloseMusic = document.getElementById('btn-close-music');
const headerWaveBars = document.getElementById('header-wave-bars');
const drawerTrackTitle = document.getElementById('drawer-track-title');
const drawerTrackArtist = document.getElementById('drawer-track-artist');
const btnMusicPrev = document.getElementById('btn-music-prev');
const btnMusicPlay = document.getElementById('btn-music-play');
const btnMusicNext = document.getElementById('btn-music-next');
const iconPlayMain = document.getElementById('icon-play-main');
const iconPauseMain = document.getElementById('icon-pause-main');
const playlistContainer = document.getElementById('playlist-container');

// Volume Controls
const sliderVolume = document.getElementById('slider-volume');
const labelVolumeVal = document.getElementById('label-volume-val');
const btnMuteToggle = document.getElementById('btn-mute-toggle');
const iconVolHigh = document.getElementById('icon-vol-high');
const iconVolMute = document.getElementById('icon-vol-mute');

// SoundCloud Integration Controls
const inputSoundCloudUrl = document.getElementById('input-soundcloud-url');
const btnLoadSoundCloud = document.getElementById('btn-load-soundcloud');
const scWidgetIframe = document.getElementById('sc-widget-iframe');

// View & Exploded Controls
const btnToggleExplode = document.getElementById('btn-toggle-explode');
const sliderExplode = document.getElementById('slider-explode');
const labelExplodeVal = document.getElementById('label-explode-val');
const viewBtns = document.querySelectorAll('.view-btn[data-view]');
const btnAutoRotate = document.getElementById('btn-auto-rotate');
const btnResetView = document.getElementById('btn-reset-view');

// Inspect Card Elements
const inspectCard = document.getElementById('inspect-card');
const inspectBadge = document.getElementById('inspect-badge');
const inspectTitle = document.getElementById('inspect-title');
const inspectMaterial = document.getElementById('inspect-material');
const inspectQty = document.getElementById('inspect-qty');
const inspectDims = document.getElementById('inspect-dims');
const inspectNotes = document.getElementById('inspect-notes');
const btnCloseInspect = document.getElementById('btn-close-inspect');
const hoverTooltip = document.getElementById('hover-tooltip');

// 1. Setup Three.js Scene, Camera, Renderer
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Setup Studio Environment Map for Optical Glass & PBR Wood Grain Reflections
const studioEnvMap = createStudioEnvironment(renderer);
scene.environment = studioEnvMap;

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  1,
  2000
);
const defaultCameraPos = new THREE.Vector3(170, 130, 220);
camera.position.copy(defaultCameraPos);

// 2. Setup OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 60;
controls.maxDistance = 650;
controls.target.set(0, 0, 0);

// 3. Studio Lighting Rig (Default: Light Mode)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.05);
scene.add(ambientLight);

// Key Light (Warm Sunlight)
const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.5);
keyLight.position.set(160, 240, 180);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 50;
keyLight.shadow.camera.far = 600;
keyLight.shadow.bias = -0.0005;
const shadowRange = 120;
keyLight.shadow.camera.left = -shadowRange;
keyLight.shadow.camera.right = shadowRange;
keyLight.shadow.camera.top = shadowRange;
keyLight.shadow.camera.bottom = -shadowRange;
scene.add(keyLight);

// Fill Light
const fillLight = new THREE.DirectionalLight(0xecfdf5, 1.2);
fillLight.position.set(-180, 100, -120);
scene.add(fillLight);

// Rim Light for Edge Highlights
const rimLight = new THREE.DirectionalLight(0xfef3c7, 1.4);
rimLight.position.set(0, -140, -180);
scene.add(rimLight);

// Soft Contact Shadow Plane (NO GRID)
const shadowPlaneGeom = new THREE.PlaneGeometry(800, 800);
const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.18 });
const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowPlaneMat);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -56;
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

// 4. Build 3D Model
let modelData = null;
const dimensionsOverlay = new CADDimensionsOverlay(container, camera);

function loadModel(themeName) {
  if (modelData) {
    scene.remove(modelData.rootGroup);
  }
  state.colorTheme = themeName;
  modelData = buildCassettePlayerModel(themeName);
  scene.add(modelData.rootGroup);

  modelData.rootGroup.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  updateExplodedView(state.explodedProgress);

  // Update swatches active state
  swatchBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
  });
}

loadModel(state.colorTheme);

// Swatch Selector Buttons
swatchBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const theme = btn.getAttribute('data-theme');
    loadModel(theme);
    if (modelData && modelData.updateCardPhotos) {
      modelData.updateCardPhotos(state.currentPhotoIndex);
    }
  });
});

// 5. Audio Player & Volume Controller
const audioPlayer = new SummerAudioPlayer(
  // onTrackChange callback
  (track) => {
    drawerTrackTitle.textContent = track.title;
    drawerTrackArtist.textContent = `${track.artist} • ${track.genre}`;
    updatePlaylistActiveUI();
    // Update photo counter label to match track index
    if (state.currentPhotoIndex !== audioPlayer.currentIndex) {
      updatePhotoNavUI(audioPlayer.currentIndex);
      if (modelData && modelData.updateCardPhotos) {
        modelData.updateCardPhotos(audioPlayer.currentIndex);
      }
    }
  },
  // onPlayStateChange callback
  (isPlaying) => {
    state.isPlaying = isPlaying;
    iconPlayMain.style.display = isPlaying ? 'none' : 'block';
    iconPauseMain.style.display = isPlaying ? 'block' : 'none';
    btnMusicDrawer.classList.toggle('playing', isPlaying);
    headerWaveBars.classList.toggle('active', isPlaying);
  }
);

// Attach SoundCloud Widget
if (scWidgetIframe) {
  audioPlayer.attachSoundCloudWidget(scWidgetIframe);
}

// Volume Slider Event
sliderVolume.addEventListener('input', (e) => {
  const vol = parseFloat(e.target.value) / 100;
  audioPlayer.setVolume(vol);
  labelVolumeVal.textContent = `${Math.round(vol * 100)}%`;
  iconVolHigh.style.display = 'block';
  iconVolMute.style.display = 'none';
});

// Mute Toggle Event
btnMuteToggle.addEventListener('click', () => {
  const isMuted = audioPlayer.toggleMute();
  iconVolHigh.style.display = isMuted ? 'none' : 'block';
  iconVolMute.style.display = isMuted ? 'block' : 'none';
  labelVolumeVal.textContent = isMuted ? '0%' : `${Math.round(audioPlayer.volume * 100)}%`;
});

// Populate Playlist UI with Badges
function renderPlaylist() {
  playlistContainer.innerHTML = '';
  audioPlayer.playlist.forEach((track, idx) => {
    const item = document.createElement('div');
    item.className = `playlist-item ${idx === audioPlayer.currentIndex ? 'active' : ''}`;
    const badgeHtml = track.type === 'soundcloud'
      ? '<span class="badge-sc">SoundCloud</span>'
      : '<span class="badge-synth">Synth</span>';

    item.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 2px; text-align: left; max-width: 230px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        <span style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><strong>${idx + 1}.</strong> ${track.title}</span>
        <span style="font-size: 11px; opacity: 0.75; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${track.artist}</span>
      </div>
      <div>${badgeHtml}</div>
    `;
    item.addEventListener('click', () => {
      audioPlayer.selectTrack(idx);
    });
    playlistContainer.appendChild(item);
  });
}
renderPlaylist();

function updatePlaylistActiveUI() {
  const items = playlistContainer.querySelectorAll('.playlist-item');
  items.forEach((it, idx) => {
    it.classList.toggle('active', idx === audioPlayer.currentIndex);
  });
}

// SoundCloud URL Load Handler
async function handleSoundCloudLoad() {
  const url = inputSoundCloudUrl.value.trim();
  if (!url) return;
  btnLoadSoundCloud.disabled = true;
  btnLoadSoundCloud.innerHTML = '<span>Tải...</span>';

  try {
    await audioPlayer.loadSoundCloudUrl(url);
    renderPlaylist();
  } catch (err) {
    console.error('Error loading soundcloud url:', err);
  } finally {
    btnLoadSoundCloud.disabled = false;
    btnLoadSoundCloud.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      <span>Tải</span>
    `;
  }
}

if (btnLoadSoundCloud) {
  btnLoadSoundCloud.addEventListener('click', handleSoundCloudLoad);
}

if (inputSoundCloudUrl) {
  inputSoundCloudUrl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSoundCloudLoad();
    }
  });
}

// Music Drawer Toggle
btnMusicDrawer.addEventListener('click', () => {
  musicDrawer.classList.toggle('open');
});

btnCloseMusic.addEventListener('click', () => {
  musicDrawer.classList.remove('open');
});

btnMusicPlay.addEventListener('click', () => {
  audioPlayer.toggle();
});

btnMusicNext.addEventListener('click', () => {
  navigatePhoto(1);
});

btnMusicPrev.addEventListener('click', () => {
  navigatePhoto(-1);
});

// ==========================================
// Photo Film Reel Navigation System
// ==========================================

// Song title array for display (matches TRACK_PLAYLIST order)
const PHOTO_SONG_TITLES = [
  'Người Dưng',
  'Lưu Niên',
  'Anh Yêu Em',
  'Hoa Trong Đá',
  'Nát Tan Cõi Lòng',
  'Tam Thái Tử',
  'Mỗi Lần Nhớ Em'
];

const btnPhotoPrev = document.getElementById('btn-photo-prev');
const btnPhotoNext = document.getElementById('btn-photo-next');
const photoCounter = document.getElementById('photo-counter');
const photoTitleLabel = document.getElementById('photo-title');
const photoThumb = document.getElementById('photo-nav-thumb');
const drawerTrackThumb = document.getElementById('drawer-track-thumb');
const photoDotsContainer = document.getElementById('photo-dots-container');

function initPhotoDots() {
  if (!photoDotsContainer) return;
  photoDotsContainer.innerHTML = '';
  ALBUM_SLIDE_CONFIGS.forEach((cfg, idx) => {
    const dot = document.createElement('div');
    dot.className = `photo-dot ${idx === state.currentPhotoIndex ? 'active' : ''}`;
    dot.title = `${idx + 1}. ${cfg.title}`;
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const diff = idx - state.currentPhotoIndex;
      if (diff !== 0) {
        navigatePhoto(diff);
      }
    });
    photoDotsContainer.appendChild(dot);
  });
}

function updatePhotoDots(index) {
  if (!photoDotsContainer) return;
  const dots = photoDotsContainer.querySelectorAll('.photo-dot');
  dots.forEach((d, idx) => {
    d.classList.toggle('active', idx === index);
  });
}

function updatePhotoNavUI(index) {
  state.currentPhotoIndex = index;
  const cfg = ALBUM_SLIDE_CONFIGS[index % ALBUM_SLIDE_CONFIGS.length];
  if (photoCounter) photoCounter.textContent = `Ảnh ${index + 1} / 7`;
  if (photoTitleLabel) photoTitleLabel.textContent = cfg ? cfg.title : PHOTO_SONG_TITLES[index] || '';
  if (photoThumb && cfg) {
    photoThumb.src = cfg.imageUrl;
  }
  if (drawerTrackThumb && cfg) {
    drawerTrackThumb.src = cfg.imageUrl;
  }
  updatePhotoDots(index);
}

function navigatePhoto(direction) {
  const total = ALBUM_SLIDE_CONFIGS.length;
  const newIndex = ((state.currentPhotoIndex + direction) % total + total) % total;

  if (modelData && modelData.animateCardFlip) {
    modelData.animateCardFlip(direction);
  } else if (modelData && modelData.updateCardPhotos) {
    modelData.updateCardPhotos(newIndex);
  }

  audioPlayer.selectTrack(newIndex);
  updatePhotoNavUI(newIndex);
  updatePlaylistActiveUI();
}

if (btnPhotoPrev) {
  btnPhotoPrev.addEventListener('click', () => navigatePhoto(-1));
}
if (btnPhotoNext) {
  btnPhotoNext.addEventListener('click', () => navigatePhoto(1));
}

// Keyboard arrow key navigation
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    navigatePhoto(-1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    navigatePhoto(1);
  }
});

// Initialize photo nav UI & Dots
initPhotoDots();
updatePhotoNavUI(0);



// 6. Exploded View Controller
function updateExplodedView(progress) {
  state.explodedProgress = progress;
  sliderExplode.value = Math.round(progress * 100);
  labelExplodeVal.textContent = `${Math.round(progress * 100)}%`;

  if (!modelData) return;

  modelData.partsList.forEach((part) => {
    const targetPos = part.defaultPos.clone().addScaledVector(part.explodedOffset, progress);
    part.group.position.copy(targetPos);
  });

  if (progress > 0.05) {
    btnToggleExplode.classList.add('active');
  } else {
    btnToggleExplode.classList.remove('active');
  }

  dimensionsOverlay.update();
}

sliderExplode.addEventListener('input', (e) => {
  const p = parseFloat(e.target.value) / 100;
  updateExplodedView(p);
});

btnToggleExplode.addEventListener('click', () => {
  const targetVal = state.explodedProgress > 0.1 ? 0.0 : 1.0;
  gsap.to(state, {
    explodedProgress: targetVal,
    duration: 1.0,
    ease: 'power2.inOut',
    onUpdate: () => {
      updateExplodedView(state.explodedProgress);
    }
  });
});

// 7. Camera Preset Views (STRICTLY ALIGNED TO BLUEPRINT)
const cameraPresets = {
  default: {
    pos: new THREE.Vector3(170, 130, 220),
    target: new THREE.Vector3(0, 0, 0),
    cadMode: 'none'
  },
  front: {
    // Exact perpendicular front view to inspect 150, 110, 118, 72, 16, 18, 20, R20
    pos: new THREE.Vector3(0, 1, 280),
    target: new THREE.Vector3(0, 1, 0),
    cadMode: 'front'
  },
  back: {
    pos: new THREE.Vector3(0, 0, -280),
    target: new THREE.Vector3(0, 0, 0),
    cadMode: 'back'
  },
  top: {
    pos: new THREE.Vector3(0, 280, 0.001),
    target: new THREE.Vector3(0, 0, 0),
    cadMode: 'top'
  },
  right: {
    pos: new THREE.Vector3(280, 0, 0),
    target: new THREE.Vector3(0, 0, 0),
    cadMode: 'right'
  }
};

function switchView(viewKey) {
  state.currentView = viewKey;

  viewBtns.forEach((btn) => {
    if (btn.getAttribute('data-view') === viewKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const preset = cameraPresets[viewKey];
  if (!preset) return;

  closeInspectCard();

  gsap.to(camera.position, {
    x: preset.pos.x,
    y: preset.pos.y,
    z: preset.pos.z,
    duration: 1.1,
    ease: 'power2.inOut'
  });

  gsap.to(controls.target, {
    x: preset.target.x,
    y: preset.target.y,
    z: preset.target.z,
    duration: 1.1,
    ease: 'power2.inOut',
    onUpdate: () => {
      controls.update();
    },
    onComplete: () => {
      dimensionsOverlay.setMode(preset.cadMode);
    }
  });
}

viewBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const view = btn.getAttribute('data-view');
    switchView(view);
  });
});

btnAutoRotate.addEventListener('click', () => {
  state.isAutoRotating = !state.isAutoRotating;
  controls.autoRotate = state.isAutoRotating;
  controls.autoRotateSpeed = 2.0;
  btnAutoRotate.classList.toggle('active', state.isAutoRotating);
});

btnResetView.addEventListener('click', () => {
  if (state.explodedProgress > 0) {
    gsap.to(state, {
      explodedProgress: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => updateExplodedView(state.explodedProgress)
    });
  }
  switchView('default');
});

// 8. Raycasting Hover & Click-to-Inspect
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function getIntersectedPart(event) {
  if (!modelData) return null;
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(modelData.rootGroup.children, true);

  for (const hit of intersects) {
    let curr = hit.object;
    while (curr) {
      if (curr.userData && curr.userData.partData) {
        return curr.userData.partData;
      }
      curr = curr.parent;
    }
  }
  return null;
}

window.addEventListener('mousemove', (event) => {
  const part = getIntersectedPart(event);

  if (part !== state.hoveredPart) {
    if (state.hoveredPart && state.hoveredPart !== state.selectedPart) {
      unhighlightPart(state.hoveredPart);
    }
    state.hoveredPart = part;
    if (part && part !== state.selectedPart) {
      highlightPart(part);
    }
  }

  if (part) {
    if (part.id === 'co_cau_lat_anh' || part.id === 'tay_quay' || part.id === 'tam_mica') {
      const isRight = event.clientX > window.innerWidth / 2;
      hoverTooltip.textContent = isRight ? 'Click để quay tay quay & Lật Ảnh / Đổi Nhạc (▶)' : 'Click để quay tay quay & Lật Ảnh / Đổi Nhạc (◀)';
    } else {
      hoverTooltip.textContent = `${part.name} (STT ${part.stt})`;
    }
    hoverTooltip.style.left = `${event.clientX}px`;
    hoverTooltip.style.top = `${event.clientY}px`;
    hoverTooltip.classList.add('visible');
    container.style.cursor = 'pointer';
  } else {
    hoverTooltip.classList.remove('visible');
    container.style.cursor = 'default';
  }
});

function highlightPart(part) {
  part.group.traverse((child) => {
    if (child.isMesh && child.material) {
      if (!child.userData.origEmissive) {
        child.userData.origEmissive = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0x000000);
      }
      if (child.material.emissive) {
        child.material.emissive.setHex(0xe5a96b);
      }
    }
  });
}

function unhighlightPart(part) {
  part.group.traverse((child) => {
    if (child.isMesh && child.material && child.material.emissive && child.userData.origEmissive) {
      child.material.emissive.copy(child.userData.origEmissive);
    }
  });
}

window.addEventListener('click', (event) => {
  if (
    event.target.closest('.header-bar') ||
    event.target.closest('.bottom-controls') ||
    event.target.closest('.inspect-card') ||
    event.target.closest('.music-drawer') ||
    event.target.closest('.photo-nav-bar')
  ) {
    return;
  }

  const part = getIntersectedPart(event);
  if (part) {
    // Direct 3D interaction: Click on split-flap cards, crank handle, or front glass flips photo & song!
    if (part.id === 'co_cau_lat_anh' || part.id === 'tay_quay' || part.id === 'tam_mica') {
      const isRight = event.clientX > window.innerWidth / 2;
      navigatePhoto(isRight ? 1 : -1);
      return;
    }
    selectPart(part);
  }
});

function selectPart(part) {
  if (state.selectedPart) {
    unhighlightPart(state.selectedPart);
  }
  state.selectedPart = part;
  highlightPart(part);

  inspectBadge.textContent = `STT ${part.stt} • ${part.category}`;
  inspectTitle.textContent = part.name;
  inspectMaterial.textContent = part.material;
  inspectQty.textContent = `${part.quantity}`;
  inspectDims.textContent = part.dimensions;
  inspectNotes.textContent = part.notes;

  inspectCard.classList.add('open');
  dimensionsOverlay.setInspectPart(part);
}

function closeInspectCard() {
  if (state.selectedPart) {
    unhighlightPart(state.selectedPart);
    state.selectedPart = null;
  }
  inspectCard.classList.remove('open');
  dimensionsOverlay.setInspectPart(null);
}

btnCloseInspect.addEventListener('click', closeInspectCard);

// 9. Light / Dark Mode Toggle
btnTheme.addEventListener('click', () => {
  state.isDarkTheme = !state.isDarkTheme;
  document.body.classList.toggle('light-theme', !state.isDarkTheme);

  if (state.isDarkTheme) {
    ambientLight.color.setHex(0xffffff);
    ambientLight.intensity = 0.85;
    keyLight.intensity = 2.6;
    fillLight.color.setHex(0xe8d0be);
    shadowPlane.material.opacity = 0.35;

    iconThemeDark.style.display = 'block';
    iconThemeLight.style.display = 'none';
    themeText.textContent = 'Giao diện Sáng';
  } else {
    ambientLight.color.setHex(0xffffff);
    ambientLight.intensity = 1.05;
    keyLight.intensity = 2.5;
    fillLight.color.setHex(0xecfdf5);
    shadowPlane.material.opacity = 0.18;

    iconThemeDark.style.display = 'none';
    iconThemeLight.style.display = 'block';
    themeText.textContent = 'Giao diện Tối';
  }

  dimensionsOverlay.update();
});

// 10. Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  controls.update();

  // Spin mechanical crank & gears when playing music
  if (state.isPlaying && modelData) {
    if (modelData.crank) {
      modelData.crank.rotation.x -= delta * 1.5;
    }

    // Mechanical gears spin according to ratio
    if (modelData.gears) {
      if (modelData.gears[0]) modelData.gears[0].rotation.z += delta * 1.8;
      if (modelData.gears[1]) modelData.gears[1].rotation.z -= delta * 1.8 * (26 / 18);
      if (modelData.gears[2]) modelData.gears[2].rotation.z += delta * 1.8 * (26 / 12);
    }

    if (modelData.knob) {
      modelData.knob.rotation.x = Math.sin(elapsedTime * 4) * 0.05;
    }
  }

  dimensionsOverlay.update();
  renderer.render(scene, camera);
}

animate();

// 11. Responsive Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  dimensionsOverlay.update();
});
