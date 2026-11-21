// Panel geometry for each layout, in fractions of the poster's width and height.
// Every layout has seven panels and one hero (the big close-up). Roles are
// assigned by index: 0 THE BOSS, 1 THE DRIVER, 2 THE FIXER, 3 THE MECHANIC,
// 4 THE RIDER, 5 THE CAPTAIN, 6 THE LOOKOUT.

export const ROLES = [
  'THE BOSS', 'THE DRIVER', 'THE FIXER', 'THE MECHANIC', 'THE RIDER', 'THE CAPTAIN', 'THE LOOKOUT',
];

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
];

export function panelRole(index) {
  return ROLES[index] ?? `PANEL ${index + 1}`;
}
