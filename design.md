<!-- Hallmark · studied: yes · DNA-source: url + image · theme: custom (tuned) "Overdrive" -->
# Design — Overdrive (fabio-game-show)

Locked design system. Future Hallmark runs read this file first; pages defer
to it. Amend intentionally — the file is the rule.

## System
- Genre · playful
- Macrostructure · Manifesto → Catalogue (title card → zone/menu grid)
- Theme · custom (vibe: "gold sun, indigo lettering, green hills, red pop")
- Axes · light / display-heavy / chromatic-red ~26° (secondary chromatic-green ~125°)

## Tokens (canonical · `theme/tokens.css` is the source of truth)
```css
:root {
  --color-paper:      oklch(84% 0.160 90);   /* gold sun */
  --color-paper-2:    oklch(92% 0.100 95);   /* cream */
  --color-paper-3:    oklch(78% 0.150 90);   /* deeper gold */
  --color-ink:        oklch(27% 0.200 275);  /* deep indigo — lettering */
  --color-ink-2:      oklch(38% 0.170 275);
  --color-rule:       oklch(70% 0.120 90);
  --color-rule-2:     oklch(76% 0.125 90);
  --color-neutral:    oklch(58% 0.085 95);
  --color-muted:      oklch(47% 0.075 95);
  --color-accent:     oklch(38% 0.170 26);   /* sega red */
  --color-accent-2:   oklch(48% 0.120 125);  /* green hill */
  --color-accent-ink: oklch(97% 0.010 90);   /* cream on red */
  --color-focus:      oklch(32% 0.200 26);

  --color-hill-1: oklch(76% 0.085 125);  /* decorative: light sage */
  --color-hill-2: oklch(58% 0.105 125);  /* decorative: olive */
  --color-hill-3: oklch(32% 0.055 340);  /* decorative: plum band */

  --font-display: "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Geist Mono", ui-monospace, monospace;

  /* 4-pt spacing scale, named: --space-xs … --space-2xl. See theme/tokens.css. */
  /* Type scale, 1.25 (major-third) ratio: --text-xs … --text-display.          */

  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in: cubic-bezier(0.55, 0.06, 0.68, 0.19);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 120ms;  --dur-base: 200ms;  --dur-slow: 420ms;

  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 16px;  --radius-pill: 999px;
}
```

## CTA voice
- Primary · red fill (`--color-accent`) · cream text · radius-sm · chunky padding + inset bevel
- Secondary · ghost/outline in indigo (`--color-ink`), border `--color-rule`, hover → red

## Motion stance
- One orchestrated `drop-in` entrance (the single arcade bounce); transform/opacity only.
- Reduced-motion fallback · ≤150 ms opacity crossfade.

## Provenance
- DNA-source · URL + reference image
  - `https://interfaceingame.com/games/sonic-mania/` — interface taxonomy
  - user reference capture `composer_2026-08-31_10-16-41-953_124884.png` — palette extracted programmatically
  - inspiration: **Sonic Mania** (Sega) — structural + colour DNA only
- Attestation · public reference for the user's own project (fabio-game-show).
- Confidence · colours are *constructed* (extracted from the reference pixels, then set
  as OKLCH closest-matches); fonts are the free closest matches, not the proprietary
  originals. Rhythm judged from a reference pass, not the DOM. **No sprites, logos, or
  screenshots reproduced.**

## Notes (do NOT carry over)
- No blue-cyan / purple-cyan gradient slop.
- No bouncy hover on UI state — the arcade bounce is the single entrance only.
- No fake browser / phone / code-block chrome.
- No invented metrics or statistics; no italic headers.
- No reproduction of Sega/Sonic assets — the DNA is structural only.

## Exports
`theme/tokens.css` (in this project) is the source of truth. For Tailwind v4 `@theme`,
DTCG `tokens.json`, or shadcn/ui CSS variables, ask *"extend design.md with Tailwind
exports"* (or the format you want).
