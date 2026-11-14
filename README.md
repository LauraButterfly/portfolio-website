# portfolio-website

A gamified portfolio: a small, cozy clay-style 3D island built with **Vite + vanilla Three.js**.
All UI (menu, loading screen, overlays) is real HTML/CSS layered over the canvas, so it stays
accessible and readable by search engines. A plain static version (`/static.html`) lists the
same content without any 3D.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## How it works

1. **Main menu** (`index.html`): title, Play / Quit, a CSS/SVG placeholder character, and a
   top-right nav (Projects / About me / Contact) that opens overlays without loading 3D.
2. **Play** loads the Three.js code on demand, then shows a loading screen whose progress bar
   follows a `THREE.LoadingManager` (every texture and model goes through it).
3. **The world**: floating island, fixed angled camera with gentle orbit limits. Four clickable
   buildings (mouse + touch) highlight, lift and show a label on hover. The buttons along the
   bottom do the same for keyboard and screen-reader users.
4. **Overlays**: one native `<dialog>` (focus trap, Escape to close). Project grid → detail → Back.
5. **Quit** goes to `static.html`, which is generated at build time from the same content.

Rendering pauses while an overlay is open, the tab is hidden, or you're back in the menu.
Pixel ratio is capped at 2. `prefers-reduced-motion` turns off the bobbing, camera intro and UI animations.

## Project structure

```
index.html                 3D site shell (menu, loading screen, world HUD, overlay dialog)
static.html                Simple version; content injected at build time
vite.config.js             Fills {{site.*}} tokens + static page from content.js
wrangler.jsonc             Cloudflare Workers static-assets config
public/
  images/projects/         Project images (placeholders)
  textures/clay-grain.png  Subtle bump texture for the clay look
  models/                  Put your .glb files here
src/
  data/content.js          ← ALL text: projects, about, contact, site name
  content/render.js        HTML templates shared by overlays and static page
  content/staticPage.js    Builds the static page body
  places.js                The four buildings: id, label, which overlay they open
  main.js                  App flow: menu → loading → world, nav, pausing
  ui/overlay.js            Overlay dialog (grid, detail, about, contact)
  ui/screens.js            Fade between screens
  ui/motion.js             Reduced-motion preference
  styles/                  base.css (tokens, buttons), app.css, static.css
  world/
    index.js               Renderer, camera, controls, render loop, pause logic
    loaders.js             LoadingManager + GLTFLoader + DRACOLoader, loadModel()
    materials.js           Matte clay materials (roughness high, metalness 0)
    palette.js             Pastel colours
    lighting.js            Warm sun + soft shadows, hemisphere fill
    island.js              Island, trees, paths, clouds
    interaction.js         Hover highlight/lift, labels, click/tap picking
    buildings/
      index.js             Where each building stands (position, rotation)
      arcade.js            → game projects
      artStudio.js         → UI/UX projects
      cottage.js           → about me
      postOffice.js        → contact
```

## Editing content

Everything lives in [`src/data/content.js`](src/data/content.js). Add a project by adding an
entry to `projects` with `category: 'games'` or `'uiux'` and an image in `public/images/projects/`.
Both the overlays and the static page update automatically.

## Swapping in your own 3D models

Each building is its own module with one async function that returns a `THREE.Object3D`.
To replace a placeholder with a model (e.g. exported from Blender as `.glb`):

1. Put the file in `public/models/`, e.g. `public/models/arcade.glb`.
2. In `src/world/buildings/arcade.js`, replace the function body:

   ```js
   export async function createArcade({ loadModel }) {
     const model = await loadModel('/models/arcade.glb');
     // model.scale.setScalar(0.5); // adjust if needed
     return model;
   }
   ```

`loadModel` (in `src/world/loaders.js`) uses the shared `GLTFLoader` with Draco support,
turns on shadows, and is tracked by the loading screen automatically. Draco-compressed files
just work: the decoder ships with three.js and is bundled by Vite, and it is only downloaded
when a compressed model is actually loaded.

Model conventions: origin at the centre of the footprint on the ground, front facing +Z,
roughly 2–2.5 units wide. Position and rotation on the island are set in
`src/world/buildings/index.js`. Hover highlight, lift, labels and clicking work for any model.

For the clay look in Blender, use high roughness, no metallic, and soft pastel base colours.

## Deployment (Cloudflare Workers static assets)

`wrangler.jsonc` serves `./dist` with `not_found_handling: "single-page-application"`.
In the Cloudflare dashboard:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

Or locally: `npm run deploy` (requires `npx wrangler login` first).
