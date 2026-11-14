import { motion } from './motion.js';

const screens = {
  menu: document.getElementById('screen-menu'),
  loading: document.getElementById('screen-loading'),
  world: document.getElementById('screen-world'),
};

let current = 'menu';

function waitForFade(el) {
  const duration = parseFloat(getComputedStyle(el).transitionDuration) * 1000;
  if (motion.reduced || !duration) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      el.removeEventListener('transitionend', done);
      clearTimeout(timer);
      resolve();
    };
    // Fallback in case transitionend never fires (e.g. background tab).
    const timer = setTimeout(done, duration + 100);
    el.addEventListener('transitionend', done);
  });
}

/** Fades out the current screen, then fades in `name`. */
export async function showScreen(name) {
  if (name === current) return;
  const prev = screens[current];
  const next = screens[name];
  current = name;

  prev.classList.remove('is-visible');
  await waitForFade(prev);
  prev.hidden = true;

  next.hidden = false;
  next.getBoundingClientRect(); // force layout so the fade-in transition runs
  next.classList.add('is-visible');
  await waitForFade(next);
}
