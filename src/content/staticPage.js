import { escapeHtml as esc, renderProjectBody, renderAbout, renderContact } from './render.js';

/**
 * Builds the main content of static.html from content.js. Runs in Node at
 * build time (and in the dev server), so the static page is plain HTML that
 * works without JavaScript and is easy for search engines to read.
 */
export function renderStaticPage({ site, categories, projects, about, contact }) {
  const sections = Object.entries(categories)
    .map(([key, cat]) => {
      const items = projects.filter((p) => p.category === key);
      return `
      <section class="static-section" id="${esc(key)}" aria-labelledby="${esc(key)}-title">
        <h2 id="${esc(key)}-title">${esc(cat.title)}</h2>
        <p class="section-intro">${esc(cat.intro)}</p>
        <div class="static-projects">
          ${items.map((p) => `<article class="static-project" id="project-${esc(p.id)}">${renderProjectBody(p, 3)}</article>`).join('')}
        </div>
      </section>`;
    })
    .join('');

  return `
    <header class="static-header">
      <p class="static-kicker">${esc(site.role)}</p>
      <h1>${esc(site.name)} · ${esc(site.title)}</h1>
      <p>${esc(site.tagline)}</p>
      <nav aria-label="Sections">
        <ul>
          ${Object.entries(categories).map(([key, cat]) => `<li><a href="#${esc(key)}">${esc(cat.title)}</a></li>`).join('')}
          <li><a href="#about">${esc(about.title)}</a></li>
          <li><a href="#contact">${esc(contact.title)}</a></li>
        </ul>
      </nav>
    </header>
    <main id="main">
      ${sections}
      <section class="static-section" id="about">${renderAbout(about, 2)}</section>
      <section class="static-section" id="contact">${renderContact(contact, 2)}</section>
    </main>`;
}
