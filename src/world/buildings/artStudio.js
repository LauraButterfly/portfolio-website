import { palette } from '../palette.js';
import { roundedBox, sphere, cylinder, part, group } from '../shapes.js';

/**
 * Art studio → UI/UX projects.
 *
 * To use your own model instead, replace the body of this function with:
 *
 *   return loadModel('/models/art-studio.glb');
 */
export async function createArtStudio({ clay /*, loadModel */ }) {
  const body = clay(palette.peach);
  const roof = clay(palette.mint);
  const glass = clay(palette.sky);
  const wood = clay(palette.wood);

  const easel = group(
    part(cylinder(0.04, 0.04, 1.1, 8), wood, { position: [-0.18, 0.5, 0], rotation: [0, 0, -0.18] }),
    part(cylinder(0.04, 0.04, 1.1, 8), wood, { position: [0.18, 0.5, 0], rotation: [0, 0, 0.18] }),
    part(cylinder(0.04, 0.04, 1.0, 8), wood, { position: [0, 0.45, -0.2], rotation: [0.35, 0, 0] }),
    part(roundedBox(0.7, 0.55, 0.06, 0.03), clay(palette.cream), { position: [0, 0.78, 0.05], rotation: [-0.12, 0, 0] }),
    part(sphere(0.09), clay(palette.pink), { position: [-0.15, 0.85, 0.1], scale: [1, 1, 0.35] }),
    part(sphere(0.07), clay(palette.butter), { position: [0.12, 0.72, 0.09], scale: [1, 1, 0.35] }),
    part(sphere(0.08), clay(palette.skyDeep), { position: [0.05, 0.9, 0.1], scale: [1, 1, 0.35] }),
  );
  easel.position.set(1.45, 0, 0.65);
  easel.rotation.y = -0.5;

  return group(
    part(roundedBox(2.0, 1.5, 1.8, 0.3), body, { position: [0, 0.75, 0] }),

    // Slanted roof with a skylight
    part(roundedBox(2.3, 0.26, 2.1, 0.12), roof, { position: [0, 1.72, 0], rotation: [0, 0, 0.2] }),
    part(roundedBox(0.8, 0.08, 1.2, 0.04), glass, { position: [-0.35, 1.8, 0], rotation: [0, 0, 0.2] }),

    // Big studio window and door
    part(roundedBox(0.95, 0.75, 0.1, 0.08), glass, { position: [0.38, 0.92, 0.88] }),
    part(roundedBox(0.5, 0.85, 0.1, 0.08), wood, { position: [-0.55, 0.43, 0.88] }),

    // Paint pot by the door
    part(cylinder(0.16, 0.14, 0.24, 20), clay(palette.coral), { position: [-1.05, 0.12, 0.8] }),

    easel,
  );
}
