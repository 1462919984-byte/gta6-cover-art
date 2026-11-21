// Fixed scenes for screenshots: a query string selects the layout, grade, size,
// sample photos and captions so headless Chromium can export a real poster PNG
// without any interaction. window.__shotReady is set once the paint settles.

import { SIZES, findLayout, findGrade } from './state.js';

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
  for (const name of ['boulevard', 'pier']) {
    const img = await loadImage(`samples/${name}.jpg`);
    state.photos.push({ id: `sample-${name}`, url: `samples/${name}.jpg`, name, width: img.naturalWidth, height: img.naturalHeight, kind: 'sample', image: img });
  }
  await addDemoCast(state);
  state.panels.forEach((panel, i) => { panel.photo = Math.min(i, state.photos.length - 1); });

  state.captions.title = title;
  state.captions.subtitle = subtitle;
  if (query.get('tagline')) state.captions.tagline = query.get('tagline');

  render();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
