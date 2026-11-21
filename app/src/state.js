// The editor's single source of truth. Photos, panel crops, layout, grade,
// captions and export size all live here, kept apart from rendering so undo /
// redo and the live preview can read the same object without any network calls.
//
// The `faceAware` flag is a global editor preference: when true, the renderer
// re-anchors each panel's crop to the face-like region its photo's heuristic
// finds (see crop.js), while still honouring the user's zoom and flip.

import { LAYOUTS, panelRole } from './layouts.js';
import { GRADES } from './grades.js';

export const SIZES = [
  { id: '1080x1080', w: 1080, h: 1080, label: '1:1' },
  { id: '1080x1350', w: 1080, h: 1350, label: '4:5' },
  { id: '1920x1080', w: 1920, h: 1080, label: '16:9' },
];

const DEFAULT_CAPTIONS = {
  title: 'SUNDOWN RACKET',
  subtitle: 'Paid in Sunsets',
  tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
  review: 'THE HOTTEST RIDE OF THE YEAR',
  source: 'VICE VOLTAGE GAZETTE',
  edition: 'VOL. 1',
  seal: 'BEST CAST',
  release: 'COMING SOON',
  billing: 'A VICE VOLTAGE PICTURES PRODUCTION IN ASSOCIATION WITH NEON COAST ENTERTAINMENT',
};

// The fallback anchor: the upper third of a photo is where a face usually sits.
// Face-aware anchoring overrides this when it finds a stronger region.
export const FALLBACK_ANCHOR = { x: 0.5, y: 0.34 };

export function blankCrop() {
  return { zoom: 1.15, panX: FALLBACK_ANCHOR.x, panY: FALLBACK_ANCHOR.y, flip: false };
}

export function defaultPanels() {
  // Seven slots per layout; the hero gets a slightly tighter close-up.
  return Array.from({ length: 7 }, (_, i) => ({
    photo: i,
    crop: { ...blankCrop(), zoom: i === 0 ? 1.22 : 1.1 },
  }));
}

export function defaultState() {
  return {
    photos: [], // { id, url, name, width, height, kind, image? }
    panels: defaultPanels(),
    layoutId: 'castMosaic',
    gradeId: 'sunsetGold',
    sizeId: '1080x1080',
    captions: { ...DEFAULT_CAPTIONS },
    selectedPanel: 0,
    faceAware: true,
  };
}

export function findLayout(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

export function findGrade(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

export function findSize(id) {
  return SIZES.find((s) => s.id === id) ?? SIZES[0];
}

export function roleOf(state, panelIndex) {
  return panelRole(panelIndex);
}
