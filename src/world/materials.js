import * as THREE from 'three';

/**
 * Matte "clay" materials: high roughness, no metalness and a subtle grain
 * bump texture so surfaces look hand-made rather than plastic.
 *
 * Returns `clay(color, options)`, which caches one material per colour.
 */
export function createClayKit(grainTexture) {
  grainTexture.wrapS = grainTexture.wrapT = THREE.RepeatWrapping;
  grainTexture.repeat.set(2, 2);
  grainTexture.colorSpace = THREE.NoColorSpace;

  const cache = new Map();

  return function clay(color, { emissive, emissiveIntensity = 0 } = {}) {
    const key = `${color}|${emissive}|${emissiveIntensity}`;
    if (!cache.has(key)) {
      cache.set(
        key,
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.92,
          metalness: 0,
          bumpMap: grainTexture,
          bumpScale: 1.2,
          emissive: emissive ?? 0x000000,
          emissiveIntensity,
        }),
      );
    }
    return cache.get(key);
  };
}
