// Wires the editor together: keeps the state, re-renders the poster on every
// change, pushes undo snapshots, and handles the caption fields, export buttons
// and the ?shot= query used to produce screenshots.

import { renderPoster } from './render.js';
import { ensureFonts } from './lettering.js';
import { exportAllSizes } from './export.js';
import { defaultState } from './state.js';
import { runShot } from './shots.js';
import {
  buildPhotoStrip, buildChips, buildSizeSwitch, buildPanelEditor, buildPanelSwaps,
  wirePhotoInput, wireSamples,
} from './editor-ui.js';

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { img.name = url.split('/').pop(); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

const state = defaultState();
const canvas = document.getElementById('poster');
const status = document.getElementById('export-status');
let undoStack = [];
let redoStack = [];

function snapshot() {
  return JSON.parse(JSON.stringify({
    layoutId: state.layoutId, gradeId: state.gradeId, sizeId: state.sizeId,
    panels: state.panels, captions: state.captions,
  }));
}

function restore(s) {
  state.layoutId = s.layoutId; state.gradeId = s.gradeId; state.sizeId = s.sizeId;
  state.panels = s.panels; state.captions = s.captions;
}

let suppressHistory = false;

function pushHistory() {
  if (suppressHistory) return;
  undoStack.push(snapshot());
  if (undoStack.length > 60) undoStack.shift();
  redoStack = [];
}

function render() {
  renderPoster(canvas, state);
  buildPhotoStrip(state, render);
  buildChips(state, render);
  buildSizeSwitch(state, render);
  buildPanelEditor(state, render);
  buildPanelSwaps(state, render);
}

function renderLight() {
  renderPoster(canvas, state);
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  const s = undoStack.pop();
  suppressHistory = true;
  restore(s);
  suppressHistory = false;
  render();
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  const s = redoStack.pop();
  suppressHistory = true;
  restore(s);
  suppressHistory = false;
  render();
}

function wireCaptionFields() {
  const map = {
    'cap-title': 'title', 'cap-subtitle': 'subtitle', 'cap-tagline': 'tagline',
    'cap-review': 'review', 'cap-source': 'source', 'cap-edition': 'edition',
    'cap-seal': 'seal', 'cap-release': 'release', 'cap-billing': 'billing',
  };
  for (const [id, key] of Object.entries(map)) {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      state.captions[key] = el.value;
      renderLight();
    });
  }
}

function bindExport() {
  document.getElementById('export-all').addEventListener('click', () => {
    exportAllSizes(state, (msg) => { status.textContent = msg; });
  });
}

async function boot() {
  await ensureFonts();
  wireCaptionFields();
  wirePhotoInput(state, render);
  await wireSamples(state, render);
  document.getElementById('undo').addEventListener('click', undo);
  document.getElementById('redo').addEventListener('click', redo);
  document.getElementById('reset-poster').addEventListener('click', () => {
    pushHistory();
    const fresh = defaultState();
    state.layoutId = fresh.layoutId; state.gradeId = fresh.gradeId; state.sizeId = fresh.sizeId;
    state.captions = fresh.captions; state.panels = fresh.panels;
    render();
  });
  bindExport();

  const query = new URLSearchParams(location.search);
  if (query.get('shot')) {
    await runShot(query, state, render);
  } else {
    render();
  }
}

boot().catch((err) => {
  console.error(err);
  status.textContent = 'Startup error: ' + err.message;
});
