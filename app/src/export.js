// PNG export. The poster is re-rendered into an offscreen canvas for each
// requested size, then written out with canvas.toBlob so the exported file is
// exactly what the live preview shows.

import { renderPoster } from './render.js';
import { SIZES } from './state.js';

export function exportAllSizes(state, onProgress) {
  let done = 0;
  const total = SIZES.length;
  SIZES.forEach((size) => {
    renderToDownload(state, size.id, size.w, size.h, () => {
      done += 1;
      onProgress(`Saved vice-voltage-${size.w}x${size.h}.png (${done}/${total})`);
      if (done === total) onProgress(`Exported all ${total} PNGs — share your cover!`);
    });
  });
}

export function exportCurrentSize(state, onProgress) {
  const size = SIZES.find((s) => s.id === state.sizeId) ?? SIZES[0];
  renderToDownload(state, size.id, size.w, size.h, () => {
    onProgress(`Saved vice-voltage-${size.w}x${size.h}.png`);
  });
}

function renderToDownload(state, sizeId, w, h, onDone) {
  const canvas = document.createElement('canvas');
  const snapshot = { ...state, sizeId };
  renderPoster(canvas, snapshot);
  canvas.toBlob((blob) => {
    if (!blob) {
      onDone();
      return;
    }
    downloadBlob(blob, `vice-voltage-${w}x${h}.png`);
    onDone();
  }, 'image/png');
}

function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
