# VICE VOLTAGE — GTA-style cover art studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/1462919984-byte/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/1462919984-byte/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn a person's photos and a caption into GTA-poster-style cover art, exported as
PNG to share. Original design — no Rockstar logo, wordmark, artwork, character or
font. Photos are read with `FileReader` and drawn locally: they never leave the
device and are never uploaded.

**3 steps** — 1 Add photos → 2 Caption → 3 Export PNG.

- Multi-panel key art: 6–7 photo panels around a big hero close-up, per-panel
  crop/pan/zoom/flip, drag number badges to swap panels.
- 6 layouts (cast mosaic, diagonal strips, six grid, hero + row, triptych, duo)
  × 6 grades (sunset gold, neon night, tropic teal, ultraviolet, retro print,
  mono silver), all re-rendered live.
- Huge striped chrome-gradient title, script subtitle, tagline ribbon, role
  name-tags, 5-star review strip, VOL. badge, gold seal, billing block, barcode
  and COMING SOON line — every caption field editable.
- Export PNG in 1080×1080, 1080×1350 and 1920×1080 with one "Export all 3 PNGs"
  button (canvas.toBlob).
- Sample photos: two free-to-use starter samples plus an 8-person demo cast drawn
  procedurally as original vector-style portraits.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser.
