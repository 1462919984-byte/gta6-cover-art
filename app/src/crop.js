// Panel crop math and a small, dependency-free face-aware crop anchor.
//
// A crop is { zoom, panX, panY, flip }. panX/panY are normalised 0..1 positions
// of the source window within the remaining scroll range, so they stay valid no
// matter how much the photo has been zoomed in. The renderer passes the crop to
// drawPanelPhoto, which clips the photo into a rounded panel rectangle, flips it
// when asked, applies the colour-grade wash and finishes with an inner vignette.

export function cropSourceRect(img, targetAspect, crop) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const imgAspect = iw / ih;
  const zoom = Math.max(0.3, crop.zoom || 1);

  let sw, sh;
  if (imgAspect > targetAspect) {
    // Photo is wider than the panel: use its full height, crop the sides.
    sh = ih / zoom;
    sw = sh * targetAspect;
  } else {
    // Photo is taller than the panel: use its full width, crop top and bottom.
    sw = iw / zoom;
    sh = sw / targetAspect;
  }

  const maxX = Math.max(0, iw - sw);
  const maxY = Math.max(0, ih - sh);
  const sx = clamp01(crop.panX ?? 0.5) * maxX;
  const sy = clamp01(crop.panY ?? 0.5) * maxY;
  return { sx, sy, sw, sh };
}

/** The source scroll range (in pixels) for a crop: useful for drag-to-pan. */
export function cropPanBounds(img, targetAspect, crop) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const imgAspect = iw / ih;
  const zoom = Math.max(0.3, crop.zoom || 1);

  let sw, sh;
  if (imgAspect > targetAspect) {
    sh = ih / zoom;
    sw = sh * targetAspect;
  } else {
    sw = iw / zoom;
    sh = sw / targetAspect;
  }
  return { maxX: Math.max(0, iw - sw), maxY: Math.max(0, ih - sh) };
}

export function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/**
 * A lightweight face-anchor heuristic with no external dependencies. The source
 * image is downscaled to a small offscreen canvas, each pixel is scored for
 * skin-tone likelihood (RGB plus YCbCr-style chroma ranges), and edge density
 * is folded in so a high-contrast face beats a flat skin-coloured wall. The
 * grid cell with the best combined score wins, and the anchor is refined to the
 * centroid of the skin pixels inside that cell. The result is cached on the
 * image object so it is only computed once per photo.
 */
const FACE_SCALE = 96;

function skinScore(r, g, b) {
  // RGB rule first: enough red, a warm spread, and red leading blue.
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  let score = 0;
  if (r > 95 && g > 40 && b > 20 && mx - mn > 15 && Math.abs(r - g) > 15 && r > g && r > b) {
    score += 3;
  }
  // YCbCr-style chroma window used by many face detectors.
  const cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
  const cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
  if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) {
    score += 3;
  }
  return score;
}

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function computeAnchor(img) {
  if (!img || !img.naturalWidth || !img.naturalHeight) return null;

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.min(1, FACE_SCALE / Math.max(iw, ih));
  const w = Math.max(2, Math.round(iw * scale));
  const h = Math.max(2, Math.round(ih * scale));

  let canvas, ctx;
  try {
    canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
  } catch {
    return null;
  }

  let data;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    // Tainted canvases (e.g. a cross-origin image) must not break the crop.
    return null;
  }

  // Column count fixed by the image, row count fixed by the image; keep the
  // grid fine enough to find a face but coarse enough to stay cheap.
  const cols = Math.min(w, 12);
  const rows = Math.min(h, 16);
  const colW = w / cols;
  const rowH = h / rows;

  // Skin density per cell and the running centroid sums for skin pixels.
  const cellSkin = new Float32Array(cols * rows);
  const cellEdge = new Float32Array(cols * rows);
  const skinSumX = new Float32Array(cols * rows);
  const skinSumY = new Float32Array(cols * rows);
  const skinCount = new Float32Array(cols * rows);

  const gray = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = luminance(r, g, b);
      gray[y * w + x] = lum;
      const skin = skinScore(r, g, b);
      if (skin > 0) {
        const cx = Math.min(cols - 1, Math.floor(x / colW));
        const cy = Math.min(rows - 1, Math.floor(y / rowH));
        const ci = cy * cols + cx;
        cellSkin[ci] += skin;
        skinSumX[ci] += x;
        skinSumY[ci] += y;
        skinCount[ci] += 1;
      }
    }
  }

  // Edge density: a simple horizontal + vertical gradient magnitude.
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const gx = gray[idx + 1] - gray[idx - 1];
      const gy = gray[idx + w] - gray[idx - w];
      const mag = Math.abs(gx) + Math.abs(gy);
      if (mag > 30) {
        const cx = Math.min(cols - 1, Math.floor(x / colW));
        const cy = Math.min(rows - 1, Math.floor(y / rowH));
        cellEdge[cy * cols + cx] += mag;
      }
    }
  }

  // Score each cell: skin density plus a fraction of edge density. The upper
  // two thirds of the frame are favoured, since faces rarely sit in the very
  // bottom strip of a source photo.
  let best = -1;
  let bestCi = -1;
  for (let cy = 0; cy < rows; cy++) {
    const rowWeight = cy < rows * 0.66 ? 1 : 0.55;
    for (let cx = 0; cx < cols; cx++) {
      const ci = cy * cols + cx;
      const score = (cellSkin[ci] * 1.6 + cellEdge[ci] * 0.04) * rowWeight;
      if (score > best) {
        best = score;
        bestCi = ci;
      }
    }
  }

  if (bestCi < 0 || skinCount[bestCi] < 3 || cellSkin[bestCi] < 8) {
    return null;
  }

  // Refine to the skin centroid inside the winning cell, then back to 0..1.
  const cx = skinSumX[bestCi] / skinCount[bestCi];
  const cy = skinSumY[bestCi] / skinCount[bestCi];
  return { x: clamp01(cx / (w - 1)), y: clamp01(cy / (h - 1)) };
}

/**
 * Returns a normalised {x, y} anchor for the photo, or the upper-third default
 * {x: 0.5, y: 0.34} when no face-like region is found. The result is cached on
 * the image object keyed by the scale so a re-render is cheap.
 */
export function faceAnchorFor(img) {
  if (!img || !img.naturalWidth) return { x: 0.5, y: 0.34 };
  if (!img.__faceAnchor) {
    img.__faceAnchor = computeAnchor(img);
  }
  return img.__faceAnchor || { x: 0.5, y: 0.34 };
}

/**
 * Applies a face anchor to a crop, keeping the user's zoom and flip but moving
 * the pan point to the detected face (or the upper-third fallback).
 */
export function cropWithAnchor(crop, anchor) {
  return { ...crop, panX: anchor.x, panY: anchor.y };
}

/** Draws the cropped, grade-tinted photo into a panel rectangle. */
export function drawPanelPhoto(ctx, img, rect, crop, overlayColors, tilt = 0, flip = false) {
  ctx.save();
  if (tilt) {
    ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.rotate(tilt);
    ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
  }
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, Math.min(rect.w, rect.h) * 0.02);
  ctx.clip();
  ctx.fillStyle = '#1a1026';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

  if (img && img.naturalWidth) {
    const { sx, sy, sw, sh } = cropSourceRect(img, rect.w / rect.h, crop);
    ctx.save();
    ctx.translate(rect.x, rect.y);
    if (flip) {
      ctx.translate(rect.w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, rect.w, rect.h);
    ctx.restore();

    // Colour-grade wash rising from the bottom of the panel.
    const g = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    g.addColorStop(0, overlayColors[0]);
    g.addColorStop(1, overlayColors[1]);
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }

  // Inner vignette for the printed-poster look.
  const v = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = v;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
