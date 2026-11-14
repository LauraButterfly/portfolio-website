/**
 * The four buildings on the island and what they open. Shared by the 3D world
 * (labels, click targets) and the HTML "places" buttons, so the world is also
 * usable with a keyboard or screen reader.
 *
 * `view` is passed straight to overlay.open().
 */
export const places = [
  { id: 'arcade', name: 'Arcade', hint: 'Game projects', color: '#c9bdf2', view: { type: 'projects', category: 'games' } },
  { id: 'studio', name: 'Art studio', hint: 'UI/UX projects', color: '#ffc9b3', view: { type: 'projects', category: 'uiux' } },
  { id: 'cottage', name: 'Cottage', hint: 'About me', color: '#f4a7b9', view: { type: 'about' } },
  { id: 'post-office', name: 'Post office', hint: 'Contact', color: '#bfe0f7', view: { type: 'contact' } },
];

export const placesById = Object.fromEntries(places.map((p) => [p.id, p]));
