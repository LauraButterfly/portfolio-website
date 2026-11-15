import * as THREE from 'three';
import { palette } from '../palette.js';
import { roundedBox, sphere, cylinder, capsule, part, group } from '../shapes.js';

/**
 * Post office → contact.
 *
 * To use your own model instead, replace the body of this function with:
 *
 *   return loadModel('/models/post-office.glb');
 */
export async function createPostOffice({ clay /*, loadModel */ }) {
  const body = clay(palette.sky);
  const roof = clay(palette.butter);
  const accent = clay(palette.coral);

  // Half cylinder lying on its side = barrel roof.
  const barrel = new THREE.CylinderGeometry(1.0, 1.0, 2.15, 40, 1, false, 0, Math.PI);

  const mailbox = group(
    part(cylinder(0.05, 0.05, 0.7, 10), clay(palette.wood), { position: [0, 0.35, 0] }),
    part(capsule(0.2, 0.3), accent, { position: [0, 0.78, 0], rotation: [Math.PI / 2, 0, 0] }),
    part(roundedBox(0.04, 0.25, 0.12, 0.02), clay(palette.butter), { position: [0.22, 0.9, -0.1] }),
  );
  mailbox.position.set(1.35, 0, 0.75);

  return group(
    part(roundedBox(2.0, 1.4, 1.7, 0.3), body, { position: [0, 0.7, 0] }),
    part(barrel, roof, { position: [0, 1.3, 0], rotation: [0, 0, Math.PI / 2], scale: [1, 1, 0.92] }),

    // Door and envelope sign
    part(roundedBox(0.55, 0.85, 0.12, 0.1), roof, { position: [-0.45, 0.43, 0.84] }),
    part(roundedBox(0.7, 0.46, 0.08, 0.06), clay(palette.cream), { position: [0.4, 0.95, 0.86] }),
    part(roundedBox(0.42, 0.06, 0.04, 0.02), accent, { position: [0.29, 1.04, 0.91], rotation: [0, 0, -0.5] }),
    part(roundedBox(0.42, 0.06, 0.04, 0.02), accent, { position: [0.51, 1.04, 0.91], rotation: [0, 0, 0.5] }),
    part(sphere(0.07), clay(palette.pink), { position: [0.4, 0.93, 0.93] }),

    mailbox,
  );
}
