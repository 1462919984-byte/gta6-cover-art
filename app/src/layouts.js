// Panel geometry for each cover layout. Coordinates and sizes are fractions of
// the poster width and height so a layout scales cleanly to 1:1, 4:5 and 16:9.
// Every layout exposes seven panel slots (one hero plus six supporting panels),
// which keeps the photo strip, the per-panel editor and drag-to-swap badges in
// lock-step across layouts. Roles are assigned by slot index.

export const ROLES = [
  'THE BOSS',
  'THE DRIVER',
  'THE FIXER',
  'THE MECHANIC',
  'THE RIDER',
  'THE CAPTAIN',
  'THE LOOKOUT',
];

// A layout may carry an optional `titleBlock` ({cx, cy, maxW, maxH}), `seal`
// ({cx, cy}) and `tagline` ({y}) to nudge the lettering away from the centre.
// When those are absent the renderer falls back to the centred defaults, so the
// older layouts keep their look while new compositions can offset the title.
export const LAYOUTS = [
  {
    id: 'castMosaic',
    name: 'CAST MOSAIC',
    panels: [
      { x: 0.030, y: 0.075, w: 0.440, h: 0.840, hero: true },
      { x: 0.500, y: 0.075, w: 0.225, h: 0.262 },
      { x: 0.750, y: 0.075, w: 0.225, h: 0.262 },
      { x: 0.500, y: 0.367, w: 0.225, h: 0.262 },
      { x: 0.750, y: 0.367, w: 0.225, h: 0.262 },
      { x: 0.500, y: 0.659, w: 0.225, h: 0.262 },
      { x: 0.750, y: 0.659, w: 0.225, h: 0.262 },
    ],
  },
  {
    id: 'diagonalStrips',
    name: 'DIAGONAL STRIPS',
    tilt: -0.05,
    panels: [
      { x: 0.005, y: 0.050, w: 0.132, h: 0.900 },
      { x: 0.150, y: 0.050, w: 0.132, h: 0.900 },
      { x: 0.295, y: 0.050, w: 0.132, h: 0.900 },
      { x: 0.440, y: 0.045, w: 0.185, h: 0.920, hero: true },
      { x: 0.640, y: 0.050, w: 0.132, h: 0.900 },
      { x: 0.785, y: 0.050, w: 0.132, h: 0.900 },
      { x: 0.930, y: 0.050, w: 0.132, h: 0.900 },
    ],
  },
  {
    id: 'sixGrid',
    name: 'SIX GRID',
    panels: [
      { x: 0.030, y: 0.075, w: 0.300, h: 0.400 },
      { x: 0.350, y: 0.075, w: 0.300, h: 0.400 },
      { x: 0.670, y: 0.075, w: 0.300, h: 0.400 },
      { x: 0.030, y: 0.545, w: 0.300, h: 0.400 },
      { x: 0.350, y: 0.545, w: 0.300, h: 0.400 },
      { x: 0.670, y: 0.545, w: 0.300, h: 0.400 },
      { x: 0.335, y: 0.195, w: 0.330, h: 0.610, hero: true },
    ],
  },
  {
    id: 'heroRow',
    name: 'HERO + ROW',
    panels: [
      { x: 0.030, y: 0.070, w: 0.440, h: 0.600, hero: true },
      { x: 0.500, y: 0.070, w: 0.240, h: 0.275 },
      { x: 0.760, y: 0.070, w: 0.240, h: 0.275 },
      { x: 0.500, y: 0.380, w: 0.240, h: 0.275 },
      { x: 0.760, y: 0.380, w: 0.240, h: 0.275 },
      { x: 0.030, y: 0.715, w: 0.300, h: 0.225 },
      { x: 0.355, y: 0.715, w: 0.645, h: 0.225 },
    ],
  },
  {
    id: 'triptych',
    name: 'TRIPTYCH',
    panels: [
      { x: 0.020, y: 0.070, w: 0.270, h: 0.275 },
      { x: 0.320, y: 0.055, w: 0.360, h: 0.890, hero: true },
      { x: 0.710, y: 0.070, w: 0.270, h: 0.275 },
      { x: 0.020, y: 0.382, w: 0.270, h: 0.275 },
      { x: 0.710, y: 0.382, w: 0.270, h: 0.275 },
      { x: 0.020, y: 0.694, w: 0.270, h: 0.275 },
      { x: 0.710, y: 0.694, w: 0.270, h: 0.275 },
    ],
  },
  {
    id: 'duo',
    name: 'DUO',
    panels: [
      { x: 0.030, y: 0.075, w: 0.460, h: 0.600, hero: true },
      { x: 0.510, y: 0.075, w: 0.460, h: 0.600 },
      { x: 0.030, y: 0.720, w: 0.185, h: 0.225 },
      { x: 0.235, y: 0.720, w: 0.185, h: 0.225 },
      { x: 0.440, y: 0.720, w: 0.185, h: 0.225 },
      { x: 0.645, y: 0.720, w: 0.185, h: 0.225 },
      { x: 0.850, y: 0.720, w: 0.120, h: 0.225 },
    ],
  },
  {
    // A diagonal split: one big hero close-up in the top-left, a descending
    // diagonal band of four supporting panels on the right, a bottom row on the
    // left, and the title block pushed off-centre up over the hero. This is a
    // genuinely different composition from the centred mosaics and grids above.
    id: 'diagonalSplit',
    name: 'DIAGONAL SPLIT',
    titleBlock: { cx: 0.32, cy: 0.24, maxW: 0.60, maxH: 0.16 },
    seal: { cx: 0.86, cy: 0.80 },
    tagline: { y: 0.70 },
    panels: [
      { x: 0.030, y: 0.060, w: 0.480, h: 0.600, hero: true },
      { x: 0.560, y: 0.060, w: 0.190, h: 0.240 },
      { x: 0.770, y: 0.180, w: 0.190, h: 0.240 },
      { x: 0.560, y: 0.320, w: 0.190, h: 0.240 },
      { x: 0.770, y: 0.440, w: 0.190, h: 0.240 },
      { x: 0.030, y: 0.700, w: 0.220, h: 0.220 },
      { x: 0.280, y: 0.700, w: 0.220, h: 0.220 },
    ],
  },
];

export function panelRole(index) {
  return ROLES[index] ?? `PANEL ${index + 1}`;
}
