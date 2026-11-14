/**
 * Pure string templates shared by the in-world overlays (browser) and the
 * static page build (Node). They take data as arguments and never touch the
 * DOM, so they run in both environments.
 */

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const esc = escapeHtml;

export function renderTags(tags = []) {
  if (!tags.length) return '';
  return `<ul class="tags" aria-label="Tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
}

export function renderLinks(links = []) {
  if (!links.length) return '';
  return `<p class="links">${links
    .map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`)
    .join('')}</p>`;
}

/** Image + text of one project. Used for the overlay detail view and the static page. */
export function renderProjectBody(project, headingLevel = 2) {
  const h = `h${headingLevel}`;
  return `
    <img class="project-image" src="${esc(project.image)}" alt="${esc(project.imageAlt)}" width="800" height="500" loading="lazy" decoding="async">
    <div class="project-text">
      <${h} class="project-title">${esc(project.title)}</${h}>
      <p class="project-meta">${esc(project.year)}</p>
      ${project.description.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${renderTags(project.tags)}
      ${renderLinks(project.links)}
    </div>`;
}

export function renderAbout(about, headingLevel = 2) {
  const h = `h${headingLevel}`;
  return `
    <${h}>${esc(about.title)}</${h}>
    ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
    ${renderTags(about.skills)}`;
}

export function renderContact(contact, headingLevel = 2) {
  const h = `h${headingLevel}`;
  return `
    <${h}>${esc(contact.title)}</${h}>
    <p>${esc(contact.intro)}</p>
    <p><a class="email" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
    ${renderLinks(contact.links)}`;
}
