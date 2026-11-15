import { palette } from '../palette.js';
import { roundedBox, sphere, cylinder, part, group } from '../shapes.js';

/**
 * Arcade → game projects.
 *
 * Placeholder made of rounded primitives. Conventions every building follows:
 * origin at the centre of its footprint on the ground (y = 0), front facing +z,
 * about 2.4 units wide. Placement on the island happens in ./index.js.
 *
 * To use your own model instead, replace the body of this function with:
 *
 *   return loadModel('/models/arcade.glb');
 *
 * (put the file in /public/models/). Scale/rotate the returned object here if
 * it doesn't match the conventions above.
 */
export async function createArcade({ clay /*, loadModel */ }) {
  const body = clay(palette.lavender);
  const trim = clay(palette.pink);
  const dark = clay(palette.ink);
  const glow = clay(palette.mint, { emissive: palette.mint, emissiveIntensity: 0.35 });

  return group(
    // Main building
    part(roundedBox(2.2, 1.7, 1.8, 0.3), body, { position: [0, 0.85, 0] }),
    part(roundedBox(2.4, 0.3, 2.0, 0.14), trim, { position: [0, 1.78, 0] }),

    // Door and a big screen above it
    part(roundedBox(0.62, 0.9, 0.12, 0.08), trim, { position: [0, 0.45, 0.88] }),
    part(roundedBox(1.3, 0.55, 0.12, 0.1), dark, { position: [0, 1.25, 0.88] }),
    part(roundedBox(1.1, 0.38, 0.08, 0.08), glow, { position: [0, 1.25, 0.94] }),

    // Giant joystick on the roof
    part(cylinder(0.32, 0.4, 0.18), dark, { position: [0.45, 2.02, 0] }),
    part(cylinder(0.07, 0.07, 0.6, 16), dark, { position: [0.45, 2.35, 0], rotation: [0, 0, -0.25] }),
    part(sphere(0.22), clay(palette.coral), { position: [0.58, 2.7, 0] }),

    // Arcade buttons
    part(sphere(0.13), clay(palette.butter), { position: [-0.45, 2.0, 0.25], scale: [1, 0.6, 1] }),
    part(sphere(0.13), clay(palette.sky), { position: [-0.75, 2.0, -0.05], scale: [1, 0.6, 1] }),
  );
}
