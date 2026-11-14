import * as THREE from 'three';

const LIFT = 0.22; // how far a building rises on hover (world units)
const HIGHLIGHT = new THREE.Color('#ffdcb8').multiplyScalar(0.3); // warm glow added on hover
const TAP_MAX_MOVE = 8; // px – more than this is a drag (orbit), not a click
const TAP_MAX_TIME = 600; // ms

/**
 * Hover highlight, lift, floating label and click/tap selection for the
 * buildings. Works for placeholder primitives and loaded .glb models alike.
 */
export function createInteraction({ camera, canvas, container, buildings, places, labelEl, onSelect, onInteract }) {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const projected = new THREE.Vector3();
  const states = new Map();
  const placeById = Object.fromEntries(places.map((p) => [p.id, p]));
  const labelName = labelEl.querySelector('.building-label-name');
  const labelHint = labelEl.querySelector('.building-label-hint');

  for (const [id, object] of buildings) {
    // Give each building its own material copies so highlighting one doesn't
    // light up others that share the same clay colour.
    const clones = new Map();
    object.traverse((child) => {
      if (!child.isMesh) return;
      child.userData.buildingId = id;
      const swap = (m) => {
        if (!clones.has(m)) clones.set(m, m.clone());
        return clones.get(m);
      };
      child.material = Array.isArray(child.material) ? child.material.map(swap) : swap(child.material);
    });
    const materials = [...clones.values()]
      .filter((m) => m.emissive)
      .map((m) => ({ material: m, base: m.emissive.clone().multiplyScalar(m.emissiveIntensity) }));
    materials.forEach(({ material }) => (material.emissiveIntensity = 1));

    object.updateWorldMatrix(true, true);
    const height = new THREE.Box3().setFromObject(object).max.y - object.getWorldPosition(new THREE.Vector3()).y;

    states.set(id, {
      object,
      materials,
      baseY: object.position.y,
      anchor: new THREE.Vector3(0, height + 0.35, 0), // label position, local space
      t: 0, // 0 = idle, 1 = fully highlighted
    });
  }

  let hoveredId = null;
  let focusedId = null;
  let labelId = null;
  const pointers = new Map();

  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects([...buildings.values()], true)[0];
    return hit?.object.userData.buildingId ?? null;
  }

  function setHovered(id) {
    hoveredId = id;
    container.classList.toggle('is-hovering', id !== null);
  }

  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    setHovered(event.buttons ? null : pick(event));
  });
  canvas.addEventListener('pointerleave', () => setHovered(null));

  canvas.addEventListener('pointerdown', (event) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, time: performance.now() });
    onInteract?.();
  });
  canvas.addEventListener('pointercancel', (event) => pointers.delete(event.pointerId));
  canvas.addEventListener('pointerup', (event) => {
    const start = pointers.get(event.pointerId);
    const multiTouch = pointers.size > 1;
    pointers.delete(event.pointerId);
    if (!start || multiTouch) return;
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (moved > TAP_MAX_MOVE || performance.now() - start.time > TAP_MAX_TIME) return;
    const id = pick(event);
    if (id) onSelect?.(id);
  });

  function updateLabel(activeId) {
    if (activeId !== labelId) {
      labelId = activeId;
      labelEl.classList.toggle('is-visible', activeId !== null);
      if (activeId) {
        labelName.textContent = placeById[activeId].name;
        labelHint.textContent = placeById[activeId].hint;
      }
    }
    if (!activeId) return;
    const { object, anchor } = states.get(activeId);
    projected.copy(anchor);
    object.localToWorld(projected).project(camera);
    const x = (projected.x * 0.5 + 0.5) * container.clientWidth;
    const y = (-projected.y * 0.5 + 0.5) * container.clientHeight;
    labelEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  }

  /** Call once per frame. */
  function update(dt, reducedMotion) {
    const activeId = hoveredId ?? focusedId;
    for (const [id, state] of states) {
      const target = id === activeId ? 1 : 0;
      if (state.t === target) continue;
      state.t = reducedMotion ? target : THREE.MathUtils.damp(state.t, target, 14, dt);
      if (Math.abs(state.t - target) < 0.001) state.t = target;
      state.object.position.y = state.baseY + state.t * LIFT;
      for (const { material, base } of state.materials) material.emissive.copy(base).lerp(HIGHLIGHT, state.t);
    }
    updateLabel(activeId);
  }

  return {
    update,
    /** Highlight a building from outside the canvas (e.g. keyboard focus on its button). */
    setFocused(id) {
      focusedId = id;
    },
    clearHover() {
      setHovered(null);
      pointers.clear();
    },
  };
}
