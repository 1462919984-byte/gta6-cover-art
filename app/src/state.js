// The editor's single source of truth: photos, panel crops, layout, grade,
// captions and export size. Kept separate from rendering so undo/redo and the
// live preview stay in sync without any network calls.

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

export function blankCrop() {
  // Face-aware default: the crop is anchored toward the upper third of the
  // photo (where a face usually sits) rather than the exact centre.
  return { zoom: 1.15, panX: 0.5, panY: 0.34, flip: false };
}

export function defaultPanels() {
  // Each layout has seven panels; the hero gets a slightly tighter close-up.
  return Array.from({ length: 7 }, (_, i) => ({
    photo: i,               // index into photos[]; falls back to 0 if missing
    crop: { ...blankCrop(), zoom: i === 0 ? 1.22 : 1.1 },
  }));
}

export function defaultState() {
  return {
    photos: [],             // { id, url, name, width, height, kind: 'upload'|'sample'|'vector' }
    panels: defaultPanels(),
    layoutId: 'castMosaic',
    gradeId: 'sunsetGold',
    sizeId: '1080x1080',
    captions: { ...DEFAULT_CAPTIONS },
    selectedPanel: 0,
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
