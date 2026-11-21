// Fixed scenes for screenshots. A query string picks the layout, grade, size,
// sample photos and captions so headless Chromium can export a real poster
// without any interaction, and window.__shotReady is set once the paint has
// settled. `photo` now accepts a comma-separated list so a single shot can pin
// a distinct photo to each panel, which the new layout/grade shots rely on.

import { findLayout, findGrade } from './state.js';

export async function runShot(query, state, render) {
  const shot = query.get('shot');
  const layout = query.get('layout') || 'castMosaic';
  const grade = query.get('grade') || 'sunsetGold';
  const size = query.get('size') || '1920x1080';
  const photo = query.get('photo') || 'boulevard';
  const title = query.get('title') || 'SUNDOWN RACKET';
  const subtitle = query.get('subtitle') || 'Paid in Sunsets';

  state.layoutId = layout;
  state.gradeId = grade;
  state.sizeId = size;

  if (shot === 'cover') document.body.classList.add('shot-cover');

  // Load both starter samples and the vector cast so panels are always filled.
  const { loadImage } = await import('./main.js');
  const { addDemoCast } = await import('./samples.js');
  const photoNames = photo.split(',').filter(Boolean);
  for (const name of photoNames) {
    const img = await loadImage(`samples/${name}.jpg`);
    state.photos.push({
      id: `sample-${name}`,
      url: `samples/${name}.jpg`,
      name,
      width: img.naturalWidth,
      height: img.naturalHeight,
      kind: 'sample',
      image: img,
    });
  }
  await addDemoCast(state);

  // Assign photos to panels: a comma list maps by index, otherwise the first
  // photo is used across the whole cast before falling back to the demo cast.
  state.panels.forEach((panel, i) => {
    if (i < photoNames.length) {
      panel.photo = i;
    } else {
      panel.photo = Math.min(i, state.photos.length - 1);
    }
  });

  state.captions.title = title;
  state.captions.subtitle = subtitle;
  if (query.get('tagline')) state.captions.tagline = query.get('tagline');

  render();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
