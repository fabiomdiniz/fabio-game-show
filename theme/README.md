# Overdrive — a Hallmark theme

A custom (tuned) Hallmark theme extracted from the **Sonic Mania** interface DNA
(structural + colour only — no sprites, logos, or screenshots reproduced).

## Files

- `tokens.css` — the theme. Portable: drop it into any project and reference the
  tokens by name. This is the artifact another AI tool (or a future Hallmark run)
  consumes directly.
- `index.html` — a demo page applying the theme (open in a browser).
- `analyze_ref.py` — the palette/region extractor used to study the reference image.

## The system

| Layer | Value |
| --- | --- |
| Paper | gold sun `oklch(84% 0.16 90)` (light band, warm hue) |
| Paper-2 | cream `oklch(92% 0.10 95)` |
| Ink | deep indigo `oklch(27% 0.20 275)` (the lettering) |
| Accent | sega red `oklch(38% 0.17 26)` (small footprint) |
| Accent-2 | green hill `oklch(48% 0.12 125)` |
| Display | Bricolage Grotesque 800 |
| Body | Geist |
| Outlier | Geist Mono (HUD score/rings/clock register) |
| Treatments | sunburst rays, checkerboard track edge, layered green hills |

**Axes:** light / display-heavy / chromatic-red ~26° (secondary chromatic-green ~125°).

## Provenance

- DNA-source: URL + reference image — `https://interfaceingame.com/games/sonic-mania/`
  (interface taxonomy) plus the user's reference capture, whose palette was
  extracted programmatically (`#efc300` gold · `#2100a5` indigo · `#560005` maroon ·
  `#8a8240`/`#aed794` greens · `#f7e58d` cream · `#472338` plum).
- Tokens are *constructed* (not copied) — the source is a pixel-art game, so there
  is no CSS to extract; colours are the free closest matches in OKLCH. Rhythm is
  judged from a reference pass, not the DOM.
