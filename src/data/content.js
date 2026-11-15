/**
 * All portfolio content lives here. Both the 3D site's overlays and the
 * static page (static.html) are generated from this file, so you only ever
 * edit text in one place.
 *
 * Keep this file free of imports: the static page build loads it directly
 * in Node (see vite.config.js).
 *
 * Images go in /public/images/... and are referenced by absolute path.
 */

export const site = {
  name: 'Your Name',
  title: 'Portfolio',
  role: 'UI/UX & Computer Science Student',
  tagline: 'I design and build playful, accessible digital experiences.',
};

/** Project categories. `building` is the id of the 3D building that opens it. */
export const categories = {
  games: {
    title: 'Game projects',
    intro: 'Small games, jams and interactive experiments.',
    building: 'arcade',
  },
  uiux: {
    title: 'UI/UX projects',
    intro: 'Research, interface design and prototypes.',
    building: 'studio',
  },
};

export const projects = [
  {
    id: 'clay-quest',
    category: 'games',
    title: 'Clay Quest',
    year: '2026',
    summary: 'A cozy puzzle platformer made in a 48-hour game jam.',
    description: [
      'Placeholder text: describe the idea, your role and the team here.',
      'What was the hardest problem and how did you solve it? What would you do differently next time?',
    ],
    tags: ['Unity', 'C#', 'Game jam'],
    image: '/images/projects/clay-quest.svg',
    imageAlt: 'Placeholder illustration for Clay Quest',
    links: [{ label: 'Play it', href: '#' }],
  },
  {
    id: 'pixel-garden',
    category: 'games',
    title: 'Pixel Garden',
    year: '2025',
    summary: 'A relaxing idle game about growing a tiny garden.',
    description: [
      'Placeholder text: explain the core loop and the mechanics.',
      'Mention tools, engine and anything you learned about game feel.',
    ],
    tags: ['Godot', 'GDScript'],
    image: '/images/projects/pixel-garden.svg',
    imageAlt: 'Placeholder illustration for Pixel Garden',
    links: [{ label: 'Source code', href: '#' }],
  },
  {
    id: 'orbit-hop',
    category: 'games',
    title: 'Orbit Hop',
    year: '2025',
    summary: 'A one-button browser game about jumping between planets.',
    description: ['Placeholder text: describe the project.'],
    tags: ['JavaScript', 'Canvas'],
    image: '/images/projects/orbit-hop.svg',
    imageAlt: 'Placeholder illustration for Orbit Hop',
    links: [],
  },
  {
    id: 'study-buddy',
    category: 'uiux',
    title: 'Study Buddy App',
    year: '2026',
    summary: 'Mobile app concept that helps students plan focused study sessions.',
    description: [
      'Placeholder text: problem statement, users and research methods.',
      'Show the process: personas, wireframes, usability tests and the final design.',
    ],
    tags: ['Figma', 'User research', 'Prototyping'],
    image: '/images/projects/study-buddy.svg',
    imageAlt: 'Placeholder illustration for Study Buddy App',
    links: [{ label: 'Case study', href: '#' }],
  },
  {
    id: 'museum-kiosk',
    category: 'uiux',
    title: 'Museum Kiosk Redesign',
    year: '2025',
    summary: 'Accessible touch interface for a local museum.',
    description: [
      'Placeholder text: describe constraints, accessibility goals and results.',
    ],
    tags: ['Accessibility', 'Interaction design'],
    image: '/images/projects/museum-kiosk.svg',
    imageAlt: 'Placeholder illustration for Museum Kiosk Redesign',
    links: [],
  },
  {
    id: 'design-system',
    category: 'uiux',
    title: 'Tiny Design System',
    year: '2025',
    summary: 'A small component library with tokens, docs and dark mode.',
    description: ['Placeholder text: describe the project.'],
    tags: ['Design systems', 'CSS'],
    image: '/images/projects/design-system.svg',
    imageAlt: 'Placeholder illustration for Tiny Design System',
    links: [],
  },
];

export const about = {
  title: 'About me',
  paragraphs: [
    'Placeholder text: Hi! I study computer science with a focus on UI/UX design.',
    'Write a few sentences about what you love making, what you are learning right now and what kind of work you are looking for.',
  ],
  skills: ['UI/UX design', 'Figma', 'JavaScript', 'Three.js', 'Game development', 'User research'],
};

export const contact = {
  title: 'Contact',
  intro: 'Placeholder text: I am always happy to chat about projects, internships or games.',
  email: 'hello@example.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  ],
};
