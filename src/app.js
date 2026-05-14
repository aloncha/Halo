import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#space-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030611, 0.0045);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(-58, 38, 86);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.045;
controls.minDistance = 9;
controls.maxDistance = 320;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.18;
controls.target.set(0, 0, 0);

const textureLoader = new THREE.TextureLoader();
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const planetMeshes = [];
const orbitLines = [];
const planetarySystem = new THREE.Group();
scene.add(planetarySystem);

const textureBase = 'https://threejs.org/examples/textures/planets/';
const planetData = [
  {
    name: 'Mercury', radius: 0.72, distance: 9, speed: 0.024, rotation: 0.011, tilt: 0.03,
    texture: 'mercury.jpg', fallback: ['#7d746b', '#bbb2a7', '#3a352f'],
    diameter: '4,879 km', sunDistance: '57.9 million km', period: '88 Earth days', temperature: '-173°C to 427°C', atmosphere: 'Extremely thin exosphere: oxygen, sodium, hydrogen, helium, potassium.',
    summary: 'A scarred iron world racing around the Sun faster than any other planet.',
    facts: 'A solar day on Mercury lasts 176 Earth days, twice its year.'
  },
  {
    name: 'Venus', radius: 1.08, distance: 13, speed: 0.017, rotation: -0.004, tilt: 3.1,
    texture: 'venus.jpg', fallback: ['#c9934c', '#f0d08b', '#7a4d2c'],
    diameter: '12,104 km', sunDistance: '108.2 million km', period: '225 Earth days', temperature: 'About 465°C', atmosphere: 'Dense carbon dioxide atmosphere with sulfuric acid clouds.',
    summary: 'A brilliant, hostile planet wrapped in reflective clouds and crushing pressure.',
    facts: 'Venus rotates backward and its day is longer than its year.'
  },
  {
    name: 'Earth', radius: 1.18, distance: 18, speed: 0.012, rotation: 0.02, tilt: 0.41,
    texture: 'earth_atmos_2048.jpg', normal: 'earth_normal_2048.jpg', specular: 'earth_specular_2048.jpg', clouds: 'earth_clouds_1024.png', fallback: ['#1c4e82', '#2b7a62', '#d6d3bf'],
    diameter: '12,742 km', sunDistance: '149.6 million km', period: '365.25 days', temperature: 'Average about 15°C', atmosphere: 'Nitrogen, oxygen, argon, carbon dioxide, water vapor.',
    summary: 'A living blue marble with dynamic clouds, glowing cities, oceans, and continents.',
    facts: 'Earth is the only known world with stable surface liquid water and life.'
  },
  {
    name: 'Mars', radius: 0.92, distance: 23, speed: 0.0096, rotation: 0.019, tilt: 0.44,
    texture: 'mars_1k_color.jpg', fallback: ['#9a4b31', '#d38856', '#3e211b'],
    diameter: '6,779 km', sunDistance: '227.9 million km', period: '687 Earth days', temperature: '-125°C to 20°C', atmosphere: 'Thin carbon dioxide atmosphere with nitrogen and argon.',
    summary: 'The red planet: dusty, frozen, volcanic, and etched by ancient water.',
    facts: 'Olympus Mons is the largest volcano known in the Solar System.'
  },
  {
    name: 'Jupiter', radius: 2.65, distance: 32, speed: 0.0047, rotation: 0.044, tilt: 0.05,
    texture: 'jupiter.jpg', fallback: ['#c79a6c', '#f1d3a7', '#6d4931'],
    diameter: '139,820 km', sunDistance: '778.5 million km', period: '11.86 Earth years', temperature: 'Cloud tops about -145°C', atmosphere: 'Hydrogen and helium with ammonia, methane, and water traces.',
    summary: 'A colossal gas giant with banded storms and a Great Red Spot larger than Earth.',
    facts: 'Jupiter has more mass than all other planets combined.'
  },
  {
    name: 'Saturn', radius: 2.25, distance: 43, speed: 0.0035, rotation: 0.038, tilt: 0.47,
    texture: 'saturn.jpg', ringTexture: 'saturnringcolor.jpg', fallback: ['#d8bd8a', '#f3dfb0', '#7a6241'],
    diameter: '116,460 km', sunDistance: '1.43 billion km', period: '29.45 Earth years', temperature: 'Cloud tops about -178°C', atmosphere: 'Hydrogen and helium, with traces of methane and ammonia.',
    summary: 'A golden gas giant encircled by icy rings that span hundreds of thousands of kilometers.',
    facts: 'Saturn is less dense than water; it would float in a planet-sized ocean.'
  },
  {
    name: 'Uranus', radius: 1.58, distance: 54, speed: 0.0025, rotation: -0.026, tilt: 1.71,
    texture: 'uranus.jpg', fallback: ['#7fc6d4', '#c6f5ff', '#3c788e'],
    diameter: '50,724 km', sunDistance: '2.87 billion km', period: '84 Earth years', temperature: 'About -224°C', atmosphere: 'Hydrogen, helium, methane, and icy hydrocarbons.',
    summary: 'An ice giant tipped almost sideways, glowing cyan from methane-rich haze.',
    facts: 'Uranus rolls around the Sun with an axial tilt of about 98 degrees.'
  },
  {
    name: 'Neptune', radius: 1.52, distance: 64, speed: 0.002, rotation: 0.03, tilt: 0.49,
    texture: 'neptune.jpg', fallback: ['#244ad8', '#5aa5ff', '#111c68'],
    diameter: '49,244 km', sunDistance: '4.50 billion km', period: '164.8 Earth years', temperature: 'About -214°C', atmosphere: 'Hydrogen, helium, methane; turbulent storm systems.',
    summary: 'A deep-blue ice giant with supersonic winds and dark anticyclonic storms.',
    facts: 'Neptune’s winds can exceed 2,000 km/h, among the fastest in the Solar System.'
  }
];

function makeProceduralTexture(name, palette, width = 1024, height = 512) {
  const canvas2d = document.createElement('canvas');
  canvas2d.width = width;
  canvas2d.height = height;
  const ctx = canvas2d.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  palette.forEach((color, index) => gradient.addColorStop(index / (palette.length - 1), color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  for (let y = 0; y < height; y += 2) {
    const wave = Math.sin(y * 0.035 + name.length) * 18;
    ctx.fillStyle = `rgba(255,255,255,${0.035 + Math.random() * 0.045})`;
    ctx.fillRect(Math.max(0, wave), y, width, 1);
  }
  for (let i = 0; i < 1800; i += 1) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.16})`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas2d);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

function loadPlanetTexture(file, palette, label) {
  const texture = textureLoader.load(
    `${textureBase}${file}`,
    (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = renderer.capabilities.getMaxAnisotropy();
    },
    undefined,
    () => {
      texture.image = makeProceduralTexture(label, palette).image;
      texture.needsUpdate = true;
    }
  );
  return texture;
}

function createGlowTexture(colorA, colorB) {
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 512;
  glowCanvas.height = 512;
  const ctx = glowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(256, 256, 12, 256, 256, 256);
  gradient.addColorStop(0, colorA);
  gradient.addColorStop(0.18, colorB);
  gradient.addColorStop(0.52, 'rgba(255,130,30,0.28)');
  gradient.addColorStop(1, 'rgba(255,130,30,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  const texture = new THREE.CanvasTexture(glowCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createEarthNightTexture() {
  const night = document.createElement('canvas');
  night.width = 1024;
  night.height = 512;
  const ctx = night.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, night.width, night.height);
  const clusters = [
    [230, 205, 92], [285, 188, 70], [498, 196, 90], [548, 205, 110],
    [708, 210, 120], [784, 230, 76], [835, 178, 70], [425, 285, 64]
  ];
  clusters.forEach(([cx, cy, amount]) => {
    for (let i = 0; i < amount; i += 1) {
      const spreadX = 18 + Math.random() * 58;
      const spreadY = 10 + Math.random() * 34;
      const x = cx + THREE.MathUtils.randFloatSpread(spreadX);
      const y = cy + THREE.MathUtils.randFloatSpread(spreadY);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 4 + Math.random() * 6);
      glow.addColorStop(0, 'rgba(255,218,124,0.9)');
      glow.addColorStop(1, 'rgba(255,130,40,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - 8, y - 8, 16, 16);
    }
  });
  const texture = new THREE.CanvasTexture(night);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addLightingAndSun() {
  const sunTexture = loadPlanetTexture('sun.jpg', ['#4b1204', '#ff8b00', '#fff3a7'], 'Sun');
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(4.8, 96, 96),
    new THREE.MeshBasicMaterial({ map: sunTexture, color: 0xffc36b })
  );
  sun.name = 'Sun';
  planetarySystem.add(sun);

  const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGlowTexture('rgba(255,255,240,1)', 'rgba(255,196,72,0.75)'), color: 0xffc66d, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  corona.scale.set(29, 29, 1);
  sun.add(corona);

  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGlowTexture('rgba(170,230,255,0.9)', 'rgba(255,255,255,0.22)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  flare.position.set(-11, 4, 0);
  flare.scale.set(54, 12, 1);
  planetarySystem.add(flare);

  scene.add(new THREE.AmbientLight(0x557099, 0.42));
  const sunLight = new THREE.PointLight(0xffd9a3, 920, 420, 1.45);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);
  return sun;
}

function createOrbit(radius) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
  const points = curve.getPoints(256).map((point) => new THREE.Vector3(point.x, 0, point.y));
  const orbit = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x78dfff, transparent: true, opacity: 0.16 })
  );
  planetarySystem.add(orbit);
  orbitLines.push(orbit);
}

function createAtmosphere(radius, color = 0x7ddfff) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.035, 64, 64),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false })
  );
}

function createPlanet(data, index) {
  createOrbit(data.distance);
  const pivot = new THREE.Group();
  pivot.userData = { speed: data.speed, phase: index * 0.75 };
  planetarySystem.add(pivot);

  const map = loadPlanetTexture(data.texture, data.fallback, data.name);
  const material = new THREE.MeshStandardMaterial({ map, roughness: 0.82, metalness: 0.02 });
  if (data.specular) {
    material.roughnessMap = loadPlanetTexture(data.specular, ['#222', '#777', '#fff'], `${data.name} specular`);
  }
  if (data.normal) {
    material.normalMap = loadPlanetTexture(data.normal, ['#777', '#999', '#bbb'], `${data.name} normal`);
    material.normalScale = new THREE.Vector2(0.45, 0.45);
  }

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.radius, 96, 96), material);
  mesh.position.x = data.distance;
  mesh.rotation.z = data.tilt;
  mesh.userData = { ...data, pivot, baseRadius: data.radius };
  pivot.add(mesh);
  planetMeshes.push(mesh);

  if (['Earth', 'Venus', 'Uranus', 'Neptune'].includes(data.name)) {
    mesh.add(createAtmosphere(data.radius, data.name === 'Earth' ? 0x72d9ff : 0xaeefff));
  }

  if (data.name === 'Earth') {
    const cloudMap = loadPlanetTexture(data.clouds, ['rgba(255,255,255,0.1)', '#ffffff', 'rgba(255,255,255,0.4)'], 'Earth clouds');
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius * 1.018, 96, 96),
      new THREE.MeshStandardMaterial({ map: cloudMap, transparent: true, opacity: 0.55, roughness: 1, depthWrite: false })
    );
    clouds.userData.rotation = 0.026;
    mesh.add(clouds);
    mesh.userData.clouds = clouds;

    const nightMap = createEarthNightTexture();
    const cityLights = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius * 1.012, 96, 96),
      new THREE.MeshBasicMaterial({ map: nightMap, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    mesh.add(cityLights);
    mesh.userData.cityLights = cityLights;

    const moonPivot = new THREE.Group();
    mesh.add(moonPivot);
    const moonMap = loadPlanetTexture('moon_1024.jpg', ['#595959', '#d8d8d8', '#222'], 'Moon');
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.28, 48, 48), new THREE.MeshStandardMaterial({ map: moonMap, roughness: 0.9 }));
    moon.position.set(2.15, 0.08, 0);
    moonPivot.userData.speed = 0.9;
    moonPivot.add(moon);
    mesh.userData.moonPivot = moonPivot;
  }

  if (data.name === 'Saturn') {
    const ringMap = loadPlanetTexture(data.ringTexture, ['rgba(255,255,255,0)', '#d8bf85', '#776043'], 'Saturn rings');
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(data.radius * 1.35, data.radius * 2.35, 192),
      new THREE.MeshBasicMaterial({ map: ringMap, transparent: true, opacity: 0.78, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.rotation.x = Math.PI / 2;
    ring.rotation.y = 0.08;
    mesh.add(ring);
  }

  return mesh;
}

function createAsteroidBelt() {
  const count = 1900;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    const radius = 27 + Math.random() * 3.8;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.95;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    color.setHSL(0.08, 0.14, 0.45 + Math.random() * 0.25);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const belt = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.86 }));
  planetarySystem.add(belt);
  return belt;
}

function createScanHalo() {
  const group = new THREE.Group();
  group.visible = false;
  const material = new THREE.MeshBasicMaterial({ color: 0x7ce7ff, transparent: true, opacity: 0.46, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.7 + i * 0.42, 0.01, 8, 192), material.clone());
    ring.rotation.x = Math.PI / 2 + i * 0.42;
    ring.rotation.y = i * 0.34;
    ring.userData.spin = 0.24 + i * 0.12;
    group.add(ring);
  }
  scene.add(group);
  return group;
}

function createStarfield() {
  const count = 6500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    const radius = 700 + Math.random() * 1200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    color.setHSL(0.58 + Math.random() * 0.12, 0.45, 0.65 + Math.random() * 0.35);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ size: 2.2, vertexColors: true, transparent: true, opacity: 0.95, sizeAttenuation: true })));
}

function createNebula() {
  const nebula = document.createElement('canvas');
  nebula.width = 2048;
  nebula.height = 1024;
  const ctx = nebula.getContext('2d');
  const bg = ctx.createRadialGradient(900, 390, 10, 900, 390, 900);
  bg.addColorStop(0, '#263b87');
  bg.addColorStop(0.28, '#151c48');
  bg.addColorStop(0.62, '#060915');
  bg.addColorStop(1, '#01030a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, nebula.width, nebula.height);
  for (let i = 0; i < 110; i += 1) {
    const x = Math.random() * nebula.width;
    const y = Math.random() * nebula.height;
    const r = 70 + Math.random() * 240;
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, r);
    cloud.addColorStop(0, `hsla(${210 + Math.random() * 80}, 95%, 62%, 0.12)`);
    cloud.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cloud;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const texture = new THREE.CanvasTexture(nebula);
  texture.colorSpace = THREE.SRGBColorSpace;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1850, 64, 64), new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }));
  scene.add(dome);
}

const sun = addLightingAndSun();
planetData.forEach(createPlanet);
const asteroidBelt = createAsteroidBelt();
const scanHalo = createScanHalo();
createStarfield();
createNebula();

const panel = document.querySelector('#planet-panel');
const hyperspace = document.querySelector('#hyperspace');
const loading = document.querySelector('#loading');
const panelFields = {
  status: document.querySelector('#panel-status'),
  name: document.querySelector('#planet-name'),
  summary: document.querySelector('#planet-summary'),
  diameter: document.querySelector('#planet-diameter'),
  distance: document.querySelector('#planet-distance'),
  period: document.querySelector('#planet-period'),
  temp: document.querySelector('#planet-temp'),
  atmosphere: document.querySelector('#planet-atmosphere'),
  facts: document.querySelector('#planet-facts')
};
let activeFlyby = null;
let selectedPlanet = null;

function setPanel(data) {
  panelFields.status.textContent = 'Planetary Profile • Telemetry Locked';
  panelFields.name.textContent = data.name;
  panelFields.summary.textContent = data.summary;
  panelFields.diameter.textContent = data.diameter;
  panelFields.distance.textContent = data.sunDistance;
  panelFields.period.textContent = data.period;
  panelFields.temp.textContent = data.temperature;
  panelFields.atmosphere.textContent = data.atmosphere;
  panelFields.facts.textContent = data.facts;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function flyToPlanet(mesh) {
  const worldPosition = new THREE.Vector3();
  mesh.getWorldPosition(worldPosition);
  const direction = worldPosition.clone().normalize();
  const side = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(mesh.userData.baseRadius * 1.4);
  const destination = worldPosition.clone().add(direction.multiplyScalar(mesh.userData.baseRadius * 4.4)).add(side).add(new THREE.Vector3(0, mesh.userData.baseRadius * 1.2, 0));
  activeFlyby = {
    start: performance.now(),
    duration: 1850,
    from: camera.position.clone(),
    to: destination,
    targetFrom: controls.target.clone(),
    targetTo: worldPosition.clone(),
    mesh
  };
  selectedPlanet = mesh;
  setPanel(mesh.userData);
  panel.classList.remove('visible');
  hyperspace.classList.add('active');
  controls.autoRotate = false;
  setTimeout(() => panel.classList.add('visible'), 1320);
  setTimeout(() => hyperspace.classList.remove('active'), 1620);
}

function pointerToNdc(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onPointerUp(event) {
  pointerToNdc(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(planetMeshes, false);
  if (hits.length) flyToPlanet(hits[0].object);
}

function resetCamera() {
  activeFlyby = {
    start: performance.now(),
    duration: 1250,
    from: camera.position.clone(),
    to: new THREE.Vector3(-58, 38, 86),
    targetFrom: controls.target.clone(),
    targetTo: new THREE.Vector3(0, 0, 0)
  };
  selectedPlanet = null;
  panel.classList.remove('visible');
  controls.autoRotate = true;
}

renderer.domElement.addEventListener('pointerup', onPointerUp);
document.querySelector('#reset-camera').addEventListener('click', resetCamera);
document.querySelector('#close-panel').addEventListener('click', () => panel.classList.remove('visible'));
document.querySelector('#toggle-orbits').addEventListener('click', (event) => {
  const visible = !orbitLines[0].visible;
  orbitLines.forEach((line) => { line.visible = visible; });
  event.currentTarget.setAttribute('aria-pressed', String(visible));
});

function updateFlyby() {
  if (!activeFlyby) return;
  const elapsed = performance.now() - activeFlyby.start;
  const progress = Math.min(elapsed / activeFlyby.duration, 1);
  const eased = easeInOutCubic(progress);
  camera.position.lerpVectors(activeFlyby.from, activeFlyby.to, eased);
  controls.target.lerpVectors(activeFlyby.targetFrom, activeFlyby.targetTo, eased);
  if (progress >= 1) activeFlyby = null;
}

function animate() {
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;
  sun.rotation.y += delta * 0.055;
  asteroidBelt.rotation.y += delta * 0.012;
  planetMeshes.forEach((mesh) => {
    mesh.userData.pivot.rotation.y = elapsed * mesh.userData.speed + mesh.userData.pivot.userData.phase;
    mesh.rotation.y += mesh.userData.rotation;
    if (mesh.userData.clouds) mesh.userData.clouds.rotation.y += delta * mesh.userData.clouds.userData.rotation;
    if (mesh.userData.cityLights) mesh.userData.cityLights.rotation.y += mesh.userData.rotation;
    if (mesh.userData.moonPivot) mesh.userData.moonPivot.rotation.y += delta * mesh.userData.moonPivot.userData.speed;
  });
  if (selectedPlanet && !activeFlyby) {
    const wp = new THREE.Vector3();
    selectedPlanet.getWorldPosition(wp);
    controls.target.lerp(wp, 0.045);
    scanHalo.visible = true;
    scanHalo.position.copy(wp);
    const scale = selectedPlanet.userData.baseRadius * 1.35;
    scanHalo.scale.setScalar(scale);
  } else if (!selectedPlanet) {
    scanHalo.visible = false;
  }
  scanHalo.children.forEach((ring) => {
    ring.rotation.z += delta * ring.userData.spin;
    ring.material.opacity = 0.25 + Math.sin(elapsed * 2.4 + ring.userData.spin * 5) * 0.16;
  });
  updateFlyby();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

setTimeout(() => loading.classList.add('hidden'), 700);
animate();
