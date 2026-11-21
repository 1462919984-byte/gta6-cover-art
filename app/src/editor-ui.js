// Editor UI: photo strip, layout/grade chips, size switcher, per-panel controls,
// drag-to-swap number badges, and undo/redo. It mutates the state object and
// asks main.js to re-render after every change.

import { LAYOUTS } from './layouts.js';
import { GRADES } from './grades.js';
import { SIZES, findLayout, findGrade } from './state.js';
import { addDemoCast, SAMPLE_NAMES } from './samples.js';
import { loadImage } from './main.js';

export function buildPhotoStrip(state, render) {
  const strip = document.getElementById('photo-strip');
  strip.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.title = photo.name;
    card.innerHTML = `
      <img src="${photo.url}" alt="${photo.name}">
      <span class="photo-num">${i + 1}</span>
      <button class="photo-remove" data-i="${i}" title="Remove">×</button>
    `;
    card.addEventListener('click', () => {
      // Clicking a photo assigns it to the selected panel
      const panel = state.panels[state.selectedPanel];
      if (panel) { panel.photo = i; render(); }
    });
    strip.appendChild(card);
  });
  strip.querySelectorAll('.photo-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const i = Number(btn.dataset.i);
      state.photos.splice(i, 1);
      // Re-point panels so they still resolve to a valid photo
      state.panels.forEach((p) => { if (p.photo > i) p.photo -= 1; if (p.photo >= state.photos.length) p.photo = 0; });
      render();
    });
  });
}

export function buildChips(state, render) {
  const layoutList = document.getElementById('layout-list');
  layoutList.innerHTML = '';
  LAYOUTS.forEach((l) => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (l.id === state.layoutId ? ' active' : '');
    chip.textContent = l.name;
    chip.addEventListener('click', () => { state.layoutId = l.id; render(); });
    layoutList.appendChild(chip);
  });

  const gradeList = document.getElementById('grade-list');
  gradeList.innerHTML = '';
  GRADES.forEach((g) => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (g.id === state.gradeId ? ' active' : '');
    chip.textContent = g.name;
    chip.addEventListener('click', () => { state.gradeId = g.id; render(); });
    gradeList.appendChild(chip);
  });
}

export function buildSizeSwitch(state, render) {
  const sw = document.getElementById('size-switch');
  sw.innerHTML = '';
  SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.className = s.id === state.sizeId ? 'active' : '';
    b.textContent = s.label;
    b.dataset.size = s.id;
    b.addEventListener('click', () => { state.sizeId = s.id; render(); });
    sw.appendChild(b);
  });
}

export function buildPanelEditor(state, render) {
  const wrap = document.getElementById('panel-editor');
  const layout = findLayout(state.layoutId);
  wrap.innerHTML = '';
  layout.panels.forEach((p, i) => {
    if (p.hidden) return;
    const panel = state.panels[i];
    const ctrl = document.createElement('div');
    ctrl.className = 'panel-ctrl';
    ctrl.innerHTML = `
      <h3>${i === 0 ? '★ HERO' : 'PANEL ' + (i + 1)}</h3>
      <select data-role="photo">
        ${state.photos.map((ph, pi) => `<option value="${pi}" ${panel.photo === pi ? 'selected' : ''}>${ph.name || ('Photo ' + (pi + 1))}</option>`).join('')}
      </select>
      <div class="slider-row"><span>Zoom</span><input type="range" min="0.5" max="3" step="0.01" value="${panel.crop.zoom}"></div>
      <div class="slider-row"><span>Pan</span><input type="range" min="0" max="1" step="0.01" value="${panel.crop.panX}" data-role="panX"></div>
      <div class="slider-row"><span>Up/down</span><input type="range" min="0" max="1" step="0.01" value="${panel.crop.panY}" data-role="panY"></div>
      <div class="mini-btns">
        <button data-role="flip">Flip</button>
        <button data-role="reset">Reset</button>
        <button data-role="auto">Face zone</button>
      </div>
    `;
    ctrl.querySelector('[data-role=photo]').addEventListener('change', (e) => {
      panel.photo = Number(e.target.value); render();
    });
    ctrl.querySelector('input[type=range]').addEventListener('input', (e) => {
      panel.crop.zoom = Number(e.target.value); render();
    });
    ctrl.querySelector('[data-role=panX]').addEventListener('input', (e) => {
      panel.crop.panX = Number(e.target.value); render();
    });
    ctrl.querySelector('[data-role=panY]').addEventListener('input', (e) => {
      panel.crop.panY = Number(e.target.value); render();
    });
    ctrl.querySelector('[data-role=flip]').addEventListener('click', () => {
      panel.crop.flip = !panel.crop.flip; render();
    });
    ctrl.querySelector('[data-role=reset]').addEventListener('click', () => {
      panel.crop = { zoom: 1.15, panX: 0.5, panY: 0.34, flip: false }; render();
    });
    ctrl.querySelector('[data-role=auto]').addEventListener('click', () => {
      panel.crop.panY = 0.34; panel.crop.zoom = 1.15; render();
    });
    wrap.appendChild(ctrl);
  });
}

export function buildPanelSwaps(state, render) {
  const wrap = document.getElementById('panel-swap');
  const layout = findLayout(state.layoutId);
  wrap.innerHTML = '';
  let dragFrom = null;
  layout.panels.forEach((p, i) => {
    if (p.hidden) return;
    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.draggable = true;
    badge.innerHTML = `<b>${i + 1}</b> ${i === 0 ? 'HERO' : ''}`;
    badge.addEventListener('dragstart', () => { dragFrom = i; badge.classList.add('dragging'); });
    badge.addEventListener('dragend', () => { dragFrom = null; badge.classList.remove('dragging'); });
    badge.addEventListener('dragover', (e) => { e.preventDefault(); badge.classList.add('drag-over'); });
    badge.addEventListener('dragleave', () => badge.classList.remove('drag-over'));
    badge.addEventListener('drop', (e) => {
      e.preventDefault();
      badge.classList.remove('drag-over');
      if (dragFrom !== null && dragFrom !== i) {
        const a = state.panels[dragFrom];
        state.panels[dragFrom] = state.panels[i];
        state.panels[i] = a;
        render();
      }
    });
    wrap.appendChild(badge);
  });
}

export function wirePhotoInput(state, render) {
  const input = document.getElementById('photo-input');
  input.addEventListener('change', async () => {
    const files = Array.from(input.files || []);
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      state.photos.push({
        id: `upload-${Date.now()}-${state.photos.length}`,
        url, name: file.name, width: img.naturalWidth, height: img.naturalHeight, kind: 'upload', image: img,
      });
      img.name = file.name;
    }
    input.value = '';
    render();
  });
}

export async function wireSamples(state, render) {
  const btn = document.getElementById('try-samples');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    for (const name of SAMPLE_NAMES) {
      const img = await loadImage(`samples/${name}.jpg`);
      state.photos.push({ id: `sample-${name}`, url: `samples/${name}.jpg`, name, width: img.naturalWidth, height: img.naturalHeight, kind: 'sample', image: img });
    }
    await addDemoCast(state);
    state.panels.forEach((panel, i) => { panel.photo = Math.min(i, state.photos.length - 1); });
    btn.disabled = false;
    render();
  });
}
