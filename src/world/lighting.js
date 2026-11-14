import * as THREE from 'three';

/** Warm key light with soft shadows + a pastel sky/ground fill. */
export function createLighting({ shadowMapSize = 2048 } = {}) {
  const lights = new THREE.Group();

  const hemi = new THREE.HemisphereLight('#fff3e6', '#c9bde6', 1.6);
  lights.add(hemi);

  const sun = new THREE.DirectionalLight('#ffe0bd', 2.4);
  sun.position.set(6, 12, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  sun.shadow.camera.left = -10;
  sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 40;
  sun.shadow.radius = 6; // blur for soft edges (PCFShadowMap)
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  lights.add(sun);

  return lights;
}
