// Renders the whole poster onto a canvas: the layout's photo panels, role
// name-tags, chrome title, script subtitle, tagline ribbon, review strip, gold
// seal, billing block, barcode and the COMING SOON release line. Everything is
// drawn in code from the user's own photos — no Rockstar assets and no network.
//
// The title block, seal and tagline can be nudged per-layout via optional
// `titleBlock`, `seal` and `tagline` fields on the layout definition; when
// absent they fall back to the centred positions the older layouts expect.

import { cropWithAnchor, drawPanelPhoto, faceAnchorFor, roundRect } from './crop.js';
import {
  drawBarcode, drawBillingBlock, drawChromeTitle, drawScriptSubtitle, drawSeal, drawStars,
} from './lettering.js';
import { findLayout, findGrade, findSize, roleOf } from './state.js';

export function renderPoster(canvas, state) {
  const size = findSize(state.sizeId);
  const layout = findLayout(state.layoutId);
  const grade = findGrade(state.gradeId);
  const cap = state.captions;
  const w = size.w;
  const h = size.h;

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  drawBackground(ctx, w, h, grade);

  // Photo panels.
  layout.panels.forEach((p, i) => {
    if (p.hidden) return;
    const rect = { x: p.x * w, y: p.y * h, w: p.w * w, h: p.h * h };
    const panel = state.panels[i] ?? { photo: 0, crop: {} };
    const img = state.photos[panel.photo]?.image ?? state.photos[panel.photo] ?? null;

    // When face-aware anchoring is on, keep the user's zoom and flip but move
    // the pan point to the face the heuristic found (or the upper-third fallback).
    let crop = panel.crop;
    if (state.faceAware && img) {
      crop = cropWithAnchor(crop, faceAnchorFor(img));
    }

    drawPanelPhoto(ctx, img, rect, crop, grade.overlay, layout.tilt || 0, crop.flip);
    drawPanelFrame(ctx, rect, p.hero, grade);
    drawRoleTag(ctx, rect, roleOf(state, i), p.hero, grade);
  });

  // Tagline ribbon.
  drawTaglineRibbon(ctx, cap.tagline, w, h, grade, layout.tagline);

  // Title block. A layout may offset it; otherwise it sits centred.
  const wide = w >= h;
  const tb = layout.titleBlock || {
    cx: 0.5,
    cy: wide ? 0.46 : 0.34,
    maxW: 0.94,
    maxH: wide ? 0.30 : 0.19,
  };
  const titleX = w * tb.cx;
  const titleY = h * tb.cy;
  const titleW = w * tb.maxW;
  const titleH = h * tb.maxH;
  drawChromeTitle(ctx, cap.title, titleX, titleY, titleW, titleH, grade);
  drawScriptSubtitle(
    ctx,
    cap.subtitle,
    titleX,
    titleY + titleH * 0.62,
    titleW,
    Math.max(14, titleH * (wide ? 0.28 : 0.29)),
    grade.chrome[1],
  );

  // Top review strip.
  drawReviewStrip(ctx, cap, w, h, grade);

  // Gold seal, positioned per layout (centred by default).
  const sealPos = layout.seal || { cx: 0.5, cy: wide ? 0.74 : 0.6 };
  const sealR = Math.min(w, h) * 0.115;
  drawSeal(ctx, w * sealPos.cx, h * sealPos.cy, sealR, cap.seal, 'ORIGINAL COVER ART', grade);

  // Bottom band: billing block, barcode, release line.
  drawBottomBand(ctx, cap, w, h, grade);
}

function drawBackground(ctx, w, h, grade) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, grade.background[0]);
  g.addColorStop(0.45, grade.background[1]);
  g.addColorStop(0.8, grade.background[2]);
  g.addColorStop(1, grade.background[3]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Soft concentric glow rings near the bottom, behind the lettering.
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = grade.accent;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.78, h * 0.16 * i, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPanelFrame(ctx, rect, hero, grade) {
  ctx.save();
  ctx.lineWidth = hero ? Math.max(3, rect.w * 0.018) : Math.max(2, rect.w * 0.02);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, Math.min(rect.w, rect.h) * 0.02);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = ctx.lineWidth * 0.5;
  roundRect(
    ctx,
    rect.x - ctx.lineWidth,
    rect.y - ctx.lineWidth,
    rect.w + ctx.lineWidth * 2,
    rect.h + ctx.lineWidth * 2,
    Math.min(rect.w, rect.h) * 0.02,
  );
  ctx.stroke();
  ctx.restore();
}

function drawRoleTag(ctx, rect, role, hero, grade) {
  const th = Math.max(18, rect.h * (hero ? 0.085 : 0.16));
  const y = rect.y + rect.h - th;
  ctx.save();
  ctx.fillStyle = 'rgba(8,4,16,0.82)';
  roundRect(ctx, rect.x, y, rect.w, th, Math.min(rect.w, th) * 0.18);
  ctx.fill();
  ctx.fillStyle = grade.accent;
  ctx.fillRect(rect.x + rect.w * 0.05, y + th * 0.18, rect.w * 0.05, th * 0.16);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${th * 0.42}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(role, rect.x + rect.w / 2, y + th / 2);
  ctx.restore();
}

function drawTaglineRibbon(ctx, text, w, h, grade, pos) {
  if (!text) return;
  const y = h * (pos?.y ?? (w >= h ? 0.655 : 0.52));
  const size = Math.max(16, Math.min(w, h) * 0.026);
  ctx.save();
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  const tw = ctx.measureText(text.toUpperCase()).width;
  const bw = tw + size * 2.4;
  const bh = size * 1.9;
  const x = w / 2 - bw / 2;
  ctx.translate(x + bw / 2, y + bh / 2);
  ctx.rotate(-0.015);
  ctx.translate(-(x + bw / 2), -(y + bh / 2));
  ctx.fillStyle = grade.strip;
  roundRect(ctx, x, y, bw, bh, bh / 2);
  ctx.fill();
  ctx.strokeStyle = grade.accent;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, bw, bh, bh / 2);
  ctx.stroke();
  ctx.fillStyle = grade.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), x + bw / 2, y + bh / 2 + size * 0.05);
  ctx.restore();
}

function drawReviewStrip(ctx, cap, w, h, grade) {
  const top = h * 0.02;
  const stripH = Math.max(34, h * 0.055);
  ctx.save();
  ctx.fillStyle = grade.strip;
  ctx.fillRect(0, top, w, stripH);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(0, top + stripH - 2, w, 2);

  const starR = stripH * 0.24;
  drawStars(ctx, w * 0.07, top + stripH / 2, starR, '#ffd166');

  const quote = `“${cap.review.toUpperCase()}”`;
  const source = ` — ${cap.source.toUpperCase()}`;
  const maxTextW = w * 0.62;
  let quoteSize = stripH * 0.34;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${quoteSize}px system-ui, sans-serif`;
  while (quoteSize > 10 && ctx.measureText(quote).width > maxTextW) {
    quoteSize -= 1;
    ctx.font = `700 ${quoteSize}px system-ui, sans-serif`;
  }
  ctx.fillText(quote, w * 0.19, top + stripH / 2);
  ctx.fillStyle = grade.accent;
  ctx.font = `600 ${quoteSize * 0.8}px system-ui, sans-serif`;
  ctx.fillText(source, w * 0.19 + ctx.measureText(quote).width + 10, top + stripH / 2 + 1);

  // VOL badge.
  const badgeW = w * 0.09;
  const badgeX = w * 0.9;
  ctx.fillStyle = grade.accent;
  roundRect(ctx, badgeX, top + stripH * 0.16, badgeW, stripH * 0.68, 6);
  ctx.fill();
  ctx.fillStyle = '#241203';
  ctx.font = `700 ${stripH * 0.32}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(cap.edition.toUpperCase(), badgeX + badgeW / 2, top + stripH / 2);
  ctx.restore();
}

function drawBottomBand(ctx, cap, w, h, grade) {
  const bandH = h * (w >= h ? 0.17 : 0.15);
  const y = h - bandH;
  ctx.save();
  ctx.fillStyle = grade.strip;
  ctx.fillRect(0, y, w, bandH);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(0, y, w, 2);

  const billingY = drawBillingBlock(
    ctx,
    cap.billing,
    w / 2,
    y + bandH * 0.18,
    w * 0.62,
    Math.max(11, bandH * 0.13),
    grade.ink,
  );

  // Release line.
  ctx.fillStyle = grade.accent;
  ctx.font = `700 ${bandH * 0.24}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(cap.release.toUpperCase(), w / 2, billingY + bandH * 0.08);

  // Barcode bottom-right.
  drawBarcode(ctx, w - 12, y + bandH * 0.14, Math.min(w * 0.16, 170), bandH * 0.5);
  ctx.restore();
}
