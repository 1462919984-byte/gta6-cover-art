// PNG export: renders the poster into an offscreen canvas for each of the
// three required sizes, then hands the user canvas.toBlob downloads.

import { renderPoster } from './render.js';
import { SIZES } from './state.js';

export function exportAllSizes(state, onProgress) {
  let done = 0;
  const total = SIZES.length;
  SIZES.forEach((size) => {
    const canvas = document.createElement('canvas');
    const snapshot = { ...state, sizeId: size.id };
    renderPoster(canvas, snapshot);
    canvas.toBlob((blob) => {
      if (!blob) { onProgress(`Could not write ${size.w}×${size.h}`); return; }
      downloadBlob(blob, `vice-voltage-${size.w}x${size.h}.png`);
      done += 1;
      onProgress(`Saved vice-voltage-${size.w}x${size.h}.png (${done}/${total})`);
      if (done === total) onProgress(`Exported all ${total} PNGs — share your cover!`);
    }, 'image/png');
  });
}

export function exportCurrentSize(state, onProgress) {
  const size = SIZES.find((s) => s.id === state.sizeId);
  const canvas = document.createElement('canvas');
  renderPoster(canvas, state);
  canvas.toBlob((blob) => {
    if (!blob) { onProgress('Export failed'); return; }
    downloadBlob(blob, `vice-voltage-${size.w}x${size.h}.png`);
    onProgress(`Saved vice-voltage-${size.w}x${size.h}.png`);
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
