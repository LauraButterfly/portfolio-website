import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Small helpers for building placeholder models out of rounded primitives. */

export const roundedBox = (width, height, depth, radius = 0.15, segments = 4) =>
  new RoundedBoxGeometry(width, height, depth, segments, radius);

export const sphere = (radius, detail = 24) => new THREE.SphereGeometry(radius, detail, Math.round(detail * 0.75));

export const cylinder = (radiusTop, radiusBottom, height, segments = 32) =>
  new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);

export const capsule = (radius, length) => new THREE.CapsuleGeometry(radius, length, 8, 16);

/**
 * Creates a mesh that casts and receives shadows.
 *   part(geometry, material, { position: [x, y, z], rotation: [x, y, z], scale: [x, y, z] })
 */
export function part(geometry, material, { position, rotation, scale } = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  if (position) mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  if (scale) mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** A group with the given children, so building modules read top to bottom. */
export function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}
