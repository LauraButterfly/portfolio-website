import { about, categories, contact, projects } from '../data/content.js';
import { escapeHtml as esc, renderAbout, renderContact, renderProjectBody } from '../content/render.js';

function renderCard(project) {
  return `
    <li>
      <button type="button" class="project-card" data-project="${esc(project.id)}">
        <img src="${esc(project.image)}" alt="" width="800" height="500" loading="lazy" decoding="async">
        <span class="project-card-title">${esc(project.title)}</span>
        <span class="project-card-summary">${esc(project.summary)}</span>
      </button>
    </li>`;
}

function renderGrid(categoryKey, headingLevel) {
  const cat = categories[categoryKey];
  const h = `h${headingLevel}`;
  const items = projects.filter((p) => p.category === categoryKey);
  return `
    <${h}>${esc(cat.title)}</${h}>
    <p class="overlay-intro">${esc(cat.intro)}</p>
    <ul class="project-grid">${items.map(renderCard).join('')}</ul>`;
}

/**
 * Views:
 *   { type: 'projects', category: 'games' | 'uiux' }  one category
 *   { type: 'projects' }                               all categories
 *   { type: 'project', id }                            project detail
 *   { type: 'about' } | { type: 'contact' }
 */
function renderView(view) {
  switch (view.type) {
    case 'projects':
      if (view.category) return renderGrid(view.category, 2);
      return `<h2>Projects</h2>${Object.keys(categories)
        .map((key) => `<section class="overlay-section">${renderGrid(key, 3)}</section>`)
        .join('')}`;
    case 'project': {
      const project = projects.find((p) => p.id === view.id);
      return `<article class="project-detail">${renderProjectBody(project, 2)}</article>`;
    }
    case 'about':
      return renderAbout(about, 2);
    case 'contact':
      return renderContact(contact, 2);
    default:
      throw new Error(`Unknown overlay view: ${view.type}`);
  }
}

/**
 * One <dialog> that shows every overlay. Using a native modal dialog gives us
 * focus trapping, Escape-to-close and an inert background for free.
 */
export function createOverlay(dialog, { onOpen, onClose } = {}) {
  const body = dialog.querySelector('#overlay-body');
  const backButton = dialog.querySelector('#overlay-back');
  const closeButton = dialog.querySelector('#overlay-close');

  // Previous views, so "Back" returns from a project detail to its grid.
  let history = [];
  let currentView = null;
  let returnFocusTo = null;

  function show(view, { focusSelector } = {}) {
    currentView = view;
    body.innerHTML = renderView(view);
    body.querySelector('h2')?.setAttribute('id', 'overlay-title');
    backButton.hidden = history.length === 0;
    dialog.scrollTop = 0;

    const focusTarget = focusSelector && body.querySelector(focusSelector);
    if (focusTarget) focusTarget.focus();
    else if (!backButton.hidden) backButton.focus();
    else closeButton.focus();
  }

  function open(view) {
    history = [];
    if (!dialog.open) {
      returnFocusTo = document.activeElement;
      dialog.showModal();
      onOpen?.();
    }
    show(view);
  }

  function back() {
    const from = currentView;
    const previous = history.pop();
    if (!previous) return;
    // Put focus back on the card the user came from.
    show(previous, { focusSelector: from?.id ? `[data-project="${CSS.escape(from.id)}"]` : null });
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  body.addEventListener('click', (event) => {
    const card = event.target.closest('[data-project]');
    if (!card) return;
    history.push(currentView);
    show({ type: 'project', id: card.dataset.project });
  });

  backButton.addEventListener('click', back);
  closeButton.addEventListener('click', close);

  // Clicking the dimmed backdrop (the dialog element itself, outside the content) closes it.
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) close();
  });

  // Escape fires "cancel" and then "close"; every way of closing ends up here.
  dialog.addEventListener('close', () => {
    // "close" is dispatched as a separate task. If the overlay was reopened in
    // the meantime (e.g. a very quick click on a building), this event is stale.
    if (dialog.open) return;
    body.innerHTML = '';
    history = [];
    currentView = null;
    if (returnFocusTo?.isConnected && !returnFocusTo.closest('[hidden]')) returnFocusTo.focus();
    returnFocusTo = null;
    onClose?.();
  });

  return {
    open,
    close,
    get isOpen() {
      return dialog.open;
    },
  };
}
