// Canvas lettering helpers. The striped chrome title, script subtitle, star
// strip, gold seal, barcode and small-caps billing block are all drawn in code
// with the bundled OFL fonts, so the poster never borrows artwork or a
// proprietary typeface.

const FONT_TITLE = '"Anton", sans-serif';
const FONT_SCRIPT = '"Great Vibes", cursive';

export function ensureFonts() {
  return Promise.all([
    document.fonts.load(`700 200px ${FONT_TITLE}`),
    document.fonts.load(`400 200px ${FONT_SCRIPT}`),
  ]).catch(() => {});
}

// Fits text to a maximum width *and* height. The height clamp is the small
// robustness fix here: very long titles used to shrink only until they fit the
// width, which could leave them taller than their block on narrow posters.
function fitFont(ctx, text, family, maxWidth, maxHeight, weight = 700, italic = false) {
  let size = Math.max(8, maxHeight);
  const apply = () => {
    ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`;
  };
  apply();
  while (size > 8 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    apply();
  }
  return Math.min(size, maxHeight);
}

/** Draws the big chrome title with a dark stroke, gradient fill and sheen. */
export function drawChromeTitle(ctx, text, cx, cy, maxWidth, maxHeight, grade) {
  if (!text) return;
  const upper = text.toUpperCase();
  const size = fitFont(ctx, upper, FONT_TITLE, maxWidth, maxHeight, 700);

  const off = document.createElement('canvas');
  off.width = Math.max(1, Math.ceil(maxWidth));
  off.height = Math.max(1, Math.ceil(maxHeight));
  const octx = off.getContext('2d');
  octx.font = `700 ${size}px ${FONT_TITLE}`;
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  octx.fillStyle = '#fff';
  octx.fillText(upper, off.width / 2, off.height / 2);

  // Gradient inside the letter shapes.
  octx.globalCompositeOperation = 'source-atop';
  const grad = octx.createLinearGradient(0, 0, 0, off.height);
  grad.addColorStop(0, grade.chrome[0]);
  grad.addColorStop(0.45, grade.chrome[1]);
  grad.addColorStop(0.62, grade.chrome[2]);
  grad.addColorStop(1, grade.chrome[3]);
  octx.fillStyle = grad;
  octx.fillRect(0, 0, off.width, off.height);

  // Diagonal sheen stripes.
  octx.globalAlpha = 0.5;
  octx.fillStyle = grade.chrome[0];
  const step = Math.max(14, size * 0.16);
  for (let x = -off.height; x < off.width + off.height; x += step) {
    octx.beginPath();
    octx.moveTo(x, 0);
    octx.lineTo(x + off.height * 0.32, 0);
    octx.lineTo(x + off.height * 0.32 - off.height, off.height);
    octx.lineTo(x - off.height, off.height);
    octx.closePath();
    octx.fill();
  }
  octx.globalAlpha = 1;

  // Dark edge behind the letters for readability over busy panels.
  octx.globalCompositeOperation = 'destination-over';
  octx.strokeStyle = 'rgba(10,4,16,0.9)';
  octx.lineWidth = Math.max(4, size * 0.14);
  octx.lineJoin = 'round';
  octx.strokeText(upper, off.width / 2, off.height / 2);

  ctx.save();
  ctx.shadowColor = grade.titleGlow;
  ctx.shadowBlur = size * 0.35;
  ctx.drawImage(off, cx - off.width / 2, cy - off.height / 2);
  ctx.restore();
}

/** Draws the script subtitle beneath the title. */
export function drawScriptSubtitle(ctx, text, cx, cy, maxWidth, size, color, shadow = 'rgba(0,0,0,0.5)') {
  if (!text) return;
  const px = fitFont(ctx, text, FONT_SCRIPT, maxWidth, size, 400, false);
  ctx.save();
  ctx.font = `400 ${px}px ${FONT_SCRIPT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.shadowColor = shadow;
  ctx.shadowBlur = px * 0.2;
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

/** Five gold stars in a row. */
export function drawStars(ctx, x, y, starR, color = '#ffd166') {
  ctx.save();
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, x + i * starR * 2.4, y, starR, color);
  }
  ctx.restore();
}

function drawStar(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,60,0,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

/** Ribbed gold seal with two lines of text. */
export function drawSeal(ctx, cx, cy, r, line1, line2, grade) {
  ctx.save();
  ctx.translate(cx, cy);
  // Ribbed ring.
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = i % 2 ? grade.accent : '#8a5a12';
    ctx.fillRect(r - 3, -r * 0.07, r * 0.3, r * 0.14);
    ctx.restore();
  }
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, grade.chrome[0]);
  g.addColorStop(0.5, grade.accent);
  g.addColorStop(1, '#8a5a12');
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,20,0,0.85)';
  ctx.lineWidth = r * 0.06;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = r * 0.04;
  ctx.stroke();

  ctx.fillStyle = '#241203';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const l1 = fitFont(ctx, line1.toUpperCase(), FONT_TITLE, r * 1.55, r * 0.34, 700);
  ctx.font = `700 ${l1}px ${FONT_TITLE}`;
  ctx.fillText(line1.toUpperCase(), 0, -r * 0.16);
  const l2 = fitFont(ctx, line2.toUpperCase(), 'system-ui, sans-serif', r * 1.6, r * 0.2, 700);
  ctx.font = `700 ${l2}px system-ui, sans-serif`;
  ctx.fillText(line2.toUpperCase(), 0, r * 0.28);
  ctx.restore();
}

/** Right-aligned barcode block. */
export function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - w, y, w, h);
  ctx.fillStyle = '#0a0a0a';
  let cx = x - w + 3;
  const bars = [1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1];
  for (const b of bars) {
    ctx.fillRect(cx, y + 1, b, h - 2);
    cx += b + 1;
  }
  ctx.restore();
}

/** Small-caps billing block, wrapped to a max width and skipping blank words. */
export function drawBillingBlock(ctx, text, cx, y, maxWidth, lineHeight, color) {
  if (!text) return y;
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  ctx.font = `600 ${lineHeight}px system-ui, sans-serif`;
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineHeight * 1.22;
  }
  ctx.restore();
  return y;
}
