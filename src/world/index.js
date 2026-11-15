import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { createLoaders } from './loaders.js';
import { createClayKit } from './materials.js';
import { createLighting } from './lighting.js';
import { createIsland } from './island.js';
import { createBuildings } from './buildings/index.js';
import { createInteraction } from './interaction.js';

const GRAIN_TEXTURE_URL = '/textures/clay-grain.png';
const CAMERA_TARGET = new THREE.Vector3(0, 0.6, 0);
const CAMERA_DIRECTION = new THREE.Vector3(0, 8.9, 15).normalize(); // slightly angled, looking down
const BASE_DISTANCE = 17.5;

export const isWebGLAvailable = () => WebGL.isWebGL2Available();

/**
 * Wider field of view and more distance on portrait screens, so all four
 * buildings stay in view on phones.
 */
function framingFor(aspect) {
  const portrait = THREE.MathUtils.clamp((1 - aspect) / 0.55, 0, 1);
  const fov = THREE.MathUtils.lerp(36, 50, portrait);
  const halfWidthNeeded = aspect < 1 ? 5.4 : 7.6;
  const fitDistance = halfWidthNeeded / (Math.tan(THREE.MathUtils.degToRad(fov / 2)) * aspect);
  return { fov, distance: Math.max(BASE_DISTANCE, fitDistance) };
}

/**
 * Creates the island scene. Resolves once every asset tracked by the
 * LoadingManager has loaded and shaders are compiled. Starts paused with the
 * reason "screen"; call setPaused('screen', false) to start rendering.
 */
export async function createWorld({ container, labelEl, places, onProgress, onSelect, onInteract }) {
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Loading (everything goes through one LoadingManager) ----------
  const manager = new THREE.LoadingManager();
  const allLoaded = new Promise((resolve) => (manager.onLoad = resolve));
  manager.onProgress = (_url, loaded, total) => onProgress?.(loaded / total);
  manager.onError = (url) => console.warn(`Could not load ${url}`);

  const loaders = createLoaders(manager);
  const clay = createClayKit(loaders.texture.load(GRAIN_TEXTURE_URL));
  const ctx = { clay, loadModel: loaders.loadModel, loaders };

  // ---------- Renderer, scene, camera ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // softened via light.shadow.radius
  renderer.toneMapping = THREE.NeutralToneMapping; // keeps pastels from washing out
  renderer.domElement.setAttribute('aria-hidden', 'true'); // the HTML "places" buttons are the accessible version
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
  camera.position.copy(CAMERA_DIRECTION).multiplyScalar(BASE_DISTANCE).add(CAMERA_TARGET);

  // Fixed, slightly angled view with gentle orbit limits and no panning.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(CAMERA_TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 0.6;
  controls.minPolarAngle = 0.8;
  controls.maxPolarAngle = 1.2;
  controls.minAzimuthAngle = -0.55;
  controls.maxAzimuthAngle = 0.55;

  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 600;
  scene.add(createLighting({ shadowMapSize: smallScreen ? 1024 : 2048 }));

  const { island, clouds } = createIsland(ctx);
  const root = new THREE.Group(); // island + buildings bob together
  root.add(island);
  scene.add(root, clouds);
  clouds.children.forEach((cloud) => (cloud.userData.baseX = cloud.position.x));

  const [buildings] = await Promise.all([createBuildings(ctx), allLoaded]);
  for (const building of buildings.values()) root.add(building);

  const interaction = createInteraction({
    camera,
    canvas: renderer.domElement,
    container,
    buildings,
    places,
    labelEl,
    onSelect,
    onInteract,
  });

  // ---------- Resize ----------
  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const { fov, distance } = framingFor(camera.aspect);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    controls.minDistance = distance * 0.75;
    controls.maxDistance = distance * 1.25;
    baseDistance = distance;
    if (!intro) setDistance(distance);
  }

  function setDistance(distance) {
    const offset = camera.position.clone().sub(CAMERA_TARGET).setLength(distance);
    camera.position.copy(CAMERA_TARGET).add(offset);
  }

  let baseDistance = BASE_DISTANCE;
  // Short dolly-in the first time the world is shown (skipped with reduced motion).
  let intro = reducedMotion ? null : { t: 0 };
  new ResizeObserver(resize).observe(container);

  // Compile shaders up front so the first frames don't stutter. compileAsync
  // only helps (and only stays quiet) where the parallel-compile extension exists.
  if (renderer.extensions.has('KHR_parallel_shader_compile')) await renderer.compileAsync(scene, camera);
  else renderer.compile(scene, camera);

  // ---------- Render loop (only runs while nothing pauses it) ----------
  const pauseReasons = new Set(['screen']);
  let running = false;
  let last = null;
  let elapsed = 0;

  function frame(time) {
    const dt = last === null ? 0 : Math.min((time - last) / 1000, 0.1);
    last = time;
    elapsed += dt;

    if (!reducedMotion) {
      root.position.y = Math.sin(elapsed * 0.8) * 0.08;
      clouds.children.forEach((cloud, i) => {
        cloud.position.x = cloud.userData.baseX + Math.sin(elapsed * 0.12 + i * 1.7) * 0.8;
      });
    }

    if (intro) {
      intro.t = Math.min(intro.t + dt / 1.6, 1);
      const eased = 1 - Math.pow(1 - intro.t, 3);
      setDistance(baseDistance * (1 + 0.4 * (1 - eased)));
      controls.enabled = intro.t >= 1;
      if (intro.t >= 1) intro = null;
    }

    controls.update();
    interaction.update(dt, reducedMotion);
    renderer.render(scene, camera);
  }

  function setPaused(reason, paused) {
    if (paused) pauseReasons.add(reason);
    else pauseReasons.delete(reason);

    const shouldRun = pauseReasons.size === 0;
    if (shouldRun === running) return;
    running = shouldRun;
    last = null;
    if (!running) interaction.clearHover();
    renderer.setAnimationLoop(running ? frame : null);
  }

  return {
    setPaused,
    setFocused: (id) => interaction.setFocused(id),
    setReducedMotion(value) {
      reducedMotion = value;
      if (value) {
        root.position.y = 0;
        if (intro) {
          intro = null;
          controls.enabled = true;
          setDistance(baseDistance);
        }
      }
    },
  };
}
