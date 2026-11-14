import { createArcade } from './arcade.js';
import { createArtStudio } from './artStudio.js';
import { createCottage } from './cottage.js';
import { createPostOffice } from './postOffice.js';

/**
 * Where each building stands on the island. `id` matches src/places.js.
 * rotationY turns the building's front towards the island centre/camera.
 */
const layout = [
  { id: 'arcade', create: createArcade, position: [-3.1, 0, -1.6], rotationY: 0.45 },
  { id: 'studio', create: createArtStudio, position: [2.9, 0, -2.0], rotationY: -0.4 },
  { id: 'cottage', create: createCottage, position: [-2.6, 0, 2.5], rotationY: 0.35 },
  { id: 'post-office', create: createPostOffice, position: [2.8, 0, 2.3], rotationY: -0.35 },
];

/** Builds all buildings in parallel. Returns Map<id, THREE.Object3D>. */
export async function createBuildings(ctx) {
  const objects = await Promise.all(layout.map((entry) => entry.create(ctx)));
  const buildings = new Map();
  layout.forEach((entry, i) => {
    const object = objects[i];
    object.name = entry.id;
    object.position.set(...entry.position);
    object.rotation.y = entry.rotationY;
    buildings.set(entry.id, object);
  });
  return buildings;
}
