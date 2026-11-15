import './styles/app.css';
import { places, placesById } from './places.js';
import { createOverlay } from './ui/overlay.js';
import { showScreen } from './ui/screens.js';
import { motion } from './ui/motion.js';

const $ = (id) => document.getElementById(id);

/** The 3D world, created the first time the user presses Play. */
let world = null;
let worldLoading = null;

const overlay = createOverlay($('overlay'), {
  onOpen: () => world?.setPaused('overlay', true),
  onClose: () => world?.setPaused('overlay', false),
});

// ---------- Top-right nav: overlays work without the 3D world ----------
document.querySelectorAll('[data-open]').forEach((button) => {
  button.addEventListener('click', () => overlay.open({ type: button.dataset.open }));
});

// ---------- Places buttons (keyboard / screen reader access to the buildings) ----------
const placesList = $('places');
for (const place of places) {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-pill';
  button.innerHTML = `<span class="place-dot" aria-hidden="true"></span>`;
  button.append(`${place.name}`);
  button.setAttribute('aria-label', `${place.name}: ${place.hint}`);
  button.querySelector('.place-dot').style.setProperty('--dot', place.color);
  button.addEventListener('click', () => openPlace(place.id));
  // Highlight the matching building while the button is hovered or focused.
  for (const type of ['focus', 'pointerenter']) button.addEventListener(type, () => world?.setFocused(place.id));
  for (const type of ['blur', 'pointerleave']) button.addEventListener(type, () => world?.setFocused(null));
  li.append(button);
  placesList.append(li);
}

function openPlace(id) {
  overlay.open(placesById[id].view);
}

// ---------- Loading screen ----------
const progressEl = $('loading-progress');
const progressFill = progressEl.querySelector('.progress-fill');
const percentEl = $('loading-percent');

function setProgress(fraction) {
  const percent = Math.round(Math.min(Math.max(fraction, 0), 1) * 100);
  progressFill.style.transform = `scaleX(${percent / 100})`;
  progressEl.setAttribute('aria-valuenow', String(percent));
  percentEl.textContent = `${percent}%`;
}

function showLoadingError(message) {
  $('loading-error-text').textContent = message;
  $('loading-error').hidden = false;
  $('loading-retry').focus();
}

// Start downloading the Three.js code early, as soon as the user shows intent to play.
const loadWorldModule = () => (worldLoading ??= import('./world/index.js'));

async function play() {
  if (world) {
    await showScreen('world');
    world.setPaused('screen', false);
    $('world-title').focus();
    return;
  }

  $('loading-error').hidden = true;
  setProgress(0);
  await showScreen('loading');
  const startedAt = performance.now();

  try {
    const { createWorld, isWebGLAvailable } = await loadWorldModule();
    if (!isWebGLAvailable()) {
      showLoadingError('Your browser or device can’t display the 3D world. The simple version has everything too.');
      return;
    }
    world = await createWorld({
      container: $('world-canvas'),
      labelEl: $('building-label'),
      places,
      onProgress: setProgress,
      onSelect: (id) => {
        fadeHint();
        openPlace(id);
      },
      onInteract: fadeHint,
    });
  } catch (error) {
    console.error(error);
    worldLoading = null;
    showLoadingError('Something went wrong while loading the 3D world.');
    return;
  }

  setProgress(1);
  // Keep the loading screen up for a moment so it doesn't just flash.
  const minimum = motion.reduced ? 0 : 600;
  const elapsed = performance.now() - startedAt;
  if (elapsed < minimum) await new Promise((r) => setTimeout(r, minimum - elapsed));

  // Render while fading in so the island is visible during the transition.
  world.setPaused('screen', false);
  await showScreen('world');
  $('world-title').focus();
}

function fadeHint() {
  $('world-hint').classList.add('is-faded');
}

const playButton = $('play-button');
playButton.addEventListener('click', play);
playButton.addEventListener('pointerenter', loadWorldModule, { once: true });
playButton.addEventListener('focus', loadWorldModule, { once: true });
$('loading-retry').addEventListener('click', play);

$('menu-button').addEventListener('click', async () => {
  world?.setPaused('screen', true);
  await showScreen('menu');
  playButton.focus();
});

// ---------- Pause rendering when nobody can see it ----------
document.addEventListener('visibilitychange', () => world?.setPaused('hidden', document.hidden));

motion.onChange((reduced) => world?.setReducedMotion(reduced));
