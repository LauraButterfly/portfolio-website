import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderStaticPage } from './src/content/staticPage.js';
import { escapeHtml } from './src/content/render.js';

const contentFile = resolve(import.meta.dirname, 'src/data/content.js');

/**
 * Fills HTML pages from src/data/content.js at build time:
 * - {{site.title}}, {{site.tagline}}, ... tokens in any page
 * - the <!--static-content--> marker in static.html (the "Quit" page)
 * so names, descriptions and the static page are real, crawlable HTML.
 */
function staticContentPlugin() {
  return {
    name: 'static-content',
    async transformIndexHtml(html) {
      // Cache-busting query so edits to content.js show up without restarting the dev server.
      const content = await import(`${pathToFileURL(contentFile).href}?t=${Date.now()}`);
      return html
        .replace(/\{\{site\.(\w+)\}\}/g, (_, key) => escapeHtml(content.site[key] ?? ''))
        .replace('<!--static-content-->', () => renderStaticPage(content));
    },
    handleHotUpdate({ file, server }) {
      if (resolve(file) === contentFile) server.ws.send({ type: 'full-reload' });
    },
  };
}

export default defineConfig({
  plugins: [staticContentPlugin()],
  build: {
    // The world chunk is mostly three.js (~170 kB gzipped); it only loads after "Play".
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        static: resolve(import.meta.dirname, 'static.html'),
      },
    },
  },
});
