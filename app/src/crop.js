// Panel crop math: turns a photo plus {zoom, panX, panY, flip} into the source
// rectangle to draw inside a panel. The default anchor (panY 0.34) keeps the
// crop near the upper third where faces usually are.

export function cropSourceRect(img, targetAspect, crop) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const imgAspect = iw / ih;
  const zoom = Math.max(0.3, crop.zoom || 1);

  let sw, sh;
  if (imgAspect > targetAspect) {
    // image wider than target: full height, crop width
    sh = ih / zoom;
    sw = sh * targetAspect;
  } else {
    sw = iw / zoom;
    sh = sw / targetAspect;
  }
  const maxX = iw - sw;
  const maxY = ih - sh;
  const sx = Math.min(Math.max(crop.panX || 0.5, 0), 1) * Math.max(0, maxX);
  const sy = Math.min(Math.max(crop.panY || 0.5, 0), 1) * Math.max(0, maxY);
  return { sx, sy, sw, sh };
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

    // Colour grade overlay: warm/cool wash rising from the bottom
    const g = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    g.addColorStop(0, overlayColors[0]);
    g.addColorStop(1, overlayColors[1]);
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }

  // Inner vignette for the printed-poster look
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
