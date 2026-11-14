import * as THREE from 'three';
import { palette } from '../palette.js';
import { roundedBox, sphere, cylinder, part, group } from '../shapes.js';

/**
 * Cottage → about me.
 *
 * To use your own model instead, replace the body of this function with:
 *
 *   return loadModel('/models/cottage.glb');
 */
export async function createCottage({ clay /*, loadModel */ }) {
  const walls = clay(palette.cream);
  const roof = clay(palette.coral);
  const glass = clay(palette.sky);
  const wood = clay(palette.wood);

  return group(
    // Round walls with a big soft cone roof
    part(cylinder(1.0, 1.08, 1.25, 40), walls, { position: [0, 0.62, 0] }),
    part(new THREE.ConeGeometry(1.45, 1.25, 40), roof, { position: [0, 1.82, 0] }),
    part(new THREE.TorusGeometry(1.3, 0.14, 12, 40), roof, { position: [0, 1.22, 0], rotation: [Math.PI / 2, 0, 0] }),
    part(sphere(0.16), clay(palette.butter), { position: [0, 2.45, 0] }),

    // Chimney
    part(cylinder(0.14, 0.16, 0.6, 16), clay(palette.stoneDark), { position: [0.6, 2.05, -0.3] }),

    // Door, round windows, flower box
    part(roundedBox(0.48, 0.8, 0.2, 0.1), wood, { position: [0, 0.4, 0.98] }),
    part(sphere(0.09), clay(palette.butter), { position: [0.14, 0.42, 1.09] }),
    part(sphere(0.2), glass, { position: [-0.62, 0.78, 0.76], scale: [1, 1, 0.35], rotation: [0, -0.7, 0] }),
    part(sphere(0.2), glass, { position: [0.62, 0.78, 0.76], scale: [1, 1, 0.35], rotation: [0, 0.7, 0] }),
    part(sphere(0.1), clay(palette.pink), { position: [-0.95, 0.12, 0.65] }),
    part(sphere(0.08), clay(palette.butter), { position: [-0.8, 0.1, 0.85] }),
  );
}
