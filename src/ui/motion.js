const query = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Live view of the user's reduced-motion preference. */
export const motion = {
  get reduced() {
    return query.matches;
  },
  onChange(callback) {
    query.addEventListener('change', () => callback(query.matches));
  },
};
