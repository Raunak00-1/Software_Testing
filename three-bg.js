/**
 * three-bg.js — Midnight Sapphire & Deep Navy 3D Interactive Background
 * Executive Academic Edition:
 * - Floating smoked sapphire geometric shapes with glowing ice-cyan & cobalt wireframes
 * - 350+ starlight particles (sapphire, ice blue, emerald-teal, platinum)
 * - Dynamic mouse parallax with camera tilt tracking
 * - Smooth 60fps render loop with physics-based floating
 */

(function () {
  'use strict';

  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Professional Sapphire & Navy Lighting
  const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
  scene.add(ambientLight);

  const lightSapphire = new THREE.PointLight(0x3b82f6, 4.2, 35);
  lightSapphire.position.set(5, 5, 4);
  scene.add(lightSapphire);

  const lightCyan = new THREE.PointLight(0x06b6d4, 3.5, 30);
  lightCyan.position.set(-6, -4, 4);
  scene.add(lightCyan);

  const lightPlatinum = new THREE.PointLight(0xe0e7ff, 2.0, 25);
  lightPlatinum.position.set(0, 7, -3);
  scene.add(lightPlatinum);

  // Group for all floating objects
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  // Smoked Sapphire Glass Material
  const sapphireGlass = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.15,
    transmission: 0.35,
    thickness: 1.5,
    transparent: true,
    opacity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  // Professional Wireframes (Sapphire, Ice Cyan, Teal, Platinum)
  const wireSapphire = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });

  const wireIceCyan = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.55
  });

  const wireTeal = new THREE.MeshBasicMaterial({
    color: 0x0d9488,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });

  const wirePlatinum = new THREE.MeshBasicMaterial({
    color: 0xc7d2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });

  // Central Hero: Smoked Sapphire Torus Knot with Ice-Cyan Core
  const knotGeo = new THREE.TorusKnotGeometry(1.3, 0.36, 128, 24);
  const centralKnot = new THREE.Mesh(knotGeo, sapphireGlass);
  const centralWire = new THREE.Mesh(knotGeo, wireSapphire);
  centralKnot.add(centralWire);
  centralKnot.position.set(0, 1.2, -1);
  centralKnot.scale.set(0.92, 0.92, 0.92);
  worldGroup.add(centralKnot);

  // Floating geometric shapes
  const floatingMeshes = [];

  const geometries = [
    { geo: new THREE.IcosahedronGeometry(0.85, 0), mat: wireIceCyan,   pos: [-4.2,  2.8, -2],   rotSpeed: [0.008, 0.012],  floatOffset: 0 },
    { geo: new THREE.OctahedronGeometry(0.75, 0),   mat: wireSapphire,  pos: [ 4.5,  2.2, -3],   rotSpeed: [-0.01, 0.007],  floatOffset: 1.5 },
    { geo: new THREE.DodecahedronGeometry(0.8, 0),  mat: wireTeal,      pos: [-4.0, -2.5, -2.5], rotSpeed: [0.006, -0.009], floatOffset: 3.0 },
    { geo: new THREE.TorusGeometry(0.9, 0.22, 16, 48), mat: wirePlatinum, pos: [ 4.2, -2.2, -2], rotSpeed: [0.012, 0.005], floatOffset: 4.5 },
    { geo: new THREE.TetrahedronGeometry(0.65, 0), mat: wireIceCyan,   pos: [ 1.8, -3.8, -4],   rotSpeed: [-0.009, 0.014], floatOffset: 2.1 },
    { geo: new THREE.IcosahedronGeometry(0.6, 1),   mat: wireSapphire,  pos: [-2.2,  4.0, -4],   rotSpeed: [0.007, -0.011], floatOffset: 5.2 }
  ];

  geometries.forEach(item => {
    const mesh = new THREE.Mesh(item.geo, item.mat);
    mesh.position.set(...item.pos);
    mesh.baseY = item.pos[1];
    mesh.rotSpeed = item.rotSpeed;
    mesh.floatOffset = item.floatOffset;
    worldGroup.add(mesh);
    floatingMeshes.push(mesh);
  });

  // Starlight Particle Constellation (350 sapphire & platinum particles)
  const particleCount = 350;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const starPalette = [
    new THREE.Color(0x3b82f6), // sapphire
    new THREE.Color(0x60a5fa), // bright blue
    new THREE.Color(0x38bdf8), // ice cyan
    new THREE.Color(0x818cf8), // soft indigo
    new THREE.Color(0xa5f3fc), // diamond cyan
    new THREE.Color(0xffffff)  // pure white star
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 24;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;

    const col = starPalette[Math.floor(Math.random() * starPalette.length)];
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Dynamic Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX = (e.clientX - windowHalfX) / windowHalfX;
    mouseY = (e.clientY - windowHalfY) / windowHalfY;
  }, { passive: true });

  // Window resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Smooth camera mouse parallax (lerp)
    targetX += (mouseX * 0.85 - targetX) * 0.05;
    targetY += (-mouseY * 0.65 - targetY) * 0.05;

    camera.position.x = targetX;
    camera.position.y = targetY;
    camera.lookAt(0, 0, 0);

    // Central Torus Knot rotation & gentle breathing
    centralKnot.rotation.x = time * 0.28 + targetY * 0.45;
    centralKnot.rotation.y = time * 0.38 + targetX * 0.45;
    centralKnot.position.y = 1.0 + Math.sin(time * 0.8) * 0.22;

    // Floating secondary shapes
    floatingMeshes.forEach(mesh => {
      mesh.rotation.x += mesh.rotSpeed[0];
      mesh.rotation.y += mesh.rotSpeed[1];
      mesh.position.y = mesh.baseY + Math.sin(time * 1.1 + mesh.floatOffset) * 0.32;
    });

    // Starlight particle constellation slow rotation
    particleSystem.rotation.y = time * 0.035;
    particleSystem.rotation.x = Math.sin(time * 0.025) * 0.09;

    renderer.render(scene, camera);
  }

  animate();
})();
