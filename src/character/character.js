import headSvg from './head.svg?raw';

const EYE_CENTER_Y = 146; // in head.svg units; both eyes share it
const PUPIL_RANGE = { x: 4.5, y: 6 }; // max pupil offset inside the eye (svg units)
const FULL_LOOK_DISTANCE = 260; // px from the eye at which pupils reach the edge
const TILT = { x: 3, y: 2, deg: 2 }; // head parallax: px and degrees at most
const EASE = 9; // higher = snappier
const TOUCH_FOLLOW_MS = 2500; // after a touch, follow it this long before wandering

let instances = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const noHover = window.matchMedia('(hover: none)');

const approach = (current, target, dt) => current + (target - current) * (1 - Math.exp(-EASE * dt));
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Places the chibi head inside `container` and brings it to life: pupils
 * follow the pointer, slight head parallax, occasional blinks, idle
 * look-around on touch devices. Honours prefers-reduced-motion and only
 * animates while the head is visible on screen.
 *
 *   const character = createCharacter(document.querySelector('.menu-character'));
 *   character.destroy(); // when no longer needed
 */
export function createCharacter(container) {
  // Unique ids so the head can appear more than once on a page.
  const prefix = `character${++instances}-`;
  container.innerHTML = headSvg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/id="([^"]+)"/g, `id="${prefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`);

  const svg = container.querySelector('svg');
  const part = (name) => svg.querySelector(`#${prefix}${name}`);
  const head = part('head');
  const blinkGroups = [part('eyes'), part('pupils'), part('lashes')];
  const pupils = [part('pupil-left'), part('pupil-right')];
  const eyeShapes = [...part('eyes').children];

  // ---------- Input ----------
  let pointer = null; // { x, y } in viewport px, or null = look straight ahead
  let lastTouch = -Infinity;

  const onPointer = (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    if (event.pointerType === 'touch') lastTouch = performance.now();
  };
  // Pointer left the window (pointerout with no new target) or the window lost focus.
  // Lifting a finger also fires that pointerout, so touches keep their last point.
  const onLeave = (event) => {
    if (!event.relatedTarget && event.pointerType !== 'touch') pointer = null;
  };
  const onBlur = () => (pointer = null);
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });
  document.addEventListener('pointerout', onLeave);
  window.addEventListener('blur', onBlur);

  // ---------- State ----------
  const look = pupils.map(() => ({ x: 0, y: 0 }));
  const tilt = { x: 0, y: 0 };
  let nextBlink = 0;
  let blinkStart = -1;
  let blinkTwice = false;
  let wander = { x: 0, y: 0, until: 0 };

  function scheduleBlink(now) {
    nextBlink = now + 2500 + Math.random() * 3500;
  }

  function blinkScale(now) {
    if (blinkStart < 0 && now >= nextBlink) {
      blinkStart = now;
      blinkTwice = Math.random() < 0.2;
    }
    if (blinkStart < 0) return 1;
    const duration = blinkTwice ? 380 : 170;
    const t = (now - blinkStart) / duration;
    if (t >= 1) {
      blinkStart = -1;
      scheduleBlink(now);
      return 1;
    }
    // One or two quick closes; never fully flat so the shapes stay valid.
    const phase = blinkTwice ? (t * 2) % 1 : t;
    return 1 - Math.sin(phase * Math.PI) * 0.92;
  }

  /** Where the eyes should look, as a viewport point, or null for straight ahead. */
  function lookTarget(now) {
    const wandering = noHover.matches && now - lastTouch > TOUCH_FOLLOW_MS;
    if (!wandering) return pointer;

    // Touch device and no recent touch: glance around on our own.
    if (now > wander.until) {
      const rect = svg.getBoundingClientRect();
      const resting = Math.random() < 0.35;
      wander = {
        x: rect.left + rect.width / 2 + (resting ? 0 : (Math.random() - 0.5) * 600),
        y: rect.top + rect.height / 2 + (resting ? 0 : (Math.random() - 0.5) * 400),
        until: now + 1200 + Math.random() * 2200,
      };
    }
    return wander;
  }

  function apply(blink) {
    pupils.forEach((pupil, i) => pupil.setAttribute('transform', `translate(${look[i].x.toFixed(2)} ${look[i].y.toFixed(2)})`));
    const cx = 120;
    const cy = 140;
    head.setAttribute(
      'transform',
      `translate(${(tilt.x * TILT.x).toFixed(2)} ${(tilt.y * TILT.y).toFixed(2)}) rotate(${(tilt.x * TILT.deg).toFixed(2)} ${cx} ${cy})`,
    );
    const blinkTransform = blink === 1 ? '' : `translate(0 ${EYE_CENTER_Y}) scale(1 ${blink.toFixed(3)}) translate(0 ${-EYE_CENTER_Y})`;
    blinkGroups.forEach((g) => g.setAttribute('transform', blinkTransform));
  }

  // ---------- Loop ----------
  let frameId = 0;
  let last = 0;

  function frame(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    const target = lookTarget(now);

    eyeShapes.forEach((eye, i) => {
      let tx = 0;
      let ty = 0;
      if (target) {
        const r = eye.getBoundingClientRect();
        const dx = target.x - (r.left + r.width / 2);
        const dy = target.y - (r.top + r.height / 2);
        const distance = Math.hypot(dx, dy);
        if (distance > 0.5) {
          // Elliptical clamp: strength ≤ 1 keeps the pupil inside its eye.
          const strength = Math.min(1, distance / FULL_LOOK_DISTANCE);
          tx = (dx / distance) * strength * PUPIL_RANGE.x;
          ty = (dy / distance) * strength * PUPIL_RANGE.y;
        }
      }
      look[i].x = approach(look[i].x, tx, dt);
      look[i].y = approach(look[i].y, ty, dt);
    });

    let tiltX = 0;
    let tiltY = 0;
    if (target) {
      const r = svg.getBoundingClientRect();
      tiltX = clamp((target.x - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
      tiltY = clamp((target.y - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1);
    }
    tilt.x = approach(tilt.x, tiltX, dt * 0.6);
    tilt.y = approach(tilt.y, tiltY, dt * 0.6);

    apply(blinkScale(now));
    frameId = requestAnimationFrame(frame);
  }

  // ---------- Start / stop ----------
  let onScreen = false;

  function update() {
    const shouldRun = onScreen && !document.hidden && !reducedMotion.matches;
    if (shouldRun && !frameId) {
      last = 0;
      scheduleBlink(performance.now());
      frameId = requestAnimationFrame(frame);
    } else if (!shouldRun && frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
    if (reducedMotion.matches) {
      // Neutral pose: eyes centred, no tilt.
      look.forEach((l) => (l.x = l.y = 0));
      tilt.x = tilt.y = 0;
      apply(1);
    }
  }

  // Hidden screens are display:none, so this also stops the loop when the menu isn't shown.
  const observer = new IntersectionObserver((entries) => {
    onScreen = entries.some((e) => e.isIntersecting);
    update();
  });
  observer.observe(svg);
  document.addEventListener('visibilitychange', update);
  reducedMotion.addEventListener('change', update);

  return {
    element: svg,
    destroy() {
      cancelAnimationFrame(frameId);
      frameId = 0;
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      reducedMotion.removeEventListener('change', update);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('pointerout', onLeave);
      window.removeEventListener('blur', onBlur);
      container.innerHTML = '';
    },
  };
}
