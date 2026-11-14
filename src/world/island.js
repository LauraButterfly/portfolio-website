import * as THREE from 'three';
import { palette } from './palette.js';
import { roundedBox, sphere, cylinder, part, group } from './shapes.js';

/**
 * Revolves a smooth 2D profile (x = radius, y = height) around the y axis.
 * Profiles are written top → bottom for readability; LatheGeometry needs them
 * bottom → top for the faces to point outwards, hence the reverse().
 */
function lathe(points, segments = 64) {
  const curve = new THREE.SplineCurve(points.map(([x, y]) => new THREE.Vector2(x, y)).reverse());
  return new THREE.LatheGeometry(curve.getPoints(40), segments);
}

function tree(clay, x, z, size = 1) {
  const t = group(
    part(cylinder(0.09, 0.12, 0.6, 12), clay(palette.wood), { position: [0, 0.3, 0] }),
    part(sphere(0.45), clay(palette.grassDark), { position: [0, 0.85, 0] }),
    part(sphere(0.32), clay(palette.mint), { position: [0.12, 1.2, 0.05] }),
  );
  t.position.set(x, 0, z);
  t.scale.setScalar(size);
  return t;
}

function bush(clay, x, z, size = 1) {
  const b = part(sphere(0.3), clay(palette.grassDark), { position: [x, 0.12 * size, z], scale: [size, size * 0.7, size] });
  return b;
}

function cloud(clay, x, y, z, size = 1) {
  const material = clay(palette.cloud);
  const c = group(
    part(sphere(0.6), material),
    part(sphere(0.45), material, { position: [0.65, -0.1, 0] }),
    part(sphere(0.42), material, { position: [-0.6, -0.12, 0.1] }),
    part(sphere(0.35), material, { position: [0.2, 0.35, 0.1] }),
  );
  c.traverse((o) => (o.castShadow = false));
  c.position.set(x, y, z);
  c.scale.set(size, size * 0.8, size);
  return c;
}

/**
 * The floating island: grassy top, earthy underside, paths, trees, rocks and
 * clouds. Returns { island, clouds } so clouds can drift independently.
 */
export function createIsland({ clay }) {
  // Grass cap with a soft rounded rim; profile goes from the centre outwards and down.
  const grass = part(
    lathe([
      [0, 0],
      [5.6, 0],
      [6.5, -0.08],
      [6.95, -0.35],
      [6.85, -0.62],
      [6.4, -0.75],
      [0, -0.75],
    ]),
    clay(palette.grass),
  );

  // Earthy underside tapering to a rounded point.
  const earth = part(
    lathe([
      [0, -0.6],
      [6.5, -0.6],
      [6.2, -1.3],
      [5.0, -2.2],
      [3.3, -3.2],
      [1.4, -4.2],
      [0.3, -4.7],
      [0, -4.75],
    ]),
    clay(palette.earth),
  );
  earth.castShadow = false;

  const stone = clay(palette.stone);
  const plaza = part(cylinder(1.25, 1.3, 0.08, 40), stone, { position: [0, 0.02, 0] });

  // Stepping-stone paths from the plaza towards each building.
  const paths = new THREE.Group();
  for (const angle of [-2.66, -0.6, 2.38, 0.69]) {
    for (let i = 0; i < 2; i++) {
      const r = 1.6 + i * 0.5;
      paths.add(
        part(cylinder(0.2, 0.22, 0.06, 20), stone, {
          position: [Math.cos(angle) * r, 0.02, Math.sin(angle) * r],
          scale: [1, 1, 0.8],
        }),
      );
    }
  }

  // A little well in the middle of the plaza.
  const well = group(
    part(cylinder(0.45, 0.5, 0.4, 28), clay(palette.stoneDark), { position: [0, 0.22, 0] }),
    part(cylinder(0.36, 0.36, 0.06, 28), clay(palette.skyDeep), { position: [0, 0.4, 0] }),
    part(cylinder(0.04, 0.04, 0.8, 8), clay(palette.wood), { position: [-0.38, 0.75, 0] }),
    part(cylinder(0.04, 0.04, 0.8, 8), clay(palette.wood), { position: [0.38, 0.75, 0] }),
    part(roundedBox(1.0, 0.12, 0.5, 0.05), clay(palette.coral), { position: [0, 1.18, 0] }),
  );

  const decorations = group(
    tree(clay, -5.2, -1.0, 1.1),
    tree(clay, -0.8, -4.6, 1.2),
    tree(clay, 0.9, -5.1, 0.9),
    tree(clay, 5.3, 0.3, 1.0),
    tree(clay, -5.0, 1.0, 0.8),
    tree(clay, 0.2, 5.0, 0.85),
    bush(clay, -1.3, 4.6, 1.1),
    bush(clay, 1.6, 4.9, 0.9),
    bush(clay, 4.6, -3.6, 1),
    bush(clay, -4.1, -3.7, 1.2),
    bush(clay, 5.6, 2.4, 0.8),
    part(sphere(0.35, 16), stone, { position: [-5.6, 0.1, 2.6], scale: [1, 0.6, 0.8] }),
    part(sphere(0.25, 16), stone, { position: [5.1, 0.08, -2.4], scale: [1, 0.6, 1] }),
    part(sphere(0.08, 12), clay(palette.pink), { position: [-1.6, 0.08, 1.6] }),
    part(sphere(0.08, 12), clay(palette.butter), { position: [1.7, 0.08, 1.4] }),
    part(sphere(0.08, 12), clay(palette.lavender), { position: [1.5, 0.08, -1.7] }),
    part(sphere(0.08, 12), clay(palette.pink), { position: [-1.4, 0.08, -1.5] }),
  );

  // Small rocks floating under the island.
  const floaters = group(
    part(sphere(0.5, 16), clay(palette.earthDark), { position: [-5.4, -2.6, 1.5], scale: [1, 0.8, 0.9] }),
    part(sphere(0.32, 16), clay(palette.earth), { position: [4.8, -3.2, -1.2] }),
    part(sphere(0.22, 16), clay(palette.earthDark), { position: [3.6, -4.4, 2.0] }),
  );

  const island = group(grass, earth, plaza, paths, well, decorations, floaters);

  const clouds = group(
    cloud(clay, -8.5, 3.5, -4, 1.2),
    cloud(clay, 9, 2.5, -2, 1),
    cloud(clay, 6, 5, -8, 1.4),
    cloud(clay, -7, -2.5, 3, 0.9),
    cloud(clay, 8, -3, 4, 1.1),
  );

  return { island, clouds };
}
