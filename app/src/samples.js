// Original sample imagery. The two bundled JPG samples ship with the starter;
// the eight-person demo cast is drawn here as our own vector-style portraits
// (distinct skin tones, hair, hats and sunglasses) so no real person's photo is
// ever downloaded from the web.

export const SAMPLE_NAMES = ['boulevard', 'pier'];

const CAST = [
  { skin: '#8d5a3b', hair: '#1b1b1f', shirt: '#e63946', hat: null, shades: false, beard: false },
  { skin: '#f0c39a', hair: '#e7b23c', shirt: '#2a9d8f', hat: 'cap', shades: true, beard: false },
  { skin: '#6b3f24', hair: '#0a0a0a', shirt: '#4361ee', hat: null, shades: false, beard: true },
  { skin: '#d9a066', hair: '#5c2e1a', shirt: '#f4a261', hat: 'brim', shades: false, beard: false },
  { skin: '#f5d3b0', hair: '#232323', shirt: '#9b5de5', hat: null, shades: true, beard: false },
  { skin: '#a96a44', hair: '#111', shirt: '#06d6a0', hat: 'cap', shades: true, beard: true },
  { skin: '#e4b184', hair: '#7a1f1f', shirt: '#ff006e', hat: 'brim', shades: false, beard: false },
  { skin: '#7c4a2d', hair: '#c9c9c9', shirt: '#118ab2', hat: null, shades: false, beard: false },
];

function portraitDataUrl(cast, i) {
  const S = 420;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d');

  // Sunset backdrop.
  const bg = ctx.createLinearGradient(0, 0, 0, S);
  bg.addColorStop(0, i % 2 ? '#20113a' : '#2a0f4a');
  bg.addColorStop(0.6, i % 2 ? '#7a1f57' : '#0f5e6b');
  bg.addColorStop(1, i % 2 ? '#ff8c42' : '#7df7d2');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let k = 0; k < 6; k++) {
    ctx.beginPath();
    ctx.arc(S * (0.2 + k * 0.18), S * 0.22, S * (0.05 + k * 0.012), 0, Math.PI * 2);
    ctx.fill();
  }

  // Shoulders and torso.
  ctx.fillStyle = cast.shirt;
  ctx.beginPath();
  ctx.moveTo(S * 0.12, S);
  ctx.quadraticCurveTo(S * 0.3, S * 0.62, S * 0.5, S * 0.62);
  ctx.quadraticCurveTo(S * 0.7, S * 0.62, S * 0.88, S);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.moveTo(S * 0.5, S * 0.62);
  ctx.lineTo(S * 0.88, S);
  ctx.lineTo(S * 0.72, S);
  ctx.quadraticCurveTo(S * 0.62, S * 0.72, S * 0.5, S * 0.72);
  ctx.fill();

  // Neck.
  ctx.fillStyle = cast.skin;
  ctx.fillRect(S * 0.44, S * 0.5, S * 0.12, S * 0.16);

  // Head.
  ctx.beginPath();
  ctx.ellipse(S * 0.5, S * 0.36, S * 0.16, S * 0.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = cast.skin;
  ctx.fill();

  // Ears.
  ctx.beginPath();
  ctx.ellipse(S * 0.34, S * 0.38, S * 0.025, S * 0.05, 0, 0, Math.PI * 2);
  ctx.ellipse(S * 0.66, S * 0.38, S * 0.025, S * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair.
  ctx.fillStyle = cast.hair;
  ctx.beginPath();
  ctx.moveTo(S * 0.32, S * 0.3);
  ctx.quadraticCurveTo(S * 0.5, S * 0.08, S * 0.68, S * 0.3);
  ctx.quadraticCurveTo(S * 0.68, S * 0.24, S * 0.5, S * 0.14);
  ctx.quadraticCurveTo(S * 0.32, S * 0.24, S * 0.32, S * 0.3);
  ctx.fill();
  if (cast.beard) {
    ctx.beginPath();
    ctx.ellipse(S * 0.5, S * 0.42, S * 0.13, S * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cast.skin;
    ctx.beginPath();
    ctx.ellipse(S * 0.5, S * 0.4, S * 0.09, S * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hat.
  if (cast.hat === 'cap') {
    ctx.fillStyle = cast.shirt;
    ctx.beginPath();
    ctx.arc(S * 0.5, S * 0.22, S * 0.15, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(S * 0.34, S * 0.2, S * 0.32, S * 0.06);
  } else if (cast.hat === 'brim') {
    ctx.fillStyle = cast.shirt;
    ctx.beginPath();
    ctx.ellipse(S * 0.5, S * 0.2, S * 0.24, S * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(S * 0.5, S * 0.16, S * 0.16, S * 0.12, 0, Math.PI, 0);
    ctx.fill();
  }

  // Sunglasses or eyes.
  if (cast.shades) {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(S * 0.36, S * 0.35, S * 0.28, S * 0.06);
    ctx.fillRect(S * 0.44, S * 0.33, S * 0.05, S * 0.06);
    ctx.fillRect(S * 0.5, S * 0.33, S * 0.05, S * 0.06);
  } else {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(S * 0.44, S * 0.36, S * 0.018, 0, Math.PI * 2);
    ctx.arc(S * 0.56, S * 0.36, S * 0.018, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b1b1f';
    ctx.beginPath();
    ctx.arc(S * 0.44, S * 0.36, S * 0.009, 0, Math.PI * 2);
    ctx.arc(S * 0.56, S * 0.36, S * 0.009, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth.
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = S * 0.01;
  ctx.beginPath();
  ctx.moveTo(S * 0.46, S * 0.45);
  ctx.quadraticCurveTo(S * 0.5, S * 0.47, S * 0.54, S * 0.45);
  ctx.stroke();

  return c.toDataURL('image/png');
}

export function loadSamplePhoto(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `samples/${name}.jpg`;
  });
}

export function loadVectorCast() {
  const photos = [];
  for (let i = 0; i < CAST.length; i++) {
    const img = new Image();
    img.src = portraitDataUrl(CAST[i], i);
    photos.push(img);
  }
  return photos;
}

// Build the cast data-URL images only when the samples button is pressed. The
// width/height are read after decode so the renderer can draw them at once.
export async function addDemoCast(state) {
  const portraits = loadVectorCast();
  await Promise.all(
    portraits.map((img) => new Promise((res) => {
      img.onload = res;
      img.onerror = res;
    })),
  );
  portraits.forEach((img, i) => {
    state.photos.push({
      id: `cast-${i}`,
      url: img.src,
      name: `Cast ${i + 1}`,
      width: img.naturalWidth,
      height: img.naturalHeight,
      kind: 'vector',
      image: img,
    });
  });
}
