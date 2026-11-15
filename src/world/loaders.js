import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/**
 * All loaders share one LoadingManager, so everything they load is counted
 * by the progress bar on the loading screen.
 *
 * Draco: the decoder ships with three.js and Vite bundles it automatically
 * (self-hosted, no CDN). It is only downloaded when a Draco-compressed .glb
 * is actually loaded, so it costs nothing until you use it.
 */
export function createLoaders(manager) {
  const draco = new DRACOLoader(manager);
  const gltf = new GLTFLoader(manager).setDRACOLoader(draco);
  const texture = new THREE.TextureLoader(manager);

  /**
   * Loads a .glb/.gltf and prepares it for the scene (shadows on).
   * Usage inside a building module:
   *   const model = await loadModel('/models/arcade.glb');
   */
  async function loadModel(url) {
    const { scene } = await gltf.loadAsync(url);
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return scene;
  }

  return { manager, gltf, draco, texture, loadModel };
}
